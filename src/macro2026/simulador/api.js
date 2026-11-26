/*
 * La llamada al simulador del servidor (supabase/functions/simulador). La
 * clave de la IA NO pasa por aquí: el sitio solo manda la sesión del
 * estudiante, el escenario y lo que hizo. Devuelve los datos o { error }.
 */
import { supabase } from "../../lib/supabase.js";

export const SIN_SESION = "Inicia sesión para hablar con tu compañera.";

export async function llamarSimulador(cuerpo, cliente = supabase) {
  if (!cliente) return { error: "El simulador no está disponible en este momento." };
  try {
    const { data, error } = await cliente.functions.invoke("simulador", { body: cuerpo });
    if (!error) return data ?? { error: "Llegó una respuesta vacía." };
    let detalle = null;
    try { detalle = await error.context?.json?.(); } catch { detalle = null; }
    const estado = error.context?.status;
    if (estado === 401) return { error: SIN_SESION, estado };
    return { error: detalle?.error ?? "Tu compañera no pudo responder ahora.", estado };
  } catch {
    return { error: "Sin conexión con la oficina. Revisa tu internet." };
  }
}
