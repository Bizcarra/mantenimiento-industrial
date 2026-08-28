import express from 'express';
import mongoose from 'mongoose';
import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import HistoryLog from '../models/HistoryLog.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { cargarFotoTicket, limiteCreacionTickets } from '../middleware/ticketUpload.js';
import { crearRangoFechas } from '../utils/dateFilters.js';
import {
  eliminarEvidenciaTicket,
  guardarEvidenciaTicket,
  leerEvidenciaTicket,
} from '../services/ticketImages.js';
import {
  calcularFechaEliminacion,
  eliminarRecursosAsociados,
} from '../services/ticketRetention.js';

const router = express.Router();
const ESTADOS = ['abierto', 'en_progreso', 'pausado', 'resuelto', 'cerrado'];
const ESTADOS_FINALIZADOS = new Set(['resuelto', 'cerrado']);
const PRIORIDADES = ['baja', 'media', 'alta', 'critica'];

const textoValido = (valor, minimo, maximo) =>
  typeof valor === 'string' && valor.trim().length >= minimo && valor.trim().length <= maximo;

const idValido = (id) => mongoose.isValidObjectId(id);
const filtroPresente = (valor) => valor !== undefined && valor !== '';

const esPropietarioOTecnico = (usuario, ticket) => {
  if (usuario.rol === 'admin') return true;
  if (usuario.rol === 'solicitante') return ticket.solicitante?.toString() === usuario.id;
  if (usuario.rol === 'tecnico') {
    return ticket.solicitante?.toString() === usuario.id ||
      ticket.tecnicoAsignado?.toString() === usuario.id;
  }
  return false;
};

const puedeModificarTicket = (usuario, ticket) =>
  usuario.rol === 'admin' ||
  (usuario.rol === 'tecnico' && ticket.tecnicoAsignado?.toString() === usuario.id);

router.post(
  '/',
  authMiddleware,
  requireRole('admin', 'solicitante', 'tecnico'),
  limiteCreacionTickets,
  cargarFotoTicket,
  async (req, res, next) => {
    let evidenciaGuardada = null;
    let nuevoTicket = null;
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

      if (req.file) evidenciaGuardada = await guardarEvidenciaTicket(req.file);

      nuevoTicket = await Ticket.create({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        area: area.trim(),
        prioridad,
        solicitante: req.usuario.id,
        evidenciaFoto: evidenciaGuardada,
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
      if (nuevoTicket?._id) {
        await Ticket.deleteOne({ _id: nuevoTicket._id }).catch(() => {});
        await HistoryLog.deleteMany({ ticket: nuevoTicket._id }).catch(() => {});
      }
      if (evidenciaGuardada) {
        await eliminarEvidenciaTicket(evidenciaGuardada).catch(() => {});
      }
      next(error);
    }
  }
);

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { estado, prioridad, area, tecnico, fechaDesde, fechaHasta } = req.query;
    const filtro = {};
    const { rango: rangoFechas, error: errorFechas } = crearRangoFechas(fechaDesde, fechaHasta);

    if (filtroPresente(estado) && (typeof estado !== 'string' || !ESTADOS.includes(estado))) {
      return res.status(400).json({ mensaje: 'El filtro de estado no es válido' });
    }
    if (filtroPresente(prioridad) && (typeof prioridad !== 'string' || !PRIORIDADES.includes(prioridad))) {
      return res.status(400).json({ mensaje: 'El filtro de prioridad no es válido' });
    }
    if (filtroPresente(area) && !textoValido(area, 1, 100)) {
      return res.status(400).json({ mensaje: 'El filtro de área no es válido' });
    }
    if (tecnico !== undefined && (!idValido(tecnico) || req.usuario.rol !== 'admin')) {
      return res.status(400).json({ mensaje: 'El filtro de técnico no es válido' });
    }
    if (errorFechas) return res.status(400).json({ mensaje: errorFechas });

    if (req.usuario.rol === 'solicitante') filtro.solicitante = req.usuario.id;
    if (req.usuario.rol === 'tecnico') {
      filtro.$or = [
        { solicitante: req.usuario.id },
        { tecnicoAsignado: req.usuario.id },
      ];
    }
    if (estado) filtro.estado = estado;
    if (prioridad) filtro.prioridad = prioridad;
    if (area) filtro.area = area.trim();
    if (tecnico) filtro.tecnicoAsignado = tecnico;
    if (rangoFechas) filtro.fechaSolicitud = rangoFechas;

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

router.get('/:id/foto', authMiddleware, async (req, res, next) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({ mensaje: 'Identificador de ticket no válido' });
    }

    const ticket = await Ticket.findById(req.params.id).select(
      '_id numeroTicket solicitante tecnicoAsignado evidenciaFoto'
    );
    if (!ticket || !esPropietarioOTecnico(req.usuario, ticket)) {
      return res.status(404).json({ mensaje: 'Ticket no encontrado' });
    }
    if (!ticket.evidenciaFoto) {
      return res.status(404).json({ mensaje: 'Este ticket no tiene una foto de evidencia' });
    }

    const contenido = await leerEvidenciaTicket(ticket.evidenciaFoto);
    const extension = ticket.evidenciaFoto.tipoMime === 'image/png' ? 'png' : 'jpg';
    res.set({
      'Content-Type': ticket.evidenciaFoto.tipoMime,
      'Content-Length': String(contenido.length),
      'Content-Disposition': `inline; filename="evidencia-ticket.${extension}"`,
      'Content-Security-Policy': "default-src 'none'; sandbox",
      'Cross-Origin-Resource-Policy': 'same-origin',
      'Cache-Control': 'private, no-store',
    });
    return res.send(contenido);
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
    const tecnicoRecibido = req.body?.tecnicoAsignado ?? req.body?.tecnicoId;
    const tecnicoAsignado = typeof tecnicoRecibido === 'string'
      ? tecnicoRecibido.trim()
      : typeof tecnicoRecibido?._id === 'string'
        ? tecnicoRecibido._id.trim()
        : '';

    if (!idValido(req.params.id)) {
      return res.status(400).json({ mensaje: 'El identificador del ticket no es válido' });
    }
    if (!idValido(tecnicoAsignado)) {
      return res.status(400).json({ mensaje: 'Selecciona un técnico válido e intenta nuevamente' });
    }

    const [ticket, tecnico] = await Promise.all([
      Ticket.findById(req.params.id),
      User.findOne({ _id: tecnicoAsignado, rol: 'tecnico', activo: true }),
    ]);

    if (!ticket) return res.status(404).json({ mensaje: 'Ticket no encontrado' });
    if (!tecnico) return res.status(400).json({ mensaje: 'El técnico seleccionado no es válido' });

    if (ticket.tecnicoAsignado?.toString() === tecnico._id.toString()) {
      await ticket.populate('solicitante tecnicoAsignado', 'nombre email');
      return res.json({ mensaje: `El ticket ya estaba asignado a ${tecnico.nombre}`, ticket });
    }

    const tecnicoAnterior = ticket.tecnicoAsignado;
    const estadoAnterior = ticket.estado;
    ticket.tecnicoAsignado = tecnico._id;
    ticket.fechaAsignacion = new Date();
    ticket.estado = 'en_progreso';
    if (ESTADOS_FINALIZADOS.has(estadoAnterior)) {
      ticket.fechaResolucion = null;
      ticket.tiempoTranscurridoMinutos = null;
      ticket.eliminarDespuesDe = null;
    }
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
    if (estadoAnterior === nuevoEstado) {
      return res.json({ mensaje: 'El ticket ya tenía ese estado', ticket });
    }
    ticket.estado = nuevoEstado;

    const estabaFinalizado = ESTADOS_FINALIZADOS.has(estadoAnterior);
    const quedaFinalizado = ESTADOS_FINALIZADOS.has(nuevoEstado);

    if (quedaFinalizado && !estabaFinalizado) {
      ticket.fechaResolucion = new Date();
      ticket.tiempoTranscurridoMinutos = Math.round(
        (ticket.fechaResolucion - ticket.fechaSolicitud) / 60000
      );
      ticket.eliminarDespuesDe = calcularFechaEliminacion(ticket.fechaResolucion);
    } else if (!quedaFinalizado && estabaFinalizado) {
      ticket.tiempoTranscurridoMinutos = null;
      ticket.fechaResolucion = null;
      ticket.eliminarDespuesDe = null;
    } else if (quedaFinalizado && ticket.fechaResolucion && !ticket.eliminarDespuesDe) {
      ticket.eliminarDespuesDe = calcularFechaEliminacion(ticket.fechaResolucion);
    }

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

router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({ mensaje: 'Identificador de ticket no válido' });
    }

    const ticket = await Ticket.findById(req.params.id).select(
      '_id numeroTicket titulo evidenciaFoto'
    );
    if (!ticket) return res.status(404).json({ mensaje: 'Ticket no encontrado' });

    await ticket.deleteOne();
    await eliminarRecursosAsociados(ticket);

    res.json({
      mensaje: `${ticket.numeroTicket || 'Ticket'} eliminado exitosamente`,
      ticketEliminado: ticket._id,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
