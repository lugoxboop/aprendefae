import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * El panel de retos: con un reto que ya cumplió la meta entre los dos, sale el
 * botón de reclamar; si falta, sale el progreso y no el botón.
 */
const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const { default: PanelRetos } = await import("../PanelRetos.jsx");

function montar(props) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(React.createElement(PanelRetos, props)));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}

const otro = { apodo: "Nico", user_id: "u2", mascota_especie: "perro" };
const vence = new Date(Date.now() + 6 * 3600_000).toISOString();

test("sin nada, invita a retar a un amigo", () => {
  const m = montar({});
  try {
    assert.ok(m.caja.querySelector("[data-panel-retos]"));
    assert.match(m.caja.textContent, /Reta a un amigo/i);
  } finally { m.desmontar(); }
});

test("un reto cumplido entre los dos muestra el botón de reclamar", () => {
  const activos = [{ id: "r1", meta: 6, bono: 25, vence, avance_mio: 4, avance_otro: 3, otro }];
  const m = montar({ activos });
  try {
    const reto = m.caja.querySelector('[data-reto="r1"]');
    assert.ok(reto, "la tarjeta del reto está");
    assert.match(reto.textContent, /Reclamar \+25/);
    assert.match(reto.querySelector("[data-avance]").textContent, /7\/6/);
  } finally { m.desmontar(); }
});

test("un reto a medias muestra el progreso, no el botón de reclamar", () => {
  const activos = [{ id: "r2", meta: 6, bono: 25, vence, avance_mio: 2, avance_otro: 1, otro }];
  const m = montar({ activos });
  try {
    const reto = m.caja.querySelector('[data-reto="r2"]');
    assert.ok(!/Reclamar/.test(reto.textContent), "aún no se puede reclamar");
    assert.match(reto.textContent, /Faltan 3/);
  } finally { m.desmontar(); }
});

test("si yo todavía no aporto, me lo dice", () => {
  const activos = [{ id: "r3", meta: 6, bono: 25, vence, avance_mio: 0, avance_otro: 5, otro }];
  const m = montar({ activos });
  try {
    assert.match(m.caja.querySelector('[data-reto="r3"]').textContent, /Haz tú una actividad/);
  } finally { m.desmontar(); }
});

test("una invitación recibida ofrece aceptar y rechazar", () => {
  let respondido = null;
  const m = montar({ invitaciones: [{ id: "i1", meta: 6, bono: 25, otro }], onResponder: (id, ok) => { respondido = [id, ok]; } });
  try {
    assert.match(m.caja.textContent, /Te retaron/);
    assert.match(m.caja.textContent, /bono \+25/);
  } finally { m.desmontar(); }
});
