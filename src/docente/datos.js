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

/*
 * Resumen de cabecera: el delta desde la última visita del docente.
 *
 * ESTA LLAMADA ESCRIBE. panel_resumen avanza docentes.ultima_visita, pero solo
 * si la anterior tiene más de treinta minutos. Esa ventana de gracia es lo que
 * hace que recargar la página, distraerse diez minutos o que React monte dos
 * veces en desarrollo no se coman el delta.
 *
 * SE DEGRADA EN VEZ DE ROMPERSE. Si el cliente se despliega antes de que corra
 * la migración 0019, la función no existe todavía y PostgREST responde
 * PGRST202. Aquí eso devuelve `resumen: null` y la cabecera pinta lo que sabe
 * calcular sola, sin el delta. No hay pantalla rota ni error al usuario.
 */
export async function resumenDe(subjectId) {
  if (!supabase) return { resumen: null, error: "sin-configuracion" };
  const { data, error } = await supabase.rpc("panel_resumen", { p_subject: subjectId });
  if (error) {
    console.error("[aprendeFAE] Resumen del panel:", error.message);
    return { resumen: null, error: error.message };
  }
  /* Devuelve una sola fila; PostgREST la entrega como array de uno. */
  return { resumen: Array.isArray(data) ? (data[0] ?? null) : data, error: null };
}

/*
 * Historial de un estudiante, agrupado por actividad.
 *
 * Una llamada por fila expandida, no una para toda la cohorte: encaja con "un
 * detalle abierto a la vez" y mantiene pequeño lo que viaja.
 *
 * Se degrada igual que resumenDe: sin la 0019 aplicada devuelve lista vacía y
 * un error que el componente enseña como "el historial no está disponible".
 */
export async function historialDe(subjectId, userId) {
  if (!supabase) return { historial: [], error: "sin-configuracion" };
  const { data, error } = await supabase.rpc("panel_historial", {
    p_subject: subjectId,
    p_user: userId,
  });
  if (error) {
    console.error("[aprendeFAE] Historial del panel:", error.message);
    return { historial: [], error: error.message };
  }
  return { historial: data ?? [], error: null };
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
