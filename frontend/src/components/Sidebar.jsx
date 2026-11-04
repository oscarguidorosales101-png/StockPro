import React from 'react';
import {
  Boxes,
  Truck,
  Package,
  Users,
  ArrowLeftRight,
  ClipboardList,
  LayoutDashboard,
  ShieldCheck,
  X
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }) {
  const navItems = [
    { id: 'dashboard', label: 'Panel Principal', icon: LayoutDashboard },
    { id: 'categorias', label: 'Categorías', icon: Boxes },
    { id: 'proveedores', label: 'Proveedores', icon: Truck },
    { id: 'productos', label: 'Productos', icon: Package },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'movimientos', label: 'Movimientos', icon: ArrowLeftRight },
    { id: 'detalles', label: 'Detalles Movimientos', icon: ClipboardList }
  ];

  const handleSelect = (id) => {
    setActiveTab(id);
    if (window.innerWidth <= 900) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo-icon">
            <Package size={22} />
          </div>
          <div className="sidebar-brand">
            <h1>StockPro</h1>
            <p>Gestión Empresarial</p>
          </div>
          {window.innerWidth <= 900 && (
            <button
              className="modal-close-btn"
              style={{ marginLeft: 'auto' }}
              onClick={() => setIsOpen(false)}
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Módulos del Sistema</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleSelect(item.id)}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="system-badge">
            <div className="status-dot"></div>
            <span>MySQL 8.0 &bull; Conectado</span>
          </div>
        </div>
      </aside>
    </>
  );
}

