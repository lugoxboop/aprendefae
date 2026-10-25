import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.HTMLCanvasElement.prototype.getContext = () => null;
for (const [k, v] of Object.entries({ window: w, document: w.document, navigator: w.navigator, HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia, requestAnimationFrame: (f) => setTimeout(f, 16), cancelAnimationFrame: clearTimeout })) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const { CSS_ENTRADA_APP, CURVA_ENTRADA_APP, olvidarEntradaApp } = await import("../entradaApp.js");
const { default: HomeScreen } = await import("../../components/HomeScreen.jsx");

async function montar() {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await React.act(async () => { raiz.render(React.createElement(HomeScreen, { onSelectSubject: () => {} })); });
  return { caja, fin: () => React.act(async () => { raiz.unmount(); }) };
}

test("★ la entrada suena la primera vez de la visita y no al volver al inicio", async () => {
  olvidarEntradaApp();
  const a = await montar();
  assert.ok(a.caja.querySelector("[data-inicio].fae-app-entra"), "la primera vez no hay entrada");
  assert.equal(a.caja.querySelectorAll(".fae-app-materias > *").length, 3, "las tres materias no son hijas directas de la rejilla");
  for (const c of ["fae-app-fondo", "fae-app-marca", "fae-app-titular", "fae-app-pie"]) assert.ok(a.caja.querySelector(`.${c}`), `falta .${c}`);
  await a.fin();
  const b = await montar();
  assert.equal(b.caja.querySelector(".fae-app-entra"), null, "volver al inicio repitió la entrada");
  assert.equal(b.caja.querySelector("style")?.textContent?.includes("fae-app-sube") ?? false, false);
  await b.fin();
});

test("★ reglas de movimiento: una curva, solo transform y opacity, nada en bucle, y con movimiento reducido nada", () => {
  const css = CSS_ENTRADA_APP;
  assert.equal(CURVA_ENTRADA_APP, "cubic-bezier(.3,.9,.4,1)");
  assert.doesNotMatch(css.replaceAll(CURVA_ENTRADA_APP, ""), /cubic-bezier|\b(ease|linear|ease-in|ease-out|ease-in-out)\b/, "apareció otra curva");
  assert.doesNotMatch(css, /infinite/);
  const propiedades = [...css.matchAll(/@keyframes[^{]+\{([\s\S]*?\})\s*\}/g)].flatMap((m) => [...m[1].matchAll(/([a-z-]+)\s*:/g)].map((x) => x[1]));
  assert.ok(propiedades.length > 0);
  assert.deepEqual([...new Set(propiedades)].sort(), ["opacity", "transform"]);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{ \.fae-app-entra, \.fae-app-entra \* \{ animation: none !important; \} \}/);
  const fuente = readFileSync(new URL("../../components/HomeScreen.jsx", import.meta.url), "utf8");
  assert.match(fuente, /useEntradaApp\(\)/);
});
