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
        actividades: [
          {
            /*
             * Exploración libre: no hay preguntas ni condición de término, así
             * que no hay nada que puntuar. Material, no juego.
             */
            id: "grifos-da",
            nombre: "Los grifos de la Demanda Agregada",
            clasificacion: { tipo: APRENDER },
          },
          {
            id: "simulador-da",
            nombre: "Simulador de los 4 canales",
            /*
             * Exploratoria y no evaluativa por decisión de Gen: el quiz deja
             * reintentar hasta acertar, así que el porcentaje final siempre
             * sería 100 y mediría constancia, no desempeño. Llamarla
             * evaluativa sería ponerle una etiqueta que el dato no sostiene.
             *
             * No es una rebaja temporal: describe lo que la actividad hace hoy.
             */
            clasificacion: {
              tipo: HACER,
              modalidad: "exploratoria",
              dificultad: "dificil",
              fpBase: 50,
            },
          },
        ],
      },
      {
        id: "politica-economica",
        title: "Política Económica",
        actividades: [
          {
            /*
             * Los tres paneles de "La sala de control de la economía". Material
             * teórico: exploración libre, sin preguntas, sin condición de
             * término y sin FP, así que no entran al catálogo del servidor.
             */
            id: "tablero-fallas",
            nombre: "El tablero de fallas",
            clasificacion: { tipo: APRENDER },
          },
          {
            id: "autorregulacion-intervencion",
            nombre: "¿Autorregulación o intervención?",
            clasificacion: { tipo: APRENDER },
          },
          {
            id: "maquina-da-palancas",
            nombre: "La máquina de la DA y sus palancas",
            clasificacion: { tipo: APRENDER },
          },
          {
            /*
             * Recordar. Ocho titulares reales caen uno a uno y hay que
             * clasificarlos antes de que crucen la línea de archivo.
             */
            id: "diagnostico-en-vivo",
            nombre: "Diagnóstico en vivo",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 },
          },
          {
            /*
             * Aplicar. Seis casillas del grupo lógico y doce enunciados, seis
             * de ellos de otras cadenas del profesor: obligan a leer.
             */
            id: "arma-grupo-logico",
            nombre: "Arma el grupo lógico",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "dificil", fpBase: 50 },
          },
          {
            /* Rol de actor: quién gana y quién pierde con cada medida. */
            id: "quien-gana-quien-pierde",
            nombre: "¿Quién gana, quién pierde?",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 },
          },
          {
            /* Práctica intercalada: dieciocho enunciados en una cinta que acelera. */
            id: "corriente-titulares",
            nombre: "Corriente de titulares",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "dificil", fpBase: 50 },
          },
          {
            /*
             * Efecto protégé. La ficha pedía "media-alta", que no es un nivel
             * de este sistema —las gradas son fácil/medio/difícil/experto— así
             * que va a difícil: elegir cuatro frases de ocho y ordenarlas, con
             * jerga y falsedades mezcladas, está más cerca de eso que de medio.
             */
            id: "explica-la-politica",
            nombre: "Explica la política",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "dificil", fpBase: 50 },
          },
          {
            /*
             * Reconstrucción del dashboard retirado: hereda su modelo
             * verificado —coeficientes y tramos— y nada de su interfaz.
             */
            id: "tablero-decisiones",
            nombre: "El tablero de decisiones",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "experto", fpBase: 90 },
          },
          {
            /* Construir la cadena entera desde un problema nuevo. La más dura. */
            id: "simulador-de-crisis",
            nombre: "El simulador de crisis",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "experto", fpBase: 90 },
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
        actividades: [
          {
            id: "buceo-progresivo",
            nombre: "Buceo progresivo",
            clasificacion: { tipo: APRENDER },
          },
          {
            /*
             * Recordar. La dificultad que se declara aquí es la del modo fácil;
             * el modo experto la sube a "dificil" al completar, porque pide
             * sacar el término de memoria en vez de reconocerlo entre cuatro.
             */
            id: "camara-presion",
            nombre: "Cámara de presión",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 },
          },
          {
            /* Aplicar: clasificar frases de un caso nuevo, con trampas. */
            id: "radar-profundidad",
            nombre: "Radar de profundidad",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 },
          },
          {
            /* Analizar: el caso Blockbuster entero, y dónde valía intervenir. */
            id: "expediente-rescate",
            nombre: "Expediente de rescate",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "dificil", fpBase: 50 },
          },
          {
            /*
             * Evaluar: tres explicaciones que funcionan, ordenadas por cuánto
             * explican. Experto como el arquitecto, y por lo mismo: no hay
             * respuesta que se vea mal a simple vista.
             *
             * Va ANTES del arquitecto porque este orden es el que dibuja el
             * camino, y en Bloom evaluar viene antes que crear.
             */
            id: "tribunal-profundidad",
            nombre: "Tribunal de profundidad",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "experto", fpBase: 90 },
          },
          {
            /* Crear: armar un iceberg desde cero, con un banco lleno de ruido. */
            id: "arquitecto-profundidades",
            nombre: "Arquitecto de las profundidades",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "experto", fpBase: 90 },
          },
          {
            /*
             * Efecto protégé: explicárselo a alguien que baja por primera vez.
             * Se pidió "media-alta" y las gradas del motor son cuatro
             * —facil/medio/dificil/experto—, así que no hay un escalón entre
             * medio y difícil. Va a difícil: elegir cinco frases de once y
             * ordenarlas está más cerca de eso que de reconocer un término.
             */
            id: "transmision-superficie",
            nombre: "Transmisión a la superficie",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "dificil", fpBase: 50 },
          },
          {
            /* Práctica intercalada: los cuatro casos mezclados, nunca agrupados. */
            id: "corriente-cruzada",
            nombre: "Corriente cruzada",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "dificil", fpBase: 50 },
          },
          {
            /*
             * EL DESAFÍO DEL TEMA, y no una octava actividad.
             *
             * `desafio: true` lo saca de actividadesDeTipo(), que es lo que
             * dibuja el camino y lo que cuenta para "tema completo" y para las
             * medallas. Si contara, un desafío opcional de cuatro etapas se
             * volvería obligatorio para cerrar el tema, que es justo lo que no
             * queremos: está al lado del camino, no dentro.
             *
             * `etapas: 4` es lo que dispara la regla del Kit para desafíos
             * compuestos: base × etapas = 90 × 4 = 360. La multiplicación la
             * hace el servidor; aquí solo se declara, y catalogo.test.mjs
             * comprueba que los dos digan lo mismo.
             */
            id: "proyecto-arca",
            nombre: "El Proyecto del Arca",
            clasificacion: {
              tipo: HACER,
              modalidad: "evaluativa",
              dificultad: "experto",
              fpBase: 90,
              etapas: 4,
              desafio: true,
            },
          },
        ],
      },
      {
        id: "fuerzas-porter",
        title: "Fuerzas de Porter",
        actividades: [
          {
            id: "batalla-industrias",
            nombre: "Batalla de industrias",
            clasificacion: { tipo: APRENDER },
          },
          {
            /*
             * Material, no juego: el termómetro promedia los pesos fijos de las
             * opciones que el estudiante elige y pinta el resultado. No hay un
             * perfil del gimnasio contra el cual validar, así que no existe
             * respuesta incorrecta que puntuar.
             */
            id: "termometro-fuerza",
            nombre: "Termómetro por fuerza",
            clasificacion: { tipo: APRENDER },
          },
          {
            id: "asedio-estrategico",
            nombre: "Asedio Estratégico — Defiende tu Margen",
            clasificacion: {
              tipo: HACER,
              modalidad: "evaluativa",
              dificultad: "dificil",
              fpBase: 50,
            },
          },
        ],
      },
    ],
  },
};

/*
 * Las actividades de un tema que son de un tipo (APRENDER u HACER).
 *
 * LOS DESAFÍOS NO SALEN POR AQUÍ. Un nodo de desafío es contenido del tema,
 * pero no forma parte de su recorrido: no se numera en el camino, no cuenta
 * para "tema completo" ni para las medallas de materia, y no suma en el
 * contador de la tarjeta partida. Todo eso cuelga de esta función, así que
 * excluirlos aquí es excluirlos de las cinco cosas a la vez.
 *
 * Si contaran, un desafío opcional se volvería requisito para cerrar el tema,
 * que es exactamente el bloqueo encubierto que el camino evita por diseño.
 */
export function actividadesDeTipo(topic, tipo) {
  return (topic?.actividades ?? []).filter(
    (a) => a.clasificacion?.tipo === tipo && !a.clasificacion?.desafio
  );
}

/* El desafío de un tema, si tiene. Hoy hay como mucho uno por tema. */
export function desafioDe(topic) {
  return (topic?.actividades ?? []).find((a) => a.clasificacion?.desafio) ?? null;
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

/*
 * El nombre legible de una actividad, buscado por id en todas las materias.
 *
 * Existe para el panel docente: fp_history guarda ids y un profesor no tiene
 * por qué leer "arma-grupo-logico". Devuelve null si el id no está en el
 * catálogo —una actividad retirada, por ejemplo— y quien llama decide qué
 * enseñar entonces; devolver el id disfrazado de nombre sería peor.
 */
const NOMBRES_POR_ID = new Map();
for (const materia of Object.values(SUBJECTS)) {
  for (const tema of materia.topics ?? []) {
    for (const a of tema.actividades ?? []) {
      if (a.id && a.nombre) NOMBRES_POR_ID.set(a.id, a.nombre);
    }
  }
}

/*
 * Y los ids que el servidor conoce pero no son una entrada del catálogo del
 * cliente. Hoy solo uno: el modo experto de la cámara se registra con id
 * propio porque paga distinto, pero no es otra actividad en el camino. La
 * excepción ya está documentada en catalogo.test.mjs; aquí solo se le pone
 * nombre para que el panel no enseñe un id crudo.
 */
const ALIAS = { "camara-presion-experto": "Cámara de presión · modo experto" };

export function nombreDeActividad(activityId) {
  return NOMBRES_POR_ID.get(activityId) ?? ALIAS[activityId] ?? null;
}

export const EMPTY_TOPICS_MESSAGE = "Los temas de esta materia están en construcción.";
