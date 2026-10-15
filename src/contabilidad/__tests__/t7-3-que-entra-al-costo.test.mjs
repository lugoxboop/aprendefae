import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import { sinUnSoloIntento } from "../armaLaLinea.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · H6 «¿Entra al costo?» (Célula C) · Hacer.
 *
 *   · cada texto es, letra por letra, el de la v1; «Igual que en 1» e
 *     «Igual que en 4» repiten esos textos
 *   · la frase fija de la NIC 2, la de A7, siempre a la vista: en cada
 *     ítem, con el error y con el acierto, y en el cierre
 *   · sin cifras
 *   · un solo intento por cosa; las tres opciones, en el orden de la v1;
 *     siete unidades; el porcentaje es aciertos / 7
 *   · evaluativa, fácil, 10 FP, en el cliente y en la migración 0108; la
 *     vista lo abre y registra con el motor; el panel docente lee cada cosa
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

const D = await import("../../data/contabilidadT7_3_h6.js")
const A7 = await import("../../data/contabilidadT7_3_a7.js");;
const L = await import("../t7_3H6.js");
const { SUBJECTS, HACER, APRENDER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: EntraAlCosto } = await import("../../components/mecanicas/libros/t7/EntraAlCosto.jsx");
const { JUEGOS_T7_3, TEMA_T7_3 } = await import("../../components/ContabilidadT7_3View.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V1 = leer("orquestador/conocimiento/paquetes/t7-3-h6-v1.md");
const MAPA = leer("orquestador/conocimiento/mapas/t7-inventarios.md");
const VISTA = leer("src/components/ContabilidadT7_3View.jsx");
const MIGRACION = leer("supabase/migrations/0108_t7_3_que_entra_al_costo.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_3);
const citas = (celda) => [...celda.matchAll(/«([^»]+)»/g)].map((m) => m[1]);
const filas = () => V1.split("\n").filter((l) => /^\| \d \|/.test(l)).map((l) => l.split(" | ").map((c) => c.replace(/^\| | \|$/g, "")));

/* ═══════════ 1 · TEXTOS ═══════════ */

test("★★★ los textos son los de la v1, letra por letra", () => {
  assert.ok(V1.includes(`id \`${D.H6_ID}\``));
  assert.ok(V1.startsWith(`**T7-3 · H6 «${D.H6.nombre}» · versión 1.**`));
  assert.ok(MAPA.includes(`| 13 | ${D.H6_ID} | ${D.H6.nombre} | Hacer |`));
  assert.equal(D.H6.consigna, citas(V1.split("\n").find((l) => l.startsWith("- Consigna:")))[0]);
  assert.ok(V1.includes(`**Pie:** «${D.H6.pie}».`));
  /* «Cada cosa tiene tres opciones: Se suma · Se resta · No entra.» */
  assert.ok(V1.includes(`- Cada cosa tiene tres opciones: ${D.OPCIONES_H6.join(" · ")}.`));
  const fs = filas();
  assert.equal(fs.length, 7);
  const it = D.ITEMS_H6;
  for (const [k, [n, cosa, correcta, acierto, error]] of fs.entries()) {
    assert.equal(n, String(k + 1));
    assert.equal(it[k].pregunta, citas(cosa)[0], it[k].id);
    assert.equal(it[k].correcta, correcta, it[k].id);
    assert.ok(D.OPCIONES_H6.includes(correcta));
    /* «Igual que en N». */
    const igual = acierto.match(/^Igual que en (\d)$/);
    const fuente = igual ? fs[Number(igual[1]) - 1] : null;
    if (igual) assert.equal(error, acierto);
    assert.equal(it[k].acierto, citas(fuente ? fuente[3] : acierto)[0], it[k].id);
    assert.equal(it[k].error, citas(fuente ? fuente[4] : error)[0], it[k].id);
    assert.deepEqual(it[k].opciones, D.OPCIONES_H6, it[k].id);
  }
  /* «El ítem 6 es el único con "No entra"». */
  assert.deepEqual(it.filter((x) => x.correcta === "No entra").map((x) => x.id), ["impuesto-recuperable"]);
});

test("★★★ la frase fija de la NIC 2 es la de A7, y sin cifras", () => {
  assert.equal(D.H6.aviso, A7.FRASE_NIC2);
  assert.ok(V1.includes("- Frase fija de la NIC 2"));
  /* «NIC 2» es el nombre de la norma, no una cifra. */
  assert.doesNotMatch((JSON.stringify(D.ITEMS_H6) + D.H6.consigna).replaceAll("NIC 2", "NIC"), /\d|\$/);
});

/* ═══════════ 2 · LA MECÁNICA, MONTADA ═══════════ */

const EN_ORDEN = L.prepararH6();
const Marco = ({ children }) => h("div", { "data-marco": true }, children);
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(EntraAlCosto, { Marco, onCompletar: (...a) => completados.push(a), ...props })); });
  return { caja, completados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const opcion = (caja, v) => caja.querySelector(`[data-opcion="${v}"] button`);
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent === texto);
const aviso = (caja) => [...caja.querySelectorAll("[data-aviso]")].map((x) => x.textContent);

async function jugar(m, falla) {
  const detalle = [];
  for (const [k, it] of EN_ORDEN.entries()) {
    assert.deepEqual(aviso(m.caja), [A7.FRASE_NIC2], `sin la frase en el ítem ${k + 1}`);
    assert.equal(m.caja.querySelector("[data-pregunta]").textContent, it.pregunta, `orden: el ítem ${k + 1}`);
    assert.equal(m.caja.querySelector("[data-item] [data-pie]").textContent, D.H6.pie);
    /* Sin barajar: en el orden de la v1. */
    assert.deepEqual([...m.caja.querySelectorAll("[data-opcion]")].map((x) => x.dataset.opcion), D.OPCIONES_H6);
    /* El error, con la última opción equivocada: «No entra» donde no es la buena. */
    const v = falla(it.id) ? it.opciones.findLast((o) => o.valor !== it.correcta).valor : it.correcta;
    await tocar(opcion(m.caja, v));
    for (const o of it.opciones) assert.equal(opcion(m.caja, o.valor).disabled, true);
    const ok = v === it.correcta;
    assert.deepEqual([...m.caja.querySelectorAll("[data-retro] [data-texto-retro]")].map((p) => p.textContent), [ok ? it.acierto : it.error]);
    if (!ok) assert.equal(opcion(m.caja, it.correcta).dataset.estado, "revelada");
    assert.deepEqual(aviso(m.caja), [A7.FRASE_NIC2], `sin la frase al responder el ítem ${k + 1}`);
    detalle.push({ item: it.id, ok, intentos: 1, respuesta: ok ? null : v, orden: detalle.length + 1 });
    await tocar(boton(m.caja, k === 6 ? D.BOTON_H6.verResumen : D.BOTON_H6.siguiente));
  }
  return detalle;
}

test("★★★ la tanda entera: siete cosas, un intento cada una, y el porcentaje es aciertos / 7", async () => {
  const m = await montar();
  try {
    assert.ok(m.caja.textContent.includes(sinUnSoloIntento(D.H6.consigna)));
    assert.ok(m.caja.querySelector("[data-contador-intento] [data-un-intento]"), "el distintivo junto al contador");
    const fallos = new Set(["almacenamiento", "impuesto-recuperable", "rebaja"]);
    const detalle = await jugar(m, (id) => fallos.has(id));
    assert.equal(m.completados.length, 1);
    const [pct, , det] = m.completados[0];
    assert.deepEqual(det, detalle);
    assert.deepEqual(det.map((d) => d.item), L.unidadesH6());
    assert.equal(L.TOTAL_H6, 7);
    assert.equal(pct, (4 / 7) * 100);
    /* Solo la correcta acierta: cualquiera de las otras dos es error. */
    for (const it of EN_ORDEN) for (const o of it.opciones) assert.equal(L.evaluarH6(it, o.valor).ok, o.valor === it.correcta, `${it.id} · ${o.valor}`);
    /* También en el cierre. */
    assert.deepEqual(aviso(m.caja), [A7.FRASE_NIC2]);
    assert.equal(m.caja.querySelector("[data-resumen]").textContent, D.resumenH6(4, 7));
  } finally {
    m.desmontar();
  }
});

/* ═══════════ 3 · CATÁLOGO, VISTA, MIGRACIÓN, PANEL DOCENTE ═══════════ */

test("★★★ retirada por la 0115: ya no está en el camino de T7-3 ni la ofrece la vista; su pieza, sus datos y la 0108 se quedan", () => {
  /* Retiro blando: sale de subjects.js y de la vista, pero no se borra nada. */
  assert.equal(TEMA.actividades.find((a) => a.id === D.H6_ID), undefined, "sigue en el camino");
  assert.ok(!JUEGOS_T7_3.some((j) => j.id === D.H6_ID), "la vista todavía la ofrece");
  assert.equal(typeof EntraAlCosto, "function", "la pieza se borró");
  for (const a of TEMA.actividades.filter((x) => x.clasificacion.tipo !== HACER)) assert.deepEqual(a.clasificacion, { tipo: APRENDER }, a.id);
  const retiro = leer("supabase/migrations/0115_c7_retira_cuatro_hacer.sql");
  assert.match(retiro, new RegExp(`update public\\.actividad_catalogo\\s+set retirada = true\\s+where activity_id in \\([^)]*'${D.H6_ID}'`));
});

test("★★★ la vista abre lo que el catálogo ofrece y registra con el motor compartido", () => {
  const ofrecidas = actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort();
  assert.deepEqual(JUEGOS_T7_3.map((j) => j.id).sort(), ofrecidas);
  assert.ok(!JUEGOS_T7_3.some((j) => j.id === D.H6_ID), "retirada: la vista no la ofrece");
  assert.match(VISTA, /registrarActividadCompletada\(clas, \{\s*materiaId: MATERIA, temaId: TEMA_T7_3, actividadId, porcentajeAciertos: porcentaje, duracionMs, detalle,/);
});

test("★★★ la 0108: del rango de la célula, aditiva y repetible, sin correr", () => {
  assert.match(MIGRACION, /\('t7-3-que-entra-al-costo',\s*'contabilidad',\s*'inventarios-descuentos-nic2',\s*'evaluativa',\s*'facil',\s*10,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  assert.match(sentencias, /select activity_id[\s\S]*where activity_id = 't7-3-que-entra-al-costo';/);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.H6_ID)), ["0108_t7_3_que_entra_al_costo.sql", "0115_c7_retira_cuatro_hacer.sql"]);
  assert.deepEqual(readdirSync(dir).filter((f) => f.startsWith("0108")), ["0108_t7_3_que_entra_al_costo.sql"]);
});

test("★★★ el panel docente: todo item_id que guarda la partida tiene etiqueta, leída de los datos", async () => {
  const m = await montar();
  try {
    await jugar(m, () => false);
    const ids = m.completados[0][2].map((d) => d.item);
    assert.equal(ids.length, 7);
    for (const id of ids) {
      const e = etiquetaDeItem(D.H6_ID, id);
      assert.ok(typeof e === "string" && e.trim() !== "", `${id}: sin etiqueta`);
      assert.equal(e, recortar(L.unidadDeH6(id)), id);
    }
    assert.equal(new Set(ids.map((id) => L.unidadDeH6(id))).size, 7);
  } finally {
    m.desmontar();
  }
  const fuente = leer("src/docente/etiquetasItem.js");
  const bloque = fuente.slice(fuente.indexOf("CONTABILIDAD · T7 «INVENTARIOS»"));
  assert.match(bloque.slice(0, bloque.indexOf("});")), /"t7-3-que-entra-al-costo": \(id\) => unidadDeT73H6\(id\),/);
});

/* ═══════════ PATRÓN T7-3 (Watari) ═══════════ */

test("★★★ Patrón T7-3: la frase de la NIC 2 va en la franja de Watari, lo primero de la actividad", async () => {
  const m = await montar();
  try {
    const raiz = m.caja.querySelector("[data-t7-3-h6]");
    assert.equal(raiz.firstElementChild.matches("p.t73pt-nic2[data-aviso]"), true);
    assert.ok(raiz.classList.contains("t73pt-pieza"));
    assert.ok([...m.caja.querySelectorAll("style")].some((s) => s.textContent.includes(".t73pt-nic2 { position: sticky;")));
    /* Lo demás lo cubre la clasificación que ya existe: sin figuras. */
    assert.equal(m.caja.querySelectorAll("figure").length, 0);
  } finally {
    m.desmontar();
  }
});
