import { test, beforeEach } from "node:test";
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
beforeEach(() => { try { window.localStorage.clear(); } catch { /* sin almacenamiento */ } });

/*
 * Lote 28 · D8 en T6 A2, A4 y A5 (Aprender), que no tienen pregunta de antes de C1: desde la segunda
 * visita (fae-b5-vueltas:aprender:<id> ≥ 1), la capa 3 cambia el orden de sus cajas y el de las opciones de
 * cada caja, una vez por intento, como la Célula C en #449. Sin texto nuevo. La capa 4 (UnaFrase) ya baraja.
 */
const C = async (ruta) => (await import(`../../components/mecanicas/libros/${ruta}.jsx`)).default;
const D2 = await import("../../data/contabilidadT6Pieza2.js");
const D4 = await import("../../data/contabilidadT6Pieza4.js");
const D5 = await import("../../data/contabilidadT6Pieza5.js");
const { pegarPorcentaje } = await import("../t6Pieza5.js");

const PIEZAS = [
  { n: "T6 · A2", id: D2.PIEZA_NO_VA_A_PAGAR.id, Comp: await C("tema6/DosMetodos"),
    cajas: D2.METODOS_T6_A2.map((m) => m.id), opciones: () => D2.OPCIONES_CAPA_3_T6_A2.map((o) => o.id) },
  { n: "T6 · A4", id: D4.PIEZA_SI_PAGA.id, Comp: await C("tema6/TresCasos"),
    cajas: D4.CASOS_T6_A4.filter((c) => !c.ejemplo).map((c) => c.id), opciones: () => D4.OPCIONES_CAPA_3_T6_A4.map((o) => o.id) },
  { n: "T6 · A5", id: D5.PIEZA_COMO_SE_CALCULA.id, Comp: await C("tema6/CuatroGrupos"),
    cajas: D5.GRUPOS_T6_A5.map((g) => g.id), opciones: (id) => D5.GRUPOS_T6_A5.find((g) => g.id === id).opciones.map((o) => o.id) },
];
const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
/* El orden de las cajas y, abiertas, el de las opciones de cada una. */
const leer = async (caja) => {
  const cajas = [...caja.querySelectorAll("[data-hecho]")].map((z) => z.dataset.hecho);
  const opciones = {};
  for (const id of cajas) {
    const z = caja.querySelector(`[data-hecho="${id}"]`);
    const b = z.querySelector("button[aria-expanded]");
    if (b.getAttribute("aria-expanded") === "false") await tocar(b);
    opciones[id] = [...z.querySelectorAll("[data-opcion]")].map((o) => o.dataset.opcion);
  }
  return { cajas, opciones };
};
const distinto = (a, b) => a.some((x, i) => x !== b[i]);

for (const p of PIEZAS) {
  test(`★★★ lote 28 · D8 · ${p.n}: la primera visita, en el orden de los datos; la segunda, otro orden de cajas y de opciones`, async () => {
    let m = await montar(h(p.Comp));
    const uno = await leer(m.caja);
    m.desmontar();
    assert.deepEqual(uno.cajas, p.cajas, "primera visita: las cajas en el orden de siempre");
    for (const id of p.cajas) assert.deepEqual(uno.opciones[id], p.opciones(id), `primera visita: las opciones de ${id}, como siempre`);

    window.localStorage.setItem(`fae-b5-vueltas:aprender:${p.id}`, "1");
    m = await montar(h(p.Comp));
    const dos = await leer(m.caja);
    assert.ok(distinto(dos.cajas, p.cajas), `segunda visita: otro orden de cajas (${dos.cajas.join(", ")})`);
    assert.deepEqual([...dos.cajas].sort(), [...p.cajas].sort(), "las mismas cajas");
    for (const id of p.cajas) {
      assert.ok(distinto(dos.opciones[id], p.opciones(id)), `segunda visita: otro orden de opciones en ${id}`);
      assert.deepEqual([...dos.opciones[id]].sort(), [...p.opciones(id)].sort(), "las mismas opciones, sin texto nuevo");
    }
    /* Una vez por intento: abrir y cerrar no vuelve a barajar. */
    const otraVez = await leer(m.caja);
    assert.deepEqual(otraVez, dos);
    m.desmontar();
  });
}
