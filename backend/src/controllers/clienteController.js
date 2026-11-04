const clienteModel = require('../models/clienteModel');

const clienteController = {
  async getAll(req, res) {
    try {
      const { search, tipo_cliente, estado } = req.query;
      const clientes = await clienteModel.getAll({ search, tipo_cliente, estado });
      res.json({ success: true, data: clientes });
    } catch (error) {
      console.error('Error en clienteController.getAll:', error);
      res.status(500).json({ success: false, message: 'Error al obtener los clientes.', error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const cliente = await clienteModel.getById(id);
      if (!cliente) {
        return res.status(404).json({ success: false, message: 'Cliente no encontrado.' });
      }
      res.json({ success: true, data: cliente });
    } catch (error) {
      console.error('Error en clienteController.getById:', error);
      res.status(500).json({ success: false, message: 'Error al obtener el cliente.', error: error.message });
    }
  },

  async create(req, res) {
    try {
      const { tipo_cliente, nombre, identificacion, telefono, correo, direccion, estado } = req.body;

      if (!tipo_cliente || !tipo_cliente.trim()) {
        return res.status(400).json({ success: false, message: 'El tipo de cliente es obligatorio (persona o empresa).' });
      }

      const tipoNormalizado = tipo_cliente.trim().toLowerCase();
      if (!['persona', 'empresa'].includes(tipoNormalizado)) {
        return res.status(400).json({ success: false, message: 'El tipo de cliente debe ser "persona" o "empresa".' });
      }

      if (!nombre || !nombre.trim()) {
        return res.status(400).json({ success: false, message: 'El nombre o razón social es obligatorio.' });
      }

      if (!identificacion || !identificacion.trim()) {
        return res.status(400).json({ success: false, message: 'La identificación es obligatoria.' });
      }

      // Validar cédula / identificación duplicada
      const clienteDuplicado = await clienteModel.findByIdentificacion(identificacion);
      if (clienteDuplicado) {
        return res.status(400).json({
          success: false,
          message: `Ya existe un cliente registrado con la identificación "${identificacion.trim()}".`
        });
      }

      const nuevoCliente = await clienteModel.create({
        tipo_cliente: tipoNormalizado,
        nombre,
        identificacion,
        telefono,
        correo,
        direccion,
        estado: estado !== undefined ? estado : true
      });

      res.status(201).json({ success: true, message: 'Cliente registrado exitosamente.', data: nuevoCliente });
    } catch (error) {
      console.error('Error en clienteController.create:', error);
      res.status(500).json({ success: false, message: 'Error al registrar el cliente.', error: error.message });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { tipo_cliente, nombre, identificacion, telefono, correo, direccion, estado } = req.body;

      const clienteExistente = await clienteModel.getById(id);
      if (!clienteExistente) {
        return res.status(404).json({ success: false, message: 'Cliente no encontrado.' });
      }

      if (!tipo_cliente || !tipo_cliente.trim()) {
        return res.status(400).json({ success: false, message: 'El tipo de cliente es obligatorio.' });
      }

      const tipoNormalizado = tipo_cliente.trim().toLowerCase();
      if (!['persona', 'empresa'].includes(tipoNormalizado)) {
        return res.status(400).json({ success: false, message: 'El tipo de cliente debe ser "persona" o "empresa".' });
      }

      if (!nombre || !nombre.trim()) {
        return res.status(400).json({ success: false, message: 'El nombre o razón social es obligatorio.' });
      }

      if (!identificacion || !identificacion.trim()) {
        return res.status(400).json({ success: false, message: 'La identificación es obligatoria.' });
      }

      // Validar duplicado excluyendo este ID
      const clienteDuplicado = await clienteModel.findByIdentificacion(identificacion, id);
      if (clienteDuplicado) {
        return res.status(400).json({
          success: false,
          message: `Ya existe otro cliente con la identificación "${identificacion.trim()}".`
        });
      }

      const clienteActualizado = await clienteModel.update(id, {
        tipo_cliente: tipoNormalizado,
        nombre,
        identificacion,
        telefono,
        correo,
        direccion,
        estado: estado !== undefined ? estado : clienteExistente.estado
      });

      res.json({ success: true, message: 'Cliente actualizado exitosamente.', data: clienteActualizado });
    } catch (error) {
      console.error('Error en clienteController.update:', error);
      res.status(500).json({ success: false, message: 'Error al actualizar el cliente.', error: error.message });
    }
  },

  async toggleEstado(req, res) {
    try {
      const { id } = req.params;
      const clienteActualizado = await clienteModel.toggleEstado(id);
      if (!clienteActualizado) {
        return res.status(404).json({ success: false, message: 'Cliente no encontrado.' });
      }
      res.json({
        success: true,
        message: `Estado cambiado a ${clienteActualizado.estado ? 'Activo' : 'Inactivo'}.`,
        data: clienteActualizado
      });
    } catch (error) {
      console.error('Error en clienteController.toggleEstado:', error);
      res.status(500).json({ success: false, message: 'Error al cambiar estado del cliente.', error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const cliente = await clienteModel.getById(id);
      if (!cliente) {
        return res.status(404).json({ success: false, message: 'Cliente no encontrado.' });
      }

      const totalMovimientos = await clienteModel.countAssociatedMovements(id);
      if (totalMovimientos > 0) {
        return res.status(400).json({
          success: false,
          message: `No se puede eliminar el cliente porque está vinculado a ${totalMovimientos} movimiento(s) de inventario. Puede desactivarlo en su lugar.`
        });
      }

      await clienteModel.delete(id);
      res.json({ success: true, message: 'Cliente eliminado exitosamente.' });
    } catch (error) {
      console.error('Error en clienteController.delete:', error);
      res.status(500).json({ success: false, message: 'Error al eliminar el cliente.', error: error.message });
    }
  }
};

module.exports = clienteController;

