import React, { useCallback, useEffect, useState } from 'react';
import { usuariosAPI } from '../services/api';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import styles from './ModalAsignarTecnico.module.css';

export const ModalAsignarTecnico = ({ isOpen, onClose, onSeleccionar, tecnicoActual }) => {
  const [tecnicos, setTecnicos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [asignandoId, setAsignandoId] = useState('');

  const cargarTecnicos = useCallback(async ({ silencioso = false } = {}) => {
    try {
      if (!silencioso) {
        setCargando(true);
        setError(null);
      }
      const response = await usuariosAPI.obtenerTecnicos();
      setTecnicos(response.data);
    } catch (err) {
      console.error('Error al cargar técnicos:', err);
      if (!silencioso) setError('Error al cargar la lista de técnicos');
    } finally {
      if (!silencioso) setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setAsignandoId('');
      setError(null);
      cargarTecnicos();
    }
  }, [cargarTecnicos, isOpen]);

  useAutoRefresh(
    () => cargarTecnicos({ silencioso: true }),
    { activo: isOpen }
  );

  const tecnicosFiltrados = tecnicos.filter(
    (tecnico) =>
      tecnico.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      tecnico.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleSeleccionar = async (tecnico) => {
    if (asignandoId) return;
    if (typeof tecnico?._id !== 'string' || !tecnico._id) {
      setError('El técnico seleccionado no tiene un identificador válido.');
      return;
    }

    setAsignandoId(tecnico._id);
    setError(null);
    try {
      await onSeleccionar(tecnico._id, tecnico.nombre);
      onClose();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No fue posible asignar el técnico.');
    } finally {
      setAsignandoId('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <h2>Asignar Técnico</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={Boolean(asignandoId)}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className={styles.content}>
          {error && <div className={styles.error}>{error}</div>}

          <input
            type="search"
            placeholder="Buscar técnico por nombre o email..."
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            className={styles.busqueda}
          />

          {cargando ? (
            <div className={styles.cargando}>Cargando técnicos...</div>
          ) : tecnicosFiltrados.length === 0 ? (
            <div className={styles.vacio}>
              {tecnicos.length === 0
                ? 'No hay técnicos disponibles'
                : 'No se encontraron técnicos que coincidan'}
            </div>
          ) : (
            <div className={styles.lista}>
              {tecnicosFiltrados.map((tecnico) => (
                <button
                  type="button"
                  key={tecnico._id}
                  className={`${styles.tecnicoItem} ${
                    tecnicoActual === tecnico._id ? styles.seleccionado : ''
                  }`}
                  onClick={() => handleSeleccionar(tecnico)}
                  disabled={Boolean(asignandoId)}
                >
                  <div className={styles.info}>
                    <div className={styles.nombre}>{tecnico.nombre}</div>
                    <div className={styles.email}>{tecnico.email}</div>
                    {tecnico.area && (
                      <div className={styles.area}>Área: {tecnico.area}</div>
                    )}
                  </div>
                  {tecnicoActual === tecnico._id && (
                    <div className={styles.checkmark}>✓</div>
                  )}
                  {asignandoId === tecnico._id && (
                    <div className={styles.asignando}>Asignando...</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            onClick={onClose}
            className={styles.btnCancelar}
            disabled={Boolean(asignandoId)}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
