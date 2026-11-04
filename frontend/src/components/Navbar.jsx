import React from 'react';
import { Menu, Database, Calendar } from 'lucide-react';

export default function Navbar({ activeTab, onOpenMenu }) {
  const titles = {
    dashboard: 'Panel de Control y Resumen',
    categorias: 'Gestión de Categorías',
    proveedores: 'Gestión de Proveedores',
    productos: 'Gestión de Productos e Inventario',
    clientes: 'Administración de Clientes',
    movimientos: 'Control de Movimientos de Inventario',
    detalles: 'Registro Detallado de Movimientos'
  };

  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="mobile-menu-btn"
          onClick={onOpenMenu}
          aria-label="Abrir menú"
        >
          <Menu size={22} />
        </button>
        <h2 className="topbar-title">{titles[activeTab] || 'StockPro'}</h2>
      </div>

      <div className="topbar-right">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'capitalize' }}>
          <Calendar size={15} />
          <span>{currentDate}</span>
        </div>

        <div className="topbar-badge">
          <Database size={14} />
          <span>BD: stockpro</span>
        </div>
      </div>
    </header>
  );
}

