import React from 'react';
import {
  X,
  SlidersHorizontal,
  Maximize2,
  Minimize2,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  EyeOff,
  RotateCcw,
  Check,
  Layout,
  Menu,
  CheckSquare,
  Square
} from 'lucide-react';
import Modal from './Modal';

export const ALL_MODULES = [
  { id: 'dashboard', label: 'Panel Principal' },
  { id: 'categorias', label: 'Categorías' },
  { id: 'proveedores', label: 'Proveedores' },
  { id: 'productos', label: 'Productos' },
  { id: 'clientes', label: 'Clientes' },
  { id: 'movimientos', label: 'Movimientos' },
  { id: 'detalles', label: 'Detalles Movimientos' }
];

export const DEFAULT_PREFERENCES = {
  sidebarMode: 'expanded',   // 'expanded' | 'collapsed'
  sidebarVisible: true,      // true | false
  density: 'normal',         // 'compact' | 'normal' | 'spacious'
  viewMode: 'responsive',    // 'responsive' | 'desktop' | 'tablet' | 'mobile'
  hiddenModules: []          // array of string module ids
};

export default function CustomizationModal({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
  onResetPreferences
}) {
  const toggleModule = (moduleId) => {
    const currentHidden = preferences.hiddenModules || [];
    const isHidden = currentHidden.includes(moduleId);

    // Evitar ocultar todos los módulos a la vez
    if (!isHidden && currentHidden.length >= ALL_MODULES.length - 1) {
      return;
    }

    const nextHidden = isHidden
      ? currentHidden.filter((id) => id !== moduleId)
      : [...currentHidden, moduleId];

    onUpdatePreferences({ hiddenModules: nextHidden });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Personalización de la Interfaz"
      size="lg"
    >
      <div className="customization-container">
        <p className="customization-intro">
          Configura la presentación visual, densidad de información y módulos visibles según tu comodidad de trabajo. Tus preferencias se guardan automáticamente en tu navegador.
        </p>

        {/* 1. Menú Lateral */}
        <div className="pref-section">
          <div className="pref-section-header">
            <h4>Menú Lateral</h4>
            <span className="pref-section-tag">Navegación</span>
          </div>
          
          <div className="pref-row">
            <div className="pref-info">
              <strong>Estilo del Menú</strong>
              <p>Elige entre un menú completo con etiquetas de texto o una barra compacta de iconos.</p>
            </div>
            <div className="pref-segmented-control">
              <button
                type="button"
                className={`segmented-btn ${preferences.sidebarMode === 'expanded' ? 'active' : ''}`}
                onClick={() => onUpdatePreferences({ sidebarMode: 'expanded' })}
              >
                <Layout size={15} />
                Expandido
              </button>
              <button
                type="button"
                className={`segmented-btn ${preferences.sidebarMode === 'collapsed' ? 'active' : ''}`}
                onClick={() => onUpdatePreferences({ sidebarMode: 'collapsed' })}
              >
                <Menu size={15} />
                Contraído
              </button>
            </div>
          </div>

          <div className="pref-row" style={{ marginTop: '0.75rem' }}>
            <div className="pref-info">
              <strong>Visibilidad del Menú</strong>
              <p>Muestra u oculta completamente el menú lateral en pantalla de escritorio.</p>
            </div>
            <button
              type="button"
              className={`btn ${preferences.sidebarVisible ? 'btn-secondary' : 'btn-primary'}`}
              style={{ minWidth: '135px' }}
              onClick={() => onUpdatePreferences({ sidebarVisible: !preferences.sidebarVisible })}
            >
              {preferences.sidebarVisible ? (
                <>
                  <EyeOff size={15} /> Ocultar Menú
                </>
              ) : (
                <>
                  <Eye size={15} /> Mostrar Menú
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2. Tamaño y Densidad */}
        <div className="pref-section">
          <div className="pref-section-header">
            <h4>Densidad y Tamaño de Interfaz</h4>
            <span className="pref-section-tag">Espaciado</span>
          </div>
          <p style={{ fontSize: '0.81rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
            Ajusta los márgenes, tamaños de fuente y altura de tablas y formularios según tu preferencia.
          </p>

          <div className="density-grid">
            <div
              className={`density-card ${preferences.density === 'compact' ? 'active' : ''}`}
              onClick={() => onUpdatePreferences({ density: 'compact' })}
            >
              <div className="density-icon">
                <Minimize2 size={18} />
              </div>
              <div className="density-meta">
                <strong>Compacto</strong>
                <p>Mayor cantidad de datos en pantalla, filas condensadas.</p>
              </div>
              {preferences.density === 'compact' && <Check size={16} className="density-check" />}
            </div>

            <div
              className={`density-card ${preferences.density === 'normal' ? 'active' : ''}`}
              onClick={() => onUpdatePreferences({ density: 'normal' })}
            >
              <div className="density-icon">
                <SlidersHorizontal size={18} />
              </div>
              <div className="density-meta">
                <strong>Normal</strong>
                <p>Equilibrio estándar para lectura cómoda y operación diaria.</p>
              </div>
              {preferences.density === 'normal' && <Check size={16} className="density-check" />}
            </div>

            <div
              className={`density-card ${preferences.density === 'spacious' ? 'active' : ''}`}
              onClick={() => onUpdatePreferences({ density: 'spacious' })}
            >
              <div className="density-icon">
                <Maximize2 size={18} />
              </div>
              <div className="density-meta">
                <strong>Amplio</strong>
                <p>Márgenes más generosos y tipografía descansada.</p>
              </div>
              {preferences.density === 'spacious' && <Check size={16} className="density-check" />}
            </div>
          </div>
        </div>

        {/* 3. Disposición de Vista (Simulador de Dispositivo) */}
        <div className="pref-section">
          <div className="pref-section-header">
            <h4>Disposición de Vista</h4>
            <span className="pref-section-tag">Simulación</span>
          </div>
          <p style={{ fontSize: '0.81rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
            Adapta la disposición visual a diferentes formatos de pantalla sin cambiar de dispositivo.
          </p>

          <div className="device-mode-grid">
            <button
              type="button"
              className={`device-btn ${preferences.viewMode === 'responsive' ? 'active' : ''}`}
              onClick={() => onUpdatePreferences({ viewMode: 'responsive' })}
            >
              <Monitor size={18} />
              <span>Adaptable (Auto)</span>
            </button>

            <button
              type="button"
              className={`device-btn ${preferences.viewMode === 'desktop' ? 'active' : ''}`}
              onClick={() => onUpdatePreferences({ viewMode: 'desktop' })}
            >
              <Monitor size={18} />
              <span>Escritorio</span>
            </button>

            <button
              type="button"
              className={`device-btn ${preferences.viewMode === 'tablet' ? 'active' : ''}`}
              onClick={() => onUpdatePreferences({ viewMode: 'tablet' })}
            >
              <Tablet size={18} />
              <span>Tablet</span>
            </button>

            <button
              type="button"
              className={`device-btn ${preferences.viewMode === 'mobile' ? 'active' : ''}`}
              onClick={() => onUpdatePreferences({ viewMode: 'mobile' })}
            >
              <Smartphone size={18} />
              <span>Móvil</span>
            </button>
          </div>
        </div>

        {/* 4. Módulos Visibles del Menú */}
        <div className="pref-section">
          <div className="pref-section-header">
            <h4>Módulos Visibles en el Menú</h4>
            <span className="pref-section-tag">Personalización</span>
          </div>
          <p style={{ fontSize: '0.81rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
            Activa o desactiva módulos de la barra lateral según los que uses con mayor frecuencia. Los registros de tu base de datos se conservan íntegros.
          </p>

          <div className="modules-visibility-grid">
            {ALL_MODULES.map((mod) => {
              const isVisible = !(preferences.hiddenModules || []).includes(mod.id);
              return (
                <div
                  key={mod.id}
                  className={`module-toggle-item ${isVisible ? 'visible' : 'hidden'}`}
                  onClick={() => toggleModule(mod.id)}
                >
                  <div className="module-toggle-checkbox">
                    {isVisible ? <CheckSquare size={17} color="var(--primary)" /> : <Square size={17} color="var(--text-muted)" />}
                  </div>
                  <span className="module-toggle-name">{mod.label}</span>
                  <span className="module-toggle-status">
                    {isVisible ? 'Visible' : 'Oculto'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="modal-footer" style={{ justifyContent: 'space-between', margin: '1rem -1.25rem -1.25rem -1.25rem' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onResetPreferences}
        >
          <RotateCcw size={14} />
          Restablecer Valores
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onClose}
        >
          <Check size={16} />
          Guardar y Aplicar
        </button>
      </div>
    </Modal>
  );
}

