import http from './http';
export const listarOrdenes = (parametros) => http.get('/work-orders', { params: parametros }).then((respuesta) => respuesta.data);
export const obtenerOrden = (id) => http.get(`/work-orders/${id}`).then((respuesta) => respuesta.data);
export const crearOrden = (datos) => http.post('/work-orders', datos).then((respuesta) => respuesta.data);
export const cambiarEstadoOrden = (id, estado) => http.patch(`/work-orders/${id}/status`, { status: estado }).then((respuesta) => respuesta.data);
export const agregarItem = (id, datos) => http.post(`/work-orders/${id}/items`, datos).then((respuesta) => respuesta.data);
export const quitarItem = (idItem) => http.delete(`/work-orders/items/${idItem}`).then((respuesta) => respuesta.data);
