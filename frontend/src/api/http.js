import axios from 'axios';

const http = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api' });

export function obtenerMensajeError(error) {
  const datos = error?.response?.data;
  if (datos?.details?.length) return `${datos.message}: ${datos.details.map((detalle) => detalle.message).join(', ')}`;
  return datos?.message || error.message || 'Error inesperado';
}

export default http;
