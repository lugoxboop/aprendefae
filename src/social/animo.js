import { supabase } from "../lib/supabase.js";

/*
 * Ánimo: la reacción ligera entre estudiantes.
 *
 * Se dirige por APODO, nunca por id. El apodo ya está impreso en la fila que el
 * estudiante está mirando, así que dirigirse por él no revela nada nuevo — y
 * mantiene la regla que sostiene el ranking y las ligas: el cliente jamás
 * conoce el user_id de otra persona.
 *
 * QUIÉN LO DIO NO SE SABE, y no es un detalle de interfaz: la función de
 * lectura de la base no devuelve emisores, así que no hay forma de averiguarlo
 * ni inspeccionando la red. Estos estudiantes se conocen en la vida real; una
 * versión identificada abre dinámicas —quién le da a quién, quién nunca recibe
 * de cierta persona— que no se construyen por defecto.
 */

/* Cuántos ánimos lleva cada apodo, y si YO ya le di en este ciclo semanal. */
export async function estadoDeAnimos(apodos) {
  if (!supabase || !apodos?.length) return {};
  const { data, error } = await supabase.rpc("animos_de", { p_nicknames: apodos });
  if (error) {
    console.error("[aprendeFAE] No se pudo leer los ánimos:", error.message);
    return {};
  }
  return Object.fromEntries(
    (data ?? []).map((f) => [f.nickname, { recibidos: f.recibidos ?? 0, yaLeDi: !!f.ya_le_di }])
  );
}

/*
 * Da un ánimo. Devuelve "nuevo" si quedó registrado, "repetido" si ya lo había
 * dado esta semana, o "error".
 *
 * El límite de uno por semana lo impone la clave primaria de la tabla, no esta
 * función: aunque alguien llame la RPC a mano, la segunda vez no entra.
 */
export async function darAnimo(apodo) {
  if (!supabase) return "error";
  const { data, error } = await supabase.rpc("animo_dar", { p_nickname: apodo });
  if (error) {
    console.error("[aprendeFAE] No se pudo dar ánimo:", error.message);
    return "error";
  }
  return data ? "nuevo" : "repetido";
}

/* Los que llevo recibidos. Solo el número. */
export async function animosRecibidos() {
  if (!supabase) return 0;
  const { data, error } = await supabase.rpc("animos_recibidos");
  if (error) return 0;
  return data ?? 0;
}
