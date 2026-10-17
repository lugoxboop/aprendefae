import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * Lote 20 · D9: el elemento propio de b5-t5-a2 («Precio por título») y de b5-t6-a3 (la deuda por casos),
 * como hijo opcional de la mesa (`elementoPropio`): entra al confirmar, siempre con lo correcto (R10).
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
beforeEach(() => w.localStorage.clear());

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const { renderToStaticMarkup } = await import("react-dom/server");
const act = React.act;
const h = React.createElement;
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const { FAE } = await import("../../theme.js");
const { default: PrecioPorTitulo } = await import("../../components/mecanicas/libros/tema5/PrecioPorTitulo.jsx");
const { estadosDeLaDeuda } = await import("../../components/mecanicas/libros/tema6/DeudaPorCasos.jsx");
const { default: DeudaQueVuelve, CONFIG_V2_T6_ACT3 } = await import("../../components/mecanicas/libros/tema6/DeudaQueVuelve.jsx");
const { default: CierreSantaPacha } = await import("../../components/mecanicas/libros/tema5/CierreSantaPacha.jsx");
const { CONFIG_T6_ACT2 } = await import("../../components/mecanicas/libros/tema6/ProvisionDeElTorito.jsx");
const T5 = await import("../../data/contabilidadT5Act2.js");
const T6 = await import("../../data/contabilidadT6Act3.js");
const S = await import("../../data/b5SegundaVuelta.js");

const pagina = (s) => { const d = document.createElement("div"); d.innerHTML = s; return d; };
const montar = async (Juego) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(Juego, { Marco: MarcoLibros, rotulo: "P", titulo: "P", acento: FAE.ambar, onCompletar: () => {} })); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};

test("★★★ la deuda por casos: los estados de la tabla de Mai, asiento por asiento", () => {
  const miles = (c) => Object.fromEntries(Object.entries(c).map(([k, v]) => [k, v / 1000]));
  const fila = (n) => Object.fromEntries(Object.entries(estadosDeLaDeuda(T6.PARTES_T6_ACT3, n, 180000).casos).map(([k, c]) => [k, miles(c)]));
  const C = (pagada, revivida, castigada) => ({ pagada, revivida, castigada });
  assert.deepEqual(fila(0), { "Caso a": C(0, 0, 180), "Caso b": C(0, 0, 180), "Caso c": C(0, 0, 180) });
  assert.deepEqual(fila(1)["Caso a"], C(0, 180, 0));
  assert.deepEqual(fila(2)["Caso a"], C(180, 0, 0));
  assert.deepEqual(fila(3)["Caso b"], C(0, 180, 0));
  assert.deepEqual(fila(4)["Caso b"], C(100, 80, 0));
  assert.deepEqual(fila(5), { "Caso a": C(180, 0, 0), "Caso b": C(100, 80, 0), "Caso c": C(0, 100, 80) });
  assert.equal(estadosDeLaDeuda(T6.PARTES_T6_ACT3, 4, 180000).ultimo, "Caso b", "se resalta la barra del último asiento");
});

test("★★★ la deuda por casos se ve desde el ejemplo resuelto, con las tres castigadas; la variante nombra a Hernán Ríos", async () => {
  const { caja, desmontar } = await montar(DeudaQueVuelve);
  const el = caja.querySelector("[data-ejemplo-resuelto] [data-deuda-por-casos]");
  assert.ok(el, "en el ejemplo resuelto");
  assert.equal(el.querySelector("p").textContent, T6.DEUDA_T6_ACT3.titulo);
  assert.equal(el.querySelectorAll("[data-caso]").length, 3);
  assert.ok([...el.querySelectorAll("[data-tramo]")].every((t) => t.dataset.tramo === "castigada"));
  desmontar();
  assert.equal(S.DEUDA_V2_T6_ACT3.titulo, "La deuda de Hernán Ríos");
  assert.ok(CONFIG_V2_T6_ACT3.elementoPropio);
});

test("★★★ «Precio por título»: solo en las ventas; ganancia arriba del costo, pérdida abajo; la escala de Mai", () => {
  assert.equal(renderToStaticMarkup(h(PrecioPorTitulo, { actual: T5.PARTES_T5_ACT2[0] })), "", "en los intereses no aparece");
  assert.equal(renderToStaticMarkup(h(PrecioPorTitulo, { actual: null })), "", "antes de confirmar no está");
  const gana = pagina(renderToStaticMarkup(h(PrecioPorTitulo, { actual: T5.PARTES_T5_ACT2[1] })));
  assert.equal(gana.querySelector("[data-precio-por-titulo]").dataset.resultado, "ganancia");
  assert.equal(gana.querySelector("[data-palabra-zona]").textContent, T5.PRECIO_T5_ACT2.ganancia);
  assert.equal(gana.querySelector("[data-precio-por-titulo]").getAttribute("aria-label"), "Precio por título: costó $800 y se vende a $920; ganancia");
  const izq = (n, sel) => parseFloat(n.querySelector(sel).style.left);
  assert.ok(Math.abs(izq(gana, "[data-costo]") - 33.33) < 0.01);
  assert.ok(Math.abs(izq(gana, "[data-venta]") - 73.33) < 0.01);
  const pierde = pagina(renderToStaticMarkup(h(PrecioPorTitulo, { actual: T5.PARTES_T5_ACT2[3] })));
  assert.equal(pierde.querySelector("[data-precio-por-titulo]").dataset.resultado, "perdida");
  assert.ok(Math.abs(izq(pierde, "[data-venta]") - 16.67) < 0.01);
  assert.deepEqual(S.PARTES_V2_T5_ACT2.filter((p) => p.precio).map((p) => [p.precio.costo, p.precio.venta]), [[950, 980], [950, 870]]);
});

test("★★ la mesa sin `elementoPropio` no cambia; en t5-a2, el ejemplo resuelto (la compra) no lo lleva", async () => {
  assert.equal(CONFIG_T6_ACT2.elementoPropio, undefined);
  const { caja, desmontar } = await montar(CierreSantaPacha);
  assert.ok(caja.querySelector("[data-ejemplo-resuelto]"));
  assert.ok(!caja.querySelector("[data-precio-por-titulo]"));
  desmontar();
});
