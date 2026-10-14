import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · H3 «¿Comercial o condicionado?» (Célula C) · Hacer.
 *
 *   · cada texto es, letra por letra, el de la v1; los ítems 3 y 4 repiten
 *     la retroalimentación de los ítems 2 y 1, como dice la v1
 *   · sin montos en pesos
 *   · un solo intento por ítem; las opciones, en el orden de la v1; siete
 *     unidades; el porcentaje es aciertos / 7
 *   · evaluativa, fácil, 10 FP, en el cliente y en la migración 0105; la
 *     vista lo abre y registra con el motor; el panel docente lee cada ítem
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

const D = await import("../../data/contabilidadT7_3_h3.js");
const L = await import("../t7_3H3.js");
const { SUBJECTS, HACER, APRENDER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: ComercialOCondicionado } = await import("../../components/mecanicas/libros/t7/ComercialOCondicionado.jsx");
const { JUEGOS_T7_3, TEMA_T7_3 } = await import("../../components/ContabilidadT7_3View.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V1 = leer("orquestador/conocimiento/paquetes/t7-3-h3-v1.md");
const MAPA = leer("orquestador/conocimiento/mapas/t7-inventarios.md");
const VISTA = leer("src/components/ContabilidadT7_3View.jsx");
const MIGRACION = leer("supabase/migrations/0105_t7_3_comercial_o_condicionado.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_3);
const citas = (celda) => [...celda.matchAll(/«([^»]+)»/g)].map((m) => m[1]);
const filas = () => V1.split("\n").filter((l) => /^\| \d \|/.test(l)).map((l) => l.split(" | ").map((c) => c.replace(/^\| | \|$/g, "")));

/* ═══════════ 1 · TEXTOS ═══════════ */

test("★★★ los textos son los de la v1, letra por letra", () => {
  assert.ok(V1.includes(`id \`${D.H3_ID}\``));
  assert.ok(V1.startsWith(`**T7-3 · H3 «${D.H3.nombre}» · versión 1.**`));
  assert.ok(MAPA.includes(`| 7 | ${D.H3_ID} | ${D.H3.nombre} | Hacer |`));
  assert.equal(D.H3.consigna, citas(V1.slice(V1.indexOf("## Consigna")).split("\n")[2])[0]);
  assert.ok(V1.includes(`**Pie de todos los ítems:** «${D.H3.pie}».`));
  const fs = filas();
  assert.equal(fs.length, 7);
  const it = D.ITEMS_H3;
  for (const [k, [n, caso, correcta, error, acierto]] of fs.entries()) {
    assert.equal(n, String(k + 1));
    assert.equal(it[k].pregunta, citas(caso)[0], it[k].id);
    assert.equal(it[k].correcta, correcta, it[k].id);
    /* «La misma del ítem N». */
    const misma = error.match(/^La misma del ítem (\d)$/);
    const fuente = misma ? fs[Number(misma[1]) - 1] : null;
    assert.equal(it[k].error, citas(fuente ? fuente[3] : error)[0], it[k].id);
    assert.equal(it[k].acierto, citas(fuente ? fuente[4] : acierto)[0], it[k].id);
    if (misma) assert.equal(acierto, `La misma del ítem ${misma[1]}`);
    /* Las opciones, en el orden de la v1: «Comercial / Condicionado» en el ítem 1, y así. */
    const ops = caso.match(/· (.+)$/)?.[1].split(" / ");
    if (ops) assert.deepEqual(it[k].opciones, ops, it[k].id);
  }
  /* Los ítems 2 a 4 no escriben sus opciones: son las del ítem 1. */
  for (const k of [1, 2, 3]) assert.deepEqual(it[k].opciones, ["Comercial", "Condicionado"]);
});

test("★★★ sin montos en pesos", () => {
  assert.doesNotMatch(JSON.stringify(D.ITEMS_H3), /\$/);
});

/* ═══════════ 2 · LA MECÁNICA, MONTADA ═══════════ */

const EN_ORDEN = L.prepararH3();
const Marco = ({ children }) => h("div", { "data-marco": true }, children);
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(ComercialOCondicionado, { Marco, onCompletar: (...a) => completados.push(a), ...props })); });
  return { caja, completados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const opcion = (caja, v) => caja.querySelector(`[data-opcion="${v}"] button`);
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent === texto);

async function jugar(m, falla) {
  const detalle = [];
  for (const [k, it] of EN_ORDEN.entries()) {
    assert.equal(m.caja.querySelector("[data-pregunta]").textContent, it.pregunta, `orden: el ítem ${k + 1}`);
    assert.equal(m.caja.querySelector("[data-item] [data-pie]").textContent, D.H3.pie);
    /* Sin barajar: en el orden de la v1. */
    assert.deepEqual([...m.caja.querySelectorAll("[data-opcion]")].map((x) => x.dataset.opcion), D.ITEMS_H3[k].opciones);
    const v = falla(it.id) ? it.opciones.find((o) => o.valor !== it.correcta).valor : it.correcta;
    await tocar(opcion(m.caja, v));
    for (const o of it.opciones) assert.equal(opcion(m.caja, o.valor).disabled, true);
    const ok = v === it.correcta;
    assert.deepEqual([...m.caja.querySelectorAll("[data-retro] [data-texto-retro]")].map((p) => p.textContent), [ok ? it.acierto : it.error]);
    if (!ok) assert.equal(opcion(m.caja, it.correcta).dataset.estado, "revelada");
    detalle.push({ item: it.id, ok, intentos: 1, respuesta: ok ? null : v, orden: detalle.length + 1 });
    await tocar(boton(m.caja, k === 6 ? D.BOTON_H3.verResumen : D.BOTON_H3.siguiente));
  }
  return detalle;
}

test("★★★ la tanda entera: siete ítems, un intento cada uno, y el porcentaje es aciertos / 7", async () => {
  const m = await montar();
  try {
    assert.ok(m.caja.textContent.includes(D.H3.consigna));
    const fallos = new Set(["valor-completo", "para-quien-compra", "es-devolucion"]);
    const detalle = await jugar(m, (id) => fallos.has(id));
    assert.equal(m.completados.length, 1);
    const [pct, , det] = m.completados[0];
    assert.deepEqual(det, detalle);
    assert.deepEqual(det.map((d) => d.item), L.unidadesH3());
    assert.equal(L.TOTAL_H3, 7);
    assert.equal(pct, (4 / 7) * 100);
  } finally {
    m.desmontar();
  }
});

/* ═══════════ 3 · CATÁLOGO, VISTA, MIGRACIÓN, PANEL DOCENTE ═══════════ */

test("★★★ en T7-3, justo después de A4: evaluativa, fácil, 10 FP", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T7_3, D.H3_ID), { tipo: HACER, modalidad: "evaluativa", dificultad: "facil", fpBase: 10 });
  assert.equal(TEMA.actividades.find((a) => a.id === D.H3_ID).nombre, D.H3.nombre);
  for (const a of TEMA.actividades.filter((x) => x.clasificacion.tipo !== HACER)) assert.deepEqual(a.clasificacion, { tipo: APRENDER }, a.id);
  const ids = TEMA.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(D.H3_ID), ids.indexOf("t7-3-descuento-en-dos-libros") + 1);
});

test("★★★ la vista abre lo que el catálogo ofrece y registra con el motor compartido", () => {
  const ofrecidas = actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort();
  assert.deepEqual(JUEGOS_T7_3.map((j) => j.id).sort(), ofrecidas);
  assert.equal(JUEGOS_T7_3.find((j) => j.id === D.H3_ID).Mecanica, ComercialOCondicionado);
  assert.match(VISTA, /registrarActividadCompletada\(clas, \{\s*materiaId: MATERIA, temaId: TEMA_T7_3, actividadId, porcentajeAciertos: porcentaje, duracionMs, detalle,/);
});

test("★★★ la 0105: del rango de la célula, aditiva y repetible, sin correr", () => {
  assert.match(MIGRACION, /\('t7-3-comercial-o-condicionado',\s*'contabilidad',\s*'inventarios-descuentos-nic2',\s*'evaluativa',\s*'facil',\s*10,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  assert.match(sentencias, /select activity_id[\s\S]*where activity_id = 't7-3-comercial-o-condicionado';/);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.H3_ID)), ["0105_t7_3_comercial_o_condicionado.sql"]);
  assert.deepEqual(readdirSync(dir).filter((f) => f.startsWith("0105")), ["0105_t7_3_comercial_o_condicionado.sql"]);
});

test("★★★ el panel docente: todo item_id que guarda la partida tiene etiqueta, leída de los datos", async () => {
  const m = await montar();
  try {
    await jugar(m, () => false);
    const ids = m.completados[0][2].map((d) => d.item);
    assert.equal(ids.length, 7);
    for (const id of ids) {
      const e = etiquetaDeItem(D.H3_ID, id);
      assert.ok(typeof e === "string" && e.trim() !== "", `${id}: sin etiqueta`);
      assert.equal(e, recortar(L.unidadDeH3(id)), id);
    }
    assert.equal(new Set(ids.map((id) => L.unidadDeH3(id))).size, 7);
  } finally {
    m.desmontar();
  }
  const fuente = leer("src/docente/etiquetasItem.js");
  const bloque = fuente.slice(fuente.indexOf("CONTABILIDAD · T7 «INVENTARIOS»"));
  assert.match(bloque.slice(0, bloque.indexOf("});")), /"t7-3-comercial-o-condicionado": \(id\) => unidadDeT73H3\(id\),/);
});
