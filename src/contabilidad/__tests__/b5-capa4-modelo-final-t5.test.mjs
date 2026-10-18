import { test, mock, beforeEach } from "node:test";
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
/* Lote 27 · D8: la capa 4 cuenta las visitas en el navegador; cada prueba empieza en la primera. */
beforeEach(() => { try { window.localStorage.clear(); } catch { /* sin almacenamiento */ } });

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

/*
 * LOTE 13 · LA CAPA 4 DE T5 · A1 Y A2: LA FRASE PEGADA AL MODELO.
 * Como en T6 (lotes 7 y 12): el modelo final de la capa 3 en
 * miniatura, encima de la pregunta; la frase buena queda como su leyenda,
 * «Otra vez» la quita y una mala no pone nada. La figura solo lleva cifras de
 * su pieza.
 */
const { default: CuatroCapas } = await import("../../components/mecanicas/maquinas/CuatroCapas.jsx");
const { ESCENAS_TEMA5 } = await import("../../components/mecanicas/libros/tema5/escenasTema5.jsx");
const P1 = await import("../../data/contabilidadT5Pieza1.js");
const P2 = await import("../../data/contabilidadT5Pieza2.js");

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
  { nombre: "T5 · A1", id: "t5-a1", D: P1, pieza: P1.PIEZA_DEL_EFECTIVO, opciones: P1.OPCIONES_FINAL_T5, texto: (t) => t },
  { nombre: "T5 · A2", id: "t5-a2", D: P2, pieza: P2.PIEZA_TRES_MOMENTOS, opciones: P2.OPCIONES_FINAL_T5_A2, texto: (t) => t },
];

for (const c of CASOS) {
  test(`★★★ ${c.nombre}, capa 4: el modelo final encima de la pregunta; la frase buena queda como su leyenda`, async () => {
    const E = ESCENAS_TEMA5[c.pieza.id];
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

test("★★★ T5 · A1: cada paquete en su cajón; T5 · A2 (lote 27): la T de los 260 títulos, con el HABER solo al responder", async () => {
  const a = await montar(h(ESCENAS_TEMA5[P1.PIEZA_DEL_EFECTIVO.id].FiguraFinal, { leyenda: null }));
  for (const p of P1.PAQUETES) {
    const cajon = a.caja.querySelector(`[data-entrada="${p.id}"]`).closest("[data-cajon]").dataset.cajon;
    assert.equal(cajon, p.correcta === "si" ? "temporal" : "no-temporal", p.nombre);
  }
  a.desmontar();
  const E = P2.ESCENA_T5_A2;
  const Final = ESCENAS_TEMA5[P2.PIEZA_TRES_MOMENTOS.id].FiguraFinal;
  const lado = (caja, l) => [...caja.querySelectorAll(`[data-columna="${l}"] [data-entrada]`)].map((x) => [x.dataset.entrada, x.querySelector("[data-cifra-final]").textContent]);
  const b = await montar(h(Final, { leyenda: null }));
  assert.deepEqual(lado(b.caja, "debe"), [[E.caja, "$273.000"]], "Caja, lo que dice la pregunta");
  assert.deepEqual(lado(b.caja, "haber"), [[E.inversiones, ""], [E.ganancia, ""]], "R10: el HABER es la respuesta, en blanco");
  assert.equal(b.caja.querySelectorAll("[data-hueco]").length, 2);
  assert.equal(b.caja.querySelector("[data-pie-final]").textContent, "Escenario simulado");
  b.desmontar();
  const c = await montar(h(Final, { leyenda: "la buena" }));
  assert.deepEqual(lado(c.caja, "haber"), [[E.inversiones, "$221.000"], [E.ganancia, "$52.000"]]);
  assert.ok(P2.PREGUNTA_FINAL_T5_A2.includes("$273.000") && P2.PREGUNTA_FINAL_T5_A2.includes("260 títulos"), "el caso de la pregunta");
  const n = (t) => Number(t.replace(/\D/g, ""));
  assert.equal(n("$273.000"), n("$221.000") + n("$52.000"), "el asiento cuadra");
  c.desmontar();
});
