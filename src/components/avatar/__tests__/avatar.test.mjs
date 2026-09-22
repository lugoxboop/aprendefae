import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL AVATAR DIBUJADO: el orden de las capas, los ids de degradado y el retiro
 * de detalle por debajo de 40 px.
 *
 * El caso de los ids no es teórico: los ids de <defs> son globales al documento,
 * así que doce avatares en una lista de ranking con el mismo id se pintarían los
 * doce con el degradado del primero. Aquí se montan tres a la vez y se comprueba
 * que no comparten ninguno.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, getComputedStyle: w.getComputedStyle.bind(w),
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const { default: Avatar, TAMANOS } = await import("../Avatar.jsx");
const { computeAvatarProps } = await import("../../../avatar/generador.js");

function montar(nodo) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(nodo));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}

/** Los hijos del <svg>, en orden, con lo que los distingue. */
const capas = (svg) => [...svg.children].map((el) => {
  if (el.tagName === "g") return el.hasAttribute("data-halo") ? "halo" : "g";
  if (el.tagName === "defs") return "defs";
  if (el.tagName === "polygon") {
    if (el.hasAttribute("data-cuerpo")) return "cuerpo";
    if ((el.getAttribute("fill") ?? "").startsWith("url(")) return "lustre";
    if (el.getAttribute("fill") === "#FFFFFF") return "faceta";
    return "interior";
  }
  if (el.tagName === "line") return el.hasAttribute("data-cuerda") ? "cuerda" : "radio";
  if (el.tagName === "circle") return el.getAttribute("cx") === "100" && el.getAttribute("cy") === "100" ? "nucleo" : "nodo";
  return el.tagName;
});

test("nivel IV: las diez capas del kit, en su orden exacto", () => {
  const m = montar(React.createElement(Avatar, { forma: "prisma", paleta: "nocturno", nivel: 4, tamano: 96 }));
  try {
    const svg = m.caja.querySelector("svg");
    const orden = capas(svg);
    /* prisma: 6 vértices → 6 facetas, 6 cuerdas, 3 radios, 6 nodos. */
    assert.deepEqual(orden, [
      "defs", "halo", "cuerpo",
      ...Array(6).fill("faceta"),
      ...Array(6).fill("cuerda"),
      ...Array(3).fill("radio"),
      "interior", "lustre",
      ...Array(6).fill("nodo"),
      "nucleo",
    ]);

    /* El cuerpo se rellena con el degradado, no con un color plano. */
    const cuerpo = svg.querySelector("[data-cuerpo]");
    assert.match(cuerpo.getAttribute("fill"), /^url\(#av-.*-cuerpo\)$/);
    assert.equal(cuerpo.getAttribute("stroke-width"), "2.2");

    /* El degradado del cuerpo va de c1 a c2, en diagonal. */
    const lineal = svg.querySelector("linearGradient");
    assert.equal(lineal.getAttribute("x1"), "0%");
    assert.equal(lineal.getAttribute("y1"), "0%");
    assert.equal(lineal.getAttribute("x2"), "100%");
    assert.equal(lineal.getAttribute("y2"), "100%");
    assert.equal(lineal.children[0].getAttribute("stop-color"), "#3D5A80", "c1 de Nocturno es el navy de AVATAR, no el de marca");
    assert.equal(lineal.children[1].getAttribute("stop-color"), "#2A9D8F");

    /* El lustre: radial, arriba a la izquierda, del 42% de blanco a nada. */
    const radial = svg.querySelector("radialGradient");
    assert.equal(radial.getAttribute("cx"), "30%");
    assert.equal(radial.getAttribute("cy"), "24%");
    assert.equal(radial.getAttribute("r"), "70%");
    assert.equal(radial.children[0].getAttribute("stop-opacity"), "0.42");
    assert.equal(radial.children[1].getAttribute("stop-opacity"), "0");

    /* Y los dos anillos del halo, con el color de anillo de la paleta. */
    const anillos = [...svg.querySelectorAll("[data-halo] circle")];
    assert.deepEqual(anillos.map((c) => c.getAttribute("r")), ["96", "91"]);
    assert.deepEqual(anillos.map((c) => c.getAttribute("stroke")), ["#2A9D8F", "#2A9D8F"]);
    assert.deepEqual(anillos.map((c) => c.getAttribute("stroke-opacity")), ["0.4", "0.16"]);
  } finally { m.desmontar(); }
});

test("nivel I: solo el cuerpo y el interior, sin nodos ni núcleo ni halo", () => {
  const m = montar(React.createElement(Avatar, { forma: "decaedro", paleta: "marea", nivel: 1, tamano: 96 }));
  try {
    const svg = m.caja.querySelector("svg");
    assert.deepEqual(capas(svg), ["defs", "cuerpo", "interior"]);
    /* Bitono: el I ya NO es un contorno vacio — lleva relleno plano en c2 al 20%. */
    assert.equal(svg.querySelector("[data-cuerpo]").getAttribute("fill"), "#3D5A80", "c2 de Marea, plano");
    assert.equal(svg.querySelector("[data-cuerpo]").getAttribute("fill-opacity"), "0.2");
    assert.equal(svg.querySelector("[data-cuerpo]").getAttribute("stroke-width"), "3", "y el trazo grueso del bitono");
    assert.equal(svg.querySelector("[data-cuerpo]").getAttribute("stroke"), "#2A9D8F", "el trazo es el color 1 de Marea");
    assert.equal(svg.querySelector("radialGradient"), null, "el lustre es del IV");
  } finally { m.desmontar(); }
});

test("nivel II: nodos, radios y núcleo; ni facetas ni cuerdas ni halo", () => {
  const m = montar(React.createElement(Avatar, { forma: "nucleo", paleta: "aurora", nivel: 2, tamano: 56 }));
  try {
    const svg = m.caja.querySelector("svg");
    const orden = capas(svg);
    assert.equal(orden.filter((c) => c === "nodo").length, 8);
    assert.equal(orden.filter((c) => c === "radio").length, 4);
    assert.equal(orden.filter((c) => c === "faceta").length, 0);
    assert.equal(orden.filter((c) => c === "cuerda").length, 0);
    assert.equal(orden.includes("halo"), false);
    assert.equal(orden.includes("nucleo"), true);
    /* El nodo toma el color `node` de la paleta, que en Aurora es navy. */
    assert.equal(svg.querySelectorAll("circle")[0].getAttribute("fill"), "#3D5A80");
  } finally { m.desmontar(); }
});

test("tres avatares en la misma pantalla no comparten un solo id de degradado", () => {
  const m = montar(
    React.createElement(
      "div",
      null,
      React.createElement(Avatar, { forma: "decaedro", paleta: "nocturno", nivel: 4, tamano: 96 }),
      React.createElement(Avatar, { forma: "cuna", paleta: "brasa", nivel: 4, tamano: 56 }),
      React.createElement(Avatar, { forma: "red", paleta: "marea", nivel: 4, tamano: 96 }),
    ),
  );
  try {
    const svgs = [...m.caja.querySelectorAll("svg")];
    assert.equal(svgs.length, 3);

    const ids = [...m.caja.querySelectorAll("linearGradient, radialGradient")].map((g) => g.id);
    assert.equal(ids.length, 6, "dos degradados por avatar");
    assert.equal(new Set(ids).size, 6, "y los seis distintos");

    /* Cada referencia url(#…) apunta a un id que está DENTRO de su propio svg. */
    for (const svg of svgs) {
      const propios = new Set([...svg.querySelectorAll("linearGradient, radialGradient")].map((g) => g.id));
      const usados = [...svg.querySelectorAll("polygon")]
        .map((el) => el.getAttribute("fill") ?? "")
        .filter((f) => f.startsWith("url(#"))
        .map((f) => f.slice(5, -1));
      assert.ok(usados.length >= 2);
      for (const id of usados) assert.ok(propios.has(id), `${id} no está en su propio svg`);
    }
  } finally { m.desmontar(); }
});

test("a 36 y 24 px se retiran halo y cuerdas; el resto del nivel se queda", () => {
  for (const tamano of [TAMANOS.ranking, TAMANOS.liga]) {
    const m = montar(React.createElement(Avatar, { forma: "decaedro", paleta: "nocturno", nivel: 4, tamano }));
    try {
      const svg = m.caja.querySelector("svg");
      assert.equal(svg.querySelector("[data-halo]"), null, `${tamano} px: sin halo`);
      assert.equal(svg.querySelectorAll("[data-cuerda]").length, 0, `${tamano} px: sin cuerdas`);
      /* Sigue siendo un nivel IV: facetas, lustre, nodos y núcleo, todos ahí. */
      assert.equal(svg.querySelectorAll("polygon[fill='#FFFFFF']").length, 10);
      assert.equal(svg.querySelectorAll("circle").length, 11);
      assert.ok(svg.querySelector("radialGradient"), "el lustre se queda");
      assert.equal(svg.getAttribute("width"), String(tamano));
      assert.equal(svg.getAttribute("data-avatar"), "decaedro-nocturno-4");
    } finally { m.desmontar(); }
  }

  /* A 40 px justo —el umbral— el halo y las cuerdas sí salen. */
  const m = montar(React.createElement(Avatar, { forma: "decaedro", paleta: "nocturno", nivel: 4, tamano: 40 }));
  try {
    assert.ok(m.caja.querySelector("[data-halo]"));
    assert.equal(m.caja.querySelectorAll("[data-cuerda]").length, 10);
  } finally { m.desmontar(); }
});

test("el avatar se puede pintar desde la fila del perfil, y un perfil vacío no rompe nada", () => {
  const m = montar(
    React.createElement(
      "div",
      null,
      React.createElement(Avatar, { perfil: { avatar_shape: "cuna", avatar_palette: "brasa", avatar_level: 3 }, tamano: 96 }),
      React.createElement(Avatar, { perfil: null, tamano: 96 }),
    ),
  );
  try {
    const [uno, dos] = [...m.caja.querySelectorAll("svg")];
    assert.equal(uno.getAttribute("data-avatar"), "cuna-brasa-3");
    assert.equal(dos.getAttribute("data-avatar"), "decaedro-marea-1", "sin perfil, el avatar por defecto");
    /* Y el cuerpo es el mismo polígono que calcula el generador. */
    assert.equal(uno.querySelector("[data-cuerpo]").getAttribute("points"), computeAvatarProps("cuna", "brasa", 3).pts);
  } finally { m.desmontar(); }
});

test("sin título es decorativo; con título es una imagen con nombre", () => {
  const m = montar(
    React.createElement(
      "div",
      null,
      React.createElement(Avatar, { forma: "red", paleta: "marea", nivel: 2, tamano: 56 }),
      React.createElement(Avatar, { forma: "red", paleta: "marea", nivel: 2, tamano: 56, titulo: "Tu avatar: Red · Marea · Nivel II" }),
    ),
  );
  try {
    const [decorativo, conNombre] = [...m.caja.querySelectorAll("svg")];
    assert.equal(decorativo.getAttribute("aria-hidden"), "true");
    assert.equal(decorativo.getAttribute("role"), null);
    assert.equal(conNombre.getAttribute("role"), "img");
    assert.equal(conNombre.getAttribute("aria-label"), "Tu avatar: Red · Marea · Nivel II");
    assert.equal(conNombre.getAttribute("aria-hidden"), null);
  } finally { m.desmontar(); }
});
