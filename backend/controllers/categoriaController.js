const categoriaService = require('../services/categoriaService');

const categoriaController = {
  async getAll(req, res, next) {
    try {
      const categorias = await categoriaService.getAll();
      res.json({ success: true, data: categorias });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const categoria = await categoriaService.getById(id);
      res.json({ success: true, data: categoria });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const { nombre, descripcion, estado } = req.body;
      const nuevaCategoria = await categoriaService.create({ nombre, descripcion, estado });
      res.status(201).json({
        success: true,
        message: 'Categoría creada exitosamente.',
        data: nuevaCategoria
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { nombre, descripcion, estado } = req.body;
      const categoriaActualizada = await categoriaService.update(id, { nombre, descripcion, estado });
      res.json({
        success: true,
        message: 'Categoría actualizada exitosamente.',
        data: categoriaActualizada
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await categoriaService.delete(id);
      res.json({
        success: true,
        message: 'Categoría eliminada exitosamente.'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = categoriaController;

