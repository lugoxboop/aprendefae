/*
 * Gestión de Proyectos · lote 3 (caps. 5 y 6): lo propio de estas 24 Hacer.
 * - Sorteos y puntajes del diseño (cuántos ítems puntúa cada pieza).
 * - La red de la tienda (c06 §0): ES/EF/LS/LF y holguras se RECALCULAN aquí
 *   desde duraciones y predecesoras, y deben dar lo que dicen los textos.
 * - El motor Casillas montado de verdad: coma decimal, valores aceptados,
 *   coral solo en la casilla que falla, segundo error = se ven las respuestas.
 */
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
const Observador = class { observe() {} unobserve() {} disconnect() {} };
w.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  ResizeObserver: Observador, IntersectionObserver: Observador,
  requestAnimationFrame: (cb) => setTimeout(() => cb(performance.now() + 10000), 0), cancelAnimationFrame: (id) => clearTimeout(id),
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;
const { conSemilla } = await import("../../macro2026/comun/azar.js");
const { partidaDe, prepararPieza, itemsDePaso } = await import("../comun/preparar.js");
const { PIEZAS_TEXTO_C5 } = await import("../alcance/textos-c5.js");
const { PIEZAS_TEXTO_C6, RED_C6, LINEAS_C6 } = await import("../cronograma/textos-c6.js");
const { default: Casillas, casillaBien, numeroDe } = await import("../comun/motores/Casillas.jsx");
const { corridas } = await import("../cronograma/C06H08Domino.jsx");
const { carriles } = await import("../cronograma/C06H09Relevos.jsx");

const porId = Object.fromEntries([...PIEZAS_TEXTO_C5, ...PIEZAS_TEXTO_C6].map((p) => [p.id, p]));
const total = (id, s = 3) => prepararPieza(porId[id], conSemilla(s)).reduce((t, e) => t + e.pasos.reduce((u, p) => u + itemsDePaso(p), 0), 0);

test("lote 3: 12 + 12 piezas y los puntajes del diseño", () => {
  assert.equal(PIEZAS_TEXTO_C5.length, 12);
  assert.equal(PIEZAS_TEXTO_C6.length, 12);
  assert.equal(total("gp26-pla-c05-h07-telar"), 9, "C5 H07: 4 filas + 2 hilos + 3 estados");
  assert.equal(total("gp26-pla-c05-h09-movil"), 17, "C5 H09: 17");
  assert.equal(total("gp26-pla-c06-h05-sumadora"), 11, "C6 H05: 11");
  assert.equal(total("gp26-pla-c06-h07-metro"), 14, "C6 H07: 14");
  assert.equal(total("gp26-pla-c06-h12-plotter"), 7, "C6 H12: 7");
});

test("lote 3: sorteos del diseño", () => {
  for (let s = 1; s <= 40; s += 1) {
    const rng = conSemilla(s);
    const t01 = partidaDe(porId["gp26-pla-c05-h01-teatro"].etapas[0], rng);
    assert.deepEqual([t01.filter((x) => x.clave === "producto").length, t01.filter((x) => x.clave === "proyecto").length], [4, 4], "C5 H01 4 y 4");
    assert.equal(partidaDe(porId["gp26-pla-c05-h03-libretas"].etapas[0], rng).length, 8, "C5 H03 8 de 9");
    const m04 = partidaDe(porId["gp26-pla-c05-h04-mochila"].etapas[0], rng).map((x) => x.id);
    assert.equal(m04.length, 7); assert.ok(m04.includes("c5h04-09"), "C5 H04 siempre el observador participante");
    const a06 = partidaDe(porId["gp26-pla-c05-h06-alacena"].etapas[0], rng);
    assert.equal(a06.length, 8); assert.equal(new Set(a06.map((x) => x.clave)).size, 7, "C5 H06 uno por frasco");
    assert.equal(a06.filter((x) => x.clave === "transicion").length, 2, "C5 H06 los dos de transición");
    const m08 = partidaDe(porId["gp26-pla-c05-h08-mapa"].etapas[0], rng);
    assert.deepEqual([m08.filter((x) => x.clave === "acta").length, m08.filter((x) => x.clave === "enunciado").length], [4, 4], "C5 H08 4 y 4");
    const s01 = prepararPieza(porId["gp26-pla-c06-h01-semaforo"], rng)[1].pasos;
    assert.equal(s01.filter((x) => x.tipo === "casillas").length, 4); assert.ok(s01.some((x) => x.id === "c6h01-12"), "C6 H01 siempre la de 10 % en el límite");
    const r03 = partidaDe(porId["gp26-pla-c06-h03-rompecabezas"].etapas[0], rng).map((x) => x.id);
    assert.equal(r03.length, 4); assert.ok(r03.includes("c6h03-05"), "C6 H03 siempre la SF");
    const p12 = partidaDe(porId["gp26-pla-c06-h12-plotter"].etapas[0], rng);
    assert.deepEqual([p12.filter((x) => x.clave === "buena").length, p12.filter((x) => x.clave === "correcta").length], [5, 2], "C6 H12 5 con error y 2 correctas");
    const t07 = prepararPieza(porId["gp26-pla-c05-h07-telar"], rng)[0].pasos.map((x) => x.id);
    assert.deepEqual(t07.slice(4, 6), ["c5h07-h1", "c5h07-h2"], "C5 H07 los hilos sueltos después de las filas");
  }
});

test("la red de la tienda: recalculada desde duraciones y predecesoras", () => {
  const dur = Object.fromEntries(RED_C6.map((a) => [a.id, a.dur]));
  const es = {}; const ef = {};
  for (const a of RED_C6) { es[a.id] = a.pre.length ? Math.max(...a.pre.map((p) => ef[p])) : 0; ef[a.id] = es[a.id] + a.dur; }
  const fin = ef.I; const lf = {}; const ls = {};
  for (const a of [...RED_C6].reverse()) {
    const suc = RED_C6.filter((x) => x.pre.includes(a.id));
    lf[a.id] = suc.length ? Math.min(...suc.map((x) => ls[x.id])) : fin;
    ls[a.id] = lf[a.id] - a.dur;
  }
  assert.equal(fin, 23, "inauguración el día 23");
  for (const a of RED_C6) {
    const suc = RED_C6.filter((x) => x.pre.includes(a.id));
    const libre = suc.length ? Math.min(...suc.map((x) => es[x.id])) - ef[a.id] : 0;
    assert.deepEqual([a.es, a.ef, a.ls, a.lf, a.ht, a.hl], [es[a.id], ef[a.id], ls[a.id], lf[a.id], ls[a.id] - es[a.id], libre], a.id);
  }
  for (const l of LINEAS_C6) assert.equal(l.ruta.reduce((s, id) => s + dur[id], 0), l.suma, l.id);
  /* Las claves de H07 salen de la red. */
  const h07 = porId["gp26-pla-c06-h07-metro"];
  for (const p of h07.etapas.flatMap((e) => e.pasos).filter((x) => x.estacion)) {
    const a = RED_C6.find((x) => x.id === p.estacion);
    for (const c of p.casillas) assert.equal(c.clave, a[c.id], `${p.id}/${c.id}`);
  }
  /* H08: el fin que dice cada retraso es el que da la red. */
  const h08 = porId["gp26-pla-c06-h08-domino"].etapas[0].pasos.filter((x) => x.ficha && x.destinos.length === 6);
  for (const p of h08) assert.equal(corridas(p.ficha, p.dias).fin - 23, Number(p.clave), p.id);
  assert.ok(corridas("G", 5).movidas.includes("H"), "H08 1b: H se corre");
  assert.ok(corridas("B", 2).movidas.includes("E") && !corridas("B", 2).movidas.includes("D"), "H08 4b: E sí, D no");
  /* H09: F + D + D lleva la meta a 20 por $3,2 M; E o G no la mueven. */
  assert.equal(Math.max(...carriles(["F", "D", "D"]).map((c) => c.dias)), 20);
  assert.equal(Math.max(...carriles(["E", "G"]).map((c) => c.dias)), 23);
});

test("casillas: coma decimal y valores aceptados", () => {
  assert.equal(numeroDe("7,5"), 7.5);
  assert.equal(numeroDe(" 16.7 "), 16.7);
  assert.equal(numeroDe("abc"), null);
  const e = porId["gp26-pla-c06-h01-semaforo"].etapas[1].banco.find((x) => x.id === "c6h01-11").casillas[0];
  assert.ok(casillaBien(e, "17") && casillaBien(e, "16,7") && !casillaBien(e, "16"), "C6 H01: 17 o 16,7");
  const beta = porId["gp26-pla-c06-h05-sumadora"].etapas[0].pasos.find((x) => x.id === "c6h05-06").casillas[0];
  assert.ok(casillaBien(beta, "7,5") && !casillaBien(beta, "8"));
});

const clicEn = (b) => act(async () => { b.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
const escribir = (input, valor) => act(async () => {
  Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set.call(input, valor);
  input.dispatchEvent(new w.Event("input", { bubbles: true }));
});

test("casillas montado: error = coral solo en esa casilla y la retro; segundo error = se ven las respuestas", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const paso = porId["gp26-pla-c06-h07-metro"].etapas[1].pasos.find((x) => x.id === "c6h07-fD");
    let res = null;
    const el = document.createElement("div");
    document.body.appendChild(el);
    const raiz = createRoot(el);
    await act(async () => { raiz.render(h(Casillas, { paso, alTerminar: (r) => { res = r; } })); });
    const q = (s) => el.querySelector(s);
    assert.ok(q("[data-comprobar-casillas]").disabled, "sin llenar no se comprueba");
    await escribir(q('input[data-casilla="es"]'), "8");
    await escribir(q('input[data-casilla="ef"]'), "21");
    await clicEn(q("[data-comprobar-casillas]"));
    assert.equal(q('[data-casilla-caja="es"]').dataset.estado, "mal", "coral en ES");
    assert.notEqual(q('[data-casilla-caja="ef"]').dataset.estado, "mal", "EF estaba bien");
    assert.ok(el.textContent.includes(paso.retro), "la retro del paso");
    assert.ok(q("[data-formula]"), "la fórmula al fallar");
    await clicEn(q("[data-comprobar-casillas]"));
    assert.ok(q('[data-solucion="es"]').textContent.includes("11"), "se ve la respuesta");
    await clicEn(q("[data-seguir]"));
    assert.equal(res.puntos, 0);
    assert.equal(res.detalle[0].ok, false);
    await act(async () => { raiz.unmount(); el.remove(); });
  } finally { mock.timers.reset(); }
});
