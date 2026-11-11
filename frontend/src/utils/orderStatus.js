export const ESTADOS = ['RECIBIDA', 'DIAGNOSTICO', 'EN_PROCESO', 'LISTA', 'ENTREGADA', 'CANCELADA'];
const FLUJO = ['RECIBIDA', 'DIAGNOSTICO', 'EN_PROCESO', 'LISTA', 'ENTREGADA'];

export function obtenerTransiciones(estadoActual) {
  if (estadoActual === 'ENTREGADA' || estadoActual === 'CANCELADA') return [];
  return [FLUJO[FLUJO.indexOf(estadoActual) + 1], 'CANCELADA'].filter(Boolean);
}

const formatoMoneda = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export function formatearDinero(valor) {
  const texto = String(valor ?? 0);
  const coincidencia = /^(-?)(\d+)(?:\.(\d+))?$/.exec(texto);
  if (!coincidencia) {
    return formatoMoneda.format(Number(valor) || 0);
  }

  const [, signo, entero, decimalesSinAjustar = ''] = coincidencia;
  const decimales = decimalesSinAjustar.replace(/0+$/, '');
  const enteroFormateado = formatoMoneda.format(BigInt(`${signo}${entero}`));
  return decimales ? `${enteroFormateado},${decimales}` : enteroFormateado;
}

export function multiplicarDinero(valor, cantidad) {
  const texto = String(valor ?? 0);
  const coincidencia = /^(-?)(\d+)(?:\.(\d+))?$/.exec(texto);
  if (!coincidencia) {
    return String(Number(valor) * Number(cantidad));
  }

  const [, signo, enteroOriginal, fraccionOriginal = ''] = coincidencia;
  const producto = (BigInt(`${enteroOriginal}${fraccionOriginal}`) * BigInt(cantidad)).toString();
  const ajustado = producto.padStart(fraccionOriginal.length + 1, '0');
  const entero = (fraccionOriginal ? ajustado.slice(0, -fraccionOriginal.length) : ajustado).replace(/^0+(?=\d)/, '');
  const decimales = fraccionOriginal ? ajustado.slice(-fraccionOriginal.length).replace(/0+$/, '') : '';
  return `${signo}${entero || '0'}${decimales ? `.${decimales}` : ''}`;
}

export const formatearFecha = (fecha) => new Date(fecha).toLocaleString('es-CO');
