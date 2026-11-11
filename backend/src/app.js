const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const rutasApi = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const aplicacion = express();
const origenesPermitidos = new Set([
  'https://taller-motos-wuia.vercel.app',
  ...(process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean),
]);

aplicacion.use(cors({
  origin(origen, respuesta) {
    respuesta(null, !origen || origenesPermitidos.has(origen));
  },
}));
aplicacion.use(express.json());
aplicacion.use(morgan('dev'));

aplicacion.use('/api', rutasApi);

const directorioFrontend = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(directorioFrontend)) {
  aplicacion.use(express.static(directorioFrontend));
  aplicacion.get('*', (solicitud, respuesta, siguiente) => {
    if (solicitud.path === '/api' || solicitud.path.startsWith('/api/')) {
      return siguiente();
    }
    respuesta.sendFile(path.join(directorioFrontend, 'index.html'), (error) => {
      if (error) siguiente(error);
    });
  });
}

aplicacion.use(notFound);
aplicacion.use(errorHandler);

module.exports = aplicacion;
