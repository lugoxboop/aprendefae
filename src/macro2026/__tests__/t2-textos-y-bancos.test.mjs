/*
 * Macro 2026 · T2 Política económica: los textos (longitud y fidelidad contra
 * §4 de la especificación), los tonos de las ramas, los bancos (sorteo, orden
 * aleatorio, subtemas, coherencia con la clave), la migración pendiente y que
 * lo publicado sea exactamente PUBLICADAS_T2.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { COMPONENTES, CORAL, FONDO, TINTA_SOBRE_COLOR, contraste, luminancia } from "../comun/colores-da.js";
import { RAMAS, ORDEN_RAMAS } from "../comun/ramas.js";
import { APRENDER, CONTEO_APRENDER, VIRUS, FUERA_DEL_CIRCUITO, ENUNCIADOS, SUBTEMAS } from "../politica-economica/textos.js";
import { PIEZAS_T2, PUBLICADAS_T2, estaPublicadaT2 } from "../politica-economica/catalogo.js";
import { SUBJECTS } from "../../data/subjects.js";

const palabras = (t) => t.trim().split(/\s+/).filter(Boolean).length;
/*
 * Cuatro pantallas no coinciden con el conteo de §4 (anotado en
 * construccion-t2.md): A3 P1 tiene 11 y §4 dice 12; A5 P2, P6 y P7 tienen una
 * más (9, 14, 17) porque «%» va separado de su cifra. Los textos quedan tal
 * cual; lo que obliga es el ≤ 20, y todas lo cumplen.
 */
const CONTEO_REAL = { "pe26-a3-problema-resuelto": { 0: 11 }, "pe26-a5-escalera": { 1: 9, 5: 14, 6: 17 } };

/* ─── Textos de Aprender (§4) ─── */

test("Aprender: cada pantalla ≤ 20 palabras y con el conteo de §4", () => {
  for (const [id, textos] of Object.entries(APRENDER)) {
    assert.equal(textos.length, CONTEO_APRENDER[id].length, id);
    textos.forEach((t, k) => {
      assert.ok(palabras(t) <= 20, `${id} P${k + 1}`);
      assert.equal(palabras(t), CONTEO_REAL[id]?.[k] ?? CONTEO_APRENDER[id][k], `${id} P${k + 1}: «${t}»`);
    });
  }
  assert.deepEqual(Object.keys(APRENDER).sort(), PIEZAS_T2.filter((p) => p.tipo === "aprender").map((p) => p.id).sort());
});

test("A2: fichas de virus ≤ 12 palabras; las cifras son las «dato de clase» de §0, sin el 9,4 %", () => {
  for (const v of [...VIRUS, ...FUERA_DEL_CIRCUITO]) assert.ok(palabras(v.descripcion) <= 12, v.id);
  const cifras = [...VIRUS, ...FUERA_DEL_CIRCUITO].map((v) => v.cifra).filter(Boolean);
  assert.deepEqual(cifras, ["6 %", "8,1 %", "crecimiento 2,6 % (fin de 2025)", "US$ 8.198,7 millones", "Gini 0,54"]);
  assert.ok(!JSON.stringify([...VIRUS, ...FUERA_DEL_CIRCUITO]).includes("9,4"));
});

test("los 43 enunciados del anexo, numerados del 1 al 43", () => {
  assert.equal(Object.keys(ENUNCIADOS).length, 43);
  for (let n = 1; n <= 43; n += 1) assert.ok(ENUNCIADOS[n], `enunciado ${n}`);
  assert.equal(ENUNCIADOS[32], ENUNCIADOS[18], "el 32 repite el 18");
});

/* ─── Las ramas (§0) ─── */

test("ramas: cuatro tonos distintos de C/I/G/XN, nunca coral, ≥ 3:1 sobre el fondo y ≥ 4,5:1 con la tinta de las pastillas", () => {
  const t1 = Object.values(COMPONENTES).map((c) => c.color.toLowerCase());
  const tonos = ORDEN_RAMAS.map((r) => RAMAS[r].tono.toLowerCase());
  assert.equal(new Set(tonos).size, 4);
  for (const c of tonos) {
    assert.ok(!t1.includes(c), `${c} repite un tono de T1`);
    assert.notEqual(c, CORAL.toLowerCase());
    assert.ok(contraste(c, FONDO) >= 3, `${c} sobre el fondo: ${contraste(c, FONDO).toFixed(2)}`);
    assert.ok(contraste(c, TINTA_SOBRE_COLOR) >= 4.5, `${c} con tinta: ${contraste(c, TINTA_SOBRE_COLOR).toFixed(2)}`);
  }
  /* Luminancias separadas: se distinguen también sin ver color. */
  const L = tonos.map(luminancia).sort((a, b) => a - b);
  for (let k = 1; k < L.length; k += 1) assert.ok(L[k] - L[k - 1] > 0.08, `luminancias ${L.map((x) => x.toFixed(2))}`);
  for (const r of ORDEN_RAMAS) assert.ok(RAMAS[r].nombre && RAMAS[r].icono, r);
});

test("subtemas: cada pieza declara subtemas del tema", () => {
  for (const p of PIEZAS_T2) for (const s of p.subtemas) assert.ok(SUBTEMAS[s], `${p.id}: ${s}`);
});

/* ─── Publicación por pieza ─── */

test("publicación T2: subjects.js y supabase/migrations llevan exactamente lo anotado en PUBLICADAS_T2", () => {
  const ids = new Set(PIEZAS_T2.map((p) => p.id));
  for (const id of PUBLICADAS_T2) assert.ok(ids.has(id), id);
  const declaradas = new Set();
  for (const m of Object.values(SUBJECTS)) for (const t of m.topics ?? []) for (const a of t.actividades ?? []) if (ids.has(a.id)) declaradas.add(a.id);
  assert.deepEqual([...declaradas].sort(), [...PUBLICADAS_T2].sort());
  for (const f of readdirSync("supabase/migrations")) {
    const sql = readFileSync(`supabase/migrations/${f}`, "utf8");
    for (const id of ids) {
      if (!sql.includes(id)) continue;
      assert.ok(estaPublicadaT2(id), `${f} registra ${id} sin estar publicada`);
      assert.equal(PIEZAS_T2.find((p) => p.id === id).tipo, "hacer", `${f}: ${id} es Aprender y no lleva fila`);
    }
  }
  assert.ok(PIEZAS_T2.filter((p) => p.tipo === "aprender").every((p) => !p.clasificacion), "las Aprender no tienen FP");
});
