import { supabase } from "../lib/supabase.js";

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

/** Si ya hizo el repaso de hoy (día de Bogotá), o null si no se pudo leer. */
export async function leerHechoHoy() {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("repaso_hecho_hoy");
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
  const { data, error } = await supabase.rpc("actividades_hechas");
  if (error) {
    console.error("[aprendeFAE] No se pudo leer lo ya completado:", error.message);
    return null;
  }
  return new Set((data ?? []).map((f) => f.activity_id));
}
