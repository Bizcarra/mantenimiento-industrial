import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

const JWT_ISSUER = process.env.JWT_ISSUER || 'mantenimiento-industrial-api';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'mantenimiento-industrial-web';

export const authMiddleware = async (req, res, next) => {
  try {
    const encabezado = req.headers.authorization;
    const partes = typeof encabezado === 'string' ? encabezado.split(' ') : [];

    if (partes.length !== 2 || partes[0] !== 'Bearer' || !partes[1] || partes[1].length > 4096) {
      return res.status(401).json({ mensaje: 'Autenticación requerida' });
    }

    const decoded = jwt.verify(partes[1], process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    if (typeof decoded.sub !== 'string' || !mongoose.isValidObjectId(decoded.sub)) {
      return res.status(401).json({ mensaje: 'Sesión inválida o expirada' });
    }

    const usuario = await User.findById(decoded.sub).select('_id email rol activo +tokenVersion');
    const versionActual = usuario?.tokenVersion || 0;

    if (!usuario || !usuario.activo || decoded.ver !== versionActual) {
      return res.status(401).json({ mensaje: 'Sesión inválida o expirada' });
    }

    req.usuario = {
      id: usuario._id.toString(),
      email: usuario.email,
      rol: usuario.rol,
    };
    next();
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError' ||
      error.name === 'NotBeforeError'
    ) {
      return res.status(401).json({ mensaje: 'Sesión inválida o expirada' });
    }
    next(error);
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      return res.status(403).json({ mensaje: 'Acceso denegado' });
    }
    next();
  };
};
