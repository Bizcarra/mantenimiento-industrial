import { useEffect, useRef } from 'react';

export const INTERVALO_ACTUALIZACION_MS = 10000;

export const useAutoRefresh = (
  actualizar,
  { activo = true, intervalo = INTERVALO_ACTUALIZACION_MS } = {}
) => {
  const actualizarRef = useRef(actualizar);
  const actualizandoRef = useRef(false);

  useEffect(() => {
    actualizarRef.current = actualizar;
  }, [actualizar]);

  useEffect(() => {
    if (!activo) return undefined;

    let montado = true;

    const ejecutar = async () => {
      if (!montado || document.hidden || actualizandoRef.current) return;

      actualizandoRef.current = true;
      try {
        await actualizarRef.current();
      } catch (error) {
        console.error('Error durante la actualización automática:', error);
      } finally {
        actualizandoRef.current = false;
      }
    };

    const alCambiarVisibilidad = () => {
      if (!document.hidden) ejecutar();
    };

    const temporizador = window.setInterval(ejecutar, intervalo);
    window.addEventListener('focus', ejecutar);
    window.addEventListener('online', ejecutar);
    document.addEventListener('visibilitychange', alCambiarVisibilidad);

    return () => {
      montado = false;
      window.clearInterval(temporizador);
      window.removeEventListener('focus', ejecutar);
      window.removeEventListener('online', ejecutar);
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
    };
  }, [activo, intervalo]);
};
