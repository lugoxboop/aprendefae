import { supabase } from "../lib/supabase.js";

/*
 * Acceso a los datos del panel docente.
 *
 * Todo pasa por funciones SQL que comprueban la lista blanca antes de devolver
 * nada: desde el navegador no hay forma de leer las tablas directamente, ni de
 * pedir la materia de otro docente. Si alguien llama a estas funciones sin
 * estar autorizado, Postgres responde con un error de permisos, no con datos.
 */

/*
 * ¿La sesión actual pertenece a un docente autorizado, y para qué materias?
 *
 * ═══════════ EL DEFECTO ANTE CUALQUIER FALLO ES "NO ES DOCENTE" ═══════════
 *
 * Cada salida de esta función que no sea el camino feliz completo devuelve
 * exactamente { esDocente: false, materias: [] }. Sin cliente, sin sesión, con
 * la llamada rota, con la red caída o con una respuesta rara: siempre lo
 * mismo, y lo mismo es lo cerrado.
 *
 * Importa porque esto es lo que decide si se PINTA el panel. El servidor no
 * depende de ello —cada función SQL comprueba es_docente() y la materia por su
 * cuenta, y responde 42501— así que un fallo aquí no filtra datos. Lo que
 * filtraría es lo contrario: que un error de red se leyera como «sí, adelante»
 * y se le enseñara la estructura del panel a quien no debe verla.
 *
 * El parámetro `cliente` es una costura para poder probar exactamente eso. En
 * producción nadie lo pasa y usa el de siempre; acceso.test.mjs recorre todas
 * las formas de fallar y comprueba que ninguna deja pasar.
 */
export async function accesoDocente(cliente = supabase) {
  const cerrado = { esDocente: false, materias: [] };
  if (!cliente) return cerrado;

  try {
    const { data: sesion } = await cliente.auth.getSession();
    if (!sesion?.session) return cerrado;

    const { data: es, error } = await cliente.rpc("es_docente");
    if (error || !es) return cerrado;

    const { data: materias } = await cliente.rpc("materias_docente");
    return { esDocente: true, materias: Array.isArray(materias) ? materias : [] };
  } catch (e) {
    /*
     * Una excepción —red caída, cliente a medio inicializar— salía de aquí sin
     * atrapar y reventaba el .then() de quien llamara, dejando el panel en
     * "Comprobando acceso…" para siempre. Ahora cae en lo cerrado, como todo
     * lo demás.
     */
    console.error("[aprendeFAE] No se pudo comprobar el acceso docente:", e?.message ?? e);
    return cerrado;
  }
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

/*
 * Las cifras de UNA actividad: finalización, distribución por bandas, tiempo,
 * FP y de dónde sale el diagnóstico.
 *
 * ═══════════ EL ERROR VIAJA ENTERO, Y NO ES UN DETALLE ═══════════
 *
 * Estas dos funciones devolvían solo `error.message`, así que quien las usaba
 * no podía distinguir «la migración no ha corrido» de «no tienes permiso» ni
 * de «se cayó la red». Las tres pintaban el mismo aviso, y ese aviso decía
 * «todavía», que es una de las tres.
 *
 * Costó diez minutos de diagnóstico a ciegas. Ahora sale el objeto completo
 * —code, message, details, hint— y quien pinta decide qué decir. La consola
 * también lo registra entero: con PGRST202 el `hint` de PostgREST suele traer
 * la firma que sí encontró, que es justo lo que hace falta para saber si el
 * problema es la caché de esquema o los argumentos.
 *
 * Devuelve una sola fila, que PostgREST entrega como array de uno.
 */
export async function actividadDe(subjectId, activityId) {
  if (!supabase) return { actividad: null, error: { code: "sin-configuracion", message: "Supabase no está configurado" } };
  const { data, error } = await supabase.rpc("panel_actividad", {
    p_subject: subjectId,
    p_activity_id: activityId,
  });
  if (error) {
    console.error("[aprendeFAE] Rendimiento por actividad:", error);
    return { actividad: null, error };
  }
  return { actividad: Array.isArray(data) ? (data[0] ?? null) : data, error: null };
}

/*
 * El diagnóstico por pregunta de esa misma actividad.
 *
 * DOS VACÍOS DISTINTOS, Y NO SE CONFUNDEN. Esta función devuelve cero filas
 * cuando no hay bastantes intentos con captura —el servidor corta por debajo de
 * cinco— y también cuando la actividad simplemente no tiene ítems. Quién es
 * cuál lo decide el componente: `sinItems` de subjects.js dice lo segundo, y
 * el `intentos_con_detalle` de panel_actividad dice lo primero.
 *
 * Por eso aquí no se interpreta nada: se devuelve la lista tal cual llegó.
 */
export async function itemsDe(subjectId, activityId) {
  if (!supabase) return { items: [], error: { code: "sin-configuracion", message: "Supabase no está configurado" } };
  const { data, error } = await supabase.rpc("panel_items", {
    p_subject: subjectId,
    p_activity_id: activityId,
  });
  if (error) {
    console.error("[aprendeFAE] Diagnóstico por pregunta:", error);
    return { items: [], error };
  }
  return { items: data ?? [], error: null };
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
