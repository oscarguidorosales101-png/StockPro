const pool = require('../config/db');

function calculateStockDelta(tipo, cantidad) {
  const cant = Number(cantidad);
  if (tipo === 'entrada') return Math.abs(cant);
  if (tipo === 'salida') return -Math.abs(cant);
  if (tipo === 'ajuste') return cant;
  return 0;
}

const movimientoModel = {
  async getAll({ tipo, id_cliente, fecha_desde, fecha_hasta } = {}) {
    let query = `
      SELECT m.*,
             cl.nombre AS cliente_nombre,
             cl.tipo_cliente,
             cl.identificacion AS cliente_identificacion,
             COUNT(d.id_detalle) AS total_items,
             COALESCE(SUM(ABS(d.cantidad)), 0) AS total_unidades
      FROM movimientos m
      LEFT JOIN clientes cl ON m.id_cliente = cl.id_cliente
      LEFT JOIN detalle_movimientos d ON m.id_movimiento = d.id_movimiento
      WHERE 1=1
    `;
    const params = [];

    if (tipo && tipo !== 'todos') {
      query += ` AND m.tipo = ?`;
      params.push(tipo);
    }

    if (id_cliente && id_cliente !== 'todos') {
      if (id_cliente === 'sin_cliente') {
        query += ` AND m.id_cliente IS NULL`;
      } else {
        query += ` AND m.id_cliente = ?`;
        params.push(Number(id_cliente));
      }
    }

    if (fecha_desde) {
      query += ` AND m.fecha >= ?`;
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ` AND m.fecha <= ?`;
      params.push(fecha_hasta);
    }

    query += `
      GROUP BY m.id_movimiento
      ORDER BY m.fecha DESC, m.id_movimiento DESC
    `;

    const [rows] = await pool.query(query, params);
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query(`
      SELECT m.*,
             cl.nombre AS cliente_nombre,
             cl.tipo_cliente,
             cl.identificacion AS cliente_identificacion,
             cl.telefono AS cliente_telefono,
             cl.correo AS cliente_correo
      FROM movimientos m
      LEFT JOIN clientes cl ON m.id_cliente = cl.id_cliente
      WHERE m.id_movimiento = ?
    `, [id]);

    if (!rows.length) return null;

    const movimiento = rows[0];

    const [detalles] = await pool.query(`
      SELECT d.*,
             p.nombre AS producto_nombre,
             p.descripcion AS producto_descripcion,
             p.precio AS producto_precio,
             p.stock AS producto_stock_actual,
             c.nombre AS categoria_nombre,
             pr.nombre AS proveedor_nombre
      FROM detalle_movimientos d
      JOIN productos p ON d.id_producto = p.id_producto
      JOIN categorias c ON p.id_categoria = c.id_categoria
      JOIN proveedores pr ON p.id_proveedor = pr.id_proveedor
      WHERE d.id_movimiento = ?
      ORDER BY d.id_detalle ASC
    `, [id]);

    movimiento.detalles = detalles;
    return movimiento;
  },

  async createWithDetails({ id_cliente, fecha, tipo, observacion, detalles }) {
    if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
      throw new Error('El movimiento debe incluir al menos un producto en el detalle.');
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const deltasPorProducto = {};
      for (const item of detalles) {
        const idProd = Number(item.id_producto);
        const cant = Number(item.cantidad);
        if (!idProd || isNaN(cant) || cant === 0) {
          throw new Error('Cada detalle debe contener un producto válido y una cantidad distinta de cero.');
        }
        const delta = calculateStockDelta(tipo, cant);
        deltasPorProducto[idProd] = (deltasPorProducto[idProd] || 0) + delta;
      }

      const productIds = Object.keys(deltasPorProducto).map(Number);
      const [productos] = await connection.query(
        `SELECT id_producto, nombre, stock FROM productos WHERE id_producto IN (?) FOR UPDATE`,
        [productIds]
      );

      const productosMap = {};
      productos.forEach(p => { productosMap[p.id_producto] = p; });

      for (const idProd of productIds) {
        const prod = productosMap[idProd];
        if (!prod) {
          throw new Error(`El producto con ID ${idProd} no existe.`);
        }
        const delta = deltasPorProducto[idProd];
        const nuevoStock = prod.stock + delta;

        if (nuevoStock < 0) {
          throw new Error(
            `Stock insuficiente para "${prod.nombre}". Stock disponible: ${prod.stock}, modificación requerida: ${delta}.`
          );
        }
      }

      const fechaMovimiento = fecha ? new Date(fecha) : new Date();
      const [movResult] = await connection.query(
        `INSERT INTO movimientos (id_cliente, fecha, tipo, observacion)
         VALUES (?, ?, ?, ?)`,
        [
          id_cliente ? Number(id_cliente) : null,
          fechaMovimiento,
          tipo,
          observacion ? observacion.trim() : null
        ]
      );

      const idMovimiento = movResult.insertId;

      for (const item of detalles) {
        const idProd = Number(item.id_producto);
        const cant = Number(item.cantidad);

        await connection.query(
          `INSERT INTO detalle_movimientos (id_movimiento, id_producto, cantidad)
           VALUES (?, ?, ?)`,
          [idMovimiento, idProd, cant]
        );
      }

      for (const idProd of productIds) {
        const delta = deltasPorProducto[idProd];
        await connection.query(
          `UPDATE productos SET stock = stock + ? WHERE id_producto = ?`,
          [delta, idProd]
        );
      }

      await connection.commit();
      return this.getById(idMovimiento);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async updateWithDetails(id, { id_cliente, fecha, tipo, observacion, detalles }) {
    if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
      throw new Error('El movimiento debe incluir al menos un detalle de producto.');
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [existingRows] = await connection.query(
        'SELECT * FROM movimientos WHERE id_movimiento = ? FOR UPDATE',
        [id]
      );
      if (!existingRows.length) {
        throw new Error(`El movimiento con ID ${id} no existe.`);
      }
      const oldMov = existingRows[0];

      const [oldDetails] = await connection.query(
        'SELECT * FROM detalle_movimientos WHERE id_movimiento = ?',
        [id]
      );

      const stockDeltas = {};
      for (const oldDet of oldDetails) {
        const idProd = oldDet.id_producto;
        const revertDelta = -calculateStockDelta(oldMov.tipo, oldDet.cantidad);
        stockDeltas[idProd] = (stockDeltas[idProd] || 0) + revertDelta;
      }

      for (const item of detalles) {
        const idProd = Number(item.id_producto);
        const cant = Number(item.cantidad);
        if (!idProd || isNaN(cant) || cant === 0) {
          throw new Error('Cada detalle debe contener un producto válido y una cantidad distinta de cero.');
        }
        const newDelta = calculateStockDelta(tipo, cant);
        stockDeltas[idProd] = (stockDeltas[idProd] || 0) + newDelta;
      }

      const allProductIds = Object.keys(stockDeltas).map(Number);
      if (allProductIds.length > 0) {
        const [productos] = await connection.query(
          `SELECT id_producto, nombre, stock FROM productos WHERE id_producto IN (?) FOR UPDATE`,
          [allProductIds]
        );

        const productosMap = {};
        productos.forEach(p => { productosMap[p.id_producto] = p; });

        for (const idProd of allProductIds) {
          const prod = productosMap[idProd];
          if (!prod) {
            throw new Error(`El producto con ID ${idProd} no existe.`);
          }
          const delta = stockDeltas[idProd];
          const nuevoStock = prod.stock + delta;

          if (nuevoStock < 0) {
            throw new Error(
              `La edición del movimiento dejaría el stock en negativo para "${prod.nombre}". Stock actual: ${prod.stock}, variación resultante: ${delta}.`
            );
          }
        }
      }

      await connection.query('DELETE FROM detalle_movimientos WHERE id_movimiento = ?', [id]);

      for (const item of detalles) {
        await connection.query(
          `INSERT INTO detalle_movimientos (id_movimiento, id_producto, cantidad)
           VALUES (?, ?, ?)`,
          [id, Number(item.id_producto), Number(item.cantidad)]
        );
      }

      for (const idProd of allProductIds) {
        const delta = stockDeltas[idProd];
        if (delta !== 0) {
          await connection.query(
            `UPDATE productos SET stock = stock + ? WHERE id_producto = ?`,
            [delta, idProd]
          );
        }
      }

      await connection.query(
        `UPDATE movimientos
         SET id_cliente = ?, fecha = ?, tipo = ?, observacion = ?
         WHERE id_movimiento = ?`,
        [
          id_cliente ? Number(id_cliente) : null,
          fecha ? new Date(fecha) : oldMov.fecha,
          tipo,
          observacion ? observacion.trim() : null,
          id
        ]
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

  async deleteWithDetails(id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [movRows] = await connection.query(
        'SELECT * FROM movimientos WHERE id_movimiento = ? FOR UPDATE',
        [id]
      );
      if (!movRows.length) {
        throw new Error(`El movimiento con ID ${id} no existe.`);
      }
      const mov = movRows[0];

      const [detalles] = await connection.query(
        'SELECT * FROM detalle_movimientos WHERE id_movimiento = ?',
        [id]
      );

      const revertDeltas = {};
      for (const det of detalles) {
        const idProd = det.id_producto;
        const revertDelta = -calculateStockDelta(mov.tipo, det.cantidad);
        revertDeltas[idProd] = (revertDeltas[idProd] || 0) + revertDelta;
      }

      const productIds = Object.keys(revertDeltas).map(Number);
      if (productIds.length > 0) {
        const [productos] = await connection.query(
          `SELECT id_producto, nombre, stock FROM productos WHERE id_producto IN (?) FOR UPDATE`,
          [productIds]
        );

        const productosMap = {};
        productos.forEach(p => { productosMap[p.id_producto] = p; });

        for (const idProd of productIds) {
          const prod = productosMap[idProd];
          if (!prod) continue;
          const delta = revertDeltas[idProd];
          const nuevoStock = prod.stock + delta;

          if (nuevoStock < 0) {
            throw new Error(
              `No se puede eliminar el movimiento porque el stock de "${prod.nombre}" quedaría en negativo (${nuevoStock}).`
            );
          }
        }

        for (const idProd of productIds) {
          const delta = revertDeltas[idProd];
          if (delta !== 0) {
            await connection.query(
              `UPDATE productos SET stock = stock + ? WHERE id_producto = ?`,
              [delta, idProd]
            );
          }
        }
      }

      await connection.query('DELETE FROM detalle_movimientos WHERE id_movimiento = ?', [id]);
      const [delResult] = await connection.query('DELETE FROM movimientos WHERE id_movimiento = ?', [id]);

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

module.exports = movimientoModel;

