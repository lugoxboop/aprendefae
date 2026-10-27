import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { SUBJECTS, HACER, actividadesDeTipo } from "../../data/subjects.js";
import { ITEMS_T2, FUERA_T2 } from "../contabilidad/t2.js";
import { SUBTEMA_FIJO, LISTA_CERRADA_T2, PROXIMAS } from "../../data/contabilidadT2Subtemas.js";
import { BALANCES, evaluarUbicacion } from "../../contabilidad/armaElBalance.js";
import { FILAS_A_RESOLVER, evaluarCelda } from "../../contabilidad/cuadroDinamicas.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL REPASO DE T2 (lote T2-13 de L, #471): lo que pone la Célula C en el pool.
 *
 *   1. Las siete Hacer del catálogo, cada una dentro o fuera con su razón.
 *   2. Ni una copia: cada ítem es un ítem del banco del juego, y su devolución
 *      es la misma función del juego.
 *   3. El itemId es el que el juego manda a registrar_fp.
 *   4. El subtema sale de la lista cerrada de Near, sin un nombre escrito aquí.
 *   5. Teal es el debe y ámbar el haber: el Repaso pinta en teal la opción
 *      acertada, así que ninguna opción de T2 puede ser «Debe» o «Haber».
 * ═══════════════════════════════════════════════════════════════════════════
 */

const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === "cuentas-debe-haber");
const HACER_T2 = actividadesDeTipo(TEMA, HACER).map((a) => a.id);
const deLa = (actividad) => ITEMS_T2.filter((x) => x.actividad === actividad);
const fuente = (ruta) => readFileSync(new URL(ruta, import.meta.url), "utf8");

test("★ T2: las siete Hacer del catálogo, cada una dentro o fuera con su razón; las nuevas, en ninguno", () => {
  assert.deepEqual(HACER_T2, [
    "cu-izquierda-o-derecha", "cu-de-que-familia", "cu-cuadro-dinamicas", "cu-debita-o-acredita",
    "cu-saldo-de-la-cuenta", "cu-arma-el-asiento", "cu-asiento-compuesto",
  ]);
  const dentro = new Set(ITEMS_T2.map((x) => x.actividad));
  const fuera = new Set(FUERA_T2.map((f) => f.id));
  assert.deepEqual([...dentro].sort(), ["cu-cuadro-dinamicas", "cu-de-que-familia"]);
  for (const id of HACER_T2) assert.ok(dentro.has(id) !== fuera.has(id), `${id}: tiene que estar en un lado y solo en uno`);
  for (const f of FUERA_T2) assert.ok(HACER_T2.includes(f.id) && f.razon.length > 30, `${f.id}: fuera sin razón o no es Hacer de T2`);
  for (const id of PROXIMAS) assert.ok(!dentro.has(id) && !fuera.has(id), `${id} no está en el catálogo todavía`);
});

test("★ T2: un ítem por cuenta de cada balance y por fila que el cuadro pide resolver (ni más ni menos)", () => {
  const cuentas = BALANCES.flatMap((b) => b.cuentas);
  assert.deepEqual(deLa("cu-de-que-familia").map((x) => x.itemId), cuentas.map((c) => c.id));
  assert.deepEqual(deLa("cu-cuadro-dinamicas").map((x) => x.itemId), FILAS_A_RESOLVER.map((f) => f.id));
  assert.equal(ITEMS_T2.length, cuentas.length + FILAS_A_RESOLVER.length);
});

test("★ T2: ni una copia — enunciado, correcta y devolución salen del banco y de la función del juego", () => {
  const cuentas = new Map(BALANCES.flatMap((b) => b.cuentas).map((c) => [c.id, c]));
  for (const x of deLa("cu-de-que-familia")) {
    const c = cuentas.get(x.itemId);
    assert.equal(x.enunciado, c.cuenta);
    assert.equal(x.correcta, c.seccion);
    for (const o of x.opciones) assert.deepEqual(x.devolucion(o.id).map((b) => b.texto), [evaluarUbicacion(c, o.id).texto].filter(Boolean), `${x.clave} · ${o.id}`);
  }
  const filas = new Map(FILAS_A_RESOLVER.map((f) => [f.id, f]));
  for (const x of deLa("cu-cuadro-dinamicas")) {
    const f = filas.get(x.itemId);
    assert.equal(x.enunciado, f.nombre);
    assert.equal(x.correcta, f.debito);
    for (const o of x.opciones) assert.deepEqual(x.devolucion(o.id).map((b) => b.texto), [evaluarCelda(f, o.id).texto], `${x.clave} · ${o.id}`);
  }
  /* El error trae su propia devolución, no la del acierto. */
  const malo = deLa("cu-cuadro-dinamicas")[0];
  const otra = malo.opciones.find((o) => o.id !== malo.correcta).id;
  assert.notDeepEqual(malo.devolucion(otra), malo.devolucion(malo.correcta));
  /* Ninguna cadena de contenido escrita en t2.js: lo único entre comillas son ids, razones de FUERA y rutas. */
  assert.doesNotMatch(fuente("../contabilidad/t2.js"), /enunciado: "|texto: "|correcta: "/);
});

test("★ T2: el itemId es el que el juego manda a registrar_fp", () => {
  assert.match(fuente("../../components/mecanicas/libros/ArmaElBalance.jsx"), /t\.anotar\(item\.id,/);
  assert.match(fuente("../../components/mecanicas/libros/CuadroDeDinamicas.jsx"), /t\.anotar\(fila\.id,/);
  for (const x of ITEMS_T2) assert.equal(x.clave, `${x.actividad}:${x.itemId}`);
});

test("★ T2: el subtema es el [fijo] de la lista cerrada de Near", () => {
  for (const x of ITEMS_T2) {
    assert.equal(x.subtema, SUBTEMA_FIJO[x.actividad], x.clave);
    assert.ok(LISTA_CERRADA_T2.includes(x.subtema), `${x.clave}: «${x.subtema}» no está en la lista cerrada`);
  }
  assert.doesNotMatch(fuente("../contabilidad/t2.js"), new RegExp(LISTA_CERRADA_T2.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")));
});

test("★ T2: teal es el debe y ámbar el haber — ni una opción «Debe»/«Haber», ni «haber» en un rótulo teal", async () => {
  /* Por qué: el Repaso pinta la opción acertada (y la revelada) en teal. */
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { createElement } = await import("react");
  const { Opcion } = await import("../../components/mecanicas/corazon/juego.jsx");
  const { FAE } = await import("../../theme.js");
  const html = renderToStaticMarkup(createElement(Opcion, { estado: "correcta" }, "Haber"));
  assert.ok(html.toLowerCase().includes(FAE.teal.toLowerCase()), "Opcion ya no pinta el acierto en teal: revisar esta regla y FUERA_T2");
  const PALABRA = /\b(debe|haber|d[eé]bito|cr[eé]dito)\b/i;
  for (const x of ITEMS_T2) {
    for (const o of x.opciones) assert.doesNotMatch(o.texto, PALABRA, `${x.clave}: la opción «${o.texto}» nombra un lado y saldría en teal`);
    /* El rótulo del enunciado y el del detalle van en teal: pueden decir «debe», nunca «haber». */
    for (const r of [x.rotulo, x.detalle?.rotulo].filter(Boolean)) assert.doesNotMatch(r, /haber|cr[eé]dito/i, `${x.clave}: «${r}» en teal`);
  }
});
