import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL REGISTRO ÚNICO DE CIFRAS CONSTRUIDAS DE T7 (regla 5c) · Célula C.
 *
 * El registro es de Near, tal cual, en
 * orquestador/conocimiento/registro-cifras-construidas-t7.md: 233 filas, de
 * T7-1, T7-2 y T7-3. Esta prueba lo lee y, para cada fila:
 *
 *   · evalúa su «Cálculo» (pesos enteros, solo + − × / y paréntesis) y lo
 *     compara con su «Cifra»
 *   · si su clase es «Respuesta calificada», comprueba que la cifra está en
 *     los datos de su pieza (el archivo de src/data que declara su id),
 *     como valor numérico, no solo escrita en un texto
 *   · comprueba que la cifra no está en las listas «Prohibidas» de X1 a X4
 *     de la decisión de corte del mapa, salvo en la pieza dueña: el mapa
 *     dice que el dueño de las cifras de las cadenas X es T7-1
 *     («Un solo dueño por cifra-respuesta»)
 * ═══════════════════════════════════════════════════════════════════════════
 */

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const REGISTRO = leer("orquestador/conocimiento/registro-cifras-construidas-t7.md");
const MAPA = leer("orquestador/conocimiento/mapas/t7-inventarios.md");

/* «3.600.000» → 3600000; «0,7866» → 0.7866; «21,34 %» → 21.34. */
const numero = (t) => Number(t.replace(/[$\s%]/g, "").replace(/\./g, "").replace(",", "."));

/* Las filas, con el tema de la sección («## T7-1», …) en que están. */
function filasDelRegistro() {
  const filas = [];
  let tema = null;
  for (const l of REGISTRO.split("\n")) {
    const s = l.match(/^## (T7-\d)$/);
    if (s) tema = s[1];
    if (!/^\| \d+ \|/.test(l)) continue;
    const [n, pieza, item, cifra, calculo, clase] = l.replace(/^\| | \|$/g, "").split(" | ");
    filas.push({ n: Number(n), tema, pieza, item, cifra, valor: numero(cifra), calculo, clase, id: pieza.match(/· (t7-[\w-]+)/)?.[1] ?? null });
  }
  return filas;
}
const FILAS = filasDelRegistro();

/* Un cálculo del registro: solo cifras, espacios, + - * / y paréntesis (y los signos × y −). */
function evaluar(calculo) {
  const e = calculo.replace(/×/g, "*").replace(/−/g, "-").replace(/(\d),(\d)/g, "$1.$2");
  if (!/^[\d\s+\-*/().]+$/.test(e)) throw new Error(`cálculo con algo que no es aritmética: ${calculo}`);
  return Function(`"use strict"; return (${e});`)();
}
const igual = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));

/*
 * Las listas «Prohibidas» de la decisión de corte, una por cadena. Se lee
 * la frase que empieza en «Prohibidas:» hasta el punto que cierra la lista.
 * Lo que va entre paréntesis es aclaración (páginas, de dónde sale una suma,
 * una cifra que «solo existe en T7-2») y no entra, salvo «(por ejemplo …)»,
 * que nombra cifras prohibidas.
 */
function listasX() {
  const listas = {};
  for (const l of MAPA.split("\n")) {
    const m = l.match(/^- \*\*(X\d[ab]?) · .*?Prohibidas: (.*)$/);
    if (!m) continue;
    const [, x, resto] = m;
    if (/^las mismas de (X\d[ab]?)\./.test(resto)) { listas[x] = listas[resto.match(/^las mismas de (X\d[ab]?)/)[1]]; continue; }
    const sinParentesis = resto.replace(/\((por ejemplo [^)]*)\)/g, " $1 ").replace(/\([^)]*\)/g, " ");
    const lista = sinParentesis.split(/\.\s+(?=[A-ZÁÉÍÓÚ«])/)[0];
    listas[x] = new Set([...lista.matchAll(/\d{1,3}(?:\.\d{3})+/g)].map((n) => numero(n[0])));
  }
  return listas;
}
const X = listasX();
const PROHIBIDAS = new Map();
for (const [x, s] of Object.entries(X)) for (const v of s) PROHIBIDAS.set(v, [...(PROHIBIDAS.get(v) ?? []), x]);

/*
 * Los valores numéricos de un módulo de datos, a cualquier profundidad. Las
 * cifras escritas en sus textos no cuentan: un «$625.000» en una
 * retroalimentación no prueba que la respuesta de la pieza sea 625.000.
 */
function numerosDe(valor, vistos = new Set(), salida = new Set()) {
  if (typeof valor === "number" && Number.isFinite(valor)) salida.add(valor);
  else if (valor && typeof valor === "object" && !vistos.has(valor)) {
    vistos.add(valor);
    for (const v of Object.values(valor)) numerosDe(v, vistos, salida);
  }
  return salida;
}

/* El archivo de datos de cada pieza: el de src/data que declara su id entre comillas (subjects.js no cuenta). */
const DATOS = new URL("src/data/", RAIZ);
const ARCHIVOS = readdirSync(DATOS).filter((f) => f.endsWith(".js") && f !== "subjects.js");
const archivosDe = (id) => ARCHIVOS.filter((f) => readFileSync(new URL(f, DATOS), "utf8").includes(`"${id}"`));

/* ═══════════ 1 · EL ARCHIVO ═══════════ */

test("★★★ el registro: 233 filas, numeradas de 1 a 233, en T7-1, T7-2 y T7-3", () => {
  assert.ok(REGISTRO.startsWith("# Registro único de cifras construidas · Célula C · T7 (regla 5c)"));
  assert.match(REGISTRO, /Autora: Near\. 233 filas\./);
  assert.equal(FILAS.length, 233);
  assert.deepEqual(FILAS.map((f) => f.n), Array.from({ length: 233 }, (_, k) => k + 1));
  assert.deepEqual([...new Set(FILAS.map((f) => f.tema))], ["T7-1", "T7-2", "T7-3"]);
  for (const f of FILAS) {
    assert.ok(Number.isFinite(f.valor), `fila ${f.n}: la cifra «${f.cifra}» no es un número`);
    /* Algunas piezas de Aprender van por su nombre («A3 · El kárdex (Tauro, julio)»); las que traen id, en su tema. */
    if (f.id) assert.ok(f.id.startsWith(f.tema.toLowerCase()), `fila ${f.n}: la pieza «${f.pieza}» no es de ${f.tema}`);
    if (f.clase.startsWith("Respuesta calificada")) assert.ok(f.id, `fila ${f.n}: una respuesta calificada sin el id de su pieza`);
  }
});

/* ═══════════ 2 · CADA CÁLCULO DA SU CIFRA ═══════════ */

test("★★★ cada «Cálculo» da su «Cifra»", () => {
  const mal = FILAS.filter((f) => !igual(evaluar(f.calculo), f.valor)).map((f) => `fila ${f.n}: ${f.calculo} = ${evaluar(f.calculo)}, y la cifra es ${f.cifra}`);
  assert.deepEqual(mal, []);
});

/* ═══════════ 3 · LAS RESPUESTAS ESTÁN EN SU PIEZA ═══════════ */

test("★★★ cada «Respuesta calificada» está en los datos de su pieza", async () => {
  const calificadas = FILAS.filter((f) => f.clase.startsWith("Respuesta calificada"));
  assert.ok(calificadas.length > 0);
  const faltan = [];
  const cache = new Map();
  for (const f of calificadas) {
    if (!cache.has(f.id)) {
      const archivos = archivosDe(f.id);
      assert.ok(archivos.length > 0, `fila ${f.n}: ningún archivo de src/data declara «${f.id}»`);
      const nums = new Set();
      for (const a of archivos) numerosDe(await import(new URL(a, DATOS).href), new Set(), nums);
      cache.set(f.id, nums);
    }
    if (!cache.get(f.id).has(f.valor)) faltan.push(`fila ${f.n}: ${f.cifra} no está en los datos de ${f.id}`);
  }
  assert.deepEqual(faltan, []);
});

/* ═══════════ 4 · NINGUNA CIFRA DE X1 A X4, SALVO EN SU DUEÑO ═══════════ */

test("★★★ las listas X1 a X4 se leen bien de la decisión de corte", () => {
  assert.deepEqual(Object.keys(X), ["X1", "X2", "X3a", "X3b", "X4"]);
  assert.match(MAPA, /El dueño de las cifras compartidas por las cadenas X es T7-1/);
  /* Prohibidas: lo de la lista, el «(por ejemplo …)» de X2 y las sumas de X1, X3a y X4. */
  for (const [x, v] of [["X1", 5_800_000], ["X1", 800_000], ["X2", 22_702_000], ["X2", 1_900_800], ["X2", 23_091_000], ["X3a", 8_700_000], ["X3b", 643_500], ["X4", 17_632_000], ["X4", 2_784_000]]) {
    assert.ok(X[x].has(v), `${x} debía prohibir ${v}`);
  }
  /* Datos, páginas y aclaraciones no entran: «El 5.000.000 es dato», el 11.700.000 que «solo existe en T7-2», «p. 226». */
  for (const [x, v] of [["X1", 5_000_000], ["X3a", 7_500_000], ["X3a", 650_000], ["X3a", 11_700_000], ["X2", 1_430_000], ["X4", 6_080_000]]) {
    assert.ok(!X[x].has(v), `${x} no debía prohibir ${v}`);
  }
});

test("★★★ ninguna cifra del registro está en las listas X1 a X4, salvo en T7-1, su dueño", () => {
  const cruzan = FILAS.filter((f) => PROHIBIDAS.has(f.valor) && f.tema !== "T7-1").map((f) => `fila ${f.n} (${f.id}): ${f.cifra} está en ${PROHIBIDAS.get(f.valor).join(", ")}`);
  assert.deepEqual(cruzan, []);
});
