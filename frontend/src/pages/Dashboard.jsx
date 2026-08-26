import React, { useState, useEffect } from 'react';
import { dashboardAPI, ticketsAPI } from '../services/api';
import styles from './Dashboard.module.css';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [desempenio, setDesempenio] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      setCargando(true);
      const [statsRes, desempenioRes] = await Promise.all([
        dashboardAPI.stats(),
        dashboardAPI.desempenioTecnicos(),
      ]);
      setStats(statsRes.data);
      setDesempenio(desempenioRes.data);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return <div className={styles.cargando}>Cargando dashboard...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>📊 Dashboard de Mantenimiento</h1>

      <div className={styles.kpis}>
        <div className={styles.kpi}>
          <h3>Total de Tickets</h3>
          <p className={styles.numero}>{stats?.totalTickets || 0}</p>
          <span className={styles.label}>Tickets en el sistema</span>
        </div>

        <div className={styles.kpi}>
          <h3>Abiertos</h3>
          <p className={styles.numero}>{stats?.ticketsAbiertos || 0}</p>
          <span className={styles.label}>Esperando atención</span>
        </div>

        <div className={styles.kpi}>
          <h3>En Progreso</h3>
          <p className={styles.numero}>{stats?.ticketsEnProgreso || 0}</p>
          <span className={styles.label}>Siendo atendidos</span>
        </div>

        <div className={styles.kpi}>
          <h3>Resueltos</h3>
          <p className={styles.numero}>{stats?.ticketsResueltos || 0}</p>
          <span className={styles.label}>Completados</span>
        </div>

        <div className={`${styles.kpi} ${styles.critico}`}>
          <h3>Críticos</h3>
          <p className={styles.numero}>{stats?.ticketsCriticos || 0}</p>
          <span className={styles.label}>Requieren atención urgente</span>
        </div>

        <div className={styles.kpi}>
          <h3>Tiempo Promedio</h3>
          <p className={styles.numero}>{Math.round(stats?.tiempoPromedioResolucion / 60) || 0}h</p>
          <span className={styles.label}>Resolución promedio</span>
        </div>
      </div>

      <div className={styles.graficos}>
        <div className={styles.panel}>
          <h2>Tickets por Prioridad</h2>
          {stats?.ticketsPorPrioridad && stats.ticketsPorPrioridad.length > 0 ? (
            <div className={styles.barras}>
              {stats.ticketsPorPrioridad.map((item) => (
                <div key={item._id} className={styles.barra}>
                  <div className={styles.etiqueta}>{item._id}</div>
                  <div className={styles.contenedorBarra}>
                    <div
                      className={styles.barraLlena}
                      style={{
                        width: `${(item.count / stats.totalTickets) * 100}%`,
                        backgroundColor: getPrioridadColor(item._id),
                      }}
                    />
                  </div>
                  <div className={styles.cantidad}>{item.count}</div>
                </div>
              ))}
            </div>
          ) : (
            <p>No hay datos</p>
          )}
        </div>

        <div className={styles.panel}>
          <h2>Tickets por Área</h2>
          {stats?.ticketsPorArea && stats.ticketsPorArea.length > 0 ? (
            <div className={styles.barras}>
              {stats.ticketsPorArea.map((item) => (
                <div key={item._id} className={styles.barra}>
                  <div className={styles.etiqueta}>{item._id}</div>
                  <div className={styles.contenedorBarra}>
                    <div
                      className={styles.barraLlena}
                      style={{ width: `${(item.count / stats.totalTickets) * 100}%` }}
                    />
                  </div>
                  <div className={styles.cantidad}>{item.count}</div>
                </div>
              ))}
            </div>
          ) : (
            <p>No hay datos</p>
          )}
        </div>
      </div>

      <div className={styles.panel}>
        <h2>Desempeño de Técnicos</h2>
        {desempenio && desempenio.length > 0 ? (
          <div className={styles.tabla}>
            <table>
              <thead>
                <tr>
                  <th>Técnico</th>
                  <th>Tickets Asignados</th>
                  <th>Tickets Resueltos</th>
                  <th>Tasa de Resolución</th>
                </tr>
              </thead>
              <tbody>
                {desempenio.map((tecnico) => (
                  <tr key={tecnico.email}>
                    <td>{tecnico.tecnico}</td>
                    <td>{tecnico.ticketsAsignados}</td>
                    <td>{tecnico.ticketsResueltos}</td>
                    <td>
                      <div className={styles.progreso}>
                        <div
                          className={styles.barraProgreso}
                          style={{ width: `${tecnico.tasaResolucion}%` }}
                        />
                        <span>{tecnico.tasaResolucion}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No hay datos de técnicos</p>
        )}
      </div>
    </div>
  );
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
