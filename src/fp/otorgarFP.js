import { supabase } from "../lib/supabase.js";
import { calcularFP } from "./motor.js";
import { asegurarEntrada } from "../ligas/ligas.js";
import { emitirFP } from "./aviso.js";

/*
 * Orquestación del otorgamiento de FP.
 *
 * Es el único camino por el que una actividad convierte una finalización en
 * puntos: cuenta repeticiones previas, llama al motor y escribe.
 *
 * La escritura va por la función registrar_fp, que inserta en fp_history y
 * suma a profiles.points dentro de la misma transacción.
 */

/** Cuántas veces completó ya este estudiante esta actividad. */
async function contarRepeticionesPrevias(activityId) {
  const { count, error } = await supabase
    .from("fp_history")
    .select("id", { count: "exact", head: true })
    .eq("activity_id", activityId);
  if (error) {
    console.error("[aprendeFAE] No se pudo contar repeticiones:", error.message);
    return { previas: 0, error: error.message };
  }
  return { previas: count ?? 0, error: null };
}

/**
 * @param {object} p
 * @param {string} p.actividadId
 * @param {string} p.materiaId
 * @param {string} p.dificultad
 * @param {string} p.modalidad
 * @param {number} [p.duracionMs]
 * @param {number} [p.aciertos]  proporción 0..1, solo evaluativa
 * @returns {Promise<{ok:boolean, fp?:number, motivo?:string, desglose?:object, registro?:object}>}
 */
export async function otorgarFP({
  actividadId,
  materiaId,
  dificultad,
  modalidad,
  duracionMs = null,
  aciertos = null,
}) {
  if (!supabase) return { ok: false, motivo: "sin-configuracion" };

  const { data: sesion } = await supabase.auth.getSession();
  /* Sin sesión no hay dónde guardar. El aviso de cuenta lo dispara quien llama. */
  if (!sesion?.session) return { ok: false, motivo: "sin-sesion" };

  const { previas, error: errorConteo } = await contarRepeticionesPrevias(actividadId);
  if (errorConteo) return { ok: false, motivo: "conteo-fallido", detalle: errorConteo };

  const { fp, desglose } = calcularFP({
    dificultad,
    modalidad,
    duracionMs,
    aciertos,
    repeticionesPrevias: previas,
  });

  const { data, error } = await supabase.rpc("registrar_fp", {
    p_activity_id: actividadId,
    p_subject_id: materiaId,
    p_fp: fp,
    p_difficulty: dificultad,
    p_modality: modalidad,
    p_duration_ms: duracionMs === null ? null : Math.round(duracionMs),
    p_correct_pct: aciertos,
    p_repeat_index: previas,
  });

  if (error) {
    console.error("[aprendeFAE] No se pudo registrar FP:", error.message);
    return { ok: false, motivo: "escritura-fallida", detalle: error.message };
  }

  /*
   * Entrar a la liga en el mismo momento de ganar el FP, no al abrir el
   * tablero: quien empieza a mitad de semana compite por lo que queda de esa
   * semana desde ya. Si falla, no se toca el FP —ya está escrito— y la próxima
   * llamada lo resuelve; por eso no se espera al resultado ni se propaga.
   */
  asegurarEntrada(materiaId);

  /*
   * El aviso sale de aquí, con el número que de verdad se guardó. Si el motor
   * recortó por tiempo o por repetición, el estudiante ve el número recortado
   * y no el de la primera vez.
   */
  emitirFP({ fp, desglose, actividadId, materiaId });

  return { ok: true, fp, desglose, registro: data };
}
