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
 *   ★ la devolución va en la BANDA bajo la figura (#536, #590): un solo
 *     <Veredicto />, fuera de la figura, en el sitio del apoyo; consecuencia
 *     y pista al primer error, solo el porqué al segundo, solo la palabra con
 *     el acierto; el pie de los cinco cierres, visible;
 *   ★ la bandera: ENCENDIDA (T2-13), Aprender es la secuencia de las cinco y
 *     no CuatroCapas; la página vieja sigue en el código, y con la bandera
 *     apagada la vista pinta EXACTAMENTE lo mismo que sin el cambio;
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
const NEAR8 = leer("c-t2-8-near-textos.md");
const WATARI3 = leer("c-t2-3-watari-figuras.md");
const WATARI7 = leer("c-t2-7-watari-figuras.md");
const TODO_NEAR = [NEAR2, NEAR3, NEAR7, NEAR8].join("\n");
/* La auditoría T2-9 de Mello: sus textos entran letra por letra (lote T2-10). */
const MELLO9 = leer("c-t2-9-mello-auditoria.md");
/* Una cita «…» de la auditoría, por lo que la precede en la misma línea. */
const citaMello = (antes) => {
  const linea = MELLO9.split("\n").find((l) => l.includes(antes));
  assert.ok(linea, `no encontré «${antes}» en la auditoría de Mello`);
  const m = linea.slice(linea.indexOf(antes) + antes.length).match(/«([^»]+)»/);
  assert.ok(m, `no hay cita después de «${antes}»`);
  return m[1];
};
/* Las oraciones que Mello manda quitar de un apoyo (S2), por pantalla. */
const RECORTES_MELLO = { "P3·3": citaMello("Se quita la primera oración, "), "P5·5": citaMello("el apoyo termina con ") };
/* Near T2-8: la tabla de tres textos, por pantalla (columna «texto», letra por letra). */
const TEXTO_NEAR8 = (pantalla) => {
  const fila = NEAR8.split("\n").find((l) => l.startsWith(`| ${pantalla} |`));
  assert.ok(fila, `no encontré ${pantalla} en c-t2-8-near-textos.md`);
  return fila.split(" | ")[2].trim();
};

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

  test(`★ ${P}: altoFigura es el medido por Watari T2-7 (o el que fijó L en T2-13), bajo el tope`, () => {
    const m = WATARI7.match(new RegExp(`\`${pieza.id}\`[^\\n]*\`altoFigura: \\{ a320: (\\d+), a375: (\\d+) \\}\``));
    assert.ok(m, `no encontré el altoFigura de ${pieza.id} en el paquete de Watari`);
    /* L, T2-13 (#471): P2 sube al alto medido de P2·7 con fichas en error. */
    const DECIDIDO_POR_L = { "cu-a2-dos-familias": { a320: 200, a375: 185 } };
    assert.deepEqual(pieza.altoFigura, DECIDIDO_POR_L[pieza.id] ?? { a320: Number(m[1]), a375: Number(m[2]) });
    assert.ok(pieza.altoFigura.a320 <= D.TOPE_ALTO_FIGURA.a320 && pieza.altoFigura.a375 <= D.TOPE_ALTO_FIGURA.a375);
  });

  test(`★ ${P}: titular, apoyo y razón de cada pantalla, letra por letra contra Near T2-7`, () => {
    const fs = filas(SEC_NEAR7[n]);
    assert.equal(fs.length, pieza.pantallas.length);
    pieza.pantallas.forEach((p, k) => {
      const [num, , titular, apoyo, razon] = fs[k];
      assert.equal(Number(num), k);
      assert.equal(p.titular, sinMarcas(titular), `${P}·${k}: titular`);
      /* Si Mello manda quitar una oración (T2-9, S2), se compara contra el apoyo de Near sin ella, y ya no está. */
      const recorte = RECORTES_MELLO[`${P}·${k}`];
      const esperado = recorte ? sinMarcas(apoyo).replace(recorte, "").replace(/\s{2,}/g, " ").trim() : sinMarcas(apoyo);
      if (recorte) {
        assert.ok(sinMarcas(apoyo).includes(recorte), `${P}·${k}: la oración que quita Mello está en Near`);
        assert.ok(!p.apoyo.includes(recorte), `${P}·${k}: sigue la oración que Mello manda quitar: «${recorte}»`);
        assert.ok(S.palabras(p.titular) + S.palabras(p.apoyo) + S.palabras(p.razon) <= 40, `${P}·${k}: la pantalla pasa de 40 palabras (S2)`);
      }
      assert.ok(esperado.startsWith(p.apoyo), `${P}·${k}: el apoyo no está letra por letra:\n  «${p.apoyo}»\n  «${esperado}»`);
      /* El cierre lleva en la razón el pie de página (lote B, abajo); Near no le da razón. */
      if (p.tipo === "cierre") assert.equal(razon, "—", `${P}·${k}: razón de Near en el cierre`);
      else assert.equal(p.razon ?? "—", razon, `${P}·${k}: razón`);
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

/* Los textos de la devolución de un Haz, por caso: pista y consecuencia al primer error, porqué al segundo. */
const textosDe = (p, caso) => ({
  ...p.devolucion({ ...S.HAZ_INICIAL, ...caso, intentos: 1, ultimo: "error" }),
  porque: p.devolucion({ ...S.HAZ_INICIAL, ...caso, intentos: 2, ultimo: "error" }).porque,
});

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
        const d = textosDe(p, caso);
        if (d.pista !== null) enNear(d.pista, `${donde} pista`);
        const plantilla = d.porque.replace(/^(Bancos|Maquinaria|Obligaciones financieras|Ingresos por servicios|Gastos de administración y ventas|Costo de ventas)(?= (es real|mide))/, "{Cuenta}").replace(/^(Pasivos|Patrimonio|Ingresos)(?= vive a la derecha)/, "{Familia}");
        /* P3·7 «…vive a la derecha»: su porqué es el de Mello T2-9 (S6), no uno de Near. */
        if (p.id === "por-que" && caso.eleccion === p.opciones[0]) assert.equal(d.porque, citaMello("Porqué para «a la derecha»: "), `${donde} porqué de Mello`);
        else enNear(plantilla, `${donde} porqué`);
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
async function montarEn(p, idPantalla, { recargar = false } = {}) {
  const s = PIEZAS_SECUENCIA_T2[p].pantallas.findIndex((x) => x.id === idPantalla);
  const inicial = S.estadoInicial(PIEZAS_SECUENCIA_T2);
  /* `recargar`: se monta con lo que ya hay guardado, como al recargar la página. */
  if (!recargar) sessionStorage.setItem(`fae-secuencia:${TEMA}`, JSON.stringify({ v: 1, ...inicial, p, s }));
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
  const desmontar = async ({ conservar = false } = {}) => { await act(async () => { raiz.unmount(); }); caja.remove(); if (!conservar) sessionStorage.clear(); };
  const rerender = async () => { await act(async () => { raiz.render(h(SecuenciaAprender, { temaId: TEMA, piezas: PIEZAS_SECUENCIA_T2, final: "hacer", onFinal() {} })); }); };
  assert.equal(caja.querySelector("[data-pantalla]").getAttribute("data-pantalla"), String(s + 1));
  assert.equal(caja.querySelector("[data-pieza]").getAttribute("data-pieza"), PIEZAS_SECUENCIA_T2[p].id);
  return { caja, boton, clic, siguiente, estado, desmontar, rerender };
}

const bordeDe = (b) => b.style.border || `${b.style.borderWidth} ${b.style.borderStyle}`;
function marcaEs(b, marca, nombre) {
  assert.equal(b.getAttribute("data-marca"), marca, `«${nombre}»: data-marca`);
  assert.match(bordeDe(b), /^2px solid/, `«${nombre}»: el borde de la marca es de 2 px`);
  assert.equal(b.getAttribute("aria-label"), marca === "mal" ? `${nombre}, no va aquí` : `${nombre}, correcto`, `«${nombre}»: la palabra va en el nombre accesible`);
  assert.ok(b.querySelector("svg[aria-hidden='true'] path"), `«${nombre}»: el ícono ✓/✕ (forma, no solo color)`);
}

/*
 * La banda (#590): un solo <Veredicto /> en toda la pantalla, fuera de la
 * figura y después de ella, dentro de [data-devolucion]; el apoyo se retira.
 */
function bandaEs(m, palabra, { dice = [], calla = [] } = {}) {
  const veredictos = m.caja.querySelectorAll("[data-mensaje]");
  assert.equal(veredictos.length, 1, "un solo veredicto en la pantalla");
  assert.equal(veredictos[0].closest("figure"), null, "el veredicto no va dentro de la figura");
  const bandas = m.caja.querySelectorAll("[data-devolucion]");
  assert.equal(bandas.length, 1, "una sola banda de devolución");
  const banda = bandas[0];
  assert.ok(banda.contains(veredictos[0]), "el veredicto va en la banda");
  assert.equal(banda.closest("figure"), null, "la banda va fuera de la figura");
  assert.ok(m.caja.querySelector("figure").compareDocumentPosition(banda) & w.Node.DOCUMENT_POSITION_FOLLOWING, "la banda va bajo la figura");
  assert.equal(m.caja.querySelector("[data-apoyo]"), null, "con la devolución, el apoyo se retira");
  assert.match(veredictos[0].textContent, new RegExp(palabra));
  for (const t of dice) assert.ok(banda.textContent.includes(t), `la banda dice «${t}»`);
  for (const t of calla) assert.ok(!banda.textContent.includes(t), `la banda ya no dice «${t}»`);
  return banda;
}

/* Los Haz calificados: [pieza, pantalla]. */
const HAZ = PIEZAS_SECUENCIA_T2.flatMap((pz, p) => pz.pantallas.filter((x) => x.tipo === "haz" && !x.prediccion).map((x) => [p, x]));
const etiquetaDestino = (d) => d.replace("|", ", ");
/* El orden de las fichas de una cola: el barajado que guardó la pantalla, o el de la lista. */
const ordenDeFichas = (m, x) => m.estado()?.orden ?? [...x.fichas.keys()];

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
      /* Las fichas, en el orden en que salen (P2·7 las baraja: lote A). */
      const orden = x.fichas ? ordenDeFichas(m, x) : null;
      const mala = x.fichas ? etiquetaDestino(x.malaDe(orden[0])) : malas[0];
      const buena = x.fichas ? etiquetaDestino(x.buenoDe(orden[0])) : x.buena;
      await m.clic(mala);
      marcaEs(m.boton(mala), "mal", mala);
      const uno = mensajeDe(x, m.estado());
      assert.equal(uno.palabra, "No va aquí");
      assert.equal(uno.porque, undefined, "primer error: todavía no el porqué");
      /* La única sin pista es la que Near todavía debe (rojo honesto abajo): aquí se exige que juegue igual. */
      if (D.PENDIENTES_T2.some((f) => f.donde.startsWith(`${P} `) && /pista/.test(f.que))) assert.equal(uno.pista, null);
      else assert.ok(uno.pista, `primer error: la pista (${P})`);
      assert.equal(m.siguiente().getAttribute("aria-disabled"), "true", "primer error: «Siguiente» sigue esperando");
      assert.ok(m.caja.querySelector("[data-apoyo]") === null, "primer error: el apoyo deja la banda");
      bandaEs(m, "No va aquí", { dice: [uno.pista, uno.consecuencia].filter(Boolean) });
      assert.equal(m.caja.querySelector("[data-consecuencia]")?.textContent ?? null, uno.consecuencia ?? null, "primer error: la consecuencia, si la hay");
      await m.clic(mala);
      const dos = mensajeDe(x, m.estado());
      assert.ok(dos.porque, "segundo error: el porqué");
      assert.equal(dos.pista, undefined, "segundo error: la pista se va");
      bandaEs(m, "No va aquí", { dice: [dos.porque], calla: [uno.pista, uno.consecuencia].filter(Boolean) });
      assert.equal(m.caja.querySelector("[data-consecuencia]"), null, "segundo error: sin consecuencia");
      marcaEs(m.boton(mala), "mal", mala);
      marcaEs(m.boton(buena), "verdad", buena);
      /* Varias fichas: las demás se colocan bien y entonces se libera. */
      if (x.fichas) {
        assert.equal(m.siguiente().getAttribute("aria-disabled"), "true", "quedan fichas: «Siguiente» espera");
        for (const i of orden.slice(1)) await m.clic(etiquetaDestino(x.buenoDe(i)));
      }
      assert.equal(m.siguiente().getAttribute("aria-disabled"), null, "«Siguiente» se libera");
      assert.equal(m.siguiente().textContent, "Siguiente");
      assert.equal(m.caja.querySelector("figure [data-mensaje]"), null);
      assert.ok(m.caja.querySelectorAll("[data-mensaje]").length <= 1);
    } finally { await m.desmontar(); }
  });

  test(`★ Haz ${P} ${x.id}: el acierto lleva ✓, «correcto» y libera «Siguiente»`, async () => {
    const m = await montarEn(p, x.id);
    try {
      for (const i of x.fichas ? ordenDeFichas(m, x) : [0]) {
        const buena = x.fichas ? etiquetaDestino(x.buenoDe(i)) : x.buena;
        await m.clic(buena);
        marcaEs(m.boton(buena), "bien", buena);
        assert.deepEqual(mensajeDe(x, m.estado()), { palabra: "Correcto" });
        bandaEs(m, "Correcto");
        assert.equal(m.caja.querySelector("[data-consecuencia]"), null, "el acierto no lleva consecuencia");
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

/* ─────────────── lote T2-10: la auditoría T2-9 de Mello ─────────────── */

/* Math.random con semilla, solo mientras corre `f`. */
async function conSemilla(semilla, f) {
  const azar = Math.random;
  let x = semilla;
  Math.random = () => { x = (x * 1103515245 + 12345) % 2147483648; return x / 2147483648; };
  try { return await f(); } finally { Math.random = azar; }
}
/* Los nombres de los controles de la figura, en el orden en que se ven (sin la palabra de la marca). */
const nombresEnFigura = (m) => [...m.caja.querySelectorAll("figure button")].map((b) => (b.getAttribute("aria-label") ?? b.textContent.trim()).replace(/, (no va aquí|correcto)$/, ""));
const pantallaDe = (p, id) => PIEZAS_SECUENCIA_T2[p].pantallas.find((x) => x.id === id);
const numeroDe = (p, id) => `P${p + 1}·${PIEZAS_SECUENCIA_T2[p].pantallas.findIndex((x) => x.id === id)}`;

/* Lote A: las nueve pantallas que se barajan, y lo que se baraja en cada una. */
const BARAJADAS = [
  [0, "debe-no-es-subir"], [1, "gasto-o-costo"], [1, "se-cierra-igual"], [1, "una-sola-pregunta"],
  [2, "la-trampa"], [2, "por-que"], [3, "un-pago-dos-bajas"], [3, "muchas-cuentas"], [4, "dos-preguntas"],
];
const itemsDe = (x) => x.fichas ?? x.opciones;
/* Lo que se ve barajado: las opciones en la figura o, en P2·7, la ficha que sale. */
const vistoDe = (m, x) => (x.fichas ? [m.caja.querySelector("[data-ficha-actual]")?.textContent ?? null] : nombresEnFigura(m).filter((t) => x.opciones.includes(t)));

test("★ lote A: se barajan justo las nueve pantallas de la tabla de Mello (§1)", () => {
  const tabla = tramo(MELLO9, "### Lote A", "**No se barajan**").split("\n").filter((l) => /^\| P\d·\d \|/.test(l)).map((l) => l.split(" | ")[0].replace("| ", ""));
  assert.deepEqual(BARAJADAS.map(([p, id]) => numeroDe(p, id)), tabla);
});

for (const [p, id] of BARAJADAS) {
  const x = pantallaDe(p, id);
  const P = numeroDe(p, id);
  test(`★ lote A · ${P} ${id}: baraja una vez; el mismo orden con re-render, error y recarga; otro orden en otra visita`, async () => {
    const n = itemsDe(x).length;
    const m = await conSemilla(11, () => montarEn(p, id));
    let orden;
    try {
      orden = m.estado().orden;
      assert.ok(Array.isArray(orden) && orden.length === n && [...orden].sort().join() === [...Array(n).keys()].join(), `${P}: el orden se guarda en el estado de la pantalla`);
      const visto = vistoDe(m, x);
      assert.deepEqual(visto, x.fichas ? [x.fichas[orden[0]]] : orden.map((i) => x.opciones[i]), `${P}: la figura pinta el orden guardado`);
      /* Re-render, con otro azar: no se vuelve a barajar. */
      await conSemilla(97, () => m.rerender());
      assert.deepEqual(m.estado().orden, orden, `${P}: el re-render no baraja`);
      assert.deepEqual(vistoDe(m, x), visto);
      /* Un error: tampoco. */
      await m.clic(x.fichas ? etiquetaDestino(x.malaDe(orden[0])) : x.opciones.find((o) => o !== x.buena));
      assert.deepEqual(m.estado().orden, orden, `${P}: el error no baraja`);
      assert.deepEqual(vistoDe(m, x), visto);
      /* P2·7: acertada la primera, sale la segunda del orden barajado. */
      if (x.fichas) {
        await m.clic(etiquetaDestino(x.buenoDe(orden[0])));
        assert.deepEqual(vistoDe(m, x), [x.fichas[orden[1]]], `${P}: la segunda ficha es la segunda del orden`);
      }
    } finally { await m.desmontar({ conservar: true }); }
    /* Recargar: se monta con lo guardado y otro azar, y el orden es el mismo. */
    const r = await conSemilla(5, () => montarEn(p, id, { recargar: true }));
    try {
      assert.deepEqual(r.estado().orden, orden, `${P}: recargar no baraja`);
      if (!x.fichas) assert.deepEqual(vistoDe(r, x), orden.map((i) => x.opciones[i]));
    } finally { await r.desmontar(); }
    /* Otra visita (estado nuevo), otra semilla: sale otro orden. */
    const ordenes = new Set();
    for (let semilla = 1; semilla <= 12 && ordenes.size < 2; semilla++) {
      const v = await conSemilla(semilla * 7919, () => montarEn(p, id));
      try { ordenes.add(JSON.stringify(v.estado().orden)); } finally { await v.desmontar(); }
    }
    assert.ok(ordenes.size > 1, `${P}: con otra semilla no cambió nunca el orden: no se baraja`);
  });
}

/* Lo que NO se baraja, porque el orden es la lección: debe/haber, casas, platillos, «Sigue»/«Vuelve a cero» y las predicciones. */
const FIJAS = [
  [0, "el-saldo", D.P1_TEXTOS.saldo.opciones],
  [2, "donde-vive", ["Activo", "Pasivo + Patrimonio"]],
  [3, "la-balanza", ["Activo", "Pasivo + Patrimonio"]],
  [1, "una-sola-pregunta", D.P2_TEXTOS.unaPregunta.cajones],
  [4, "mayorizar", null],
  [3, "segunda-regla", null],
  ...PIEZAS_SECUENCIA_T2.map((pz, p) => [p, pz.pantallas.find((y) => y.prediccion).id, null]),
];
for (const [p, id, fijo] of FIJAS) {
  const P = numeroDe(p, id);
  test(`★ lote A · ${P} ${id}: lo que enseña con su orden NO se baraja`, async () => {
    const vistos = [];
    for (const semilla of [3, 4242, 90001]) {
      const m = await conSemilla(semilla, () => montarEn(p, id));
      try {
        /* P2·7 baraja las cuentas, no los cajones: solo se mira el orden de los cajones. */
        const nombres = nombresEnFigura(m).filter((t) => !fijo || fijo.includes(t));
        vistos.push(nombres);
        if (id !== "una-sola-pregunta") assert.equal(m.estado()?.orden, undefined, `${P}: no guarda orden barajado`);
        if (fijo) assert.deepEqual(nombres, fijo, `${P}: el orden fijo`);
      } finally { await m.desmontar(); }
    }
    assert.deepEqual(vistos[1], vistos[0]);
    assert.deepEqual(vistos[2], vistos[0]);
  });
}

/* Lote B: el pie de cada cierre, de Near T2-10 (c-t2-10-near-textos.md §1), letra por letra. */
const NEAR10 = leer("c-t2-10-near-textos.md");
const PIE_NEAR10 = (n) => {
  const fila = NEAR10.split("\n").find((l) => l.startsWith(`| P${n} | `));
  assert.ok(fila, `no encontré P${n} en c-t2-10-near-textos.md`);
  return fila.split(" | ")[1].trim();
};

test("★ lote B · el pie «Basado en el libro…» de Near va en la razón de los cinco cierres, una vez por pieza", () => {
  for (const [n, pieza] of PIEZAS_SECUENCIA_T2.entries()) {
    const pie = PIE_NEAR10(n + 1);
    assert.match(pie, /^Basado en el libro(, pp\. [\d ,y-]+)?\.$/, `P${n + 1}: forma del pie`);
    assert.equal(D[`P${n + 1}_TEXTOS`].cierre.pie, pie, `P${n + 1}: el pie de Near, letra por letra`);
    assert.equal(pieza.pantallas.at(-1).razon, pie, `P${n + 1}: el pie va en la razón del cierre`);
    assert.equal(pieza.pantallas.filter((y) => /Basado en el libro/.test(y.razon ?? "")).length, 1, `P${n + 1}: una vez por pieza`);
  }
});

test("★ lote B · el pie se VE en los cinco cierres: la cáscara lo pinta en la zona de razón (#590)", async () => {
  for (const [n, pieza] of PIEZAS_SECUENCIA_T2.entries()) {
    const m = await montarEn(n, "cierre");
    try {
      const pie = D[`P${n + 1}_TEXTOS`].cierre.pie;
      /* P1 tiene un paso: antes de darlo, la zona dice «Paso 1 de 1»; se da y sale el pie. */
      if ((pieza.pantallas.at(-1).pasos | 0) > 0) await act(async () => { m.siguiente().dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
      assert.equal(m.caja.querySelector("[data-razon]").textContent, pie, `P${n + 1}: el pie en la zona de razón`);
      assert.equal(m.caja.querySelector("[data-razon]").closest("figure"), null);
    } finally { await m.desmontar(); }
  }
});

test("★ P1: las cifras de Caja salen de DE_QUE_ESTA_HECHA.ejemplo, y las del cierre, de contabilidadT2Secuencia.js", async () => {
  const { DE_QUE_ESTA_HECHA } = await import("../../data/contabilidadAprender.js");
  const ej = DE_QUE_ESTA_HECHA.ejemplo;
  const cuenta = D.P1_TEXTOS.cierre.cuenta;
  assert.deepEqual(cuenta, { debe: 50, haber: 30 });
  assert.ok(D.P1_TEXTOS.cierre.apoyo.includes(`$${cuenta.debe} en el debe y $${cuenta.haber} en el haber`), "el apoyo dice las mismas cifras");
  const src = readFileSync("src/components/mecanicas/libros/t2/secuenciaP1.jsx", "utf8");
  assert.ok(!/\[1000, 500\]|\[150\]|debe: 50|haber: 30/.test(src), "P1 no escribe las cifras a mano");
  /* Se cambian los datos y la figura cambia con ellos. */
  const antes = [ej.debitos[0], ej.creditos[0], cuenta.debe];
  ej.debitos[0] = 1234; ej.creditos[0] = 321; cuenta.debe = 77;
  try {
    const m = await montarEn(0, "movimientos");
    try {
      const fig = m.caja.querySelector("figure").textContent;
      assert.ok(fig.includes("$1.234") && fig.includes("$321"), "Caja: las cifras de DE_QUE_ESTA_HECHA.ejemplo");
    } finally { await m.desmontar(); }
    const c = await montarEn(0, "cierre");
    try { assert.ok(c.caja.querySelector("figure").textContent.includes("$77"), "el cierre: las cifras de P1_TEXTOS.cierre.cuenta"); } finally { await c.desmontar(); }
  } finally { [ej.debitos[0], ej.creditos[0], cuenta.debe] = antes; }
});

test("★ P3: el préstamo sale de cu6-pagare y del saldo inicial de Caja; la ficha de $100, de pruebaTu.fichas[0]", async () => {
  const { transaccionDelEjemploDos, PIEZA_DEBE_Y_HABER } = await import("../../data/contabilidadDebeHaber.js");
  const pagare = transaccionDelEjemploDos();
  assert.equal(pagare.id, "cu6-pagare");
  const monto = pagare.asiento.debe.find(([c]) => c === "Caja")[1];
  const cajaDespues = PIEZA_DEBE_Y_HABER.exploracion.cuentas.find((c) => c.cuenta === "Caja").saldoInicial;
  assert.ok(D.P3_TEXTOS.trampa.apoyo.includes(`préstamo de $${monto}, la Caja pasa de $${(cajaDespues - monto).toLocaleString("es-CO")} a $${cajaDespues.toLocaleString("es-CO")}`), "el texto y los datos coinciden");
  const src = readFileSync("src/components/mecanicas/libros/t2/secuenciaP3.jsx", "utf8");
  assert.ok(!/cajaAntes: 1000|monto: 500|FICHA_100 = 100;/.test(src), "P3 no escribe el préstamo ni la ficha a mano");
  assert.match(src, /const FICHA_100 = T\.pruebaTu\.fichas\[0\];/);
  assert.match(src, /transaccionDelEjemploDos\(\)/);
  const m = await montarEn(2, "la-trampa");
  try {
    const fig = m.caja.querySelector("figure").textContent;
    assert.ok(fig.includes(`Saldo $${cajaDespues.toLocaleString("es-CO")}`) && fig.includes(`$${monto}`), "la figura pinta el préstamo de los datos");
  } finally { await m.desmontar(); }
});

test("★ P3·7: un porqué por opción mala; el de «a la derecha» es el de Mello, letra por letra, en la pieza jugada", async () => {
  const x = pantallaDe(2, "por-que");
  const derecha = x.opciones.find((o) => /a la derecha$/.test(o));
  const haber = x.opciones.find((o) => /en el haber$/.test(o));
  const textoMello = citaMello("Porqué para «a la derecha»: ");
  assert.equal(textoMello, "Pusiste Maquinaria con el pasivo y el patrimonio. Es un activo y vive a la izquierda.");
  assert.equal(D.P3_TEXTOS.porQue.porqueDerecha, textoMello);
  for (const [op, porque] of [[derecha, textoMello], [haber, D.P3_TEXTOS.porQue.porque]]) {
    const m = await montarEn(2, "por-que");
    try {
      await m.clic(op);
      await m.clic(op);
      assert.equal(mensajeDe(x, m.estado()).porque, porque, `«${op}»: su porqué`);
    } finally { await m.desmontar(); }
  }
  assert.notEqual(textoMello, D.P3_TEXTOS.porQue.porque);
});

test("★ P4: los platillos nunca parten una palabra (min-content, sin break-word ni anywhere; Mello T2-11) y el control dice «Aplicar la regla»", async () => {
  const nombres = [];
  for (const id of ["partida-doble", "la-balanza", "muchas-cuentas", "cierre"]) {
    const x = pantallaDe(3, id);
    const html = renderToStaticMarkup(h(x.Figura, { estado: x.estadoInicial ?? null, setEstado() {}, paso: 0, primeraVez: false, reducido: true }));
    const spans = [...html.matchAll(/<span lang="es" data-nombre-renglon="true" style="([^"]*)">([^<]*)<\/span>/g)];
    assert.ok(spans.length > 0, `${id}: los nombres de los renglones`);
    for (const [, estilo, nombre] of spans) {
      assert.match(estilo, /min-width:min-content/, `«${nombre}»: min-width: min-content`);
      assert.doesNotMatch(estilo, /break-word/, `«${nombre}»: sin break-word`);
      assert.doesNotMatch(estilo, /anywhere/, `«${nombre}»: no se parte por letra`);
      nombres.push(nombre);
    }
  }
  /* Las dos que Mello vio partidas. */
  assert.ok(nombres.includes("Equipo de computación") && nombres.includes("Flota y equipo de transporte"));
  const control = D.P4_TEXTOS.partidaDoble.control;
  assert.ok(MELLO9.includes(`Debe decir **«${control}»**`), "el texto del control es el de Mello");
  const m = await montarEn(3, "partida-doble");
  try {
    assert.ok(m.boton(control), `el control «${control}»`);
    assert.equal(m.boton("Partida doble"), undefined, "ya no repite el titular");
  } finally { await m.desmontar(); }
});

test("★ los controles que Mello aprobó (Registrar, Debe, Haber y las fichas) ya no llevan PENDIENTE_DE_REVISION", async () => {
  for (const f of ["Comun", "P1", "P2", "P3", "P4", "P5", "T2"]) {
    assert.doesNotMatch(readFileSync(`src/components/mecanicas/libros/t2/secuencia${f}.jsx`, "utf8"), /PENDIENTE_DE_REVISION|ESCRITO POR CLAUDE/, `secuencia${f}.jsx`);
  }
  for (const fila of ["| «Registrar» (P3·2) | Pasa.", "| «Debe» y «Haber» (P3·6) | Pasan.", "| Fichas «$100», «$500» y «$1.000» (P3·6) | Pasan."]) {
    assert.ok(MELLO9.includes(fila), `Mello: ${fila}`);
  }
  const m = await montarEn(2, "efectos-opuestos");
  try { assert.ok(m.boton("Registrar")); } finally { await m.desmontar(); }
  const t = await montarEn(2, "prueba-tu");
  try { for (const c of ["$100", "$500", "$1.000", "Debe", "Haber"]) assert.ok(t.boton(c), `P3·6: «${c}»`); } finally { await t.desmontar(); }
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

test("★ la bandera está ENCENDIDA (L, T2-13) y vive en los datos de la célula", () => {
  assert.equal(D.T2_APRENDER_EN_SECUENCIA, true, "Aprender de T2 es la secuencia");
  assert.match(readFileSync("src/data/contabilidadT2Secuencia.js", "utf8"), /^export const T2_APRENDER_EN_SECUENCIA = true;$/m, "se deshace en una línea");
});

/* La vista con la bandera apagada a mano: lo que pinta producción si L la vuelve a apagar. */
const APAGADA = variante(VISTA, [["{esAprender && T2_APRENDER_EN_SECUENCIA ? (", "{esAprender && false ? ("]]);

test("★ la página vieja sigue en el código: con la bandera apagada, la vista pinta EXACTAMENTE lo que pinta sin el cambio (Aprender y Hacer)", async () => {
  assert.ok(/<CuatroCapas pieza=\{pieza\}/.test(VISTA) && /PIEZAS_APRENDER\.map\(/.test(VISTA), "la página vieja no se borra");
  const sinCambio = variante(VISTA, QUITAR);
  assert.ok(!/SecuenciaAprender|T2_APRENDER_EN_SECUENCIA|NavigationContext/.test(sinCambio), "la receta deja restos del cambio");
  /* El fondo de la materia es perezoso (lazy): la primera pintura no lo trae. Se calienta antes de comparar. */
  await pintarVista(VISTA, "t2sec-calienta", "aprender");
  await new Promise((r) => setTimeout(r, 100));
  for (const modo of ["aprender", "hacer", null]) {
    const ahora = await pintarVista(APAGADA, `t2sec-ahora-${modo}`, modo);
    const antes = await pintarVista(sinCambio, `t2sec-antes-${modo}`, modo);
    assert.ok(ahora.length > 1000, `modo ${modo}: la vista no pintó nada`);
    const i = [...ahora].findIndex((c, k) => c !== antes[k]);
    assert.ok(ahora === antes, `modo ${modo}: la bandera apagada cambió lo que se pinta, desde el carácter ${i}:\n  ahora «${ahora.slice(Math.max(0, i - 80), i + 80)}»\n  antes «${antes.slice(Math.max(0, i - 80), i + 80)}»`);
  }
  const aprender = await pintarVista(APAGADA, "t2sec-ahora-ap", "aprender");
  const { PIEZAS_APRENDER } = await import("../../data/contabilidadAprender.js");
  assert.equal((aprender.match(/<section data-pieza=/g) || []).length, PIEZAS_APRENDER.length, "todas las piezas viejas, en CuatroCapas");
  assert.ok(!aprender.includes("data-secuencia"));
});

test("★ con la bandera encendida (la vista tal cual), Aprender es la secuencia de las cinco y no CuatroCapas", async () => {
  const html = await pintarVista(VISTA, "t2sec-encendida", "aprender");
  assert.ok(html.includes(`data-secuencia="${TEMA}"`));
  assert.ok(html.includes(`data-pieza="${IDS[0]}"`));
  assert.ok(html.includes("Pieza 1 de 5"));
  assert.equal((html.match(/<section data-pieza=/g) || []).length, 0);
  assert.ok(!html.includes("EL LIBRO MAYOR · APRENDER"), "ni el rótulo de CuatroCapas");
  /* Hacer no cambia con la bandera. */
  for (const modo of ["hacer", null]) {
    assert.equal(await pintarVista(VISTA, `t2sec-enc-${modo}`, modo), await pintarVista(APAGADA, `t2sec-apag-${modo}`, modo), `modo ${modo}: la bandera solo toca Aprender`);
  }
});

/* ─────────────── ✖ ROJO HONESTO: lo que falta ─────────────── */

test("✖ PENDIENTE_DE_WATARI: lo que la figura medida todavía no resuelve", () => {
  assert.deepEqual(D.PENDIENTES_T2.filter((p) => p.de === "Watari").map((p) => `${p.donde}: ${p.que}`), [], "Falta de Watari");
});

test("★ los tres textos de Near T2-8, letra por letra contra c-t2-8-near-textos.md", () => {
  /* P3·7: la pista del primer error, en la pieza jugada (no solo en el dato). */
  const porQue = PIEZAS_SECUENCIA_T2[2].pantallas.find((x) => x.id === "por-que");
  const pistaP37 = textosDe(porQue, { eleccion: porQue.opciones[0] }).pista;
  assert.equal(pistaP37, TEXTO_NEAR8("P3·7"), "P3·7: la pista del primer error");
  assert.equal(D.P3_TEXTOS.porQue.pista, TEXTO_NEAR8("P3·7"));
  /* P2·5: el ejemplo de la tarjeta Ingresos (versión larga, decisión de L medida a 320). */
  const ingresos = D.P2_TEXTOS.tresNominales.tarjetas.find((t) => t.nombre === "Ingresos");
  assert.equal(ingresos.ejemplo, TEXTO_NEAR8("P2·5"), "P2·5: el ejemplo de Ingresos");
  /* P3·4: el porqué del segundo error, en la pieza jugada. */
  const trampa = PIEZAS_SECUENCIA_T2[2].pantallas.find((x) => x.id === "la-trampa");
  assert.equal(PIEZAS_SECUENCIA_T2[2].pantallas.indexOf(trampa), 4, "la trampa es P3·4");
  const mala = trampa.opciones.find((o) => o !== trampa.buena);
  assert.equal(textosDe(trampa, { eleccion: mala }).porque, TEXTO_NEAR8("P3·4"), "P3·4: el porqué del 2.º error");
  assert.equal(D.P3_TEXTOS.trampa.porque, TEXTO_NEAR8("P3·4"));
});

test("✖ PENDIENTE_DE_NEAR: lo que los paquetes todavía no traen", () => {
  const deNear = D.PENDIENTES_T2.filter((p) => p.de === "Near");
  /* Y lo que se ve en la pieza mientras tanto: P3·7 sin pista, P2·5 sin el ejemplo de Ingresos. */
  const porQue = PIEZAS_SECUENCIA_T2[2].pantallas.find((x) => x.id === "por-que");
  const sinPista = textosDe(porQue, { eleccion: porQue.opciones[0] }).pista === null;
  const sinEjemplo = D.P2_TEXTOS.tresNominales.tarjetas.some((t) => !t.ejemplo);
  assert.deepEqual(deNear.map((p) => `${p.donde}: ${p.que}`), [], `Falta de Near${sinPista ? " — P3·7 juega sin pista al primer error" : ""}${sinEjemplo ? " — P2·5 abre Ingresos sin ejemplo" : ""}`);
  /* Vaciar la lista no basta: lo que se ve en la pieza tiene que haber llegado. */
  assert.equal(sinPista, false, "P3·7 juega sin pista al primer error");
  assert.equal(sinEjemplo, false, "P2·5 abre Ingresos sin ejemplo");
});
