import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * Lote 19 · D4: la segunda decisión en b5-t5-a1, b5-t6-a1 y b5-t6-a4 (P2 de Mai; devoluciones de Futaba).
 *   · pregunta otra cosa y mueve su modelo; tras responder, lo correcto, y el fantasma de lo elegido si falló;
 *   · C2: pista al primer error; al segundo, el porqué;
 *   · suma como una decisión más (primer intento entero; segundo, la mitad).
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
beforeEach(() => w.localStorage.clear());

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const { FAE } = await import("../../theme.js");
const { default: QueRentaDa } = await import("../../components/mecanicas/libros/tema5/QueRentaDa.jsx");
const { default: ClientesOOtra } = await import("../../components/mecanicas/libros/tema6/ClientesOOtra.jsx");
const { default: QueSeDebita } = await import("../../components/mecanicas/libros/tema6/QueSeDebita.jsx");
const T5 = await import("../../data/contabilidadT5Act1.js");
const T6 = await import("../../data/contabilidadT6Act1.js");
const A4 = await import("../../data/contabilidadT6Act4.js");
const L5 = await import("../t5Act1.js");
const L6 = await import("../t6Act1.js");
const L4 = await import("../t6Act4.js");

const montar = async (Juego, items) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  let pct = null;
  await act(async () => { raiz.render(h(Juego, { Marco: MarcoLibros, rotulo: "P", titulo: "P", acento: FAE.ambar, onCompletar: (p) => { pct = p; }, items })); });
  return { caja, pct: () => pct, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { assert.ok(el, "no hay nada que tocar"); await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const devolucion = (caja) => [...caja.querySelectorAll('[role="status"] [data-devolucion]')].at(-1)?.querySelector("[data-texto-retro]")?.textContent ?? null;
const avanzar = async (caja) => tocar(caja.querySelector("[data-boton-avanzar] button"));
const T5F = (id) => L5.TODAS_T5_ACT1.find((f) => f.id === id);
const T6F = (id) => [...T6.FICHAS_T6_ACT1, ...T6.FICHAS_V2_T6_ACT1].find((f) => f.id === id);
const opcion = (caja, id) => caja.querySelector(`[data-opcion-segunda="${id}"]`);

test("★★★ datos: cada ficha de descripción (de las dos vueltas) y cada hecho tienen su pista y su porqué", () => {
  for (const f of L5.TODAS_T5_ACT1.filter((x) => L5.aplicaSegundaT5Act1(x))) {
    const d = T5.DEVOLUCIONES_SEGUNDA_T5_ACT1[f.id];
    assert.ok(d?.pista && d?.porque, f.id);
  }
  assert.ok(L5.TODAS_T5_ACT1.filter((x) => x.clase === T5.NOMBRE).every((x) => !L5.aplicaSegundaT5Act1(x)), "las de nombre siguen con el cajón");
  for (const f of [...T6.FICHAS_T6_ACT1, ...T6.FICHAS_V2_T6_ACT1].filter((x) => L6.aplicaSegundaT6Act1(x))) {
    assert.ok(T6.DEVOLUCIONES_SEGUNDA_T6_ACT1[f.id]?.porque, f.id);
  }
  for (const x of [...A4.HECHOS_T6_ACT4, ...A4.HECHOS_V2_T6_ACT4]) assert.ok(A4.DEVOLUCIONES_SEGUNDA_T6_ACT4[x.id]?.porque, x.id);
});

test("★★★ t6-a4: la correcta sale del asiento (HABER sube, DEBE baja, fuera no cambia), la de Futaba hecho por hecho", () => {
  const esperado = { "qd-06": A4.P_BAJA, "qd-07": A4.P_BAJA, "qd-08": A4.P_SUBE, "qd-09": A4.P_SUBE };
  for (const x of A4.HECHOS_T6_ACT4) assert.equal(L4.provisionDeT6Act4(x), esperado[x.id] ?? A4.P_IGUAL, x.id);
});

test("★★★ t5-a1: la ficha de descripción no pregunta el cajón; C2 con la tira: pista, porqué, lo correcto y el fantasma; luego entra a su cajón", async () => {
  const f = T5F("def-interes");
  const { caja, desmontar } = await montar(QueRentaDa, [f]);
  assert.ok([...caja.querySelectorAll("[data-cajon]")].every((b) => b.disabled), "el cajón no se elige");
  assert.equal(caja.querySelector("[data-pregunta-segunda]").textContent, T5.SEGUNDA_T5_ACT1.pregunta);
  assert.ok(!caja.querySelector("[data-correcta-tira]"), "R10: la tira está vacía antes de elegir");
  await tocar(opcion(caja, T5.RENTA_DIFERENCIA));
  assert.equal(devolucion(caja), T5.DEVOLUCIONES_SEGUNDA_T5_ACT1["def-interes"].pista);
  assert.equal(opcion(caja, T5.RENTA_DIFERENCIA).dataset.marca, "tachada");
  assert.ok(!caja.querySelector("[data-boton-avanzar]"));
  await tocar(opcion(caja, T5.RENTA_RESULTADOS));
  assert.equal(devolucion(caja), T5.DEVOLUCIONES_SEGUNDA_T5_ACT1["def-interes"].porque);
  assert.equal(opcion(caja, T5.RENTA_INTERES).dataset.marca, "revelada");
  assert.equal(caja.querySelector("[data-correcta-tira]").dataset.correctaTira, T5.RENTA_INTERES);
  assert.equal(caja.querySelector("[data-fantasma]").dataset.fantasma, T5.RENTA_RESULTADOS);
  await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
  assert.equal(caja.querySelector('[data-cajon="fija/interes"]').dataset.cuantas, "1", "la ficha entra a su cajón");
  desmontar();
});

test("★★★ t5-a1: la ficha de nombre sigue con el cajón, sin la pregunta de la renta", async () => {
  const { caja, desmontar } = await montar(QueRentaDa, [T5F("acciones")]);
  assert.ok(!caja.querySelector("[data-pregunta-segunda]"));
  await tocar(caja.querySelector('[data-cajon="variable"]'));
  assert.equal(devolucion(caja), T5F("acciones").acierto);
  desmontar();
});

test("★★★ t6-a1: dos cajones; la de Clientes pasa a la T sin devolución y entra como «Ficha 1» del lado correcto", async () => {
  const f = T6F("venta-mercancia");
  const { caja, desmontar } = await montar(ClientesOOtra, [f]);
  assert.deepEqual([...caja.querySelectorAll("[data-cajon]")].map((b) => b.querySelector("[data-nombre-cajon]").textContent), ["Clientes", "Otra cuenta por cobrar"]);
  assert.ok(caja.querySelector('[data-lado-t="debe"]').disabled, "la T está a la vista pero quieta hasta la decisión 2");
  await tocar(caja.querySelector('[data-cajon="clientes"]'));
  assert.equal(devolucion(caja), null, "la decisión 1 no dice nada: su devolución diría el lado");
  assert.equal(caja.querySelector("[data-pregunta-segunda]").textContent, T6.SEGUNDA_T6_ACT1.pregunta);
  assert.equal(caja.querySelector('[data-lado-t="debe"]').getAttribute("aria-label"), "DEBE");
  assert.ok(parseFloat(caja.querySelector('[data-lado-t="debe"]').style.minHeight) >= 88);
  await tocar(caja.querySelector('[data-lado-t="haber"]'));
  assert.equal(devolucion(caja), T6.DEVOLUCIONES_SEGUNDA_T6_ACT1["venta-mercancia"].pista);
  await tocar(caja.querySelector('[data-lado-t="debe"]'));
  assert.equal(devolucion(caja), f.acierto);
  assert.equal(caja.querySelector('[data-lado-t="debe"] [data-chip-ficha="ficha"]').textContent, "Ficha 1");
  assert.equal(caja.querySelector('[data-lado-t="haber"] [data-chip-ficha="fantasma"]').textContent, "Ficha 1");
  desmontar();
});

test("★★★ t6-a1: la de otra cuenta lleva solo la decisión 1 (con su pista si va a Clientes)", async () => {
  const f = T6F("socio");
  const { caja, desmontar } = await montar(ClientesOOtra, [f]);
  await tocar(caja.querySelector('[data-cajon="clientes"]'));
  assert.equal(devolucion(caja), f.pista);
  await tocar(caja.querySelector('[data-cajon="otra"]'));
  assert.equal(devolucion(caja), f.acierto);
  assert.ok(!caja.querySelector("[data-pregunta-segunda]"));
  assert.ok(caja.querySelector("[data-boton-avanzar]"));
  desmontar();
});

test("★★★ puntaje: la decisión 2 suma como una más; t6-a1 con 2 fichas (una de Clientes) son 3 decisiones", async () => {
  const { caja, pct, desmontar } = await montar(ClientesOOtra, [T6F("pago"), T6F("socio")]);
  await tocar(caja.querySelector('[data-cajon="clientes"]'));
  await tocar(caja.querySelector('[data-lado-t="debe"]'));
  await tocar(caja.querySelector('[data-lado-t="haber"]'));
  await avanzar(caja);
  await tocar(caja.querySelector('[data-cajon="otra"]'));
  await avanzar(caja);
  assert.equal(Math.round(pct()), Math.round(((1 + 0.5 + 1) / 3) * 100));
  desmontar();
});

test("★★★ t6-a4: tras el DEBE, «¿Qué le pasa a la provisión?»; el tanque mini en la línea hasta el final; C2; «Siguiente» solo al terminar", async () => {
  const x = A4.HECHOS_T6_ACT4.find((y) => y.id === "qd-06");
  const { caja, pct, desmontar } = await montar(QueSeDebita, [x]);
  assert.equal(caja.querySelector("[data-tanque-mini]").dataset.nivel, "antes");
  await tocar(caja.querySelector(`[data-opcion="${x.respuesta}"]`).closest("button"));
  assert.equal(caja.querySelector("[data-pregunta-segunda]").textContent, A4.SEGUNDA_T6_ACT4.pregunta);
  assert.ok(!caja.querySelector("[data-boton-avanzar]"));
  assert.equal(caja.querySelector("[data-tanque-mini]").dataset.nivel, "antes", "R10: el nivel no se mueve antes de responder");
  await tocar(opcion(caja, A4.P_SUBE));
  assert.equal(devolucion(caja), A4.DEVOLUCIONES_SEGUNDA_T6_ACT4["qd-06"].pista);
  await tocar(opcion(caja, A4.P_BAJA));
  assert.equal(caja.querySelector("[data-tanque-mini]").dataset.nivel, A4.P_BAJA);
  assert.equal(caja.querySelector("[data-tanque-mini] [data-fantasma]").dataset.fantasma, A4.P_SUBE);
  await avanzar(caja);
  assert.equal(Math.round(pct()), 75);
  desmontar();
});
