import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · EL ORDEN FINAL (decisión de L, 14 de octubre de 2026).
 *
 * La fuente es la sección «Orden final de T7-3» del mapa
 * (orquestador/conocimiento/mapas/t7-inventarios.md): 15 piezas, con los ids
 * del plan v1 de Near y el orden de su plan reordenado por la regla 9. Como
 * las de T7-1 y T7-2, esta prueba no fija
 * cuáles están publicadas —eso cambia con cada PR—, sino tres cosas:
 *
 *   · la lista es la misma tabla del mapa, fila por fila
 *   · todo id t7-3 de subjects.js y de PIEZAS_T7_3 está en la lista
 *   · los presentes siguen el orden relativo de la lista
 *
 * Si entra una pieza que no está aquí, primero se agrega al mapa y a la lista.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ORDEN_T7_3 = [
  "t7-3-descuento-comercial",
  "t7-3-descuento-en-factura",
  "t7-3-descuentos-en-cadena",
  "t7-3-cadena-de-descuentos",
  "t7-3-descuento-condicionado",
  "t7-3-descuento-en-dos-libros",
  "t7-3-comercial-o-condicionado",
  "t7-3-pago-a-tiempo",
  "t7-3-sobrantes-y-faltantes",
  "t7-3-provision-inventarios",
  "t7-3-ajuste-por-conteo",
  "t7-3-nic2-costo",
  "t7-3-que-entra-al-costo",
  "t7-3-costo-o-vnr",
  "t7-3-nic2-formulas",
];

const { SUBJECTS } = await import("../../data/subjects.js");
const { PIEZAS_T7_3, TEMA_T7_3 } = await import("../../components/ContabilidadT7_3View.jsx");

const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_3);
const ENSUBJECTS = TEMA.actividades.map((a) => a.id);
const ENLAVISTA = PIEZAS_T7_3.map((p) => p.pieza.id);
const MAPA = readFileSync(new URL("../../../orquestador/conocimiento/mapas/t7-inventarios.md", import.meta.url), "utf8");

function siguenElOrden(ids, donde) {
  const fuera = ids.filter((id) => id.startsWith("t7-3-") && !ORDEN_T7_3.includes(id));
  assert.deepEqual(fuera, [], `${donde}: estos ids no están en el orden final del mapa`);
  const posiciones = ids.map((id) => ORDEN_T7_3.indexOf(id));
  const esperado = [...ids].sort((a, b) => ORDEN_T7_3.indexOf(a) - ORDEN_T7_3.indexOf(b));
  assert.deepEqual(ids, esperado, `${donde}: no siguen el orden final del mapa (posiciones ${posiciones.join(", ")})`);
}

test("★★★ la lista tiene las 15 piezas del plan, sin repetir: 8 de Aprender y 7 de Hacer", () => {
  assert.equal(ORDEN_T7_3.length, 15);
  assert.equal(new Set(ORDEN_T7_3).size, 15);
});

test("★★★ la lista es la tabla «Orden final de T7-3» del mapa, fila por fila, sin nombres repetidos", () => {
  const i = MAPA.indexOf("## Orden final de T7-3");
  assert.ok(i >= 0, "el mapa no tiene la sección «Orden final de T7-3»");
  const seccion = MAPA.slice(i, MAPA.indexOf("\n## ", i + 1));
  const filas = seccion.split("\n").filter((l) => /^\| \d+ \|/.test(l)).map((l) => l.split("|").map((c) => c.trim()));
  assert.deepEqual(filas.map((f) => f[2]), ORDEN_T7_3);
  assert.deepEqual(filas.map((f) => Number(f[1])), ORDEN_T7_3.map((_, k) => k + 1));
  const nombres = filas.map((f) => f[3]);
  assert.deepEqual(nombres.filter((n, k) => nombres.indexOf(n) !== k), [], "hay nombres repetidos en el orden de T7-3");
  /* El plan reordenado de Near: A1 · H1 · A2 · H2 · A3 · A4 · H3 · H4 · A5 · A6 · H5 · A7 · H6 · H7 · A8. */
  const A = "Aprender"; const H = "Hacer";
  assert.deepEqual(filas.map((f) => f[4]), [A, H, A, H, A, A, H, H, A, A, H, A, H, H, A]);
  /* Las de Hacer, en el orden de sus migraciones (0103 a 0109): su FP suma 170. */
  assert.match(seccion, /25 \+ 25 \+ 10 \+ 50 \+ 25 \+ 10 \+ 25 = 170, con las migraciones 0103 a 0109/);
  /* Es la tabla del plan reordenado de Near (capa 3 del paquete del plan). */
  const plan = readFileSync(new URL("../../../orquestador/conocimiento/paquetes/t7-3-plan-v1.md", import.meta.url), "utf8");
  assert.ok(plan.includes("**A1 · H1 · A2 · H2 · A3 · A4 · H3 · H4 · A5 · A6 · H5 · A7 · H6 · H7 · A8**"));
  const ids = [...plan.matchAll(/^\| (A\d|H\d) \| `(t7-3-[a-z0-9-]+)` \| ([^|]+) \|/gm)].map((m) => [m[1], m[2], m[3].trim()]);
  const orden = "A1 · H1 · A2 · H2 · A3 · A4 · H3 · H4 · A5 · A6 · H5 · A7 · H6 · H7 · A8".split(" · ");
  assert.deepEqual(orden.map((x) => ids.find((r) => r[0] === x)[1]), ORDEN_T7_3);
  assert.deepEqual(orden.map((x) => ids.find((r) => r[0] === x)[2]), nombres);
});

test("★★★ subjects.js: todo id t7-3 está en el orden final y los presentes van en su orden", () => {
  assert.ok(ENSUBJECTS.length > 0);
  siguenElOrden(ENSUBJECTS, "subjects.js");
});

test("★★★ la vista: todo id de PIEZAS_T7_3 está en el orden final y los presentes van en su orden", () => {
  assert.ok(ENLAVISTA.length > 0);
  siguenElOrden(ENLAVISTA, "PIEZAS_T7_3");
});
