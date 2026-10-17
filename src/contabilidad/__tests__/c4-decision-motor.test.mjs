import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PATRÓN DE ENGANCHE C4 · EL MOTOR (t7/decisionC4.jsx) con una pieza de
 * juguete: sin contenido de Near, solo lo que las 30 piezas heredan.
 *   · la consecuencia en la figura ANTES del veredicto; el veredicto a los
 *     380 ms (mock.timers); con movimiento reducido, en el mismo toque
 *   · Hacer: la mala a la vista (coral, ✕ y su falla), «Iba aquí» en la
 *     correcta, puntaje y detalle del primer intento; la cifra cambia la figura
 *     con cada número
 *   · Aprender: escalera C2 (pista; devolución y correcta en blanco), nunca
 *     «Iba aquí»; «Seguir» con aria-disabled
 *   · foco al mensaje y al texto; botones de 44 px; letra de 12 px o más
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
let REDUCIDO = false;
w.matchMedia = (q) => ({ matches: REDUCIDO && /prefers-reduced-motion: reduce/.test(q), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.Element.prototype.scrollIntoView = () => {};
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  HTMLInputElement: w.HTMLInputElement, Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;
const M = await import("../../components/mecanicas/libros/t7/decisionC4.jsx");
const DecisionC4 = M.default;

/* ═══════════ LA PIEZA DE JUGUETE ═══════════ */

const ITEMS = [
  { id: "e1", texto: "TEXTO-E1", pregunta: "¿Dónde cae?", subtema: "SUBTEMA-E1", pista: "PISTA-E1", bien: "BIEN-E1", porque: "PORQUE-E1",
    opciones: [{ id: "a", t: "Cajón A", correcta: true }, { id: "b", t: "Cajón B", msg: "MSG-B" }, { id: "c", t: "Cajón C", msg: "MSG-C" }] },
  { id: "k1", tipo: "cifra", texto: "TEXTO-K1", pregunta: "¿Cuánto entra?", pista: "PISTA-K1", bien: "BIEN-K1",
    opciones: [{ id: "100", t: "$100", v: 100, correcta: true }, { id: "90", t: "$90", v: 90, msg: "MSG-90" }] },
];
const consecuencia = (item, e) => {
  if (e == null) return { caja: null };
  if ((item.tipo ?? "eleccion") === "cifra") return e === 100 ? { caja: e } : { caja: e, falla: `FALLA-${e}` };
  return e === "a" ? { caja: e } : { caja: e, falla: `FALLA-${e}` };
};
const Figura = ({ estado }) => h("div", { className: "c4-mov", "data-caja": JSON.stringify(estado) });
const pieza = (modo) => ({ id: `juguete-${modo}`, objeto: "Caja", modo, titulo: "Juguete", objetivo: "OBJETIVO", consigna: "CONSIGNA. Tienes un solo intento por pregunta.", items: ITEMS, consecuencia, Figura });
const Marco = ({ children }) => h("section", null, children);

/* ═══════════ AYUDAS ═══════════ */

async function montar(modo, props = {}) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(DecisionC4, { pieza: pieza(modo), Marco, rotulo: "R", ...props })); });
  const q = (s) => caja.querySelector(s);
  const qq = (s) => [...caja.querySelectorAll(s)];
  const clic = async (el) => { assert.ok(el, "no está lo que se iba a tocar"); await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
  const escribir = async (texto) => {
    const inp = q(".c4-casilla input");
    await act(async () => { Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set.call(inp, texto); inp.dispatchEvent(new w.Event("input", { bubbles: true })); });
  };
  const pasar = async (ms) => { await act(async () => { mock.timers.tick(ms); }); };
  const fig = () => JSON.parse(q("[data-caja]").dataset.caja).caja;
  const op = (id) => q(`[data-op="${id}"]`);
  const boton = (texto) => qq("button").find((b) => b.textContent.trim() === texto);
  return { caja, q, qq, clic, escribir, pasar, fig, op, boton, desmontar: () => act(async () => raiz.unmount()) };
}

const conReloj = (fn) => async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try { await fn(); } finally { mock.timers.reset(); REDUCIDO = false; }
};

/* ═══════════ HACER ═══════════ */

test("Hacer · la consecuencia en el acto y el veredicto a los 380 ms; la mala queda a la vista con ✕ y su falla; la correcta con «Iba aquí»", conReloj(async () => {
  const m = await montar("hacer");
  assert.equal(m.fig(), null);
  assert.match(m.q("[data-objetivo]")?.textContent ?? "", /OBJETIVO/);
  assert.doesNotMatch(m.caja.textContent, /Tienes un solo intento/);
  await m.clic(m.op("b"));
  // 1 · la consecuencia: la figura ya cambió, sin veredicto todavía.
  assert.equal(m.fig(), "b");
  assert.equal(m.q("[data-figura]").dataset.anim, "si");
  assert.equal(m.q("[data-mensaje]"), null);
  assert.equal(m.q("[data-falla]"), null);
  assert.equal(m.q("[data-pastilla]"), null);
  assert.ok(m.op("b").classList.contains("tocada"));
  await m.clic(m.op("a")); // bloqueada mientras llega el veredicto
  assert.equal(m.fig(), "b");
  await m.pasar(379);
  assert.equal(m.q("[data-mensaje]"), null, "el veredicto llegó antes de 380 ms");
  await m.pasar(1);
  // 2 · el veredicto.
  assert.ok(m.op("b").classList.contains("mal"));
  assert.equal(m.op("b").querySelector("[data-pastilla]").dataset.pastilla, "tachada");
  assert.match(m.op("b").getAttribute("aria-label"), /Incorrecto\./);
  const falla = m.q("[data-falla]");
  assert.equal(falla.textContent, "FALLA-b");
  assert.ok(falla.querySelector("svg"), "la falla sin su ✕");
  assert.ok(m.op("a").classList.contains("iba"));
  assert.equal(m.op("a").querySelector("[data-pastilla]").textContent, "Iba aquí");
  assert.equal(m.fig(), "b", "la mala no se queda a la vista");
  assert.equal(m.q("[data-mensaje]").dataset.mensaje, "error");
  assert.match(m.q("[data-mensaje]").textContent, /MSG-B/);
  assert.equal(document.activeElement, m.q("[data-c4-msg]"), "el foco no fue al mensaje");
  assert.match(m.q("[data-cejilla]").textContent, /SUBTEMA-E1/);
  // Un intento: ya no se puede cambiar.
  await m.clic(m.op("a"));
  assert.equal(m.fig(), "b");
  await m.desmontar();
}));

test("Hacer · la cifra cambia la figura con cada número; «Iba aquí: $100»; puntaje y detalle del primer intento", conReloj(async () => {
  const fin = [];
  const m = await montar("hacer", { onCompletar: (...a) => fin.push(a) });
  assert.equal(m.q("[data-cejilla]").textContent, "", "el subtema salió antes del veredicto");
  await m.clic(m.op("a"));
  await m.pasar(380);
  assert.ok(m.op("a").classList.contains("bien"));
  assert.equal(m.qq('[data-pastilla="revelada"]').length, 0);
  await m.clic(m.boton("Siguiente ítem"));
  assert.equal(document.activeElement, m.q("[data-texto]"));
  assert.equal(m.q("[data-item]").dataset.item, "k1");
  await m.escribir("9");
  assert.equal(m.fig(), 9);
  await m.escribir("90");
  assert.equal(m.fig(), 90);
  assert.equal(m.q("[data-falla]"), null, "la falla de la cifra salió antes de comprobar");
  await m.clic(m.q('[data-accion="comprobar"]'));
  assert.equal(m.q("[data-mensaje]"), null);
  await m.pasar(380);
  assert.equal(m.q('[data-escrito="tuya"] [data-pastilla]').dataset.pastilla, "tachada");
  assert.equal(m.q('[data-escrito="iba"] [data-pastilla]').textContent, "Iba aquí: $100");
  assert.equal(m.q("[data-falla]").textContent, "FALLA-90");
  assert.equal(m.q(".c4-casilla"), null);
  await m.clic(m.boton("Ver mi resumen"));
  assert.equal(fin.length, 1);
  assert.equal(fin[0][0], 50);
  assert.deepEqual(fin[0][2].map((d) => [d.item, d.ok, d.respuesta]), [["e1", true, null], ["k1", false, 90]]);
  await m.desmontar();
}));

test("Movimiento reducido · el veredicto llega en el mismo toque y nada se anima", conReloj(async () => {
  REDUCIDO = true;
  const m = await montar("hacer");
  await m.clic(m.op("c"));
  assert.equal(m.fig(), "c");
  assert.equal(m.q("[data-figura]").dataset.anim, undefined);
  assert.ok(m.op("c").classList.contains("mal"));
  assert.equal(m.q("[data-falla]").textContent, "FALLA-c");
  await m.desmontar();
}));

/* ═══════════ APRENDER ═══════════ */

test("Aprender · escalera C2: la pista, luego la devolución y la correcta en blanco; nunca «Iba aquí»", conReloj(async () => {
  const m = await montar("aprender");
  assert.equal(m.q("[data-objetivo]"), null);
  assert.equal(m.q("[data-cejilla]").textContent, "Pregunta 1 de 2");
  const seguir = () => m.q(".c4-seguir");
  assert.equal(seguir().getAttribute("aria-disabled"), "true");
  await m.clic(m.op("b"));
  assert.equal(m.fig(), "b");
  assert.equal(m.q("[data-mensaje]"), null);
  await m.pasar(380);
  assert.match(m.q("[data-mensaje]").textContent, /PISTA-E1/);
  assert.doesNotMatch(m.q("[data-mensaje]").textContent, /MSG-B/);
  assert.equal(m.q("[data-falla]").textContent, "FALLA-b");
  assert.ok(!m.op("a").classList.contains("pista"));
  assert.equal(document.activeElement, m.q("[data-c4-msg]"));
  await m.clic(m.op("c"));
  assert.equal(m.fig(), "c", "en Aprender se vuelve a intentar");
  await m.pasar(380);
  assert.match(m.q("[data-mensaje]").textContent, /MSG-C/);
  assert.ok(m.op("a").classList.contains("pista"), "la correcta no quedó en blanco");
  assert.equal(m.op("a").querySelector("[data-pastilla]"), null);
  assert.doesNotMatch(m.caja.textContent, /Iba aquí/);
  assert.equal(seguir().getAttribute("aria-disabled"), "true");
  await m.clic(m.op("a"));
  await m.pasar(380);
  assert.ok(m.op("a").classList.contains("bien"));
  assert.match(m.q("[data-mensaje]").textContent, /BIEN-E1/);
  await m.clic(m.q(".c4-porque"));
  assert.equal(document.activeElement, m.q("[data-porque]"));
  assert.equal(seguir().getAttribute("aria-disabled"), "false");
  await m.clic(seguir());
  assert.equal(document.activeElement, m.q("[data-texto]"));
  // La cifra en Aprender: dos errores y la correcta en blanco, sin «Iba aquí».
  for (const x of ["90", "80"]) { await m.escribir(x); await m.clic(m.q('[data-accion="comprobar"]')); await m.pasar(380); }
  assert.equal(m.q('[data-escrito="pista"]').textContent, "$100");
  assert.equal(m.q('[data-escrito="iba"]'), null);
  assert.doesNotMatch(m.caja.textContent, /Iba aquí/);
  assert.ok(m.q(".c4-casilla"), "en Aprender la casilla sigue abierta");
  await m.desmontar();
}));

/* ═══════════ MEDIDAS DEL CSS ═══════════ */

test("44 px y 12 px · cada botón del motor mide 44 de alto y ninguna letra baja de 12", () => {
  const css = M.CSS_C4;
  for (const c of ["c4-op", "c4-boton", "c4-porque", "c4-seguir"]) {
    const r = new RegExp(`\\.${c} \\{([^}]*)\\}`).exec(css);
    assert.ok(r, `sin regla .${c}`);
    assert.match(r[1], /min-height: 44px/, `.${c} sin 44 px`);
  }
  assert.match(/\.c4-casilla input \{([^}]*)\}/.exec(css)[1], /min-height: 44px/);
  const tamanos = [...css.matchAll(/font-size: (\d+)px|font: (?:\d{3} )?(\d+)px/g)].map((x) => Number(x[1] ?? x[2]));
  assert.ok(tamanos.length >= 8);
  assert.deepEqual(tamanos.filter((n) => n < 12), []);
  assert.match(css, /prefers-reduced-motion: reduce/);
});

/* ═══════════ EL ESTADO PURO ═══════════ */

test("leerC4 y fmtC4 · pesos, factor y porcentaje", () => {
  const pesos = ITEMS[1];
  assert.equal(M.leerC4(pesos, "$1.955.000"), 1955000);
  assert.equal(M.leerC4(pesos, ""), null);
  const factor = { formato: "factor", opciones: [] };
  assert.equal(M.leerC4(factor, "0,8208"), 0.8208);
  assert.equal(M.fmtC4(factor, 0.8208), "0,8208");
  assert.equal(M.fmtC4({ formato: "porcentaje", opciones: [] }, 17.92), "17,92 %");
  assert.equal(M.fmtC4(pesos, 1955000), "$1.955.000");
});
