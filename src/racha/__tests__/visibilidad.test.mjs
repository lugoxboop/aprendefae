import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL MOMENTO DE RACHA CON LA PESTAÑA OCULTA.
 *
 * El fallo tal como se encontró en la cuenta real de Mateo (17-09-2026): la
 * pestaña estaba oculta al terminar la actividad; racha_momento() se consultó
 * igual, el servidor marcó el día como visto, la secuencia se montó, corrió
 * sus esperas sin que nadie la viera y se cerró sola.
 *
 * Aquí se monta lo mismo que monta App —MomentoRachaCon: disparo + secuencia—
 * con tres piezas de mentira: una pestaña que se puede ocultar, un canal de FP
 * y un servidor que, como el de verdad, marca el día en la primera pregunta
 * que acierta.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole(), pretendToBeVisual: true });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
w.innerWidth = 375;
w.innerHeight = 812;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act ?? (await import("react-dom/test-utils")).act;
const { MomentoRachaCon, TIEMPOS, duracionEntrada } = await import("../../components/racha/MomentoRacha.jsx");
const { crearRelojPausable } = await import("../visibilidad.js");
const { crearDisparador, ESPERA_TRAS_FP_MS } = await import("../disparador.js");

/* ─────────────────────────── las piezas de mentira ─────────────────────────── */

function pestana(visible) {
  let v = visible;
  const oyentes = new Set();
  return {
    visible: () => v,
    escuchar: (fn) => { oyentes.add(fn); return () => oyentes.delete(fn); },
    poner(nuevo) { v = nuevo; for (const fn of [...oyentes]) fn(); },
  };
}

/* El servidor de racha_momento(): la primera pregunta del día marca el día y dice «mostrar»; las demás, no. */
function servidor(desde = 3, hasta = 4) {
  const s = { pedidos: 0, diaMarcado: false };
  s.pedir = async () => {
    s.pedidos++;
    if (s.diaMarcado) return { mostrar: false, desde: 0, hasta: 0, hoy: "2026-09-17", semana: [] };
    s.diaMarcado = true;
    return { mostrar: true, desde, hasta, hoy: "2026-09-17", semana: ["2026-09-14", "2026-09-15", "2026-09-16", "2026-09-17"] };
  };
  return s;
}

function canalFP() {
  let oyente = null;
  return { escuchar: (fn) => { oyente = fn; return () => { oyente = null; }; }, emitir: () => oyente?.({ fp: 5 }) };
}

function montar({ visible }) {
  const vis = pestana(visible);
  const srv = servidor();
  const fp = canalFP();
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(React.createElement(MomentoRachaCon, { sesionActiva: true, pedir: srv.pedir, escucharFP: fp.escuchar, visibilidad: vis })));
  const fase = () => caja.querySelector("[data-momento-racha]")?.dataset.momentoRacha ?? null;
  return { vis, srv, fp, caja, fase, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}

/* Avanza el reloj de mentira y deja correr las promesas (la pregunta al servidor es asíncrona). */
async function pasar(ms) {
  await act(async () => {
    mock.timers.tick(ms);
    for (let k = 0; k < 5; k++) await new Promise((r) => setImmediate(r));
  });
}

/* Como pasar(), pero vigilando en cada tramo si la secuencia llegó a montarse. */
async function pasarVigilando(m, ms, paso = 250) {
  let montada = false;
  for (let t = 0; t < ms; t += paso) {
    await pasar(Math.min(paso, ms - t));
    if (m.fase()) montada = true;
  }
  return montada;
}

const ANTES = { apis: ["setTimeout", "Date"] };

/* ─────────────────────────── el fallo, reproducido ─────────────────────────── */

test("EL FALLO: pestaña oculta al terminar la actividad → no se pregunta, el servidor no marca el día y no se monta nada", async () => {
  mock.timers.enable(ANTES);
  const m = montar({ visible: false });
  try {
    await pasar(0);
    /* Termina la actividad: el servidor confirma FP con la pestaña oculta. */
    m.fp.emitir();
    const montada = await pasarVigilando(m, ESPERA_TRAS_FP_MS + 20000);
    assert.equal(m.srv.pedidos, 0, "no se consultó racha_momento con la pestaña oculta");
    assert.equal(m.srv.diaMarcado, false, "el servidor NO marcó el día como visto");
    assert.equal(montada, false, "la secuencia no llegó a montarse en ningún momento");

    /* Vuelve a la pestaña: ahora sí se pregunta, se marca y se ve. */
    m.vis.poner(true);
    await pasar(0);
    assert.equal(m.srv.pedidos, 1);
    assert.equal(m.srv.diaMarcado, true);
    assert.equal(m.fase(), "entrada");
    assert.ok(m.caja.textContent.includes("Pasaste de racha 3 a 4"));
  } finally {
    m.desmontar();
    mock.timers.reset();
  }
});

test("al abrir la sesión con la pestaña oculta tampoco se pregunta hasta que se vea", async () => {
  mock.timers.enable(ANTES);
  const m = montar({ visible: false });
  try {
    await pasar(60000);
    assert.equal(m.srv.pedidos, 0);
    m.vis.poner(true);
    await pasar(0);
    assert.equal(m.srv.pedidos, 1);
    assert.equal(m.fase(), "entrada");
  } finally {
    m.desmontar();
    mock.timers.reset();
  }
});

test("oculta a mitad de la secuencia: se congela sin cerrarse y retoma donde iba al volver", async () => {
  mock.timers.enable(ANTES);
  const m = montar({ visible: true });
  try {
    await pasar(0);
    assert.equal(m.fase(), "entrada");
    const entrada = duracionEntrada(4);

    await pasar(1000);
    m.vis.poner(false);
    await pasar(10 * 60 * 1000);
    assert.equal(m.fase(), "entrada", "diez minutos oculta y sigue en la entrada");

    m.vis.poner(true);
    await pasar(entrada - 1000 - 1);
    assert.equal(m.fase(), "entrada", "retoma con lo que le faltaba, no desde cero ni saltándoselo");
    await pasar(1);
    assert.equal(m.fase(), "semana");

    /* Oculta también durante la semana: no se cierra sola. */
    m.vis.poner(false);
    await pasar(10 * 60 * 1000);
    assert.equal(m.fase(), "semana");
    m.vis.poner(true);
    await pasar(TIEMPOS.transicion + TIEMPOS.semana);
    assert.equal(m.fase(), "salida");
    await pasar(TIEMPOS.salida);
    assert.equal(m.fase(), null, "cerrada al terminar, viéndose");
    assert.equal(m.srv.pedidos, 1, "y el día se preguntó una sola vez");
  } finally {
    m.desmontar();
    mock.timers.reset();
  }
});

test("un toque sigue saltándola aunque esté a mitad de una pausa", async () => {
  mock.timers.enable(ANTES);
  const m = montar({ visible: true });
  try {
    await pasar(0);
    m.vis.poner(false);
    await pasar(5000);
    m.vis.poner(true);
    act(() => { m.caja.querySelector("[data-momento-racha]").dispatchEvent(new w.MouseEvent("pointerdown", { bubbles: true })); });
    assert.equal(m.fase(), "salida");
    await pasar(TIEMPOS.salida);
    assert.equal(m.fase(), null);
  } finally {
    m.desmontar();
    mock.timers.reset();
  }
});

/* ─────────────────────────── las piezas por separado ─────────────────────────── */

test("reloj pausable: no corre con la página oculta y conserva lo que faltaba", () => {
  mock.timers.enable(ANTES);
  try {
    const vis = pestana(true);
    const reloj = crearRelojPausable(vis);
    const hechos = [];
    reloj.programar(() => hechos.push("a"), 1000);
    mock.timers.tick(400);
    vis.poner(false);
    assert.equal(reloj.pausado(), true);
    mock.timers.tick(5000);
    assert.deepEqual(hechos, []);
    vis.poner(true);
    mock.timers.tick(599);
    assert.deepEqual(hechos, []);
    mock.timers.tick(1);
    assert.deepEqual(hechos, ["a"]);

    /* Programado ya oculto: espera entero a que se vea. */
    vis.poner(false);
    reloj.programar(() => hechos.push("b"), 300);
    mock.timers.tick(10000);
    assert.deepEqual(hechos, ["a"]);
    vis.poner(true);
    mock.timers.tick(300);
    assert.deepEqual(hechos, ["a", "b"]);
    reloj.detener();
  } finally {
    mock.timers.reset();
  }
});

test("disparador: una pregunta pendiente muere si la sesión se cierra antes de volver a verse", async () => {
  mock.timers.enable(ANTES);
  try {
    const vis = pestana(false);
    const srv = servidor();
    const fp = canalFP();
    const d = crearDisparador({ pedir: srv.pedir, escucharFP: fp.escuchar, alMostrar: () => {}, visibilidad: vis });
    d.sesion(true);
    fp.emitir();
    mock.timers.tick(ESPERA_TRAS_FP_MS);
    d.sesion(false);
    vis.poner(true);
    await new Promise((r) => setImmediate(r));
    assert.equal(srv.pedidos, 0);
    d.detener();
  } finally {
    mock.timers.reset();
  }
});

test("el adaptador real lee document.visibilityState y escucha visibilitychange", async () => {
  const { visibilidadDocumento } = await import("../visibilidad.js");
  let estado = "visible";
  Object.defineProperty(document, "visibilityState", { configurable: true, get: () => estado });
  try {
    const vistos = [];
    const dejar = visibilidadDocumento.escuchar(() => vistos.push(visibilidadDocumento.visible()));
    assert.equal(visibilidadDocumento.visible(), true);
    estado = "hidden";
    document.dispatchEvent(new w.Event("visibilitychange"));
    estado = "visible";
    document.dispatchEvent(new w.Event("visibilitychange"));
    dejar();
    estado = "hidden";
    document.dispatchEvent(new w.Event("visibilitychange"));
    assert.deepEqual(vistos, [false, true], "y al dejar de escuchar ya no avisa");
  } finally {
    delete document.visibilityState;
  }
});
