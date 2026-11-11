const AppError = require('../utils/AppError');

function notFound(solicitud, respuesta, siguiente) {
  siguiente(new AppError(`Ruta no encontrada: ${solicitud.method} ${solicitud.originalUrl}`, 404));
}

function errorHandler(error, solicitud, respuesta, siguiente) {
  if (error.name === 'SequelizeValidationError') {
    return respuesta.status(400).json({
      message: 'Error de validacion',
      details: error.errors.map((detalle) => ({ field: detalle.path, message: detalle.message })),
    });
  }
  if (error.name === 'SequelizeUniqueConstraintError') {
    return respuesta.status(409).json({
      message: 'Registro duplicado',
      details: error.errors.map((detalle) => ({ field: detalle.path, message: detalle.message || `${detalle.path} ya existe` })),
    });
  }
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return respuesta.status(400).json({ message: 'Referencia invalida: el registro relacionado no existe' });
  }
  if (error instanceof AppError) {
    return respuesta.status(error.status).json({ message: error.message, details: error.details });
  }
  console.error(error);
  respuesta.status(500).json({ message: 'Error interno del servidor' });
}

module.exports = { notFound, errorHandler };
