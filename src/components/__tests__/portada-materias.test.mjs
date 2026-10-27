import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA PORTADA ENSEÑA LAS MATERIAS DEL SEMESTRE, NI UNA MÁS.
 *
 * Orden de Mateo del 27 de octubre: Pensamiento Estratégico sale de lo
 * visible en el inicio. No se borra la materia —sigue entera en subjects.js,
 * con sus temas y el progreso de quien ya la jugó—: se esconde su tarjeta.
 *
 * Esta prueba guarda las dos mitades de esa orden a la vez:
 *   1. la portada no ofrece Pensamiento Estratégico;
 *   2. la materia sigue existiendo, así que esto es reversible con la bandera.
 *
 * Si algún día Mateo la quiere de vuelta, PORTADA_ESTRATEGICO pasa a true y
 * esta prueba se reescribe para afirmar lo que entonces sea verdad. No se
 * afloja: una guarda que cede cuando molesta no guardaba nada.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", pretendToBeVisual: true, virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = (q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node,
  SVGElement: w.SVGElement, Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  requestAnimationFrame: w.requestAnimationFrame.bind(w), cancelAnimationFrame: w.cancelAnimationFrame.bind(w),
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const { default: HomeScreen, PORTADA_ESTRATEGICO } = await import("../HomeScreen.jsx");
const { SUBJECTS } = await import("../../data/subjects.js");

async function portada() {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => {
    raiz.render(h(HomeScreen, { onSelectSubject() {} }));
  });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}

test("★★★ la portada no ofrece Pensamiento Estratégico", async () => {
  assert.equal(PORTADA_ESTRATEGICO, false, "la bandera está apagada (orden del 27-oct)");
  const p = await portada();
  try {
    const etiquetas = [...p.caja.querySelectorAll("[aria-label]")].map((e) => e.getAttribute("aria-label"));
    assert.ok(
      !etiquetas.some((e) => /estrat/i.test(e)),
      `ninguna tarjeta de la portada nombra la materia; encontradas: ${etiquetas.join(" · ")}`,
    );
    assert.ok(
      !/Pensamiento Estrat/i.test(p.caja.textContent),
      "el texto de la portada tampoco la nombra",
    );
  } finally { p.desmontar(); }
});

test("★★★ la portada sí ofrece las dos materias en curso", async () => {
  const p = await portada();
  try {
    const etiquetas = [...p.caja.querySelectorAll("[aria-label]")].map((e) => e.getAttribute("aria-label"));
    for (const esperada of [/macro/i, /contabilidad/i]) {
      assert.ok(etiquetas.some((e) => esperada.test(e)), `la portada ofrece ${esperada}`);
    }
  } finally { p.desmontar(); }
});

test("★★★ esconder la tarjeta no borró la materia: sigue entera en los datos", () => {
  const m = SUBJECTS["pensamiento-estrategico"];
  assert.ok(m, "la materia sigue en SUBJECTS");
  assert.ok(m.topics?.length > 0, "y conserva sus temas, así que nadie perdió su progreso");
});
