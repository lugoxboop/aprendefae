import assert from "node:assert/strict";
import { mock } from "node:test";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * Ayudante de las pruebas C4 de T7-1 (t7-1-*-c4.test.mjs). No es una prueba:
 * monta una pieza del motor C4 en jsdom, la toca, escribe cifras y pasa el
 * reloj (mock.timers) para ver la consecuencia ANTES del veredicto y el
 * veredicto a los 380 ms.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
export const ESTADO = { reducido: false };
w.matchMedia = (q) => ({ matches: ESTADO.reducido && /prefers-reduced-motion: reduce/.test(q), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.Element.prototype.scrollIntoView = () => {};
w.requestAnimationFrame = (f) => setTimeout(f, 0);
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage, HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  HTMLInputElement: w.HTMLInputElement, Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent, FocusEvent: w.FocusEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia, requestAnimationFrame: w.requestAnimationFrame,
})) Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
export const act = React.act;
export const h = React.createElement;
export const ventana = w;

export const RAIZ = new URL("../../../", import.meta.url);
export const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");

/* El Marco de prueba: una sección (como el Panel), con el rótulo y el título. */
export const Marco = ({ rotulo, titulo, children }) => h("section", { "data-marco": true }, rotulo && h("p", { "data-rotulo": true }, rotulo), titulo && h("h3", null, titulo), children);

export async function montar(Componente, props = {}) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const fin = [];
  await act(async () => { raiz.render(h(Componente, { Marco, rotulo: "R", onCompletar: (...a) => fin.push(a), onComoSeJuega: () => {}, ...props })); });
  const q = (s) => caja.querySelector(s);
  const qq = (s) => [...caja.querySelectorAll(s)];
  const clic = async (el, que = "") => { assert.ok(el, `no está lo que se iba a tocar ${que}`); await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
  const escribir = async (texto) => {
    const inp = q(".c4-casilla input");
    assert.ok(inp, "no está la casilla");
    await act(async () => { Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set.call(inp, texto); inp.dispatchEvent(new w.Event("input", { bubbles: true })); });
  };
  const pasar = async (ms) => { await act(async () => { mock.timers.tick(ms); }); };
  const op = (id) => q(`[data-op="${CSS.escape(String(id))}"]`);
  const boton = (texto) => qq("button").find((b) => b.textContent.trim() === texto);
  const item = () => q("[data-item]")?.dataset.item;
  const figura = () => q("[data-figura]")?.textContent ?? "";
  const mensaje = () => q("[data-mensaje]");
  const falla = () => q("[data-falla]")?.textContent ?? null;
  return { caja, fin, q, qq, clic, escribir, pasar, op, boton, item, figura, mensaje, falla, desmontar: async () => { await act(async () => raiz.unmount()); caja.remove(); } };
}

export const conReloj = (fn) => async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try { await fn(); } finally { mock.timers.reset(); ESTADO.reducido = false; }
};

/* jsdom no trae CSS.escape. */
const CSS = globalThis.CSS ?? { escape: (s) => s.replace(/["\\]/g, "\\$&") };

/*
 * Responde el ítem en curso con una opción (id) o una cifra (v): comprueba la
 * regla C4 en pantalla —la figura cambia ANTES del veredicto, sin mensaje ni
 * falla— y pasa los 380 ms. Devuelve lo que se vio.
 */
export async function responder(m, I, o) {
  const antes = m.figura();
  if ((I.tipo ?? "eleccion") === "cifra") {
    await m.escribir(String(o.v));
    assert.notEqual(m.figura(), antes, `${I.id} · ${o.id}: la cifra escrita no cambió la figura`);
    await m.clic(m.q('[data-accion="comprobar"]'), "comprobar");
  } else {
    await m.clic(m.op(o.id), `${I.id} · ${o.id}`);
    assert.notEqual(m.figura(), antes, `${I.id} · ${o.id}: tocar no cambió la figura`);
  }
  const consecuencia = m.figura();
  const html = m.q("[data-figura]").innerHTML;
  assert.ok(m.mensaje() == null, `${I.id} · ${o.id}: el veredicto llegó con la consecuencia`);
  assert.equal(m.falla(), null, `${I.id} · ${o.id}: la falla salió antes del veredicto`);
  await m.pasar(379);
  assert.ok(m.mensaje() == null, `${I.id} · ${o.id}: el veredicto llegó antes de 380 ms`);
  await m.pasar(1);
  assert.ok(m.mensaje(), `${I.id} · ${o.id}: sin veredicto a los 380 ms`);
  assert.ok(document.activeElement === m.q("[data-c4-msg]"), `${I.id} · ${o.id}: el foco no fue al mensaje`);
  return { antes, consecuencia, html };
}

/* Lo que dice el mensaje del motor, sin la palabra del lector. */
export const textoMensaje = (m) => m.q("[data-mensaje] [data-texto-retro]")?.textContent ?? null;

/* El CSS de un fuente: sus `CSS_… = \`…\``. Las clases que pintan botones o letra: 44 px y 12 px. */
export function medidasCss(fuente, botones = []) {
  const css = [...fuente.matchAll(/CSS_\w+ = `([^`]*)`/g)].map((x) => x[1]).join("\n");
  assert.ok(css.length > 100, "no encontré el CSS");
  for (const c of botones) {
    const r = new RegExp(`\\.${c.replace(/\./g, "\\.")} \\{([^}]*)\\}`).exec(css);
    assert.ok(r, `sin regla .${c}`);
    assert.match(r[1], /min-height: 44px/, `.${c} sin 44 px`);
  }
  const tamanos = [...css.matchAll(/font-size: (\d+)px|font: (?:\d{3} )?(\d+)px/g)].map((x) => Number(x[1] ?? x[2]));
  assert.deepEqual(tamanos.filter((n) => n < 12), [], "letra de menos de 12 px");
  assert.doesNotMatch(css, /#2A9D8F|#E9C46A|teal|ambar|ámbar/i, "teal o ámbar en la figura");
}

/*
 * C4 en pantalla, opción por opción: monta la pieza con un solo ítem, toca (o
 * escribe) cada opción y comprueba que la figura cambia antes del veredicto y
 * que cada opción pinta algo distinto (el marcado de la figura: dos
 * controles de la misma zona difieren en cuál se instaló). `revisar(m, I, o)`
 * mira lo propio.
 */
export async function cadaOpcion(Componente, items, revisar = null, props = {}) {
  for (const I of items) {
    const vistas = new Set();
    for (const o of I.opciones) {
      const m = await montar(Componente, { items: [I], ...props });
      try {
        const r = await responder(m, I, o);
        vistas.add(r.html);
        await revisar?.(m, I, o, r);
      } finally { await m.desmontar(); }
    }
    assert.equal(vistas.size, I.opciones.length, `${I.id}: dos opciones pintan lo mismo`);
  }
}

/* C4-7 (Mello): los botones de avance de Hacer del motor, «Siguiente caso» y «Ver mi resumen». */
export const { BOTONES_C4 } = await import("../../components/mecanicas/libros/t7/decisionC4.jsx");
