import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * Lote 21 · la capa 2 de T5 A1, T6 A1, T6 A2, T6 A4 y T6 A5 con un gesto por pieza (P2 de Mai): tocar la ficha
 * que nombra el paso; entra en su sitio del modelo. Anclado al texto del paso; «Siguiente» espera el gesto;
 * solo responde la ficha del paso; «Anterior» lo devuelve hecho; T6 A2 deja «Provisiones» vacía (R10).
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (cb) => setTimeout(() => cb(0), 0);
w.cancelAnimationFrame = (id) => clearTimeout(id);
w.Element.prototype.scrollIntoView = () => {};
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent, getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  requestAnimationFrame: w.requestAnimationFrame, cancelAnimationFrame: w.cancelAnimationFrame,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;
const { crearFichas } = await import("../fichaQueEntra.js");
const F = await import("../../data/fichasQueEntran.js");
const P1 = await import("../../data/contabilidadT6Pieza1.js");
const P2 = await import("../../data/contabilidadT6Pieza2.js");
const { PASOS_CAPA_2, CIERRE_CAPA_2 } = await import("../../data/contabilidadT5Pieza1.js");
const { T6_A5_JUNTO } = await import("../t6Pieza5.js");
const { default: DosMomentos } = await import("../../components/mecanicas/libros/tema6/DosMomentos.jsx");

const T6A1 = crearFichas([...P1.PASOS_T6, P1.CIERRE_T6], F.FICHAS_T6_A1);
const T6A2 = crearFichas([...P2.PASOS_T6_A2, P2.CIERRE_T6_A2], F.FICHAS_T6_A2);
const T5A1 = crearFichas([...PASOS_CAPA_2.map((texto) => ({ texto })), { texto: CIERRE_CAPA_2 }], F.FICHAS_T5_A1);
const T6A5 = crearFichas(T6_A5_JUNTO.TODOS, F.FICHAS_T6_A5);
const hechos = (...pasos) => new Set(pasos);

test("★★★ cada gesto se ancla al texto de un paso de main (los cinco modelos se arman)", async () => {
  for (const [n, d] of [["T5 A1", "../../components/mecanicas/libros/tema5/EfectivoDeSobra.jsx"], ["T6 A2", "../../components/mecanicas/libros/tema6/DosDias.jsx"],
    ["T6 A4", "../../components/mecanicas/libros/tema6/SiPaga.jsx"], ["T6 A5", "../../components/mecanicas/libros/tema6/LaTablaDelEjemplo.jsx"]]) {
    assert.ok((await import(d)).default, n);
  }
  assert.deepEqual(T6A1.gestos.map((g) => g.paso), [5, 7, 8]);
  assert.deepEqual(T5A1.gestos.map((g) => g.paso), [2, 3, 4, 6]);
  assert.deepEqual(T6A2.gestos.map((g) => g.paso), [8]);
  assert.deepEqual(T6A5.gestos.map((g) => g.paso), [4, 5, 6, 7]);
});

test("★★★ el estado: el gesto del paso espera; hecho, lo nuevo entra resaltado; un paso pasado ya está hecho", () => {
  const e5 = T6A1.estado(5);
  assert.equal(e5.gesto, "factura");
  assert.ok(!e5.sitios.debe, "antes del gesto, el sitio está vacío");
  assert.deepEqual(e5.fichas.filter((f) => f.activa).map((f) => f.id), ["factura"], "solo responde la ficha del paso");
  const hecho = T6A1.estado(5, hechos(5));
  assert.equal(hecho.gesto, null);
  assert.deepEqual(hecho.sitios.debe, { texto: ["$1.350.000", "10 de enero"], nuevo: true });
  assert.ok(!hecho.fichas.some((f) => f.id === "factura"), "la ficha sale de su origen");
  assert.equal(T6A1.estado(6).sitios.debe.nuevo, false, "en el paso siguiente ya no se resalta");
  assert.equal(T6A1.estado(8).fichas.find((f) => f.id === "movDebe").activa, true, "el movimiento del DEBE se toca en la T");
  assert.ok(T6A1.estado(9).sitios.debe && T6A1.estado(9).sitios.haber, "el DEBE se queda y el HABER entra");
  /* T5 A1: el efectivo se vuelve tres fichas. */
  assert.deepEqual(T5A1.estado(2, hechos(2)).fichas.map((f) => f.id), ["cdt", "acciones", "participacion"]);
  assert.equal(T5A1.estado(7).sitios.descuento.texto, "Títulos de participación");
});

test("★★★ T6 A2: el gasto entra en «Anulación directa · Al castigar», «Nada» al cerrar en el cierre, y «Provisiones» queda vacía (R10)", () => {
  const cierre = T6A2.estado(99);
  assert.deepEqual(cierre.sitios.directaCastigar.texto, ["Gasto", "$312.500"]);
  assert.equal(cierre.sitios.directaCerrar.texto, "Nada");
  assert.ok(!cierre.sitios.provCerrar && !cierre.sitios.provCastigar);
  assert.ok(F.FICHAS_T6_A2.modelo.celdas.filter((c) => c.id?.startsWith("prov")).every((c) => c.tenue));
});

test("★★★ T6 A5: las filas son las fichas; cada grupo entra con su provisión y el total entra solo", () => {
  assert.deepEqual(T6A5.estado(4).fichas.filter((f) => f.activa).map((f) => f.id), ["g1"]);
  const fin = T6A5.estado(99);
  assert.deepEqual(["v1", "v2", "v3", "v4", "tRotulo", "tValor"].map((k) => [].concat(fin.sitios[k].texto).join(" · ")), ["— · $0", "5\u00A0% · $17.000", "10\u00A0% · $36.000", "15\u00A0% · $21.000", "Total", "$74.000"]);
  assert.equal(T6A5.estado(1).modeloVisible, false, "el tablero aparece con las deudas agrupadas");
});

test("★★★ montada (T6 A1): «Siguiente» espera la ficha resaltada; tocar otra no hace nada; la ficha entra y «Anterior» la devuelve hecha", async () => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(DosMomentos)); });
  const sig = () => caja.querySelector("[data-siguiente]");
  const tocar = async (el) => act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
  for (let p = 1; p < 5; p++) await tocar(sig());
  assert.equal(sig().dataset.gestoPendiente, "factura");
  assert.equal(sig().getAttribute("aria-disabled"), "true");
  assert.equal(caja.querySelector("[data-pista-gesto]").textContent, F.PISTA_FICHA);
  await tocar(sig());
  assert.equal(caja.querySelector("[data-paso-de]").textContent, "Paso 5 de 9", "sin el gesto no se pasa");
  const activa = caja.querySelector('[data-ficha-entra][data-activa="si"]');
  assert.equal(activa.textContent, "Factura $1.350.000");
  assert.ok(parseFloat(activa.style.minHeight) >= 44);
  await tocar(activa);
  assert.equal(caja.querySelector('[data-sitio="debe"]').dataset.nuevo, "si");
  assert.ok(!sig().hasAttribute("data-gesto-pendiente"));
  await tocar(sig());
  await tocar(caja.querySelector("[data-anterior]"));
  assert.equal(caja.querySelector('[data-sitio="debe"]').textContent, "$1.350.00010 de enero", "«Anterior»: el paso aparece ya hecho");
  act(() => raiz.unmount());
  caja.remove();
});
