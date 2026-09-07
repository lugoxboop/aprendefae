import { SUBJECTS, HACER, actividadesDeTipo, desafioDe } from "../data/subjects.js";

/*
 * Alertas del panel docente.
 *
 * TODOS LOS UMBRALES DE ESTE ARCHIVO SON PROVISIONALES. Son puntos de partida
 * para calibrar con datos reales del semestre, igual que los TIEMPO_MINIMO_MS
 * del motor de FP. Viven aquí, juntos y en el cliente, precisamente para que
 * ajustarlos sea cambiar un número y no migrar la base.
 *
 * El cálculo vive en el navegador y no en SQL por lo mismo: mientras los
 * números se estén moviendo, conviene que muevan barato.
 */

export const UMBRALES = {
  /*
   * Un ciclo semanal completo. No son "7 días" como número redondo: es el
   * periodo del ranking semanal del sitio. Pasado uno entero sin actividad, el
   * estudiante se perdió una semana de repaso completa.
   */
  ciclosInactividad: 1,
  diasPorCiclo: 7,

  /*
   * Cuántos registros hacen "actividad previa regular". Con uno solo no se
   * puede hablar de abandono: eso es alguien que asomó la cabeza y no volvió,
   * que es un problema de arranque, no de pérdida.
   */
  registrosParaSerRegular: 2,

  /*
   * Desempeño evaluativo por debajo del cual conviene mirar.
   *
   * VA EN 0–100, COMO LO GUARDA LA BASE. Estuvo en 0,6 y esta regla no podía
   * dispararse nunca: fp_history.correct_pct se guarda entre 0 y 100
   * —registrar_fp hace least(100, greatest(0, …)) sobre lo que manda el
   * cliente, que ya viene multiplicado— y panel_estudiantes devuelve la media
   * sin dividir. Comparar 77 con 0,6 da siempre falso.
   */
  pctEvaluativaBaja: 60,
  /* Cuánta práctica exploratoria cuenta como "sí está practicando". */
  exploratoriasParaPracticar: 2,

  /*
   * Señal informativa de prisa. El tiempo NUNCA dispara solo: se cruza con el
   * acierto. Poco tiempo y buen acierto es dominio, no un problema, y avisar de
   * eso sería alertar justo sobre los mejores estudiantes.
   */
  duracionRapidaMs: 90000,
  /* En 0–100, por lo mismo que pctEvaluativaBaja. También estuvo muerta. */
  pctBajaParaPrisa: 60,
};

export const NIVEL = { URGENTE: "urgente", ATENCION: "atencion", INFO: "info" };

const ORDEN = { [NIVEL.URGENTE]: 0, [NIVEL.ATENCION]: 1, [NIVEL.INFO]: 2 };

/*
 * Reglas que hoy NO se pueden calcular por falta de datos capturados. Se
 * declaran aquí, y el panel las muestra como pendientes en vez de callárselas:
 * un docente tiene que saber qué NO le está diciendo el panel.
 */
export const REGLAS_SIN_DATOS = [
  {
    nivel: NIVEL.ATENCION,
    titulo: "Abandono repetido a mitad de actividad",
    necesita: "Progreso parcial dentro de la actividad",
    /*
     * NO la desbloquea fp_detalle, y conviene decir por qué en vez de dejar
     * que alguien lo suponga: el detalle por ítem se escribe DENTRO de
     * registrar_fp, y registrar_fp solo se llama al completar. Quien empieza y
     * abandona sigue sin llamar a nada, así que sigue sin dejar rastro.
     *
     * Resolverlo pide otro mecanismo —un evento de inicio, o guardado parcial
     * periódico— con otro coste y otro volumen. Es un problema distinto.
     */
    porque: "El detalle por ítem se guarda solo al terminar una actividad, así que empezarla y dejarla sigue sin distinguirse de no entrar. Haría falta registrar el inicio, no solo el final.",
  },
];

/** Mapa actividad → tema, para poder hablar de temas y no solo de materias. */
function mapaActividadTema(subjectId) {
  const mapa = new Map();
  for (const topic of SUBJECTS[subjectId]?.topics ?? []) {
    for (const act of topic.actividades ?? []) mapa.set(act.id, topic);
  }
  return mapa;
}

/**
 * Avance por tema de un estudiante.
 *
 * IMPORTANTE, y el panel lo dice en voz alta: solo cuenta actividades que
 * otorgan FP. El material de "Aprender" no escribe ninguna fila, así que un
 * estudiante que se leyó la teoría entera y no jugó aparece aquí como si no
 * hubiera entrado. Es una limitación de la captura, no del estudiante.
 */
export function avancePorTema(subjectId, actividadesHechas = []) {
  const hechas = new Set(actividadesHechas);
  const mapa = mapaActividadTema(subjectId);
  const porTema = new Map();

  for (const topic of SUBJECTS[subjectId]?.topics ?? []) {
    /*
     * EL DESAFÍO CUENTA, Y ANTES NO CONTABA.
     *
     * actividadesDeTipo() excluye los desafíos a propósito: esa exclusión se
     * añadió para que el Arca no saliera como un nodo numerado más del camino,
     * y ahí es correcta. Pero se coló aquí, y el efecto era mudo:
     * proyecto-arca sigue estando en mapaActividadTema, así que tampoco caía
     * en la rama de huérfanas de abajo. Ni se contaba ni aparecía por otro
     * lado: era invisible.
     *
     * Un estudiante que solo hubiera jugado el Arca salía como "0 de 3 temas
     * iniciados" teniendo cientos de FP. Reproducido con los datos reales:
     * 216, 295 y 342 FP son el 60%, el 82% y el 95% de los 360 del desafío.
     *
     * El desafío otorga FP como cualquier otra, y esta sección dice
     * literalmente que cuenta las actividades que otorgan FP. Así que entra.
     */
    const desafio = desafioDe(topic);
    const conFp = [...actividadesDeTipo(topic, HACER), ...(desafio ? [desafio] : [])];
    if (conFp.length === 0) continue;
    porTema.set(topic.id, {
      id: topic.id,
      titulo: topic.title,
      total: conFp.length,
      hechas: conFp.filter((a) => hechas.has(a.id)).length,
    });
  }

  /* Actividades registradas que ya no existen en el catálogo: no se pierden. */
  for (const id of hechas) if (!mapa.has(id)) porTema.set(`?${id}`, { id, titulo: id, total: 1, hechas: 1, huerfana: true });

  return [...porTema.values()];
}

/** Alertas de un estudiante, de la más urgente a la menos. */
export function alertasDe(e) {
  const alertas = [];
  const diasLimite = UMBRALES.ciclosInactividad * UMBRALES.diasPorCiclo;

  /*
   * 🔴 Riesgo de perder al estudiante: tenía ritmo y lo perdió.
   * Quien nunca empezó no entra aquí: eso es acompañamiento de arranque, no
   * una alerta de abandono, y mezclarlos haría que la lista roja dejara de
   * significar algo.
   */
  if (e.n_registros >= UMBRALES.registrosParaSerRegular && e.dias_inactivo > diasLimite) {
    alertas.push({
      nivel: NIVEL.URGENTE,
      titulo: "Sin actividad más de un ciclo semanal",
      detalle: `${e.dias_inactivo} días desde la última actividad, después de ${e.n_registros} registros.`,
    });
  }

  /*
   * 🟡 Practica pero no aplica. Es la única de las tres reglas ámbar que se
   * puede calcular con lo que hay guardado hoy.
   */
  if (
    e.n_evaluativas > 0 &&
    e.pct_evaluativa !== null &&
    Number(e.pct_evaluativa) < UMBRALES.pctEvaluativaBaja &&
    e.n_exploratorias >= UMBRALES.exploratoriasParaPracticar
  ) {
    alertas.push({
      nivel: NIVEL.ATENCION,
      titulo: "Practica, pero no le sale sin apoyo",
      detalle: `${Math.round(Number(e.pct_evaluativa))}% en evaluativas con ${e.n_exploratorias} exploratorias hechas.`,
    });
  }

  /*
   * 🟢 Iba deprisa Y fallando. Las dos condiciones juntas, nunca el tiempo solo.
   */
  const pctGlobal = promedioAciertos(e);
  if (
    e.duracion_media_ms !== null &&
    Number(e.duracion_media_ms) < UMBRALES.duracionRapidaMs &&
    pctGlobal !== null &&
    pctGlobal < UMBRALES.pctBajaParaPrisa
  ) {
    alertas.push({
      nivel: NIVEL.INFO,
      titulo: "Respuestas rápidas y con poco acierto",
      detalle: `${Math.round(Number(e.duracion_media_ms) / 1000)}s de media por actividad, ${Math.round(pctGlobal)}% de acierto.`,
    });
  }

  return alertas.sort((a, b) => ORDEN[a.nivel] - ORDEN[b.nivel]);
}

/** Acierto medio de todas las modalidades, o null si no hay ninguno medido. */
export function promedioAciertos(e) {
  const partes = [];
  if (e.pct_evaluativa !== null && e.n_evaluativas > 0) partes.push([Number(e.pct_evaluativa), Number(e.n_evaluativas)]);
  if (e.pct_exploratoria !== null && e.n_exploratorias > 0) partes.push([Number(e.pct_exploratoria), Number(e.n_exploratorias)]);
  if (partes.length === 0) return null;
  const total = partes.reduce((s, [, n]) => s + n, 0);
  return partes.reduce((s, [p, n]) => s + p * n, 0) / total;
}

/** Todas las alertas del grupo, ya ordenadas por urgencia. */
export function alertasDelGrupo(estudiantes) {
  return estudiantes
    .flatMap((e) => alertasDe(e).map((a) => ({ ...a, estudiante: e })))
    .sort((a, b) => ORDEN[a.nivel] - ORDEN[b.nivel] || b.estudiante.dias_inactivo - a.estudiante.dias_inactivo);
}
