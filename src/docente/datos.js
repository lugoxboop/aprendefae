import { supabase } from "../lib/supabase.js";

/*
 * Acceso a los datos del panel docente.
 *
 * Todo pasa por funciones SQL que comprueban la lista blanca antes de devolver
 * nada: desde el navegador no hay forma de leer las tablas directamente, ni de
 * pedir la materia de otro docente. Si alguien llama a estas funciones sin
 * estar autorizado, Postgres responde con un error de permisos, no con datos.
 */

/** ¿La sesión actual pertenece a un docente autorizado, y para qué materias? */
export async function accesoDocente() {
  if (!supabase) return { esDocente: false, materias: [] };

  const { data: sesion } = await supabase.auth.getSession();
  if (!sesion?.session) return { esDocente: false, materias: [] };

  const { data: es, error } = await supabase.rpc("es_docente");
  if (error || !es) return { esDocente: false, materias: [] };

  const { data: materias } = await supabase.rpc("materias_docente");
  return { esDocente: true, materias: materias ?? [] };
}

/** Métricas por estudiante de una materia. */
export async function estudiantesDe(subjectId) {
  if (!supabase) return { estudiantes: [], error: "sin-configuracion" };
  const { data, error } = await supabase.rpc("panel_estudiantes", { p_subject: subjectId });
  if (error) {
    console.error("[aprendeFAE] Panel docente:", error.message);
    return { estudiantes: [], error: error.message };
  }
  return { estudiantes: data ?? [], error: null };
}

/** Añadir o quitar a un estudiante del grupo propio. */
export async function marcarEnGrupo(subjectId, userId, incluir) {
  if (!supabase) return { ok: false };
  const { error } = await supabase.rpc("grupo_marcar", {
    p_subject: subjectId,
    p_user_id: userId,
    p_incluir: incluir,
  });
  if (error) {
    console.error("[aprendeFAE] No se pudo actualizar el grupo:", error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
