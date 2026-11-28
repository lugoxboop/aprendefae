/*
 * Gestión de Proyectos · lote 6 (caps. 11 y 12): lo propio de estas 24 Hacer.
 * - Puntajes del diseño (cuántos ítems puntúa cada pieza) y sorteos.
 * - Los datos de cálculo se RECALCULAN aquí: P × I y zonas de la bandeja de
 *   cata, netos y VME del árbol, el umbral del 62,5 %, la reserva de la curva
 *   S, la rentabilidad de las respuestas, la reserva que queda; y en el cap. 12
 *   el ahorro y el retorno, lo que paga Altamira en cada contrato, los
 *   puntajes ponderados, CPI y SPI, y el mes de llegada de la tostadora.
 * - Lo nuevo de los motores: `destinosDePartida`, la apuesta de Decidir (sin
 *   puntaje), el orden `porValor` con empates y `puntuaPosiciones`.
 * (Que ninguna lámina adelante la respuesta lo cubre gp-lote5, extendida.)
 */
import { test } from "node:test";
import assert from "node:assert/strict";

const { conSemilla } = await import("../../macro2026/comun/azar.js");
const { partidaDe, prepararPieza, itemsDePaso } = await import("../comun/preparar.js");
const { PIEZAS_TEXTO_C11, AMPLIACION_C11, zonaDe, cifra } = await import("../riesgos/textos-c11.js");
const { PIEZAS_TEXTO_C12, TOSTADORA_C12 } = await import("../adquisiciones/textos-c12.js");

const porId = Object.fromEntries([...PIEZAS_TEXTO_C11, ...PIEZAS_TEXTO_C12].map((p) => [p.id, p]));
const total = (id, s = 3) => prepararPieza(porId[id], conSemilla(s)).reduce((t, e) => t + e.pasos.reduce((u, p) => u + itemsDePaso(p), 0), 0);
const pasosDe = (id) => porId[id].etapas.flatMap((e) => [...(e.pasos ?? []).flatMap((m) => m.items ?? [m]), ...(e.banco ?? []), ...[].concat(e.despues ?? [])]);
const paso = (id, p) => pasosDe(id).find((x) => x.id === p);
const casilla = (id, p, c = null) => { const x = paso(id, p); return c ? x.casillas.find((y) => y.id === c) : x.casillas[0]; };
const cuenta = (lista) => lista.reduce((m, x) => ({ ...m, [x.clave]: (m[x.clave] ?? 0) + 1 }), {});
const cerca = (a, b, e = 1e-9) => Math.abs(a - b) < e;

test("lote 6: 12 + 12 piezas y los puntajes del diseño", () => {
  assert.equal(PIEZAS_TEXTO_C11.length, 12);
  assert.equal(PIEZAS_TEXTO_C12.length, 12);
  const esperado = {
    "gp26-pla-c11-h01-fichero": 10, "gp26-pla-c11-h02-movil": 13, "gp26-pla-c11-h03-cable": 18, "gp26-pla-c11-h04-muro": 13,
    "gp26-pla-c11-h05-cata": 9, "gp26-pla-c11-h06-burbujas": 10, "gp26-pla-c11-h07-montana": 10, "gp26-pla-c11-h08-galton": 9,
    "gp26-pla-c11-h09-ladera": 11, "gp26-pla-c11-h10-espejo": 12, "gp26-pla-c11-h11-libro": 15, "gp26-moc-c11-h12-silo": 6,
    "gp26-pla-c12-h01-hacer-comprar": 9, "gp26-pla-c12-h02-contratos": 13, "gp26-pla-c12-h03-sobrecosto": 11, "gp26-pla-c12-h04-rfi-rfq-rfp": 8,
    "gp26-pla-c12-h05-sow": 12, "gp26-pla-c12-h06-metodo-seleccion": 8, "gp26-eje-c12-h07-puntajes": 7, "gp26-eje-c12-h08-conferencia": 5,
    "gp26-moc-c12-h09-reclamacion": 5, "gp26-moc-c12-h10-controlar": 9, "gp26-moc-c12-h11-cierre": 11, "gp26-pla-c12-h12-taller": 19,
  };
  for (const [id, n] of Object.entries(esperado)) for (const s of [1, 7, 23]) assert.equal(total(id, s), n, `${id} (semilla ${s})`);
  /* La apuesta de la caja de Galton no puntúa; el orden de los diez pasos puntúa uno por posición. */
  assert.equal(itemsDePaso(prepararPieza(porId["gp26-pla-c11-h08-galton"], conSemilla(1))[0].pasos[0]), 0);
  assert.equal(itemsDePaso(prepararPieza(porId["gp26-pla-c12-h12-taller"], conSemilla(1))[0].pasos[0]), 10);
});

test("lote 6: sorteos del diseño", () => {
  for (let s = 1; s <= 40; s += 1) {
    const rng = conSemilla(s);
    /* C11 H01: 6 tarjetas, siempre la trampa umbral ↔ matriz, y solo sus 6 pestañas. */
    const e01 = prepararPieza(porId["gp26-pla-c11-h01-fichero"], rng)[0];
    const ids01 = e01.pasos.map((x) => x.id);
    assert.equal(ids01.length, 6);
    for (const id of ["c11h01-06", "c11h01-08"]) assert.ok(ids01.includes(id), `C11 H01 siempre ${id}`);
    for (const x of e01.pasos) assert.deepEqual(x.destinos.map((d) => d.id).sort(), [...new Set(e01.pasos.map((y) => y.clave))].sort(), "C11 H01 solo las pestañas sorteadas");
    /* C11 H02: dos por brazo y siempre la 07. */
    const p02 = partidaDe(porId["gp26-pla-c11-h02-movil"].etapas[0], rng);
    assert.ok(Object.values(cuenta(p02)).every((n) => n === 2), "C11 H02 dos por brazo");
    assert.ok(p02.some((x) => x.id === "c11h02-07"));
    /* C11 H04: 7 notas, al menos 2 por columna. */
    const p04 = partidaDe(porId["gp26-pla-c11-h04-muro"].etapas[0], rng);
    assert.equal(p04.length, 7); assert.ok(Object.values(cuenta(p04)).every((n) => n >= 2), "C11 H04 dos por columna");
    /* C11 H05: siempre las tazas 3 y 4 y al menos una oportunidad. */
    const p05 = partidaDe(porId["gp26-pla-c11-h05-cata"].etapas[0], rng).map((x) => x.id);
    for (const id of ["c11h05-3", "c11h05-4"]) assert.ok(p05.includes(id), `C11 H05 siempre ${id}`);
    assert.ok(p05.some((id) => ["c11h05-7", "c11h05-8"].includes(id)), "C11 H05 al menos una oportunidad");
    /* C11 H06: siempre las dos primeras burbujas. */
    const p06 = partidaDe(porId["gp26-pla-c11-h06-burbujas"].etapas[0], rng).map((x) => x.id);
    for (const id of ["c11h06-01", "c11h06-02"]) assert.ok(p06.includes(id));
    /* C11 H09: siempre la 05 y las cinco estrategias. */
    const e09 = porId["gp26-pla-c11-h09-ladera"].etapas[0];
    const p09 = partidaDe(e09, rng);
    assert.ok(p09.some((x) => x.id === "c11h09-05"));
    assert.equal(Object.keys(cuenta(p09)).length, new Set((e09.banco ?? []).map((x) => x.clave)).size, "C11 H09 todas las estrategias");
    /* C11 H10 y C12 H10: cubrir todas las claves. */
    for (const [id, k] of [["gp26-pla-c11-h10-espejo", 1], ["gp26-moc-c12-h10-controlar", 0]]) {
      const e = porId[id].etapas[k];
      assert.equal(Object.keys(cuenta(partidaDe(e, rng))).length, new Set(e.banco.map((x) => x.clave)).size, `${id} cubre todo`);
    }
    /* C12 H01: 6 de 8, al menos 2 «Hacer». */
    const q01 = partidaDe(porId["gp26-pla-c12-h01-hacer-comprar"].etapas[0], rng);
    assert.equal(q01.length, 6); assert.ok(q01.filter((x) => x.clave === "hacer").length >= 2);
    /* C12 H04: siempre la 06 y la 07. */
    const q04 = partidaDe(porId["gp26-pla-c12-h04-rfi-rfq-rfp"].etapas[0], rng).map((x) => x.id);
    for (const id of ["c12h04-06", "c12h04-07"]) assert.ok(q04.includes(id));
    /* C12 H06: 6 de 7, las dos de menor costo nunca juntas. */
    const q06 = partidaDe(porId["gp26-pla-c12-h06-metodo-seleccion"].etapas[0], rng);
    assert.equal(q06.length, 6); assert.equal(q06.filter((x) => x.clave === "menor").length, 1, "C12 H06 un solo vagón de menor costo");
  }
});

test("la ampliación (cap. 11): cada clave de cálculo sale de los datos del diseño", () => {
  const A = AMPLIACION_C11;
  /* H05: P × I, la zona y la casilla de cada taza; el orden va de mayor a menor. */
  for (const t of A.tazas) {
    /* Con dos decimales, como la escala del diseño (0,90 × 0,05 = 0,045 → 0,05). */
    assert.ok(cerca(Math.round(t.p * t.i * 100) / 100, t.pi), `${t.id}: P × I`);
    const c = paso("gp26-pla-c11-h05-cata", `c11h05-${t.n}`);
    assert.equal(c.casillas.find((x) => x.id === "lado").clave, t.lado);
    assert.equal(c.casillas.find((x) => x.id === "p").clave, `p${Math.round(t.p * 100)}`);
    assert.equal(c.casillas.find((x) => x.id === "i").clave, `i${Math.round(t.i * 100)}`);
  }
  assert.deepEqual(A.tazas.map((t) => zonaDe(t.pi)), ["media", "media", "alta", "baja", "baja", "alta", "media", "baja"]);
  /* H07: netos, VME, el 80 % y el punto de cambio. */
  const R = A.arbol;
  for (const k of ["nueva", "repotenciar"]) for (const d of ["fuerte", "debil"]) assert.equal(R[k][d] - R[k].inversion, R.netos[`${k}-${d}`], `${k}-${d}`);
  const vme = (k, p) => p * R.netos[`${k}-fuerte`] + (1 - p) * R.netos[`${k}-debil`];
  for (const k of ["nueva", "repotenciar"]) assert.ok(cerca(vme(k, R.pFuerte), R.vme[k]), `VME ${k}`);
  assert.equal(paso("gp26-pla-c11-h07-montana", "c11h07-05").clave, `n${R.vme.nueva}`);
  assert.equal(paso("gp26-pla-c11-h07-montana", "c11h07-06").clave, `n${R.vme.repotenciar}`);
  assert.equal(paso("gp26-pla-c11-h07-montana", "c11h07-07").clave, R.vme.repotenciar > R.vme.nueva ? "repotenciar" : "nueva");
  assert.ok(cerca(vme("nueva", 0.8), 760) && cerca(vme("repotenciar", 0.8), 620), "con 80 % gana la nueva");
  assert.ok(cerca(vme("nueva", 0.625), vme("repotenciar", 0.625)), "empatan en 62,5 %");
  assert.ok(cerca(R.riesgos.reduce((s, r) => s + r.p * r.impacto, 0), R.sumaRiesgos));
  assert.equal(paso("gp26-pla-c11-h07-montana", "c11h07-10").clave, `n${R.sumaRiesgos}`);
  /* H08: la curva S en la meta, el 80 % y la reserva. */
  const en = (costo) => A.curva.find(([c]) => c === costo)[1];
  assert.equal(paso("gp26-pla-c11-h08-galton", "c11h08-01").clave, `p${en(A.meta)}`);
  const c80 = A.curva.find(([, p]) => p >= 80)[0];
  assert.equal(paso("gp26-pla-c11-h08-galton", "c11h08-02").clave, `c${c80}`);
  assert.equal(paso("gp26-pla-c11-h08-galton", "c11h08-03").clave, `r${c80 - A.meta}`);
  const tornado = [...A.tornado].sort((a, b) => Math.abs(b.r) - Math.abs(a.r));
  assert.equal(paso("gp26-pla-c11-h08-galton", "c11h08-04").clave, tornado[0].id);
  /* H11: VME después, cambio y rentabilidad; gana la que más rinde por peso. */
  assert.ok(cerca(A.barco.p * A.barco.impacto, A.barco.vme));
  for (const o of A.opciones) {
    assert.ok(cerca(o.p * o.impacto, o.vme), `${o.id}: VME`);
    assert.ok(cerca(o.vme - A.barco.vme, o.cambio), `${o.id}: cambio`);
    assert.ok(cerca(o.cambio / o.costo, o.rent, 0.05), `${o.id}: rentabilidad`);
    assert.equal(casilla("gp26-pla-c11-h11-libro", `c11h11-${o.id}-vme`).clave, o.vme);
    assert.equal(casilla("gp26-pla-c11-h11-libro", `c11h11-${o.id}-rent`).clave, o.rent);
  }
  assert.equal(paso("gp26-pla-c11-h11-libro", "c11h11-elige").clave, [...A.opciones].sort((a, b) => b.rent - a.rent)[0].id);
  /* H12: la reserva que queda no cubre el riesgo abierto. */
  assert.equal(A.reserva.inicial - A.reserva.usada, A.reserva.queda);
  assert.ok(A.reserva.queda < -A.reserva.abiertas);
  assert.equal(cifra(-200), "−200"); assert.equal(cifra(1000), "1.000"); assert.equal(cifra(62.5), "62,5");
});

test("la tostadora (cap. 12): cada clave de cálculo sale de los datos del diseño", () => {
  const T = TOSTADORA_C12;
  /* H01: ahorro y plazo de retorno. */
  assert.equal(T.base.contratista - T.base.materiales, T.base.ahorro);
  assert.equal(T.recuperador.costo / T.recuperador.ahorroMes, T.recuperador.meses);
  assert.equal(casilla("gp26-pla-c12-h01-hacer-comprar", "c12h01-11").clave, 12);
  assert.equal(casilla("gp26-pla-c12-h01-hacer-comprar", "c12h01-12").clave, 24);
  /* H03: lo que paga Altamira con cada contrato. */
  const C = T.contratos;
  const cpif = (x) => x.real + x.honorario - (1 - x.comprador) * (x.real - x.objetivo);
  assert.equal(C.ffp.paga, C.ffp.precio);
  assert.equal(C.fpif.paga, Math.min(C.fpif.tope, C.fpif.costoMasHonorario));
  assert.equal(C.cpff.paga, C.cpff.real + C.cpff.honorario);
  assert.ok(cerca(cpif(C.cpif), C.cpif.paga) && cerca(cpif(C.ahorro), C.ahorro.paga), "CPIF");
  assert.ok(cerca(C.tm.porHora * C.tm.horas + C.tm.materiales, C.tm.paga), "T&M");
  for (const k of Object.keys(C)) {
    const c = pasosDe("gp26-pla-c12-h03-sobrecosto").find((x) => x.id === `c12h03-${k}-paga`);
    if (c) assert.equal(c.casillas[0].clave, C[k].paga, `${k}: la casilla`);
  }
  /* H07: totales ponderados con los pesos de siempre y con los nuevos. */
  for (const [pesos, totales] of [["peso", T.totales], ["pesoNuevo", T.totalesNuevos]]) {
    assert.ok(cerca(T.criterios.reduce((s, c) => s + c[pesos], 0), 1), `${pesos}: suman 100 %`);
    for (const k of ["a", "b", "c"]) assert.ok(cerca(T.criterios.reduce((s, c) => s + c[pesos] * c.notas[k], 0), totales[k]), `${pesos} ${k}`);
  }
  for (const k of ["a", "b", "c"]) assert.equal(casilla("gp26-eje-c12-h07-puntajes", `c12h07-${k}`).clave, T.totales[k]);
  /* H10: CPI = VG ÷ CR y SPI = VG ÷ VP. */
  const V = T.valorGanado;
  assert.ok(cerca(V.vg / V.cr, V.cpi, 0.005) && cerca(V.vg / V.vp, V.spi));
  assert.equal(casilla("gp26-moc-c12-h10-controlar", "c12h10-11", "cpi").clave, V.cpi);
  assert.equal(casilla("gp26-moc-c12-h10-controlar", "c12h10-11", "spi").clave, V.spi);
  /* H12: la tostadora llega en el mes en que se pide + 8 de fabricación; solo pedirla en el mes 1 llega a la obra. */
  const P = T.plazo;
  assert.deepEqual(P.llegadas, { mes1: 1 + P.fabricacion, mes5: P.diseno + P.fabricacion, obra: P.obra + P.fabricacion });
  assert.ok(P.llegadas.mes1 <= P.obra && P.llegadas.mes5 > P.obra);
});

test("motores del lote 6: el orden de los diez pasos puntúa cada posición", () => {
  const orden = prepararPieza(porId["gp26-pla-c12-h12-taller"], conSemilla(5))[0].pasos[0];
  assert.equal(orden.tipo, "ordenar");
  assert.ok(orden.puntuaPosiciones);
  assert.equal(orden.items.length, 10);
});
