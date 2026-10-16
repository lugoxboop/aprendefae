/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA REGLA ÚNICA DEL SEGUNDO FALLO (Célula B, decisión de Sakuta para
 * b5-t5-a1 y b5-t6-a1).
 *
 * Tras el segundo fallo, en TODA ficha aparece su acierto sin el «Sí.»
 * inicial y con «No es esa.» delante. Así quien falla dos veces siempre ve la
 * respuesta, sin texto nuevo: el acierto de cada ficha ya la dice.
 *
 * Lote 6d (estándar único de Hacer): los aciertos ya no llevan emoji delante
 * y el resultado tampoco. El veredicto NO sale de este texto: lo da la
 * evaluación (`ok: false`, patrón «segundo») y el componente lo pinta con su
 * estado. Si un acierto no empieza por «Sí. », la regla no sabe qué quitar:
 * falla en voz alta en vez de pintar un texto roto.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const INICIO = "Sí. ";
export const INICIO_SEGUNDO_FALLO = "No es esa. ";

export function segundoFalloDe(acierto) {
  if (typeof acierto !== "string" || !acierto.startsWith(INICIO)) {
    throw new Error(`el acierto no empieza por «${INICIO}»: «${String(acierto).slice(0, 40)}»`);
  }
  return `${INICIO_SEGUNDO_FALLO}${acierto.slice(INICIO.length)}`;
}
