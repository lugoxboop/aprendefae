import { NIVEL, UMBRALES, promedioAciertos } from "./alertas.js";
import { CORTE_ALTO, CORTE_BAJO } from "./bandas.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * DIAGNÓSTICOS CON NOMBRE PROPIO
 *
 * POR QUÉ EXISTE
 * El panel decía «riesgo: alto». Eso no implica ninguna acción: el profesor
 * lee la etiqueta, asiente y cierra. De los veinte competidores que revisamos,
 * el único que resuelve esto es ALEKS, que en vez de un índice de riesgo
 * reparte a los estudiantes en categorías CON NOMBRE —falló el mismo tema,
 * bajó el ritmo, aprendió de golpe, procrastinación— porque cada una pide una
 * intervención distinta del profesor. Un índice no pide ninguna.
 *
 * Así que aquí no hay escala. Hay seis frases, cada una con su causa, su
 * cifra y el botón que trae puesto.
 *
 * QUÉ NO ES
 * No sustituye a alertas.js, lo envuelve. Los umbrales siguen siendo los de
 * allí (y los de bandas.js), para que el panel, las bandas de actividad y
 * Destacados sigan contando lo mismo con un solo criterio. Lo que cambia es
 * cómo se nombra y qué se ofrece hacer.
 *
 * LAS DOS SEÑALES NUEVAS, Y POR QUÉ SE PUEDEN CALCULAR HOY
 * `duracion_media_ms` por estudiante ya viaja en panel_estudiantes, y nadie la
 * estaba cruzando contra el acierto más que para una nota informativa. Cruzada,
 * da los dos casos que el promedio esconde y que MindTap dibuja con dos ejes:
 *
 *   · ESFUERZO SIN RESULTADO: le dedica más tiempo que la clase y aun así
 *     falla. No necesita más práctica, necesita otra explicación. Es el caso
 *     que una lista ordenada por nota jamás distingue del que no trabaja.
 *   · ACIERTA SIN TIEMPO: acierto alto con un tiempo por debajo de lo que
 *     cuesta leer el enunciado. ALEKS lo llama «aprendizaje inusual» y es la
 *     señal más copiable de las suyas, porque casi nadie modela que rendir de
 *     repente demasiado bien TAMBIÉN es algo que mirar. No acusa a nadie: dice
 *     dónde mirar.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * Lo que un diagnóstico es, como objeto:
 *
 *   id      estable, lo usa el «no aplica» para recordarse entre visitas
 *   nombre  cómo se llama, en voz de profesor y sin jerga
 *   nivel   el de alertas.js, para ordenar y colorear igual que siempre
 *   dice    la frase con sujeto, ya armada con las cifras del estudiante
 *   accion  qué ofrece hacer. Si es null, es un diagnóstico que solo informa
 */

/* La mediana, no la media: un solo estudiante que dejó una pestaña abierta
 * media hora arrastra la media y deja de señalar a nadie. */
function mediana(xs) {
  if (xs.length === 0) return null;
  const o = [...xs].sort((a, b) => a - b);
  const m = Math.floor(o.length / 2);
  return o.length % 2 ? o[m] : (o[m - 1] + o[m]) / 2;
}

/*
 * Cuánto más lento que la clase cuenta como «le está costando». 1,25 y no 2:
 * con un grupo pequeño, el doble de la mediana casi nunca se alcanza y la
 * regla no se dispararía nunca, que es el mismo accidente que tuvieron los
 * umbrales de alertas.js cuando estaban en 0–1 contra datos en 0–100.
 */
export const FACTOR_LENTO = 1.25;

/* Con menos de cuatro medidos, la mediana es ruido: no se compara contra ella. */
export const MINIMO_PARA_COMPARAR = 4;

/**
 * Lo que hace falta saber del grupo para juzgar a uno de sus miembros.
 *
 * Se calcula una vez por cohorte y se pasa a cada estudiante, en vez de que
 * cada uno recorra la lista entera: con treinta estudiantes daba igual, con
 * trescientos no.
 */
export function contextoDeGrupo(cohorte) {
  const tiempos = cohorte
    .map((e) => (e.duracion_media_ms === null || e.duracion_media_ms === undefined ? null : Number(e.duracion_media_ms)))
    .filter((n) => n !== null && Number.isFinite(n) && n > 0);
  return {
    medianaMs: tiempos.length >= MINIMO_PARA_COMPARAR ? mediana(tiempos) : null,
    nMedidos: tiempos.length,
  };
}

const segundos = (ms) => Math.round(Number(ms) / 1000);

/**
 * Los diagnósticos de un estudiante, del más grave al menos.
 *
 * `contexto` es lo que devuelve contextoDeGrupo. Sin él, las dos reglas que
 * comparan contra la clase simplemente no se evalúan: prefiero callar a
 * inventar una referencia.
 */
export function diagnosticarA(e, contexto = { medianaMs: null }, umbrales = UMBRALES) {
  const salida = [];
  /*
   * El umbral del profesor manda sobre el de la casa, y por eso llega como
   * argumento en vez de leerse de UMBRALES aquí dentro: una función que lee
   * una preferencia global no se puede probar con dos profesores distintos.
   */
  const diasLimite = umbrales.diasInactividad ?? umbrales.ciclosInactividad * umbrales.diasPorCiclo;
  const corteBajo = umbrales.pctEvaluativaBaja ?? CORTE_BAJO;
  const acierto = promedioAciertos(e);
  const ms = e.duracion_media_ms === null || e.duracion_media_ms === undefined ? null : Number(e.duracion_media_ms);
  const dias = Number(e.dias_inactivo ?? 0);
  const registros = Number(e.n_registros ?? 0);

  /* Tenía ritmo y lo perdió. La más grave, y la única que mira solo el calendario. */
  if (registros >= umbrales.registrosParaSerRegular && dias > diasLimite) {
    salida.push({
      id: "dejo-de-entrar",
      nombre: "Dejó de entrar",
      nivel: NIVEL.URGENTE,
      dice: `Llevaba ${registros} actividades y lleva ${dias} días sin entrar.`,
      accion: "Ver qué dejó a medias",
    });
  }

  /*
   * Le dedica más tiempo que la clase y aun así falla.
   *
   * Las dos condiciones JUNTAS, nunca el tiempo solo: mucho tiempo con buen
   * acierto es alguien que trabaja a fondo, y señalarlo sería alertar sobre
   * el mejor comportamiento que tiene la plataforma.
   */
  if (
    contexto.medianaMs !== null && ms !== null &&
    ms >= contexto.medianaMs * FACTOR_LENTO &&
    acierto !== null && acierto < corteBajo
  ) {
    salida.push({
      id: "esfuerzo-sin-resultado",
      nombre: "Le cuesta, no le falta esfuerzo",
      nivel: NIVEL.ATENCION,
      dice: `${segundos(ms)}s de media por actividad frente a ${segundos(contexto.medianaMs)}s de la clase, y ${Math.round(acierto)}% de acierto.`,
      accion: "Ver en qué se atasca",
    });
  }

  /*
   * Acierto bajo con prisa. Era la nota verde de alertas.js; aquí tiene nombre
   * y botón, porque la intervención es distinta a todas las demás: no es
   * repasar, es quitar el cronómetro.
   */
  if (ms !== null && ms < umbrales.duracionRapidaMs && acierto !== null && acierto < (umbrales.pctBajaParaPrisa ?? corteBajo)) {
    salida.push({
      id: "rapido-sin-leer",
      nombre: "Responde rápido y acierta poco",
      nivel: NIVEL.ATENCION,
      dice: `${segundos(ms)}s de media por actividad y ${Math.round(acierto)}% de acierto: no está leyendo el enunciado.`,
      accion: "Ver sus tiempos",
    });
  }

  /* Practica mucho y no le sale cuando cuenta. La regla ámbar de siempre. */
  if (
    Number(e.n_evaluativas ?? 0) > 0 &&
    e.pct_evaluativa !== null && e.pct_evaluativa !== undefined &&
    Number(e.pct_evaluativa) < corteBajo &&
    Number(e.n_exploratorias ?? 0) >= umbrales.exploratoriasParaPracticar
  ) {
    salida.push({
      id: "practica-sin-aplicar",
      nombre: "Practica, pero no le sale sin apoyo",
      nivel: NIVEL.ATENCION,
      dice: `${Math.round(Number(e.pct_evaluativa))}% en evaluativas (${e.n_evaluativas}) con ${e.n_exploratorias} exploratorias hechas.`,
      accion: "Ver su historial",
    });
  }

  /*
   * Acierto alto y muy poco tiempo.
   *
   * ESTA NO ES UNA ACUSACIÓN Y EL TEXTO LO DICE. Puede ser alguien que por fin
   * entendió, alguien que ya lo sabía, o un trabajo que no es suyo. Las tres
   * piden lo mismo del profesor: mirar. El día que esto se redacte como
   * sospecha, deja de ser útil y empieza a hacer daño.
   */
  if (ms !== null && ms < umbrales.duracionRapidaMs && acierto !== null && acierto >= CORTE_ALTO) {
    salida.push({
      id: "acierta-sin-tiempo",
      nombre: "Acierta muy rápido",
      nivel: NIVEL.INFO,
      dice: `${Math.round(acierto)}% de acierto en ${segundos(ms)}s de media. Puede que ya lo supiera; vale la pena mirarlo.`,
      accion: "Ver sus respuestas",
    });
  }

  /*
   * Asomó la cabeza y no volvió. Separado de «dejó de entrar» a propósito: es
   * un problema de arranque, no de pérdida, y mezclarlos vaciaría de
   * significado la lista roja.
   */
  if (registros > 0 && registros < umbrales.registrosParaSerRegular && dias > diasLimite) {
    salida.push({
      id: "asomo-y-no-volvio",
      nombre: "Entró una vez y no volvió",
      nivel: NIVEL.INFO,
      dice: `Una sola actividad, hace ${dias} días.`,
      accion: null,
    });
  }

  const orden = { [NIVEL.URGENTE]: 0, [NIVEL.ATENCION]: 1, [NIVEL.INFO]: 2 };
  return salida.sort((a, b) => orden[a.nivel] - orden[b.nivel]);
}

/**
 * Una fila por estudiante con su diagnóstico más grave, ya ordenada.
 *
 * `silenciados` es el conjunto de claves «user_id|id» que el profesor marcó
 * como «no aplica». Se filtran los diagnósticos, no los estudiantes: si
 * alguien tiene dos y silenció uno, sigue en la lista por el otro.
 */
export function diagnosticoDelGrupo(cohorte, silenciados = new Set(), umbrales = UMBRALES) {
  const contexto = contextoDeGrupo(cohorte);
  const orden = { [NIVEL.URGENTE]: 0, [NIVEL.ATENCION]: 1, [NIVEL.INFO]: 2 };
  return cohorte
    .map((e) => {
      const todos = diagnosticarA(e, contexto, umbrales).filter((d) => !silenciados.has(`${e.user_id}|${d.id}`));
      return todos.length === 0 ? null : { estudiante: e, principal: todos[0], todos };
    })
    .filter(Boolean)
    .sort((a, b) =>
      orden[a.principal.nivel] - orden[b.principal.nivel] ||
      Number(b.estudiante.dias_inactivo ?? 0) - Number(a.estudiante.dias_inactivo ?? 0));
}

/*
 * ═══════════ LO QUE EL PANEL NO LE ESTÁ DICIENDO AL PROFESOR ═══════════
 *
 * Mismo criterio que REGLAS_SIN_DATOS en alertas.js, y por el mismo motivo:
 * un diagnóstico que no se puede calcular se declara, no se calla. Un panel
 * que oculta sus huecos pide fe, y el profesor que descubre un hueco por su
 * cuenta deja de creerse también lo que sí es cierto.
 *
 * Los tres de abajo son de ALEKS y los tres piden lo mismo: una serie en el
 * tiempo. Hoy guardamos el estado actual de cada estudiante (acierto medio,
 * última actividad, cuántos registros), no su trayectoria semana a semana, así
 * que no hay contra qué comparar el presente.
 */
export const DIAGNOSTICOS_SIN_DATOS = [
  {
    id: "bajo-el-ritmo",
    nombre: "Bajó el ritmo",
    nivel: NIVEL.ATENCION,
    necesita: "Cuántas actividades hizo cada semana, no solo cuántas lleva en total",
    porque: "Hoy se guarda el acumulado de cada estudiante y la fecha de su última actividad, no cuánto hizo cada semana. Para decir que alguien bajó el ritmo hay que comparar su semana con las suyas anteriores, y esa serie no existe todavía.",
  },
  {
    id: "subio-de-golpe",
    nombre: "Subió de golpe",
    nivel: NIVEL.INFO,
    necesita: "El acierto fechado, intento a intento",
    porque: "El historial guarda el mejor resultado de cada actividad, pero no la fecha de cada intento. Sin eso no se distingue a quien mejoró poco a poco de quien saltó en un día. «Acierta muy rápido» es lo más cerca que llegamos con lo que hay.",
  },
  {
    id: "procrastinacion",
    nombre: "Procrastinación",
    nivel: NIVEL.ATENCION,
    necesita: "Fechas límite por actividad",
    porque: "No existen en la plataforma: las actividades están siempre abiertas. Sin plazo no hay «al filo del plazo» que medir, así que esta no se desbloquea con más datos sino con una decisión de producto.",
  },
];
