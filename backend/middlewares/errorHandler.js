/**
 * Middleware centralizado para el manejo de errores HTTP y de base de datos.
 */
function errorHandler(err, req, res, next) {
  console.error(`[Error ${req.method} ${req.url}]:`, err.message || err);

  let statusCode = err.statusCode || (err.status ? err.status : null);

  // Mapear errores de negocio conocidos a HTTP 400
  if (!statusCode) {
    const msg = (err.message || '').toLowerCase();
    if (
      msg.includes('stock insuficiente') ||
      msg.includes('debe incluir') ||
      msg.includes('obligatorio') ||
      msg.includes('no se puede eliminar') ||
      msg.includes('ya existe') ||
      msg.includes('negativo') ||
      msg.includes('inconsistente') ||
      err.code === 'ER_DUP_ENTRY' ||
      err.code === 'ER_ROW_IS_REFERENCED_2' ||
      err.code === 'ER_NO_REFERENCED_ROW_2'
    ) {
      statusCode = 400;
    } else {
      statusCode = 500;
    }
  }

  const message = err.message || 'Ocurrió un error interno en el servidor.';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
}

module.exports = errorHandler;
