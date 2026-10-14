import { test } from "node:test";
import assert from "node:assert/strict";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · EL ORDEN FINAL (decisión de L, 14 de octubre de 2026).
 *
 * La fuente es la sección «Orden final de T7-1» del mapa
 * (orquestador/conocimiento/mapas/t7-inventarios.md): 14 piezas, en su
 * orden, por dependencias (regla 9). Esta prueba no fija cuáles están
 * publicadas —eso cambia con cada PR—, sino dos cosas, en subjects.js y en
 * PIEZAS_T7_1 de la vista:
 *
 *   · todo id t7-1 está en la lista
 *   · los presentes siguen el orden relativo de la lista
 *
 * Si entra una pieza que no está aquí, primero se agrega al mapa y a la lista.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ORDEN_T7_1 = [
  "t7-1-a1-la-cuenta-que-no-se-mueve",
  "t7-1-a2-la-factura-completa",
  "t7-1-que-cuenta-se-mueve",
  "t7-1-arma-la-factura",
  "t7-1-a3-tres-formas",
  "t7-1-cuanto-vale-lo-que-sobro",
  "t7-1-a4-el-cierre-en-periodico",
  "t7-1-cierra-el-mes",
  "t7-1-a5-importados-y-fletes",
  "t7-1-costo-o-gasto",
  "t7-1-a6-devoluciones-en-periodico",
  "t7-1-devolucion-dos-libros",
  "t7-1-a7-control-interno",
  "t7-1-que-control-falta",
];

const { SUBJECTS } = await import("../../data/subjects.js");
const { PIEZAS_T7_1, TEMA_T7_1 } = await import("../../components/ContabilidadT7_1View.jsx");

const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_1);
const ENSUBJECTS = TEMA.actividades.map((a) => a.id);
const ENLAVISTA = PIEZAS_T7_1.map((p) => p.pieza.id);

function siguenElOrden(ids, donde) {
  const fuera = ids.filter((id) => id.startsWith("t7-1-") && !ORDEN_T7_1.includes(id));
  assert.deepEqual(fuera, [], `${donde}: estos ids no están en el orden final del mapa`);
  const posiciones = ids.map((id) => ORDEN_T7_1.indexOf(id));
  const esperado = [...ids].sort((a, b) => ORDEN_T7_1.indexOf(a) - ORDEN_T7_1.indexOf(b));
  assert.deepEqual(ids, esperado, `${donde}: no siguen el orden final del mapa (posiciones ${posiciones.join(", ")})`);
}

test("★★★ la lista tiene las 14 piezas del mapa, sin repetir", () => {
  assert.equal(ORDEN_T7_1.length, 14);
  assert.equal(new Set(ORDEN_T7_1).size, 14);
});

test("★★★ subjects.js: todo id t7-1 está en el orden final y los presentes van en su orden", () => {
  assert.ok(ENSUBJECTS.length > 0);
  siguenElOrden(ENSUBJECTS, "subjects.js");
});

test("★★★ la vista: todo id de PIEZAS_T7_1 está en el orden final y los presentes van en su orden", () => {
  assert.ok(ENLAVISTA.length > 0);
  siguenElOrden(ENLAVISTA, "PIEZAS_T7_1");
});
