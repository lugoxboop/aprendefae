import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · H7 «¿Qué control falta?» (Célula C) · Hacer.
 *
 *   · cada texto es el de Near; la corrección 6 manda en los casos 2, 3 y 4,
 *     y el objetivo es el que decidió L
 *   · cada caso tiene su control y sus dos distractores, los de la v1 (o los
 *     de la corrección); los controles 4 y 5 nunca son distractor el uno del
 *     otro; ninguna cifra salvo las 500 unidades del caso 4
 *   · seis casos, un solo intento cada uno; orden aleatorio de casos y de
 *     opciones; la línea del libro siempre a la vista
 *   · exploratoria, fácil, 10 FP, en el cliente y en la 0097; después de A7,
 *     la última de T7-1; el panel docente lee cada item_id desde los datos
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (f) => setTimeout(f, 0);
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia, requestAnimationFrame: w.requestAnimationFrame,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const D = await import("../../data/contabilidadT7_1_h7.js");
const L = await import("../t7H7.js");
const { SUBJECTS, HACER, APRENDER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: QueControlFalta } = await import("../../components/mecanicas/libros/t7/QueControlFalta.jsx");
const { JUEGOS_T7_1, TEMA_T7_1 } = await import("../../components/ContabilidadT7_1View.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V1 = leer("orquestador/conocimiento/paquetes/t7-1-h7-v1.md");
const CAMBIOS = leer("orquestador/conocimiento/paquetes/t7-1-h7-cambios.md");
const VISTA = leer("src/components/ContabilidadT7_1View.jsx");
const MIGRACION = leer("supabase/migrations/0097_t7_1_que_control_falta.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_1);

const EN_ORDEN = L.prepararH7((xs) => [...xs]);
const Marco = ({ children }) => h("div", { "data-marco": true }, children);
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(QueControlFalta, { Marco, items: EN_ORDEN, onCompletar: (...a) => completados.push(a), ...props })); });
  return { caja, completados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const opcion = (caja, v) => caja.querySelector(`[data-opcion="${v}"] button`);
const siguiente = (caja) => [...caja.querySelectorAll("button")].find((b) => Object.values(D.BOTON_H7).includes(b.textContent));
const retro = (caja) => [...caja.querySelectorAll("[data-texto-retro]")].map((p) => p.textContent);

/* Los nombres cortos de la tabla de la v1 y de la corrección, y su control. */
const CORTO = {
  "Almacén techado y con puertas": "almacen", "almacén": "almacen",
  "Póliza de seguros": "poliza", "póliza": "poliza",
  "Conteos físicos periódicos": "conteos",
  "Comparar los inventarios físicos con los registros contables": "comparar",
  "Verificaciones al azar": "azar", "verificaciones al azar": "azar",
  "Informe de recepción que va a contabilidad": "recepcion", "Informe de recepción": "recepcion", "informe de recepción": "recepcion", "informe": "recepcion",
};

/* ═══════════ 1 · TEXTOS Y CASOS CONTRA NEAR ═══════════ */

test("★★★ objetivo, consigna, opciones y nombre: los de Near, con el objetivo que decidió L", () => {
  assert.equal(D.H7_ID, "t7-1-que-control-falta");
  assert.ok(V1.includes(`| Etiqueta del panel docente | «${D.H7.etiqueta}» |`));
  assert.ok(V1.includes(`- **Propuesta:** «${D.H7.objetivo}»`));
  assert.ok(CAMBIOS.includes(`- «${D.H7.objetivo}»`));
  assert.doesNotMatch(D.H7.objetivo, /que lo evita/);
  for (const c of D.H7.consigna) assert.ok(V1.includes(`- «${c}»`), c);
  const nombres = V1.slice(V1.indexOf("**Nombres de las opciones**")).split("\n").filter((l) => /^- «/.test(l)).map((l) => l.match(/«([^»]+)»/)[1]);
  assert.deepEqual(D.CONTROLES_H7.map((c) => c.texto), nombres);
});

function filasV1() {
  return V1.slice(V1.indexOf("## Casos")).split("\n").filter((l) => /^\| \d \|/.test(l)).map((l) => l.slice(1, -1).split(" | ").map((c) => c.trim()));
}
const cita = (celda) => celda.match(/«([^»]+)»/)?.[1] ?? null;

test("★★★ cada caso es el de la v1, con la corrección 6 en los casos 2, 3 y 4", () => {
  const filas = filasV1();
  assert.equal(filas.length, 6);
  for (const [k, c] of D.CASOS_H7.entries()) {
    const [n, caso, control, distractores, porque, subtema] = filas[k];
    assert.equal(n, String(k + 1));
    assert.equal(c.correcta, CORTO[control], `${c.id}: control`);
    assert.equal(c.porque, cita(porque), `${c.id}: línea del libro`);
    assert.equal(c.subtema, subtema);
    if (k >= 1 && k <= 3) {
      assert.notEqual(c.texto, cita(caso), `${c.id}: sigue el caso de la v1`);
      assert.ok(CAMBIOS.includes(`«${c.texto}»`), `${c.id}: el caso nuevo no está en la corrección`);
    } else assert.equal(c.texto, cita(caso), `${c.id}: caso`);
    assert.deepEqual(c.distractores, distractores.split(" · ").map((x) => CORTO[x]), `${c.id}: distractores`);
    /* Los controles 4 y 5 nunca son distractor el uno del otro. */
    if (c.correcta === "comparar") assert.ok(!c.distractores.includes("azar"));
    if (c.correcta === "azar") assert.ok(!c.distractores.includes("comparar"));
  }
  /* La corrección mantiene los distractores del caso 2 y del 3, y los del 4. */
  assert.ok(CAMBIOS.includes("Distractores: verificaciones al azar · informe de recepción."));
  assert.ok(CAMBIOS.includes("Los distractores no cambian (póliza · informe)."));
  assert.ok(CAMBIOS.includes("Distractores: almacén · póliza."));
});

test("★★ ninguna cifra salvo las 500 unidades del caso 4, que la corrección pone en el registro", () => {
  const cifras = JSON.stringify(D.CASOS_H7.map((c) => [c.texto, c.porque])).match(/\d+/g) ?? [];
  assert.deepEqual(cifras, ["500"]);
  assert.ok(CAMBIOS.includes("Las 500 unidades entran al registro 5c."));
});

/* ═══════════ 2 · LA MECÁNICA, MONTADA ═══════════ */

test("★★★ la tanda entera: seis casos, un intento cada uno; la línea del libro siempre a la vista", async () => {
  const m = await montar();
  try {
    const detalle = [];
    for (const [k, c] of EN_ORDEN.entries()) {
      assert.equal(m.caja.querySelector("[data-pregunta]").textContent, c.texto);
      assert.equal(m.caja.querySelector("[data-pie]").textContent, c.pie);
      const falla = k % 2 === 1;
      const v = falla ? c.distractores[0] : c.correcta;
      await tocar(opcion(m.caja, v));
      for (const o of c.opciones) assert.equal(opcion(m.caja, o.valor).disabled, true);
      await tocar(opcion(m.caja, c.correcta));
      assert.deepEqual(retro(m.caja), falla ? [c.porque] : [D.CORRECTO_H7, c.porque], c.id);
      if (falla) assert.equal(opcion(m.caja, c.correcta).dataset.estado, "revelada");
      detalle.push({ item: c.id, ok: !falla, intentos: 1, respuesta: falla ? v : null, orden: k + 1 });
      await tocar(siguiente(m.caja));
    }
    const [pct, , det] = m.completados[0];
    assert.deepEqual(det, detalle);
    assert.equal(pct, 50);
  } finally {
    m.desmontar();
  }
});

test("★★ los casos y sus opciones se barajan en cada intento", () => {
  const revolver = (xs) => [...xs].sort(() => Math.random() - 0.5);
  const casos = new Set(); const ops = new Set();
  for (let i = 0; i < 60; i++) {
    const p = L.prepararH7(revolver);
    assert.deepEqual(p.map((c) => c.id).sort(), D.CASOS_H7.map((c) => c.id).sort());
    casos.add(p.map((c) => c.id).join());
    ops.add(p.find((c) => c.id === "incendio").opciones.map((o) => o.valor).join());
  }
  assert.ok(casos.size > 1 && ops.size > 1);
});

/* ═══════════ 3 · CATÁLOGO, VISTA, MIGRACIÓN, PANEL DOCENTE ═══════════ */

test("★★★ en T7-1, después de A7 y última: exploratoria, fácil, 10 FP", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T7_1, D.H7_ID), { tipo: HACER, modalidad: "exploratoria", dificultad: "facil", fpBase: 10 });
  for (const a of TEMA.actividades.filter((x) => x.clasificacion.tipo !== HACER)) assert.deepEqual(a.clasificacion, { tipo: APRENDER }, a.id);
  const ids = TEMA.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(D.H7_ID), ids.indexOf("t7-1-a7-control-interno") + 1);
  assert.equal(ids.at(-1), D.H7_ID);
});

test("★★★ la vista abre lo que el catálogo ofrece y registra con el motor compartido", () => {
  const ofrecidas = actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort();
  assert.deepEqual(JUEGOS_T7_1.map((j) => j.id).sort(), ofrecidas);
  assert.equal(JUEGOS_T7_1.find((j) => j.id === D.H7_ID).Mecanica, QueControlFalta);
  assert.match(VISTA, /registrarActividadCompletada\(clas, \{\s*materiaId: MATERIA, temaId: TEMA_T7_1, actividadId, porcentajeAciertos: porcentaje, duracionMs, detalle,/);
});

test("★★★ la 0097: del rango de la célula, aditiva y repetible, sin correr", () => {
  assert.match(MIGRACION, /\('t7-1-que-control-falta',\s*'contabilidad',\s*'inventarios-periodico',\s*'exploratoria',\s*'facil',\s*10,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.H7_ID)), ["0097_t7_1_que_control_falta.sql"]);
});

test("★★★ el panel docente: todo item_id que guarda la partida tiene etiqueta, leída de los datos", async () => {
  const m = await montar();
  try {
    for (const c of EN_ORDEN) {
      await tocar(opcion(m.caja, c.correcta));
      await tocar(siguiente(m.caja));
    }
    const ids = m.completados[0][2].map((d) => d.item);
    assert.equal(ids.length, 6);
    for (const id of ids) {
      const e = etiquetaDeItem(D.H7_ID, id);
      assert.ok(typeof e === "string" && e.trim() !== "", `${id}: sin etiqueta`);
      assert.equal(e, recortar(D.CASOS_H7.find((c) => c.id === id).texto), id);
    }
  } finally {
    m.desmontar();
  }
  const fuente = leer("src/docente/etiquetasItem.js");
  const bloque = fuente.slice(fuente.indexOf("CONTABILIDAD · T7 «INVENTARIOS»"));
  assert.match(bloque.slice(0, bloque.indexOf("});")), /"t7-1-que-control-falta": \(id\) => unidadDeH7\(id\),/);
  for (const c of D.CASOS_H7) assert.ok(!fuente.includes(c.texto), `${c.id}: el caso está copiado en etiquetasItem.js`);
});
