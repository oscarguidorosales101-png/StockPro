const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const pool = require('./config/db');

// Importar rutas
const categoriaRoutes = require('./routes/categoriaRoutes');
const proveedorRoutes = require('./routes/proveedorRoutes');
const productoRoutes = require('./routes/productoRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const movimientoRoutes = require('./routes/movimientoRoutes');
const detalleMovimientoRoutes = require('./routes/detalleMovimientoRoutes');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint de estado y salud
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    res.json({
      success: true,
      service: 'StockPro API',
      status: 'online',
      database: 'connected',
      solution: rows[0].solution
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      service: 'StockPro API',
      status: 'database_error',
      error: err.message
    });
  }
});

// Rutas de la API REST
app.use('/api/categorias', categoriaRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/movimientos', movimientoRoutes);
app.use('/api/detalle-movimientos', detalleMovimientoRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// Manejador global de errores
app.use((err, req, res, next) => {
  console.error('Error global no controlado:', err);
  res.status(500).json({
    success: false,
    message: 'Ocurrió un error interno en el servidor.',
    error: err.message
  });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  // Probar conexión a la base de datos antes de iniciar
  pool.query('SELECT 1')
    .then(() => {
      console.log('✅ Conexión a base de datos MySQL establecida correctamente.');
      app.listen(PORT, () => {
        console.log(`🚀 Servidor backend de StockPro escuchando en http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('❌ Error fatal al conectar con la base de datos MySQL:', err.message);
      process.exit(1);
    });
}

module.exports = app;

