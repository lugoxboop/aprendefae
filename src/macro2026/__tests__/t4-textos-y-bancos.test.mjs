/*
 * Macro 2026 · T4 Política monetaria: los textos (longitud y conteo contra
 * §4 de la especificación), las cifras, el modelo del mercado de dinero, los
 * bancos, los subtemas y que lo publicado sea exactamente PUBLICADAS_T4.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import * as T from "../politica-monetaria/textos.js";
import { PIEZAS_T4, PUBLICADAS_T4, HACER_T4, estaPublicadaT4 } from "../politica-monetaria/catalogo.js";
import { SUBJECTS } from "../../data/subjects.js";

const palabras = (t) => t.trim().split(/\s+/).filter(Boolean).length;
/*
 * Varias pantallas no coinciden con el conteo de §4 (construccion-t4.md,
 * decisión 1): difieren en una o dos palabras. Los textos quedan tal cual
 * los escribió Gen en §2; lo que obliga es el ≤ 20, y todas lo cumplen. Aquí
 * va el conteo real, por espacios. Rediseño lote 3: la primera frase de P1
 * de A3 y de A7 pasó a la franja de escena (P1 de A3: 7; P1 de A7: 8).
 */
const CONTEO_REAL = {
  "pm26-a1-billetera": { 0: 15, 4: 17 },
  "pm26-a2-ventanilla": { 0: 10, 3: 16, 4: 16 },
  "pm26-a3-cascada": { 0: 7, 3: 11 },
  "pm26-a4-cajas": { 2: 14, 3: 9, 4: 13, 5: 10 },
  "pm26-a5-precio-dinero": { 2: 13, 4: 10, 5: 15 },
  "pm26-a6-palancas": { 3: 14, 4: 10 },
  "pm26-a7-termostato": { 0: 8, 1: 12, 3: 12 },
};

test("Aprender T4: cada pantalla ≤ 20 palabras, con el número de pantallas de §4 y su conteo real", () => {
  for (const [id, textos] of Object.entries(T.APRENDER)) {
    assert.equal(textos.length, T.CONTEO_APRENDER[id].length, id);
    textos.forEach((t, k) => {
      assert.ok(palabras(t) <= 20, `${id} P${k + 1}`);
      assert.equal(palabras(t), CONTEO_REAL[id]?.[k] ?? T.CONTEO_APRENDER[id][k], `${id} P${k + 1}: «${t}»`);
      /* Ninguna diferencia con §4 pasa de dos palabras. */
      assert.ok(Math.abs(palabras(t) - T.CONTEO_APRENDER[id][k]) <= 2, `${id} P${k + 1}`);
    });
  }
  assert.deepEqual(Object.keys(T.APRENDER).sort(), PIEZAS_T4.filter((p) => p.tipo === "aprender").map((p) => p.id).sort());
});

test("consignas de las 6 Hacer ≤ 12 palabras; el aviso de H5 dice que son casos de práctica", () => {
  assert.deepEqual(Object.keys(T.CONSIGNAS).sort(), HACER_T4.map((p) => p.id).sort());
  for (const [id, c] of Object.entries(T.CONSIGNAS)) assert.ok(palabras(c) <= 12, `${id}: ${palabras(c)}`);
  assert.equal(T.H5.aviso, "Casos de práctica, no decisiones reales de la Junta.");
});

test("cifras: los agregados de la d. 41 crecen BM < M1 < M2 < M3; la cascada da 1/r", () => {
  const { bm, m1, m2, m3 } = T.A4.cifras;
  assert.deepEqual([bm, m1, m2, m3], [193755, 231697, 980377, 1031096]);
  assert.ok(bm < m1 && m1 < m2 && m2 < m3);
  assert.equal(T.totalCascada(10), 10000);
  assert.equal(T.totalCascada(20), 5000);
  for (const e of T.ETAPAS_H2) {
    assert.equal(T.totalCascada(e.solucion), e.meta, e.id);
    assert.ok(e.solucion >= T.H2.min && e.solucion <= T.H2.max && e.solucion % T.H2.paso === 0, e.id);
    assert.notEqual(e.solucion, T.H2.inicial, `${e.id}: no empieza resuelta`);
  }
});

test("mercado de dinero: con los rangos de Gen la tasa de equilibrio queda entre 1 % y 10 %", () => {
  const D = T.MODELO_DINERO;
  for (const Y of [D.Ymin, D.Y, D.Ymax]) {
    for (const M of [D.Mmin, D.M, D.Mmax]) {
      const i = T.tasaEquilibrio({ ...D, Y, M });
      assert.ok(i >= 1 && i <= 10, `Y ${Y}, M ${M}: ${i}`);
    }
  }
  assert.equal(T.tasaEquilibrio(D), 5);
});

test("bancos: tamaños, retro por cada respuesta posible y dominós sin repetir orden", () => {
  assert.equal(T.BANCO_H1.length, 9);
  for (const op of T.BANCO_H1) for (const m of T.MEDIDORES_H1) {
    assert.ok(T.ORDEN_FLECHAS.includes(op.correctas[m.id]), `${op.id}/${m.id}`);
    assert.ok(op.retro[m.id], `${op.id}/${m.id}: retro`);
  }
  assert.equal(T.BANCO_H3.length, 9);
  for (const f of T.BANCO_H3) {
    for (const c of T.CAJAS_H3) if (c.id !== f.correcta) assert.ok(f.retro[c.id], `${f.id} → ${c.id}: retro`);
  }
  assert.equal(T.BANCO_H4.length, 7);
  assert.equal(T.BANCO_H6.length, 3);
  for (const c of T.BANCO_H6) {
    assert.deepEqual(c.fichas.map((f) => f.orden), c.fichas.map((_, k) => k));
    for (const f of c.fichas) assert.ok(f.retro && palabras(f.retro) <= 12, f.id);
  }
  assert.equal(T.RONDAS_H5.length, 3);
  for (const r of T.RONDAS_H5) for (const p of T.PALANCAS) assert.ok(T.ORDEN_POSICIONES.includes(r.correctas[p.id]) && r.retro[p.id], `${r.id}/${p.id}`);
});

test("A7: la serie 2016–2026 pasa por los puntos de Gen y redondea a medio punto", () => {
  assert.deepEqual(T.SERIE_A7.map((d) => d.anio), [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]);
  for (const [campo, pts] of Object.entries(T.PUNTOS_A7)) {
    for (const [a, v] of Object.entries(pts)) assert.equal(T.SERIE_A7.find((d) => d.anio === Number(a))[campo], v, `${campo} ${a}`);
  }
  assert.equal(T.SERIE_A7[0].tasa, null);
  for (const d of T.SERIE_A7) if (d.inflacion != null) assert.ok(Number.isInteger(d.inflacion * 4), `${d.anio}`);
});

test("subtemas: cada pieza de T4 declara subtemas del tema; 13 piezas, 6 Hacer", () => {
  for (const p of PIEZAS_T4) {
    assert.ok(p.subtemas.length > 0, p.id);
    for (const s of p.subtemas) assert.ok(T.SUBTEMAS[s], `${p.id}: ${s}`);
  }
  assert.equal(PIEZAS_T4.length, 13);
  assert.equal(HACER_T4.length, 6);
  assert.ok(PIEZAS_T4.every((p) => p.id.startsWith("pm26-")));
});

test("publicación T4: subjects.js y supabase/migrations llevan exactamente lo anotado en PUBLICADAS_T4", () => {
  const ids = new Set(PIEZAS_T4.map((p) => p.id));
  for (const id of PUBLICADAS_T4) assert.ok(ids.has(id), id);
  const declaradas = [];
  for (const m of Object.values(SUBJECTS)) for (const t of m.topics ?? []) for (const a of t.actividades ?? []) if (ids.has(a.id)) declaradas.push(a.id);
  assert.deepEqual([...declaradas].sort(), [...PUBLICADAS_T4].sort());
  assert.deepEqual(declaradas, [...PIEZAS_T4.filter((p) => p.tipo === "aprender"), ...HACER_T4].map((p) => p.id), "7 Aprender y luego 6 Hacer");
  for (const f of readdirSync("supabase/migrations")) {
    const sql = readFileSync(`supabase/migrations/${f}`, "utf8");
    for (const id of ids) {
      if (!sql.includes(id)) continue;
      assert.ok(estaPublicadaT4(id), `${f} registra ${id} sin estar publicada`);
    }
  }
  assert.ok(PIEZAS_T4.filter((p) => p.tipo === "aprender").every((p) => !p.clasificacion), "las Aprender no tienen FP");
});
