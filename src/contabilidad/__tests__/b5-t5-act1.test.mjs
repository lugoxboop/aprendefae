import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · HACER 1 — «¿Qué renta da este título?» (Célula B, b5-t5-a1).
 *
 * Vigila LO QUE SE VE, no solo lo que se calcula:
 *   · lote 6a (hoja de fusiones de Mai): los tres cajones son las opciones, con
 *     las marcas de E4; la tanda reparte entre 2 y 4 por cajón (R10)
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
const botonAvanzar = (caja) => caja.querySelector("[data-boton-avanzar] button");
/* Lo que se lee en la devolución, sin el texto oculto para lectores. */
const devolucion = (caja) => {
  const p = caja.querySelector('[role="status"]');
  if (!p) return null;
  return [...p.childNodes].filter((n) => !(n.classList?.contains("fae-jg-oculto"))).map((n) => n.textContent).join("");
};
/* Lote 6a: tocar el cajón coloca la ficha (las fichas a un nivel). */
const cajon = (caja, renta, tipo = null) => caja.querySelector(`[data-cajon="${tipo ? `${renta}/${tipo}` : renta}"]`);
const marcar = async (caja, renta, tipo = null) => tocar(cajon(caja, renta, tipo));

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

/* La regla única del segundo fallo, calculada a mano desde la guía: «No es esa.» + el acierto sin «Sí.». */
const segundoDeGuia = (id) => `❌No es esa. ${GUIA_ACIERTOS[id][0].replace(/^Sí\. /, "")}`;

test("★★★ fichas de nombre: nivel 1 y nivel 2 se ven literales, y el segundo fallo es su acierto con «No es esa.» delante", async () => {
  for (const id of NOMBRES_FIJA) {
    const [nivel1, nivel2] = GUIA_NOMBRES[id];
    const f = ficha(id);
    const otro = f.tipo === "interes" ? "descuento" : "interes";
    let m = await montar([id]);
    await marcar(m.caja, "variable");
    assert.equal(devolucion(m.caja), `❌${nivel1}`, `${id}: nivel 1`);
    await marcar(m.caja, "fija", otro);
    assert.equal(devolucion(m.caja), segundoDeGuia(id), `${id}: segundo fallo`);
    m.desmontar();
    m = await montar([id]);
    await marcar(m.caja, "fija", otro);
    assert.equal(devolucion(m.caja), `❌${nivel2}`, `${id}: nivel 2`);
    await marcar(m.caja, "variable");
    assert.equal(devolucion(m.caja), segundoDeGuia(id), `${id}: segundo fallo tras nivel 2`);
    m.desmontar();
  }
});

test("★★★ regla única: tras el segundo fallo, TODA ficha muestra su acierto con «No es esa.», y ese texto dice la respuesta", async () => {
  for (const id of IDS) {
    const f = ficha(id);
    /* Dos fallos seguidos, en los dos cajones que no son el suyo (el tocado queda ✕ y no se puede volver a tocar). */
    const otros = [["variable", null], ["fija", "interes"], ["fija", "descuento"]].filter(([rr, tt]) => !(rr === f.renta && tt === f.tipo));
    const m = await montar([id]);
    await marcar(m.caja, ...otros[0]);
    await marcar(m.caja, ...otros[1]);
    assert.equal(devolucion(m.caja), segundoDeGuia(id), id);
    /* La respuesta está en el texto: el tipo de renta o la lista del libro. */
    const t = devolucion(m.caja).toLowerCase();
    const dice = f.renta === "variable" ? t.includes("renta variable") : (t.includes("interés") || t.includes("descuento"));
    assert.ok(dice, `${id}: el segundo fallo no dice la respuesta: «${devolucion(m.caja)}»`);
    m.desmontar();
  }
});

/* ═══════════ LAS CORRECCIONES DE SHOKO ═══════════ */

test("★★★ el primer fallo da el error de ESE intento (A); el segundo, la regla única (no C)", async () => {
  const { caja, desmontar } = await montar(["def-interes"]);
  await marcar(caja, "variable");
  assert.equal(devolucion(caja), `❌${GUIA_ERRORES.A[1]}`);
  await marcar(caja, "fija", "descuento");
  assert.equal(devolucion(caja), segundoDeGuia("def-interes"), "el segundo fallo ya no da C: da la respuesta");
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

/* ═══════════ LOTE 6a: LOS TRES CAJONES SON LAS OPCIONES (hoja de fusiones de Mai) ═══════════ */

const L6A = seccion("## 11 · Lote 6a", null);
const marcaDe = (el) => el.dataset.marca || null;
const iconos = (el) => [...el.querySelectorAll("svg[data-icono]")].map((x) => x.dataset.icono);
const tachado = (el) => el.querySelector("[data-nombre-cajon]").style.textDecoration === "line-through";

test("★★★ los tres cajones son las opciones: sus nombres, su grupo, y van entre la ficha y la devolución; no hay pestañas ni botón", async () => {
  const { caja, desmontar } = await montar(["cdt", "acciones"]);
  const estante = caja.querySelector("[data-estante]");
  assert.equal(estante.getAttribute("role"), "group");
  assert.equal(estante.getAttribute("aria-label"), "Tipo de renta");
  assert.ok(L6A.includes("«Tipo de renta»"));
  const cajones = [...estante.querySelectorAll("button[data-cajon]")];
  assert.deepEqual(cajones.map((b) => b.querySelector("[data-nombre-cajon]").textContent), ["Renta variable", "Fija con interés", "Fija con descuento"]);
  for (const n of ["Renta variable", "Fija con interés", "Fija con descuento"]) assert.ok(L6A.includes(`«${n}»`), n);
  for (const b of cajones) assert.equal(b.style.minHeight, "84px");
  assert.equal(estante.style.gridTemplateColumns, "repeat(3, minmax(0, 1fr))");
  assert.equal(caja.querySelectorAll("[data-nivel1], [data-nivel2], [data-boton-colocar]").length, 0, "sin pestañas ni «Colocar la ficha»");
  assert.ok(caja.querySelector("[data-ficha]").compareDocumentPosition(estante) & 4, "el estante, debajo de la ficha");
  await marcar(caja, "fija", "interes");
  assert.ok(estante.compareDocumentPosition(caja.querySelector('[role="status"]')) & 4, "la devolución, debajo del estante");
  assert.equal(botonAvanzar(caja).textContent, "Siguiente ficha");
  desmontar();
});

test("★★★ E4: el acierto queda ✓ con borde grueso y relleno; el resto, a 0,5", async () => {
  const { caja, desmontar } = await montar(["cdt", "acciones"]);
  await marcar(caja, "fija", "interes");
  const bien = cajon(caja, "fija", "interes");
  assert.equal(marcaDe(bien), "correcta");
  assert.deepEqual(iconos(bien), ["visto"]);
  assert.equal(bien.style.borderWidth, "2px", "borde grueso");
  assert.ok(bien.style.background, "con relleno");
  assert.ok(bien.textContent.includes("(respuesta correcta)"));
  for (const otro of [cajon(caja, "variable"), cajon(caja, "fija", "descuento")]) {
    assert.equal(marcaDe(otro), "apagada");
    assert.equal(otro.style.opacity, "0.5");
    assert.deepEqual(iconos(otro), []);
    assert.equal(otro.disabled, true);
  }
  /* «Siguiente ficha» borra las marcas; la pila y el número se quedan. */
  await tocar(botonAvanzar(caja));
  assert.ok([...caja.querySelectorAll("[data-cajon]")].every((b) => !marcaDe(b) && !b.disabled));
  assert.equal(cajon(caja, "fija", "interes").querySelector("[data-numero]").textContent, "1");
  desmontar();
});

test("★★★ E4: el primer fallo deja el cajón tocado ✕ y tachado, y no se puede volver a tocar; el segundo deja los dos ✕ junto al correcto ✓", async () => {
  const { caja, desmontar } = await montar(["cdt"]);
  await marcar(caja, "fija", "descuento");
  const primero = cajon(caja, "fija", "descuento");
  assert.equal(marcaDe(primero), "tachada");
  assert.deepEqual(iconos(primero), ["tache"]);
  assert.ok(tachado(primero));
  assert.ok(primero.textContent.includes("(tu respuesta)"));
  assert.equal(primero.disabled, true, "el ✕ no se puede volver a tocar en esta ficha");
  assert.equal(primero.style.opacity, "1");
  assert.equal(cajon(caja, "variable").disabled, false, "los otros siguen abiertos");
  assert.equal(marcaDe(cajon(caja, "fija", "interes")), null, "lo correcto no se revela antes del segundo intento");
  await marcar(caja, "variable");
  assert.equal(marcaDe(cajon(caja, "variable")), "tachada");
  assert.equal(marcaDe(primero), "tachada", "lo elegido no se reemplaza");
  assert.equal(marcaDe(cajon(caja, "fija", "interes")), "correcta");
  /* La lámina tras el segundo fallo llega punteada, al cajón correcto. */
  assert.equal(cajon(caja, "fija", "interes").querySelector("[data-lamina]").dataset.lamina, "segundo");
  assert.equal(cajon(caja, "variable").querySelector("[data-numero]").textContent, "0");
  desmontar();
});

/* ═══════════ SORTEO Y PUNTAJE ═══════════ */

test("★★★ la tanda (R10): 9 fichas, entre 2 y 4 por cajón, y salen repartos distintos; como mucho una de nombre salvo con 4 en renta fija", () => {
  const repartos = new Set();
  for (let k = 0; k < 400; k++) {
    const tanda = L.sortearT5Act1(barajar);
    assert.equal(tanda.length, 9);
    assert.equal(new Set(tanda.map((f) => f.id)).size, 9);
    const cuantas = L.GRUPOS_T5_ACT1.map((g) => tanda.filter((f) => f.renta === g.renta && f.tipo === g.tipo));
    for (const [i, del] of cuantas.entries()) {
      assert.ok(del.length >= 2 && del.length <= 4, `cajón ${i}: ${del.length}`);
      const nombres = del.filter((f) => f.clase === D.NOMBRE).length;
      assert.ok(nombres <= (del.length === 4 && L.GRUPOS_T5_ACT1[i].tipo ? 2 : 1), `cajón ${i}: ${nombres} de nombre en ${del.length}`);
    }
    repartos.add(cuantas.map((x) => x.length).join("·"));
  }
  assert.ok(repartos.size >= 5, `el reparto no varía: ${[...repartos]}`);
  assert.ok(![...repartos].every((x) => x === "3·3·3"));
});

test("★★★ puntaje: cada ficha vale entera; el segundo intento, la mitad; el resumen es el de Futaba", async () => {
  const fija = ficha("cdt");
  const varia = ficha("acciones");
  assert.equal(L.valorDeItemT5Act1(fija, L.evaluarT5Act1(fija, { renta: "fija", tipo: "interes" })), 1);
  assert.equal(L.valorDeItemT5Act1(fija, L.evaluarT5Act1(fija, { renta: "fija", tipo: "descuento" })), 0);
  assert.equal(L.valorDeItemT5Act1(varia, L.evaluarT5Act1(varia, { renta: "variable", tipo: null })), 1);
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
  assert.equal(caja.querySelector("[data-resumen]").textContent, "0 de 1 fichas bien al primer intento.");
  assert.ok(L6A.includes("«{bien} de {cuantas} fichas bien al primer intento.»"));
  act(() => raiz.unmount());
  caja.remove();
});

test("★★ el texto alternativo y las dos reglas son los del lote 6a; el objetivo y la consigna, los de la guía", async () => {
  const { caja, desmontar } = await montar(["bonos"]);
  assert.ok(L6A.includes(`«${D.ALT_T5_ACT1}»`));
  assert.ok(caja.textContent.includes(D.ALT_T5_ACT1));
  for (const linea of D.REGLAS_T5_ACT1) assert.ok(L6A.includes(`«${linea}»`), linea);
  assert.equal(D.REGLAS_T5_ACT1.length, 2);
  assert.equal(caja.querySelector("[data-objetivo]").textContent, "Distinguir los tres tipos de título según el tipo de renta que dan.");
  assert.equal(caja.querySelector("[data-consigna]").textContent, "Lee la ficha. Elige qué tipo de renta da.");
  desmontar();
});
