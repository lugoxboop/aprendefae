import { test } from "node:test";
import assert from "node:assert/strict";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T1 EN EL REPASO DIARIO DE CONTABILIDAD (src/repaso/contabilidad/t1.js).
 *
 * El etiquetado de Futaba (27-oct), cableado con las decisiones de Sakuta:
 * (a) las devoluciones que lee el Repaso van sin emoji; (b) si el Repaso
 * pregunta otra cosa que lo que la actividad registra, el ítem tiene id propio;
 * (c) las «En una frase» entran como en t3.js; (d) el HUECO (p. 66) no entra.
 * El contrato general lo cuida src/repaso/__tests__/pool-contabilidad.test.mjs;
 * aquí, lo propio de T1.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { ITEMS_T1, FUERA_T1, EN_UNA_FRASE_T1 } = await import("../../repaso/contabilidad/t1.js");
const { SUBJECTS, HACER, actividadesDeTipo, ubicacionDeActividad } = await import("../../data/subjects.js");
const T = await import("../../data/contabilidadTema1.js");
const H = await import("../../data/contabilidadT1Hacer2.js");
const { evaluarT1_1, evaluarT1_2, evaluarT1_6, evaluarT1_8, destinoDe, hechoDeItem } = await import("../tema1.js");
const { evaluarH1, evaluarH2, mensajeH2 } = await import("../tema1Hacer2.js");
const { ID_OCHO_LEEN, deFicha } = await import("../../data/contabilidadT1Secuencia.js");
const { pantallasDe } = await import("../../data/contabilidadT1Pantallas.js");

const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === "introduccion-contabilidad");
const de = (actividad) => ITEMS_T1.filter((x) => x.actividad === actividad);
const ids = (actividad) => de(actividad).map((x) => x.itemId);
const EMOJI = /[✅❌]/u;

test("★★★ las 9 Hacer: ocho dentro y t1-la-ecuacion-en-movimiento fuera, con su razón", () => {
  const hacer = actividadesDeTipo(tema, HACER).map((a) => a.id);
  assert.equal(hacer.length, 9);
  assert.deepEqual(FUERA_T1.map((f) => f.id), [T.T1_5.id]);
  assert.ok(FUERA_T1[0].razon.length > 20);
  for (const id of hacer.filter((x) => x !== T.T1_5.id)) assert.ok(de(id).length > 0, `${id} no aporta ítems`);
  assert.equal(de(T.T1_5.id).length, 0);
});

test("★★★ el itemId es el id que la actividad ya anota (nunca el índice), salvo t1-4, que pregunta otra cosa", () => {
  assert.deepEqual(ids(T.T1_1.id), T.USUARIOS_T1_1.map((u) => u.id));
  assert.deepEqual(ids(T.T1_2.id), T.EMPRESAS.map((e) => e.id));
  assert.deepEqual(ids(H.H2.id), H.FICHAS_H2.map((f) => f.id));
  assert.deepEqual(ids(T.T1_8.id), T.SITUACIONES_T1_8.map((s) => s.id));
  assert.deepEqual(ids(H.H1.id), H.PREGUNTAS_H1.map((q) => q.id));
  assert.deepEqual(ids(T.T1_6.id), T.CONCEPTOS.map((c) => c.id));
  /* (b) La actividad anota `cal-n` por las tres barras; aquí se pregunta el caso: id propio, que el panel docente lee igual. */
  assert.deepEqual(ids(T.T1_4.id), T.TRANSACCIONES_CAP2.map((h) => `${h.id}:caso`));
  for (const h of T.TRANSACCIONES_CAP2) assert.equal(hechoDeItem(`${h.id}:caso`), h.texto);
  for (const x of ITEMS_T1) assert.doesNotMatch(x.itemId, /^\d+$/, `${x.clave}: un índice como id`);
});

test("★★★ (d) de t1-la-articulacion entran p1 y p2; la p3 espera la p. 66 y no entra", () => {
  assert.deepEqual(ids(T.T1_7.id), ["p1", "p2"]);
  assert.ok(T.INVERSO_T1_7.some((q) => q.id === "p3"), "la p3 sigue en el banco");
});

test("★★★ la misma devolución que pinta la actividad, sin emoji (a)", () => {
  const item = (act, id) => de(act).find((x) => x.itemId === id);
  const texto = (x, op) => x.devolucion(op)[0]?.texto;
  for (const u of T.USUARIOS_T1_1) for (const z of ["dentro", "fuera"]) assert.equal(texto(item(T.T1_1.id, u.id), z), evaluarT1_1(u, z).texto);
  for (const e of T.EMPRESAS) for (const c of T.CLASES) assert.equal(texto(item(T.T1_2.id, e.id), c.id), evaluarT1_2(e, c.id).texto);
  for (const f of H.FICHAS_H2) for (const o of f.opciones) assert.equal(texto(item(H.H2.id, f.id), o), mensajeH2(evaluarH2(f, o, 1)));
  for (const s of T.SITUACIONES_T1_8) for (const n of [2, 3, 4, 5]) assert.equal(texto(item(T.T1_8.id, s.id), String(n)), evaluarT1_8(s, n).texto);
  for (const q of H.PREGUNTAS_H1) for (const r of H.RESPUESTAS_H1) assert.equal(texto(item(H.H1.id, q.id), r.id), evaluarH1(q, r.id).texto);
  for (const c of T.CONCEPTOS) {
    const x = item(T.T1_6.id, c.id);
    assert.equal(x.correcta, destinoDe(c));
    for (const o of x.opciones) {
      const [informe, seccion] = o.id.split("-");
      assert.equal(texto(x, o.id), evaluarT1_6(c, { informe, seccion }).texto);
    }
  }
  for (const x of ITEMS_T1) {
    for (const o of x.opciones) {
      const t = texto(x, o.id);
      assert.ok(t, `${x.clave}/${o.id}: sin devolución`);
      assert.doesNotMatch(t, EMOJI, `${x.clave}/${o.id}: la devolución trae emoji`);
    }
  }
});

test("★★ el pool queda variado: cada subtema con dos ítems o más", () => {
  const cuenta = {};
  for (const x of ITEMS_T1) cuenta[x.subtema] = (cuenta[x.subtema] ?? 0) + 1;
  assert.equal(ITEMS_T1.length, 79);
  assert.equal(Object.keys(cuenta).length, 24);
  for (const [s, n] of Object.entries(cuenta)) assert.ok(n >= 2, `«${s}» tiene ${n}`);
});

test("★★★ (c) las «En una frase» leen la ficha de la secuencia, con la pieza del catálogo", () => {
  assert.equal(EN_UNA_FRASE_T1.length, 8);
  for (const x of EN_UNA_FRASE_T1) {
    assert.ok(ubicacionDeActividad(x.actividad), `${x.clave}: fuera del catálogo`);
    const pieza = x.actividad === ID_OCHO_LEEN ? "cu0-a1-recorrido-de-un-hecho" : x.actividad;
    const ficha = deFicha(pieza, pantallasDe(pieza).find((p) => p.hace === "frase").n);
    assert.deepEqual(x.opciones.map((o) => o.texto), ficha.opciones.map((o) => o.texto.texto));
    if (x.itemId === "en-una-frase") {
      assert.equal(x.enunciado, ficha.texto[0].texto);
      assert.equal(x.correcta, ficha.opciones.find((o) => o.correcta).id);
      for (const o of ficha.opciones) assert.equal(x.devolucion(o.id)[0].texto, o.devolucion.texto);
    } else {
      assert.equal(x.enunciado, ficha.segunda.pregunta.texto);
      assert.equal(x.correcta, ficha.segunda.correcta);
    }
  }
  /* Mientras cu0-a1b no esté en el catálogo, la frase de cu0-a1 cuenta para cu0-a1. */
  if (!ubicacionDeActividad(ID_OCHO_LEEN)) assert.equal(EN_UNA_FRASE_T1.filter((x) => x.actividad === "cu0-a1-recorrido-de-un-hecho").length, 2);
});

test("★★ las opciones que el banco trae con la correcta primero se barajan", () => {
  for (const x of [...de(H.H2.id), ...de(T.T1_7.id), ...EN_UNA_FRASE_T1]) assert.equal(x.barajarOpciones, true, x.clave);
});
