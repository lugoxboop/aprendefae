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
 * LOTE 11 · LA CAPA 2 DE T5 · A2, «LOS TÍTULOS DE SANTA PACHA» (P2 de Mai).
 * Vigila el estado por paso (desde los 21 de antes), los cinco gestos con su vía por toque o
 * teclado, lo que se ve (lotes, Caja, la comparación con la escala de cada venta), el color
 * por lado (ganancia ámbar, pérdida teal, coral nunca) y el recorrido entero con la parada.
 */
const D = await import("../../data/contabilidadT5Pieza2.js");
const E = await import("../t5Pieza2.js");
const { default: TresMomentos, estadoTitulos, PARADA_TITULOS } = await import("../../components/mecanicas/libros/tema5/TresMomentos.jsx");
const { hacerGesto } = await import("./b5-gestos.mjs");
const { FAE } = await import("../../theme.js");
const T = D.TITULOS_T5_A2;

const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const click = async (el) => { await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const sig = (caja) => caja.querySelector("[data-siguiente]");
const contador = (caja) => caja.querySelector("[data-paso-de]").textContent;
const siguiente = async (caja) => {
  await hacerGesto(sig(caja), act, w);
  await click(sig(caja));
  if (caja.querySelector("[data-parada]")) {
    await click(caja.querySelector(`[data-parada] [data-opcion="${D.PARADA_T5_A2.correcta}"]`));
    await click(sig(caja));
  }
};
const irA = async (caja, n) => {
  for (let k = 0; k < 30 && Number(contador(caja).match(/^Paso (\d+)/)?.[1] ?? 99) < n; k++) await siguiente(caja);
  assert.equal(contador(caja), `Paso ${n} de 14`);
};
const rgb = (hex) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ")})`;

test("★★★ los cinco gestos van con su paso de antes (3, 5, 9, 15, 19) y el estado sale de él", () => {
  assert.deepEqual(E.GESTOS_TITULOS, { 3: "bancos", 5: "agosto", 9: "vende75", 15: "noviembre", 19: "vendeResto" });
  const todos = new Set([3, 5, 9, 15, 19]);
  assert.deepEqual([2, 4, 6, 10, 12].map((n) => estadoTitulos(n).gesto), ["bancos", "agosto", "vende75", "noviembre", "vendeResto"]);
  const e6 = estadoTitulos(6, todos);
  assert.equal(e6.vendidos, 15);
  assert.equal(e6.estadoInversiones, "quedan");
  assert.equal(estadoTitulos(9, todos).comparacion.diferencia, true);
  assert.equal(estadoTitulos(9, todos).comparacion.venta, "agosto");
  const e12 = estadoTitulos(12, todos);
  assert.deepEqual([e12.vendidos, e12.estadoInversiones, e12.comparacion.venta, e12.hoy], [20, "sin", "noviembre", 2]);
  assert.equal(PARADA_TITULOS.antes, 11);
  assert.equal(PARADA_TITULOS.pista, D.PARADA_T5_A2.pista, "la escalera C2, con la pista de Futaba");
});

test("★★★ paso 1: «Bancos, $2.000.000» resaltado; Inversiones sin lotes; Caja sin filas; la línea de fechas en «1 de mayo»", async () => {
  const { caja, desmontar } = await montar(h(TresMomentos));
  assert.equal(caja.querySelector('[data-ficha="bancos"]').dataset.resaltado, "si");
  assert.equal(caja.querySelector("[data-lotes]").style.visibility, "hidden");
  assert.ok([...caja.querySelectorAll("[data-fila-caja]")].every((f) => f.style.visibility === "hidden"));
  assert.equal(caja.querySelector('[data-fecha="0"]').dataset.hoy, "si");
  desmontar();
});

test("★★★ los gestos: la ficha (toque), la fecha y el riel (role=slider, teclado); cada uno cambia el modelo", async () => {
  const { caja, desmontar } = await montar(h(TresMomentos));
  await irA(caja, 2);
  assert.equal(sig(caja).dataset.gestoPendiente, "bancos");
  assert.ok(caja.querySelector('[data-pista="bancos"]').textContent.includes(T.llevalo));
  const ficha = caja.querySelector('[data-ficha="bancos"]');
  assert.equal(ficha.getAttribute("aria-label"), T.nombreBancos);
  await click(ficha);
  assert.equal(caja.querySelector("[data-lotes]").style.visibility, "visible");
  assert.equal(caja.querySelector("[data-estado-inversiones]").textContent, T.estados.compra);
  await irA(caja, 4);
  const marca = caja.querySelector("[data-marca-fecha]");
  assert.equal(marca.getAttribute("role"), "slider");
  assert.equal(marca.getAttribute("aria-label"), T.nombreFecha);
  assert.equal(marca.getAttribute("aria-valuetext"), T.fechas[0]);
  await act(async () => { marca.dispatchEvent(new w.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })); });
  assert.equal(caja.querySelector('[data-fecha="1"]').dataset.hoy, "si");
  await irA(caja, 6);
  const riel = caja.querySelector("[data-riel-venta]");
  assert.equal(riel.getAttribute("role"), "slider");
  assert.equal(riel.getAttribute("aria-valuetext"), T.vende75);
  assert.equal(riel.getAttribute("aria-valuemax"), "15");
  await act(async () => { riel.dispatchEvent(new w.KeyboardEvent("keydown", { key: "End", bubbles: true })); });
  assert.equal(caja.querySelectorAll('[data-lote="vendido"]').length, 15);
  assert.equal(caja.querySelector("[data-estado-inversiones]").textContent, T.estados.quedan);
  desmontar();
});

test("★★★ la comparación de agosto: «Recibió $1.725.000» (87 % y 100 %) y la ganancia en ámbar; la de noviembre, la pérdida rayada en teal; coral nunca", async () => {
  const { caja, desmontar } = await montar(h(TresMomentos));
  await irA(caja, 9);
  const c = caja.querySelector("[data-comparacion]");
  assert.equal(c.dataset.comparacion, "agosto");
  const dif = c.querySelector("[data-diferencia]");
  assert.equal(dif.dataset.diferencia, "ganancia");
  assert.equal(dif.style.borderLeft, `2px solid ${rgb(FAE.ambar)}`);
  assert.ok(c.querySelector("[data-rotulo-diferencia]").textContent.includes(T.agosto.diferencia));
  assert.ok(c.textContent.includes(T.agosto.recibio) && c.textContent.includes(T.agosto.costaron));
  assert.equal(c.querySelector('[data-barra-comparacion="costaron"] div div').style.width, `${(1500000 / 1725000) * 100}%`);
  await irA(caja, 14);
  const c2 = caja.querySelector("[data-comparacion]");
  assert.equal(c2.dataset.comparacion, "noviembre");
  assert.equal(c2.querySelector("[data-diferencia]").dataset.diferencia, "perdida");
  assert.equal(c2.querySelector("[data-diferencia]").style.borderLeft, `2px solid ${rgb(FAE.teal)}`);
  assert.equal(caja.querySelector("[data-estado-inversiones]").textContent, T.estados.sin);
  assert.ok(!caja.querySelector("[data-escena-titulos]").innerHTML.toLowerCase().includes(FAE.coral.toLowerCase()));
  desmontar();
});

test("★★★ todo el recorrido: los 14 pasos, la parada (C2) y el cierre, sin avisos de React; Caja con sus cuatro filas", async () => {
  const avisos = [];
  const antes = console.error;
  console.error = (...a) => avisos.push(a.join(" "));
  try {
    const { caja, desmontar } = await montar(h(TresMomentos));
    let pasos = 0;
    for (let k = 0; k < 40 && !(sig(caja).disabled && !caja.querySelector("[data-parada]")); k++) { pasos++; await siguiente(caja); }
    assert.equal(pasos, 14);
    assert.equal(caja.querySelector("[data-texto-paso]").textContent, D.CIERRE_T5_A2.texto);
    assert.deepEqual([...caja.querySelectorAll("[data-fila-caja]")].map((f) => f.textContent), [
      `${T.filas.interesAgosto}${T.interes}`, `${T.filas.ventaAgosto}${T.venta}`, `${T.filas.interesNoviembre}${T.interes}`, `${T.filas.ventaNoviembre}${T.venta}`]);
    desmontar();
  } finally {
    console.error = antes;
  }
  assert.deepEqual(avisos, []);
});
