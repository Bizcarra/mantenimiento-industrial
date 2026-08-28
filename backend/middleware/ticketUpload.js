import multer from 'multer';
import { rateLimit } from 'express-rate-limit';
import { TAMANO_MAXIMO_FOTO } from '../services/ticketImages.js';

const tiposDeclaradosPermitidos = new Set(['image/jpeg', 'image/png']);

export const limiteCreacionTickets = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    mensaje: 'Demasiados tickets enviados. Espera unos minutos antes de intentarlo nuevamente.',
  },
  identifier: 'creacion-de-tickets-por-ip',
});

const carga = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: TAMANO_MAXIMO_FOTO,
    files: 1,
    fields: 4,
    parts: 5,
    fieldNameSize: 50,
    fieldSize: 5000,
  },
  fileFilter: (req, archivo, callback) => {
    if (!tiposDeclaradosPermitidos.has(archivo.mimetype)) {
      const error = new Error('La foto debe estar en formato JPG o PNG');
      error.status = 400;
      error.expose = true;
      return callback(error);
    }
    return callback(null, true);
  },
});

export const cargarFotoTicket = carga.single('foto');
