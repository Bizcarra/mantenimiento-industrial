import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ticketsAPI } from '../services/api';
import styles from './TicketDetalle.module.css';

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

  useEffect(() => {
    cargarDetalle();
  }, [id]);

  const cargarDetalle = async () => {
    try {
      setCargando(true);
      const response = await ticketsAPI.obtener(id);
      setTicket(response.data.ticket);
      setHistorial(response.data.historial);
      setNuevoEstado(response.data.ticket.estado);
      setNuevaPrioridad(response.data.ticket.prioridad);
    } catch (error) {
      console.error('Error al cargar ticket:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleCambiarEstado = async () => {
    try {
      await ticketsAPI.cambiarEstado(id, nuevoEstado);
      cargarDetalle();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
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

  const handleAsignarTecnico = async () => {
    const tecnicoId = prompt('Ingresa el ID del técnico:');
    if (tecnicoId) {
      try {
        await ticketsAPI.asignar(id, tecnicoId);
        cargarDetalle();
      } catch (error) {
        console.error('Error al asignar técnico:', error);
      }
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

  return (
    <div className={styles.container}>
      <button onClick={() => navigate('/tickets')} className={styles.volverBtn}>
        ← Volver
      </button>

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

          <div className={styles.metadata}>
            <div><strong>Área:</strong> {ticket.area}</div>
            <div><strong>Solicitante:</strong> {ticket.solicitante?.nombre}</div>
            <div><strong>Técnico:</strong> {ticket.tecnicoAsignado?.nombre || 'Sin asignar'}</div>
            <div><strong>Creado:</strong> {new Date(ticket.fechaSolicitud).toLocaleString()}</div>
            {ticket.tiempoTranscurridoMinutos && (
              <div><strong>Tiempo:</strong> {ticket.tiempoTranscurridoMinutos} min</div>
            )}
          </div>

          {(usuario?.rol === 'admin' || usuario?.rol === 'tecnico') && (
            <div className={styles.controles}>
              <div className={styles.grupo}>
                <select value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value)}>
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
                      onChange={(e) => setNuevaPrioridad(e.target.value)}
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

                  <button onClick={handleAsignarTecnico} className={styles.botonAccion}>
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

        {(usuario?.rol === 'admin' || usuario?.rol === 'tecnico') && (
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
              {historial.map((cambio, index) => (
                <div key={index} className={styles.entrada}>
                  <div className={styles.linea1}>
                    <strong>{cambio.tipoDeAccion}</strong>
                    <span className={styles.fecha}>
                      {new Date(cambio.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.linea2}>
                    <span className={styles.usuario}>{cambio.usuarioQueCambia?.nombre}</span>
                    <span className={styles.detalles}>{cambio.detalles}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
