/*
 * Gestión de Proyectos · lote 5 (caps. 9 y 10): lo propio de estas 23 Hacer.
 * - Sorteos y puntajes del diseño (cuántos ítems puntúa cada pieza).
 * - Los datos de cálculo se RECALCULAN aquí: los totales ponderados de la hoja
 *   de catación (con los pesos de siempre y los nuevos), las cantidades de la
 *   sumadora, las brechas de las estibas, los costos de las dos salidas y los
 *   porcentajes de la ecosonda.
 * - Lo nuevo de los motores: `miles` en las casillas («15.000»), la apuesta
 *   de Explorar que pasa su valor al revelado, `siempre` con `porClave` y
 *   `alMenosUno` en la partida.
 * - Ninguna lámina adelanta la respuesta del paso: cada casilla de número se
 *   monta con su escena y los pasos anteriores de su etapa, y su clave no
 *   puede estar escrita en la lámina antes de comprobar (lo que pasó en el
 *   lote 4 con el EV de la lona).
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
const { readdirSync } = await import("node:fs");
const { conSemilla } = await import("../../macro2026/comun/azar.js");
const { partidaDe, prepararPieza, itemsDePaso } = await import("../comun/preparar.js");
const { PIEZAS_TEXTO_C9, FESTIVAL_C9 } = await import("../recursos/textos-c9.js");
const { PIEZAS_TEXTO_C10, LANZAMIENTO_C10 } = await import("../comunicaciones/textos-c10.js");
const { default: Casillas, casillaBien } = await import("../comun/motores/Casillas.jsx");
const { default: Decidir } = await import("../comun/motores/Decidir.jsx");
const { default: Explorar } = await import("../comun/motores/Explorar.jsx");

const porId = Object.fromEntries([...PIEZAS_TEXTO_C9, ...PIEZAS_TEXTO_C10].map((p) => [p.id, p]));
const total = (id, s = 3) => prepararPieza(porId[id], conSemilla(s)).reduce((t, e) => t + e.pasos.reduce((u, p) => u + itemsDePaso(p), 0), 0);
const pasosDe = (id) => porId[id].etapas.flatMap((e) => [...(e.pasos ?? []).flatMap((m) => m.items ?? [m]), ...(e.banco ?? []), ...[].concat(e.despues ?? [])]);
const casilla = (id, paso, c = null) => { const p = pasosDe(id).find((x) => x.id === paso); return c ? p.casillas.find((x) => x.id === c) : p.casillas[0]; };
const cuenta = (lista) => lista.reduce((m, x) => ({ ...m, [x.clave]: (m[x.clave] ?? 0) + 1 }), {});

test("lote 5: 12 + 11 piezas y los puntajes del diseño", () => {
  assert.equal(PIEZAS_TEXTO_C9.length, 12);
  assert.equal(PIEZAS_TEXTO_C10.length, 11);
  assert.equal(total("gp26-pla-c09-h01-puertas"), 11, "C9 H01: 7 puertas + 4 uniones");
  assert.equal(total("gp26-pla-c09-h03-raci"), 8, "C9 H03: 4 filas + 4 filas del practicante");
  assert.equal(total("gp26-pla-c09-h05-sumadora"), 10, "C9 H05: 5 técnicas + 4 cálculos + 1 micro");
  assert.equal(total("gp26-eje-c09-h08-torre"), 10, "C9 H08: 4 pares + 5 escenas + la especial");
  assert.equal(total("gp26-eje-c09-h10-microfonos"), 10, "C9 H10: 5 + 4 + el orden (diseño: / 10 ítems)");
  assert.equal(total("gp26-moc-c09-h11-estibas"), 10, "C9 H11: 5 + 4 + el orden");
  assert.equal(total("gp26-eje-c09-h12-rotafolio"), 3, "C9 H12: 3 errores por corregir");
  assert.equal(total("gp26-eje-c10-h01-casillero"), 12, "C10 H01: 4 por ronda");
  assert.equal(total("gp26-eje-c10-h02-maquina"), 6, "C10 H02: 5 fallas + la micro");
  assert.equal(total("gp26-pla-c10-h04-playa"), 9, "C10 H04: 8 + la decisión (la apuesta no puntúa)");
  assert.equal(total("gp26-eje-c10-h09-reunion"), 6, "C10 H09: 6 momentos");
  assert.equal(total("gp26-moc-c10-h11-diapositiva"), 3, "C10 H11: 3 errores por corregir");
});

test("lote 5: sorteos del diseño", () => {
  for (let s = 1; s <= 40; s += 1) {
    const rng = conSemilla(s);
    const p01 = partidaDe(porId["gp26-pla-c09-h01-puertas"].etapas[0], rng).map((x) => x.id);
    assert.equal(p01.length, 7); for (const id of ["c9h01-04", "c9h01-09"]) assert.ok(p01.includes(id), `C9 H01 siempre ${id}`);
    assert.deepEqual(Object.values(cuenta(partidaDe(porId["gp26-pla-c09-h02-gafete"].etapas[0], rng))), [2, 2, 2, 2], "C9 H02 dos por casilla");
    const p04 = partidaDe(porId["gp26-pla-c09-h04-pendon"].etapas[0], rng);
    assert.deepEqual([p04.filter((x) => x.clave === "si").length, p04.filter((x) => x.clave === "no").length], [6, 2], "C9 H04 6 y 2");
    assert.ok(p04.some((x) => x.id === "c9h04-08"), "C9 H04 siempre la autorización formal");
    const p05 = partidaDe(porId["gp26-pla-c09-h05-sumadora"].etapas[0], rng);
    assert.equal(p05.length, 5); assert.equal(Object.keys(cuenta(p05)).length, 4, "C9 H05 una de cada técnica");
    const p08 = partidaDe(porId["gp26-eje-c09-h08-torre"].etapas[1], rng);
    assert.equal(p08.length, 6); assert.equal(p08.at(-1).id, "c9h08-08", "C9 H08 la especial al final");
    assert.ok(p08.some((x) => ["c9h08-06", "c9h08-07"].includes(x.id)), "C9 H08 siempre una de retroceso o estancamiento");
    assert.equal(partidaDe(porId["gp26-eje-c09-h09-consola"].etapas[0], rng).length, 6, "C9 H09 6 de 7");
    const p10 = partidaDe(porId["gp26-eje-c09-h10-microfonos"].etapas[0], rng);
    assert.equal(p10.length, 5); assert.equal(Object.keys(cuenta(p10)).length, 5, "C9 H10 una por técnica");
    for (const e of porId["gp26-eje-c10-h01-casillero"].etapas) assert.equal(partidaDe(e, rng).length, 4, "C10 H01 4 por ronda");
    const q02 = partidaDe(porId["gp26-eje-c10-h02-maquina"].etapas[0], rng);
    assert.equal(q02.length, 5); assert.equal(Object.keys(cuenta(q02)).length, 5, "C10 H02 una por C");
    const q04 = partidaDe(porId["gp26-pla-c10-h04-playa"].etapas[0], rng).map((x) => x.id);
    assert.equal(q04.length, 8); for (const id of ["c10h04-04", "c10h04-05"]) assert.ok(q04.includes(id), `C10 H04 siempre ${id}`);
    for (const [id, n, k] of [["gp26-pla-c10-h05-malecon", 6, 5], ["gp26-pla-c10-h06-banderas", 6, 5]]) {
      const q = partidaDe(porId[id].etapas[0], rng);
      assert.equal(q.length, n); assert.equal(Object.keys(cuenta(q)).length, k, `${id}: al menos una de cada`);
    }
    const q08 = partidaDe(porId["gp26-pla-c10-h08-tablero"].etapas[1], rng);
    assert.deepEqual([q08.filter((x) => x.clave === "si").length, q08.filter((x) => x.clave === "no").length], [6, 2], "C10 H08 6 y 2");
    const m12 = prepararPieza(porId["gp26-eje-c09-h12-rotafolio"], rng)[0].pasos[0].frases;
    assert.deepEqual([m12.filter((f) => f.error).length, m12.filter((f) => !f.error).length], [3, 3], "C9 H12 3 y 3 de 11");
  }
});

test("el festival y el lanzamiento: cada clave de cálculo sale de los datos del diseño", () => {
  const F = FESTIVAL_C9;
  /* H05: personas = horas requeridas ÷ horas que aporta cada persona; el ascendente suma. */
  for (const e of F.estimar) {
    const v = e.sumandos ? e.sumandos.reduce((a, b) => a + b, 0) : e.requeridas / e.porPersona;
    assert.equal(v, e.clave, e.id);
    assert.equal(casilla("gp26-pla-c09-h05-sumadora", e.id).clave, e.clave, `${e.id}: la casilla`);
  }
  /* H07: los totales ponderados, con los pesos de siempre y con los nuevos. */
  for (const [pesos, totales] of [["peso", F.totales], ["pesoNuevo", F.totalesNuevos]]) {
    assert.ok(Math.abs(F.criterios.reduce((s, c) => s + c[pesos], 0) - 1) < 1e-9, `${pesos}: suman 100 %`);
    for (const k of ["a", "b", "c"]) assert.ok(Math.abs(F.criterios.reduce((s, c) => s + c[pesos] * c.notas[k], 0) - totales[k]) < 1e-9, `${pesos} ${k}`);
  }
  for (const k of ["a", "b", "c"]) assert.equal(casilla("gp26-eje-c09-h07-catacion", "c9h07-01", k).clave, F.totales[k]);
  const gana = (t) => Object.entries(t).sort((a, b) => b[1] - a[1])[0][0];
  assert.equal(pasosDe("gp26-eje-c09-h07-catacion").find((x) => x.id === "c9h07-02").clave, gana(F.totales), "gana B");
  assert.equal(gana(F.totalesNuevos), "a", "con los pesos nuevos gana A: el ganador cambia");
  /* H11: las brechas y las dos salidas. */
  assert.equal(casilla("gp26-moc-c09-h11-estibas", "c9h11-01").clave, 15000);
  assert.equal(casilla("gp26-moc-c09-h11-estibas", "c9h11-02", "brecha").clave, 3000);
  assert.equal(casilla("gp26-moc-c09-h11-estibas", "c9h11-03", "brecha").clave, 300);
  assert.equal(casilla("gp26-moc-c09-h11-estibas", "c9h11-06").clave, 1000000);
  assert.equal(casilla("gp26-moc-c09-h11-estibas", "c9h11-07").clave, 6000000);
  assert.equal(F.hielo.plan - F.hielo.real, 0, "el hielo no tiene brecha");
  /* C10 H10: los porcentajes de la ecosonda. */
  for (const m of LANZAMIENTO_C10.monitoreo) {
    assert.equal(Math.round((m.hecho / m.plan) * 100), m.clave, m.id);
    assert.equal(casilla("gp26-moc-c10-h10-ecosonda", m.id).clave, m.clave);
  }
  const C = LANZAMIENTO_C10.correo;
  assert.ok(C.entendieron < C.abrieron && C.abrieron <= C.tiendas, "el revelado de H04 baja: enviados ≥ abiertos > entendidos");
});

test("casillas con miles: «15.000» y «1.000.000» se leen como se escriben aquí", () => {
  const vasos = casilla("gp26-moc-c09-h11-estibas", "c9h11-01");
  assert.ok(casillaBien(vasos, "15.000") && casillaBien(vasos, "15000") && !casillaBien(vasos, "15") && !casillaBien(vasos, "12.000"));
  const a = casilla("gp26-moc-c09-h11-estibas", "c9h11-06");
  assert.ok(casillaBien(a, "1.000.000") && casillaBien(a, "1000000") && !casillaBien(a, "750.000"));
  const t = casilla("gp26-eje-c09-h07-catacion", "c9h07-01", "a");
  assert.ok(casillaBien(t, "3,65") && casillaBien(t, "3.65") && !casillaBien(t, "3,85"), "sin `miles`, el punto sigue siendo decimal");
});

const clicEn = (b) => act(async () => { b.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
async function montar(Componente, props) {
  const el = document.createElement("div");
  document.body.appendChild(el);
  const raiz = createRoot(el);
  await act(async () => { raiz.render(h(Componente, props)); });
  return { el, q: (s) => el.querySelector(s), desmontar: () => act(async () => { raiz.unmount(); el.remove(); }) };
}

/* Las escenas de las 23, por id. */
const ESCENAS = {};
for (const dir of ["recursos", "comunicaciones"]) {
  for (const f of readdirSync(new URL(`../${dir}/`, import.meta.url)).filter((x) => /^C\d\dH\d\d.*\.jsx$/.test(x))) {
    const m = await import(`../${dir}/${f}`);
    ESCENAS[m.ID] = m.ESCENA;
  }
}
const escenaDe = (escena, k) => ({ ...escena, ...(escena.etapas?.[k] ?? {}) });
/* El texto de las láminas, con un espacio entre nodos (si no, «día 1» y «5.000» se leen «día 15.000»). */
const textoDe = (n) => { const out = []; const tw = document.createTreeWalker(n, 4); while (tw.nextNode()) out.push(tw.currentNode.nodeValue); return out.join(" "); };
const laminas = (el) => [...el.querySelectorAll(".gp4-lamina, .gp2-pista, .gp5-chips")].map(textoDe).join(" | ");
const formas = (c) => {
  const n = Number(c.clave);
  const conPuntos = String(Math.trunc(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return [...new Set(Number.isInteger(n) ? [String(n), conPuntos] : [String(c.clave).replace(".", ","), n.toFixed(2).replace(".", ",")])];
};

test("ninguna lámina adelanta la clave de un cálculo antes de comprobar", async () => {
  let revisadas = 0;
  for (const p of [...PIEZAS_TEXTO_C9, ...PIEZAS_TEXTO_C10]) {
    const etapas = prepararPieza(p, conSemilla(4));
    for (const [k, etapa] of etapas.entries()) {
      const escena = escenaDe(ESCENAS[p.id], k);
      for (const [i, paso] of etapa.pasos.entries()) {
        if (paso.tipo !== "casillas") continue;
        const hechos = etapa.pasos.slice(0, i).map((x) => ({ paso: x, destino: x.clave ?? "bien" }));
        const m = await montar(Casillas, { paso, escena, estadoEtapa: { hechos, indice: i, total: etapa.pasos.length }, alTerminar: () => {} });
        const texto = laminas(m.el);
        for (const c of paso.casillas.filter((x) => !x.opciones && !x.marcar && Math.abs(Number(x.clave)) >= 2)) {
          for (const f of formas(c)) assert.ok(!new RegExp(`(^|[^\\d.,])${f.replace(/\./g, "\\.")}([^\\d,]|$)`).test(texto), `${p.id} ${paso.id}: la lámina ya dice ${f} («${texto.slice(0, 160)}»)`);
          revisadas += 1;
        }
        await m.desmontar();
      }
    }
  }
  assert.ok(revisadas >= 14, `casillas revisadas: ${revisadas}`);
});

test("las láminas que se llenan paso a paso: la fila del turno va en «?»", async () => {
  /* C9 H03: la fila del turno de la RACI, en «?» hasta comprobar. */
  const raci = porId["gp26-pla-c09-h03-raci"];
  const fila = raci.etapas[0].pasos[1];
  const m = await montar(Casillas, { paso: fila, escena: escenaDe(ESCENAS[raci.id], 0), estadoEtapa: { hechos: [{ paso: raci.etapas[0].pasos[0], destino: "bien" }] }, alTerminar: () => {} });
  for (const c of ["tu", "patrocinadora", "gerente", "logistica", "sonido"]) assert.equal(m.q(`[data-celda="${fila.id}-${c}"]`).textContent, "?", `celda ${c} del turno`);
  assert.equal(m.q(`[data-celda="c9h03-01-logistica"]`).textContent, "R", "la fila ya resuelta queda en el tablero");
  await m.desmontar();
  /* C9 H07: los vasos de cata no se llenan antes de elegir al ganador. */
  const cat = porId["gp26-eje-c09-h07-catacion"];
  const [tot, gan] = cat.etapas[0].pasos.map((x) => ({ ...x, destinos: x.destinos }));
  const d = await montar(Decidir, { paso: { ...gan, tipo: "decidir" }, escena: escenaDe(ESCENAS[cat.id], 0), estadoEtapa: { hechos: [{ paso: tot, destino: "bien" }] }, alTerminar: () => {} });
  assert.equal(d.q("[data-vasos]"), null, "sin vasos antes de elegir");
  assert.ok(d.q('[data-total="b"]').textContent.includes("3,85"), "los totales que ya calculó, sí");
  await clicEn(d.q('[data-destino-id="b"]'));
  assert.ok(d.q("[data-vasos]"), "los vasos al elegir");
  await d.desmontar();
  /* C10 H09: la lista de los seis pasos no dice el que toca. */
  const reu = porId["gp26-eje-c10-h09-reunion"];
  const paso3 = prepararPieza(reu, conSemilla(1))[0].pasos[2];
  const r = await montar(Decidir, { paso: paso3, escena: ESCENAS[reu.id], estadoEtapa: { hechos: [0, 1].map((k) => ({ paso: reu.etapas[0].pasos[k], destino: "mejor" })) }, alTerminar: () => {} });
  assert.ok(r.q('[data-paso-reunion="2"]').textContent.includes("Invitados"), "los ya hechos se escriben");
  assert.equal(r.q('[data-paso-reunion="3"]').textContent, "?", "el del turno no");
  await r.desmontar();
});

test("la apuesta de C10 H04: sin puntaje y su valor llega al revelado", async () => {
  const playa = porId["gp26-pla-c10-h04-playa"];
  const [apuesta, decision] = prepararPieza(playa, conSemilla(2))[1].pasos;
  assert.equal(itemsDePaso(apuesta), 0);
  let res = null;
  const m = await montar(Explorar, { paso: apuesta, escena: escenaDe(ESCENAS[playa.id], 1), alTerminar: (x) => { res = x; } });
  await clicEn(m.q('[data-menos="apuesta"]'));
  await clicEn(m.q("[data-seguir]"));
  assert.deepEqual(res, { detalle: [], puntos: 0, destino: { apuesta: 19 } });
  await m.desmontar();
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const d = await montar(Decidir, { paso: decision, escena: escenaDe(ESCENAS[playa.id], 1), estadoEtapa: { hechos: [{ paso: apuesta, destino: res.destino }] }, alTerminar: () => {} });
    assert.ok(d.q("[data-revelado]").textContent.includes("Tu apuesta"), "la apuesta junto al revelado");
    assert.ok(d.q('[data-barra-h="Lo entendieron (encuesta)"]').textContent.includes(String(LANZAMIENTO_C10.correo.entendieron)));
    await d.desmontar();
  } finally { mock.timers.reset(); }
});
