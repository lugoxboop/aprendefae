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
  await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
  return { caja, fin: () => act(async () => { raiz.unmount(); }) };
}

test("★ el apodo tiene su línea propia, entera, y nunca se corta con «…»", async () => {
  const m = await montar(h(AuthContext.Provider, { value: auth }, h(RankingFP, { subjectId: "contabilidad", pedir: async () => ({ data: FILAS, error: null }) })));
  try {
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
