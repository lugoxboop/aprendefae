import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T2 «Las cuentas, el debe y el haber» EN SECUENCIA — las cinco piezas
 * (lotes T2-7 y T2-8, #471).
 *
 *   ★ la forma: faltasDePieza → [] en las cinco, con las pantallas y los
 *     tipos de Watari y el altoFigura de Watari T2-7;
 *   ★ los textos, letra por letra contra los paquetes de Near (se leen del
 *     archivo, no se copian aquí), con el objetivo completo (S1);
 *   ★ cada Haz calificado: ✕ con borde de 2 px y «no va aquí» en el nombre
 *     accesible y la pista al primer error; lo correcto con su porqué al
 *     segundo; ✓ y «correcto» con el acierto; «Siguiente» se libera;
 *   ★ <Veredicto /> no va dentro de la figura (hasta #536);
 *   ★ la bandera: apagada, la vista pinta EXACTAMENTE lo mismo que sin el
 *     cambio; encendida, la secuencia de las cinco y no CuatroCapas;
 *   ✖ ROJO HONESTO: lo que sigue faltando de Near, nombrado. No se marca todo
 *     ni skip.
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
const { PIEZAS_SECUENCIA_T2 } = await import("../../components/mecanicas/libros/t2/secuenciaT2.jsx");
const { mensajeDe } = await import("../../components/mecanicas/libros/t2/secuenciaComun.jsx");
const D = await import("../../data/contabilidadT2Secuencia.js");
const { AuthContext } = await import("../../auth/AuthProvider.jsx");
const h = React.createElement;

const leer = (n) => readFileSync(`orquestador/conocimiento/paquetes/${n}`, "utf8");
const NEAR2 = leer("c-t2-2-near-lote.md");
const NEAR3 = leer("c-t2-3-near-delta.md");
const NEAR7 = leer("c-t2-7-near-delta.md");
const WATARI3 = leer("c-t2-3-watari-figuras.md");
const WATARI7 = leer("c-t2-7-watari-figuras.md");
const TODO_NEAR = [NEAR2, NEAR3, NEAR7].join("\n");

const IDS = ["cu-a1-anatomia-de-una-cuenta", "cu-a2-dos-familias", "cu-a5-debe-y-haber", "cu-a3-partida-doble", "cu-a4-diario-y-mayor"];
const tramo = (texto, desde, hasta) => {
  const i = texto.indexOf(desde);
  assert.ok(i >= 0, `no encontré «${desde}» en el paquete`);
  const j = hasta ? texto.indexOf(hasta, i + desde.length) : -1;
  return texto.slice(i, j > 0 ? j : undefined);
};
const SEC_NEAR7 = IDS.map((id, n) => tramo(NEAR7, `## P${n + 1} · \`${id}\``, n < 4 ? `## P${n + 2} · ` : "## 6 ·"));
const SEC_NEAR2 = IDS.map((id, n) => tramo(NEAR2, `### P${n + 1} · \`${id}\``, n < 4 ? `### P${n + 2} · ` : "**S12 y S13**"));
const SEC_WATARI3 = IDS.map((id, n) => tramo(WATARI3, `## ${n + 1}. `, n < 4 ? `## ${n + 2}. ` : "## Delta de las tres Hacer"));
const filas = (sec) => sec.split("\n").filter((l) => /^\| \d+ \|/.test(l)).map((l) => l.split(" | ").map((c) => c.replace(/^\| |\s*\|$/g, "").trim()));
const sinMarcas = (c) => c.replace(/\*\*\[textual\]\*\* /g, "").replace(/\s*✎(\s*\([^)]*\))?/g, "");

/* ─────────────── la forma ─────────────── */

test("★ las cinco piezas, en el orden A1 → A2 → A5 → A3 → A4", () => {
  assert.deepEqual(PIEZAS_SECUENCIA_T2.map((p) => p.id), IDS);
});

for (const [n, pieza] of PIEZAS_SECUENCIA_T2.entries()) {
  const P = `P${n + 1}`;

  test(`★ ${P} cumple la forma de la secuencia: faltasDePieza → []`, () => {
    assert.deepEqual(S.faltasDePieza(pieza), []);
  });

  test(`★ ${P}: las pantallas y los tipos de Watari, y el número de Near T2-7`, () => {
    const tipos = filas(SEC_WATARI3[n]).map((c) => ({ Apertura: "apertura", "Míralo": "miralo", Cierre: "cierre" })[c[3]] ?? (c[3].startsWith("Haz") ? "haz" : c[3]));
    assert.deepEqual(pieza.pantallas.map((p) => p.tipo), tipos);
    assert.match(SEC_NEAR7[n], new RegExp(`· ${pieza.pantallas.length} pantallas`));
    /* Las predicciones son las «Haz (predicción…)» de Watari. */
    const pred = filas(SEC_WATARI3[n]).map((c) => c[3].startsWith("Haz (predicción"));
    assert.deepEqual(pieza.pantallas.map((p) => Boolean(p.prediccion)), pred);
  });

  test(`★ ${P}: altoFigura es el medido por Watari T2-7, bajo el tope`, () => {
    const m = WATARI7.match(new RegExp(`\`${pieza.id}\`[^\\n]*\`altoFigura: \\{ a320: (\\d+), a375: (\\d+) \\}\``));
    assert.ok(m, `no encontré el altoFigura de ${pieza.id} en el paquete de Watari`);
    assert.deepEqual(pieza.altoFigura, { a320: Number(m[1]), a375: Number(m[2]) });
    assert.ok(pieza.altoFigura.a320 <= D.TOPE_ALTO_FIGURA.a320 && pieza.altoFigura.a375 <= D.TOPE_ALTO_FIGURA.a375);
  });

  test(`★ ${P}: titular, apoyo y razón de cada pantalla, letra por letra contra Near T2-7`, () => {
    const fs = filas(SEC_NEAR7[n]);
    assert.equal(fs.length, pieza.pantallas.length);
    pieza.pantallas.forEach((p, k) => {
      const [num, , titular, apoyo, razon] = fs[k];
      assert.equal(Number(num), k);
      assert.equal(p.titular, sinMarcas(titular), `${P}·${k}: titular`);
      assert.ok(sinMarcas(apoyo).startsWith(p.apoyo), `${P}·${k}: el apoyo no está letra por letra:\n  «${p.apoyo}»\n  «${sinMarcas(apoyo)}»`);
      assert.equal(p.razon ?? "—", razon, `${P}·${k}: razón`);
      /* Lo textual: con su marca en el paquete, y el trozo marcado entero dentro del apoyo. */
      assert.equal(Boolean(p.textual), apoyo.includes("**[textual]**"), `${P}·${k}: textual`);
      if (p.textual) assert.ok(p.apoyo.endsWith(apoyo.split("**[textual]** ")[1]), `${P}·${k}: el texto del libro no está entero`);
    });
  });

  test(`★ ${P}: el objetivo conserva la oración completa de la v2 (S1)`, () => {
    const fila0 = filas(SEC_NEAR2[n])[0];
    assert.equal(fila0[2], "Objetivo");
    assert.equal(pieza.objetivo, fila0[3]);
  });
}

test("★ opciones, pistas, devoluciones, consecuencias y frases de cierre: letra por letra contra los paquetes", () => {
  const enNear = (t, donde) => assert.ok(TODO_NEAR.includes(t), `${donde}: «${t}» no está en los paquetes de Near`);
  const conConsecuencia = new Set();
  for (const [n, pieza] of PIEZAS_SECUENCIA_T2.entries()) {
    for (const [k, p] of pieza.pantallas.entries()) {
      const donde = `P${n + 1}·${k}`;
      /* Las opciones: en la fila de la v2, «a» / «b» (P3·7, en su línea «Opciones»). */
      if (p.opciones && p.tipo === "haz" && !["la-balanza"].includes(p.id)) {
        const fila = SEC_NEAR2[n].split("\n").find((l) => l.startsWith(`| ${k} |`)) ?? "";
        if (p.id === "por-que") {
          const linea = SEC_NEAR2[n].split("\n").find((l) => l.includes("Opciones, que difieren en una palabra"));
          assert.ok(linea.includes(`«${p.opciones[0]}» / «…${p.opciones[1].replace("Porque Maquinaria vive ", "")}» / «…${p.opciones[2].replace("Porque Maquinaria vive ", "")}»`), `${donde}: opciones`);
        } else {
          assert.ok(fila.includes(p.opciones.map((o) => `«${o}»`).join(" / ")), `${donde}: las opciones no son las de la v2`);
        }
      }
      if (!p.devolucion) continue;
      /* Cada ficha u opción en error: su pista, su porqué y su consecuencia. */
      const casos = p.fichas ? p.fichas.map((_, i) => ({ item: i, eleccion: null })) : (p.opciones ?? []).filter((o) => o !== p.buena).map((o) => ({ eleccion: o }));
      for (const caso of casos) {
        const d = p.devolucion({ ...S.HAZ_INICIAL, ...caso });
        if (d.pista !== null) enNear(d.pista, `${donde} pista`);
        const plantilla = d.porque.replace(/^(Bancos|Maquinaria|Obligaciones financieras|Ingresos por servicios|Gastos de administración y ventas|Costo de ventas)(?= (es real|mide))/, "{Cuenta}").replace(/^(Pasivos|Patrimonio|Ingresos)(?= vive a la derecha)/, "{Familia}");
        enNear(plantilla, `${donde} porqué`);
        if (d.consecuencia) {
          assert.ok(WATARI7.includes(`| ${d.consecuencia} |`), `${donde}: la consecuencia «${d.consecuencia}» no es una de las de una línea de Watari T2-7`);
          conConsecuencia.add(d.consecuencia);
        }
      }
    }
  }
  /* Las doce frases de Watari T2-7, o las que tienen pantalla: cada una usada una vez. */
  const doce = WATARI7.split("\n").filter((l) => /^\| Así|^\| Si lo/.test(l)).map((l) => l.split(" | ")[1].replace(/\s*\|$/, ""));
  assert.equal(doce.length, 12);
  assert.deepEqual([...conConsecuencia].sort(), [...doce].sort(), "cada frase de consecuencia de Watari va en su Haz");
  /* Los cierres con paso o con frase en la figura: la frase de la v2. */
  for (const [n, frase] of [[0, D.P1_TEXTOS.cierre.frase], [1, D.P2_TEXTOS.cierre.frase], [2, D.P3_TEXTOS.cierre.apoyo], [3, D.P4_TEXTOS.cierre.apoyo], [4, D.P5_TEXTOS.cierre.apoyo]]) {
    const cierre = SEC_NEAR2[n].split("\n").find((l) => l.startsWith("- **Cierre:**"));
    assert.ok(cierre.includes(`→ «${frase}» (`), `P${n + 1}: la frase de cierre no es la de la v2`);
  }
  /* P4·8 y P4·9 van con ene-04, no con ene-03 (delta T2-3 de Near; decisión de L). */
  assert.ok(NEAR3.includes(`| P4·8 | devolución |`) && NEAR3.includes(D.P4_TEXTOS.descuadran.porque));
});

/* ─────────────── montar una pantalla en la secuencia real ─────────────── */

const TEMA = "cuentas-debe-haber";
async function montarEn(p, idPantalla) {
  const s = PIEZAS_SECUENCIA_T2[p].pantallas.findIndex((x) => x.id === idPantalla);
  const inicial = S.estadoInicial(PIEZAS_SECUENCIA_T2);
  sessionStorage.setItem(`fae-secuencia:${TEMA}`, JSON.stringify({ v: 1, ...inicial, p, s }));
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(SecuenciaAprender, { temaId: TEMA, piezas: PIEZAS_SECUENCIA_T2, final: "hacer", onFinal() {} })); });
  const botones = () => [...caja.querySelectorAll("figure button")];
  /* Un control por su nombre: el nombre accesible (con o sin la palabra de la marca) o su texto. */
  const boton = (nombre) => botones().find((b) => {
    const a = b.getAttribute("aria-label");
    return a ? [nombre, `${nombre}, no va aquí`, `${nombre}, correcto`].includes(a) : b.textContent.trim() === nombre;
  });
  const clic = async (nombre) => {
    const b = boton(nombre);
    assert.ok(b, `no encontré el control «${nombre}» en la figura`);
    await act(async () => { b.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
  };
  const siguiente = () => caja.querySelector("[data-siguiente]");
  const estado = () => JSON.parse(sessionStorage.getItem(`fae-secuencia:${TEMA}`)).estados[`${PIEZAS_SECUENCIA_T2[p].id}/${idPantalla}`];
  const desmontar = async () => { await act(async () => { raiz.unmount(); }); caja.remove(); sessionStorage.clear(); };
  assert.equal(caja.querySelector("[data-pantalla]").getAttribute("data-pantalla"), String(s + 1));
  assert.equal(caja.querySelector("[data-pieza]").getAttribute("data-pieza"), PIEZAS_SECUENCIA_T2[p].id);
  return { caja, boton, clic, siguiente, estado, desmontar };
}

const bordeDe = (b) => b.style.border || `${b.style.borderWidth} ${b.style.borderStyle}`;
function marcaEs(b, marca, nombre) {
  assert.equal(b.getAttribute("data-marca"), marca, `«${nombre}»: data-marca`);
  assert.match(bordeDe(b), /^2px solid/, `«${nombre}»: el borde de la marca es de 2 px`);
  assert.equal(b.getAttribute("aria-label"), marca === "mal" ? `${nombre}, no va aquí` : `${nombre}, correcto`, `«${nombre}»: la palabra va en el nombre accesible`);
  assert.ok(b.querySelector("svg[aria-hidden='true'] path"), `«${nombre}»: el ícono ✓/✕ (forma, no solo color)`);
}

/* Los Haz calificados: [pieza, pantalla]. */
const HAZ = PIEZAS_SECUENCIA_T2.flatMap((pz, p) => pz.pantallas.filter((x) => x.tipo === "haz" && !x.prediccion).map((x) => [p, x]));
const etiquetaDestino = (d) => d.replace("|", ", ");

test("★ hay Haz calificado en las cinco, y todos se juegan abajo", () => {
  assert.deepEqual([...new Set(HAZ.map(([p]) => p))], [0, 1, 2, 3, 4]);
  for (const [, x] of HAZ) assert.ok(x.resuelta === S.hazResuelto || (x.fichas && x.resuelta.name === "colaResuelta"), `${x.id}: resuelta es hazResuelto (o hazResuelto en cada ficha)`);
});

for (const [p, x] of HAZ) {
  const P = `P${p + 1}·${PIEZAS_SECUENCIA_T2[p].pantallas.indexOf(x)}`;
  const malas = x.fichas ? null : x.opciones.filter((o) => o !== x.buena);

  test(`★ Haz ${P} ${x.id}: ✕ y la pista al primer error, lo correcto con su porqué al segundo, «Siguiente» liberado`, async () => {
    const m = await montarEn(p, x.id);
    try {
      assert.equal(m.siguiente().getAttribute("aria-disabled"), "true", "antes de responder, «Siguiente» espera");
      assert.equal(m.caja.querySelector("[data-razon]").textContent, x.razon);
      const mala = x.fichas ? etiquetaDestino(x.malaDe(0)) : malas[0];
      const buena = x.fichas ? etiquetaDestino(x.buenoDe(0)) : x.buena;
      await m.clic(mala);
      marcaEs(m.boton(mala), "mal", mala);
      const uno = mensajeDe(x, m.estado());
      assert.equal(uno.palabra, "No va aquí");
      assert.equal(uno.porque, undefined, "primer error: todavía no el porqué");
      /* La única sin pista es la que Near todavía debe (rojo honesto abajo): aquí se exige que juegue igual. */
      if (D.PENDIENTES_T2.some((f) => f.donde.startsWith(`${P} `) && /pista/.test(f.que))) assert.equal(uno.pista, null);
      else assert.ok(uno.pista, `primer error: la pista (${P})`);
      assert.equal(m.siguiente().getAttribute("aria-disabled"), "true", "primer error: «Siguiente» sigue esperando");
      assert.equal(m.caja.querySelector("figure [data-mensaje]"), null, "<Veredicto /> no va dentro de la figura (#536)");
      await m.clic(mala);
      const dos = mensajeDe(x, m.estado());
      assert.ok(dos.porque, "segundo error: el porqué");
      assert.equal(dos.pista, undefined, "segundo error: la pista se va");
      marcaEs(m.boton(mala), "mal", mala);
      marcaEs(m.boton(buena), "verdad", buena);
      /* Varias fichas: las demás se colocan bien y entonces se libera. */
      if (x.fichas) {
        assert.equal(m.siguiente().getAttribute("aria-disabled"), "true", "quedan fichas: «Siguiente» espera");
        for (let i = 1; i < x.fichas.length; i++) await m.clic(etiquetaDestino(x.buenoDe(i)));
      }
      assert.equal(m.siguiente().getAttribute("aria-disabled"), null, "«Siguiente» se libera");
      assert.equal(m.siguiente().textContent, "Siguiente");
      assert.equal(m.caja.querySelector("figure [data-mensaje]"), null);
    } finally { await m.desmontar(); }
  });

  test(`★ Haz ${P} ${x.id}: el acierto lleva ✓, «correcto» y libera «Siguiente»`, async () => {
    const m = await montarEn(p, x.id);
    try {
      const n = x.fichas ? x.fichas.length : 1;
      for (let i = 0; i < n; i++) {
        const buena = x.fichas ? etiquetaDestino(x.buenoDe(i)) : x.buena;
        await m.clic(buena);
        marcaEs(m.boton(buena), "bien", buena);
        assert.deepEqual(mensajeDe(x, m.estado()), { palabra: "Correcto" });
      }
      assert.equal(m.siguiente().getAttribute("aria-disabled"), null);
    } finally { await m.desmontar(); }
  });
}

for (const [p, pz] of PIEZAS_SECUENCIA_T2.entries()) {
  const x = pz.pantallas.find((y) => y.prediccion);
  test(`★ P${p + 1}·1 (predicción): cualquier respuesta libera «Siguiente», sin marca ni pastilla`, async () => {
    const m = await montarEn(p, x.id);
    try {
      assert.equal(m.siguiente().getAttribute("aria-disabled"), "true");
      const b = [...m.caja.querySelectorAll("figure button")].at(-1);
      await act(async () => { b.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
      assert.equal(m.caja.querySelector("[data-marca], [data-mensaje]"), null);
      assert.equal(m.siguiente().getAttribute("aria-disabled"), null);
    } finally { await m.desmontar(); }
  });
}

test("★ el contador es Pulsos del kit, y SecuenciaAprender / <Veredicto /> no se copian ni se envuelven", async () => {
  const m = await montarEn(0, "objetivo");
  try {
    assert.ok(m.caja.querySelector("[data-contador] [data-avance]"), "el contador de pantallas es Pulsos");
    assert.match(m.caja.querySelector("[data-contador-pieza]").textContent, /Pieza 1 de 5/);
  } finally { await m.desmontar(); }
  for (const f of ["Comun", "P1", "P2", "P3", "P4", "P5", "T2"]) {
    const src = readFileSync(`src/components/mecanicas/libros/t2/secuencia${f}.jsx`, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    assert.ok(!/function (SecuenciaAprender|Pulsos|Veredicto)\b|<SecuenciaAprender|<Veredicto/.test(src), `secuencia${f}.jsx copia, envuelve o pinta el compartido`);
  }
  assert.match(readFileSync("src/components/CuentasDebeHaberView.jsx", "utf8"), /^import SecuenciaAprender from "\.\/secuencia\/SecuenciaAprender\.jsx";$/m);
});

test("★ P4·8 y P4·9 van con ene-04 (1 contra 2, $4.800), aunque la maqueta diga ene-03", async () => {
  for (const id of ["muchas-cuentas", "cierre"]) {
    const m = await montarEn(3, id);
    try {
      const fig = m.caja.querySelector("figure").textContent;
      assert.ok(fig.includes("Flota y equipo de transporte") && fig.includes("Letras por pagar"), `${id}: el asiento de ene-04`);
      assert.ok(!fig.includes("Terrenos"), `${id}: no ene-03`);
      if (id === "cierre") assert.equal((fig.match(/\$4\.800/g) || []).length, 3, "los dos totales llegan a $4.800");
    } finally { await m.desmontar(); }
  }
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

test("★ con la bandera encendida, Aprender es la secuencia de las cinco y no CuatroCapas", async () => {
  const encendida = variante(VISTA, [["{esAprender && T2_APRENDER_EN_SECUENCIA ? (", "{esAprender && true ? ("]]);
  const html = await pintarVista(encendida, "t2sec-encendida", "aprender");
  assert.ok(html.includes(`data-secuencia="${TEMA}"`));
  assert.ok(html.includes(`data-pieza="${IDS[0]}"`));
  assert.ok(html.includes("Pieza 1 de 5"));
  assert.equal((html.match(/<section data-pieza=/g) || []).length, 0);
});

/* ─────────────── ✖ ROJO HONESTO: lo que falta ─────────────── */

test("✖ PENDIENTE_DE_WATARI: lo que la figura medida todavía no resuelve", () => {
  assert.deepEqual(D.PENDIENTES_T2.filter((p) => p.de === "Watari").map((p) => `${p.donde}: ${p.que}`), [], "Falta de Watari");
});

test("✖ PENDIENTE_DE_NEAR: lo que los paquetes todavía no traen", () => {
  const deNear = D.PENDIENTES_T2.filter((p) => p.de === "Near");
  /* Y lo que se ve en la pieza mientras tanto: P3·7 sin pista, P2·5 sin el ejemplo de Ingresos. */
  const porQue = PIEZAS_SECUENCIA_T2[2].pantallas.find((x) => x.id === "por-que");
  const sinPista = porQue.devolucion({ ...S.HAZ_INICIAL, eleccion: porQue.opciones[0] }).pista === null;
  const sinEjemplo = D.P2_TEXTOS.tresNominales.tarjetas.some((t) => !t.ejemplo);
  assert.deepEqual(deNear.map((p) => `${p.donde}: ${p.que}`), [], `Falta de Near${sinPista ? " — P3·7 juega sin pista al primer error" : ""}${sinEjemplo ? " — P2·5 abre Ingresos sin ejemplo" : ""}`);
});
