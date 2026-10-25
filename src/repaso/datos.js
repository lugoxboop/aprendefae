import { supabase } from "../lib/supabase.js";
import { ID_REPASO } from "./repaso.js";

/*
 * Lo que el Repaso le pregunta al servidor. Dos lecturas, las dos del propio
 * estudiante (0033); lo completado sale de actividades_hechas(), por el mismo
 * hook que usa el camino.
 *
 * Sin cliente o sin sesión devuelven null: la vista distingue «no se pudo
 * leer» de «no hay historial», que son cosas muy distintas para el sorteo.
 */

/** clave → { ultimoEn, ultimoOk, veces }, o null si no se pudo leer. */
export async function leerHistorial() {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("repaso_historial");
  if (error) {
    console.error("[aprendeFAE] No se pudo leer el historial del Repaso:", error.message);
    return null;
  }
  return historialDeFilas(data);
}

export function historialDeFilas(filas) {
  return new Map((filas ?? []).map((f) => [f.clave, { ultimoEn: f.ultimo_en, ultimoOk: f.ultimo_ok, veces: f.veces }]));
}

/**
 * Si ya hizo el repaso de hoy (día de Bogotá), o null si no se pudo leer.
 *
 * El de Macro sigue preguntando a repaso_hecho_hoy(), sin argumentos, como
 * siempre. Cualquier otro pregunta por SU id a repaso_hecho_hoy_de (0152):
 * hacer el Repaso de Macro no gasta el de Contabilidad, ni al revés.
 */
export async function leerHechoHoy(idRepaso = ID_REPASO) {
  if (!supabase) return null;
  const { data, error } = idRepaso === ID_REPASO
    ? await supabase.rpc("repaso_hecho_hoy")
    : await supabase.rpc("repaso_hecho_hoy_de", { p_activity_id: idRepaso });
  if (error) {
    console.error("[aprendeFAE] No se pudo saber si el Repaso ya se hizo hoy:", error.message);
    return null;
  }
  return data === true;
}

/*
 * Lo completado, leído aquí y no con useCompletadas: ese hook arranca con un
 * conjunto vacío y sin aviso de carga, y el Repaso enseñaría «completa 3
 * actividades» un instante a quien ya las tiene. Misma función del servidor.
 */
export async function leerHechas() {
  if (!supabase) return null;
  const [fp, aprender] = await Promise.all([supabase.rpc("actividades_hechas"), supabase.rpc("aprender_hechas")]);
  if (fp.error) {
    console.error("[aprendeFAE] No se pudo leer lo ya completado:", fp.error.message);
    return null;
  }
  const hechas = new Set((fp.data ?? []).map((f) => f.activity_id));
  /*
   * Y las piezas de Aprender que llegaron a su cierre (0153, #576): no dan
   * FP, así que no están en actividades_hechas(). Si esta lectura falla, el
   * Repaso sigue con lo de FP, como antes: no se pierde nada que ya hubiera.
   */
  if (aprender.error) console.error("[aprendeFAE] No se pudo leer lo visto en Aprender:", aprender.error.message);
  else for (const f of aprender.data ?? []) hechas.add(f.activity_id);
  return hechas;
}
