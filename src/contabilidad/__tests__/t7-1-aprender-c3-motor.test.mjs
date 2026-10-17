import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 APRENDER · EL MOTOR C3 DE LA CÉLULA (t7/aprenderC3.jsx), con una pieza
 * de juguete: no hay contenido de Near aquí, solo el comportamiento que A2, A5
 * y A6 heredan.
 *   · escalera C2: 1.er error (coral + «No va aquí» + pista), 2.º error
 *     (devolución + la correcta en blanco), acierto (Correcto + porqué
 *     plegado), en opciones y en los lados de un asiento
 *   · M-1 de Mello: la consigna se ve mientras !antes(s); la pregunta, después
 *   · foco al mensaje, al porqué y al texto; «Seguir» con aria-disabled
 *   · movimiento reducido: nada lleva la clase que anima
 *   · nunca «Iba aquí»; el cruce conserva sus nodos (key estable)
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
let REDUCIDO = false;
w.matchMedia = (q) => ({ matches: REDUCIDO && /prefers-reduced-motion: reduce/.test(q), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.Element.prototype.scrollIntoView = () => {};
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;
const M = await import("../../components/mecanicas/libros/t7/aprenderC3.jsx");
const AprenderC3 = M.default;
const FUENTE = readFileSync(new URL("../../components/mecanicas/libros/t7/aprenderC3.jsx", import.meta.url), "utf8");

/* ═══════════ LA PIEZA DE JUGUETE ═══════════ */

const PANTALLAS = [
  { id: "portada", tipo: "portada", texto: "Portada de juguete.", boton: "Empezar", pie: "Pie 1" },
  { id: "elige", tipo: "eleccion", texto: "Texto de la elección.", pregunta: "¿Cuál?", pista: "PISTA-ELIGE",
    opciones: [{ id: "a", t: "Opción A", correcta: true }, { id: "b", t: "Opción B", devolucion: "DEVOLUCION-B" }, { id: "c", t: "Opción C", devolucion: "DEVOLUCION-C" }],
    bien: "BIEN-ELIGE", porque: "PORQUE-ELIGE" },
  { id: "asiento", tipo: "lados", texto: "Texto del asiento.", bien: "BIEN-ASIENTO",
    lineas: [{ id: "l1", cuenta: "Caja", monto: 1000, lado: "debe", pista: "PISTA-L1", devolucion: "DEVOLUCION-L1" },
      { id: "l2", cuenta: "Ventas", monto: 1000, lado: "haber", pista: "PISTA-L2", devolucion: "DEVOLUCION-L2" }] },
  { id: "compara", tipo: "eleccion", texto: "", consigna: "CONSIGNA-COMPARA", pregunta: "¿Por qué cruza?", pista: "PISTA-COMPARA", antes: (s) => Boolean(s.fig.vio),
    opciones: [{ id: "x", t: "Opción X", correcta: true }, { id: "y", t: "Opción Y", devolucion: "DEVOLUCION-Y" }], bien: "BIEN-COMPARA" },
  { id: "resumen", tipo: "resumen", lista: ["Uno.", "Dos."], siguiente: "Siguiente: otra.", boton: "Siguiente pieza" },
];
const vistos = [];
const PIEZA = {
  id: "juguete", titulo: "Juguete", clase: "jg", pantallas: PANTALLAS, fig: { lado: "compra" },
  figura(ctx) {
    vistos.push({ evento: ctx.evento, reducido: ctx.reducido });
    if (ctx.P.tipo === "lados") return h(M.AsientoT, { ctx, titulo: "Asiento de juguete" });
    if (ctx.P.id === "compara") {
      const venta = ctx.s.fig.lado === "venta";
      return h(React.Fragment, null,
        h("button", { type: "button", className: "c3-boton", "data-accion": "rol", onClick: () => ctx.fig({ lado: venta ? "compra" : "venta", vio: true }) }, "Cambiar"),
        h(M.Cruce, { clave: "cruce", fichas: [{ key: "iva", der: venta, contenido: "IVA" }, { key: "ret", der: !venta, contenido: "Retención" }] }));
    }
    return null;
  },
};

/* ═══════════ AYUDAS ═══════════ */

async function montar() {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(AprenderC3, { pieza: PIEZA, rotulo: "R" })); });
  const q = (s) => caja.querySelector(s);
  const clic = async (el) => { assert.ok(el, "no está lo que se iba a tocar"); await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
  return {
    caja, q, clic,
    seguir: () => clic(q(".c3-seguir")),
    op: (id) => clic(q(`[data-op="${id}"]`)),
    lado: (l) => clic(q(`.c3-lado[data-lado="${l}"]`)),
    msg: () => q("[data-c3-msg]").textContent,
    pantalla: () => q("[data-pieza]").dataset.pantalla,
    desmontar: () => { act(() => raiz.unmount()); caja.remove(); },
  };
}
const enFoco = (el, msg) => assert.ok(el && document.activeElement === el, `${msg}: el foco está en ${document.activeElement?.tagName}.${document.activeElement?.className}`);
const seguirBloqueado = (m) => assert.equal(m.q(".c3-seguir").getAttribute("aria-disabled"), "true");
const sinIbaAqui = (m) => assert.doesNotMatch(m.caja.textContent, /Iba aquí/);

/* ═══════════ PRUEBAS ═══════════ */

test("escalera en una elección: 1.er error, 2.º error y acierto", async () => {
  const m = await montar();
  await m.seguir();
  assert.equal(m.pantalla(), "elige");
  enFoco(m.q(".c3-txt"), "al seguir, el foco va al texto");
  seguirBloqueado(m);

  // 1.er error: coral + «No va aquí» + la pista; el foco, al mensaje.
  await m.op("b");
  const b = m.q('[data-op="b"]');
  assert.ok(b.classList.contains("mal"));
  assert.equal(b.querySelector("[data-pastilla]")?.textContent, "No va aquí");
  assert.match(b.getAttribute("aria-label"), /Incorrecto\.$/);
  assert.match(m.msg(), /PISTA-ELIGE/);
  assert.doesNotMatch(m.msg(), /DEVOLUCION/);
  assert.equal(m.caja.querySelectorAll(".c3-op.pista").length, 0, "el 1.er error no marca la correcta");
  enFoco(m.q("[data-c3-msg]"), "1.er error");
  seguirBloqueado(m);
  sinIbaAqui(m);

  // Seguir bloqueado de verdad: tocarlo no avanza.
  await m.seguir();
  assert.equal(m.pantalla(), "elige");

  // 2.º error: la devolución de lo elegido y la correcta en borde blanco.
  await m.op("c");
  assert.match(m.msg(), /DEVOLUCION-C/);
  assert.doesNotMatch(m.msg(), /PISTA-ELIGE/);
  assert.ok(m.q('[data-op="c"]').classList.contains("mal"));
  assert.ok(!m.q('[data-op="b"]').classList.contains("mal"));
  assert.ok(m.q('[data-op="a"]').classList.contains("pista"), "la correcta, en blanco");
  assert.equal(m.q('[data-op="a"]').querySelector("[data-pastilla]"), null, "la correcta no lleva pastilla antes de elegirla");
  enFoco(m.q("[data-c3-msg]"), "2.º error");
  seguirBloqueado(m);
  sinIbaAqui(m);

  // Acierto: Correcto, el «bien», el porqué plegado; todo queda resuelto.
  await m.op("a");
  const a = m.q('[data-op="a"]');
  assert.ok(a.classList.contains("bien"));
  assert.equal(a.querySelector("[data-pastilla]")?.textContent, "Correcto");
  assert.match(m.msg(), /^Correcto\. BIEN-ELIGE/);
  for (const o of m.caja.querySelectorAll(".c3-op")) assert.equal(o.getAttribute("aria-disabled"), "true");
  const pq = m.q(".c3-porque");
  assert.equal(pq.getAttribute("aria-expanded"), "false");
  assert.doesNotMatch(m.msg(), /PORQUE-ELIGE/);
  enFoco(m.q("[data-c3-msg]"), "acierto");
  assert.equal(m.q(".c3-seguir").getAttribute("aria-disabled"), "false");
  await m.clic(pq);
  assert.match(m.msg(), /PORQUE-ELIGE/);
  enFoco(m.q("[data-porque]"), "al abrir el porqué");
  // Ya resuelta, otra opción no cambia nada.
  await m.op("b");
  assert.ok(!m.q('[data-op="b"]').classList.contains("mal"));
  sinIbaAqui(m);
  m.desmontar();
});

test("escalera en los lados de un asiento, línea por línea", async () => {
  REDUCIDO = false;
  const m = await montar();
  await m.seguir(); await m.op("a"); await m.seguir();
  assert.equal(m.pantalla(), "asiento");
  assert.equal(m.q(".c3-ficha").dataset.linea, "l1");
  seguirBloqueado(m);

  await m.lado("haber");
  assert.ok(m.q('.c3-lado[data-lado="haber"]').classList.contains("mal"));
  assert.equal(m.q('.c3-lado[data-lado="haber"] [data-pastilla]')?.textContent, "No va aquí");
  assert.match(m.msg(), /PISTA-L1/);
  assert.ok(!m.q('.c3-lado[data-lado="debe"]').classList.contains("pista"));
  enFoco(m.q("[data-c3-msg]"), "1.er error del lado");

  await m.lado("haber");
  assert.match(m.msg(), /DEVOLUCION-L1/);
  assert.ok(m.q('.c3-lado[data-lado="debe"]').classList.contains("pista"), "el lado bueno, en blanco");
  sinIbaAqui(m);

  await m.lado("debe");
  const ren = m.q('.c3-lado[data-lado="debe"] [data-ren="l1"]');
  assert.ok(ren, "la línea cae en su lado");
  assert.ok(ren.classList.contains("nuevo"), "sin movimiento reducido, la línea cae animada");
  assert.equal(m.q(".c3-ficha").dataset.linea, "l2");
  assert.equal(m.caja.querySelectorAll(".c3-lado.pista, .c3-lado.mal").length, 0, "la línea nueva empieza limpia");
  seguirBloqueado(m);

  // La 2.ª línea tiene su propia escalera: su 1.er error vuelve a ser la pista.
  await m.lado("debe");
  assert.match(m.msg(), /PISTA-L2/);
  await m.lado("haber");
  assert.match(m.msg(), /^Correcto\. BIEN-ASIENTO/);
  assert.equal(m.q(".c3-ficha"), null);
  assert.equal(m.caja.querySelectorAll("button.c3-lado").length, 0, "resuelto, los lados ya no son botones");
  assert.equal(m.q(".c3-seguir").getAttribute("aria-disabled"), "false");
  m.desmontar();
});

test("M-1: la consigna se ve mientras !antes(s); la pregunta, cuando antes(s)", async () => {
  const m = await montar();
  await m.seguir(); await m.op("a"); await m.seguir();
  await m.lado("debe"); await m.lado("haber"); await m.seguir();
  assert.equal(m.pantalla(), "compara");
  const c = m.q("[data-consigna]");
  assert.equal(c.hidden, false);
  assert.equal(c.textContent, "CONSIGNA-COMPARA");
  assert.equal(m.q("[data-pregunta]"), null);
  assert.equal(m.q(".c3-op"), null);
  enFoco(c, "sin texto, al seguir el foco va a la consigna");
  seguirBloqueado(m);

  await m.clic(m.q('[data-accion="rol"]'));
  assert.equal(m.q("[data-consigna]").hidden, true);
  assert.doesNotMatch(m.caja.textContent, /CONSIGNA-COMPARA/);
  assert.equal(m.q("[data-pregunta]").textContent, "¿Por qué cruza?");
  seguirBloqueado(m);
  await m.op("y"); await m.op("y");
  assert.match(m.msg(), /DEVOLUCION-Y/);
  assert.ok(m.q('[data-op="x"]').classList.contains("pista"));
  await m.op("x");
  assert.equal(m.q(".c3-seguir").getAttribute("aria-disabled"), "false");
  // Las funciones puras dicen lo mismo.
  const P = PANTALLAS[3];
  assert.equal(M.consignaVisible(P, { fig: {} }), true);
  assert.equal(M.consignaVisible(P, { fig: { vio: true } }), false);
  assert.equal(M.preguntaVisible(P, { fig: {} }), false);
  assert.equal(M.preguntaVisible(P, { fig: { vio: true } }), true);
  m.desmontar();
});

test("el cruce conserva sus fichas (key estable) y la ficha va en borde de reposo (A2-2)", async () => {
  const m = await montar();
  await m.seguir(); await m.op("a"); await m.seguir();
  await m.lado("debe"); await m.lado("haber"); await m.seguir();
  const iva = m.q('[data-ficha="iva"]');
  assert.ok(!iva.classList.contains("der"));
  await m.clic(m.q('[data-accion="rol"]'));
  assert.equal(m.q('[data-ficha="iva"]'), iva, "el nodo es el mismo: la ficha se desliza");
  assert.ok(iva.classList.contains("der"));
  assert.match(M.CSS_C3, /\.c3-tile \{[^}]*border: var\(--reposo\);/);
  assert.match(M.CSS_C3, /--reposo: 1px solid rgba\(248,249,250,\.35\)/);
  assert.equal(M.C3.cruce, M.Cruce);
  m.desmontar();
});

test("movimiento reducido: nada lleva la clase que anima y la figura lo sabe", async () => {
  REDUCIDO = true;
  try {
    const m = await montar();
    await m.seguir(); await m.op("a"); await m.seguir();
    vistos.length = 0;
    await m.lado("debe");
    assert.ok(m.q('[data-ren="l1"]'), "la línea está en su lado (estado final)");
    assert.equal(m.caja.querySelectorAll(".nuevo").length, 0);
    assert.ok(vistos.some((v) => v.evento === "cae" && v.reducido === true));
    assert.match(M.CSS_C3, /@media \(prefers-reduced-motion: reduce\) \{ \.c3 \*, \.c3 \*::before, \.c3 \*::after \{ animation: none !important; transition: none !important; \} \}/);
    m.desmontar();
  } finally { REDUCIDO = false; }
});

test("resumen y fin: la lista, la siguiente y «Siguiente pieza»", async () => {
  const m = await montar();
  await m.seguir(); await m.op("a"); await m.seguir();
  await m.lado("debe"); await m.lado("haber"); await m.seguir();
  await m.clic(m.q('[data-accion="rol"]')); await m.op("x"); await m.seguir();
  assert.equal(m.pantalla(), "resumen");
  assert.deepEqual([...m.caja.querySelectorAll(".c3-lista li")].map((l) => l.textContent), ["Uno.", "Dos.", "Siguiente: otra."]);
  assert.equal(m.q(".c3-seguir").textContent, "Siguiente pieza");
  assert.equal(m.q(".c3-seguir").dataset.boton, "siguiente-pieza");
  assert.equal(m.q(".c3-cejilla").textContent, "Pantalla 5 de 5");
  m.desmontar();
});

test("funciones puras: la escalera sin montar", () => {
  const P = PANTALLAS[1];
  let s = M.estadoInicial(PIEZA);
  s = M.elegir(s, P, "b");
  assert.deepEqual([s.msg, s.pista, s.intento], [{ tipo: "mal", t: "PISTA-ELIGE" }, false, "b"]);
  s = M.elegir(s, P, "b");
  assert.deepEqual([s.msg, s.pista], [{ tipo: "mal", t: "DEVOLUCION-B" }, true]);
  assert.equal(M.estaListo(P, s), false);
  assert.equal(M.seguir({ ...s, p: 1 }, PANTALLAS).p, 1, "Seguir no avanza sin resolver");
  s = M.elegir(s, P, "a");
  assert.equal(M.estaListo(P, s), true);
  assert.equal(s.msg.t, "BIEN-ELIGE");
});

test("el código: nunca «Iba aquí» ni el revelado; pastilla y bloque de b5/Devolucion.jsx", () => {
  const sinComentarios = FUENTE.replace(/\/\*[\s\S]*?\*\//g, "");
  assert.doesNotMatch(sinComentarios, /Iba aquí|REVELADA|ibaAqui/);
  assert.match(FUENTE, /import \{[^}]*\bPastilla\b[^}]*\bMensaje\b[^}]*\} from "\.\.\/b5\/Devolucion\.jsx"/);
  assert.match(M.CSS_C3, /\.c3-op\.mal \{ border: 2px solid var\(--coral\);/);
  assert.match(M.CSS_C3, /\.c3-op\.pista, \.c3-op\.bien \{ border: 2px solid var\(--texto\);/);
  assert.match(M.CSS_C3, /--texto: #F8F9FA/);
});
