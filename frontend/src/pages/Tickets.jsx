import React, { useState, useEffect, useContext } from 'react';
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
  const [filtros, setFiltros] = useState({
    estado: '',
    prioridad: '',
    area: '',
  });

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    area: '',
    prioridad: 'media',
  });

  useEffect(() => {
    cargarTickets();
  }, [filtros]);

  const cargarTickets = async () => {
    try {
      setCargando(true);
      const response = await ticketsAPI.listar(filtros);
      setTickets(response.data);
    } catch (error) {
      console.error('Error al cargar tickets:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleCrearTicket = async (e) => {
    e.preventDefault();
    try {
      await ticketsAPI.crear(formData);
      setFormData({ titulo: '', descripcion: '', area: '', prioridad: 'media' });
      setMostrarForm(false);
      cargarTickets();
    } catch (error) {
      console.error('Error al crear ticket:', error);
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
        <h1>Gestión de Tickets</h1>
        {usuario?.rol !== 'admin' && (
          <button
            className={styles.botonCrear}
            onClick={() => setMostrarForm(!mostrarForm)}
          >
            {mostrarForm ? 'Cancelar' : '+ Nuevo Ticket'}
          </button>
        )}
      </div>

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
            />
          </div>

          <div className={styles.grupo}>
            <label>Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              required
              rows="4"
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

          <button type="submit" className={styles.botonEnviar}>
            Crear Ticket
          </button>
        </form>
      )}

      <div className={styles.filtros}>
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

              <p className={styles.descripcion}>{ticket.descripcion.substring(0, 100)}...</p>

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
                <span className={styles.fecha}>
                  {new Date(ticket.fechaSolicitud).toLocaleDateString()}
                </span>
                {ticket.tecnicoAsignado && (
                  <span className={styles.tecnico}>
                    {ticket.tecnicoAsignado.nombre}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
