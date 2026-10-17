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
 * LOTE 12 · LA CAPA 4 DE T6 · A1, A2, A4 Y A5: LA FRASE PEGADA AL MODELO.
 * Como el tanque de T6 · A3 (lote 7): el modelo final de la capa 3 en
 * miniatura, encima de la pregunta; la frase buena queda como su leyenda,
 * «Otra vez» la quita y una mala no pone nada. La figura solo lleva cifras de
 * su pieza.
 */
const { default: CuatroCapas } = await import("../../components/mecanicas/maquinas/CuatroCapas.jsx");
const { ESCENAS_TEMA6 } = await import("../../components/mecanicas/libros/tema6/escenasTema6.jsx");
const { pegarPorcentaje } = await import("../t6Pieza5.js");
const P1 = await import("../../data/contabilidadT6Pieza1.js");
const P2 = await import("../../data/contabilidadT6Pieza2.js");
const P4 = await import("../../data/contabilidadT6Pieza4.js");
const P5 = await import("../../data/contabilidadT6Pieza5.js");

const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const click = async (el) => { assert.ok(el, "no hay nada que tocar"); await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const Nada = () => null;

const CASOS = [
  { nombre: "T6 · A1", id: "t6-a1", D: P1, pieza: P1.PIEZA_LO_QUE_LE_DEBEN, opciones: P1.OPCIONES_FINAL_T6, texto: (t) => t },
  { nombre: "T6 · A2", id: "t6-a2", D: P2, pieza: P2.PIEZA_NO_VA_A_PAGAR, opciones: P2.OPCIONES_FINAL_T6_A2, texto: (t) => t },
  { nombre: "T6 · A4", id: "t6-a4", D: P4, pieza: P4.PIEZA_SI_PAGA, opciones: P4.OPCIONES_FINAL_T6_A4, texto: (t) => t },
  { nombre: "T6 · A5", id: "t6-a5", D: P5, pieza: P5.PIEZA_COMO_SE_CALCULA, opciones: P5.OPCIONES_FINAL_T6_A5, texto: pegarPorcentaje },
];

for (const c of CASOS) {
  test(`★★★ ${c.nombre}, capa 4: el modelo final encima de la pregunta; la frase buena queda como su leyenda`, async () => {
    const E = ESCENAS_TEMA6[c.pieza.id];
    assert.ok(E.FiguraFinal, "la pieza tiene modelo final");
    const { caja, desmontar } = await montar(h(CuatroCapas, { pieza: c.pieza, Capa2: Nada, Exploracion: Nada, Capa4: E.Capa4, FiguraFinal: E.FiguraFinal }));
    const final = caja.querySelector("[data-figura-final]");
    const modelo = final.querySelector(`[data-modelo-final="${c.id}"]`);
    assert.ok(modelo, "el modelo final");
    assert.ok(final.compareDocumentPosition(caja.querySelector("[data-una-frase]")) & 4, "encima de la pregunta");
    assert.ok(!modelo.querySelector("button, [tabindex], [draggable='true']"), "sin gestos");

    /* Solo cifras de su pieza. */
    const datos = JSON.stringify(c.D);
    for (const cifra of modelo.textContent.match(/\$\s?[\d.]+/g) ?? []) assert.ok(datos.includes(cifra), `${cifra} sale de la pieza`);

    const mala = c.opciones.find((o) => !o.correcta);
    await click(caja.querySelector(`[data-una-frase] [data-opcion="${mala.id}"]`));
    assert.ok(!caja.querySelector("[data-leyenda]"), "una mala no pone leyenda");
    await click(caja.querySelector("[data-otra-vez]"));
    const buena = c.opciones.find((o) => o.correcta);
    await click(caja.querySelector(`[data-una-frase] [data-opcion="${buena.id}"]`));
    const ley = caja.querySelector(`[data-figura-final] [data-modelo-final="${c.id}"] [data-leyenda]`);
    assert.ok(ley, "la leyenda va pegada al modelo");
    assert.equal(ley.textContent, c.texto(buena.texto));
    assert.equal(ley.style.fontSize, "13px");
    assert.ok(modelo.lastElementChild === ley, "debajo del modelo");
    await click(caja.querySelector("[data-otra-vez]"));
    assert.ok(!caja.querySelector("[data-leyenda]"), "«Otra vez» la quita");
    desmontar();
  });
}

test("★★★ el modelo final de A1 lleva los seis hechos, y el de A4 las seis cifras de su tablero", async () => {
  const E1 = ESCENAS_TEMA6[P1.PIEZA_LO_QUE_LE_DEBEN.id];
  const a = await montar(h(E1.FiguraFinal, { leyenda: null }));
  assert.equal(a.caja.querySelectorAll("[data-entrada]").length, P1.HECHOS_T6.length);
  a.desmontar();
  const E4 = ESCENAS_TEMA6[P4.PIEZA_SI_PAGA.id];
  const b = await montar(h(E4.FiguraFinal, { leyenda: null }));
  assert.deepEqual([...b.caja.querySelectorAll("[data-celda]")].map((x) => x.textContent), P4.CASOS_T6_A4.flatMap((x) => [x.revive, x.entran]));
  b.desmontar();
});

test("★★★ T6 · A5: cada grupo con su porcentaje; con la leyenda, se señala el del grupo de la pregunta (ocho meses)", async () => {
  const E5 = ESCENAS_TEMA6[P5.PIEZA_COMO_SE_CALCULA.id];
  const sin = await montar(h(E5.FiguraFinal, { leyenda: null }));
  assert.deepEqual([...sin.caja.querySelectorAll("[data-celda]")].map((x) => x.textContent), ["Nada", "5 %", "10 %", "15 %"]);
  assert.ok(!sin.caja.querySelector("[data-senalado='si']"));
  sin.desmontar();
  const con = await montar(h(E5.FiguraFinal, { leyenda: "$38.000" }));
  assert.deepEqual([...con.caja.querySelectorAll("[data-senalado='si']")].map((x) => x.closest("[data-fila]").dataset.fila), ["g3"]);
  con.desmontar();
});
