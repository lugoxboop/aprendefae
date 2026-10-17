import { test } from "node:test";
import assert from "node:assert/strict";
import { montar, conReloj, responder, textoMensaje, medidasCss, leer, cadaOpcion, BOTONES_C4 } from "./c4T71Prueba.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · H3 «¿Cuánto vale lo que sobró?» en el patrón de enganche C4 (motor
 * decisionC4.jsx; Watari, sección t71-h3). La pieza montada, contra los datos
 * de Near (contabilidadT7_1_h3.js, v1 con la corrección 2; las cifras y los
 * paquetes los sigue comprobando t7-1-cuanto-vale-lo-que-sobro.test.mjs):
 *   · los ítems C4 son los de Near, en los dos sentidos; 1 a 4 se escriben
 *   · en pantalla: objetivo, consigna, entrada, ficha, pie, el encabezado del
 *     método y la pregunta
 *   · la cifra cambia la bodega con cada número, antes de comprobar; cada
 *     distractor pinta algo distinto, con su falla; el ítem 5, las barras
 *   · un intento, «Iba aquí: $…», la línea de Near, el foco, el puntaje y el
 *     detalle del primer intento, su etiqueta; catálogo y vista
 * ═══════════════════════════════════════════════════════════════════════════
 */

const D = await import("../../data/contabilidadT7_1_h3.js");
const { CONSECUENCIA_C4, W_H3 } = await import("../c4/t71h3_c4.js");
const { pesosC4 } = await import("../c4/t71Comun.js");
const { default: H3C4 } = await import("../../components/mecanicas/libros/t7/CuantoValeLoQueSobroC4.jsx");
const { JUEGOS_T7_1, TEMA_T7_1 } = await import("../../components/ContabilidadT7_1View.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");
const { HACER, clasificacionDe } = await import("../../data/subjects.js");
const { sinUnSoloIntento } = await import("../armaLaLinea.js");
const { pesos } = await import("../../data/contabilidad.js");

const ITEMS = CONSECUENCIA_C4.items;
const C = D.CIFRAS_H3;

test("★★★ los ítems C4 son los de Near, letra por letra y en los dos sentidos; los de cifra se escriben", () => {
  assert.deepEqual(ITEMS.map((I) => I.id), D.ITEMS_H3.map((it) => it.id), "en el orden de la tabla");
  for (const it of D.ITEMS_H3) {
    const I = ITEMS.find((x) => x.id === it.id);
    assert.deepEqual([I.subtema, I.texto, I.pregunta, I.bien], [it.subtema, it.encabezado, it.pregunta, it.acierto]);
    assert.equal(I.tipo ?? "eleccion", it.opcionesTexto ? "eleccion" : "cifra");
    const valores = [it.correcta, ...it.distractores.map((d) => d.valor)];
    assert.deepEqual(I.opciones.map((o) => (I.tipo === "cifra" ? o.v : o.id)).sort(), valores.map((v) => v).sort());
    assert.deepEqual(I.opciones.filter((o) => o.correcta).map((o) => (I.tipo === "cifra" ? o.v : o.id)), [it.correcta]);
    for (const d of it.distractores) assert.equal(I.opciones.find((o) => (I.tipo === "cifra" ? o.v : o.id) === d.valor).msg, d.retro);
    for (const o of I.opciones) assert.equal(o.t, it.opcionesTexto ? D.METODOS_H3.find((x) => x.valor === o.id).texto : pesos(o.v));
  }
  const near = new Set([...D.ITEMS_H3.flatMap((it) => [it.subtema, it.encabezado, it.pregunta, it.acierto, ...it.distractores.map((d) => d.retro)]), ...D.METODOS_H3.map((m) => m.texto)]);
  for (const I of ITEMS) for (const t of [I.subtema, I.texto, I.pregunta, I.bien, ...I.opciones.map((o) => o.msg)].filter(Boolean)) assert.ok(near.has(t), `«${t}» no es de Near`);
});

test("★★★ en pantalla: objetivo, consigna, la entrada y la ficha de Near, el pie, el método y la pregunta", conReloj(async () => {
  const m = await montar(H3C4, { titulo: D.H3.nombre });
  try {
    assert.equal(m.q("[data-consigna]").textContent, sinUnSoloIntento(D.H3.consigna));
    assert.equal(m.q("[data-entrada]").textContent, D.H3.entrada);
    assert.deepEqual(m.qq("[data-ficha] dt").map((x) => x.textContent), D.FICHA_H3.map(([a]) => a));
    assert.deepEqual(m.qq("[data-ficha] dd").map((x) => x.textContent), D.FICHA_H3.map(([, b]) => b));
    assert.equal(m.q("[data-pie]").textContent, D.H3.pie);
    assert.equal(m.q("[data-texto]").textContent, D.ITEMS_H3[0].encabezado);
    assert.equal(m.q("[data-pregunta]").textContent, D.ITEMS_H3[0].pregunta);
    assert.equal(m.q(".c4-casilla input").getAttribute("aria-label"), D.ITEMS_H3[0].pregunta);
    assert.match(m.q("[data-figura]").textContent, /PEPS · quedan 10 de 80 cajas/);
  } finally { await m.desmontar(); }
}));

test("★★★ C4: la cifra cambia la bodega con cada número; cada distractor pinta lo suyo y su falla (15 opciones)", conReloj(async () => {
  await cadaOpcion(H3C4, ITEMS, (m, I, o) => {
    const est = CONSECUENCIA_C4.consecuencia(I, I.tipo === "cifra" ? o.v : o.id);
    assert.equal(m.falla(), est.falla ?? null);
    assert.equal(Boolean(est.falla), !o.correcta);
    assert.equal(m.q("[data-cuadra]")?.textContent ?? null, est.cuadra ?? null, `${I.id}: el ✓ de lo que cuadra`);
    if (o.correcta && I.id !== "mas-alto") assert.ok(est.cuadra);
  });
  /* Con cada número escrito (Mello C4-1): la cifra en su renglón y nada más; la capa, el ✓ y la falla, solo al comprobar. */
  const m = await montar(H3C4, { items: [ITEMS[0], ITEMS[2]] });
  try {
    for (const x of ["128", "128000", "154000"]) {
      await m.escribir(x);
      assert.equal(m.q("[data-linea-queda]").textContent, W_H3.tuCifra(Number(x)));
      assert.ok(m.q("[data-queda]") == null, "la caja cayó en su capa antes de comprobar");
      assert.ok(m.q("[data-cuadra]") == null && m.falla() == null, "calificó antes de comprobar");
      assert.doesNotMatch(m.q("[data-figura]").innerHTML, /c4-cuadra|c4-falla| mal/);
    }
    await m.clic(m.q('[data-accion="comprobar"]'));
    assert.equal(m.q("[data-queda]").closest("[data-estante]").dataset.estante, "compra", "al comprobar, la caja va a su capa");
    await m.pasar(380);
    await m.clic(m.boton(BOTONES_C4.siguiente));
    await m.escribir("14750");
    assert.equal(m.q("[data-linea-promedio]").textContent, W_H3.promedioPor(14750, null), "el total espera a «Comprobar»");
    assert.ok(m.q("[data-cuadra]") == null);
  } finally { await m.desmontar(); }
  assert.equal(CONSECUENCIA_C4.consecuencia(ITEMS[0], 141000).falla, W_H3.ninguna(14100));
}));

test("★★★ C4: lo que pinta cada distractor de Near, uno por uno (la capa donde caen las 10 cajas, o ninguna)", () => {
  const fallas = (id) => Object.fromEntries(ITEMS.find((I) => I.id === id).opciones.map((o) => [o.id, CONSECUENCIA_C4.consecuencia(ITEMS.find((I) => I.id === id), o.v ?? o.id).falla ?? null]));
  assert.deepEqual(fallas("peps"), { 154000: null, 128000: W_H3.yaSalieron("PEPS"), 147500: W_H3.ninguna(14750) });
  assert.deepEqual(fallas("ueps"), { 128000: null, 154000: W_H3.yaSalieron("UEPS"), 256000: W_H3.ninguna(25600) });
  assert.deepEqual(fallas("costo-promedio"), { 14750: null, 14100: W_H3.difCosto(-52000), 15400: W_H3.difCosto(52000) });
  assert.deepEqual(fallas("final-promedio"), { 147500: null, 141000: W_H3.ninguna(14100), 1180000: W_H3.ninguna(118000) });
  assert.deepEqual(fallas("mas-alto"), { peps: null, ueps: W_H3.otroMasAlto, promedio: W_H3.otroMasAlto });
  const capa = (id, v) => CONSECUENCIA_C4.consecuencia(ITEMS.find((I) => I.id === id), v).queda?.capa ?? null;
  assert.deepEqual([capa("peps", 154000), capa("peps", 128000), capa("ueps", 128000), capa("final-promedio", 147500), capa("peps", 147500)], ["compra", "inicio", "inicio", "prom", null]);
});

test("★★★ la tanda: un intento, «Iba aquí» con la cifra o el método, la línea de Near; foco; puntaje y detalle del primer intento", conReloj(async () => {
  const m = await montar(H3C4);
  const esperado = [];
  try {
    for (const [k, I] of ITEMS.entries()) {
      const it = D.ITEMS_H3[k];
      const o = k % 2 === 1 ? I.opciones.find((x) => x.correcta) : I.opciones.find((x) => !x.correcta);
      await responder(m, I, o);
      const r = I.tipo === "cifra" ? o.v : o.id;
      if (o.correcta) assert.equal(textoMensaje(m), it.acierto);
      else {
        assert.equal(textoMensaje(m), it.distractores.find((d) => d.valor === r).retro);
        const iba = I.tipo === "cifra" ? m.q('[data-escrito="iba"] [data-pastilla]').textContent : m.op(it.correcta).querySelector("[data-pastilla]").textContent;
        assert.equal(iba, I.tipo === "cifra" ? `Iba aquí: ${pesos(it.correcta)}` : "Iba aquí");
      }
      assert.ok(m.q(".c4-porque") == null, "H3 no trae porqué aparte");
      esperado.push([I.id, Boolean(o.correcta), o.correcta ? null : r]);
      const ultimo = k === ITEMS.length - 1;
      await m.clic(m.boton(ultimo ? BOTONES_C4.verResumen : BOTONES_C4.siguiente));
      if (!ultimo) assert.ok(document.activeElement === (m.q("[data-texto]").hidden ? m.q("[data-pregunta]") : m.q("[data-texto]")), "el foco no fue al ítem nuevo");
    }
    assert.equal(m.fin[0][0], 40);
    assert.deepEqual(m.fin[0][2].map((d) => [d.item, d.ok, d.respuesta]), esperado);
    assert.equal(m.q("[data-resumen]").textContent, D.resumenH3(2, 5));
    assert.ok(m.q("[data-caso]") == null, "el caso no va en el cierre");
    for (const d of m.fin[0][2]) assert.equal(etiquetaDeItem(D.H3_ID, d.item), recortar(D.ITEMS_H3.find((x) => x.id === d.item).encabezado ? `${D.ITEMS_H3.find((x) => x.id === d.item).encabezado}: ${D.ITEMS_H3.find((x) => x.id === d.item).pregunta}` : D.ITEMS_H3.find((x) => x.id === d.item).pregunta));
  } finally { await m.desmontar(); }
}));

test("★★ una cifra que no es de Near: la bodega la pinta suelta, «Incorrecto.» sin línea, y el primer intento la guarda", conReloj(async () => {
  const m = await montar(H3C4, { items: [ITEMS[2]] });
  try {
    await m.escribir("15000");
    await m.clic(m.q('[data-accion="comprobar"]'));
    await m.pasar(380);
    assert.equal(m.falla(), W_H3.difCosto(15000 * 80 - C.costoTotal));
    assert.equal(textoMensaje(m), null);
    await m.clic(m.boton(BOTONES_C4.verResumen));
    assert.deepEqual(m.fin[0][2].map((d) => [d.item, d.ok, d.respuesta]), [["costo-promedio", false, 15000]]);
  } finally { await m.desmontar(); }
  assert.equal(W_H3.difCosto(1), `Sobran ${pesosC4(1)} frente a lo que costaron.`);
}));

test("★★★ catálogo y vista: el mismo id y la misma clasificación; la vista abre CuantoValeLoQueSobroC4", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T7_1, D.H3_ID), { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 });
  assert.equal(JUEGOS_T7_1.find((j) => j.id === D.H3_ID).Mecanica, H3C4);
});

test("★★ medidas: letra de 12 px o más; sin teal ni ámbar", () => {
  medidasCss(leer("src/components/mecanicas/libros/t7/CuantoValeLoQueSobroC4.jsx") + leer("src/components/mecanicas/libros/t7/c4T71.jsx"));
});
