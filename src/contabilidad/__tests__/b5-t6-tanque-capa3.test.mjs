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
 * LOTE 7 · LA CAPA 3 DE T6 · A3 SOBRE EL TANQUE (§3.3 de Mai; decisión (a) de Sakuta).
 * Las opciones son partes del modelo; la escalera de ayuda: al primer error,
 * «No va aquí» y la pista (el modelo responde); al segundo, la devolución de
 * Futaba y el modelo en su estado correcto; nunca «Iba aquí». Al acertar,
 * «Correcto», el texto que se revela y su pie.
 */
const D = await import("../../data/contabilidadT6Pieza3.js");
const { default: TanqueMomentos } = await import("../../components/mecanicas/libros/tema6/TanqueMomentos.jsx");
const { ESCENAS_TEMA6 } = await import("../../components/mecanicas/libros/tema6/escenasTema6.jsx");
const { FAE } = await import("../../theme.js");

const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const click = async (el) => { assert.ok(el, "no hay nada que tocar"); await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const rgb = (hex) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ")})`;
const [M1, M2, M3] = D.MOMENTOS_T6_A3;
const op = (caja, id) => caja.querySelector(`[data-hecho] [data-opcion="${id}"]`);
const mensaje = (caja) => caja.querySelector('[role="status"]');
const visible = (caja) => mensaje(caja)?.querySelector("[data-texto-retro]")?.textContent ?? null;
const nivel = (caja) => caja.querySelector("[data-tanque]").dataset.nivel;
const falla = (m, id) => (typeof m.falla === "string" ? m.falla : m.falla[id]);

test("★★ es la Exploracion de la pieza", () => {
  assert.equal(ESCENAS_TEMA6[D.PIEZA_LA_PROVISION.id].Exploracion, TanqueMomentos);
});

test("★★★ momento 1: las dos columnas de la T son opciones (y la tercera de Futaba, bajo la T, con la misma forma); «Momento 1 de 3», «Se crea» y su pregunta", async () => {
  const { caja, desmontar } = await montar(h(TanqueMomentos));
  assert.equal(caja.querySelector("[data-contador]").textContent, `${D.TANQUE_T6_A3.momento} 1 de 3`);
  assert.ok(caja.querySelector("[data-tarjeta-momento]").textContent.includes(M1.caja));
  assert.equal(caja.querySelector("[data-pregunta]").textContent, M1.pregunta);
  for (const id of ["debe", "haber"]) {
    const b = op(caja, id);
    assert.equal(b.tagName, "BUTTON");
    assert.equal(b.dataset.columna, id, "la columna entera es el botón");
    assert.equal(b.style.minHeight, "44px");
    assert.equal(b.style.border, "1px solid rgba(248, 249, 250, 0.35)", "contorno de reposo");
  }
  const tercera = op(caja, "ninguna");
  assert.equal(tercera.textContent, M1.opciones.find((o) => o.id === "ninguna").texto);
  assert.equal(tercera.style.border, "1px solid rgba(248, 249, 250, 0.35)");
  assert.equal(tercera.style.minHeight, "44px");
  assert.equal(nivel(caja), "0");
  desmontar();
});

test("★★★ escalera: primer error, «No va aquí» con X coral, 2 px coral y la PISTA (el lector oye «Incorrecto.»); segundo error, la devolución de Futaba y el modelo en su estado correcto; nunca «Iba aquí» ni el texto que se revela", async () => {
  const { caja, desmontar } = await montar(h(TanqueMomentos));
  await click(op(caja, "debe"));
  const debe = op(caja, "debe");
  assert.equal(debe.style.border, `2px solid ${rgb(FAE.coral)}`);
  assert.equal(debe.querySelector('[data-pastilla="tachada"]').textContent, "No va aquí");
  assert.ok(debe.querySelector('[data-icono="tache"]'));
  assert.equal(visible(caja), M1.pista);
  assert.equal(mensaje(caja).dataset.mensaje, "error");
  assert.equal(mensaje(caja).querySelector("[data-lector]").textContent.trim(), "Incorrecto.");
  assert.equal(nivel(caja), "0", "sin decidir, el tanque no cambia");
  assert.ok(!caja.querySelector("[data-siguiente-momento]"), "reintento: no se avanza todavía");
  /* La elegida no se puede volver a elegir. */
  await click(op(caja, "debe"));
  assert.equal(visible(caja), M1.pista);
  await click(op(caja, "ninguna"));
  assert.equal(visible(caja), falla(M1, "ninguna"), "la respuesta con su porqué");
  assert.equal(nivel(caja), "148800", "el modelo pasa al estado correcto");
  assert.ok(caja.querySelector('[data-columna="haber"] [data-movimiento]').textContent.includes(M1.monto));
  assert.ok(!caja.textContent.includes("Iba aquí"), "nunca «Iba aquí»");
  assert.ok(!caja.textContent.includes(M1.revela), "B5: sin el texto que se revela");
  assert.ok(caja.querySelector("[data-siguiente-momento]"));
  desmontar();
});

test("★★★ acierto: 2 px #F8F9FA y «Correcto» con Check; el mensaje con el texto que se revela y su pie; «Siguiente momento» lleva al 2", async () => {
  const { caja, desmontar } = await montar(h(TanqueMomentos));
  await click(op(caja, "haber"));
  const b = op(caja, "haber");
  assert.equal(b.style.border, `2px solid ${rgb(FAE.text)}`);
  assert.equal(b.querySelector('[data-pastilla="correcta"]').textContent, "Correcto");
  assert.ok(b.querySelector('[data-icono="visto"]'));
  assert.equal(mensaje(caja).dataset.mensaje, "acierto");
  assert.equal(visible(caja), M1.revela);
  assert.equal(mensaje(caja).querySelector("[data-pie]").textContent, M1.pie);
  const sig = caja.querySelector("[data-siguiente-momento]");
  assert.equal(sig.textContent, D.TANQUE_T6_A3.siguienteMomento);
  assert.equal(sig.style.background, rgb("#B8C4D4"));
  assert.equal(sig.style.color, rgb(FAE.navy));
  await click(sig);
  assert.equal(caja.querySelector("[data-contador]").textContent, `${D.TANQUE_T6_A3.momento} 2 de 3`);
  assert.equal(caja.querySelector("[data-pregunta]").textContent, M2.pregunta);
  desmontar();
});

test("★★★ momento 2: tres marcas del saldo ordenadas por su nivel, iguales; al primer error, el nivel va a la marca elegida y vuelve (600 ms)", async () => {
  const antes = w.matchMedia;
  w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
  globalThis.matchMedia = w.matchMedia;
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const { caja, desmontar } = await montar(h(TanqueMomentos));
    await click(op(caja, "haber"));
    await click(caja.querySelector("[data-siguiente-momento]"));
    const marcas = [...caja.querySelectorAll("[data-opciones-momento] [data-opcion]")];
    assert.deepEqual(marcas.map((b) => b.dataset.opcion), ["sigue", "cero", "faltan"], "de la más alta a la más baja");
    assert.ok(marcas.every((b) => b.style.border === "1px solid rgba(248, 249, 250, 0.35)" && b.style.minHeight === "44px"), "la correcta no se distingue");
    await click(op(caja, "cero"));
    assert.equal(nivel(caja), "0", "el nivel va a la marca");
    await act(async () => { mock.timers.tick(650); });
    assert.equal(nivel(caja), "148800", "y vuelve");
    assert.equal(visible(caja), M2.pista);
    await click(op(caja, "faltan"));
    assert.equal(nivel(caja), "-31200");
    assert.equal(caja.querySelector("[data-saldo]").dataset.saldo, "en-contra");
    desmontar();
  } finally {
    mock.timers.reset();
    w.matchMedia = antes; globalThis.matchMedia = antes;
  }
});

test("★★★ momento 3: tres fichas de gasto con las palabras de Futaba; al acertar, el tanque llega a la línea del análisis y el final queda debajo, sin «Siguiente momento»", async () => {
  const { caja, desmontar } = await montar(h(TanqueMomentos));
  for (const m of [M1, M2]) {
    await click(op(caja, m.correcta));
    await click(caja.querySelector("[data-siguiente-momento]"));
  }
  const fichas = [...caja.querySelectorAll("[data-opciones-momento] [data-ficha]")];
  assert.deepEqual(fichas.map((f) => f.textContent), M3.opciones.map((o) => o.texto));
  assert.ok(fichas.every((f) => f.tagName === "BUTTON" && f.style.minHeight === "44px"));
  assert.ok(caja.querySelector("[data-linea-analisis]"), "la línea del análisis, a la vista");
  assert.ok(caja.querySelector("[data-pista-soltar]"), "el tanque espera la ficha");
  await click(op(caja, "igual"));
  assert.equal(visible(caja), M3.pista);
  assert.equal(nivel(caja), "-31200");
  await click(op(caja, M3.correcta));
  assert.equal(nivel(caja), "153400");
  assert.ok(caja.querySelector("[data-final]").textContent.includes(D.FINAL_CAPA_3_T6_A3.texto));
  assert.ok(!caja.querySelector("[data-siguiente-momento]"));
  assert.equal(caja.querySelectorAll("[data-columna] [data-movimiento]").length, 3, "la T con los tres momentos");
  desmontar();
});
