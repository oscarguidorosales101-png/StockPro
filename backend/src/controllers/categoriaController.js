const categoriaModel = require('../models/categoriaModel');

const categoriaController = {
  async getAll(req, res) {
    try {
      const categorias = await categoriaModel.getAll();
      res.json({ success: true, data: categorias });
    } catch (error) {
      console.error('Error en categoriaController.getAll:', error);
      res.status(500).json({ success: false, message: 'Error al obtener las categorías.', error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const categoria = await categoriaModel.getById(id);
      if (!categoria) {
        return res.status(404).json({ success: false, message: 'Categoría no encontrada.' });
      }
      res.json({ success: true, data: categoria });
    } catch (error) {
      console.error('Error en categoriaController.getById:', error);
      res.status(500).json({ success: false, message: 'Error al obtener la categoría.', error: error.message });
    }
  },

  async create(req, res) {
    try {
      const { nombre, descripcion, estado } = req.body;
      if (!nombre || !nombre.trim()) {
        return res.status(400).json({ success: false, message: 'El nombre de la categoría es obligatorio.' });
      }

      const nuevaCategoria = await categoriaModel.create({
        nombre,
        descripcion,
        estado: estado !== undefined ? estado : true
      });
      res.status(201).json({ success: true, message: 'Categoría creada exitosamente.', data: nuevaCategoria });
    } catch (error) {
      console.error('Error en categoriaController.create:', error);
      res.status(500).json({ success: false, message: 'Error al crear la categoría.', error: error.message });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, descripcion, estado } = req.body;

      const categoriaExistente = await categoriaModel.getById(id);
      if (!categoriaExistente) {
        return res.status(404).json({ success: false, message: 'Categoría no encontrada.' });
      }

      if (!nombre || !nombre.trim()) {
        return res.status(400).json({ success: false, message: 'El nombre de la categoría es obligatorio.' });
      }

      const categoriaActualizada = await categoriaModel.update(id, {
        nombre,
        descripcion,
        estado: estado !== undefined ? estado : categoriaExistente.estado
      });
      res.json({ success: true, message: 'Categoría actualizada exitosamente.', data: categoriaActualizada });
    } catch (error) {
      console.error('Error en categoriaController.update:', error);
      res.status(500).json({ success: false, message: 'Error al actualizar la categoría.', error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const categoria = await categoriaModel.getById(id);
      if (!categoria) {
        return res.status(404).json({ success: false, message: 'Categoría no encontrada.' });
      }

      const totalProductos = await categoriaModel.countAssociatedProducts(id);
      if (totalProductos > 0) {
        return res.status(400).json({
          success: false,
          message: `No se puede eliminar la categoría porque tiene ${totalProductos} producto(s) asociado(s). Reasigne o elimine los productos primero.`
        });
      }

      await categoriaModel.delete(id);
      res.json({ success: true, message: 'Categoría eliminada exitosamente.' });
    } catch (error) {
      console.error('Error en categoriaController.delete:', error);
      res.status(500).json({ success: false, message: 'Error al eliminar la categoría.', error: error.message });
    }
  }
};

module.exports = categoriaController;

