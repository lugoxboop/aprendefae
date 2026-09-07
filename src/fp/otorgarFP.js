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
  /*
   * Detalle por ítem, opcional. Es diagnóstico, no producto: si no llega o si
   * el servidor no lo puede escribir, la actividad paga igual. Esa garantía
   * vive en registrar_fp, dentro de un bloque con manejador.
   */
  detalle = null,
}) {
  if (!supabase) return { ok: false, motivo: "sin-configuracion" };

  const { data: sesion } = await supabase.auth.getSession();
  /* Sin sesión no hay dónde guardar. El aviso de cuenta lo dispara quien llama. */
  if (!sesion?.session) return { ok: false, motivo: "sin-sesion" };

  /*
   * UNA SOLA LLAMADA, SIN RED DE SEGURIDAD, y eso es deliberado.
   *
   * Aquí hubo un respaldo que reintentaba sin p_detalle "por si la migración
   * no estaba aplicada". Se quitó porque no atrapaba nada y hacía daño:
   *
   *   · No se disparaba en el caso que fallaba. Su condición exigía que se
   *     estuviera mandando detalle, y lo que reventaba eran las llamadas SIN
   *     detalle.
   *   · Y el reintento era la misma llamada de tres parámetros con nombre que
   *     ya había fallado.
   *
   * Estaba escrito sobre una suposición falsa: que mandar los parámetros CON
   * NOMBRE desambigua entre dos firmas. No lo hace. Se comprobó contra la API
   * real y devolvió PGRST203 igual, porque las dos firmas aceptaban el mismo
   * conjunto de tres nombres —la de cuatro tenía default en el último.
   *
   * La 0018 retiró la firma vieja, así que la ventana que ese respaldo decía
   * cubrir ya no existe. Una red que no atrapa nada es peor que ninguna:
   * invita a confiar en ella.
   *
   * p_detalle solo se manda cuando hay detalle. Con una sola firma viva, la
   * llamada de tres resuelve contra ella y el parámetro toma su default.
   */
  const argumentos = {
    p_activity_id: actividadId,
    p_duration_ms: duracionMs === null ? null : Math.round(duracionMs),
    /* El motor del servidor trabaja en porcentaje, no en proporción. */
    p_correct_pct: aciertos === null ? null : Math.round(aciertos * 100),
  };
  if (detalle && detalle.length) argumentos.p_detalle = detalle;

  const { data, error } = await supabase.rpc("registrar_fp", argumentos);

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
