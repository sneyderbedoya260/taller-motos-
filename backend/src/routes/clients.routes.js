const rutas = require('express').Router();
const manejarErrores = require('../middlewares/asyncHandler');
const controlador = require('../controllers/clients.controller');

rutas.post('/', manejarErrores(controlador.crear));
rutas.get('/', manejarErrores(controlador.listar));
rutas.get('/:id', manejarErrores(controlador.obtenerPorId));

module.exports = rutas;
