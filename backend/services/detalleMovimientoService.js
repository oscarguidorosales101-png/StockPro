const detalleMovimientoModel = require('../models/detalleMovimientoModel');

class ValidationError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

const detalleMovimientoService = {
  async getAll(params) {
    return detalleMovimientoModel.getAll(params);
  },

  async getById(id) {
    const detalle = await detalleMovimientoModel.getById(id);
    if (!detalle) {
      throw new ValidationError('Detalle de movimiento no encontrado.', 404);
    }
    return detalle;
  },

  async create({ id_movimiento, id_producto, cantidad }) {
    if (!id_movimiento) {
      throw new ValidationError('El id_movimiento es obligatorio.', 400);
    }
    if (!id_producto) {
      throw new ValidationError('El id_producto es obligatorio.', 400);
    }
    if (cantidad === undefined || isNaN(Number(cantidad)) || Number(cantidad) === 0) {
      throw new ValidationError('La cantidad debe ser un número diferente de cero.', 400);
    }

    return detalleMovimientoModel.create({
      id_movimiento,
      id_producto,
      cantidad: Number(cantidad)
    });
  },

  async update(id, { id_producto, cantidad }) {
    await this.getById(id);

    if (!id_producto) {
      throw new ValidationError('El id_producto es obligatorio.', 400);
    }
    if (cantidad === undefined || isNaN(Number(cantidad)) || Number(cantidad) === 0) {
      throw new ValidationError('La cantidad debe ser un número diferente de cero.', 400);
    }

    return detalleMovimientoModel.update(id, {
      id_producto,
      cantidad: Number(cantidad)
    });
  },

  async delete(id) {
    await this.getById(id);
    return detalleMovimientoModel.delete(id);
  }
};

module.exports = detalleMovimientoService;

