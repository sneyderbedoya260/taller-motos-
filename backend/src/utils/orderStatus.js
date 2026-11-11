const AppError = require('./AppError');

const ESTADOS = {
  RECIBIDA: 'RECIBIDA',
  DIAGNOSTICO: 'DIAGNOSTICO',
  EN_PROCESO: 'EN_PROCESO',
  LISTA: 'LISTA',
  ENTREGADA: 'ENTREGADA',
  CANCELADA: 'CANCELADA',
};

const FLUJO = ['RECIBIDA', 'DIAGNOSTICO', 'EN_PROCESO', 'LISTA', 'ENTREGADA'];

const ESTADOS_FINALES = ['ENTREGADA', 'CANCELADA'];

function obtenerTransiciones(estadoActual) {
  if (ESTADOS_FINALES.includes(estadoActual)) return [];
  const siguiente = FLUJO[FLUJO.indexOf(estadoActual) + 1];
  return [siguiente, 'CANCELADA'].filter(Boolean);
}

function validarTransicion(estadoActual, estadoNuevo) {
  if (!Object.values(ESTADOS).includes(estadoNuevo)) {
    throw new AppError(`Estado '${estadoNuevo}' no existe. Validos: ${Object.values(ESTADOS).join(', ')}`, 400);
  }
  const permitidos = obtenerTransiciones(estadoActual);
  if (!permitidos.includes(estadoNuevo)) {
    throw new AppError(
      `Transicion invalida: ${estadoActual} -> ${estadoNuevo}. ` +
        (permitidos.length ? `Permitidas: ${permitidos.join(', ')}` : `La orden esta en estado final (${estadoActual}).`),
      400
    );
  }
}

module.exports = { ESTADOS, FLUJO, ESTADOS_FINALES, obtenerTransiciones, validarTransicion };
