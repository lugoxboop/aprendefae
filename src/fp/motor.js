/*
 * ═══════════════════════════════════════════════════════════════════════════
 * YA NO CALCULA NADA EN PRODUCCIÓN. Es la referencia legible de las reglas.
 *
 * El cálculo se movió a registrar_fp (migración 0011) porque aquí era
 * indefendible: vivía en el navegador, y el número que salía de esta función
 * era el que la base guardaba sin comprobar. Con el ranking dando puntos de
 * parcial, eso era una puerta abierta.
 *
 * Se conserva porque las reglas se leen mejor en JavaScript que en plpgsql, y
 * porque la prueba de la migración compara las dos implementaciones para que no
 * se separen en silencio. Si se cambia una regla, se cambian las dos.
 * ═══════════════════════════════════════════════════════════════════════════
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

  // 3. Repetición: la primera vez paga completo, las demás no pagan. Sin
  //    escalón intermedio. Repasar sigue estando permitido —no se restringe
  //    volver a jugar— simplemente deja de dar puntos desde la segunda vez.
  const previas = Math.max(0, Math.floor(repeticionesPrevias));
  const factorRepeticion = previas === 0 ? 1 : 0;

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
