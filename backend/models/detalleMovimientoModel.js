const pool = require('../config/db');

function calculateStockDelta(tipo, cantidad) {
  const cant = Number(cantidad);
  if (tipo === 'entrada') return Math.abs(cant);
  if (tipo === 'salida') return -Math.abs(cant);
  if (tipo === 'ajuste') return cant;
  return 0;
}

const detalleMovimientoModel = {
  async getAll({ id_movimiento, id_producto } = {}) {
    let query = `
      SELECT d.*,
             m.fecha AS movimiento_fecha,
             m.tipo AS movimiento_tipo,
             m.observacion AS movimiento_observacion,
             m.id_cliente,
             cl.nombre AS cliente_nombre,
             cl.tipo_cliente,
             p.nombre AS producto_nombre,
             p.precio AS producto_precio,
             p.stock AS producto_stock_actual,
             c.nombre AS categoria_nombre,
             pr.nombre AS proveedor_nombre
      FROM detalle_movimientos d
      JOIN movimientos m ON d.id_movimiento = m.id_movimiento
      LEFT JOIN clientes cl ON m.id_cliente = cl.id_cliente
      JOIN productos p ON d.id_producto = p.id_producto
      JOIN categorias c ON p.id_categoria = c.id_categoria
      JOIN proveedores pr ON p.id_proveedor = pr.id_proveedor
      WHERE 1=1
    `;
    const params = [];

    if (id_movimiento) {
      query += ` AND d.id_movimiento = ?`;
      params.push(Number(id_movimiento));
    }

    if (id_producto) {
      query += ` AND d.id_producto = ?`;
      params.push(Number(id_producto));
    }

    query += ` ORDER BY d.id_detalle DESC`;

    const [rows] = await pool.query(query, params);
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query(`
      SELECT d.*,
             m.fecha AS movimiento_fecha,
             m.tipo AS movimiento_tipo,
             m.observacion AS movimiento_observacion,
             m.id_cliente,
             cl.nombre AS cliente_nombre,
             p.nombre AS producto_nombre,
             p.precio AS producto_precio,
             p.stock AS producto_stock_actual,
             c.nombre AS categoria_nombre,
             pr.nombre AS proveedor_nombre
      FROM detalle_movimientos d
      JOIN movimientos m ON d.id_movimiento = m.id_movimiento
      LEFT JOIN clientes cl ON m.id_cliente = cl.id_cliente
      JOIN productos p ON d.id_producto = p.id_producto
      JOIN categorias c ON p.id_categoria = c.id_categoria
      JOIN proveedores pr ON p.id_proveedor = pr.id_proveedor
      WHERE d.id_detalle = ?
    `, [id]);
    return rows[0] || null;
  },

  async create({ id_movimiento, id_producto, cantidad }) {
    const cant = Number(cantidad);
    const idProd = Number(id_producto);
    const idMov = Number(id_movimiento);

    if (!idMov || !idProd || isNaN(cant) || cant === 0) {
      throw new Error('Debe especificar un movimiento, un producto y una cantidad distinta de cero.');
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [movRows] = await connection.query(
        'SELECT tipo FROM movimientos WHERE id_movimiento = ? FOR UPDATE',
        [idMov]
      );
      if (!movRows.length) {
        throw new Error(`El movimiento con ID ${idMov} no existe.`);
      }
      const tipo = movRows[0].tipo;

      const [prodRows] = await connection.query(
        'SELECT id_producto, nombre, stock FROM productos WHERE id_producto = ? FOR UPDATE',
        [idProd]
      );
      if (!prodRows.length) {
        throw new Error(`El producto con ID ${idProd} no existe.`);
      }
      const prod = prodRows[0];

      const delta = calculateStockDelta(tipo, cant);
      const nuevoStock = prod.stock + delta;

      if (nuevoStock < 0) {
        throw new Error(
          `Stock insuficiente para "${prod.nombre}". Stock actual: ${prod.stock}, modificación requerida: ${delta}.`
        );
      }

      const [result] = await connection.query(
        'INSERT INTO detalle_movimientos (id_movimiento, id_producto, cantidad) VALUES (?, ?, ?)',
        [idMov, idProd, cant]
      );

      await connection.query(
        'UPDATE productos SET stock = ? WHERE id_producto = ?',
        [nuevoStock, idProd]
      );

      await connection.commit();
      return this.getById(result.insertId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async update(id, { id_producto, cantidad }) {
    const newCant = Number(cantidad);
    const newProdId = Number(id_producto);

    if (!newProdId || isNaN(newCant) || newCant === 0) {
      throw new Error('Debe especificar un producto y una cantidad válida.');
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [detRows] = await connection.query(
        'SELECT * FROM detalle_movimientos WHERE id_detalle = ? FOR UPDATE',
        [id]
      );
      if (!detRows.length) {
        throw new Error(`El detalle con ID ${id} no existe.`);
      }
      const oldDet = detRows[0];

      const [movRows] = await connection.query(
        'SELECT tipo FROM movimientos WHERE id_movimiento = ? FOR UPDATE',
        [oldDet.id_movimiento]
      );
      const tipo = movRows[0].tipo;

      const revertDelta = -calculateStockDelta(tipo, oldDet.cantidad);
      const newDelta = calculateStockDelta(tipo, newCant);

      if (oldDet.id_producto === newProdId) {
        const [prodRows] = await connection.query(
          'SELECT stock, nombre FROM productos WHERE id_producto = ? FOR UPDATE',
          [newProdId]
        );
        const prod = prodRows[0];
        const netDelta = revertDelta + newDelta;
        const finalStock = prod.stock + netDelta;

        if (finalStock < 0) {
          throw new Error(`Stock insuficiente para "${prod.nombre}". Stock final resultante: ${finalStock}.`);
        }

        await connection.query('UPDATE productos SET stock = ? WHERE id_producto = ?', [finalStock, newProdId]);
      } else {
        const [oldProdRows] = await connection.query(
          'SELECT stock, nombre FROM productos WHERE id_producto = ? FOR UPDATE',
          [oldDet.id_producto]
        );
        const oldProd = oldProdRows[0];
        const oldProdFinalStock = oldProd.stock + revertDelta;
        if (oldProdFinalStock < 0) {
          throw new Error(`Revertir este detalle dejaría el producto "${oldProd.nombre}" con stock negativo.`);
        }
        await connection.query('UPDATE productos SET stock = ? WHERE id_producto = ?', [oldProdFinalStock, oldDet.id_producto]);

        const [newProdRows] = await connection.query(
          'SELECT stock, nombre FROM productos WHERE id_producto = ? FOR UPDATE',
          [newProdId]
        );
        const newProd = newProdRows[0];
        const newProdFinalStock = newProd.stock + newDelta;
        if (newProdFinalStock < 0) {
          throw new Error(`Stock insuficiente para el nuevo producto "${newProd.nombre}". Stock actual: ${newProd.stock}.`);
        }
        await connection.query('UPDATE productos SET stock = ? WHERE id_producto = ?', [newProdFinalStock, newProdId]);
      }

      await connection.query(
        'UPDATE detalle_movimientos SET id_producto = ?, cantidad = ? WHERE id_detalle = ?',
        [newProdId, newCant, id]
      );

      await connection.commit();
      return this.getById(id);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async delete(id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [detRows] = await connection.query(
        'SELECT * FROM detalle_movimientos WHERE id_detalle = ? FOR UPDATE',
        [id]
      );
      if (!detRows.length) {
        throw new Error(`El detalle con ID ${id} no existe.`);
      }
      const det = detRows[0];

      const [countRows] = await connection.query(
        'SELECT COUNT(*) as count FROM detalle_movimientos WHERE id_movimiento = ?',
        [det.id_movimiento]
      );
      if (countRows[0].count <= 1) {
        throw new Error('Un movimiento debe conservar al menos un detalle. Para eliminarlo completamente, elimine el movimiento.');
      }

      const [movRows] = await connection.query(
        'SELECT tipo FROM movimientos WHERE id_movimiento = ? FOR UPDATE',
        [det.id_movimiento]
      );
      const tipo = movRows[0].tipo;

      const revertDelta = -calculateStockDelta(tipo, det.cantidad);
      const [prodRows] = await connection.query(
        'SELECT stock, nombre FROM productos WHERE id_producto = ? FOR UPDATE',
        [det.id_producto]
      );
      const prod = prodRows[0];
      const finalStock = prod.stock + revertDelta;

      if (finalStock < 0) {
        throw new Error(`No se puede eliminar el detalle porque dejaría el stock de "${prod.nombre}" en negativo.`);
      }

      await connection.query('UPDATE productos SET stock = ? WHERE id_producto = ?', [finalStock, det.id_producto]);
      const [delResult] = await connection.query('DELETE FROM detalle_movimientos WHERE id_detalle = ?', [id]);

      await connection.commit();
      return delResult.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};

module.exports = detalleMovimientoModel;

