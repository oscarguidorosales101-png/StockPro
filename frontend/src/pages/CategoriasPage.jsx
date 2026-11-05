import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Boxes, Filter, RotateCcw, X } from 'lucide-react';
import { categoriaService } from '../services/categoriaService';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

export default function CategoriasPage({ addToast }) {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('todos');

  // Modal create/edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    estado: true
  });
  const [submitting, setSubmitting] = useState(false);

  // Confirm delete
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const data = await categoriaService.getAll();
      setCategorias(data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({ nombre: '', descripcion: '', estado: true });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      nombre: cat.nombre || '',
      descripcion: cat.descripcion || '',
      estado: Boolean(cat.estado)
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      addToast('El nombre de la categoría es obligatorio.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      if (editingCategory) {
        await categoriaService.update(editingCategory.id_categoria, formData);
        addToast('Categoría actualizada con éxito.');
      } else {
        await categoriaService.create(formData);
        addToast('Categoría creada con éxito.');
      }
      setIsModalOpen(false);
      fetchCategorias();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (cat) => {
    setCategoryToDelete(cat);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      setDeleting(true);
      await categoriaService.delete(categoryToDelete.id_categoria);
      addToast('Categoría eliminada correctamente.');
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
      fetchCategorias();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedEstado('todos');
  };

  const isFiltered = searchTerm !== '' || selectedEstado !== 'todos';

  const filtered = categorias.filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      c.nombre?.toLowerCase().includes(term) ||
      c.descripcion?.toLowerCase().includes(term);

    const matchesEstado =
      selectedEstado === 'todos' ||
      (selectedEstado === 'activos' && Boolean(c.estado)) ||
      (selectedEstado === 'inactivos' && !Boolean(c.estado));

    return matchesSearch && matchesEstado;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-info">
          <h2>Categorías de Productos</h2>
          <p>Organiza los artículos del inventario en clasificaciones comerciales.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={18} />
          Nueva Categoría
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
                placeholder="Buscar categoría por nombre o descripción..."
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
                value={selectedEstado}
                onChange={(e) => setSelectedEstado(e.target.value)}
                aria-label="Filtrar por estado"
              >
                <option value="todos">Todos los estados</option>
                <option value="activos">Solo activas</option>
                <option value="inactivos">Solo inactivas</option>
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
              Mostrando {filtered.length} de {categorias.length} categorías
            </span>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Productos</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem' }}>
                    Cargando categorías...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <Boxes size={24} />
                      </div>
                      <h4>No se encontraron categorías</h4>
                      <p>Puedes registrar una nueva categoría haciendo clic en el botón superior.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((cat) => (
                  <tr key={cat.id_categoria}>
                    <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{cat.id_categoria}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{cat.nombre}</td>
                    <td style={{ color: 'var(--text-body)' }}>{cat.descripcion || '—'}</td>
                    <td>
                      <span className="badge badge-purple">
                        {cat.total_productos || 0} producto(s)
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${cat.estado ? 'badge-success' : 'badge-neutral'}`}>
                        {cat.estado ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="action-btn"
                          title="Editar categoría"
                          onClick={() => handleOpenEdit(cat)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="action-btn delete"
                          title="Eliminar categoría"
                          onClick={() => handleOpenDelete(cat)}
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

      {/* Modal Formulario Categoría */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Editar Categoría' : 'Registrar Nueva Categoría'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">
              Nombre de la categoría <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: Abarrotes, Bebidas, Lácteos..."
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
              maxLength={100}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Descripción</label>
            <textarea
              className="form-textarea"
              placeholder="Breve descripción o notas sobre la categoría..."
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              maxLength={255}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="checkbox-label">
              <input
                type="checkbox"
                className="checkbox-custom"
                checked={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.checked })}
              />
              Categoría Activa (habilitada para asignar nuevos productos)
            </label>
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
              {submitting ? 'Guardando...' : editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmar Eliminación */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Categoría"
        message={`¿Está seguro de que desea eliminar la categoría "${categoryToDelete?.nombre}"?`}
        isLoading={deleting}
      />
    </div>
  );
}

