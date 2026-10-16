import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · b5-t6-a7 «¿Qué método y cuándo?» SE RETIRÓ (Célula B, lote 4).
 *
 * Shoko (C6): sus decisiones ya están en b5-t6-a4 y en la capa 3 de T6 · A2.
 * Mateo autorizó retirar actividades de Contabilidad mientras no haya
 * estudiantes reales. Esto vigila que no quede a medias:
 *   · fuera del catálogo del cliente y del camino, que queda a1 → a4 → a5 →
 *     a2 → a6 → a3 (provisional: a5 se fusionará en a2);
 *   · fuera de «Así se juega» y del panel docente;
 *   · sin su componente, sus datos ni su lógica;
 *   · la 0076 borra primero sus partidas a medias (la única llave foránea
 *     hacia el catálogo, la de partida_en_curso) y después su fila, con la
 *     forma `in (...)` que lee catalogo.test.mjs, su comprobación y la
 *     reversión escrita sin correr.
 * La vista y el catálogo del servidor los comparan b5-t6-catalogo.test.mjs y
 * fp/__tests__/catalogo.test.mjs.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ID = "b5-t6-a7";
const RAIZ = new URL("../../../", import.meta.url);
const { SUBJECTS, HACER, actividadesDeTipo } = await import("../../data/subjects.js");
const { ASI_SE_JUEGA } = await import("../../data/asiSeJuega.js");
const { etiquetaDeItem } = await import("../../docente/etiquetasItem.js");
const MIGRACION = readFileSync(new URL("supabase/migrations/0076_tema6_retira_que_metodo.sql", RAIZ), "utf8");

test("★★★ b5-t6-a7 ya no está en ningún catálogo del cliente, y el camino de T6 queda a1 → a4 → a5 → a2 → a6 → a3", () => {
  const todas = Object.values(SUBJECTS).flatMap((m) => m.topics ?? []).flatMap((t) => t.actividades ?? []);
  assert.ok(todas.length > 50, "no se leyó el catálogo: la comprobación habría pasado mirando nada");
  assert.ok(!todas.some((a) => a.id === ID), "sigue en subjects.js");
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === "cuentas-por-cobrar");
  assert.deepEqual(actividadesDeTipo(tema, HACER).map((a) => a.id), ["b5-t6-a1", "b5-t6-a4", "b5-t6-a5", "b5-t6-a2", "b5-t6-a6", "b5-t6-a3"]);
});

test("★★★ ni «Así se juega» ni el panel docente la conocen, y su código ya no está", () => {
  assert.ok(ASI_SE_JUEGA["b5-t6-a6"], "no se leyó «Así se juega»");
  assert.equal(ASI_SE_JUEGA[ID], undefined);
  assert.equal(etiquetaDeItem(ID, "mc-01"), null);
  for (const archivo of [
    "src/components/mecanicas/libros/tema6/QueMetodoYCuando.jsx",
    "src/data/contabilidadT6Act7.js",
    "src/contabilidad/t6Act7.js",
    "src/contabilidad/__tests__/b5-t6-act7.test.mjs",
  ]) assert.ok(!existsSync(new URL(archivo, RAIZ)), `${archivo} sigue en el repositorio`);
});

test("★★★ la 0076: retiro blando (#289) con la marca del guardián, sin borrar nada, con su comprobación y la reversión escrita sin correr", () => {
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.match(MIGRACION, /^-- GUARDIAN: retiro blando de catalogo$/m, "falta la marca del guardián");
  assert.match(sentencias, /update public\.actividad_catalogo\s+set retirada = true\s+where activity_id in \('b5-t6-a7'\);/);
  /* Ni un borrado: fp_history apunta a la fila, que queda como lápida (Erwin, #281). */
  assert.doesNotMatch(sentencias, /\b(delete|insert|alter|drop|truncate|grant|revoke)\b/i);
  assert.equal((sentencias.match(/\bupdate\b/gi) ?? []).length, 1);
  assert.match(sentencias, /select activity_id, retirada[\s\S]*actividad_catalogo[\s\S]*'b5-t6-a7'/);
  /* La reversión, comentada. */
  assert.match(MIGRACION, /^--\s+set retirada = false where activity_id in \('b5-t6-a7'\);$/m);
});
