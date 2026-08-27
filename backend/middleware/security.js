import cors from 'cors';
import { ipKeyGenerator, rateLimit } from 'express-rate-limit';

const esProduccion = process.env.NODE_ENV === 'production';
const metodosConJson = new Set(['POST', 'PUT', 'PATCH']);
const clavesPeligrosas = new Set(['__proto__', 'prototype', 'constructor']);

const listaEntorno = (nombre) =>
  (process.env[nombre] || '')
    .split(',')
    .map((valor) => valor.trim())
    .filter(Boolean);

const numeroEntorno = (nombre, valorPredeterminado, minimo, maximo) => {
  const valor = Number.parseInt(process.env[nombre], 10);
  if (!Number.isFinite(valor)) return valorPredeterminado;
  return Math.min(Math.max(valor, minimo), maximo);
};
const origenesDesarrollo = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

const origenesPermitidos = new Set([
  ...listaEntorno('CORS_ORIGINS'),
  ...(esProduccion ? [] : origenesDesarrollo),
]);

export const corsSeguro = cors({
  origin(origen, callback) {
    // Se permiten clientes sin Origin (CLI, backend a backend y health checks).
    if (!origen || origenesPermitidos.has(origen)) return callback(null, true);

    const error = new Error('Origen no permitido');
    error.status = 403;
    error.expose = true;
    return callback(error);
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  exposedHeaders: ['RateLimit', 'RateLimit-Policy', 'Retry-After', 'X-Request-Id'],
  credentials: false,
  maxAge: 86400,
  optionsSuccessStatus: 204,
});

export const limiteApi = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: numeroEntorno('RATE_LIMIT_MAX', 300, 30, 5000),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    mensaje: 'Demasiadas solicitudes. Intenta nuevamente más tarde.',
  },
  skip: (req) => req.path === '/health',
});

export const limiteAutenticacion = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: numeroEntorno('AUTH_RATE_LIMIT_MAX', 10, 3, 100),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    mensaje: 'Demasiados intentos de acceso. Espera 15 minutos antes de reintentar.',
  },
  identifier: 'autenticacion-por-ip',
});

export const limiteCuenta = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: numeroEntorno('AUTH_ACCOUNT_RATE_LIMIT_MAX', 5, 3, 50),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const email = typeof req.body?.email === 'string'
      ? req.body.email.trim().toLowerCase().slice(0, 254)
      : 'sin-email';
    return `${ipKeyGenerator(req.ip)}:${email}`;
  },
  message: {
    mensaje: 'Demasiados intentos para esta cuenta. Espera 15 minutos antes de reintentar.',
  },
  identifier: 'autenticacion-por-cuenta',
});

const buscarClavePeligrosa = (valor, profundidad = 0, visitados = new WeakSet()) => {
  if (valor === null || typeof valor !== 'object') return null;
  if (profundidad > 10) return 'estructura demasiado profunda';
  if (visitados.has(valor)) return null;
  visitados.add(valor);

  for (const [clave, contenido] of Object.entries(valor)) {
    if (clavesPeligrosas.has(clave) || clave.startsWith('$') || clave.includes('.')) {
      return `clave no permitida: ${clave}`;
    }

    const hallazgo = buscarClavePeligrosa(contenido, profundidad + 1, visitados);
    if (hallazgo) return hallazgo;
  }

  return null;
};

export const rechazarInyeccionNoSql = (req, res, next) => {
  const fuentes = [req.body, req.query, req.params];
  const hallazgo = fuentes.map((fuente) => buscarClavePeligrosa(fuente)).find(Boolean);

  if (hallazgo) {
    return res.status(400).json({ mensaje: 'La solicitud contiene campos no permitidos' });
  }

  next();
};

export const rechazarParametrosDuplicados = (req, res, next) => {
  const tieneDuplicados = Object.values(req.query || {}).some((valor) => Array.isArray(valor));
  if (tieneDuplicados) {
    return res.status(400).json({ mensaje: 'No se permiten parámetros de URL duplicados' });
  }
  next();
};

export const validarSolicitud = (req, res, next) => {
  if (req.originalUrl.length > 2048) {
    return res.status(414).json({ mensaje: 'La URL solicitada es demasiado larga' });
  }

  if (metodosConJson.has(req.method) && !req.is('application/json')) {
    return res.status(415).json({ mensaje: 'El contenido debe enviarse como application/json' });
  }

  next();
};

export const validarHost = (req, res, next) => {
  const hostsPermitidos = listaEntorno('ALLOWED_HOSTS');
  const dominioRailway = process.env.RAILWAY_PUBLIC_DOMAIN?.trim();
  if (dominioRailway) hostsPermitidos.push(dominioRailway);

  if (hostsPermitidos.length === 0) return next();

  const host = req.hostname?.toLowerCase();
  const permitido = hostsPermitidos.some((valor) => valor.toLowerCase() === host);
  if (!permitido) return res.status(400).json({ mensaje: 'Host no permitido' });

  next();
};

export const exigirHttps = (req, res, next) => {
  if (process.env.ENFORCE_HTTPS === 'true' && !req.secure) {
    return res.status(426).json({ mensaje: 'Esta API requiere una conexión HTTPS' });
  }
  next();
};

export const validarConfiguracionSegura = () => {
  const faltantes = ['MONGODB_URI', 'JWT_SECRET'].filter((nombre) => !process.env[nombre]);
  if (faltantes.length > 0) {
    throw new Error(`Faltan variables de entorno requeridas: ${faltantes.join(', ')}`);
  }

  if (esProduccion && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres en producción');
  }

  if (!esProduccion && process.env.JWT_SECRET.length < 32) {
    console.warn('JWT_SECRET tiene menos de 32 caracteres; reemplázalo antes de desplegar.');
  }

  if (esProduccion && origenesPermitidos.size === 0) {
    console.warn('CORS_ORIGINS no está configurado; los navegadores externos no podrán consumir la API.');
  }

  const dominioEmail = process.env.USER_EMAIL_DOMAIN?.trim().toLowerCase();
  const dominioValido = /^(?=.{1,100}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
  if (dominioEmail && !dominioValido.test(dominioEmail)) {
    throw new Error('USER_EMAIL_DOMAIN debe ser únicamente un dominio válido, sin http:// ni rutas');
  }
};
