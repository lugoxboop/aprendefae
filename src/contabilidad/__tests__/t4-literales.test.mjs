import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · LOS LITERALES DEL PROMPT MAESTRO (§4.2 y §4.3; lote de Katsumi, 16 oct).
 *
 * En todo T4 la marca dice «Correcto», «No va aquí» o «Iba aquí», y nada más.
 * Salen «Bien», «Mal», «Correcta», «Revisa» y «Cifra errada». Y el botón de
 * avance sigue al contador: «Paso n de N» → «Siguiente paso».
 *
 * Se mira el código tal cual: los datos (src/data/contabilidadT4*.js y el
 * «Así se juega» de T4) y los componentes (src/components/t4/), sin los
 * comentarios. Lo que el estudiante lee o el lector oye sale de ahí; si uno de
 * esos literales vuelve en una cadena, esta prueba lo nombra con su archivo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const RAIZ = new URL("../../../", import.meta.url);
const leer = (r) => readFileSync(new URL(r, RAIZ), "utf8");
const ARCHIVOS = [
  ...readdirSync(new URL("src/data/", RAIZ)).filter((f) => /^contabilidadT4.*\.js$/.test(f)).map((f) => `src/data/${f}`),
  "src/data/asiSeJuegaT4.js",
  ...readdirSync(new URL("src/components/t4/", RAIZ)).filter((f) => f.endsWith(".jsx")).map((f) => `src/components/t4/${f}`),
];

/* Sin comentarios de bloque ni de línea (los de línea, solo al principio o tras espacio, para no comerse «https://»). */
const sinComentarios = (s) => s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:\\])\/\/[^\n]*/g, "$1");
/* Las cadenas del código: "…", '…' y `…` (las de plantilla, enteras). */
const cadenas = (s) => [...s.matchAll(/"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g)].map((m) => m[1] ?? m[2] ?? m[3]);

/* Lo prohibido, como literal de marca o de texto. «bien» en minúscula dentro de una frase («están bien, pero al revés») no es una marca. */
const PROHIBIDO = [
  [/^\s*(✓\s*)?Bien\s*$/u, "«Bien» como marca"],
  [/^\s*(✗\s*)?Mal\s*$/u, "«Mal» como marca"],
  [/✓\s*Bien|✗\s*Mal/u, "«✓ Bien» o «✗ Mal»"],
  [/(?<![\p{L}])Correcta(?![\p{L}])/u, "«Correcta»"],
  [/(?<![\p{L}])Revisa(?![\p{L}])/u, "«Revisa»"],
  [/Cifra errada/u, "«Cifra errada»"],
];

test("★★★ ningún dato ni componente de T4 trae «Bien», «Mal», «Correcta», «Revisa» o «Cifra errada»", () => {
  assert.ok(ARCHIVOS.length >= 20, `solo ${ARCHIVOS.length} archivos: la prueba no está mirando T4`);
  const malas = [];
  for (const f of ARCHIVOS) {
    for (const c of cadenas(sinComentarios(leer(f)))) {
      for (const [re, nombre] of PROHIBIDO) if (re.test(c)) malas.push(`${f}: ${nombre} en «${c.slice(0, 80)}»`);
    }
  }
  assert.deepEqual(malas, []);
});

test("★★★ la marca son tres literales y nada más: «✓ Correcto», «✗ No va aquí» e «Iba aquí»", async () => {
  const { MARCA } = await import("../../data/contabilidadT4.js");
  assert.deepEqual(MARCA, { bien: "Correcto", mal: "No va aquí", era: "Iba aquí" });
  const A0 = await import("../../data/contabilidadT4A0.js");
  assert.equal(A0.MARCA_CASILLA, undefined, "MARCA_CASILLA volvió: las casillas de A0 usan MARCA");
  const { MARCA_CIFRA_BIEN, MARCA_CIFRA_MAL } = await import("../../data/contabilidadT4Hacer.js");
  assert.deepEqual([MARCA_CIFRA_BIEN, MARCA_CIFRA_MAL], ["bien", "mal"]);
});

test("★★★ el botón de avance sigue al contador (§4.3): H4 dentro de la ronda, y H7 y H8, «Siguiente paso»; «Comprobar» a secas", async () => {
  const H4 = await import("../../data/contabilidadT4H4.js");
  const H7 = await import("../../data/contabilidadT4H7.js");
  const H8 = await import("../../data/contabilidadT4H8.js");
  assert.equal(H4.BOTON_H4.siguientePaso, "Siguiente paso");
  assert.equal(H4.rotuloPasoH4(1, 2), "Paso 1 de 2");
  assert.equal(H7.BOTON_H7.siguiente, "Siguiente paso");
  assert.equal(H7.BOTON_H7.aLosSaldos, "Siguiente paso");
  assert.equal(H7.BOTON_H7.comprobar, "Comprobar");
  for (const k of ["siguientePartida", "aLosAsientos", "siguienteAsiento", "alMayor"]) assert.equal(H8.BOTON_H8[k], "Siguiente paso", k);
  assert.equal(H8.BOTON_H8.comprobarSaldo, "Comprobar");
  for (const B of [H4.BOTON_H4, H7.BOTON_H7, H8.BOTON_H8]) assert.equal(B.verResumen, "Ver mi resumen");
});

test("★★ el detector caza los literales viejos (si se afloja, aquí se ve)", () => {
  const viejos = ['{ bien: ["✓", "Bien"], mal: ["✗", "Mal"] }', '"cifra-mal": ["✗", "Cifra errada"]', '"Respuesta Correcta"', '"Revisa las sumas."'];
  for (const v of viejos) {
    const hallado = cadenas(v).some((c) => PROHIBIDO.some(([re]) => re.test(c)));
    assert.ok(hallado, v);
  }
  assert.ok(!cadenas('"Las dos cuentas están bien, pero al revés."').some((c) => PROHIBIDO.some(([re]) => re.test(c))), "«bien» en una frase no es una marca");
});
