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

test("★★★ ninguna actividad de Macro vuelve al catálogo ni a las rutas", async () => {
  const { SUBJECTS, ACTIVIDADES_TRANSVERSALES, nombreDeActividad } = await import("../subjects.js");
  const { VISTAS } = await import("../../ruta.js");
  assert.deepEqual(SUBJECTS.macroeconomia.topics, [], "Macro volvió a tener temas: esta prueba hay que revisarla con el Macro nuevo");
  assert.equal(ACTIVIDADES_TRANSVERSALES.some((a) => a.materiaId === "macroeconomia"), false);
  for (const id of ["sala-monitores", "el-rezago", "diagnostico-en-vivo", "repaso-diario", "comite-nova"]) {
    assert.equal(nombreDeActividad(id), null, `${id} volvió al catálogo`);
  }
  for (const v of ["politica-economica", "politica-fiscal", "politica-monetaria", "camino-da", "grifos-da", "repaso-diario"]) {
    assert.equal(VISTAS.has(v), false, `la ruta ${v} volvió`);
  }
});
