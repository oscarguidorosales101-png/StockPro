import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Truck, Mail, Phone, MapPin } from 'lucide-react';
import { proveedorService } from '../services/proveedorService';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

export default function ProveedoresPage({ addToast }) {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    correo: '',
    direccion: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [proveedorToDelete, setProveedorToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProveedores = async () => {
    try {
      setLoading(true);
      const data = await proveedorService.getAll();
      setProveedores(data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  const handleOpenCreate = () => {
    setEditingProveedor(null);
    setFormData({ nombre: '', telefono: '', correo: '', direccion: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prov) => {
    setEditingProveedor(prov);
    setFormData({
      nombre: prov.nombre || '',
      telefono: prov.telefono || '',
      correo: prov.correo || '',
      direccion: prov.direccion || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      addToast('El nombre de la empresa o proveedor es obligatorio.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      if (editingProveedor) {
        await proveedorService.update(editingProveedor.id_proveedor, formData);
        addToast('Proveedor actualizado exitosamente.');
      } else {
        await proveedorService.create(formData);
        addToast('Proveedor registrado exitosamente.');
      }
      setIsModalOpen(false);
      fetchProveedores();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (prov) => {
    setProveedorToDelete(prov);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!proveedorToDelete) return;
    try {
      setDeleting(true);
      await proveedorService.delete(proveedorToDelete.id_proveedor);
      addToast('Proveedor eliminado exitosamente.');
      setIsDeleteDialogOpen(false);
      setProveedorToDelete(null);
      fetchProveedores();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = proveedores.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.nombre?.toLowerCase().includes(term) ||
      p.correo?.toLowerCase().includes(term) ||
      p.telefono?.toLowerCase().includes(term) ||
      p.direccion?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-info">
          <h2>Proveedores Comerciales</h2>
          <p>Gestiona empresas distribuidoras y fabricantes que abastecen el inventario.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={18} />
          Nuevo Proveedor
        </button>
      </div>

      <div className="card">
        <div className="filter-bar">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por nombre, correo, teléfono o dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Mostrando {filtered.length} de {proveedores.length} proveedores
          </span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre / Empresa</th>
                <th>Contacto</th>
                <th>Dirección</th>
                <th>Productos</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem' }}>
                    Cargando proveedores...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <Truck size={24} />
                      </div>
                      <h4>No se encontraron proveedores</h4>
                      <p>Agrega un nuevo proveedor para poder asociar productos.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((prov) => (
                  <tr key={prov.id_proveedor}>
                    <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{prov.id_proveedor}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{prov.nombre}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        {prov.correo && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem' }}>
                            <Mail size={13} color="var(--primary)" />
                            {prov.correo}
                          </span>
                        )}
                        {prov.telefono && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            <Phone size={13} />
                            {prov.telefono}
                          </span>
                        )}
                        {!prov.correo && !prov.telefono && <span style={{ color: 'var(--text-muted)' }}>Sin contacto</span>}
                      </div>
                    </td>
                    <td>
                      {prov.direccion ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem' }}>
                          <MapPin size={13} color="var(--text-muted)" />
                          {prov.direccion}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <span className="badge badge-purple">
                        {prov.total_productos || 0} producto(s)
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="action-btn"
                          title="Editar proveedor"
                          onClick={() => handleOpenEdit(prov)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="action-btn delete"
                          title="Eliminar proveedor"
                          onClick={() => handleOpenDelete(prov)}
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

      {/* Modal Formulario Proveedor */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProveedor ? 'Editar Proveedor' : 'Registrar Nuevo Proveedor'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">
              Nombre o Razón Social <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: Distribuidora Alimentos del Valle S.A."
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
              maxLength={120}
            />
          </div>

          <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej: +506 2222-1111"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                maxLength={30}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                className="form-input"
                placeholder="ventas@proveedor.com"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                maxLength={120}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Dirección Física o Bodega</label>
            <textarea
              className="form-textarea"
              placeholder="Ubicación, bodega o detalles de despacho..."
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
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
              {submitting ? 'Guardando...' : editingProveedor ? 'Guardar Cambios' : 'Registrar Proveedor'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmar Eliminación */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Proveedor"
        message={`¿Está seguro de que desea eliminar al proveedor "${proveedorToDelete?.nombre}"?`}
        isLoading={deleting}
      />
    </div>
  );
}

