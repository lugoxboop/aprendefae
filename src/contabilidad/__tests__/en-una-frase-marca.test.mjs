import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «EN UNA FRASE»: CUÁL ERA LA BUENA SE DICE CON PALABRAS, NO CON EL TONO.
 *
 * Esta pieza no califica a nadie: la correcta va en teal y la elegida en
 * ámbar, nunca en coral, porque aquí no hay un error que marcar sino una
 * confusión que desmontar. Pero eso dejaba el tono como ÚNICA señal dentro de
 * la lista: quien no distingue teal de ámbar veía dos opciones resaltadas
 * igual y tenía que bajar a leer la devolución para saber cuál era cuál.
 *
 * La información no se perdía —la devolución lo dice—, pero la regla de
 * kit.md es que el color sea la SEGUNDA señal, nunca la única. Así que cada
 * una lleva ahora su palabra: «esta es» y «la tuya».
 *
 * Se comprueba con el DOM montado y tocando de verdad, no leyendo el código:
 * un comentario que dice que algo está cubierto no es una comprobación.
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

const { default: EnUnaFrase } = await import("../../components/mecanicas/libros/debeHaber/EnUnaFrase.jsx");

const montar = async () => {
  const caja = w.document.createElement("div");
  w.document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => raiz.render(h(EnUnaFrase)));
  return { caja, raiz };
};

const opciones = (caja) => [...caja.querySelectorAll("[data-opcion]")];
const palabra = (b) => (b.textContent || "").trim();

test("★★★ antes de elegir, ninguna opción lleva marca: la marca es el veredicto, no un adorno", async () => {
  const { caja, raiz } = await montar();
  const bs = opciones(caja);
  assert.ok(bs.length >= 4, `se esperaban las cuatro opciones y hay ${bs.length}`);
  for (const b of bs) {
    assert.doesNotMatch(palabra(b), /esta es|la tuya/i, `«${palabra(b).slice(0, 40)}» ya venía marcada sin que nadie eligiera`);
  }
  await act(async () => raiz.unmount());
});

test("★★★ al elegir la INCORRECTA: la buena dice «esta es» y la elegida dice «la tuya»", async () => {
  const { caja, raiz } = await montar();
  const mala = opciones(caja).find((b) => b.getAttribute("data-opcion") !== "ecuacion-contable" && !b.disabled);
  assert.ok(mala, "no encontré una opción que tocar");
  const idMala = mala.getAttribute("data-opcion");
  await act(async () => mala.dispatchEvent(new w.MouseEvent("click", { bubbles: true })));

  const marcadas = opciones(caja).filter((b) => /esta es|la tuya/i.test(palabra(b)));
  assert.ok(marcadas.length >= 1, "tras elegir, ninguna opción quedó marcada con palabras");

  const correcta = opciones(caja).find((b) => b.getAttribute("data-estado") === "correcta");
  assert.ok(correcta, "ninguna opción quedó en estado «correcta»");
  assert.match(palabra(correcta), /esta es/i, "la opción correcta no dice «esta es»");

  const elegida = opciones(caja).find((b) => b.getAttribute("data-opcion") === idMala);
  if (elegida.getAttribute("data-estado") === "elegida") {
    assert.match(palabra(elegida), /la tuya/i, "la opción elegida no dice «la tuya»");
  }
  await act(async () => raiz.unmount());
});

test("★★★ las que no se eligieron y no son la buena NO llevan marca: si todas llevan, la marca no dice nada", async () => {
  const { caja, raiz } = await montar();
  const alguna = opciones(caja).find((b) => !b.disabled);
  await act(async () => alguna.dispatchEvent(new w.MouseEvent("click", { bubbles: true })));
  for (const b of opciones(caja)) {
    if (b.getAttribute("data-estado") === "otra") {
      assert.doesNotMatch(palabra(b), /esta es|la tuya/i, "una opción ni correcta ni elegida salió marcada");
    }
  }
  await act(async () => raiz.unmount());
});

test("★★ y el coral sigue sin aparecer: aquí nadie se está equivocando en una evaluación", async () => {
  const { caja, raiz } = await montar();
  const alguna = opciones(caja).find((b) => !b.disabled);
  await act(async () => alguna.dispatchEvent(new w.MouseEvent("click", { bubbles: true })));
  for (const b of opciones(caja)) {
    const cs = w.getComputedStyle(b);
    const pintura = `${cs.borderColor} ${cs.backgroundColor} ${cs.color}`;
    assert.doesNotMatch(pintura, /231,\s*111,\s*81|#E76F51/i, "apareció coral, y el coral significa error en todo el sitio");
  }
  await act(async () => raiz.unmount());
});
