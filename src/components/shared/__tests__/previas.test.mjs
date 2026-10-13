/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS PREVISUALIZACIONES DE LOS NODOS — el panel, el orden de montaje y lo que
 * una previsualización no puede hacer.
 *
 *   · tocar un nodo abre su panel; «Empezar» abre la actividad;
 *   · el panel sale primero, con el icono quieto, y la animación después;
 *   · solo hay una previsualización montada, y se va al cerrar o al empezar;
 *   · con "reducir movimiento", icono quieto, sin excepciones;
 *   · Biopsia y El agujero fiscal se quedan quietas a propósito;
 *   · ninguna enseña texto, y el coral solo aparece donde es de error.
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

const TEMAS = ["politica-economica", "demanda-agregada", "politica-fiscal", "politica-monetaria"];
const temaDe = (id) => SUBJECTS.macroeconomia.topics.find((t) => t.id === id);
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

const GESTOS = [
  "arma-grupo-logico", "quien-gana-quien-pierde", "simulador-de-crisis",
  "electrocardiograma", "termometro-reacciones", "banco-transfusiones", "triage-emergencias", "cirugia-reconstruccion", "sala-monitores",
  "flujo-de-caja", "expansiva-contractiva", "disena-presupuesto",
  /* Los quince de la 0030 */
  "memorama-tesoro", "que-rama-es", "se-acerca-o-se-aleja", "consejo-ministros",
  "memorama-corazon", "cual-componente", "quien-beneficia-auge", "explica-paciente", "sala-espera-llena",
  "memorama-tesoreria", "cobra-gasta-o-pide", "quien-afecta-ajuste", "explica-contribuyente", "comite-presupuesto",
  /* Política Monetaria (0031) */
  "memorama-banco-central", "quien-decide-esto", "volante-de-la-tasa", "caja-de-herramientas", "a-quien-le-pega-la-tasa",
  "cadena-de-transmision", "explicaselo-a-un-deudor", "corriente-de-decisiones", "el-rezago", "duelo-de-instrumentos", "disena-respuesta-monetaria",
];

/* ─────────────────────────────── el registro ─────────────────────────────── */

/* Las cuatro de una sola decisión: mismo criterio, las cuatro quietas. */
const QUIETAS = ["agujero-fiscal", "biopsia-economica", "dilema-banquero-central", "expediente-gabinete"];

test("las 50 tienen su previsualización decidida: 37 gestos, el clip del tablero y cuatro quietas con su razón", () => {
  const ids = TEMAS.flatMap((t) => actividadesDeTipo(temaDe(t), HACER).map((a) => a.id));
  assert.deepEqual(Object.keys(PREVIAS).sort(), [...ids].sort());
  assert.deepEqual(Object.entries(PREVIAS).filter(([, p]) => p.tipo === "gesto").map(([id]) => id).sort(), [...GESTOS].sort());
  assert.equal(PREVIAS["tablero-decisiones"].tipo, "clip");
  for (const id of QUIETAS) {
    assert.equal(PREVIAS[id].tipo, "estatica", id);
    assert.ok(PREVIAS[id].razon?.length > 60, `${id}: la razón va escrita`);
  }
  assert.deepEqual(Object.entries(PREVIAS).filter(([, p]) => p.tipo === "estatica").map(([id]) => id).sort(), QUIETAS);
});

/* ──────────────────────────────── el panel ──────────────────────────────── */

test("tocar un nodo abre su panel con el icono quieto; la animación llega después; «Empezar» abre la actividad", async () => {
  reducirMovimiento = false;
  const abiertas = [];
  const m = abrirPanel("flujo-de-caja", (id) => abiertas.push(id));
  const panel = () => m.cont.querySelector('[role="dialog"]');

  assert.ok(panel(), "el toque abre el panel");
  assert.equal(panel().querySelector("h3").textContent, "Flujo de caja: ¿a quién afecta?");
  assert.deepEqual(abiertas, [], "el toque ya no entra directo");
  assert.ok(panel().querySelector("[data-estatico]"), "el panel sale con el icono quieto");
  assert.equal(m.cont.querySelectorAll("[data-previa]").length, 0, "y sin animación todavía");
  assert.equal(document.activeElement.textContent, "Empezar");

  await esperar();
  await esperar();
  assert.ok(panel().querySelector('[data-previa="flujo-de-caja"]'), "después, la animación");
  assert.equal(document.querySelectorAll("[data-previa]").length, 1, "una sola previsualización montada");

  tocar([...panel().querySelectorAll("button")].find((b) => b.textContent === "Empezar"));
  assert.deepEqual(abiertas, ["flujo-de-caja"]);
  assert.equal(m.cont.querySelector('[role="dialog"]'), null);
  assert.equal(document.querySelectorAll("[data-previa]").length, 0, "al empezar, el bucle se acaba");
  m.desmontar();
});

test("Escape y «Cerrar» cierran el panel y desmontan la animación", async () => {
  reducirMovimiento = false;
  const m = abrirPanel("sala-monitores");
  await esperar();
  await esperar();
  assert.ok(document.querySelector('[data-previa="sala-monitores"]'));
  act(() => { document.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape", bubbles: true })); });
  assert.equal(m.cont.querySelector('[role="dialog"]'), null);
  assert.equal(document.querySelectorAll("[data-previa]").length, 0);

  tocar(m.cont.querySelector('g[data-nodo="triage-emergencias"]'));
  tocar([...m.cont.querySelectorAll('[role="dialog"] button')].find((b) => b.textContent === "Cerrar"));
  assert.equal(m.cont.querySelector('[role="dialog"]'), null);
  m.desmontar();
});

test("en el teléfono, deslizar la hoja hacia abajo la cierra; un roce corto sigue siendo un toque; en escritorio no hay arrastre", () => {
  const puntero = (hoja, tipo, y) => act(() => { hoja.dispatchEvent(new w.MouseEvent(tipo, { bubbles: true, clientY: y })); });
  estrecho = true;
  try {
    const abiertas = [];
    const m = abrirPanel("triage-emergencias", (id) => abiertas.push(id));
    const hoja = () => m.cont.querySelector('[role="dialog"]');

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

  const m = abrirPanel("triage-emergencias");
  const hoja = m.cont.querySelector('[role="dialog"]');
  puntero(hoja, "pointerdown", 500);
  puntero(hoja, "pointermove", 640);
  puntero(hoja, "pointerup", 640);
  assert.ok(m.cont.querySelector('[role="dialog"]'), "en escritorio el panel no se arrastra");
  tocar(m.cont.querySelector(".fae-dn-fondo"));
  assert.equal(m.cont.querySelector('[role="dialog"]'), null, "tocar fuera lo cierra");
  m.desmontar();
});

test("con «reducir movimiento», icono quieto y ninguna animación montada", async () => {
  reducirMovimiento = true;
  try {
    const m = abrirPanel("cirugia-reconstruccion");
    await esperar();
    await esperar();
    assert.ok(m.cont.querySelector('[role="dialog"] [data-estatico]'));
    assert.equal(document.querySelectorAll("[data-previa]").length, 0);
    m.desmontar();
  } finally {
    reducirMovimiento = false;
  }
});

test("Las cuatro de una sola decisión se quedan quietas aunque se permita el movimiento", async () => {
  reducirMovimiento = false;
  for (const id of QUIETAS) {
    const m = abrirPanel(id);
    await esperar();
    await esperar();
    assert.ok(m.cont.querySelector('[role="dialog"] [data-estatico]'), id);
    assert.equal(document.querySelectorAll("[data-previa]").length, 0, id);
    m.desmontar();
  }
});

/* ──────────────────────── lo que una previsualización no hace ──────────────────────── */

const sinEstilos = (el) => {
  const copia = el.cloneNode(true);
  copia.querySelectorAll("style").forEach((s) => s.remove());
  return copia;
};

test("ninguna previsualización enseña texto, y el coral solo aparece donde es de error", async () => {
  const animadas = Object.entries(PREVIAS).filter(([, p]) => p.tipo !== "estatica").map(([id]) => id);
  assert.equal(animadas.length, 44);
  for (const id of animadas) {
    const m = montar(React.createElement(PreviaActividad, { actividadId: id, respaldo: React.createElement("i", { "data-respaldo": true }) }));
    await esperar(120);
    const previa = m.cont.querySelector(`[data-previa="${id}"]`);
    assert.ok(previa, `${id}: se monta`);
    assert.equal(sinEstilos(previa).textContent.trim(), "", `${id}: sin texto`);
    /*
     * El coral es error en todo el sitio. Solo la onda de Explica la política
     * lo lleva, y es la de la actividad real cuando el mensaje sale con ruido:
     * retroalimentación de error, no un gesto neutro.
     */
    if (id !== "explica-la-politica") {
      assert.ok(!/E76F51|231,\s*111,\s*81/i.test(previa.outerHTML), `${id}: coral en un gesto neutro`);
    }
    m.desmontar();
  }
});

/*
 * LAS PAREJAS QUE COMPARTEN GESTO, A PROPÓSITO: misma mecánica, mismo gesto.
 * Se comprueba que de verdad son el mismo dibujo —cambiando solo el id—, y
 * que lo que las separa, el icono, es distinto.
 */
test("las tres parejas de DA y PF comparten gesto y se distinguen por el icono", async () => {
  const { ICONOS_ACTIVIDAD } = await import("../iconosActividad.jsx");
  const pares = [
    ["quien-beneficia-auge", "quien-afecta-ajuste"],
    ["explica-paciente", "explica-contribuyente"],
    ["sala-espera-llena", "comite-presupuesto"],
  ];
  const dibujo = async (id) => {
    const m = montar(React.createElement(PreviaActividad, { actividadId: id }));
    await esperar(120);
    const html = m.cont.querySelector(`[data-previa="${id}"]`).outerHTML.split(id).join("X");
    m.desmontar();
    return html;
  };
  for (const [a, b] of pares) {
    assert.equal(await dibujo(a), await dibujo(b), `${a} y ${b}: el mismo gesto`);
    assert.notEqual(ICONOS_ACTIVIDAD[a], ICONOS_ACTIVIDAD[b], `${a} y ${b}: iconos distintos`);
  }
});

test("el tablero de decisiones usa su propio medidor: la aguja se mueve sola, sin cifras ni meta", async () => {
  const m = montar(React.createElement(PreviaActividad, { actividadId: "tablero-decisiones" }));
  await esperar(80);
  const aguja = () => m.cont.querySelector(".fae-td-aguja").style.transform;
  const antes = aguja();
  await esperar(1200);
  assert.notEqual(aguja(), antes, "la aguja cambió de posición");
  assert.equal(sinEstilos(m.cont).textContent.trim(), "");
  m.desmontar();
});
