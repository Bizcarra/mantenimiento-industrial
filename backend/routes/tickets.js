import express from 'express';
import Ticket from '../models/Ticket.js';
import HistoryLog from '../models/HistoryLog.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Crear ticket
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { titulo, descripcion, area, prioridad } = req.body;

    const nuevoTicket = new Ticket({
      titulo,
      descripcion,
      area,
      prioridad: prioridad || 'media',
      solicitante: req.usuario.id,
    });

    await nuevoTicket.save();
    await nuevoTicket.populate('solicitante', 'nombre email');

    // Registrar en historial
    await HistoryLog.create({
      ticket: nuevoTicket._id,
      usuarioQueCambia: req.usuario.id,
      tipoDeAccion: 'creacion',
      detalles: `Ticket creado: ${titulo}`,
      datosNuevos: nuevoTicket.toObject(),
    });

    res.status(201).json({
      mensaje: 'Ticket creado exitosamente',
      ticket: nuevoTicket,
    });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// Obtener todos los tickets (con filtros)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { estado, prioridad, area, tecnico } = req.query;
    let filtro = {};

    if (req.usuario.rol === 'solicitante') {
      filtro.solicitante = req.usuario.id;
    } else if (req.usuario.rol === 'tecnico') {
      filtro.tecnicoAsignado = req.usuario.id;
    }

    if (estado) filtro.estado = estado;
    if (prioridad) filtro.prioridad = prioridad;
    if (area) filtro.area = area;
    if (tecnico && req.usuario.rol === 'admin') filtro.tecnicoAsignado = tecnico;

    const tickets = await Ticket.find(filtro)
      .populate('solicitante', 'nombre email')
      .populate('tecnicoAsignado', 'nombre email')
      .sort({ fechaSolicitud: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// Obtener ticket por ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('solicitante', 'nombre email')
      .populate('tecnicoAsignado', 'nombre email');

    if (!ticket) {
      return res.status(404).json({ mensaje: 'Ticket no encontrado' });
    }

    // Obtener historial
    const historial = await HistoryLog.find({ ticket: req.params.id })
      .populate('usuarioQueCambia', 'nombre email')
      .sort({ timestamp: -1 });

    res.json({ ticket, historial });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// Asignar ticket a técnico (solo admin)
router.patch('/:id/asignar', authMiddleware, requireRole('admin', 'tecnico'), async (req, res) => {
  try {
    const { tecnicoAsignado } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ mensaje: 'Ticket no encontrado' });
    }

    const datosAnteriores = {
      tecnicoAsignado: ticket.tecnicoAsignado,
    };

    ticket.tecnicoAsignado = tecnicoAsignado;
    ticket.fechaAsignacion = new Date();
    ticket.estado = 'en_progreso';

    await ticket.save();
    await ticket.populate('solicitante tecnicoAsignado', 'nombre email');

    // Registrar en historial
    await HistoryLog.create({
      ticket: ticket._id,
      usuarioQueCambia: req.usuario.id,
      tipoDeAccion: 'asignacion',
      detalles: `Ticket asignado a técnico`,
      datosAnteriores,
      datosNuevos: { tecnicoAsignado: ticket.tecnicoAsignado },
    });

    res.json({
      mensaje: 'Ticket asignado exitosamente',
      ticket,
    });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// Actualizar estado del ticket (solo técnico y admin)
router.patch('/:id/estado', authMiddleware, requireRole('admin', 'tecnico'), async (req, res) => {
  try {
    const { nuevoEstado } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ mensaje: 'Ticket no encontrado' });
    }

    const estadoAnterior = ticket.estado;
    ticket.estado = nuevoEstado;

    // Calcular tiempo transcurrido cuando se resuelve o pausa
    if ((nuevoEstado === 'resuelto' || nuevoEstado === 'pausado') && !ticket.tiempoTranscurridoMinutos) {
      const ahora = new Date();
      const tiempoMs = ahora - ticket.fechaSolicitud;
      ticket.tiempoTranscurridoMinutos = Math.round(tiempoMs / (1000 * 60));
    }

    if (nuevoEstado === 'resuelto') {
      ticket.fechaResolucion = new Date();
    }

    await ticket.save();

    // Registrar en historial
    await HistoryLog.create({
      ticket: ticket._id,
      usuarioQueCambia: req.usuario.id,
      tipoDeAccion: 'cambio_estado',
      detalles: `Estado cambiado de "${estadoAnterior}" a "${nuevoEstado}"`,
      datosAnteriores: { estado: estadoAnterior },
      datosNuevos: { estado: nuevoEstado },
    });

    res.json({
      mensaje: 'Estado actualizado exitosamente',
      ticket,
    });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// Actualizar prioridad (solo admin)
router.patch('/:id/prioridad', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { nuevaPrioridad } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ mensaje: 'Ticket no encontrado' });
    }

    const prioridadAnterior = ticket.prioridad;
    ticket.prioridad = nuevaPrioridad;
    await ticket.save();

    // Registrar en historial
    await HistoryLog.create({
      ticket: ticket._id,
      usuarioQueCambia: req.usuario.id,
      tipoDeAccion: 'cambio_prioridad',
      detalles: `Prioridad cambiada de "${prioridadAnterior}" a "${nuevaPrioridad}"`,
      datosAnteriores: { prioridad: prioridadAnterior },
      datosNuevos: { prioridad: nuevaPrioridad },
    });

    res.json({
      mensaje: 'Prioridad actualizada exitosamente',
      ticket,
    });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// Registrar solución (solo técnico y admin)
router.patch('/:id/finalizacion', authMiddleware, requireRole('admin', 'tecnico'), async (req, res) => {
  try {
    const { descripcionSolucion } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ mensaje: 'Ticket no encontrado' });
    }

    ticket.descripcionSolucion = descripcionSolucion || ticket.descripcionSolucion;
    ticket.usuarioSolucion = req.usuario.id;

    // Calcular tiempo si no estaba calculado
    if (!ticket.tiempoTranscurridoMinutos) {
      const ahora = new Date();
      const tiempoMs = ahora - ticket.fechaSolicitud;
      ticket.tiempoTranscurridoMinutos = Math.round(tiempoMs / (1000 * 60));
    }

    await ticket.save();

    // Registrar en historial
    await HistoryLog.create({
      ticket: ticket._id,
      usuarioQueCambia: req.usuario.id,
      tipoDeAccion: 'resolucion',
      detalles: `Solución registrada. Tiempo: ${ticket.tiempoTranscurridoMinutos} minutos`,
      datosNuevos: {
        descripcionSolucion,
        tiempoTranscurridoMinutos: ticket.tiempoTranscurridoMinutos,
      },
    });

    res.json({
      mensaje: 'Solución registrada exitosamente',
      ticket,
    });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// Actualizar descripción de solución (solo técnico y admin)
router.patch('/:id/solucion', authMiddleware, requireRole('admin', 'tecnico'), async (req, res) => {
  try {
    const { descripcionSolucion } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ mensaje: 'Ticket no encontrado' });
    }

    ticket.descripcionSolucion = descripcionSolucion;
    await ticket.save();

    res.json({
      mensaje: 'Solución registrada exitosamente',
      ticket,
    });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

export default router;
