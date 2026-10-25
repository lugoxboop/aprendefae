/*
 * Qué pose lleva Fae y si la banda corre, según el estado de la tabla
 * (zonas-hanayama.md §2). `null` = Fae no va. Fae cambia de pose sin animar.
 *
 *   quieta   cargando o error: la banda está, en pose de reposo, y sin Fae
 *            (una cara contenta junto a «No se pudo cargar…» diría otra cosa)
 */
export function estadoRanking({ session, cargando, error, filas }) {
  if (!session) return { fae: "saluda", quieta: false };
  if (cargando || error || filas == null) return { fae: null, quieta: true };
  if (filas.length === 0) return { fae: "mira", quieta: false };
  const propia = filas.find((f) => f.es_tuyo);
  if (!propia) return { fae: "saluda", quieta: false };
  return { fae: propia.posicion <= 3 ? "celebra" : "mira", quieta: false };
}

export function estadoLiga({ session, cargando, error, filas, enPodio, transicion }) {
  if (cargando || error) return { fae: null, quieta: true };
  if (!session) return { fae: "saluda", quieta: false };
  if (!filas || filas.length === 0) return { fae: "saluda", quieta: false };
  if (transicion) return { fae: "mira", quieta: false };
  return { fae: enPodio ? "celebra" : "mira", quieta: false };
}
