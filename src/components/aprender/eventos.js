/*
 * El aviso de «en qué pieza va» que los motores de Aprender (la secuencia, la
 * presentación) le mandan a la portada. Va aparte, sin dependencias, para que
 * un motor no tenga que cargar la portada entera solo para avisar.
 */
export const EVENTO_PIEZA = "fae-aprender:pieza";

export function avisarPieza(p, total) {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent(EVENTO_PIEZA, { detail: { p, total } }));
  } catch {
    /* Sin CustomEvent: la ruta solo no se mueve. */
  }
}
