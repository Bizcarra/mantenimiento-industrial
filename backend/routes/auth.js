import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { limiteAutenticacion, limiteCuenta } from '../middleware/security.js';

const router = express.Router();
const JWT_ISSUER = process.env.JWT_ISSUER || 'mantenimiento-industrial-api';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'mantenimiento-industrial-web';
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HASH_COMPARACION = '$2a$12$qKwPAhydutCdnSbePY4fFub3FCoyZPLw1mdhvE.6pLD8tEpDVKcae';

const crearToken = (usuario) =>
  jwt.sign(
    { ver: usuario.tokenVersion || 0 },
    process.env.JWT_SECRET,
    {
      algorithm: 'HS256',
      subject: usuario._id.toString(),
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    }
  );

const passwordSegura = (password) =>
  typeof password === 'string' &&
  password.length >= 10 &&
  Buffer.byteLength(password, 'utf8') <= 72;

router.post('/registro', limiteAutenticacion, limiteCuenta, async (req, res, next) => {
  try {
    if (process.env.ALLOW_PUBLIC_REGISTRATION !== 'true') {
      return res.status(403).json({ mensaje: 'El registro público está deshabilitado' });
    }

    const { nombre, email, password, area } = req.body || {};
    if (
      typeof nombre !== 'string' ||
      !nombre.trim() ||
      nombre.trim().length > 120 ||
      typeof email !== 'string' ||
      email.length > 254 ||
      !EMAIL_VALIDO.test(email.trim()) ||
      !passwordSegura(password) ||
      (area !== undefined && area !== null && (typeof area !== 'string' || area.length > 100))
    ) {
      return res.status(400).json({
        mensaje: 'Los datos no son válidos. La contraseña debe tener entre 10 y 72 bytes.',
      });
    }

    const emailNormalizado = email.trim().toLowerCase();
    if (await User.exists({ email: emailNormalizado })) {
      return res.status(409).json({ mensaje: 'No fue posible registrar el usuario' });
    }

    const usuario = await User.create({
      nombre: nombre.trim(),
      email: emailNormalizado,
      password,
      rol: 'solicitante',
      area: area?.trim() || null,
    });

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      token: crearToken(usuario),
      usuario,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', limiteAutenticacion, limiteCuenta, async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (
      typeof email !== 'string' ||
      !email.trim() ||
      email.length > 254 ||
      typeof password !== 'string' ||
      !password ||
      Buffer.byteLength(password, 'utf8') > 72
    ) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const usuario = await User.findOne({ email: email.trim().toLowerCase() })
      .select('+password +tokenVersion');
    const passwordValida = usuario
      ? await usuario.comparePassword(password)
      : await bcrypt.compare(password, HASH_COMPARACION);

    if (!usuario || !usuario.activo || !passwordValida) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    res.json({
      mensaje: 'Login exitoso',
      token: crearToken(usuario),
      usuario: usuario.toJSON(),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const usuario = await User.findById(req.usuario.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (error) {
    next(error);
  }
});

router.get('/tecnicos', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const tecnicos = await User.find(
      { rol: 'tecnico', activo: true },
      'nombre email area'
    ).sort({ nombre: 1 }).limit(200);
    res.json(tecnicos);
  } catch (error) {
    next(error);
  }
});

export default router;
