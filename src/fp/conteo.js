/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL CONTEO DEL PILL: del valor anterior al nuevo, no de un salto.
 *
 * Cuando el estudiante termina una actividad, el número de FP de la cabecera
 * sube contando. Un salto instantáneo se lee como que la cifra «ya estaba» y la
 * recompensa se pierde; contando, el aumento se ve.
 *
 * La parte que se anima vive aquí, sin React y sin requestAnimationFrame, para
 * poder probarla con números en vez de con un reloj.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** Cuánto dura el conteo. Va con el aviso «+X FP», que ya existe. */
export const DURACION_CONTEO_MS = 900;

/*
 * Salida suave (easeOutCubic): arranca rápido y frena al llegar. Es lo que hace
 * que el número se lea mientras sube en vez de pasar de largo.
 */
export const suavizar = (t) => 1 - Math.pow(1 - t, 3);

/**
 * El valor que toca enseñar en el instante `t` del recorrido.
 *
 * @param {number} desde
 * @param {number} hasta
 * @param {number} t  0 = principio, 1 = final. Se sujeta fuera de rango.
 * @returns {number} entero: un FP con decimales no existe
 */
export function valorEnProgreso(desde, hasta, t) {
  const a = Math.round(Number(desde) || 0);
  const b = Math.round(Number(hasta) || 0);
  if (!Number.isFinite(t)) return b;
  const p = Math.max(0, Math.min(1, t));
  /*
   * El final se fija por igualdad y no por redondeo: con p = 1 la cuenta da el
   * valor exacto, pero un error de coma flotante a mitad de camino no puede
   * dejar el contador parado un punto por debajo del real.
   */
  if (p >= 1) return b;
  return Math.round(a + (b - a) * suavizar(p));
}

/**
 * Los fotogramas de un conteo, para inspeccionarlo sin navegador.
 * No se usa en producción: existe para que la prueba pueda mirar el recorrido.
 */
export function recorrido(desde, hasta, pasos = 10) {
  return Array.from({ length: pasos + 1 }, (_, i) => valorEnProgreso(desde, hasta, i / pasos));
}
