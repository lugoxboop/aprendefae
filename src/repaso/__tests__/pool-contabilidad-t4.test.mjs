import { test } from "node:test";
import assert from "node:assert/strict";

import { ITEMS_T4, FUERA_T4, PREGUNTA_H4, PARTIDAS_H7 } from "../contabilidad/t4.js";
import { ITEMS_T4 as FILAS_T4, itemsVigentesT4 } from "../../data/contabilidadT4Subtemas.js";
import { H1, H1_ID, ITEMS_H1, DESTINOS_H1, evaluarH1 } from "../../data/contabilidadT4H1.js";
import { H3_ID } from "../../data/contabilidadT4H3.js";
import { H4_ID, RONDAS_H4, PARES_H4, SOBRE_H4, ARQUEO, CHEQUE, evaluarH4, evaluarCuentaH4, itemH4, pesos } from "../../data/contabilidadT4H4.js";
import { H7, H7_ID, SERIES_H7, evaluarPartidaH7 } from "../../data/contabilidadT4H7.js";
import { H8_ID } from "../../data/contabilidadT4H8.js";

/*
 * T4 en el Repaso de Contabilidad (Célula D): lo que entra, lo que queda fuera
 * y la regla de Macro — ni una copia de contenido — comprobada contra el banco.
 */

const de = (act) => ITEMS_T4.filter((x) => x.actividad === act);
const retroDe = (bloques) => bloques.find((b) => b.tipo === "retro")?.texto;
const notaDe = (bloques) => bloques.find((b) => b.tipo === "nota")?.texto;

test("★ entran 23: H1 8, H4 8, H7 7; H3 y H8 fuera con su razón", () => {
  assert.equal(ITEMS_T4.length, 23);
  assert.equal(de(H1_ID).length, 8);
  assert.equal(de(H4_ID).length, 8);
  assert.equal(de(H7_ID).length, 7);
  assert.deepEqual(FUERA_T4.map((f) => f.id), [H3_ID, H8_ID]);
  for (const f of FUERA_T4) assert.ok(f.razon.length > 40, `${f.id}: razón vacía`);
});

test("★ las claves de T4 son vigentes en contabilidadT4Subtemas.js y llevan su subtema", () => {
  const vigentes = new Map(itemsVigentesT4().map((x) => [x.clave, x.subtema]));
  const retiradas = new Set(FILAS_T4.filter((x) => x.retirado).map((x) => x.clave));
  for (const x of ITEMS_T4) {
    assert.ok(vigentes.has(x.clave), `${x.clave} no es un ítem vigente de T4`);
    assert.ok(!retiradas.has(x.clave), `${x.clave} está retirado`);
    assert.equal(x.subtema, vigentes.get(x.clave), `${x.clave}: subtema distinto al de #475`);
  }
});

test("★ el itemId es el que la pieza anota, nunca un índice", () => {
  assert.deepEqual(de(H1_ID).map((x) => x.itemId), ITEMS_H1.map((x) => x.id));
  assert.deepEqual(de(H4_ID).map((x) => x.itemId), Object.entries(PREGUNTA_H4).map(([r, p]) => itemH4(r, p)).sort((a, b) =>
    RONDAS_H4.findIndex((r) => r.id === a.split(":")[0]) - RONDAS_H4.findIndex((r) => r.id === b.split(":")[0])));
  assert.deepEqual(de(H7_ID).map((x) => x.itemId), PARTIDAS_H7);
  for (const x of ITEMS_T4) assert.ok(!/^\d+$/.test(x.itemId), `${x.clave}: el itemId parece un índice`);
});

test("★ H4: una pregunta por ronda, dos distintas por par del sorteo, con el rótulo de escenario", () => {
  assert.deepEqual(Object.keys(PREGUNTA_H4).sort(), RONDAS_H4.map((r) => r.id).sort());
  for (const [a, b] of PARES_H4) assert.notEqual(PREGUNTA_H4[a], PREGUNTA_H4[b], `el par ${a}/${b} repite pregunta`);
  /* 28 claves vigentes de H4 (las rondas que cuadran tienen dos preguntas, las demás cuatro): entran 8 y 20 quedan fuera. */
  const vigentesH4 = itemsVigentesT4().filter((x) => x.actividad === H4_ID).map((x) => x.clave);
  assert.equal(vigentesH4.length, 28);
  assert.equal(vigentesH4.filter((c) => !ITEMS_T4.some((x) => x.clave === c)).length, 20, "las claves vigentes de H4 que quedan fuera a propósito son 20");
  for (const x of de(H4_ID)) assert.equal(x.etiqueta, "Escenario simulado");
  for (const x of [...de(H1_ID), ...de(H7_ID)]) assert.equal(x.etiqueta, undefined, `${x.clave}: no enseña cifras`);
});

/*
 * El molde de una partida de H7: su tipo y su texto sin lo que cambia de una
 * a otra del mismo molde (el nombre, la fecha, «él/ella», «el cliente/la
 * clienta»). Dos partidas del mismo molde comparten la devolución palabra por
 * palabra, así que una le regalaría la respuesta a la otra (Shibukawa, #622).
 */
const TODAS_H7 = SERIES_H7.flatMap((s) => s.partidas);
const NOMBRES_H7 = [...new Set(TODAS_H7.map((p) => p.quien).filter(Boolean))];
const FECHAS_H7 = SERIES_H7.map((s) => s.fecha);
const moldeH7 = (p) => {
  let t = p.texto;
  for (const v of [...NOMBRES_H7, ...FECHAS_H7]) t = t.split(v).join("·");
  return `${p.tipo}|${t.replace(/(?<!\p{L})(él|ella)(?!\p{L})/gu, "·").replace(/\b(el cliente|la clienta)\b/gi, "·")}`;
};

test("★ H7: una partida por molde, y ningún molde del banco se queda sin su tarjeta", () => {
  const moldes = de(H7_ID).map((x) => moldeH7(TODAS_H7.find((p) => p.id === x.itemId)));
  assert.equal(new Set(moldes).size, moldes.length, "dos partidas del mismo molde (solo cambia nombre o fecha) en el pool");
  /* Lo que queda fuera es de verdad repetido: si una partida nueva o corregida trae otro molde, esto avisa para que entre. */
  for (const p of TODAS_H7) assert.ok(moldes.includes(moldeH7(p)), `${p.id}: su molde no está en el pool — revisar si entra`);
  /* Y el molde agrupa también por la devolución: las del mismo molde la comparten. */
  for (const p of TODAS_H7) {
    const q = TODAS_H7.find((r) => moldeH7(r) === moldeH7(p));
    assert.equal(p.acierto, q.acierto);
    assert.deepEqual(p.errores, q.errores);
  }
});

/*
 * ═══════════ REGLA 1: NI UNA COPIA DE CONTENIDO ═══════════
 * El enunciado, las opciones, la correcta y la devolución de cada ítem son
 * los del banco: iguales campo por campo, y la devolución es la salida de la
 * misma función de veredicto de la actividad, para cada opción.
 */
test("★ regla 1 · H1 lee el banco y devuelve lo de evaluarH1", () => {
  for (const x of de(H1_ID)) {
    const b = ITEMS_H1.find((y) => y.id === x.itemId);
    assert.equal(x.enunciado, b.texto);
    assert.equal(x.correcta, b.respuesta);
    assert.equal(x.rotulo, H1.nombre.toUpperCase());
    assert.deepEqual(x.opciones, DESTINOS_H1.map((d) => ({ id: d.id, texto: d.nombre })));
    for (const o of x.opciones) {
      const v = evaluarH1(b, o.id);
      assert.equal(retroDe(x.devolucion(o.id)), v.texto);
      assert.equal(notaDe(x.devolucion(o.id)), v.pagina || undefined);
    }
  }
});

test("★ regla 1 · H4 lee la ronda y devuelve lo de evaluarH4 / evaluarCuentaH4", () => {
  for (const x of de(H4_ID)) {
    const [rid, pid] = x.itemId.split(":");
    const r = RONDAS_H4.find((y) => y.id === rid);
    const p = r.preguntas.find((q) => q.id === pid);
    assert.equal(x.enunciado, `${r.tarjeta} ${SOBRE_H4.gastos}: ${pesos(r.gastos)}. ${SOBRE_H4.caja}: ${pesos(r.caja)}.`);
    assert.equal(x.pregunta, p.pregunta);
    assert.equal(x.rotulo, r.titulo.toUpperCase());
    for (const o of x.opciones) {
      const esperado = pid === ARQUEO ? evaluarH4(p, o.id)
        : pid === CHEQUE ? evaluarH4(p, Number(o.id))
        : evaluarCuentaH4(p, ...o.id.split(":"));
      assert.equal(retroDe(x.devolucion(o.id)), esperado.texto);
      assert.equal(notaDe(x.devolucion(o.id)), r.pagina || undefined);
      assert.equal(o.id === x.correcta, esperado.ok, `${x.clave}: «${o.id}» y la correcta no coinciden con el veredicto de la actividad`);
    }
    if (pid === CHEQUE) assert.deepEqual(x.opciones.map((o) => Number(o.id)), p.opciones);
  }
});

test("★ regla 1 · H7 lee la partida y devuelve lo de evaluarPartidaH7", () => {
  const todas = SERIES_H7.flatMap((s) => s.partidas);
  for (const x of de(H7_ID)) {
    const p = todas.find((q) => q.id === x.itemId);
    assert.equal(x.enunciado, p.texto);
    assert.equal(x.correcta, p.va);
    assert.equal(x.pregunta, H7.consigna);
    for (const o of x.opciones) {
      const v = evaluarPartidaH7(p, o.id);
      assert.equal(retroDe(x.devolucion(o.id)), v.texto);
      assert.equal(notaDe(x.devolucion(o.id)), p.pagina || undefined);
      assert.equal(o.id === x.correcta, v.ok);
    }
  }
});

test("★ ninguna opción se queda sin devolución de la actividad", () => {
  for (const x of ITEMS_T4) for (const o of x.opciones) {
    assert.ok(retroDe(x.devolucion(o.id)), `${x.clave}: «${o.id}» no trae mensaje de la actividad`);
  }
});
