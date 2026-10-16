/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA REGLA ÚNICA DEL SEGUNDO FALLO (Célula B, decisión de Sakuta para
 * b5-t5-a1 y b5-t6-a1).
 *
 * Tras el segundo fallo, en TODA ficha aparece su acierto sin el «Sí.»
 * inicial y con «No es esa.» delante. Así quien falla dos veces siempre ve la
 * respuesta, sin texto nuevo: el acierto de cada ficha ya la dice.
 *
 * El acierto puede venir con el ✅ delante o ya sin él (norma de diseño nueva:
 * sin emojis como íconos). Si no empieza por «✅ Sí. » ni por «Sí. », la regla
 * no sabe qué quitar: falla en voz alta en vez de pintar un texto roto.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const INICIOS = ["✅ Sí. ", "Sí. "];

export function segundoFalloDe(acierto) {
  const inicio = typeof acierto === "string" ? INICIOS.find((i) => acierto.startsWith(i)) : null;
  if (!inicio) {
    throw new Error(`el acierto no empieza por «${INICIOS[0]}» ni por «${INICIOS[1]}»: «${String(acierto).slice(0, 40)}»`);
  }
  return `❌ No es esa. ${acierto.slice(inicio.length)}`;
}
