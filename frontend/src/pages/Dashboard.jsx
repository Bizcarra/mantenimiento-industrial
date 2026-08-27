import React, { useCallback, useEffect, useState } from 'react';
import { dashboardAPI } from '../services/api';
import { FiltroFecha } from '../components/FiltroFecha';
import styles from './Dashboard.module.css';

const etiquetas = {
  abierto: 'Abiertos',
  en_progreso: 'En progreso',
  pausado: 'Pausados',
  resuelto: 'Resueltos',
  cerrado: 'Cerrados',
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  critica: 'Crítica',
};

const coloresEstado = {
  abierto: '#2f80ed',
  en_progreso: '#f2994a',
  pausado: '#9b51e0',
  resuelto: '#27ae60',
  cerrado: '#7f8c8d',
};

const coloresPrioridad = {
  baja: '#27ae60',
  media: '#f2c94c',
  alta: '#eb5757',
  critica: '#9b51e0',
};

const formatearTiempo = (minutos) => {
  if (minutos === null || minutos === undefined) return 'Sin datos';
  if (minutos < 1) return '< 1 min';
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto ? `${horas} h ${resto} min` : `${horas} h`;
};

const GraficoBarras = ({ titulo, datos = [], colores = {} }) => {
  const maximo = Math.max(1, ...datos.map((item) => item.count));

  return (
    <section className={styles.panel}>
      <h2>{titulo}</h2>
      {datos.length === 0 ? (
        <p className={styles.sinDatos}>No hay información para este período.</p>
      ) : (
        <div className={styles.barras}>
          {datos.map((item) => (
            <div key={item._id || 'sin-area'} className={styles.barra}>
              <span className={styles.etiqueta}>{etiquetas[item._id] || item._id || 'Sin área'}</span>
              <div className={styles.pistaBarra}>
                <div
                  className={styles.barraLlena}
                  style={{
                    width: `${(item.count / maximo) * 100}%`,
                    background: colores[item._id] || 'linear-gradient(90deg, #667eea, #764ba2)',
                  }}
                />
              </div>
              <strong className={styles.cantidad}>{item.count}</strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [desempenio, setDesempenio] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const [filtros, setFiltros] = useState({ fechaDesde: '', fechaHasta: '' });

  const cargarDashboard = useCallback(async ({ silencioso = false } = {}) => {
    try {
      if (!silencioso) setCargando(true);
      setError('');
      const filtrosActivos = Object.fromEntries(
        Object.entries(filtros).filter(([, valor]) => valor)
      );
      const [statsRes, desempenioRes] = await Promise.all([
        dashboardAPI.stats(filtrosActivos),
        dashboardAPI.desempenioTecnicos(filtrosActivos),
      ]);
      setStats(statsRes.data);
      setDesempenio(desempenioRes.data);
      setUltimaActualizacion(new Date());
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No fue posible cargar el Dashboard.');
    } finally {
      if (!silencioso) setCargando(false);
    }
  }, [filtros]);

  useEffect(() => {
    cargarDashboard();
    const temporizador = window.setInterval(() => {
      if (!document.hidden) cargarDashboard({ silencioso: true });
    }, 30000);
    return () => window.clearInterval(temporizador);
  }, [cargarDashboard]);

  return (
    <main className={styles.container}>
      <header className={styles.encabezado}>
        <div>
          <p className={styles.eyebrow}>Resumen operativo</p>
          <h1>Dashboard de mantenimiento</h1>
          <p className={styles.descripcion}>
            Estado general de las solicitudes y rendimiento del equipo técnico.
          </p>
        </div>
        <div className={styles.actualizacion}>
          <span aria-hidden="true" />
          {ultimaActualizacion
            ? `Actualizado ${ultimaActualizacion.toLocaleTimeString()}`
            : 'Preparando datos'}
        </div>
      </header>

      <section className={styles.filtros} aria-label="Período del Dashboard">
        <FiltroFecha
          etiqueta="Solicitudes desde"
          value={filtros.fechaDesde}
          max={filtros.fechaHasta || undefined}
          onChange={(event) => setFiltros({ ...filtros, fechaDesde: event.target.value })}
        />
        <FiltroFecha
          etiqueta="Solicitudes hasta"
          value={filtros.fechaHasta}
          min={filtros.fechaDesde || undefined}
          onChange={(event) => setFiltros({ ...filtros, fechaHasta: event.target.value })}
        />
        <button
          type="button"
          onClick={() => setFiltros({ fechaDesde: '', fechaHasta: '' })}
          disabled={!filtros.fechaDesde && !filtros.fechaHasta}
        >
          Ver todo el período
        </button>
      </section>

      {error && <div className={styles.error}>{error}</div>}

      {cargando ? (
        <div className={styles.cargando}>Cargando Dashboard...</div>
      ) : !stats ? (
        <div className={styles.cargando}>No hay datos disponibles.</div>
      ) : (
        <>
          <section className={styles.kpis} aria-label="Resumen de solicitudes">
            <article className={styles.kpi}>
              <span>Total de solicitudes</span>
              <strong>{stats.totalTickets}</strong>
              <small>Registradas en el período</small>
            </article>
            <article className={`${styles.kpi} ${styles.pendiente}`}>
              <span>Pendientes</span>
              <strong>{stats.ticketsPendientes}</strong>
              <small>Abiertas, en progreso o pausadas</small>
            </article>
            <article className={`${styles.kpi} ${styles.resuelto}`}>
              <span>Finalizadas</span>
              <strong>{stats.ticketsResueltos + stats.ticketsCerrados}</strong>
              <small>Resueltas o cerradas</small>
            </article>
            <article className={`${styles.kpi} ${styles.critico}`}>
              <span>Prioridad crítica</span>
              <strong>{stats.ticketsCriticos}</strong>
              <small>Requieren atención urgente</small>
            </article>
            <article className={`${styles.kpi} ${styles.sinAsignar}`}>
              <span>Sin técnico</span>
              <strong>{stats.ticketsSinAsignar}</strong>
              <small>Pendientes de asignación</small>
            </article>
            <article className={`${styles.kpi} ${styles.tiempo}`}>
              <span>Tiempo promedio</span>
              <strong>{formatearTiempo(stats.tiempoPromedioResolucion)}</strong>
              <small>
                {stats.ticketsUsadosParaPromedio
                  ? `${stats.ticketsUsadosParaPromedio} finalizadas con tiempo registrado`
                  : 'Se calculará al resolver solicitudes'}
              </small>
            </article>
          </section>

          <section className={styles.graficos} aria-label="Gráficos de solicitudes">
            <GraficoBarras titulo="Solicitudes por estado" datos={stats.ticketsPorEstado} colores={coloresEstado} />
            <GraficoBarras titulo="Solicitudes por prioridad" datos={stats.ticketsPorPrioridad} colores={coloresPrioridad} />
            <GraficoBarras titulo="Principales áreas" datos={stats.ticketsPorArea} />
          </section>

          <section className={`${styles.panel} ${styles.panelTecnicos}`}>
            <div className={styles.panelTitulo}>
              <div>
                <h2>Desempeño de técnicos</h2>
                <p>Solicitudes asignadas y finalizadas durante el período seleccionado.</p>
              </div>
            </div>
            {desempenio.length > 0 ? (
              <div className={styles.tablaContenedor}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th>Técnico</th>
                      <th>Asignadas</th>
                      <th>Finalizadas</th>
                      <th>Resolución</th>
                    </tr>
                  </thead>
                  <tbody>
                    {desempenio.map((tecnico) => (
                      <tr key={tecnico.email}>
                        <td>
                          <strong>{tecnico.tecnico}</strong>
                          <span>{tecnico.email}</span>
                        </td>
                        <td>{tecnico.ticketsAsignados}</td>
                        <td>{tecnico.ticketsResueltos}</td>
                        <td>
                          <div className={styles.progreso}>
                            <div className={styles.pistaProgreso}>
                              <div
                                className={styles.rellenoProgreso}
                                style={{ width: `${tecnico.tasaResolucion}%` }}
                              />
                            </div>
                            <strong>{tecnico.tasaResolucion}%</strong>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className={styles.sinDatos}>No hay técnicos activos para mostrar.</p>
            )}
          </section>
        </>
      )}
    </main>
  );
};
