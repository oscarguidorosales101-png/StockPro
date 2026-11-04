import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  Calendar,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { clienteService } from '../services/clienteService';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

export default function ClientesPage({ addToast }) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('todos');
  const [selectedEstado, setSelectedEstado] = useState('todos');

  // Modal create/edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [formData, setFormData] = useState({
    tipo_cliente: 'persona',
    nombre: '',
    identificacion: '',
    telefono: '',
    correo: '',
    direccion: '',
    estado: true
  });
  const [submitting, setSubmitting] = useState(false);

  // Confirm delete
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const data = await clienteService.getAll({
        search: searchTerm,
        tipo_cliente: selectedTipo,
        estado: selectedEstado
      });
      setClientes(data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchClientes();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedTipo, selectedEstado]);

  const handleOpenCreate = (tipo = 'persona') => {
    setEditingCliente(null);
    setFormData({
      tipo_cliente: tipo,
      nombre: '',
      identificacion: '',
      telefono: '',
      correo: '',
      direccion: '',
      estado: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cli) => {
    setEditingCliente(cli);
    setFormData({
      tipo_cliente: cli.tipo_cliente || 'persona',
      nombre: cli.nombre || '',
      identificacion: cli.identificacion || '',
      telefono: cli.telefono || '',
      correo: cli.correo || '',
      direccion: cli.direccion || '',
      estado: Boolean(cli.estado)
    });
    setIsModalOpen(true);
  };

  const handleToggleEstado = async (cli) => {
    try {
      const res = await clienteService.toggleEstado(cli.id_cliente);
      addToast(res.message || 'Estado actualizado.');
      fetchClientes();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      addToast('El nombre o razón social es obligatorio.', 'error');
      return;
    }
    if (!formData.identificacion.trim()) {
      addToast('El número de identificación es obligatorio.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      if (editingCliente) {
        await clienteService.update(editingCliente.id_cliente, formData);
        addToast('Cliente actualizado con éxito.');
      } else {
        await clienteService.create(formData);
        addToast('Cliente registrado con éxito.');
      }
      setIsModalOpen(false);
      fetchClientes();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (cli) => {
    setClienteToDelete(cli);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!clienteToDelete) return;
    try {
      setDeleting(true);
      await clienteService.delete(clienteToDelete.id_cliente);
      addToast('Cliente eliminado exitosamente.');
      setIsDeleteDialogOpen(false);
      setClienteToDelete(null);
      fetchClientes();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-info">
          <h2>Gestión de Clientes</h2>
          <p>Registro y control de personas y empresas asociadas a los despachos de mercancía.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline-purple" onClick={() => handleOpenCreate('empresa')}>
            <Building2 size={17} />
            Nueva Empresa
          </button>
          <button className="btn btn-primary" onClick={() => handleOpenCreate('persona')}>
            <User size={17} />
            Nueva Persona
          </button>
        </div>
      </div>

      <div className="card">
        {/* Filtros de consulta */}
        <div className="filter-bar">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por nombre, cédula/identificación o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select
              className="select-filter"
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
            >
              <option value="todos">Todos los tipos</option>
              <option value="persona">Personas</option>
              <option value="empresa">Empresas</option>
            </select>

            <select
              className="select-filter"
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>
        </div>

        {/* Tabla de Clientes */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Nombre / Razón Social</th>
                <th>Identificación</th>
                <th>Contacto</th>
                <th>Movimientos</th>
                <th>Estado</th>
                <th>Fecha Registro</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem' }}>
                    Cargando clientes...
                  </td>
                </tr>
              ) : clientes.length === 0 ? (
                <tr>
                  <td colSpan="9">
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <Users size={24} />
                      </div>
                      <h4>No se encontraron clientes</h4>
                      <p>No hay registros que coincidan con los filtros de búsqueda actuales.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                clientes.map((cli) => {
                  const isEmpresa = cli.tipo_cliente === 'empresa';
                  return (
                    <tr key={cli.id_cliente}>
                      <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{cli.id_cliente}</td>
                      <td>
                        <span className={`badge ${isEmpresa ? 'badge-indigo' : 'badge-purple'}`}>
                          {isEmpresa ? <Building2 size={13} /> : <User size={13} />}
                          {isEmpresa ? 'Empresa' : 'Persona'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{cli.nombre}</div>
                        {cli.direccion && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '2px' }}>
                            <MapPin size={12} />
                            {cli.direccion}
                          </div>
                        )}
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-body)' }}>
                        {cli.identificacion}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          {cli.telefono && (
                            <span style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Phone size={12} color="var(--primary)" />
                              {cli.telefono}
                            </span>
                          )}
                          {cli.correo && (
                            <span style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}>
                              <Mail size={12} />
                              {cli.correo}
                            </span>
                          )}
                          {!cli.telefono && !cli.correo && <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>—</span>}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-neutral">
                          {cli.total_movimientos || 0} mov.
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleEstado(cli)}
                          title="Clic para cambiar estado"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}
                        >
                          <span className={`badge ${cli.estado ? 'badge-success' : 'badge-neutral'}`}>
                            {cli.estado ? <CheckCircle size={12} /> : <XCircle size={12} />}
                            {cli.estado ? 'Activo' : 'Inactivo'}
                          </span>
                        </button>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {cli.fecha_registro
                          ? new Date(cli.fecha_registro).toLocaleDateString('es-ES')
                          : '—'}
                      </td>
                      <td>
                        <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                          <button
                            className="action-btn"
                            title="Editar cliente"
                            onClick={() => handleOpenEdit(cli)}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="action-btn delete"
                            title="Eliminar cliente"
                            onClick={() => handleOpenDelete(cli)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Formulario Cliente */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCliente ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          {/* Selector de Tipo de Cliente */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
              Tipo de Cliente <span className="required">*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                className={`btn ${formData.tipo_cliente === 'persona' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ justifyContent: 'flex-start' }}
                onClick={() => setFormData({ ...formData, tipo_cliente: 'persona' })}
              >
                <User size={18} />
                Persona Individual
              </button>
              <button
                type="button"
                className={`btn ${formData.tipo_cliente === 'empresa' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ justifyContent: 'flex-start' }}
                onClick={() => setFormData({ ...formData, tipo_cliente: 'empresa' })}
              >
                <Building2 size={18} />
                Empresa o Negocio
              </button>
            </div>
          </div>

          <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">
                {formData.tipo_cliente === 'empresa' ? 'Razón Social o Nombre Comercial' : 'Nombre Completo'}{' '}
                <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={formData.tipo_cliente === 'empresa' ? 'Ej: Supermercado La Unión S.A.' : 'Ej: Juan Carlos Pérez'}
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
                maxLength={150}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                {formData.tipo_cliente === 'empresa' ? 'Cédula Jurídica / Tax ID' : 'Cédula / Identificación'}{' '}
                <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={formData.tipo_cliente === 'empresa' ? 'Ej: 3-101-123456' : 'Ej: 1-1234-0567'}
                value={formData.identificacion}
                onChange={(e) => setFormData({ ...formData, identificacion: e.target.value })}
                required
                maxLength={30}
              />
              <span className="form-helper">Se valida automáticamente para evitar duplicados.</span>
            </div>
          </div>

          <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej: +506 8888-9999"
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
                placeholder="cliente@ejemplo.com"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                maxLength={120}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Dirección Física</label>
            <textarea
              className="form-textarea"
              placeholder="Provincia, cantón, señas exactas..."
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
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
              Cliente Activo (habilitado para asociar salidas de mercancía)
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
              {submitting ? 'Guardando...' : editingCliente ? 'Guardar Cambios' : 'Registrar Cliente'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmar Eliminación */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Cliente"
        message={`¿Está seguro de que desea eliminar al cliente "${clienteToDelete?.nombre}" (${clienteToDelete?.identificacion})?`}
        isLoading={deleting}
      />
    </div>
  );
}

