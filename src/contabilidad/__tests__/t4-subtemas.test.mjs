import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · LOS SUBTEMAS DE LOS HACER (contabilidadT4Subtemas.js), para el Repaso
 * Diario de Contabilidad.
 *
 * La lista de lo que hay que etiquetar NO se copia de ese archivo: se saca
 * de las fuentes reales.
 *   · las actividades: los Hacer del tema en subjects.js, y las t4- que el
 *     catálogo creó en las migraciones 0200-0249 y ya no están en subjects.js
 *     (las retiradas)
 *   · los ítems: los que cada pieza manda a fp_detalle (t.anotar en
 *     src/components/t4/), armados con los bancos igual que la vista
 *   · los retirados con banco: los que el panel docente todavía nombra
 *     (etiquetaDeItem no da null)
 * Falla si un ítem queda sin subtema, si sobra un subtema para un ítem que no
 * existe, o si un nombre sale de fuera del vocabulario de su pieza.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const S = await import("../../data/contabilidadT4Subtemas.js");
const H1 = await import("../../data/contabilidadT4H1.js");
const H3 = await import("../../data/contabilidadT4H3.js");
const H4 = await import("../../data/contabilidadT4H4.js");
const H7 = await import("../../data/contabilidadT4H7.js");
const H8 = await import("../../data/contabilidadT4H8.js");
const { SUBJECTS, HACER, actividadesDeTipo } = await import("../../data/subjects.js");
const { etiquetaDeItem } = await import("../../docente/etiquetasItem.js");
const { NOMBRE_DE_RETIRADA } = await import("../../data/retiradas.js");

const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === "efectivo-caja-menor-bancos");
const HACER_T4 = actividadesDeTipo(TEMA, HACER).map((a) => a.id);

/* Las t4- que el catálogo creó en el carril de la célula (0200-0249). */
const MIGRACIONES = new URL("../../../supabase/migrations/", import.meta.url);
const T4_EN_CATALOGO = new Set(
  readdirSync(MIGRACIONES)
    .filter((f) => /^02[0-4]\d_.*\.sql$/.test(f))
    .flatMap((f) => [...readFileSync(new URL(f, MIGRACIONES), "utf8").matchAll(/\(\s*'(t4-[a-z0-9-]+)'\s*,\s*'contabilidad'/g)].map((m) => m[1])),
);

/* Los ítems que cada pieza vigente anota, como los arma su vista. */
const anotados = {
  [H1.H1_ID]: H1.ITEMS_H1.map((x) => x.id),
  [H3.H3_ID]: H3.SERIES_H3.flatMap((s) => s.ops.map((x) => x.id)),
  [H4.H4_ID]: H4.RONDAS_H4.flatMap((r) => r.preguntas.map((p) => H4.itemH4(r.id, p.id))),
  [H7.H7_ID]: [...H7.SERIES_H7.flatMap((s) => s.partidas.map((p) => p.id)), "saldo-banco", "saldo-libros"],
  [H8.H8_ID]: [...H8.SERIES_H8.flatMap((s) => s.partidas.map((p) => p.id)), ...H8.SERIES_H8.flatMap((s) => s.notas.map((n) => n.idAsiento)), "saldo-mayor"],
};
const VIGENTES = Object.entries(anotados).flatMap(([a, ids]) => ids.map((id) => `${a}:${id}`));

/* Los retirados con banco: los ids viejos de H1 y las rondas de H4 que el panel aún nombra y la pieza ya no juega. */
const preguntasV1 = [H4.ARQUEO, H4.DIFERENCIA, H4.CHEQUE];
const rondasFuera = ["h4-1", "h4-2", "h4-3", "h4-4", "h4-5", "h4-6"].filter((id) => !H4.RONDAS_H4.some((r) => r.id === id));
const RETIRADOS = [
  ...H1.ITEMS_H1_ANTERIORES.map((x) => `${H1.H1_ID}:${x.id}`),
  ...rondasFuera.flatMap((r) => preguntasV1.map((p) => `${H4.H4_ID}:${H4.itemH4(r, p)}`)).filter((c) => etiquetaDeItem(H4.H4_ID, c.split(":").slice(1).join(":")) !== null),
];

const claves = S.ITEMS_T4.map((x) => x.clave);

test("las piezas con subtemas son exactamente los Hacer de T4 en subjects.js", () => {
  assert.deepEqual([...new Set(S.ITEMS_T4.map((x) => x.actividad))].sort(), [...HACER_T4].sort());
  assert.deepEqual(Object.keys(S.VOCABULARIO_T4).sort(), [...HACER_T4].sort());
});

test("las t4- del catálogo que ya no están en subjects.js son las retiradas sin banco, y tienen nombre de lápida", () => {
  const retiradas = [...T4_EN_CATALOGO].filter((id) => !HACER_T4.includes(id)).sort();
  assert.ok(retiradas.length > 0, "la lectura de las migraciones no encontró nada: no midió");
  assert.deepEqual(Object.keys(S.RETIRADAS_SIN_BANCO_T4).sort(), retiradas);
  for (const id of retiradas) assert.ok(NOMBRE_DE_RETIRADA[id], `${id} sin nombre en retiradas.js`);
});

test("cada ítem que una pieza vigente anota tiene subtema, no retirado", () => {
  assert.ok(VIGENTES.length >= 70, `solo ${VIGENTES.length} ítems vigentes: la derivación no midió`);
  for (const c of VIGENTES) {
    const x = S.ITEMS_T4.find((i) => i.clave === c);
    assert.ok(x, `${c} sin subtema`);
    assert.ok(typeof x.subtema === "string" && x.subtema.trim(), `${c} con subtema vacío`);
    assert.equal(x.retirado, false, `${c} está vigente y sale como retirado`);
  }
});

test("cada retirado que el panel aún nombra tiene subtema y va marcado", () => {
  assert.equal(RETIRADOS.length, 8 + 6, "8 hechos viejos de H1 y 2 rondas × 3 preguntas de H4");
  for (const c of RETIRADOS) {
    const x = S.ITEMS_T4.find((i) => i.clave === c);
    assert.ok(x, `${c} sin subtema`);
    assert.ok(x.subtema.trim(), `${c} con subtema vacío`);
    assert.equal(x.retirado, true, `${c} es retirado y no va marcado`);
  }
});

test("no sobra ningún subtema: cada clave es un ítem que existe, y ninguna se repite", () => {
  const esperadas = new Set([...VIGENTES, ...RETIRADOS]);
  for (const c of claves) assert.ok(esperadas.has(c), `${c} no es un ítem de T4`);
  assert.equal(new Set(claves).size, claves.length, "clave repetida");
  assert.equal(claves.length, esperadas.size);
});

test("cada ítem existe en el banco que lee el panel docente (etiquetaDeItem no da null)", () => {
  for (const x of S.ITEMS_T4) assert.ok(etiquetaDeItem(x.actividad, x.itemId), `${x.clave} sin etiqueta en el panel`);
});

test("los vigentes usan el vocabulario de su pieza; forma [fijo] o [regla]", () => {
  for (const x of S.ITEMS_T4) {
    assert.ok(["fijo", "regla"].includes(x.forma), `${x.clave}: forma ${x.forma}`);
    if (!x.retirado) assert.ok(S.VOCABULARIO_T4[x.actividad].includes(x.subtema), `${x.clave}: «${x.subtema}» no está en el vocabulario`);
  }
  /* Ningún nombre del vocabulario queda sin ítem: un subtema que nadie usa es un nombre muerto. */
  for (const [a, vocab] of Object.entries(S.VOCABULARIO_T4)) {
    for (const n of vocab) assert.ok(S.ITEMS_T4.some((x) => x.actividad === a && !x.retirado && x.subtema === n), `${a}: «${n}» sin ítems`);
  }
});

test("subtemaDeItemT4 responde por la clave y lanza si no hay", () => {
  assert.equal(S.subtemaDeItemT4(H8.H8_ID, "saldo-mayor"), "Saldo del mayor");
  assert.equal(S.subtemaDeItemT4(H1.H1_ID, "h1-t4"), "Caja o Bancos");
  assert.throws(() => S.subtemaDeItemT4(H1.H1_ID, "h1-t9"), /Sin subtema/);
  assert.equal(S.itemsVigentesT4().length, VIGENTES.length);
});
