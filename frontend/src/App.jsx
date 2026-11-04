import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Toast from './components/Toast';

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
  const [toasts, setToasts] = useState([]);

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

  return (
    <div className="app-layout">
      {/* Barra Lateral / Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Contenido Principal */}
      <div className="main-wrapper">
        <Navbar
          activeTab={activeTab}
          onOpenMenu={() => setIsSidebarOpen(true)}
        />

        <main style={{ flex: 1, paddingBottom: '2.5rem' }}>
          {activeTab === 'dashboard' && <DashboardPage setActiveTab={setActiveTab} />}
          {activeTab === 'categorias' && <CategoriasPage addToast={addToast} />}
          {activeTab === 'proveedores' && <ProveedoresPage addToast={addToast} />}
          {activeTab === 'productos' && <ProductosPage addToast={addToast} />}
          {activeTab === 'clientes' && <ClientesPage addToast={addToast} />}
          {activeTab === 'movimientos' && <MovimientosPage addToast={addToast} />}
          {activeTab === 'detalles' && <DetalleMovimientosPage addToast={addToast} />}
        </main>
      </div>

      {/* Sistema de Notificaciones Toast */}
      <Toast toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
