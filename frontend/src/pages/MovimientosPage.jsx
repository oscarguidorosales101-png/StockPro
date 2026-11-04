import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  ArrowLeftRight,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
  Calendar,
  User,
  Package,
  AlertCircle
} from 'lucide-react';
import { movimientoService } from '../services/movimientoService';
import { clienteService } from '../services/clienteService';
import { productoService } from '../services/productoService';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

export default function MovimientosPage({ addToast }) {
  const [movimientos, setMovimientos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedTipo, setSelectedTipo] = useState('todos');
  const [selectedCliente, setSelectedCliente] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // View Details Modal
  const [viewingMovimiento, setViewingMovimiento] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Create/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovimiento, setEditingMovimiento] = useState(null);
  const [formData, setFormData] = useState({
    tipo: 'entrada',
    id_cliente: '',
    fecha: '',
    observacion: '',
    detalles: []
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [movimientoToDelete, setMovimientoToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [movs, cls, prods] = await Promise.all([
        movimientoService.getAll(),
        clienteService.getAll(),
        productoService.getAll()
      ]);
      setMovimientos(movs);
      setClientes(cls);
      setProductos(prods);
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
    if (productos.length === 0) {
      addToast('Debe haber al menos un producto en el catálogo para registrar movimientos.', 'error');
      return;
    }

    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    setEditingMovimiento(null);
    setFormData({
      tipo: 'entrada',
      id_cliente: '',
      fecha: localDateTime,
      observacion: '',
      detalles: [
        {
          id_producto: productos[0]?.id_producto || '',
          cantidad: 1,
          ajuste_signo: 1 // 1 para sumar, -1 para restar (en caso de ajuste)
        }
      ]
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (mov) => {
    try {
      const fullMov = await movimientoService.getById(mov.id_movimiento);
      setEditingMovimiento(fullMov);

      const formattedDate = fullMov.fecha ? new Date(fullMov.fecha).toISOString().slice(0, 16) : '';

      setFormData({
        tipo: fullMov.tipo,
        id_cliente: fullMov.id_cliente || '',
        fecha: formattedDate,
        observacion: fullMov.observacion || '',
        detalles: (fullMov.detalles || []).map((d) => ({
          id_producto: d.id_producto,
          cantidad: Math.abs(d.cantidad),
          ajuste_signo: d.cantidad < 0 ? -1 : 1
        }))
      });
      setIsModalOpen(true);
    } catch (err) {
      addToast('Error al cargar datos del movimiento: ' + err.message, 'error');
    }
  };

  const handleOpenView = async (mov) => {
    try {
      const fullMov = await movimientoService.getById(mov.id_movimiento);
      setViewingMovimiento(fullMov);
      setIsViewModalOpen(true);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Detalle rows handlers
  const handleAddRow = () => {
    if (productos.length === 0) return;
    setFormData({
      ...formData,
      detalles: [
        ...formData.detalles,
        {
          id_producto: productos[0].id_producto,
          cantidad: 1,
          ajuste_signo: 1
        }
      ]
    });
  };

  const handleRemoveRow = (index) => {
    if (formData.detalles.length <= 1) {
      addToast('El movimiento debe conservar al menos un producto en el detalle.', 'error');
      return;
    }
    const updated = [...formData.detalles];
    updated.splice(index, 1);
    setFormData({ ...formData, detalles: updated });
  };

  const handleRowChange = (index, field, value) => {
    const updated = [...formData.detalles];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, detalles: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.detalles.length === 0) {
      addToast('Debe incluir al menos un producto.', 'error');
      return;
    }

    // Preparar detalles finales considerando signo para ajustes
    const payloadDetalles = formData.detalles.map((d) => {
      let cant = Math.abs(Number(d.cantidad)) || 1;
      if (formData.tipo === 'ajuste' && d.ajuste_signo === -1) {
        cant = -cant;
      }
      return {
        id_producto: Number(d.id_producto),
        cantidad: cant
      };
    });

    // Validación preliminar de salidas en frontend para advertir amigablemente
    if (formData.tipo === 'salida') {
      for (const item of payloadDetalles) {
        const prod = productos.find((p) => p.id_producto === item.id_producto);
        if (prod && item.cantidad > prod.stock && !editingMovimiento) {
          addToast(
            `Stock insuficiente para "${prod.nombre}". Stock disponible: ${prod.stock}, solicitado: ${item.cantidad}.`,
            'error'
          );
          return;
        }
      }
    }

    const payload = {
      tipo: formData.tipo,
      id_cliente: formData.id_cliente ? Number(formData.id_cliente) : null,
      fecha: formData.fecha || new Date(),
      observacion: formData.observacion,
      detalles: payloadDetalles
    };

    try {
      setSubmitting(true);
      if (editingMovimiento) {
        await movimientoService.update(editingMovimiento.id_movimiento, payload);
        addToast('Movimiento actualizado y stock recalculado.');
      } else {
        await movimientoService.create(payload);
        addToast('Movimiento registrado e inventario actualizado.');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (mov) => {
    setMovimientoToDelete(mov);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!movimientoToDelete) return;
    try {
      setDeleting(true);
      await movimientoService.delete(movimientoToDelete.id_movimiento);
      addToast('Movimiento eliminado y reversión de inventario aplicada.');
      setIsDeleteDialogOpen(false);
      setMovimientoToDelete(null);
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = movimientos.filter((m) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (m.cliente_nombre && m.cliente_nombre.toLowerCase().includes(term)) ||
      (m.observacion && m.observacion.toLowerCase().includes(term)) ||
      String(m.id_movimiento).includes(term);

    const matchesTipo = selectedTipo === 'todos' || m.tipo === selectedTipo;
    const matchesCliente =
      selectedCliente === 'todos' ||
      (selectedCliente === 'sin_cliente' && !m.id_cliente) ||
      String(m.id_cliente) === String(selectedCliente);

    return matchesSearch && matchesTipo && matchesCliente;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-info">
          <h2>Movimientos de Inventario</h2>
          <p>Control de entradas, salidas y ajustes de stock con actualización transaccional.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={18} />
          Nuevo Movimiento
        </button>
      </div>

      <div className="card">
        {/* Barra de Filtros */}
        <div className="filter-bar">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por ID, cliente u observación..."
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
              <option value="entrada">Entradas (+)</option>
              <option value="salida">Salidas (-)</option>
              <option value="ajuste">Ajustes Internos</option>
            </select>

            <select
              className="select-filter"
              value={selectedCliente}
              onChange={(e) => setSelectedCliente(e.target.value)}
            >
              <option value="todos">Todos los clientes</option>
              <option value="sin_cliente">Sin cliente asociado</option>
              {clientes.map((c) => (
                <option key={c.id_cliente} value={c.id_cliente}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabla de Movimientos */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha y Hora</th>
                <th>Tipo</th>
                <th>Cliente Asociado</th>
                <th>Observación</th>
                <th>Líneas</th>
                <th>Total Unidades</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem' }}>
                    Cargando movimientos...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8">
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <ArrowLeftRight size={24} />
                      </div>
                      <h4>No se encontraron movimientos</h4>
                      <p>Registra un nuevo movimiento para controlar las existencias de mercancía.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id_movimiento}>
                    <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{m.id_movimiento}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem' }}>
                        {new Date(m.fecha).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(m.fecha).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          m.tipo === 'entrada'
                            ? 'badge-success'
                            : m.tipo === 'salida'
                            ? 'badge-warning'
                            : 'badge-purple'
                        }`}
                      >
                        {m.tipo === 'entrada' && <ArrowUpRight size={13} />}
                        {m.tipo === 'salida' && <ArrowDownRight size={13} />}
                        {m.tipo === 'ajuste' && <SlidersHorizontal size={13} />}
                        {m.tipo.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {m.cliente_nombre ? (
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{m.cliente_nombre}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {m.tipo_cliente === 'empresa' ? 'Empresa' : 'Persona'} &bull; {m.cliente_identificacion}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sin cliente (Interno)</span>
                      )}
                    </td>
                    <td style={{ maxWidth: '240px', fontSize: '0.85rem' }}>
                      {m.observacion || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td>
                      <span className="badge badge-neutral">{m.total_items} producto(s)</span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      {m.total_unidades} uds
                    </td>
                    <td>
                      <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="action-btn"
                          title="Ver detalles de productos"
                          onClick={() => handleOpenView(m)}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="action-btn"
                          title="Editar movimiento"
                          onClick={() => handleOpenEdit(m)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="action-btn delete"
                          title="Eliminar movimiento"
                          onClick={() => handleOpenDelete(m)}
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

      {/* Modal Crear / Editar Movimiento */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMovimiento ? `Editar Movimiento #${editingMovimiento.id_movimiento}` : 'Registrar Nuevo Movimiento'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">
                Tipo de Movimiento <span className="required">*</span>
              </label>
              <select
                className="form-select"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                required
              >
                <option value="entrada">Entrada de Mercancía (Aumenta stock)</option>
                <option value="salida">Salida de Mercancía (Disminuye stock)</option>
                <option value="ajuste">Ajuste Interno (Corrección física)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Cliente Asociado (Opcional)</label>
              <select
                className="form-select"
                value={formData.id_cliente}
                onChange={(e) => setFormData({ ...formData, id_cliente: e.target.value })}
              >
                <option value="">Sin cliente (Operación interna o compra)</option>
                {clientes.map((c) => (
                  <option key={c.id_cliente} value={c.id_cliente}>
                    {c.nombre} ({c.tipo_cliente === 'empresa' ? 'Empresa' : 'Persona'} - {c.identificacion})
                  </option>
                ))}
              </select>
              <span className="form-helper">Recomendado para salidas y entregas comerciales.</span>
            </div>
          </div>

          <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Fecha y Hora</label>
              <input
                type="datetime-local"
                className="form-input"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Observación o Motivo</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej: Factura #402, despacho cliente o conteo cíclico..."
                value={formData.observacion}
                onChange={(e) => setFormData({ ...formData, observacion: e.target.value })}
                maxLength={255}
              />
            </div>
          </div>

          {/* Constructor Dinámico de Detalles de Movimiento */}
          <div className="movement-items-builder">
            <div className="builder-header">
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Productos a incluir ({formData.detalles.length})
              </span>
              <button
                type="button"
                className="btn btn-sm btn-outline-purple"
                onClick={handleAddRow}
              >
                <Plus size={14} />
                Agregar Producto
              </button>
            </div>

            {formData.detalles.map((row, index) => {
              const currentProd = productos.find((p) => p.id_producto === Number(row.id_producto));
              const isOverStock = formData.tipo === 'salida' && currentProd && Number(row.cantidad) > currentProd.stock;

              return (
                <div key={index} className="builder-row">
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                      Producto
                    </label>
                    <select
                      className="form-select"
                      value={row.id_producto}
                      onChange={(e) => handleRowChange(index, 'id_producto', Number(e.target.value))}
                      required
                    >
                      {productos.map((p) => (
                        <option key={p.id_producto} value={p.id_producto}>
                          {p.nombre} — [Stock: {p.stock} uds]
                        </option>
                      ))}
                    </select>
                    {currentProd && (
                      <span style={{ fontSize: '0.72rem', color: isOverStock ? 'var(--danger)' : 'var(--text-muted)' }}>
                        Disponible: {currentProd.stock} uds &bull; Precio: ₡{Number(currentProd.precio).toLocaleString('es-CR')}
                      </span>
                    )}
                  </div>

                  {formData.tipo === 'ajuste' && (
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                        Acción Ajuste
                      </label>
                      <select
                        className="form-select"
                        value={row.ajuste_signo}
                        onChange={(e) => handleRowChange(index, 'ajuste_signo', Number(e.target.value))}
                      >
                        <option value={1}>(+) Sumar al stock</option>
                        <option value={-1}>(-) Restar del stock</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                      Cantidad
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="form-input"
                      value={row.cantidad}
                      onChange={(e) => handleRowChange(index, 'cantidad', e.target.value)}
                      required
                    />
                    {isOverStock && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <AlertCircle size={11} /> Excede stock disponible
                      </span>
                    )}
                  </div>

                  <div style={{ alignSelf: 'center', paddingTop: '16px' }}>
                    <button
                      type="button"
                      className="action-btn delete"
                      title="Quitar este producto"
                      onClick={() => handleRemoveRow(index)}
                      disabled={formData.detalles.length <= 1}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
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
              {submitting ? 'Procesando...' : editingMovimiento ? 'Guardar Cambios' : 'Registrar Movimiento'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Ver Detalles de Movimiento */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Detalles del Movimiento #${viewingMovimiento?.id_movimiento || ''}`}
        size="lg"
      >
        {viewingMovimiento && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem', background: 'var(--bg-app)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Fecha y Hora</span>
                <p style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
                  {new Date(viewingMovimiento.fecha).toLocaleString('es-ES')}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Tipo de Operación</span>
                <p style={{ marginTop: '2px' }}>
                  <span className={`badge ${viewingMovimiento.tipo === 'entrada' ? 'badge-success' : viewingMovimiento.tipo === 'salida' ? 'badge-warning' : 'badge-purple'}`}>
                    {viewingMovimiento.tipo.toUpperCase()}
                  </span>
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Cliente Vinculado</span>
                <p style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
                  {viewingMovimiento.cliente_nombre ? `${viewingMovimiento.cliente_nombre} (${viewingMovimiento.cliente_identificacion})` : 'Sin cliente asociado'}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Observación</span>
                <p style={{ color: 'var(--text-main)', marginTop: '2px' }}>
                  {viewingMovimiento.observacion || 'Ninguna observación registrada'}
                </p>
              </div>
            </div>

            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
              Productos en el Movimiento
            </h4>

            <div className="table-container" style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Proveedor</th>
                    <th>Cantidad en Movimiento</th>
                    <th>Stock Actual en Almacén</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingMovimiento.detalles?.map((d) => (
                    <tr key={d.id_detalle}>
                      <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{d.producto_nombre}</td>
                      <td>
                        <span className="badge badge-purple">{d.categoria_nombre}</span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{d.proveedor_nombre}</td>
                      <td style={{ fontWeight: 700, fontSize: '0.95rem', color: viewingMovimiento.tipo === 'salida' ? 'var(--warning)' : 'var(--primary)' }}>
                        {viewingMovimiento.tipo === 'salida' ? `-${Math.abs(d.cantidad)}` : `+${d.cantidad}`} uds
                      </td>
                      <td style={{ fontWeight: 600 }}>{d.producto_stock_actual} uds</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem -1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setIsViewModalOpen(false)}>
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmar Eliminación */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Movimiento"
        message={`¿Está seguro de que desea eliminar el movimiento #${movimientoToDelete?.id_movimiento}? El stock de los productos involucrados será revertido automáticamente.`}
        isLoading={deleting}
      />
    </div>
  );
}

