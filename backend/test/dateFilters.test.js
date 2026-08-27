import assert from 'node:assert/strict';
import test from 'node:test';
import { crearRangoFechas } from '../utils/dateFilters.js';

test('crea un rango inclusivo para filtrar solicitudes por fecha', () => {
  const resultado = crearRangoFechas('2026-08-01', '2026-08-31');

  assert.equal(resultado.error, null);
  assert.equal(resultado.rango.$gte.toISOString(), '2026-08-01T00:00:00.000Z');
  assert.equal(resultado.rango.$lte.toISOString(), '2026-08-31T23:59:59.999Z');
});

test('rechaza fechas inexistentes y rangos invertidos', () => {
  assert.equal(crearRangoFechas('2026-02-30', '').error, 'El filtro de fecha no es válido');
  assert.equal(
    crearRangoFechas('2026-09-01', '2026-08-01').error,
    'La fecha inicial no puede ser posterior a la fecha final'
  );
});

test('permite filtrar únicamente desde o hasta una fecha', () => {
  assert.ok(crearRangoFechas('2026-08-01', '').rango.$gte);
  assert.ok(crearRangoFechas('', '2026-08-31').rango.$lte);
  assert.equal(crearRangoFechas(undefined, undefined).rango, null);
});
