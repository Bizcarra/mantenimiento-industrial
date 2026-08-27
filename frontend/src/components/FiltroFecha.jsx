import React, { useId, useRef } from 'react';
import styles from './FiltroFecha.module.css';

export const FiltroFecha = ({
  etiqueta,
  value,
  min,
  max,
  onChange,
  className = '',
}) => {
  const inputRef = useRef(null);
  const inputId = useId();

  const abrirCalendario = () => {
    const input = inputRef.current;
    if (!input) return;

    try {
      if (typeof input.showPicker === 'function') {
        input.showPicker();
      } else {
        input.focus();
      }
    } catch {
      input.focus();
    }
  };

  return (
    <div className={`${styles.campo} ${className}`.trim()}>
      <label htmlFor={inputId}>{etiqueta}</label>
      <div className={styles.control}>
        <input
          id={inputId}
          ref={inputRef}
          type="date"
          value={value}
          min={min}
          max={max}
          onChange={onChange}
          aria-label={`${etiqueta}. Escribe una fecha o abre el calendario`}
        />
        <button
          type="button"
          className={styles.botonCalendario}
          onClick={abrirCalendario}
          aria-label={`Abrir calendario para ${etiqueta.toLowerCase()}`}
          title="Abrir calendario"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 2v3M17 2v3M3.5 9h17M5.5 4h13a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
          </svg>
        </button>
      </div>
    </div>
  );
};
