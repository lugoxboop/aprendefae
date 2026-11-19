/*
 * El aviso de «en qué pieza va» que los motores de Aprender (la secuencia, la
 * presentación) le mandan a la portada. Va aparte, sin dependencias, para que
 * un motor no tenga que cargar la portada entera solo para avisar.
 */
export const EVENTO_PIEZA = "fae-aprender:pieza";

/* La portada pide ir a una pieza (la escucha el motor). */
export const EVENTO_IR = "fae-aprender:ir";

export function pedirPieza(p) {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent(EVENTO_IR, { detail: { p } }));
  } catch {
    /* nada */
  }
}

/* «alcanzada»: la pieza más lejana a la que ya llegó; hasta ahí la ruta deja saltar. */
export function avisarPieza(p, total, alcanzada = p) {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent(EVENTO_PIEZA, { detail: { p, total, alcanzada } }));
  } catch {
    /* Sin CustomEvent: la ruta solo no se mueve. */
  }
}
