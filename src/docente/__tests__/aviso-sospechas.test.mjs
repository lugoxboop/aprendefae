import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";
const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
for (const [k, v] of Object.entries({ window: w, document: w.document, navigator: w.navigator, HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement, Event: w.Event, MouseEvent: w.MouseEvent })) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const { default: AvisoSospechas } = await import("../../components/docente/AvisoSospechas.jsx");

async function montar(filas) {
  const raiz = document.createElement("div");
  document.body.appendChild(raiz);
  const llamadas = [];
  const cliente = { rpc: async (nombre, args) => { llamadas.push([nombre, args]); return { data: filas, error: null }; } };
  const r = createRoot(raiz);
  await act(async () => { r.render(React.createElement(AvisoSospechas, { materia: "contabilidad", cliente })); });
  return { raiz, llamadas, r };
}

test("★ sin registros marcados el panel no muestra nada", async () => {
  const { raiz, llamadas } = await montar([]);
  assert.deepEqual(llamadas, [["panel_sospechas", { p_subject: "contabilidad" }]]);
  assert.equal(raiz.querySelector("[data-aviso-sospechas]"), null);
});

test("★ con marcas: dice cuántos estudiantes y, al abrir, quién y por qué, sin hablar de sanción", async () => {
  const { raiz } = await montar([
    { user_id: "u1", nickname: "rayo", full_name: "Ana Pérez", marcados: 14, rafaga: 13, imposible: 1 },
    { user_id: "u2", nickname: "zeta", full_name: null, marcados: 1, rafaga: 0, imposible: 1 },
  ]);
  const aviso = raiz.querySelector("[data-aviso-sospechas]");
  assert.match(aviso.textContent, /2 estudiantes con registros sospechosos/);
  await act(async () => { aviso.querySelector("button").click(); });
  assert.match(aviso.textContent, /Ana Pérez · rayo/);
  assert.match(aviso.textContent, /13 en ráfaga · 1 imposibles/);
  assert.match(aviso.textContent, /zeta/);
  assert.match(aviso.textContent, /no una sanción/);
});
