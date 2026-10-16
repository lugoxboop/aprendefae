import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · b5-t6-a5 «La cuenta de la provisión» SE FUNDIÓ EN b5-t6-a2
 * (Célula B, lote 6b; hoja de fusiones de Mai).
 *
 * Sus casillas viven ahora en a2 como tres preguntas de cifra escrita. Mateo
 * autorizó retirar y fusionar actividades de Contabilidad mientras no haya
 * estudiantes reales. Esto vigila que no quede a medias:
 *   · fuera del catálogo del cliente y del camino, que queda a1 → a4 → a2 →
 *     a6 → a3 (el orden final de Sakuta);
 *   · fuera de «Así se juega» y del panel docente;
 *   · sin su componente, sus datos ni su prueba;
 *   · su nombre, en src/data/retiradas.js, para el panel docente;
 *   · la 0077, un retiro blando (la puerta del #289) con la marca del
 *     guardián, sin borrar nada, con su comprobación y la reversión escrita
 *     sin correr; y la 0078, que pasa a2 a difícil · 50 con un upsert.
 * La vista y el catálogo del servidor los comparan b5-t6-catalogo.test.mjs y
 * fp/__tests__/catalogo.test.mjs.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ID = "b5-t6-a5";
const RAIZ = new URL("../../../", import.meta.url);
const { SUBJECTS, HACER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { ASI_SE_JUEGA } = await import("../../data/asiSeJuega.js");
const { etiquetaDeItem } = await import("../../docente/etiquetasItem.js");
const { NOMBRE_DE_RETIRADA } = await import("../../data/retiradas.js");
const { PREGUNTAS_T6_ACT2 } = await import("../../data/contabilidadT6Act2.js");
const RETIRO = readFileSync(new URL("supabase/migrations/0077_tema6_funde_cuenta_de_la_provision.sql", RAIZ), "utf8");
const A2 = readFileSync(new URL("supabase/migrations/0078_tema6_provision_de_el_torito_dificil.sql", RAIZ), "utf8");
const sentencias = (sql) => sql.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");

test("★★★ b5-t6-a5 ya no está en ningún catálogo del cliente, y el camino de T6 queda a1 → a4 → a2 → a6 → a3", () => {
  const todas = Object.values(SUBJECTS).flatMap((m) => m.topics ?? []).flatMap((t) => t.actividades ?? []);
  assert.ok(todas.length > 50, "no se leyó el catálogo: la comprobación habría pasado mirando nada");
  assert.ok(!todas.some((a) => a.id === ID), "sigue en subjects.js");
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === "cuentas-por-cobrar");
  assert.deepEqual(actividadesDeTipo(tema, HACER).map((a) => a.id), ["b5-t6-a1", "b5-t6-a4", "b5-t6-a2", "b5-t6-a6", "b5-t6-a3"]);
  /* La Aprender 5 lleva el prefijo de a5 en su id, pero es otra cosa: sigue. */
  assert.ok(todas.some((a) => a.id === "b5-t6-a5-como-se-calcula-la-provision"));
});

test("★★★ ni «Así se juega» ni el panel docente la conocen, su código ya no está, y su nombre queda para el panel", () => {
  assert.ok(ASI_SE_JUEGA["b5-t6-a6"], "no se leyó «Así se juega»");
  assert.equal(ASI_SE_JUEGA[ID], undefined);
  assert.equal(etiquetaDeItem(ID, "c1"), null);
  /* Sus casillas viven en a2, y el panel las lee allí. */
  for (const p of PREGUNTAS_T6_ACT2) assert.ok(etiquetaDeItem("b5-t6-a2", p.id)?.startsWith(p.rotulo), p.id);
  for (const archivo of [
    "src/components/mecanicas/libros/tema6/LaCuentaDeLaProvision.jsx",
    "src/data/contabilidadT6Act5.js",
    "src/contabilidad/__tests__/b5-t6-act5.test.mjs",
  ]) assert.ok(!existsSync(new URL(archivo, RAIZ)), `${archivo} sigue en el repositorio`);
  assert.equal(NOMBRE_DE_RETIRADA[ID], "La cuenta de la provisión");
});

test("★★★ la 0077: retiro blando (#289) con la marca del guardián, sin borrar nada, con su comprobación y la reversión escrita sin correr", () => {
  const s = sentencias(RETIRO);
  assert.match(RETIRO, /^-- GUARDIAN: retiro blando de catalogo$/m, "falta la marca del guardián");
  assert.match(s, /update public\.actividad_catalogo\s+set retirada = true\s+where activity_id in \('b5-t6-a5'\);/);
  assert.doesNotMatch(s, /\b(delete|insert|alter|drop|truncate|grant|revoke)\b/i);
  assert.equal((s.match(/\bupdate\b/gi) ?? []).length, 1);
  assert.match(s, /select activity_id, retirada[\s\S]*actividad_catalogo[\s\S]*'b5-t6-a5'/);
  assert.match(RETIRO, /^--\s+set retirada = false where activity_id in \('b5-t6-a5'\);$/m);
});

test("★★★ la 0078: a2 pasa a difícil · 50 con un upsert, y lo mismo dice subjects.js", () => {
  const s = sentencias(A2);
  assert.match(s, /\('b5-t6-a2',\s*'contabilidad',\s*'cuentas-por-cobrar',\s*'evaluativa',\s*'dificil',\s*50,\s*1\)/);
  assert.match(s, /on conflict \(activity_id\) do update set/);
  assert.equal(s.match(/insert into/gi).length, 1, "un solo insert");
  assert.doesNotMatch(s.replace(/on conflict \(activity_id\) do update set/, ""), /\b(delete|update|alter|drop|truncate|grant|revoke)\b/i);
  const c = clasificacionDe("contabilidad", "cuentas-por-cobrar", "b5-t6-a2");
  assert.deepEqual([c.dificultad, c.fpBase], ["dificil", 50]);
});
