import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA TARJETA PARTIDA: DOS OPCIONES DEL MISMO PESO (Xeno).
 *
 * «Aprender» y «Hacer» son una ELECCIÓN entre dos. Por eso:
 *
 *   · pesan igual: mismo fondo, mismo borde. Si una fuera llena y la otra de
 *     contorno, la que pesa más empujaría la elección sin que nadie lo decida.
 *   · se distinguen por forma —el dibujo y la palabra—, no por tono: el glifo
 *     de Aprender es de contorno y el de Hacer es lleno, el mismo código que la
 *     insignia, confinado a 18 px para no cambiar el peso del botón.
 *   · ninguna lleva teal ni coral. El coral es «error» en todo el sitio y el
 *     teal es «correcto» y «debe»: ninguno puede rotular también una mitad.
 *
 * Se comprueba con el DOM montado, no con el código fuente: un comentario que
 * dice que algo está cubierto no es una comprobación.
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

const { default: TopicSplitCard } = await import("../TopicSplitCard.jsx");
const { SUBJECTS, HACER } = await import("../../data/subjects.js");

const MONETARIA = SUBJECTS.macroeconomia.topics.find((t) => t.id === "politica-monetaria");
const SIN_HACER = { ...MONETARIA, actividades: MONETARIA.actividades.filter((a) => a.clasificacion?.tipo !== HACER) };

const abrir = async (topic) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => {
    raiz.render(h(TopicSplitCard, { topic, icon: null, badges: [], accent: "#fff", hoverBg: "", hoverBorder: "", abierta: true, onAbrir() {}, onCerrar() {}, onElegirModo() {} }));
  });
  const [aprender, hacer] = [...caja.querySelectorAll("button.fae-modo")];
  return { caja, aprender, hacer, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};

test("★★★ las dos opciones pesan igual: mismo fondo y mismo borde", async () => {
  const t = await abrir(MONETARIA);
  try {
    assert.ok(t.aprender && t.hacer, "hay dos botones de modo");
    assert.equal(t.aprender.style.background, t.hacer.style.background);
    assert.equal(t.aprender.style.border, t.hacer.style.border);
    assert.equal(t.aprender.style.getPropertyValue("--fae-modo-hover-bg"), t.hacer.style.getPropertyValue("--fae-modo-hover-bg"));
    assert.equal(t.aprender.style.getPropertyValue("--fae-modo-hover-border"), t.hacer.style.getPropertyValue("--fae-modo-hover-border"));
  } finally { t.desmontar(); }
});

test("★★★ se distinguen por forma: dibujo de contorno contra dibujo lleno, y la palabra", async () => {
  const t = await abrir(MONETARIA);
  try {
    const ga = t.aprender.querySelector("svg");
    const gh = t.hacer.querySelector("svg");
    assert.ok(ga && gh, "cada opción lleva su glifo");
    assert.equal(ga.getAttribute("aria-hidden"), "true");
    assert.equal(gh.getAttribute("aria-hidden"), "true");
    assert.equal(ga.getAttribute("fill"), "none", "Aprender: contorno");
    assert.equal(gh.getAttribute("fill"), "currentColor", "Hacer: lleno");
    assert.notEqual(ga.innerHTML, gh.innerHTML, "no es el mismo dibujo");
    assert.match(t.aprender.textContent, /Aprender/);
    assert.match(t.hacer.textContent, /Hacer/);
  } finally { t.desmontar(); }
});

test("★★ ni teal ni coral en la cara abierta: ninguno rotula una mitad", async () => {
  const t = await abrir(MONETARIA);
  try {
    const html = [t.aprender, t.hacer].map((b) => b.outerHTML).join("");
    assert.doesNotMatch(html, /2a9d8f|42,\s*157,\s*143|e76f51|231,\s*111,\s*81/i);
  } finally { t.desmontar(); }
});

test("★★ sin contenido de Hacer: sigue deshabilitada, lo dice, y conserva su forma", async () => {
  const t = await abrir(SIN_HACER);
  try {
    assert.equal(t.hacer.disabled, true);
    assert.match(t.hacer.getAttribute("aria-label"), /aún no disponible/);
    assert.match(t.hacer.textContent, /Aún no disponible/);
    assert.ok(t.hacer.querySelector("svg"), "el glifo no desaparece");
    assert.equal(t.aprender.disabled, false);
  } finally { t.desmontar(); }
});
