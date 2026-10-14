import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · H4 «Pagó a tiempo» (Célula C) · Hacer.
 *
 *   · las cifras se recalculan en centavos desde la lista, el 8 %, el 4 % y
 *     las tarifas, y son exactamente las del registro 5c de Near
 *   · cada texto es, letra por letra, el de la v1
 *   · un solo intento por unidad; en cada asiento, «Comprobar» califica las
 *     tres líneas una vez y las sumas aparecen después; once unidades; el
 *     porcentaje es aciertos / 11
 *   · evaluativa, difícil, 50 FP, en el cliente y en la migración 0106; la
 *     vista lo abre y registra con el motor; el panel docente lee cada unidad
 *   · ninguna cifra del libro (H-3 es de A3 y A4) ni de X1-X4
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

const D = await import("../../data/contabilidadT7_3_h4.js");
const L = await import("../t7_3H4.js");
const A3 = await import("../../data/contabilidadT7_3_a3.js");
const H1 = await import("../../data/contabilidadT7_3_h1.js");
const { DEBE, HABER, pesos } = await import("../../data/contabilidad.js");
const { SUBJECTS, HACER, APRENDER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: PagoATiempo } = await import("../../components/mecanicas/libros/t7/PagoATiempo.jsx");
const { JUEGOS_T7_3, TEMA_T7_3 } = await import("../../components/ContabilidadT7_3View.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V1 = leer("orquestador/conocimiento/paquetes/t7-3-h4-v1.md");
const MAPA = leer("orquestador/conocimiento/mapas/t7-inventarios.md");
const VISTA = leer("src/components/ContabilidadT7_3View.jsx");
const MIGRACION = leer("supabase/migrations/0106_t7_3_pago_a_tiempo.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_3);
const item = (id) => D.ITEMS_H4.find((x) => x.id === id);
const C = D.CIFRAS_H4;
const citas = (celda) => [...celda.matchAll(/«([^»]+)»/g)].map((m) => m[1]);
const filas = () => V1.split("\n").filter((l) => /^\| \d \|/.test(l)).map((l) => l.split(" | ").map((c) => c.replace(/^\| | \|$/g, "")));

/* ═══════════ 1 · LAS CIFRAS ═══════════ */

test("★★★ las cifras se recalculan en centavos y son exactamente las del registro de Near", () => {
  const de = (base, milesimas) => (base * 100 * milesimas) / 100_000 / 100;
  const comercial = de(2_125_000, 8_000); const f = 2_125_000 - comercial;
  const iva = de(f, 16_000); const ret = de(f, 3_500); const deuda = f + iva - ret;
  const cond = de(f, 4_000);
  assert.deepEqual([comercial, f, iva, ret, deuda, cond, deuda - cond], [170_000, 1_955_000, 312_800, 68_425, 2_199_375, 78_200, 2_121_175]);
  assert.deepEqual([C.comercial, C.factura, C.iva, C.retencion, C.deuda, C.condicionado, C.pago, C.sumasVenta], [comercial, f, iva, ret, deuda, cond, deuda - cond, f + iva]);
  const registro = V1.split("\n").find((l) => l.startsWith("- Registro 5c, T73-H4: ")).replace("- Registro 5c, T73-H4: ", "").replace(/\.$/, "").split(" · ").map((x) => Number(x.replace(/\./g, "")));
  const usadas = new Set([C.lista, C.comercial, C.factura, C.iva, C.retencion, C.deuda, C.sumasVenta, C.condicionado, C.pago,
    ...D.ITEMS_H4.filter((it) => it.pesos).flatMap((it) => it.distractores.map((d) => d.valor))]);
  assert.deepEqual([...usadas].sort((a, b) => a - b), [...registro].sort((a, b) => a - b));
  /* Los dos asientos del pago cuadran en 2.199.375. */
  for (const id of ["libro-de-totumo", "libro-de-bambu"]) {
    const s = (l) => item(id).lineas.filter((x) => x.lado === l).reduce((a, x) => a + x.valor, 0);
    assert.deepEqual([s(DEBE), s(HABER)], [C.deuda, C.deuda], id);
  }
});

test("★★★ ninguna cifra del libro (H-3) ni de X1-X4", () => {
  const prohibidas = [...Object.values(A3.H3_LIBRO), 800_000, 175_000, 5_625_000, 5_800_000, 1_200_000, 262_500, 643_500, 8_700_000, 2_432_000, 532_000, 384_000, 84_000, 2_700_000, 2_784_000, 17_632_000];
  const valores = new Set(D.ITEMS_H4.flatMap((it) => [it.correcta, ...(it.distractores ?? []).map((d) => d.valor), ...(it.lineas ?? []).map((l) => l.valor)]));
  for (const x of [...JSON.stringify(D).matchAll(/\d[\d.]*/g)]) valores.add(Number(x[0].replace(/\./g, "")));
  for (const x of prohibidas) assert.ok(!valores.has(x), String(x));
});

/* ═══════════ 2 · TEXTOS ═══════════ */

test("★★★ los textos son los de la v1, letra por letra", () => {
  assert.ok(V1.includes(`id \`${D.H4_ID}\``));
  assert.ok(V1.startsWith(`**T7-3 · H4 «${D.H4.nombre}» · versión 1.**`));
  assert.ok(MAPA.includes(`| 8 | ${D.H4_ID} | ${D.H4.nombre} | Hacer |`));
  const en = V1.slice(V1.indexOf("## Enunciado")).split("\n").filter((l) => l.startsWith("- "));
  assert.equal(D.H4.enunciado[0], citas(en[0])[0]);
  assert.equal(D.H4.enunciado[1], citas(en[1])[0]);
  assert.ok(en[2].startsWith("- Línea de tarifas («…Las dos se calculan sobre lo facturado.») y la frase fija."));
  assert.ok(D.H4.enunciado[2].endsWith("Las dos se calculan sobre lo facturado."));
  assert.ok(A3.PIEZA_EL_DESCUENTO_CONDICIONADO.pantallas.find((p) => p.id === "ejemplo").despues.includes(D.H4.enunciado[2]));
  assert.equal(D.H4.enunciado[3], H1.H1.enunciado[2]);
  assert.equal(D.H4.consigna, citas(en[3])[0]);
  const ficha = en[4].replace("- **Ficha:** ", "").match(/^(.+?)\. Sistema: (.+)\.$/);
  const esperada = [...ficha[1].split(" · ").map((x) => x.replace(/^(entrega|recibe) /, "")), ficha[2]];
  assert.deepEqual(D.FICHA_H4.map(([, x]) => x.toLowerCase()), esperada.map((x) => x.toLowerCase()));
  assert.ok(V1.includes(`**Pie de todos los ítems:** «${D.H4.pie}».`));
  const fs = filas();
  assert.equal(fs.length, 7);
  for (const [k, it] of D.ITEMS_H4.entries()) {
    const [n, pregunta, correcta, distractores, acierto] = fs[k];
    assert.equal(n, String(k + 1));
    assert.equal(it.pregunta, citas(pregunta)[0], it.id);
    if (it.tipo === "asiento") {
      const lineas = correcta.split(" · ").map((x) => x.match(/^(.+) \$([\d.]+) → (D|H)$/)).map((m) => [m[1], Number(m[2].replace(/\./g, "")), m[3] === "D" ? DEBE : HABER]);
      assert.deepEqual(it.lineas.map((l) => [l.cuenta, l.valor, l.lado]), lineas, it.id);
      assert.deepEqual(it.lineas.map((l) => l.retro), citas(distractores), it.id);
      assert.equal(acierto, `Sumas: 2.199.375 = 2.199.375`);
      continue;
    }
    assert.equal(it.pesos ? pesos(it.correcta) : it.correcta, correcta, it.id);
    assert.equal(it.acierto, citas(acierto)[0], it.id);
    if (it.id === "el-cierre") {
      /* «Debe / Haber», en ese orden; un solo error. */
      assert.ok(pregunta.endsWith("· Debe / Haber"));
      assert.deepEqual(L.opcionesDeH4(it), ["Debe", "Haber"]);
      assert.deepEqual(it.distractores.map((d) => d.retro), citas(distractores));
      continue;
    }
    const partes = distractores.split(/ · (?=\$|\d|Ninguno)/).map((p) => p.match(/^([^:]+): «([^»]+)»/));
    assert.deepEqual(it.distractores.map((d) => [it.pesos ? pesos(d.valor) : d.valor, d.retro]), partes.map((p) => [p[1], p[2]]), it.id);
  }
  assert.deepEqual(L.opcionesDeH4(item("que-le-toca")).slice().sort(), fs[1][1].match(/· (.+)$/)[1].split(" / ").slice().sort());
});

/* ═══════════ 3 · LA MECÁNICA, MONTADA ═══════════ */

const EN_ORDEN = L.prepararH4((xs) => [...xs]);
const Marco = ({ children }) => h("div", { "data-marco": true }, children);
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(PagoATiempo, { Marco, items: EN_ORDEN, onCompletar: (...a) => completados.push(a), ...props })); });
  return { caja, completados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const opcion = (caja, v) => caja.querySelector(`[data-opcion="${v}"] button`);
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent === texto);
const lado = (caja, lineaId, l) => [...caja.querySelectorAll(`[data-linea="${lineaId}"] button`)].find((b) => b.textContent === (l === DEBE ? "Debe" : "Haber"));
const otro = (l) => (l === DEBE ? HABER : DEBE);

async function jugar(m, falla) {
  const detalle = [];
  for (const [k, it] of EN_ORDEN.entries()) {
    assert.equal(m.caja.querySelector("[data-pregunta]").textContent, it.pregunta, `orden: el ítem ${k + 1}`);
    assert.equal(m.caja.querySelector("[data-item] [data-pie]").textContent, D.H4.pie);
    if (it.tipo === "eleccion") {
      const v = falla(it.id) ? it.distractores[0].valor : it.correcta;
      await tocar(opcion(m.caja, v));
      for (const o of it.opciones) assert.equal(opcion(m.caja, o.valor).disabled, true);
      const ok = v === it.correcta;
      assert.deepEqual([...m.caja.querySelectorAll("[data-retro] [data-texto-retro]")].map((p) => p.textContent), L.evaluarH4(it, v).textos);
      if (!ok) assert.equal(opcion(m.caja, it.correcta).dataset.estado, "revelada");
      detalle.push({ item: it.id, ok, intentos: 1, respuesta: ok ? null : v, orden: detalle.length + 1 });
    } else {
      for (const l of it.lineas) {
        await tocar(lado(m.caja, l.id, otro(l.lado)));
        await tocar(lado(m.caja, l.id, falla(L.idLineaH4(it, l)) ? otro(l.lado) : l.lado));
      }
      assert.equal(m.caja.querySelector("[data-asiento-completo]") === null, true, "las sumas antes de comprobar");
      await tocar(boton(m.caja, "Comprobar"));
      for (const l of it.lineas) {
        const ok = !falla(L.idLineaH4(it, l));
        assert.deepEqual([...m.caja.querySelectorAll(`[data-linea="${l.id}"] [data-texto-retro]`)].map((p) => p.textContent), ok ? [] : [l.retro]);
        detalle.push({ item: L.idLineaH4(it, l), ok, intentos: 1, respuesta: ok ? null : otro(l.lado), orden: detalle.length + 1 });
      }
      const suma = pesos(C.deuda);
      assert.ok(m.caja.querySelector("[data-asiento-completo]").textContent.includes(`${suma}${suma}`), "las sumas");
    }
    await tocar(boton(m.caja, k === 6 ? D.BOTON_H4.verResumen : D.BOTON_H4.siguiente));
  }
  return detalle;
}

test("★★★ la tanda entera: once unidades, un intento cada una, y el porcentaje es aciertos / 11", async () => {
  const m = await montar();
  try {
    assert.deepEqual([...m.caja.querySelectorAll("[data-enunciado] p")].map((p) => p.textContent), D.H4.enunciado);
    assert.ok(m.caja.textContent.includes(D.FICHA_H4.map(([r, x]) => `${r}${x}`).join("")), "la ficha no está a la vista");
    const fallos = new Set(["que-le-toca", "libro-de-totumo:descuento", "libro-de-bambu:descuento", "el-cierre"]);
    const detalle = await jugar(m, (id) => fallos.has(id));
    const [pct, , det] = m.completados[0];
    assert.deepEqual(det, detalle);
    assert.deepEqual(det.map((d) => d.item), L.unidadesH4());
    assert.equal(L.TOTAL_H4, 11);
    assert.equal(pct, (7 / 11) * 100);
  } finally {
    m.desmontar();
  }
});

test("★★ las opciones y las líneas se barajan; «Debe» y «Haber» del cierre, no", () => {
  const revolver = (xs) => [...xs].sort(() => Math.random() - 0.5);
  const a = new Set(); const b = new Set();
  for (let i = 0; i < 60; i++) {
    const p = L.prepararH4(revolver);
    a.add(p[1].opciones.map((o) => o.valor).join());
    b.add(p[4].orden.join());
    assert.deepEqual(p[6].opciones.map((o) => o.valor), ["Debe", "Haber"]);
  }
  assert.ok(a.size > 1 && b.size > 1);
});

/* ═══════════ 4 · CATÁLOGO, VISTA, MIGRACIÓN, PANEL DOCENTE ═══════════ */

test("★★★ en T7-3, justo después de H3: evaluativa, difícil, 50 FP", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T7_3, D.H4_ID), { tipo: HACER, modalidad: "evaluativa", dificultad: "dificil", fpBase: 50 });
  const ids = TEMA.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(D.H4_ID), ids.indexOf("t7-3-comercial-o-condicionado") + 1);
  for (const a of TEMA.actividades.filter((x) => x.clasificacion.tipo !== HACER)) assert.deepEqual(a.clasificacion, { tipo: APRENDER }, a.id);
});

test("★★★ la vista abre lo que el catálogo ofrece y registra con el motor compartido", () => {
  const ofrecidas = actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort();
  assert.deepEqual(JUEGOS_T7_3.map((j) => j.id).sort(), ofrecidas);
  assert.equal(JUEGOS_T7_3.find((j) => j.id === D.H4_ID).Mecanica, PagoATiempo);
  assert.match(VISTA, /registrarActividadCompletada\(clas, \{\s*materiaId: MATERIA, temaId: TEMA_T7_3, actividadId, porcentajeAciertos: porcentaje, duracionMs, detalle,/);
});

test("★★★ la 0106: del rango de la célula, aditiva y repetible, sin correr", () => {
  assert.match(MIGRACION, /\('t7-3-pago-a-tiempo',\s*'contabilidad',\s*'inventarios-descuentos-nic2',\s*'evaluativa',\s*'dificil',\s*50,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.H4_ID)), ["0106_t7_3_pago_a_tiempo.sql"]);
  assert.deepEqual(readdirSync(dir).filter((f) => f.startsWith("0106")), ["0106_t7_3_pago_a_tiempo.sql"]);
});

test("★★★ el panel docente: todo item_id tiene etiqueta, leída de los datos, y no se repiten", async () => {
  const m = await montar();
  try {
    await jugar(m, () => false);
    const ids = m.completados[0][2].map((d) => d.item);
    assert.equal(ids.length, 11);
    for (const id of ids) assert.equal(etiquetaDeItem(D.H4_ID, id), recortar(L.unidadDeH4(id)), id);
    assert.equal(new Set(ids.map((id) => L.unidadDeH4(id))).size, 11);
  } finally {
    m.desmontar();
  }
  const fuente = leer("src/docente/etiquetasItem.js");
  const bloque = fuente.slice(fuente.indexOf("CONTABILIDAD · T7 «INVENTARIOS»"));
  assert.match(bloque.slice(0, bloque.indexOf("});")), /"t7-3-pago-a-tiempo": \(id\) => unidadDeT73H4\(id\),/);
});
