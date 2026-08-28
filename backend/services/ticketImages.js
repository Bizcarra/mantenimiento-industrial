import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const TAMANO_MAXIMO_FOTO = 5 * 1024 * 1024;
export const DIMENSION_MAXIMA_FOTO = 12000;
export const PIXELES_MAXIMOS_FOTO = 40_000_000;

const backendDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const directorioEvidencias = path.resolve(
  process.env.TICKET_UPLOAD_DIR || path.join(backendDirectory, 'storage', 'ticket-images')
);
const patronArchivoSeguro = /^[0-9a-f-]{36}\.(?:jpg|png)$/;
const tablaCrc32 = (() => {
  const tabla = new Uint32Array(256);
  for (let indice = 0; indice < 256; indice += 1) {
    let valor = indice;
    for (let bit = 0; bit < 8; bit += 1) {
      valor = (valor & 1) ? (0xedb88320 ^ (valor >>> 1)) : (valor >>> 1);
    }
    tabla[indice] = valor >>> 0;
  }
  return tabla;
})();

const crearErrorPublico = (mensaje, estado = 400) => {
  const error = new Error(mensaje);
  error.status = estado;
  error.expose = estado < 500;
  return error;
};

const validarDimensiones = (ancho, alto) => {
  if (
    !Number.isInteger(ancho) ||
    !Number.isInteger(alto) ||
    ancho < 1 ||
    alto < 1 ||
    ancho > DIMENSION_MAXIMA_FOTO ||
    alto > DIMENSION_MAXIMA_FOTO ||
    ancho * alto > PIXELES_MAXIMOS_FOTO
  ) {
    throw crearErrorPublico(
      'La foto tiene dimensiones no permitidas. Usa una imagen de hasta 40 megapíxeles.'
    );
  }
};

const calcularCrc32 = (buffer) => {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = tablaCrc32[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const validarEstructuraPng = (buffer) => {
  let offset = 8;
  let numeroBloques = 0;
  let encontroIdat = false;
  let encontroIend = false;

  while (offset + 12 <= buffer.length && numeroBloques < 10_000) {
    const longitud = buffer.readUInt32BE(offset);
    const inicioContenido = offset + 8;
    const finContenido = inicioContenido + longitud;
    const finBloque = finContenido + 4;
    if (finBloque > buffer.length) return false;

    const tipo = buffer.toString('ascii', offset + 4, offset + 8);
    if (!/^[A-Za-z]{4}$/.test(tipo)) return false;
    if (calcularCrc32(buffer.subarray(offset + 4, finContenido)) !== buffer.readUInt32BE(finContenido)) {
      return false;
    }
    if (numeroBloques === 0 && tipo !== 'IHDR') return false;
    if (tipo === 'IDAT') encontroIdat = true;
    if (tipo === 'IEND') {
      encontroIend = true;
      offset = finBloque;
      break;
    }

    offset = finBloque;
    numeroBloques += 1;
  }

  return encontroIdat && encontroIend && offset === buffer.length;
};

const analizarPng = (buffer) => {
  const firma = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (
    buffer.length < 45 ||
    !buffer.subarray(0, 8).equals(firma) ||
    buffer.readUInt32BE(8) !== 13 ||
    buffer.toString('ascii', 12, 16) !== 'IHDR' ||
    buffer.readUInt32BE(buffer.length - 12) !== 0 ||
    buffer.toString('ascii', buffer.length - 8, buffer.length - 4) !== 'IEND' ||
    !validarEstructuraPng(buffer)
  ) {
    return null;
  }

  validarDimensiones(buffer.readUInt32BE(16), buffer.readUInt32BE(20));
  return { extension: 'png', tipoMime: 'image/png' };
};

const marcadoresConDimensionesJpeg = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7,
  0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
]);

const obtenerDimensionesJpeg = (buffer) => {
  let offset = 2;

  while (offset + 4 <= buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    while (offset < buffer.length && buffer[offset] === 0xff) offset += 1;
    const marcador = buffer[offset];
    offset += 1;

    if (marcador === 0xd9 || marcador === 0xda) break;
    if (marcador === 0x01 || (marcador >= 0xd0 && marcador <= 0xd8)) continue;
    if (offset + 2 > buffer.length) break;

    const longitud = buffer.readUInt16BE(offset);
    if (longitud < 2 || offset + longitud > buffer.length) break;

    if (marcadoresConDimensionesJpeg.has(marcador) && longitud >= 7) {
      return {
        alto: buffer.readUInt16BE(offset + 3),
        ancho: buffer.readUInt16BE(offset + 5),
      };
    }
    offset += longitud;
  }

  return null;
};

const analizarJpeg = (buffer) => {
  if (
    buffer.length < 12 ||
    buffer[0] !== 0xff ||
    buffer[1] !== 0xd8 ||
    buffer[buffer.length - 2] !== 0xff ||
    buffer[buffer.length - 1] !== 0xd9
  ) {
    return null;
  }

  const dimensiones = obtenerDimensionesJpeg(buffer);
  if (!dimensiones) return null;
  validarDimensiones(dimensiones.ancho, dimensiones.alto);
  return { extension: 'jpg', tipoMime: 'image/jpeg' };
};

const limpiarMetadatosJpeg = (buffer) => {
  const partes = [buffer.subarray(0, 2)];
  let offset = 2;

  while (offset + 4 <= buffer.length) {
    const inicio = offset;
    if (buffer[offset] !== 0xff) return buffer;
    while (offset < buffer.length && buffer[offset] === 0xff) offset += 1;

    const marcador = buffer[offset];
    offset += 1;
    if (marcador === 0xda) {
      partes.push(buffer.subarray(inicio));
      return Buffer.concat(partes);
    }
    if (marcador === 0xd9) {
      partes.push(buffer.subarray(inicio, offset));
      return Buffer.concat(partes);
    }
    if (marcador === 0x01 || (marcador >= 0xd0 && marcador <= 0xd8)) {
      partes.push(buffer.subarray(inicio, offset));
      continue;
    }
    if (offset + 2 > buffer.length) return buffer;

    const longitud = buffer.readUInt16BE(offset);
    const fin = offset + longitud;
    if (longitud < 2 || fin > buffer.length) return buffer;

    // EXIF/XMP (APP1), IPTC (APP13) y comentarios pueden contener ubicación u otros datos.
    if (![0xe1, 0xed, 0xfe].includes(marcador)) {
      partes.push(buffer.subarray(inicio, fin));
    }
    offset = fin;
  }

  return buffer;
};

const limpiarMetadatosPng = (buffer) => {
  const partes = [buffer.subarray(0, 8)];
  const bloquesPrivados = new Set(['eXIf', 'iTXt', 'tEXt', 'zTXt', 'tIME']);
  let offset = 8;

  while (offset + 12 <= buffer.length) {
    const longitud = buffer.readUInt32BE(offset);
    const fin = offset + 12 + longitud;
    if (fin > buffer.length) return buffer;

    const tipo = buffer.toString('ascii', offset + 4, offset + 8);
    if (!bloquesPrivados.has(tipo)) partes.push(buffer.subarray(offset, fin));
    offset = fin;
    if (tipo === 'IEND') break;
  }

  return Buffer.concat(partes);
};

export const validarYLimpiarImagen = (archivo) => {
  if (!archivo?.buffer || !Buffer.isBuffer(archivo.buffer) || archivo.buffer.length === 0) {
    throw crearErrorPublico('Selecciona una foto válida');
  }
  if (archivo.buffer.length > TAMANO_MAXIMO_FOTO) {
    throw crearErrorPublico('La foto no puede superar 5 MB', 413);
  }

  const formato = analizarJpeg(archivo.buffer) || analizarPng(archivo.buffer);
  if (!formato) {
    throw crearErrorPublico('La foto debe ser un archivo JPG o PNG válido');
  }
  if (archivo.mimetype !== formato.tipoMime) {
    throw crearErrorPublico('El contenido de la foto no coincide con su tipo declarado');
  }

  const contenido = formato.extension === 'jpg'
    ? limpiarMetadatosJpeg(archivo.buffer)
    : limpiarMetadatosPng(archivo.buffer);

  return { ...formato, contenido };
};

export const guardarEvidenciaTicket = async (archivo) => {
  const imagen = validarYLimpiarImagen(archivo);
  const nombreArchivo = `${crypto.randomUUID()}.${imagen.extension}`;
  const rutaArchivo = path.join(directorioEvidencias, nombreArchivo);

  await fs.mkdir(directorioEvidencias, { recursive: true });
  await fs.writeFile(rutaArchivo, imagen.contenido, { flag: 'wx', mode: 0o600 });

  return {
    archivo: nombreArchivo,
    tipoMime: imagen.tipoMime,
    tamano: imagen.contenido.length,
    sha256: crypto.createHash('sha256').update(imagen.contenido).digest('hex'),
    fechaCarga: new Date(),
  };
};

const resolverRutaSegura = (nombreArchivo) => {
  if (typeof nombreArchivo !== 'string' || !patronArchivoSeguro.test(nombreArchivo)) {
    throw crearErrorPublico('La evidencia solicitada no es válida');
  }
  const ruta = path.resolve(directorioEvidencias, nombreArchivo);
  if (path.dirname(ruta) !== directorioEvidencias) {
    throw crearErrorPublico('La evidencia solicitada no es válida');
  }
  return ruta;
};

export const leerEvidenciaTicket = async (evidencia) => {
  const contenido = await fs.readFile(resolverRutaSegura(evidencia?.archivo));
  const hashActual = crypto.createHash('sha256').update(contenido).digest('hex');

  if (
    typeof evidencia?.sha256 !== 'string' ||
    evidencia.sha256.length !== hashActual.length ||
    !crypto.timingSafeEqual(Buffer.from(evidencia.sha256), Buffer.from(hashActual))
  ) {
    throw crearErrorPublico('No fue posible comprobar la integridad de la evidencia', 500);
  }

  return contenido;
};

export const eliminarEvidenciaTicket = async (evidencia) => {
  if (!evidencia?.archivo) return;
  try {
    await fs.unlink(resolverRutaSegura(evidencia.archivo));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
};

export const eliminarEvidenciasHuerfanas = async (archivosReferenciados, ahora = new Date()) => {
  const limiteAntiguedad = ahora.getTime() - (24 * 60 * 60 * 1000);
  let entradas;
  try {
    entradas = await fs.readdir(directorioEvidencias, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return 0;
    throw error;
  }

  let eliminadas = 0;
  for (const entrada of entradas) {
    if (
      !entrada.isFile() ||
      !patronArchivoSeguro.test(entrada.name) ||
      archivosReferenciados.has(entrada.name)
    ) {
      continue;
    }

    const ruta = resolverRutaSegura(entrada.name);
    const informacion = await fs.stat(ruta);
    if (informacion.mtimeMs > limiteAntiguedad) continue;

    await fs.unlink(ruta);
    eliminadas += 1;
  }
  return eliminadas;
};
