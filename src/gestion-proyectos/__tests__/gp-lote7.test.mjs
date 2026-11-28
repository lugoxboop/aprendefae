/*
 * Gestión de Proyectos · lote 7 (cap. 13, Interesados): lo propio de estas 11 Hacer.
 * - Puntajes del diseño (cuántos ítems puntúa cada pieza) y sorteos.
 * - Los datos del ábaco (H07) se RECALCULAN aquí: la brecha de cada varilla
 *   sale de las posiciones C y D, y el orden de la comunicación, de las brechas.
 * - Ninguna lámina adelanta la respuesta: la lista del acta solo suma a los
 *   encontrados, la cuadrícula del patio y la casa de guadua empiezan vacías,
 *   los reflectores van en «?» hasta comprobar y las brechas del ábaco también.
 *   (Las casillas de número las cubre además gp-lote5, extendida al cap. 13.)
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
const { PIEZAS_TEXTO_C13, PLANTA_C13, NIVELES_C13, ACTA_C13 } = await import("../interesados/textos-c13.js");
const { default: Decidir } = await import("../comun/motores/Decidir.jsx");
const { default: Casillas } = await import("../comun/motores/Casillas.jsx");

const porId = Object.fromEntries(PIEZAS_TEXTO_C13.map((p) => [p.id, p]));
const total = (id, s = 3) => prepararPieza(porId[id], conSemilla(s)).reduce((t, e) => t + e.pasos.reduce((u, p) => u + itemsDePaso(p), 0), 0);
const pasosDe = (id) => porId[id].etapas.flatMap((e) => [...(e.pasos ?? []).flatMap((m) => m.items ?? [m]), ...(e.banco ?? []), ...[].concat(e.despues ?? [])]);
const paso = (id, p) => pasosDe(id).find((x) => x.id === p);
const cuenta = (lista) => lista.reduce((m, x) => ({ ...m, [x.clave]: (m[x.clave] ?? 0) + 1 }), {});

const ESCENAS = {};
for (const f of ["C13H01Vereda", "C13H04Patio", "C13H05Casa", "C13H06Reflectores", "C13H07Abaco"]) {
  const m = await import(`../interesados/${f}.jsx`);
  ESCENAS[m.ID] = m.ESCENA;
}
const escenaDe = (escena, k) => ({ ...escena, ...(escena.etapas?.[k] ?? {}) });
const clicEn = (b) => act(async () => { b.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
async function montar(Componente, props) {
  const el = document.createElement("div");
  document.body.appendChild(el);
  const raiz = createRoot(el);
  await act(async () => { raiz.render(h(Componente, props)); });
  return { el, q: (s) => el.querySelector(s), qs: (s) => [...el.querySelectorAll(s)], desmontar: () => act(async () => { raiz.unmount(); el.remove(); }) };
}

test("lote 7: 11 piezas y los puntajes del diseño", () => {
  assert.equal(PIEZAS_TEXTO_C13.length, 11);
  const esperado = {
    "gp26-ini-c13-h01-identificar": 17, "gp26-ini-c13-h02-intereses": 8, "gp26-ini-c13-h03-registro": 11,
    "gp26-ini-c13-h04-poder-interes": 9, "gp26-ini-c13-h05-direccion": 6, "gp26-ini-c13-h06-prominencia": 9,
    "gp26-pla-c13-h07-matriz-evaluacion": 8, "gp26-pla-c13-h08-plan": 8, "gp26-eje-c13-h09-gestionar": 5,
    "gp26-moc-c13-h10-monitorear": 11,
    /* El taller: aciertos al primer intento / 18 ítems (diseño H11). */
    "gp26-moc-c13-h11-taller": 18,
  };
  for (const [id, n] of Object.entries(esperado)) for (const s of [1, 7, 23]) assert.equal(total(id, s), n, `${id} (semilla ${s})`);
});

test("lote 7: sorteos del diseño", () => {
  for (let s = 1; s <= 40; s += 1) {
    const rng = conSemilla(s);
    /* H02: 8 de 10, al menos uno por tinaja. */
    const p02 = partidaDe(porId["gp26-ini-c13-h02-intereses"].etapas[0], rng);
    assert.equal(p02.length, 8); assert.equal(Object.keys(cuenta(p02)).length, 5, "H02 una por tinaja");
    /* H03: 8 de 10, al menos 2 por sección. */
    const p03 = partidaDe(porId["gp26-ini-c13-h03-registro"].etapas[0], rng);
    assert.equal(p03.length, 8); assert.ok(Object.values(cuenta(p03)).every((n) => n >= 2) && Object.keys(cuenta(p03)).length === 3, "H03 dos por sección");
    /* H05: 6 de 8, siempre los dos laterales. */
    const p05 = partidaDe(porId["gp26-ini-c13-h05-direccion"].etapas[0], rng);
    assert.equal(p05.length, 6); assert.equal(p05.filter((x) => x.clave === "lateral").length, 2, "H05 los dos laterales");
    /* H08: 7 de 8, al menos 2 «No». */
    const p08 = partidaDe(porId["gp26-pla-c13-h08-plan"].etapas[0], rng);
    assert.equal(p08.length, 7); assert.ok(p08.filter((x) => x.clave === "no").length >= 2, "H08 dos «No»");
    /* H09: los cuatro momentos en orden y la micro al final. */
    assert.deepEqual(prepararPieza(porId["gp26-eje-c13-h09-gestionar"], rng)[0].pasos.map((x) => x.id), ["c13h09-01", "c13h09-02", "c13h09-03", "c13h09-04", "c13h09-11"]);
  }
});

test("el ábaco (H07): cada brecha y el orden salen de las posiciones C y D", () => {
  const i = (id) => NIVELES_C13.findIndex((n) => n.id === id);
  const brechas = PLANTA_C13.abaco.map((v) => i(v.d) - i(v.c));
  assert.deepEqual(brechas, [3, 2, 0, 1, 0], "diseño: 3 · 2 · 0 · 1 · 0");
  for (const v of PLANTA_C13.abaco) assert.equal(v.brecha, i(v.d) - i(v.c), v.id);
  const c = paso("gp26-pla-c13-h07-matriz-evaluacion", "c13h07-11");
  for (const v of PLANTA_C13.abaco) assert.equal(c.casillas.find((x) => x.id === v.id).clave, v.brecha, `${v.id}: la casilla`);
  /* Etapa 1: el nivel C de cada varilla es la clave de su tarjeta. */
  for (const x of porId["gp26-pla-c13-h07-matriz-evaluacion"].etapas[0].banco) assert.equal(x.clave, PLANTA_C13.abaco.find((v) => v.id === x.varilla).c, x.id);
  /* El orden: de mayor a menor brecha, sin las dos que no tienen. */
  assert.deepEqual(porId["gp26-pla-c13-h07-matriz-evaluacion"].etapas[1].pasos.find((x) => x.id === "c13h07-12").items.map((x) => x.id), ["familias", "duena", "alcaldia"]);
  /* H11: las 8 acciones, dos por proceso, cada una con el subtema de su proceso. */
  const b11 = porId["gp26-moc-c13-h11-taller"].etapas[0].banco;
  assert.deepEqual(Object.values(cuenta(b11)), [2, 2, 2, 2]);
  const sub = { identificar: "gp-13-1", planificar: "gp-13-2", gestionar: "gp-13-3", monitorear: "gp-13-4" };
  for (const x of b11) assert.deepEqual(x.subtemas, [sub[x.clave]], x.id);
});

test("ninguna lámina del cap. 13 adelanta la respuesta del paso", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    /* H01: la lista del acta trae solo los tres del acta; un interesado se suma al acertarlo. */
    const h01 = porId["gp26-ini-c13-h01-identificar"];
    const [p1] = prepararPieza(h01, conSemilla(3))[0].pasos.filter((x) => x.clave === "si");
    const m1 = await montar(Decidir, { paso: p1, escena: escenaDe(ESCENAS[h01.id], 0), estadoEtapa: { hechos: [] }, alTerminar: () => {} });
    assert.equal(m1.qs("[data-encontrado]").length, 0, "nadie encontrado aún");
    assert.equal(m1.q("[data-lista-acta]").dataset.listaActa, String(ACTA_C13.length));
    assert.ok(!m1.q("[data-lista-acta]").textContent.includes(p1.nombre), "la lista no dice al que toca");
    await clicEn(m1.q(`[data-tarjeta="${p1.id}"]`));
    await clicEn(m1.q('[data-destino-id="si"]'));
    assert.ok(m1.q("[data-lista-acta]").textContent.includes(p1.nombre), "al acertar, se suma");
    await m1.desmontar();
    /* H04: la cuadrícula empieza vacía; la piedra aparece al caer en su cuadrante. */
    const h04 = porId["gp26-ini-c13-h04-poder-interes"];
    const p4 = h04.etapas[0].banco[0];
    const m4 = await montar(Decidir, { paso: { ...p4, tipo: "decidir", destinos: h04.etapas[0].destinos }, escena: escenaDe(ESCENAS[h04.id], 0), estadoEtapa: { hechos: [] }, alTerminar: () => {} });
    assert.equal(m4.qs('[data-lleno="1"]').length, 0, "cuadrícula vacía");
    await clicEn(m4.q(`[data-tarjeta="${p4.id}"]`));
    await clicEn(m4.q(`[data-destino-id="${p4.clave}"]`));
    assert.ok(m4.q(`[data-celda="${p4.clave}"]`).textContent.includes("Alcaldía"), "la piedra en su cuadrante");
    await m4.desmontar();
    /* H05: ninguna parte de la casa encendida antes de acertar. */
    const h05 = porId["gp26-ini-c13-h05-direccion"];
    const p5 = h05.etapas[0].banco[6];
    const m5 = await montar(Decidir, { paso: { ...p5, tipo: "decidir", destinos: h05.etapas[0].destinos }, escena: ESCENAS[h05.id], estadoEtapa: { hechos: [] }, alTerminar: () => {} });
    assert.equal(m5.qs('[data-luz="1"]').length, 0, "la casa apagada");
    await m5.desmontar();
    /* H06: los reflectores en «?» hasta comprobar. */
    const h06 = porId["gp26-ini-c13-h06-prominencia"];
    const p6 = h06.etapas[0].banco[0];
    const m6 = await montar(Casillas, { paso: p6, escena: escenaDe(ESCENAS[h06.id], 0), estadoEtapa: { hechos: [] }, alTerminar: () => {} });
    for (const r of ["poder", "urgencia", "legitimidad"]) assert.equal(m6.q(`[data-reflector="${r}"]`).textContent.endsWith("?"), true, `${r} en «?»`);
    assert.equal(m6.qs('[data-reflector][data-on="1"]').length, 0, "ningún reflector encendido antes de comprobar");
    await m6.desmontar();
    /* H07: en la etapa 1 no hay cuentas C puestas; en la 2, las brechas en «?» hasta medirlas. */
    const h07 = porId["gp26-pla-c13-h07-matriz-evaluacion"];
    const p7 = h07.etapas[0].banco[0];
    const m7 = await montar(Decidir, { paso: { ...p7, tipo: "decidir", destinos: h07.etapas[0].destinos }, escena: escenaDe(ESCENAS[h07.id], 0), estadoEtapa: { hechos: [] }, alTerminar: () => {} });
    assert.equal(m7.qs('[data-lleno="1"]').length, 0, "sin cuentas antes de ponerlas");
    await m7.desmontar();
    const brecha = h07.etapas[1].pasos[0];
    const m8 = await montar(Casillas, { paso: brecha, escena: escenaDe(ESCENAS[h07.id], 1), estadoEtapa: { hechos: [] }, alTerminar: () => {} });
    for (const v of PLANTA_C13.abaco) assert.ok(m8.q(`[data-brecha="${v.id}"]`).textContent.endsWith("?"), `${v.id}: brecha en «?»`);
    await m8.desmontar();
  } finally { mock.timers.reset(); }
});
