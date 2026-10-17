import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * Lote 20 · D9: el elemento propio de b5-t5-a2 («Precio por título») y de b5-t6-a3 (la deuda por casos),
 * como hijo opcional de la mesa (`elementoPropio`): entra al confirmar, siempre con lo correcto (R10).
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
const { renderToStaticMarkup } = await import("react-dom/server");
const act = React.act;
const h = React.createElement;
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const { FAE } = await import("../../theme.js");
const { default: PrecioPorTitulo } = await import("../../components/mecanicas/libros/tema5/PrecioPorTitulo.jsx");
const { estadosDeLaDeuda } = await import("../../components/mecanicas/libros/tema6/DeudaPorCasos.jsx");
const { default: DeudaQueVuelve, CONFIG_V2_T6_ACT3 } = await import("../../components/mecanicas/libros/tema6/DeudaQueVuelve.jsx");
const { default: CierreSantaPacha } = await import("../../components/mecanicas/libros/tema5/CierreSantaPacha.jsx");
const { CONFIG_T6_ACT2 } = await import("../../components/mecanicas/libros/tema6/ProvisionDeElTorito.jsx");
const { default: AjusteDelAnoSiguiente, escalaAjuste, cifrasDelAjuste } = await import("../../components/mecanicas/libros/tema6/AjusteDelAnoSiguiente.jsx");
const { default: QuienLeDebe } = await import("../../components/mecanicas/libros/tema6/QuienLeDebe.jsx");
const { default: ClientesOOtra } = await import("../../components/mecanicas/libros/tema6/ClientesOOtra.jsx");
const A2 = await import("../../data/contabilidadT6Act2.js");
const A1 = await import("../../data/contabilidadT6Act1.js");
const L1 = await import("../t6Act1.js");
const T5 = await import("../../data/contabilidadT5Act2.js");
const T6 = await import("../../data/contabilidadT6Act3.js");
const S = await import("../../data/b5SegundaVuelta.js");

const pagina = (s) => { const d = document.createElement("div"); d.innerHTML = s; return d; };
const montar = async (Juego) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(Juego, { Marco: MarcoLibros, rotulo: "P", titulo: "P", acento: FAE.ambar, onCompletar: () => {} })); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};

test("★★★ la deuda por casos: los estados de la tabla de Mai, asiento por asiento", () => {
  const miles = (c) => Object.fromEntries(Object.entries(c).map(([k, v]) => [k, v / 1000]));
  const fila = (n) => Object.fromEntries(Object.entries(estadosDeLaDeuda(T6.PARTES_T6_ACT3, n, 180000).casos).map(([k, c]) => [k, miles(c)]));
  const C = (pagada, revivida, castigada) => ({ pagada, revivida, castigada });
  assert.deepEqual(fila(0), { "Caso a": C(0, 0, 180), "Caso b": C(0, 0, 180), "Caso c": C(0, 0, 180) });
  assert.deepEqual(fila(1)["Caso a"], C(0, 180, 0));
  assert.deepEqual(fila(2)["Caso a"], C(180, 0, 0));
  assert.deepEqual(fila(3)["Caso b"], C(0, 180, 0));
  assert.deepEqual(fila(4)["Caso b"], C(100, 80, 0));
  assert.deepEqual(fila(5), { "Caso a": C(180, 0, 0), "Caso b": C(100, 80, 0), "Caso c": C(0, 100, 80) });
  assert.equal(estadosDeLaDeuda(T6.PARTES_T6_ACT3, 4, 180000).ultimo, "Caso b", "se resalta la barra del último asiento");
});

test("★★★ la deuda por casos se ve desde el ejemplo resuelto, con las tres castigadas; la variante nombra a Hernán Ríos", async () => {
  const { caja, desmontar } = await montar(DeudaQueVuelve);
  const el = caja.querySelector("[data-ejemplo-resuelto] [data-deuda-por-casos]");
  assert.ok(el, "en el ejemplo resuelto");
  assert.equal(el.querySelector("p").textContent, T6.DEUDA_T6_ACT3.titulo);
  assert.equal(el.querySelectorAll("[data-caso]").length, 3);
  assert.ok([...el.querySelectorAll("[data-tramo]")].every((t) => t.dataset.tramo === "castigada"));
  desmontar();
  assert.equal(S.DEUDA_V2_T6_ACT3.titulo, "La deuda de Hernán Ríos");
  assert.ok(CONFIG_V2_T6_ACT3.elementoPropio);
});

test("★★★ «Precio por título»: solo en las ventas; ganancia arriba del costo, pérdida abajo; la escala de Mai", () => {
  assert.equal(renderToStaticMarkup(h(PrecioPorTitulo, { actual: T5.PARTES_T5_ACT2[0] })), "", "en los intereses no aparece");
  assert.equal(renderToStaticMarkup(h(PrecioPorTitulo, { actual: null })), "", "antes de confirmar no está");
  const gana = pagina(renderToStaticMarkup(h(PrecioPorTitulo, { actual: T5.PARTES_T5_ACT2[1] })));
  assert.equal(gana.querySelector("[data-precio-por-titulo]").dataset.resultado, "ganancia");
  assert.equal(gana.querySelector("[data-palabra-zona]").textContent, T5.PRECIO_T5_ACT2.ganancia);
  assert.equal(gana.querySelector("[data-precio-por-titulo]").getAttribute("aria-label"), "Precio por título: costó $800 y se vende a $920; ganancia");
  const izq = (n, sel) => parseFloat(n.querySelector(sel).style.left);
  assert.ok(Math.abs(izq(gana, "[data-costo]") - 33.33) < 0.01);
  assert.ok(Math.abs(izq(gana, "[data-venta]") - 73.33) < 0.01);
  const pierde = pagina(renderToStaticMarkup(h(PrecioPorTitulo, { actual: T5.PARTES_T5_ACT2[3] })));
  assert.equal(pierde.querySelector("[data-precio-por-titulo]").dataset.resultado, "perdida");
  assert.ok(Math.abs(izq(pierde, "[data-venta]") - 16.67) < 0.01);
  assert.deepEqual(S.PARTES_V2_T5_ACT2.filter((p) => p.precio).map((p) => [p.precio.costo, p.precio.venta]), [[950, 980], [950, 870]]);
});

test("★★ en t5-a2, el ejemplo resuelto (la compra) no lleva el elemento propio", async () => {
  const { caja, desmontar } = await montar(CierreSantaPacha);
  assert.ok(caja.querySelector("[data-ejemplo-resuelto]"));
  assert.ok(!caja.querySelector("[data-precio-por-titulo]"));
  desmontar();
});

/* ═══ Lote 24 · D9 de b5-t6-a2 y b5-t6-a1 (P2 de Mai) ═══ */

test("★★★ t6-a2 · el ajuste del año siguiente: solo tras la pregunta 3 (R10); la escala de Mai; las cifras de cada vuelta", () => {
  const P = A2.PASOS_T6_ACT2;
  assert.equal(CONFIG_T6_ACT2.elementoPropio, AjusteDelAnoSiguiente);
  for (let n = 0; n < P.length; n++) assert.equal(renderToStaticMarkup(h(AjusteDelAnoSiguiente, { partes: P, hechas: n, reducido: true })), "", `tras ${n} pasos, no está`);
  assert.deepEqual(cifrasDelAjuste(P), { corta: 31200, pide: 153400, ajuste: 184600 });
  assert.deepEqual(escalaAjuste(31200, 153400), { desde: 40000, ancho: 200000 }, "de −40.000 a 160.000: el cero en el 20 %");
  const el = pagina(renderToStaticMarkup(h(AjusteDelAnoSiguiente, { partes: P, hechas: P.length, reducido: true }))).firstChild;
  assert.equal(el.getAttribute("role"), "img");
  assert.equal(el.getAttribute("aria-label"), "El ajuste, $184.600: $31.200 que faltaron más $153.400 que pide el análisis");
  assert.equal(el.querySelector("[data-cero]").style.left, "20%");
  assert.equal(el.querySelector('[data-tramo-ajuste="corta"]').style.left, "4.4%", "−31.200 → 4,4 %");
  assert.equal(el.querySelector('[data-tramo-ajuste="pide"]').style.width, "76.7%", "153.400 → 96,7 %");
  assert.match(el.querySelector('[data-tramo-ajuste="corta"]').style.backgroundImage, /repeating-linear-gradient/, "rayado");
  assert.equal(el.querySelector("[data-cifra-ajuste]").textContent, "$184.600");
  /* La variante (La Ceiba) trae sus cifras y su escala. */
  assert.deepEqual(cifrasDelAjuste(S.PASOS_V2_T6_ACT2), { corta: 48000, pide: 110000, ajuste: 158000 });
  assert.deepEqual(escalaAjuste(48000, 110000), { desde: 80000, ancho: 200000 });
});

test("★★★ t6-a1 · ¿quién le debe a la empresa?: el deudor de cada ficha, con la etiqueta de Futaba o, sin ella, por su cuenta", () => {
  const F = (id) => [...A1.FICHAS_T6_ACT1, ...A1.FICHAS_V2_T6_ACT1].find((f) => f.id === id);
  assert.equal(L1.deudorDeT6Act1(F("venta-mercancia")), "clientes");
  assert.equal(L1.deudorDeT6Act1(F("socio")), "socios");
  assert.equal(L1.deudorDeT6Act1(F("accionista")), "socios");
  assert.equal(L1.deudorDeT6Act1(F("trabajador")), "trabajadores");
  assert.equal(L1.deudorDeT6Act1(F("vecino")), "particulares");
  assert.equal(L1.deudorDeT6Act1(F("anticipo")), "otro", "junto a «otros motivos»");
  assert.equal(L1.deudorDeT6Act1(F("prestamo-cliente")), "otro", "sin etiqueta de Futaba y sin cuenta: «otros motivos»");
  A1.DEUDOR_POR_FICHA["prestamo-cliente"] = "particulares";
  try { assert.equal(L1.deudorDeT6Act1(F("prestamo-cliente")), "particulares", "la etiqueta de Futaba manda"); } finally { delete A1.DEUDOR_POR_FICHA["prestamo-cliente"]; }
});

test("★★★ t6-a1 · la galería: antes de responder, solo lo anterior; al responder la decisión 1, el número entra resaltado bajo su deudor", async () => {
  const F = (id) => [...A1.FICHAS_T6_ACT1, ...A1.FICHAS_V2_T6_ACT1].find((f) => f.id === id);
  const items = [F("venta-mercancia"), F("socio"), F("anticipo")];
  const ver = (props) => pagina(renderToStaticMarkup(h(QuienLeDebe, { items, reducido: true, ...props }))).firstChild;
  let el = ver({ indice: 1, hecha: false });
  assert.deepEqual([...el.querySelectorAll("[data-numero-ficha]")].map((n) => [n.closest("[data-deudor]").dataset.deudor, n.textContent, n.dataset.resaltado]), [["clientes", "1", "no"]]);
  assert.equal(el.querySelector('[data-deudor="socios"] [data-numero-ficha]'), null, "R10: la ficha 2 no está antes de responder");
  el = ver({ indice: 1, hecha: true });
  const dos = el.querySelector('[data-deudor="socios"] [data-numero-ficha="2"]');
  assert.equal(dos.dataset.resaltado, "si");
  assert.equal(el.querySelector('[data-deudor="socios"]').dataset.activo, "si", "el deudor, con contorno");
  assert.equal(el.getAttribute("aria-label"), "Ficha 2: la deben socios y accionistas");
  el = ver({ indice: 2, hecha: true });
  assert.ok(el.querySelector('[data-deudor="otro"] [data-numero-ficha="3"]'), "la de anticipo, junto a «otros motivos»");
  assert.equal(el.querySelector('[data-numero-ficha="2"]').dataset.resaltado, "no", "resaltado solo hasta la ficha siguiente");
  assert.deepEqual([...el.querySelectorAll("[data-grupo-deudores]")].map((g) => g.dataset.grupoDeudores), ["clientes", "otras"]);
  assert.equal(el.querySelectorAll("svg[aria-hidden='true']").length, 4, "los cuatro íconos, aria-hidden");
});

test("★★★ t6-a1 · en la partida: la galería entre la devolución y «Siguiente»; el número entra al responder la decisión 1", async () => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const items = [A1.FICHAS_T6_ACT1.find((f) => f.id === "socio")];
  await act(async () => { raiz.render(h(ClientesOOtra, { Marco: MarcoLibros, rotulo: "P", titulo: "P", acento: FAE.ambar, onCompletar: () => {}, items })); });
  assert.ok(caja.querySelector("[data-quien-le-debe]"));
  assert.equal(caja.querySelector("[data-numero-ficha]"), null);
  await act(async () => { caja.querySelector('[data-cajon="otra"]').dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
  assert.equal(caja.querySelector('[data-deudor="socios"] [data-numero-ficha="1"]').dataset.resaltado, "si", "entra ya, durante «¿En cuál?»");
  act(() => raiz.unmount()); caja.remove();
});
