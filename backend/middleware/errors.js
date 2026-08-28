const obtenerErrorHttp = (error) => {
  if (error.name === 'MulterError') {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return { estado: 413, mensaje: 'La foto no puede superar 5 MB' };
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return { estado: 400, mensaje: 'Solo se permite una foto en el campo "foto"' };
    }
    return { estado: 400, mensaje: 'La carga de la foto no es válida' };
  }
  if (error.type === 'entity.too.large') {
    return { estado: 413, mensaje: 'El cuerpo de la solicitud es demasiado grande' };
  }
  if (error.type === 'entity.parse.failed') {
    return { estado: 400, mensaje: 'El JSON enviado no es válido' };
  }
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return { estado: 400, mensaje: 'Los datos enviados no son válidos' };
  }
  if (error.code === 11000) {
    return { estado: 409, mensaje: 'Ya existe un registro con esos datos' };
  }
  if (error.status && error.expose) {
    return { estado: error.status, mensaje: error.message };
  }
  return { estado: 500, mensaje: 'Ocurrió un error interno' };
};

export const rutaNoEncontrada = (req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
};

export const manejarError = (error, req, res, next) => {
  if (res.headersSent) return next(error);

  const { estado, mensaje } = obtenerErrorHttp(error);
  const identificador = req.id || 'sin-id';

  if (process.env.NODE_ENV !== 'test' && estado >= 500 && process.env.NODE_ENV === 'production') {
    console.error(`[${identificador}] ${error.name || 'Error'}: ${error.message}`);
  } else if (estado >= 500) {
    console.error(`[${identificador}]`, error);
  } else if (process.env.NODE_ENV === 'production') {
    console.warn(`[${identificador}] Solicitud rechazada con estado ${estado}`);
  }

  res.status(estado).json({ mensaje, identificador });
};
