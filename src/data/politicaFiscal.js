/*
 * ═══════════════════════════════════════════════════════════════════════════
 * POLÍTICA FISCAL — LO QUE QUEDA DESPUÉS DEL RETIRO (22-nov-2026).
 *
 * Este archivo tenía los bancos de «La Tesorería Nacional», los siete juegos
 * de Política Fiscal. Salieron con todo Macroeconomía, que se rehace desde
 * cero (migración 0258; tabla y commit de respaldo en
 * orquestador/conocimiento/macro-2026/respaldo-retiro.md).
 *
 * QUEDA SOLO `porcentaje`, y no por Macro: lo importan una docena de juegos de
 * Contabilidad y la partida del Repaso Diario. Moverlo a otro archivo tocaría
 * todos esos imports por nada; se queda aquí con su nombre de siempre.
 *
 * ═══════════ LA PUNTUACIÓN: (aciertos / total) × 100, SIN REDONDEOS EN MEDIO ═══════════
 *
 * Un porcentaje por ítem es una trampa: 12 × 8,33 % suma 99,96 y 3 × 33,3 %
 * suma 99,9, así que el 100 % sería inalcanzable. El porcentaje sale de una
 * división al final, y el único redondeo es el del motor de FP al guardar.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** El porcentaje de un juego. Una división, sin redondear: el motor redondea una vez al guardar. */
export const porcentaje = (aciertos, total) => (total > 0 ? (aciertos / total) * 100 : 0);
