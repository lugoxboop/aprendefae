/*
 * Gestión de Proyectos · las 18 Hacer montadas de verdad (jsdom) y jugadas
 * como el estudiante, con tocar-tocar (lo mismo que usa el teclado). Se
 * comprueba la tarjeta de inicio (papel, contexto, consigna, protagonista a
 * 180 px), la partida perfecta = 100 %, el coral solo tras un error con la
 * retro de ESE destino, y que cada ítem del detalle tiene etiqueta docente.
 */
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
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
const { solucionario, otraDe } = await import("./solucion.mjs");
const { PIEZAS_TEXTO_GP, ITEMS_GP } = await import("../etiquetas.js");

const S = solucionario();
const DIR = new URL("..", import.meta.url);
const COMPONENTES = {};
/* Lote 1: fundamentos/Hnn*.jsx · lote 2: fundamentos/C03Hnn*.jsx e integracion/C04Hnn*.jsx · lote 3: alcance/ y cronograma/. */
for (const dir of ["fundamentos", "integracion", "alcance", "cronograma"]) {
  for (const f of readdirSync(new URL(`${dir}/`, DIR)).filter((x) => /^(C0\d)?H\d\d.*\.jsx$/.test(x))) {
    const m = await import(new URL(`${dir}/${f}`, DIR).href);
    COMPONENTES[m.ID] = m.default;
  }
}

const sinEstilos = (el) => el.innerHTML.replace(/<style>[\s\S]*?<\/style>/g, "");
const clicEn = (b) => act(async () => { b.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
/* Escribir en un <input> controlado de React: el setter nativo y un evento input. */
const escribir = (input, valor) => act(async () => {
  Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set.call(input, valor);
  input.dispatchEvent(new w.Event("input", { bubbles: true }));
});
const pasa = (ms) => act(async () => { mock.timers.tick(ms); });

async function montar(Componente, props) {
  const el = document.createElement("div");
  document.body.appendChild(el);
  const raiz = createRoot(el);
  await act(async () => { raiz.render(h(Componente, props)); });
  return { el, desmontar: () => act(async () => { raiz.unmount(); el.remove(); }) };
}

/* Un movimiento del jugador perfecto. Devuelve false si no supo qué hacer. */
async function mover(el) {
  const q = (s) => el.querySelector(s);
  const boton = q("[data-empezar], [data-seguir-etapa], [data-ver-resultado], [data-seguir], [data-terminar-memo]");
  if (boton) { await clicEn(boton); return true; }
  const motor = q("[data-motor]");
  if (!motor) return false;
  const tipo = motor.dataset.motor;
  if (tipo === "decidir") {
    const id = motor.dataset.pasoId;
    const clave = S.claves[id];
    assert.ok(clave, `sin clave para ${id}`);
    const tarjeta = q(`[data-tarjeta="${id}"]`);
    if (tarjeta) await clicEn(tarjeta);
    await clicEn(q(`[data-destino-id="${clave}"]`));
  } else if (tipo === "casillas") {
    const casillas = S.casillas[motor.dataset.pasoId];
    assert.ok(casillas, `sin casillas para ${motor.dataset.pasoId}`);
    for (const c of casillas) {
      if (c.opciones) { await clicEn(q(`[data-casilla="${c.id}"][data-opcion-casilla="${c.clave}"]`)); continue; }
      await escribir(q(`input[data-casilla="${c.id}"]`), String(c.clave).replace(".", ","));
    }
    await clicEn(q("[data-comprobar-casillas]"));
  } else if (tipo === "ordenar") {
    for (const id of S.ordenes[motor.dataset.pasoId]) await clicEn(q(`[data-por-ordenar="${id}"]`));
    await clicEn(q("[data-comprobar]"));
  } else if (tipo === "emparejar") {
    for (const r of el.querySelectorAll("[data-riel]")) {
      await clicEn(q(`[data-etiqueta="${S.rieles[r.dataset.riel]}"]`));
      await clicEn(q(`[data-riel="${r.dataset.riel}"]`));
    }
  } else if (tipo === "memorando") {
    for (const f of el.querySelectorAll("[data-frase]")) {
      if (!S.frases[f.dataset.frase]) continue;
      await clicEn(q(`[data-frase="${f.dataset.frase}"]`));
      await clicEn(q('[data-opcion="buena"]'));
    }
  } else if (tipo === "dilema") {
    await clicEn(q("[data-opcion-dilema]"));
  } else if (tipo === "dial") {
    const ir = q("[data-ir-reto]");
    if (ir) {
      for (const b of el.querySelectorAll(".gp-dial-nombre")) await clicEn(b);
      await clicEn(q("[data-ir-reto]"));
    } else {
      const clave = S.claves[q("[data-situacion]").dataset.situacion];
      await clicEn(el.querySelectorAll(".gp-dial-nombre")[S.posiciones.indexOf(clave)]);
      await clicEn(q("[data-confirmar-dial]"));
    }
  } else return false;
  await pasa(3000);
  return true;
}

test("hay 59 piezas (18 del lote 1, 17 del lote 2 y 24 del lote 3), cada una con su componente", () => {
  assert.equal(PIEZAS_TEXTO_GP.length, 59);
  assert.equal(Object.keys(COMPONENTES).length, 59);
  for (const p of PIEZAS_TEXTO_GP) assert.equal(typeof COMPONENTES[p.id], "function", p.id);
});

test("la tarjeta de inicio: papel, contexto, consigna y protagonista grande, sin coral", async () => {
  for (const p of PIEZAS_TEXTO_GP) {
    const m = await montar(COMPONENTES[p.id], { onTerminar: () => {}, rng: conSemilla(5) });
    assert.equal(m.el.querySelector("[data-papel]").textContent.includes(p.rol), true, `${p.id}: rol`);
    assert.equal(m.el.querySelector("[data-contexto-escena]").textContent, p.contexto, `${p.id}: contexto`);
    assert.equal(m.el.querySelector("[data-consigna]").textContent, p.consigna, `${p.id}: consigna`);
    assert.ok(!/data-estado="mal"/.test(sinEstilos(m.el)), `${p.id}: coral sin error`);
    const prota = m.el.querySelector(`[data-personaje="${p.elenco[0]}"]`);
    assert.ok(Number(prota.dataset.alto) >= 180, `${p.id}: protagonista a 180 px o más`);
    assert.ok(prota.querySelector("figcaption").textContent.length > 0, `${p.id}: rol escrito debajo`);
    await m.desmontar();
  }
});

test("las 59 se juegan enteras: partida perfecta = 100 % y cada ítem con etiqueta", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    for (const semilla of [1, 7]) {
      for (const p of PIEZAS_TEXTO_GP) {
        let res = null;
        const m = await montar(COMPONENTES[p.id], { onTerminar: (r) => { res = r; }, rng: conSemilla(semilla) });
        for (let k = 0; k < 300 && !res; k += 1) assert.ok(await mover(m.el), `${p.id}: atascada en ${m.el.innerHTML.slice(0, 300)}`);
        assert.ok(res, `${p.id}: no terminó`);
        assert.equal(res.pct, 100, `${p.id} (semilla ${semilla}): ${JSON.stringify(res.detalle.filter((d) => !d.ok))}`);
        for (const d of res.detalle) assert.ok(ITEMS_GP[p.id][d.item], `${p.id}: ítem sin etiqueta ${d.item}`);
        await m.desmontar();
      }
    }
  } finally { mock.timers.reset(); }
});

test("un error: coral en ese destino, la retro de ese destino, y el ítem cuenta en contra", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const p = PIEZAS_TEXTO_GP.find((x) => x.id === "gp26-fun-h01-bandeja");
    let res = null;
    const m = await montar(COMPONENTES[p.id], { onTerminar: (r) => { res = r; }, rng: conSemilla(2) });
    await clicEn(m.el.querySelector("[data-empezar]"));
    const id = m.el.querySelector("[data-motor]").dataset.pasoId;
    const item = p.etapas[0].banco.find((x) => x.id === id);
    const mala = otraDe(p.etapas[0].destinos.map((d) => d.id), item.clave);
    await clicEn(m.el.querySelector(`[data-tarjeta="${id}"]`));
    await clicEn(m.el.querySelector(`[data-destino-id="${mala}"]`));
    assert.equal(m.el.querySelector(`[data-destino-id="${mala}"]`).dataset.estado, "mal");
    const esperada = item.retros?.[mala] ?? item.retro;
    assert.ok(m.el.textContent.includes(esperada), "la retro de ese destino");
    await pasa(400);
    assert.notEqual(m.el.querySelector(`[data-destino-id="${mala}"]`).dataset.estado, "mal", "el coral se va");
    for (let k = 0; k < 300 && !res; k += 1) await mover(m.el);
    assert.ok(res.pct < 100);
    assert.equal(res.detalle.find((d) => d.item === id).ok, false);
    await m.desmontar();
  } finally { mock.timers.reset(); }
});
