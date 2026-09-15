/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CUÁNTO TARDA UNA PARTIDA LIMPIA DE CADA FÁCIL?
 *
 *   npm run medir-faciles
 *
 * De aquí sale el piso de tiempo de Fácil (fp_tiempo_minimo_ms, 0030). Se
 * juegan los seis juegos Fácil de verdad —los componentes reales, con su
 * volteo de 900 ms y su propio reloj— en un DOM de mentira, con dos jugadores:
 *
 *   HONESTO RÁPIDO  lee cada texto que tiene que leer a 350 palabras por
 *                   minuto (un lector rápido), decide en 300 ms, toca en
 *                   250 ms y tiene memoria perfecta en el Memorama. No se
 *                   equivoca nunca. Es el más rápido que se puede ser jugando
 *                   de verdad; un estudiante real va más lento.
 *   AUTÓMATA        toca sin leer y sin esperar nada que no le obligue la
 *                   actividad. Es lo que la defensa de tiempo existe para
 *                   frenar.
 *
 * El reloj es simulado (mock.timers, con Date), así que los milisegundos son
 * los que el componente habría informado con esos ritmos, no los que tarda el
 * ordenador. Las posiciones del Memorama se barajan con 300 semillas.
 *
 * LOS RITMOS SON UN MODELO, NO UNA MEDICIÓN DE ESTUDIANTES. Cuando haya
 * partidas reales, fp_history.duration_ms de estas seis actividades es la
 * medida buena y el piso se revisa con ella.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { mock } from "node:test";
import { JSDOM, VirtualConsole } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
mock.timers.enable({ apis: ["setTimeout", "Date"], now: 1_000_000 });

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const errorOriginal = console.error;
console.error = (...a) => { if (!/act\(|not wrapped/i.test(String(a[0]))) errorOriginal(...a); };

const C = await import("../src/components/mecanicas/bloques/cimientos.jsx");
const { VOLTEO_MS } = await import("../src/components/mecanicas/bloques/Memorama.jsx");
const { MEMORAMAS, CLASIFICACIONES } = await import("../src/data/cimientos.js");

const mulberry32 = (s) => () => {
  let a = (s = (s + 0x6d2b79f5) | 0);
  a = Math.imul(a ^ (a >>> 15), 1 | a);
  a = (a + Math.imul(a ^ (a >>> 7), 61 | a)) ^ a;
  return ((a ^ (a >>> 14)) >>> 0) / 4294967296;
};

const HONESTO = { nombre: "honesto rápido", msPalabra: 60000 / 350, decidir: 300, tocar: 250 };
const AUTOMATA = { nombre: "autómata", msPalabra: 0, decidir: 0, tocar: 0 };
const palabras = (t) => t.trim().split(/\s+/).length;

function montar(Componente) {
  let ms = null;
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(React.createElement(Componente, { onCompletar: (_p, d) => { ms = d; } })));
  return { caja, ms: () => ms, fin: () => { act(() => raiz.unmount()); caja.remove(); } };
}
const esperar = (ms) => { if (ms > 0) act(() => { mock.timers.tick(ms); }); };
const click = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });

/* Memoria perfecta: nunca voltea a ciegas lo que ya vio, y cierra en cuanto sabe dónde está la pareja. */
function memorama(Componente, pares, j, semilla) {
  Math.random = mulberry32(semilla);
  const m = montar(Componente);
  const cartas = [...m.caja.querySelectorAll(".fae-mm-carta")].map((b) => {
    const texto = b.querySelector(".fae-mm-frente").textContent.trim();
    const par = pares.find((p) => p.termino === texto || p.definicion === texto);
    return { b, texto, par: par.id };
  });
  const vistas = new Set();
  const hechas = new Set();
  const voltear = (c) => { esperar(j.tocar); click(c.b); esperar(palabras(c.texto) * j.msPalabra); vistas.add(c); };
  const conocida = () => {
    for (const c of vistas) {
      const otra = [...vistas].find((x) => x !== c && x.par === c.par);
      if (otra && !hechas.has(c.par)) return [c, otra];
    }
    return null;
  };
  let guardia = 0;
  while (hechas.size < pares.length && guardia++ < 100) {
    const sabida = conocida();
    if (sabida) { voltear(sabida[0]); voltear(sabida[1]); hechas.add(sabida[0].par); continue; }
    const nuevas = cartas.filter((c) => !vistas.has(c));
    const a = nuevas[0];
    voltear(a);
    const pareja = [...vistas].find((x) => x !== a && x.par === a.par);
    if (pareja) { voltear(pareja); hechas.add(a.par); continue; }
    const b = nuevas[1];
    voltear(b);
    if (b.par === a.par) { hechas.add(a.par); continue; }
    /* No son pareja: las cartas vuelven solas, y hasta entonces no se puede tocar. */
    esperar(VOLTEO_MS);
  }
  const ms = m.ms();
  m.fin();
  return ms;
}

function clasificacion(Componente, banco, j, semilla) {
  Math.random = mulberry32(semilla);
  const m = montar(Componente);
  const nombre = (id) => banco.categorias.find((c) => c.id === id).nombre;
  for (let n = 0; n < 6; n++) {
    const item = banco.items.find((x) => m.caja.textContent.includes(x.texto));
    esperar(palabras(item.texto) * j.msPalabra + j.decidir + j.tocar);
    click([...m.caja.querySelectorAll("button")].find((b) => b.textContent.trim() === nombre(item.respuesta)));
    esperar(j.tocar);
    click([...m.caja.querySelectorAll("button")].find((b) => ["Siguiente", "Ver resultado"].includes(b.textContent.trim())));
  }
  const ms = m.ms();
  m.fin();
  return ms;
}

const SEMILLAS = Array.from({ length: 300 }, (_, k) => k + 1);
const resumen = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const q = (p) => s[Math.min(s.length - 1, Math.floor(p * s.length))];
  return { "mín (s)": +(s[0] / 1000).toFixed(1), "p10 (s)": +(q(0.1) / 1000).toFixed(1), "mediana (s)": +(q(0.5) / 1000).toFixed(1) };
};

const filas = [];
for (const j of [HONESTO, AUTOMATA]) {
  for (const [id, Comp] of [["memorama-tesoro", C.MemoramaTesoro], ["memorama-corazon", C.MemoramaCorazon], ["memorama-tesoreria", C.MemoramaTesoreria]]) {
    filas.push({ jugador: j.nombre, actividad: id, ...resumen(SEMILLAS.map((s) => memorama(Comp, MEMORAMAS[id].pares, j, s))) });
  }
  for (const [id, Comp] of [["que-rama-es", C.QueRamaEs], ["cual-componente", C.CualComponente], ["cobra-gasta-o-pide", C.CobraGastaOPide]]) {
    filas.push({ jugador: j.nombre, actividad: id, ...resumen(SEMILLAS.map((s) => clasificacion(Comp, CLASIFICACIONES[id], j, s))) });
  }
}
console.table(filas);
process.exit(0);
