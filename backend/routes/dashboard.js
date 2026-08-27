import express from 'express';
import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { crearRangoFechas } from '../utils/dateFilters.js';

const router = express.Router();
const ESTADOS = ['abierto', 'en_progreso', 'pausado', 'resuelto', 'cerrado'];
const PRIORIDADES = ['baja', 'media', 'alta', 'critica'];

const obtenerFiltroFecha = (req, res) => {
  const { rango, error } = crearRangoFechas(req.query.fechaDesde, req.query.fechaHasta);
  if (error) {
    res.status(400).json({ mensaje: error });
    return null;
  }
  return rango ? { fechaSolicitud: rango } : {};
};

const completarCategorias = (resultados, categorias) => {
  const cantidades = new Map(resultados.map((item) => [item._id, item.count]));
  return categorias.map((categoria) => ({ _id: categoria, count: cantidades.get(categoria) || 0 }));
};

router.get('/stats', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const filtroFecha = obtenerFiltroFecha(req, res);
    if (!filtroFecha) return;

    const [porEstadoRaw, porPrioridadRaw, porAreaRaw, ticketsFinalizados, sinAsignar] = await Promise.all([
      Ticket.aggregate([
        { $match: filtroFecha },
        { $group: { _id: '$estado', count: { $sum: 1 } } },
      ]),
      Ticket.aggregate([
        { $match: filtroFecha },
        { $group: { _id: '$prioridad', count: { $sum: 1 } } },
      ]),
      Ticket.aggregate([
        { $match: filtroFecha },
        { $group: { _id: '$area', count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
        { $limit: 8 },
      ]),
      Ticket.find({
        ...filtroFecha,
        estado: { $in: ['resuelto', 'cerrado'] },
        $or: [
          { tiempoTranscurridoMinutos: { $ne: null } },
          { fechaResolucion: { $ne: null } },
        ],
      }).select('fechaSolicitud fechaResolucion tiempoTranscurridoMinutos').lean(),
      Ticket.countDocuments({ ...filtroFecha, tecnicoAsignado: null }),
    ]);

    const ticketsPorEstado = completarCategorias(porEstadoRaw, ESTADOS);
    const ticketsPorPrioridad = completarCategorias(porPrioridadRaw, PRIORIDADES);
    const estados = Object.fromEntries(ticketsPorEstado.map((item) => [item._id, item.count]));
    const totalTickets = ticketsPorEstado.reduce((total, item) => total + item.count, 0);
    const tiemposValidos = ticketsFinalizados
      .map((ticket) => {
        if (Number.isFinite(ticket.tiempoTranscurridoMinutos)) {
          return Math.max(0, ticket.tiempoTranscurridoMinutos);
        }
        if (ticket.fechaResolucion && ticket.fechaSolicitud) {
          return Math.max(0, Math.round((ticket.fechaResolucion - ticket.fechaSolicitud) / 60000));
        }
        return null;
      })
      .filter((valor) => valor !== null);
    const tiempoPromedioResolucion = tiemposValidos.length > 0
      ? Math.round(tiemposValidos.reduce((total, minutos) => total + minutos, 0) / tiemposValidos.length)
      : null;

    res.json({
      totalTickets,
      ticketsAbiertos: estados.abierto,
      ticketsEnProgreso: estados.en_progreso,
      ticketsPausados: estados.pausado,
      ticketsResueltos: estados.resuelto,
      ticketsCerrados: estados.cerrado,
      ticketsPendientes: estados.abierto + estados.en_progreso + estados.pausado,
      ticketsCriticos: ticketsPorPrioridad.find((item) => item._id === 'critica')?.count || 0,
      ticketsSinAsignar: sinAsignar,
      tiempoPromedioResolucion,
      ticketsUsadosParaPromedio: tiemposValidos.length,
      ticketsPorEstado,
      ticketsPorPrioridad,
      ticketsPorArea: porAreaRaw,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/tecnicos-desempenio', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const filtroFecha = obtenerFiltroFecha(req, res);
    if (!filtroFecha) return;

    const tecnicos = await User.find({ rol: 'tecnico', activo: true })
      .select('nombre email')
      .sort({ nombre: 1 })
      .limit(200)
      .lean();
    const idsTecnicos = tecnicos.map((tecnico) => tecnico._id);
    const resultados = await Ticket.aggregate([
      { $match: { ...filtroFecha, tecnicoAsignado: { $in: idsTecnicos } } },
      {
        $group: {
          _id: '$tecnicoAsignado',
          ticketsAsignados: { $sum: 1 },
          ticketsResueltos: {
            $sum: { $cond: [{ $in: ['$estado', ['resuelto', 'cerrado']] }, 1, 0] },
          },
        },
      },
    ]);
    const porTecnico = new Map(resultados.map((item) => [item._id.toString(), item]));

    const desempenio = tecnicos.map((tecnico) => {
      const resultado = porTecnico.get(tecnico._id.toString());
      const ticketsAsignados = resultado?.ticketsAsignados || 0;
      const ticketsResueltos = resultado?.ticketsResueltos || 0;
      return {
        tecnico: tecnico.nombre,
        email: tecnico.email,
        ticketsAsignados,
        ticketsResueltos,
        tasaResolucion: ticketsAsignados > 0
          ? Math.round((ticketsResueltos / ticketsAsignados) * 100)
          : 0,
      };
    });

    res.json(desempenio);
  } catch (error) {
    next(error);
  }
});

export default router;
