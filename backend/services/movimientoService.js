const movimientoModel = require('../models/movimientoModel');
const clienteModel = require('../models/clienteModel');

class ValidationError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

const movimientoService = {
  async getAll(filters) {
    return movimientoModel.getAll(filters);
  },

  async getById(id) {
    const movimiento = await movimientoModel.getById(id);
    if (!movimiento) {
      throw new ValidationError('Movimiento no encontrado.', 404);
    }
    return movimiento;
  },

  async create({ id_cliente, fecha, tipo, observacion, detalles }) {
    if (!tipo || !['entrada', 'salida', 'ajuste'].includes(tipo)) {
      throw new ValidationError(
        'El tipo de movimiento es obligatorio y debe ser "entrada", "salida" o "ajuste".',
        400
      );
    }

    if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
      throw new ValidationError('Debe incluir al menos un producto en el detalle del movimiento.', 400);
    }

    if (id_cliente) {
      const cliente = await clienteModel.getById(id_cliente);
      if (!cliente) {
        throw new ValidationError('El cliente seleccionado no existe.', 400);
      }
    }

    for (const item of detalles) {
      if (!item.id_producto) {
        throw new ValidationError('Cada elemento del detalle debe especificar un producto.', 400);
      }
      const cant = Number(item.cantidad);
      if (isNaN(cant) || cant === 0) {
        throw new ValidationError('La cantidad debe ser un número distinto de cero.', 400);
      }
      if (tipo === 'entrada' && cant < 0) {
        throw new ValidationError('Para una entrada, la cantidad debe ser positiva.', 400);
      }
      if (tipo === 'salida' && cant <= 0) {
        throw new ValidationError('Para una salida, la cantidad debe ser mayor a cero.', 400);
      }
    }

    return movimientoModel.createWithDetails({
      id_cliente: id_cliente || null,
      fecha: fecha || new Date(),
      tipo,
      observacion,
      detalles
    });
  },

  async update(id, { id_cliente, fecha, tipo, observacion, detalles }) {
    await this.getById(id);

    if (!tipo || !['entrada', 'salida', 'ajuste'].includes(tipo)) {
      throw new ValidationError(
        'El tipo de movimiento debe ser "entrada", "salida" o "ajuste".',
        400
      );
    }

    if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
      throw new ValidationError('Debe incluir al menos un producto en el detalle del movimiento.', 400);
    }

    if (id_cliente) {
      const cliente = await clienteModel.getById(id_cliente);
      if (!cliente) {
        throw new ValidationError('El cliente seleccionado no existe.', 400);
      }
    }

    return movimientoModel.updateWithDetails(id, {
      id_cliente: id_cliente || null,
      fecha,
      tipo,
      observacion,
      detalles
    });
  },

  async delete(id) {
    await this.getById(id);
    return movimientoModel.deleteWithDetails(id);
  }
};

module.exports = movimientoService;

