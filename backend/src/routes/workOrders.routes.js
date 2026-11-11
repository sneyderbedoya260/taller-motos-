const rutas = require('express').Router();
const manejarErrores = require('../middlewares/asyncHandler');
const controlador = require('../controllers/workOrders.controller');

rutas.post('/', manejarErrores(controlador.crear));
rutas.get('/', manejarErrores(controlador.listar));
rutas.delete('/items/:itemId', manejarErrores(controlador.quitarItem));
rutas.get('/:id', manejarErrores(controlador.obtenerPorId));
rutas.patch('/:id/status', manejarErrores(controlador.actualizarEstado));
rutas.post('/:id/items', manejarErrores(controlador.agregarItem));

module.exports = rutas;
