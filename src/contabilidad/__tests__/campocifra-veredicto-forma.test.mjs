import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA CIFRA CORREGIDA SE DICE CON FORMA (Xeno).
 *
 * CampoCifra corregía la cifra con el borde: teal si estaba bien, coral si
 * estaba mal. Teal y coral miden lo mismo en gris (1,07:1), así que en blanco
 * y negro una cifra bien y una mal eran el mismo campo. Aquí se hace la
 * comprobación del blanco y negro como prueba: se le QUITAN todos los estilos
 * al DOM montado y los tres estados —sin corregir, correcta, incorrecta— tienen
 * que seguir siendo distintos entre sí.
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

const { CampoCifra } = await import("../../components/mecanicas/libros/piezas.jsx");

const TEAL = "rgb(42, 157, 143)";
const CORAL = "rgb(231, 111, 81)";

const sinEstilo = (el) => el.outerHTML.replace(/ style="[^"]*"/g, "");

const montar = async (props) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(CampoCifra, { valor: "1350", onCambio() {}, etiqueta: "Saldo de Caja", ...props })); });
  return { caja, form: caja.querySelector("form"), input: caja.querySelector("input"), desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};

test("★★★ CampoCifra: sin corregir, correcta e incorrecta son tres campos distintos SIN estilos", async () => {
  const sin = await montar({});
  const ok = await montar({ estado: "correcta", deshabilitado: true });
  const mal = await montar({ estado: "incorrecta", deshabilitado: true });
  try {
    const [a, b, c] = [sinEstilo(sin.form), sinEstilo(ok.form), sinEstilo(mal.form)];
    assert.notEqual(a, b, "sin estilos, la cifra correcta se ve igual que la que no se corrigió");
    assert.notEqual(a, c, "sin estilos, la cifra incorrecta se ve igual que la que no se corrigió");
    assert.notEqual(b, c, "sin estilos, la cifra bien y la cifra mal son el mismo campo");
  } finally { sin.desmontar(); ok.desmontar(); mal.desmontar(); }
});

test("★★ la marca de la cifra: ✓ si está bien, ✗ si está mal, con su etiqueta", async () => {
  const ok = await montar({ estado: "correcta", deshabilitado: true });
  const mal = await montar({ estado: "incorrecta", deshabilitado: true });
  try {
    const svgOk = ok.form.querySelector("svg");
    const svgMal = mal.form.querySelector("svg");
    assert.equal(svgOk?.dataset.veredicto, "bien");
    assert.equal(svgOk?.getAttribute("role"), "img");
    assert.equal(svgOk?.getAttribute("aria-label"), "Cifra correcta");
    assert.equal(svgMal?.dataset.veredicto, "mal");
    assert.equal(svgMal?.getAttribute("aria-label"), "Cifra incorrecta");
  } finally { ok.desmontar(); mal.desmontar(); }
});

test("★ sin corregir no hay marca, y el campo sigue editable", async () => {
  const t = await montar({});
  try {
    assert.equal(t.form.querySelector("svg"), null, "salió una marca antes de corregir");
    assert.equal(t.input.disabled, false);
  } finally { t.desmontar(); }
});

test("★ una sola marca por campo, y el borde conserva su tono (teal / coral)", async () => {
  const ok = await montar({ estado: "correcta", deshabilitado: true });
  const mal = await montar({ estado: "incorrecta", deshabilitado: true });
  try {
    assert.equal(ok.form.querySelectorAll("svg").length, 1);
    assert.equal(mal.form.querySelectorAll("svg").length, 1);
    assert.ok(ok.input.style.borderTop.includes(TEAL), "cifra correcta: borde teal");
    assert.ok(mal.input.style.borderTop.includes(CORAL), "cifra incorrecta: borde coral");
  } finally { ok.desmontar(); mal.desmontar(); }
});

test("★ la marca no toca lo que el campo dice ni lo que contiene", async () => {
  const ok = await montar({ estado: "correcta", deshabilitado: true });
  try {
    assert.equal(ok.input.value, "1350");
    assert.equal(ok.input.getAttribute("aria-label"), "Saldo de Caja");
    assert.equal(ok.form.textContent, "$", "la marca no debe agregar texto al formulario");
  } finally { ok.desmontar(); }
});
