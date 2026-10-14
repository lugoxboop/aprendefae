import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · EL ORDEN FINAL (decisión de L, 14 de octubre de 2026).
 *
 * La fuente es la sección «Orden final de T7-2» del mapa
 * (orquestador/conocimiento/mapas/t7-inventarios.md): 11 piezas, en su
 * orden, con los ids del plan v1 de Near. Como la de T7-1, esta prueba no fija
 * cuáles están publicadas —eso cambia con cada PR—, sino tres cosas:
 *
 *   · la lista es la misma tabla del mapa, fila por fila
 *   · todo id t7-2 de subjects.js y de PIEZAS_T7_2 está en la lista
 *   · los presentes siguen el orden relativo de la lista
 *
 * Si entra una pieza que no está aquí, primero se agrega al mapa y a la lista.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ORDEN_T7_2 = [
  "t7-2-a1-la-cuenta-que-si-se-mueve",
  "t7-2-debe-o-haber",
  "t7-2-a2-la-venta-en-dos-asientos",
  "t7-2-dos-asientos",
  "t7-2-a3-el-kardex",
  "t7-2-llena-el-kardex",
  "t7-2-a4-san-calixto",
  "t7-2-periodico-o-permanente",
  "t7-2-a5-fletes",
  "t7-2-a6-devoluciones",
  "t7-2-flete-y-devolucion",
];

const { SUBJECTS } = await import("../../data/subjects.js");
const { PIEZAS_T7_2, TEMA_T7_2 } = await import("../../components/ContabilidadT7_2View.jsx");

const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_2);
const ENSUBJECTS = TEMA.actividades.map((a) => a.id);
const ENLAVISTA = PIEZAS_T7_2.map((p) => p.pieza.id);
const MAPA = readFileSync(new URL("../../../orquestador/conocimiento/mapas/t7-inventarios.md", import.meta.url), "utf8");

function siguenElOrden(ids, donde) {
  const fuera = ids.filter((id) => id.startsWith("t7-2-") && !ORDEN_T7_2.includes(id));
  assert.deepEqual(fuera, [], `${donde}: estos ids no están en el orden final del mapa`);
  const posiciones = ids.map((id) => ORDEN_T7_2.indexOf(id));
  const esperado = [...ids].sort((a, b) => ORDEN_T7_2.indexOf(a) - ORDEN_T7_2.indexOf(b));
  assert.deepEqual(ids, esperado, `${donde}: no siguen el orden final del mapa (posiciones ${posiciones.join(", ")})`);
}

test("★★★ la lista tiene las 11 piezas del plan, sin repetir: 6 de Aprender y 5 de Hacer", () => {
  assert.equal(ORDEN_T7_2.length, 11);
  assert.equal(new Set(ORDEN_T7_2).size, 11);
  assert.equal(ORDEN_T7_2.filter((id) => /^t7-2-a\d-/.test(id)).length, 6);
});

test("★★★ la lista es la tabla «Orden final de T7-2» del mapa, fila por fila, sin nombres repetidos", () => {
  const i = MAPA.indexOf("## Orden final de T7-2");
  assert.ok(i >= 0, "el mapa no tiene la sección «Orden final de T7-2»");
  const seccion = MAPA.slice(i, MAPA.indexOf("\n## ", i + 1));
  const filas = seccion.split("\n").filter((l) => /^\| \d+ \|/.test(l)).map((l) => l.split("|").map((c) => c.trim()));
  assert.deepEqual(filas.map((f) => f[2]), ORDEN_T7_2);
  assert.deepEqual(filas.map((f) => Number(f[1])), ORDEN_T7_2.map((_, k) => k + 1));
  /* Ningún nombre se repite: en el índice se verían dos actividades iguales (L renombró el Hacer #4). */
  const nombres = filas.map((f) => f[3]);
  assert.deepEqual(nombres.filter((n, k) => nombres.indexOf(n) !== k), [], "hay nombres repetidos en el orden de T7-2");
  assert.equal(nombres[3], "Arma los dos asientos");
  /* Cada Hacer, justo después de su Aprender; después de A5 no hay Hacer: H5 cubre A5 y A6. */
  assert.deepEqual(filas.map((f) => f[4]), ["Aprender", "Hacer", "Aprender", "Hacer", "Aprender", "Hacer", "Aprender", "Hacer", "Aprender", "Aprender", "Hacer"]);
});

test("★★★ subjects.js: todo id t7-2 está en el orden final y los presentes van en su orden", () => {
  assert.ok(ENSUBJECTS.length > 0);
  siguenElOrden(ENSUBJECTS, "subjects.js");
});

test("★★★ la vista: todo id de PIEZAS_T7_2 está en el orden final y los presentes van en su orden", () => {
  assert.ok(ENLAVISTA.length > 0);
  siguenElOrden(ENLAVISTA, "PIEZAS_T7_2");
});
