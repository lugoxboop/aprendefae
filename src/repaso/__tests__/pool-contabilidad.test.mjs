import { test } from "node:test";
import assert from "node:assert/strict";

import { SUBJECTS, HACER, actividadesDeTipo, temasVisibles, ACTIVIDADES_TRANSVERSALES, ubicacionDeActividad } from "../../data/subjects.js";
import { ID_REPASO, ID_REPASO_CONTABILIDAD, TEMAS_DEL_POOL_CONTABILIDAD, MINIMO_POOL } from "../repaso.js";
import { REPASOS, REPASO_MACRO, repasoDe, poolDel } from "../repasos.js";
import { POOL_CONTABILIDAD, FUERA_DEL_POOL_CONTABILIDAD } from "../contabilidad/index.js";
import { itemDeRepaso, subtemaPorRegla } from "../contabilidad/forma.js";
import { estadoRepaso, actividadesDelPool, faltanActividades, semillaDelDia, unidadesDe } from "../seleccion.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL REPASO DE CONTABILIDAD: el motor compartido y el pool por células.
 *
 * Lo que se cuida aquí, en orden de gravedad:
 *   1. Que el Repaso de Macro NO cambie: tiene estudiantes reales.
 *   2. Que el de Contabilidad mezcle exactamente los temas que el índice
 *      enseña este semestre, ni uno más.
 *   3. Que lo que entregue cada célula esté bien formado y completo.
 *   4. Que no se publique con el pool vacío.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CONTA = REPASOS[ID_REPASO_CONTABILIDAD];
const hacerDe = (temaId) => actividadesDeTipo(SUBJECTS.contabilidad.topics.find((t) => t.id === temaId), HACER).map((a) => a.id);

test("★ sin decir cuál, el motor sigue siendo el de Macro", () => {
  assert.equal(repasoDe(), REPASO_MACRO);
  assert.equal(REPASO_MACRO.id, ID_REPASO);
  assert.deepEqual(REPASO_MACRO.temas, ["politica-economica", "demanda-agregada", "politica-fiscal", "politica-monetaria"]);
  /* La semilla de Macro es la de siempre: cambiarla le cambiaría la mezcla del día a quien ya la vio. */
  const ahora = new Date("2026-10-23T15:00:00Z");
  assert.equal(semillaDelDia("u1", ahora), "u1:2026-10-23");
  assert.notEqual(semillaDelDia("u1", ahora, CONTA), semillaDelDia("u1", ahora));
});

test("★ lo de un repaso no desbloquea el otro", () => {
  const conta = new Set([...hacerDe("introduccion-contabilidad").slice(0, 2), hacerDe("cuentas-debe-haber")[0]]);
  assert.equal(actividadesDelPool(conta).length, 0, "las de Contabilidad contaron para el de Macro");
  assert.equal(actividadesDelPool(conta, CONTA).length, 3);
  assert.equal(estadoRepaso({ hechas: conta, hechoHoy: false }), "pocas-actividades");
  assert.equal(faltanActividades(conta, CONTA), 0);
  /* Y hacer el propio Repaso no cuenta como actividad del pool. */
  assert.equal(actividadesDelPool(new Set([ID_REPASO_CONTABILIDAD]), CONTA).length, 0);
});

test("★ el pool de Contabilidad son los cuatro temas que el índice enseña", () => {
  assert.deepEqual(CONTA.temas, TEMAS_DEL_POOL_CONTABILIDAD);
  assert.deepEqual(TEMAS_DEL_POOL_CONTABILIDAD, temasVisibles(SUBJECTS.contabilidad).map((t) => t.id),
    "el Repaso mezclaría un tema que el estudiante no puede ver, o dejaría fuera uno que sí ve");
});

test("★ el contrato rechaza un ítem mal formado al cargar, no delante del estudiante", () => {
  const act = hacerDe("cuentas-debe-haber")[0];
  const bien = { subtema: "Débito", enunciado: "x", opciones: [{ id: "a", texto: "A" }, { id: "b", texto: "B" }], correcta: "a", devolucion: () => [] };
  assert.equal(itemDeRepaso(act, "k1", bien).clave, `${act}:k1`);
  assert.equal(itemDeRepaso(act, "k1", bien).materia, "cuentas-debe-haber");
  assert.throws(() => itemDeRepaso(act, "k1", { ...bien, subtema: "" }), /sin subtema/);
  assert.throws(() => itemDeRepaso(act, "k1", { ...bien, correcta: "z" }), /correcta/);
  assert.throws(() => itemDeRepaso(act, "", bien), /sin id/);
  assert.throws(() => itemDeRepaso("no-existe", "k1", bien), /fuera del catálogo/);
  /* Una actividad de un tema oculto no puede entrar al pool del semestre. */
  const oculta = hacerDe("cuentas-por-cobrar")[0];
  assert.throws(() => itemDeRepaso(oculta, "k1", bien), /no está en el Repaso/);
  assert.throws(() => subtemaPorRegla({ debe: "Débito" }, "haber"), /Sin subtema/);
});

test("★ cada ítem entregado está bien formado y su clave es única", () => {
  const claves = new Set();
  for (const x of POOL_CONTABILIDAD) {
    assert.ok(!claves.has(x.clave), `${x.clave} repetida`);
    claves.add(x.clave);
    assert.ok(TEMAS_DEL_POOL_CONTABILIDAD.includes(ubicacionDeActividad(x.actividad)?.temaId), `${x.clave}: fuera de los cuatro temas`);
    for (const o of x.opciones) {
      const bloques = x.devolucion(o.id);
      assert.ok(Array.isArray(bloques), `${x.clave}: la devolución de «${o.id}» no es una lista`);
      for (const b of bloques) assert.ok(["retro", "encabezado", "marca", "nota"].includes(b.tipo) && b.texto, `${x.clave}: bloque mal formado`);
    }
  }
});

test("★ en un tema ya entregado, cada actividad de Hacer está dentro del pool o fuera con su razón", () => {
  for (const f of FUERA_DEL_POOL_CONTABILIDAD) {
    assert.ok(f.id && f.razon, `una entrada de FUERA sin id o sin razón: ${JSON.stringify(f)}`);
  }
  const dentro = new Set(POOL_CONTABILIDAD.map((x) => x.actividad));
  const fuera = new Set(FUERA_DEL_POOL_CONTABILIDAD.map((f) => f.id));
  for (const temaId of TEMAS_DEL_POOL_CONTABILIDAD) {
    const acts = hacerDe(temaId);
    const entregado = acts.some((id) => dentro.has(id) || fuera.has(id));
    if (!entregado) continue; // la célula aún no entrega: el tema no aporta y no rompe nada
    for (const id of acts) {
      assert.ok(dentro.has(id) || fuera.has(id), `${temaId}: ${id} no está ni dentro ni fuera del pool`);
      assert.ok(!(dentro.has(id) && fuera.has(id)), `${id} está a la vez dentro y fuera`);
    }
  }
});

test("★ el Repaso de Contabilidad no se publica con el pool a medias", () => {
  const entrada = ACTIVIDADES_TRANSVERSALES.find((a) => a.id === ID_REPASO_CONTABILIDAD);
  assert.ok(entrada, "no está registrado");
  assert.deepEqual(ubicacionDeActividad(ID_REPASO_CONTABILIDAD), { materiaId: "contabilidad", temaId: ID_REPASO_CONTABILIDAD });
  /* La misma clasificación que el de Macro: el mismo juego, la misma paga. */
  assert.deepEqual(entrada.clasificacion, ACTIVIDADES_TRANSVERSALES.find((a) => a.id === ID_REPASO).clasificacion);
  if (entrada.publicado === false) return;
  for (const temaId of TEMAS_DEL_POOL_CONTABILIDAD) {
    assert.ok(POOL_CONTABILIDAD.some((x) => x.materia === temaId), `se publicó y «${temaId}» no aporta ni un ítem`);
  }
  const todas = new Set(POOL_CONTABILIDAD.map((x) => x.actividad));
  assert.ok(unidadesDe(poolDel(CONTA, todas)).length >= MINIMO_POOL, "se publicó con menos ítems que el mínimo del pool");
});
