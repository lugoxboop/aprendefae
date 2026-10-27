import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * #556: A 320 PX EL RANKING NO ENSEÑABA NINGÚN NOMBRE.
 *
 * El botón de ánimo iba en la misma línea que el apodo y lo dejaba en 0 px de
 * ancho. jsdom no mide, así que esta prueba fija la ESTRUCTURA que lo impide;
 * la medida de verdad la da scripts/ranking/medir.mjs en Chromium, con Inter y
 * Sora de producción (antes: 0 px a 320; después: 130 px el apodo más angosto).
 *
 * Lo que fija:
 *   1. el apodo no comparte línea con el botón de ánimo ni con los FP;
 *   2. el apodo nunca se corta con «…» ni se obliga a una sola línea (#546);
 *   3. el botón de ánimo da 44 px de toque;
 *   4. las pestañas caben (ninguna se parte, el grupo no se sale);
 *   5. el primer puesto no es coral (#546).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const { AuthContext } = await import("../../../auth/AuthProvider.jsx");
const { default: RankingFP } = await import("../RankingFP.jsx");
const { default: BotonAnimo } = await import("../../social/BotonAnimo.jsx");
const { FAE } = await import("../../../theme.js");

const h = React.createElement;
const FILAS = ["Ana", "Juan Pablo López Ruiz", "AlejandroCastañeda1", "ValentinaRojas"].map((nickname, i) => ({
  posicion: i + 1, nickname, fp: 900 - i * 100, es_tuyo: i === 3,
}));
const auth = { session: { user: { id: "u" } }, perfil: { nickname: "ValentinaRojas" }, pedirCuenta: () => {} };

async function montar(elemento) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(elemento); });
  return { caja, fin: () => act(async () => { raiz.unmount(); }) };
}

/*
 * La consulta y los ánimos son asíncronos. Con la suite entera corriendo a la
 * vez un solo tick no alcanzaba y la prueba fallaba sin que nada estuviera
 * mal (se vio una vez en local). Se espera a que aparezca lo que se busca, con
 * un tope, en vez de suponer cuántos ticks hacen falta.
 */
async function esperar(condicion, ms = 5000) {
  const hasta = Date.now() + ms;
  while (!condicion()) {
    if (Date.now() > hasta) return false;
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });
  }
  return true;
}

test("★ el apodo tiene su línea propia, entera, y nunca se corta con «…»", async () => {
  const m = await montar(h(AuthContext.Provider, { value: auth }, h(RankingFP, { subjectId: "contabilidad", pedir: async () => ({ data: FILAS, error: null }) })));
  try {
    await esperar(() => m.caja.querySelectorAll("[data-apodo]").length === FILAS.length);
    const apodos = [...m.caja.querySelectorAll("[data-apodo]")];
    assert.equal(apodos.length, FILAS.length, "no se pintó un apodo por fila");
    for (const a of apodos) {
      const estilo = a.getAttribute("style") ?? "";
      assert.doesNotMatch(estilo, /text-overflow:\s*ellipsis/, `${a.textContent}: se corta con «…»`);
      assert.doesNotMatch(estilo, /white-space:\s*nowrap/, `${a.textContent}: obligado a una sola línea`);
      assert.match(estilo, /display:\s*block/, `${a.textContent}: no ocupa su línea`);
      /* Lo que se lleva el ancho —el botón de ánimo y los FP— no puede ser hermano del apodo. */
      const hermanos = [...a.parentElement.children].filter((x) => x !== a);
      assert.ok(!hermanos.some((x) => x.matches("[data-boton-animo], [data-fp]")), `${a.textContent}: comparte línea con el botón o los FP`);
    }
  } finally {
    await m.fin();
  }
});

test("★ el botón de ánimo da 44 px de toque, y la píldora que se ve queda dentro", async () => {
  const m = await montar(h(BotonAnimo, { apodo: "Ana", recibidos: 3, yaLeDi: false }));
  try {
    const b = m.caja.querySelector("[data-boton-animo]");
    assert.ok(b, "no está el botón");
    assert.equal(b.style.minHeight, "44px");
    assert.equal(b.style.minWidth, "44px");
    assert.equal(b.getAttribute("aria-label"), "Dar ánimo a Ana");
  } finally {
    await m.fin();
  }
});

test("★ las pestañas reparten el ancho y ninguna se parte; el primer puesto no es coral", () => {
  const fuente = readFileSync(new URL("../RankingFP.jsx", import.meta.url), "utf8");
  const etiquetas = [...fuente.matchAll(/etiqueta: "([^"]+)"/g)].map((x) => x[1]);
  assert.deepEqual(etiquetas, ["Diario", "Semanal", "Semestre"], "«De semestre» se partía a 320");
  assert.match(fuente, /flex: "1 1 auto", whiteSpace: "nowrap"/, "las pestañas ya no reparten el ancho sin partirse");
  const podio = fuente.slice(fuente.indexOf("const ACENTO_PODIO"), fuente.indexOf("];", fuente.indexOf("const ACENTO_PODIO")));
  const primero = podio.split("\n").find((l) => l.trim().startsWith("{"));
  assert.doesNotMatch(primero, /coral/i, "coral es solo error, no el que va ganando");
  assert.ok(FAE.ambar, "falta el ámbar en el tema");
});

/* ─────────────── #570: la liga tenía el mismo fallo; #571: las tarjetas eran transparentes ─────────────── */

const { default: LigaBoard } = await import("../../ligas/LigaBoard.jsx");
const { TARJETA_TABLA } = await import("../tarjeta.js");

test("★ #570: en el podio de la liga el apodo también tiene su línea propia y nunca se corta", async () => {
  const filas = ["ElContadorMasRapidoDelOeste", "MARIAJOSÉRODRÍGUEZZULUAGA", "Ab"].map((nickname, i) => ({
    liga: 1, total_ligas: 1, tam_liga: 17, corte_podio: 3, posicion: i + 1, nickname, fp: 300 - i * 40, es_tuyo: false, en_podio: true,
  }));
  const cargarTablero = async () => ({ filas, error: null });
  const cargarContexto = async () => ({ contexto: { totalNiveles: 1, ligaAnterior: null, nivelesAnterior: null, transicion: null, activosReparto: null }, error: null });
  const m = await montar(h(AuthContext.Provider, { value: auth }, h(LigaBoard, { subjectId: "pensamiento-estrategico", cargarTablero, cargarContexto })));
  try {
    await esperar(() => m.caja.querySelectorAll("[data-fila-liga] [data-apodo]").length === filas.length);
    const apodos = [...m.caja.querySelectorAll("[data-fila-liga] [data-apodo]")];
    assert.equal(apodos.length, filas.length, "no se pintó un apodo por fila del podio");
    for (const a of apodos) {
      const estilo = a.getAttribute("style") ?? "";
      assert.doesNotMatch(estilo, /text-overflow:\s*ellipsis|white-space:\s*nowrap/, `${a.textContent}: cortado u obligado a una línea`);
      const hermanos = [...a.parentElement.children].filter((x) => x !== a);
      assert.ok(!hermanos.some((x) => x.matches("[data-boton-animo], [data-fp]")), `${a.textContent}: comparte línea con el botón o los FP`);
    }
  } finally {
    await m.fin();
  }
});

test("★ #571: las dos tablas usan la misma tarjeta, y es opaca", () => {
  /* #1C2939 y no el navy: el navy no es superficie y con él el teal de las cifras daba 2,78:1 (#573). */
  assert.equal(TARJETA_TABLA.background, "#1C2939", "la tarjeta dejó de ser la superficie opaca #1C2939");
  assert.doesNotMatch(String(TARJETA_TABLA.background), /rgba\(/, "la tarjeta volvió a ser transparente");
  for (const archivo of ["../RankingFP.jsx", "../../ligas/LigaBoard.jsx"]) {
    const fuente = readFileSync(new URL(archivo, import.meta.url), "utf8");
    assert.match(fuente, /\.\.\.TARJETA_TABLA/, `${archivo} no usa la tarjeta compartida`);
    assert.doesNotMatch(fuente, /background: "rgba\(248,249,250,0\.04\)"/, `${archivo} volvió al 4 %`);
  }
});

/*
 * #573 (Levi: «opaco no es legible»): medido con scripts/ranking/medir.mjs, el
 * texto de las dos tablas pasa 4,5:1 (mínimo 4,63 a 320 y 375). Lo que lo
 * rompía eran colores de texto concretos; aquí no pueden volver: ni teal como
 * color de TEXTO ni blanco por debajo del 50 %. El coral queda solo para el
 * error (4,76:1 a 14 px sobre la tarjeta).
 */
test("★ #573: ningún texto de las tablas en teal ni en blanco tenue", () => {
  for (const archivo of ["../RankingFP.jsx", "../../ligas/LigaBoard.jsx", "../../ligas/CabeceraLiga.jsx", "../../social/BotonAnimo.jsx"]) {
    const fuente = readFileSync(new URL(archivo, import.meta.url), "utf8");
    const colores = [...fuente.matchAll(/(?<![a-zA-Z])color: ([^,}\n]+)/g)].map((x) => x[1].trim());
    for (const c of colores) {
      assert.doesNotMatch(c, /FAE\.teal\b/, `${archivo}: texto en ${c}`);
      const alfa = c.match(/rgba\(248,\s*249,\s*250,\s*(0?\.\d+)\)/);
      if (alfa) assert.ok(Number(alfa[1]) >= 0.5, `${archivo}: texto blanco al ${alfa[1]}`);
    }
  }
});
