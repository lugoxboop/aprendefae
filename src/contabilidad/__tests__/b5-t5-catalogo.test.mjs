import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 5 · EL CATÁLOGO Y LA CONEXIÓN DE b5-t5-a1 (Célula B).
 *
 *   · la actividad está en el bloque de T5, con su clasificación de la guía
 *   · la vista abre desde el camino EXACTAMENTE lo que el catálogo ofrece
 *   · la vista registra con el motor compartido, con el tema de T5
 *   · la migración 0070 trae la fila del servidor, aditiva y repetible
 *   · el panel docente lee el ítem por el texto de la ficha
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { SUBJECTS, HACER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");
const { FICHAS_T5_ACT1 } = await import("../../data/contabilidadT5Act1.js");

const leer = (ruta) => readFileSync(new URL(ruta, import.meta.url), "utf8");
const VISTA = leer("../../components/ContabilidadTema5View.jsx");
const MIGRACION = leer("../../../supabase/migrations/0070_tema5_que_renta_da.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === "activos-financieros");

test("★★★ b5-t5-a1 está en el bloque de T5: evaluativa, fácil, 10 FP", () => {
  assert.ok(TEMA, "no está el tema activos-financieros");
  /* Desde N1 de la Célula C (decisión de corte de T5, punto 6), N1 y N3 van entre las dos de B. */
  assert.deepEqual(actividadesDeTipo(TEMA, HACER).map((a) => a.id), ["b5-t5-a1", "t5-temporal-o-largo-plazo", "t5-revision-que-falta", "b5-t5-a2"]);
  const c = clasificacionDe("contabilidad", "activos-financieros", "b5-t5-a1");
  assert.deepEqual({ modalidad: c.modalidad, dificultad: c.dificultad, fpBase: c.fpBase }, { modalidad: "evaluativa", dificultad: "facil", fpBase: 10 });
  assert.equal(actividadesDeTipo(TEMA, HACER)[0].nombre, "¿Qué renta da este título?");
});

test("★★★ la vista abre desde el camino exactamente lo que el catálogo ofrece", async () => {
  const { JUEGOS, TEMA: TEMA_VISTA } = await import("../../components/ContabilidadTema5View.jsx");
  assert.equal(TEMA_VISTA, "activos-financieros");
  const ofrecidas = actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort();
  assert.deepEqual(JUEGOS.map((j) => j.id).sort(), ofrecidas);
  for (const j of JUEGOS) assert.equal(typeof j.Mecanica, "function", `${j.id}: sin componente`);
});

test("★★★ la vista registra con el motor compartido, con la materia y el tema de T5", () => {
  assert.match(VISTA, /registrarActividadCompletada\(clas, \{\s*materiaId: MATERIA, temaId: TEMA, actividadId, porcentajeAciertos: porcentaje, duracionMs, detalle,/);
  assert.match(VISTA, /onCompletar=\{\(pct, ms, detalle\) => completar\(juego\.id, pct, ms, detalle\)\}/);
  assert.match(VISTA, /const MATERIA = "contabilidad";/);
});

test("★★★ la 0070: un insert aditivo y repetible, con la clasificación del cliente y su comprobación", () => {
  assert.match(MIGRACION, /insert into public\.actividad_catalogo/);
  assert.match(MIGRACION, /\('b5-t5-a1',\s*'contabilidad',\s*'activos-financieros',\s*'evaluativa',\s*'facil',\s*10,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  /* Fuera de los comentarios no hay nada que cambie o borre filas. */
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  assert.match(sentencias, /select activity_id[\s\S]*where activity_id = 'b5-t5-a1';/);
});

test("★★ el panel docente lee cada ítem por el texto de su ficha (recortado a 70, como todos)", () => {
  for (const f of FICHAS_T5_ACT1) assert.equal(etiquetaDeItem("b5-t5-a1", f.id), recortar(f.texto), f.id);
});
