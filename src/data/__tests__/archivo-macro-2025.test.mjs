import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL ARCHIVO DE MACROECONOMÍA 2025 SOLO LO LEE EL PANEL DOCENTE.
 *
 * Macroeconomía se retiró el 22-nov-2026 (0258) para rehacerla desde cero.
 * Sus bancos se guardaron en src/data/retiradas/macro-2025/ por una sola
 * razón: fp_detalle conserva las respuestas de estudiantes reales a esas
 * preguntas, y las reglas de etiquetasItem.js las necesitan para nombrarlas.
 *
 * Lo que esta prueba impide es que el archivo vuelva a ser contenido: que una
 * vista, una mecánica o el catálogo lo importen, o que una de sus actividades
 * reaparezca en un camino o en una ruta.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SRC = fileURLToPath(new URL("../../", import.meta.url));
const ARCHIVO = join(SRC, "data", "retiradas", "macro-2025");
const UNICO_LECTOR = join(SRC, "docente", "etiquetasItem.js");

const archivosDe = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? (f === "node_modules" ? [] : archivosDe(p)) : [p];
});

test("★★★ fuera de las pruebas, solo etiquetasItem.js importa el archivo", () => {
  const lectores = archivosDe(SRC)
    .filter((p) => /\.(m?js|jsx)$/.test(p))
    .filter((p) => !p.startsWith(ARCHIVO + sep) && !p.split(sep).includes("__tests__"))
    .filter((p) => /retiradas\/macro-2025\//.test(readFileSync(p, "utf8")))
    .map((p) => relative(SRC, p));
  assert.deepEqual(lectores, [relative(SRC, UNICO_LECTOR)]);
});

test("★★★ el archivo solo se importa a sí mismo: nada de vistas, mecánicas ni catálogo", () => {
  for (const p of archivosDe(ARCHIVO)) {
    const imports = [...readFileSync(p, "utf8").matchAll(/from\s+"([^"]+)"/g)].map((m) => m[1]);
    for (const i of imports) assert.match(i, /^\.\/[^/]+\.js$/, `${relative(SRC, p)} importa ${i}`);
  }
});

/*
 * Las 71 retiradas, leídas de la tabla del respaldo (las 59 con fila y las 12
 * Aprender sin fila). Es la lista que ningún catálogo ni ruta puede volver a
 * ofrecer: el Macro nuevo entra con ids nuevos.
 */
const VIEJAS = [...readFileSync(join(SRC, "..", "orquestador", "conocimiento", "macro-2026", "respaldo-retiro.md"), "utf8")
  .matchAll(/^\| `([a-z0-9-]+)` \|/gm)].map((m) => m[1]);

test("★★★ ningún id viejo de Macro vuelve al catálogo ni a las rutas", async () => {
  const { SUBJECTS, ACTIVIDADES_TRANSVERSALES, nombreDeActividad } = await import("../subjects.js");
  const { VISTAS } = await import("../../ruta.js");
  assert.equal(VIEJAS.length, 71, "la tabla del respaldo tiene las 71");
  const enCatalogo = new Set([
    ...Object.values(SUBJECTS).flatMap((m) => m.topics.flatMap((t) => (t.actividades ?? []).map((a) => a.id))),
    ...ACTIVIDADES_TRANSVERSALES.map((a) => a.id),
  ]);
  for (const id of VIEJAS) {
    assert.ok(!enCatalogo.has(id), `${id} volvió al catálogo`);
    assert.equal(nombreDeActividad(id), null, `${id} volvió al catálogo`);
    assert.equal(VISTAS.has(id), false, `la ruta ${id} volvió`);
  }
  /*
   * «politica-economica» vuelve en el lote 2 como la vista NUEVA de T2
   * (TemaMacro2026): mismo tema, solo actividades pe26-*. Las demás rutas
   * viejas siguen fuera.
   */
  for (const v of ["politica-fiscal", "politica-monetaria", "camino-da", "grifos-da", "repaso-diario"]) {
    assert.equal(VISTAS.has(v), false, `la ruta ${v} volvió`);
  }
});

test("★★★ en el índice de Macro: T1 con sus Aprender y Hacer publicadas, y T2 con sus Aprender", async () => {
  const { SUBJECTS, HACER, APRENDER, actividadesDeTipo } = await import("../subjects.js");
  const { PIEZAS_T1, PUBLICADAS_T1 } = await import("../../macro2026/demanda-agregada/catalogo.js");
  const { PUBLICADAS_T2 } = await import("../../macro2026/politica-economica/catalogo.js");
  const temas = SUBJECTS.macroeconomia.topics;
  assert.deepEqual(temas.map((t) => t.id), ["demanda-agregada", "politica-economica"], "los otros temas viejos no aparecen");
  const [da, pe] = temas;
  const tipo = (id) => PIEZAS_T1.find((p) => p.id === id).tipo;
  assert.deepEqual(actividadesDeTipo(da, APRENDER).map((a) => a.id), PUBLICADAS_T1.filter((id) => tipo(id) === APRENDER));
  assert.deepEqual(actividadesDeTipo(da, HACER).map((a) => a.id), PUBLICADAS_T1.filter((id) => tipo(id) === HACER));
  assert.equal(actividadesDeTipo(da, HACER).length, 6, "las seis Hacer de T1");
  assert.deepEqual(actividadesDeTipo(pe, APRENDER).map((a) => a.id), [...PUBLICADAS_T2]);
  assert.deepEqual(actividadesDeTipo(pe, HACER), [], "las Hacer de T2 siguen sin publicar");
  for (const a of [...da.actividades, ...pe.actividades]) assert.match(a.id, /^(da26|pe26)-/, `${a.id}: id nuevo`);
});
