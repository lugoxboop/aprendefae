import {
  ID, NOMBRES, OBJETIVO, EL_HECHO, TEXTOS, CIERRE, FACTURA, CUENTA_RESALTADA, ESTACIONES,
  USUARIOS, VACIO_CAPA_3, PREGUNTA_FINAL, OPCIONES,
} from "./contabilidadIntro.js";
import { TRANSACCIONES_CAP2 } from "./contabilidadTema1.js";
import {
  ID_P2, NOMBRES_P2, OBJETIVO_P2, TEXTOS_P2, SIEMBRA_P2, CIERRE_P2, BLOQUES, CASOS_P2, NOTA_CAPA3_P2, PREGUNTA_P2, OPCIONES_P2,
  ID_P3, NOMBRES_P3, OBJETIVO_P3, TEXTOS_P3, SIEMBRA_P3, CIERRE_P3, FOTOS, CONSIGNA_P3, PREGUNTAS_P3, RESPUESTAS_P3, ERROR_P3,
  PREGUNTA_P3, OPCIONES_P3,
  ID_P4, NOMBRES_P4, OBJETIVO_P4, TEXTOS_P4, CIERRE_P4, INFORMES_P4, FLECHAS_P4, MODO_FLECHA, PREGUNTA_P4, OPCIONES_P4,
} from "./contabilidadPiezas234.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 1 · APRENDER — LAS CUATRO PIEZAS COMO PRESENTACIÓN, PANTALLA POR PANTALLA.
 *
 * El orden es el de la ficha de Futaba (orquestador/conocimiento/fichas/
 * b-t1-aprender-secuencia-y-hacer.md, encargo 1, en su versión 16a85b8: con
 * la auditoría de Shoko aplicada y la 2.ª visita, D8), NO el de las capas que pinta
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
 * devolución de esa opción. Una parada cuya correcta no trae devolución en la
 * ficha (a1 · 12) la confirma la pantalla siguiente.
 *
 * `segunda` (en las frases): la 2.ª visita (D8). Mismas opciones, otra
 * pregunta y otra correcta, con una devolución por opción.
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

/*
 * La frase final: las opciones publicadas, con la devolución recortada de
 * Futaba. `textos` cambia el texto de una opción (la auditoría de base de
 * Shoko reescribe la correcta de cada pieza).
 */
const frase = (opciones, devoluciones, textos = {}) => opciones.map((o) => ({
  id: o.id, texto: textos[o.id] ? recortado(textos[o.id], o.texto) : publicado(o.texto), correcta: o.correcta,
  devolucion: recortado(devoluciones[o.id], o.feedback),
}));

/* La 2.ª visita de la frase (D8): otra pregunta, otra correcta, una devolución por opción. */
const segunda = (pregunta, correcta, devoluciones) => ({
  pregunta: nuevo(pregunta), correcta,
  devoluciones: Object.fromEntries(Object.entries(devoluciones).map(([id, t]) => [id, nuevo(t)])),
});

/* ═══════════════════ cu0-a1 · EL RECORRIDO DE UN HECHO (17) ═══════════════════ */

/* Los siete verbos de la cita del término 1, en su orden; «registrar» es el que se marca como «anotar». */
export const VERBOS_DEL_LIBRO = ["identificar", "clasificar", "registrar", "resumir", "interpretar", "analizar", "evaluar"];
export const VERBO_ANOTAR = "registrar";
/* Están en la cita y no son de los siete: no se pueden tocar (Shoko). */
export const VERBOS_NO_TOCABLES = ["ofrecer", "permite"];
/* Regla de Mai para todo el recorrido: cada estación muestra su nombre solo cuando se enciende. */
export const ESTACION_SIN_NOMBRE_HASTA_ENCENDERSE = true;
/* El nombre completo de la empresa va como rótulo de la escena, no en el texto (INFLESZ). */
export const ROTULO_ESCENA_A1 = "Compañía Caleja";

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
    n: 3, idea: "El libro dice siete verbos", ve: "Cita del libro con los 7 verbos tocables y un contador 0/7. «Ofrecer» y «permite» no se pueden tocar", hace: "toca",
    texto: [nuevo("Toca cada cosa que el sistema permite hacer. Son siete. Registrar, que es anotar, es solo una.")],
    cita: publicado(NOMBRES[0].delLibro), verbos: VERBOS_DEL_LIBRO, marcaComoAnotar: VERBO_ANOTAR, noTocables: VERBOS_NO_TOCABLES,
    fuente: "Shoko; I:58 y I:81",
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
    n: 7, idea: "Pasa algo", ve: "Las cinco estaciones apagadas y sin nombre; se prende la 1 con el hecho y con su nombre", hace: "siguiente",
    rotuloEscena: ROTULO_ESCENA_A1,
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
    pista: nuevo("Piensa para qué sirve un papel que prueba lo que pasó."),
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
    n: 12, idea: "Parada: quién decide", ve: "Estación 5 apagada y sin nombre; el informe sobre una mesa vacía", hace: "parada",
    texto: [nuevo("El informe llegó a una mesa. ¿Quién crees que lo usa para decidir qué hace la empresa?")],
    pista: nuevo("¿Quién manda en lo que la empresa hace?"),
    /* Sin «Propietarios» entre las opciones (ficha). La correcta no trae devolución: la confirma la pantalla 13. */
    opciones: [
      opcion("administradores", "Los administradores", null, true),
      opcion("estado", "El Estado", nuevo("El Estado lee el informe para sus cuentas, no para decidir qué hace la empresa.")),
      opcion("clientes", "Los clientes", nuevo("Los clientes lo leen para saber si les conviene comprar, no para manejar la empresa.")),
    ],
    fuente: "Shoko; I:160 e I:196",
  },
  {
    n: 13, idea: "Los jefes deciden", ve: "Se enciende la estación 5 con su nombre: la pregunta en la mesa de Administradores", hace: "siguiente",
    texto: [publicado(TEXTOS[5])], estacion: ESTACIONES[4], fuente: "I:135, I:162",
  },
  {
    n: 14, idea: "El ciclo se cierra", ve: "Las cinco encendidas y la flecha de retorno", hace: "repasa",
    texto: [publicado(CIERRE)], fuente: "I:138",
  },
  {
    n: 15, idea: "Ocho leen lo mismo", ve: "Los ocho usuarios alrededor de un mismo informe, sin los rótulos «interno» y «externo»", hace: "toca",
    texto: [publicado(VACIO_CAPA_3)], usuarios: USUARIOS, fuente: "I:198; pp. 11-12",
  },
  {
    n: 16, idea: "En una frase", ve: "Las 4 opciones, con su escena", hace: "frase",
    texto: [publicado(PREGUNTA_FINAL)],
    opciones: frase(OPCIONES, {
      op1: "Los que deciden son los jefes, y eso cambia lo que la empresa hace. Así nacen hechos nuevos.",
      op2: "Anotar es el punto tres de cinco. Después vienen el informe y la decisión, y sin ellos nadie usaría lo anotado.",
      op3: "El Estado sí pregunta eso, pero es uno de ocho. El mismo informe responde lo que preguntan los ocho.",
      op4: "Los papeles son el punto dos y hacen falta para anotar. Pero guardarlos no es el trabajo: falta lo que viene después.",
    }, { op1: "Convierte en informes lo que pasa en la empresa, para que alguien decida." }),
    segunda: segunda("¿Cuál de estas frases describe solo el punto tres del ciclo?", "op2", {
      op2: "El punto tres es anotar: el papel pasa a los libros. Lo demás del ciclo viene antes o después.",
      op1: "Esa frase recoge el ciclo entero, del hecho hasta la decisión. El punto tres es solo una parte.",
      op3: "Los impuestos son lo que pregunta el Estado al leer el informe. Eso pasa después del punto tres.",
      op4: "Guardar papeles tiene que ver con el punto dos, el del papel. El tres es lo que se hace con él.",
    }),
    fuente: "I:202; devoluciones recortadas de I:214, I:221, I:228 e I:235; op1 de la auditoría de base",
  },
  {
    n: 17, idea: "Puente", ve: "La estación 4 sola, con el balance partido en dos lados", hace: "puente",
    texto: [nuevo("El informe del paso cuatro tiene dos lados. En la siguiente pieza vas a ver por qué siempre dan igual.")],
    siguiente: ID_P2, fuente: "Nuevo, de P:45",
  },
];

/* ═══════════════════ cu0-a2 · LA ECUACIÓN CONTABLE (15) ═══════════════════ */

/* Las tres respuestas de a2 · 12 (una por hecho). */
const CRECEN = "Crecen los dos lados";
const BAJAN_LOS_DOS = "Bajan los dos lados";
const UNO_SUBE = "Un lado sube y el otro baja";

const A2 = [
  {
    n: 1, idea: "¿De dónde salió todo?", ve: "La torre de 3 bloques, sin rótulos", hace: "predice",
    texto: [nuevo("Esta torre es todo lo que tiene una empresa. ¿Quién crees que puso todo esto?")],
    opciones: ["Los dueños", "El banco", "Una parte cada uno"].map(nuevo),
    respuesta: nuevo("Una parte la pusieron otros y el resto, los dueños. Esa respuesta es la mitad de la historia."),
    bloques: BLOQUES, fuente: "Nuevo, de P:95 y P:85-89; «de otros» en vez de «del banco» (auditoría de base)",
  },
  ...NOMBRES_P2.slice(0, 4).map((t, k) => ({
    n: 2 + k, idea: t.termino,
    ve: ["Se rotula la torre entera", "Se marca el tramo «de otros»", "Se marca el tramo de los dueños", "Activo = Pasivo + Patrimonio, armada con los rótulos de 2-4"][k],
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
    n: 8, idea: "Lectura por la derecha", ve: "Rótulos: de otros / de los dueños", hace: "siguiente",
    texto: [recortado("Léela otra vez, por la derecha. Cada tramo dice de dónde salió: un pedazo lo pusieron otros y el resto, los dueños.", TEXTOS_P2[3])],
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
    n: 11, idea: "Parada", ve: "Un bloque nuevo que espera encima de la torre; el tramo nuevo de la derecha va rotulado «del vendedor»", hace: "parada",
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
    n: 12, idea: "Los cuatro casos, prediciendo",
    ve: "Un hecho de Caleja por vez, sin el nombre del caso. Al responder, la torre se mueve y aparece el nombre del caso. La nota sale después de los casos a y c",
    hace: "predice-casos",
    texto: [nuevo("Lee cada hecho. ¿Qué crees que le pasa a la torre?")],
    pista: nuevo("¿Con este hecho entra algo a la empresa, o sale algo?"),
    opciones: [CRECEN, BAJAN_LOS_DOS, UNO_SUBE].map((t) => nuevo(t)),
    /* El orden de la ficha: cal-3 (caso a), cal-5 (b), cal-4 (c) y cal-6 (d). */
    hechos: [["cal-3", "a", CRECEN], ["cal-5", "b", CRECEN], ["cal-4", "c", BAJAN_LOS_DOS], ["cal-6", "d", BAJAN_LOS_DOS]]
      .map(([id, caso, correcta]) => ({ hecho: TRANSACCIONES_CAP2.find((h) => h.id === id), caso: CASOS_P2.find((c) => c.id === caso), correcta })),
    devoluciones: {
      crecenEnVezDeBajan: nuevo("Con este hecho sale algo de la empresa. La torre se encoge, y por los dos lados baja lo mismo."),
      bajanEnVezDeCrecen: nuevo("Con este hecho entra algo a la empresa. La torre crece, y por los dos lados sube lo mismo."),
      unoSube: nuevo("La torre es una sola: si crece o se encoge, se ve igual por los dos lados."),
    },
    nota: publicado(NOTA_CAPA3_P2), notaTrasLosCasos: ["a", "c"],
    alFinal: publicado(TEXTOS_P2[5]),
    fuente: "Nuevo; hechos de src/data/contabilidad.js:249-266 (cal-3 a cal-6, cifras del libro); P:99, P:115-120, P:126; p. 35",
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
    }, { p2o1: "Porque son las mismas cosas contadas dos veces: qué son y de dónde salieron." }),
    segunda: segunda("¿Cuál de estas frases desmienten los cuatro casos del libro?", "p2o2", {
      p2o2: "Es la que más confunde. Los cuatro casos la desmienten: los dos lados suben juntos o bajan juntos.",
      p2o1: "Esa frase es cierta: es la razón por la que dan igual. Aquí se busca la que los casos desmienten.",
      p2o3: "Esa también es falsa, pero los casos no hablan de ella. Habla de cuánto debe la empresa.",
      p2o4: "Esa también es falsa, pero los casos no tratan de ajustes. Muestran cómo se mueven los dos lados.",
    }),
    fuente: "P:128; devoluciones de P:135-157, sin «Correcto.» ni «No.»",
  },
  {
    n: 15, idea: "Puente", ve: "La torre, con un reloj marcando un día", hace: "puente",
    texto: [nuevo("La torre es una foto de un día. En la siguiente pieza vas a ver qué pasa entre dos fotos.")],
    siguiente: ID_P3, fuente: "Nuevo, de P:191 y P:196",
  },
];

/* ═══════════════════ cu0-a3 · LA FOTO Y LA PELÍCULA (18) ═══════════════════ */

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
    texto: [recortado("El estado de situación financiera muestra qué tiene, qué debe y qué es de los dueños, en un día exacto.", NOMBRES_P3[0].definicion)],
    cita: publicado(NOMBRES_P3[0].delLibro), termino: NOMBRES_P3[0].termino,
    fuente: "Shoko; P:196-197",
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
    texto: [recortado("Hay más informes: uno de la plata, otro de los cambios en lo de los dueños, y las notas. El de la plata viene después.", NOMBRES_P3[3].definicion)],
    termino: NOMBRES_P3[3].termino, fuente: "Shoko, recortado a 24 palabras; P:210. «Las notas»: HUECO hasta el #467",
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
    }, { p3o1: "Uno muestra un solo día y el otro, todo un periodo." }),
    segunda: segunda("¿Qué frase se equivoca sobre quién lee los informes?", "p3o3", {
      p3o3: "Los ocho usuarios pueden leer los dos informes. Los de adentro y los de afuera leen la foto y la película.",
      p3o1: "Esa frase es cierta: es la diferencia entre la foto y la película. No habla de quién los lee.",
      p3o2: "Esa frase se equivoca, pero sobre las cifras, no sobre quién lee. Los dos informes tienen cifras.",
      p3o4: "Esa se equivoca sobre quién los hace, no sobre quién los lee. Los dos los hace la empresa.",
    }),
    fuente: "P:293; devoluciones de P:300-322, sin «Correcto.» ni «No.»",
  },
  {
    n: 18, idea: "Puente", ve: "La foto y la película, con una tercera tarjeta que se enciende", hace: "puente",
    texto: [nuevo("Ya tienes la foto y la película. Falta un informe más, y vas a ver cómo se pasan cifras.")], siguiente: ID_P4,
    fuente: "Shoko; la pregunta queda solo en cu0-a4 · 1",
  },
];

/* ═══════════════════ cu0-a4 · CÓMO SE ARTICULAN (13) ═══════════════════ */

const A4 = [
  {
    n: 1, idea: "¿Se pasan cifras?", ve: "Tres informes separados", hace: "predice",
    texto: [nuevo("Ya tienes la foto y la película. ¿Crees que cada informe va por su lado, o se pasan cifras?")],
    opciones: ["Cada uno va por su lado", "Se pasan cifras"].map(nuevo),
    respuesta: nuevo("Se pasan cifras. Vas a ver cuáles y hacia dónde."),
    fuente: "Nuevo, de P:360; respuesta de Shoko",
  },
  {
    n: 2, idea: "Flujos de efectivo", ve: "El tercer informe, con la cita", hace: "siguiente",
    texto: [publicado(NOMBRES_P4[0].definicion)], cita: publicado(NOMBRES_P4[0].delLibro), termino: NOMBRES_P4[0].termino,
    fuente: "P:365-366",
  },
  {
    n: 3, idea: "Los tres motivos", ve: "Tres carriles rotulados «Operación», «Inversión» y «Financiación», cada uno con su idea: día a día, cosas grandes, dinero", hace: "siguiente",
    texto: [publicado(NOMBRES_P4[1].definicion)], termino: NOMBRES_P4[1].termino, fuente: "P:370",
  },
  {
    n: 4, idea: "Articulación", ve: "Dos informes y una flecha", hace: "siguiente",
    texto: [publicado(NOMBRES_P4[2].definicion)], termino: NOMBRES_P4[2].termino, fuente: "P:374",
  },
  {
    n: 5, idea: "Los tres, sin flechas", ve: "Los tres informes con sus líneas", hace: "siguiente",
    texto: [publicado(TEXTOS_P4[1])], informes: INFORMES_P4, fuente: "P:414, P:382-386 (la siembra P:379 sale: regalaba la regla)",
  },
  {
    n: 6, idea: "Parada", ve: "La utilidad neta resaltada, sin flecha", hace: "parada",
    texto: [nuevo("Lo que vendió y gastó en el año, ¿a qué informe crees que llega?")],
    pista: nuevo("¿Cuál de los tres guarda cómo quedó la empresa?"),
    opciones: [
      opcion("foto", "A la foto", nuevo("Llega a la foto: el resultado del año cambia cómo queda la empresa."), true),
      opcion("plata", "Al de la plata", nuevo("La plata tiene su propio informe. Lo que vendió y gastó llega a la foto y cambia cómo queda.")),
      opcion("ninguno", "A ninguno", nuevo("Sí llega a uno: a la foto. Lo que vendió y gastó cambia cómo queda la empresa.")),
    ],
    flecha: FLECHAS_P4.find((f) => f.id === "f1"), fuente: "Nuevo, de P:415 y T:589-605 (f1); acierto de Futaba, Gráfico 2.6 (p. 66; fichas/b-t1-fuente-cap1-futaba.md §7 y §9)",
  },
  {
    n: 7, idea: "Flecha 1", ve: "f1, de bloque a bloque", hace: "siguiente",
    texto: [publicado(TEXTOS_P4[2])], flechas: ["f1"],
    /* Sin la nota «Es la misma cifra con otro nombre»: el Gráfico 2.6 no la dibuja (p. 66; Sakuta, ficha de Futaba §9). */
    fuente: "P:415, P:403; Gráfico 2.6, p. 66",
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
    n: 10, idea: "La regla", ve: "Las cinco a la vez", hace: "repasa",
    texto: [recortado("Las cinco llegan a la foto. Los otros dos cuentan qué pasó en el año; la foto guarda cómo quedó.", CIERRE_P4)],
    fuente: "P:420 (recortado: tenía 27 palabras)",
  },
  {
    n: 11, idea: "Prueba: repite o explica",
    ve: "Las cinco flechas; al tocar una, queda sola",
    hace: "clasifica",
    texto: [nuevo("Toca una flecha. ¿Repite la misma cifra o solo explica una línea de la foto?")],
    opciones: ["Repite la cifra", "Explica una línea"].map(nuevo),
    flechas: FLECHAS_P4, modo: MODO_FLECHA,
    /* f1 se pregunta y explica: va de bloque a bloque en el Gráfico 2.6 (p. 66), como en P:403 (Sakuta, ficha de Futaba §9). */
    seClasifican: ["f1", "f2", "f3", "f4", "f5"],
    /* La que viaja (MODO_FLECHA.viaja) es la que repite; las demás explican. */
    devolucionRepiteMarcadaExplica: nuevo("Esta sí repite: el saldo final de efectivo es el mismo número que el efectivo de la foto."),
    devolucionExplicaMarcadaRepite: nuevo("Esta no repite ninguna cifra. Solo explica una línea de la foto."),
    fuente: "Nuevo, de P:399-408 (MODO_FLECHA); f1, Gráfico 2.6 (p. 66)",
  },
  {
    n: 12, idea: "En una frase", ve: "Las 4 opciones", hace: "frase",
    texto: [publicado(PREGUNTA_P4)],
    opciones: frase(OPCIONES_P4, {
      p4o1: "Por eso ninguna flecha sale de la foto: ella recibe. Los otros dos explican y ella guarda el resultado.",
      p4o2: "Va al revés. La foto del final necesita lo que los otros calculan. La que va primero es la foto del comienzo.",
      p4o3: "Si fuera así no habría ninguna flecha. Y hay cinco, todas llegando al mismo informe.",
      p4o4: "Cada uno dice algo distinto: uno qué tiene, otro qué vendió y gastó, otro por dónde se movió la plata.",
    }),
    segunda: segunda("¿Qué frase pone las flechas al revés?", "p4o2", {
      p4o2: "Esa frase pone la foto como punto de partida. Las flechas hacen lo contrario: todas llegan a la foto.",
      p4o1: "Esa frase es cierta: las flechas van de los otros dos hacia la foto. No están al revés.",
      p4o3: "Esa frase quita las flechas, no las voltea. Si no tuvieran que ver, no habría ninguna flecha.",
      p4o4: "Esa frase no habla de flechas sino de lo que dice cada informe. Y cada uno dice algo distinto.",
    }),
    fuente: "P:424; devoluciones de P:431-452, sin «Correcto.» ni «No.»",
  },
  {
    n: 13, idea: "Cierre del tema", ve: "Las 4 figuras en miniatura: anillo, torre, fotos y flechas", hace: "puente",
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
    ...Object.values(p.devoluciones ?? {}).flatMap(de), ...de(p.nota), ...de(p.alFinal), ...de(p.notaFlecha),
    ...(p.segunda ? [p.segunda.pregunta, ...Object.values(p.segunda.devoluciones)] : []),
  ];
}
