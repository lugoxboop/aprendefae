import {
  ID, NOMBRES, OBJETIVO, EL_HECHO, TEXTOS, CIERRE, FACTURA, CUENTA_RESALTADA, ESTACIONES,
  USUARIOS, VACIO_CAPA_3, PREGUNTA_FINAL, OPCIONES,
} from "./contabilidadIntro.js";
import {
  ID_P2, NOMBRES_P2, OBJETIVO_P2, TEXTOS_P2, SIEMBRA_P2, CIERRE_P2, BLOQUES, CASOS_P2, NOTA_CAPA3_P2, PREGUNTA_P2, OPCIONES_P2,
  ID_P3, NOMBRES_P3, OBJETIVO_P3, TEXTOS_P3, SIEMBRA_P3, CIERRE_P3, FOTOS, CONSIGNA_P3, PREGUNTAS_P3, RESPUESTAS_P3, ERROR_P3,
  PREGUNTA_P3, OPCIONES_P3,
  ID_P4, NOMBRES_P4, OBJETIVO_P4, TEXTOS_P4, SIEMBRA_P4, CIERRE_P4, INFORMES_P4, FLECHAS_P4, MODO_FLECHA, PREGUNTA_P4, OPCIONES_P4,
} from "./contabilidadPiezas234.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 1 · APRENDER — LAS CUATRO PIEZAS COMO PRESENTACIÓN, PANTALLA POR PANTALLA.
 *
 * El orden es el de la ficha de Futaba (orquestador/conocimiento/fichas/
 * b-t1-aprender-secuencia-y-hacer.md, encargo 1), NO el de las capas que pinta
 * hoy `CuatroCapas`. El patrón de las cuatro: gancho que pide predecir → un
 * término por pantalla → la escena, un paso por pantalla, con una parada →
 * prueba → una frase → puente a la pieza siguiente.
 *
 * ═══════════ TODAVÍA NO SE VE ═══════════
 *
 * Nada de esto se pinta: el estudiante sigue viendo `CuatroCapas` con las
 * escenas de `escenasIntro.jsx`, que leen las constantes publicadas de
 * siempre. Esta lista la va a leer el componente de presentación de Erwin
 * (el patrón es de Ukyo). Por eso aquí no se toca ninguna constante
 * publicada: los textos nuevos y los recortados viven en este archivo.
 *
 * ═══════════ DE DÓNDE SALE CADA TEXTO ═══════════
 *
 * Cada texto que lee el estudiante va envuelto y dice su origen:
 *
 *   publicado(t)       t ES la constante publicada (por identidad, no por
 *                      parecido; la prueba t1-pantallas lo comprueba).
 *   recortado(t, de)   versión de Futaba de un texto publicado `de`:
 *                      recortado a 25 palabras, sin «Correcto.» ni «No.», o
 *                      reescrito por legibilidad. PARA SHOKO.
 *   nuevo(t)           texto de Futaba armado con la línea que cita
 *                      `fuente`. PARA SHOKO.
 *
 * Las citas del libro («Así lo dice el libro») van aparte, en `cita`, y no
 * cuentan para el límite de 25 palabras.
 *
 * ═══════════ LA FORMA DE UNA PANTALLA ═══════════
 *
 *   n        su número en la ficha.
 *   idea     la idea de la pantalla (para quien diseña, no se lee).
 *   ve       qué ve el estudiante (para quien diseña, no se lee).
 *   hace     siguiente · predice · parada · toca · elige · prueba ·
 *            clasifica · repasa · frase · puente.
 *   texto    lo que se lee, en orden.
 *   fuente   archivo:línea de la ficha (I = contabilidadIntro.js,
 *            P = contabilidadPiezas234.js, T = contabilidadTema1.js).
 *   y lo propio de cada `hace` (opciones, pista, devoluciones, datos).
 *
 * Predicciones del gancho: no califican, todas las opciones llevan la misma
 * `respuesta`. Paradas y frases: el 1.er error da la `pista` y el 2.º la
 * devolución de esa opción.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const PUBLICADO = "publicado";
export const RECORTADO = "recortado";
export const NUEVO = "nuevo";

const publicado = (texto) => ({ texto, origen: PUBLICADO });
const recortado = (texto, de) => ({ texto, origen: RECORTADO, de });
const nuevo = (texto) => ({ texto, origen: NUEVO });

/* Una opción de parada o de decisión. */
const opcion = (id, texto, devolucion, correcta = false) => ({ id, texto: nuevo(texto), correcta, devolucion });

/* La frase final: las opciones publicadas, con la devolución recortada de Futaba. */
const frase = (opciones, devoluciones) => opciones.map((o) => ({
  id: o.id, texto: publicado(o.texto), correcta: o.correcta,
  devolucion: recortado(devoluciones[o.id], o.feedback),
}));

/* ═══════════════════ cu0-a1 · EL RECORRIDO DE UN HECHO (17) ═══════════════════ */

/* Los siete verbos de la cita del término 1, en su orden; «registrar» es el que se marca como «anotar». */
export const VERBOS_DEL_LIBRO = ["identificar", "clasificar", "registrar", "resumir", "interpretar", "analizar", "evaluar"];
export const VERBO_ANOTAR = "registrar";

const PREDICE_PASOS = nuevo("Mucha gente cree que la contabilidad es anotar. ¿Cuántos pasos crees que hay, desde que pasa algo hasta que alguien decide?");
/* Reemplaza a EL_HECHO (INFLESZ 39,9) en la secuencia; el nombre completo de la empresa sigue en la factura (nota 1 de la ficha). */
export const EL_HECHO_CORTO = "Caleja compra un computador por $25.000. No lo paga: lo queda debiendo.";

const A1 = [
  {
    n: 1, idea: "Anotar no es todo", ve: "Una libreta sola, en el centro", hace: "predice",
    texto: [PREDICE_PASOS],
    opciones: ["Uno", "Tres", "Cinco"].map(nuevo),
    respuesta: nuevo("Son cinco, y anotar es solo el tercero. Los vas a ver con un solo hecho."),
    fuente: "Nuevo, de I:31 y I:133",
  },
  {
    n: 2, idea: "Qué es la contabilidad", ve: "Tres íconos: nota → informe → persona", hace: "siguiente",
    texto: [publicado(NOMBRES[0].definicion)], termino: NOMBRES[0].termino, fuente: "I:57",
  },
  {
    n: 3, idea: "El libro dice siete verbos", ve: "Cita del libro con los verbos tocables y un contador 0/7", hace: "toca",
    texto: [nuevo("Toca cada verbo de la frase. Son siete. Registrar, que es anotar, es uno solo.")],
    cita: publicado(NOMBRES[0].delLibro), verbos: VERBOS_DEL_LIBRO, marcaComoAnotar: VERBO_ANOTAR,
    fuente: "Nuevo, de I:58 y I:81",
  },
  {
    n: 4, idea: "Para qué sirve", ve: "La empresa, con gente adentro y gente afuera", hace: "siguiente",
    texto: [publicado(NOMBRES[1].definicion)], termino: NOMBRES[1].termino, fuente: "I:62",
  },
  {
    n: 5, idea: "Los de adentro", ve: "Se encienden los tres de adentro", hace: "siguiente",
    texto: [publicado(NOMBRES[2].definicion)], termino: NOMBRES[2].termino, fuente: "I:66; libro p. 6",
  },
  {
    n: 6, idea: "Los de afuera", ve: "Se encienden los de afuera", hace: "siguiente",
    texto: [publicado(NOMBRES[3].definicion)], termino: NOMBRES[3].termino, fuente: "I:70",
  },
  {
    n: 7, idea: "Pasa algo", ve: "Las cinco estaciones apagadas; se prende la 1 con el hecho", hace: "siguiente",
    texto: [recortado(EL_HECHO_CORTO, EL_HECHO), publicado(TEXTOS[1])],
    estacion: ESTACIONES[0], fuente: "I:109 (reescrito, nota 1) e I:131; Gráfico 1.1, p. 6",
  },
  {
    n: 8, idea: "Queda un papel", ve: "Estación 2: la factura, con guiones en los campos que el libro no da", hace: "siguiente",
    texto: [publicado(TEXTOS[2])], estacion: ESTACIONES[1], factura: FACTURA, fuente: "I:132, I:120-128",
  },
  {
    n: 9, idea: "Parada", ve: "La factura sola, y la estación 3 con un signo de pregunta", hace: "parada",
    texto: [nuevo("Ya hay un papel. ¿Qué crees que pasa con él ahora?")],
    pista: nuevo("Mira el nombre del punto tres en la columna."),
    opciones: [
      opcion("anota", "Se anota en los libros", nuevo("El papel es la base para anotar: con él, el hecho se escribe en los libros."), true),
      opcion("guarda", "Se guarda y ya", nuevo("Guardar el papel no basta. El papel es la base para anotar el hecho, y ese es el paso que sigue.")),
      opcion("estado", "Se le manda al Estado", nuevo("El Estado lee el informe, pero eso viene después. Antes, el papel sirve para anotar el hecho.")),
    ],
    fuente: "Nuevo, de I:102 y de los distractores I:227 e I:234",
  },
  {
    n: 10, idea: "Se anota", ve: "Estación 3: el renglón", hace: "siguiente",
    texto: [publicado(TEXTOS[3])], estacion: ESTACIONES[2], fuente: "I:133",
  },
  {
    n: 11, idea: "Sale un informe", ve: "Estación 4: el renglón se vuelve una línea del balance", hace: "siguiente",
    texto: [publicado(TEXTOS[4])], estacion: ESTACIONES[3], resaltada: CUENTA_RESALTADA, fuente: "I:134, I:141",
  },
  {
    n: 12, idea: "Los jefes deciden", ve: "Estación 5: la pregunta en la mesa de Administradores", hace: "siguiente",
    texto: [publicado(TEXTOS[5])], estacion: ESTACIONES[4], fuente: "I:135, I:162",
  },
  {
    n: 13, idea: "El ciclo se cierra", ve: "Las cinco encendidas y la flecha de retorno", hace: "repasa",
    texto: [publicado(CIERRE)], fuente: "I:138",
  },
  {
    n: 14, idea: "Ocho leen lo mismo", ve: "Los ocho usuarios alrededor de un mismo informe", hace: "toca",
    texto: [publicado(VACIO_CAPA_3)], usuarios: USUARIOS, fuente: "I:198; pp. 11-12",
  },
  {
    n: 15, idea: "Decisión: cuál cierra el ciclo", ve: "Los ocho, y la flecha de retorno atenuada", hace: "elige",
    texto: [nuevo("De los ocho que leen el informe, ¿cuál hace que la flecha vuelva al comienzo?")],
    pista: nuevo("¿Quién de los ocho decide qué hace la empresa?"),
    /* Solo el que tiene `cierraElCiclo` enciende la flecha; los otros siete comparten devolución. */
    opciones: USUARIOS.map((u) => ({ id: u.id, texto: publicado(u.nombre), correcta: u.cierraElCiclo })),
    devolucionCorrecta: nuevo("Los jefes deciden qué hace la empresa. Así nacen hechos nuevos y el ciclo vuelve a empezar."),
    devolucionOtros: nuevo("Esa persona lee el informe y lo usa para algo suyo. Pero no cambia lo que la empresa hace."),
    fuente: "Nuevo, de I:160 (cierraElCiclo) e I:196",
  },
  {
    n: 16, idea: "En una frase", ve: "Las 4 opciones, con su escena", hace: "frase",
    texto: [publicado(PREGUNTA_FINAL)],
    opciones: frase(OPCIONES, {
      op1: "Los que deciden son los jefes, y eso cambia lo que la empresa hace. Así nacen hechos nuevos.",
      op2: "Anotar es el punto tres de cinco. Después vienen el informe y la decisión, y sin ellos nadie usaría lo anotado.",
      op3: "El Estado sí pregunta eso, pero es uno de ocho. El mismo informe responde lo que preguntan los ocho.",
      op4: "Los papeles son el punto dos y hacen falta para anotar. Pero guardarlos no es el trabajo: falta lo que viene después.",
    }),
    fuente: "I:202; devoluciones recortadas de I:214, I:221, I:228 e I:235",
  },
  {
    n: 17, idea: "Puente", ve: "La estación 4 sola, con el balance partido en dos lados", hace: "puente",
    texto: [nuevo("El informe del paso cuatro tiene dos lados. En la siguiente pieza vas a ver por qué siempre dan igual.")],
    siguiente: ID_P2, fuente: "Nuevo, de P:45",
  },
];

/* ═══════════════════ cu0-a2 · LA ECUACIÓN CONTABLE (15) ═══════════════════ */

const A2 = [
  {
    n: 1, idea: "¿De dónde salió todo?", ve: "La torre de 3 bloques, sin rótulos", hace: "predice",
    texto: [nuevo("Esta torre es todo lo que tiene una empresa. ¿Quién crees que puso todo esto?")],
    opciones: ["Los dueños", "El banco", "Una parte cada uno"].map(nuevo),
    respuesta: nuevo("Una parte la puso el banco y el resto, los dueños. Esa respuesta es la mitad de la historia."),
    bloques: BLOQUES, fuente: "Nuevo, de P:95 y P:85-89",
  },
  ...NOMBRES_P2.slice(0, 4).map((t, k) => ({
    n: 2 + k, idea: t.termino,
    ve: ["Se rotula la torre entera", "Se marca el tramo del banco", "Se marca el tramo de los dueños", "Activo = Pasivo + Patrimonio, armada con los rótulos de 2-4"][k],
    hace: "siguiente", texto: [publicado(t.definicion)], termino: t.termino, fuente: `P:${[54, 55, 56, 59][k]}`,
  })),
  {
    n: 6, idea: "Los dos lados", ve: "Lado izquierdo y lado derecho, con la cita del libro", hace: "siguiente",
    texto: [publicado(NOMBRES_P2[4].definicion)], cita: publicado(NOMBRES_P2[4].delLibro), termino: NOMBRES_P2[4].termino,
    fuente: "P:63-64 (Gráfico 2.2)",
  },
  {
    n: 7, idea: "Lectura por la izquierda", ve: "Rótulos: plata, computador, máquina", hace: "siguiente",
    texto: [publicado(TEXTOS_P2[2])], fuente: "P:96",
  },
  {
    n: 8, idea: "Lectura por la derecha", ve: "Rótulos: del banco / de los dueños", hace: "siguiente",
    texto: [recortado("Léela otra vez, por la derecha. Cada tramo dice de dónde salió: un pedazo lo puso el banco y el resto, los dueños.", TEXTOS_P2[3])],
    fuente: "P:97 (recortado: tenía 26 palabras)",
  },
  {
    n: 9, idea: "Misma altura", ve: "Las dos lecturas y una línea a la misma altura", hace: "siguiente",
    texto: [recortado("Misma torre, misma altura. Una lectura dice qué hay. La otra dice de dónde salió.", TEXTOS_P2[4])],
    fuente: "P:98 (partido en dos)",
  },
  {
    n: 10, idea: "Por eso dan igual", ve: "La misma imagen, con la palabra «dos veces»", hace: "siguiente",
    texto: [recortado("Fíjate: son las mismas cosas contadas dos veces. Por eso nunca pueden dar distinto.", SIEMBRA_P2)],
    fuente: "P:69, P:98",
  },
  {
    n: 11, idea: "Parada", ve: "Un bloque nuevo que espera encima de la torre", hace: "parada",
    texto: [nuevo("La empresa compra algo nuevo y lo queda debiendo. ¿Qué crees que le pasa a la torre?")],
    pista: nuevo("¿Lo nuevo hace la torre más alta o más baja?"),
    opciones: [
      opcion("crecen", "Crecen los dos lados", nuevo("Entra algo nuevo y también una deuda nueva. La torre crece, y es igual de alta por los dos lados."), true),
      opcion("uno-baja", "Un lado sube y el otro baja", nuevo("Mira la torre: es una sola. Si crece por un lado, también crece cuando la lees por el otro.")),
      opcion("no-cambia", "La torre no cambia", nuevo("Entró algo que antes no estaba, así que la torre crece. Y la deuda nueva hace crecer el otro lado igual.")),
    ],
    caso: CASOS_P2[0], fuente: "Nuevo, del caso a, P:116; libro p. 35",
  },
  {
    n: 12, idea: "Los cuatro casos", ve: "Los 4 casos de la p. 35; la torre se mueve con el que toque", hace: "toca",
    texto: [publicado(TEXTOS_P2[5]), publicado(NOTA_CAPA3_P2)], casos: CASOS_P2,
    fuente: "P:99, P:115-120, P:126; p. 35",
  },
  {
    n: 13, idea: "La regla", ve: "Las tres flechas: ↑↑, ↓↓, ==", hace: "siguiente",
    texto: [recortado("Nunca vas a ver que uno suba y el otro baje. O suben juntos, o bajan juntos, o se quedan igual.", CIERRE_P2)],
    fuente: "P:109 (recortado: tenía 30 palabras)",
  },
  {
    n: 14, idea: "En una frase", ve: "Las 4 opciones", hace: "frase",
    texto: [publicado(PREGUNTA_P2)],
    opciones: frase(OPCIONES_P2, {
      p2o1: "La torre es una sola: por la izquierda dice qué es cada cosa, por la derecha de dónde salió.",
      p2o2: "Eso es lo que más confunde. En los cuatro casos del libro, los dos lados suben juntos o bajan juntos.",
      p2o3: "Casi siempre debe menos de lo que tiene, y la diferencia es de los dueños. Si debiera todo, a ellos no les quedaría nada.",
      p2o4: "Nadie ajusta nada. Dan igual solos, porque son las mismas cosas miradas de dos formas.",
    }),
    fuente: "P:128; devoluciones de P:135-157, sin «Correcto.» ni «No.»",
  },
  {
    n: 15, idea: "Puente", ve: "La torre, con un reloj marcando un día", hace: "puente",
    texto: [nuevo("La torre es una foto de un día. En la siguiente pieza vas a ver qué pasa entre dos fotos.")],
    siguiente: ID_P3, fuente: "Nuevo, de P:191 y P:196",
  },
];

/* ═══════════════════ cu0-a3 · LA FOTO Y LA PELÍCULA (18 en la tabla) ═══════════════════ */

/* La pantalla 18 de a3 es la 1 de a4 (nota de la ficha): el mismo texto, un solo objeto. */
const PREDICE_SE_PASAN = nuevo("Ya tienes la foto y la película. ¿Crees que cada informe va por su lado, o se pasan cifras?");

const A3 = [
  {
    n: 1, idea: "Un día no alcanza", ve: "Una sola foto de la empresa", hace: "predice",
    texto: [nuevo("Te piden saber cómo le fue a una empresa en el año. ¿Te basta con mirarla un solo día?")],
    opciones: ["Sí", "No"].map(nuevo),
    respuesta: nuevo("Un día te dice cómo está, no qué pasó. Por eso hay dos informes distintos."),
    fuente: "Nuevo, de P:191 y P:300",
  },
  {
    n: 2, idea: "La foto", ve: "Estado de situación financiera, con la cita", hace: "siguiente",
    texto: [publicado(NOMBRES_P3[0].definicion)], cita: publicado(NOMBRES_P3[0].delLibro), termino: NOMBRES_P3[0].termino,
    fuente: "P:196-197",
  },
  {
    n: 3, idea: "La película", ve: "Estado de resultados, con la cita", hace: "siguiente",
    texto: [publicado(NOMBRES_P3[1].definicion)], cita: publicado(NOMBRES_P3[1].delLibro), termino: NOMBRES_P3[1].termino,
    fuente: "P:201-202",
  },
  {
    n: 4, idea: "Los apodos", ve: "Una cámara y una cinta", hace: "siguiente",
    texto: [publicado(NOMBRES_P3[2].definicion), publicado(SIEMBRA_P3)], termino: NOMBRES_P3[2].termino, fuente: "P:206, P:215",
  },
  {
    n: 5, idea: "Hay más informes", ve: "Tres tarjetas en gris", hace: "siguiente",
    texto: [recortado("Hay más informes: el de la plata, el de lo de los dueños y las notas. El de la plata viene en la siguiente pieza.", NOMBRES_P3[3].definicion)],
    termino: NOMBRES_P3[3].termino, fuente: "P:210 (reescrito, nota 3)",
  },
  {
    n: 6, idea: "La línea del tiempo", ve: "La línea vertical vacía", hace: "siguiente",
    texto: [publicado(TEXTOS_P3[1])], fuente: "P:244",
  },
  {
    n: 7, idea: "Foto del 1 de enero", ve: "Se toma la foto de arriba", hace: "siguiente",
    texto: [publicado(TEXTOS_P3[2])], foto: FOTOS[0], fuente: "P:245, P:218-227",
  },
  {
    n: 8, idea: "Parada", ve: "El hueco de la segunda foto, del mismo tamaño", hace: "parada",
    texto: [nuevo("Ahora llega el 31 de diciembre. ¿Crees que la nueva foto se parece a la del 1 de enero?")],
    pista: nuevo("¿Pasó algo en la empresa entre enero y diciembre?"),
    opciones: [
      opcion("distinta", "Distinta", nuevo("En el año la empresa vendió y gastó. Por eso la foto del final ya no es la misma."), true),
      opcion("igual", "Igual", nuevo("Entre las dos fechas pasó todo un año. Lo que vendió y gastó cambia cómo queda la empresa.")),
      opcion("no-hay", "No hay otra foto", nuevo("Sí hay: el 31 de diciembre se toma otra foto del mismo informe, para ver cómo quedó.")),
    ],
    fuente: "Nuevo, de P:239, P:246 y P:250",
  },
  {
    n: 9, idea: "Foto del 31 de diciembre", ve: "Se toma la foto de abajo", hace: "siguiente",
    texto: [publicado(TEXTOS_P3[3])], foto: FOTOS[1], fuente: "P:246",
  },
  {
    n: 10, idea: "La película en medio", ve: "El tramo se llena de punta a punta", hace: "siguiente",
    texto: [publicado(TEXTOS_P3[4])], fuente: "P:247, P:239-240",
  },
  {
    n: 11, idea: "Por qué cambian", ve: "Las dos fotos y el tramo, juntos", hace: "repasa",
    texto: [recortado("Las dos fotos son el mismo informe en dos días. Lo de en medio explica por qué la segunda es distinta.", CIERRE_P3)],
    fuente: "P:250 (recortado: tenía 28 palabras)",
  },
  /* 12 a 16: una pregunta por pantalla, con los errores A, B, C1, C2 y D tal cual. */
  ...PREGUNTAS_P3.map((q, k) => ({
    n: 12 + k, idea: `Prueba: pregunta ${k + 1} de ${PREGUNTAS_P3.length}`,
    ve: "La pregunta, las 3 respuestas fijas y la escena de la respuesta", hace: "prueba",
    texto: [publicado(CONSIGNA_P3), publicado(q.texto)], pregunta: q, respuestas: RESPUESTAS_P3, errores: ERROR_P3,
    fuente: "P:252, P:258-276, P:285-291",
  })),
  {
    n: 17, idea: "En una frase", ve: "Las 4 opciones", hace: "frase",
    texto: [publicado(PREGUNTA_P3)],
    opciones: frase(OPCIONES_P3, {
      p3o1: "Por eso uno se llama foto y el otro película. Uno dice cómo está la empresa; el otro, qué pasó.",
      p3o2: "Los dos tienen cifras. Lo que cambia es el tiempo que cubre cada uno.",
      p3o3: "Los ocho pueden leer los dos. Lo que cambia es qué te dice cada uno.",
      p3o4: "Los dos los hace la empresa. El Estado es uno de los que los leen.",
    }),
    fuente: "P:293; devoluciones de P:300-322, sin «Correcto.» ni «No.»",
  },
  {
    n: 18, idea: "Puente", ve: "La foto y la película, con una tercera tarjeta que se enciende", hace: "puente",
    texto: [PREDICE_SE_PASAN], siguiente: ID_P4, esLaPrimeraDe: ID_P4,
    fuente: "Abre la pieza 4 (su pantalla 1)",
  },
];

/* ═══════════════════ cu0-a4 · CÓMO SE ARTICULAN (14 en la tabla) ═══════════════════ */

const A4 = [
  {
    n: 1, idea: "¿Se pasan cifras?", ve: "Tres informes separados", hace: "predice",
    texto: [PREDICE_SE_PASAN],
    opciones: ["Cada uno va por su lado", "Se pasan cifras"].map(nuevo),
    respuesta: nuevo("Se pasan cifras, y todas van hacia el mismo informe. Vas a ver hacia cuál."),
    fuente: "Nuevo, de P:360",
  },
  {
    n: 2, idea: "Flujos de efectivo", ve: "El tercer informe, con la cita", hace: "siguiente",
    texto: [publicado(NOMBRES_P4[0].definicion)], cita: publicado(NOMBRES_P4[0].delLibro), termino: NOMBRES_P4[0].termino,
    fuente: "P:365-366",
  },
  {
    n: 3, idea: "Los tres motivos", ve: "Tres carriles: día a día, cosas grandes, dinero", hace: "siguiente",
    texto: [publicado(NOMBRES_P4[1].definicion)], termino: NOMBRES_P4[1].termino, fuente: "P:370",
  },
  {
    n: 4, idea: "Articulación", ve: "Dos informes y una flecha", hace: "siguiente",
    texto: [publicado(NOMBRES_P4[2].definicion)], termino: NOMBRES_P4[2].termino, fuente: "P:374",
  },
  {
    n: 5, idea: "Los tres, sin flechas", ve: "Los tres informes con sus líneas", hace: "siguiente",
    texto: [publicado(TEXTOS_P4[1]), publicado(SIEMBRA_P4)], informes: INFORMES_P4, fuente: "P:414, P:379, P:382-386",
  },
  {
    n: 6, idea: "Parada", ve: "La utilidad neta resaltada, sin flecha", hace: "parada",
    texto: [nuevo("Lo que vendió y gastó en el año, ¿a qué informe crees que llega?")],
    pista: nuevo("¿Cuál de los tres guarda cómo quedó la empresa?"),
    opciones: [
      opcion("foto", "A la foto", nuevo("Llega a la foto: la utilidad neta del año pasa a la línea de utilidad del ejercicio."), true),
      opcion("plata", "Al de la plata", nuevo("La plata tiene su propio informe. Lo que vendió y gastó llega a la foto y cambia cómo queda.")),
      opcion("ninguno", "A ninguno", nuevo("Sí llega a uno: a la foto. Lo que vendió y gastó cambia cómo queda la empresa.")),
    ],
    flecha: FLECHAS_P4.find((f) => f.id === "f1"), fuente: "Nuevo, de P:415 y T:589-605 (f1)",
  },
  {
    n: 7, idea: "Flecha 1", ve: "f1, de bloque a bloque", hace: "siguiente",
    texto: [publicado(TEXTOS_P4[2])], flechas: ["f1"], fuente: "P:415, P:403",
  },
  {
    n: 8, idea: "Flecha 2: la misma cifra", ve: "f2: la ficha viaja del saldo final al efectivo", hace: "siguiente",
    texto: [publicado(TEXTOS_P4[3])], flechas: ["f2"], fuente: "P:416, P:404",
  },
  {
    n: 9, idea: "Tres flechas más", ve: "f3, f4 y f5 encienden sus extremos sin viajar", hace: "siguiente",
    texto: [publicado(TEXTOS_P4[4])], flechas: ["f3", "f4", "f5"], fuente: "P:417, T:607-609",
  },
  {
    n: 10, idea: "Parada", ve: "Las cinco flechas", hace: "parada",
    texto: [nuevo("¿Sale alguna flecha de la foto?")],
    /* La ficha no da pista para esta parada: con dos opciones, el primer error ya deja solo la buena. */
    pista: null,
    opciones: [
      opcion("si", "Sí", nuevo("Mira la punta de cada flecha. Las cinco terminan en la foto y ninguna arranca en ella.")),
      opcion("no", "No", nuevo("Ninguna sale de ella: la foto recibe. Por eso la del final necesita lo que traen los otros dos."), true),
    ],
    fuente: "Nuevo, de T:604 y P:438",
  },
  {
    n: 11, idea: "La regla", ve: "Las cinco a la vez", hace: "repasa",
    texto: [recortado("Las cinco llegan a la foto. Los otros dos cuentan qué pasó en el año; la foto guarda cómo quedó.", CIERRE_P4)],
    fuente: "P:420 (recortado: tenía 27 palabras)",
  },
  {
    n: 12, idea: "Prueba: repite o explica", ve: "Las cinco flechas; al tocar una, queda sola", hace: "clasifica",
    texto: [nuevo("Toca una flecha. ¿Repite la misma cifra o solo explica una línea de la foto?")],
    opciones: ["Repite la cifra", "Explica una línea"].map(nuevo),
    flechas: FLECHAS_P4, modo: MODO_FLECHA,
    /* La que viaja (MODO_FLECHA.viaja) es la que repite; las demás explican. */
    devolucionRepiteMarcadaExplica: nuevo("Esta sí repite: el saldo final de efectivo es el mismo número que el efectivo de la foto."),
    devolucionExplicaMarcadaRepite: nuevo("Esta no repite ninguna cifra. Solo explica una línea de la foto."),
    fuente: "Nuevo, de P:399-408 (MODO_FLECHA)",
  },
  {
    n: 13, idea: "En una frase", ve: "Las 4 opciones", hace: "frase",
    texto: [publicado(PREGUNTA_P4)],
    opciones: frase(OPCIONES_P4, {
      p4o1: "Por eso ninguna flecha sale de la foto: ella recibe. Los otros dos explican y ella guarda el resultado.",
      p4o2: "Va al revés. La foto del final necesita lo que los otros calculan. La que va primero es la foto del comienzo.",
      p4o3: "Si fuera así no habría ninguna flecha. Y hay cinco, todas llegando al mismo informe.",
      p4o4: "Cada uno dice algo distinto: uno qué tiene, otro qué vendió y gastó, otro por dónde se movió la plata.",
    }),
    fuente: "P:424; devoluciones de P:431-452, sin «Correcto.» ni «No.»",
  },
  {
    n: 14, idea: "Cierre del tema", ve: "Las 4 figuras en miniatura: anillo, torre, fotos y flechas", hace: "puente",
    texto: [nuevo("Ya tienes el mapa: el ciclo, la ecuación y los tres informes. En el tema 2 vas a ver cómo se anota cada hecho.")],
    siguiente: "hacer", fuente: "Nuevo, de I:28, P:43, P:189, P:358 y el tema cuentas-debe-haber",
  },
];

/*
 * El objetivo de cada pieza (el que CuatroCapas pone arriba) no es una
 * pantalla en la ficha. Se deja aquí para que la presentación decida dónde va.
 */
export const OBJETIVOS_T1 = { [ID]: OBJETIVO, [ID_P2]: OBJETIVO_P2, [ID_P3]: OBJETIVO_P3, [ID_P4]: OBJETIVO_P4 };

export const PANTALLAS_T1 = { [ID]: A1, [ID_P2]: A2, [ID_P3]: A3, [ID_P4]: A4 };

/* Las pantallas de una pieza, o una lista vacía si el id no es de T1. */
export const pantallasDe = (id) => PANTALLAS_T1[id] ?? [];

/* Todos los textos que lee el estudiante en una pantalla, con su origen (la cita del libro aparte). */
export function textosDe(p) {
  const de = (o) => (o && typeof o === "object" && "origen" in o ? [o] : []);
  return [
    ...p.texto,
    ...de(p.respuesta), ...de(p.pista),
    ...(p.opciones ?? []).flatMap((o) => ("origen" in o ? [o] : [...de(o.texto), ...de(o.devolucion)])),
    ...de(p.devolucionCorrecta), ...de(p.devolucionOtros),
    ...de(p.devolucionRepiteMarcadaExplica), ...de(p.devolucionExplicaMarcadaRepite),
  ];
}
