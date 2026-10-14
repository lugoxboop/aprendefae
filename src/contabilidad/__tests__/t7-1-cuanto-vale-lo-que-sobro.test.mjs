import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · H3 «¿Cuánto vale lo que sobró?» (Célula C) · Hacer.
 *
 *   · cada texto es, letra por letra, el de Near; donde la corrección 2
 *     cambia un texto (los dos errores del ítem 1), manda la nueva, la vieja
 *     ya no aparece y ninguno nombra el método de su cifra
 *   · las cifras se RECALCULAN aquí, con un cálculo propio unidad por unidad
 *     desde las capas y las vendidas, y dan las de Near y las de la ficha
 *   · cinco ítems, un solo intento cada uno (patrón v3.2): al tocar, se
 *     bloquea; un segundo toque no cambia nada; el detalle anota un intento
 *   · los ítems en el orden de la tabla; las opciones, barajadas
 *   · evaluativa, medio, 25 FP, en el cliente y en la migración 0093; entre
 *     AP3 y AP4; la vista lo abre desde el camino y registra con el motor
 *     compartido; el panel docente lee cada item_id desde los datos
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

const D = await import("../../data/contabilidadT7_1_h3.js");
const L = await import("../t7H3.js");
const { pesos } = await import("../../data/contabilidad.js");
const { SUBJECTS, HACER, APRENDER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: CuantoValeLoQueSobro } = await import("../../components/mecanicas/libros/t7/CuantoValeLoQueSobro.jsx");
const { JUEGOS_T7_1, TEMA_T7_1 } = await import("../../components/ContabilidadT7_1View.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V1 = leer("orquestador/conocimiento/paquetes/t7-1-h3-v1.md");
const CAMBIOS = leer("orquestador/conocimiento/paquetes/t7-1-h3-cambios.md");
const VISTA = leer("src/components/ContabilidadT7_1View.jsx");
const MIGRACION = leer("supabase/migrations/0093_t7_1_cuanto_vale_lo_que_sobro.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_1);

/* Sin barajar: las opciones en el orden de los datos (la buena primero). */
const EN_ORDEN = L.prepararH3((xs) => [...xs]);

const Marco = ({ children }) => h("div", { "data-marco": true }, children);
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(CuantoValeLoQueSobro, { Marco, items: EN_ORDEN, onCompletar: (...a) => completados.push(a), ...props })); });
  return { caja, completados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const opcion = (caja, v) => caja.querySelector(`[data-opcion="${v}"] button`);
const siguiente = (caja) => [...caja.querySelectorAll("button")].find((b) => Object.values(D.BOTON_H3).includes(b.textContent));
const retro = (caja) => [...caja.querySelectorAll("[data-texto-retro]")].map((p) => p.textContent);
const cifra = (s) => Number(s.replace(/[$.]/g, ""));

/* ═══════════ 1 · LAS CIFRAS, RECALCULADAS ═══════════ */

/*
 * Un cálculo propio, distinto del de los datos: se arma la fila de cajas una
 * por una, se sacan las vendidas por el extremo que dice cada método y se
 * suma lo que queda.
 */
function recalcular() {
  const cajas = D.CAPAS_H3.flatMap((c) => Array.from({ length: c.cajas }, () => c.costo));
  const total = cajas.reduce((s, x) => s + x, 0);
  const quedan = cajas.length - D.VENDIDAS_H3;
  const suma = (xs) => xs.reduce((s, x) => s + x, 0);
  return {
    disponibles: cajas.length, total, quedan,
    peps: suma(cajas.slice(D.VENDIDAS_H3)),
    ueps: suma(cajas.slice(0, quedan)),
    promedio: total / cajas.length,
    finalPromedio: quedan * (total / cajas.length),
  };
}

test("★★★ las cifras se recalculan desde las capas (20 × 12.800 y 60 × 15.400, 70 vendidas) y dan las de Near", () => {
  assert.deepEqual(D.CAPAS_H3.map((c) => [c.cajas, c.costo]), [[20, 12_800], [60, 15_400]]);
  assert.equal(D.VENDIDAS_H3, 70);
  const R = recalcular();
  const C = D.CIFRAS_H3;
  for (const k of ["disponibles", "quedan", "peps", "ueps", "promedio", "finalPromedio"]) assert.equal(C[k], R[k], k);
  assert.equal(C.costoTotal, R.total);
  /* Las de Near, y el registro 5c de la v1. */
  assert.deepEqual([R.peps, R.ueps, R.promedio, R.finalPromedio, R.total, R.quedan], [154_000, 128_000, 14_750, 147_500, 1_180_000, 10]);
  assert.ok(V1.includes("256.000 · 924.000 · 1.180.000 · 14.750 · 154.000 · 128.000 · 147.500"));
  assert.ok(V1.includes("**Distractores nuevos, que entran hoy:** 14.100 · 141.000."));
  /* Cada distractor es la confusión que dice la v1, calculada. */
  const it = Object.fromEntries(D.ITEMS_H3.map((x) => [x.id, x]));
  const medio = (12_800 + 15_400) / 2;
  assert.deepEqual(it["costo-promedio"].distractores.map((d) => d.valor), [medio, 15_400]);
  assert.deepEqual(it["final-promedio"].distractores.map((d) => d.valor), [R.quedan * medio, R.total]);
  assert.deepEqual(it.ueps.distractores.map((d) => d.valor), [R.peps, 20 * 12_800]);
  /* Las cifras de B-1 (A3) no aparecen: H3 no repite ninguna. */
  const todas = D.ITEMS_H3.flatMap((x) => L.opcionesDeH3(x)).filter((v) => typeof v === "number");
  for (const b1 of [125_000, 100_000, 118_750, 23_750]) assert.ok(!todas.includes(b1), `${b1} es de B-1`);
});

/* ═══════════ 2 · TEXTOS CONTRA NEAR ═══════════ */

test("★★★ nombre, id, etiqueta, entrada, consigna, ficha y pie son los de la v1, letra por letra", () => {
  assert.equal(D.H3_ID, "t7-1-cuanto-vale-lo-que-sobro");
  assert.ok(V1.includes(`| id | \`${D.H3_ID}\` |`));
  assert.ok(V1.includes(`**T7-1 · H3 «${D.H3.nombre}»`));
  assert.ok(V1.includes(`| Etiqueta | «${D.H3.etiqueta}» |`));
  assert.ok(V1.includes(`- «${D.H3.entrada}»`));
  assert.ok(V1.includes(`- «${D.H3.consigna}»`));
  for (const [dato, texto] of D.FICHA_H3) assert.ok(V1.includes(`| ${dato} | ${texto} |`), dato);
  assert.ok(V1.includes(`**Pie de todos los ítems:** «${D.H3.pie}»`));
});

function filasV1() {
  const lineas = V1.slice(V1.indexOf("## Ítems")).split("\n").filter((l) => /^\| \d \|/.test(l));
  return lineas.map((l) => l.slice(1, -1).split(" | ").map((c) => c.trim()));
}
const citas = (celda) => [...celda.matchAll(/«([^»]+)»/g)].map((m) => m[1]);

test("★★★ cada ítem es el de la v1, con la corrección 2 aplicada: manda la más nueva", () => {
  const filas = filasV1();
  assert.equal(filas.length, 5);
  assert.equal(D.ITEMS_H3.length, 5);
  for (const [k, it] of D.ITEMS_H3.entries()) {
    const [n, pregunta, correcta, distractores, acierto] = filas[k];
    assert.equal(n, String(k + 1));
    const c = citas(pregunta);
    if (it.encabezado) assert.deepEqual(c, [it.encabezado, it.pregunta], `${it.id}: encabezado y pregunta`);
    else assert.deepEqual(c, [it.pregunta], `${it.id}: pregunta`);
    assert.equal(it.acierto, citas(acierto)[0], `${it.id}: acierto`);
    if (it.opcionesTexto) {
      assert.equal(L.textoDeOpcionH3(it, it.correcta), correcta);
      assert.ok(distractores.startsWith(`${it.distractores.map((d) => L.textoDeOpcionH3(it, d.valor)).join(" · ")}. Los dos reciben:`));
      for (const d of it.distractores) assert.equal(d.retro, citas(distractores)[0]);
      continue;
    }
    assert.equal(pesos(it.correcta), correcta, `${it.id}: correcta`);
    const deV1 = [...distractores.matchAll(/(\$[\d.]+): «([^»]+)»/g)].map((m) => ({ valor: cifra(m[1]), retro: m[2] }));
    assert.deepEqual(it.distractores.map((d) => d.valor), deV1.map((d) => d.valor), `${it.id}: distractores`);
    for (const [j, d] of it.distractores.entries()) {
      if (it.id === "peps") {
        assert.notEqual(d.retro, deV1[j].retro, `ítem 1, ${d.valor}: sigue el texto de la v1`);
        assert.ok(CAMBIOS.includes(`${pesos(d.valor)}: «${d.retro}»`), `ítem 1, ${d.valor}: el texto nuevo no está en la corrección 2`);
        assert.doesNotMatch(d.retro, /UEPS|promedio/i, `ítem 1, ${d.valor}: nombra el método de la cifra`);
      } else {
        assert.equal(d.retro, deV1[j].retro, `${it.id}: retro de ${d.valor}`);
      }
    }
  }
});

test("★★ la nota de Mello sobre 154.000 y 147.500 queda escrita en los datos", () => {
  const fuente = leer("src/data/contabilidadT7_1_h3.js");
  assert.match(fuente, /NOTA DE MELLO: 154\.000 \(PEPS\) y 147\.500 \(promedio\) coinciden con un\s+\*\s+ejercicio del banco común \(pp\. 268-269\)/);
});

/* ═══════════ 3 · LA MECÁNICA, MONTADA ═══════════ */

test("★★★ un solo intento por ítem: al tocar, todo se bloquea y un segundo toque no cambia nada", async () => {
  const m = await montar();
  try {
    const it = D.ITEMS_H3[0];
    const mala = it.distractores[1].valor;
    await tocar(opcion(m.caja, mala));
    const antes = retro(m.caja);
    for (const v of L.opcionesDeH3(it)) assert.equal(opcion(m.caja, v).disabled, true, `${v} sigue activa`);
    await tocar(opcion(m.caja, it.correcta));
    assert.deepEqual(retro(m.caja), antes, "un segundo toque cambió la devolución");
    assert.equal(opcion(m.caja, it.correcta).dataset.estado, "revelada");
    assert.equal(opcion(m.caja, mala).dataset.estado, "incorrecta");
  } finally {
    m.desmontar();
  }
});

async function jugar(m, falla) {
  const detalle = [];
  for (const [k, it] of D.ITEMS_H3.entries()) {
    assert.equal(m.caja.querySelector("[data-pregunta]").textContent, it.pregunta, `orden: el ítem ${k + 1}`);
    assert.equal(m.caja.querySelector("[data-pie]").textContent, D.H3.pie);
    const enc = m.caja.querySelector("[data-encabezado-metodo]");
    assert.equal(enc ? enc.textContent : null, it.encabezado ? it.encabezado.toUpperCase() : null, `${it.id}: encabezado`);
    assert.equal(siguiente(m.caja) === undefined, true, `${it.id}: «Siguiente» antes de responder`);
    const v = falla(it.id) ? it.distractores[0].valor : it.correcta;
    await tocar(opcion(m.caja, v));
    const ok = v === it.correcta;
    assert.deepEqual(retro(m.caja), [ok ? it.acierto : it.distractores[0].retro], it.id);
    assert.equal(m.caja.querySelector("[data-panel]").dataset.panel, ok ? "acierto" : "error");
    detalle.push({ item: it.id, ok, intentos: 1, respuesta: ok ? null : v, orden: k + 1 });
    assert.equal(siguiente(m.caja).textContent, k === 4 ? D.BOTON_H3.verResumen : D.BOTON_H3.siguiente);
    await tocar(siguiente(m.caja));
  }
  return detalle;
}

test("★★★ la tanda entera: cinco ítems, un intento cada uno, y el porcentaje es aciertos / 5", async () => {
  const m = await montar();
  try {
    const detalle = await jugar(m, (id) => ["ueps", "mas-alto"].includes(id));
    assert.equal(m.completados.length, 1);
    const [pct, ms, det] = m.completados[0];
    assert.deepEqual(det, detalle);
    assert.equal(pct, (3 / 5) * 100);
    assert.equal(typeof ms, "number");
    assert.equal(m.caja.querySelector("[data-resumen]").textContent, D.resumenH3(3, 5));
  } finally {
    m.desmontar();
  }
});

test("★★ el ítem 5 ofrece los tres métodos por su nombre, y los dos errores reciben el mismo porqué", async () => {
  const it = D.ITEMS_H3[4];
  assert.deepEqual(L.opcionesDeH3(it).map((v) => L.textoDeOpcionH3(it, v)).sort(), ["PEPS", "Promedio ponderado", "UEPS"]);
  assert.equal(it.distractores[0].retro, it.distractores[1].retro);
  assert.equal(L.evaluarH3(it, "promedio").texto, it.distractores[1].retro);
});

test("★★ los ítems en el orden de la tabla; las opciones, barajadas en cada intento", () => {
  const revolver = (xs) => [...xs].sort(() => Math.random() - 0.5);
  const ordenes = new Set();
  for (let i = 0; i < 60; i++) {
    const p = L.prepararH3(revolver);
    assert.deepEqual(p.map((x) => x.id), D.ITEMS_H3.map((x) => x.id));
    ordenes.add(p[0].opciones.join());
    for (const x of p) assert.deepEqual([...x.opciones].sort(), L.opcionesDeH3(x).sort());
  }
  assert.ok(ordenes.size > 1, "las opciones no se barajan");
  assert.match(leer("src/components/mecanicas/libros/t7/CuantoValeLoQueSobro.jsx"), /useTanda\(\(\) => items \?\? prepararH3\(barajar\)\)/);
});

/* ═══════════ 4 · CATÁLOGO, VISTA, MIGRACIÓN, PANEL DOCENTE ═══════════ */

test("★★★ en T7-1, entre AP3 y AP4: evaluativa, medio, 25 FP; las piezas de Aprender siguen sin FP", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T7_1, D.H3_ID), { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 });
  assert.equal(TEMA.actividades.find((a) => a.id === D.H3_ID).nombre, D.H3.nombre);
  for (const a of TEMA.actividades.filter((x) => x.clasificacion.tipo !== HACER)) assert.deepEqual(a.clasificacion, { tipo: APRENDER }, a.id);
  const ids = TEMA.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(D.H3_ID), ids.indexOf("t7-1-a3-tres-formas") + 1, "justo después de AP3");
  assert.equal(ids.indexOf("t7-1-a4-el-cierre-en-periodico"), ids.indexOf(D.H3_ID) + 1, "justo antes de AP4");
});

test("★★★ la vista abre desde el camino exactamente lo que el catálogo ofrece, y registra con el motor compartido", () => {
  const ofrecidas = actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort();
  assert.deepEqual(JUEGOS_T7_1.map((j) => j.id).sort(), ofrecidas);
  assert.equal(JUEGOS_T7_1.find((j) => j.id === D.H3_ID).Mecanica, CuantoValeLoQueSobro);
  assert.match(VISTA, /registrarActividadCompletada\(clas, \{\s*materiaId: MATERIA, temaId: TEMA_T7_1, actividadId, porcentajeAciertos: porcentaje, duracionMs, detalle,/);
  assert.match(VISTA, /onCompletar=\{\(pct, ms, detalle\) => completar\(juego\.id, pct, ms, detalle\)\}/);
  assert.match(leer("src/App.jsx"), /<ContabilidadT7_1View modo=\{modoTema\} nodoInicial=\{ruta\.extra\}/);
});

test("★★★ la 0093: del rango de la célula, un insert aditivo y repetible, con su comprobación y sin correr", () => {
  assert.match(MIGRACION, /\('t7-1-cuanto-vale-lo-que-sobro',\s*'contabilidad',\s*'inventarios-periodico',\s*'evaluativa',\s*'medio',\s*25,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  assert.match(sentencias, /select activity_id[\s\S]*where activity_id = 't7-1-cuanto-vale-lo-que-sobro';/);
  const dir = new URL("supabase/migrations/", RAIZ);
  const conElId = readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.H3_ID));
  assert.deepEqual(conElId, ["0093_t7_1_cuanto_vale_lo_que_sobro.sql"]);
  const n = Number(conElId[0].slice(0, 4));
  assert.ok(n >= 90 && n <= 109, `la ${conElId[0]} está fuera del rango 0090-0109`);
});

test("★★★ el panel docente: todo item_id que guarda la partida tiene etiqueta, leída de los datos (recortada a 70, como todas)", async () => {
  const m = await montar();
  try {
    await jugar(m, () => false);
    const ids = m.completados[0][2].map((d) => d.item);
    assert.equal(ids.length, 5);
    for (const id of ids) {
      const etiqueta = etiquetaDeItem(D.H3_ID, id);
      assert.ok(typeof etiqueta === "string" && etiqueta.trim() !== "", `${id}: sin etiqueta en el panel`);
      assert.equal(etiqueta, recortar(L.unidadDeH3(id)), id);
    }
  } finally {
    m.desmontar();
  }
  for (const it of D.ITEMS_H3) assert.equal(L.unidadDeH3(it.id), it.encabezado ? `${it.encabezado}: ${it.pregunta}` : it.pregunta);
  const fuente = leer("src/docente/etiquetasItem.js");
  const bloque = fuente.slice(fuente.indexOf("CONTABILIDAD · T7 «INVENTARIOS»"));
  assert.match(bloque.slice(0, bloque.indexOf("});")), /"t7-1-cuanto-vale-lo-que-sobro": \(id\) => unidadDeH3\(id\),/);
  for (const it of D.ITEMS_H3) assert.ok(!fuente.includes(it.pregunta), `${it.id}: la pregunta está copiada en etiquetasItem.js`);
});
