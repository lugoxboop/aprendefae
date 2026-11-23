/*
 * Macro 2026 · T3 Política fiscal: los textos (longitud y fidelidad contra §4
 * de la especificación), los tonos de los tributos, los subtemas y que lo
 * publicado sea exactamente PUBLICADAS_T3.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { CORAL, FONDO, TINTA_SOBRE_COLOR, contraste, luminancia } from "../comun/colores-da.js";
import { TRIBUTOS, ORDEN_TRIBUTOS, MARCAS } from "../comun/tributos.js";
import { APRENDER, CONTEO_APRENDER, SUBTEMAS, A3, A4, A5 } from "../politica-fiscal/textos.js";
import { PIEZAS_T3, PUBLICADAS_T3, estaPublicadaT3 } from "../politica-fiscal/catalogo.js";
import { SUBJECTS } from "../../data/subjects.js";

const palabras = (t) => t.trim().split(/\s+/).filter(Boolean).length;
/*
 * Cuatro pantallas no coinciden con el conteo de §4 (construccion-t3.md,
 * decisión 1): A3 P3 tiene 9 y §4 dice 10; A4 P7, A5 P1 y A5 P4 tienen una
 * más (17, 13, 11). Los textos quedan tal cual los escribió Gen en §2; lo que
 * obliga es el ≤ 20, y todas lo cumplen.
 */
const CONTEO_REAL = { "pf26-a3-cajeros": { 2: 9 }, "pf26-a4-tanque": { 6: 17 }, "pf26-a5-balanza": { 0: 13, 3: 11 } };

test("Aprender T3: cada pantalla ≤ 20 palabras y con el conteo de §4", () => {
  for (const [id, textos] of Object.entries(APRENDER)) {
    assert.equal(textos.length, CONTEO_APRENDER[id].length, id);
    textos.forEach((t, k) => {
      assert.ok(palabras(t) <= 20, `${id} P${k + 1}`);
      assert.equal(palabras(t), CONTEO_REAL[id]?.[k] ?? CONTEO_APRENDER[id][k], `${id} P${k + 1}: «${t}»`);
    });
  }
  assert.deepEqual(Object.keys(APRENDER).sort(), PIEZAS_T3.filter((p) => p.tipo === "aprender").map((p) => p.id).sort());
});

test("tributos: tres tonos fijos, nunca coral, ≥ 3:1 sobre el fondo y ≥ 4,5:1 con la tinta oscura; dos marcas de forma", () => {
  const tonos = ORDEN_TRIBUTOS.map((t) => TRIBUTOS[t].tono.toLowerCase());
  assert.equal(new Set(tonos).size, 3);
  for (const c of tonos) {
    assert.notEqual(c, CORAL.toLowerCase());
    assert.ok(contraste(c, FONDO) >= 3, `${c} sobre el fondo: ${contraste(c, FONDO).toFixed(2)}`);
    assert.ok(contraste(c, TINTA_SOBRE_COLOR) >= 4.5, `${c} con tinta: ${contraste(c, TINTA_SOBRE_COLOR).toFixed(2)}`);
  }
  const L = tonos.map(luminancia).sort((a, b) => a - b);
  for (let k = 1; k < L.length; k += 1) assert.ok(L[k] - L[k - 1] > 0.08, `luminancias ${L.map((x) => x.toFixed(2))}`);
  for (const t of ORDEN_TRIBUTOS) assert.ok(TRIBUTOS[t].nombre, t);
  assert.deepEqual(Object.values(MARCAS).map((m) => m.forma), ["lupa", "codigo"]);
});

test("cifras: la deuda de la d. 42 suma (840 + 354 = 1.194); el billón lleva su aclaración; billeteras 1, 2, 4", () => {
  assert.equal(A4.deuda.interna + A4.deuda.externa, A4.deuda.total);
  assert.deepEqual([A4.deuda.interna, A4.deuda.externa, A4.deuda.total], [840, 354, 1194]);
  assert.equal(A4.billon, "1 billón = un millón de millones");
  assert.deepEqual(A3.billeteras.map((b) => b.cobro), [1, 2, 4]);
  assert.equal(A3.fichas.filter((f) => f.tipo === "directo").length, 4);
  assert.equal(A3.fichas.filter((f) => f.tipo === "indirecto").length, 3);
  for (const i of A5.impactos) assert.ok(palabras(i.texto) <= 12, i.id);
  /* El SOAT no se clasifica (ficha §11.4). */
  assert.ok(!JSON.stringify({ A3, A4, A5 }).includes("SOAT"));
});

test("subtemas: cada pieza de T3 declara subtemas del tema", () => {
  for (const p of PIEZAS_T3) {
    assert.ok(p.subtemas.length > 0, p.id);
    for (const s of p.subtemas) assert.ok(SUBTEMAS[s], `${p.id}: ${s}`);
  }
  assert.equal(PIEZAS_T3.length, 11);
  assert.equal(PIEZAS_T3.filter((p) => p.tipo === "hacer").length, 6);
});

test("publicación T3: subjects.js y supabase/migrations llevan exactamente lo anotado en PUBLICADAS_T3", () => {
  const ids = new Set(PIEZAS_T3.map((p) => p.id));
  for (const id of PUBLICADAS_T3) assert.ok(ids.has(id), id);
  const declaradas = new Set();
  for (const m of Object.values(SUBJECTS)) for (const t of m.topics ?? []) for (const a of t.actividades ?? []) if (ids.has(a.id)) declaradas.add(a.id);
  assert.deepEqual([...declaradas].sort(), [...PUBLICADAS_T3].sort());
  for (const f of readdirSync("supabase/migrations")) {
    const sql = readFileSync(`supabase/migrations/${f}`, "utf8");
    for (const id of ids) {
      if (!sql.includes(id)) continue;
      assert.ok(estaPublicadaT3(id), `${f} registra ${id} sin estar publicada`);
    }
  }
  assert.ok(PIEZAS_T3.filter((p) => p.tipo === "aprender").every((p) => !p.clasificacion), "las Aprender no tienen FP");
});
