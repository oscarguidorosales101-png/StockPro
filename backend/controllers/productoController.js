const productoService = require('../services/productoService');

const productoController = {
  async getAll(req, res, next) {
    try {
      const productos = await productoService.getAll();
      res.json({ success: true, data: productos });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const producto = await productoService.getById(id);
      res.json({ success: true, data: producto });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const { id_categoria, id_proveedor, nombre, descripcion, precio, stock } = req.body;
      const nuevoProducto = await productoService.create({
        id_categoria,
        id_proveedor,
        nombre,
        descripcion,
        precio,
        stock
      });
      res.status(201).json({
        success: true,
        message: 'Producto registrado exitosamente.',
        data: nuevoProducto
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { id_categoria, id_proveedor, nombre, descripcion, precio, stock } = req.body;
      const productoActualizado = await productoService.update(id, {
        id_categoria,
        id_proveedor,
        nombre,
        descripcion,
        precio,
        stock
      });
      res.json({
        success: true,
        message: 'Producto actualizado exitosamente.',
        data: productoActualizado
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await productoService.delete(id);
      res.json({
        success: true,
        message: 'Producto eliminado exitosamente.'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = productoController;

