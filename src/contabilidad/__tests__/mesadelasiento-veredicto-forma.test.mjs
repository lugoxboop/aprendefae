import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA CUENTA T CORREGIDA SE DICE CON FORMA (Xeno).
 *
 * En «Arma el asiento», la mesa corrige cada cuenta con el borde de su marco:
 * teal si estaba bien, coral si estaba mal. Teal y coral miden lo mismo en gris
 * (1,07:1), así que en blanco y negro una cuenta bien puesta y una mal puesta
 * eran el mismo marco. Se hace la comprobación del blanco y negro como prueba:
 * se le QUITAN todos los estilos al DOM montado y los tres estados tienen que
 * seguir siendo distintos entre sí.
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

const { default: MesaDelAsiento } = await import("../../components/mecanicas/libros/MesaDelAsiento.jsx");

/*
 * EL ACIERTO YA NO VA EN TEAL (B4, barrida del 16-oct). En Contabilidad el teal
 * significa el lado DEBE, así que no puede significar además «correcto»: el
 * acierto va en el NEUTRO del kit (#F8F9FA), que es la regla de Xeno. Lo que
 * esta prueba defiende no cambia —que el borde conserve un tono ADEMÁS de la
 * marca, para que el color no sea la única señal—, y ahora exige también que el
 * teal no vuelva.
 */
const NEUTRO_ACIERTO = "rgb(248, 249, 250)";
const TEAL = "rgb(42, 157, 143)";
const CORAL = "rgb(231, 111, 81)";

const sinEstilo = (el) => el.outerHTML.replace(/ style="[^"]*"/g, "");

const FILAS = [{ cuenta: "Caja", lado: "debe" }, { cuenta: "Capital social", lado: "haber" }];

const montar = async (estados) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => {
    raiz.render(h(MesaDelAsiento, {
      filas: FILAS, desde: null, estados, deshabilitado: estados != null,
      onNombrar() {}, gestosDeZona: () => ({}), onTocarZona() {},
    }));
  });
  const marcos = [...caja.querySelectorAll("[data-t]")];
  return { caja, marcos, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};

test("★★★ cuenta T: sin corregir, bien puesta y mal puesta son tres marcos distintos SIN estilos", async () => {
  const sin = await montar(null);
  const ok = await montar(["correcta", "correcta"]);
  const mal = await montar(["incorrecta", "incorrecta"]);
  try {
    for (const i of [0, 1]) {
      const [a, b, c] = [sinEstilo(sin.marcos[i]), sinEstilo(ok.marcos[i]), sinEstilo(mal.marcos[i])];
      assert.notEqual(a, b, `cuenta ${i}: sin estilos, la bien puesta se ve igual que la que no se corrigió`);
      assert.notEqual(a, c, `cuenta ${i}: sin estilos, la mal puesta se ve igual que la que no se corrigió`);
      assert.notEqual(b, c, `cuenta ${i}: sin estilos, la bien puesta y la mal puesta son el mismo marco`);
    }
  } finally { sin.desmontar(); ok.desmontar(); mal.desmontar(); }
});

test("★★ cada cuenta lleva SU marca: una bien y otra mal en la misma mesa", async () => {
  const t = await montar(["correcta", "incorrecta"]);
  try {
    const s0 = t.marcos[0].querySelector("svg[data-veredicto]");
    const s1 = t.marcos[1].querySelector("svg[data-veredicto]");
    assert.equal(s0?.dataset.veredicto, "bien");
    assert.equal(s1?.dataset.veredicto, "mal");
    assert.equal(s0?.getAttribute("role"), "img");
    assert.equal(s0?.getAttribute("aria-label"), "Caja, bien puesta");
    assert.equal(s1?.getAttribute("aria-label"), "Capital social, mal puesta");
  } finally { t.desmontar(); }
});

test("★ sin corregir no hay marca en ninguna cuenta", async () => {
  const t = await montar(null);
  try {
    assert.equal(t.caja.querySelectorAll("svg[data-veredicto]").length, 0);
  } finally { t.desmontar(); }
});

test("★ la marca no mueve nada: va fuera del flujo y no agrega texto a la cuenta", async () => {
  const sin = await montar(null);
  const ok = await montar(["correcta", "correcta"]);
  try {
    for (const i of [0, 1]) {
      assert.equal(ok.marcos[i].textContent, sin.marcos[i].textContent, "la marca cambió el texto de la cuenta");
      const sitio = ok.marcos[i].querySelector("[data-marca-cuenta]");
      assert.equal(sitio?.style.position, "absolute", "la marca ocupa lugar en el flujo y empujaría el nombre");
      assert.equal(ok.marcos[i].style.position, "relative", "el marco no es la referencia de la marca");
      /* Y las dos columnas siguen siendo los mismos dos botones, en su sitio. */
      assert.deepEqual(
        [...ok.marcos[i].querySelectorAll("[data-zona]")].map((b) => b.dataset.zona),
        [...sin.marcos[i].querySelectorAll("[data-zona]")].map((b) => b.dataset.zona),
      );
    }
  } finally { sin.desmontar(); ok.desmontar(); }
});

test("★ el marco conserva su tono (teal / coral) además de la marca", async () => {
  const t = await montar(["correcta", "incorrecta"]);
  try {
    assert.ok(t.marcos[0].style.border.includes(NEUTRO_ACIERTO), "bien puesta: marco neutro");
    assert.ok(!t.marcos[0].style.border.includes(TEAL), "volvió el teal al acierto (B4)");
    assert.ok(t.marcos[1].style.border.includes(CORAL), "mal puesta: marco coral");
  } finally { t.desmontar(); }
});

test("★★ la ficha de «puesta aquí» no dice ✓ ni ✗: el único veredicto de la cuenta es el de su marco", async () => {
  /* Una cuenta mal puesta, con su lado ocupado: antes la ficha decía ✓ dentro de un marco con ✗. */
  const t = await montar(["incorrecta", "correcta"]);
  try {
    for (const i of [0, 1]) {
      const textoDeFichas = [...t.marcos[i].querySelectorAll("[data-ficha]")].map((f) => f.textContent).join("");
      assert.ok(!/[✓✔✗✘×]/.test(textoDeFichas), `cuenta ${i}: una ficha lleva un símbolo de veredicto («${textoDeFichas}»)`);
    }
    const unaPorMarco = t.marcos.map((m) => m.querySelectorAll("svg[data-veredicto]").length);
    assert.deepEqual(unaPorMarco, [1, 1], "cada cuenta tiene exactamente un veredicto");
    const ocupadas = t.marcos.map((m) => m.querySelectorAll('[data-ocupada="si"] [data-ficha]').length);
    assert.deepEqual(ocupadas, [1, 1], "la ficha de lado ocupado sigue estando");
  } finally { t.desmontar(); }
});
