/*
 * Quién aparece en "Destacados".
 *
 * ═══════════ POR QUÉ TRES SEÑALES Y NO UNA ═══════════
 *
 * Una sola métrica premia siempre a los mismos tres nombres, y una sección que
 * dice lo mismo cada semana deja de leerse. Tres señales distintas reconocen
 * tres cosas distintas y rotan solas:
 *
 *   Cabeza de la semana  quién va arriba AHORA. Rota cada lunes con el ciclo,
 *                        y es la que garantiza que la sección no esté vacía en
 *                        una semana con actividad.
 *   Precisión sostenida  quién acierta de verdad, no quién juega mucho.
 *   Constancia           quién se presenta. Alcanza a quien nunca será top 3,
 *                        que es justo a quien más sirve que lo vean.
 *
 * ═══════════ LAS VENTANAS ═══════════
 *
 * Cabeza va por CICLO SEMANAL, alineada con las ligas del sitio. Las otras dos
 * por CATORCE DÍAS: una semana es demasiado frágil —una gripe borra a alguien
 * bueno— y el semestre entero convierte la sección en un museo. Dos semanas
 * sobreviven a una semana floja y siguen hablando del presente.
 *
 * ═══════════ LOS UMBRALES SON PROVISIONALES, COMO LOS DE ALERTAS ═══════════
 *
 * Y con una advertencia que conviene tener escrita: están calibrados para un
 * curso en marcha, no para las primeras semanas de un piloto. Con pocos días
 * de historial es esperable que Precisión y Constancia den CERO y que la
 * sección muestre solo la cabeza de la semana. Eso no está roto: es que
 * todavía no hay con qué. Bajar los umbrales para que la sección se vea llena
 * sería premiar a cualquiera, que es lo contrario de destacar.
 *
 * `supabase/tests/destacados_hoy.sql` cuenta cuántos califican hoy de verdad.
 */

export const UMBRALES_DESTACADO = {
  /* Cuántos entran por FP del ciclo. Tres, no cinco: es un podio, no una lista. */
  cabezaSemana: 3,

  /*
   * Acierto medio en evaluativas dentro de la ventana. En 0–100, igual que lo
   * guarda la base — ver la nota de escala en alertas.js.
   */
  precisionPct: 85,
  /*
   * Y el piso que impide que "hizo un juego y sacó 100%" cuente como precisión
   * sostenida. Sin este número la señal premiaría la suerte.
   */
  precisionMinimoEvaluativas: 4,

  /* Días distintos con actividad dentro de la ventana. */
  constanciaDias: 3,

  /* Cuántos se ven antes de "ver todos". El resto queda detrás. */
  visiblesPorDefecto: 3,
};

export const MOTIVO = {
  CABEZA: "cabeza",
  PRECISION: "precision",
  CONSTANCIA: "constancia",
};

export const ETIQUETA_MOTIVO = {
  [MOTIVO.CABEZA]: "Cabeza de la semana",
  [MOTIVO.PRECISION]: "Precisión sostenida",
  [MOTIVO.CONSTANCIA]: "Constancia",
};

/*
 * Un estudiante, una fila, con todos sus motivos.
 *
 * DEDUPLICA A PROPÓSITO. Sin esto, los mismos cuatro nombres llenarían la
 * sección tres veces y el tope de tres visibles no dejaría ver a nadie más.
 *
 * TOLERA QUE FALTEN LAS COLUMNAS DE 14 DÍAS. Si el cliente se despliega antes
 * de que corra la migración 0019, `pct_evaluativa_14d` y `dias_activos_14d`
 * llegan undefined: entonces Precisión y Constancia no califican a nadie y la
 * sección se queda con la cabeza de la semana. Se degrada, no se rompe.
 */
export function destacadosDe(estudiantes) {
  const U = UMBRALES_DESTACADO;
  const motivos = new Map();

  const anotar = (e, motivo) => {
    const previo = motivos.get(e.user_id);
    if (previo) previo.motivos.push(motivo);
    else motivos.set(e.user_id, { estudiante: e, motivos: [motivo] });
  };

  /* ── Cabeza de la semana ── */
  [...estudiantes]
    .filter((e) => Number(e.fp_ciclo) > 0)
    .sort((a, b) => Number(b.fp_ciclo) - Number(a.fp_ciclo))
    .slice(0, U.cabezaSemana)
    .forEach((e) => anotar(e, MOTIVO.CABEZA));

  /* ── Precisión sostenida ── */
  for (const e of estudiantes) {
    const n = Number(e.n_evaluativas_14d);
    const pct = e.pct_evaluativa_14d;
    if (!Number.isFinite(n) || pct === null || pct === undefined) continue;
    if (n >= U.precisionMinimoEvaluativas && Number(pct) >= U.precisionPct) {
      anotar(e, MOTIVO.PRECISION);
    }
  }

  /* ── Constancia ── */
  for (const e of estudiantes) {
    const dias = Number(e.dias_activos_14d);
    if (Number.isFinite(dias) && dias >= U.constanciaDias) anotar(e, MOTIVO.CONSTANCIA);
  }

  /*
   * Orden: primero quien tiene más motivos, y a igualdad por FP del ciclo. No
   * por nombre: la sección habla de desempeño, y ordenar alfabéticamente daría
   * a entender que el orden no significa nada.
   */
  return [...motivos.values()].sort(
    (a, b) =>
      b.motivos.length - a.motivos.length ||
      Number(b.estudiante.fp_ciclo) - Number(a.estudiante.fp_ciclo)
  );
}

/*
 * La frase corta que acompaña a cada motivo, con el número que la sostiene.
 * Se escribe aquí y no en el componente para que el criterio y su explicación
 * no se separen: si alguien mueve un umbral, la frase se mueve con él.
 */
export function detalleMotivo(motivo, e) {
  const U = UMBRALES_DESTACADO;
  if (motivo === MOTIVO.CABEZA) return `${e.fp_ciclo} FP esta semana`;
  if (motivo === MOTIVO.PRECISION) {
    return `${Math.round(Number(e.pct_evaluativa_14d))}% en ${e.n_evaluativas_14d} evaluativas`;
  }
  if (motivo === MOTIVO.CONSTANCIA) {
    return `${e.dias_activos_14d} días distintos en dos semanas`;
  }
  return "";
}
