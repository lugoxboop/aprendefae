import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · H6 «La devolución en dos libros» (Célula C) · Hacer.
 *
 *   · las cifras se RECALCULAN aquí, en centavos, desde la compra, la
 *     devolución y las tarifas, y dan las de Near; los asientos cuadran
 *   · cada texto es el de Near; la corrección 5 manda (aciertos 4 y 6 sin el
 *     lado; un texto literal por cada línea mal ubicada)
 *   · trece unidades, un solo intento cada una: las preguntas, un toque; las
 *     líneas, una vez al comprobar; las sumas, solo después de comprobar
 *   · evaluativa, difícil, 50 FP, en el cliente y en la 0096; después de A6;
 *     la vista lo abre y registra; el panel docente lee cada item_id
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

const D = await import("../../data/contabilidadT7_1_h6.js");
const L = await import("../t7H6.js");
const { DEBE, HABER, pesos } = await import("../../data/contabilidad.js");
const { SUBJECTS, HACER, APRENDER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: DevolucionDosLibros } = await import("../../components/mecanicas/libros/t7/DevolucionDosLibros.jsx");
const { JUEGOS_T7_1, TEMA_T7_1 } = await import("../../components/ContabilidadT7_1View.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V1 = leer("orquestador/conocimiento/paquetes/t7-1-h6-v1.md");
const CAMBIOS = leer("orquestador/conocimiento/paquetes/t7-1-h6-cambios.md");
const VISTA = leer("src/components/ContabilidadT7_1View.jsx");
const MIGRACION = leer("supabase/migrations/0096_t7_1_devolucion_dos_libros.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_1);
const miles = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const EN_ORDEN = L.prepararH6((xs) => [...xs]);
const Marco = ({ children }) => h("div", { "data-marco": true }, children);
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(DevolucionDosLibros, { Marco, items: EN_ORDEN, onCompletar: (...a) => completados.push(a), ...props })); });
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

/* ═══════════ 1 · LAS CIFRAS, RECALCULADAS ═══════════ */

test("★★★ las cifras se recalculan en centavos desde la compra, la devolución y las tarifas, y los asientos cuadran", () => {
  const de = (base, milesimas) => (base * 100 * milesimas) / 100_000 / 100;
  const R = { iva: de(6_800_000, 16_000), ret: de(6_800_000, 3_500), ivaDev: de(850_000, 16_000), retDev: de(850_000, 3_500) };
  R.total = 6_800_000 + R.iva - R.ret;
  R.baja = 850_000 + R.ivaDev - R.retDev;
  assert.deepEqual([R.iva, R.ret, R.total, R.ivaDev, R.retDev, R.baja], [1_088_000, 238_000, 7_650_000, 136_000, 29_750, 956_250]);
  const C = D.CIFRAS_H6;
  assert.deepEqual([C.iva, C.retencion, C.total, C.ivaDev, C.retDev, C.baja], [R.iva, R.ret, R.total, R.ivaDev, R.retDev, R.baja]);
  assert.ok(V1.includes("6.800.000 · 1.088.000 · 238.000 · 7.650.000 · 850.000 · 136.000 · 29.750 · 956.250"));
  /* Distractores: todo, nada, y los dos errores de la resta. */
  const it = Object.fromEntries(D.ITEMS_H6.map((x) => [x.id, x]));
  assert.deepEqual(it["iva-reversa"].distractores.map((d) => d.valor), [R.iva, 0]);
  assert.deepEqual(it["retencion-reversa"].distractores.map((d) => d.valor), [R.ret, 0]);
  assert.deepEqual(it["baja-deuda"].distractores.map((d) => d.valor), [850_000 + R.ivaDev + R.retDev, 850_000 + R.ivaDev]);
  /* Los cuatro asientos cuadran; las dos devoluciones suman 986.000. */
  const suma = (ls, l) => ls.filter((x) => x.lado === l).reduce((s, x) => s + x.valor, 0);
  for (const ls of [D.COMPRA_RESUELTA_H6.comprador, D.COMPRA_RESUELTA_H6.vendedor, it["libro-garza"].lineas, it["libro-nogal"].lineas]) assert.equal(suma(ls, DEBE), suma(ls, HABER));
  assert.equal(suma(it["libro-garza"].lineas, DEBE), 986_000);
  assert.equal(suma(it["libro-nogal"].lineas, DEBE), 986_000);
});

/* ═══════════ 2 · TEXTOS CONTRA NEAR ═══════════ */

const filas = () => V1.slice(V1.indexOf("## Ítems")).split("\n").filter((l) => /^\| \d \|/.test(l)).map((l) => l.slice(1, -1).split(" | ").map((c) => c.trim()));
const citas = (celda) => [...celda.matchAll(/«([^»]+)»/g)].map((m) => m[1]);
const nombreDe = (v) => (typeof v === "number" ? pesos(v) : D.CUENTAS_H6.find((c) => c.valor === v).texto);

test("★★★ los textos son los de Near, con la corrección 5 aplicada", () => {
  assert.equal(D.H6_ID, "t7-1-devolucion-dos-libros");
  assert.ok(V1.includes(`| Etiqueta | «${D.H6.etiqueta}» |`));
  assert.ok(V1.includes(`- «${D.H6.consigna}»`));
  for (const p of D.H6.enunciado.slice(0, 2)) assert.ok(V1.includes(`- «${p}»`), p);
  assert.ok(V1.includes(`- Tarifas: «${D.H6.enunciado[2]}»`));
  assert.ok(leer("src/data/contabilidadT7_1_ap2.js").includes(`"${D.H6.enunciado[3]}"`));
  for (const [dato, texto] of D.FICHA_H6) assert.ok(V1.includes(`| ${dato} | ${texto} |`), dato);
  assert.ok(V1.includes(`**Pie de toda la actividad:** «${D.H6.pie}»`));
  /* El asiento de la compra resuelto, línea por línea. */
  const lineaV1 = (ls) => ls.map((l) => `${l.cuenta} ${miles(l.valor)}`).join(" · ");
  assert.ok(V1.includes(`**Comprador:** ${lineaV1(D.COMPRA_RESUELTA_H6.comprador)}.`));
  assert.ok(V1.includes(`**Vendedor:** ${lineaV1(D.COMPRA_RESUELTA_H6.vendedor)}.`));
  const fs = filas();
  for (const [k, it] of D.ITEMS_H6.entries()) {
    const [n, pregunta, correcta, distractores, acierto] = fs[k];
    assert.equal(n, String(k + 1));
    if (it.tipo === "eleccion") {
      assert.equal(it.pregunta, citas(pregunta)[0], it.id);
      assert.equal(nombreDe(it.correcta), correcta, it.id);
      if (["cuenta-comprador", "cuenta-vendedor"].includes(it.id)) {
        assert.ok(CAMBIOS.includes(`«${it.acierto}»`), `${it.id}: el acierto sin el lado`);
        assert.doesNotMatch(it.acierto, /al (debe|haber)/);
      } else assert.equal(it.acierto, citas(acierto)[0], it.id);
      const deV1 = citas(distractores);
      for (const [j, d] of it.distractores.entries()) {
        assert.equal(d.retro, deV1[j], `${it.id}: ${d.valor}`);
        assert.ok(distractores.includes(`${nombreDe(d.valor)}: «`), `${it.id}: el distractor ${nombreDe(d.valor)}`);
      }
    } else {
      /* Las líneas, sus lados y sus textos: los de la tabla de la corrección. */
      const lineasV1 = [...pregunta.matchAll(/(?:: |· )([^:·]+?) ([\d.]+) → (Debe|Haber)/g)].map((m) => [m[1], Number(m[2].replace(/\./g, "")), m[3] === "Debe" ? DEBE : HABER]);
      assert.deepEqual(it.lineas.map((l) => [l.cuenta, l.valor, l.lado]), lineasV1, it.id);
      for (const l of it.lineas) {
        const fila = `| ${l.cuenta} ${miles(l.valor)} | ${l.lado === DEBE ? "Haber" : "Debe"} | «${l.retro}»`;
        assert.ok(CAMBIOS.includes(fila), `${it.id}/${l.id}: el texto de la corrección`);
      }
      assert.ok(acierto.includes(`sumas de ${miles(it.lineas.filter((l) => l.lado === DEBE).reduce((s, l) => s + l.valor, 0))}`));
    }
  }
  assert.ok(V1.includes(`Libro de La Garza: «${D.ITEMS_H6[4].pregunta}»`));
});

/* ═══════════ 3 · LA MECÁNICA, MONTADA ═══════════ */

async function jugar(m, falla) {
  const detalle = [];
  for (const [k, it] of EN_ORDEN.entries()) {
    assert.equal(m.caja.querySelector("[data-pregunta]").textContent, it.pregunta, `orden: el ítem ${k + 1}`);
    if (it.tipo === "eleccion") {
      const v = falla(it.id) ? it.distractores[0].valor : it.correcta;
      await tocar(opcion(m.caja, v));
      for (const o of it.opciones) assert.equal(opcion(m.caja, o.valor).disabled, true);
      const ok = v === it.correcta;
      assert.deepEqual([...m.caja.querySelectorAll("[data-retro] [data-texto-retro]")].map((p) => p.textContent), L.evaluarH6(it, v).textos);
      detalle.push({ item: it.id, ok, intentos: 1, respuesta: ok ? null : v, orden: detalle.length + 1 });
    } else {
      const comprobar = boton(m.caja, "Comprobar");
      for (const l of it.lineas) {
        assert.equal(comprobar.disabled, true, `${it.id}: «Comprobar» antes de tener todas las líneas`);
        /* Se puede cambiar de lado antes de comprobar: se pone mal y luego como toca. */
        await tocar(lado(m.caja, l.id, otro(l.lado)));
        await tocar(lado(m.caja, l.id, falla(L.idLineaH6(it, l)) ? otro(l.lado) : l.lado));
      }
      assert.equal(m.caja.querySelector("[data-asiento-completo]") === null, true, `${it.id}: las sumas antes de comprobar`);
      await tocar(boton(m.caja, "Comprobar"));
      for (const l of it.lineas) {
        const ok = !falla(L.idLineaH6(it, l));
        for (const b of m.caja.querySelectorAll(`[data-linea="${l.id}"] button`)) assert.equal(b.disabled, true);
        assert.deepEqual([...m.caja.querySelectorAll(`[data-linea="${l.id}"] [data-texto-retro]`)].map((p) => p.textContent), ok ? [] : [l.retro]);
        detalle.push({ item: L.idLineaH6(it, l), ok, intentos: 1, respuesta: ok ? null : otro(l.lado), orden: detalle.length + 1 });
      }
      assert.ok(m.caja.querySelector("[data-asiento-completo]").textContent.includes(`${pesos(986_000)}${pesos(986_000)}`));
      assert.equal(boton(m.caja, "Comprobar") === undefined, true, "«Comprobar» sigue ahí");
    }
    await tocar(boton(m.caja, k === 6 ? D.BOTON_H6.verResumen : D.BOTON_H6.siguiente));
  }
  return detalle;
}

test("★★★ la tanda entera: trece unidades, un intento cada una, y el porcentaje es aciertos / 13", async () => {
  const m = await montar();
  try {
    const fallos = new Set(["iva-reversa", "cuenta-vendedor", "libro-garza:retencion", "libro-nogal:anticipo", "libro-nogal:cxc"]);
    const detalle = await jugar(m, (id) => fallos.has(id));
    const [pct, , det] = m.completados[0];
    assert.deepEqual(det, detalle);
    assert.deepEqual(det.map((d) => d.item), L.unidadesH6());
    assert.equal(pct, (8 / 13) * 100);
  } finally {
    m.desmontar();
  }
});

test("★★ las opciones y las líneas se barajan en cada intento; los ítems, no", () => {
  const revolver = (xs) => [...xs].sort(() => Math.random() - 0.5);
  const a = new Set(); const b = new Set();
  for (let i = 0; i < 60; i++) {
    const p = L.prepararH6(revolver);
    assert.deepEqual(p.map((x) => x.id), D.ITEMS_H6.map((x) => x.id));
    a.add(p[0].opciones.map((o) => o.valor).join());
    b.add(p[4].orden.join());
  }
  assert.ok(a.size > 1 && b.size > 1);
});

/* ═══════════ 4 · CATÁLOGO, VISTA, MIGRACIÓN, PANEL DOCENTE ═══════════ */

test("★★★ en T7-1, después de A6: evaluativa, difícil, 50 FP", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T7_1, D.H6_ID), { tipo: HACER, modalidad: "evaluativa", dificultad: "dificil", fpBase: 50 });
  for (const a of TEMA.actividades.filter((x) => x.clasificacion.tipo !== HACER)) assert.deepEqual(a.clasificacion, { tipo: APRENDER }, a.id);
  const ids = TEMA.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(D.H6_ID), ids.indexOf("t7-1-a6-devoluciones-en-periodico") + 1);
});

test("★★★ la vista abre lo que el catálogo ofrece y registra con el motor compartido", () => {
  const ofrecidas = actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort();
  assert.deepEqual(JUEGOS_T7_1.map((j) => j.id).sort(), ofrecidas);
  assert.equal(JUEGOS_T7_1.find((j) => j.id === D.H6_ID).Mecanica, DevolucionDosLibros);
  assert.match(VISTA, /registrarActividadCompletada\(clas, \{\s*materiaId: MATERIA, temaId: TEMA_T7_1, actividadId, porcentajeAciertos: porcentaje, duracionMs, detalle,/);
});

test("★★★ la 0096: del rango de la célula, aditiva y repetible, sin correr", () => {
  assert.match(MIGRACION, /\('t7-1-devolucion-dos-libros',\s*'contabilidad',\s*'inventarios-periodico',\s*'evaluativa',\s*'dificil',\s*50,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.H6_ID)), ["0096_t7_1_devolucion_dos_libros.sql"]);
});

test("★★★ el panel docente: todo item_id que guarda la partida tiene etiqueta, leída de los datos", async () => {
  const m = await montar();
  try {
    await jugar(m, () => false);
    const ids = m.completados[0][2].map((d) => d.item);
    assert.equal(ids.length, 13);
    for (const id of ids) {
      const e = etiquetaDeItem(D.H6_ID, id);
      assert.ok(typeof e === "string" && e.trim() !== "", `${id}: sin etiqueta`);
      assert.equal(e, recortar(L.unidadDeH6(id)), id);
    }
  } finally {
    m.desmontar();
  }
  const fuente = leer("src/docente/etiquetasItem.js");
  const bloque = fuente.slice(fuente.indexOf("CONTABILIDAD · T7 «INVENTARIOS»"));
  assert.match(bloque.slice(0, bloque.indexOf("});")), /"t7-1-devolucion-dos-libros": \(id\) => unidadDeH6\(id\),/);
});
