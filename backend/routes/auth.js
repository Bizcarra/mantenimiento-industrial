import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Registro
router.post('/registro', async (req, res) => {
  try {
    const { nombre, email, password, area } = req.body || {};

    if (
      typeof nombre !== 'string' ||
      !nombre.trim() ||
      typeof email !== 'string' ||
      !/^\S+@\S+\.\S+$/.test(email.trim()) ||
      typeof password !== 'string' ||
      !password
    ) {
      return res.status(400).json({ mensaje: 'Nombre, email y contraseña válidos son obligatorios' });
    }
    if (password.length < 6) {
      return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const emailNormalizado = email.trim().toLowerCase();

    // Validar que el usuario no exista
    const usuarioExistente = await User.findOne({ email: emailNormalizado });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'El email ya está registrado' });
    }

    // Crear nuevo usuario
    const nuevoUsuario = new User({
      nombre: nombre.trim(),
      email: emailNormalizado,
      password,
      rol: 'solicitante',
      area: area || null,
    });

    await nuevoUsuario.save();

    const token = jwt.sign(
      { id: nuevoUsuario._id, email: nuevoUsuario.email, rol: nuevoUsuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      token,
      usuario: nuevoUsuario.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const usuario = await User.findOne({ email: email.trim().toLowerCase() });
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const esValida = await usuario.comparePassword(password);
    if (!esValida) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: usuario._id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: usuario.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// Obtener usuario actual
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const usuario = await User.findById(req.usuario.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json(usuario.toJSON());
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// Obtener todos los técnicos (solo admin)
router.get('/tecnicos', authMiddleware, async (req, res) => {
  try {
    const tecnicos = await User.find(
      { rol: 'tecnico', activo: true },
      'nombre email area'
    ).sort({ nombre: 1 });
    res.json(tecnicos);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

export default router;
