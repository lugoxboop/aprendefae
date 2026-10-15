import { test } from "node:test";
import assert from "node:assert/strict";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * r5-2 «El Toro Negro» · LOS DATOS Y LAS CUENTAS (Célula E).
 *
 * El 3 del bloque D, pp. 268-269. Esta prueba no lee ninguna cifra esperada
 * del módulo: las que compara son las que imprime el libro (columnas y total
 * general) o las del índice del banco (provisión, castigos, diferencia).
 *
 *   · cada columna da lo que imprime el libro, y el total general 38.230.000
 *   · la provisión es 2.283.400
 *   · los castigos de marzo suman 2.450.000 y pasan la provisión en 166.600
 *   · la guarda de recorrido: se recorrieron 7 compañías y 7 columnas
 *   · ninguna celda es negativa ni NaN
 *   · la errata E-1: la Negra suma 3.550.000 y el 3.350.000 impreso no está
 * ═══════════════════════════════════════════════════════════════════════════
 */

const {
  COLUMNAS, PORCENTAJES, COMPANIAS, CASTIGOS_MARZO, RECUPERACION_MAYO, CIFRAS,
} = await import("../../data/repasoCap5ToroNegro.js");

/* Lo que imprime la p. 269 al pie de cada columna, en el orden del libro. */
const COLUMNAS_DEL_LIBRO = [12900000, 8330000, 6800000, 4700000, 1850000, 2150000, 1500000];
const PORCENTAJES_DEL_LIBRO = [0, 3, 3, 10, 12, 25, 40];
const NOMBRES_DEL_LIBRO = ["Roja", "Blanca", "Azul", "Negra", "Rosa", "Marrón", "Verde"];

test("la tabla tiene las siete compañías y las siete columnas del libro, en su orden", () => {
  assert.deepEqual(COMPANIAS.map((c) => c.nombre.replace("Cía. ", "")), NOMBRES_DEL_LIBRO);
  assert.equal(COLUMNAS.length, 7);
  assert.deepEqual(COLUMNAS.map((col) => PORCENTAJES[col]), PORCENTAJES_DEL_LIBRO);
});

test("ninguna celda es negativa ni NaN, y cada fila tiene siete (guarda: 7 × 7)", () => {
  let companias = 0;
  let celdas = 0;
  for (const c of COMPANIAS) {
    companias++;
    assert.equal(c.celdas.length, 7, `${c.nombre} no tiene siete celdas`);
    for (const v of c.celdas) {
      celdas++;
      assert.ok(Number.isFinite(v), `${c.nombre}: celda ${v} no es un número`);
      assert.ok(v >= 0, `${c.nombre}: celda negativa ${v}`);
    }
  }
  assert.equal(companias, 7);
  assert.equal(celdas, 49);
});

test("cada columna da lo que imprime el libro; guarda: recorrió 7 compañías y 7 columnas", () => {
  let columnas = 0;
  let companias = 0;
  COLUMNAS.forEach((col, i) => {
    columnas++;
    let suma = 0;
    for (const c of COMPANIAS) {
      if (i === 0) companias++;
      suma += c.celdas[i];
    }
    assert.equal(suma, COLUMNAS_DEL_LIBRO[i], `la columna ${col} suma ${suma}`);
    assert.equal(CIFRAS.totalesColumna[col], COLUMNAS_DEL_LIBRO[i], `CIFRAS.totalesColumna.${col}`);
  });
  assert.equal(columnas, 7, "no recorrió las siete columnas");
  assert.equal(companias, 7, "no recorrió las siete compañías");
});

test("el total general calculado es 38.230.000, por columnas y por filas", () => {
  assert.equal(CIFRAS.totalGeneral, 38230000);
  const porFilas = Object.values(CIFRAS.totalesFila).reduce((t, v) => t + v, 0);
  assert.equal(porFilas, 38230000);
  assert.equal(Object.keys(CIFRAS.totalesFila).length, 7);
});

test("la provisión es 2.283.400", () => {
  assert.equal(CIFRAS.provision, 2283400);
  /* Por columnas, a mano: 0 + 249.900 + 204.000 + 470.000 + 222.000 + 537.500 + 600.000. */
  assert.deepEqual(COLUMNAS.map((col) => CIFRAS.provisionColumna[col]),
    [0, 249900, 204000, 470000, 222000, 537500, 600000]);
});

test("los castigos de marzo suman 2.450.000 y superan la provisión en 166.600", () => {
  assert.deepEqual(CASTIGOS_MARZO.map((c) => [c.compania, c.valor]), [["roja", 950000], ["negra", 1500000]]);
  assert.equal(CIFRAS.castigos, 2450000);
  assert.equal(CIFRAS.castigoSobreProvision, 166600);
  assert.ok(CIFRAS.castigos > CIFRAS.provision, "la provisión tiene que quedar subestimada");
});

test("la recuperación de mayo es la de la Cía. Roja por 950.000", () => {
  assert.deepEqual(RECUPERACION_MAYO, { compania: "roja", valor: 950000 });
  assert.equal(CIFRAS.recuperacion, 950000);
});

test("errata E-1: la Negra suma 3.550.000 y el total impreso 3.350.000 no está en el módulo", () => {
  assert.equal(CIFRAS.totalesFila.negra, 3550000);
  const todo = JSON.stringify({ COMPANIAS, CIFRAS });
  assert.ok(!todo.includes("3350000"), "el módulo guarda el total impreso de la Negra");
  for (const c of COMPANIAS) assert.deepEqual(Object.keys(c).sort(), ["celdas", "id", "nombre"]);
});
