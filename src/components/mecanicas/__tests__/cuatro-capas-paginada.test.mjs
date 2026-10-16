/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CUATROCAPAS · LA CAPA 1 PAGINADA — un término por pantalla (Mai, 15-oct).
 *
 *   · con un término, la capa 1 es la de siempre: sin contador ni botones;
 *   · con varios: «Término N de M», un punto por término (la forma dice el
 *     estado), «Anterior» y «Siguiente» en el bloque pegado;
 *   · solo la carta actual se ve; las demás no llegan al lector ni al foco;
 *   · el foco pasa al nombre del término al cambiar;
 *   · en el último, «Continuar» lleva a la capa 2 y le pone el foco al rótulo;
 *   · la cita y la nota van plegadas en «Más sobre este término»;
 *   · la figura, si la hay, va entre el nombre y la definición;
 *   · el cambio es de opacidad en 200 ms, y al instante con movimiento reducido.
 * CuatroCapas es compartido (9 vistas): esto vigila que la paginada no
 * cambie lo que ya existía.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (f) => setTimeout(f, 0);
w.cancelAnimationFrame = (n) => clearTimeout(n);
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  requestAnimationFrame: w.requestAnimationFrame, cancelAnimationFrame: w.cancelAnimationFrame,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const { default: CuatroCapas } = await import("../maquinas/CuatroCapas.jsx");

const vacia = () => React.createElement("div");
const CITA = "«Una frase del libro, textual.» (p. 10)";
const NOMBRES = [
  { termino: "Primero", definicion: "La definición del primero." },
  { termino: "Segundo", definicion: "La definición del segundo.", delLibro: CITA },
  { termino: "Tercero", definicion: "La definición del tercero.", delLibro: "Una nota nuestra.", rotuloDelLibro: "Nota" },
];
const pieza = (nombres, extra = {}) => ({ id: "prueba", titulo: "Una pieza", objetivo: "Vas a ver algo.", nombres, ...extra });

function montar(p) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  /* jsdom no trae scrollIntoView: se anota a quién se le pidió. */
  const desplazados = [];
  w.Element.prototype.scrollIntoView = function scrollIntoView(o) { desplazados.push([this, o]); };
  act(() => raiz.render(React.createElement(CuatroCapas, { pieza: p, Capa2: vacia, Exploracion: vacia, Capa4: vacia })));
  return { caja, desplazados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}
const click = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
const capa1 = (caja) => caja.querySelector('[data-capa="1"]');
const visible = (caja) => capa1(caja).querySelector("[data-termino][data-actual]");
const contador = (caja) => capa1(caja).querySelector("[data-contador]")?.textContent;
const estados = (caja) => [...capa1(caja).querySelectorAll("[data-punto]")].map((p) => p.getAttribute("data-estado"));
const siguiente = (caja) => capa1(caja).querySelector("[data-siguiente]");
const anterior = (caja) => capa1(caja).querySelector("[data-anterior]");

test("★★★ con un solo término, la capa 1 es la de siempre: sin contador, sin puntos, sin botones y la cita a la vista", () => {
  const { caja, desmontar } = montar(pieza([NOMBRES[1]]));
  try {
    const c1 = capa1(caja);
    assert.equal(c1.querySelector("[data-capa1-paginada]"), null, "se pintó la paginada con un término");
    assert.equal(c1.querySelector("[data-contador]"), null);
    assert.equal(c1.querySelectorAll("button").length, 0, "la capa 1 de un término no lleva botones");
    assert.ok(!c1.textContent.includes("Término 1 de 1"));
    /* La estructura de siempre: <dl> con «Término: » en línea y la definición al lado. */
    const fila = c1.querySelector("dl > div");
    assert.equal(fila.querySelector("dt").textContent, "Segundo: ");
    assert.equal(fila.querySelector("dd").textContent, NOMBRES[1].definicion);
    assert.equal(fila.querySelector("dt").style.display, "inline");
    /* La cita no se pliega: está a la vista, con su rótulo. */
    const cita = fila.querySelector("[data-del-libro]");
    assert.ok(cita && !cita.closest("[hidden]"));
    assert.equal(cita.firstElementChild.textContent, "Así lo dice el libro");
    assert.equal(cita.lastElementChild.textContent, CITA);
    /* Y el rótulo de la capa 2 no se vuelve enfocable. */
    assert.equal(caja.querySelector('[data-capa="2"] > p').getAttribute("tabindex"), null);
  } finally { desmontar(); }
});

test("★★★ la pieza que pide `capa1EnLista` conserva todos los términos a la vez", () => {
  const { caja, desmontar } = montar(pieza(NOMBRES, { capa1EnLista: true }));
  try {
    const c1 = capa1(caja);
    assert.equal(c1.querySelector("[data-capa1-paginada]"), null);
    assert.deepEqual([...c1.querySelectorAll("dl > div > dt")].map((d) => d.textContent), ["Primero: ", "Segundo: ", "Tercero: "]);
    assert.equal(c1.querySelectorAll("[data-del-libro]").length, 2);
    assert.equal(c1.querySelectorAll("button").length, 0);
  } finally { desmontar(); }
});

test("★★★ varios términos: «Término N de M», un punto por término y solo la carta actual se ve", () => {
  const { caja, desmontar } = montar(pieza(NOMBRES));
  try {
    assert.equal(contador(caja), "Término 1 de 3");
    const puntos = [...capa1(caja).querySelectorAll("[data-punto]")];
    assert.equal(puntos.length, 3);
    /* Cada punto: 28 × 44, con el nombre del término para el lector. */
    assert.deepEqual(puntos.map((p) => p.getAttribute("aria-label")), ["Primero", "Segundo", "Tercero"]);
    for (const p of puntos) { assert.equal(p.style.width, "28px"); assert.equal(p.style.height, "44px"); }
    assert.deepEqual(puntos.map((p) => p.getAttribute("aria-current")), ["step", null, null]);
    assert.deepEqual(estados(caja), ["actual", "sin-ver", "sin-ver"]);
    /* La forma dice el estado: el actual mide 12 y lleva anillo; los otros, 8; el que falta, solo contorno. */
    const formas = puntos.map((p) => p.firstElementChild.style);
    assert.equal(formas[0].width, "12px");
    assert.ok(formas[0].boxShadow.length > 0, "el actual no lleva anillo");
    assert.equal(formas[1].width, "8px");
    assert.equal(formas[1].backgroundColor, "transparent");
    assert.ok(formas[1].border.length > 0);

    /* Una sola carta a la vista; las otras, fuera de la vista, del lector y del foco. */
    const cartas = [...capa1(caja).querySelectorAll("[data-termino]")];
    assert.equal(cartas.length, 3);
    assert.equal(visible(caja).querySelector("[data-nombre-termino]").textContent, "Primero");
    for (const c of cartas.filter((x) => !x.hasAttribute("data-actual"))) {
      assert.equal(c.getAttribute("aria-hidden"), "true");
      assert.ok(c.hasAttribute("inert"));
      assert.equal(c.style.visibility, "hidden");
    }
    assert.equal(visible(caja).style.visibility, "visible");
    /* Todas en la misma celda: la celda mide lo que la más alta y los botones no se mueven. */
    assert.ok(cartas.every((c) => c.style.gridArea.startsWith("1 / 1")));
    assert.equal(capa1(caja).querySelector("[data-cartas]").style.display, "grid");

    /* El nombre del término es un encabezado que recibe el foco, sin contorno visible. */
    const h = visible(caja).querySelector("[data-nombre-termino]");
    assert.equal(h.tagName, "H4");
    assert.equal(h.getAttribute("tabindex"), "-1");
    assert.equal(h.style.outline, "none");
  } finally { desmontar(); }
});

test("★★★ «Siguiente» y «Anterior» recorren los términos, y el foco pasa al nombre del nuevo", () => {
  const { caja, desmontar } = montar(pieza(NOMBRES));
  try {
    assert.equal(anterior(caja).disabled, true, "«Anterior» activo en el primer término");
    assert.equal(siguiente(caja).textContent, "Siguiente");
    click(siguiente(caja));
    assert.equal(contador(caja), "Término 2 de 3");
    assert.deepEqual(estados(caja), ["visto", "actual", "sin-ver"]);
    assert.equal(document.activeElement, visible(caja).querySelector("[data-nombre-termino]"));
    assert.equal(document.activeElement.textContent, "Segundo");
    assert.equal(anterior(caja).disabled, false);

    click(anterior(caja));
    assert.equal(contador(caja), "Término 1 de 3");
    assert.deepEqual(estados(caja), ["actual", "visto", "sin-ver"]);
    assert.equal(document.activeElement.textContent, "Primero");
  } finally { desmontar(); }
});

test("★★★ los puntos llevan al término, y en el último «Siguiente» pasa a «Continuar»", () => {
  const { caja, desmontar } = montar(pieza(NOMBRES));
  try {
    click(capa1(caja).querySelector('[data-punto="2"]'));
    assert.equal(contador(caja), "Término 3 de 3");
    assert.equal(visible(caja).querySelector("[data-nombre-termino]").textContent, "Tercero");
    assert.deepEqual(estados(caja), ["visto", "sin-ver", "actual"]);
    assert.equal(capa1(caja).querySelector('[data-punto="2"]').getAttribute("aria-current"), "step");
    assert.equal(siguiente(caja).textContent, "Continuar");
    /* Desde los puntos se vuelve a cualquiera. */
    click(capa1(caja).querySelector('[data-punto="1"]'));
    assert.equal(contador(caja), "Término 2 de 3");
    assert.equal(siguiente(caja).textContent, "Siguiente");
  } finally { desmontar(); }
});

test("★★★ «Continuar» baja a la capa 2, le pone el foco a su rótulo y deja todos los puntos vistos", () => {
  const { caja, desplazados, desmontar } = montar(pieza(NOMBRES));
  try {
    click(siguiente(caja));
    click(siguiente(caja));
    assert.equal(siguiente(caja).textContent, "Continuar");
    desplazados.length = 0;
    click(siguiente(caja));
    const capa2 = caja.querySelector('[data-capa="2"]');
    const rotulo = capa2.querySelector(":scope > p");
    assert.equal(document.activeElement, rotulo, "el foco no llegó al rótulo de la capa 2");
    assert.match(rotulo.textContent, /MÍRELO FUNCIONAR/);
    assert.equal(rotulo.getAttribute("tabindex"), "-1");
    assert.ok(desplazados.some(([el]) => el === capa2), "la página no bajó a la capa 2");
    /* Desplazamiento suave (sin movimiento reducido). */
    assert.equal(desplazados.find(([el]) => el === capa2)[1].behavior, "smooth");
    /* La capa 1 se queda en el último término, con todos los puntos vistos. Sin pantalla de resumen. */
    assert.equal(contador(caja), "Término 3 de 3");
    assert.deepEqual(estados(caja), ["visto", "visto", "actual"]);
    assert.equal(capa1(caja).querySelectorAll("[data-termino]").length, 3);
  } finally { desmontar(); }
});

test("★★ con movimiento reducido, «Continuar» baja directo y el cambio de término es instantáneo", () => {
  const antes = w.matchMedia;
  w.matchMedia = (q) => ({ matches: q.includes("reduce"), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
  const { caja, desplazados, desmontar } = montar(pieza(NOMBRES));
  try {
    const css = capa1(caja).querySelector("style").textContent;
    assert.match(css, /\.fae-cc-carta \{ transition: opacity 200ms/);
    assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{[^}]*\.fae-cc-carta[^}]*transition: none/);
    assert.ok([...capa1(caja).querySelectorAll("[data-termino]")].every((c) => c.classList.contains("fae-cc-carta")));
    click(capa1(caja).querySelector('[data-punto="2"]'));
    click(siguiente(caja));
    assert.equal(desplazados.find(([el]) => el === caja.querySelector('[data-capa="2"]'))[1].behavior, "auto");
  } finally { desmontar(); w.matchMedia = antes; }
});

test("★★★ la cita y la nota van plegadas en «Más sobre este término»; sin ellas, no hay «Más»", () => {
  const { caja, desmontar } = montar(pieza(NOMBRES));
  try {
    /* Término 1: sin cita ni nota, sin control. */
    assert.equal(visible(caja).querySelector("[data-mas]"), null);
    click(siguiente(caja));
    const mas = visible(caja).querySelector("[data-mas]");
    assert.equal(mas.textContent, "Más sobre este término");
    assert.equal(mas.getAttribute("aria-expanded"), "false");
    const contenido = visible(caja).querySelector("[data-mas-contenido]");
    assert.equal(mas.getAttribute("aria-controls"), contenido.id);
    assert.ok(contenido.hidden, "la cita se ve sin abrir «Más»");
    /* La definición sigue a la vista, ANTES del control. */
    const def = visible(caja).querySelector("[data-definicion]");
    assert.equal(def.textContent, NOMBRES[1].definicion);
    assert.ok(def.compareDocumentPosition(mas) & w.Node.DOCUMENT_POSITION_FOLLOWING);

    click(mas);
    assert.equal(mas.getAttribute("aria-expanded"), "true");
    assert.equal(contenido.hidden, false);
    const caja1 = contenido.querySelector("[data-del-libro]");
    assert.equal(caja1.firstElementChild.textContent, "Así lo dice el libro");
    assert.equal(caja1.lastElementChild.textContent, CITA);

    /* Al cambiar de término, «Más» vuelve cerrado; la nota lleva su rótulo. */
    click(siguiente(caja));
    const mas3 = visible(caja).querySelector("[data-mas]");
    assert.equal(mas3.getAttribute("aria-expanded"), "false");
    assert.ok(visible(caja).querySelector("[data-mas-contenido]").hidden);
    click(mas3);
    const nota = visible(caja).querySelector("[data-mas-contenido] [data-del-libro]");
    assert.equal(nota.firstElementChild.textContent, "Nota");
    assert.equal(nota.lastElementChild.textContent, "Una nota nuestra.");
    /* Las cartas ocultas no traen el contenido plegado: no se lee ni se enfoca. */
    assert.equal(capa1(caja).querySelectorAll("[data-mas-contenido]").length, 1);
  } finally { desmontar(); }
});

test("★★ la figura, si la hay, va entre el nombre y la definición, con 150 de alto como mucho; sin figura, no hay hueco", () => {
  const Figura = () => React.createElement("svg", { "data-figura-de-prueba": "", width: 100, height: 60 });
  const { caja, desmontar } = montar(pieza([{ ...NOMBRES[0], figura: Figura }, NOMBRES[1]]));
  try {
    const carta = visible(caja);
    const hijos = [...carta.children].map((c) => c.getAttribute("data-figura") !== null ? "figura" : c.hasAttribute("data-nombre-termino") ? "nombre" : c.hasAttribute("data-definicion") ? "definicion" : c.tagName);
    assert.deepEqual(hijos, ["nombre", "figura", "definicion"]);
    const hueco = carta.querySelector("[data-figura]");
    assert.ok(hueco.querySelector("[data-figura-de-prueba]"));
    assert.equal(hueco.style.maxHeight, "150px");
    click(siguiente(caja));
    assert.equal(visible(caja).querySelector("[data-figura]"), null);
  } finally { desmontar(); }
});

test("★★ el bloque de «Anterior» y «Siguiente» es el pegado de la capa 2: borde arriba, fondo opaco, botones de 44", () => {
  const { caja, desmontar } = montar(pieza(NOMBRES));
  try {
    const bloque = capa1(caja).querySelector("[data-nav-capa1]");
    assert.ok(bloque.style.borderTop.length > 0);
    assert.ok(/^(#|rgb\()/.test(bloque.style.background) || bloque.style.backgroundColor.length > 0);
    for (const b of [anterior(caja), siguiente(caja)]) { assert.equal(b.style.height, "44px"); assert.equal(b.style.borderRadius, "999px"); }
    /* Y va DESPUÉS de las cartas, al pie de la capa 1. */
    assert.ok(capa1(caja).querySelector("[data-cartas]").compareDocumentPosition(bloque) & w.Node.DOCUMENT_POSITION_FOLLOWING);
  } finally { desmontar(); }
});
