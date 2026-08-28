import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import Ticket from '../models/Ticket.js';
import {
  TAMANO_MAXIMO_FOTO,
  validarYLimpiarImagen,
} from '../services/ticketImages.js';
import { calcularFechaEliminacion } from '../services/ticketRetention.js';

const pngUnPixel = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64'
);

test('acepta una imagen PNG real y detecta el formato por su contenido', () => {
  const resultado = validarYLimpiarImagen({
    buffer: pngUnPixel,
    mimetype: 'image/png',
  });

  assert.equal(resultado.tipoMime, 'image/png');
  assert.equal(resultado.extension, 'png');
  assert.ok(resultado.contenido.length > 0);
});

test('rechaza archivos disfrazados de imagen y fotos mayores a 5 MB', () => {
  assert.throws(
    () => validarYLimpiarImagen({
      buffer: Buffer.from('<script>alert(1)</script>'),
      mimetype: 'image/png',
    }),
    /JPG o PNG válido/
  );

  assert.throws(
    () => validarYLimpiarImagen({
      buffer: Buffer.alloc(TAMANO_MAXIMO_FOTO + 1),
      mimetype: 'image/jpeg',
    }),
    /superar 5 MB/
  );
});

test('los metadatos internos de almacenamiento no se exponen en el JSON del ticket', () => {
  const ticket = new Ticket({
    titulo: 'Falla de prueba',
    descripcion: 'Descripción suficientemente extensa',
    area: 'Producción',
    solicitante: '507f1f77bcf86cd799439011',
    evidenciaFoto: {
      archivo: '123e4567-e89b-12d3-a456-426614174000.jpg',
      tipoMime: 'image/jpeg',
      tamano: 100,
      sha256: 'a'.repeat(64),
    },
  });

  const json = ticket.toJSON();
  assert.equal(json.evidenciaFoto.archivo, undefined);
  assert.equal(json.evidenciaFoto.sha256, undefined);
  assert.equal(json.evidenciaFoto.tipoMime, 'image/jpeg');
});

test('calcula tres meses calendario y ajusta correctamente el último día', () => {
  assert.equal(
    calcularFechaEliminacion('2026-01-31T12:30:00.000Z').toISOString(),
    '2026-04-30T12:30:00.000Z'
  );
  assert.equal(
    calcularFechaEliminacion('2026-08-27T12:30:00.000Z').toISOString(),
    '2026-11-27T12:30:00.000Z'
  );
});

test('guarda con nombre aleatorio y detecta alteraciones posteriores', async () => {
  const temporal = await fs.mkdtemp(path.join(os.tmpdir(), 'mantenimiento-evidencia-'));
  process.env.TICKET_UPLOAD_DIR = temporal;
  const servicio = await import(`../services/ticketImages.js?prueba=${Date.now()}`);
  let evidencia;

  try {
    evidencia = await servicio.guardarEvidenciaTicket({
      buffer: pngUnPixel,
      mimetype: 'image/png',
    });
    assert.match(evidencia.archivo, /^[0-9a-f-]{36}\.png$/);
    assert.deepEqual(await servicio.leerEvidenciaTicket(evidencia), pngUnPixel);

    await fs.writeFile(path.join(temporal, evidencia.archivo), Buffer.from('alterada'));
    await assert.rejects(
      () => servicio.leerEvidenciaTicket(evidencia),
      /integridad/
    );
  } finally {
    if (evidencia) await servicio.eliminarEvidenciaTicket(evidencia);
    await fs.rm(temporal, { recursive: true, force: true });
    delete process.env.TICKET_UPLOAD_DIR;
  }
});
