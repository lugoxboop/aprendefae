import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL REGISTRO DE CIFRAS CONSTRUIDAS DE T5 (regla 5c) · Célula C.
 *
 * El registro es de Near, en
 * orquestador/conocimiento/registro-cifras-construidas-t5.json, con las tres
 * etiquetas de uso de N4 que corrigió Mello (decisión de L, en
 * paquetes/t5-veredicto-mello-tandas-1-y-2.md); las cifras no cambian. Desde
 * la v2 de N5 trae 40 filas: N4, N5 v2, N6 y N7 (estas dos, todavía sin
 * pieza en el catálogo). Esta prueba lo lee y, para cada fila:
 *
 *   · evalúa su «calculo» (enteros, solo + − × / y paréntesis) y lo compara
 *     con su «cifra»
 *   · si su pieza ya está en el catálogo, comprueba que la cifra está en los
 *     datos de la pieza (el archivo de src/data que declara su id), como
 *     valor numérico, no solo escrita en un texto
 *   · comprueba que la cifra no es del libro: ni de Santa Pacha (dueña
 *     b5-t5-a2), ni de C.4 ni de D.1 e del banco
 *   · comprueba que N4 y N5 no comparten cifras
 *
 * La cifra del libro que N5 usa solo para reconocer un error (4.860.000) no
 * es construida y no va en el registro; la trata la prueba de N5.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const REGISTRO = JSON.parse(leer("orquestador/conocimiento/registro-cifras-construidas-t5.json"));
const VEREDICTO = leer("orquestador/conocimiento/paquetes/t5-veredicto-mello-tandas-1-y-2.md");
const { SUBJECTS } = await import("../../data/subjects.js");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === "activos-financieros");
const FILAS = REGISTRO.construidas;
/* En el orden del archivo: N4, N5, N6 y N7. */
const PIEZAS = ["t5-el-interes-del-periodo", "t5-gano-o-perdio", "t5-a2-lo-que-el-ejemplo-no-trae", "t5-a-que-cuenta-va"];
const FILAS_POR_PIEZA = [13, 14, 5, 8];

function evaluar(calculo) {
  if (!/^[\d\s+\-*/()]+$/.test(calculo)) throw new Error(`cálculo con algo que no es aritmética: ${calculo}`);
  return Function(`"use strict"; return (${calculo});`)();
}

function numerosDe(valor, vistos = new Set(), salida = new Set()) {
  if (typeof valor === "number" && Number.isFinite(valor)) salida.add(valor);
  else if (valor && typeof valor === "object" && !vistos.has(valor)) {
    vistos.add(valor);
    for (const v of Object.values(valor)) numerosDe(v, vistos, salida);
  }
  return salida;
}

const DATOS = new URL("src/data/", RAIZ);
const ARCHIVOS = readdirSync(DATOS).filter((f) => f.endsWith(".js") && f !== "subjects.js");
const archivosDe = (id) => ARCHIVOS.filter((f) => readFileSync(new URL(f, DATOS), "utf8").includes(`"${id}"`));

/* ═══════════ 1 · EL ARCHIVO ═══════════ */

test("★★★ el registro: tema T5, 40 filas de N4, N5, N6 y N7, cada pieza junta y en su orden, y las tres listas del libro con dueño", () => {
  assert.equal(REGISTRO.tema, "activos-financieros");
  assert.equal(FILAS.length, 40);
  /* Cada pieza en un solo bloque, en el orden del archivo. */
  const bloques = FILAS.map((f) => f.pieza).filter((p, k, xs) => k === 0 || xs[k - 1] !== p);
  assert.deepEqual(bloques, PIEZAS);
  assert.deepEqual(PIEZAS.map((id) => FILAS.filter((f) => f.pieza === id).length), FILAS_POR_PIEZA);
  for (const f of FILAS) assert.ok(Number.isInteger(f.cifra) && typeof f.uso === "string" && f.uso !== "", JSON.stringify(f));
  assert.deepEqual(REGISTRO.libro_con_dueno.map((x) => x.fuente), ["Santa Pacha, pp. 194-195 (b5-t5-a2)", "Banco C.4, p. 264", "Banco D.1 e, p. 267"]);
});

test("★★★ las etiquetas de uso de N4 son las que corrigió Mello: sin fechas, y las cifras no cambian", () => {
  const linea = VEREDICTO.split("\n").find((l) => l.startsWith("- Registro de T5 (JSON), etiquetas de uso de N4: "));
  const pares = [...linea.matchAll(/«([^»]+)» pasa a «([^»]+)»/g)].map((m) => [m[1], m[2]]);
  assert.equal(pares.length, 3);
  const usos = FILAS.filter((f) => f.pieza === PIEZAS[0]).map((f) => f.uso);
  for (const [viejo, nuevo] of pares) {
    assert.ok(!usos.some((u) => u.includes(viejo)), `sigue «${viejo}»`);
    assert.ok(usos.some((u) => u.includes(nuevo)), `falta «${nuevo}»`);
  }
  assert.deepEqual(
    Object.fromEntries(FILAS.filter((f) => ["ítem 2 · primer trimestre", "venta", "ítem 5 · segundo trimestre"].includes(f.uso)).map((f) => [f.uso, f.cifra])),
    { "ítem 2 · primer trimestre": 432000, venta: 680, "ítem 5 · segundo trimestre": 228000 },
  );
});

/* ═══════════ 2 · CADA CÁLCULO DA SU CIFRA ═══════════ */

test("★★★ cada «calculo» da su «cifra»", () => {
  const mal = FILAS.filter((f) => evaluar(f.calculo) !== f.cifra).map((f) => `${f.pieza} · ${f.uso}: ${f.calculo} = ${evaluar(f.calculo)}, y la cifra es ${f.cifra}`);
  assert.deepEqual(mal, []);
});

/* ═══════════ 3 · LAS CIFRAS ESTÁN EN SU PIEZA ═══════════ */

test("★★★ cada cifra de una pieza publicada está en sus datos, como valor numérico", async () => {
  const publicadas = PIEZAS.filter((id) => TEMA.actividades.some((a) => a.id === id));
  /* N4 y N5 están en el catálogo; N6 y N7, todavía no: sus filas se comprueban cuando entren. */
  assert.deepEqual(publicadas, PIEZAS.slice(0, 2));
  const faltan = [];
  for (const id of publicadas) {
    const archivos = archivosDe(id);
    assert.ok(archivos.length > 0, `ningún archivo de src/data declara «${id}»`);
    const nums = new Set();
    for (const a of archivos) numerosDe(await import(new URL(a, DATOS).href), new Set(), nums);
    for (const f of FILAS.filter((x) => x.pieza === id)) if (!nums.has(f.cifra)) faltan.push(`${id} · ${f.uso}: ${f.cifra}`);
  }
  assert.deepEqual(faltan, []);
});

/* ═══════════ 4 · NINGUNA CIFRA DEL LIBRO, NINGUNA COMPARTIDA ═══════════ */

test("★★★ ninguna cifra construida es del libro (Santa Pacha, C.4, D.1 e) y N4 y N5 no comparten cifras", () => {
  const libro = new Set(REGISTRO.libro_con_dueno.flatMap((x) => x.cifras));
  for (const v of [2_000_000, 1_725_000, 375_000, 343_750, 520_000, 31_200, 31_460, 831_000]) assert.ok(libro.has(v), String(v));
  assert.deepEqual(FILAS.filter((f) => libro.has(f.cifra)).map((f) => `${f.pieza}: ${f.cifra}`), []);
  const de = (id) => new Set(FILAS.filter((f) => f.pieza === id).map((f) => f.cifra));
  const [n4, n5] = PIEZAS.slice(0, 2).map(de);
  assert.deepEqual([...n4].filter((v) => n5.has(v)), []);
});
