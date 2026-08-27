import express from 'express';
import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Estadísticas generales (solo admin)
router.get('/stats', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const totalTickets = await Ticket.countDocuments();
    const ticketsAbiertos = await Ticket.countDocuments({ estado: 'abierto' });
    const ticketsEnProgreso = await Ticket.countDocuments({ estado: 'en_progreso' });
    const ticketsResueltos = await Ticket.countDocuments({ estado: 'resuelto' });
    const ticketsCriticos = await Ticket.countDocuments({ prioridad: 'critica' });

    // Tiempo promedio de resolución
    const ticketsConResolucion = await Ticket.find({
      estado: 'resuelto',
      tiempoTranscurridoMinutos: { $ne: null },
    }).select('tiempoTranscurridoMinutos').lean();

    let tiempoPromedioResolucion = 0;
    if (ticketsConResolucion.length > 0) {
      const tiempoTotal = ticketsConResolucion.reduce((acc, ticket) => {
        return acc + (ticket.tiempoTranscurridoMinutos || 0);
      }, 0);
      tiempoPromedioResolucion = Math.round(tiempoTotal / ticketsConResolucion.length);
    }

    // Tickets por prioridad
    const ticketsPorPrioridad = await Ticket.aggregate([
      {
        $group: {
          _id: '$prioridad',
          count: { $sum: 1 },
        },
      },
    ]);

    // Tickets por área
    const ticketsPorArea = await Ticket.aggregate([
      {
        $group: {
          _id: '$area',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      totalTickets,
      ticketsAbiertos,
      ticketsEnProgreso,
      ticketsResueltos,
      ticketsCriticos,
      tiempoPromedioResolucion,
      ticketsPorPrioridad,
      ticketsPorArea,
    });
  } catch (error) {
    next(error);
  }
});

// Desempeño de técnicos (solo admin)
router.get('/tecnicos-desempenio', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const tecnicos = await User.find({ rol: 'tecnico', activo: true })
      .select('nombre email')
      .limit(200)
      .lean();

    const desempenio = await Promise.all(
      tecnicos.map(async (tecnico) => {
        const ticketsAsignados = await Ticket.countDocuments({
          tecnicoAsignado: tecnico._id,
        });
        const ticketsResueltos = await Ticket.countDocuments({
          tecnicoAsignado: tecnico._id,
          estado: 'resuelto',
        });

        return {
          tecnico: tecnico.nombre,
          email: tecnico.email,
          ticketsAsignados,
          ticketsResueltos,
          tasaResolucion: ticketsAsignados > 0 ? ((ticketsResueltos / ticketsAsignados) * 100).toFixed(2) : 0,
        };
      })
    );

    res.json(desempenio);
  } catch (error) {
    next(error);
  }
});

export default router;
