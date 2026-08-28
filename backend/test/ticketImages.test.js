import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import sharp from 'sharp';
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

test('acepta una imagen PNG real y detecta el formato por su contenido', async () => {
  const resultado = await validarYLimpiarImagen({
    buffer: pngUnPixel,
    mimetype: 'image/png',
  });

  assert.equal(resultado.tipoMime, 'image/png');
  assert.equal(resultado.extension, 'png');
  assert.ok(resultado.contenido.length > 0);
});

test('rechaza archivos disfrazados de imagen y fotos mayores a 5 MB', async () => {
  await assert.rejects(
    () => validarYLimpiarImagen({
      buffer: Buffer.from('<script>alert(1)</script>'),
      mimetype: 'image/png',
    }),
    /JPG o PNG válido/
  );

  await assert.rejects(
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
    const contenidoGuardado = await servicio.leerEvidenciaTicket(evidencia);
    const metadatosGuardados = await sharp(contenidoGuardado).metadata();
    assert.equal(metadatosGuardados.width, 1);
    assert.equal(metadatosGuardados.height, 1);
    assert.equal(metadatosGuardados.orientation, undefined);

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

test('aplica la orientación EXIF a los píxeles y elimina los metadatos', async () => {
  const jpegConOrientacion = await sharp({
    create: {
      width: 2,
      height: 3,
      channels: 3,
      background: { r: 30, g: 90, b: 160 },
    },
  })
    .jpeg()
    .withMetadata({ orientation: 6 })
    .toBuffer();

  const original = await sharp(jpegConOrientacion).metadata();
  assert.equal(original.orientation, 6);

  const resultado = await validarYLimpiarImagen({
    buffer: jpegConOrientacion,
    mimetype: 'image/jpeg',
  });
  const corregida = await sharp(resultado.contenido).metadata();

  assert.equal(corregida.width, 3);
  assert.equal(corregida.height, 2);
  assert.equal(corregida.orientation, undefined);
  assert.equal(corregida.exif, undefined);
});

test('permite girar una evidencia existente y genera una nueva huella', async () => {
  const temporal = await fs.mkdtemp(path.join(os.tmpdir(), 'mantenimiento-rotacion-'));
  process.env.TICKET_UPLOAD_DIR = temporal;
  const servicio = await import(`../services/ticketImages.js?rotacion=${Date.now()}`);
  let original;
  let rotada;

  try {
    const pngRectangular = await sharp({
      create: {
        width: 2,
        height: 3,
        channels: 4,
        background: { r: 180, g: 40, b: 70, alpha: 1 },
      },
    }).png().toBuffer();
    original = await servicio.guardarEvidenciaTicket({
      buffer: pngRectangular,
      mimetype: 'image/png',
    });
    rotada = await servicio.rotarEvidenciaTicket(original, 90);

    const contenidoRotado = await servicio.leerEvidenciaTicket(rotada);
    const metadatos = await sharp(contenidoRotado).metadata();
    assert.equal(metadatos.width, 3);
    assert.equal(metadatos.height, 2);
    assert.notEqual(rotada.archivo, original.archivo);
    assert.notEqual(rotada.sha256, original.sha256);
  } finally {
    if (original) await servicio.eliminarEvidenciaTicket(original);
    if (rotada) await servicio.eliminarEvidenciaTicket(rotada);
    await fs.rm(temporal, { recursive: true, force: true });
    delete process.env.TICKET_UPLOAD_DIR;
  }
});
