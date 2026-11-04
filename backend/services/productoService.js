const productoModel = require('../models/productoModel');
const categoriaModel = require('../models/categoriaModel');
const proveedorModel = require('../models/proveedorModel');

class ValidationError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

const productoService = {
  async getAll() {
    return productoModel.getAll();
  },

  async getById(id) {
    const producto = await productoModel.getById(id);
    if (!producto) {
      throw new ValidationError('Producto no encontrado.', 404);
    }
    return producto;
  },

  async create({ id_categoria, id_proveedor, nombre, descripcion, precio, stock }) {
    if (!nombre || !nombre.trim()) {
      throw new ValidationError('El nombre del producto es obligatorio.', 400);
    }
    if (!id_categoria) {
      throw new ValidationError('Debe seleccionar una categoría válida.', 400);
    }
    if (!id_proveedor) {
      throw new ValidationError('Debe seleccionar un proveedor válido.', 400);
    }

    const cat = await categoriaModel.getById(id_categoria);
    if (!cat) {
      throw new ValidationError('La categoría seleccionada no existe.', 400);
    }

    const prov = await proveedorModel.getById(id_proveedor);
    if (!prov) {
      throw new ValidationError('El proveedor seleccionado no existe.', 400);
    }

    if (precio !== undefined && Number(precio) < 0) {
      throw new ValidationError('El precio no puede ser negativo.', 400);
    }

    if (stock !== undefined && parseInt(stock, 10) < 0) {
      throw new ValidationError('El stock no puede ser negativo.', 400);
    }

    return productoModel.create({
      id_categoria,
      id_proveedor,
      nombre,
      descripcion,
      precio: precio !== undefined ? precio : 0,
      stock: stock !== undefined ? stock : 0
    });
  },

  async update(id, { id_categoria, id_proveedor, nombre, descripcion, precio, stock }) {
    const prodExistente = await this.getById(id);

    if (!nombre || !nombre.trim()) {
      throw new ValidationError('El nombre del producto es obligatorio.', 400);
    }
    if (!id_categoria) {
      throw new ValidationError('Debe seleccionar una categoría válida.', 400);
    }
    if (!id_proveedor) {
      throw new ValidationError('Debe seleccionar un proveedor válido.', 400);
    }

    const cat = await categoriaModel.getById(id_categoria);
    if (!cat) {
      throw new ValidationError('La categoría seleccionada no existe.', 400);
    }

    const prov = await proveedorModel.getById(id_proveedor);
    if (!prov) {
      throw new ValidationError('El proveedor seleccionado no existe.', 400);
    }

    if (precio !== undefined && Number(precio) < 0) {
      throw new ValidationError('El precio no puede ser negativo.', 400);
    }

    if (stock !== undefined && parseInt(stock, 10) < 0) {
      throw new ValidationError('El stock no puede ser negativo.', 400);
    }

    return productoModel.update(id, {
      id_categoria,
      id_proveedor,
      nombre,
      descripcion,
      precio: precio !== undefined ? precio : prodExistente.precio,
      stock: stock !== undefined ? stock : prodExistente.stock
    });
  },

  async delete(id) {
    await this.getById(id);

    const totalDetalles = await productoModel.countAssociatedDetails(id);
    if (totalDetalles > 0) {
      throw new ValidationError(
        `No se puede eliminar el producto porque tiene ${totalDetalles} movimiento(s) de inventario registrado(s). Para preservar el historial de movimientos, no se permite su eliminación.`,
        400
      );
    }

    return productoModel.delete(id);
  }
};

module.exports = productoService;

