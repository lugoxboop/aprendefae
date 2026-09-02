/*
 * Motor central de cálculo de FP.
 *
 * Función pura: no toca red ni estado. Toda actividad pasa por aquí, ninguna
 * calcula puntos por su cuenta. Al ser pura se puede verificar contra las
 * reglas sin base de datos ni sesión.
 */

export const DIFICULTADES = ["facil", "medio", "dificil", "experto"];
export const MODALIDADES = ["exploratoria", "evaluativa"];

/* Puntos base por dificultad. */
export const BASE_POR_DIFICULTAD = {
  facil: 10,
  medio: 25,
  dificil: 50,
  experto: 90,
};

/*
 * Tiempo mínimo esperado por nivel. Debajo de esto se asume que no hubo
 * trabajo real y se aplica la defensa de tiempo.
 *
 * PROVISIONAL: las reglas de FP fijan los puntos base pero no estos umbrales.
 * Son estimaciones proporcionales a la dificultad, puestas en un solo sitio
 * para que ajustarlas sea cambiar estos números.
 */
export const TIEMPO_MINIMO_MS = {
  facil: 20_000,
  medio: 45_000,
  dificil: 90_000,
  experto: 150_000,
};

export const FACTOR_TIEMPO_INSUFICIENTE = 0.6;
/* Una evaluativa nunca baja del 50% de la base, por mal que salga. */
export const PISO_EVALUATIVA = 0.5;
export const FACTOR_REPETICION = 0.2;
/* Repeticiones 1, 2 y 3 dan 20%; de la 4ª en adelante, nada. */
export const MAX_REPETICIONES_CON_FP = 3;

/**
 * Calcula los FP de una finalización.
 *
 * @param {object} p
 * @param {string} p.dificultad            facil | medio | dificil | experto
 * @param {string} p.modalidad             exploratoria | evaluativa
 * @param {number} [p.duracionMs]          tiempo empleado; si falta, no se aplica la defensa de tiempo
 * @param {number} [p.aciertos]            proporción 0..1, solo para evaluativa
 * @param {number} [p.repeticionesPrevias] cuántas veces completó ya ESTA actividad
 * @returns {{ fp: number, desglose: object }}
 */
export function calcularFP({
  dificultad,
  modalidad,
  duracionMs = null,
  aciertos = null,
  repeticionesPrevias = 0,
}) {
  const base = BASE_POR_DIFICULTAD[dificultad];
  if (base === undefined) throw new Error(`Dificultad desconocida: ${dificultad}`);
  if (!MODALIDADES.includes(modalidad)) throw new Error(`Modalidad desconocida: ${modalidad}`);

  // 1. Rendimiento. La exploratoria paga completa por terminar; la evaluativa
  //    escala con los aciertos, con piso del 50%.
  let factorRendimiento = 1;
  if (modalidad === "evaluativa") {
    const proporcion = typeof aciertos === "number" ? Math.max(0, Math.min(1, aciertos)) : 0;
    factorRendimiento = Math.max(proporcion, PISO_EVALUATIVA);
  }

  // 2. Defensa de tiempo: terminar por debajo del mínimo esperado recorta a 60%.
  const minimo = TIEMPO_MINIMO_MS[dificultad];
  const demasiadoRapido = typeof duracionMs === "number" && duracionMs < minimo;
  const factorTiempo = demasiadoRapido ? FACTOR_TIEMPO_INSUFICIENTE : 1;

  // 3. Repetición: la primera vez paga completo; las tres siguientes, 20%;
  //    de ahí en adelante, cero.
  const previas = Math.max(0, Math.floor(repeticionesPrevias));
  let factorRepeticion;
  if (previas === 0) factorRepeticion = 1;
  else if (previas <= MAX_REPETICIONES_CON_FP) factorRepeticion = FACTOR_REPETICION;
  else factorRepeticion = 0;

  const fp = Math.round(base * factorRendimiento * factorTiempo * factorRepeticion);

  return {
    fp,
    desglose: {
      base,
      factorRendimiento,
      factorTiempo,
      factorRepeticion,
      demasiadoRapido,
      minimoEsperadoMs: minimo,
      repeticionesPrevias: previas,
    },
  };
}
