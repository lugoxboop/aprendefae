import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA MASCOTA no se separa de la base.
 *
 * ESPECIES (mascotas.js) y el check de mascota_especie (0160) son la misma
 * lista en dos sitios: el cliente ofrece un selector, la base rechaza lo que no
 * esté en el check. Si se separan, un botón del selector guardaría algo que la
 * base tira con un error feo. Esta prueba LEE la migración y los compara —el
 * mismo trato que avatar.test.mjs le da a las formas del avatar—.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const migracion = readFileSync(
  fileURLToPath(new URL("../../../supabase/migrations/0160_mascota.sql", import.meta.url)),
  "utf8",
);

const { ESPECIES, IDS_ESPECIE, NOMBRE_MAX } = await import("../mascotas.js");

test("las especies del selector son exactamente las del check de la 0160", () => {
  /* Toma el primer `mascota_especie in ('…','…')` de la migración. */
  const m = migracion.match(/mascota_especie in \(([^)]+)\)/);
  assert.ok(m, "la migración declara el check de la especie");
  const enLaBase = m[1].match(/'([^']+)'/g).map((s) => s.slice(1, -1));
  assert.deepEqual(
    [...IDS_ESPECIE].sort(),
    [...enLaBase].sort(),
    "ESPECIES (mascotas.js) y el check de la base tienen que coincidir",
  );
});

test("el largo máximo del nombre coincide con el de la base", () => {
  const m = migracion.match(/char_length\(mascota_nombre\) between 1 and (\d+)/);
  assert.ok(m, "la migración declara el largo del nombre");
  assert.equal(NOMBRE_MAX, Number(m[1]), "NOMBRE_MAX y el check del nombre tienen que coincidir");
});

test("cada especie tiene nombre y rasgo para el selector", () => {
  for (const e of ESPECIES) {
    assert.ok(e.id && e.nombre && e.rasgo, `la especie ${e.id} está completa`);
  }
});

/* ── El componente ── */
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
const { default: Mascota } = await import("../../components/Mascota.jsx");

function montar(nodo) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(nodo));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}

test("pinta la especie que se le pide, y un perfil sin mascota no pinta nada", () => {
  const m = montar(
    React.createElement(
      "div",
      null,
      React.createElement(Mascota, { especie: "perro", tamano: 96 }),
      React.createElement(Mascota, { perfil: {}, tamano: 96 }),
      React.createElement(Mascota, { perfil: { mascota_especie: "huron" }, tamano: 96 }),
    ),
  );
  try {
    const svgs = [...m.caja.querySelectorAll("svg")];
    assert.equal(svgs.length, 2, "dos pintan; el perfil vacío no");
    assert.equal(svgs[0].getAttribute("data-mascota"), "perro");
    assert.equal(svgs[1].getAttribute("data-mascota"), "huron", "lee la especie de la fila del perfil");
    assert.ok(svgs[0].querySelector("circle"), "y lleva dibujo dentro");
  } finally { m.desmontar(); }
});

test("sin título es decorativa; con título es una imagen con nombre", () => {
  const m = montar(
    React.createElement(
      "div",
      null,
      React.createElement(Mascota, { especie: "gato", tamano: 56 }),
      React.createElement(Mascota, { especie: "gato", tamano: 56, titulo: "Tu mascota: Pelusa" }),
    ),
  );
  try {
    const [decorativa, conNombre] = [...m.caja.querySelectorAll("svg")];
    assert.equal(decorativa.getAttribute("aria-hidden"), "true");
    assert.equal(conNombre.getAttribute("role"), "img");
    assert.equal(conNombre.getAttribute("aria-label"), "Tu mascota: Pelusa");
  } finally { m.desmontar(); }
});
