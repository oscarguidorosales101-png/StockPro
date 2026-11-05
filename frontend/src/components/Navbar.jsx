import React from 'react';
import {
  Menu,
  ShieldCheck,
  Calendar,
  SlidersHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Monitor,
  Tablet,
  Smartphone
} from 'lucide-react';

export default function Navbar({
  activeTab,
  onOpenMenu,
  preferences = {},
  onUpdatePreferences,
  onOpenCustomization
}) {
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
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  const isSidebarVisible = preferences.sidebarVisible !== false;
  const isCollapsed = preferences.sidebarMode === 'collapsed';

  const toggleDesktopSidebar = () => {
    if (onUpdatePreferences) {
      if (!isSidebarVisible) {
        onUpdatePreferences({ sidebarVisible: true });
      } else {
        onUpdatePreferences({ sidebarMode: isCollapsed ? 'expanded' : 'collapsed' });
      }
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        {/* Botón para pantallas móviles */}
        <button
          type="button"
          className="mobile-menu-btn mobile-only"
          onClick={onOpenMenu}
          aria-label="Abrir menú de navegación"
          title="Menú"
        >
          <Menu size={20} />
        </button>

        {/* Botón para alternar barra lateral en escritorio */}
        <button
          type="button"
          className="sidebar-nav-toggle-btn desktop-only"
          onClick={toggleDesktopSidebar}
          aria-label="Alternar menú lateral"
          title={!isSidebarVisible ? 'Mostrar barra lateral' : isCollapsed ? 'Expandir barra lateral' : 'Contraer barra lateral'}
        >
          {!isSidebarVisible ? <PanelLeftOpen size={18} /> : isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>

        <h2 className="topbar-title">{titles[activeTab] || 'StockPro'}</h2>
      </div>

      <div className="topbar-right">
        {/* Selector rápido de vista (Escritorio / Tablet / Móvil / Adaptable) */}
        <div className="view-mode-selector desktop-only" title="Simular disposición de pantalla">
          <button
            type="button"
            className={`view-mode-pill ${preferences.viewMode === 'responsive' ? 'active' : ''}`}
            onClick={() => onUpdatePreferences({ viewMode: 'responsive' })}
            title="Vista Adaptable Automática"
          >
            Auto
          </button>
          <button
            type="button"
            className={`view-mode-pill ${preferences.viewMode === 'desktop' ? 'active' : ''}`}
            onClick={() => onUpdatePreferences({ viewMode: 'desktop' })}
            title="Vista Escritorio"
          >
            <Monitor size={13} />
          </button>
          <button
            type="button"
            className={`view-mode-pill ${preferences.viewMode === 'tablet' ? 'active' : ''}`}
            onClick={() => onUpdatePreferences({ viewMode: 'tablet' })}
            title="Vista Tablet (768px)"
          >
            <Tablet size={13} />
          </button>
          <button
            type="button"
            className={`view-mode-pill ${preferences.viewMode === 'mobile' ? 'active' : ''}`}
            onClick={() => onUpdatePreferences({ viewMode: 'mobile' })}
            title="Vista Móvil (420px)"
          >
            <Smartphone size={13} />
          </button>
        </div>

        {/* Botón Abrir Personalización */}
        {onOpenCustomization && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onOpenCustomization}
            title="Personalizar interfaz y preferencias"
          >
            <SlidersHorizontal size={14} />
            <span className="hide-on-mobile">Personalizar</span>
          </button>
        )}

        {/* Fecha actual */}
        <div className="topbar-date hide-on-mobile">
          <Calendar size={14} />
          <span>{currentDate}</span>
        </div>

        {/* Insignia de estado del sistema */}
        <div className="topbar-badge" title="Servicio empresarial activo y operativo">
          <ShieldCheck size={14} />
          <span className="hide-on-mobile">Sistema Operativo</span>
        </div>
      </div>
    </header>
  );
}
