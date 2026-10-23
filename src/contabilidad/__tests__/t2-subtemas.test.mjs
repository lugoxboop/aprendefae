import { test } from "node:test";
import assert from "node:assert/strict";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS SUBTEMAS DE T2 «Las cuentas, el debe y el haber» (issue #471, punto 2)
 *
 *   1 · cada Hacer del tema y cada etapa de «El Ciclo Completo» tiene subtema
 *       —leídos del catálogo (subjects.js), no de una lista copiada aquí—,
 *       salvo las que esperan a Near en PENDIENTE_NEAR
 *   2 · PENDIENTE_NEAR solo encoge: lo que ya tiene subtema se saca de ahí
 *   3 · ninguna clave apunta a una actividad o etapa que no existe
 *   4 · cada [regla] cubre todas las respuestas posibles de su banco
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { SUBJECTS, HACER, actividadesDeTipo, desafioDe } = await import("../../data/subjects.js");
const S = await import("../../data/contabilidadT2Subtemas.js");
const B = await import("../bancos.js");

const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === "cuentas-debe-haber");
const HACERES = actividadesDeTipo(TEMA, HACER).map((a) => a.id);
const DESAFIO = desafioDe(TEMA);
const ETAPAS = Array.from({ length: DESAFIO?.clasificacion?.etapas ?? 0 }, (_, k) => S.claveDeEtapa(k + 1));
const ESPERADAS = [...HACERES, ...ETAPAS];

const tieneSubtema = (clave) => {
  if (S.SUBTEMA_FIJO[clave]) return true;
  const [actividad] = clave.split(":");
  /* Una regla vale para la actividad entera; para una etapa, también la de la actividad. */
  return Boolean(S.SUBTEMA_REGLA[clave] ?? (clave === actividad ? undefined : S.SUBTEMA_REGLA[actividad]));
};

/*
 * Las respuestas posibles de cada banco de T2 cuya respuesta es una categoría
 * (las únicas sobre las que tiene sentido una [regla]). Salen del banco real.
 */
const RESPUESTAS = {
  "cu-izquierda-o-derecha": B.BANCO_IZQUIERDA_O_DERECHA.items.map((i) => i.respuesta),
  "cu-de-que-familia": B.BANCO_DE_QUE_FAMILIA.items.map((i) => i.respuesta),
  "cu-cuadro-dinamicas": B.BANCO_CUADRO_DINAMICAS.items.map((i) => i.respuesta),
  "cu-debita-o-acredita": B.BANCO_DEBITA_O_ACREDITA.items.map((i) => i.respuesta),
};

test("el catálogo da 7 Hacer y un desafío de 4 etapas (si cambia, esta prueba se revisa a la vez)", () => {
  assert.equal(HACERES.length, 7);
  assert.equal(DESAFIO?.id, "ciclo-completo");
  assert.equal(ETAPAS.length, 4);
});

test("cada Hacer y cada etapa del desafío tiene subtema, salvo las de PENDIENTE_NEAR", () => {
  const faltan = ESPERADAS.filter((c) => !tieneSubtema(c) && !S.PENDIENTE_NEAR.includes(c));
  assert.deepEqual(faltan, [], `sin subtema: ${faltan.join(", ")}`);
  for (const c of ESPERADAS.filter((x) => S.SUBTEMA_FIJO[x])) {
    assert.equal(typeof S.SUBTEMA_FIJO[c], "string");
    assert.ok(S.SUBTEMA_FIJO[c].trim(), `${c}: subtema vacío`);
    assert.equal(S.subtemaFijo(c), S.SUBTEMA_FIJO[c]);
  }
});

test("PENDIENTE_NEAR solo encoge: lo que ya tiene subtema sale de la lista", () => {
  const sobran = S.PENDIENTE_NEAR.filter(tieneSubtema);
  assert.deepEqual(sobran, [], `ya tienen subtema, sácalas de PENDIENTE_NEAR: ${sobran.join(", ")}`);
  assert.equal(new Set(S.PENDIENTE_NEAR).size, S.PENDIENTE_NEAR.length, "PENDIENTE_NEAR repite claves");
});

test("ninguna clave apunta a algo que no existe en el catálogo", () => {
  const validas = new Set(ESPERADAS);
  const ajenas = [...Object.keys(S.SUBTEMA_FIJO), ...Object.keys(S.SUBTEMA_REGLA), ...S.PENDIENTE_NEAR]
    .filter((c) => !validas.has(c));
  assert.deepEqual(ajenas, [], `claves que no son Hacer ni etapa de T2: ${ajenas.join(", ")}`);
});

test("cada [regla] cubre todas las respuestas posibles de su banco", () => {
  for (const [actividad, regla] of Object.entries(S.SUBTEMA_REGLA)) {
    const banco = RESPUESTAS[actividad.split(":")[0]];
    assert.ok(banco, `${actividad}: no hay banco de respuestas categóricas contra el que comprobar la regla`);
    assert.ok(regla && typeof regla === "object", `${actividad}: la regla no es un mapeo`);
    const sinNombre = [...new Set(banco)].filter((r) => !regla[r]);
    assert.deepEqual(sinNombre, [], `${actividad}: respuestas sin subtema: ${sinNombre.join(", ")}`);
    for (const r of new Set(banco)) assert.equal(S.subtemaPorRegla(actividad, r), regla[r]);
  }
});

test("subtemaFijo y subtemaPorRegla lanzan ante lo que no tiene nombre", () => {
  assert.throws(() => S.subtemaFijo("no-existe"), /Sin subtema fijo/);
  assert.throws(() => S.subtemaPorRegla("no-existe", "x"), /Sin subtema/);
});
