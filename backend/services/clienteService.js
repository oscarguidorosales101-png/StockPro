const clienteModel = require('../models/clienteModel');

class ValidationError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

const clienteService = {
  async getAll(filters) {
    return clienteModel.getAll(filters);
  },

  async getById(id) {
    const cliente = await clienteModel.getById(id);
    if (!cliente) {
      throw new ValidationError('Cliente no encontrado.', 404);
    }
    return cliente;
  },

  async create({ tipo_cliente, nombre, identificacion, telefono, correo, direccion, estado }) {
    if (!tipo_cliente || !tipo_cliente.trim()) {
      throw new ValidationError('El tipo de cliente es obligatorio (persona o empresa).', 400);
    }

    const tipoNormalizado = tipo_cliente.trim().toLowerCase();
    if (!['persona', 'empresa'].includes(tipoNormalizado)) {
      throw new ValidationError('El tipo de cliente debe ser "persona" o "empresa".', 400);
    }

    if (!nombre || !nombre.trim()) {
      throw new ValidationError('El nombre o razón social es obligatorio.', 400);
    }

    if (!identificacion || !identificacion.trim()) {
      throw new ValidationError('La identificación es obligatoria.', 400);
    }

    const clienteDuplicado = await clienteModel.findByIdentificacion(identificacion);
    if (clienteDuplicado) {
      throw new ValidationError(
        `Ya existe un cliente registrado con la identificación "${identificacion.trim()}".`,
        400
      );
    }

    return clienteModel.create({
      tipo_cliente: tipoNormalizado,
      nombre,
      identificacion,
      telefono,
      correo,
      direccion,
      estado: estado !== undefined ? Boolean(estado) : true
    });
  },

  async update(id, { tipo_cliente, nombre, identificacion, telefono, correo, direccion, estado }) {
    const clienteExistente = await this.getById(id);

    if (!tipo_cliente || !tipo_cliente.trim()) {
      throw new ValidationError('El tipo de cliente es obligatorio.', 400);
    }

    const tipoNormalizado = tipo_cliente.trim().toLowerCase();
    if (!['persona', 'empresa'].includes(tipoNormalizado)) {
      throw new ValidationError('El tipo de cliente debe ser "persona" o "empresa".', 400);
    }

    if (!nombre || !nombre.trim()) {
      throw new ValidationError('El nombre o razón social es obligatorio.', 400);
    }

    if (!identificacion || !identificacion.trim()) {
      throw new ValidationError('La identificación es obligatoria.', 400);
    }

    const clienteDuplicado = await clienteModel.findByIdentificacion(identificacion, id);
    if (clienteDuplicado) {
      throw new ValidationError(
        `Ya existe otro cliente con la identificación "${identificacion.trim()}".`,
        400
      );
    }

    return clienteModel.update(id, {
      tipo_cliente: tipoNormalizado,
      nombre,
      identificacion,
      telefono,
      correo,
      direccion,
      estado: estado !== undefined ? Boolean(estado) : clienteExistente.estado
    });
  },

  async toggleEstado(id) {
    await this.getById(id);
    return clienteModel.toggleEstado(id);
  },

  async delete(id) {
    await this.getById(id);

    const totalMovimientos = await clienteModel.countAssociatedMovements(id);
    if (totalMovimientos > 0) {
      throw new ValidationError(
        `No se puede eliminar el cliente porque está vinculado a ${totalMovimientos} movimiento(s) de inventario. Puede desactivarlo en su lugar.`,
        400
      );
    }

    return clienteModel.delete(id);
  }
};

module.exports = clienteService;

