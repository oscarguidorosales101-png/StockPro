const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 5000;

// Probar conexión a la base de datos antes de iniciar la escucha
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

