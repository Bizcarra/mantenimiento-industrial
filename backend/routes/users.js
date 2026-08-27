import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Ticket from '../models/Ticket.js';
import HistoryLog from '../models/HistoryLog.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();
const ROLES_VALIDOS = ['admin', 'tecnico', 'solicitante'];

router.use(authMiddleware, requireRole('admin'));

const escaparRegex = (valor = '') => valor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const validarDatosUsuario = (
  { nombre, email, password, rol, area, activo },
  { passwordRequerida = false } = {}
) => {
  if (nombre !== undefined && (typeof nombre !== 'string' || !nombre.trim())) return 'El nombre es obligatorio';
  if (email !== undefined && (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim()))) return 'El email no es válido';
  if (passwordRequerida && (typeof password !== 'string' || !password)) return 'La contraseña es obligatoria';
  if (password !== undefined && (typeof password !== 'string' || password.length < 6)) return 'La contraseña debe tener al menos 6 caracteres';
  if (rol !== undefined && !ROLES_VALIDOS.includes(rol)) return 'El rol no es válido';
  if (area !== undefined && area !== null && typeof area !== 'string') return 'El área no es válida';
  if (activo !== undefined && typeof activo !== 'boolean') return 'El estado del usuario no es válido';
  return null;
};

// Listar y buscar usuarios.
router.get('/', async (req, res) => {
  try {
    const { q = '', rol = '', activo = '' } = req.query;
    const filtro = {};

    const textoBusqueda = typeof q === 'string' ? q.trim() : '';
    if (textoBusqueda) {
      const busqueda = new RegExp(escaparRegex(textoBusqueda), 'i');
      filtro.$or = [{ nombre: busqueda }, { email: busqueda }, { area: busqueda }];
    }

    if (rol && ROLES_VALIDOS.includes(rol)) filtro.rol = rol;
    if (activo === 'true' || activo === 'false') filtro.activo = activo === 'true';

    const usuarios = await User.find(filtro).sort({ nombre: 1, email: 1 });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// Crear un usuario sin iniciar sesión con la cuenta creada.
router.post('/', async (req, res) => {
  try {
    const { nombre, email, password, rol = 'solicitante', area, activo = true } = req.body || {};
    if (typeof nombre !== 'string' || !nombre.trim() || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ mensaje: 'Nombre y email son obligatorios' });
    }
    const errorValidacion = validarDatosUsuario(
      { nombre, email, password, rol, area, activo },
      { passwordRequerida: true }
    );

    if (errorValidacion) return res.status(400).json({ mensaje: errorValidacion });

    const emailNormalizado = email.trim().toLowerCase();
    const usuarioExistente = await User.findOne({ email: emailNormalizado });
    if (usuarioExistente) {
      return res.status(409).json({ mensaje: 'El email ya está registrado' });
    }

    const usuario = await User.create({
      nombre: nombre.trim(),
      email: emailNormalizado,
      password,
      rol,
      area: area?.trim() || null,
      activo: Boolean(activo),
    });

    res.status(201).json({ mensaje: 'Usuario creado exitosamente', usuario });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ mensaje: 'El email ya está registrado' });
    }
    res.status(500).json({ mensaje: error.message });
  }
});

// Modificar datos, rol, estado y opcionalmente la contraseña.
router.patch('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ mensaje: 'Identificador de usuario no válido' });
    }

    const usuario = await User.findById(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const { nombre, email, password, rol, area, activo } = req.body || {};
    const errorValidacion = validarDatosUsuario({ nombre, email, password, rol, area, activo });
    if (errorValidacion) return res.status(400).json({ mensaje: errorValidacion });

    const esUsuarioActual = usuario._id.equals(req.usuario.id);
    const desactivaAdmin = usuario.rol === 'admin' && usuario.activo && activo === false;
    const cambiaRolAdmin = usuario.rol === 'admin' && rol && rol !== 'admin';

    if (esUsuarioActual && (activo === false || (rol && rol !== 'admin'))) {
      return res.status(400).json({
        mensaje: 'No puedes quitarte el rol de administrador ni desactivar tu propia cuenta',
      });
    }

    if (desactivaAdmin || cambiaRolAdmin) {
      const otrosAdminsActivos = await User.countDocuments({
        _id: { $ne: usuario._id },
        rol: 'admin',
        activo: true,
      });
      if (otrosAdminsActivos === 0) {
        return res.status(400).json({ mensaje: 'Debe permanecer al menos un administrador activo' });
      }
    }

    if (email !== undefined) {
      const emailNormalizado = email.trim().toLowerCase();
      const emailOcupado = await User.exists({ email: emailNormalizado, _id: { $ne: usuario._id } });
      if (emailOcupado) return res.status(409).json({ mensaje: 'El email ya está registrado' });
      usuario.email = emailNormalizado;
    }

    if (nombre !== undefined) usuario.nombre = nombre.trim();
    if (password) usuario.password = password;
    if (rol !== undefined) usuario.rol = rol;
    if (area !== undefined) usuario.area = area?.trim() || null;
    if (activo !== undefined) usuario.activo = Boolean(activo);

    await usuario.save();
    res.json({ mensaje: 'Usuario actualizado exitosamente', usuario });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ mensaje: 'El email ya está registrado' });
    }
    res.status(500).json({ mensaje: error.message });
  }
});

// Eliminar únicamente usuarios que no formen parte del historial de mantenimiento.
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ mensaje: 'Identificador de usuario no válido' });
    }

    const usuario = await User.findById(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    if (usuario._id.equals(req.usuario.id)) {
      return res.status(400).json({ mensaje: 'No puedes eliminar tu propia cuenta' });
    }

    if (usuario.rol === 'admin' && usuario.activo) {
      const otrosAdminsActivos = await User.countDocuments({
        _id: { $ne: usuario._id },
        rol: 'admin',
        activo: true,
      });
      if (otrosAdminsActivos === 0) {
        return res.status(400).json({ mensaje: 'Debe permanecer al menos un administrador activo' });
      }
    }

    const [ticketRelacionado, historialRelacionado] = await Promise.all([
      Ticket.exists({
        $or: [
          { solicitante: usuario._id },
          { tecnicoAsignado: usuario._id },
          { usuarioSolucion: usuario._id },
        ],
      }),
      HistoryLog.exists({ usuarioQueCambia: usuario._id }),
    ]);

    if (ticketRelacionado || historialRelacionado) {
      return res.status(409).json({
        mensaje: 'Este usuario tiene tickets o historial asociado. Desactívalo para conservar la trazabilidad.',
      });
    }

    await usuario.deleteOne();
    res.json({ mensaje: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

export default router;
