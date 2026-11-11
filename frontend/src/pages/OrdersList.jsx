import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listarOrdenes } from '../api/workOrders';
import { obtenerMensajeError } from '../api/http';
import { formatearFecha, formatearDinero, ESTADOS } from '../utils/orderStatus';
import Cargador from '../components/Loader.jsx';
import MensajeError from '../components/ErrorMessage.jsx';

export default function ListaOrdenes() {
  const navigate = useNavigate();
  const [ordenes, setOrdenes] = useState(null);
  const [estado, setEstado] = useState('');
  const [placa, setPlaca] = useState('');
  const [placaFiltrada, setPlacaFiltrada] = useState('');
  const [pagina, setPagina] = useState(1);
  const [recarga, setRecarga] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const temporizador = setTimeout(() => setPlacaFiltrada(placa.trim()), 400);
    return () => clearTimeout(temporizador);
  }, [placa]);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError('');
    listarOrdenes({ status: estado || undefined, plate: placaFiltrada || undefined, page: pagina, pageSize: 10 })
      .then((resultado) => {
        if (!Array.isArray(resultado?.data)) {
          throw new Error('La API devolvio un formato inesperado al cargar las ordenes.');
        }
        if (activo) setOrdenes(resultado);
      })
      .catch((errorSolicitud) => {
        if (activo) setError(obtenerMensajeError(errorSolicitud));
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [estado, placaFiltrada, pagina, recarga]);

  function cambiarEstado(valor) {
    setPagina(1);
    setEstado(valor);
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>Ordenes de trabajo</h1>
          <p>Consulta y administra las reparaciones del taller.</p>
        </div>
        <Link className="button" to="/orders/new">Nueva orden</Link>
      </div>

      <MensajeError mensaje={error} />

      <div className="panel filters">
        <label className="field">
          Estado
          <select value={estado} onChange={(evento) => cambiarEstado(evento.target.value)}>
            <option value="">Todos</option>
            {ESTADOS.map((valor) => <option key={valor} value={valor}>{valor.replace('_', ' ')}</option>)}
          </select>
        </label>
        <label className="field">
          Placa
          <input
            value={placa}
            onChange={(evento) => {
              setPlaca(evento.target.value.toUpperCase());
              setPagina(1);
            }}
            placeholder="Filtrar por placa"
            aria-label="Filtrar ordenes por placa"
          />
        </label>
        <button type="button" className="button-secondary filter-refresh" onClick={() => setRecarga((valor) => valor + 1)}>
          Actualizar
        </button>
      </div>

      {cargando && <Cargador texto={ordenes ? 'Actualizando ordenes...' : 'Cargando ordenes...'} />}
      {!cargando && error && (
        <div>
          <MensajeError mensaje={error} />
          <button type="button" className="button-secondary" onClick={() => setRecarga((valor) => valor + 1)}>
            Reintentar
          </button>
        </div>
      )}
      {!cargando && !error && Array.isArray(ordenes?.data) && ordenes.data.length === 0 && (
        <div className="panel empty-state">
          <h2>No hay ordenes para mostrar</h2>
          <p>Crea una orden nueva para comenzar a gestionar las reparaciones.</p>
          <Link className="button" to="/orders/new">Crear primera orden</Link>
        </div>
      )}

      {!cargando && !error && Array.isArray(ordenes?.data) && ordenes.data.length > 0 && (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Placa</th><th>Cliente</th><th>Estado</th><th>Fecha</th><th>Total</th></tr>
              </thead>
              <tbody>
                {ordenes.data.map((orden) => (
                  <tr
                    key={orden.id}
                    className="clickable-row"
                    tabIndex={0}
                    aria-label={`Abrir orden ${orden.id}`}
                    onClick={() => navigate(`/orders/${orden.id}`)}
                    onKeyDown={(evento) => {
                      if (evento.key === 'Enter' || evento.key === ' ') {
                        evento.preventDefault();
                        navigate(`/orders/${orden.id}`);
                      }
                    }}
                  >
                    <td><strong>{orden.bike?.plate || '—'}</strong></td>
                    <td>{orden.bike?.client?.name || '—'}</td>
                    <td><span className={`status-badge status-${orden.status.toLowerCase()}`}>{orden.status.replace('_', ' ')}</span></td>
                    <td>{formatearFecha(orden.entryDate)}</td>
                    <td>{formatearDinero(orden.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <span>{ordenes.total} orden(es) · Pagina {ordenes.page} de {ordenes.totalPages || 1}</span>
            <div>
              <button type="button" className="button-secondary" disabled={pagina <= 1 || cargando} onClick={() => setPagina((valor) => valor - 1)}>
                Anterior
              </button>
              <button type="button" className="button-secondary" disabled={pagina >= ordenes.totalPages || cargando} onClick={() => setPagina((valor) => valor + 1)}>
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
