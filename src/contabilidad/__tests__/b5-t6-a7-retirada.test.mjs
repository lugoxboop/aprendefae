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

test("★★★ la 0076: borra primero sus partidas a medias y después su fila, con su comprobación y la reversión escrita sin correr", () => {
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  const partidas = sentencias.search(/delete from public\.partida_en_curso\s+where activity_id in \('b5-t6-a7'\);/);
  const fila = sentencias.search(/delete from public\.actividad_catalogo\s+where activity_id in \('b5-t6-a7'\);/);
  assert.ok(partidas >= 0, "no borra las partidas a medias");
  assert.ok(fila >= 0, "no borra la fila del catálogo (con la forma `in (...)`)");
  assert.ok(partidas < fila, "las partidas, antes que la fila a la que apuntan");
  /* Nada más que esos dos borrados y la comprobación. */
  assert.equal((sentencias.match(/\bdelete\b/gi) ?? []).length, 2);
  assert.doesNotMatch(sentencias, /\b(insert|update|alter|drop|truncate|grant|revoke)\b/i);
  assert.match(sentencias, /select[\s\S]*count\(\*\)[\s\S]*actividad_catalogo[\s\S]*partida_en_curso/);
  /* La reversión, comentada: la misma fila que metió la 0075. */
  assert.match(MIGRACION, /^--\s+\('b5-t6-a7', 'contabilidad', 'cuentas-por-cobrar', 'evaluativa', 'facil', 10, 1\)$/m);
});
