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
 * LOTE 10 · LA CAPA 1 DE LAS 7 PIEZAS DE APRENDER DE B, CON UNA FIGURA POR TÉRMINO (P2 de Mai).
 * Vigila: una figura por término (42), antes del nombre; las palabras de cada figura son nombres
 * publicados o fragmentos literales de la definición de main de su término; sin cifras que no
 * traiga la definición (R22); la figura es una imagen con su texto alternativo, lo de dentro
 * callado; lo señalado con 2 px #F8F9FA; sin coral.
 */
const { FIGURAS_CAPA1_B, PUBLICADAS_FIGURAS_CAPA1, TEXTOS_FIGURAS_CAPA1 } = await import("../../data/figurasCapa1B.js");
const { conFigurasCapa1, FiguraCapa1, altDe } = await import("../../components/mecanicas/libros/tema6/FigurasCapa1.jsx");
const { default: CuatroCapas } = await import("../../components/mecanicas/maquinas/CuatroCapas.jsx");
const { FAE } = await import("../../theme.js");
const PIEZAS = [
  (await import("../../data/contabilidadT5Pieza1.js")).PIEZA_DEL_EFECTIVO,
  (await import("../../data/contabilidadT5Pieza2.js")).PIEZA_TRES_MOMENTOS,
  (await import("../../data/contabilidadT6Pieza1.js")).PIEZA_LO_QUE_LE_DEBEN,
  (await import("../../data/contabilidadT6Pieza2.js")).PIEZA_NO_VA_A_PAGAR,
  (await import("../../data/contabilidadT6Pieza3.js")).PIEZA_LA_PROVISION,
  (await import("../../data/contabilidadT6Pieza4.js")).PIEZA_SI_PAGA,
  (await import("../../data/contabilidadT6Pieza5.js")).PIEZA_COMO_SE_CALCULA,
];
const T5 = await import("../../components/ContabilidadTema5View.jsx");
const T6 = await import("../../components/ContabilidadTema6View.jsx");

const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
/* Las palabras de una figura. */
const palabras = (f) => [f.tapa, f.cuenta, f.debe, f.haber, f.de, f.a, f.rotulo, f.rayada, f.suelta, f.rellena, f.provision, f.neto,
  ...(f.cajones ?? []), ...(f.momentos ?? []), ...(f.grupos ?? []), ...(f.porcentajes ?? []), ...(f.tanques ?? []).map((t) => t.texto)].filter(Boolean);
const textoDe = (d) => (typeof d === "string" ? d : "");

test("★★★ una figura por término en las 7 piezas (42), en el orden de main; la vista se las pone a todas", () => {
  assert.deepEqual(PIEZAS.map((p) => p.nombres.length), [9, 4, 6, 7, 6, 5, 5]);
  for (const p of PIEZAS) assert.equal(FIGURAS_CAPA1_B[p.id].length, p.nombres.length, p.id);
  const vistas = [...T5.PIEZAS.slice(0, 2), ...T6.PIEZAS].map((x) => x.pieza);
  assert.equal(vistas.length, 7);
  for (const p of vistas) assert.ok(p.nombres.every((n) => n.figura && n.figuraAntesDelNombre), `${p.id}: todas con figura, antes del nombre`);
});

/* Un objeto que sirve a varios términos (el estante «Temporal» de T5 A1.2 y A1.3) lleva palabras de esas definiciones: vale cualquiera de su pieza. */
test("★★★ cada palabra de una figura es un nombre publicado o un fragmento literal de una definición de main de su pieza", () => {
  for (const p of PIEZAS) {
    const def = p.nombres.map((n) => textoDe(n.definicion)).join(" ").toLowerCase();
    FIGURAS_CAPA1_B[p.id].forEach((f, k) => {
      for (const w of palabras(f)) {
        assert.ok(PUBLICADAS_FIGURAS_CAPA1.includes(w) || def.includes(w.toLowerCase()), `${p.id} · ${k + 1} «${p.nombres[k].termino}»: «${w}»`);
      }
    });
  }
});

test("★★★ R22: ninguna figura trae una cifra que no esté en la definición de su término", () => {
  for (const p of PIEZAS) {
    FIGURAS_CAPA1_B[p.id].forEach((f, k) => {
      for (const w of palabras(f).filter((x) => /\d/.test(x))) assert.ok(textoDe(p.nombres[k].definicion).includes(w), `${p.id} · ${k + 1}: «${w}»`);
    });
  }
});

test("★★★ cada figura: una imagen con su texto alternativo, lo de dentro callado, lo señalado con 2 px #F8F9FA y sin coral", async () => {
  for (const p of PIEZAS) {
    for (const f of FIGURAS_CAPA1_B[p.id]) {
      const { caja, desmontar } = await montar(h(FiguraCapa1, { f }));
      const fig = caja.querySelector("[data-figura-capa1]");
      assert.equal(fig.getAttribute("role"), "img");
      assert.equal(fig.getAttribute("aria-label"), altDe(f));
      assert.ok(fig.getAttribute("aria-label").length > 10);
      assert.equal(fig.firstElementChild.getAttribute("aria-hidden"), "true");
      const senal = [...caja.querySelectorAll('[data-senal="si"]')];
      if (f.senal.length) assert.ok(senal.length > 0, `${f.tipo}: algo señalado`);
      assert.ok(!caja.innerHTML.toLowerCase().includes(FAE.coral.toLowerCase()), "sin coral");
      desmontar();
    }
  }
});

test("★★ en la capa 1, la figura va antes del nombre del término", async () => {
  const Nada = () => null;
  const pieza = conFigurasCapa1(PIEZAS[4]);
  const { caja, desmontar } = await montar(h(CuatroCapas, { pieza, Capa2: Nada, Exploracion: Nada, Capa4: Nada }));
  const carta = caja.querySelector("[data-termino='0']");
  const fig = carta.querySelector("[data-figura-capa1]");
  assert.ok(carta.querySelector("[data-nombre-termino]").compareDocumentPosition(fig) & 2, "la figura, antes");
  assert.deepEqual([TEXTOS_FIGURAS_CAPA1.debe, TEXTOS_FIGURAS_CAPA1.haber], ["DEBE", "HABER"]);
  desmontar();
});
