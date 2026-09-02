/*
 * Registro de materias, temas y actividades realmente disponibles.
 * Esta es la única fuente de verdad de qué existe: si algo no está aquí,
 * no se muestra. Nada de temas de relleno ni fechas inventadas.
 *
 * ---------------------------------------------------------------------------
 * CLASIFICACIÓN DE ACTIVIDADES
 *
 * La clasificación la define Gen (pedagogía), no el código. Aquí solo se
 * transcribe, y la interfaz la refleja sola:
 *
 *   { tipo: APRENDER }  material explicativo. No otorga FP nunca.
 *   { tipo: HACER, modalidad, dificultad, fpBase }  juego que otorga FP.
 *
 * Una actividad SIN `clasificacion` es una que Gen todavía no ha clasificado:
 * no lleva insignia y no se conecta a FP. Es un estado válido y deliberado,
 * no un olvido — por eso se representa con la ausencia del dato y no con un
 * caso especial en el código.
 *
 * Para añadir una actividad nueva basta con agregarla a esta lista con su
 * clasificación: no hay que tocar componentes.
 * ---------------------------------------------------------------------------
 */

export const APRENDER = "aprender";
export const HACER = "hacer";

export const ETIQUETAS = {
  [APRENDER]: "Aprender",
  [HACER]: "Hacer",
};

export const SUBJECTS = {
  macroeconomia: {
    id: "macroeconomia",
    name: "Macroeconomía",
    topics: [
      {
        id: "demanda-agregada",
        title: "Demanda Agregada",
        /* Pendiente de clasificar por Gen: sin insignia y sin conexión a FP. */
        actividades: [
          { id: "simulador-da", nombre: "Simulador de los 4 canales" },
        ],
      },
      {
        id: "politica-economica",
        title: "Política Económica",
        actividades: [
          {
            id: "cadena-desempleo",
            nombre: "Desempleo: la cadena en vivo",
            clasificacion: { tipo: APRENDER },
          },
          {
            id: "dashboard-economico",
            nombre: "Dashboard económico en vivo",
            clasificacion: {
              tipo: HACER,
              modalidad: "evaluativa",
              dificultad: "experto",
              fpBase: 90,
            },
          },
        ],
      },
    ],
  },
  "pensamiento-estrategico": {
    id: "pensamiento-estrategico",
    name: "Pensamiento Estratégico",
    topics: [
      {
        id: "pensamiento-sistemico",
        title: "Pensamiento Sistémico",
        actividades: [
          {
            id: "comparador-cadena-red",
            nombre: "Comparador cadena/red",
            clasificacion: { tipo: APRENDER },
          },
          {
            id: "constructor-mapa-causal",
            nombre: "Constructor de mapa causal",
            clasificacion: {
              tipo: HACER,
              modalidad: "evaluativa",
              dificultad: "dificil",
              fpBase: 50,
            },
          },
        ],
      },
      {
        id: "modelo-iceberg",
        title: "Modelo del Iceberg",
        /*
         * ANDAMIO TEMPORAL. Marca que la vista de este tema ya sabe mostrarse
         * filtrada por modo (solo Aprender o solo Hacer), así que su tarjeta
         * puede ofrecer la elección en vez de entrar directo.
         *
         * Existe solo mientras la separación se despliega tema por tema: en
         * cuanto los cinco temas la tengan, el campo se borra de todos y la
         * tarjeta partida pasa a ser el comportamiento único.
         */
        modosFiltrados: true,
        actividades: [
          {
            id: "buceo-progresivo",
            nombre: "Buceo progresivo",
            clasificacion: { tipo: APRENDER },
          },
          {
            id: "decision-punta-vs-completo",
            nombre: "Decisión punta vs. completo",
            clasificacion: {
              tipo: HACER,
              modalidad: "exploratoria",
              dificultad: "facil",
              fpBase: 10,
            },
          },
          {
            id: "iceberg-arriba-abajo",
            nombre: "Constructor de arriba hacia abajo",
            clasificacion: {
              tipo: HACER,
              modalidad: "evaluativa",
              dificultad: "medio",
              fpBase: 25,
            },
          },
          {
            id: "caso-blockbuster",
            nombre: "Caso real en línea de tiempo",
            clasificacion: {
              tipo: HACER,
              modalidad: "evaluativa",
              dificultad: "dificil",
              fpBase: 50,
            },
          },
        ],
      },
      {
        id: "fuerzas-porter",
        title: "Fuerzas de Porter",
        /* Pendientes de clasificar por Gen: sin insignia y sin conexión a FP. */
        actividades: [
          { id: "batalla-industrias", nombre: "Batalla de industrias" },
          { id: "termometro-fuerza", nombre: "Termómetro por fuerza" },
        ],
      },
    ],
  },
};

/* Las actividades de un tema que son de un tipo (APRENDER u HACER). */
export function actividadesDeTipo(topic, tipo) {
  return (topic?.actividades ?? []).filter((a) => a.clasificacion?.tipo === tipo);
}

/*
 * Si un tema tiene contenido de ese tipo. Es lo que decide si la opción se
 * ofrece o se muestra como "aún no disponible": la respuesta sale del dato, no
 * de una lista de excepciones por tema.
 */
export function tieneContenidoDe(topic, tipo) {
  return actividadesDeTipo(topic, tipo).length > 0;
}

/* Busca la clasificación de una actividad concreta dentro de un tema. */
export function clasificacionDe(subjectId, topicId, actividadId) {
  const topic = SUBJECTS[subjectId]?.topics.find((t) => t.id === topicId);
  return topic?.actividades?.find((a) => a.id === actividadId)?.clasificacion ?? null;
}

/*
 * Tipos distintos presentes en un tema, en orden estable.
 * Un tema con actividades de los dos tipos muestra las dos insignias.
 */
export function tiposDeTema(topic) {
  const vistos = [];
  for (const act of topic.actividades ?? []) {
    const tipo = act.clasificacion?.tipo;
    if (tipo && !vistos.includes(tipo)) vistos.push(tipo);
  }
  return vistos;
}

export const EMPTY_TOPICS_MESSAGE = "Los temas de esta materia están en construcción.";
