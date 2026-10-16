/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA ESCALERA DE AYUDA DE LA CÉLULA B (lote C2 de Futaba, PASA de Shoko).
 *
 * Para las cajas de la capa 3 (CajasQueRevelan, CuentaT, TresCasos,
 * CuatroGrupos) y las paradas de la capa 2 (MaquinaPegada). Una pregunta
 * `decide` = { pregunta, opciones, correcta, falla, pista }:
 *
 *   · primer error    la PISTA (`decide.pista`); la elegida queda tachada y
 *                     no se puede volver a tocar; las demás siguen activas.
 *                     Ni la devolución ni el texto que se revela.
 *   · segundo error   la devolución de esa opción (`falla`, la de siempre).
 *                     La pregunta se cierra. En la capa 3, sin el texto que
 *                     se revela (B5 de Futaba: lo lee solo quien acierta).
 *   · acierto         como antes: el texto directo, sin devolución.
 *
 * Sin pista, la pregunta se comporta como antes: un solo intento.
 *
 * `intentos` son los ids elegidos, en orden. Este archivo no escribe texto
 * de contenido: todo llega por los datos de cada pieza.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* La devolución de una opción mala: un texto para todas o uno por opción. */
export const fallaDe = (decide, elegida) => (elegida && elegida !== decide.correcta
  ? (typeof decide.falla === "string" ? decide.falla : decide.falla[elegida])
  : null);

/* Las devoluciones posibles de una pregunta (para reservar su alto). */
export const fallasDe = (decide) => (typeof decide.falla === "string" ? [decide.falla] : Object.values(decide.falla));

/** Cuántos intentos tiene la pregunta: dos con pista, uno sin ella. */
export const intentosMaximos = (decide) => (decide.pista ? 2 : 1);

/** El estado de la pregunta según lo elegido hasta ahora. */
export function escalera(decide, intentos = []) {
  const acerto = intentos.includes(decide.correcta);
  const resuelta = acerto || intentos.length >= intentosMaximos(decide);
  const ultima = intentos.length ? intentos[intentos.length - 1] : null;
  return {
    intentos,
    ultima,
    acerto,
    resuelta,
    /* Las elegidas malas, tachadas desde que se eligen. */
    tachadas: intentos.filter((id) => id !== decide.correcta),
    /* Solo entre el primer error y el segundo intento. */
    pista: !resuelta && intentos.length === 1 ? decide.pista : null,
    /* Solo al cerrarse con error. */
    falla: resuelta && !acerto ? fallaDe(decide, ultima) : null,
  };
}

/** ¿Se puede elegir `id` ahora? No si la pregunta ya se cerró ni si ya se eligió. */
export const sePuedeElegir = (decide, intentos, id) => !escalera(decide, intentos).resuelta && !intentos.includes(id);

/** Los intentos después de elegir `id` (sin cambio si no se puede). */
export const elegir = (decide, intentos, id) => (sePuedeElegir(decide, intentos, id) ? [...intentos, id] : intentos);
