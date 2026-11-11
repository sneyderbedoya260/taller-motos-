module.exports = (funcion) => (solicitud, respuesta, siguiente) =>
  Promise.resolve(funcion(solicitud, respuesta, siguiente)).catch(siguiente);
