import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * D8 · EL SEGUNDO INTENTO ES DISTINTO (Mello, nivel del Kit v4, §1). Las 11
 * piezas que barajaban con `barajarFijo` (una semilla por ítem, «estable entre
 * visitas»: el mismo orden cada vez que se jugaban) o que no barajaban:
 *   · motor C4 (t7/decisionC4.jsx, `pieza.barajar`): T7-3 A1 a A7, T7-1 H3,
 *     H5 y A7. Se baraja UNA vez al montar, con la `barajar` de los Hacer
 *     (utils/barajar.js): dentro de una partida el orden no cambia; la
 *     siguiente trae otro.
 *   · T5 N3 (EscaleraHacer, `prepararN3`): las cuatro acciones, igual.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = (q) => ({ matches: /prefers-reduced-motion: reduce/.test(q), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.Element.prototype.scrollIntoView = () => {};
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  HTMLInputElement: w.HTMLInputElement, Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;
const M = await import("../../components/mecanicas/libros/t7/decisionC4.jsx");
const DecisionC4 = M.default;
const L3 = await import("../t5N3.js");
const D3 = await import("../../data/contabilidadT5_n3.js");
const RevisionQueFalta = (await import("../../components/mecanicas/libros/t5/RevisionQueFalta.jsx")).default;
const ViajeA7 = (await import("../../components/mecanicas/libros/t7/ElViajeDeUnaCajaC4.jsx")).default;

const C4 = new URL("../c4/", import.meta.url);
const PIEZAS = ["t73a1", "t73a2", "t73a3", "t73a4", "t73a5", "t73a6", "t73a7", "t71h3", "t71h5", "t71a7"];
const REGISTRO = Object.fromEntries(await Promise.all(PIEZAS.map(async (p) => [p, (await import(new URL(`${p}_c4.js`, C4))).CONSECUENCIA_C4])));
const eleccion = (I) => (I.tipo ?? "eleccion") === "eleccion" && !I.fijas && I.opciones.length > 1;

const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, raiz, ops: (sel = "[data-op]") => [...caja.querySelectorAll(sel)].map((x) => x.dataset.op ?? x.dataset.opcion), desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};

/* ═══════════ 1 · LAS DIEZ DEL MOTOR, MARCADAS; NADA FIJO POR SEMILLA ═══════════ */

test("★★★ D8 · las diez piezas del motor piden barajar, y cada una tiene algo que barajar", () => {
  for (const p of PIEZAS) {
    assert.equal(REGISTRO[p].barajar, true, `${p}: sin pieza.barajar sale siempre en el mismo orden`);
    assert.ok(REGISTRO[p].items.some(eleccion), `${p}: ninguna elección que barajar`);
  }
});

test("★★★ D8 · ya no hay barajado con semilla fija en las piezas C4 (Mello v4 §1)", () => {
  for (const f of readdirSync(C4).filter((x) => x.endsWith(".js"))) {
    assert.doesNotMatch(readFileSync(new URL(f, C4), "utf8"), /barajarFijo|estable entre visitas/, f);
  }
});

test("★★★ barajarItemsC4: baraja las elecciones; deja cifras, «propio» y las fijas como vienen", () => {
  const al = (xs) => [...xs].reverse();
  const items = [
    { id: "e", opciones: [{ id: "a" }, { id: "b" }, { id: "c" }] },
    { id: "k", tipo: "cifra", opciones: [{ id: "1" }, { id: "2" }] },
    { id: "p", tipo: "propio", opciones: [] },
    { id: "f", fijas: true, opciones: [{ id: "x" }, { id: "y" }] },
  ];
  const r = M.barajarItemsC4(items, al);
  assert.deepEqual(r.map((I) => I.opciones.map((o) => o.id)), [["c", "b", "a"], ["1", "2"], [], ["x", "y"]]);
  assert.deepEqual(items[0].opciones.map((o) => o.id), ["a", "b", "c"], "no toca el original");
});

/* ═══════════ 2 · EL MOTOR: UN SORTEO POR PARTIDA ═══════════ */

const ITEMS = [
  { id: "e1", texto: "T1", pregunta: "¿Dónde?", pista: "P1", bien: "B1", opciones: ["a", "b", "c", "d"].map((x, k) => ({ id: x, t: `Op ${x}`, correcta: k === 0, msg: `M-${x}` })) },
  { id: "e2", texto: "T2", pregunta: "¿Y aquí?", pista: "P2", bien: "B2", opciones: ["p", "q", "r"].map((x, k) => ({ id: x, t: `Op ${x}`, correcta: k === 0, msg: `M-${x}` })) },
];
const juguete = (barajar) => ({ id: "juguete", objeto: "Caja", modo: "aprender", titulo: "Juguete", items: ITEMS, consecuencia: (I, e) => ({ e }), Figura: () => null, ...(barajar === undefined ? {} : { barajar }) });

test("★★★ el motor: sin pieza.barajar, el orden de Near (las demás piezas no cambian)", async () => {
  const m = await montar(h(DecisionC4, { pieza: juguete() }));
  try { assert.deepEqual(m.ops(), ["a", "b", "c", "d"]); } finally { m.desmontar(); }
});

test("★★★ el motor: el orden se sortea al montar y se mantiene en toda la partida (re-render y un error)", async () => {
  /* Cada llamada da otro orden: si el motor volviera a sortear, se notaría. */
  let n = 0;
  const rotar = (xs) => { n += 1; const k = n % xs.length; return [...xs.slice(k), ...xs.slice(0, k)]; };
  const m = await montar(h(DecisionC4, { pieza: juguete(rotar) }));
  try {
    const primero = m.ops();
    assert.deepEqual(primero, ["b", "c", "d", "a"], "el sorteo del montaje");
    assert.equal(n, 2, "un sorteo por ítem, una sola vez");
    /* La vista rehace la pieza (p. ej. con su pie): el orden no cambia. */
    await act(async () => { m.raiz.render(h(DecisionC4, { pieza: juguete(rotar) })); });
    assert.deepEqual(m.ops(), primero);
    /* Un error (la escalera de Aprender deja otro intento): las opciones siguen donde estaban. */
    await act(async () => { m.caja.querySelector('[data-op="c"]').dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
    assert.deepEqual(m.ops(), primero);
    assert.equal(n, 2);
  } finally { m.desmontar(); }
});

test("★★★ el motor: con la barajar de los Hacer, otra partida trae otro orden", async () => {
  const vistos = new Set();
  for (let i = 0; i < 30 && vistos.size < 2; i++) {
    const m = await montar(h(DecisionC4, { pieza: juguete(true) }));
    try {
      const o = m.ops();
      assert.deepEqual([...o].sort(), ["a", "b", "c", "d"]);
      vistos.add(o.join("|"));
    } finally { m.desmontar(); }
  }
  assert.ok(vistos.size > 1, "treinta partidas con el mismo orden: no se baraja por intento");
});

test("★★★ T7-1 A7 montada: otra partida, otro orden de opciones", async () => {
  const vistos = new Set();
  for (let i = 0; i < 30 && vistos.size < 2; i++) {
    const m = await montar(h(ViajeA7, { rotulo: "R" }));
    try { vistos.add(m.ops(".c4-ops [data-op]").join("|")); } finally { m.desmontar(); }
  }
  assert.ok(vistos.size > 1, "A7 sale siempre igual");
});

/* ═══════════ 3 · T5 N3 ═══════════ */

test("★★★ T5 N3: prepararN3 baraja las acciones (los casos, en el orden de Mello); con un barajador, ese", () => {
  const ids = D3.ITEMS_N3.map((it) => it.id);
  assert.deepEqual(L3.prepararN3((xs) => xs).map((it) => it.opciones.map((o) => o.valor)), D3.ITEMS_N3.map((it) => it.opciones));
  const vistos = new Set();
  for (let i = 0; i < 30; i++) {
    const p = L3.prepararN3();
    assert.deepEqual(p.map((it) => it.id), ids);
    for (const it of p) assert.deepEqual(it.opciones.map((o) => o.valor).sort(), [...D3.ACCIONES_N3].sort());
    vistos.add(p[0].opciones.map((o) => o.valor).join("|"));
  }
  assert.ok(vistos.size > 1, "treinta partidas con las acciones en el mismo orden");
});

test("★★★ T5 N3 montada: el orden de la partida sigue igual tras el primer error (la escalera da otro intento)", async () => {
  const m = await montar(h(RevisionQueFalta, { Marco: ({ children }) => h("div", null, children) }));
  try {
    const orden = m.ops("[data-opcion]");
    assert.deepEqual([...orden].sort(), [...D3.ACCIONES_N3].sort());
    const mala = orden.find((v) => v !== D3.ITEMS_N3[0].correcta);
    await act(async () => { m.caja.querySelector(`[data-opcion="${mala}"] button`).dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
    await act(async () => { await new Promise((r) => setTimeout(r, 450)); });
    assert.deepEqual(m.ops("[data-opcion]"), orden);
  } finally { m.desmontar(); }
});
