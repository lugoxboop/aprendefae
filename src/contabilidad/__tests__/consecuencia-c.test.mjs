import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { estadoInicialC4, reducirC4, deItem, figuraC4, ctxC4, fmtC4 } from "../../components/mecanicas/libros/t7/decisionC4.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOTE C4 · «TODA DECISIÓN SE PINTA» (D4 y D9; Watari, patrón de enganche C4,
 * consecuencia-c.test.mjs → aquí). La regla, comprobada en el CÓDIGO.
 *
 * Sin registro central: la prueba busca en src/ todo archivo `*_c4.js` y lee
 * su `CONSECUENCIA_C4 = { id, objeto, modo, items, consecuencia }` (el motor
 * es t7/decisionC4.jsx). Cada lote agrega su archivo y nada más.
 *
 *   C1  `consecuencia(item, eleccion)` existe y es pura (misma entrada, mismo
 *       estado); cada ítem tiene una sola correcta; cada opción de cifra, su `v`.
 *   C2  toda opción (buena o mala) y todo distractor de cifra da un estado
 *       distinto del de «sin elegir» (null) y del de las otras opciones.
 *   C3  el estado de una opción mala trae `falla` (texto, nunca solo color);
 *       el de la buena, no.
 *   C4  cada pieza declara su `objeto` (D9) y no hay dos con el mismo; ids únicos.
 *   C5  (Mello C4-1, bloquea) con una cifra ESCRITA y sin «Comprobar» (la
 *       correcta y cada distractor), la figura no califica: su HTML no trae
 *       `c4-cuadra`, `c4-falla` ni ` mal`. La figura recibe la cifra solo en
 *       `vista.borrador`. Para pintarla, la prueba busca en src/components el
 *       componente que exporta `PIEZA_C4 = { ...CONSECUENCIA_C4, Figura, … }`;
 *       una pieza con cifras sin su PIEZA_C4 es una falta.
 *
 * eleccion: el id de la opción en un ítem de elección; el número `v` en uno
 * de cifra. Los ítems «propio» (asientos que siguen como en main) no entran.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SRC = new URL("../../", import.meta.url);

function buscar(dir, cual = (n) => n.endsWith("_c4.js")) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    if (d.isDirectory()) return d.name === "node_modules" || d.name === "__tests__" ? [] : buscar(new URL(`${d.name}/`, dir), cual);
    return cual(d.name) ? [new URL(d.name, dir)] : [];
  });
}

const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const tipoDe = (item) => item.tipo ?? "eleccion";
const eleccionDe = (item, o) => (tipoDe(item) === "cifra" ? o.v : o.id);

/* La regla, como función: la usan las piezas reales y la de juguete. Devuelve las faltas por cláusula. */
export function reglaC4(piezas) {
  const f = { c1: [], c2: [], c3: [], c4: [] };
  const objetos = new Map(); const ids = new Set();
  for (const p of piezas) {
    if (!p || typeof p !== "object") { f.c1.push("un *_c4.js sin CONSECUENCIA_C4"); continue; }
    if (ids.has(p.id)) f.c4.push(`${p.id}: id repetido`);
    ids.add(p.id);
    if (!p.objeto) f.c4.push(`${p.id}: sin objeto`);
    else if (objetos.has(p.objeto)) f.c4.push(`${p.id} y ${objetos.get(p.objeto)}: «${p.objeto}»`);
    else objetos.set(p.objeto, p.id);
    if (typeof p.consecuencia !== "function") { f.c1.push(`${p.id}: sin consecuencia`); continue; }
    if (!Array.isArray(p.items) || !p.items.length) { f.c1.push(`${p.id}: sin ítems`); continue; }
    if (p.modo !== "hacer" && p.modo !== "aprender") f.c1.push(`${p.id}: modo «${p.modo}»`);
    for (const item of p.items.filter((x) => tipoDe(x) !== "propio")) {
      const donde = `${p.id} · ${item.id}`;
      if (item.opciones.filter((o) => o.correcta).length !== 1) f.c1.push(`${donde}: no tiene una sola correcta`);
      if (tipoDe(item) === "cifra" && item.opciones.some((o) => typeof o.v !== "number")) f.c1.push(`${donde}: opción de cifra sin v`);
      const base = p.consecuencia(item, null);
      if (!igual(base, p.consecuencia(item, null))) f.c1.push(`${donde}: no es pura`);
      const estados = item.opciones.map((o) => [o, p.consecuencia(item, eleccionDe(item, o))]);
      for (const [o, e] of estados) {
        const aqui = `${donde} · ${o.id}`;
        if (!igual(e, p.consecuencia(item, eleccionDe(item, o)))) f.c1.push(`${aqui}: no es pura`);
        if (e == null || igual(e, base) || estados.some(([j, g]) => j !== o && igual(e, g))) f.c2.push(aqui);
        const tiene = e && typeof e.falla === "string" && e.falla.trim() !== "";
        if (!o.correcta && !tiene) f.c3.push(`${aqui}: mala sin falla`);
        if (o.correcta && e?.falla) f.c3.push(`${aqui}: la buena trae falla`);
      }
    }
  }
  return f;
}

/* C5 · la figura con la cifra escrita, sin comprobar (el mismo camino que el motor: reducirC4 «escribir» → figuraC4 → Figura). */
const DELATORES = ["c4-cuadra", "c4-falla", " mal"];
export function figuraEscribiendo(pieza, i, texto) {
  const I = pieza.items[i];
  const s = reducirC4(pieza, { ...estadoInicialC4(), i }, { tipo: "escribir", texto });
  const E = deItem(s, I);
  const { vista, estado } = figuraC4(pieza, I, E);
  return { borrador: vista.borrador, html: renderToStaticMarkup(h(pieza.Figura, { estado, item: I, vista, ctx: ctxC4(pieza, I, E, vista) })) };
}
export function reglaBorradorC4(piezas, conFigura) {
  const faltas = [];
  for (const p of piezas) {
    const cifras = (p?.items ?? []).map((item, i) => [item, i]).filter(([item]) => tipoDe(item) === "cifra");
    if (!cifras.length) continue;
    const P = conFigura.find((x) => x?.id === p.id);
    if (typeof P?.Figura !== "function") { faltas.push(`${p.id}: sin PIEZA_C4 con Figura`); continue; }
    for (const [item, i] of cifras) {
      for (const o of item.opciones) {
        const { borrador, html } = figuraEscribiendo(P, i, fmtC4(item, o.v));
        const aqui = `${p.id} · ${item.id} · ${o.id}`;
        if (borrador !== o.v) faltas.push(`${aqui}: la cifra escrita no llegó (${borrador})`);
        for (const d of DELATORES) if (html.includes(d)) faltas.push(`${aqui}: «${d.trim()}» sin comprobar`);
      }
    }
  }
  return faltas;
}

const archivos = buscar(SRC);
const PIEZAS = await Promise.all(archivos.map(async (u) => (await import(pathToFileURL(u.pathname).href)).CONSECUENCIA_C4));
const FALTAS = reglaC4(PIEZAS);
const COMPONENTES = buscar(new URL("components/", SRC), (n) => n.endsWith(".jsx")).filter((u) => /export const PIEZA_C4\b/.test(readFileSync(u, "utf8")));
const CON_FIGURA = await Promise.all(COMPONENTES.map(async (u) => (await import(pathToFileURL(u.pathname).href)).PIEZA_C4));

test("C0 · la prueba encuentra las piezas *_c4.js (con 0, avisa y pasa)", (t) => {
  if (!archivos.length) t.diagnostic("AVISO C4: no hay piezas *_c4.js todavía; la regla se ejerce solo con la pieza de juguete.");
  else t.diagnostic(`C4: ${archivos.length} piezas · ${PIEZAS.reduce((n, p) => n + (p?.items?.length ?? 0), 0)} ítems`);
  assert.ok(Array.isArray(archivos));
});
test("C1 · cada pieza tiene su consecuencia pura", () => assert.deepEqual(FALTAS.c1, []));
test("C2 · toda opción cambia la figura, y cada una de forma distinta", () => assert.deepEqual(FALTAS.c2, []));
test("C3 · la consecuencia mala se dice con texto", () => assert.deepEqual(FALTAS.c3, []));
test("C4 · cada actividad tiene su objeto propio (D9)", () => assert.deepEqual(FALTAS.c4, []));
test("C5 · con la cifra escrita y sin comprobar, la figura no califica (Mello C4-1)", () => assert.deepEqual(reglaBorradorC4(PIEZAS, CON_FIGURA), []));

/* ═══════════ LA PIEZA DE JUGUETE: la regla pasa con ella y falla con cada mutación ═══════════ */

const ITEMS = [
  { id: "e1", pregunta: "¿Dónde?", opciones: [{ id: "a", t: "A", correcta: true }, { id: "b", t: "B" }, { id: "c", t: "C" }] },
  { id: "k1", tipo: "cifra", pregunta: "¿Cuánto?", opciones: [{ id: "100", t: "$100", v: 100, correcta: true }, { id: "90", t: "$90", v: 90 }] },
  { id: "p1", tipo: "propio", opciones: [] },
];
const juguete = (cambios = {}) => ({
  id: "juguete", objeto: "La caja de juguete", modo: "hacer", items: ITEMS,
  consecuencia(item, e) {
    if (e == null) return { caja: null };
    if (tipoDe(item) === "cifra") return e === 100 ? { caja: e } : { caja: e, falla: `Faltan ${100 - e}.` };
    return e === "a" ? { caja: e } : { caja: e, falla: `Cae en ${e}.` };
  },
  ...cambios,
});
const vacia = (f) => Object.values(f).every((x) => !x.length);

test("C★ · la pieza de juguete cumple la regla", () => assert.ok(vacia(reglaC4([juguete()])), JSON.stringify(reglaC4([juguete()]))));
test("C★ · y cada mutación la hace fallar en su cláusula", () => {
  const sinCambio = juguete({ consecuencia: (item, e) => (e === "b" ? { caja: null } : juguete().consecuencia(item, e)) });
  assert.deepEqual(reglaC4([sinCambio]).c2, ["juguete · e1 · b"]);
  const iguales = juguete({ consecuencia: (item, e) => (e === "c" ? { caja: "b", falla: "Cae en b." } : juguete().consecuencia(item, e)) });
  assert.deepEqual(reglaC4([iguales]).c2, ["juguete · e1 · b", "juguete · e1 · c"]);
  const muda = juguete({ consecuencia: (item, e) => (e === 90 ? { caja: 90 } : juguete().consecuencia(item, e)) });
  assert.deepEqual(reglaC4([muda]).c3, ["juguete · k1 · 90: mala sin falla"]);
  let n = 0;
  const impura = juguete({ consecuencia: (item, e) => ({ ...juguete().consecuencia(item, e), n: item.id === "e1" && e === "a" ? n++ : 0 }) });
  assert.ok(reglaC4([impura]).c1.includes("juguete · e1 · a: no es pura"));
  assert.deepEqual(reglaC4([juguete({ consecuencia: null })]).c1, ["juguete: sin consecuencia"]);
  assert.deepEqual(reglaC4([juguete(), juguete({ id: "otra" })]).c4, ["otra y juguete: «La caja de juguete»"]);
  assert.deepEqual(reglaC4([juguete({ objeto: "" })]).c4, ["juguete: sin objeto"]);
  const dosBuenas = juguete({ items: [{ ...ITEMS[0], opciones: ITEMS[0].opciones.map((o) => ({ ...o, correcta: true })) }] });
  assert.ok(reglaC4([dosBuenas]).c1.includes("juguete · e1: no tiene una sola correcta"));
});

/* C5 con la pieza de juguete: la figura escribe la cifra con `vista.borrador` y califica solo con `vista.valor`. */
const FiguraBuena = ({ estado, vista }) => h("div", { className: estado?.falla ? "c4-falla" : estado?.caja != null ? "c4-cuadra" : "c4-caja" },
  h("span", { "data-escrita": "" }, vista.borrador ?? ""), vista.valor != null && h("span", { className: `c4-op${estado?.falla ? " mal" : ""}` }, String(vista.valor)));
test("C5★ · la figura de juguete escribe la cifra sin calificarla; las mutaciones la ponen roja", () => {
  const P = { ...juguete(), Figura: FiguraBuena };
  assert.deepEqual(reglaBorradorC4([P], [P]), []);
  assert.match(figuraEscribiendo(P, 1, "90").html, /data-escrita="">90</, "la cifra escrita no se ve en la figura");
  // La figura de antes de C4-1: califica el borrador mientras se escribe.
  const Delatora = ({ vista }) => h("div", { className: vista.borrador === 100 ? "c4-cuadra" : vista.borrador != null ? "c4-falla" : "" });
  assert.deepEqual(reglaBorradorC4([P], [{ ...P, Figura: Delatora }]), ["juguete · k1 · 100: «c4-cuadra» sin comprobar", "juguete · k1 · 90: «c4-falla» sin comprobar"]);
  const Coral = ({ vista }) => h("span", { className: `c4-op${vista.borrador === 90 ? " mal" : ""}` });
  assert.deepEqual(reglaBorradorC4([P], [{ ...P, Figura: Coral }]), ["juguete · k1 · 90: «mal» sin comprobar"]);
  // Una figura que pinta la consecuencia del borrador: delata en cuanto el motor le da el borrador como elección.
  const DelBorrador = ({ item, vista }) => FiguraBuena({ vista: { ...vista, valor: vista.borrador }, estado: juguete().consecuencia(item, vista.borrador) });
  assert.deepEqual(reglaBorradorC4([P], [{ ...P, Figura: DelBorrador }]), ["juguete · k1 · 100: «c4-cuadra» sin comprobar", "juguete · k1 · 90: «c4-falla» sin comprobar", "juguete · k1 · 90: «mal» sin comprobar"]);
  assert.deepEqual(reglaBorradorC4([P], []), ["juguete: sin PIEZA_C4 con Figura"]);
});
