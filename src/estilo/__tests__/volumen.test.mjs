import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL VOLUMEN DE LOS CINCO CONTROLES COMPARTIDOS (#560; forma de Ukyo).
 *
 *   ·  el canto es una capa hermana DETRÁS: ni border-bottom ni box-shadow
 *   ·  el hundido: translateY(4px), 100 ms de bajada y 160 de vuelta, una curva,
 *      solo transform, nada en bucle; con movimiento reducido, sin transición
 *   ·  donde hay canto no hay scale(.97); lo quieto conserva su gesto
 *   ·  los cinco usan la misma pieza, con los valores de la tabla
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><head></head><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
for (const [k, v] of Object.entries({ window: w, document: w.document, navigator: w.navigator, HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node })) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const React = await import("react");
const { createRoot } = await import("react-dom/client");
const { act } = React;
const V = await import("../volumen.jsx");
const { Responder } = await import("../../components/mecanicas/libros/piezas.jsx");
const leer = (ruta) => readFileSync(new URL(ruta, import.meta.url), "utf8");

async function montar(elemento) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(elemento); });
  return { caja, desmontar: () => act(async () => { raiz.unmount(); }) };
}

test("★★★ los valores son los de Ukyo: caras, cantos, 4 px, 100/160 ms, una curva", () => {
  assert.deepEqual(V.FAMILIAS, {
    n2: { cara: "#344968", canto: "#1D3557" },
    teal: { cara: "#2A9D8F", canto: "#1D6B61" },
    clara: { cara: "#B8C4D4", canto: "#8C9BB0" },
  });
  assert.equal(V.ELEVACION, 4);
  assert.equal(V.SILUETA, "rgba(248,249,250,.18)");
  assert.equal(V.SUPERFICIE.background, "#1D3557");
  assert.match(V.CSS_VOLUMEN, /:active:not\(\[data-vol-quieto\]\) \.fae-vol-cara \{ transform: translateY\(4px\); transition-duration: 100ms; \}/);
  assert.match(V.CSS_VOLUMEN, /\.fae-vol-cara \{ transition: transform 160ms cubic-bezier\(\.3,\.9,\.4,1\); \}/);
  assert.match(V.CSS_VOLUMEN, /prefers-reduced-motion: reduce\) \{ \.fae-vol-cara \{ transition: none; \} \}/);
});

test("★★★ solo transform, nada en bucle, y el canto nunca es borde ni sombra", () => {
  const fuente = leer("../volumen.jsx").replace(/\/\*[\s\S]*?\*\//g, "");
  assert.doesNotMatch(V.CSS_VOLUMEN, /animation|infinite|box-shadow|border-bottom/);
  assert.doesNotMatch(fuente, /boxShadow|borderBottom/);
  for (const [, propiedad] of V.CSS_VOLUMEN.matchAll(/transition:\s*([a-z-]+)/g)) assert.ok(["transform", "none"].includes(propiedad), propiedad);
});

test("★★★ Responder: el canto es una capa hermana DETRÁS de la cara, teal #1D6B61, y se hunde", async () => {
  const m = await montar(React.createElement(Responder, { onClick() {} }, "Comprobar"));
  const envoltorio = m.caja.firstElementChild;
  assert.equal(envoltorio.className, "fae-vol");
  const [canto, cara] = envoltorio.children;
  assert.equal(canto.className, "fae-vol-canto", "el canto va primero: detrás");
  assert.equal(canto.getAttribute("aria-hidden"), "true");
  assert.equal(canto.style.background, "rgb(29, 107, 97)");
  assert.equal(cara.tagName, "BUTTON");
  assert.equal(cara.className, "fae-vol-cara");
  assert.equal(cara.style.color, "rgb(6, 32, 42)", "el texto sigue en #06202A (Erwin)");
  assert.equal(envoltorio.hasAttribute("data-vol-quieto"), false);
  assert.ok(document.getElementById("fae-volumen"), "la hoja se inyecta una vez");
  await m.desmontar();
});

test("★★ Responder deshabilitado: reserva el alto, sin canto y sin hundido", async () => {
  const m = await montar(React.createElement(Responder, { deshabilitado: true }, "Comprobar"));
  const envoltorio = m.caja.firstElementChild;
  assert.ok(envoltorio.hasAttribute("data-vol-quieto"));
  assert.equal(envoltorio.firstElementChild.style.background, "transparent");
  assert.equal(envoltorio.lastElementChild.className, "", "lo quieto no lleva la clase de cara");
  await m.desmontar();
  assert.equal(document.querySelectorAll("#fae-volumen").length, 1);
});

test("★★★ los cinco usan la pieza compartida, con los valores de su fila", () => {
  const camino = leer("../../components/shared/CaminoHacer.jsx");
  assert.match(camino, /<circle data-canto cx=\{x\} cy=\{y \+ ELEVACION\}/);
  assert.match(camino, /fill=\{nodo\.completada \? FAE\.teal : FAMILIAS\.n2\.cara\}/);
  assert.match(camino, /<g className=\{CLASE_CARA\}>/);
  const piezas = leer("../../components/mecanicas/libros/piezas.jsx");
  assert.match(piezas, /<Volumen canto=\{deshabilitado \? "transparent" : FAMILIAS\.teal\.canto\}/);
  const encabezado = leer("../../components/mecanicas/libros/tema1/encabezado.jsx");
  assert.match(encabezado, /<Volumen canto=\{FAMILIAS\.n2\.canto\} radio="10px"/);
  assert.match(encabezado, /background: FAMILIAS\.n2\.cara/);
  const secuencia = leer("../../components/secuencia/SecuenciaAprender.jsx");
  assert.match(secuencia, /<Volumen canto=\{espera \? "transparent" : FAMILIAS\.clara\.canto\} quieto=\{espera\}/);
  assert.match(secuencia, /\.fae-sec-nav:active:not\(\[aria-disabled="true"\]\):not\(\.fae-vol-cara\) \{ transform: scale\(\.97\)/, "donde hay canto no va el scale");
  assert.match(leer("../../components/mecanicas/corazon/juego.jsx"), /\.\.\.SUPERFICIE_PULSOS \}\}/);
  assert.match(leer("../../components/shared/ActivityBadge.jsx"), /\[APRENDER\]: \{ color: FAE\.node, background: N1,/);
});

test("★★ el «Siguiente» de AsiSeJuega es el mismo Responder: hereda la cara teal (Erwin)", () => {
  assert.match(leer("../../components/mecanicas/libros/AsiSeJuega.jsx"), /<Responder onClick=\{onSiguiente\}>Siguiente<\/Responder>/);
});
