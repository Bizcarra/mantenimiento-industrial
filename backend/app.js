import 'dotenv/config';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import authRoutes from './routes/auth.js';
import ticketsRoutes from './routes/tickets.js';
import dashboardRoutes from './routes/dashboard.js';
import usersRoutes from './routes/users.js';
import {
  corsSeguro,
  exigirHttps,
  limiteApi,
  rechazarInyeccionNoSql,
  rechazarParametrosDuplicados,
  validarHost,
  validarSolicitud,
} from './middleware/security.js';
import { manejarError, rutaNoEncontrada } from './middleware/errors.js';

const app = express();
const esProduccion = process.env.NODE_ENV === 'production';
const servirFrontend = process.env.SERVE_FRONTEND === 'true';
const trustProxy = Number.parseInt(process.env.TRUST_PROXY, 10);
const backendDirectory = path.dirname(fileURLToPath(import.meta.url));
const frontendDist = path.resolve(backendDirectory, '../frontend/dist');
<<<<<<< HEAD
=======
const coopSegura = helmet.crossOriginOpenerPolicy({ policy: 'same-origin' });
const clusterSeguro = helmet.originAgentCluster();
>>>>>>> D

app.disable('x-powered-by');
app.set('query parser', 'simple');
app.set('trust proxy', Number.isInteger(trustProxy) ? trustProxy : esProduccion ? 1 : false);

app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader('X-Request-Id', req.id);
  res.setHeader('Cache-Control', 'no-store');
  next();
});

app.use(
  helmet({
    // Estas dos cabeceras se agregan debajo únicamente en HTTPS o loopback.
    // Los navegadores las rechazan en una IP LAN servida por HTTP.
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    originAgentCluster: false,
    strictTransportSecurity: esProduccion ? undefined : false,
    contentSecurityPolicy: {
      directives: {
        upgradeInsecureRequests: esProduccion ? [] : null,
      },
    },
  })
);
app.use((req, res, next) => {
  const hostLoopback = ['localhost', '127.0.0.1', '::1'].includes(req.hostname);
  if (!req.secure && !hostLoopback) return next();

  return coopSegura(req, res, (error) => {
    if (error) return next(error);
    return clusterSeguro(req, res, next);
  });
});
app.use(corsSeguro);
app.use(validarHost);
app.use(exigirHttps);
app.use('/api', limiteApi);
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '20kb', strict: true }));
app.use(validarSolicitud);
app.use(rechazarParametrosDuplicados);
app.use(rechazarInyeccionNoSql);

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', usersRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

if (servirFrontend) {
  app.use(
    express.static(frontendDist, {
      index: false,
      fallthrough: true,
      etag: true,
    })
  );

  app.get('*', (req, res, next) => {
    if (req.path === '/api' || req.path.startsWith('/api/')) return next();
    return res.sendFile(path.join(frontendDist, 'index.html'), (error) => {
      if (error) next(error);
    });
  });
}

app.use(rutaNoEncontrada);
app.use(manejarError);

export default app;
