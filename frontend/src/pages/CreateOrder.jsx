import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { crearMoto as registrarMoto, buscarMotos } from '../api/bikes';
import { crearCliente as registrarCliente, buscarClientes } from '../api/clients';
import { crearOrden as enviarOrden } from '../api/workOrders';
import { obtenerMensajeError } from '../api/http';
import MensajeError from '../components/ErrorMessage.jsx';
import Cargador from '../components/Loader.jsx';

export default function CrearOrden() {
  const navigate = useNavigate();
  const [placa, setPlaca] = useState('');
  const [coincidenciasMoto, setCoincidenciasMoto] = useState([]);
  const [moto, setMoto] = useState(null);
  const [buscoMoto, setBuscoMoto] = useState(false);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [clientes, setClientes] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [buscoCliente, setBuscoCliente] = useState(false);
  const [mostrarFormularioCliente, setMostrarFormularioCliente] = useState(false);
  const [nombreCliente, setNombreCliente] = useState('');
  const [telefonoCliente, setTelefonoCliente] = useState('');
  const [correoCliente, setCorreoCliente] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [cilindraje, setCilindraje] = useState('');
  const [descripcionFalla, setDescripcionFalla] = useState('');
  const [accionEnCurso, setAccionEnCurso] = useState('');
  const [error, setError] = useState('');

  async function buscarMoto(evento) {
    evento.preventDefault();
    const placaBuscada = placa.trim().toUpperCase();
    if (!placaBuscada) {
      setError('Ingresa la placa de la motocicleta.');
      return;
    }

    setAccionEnCurso('buscar-moto');
    setError('');
    setMoto(null);
    setCoincidenciasMoto([]);
    setBuscoMoto(false);
    setCliente(null);
    setClientes([]);
    setBuscoCliente(false);
    setMostrarFormularioCliente(false);
    try {
      const resultados = await buscarMotos(placaBuscada);
      setCoincidenciasMoto(resultados);
      setBuscoMoto(true);
      const coincidenciaExacta = resultados.find((resultado) => resultado.plate.trim().toUpperCase() === placaBuscada);
      if (coincidenciaExacta) {
        setMoto(coincidenciaExacta);
        setCliente(coincidenciaExacta.client);
        setPlaca(coincidenciaExacta.plate);
        setMarca(coincidenciaExacta.brand);
        setModelo(coincidenciaExacta.model);
        setCilindraje(coincidenciaExacta.cylinder ? String(coincidenciaExacta.cylinder) : '');
      } else {
        setMarca('');
        setModelo('');
        setCilindraje('');
      }
    } catch (errorSolicitud) {
      setError(obtenerMensajeError(errorSolicitud));
    } finally {
      setAccionEnCurso('');
    }
  }

  async function buscarCliente(evento) {
    evento.preventDefault();
    const textoBusqueda = busquedaCliente.trim();
    if (!textoBusqueda) {
      setError('Escribe el nombre o telefono para buscar un cliente.');
      return;
    }

    setAccionEnCurso('buscar-cliente');
    setError('');
    setClientes([]);
    setBuscoCliente(false);
    try {
      setClientes(await buscarClientes(textoBusqueda));
      setBuscoCliente(true);
    } catch (errorSolicitud) {
      setError(obtenerMensajeError(errorSolicitud));
    } finally {
      setAccionEnCurso('');
    }
  }

  function seleccionarCliente(clienteElegido) {
    setCliente(clienteElegido);
    setClientes([]);
    setBuscoCliente(false);
    setMostrarFormularioCliente(false);
    setMoto(null);
    setError('');
  }

  async function crearCliente(evento) {
    evento.preventDefault();
    if (!nombreCliente.trim() || !telefonoCliente.trim()) {
      setError('El nombre y el telefono del cliente son obligatorios.');
      return;
    }

    setAccionEnCurso('crear-cliente');
    setError('');
    try {
      const clienteCreado = await registrarCliente({
        name: nombreCliente.trim(),
        phone: telefonoCliente.trim(),
        email: correoCliente.trim() || undefined,
      });
      setCliente(clienteCreado);
      setNombreCliente('');
      setTelefonoCliente('');
      setCorreoCliente('');
      setBusquedaCliente('');
      setClientes([]);
      setBuscoCliente(false);
      setMostrarFormularioCliente(false);
    } catch (errorSolicitud) {
      setError(obtenerMensajeError(errorSolicitud));
    } finally {
      setAccionEnCurso('');
    }
  }

  async function crearMoto(evento) {
    evento.preventDefault();
    if (!cliente) {
      setError('Selecciona o registra primero al cliente de la motocicleta.');
      return;
    }
    if (!placa.trim() || !marca.trim() || !modelo.trim()) {
      setError('La placa, la marca y el modelo son obligatorios.');
      return;
    }
    if (cilindraje && (!Number.isInteger(Number(cilindraje)) || Number(cilindraje) < 1)) {
      setError('El cilindraje debe ser un entero mayor a 0.');
      return;
    }

    setAccionEnCurso('crear-moto');
    setError('');
    try {
      const motoCreada = await registrarMoto({
        plate: placa.trim(),
        brand: marca.trim(),
        model: modelo.trim(),
        cylinder: cilindraje ? Number(cilindraje) : null,
        clientId: cliente.id,
      });
      setMoto(motoCreada);
      setBuscoMoto(true);
    } catch (errorSolicitud) {
      setError(obtenerMensajeError(errorSolicitud));
    } finally {
      setAccionEnCurso('');
    }
  }

  async function crearOrden(evento) {
    evento.preventDefault();
    if (!moto) {
      setError('Busca una motocicleta existente o registra una nueva antes de crear la orden.');
      return;
    }
    if (!descripcionFalla.trim()) {
      setError('La descripcion de la falla es obligatoria.');
      return;
    }

    setAccionEnCurso('crear-orden');
    setError('');
    try {
      const orden = await enviarOrden({
        bikeId: moto.id,
        faultDescription: descripcionFalla.trim(),
      });
      navigate(`/orders/${orden.id}`);
    } catch (errorSolicitud) {
      setError(obtenerMensajeError(errorSolicitud));
    } finally {
      setAccionEnCurso('');
    }
  }

  const ocupado = Boolean(accionEnCurso);
  const puedeRegistrarMoto = Boolean(cliente && !moto);

  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>Nueva orden de trabajo</h1>
          <p>Busca una motocicleta existente o registra al cliente y su moto.</p>
        </div>
        <Link className="button button-secondary" to="/orders">Volver a ordenes</Link>
      </div>

      <MensajeError mensaje={error} />

      <section className="panel">
        <h2>1. Buscar motocicleta por placa (opcional)</h2>
        <form className="inline-form" onSubmit={buscarMoto}>
          <label className="field grow">
            Placa
            <input
              value={placa}
              onChange={(evento) => {
                setPlaca(evento.target.value.toUpperCase());
                setMoto(null);
                setCoincidenciasMoto([]);
                setBuscoMoto(false);
                setCliente(null);
                setMarca('');
                setModelo('');
                setCilindraje('');
              }}
              maxLength={10}
              placeholder="Ej. ABC123"
            />
          </label>
          <button type="submit" disabled={ocupado}>
            {accionEnCurso === 'buscar-moto' ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {moto && (
          <div className="success-box">
            <strong>Motocicleta seleccionada: {moto.plate}</strong>
            <span>{moto.brand} {moto.model}{moto.cylinder ? ` · ${moto.cylinder} cc` : ''}</span>
            <span>Cliente: {moto.client?.name || cliente?.name || 'Sin cliente'}</span>
            {(moto.client?.phone || cliente?.phone) && <span>Telefono: {moto.client?.phone || cliente.phone}</span>}
          </div>
        )}

        {buscoMoto && !moto && (
          <div className="info-box">
            {coincidenciasMoto.length
              ? `No hay coincidencia exacta para ${placa}. Puedes registrar la placa ingresada.`
              : `No encontramos la placa ${placa}. Puedes registrar la motocicleta.`}
          </div>
        )}
      </section>

      {!moto && (
        <section className="panel">
          <h2>2. Seleccionar o registrar cliente</h2>
          {cliente ? (
            <div className="success-box compact">
              <strong>Cliente seleccionado: {cliente.name}</strong>
              <span>{cliente.phone}{cliente.email ? ` · ${cliente.email}` : ''}</span>
              <button type="button" className="button-secondary" disabled={ocupado} onClick={() => seleccionarCliente(null)}>
                Cambiar cliente
              </button>
            </div>
          ) : (
            <>
              <form className="inline-form" onSubmit={buscarCliente}>
                <label className="field grow">
                  Buscar cliente por nombre o telefono (opcional)
                  <input
                    value={busquedaCliente}
                    onChange={(evento) => {
                      setBusquedaCliente(evento.target.value);
                      setClientes([]);
                      setBuscoCliente(false);
                    }}
                  />
                </label>
                <button type="submit" className="button-secondary" disabled={ocupado}>
                  {accionEnCurso === 'buscar-cliente' ? 'Buscando...' : 'Buscar cliente'}
                </button>
                <button
                  type="button"
                  disabled={ocupado}
                  onClick={() => {
                    setMostrarFormularioCliente((valor) => !valor);
                    setError('');
                  }}
                >
                  {mostrarFormularioCliente ? 'Cancelar' : 'Registrar cliente nuevo'}
                </button>
              </form>

              {buscoCliente && clientes.length > 0 && (
                <div className="result-list">
                  {clientes.map((resultado) => (
                    <button type="button" className="result-option" key={resultado.id} onClick={() => seleccionarCliente(resultado)}>
                      <strong>{resultado.name}</strong>
                      <span>{resultado.phone}{resultado.email ? ` · ${resultado.email}` : ''}</span>
                    </button>
                  ))}
                </div>
              )}
              {buscoCliente && clientes.length === 0 && (
                <div className="info-box">No encontramos clientes con esos datos. Puedes registrarlo sin hacer otra busqueda.</div>
              )}

              {mostrarFormularioCliente && (
                <form className="subsection" onSubmit={crearCliente}>
                  <div className="form-grid">
                    <label className="field">
                      Nombre
                      <input value={nombreCliente} onChange={(evento) => setNombreCliente(evento.target.value)} required maxLength={120} />
                    </label>
                    <label className="field">
                      Telefono
                      <input value={telefonoCliente} onChange={(evento) => setTelefonoCliente(evento.target.value)} required maxLength={30} />
                    </label>
                    <label className="field">
                      Correo (opcional)
                      <input type="email" value={correoCliente} onChange={(evento) => setCorreoCliente(evento.target.value)} maxLength={150} />
                    </label>
                  </div>
                  <button type="submit" disabled={ocupado}>
                    {accionEnCurso === 'crear-cliente' ? 'Guardando cliente...' : 'Guardar cliente'}
                  </button>
                </form>
              )}
            </>
          )}
        </section>
      )}

      {!moto && (
        <section className="panel">
          <h2>3. Registrar motocicleta</h2>
          <form onSubmit={crearMoto}>
            <div className="form-grid">
              <label className="field">
                Placa
                <input
                  value={placa}
                  onChange={(evento) => {
                    setPlaca(evento.target.value.toUpperCase());
                    setBuscoMoto(false);
                    setCoincidenciasMoto([]);
                  }}
                  required
                  maxLength={10}
                  placeholder="Ej. ABC123"
                />
              </label>
              <label className="field">
                Marca
                <input value={marca} onChange={(evento) => setMarca(evento.target.value)} required maxLength={60} />
              </label>
              <label className="field">
                Modelo
                <input value={modelo} onChange={(evento) => setModelo(evento.target.value)} required maxLength={60} />
              </label>
              <label className="field">
                Cilindraje (opcional)
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={cilindraje}
                  onChange={(evento) => setCilindraje(evento.target.value)}
                />
              </label>
            </div>
            {!cliente && <p className="muted">Selecciona o registra un cliente para habilitar el registro de la moto.</p>}
            <button type="submit" disabled={ocupado || !puedeRegistrarMoto}>
              {accionEnCurso === 'crear-moto' ? 'Registrando motocicleta...' : 'Registrar motocicleta'}
            </button>
          </form>
        </section>
      )}

      <form className="panel" onSubmit={crearOrden}>
        <h2>4. Crear orden</h2>
        <label className="field">
          Describe la falla reportada
          <textarea
            value={descripcionFalla}
            onChange={(evento) => setDescripcionFalla(evento.target.value)}
            required
            rows={4}
          />
        </label>
        {!moto && <p className="muted">Selecciona una moto existente o registra una nueva para completar la orden.</p>}
        <div className="form-actions">
          <button type="submit" disabled={ocupado || !moto || !descripcionFalla.trim()}>
            {accionEnCurso === 'crear-orden' ? 'Creando orden...' : 'Crear orden'}
          </button>
          {accionEnCurso === 'crear-orden' && <Cargador texto="Creando orden..." />}
        </div>
      </form>
    </section>
  );
}
