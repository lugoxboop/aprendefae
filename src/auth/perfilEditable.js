/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LO QUE UN ESTUDIANTE PUEDE CAMBIAR DE SU PERFIL, Y CÓMO SE LE DICE SI NO SE
 * PUDO.
 *
 * Vive aparte de AuthProvider para poder probarlo sin Supabase.
 *
 * CAMPOS_EDITABLES es la lista blanca del guardado: el cliente nunca manda a
 * `profiles` una columna que no esté aquí, aunque una sección del panel la
 * pida por error.
 *
 * NO ES LA ÚNICA DEFENSA, NI LA QUE MANDA. Desde la 0032 la base solo le
 * concede a un estudiante escribir nickname y full_name (permisos por
 * columna): aunque alguien saltara esta lista desde la consola, el resto de
 * columnas —FP, rachas, es_prueba— se rechaza con 42501. El día del avatar
 * se añade su columna AQUÍ, a su sección del panel Y a un grant de una
 * migración nueva; con solo las dos primeras, guardar fallaría.
 *
 * ═══════════ LAS REGLAS SON DE LA BASE, NO DEL FORMULARIO ═══════════
 *
 * El formulario solo exige que los campos no estén vacíos: ni largo, ni
 * unicidad, ni filtro, ni límite de cambios (decisión de producto). Pero la
 * base ya tenía tres reglas desde el principio, y siguen ahí:
 *
 *   profiles_nickname_unique   el apodo no se repite, sin distinguir mayúsculas
 *   profiles_nickname_len      el apodo tiene de 3 a 20 caracteres
 *   profiles_full_name_len     el nombre tiene de 3 a 80 caracteres
 *
 * Si la base rechaza un cambio por una de ellas, se dice en palabras. No se
 * comprueban antes en el cliente: eso sería añadir la validación que el
 * producto decidió no tener.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CAMPOS_EDITABLES = ["nickname", "full_name"];

/* Las columnas que se leen del perfil, las mismas al cargar y al guardar. */
export const COLUMNAS_PERFIL = "user_id, nickname, full_name, points, streak, best_streak, last_activity_day, created_at";

/** Solo las columnas editables del cambio, con los textos sin espacios en los extremos. */
export function cambioPermitido(cambio) {
  return Object.fromEntries(
    Object.entries(cambio ?? {})
      .filter(([k]) => CAMPOS_EDITABLES.includes(k))
      .map(([k, v]) => [k, typeof v === "string" ? v.trim() : v]),
  );
}

/** El error de la base, dicho para el estudiante. */
export function mensajeDeErrorPerfil(error) {
  const texto = `${error?.message ?? ""} ${error?.details ?? ""}`;
  if (error?.code === "23505") return "Ese apodo ya lo usa otra persona. Prueba con otro.";
  if (error?.code === "23514" && texto.includes("profiles_nickname_len")) return "El apodo tiene que tener entre 3 y 20 caracteres.";
  if (error?.code === "23514" && texto.includes("profiles_full_name_len")) return "El nombre tiene que tener entre 3 y 80 caracteres.";
  return "No se pudo guardar. Revisa tu conexión e inténtalo otra vez.";
}
