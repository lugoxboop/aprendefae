import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · EL CATÁLOGO Y LA CONEXIÓN DE b5-t6-a1 (Célula B).
 *
 *   · la actividad está en el bloque de T6, con su clasificación de la guía
 *   · la vista abre desde el camino EXACTAMENTE lo que el catálogo ofrece
 *   · la vista registra con el motor compartido, con el tema de T6
 *   · la migración 0071 trae la fila del servidor, aditiva y repetible
 *   · el panel docente lee el ítem por el texto de la ficha
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { SUBJECTS, HACER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");
const { FICHAS_T6_ACT1 } = await import("../../data/contabilidadT6Act1.js");

const leer = (ruta) => readFileSync(new URL(ruta, import.meta.url), "utf8");
const VISTA = leer("../../components/ContabilidadTema6View.jsx");
const MIGRACION = leer("../../../supabase/migrations/0071_tema6_clientes_o_otra.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === "cuentas-por-cobrar");

test("★★★ b5-t6-a1 está en el bloque de T6: evaluativa, fácil, 10 FP", () => {
  assert.ok(TEMA, "no está el tema cuentas-por-cobrar");
  assert.deepEqual(actividadesDeTipo(TEMA, HACER).map((a) => a.id), ["b5-t6-a1", "b5-t6-a2", "b5-t6-a3"], "la 1, y después las mesas (0074)");
  const c = clasificacionDe("contabilidad", "cuentas-por-cobrar", "b5-t6-a1");
  assert.deepEqual({ modalidad: c.modalidad, dificultad: c.dificultad, fpBase: c.fpBase }, { modalidad: "evaluativa", dificultad: "facil", fpBase: 10 });
  assert.equal(actividadesDeTipo(TEMA, HACER)[0].nombre, "¿Clientes o otra cuenta por cobrar?");
});

test("★★★ la vista abre desde el camino exactamente lo que el catálogo ofrece", async () => {
  const { JUEGOS, TEMA: TEMA_VISTA } = await import("../../components/ContabilidadTema6View.jsx");
  assert.equal(TEMA_VISTA, "cuentas-por-cobrar");
  const ofrecidas = actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort();
  assert.deepEqual(JUEGOS.map((j) => j.id).sort(), ofrecidas);
  for (const j of JUEGOS) assert.equal(typeof j.Mecanica, "function", `${j.id}: sin componente`);
});

test("★★★ la vista registra con el motor compartido, con la materia y el tema de T6", () => {
  assert.match(VISTA, /registrarActividadCompletada\(clas, \{\s*materiaId: MATERIA, temaId: TEMA, actividadId, porcentajeAciertos: porcentaje, duracionMs, detalle,/);
  assert.match(VISTA, /onCompletar=\{\(pct, ms, detalle\) => completar\(juego\.id, pct, ms, detalle\)\}/);
  assert.match(VISTA, /const MATERIA = "contabilidad";/);
});

test("★★★ la 0071: un insert aditivo y repetible, con la clasificación del cliente y su comprobación", () => {
  assert.match(MIGRACION, /insert into public\.actividad_catalogo/);
  assert.match(MIGRACION, /\('b5-t6-a1',\s*'contabilidad',\s*'cuentas-por-cobrar',\s*'evaluativa',\s*'facil',\s*10,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  /* Fuera de los comentarios no hay nada que cambie o borre filas. */
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  assert.match(sentencias, /select activity_id[\s\S]*where activity_id = 'b5-t6-a1';/);
});

test("★★ el panel docente lee cada ítem por el texto de su ficha (recortado a 70, como todos)", () => {
  for (const f of FICHAS_T6_ACT1) assert.equal(etiquetaDeItem("b5-t6-a1", f.id), recortar(f.texto), f.id);
});
