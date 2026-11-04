const detalleMovimientoModel = require('../models/detalleMovimientoModel');
const productoModel = require('../models/productoModel');

const detalleMovimientoController = {
  async getAll(req, res) {
    try {
      const { id_movimiento, id_producto } = req.query;
      const detalles = await detalleMovimientoModel.getAll({ id_movimiento, id_producto });
      res.json({ success: true, data: detalles });
    } catch (error) {
      console.error('Error en detalleMovimientoController.getAll:', error);
      res.status(500).json({ success: false, message: 'Error al obtener los detalles de movimientos.', error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const detalle = await detalleMovimientoModel.getById(id);
      if (!detalle) {
        return res.status(404).json({ success: false, message: 'Detalle de movimiento no encontrado.' });
      }
      res.json({ success: true, data: detalle });
    } catch (error) {
      console.error('Error en detalleMovimientoController.getById:', error);
      res.status(500).json({ success: false, message: 'Error al obtener el detalle de movimiento.', error: error.message });
    }
  },

  async create(req, res) {
    try {
      const { id_movimiento, id_producto, cantidad } = req.body;

      if (!id_movimiento) {
        return res.status(400).json({ success: false, message: 'El id_movimiento es obligatorio.' });
      }
      if (!id_producto) {
        return res.status(400).json({ success: false, message: 'El id_producto es obligatorio.' });
      }
      if (cantidad === undefined || isNaN(Number(cantidad)) || Number(cantidad) === 0) {
        return res.status(400).json({ success: false, message: 'La cantidad debe ser un número diferente de cero.' });
      }

      const nuevoDetalle = await detalleMovimientoModel.create({
        id_movimiento,
        id_producto,
        cantidad: Number(cantidad)
      });

      res.status(201).json({
        success: true,
        message: 'Detalle de movimiento agregado y stock actualizado exitosamente.',
        data: nuevoDetalle
      });
    } catch (error) {
      console.error('Error en detalleMovimientoController.create:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al crear el detalle de movimiento.'
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { id_producto, cantidad } = req.body;

      if (!id_producto) {
        return res.status(400).json({ success: false, message: 'El id_producto es obligatorio.' });
      }
      if (cantidad === undefined || isNaN(Number(cantidad)) || Number(cantidad) === 0) {
        return res.status(400).json({ success: false, message: 'La cantidad debe ser un número diferente de cero.' });
      }

      const detalleActualizado = await detalleMovimientoModel.update(id, {
        id_producto,
        cantidad: Number(cantidad)
      });

      res.json({
        success: true,
        message: 'Detalle de movimiento actualizado y stock recalculado exitosamente.',
        data: detalleActualizado
      });
    } catch (error) {
      console.error('Error en detalleMovimientoController.update:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar el detalle de movimiento.'
      });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const detalle = await detalleMovimientoModel.getById(id);
      if (!detalle) {
        return res.status(404).json({ success: false, message: 'Detalle no encontrado.' });
      }

      await detalleMovimientoModel.delete(id);
      res.json({
        success: true,
        message: 'Detalle eliminado y reversión de inventario aplicada correctamente.'
      });
    } catch (error) {
      console.error('Error en detalleMovimientoController.delete:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al eliminar el detalle de movimiento.'
      });
    }
  }
};

module.exports = detalleMovimientoController;

