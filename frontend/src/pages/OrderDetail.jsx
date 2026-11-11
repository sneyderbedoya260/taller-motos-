import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { agregarItem as enviarItem, obtenerOrden, quitarItem, cambiarEstadoOrden } from '../api/workOrders';
import { obtenerMensajeError } from '../api/http';
import { formatearFecha, formatearDinero, obtenerTransiciones, multiplicarDinero } from '../utils/orderStatus';
import MensajeError from '../components/ErrorMessage.jsx';
import Cargador from '../components/Loader.jsx';

export default function DetalleOrden() {
  const { id: idOrden } = useParams();
  const [orden, setOrden] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState('');
  const [tipo, setTipo] = useState('MANO_OBRA');
  const [descripcion, setDescripcion] = useState('');
  const [cantidad, setCantidad] = useState('1');
  const [valorUnitario, setValorUnitario] = useState('');

  const actualizarOrden = useCallback(async () => {
    setError('');
    try {
      setOrden(await obtenerOrden(idOrden));
    } catch (errorSolicitud) {
      setError(obtenerMensajeError(errorSolicitud));
    } finally {
      setCargando(false);
    }
  }, [idOrden]);

  useEffect(() => {
    actualizarOrden();
  }, [actualizarOrden]);

  async function ejecutarAccion(accion) {
    setOcupado(true);
    setError('');
    try {
      await accion();
      await actualizarOrden();
    } catch (errorSolicitud) {
      setError(obtenerMensajeError(errorSolicitud));
    } finally {
      setOcupado(false);
    }
  }

  async function agregarItem(evento) {
    evento.preventDefault();
    const cantidadNumerica = Number(cantidad);
    const textoValor = valorUnitario.trim().replace(',', '.');
    const valor = Number(textoValor);
    if (!descripcion.trim()) {
      setError('La descripcion del item es obligatoria.');
      return;
    }
    if (!Number.isInteger(cantidadNumerica) || cantidadNumerica < 1) {
      setError('La cantidad debe ser un numero entero mayor a 0.');
      return;
    }
    if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(textoValor) || !Number.isFinite(valor) || valor < 0) {
      setError('El valor unitario debe ser un numero mayor o igual a 0.');
      return;
    }

    await ejecutarAccion(async () => {
      await enviarItem(idOrden, {
        type: tipo,
        description: descripcion.trim(),
        count: cantidadNumerica,
        unitValue: textoValor,
      });
      setDescripcion('');
      setCantidad('1');
      setValorUnitario('');
    });
  }

  if (cargando) return <Cargador texto="Cargando orden..." />;
  if (!orden) {
    return (
      <section>
        <MensajeError mensaje={error || 'No se encontro la orden.'} />
        <Link className="button button-secondary" to="/orders">Volver a ordenes</Link>
      </section>
    );
  }

  const moto = orden.bike;
  const cliente = moto?.client;
  const esFinal = ['ENTREGADA', 'CANCELADA'].includes(orden.status);
  const transicionesPermitidas = obtenerTransiciones(orden.status);

  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>Orden #{orden.id}</h1>
          <p>Creada el {formatearFecha(orden.entryDate)}</p>
        </div>
        <Link className="button button-secondary" to="/orders">Volver a ordenes</Link>
      </div>

      <MensajeError mensaje={error} />

      <div className="detail-grid">
        <section className="panel">
          <h2>Moto y cliente</h2>
          <dl className="details">
            <dt>Placa</dt><dd>{moto?.plate || '—'}</dd>
            <dt>Moto</dt><dd>{moto ? `${moto.brand} ${moto.model}` : '—'}</dd>
            <dt>Cilindraje</dt><dd>{moto?.cylinder ? `${moto.cylinder} cc` : '—'}</dd>
            <dt>Cliente</dt><dd>{cliente?.name || '—'}</dd>
            <dt>Telefono</dt><dd>{cliente?.phone || '—'}</dd>
            <dt>Correo</dt><dd>{cliente?.email || '—'}</dd>
          </dl>
        </section>

        <section className="panel">
          <h2>Estado</h2>
          <p><span className={`status-badge status-${orden.status.toLowerCase()}`}>{orden.status.replace('_', ' ')}</span></p>
          <div className="transition-list">
            {transicionesPermitidas.length ? transicionesPermitidas.map((nuevoEstado) => (
              <button
                type="button"
                key={nuevoEstado}
                disabled={ocupado}
                className={nuevoEstado === 'CANCELADA' ? 'button-danger' : ''}
                onClick={() => ejecutarAccion(() => cambiarEstadoOrden(orden.id, nuevoEstado))}
              >
                {ocupado ? 'Guardando...' : `Cambiar a ${nuevoEstado.replace('_', ' ')}`}
              </button>
            )) : <p className="muted">Esta orden no admite mas cambios de estado.</p>}
          </div>
        </section>
      </div>

      <section className="panel">
        <h2>Falla reportada</h2>
        <p className="preserve-lines">{orden.faultDescription}</p>
      </section>

      <section className="panel">
        <div className="page-heading compact-heading">
          <h2>Items de la orden</h2>
          <strong className="order-total">Total: {formatearDinero(orden.total)}</strong>
        </div>
        {orden.items?.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Tipo</th><th>Descripcion</th><th>Cantidad</th><th>Valor unitario</th><th>Subtotal</th>{!esFinal && <th />}</tr></thead>
              <tbody>
                {orden.items.map((articulo) => (
                  <tr key={articulo.id}>
                    <td>{articulo.type === 'MANO_OBRA' ? 'Mano de obra' : 'Repuesto'}</td>
                    <td>{articulo.description}</td>
                    <td>{articulo.count}</td>
                    <td>{formatearDinero(articulo.unitValue)}</td>
                    <td>{formatearDinero(multiplicarDinero(articulo.unitValue, articulo.count))}</td>
                    {!esFinal && (
                      <td><button type="button" className="button-danger" disabled={ocupado} onClick={() => ejecutarAccion(() => quitarItem(articulo.id))}>Eliminar</button></td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="muted">Aun no hay items registrados.</p>}

        {!esFinal && (
          <form className="item-form" onSubmit={agregarItem}>
            <h3>Agregar item</h3>
            <div className="form-grid">
              <label className="field">
                Tipo
                <select value={tipo} onChange={(evento) => setTipo(evento.target.value)}>
                  <option value="MANO_OBRA">Mano de obra</option>
                  <option value="REPUESTO">Repuesto</option>
                </select>
              </label>
              <label className="field">
                Descripcion
                <input value={descripcion} onChange={(evento) => setDescripcion(evento.target.value)} required maxLength={255} />
              </label>
              <label className="field">
                Cantidad
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={cantidad}
                  onChange={(evento) => setCantidad(evento.target.value)}
                  required
                />
              </label>
              <label className="field">
                Valor unitario
                <input
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  value={valorUnitario}
                  onChange={(evento) => setValorUnitario(evento.target.value)}
                  placeholder="Ej. 25000 o 25000,50"
                  autoComplete="off"
                  required
                />
              </label>
            </div>
            <button type="submit" disabled={ocupado}>{ocupado ? 'Guardando...' : 'Agregar item'}</button>
          </form>
        )}
        {esFinal && <p className="muted">No se pueden modificar items de una orden finalizada o cancelada.</p>}
      </section>
    </section>
  );
}
