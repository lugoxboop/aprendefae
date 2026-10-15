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
 * DESAFÍOS DE VARIAS ETAPAS — regla general del Kit, no una excepción.
 *
 * Un nodo de desafío declara cuántas etapas tiene y su base se multiplica por
 * ese número, con tope en cuatro. Una actividad normal declara una etapa y no
 * nota la diferencia, que es lo que permite que esto sea una regla y no un caso
 * especial escrito para "El Proyecto del Arca".
 *
 *   base efectiva = base(dificultad) × min(etapas, TOPE_ETAPAS)
 *
 * El tope existe para que la regla no se convierta en una forma de inflar
 * puntos partiendo una actividad en ocho pantallas.
 *
 * CÓMO SE REPARTE ENTRE ETAPAS: no se reparte aquí. El motor sigue recibiendo
 * un solo porcentaje de aciertos, y es la mecánica la que pondera sus etapas y
 * entrega el resultado ya combinado. Así el servidor no necesita saber nada de
 * las etapas salvo cuántas son.
 */
export const TOPE_ETAPAS = 4;

export function baseEfectiva(dificultad, etapas = 1) {
  const base = BASE_POR_DIFICULTAD[dificultad];
  if (base === undefined) throw new Error(`Dificultad desconocida: ${dificultad}`);
  const n = Math.max(1, Math.min(TOPE_ETAPAS, Math.floor(etapas || 1)));
  return base * n;
}

/*
 * Tiempo mínimo esperado por nivel. Debajo de esto se asume que no hubo
 * trabajo real y se aplica la defensa de tiempo.
 *
 * PROVISIONAL: las reglas de FP fijan los puntos base pero no estos umbrales.
 * Son estimaciones proporcionales a la dificultad, puestas en un solo sitio
 * para que ajustarlas sea cambiar estos números.
 */
export const TIEMPO_MINIMO_MS = {
  /*
   * FÁCIL TIENE UN PISO PROPIO, Y NO ES UN DESCUIDO (0030). En Fácil hay
   * actividades legítimamente breves: el Memorama de tres parejas y las
   * primeras clasificaciones se terminan bien en 6-12 s jugando rápido y de
   * verdad (scripts/medir-faciles.mjs). Con 20 s, la defensa castigaba al 60%
   * a quien lo hacía bien y sin decirle por qué. 5 s deja pasar la partida
   * honesta más rápida medida (6,1 s) y sigue parando al que toca sin leer.
   * Medio, Difícil y Experto no cambian.
   */
  facil: 5_000,
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
 * @param {number} [p.etapas]              etapas del desafío; 1 en una actividad normal
 * @returns {{ fp: number, desglose: object }}
 */
export function calcularFP({
  dificultad,
  modalidad,
  duracionMs = null,
  aciertos = null,
  repeticionesPrevias = 0,
  etapas = 1,
}) {
  const base = baseEfectiva(dificultad, etapas);
  if (!MODALIDADES.includes(modalidad)) throw new Error(`Modalidad desconocida: ${modalidad}`);

  // 1. Rendimiento. La exploratoria paga completa por terminar; la evaluativa
  //    escala con los aciertos, con piso del 50%.
  let factorRendimiento = 1;
  if (modalidad === "evaluativa") {
    /*
     * EL MISMO NÚMERO QUE VIAJA, NO UNO EQUIVALENTE.
     *
     * El servidor no recibe la proporción: recibe el PORCENTAJE y lo divide
     * entre 100 (`0036:681`). Ese viaje de ida y vuelta —×100 y ÷100— no
     * devuelve siempre el mismo double con el que se salió, y basta un último
     * bit de diferencia para voltear un redondeo que cae justo en el filo.
     *
     * Con 11 aciertos de 12 sobre 90 FP, el producto queda en 82,5 por un lado
     * y en 82,49999999999999 por el otro: el estudiante veía 83 y se guardaban
     * 82. Un FP, pero cada vez que caiga en ese filo, y sin forma de que nadie
     * entienda por qué.
     *
     * Así que aquí se hace el mismo viaje a propósito. No es redundante: es lo
     * que garantiza que las dos cuentas parten del número idéntico. Si algún
     * día el servidor recibe la proporción directamente, esto sobra y se quita
     * en el mismo cambio.
     */
    const bruto = typeof aciertos === "number" ? (aciertos * 100) / 100 : 0;
    const proporcion = Math.max(0, Math.min(1, bruto));
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
      etapas: Math.max(1, Math.min(TOPE_ETAPAS, Math.floor(etapas || 1))),
      factorRendimiento,
      factorTiempo,
      factorRepeticion,
      demasiadoRapido,
      minimoEsperadoMs: minimo,
      repeticionesPrevias: previas,
    },
  };
}
