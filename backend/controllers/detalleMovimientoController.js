const detalleMovimientoService = require('../services/detalleMovimientoService');

const detalleMovimientoController = {
  async getAll(req, res, next) {
    try {
      const { id_movimiento, id_producto } = req.query;
      const detalles = await detalleMovimientoService.getAll({ id_movimiento, id_producto });
      res.json({ success: true, data: detalles });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const detalle = await detalleMovimientoService.getById(id);
      res.json({ success: true, data: detalle });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const { id_movimiento, id_producto, cantidad } = req.body;
      const nuevoDetalle = await detalleMovimientoService.create({
        id_movimiento,
        id_producto,
        cantidad
      });
      res.status(201).json({
        success: true,
        message: 'Detalle de movimiento agregado y stock actualizado exitosamente.',
        data: nuevoDetalle
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { id_producto, cantidad } = req.body;
      const detalleActualizado = await detalleMovimientoService.update(id, {
        id_producto,
        cantidad
      });
      res.json({
        success: true,
        message: 'Detalle de movimiento actualizado y stock recalculado exitosamente.',
        data: detalleActualizado
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await detalleMovimientoService.delete(id);
      res.json({
        success: true,
        message: 'Detalle eliminado y reversión de inventario aplicada correctamente.'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = detalleMovimientoController;

