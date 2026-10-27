import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA DECORACIÓN DEL CAMINO NO MOLESTA.
 *
 * Un adorno que se puede pulsar, que un lector de pantalla lee, que tapa un
 * nodo o que provoca barra horizontal a 320 px, ha dejado de ser un adorno y
 * se ha convertido en un fallo. Esto comprueba las cuatro cosas sobre el DOM
 * montado, no leyendo el código.
 *
 * Que el RECORRIDO siga igual que antes de la decoración lo guarda
 * `camino-sin-cambios`, que pesa el HTML con la capa quitada.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
const Observador = class { observe() {} unobserve() {} disconnect() {} };
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  ResizeObserver: Observador, IntersectionObserver: Observador,
  requestAnimationFrame: (cb) => setTimeout(() => cb(0), 0), cancelAnimationFrame: (id) => clearTimeout(id),
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.CSS = { escape: (v) => String(v).replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`) };
w.CSS = globalThis.CSS;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const { default: DecoracionCamino, CSS: CSS_DECORACION } = await import("../DecoracionCamino.jsx");
const { default: CaminoHacer } = await import("../CaminoHacer.jsx");

const NODOS = [
  { id: "a1", nombre: "Primera", completada: true },
  { id: "a2", nombre: "Segunda", completada: false },
  { id: "a3", nombre: "Tercera", completada: false },
];

async function montar(elemento) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(elemento); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}

test("★★★ la decoración no se puede tocar ni se oye", async () => {
  const m = await montar(h(DecoracionCamino, { tema: "contabilidad" }));
  try {
    const capa = m.caja.querySelector(".fae-dc");
    assert.ok(capa, "la capa existe");
    assert.equal(capa.getAttribute("aria-hidden"), "true", "un lector de pantalla no la lee");
    assert.equal(capa.style.pointerEvents, "none", "no se lleva ningún toque");
    assert.equal(
      m.caja.querySelectorAll("button, a, input, [tabindex], [role=button]").length, 0,
      "no hay nada enfocable dentro del adorno",
    );
    for (const s of capa.querySelectorAll("svg")) {
      assert.equal(s.getAttribute("aria-hidden"), "true");
      assert.equal(s.getAttribute("focusable"), "false");
    }
  } finally { m.desmontar(); }
});

test("★★★ se queda dentro de su caja: ni una figura provoca barra horizontal", async () => {
  const m = await montar(h(DecoracionCamino, { tema: "macroeconomia" }));
  try {
    const capa = m.caja.querySelector(".fae-dc");
    assert.equal(capa.style.overflow, "hidden", "lo que asoma se corta, no empuja la página");
    assert.equal(capa.style.position, "absolute", "no ocupa sitio en el flujo");
    for (const f of capa.querySelectorAll(":scope > svg")) {
      const izq = parseFloat(f.style.left);
      const arr = parseFloat(f.style.top);
      assert.ok(izq >= 0 && izq <= 95, `una figura empieza en ${izq}% de ancho`);
      assert.ok(arr >= 0 && arr <= 95, `una figura empieza en ${arr}% de alto`);
    }
  } finally { m.desmontar(); }
});

test("★★★ es tenue: ninguna figura compite con un nodo", async () => {
  const m = await montar(h(DecoracionCamino, { tema: "contabilidad" }));
  try {
    for (const f of m.caja.querySelectorAll(".fae-dc > svg")) {
      const op = parseFloat(f.style.opacity);
      assert.ok(op > 0 && op <= 0.14, `una figura va a ${op} de opacidad; el techo es 0,14`);
    }
  } finally { m.desmontar(); }
});

test("★★★ no se mueve para quien pide menos movimiento", () => {
  const reducido = CSS_DECORACION.slice(CSS_DECORACION.indexOf("prefers-reduced-motion"));
  assert.match(reducido, /animation:\s*none/, "con movimiento reducido las figuras se paran");
  assert.ok(
    !/animation-duration/.test(reducido),
    "se para la animación; no se pone más lenta, que no es lo que se pidió",
  );
});

test("★★★ es determinista: dos pintados dan exactamente lo mismo", async () => {
  const a = await montar(h(DecoracionCamino, { tema: "contabilidad" }));
  const uno = a.caja.innerHTML;
  a.desmontar();
  const b = await montar(h(DecoracionCamino, { tema: "contabilidad" }));
  const dos = b.caja.innerHTML;
  b.desmontar();
  assert.equal(uno, dos, "sin sorteos: la foto del camino depende de que esto no cambie");
});

test("★★★ el tema añade sus glifos y no se cuelan los de la otra materia", async () => {
  const conta = await montar(h(DecoracionCamino, { tema: "contabilidad" }));
  const nConta = conta.caja.querySelectorAll(".fae-dc > svg").length;
  conta.desmontar();
  const macro = await montar(h(DecoracionCamino, { tema: "macroeconomia" }));
  const nMacro = macro.caja.querySelectorAll(".fae-dc > svg").length;
  const htmlMacro = macro.caja.innerHTML;
  macro.desmontar();
  const pelado = await montar(h(DecoracionCamino, { tema: null }));
  const nPelado = pelado.caja.querySelectorAll(".fae-dc > svg").length;
  pelado.desmontar();

  assert.equal(nConta, nMacro, "las dos materias reciben el mismo número de figuras");
  assert.equal(nConta, nPelado + 2, "el tema añade exactamente dos glifos suyos");
  assert.ok(nPelado >= 5, "sin tema sigue habiendo decoración: una vista nueva no se ve desnuda");
  assert.ok(!htmlMacro.includes("#2A9D8F\" stroke-width=\"3\"><g><polyline points=\"10,22"), "en Macro no sale la cuenta T");
});

test("★★★ dentro del camino va DETRÁS del recorrido", async () => {
  const m = await montar(h(CaminoHacer, { nodos: NODOS, onAbrir() {}, tema: "contabilidad" }));
  try {
    const capa = m.caja.querySelector(".fae-dc");
    assert.ok(capa, "el camino trae su decoración");
    assert.equal(capa.style.zIndex, "0");
    /* El recorrido se sube a z-index 1: sin eso, lo posicionado taparía al nodo. */
    const lienzo = capa.parentElement.querySelector(":scope > svg");
    assert.equal(lienzo.style.zIndex, "1", "el recorrido va por encima del adorno");
    assert.equal(lienzo.style.position, "relative");
    /* Y el adorno va ANTES en el DOM, que es el orden en que se pinta. */
    assert.ok(capa.compareDocumentPosition(lienzo) & Node.DOCUMENT_POSITION_FOLLOWING);
  } finally { m.desmontar(); }
});

test("★★★ un camino sin tema sigue teniendo decoración", async () => {
  const m = await montar(h(CaminoHacer, { nodos: NODOS, onAbrir() {} }));
  try {
    assert.ok(m.caja.querySelector(".fae-dc > svg"), "Pensamiento Estratégico también tiene fondo");
  } finally { m.desmontar(); }
});

/* ── la mascota ── */

test("★★★ la mascota está al final del camino, y tampoco se toca ni se oye", async () => {
  const m = await montar(h(CaminoHacer, { nodos: NODOS, onAbrir() {}, tema: "contabilidad" }));
  try {
    const mascota = m.caja.querySelector(".fae-ms");
    assert.ok(mascota, "el camino trae su muñequito");
    assert.equal(mascota.getAttribute("aria-hidden"), "true");
    assert.equal(mascota.getAttribute("focusable"), "false");
    /* Vive DENTRO de la capa decorativa: de ahí hereda que nada se puede pulsar. */
    assert.ok(mascota.closest(".fae-dc"), "va dentro de la decoración, no suelta en el lienzo");
    const sitio = mascota.parentElement;
    assert.equal(sitio.style.position, "absolute");
    assert.ok(sitio.style.bottom, "se ancla abajo, en el aire que el camino ya reserva");
  } finally { m.desmontar(); }
});

test("★★★ se puede quitar la mascota sin tocar el resto de la decoración", async () => {
  const con = await montar(h(DecoracionCamino, { tema: "contabilidad" }));
  const nCon = con.caja.querySelectorAll(".fae-dc > svg").length;
  con.desmontar();
  const sin = await montar(h(DecoracionCamino, { tema: "contabilidad", mascota: false }));
  try {
    assert.equal(sin.caja.querySelector(".fae-ms"), null, "sin mascota no hay muñequito");
    assert.equal(sin.caja.querySelectorAll(".fae-dc > svg").length, nCon, "y las figuras siguen todas");
  } finally { sin.desmontar(); }
});

test("★★★ el saludo de la mascota no es un bucle", async () => {
  const { CSS: CSS_MASCOTA } = await import("../Mascota.jsx");
  const saludo = CSS_MASCOTA.slice(CSS_MASCOTA.indexOf(".fae-ms-brazo"));
  assert.ok(
    !/fae-ms-saluda[^;]*infinite/.test(saludo),
    "saluda un número de veces y para: un muñequito que saluda sin parar cansa",
  );
  const reducido = CSS_MASCOTA.slice(CSS_MASCOTA.indexOf("prefers-reduced-motion"));
  assert.match(reducido, /animation:\s*none/, "con movimiento reducido se queda quieta");
});
