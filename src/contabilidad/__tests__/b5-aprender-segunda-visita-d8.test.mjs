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

/* ═══ Bug de #455: acertar la capa 4 tiene que contar la visita en A2, A4 y A5 ═══ */
const { default: CuatroCapas } = await import("../../components/mecanicas/maquinas/CuatroCapas.jsx");
const { ESCENAS_TEMA6 } = await import("../../components/mecanicas/libros/tema6/escenasTema6.jsx");
const PIEZA = { [D2.PIEZA_NO_VA_A_PAGAR.id]: [D2.PIEZA_NO_VA_A_PAGAR, D2.OPCIONES_FINAL_T6_A2], [D4.PIEZA_SI_PAGA.id]: [D4.PIEZA_SI_PAGA, D4.OPCIONES_FINAL_T6_A4], [D5.PIEZA_COMO_SE_CALCULA.id]: [D5.PIEZA_COMO_SE_CALCULA, D5.OPCIONES_FINAL_T6_A5] };
const Nada = () => null;

for (const p of PIEZAS) {
  test(`★★★ bug de #455 · ${p.n}: acertar la capa 4 sube la cuenta de visitas, y la carga siguiente sale barajada`, async () => {
    const [pieza, opciones] = PIEZA[p.id];
    const E = ESCENAS_TEMA6[pieza.id];
    const clave = `fae-b5-vueltas:aprender:${p.id}`;
    /* Primera visita: las cuatro capas, con la capa 3 de verdad; la capa 3, en el orden de los datos. */
    let m = await montar(h(CuatroCapas, { pieza, Capa2: Nada, Exploracion: E.Exploracion, Capa4: E.Capa4, FiguraFinal: E.FiguraFinal }));
    assert.deepEqual([...m.caja.querySelectorAll('[data-capa="3"] [data-hecho]')].map((z) => z.dataset.hecho), p.cajas);
    assert.equal(window.localStorage.getItem(clave), null, "antes de acertar, sin visita contada");
    await tocar(m.caja.querySelector(`[data-una-frase] [data-opcion="${opciones.find((o) => o.correcta).id}"]`));
    assert.equal(window.localStorage.getItem(clave), "1", "acertar la capa 4 cuenta la visita");
    m.desmontar();
    /* La carga siguiente: la capa 3 sale barajada. */
    m = await montar(h(CuatroCapas, { pieza, Capa2: Nada, Exploracion: E.Exploracion, Capa4: E.Capa4, FiguraFinal: E.FiguraFinal }));
    const cajas = [...m.caja.querySelectorAll('[data-capa="3"] [data-hecho]')].map((z) => z.dataset.hecho);
    assert.ok(distinto(cajas, p.cajas), `segunda visita: otro orden de cajas (${cajas.join(", ")})`);
    m.desmontar();
  });
}

/* ═══ Lote 29 · D8: en la segunda visita, la capa 4 de A2, A4 y A5 usa la pregunta de Futaba y cambia la correcta ═══ */
const V2 = {
  [D2.PIEZA_NO_VA_A_PAGAR.id]: { hoy: D2.PREGUNTA_FINAL_T6_A2, otra: D2.PREGUNTA_FINAL_V2_T6_A2, opciones: D2.OPCIONES_FINAL_V2_T6_A2, correcta: "b5-t6-a2-gasto", antes: "b5-t6-a2-provision" },
  [D4.PIEZA_SI_PAGA.id]: { hoy: D4.PREGUNTA_FINAL_T6_A4, otra: D4.PREGUNTA_FINAL_V2_T6_A4, opciones: D4.OPCIONES_FINAL_V2_T6_A4, correcta: "b5-t6-a4-castigados", antes: "b5-t6-a4-pendiente" },
  [D5.PIEZA_COMO_SE_CALCULA.id]: { hoy: D5.PREGUNTA_FINAL_T6_A5, otra: D5.PREGUNTA_FINAL_V2_T6_A5, opciones: D5.OPCIONES_FINAL_V2_T6_A5, correcta: "b5-t6-a5-diez", antes: "b5-t6-a5-veinte", pegar: pegarPorcentaje },
};

for (const p of PIEZAS) {
  test(`★★★ lote 29 · D8 · ${p.n}: en la segunda visita, la capa 4 trae otra pregunta y otra correcta (las mismas opciones); la frase pegada es su devolución`, async () => {
    const [pieza, opcionesHoy] = PIEZA[p.id];
    const v = V2[p.id];
    const pegar = v.pegar ?? ((t) => t);
    const E = ESCENAS_TEMA6[pieza.id];
    assert.equal(opcionesHoy.find((o) => o.correcta).id, v.antes, "la primera visita no cambia");
    assert.deepEqual(v.opciones.map((o) => [o.id, o.texto]), opcionesHoy.map((o) => [o.id, o.texto]), "las mismas opciones");
    window.localStorage.setItem(`fae-b5-vueltas:aprender:${p.id}`, "1");
    const m = await montar(h(CuatroCapas, { pieza, Capa2: Nada, Exploracion: Nada, Capa4: E.Capa4, FiguraFinal: E.FiguraFinal }));
    const capa4 = m.caja.querySelector('[data-capa="4"]');
    assert.ok(capa4.textContent.includes(pegar(v.otra)), "la pregunta de la segunda visita");
    assert.ok(!capa4.textContent.includes(pegar(v.hoy)), "no la de la primera");
    /* La que era correcta en la primera visita ahora es un error, con su devolución. */
    await tocar(capa4.querySelector(`[data-una-frase] [data-opcion="${v.antes}"]`));
    assert.equal(m.caja.querySelector("[data-figura-final] [data-leyenda]"), null, "la de antes ya no es la buena");
    assert.ok(capa4.textContent.includes(pegar(v.opciones.find((o) => o.id === v.antes).feedback)));
    await tocar(capa4.querySelector("[data-otra-vez]"));
    await tocar(capa4.querySelector(`[data-una-frase] [data-opcion="${v.correcta}"]`));
    const buena = v.opciones.find((o) => o.id === v.correcta);
    assert.ok(buena.feedback.startsWith("Correcto. "));
    assert.equal(m.caja.querySelector("[data-figura-final] [data-leyenda]").textContent, pegar(buena.frase), "la frase pegada es la devolución de la correcta");
    m.desmontar();
  });
}

test("★★★ lote 29 · T6 A4: en las dos visitas, los textos nuevos de «castigados» y «caja»", () => {
  const t = (id) => D4.OPCIONES_FINAL_T6_A4.find((o) => o.id === id).texto;
  assert.equal(t("b5-t6-a4-castigados"), "Siguen castigados, porque esa parte no se revive.");
  assert.equal(t("b5-t6-a4-caja"), "En Caja, apenas el cliente los pague.");
});
