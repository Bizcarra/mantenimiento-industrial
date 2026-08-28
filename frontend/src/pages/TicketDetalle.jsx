import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ticketsAPI } from '../services/api';
import { ModalAsignarTecnico } from '../components/ModalAsignarTecnico';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import styles from './TicketDetalle.module.css';

const etiquetasAccion = {
  creacion: 'Creación del ticket',
  cambio_estado: 'Cambio de estado',
  asignacion: 'Asignación de técnico',
  cambio_prioridad: 'Cambio de prioridad',
  resolucion: 'Solución registrada',
  comentario: 'Comentario',
};

const etiquetaEstado = (estado) => ({
  abierto: 'Abierto',
  en_progreso: 'En progreso',
  pausado: 'Pausado',
  resuelto: 'Resuelto',
  cerrado: 'Cerrado',
}[estado] || estado || 'Sin estado');

const formatearFechaHora = (fecha) => new Date(fecha).toLocaleString('es-CL', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export const TicketDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useContext(AuthContext);
  const [ticket, setTicket] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [nuevaPrioridad, setNuevaPrioridad] = useState('');
  const [solucion, setSolucion] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const [fotoUrl, setFotoUrl] = useState('');
  const [cargandoFoto, setCargandoFoto] = useState(false);
  const [errorFoto, setErrorFoto] = useState('');
  const [rotandoFoto, setRotandoFoto] = useState(false);
  const ticketActualRef = useRef(null);
  const estadoSeleccionadoRef = useRef('');
  const prioridadSeleccionadaRef = useRef('');

  const cargarDetalle = useCallback(async ({ silencioso = false } = {}) => {
    try {
      if (!silencioso) setCargando(true);
      const response = await ticketsAPI.obtener(id);
      const ticketNuevo = response.data.ticket;
      const ticketAnterior = ticketActualRef.current;

      if (
        !silencioso ||
        !ticketAnterior ||
        estadoSeleccionadoRef.current === ticketAnterior.estado
      ) {
        estadoSeleccionadoRef.current = ticketNuevo.estado;
        setNuevoEstado(ticketNuevo.estado);
      }

      if (
        !silencioso ||
        !ticketAnterior ||
        prioridadSeleccionadaRef.current === ticketAnterior.prioridad
      ) {
        prioridadSeleccionadaRef.current = ticketNuevo.prioridad;
        setNuevaPrioridad(ticketNuevo.prioridad);
      }

      ticketActualRef.current = ticketNuevo;
      setTicket(ticketNuevo);
      setHistorial(response.data.historial);
      setUltimaActualizacion(new Date());
    } catch (error) {
      console.error('Error al cargar ticket:', error);
      if (error.response?.status === 404) {
        ticketActualRef.current = null;
        setTicket(null);
        setHistorial([]);
      }
    } finally {
      if (!silencioso) setCargando(false);
    }
  }, [id]);

  useEffect(() => {
    cargarDetalle();
  }, [cargarDetalle]);

  useAutoRefresh(() => cargarDetalle({ silencioso: true }));

  const fechaFoto = ticket?.evidenciaFoto?.fechaCarga || '';
  useEffect(() => {
    if (!fechaFoto) {
      setFotoUrl('');
      setCargandoFoto(false);
      setErrorFoto('');
      return undefined;
    }

    const controlador = new AbortController();
    let urlTemporal = '';
    setFotoUrl('');
    setCargandoFoto(true);
    setErrorFoto('');

    ticketsAPI.obtenerFoto(id, { signal: controlador.signal })
      .then((response) => {
        urlTemporal = URL.createObjectURL(response.data);
        setFotoUrl(urlTemporal);
      })
      .catch((error) => {
        if (error.code !== 'ERR_CANCELED') {
          console.error('Error al cargar la foto del ticket:', error);
          setErrorFoto('No fue posible cargar la foto de evidencia.');
        }
      })
      .finally(() => {
        if (!controlador.signal.aborted) setCargandoFoto(false);
      });

    return () => {
      controlador.abort();
      if (urlTemporal) URL.revokeObjectURL(urlTemporal);
    };
  }, [id, fechaFoto]);

  const handleCambiarEstado = async () => {
    try {
      await ticketsAPI.cambiarEstado(id, nuevoEstado);
      cargarDetalle();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  const handleRotarFoto = async (grados) => {
    setRotandoFoto(true);
    setErrorFoto('');
    try {
      await ticketsAPI.rotarFoto(id, grados);
      await cargarDetalle();
    } catch (error) {
      console.error('Error al girar la foto:', error);
      setErrorFoto(error.response?.data?.mensaje || 'No fue posible girar la foto.');
    } finally {
      setRotandoFoto(false);
    }
  };

  const handleCambiarPrioridad = async () => {
    try {
      await ticketsAPI.cambiarPrioridad(id, nuevaPrioridad);
      cargarDetalle();
    } catch (error) {
      console.error('Error al cambiar prioridad:', error);
    }
  };

  const handleFinalizarTicket = async () => {
    try {
      await ticketsAPI.finalizarTicket(id, solucion);
      cargarDetalle();
      setSolucion('');
    } catch (error) {
      console.error('Error al finalizar ticket:', error);
    }
  };

  const handleAsignarTecnico = async (tecnicoId) => {
    try {
      const response = await ticketsAPI.asignar(id, tecnicoId);
      setTicket(response.data.ticket);
      await cargarDetalle();
      return response;
    } catch (error) {
      console.error('Error al asignar técnico:', error);
      throw error;
    }
  };

  if (cargando) {
    return <div className={styles.cargando}>Cargando...</div>;
  }

  if (!ticket) {
    return <div className={styles.error}>Ticket no encontrado</div>;
  }

  const getPrioridadColor = (prioridad) => {
    const colores = {
      baja: '#4caf50',
      media: '#ff9800',
      alta: '#f44336',
      critica: '#9c27b0',
    };
    return colores[prioridad] || '#999';
  };

  const getEstadoColor = (estado) => {
    const colores = {
      abierto: '#2196f3',
      en_progreso: '#ff9800',
      pausado: '#9c27b0',
      resuelto: '#4caf50',
      cerrado: '#999',
    };
    return colores[estado] || '#999';
  };

  const tecnicoAsignadoId = ticket.tecnicoAsignado?._id || ticket.tecnicoAsignado;
  const solicitanteId = ticket.solicitante?._id || ticket.solicitante;
  const puedeGestionar = usuario?.rol === 'admin' ||
    (usuario?.rol === 'tecnico' && tecnicoAsignadoId === usuario?._id);
  const puedeAjustarFoto = usuario?.rol === 'admin' ||
    tecnicoAsignadoId === usuario?._id ||
    solicitanteId === usuario?._id;
  const ultimoCambioEstado = historial.find((cambio) => cambio.tipoDeAccion === 'cambio_estado');

  return (
    <div className={styles.container}>
      <button onClick={() => navigate('/tickets')} className={styles.volverBtn}>
        ← Volver
      </button>

      <div className={styles.actualizacion}>
        <span aria-hidden="true" />
        Actualización automática cada 10 segundos
        {ultimaActualizacion && ` · ${ultimaActualizacion.toLocaleTimeString()}`}
      </div>

      <div className={styles.header}>
        <div className={styles.titulo}>
          <h1>{ticket.titulo}</h1>
          <span className={styles.numero}>#{ticket.numeroTicket}</span>
        </div>
        <div className={styles.badges}>
          <span
            className={styles.badge}
            style={{ backgroundColor: getPrioridadColor(ticket.prioridad) }}
          >
            {ticket.prioridad}
          </span>
          <span
            className={styles.badge}
            style={{ backgroundColor: getEstadoColor(ticket.estado) }}
          >
            {ticket.estado}
          </span>
        </div>
      </div>

      <div className={styles.contenido}>
        <div className={styles.panel}>
          <p className={styles.descripcion}>{ticket.descripcion}</p>

          {ticket.evidenciaFoto && (
            <div className={styles.evidencia}>
              <strong>Foto de evidencia</strong>
              {cargandoFoto && <p>Cargando foto protegida...</p>}
              {errorFoto && <p className={styles.errorFoto}>{errorFoto}</p>}
              {fotoUrl && (
                <a href={fotoUrl} target="_blank" rel="noreferrer">
                  <img src={fotoUrl} alt={`Evidencia del daño en ${ticket.numeroTicket}`} />
                </a>
              )}
              {puedeAjustarFoto && (
                <div className={styles.controlesFoto}>
                  <button
                    type="button"
                    onClick={() => handleRotarFoto(270)}
                    disabled={rotandoFoto}
                  >
                    ↶ Girar izquierda
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRotarFoto(90)}
                    disabled={rotandoFoto}
                  >
                    Girar derecha ↷
                  </button>
                </div>
              )}
              <small>Solo es visible para usuarios autorizados de este ticket.</small>
            </div>
          )}

          <div className={styles.metadata}>
            <div><strong>Área:</strong> {ticket.area}</div>
            <div><strong>Solicitante:</strong> {ticket.solicitante?.nombre}</div>
            <div><strong>Técnico:</strong> {ticket.tecnicoAsignado?.nombre || 'Sin asignar'}</div>
            <div><strong>Creado:</strong> {new Date(ticket.fechaSolicitud).toLocaleString()}</div>
            {ultimoCambioEstado && (
              <div>
                <strong>Último cambio de estado:</strong>
                {formatearFechaHora(ultimoCambioEstado.timestamp)}
              </div>
            )}
            {ticket.tiempoTranscurridoMinutos && (
              <div><strong>Tiempo:</strong> {ticket.tiempoTranscurridoMinutos} min</div>
            )}
            {ticket.eliminarDespuesDe && (
              <div>
                <strong>Eliminación automática:</strong>
                {formatearFechaHora(ticket.eliminarDespuesDe)}
              </div>
            )}
          </div>

          {puedeGestionar && (
            <div className={styles.controles}>
              <div className={styles.grupo}>
                <select
                  value={nuevoEstado}
                  onChange={(e) => {
                    estadoSeleccionadoRef.current = e.target.value;
                    setNuevoEstado(e.target.value);
                  }}
                >
                  <option value="abierto">Abierto</option>
                  <option value="en_progreso">En Progreso</option>
                  <option value="pausado">Pausado</option>
                  <option value="resuelto">Resuelto</option>
                  <option value="cerrado">Cerrado</option>
                </select>
                <button
                  onClick={handleCambiarEstado}
                  className={styles.botonAccion}
                  disabled={nuevoEstado === ticket.estado}
                >
                  Cambiar Estado
                </button>
              </div>

              {usuario?.rol === 'admin' && (
                <>
                  <div className={styles.grupo}>
                    <select
                      value={nuevaPrioridad}
                      onChange={(e) => {
                        prioridadSeleccionadaRef.current = e.target.value;
                        setNuevaPrioridad(e.target.value);
                      }}
                    >
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                      <option value="critica">Crítica</option>
                    </select>
                    <button
                      onClick={handleCambiarPrioridad}
                      className={styles.botonAccion}
                      disabled={nuevaPrioridad === ticket.prioridad}
                    >
                      Cambiar Prioridad
                    </button>
                  </div>

                  <button
                    onClick={() => setModalAbierto(true)}
                    className={styles.botonAccion}
                  >
                    {ticket.tecnicoAsignado ? 'Cambiar Técnico' : 'Asignar Técnico'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {ticket.descripcionSolucion && (
          <div className={styles.panelSolucion}>
            <h3>Solución</h3>
            <p>{ticket.descripcionSolucion}</p>
            {ticket.usuarioSolucion && (
              <p className={styles.autor}>— {ticket.usuarioSolucion.nombre}</p>
            )}
          </div>
        )}

        {puedeGestionar && (
          <div className={styles.panel}>
            <h3>Registrar Solución</h3>
            <textarea
              value={solucion}
              onChange={(e) => setSolucion(e.target.value)}
              placeholder="Describe la solución, cambios realizados, repuestos utilizados..."
              rows="3"
              className={styles.textarea}
            />
            <button onClick={handleFinalizarTicket} className={styles.botonEnviar}>
              Guardar
            </button>
          </div>
        )}

        <div className={styles.panel}>
          <h3>Historial</h3>
          {historial.length === 0 ? (
            <p className={styles.vacio}>Sin cambios</p>
          ) : (
            <div className={styles.historial}>
              {historial.map((cambio) => (
                <div
                  key={cambio._id}
                  className={`${styles.entrada} ${
                    cambio.tipoDeAccion === 'cambio_estado' ? styles.cambioEstado : ''
                  }`}
                >
                  <div className={styles.linea1}>
                    <strong>{etiquetasAccion[cambio.tipoDeAccion] || cambio.tipoDeAccion}</strong>
                    <time className={styles.fecha} dateTime={cambio.timestamp}>
                      {formatearFechaHora(cambio.timestamp)}
                    </time>
                  </div>
                  <div className={styles.linea2}>
                    <span className={styles.usuario}>{cambio.usuarioQueCambia?.nombre}</span>
                    <div className={styles.detalles}>
                      {cambio.tipoDeAccion === 'cambio_estado' && (
                        <div className={styles.transicionEstado}>
                          <span>{etiquetaEstado(cambio.datosAnteriores?.estado)}</span>
                          <b aria-hidden="true">→</b>
                          <span>{etiquetaEstado(cambio.datosNuevos?.estado)}</span>
                        </div>
                      )}
                      <span>{cambio.detalles}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ModalAsignarTecnico
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onSeleccionar={handleAsignarTecnico}
        tecnicoActual={ticket?.tecnicoAsignado?._id}
      />
    </div>
  );
};
