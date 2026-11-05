import React, { useState, useEffect } from 'react';
import {
  Search,
  Edit2,
  Trash2,
  ClipboardList,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
  Package,
  Plus,
  RotateCcw,
  X
} from 'lucide-react';
import { detalleMovimientoService } from '../services/detalleMovimientoService';
import { movimientoService } from '../services/movimientoService';
import { productoService } from '../services/productoService';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

export default function DetalleMovimientosPage({ addToast }) {
  const [detalles, setDetalles] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMovimiento, setSelectedMovimiento] = useState('todos');
  const [selectedProducto, setSelectedProducto] = useState('todos');

  // Modal create/edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDetalle, setEditingDetalle] = useState(null);
  const [formData, setFormData] = useState({
    id_movimiento: '',
    id_producto: '',
    cantidad: 1
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [detalleToDelete, setDetalleToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dets, movs, prods] = await Promise.all([
        detalleMovimientoService.getAll(),
        movimientoService.getAll(),
        productoService.getAll()
      ]);
      setDetalles(dets);
      setMovimientos(movs);
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
    if (movimientos.length === 0 || productos.length === 0) {
      addToast('Se requiere al menos un movimiento y un producto para registrar un detalle.', 'error');
      return;
    }
    setEditingDetalle(null);
    setFormData({
      id_movimiento: movimientos[0]?.id_movimiento || '',
      id_producto: productos[0]?.id_producto || '',
      cantidad: 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (det) => {
    setEditingDetalle(det);
    setFormData({
      id_movimiento: det.id_movimiento,
      id_producto: det.id_producto,
      cantidad: det.cantidad
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_producto) {
      addToast('Debe seleccionar un producto.', 'error');
      return;
    }
    if (Number(formData.cantidad) === 0) {
      addToast('La cantidad debe ser distinta de cero.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      if (editingDetalle) {
        await detalleMovimientoService.update(editingDetalle.id_detalle, {
          id_producto: Number(formData.id_producto),
          cantidad: Number(formData.cantidad)
        });
        addToast('Línea de detalle actualizada y stock recalculado.');
      } else {
        await detalleMovimientoService.create({
          id_movimiento: Number(formData.id_movimiento),
          id_producto: Number(formData.id_producto),
          cantidad: Number(formData.cantidad)
        });
        addToast('Línea de detalle añadida exitosamente.');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (det) => {
    setDetalleToDelete(det);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!detalleToDelete) return;
    try {
      setDeleting(true);
      await detalleMovimientoService.delete(detalleToDelete.id_detalle);
      addToast('Detalle eliminado y reversión aplicada.');
      setIsDeleteDialogOpen(false);
      setDetalleToDelete(null);
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = detalles.filter((d) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      d.producto_nombre?.toLowerCase().includes(term) ||
      (d.cliente_nombre && d.cliente_nombre.toLowerCase().includes(term)) ||
      String(d.id_movimiento).includes(term) ||
      String(d.id_detalle).includes(term);

    const matchesMov = selectedMovimiento === 'todos' || String(d.id_movimiento) === String(selectedMovimiento);
    const matchesProd = selectedProducto === 'todos' || String(d.id_producto) === String(selectedProducto);

    return matchesSearch && matchesMov && matchesProd;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-info">
          <h2>Detalles de Movimientos</h2>
          <p>Consulta y desglose detallado de los productos registrados en cada operación de inventario.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={18} />
          Agregar Línea a Movimiento
        </button>
      </div>

      <div className="card">
        {/* Barra de Filtros */}
        <div className="filter-bar">
          <div className="filter-controls">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Buscar por producto, cliente o # movimiento..."
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
                value={selectedMovimiento}
                onChange={(e) => setSelectedMovimiento(e.target.value)}
                aria-label="Filtrar por movimiento"
              >
                <option value="todos">Todos los movimientos</option>
                {movimientos.map((m) => (
                  <option key={m.id_movimiento} value={m.id_movimiento}>
                    Movimiento #{m.id_movimiento} ({m.tipo.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div className="select-filter-wrapper">
              <select
                className="select-filter"
                value={selectedProducto}
                onChange={(e) => setSelectedProducto(e.target.value)}
                aria-label="Filtrar por producto"
              >
                <option value="todos">Todos los productos</option>
                {productos.map((p) => (
                  <option key={p.id_producto} value={p.id_producto}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            {(searchTerm !== '' || selectedMovimiento !== 'todos' || selectedProducto !== 'todos') && (
              <button
                type="button"
                className="btn-clear-filter"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedMovimiento('todos');
                  setSelectedProducto('todos');
                }}
                title="Restablecer filtros"
              >
                <RotateCcw size={13} />
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="filter-actions">
            <span className="filter-count-badge">
              Mostrando {filtered.length} de {detalles.length} líneas
            </span>
          </div>
        </div>

        {/* Tabla de Detalles */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID Detalle</th>
                <th>Movimiento</th>
                <th>Tipo</th>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Cantidad</th>
                <th>Stock Actual</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem' }}>
                    Cargando registros detallados...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="9">
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <ClipboardList size={24} />
                      </div>
                      <h4>No se encontraron líneas de detalle</h4>
                      <p>Los movimientos registrados aparecerán desglosados aquí producto por producto.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id_detalle}>
                    <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{d.id_detalle}</td>
                    <td>
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Movimiento #{d.id_movimiento}</span>
                        {d.cliente_nombre && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Cliente: {d.cliente_nombre}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          d.movimiento_tipo === 'entrada'
                            ? 'badge-success'
                            : d.movimiento_tipo === 'salida'
                            ? 'badge-warning'
                            : 'badge-purple'
                        }`}
                      >
                        {d.movimiento_tipo === 'entrada' && <ArrowUpRight size={13} />}
                        {d.movimiento_tipo === 'salida' && <ArrowDownRight size={13} />}
                        {d.movimiento_tipo === 'ajuste' && <SlidersHorizontal size={13} />}
                        {d.movimiento_tipo?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                      {d.movimiento_fecha ? new Date(d.movimiento_fecha).toLocaleDateString('es-ES') : '—'}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{d.producto_nombre}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Precio: ₡{Number(d.producto_precio).toLocaleString('es-CR')}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-purple">{d.categoria_nombre}</span>
                    </td>
                    <td style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                      <span
                        style={{
                          color:
                            d.movimiento_tipo === 'salida'
                              ? 'var(--warning)'
                              : d.movimiento_tipo === 'entrada'
                              ? 'var(--success)'
                              : 'var(--primary)'
                        }}
                      >
                        {d.movimiento_tipo === 'salida' ? `-${Math.abs(d.cantidad)}` : `+${d.cantidad}`} uds
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{d.producto_stock_actual} uds</td>
                    <td>
                      <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="action-btn"
                          title="Editar este detalle"
                          onClick={() => handleOpenEdit(d)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="action-btn delete"
                          title="Eliminar este detalle"
                          onClick={() => handleOpenDelete(d)}
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

      {/* Modal Crear / Editar Detalle */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDetalle ? `Editar Detalle #${editingDetalle.id_detalle}` : 'Agregar Línea a Movimiento'}
      >
        <form onSubmit={handleSubmit}>
          {!editingDetalle && (
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">
                Movimiento Destino <span className="required">*</span>
              </label>
              <select
                className="form-select"
                value={formData.id_movimiento}
                onChange={(e) => setFormData({ ...formData, id_movimiento: e.target.value })}
                required
              >
                {movimientos.map((m) => (
                  <option key={m.id_movimiento} value={m.id_movimiento}>
                    Movimiento #{m.id_movimiento} ({m.tipo.toUpperCase()}) — {new Date(m.fecha).toLocaleDateString('es-ES')}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">
              Producto <span className="required">*</span>
            </label>
            <select
              className="form-select"
              value={formData.id_producto}
              onChange={(e) => setFormData({ ...formData, id_producto: e.target.value })}
              required
            >
              {productos.map((p) => (
                <option key={p.id_producto} value={p.id_producto}>
                  {p.nombre} — Stock actual: {p.stock} uds
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">
              Cantidad en Detalle <span className="required">*</span>
            </label>
            <input
              type="number"
              className="form-input"
              value={formData.cantidad}
              onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
              required
            />
            <span className="form-helper">
              El stock del producto se ajustará automáticamente respetando la consistencia del inventario.
            </span>
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
              {submitting ? 'Guardando...' : editingDetalle ? 'Actualizar Detalle' : 'Agregar Detalle'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmar Eliminación */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Detalle de Movimiento"
        message={`¿Está seguro de que desea eliminar el detalle #${detalleToDelete?.id_detalle}? El stock del producto será revertido.`}
        isLoading={deleting}
      />
    </div>
  );
}

