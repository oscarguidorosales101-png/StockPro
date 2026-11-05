import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Package, AlertTriangle, Layers, Truck, RotateCcw, X } from 'lucide-react';
import { productoService } from '../services/productoService';
import { categoriaService } from '../services/categoriaService';
import { proveedorService } from '../services/proveedorService';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

export default function ProductosPage({ addToast }) {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('todos');
  const [selectedProveedor, setSelectedProveedor] = useState('todos');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    id_categoria: '',
    id_proveedor: '',
    descripcion: '',
    precio: '0.00',
    stock: 0
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productoToDelete, setProductoToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prods, cats, provs] = await Promise.all([
        productoService.getAll(),
        categoriaService.getAll(),
        proveedorService.getAll()
      ]);
      setProductos(prods);
      setCategorias(cats);
      setProveedores(provs);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    if (categorias.length === 0 || proveedores.length === 0) {
      addToast('Debe existir al menos una categoría y un proveedor para crear productos.', 'error');
      return;
    }
    setEditingProducto(null);
    setFormData({
      nombre: '',
      id_categoria: categorias[0]?.id_categoria || '',
      id_proveedor: proveedores[0]?.id_proveedor || '',
      descripcion: '',
      precio: '0.00',
      stock: 0
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProducto(prod);
    setFormData({
      nombre: prod.nombre || '',
      id_categoria: prod.id_categoria || '',
      id_proveedor: prod.id_proveedor || '',
      descripcion: prod.descripcion || '',
      precio: prod.precio || '0.00',
      stock: prod.stock || 0
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      addToast('El nombre del producto es obligatorio.', 'error');
      return;
    }
    if (!formData.id_categoria) {
      addToast('Debe seleccionar una categoría.', 'error');
      return;
    }
    if (!formData.id_proveedor) {
      addToast('Debe seleccionar un proveedor.', 'error');
      return;
    }
    if (Number(formData.precio) < 0) {
      addToast('El precio no puede ser negativo.', 'error');
      return;
    }
    if (parseInt(formData.stock, 10) < 0) {
      addToast('El stock no puede ser negativo.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      if (editingProducto) {
        await productoService.update(editingProducto.id_producto, formData);
        addToast('Producto actualizado exitosamente.');
      } else {
        await productoService.create(formData);
        addToast('Producto registrado exitosamente.');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (prod) => {
    setProductoToDelete(prod);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productoToDelete) return;
    try {
      setDeleting(true);
      await productoService.delete(productoToDelete.id_producto);
      addToast('Producto eliminado exitosamente.');
      setIsDeleteDialogOpen(false);
      setProductoToDelete(null);
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategoria('todos');
    setSelectedProveedor('todos');
  };

  const isFiltered = searchTerm !== '' || selectedCategoria !== 'todos' || selectedProveedor !== 'todos';

  const filtered = productos.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      p.nombre?.toLowerCase().includes(term) ||
      p.descripcion?.toLowerCase().includes(term) ||
      p.categoria_nombre?.toLowerCase().includes(term) ||
      p.proveedor_nombre?.toLowerCase().includes(term);

    const matchesCat = selectedCategoria === 'todos' || String(p.id_categoria) === String(selectedCategoria);
    const matchesProv = selectedProveedor === 'todos' || String(p.id_proveedor) === String(selectedProveedor);

    return matchesSearch && matchesCat && matchesProv;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-info">
          <h2>Catálogo de Productos</h2>
          <p>Control de existencias, precios de venta y detalles de mercancía.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={18} />
          Nuevo Producto
        </button>
      </div>

      <div className="card">
        <div className="filter-bar">
          <div className="filter-controls">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Buscar por nombre, categoría o proveedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchTerm('')}
                  title="Borrar texto"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="select-filter-wrapper">
              <select
                className="select-filter"
                value={selectedCategoria}
                onChange={(e) => setSelectedCategoria(e.target.value)}
                aria-label="Filtrar por categoría"
              >
                <option value="todos">Todas las categorías</option>
                {categorias.map((c) => (
                  <option key={c.id_categoria} value={c.id_categoria}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="select-filter-wrapper">
              <select
                className="select-filter"
                value={selectedProveedor}
                onChange={(e) => setSelectedProveedor(e.target.value)}
                aria-label="Filtrar por proveedor"
              >
                <option value="todos">Todos los proveedores</option>
                {proveedores.map((pr) => (
                  <option key={pr.id_proveedor} value={pr.id_proveedor}>
                    {pr.nombre}
                  </option>
                ))}
              </select>
            </div>

            {isFiltered && (
              <button
                type="button"
                className="btn-clear-filter"
                onClick={handleClearFilters}
                title="Restablecer filtros"
              >
                <RotateCcw size={13} />
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="filter-actions">
            <span className="filter-count-badge">
              Mostrando {filtered.length} de {productos.length} productos
            </span>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Proveedor</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado Stock</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem' }}>
                    Cargando productos...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8">
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <Package size={24} />
                      </div>
                      <h4>No hay productos registrados</h4>
                      <p>Comienza creando un producto asociado a tus categorías y proveedores.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => (
                  <tr key={prod.id_producto}>
                    <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{prod.id_producto}</td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{prod.nombre}</div>
                        {prod.descripcion && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{prod.descripcion}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-purple">{prod.categoria_nombre}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>{prod.proveedor_nombre}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      ₡{Number(prod.precio).toLocaleString('es-CR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ fontWeight: 700, fontSize: '0.95rem' }}>{prod.stock}</td>
                    <td>
                      <span
                        className={`badge ${
                          prod.stock <= 5
                            ? 'badge-danger'
                            : prod.stock <= 15
                            ? 'badge-warning'
                            : 'badge-success'
                        }`}
                      >
                        {prod.stock <= 5 ? 'Crítico (≤5)' : prod.stock <= 15 ? 'Bajo (≤15)' : 'Óptimo'}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="action-btn"
                          title="Editar producto"
                          onClick={() => handleOpenEdit(prod)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="action-btn delete"
                          title="Eliminar producto"
                          onClick={() => handleOpenDelete(prod)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Formulario Producto */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProducto ? 'Editar Producto' : 'Registrar Nuevo Producto'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">
              Nombre del producto <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: Aceite de Girasol 1L"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
              maxLength={120}
            />
          </div>

          <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">
                Categoría <span className="required">*</span>
              </label>
              <select
                className="form-select"
                value={formData.id_categoria}
                onChange={(e) => setFormData({ ...formData, id_categoria: e.target.value })}
                required
              >
                <option value="" disabled>Seleccione categoría</option>
                {categorias.map((c) => (
                  <option key={c.id_categoria} value={c.id_categoria}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Proveedor <span className="required">*</span>
              </label>
              <select
                className="form-select"
                value={formData.id_proveedor}
                onChange={(e) => setFormData({ ...formData, id_proveedor: e.target.value })}
                required
              >
                <option value="" disabled>Seleccione proveedor</option>
                {proveedores.map((pr) => (
                  <option key={pr.id_proveedor} value={pr.id_proveedor}>
                    {pr.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Precio Unitario (₡)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                placeholder="0.00"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Stock en Inventario</label>
              <input
                type="number"
                min="0"
                className="form-input"
                placeholder="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              />
              <span className="form-helper">Los movimientos de entrada y salida actualizarán este valor automáticamente.</span>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Descripción o Especificaciones</label>
            <textarea
              className="form-textarea"
              placeholder="Detalles del empaque, volumen, marca o notas del producto..."
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              maxLength={255}
            />
          </div>

          <div className="modal-footer" style={{ margin: '1rem -1.5rem -1.5rem -1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Guardando...' : editingProducto ? 'Guardar Cambios' : 'Registrar Producto'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmar Eliminación */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Producto"
        message={`¿Está seguro de que desea eliminar el producto "${productoToDelete?.nombre}"?`}
        isLoading={deleting}
      />
    </div>
  );
}

