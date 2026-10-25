import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T2 · P1 «De qué está hecha una cuenta» EN SECUENCIA (lote T2-7, #471).
 *
 *   ★ la forma: faltasDePieza → [] y las 8 pantallas de Watari en su orden;
 *   ★ los textos, letra por letra contra los paquetes de Near (se leen del
 *     archivo, no se copian aquí);
 *   ★ el Haz calificado: pista al primer error, lo correcto con su porqué al
 *     segundo, «Siguiente» liberado; y el acierto libera en el acto;
 *   ★ la bandera: apagada, la vista pinta EXACTAMENTE lo mismo que sin el
 *     cambio; encendida, la secuencia y no CuatroCapas;
 *   ✖ ROJO HONESTO: lo que falta de Near y de Watari, nombrado, hasta que
 *     llegue su delta T2-7. No se marca todo ni skip.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ─────────────── un navegador de mentira, ANTES de cargar React ─────────────── */
const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
const Observador = class { observe() {} unobserve() {} disconnect() {} };
w.matchMedia = (q) => ({ matches: /reduce/.test(q), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  ResizeObserver: Observador, IntersectionObserver: Observador, sessionStorage: w.sessionStorage, localStorage: w.localStorage,
  requestAnimationFrame: (f) => setTimeout(f, 0), cancelAnimationFrame: (h) => clearTimeout(h),
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const { renderToStaticMarkup } = await import("react-dom/server");
const act = React.act ?? (await import("react-dom/test-utils")).act;
const S = await import("../../components/secuencia/secuencia.js");
const { default: SecuenciaAprender } = await import("../../components/secuencia/SecuenciaAprender.jsx");
const { PIEZA_P1, PIEZAS_SECUENCIA_T2 } = await import("../../components/mecanicas/libros/t2/secuenciaP1.jsx");
const D = await import("../../data/contabilidadT2Secuencia.js");
const { AuthContext } = await import("../../auth/AuthProvider.jsx");
const h = React.createElement;

const NEAR = readFileSync("orquestador/conocimiento/paquetes/c-t2-2-near-lote.md", "utf8");
const NEAR_P1 = NEAR.slice(NEAR.indexOf("### P1 · `cu-a1-anatomia-de-una-cuenta`"), NEAR.indexOf("### P2 · `cu-a2-dos-familias`"));
const DELTA = readFileSync("orquestador/conocimiento/paquetes/c-t2-3-near-delta.md", "utf8");
const WATARI = readFileSync("orquestador/conocimiento/paquetes/c-t2-3-watari-figuras.md", "utf8");
const WATARI_P1 = WATARI.slice(WATARI.indexOf("## 1. De qué está hecha una cuenta"), WATARI.indexOf("## 2. Las dos familias"));

const pantalla = (id) => PIEZA_P1.pantallas.find((p) => p.id === id);

/* ─────────────── la forma ─────────────── */

test("★ P1 cumple la forma de la secuencia: faltasDePieza → []", () => {
  assert.equal(PIEZA_P1.id, "cu-a1-anatomia-de-una-cuenta");
  assert.deepEqual(S.faltasDePieza(PIEZA_P1), []);
  assert.deepEqual(PIEZAS_SECUENCIA_T2.map((p) => p.id), [PIEZA_P1.id]);
});

test("★ las 8 pantallas de Watari, en su orden y con su tipo (#470)", () => {
  assert.ok(NEAR_P1.length > 500 && WATARI_P1.length > 500, "no encontré P1 en los paquetes");
  const tipos = [...WATARI_P1.matchAll(/^\| \d \| [^|]+\| [^|]+\| (Apertura|Míralo|Haz|Cierre)/gm)].map((m) => ({ Apertura: "apertura", "Míralo": "miralo", Haz: "haz", Cierre: "cierre" })[m[1]]);
  assert.equal(tipos.length, 8);
  assert.deepEqual(PIEZA_P1.pantallas.map((p) => p.tipo), tipos);
});

/* ─────────────── los textos, letra por letra ─────────────── */

test("★ los textos de P1 son los de Near v2 + delta T2-3, letra por letra", () => {
  const fila = (n) => NEAR_P1.split("\n").find((l) => l.startsWith(`| ${n} |`));
  const celdas = (n) => fila(n).split(" | ").map((c) => c.trim());
  const ids = ["objetivo", "de-que-lado", "que-es-una-cuenta", "debe-y-haber", "movimientos", "el-saldo", "debe-no-es-subir"];
  ids.forEach((id, n) => {
    const p = pantalla(id);
    const texto = celdas(n)[3];
    assert.ok(texto.includes(p.apoyo), `P1·${n}: el apoyo no está letra por letra en Near v2:\n  «${p.apoyo}»`);
    /* El titular es el título de Near, salvo la apertura (pendiente: ver la prueba roja de Near). */
    if (n > 0) assert.equal(p.titular, celdas(n)[2], `P1·${n}: el titular no es el título de Near`);
  });
  /* Lo textual, con su marca y entero: la celda es exactamente «[textual]» + el apoyo. */
  const cuenta = pantalla("que-es-una-cuenta");
  assert.equal(cuenta.textual, true);
  assert.equal(celdas(2)[3], `**[textual]** ${cuenta.apoyo}`);
  /* Opciones, pistas y devoluciones. */
  for (const [id, clave] of [["de-que-lado", "lado"], ["el-saldo", "saldo"], ["debe-no-es-subir", "debeNoEsSubir"]]) {
    const n = ids.indexOf(id);
    assert.ok(celdas(n)[3].endsWith(`· opciones ${D.P1_TEXTOS[clave].opciones.map((o) => `«${o}»`).join(" / ")}`) || celdas(n)[3].endsWith(D.P1_TEXTOS[clave].opciones.map((o) => `«${o}»`).join(" / ")), `${id}: las opciones no son las de Near`);
  }
  for (const n of [5, 6]) {
    const t = D.P1_TEXTOS[n === 5 ? "saldo" : "debeNoEsSubir"];
    assert.ok(NEAR_P1.includes(`P1·${n}: pista «${t.pista}»`), `P1·${n}: la pista no es la de Near`);
    assert.ok(NEAR_P1.includes(`devolución «${t.porque}»`), `P1·${n}: la devolución no es la de Near`);
  }
  assert.ok(DELTA.includes(`«${D.P1_TEXTOS.saldo.consecuencia}»`), "P1·5: la frase de consecuencia no es la del delta T2-3");
  /* El cierre: la pregunta y la frase. */
  const cierre = NEAR_P1.split("\n").find((l) => l.startsWith("- **Cierre:**"));
  assert.ok(cierre.startsWith(`- **Cierre:** «${D.P1_TEXTOS.cierre.apoyo}» (`), "la pregunta de cierre no es la de Near");
  assert.ok(cierre.includes(`→ «${D.P1_TEXTOS.cierre.frase}» (`), "la frase de cierre no es la de Near");
  assert.equal(pantalla("cierre").apoyo, D.P1_TEXTOS.cierre.apoyo);
});

/* ─────────────── el Haz calificado, montado ─────────────── */

async function montarEn(idPantalla) {
  const s = PIEZA_P1.pantallas.findIndex((p) => p.id === idPantalla);
  const inicial = S.estadoInicial(PIEZAS_SECUENCIA_T2);
  sessionStorage.setItem("fae-secuencia:cuentas-debe-haber", JSON.stringify({ v: 1, ...inicial, s }));
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(SecuenciaAprender, { temaId: "cuentas-debe-haber", piezas: PIEZAS_SECUENCIA_T2, final: "hacer", onFinal() {} })); });
  const boton = (texto) => [...caja.querySelectorAll("figure button")].find((b) => (b.getAttribute("aria-label") || b.textContent).includes(texto));
  const clic = async (texto) => { await act(async () => { boton(texto).dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
  const siguiente = () => caja.querySelector("[data-siguiente]");
  const desmontar = async () => { await act(async () => { raiz.unmount(); }); caja.remove(); sessionStorage.clear(); };
  assert.equal(caja.querySelector("[data-pantalla]").getAttribute("data-pantalla"), String(s + 1));
  return { caja, clic, siguiente, desmontar };
}

for (const [id, clave, mala, buena] of [["el-saldo", "saldo", "En el haber", "En el debe"], ["debe-no-es-subir", "debeNoEsSubir", "Sube", "Baja"]]) {
  test(`★ Haz ${id}: pista al primer error, lo correcto con su porqué al segundo, «Siguiente» liberado`, async () => {
    const t = D.P1_TEXTOS[clave];
    const m = await montarEn(id);
    try {
      assert.equal(m.siguiente().getAttribute("aria-disabled"), "true", "antes de responder, «Siguiente» espera");
      assert.equal(m.caja.querySelector("[data-razon]").textContent, t.razon);
      await m.clic(mala);
      assert.equal(m.caja.querySelector("[data-mensaje]")?.getAttribute("data-mensaje"), "error");
      assert.ok(m.caja.textContent.includes(t.pista), "primer error: la pista");
      assert.ok(!m.caja.textContent.includes(t.porque), "primer error: todavía no el porqué");
      assert.equal(m.siguiente().getAttribute("aria-disabled"), "true", "primer error: «Siguiente» sigue esperando");
      if (clave === "saldo") assert.ok(m.caja.textContent.includes(t.consecuencia), "P1·5: la consecuencia del error, encima de la pista");
      await m.clic(mala);
      assert.ok(m.caja.textContent.includes(t.porque), "segundo error: el porqué");
      assert.ok(!m.caja.textContent.includes(t.pista), "segundo error: la pista se va");
      assert.equal(m.siguiente().getAttribute("aria-disabled"), null, "segundo error: «Siguiente» se libera");
      assert.equal(m.siguiente().textContent, "Siguiente");
    } finally { await m.desmontar(); }
  });

  test(`★ Haz ${id}: el acierto libera «Siguiente» en el acto, con «Correcto»`, async () => {
    const m = await montarEn(id);
    try {
      await m.clic(buena);
      assert.equal(m.caja.querySelector("[data-mensaje]")?.getAttribute("data-mensaje"), "acierto");
      assert.ok(m.caja.textContent.includes("Correcto"));
      assert.equal(m.siguiente().getAttribute("aria-disabled"), null);
    } finally { await m.desmontar(); }
  });
}

test("★ P1·1 (predicción): cualquier lado libera «Siguiente» y no hay pastilla", async () => {
  const m = await montarEn("de-que-lado");
  try {
    assert.equal(m.siguiente().getAttribute("aria-disabled"), "true");
    await m.clic("Derecha");
    assert.equal(m.caja.querySelector("[data-mensaje]"), null);
    assert.equal(m.siguiente().getAttribute("aria-disabled"), null);
  } finally { await m.desmontar(); }
});

/* ─────────────── la bandera ─────────────── */

const RUTA_VISTA = "src/components/CuentasDebeHaberView.jsx";
const VISTA = readFileSync(RUTA_VISTA, "utf8");
/* La receta para quitar el cambio: si una de estas piezas ya no aparece exactamente una vez, la prueba lo dice. */
const QUITAR = [
  ["import { useContext, useState } from \"react\";", "import { useState } from \"react\";"],
  [/\/\* T2-7: los Aprender en secuencia[^\n]*\n(import [^\n]*\n){4}/, ""],
  ["  const navegacion = useContext(NavigationContext);\n", ""],
  [/          \{\/\* En el mismo hueco[^\n]*\n          \{esAprender && T2_APRENDER_EN_SECUENCIA \? \(\n[^\n]*\n          \) : esAprender && \(\n/, "          {esAprender && (\n"],
];
function variante(fuente, cambios) {
  let s = fuente;
  for (const [de, a] of cambios) {
    const n = typeof de === "string" ? s.split(de).length - 1 : (s.match(new RegExp(de.source, "g")) || []).length;
    assert.equal(n, 1, `la receta de la bandera no encuentra una sola vez: ${String(de).slice(0, 60)}`);
    s = s.replace(de, a);
  }
  return s;
}
async function pintarVista(fuente, nombre, modo) {
  const ruta = `src/components/.${nombre}.tmp.jsx`;
  writeFileSync(ruta, fuente);
  try {
    const { default: Vista } = await import(`../../components/.${nombre}.tmp.jsx`);
    const err = console.error; console.error = () => {};
    /* Hay opciones barajadas: la misma semilla en cada pintura, para comparar lo mismo. */
    const azar = Math.random;
    let semilla = 20261024;
    Math.random = () => { semilla = (semilla * 1103515245 + 12345) % 2147483648; return semilla / 2147483648; };
    try {
      return renderToStaticMarkup(h(AuthContext.Provider, { value: { pedirCuenta() {}, usuario: null } }, h(Vista, { modo })));
    } finally { console.error = err; Math.random = azar; }
  } finally { rmSync(ruta, { force: true }); }
}

test("★ la bandera está APAGADA por defecto y vive en los datos de la célula", () => {
  assert.equal(D.T2_APRENDER_EN_SECUENCIA, false, "producción no cambia hasta que L la encienda");
  assert.match(readFileSync("src/data/contabilidadT2Secuencia.js", "utf8"), /^export const T2_APRENDER_EN_SECUENCIA = false;$/m, "se deshace en una línea");
});

test("★ con la bandera apagada, la vista pinta EXACTAMENTE lo que pinta sin el cambio (Aprender y Hacer)", async () => {
  const sinCambio = variante(VISTA, QUITAR);
  assert.ok(!/SecuenciaAprender|T2_APRENDER_EN_SECUENCIA|NavigationContext/.test(sinCambio), "la receta deja restos del cambio");
  /* El fondo de la materia es perezoso (lazy): la primera pintura no lo trae. Se calienta antes de comparar. */
  await pintarVista(VISTA, "t2sec-calienta", "aprender");
  await new Promise((r) => setTimeout(r, 100));
  for (const modo of ["aprender", "hacer", null]) {
    const ahora = await pintarVista(VISTA, `t2sec-ahora-${modo}`, modo);
    const antes = await pintarVista(sinCambio, `t2sec-antes-${modo}`, modo);
    assert.ok(ahora.length > 1000, `modo ${modo}: la vista no pintó nada`);
    const i = [...ahora].findIndex((c, k) => c !== antes[k]);
    assert.ok(ahora === antes, `modo ${modo}: la bandera apagada cambió lo que se pinta, desde el carácter ${i}:\n  ahora «${ahora.slice(Math.max(0, i - 80), i + 80)}»\n  antes «${antes.slice(Math.max(0, i - 80), i + 80)}»`);
  }
  const aprender = await pintarVista(VISTA, "t2sec-ahora-ap", "aprender");
  const { PIEZAS_APRENDER } = await import("../../data/contabilidadAprender.js");
  assert.equal((aprender.match(/<section data-pieza=/g) || []).length, PIEZAS_APRENDER.length, "todas las piezas viejas, en CuatroCapas");
  assert.ok(!aprender.includes("data-secuencia"));
});

test("★ con la bandera encendida, Aprender es la secuencia (P1) y no CuatroCapas", async () => {
  const encendida = variante(VISTA, [["{esAprender && T2_APRENDER_EN_SECUENCIA ? (", "{esAprender && true ? ("]]);
  const html = await pintarVista(encendida, "t2sec-encendida", "aprender");
  assert.ok(html.includes('data-secuencia="cuentas-debe-haber"'));
  assert.ok(html.includes(`data-pieza="${PIEZA_P1.id}"`));
  assert.equal((html.match(/<section data-pieza=/g) || []).length, 0);
});

/* ─────────────── ✖ ROJO HONESTO: lo que falta ─────────────── */

test("✖ PENDIENTE_DE_NEAR: titulares de ≤ 10 palabras de la apertura y el cierre, y la razón de cada Haz (T2-7)", () => {
  const deNear = D.PENDIENTES_P1.filter((p) => p.de === "Near");
  const provisionales = PIEZA_P1.pantallas.filter((p) => /PROVISIONAL/.test(`${p.titular} ${p.razon ?? ""}`)).map((p) => p.id);
  assert.deepEqual(
    deNear.map((p) => `${p.donde}: ${p.que}`), [],
    `Falta de Near (delta T2-7) — y hasta entonces va texto PROVISIONAL en: ${provisionales.join(", ")}`,
  );
  assert.deepEqual(provisionales, []);
});

test("✖ PENDIENTE_DE_WATARI: la reserva de figura de P1 baja a 206 px a 320 (tope #513)", () => {
  assert.ok(
    PIEZA_P1.altoFigura.a320 <= D.TOPE_ALTO_FIGURA.a320 && PIEZA_P1.altoFigura.a375 <= D.TOPE_ALTO_FIGURA.a375,
    `Falta de Watari: P1 reserva ${PIEZA_P1.altoFigura.a320} px a 320 (tope ${D.TOPE_ALTO_FIGURA.a320}) y ${PIEZA_P1.altoFigura.a375} a 375 (tope ${D.TOPE_ALTO_FIGURA.a375})`,
  );
});
