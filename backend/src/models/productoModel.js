const pool = require('../config/db');

const productoModel = {
  async getAll() {
    const [rows] = await pool.query(`
      SELECT p.*,
             c.nombre AS categoria_nombre,
             c.estado AS categoria_estado,
             pr.nombre AS proveedor_nombre,
             pr.telefono AS proveedor_telefono
      FROM productos p
      JOIN categorias c ON p.id_categoria = c.id_categoria
      JOIN proveedores pr ON p.id_proveedor = pr.id_proveedor
      ORDER BY p.nombre ASC
    `);
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query(`
      SELECT p.*,
             c.nombre AS categoria_nombre,
             pr.nombre AS proveedor_nombre
      FROM productos p
      JOIN categorias c ON p.id_categoria = c.id_categoria
      JOIN proveedores pr ON p.id_proveedor = pr.id_proveedor
      WHERE p.id_producto = ?
    `, [id]);
    return rows[0] || null;
  },

  async create({ id_categoria, id_proveedor, nombre, descripcion, precio = 0, stock = 0 }) {
    const [result] = await pool.query(
      `INSERT INTO productos (id_categoria, id_proveedor, nombre, descripcion, precio, stock)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id_categoria,
        id_proveedor,
        nombre.trim(),
        descripcion ? descripcion.trim() : null,
        Number(precio) || 0,
        parseInt(stock, 10) || 0
      ]
    );
    return this.getById(result.insertId);
  },

  async update(id, { id_categoria, id_proveedor, nombre, descripcion, precio, stock }) {
    await pool.query(
      `UPDATE productos
       SET id_categoria = ?, id_proveedor = ?, nombre = ?, descripcion = ?, precio = ?, stock = ?
       WHERE id_producto = ?`,
      [
        id_categoria,
        id_proveedor,
        nombre.trim(),
        descripcion ? descripcion.trim() : null,
        Number(precio) || 0,
        parseInt(stock, 10) || 0,
        id
      ]
    );
    return this.getById(id);
  },

  async countAssociatedDetails(id) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS count FROM detalle_movimientos WHERE id_producto = ?',
      [id]
    );
    return rows[0].count;
  },

  async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM productos WHERE id_producto = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
};

module.exports = productoModel;

