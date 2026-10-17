import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * D8 · LA VERSIÓN B DEL REPASO DEL CAPÍTULO 5 (r5-1 a r5-5), Célula E.
 *
 *   · los intentos pares juegan la B: el intento cuenta al terminar;
 *   · las cifras de la B salen de sus datos (aquí se comparan con las que
 *     mandó Miyata);
 *   · con los mismos pasos, A y B dan resultados distintos: la respuesta
 *     correcta de la A sale mal en la B;
 *   · los textos con cifra son plantillas: la B nombra sus cifras;
 *   · «Basado en el libro…» sigue en pantalla en la B.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = (q) => ({ matches: /reduced-motion/.test(q), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.scrollTo = () => {};
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, HTMLInputElement: w.HTMLInputElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  requestAnimationFrame: (fn) => setTimeout(fn, 0),
  cancelAnimationFrame: (id) => clearTimeout(id),
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const { useIntento, versionDelIntento } = await import("../../components/repasoCap5/comun.jsx");
const CRUZADO = await import("../../data/repasoCap5Cruzado.js");
const TORO = await import("../../data/repasoCap5ToroNegroTextos.js");
const TORO_J = await import("../../data/repasoCap5ToroNegroJuego.js");
const MATE = await import("../../data/repasoCap5Mate.js");
const MATE_T = await import("../../data/repasoCap5MateTextos.js");
const MATE_J = await import("../../data/repasoCap5MateJuego.js");
const BAL = await import("../../data/repasoCap5Balanza.js");
const BAQ = await import("../../data/repasoCap5BarranquillaTextos.js");
const BAQ_J = await import("../../data/repasoCap5BarranquillaJuego.js");
const PER = await import("../../data/repasoCap5Permanente.js");
const PER_T = await import("../../data/repasoCap5PermanenteTextos.js");
const PER_J = await import("../../data/repasoCap5PermanenteJuego.js");
const { Permanente } = await import("../../components/repasoCap5/Permanente.jsx");
const { pesos } = await import("../../data/contabilidad.js");

const RAIZ = new URL("../../../", import.meta.url);
const plano = (f) => readFileSync(new URL(`orquestador/conocimiento/paquetes/${f}`, RAIZ), "utf8").replace(/\s+/g, " ");

const montados = new Set();
const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  const desmontar = () => { if (!montados.delete(desmontar)) return; act(() => raiz.unmount()); caja.remove(); };
  montados.add(desmontar);
  return { caja };
};
afterEach(() => { for (const d of [...montados]) d(); try { globalThis.localStorage?.clear(); } catch { /* sin almacenamiento */ } });

/* ═══════════ EL INTENTO: impar A, par B; cuenta al terminar ═══════════ */

test("B1 · intento 1 A, 2 B, 3 A; montar sin terminar no cambia la versión", async () => {
  assert.deepEqual([1, 2, 3, 4].map(versionDelIntento), ["A", "B", "A", "B"]);
  let api;
  const Sonda = () => { api = useIntento("r5-prueba"); return h("i", null, api.version); };
  const { caja } = await montar(h(Sonda));
  assert.equal(caja.textContent, "A");
  const otra = await montar(h(Sonda));
  assert.equal(otra.caja.textContent, "A", "montar dos veces no es jugar dos veces");
  let proxima;
  await act(async () => { proxima = api.terminar(); });
  assert.equal(proxima, "B");
  assert.equal(api.intento, 2);
  await act(async () => { proxima = api.terminar(); });
  assert.equal(proxima, "A");
});

test("B1b · una versión fija (pruebas) no alterna", async () => {
  let api;
  const Sonda = () => { api = useIntento("r5-fija", "B"); return null; };
  await montar(h(Sonda));
  assert.equal(api.version, "B");
  let proxima;
  await act(async () => { proxima = api.terminar(); });
  assert.equal(proxima, "B");
});

/* ═══════════ r5-1 · C.8 y C.9 ═══════════ */

test("B2 · r5-1: lo que queda en la C.9 sale de los lotes (A 526, B 565) y la B trae su cita", () => {
  const c9 = (v) => CRUZADO.pantallasDe(v).find((p) => p.id === "c9");
  const queda = (p) => {
    const q = p.lotes.reduce((s, l) => s + l.unidades, 0);
    const v = p.lotes.reduce((s, l) => s + l.unidades * l.costo, 0);
    return Math.round((v / q) * (q - p.vendidas));
  };
  assert.equal(c9("A").opciones.find((o) => o.correcta).valor, queda(c9("A")));
  assert.equal(c9("B").opciones.find((o) => o.correcta).valor, queda(c9("B")));
  assert.equal(c9("B").opciones.find((o) => o.correcta).valor, 565, "la de Miyata");
  assert.notEqual(c9("A").opciones.find((o) => o.correcta).valor, c9("B").opciones.find((o) => o.correcta).valor);
  for (const id of ["c8", "c9"]) assert.match(CRUZADO.pantallasDe("B").find((p) => p.id === id).cita, /^Basado en el libro/);
});

/* ═══════════ r5-2 · Toro Negro ═══════════ */

test("B3 · r5-2: con Roja 850.000 y Negra 1.200.000 el corte de marzo es 233.400 al haber; la respuesta de la A sale mal", () => {
  const A = TORO.versionR5_2("A");
  const B = TORO.versionR5_2("B");
  const p4 = (x) => x.PREGUNTAS_R5_2.find((p) => p.id === "p4");
  assert.deepEqual(p4(B).correcto, { valor: 233400, lado: "credito" });
  assert.equal(B.VALORES.mayo, 1083400, "la de Miyata");
  assert.equal(TORO_J.evaluarSaldo(p4(B), p4(A).correcto).ok, false);
  assert.equal(TORO_J.evaluarSaldo(p4(B), p4(B).correcto).ok, true);
  const p2 = (x) => x.PREGUNTAS_R5_2.find((p) => p.id === "p2");
  assert.equal(TORO_J.evaluarAsiento(p2(B), p2(A).correcto).ok, false);
});

/* ═══════════ r5-3 · Mate ═══════════ */

test("B4 · r5-3: la balanza de la B cierra en 11.627.200 / 20.484.000 y el asiento de la A no sirve en la B", () => {
  const fin = (b) => b.balanzaTras(b.MOVIMIENTO_BALANZA.length);
  assert.equal(fin(BAL.BALANZA_B).debe, 11627200);
  assert.equal(fin(BAL.BALANZA_B).haber, 20484000);
  assert.notEqual(fin(BAL.BALANZA_A).haber, fin(BAL.BALANZA_B).haber);
  const a1A = MATE_T.ASIENTOS_MATE.find((a) => a.id === "a1");
  const a1B = MATE_T.ASIENTOS_MATE_B.find((a) => a.id === "a1");
  const renglones = (a) => a.correctos[0].map((r, k) => ({ id: `r${k}`, ...r }));
  assert.equal(MATE_J.evaluarMate(a1B, renglones(a1A)).ok, false);
  assert.equal(MATE_J.evaluarMate(a1B, renglones(a1B)).ok, true);
  assert.notDeepEqual(MATE.CIFRAS_MATE, MATE.CIFRAS_MATE_B);
});

test("B4b · r5-3: los textos con cifra de la B nombran las cifras de la B", () => {
  const todo = JSON.stringify(MATE_T.ASIENTOS_MATE_B);
  assert.match(todo, /1\.200 unidades/);
  assert.match(todo, /\$13\.050\.000/);
  assert.doesNotMatch(todo, /\$1\.800\.000 menos/);
});

/* ═══════════ r5-4 · Barranquilla ═══════════ */

test("B5 · r5-4: el 18 y el 26 caen fuera de la ventana; sin descuento, el pago de la A sale mal en la B", () => {
  for (const id of ["a7", "a9"]) {
    const a = BAQ.ASIENTOS_BARRANQUILLA.find((x) => x.id === id);
    const b = BAQ.ASIENTOS_BARRANQUILLA_B.find((x) => x.id === id);
    assert.ok(b.ventana.pago > b.ventana.factura + b.ventana.plazo, `${id}: fuera de la ventana`);
    assert.ok(a.ventana.pago <= a.ventana.factura + a.ventana.plazo, `${id}: A dentro`);
    assert.equal(BAQ_J.evaluarBarranquilla(b, a.correctos[0].map((r, k) => ({ id: `r${k}`, ...r }))).ok, false, id);
    assert.equal(BAQ_J.evaluarBarranquilla(b, b.correctos[0].map((r, k) => ({ id: `r${k}`, ...r }))).ok, true, id);
    assert.equal(b.correctos[0].length, 2, `${id}: sin renglón de descuento`);
  }
  assert.equal(BAQ.CALENDARIO_R5_4_B.nombres.a7, "Pago, día 18");
  assert.equal(BAQ.CALENDARIO_R5_4_B.nombres.a9, "Cobro, día 26");
});

/* ═══════════ r5-5 · Permanente ═══════════ */

test("B6 · r5-5: el kárdex de la B da las cifras de Miyata", () => {
  const B = PER.CIFRAS_R5_5.B;
  assert.equal(B.CLAVES.p4.costo, 11928974);
  assert.deepEqual(PER.mostrada(B.fila("v28").saldo), [2600, 2130.17, 5538452]);
  assert.equal(B.VENDIDO_PERMANENTE, 24800798);
  assert.equal(B.VENDIDO_PERIODICO, 24704818);
  assert.equal(B.DIFERENCIA, 95980);
  assert.equal(B.EQUIVOCADAS.p4.conPromedioViejo, 12427968);
  assert.deepEqual(B.TOLERANCIA_P4, { desde: 11928940, hasta: 11928990 });
  /* La tolerancia cubre el exacto y el del promedio mostrado, en las dos versiones. */
  for (const v of ["A", "B"]) {
    const c = PER.CIFRAS_R5_5[v];
    for (const x of [c.CLAVES.p4.costo, c.costoConPromedioMostrado]) assert.ok(x >= c.TOLERANCIA_P4.desde && x <= c.TOLERANCIA_P4.hasta, `${v}: ${x}`);
  }
});

test("B6b · r5-5: el costo de la A sale mal en la B, y al revés", () => {
  const A = PER.CIFRAS_R5_5.A.CLAVES.p4;
  const B = PER.CIFRAS_R5_5.B.CLAVES.p4;
  assert.equal(PER_J.evaluarP4(A, "B").ok, false);
  assert.equal(PER_J.evaluarP4(B, "B").ok, true);
  assert.equal(PER_J.evaluarP4(B, "A").ok, false);
  assert.equal(PER_J.evaluarP4(A, "A").ok, true);
});

test("B6c · r5-5: las plantillas de Miyata, con las cifras de la B", () => {
  const p = (id) => PER_T.PANTALLAS_B.find((x) => x.id === id);
  assert.equal(p("p4").enunciado, "Entra el lote nuevo con su flete. El 28 vendes 5.600. Escribe el nuevo promedio y el costo de esa venta.");
  assert.equal(p("p4").devoluciones.costo[0].texto, "Ese es todo el saldo. Salen 5.600 de las 8.200 unidades.");
  assert.equal(p("p4").acierto, "El lote barato bajó el promedio. Por eso estas 5.600 salen más baratas que las del día 10.");
  assert.match(p("p5").enunciado, /^Mismo mes: en permanente, el costo del mes sale unos \$96\.000 más alto\./);
  assert.equal(pesos(PER.CIFRAS_R5_5.B.DIFERENCIA_REDONDA), "$96.000");
  assert.equal(PER_T.rotulosDe("B").costoDeLas, "COSTO DE LAS 5.600");
  /* La A no cambia. */
  assert.equal(PER_T.PANTALLAS.find((x) => x.id === "p4").enunciado, "Entra el lote nuevo con su flete y luego vendes 6.100. Escribe el nuevo promedio y el costo de esa venta.");
});

test("B6d · r5-5 en pantalla: la B muestra sus 5.600, su rótulo y la cita del libro", async () => {
  const { caja } = await montar(h(Permanente, { pasoInicial: 3, version: "B" }));
  assert.equal(caja.querySelector("[data-paso]").getAttribute("data-version"), "B");
  assert.match(caja.querySelector("[data-enunciado]").textContent, /El 28 vendes 5\.600/);
  assert.match(caja.textContent, /COSTO DE LAS 5\.600/);
  assert.match(caja.querySelector("[data-cita]").textContent, /^Basado en el libro/);
  const a = await montar(h(Permanente, { pasoInicial: 3, version: "A" }));
  assert.match(a.caja.querySelector("[data-enunciado]").textContent, /vendes 6\.100/);
});

/* ═══════════ LOS PAQUETES ═══════════ */

test("B7 · los textos de la B están en los paquetes", () => {
  const r55 = plano("e5-r5-5-v1.md");
  for (const t of [PER_T.PANTALLAS_B[3].enunciado, PER_T.PANTALLAS_B[3].acierto]) assert.ok(r55.includes(t), t);
  const r54 = plano("e5-r5-4-v1.md");
  for (const t of Object.values(BAQ.CALENDARIO_R5_4_B.ventanaOk)) assert.ok(r54.includes(t), t);
});
