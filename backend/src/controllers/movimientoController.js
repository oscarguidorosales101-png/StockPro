const movimientoModel = require('../models/movimientoModel');
const clienteModel = require('../models/clienteModel');

const movimientoController = {
  async getAll(req, res) {
    try {
      const { tipo, id_cliente, fecha_desde, fecha_hasta } = req.query;
      const movimientos = await movimientoModel.getAll({ tipo, id_cliente, fecha_desde, fecha_hasta });
      res.json({ success: true, data: movimientos });
    } catch (error) {
      console.error('Error en movimientoController.getAll:', error);
      res.status(500).json({ success: false, message: 'Error al obtener los movimientos.', error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const movimiento = await movimientoModel.getById(id);
      if (!movimiento) {
        return res.status(404).json({ success: false, message: 'Movimiento no encontrado.' });
      }
      res.json({ success: true, data: movimiento });
    } catch (error) {
      console.error('Error en movimientoController.getById:', error);
      res.status(500).json({ success: false, message: 'Error al obtener el movimiento.', error: error.message });
    }
  },

  async create(req, res) {
    try {
      const { id_cliente, fecha, tipo, observacion, detalles } = req.body;

      if (!tipo || !['entrada', 'salida', 'ajuste'].includes(tipo)) {
        return res.status(400).json({
          success: false,
          message: 'El tipo de movimiento es obligatorio y debe ser "entrada", "salida" o "ajuste".'
        });
      }

      if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Debe incluir al menos un producto en el detalle del movimiento.'
        });
      }

      // Si se envía id_cliente, validar que exista
      if (id_cliente) {
        const cliente = await clienteModel.getById(id_cliente);
        if (!cliente) {
          return res.status(400).json({ success: false, message: 'El cliente seleccionado no existe.' });
        }
      }

      // Validar datos de detalles
      for (const item of detalles) {
        if (!item.id_producto) {
          return res.status(400).json({ success: false, message: 'Cada elemento del detalle debe especificar un producto.' });
        }
        const cant = Number(item.cantidad);
        if (isNaN(cant) || cant === 0) {
          return res.status(400).json({ success: false, message: 'La cantidad debe ser un número distinto de cero.' });
        }
        if (tipo === 'entrada' && cant < 0) {
          return res.status(400).json({ success: false, message: 'Para una entrada, la cantidad debe ser positiva.' });
        }
        if (tipo === 'salida' && cant <= 0) {
          return res.status(400).json({ success: false, message: 'Para una salida, la cantidad debe ser mayor a cero.' });
        }
      }

      const nuevoMovimiento = await movimientoModel.createWithDetails({
        id_cliente: id_cliente || null,
        fecha: fecha || new Date(),
        tipo,
        observacion,
        detalles
      });

      res.status(201).json({
        success: true,
        message: 'Movimiento registrado e inventario actualizado exitosamente.',
        data: nuevoMovimiento
      });
    } catch (error) {
      console.error('Error en movimientoController.create:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al registrar el movimiento.'
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { id_cliente, fecha, tipo, observacion, detalles } = req.body;

      const movimientoExistente = await movimientoModel.getById(id);
      if (!movimientoExistente) {
        return res.status(404).json({ success: false, message: 'Movimiento no encontrado.' });
      }

      if (!tipo || !['entrada', 'salida', 'ajuste'].includes(tipo)) {
        return res.status(400).json({
          success: false,
          message: 'El tipo de movimiento debe ser "entrada", "salida" o "ajuste".'
        });
      }

      if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Debe incluir al menos un producto en el detalle del movimiento.'
        });
      }

      if (id_cliente) {
        const cliente = await clienteModel.getById(id_cliente);
        if (!cliente) {
          return res.status(400).json({ success: false, message: 'El cliente seleccionado no existe.' });
        }
      }

      const movimientoActualizado = await movimientoModel.updateWithDetails(id, {
        id_cliente: id_cliente || null,
        fecha,
        tipo,
        observacion,
        detalles
      });

      res.json({
        success: true,
        message: 'Movimiento actualizado y stock recalculado exitosamente.',
        data: movimientoActualizado
      });
    } catch (error) {
      console.error('Error en movimientoController.update:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar el movimiento.'
      });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const movimientoExistente = await movimientoModel.getById(id);
      if (!movimientoExistente) {
        return res.status(404).json({ success: false, message: 'Movimiento no encontrado.' });
      }

      await movimientoModel.deleteWithDetails(id);
      res.json({
        success: true,
        message: 'Movimiento eliminado y reversión de inventario aplicada correctamente.'
      });
    } catch (error) {
      console.error('Error en movimientoController.delete:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al eliminar el movimiento.'
      });
    }
  }
};

module.exports = movimientoController;

