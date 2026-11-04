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

// Importar middlewares
const errorHandler = require('./middlewares/errorHandler');
const notFoundHandler = require('./middlewares/notFoundHandler');

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

// Manejo de rutas no encontradas y manejador centralizado de errores
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

