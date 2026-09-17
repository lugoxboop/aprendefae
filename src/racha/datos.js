import { supabase } from "../lib/supabase.js";

/*
 * La única pregunta del momento de racha: racha_momento() (migración 0034).
 * Decide, marca y devuelve la semana en una llamada. Sin cliente o con error,
 * null: el momento no sale, y nada más se rompe.
 */
export async function pedirMomentoRacha() {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("racha_momento");
  if (error) {
    console.error("[aprendeFAE] No se pudo consultar el momento de racha:", error.message);
    return null;
  }
  const f = data?.[0];
  if (!f) return null;
  return {
    mostrar: f.mostrar === true,
    desde: Number(f.desde ?? 0),
    hasta: Number(f.hasta ?? 0),
    hoy: f.hoy,
    semana: f.semana ?? [],
  };
}
