import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «ASÍ SE JUEGA» DE LAS DOS CLASIFICACIONES DE LA CÉLULA B (auditoría integral
 * de Shoko, 15-oct): b5-t5-a1 y b5-t6-a1.
 *
 * Sus tres reglas aprobadas solo vivían en los datos: sin «Así se juega» no
 * hay botón «¿Cómo se juega?», y quien no usa lector de pantalla no las veía.
 * Ahora llevan el patrón de T1-6:
 *   · «Así se juega» con la consigna y las tres reglas, en pantalla
 *   · la demo es una ficha del banco, con su acierto aprobado, y el guion
 *     abre los dos niveles y coloca la ficha
 *   · después, en la partida, el botón «¿Cómo se juega?» vuelve a abrirlo
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.Element.prototype.scrollIntoView = () => {};
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;
const { ASI_SE_JUEGA } = await import("../../data/asiSeJuega.js");
const A51 = await import("../../data/contabilidadT5Act1.js");
const A61 = await import("../../data/contabilidadT6Act1.js");
const { default: QueRentaDa } = await import("../../components/mecanicas/libros/tema5/QueRentaDa.jsx");
const { default: ClientesOOtra } = await import("../../components/mecanicas/libros/tema6/ClientesOOtra.jsx");
const { default: JuegoConTutorial } = await import("../../components/mecanicas/libros/JuegoConTutorial.jsx");

const CASOS = [
  { id: "b5-t5-a1", D: A51.T5_ACT1, reglas: A51.REGLAS_T5_ACT1, banco: A51.FICHAS_T5_ACT1, Mecanica: QueRentaDa },
  { id: "b5-t6-a1", D: A61.T6_ACT1, reglas: A61.REGLAS_T6_ACT1, banco: A61.FICHAS_T6_ACT1, Mecanica: ClientesOOtra },
];
const Marco = ({ children }) => h("div", null, children);

const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent.trim() === texto) ?? null;

test("★★★ las dos tienen «Así se juega» con su consigna y sus tres reglas aprobadas", () => {
  for (const k of CASOS) {
    const asi = ASI_SE_JUEGA[k.id];
    assert.ok(asi, `${k.id}: sin «Así se juega»`);
    assert.equal(asi.titulo, k.D.nombre);
    assert.equal(asi.consigna, k.D.consigna);
    assert.deepEqual(asi.pasos, k.reglas);
    assert.equal(asi.pasos.length, 3);
    assert.ok(asi.pasos[2].includes("tienes un intento más"), `${k.id}: falta el reintento`);
    assert.doesNotMatch(asi.alt, /^Ejemplo/);
  }
});

test("★★★ la demo es una ficha del banco, sin texto nuevo, y abre los dos niveles", () => {
  for (const k of CASOS) {
    const [ficha] = ASI_SE_JUEGA[k.id].demo.items;
    assert.ok(k.banco.includes(ficha), `${k.id}: la ficha de la demo no es del banco`);
    const abre = k.id === "b5-t5-a1" ? A51.FIJA : A61.CLIENTES;
    assert.equal(ficha.renta ?? ficha.cuenta, abre, `${k.id}: la ficha no abre el segundo nivel`);
    assert.ok(ASI_SE_JUEGA[k.id].alt.includes(`«${ficha.texto}»`));
  }
});

test("★★★ el guion elige los dos niveles y coloca la ficha: se lee su acierto", async () => {
  for (const k of CASOS) {
    const asi = ASI_SE_JUEGA[k.id];
    const { caja, desmontar } = await montar(h(k.Mecanica, { Marco, items: asi.demo.items, modoDemo: true }));
    /* En la demo no hay encabezado ni pulsos: solo la ficha y los botones. */
    assert.equal(caja.querySelector("[data-consigna]"), null);
    for (const t of asi.guion.toques) {
      const el = t.texto ? boton(caja, t.texto) : caja.querySelector(t.en);
      assert.ok(el, `${k.id}: el guion toca «${t.en ?? t.texto}» y no está`);
      await tocar(el);
    }
    assert.ok(caja.querySelector('[data-panel-segundo]'), `${k.id}: el segundo nivel no se abrió`);
    assert.ok(caja.querySelector('[role="status"]').textContent.endsWith(asi.demo.items[0].acierto.slice(2)), `${k.id}: no se lee el acierto`);
    desmontar();
  }
});

test("★★★ en pantalla: la primera vez sale «Así se juega» con las tres reglas; luego, «¿Cómo se juega?» lo reabre", async () => {
  for (const k of CASOS) {
    localStorage.clear();
    const juego = { id: k.id, Mecanica: k.Mecanica, titulo: k.D.nombre };
    const { caja, desmontar } = await montar(h(JuegoConTutorial, { juego, usuarioId: "u", Marco, onCompletar: () => {} }));
    const pasos = () => [...caja.querySelectorAll("ol[data-asj-pasos] li")].map((li) => li.textContent.replace(/^\d/, ""));
    assert.deepEqual(pasos(), k.reglas, `${k.id}: las reglas no se ven`);
    await tocar(boton(caja, "Siguiente"));
    assert.deepEqual(pasos(), []);
    const como = boton(caja, "?¿Cómo se juega?") ?? [...caja.querySelectorAll("button")].find((b) => b.textContent.includes("¿Cómo se juega?"));
    assert.ok(como, `${k.id}: la partida no ofrece «¿Cómo se juega?»`);
    await tocar(como);
    assert.deepEqual(pasos(), k.reglas, `${k.id}: «¿Cómo se juega?» no reabre las reglas`);
    desmontar();
  }
});
