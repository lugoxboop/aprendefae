/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS PREVISUALIZACIONES DE LOS NODOS — el panel, el orden de montaje y lo que
 * una previsualización no puede hacer.
 *
 *   · tocar un nodo abre su panel; «Empezar» abre la actividad;
 *   · el panel sale primero, con el icono quieto, y la animación después;
 *   · solo hay una previsualización montada, y se va al cerrar o al empezar;
 *   · con "reducir movimiento", icono quieto, sin excepciones;
 *   · sin previsualización registrada, el icono se queda quieto.
 *
 * DESDE EL 22-NOV-2026 NO HAY NINGUNA PREVISUALIZACIÓN REGISTRADA. Las 57 eran
 * de Macroeconomía y salieron con la materia (0258), y con ellas las pruebas
 * que las recorrían (texto, coral, parejas, el medidor del tablero). El panel
 * es el mismo para todas las materias, así que sus pruebas siguen aquí con un
 * camino de Contabilidad.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
let reducirMovimiento = false;
let estrecho = false;
w.matchMedia = (q) => ({
  matches: /reduced-motion: reduce/.test(q) ? reducirMovimiento : /max-width/.test(q) ? estrecho : false,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
});
w.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16);
w.cancelAnimationFrame = (id) => clearTimeout(id);
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  requestAnimationFrame: w.requestAnimationFrame, cancelAnimationFrame: w.cancelAnimationFrame,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act ?? (await import("react-dom/test-utils")).act;

const { default: CaminoHacer } = await import("../CaminoHacer.jsx");
const { default: PreviaActividad, PREVIAS } = await import("../previas/PreviaActividad.jsx");
const { nodosDe } = await import("../../../hacer/completadas.js");
const { SUBJECTS, HACER, actividadesDeTipo } = await import("../../../data/subjects.js");

const TEMAS = ["cuentas-debe-haber"];
const temaDe = (id) => SUBJECTS.contabilidad.topics.find((t) => t.id === id);
const nodosDelTema = (id) => nodosDe(actividadesDeTipo(temaDe(id), HACER), new Set());
const temaDeActividad = (actividadId) => TEMAS.find((t) => actividadesDeTipo(temaDe(t), HACER).some((a) => a.id === actividadId));

function montar(elemento) {
  const cont = document.createElement("div");
  document.body.appendChild(cont);
  const raiz = createRoot(cont);
  act(() => raiz.render(elemento));
  return { cont, desmontar: () => { act(() => raiz.unmount()); cont.remove(); } };
}
/* Deja correr los fotogramas y la descarga del módulo de gestos. */
const esperar = (ms = 80) => act(async () => { await new Promise((r) => setTimeout(r, ms)); });
const tocar = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });

function abrirPanel(actividadId, onAbrir = () => {}) {
  const m = montar(React.createElement(CaminoHacer, { nodos: nodosDelTema(temaDeActividad(actividadId)), porBloques: true, onAbrir }));
  tocar(m.cont.querySelector(`g[data-nodo="${actividadId}"]`));
  return m;
}

/* ─────────────────────────────── el registro ─────────────────────────────── */

test("toda previsualización registrada es de una actividad de Hacer que existe; sin registro, el respaldo", () => {
  const hacer = new Set(Object.values(SUBJECTS).flatMap((m) => m.topics.flatMap((t) => actividadesDeTipo(t, HACER).map((a) => a.id))));
  for (const [id, p] of Object.entries(PREVIAS)) {
    assert.ok(hacer.has(id), `${id}: previsualización de una actividad que no existe`);
    assert.ok(["gesto", "clip", "estatica"].includes(p.tipo), `${id}: tipo desconocido`);
    if (p.tipo === "estatica") assert.ok(p.razon?.length > 60, `${id}: la razón va escrita`);
  }
  const respaldo = React.createElement("i", { "data-respaldo": true });
  const m = montar(React.createElement(PreviaActividad, { actividadId: "cu-arma-el-asiento", respaldo }));
  assert.ok(m.cont.querySelector("[data-respaldo]"), "una actividad sin previsualización enseña su respaldo");
  m.desmontar();
});

/* ──────────────────────────────── el panel ──────────────────────────────── */

test("tocar un nodo abre su panel con el icono quieto; la animación llega después; «Empezar» abre la actividad", async () => {
  reducirMovimiento = false;
  const abiertas = [];
  const m = abrirPanel("cu-arma-el-asiento", (id) => abiertas.push(id));
  /*
   * Desde el 30-oct el panel se cuelga del body, no del camino: la máscara
   * con la que el camino se revela recortaba el pintado de su velo y el fondo
   * quedaba oscurecido solo en la columna central (ver velo-del-nodo.test.mjs).
   * Por eso se busca en el documento, y se comprueba aquí mismo que NO está
   * dentro del camino: si alguien lo devuelve ahí, el fallo vuelve.
   */
  const panel = () => document.querySelector('[role="dialog"]');

  assert.ok(panel(), "el toque abre el panel");
  assert.equal(m.cont.querySelector('[role="dialog"]'), null, "el panel no puede colgar del camino: la máscara le recorta el velo");
  assert.equal(panel().querySelector("h3").textContent, "Arma el Asiento");
  assert.deepEqual(abiertas, [], "el toque ya no entra directo");
  assert.ok(panel().querySelector("[data-estatico]"), "el panel sale con el icono quieto");
  assert.equal(document.querySelectorAll("[data-previa]").length, 0, "y sin animación todavía");
  assert.equal(document.activeElement.textContent, "Empezar");

  await esperar();
  await esperar();
  /* Sin previsualización registrada, el icono se queda quieto aunque se permita el movimiento. */
  assert.ok(panel().querySelector("[data-estatico]"), "sin previsualización, el icono sigue quieto");
  assert.equal(document.querySelectorAll("[data-previa]").length, 0, "y no se monta nada");

  tocar([...panel().querySelectorAll("button")].find((b) => b.textContent === "Empezar"));
  assert.deepEqual(abiertas, ["cu-arma-el-asiento"]);
  assert.equal(document.querySelector('[role="dialog"]'), null);
  assert.equal(document.querySelectorAll("[data-previa]").length, 0, "al empezar, el bucle se acaba");
  m.desmontar();
});

test("Escape y «Cerrar» cierran el panel y desmontan la animación", async () => {
  reducirMovimiento = false;
  const m = abrirPanel("cu-cuadro-dinamicas");
  await esperar();
  await esperar();
  assert.ok(document.querySelector('[role="dialog"]'));
  act(() => { document.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape", bubbles: true })); });
  assert.equal(document.querySelector('[role="dialog"]'), null);
  assert.equal(document.querySelectorAll("[data-previa]").length, 0);

  tocar(m.cont.querySelector('g[data-nodo="cu-saldo-de-la-cuenta"]'));
  tocar([...document.querySelectorAll('[role="dialog"] button')].find((b) => b.textContent === "Cerrar"));
  assert.equal(document.querySelector('[role="dialog"]'), null);
  m.desmontar();
});

test("en el teléfono, deslizar la hoja hacia abajo la cierra; un roce corto sigue siendo un toque; en escritorio no hay arrastre", () => {
  const puntero = (hoja, tipo, y) => act(() => { hoja.dispatchEvent(new w.MouseEvent(tipo, { bubbles: true, clientY: y })); });
  estrecho = true;
  try {
    const abiertas = [];
    const m = abrirPanel("cu-saldo-de-la-cuenta", (id) => abiertas.push(id));
    const hoja = () => document.querySelector('[role="dialog"]');

    puntero(hoja(), "pointerdown", 500);
    puntero(hoja(), "pointermove", 505);
    puntero(hoja(), "pointerup", 505);
    assert.ok(hoja(), "un roce de 5 px no cierra");
    assert.equal(hoja().style.transform, "", "ni mueve la hoja");

    puntero(hoja(), "pointerdown", 500);
    puntero(hoja(), "pointermove", 560);
    assert.match(hoja().style.transform, /translateY\(60px\)/, "la hoja sigue al dedo");
    puntero(hoja(), "pointermove", 630);
    puntero(hoja(), "pointerup", 630);
    assert.equal(hoja(), null, "bajarla la cierra");
    assert.deepEqual(abiertas, [], "y cerrar no empieza nada");
    m.desmontar();
  } finally {
    estrecho = false;
  }

  const m = abrirPanel("cu-saldo-de-la-cuenta");
  const hoja = document.querySelector('[role="dialog"]');
  puntero(hoja, "pointerdown", 500);
  puntero(hoja, "pointermove", 640);
  puntero(hoja, "pointerup", 640);
  assert.ok(document.querySelector('[role="dialog"]'), "en escritorio el panel no se arrastra");
  tocar(document.querySelector(".fae-dn-fondo"));
  assert.equal(document.querySelector('[role="dialog"]'), null, "tocar fuera lo cierra");
  m.desmontar();
});

test("con «reducir movimiento», icono quieto y ninguna animación montada", async () => {
  reducirMovimiento = true;
  try {
    const m = abrirPanel("cu-debita-o-acredita");
    await esperar();
    await esperar();
    assert.ok(document.querySelector('[role="dialog"] [data-estatico]'));
    assert.equal(document.querySelectorAll("[data-previa]").length, 0);
    m.desmontar();
  } finally {
    reducirMovimiento = false;
  }
});

/*
 * Aquí seguían cuatro pruebas que recorrían las previsualizaciones de
 * Macroeconomía: las cuatro quietas de una sola decisión, la de que ninguna
 * enseña texto ni coral, la de las tres parejas que comparten gesto y la del
 * medidor del tablero de decisiones. Salieron con la materia el 22-nov-2026
 * (0258): no queda ninguna previsualización que recorrer. Cuando el Macro
 * nuevo registre las suyas, vuelven con ellas.
 */
