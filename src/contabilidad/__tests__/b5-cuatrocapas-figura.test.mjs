import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";
const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = (q) => ({ matches: q.includes("reduce"), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16);
w.cancelAnimationFrame = (id) => clearTimeout(id);
w.Element.prototype.scrollIntoView = () => {};
w.scrollBy = () => {};
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
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
const act = React.act;
const h = React.createElement;


/*
 * LOTE 7 · CUATROCAPAS COMPATIBLE (decisión (b) de Sakuta; compartido, lo avisa a Erwin).
 *   · capa 1: con `figuraAntesDelNombre`, la figura del término va antes de su nombre; sin él, después, como siempre;
 *   · capa 4: con `FiguraFinal`, el modelo final encima de la Capa4, que recibe `ponerLeyenda`; sin ella, la Capa4 no recibe nada.
 * Y su uso en T6 · A3: el tanque mínimo en tres términos y en la capa 4, con la frase buena como leyenda.
 */
const { default: CuatroCapas } = await import("../../components/mecanicas/maquinas/CuatroCapas.jsx");
const { ESCENAS_TEMA6 } = await import("../../components/mecanicas/libros/tema6/escenasTema6.jsx");
const { conFigurasCapa1 } = await import("../../components/mecanicas/libros/tema6/FigurasCapa1.jsx");
const D = await import("../../data/contabilidadT6Pieza3.js");

const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const click = async (el) => { assert.ok(el, "no hay nada que tocar"); await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const Nada = () => null;
const Fig = () => h("span", { "data-mi-figura": "" }, "fig");
const pieza = (flag) => ({
  id: "prueba", titulo: "Prueba", objetivo: "o",
  nombres: [{ termino: "Uno", definicion: "d1", figura: Fig, ...(flag ? { figuraAntesDelNombre: true } : {}) }, { termino: "Dos", definicion: "d2" }],
});
const orden = (caja) => {
  const carta = caja.querySelector("[data-termino='0']");
  const fig = carta.querySelector("[data-mi-figura]");
  const h4 = carta.querySelector("[data-nombre-termino]");
  return h4.compareDocumentPosition(fig) & 4 ? "después" : "antes";
};

test("★★★ compatible: sin `figuraAntesDelNombre` la figura sigue después del nombre; sin `FiguraFinal`, ni figura final ni props para la Capa4", async () => {
  let props = null;
  const Capa4 = (p) => { props = p; return null; };
  const { caja, desmontar } = await montar(h(CuatroCapas, { pieza: pieza(false), Capa2: Nada, Exploracion: Nada, Capa4 }));
  assert.equal(orden(caja), "después");
  assert.ok(!caja.querySelector("[data-figura-antes]"));
  assert.ok(!caja.querySelector("[data-figura-final]"));
  assert.deepEqual(props, {}, "la Capa4 se pinta como siempre, sin props");
  desmontar();
});

test("★★★ con `figuraAntesDelNombre`, la figura va antes del nombre", async () => {
  const { caja, desmontar } = await montar(h(CuatroCapas, { pieza: pieza(true), Capa2: Nada, Exploracion: Nada, Capa4: Nada }));
  assert.equal(orden(caja), "antes");
  assert.equal(caja.querySelectorAll("[data-termino='0'] [data-mi-figura]").length, 1, "una sola vez");
  desmontar();
});

test("★★★ T6 · A3, capa 1: cada término lleva su figura antes del nombre (lote 10)", () => {
  const n = conFigurasCapa1(D.PIEZA_LA_PROVISION).nombres;
  assert.deepEqual(n.map((x) => Boolean(x.figuraAntesDelNombre)), [true, true, true, true, true, true]);
  assert.deepEqual(n.map((x) => x.termino), D.PIEZA_LA_PROVISION.nombres.map((x) => x.termino), "los textos no cambian");
});

test("★★★ T6 · A3, capa 4: el tanque final encima de la pregunta; la frase buena queda como su leyenda y «Otra vez» la quita; una mala no pone nada", async () => {
  const E = ESCENAS_TEMA6[D.PIEZA_LA_PROVISION.id];
  const { caja, desmontar } = await montar(h(CuatroCapas, { pieza: D.PIEZA_LA_PROVISION, Capa2: Nada, Exploracion: Nada, Capa4: E.Capa4, FiguraFinal: E.FiguraFinal }));
  const final = caja.querySelector("[data-figura-final]");
  assert.ok(final.querySelector("[data-tanque]"), "el tanque final");
  assert.equal(final.querySelector("[data-tanque]").style.height, "100px", "tamaño mínimo");
  assert.ok(final.compareDocumentPosition(caja.querySelector("[data-una-frase]")) & 4, "encima de la pregunta");
  const mala = D.OPCIONES_FINAL_T6_A3.find((o) => !o.correcta);
  await click(caja.querySelector(`[data-una-frase] [data-opcion="${mala.id}"]`));
  assert.ok(!caja.querySelector("[data-leyenda]"));
  await click(caja.querySelector("[data-otra-vez]"));
  const buena = D.OPCIONES_FINAL_T6_A3.find((o) => o.correcta);
  await click(caja.querySelector(`[data-una-frase] [data-opcion="${buena.id}"]`));
  const ley = caja.querySelector("[data-figura-final] [data-leyenda]");
  assert.equal(ley.textContent, buena.texto);
  assert.equal(ley.style.fontSize, "13px");
  await click(caja.querySelector("[data-otra-vez]"));
  assert.ok(!caja.querySelector("[data-leyenda]"));
  desmontar();
});
