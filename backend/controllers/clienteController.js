const clienteService = require('../services/clienteService');

const clienteController = {
  async getAll(req, res, next) {
    try {
      const { search, tipo_cliente, estado } = req.query;
      const clientes = await clienteService.getAll({ search, tipo_cliente, estado });
      res.json({ success: true, data: clientes });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cliente = await clienteService.getById(id);
      res.json({ success: true, data: cliente });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const { tipo_cliente, nombre, identificacion, telefono, correo, direccion, estado } = req.body;
      const nuevoCliente = await clienteService.create({
        tipo_cliente,
        nombre,
        identificacion,
        telefono,
        correo,
        direccion,
        estado
      });
      res.status(201).json({
        success: true,
        message: 'Cliente registrado exitosamente.',
        data: nuevoCliente
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { tipo_cliente, nombre, identificacion, telefono, correo, direccion, estado } = req.body;
      const clienteActualizado = await clienteService.update(id, {
        tipo_cliente,
        nombre,
        identificacion,
        telefono,
        correo,
        direccion,
        estado
      });
      res.json({
        success: true,
        message: 'Cliente actualizado exitosamente.',
        data: clienteActualizado
      });
    } catch (error) {
      next(error);
    }
  },

  async toggleEstado(req, res, next) {
    try {
      const { id } = req.params;
      const clienteActualizado = await clienteService.toggleEstado(id);
      res.json({
        success: true,
        message: `Estado cambiado a ${clienteActualizado.estado ? 'Activo' : 'Inactivo'}.`,
        data: clienteActualizado
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await clienteService.delete(id);
      res.json({
        success: true,
        message: 'Cliente eliminado exitosamente.'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = clienteController;

