const proveedorService = require('../services/proveedorService');

const proveedorController = {
  async getAll(req, res, next) {
    try {
      const proveedores = await proveedorService.getAll();
      res.json({ success: true, data: proveedores });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const proveedor = await proveedorService.getById(id);
      res.json({ success: true, data: proveedor });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const { nombre, telefono, correo, direccion } = req.body;
      const nuevoProveedor = await proveedorService.create({ nombre, telefono, correo, direccion });
      res.status(201).json({
        success: true,
        message: 'Proveedor registrado exitosamente.',
        data: nuevoProveedor
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { nombre, telefono, correo, direccion } = req.body;
      const proveedorActualizado = await proveedorService.update(id, { nombre, telefono, correo, direccion });
      res.json({
        success: true,
        message: 'Proveedor actualizado exitosamente.',
        data: proveedorActualizado
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await proveedorService.delete(id);
      res.json({
        success: true,
        message: 'Proveedor eliminado exitosamente.'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = proveedorController;

