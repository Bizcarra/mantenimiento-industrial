import Ticket from '../models/Ticket.js';
import HistoryLog from '../models/HistoryLog.js';
import {
  eliminarEvidenciaTicket,
  eliminarEvidenciasHuerfanas,
} from './ticketImages.js';

const ESTADOS_FINALIZADOS = ['resuelto', 'cerrado'];
const INTERVALO_PREDETERMINADO = 60 * 60 * 1000;

export const calcularFechaEliminacion = (fechaResolucion) => {
  const origen = new Date(fechaResolucion);
  if (Number.isNaN(origen.getTime())) throw new TypeError('Fecha de resolución inválida');

  const diaOriginal = origen.getUTCDate();
  const resultado = new Date(origen);
  resultado.setUTCDate(1);
  resultado.setUTCMonth(resultado.getUTCMonth() + 3);
  const ultimoDiaDestino = new Date(Date.UTC(
    resultado.getUTCFullYear(),
    resultado.getUTCMonth() + 1,
    0
  )).getUTCDate();
  resultado.setUTCDate(Math.min(diaOriginal, ultimoDiaDestino));
  return resultado;
};

const completarFechasDeTicketsExistentes = async () => {
  const tickets = await Ticket.find({
    estado: { $in: ESTADOS_FINALIZADOS },
    eliminarDespuesDe: null,
  })
    .select('_id fechaResolucion updatedAt createdAt')
    .limit(1000);

  if (tickets.length === 0) return;

  await Ticket.bulkWrite(tickets.map((ticket) => {
    const fechaBase = ticket.fechaResolucion || ticket.updatedAt || ticket.createdAt;
    return {
      updateOne: {
        filter: {
          _id: ticket._id,
          estado: { $in: ESTADOS_FINALIZADOS },
          eliminarDespuesDe: null,
        },
        update: {
          $set: {
            fechaResolucion: fechaBase,
            eliminarDespuesDe: calcularFechaEliminacion(fechaBase),
          },
        },
      },
    };
  }));
};

export const eliminarRecursosAsociados = async (ticket) => {
  const resultados = await Promise.allSettled([
    HistoryLog.deleteMany({ ticket: ticket._id }),
    eliminarEvidenciaTicket(ticket.evidenciaFoto),
  ]);

  for (const resultado of resultados) {
    if (resultado.status === 'rejected') {
      console.error(`No se pudo eliminar un recurso de ${ticket._id}: ${resultado.reason.message}`);
    }
  }
};

export const eliminarTicketsVencidos = async (ahora = new Date()) => {
  await completarFechasDeTicketsExistentes();
  let totalEliminados = 0;

  while (true) {
    const vencidos = await Ticket.find({
      estado: { $in: ESTADOS_FINALIZADOS },
      eliminarDespuesDe: { $lte: ahora },
    })
      .select('_id evidenciaFoto eliminarDespuesDe')
      .limit(100);

    if (vencidos.length === 0) break;

    for (const ticket of vencidos) {
      const eliminado = await Ticket.findOneAndDelete({
        _id: ticket._id,
        estado: { $in: ESTADOS_FINALIZADOS },
        eliminarDespuesDe: { $lte: ahora },
      });
      if (!eliminado) continue;

      await eliminarRecursosAsociados(eliminado);
      totalEliminados += 1;
    }
  }

  const archivosReferenciados = new Set(
    (await Ticket.distinct('evidenciaFoto.archivo')).filter(Boolean)
  );
  await eliminarEvidenciasHuerfanas(archivosReferenciados, ahora);

  return totalEliminados;
};

export const iniciarLimpiezaTicketsResueltos = () => {
  const intervaloConfigurado = Number.parseInt(process.env.TICKET_CLEANUP_INTERVAL_MS, 10);
  const intervalo = Number.isFinite(intervaloConfigurado)
    ? Math.max(intervaloConfigurado, 60_000)
    : INTERVALO_PREDETERMINADO;
  let ejecutando = false;

  const ejecutar = async () => {
    if (ejecutando) return;
    ejecutando = true;
    try {
      const eliminados = await eliminarTicketsVencidos();
      if (eliminados > 0) {
        console.log(`Limpieza automática: ${eliminados} ticket(s) vencido(s) eliminado(s).`);
      }
    } catch (error) {
      console.error(`Falló la limpieza automática de tickets: ${error.message}`);
    } finally {
      ejecutando = false;
    }
  };

  void ejecutar();
  const temporizador = setInterval(ejecutar, intervalo);
  temporizador.unref();
  return () => clearInterval(temporizador);
};
