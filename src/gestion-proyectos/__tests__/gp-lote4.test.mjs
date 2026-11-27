/*
 * Gestión de Proyectos · lote 4 (caps. 7 y 8): lo propio de estas 24 Hacer.
 * - Sorteos y puntajes del diseño (cuántos ítems puntúa cada pieza).
 * - Los datos de la bodega (c07 §0) se RECALCULAN aquí desde los paquetes y
 *   el gasto mensual, y cada clave de cálculo debe salir de ellos: línea base,
 *   curva S, índices, las cuatro EAC, ETC, VAC y los dos TCPI.
 * - La hoja de verificación de las cápsulas (c08 §0) suma lo que dice.
 * - Lo nuevo de los motores, montado de verdad: el signo «− / +», la
 *   tolerancia, la trampa del índice invertido, las casillas de marcar y la
 *   exploración sin puntaje.
 */
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
const Observador = class { observe() {} unobserve() {} disconnect() {} };
w.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  ResizeObserver: Observador, IntersectionObserver: Observador,
  requestAnimationFrame: (cb) => setTimeout(() => cb(performance.now() + 10000), 0), cancelAnimationFrame: (id) => clearTimeout(id),
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;
const { conSemilla } = await import("../../macro2026/comun/azar.js");
const { partidaDe, prepararPieza, itemsDePaso } = await import("../comun/preparar.js");
const { PIEZAS_TEXTO_C7, BODEGA_C7, ACUMULADO_C7 } = await import("../costos/textos-c7.js");
const { PIEZAS_TEXTO_C8, CAPSULAS_C8 } = await import("../calidad/textos-c8.js");
const { default: Casillas, casillaBien, numeroDe } = await import("../comun/motores/Casillas.jsx");
const { default: Explorar } = await import("../comun/motores/Explorar.jsx");

const porId = Object.fromEntries([...PIEZAS_TEXTO_C7, ...PIEZAS_TEXTO_C8].map((p) => [p.id, p]));
const total = (id, s = 3) => prepararPieza(porId[id], conSemilla(s)).reduce((t, e) => t + e.pasos.reduce((u, p) => u + itemsDePaso(p), 0), 0);
const pasosDe = (id) => porId[id].etapas.flatMap((e) => [...(e.pasos ?? []), ...(e.banco ?? []), ...[].concat(e.despues ?? [])]);
const casilla = (id, paso, c = null) => { const p = pasosDe(id).find((x) => x.id === paso); return c ? p.casillas.find((x) => x.id === c) : p.casillas[0]; };

test("lote 4: 12 + 12 piezas y los puntajes del diseño", () => {
  assert.equal(PIEZAS_TEXTO_C7.length, 12);
  assert.equal(PIEZAS_TEXTO_C8.length, 12);
  assert.equal(total("gp26-pla-c07-h01-plan-costos"), 10, "C7 H01: 7 cajones + 3 micros");
  assert.equal(total("gp26-pla-c07-h03-tres-valores"), 7, "C7 H03: la exploración no puntúa; 4 cálculos + 3 micros");
  assert.equal(total("gp26-pla-c07-h06-polea"), 12, "C7 H06: 6 colocaciones + 5 cálculos + 1 micro");
  assert.equal(total("gp26-moc-c07-h08-lona"), 6, "C7 H08: 6 ítems");
  assert.equal(total("gp26-moc-c07-h10-telescopio"), 12, "C7 H10: 12 ítems");
  assert.equal(total("gp26-moc-c07-h11-rampa"), 7, "C7 H11: 7 ítems");
  assert.equal(total("gp26-moc-c07-h12-libro"), 3, "C7 H12: 3 errores por corregir");
  assert.equal(total("gp26-moc-c08-h08-monitor"), 14, "C8 H08: 10 + 4");
  assert.equal(total("gp26-eje-c08-h09-tablero"), 8, "C8 H09: 8 de 12");
  assert.equal(total("gp26-moc-c08-h12-despacho"), 13, "C8 H12: 13 ítems");
});

test("lote 4: sorteos del diseño", () => {
  for (let s = 1; s <= 40; s += 1) {
    const rng = conSemilla(s);
    const c01 = partidaDe(porId["gp26-pla-c07-h01-plan-costos"].etapas[0], rng);
    assert.equal(c01.length, 7); assert.equal(new Set(c01.map((x) => x.clave)).size, 7, "C7 H01 una por cajón");
    const b05 = partidaDe(porId["gp26-pla-c07-h05-reservas"].etapas[0], rng);
    assert.deepEqual(["contingencias", "gestion", "estimacion"].map((k) => b05.filter((x) => x.clave === k).length), [3, 2, 1], "C7 H05 3/2/1");
    const m12 = prepararPieza(porId["gp26-moc-c07-h12-libro"], rng)[0].pasos[0].frases;
    assert.deepEqual([m12.filter((f) => f.error).length, m12.filter((f) => !f.error).length], [3, 3], "C7 H12 3 y 3 de 10");
    const g01 = partidaDe(porId["gp26-pla-c08-h01-gondola"].etapas[0], rng);
    assert.equal(g01.length, 6); assert.equal(new Set(g01.map((x) => x.clave)).size, 4, "C8 H01 al menos una por casilla");
    const k02 = partidaDe(porId["gp26-pla-c08-h02-cubetas"].etapas[0], rng);
    assert.equal(k02.length, 8); for (const k of ["prevencion", "evaluacion", "internas", "externas"]) assert.equal(k02.filter((x) => x.clave === k).length, 2, `C8 H02 dos de ${k}`);
    const c05 = partidaDe(porId["gp26-eje-c08-h05-casilleros"].etapas[0], rng);
    assert.equal(c05.length, 8); for (const k of ["planificar", "gestionar", "controlar"]) assert.ok(c05.filter((x) => x.clave === k).length >= 2, `C8 H05 dos o tres de ${k}`);
    const e06 = partidaDe(porId["gp26-eje-c08-h06-espina"].etapas[0], rng);
    const porEspina = e06.reduce((m, x) => ({ ...m, [x.clave]: (m[x.clave] ?? 0) + 1 }), {});
    assert.equal(e06.length, 8); assert.ok(Object.keys(porEspina).length >= 5, "C8 H06 al menos 5 espinas"); assert.ok(Object.values(porEspina).every((v) => v <= 2), "C8 H06 ninguna con más de 2");
    const t09 = partidaDe(porId["gp26-eje-c08-h09-tablero"].etapas[0], rng).map((x) => x.id);
    assert.equal(t09.length, 8); for (const id of ["c8h09-01", "c8h09-07"]) assert.ok(t09.includes(id), `C8 H09 siempre ${id}`);
  }
});

test("la bodega de Santa Marta: cada clave de cálculo sale de los datos del diseño", () => {
  const B = BODEGA_C7;
  for (const p of B.paquetes) {
    if (p.partes) assert.equal(Object.values(p.partes).reduce((a, b) => a + b, 0), p.estimacion, p.id);
    if (p.tres) assert.equal((p.tres.o + 4 * p.tres.m + p.tres.p) / 6, p.estimacion, `${p.id}: beta`);
  }
  const cuenta = (k) => B.paquetes.filter((p) => p.cuenta === k).reduce((s, p) => s + p.estimacion + p.contingencia, 0);
  assert.deepEqual([cuenta("edificio"), cuenta("equipamiento")], [B.cuentas.edificio, B.cuentas.equipamiento]);
  assert.equal(B.paquetes.reduce((s, p) => s + p.estimacion, 0), B.estimaciones);
  assert.equal(B.paquetes.reduce((s, p) => s + p.contingencia, 0), B.contingencias);
  assert.equal(B.estimaciones + B.contingencias, B.bac);
  assert.equal(B.bac + B.gestion, B.presupuesto);
  assert.equal(ACUMULADO_C7.at(-1), B.bac, "la curva S llega al BAC");
  assert.equal(ACUMULADO_C7[3], B.corte.pv, "PV del mes 4");
  assert.deepEqual(B.escalones.slice(0, 3), [ACUMULADO_C7[2], ACUMULADO_C7[5], ACUMULADO_C7[8]], "escalones = acumulado al cierre del trimestre");
  assert.equal(B.escalones[3], B.presupuesto, "el último escalón cubre el presupuesto");
  /* H06: los bloques. */
  for (const [paso, v] of [["c7h06-01", 600], ["c7h06-02", B.cuentas.edificio], ["c7h06-03", B.cuentas.equipamiento], ["c7h06-04", B.bac], ["c7h06-05", B.presupuesto]]) assert.equal(casilla("gp26-pla-c07-h06-polea", paso).clave, v, paso);
  /* H03: triangular y beta. */
  for (const p of pasosDe("gp26-pla-c07-h03-tres-valores").filter((x) => x.metodo)) {
    const v = p.metodo === "beta" ? (p.o + 4 * p.m + p.p) / 6 : (p.o + p.m + p.p) / 3;
    assert.equal(p.casillas[0].clave, v, p.id);
  }
  /* H07: los puntos y los escalones. */
  for (const p of pasosDe("gp26-pla-c07-h07-curva-s").filter((x) => x.mes)) assert.equal(p.casillas[0].clave, ACUMULADO_C7[p.mes - 1], p.id);
  for (const p of pasosDe("gp26-pla-c07-h07-curva-s").filter((x) => x.trimestre)) assert.equal(p.casillas[0].clave, B.escalones[p.trimestre - 1], p.id);
  /* El corte del mes 4. */
  const { pv, ev, ac } = B.corte;
  assert.equal(ev - ac, B.corte.cv); assert.equal(ev - pv, B.corte.sv);
  assert.equal(casilla("gp26-moc-c07-h08-lona", "c7h08-03").clave, ev - ac);
  assert.equal(casilla("gp26-moc-c07-h08-lona", "c7h08-04").clave, ev - pv);
  assert.ok(Math.abs(casilla("gp26-moc-c07-h09-termometros", "c7h09-cpi").clave - ev / ac) < 0.005);
  assert.ok(Math.abs(casilla("gp26-moc-c07-h09-termometros", "c7h09-spi").clave - ev / pv) < 0.005);
  /* H09: cada obra cae en el cuadrante de sus índices. */
  for (const o of porId["gp26-moc-c07-h09-termometros"].etapas[1].banco) {
    const cpi = o.ev / o.ac; const spi = o.ev / o.pv;
    assert.equal(o.clave, `${cpi >= 1 ? "bajo" : "sobre"}-${spi >= 1 ? "adelantada" : "atrasada"}`, o.id);
  }
  /* H10: las cuatro EAC, ETC y VAC. */
  const bac = B.bac; const cpi = ev / ac; const spi = ev / pv;
  const eac = { "c7h10-05": ac + (bac - ev), "c7h10-06": bac / cpi, "c7h10-07": ac + (bac - ev) / (cpi * spi), "c7h10-08": ac + 1000 };
  for (const [paso, v] of Object.entries(eac)) assert.ok(Math.abs(casilla("gp26-moc-c07-h10-telescopio", paso).clave - v) < 0.5, paso);
  assert.equal(casilla("gp26-moc-c07-h10-telescopio", "c7h10-09").clave, bac / cpi - ac, "ETC");
  assert.equal(casilla("gp26-moc-c07-h10-telescopio", "c7h10-10").clave, bac - bac / cpi, "VAC");
  /* H11: los dos TCPI. */
  assert.ok(Math.abs(casilla("gp26-moc-c07-h11-rampa", "c7h11-04").clave - (bac - ev) / (bac - ac)) < 0.005);
  assert.ok(Math.abs(casilla("gp26-moc-c07-h11-rampa", "c7h11-05").clave - (bac - ev) / (bac / cpi - ac)) < 0.005);
});

test("la hoja de verificación de las cápsulas suma lo que dice", () => {
  for (const d of CAPSULAS_C8.defectos) assert.equal(d.dias.reduce((a, b) => a + b, 0), d.total, d.id);
  assert.equal(CAPSULAS_C8.defectos.reduce((s, d) => s + d.total, 0), CAPSULAS_C8.total);
  /* Las siete cápsulas del día 4 son las del cuarto día de la hoja. */
  const hoy = porId["gp26-moc-c08-h07-hoja"].etapas[0].banco;
  for (const d of CAPSULAS_C8.defectos) assert.equal(hoy.filter((x) => x.clave === d.id).length, d.dias[3], `día 4 · ${d.id}`);
  const orden = porId["gp26-moc-c08-h07-hoja"].etapas[1].pasos[0].items.map((x) => x.total);
  assert.deepEqual(orden, [...orden].sort((a, b) => b - a), "el histograma va de la más frecuente a la menos");
});

test("casillas del lote 4: tolerancia, coma, menos tipográfico y marcar", () => {
  const cpi = casilla("gp26-moc-c07-h09-termometros", "c7h09-cpi");
  assert.ok(casillaBien(cpi, "0,8") && casillaBien(cpi, "0,81") && !casillaBien(cpi, "0,83") && !casillaBien(cpi, "1,25"));
  const cv = casilla("gp26-moc-c07-h08-lona", "c7h08-03");
  assert.ok(cv.signo, "CV lleva el botón de signo");
  assert.ok(casillaBien(cv, "-75") && casillaBien(cv, "−75") && casillaBien(cv, "-74") && !casillaBien(cv, "75"));
  assert.equal(numeroDe("−300"), -300);
  const m = casilla("gp26-pla-c08-h01-gondola", "c8h01-09");
  assert.ok(casillaBien(m, "premium-no,basica-no") && !casillaBien(m, "premium-no") && !casillaBien(m, "basica-cumple,basica-no,premium-no"));
});

const clicEn = (b) => act(async () => { b.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
const escribir = (input, valor) => act(async () => {
  Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set.call(input, valor);
  input.dispatchEvent(new w.Event("input", { bubbles: true }));
});
async function montar(Componente, props) {
  const el = document.createElement("div");
  document.body.appendChild(el);
  const raiz = createRoot(el);
  await act(async () => { raiz.render(h(Componente, props)); });
  return { el, q: (s) => el.querySelector(s), desmontar: () => act(async () => { raiz.unmount(); el.remove(); }) };
}

test("casillas montado: la trampa del CPI invertido tiene su retro propia", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const paso = pasosDe("gp26-moc-c07-h09-termometros").find((x) => x.id === "c7h09-cpi");
    const m = await montar(Casillas, { paso, alTerminar: () => {} });
    await escribir(m.q('input[data-casilla="cpi"]'), "1,25");
    await clicEn(m.q("[data-comprobar-casillas]"));
    assert.ok(m.el.textContent.includes("Lo invertiste"), "la retro de la trampa");
    await escribir(m.q('input[data-casilla="cpi"]'), "0,5");
    await clicEn(m.q("[data-comprobar-casillas]"));
    assert.ok(m.el.textContent.includes("300 / 375"), "la retro común al segundo error");
    await m.desmontar();
  } finally { mock.timers.reset(); }
});

test("casillas montado: el botón «− / +» y las casillas de marcar", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const cv = pasosDe("gp26-moc-c07-h08-lona").find((x) => x.id === "c7h08-03");
    let res = null;
    const a = await montar(Casillas, { paso: cv, alTerminar: (r) => { res = r; } });
    await escribir(a.q('input[data-casilla="cv"]'), "75");
    await clicEn(a.q('[data-signo="cv"]'));
    assert.equal(a.q('input[data-casilla="cv"]').value, "-75");
    await clicEn(a.q("[data-comprobar-casillas]"));
    await act(async () => { mock.timers.tick(1000); });
    assert.equal(res.puntos, 1);
    await a.desmontar();

    const marcar = pasosDe("gp26-eje-c08-h10-auditoria").find((x) => x.id === "c8h10-02");
    res = null;
    const b = await montar(Casillas, { paso: marcar, alTerminar: (r) => { res = r; } });
    for (const id of ["practicas", "brechas", "culpables"]) await clicEn(b.q(`[data-marca-casilla="${id}"]`));
    assert.equal(b.q('[data-marca-casilla="culpables"]').getAttribute("aria-pressed"), "true");
    await clicEn(b.q("[data-comprobar-casillas]"));
    assert.ok(b.el.textContent.includes("no busca culpables"), "la retro de la opción marcada de más");
    assert.equal(b.q('[data-casilla-caja="objetivos"]').dataset.estado, "mal");
    await clicEn(b.q('[data-marca-casilla="culpables"]'));
    await clicEn(b.q("[data-comprobar-casillas]"));
    assert.ok(b.q('[data-solucion="objetivos"]').textContent.includes("Aportar a las lecciones aprendidas"), "segundo error: se ve la respuesta");
    await clicEn(b.q("[data-seguir]"));
    assert.equal(res.puntos, 0);
    await b.desmontar();
  } finally { mock.timers.reset(); }
});

test("explorar: sin puntaje y con «Seguir» tras tres movimientos", async () => {
  const paso = porId["gp26-pla-c07-h03-tres-valores"].etapas[0].pasos[0];
  assert.equal(itemsDePaso({ ...paso, tipo: "explorar" }), 0);
  let res = null;
  const vistos = [];
  const m = await montar(Explorar, { paso, escena: { explorar: ({ valores }) => { vistos.push(valores.p); return null; } }, alTerminar: (r) => { res = r; } });
  assert.equal(m.q("[data-seguir]"), null);
  await clicEn(m.q('[data-mas="p"]'));
  await clicEn(m.q('[data-mas="p"]'));
  assert.equal(m.q('[data-valor="p"]').textContent.trim(), "360 M");
  assert.equal(m.q("[data-seguir]"), null, "con dos movimientos aún no");
  await clicEn(m.q('[data-menos="o"]'));
  await clicEn(m.q("[data-seguir]"));
  assert.deepEqual(res, { detalle: [], puntos: 0 });
  assert.equal(vistos.at(-1), 360, "la escena pinta con los valores movidos");
  await m.desmontar();
});
