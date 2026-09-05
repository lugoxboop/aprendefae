import { supabase } from "../lib/supabase.js";
import { asegurarEntrada } from "../ligas/ligas.js";
import { emitirFP } from "./aviso.js";

/*
 * Orquestación del otorgamiento de FP.
 *
 * EL CLIENTE YA NO CALCULA NADA. Antes esta función llamaba al motor, sacaba un
 * número y se lo pasaba a la base, que se lo creía. Con el ranking dando puntos
 * de parcial, eso era una puerta abierta: bastaba con llamar a la RPC desde la
 * consola con el número que uno quisiera.
 *
 * Ahora se manda lo que pasó —qué actividad, cuánto tardó, qué porcentaje
 * acertó— y registrar_fp decide los puntos con su propio catálogo. Cuántas
 * veces se ha completado antes también lo cuenta el servidor: preguntárselo al
 * cliente era otra forma de dejarle decidir.
 */

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

  const { data, error } = await supabase.rpc("registrar_fp", {
    p_activity_id: actividadId,
    p_duration_ms: duracionMs === null ? null : Math.round(duracionMs),
    /* El motor del servidor trabaja en porcentaje, no en proporción. */
    p_correct_pct: aciertos === null ? null : Math.round(aciertos * 100),
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
   * El aviso sale con lo que la base DEVOLVIÓ, no con lo que el cliente
   * esperaba: así el número en pantalla es el que quedó guardado, siempre.
   */
  const fp = data?.fp_awarded ?? 0;
  const repetida = (data?.repeat_index ?? 0) > 0;

  emitirFP({ fp, repetida, actividadId, materiaId });

  return { ok: true, fp, repetida, registro: data };
}
