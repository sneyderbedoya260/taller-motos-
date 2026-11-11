const workOrdersService = require('../services/workOrders.service');

exports.crear = async (solicitud, respuesta) => {
  const orden = await workOrdersService.crearOrden(solicitud.body);
  respuesta.status(201).json(orden);
};

exports.listar = async (solicitud, respuesta) => {
  const resultado = await workOrdersService.listarOrdenes(solicitud.query);
  respuesta.json(resultado);
};

exports.obtenerPorId = async (solicitud, respuesta) => {
  const orden = await workOrdersService.obtenerOrdenPorId(solicitud.params.id);
  respuesta.json(orden);
};

exports.actualizarEstado = async (solicitud, respuesta) => {
  const orden = await workOrdersService.cambiarEstado(solicitud.params.id, solicitud.body.status);
  respuesta.json(orden);
};

exports.agregarItem = async (solicitud, respuesta) => {
  const articulo = await workOrdersService.agregarItem(solicitud.params.id, solicitud.body);
  respuesta.status(201).json(articulo);
};

exports.quitarItem = async (solicitud, respuesta) => {
  const articulo = await workOrdersService.quitarItem(solicitud.params.itemId);
  respuesta.json(articulo);
};
