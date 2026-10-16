import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOTE DE DIALECTO C · TODOS LOS HACER DE T5 Y T7 EN EL ESTÁNDAR ÚNICO
 * (prompt maestro de diseño §4 y §5; modelo: T4 «¿Entra o sale de Caja?»).
 * Watari, 16-oct-2026. Va en src/contabilidad/__tests__/dialecto-c.test.mjs.
 *
 * Una sola regla para toda la célula, comprobada en el CÓDIGO, no pieza por
 * pieza. Lee los .jsx de mecanicas/libros/t7 y t5 (sin comentarios) y pide:
 *
 *   D1  literales: ningún texto con «Correcta», «Bien», «Revisa», «Va:»,
 *       «era esta», «Era:» ni «La respuesta es». Los únicos son «Correcto»,
 *       «No va aquí» e «Iba aquí» (o «Iba aquí: {valor}»), de b5/Devolucion.jsx.
 *   D2  nadie importa `Opcion` de corazon/juego.jsx (pinta el acierto en teal):
 *       las opciones usan `OpcionC` de t7/hacerT7.jsx.
 *   D3  teal y ámbar solo en su rol de lado: cada línea con FAE.teal,
 *       FAE.ambar, #2A9D8F, #3FA69A o #E9C46A lleva la marca  /* lado *\/ .
 *   D4  sin emoji de veredicto (✅ ❌ ✔ ✘ ✗) en los Hacer.
 *   D5  la pastilla y el contorno vienen de b5/Devolucion.jsx sin cambios, y
 *       sus valores son los del §4 (si la Célula B los cambia, esto avisa).
 *   D6  todo pulgar de deslizador (::-webkit-slider-thumb y ::-moz-range-thumb)
 *       mide 44 × 44 px o más.
 *   D7  ninguna caja en café: #8A6F4E no aparece.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const RAIZ = "src/components/mecanicas/libros";
const CARPETAS = ["t7", "t5"];
const sinComentarios = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
const archivos = CARPETAS.flatMap((c) => readdirSync(`${RAIZ}/${c}`).filter((f) => f.endsWith(".jsx")).map((f) => `${RAIZ}/${c}/${f}`));
const fuente = Object.fromEntries(archivos.map((f) => [f, readFileSync(f, "utf8")]));
const limpio = Object.fromEntries(archivos.map((f) => [f, sinComentarios(fuente[f])]));
// Las piezas de Aprender de la célula quedan fuera de D1 y D4 (en Aprender, ✓ y «Correcto.» son de B4 y de enganche.md).
const APRENDER = /PantallasT7_[123]|LaCuentaQueNoSeMueve|LaCuentaQueSiSeMueve|LasCapasQueLaVentaCorta|ElViajeDeUnaCaja|TresFormas|ImportadosYFletes|ElCierreEnPeriodico|DevolucionesEnPeriodico|LaFacturaCompleta|LaVentaEnDosAsientos|FiguraDosColumnas|PatronT7_3/;
const hacer = archivos.filter((f) => !APRENDER.test(f));

const hallazgos = (lista, prueba) => lista.flatMap((f) => limpio[f].split("\n").map((l, i) => [f, i + 1, l]).filter(([, , l]) => prueba(l)).map(([f, n, l]) => `${f.replace(RAIZ + "/", "")}:${n}  ${l.trim().slice(0, 90)}`));

test("D1 · solo los literales del estándar", () => {
  const prohibido = /["'`][^"'`]*(\bCorrecta\b|\bBien\b|\bRevisa\b|\bVa: |era esta|\bEra: |La respuesta es)[^"'`]*["'`]/;
  // También el texto suelto de JSX (sin comillas): «>era $…».
  assert.deepEqual(hallazgos(hacer, (l) => prohibido.test(l) || />\s*[Ee]ra\b/.test(l)), []);
  const textos = sinComentarios(readFileSync("src/contabilidad/armaLaLinea.js", "utf8"));
  assert.doesNotMatch(textos, /`Era: |La respuesta es/, "TEXTOS_ARMA todavía dice «Era:» o «La respuesta es»: en Hacer sin reintento va «Iba aquí» sobre la pieza");
});

test("D2 · nadie usa la Opcion compartida (acierto en teal)", () => {
  assert.deepEqual(hallazgos(archivos, (l) => /import\s*{[^}]*\bOpcion\b[^}]*}\s*from\s*["'][^"']*corazon\/juego\.jsx["']/.test(l)), []);
});

test("D3 · teal y ámbar solo como lado, con su marca", () => {
  const color = /FAE\.teal|FAE\.ambar|#2A9D8F|#3FA69A|#E9C46A/i;
  // Se mira el código sin comentarios, pero la marca se busca en la línea original: /* lado */ al final.
  const malos = archivos.flatMap((f) => fuente[f].split("\n").map((l, i) => [l, sinComentarios(l), i + 1])
    .filter(([l, c]) => color.test(c) && !/\/\* lado \*\//.test(l))
    .map(([l, , n]) => `${f.replace(RAIZ + "/", "")}:${n}  ${l.trim().slice(0, 90)}`));
  assert.deepEqual(malos, []);
});

test("D4 · sin emoji de veredicto en los Hacer", () => {
  assert.deepEqual(hallazgos(hacer, (l) => /[✅❌✔✘✗]/u.test(l)), []);
});

test("D5 · pastilla y contorno de b5/Devolucion.jsx, con los valores del §4", () => {
  const d = readFileSync(`${RAIZ}/b5/Devolucion.jsx`, "utf8");
  assert.match(d, /PALABRA_B = \{ correcto: "Correcto", noVaAqui: "No va aquí", ibaAqui: "Iba aquí" \}/);
  assert.match(d, /REPOSO_B = "1px solid rgba\(248,249,250,0\.35\)"/);
  assert.match(d, /ACIERTO_B = `2px solid \$\{TEXTO_B\}`/);
  assert.match(d, /ERROR_B = `2px solid \$\{CORAL_B\}`/);
  assert.match(d, /size=\{16\} strokeWidth=\{2\.5\}/);
  const h = readFileSync(`${RAIZ}/t7/hacerT7.jsx`, "utf8");
  assert.match(h, /from "\.\.\/b5\/Devolucion\.jsx"/, "hacerT7.jsx no toma la pastilla de b5/Devolucion.jsx");
});

test("D6 · todo pulgar de deslizador mide 44 × 44 px", () => {
  const malos = archivos.flatMap((f) => [...limpio[f].matchAll(/::-(?:webkit-slider|moz-range)-thumb\s*\{([^}]*)\}/g)]
    .filter((m) => { const w = /width:\s*(\d+)px/.exec(m[1]); const h = /height:\s*(\d+)px/.exec(m[1]); return !w || !h || +w[1] < 44 || +h[1] < 44; })
    .map((m) => `${f.replace(RAIZ + "/", "")}: ${m[1].trim().slice(0, 60)}`));
  assert.deepEqual(malos, []);
});

test("D7 · ninguna caja en café", () => {
  assert.deepEqual(hallazgos(archivos, (l) => /#8A6F4E|carton:/i.test(l)), []);
});

// L-1 de Mello (auditoria-mello-patron-c2.md §4): la regla gemela, literal.
test("D8 · en Aprender nunca «Iba aquí»", () => { assert.deepEqual(hallazgos(archivos.filter((f) => APRENDER.test(f)), (l) => /Iba aquí/.test(l)), []); });
