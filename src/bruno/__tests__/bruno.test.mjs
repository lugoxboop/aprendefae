import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({ window: w, document: w.document, navigator: w.navigator, HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement, Event: w.Event, MouseEvent: w.MouseEvent, getComputedStyle: w.getComputedStyle.bind(w) })) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const { AuthContext } = await import("../../auth/AuthProvider.jsx");
const { default: Bruno, SALUDO, MOTIVO_SIN_SESION } = await import("../Bruno.jsx");
const { registrarDatos, soltarDatos, aDatosPlanos, contextoActual } = await import("../contexto.js");
const h = React.createElement;

async function montar(auth, preguntar) {
  const caja = document.createElement("div");
  caja.innerHTML = `<section><header><h3>¿Debe o Haber?</h3></header><p>Lee la transacción. Lleva la ficha al debe o al haber.</p></section>`;
  document.body.appendChild(caja);
  const raiz = document.createElement("div");
  document.body.appendChild(raiz);
  const r = createRoot(raiz);
  await act(async () => { r.render(h(AuthContext.Provider, { value: auth }, h(Bruno, { materia: "Contabilidad", tema: "cuentas-debe-haber", preguntar }))); });
  const q = (s) => raiz.querySelector(s);
  const clic = async (s) => act(async () => { q(s).dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
  return { raiz, q, clic, fin: async () => { await act(async () => r.unmount()); caja.remove(); raiz.remove(); } };
}

test("★ se abre con el botón, saluda, y la pregunta viaja con la pantalla, el ítem y el historial", async () => {
  const llamadas = [];
  const preguntar = async (p) => { llamadas.push(p); return { respuesta: "Mira qué cuenta te preguntan. ¿Sube o baja?", usadas: 1, limite: 25 }; };
  const dueno = {};
  registrarDatos({ item: { cuenta: "Caja", lado: "haber", ficha: h("span") , calcular: () => 1 }, numero: 1, total: 6 }, dueno);
  const m = await montar({ session: { user: { id: "u" } } }, preguntar);
  assert.equal(m.q("[data-bruno-panel]").dataset.abierto, "no");
  await m.clic("[data-bruno-abrir]");
  assert.equal(m.q("[data-bruno-panel]").dataset.abierto, "si");
  assert.match(m.q("[data-bruno-lista]").textContent, new RegExp(SALUDO.slice(0, 20)));
  await m.clic("[data-bruno-sugerencia]");
  assert.equal(llamadas.length, 1);
  const c = llamadas[0].contexto;
  assert.equal(c.materia, "Contabilidad");
  assert.equal(c.actividad, "¿Debe o Haber?");
  assert.match(c.pantalla, /Lleva la ficha al debe o al haber/);
  assert.deepEqual(c.datos, { item: { cuenta: "Caja", lado: "haber" }, numero: 1, total: 6 }, "el ítem no llegó plano (sin funciones ni elementos)");
  assert.match(m.q("[data-bruno-lista]").textContent, /¿Sube o baja\?/);
  assert.match(m.q("[data-bruno-panel] header").textContent, /24 preguntas más hoy/);
  /* El segundo turno lleva el primero como historial. */
  const campo = m.q("[data-bruno-campo]");
  await act(async () => {
    Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set.call(campo, "sigo sin entender");
    campo.dispatchEvent(new w.Event("input", { bubbles: true }));
  });
  await act(async () => { m.q("form").dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true })); });
  assert.deepEqual(llamadas[1].historial.map((t) => t.rol), ["estudiante", "bruno"]);
  soltarDatos(dueno);
  await m.fin();
});

test("★ sin sesión no se llama al servidor: se pide iniciar sesión", async () => {
  let llamado = false;
  const m = await montar({ session: null }, async () => { llamado = true; return {}; });
  await m.clic("[data-bruno-abrir]");
  await m.clic("[data-bruno-sugerencia]");
  assert.equal(llamado, false);
  assert.match(m.q("[data-bruno-lista]").textContent, new RegExp(MOTIVO_SIN_SESION.slice(0, 25)));
  await m.fin();
});

test("★ el ítem se aplana: sin funciones, sin elementos de React, sin ciclos", () => {
  const ciclo = { a: 1 }; ciclo.yo = ciclo;
  assert.deepEqual(aDatosPlanos({ x: 1, f: () => 1, el: h("b"), c: ciclo, _privado: 2 }), { x: 1, c: { a: 1 } });
  assert.equal(contextoActual().datos, null, "quedó un ítem registrado después de soltarlo");
});

test("★ movimiento: una curva, solo transform y opacity, nada en bucle, y con movimiento reducido sin transición", async () => {
  const { readFileSync } = await import("node:fs");
  const f = readFileSync(new URL("../Bruno.jsx", import.meta.url), "utf8");
  const css = f.match(/const CSS = `([\s\S]*?)`;/)[1];
  assert.doesNotMatch(css, /infinite|ease\b|linear/);
  for (const m of css.matchAll(/transition: ([^;]+);/g)) for (const parte of m[1].split(",")) assert.match(parte.trim(), /^(transform|opacity|none)\b/, parte);
  assert.match(css, /prefers-reduced-motion: reduce/);
});
