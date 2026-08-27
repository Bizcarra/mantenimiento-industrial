import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ticketsAPI } from '../services/api';
import styles from './Tickets.module.css';

export const Tickets = () => {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [eliminandoId, setEliminandoId] = useState('');
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const [filtros, setFiltros] = useState({
    estado: '',
    prioridad: '',
    area: '',
    fechaDesde: '',
    fechaHasta: '',
  });

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    area: '',
    prioridad: 'media',
  });

  const cargarTickets = useCallback(async ({ silencioso = false } = {}) => {
    try {
      if (!silencioso) setCargando(true);
      const filtrosActivos = Object.fromEntries(
        Object.entries(filtros).filter(([, valor]) =>
          typeof valor !== 'string' || valor.trim() !== ''
        )
      );
      const response = await ticketsAPI.listar(filtrosActivos);
      setTickets(response.data);
      setUltimaActualizacion(new Date());
      setMensajeError('');
    } catch (error) {
      console.error('Error al cargar tickets:', error);
      setMensajeError(
        error.response?.data?.mensaje || 'No fue posible cargar los tickets.'
      );
    } finally {
      if (!silencioso) setCargando(false);
    }
  }, [filtros]);

  useEffect(() => {
    cargarTickets();

    const actualizarSiVisible = () => {
      if (!document.hidden) cargarTickets({ silencioso: true });
    };
    const temporizador = window.setInterval(actualizarSiVisible, 10000);
    window.addEventListener('focus', actualizarSiVisible);
    document.addEventListener('visibilitychange', actualizarSiVisible);

    return () => {
      window.clearInterval(temporizador);
      window.removeEventListener('focus', actualizarSiVisible);
      document.removeEventListener('visibilitychange', actualizarSiVisible);
    };
  }, [cargarTickets]);

  const handleCrearTicket = async (e) => {
    e.preventDefault();
    setMensajeError('');
    setMensajeExito('');
    setEnviando(true);
    try {
      const response = await ticketsAPI.crear(formData);
      setFormData({ titulo: '', descripcion: '', area: '', prioridad: 'media' });
      setMostrarForm(false);
      setMensajeExito(
        `${response.data.ticket.numeroTicket || 'Ticket'} creado correctamente`
      );
      await cargarTickets();
    } catch (error) {
      console.error('Error al crear ticket:', error);
      setMensajeError(
        error.response?.data?.mensaje || 'No fue posible crear el ticket. Intenta nuevamente.'
      );
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminarTicket = async (event, ticket) => {
    event.stopPropagation();
    const confirmado = window.confirm(
      `¿Eliminar definitivamente ${ticket.numeroTicket || 'este ticket'}: "${ticket.titulo}"?\n\nTambién se eliminará su historial. Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    setEliminandoId(ticket._id);
    setMensajeError('');
    setMensajeExito('');
    try {
      const response = await ticketsAPI.eliminar(ticket._id);
      setTickets((actuales) => actuales.filter((item) => item._id !== ticket._id));
      setMensajeExito(response.data.mensaje);
      await cargarTickets({ silencioso: true });
    } catch (error) {
      setMensajeError(
        error.response?.data?.mensaje || 'No fue posible eliminar el ticket.'
      );
    } finally {
      setEliminandoId('');
    }
  };

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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Gestión de Tickets</h1>
          <p className={styles.actualizacion}>
            <span aria-hidden="true" />
            Actualización automática cada 10 segundos
            {ultimaActualizacion && ` · ${ultimaActualizacion.toLocaleTimeString()}`}
          </p>
        </div>
        {['admin', 'solicitante', 'tecnico'].includes(usuario?.rol) && (
          <button
            className={styles.botonCrear}
            onClick={() => {
              setMostrarForm(!mostrarForm);
              setMensajeError('');
              setMensajeExito('');
            }}
          >
            {mostrarForm ? 'Cancelar' : '+ Nuevo Ticket'}
          </button>
        )}
      </div>

      {mensajeError && <div className={styles.mensajeError}>{mensajeError}</div>}
      {mensajeExito && <div className={styles.mensajeExito}>{mensajeExito}</div>}

      {mostrarForm && (
        <form className={styles.formulario} onSubmit={handleCrearTicket}>
          <h2>Crear Nuevo Ticket</h2>

          <div className={styles.grupo}>
            <label>Título</label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              required
              minLength="3"
              maxLength="120"
            />
          </div>

          <div className={styles.grupo}>
            <label>Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              required
              rows="4"
              minLength="10"
              maxLength="5000"
            />
          </div>

          <div className={styles.grupoFila}>
            <div className={styles.grupo}>
              <label>Área</label>
              <input
                type="text"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                required
                minLength="2"
                maxLength="100"
              />
            </div>

            <div className={styles.grupo}>
              <label>Prioridad</label>
              <select
                value={formData.prioridad}
                onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>
          </div>

          <button type="submit" className={styles.botonEnviar} disabled={enviando}>
            {enviando ? 'Creando...' : 'Crear Ticket'}
          </button>
        </form>
      )}

      <div className={styles.filtros}>
        <label className={styles.filtroCampo}>
          <span>Estado</span>
          <select
            value={filtros.estado}
            onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
          >
            <option value="">Todos los estados</option>
            <option value="abierto">Abierto</option>
            <option value="en_progreso">En Progreso</option>
            <option value="pausado">Pausado</option>
            <option value="resuelto">Resuelto</option>
            <option value="cerrado">Cerrado</option>
          </select>
        </label>

        <label className={styles.filtroCampo}>
          <span>Prioridad</span>
          <select
            value={filtros.prioridad}
            onChange={(e) => setFiltros({ ...filtros, prioridad: e.target.value })}
          >
            <option value="">Todas las prioridades</option>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </select>
        </label>

        <label className={styles.filtroCampo}>
          <span>Área</span>
          <input
            type="search"
            value={filtros.area}
            onChange={(e) => setFiltros({ ...filtros, area: e.target.value })}
            placeholder="Todas las áreas"
            maxLength={100}
          />
        </label>

        <label className={styles.filtroCampo}>
          <span>Desde</span>
          <input
            type="date"
            value={filtros.fechaDesde}
            max={filtros.fechaHasta || undefined}
            onChange={(e) => setFiltros({ ...filtros, fechaDesde: e.target.value })}
          />
        </label>

        <label className={styles.filtroCampo}>
          <span>Hasta</span>
          <input
            type="date"
            value={filtros.fechaHasta}
            min={filtros.fechaDesde || undefined}
            onChange={(e) => setFiltros({ ...filtros, fechaHasta: e.target.value })}
          />
        </label>

        <button
          type="button"
          className={styles.limpiarFiltros}
          onClick={() => setFiltros({
            estado: '',
            prioridad: '',
            area: '',
            fechaDesde: '',
            fechaHasta: '',
          })}
          disabled={!Object.values(filtros).some(Boolean)}
        >
          Limpiar filtros
        </button>
      </div>

      {cargando ? (
        <div className={styles.cargando}>Cargando tickets...</div>
      ) : tickets.length === 0 ? (
        <div className={styles.vacio}>No hay tickets</div>
      ) : (
        <div className={styles.lista}>
          {tickets.map((ticket) => (
            <div
              key={ticket._id}
              className={styles.ticket}
              onClick={() => navigate(`/tickets/${ticket._id}`)}
            >
              <div className={styles.encabezado}>
                <h3>{ticket.titulo}</h3>
                <span className={styles.numero}>{ticket.numeroTicket}</span>
              </div>

              <p className={styles.descripcion} title={ticket.descripcion}>{ticket.descripcion}</p>

              <div className={styles.tags}>
                <span
                  className={styles.tag}
                  style={{ backgroundColor: getPrioridadColor(ticket.prioridad) }}
                >
                  {ticket.prioridad}
                </span>
                <span
                  className={styles.tag}
                  style={{ backgroundColor: getEstadoColor(ticket.estado) }}
                >
                  {ticket.estado}
                </span>
                <span className={styles.tag}>{ticket.area}</span>
              </div>

              <div className={styles.footer}>
                <div className={styles.origen}>
                  <span className={styles.fecha}>
                    {new Date(ticket.fechaSolicitud).toLocaleDateString()}
                  </span>
                  {ticket.solicitante?.nombre && (
                    <span className={styles.solicitante}>Por: {ticket.solicitante.nombre}</span>
                  )}
                </div>
                {ticket.tecnicoAsignado && (
                  <span className={styles.tecnico}>
                    {ticket.tecnicoAsignado.nombre}
                  </span>
                )}
              </div>
              {usuario?.rol === 'admin' && (
                <button
                  type="button"
                  className={styles.botonEliminar}
                  onClick={(event) => handleEliminarTicket(event, ticket)}
                  disabled={eliminandoId === ticket._id}
                >
                  {eliminandoId === ticket._id ? 'Eliminando...' : 'Eliminar ticket'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
