import { evaluarAsiento } from "./repasoCap5MateJuego.js";
import { ASIENTOS_BARRANQUILLA, COMUNES_BARRANQUILLA, ORDEN_BARRANQUILLA, R5_4 } from "./repasoCap5BarranquillaTextos.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * r5-4 «Septiembre en Barranquilla» — la lógica, sin React (Célula E).
 *
 * La de r5-3 (repasoCap5MateJuego.js): la misma calificación por renglón, la
 * misma regla de prioridad y el mismo armador. Cambian los textos comunes, el
 * orden del cálculo y la cuenta que se diagnostica por valor (decisión 2).
 *
 *   evaluarBarranquilla(a, renglones)  califica y arma la devolución
 *   puntuarR5_4(aciertos)              aciertos / 10 × 100: 9 FP por acierto
 *   unidadDeR5_4(id)                   el texto de cada asiento para el panel docente
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const TOTAL_R5_4 = ASIENTOS_BARRANQUILLA.length;
/* Takamura (#380): si hay un texto específico, la genérica no sale. */
const BARRANQUILLA = { comunes: COMUNES_BARRANQUILLA, orden: ORDEN_BARRANQUILLA, sinGenerica: true };

export const evaluarBarranquilla = (a, renglones) => evaluarAsiento(a, renglones, BARRANQUILLA);

export const puntuarR5_4 = (aciertos, total = TOTAL_R5_4) => (total ? (aciertos / total) * 100 : 0);

/* El panel docente: cada asiento por su fecha y su nombre corto. */
export function unidadDeR5_4(id) {
  const a = ASIENTOS_BARRANQUILLA.find((x) => x.id === String(id));
  return a ? `${a.dia} SEP · ${a.operacion}` : null;
}

export { R5_4 };
