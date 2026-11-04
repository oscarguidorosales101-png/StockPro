const pool = require('../config/db');

const clienteModel = {
  async getAll({ search, tipo_cliente, estado } = {}) {
    let query = `
      SELECT cl.*, COUNT(m.id_movimiento) AS total_movimientos
      FROM clientes cl
      LEFT JOIN movimientos m ON cl.id_cliente = m.id_cliente
      WHERE 1=1
    `;
    const params = [];

    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      query += ` AND (cl.nombre LIKE ? OR cl.identificacion LIKE ? OR cl.correo LIKE ?)`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (tipo_cliente && tipo_cliente !== 'todos') {
      query += ` AND cl.tipo_cliente = ?`;
      params.push(tipo_cliente);
    }

    if (estado !== undefined && estado !== null && estado !== '' && estado !== 'todos') {
      const isEstadoTrue = estado === true || estado === 'true' || estado === 1 || estado === '1';
      query += ` AND cl.estado = ?`;
      params.push(isEstadoTrue ? 1 : 0);
    }

    query += `
      GROUP BY cl.id_cliente
      ORDER BY cl.nombre ASC
    `;

    const [rows] = await pool.query(query, params);
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query(`
      SELECT cl.*, COUNT(m.id_movimiento) AS total_movimientos
      FROM clientes cl
      LEFT JOIN movimientos m ON cl.id_cliente = m.id_cliente
      WHERE cl.id_cliente = ?
      GROUP BY cl.id_cliente
    `, [id]);
    return rows[0] || null;
  },

  async findByIdentificacion(identificacion, excludeId = null) {
    let query = 'SELECT * FROM clientes WHERE identificacion = ?';
    const params = [identificacion.trim()];
    if (excludeId) {
      query += ' AND id_cliente != ?';
      params.push(excludeId);
    }
    const [rows] = await pool.query(query, params);
    return rows[0] || null;
  },

  async create({ tipo_cliente, nombre, identificacion, telefono, correo, direccion, estado = true }) {
    const [result] = await pool.query(
      `INSERT INTO clientes (tipo_cliente, nombre, identificacion, telefono, correo, direccion, estado, fecha_registro)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        tipo_cliente.trim().toLowerCase(),
        nombre.trim(),
        identificacion.trim(),
        telefono ? telefono.trim() : null,
        correo ? correo.trim() : null,
        direccion ? direccion.trim() : null,
        estado ? 1 : 0
      ]
    );
    return this.getById(result.insertId);
  },

  async update(id, { tipo_cliente, nombre, identificacion, telefono, correo, direccion, estado }) {
    await pool.query(
      `UPDATE clientes
       SET tipo_cliente = ?, nombre = ?, identificacion = ?, telefono = ?, correo = ?, direccion = ?, estado = ?
       WHERE id_cliente = ?`,
      [
        tipo_cliente.trim().toLowerCase(),
        nombre.trim(),
        identificacion.trim(),
        telefono ? telefono.trim() : null,
        correo ? correo.trim() : null,
        direccion ? direccion.trim() : null,
        estado ? 1 : 0,
        id
      ]
    );
    return this.getById(id);
  },

  async toggleEstado(id) {
    const cliente = await this.getById(id);
    if (!cliente) return null;
    const nuevoEstado = cliente.estado ? 0 : 1;
    await pool.query('UPDATE clientes SET estado = ? WHERE id_cliente = ?', [nuevoEstado, id]);
    return this.getById(id);
  },

  async countAssociatedMovements(id) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS count FROM movimientos WHERE id_cliente = ?',
      [id]
    );
    return rows[0].count;
  },

  async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM clientes WHERE id_cliente = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
};

module.exports = clienteModel;

