import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · H4 «¿Periódico o permanente?» (Célula C) · Hacer.
 *
 *   · cada texto es, letra por letra, el de la v1 con las correcciones de
 *     Near: «Retención en la fuente por pagar» en las dos versiones del
 *     ítem 1, y las tarjetas apiladas
 *   · los asientos sin cifras de cada versión son los de la v1, línea por
 *     línea, con su lado; las dos versiones difieren solo en lo que dice
 *   · un solo intento por ítem; qué sistema va en «Versión 1» se baraja, y
 *     las preguntas alternan permanente y periódico
 *   · cinco unidades; el porcentaje es aciertos / 5
 *   · evaluativa, medio, 25 FP, en el cliente y en la migración 0101; la
 *     vista lo abre y registra con el motor; el panel docente lee cada unidad
 *   · regla 3: sin cifras
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

const D = await import("../../data/contabilidadT7_2_h4.js");
const L = await import("../t7_2H4.js");
const { DEBE, HABER } = await import("../../data/contabilidad.js");
const { SUBJECTS, HACER, APRENDER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: PeriodicoOPermanente } = await import("../../components/mecanicas/libros/t7/PeriodicoOPermanente.jsx");
const { JUEGOS_T7_2, TEMA_T7_2 } = await import("../../components/ContabilidadT7_2View.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V1 = leer("orquestador/conocimiento/paquetes/t7-2-h4-v1.md");
const MAPA = leer("orquestador/conocimiento/mapas/t7-inventarios.md");
const VISTA = leer("src/components/ContabilidadT7_2View.jsx");
const MIGRACION = leer("supabase/migrations/0101_t7_2_periodico_o_permanente.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_2);
const { PERIODICO, PERMANENTE } = D;

/* ═══════════ 1 · TEXTOS CONTRA NEAR ═══════════ */

const filas = () => V1.split("\n").filter((l) => /^\d\t/.test(l)).map((l) => l.split("\t"));
const citas = (celda) => [...celda.matchAll(/«([^»]+)»/g)].map((m) => m[1]);
/* «Compras (D) · IVA por pagar (D) · …» → [[cuenta, lado]], con la corrección de la regla 8. */
const lineasDe = (txt) => txt.split(" · ").map((x) => x.match(/^(.+) \((D|H)\)$/)).map((m) => [m[1], m[2] === "D" ? DEBE : HABER]);
const RETEFUENTE = ["Retefuente por pagar", "Retención en la fuente por pagar"];

test("★★★ los textos son los de la v1, letra por letra, con las correcciones de Near", () => {
  assert.ok(V1.includes(`id\t${D.H4_ID}`));
  assert.ok(V1.startsWith(`T7-2 · H4 «${D.H4.nombre}» · versión 1`));
  assert.ok(MAPA.includes(`| 8 | ${D.H4_ID} | ${D.H4.nombre} | Hacer |`));
  assert.ok(V1.includes(`Enunciado\n\n«${D.H4.enunciado[0]}»`));
  assert.ok(V1.includes(`Consigna\n\n«${D.H4.consigna}»`));
  assert.ok(V1.includes(`Pie de todos los ítems: «${D.H4.pie}».`));
  assert.ok(V1.includes(`Subtemas\t${D.SUBTEMAS_H4.join(" · ")}`));
  assert.deepEqual(D.ITEMS_H4.map((it) => it.subtema), D.SUBTEMAS_H4);
  /* Las correcciones: la tarjeta apilada y la retención con su nombre de la regla 8. */
  assert.ok(V1.includes("«Dos tarjetas apiladas, una sobre otra, “Versión 1” y “Versión 2” (patrón 06 B; el diseño es de Watari)»"));
  assert.ok(V1.includes(`H4 · ítem 1, las dos versiones del asiento\t«${RETEFUENTE[0]} (H)»\t«${RETEFUENTE[1]} (H)» (regla 8)`));
  assert.deepEqual(D.VERSIONES, ["Versión 1", "Versión 2"]);
  const fs = filas();
  assert.equal(fs.length, 5);
  for (const [k, it] of D.ITEMS_H4.entries()) {
    const [n, pregunta, periodico, permanente, acierto, error] = fs[k];
    assert.equal(n, String(k + 1));
    assert.equal(it.pregunta, citas(pregunta)[0], it.id);
    assert.equal(it.acierto, citas(acierto)[0], it.id);
    assert.equal(it.error, citas(error)[0], it.id);
    /* El sistema que se pregunta, de la pregunta misma. */
    assert.equal(it.sistema, it.pregunta.includes("permanente") ? PERMANENTE : PERIODICO, it.id);
    if (it.versiones[PERIODICO].texto) {
      assert.equal(it.versiones[PERIODICO].texto, citas(periodico)[0], it.id);
      assert.equal(it.versiones[PERMANENTE].texto, citas(permanente)[0], it.id);
    }
  }
  /* Ítem 1: las cuatro líneas de la v1, con la retención corregida; el permanente cambia Compras por Inventario de mercancías. */
  const corrige = (ls) => ls.map(([c, l]) => [c === RETEFUENTE[0] ? RETEFUENTE[1] : c, l]);
  const compra = corrige(lineasDe(fs[0][2].replace("Asiento sin cifras: ", "")));
  const ver = (it, s) => it.versiones[s].asientos.map((a) => a.map((l) => [l.cuenta, l.lado]));
  assert.deepEqual(ver(D.ITEMS_H4[0], PERIODICO), [compra]);
  assert.match(fs[0][3], /^Igual, pero con Inventario de mercancías \(D\) en lugar de Compras$/);
  assert.deepEqual(ver(D.ITEMS_H4[0], PERMANENTE), [compra.map(([c, l]) => [c === "Compras" ? "Inventario de mercancías" : c, l])]);
  assert.ok(!JSON.stringify(D.ITEMS_H4).includes("Retefuente"));
  /* Ítem 2: un asiento en el periódico; el mismo, más el del costo, en el permanente. */
  const venta = lineasDe(fs[1][2].replace("Un asiento: ", ""));
  assert.deepEqual(ver(D.ITEMS_H4[1], PERIODICO), [venta]);
  const [, mas] = fs[1][3].match(/^El mismo asiento, más (.+)$/);
  assert.deepEqual(ver(D.ITEMS_H4[1], PERMANENTE), [venta, mas.split(" / ").map((x) => lineasDe(x)[0])]);
});

test("★★★ regla 3: sin cifras, y las preguntas alternan permanente y periódico", () => {
  assert.doesNotMatch(JSON.stringify(D.ITEMS_H4) + D.H4.enunciado.join(" "), /\d/);
  assert.deepEqual(D.ITEMS_H4.map((it) => it.sistema), [PERMANENTE, PERIODICO, PERMANENTE, PERIODICO, PERMANENTE]);
});

/* ═══════════ 2 · LA MECÁNICA, MONTADA ═══════════ */

/* Un orden fijo para la prueba: el periódico arriba en los ítems pares, abajo en los impares. */
const EN_ORDEN = L.prepararH4((xs) => [...xs]).map((it, k) => ({ ...it, orden: k % 2 ? [PERMANENTE, PERIODICO] : [PERIODICO, PERMANENTE] }));
const Marco = ({ children }) => h("div", { "data-marco": true }, children);
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(PeriodicoOPermanente, { Marco, items: EN_ORDEN, onCompletar: (...a) => completados.push(a), ...props })); });
  return { caja, completados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const opcion = (caja, v) => caja.querySelector(`[data-opcion="${v}"] button`);
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent === texto);
const otro = (s) => (s === PERIODICO ? PERMANENTE : PERIODICO);

async function jugar(m, falla) {
  const detalle = [];
  for (const [k, it] of EN_ORDEN.entries()) {
    assert.equal(m.caja.querySelector("[data-pregunta]").textContent, it.pregunta, `orden: el ítem ${k + 1}`);
    assert.equal(m.caja.querySelector("[data-item] [data-pie]").textContent, D.H4.pie);
    /* Apiladas: «Versión 1» arriba, con el sistema que le tocó; «Versión 2» abajo. */
    const tarjetas = [...m.caja.querySelectorAll("[data-opcion]")];
    assert.deepEqual(tarjetas.map((x) => x.dataset.opcion), it.orden);
    assert.deepEqual(tarjetas.map((x) => x.querySelector("[data-version]").dataset.version), D.VERSIONES);
    for (const s of it.orden) {
      const v = it.versiones[s];
      const t = opcion(m.caja, s);
      if (v.texto) assert.ok(t.textContent.includes(v.texto));
      else assert.deepEqual([...t.querySelectorAll("[data-linea-sin-cifra]")].map((l) => [l.firstChild.textContent, l.dataset.lineaSinCifra, l.lastChild.textContent]),
        v.asientos.flat().map((l) => [l.cuenta, l.lado, l.lado === DEBE ? "Debe" : "Haber"]));
    }
    const s = falla(it.id) ? otro(it.sistema) : it.sistema;
    await tocar(opcion(m.caja, s));
    for (const x of it.orden) assert.equal(opcion(m.caja, x).disabled, true);
    const ok = s === it.sistema;
    assert.deepEqual([...m.caja.querySelectorAll("[data-retro] [data-texto-retro]")].map((p) => p.textContent), [ok ? it.acierto : it.error]);
    assert.equal(opcion(m.caja, s).dataset.estado, ok ? "correcta" : "incorrecta");
    if (!ok) {
      assert.equal(opcion(m.caja, it.sistema).dataset.estado, "revelada");
      assert.ok(m.caja.querySelector("[data-retro]").textContent.startsWith(`Incorrecto. Iba aquí: la ${D.VERSIONES[it.orden.indexOf(it.sistema)]}.`));
    }
    detalle.push({ item: it.id, ok, intentos: 1, respuesta: ok ? null : s, orden: detalle.length + 1 });
    await tocar(boton(m.caja, k === 4 ? D.BOTON_H4.verResumen : D.BOTON_H4.siguiente));
  }
  return detalle;
}

test("★★★ la tanda entera: cinco ítems, un intento cada uno, y el porcentaje es aciertos / 5", async () => {
  const m = await montar();
  try {
    const fallos = new Set(["la-venta", "el-conteo"]);
    const detalle = await jugar(m, (id) => fallos.has(id));
    assert.equal(m.completados.length, 1);
    const [pct, , det] = m.completados[0];
    assert.deepEqual(det, detalle);
    assert.deepEqual(det.map((d) => d.item), L.unidadesH4());
    assert.equal(L.TOTAL_H4, 5);
    assert.equal(pct, (3 / 5) * 100);
  } finally {
    m.desmontar();
  }
});

test("★★ qué sistema va en «Versión 1» se baraja en cada intento; los ítems, no", () => {
  const revolver = (xs) => [...xs].sort(() => Math.random() - 0.5);
  const arriba = new Set();
  for (let i = 0; i < 60; i++) {
    const p = L.prepararH4(revolver);
    assert.deepEqual(p.map((x) => x.id), D.ITEMS_H4.map((x) => x.id));
    for (const it of p) assert.deepEqual([...it.orden].sort(), [PERIODICO, PERMANENTE].sort());
    arriba.add(p[0].orden[0]);
  }
  assert.equal(arriba.size, 2);
});

/* ═══════════ 3 · CATÁLOGO, VISTA, MIGRACIÓN, PANEL DOCENTE ═══════════ */

test("★★★ retirada por la 0115: ya no está en el camino de T7-2 ni la ofrece la vista; su pieza, sus datos y la 0101 se quedan", () => {
  /* Retiro blando: sale de subjects.js y de la vista, pero no se borra nada. */
  assert.equal(TEMA.actividades.find((a) => a.id === D.H4_ID), undefined, "sigue en el camino");
  assert.ok(!JUEGOS_T7_2.some((j) => j.id === D.H4_ID), "la vista todavía la ofrece");
  assert.equal(typeof PeriodicoOPermanente, "function", "la pieza se borró");
  for (const a of TEMA.actividades.filter((x) => x.clasificacion.tipo !== HACER)) assert.deepEqual(a.clasificacion, { tipo: APRENDER }, a.id);
  const retiro = leer("supabase/migrations/0115_c7_retira_cuatro_hacer.sql");
  assert.match(retiro, new RegExp(`update public\\.actividad_catalogo\\s+set retirada = true\\s+where activity_id in \\([^)]*'${D.H4_ID}'`));
});

test("★★★ la vista abre lo que el catálogo ofrece y registra con el motor compartido", () => {
  const ofrecidas = actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort();
  assert.deepEqual(JUEGOS_T7_2.map((j) => j.id).sort(), ofrecidas);
  assert.ok(!JUEGOS_T7_2.some((j) => j.id === D.H4_ID), "retirada: la vista no la ofrece");
  assert.match(VISTA, /registrarActividadCompletada\(clas, \{\s*materiaId: MATERIA, temaId: TEMA_T7_2, actividadId, porcentajeAciertos: porcentaje, duracionMs, detalle,/);
});

test("★★★ la 0101: del rango de la célula, aditiva y repetible, sin correr", () => {
  assert.match(MIGRACION, /\('t7-2-periodico-o-permanente',\s*'contabilidad',\s*'inventarios-permanente',\s*'evaluativa',\s*'medio',\s*25,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  assert.match(sentencias, /select activity_id[\s\S]*where activity_id = 't7-2-periodico-o-permanente';/);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.H4_ID)), ["0101_t7_2_periodico_o_permanente.sql", "0115_c7_retira_cuatro_hacer.sql"]);
  assert.deepEqual(readdirSync(dir).filter((f) => f.startsWith("0101")), ["0101_t7_2_periodico_o_permanente.sql"]);
});

test("★★★ el panel docente: todo item_id que guarda la partida tiene etiqueta, leída de los datos, y no se repiten", async () => {
  const m = await montar();
  try {
    await jugar(m, () => false);
    const ids = m.completados[0][2].map((d) => d.item);
    assert.equal(ids.length, 5);
    for (const id of ids) {
      const e = etiquetaDeItem(D.H4_ID, id);
      assert.ok(typeof e === "string" && e.trim() !== "", `${id}: sin etiqueta`);
      assert.equal(e, recortar(L.unidadDeH4(id)), id);
    }
    assert.equal(new Set(ids.map((id) => L.unidadDeH4(id))).size, 5, "dos ítems con la misma etiqueta");
  } finally {
    m.desmontar();
  }
  const fuente = leer("src/docente/etiquetasItem.js");
  const bloque = fuente.slice(fuente.indexOf("CONTABILIDAD · T7 «INVENTARIOS»"));
  assert.match(bloque.slice(0, bloque.indexOf("});")), /"t7-2-periodico-o-permanente": \(id\) => unidadDeT72H4\(id\),/);
});
