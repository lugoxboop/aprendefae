/*
 * Lo común de las pruebas de las cuatro piezas de T5 (Act1 C4, Act2 D2/D8,
 * P1 y P2 capa 3 C4). No es un archivo de pruebas: lo importan
 * t5-act1-c4, t5-act2-d8, t5-p1-c4 y t5-p2-c4.
 *
 *   · un DOM (jsdom) con `prefers-reduced-motion` a elección: `reducir(true)`;
 *   · montar, tocar y dormir (con act);
 *   · RECORRIDOS SIN LA PROP NUEVA: tres componentes compartidos con la Célula
 *     B (FichasUnNivel, CajasQueRevelan y CierreConMesa) se recorren sin `c4`
 *     ni `mezclar` y se resume su HTML, paso a paso, en un sha-256. Las huellas
 *     se tomaron con el código de main (antes de las props nuevas): si una
 *     prop nueva cambia en algo lo de siempre, la huella cambia.
 */
import { createHash } from "node:crypto";
import { JSDOM, VirtualConsole } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
export const w = dom.window;
let REDUCIDO = false;
export const reducir = (si) => { REDUCIDO = si; };
w.matchMedia = (q) => ({ matches: q.includes("reduce") && REDUCIDO, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
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
export const act = React.act;
export const h = React.createElement;
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const { FAE } = await import("../../theme.js");
export const MARCO = { Marco: MarcoLibros, rotulo: "PRUEBA", titulo: "Prueba", acento: FAE.ambar };

export async function montar(el) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}
/* Monta, corre `fn(caja)` y desmonta siempre, también si una aserción falla (no deja relojes vivos). */
export async function con(el, fn) {
  const { caja, desmontar } = await montar(el);
  try { await fn(caja); } finally { desmontar(); }
}
export async function tocar(el) {
  if (!el) throw new Error("no hay nada que tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
}
export async function dormir(ms) {
  for (let t = 0; t < ms; t += 50) await act(async () => { await new Promise((r) => setTimeout(r, Math.min(50, ms - t))); });
}
/* Los ids de useId («:r12:», ««r12»») dependen de cuántos componentes se montaron antes: se normalizan. */
const sinIds = (html) => html.replace(/:r[0-9a-z]+:|«r[0-9a-z]+»/g, ":id:");
export const huella = (pasos) => createHash("sha256").update(pasos.map(sinIds).join("\n§\n")).digest("hex");

/* ═══════════ RECORRIDOS SIN LA PROP NUEVA (con movimiento reducido: sin relojes de animación) ═══════════ */

/* FichasUnNivel: la de T6 Act1 (Célula B) y la de T5 Act1 de main, con dos fichas fijas: una mala, la buena, «Siguiente». */
export async function recorridoFichas() {
  reducir(true);
  /* Las vueltas de D8 (b5Vuelta.js) se guardan en localStorage: el recorrido empieza de cero. */
  w.localStorage.clear();
  const { CONFIG_T6_ACT1 } = await import("../../components/mecanicas/libros/tema6/ClientesOOtra.jsx");
  const { default: FichasUnNivel } = await import("../../components/mecanicas/libros/b5/FichasUnNivel.jsx");
  const { default: QueRentaDa } = await import("../../components/mecanicas/libros/tema5/QueRentaDa.jsx");
  const T6 = await import("../../data/contabilidadT6Act1.js");
  const T5 = await import("../../data/contabilidadT5Act1.js");
  const pasos = [];
  for (const [El, config, items] of [
    [FichasUnNivel, CONFIG_T6_ACT1, T6.FICHAS_T6_ACT1.slice(0, 2)],
    [QueRentaDa, null, T5.FICHAS_T5_ACT1.filter((f) => f.clase === T5.NOMBRE).slice(0, 2)],
  ]) {
    const { caja, desmontar } = await montar(h(El, { ...MARCO, ...(config ? { config } : {}), items, onCompletar: () => {} }));
    pasos.push(caja.innerHTML);
    for (let k = 0; k < items.length; k++) {
      const cajones = [...caja.querySelectorAll("[data-cajon]")];
      const buena = (config ?? (await import("../../components/mecanicas/libros/tema5/QueRentaDa.jsx")).CONFIG_T5_ACT1).destino(items[k]);
      const mala = cajones.find((c) => c.dataset.cajon !== buena);
      await tocar(mala); await dormir(50); pasos.push(caja.innerHTML);
      await tocar(caja.querySelector(`[data-cajon="${buena}"]`)); await dormir(50); pasos.push(caja.innerHTML);
      await tocar(caja.querySelector("[data-boton-avanzar] button")); await dormir(50); pasos.push(caja.innerHTML);
    }
    desmontar();
  }
  reducir(false);
  return huella(pasos);
}

/* CajasQueRevelan: la capa 3 de T5 P1 y P2 de main y la de T6 A1 (Célula B): abrir, una mala, la buena. */
export async function recorridoCajas() {
  reducir(true);
  /* Las vueltas de D8 (b5Vuelta.js) se guardan en localStorage: el recorrido empieza de cero. */
  w.localStorage.clear();
  const { default: DosPaquetes } = await import("../../components/mecanicas/libros/tema5/DosPaquetes.jsx");
  const { default: DosVentas } = await import("../../components/mecanicas/libros/tema5/DosVentas.jsx");
  const { ESCENAS_TEMA6 } = await import("../../components/mecanicas/libros/tema6/escenasTema6.jsx");
  const { PIEZA_LO_QUE_LE_DEBEN } = await import("../../data/contabilidadT6Pieza1.js");
  const pasos = [];
  for (const El of [DosPaquetes, DosVentas, ESCENAS_TEMA6[PIEZA_LO_QUE_LE_DEBEN.id].Exploracion]) {
    const { caja, desmontar } = await montar(h(El));
    pasos.push(caja.innerHTML);
    for (const zona of [...caja.querySelectorAll("[data-hecho]")]) {
      await tocar(zona.querySelector("button[aria-expanded]")); pasos.push(caja.innerHTML);
      const opciones = [...zona.querySelectorAll("[data-opcion]")];
      for (const o of opciones.slice(0, 2)) {
        const viva = zona.querySelector(`[data-opcion="${o.dataset.opcion}"]`);
        if (viva && viva.getAttribute("aria-disabled") !== "true") { await tocar(viva); await dormir(20); pasos.push(caja.innerHTML); }
      }
    }
    desmontar();
  }
  reducir(false);
  return huella(pasos);
}

/* CierreConMesa: T5 Act2 de main (CierreConDiario) y T6 Act2 (Célula B): el ejemplo, «Empezar», sacar y devolver. */
export async function recorridoMesa() {
  reducir(true);
  /* Las vueltas de D8 (b5Vuelta.js) se guardan en localStorage: el recorrido empieza de cero. */
  w.localStorage.clear();
  const { default: CierreConDiario } = await import("../../components/mecanicas/libros/tema5/LibroDiario.jsx");
  const { default: ProvisionDeElTorito } = await import("../../components/mecanicas/libros/tema6/ProvisionDeElTorito.jsx");
  const pasos = [];
  for (const El of [CierreConDiario, ProvisionDeElTorito]) {
    /* `mezclar: null`: sin barajar, como en main (la partida real de T5 Act2 baraja: D8). */
    const { caja, desmontar } = await montar(h(El, { ...MARCO, onCompletar: () => {}, mezclar: null }));
    pasos.push(caja.innerHTML);
    const empezar = caja.querySelector("[data-boton-empezar] button");
    if (empezar) { await tocar(empezar); pasos.push(caja.innerHTML); }
    const primera = caja.querySelector("[data-sacar]");
    if (primera) {
      const cuenta = primera.dataset.sacar.split(":")[0];
      await tocar(primera); pasos.push(caja.innerHTML);
      await tocar(caja.querySelector(`[data-devolver="${cuenta}"]`)); pasos.push(caja.innerHTML);
    }
    desmontar();
  }
  reducir(false);
  return huella(pasos);
}
