import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · ACT. 7 — «El cierre completo» (paquete de Levi).
 *
 *   · las tres partes de cada caso, con sus cifras exactas (las de Gen)
 *   · una cuenta que no se cierra → D; asiento al revés → C; una cuenta que
 *     falta → A; un total o el saldo mal escrito → B
 *   · la parte siguiente no se habilita antes de comprobar la anterior
 *   · «Ganancias y pérdidas» se usa en los dos asientos
 *   · el resumen cuenta sobre 6
 *   · ni «Utilidad del ejercicio», ni «depreciación», ni «venta de activo»
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = (q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.Element.prototype.scrollIntoView = () => {};
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, HTMLInputElement: w.HTMLInputElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const A7 = await import("../../data/contabilidadTema3Act7.js");
const L = await import("../elCierreCompleto.js");
const { DEBE, HABER } = await import("../../data/contabilidad.js");
const { SUBJECTS, HACER } = await import("../../data/subjects.js");
const { default: ElCierreCompleto } = await import("../../components/mecanicas/libros/tema3/ElCierreCompleto.jsx");
const { JUEGOS } = await import("../../components/ContabilidadTema3View.jsx");
const { ASI_SE_JUEGA } = await import("../../data/asiSeJuega.js");
const { REGLAS } = await import("../../docente/etiquetasItem.js");

const { CASOS_ACT7, GYP, ERRORES_ACT7 } = A7;
const [SC, LS] = CASOS_ACT7;
const Marco = ({ children }) => h("div", null, children);
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(ElCierreCompleto, { Marco, ...props })); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const clic = async (el) => { assert.ok(el, "no está el elemento"); await act(async () => { el.click(); }); };
const escribir = async (el, texto) => {
  assert.ok(el, "no está el campo");
  await act(async () => {
    Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set.call(el, texto);
    el.dispatchEvent(new w.Event("input", { bubbles: true }));
  });
};
const q = (caja, s) => caja.querySelector(s);
const sel = (s) => s.replace(/"/g, '\\"');

/* Arma un asiento en pantalla: [[cuenta, lado, valor], …] y lo confirma. */
const armar = async (caja, parte, filas) => {
  for (const [cuenta, lado, valor] of filas) {
    await clic(q(caja, `[data-sacar="${sel(cuenta)}:${lado}"]`));
    await escribir(q(caja, `[data-campo-cifra="${parte}:${sel(cuenta)}"]`), String(valor));
  }
  await clic(q(caja, `[data-confirmar-parte="${parte}"]`));
};
const correcto = (caso, parte) => L.esperadoDe(caso, parte).map((e) => [e.cuenta, e.lado, e.valor]);
const errorDe = (caja, n) => q(caja, `[data-parte="${n}"] [data-panel]`)?.dataset.error;

/* ═══════════════════ LAS CIFRAS ═══════════════════ */

test("★★★ las tres partes de cada caso, con sus cifras exactas (las de Gen y Levi)", () => {
  const sumas = (caso, tipo) => caso.cuentas.filter((c) => c.tipo === tipo).reduce((s, c) => s + c.saldo, 0);
  for (const [caso, a1, a2, saldo] of [[SC, 14800, 10850, 3950], [LS, 22868412, 16886971, 5981441], [A7.EJEMPLO_ACT7, 800000, 500000, 300000]]) {
    assert.deepEqual([caso.asiento1, caso.asiento2, caso.saldo], [a1, a2, saldo], caso.id);
    assert.equal(sumas(caso, A7.INGRESO), a1, `${caso.id}: ingresos`);
    assert.equal(sumas(caso, A7.GASTO), a2, `${caso.id}: gastos`);
    assert.equal(a1 - a2, saldo);
    assert.ok(L.evaluarAsiento(caso, 1, L.esperadoDe(caso, 1)).ok);
    assert.ok(L.evaluarAsiento(caso, 2, L.esperadoDe(caso, 2)).ok);
    assert.ok(L.evaluarSaldo(caso, saldo).ok);
  }
  /* Los siete gastos de La Servicial (libro, p. 165). */
  assert.deepEqual(LS.cuentas.filter((c) => c.tipo === A7.GASTO).map((c) => [c.cuenta, c.saldo]), [
    ["Gasto salarios", 8340625], ["Gasto servicios públicos", 1467018], ["Gasto papelería", 328112], ["Gasto mantenimiento", 1902564],
    ["Gasto materiales e insumos", 3908764], ["Otros gastos", 209675], ["Gasto interés", 730213],
  ]);
  assert.deepEqual(LS.cuentas.filter((c) => c.tipo === A7.INGRESO).map((c) => [c.cuenta, c.saldo]), [
    ["Ingresos por servicios", 21942876], ["Ingresos por intereses", 320114], ["Ingresos varios", 605422],
  ]);
  /* San Calixto: las cinco que no se cierran, con sus saldos. */
  assert.deepEqual(SC.cuentas.filter((c) => c.tipo === A7.NO_SE_CIERRA).map((c) => [c.cuenta, c.saldo]), [
    ["Caja", 14650], ["Cuentas por cobrar – clientes", 6800], ["Equipo de computación", 5000], ["Alquiler por pagar", 2500], ["Aportes sociales", 20000],
  ]);
  assert.deepEqual([SC.pie, LS.pie], ["Basado en el libro, pp. 121-128 y 140", "Basado en el libro, p. 165"]);
  /* «Ganancias y pérdidas» una sola vez en el estante. */
  for (const caso of CASOS_ACT7) assert.equal(L.estanteDe(caso).filter((c) => c === GYP).length, 1);
});

/* ═══════════════════ LOS ERRORES ═══════════════════ */

test("★★★ D si se usa una cuenta que no se cierra; C al revés; A si falta una cuenta; B si un valor o el saldo está mal", () => {
  const bien1 = L.esperadoDe(SC, 1);
  const bien2 = L.esperadoDe(SC, 2);
  const ev = (parte, puestas) => L.evaluarAsiento(SC, parte, puestas).error;
  /* D: Caja en un asiento (aunque lo demás esté bien). */
  assert.equal(ev(1, [...bien1, { cuenta: "Caja", lado: DEBE, valor: 14650 }]), "D");
  assert.equal(ev(2, [...bien2, { cuenta: "Aportes sociales", lado: HABER, valor: 20000 }]), "D");
  /* C: el asiento al revés. */
  assert.equal(ev(1, bien1.map((p) => ({ ...p, lado: p.lado === DEBE ? HABER : DEBE }))), "C");
  assert.equal(ev(2, bien2.map((p) => ({ ...p, lado: p.lado === DEBE ? HABER : DEBE }))), "C");
  /* A: falta una cuenta (el gasto de la máquina, como advirtió Levi). */
  assert.equal(ev(2, bien2.filter((p) => p.cuenta !== "Gasto alquiler")), "A");
  /* B: un total mal escrito; y el saldo. */
  assert.equal(ev(2, bien2.map((p) => (p.cuenta === GYP ? { ...p, valor: 8350 } : p))), "B");
  assert.equal(L.evaluarSaldo(SC, 6450).error, "B");
  assert.equal(L.evaluarSaldo(SC, 3950).error, null);
  assert.deepEqual(ERRORES_ACT7, {
    A: "Faltó una cuenta. Todas las de ingresos y todas las de gastos tienen que quedar en cero.",
    B: "Ese valor no cuadra. Cada asiento suma sus cuentas, y el saldo es la resta entre los dos totales.",
    C: "Ese asiento va al revés. Los ingresos pasan por el debe y los gastos por el haber.",
    D: "Esa cuenta no se cierra. Solo se cierran las de ingresos y las de gastos.",
  });
});

/* ═══════════════════ EN PANTALLA ═══════════════════ */

test("★★★ la parte siguiente no se habilita antes de comprobar la anterior; «Ganancias y pérdidas» en los dos asientos", async () => {
  const m = await montar({ items: [SC] });
  try {
    assert.equal(q(m.caja, '[data-parte="2"]').dataset.estadoParte, "bloqueada");
    assert.equal(q(m.caja, '[data-parte="3"]').dataset.estadoParte, "bloqueada");
    assert.equal(q(m.caja, '[data-mesa="2"]'), null);
    assert.equal(q(m.caja, '[data-campo-cifra="saldo"]'), null);
    /* Armado pero sin confirmar: el 2 sigue bloqueado. */
    await clic(q(m.caja, '[data-sacar="Ingresos por servicios:debe"]'));
    await escribir(q(m.caja, '[data-campo-cifra="1:Ingresos por servicios"]'), "14800");
    assert.equal(q(m.caja, '[data-parte="2"]').dataset.estadoParte, "bloqueada");
    await clic(q(m.caja, '[data-sacar="Ganancias y pérdidas:haber"]'));
    await escribir(q(m.caja, '[data-campo-cifra="1:Ganancias y pérdidas"]'), "14800");
    await clic(q(m.caja, '[data-confirmar-parte="1"]'));
    assert.equal(q(m.caja, '[data-parte="1"] [data-panel]').dataset.panel, "acierto");
    assert.equal(q(m.caja, '[data-parte="2"]').dataset.estadoParte, "activa");
    /* «Ganancias y pérdidas» vuelve a estar en el estante del asiento 2; los ingresos ya no. */
    assert.ok(q(m.caja, '[data-estante="2"] [data-en-estante="Ganancias y pérdidas"]'));
    assert.equal(q(m.caja, '[data-estante="2"] [data-en-estante="Ingresos por servicios"]'), null);
    await armar(m.caja, 2, correcto(SC, 2));
    assert.equal(q(m.caja, '[data-parte="2"] [data-panel]').dataset.panel, "acierto");
    assert.equal(q(m.caja, '[data-parte="3"]').dataset.estadoParte, "activa");
    await escribir(q(m.caja, '[data-campo-cifra="saldo"]'), "3950");
    await clic(q(m.caja, '[data-confirmar-parte="3"]'));
    assert.equal(q(m.caja, '[data-parte="3"] [data-panel]').dataset.panel, "acierto");
  } finally { m.desmontar(); }
});

test("★★★ en pantalla: Caja dispara D y se revela lo correcto; el conector y la diferencia; el campo de 8 dígitos", async () => {
  const m = await montar({ items: [SC] });
  try {
    await armar(m.caja, 1, [...correcto(SC, 1), ["Caja", DEBE, 14650]]);
    assert.equal(errorDe(m.caja, 1), "D");
    assert.equal(q(m.caja, '[data-parte="1"] [data-texto-retro]').textContent, ERRORES_ACT7.D);
    /* Revelado: la mesa queda con lo correcto, y el conector cerrado. */
    assert.deepEqual([...m.caja.querySelectorAll('[data-mesa="1"] [data-en-mesa]')].map((x) => x.dataset.enMesa), ["1:Ingresos por servicios", "1:Ganancias y pérdidas"]);
    assert.equal(q(m.caja, '[data-parte="1"] [data-conector]').dataset.conector, "cerrado");
    assert.equal(q(m.caja, '[data-parte="2"]').dataset.estadoParte, "activa");
    /* Asiento 2 con un gasto de menos: la diferencia a la vista, y A. */
    for (const [cuenta, lado, valor] of correcto(SC, 2).filter(([c]) => c !== "Gasto alquiler")) {
      await clic(q(m.caja, `[data-sacar="${cuenta}:${lado}"]`));
      await escribir(q(m.caja, `[data-campo-cifra="2:${cuenta}"]`), String(valor));
    }
    assert.equal(q(m.caja, '[data-parte="2"] [data-conector]').dataset.conector, "abierto");
    assert.equal(q(m.caja, '[data-parte="2"] [data-diferencia]').dataset.diferencia, "2500");
    await clic(q(m.caja, '[data-confirmar-parte="2"]'));
    assert.equal(errorDe(m.caja, 2), "A");
    /* El saldo mal: B. */
    await escribir(q(m.caja, '[data-campo-cifra="saldo"]'), "6450");
    await clic(q(m.caja, '[data-confirmar-parte="3"]'));
    assert.equal(errorDe(m.caja, 3), "B");
    assert.equal(q(m.caja, '[data-campo-cifra="saldo"]').value, "3.950", "se revela el saldo correcto");
  } finally { m.desmontar(); }
  /* Las cifras de La Servicial caben: 8 dígitos con sus puntos. */
  assert.equal(L.formatearCifra("22868412"), "22.868.412");
  assert.equal(L.formatearCifra("228684129"), "22.868.412", "máximo 8 dígitos");
  assert.equal(L.formatearCifra("1.467,018"), "1.467.018");
});

test("★★★ el resumen cuenta sobre 6: dos casos, tres partes cada uno", async () => {
  let fin = null;
  const m = await montar({ onCompletar: (pct, ms, detalle) => { fin = { pct, detalle }; } });
  try {
    /* San Calixto: el asiento 1 al revés (C) y lo demás bien. */
    await armar(m.caja, 1, correcto(SC, 1).map(([c, l, v]) => [c, l === DEBE ? HABER : DEBE, v]));
    assert.equal(errorDe(m.caja, 1), "C");
    await armar(m.caja, 2, correcto(SC, 2));
    await escribir(q(m.caja, '[data-campo-cifra="saldo"]'), "3950");
    await clic(q(m.caja, '[data-confirmar-parte="3"]'));
    await clic([...m.caja.querySelectorAll("button")].find((b) => b.textContent === "Siguiente caso"));
    /* La Servicial: todo bien. */
    await armar(m.caja, 1, correcto(LS, 1));
    await armar(m.caja, 2, correcto(LS, 2));
    await escribir(q(m.caja, '[data-campo-cifra="saldo"]'), "5981441");
    await clic(q(m.caja, '[data-confirmar-parte="3"]'));
    await clic([...m.caja.querySelectorAll("button")].find((b) => b.textContent === "Ver mi resumen"));
    assert.equal(q(m.caja, "[data-resumen-act7]").textContent, "Bien a la primera: 5 de 6");
    assert.equal(Math.round(fin.pct), Math.round((5 / 6) * 100));
    assert.equal(fin.detalle.length, 6);
    assert.equal(fin.detalle[0].respuesta, "C");
  } finally { m.desmontar(); }
});

/* ═══════════════════ TEXTOS Y TUTORIAL ═══════════════════ */

test("★★★ los textos de Gen, textuales, y el tutorial de la panadería se resuelve con su guion", async () => {
  assert.equal(A7.ACT7_T3.consigna, "Lee los saldos. Arma los dos asientos de cierre y escribe lo que queda.");
  assert.deepEqual(A7.PASOS_ACT7, [
    "Junta todos los ingresos y pásalos a Ganancias y pérdidas.",
    "Junta todos los gastos y pásalos a Ganancias y pérdidas.",
    "Calcula lo que queda en Ganancias y pérdidas.",
  ]);
  const asi = ASI_SE_JUEGA["t3-cierre-completo"];
  assert.ok(asi);
  assert.equal(`Ejemplo: ${asi.alt}`, "Ejemplo: los ingresos pasan por $800.000 y los dos gastos por $500.000. En Ganancias y pérdidas quedan $300.000.");
  const ej = asi.demo.items[0];
  assert.equal(ej.hecho, "Una panadería. Ingresos por ventas $800.000. Gasto harina $300.000. Gasto salarios $200.000.");
  assert.equal(ej.resolucion, "Los ingresos dan $800.000 y los gastos $500.000. En Ganancias y pérdidas quedan $300.000.");
  const m = await montar({ items: [ej], modoDemo: true });
  try {
    for (const t of asi.guion.toques) {
      const el = q(m.caja, t.en);
      assert.ok(el && !el.disabled, `${t.en} no está o está apagado`);
      if (t.escribe) await escribir(el, t.escribe);
      else await clic(el);
    }
    for (const n of [1, 2, 3]) assert.equal(q(m.caja, `[data-parte="${n}"] [data-panel]`).dataset.panel, "acierto", `parte ${n}`);
    assert.equal(q(m.caja, "[data-resolucion]").textContent, ej.resolucion);
  } finally { m.desmontar(); }
});

test("★★★ grep: ni «Utilidad del ejercicio», ni «depreciación», ni «venta de activo», ni impuesto", () => {
  for (const a of ["../../data/contabilidadTema3Act7.js", "../elCierreCompleto.js", "../../components/mecanicas/libros/tema3/ElCierreCompleto.jsx", "../../data/asiSeJuegaTema3.js"]) {
    const fuente = readFileSync(new URL(a, import.meta.url), "utf8");
    assert.doesNotMatch(fuente, /Utilidad del ejercicio|depreciaci[óo]n|venta de activo|impuesto/i, a);
    assert.doesNotMatch(fuente, /\bcolor:\s*(COLOR\.neutro|["']#B8C4D4)/i, `${a}: #B8C4D4 como texto`);
  }
});

/* ═══════════════════ EL REGISTRO ═══════════════════ */

test("★★ al final del camino, después de «Cerrar el periodo»; Maestría · 90 FP; regla docente y migración", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === "ingresos-gastos-y-caja");
  const ids = tema.actividades.map((a) => a.id);
  assert.ok(ids.indexOf("t3-cierre-completo") > ids.indexOf("t3-a5-cerrar-el-periodo"));
  const hacer = tema.actividades.filter((a) => a.clasificacion.tipo === HACER).map((a) => a.id);
  assert.equal(hacer.at(-1), "t3-cierre-completo");
  assert.deepEqual(tema.actividades.find((a) => a.id === "t3-cierre-completo").clasificacion,
    { tipo: HACER, modalidad: "evaluativa", dificultad: "experto", fpBase: 90 });
  assert.equal(JUEGOS.at(-1).id, "t3-cierre-completo");
  assert.equal(REGLAS["t3-cierre-completo"]("t3a7-la-servicial:2"), "La Servicial S.A. · asiento 2");
  const dir = new URL("../../../supabase/migrations/", import.meta.url);
  const sql = readdirSync(dir).filter((f) => f.endsWith(".sql")).map((f) => readFileSync(new URL(f, dir), "utf8")).join("\n");
  assert.match(sql, /\('t3-cierre-completo',\s*'contabilidad',\s*'ingresos-gastos-y-caja',\s*'evaluativa',\s*'experto',\s*90,\s*1\)/);
});
