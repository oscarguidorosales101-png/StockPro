const proveedorModel = require('../models/proveedorModel');

class ValidationError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

const proveedorService = {
  async getAll() {
    return proveedorModel.getAll();
  },

  async getById(id) {
    const proveedor = await proveedorModel.getById(id);
    if (!proveedor) {
      throw new ValidationError('Proveedor no encontrado.', 404);
    }
    return proveedor;
  },

  async create({ nombre, telefono, correo, direccion }) {
    if (!nombre || !nombre.trim()) {
      throw new ValidationError('El nombre del proveedor es obligatorio.', 400);
    }

    return proveedorModel.create({
      nombre,
      telefono,
      correo,
      direccion
    });
  },

  async update(id, { nombre, telefono, correo, direccion }) {
    await this.getById(id);

    if (!nombre || !nombre.trim()) {
      throw new ValidationError('El nombre del proveedor es obligatorio.', 400);
    }

    return proveedorModel.update(id, {
      nombre,
      telefono,
      correo,
      direccion
    });
  },

  async delete(id) {
    await this.getById(id);

    const totalProductos = await proveedorModel.countAssociatedProducts(id);
    if (totalProductos > 0) {
      throw new ValidationError(
        `No se puede eliminar el proveedor porque suministra ${totalProductos} producto(s). Reasigne o elimine los productos asociados primero.`,
        400
      );
    }

    return proveedorModel.delete(id);
  }
};

module.exports = proveedorService;

