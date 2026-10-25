import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T2 · TODO LO QUE SE TOCA MIDE AL MENOS 44 × 44 (Ukyo #585, lote T2-12).
 *
 * Seis Hacer del tema tenían controles por debajo del mínimo: las pastillas
 * «AL DEBE»/«AL HABER» del asiento compuesto a 26 px, las fichas a 35, los
 * signos del cuadro a 40. La corrección se gana con alto, relleno y aire
 * —nunca con letra—, así que cada pieza se prueba dos veces: que el control
 * mide 44 en su estilo, y que su letra es exactamente la de antes.
 *
 * Sin navegador no hay cajas medidas: lo que se lee es el estilo que React
 * pinta (`height`, `min-height`, `min-width`, `gap`, `font-size`). La medida
 * con cajas reales está en el cuerpo del PR, hecha con el banco común.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0);
w.cancelAnimationFrame = (id) => clearTimeout(id);
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
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
const act = React.act ?? (await import("react-dom/test-utils")).act;

const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const { FAE } = await import("../../theme.js");
const { DEBE } = await import("../../data/contabilidad.js");
const L = "../../components/mecanicas/libros/";
const SoltarEnUnLado = (await import(`${L}SoltarEnUnLado.jsx`)).default;
const ArmaElBalance = (await import(`${L}ArmaElBalance.jsx`)).default;
const CuadroDeDinamicas = (await import(`${L}CuadroDeDinamicas.jsx`)).default;
const DebitaOAcredita = (await import(`${L}DebitaOAcredita.jsx`)).default;
const ElAsientoSimple = (await import(`${L}ElAsientoSimple.jsx`)).default;
const ElAsientoCompuestoNuevo = (await import(`${L}ElAsientoCompuestoNuevo.jsx`)).default;

const MINIMO = 44;
const AIRE = 8;

function montar(Componente) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(React.createElement(Componente, {
    Marco: MarcoLibros, rotulo: "PRUEBA", titulo: "Prueba", acento: FAE.ambar, onCompletar: () => {},
  })));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}
const tocar = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
const px = (v) => (v ? parseFloat(v) : 0);
/** El alto que el estilo garantiza: el fijo o el mínimo, el mayor. */
const altoDe = (el) => Math.max(px(el.style.height), px(el.style.minHeight));

function controlesMiden(lista, que) {
  assert.ok(lista.length > 0, `${que}: no hay controles que medir`);
  for (const el of lista) {
    assert.ok(altoDe(el) >= MINIMO, `${que}: «${el.textContent.trim()}» garantiza ${altoDe(el)} px de alto`);
  }
}
function letraIgual(lista, fuente, que) {
  for (const el of lista) assert.equal(el.style.fontSize, fuente, `${que}: la letra cambió en «${el.textContent.trim()}»`);
}
const fichas = (caja) => [...caja.querySelectorAll("button[data-ficha]:not([disabled])")];

/* ═══════════════════ LAS SEIS PIEZAS ═══════════════════ */

test("cu-izquierda-o-derecha: la ficha mide 44 de alto y su letra sigue en 13 px", () => {
  const { caja, desmontar } = montar(SoltarEnUnLado);
  const f = fichas(caja);
  controlesMiden(f, "izquierda o derecha");
  letraIgual(f, "13px", "izquierda o derecha");
  /* Su ancho lo da el contenedor: 170 px, muy por encima del mínimo. */
  assert.ok(px(f[0].parentElement.style.maxWidth) >= MINIMO);
  desmontar();
});

test("cu-de-que-familia: la ficha de la cuenta mide 44 de alto y su letra sigue en 13 px", () => {
  const { caja, desmontar } = montar(ArmaElBalance);
  const f = fichas(caja);
  controlesMiden(f, "de qué familia");
  letraIgual(f, "13px", "de qué familia");
  desmontar();
});

test("cu-cuadro-dinamicas: los signos y la casilla activa miden 44; la fila los contiene", () => {
  const { caja, desmontar } = montar(CuadroDeDinamicas);
  const f = fichas(caja);
  assert.equal(f.length, 2, "los dos signos");
  controlesMiden(f, "cuadro, signos");
  letraIgual(f, "13px", "cuadro, signos");
  /* Con un signo en arrastre, la casilla del debe de la fila activa se vuelve botón. */
  const puntero = (tipo, x) => act(() => {
    const e = new w.MouseEvent(tipo, { bubbles: true, clientX: x, clientY: 0 });
    Object.defineProperty(e, "pointerId", { value: 1 });
    f[0].dispatchEvent(e);
  });
  puntero("pointerdown", 0);
  puntero("pointermove", 40);
  const celda = caja.querySelector(`button[data-celda="${DEBE}"]`);
  assert.ok(celda, "la casilla activa es un botón");
  controlesMiden([celda], "cuadro, casilla");
  assert.ok(px(celda.style.width) >= MINIMO, `la casilla mide ${celda.style.width} de ancho`);
  const fila = celda.closest("[data-fila]");
  assert.ok(px(fila.style.height) >= MINIMO, `la fila (${fila.style.height}) recorta la casilla`);
  /* El signo que lleva la casilla no cambia de letra. */
  assert.equal(celda.lastElementChild.style.fontSize, "17px");
  desmontar();
});

test("cu-debita-o-acredita: la ficha mide 44 de alto y su letra sigue en 13 px", () => {
  const { caja, desmontar } = montar(DebitaOAcredita);
  const f = fichas(caja);
  controlesMiden(f, "debita o acredita");
  letraIgual(f, "13px", "debita o acredita");
  assert.ok(px(f[0].parentElement.style.width) >= MINIMO);
  desmontar();
});

test("cu-arma-el-asiento: banco, hueco del nombre, ficha de valor y «quitar» miden 44, con 8 de aire", () => {
  const { caja, desmontar } = montar(ElAsientoSimple);
  const banco = fichas(caja);
  controlesMiden(banco, "arma el asiento, banco");
  letraIgual(banco, "13px", "arma el asiento, banco");
  assert.ok(px(banco[0].parentElement.style.gap) >= AIRE, `aire entre nombres: ${banco[0].parentElement.style.gap}`);

  /* Con un nombre tomado, los dos huecos «sin nombre» son destinos. */
  tocar(banco[0]);
  const huecos = [...caja.querySelectorAll('button[data-destino^="nombre:"]')];
  assert.equal(huecos.length, 2);
  controlesMiden(huecos, "arma el asiento, sin nombre");
  letraIgual(huecos, "10.5px", "arma el asiento, sin nombre");

  /* Nombrar las dos cuentas: aparecen las fichas de valor. */
  tocar(huecos[0]);
  tocar(fichas(caja)[0]);
  tocar(caja.querySelector('button[data-destino="nombre:1"]'));
  const valores = [...caja.querySelectorAll("[data-ficha-valor] button[data-ficha]")];
  assert.equal(valores.length, 2);
  controlesMiden(valores, "arma el asiento, valor");
  letraIgual(valores, "13px", "arma el asiento, valor");

  /* Poner el primer valor: su sitio lo ocupa «quitar del debe». */
  tocar(valores[0]);
  tocar(caja.querySelector(`[data-cuenta-t="0"] [data-columna="${DEBE}"]`));
  const quitar = [...caja.querySelectorAll("button")].find((b) => /quitar del/.test(b.textContent));
  assert.ok(quitar, "aparece «quitar del debe»");
  controlesMiden([quitar], "arma el asiento, quitar");
  letraIgual([quitar], "11px", "arma el asiento, quitar");
  desmontar();
});

test("cu-asiento-compuesto: las 14 pastillas y «devolver al estante» miden 44 × 44, con 8 de aire", () => {
  const { caja, desmontar } = montar(ElAsientoCompuestoNuevo);
  const pastillas = [...caja.querySelectorAll("button[data-sacar]")];
  assert.ok(pastillas.length >= 2);
  controlesMiden(pastillas, "compuesto, pastillas");
  for (const p of pastillas) assert.ok(px(p.style.minWidth) >= MINIMO, `«${p.textContent}» sin ancho mínimo`);
  letraIgual(pastillas, "9.5px", "compuesto, pastillas");
  const fila = pastillas[0].parentElement;
  assert.ok(px(fila.style.gap) >= AIRE, `aire entre pastillas de una fila: ${fila.style.gap}`);
  assert.ok(px(fila.parentElement.style.gap) >= AIRE, `aire entre filas del estante: ${fila.parentElement.style.gap}`);

  tocar(pastillas[0]);
  const devolver = caja.querySelector("button[data-devolver]");
  assert.ok(devolver, "la cuenta en la mesa se puede devolver");
  controlesMiden([devolver], "compuesto, devolver");
  letraIgual([devolver], "9.5px", "compuesto, devolver");
  assert.ok(px(devolver.style.marginTop) >= AIRE, `aire sobre «devolver»: ${devolver.style.marginTop}`);
  desmontar();
});
