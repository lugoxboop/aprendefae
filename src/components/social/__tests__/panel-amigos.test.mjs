import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import { perfilDeTarjeta } from "../PanelAmigos.jsx";

/* Amigos es un destino propio (#/amigos), no algo enterrado en el perfil: tiene
   su vista registrada, App la pinta y el menú de cuenta sabe llegar. */
test("«Amigos» es una vista con su hash, y App y el menú saben llegar", async () => {
  const { VISTAS, interpretar, serializar } = await import("../../../ruta.js");
  assert.ok(VISTAS.has("amigos"), "sin esto el hash caería en la portada");
  assert.equal(interpretar(serializar("amigos", null)).vista, "amigos");

  const app = readFileSync(new URL("../../../App.jsx", import.meta.url), "utf8");
  assert.ok(app.includes('view === "amigos"'), "App tiene que pintarla");

  const menu = readFileSync(new URL("../../auth/AccountControl.jsx", import.meta.url), "utf8");
  assert.ok(menu.includes('nav?.irA?.("amigos")'), "el menú de cuenta tiene que llevar a Amigos");
  assert.ok(/>Amigos<\/OpcionMenu>/.test(menu), "y mostrar la opción «Amigos»");
});

/*
 * El panel de amigos: sin base configurada (como en las pruebas) no hay datos,
 * así que debe pintar la casilla para agregar y el estado vacío, sin reventar.
 * Y el mapeo tarjeta→perfil tiene que dar justo los campos que la mascota lee.
 */

test("perfilDeTarjeta pasa especie, pelaje y ojos, y usa user_id como id", () => {
  const t = {
    amistad_id: "a1",
    apodo: "Pelusa",
    user_id: "u_9",
    mascota_especie: "gato",
    mascota_paleta: "negro",
    mascota_ojos: "azul",
    mascota_puestos: ["gafas"],
  };
  assert.deepEqual(perfilDeTarjeta(t), {
    id: "u_9",
    mascota_especie: "gato",
    mascota_paleta: "negro",
    mascota_ojos: "azul",
    mascota_puestos: ["gafas"],
  });
});

/* ── El componente, montado de verdad ── */
const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost/",
  virtualConsole: new VirtualConsole(),
});
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
const { default: PanelAmigos } = await import("../PanelAmigos.jsx");

function montar(nodo) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(nodo));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}

test("sin datos pinta la casilla de apodo y el estado vacío", () => {
  const m = montar(React.createElement(PanelAmigos));
  try {
    const panel = m.caja.querySelector("[data-panel-amigos]");
    assert.ok(panel, "el panel está");
    const entrada = m.caja.querySelector("input");
    assert.ok(entrada, "hay una casilla para escribir el apodo");
    assert.equal(m.caja.querySelectorAll("[data-amigo]").length, 0, "sin amigos, ninguna fila");
    assert.match(m.caja.textContent, /no tienes amigos/i, "muestra el estado vacío");
  } finally {
    m.desmontar();
  }
});
