import { test } from "node:test";
import assert from "node:assert/strict";
import { porcentaje } from "../politicaFiscal.js";

/*
 * Lo que queda de politicaFiscal.js después del retiro de Macroeconomía
 * (22-nov-2026, 0258): solo `porcentaje`, que usan los juegos de Contabilidad
 * y la partida del Repaso Diario. Las pruebas de los bancos de «La Tesorería
 * Nacional» salieron con ellos; las de la trampa del redondeo se quedan,
 * porque guardan la función que sigue en uso.
 */

test("todo bien da exactamente 100, sin redondear", () => {
  assert.equal(porcentaje(12, 12), 100);
  assert.equal(porcentaje(8, 8), 100);
  assert.equal(porcentaje(3, 3), 100);
  assert.equal(porcentaje(10, 10), 100);
});

test("un porcentaje por ítem escrito a mano no llegaría al 100: por eso no hay ninguno", () => {
  /* La trampa, medida: la suma de porcentajes redondeados por ítem se queda corta. */
  assert.ok(12 * 8.33 < 100 && 3 * 33.3 < 100, "si esto dejara de ser cierto, el comentario de politicaFiscal.js sobra");
  /* Y la división al final no pierde nada en medio. */
  assert.ok(Math.abs(porcentaje(11, 12) - 91.6667) < 0.001);
  assert.ok(Math.abs(porcentaje(2, 3) - 66.6667) < 0.001);
});

test("sin ítems no hay división por cero: da 0", () => {
  assert.equal(porcentaje(0, 0), 0);
});
