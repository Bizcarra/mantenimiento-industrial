import express from 'express';
import mongoose from 'mongoose';
import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import HistoryLog from '../models/HistoryLog.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();
const ESTADOS = ['abierto', 'en_progreso', 'pausado', 'resuelto', 'cerrado'];
const PRIORIDADES = ['baja', 'media', 'alta', 'critica'];

const textoValido = (valor, minimo, maximo) =>
  typeof valor === 'string' && valor.trim().length >= minimo && valor.trim().length <= maximo;

const idValido = (id) => mongoose.isValidObjectId(id);

const esPropietarioOTecnico = (usuario, ticket) => {
  if (usuario.rol === 'admin') return true;
  if (usuario.rol === 'solicitante') return ticket.solicitante?.toString() === usuario.id;
  if (usuario.rol === 'tecnico') return ticket.tecnicoAsignado?.toString() === usuario.id;
  return false;
};

const puedeModificarTicket = (usuario, ticket) =>
  usuario.rol === 'admin' ||
  (usuario.rol === 'tecnico' && ticket.tecnicoAsignado?.toString() === usuario.id);

router.post('/', authMiddleware, requireRole('solicitante'), async (req, res, next) => {
  try {
    const { titulo, descripcion, area, prioridad = 'media' } = req.body || {};
    if (
      !textoValido(titulo, 3, 120) ||
      !textoValido(descripcion, 10, 5000) ||
      !textoValido(area, 2, 100) ||
      !PRIORIDADES.includes(prioridad)
    ) {
      return res.status(400).json({ mensaje: 'Los datos del ticket no son válidos' });
    }

    const nuevoTicket = await Ticket.create({
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      area: area.trim(),
      prioridad,
      solicitante: req.usuario.id,
    });

    await nuevoTicket.populate('solicitante', 'nombre email');
    await HistoryLog.create({
      ticket: nuevoTicket._id,
      usuarioQueCambia: req.usuario.id,
      tipoDeAccion: 'creacion',
      detalles: `Ticket creado: ${nuevoTicket.titulo}`,
      datosNuevos: nuevoTicket.toObject(),
    });

    res.status(201).json({ mensaje: 'Ticket creado exitosamente', ticket: nuevoTicket });
  } catch (error) {
    next(error);
  }
});

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { estado, prioridad, area, tecnico } = req.query;
    const filtro = {};

    if (estado !== undefined && (typeof estado !== 'string' || !ESTADOS.includes(estado))) {
      return res.status(400).json({ mensaje: 'El filtro de estado no es válido' });
    }
    if (prioridad !== undefined && (typeof prioridad !== 'string' || !PRIORIDADES.includes(prioridad))) {
      return res.status(400).json({ mensaje: 'El filtro de prioridad no es válido' });
    }
    if (area !== undefined && !textoValido(area, 1, 100)) {
      return res.status(400).json({ mensaje: 'El filtro de área no es válido' });
    }
    if (tecnico !== undefined && (!idValido(tecnico) || req.usuario.rol !== 'admin')) {
      return res.status(400).json({ mensaje: 'El filtro de técnico no es válido' });
    }

    if (req.usuario.rol === 'solicitante') filtro.solicitante = req.usuario.id;
    if (req.usuario.rol === 'tecnico') filtro.tecnicoAsignado = req.usuario.id;
    if (estado) filtro.estado = estado;
    if (prioridad) filtro.prioridad = prioridad;
    if (area) filtro.area = area.trim();
    if (tecnico) filtro.tecnicoAsignado = tecnico;

    const tickets = await Ticket.find(filtro)
      .populate('solicitante', 'nombre email')
      .populate('tecnicoAsignado', 'nombre email')
      .sort({ fechaSolicitud: -1 })
      .limit(200);

    res.json(tickets);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({ mensaje: 'Identificador de ticket no válido' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket || !esPropietarioOTecnico(req.usuario, ticket)) {
      return res.status(404).json({ mensaje: 'Ticket no encontrado' });
    }

    await ticket.populate('solicitante', 'nombre email');
    await ticket.populate('tecnicoAsignado', 'nombre email');
    await ticket.populate('usuarioSolucion', 'nombre');

    const historial = await HistoryLog.find({ ticket: ticket._id })
      .populate('usuarioQueCambia', 'nombre email')
      .sort({ timestamp: -1 })
      .limit(500);

    res.json({ ticket, historial });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/asignar', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const { tecnicoAsignado } = req.body || {};
    if (!idValido(req.params.id) || !idValido(tecnicoAsignado)) {
      return res.status(400).json({ mensaje: 'Los identificadores enviados no son válidos' });
    }

    const [ticket, tecnico] = await Promise.all([
      Ticket.findById(req.params.id),
      User.findOne({ _id: tecnicoAsignado, rol: 'tecnico', activo: true }),
    ]);

    if (!ticket) return res.status(404).json({ mensaje: 'Ticket no encontrado' });
    if (!tecnico) return res.status(400).json({ mensaje: 'El técnico seleccionado no es válido' });

    const tecnicoAnterior = ticket.tecnicoAsignado;
    ticket.tecnicoAsignado = tecnico._id;
    ticket.fechaAsignacion = new Date();
    ticket.estado = 'en_progreso';
    await ticket.save();
    await ticket.populate('solicitante tecnicoAsignado', 'nombre email');

    await HistoryLog.create({
      ticket: ticket._id,
      usuarioQueCambia: req.usuario.id,
      tipoDeAccion: 'asignacion',
      detalles: `Ticket asignado a ${tecnico.nombre}`,
      datosAnteriores: { tecnicoAsignado: tecnicoAnterior },
      datosNuevos: { tecnicoAsignado: tecnico._id },
    });

    res.json({ mensaje: 'Ticket asignado exitosamente', ticket });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/estado', authMiddleware, requireRole('admin', 'tecnico'), async (req, res, next) => {
  try {
    const { nuevoEstado } = req.body || {};
    if (!idValido(req.params.id) || !ESTADOS.includes(nuevoEstado)) {
      return res.status(400).json({ mensaje: 'El estado o identificador no es válido' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket || !puedeModificarTicket(req.usuario, ticket)) {
      return res.status(404).json({ mensaje: 'Ticket no encontrado' });
    }

    const estadoAnterior = ticket.estado;
    ticket.estado = nuevoEstado;

    if ((nuevoEstado === 'resuelto' || nuevoEstado === 'pausado') && !ticket.tiempoTranscurridoMinutos) {
      ticket.tiempoTranscurridoMinutos = Math.round((new Date() - ticket.fechaSolicitud) / 60000);
    }
    if (nuevoEstado === 'resuelto') ticket.fechaResolucion = new Date();

    await ticket.save();
    await HistoryLog.create({
      ticket: ticket._id,
      usuarioQueCambia: req.usuario.id,
      tipoDeAccion: 'cambio_estado',
      detalles: `Estado cambiado de "${estadoAnterior}" a "${nuevoEstado}"`,
      datosAnteriores: { estado: estadoAnterior },
      datosNuevos: { estado: nuevoEstado },
    });

    res.json({ mensaje: 'Estado actualizado exitosamente', ticket });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/prioridad', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const { nuevaPrioridad } = req.body || {};
    if (!idValido(req.params.id) || !PRIORIDADES.includes(nuevaPrioridad)) {
      return res.status(400).json({ mensaje: 'La prioridad o identificador no es válido' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ mensaje: 'Ticket no encontrado' });

    const prioridadAnterior = ticket.prioridad;
    ticket.prioridad = nuevaPrioridad;
    await ticket.save();
    await HistoryLog.create({
      ticket: ticket._id,
      usuarioQueCambia: req.usuario.id,
      tipoDeAccion: 'cambio_prioridad',
      detalles: `Prioridad cambiada de "${prioridadAnterior}" a "${nuevaPrioridad}"`,
      datosAnteriores: { prioridad: prioridadAnterior },
      datosNuevos: { prioridad: nuevaPrioridad },
    });

    res.json({ mensaje: 'Prioridad actualizada exitosamente', ticket });
  } catch (error) {
    next(error);
  }
});

const guardarSolucion = async (req, res, next, registrarHistorial) => {
  try {
    const { descripcionSolucion } = req.body || {};
    if (!idValido(req.params.id) || !textoValido(descripcionSolucion, 3, 5000)) {
      return res.status(400).json({ mensaje: 'La solución o identificador no es válido' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket || !puedeModificarTicket(req.usuario, ticket)) {
      return res.status(404).json({ mensaje: 'Ticket no encontrado' });
    }

    ticket.descripcionSolucion = descripcionSolucion.trim();
    ticket.usuarioSolucion = req.usuario.id;
    if (!ticket.tiempoTranscurridoMinutos) {
      ticket.tiempoTranscurridoMinutos = Math.round((new Date() - ticket.fechaSolicitud) / 60000);
    }
    await ticket.save();

    if (registrarHistorial) {
      await HistoryLog.create({
        ticket: ticket._id,
        usuarioQueCambia: req.usuario.id,
        tipoDeAccion: 'resolucion',
        detalles: `Solución registrada. Tiempo: ${ticket.tiempoTranscurridoMinutos} minutos`,
        datosNuevos: {
          descripcionSolucion: ticket.descripcionSolucion,
          tiempoTranscurridoMinutos: ticket.tiempoTranscurridoMinutos,
        },
      });
    }

    res.json({ mensaje: 'Solución registrada exitosamente', ticket });
  } catch (error) {
    next(error);
  }
};

router.patch(
  '/:id/finalizacion',
  authMiddleware,
  requireRole('admin', 'tecnico'),
  (req, res, next) => guardarSolucion(req, res, next, true)
);

router.patch(
  '/:id/solucion',
  authMiddleware,
  requireRole('admin', 'tecnico'),
  (req, res, next) => guardarSolucion(req, res, next, false)
);

export default router;
