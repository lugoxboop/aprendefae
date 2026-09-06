/*
 * Puntuar una ordenación por parejas.
 *
 * POR QUÉ POR PAREJAS Y NO POR POSICIÓN. Si se exige la posición exacta,
 * confundir el segundo con el tercero cuesta lo mismo que poner el último
 * primero, y no es lo mismo: el que casi acierta el orden entendió casi todo.
 * Contando cuántas parejas quedaron en la relación correcta, el crédito parcial
 * sale solo y es explicable en una frase.
 *
 * Nació en el Tribunal de Profundidad con tres opciones y vive aquí desde que
 * la Etapa 3 del Arca necesitó lo mismo con cuatro. Es la misma regla, no dos
 * parecidas.
 */

/* Todas las parejas (a antes que b) del orden correcto. n·(n−1)/2 de ellas. */
export function parejasDe(correcto) {
  const pares = [];
  for (let i = 0; i < correcto.length; i++)
    for (let j = i + 1; j < correcto.length; j++) pares.push([correcto[i], correcto[j]]);
  return pares;
}

/*
 * Cuántas parejas conserva `orden` respecto a `correcto`.
 *
 * Asume que `orden` contiene todos los elementos: si falta alguno, su indexOf
 * es −1 y la comparación deja de significar nada. Las mecánicas solo llaman
 * aquí con la ordenación completa.
 */
export function parejasPreservadas(orden, correcto) {
  return parejasDe(correcto).filter(([a, b]) => orden.indexOf(a) < orden.indexOf(b)).length;
}

/* El porcentaje directo: todas las parejas bien = 100. */
export function puntuarOrden(orden, correcto) {
  const total = parejasDe(correcto).length;
  if (total === 0) return 100;
  return Math.round((parejasPreservadas(orden, correcto) * 100) / total);
}
