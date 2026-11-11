const rutas = require('express').Router();

rutas.get('/', (solicitud, respuesta) => respuesta.json({
  message: 'API de Taller de Motos',
  health: '/api/health',
}));
rutas.get('/health', (solicitud, respuesta) => respuesta.json({ ok: true }));
rutas.use('/clients', require('./clients.routes'));
rutas.use('/bikes', require('./bikes.routes'));
rutas.use('/work-orders', require('./workOrders.routes'));

module.exports = rutas;
