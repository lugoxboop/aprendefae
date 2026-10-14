import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · HACER 1 — «¿Qué renta da este título?» (Célula B, b5-t5-a1).
 *
 * Vigila LO QUE SE VE, no solo lo que se calcula:
 *   · el rótulo del botón en cada estado, y que quepa en UNA línea a 320
 *   · las 14 fichas, sus devoluciones de acierto, las tres de error y las
 *     TRES columnas de las fichas de nombre, literales de la guía guardada
 *     (orquestador/conocimiento/paquetes/b5-t5-act1.md), ficha por ficha
 *   · el segundo fallo de una ficha de nombre de renta fija: la lista del libro
 *   · las correcciones de Shoko: en el reintento, la devolución del error de
 *     ESE intento; tras acertar el reintento, solo el ✅; el aviso, solo
 *     mientras se espera el reintento; la devolución por Retro (role=status)
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0);
w.cancelAnimationFrame = (id) => clearTimeout(id);
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  requestAnimationFrame: w.requestAnimationFrame, cancelAnimationFrame: w.cancelAnimationFrame,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const { default: QueRentaDa } = await import("../../components/mecanicas/libros/tema5/QueRentaDa.jsx");
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const L = await import("../t5Act1.js");
const D = await import("../../data/contabilidadT5Act1.js");
const { barajar } = await import("../../utils/barajar.js");
const { FAE } = await import("../../theme.js");

const ficha = (id) => D.FICHAS_T5_ACT1.find((f) => f.id === id);

/* Monta el juego con las fichas dadas (en ese orden), sin sorteo. */
const montar = async (ids) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const items = ids.map(ficha);
  await act(async () => {
    raiz.render(h(QueRentaDa, { Marco: MarcoLibros, rotulo: "PRUEBA", titulo: "Prueba", acento: FAE.ambar, onCompletar: () => {}, items }));
  });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { assert.ok(el, "no hay nada que tocar"); await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const pestana = (caja, id) => caja.querySelector(`[data-renta="${id}"]`);
const opcion = (caja, id) => caja.querySelector(`[data-tipo="${id}"]`);
const botonColocar = (caja) => caja.querySelector("[data-boton-colocar] button");
const botonAvanzar = (caja) => caja.querySelector("[data-boton-avanzar] button");
const rotuloBoton = (caja) => (botonColocar(caja) ?? botonAvanzar(caja) ?? [...caja.querySelectorAll("button")].at(-1)).textContent;
/* Lo que se lee en la devolución, sin el texto oculto para lectores. */
const devolucion = (caja) => {
  const p = caja.querySelector('[role="status"]');
  if (!p) return null;
  return [...p.childNodes].filter((n) => !(n.classList?.contains("fae-jg-oculto"))).map((n) => n.textContent).join("");
};
const marcar = async (caja, renta, tipo = null) => {
  if (pestana(caja, renta).dataset.elegido !== "si") await tocar(pestana(caja, renta));
  if (tipo) await tocar(opcion(caja, tipo));
  await tocar(botonColocar(caja));
};

/* ═══════════ LA GUÍA GUARDADA, LEÍDA POR SECCIÓN ═══════════ */

const GUIA = readFileSync(new URL("../../../orquestador/conocimiento/paquetes/b5-t5-act1.md", import.meta.url), "utf8");
const seccion = (desde, hasta) => {
  const i = GUIA.indexOf(desde);
  assert.ok(i >= 0, `la guía no tiene «${desde}»`);
  const j = hasta ? GUIA.indexOf(hasta, i + desde.length) : GUIA.length;
  return GUIA.slice(i, j);
};
/* Filas de tabla «| id | «texto» | … |» → { id: [celdas sin «» ni (n · n)] }. */
const filas = (texto) => {
  const out = {};
  for (const linea of texto.split("\n")) {
    if (!linea.startsWith("| ")) continue;
    const celdas = linea.split(" | ").map((c) => c.replace(/^\| /, "").replace(/ \|$/, "").trim());
    out[celdas[0]] = celdas.slice(1).map((c) => c.replace(/\s*\(\d+ · \d+\)$/, "").replace(/^«(.*)»$/, "$1"));
  }
  return out;
};
const GUIA_FICHAS = filas(seccion("### 3.6", "Devoluciones de acierto"));
const GUIA_ACIERTOS = filas(seccion("Devoluciones de acierto", "### 3.7"));
const GUIA_ERRORES = filas(seccion("### 3.7", "### 3.8"));
const GUIA_NOMBRES = filas(seccion("### 3.8", "### 3.9"));
const sinEmoji = (t) => t.replace(/^(✅|❌) /, "");

const IDS = ["acciones", "def-emisora", "def-dividendos", "caso-resultados", "cdt", "bonos", "cedulas", "def-interes", "caso-pactado", "participacion", "cert", "canjeables", "def-descuento", "caso-redencion"];
const NOMBRES_FIJA = ["cdt", "bonos", "cedulas", "participacion", "cert", "canjeables"];

/* ═══════════ LO QUE SE VE: LAS 14 FICHAS Y SUS DEVOLUCIONES ═══════════ */

test("★★★ las 14 fichas: el texto pintado es el de la guía, ficha por ficha, y la respuesta también", async () => {
  assert.deepEqual(D.FICHAS_T5_ACT1.map((f) => f.id), IDS);
  for (const id of IDS) {
    assert.ok(GUIA_FICHAS[id], `la guía no tiene la ficha ${id}`);
    const { caja, desmontar } = await montar([id]);
    assert.equal(caja.querySelector(`[data-ficha="${id}"]`).textContent, GUIA_FICHAS[id][0], id);
    const respuesta = GUIA_FICHAS[id][1];
    const f = ficha(id);
    assert.equal(respuesta, f.renta === "variable" ? "Renta variable" : `Renta fija → ${f.tipo === "interes" ? "Con interés" : "Con descuento"}`, `${id}: respuesta`);
    desmontar();
  }
});

test("★★★ las 14 devoluciones de acierto se ven literales tras ✅, ficha por ficha", async () => {
  for (const id of IDS) {
    const f = ficha(id);
    const { caja, desmontar } = await montar([id]);
    await marcar(caja, f.renta, f.tipo);
    assert.equal(devolucion(caja), `✅${GUIA_ACIERTOS[id][0]}`, id);
    desmontar();
  }
});

test("★★★ las tres devoluciones de error (A, B, C) se ven literales en las fichas de definición y caso", async () => {
  /* A: renta fija puesta en variable. */
  let m = await montar(["def-interes"]);
  await marcar(m.caja, "variable");
  assert.equal(devolucion(m.caja), `❌${GUIA_ERRORES.A[1]}`);
  m.desmontar();
  /* B: renta variable puesta en fija. */
  m = await montar(["def-emisora"]);
  await marcar(m.caja, "fija", "interes");
  assert.equal(devolucion(m.caja), `❌${GUIA_ERRORES.B[1]}`);
  m.desmontar();
  /* C: renta fija bien, tipo mal. */
  m = await montar(["caso-redencion"]);
  await marcar(m.caja, "fija", "interes");
  assert.equal(devolucion(m.caja), `❌${GUIA_ERRORES.C[1]}`);
  m.desmontar();
});

test("★★★ fichas de nombre: las tres columnas se ven literales — nivel 1, nivel 2 y, en el segundo fallo, la lista del libro", async () => {
  for (const id of NOMBRES_FIJA) {
    const [nivel1, nivel2, segundo] = GUIA_NOMBRES[id];
    const f = ficha(id);
    const otro = f.tipo === "interes" ? "descuento" : "interes";
    /* Falla el nivel 1, y el segundo intento también falla (en el nivel 2): sale la lista del libro. */
    let m = await montar([id]);
    await marcar(m.caja, "variable");
    assert.equal(devolucion(m.caja), `❌${nivel1}`, `${id}: nivel 1`);
    await marcar(m.caja, "fija", otro);
    assert.equal(devolucion(m.caja), `❌${segundo}`, `${id}: segundo fallo`);
    m.desmontar();
    /* Falla el nivel 2, y el segundo intento falla en el nivel 1: también la lista. */
    m = await montar([id]);
    await marcar(m.caja, "fija", otro);
    assert.equal(devolucion(m.caja), `❌${nivel2}`, `${id}: nivel 2`);
    await tocar(pestana(m.caja, "variable"));
    await tocar(botonColocar(m.caja));
    assert.equal(devolucion(m.caja), `❌${segundo}`, `${id}: segundo fallo tras nivel 2`);
    m.desmontar();
  }
  /* «acciones»: no tiene segundo nivel; tras el segundo fallo se repite la de nivel 1. */
  const m = await montar(["acciones"]);
  await marcar(m.caja, "fija", "interes");
  assert.equal(devolucion(m.caja), `❌${GUIA_NOMBRES.acciones[0]}`);
  await marcar(m.caja, "fija", "descuento");
  assert.equal(devolucion(m.caja), `❌${GUIA_NOMBRES.acciones[0]}`);
  m.desmontar();
});

/* ═══════════ LAS CORRECCIONES DE SHOKO ═══════════ */

test("★★★ corrección 1: en el reintento, la devolución es la del error de ESE intento (A y luego C)", async () => {
  const { caja, desmontar } = await montar(["def-interes"]);
  await marcar(caja, "variable");
  assert.equal(devolucion(caja), sinEmoji(D.ERROR_T5_ACT1.A).replace(/^/, "❌"));
  await marcar(caja, "fija", "descuento");
  assert.equal(devolucion(caja), `❌${GUIA_ERRORES.C[1]}`, "en el reintento falló el nivel 2: va C, no A");
  desmontar();
});

test("★★★ corrección 2: tras un reintento acertado queda solo el ✅; el aviso, solo mientras se espera el reintento", async () => {
  const { caja, desmontar } = await montar(["caso-pactado"]);
  assert.equal(Boolean(caja.querySelector("[data-fallo]")), false);
  await marcar(caja, "fija", "descuento");
  assert.equal(caja.querySelector("[data-fallo]").textContent, "La ficha no se colocó.");
  assert.ok(devolucion(caja).startsWith("❌"));
  await marcar(caja, "fija", "interes");
  assert.equal(Boolean(caja.querySelector("[data-fallo]")), false, "el aviso desaparece tras el reintento");
  assert.equal(caja.querySelectorAll('[role="status"]').length, 1);
  assert.equal(devolucion(caja), `✅${GUIA_ACIERTOS["caso-pactado"][0]}`);
  assert.ok(!caja.textContent.includes(sinEmoji(D.ERROR_T5_ACT1.C)), "la devolución del primer fallo ya no se ve");
  desmontar();
});

test("★★ correcciones 3 y 4: el emoji va al inicio en los datos y la devolución sale por Retro (role=status)", async () => {
  for (const f of D.FICHAS_T5_ACT1) {
    assert.ok(f.acierto.startsWith("✅ "), f.id);
    for (const k of ["falloNivel1", "falloNivel2", "segundoFallo"]) if (f[k]) assert.ok(f[k].startsWith("❌ "), `${f.id}.${k}`);
  }
  for (const t of Object.values(D.ERROR_T5_ACT1)) assert.ok(t.startsWith("❌ "));
  const { caja, desmontar } = await montar(["bonos"]);
  await marcar(caja, "fija", "interes");
  const p = caja.querySelector('[role="status"]');
  assert.ok(p);
  assert.equal(p.querySelector('[aria-hidden="true"]').textContent, "✅", "Retro separa el emoji");
  desmontar();
});

/* ═══════════ EL BOTÓN: EL RÓTULO DE CADA ESTADO, Y QUE QUEPA ═══════════ */

/*
 * Ancho de cada glifo de Sora, peso 700, a 14 px (la letra de Responder),
 * medido en Chromium 141 con Sora real de Google Fonts el 2026-10-14
 * (canvas measureText, fuente cargada). Sirve para comprobar sin navegador que
 * el rótulo cabe. Un glifo que no está aquí hace fallar la prueba: un rótulo
 * nuevo obliga a volver a medir.
 *
 * Los seis rótulos enteros, medidos en el mismo navegador como texto pintado
 * (con interletraje), dan 152,45 · 133 · 111,73 · 108,59 · 112,97 · 76,94: la
 * suma de glifos se queda a menos de 1 px de eso.
 */
const GLIFOS_SORA_700_14 = {
  " ": 2.94, C: 11.2, E: 8.32, O: 12.1, S: 9.34, V: 10.36, a: 8.32, c: 8.55, d: 9.84, e: 8.74, f: 5.35, g: 9.6,
  h: 9.13, i: 4.68, j: 4.75, l: 4.41, n: 9.13, o: 9.53, p: 9.84, q: 9.84, r: 5.89, s: 7.78, t: 6.08, u: 9.03, "é": 8.74,
};
const anchoRotulo = (texto) => [...texto].reduce((s, g) => {
  if (!(g in GLIFOS_SORA_700_14)) throw new Error(`glifo sin medir: «${g}» en «${texto}»`);
  return s + GLIFOS_SORA_700_14[g];
}, 0);
/* A 320: 258 de ancho útil del Panel menos 18 + 18 de relleno de Responder. */
const UTIL_RESPONDER_320 = 258 - 36;

test("★★★ el rótulo del botón en cada estado es el de la guía, y cada uno cabe en una línea a 320", async () => {
  const vistos = [];
  const { caja, desmontar } = await montar(["cdt", "acciones"]);
  vistos.push(rotuloBoton(caja));
  assert.equal(rotuloBoton(caja), "Elige un tipo de renta");
  await tocar(pestana(caja, "fija"));
  vistos.push(rotuloBoton(caja));
  assert.equal(rotuloBoton(caja), "Elige qué renta fija");
  await tocar(opcion(caja, "interes"));
  vistos.push(rotuloBoton(caja));
  assert.equal(rotuloBoton(caja), "Colocar la ficha");
  await tocar(pestana(caja, "variable"));
  assert.equal(rotuloBoton(caja), "Colocar la ficha", "«Renta variable» va directo a colocar");
  await tocar(pestana(caja, "fija"));
  await tocar(opcion(caja, "interes"));
  await tocar(botonColocar(caja));
  vistos.push(rotuloBoton(caja));
  assert.equal(rotuloBoton(caja), "Siguiente ficha");
  await tocar(botonAvanzar(caja));
  await marcar(caja, "variable");
  vistos.push(rotuloBoton(caja));
  assert.equal(rotuloBoton(caja), "Ver el resultado");
  await tocar(botonAvanzar(caja));
  vistos.push(rotuloBoton(caja));
  assert.equal(rotuloBoton(caja), "Otra tanda");
  desmontar();

  for (const t of vistos) {
    const ancho = anchoRotulo(t);
    assert.ok(ancho <= UTIL_RESPONDER_320, `«${t}» mide ${ancho.toFixed(2)} px y no cabe en ${UTIL_RESPONDER_320} a 320`);
  }
  assert.ok(anchoRotulo("Elige un tipo de renta") > 150, "la tabla de glifos mide de verdad");
});

/* ═══════════ LAS PESTAÑAS ═══════════ */

test("★★ pestañas: «Renta variable» no abre panel; cambiar de pestaña borra el segundo nivel; aria correcto", async () => {
  const { caja, desmontar } = await montar(["cdt"]);
  assert.deepEqual([...caja.querySelectorAll("[data-rotulo-renta]")].map((n) => n.textContent), ["Renta variable", "Renta fija"]);
  const fija = pestana(caja, "fija");
  assert.equal(fija.getAttribute("aria-expanded"), "false");
  await tocar(fija);
  const panel = caja.querySelector("[data-panel-fija]");
  assert.equal(panel.getAttribute("role"), "group");
  assert.equal(fija.getAttribute("aria-controls"), panel.id);
  assert.equal(fija.getAttribute("aria-expanded"), "true");
  assert.deepEqual([...panel.querySelectorAll("button")].map((b) => b.textContent), ["Con interés", "Con descuento"]);
  await tocar(opcion(caja, "descuento"));
  assert.equal(opcion(caja, "descuento").getAttribute("aria-pressed"), "true");
  await tocar(pestana(caja, "variable"));
  assert.equal(Boolean(caja.querySelector("[data-panel-fija]")), false, "con «Renta variable» no hay panel");
  assert.equal(pestana(caja, "variable").hasAttribute("aria-expanded"), false);
  await tocar(pestana(caja, "fija"));
  assert.equal(Boolean(caja.querySelector('[data-tipo][aria-pressed="true"]')), false, "el panel se abre sin nada elegido");
  desmontar();
});

/* ═══════════ SORTEO Y PUNTAJE ═══════════ */

test("★★★ la tanda: 9 fichas, 3 por grupo, como mucho una de nombre por grupo (y exactamente una en interés y descuento)", () => {
  for (let k = 0; k < 300; k++) {
    const tanda = L.sortearT5Act1(barajar);
    assert.equal(tanda.length, 9);
    assert.equal(new Set(tanda.map((f) => f.id)).size, 9);
    for (const g of L.GRUPOS_T5_ACT1) {
      const del = tanda.filter((f) => f.renta === g.renta && f.tipo === g.tipo);
      assert.equal(del.length, 3);
      const nombres = del.filter((f) => f.clase === D.NOMBRE).length;
      if (g.tipo) assert.equal(nombres, 1, `${g.tipo}: una de nombre`);
      else assert.ok(nombres <= 1);
    }
  }
});

test("★★★ puntaje como T1-6: 60 % renta y 40 % tipo; variable entera; el segundo intento vale la mitad", async () => {
  const fija = ficha("cdt");
  const varia = ficha("acciones");
  assert.equal(L.valorDeItemT5Act1(fija, L.evaluarT5Act1(fija, { renta: "fija", tipo: "interes" })), 1);
  assert.equal(L.valorDeItemT5Act1(fija, L.evaluarT5Act1(fija, { renta: "fija", tipo: "descuento" })), 0.6);
  assert.equal(L.valorDeItemT5Act1(fija, L.evaluarT5Act1(fija, { renta: "variable", tipo: null })), 0);
  assert.equal(L.valorDeItemT5Act1(varia, L.evaluarT5Act1(varia, { renta: "variable", tipo: null })), 1);
  /* Montado: fallar y acertar en el reintento deja la ficha en 50. */
  let pct = null;
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => {
    raiz.render(h(QueRentaDa, { Marco: MarcoLibros, rotulo: "P", titulo: "P", acento: FAE.ambar, onCompletar: (p) => { pct = p; }, items: [fija] }));
  });
  await marcar(caja, "variable");
  await marcar(caja, "fija", "interes");
  await tocar(botonAvanzar(caja));
  assert.equal(pct, 50);
  assert.equal(caja.querySelector("[data-resumen]").textContent,
    "0 de 1 completas al primer intento. Cada ficha valía 100.00 %. Elegir variable o fija pesa 60 %. Elegir con interés o con descuento pesa 40 %. En las de renta variable, la primera elección vale toda la ficha.");
  act(() => raiz.unmount());
  caja.remove();
});

test("★★ el texto alternativo y el objetivo y la consigna son los de la guía", async () => {
  const { caja, desmontar } = await montar(["bonos"]);
  assert.ok(GUIA.includes(`«${D.ALT_T5_ACT1}»`));
  assert.ok(caja.textContent.includes(D.ALT_T5_ACT1));
  assert.equal(caja.querySelector("[data-objetivo]").textContent, "Distinguir los tres tipos de título según el tipo de renta que dan.");
  assert.equal(caja.querySelector("[data-consigna]").textContent, "Lee la ficha. Elige qué tipo de renta da.");
  desmontar();
});
