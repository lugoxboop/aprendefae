import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";


const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
let reducido = true;
w.matchMedia = (q) => ({ matches: q.includes("reduce") && reducido, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
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
const { decidir } = await import("./b5-capa3.mjs");
const T6A1 = await import("../../data/contabilidadT6Pieza1.js");
const T6A2 = await import("../../data/contabilidadT6Pieza2.js");
const T6A4 = await import("../../data/contabilidadT6Pieza4.js");
const T6A5 = await import("../../data/contabilidadT6Pieza5.js");
const { pegarPorcentaje } = await import("../t6Pieza5.js");
const C = async (ruta) => (await import(`../../components/mecanicas/libros/${ruta}.jsx`)).default;

/*
 * Lote 27 · D4 de Shoko en la capa 3 de T6 · A1, A2, A4 y A5: lo que elige el estudiante por error se dibuja
 * en el modelo como fantasma (tachado, borde coral discontinuo), donde dijo su opción, y se queda junto a lo
 * correcto cuando la caja se cierra.
 */
const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { assert.ok(el, "no hay nada que tocar"); await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const zonaDe = (caja, id) => caja.querySelector(`[data-hecho="${id}"]`);
const esFantasma = (el) => /dashed/.test(el.style.border) && el.style.textDecoration.includes("line-through");

test("★★★ T6 · A1: el hecho entra en la T por el lado que eligió, aunque esté mal; al cerrarse, también por el correcto", async () => {
  const x = T6A1.HECHOS_T6.find((h) => h.correcta === "sube");
  const { caja, desmontar } = await montar(h(await C("tema6/SeisHechos")));
  await decidir(tocar, zonaDe(caja, x.id), "baja");
  const f = caja.querySelector(`[data-figura="t6-a1"] [data-columna="haber"] [data-fantasma="${x.id}"]`);
  assert.ok(f && esFantasma(f), "en el HABER, como fantasma");
  assert.equal(f.textContent, x.corto);
  assert.ok(!caja.querySelector(`[data-figura="t6-a1"] [data-entrada="${x.id}"]`), "C2: lo correcto aún no");
  await tocar(zonaDe(caja, x.id).querySelector('[data-opcion="sube"]'));
  assert.ok(caja.querySelector(`[data-figura="t6-a1"] [data-columna="debe"] [data-entrada="${x.id}"]`), "se corrige: entra al DEBE");
  assert.ok(caja.querySelector(`[data-figura="t6-a1"] [data-columna="haber"] [data-fantasma="${x.id}"]`), "y el fantasma se queda");
  desmontar();
});

test("★★★ T6 · A1: si elige «no cambia» por error, el fantasma va en «Sin movimiento:»", async () => {
  const x = T6A1.HECHOS_T6.find((h) => h.correcta === "sube");
  const quieto = T6A1.OPCIONES_CAPA_3_T6.find((o) => o.id !== "sube" && o.id !== "baja").id;
  const { caja, desmontar } = await montar(h(await C("tema6/SeisHechos")));
  await decidir(tocar, zonaDe(caja, x.id), quieto);
  assert.ok(caja.querySelector(`[data-figura="t6-a1"] [data-sin-movimiento] [data-fantasma="${x.id}"]`));
  desmontar();
});

test("★★★ T6 · A2: la celda de la columna que eligió se marca en la rejilla con el gasto, como fantasma", async () => {
  const m = T6A2.METODOS_T6_A2.find((y) => y.correcta === "dia-castigo");
  const { caja, desmontar } = await montar(h(await C("tema6/DosMetodos")));
  await decidir(tocar, zonaDe(caja, m.id), "cierre");
  const f = caja.querySelector(`[data-figura="t6-a2"] [data-fila="${m.id}"] [data-celda="cierre"] [data-fantasma]`);
  assert.ok(f && esFantasma(f));
  assert.equal(f.textContent, T6A2.FIGURA_CAPA_3_T6_A2.gasto);
  await tocar(zonaDe(caja, m.id).querySelector('[data-opcion="dia-castigo"]'));
  assert.ok(caja.querySelector(`[data-figura="t6-a2"] [data-fila="${m.id}"] [data-celda="castigo"] [data-entrada]`), "se corrige");
  assert.ok(caja.querySelector(`[data-figura="t6-a2"] [data-fila="${m.id}"] [data-celda="cierre"] [data-fantasma]`), "el fantasma se queda");
  desmontar();
});

test("★★★ T6 · A4: la cifra elegida queda escrita en la celda «Se revive», como fantasma, junto a la correcta", async () => {
  const c = T6A4.CASOS_T6_A4.find((y) => !y.ejemplo);
  const mala = T6A4.OPCIONES_CAPA_3_T6_A4.find((o) => o.id !== c.correcta);
  const { caja, desmontar } = await montar(h(await C("tema6/TresCasos")));
  await decidir(tocar, zonaDe(caja, c.id), mala.id);
  const celda = () => caja.querySelector(`[data-tablero] [data-fila="${c.id}"] [data-celda="revive"]`);
  assert.equal(celda().querySelector("[data-fantasma]").textContent, mala.texto);
  assert.ok(esFantasma(celda().querySelector("[data-fantasma]")));
  await tocar(zonaDe(caja, c.id).querySelector(`[data-opcion="${c.correcta}"]`));
  assert.ok(celda().textContent.startsWith(c.revive), "la correcta");
  assert.equal(celda().querySelector("[data-fantasma]").textContent, mala.texto, "junto a la elegida");
  assert.ok(!caja.querySelector(`[data-tablero] [data-fila="a"] [data-fantasma]`), "el ejemplo no lleva fantasma");
  desmontar();
});

test("★★★ T6 · A5: lo elegido entra a la fila de su grupo, como fantasma", async () => {
  const g = T6A5.GRUPOS_T6_A5[1];
  const mala = g.opciones.find((o) => o.id !== g.correcta);
  const { caja, desmontar } = await montar(h(await C("tema6/CuatroGrupos")));
  await decidir(tocar, zonaDe(caja, g.id), mala.id);
  const f = caja.querySelector(`[data-tablero] [data-fila="${g.id}"] [data-fantasma]`);
  assert.ok(f && esFantasma(f));
  assert.equal(f.textContent, pegarPorcentaje(mala.texto));
  desmontar();
});
