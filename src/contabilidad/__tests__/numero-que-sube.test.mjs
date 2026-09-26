import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL NÚMERO QUE SUBE, CUANDO NADIE LO ESTÁ MIRANDO.
 *
 * Los totales de medio tema cuentan hacia arriba con requestAnimationFrame: el
 * subtotal del balance, el saldo de la cuenta, los colectores del asiento
 * compuesto. Y el navegador NO llama a requestAnimationFrame mientras la
 * página está oculta.
 *
 * Eso salió mirándolo, no leyéndolo: con el panel del navegador tapado, el
 * colector marcaba $0 con los cuatro valores escritos y el conector cerrado.
 * En un teléfono es el estudiante que se va a WhatsApp y vuelve.
 *
 * Aquí se simula exactamente eso —un rAF que NO dispara nunca— y se exige que
 * el número acabe en su sitio igual.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
/* La página está oculta: se piden fotogramas y no llega ninguno. */
let pedidos = 0;
w.requestAnimationFrame = () => { pedidos += 1; return pedidos; };
w.cancelAnimationFrame = () => {};
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
const { useNumeroQueSube } = await import("../../components/mecanicas/libros/verbos.jsx");

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

function Contador({ valor, ms }) {
  const visible = useNumeroQueSube(valor, ms);
  return React.createElement("span", { "data-n": String(visible) }, String(visible));
}

test("★★ con la página oculta el número acaba en su sitio, sin un solo fotograma", async () => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);

  act(() => raiz.render(React.createElement(Contador, { valor: 0, ms: 60 })));
  assert.equal(caja.querySelector("[data-n]").getAttribute("data-n"), "0");

  const antes = pedidos;
  act(() => raiz.render(React.createElement(Contador, { valor: 10000, ms: 60 })));
  assert.ok(pedidos > antes, "ni siquiera pidió el fotograma: la animación no existe");
  /* Ninguno de los fotogramas pedidos va a llegar nunca. */
  assert.equal(caja.querySelector("[data-n]").getAttribute("data-n"), "0", "llegó a pintar sin fotograma");

  await act(async () => { await esperar(160); });
  assert.equal(
    caja.querySelector("[data-n]").getAttribute("data-n"), "10000",
    "el número se quedó congelado cuando la página estaba oculta",
  );

  act(() => raiz.unmount());
  caja.remove();
});

test("★ y un cambio posterior también llega, no solo el primero", async () => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);

  act(() => raiz.render(React.createElement(Contador, { valor: 0, ms: 60 })));
  act(() => raiz.render(React.createElement(Contador, { valor: 500, ms: 60 })));
  await act(async () => { await esperar(160); });
  assert.equal(caja.querySelector("[data-n]").getAttribute("data-n"), "500");

  act(() => raiz.render(React.createElement(Contador, { valor: 1200, ms: 60 })));
  await act(async () => { await esperar(160); });
  assert.equal(caja.querySelector("[data-n]").getAttribute("data-n"), "1200");

  act(() => raiz.unmount());
  caja.remove();
});
