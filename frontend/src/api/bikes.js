import http from './http';
export const crearMoto = (datos) => http.post('/bikes', datos).then((respuesta) => respuesta.data);
export const buscarMotos = (placa) => http.get('/bikes', { params: { plate: placa } }).then((respuesta) => respuesta.data);
