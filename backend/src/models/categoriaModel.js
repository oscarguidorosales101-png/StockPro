const pool = require('../config/db');

const categoriaModel = {
  async getAll() {
    const [rows] = await pool.query(`
      SELECT c.*, COUNT(p.id_producto) AS total_productos
      FROM categorias c
      LEFT JOIN productos p ON c.id_categoria = p.id_categoria
      GROUP BY c.id_categoria
      ORDER BY c.nombre ASC
    `);
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM categorias WHERE id_categoria = ?',
      [id]
    );
    return rows[0] || null;
  },

  async create({ nombre, descripcion, estado = true }) {
    const [result] = await pool.query(
      'INSERT INTO categorias (nombre, descripcion, estado) VALUES (?, ?, ?)',
      [nombre.trim(), descripcion ? descripcion.trim() : null, estado ? 1 : 0]
    );
    return this.getById(result.insertId);
  },

  async update(id, { nombre, descripcion, estado }) {
    await pool.query(
      'UPDATE categorias SET nombre = ?, descripcion = ?, estado = ? WHERE id_categoria = ?',
      [
        nombre.trim(),
        descripcion ? descripcion.trim() : null,
        estado ? 1 : 0,
        id
      ]
    );
    return this.getById(id);
  },

  async countAssociatedProducts(id) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS count FROM productos WHERE id_categoria = ?',
      [id]
    );
    return rows[0].count;
  },

  async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM categorias WHERE id_categoria = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
};

module.exports = categoriaModel;

