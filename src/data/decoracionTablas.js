/*
 * Qué piezas lleva la banda de cada tabla (Hanayama, zonas-hanayama.md §3, v3).
 * A, B y C en ese orden: A 3.600 ms, B 5.100 ms con 900 de retardo, C 7.200 ms
 * con 1.700 (vida-visual-v1 §5.3: ni iguales ni múltiplos, para que no se
 * sincronicen). El perfil mezcla las tres materias: un objeto de cada una.
 */
export const PIEZAS_POR_TABLA = {
  macroeconomia: ["tetraedro", "flecha", "billete"],
  contabilidad: ["cubo", "libro", "clip"],
  "pensamiento-estrategico": ["tetraedro", "cubo", "torre"],
  general: ["flecha", "libro", "torre"],
};

/* La decoración de una tabla: `decoracion = { piezas, bucle, fae }`, la única entrada de RankingFP y LigaBoard. */
export const decoracionDe = (clave, { bucle = true, fae = true } = {}) =>
  clave === "pensamiento-estrategico" ? null /* hasta la placa de #545 (vida-visual §7) */
  : ({ piezas: PIEZAS_POR_TABLA[clave] ?? PIEZAS_POR_TABLA.general, bucle, fae });
