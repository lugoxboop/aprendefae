import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * Lote 18 · D8: la segunda vuelta de los 7 Hacer de B (variantes de Futaba).
 *   · la vuelta 1 es la de hoy; desde la 2 se alterna con la variante (impares);
 *   · al terminar una partida, el «Otra vez» ya juega la vuelta siguiente;
 *   · las fichas van en dos mazos fijos; lo demás, en su variante, rotulada «Escenario simulado»;
 *   · las cuentas de Futaba cuadran, y ningún texto reusado conserva un nombre o un mes de hoy.
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
const V = await import("../b5Vuelta.js");
const { useVuelta } = await import("../../components/mecanicas/libros/b5/ConVuelta.jsx");
const S = await import("../../data/b5SegundaVuelta.js");
const T5A1 = await import("../../data/contabilidadT5Act1.js");
const T6A1 = await import("../../data/contabilidadT6Act1.js");
const T6A4 = await import("../../data/contabilidadT6Act4.js");
const T6A6 = await import("../../data/contabilidadT6Act6.js");
const { mazoT5Act1 } = await import("../t5Act1.js");
const { DEBE, HABER } = await import("../../data/contabilidad.js");

const PIEZAS = {
  "b5-t5-a1": (await import("../../components/mecanicas/libros/tema5/QueRentaDa.jsx")).default,
  "b5-t5-a2": (await import("../../components/mecanicas/libros/tema5/CierreSantaPacha.jsx")).default,
  "b5-t6-a1": (await import("../../components/mecanicas/libros/tema6/ClientesOOtra.jsx")).default,
  "b5-t6-a2": (await import("../../components/mecanicas/libros/tema6/ProvisionDeElTorito.jsx")).default,
  "b5-t6-a3": (await import("../../components/mecanicas/libros/tema6/DeudaQueVuelve.jsx")).default,
  "b5-t6-a4": (await import("../../components/mecanicas/libros/tema6/QueSeDebita.jsx")).default,
  "b5-t6-a6": (await import("../../components/mecanicas/libros/tema6/ProvisionPorEdades.jsx")).default,
};
const montar = async (id) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(PIEZAS[id], { Marco: MarcoLibros, rotulo: "PRUEBA", titulo: "Prueba", acento: FAE.ambar, onCompletar: () => {} })); });
  const texto = caja.textContent;
  act(() => raiz.unmount()); caja.remove();
  return texto;
};
const asientoCuadra = (p) => {
  const suma = (lado) => p.asiento.filter((m) => m.lado === lado).reduce((s, m) => s + m.valor, 0);
  return suma(DEBE) === suma(HABER) && suma(DEBE) > 0;
};

test("★★★ la cuenta de vueltas: 0 · hoy, 1 · variante, 2 · hoy…; sin almacenamiento, la de hoy", () => {
  assert.equal(V.vueltasDe("x"), 0);
  assert.equal(V.sumarVuelta("x"), 1);
  assert.equal(V.vueltasDe("x"), 1);
  assert.deepEqual([0, 1, 2, 3].map(V.esVariante), [false, true, false, true]);
  w.localStorage.setItem("fae-b5-vueltas:x", "basura");
  assert.equal(V.vueltasDe("x"), 0);
});

test("★★★ al terminar una partida, la pieza ya tiene la vuelta siguiente (y avisa como siempre)", async () => {
  const vistas = [];
  let completar = null;
  let avisos = 0;
  function Prueba() {
    const { variante, alCompletar } = useVuelta("b5-prueba", () => { avisos += 1; });
    vistas.push(variante);
    completar = alCompletar;
    return null;
  }
  const caja = document.createElement("div");
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(Prueba)); });
  await act(async () => { completar(80); });
  await act(async () => { completar(90); });
  assert.deepEqual([vistas[0], vistas.at(-1)], [false, false]);
  assert.ok(vistas.includes(true), "la vuelta 2 es la variante");
  assert.equal(avisos, 2);
  act(() => raiz.unmount());
});

test("★★★ cada pieza abre la de hoy en la vuelta 1 y la variante en la vuelta 2", async () => {
  const hoyYVariante = {
    "b5-t5-a1": ["Acciones de otra empresa", "Bonos"],
    "b5-t5-a2": ["1 de mayo. Santa Pacha", "Escenario simulado. 1 de marzo. El Roble"],
    "b5-t6-a1": [null, "La empresa le entrega plata a un proveedor como anticipo"],
    "b5-t6-a2": ["31 de diciembre de 2007. El Torito Currambero", "Escenario simulado. 31 de diciembre. La Ceiba"],
    "b5-t6-a3": ["Marzo del año siguiente. El Torito Currambero", "Escenario simulado. Mayo. La Ceiba"],
    "b5-t6-a4": [null, null],
    "b5-t6-a6": ["Una deuda lleva 2 meses vencida.", "Una deuda lleva exactamente 3 meses vencida."],
  };
  for (const [id, [hoy, variante]] of Object.entries(hoyYVariante)) {
    const t1 = await montar(id);
    if (hoy) assert.ok(t1.includes(hoy), `${id}: la vuelta 1 no es la de hoy`);
    w.localStorage.setItem(`fae-b5-vueltas:${id}`, "1");
    const t2 = await montar(id);
    if (variante) assert.ok(t2.includes(variante), `${id}: la vuelta 2 no es la variante`);
    if (id === "b5-t6-a4") assert.ok(T6A4.HECHOS_V2_T6_ACT4.some((x) => t2.includes(x.texto)), "t6-a4: la vuelta 2 trae un hecho nuevo");
    if (id === "b5-t6-a1") assert.ok(T6A1.FICHAS_T6_ACT1.some((x) => t1.includes(x.texto)), "t6-a1: la vuelta 1 trae una ficha de hoy");
    w.localStorage.setItem(`fae-b5-vueltas:${id}`, "2");
    const t3 = await montar(id);
    if (hoy) assert.ok(t3.includes(hoy), `${id}: la vuelta 3 vuelve a la de hoy`);
  }
});

test("★★★ fichas: dos mazos fijos de 9, sin repetidas entre ellos; t6-a1, ocho nuevas con reparto 4 · 2 · 2", () => {
  const [m1, m2] = [0, 1].map(mazoT5Act1);
  assert.equal(m1.length, 9);
  assert.equal(m2.length, 9);
  assert.ok([...m1, ...m2].every(Boolean), "un id del mazo no existe");
  assert.equal(new Set([...m1, ...m2].map((f) => f.id)).size, 18);
  assert.ok(T5A1.FICHAS_V2_T5_ACT1.every((f) => m2.includes(f)));
  const v2 = T6A1.FICHAS_V2_T6_ACT1;
  assert.equal(v2.length, 8);
  const cuenta = (c, l) => v2.filter((f) => f.cuenta === c && f.lado === l).length;
  assert.deepEqual([cuenta(T6A1.OTRA, null), cuenta(T6A1.CLIENTES, T6A1.DEBITA), cuenta(T6A1.CLIENTES, T6A1.ACREDITA)], [4, 2, 2]);
});

test("★★★ las mesas de la variante: cada asiento cuadra y lleva «Escenario simulado»; las cuentas de Futaba", () => {
  const mesas = [...S.PARTES_V2_T5_ACT2, S.COMPRA_V2_T5_ACT2, ...S.PARTES_V2_T6_ACT2, S.PROVISION_V2_T6_ACT2, ...S.PARTES_V2_T6_ACT3, S.CASTIGO_V2_T6_ACT3];
  for (const p of mesas) {
    assert.ok(asientoCuadra(p), `${p.id} no cuadra`);
    assert.ok(p.hecho.startsWith("Escenario simulado."), `${p.id} sin rótulo`);
    assert.ok(p.id.endsWith("-v2"));
  }
  assert.deepEqual(S.PREGUNTAS_V2_T6_ACT2.map((q) => q.correcta), [1810000, 48000, 110000]);
  assert.ok(S.PREGUNTAS_V2_T6_ACT2[0].enunciado.startsWith("Escenario simulado."));
  const x = (v) => (v - S.BARRA_V2_T6_ACT2.desde) / S.BARRA_V2_T6_ACT2.ancho;
  assert.ok(Math.abs(x(S.BARRA_V2_T6_ACT2.clientes) - 2 / 3) < 1e-9, "la pista acaba en el 66,67 %");
});

test("★★★ los textos «de hoy» que se reusan ya no traen nombres, meses ni cantidades de hoy", () => {
  const todo = JSON.stringify([
    S.PARTES_V2_T5_ACT2, S.COMPRA_V2_T5_ACT2, S.ALT_V2_T5_ACT2,
    S.PREGUNTAS_V2_T6_ACT2, S.PARTES_V2_T6_ACT2, S.PROVISION_V2_T6_ACT2, S.ALT_V2_T6_ACT2,
    S.PARTES_V2_T6_ACT3, S.CASTIGO_V2_T6_ACT3, S.ALT_V2_T6_ACT3,
  ]);
  for (const viejo of ["Santa Pacha", "agosto", "noviembre", "625", "$800", "Pablo Moncayo", "El Torito", "Marzo del", "2007", "148.800", "180.000", "31.200", "153.400", "184.600", "100.000"]) {
    assert.ok(!todo.includes(viejo), `queda «${viejo}» en la variante`);
  }
  /* El Roble compra el 1 de marzo; en La Ceiba, el castigo pasa a abril. */
  const t6 = JSON.stringify([S.PREGUNTAS_V2_T6_ACT2, S.PARTES_V2_T6_ACT2, S.PROVISION_V2_T6_ACT2, S.PARTES_V2_T6_ACT3, S.CASTIGO_V2_T6_ACT3]);
  assert.ok(!/marzo/i.test(t6), "queda «marzo» en La Ceiba");
});

test("★★★ t6-a4: diez hechos nuevos con el mismo reparto y lo que se acredita en cada uno", () => {
  const hoy = T6A4.HECHOS_T6_ACT4;
  const v2 = T6A4.HECHOS_V2_T6_ACT4;
  assert.equal(v2.length, 10);
  assert.deepEqual(v2.map((x) => x.respuesta), hoy.map((x) => x.respuesta));
  assert.deepEqual(v2.map((x) => x.errores), hoy.map((x) => x.errores));
  assert.deepEqual(v2.map((x) => T6A4.SE_ACREDITA_T6_ACT4[x.id]), hoy.map((x) => T6A4.SE_ACREDITA_T6_ACT4[x.id]));
});

test("★★★ t6-a6: las cuentas de la segunda cartera y un error para cada opción equivocada", () => {
  const E = T6A6.ESCENARIO_V2_T6_ACT6;
  const [, calcular] = T6A6.PARTES_V2_T6_ACT6;
  const buena = (c) => c.opciones.find((o) => o.tipo === null).valor;
  const prov = E.grupos.map((g) => (g.monto * g.porcentaje) / 100);
  assert.deepEqual(calcular.casillas.map(buena), [prov[1], prov[2], prov[3], E.provision, E.neto]);
  assert.equal(E.grupos.reduce((s, g) => s + g.monto, 0), E.total);
  assert.equal(E.total - E.provision, E.neto);
  for (const p of T6A6.PARTES_V2_T6_ACT6) {
    for (const c of p.casillas) for (const o of c.opciones) if (o.tipo) assert.ok(T6A6.ERRORES_V2_T6_ACT6[o.tipo], `${c.id}: sin texto para ${o.tipo}`);
  }
});
