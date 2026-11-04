const movimientoService = require('../services/movimientoService');

const movimientoController = {
  async getAll(req, res, next) {
    try {
      const { tipo, id_cliente, fecha_desde, fecha_hasta } = req.query;
      const movimientos = await movimientoService.getAll({ tipo, id_cliente, fecha_desde, fecha_hasta });
      res.json({ success: true, data: movimientos });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const movimiento = await movimientoService.getById(id);
      res.json({ success: true, data: movimiento });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const { id_cliente, fecha, tipo, observacion, detalles } = req.body;
      const nuevoMovimiento = await movimientoService.create({
        id_cliente,
        fecha,
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
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { id_cliente, fecha, tipo, observacion, detalles } = req.body;
      const movimientoActualizado = await movimientoService.update(id, {
        id_cliente,
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
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await movimientoService.delete(id);
      res.json({
        success: true,
        message: 'Movimiento eliminado y reversión de inventario aplicada correctamente.'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = movimientoController;

