import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL VEREDICTO DE LAS PIEZAS COMPARTIDAS SE DICE CON FORMA (Xeno).
 *
 * El teal y el coral de la marca miden lo mismo en gris (1,07:1). Si «bien» y
 * «mal» se distinguen solo por el matiz del borde, en blanco y negro son el
 * mismo borde. La comprobación es la del blanco y negro hecha prueba: se le
 * QUITAN todos los estilos al DOM montado y los estados tienen que seguir
 * siendo distintos. Un comentario que dice que algo está cubierto no es una
 * comprobación; esto sí, porque falla cuando la afirmación es falsa.
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

const { ElegirLado } = await import("../../components/mecanicas/libros/piezas.jsx");

const TEAL = "rgb(42, 157, 143)";
const AMBAR = "rgb(233, 196, 106)";
const CORAL = "rgb(231, 111, 81)";

/* El DOM sin una sola regla de estilo: lo que queda es lo que viaja en blanco y negro. */
const sinEstilo = (el) => el.outerHTML.replace(/ style="[^"]*"/g, "");

const montar = async (props) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(ElegirLado, { onElegir() {}, ...props })); });
  const [debe, haber] = [...caja.querySelectorAll("button")];
  return { caja, debe, haber, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};

test("★★★ ElegirLado, error: el bueno y el elegido mal siguen siendo distintos SIN estilos", async () => {
  const t = await montar({ elegido: "haber", correcto: "debe", deshabilitado: true });
  try {
    assert.notEqual(sinEstilo(t.debe), sinEstilo(t.haber), "sin estilos, los dos botones son el mismo");
    assert.equal(t.debe.querySelector("svg")?.dataset.veredicto, "bien", "el bueno lleva ✓");
    assert.equal(t.haber.querySelector("svg")?.dataset.veredicto, "mal", "el elegido mal lleva ✗");
  } finally { t.desmontar(); }
});

test("★★★ ElegirLado, error invertido: lo mismo con el otro lado", async () => {
  const t = await montar({ elegido: "debe", correcto: "haber", deshabilitado: true });
  try {
    assert.notEqual(sinEstilo(t.debe), sinEstilo(t.haber));
    assert.equal(t.haber.querySelector("svg")?.dataset.veredicto, "bien");
    assert.equal(t.debe.querySelector("svg")?.dataset.veredicto, "mal");
  } finally { t.desmontar(); }
});

test("★★★ el acierto conserva el tono de SU lado: un haber correcto no se pinta con el teal del debe", async () => {
  const haber = await montar({ elegido: "haber", correcto: "haber", deshabilitado: true });
  const debe = await montar({ elegido: "debe", correcto: "debe", deshabilitado: true });
  try {
    assert.ok(haber.haber.style.border.includes(AMBAR), "haber correcto: borde ámbar");
    assert.ok(!haber.haber.outerHTML.includes(TEAL.replace(/ /g, "")) && !haber.haber.style.border.includes(TEAL), "haber correcto: ni rastro del teal del debe");
    assert.ok(debe.debe.style.border.includes(TEAL), "debe correcto: borde teal");
  } finally { haber.desmontar(); debe.desmontar(); }
});

test("★★ el acierto lleva una sola marca (✓) y el otro lado ninguna", async () => {
  const t = await montar({ elegido: "debe", correcto: "debe", deshabilitado: true });
  try {
    assert.equal(t.debe.querySelectorAll("svg").length, 1);
    assert.equal(t.debe.querySelector("svg").dataset.veredicto, "bien");
    assert.equal(t.haber.querySelectorAll("svg").length, 0);
  } finally { t.desmontar(); }
});

test("★★ sin veredicto no hay marca; elegir no es calificar", async () => {
  const t = await montar({ elegido: "debe", correcto: null });
  try {
    assert.equal(t.caja.querySelectorAll("svg").length, 0);
    assert.equal(t.debe.disabled, false);
  } finally { t.desmontar(); }
});

test("★★ la marca habla: quien no ve el dibujo oye el veredicto", async () => {
  const t = await montar({ elegido: "haber", correcto: "debe", deshabilitado: true });
  try {
    assert.equal(t.debe.querySelector("svg").getAttribute("role"), "img");
    assert.equal(t.debe.querySelector("svg").getAttribute("aria-label"), "Lado correcto");
    assert.equal(t.haber.querySelector("svg").getAttribute("aria-label"), "Tu respuesta, incorrecta");
  } finally { t.desmontar(); }
});

test("★★ la marca no ensucia el texto: los botones siguen leyéndose «Debe» y «Haber»", async () => {
  const t = await montar({ elegido: "haber", correcto: "debe", deshabilitado: true });
  try {
    assert.equal(t.debe.textContent.trim(), "Debe");
    assert.equal(t.haber.textContent.trim(), "Haber");
  } finally { t.desmontar(); }
});

test("★ el error conserva el coral: no significa ningún lado", async () => {
  const t = await montar({ elegido: "haber", correcto: "debe", deshabilitado: true });
  try {
    assert.ok(t.haber.style.border.includes(CORAL));
  } finally { t.desmontar(); }
});
