import { supabase } from "../lib/supabase.js";
import { SUBJECTS, HACER, actividadesDeTipo } from "../data/subjects.js";

/*
 * Resumen de semestre.
 *
 * Reglas que vienen de producto y conviene no aflojar al tocar esto:
 *
 *  - Los temas completados van SIEMPRE por materia. Puede haber un número
 *    grande de titular, pero nunca solo: un "4 temas" sin desglose no dice si
 *    fueron cuatro de una materia o dos y dos.
 *  - Los FP son los del semestre, no los de toda la vida.
 *  - La racha máxima es la del semestre. El récord histórico es otra cosa y ya
 *    vive en el perfil.
 *  - La posición de liga es por materia y del último ciclo CERRADO. No existe
 *    una posición combinada entre materias y no se inventa aquí.
 *  - Actividad absolutamente nula: no hay tarjeta. Un ranking vacío tiene
 *    sentido porque es una vista compartida; una celebración personal llena de
 *    ceros no celebra nada.
 */

/** Cuántos temas de una materia quedaron completos (toda su mitad Hacer). */
function temasCompletos(materiaId, hechas) {
  const materia = SUBJECTS[materiaId];
  if (!materia) return { hechos: 0, total: 0 };

  let hechos = 0;
  let total = 0;
  for (const tema of materia.topics) {
    const necesarias = actividadesDeTipo(tema, HACER).map((a) => a.id);
    if (necesarias.length === 0) continue; // un tema sin juegos no se puede "completar"
    total += 1;
    if (necesarias.every((id) => hechas.has(id))) hechos += 1;
  }
  return { hechos, total };
}

export async function cargarResumen() {
  if (!supabase) return { hay: false, error: "sin-configuracion" };

  const [porMateria, racha, cerrado, hechas] = await Promise.all([
    supabase.rpc("resumen_semestre"),
    supabase.rpc("racha_maxima_semestre"),
    supabase.rpc("semestre_cerrado"),
    supabase.rpc("actividades_hechas"),
  ]);

  const error = porMateria.error || racha.error || cerrado.error || hechas.error;
  if (error) return { hay: false, error: error.message };

  const filas = porMateria.data ?? [];
  const fpTotal = filas.reduce((s, f) => s + Number(f.fp ?? 0), 0);

  /*
   * Cero absoluto: ni FP, ni actividades, ni racha. No se genera tarjeta.
   * Distinto de "poco": con una sola actividad sí hay tarjeta, y celebra eso.
   */
  if (filas.length === 0 && fpTotal === 0 && Number(racha.data ?? 0) === 0) {
    return { hay: false, vacio: true };
  }

  const conjunto = new Set();
  const porMateriaSet = {};
  for (const f of hechas.data ?? []) {
    conjunto.add(f.activity_id);
    (porMateriaSet[f.subject_id] ??= new Set()).add(f.activity_id);
  }

  const materias = filas.map((f) => {
    const { hechos, total } = temasCompletos(f.subject_id, porMateriaSet[f.subject_id] ?? new Set());
    return {
      id: f.subject_id,
      nombre: SUBJECTS[f.subject_id]?.name ?? f.subject_id,
      fp: Number(f.fp ?? 0),
      actividades: Number(f.actividades ?? 0),
      temasHechos: hechos,
      temasTotal: total,
      /* null cuando la materia no tiene ligas o no hubo ciclo cerrado. */
      liga: f.liga ?? null,
      posicion: f.posicion == null ? null : Number(f.posicion),
      totalLigas: f.total_ligas ?? null,
      cicloFinal: f.ciclo_final ?? null,
    };
  });

  const temasHechos = materias.reduce((s, m) => s + m.temasHechos, 0);
  const temasTotal = materias.reduce((s, m) => s + m.temasTotal, 0);

  return {
    hay: true,
    cerrado: !!cerrado.data,
    fpTotal,
    rachaMaxima: Number(racha.data ?? 0),
    temasHechos,
    temasTotal,
    actividadesDistintas: conjunto.size,
    materias,
    /* La materia donde más se movió: decide el fondo de la tarjeta. */
    materiaPrincipal: materias.reduce((mejor, m) => (!mejor || m.fp > mejor.fp ? m : mejor), null)?.id ?? null,
  };
}
