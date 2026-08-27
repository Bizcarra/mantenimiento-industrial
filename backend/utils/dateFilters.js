const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

const convertirFecha = (valor, finDelDia) => {
  if (typeof valor !== 'string' || !FORMATO_FECHA.test(valor)) return null;

  const fecha = new Date(`${valor}T${finDelDia ? '23:59:59.999' : '00:00:00.000'}Z`);
  if (Number.isNaN(fecha.getTime()) || fecha.toISOString().slice(0, 10) !== valor) return null;
  return fecha;
};

export const crearRangoFechas = (fechaDesde, fechaHasta) => {
  const tieneDesde = fechaDesde !== undefined && fechaDesde !== '';
  const tieneHasta = fechaHasta !== undefined && fechaHasta !== '';

  if (!tieneDesde && !tieneHasta) return { rango: null, error: null };

  const desde = tieneDesde ? convertirFecha(fechaDesde, false) : null;
  const hasta = tieneHasta ? convertirFecha(fechaHasta, true) : null;

  if ((tieneDesde && !desde) || (tieneHasta && !hasta)) {
    return { rango: null, error: 'El filtro de fecha no es válido' };
  }
  if (desde && hasta && desde > hasta) {
    return { rango: null, error: 'La fecha inicial no puede ser posterior a la fecha final' };
  }

  return {
    rango: {
      ...(desde ? { $gte: desde } : {}),
      ...(hasta ? { $lte: hasta } : {}),
    },
    error: null,
  };
};
