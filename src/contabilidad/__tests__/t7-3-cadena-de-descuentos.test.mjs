import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · H2 «La cadena de descuentos» (Célula C) · Hacer.
 *
 *   · las cifras se recalculan en centavos desde la lista, la cadena 10-5-4
 *     y las tarifas; el factor es exacto (0,8208); todas están en el
 *     registro 5c de Near
 *   · cada texto es, letra por letra, el de la v1, con el cambio del
 *     distractor 0,1792 que pasó L (ya no dice qué es esa cifra)
 *   · un solo intento por ítem; cinco unidades; el porcentaje es aciertos / 5
 *   · evaluativa, medio, 25 FP, en el cliente y en la migración 0104; la
 *     vista lo abre y registra con el motor; el panel docente lee cada ítem
 *   · ninguna cifra del libro (H-2 es de A2) ni de X1-X4
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

const D = await import("../../data/contabilidadT7_3_h2.js");
const L = await import("../t7_3H2.js");
const A2 = await import("../../data/contabilidadT7_3_a2.js");
const H1 = await import("../../data/contabilidadT7_3_h1.js");
const { pesos } = await import("../../data/contabilidad.js");
const { SUBJECTS, HACER, APRENDER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: CadenaDeDescuentos } = await import("../../components/mecanicas/libros/t7/CadenaDeDescuentos.jsx");
const { JUEGOS_T7_3, TEMA_T7_3 } = await import("../../components/ContabilidadT7_3View.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V1 = leer("orquestador/conocimiento/paquetes/t7-3-h2-v1.md");
const MAPA = leer("orquestador/conocimiento/mapas/t7-inventarios.md");
const VISTA = leer("src/components/ContabilidadT7_3View.jsx");
const MIGRACION = leer("supabase/migrations/0104_t7_3_cadena_de_descuentos.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_3);
const miles = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const item = (id) => D.ITEMS_H2.find((x) => x.id === id);
const C = D.CIFRAS_H2;
const citas = (celda) => [...celda.matchAll(/«([^»]+)»/g)].map((m) => m[1]);

/* ═══════════ 1 · LAS CIFRAS ═══════════ */

test("★★★ las cifras se recalculan en centavos desde la lista, la cadena y las tarifas, y son las del registro de Near", () => {
  const de = (base, milesimas) => (base * 100 * milesimas) / 100_000 / 100;
  const d1 = de(2_750_000, 10_000); const s1 = 2_750_000 - d1;
  const d2 = de(s1, 5_000); const s2 = s1 - d2;
  const d3 = de(s2, 4_000); const f = s2 - d3;
  const iva = de(f, 16_000); const ret = de(f, 3_500);
  assert.deepEqual([d1, s1, d2, s2, d3, f, iva, ret, f + iva - ret], [275_000, 2_475_000, 123_750, 2_351_250, 94_050, 2_257_200, 361_152, 79_002, 2_539_350]);
  assert.deepEqual([C.descuentos, C.saldos.slice(1), C.factura, C.iva, C.retencion, C.cliente], [[d1, d2, d3], [s1, s2, f], f, iva, ret, f + iva - ret]);
  /* El factor es exacto, y la factura sale igual por el atajo. */
  assert.equal(90 * 95 * 96, 820_800);
  assert.equal(C.factor, 0.8208);
  assert.equal((2_750_000 * 8_208) / 10_000, f);
  assert.equal(C.rebaja, 492_800);
  assert.equal(C.pctRebaja, 17.92);
  /* El registro 5c de la v1: todas las cifras en pesos que usa la pieza están ahí, y nada más. */
  const registro = V1.split("\n").find((l) => l.startsWith("- Registro 5c, T73-H2: ")).replace("- Registro 5c, T73-H2: ", "").replace(/\.$/, "").split(" · ").map((x) => Number(x.replace(/\./g, "")));
  const usadas = new Set([C.lista, ...C.descuentos, ...C.saldos, C.factura, C.rebaja, C.iva, C.retencion, C.cliente,
    ...D.ITEMS_H2.filter((it) => it.formato === D.PESOS).flatMap((it) => it.distractores.map((d) => d.valor))]);
  assert.deepEqual([...usadas].sort((a, b) => a - b), [...registro].sort((a, b) => a - b));
  /* Los distractores que no son pesos: los de la v1. */
  assert.deepEqual(item("factor").distractores.map((d) => d.valor), [0.81, 0.1792]);
  assert.deepEqual(item("rebaja-real").distractores.map((d) => d.valor), [19, 82.08]);
});

test("★★★ ninguna cifra del libro (H-2 es de A2) ni de X1-X4", () => {
  const prohibidas = [...Object.values(A2.H2_LIBRO), 800_000, 175_000, 5_625_000, 5_800_000, 1_200_000, 262_500, 8_437_500, 643_500, 8_700_000, 2_432_000, 532_000, 384_000, 84_000, 2_700_000, 2_784_000, 17_632_000];
  const valores = new Set([...JSON.stringify(D.ITEMS_H2).matchAll(/\d[\d.]*/g)].map((m) => Number(m[0].replace(/\./g, ""))));
  for (const it of D.ITEMS_H2) for (const v of L.opcionesDeH2(it)) valores.add(v);
  for (const x of prohibidas) assert.ok(!valores.has(x), String(x));
});

/* ═══════════ 2 · TEXTOS CONTRA NEAR ═══════════ */

const filas = () => V1.split("\n").filter((l) => /^\| \d \|/.test(l)).map((l) => l.split(" | ").map((c) => c.replace(/^\| | \|$/g, "")));

test("★★★ los textos son los de la v1, letra por letra, con el cambio del 0,1792", () => {
  assert.ok(V1.includes(`id \`${D.H2_ID}\``));
  assert.ok(V1.startsWith(`**T7-3 · H2 «${D.H2.nombre}» · versión 1.**`));
  assert.ok(MAPA.includes(`| 4 | ${D.H2_ID} | ${D.H2.nombre} | Hacer |`));
  const enunciado = V1.slice(V1.indexOf("## Enunciado")).split("\n").filter((l) => l.startsWith("- "));
  assert.equal(D.H2.enunciado[0], citas(enunciado[0])[0]);
  assert.equal(enunciado[1], "- Línea de tarifas, igual que en H1 (85,4), y la frase fija.");
  assert.deepEqual(D.H2.enunciado.slice(1), H1.H1.enunciado.slice(1));
  assert.equal(D.H2.consigna, citas(enunciado[2])[0]);
  assert.ok(V1.includes(`**Pie de todos los ítems:** «${D.H2.pie}».`));
  const ficha = enunciado[3].replace("- **Ficha:** ", "").replace(/\.$/, "").split(" · ").map((t) => t.replace(/^(entrega|recibe) /, ""));
  assert.deepEqual(D.FICHA_H2.map(([, t]) => t.toLowerCase()), ficha.map((t) => t.toLowerCase()));
  assert.deepEqual(D.FICHA_H2.map(([r]) => r), H1.FICHA_H1.map(([r]) => r));
  /* El cambio de L: la fila de la tabla de cambios, con su texto viejo y el nuevo. */
  const cambio = V1.split("\n").find((l) => l.startsWith("| H2 T7-3 · ítem 3, distractor 0,1792 |")).split(" | ");
  const [viejo] = citas(cambio[1]);
  const [nuevo] = citas(cambio[2]);
  const fs = filas();
  assert.equal(fs.length, 5);
  for (const [k, it] of D.ITEMS_H2.entries()) {
    const [n, pregunta, correcta, distractores, acierto] = fs[k];
    assert.equal(n, String(k + 1));
    assert.equal(it.pregunta, citas(pregunta)[0], it.id);
    assert.equal(L.textoDeValor(it, it.correcta), correcta, it.id);
    assert.equal(it.acierto, citas(acierto)[0], it.id);
    const partes = distractores.split(/ · (?=\$|\d)/).map((p) => p.match(/^([^:]+): «([^»]+)»/));
    assert.deepEqual(it.distractores.map((d) => L.textoDeValor(it, d.valor)), partes.map((p) => p[1]), it.id);
    for (const [j, d] of it.distractores.entries()) assert.equal(d.retro, partes[j][2] === viejo ? nuevo : partes[j][2], `${it.id}: ${partes[j][1]}`);
  }
  assert.ok(!JSON.stringify(D.ITEMS_H2).includes(viejo));
  assert.equal(item("factor").distractores[1].retro, nuevo);
});

/* ═══════════ 3 · LA MECÁNICA, MONTADA ═══════════ */

const EN_ORDEN = L.prepararH2((xs) => [...xs]);
const Marco = ({ children }) => h("div", { "data-marco": true }, children);
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(CadenaDeDescuentos, { Marco, items: EN_ORDEN, onCompletar: (...a) => completados.push(a), ...props })); });
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
    assert.equal(m.caja.querySelector("[data-item] [data-pie]").textContent, D.H2.pie);
    assert.deepEqual(it.opciones.map((o) => opcion(m.caja, o.valor).textContent), it.opciones.map((o) => L.textoDeValor(it, o.valor)));
    const v = falla(it.id) ? it.distractores[1].valor : it.correcta;
    await tocar(opcion(m.caja, v));
    for (const o of it.opciones) assert.equal(opcion(m.caja, o.valor).disabled, true);
    const ok = v === it.correcta;
    assert.deepEqual([...m.caja.querySelectorAll("[data-retro] [data-texto-retro]")].map((p) => p.textContent), L.evaluarH2(it, v).textos);
    if (!ok) assert.equal(opcion(m.caja, it.correcta).dataset.estado, "revelada");
    detalle.push({ item: it.id, ok, intentos: 1, respuesta: ok ? null : v, orden: detalle.length + 1 });
    /* Un segundo toque no cambia nada. */
    await tocar(opcion(m.caja, it.correcta));
    assert.deepEqual([...m.caja.querySelectorAll("[data-retro] [data-texto-retro]")].map((p) => p.textContent), L.evaluarH2(it, v).textos);
    await tocar(boton(m.caja, k === 4 ? D.BOTON_H2.verResumen : D.BOTON_H2.siguiente));
  }
  return detalle;
}

test("★★★ la tanda entera: cinco ítems, un intento cada uno, y el porcentaje es aciertos / 5", async () => {
  const m = await montar();
  try {
    assert.deepEqual([...m.caja.querySelectorAll("[data-enunciado] p")].map((p) => p.textContent), D.H2.enunciado);
    assert.ok(m.caja.textContent.includes(D.FICHA_H2.map(([r, t]) => `${r}${t}`).join("")), "la ficha no está a la vista");
    const fallos = new Set(["factor", "rebaja-real"]);
    const detalle = await jugar(m, (id) => fallos.has(id));
    assert.equal(m.completados.length, 1);
    const [pct, , det] = m.completados[0];
    assert.deepEqual(det, detalle);
    assert.deepEqual(det.map((d) => d.item), L.unidadesH2());
    assert.equal(L.TOTAL_H2, 5);
    assert.equal(pct, (3 / 5) * 100);
  } finally {
    m.desmontar();
  }
});

test("★★ las opciones se barajan en cada intento; los ítems, no", () => {
  const revolver = (xs) => [...xs].sort(() => Math.random() - 0.5);
  const a = new Set();
  for (let i = 0; i < 60; i++) {
    const p = L.prepararH2(revolver);
    assert.deepEqual(p.map((x) => x.id), D.ITEMS_H2.map((x) => x.id));
    a.add(p[2].opciones.map((o) => o.valor).join());
  }
  assert.ok(a.size > 1);
});

/* ═══════════ 4 · CATÁLOGO, VISTA, MIGRACIÓN, PANEL DOCENTE ═══════════ */

test("★★★ en T7-3, justo después de A2: evaluativa, medio, 25 FP", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T7_3, D.H2_ID), { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 });
  assert.equal(TEMA.actividades.find((a) => a.id === D.H2_ID).nombre, D.H2.nombre);
  for (const a of TEMA.actividades.filter((x) => x.clasificacion.tipo !== HACER)) assert.deepEqual(a.clasificacion, { tipo: APRENDER }, a.id);
  const ids = TEMA.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(D.H2_ID), ids.indexOf("t7-3-descuentos-en-cadena") + 1);
});

test("★★★ la vista abre lo que el catálogo ofrece y registra con el motor compartido", () => {
  const ofrecidas = actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort();
  assert.deepEqual(JUEGOS_T7_3.map((j) => j.id).sort(), ofrecidas);
  assert.equal(JUEGOS_T7_3.find((j) => j.id === D.H2_ID).Mecanica, CadenaDeDescuentos);
  assert.match(VISTA, /registrarActividadCompletada\(clas, \{\s*materiaId: MATERIA, temaId: TEMA_T7_3, actividadId, porcentajeAciertos: porcentaje, duracionMs, detalle,/);
});

test("★★★ la 0104: del rango de la célula, aditiva y repetible, sin correr", () => {
  assert.match(MIGRACION, /\('t7-3-cadena-de-descuentos',\s*'contabilidad',\s*'inventarios-descuentos-nic2',\s*'evaluativa',\s*'medio',\s*25,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  assert.match(sentencias, /select activity_id[\s\S]*where activity_id = 't7-3-cadena-de-descuentos';/);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.H2_ID)), ["0104_t7_3_cadena_de_descuentos.sql"]);
  assert.deepEqual(readdirSync(dir).filter((f) => f.startsWith("0104")), ["0104_t7_3_cadena_de_descuentos.sql"]);
});

test("★★★ el panel docente: todo item_id que guarda la partida tiene etiqueta, leída de los datos", async () => {
  const m = await montar();
  try {
    await jugar(m, () => false);
    const ids = m.completados[0][2].map((d) => d.item);
    assert.equal(ids.length, 5);
    for (const id of ids) {
      const e = etiquetaDeItem(D.H2_ID, id);
      assert.ok(typeof e === "string" && e.trim() !== "", `${id}: sin etiqueta`);
      assert.equal(e, recortar(L.unidadDeH2(id)), id);
    }
    assert.equal(L.unidadDeH2("factor"), "¿Cuál es el factor de esta cadena?");
  } finally {
    m.desmontar();
  }
  const fuente = leer("src/docente/etiquetasItem.js");
  const bloque = fuente.slice(fuente.indexOf("CONTABILIDAD · T7 «INVENTARIOS»"));
  assert.match(bloque.slice(0, bloque.indexOf("});")), /"t7-3-cadena-de-descuentos": \(id\) => unidadDeT73H2\(id\),/);
});

/* ═══════════ PATRÓN T7-3 (Watari) ═══════════ */

test("★★★ Patrón T7-3: la cuenta crece con los ítems 1 a 4, cada parte después de su ítem", async () => {
  /* La cadena, recalculada a mano: cada descuento sobre el saldo anterior. */
  assert.deepEqual(C.saldos, [2_750_000, 2_475_000, 2_351_250, 2_257_200]);
  assert.deepEqual(C.descuentos, [275_000, 123_750, 94_050]);
  assert.equal(C.lista - C.factura, 492_800);
  const tarjetas = (caja) => [...caja.querySelectorAll("figure[data-renglones]")].map((f) => [f.querySelector("figcaption").textContent, [...f.querySelectorAll("[data-renglon] .rg-v")].map((x) => x.textContent)]);
  const m = await montar();
  try {
    const esperado = [
      [],
      [["Cadena de descuentos de Palma", ["2.750.000", "275.000", "2.475.000"]]],
      [["Cadena de descuentos de Palma", ["2.750.000", "275.000", "2.475.000", "123.750", "2.351.250", "94.050", "2.257.200"]]],
      [["Cadena de descuentos de Palma", ["2.750.000", "275.000", "2.475.000", "123.750", "2.351.250", "94.050", "2.257.200"]], ["El atajo del factor", ["0,90 × 0,95 × 0,96", "0,8208", "2.750.000", "2.257.200"]]],
      [["Cadena de descuentos de Palma", ["2.750.000", "275.000", "2.475.000", "123.750", "2.351.250", "94.050", "2.257.200"]], ["El atajo del factor", ["0,90 × 0,95 × 0,96", "0,8208", "2.750.000", "2.257.200"]], ["La rebaja de verdad", ["2.750.000", "2.257.200", "492.800", "17,92 %"]]],
    ];
    for (const [k, it] of EN_ORDEN.entries()) {
      /* Antes de responder, solo lo de los ítems ya respondidos. */
      assert.deepEqual(tarjetas(m.caja), esperado[Math.min(k, 4)], `antes del ítem ${k + 1}`);
      /* Con error también aparece (un intento, v3.2). */
      const v = k % 2 ? it.opciones.find((o) => o.valor !== it.correcta).valor : it.correcta;
      await tocar(opcion(m.caja, v));
      assert.deepEqual(tarjetas(m.caja), esperado[Math.min(k + 1, 4)], `al responder el ítem ${k + 1}`);
      await tocar(boton(m.caja, k === EN_ORDEN.length - 1 ? D.BOTON_H2.verResumen : D.BOTON_H2.siguiente));
    }
  } finally {
    m.desmontar();
  }
  const rebaja = D.FIGURAS_H2[2];
  assert.equal(rebaja.nota, "La suma de los porcentajes da 19 %. Cada descuento va sobre un saldo más pequeño, así que la rebaja real es menor.");
  assert.ok(rebaja.filas.at(-1).fuerte && !rebaja.filas.at(-1).res, "17,92 % en negrita, sin raya");
});
