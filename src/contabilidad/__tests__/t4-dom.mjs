/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · EL DOM DE PRUEBA DEL REDISEÑO (A0, A1 y H1). No es una prueba.
 *
 * Un jsdom con lo que piden las figuras del rediseño: requestAnimationFrame y
 * cancelAnimationFrame (el año que pasa y la cifra que cuenta), matchMedia
 * con movimiento reducido a elección, y getComputedStyle, que en jsdom lee
 * las hojas <style> (los colores del acierto se miran calculados, no en el
 * código). Se importa ANTES que React.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { JSDOM, VirtualConsole } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
export const w = dom.window;
let reducido = false;
export const movimientoReducido = (si) => { const antes = reducido; reducido = si; return antes; };
w.matchMedia = (q) => ({ matches: q.includes("reduce") ? reducido : false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (f) => setTimeout(() => f(performance.now()), 0);
w.cancelAnimationFrame = (id) => clearTimeout(id);
w.scrollTo = () => {};
const Observador = class { observe() {} unobserve() {} disconnect() {} };
w.ResizeObserver = Observador;
w.IntersectionObserver = Observador;
w.Element.prototype.scrollIntoView = () => {};
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent, PointerEvent: w.MouseEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  requestAnimationFrame: w.requestAnimationFrame, cancelAnimationFrame: w.cancelAnimationFrame,
  ResizeObserver: Observador, IntersectionObserver: Observador, scrollTo: w.scrollTo,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
export const act = React.act;
export const h = React.createElement;

export function montar(elemento) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(elemento));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}
/*
 * El botón de avance y «Comprobar» son el Responder compartido dentro de un
 * envoltorio con `data-boton` (Responder no acepta atributos: P2 de Hanayama,
 * §3.4). Tocar el envoltorio es tocar su botón, como en el navegador.
 */
const objetivo = (el) => (el?.matches?.("[data-avance-t4]") ? el.querySelector("button") ?? el : el);
export const tocar = (el) => act(() => { objetivo(el).dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
export const tecla = (el, key) => act(() => { el.dispatchEvent(new w.KeyboardEvent("keydown", { key, bubbles: true })); });
export const esperar = (ms) => act(async () => { await new Promise((r) => setTimeout(r, ms)); });

/* Teal y ámbar de Contabilidad (debe y haber), y coral (error), como salen calculados. */
/* Con #3FA69A, el teal de TEXTO de «Debe» (prompt maestro §5.2), y el teal del Responder, que se mira aparte (es el botón, no el acierto). */
export const TEAL_AMBAR = /rgb\(42, 157, 143\)|rgb\(233, 196, 106\)|rgb\(47, 168, 160\)|rgb\(63, 166, 154\)|rgba\(42, 157, 143|rgba\(233, 196, 106/;
export const CORAL = /rgb\(231, 111, 81\)|rgba\(231, 111, 81/;
const PROPS = ["color", "border-top-color", "border-right-color", "border-bottom-color", "border-left-color", "background-color", "background", "box-shadow", "outline-color", "fill", "stroke"];
export const estilo = (el) => { const c = w.getComputedStyle(el); return [el.getAttribute("style") ?? "", ...PROPS.map((k) => c.getPropertyValue(k))].join(" | "); };
/* Los elementos de un subárbol que llevan un color (calculado o en línea). */
export const conColor = (raiz, re) => [raiz, ...raiz.querySelectorAll("*")].filter((e) => re.test(estilo(e)));
/* El texto visible, sin lo que es solo para el lector de pantalla. */
export const visible = (el) => {
  const c = el.cloneNode(true);
  c.querySelectorAll(".t4f-sr, figcaption, style").forEach((x) => x.remove());
  return c.textContent.replace(/\s+/g, " ").trim();
};
