import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import CustomizationModal, { DEFAULT_PREFERENCES } from './components/CustomizationModal';

import DashboardPage from './pages/DashboardPage';
import CategoriasPage from './pages/CategoriasPage';
import ProveedoresPage from './pages/ProveedoresPage';
import ProductosPage from './pages/ProductosPage';
import ClientesPage from './pages/ClientesPage';
import MovimientosPage from './pages/MovimientosPage';
import DetalleMovimientosPage from './pages/DetalleMovimientosPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Cargar preferencias guardadas en localStorage
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('stockpro_ui_preferences');
      if (saved) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('No se pudieron leer las preferencias locales:', e);
    }
    return DEFAULT_PREFERENCES;
  });

  const updatePreferences = (changes) => {
    setPreferences((prev) => {
      const next = typeof changes === 'function' ? changes(prev) : { ...prev, ...changes };
      try {
        localStorage.setItem('stockpro_ui_preferences', JSON.stringify(next));
      } catch (e) {
        console.warn('No se pudieron guardar las preferencias locales:', e);
      }
      return next;
    });
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
    try {
      localStorage.removeItem('stockpro_ui_preferences');
    } catch (e) {}
    addToast('Preferencias de interfaz restablecidas a valores predeterminados.');
  };

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const handleDismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Clases dinámicas de diseño según personalización
  const densityClass = `density-${preferences.density || 'normal'}`;
  const viewClass = `view-${preferences.viewMode || 'responsive'}`;
  const sidebarModeClass = preferences.sidebarMode === 'collapsed' ? 'layout-sidebar-collapsed' : 'layout-sidebar-expanded';
  const sidebarVisibleClass = preferences.sidebarVisible === false ? 'layout-sidebar-hidden' : 'layout-sidebar-visible';

  return (
    <div className={`app-layout ${densityClass} ${viewClass} ${sidebarModeClass} ${sidebarVisibleClass}`}>
      {/* Barra Lateral / Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        preferences={preferences}
        onUpdatePreferences={updatePreferences}
        onOpenCustomization={() => setIsCustomizationOpen(true)}
      />

      {/* Contenedor Principal */}
      <div className="main-wrapper">
        <Navbar
          activeTab={activeTab}
          onOpenMenu={() => setIsSidebarOpen(true)}
          preferences={preferences}
          onUpdatePreferences={updatePreferences}
          onOpenCustomization={() => setIsCustomizationOpen(true)}
        />

        <main className="main-viewport-content">
          <div className="view-mode-container">
            {activeTab === 'dashboard' && <DashboardPage setActiveTab={setActiveTab} />}
            {activeTab === 'categorias' && <CategoriasPage addToast={addToast} />}
            {activeTab === 'proveedores' && <ProveedoresPage addToast={addToast} />}
            {activeTab === 'productos' && <ProductosPage addToast={addToast} />}
            {activeTab === 'clientes' && <ClientesPage addToast={addToast} />}
            {activeTab === 'movimientos' && <MovimientosPage addToast={addToast} />}
            {activeTab === 'detalles' && <DetalleMovimientosPage addToast={addToast} />}
          </div>
        </main>
      </div>

      {/* Modal de Personalización */}
      <CustomizationModal
        isOpen={isCustomizationOpen}
        onClose={() => setIsCustomizationOpen(false)}
        preferences={preferences}
        onUpdatePreferences={updatePreferences}
        onResetPreferences={resetPreferences}
      />

      {/* Sistema de Notificaciones Toast */}
      <Toast toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
