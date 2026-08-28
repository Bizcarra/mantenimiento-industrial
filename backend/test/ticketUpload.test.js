import assert from 'node:assert/strict';
import express from 'express';
import { after, before, test } from 'node:test';
import { cargarFotoTicket } from '../middleware/ticketUpload.js';

let servidor;
let urlBase;

before(async () => {
  const app = express();
  app.post('/ticket', cargarFotoTicket, (req, res) => {
    res.json({ campos: Object.keys(req.body), tieneFoto: Boolean(req.file) });
  });
  app.use((error, req, res, next) => {
    res.status(400).json({ codigo: error.code || error.name });
  });

  await new Promise((resolve) => {
    servidor = app.listen(0, '127.0.0.1', () => {
      urlBase = `http://127.0.0.1:${servidor.address().port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve, reject) => {
    servidor.close((error) => (error ? reject(error) : resolve()));
  });
});

test('acepta los cuatro campos del ticket junto con una foto', async () => {
  const formulario = new FormData();
  formulario.append('titulo', 'Falla de prueba');
  formulario.append('descripcion', 'Descripción suficientemente extensa');
  formulario.append('area', 'Producción');
  formulario.append('prioridad', 'media');
  formulario.append(
    'foto',
    new Blob([Buffer.from([0xff, 0xd8, 0xff, 0xd9])], { type: 'image/jpeg' }),
    'evidencia.jpg'
  );

  const respuesta = await fetch(`${urlBase}/ticket`, {
    method: 'POST',
    body: formulario,
  });
  const cuerpo = await respuesta.json();

  assert.equal(respuesta.status, 200);
  assert.deepEqual(cuerpo.campos.sort(), ['area', 'descripcion', 'prioridad', 'titulo']);
  assert.equal(cuerpo.tieneFoto, true);
});
