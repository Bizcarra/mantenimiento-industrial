import assert from 'node:assert/strict';
import http from 'node:http';
import { after, before, test } from 'node:test';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-with-at-least-thirty-two-characters';

const { default: app } = await import('../app.js');

let servidor;
let urlBase;

before(async () => {
  await new Promise((resolve) => {
    servidor = app.listen(0, '127.0.0.1', () => {
      const direccion = servidor.address();
      urlBase = `http://127.0.0.1:${direccion.port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve, reject) => {
    servidor.close((error) => (error ? reject(error) : resolve()));
  });
});

test('agrega cabeceras seguras y oculta Express', async () => {
  const respuesta = await fetch(`${urlBase}/api/health`);

  assert.equal(respuesta.status, 200);
  assert.equal(respuesta.headers.get('x-powered-by'), null);
  assert.equal(respuesta.headers.get('x-content-type-options'), 'nosniff');
  assert.match(respuesta.headers.get('content-security-policy'), /default-src 'self'/);
  assert.ok(respuesta.headers.get('x-request-id'));
  assert.equal(respuesta.headers.get('cache-control'), 'no-store');
});

test('omite cabeceras de aislamiento no válidas sobre HTTP por IP local', async () => {
  const respuesta = await new Promise((resolve, reject) => {
    const solicitud = http.get(`${urlBase}/api/health`, {
      headers: { Host: '192.168.1.9:5050' },
    }, resolve);
    solicitud.on('error', reject);
  });

  assert.equal(respuesta.statusCode, 200);
  assert.equal(respuesta.headers['cross-origin-opener-policy'], undefined);
  assert.equal(respuesta.headers['origin-agent-cluster'], undefined);
  assert.equal(respuesta.headers['x-content-type-options'], 'nosniff');
  respuesta.resume();
});

test('bloquea orígenes web no autorizados', async () => {
  const respuesta = await fetch(`${urlBase}/api/health`, {
    headers: { Origin: 'https://malicioso.example' },
  });
  const cuerpo = await respuesta.json();

  assert.equal(respuesta.status, 403);
  assert.equal(cuerpo.mensaje, 'Origen no permitido');
});

test('rechaza operadores de inyección NoSQL', async () => {
  const respuesta = await fetch(`${urlBase}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: { $ne: null }, password: 'cualquier-password' }),
  });

  assert.equal(respuesta.status, 400);
  assert.equal((await respuesta.json()).mensaje, 'La solicitud contiene campos no permitidos');
});

test('rechaza parámetros duplicados', async () => {
  const respuesta = await fetch(
    `${urlBase}/api/tickets?estado=abierto&estado=cerrado`
  );

  assert.equal(respuesta.status, 400);
  assert.equal((await respuesta.json()).mensaje, 'No se permiten parámetros de URL duplicados');
});

test('exige JSON y limita el tamaño del cuerpo', async () => {
  const tipoIncorrecto = await fetch(`${urlBase}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: 'email=admin@example.com',
  });
  assert.equal(tipoIncorrecto.status, 415);

  const cuerpoGrande = await fetch(`${urlBase}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contenido: 'x'.repeat(25 * 1024) }),
  });
  assert.equal(cuerpoGrande.status, 413);
});

test('no filtra errores internos ni rutas de Express', async () => {
  const jsonInvalido = await fetch(`${urlBase}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{',
  });
  const cuerpoError = await jsonInvalido.json();
  assert.equal(jsonInvalido.status, 400);
  assert.equal(cuerpoError.mensaje, 'El JSON enviado no es válido');
  assert.ok(!JSON.stringify(cuerpoError).includes('SyntaxError'));

  const inexistente = await fetch(`${urlBase}/api/no-existe`);
  assert.equal(inexistente.status, 404);
  assert.deepEqual(await inexistente.json(), { mensaje: 'Ruta no encontrada' });
});

test('limita intentos repetidos sobre una misma cuenta', async () => {
  let ultimaRespuesta;

  for (let intento = 0; intento < 6; intento += 1) {
    ultimaRespuesta = await fetch(`${urlBase}/api/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Prueba de límite',
        email: 'limite@example.com',
        password: 'password-segura-123',
      }),
    });
  }

  assert.equal(ultimaRespuesta.status, 429);
  assert.match((await ultimaRespuesta.json()).mensaje, /Demasiados intentos/);
});
