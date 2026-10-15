import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LETRA MÍNIMA DE 12 PX EN LO DE LA CÉLULA C (lote 4 de la revisión).
 *
 * La medición a 320 y 375 (orquestador/conocimiento/revisiones/
 * c7-medicion-320-375.md) encontró texto de la célula a 11 y 11,5 px: el
 * encabezado de ítem de TarjetaPregunta («COMPRA», «HECHO 1», «CASO 1»), los
 * rótulos de figuras y tablas de T7 («MÉTODO PEPS», «CIFRAS») y el pie de
 * T7-1 · A1. Esta prueba lee los componentes de la célula —mecanicas/libros/
 * t7/, mecanicas/libros/t5/ y las vistas de T7 y T5— y falla si alguno
 * declara un tamaño de letra por debajo de 12 px, en estilo en línea
 * (fontSize: "11px") o en CSS (font-size: 11px, font: 600 11px …).
 *
 * Lo compartido no es de la célula y no entra aquí: AsientoEnLineas,
 * Pulsos y el cierre se le pasan a Erwin.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const RAIZ = new URL("../../../", import.meta.url);
const enCarpeta = (dir) => readdirSync(new URL(dir, RAIZ)).filter((f) => f.endsWith(".jsx")).map((f) => dir + f);
const ARCHIVOS = [
  ...enCarpeta("src/components/mecanicas/libros/t7/"),
  ...enCarpeta("src/components/mecanicas/libros/t5/"),
  "src/components/ContabilidadT7_1View.jsx",
  "src/components/ContabilidadT7_2View.jsx",
  "src/components/ContabilidadT7_3View.jsx",
  "src/components/ContabilidadTema5View.jsx",
];

/* Cada tamaño de letra declarado: fontSize: "11px" · fontSize: 11 · font-size: 11px · font: 600 11px/1.3 … */
const PATRONES = [
  /fontSize:\s*"(\d+(?:\.\d+)?)px"/g,
  /fontSize:\s*(\d+(?:\.\d+)?)\b(?!\s*[%a-z"])/g,
  /font-size:\s*(\d+(?:\.\d+)?)px/g,
  /\bfont:\s*(?:italic\s+)?(?:\d{3}\s+)?(\d+(?:\.\d+)?)px/g,
];

function tamanos(fuente) {
  const out = [];
  fuente.split("\n").forEach((linea, k) => {
    for (const re of PATRONES) for (const m of linea.matchAll(re)) out.push({ px: Number(m[1]), linea: k + 1, texto: linea.trim().slice(0, 90) });
  });
  return out;
}

test("★★★ la prueba lee los componentes de la célula y encuentra sus tamaños de letra", () => {
  assert.ok(ARCHIVOS.length >= 30, `solo ${ARCHIVOS.length} archivos`);
  const todos = ARCHIVOS.flatMap((f) => tamanos(readFileSync(new URL(f, RAIZ), "utf8")));
  assert.ok(todos.length > 100, `solo ${todos.length} tamaños`);
  assert.ok(todos.some((t) => t.px === 15), "no leyó ningún 15 px");
  /* Los patrones cazan las cuatro formas. */
  assert.deepEqual(tamanos('fontSize: "11px" · fontSize: 10 · font-size: 9px · font: 600 11.5px/1.3 X').map((t) => t.px), [11, 10, 9, 11.5]);
});

test("★★★ ningún texto de la célula baja de 12 px", () => {
  const chicos = ARCHIVOS.flatMap((f) => tamanos(readFileSync(new URL(f, RAIZ), "utf8")).filter((t) => t.px < 12).map((t) => `${f}:${t.linea} · ${t.px}px · ${t.texto}`));
  assert.deepEqual(chicos, []);
});
