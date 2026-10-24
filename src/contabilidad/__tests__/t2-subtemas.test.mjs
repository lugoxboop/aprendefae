import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

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
 *   5 · los nombres son la lista cerrada de 12 de Near, letra por letra, y
 *       las etapas los mismos que ya trae DESAFIO.pesos[].subtema
 *   6 · PROXIMAS (Hacer nuevas aún fuera del catálogo) solo encoge
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { SUBJECTS, HACER, actividadesDeTipo, desafioDe } = await import("../../data/subjects.js");
const S = await import("../../data/contabilidadT2Subtemas.js");
const B = await import("../bancos.js");
const N = await import("../../data/contabilidadT2HacerNuevas.js");
const { DESAFIO: DESAFIO_DATOS } = await import("../../data/contabilidadActividades.js");
const PAQUETE = readFileSync(new URL("../../../orquestador/conocimiento/paquetes/c-t2-1-near-lote.md", import.meta.url), "utf8");

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
  /* Las que vuelven a cero: la regla va por la `clase` de cada cuenta del banco. */
  "cu-las-que-vuelven-a-cero": N.LAS_QUE_VUELVEN_A_CERO.caso.cuentas.map((c) => c.clase),
};
/* Las que vuelven a cero: mientras su banco no exista, las dos clases que fija L (§1); cuando exista, las de sus ítems. */
const CLASES = ["real", "nominal"];
const respuestasDe = (actividad) => RESPUESTAS[actividad] ?? (actividad === "cu-las-que-vuelven-a-cero" && S.PROXIMAS.includes(actividad) ? CLASES : undefined);

test("el catálogo da 10 Hacer (las 7 y las 3 nuevas) y un desafío de 4 etapas (si cambia, esta prueba se revisa a la vez)", () => {
  assert.equal(HACERES.filter((id) => !S.PROXIMAS.includes(id)).length, 10);
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
  const validas = new Set([...ESPERADAS, ...S.PROXIMAS]);
  const ajenas = [...Object.keys(S.SUBTEMA_FIJO), ...Object.keys(S.SUBTEMA_REGLA), ...S.PENDIENTE_NEAR]
    .filter((c) => !validas.has(c));
  assert.deepEqual(ajenas, [], `claves que no son Hacer ni etapa de T2: ${ajenas.join(", ")}`);
});

test("cada [regla] cubre todas las respuestas posibles de su banco", () => {
  for (const [actividad, regla] of Object.entries(S.SUBTEMA_REGLA)) {
    const banco = respuestasDe(actividad.split(":")[0]);
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

test("los nombres son la lista cerrada de 12 de Near (paquete §3), letra por letra, y no sobra ninguno", () => {
  const seccion = PAQUETE.slice(PAQUETE.indexOf("### Lista cerrada de T2 (12)"), PAQUETE.indexOf("### Mapeo"));
  const lista = [...seccion.matchAll(/^\d+\. (.+)$/gm)].map((m) => m[1].trim());
  assert.equal(lista.length, 12);
  assert.deepEqual(S.LISTA_CERRADA_T2, lista);
  const usados = new Set([...Object.values(S.SUBTEMA_FIJO), ...Object.values(S.SUBTEMA_REGLA).flatMap((r) => Object.values(r))]);
  for (const n of usados) assert.ok(lista.includes(n), `«${n}» no está en la lista cerrada`);
  assert.deepEqual(lista.filter((n) => !usados.has(n)), [], "nombres de la lista que nadie usa");
});

test("las etapas usan los mismos nombres que ya trae DESAFIO.pesos (el progreso guardado no queda huérfano)", () => {
  for (const p of DESAFIO_DATOS.pesos) assert.equal(S.SUBTEMA_FIJO[S.claveDeEtapa(p.id)], p.subtema, `etapa ${p.id}`);
});

test("las tres Hacer nuevas (ids de Watari, L §1) tienen subtema; PROXIMAS solo tiene las que aún no están en el catálogo", () => {
  for (const id of ["cu-cuadra-por-valor", "cu-del-diario-al-mayor", "cu-las-que-vuelven-a-cero"]) {
    assert.ok(tieneSubtema(id), `${id} sin subtema`);
    assert.ok(S.PROXIMAS.includes(id) || HACERES.includes(id), `${id}: ni en el catálogo ni en PROXIMAS`);
  }
  const yaEstan = S.PROXIMAS.filter((id) => HACERES.includes(id));
  assert.deepEqual(yaEstan, [], `ya están en el catálogo, sácalas de PROXIMAS: ${yaEstan.join(", ")}`);
  assert.deepEqual(S.SUBTEMA_REGLA["cu-las-que-vuelven-a-cero"], { real: "Clasificación de cuentas reales", nominal: "Clasificación de cuentas nominales" });
});
