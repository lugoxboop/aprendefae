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
             * Las tres piezas de "El corazón de la economía". Exploración
             * libre: no hay preguntas ni condición de término, así que no hay
             * nada que puntuar. Material, no juego.
             *
             * EL ID SE CONSERVA A PROPÓSITO. La pieza se rehízo entera y
             * cambió de nombre, pero "grifos-da" es también el nombre de la
             * vista en el hash (#/grifos-da) y de la rama del enrutador.
             * Renombrarlo rompería los enlaces que ya circulan y no arreglaría
             * nada: el id no se le enseña a nadie.
             */
            id: "grifos-da",
            nombre: "El corazón de la economía",
            clasificacion: { tipo: APRENDER },
          },
          {
            id: "pulso-memoria",
            nombre: "Pulso de memoria",
            clasificacion: { tipo: APRENDER },
          },
          {
            id: "estetoscopio-casos",
            nombre: "Diagnóstico con estetoscopio",
            clasificacion: { tipo: APRENDER },
          },
          /*
           * ═══════════ LOS SIETE JUEGOS DEL CORAZÓN ═══════════
           *
           * Sustituyen al "Simulador de los 4 canales" (id simulador-da), que
           * era la única actividad Hacer del tema y se retiró entero: su
           * exploración con diales es hoy "El corazón de la economía", en la
           * mitad Aprender y con el mismo modelo, y sus veintidós preguntas de
           * recordar y comprender las cubren la 1, la 2 y la 7 con banco más
           * grande y sorteo por partida. Analizar, evaluar y crear no los tenía
           * de ninguna forma; los añaden la 4, la 5 y la 6.
           *
           * Las siete son evaluativas: se contesta una vez por ítem y el
           * porcentaje mide desempeño, no constancia. Era justamente lo que el
           * simulador no podía sostener, por eso él era exploratoria.
           */
          /*
           * ═══════════ CIMIENTOS (0030) ═══════════
           *
           * Los dos juegos Fácil. La mecánica es la misma en las tres materias
           * a propósito: la entrada del camino se siente igual se abra la que
           * se abra. El Memorama es exploratoria —paga por terminar— y la
           * primera clasificación, evaluativa. Los dos a 10 FP, la base de
           * Fácil de motor.js: con 18, una Fácil pagaba casi lo que una Media
           * (25, o 21 con cinco de seis) y la escala de dificultad dejaba de
           * decir nada. Ver la 0030.
           */
          {
            id: "memorama-corazon",
            nombre: "Memorama del Corazón",
            clasificacion: { tipo: HACER, modalidad: "exploratoria", dificultad: "facil", fpBase: 10 },
          },
          {
            /* La versión sin reloj de la Sala de monitores. */
            id: "cual-componente",
            nombre: "¿Cuál componente?",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "facil", fpBase: 10 },
          },
          {
            /* Recordar. Ocho definiciones de dieciséis y cuatro fragmentos de seis. */
            id: "electrocardiograma",
            nombre: "Lectura de electrocardiograma",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 },
          },
          {
            /* Comprender. Doce cambios en el banco, seis por partida. */
            id: "termometro-reacciones",
            nombre: "El termómetro de reacciones",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 },
          },
          {
            /* Aplicar. Ejemplos que se desvanecen: resuelto, guiado, solo. */
            id: "banco-transfusiones",
            nombre: "Banco de transfusiones",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "dificil", fpBase: 50 },
          },
          {
            /* Analizar. Dos fuerzas opuestas y una sola decisión, todo o nada. */
            id: "biopsia-economica",
            nombre: "Biopsia económica",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "dificil", fpBase: 50 },
          },
          {
            /* Evaluar. Duelos por parejas: cuál va primero y por qué. */
            id: "triage-emergencias",
            nombre: "Triage de emergencias",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "experto", fpBase: 90 },
          },
          {
            /* Crear. Reconstruir la cadena de un golpe: primer y segundo orden. */
            id: "cirugia-reconstruccion",
            nombre: "Cirugía de reconstrucción",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "experto", fpBase: 90 },
          },
          {
            /* Aplicar, intercalado. Doce alertas de veinticuatro, mezcladas. */
            id: "sala-monitores",
            nombre: "Sala de monitores",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "dificil", fpBase: 50 },
          },
          /*
           * Los tres que completan Aplicación, Análisis y Maestría (0030). Cada
           * uno comparte mecánica con su par de Política Fiscal: el reparto de
           * actores, el efecto protégé y la frontera de señales.
           */
          {
            id: "quien-beneficia-auge",
            nombre: "¿A quién beneficia el auge?",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 },
          },
          {
            id: "explica-paciente",
            nombre: "Explícaselo a un paciente nuevo",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "dificil", fpBase: 50 },
          },
          {
            id: "sala-espera-llena",
            nombre: "La sala de espera llena",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "experto", fpBase: 90 },
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
          /* Cimientos (0030): los mismos dos juegos Fácil que en los otros dos temas. */
          {
            id: "memorama-tesoro",
            nombre: "Memorama del Tesoro",
            clasificacion: { tipo: HACER, modalidad: "exploratoria", dificultad: "facil", fpBase: 10 },
          },
          {
            id: "que-rama-es",
            nombre: "¿Qué rama es?",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "facil", fpBase: 10 },
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
             *
             * SIN ÍTEMS, Y ES UNA PROPIEDAD DE LA MECÁNICA. No hay preguntas
             * que acertar o fallar: se mueven tres palancas y se lee a dónde
             * llegan los indicadores, así que no hay nada que registrar en
             * fp_detalle y nunca lo habrá mientras la mecánica sea esta.
             *
             * Lo declara para que la vista por actividad OMITA la sección de
             * diagnóstico entera en vez de enseñarla vacía. Un vacío por "no
             * hay ítems" y uno por "todavía no hay bastantes intentos" son dos
             * cosas distintas y el docente tiene que poder distinguirlas.
             */
            id: "tablero-decisiones",
            nombre: "El tablero de decisiones",
            sinItems: true,
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "experto", fpBase: 90 },
          },
          {
            /* Construir la cadena entera desde un problema nuevo. La más dura. */
            id: "simulador-de-crisis",
            nombre: "El simulador de crisis",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "experto", fpBase: 90 },
          },
          /* Los tres que completan Aplicación, Análisis y Maestría (0030). */
          {
            /* Predecir antes de ver: el cambio acerca o aleja el objetivo. */
            id: "se-acerca-o-se-aleja",
            nombre: "¿Se acerca o se aleja?",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 },
          },
          {
            /* Un caso y una decisión, todo o nada, como Biopsia y El agujero fiscal. */
            id: "expediente-gabinete",
            nombre: "El expediente del gabinete",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "dificil", fpBase: 50 },
          },
          {
            /* Tres propuestas y tres duelos: un orden sin pedirlo de golpe. */
            id: "consejo-ministros",
            nombre: "El consejo de ministros",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "experto", fpBase: 90 },
          },
        ],
      },
      {
        /*
         * ═══════════ POLÍTICA FISCAL — "LA TESORERÍA NACIONAL" ═══════════
         *
         * Siete juegos, uno por peldaño de Bloom más uno intercalado, sobre el
         * PPTX del profesor, y una presentación de cuatro escenas para
         * proyectar en clase. Con las dos mitades, el índice parte la
         * tarjeta. Los bancos de los juegos viven en src/data/politicaFiscal.js;
         * el texto de la presentación, en src/data/politicaFiscalClase.js.
         *
         * OJO CON UNA CONSECUENCIA: "Macroeconomía al día" (medallas.js) exige
         * TODOS los juegos Hacer de la materia y se calcula al vuelo. Con estos
         * siete, quien la tuviera vuelve a 14 de 21 hasta hacerlos. Es el
         * comportamiento que la medalla declara —"al día"—, no un efecto
         * secundario, pero conviene saberlo antes de que un estudiante pregunte.
         */
        id: "politica-fiscal",
        title: "Política Fiscal",
        actividades: [
          {
            /*
             * La mitad Aprender: la presentación que el profesor proyecta y
             * avanza con el mando (ClasePoliticaFiscal). Material, no juego:
             * no otorga FP, no entra en actividad_catalogo y no llama a
             * registrar_fp.
             */
            id: "clase-politica-fiscal",
            nombre: "La política fiscal en cuatro escenas",
            clasificacion: { tipo: APRENDER },
          },
          /* Cimientos (0030): los mismos dos juegos Fácil que en los otros dos temas. */
          {
            id: "memorama-tesoreria",
            nombre: "Memorama de la Tesorería",
            clasificacion: { tipo: HACER, modalidad: "exploratoria", dificultad: "facil", fpBase: 10 },
          },
          {
            id: "cobra-gasta-o-pide",
            nombre: "¿Cobra, gasta o pide prestado?",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "facil", fpBase: 10 },
          },
          {
            /* Recordar. Las tarjetas del profesor: doce de dieciocho, a tres ranuras. */
            id: "clasificador-tesoro",
            nombre: "El clasificador del Tesoro",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 },
          },
          {
            /* Comprender. Ocho impuestos, cuatro sellos: sobre qué recae cada uno. */
            id: "directos-indirectos",
            nombre: "Directos e indirectos",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 },
          },
          {
            /* Aplicar. Por qué canal llega cada medida a la DA, y el multiplicador. */
            id: "flujo-de-caja",
            nombre: "Flujo de caja: ¿a quién afecta?",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "dificil", fpBase: 50 },
          },
          {
            /* Analizar. Un caso de prensa y una sola decisión, todo o nada. */
            id: "agujero-fiscal",
            nombre: "El agujero fiscal",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "dificil", fpBase: 50 },
          },
          {
            /* Evaluar. Duelos por parejas en recesión o en sobrecalentamiento. */
            id: "expansiva-contractiva",
            nombre: "Expansiva o contractiva",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "experto", fpBase: 90 },
          },
          {
            /* Crear. Dos casillas y ocho señuelos: cómo se paga un acueducto. */
            id: "disena-presupuesto",
            nombre: "Diseña el presupuesto",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "experto", fpBase: 90 },
          },
          {
            /* Aplicar, intercalado. Déficit (flujo) contra deuda (saldo), cada vez más rápido. */
            id: "deficit-vs-deuda",
            nombre: "Déficit vs deuda",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "dificil", fpBase: 50 },
          },
          /*
           * Los tres que completan Aplicación, Análisis y Maestría (0030), con
           * la mecánica de su par de Demanda Agregada.
           *
           * Y la misma consecuencia que la nota de arriba, más grande: con los
           * quince de la 0030, "Macroeconomía al día" y "Materia completa"
           * pasan de exigir 21 juegos a exigir 36.
           */
          {
            id: "quien-afecta-ajuste",
            nombre: "¿A quién afecta el ajuste?",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 },
          },
          {
            id: "explica-contribuyente",
            nombre: "Explícaselo a un contribuyente",
            clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "dificil", fpBase: 50 },
          },
          {
            id: "comite-presupuesto",
            nombre: "El comité de presupuesto",
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
/*
 * Y dónde vive cada actividad. Se llena en el mismo recorrido: separarlo en un
 * segundo bucle sobre lo mismo sería una segunda oportunidad de que uno se
 * quedara desactualizado respecto al otro.
 */
const UBICACION_POR_ID = new Map();
for (const materia of Object.values(SUBJECTS)) {
  for (const tema of materia.topics ?? []) {
    for (const a of tema.actividades ?? []) {
      if (a.id && a.nombre) NOMBRES_POR_ID.set(a.id, a.nombre);
      if (a.id) UBICACION_POR_ID.set(a.id, { materiaId: materia.id, temaId: tema.id });
    }
  }
}

/**
 * En qué materia y tema vive una actividad, o null si no es una del catálogo.
 *
 * Lo necesitan las dos direcciones del enlace de rendimiento: el enlace que sale
 * de una actividad tiene que saber su materia para preguntar si el docente está
 * autorizado EN ELLA, y el panel tiene que saberla para abrirse en la materia
 * correcta cuando llega con una actividad en la URL.
 */
export function ubicacionDeActividad(activityId) {
  return UBICACION_POR_ID.get(activityId) ?? null;
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
