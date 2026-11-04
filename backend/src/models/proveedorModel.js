const pool = require('../config/db');

const proveedorModel = {
  async getAll() {
    const [rows] = await pool.query(`
      SELECT pr.*, COUNT(p.id_producto) AS total_productos
      FROM proveedores pr
      LEFT JOIN productos p ON pr.id_proveedor = p.id_proveedor
      GROUP BY pr.id_proveedor
      ORDER BY pr.nombre ASC
    `);
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM proveedores WHERE id_proveedor = ?',
      [id]
    );
    return rows[0] || null;
  },

  async create({ nombre, telefono, correo, direccion }) {
    const [result] = await pool.query(
      'INSERT INTO proveedores (nombre, telefono, correo, direccion) VALUES (?, ?, ?, ?)',
      [
        nombre.trim(),
        telefono ? telefono.trim() : null,
        correo ? correo.trim() : null,
        direccion ? direccion.trim() : null
      ]
    );
    return this.getById(result.insertId);
  },

  async update(id, { nombre, telefono, correo, direccion }) {
    await pool.query(
      'UPDATE proveedores SET nombre = ?, telefono = ?, correo = ?, direccion = ? WHERE id_proveedor = ?',
      [
        nombre.trim(),
        telefono ? telefono.trim() : null,
        correo ? correo.trim() : null,
        direccion ? direccion.trim() : null,
        id
      ]
    );
    return this.getById(id);
  },

  async countAssociatedProducts(id) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS count FROM productos WHERE id_proveedor = ?',
      [id]
    );
    return rows[0].count;
  },

  async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM proveedores WHERE id_proveedor = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
};

module.exports = proveedorModel;

