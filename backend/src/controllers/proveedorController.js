const proveedorModel = require('../models/proveedorModel');

const proveedorController = {
  async getAll(req, res) {
    try {
      const proveedores = await proveedorModel.getAll();
      res.json({ success: true, data: proveedores });
    } catch (error) {
      console.error('Error en proveedorController.getAll:', error);
      res.status(500).json({ success: false, message: 'Error al obtener los proveedores.', error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const proveedor = await proveedorModel.getById(id);
      if (!proveedor) {
        return res.status(404).json({ success: false, message: 'Proveedor no encontrado.' });
      }
      res.json({ success: true, data: proveedor });
    } catch (error) {
      console.error('Error en proveedorController.getById:', error);
      res.status(500).json({ success: false, message: 'Error al obtener el proveedor.', error: error.message });
    }
  },

  async create(req, res) {
    try {
      const { nombre, telefono, correo, direccion } = req.body;
      if (!nombre || !nombre.trim()) {
        return res.status(400).json({ success: false, message: 'El nombre del proveedor es obligatorio.' });
      }

      const nuevoProveedor = await proveedorModel.create({
        nombre,
        telefono,
        correo,
        direccion
      });
      res.status(201).json({ success: true, message: 'Proveedor registrado exitosamente.', data: nuevoProveedor });
    } catch (error) {
      console.error('Error en proveedorController.create:', error);
      res.status(500).json({ success: false, message: 'Error al registrar el proveedor.', error: error.message });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, telefono, correo, direccion } = req.body;

      const proveedorExistente = await proveedorModel.getById(id);
      if (!proveedorExistente) {
        return res.status(404).json({ success: false, message: 'Proveedor no encontrado.' });
      }

      if (!nombre || !nombre.trim()) {
        return res.status(400).json({ success: false, message: 'El nombre del proveedor es obligatorio.' });
      }

      const proveedorActualizado = await proveedorModel.update(id, {
        nombre,
        telefono,
        correo,
        direccion
      });
      res.json({ success: true, message: 'Proveedor actualizado exitosamente.', data: proveedorActualizado });
    } catch (error) {
      console.error('Error en proveedorController.update:', error);
      res.status(500).json({ success: false, message: 'Error al actualizar el proveedor.', error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const proveedor = await proveedorModel.getById(id);
      if (!proveedor) {
        return res.status(404).json({ success: false, message: 'Proveedor no encontrado.' });
      }

      const totalProductos = await proveedorModel.countAssociatedProducts(id);
      if (totalProductos > 0) {
        return res.status(400).json({
          success: false,
          message: `No se puede eliminar el proveedor porque suministra ${totalProductos} producto(s). Reasigne o elimine los productos asociados primero.`
        });
      }

      await proveedorModel.delete(id);
      res.json({ success: true, message: 'Proveedor eliminado exitosamente.' });
    } catch (error) {
      console.error('Error en proveedorController.delete:', error);
      res.status(500).json({ success: false, message: 'Error al eliminar el proveedor.', error: error.message });
    }
  }
};

module.exports = proveedorController;

