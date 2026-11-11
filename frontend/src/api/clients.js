import http from './http';
export const crearCliente = (datos) => http.post('/clients', datos).then((respuesta) => respuesta.data);
export const buscarClientes = (texto) => http.get('/clients', { params: { search: texto } }).then((respuesta) => respuesta.data);
