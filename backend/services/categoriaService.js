const categoriaModel = require('../models/categoriaModel');

class ValidationError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

const categoriaService = {
  async getAll() {
    return categoriaModel.getAll();
  },

  async getById(id) {
    const categoria = await categoriaModel.getById(id);
    if (!categoria) {
      throw new ValidationError('Categoría no encontrada.', 404);
    }
    return categoria;
  },

  async create({ nombre, descripcion, estado }) {
    if (!nombre || !nombre.trim()) {
      throw new ValidationError('El nombre de la categoría es obligatorio.', 400);
    }

    return categoriaModel.create({
      nombre,
      descripcion,
      estado: estado !== undefined ? Boolean(estado) : true
    });
  },

  async update(id, { nombre, descripcion, estado }) {
    await this.getById(id); // Valida existencia

    if (!nombre || !nombre.trim()) {
      throw new ValidationError('El nombre de la categoría es obligatorio.', 400);
    }

    return categoriaModel.update(id, {
      nombre,
      descripcion,
      estado
    });
  },

  async delete(id) {
    await this.getById(id); // Valida existencia

    const totalProductos = await categoriaModel.countAssociatedProducts(id);
    if (totalProductos > 0) {
      throw new ValidationError(
        `No se puede eliminar la categoría porque tiene ${totalProductos} producto(s) asociado(s). Reasigne o elimine los productos primero.`,
        400
      );
    }

    return categoriaModel.delete(id);
  }
};

module.exports = categoriaService;

