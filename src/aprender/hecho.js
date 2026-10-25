import { supabase } from "../lib/supabase.js";
import { ubicacionDeActividad } from "../data/subjects.js";

/*
 * Una pieza de Aprender queda como hecha al llegar a su cierre (#576, 0153).
 * Sin FP y sin puntaje: solo para que el Repaso pueda enseñar los ítems que
 * salen de esa pieza («En una frase» de T3).
 *
 * Solo se registra lo que el catálogo de subjects.js ubica (una pieza cuyo id
 * es el de su actividad de Aprender); sin sesión, nada. Es de mejor esfuerzo:
 * si falla, el estudiante no se entera y la secuencia sigue igual.
 */
const yaEnviadas = new Set();

export async function registrarAprenderHecho(piezaId, cliente = supabase) {
  const donde = ubicacionDeActividad(piezaId);
  if (!donde || !cliente || yaEnviadas.has(piezaId)) return false;
  try {
    const { data } = await cliente.auth.getSession();
    if (!data?.session) return false;
    yaEnviadas.add(piezaId);
    const { error } = await cliente.rpc("registrar_aprender", { p_subject_id: donde.materiaId, p_activity_id: piezaId });
    if (error) {
      yaEnviadas.delete(piezaId);
      console.error("[aprendeFAE] No se pudo registrar la pieza de Aprender:", error.message);
      return false;
    }
    return true;
  } catch {
    yaEnviadas.delete(piezaId);
    return false;
  }
}
