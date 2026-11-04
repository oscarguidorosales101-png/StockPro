const productoModel = require('../models/productoModel');
const categoriaModel = require('../models/categoriaModel');
const proveedorModel = require('../models/proveedorModel');

const productoController = {
  async getAll(req, res) {
    try {
      const productos = await productoModel.getAll();
      res.json({ success: true, data: productos });
    } catch (error) {
      console.error('Error en productoController.getAll:', error);
      res.status(500).json({ success: false, message: 'Error al obtener los productos.', error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const producto = await productoModel.getById(id);
      if (!producto) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
      }
      res.json({ success: true, data: producto });
    } catch (error) {
      console.error('Error en productoController.getById:', error);
      res.status(500).json({ success: false, message: 'Error al obtener el producto.', error: error.message });
    }
  },

  async create(req, res) {
    try {
      const { id_categoria, id_proveedor, nombre, descripcion, precio, stock } = req.body;

      if (!nombre || !nombre.trim()) {
        return res.status(400).json({ success: false, message: 'El nombre del producto es obligatorio.' });
      }
      if (!id_categoria) {
        return res.status(400).json({ success: false, message: 'Debe seleccionar una categoría válida.' });
      }
      if (!id_proveedor) {
        return res.status(400).json({ success: false, message: 'Debe seleccionar un proveedor válido.' });
      }

      // Validar existencia de categoría y proveedor
      const cat = await categoriaModel.getById(id_categoria);
      if (!cat) {
        return res.status(400).json({ success: false, message: 'La categoría seleccionada no existe.' });
      }

      const prov = await proveedorModel.getById(id_proveedor);
      if (!prov) {
        return res.status(400).json({ success: false, message: 'El proveedor seleccionado no existe.' });
      }

      if (precio !== undefined && Number(precio) < 0) {
        return res.status(400).json({ success: false, message: 'El precio no puede ser negativo.' });
      }

      if (stock !== undefined && parseInt(stock, 10) < 0) {
        return res.status(400).json({ success: false, message: 'El stock no puede ser negativo.' });
      }

      const nuevoProducto = await productoModel.create({
        id_categoria,
        id_proveedor,
        nombre,
        descripcion,
        precio: precio !== undefined ? precio : 0,
        stock: stock !== undefined ? stock : 0
      });

      res.status(201).json({ success: true, message: 'Producto registrado exitosamente.', data: nuevoProducto });
    } catch (error) {
      console.error('Error en productoController.create:', error);
      res.status(500).json({ success: false, message: 'Error al registrar el producto.', error: error.message });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { id_categoria, id_proveedor, nombre, descripcion, precio, stock } = req.body;

      const productoExistente = await productoModel.getById(id);
      if (!productoExistente) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
      }

      if (!nombre || !nombre.trim()) {
        return res.status(400).json({ success: false, message: 'El nombre del producto es obligatorio.' });
      }
      if (!id_categoria) {
        return res.status(400).json({ success: false, message: 'Debe seleccionar una categoría válida.' });
      }
      if (!id_proveedor) {
        return res.status(400).json({ success: false, message: 'Debe seleccionar un proveedor válido.' });
      }

      const cat = await categoriaModel.getById(id_categoria);
      if (!cat) {
        return res.status(400).json({ success: false, message: 'La categoría seleccionada no existe.' });
      }

      const prov = await proveedorModel.getById(id_proveedor);
      if (!prov) {
        return res.status(400).json({ success: false, message: 'El proveedor seleccionado no existe.' });
      }

      if (precio !== undefined && Number(precio) < 0) {
        return res.status(400).json({ success: false, message: 'El precio no puede ser negativo.' });
      }

      if (stock !== undefined && parseInt(stock, 10) < 0) {
        return res.status(400).json({ success: false, message: 'El stock no puede ser negativo.' });
      }

      const productoActualizado = await productoModel.update(id, {
        id_categoria,
        id_proveedor,
        nombre,
        descripcion,
        precio: precio !== undefined ? precio : productoExistente.precio,
        stock: stock !== undefined ? stock : productoExistente.stock
      });

      res.json({ success: true, message: 'Producto actualizado exitosamente.', data: productoActualizado });
    } catch (error) {
      console.error('Error en productoController.update:', error);
      res.status(500).json({ success: false, message: 'Error al actualizar el producto.', error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const producto = await productoModel.getById(id);
      if (!producto) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
      }

      const totalDetalles = await productoModel.countAssociatedDetails(id);
      if (totalDetalles > 0) {
        return res.status(400).json({
          success: false,
          message: `No se puede eliminar el producto porque tiene ${totalDetalles} movimiento(s) de inventario registrado(s). Para preservar el historial de movimientos, no se permite su eliminación.`
        });
      }

      await productoModel.delete(id);
      res.json({ success: true, message: 'Producto eliminado exitosamente.' });
    } catch (error) {
      console.error('Error en productoController.delete:', error);
      res.status(500).json({ success: false, message: 'Error al eliminar el producto.', error: error.message });
    }
  }
};

module.exports = productoController;

