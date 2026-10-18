import { test, beforeEach } from "node:test";
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
 * LOTE 27 · la capa 4 de las 7 piezas de Aprender de B (nivel de Shoko):
 *   (3) D8: en la segunda visita, la pregunta de antes del cambio C1 (T5 A1, T5 A2, T6 A1 y T6 A3, las que
 *       cambió ese lote), copiada tal cual de la versión anterior; en la tercera, la de hoy otra vez.
 *   (4) la frase pegada al modelo aparece solo después de responder: antes no está, ni en la figura.
 */
const { default: CuatroCapas } = await import("../../components/mecanicas/maquinas/CuatroCapas.jsx");
const { ESCENAS_TEMA5 } = await import("../../components/mecanicas/libros/tema5/escenasTema5.jsx");
const { ESCENAS_TEMA6 } = await import("../../components/mecanicas/libros/tema6/escenasTema6.jsx");
const D = {
  T5A1: await import("../../data/contabilidadT5Pieza1.js"), T5A2: await import("../../data/contabilidadT5Pieza2.js"),
  T6A1: await import("../../data/contabilidadT6Pieza1.js"), T6A2: await import("../../data/contabilidadT6Pieza2.js"),
  T6A3: await import("../../data/contabilidadT6Pieza3.js"), T6A4: await import("../../data/contabilidadT6Pieza4.js"),
  T6A5: await import("../../data/contabilidadT6Pieza5.js"),
};
const { pegarPorcentaje } = await import("../t6Pieza5.js");
const { readFileSync } = await import("node:fs");

const PIEZAS = [
  { n: "T5 · A1", d: D.T5A1, pieza: D.T5A1.PIEZA_DEL_EFECTIVO, E: ESCENAS_TEMA5, suf: "T5" },
  { n: "T5 · A2", d: D.T5A2, pieza: D.T5A2.PIEZA_TRES_MOMENTOS, E: ESCENAS_TEMA5, suf: "T5_A2" },
  { n: "T6 · A1", d: D.T6A1, pieza: D.T6A1.PIEZA_LO_QUE_LE_DEBEN, E: ESCENAS_TEMA6, suf: "T6" },
  { n: "T6 · A2", d: D.T6A2, pieza: D.T6A2.PIEZA_NO_VA_A_PAGAR, E: ESCENAS_TEMA6, suf: "T6_A2" },
  { n: "T6 · A3", d: D.T6A3, pieza: D.T6A3.PIEZA_LA_PROVISION, E: ESCENAS_TEMA6, suf: "T6_A3" },
  { n: "T6 · A4", d: D.T6A4, pieza: D.T6A4.PIEZA_SI_PAGA, E: ESCENAS_TEMA6, suf: "T6_A4" },
  { n: "T6 · A5", d: D.T6A5, pieza: D.T6A5.PIEZA_COMO_SE_CALCULA, E: ESCENAS_TEMA6, suf: "T6_A5", pegar: pegarPorcentaje },
];
const Nada = () => null;
const montar = async (p) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const E = p.E[p.pieza.id];
  await act(async () => { raiz.render(h(CuatroCapas, { pieza: p.pieza, Capa2: Nada, Exploracion: Nada, Capa4: E.Capa4, FiguraFinal: E.FiguraFinal })); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const click = async (el) => { assert.ok(el, "no hay nada que tocar"); await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const capa4 = (caja) => caja.querySelector('[data-capa="4"]');
const responder = async (caja, opciones) => click(caja.querySelector(`[data-una-frase] [data-opcion="${opciones.find((o) => o.correcta).id}"]`));

for (const p of PIEZAS) {
  test(`★★★ (4) ${p.n}: la frase pegada al modelo aparece solo después de responder; antes, ni en la figura`, async () => {
    const opciones = p.d[`OPCIONES_FINAL_${p.suf}`];
    const buena = opciones.find((o) => o.correcta);
    const texto = p.pegar ? p.pegar(buena.texto) : buena.texto;
    const { caja, desmontar } = await montar(p);
    assert.equal(capa4(caja).querySelector("[data-leyenda]"), null, "antes de responder, sin leyenda");
    assert.ok(!caja.querySelector("[data-figura-final]").textContent.includes(texto), "la figura no trae la frase");
    await responder(caja, opciones);
    assert.equal(caja.querySelector("[data-figura-final] [data-leyenda]").textContent, texto, "después de responder, pegada al modelo");
    desmontar();
  });
}

const CON_ANTES = PIEZAS.filter((p) => p.d[`PREGUNTA_FINAL_ANTES_C1_${p.suf}`]);

test("★★★ (3) D8: las cuatro piezas que cambió el lote C1 tienen su pregunta de antes; las otras tres no la tienen", () => {
  assert.deepEqual(CON_ANTES.map((p) => p.n), ["T5 · A1", "T5 · A2", "T6 · A1", "T6 · A3"]);
  for (const p of CON_ANTES) {
    const o = p.d[`OPCIONES_FINAL_ANTES_C1_${p.suf}`];
    assert.equal(o.length, 4);
    assert.equal(o.filter((x) => x.correcta).length, 1);
    assert.notEqual(p.d[`PREGUNTA_FINAL_ANTES_C1_${p.suf}`], p.d[`PREGUNTA_FINAL_${p.suf}`]);
  }
});

test("★★★ (3) D8: las preguntas de antes son las del historial, letra por letra (guardadas en el paquete del lote 27)", () => {
  const paquete = readFileSync(new URL("../../../orquestador/conocimiento/paquetes/b5-lote27-capa4-antes-c1.md", import.meta.url), "utf8");
  for (const p of CON_ANTES) {
    assert.ok(paquete.includes(p.d[`PREGUNTA_FINAL_ANTES_C1_${p.suf}`]), `${p.n}: la pregunta`);
    for (const o of p.d[`OPCIONES_FINAL_ANTES_C1_${p.suf}`]) {
      assert.ok(paquete.includes(o.texto), `${p.n}: «${o.texto}»`);
      assert.ok(paquete.includes(o.feedback), `${p.n}: la devolución de «${o.texto}»`);
    }
  }
});

for (const p of CON_ANTES) {
  test(`★★★ (3) D8 · ${p.n}: primera visita, la de hoy; segunda, la de antes del cambio C1 (sin pie); tercera, la de hoy`, async () => {
    const hoy = p.d[`PREGUNTA_FINAL_${p.suf}`];
    const antes = p.d[`PREGUNTA_FINAL_ANTES_C1_${p.suf}`];
    let m = await montar(p);
    assert.ok(capa4(m.caja).textContent.includes(hoy));
    await responder(m.caja, p.d[`OPCIONES_FINAL_${p.suf}`]);
    m.desmontar();
    m = await montar(p);
    assert.ok(capa4(m.caja).textContent.includes(antes), "la segunda visita usa la de antes");
    assert.ok(!capa4(m.caja).textContent.includes(hoy));
    assert.equal(capa4(m.caja).querySelector("[data-pie]"), null, "sin pie: no lo llevaba");
    await responder(m.caja, p.d[`OPCIONES_FINAL_ANTES_C1_${p.suf}`]);
    assert.ok(m.caja.querySelector("[data-figura-final] [data-leyenda]"), "su frase, pegada al modelo");
    m.desmontar();
    m = await montar(p);
    assert.ok(capa4(m.caja).textContent.includes(hoy), "la tercera vuelve a la de hoy");
    m.desmontar();
  });
}

test("★★★ (3) D8 · T5 · A2: en la segunda visita la T es la de Santa Pacha (la de la pregunta de antes), con el HABER solo al responder", async () => {
  const p = PIEZAS[1];
  window.localStorage.setItem(`fae-b5-vueltas:aprender:${p.pieza.id}`, "1");
  const m = await montar(p);
  const fig = m.caja.querySelector("[data-figura-final] [data-antes-c1]");
  assert.ok(fig, "la T de antes");
  assert.equal(fig.querySelectorAll('[data-columna="haber"] [data-hueco]').length, 2, "R10: el HABER (la respuesta), en blanco");
  await responder(m.caja, p.d.OPCIONES_FINAL_ANTES_C1_T5_A2);
  assert.deepEqual([...fig.querySelectorAll('[data-columna="haber"] [data-entrada]')].map((x) => x.textContent), [p.d.ESCENA_T5_A2.costado1, p.d.ESCENA_T5_A2.costado2]);
  m.desmontar();
});
