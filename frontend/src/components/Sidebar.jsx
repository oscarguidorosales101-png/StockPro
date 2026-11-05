import React from 'react';
import {
  Boxes,
  Truck,
  Package,
  Users,
  ArrowLeftRight,
  ClipboardList,
  LayoutDashboard,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
  preferences = {},
  onUpdatePreferences,
  onOpenCustomization
}) {
  const navItems = [
    { id: 'dashboard', label: 'Panel Principal', icon: LayoutDashboard },
    { id: 'categorias', label: 'Categorías', icon: Boxes },
    { id: 'proveedores', label: 'Proveedores', icon: Truck },
    { id: 'productos', label: 'Productos', icon: Package },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'movimientos', label: 'Movimientos', icon: ArrowLeftRight },
    { id: 'detalles', label: 'Detalles Movimientos', icon: ClipboardList }
  ];

  const hiddenModules = preferences.hiddenModules || [];
  const visibleNavItems = navItems.filter((item) => !hiddenModules.includes(item.id));
  const displayedItems = visibleNavItems.length > 0 ? visibleNavItems : navItems;

  const isCollapsed = preferences.sidebarMode === 'collapsed';
  const isHiddenDesktop = preferences.sidebarVisible === false;

  const handleSelect = (id) => {
    setActiveTab(id);
    if (window.innerWidth <= 900) {
      setIsOpen(false);
    }
  };

  const toggleSidebarMode = () => {
    if (onUpdatePreferences) {
      onUpdatePreferences({
        sidebarMode: isCollapsed ? 'expanded' : 'collapsed'
      });
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

      <aside
        className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''} ${isHiddenDesktop ? 'hidden-desktop' : ''}`}
      >
        <div className="sidebar-header">
          <div className="sidebar-logo-icon" title="StockPro">
            <Package size={20} />
          </div>

          {!isCollapsed && (
            <div className="sidebar-brand">
              <h1>StockPro</h1>
              <p>Gestión Empresarial</p>
            </div>
          )}

          {/* Botón contraer/expandir para escritorio */}
          <button
            type="button"
            className="sidebar-toggle-mode-btn desktop-only"
            onClick={toggleSidebarMode}
            title={isCollapsed ? 'Expandir menú lateral' : 'Contraer menú lateral'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Botón cerrar para móvil */}
          {window.innerWidth <= 900 && (
            <button
              className="modal-close-btn mobile-only"
              style={{ marginLeft: 'auto' }}
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar menú"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {!isCollapsed && <div className="nav-section-title">Módulos del Sistema</div>}

          {displayedItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleSelect(item.id)}
                title={item.label}
              >
                <Icon size={18} className="nav-item-icon" />
                {!isCollapsed && <span className="nav-item-label">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-row">
            <div className="system-badge" title="Servicio empresarial activo y operativo">
              <div className="status-dot"></div>
              {!isCollapsed && <span>Sistema Operativo</span>}
            </div>

            {onOpenCustomization && (
              <button
                type="button"
                className="sidebar-customize-btn"
                onClick={onOpenCustomization}
                title="Personalizar interfaz y módulos"
              >
                <SlidersHorizontal size={15} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
