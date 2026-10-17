import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import { conCorreccionesDeMello } from "./correccionesMello.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · H6 «La devolución en dos libros» (Célula C) · Hacer.
 *
 *   · las cifras se RECALCULAN aquí, en centavos, desde la compra, la
 *     devolución y las tarifas, y dan las de Near; los asientos cuadran
 *   · cada texto es el de Near; la corrección 5 manda (un texto literal por
 *     cada línea mal ubicada)
 *   · once unidades, un solo intento cada una: las preguntas, un toque; la
 *     casilla, una vez; las líneas, una vez al comprobar; las sumas, solo
 *     después de comprobar
 *   · LOTE 3 («Arma la línea», paquete lote3-distractores-v1.md de Near):
 *     cada línea elige su cuenta de un banco (la correcta y los dos
 *     distractores de Near) y su lado; el ítem 3 va con casilla de cifra; los
 *     ítems 4 y 6 de la v1 se quitaron (decisión de L): de 13 a 11 aciertos
 *   · evaluativa, difícil, 50 FP, en el cliente y en la 0096; después de A6;
 *     la vista lo abre y registra; el panel docente lee cada item_id
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
let REDUCIDO = false;
w.matchMedia = (q) => ({ matches: REDUCIDO && /prefers-reduced-motion: reduce/.test(q), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
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
/* C4: el veredicto llega ESPERA_C4 después del toque; los temporizadores son los falsos de node:test. */
mock.timers.enable({ apis: ["setTimeout"] });

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
const { firma, textoFigura } = await import("./figuraAcumuladaPrueba.mjs");
const C4M = await import("../c4/t71h6_c4.js");
const C4 = C4M.CONSECUENCIA_C4;
const { ESPERA_C4 } = await import("../../components/mecanicas/libros/t7/decisionC4.jsx");
const { PIEZA_C4 } = await import("../../components/mecanicas/libros/t7/DevolucionDosLibros.jsx");
const MC4 = await import("./correccionesMelloC4T71.mjs");

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
const lado = (caja, lineaId, l) => [...caja.querySelectorAll(`[data-linea-cuenta="${lineaId}"] button`)].find((b) => b.textContent === (l === DEBE ? "Debe" : "Haber"));
const ficha = (caja, lineaId, cuenta) => [...caja.querySelectorAll(`[data-linea-cuenta="${lineaId}"] [data-ficha-cuenta]`)].find((b) => b.dataset.fichaCuenta === cuenta);
const otro = (l) => (l === DEBE ? HABER : DEBE);
const item = (id) => D.ITEMS_H6.find((x) => x.id === id);
/* Escribe en la casilla de cifra como lo haría el teclado: el valor con su punto de miles. */
const escribir = async (caja, id, valor) => {
  const i = caja.querySelector(`[data-campo-cifra="${id}"]`);
  assert.ok(i, `no está la casilla de ${id}`);
  await act(async () => {
    Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set.call(i, String(valor));
    i.dispatchEvent(new w.Event("input", { bubbles: true }));
  });
  assert.equal(i.value, miles(valor));
};

/* C4: el reloj del veredicto, la línea que pinta la figura y el mensaje (vacío antes del veredicto). */
const tick = async (ms) => { await act(async () => { mock.timers.tick(ms); }); };
const lineaC4 = (caja) => caja.querySelector("[data-c4-figura] [data-c4-linea]")?.textContent ?? null;
const retros = (caja) => [...caja.querySelectorAll("[data-retro] [data-texto-retro]")].map((p) => p.textContent);
const c4De = (id, x) => { const e = C4.consecuencia(C4.items.find((i) => i.id === id), x); return e.falla ?? e.cuadra ?? null; };
/* C4-1 (Mello): con la cifra escrita y sin comprobar, la figura la muestra en su renglón y nada más. */
function sinResultado(caja, it, v) {
  const fig = caja.querySelector("[data-c4-figura]");
  assert.ok([...fig.querySelectorAll(`[data-c4-ren="${it.id}"] [data-c4-valor]`)].some((b) => b.textContent === pesos(v)), `${it.id} · ${v}: la cifra, en su renglón`);
  for (const x of MC4.C4_1_PROHIBIDO) assert.ok(!fig.outerHTML.includes(x), `${it.id} · ${v}: «${x}» antes de comprobar`);
  assert.ok(fig.querySelector(".activa") === null, "un renglón marcado antes de comprobar");
}
/* Un toque o un «Comprobar»: primero la consecuencia en la nota, sin veredicto; a los ESPERA_C4, el veredicto. */
async function conVeredicto(m, it, x) {
  assert.equal(lineaC4(m.caja), c4De(it.id, x), `${it.id}: la consecuencia de ${x}, en el acto`);
  assert.ok(m.caja.querySelector(`[data-c4-ren="${it.id}"].activa`), `${it.id}: la cifra no entró a su renglón`);
  assert.deepEqual(retros(m.caja), [], `${it.id}: sin veredicto todavía`);
  await tick(ESPERA_C4 - 1);
  assert.deepEqual(retros(m.caja), [], `${it.id}: ni 1 ms antes`);
  await tick(1);
  assert.equal(lineaC4(m.caja), c4De(it.id, x), `${it.id}: la consecuencia se queda a la vista`);
}

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
const nombreDe = (v) => pesos(v);

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
  assert.equal(fs.length, 7);
  /* Los ítems 4 y 6 de la v1 («¿a qué cuenta va la devolución?», en cada libro) se quitaron en el lote 3: la mesa ya pide esa cuenta. */
  for (const n of ["4", "6"]) {
    const q = citas(fs.find((f) => f[0] === n)[1])[0];
    assert.match(q, /^En el libro de (La Garza|El Nogal), ¿a qué cuenta va la devolución de \$850\.000\?$/, n);
    assert.ok(!D.ITEMS_H6.some((it) => it.pregunta === q), `el ítem ${n} sigue`);
  }
  const vigentes = fs.filter((f) => !["4", "6"].includes(f[0]));
  assert.equal(vigentes.length, D.ITEMS_H6.length);
  for (const [k, it] of D.ITEMS_H6.entries()) {
    const [n, pregunta, correcta, distractores, acierto] = vigentes[k];
    assert.equal(n, String([1, 2, 3, 5, 7][k]));
    if (it.tipo !== "asiento") {
      assert.equal(it.pregunta, citas(pregunta)[0], it.id);
      assert.equal(nombreDe(it.correcta), correcta, it.id);
      assert.equal(it.acierto, citas(acierto)[0], it.id);
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
  assert.ok(V1.includes(`Libro de La Garza: «${item("libro-garza").pregunta}»`));
});

/* ═══════════ 3 · LA MECÁNICA, MONTADA ═══════════ */

async function jugar(m, falla) {
  const detalle = [];
  for (const [k, it] of EN_ORDEN.entries()) {
    assert.equal(m.caja.querySelector("[data-pregunta]").textContent, it.pregunta, `orden: el ítem ${k + 1}`);
    if (it.tipo === "eleccion") {
      const v = falla(it.id) ? it.distractores[0].valor : it.correcta;
      assert.equal(lineaC4(m.caja), null, "sin tocar, la nota no dice nada");
      await tocar(opcion(m.caja, v));
      for (const o of it.opciones) assert.equal(opcion(m.caja, o.valor).disabled, true);
      await conVeredicto(m, it, v);
      const ok = v === it.correcta;
      assert.deepEqual([...m.caja.querySelectorAll("[data-retro] [data-texto-retro]")].map((p) => p.textContent), L.evaluarH6(it, v).textos);
      detalle.push({ item: it.id, ok, intentos: 1, respuesta: ok ? null : v, orden: detalle.length + 1 });
    } else if (it.tipo === "cifra") {
      /* LOTE 3: casilla de cifra; si falla, escribe el primer distractor de Near y sale su retroalimentación. */
      const v = falla(it.id) ? it.distractores[0].valor : it.correcta;
      assert.equal(boton(m.caja, "Comprobar").disabled, true, "«Comprobar» sin cifra");
      await escribir(m.caja, it.id, v);
      sinResultado(m.caja, it, v);
      await tocar(boton(m.caja, "Comprobar"));
      const ok = v === it.correcta;
      assert.equal(m.caja.querySelector(`[data-campo-cifra="${it.id}"]`).readOnly, true, "un solo intento");
      assert.equal(boton(m.caja, "Comprobar"), undefined);
      await conVeredicto(m, it, v);
      const textos = [...m.caja.querySelectorAll("[data-retro] [data-texto-retro]")].map((p) => p.textContent);
      assert.deepEqual(textos, L.evaluarH6(it, v).textos);
      assert.deepEqual(textos, ok ? [it.acierto] : [it.distractores[0].retro, `Iba aquí: ${pesos(it.correcta)}.`]);
      detalle.push({ item: it.id, ok, intentos: 1, respuesta: ok ? null : v, orden: detalle.length + 1 });
    } else {
      /* LOTE 3 · «Arma la línea»: cada línea elige su cuenta del banco (la correcta y dos distractores) y su lado. */
      for (const l of it.lineas) {
        assert.equal(boton(m.caja, "Comprobar").disabled, true, `${it.id}: «Comprobar» antes de tener todas las líneas`);
        assert.deepEqual([...m.caja.querySelectorAll(`[data-linea-cuenta="${l.id}"] [data-ficha-cuenta]`)].map((b) => b.dataset.fichaCuenta), [l.cuenta, ...l.distractores.map((d) => d.cuenta)]);
        assert.equal(m.caja.querySelector(`[data-linea-cuenta="${l.id}"] [data-valor]`).textContent, pesos(l.valor), "el monto viene dado");
        await tocar(ficha(m.caja, l.id, falla(L.idLineaH6(it, l)) ? l.distractores[0].cuenta : l.cuenta));
        /* Se puede cambiar de lado antes de comprobar: se pone mal y luego como toca. */
        await tocar(lado(m.caja, l.id, otro(l.lado)));
        await tocar(lado(m.caja, l.id, l.lado));
      }
      assert.equal(m.caja.querySelector("[data-asiento-completo]") === null, true, `${it.id}: las sumas antes de comprobar`);
      await tocar(boton(m.caja, "Comprobar"));
      for (const l of it.lineas) {
        const ok = !falla(L.idLineaH6(it, l));
        for (const b of m.caja.querySelectorAll(`[data-linea-cuenta="${l.id}"] button`)) assert.equal(b.disabled, true);
        assert.deepEqual([...m.caja.querySelectorAll(`[data-linea-cuenta="${l.id}"] [data-texto-retro]`)].map((p) => p.textContent), ok ? [] : [l.distractores[0].retro]);
        assert.deepEqual([...m.caja.querySelectorAll(`[data-linea-cuenta="${l.id}"] [data-era]`)].map((p) => p.textContent), ok ? [] : [`Iba aquí: ${l.cuenta}, al ${l.lado === DEBE ? "debe" : "haber"}.`]);
        detalle.push({ item: L.idLineaH6(it, l), ok, intentos: 1, respuesta: ok ? null : `${l.distractores[0].cuenta}|${l.lado}`, orden: detalle.length + 1 });
      }
      assert.ok(m.caja.querySelector("[data-asiento-completo]").textContent.includes(`${pesos(986_000)}${pesos(986_000)}`));
      assert.equal(boton(m.caja, "Comprobar") === undefined, true, "«Comprobar» sigue ahí");
    }
    await tocar(boton(m.caja, k === EN_ORDEN.length - 1 ? D.BOTON_H6.verResumen : D.BOTON_H6.siguiente));
  }
  return detalle;
}

test("★★★ la tanda entera: once unidades, un intento cada una, y el porcentaje es aciertos / 11", async () => {
  const m = await montar();
  try {
    const fallos = new Set(["iva-reversa", "baja-deuda", "libro-garza:retencion", "libro-nogal:anticipo", "libro-nogal:cxc"]);
    const detalle = await jugar(m, (id) => fallos.has(id));
    const [pct, , det] = m.completados[0];
    assert.deepEqual(det, detalle);
    assert.deepEqual(det.map((d) => d.item), L.unidadesH6());
    assert.equal(L.TOTAL_H6, 11);
    assert.equal(pct, (6 / 11) * 100);
    assert.equal(m.caja.querySelector("[data-resumen]").textContent, D.resumenH6(6, 11));
  } finally {
    m.desmontar();
  }
});

test("★★ las opciones, las líneas y su banco de cuentas se barajan en cada intento; los ítems, no", () => {
  const revolver = (xs) => [...xs].sort(() => Math.random() - 0.5);
  const a = new Set(); const b = new Set();
  for (let i = 0; i < 60; i++) {
    const p = L.prepararH6(revolver);
    assert.deepEqual(p.map((x) => x.id), D.ITEMS_H6.map((x) => x.id));
    a.add(p[0].opciones.map((o) => o.valor).join());
    b.add(p[3].orden.join() + p[3].lineas.map((l) => l.banco.join()).join());
    assert.equal(p[2], item("baja-deuda"), "una casilla no se baraja");
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
    assert.equal(ids.length, 11);
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

/* ═══════════ LOTE 3 · «ARMA LA LÍNEA» Y LA CASILLA ═══════════ */

const NEAR = conCorreccionesDeMello(leer("orquestador/conocimiento/paquetes/lote3-distractores-v1.md"));

test("★★★ lote 3: el ítem 3 va con casilla; los dos libros, con banco de cuentas; los ítems 4 y 6 ya no están (de 13 a 11)", () => {
  assert.deepEqual(D.ITEMS_H6.map((x) => [x.id, x.tipo]), [["iva-reversa", "eleccion"], ["retencion-reversa", "eleccion"], ["baja-deuda", "cifra"], ["libro-garza", "asiento"], ["libro-nogal", "asiento"]]);
  assert.ok(NEAR.includes("| T7-1 H6 `t7-1-devolucion-dos-libros` | 3 cuánto baja la deuda ($956.250) | 1 y 2"));
  assert.ok(NEAR.includes("H6 baja de 13 a 11 aciertos"));
  assert.equal(L.unidadesH6().length, 11);
  for (const it of D.ITEMS_H6.filter((x) => x.tipo === "asiento")) for (const l of it.lineas) {
    assert.equal(l.distractores.length, 2, l.id);
    assert.ok(!l.distractores.some((d) => d.cuenta === l.cuenta), l.id);
    assert.equal(new Set(l.distractores.map((d) => d.cuenta)).size, 2, l.id);
  }
  /* El banco de cada línea: las tres cuentas. */
  const p = L.prepararH6((xs) => [...xs].reverse());
  for (const it of p.filter((x) => x.tipo === "asiento")) for (const l of it.lineas) assert.deepEqual([...l.banco].sort(), [l.cuenta, ...l.distractores.map((d) => d.cuenta)].sort());
  /* La casilla: un distractor de Near da su texto y la respuesta; otra cifra, la respuesta y el porqué del acierto, sin «Así es:». */
  assert.deepEqual(L.evaluarH6(item("baja-deuda"), 986_000), { ok: false, correcta: 956_250, textos: ["Falta restar la retención de $29.750.", "Iba aquí: $956.250."], textoCorrecta: pesos(956_250) });
  assert.deepEqual(L.evaluarH6(item("baja-deuda"), 1), { ok: false, correcta: 956_250, textos: ["Iba aquí: $956.250.", "$850.000 + $136.000 − $29.750 = $956.250."], textoCorrecta: pesos(956_250) });
});

test("★★★ lote 3: cada distractor de cuenta es el de Near, letra por letra y en el orden de su tabla", () => {
  const filas = NEAR.split("\n").map((x) => x.match(/^\| `([^`]+)` \| (.+?) · ([DH]) · (\$[\d.]+)(?: · [\d.]+)? \| (.+?) \| «(.+)» \| [\d,]+ \|$/)).filter(Boolean);
  for (const it of D.ITEMS_H6.filter((x) => x.tipo === "asiento")) for (const l of it.lineas) {
    const deNear = filas.filter((m) => m[1].split(" ")[0] === it.id && m[2] === l.cuenta && m[3] === (l.lado === DEBE ? "D" : "H") && m[4] === pesos(l.valor)).map((m) => ({ cuenta: m[5], retro: m[6] }));
    assert.equal(deNear.length, 2, `${it.id} · ${l.id}: sus dos filas en el paquete`);
    assert.deepEqual(l.distractores, deNear, `${it.id} · ${l.id}`);
  }
});

test("★★★ lote 3: cuenta buena y lado malo, sale el texto del lado; cuenta mala, el de su distractor", async () => {
  const m = await montar();
  try {
    for (const it of EN_ORDEN.slice(0, 2)) { await tocar(opcion(m.caja, it.correcta)); await tick(ESPERA_C4); await tocar(boton(m.caja, D.BOTON_H6.siguiente)); }
    await escribir(m.caja, "baja-deuda", item("baja-deuda").correcta);
    await tocar(boton(m.caja, "Comprobar"));
    await tick(ESPERA_C4);
    await tocar(boton(m.caja, D.BOTON_H6.siguiente));
    const it = EN_ORDEN[3];
    const [l1, l2, ...resto] = it.lineas;
    await tocar(ficha(m.caja, l1.id, l1.cuenta));
    await tocar(lado(m.caja, l1.id, otro(l1.lado)));
    await tocar(ficha(m.caja, l2.id, l2.distractores[1].cuenta));
    await tocar(lado(m.caja, l2.id, l2.lado));
    for (const l of resto) { await tocar(ficha(m.caja, l.id, l.cuenta)); await tocar(lado(m.caja, l.id, l.lado)); }
    await tocar(boton(m.caja, "Comprobar"));
    const bajo = (l) => [...m.caja.querySelectorAll(`[data-linea-cuenta="${l.id}"] [data-texto-retro]`)].map((p) => p.textContent);
    const dato = (l) => D.ITEMS_H6.find((x) => x.id === it.id).lineas.find((x) => x.id === l.id);
    assert.deepEqual(bajo(l1), [dato(l1).retro], "cuenta buena, lado malo: el texto del lado");
    assert.deepEqual(bajo(l2), [dato(l2).distractores[1].retro], "cuenta mala: el texto de ese distractor");
    for (const l of resto) assert.deepEqual(bajo(l), []);
  } finally {
    m.desmontar();
  }
});

/* ═══════════ LOTE 5 · LA FIGURA ACUMULADA ═══════════ */

test("★★★ lote 5: la cuenta de la devolución se arma con los ítems 1 a 3 y cada libro suma su asiento; nunca antes, y se queda", async () => {
  const CU = "850.000 136.000 29.750 956.250";
  const despues = [
    ["850.000 136.000"],
    ["850.000 136.000 29.750"],
    [CU],
    [CU, "asiento Libro de La Garza: 4 líneas"],
    [CU, "asiento Libro de La Garza: 4 líneas", "asiento Libro de El Nogal: 4 líneas"],
  ];
  const m = await montar();
  try {
    for (const [k, it] of EN_ORDEN.entries()) {
      assert.deepEqual(firma(m.caja), k ? despues[k - 1] : [], `antes del ítem ${k + 1}`);
      const falla = k % 2 === 1;
      if (it.tipo === "eleccion") {
        await tocar(opcion(m.caja, falla ? it.distractores[0].valor : it.correcta));
        assert.deepEqual(firma(m.caja), k ? despues[k - 1] : [], "C4: antes del veredicto, la figura acumulada no suma");
        await tick(ESPERA_C4);
      } else if (it.tipo === "cifra") {
        assert.ok(!textoFigura(m.caja).includes(miles(it.correcta)), "E8");
        await escribir(m.caja, it.id, falla ? it.distractores[0].valor : it.correcta);
        await tocar(boton(m.caja, "Comprobar"));
        await tick(ESPERA_C4);
      } else {
        for (const l of it.lineas) { await tocar(ficha(m.caja, l.id, l.cuenta)); await tocar(lado(m.caja, l.id, falla ? otro(l.lado) : l.lado)); }
        assert.deepEqual(firma(m.caja), k ? despues[k - 1] : [], `el asiento ${k + 1} no está antes de comprobar`);
        await tocar(boton(m.caja, "Comprobar"));
      }
      assert.deepEqual(firma(m.caja), despues[k], `al cerrar el ítem ${k + 1}`);
      await tocar(boton(m.caja, k === EN_ORDEN.length - 1 ? D.BOTON_H6.verResumen : D.BOTON_H6.siguiente));
    }
    assert.equal(m.caja.querySelector("[data-figura-acumulada]"), null);
  } finally {
    m.desmontar();
  }
});

/* ═══════════ C4 · LA NOTA CRÉDITO DE EL NOGAL (Watari, t71-h6; Mello C4-1 y C4-3) ═══════════ */

test("★★★ C4: los ítems son los de Near; cada opción y cada distractor entra a su renglón con su parte de lo devuelto", () => {
  assert.equal(C4.id, D.H6_ID);
  assert.deepEqual(C4.items.map((i) => [i.id, i.tipo]), D.ITEMS_H6.map((i) => [i.id, i.tipo === "asiento" ? "propio" : i.tipo]));
  for (const I of C4.items.filter((x) => x.tipo !== "propio")) {
    const it = item(I.id);
    assert.deepEqual(I.opciones.map((o) => [o.v, o.correcta, o.msg]), [[it.correcta, true, null], ...it.distractores.map((d) => [d.valor, false, d.retro])]);
  }
  const T = C4M.TEXTOS_C4_H6;
  const de = (id, x) => C4.consecuencia(C4.items.find((i) => i.id === id), x);
  assert.deepEqual([de("iva-reversa", 136_000).cuadra, de("iva-reversa", 0).falla], ["Es el 16 % de lo devuelto.", "Es el 0 % de lo devuelto, y la tarifa es 16 %."]);
  assert.deepEqual([de("retencion-reversa", 29_750).cuadra, de("retencion-reversa", 0).falla], ["Es el 3,5 % de lo devuelto.", "Es el 0 % de lo devuelto, y la tarifa es 3,5 %."]);
  assert.deepEqual([de("baja-deuda", 956_250).cuadra, de("baja-deuda", 1_015_750).falla, de("baja-deuda", 986_000).falla], [T.cuadra, "Sobran $59.500 frente a la nota.", "Sobran $29.750 frente a la nota."]);
  /* Los renglones ya resueltos se quedan con su cifra; los que faltan, en $?. */
  assert.deepEqual(de("baja-deuda", null).renglones.map((r) => [r.id, r.valor, r.parte]), [["iva-reversa", 136_000, "16 % de lo devuelto"], ["retencion-reversa", 29_750, "3,5 % de lo devuelto"], ["baja-deuda", null, null]]);
  assert.deepEqual(de("iva-reversa", null).renglones.map((r) => r.valor), [null, null, null]);
});

test("★★★ C4-3 (Mello): toda la compra no es «128 % de lo devuelto»: dice la frase de Mello; sin negativos ni más del 100 %", () => {
  const de = (id, x) => C4.consecuencia(C4.items.find((i) => i.id === id), x);
  const [iva, ret] = MC4.C4_3_H6.distractores;
  assert.equal(de("iva-reversa", iva).falla, MC4.C4_3_H6.iva);
  assert.equal(C4M.TEXTOS_C4_H6.ivaDeLaCompra, MC4.C4_3_H6.iva);
  assert.equal(de("retencion-reversa", ret).falla, C4M.TEXTOS_C4_H6.retencionDeLaCompra);
  for (const [id, x] of [["iva-reversa", iva], ["retencion-reversa", ret]]) {
    const e = JSON.stringify(de(id, x));
    for (const hoy of MC4.C4_3_H6.hoy) assert.ok(!e.includes(hoy), `${id}: «${hoy}»`);
  }
  for (const I of C4.items.filter((x) => x.tipo !== "propio")) {
    for (const x of [null, ...I.opciones.map((o) => o.v), ...(I.tipo === "cifra" ? [1, 999_999_999] : [])]) {
      const e = JSON.stringify(C4.consecuencia(I, x));
      assert.doesNotMatch(e, /\$-|-\d|−\$/, `${I.id} · ${x}`);
      for (const m of e.matchAll(/(\d+(?:,\d+)?) % de lo devuelto/g)) assert.ok(Number(m[1].replace(",", ".")) <= 100, `${I.id} · ${x}: ${m[0]}`);
    }
  }
});

test("★★★ C4-1 (Mello): la figura del contrato (PIEZA_C4) con la cifra escrita la muestra en su renglón y no califica", async () => {
  const I = C4.items.find((i) => i.id === "baja-deuda");
  for (const o of I.opciones) {
    const caja = document.createElement("div");
    document.body.appendChild(caja);
    const { createRoot: cr } = await import("react-dom/client");
    const raiz = cr(caja);
    await act(async () => { raiz.render(h(PIEZA_C4.Figura, { estado: null, item: I, vista: { valor: null, borrador: o.v } })); });
    sinResultado(caja, I, o.v);
    await act(async () => { raiz.render(h(PIEZA_C4.Figura, { estado: C4.consecuencia(I, o.v), item: I, vista: { valor: o.v, borrador: o.v } })); });
    assert.equal(lineaC4(caja), c4De(I.id, o.v));
    await act(async () => raiz.unmount());
    caja.remove();
  }
});

test("★★ C4: con movimiento reducido, el veredicto llega en el mismo toque", async () => {
  REDUCIDO = true;
  const m = await montar();
  try {
    await tocar(opcion(m.caja, EN_ORDEN[0].correcta));
    assert.deepEqual(retros(m.caja), L.evaluarH6(EN_ORDEN[0], EN_ORDEN[0].correcta).textos);
  } finally { REDUCIDO = false; m.desmontar(); }
});
