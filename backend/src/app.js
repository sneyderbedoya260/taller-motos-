const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rutasApi = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const aplicacion = express();
const origenesPermitidos = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

aplicacion.use(cors({
  origin(origen, respuesta) {
    respuesta(null, !origen || origenesPermitidos.includes(origen));
  },
}));
aplicacion.use(express.json());
aplicacion.use(morgan('dev'));

aplicacion.use('/api', rutasApi);

aplicacion.use(notFound);
aplicacion.use(errorHandler);

module.exports = aplicacion;
