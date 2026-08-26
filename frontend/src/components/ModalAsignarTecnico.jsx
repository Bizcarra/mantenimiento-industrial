import React, { useState, useEffect } from 'react';
import { usuariosAPI } from '../services/api';
import styles from './ModalAsignarTecnico.module.css';

export const ModalAsignarTecnico = ({ isOpen, onClose, onSeleccionar, tecnicoActual }) => {
  const [tecnicos, setTecnicos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    if (isOpen) {
      cargarTecnicos();
    }
  }, [isOpen]);

  const cargarTecnicos = async () => {
    try {
      setCargando(true);
      setError(null);
      const response = await usuariosAPI.obtenerTecnicos();
      setTecnicos(response.data);
    } catch (err) {
      console.error('Error al cargar técnicos:', err);
      setError('Error al cargar la lista de técnicos');
    } finally {
      setCargando(false);
    }
  };

  const tecnicosFiltrados = tecnicos.filter(
    (tecnico) =>
      tecnico.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      tecnico.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleSeleccionar = (tecnico) => {
    onSeleccionar(tecnico._id, tecnico.nombre);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Asignar Técnico</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.content}>
          {error && <div className={styles.error}>{error}</div>}

          <input
            type="text"
            placeholder="Buscar técnico por nombre o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
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
                <div
                  key={tecnico._id}
                  className={`${styles.tecnicoItem} ${
                    tecnicoActual === tecnico._id ? styles.seleccionado : ''
                  }`}
                  onClick={() => handleSeleccionar(tecnico)}
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
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button onClick={onClose} className={styles.btnCancelar}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
