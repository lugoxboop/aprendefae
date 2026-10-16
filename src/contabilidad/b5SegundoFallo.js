/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA REGLA ÚNICA DEL SEGUNDO FALLO (Célula B, decisión de Sakuta para
 * b5-t5-a1 y b5-t6-a1).
 *
 * Tras el segundo fallo, en TODA ficha aparece su acierto. Así quien falla
 * dos veces siempre ve la respuesta, sin texto nuevo: el acierto de cada
 * ficha ya la dice.
 *
 * Lote 6d-textos (Futaba): los aciertos ya no abren con «Sí.» y esta regla ya
 * no quita ni pone nada: el acierto sale tal cual, debajo de la pastilla
 * «Iba aquí». El veredicto NO sale de este texto: lo da la evaluación
 * (`ok: false`, patrón «segundo») y el componente lo pinta con su estado.
 * Si un acierto vuelve a abrir con «Sí. », la regla falla en voz alta en vez
 * de pintar un veredicto que contradice la pastilla.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const VEREDICTO_VIEJO = "Sí. ";

export function segundoFalloDe(acierto) {
  if (typeof acierto !== "string" || !acierto || acierto.startsWith(VEREDICTO_VIEJO)) {
    throw new Error(`el acierto no sirve tal cual tras el segundo fallo: «${String(acierto).slice(0, 40)}»`);
  }
  return acierto;
}
