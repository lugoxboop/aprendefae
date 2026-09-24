/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA BALANZA — el tercer verbo visual del tema.
 *
 * Se inclina y se nivela según el registro. No es adorno: es la ecuación
 * contable puesta donde se puede ver. Un asiento que no cuadra ES una balanza
 * torcida, y el ángulo dice de cuánto es el problema.
 *
 * ═══════════ EL ÁNGULO ES RELATIVO, NO ABSOLUTO ═══════════
 *
 * Un descuadre de $50 en un asiento de $250 es enorme; el mismo $50 en uno de
 * $1.500.000 es una mota. Si el ángulo saliera del descuadre en pesos, el
 * primero se vería recto y el segundo se saldría de la pantalla. Así que lo
 * que inclina es la PROPORCIÓN del descuadre sobre el lado que pesa más:
 * ±100 % cuando un lado está vacío, y cero cuando los dos coinciden.
 *
 * Esta aritmética vive aparte del dibujo porque es lo que hay que poder probar
 * sin montar una pantalla — igual que la cancelación.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** Cuánto se inclina la viga como mucho. Más allá, el platillo toca la base. */
export const GRADOS_MAXIMOS = 11;

/*
 * Un descuadre mínimo tiene que VERSE. Sin un piso, un céntimo de diferencia
 * en un asiento grande daría una décima de grado: indistinguible de recta, y
 * el estudiante leería «cuadra» en una balanza que no cuadra.
 */
export const GRADOS_MINIMOS = 2.5;

/**
 * La inclinación, de −1 a 1.
 *
 *   positiva   pesa más el debe (el platillo izquierdo baja)
 *   cero       los dos lados coinciden
 *   negativa   pesa más el haber
 *
 * `vacia` decide qué hacer cuando no hay nada en ninguno de los dos lados. Un
 * asiento sin empezar no está cuadrado: está sin empezar. Las actividades que
 * construyen un asiento pasan `vacia: -1` para que la balanza arranque torcida
 * y el estudiante vea que le falta trabajo; las que juzgan un asiento ya
 * escrito no lo necesitan.
 */
export function inclinacionDe(debe, haber, { vacia = 0 } = {}) {
  const mayor = Math.max(debe, haber);
  if (mayor <= 0) return vacia;
  const cruda = (debe - haber) / mayor;
  return Math.max(-1, Math.min(1, cruda));
}

/**
 * Los grados de giro de la viga, listos para el `transform` del dibujo.
 *
 * Sin guardas de más, y conviene decir por qué: `Math.sign(0)` ya devuelve
 * cero, así que una balanza cuadrada sale recta sin preguntarlo aparte; y como
 * la inclinación entra recortada a ±1, la magnitud nunca puede pasar del tope
 * sin recortarla otra vez. Las dos comprobaciones estaban escritas y ninguna
 * podía ejecutarse — código que parece proteger algo y no protege nada.
 */
export function gradosDe(inclinacion) {
  const limitada = Math.max(-1, Math.min(1, inclinacion || 0));
  return Math.sign(limitada) * Math.max(GRADOS_MINIMOS, Math.abs(limitada) * GRADOS_MAXIMOS);
}

/** ¿Está nivelada? Es la pregunta que hace el cierre de media actividad del tema. */
export const nivelada = (inclinacion) => gradosDe(inclinacion) === 0;
