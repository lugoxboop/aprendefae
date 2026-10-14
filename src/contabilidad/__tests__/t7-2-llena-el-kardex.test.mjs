import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · H3 «Llena el kárdex» (Célula C) · Hacer.
 *
 *   · las cifras de cada casilla se recalculan a mano desde los movimientos,
 *     capa por capa, y son las de Near; cada método cuadra con lo disponible
 *   · cada texto es, letra por letra, el de la v1 con las correcciones de
 *     Near (Laurel, el id del plan v1)
 *   · un solo intento por casilla: el punto abre las opciones, un toque las
 *     bloquea; las celdas que no se preguntan aparecen al responder el ítem
 *     anterior, y en Promedio el 12 y el 26 no se ven antes de tiempo
 *   · diez unidades; el porcentaje es aciertos / 10
 *   · evaluativa, difícil, 50 FP, en el cliente y en la migración 0100; la
 *     vista lo abre y registra con el motor; el panel docente lee cada unidad
 *   · regla 3: ninguna cifra del periódico
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

const D = await import("../../data/contabilidadT7_2_h3.js");
const L = await import("../t7_2H3.js");
const { pesos } = await import("../../data/contabilidad.js");
const { cifraK } = await import("../t7_2Kardex.js");
const { SUBJECTS, HACER, APRENDER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: LlenaElKardex } = await import("../../components/mecanicas/libros/t7/LlenaElKardex.jsx");
const { default: Kardex, PUNTO } = await import("../../components/mecanicas/libros/t7/KardexT7_2.jsx");
const { KARDEX_A3 } = await import("../../data/contabilidadT7_2_a3.js");
const { JUEGOS_T7_2, TEMA_T7_2 } = await import("../../components/ContabilidadT7_2View.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V1 = leer("orquestador/conocimiento/paquetes/t7-2-h3-v1.md");
const MAPA = leer("orquestador/conocimiento/mapas/t7-inventarios.md");
const VISTA = leer("src/components/ContabilidadT7_2View.jsx");
const MIGRACION = leer("supabase/migrations/0100_t7_2_llena_el_kardex.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_2);
const miles = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const item = (id) => D.ITEMS_H3.find((x) => x.id === id);

/* ═══════════ 1 · LAS CIFRAS, RECALCULADAS A MANO ═══════════ */

test("★★★ cada casilla, recalculada capa por capa desde los movimientos, es la de Near", () => {
  /* Inicio 20 × 3.100; compra del 6: 40 × 3.370; venta del 12: 45; compra del 18: 30 × 3.580; venta del 26: 25. */
  const peps = { v12: 20 * 3100 + 25 * 3370, v26: 15 * 3370 + 10 * 3580, fin: 20 * 3580 };
  const ueps = { v12: 40 * 3370 + 5 * 3100, v26: 25 * 3580, fin: 15 * 3100 + 5 * 3580 };
  const cu6 = (20 * 3100 + 40 * 3370) / 60;
  const cu18 = (15 * cu6 + 30 * 3580) / 45;
  const prom = { cu6, cu18, v12: 45 * cu6, v26: 25 * cu18, fin: 20 * cu18 };
  assert.deepEqual(Object.values(peps), [146_250, 86_350, 71_600]);
  assert.deepEqual(Object.values(ueps), [150_300, 89_500, 64_400]);
  assert.deepEqual([prom.cu6, prom.cu18, prom.fin], [3_280, 3_480, 69_600]);
  assert.deepEqual(D.ITEMS_H3.slice(0, 9).map((it) => it.correcta), [...Object.values(peps), ...Object.values(ueps), cu6, cu18, prom.fin]);
  /* Cada método cuadra: costo vendido + saldo final = lo disponible, $304.200. */
  const disponible = 20 * 3100 + 40 * 3370 + 30 * 3580;
  assert.equal(disponible, 304_200);
  assert.ok(V1.includes(`Total de los tres métodos: ${miles(disponible)} de mercancía disponible.`));
  for (const [v, fin] of [[peps.v12 + peps.v26, peps.fin], [ueps.v12 + ueps.v26, ueps.fin], [prom.v12 + prom.v26, prom.fin]]) assert.equal(v + fin, disponible);
  assert.deepEqual(D.VENDIDO_H3, { peps: peps.v12 + peps.v26, ueps: ueps.v12 + ueps.v26, promedio: prom.v12 + prom.v26 });
  assert.ok(V1.includes(`Después de comprobar se ven los tres totales: ${[D.VENDIDO_H3.peps, D.VENDIDO_H3.ueps, D.VENDIDO_H3.promedio].map(pesos).join(" · ")}.`));
  /* La mayor es la de UEPS, y es la respuesta del ítem 10. */
  assert.equal(Math.max(...Object.values(D.VENDIDO_H3)), D.VENDIDO_H3.ueps);
  assert.equal(item("comparar-metodos").correcta, "ueps");
  /* Los distractores son los productos que nombra la v1. */
  assert.deepEqual(item("peps-venta-12").distractores.map((d) => d.valor), [45 * 3100, 45 * 3370]);
  assert.deepEqual(item("promedio-costo-6").distractores.map((d) => d.valor), [(3100 + 3370) / 2, 3370]);
  assert.deepEqual(item("promedio-costo-18").distractores.map((d) => d.valor), [(3280 + 3580) / 2, (3100 + 3370 + 3580) / 3]);
  assert.deepEqual(item("promedio-saldo-final").distractores.map((d) => d.valor), [20 * 3280, 20 * 3580]);
});

test("★★★ los tres kárdex que se muestran son los del cálculo de A3 y A4, con los títulos de A3", () => {
  for (const m of D.METODOS_H3) {
    assert.equal(D.KARDEX_H3[m.id].titulo, KARDEX_A3[m.id].titulo);
    assert.deepEqual(D.KARDEX_H3[m.id].filas.map((r) => r.f), ["1 may", "6 may", "12 may", "18 may", "26 may"]);
    const fin = D.KARDEX_H3[m.id].filas.at(-1);
    assert.equal(fin.fin, true);
  }
  assert.deepEqual(D.KARDEX_H3.peps.filas[2].sa, [[20, 3100, 62_000], [25, 3370, 84_250]]);
  assert.deepEqual(D.KARDEX_H3.ueps.filas[4].sal, [[15, 3100, 46_500], [5, 3580, 17_900]]);
  assert.equal(D.KARDEX_H3.ueps.filas[4].salT, 64_400);
  assert.deepEqual(D.KARDEX_H3.promedio.filas[3].sal, [[45, 3480, 156_600]]);
});

test("★★★ regla 3: ninguna cifra del periódico ni de la lista de control", () => {
  const prohibidas = [3_200_000, 512_000, 112_000, 3_600_000, 4_800_000, 768_000, 168_000, 5_400_000, 800_000, 175_000, 5_625_000, 5_800_000, 3_900_000, 170_100];
  const todo = JSON.stringify(D.ITEMS_H3) + JSON.stringify(D.KARDEX_H3) + D.H3.enunciado.join(" ") + D.H3.movimientos.join(" ");
  for (const x of prohibidas) assert.ok(!todo.includes(miles(x)) && !todo.includes(String(x)), miles(x));
});

/* ═══════════ 2 · TEXTOS CONTRA NEAR ═══════════ */

const filas = () => V1.split("\n").filter((l) => /^\d+\t/.test(l)).map((l) => l.split("\t"));
const citas = (celda) => [...celda.matchAll(/«([^»]+)»/g)].map((m) => m[1]);

test("★★★ los textos son los de la v1, letra por letra, con las correcciones de Near", () => {
  /* El id y la empresa, de la tabla de correcciones. */
  assert.equal(D.H3_ID, "t7-2-llena-el-kardex");
  assert.ok(V1.includes(`H3 · id\tt7-2-llena-kardex\t${D.H3_ID}, como en el plan v1`));
  assert.ok(V1.includes(`H3 · enunciado\t«La empresa Nogal usa el sistema de inventario permanente. Estos son sus movimientos de mayo.»\t«${D.H3.enunciado[0]}»`));
  assert.ok(!JSON.stringify(D).includes("Nogal"));
  assert.ok(V1.startsWith(`T7-2 · H3 «${D.H3.nombre}» · versión 1`));
  assert.ok(MAPA.includes(`| 6 | ${D.H3_ID} | ${D.H3.nombre} | Hacer |`));
  assert.ok(V1.includes(`Consigna: «${D.H3.consigna}»`));
  assert.ok(V1.includes(`Pie de todos los ítems\t«${D.H3.pie}»`));
  assert.ok(V1.includes(`Subtemas\t${D.SUBTEMAS_H3.join(" · ")}`));
  assert.deepEqual(D.ITEMS_H3.map((it) => it.subtema), [0, 0, 0, 1, 1, 1, 2, 2, 2, 3].map((k) => D.SUBTEMAS_H3[k]));
  /* Los movimientos, renglón por renglón, sin el «;» o el «.» del final. */
  const movs = V1.split("\n").filter((l) => /^\d+ de mayo: /.test(l));
  assert.deepEqual(movs.map((l) => l.replace(/[;.]$/, "")), D.H3.movimientos);
  const fs = filas();
  assert.equal(fs.length, 10);
  const preguntas = [];
  for (const [k, it] of D.ITEMS_H3.entries()) {
    const [n, casilla, correcta, distractores, acierto] = fs[k];
    assert.equal(n, String(k + 1));
    /* La pregunta: la de la v1; los ítems 4 a 6 y 9 repiten la del mismo renglón de PEPS; el 8, «misma forma, “del 18”». */
    const propia = citas(casilla)[0];
    if (propia && propia !== "del 18") preguntas[k] = propia;
    else if (k === 7) { assert.match(casilla, /misma forma, «del 18»/); preguntas[k] = preguntas[6].replace("del 6", "del 18"); }
    else preguntas[k] = preguntas[k === 8 ? 2 : k - 3];
    assert.equal(it.pregunta, preguntas[k], it.id);
    assert.equal(it.metodo === null ? correcta : pesos(it.correcta), it.metodo === null ? D.nombreDeMetodo(it.correcta) : correcta, it.id);
    assert.equal(it.acierto, citas(acierto)[0], it.id);
    const deV1 = citas(distractores);
    if (it.tipo === "metodo") {
      assert.equal(distractores, `PEPS y Promedio ponderado. Los dos: «${it.distractores[0].retro}» (90,1)`);
      assert.deepEqual(it.distractores.map((d) => D.nombreDeMetodo(d.valor)), ["PEPS", "Promedio ponderado"]);
      assert.ok(it.distractores.every((d) => d.retro === deV1[0]));
      continue;
    }
    for (const [j, d] of it.distractores.entries()) {
      assert.equal(d.retro, deV1[j], `${it.id}: ${d.valor}`);
      assert.match(distractores, new RegExp(`\\${pesos(d.valor)}( \\([^)]*\\))?: «${d.retro.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}»`), `${it.id}: el distractor ${pesos(d.valor)}`);
    }
  }
  /* El método de cada pestaña, de la columna «Pestaña · casilla». */
  assert.deepEqual(fs.slice(0, 9).map((f) => f[1].split(" · ")[0]), D.ITEMS_H3.slice(0, 9).map((it) => (it.metodo === "promedio" ? "Promedio" : D.nombreDeMetodo(it.metodo).split(" ")[0])));
  assert.ok(V1.includes("La pestaña de UEPS lleva el rótulo «(no válido bajo NIIF)»"));
  assert.equal(D.nombreDeMetodo("ueps"), "UEPS (no válido bajo NIIF)");
});

/* ═══════════ 3 · LO QUE SE VE DEL KÁRDEX ═══════════ */

const fechas = (v) => v.filas.map((r) => r.f);
const conPunto = (v) => JSON.stringify(v.filas).includes(`"${PUNTO}"`);
/* Las cifras que se ven, como números: «3480» no se confunde con «134800». */
const cifras = (v) => new Set(v.filas.flatMap((r) => [r.en, r.sa, r.sal].flat().filter(Boolean).flat().concat([r.saT, r.salT])).filter((x) => typeof x === "number"));

test("★★★ las celdas aparecen al responder el ítem anterior; en Promedio, el 12 después del ítem 7 y el 26 después del 8", () => {
  assert.equal(L.PUNTO, PUNTO);
  /* Un método que no ha llegado no se abre. */
  assert.equal(L.vistaKardex("ueps", 2, true), null);
  assert.equal(L.vistaKardex("promedio", 5, true), null);
  /* PEPS, ítem 1: hasta el 6, y el 12 con el total de la salida en punto, sin capas ni saldo. */
  const p1 = L.vistaKardex("peps", 0, false);
  assert.deepEqual(fechas(p1), ["1 may", "6 may", "12 may"]);
  assert.deepEqual(p1.filas[2], { f: "12 may", sa: [], saT: PUNTO });
  assert.equal(p1.punto, "peps-venta-12");
  /* Respondido el 1: el 12 y el 18 completos, y el punto del 26 se ve, pero aún no es tocable. */
  const p1r = L.vistaKardex("peps", 0, true);
  assert.deepEqual(p1r.filas[2], D.KARDEX_H3.peps.filas[2]);
  assert.deepEqual(fechas(p1r), ["1 may", "6 may", "12 may", "18 may", "26 may"]);
  assert.equal(p1r.punto, null);
  /* Promedio, ítem 7: el saldo del 6 con el costo unitario en punto y el total vacío; nada del 12. */
  const p7 = L.vistaKardex("promedio", 6, false);
  assert.deepEqual(fechas(p7), ["1 may", "6 may"]);
  assert.deepEqual(p7.filas[1].sal, [[60, PUNTO, null]]);
  assert.ok(!cifras(p7).has(3280) && !cifras(p7).has(196_800));
  assert.ok(fechas(L.vistaKardex("promedio", 6, true)).includes("12 may"));
  /* Promedio, ítem 8: el 12 completo; el saldo del 18 en punto; nada del 26. */
  const p8 = L.vistaKardex("promedio", 7, false);
  assert.deepEqual(fechas(p8), ["1 may", "6 may", "12 may", "18 may"]);
  assert.deepEqual(p8.filas[3].sal, [[45, PUNTO, null]]);
  assert.ok(!cifras(p8).has(3480) && !cifras(p8).has(156_600));
  assert.ok(cifras(p8).has(3280) && cifras(p8).has(147_600));
  /* Promedio, ítem 9: la venta del 26 completa; el saldo final en punto. */
  const p9 = L.vistaKardex("promedio", 8, false);
  assert.deepEqual(p9.filas[4], { f: "26 may", sa: [[25, 3480, 87_000]], sal: [], salT: PUNTO });
  /* Ítem 10: los tres, completos, sin punto. */
  for (const m of D.METODOS_H3) {
    const v = L.vistaKardex(m.id, 9, false);
    assert.deepEqual(v.filas, D.KARDEX_H3[m.id].filas);
    assert.equal(conPunto(v), false);
  }
});

test("★★ el kárdex de A3 y A4 no cambia: sin punto ni pregunta, nada que tocar", async () => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(Kardex, { kardex: KARDEX_A3.ueps })); });
  assert.equal(caja.querySelector("[data-punto]") === null, true);
  assert.equal(caja.querySelector("button") === null, true);
  act(() => raiz.unmount());
  caja.remove();
});

/* ═══════════ 4 · LA MECÁNICA, MONTADA ═══════════ */

const EN_ORDEN = L.prepararH3((xs) => [...xs]);
const Marco = ({ children }) => h("div", { "data-marco": true }, children);
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(LlenaElKardex, { Marco, items: EN_ORDEN, onCompletar: (...a) => completados.push(a), ...props })); });
  return { caja, completados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const opcion = (caja, v) => caja.querySelector(`[data-opcion="${v}"] button`);
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent === texto);
const panel = (caja) => caja.querySelector("[data-panel-kardex]");
const pestana = (caja, m) => caja.querySelector(`[data-pestana="${m}"]`);

async function jugar(m, falla) {
  const detalle = [];
  for (const [k, it] of EN_ORDEN.entries()) {
    assert.equal(m.caja.querySelector("[data-pregunta]").textContent, it.pregunta, `orden: el ítem ${k + 1}`);
    assert.equal(m.caja.querySelector("[data-item] [data-pie]").textContent, D.H3.pie);
    const v = falla(it.id) ? it.distractores[0].valor : it.correcta;
    if (it.tipo === "casilla") {
      /* La pestaña del método, abierta; las de los métodos que no han llegado, cerradas. */
      assert.equal(panel(m.caja).dataset.panelKardex, it.metodo);
      assert.equal(pestana(m.caja, it.metodo).getAttribute("aria-selected"), "true");
      for (const x of D.METODOS_H3) assert.equal(pestana(m.caja, x.id).disabled, L.vistaKardex(x.id, k, false) === null, `${it.id}: pestaña ${x.id}`);
      /* Antes de tocar el punto, ni opciones ni la cifra. */
      assert.equal(m.caja.querySelector("[data-opcion]") === null, true, `${it.id}: opciones antes del punto`);
      const punto = panel(m.caja).querySelector('[data-punto="activo"] button');
      assert.equal(punto.getAttribute("aria-label"), it.pregunta);
      assert.equal(panel(m.caja).querySelectorAll('[data-punto="activo"]').length, 1);
      assert.ok(!panel(m.caja).textContent.includes(cifraK(it.correcta)), `${it.id}: la cifra se ve antes de responder`);
      await tocar(punto);
      assert.equal(punto.getAttribute("aria-expanded"), "true");
    }
    assert.deepEqual(it.opciones.map((o) => o.valor).sort(), L.opcionesDeH3(it).sort());
    await tocar(opcion(m.caja, v));
    for (const o of it.opciones) assert.equal(opcion(m.caja, o.valor).disabled, true);
    const ok = v === it.correcta;
    assert.deepEqual([...m.caja.querySelectorAll("[data-retro] [data-texto-retro]")].map((p) => p.textContent), L.evaluarH3(it, v).textos);
    if (!ok) assert.equal(opcion(m.caja, it.correcta).dataset.estado, "revelada");
    if (it.tipo === "casilla") {
      /* Respondida: la casilla muestra su cifra y ya no hay punto que tocar. */
      assert.ok(panel(m.caja).textContent.includes(cifraK(it.correcta)), `${it.id}: la cifra, después`);
      assert.equal(panel(m.caja).querySelector('[data-punto="activo"]') === null, true);
    } else {
      assert.deepEqual([...m.caja.querySelectorAll("[data-total-metodo]")].map((li) => li.textContent), D.METODOS_H3.map((x) => `${x.nombre}${pesos(D.VENDIDO_H3[x.id])}`));
    }
    detalle.push({ item: it.id, ok, intentos: 1, respuesta: ok ? null : v, orden: detalle.length + 1 });
    /* Un segundo toque no cambia nada. */
    await tocar(opcion(m.caja, it.correcta));
    assert.deepEqual([...m.caja.querySelectorAll("[data-retro] [data-texto-retro]")].map((p) => p.textContent), L.evaluarH3(it, v).textos);
    await tocar(boton(m.caja, k === 9 ? D.BOTON_H3.verResumen : D.BOTON_H3.siguiente));
  }
  return detalle;
}

test("★★★ la tanda entera: diez casillas, un intento cada una, y el porcentaje es aciertos / 10", async () => {
  const m = await montar();
  try {
    assert.deepEqual([...m.caja.querySelectorAll("[data-movimientos] li")].map((li) => li.textContent), D.H3.movimientos);
    const fallos = new Set(["peps-venta-26", "ueps-venta-12", "promedio-costo-18", "comparar-metodos"]);
    const detalle = await jugar(m, (id) => fallos.has(id));
    assert.equal(m.completados.length, 1);
    const [pct, , det] = m.completados[0];
    assert.deepEqual(det, detalle);
    assert.deepEqual(det.map((d) => d.item), L.unidadesH3());
    assert.equal(L.TOTAL_H3, 10);
    assert.equal(pct, (6 / 10) * 100);
  } finally {
    m.desmontar();
  }
});

test("★★ se puede volver a una pestaña ya llenada; la del ítem en curso sigue con su punto", async () => {
  const m = await montar();
  try {
    for (let k = 0; k < 3; k++) {
      await tocar(panel(m.caja).querySelector('[data-punto="activo"] button'));
      await tocar(opcion(m.caja, EN_ORDEN[k].correcta));
      await tocar(boton(m.caja, D.BOTON_H3.siguiente));
    }
    assert.equal(panel(m.caja).dataset.panelKardex, "ueps");
    await tocar(pestana(m.caja, "peps"));
    assert.equal(panel(m.caja).dataset.panelKardex, "peps");
    assert.ok(panel(m.caja).textContent.includes(cifraK(71_600)));
    assert.equal(panel(m.caja).querySelector("[data-punto]") === null, true);
    await tocar(pestana(m.caja, "ueps"));
    assert.equal(panel(m.caja).querySelectorAll('[data-punto="activo"]').length, 1);
  } finally {
    m.desmontar();
  }
});

test("★★ las opciones se barajan en cada intento; los ítems, no", () => {
  const revolver = (xs) => [...xs].sort(() => Math.random() - 0.5);
  const a = new Set();
  for (let i = 0; i < 60; i++) {
    const p = L.prepararH3(revolver);
    assert.deepEqual(p.map((x) => x.id), D.ITEMS_H3.map((x) => x.id));
    a.add(p[0].opciones.map((o) => o.valor).join());
  }
  assert.ok(a.size > 1);
});

/* ═══════════ 5 · CATÁLOGO, VISTA, MIGRACIÓN, PANEL DOCENTE ═══════════ */

test("★★★ en T7-2, justo después de A3: evaluativa, difícil, 50 FP", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T7_2, D.H3_ID), { tipo: HACER, modalidad: "evaluativa", dificultad: "dificil", fpBase: 50 });
  assert.equal(TEMA.actividades.find((a) => a.id === D.H3_ID).nombre, D.H3.nombre);
  for (const a of TEMA.actividades.filter((x) => x.clasificacion.tipo !== HACER)) assert.deepEqual(a.clasificacion, { tipo: APRENDER }, a.id);
  const ids = TEMA.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(D.H3_ID), ids.indexOf("t7-2-a3-el-kardex") + 1);
  const nombres = TEMA.actividades.map((a) => a.nombre);
  assert.equal(new Set(nombres).size, nombres.length);
});

test("★★★ la vista abre lo que el catálogo ofrece y registra con el motor compartido", () => {
  const ofrecidas = actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort();
  assert.deepEqual(JUEGOS_T7_2.map((j) => j.id).sort(), ofrecidas);
  assert.equal(JUEGOS_T7_2.find((j) => j.id === D.H3_ID).Mecanica, LlenaElKardex);
  assert.match(VISTA, /registrarActividadCompletada\(clas, \{\s*materiaId: MATERIA, temaId: TEMA_T7_2, actividadId, porcentajeAciertos: porcentaje, duracionMs, detalle,/);
});

test("★★★ la 0100: del rango de la célula, aditiva y repetible, sin correr", () => {
  assert.match(MIGRACION, /\('t7-2-llena-el-kardex',\s*'contabilidad',\s*'inventarios-permanente',\s*'evaluativa',\s*'dificil',\s*50,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  assert.match(sentencias, /select activity_id[\s\S]*where activity_id = 't7-2-llena-el-kardex';/);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.H3_ID)), ["0100_t7_2_llena_el_kardex.sql"]);
  assert.deepEqual(readdirSync(dir).filter((f) => f.startsWith("0100")), ["0100_t7_2_llena_el_kardex.sql"]);
});

test("★★★ el panel docente: todo item_id que guarda la partida tiene etiqueta, leída de los datos, y no se repiten", async () => {
  const m = await montar();
  try {
    await jugar(m, () => false);
    const ids = m.completados[0][2].map((d) => d.item);
    assert.equal(ids.length, 10);
    const etiquetas = ids.map((id) => etiquetaDeItem(D.H3_ID, id));
    for (const [k, id] of ids.entries()) {
      assert.ok(typeof etiquetas[k] === "string" && etiquetas[k].trim() !== "", `${id}: sin etiqueta`);
      assert.equal(etiquetas[k], recortar(L.unidadDeH3(id)), id);
    }
    assert.equal(new Set(ids.map((id) => L.unidadDeH3(id))).size, 10, "dos casillas con la misma etiqueta");
  } finally {
    m.desmontar();
  }
  const fuente = leer("src/docente/etiquetasItem.js");
  const bloque = fuente.slice(fuente.indexOf("CONTABILIDAD · T7 «INVENTARIOS»"));
  assert.match(bloque.slice(0, bloque.indexOf("});")), /"t7-2-llena-el-kardex": \(id\) => unidadDeT72H3\(id\),/);
});
