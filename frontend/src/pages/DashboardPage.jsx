import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Truck,
  Package,
  Users,
  ArrowLeftRight,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';
import { categoriaService } from '../services/categoriaService';
import { proveedorService } from '../services/proveedorService';
import { productoService } from '../services/productoService';
import { clienteService } from '../services/clienteService';
import { movimientoService } from '../services/movimientoService';

export default function DashboardPage({ setActiveTab }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    categorias: 0,
    proveedores: 0,
    productos: 0,
    stockTotal: 0,
    clientesActivos: 0,
    clientesTotal: 0,
    movimientos: 0
  });
  const [productosBajoStock, setProductosBajoStock] = useState([]);
  const [ultimosMovimientos, setUltimosMovimientos] = useState([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [cats, provs, prods, clients, movs] = await Promise.all([
        categoriaService.getAll().catch(() => []),
        proveedorService.getAll().catch(() => []),
        productoService.getAll().catch(() => []),
        clienteService.getAll().catch(() => []),
        movimientoService.getAll().catch(() => [])
      ]);

      const stockTotal = prods.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
      const clientesActivos = clients.filter((c) => Boolean(c.estado)).length;
      const bajoStock = prods.filter((p) => Number(p.stock) <= 15).slice(0, 5);

      setStats({
        categorias: cats.length,
        proveedores: provs.length,
        productos: prods.length,
        stockTotal,
        clientesActivos,
        clientesTotal: clients.length,
        movimientos: movs.length
      });

      setProductosBajoStock(bajoStock);
      setUltimosMovimientos(movs.slice(0, 5));
    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-info">
          <h2>Resumen del Sistema</h2>
          <p>Visión general del inventario, clientes y operaciones registradas en tiempo real.</p>
        </div>
        <button className="btn btn-outline-purple" onClick={loadDashboardData} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card" onClick={() => setActiveTab('productos')} style={{ cursor: 'pointer' }}>
          <div className="kpi-info">
            <span>Productos en Catálogo</span>
            <h3>{stats.productos}</h3>
          </div>
          <div className="kpi-icon">
            <Package size={24} />
          </div>
        </div>

        <div className="kpi-card" onClick={() => setActiveTab('productos')} style={{ cursor: 'pointer' }}>
          <div className="kpi-info">
            <span>Unidades en Stock</span>
            <h3>{stats.stockTotal.toLocaleString()}</h3>
          </div>
          <div className="kpi-icon">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="kpi-card" onClick={() => setActiveTab('clientes')} style={{ cursor: 'pointer' }}>
          <div className="kpi-info">
            <span>Clientes Registrados</span>
            <h3>{stats.clientesActivos} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ {stats.clientesTotal}</span></h3>
          </div>
          <div className="kpi-icon">
            <Users size={24} />
          </div>
        </div>

        <div className="kpi-card" onClick={() => setActiveTab('movimientos')} style={{ cursor: 'pointer' }}>
          <div className="kpi-info">
            <span>Movimientos Totales</span>
            <h3>{stats.movimientos}</h3>
          </div>
          <div className="kpi-icon">
            <ArrowLeftRight size={24} />
          </div>
        </div>
      </div>

      <div className="dashboard-tables-grid">
        {/* Productos con menor stock */}
        <div className="card">
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} color="var(--warning)" />
              Alerta de Stock 
            </h3>
            <button className="btn btn-sm btn-outline-purple" onClick={() => setActiveTab('productos')}>
              Ver todos
            </button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Stock Actual</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {productosBajoStock.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No hay productos con stock crítico en este momento.
                    </td>
                  </tr>
                ) : (
                  productosBajoStock.map((prod) => (
                    <tr key={prod.id_producto}>
                      <td style={{ fontWeight: 600 }}>{prod.nombre}</td>
                      <td>{prod.categoria_nombre}</td>
                      <td style={{ fontWeight: 700, color: prod.stock <= 5 ? 'var(--danger)' : 'var(--warning)' }}>
                        {prod.stock} uds
                      </td>
                      <td>
                        <span className={`badge ${prod.stock <= 5 ? 'badge-danger' : 'badge-warning'}`}>
                          {prod.stock <= 5 ? 'Crítico' : 'Bajo'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Últimos movimientos */}
        <div className="card">
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowLeftRight size={18} color="var(--primary)" />
              Últimos Movimientos
            </h3>
            <button className="btn btn-sm btn-outline-purple" onClick={() => setActiveTab('movimientos')}>
              Ver historial
            </button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Cliente</th>
                  <th>Items</th>
                </tr>
              </thead>
              <tbody>
                {ultimosMovimientos.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No se han registrado movimientos todavía.
                    </td>
                  </tr>
                ) : (
                  ultimosMovimientos.map((m) => (
                    <tr key={m.id_movimiento}>
                      <td style={{ fontSize: '0.82rem' }}>
                        {new Date(m.fecha).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td>
                        <span className={`badge ${
                          m.tipo === 'entrada' ? 'badge-success' : m.tipo === 'salida' ? 'badge-warning' : 'badge-purple'
                        }`}>
                          {m.tipo === 'entrada' && <ArrowUpRight size={13} />}
                          {m.tipo === 'salida' && <ArrowDownRight size={13} />}
                          {m.tipo.toUpperCase()}
                        </span>
                      </td>
                      <td>{m.cliente_nombre || <span style={{ color: 'var(--text-muted)' }}>Sin cliente</span>}</td>
                      <td>
                        <span className="badge badge-neutral">{m.total_items} items ({m.total_unidades} uds)</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

