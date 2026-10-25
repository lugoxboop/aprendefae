import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T1 EN SECUENCIA (lote 6) · LO QUE SE PUEDE PERDER SIN QUE NADA SE ROMPA A LA VISTA.
 *
 * La forma de cada pieza (faltasDePieza de Erwin), la R10 de la predicción
 * (la vía sin nodos), las paradas con su C2 (pista al 1.er error, el estado
 * correcto al 2.º) y que lo publicado siga detrás de la bandera.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
const Observador = class { observe() {} unobserve() {} disconnect() {} };
w.matchMedia = (q) => ({ matches: /reduce/.test(q), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  ResizeObserver: Observador, IntersectionObserver: Observador, sessionStorage: w.sessionStorage,
  requestAnimationFrame: (f) => setTimeout(f, 0), cancelAnimationFrame: (h) => clearTimeout(h),
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act ?? (await import("react-dom/test-utils")).act;
const S = await import("../../../../../secuencia/secuencia.js");
const { default: SecuenciaAprender } = await import("../../../../../secuencia/SecuenciaAprender.jsx");
const { PIEZAS_T1_SECUENCIA, secuenciaActiva } = await import("../piezasT1.js");
const { PIEZA_RECORRIDO } = await import("../piezaRecorrido.jsx");
const { PIEZA_OCHO_LEEN } = await import("../piezaOchoLeen.jsx");
const { A1_SEC, OCHO_SEC } = await import("../../../../../../data/contabilidadT1Secuencia.js");
const { ID, USUARIOS } = await import("../../../../../../data/contabilidadIntro.js");

const h = React.createElement;
function montar(Figura, props = {}) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  let estado = props.estado ?? null;
  const pintar = () => act(() => raiz.render(h(Figura, {
    estado, paso: props.paso ?? 0, primeraVez: true, reducido: true,
    setEstado: (v) => { estado = typeof v === "function" ? v(estado) : v; pintar(); },
  })));
  pintar();
  return { caja, get estado() { return estado; }, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}
const tocar = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
const pantalla = (pieza, id) => pieza.pantallas.find((p) => p.id === id);

test("★★★ las dos piezas cumplen la forma de la secuencia", () => {
  for (const p of PIEZAS_T1_SECUENCIA) assert.deepEqual(S.faltasDePieza(p), [], p.id);
});

test("★★ cu0-a1 conserva su id publicado y tiene diez pantallas; la pieza nueva, cuatro", () => {
  assert.equal(PIEZA_RECORRIDO.id, ID);
  assert.equal(PIEZA_RECORRIDO.pantallas.length, 10);
  assert.equal(PIEZA_OCHO_LEEN.pantallas.length, 4);
  assert.notEqual(PIEZA_OCHO_LEEN.id, ID);
});

test("★★ titulares de dos renglones como tope: 48 caracteres o menos (Mai §1.1)", () => {
  for (const p of PIEZAS_T1_SECUENCIA) for (const pt of p.pantallas) assert.ok(pt.titular.length <= 48, `${p.id}/${pt.id}: ${pt.titular.length}`);
});

test("★★★ R10: la predicción no trae los nodos; entran como respuesta", () => {
  const m = montar(pantalla(PIEZA_RECORRIDO, "prediccion").Figura);
  try {
    assert.equal(m.caja.querySelectorAll("[data-nodo]").length, 0, "los nodos contestan la predicción");
    assert.equal(m.caja.querySelector("[data-respuesta-prediccion]"), null);
    tocar(m.caja.querySelector('[data-prediccion="Tres"]'));
    assert.equal(m.caja.querySelectorAll("[data-nodo]").length, 5);
    assert.equal(m.caja.querySelector("[data-respuesta-prediccion]").textContent, A1_SEC.pantallas.prediccion.respuesta);
  } finally { m.desmontar(); }
});

test("★★ los siete verbos: se cuentan al tocarlos y «registrar» se dice anotar", () => {
  const m = montar(pantalla(PIEZA_RECORRIDO, "verbos").Figura);
  try {
    assert.equal(m.caja.querySelectorAll("[data-verbo]").length, 7);
    tocar(m.caja.querySelector('[data-verbo="registrar"]'));
    assert.match(m.caja.querySelector("[data-cuenta-verbos]").textContent, /^1 de 7 · registrar es anotar$/);
  } finally { m.desmontar(); }
});

test("★★ Míralo: la ficha se transforma al tocarla, y el riel enciende su estación", () => {
  const m = montar(pantalla(PIEZA_RECORRIDO, "papel").Figura);
  try {
    assert.ok(m.caja.querySelector('[data-forma="hecho"]'));
    assert.equal(m.caja.querySelector("[data-riel]").dataset.encendidos, "1");
    tocar(m.caja.querySelector("[data-tocar-ficha]"));
    assert.ok(m.caja.querySelector('[data-forma="factura"]'));
    assert.equal(m.caja.querySelector("[data-riel]").dataset.encendidos, "2");
  } finally { m.desmontar(); }
});

test("★★ el balance de la estación 4: cuatro renglones, el del computador resaltado, y el pie dice cuántas faltan", () => {
  const m = montar(pantalla(PIEZA_RECORRIDO, "informe").Figura, { estado: { tocada: true } });
  try {
    const lineas = [...m.caja.querySelectorAll("[data-linea]")];
    assert.deepEqual(lineas.map((l) => l.dataset.linea), A1_SEC.pantallas.informe.renglones);
    assert.equal(m.caja.querySelector('[data-marcada="si"]').dataset.linea, "Equipo de computación");
    assert.equal(m.caja.querySelector("[data-pie-balance]").textContent, "y 3 líneas más");
  } finally { m.desmontar(); }
});

test("★★★ parada (C2): 1.er error, fantasma y pista; 2.º error, se enciende la correcta y queda resuelta", () => {
  const pt = pantalla(PIEZA_RECORRIDO, "parada-papel");
  const m = montar(pt.Figura);
  try {
    assert.equal(pt.resuelta(m.estado), false);
    tocar(m.caja.querySelector('[data-parada="guarda"]'));
    assert.equal(m.caja.querySelector('[data-parada="guarda"]').dataset.estado, "fantasma");
    assert.equal(m.caja.querySelector('[data-mensaje="error"]').textContent.includes("Piensa para qué sirve"), true);
    assert.equal(pt.resuelta(m.estado), false, "un error ya libera");
    tocar(m.caja.querySelector('[data-parada="estado"]'));
    assert.equal(m.caja.querySelector('[data-parada="anota"]').dataset.estado, "acierto");
    assert.equal(pt.resuelta(m.estado), true);
  } finally { m.desmontar(); }
});

test("★★ la parada de quién decide: «Los jefes» en la fila (Mai §2), y el acierto libera en el acto", () => {
  const pt = pantalla(PIEZA_RECORRIDO, "parada-quien");
  const m = montar(pt.Figura);
  try {
    assert.equal(m.caja.querySelector('[data-parada="administradores"]').textContent, "Los jefes");
    tocar(m.caja.querySelector('[data-parada="administradores"]'));
    assert.equal(pt.resuelta(m.estado), true);
    assert.equal(m.caja.querySelector("[data-riel]").dataset.encendidos, "5");
  } finally { m.desmontar(); }
});

test("★★ el cierre: la vuelta se enciende con el paso, no antes", () => {
  const Fig = pantalla(PIEZA_RECORRIDO, "cierre").Figura;
  const a = montar(Fig, { paso: 0 });
  const b = montar(Fig, { paso: 1 });
  try {
    assert.equal(a.caja.querySelector("[data-riel]").dataset.vuelta, "tenue");
    assert.equal(b.caja.querySelector("[data-riel]").dataset.vuelta, "solida");
    assert.ok(b.caja.querySelector("[data-pie-libro]").textContent.includes("p. 6"));
  } finally { a.desmontar(); b.desmontar(); }
});

test("★★★ Ocho leen lo mismo: dos pasos de cuatro, mezclados, sin rótulos de adentro y afuera, y cada uno una vez", () => {
  const p1 = OCHO_SEC.pantallas.paso1.personas, p2 = OCHO_SEC.pantallas.paso2.personas;
  assert.deepEqual([...p1, ...p2].sort(), USUARIOS.map((u) => u.id).sort());
  for (const paso of [p1, p2]) {
    const tipos = new Set(paso.map((id) => USUARIOS.find((u) => u.id === id).tipo));
    assert.equal(tipos.size, 2, "un paso coincide con una zona: le da la respuesta a t1-1");
  }
  const m = montar(pantalla(PIEZA_OCHO_LEEN, "paso-2").Figura);
  try {
    assert.doesNotMatch(m.caja.textContent, /interno|externo|adentro|afuera/i);
    tocar(m.caja.querySelector('[data-persona="administradores"]'));
    assert.ok(m.caja.querySelector('[data-pregunta-de="administradores"]').textContent.includes(USUARIOS.find((u) => u.id === "administradores").pregunta));
  } finally { m.desmontar(); }
});

test("★★ la bandera: sin ?aprender=secuencia, el estudiante sigue viendo las cuatro capas", () => {
  assert.equal(secuenciaActiva(""), false);
  assert.equal(secuenciaActiva("?aprender=otra"), false);
  assert.equal(secuenciaActiva("?aprender=secuencia"), true);
});

test("★★ la secuencia monta las dos piezas y dice «Pieza 1 de 2»", () => {
  sessionStorage.clear();
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(h(SecuenciaAprender, { temaId: "introduccion-contabilidad", piezas: PIEZAS_T1_SECUENCIA, final: "tema" })));
  try {
    assert.match(caja.querySelector("[data-contador-pieza]").textContent, /Pieza 1 de 2/);
    assert.equal(caja.querySelector("h2").textContent, A1_SEC.pantallas.prediccion.titular);
  } finally { act(() => raiz.unmount()); caja.remove(); }
});
