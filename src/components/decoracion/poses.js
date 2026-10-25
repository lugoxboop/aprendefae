/*
 * Si va Fae y si la banda corre, según el estado de la tabla
 * (zonas-hanayama.md §1.5 y §2, con la corrección del 25-oct).
 *
 * FAE NO CODIFICA DÓNDE ESTÁS TÚ (Ukyo en #567; pose elegida por Hanayama).
 * La banda es aria-hidden, así que lo que dijera su pose no llegaría al
 * lector de pantalla, y las tres poses se distinguen poco entre sí. Fae va
 * siempre con «saluda»: la única que no dice nada de tu resultado.
 *
 *   fae      "saluda", o null donde no va
 *   quieta   cargando o error: la banda está, en pose de reposo, y sin Fae
 *            (una cara contenta junto a «No se pudo cargar…» diría otra cosa)
 *
 * El ranking que va debajo de una liga tampoco lleva Fae: eso lo decide la
 * vista con `fae: false` en su `decoracion` (§1.3).
 */
export const POSE_FAE = "saluda";

export function estadoRanking({ session, cargando, error, filas }) {
  if (session && (cargando || error || filas == null)) return { fae: null, quieta: true };
  return { fae: POSE_FAE, quieta: false };
}

export function estadoLiga({ cargando, error }) {
  if (cargando || error) return { fae: null, quieta: true };
  return { fae: POSE_FAE, quieta: false };
}
