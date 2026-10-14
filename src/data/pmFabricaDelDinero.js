import { DATOS_VERIFICADOS, ROTULO_SIMULADO } from "./politicaMonetaria.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * POLÍTICA MONETARIA · «LA FÁBRICA DEL DINERO» (Célula B; encargo de Erwin).
 *
 *   la-fabrica-del-dinero     pieza de Aprender (cero FP)
 *   crea-o-cambia-de-manos    ¿Crea o Cambia de Manos?   Aplicación · medio   · 25 FP
 *   la-escalera-del-encaje    La Escalera del Encaje     Análisis   · difícil · 50 FP
 *
 * EL TEXTO ES DE FUTABA, CON EL PASA DE SHOKO. Versión que manda: la v2
 * entera, con las líneas de la v3 y de la v4 encima. Literal; lo que no
 * viene de ahí está marcado en su sitio con [KAEDE].
 *
 * Dos reglas de vocabulario que vigila una prueba sobre este archivo entero,
 * comentarios incluidos: nunca el verbo de las imprentas (los pesos nuevos
 * son saldos abonados, no billetes), y la palabra de los saldos de los
 * bancos va siempre como «reserva bancaria»; en plural, solo
 * «reservas internacionales», con su sentido publicado.
 *
 * ═══════════ LAS CIFRAS ═══════════
 *
 * Las únicas reales son las de DATOS_VERIFICADOS. Las del ejemplo de Juan, la
 * exploración y la escalera del juego son un escenario simulado y se pintan
 * con el rótulo «Escenario simulado». Sin signo de porcentaje («guarda 10 de
 * cada 100»): la prueba de la pieza rechaza cualquier «%» fuera del bloque
 * verificado. Ninguna tasa de encaje real de Colombia.
 *
 * ═══════════ «VUELTA» (decisión de Sakuta, v4 de Futaba) ═══════════
 *
 * El depósito inicial es el PUNTO DE PARTIDA y no cuenta como vuelta. Una
 * vuelta es un préstamo que vuelve como depósito. Con Juan: partida 100,
 * vuelta 1 = 190, vuelta 2 = 271, vuelta 3 = 343,9.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export { DATOS_VERIFICADOS, ROTULO_SIMULADO };

/* El marcador de un texto que falta. Hoy no queda ninguno; una prueba lo vigila. */
export const PENDIENTE = "PENDIENTE: Futaba";

/* La frase ancla final (Sakuta). */
export const FRASE_ANCLA = "El Banco crea, los bancos multiplican, el encaje frena.";

/* ═══════════ LA ESCALERA: LA REGLA QUE ENSEÑA LA PIEZA ═══════════ */

/* Sin basura de coma flotante: 271 + 72,9 es 343,9, no 343,90000000000003. */
const exacto = (x) => Math.round(x * 1e6) / 1e6;

/*
 * La escalera vuelta por vuelta. `partida` es el depósito inicial; `encaje`,
 * cuánto guarda cada banco de cada 100. En cada vuelta el banco que recibió
 * el último depósito guarda su parte y presta el resto; lo prestado vuelve
 * como depósito y se suma al total.
 */
export function escaleraDe(partida, encaje, vueltas) {
  const filas = [];
  let deposita = partida;
  let total = partida;
  for (let k = 1; k <= vueltas; k++) {
    const guarda = exacto((deposita * encaje) / 100);
    const presta = exacto(deposita - guarda);
    total = exacto(total + presta);
    filas.push({ vuelta: k, deposita, guarda, presta, total });
    deposita = presta;
  }
  return filas;
}

/* El total al que se acerca la escalera si diera vueltas sin fin. No se pinta: lo deduce el estudiante. */
export const techoDe = (partida, encaje) => (partida * 100) / encaje;

/* ═══════════ LA PIEZA DE APRENDER ═══════════ */

/* Los 14 ids de la escena (decisión de Sakuta). */
export const IDS_ESCENA = [
  "banco-republica", "gobierno", "tes", "dolares", "pesos-nuevos", "banco-privado",
  "juan", "banco-a", "ana", "pedro", "banco-b", "banco-c", "encaje", "escalera",
];

/* El ejemplo de Juan: parte de 100, cada banco guarda 10 de cada 100, tres vueltas. */
export const EJEMPLO_JUAN = { partida: 100, encaje: 10, vueltas: 3 };

export const APRENDER_FABRICA = {
  id: "la-fabrica-del-dinero",
  titulo: "La Fábrica del Dinero",
  nombres: [
    { termino: "Creación primaria", definicion: "el dinero nuevo que crea el Banco de la República cuando compra algo, como TES o dólares, y lo paga con pesos que antes no existían." },
    { termino: "Creación secundaria", definicion: "el dinero que multiplican los bancos cuando prestan la parte de los depósitos que no tienen que guardar como encaje." },
    { termino: "Base monetaria", definicion: "el dinero que emite el Banco de la República: el efectivo en poder del público más la reserva bancaria." },
    { termino: "Agregados monetarios", definicion: "las medidas de cuánto dinero hay en la economía. M1 es el efectivo más las cuentas corrientes. M2 es M1 más los depósitos de ahorro y los certificados de depósito a término (CDT)." },
    { termino: "TES", definicion: "un pagaré del Gobierno: «te debo tanto y te lo devuelvo con intereses». Con los TES, que son Títulos de Tesorería, el Gobierno consigue plata prestada." },
  ],
  pasos: [
    /* 1 · Los dos pisos */
    { resaltar: ["banco-republica", "pesos-nuevos"], texto: "El dinero nace en dos pisos. En el primero, el Banco de la República crea pesos nuevos." },
    { resaltar: ["banco-republica", "tes", "dolares", "pesos-nuevos"], texto: "Los crea cuando compra algo, como TES o dólares, y lo paga con pesos que antes no existían. Los dólares que compra pasan a las reservas internacionales. Esa es la creación primaria." },
    { resaltar: ["pesos-nuevos", "banco-privado"], texto: "Esos pesos nuevos casi nunca son billetes. El Banco los abona en la cuenta del banco que le vendió." },
    { resaltar: ["banco-republica", "tes", "dolares"], texto: "Al revés, cuando el Banco vende TES o dólares, recibe pesos a cambio y los retira. Así el dinero se achica." },
    { resaltar: ["banco-privado"], texto: "En el segundo piso están los bancos. Ellos multiplican el dinero cuando prestan. Esa es la creación secundaria." },
    /* 2 · Juan, vuelta por vuelta (escenario simulado) */
    { resaltar: ["juan", "banco-a", "escalera"], texto: "Escenario simulado: Juan deposita 100 en el Banco A. Es el punto de partida, y el total en depósitos es 100." },
    { resaltar: ["banco-a", "encaje"], texto: "El Banco A guarda 10 de cada 100 como encaje. Guarda 10." },
    { resaltar: ["banco-a", "ana"], texto: "Los otros 90 se los presta a Ana." },
    { resaltar: ["ana", "pedro"], texto: "Ana le paga a Pedro con esos 90." },
    { resaltar: ["pedro", "banco-b", "escalera"], texto: "Pedro deposita los 90 en el Banco B. Un préstamo que vuelve como depósito es una vuelta. Vuelta 1: total en depósitos, 190." },
    { resaltar: ["juan", "banco-a", "pedro", "banco-b"], texto: "Fíjese: Juan sigue teniendo sus 100 en el Banco A, y Pedro ya tiene 90 en el Banco B." },
    { resaltar: ["banco-b", "encaje"], texto: "El Banco B guarda 9 de encaje y presta 81." },
    { resaltar: ["banco-c", "escalera"], texto: "Quien recibe esos 81 los deposita en el Banco C. Vuelta 2: total en depósitos, 271." },
    { resaltar: ["banco-c", "encaje", "escalera"], texto: "El Banco C guarda 8,1 y presta 72,9. Cuando se depositan, en la vuelta 3, el total llega a 343,9." },
    { resaltar: ["escalera"], texto: "Cada vuelta suma menos que la anterior, pero suma. Juan sigue teniendo 100; lo que crece es el total en depósitos." },
    { resaltar: ["juan", "escalera"], texto: "Ojo: los 100 de Juan ya eran dinero. Lo nuevo es lo que se suma encima, préstamo tras préstamo." },
    /* 3 · Qué es un TES */
    { resaltar: ["gobierno", "tes"], texto: "El Gobierno también necesita plata. Para conseguirla, emite TES." },
    { resaltar: ["tes"], texto: "Un TES es un pagaré del Gobierno: «te debo tanto y te lo devuelvo con intereses»." },
    { resaltar: ["banco-privado", "tes"], texto: "Si un banco le compra un TES a otro banco, le paga con plata que ya existía. La plata solo cambia de manos." },
    { resaltar: ["banco-republica", "tes", "gobierno"], texto: "Normalmente, el Banco de la República no le compra los TES al Gobierno cuando los emite. Se los compra a los bancos, en el mercado." },
    { resaltar: ["banco-republica", "tes", "pesos-nuevos", "banco-privado"], texto: "Si el Banco de la República le compra ese TES a un banco, se lo paga con pesos nuevos. Ahí sí se crea dinero." },
    { resaltar: ["banco-privado", "banco-republica"], texto: "Lo que importa es quién compra. Un banco paga con plata que ya existía; el Banco de la República, con pesos nuevos." },
    /* 4 · El encaje como freno */
    { resaltar: ["encaje", "escalera"], texto: "El encaje es el freno. Si el Banco de la República lo sube, cada banco guarda más y presta menos." },
    { resaltar: ["escalera"], texto: "Con menos para prestar, cada vuelta suma menos y la escalera se acorta." },
    { resaltar: ["encaje", "escalera"], texto: "Si lo baja, los bancos guardan menos, prestan más y la escalera se alarga." },
    /* La frase ancla */
    { resaltar: ["banco-republica", "banco-privado", "encaje"], texto: FRASE_ANCLA },
  ],
  pregunta: "Para una política contractiva, el Banco de la República les quita plata a los bancos o frena sus préstamos. Diga dos formas de hacerlo con lo que vio en esta pieza y explique por qué funciona cada una.",
  respuesta: "Podría vender TES o dólares en el mercado. Al venderlos recibe pesos y los retira, así que a los bancos les queda menos para prestar. También podría subir el encaje. Los bancos guardan más, prestan menos y la escalera de depósitos se acorta.",
};

/*
 * Lo que la escena muestra en cada paso (anexo v2 de Mai, §3 y §4): cada cifra
 * aparece en el primer paso que la nombra y se queda; «Anterior» la oculta
 * otra vez. Los pasos van numerados desde 1, como en la entrega de Futaba.
 */
export const CIFRAS_ESCENA = [
  { id: "juan-a", valor: 100, paso: 6 },
  { id: "encaje-a", valor: 10, paso: 7 },
  { id: "a-ana", valor: 90, paso: 8 },
  { id: "ana-pedro", valor: 90, paso: 9 },
  { id: "pedro-b", valor: 90, paso: 10 },
  { id: "encaje-b", valor: 9, paso: 12 },
  { id: "b-c", valor: 81, paso: 12 },
  { id: "encaje-c", valor: 8.1, paso: 14 },
  { id: "c-sale", valor: 72.9, paso: 14 },
];
/* Los peldaños: la partida y las tres vueltas, cada uno desde su paso; «…» desde el 15. */
export const PELDANOS_ESCENA = [
  { id: "partida", paso: 6 },
  { id: "vuelta-1", paso: 10 },
  { id: "vuelta-2", paso: 13 },
  { id: "vuelta-3", paso: 14 },
];
export const PASO_SIGUE = 15;

/* ═══════════ LA CAPA 3 · EXPLORACIÓN DEL ENCAJE ═══════════ */

export const EXPLORA = {
  consigna: "Mueva el encaje y mire cómo se alarga o se acorta la escalera de depósitos.",
  inicial: 10,
  vueltas: 3,
  posiciones: [
    { encaje: 10, texto: "Guarda 10 de cada 100. El primer préstamo es de 90, y tras dos vueltas el total va en 271." },
    { encaje: 20, texto: "Guarda 20 de cada 100. El primer préstamo es de 80, y tras dos vueltas el total va en 244." },
    { encaje: 50, texto: "Guarda 50 de cada 100. El primer préstamo es de 50, y tras dos vueltas el total va en 175." },
  ],
  final: "Mientras más guarda cada banco, menos presta y más corta queda la escalera.",
};

/* ═══════════ JUEGO A · ¿CREA O CAMBIA DE MANOS? ═══════════ */

export const CREA_O_CAMBIA = {
  id: "crea-o-cambia-de-manos",
  nombre: "¿Crea o Cambia de Manos?",
  consigna: "Lea cada hecho y decida si crea dinero, solo lo cambia de manos o lo saca.",
  regla: "Crea dinero: el Banco de la República compra y paga con pesos nuevos, o un banco presta lo que le sobra del encaje. Solo cambia de manos: la plata ya existía y pasa de uno a otro. Saca dinero: el Banco de la República vende y retira los pesos que recibe.",
  cierre: "Fíjese en quién paga y con qué. Si el Banco de la República paga con pesos nuevos, se crea dinero. Si alguien paga con plata que ya existía, solo cambia de manos. Si el Banco recibe pesos al vender, el dinero sale de circulación.",
};

export const PASOS_CREA_O_CAMBIA = [
  "Lea el hecho.",
  "Pregúntese quién paga y con qué plata.",
  "Elija una de las tres opciones: tiene un solo intento por hecho.",
];

export const CREA = "crea";
export const CAMBIA = "cambia";
export const SACA = "saca";

/* Las tres, en este orden fijo y sin color propio (Mai). */
export const OPCIONES_CREA_O_CAMBIA = [
  { id: CREA, nombre: "Crea dinero" },
  { id: CAMBIA, nombre: "Solo cambia de manos" },
  { id: SACA, nombre: "Saca dinero" },
];

/* Los errores por tipo. E1 es el castigado: creer que cuando el Banco vende entra dinero. */
export const ERRORES_CREA_O_CAMBIA = {
  E1: "Vender no mete plata: la saca. Cuando el Banco de la República vende TES o dólares, recibe pesos de quien compra, y esos pesos dejan de circular.",
  E2: "Aquí no aparecen pesos nuevos. Quien paga usa plata que ya existía, así que solo cambia de manos.",
  E3: "Aquí sí aparecen pesos nuevos. El Banco de la República paga con plata que antes no existía, y eso crea dinero.",
  E4: "Cuando un banco presta lo que le sobra del encaje, el depósito que ya tenía sigue ahí. Y aparece uno nuevo. Eso crea dinero.",
  E5: "Aquí el Banco de la República no vende nada, así que no retira pesos.",
  E6: "No solo cambia de manos. Los pesos que el Banco de la República recibe al vender no pasan a nadie: dejan de circular.",
  E7: "Aquí presta una persona, no un banco. Usa plata que ya existía, así que solo cambia de manos.",
};

/* El banco: 11 hechos. `errores` dice qué devolución sale con cada opción equivocada. */
export const HECHOS_CREA_O_CAMBIA = [
  { id: "cm-01", texto: "Una persona le presta a un amigo plata que tenía ahorrada.", respuesta: CAMBIA, acierto: "Solo cambia de manos. Quien presta no es un banco: la plata ya existía y pasa al amigo.", errores: { [CREA]: "E7", [SACA]: "E5" } },
  { id: "cm-02", texto: "El Banco de la República vende dólares y recibe pesos a cambio.", respuesta: SACA, acierto: "Saca dinero. Los pesos que recibe dejan de circular.", errores: { [CREA]: "E1", [CAMBIA]: "E6" } },
  { id: "cm-03", texto: "El Banco de la República vende TES en una Operación de Mercado Abierto.", respuesta: SACA, acierto: "Saca dinero. Vender en una OMA les quita plata a los bancos.", errores: { [CREA]: "E1", [CAMBIA]: "E6" } },
  { id: "cm-04", texto: "El Banco de la República compra dólares y los paga con pesos.", respuesta: CREA, acierto: "Crea dinero. Paga con pesos que antes no existían.", errores: { [CAMBIA]: "E3", [SACA]: "E5" } },
  { id: "cm-05", texto: "El Banco A le presta a Ana lo que le sobró del depósito de Juan después del encaje.", respuesta: CREA, acierto: "Crea dinero. Juan sigue teniendo su depósito, y ahora Ana tiene plata nueva para gastar.", errores: { [CAMBIA]: "E4", [SACA]: "E5" } },
  { id: "cm-06", texto: "Un banco le presta a una empresa parte de lo que le sobra después del encaje.", respuesta: CREA, acierto: "Crea dinero. El depósito que el banco ya tenía sigue ahí. Y aparece uno nuevo: es la creación secundaria.", errores: { [CAMBIA]: "E4", [SACA]: "E5" } },
  { id: "cm-07", texto: "Un banco le compra un TES a otro banco en el mercado.", respuesta: CAMBIA, acierto: "Solo cambia de manos. El banco paga con plata que ya existía, y esa plata pasa al otro banco.", errores: { [CREA]: "E2", [SACA]: "E5" } },
  { id: "cm-08", texto: "Una empresa le compra dólares a otra empresa y le paga con pesos.", respuesta: CAMBIA, acierto: "Solo cambia de manos. Esos pesos ya existían: pasan de una empresa a la otra.", errores: { [CREA]: "E2", [SACA]: "E5" } },
  { id: "cm-09", texto: "Un inversionista le vende a otro un TES en el mercado.", respuesta: CAMBIA, acierto: "Solo cambia de manos. El TES y la plata cambian de dueño, pero no aparece plata nueva.", errores: { [CREA]: "E2", [SACA]: "E5" } },
  { id: "cm-10", texto: "Ana le paga a Pedro con plata que tenía en su cuenta.", respuesta: CAMBIA, acierto: "Solo cambia de manos. La plata pasa de la cuenta de Ana a la de Pedro.", errores: { [CREA]: "E2", [SACA]: "E5" } },
  { id: "cm-11", texto: "Una empresa le paga el sueldo a un trabajador.", respuesta: CAMBIA, acierto: "Solo cambia de manos. La plata ya existía y pasa de la empresa al trabajador.", errores: { [CREA]: "E2", [SACA]: "E5" } },
];

export const tipoDeErrorCreaOCambia = (hecho, elegida) => (elegida === hecho.respuesta ? null : hecho.errores[elegida]);

export function retroCreaOCambia(hecho, elegida) {
  if (elegida === hecho.respuesta) return `✅ ${hecho.acierto}`;
  return `❌ ${ERRORES_CREA_O_CAMBIA[tipoDeErrorCreaOCambia(hecho, elegida)]}`;
}

/* El ejemplo del tutorial, fuera del banco; su acierto es la resolución de Futaba. */
export const EJEMPLO_CREA_O_CAMBIA = {
  id: "ejemplo-crea-o-cambia",
  texto: "El Banco de la República le compra TES a un banco y le paga con pesos nuevos.",
  respuesta: CREA,
  acierto: "Crea dinero, porque el Banco de la República paga con pesos que antes no existían.",
  errores: { [CAMBIA]: "E3", [SACA]: "E5" },
};
/* [KAEDE] El alternativo del tutorial es el ejemplo y su resolución, literales de Futaba. */
export const ALT_TUTORIAL_CREA_O_CAMBIA = `Ejemplo: ${EJEMPLO_CREA_O_CAMBIA.texto} ${EJEMPLO_CREA_O_CAMBIA.acierto}`;

/* ═══════════ JUEGO B · LA ESCALERA DEL ENCAJE ═══════════ */

export const ESCALERA = {
  id: "la-escalera-del-encaje",
  nombre: "La Escalera del Encaje",
  consigna: "Construya la escalera vuelta por vuelta: lo que el banco guarda, lo que presta y el nuevo total en depósitos.",
  regla: "Lo que entra como depósito se parte en dos: lo que el banco guarda de encaje y lo que presta. Lo prestado vuelve a depositarse y se suma al total.",
  cierre: "Con más encaje, cada banco presta menos y la escalera crece más despacio. Con menos encaje, crece más rápido. Por eso el encaje es el freno.",
};

export const PASOS_ESCALERA = [
  "En cada vuelta, elija cuánto guarda el banco, cuánto presta y el nuevo total.",
  "Cada casilla tiene un solo intento. Si se equivoca, verá la razón y el valor correcto para seguir.",
  "Al final, compare dos escaleras y decida qué pasa si el Banco mueve el encaje.",
];

/* El escenario simulado: partida 1.000; la escalera A guarda 20 de cada 100 y la B, 10. */
export const ESCENARIO_ESCALERA = { partida: 1000, encajes: [20, 10], vueltas: 3 };

export const ENUNCIADO_ESCALERA_A = "Un cliente deposita 1.000 en el Banco A. Cada banco guarda 20 de cada 100 como encaje.";
export const TEXTO_ESCALERA_B = "Otra escalera: arranca igual, pero cada banco guarda menos.";
export const PARTIDA_ESCALERA = "Punto de partida: 1.000.";
/* El rótulo de cada escalera. El de la B es de Futaba; [KAEDE] el de la A sigue su misma forma. */
export const rotuloEscalera = (encaje) => `Guarda ${encaje} de cada 100`;

/* Las columnas de la tabla y de cada casilla (los encabezados de Futaba). */
export const CASILLAS = [
  { id: "guarda", nombre: "Guarda" },
  { id: "presta", nombre: "Presta" },
  { id: "total", nombre: "Total" },
];

/*
 * Las 9 casillas de la escalera A, con las dos opciones erradas de Futaba y
 * su tipo. Aquí la correcta va primero; en pantalla se barajan (Shoko: la
 * posición no puede delatarla). Una prueba compara cada correcta con
 * escaleraDe.
 */
const casilla = (vuelta, id, correcta, [e1, t1], [e2, t2]) => ({
  id: `${vuelta}:${id}`, vuelta, casilla: id,
  opciones: [{ valor: correcta, tipo: null }, { valor: e1, tipo: t1 }, { valor: e2, tipo: t2 }],
});
export const CASILLAS_ESCALERA = [
  casilla(1, "guarda", 200, [800, "T1"], [20, "T2"]),
  casilla(1, "presta", 800, [200, "T1"], [980, "T2"]),
  casilla(1, "total", 1800, [800, "T3"], [1200, "T1"]),
  casilla(2, "guarda", 160, [640, "T1"], [200, "T4"]),
  casilla(2, "presta", 640, [160, "T1"], [800, "T4"]),
  casilla(2, "total", 2440, [640, "T3"], [2600, "T4"]),
  casilla(3, "guarda", 128, [512, "T1"], [200, "T4"]),
  casilla(3, "presta", 512, [128, "T1"], [800, "T4"]),
  casilla(3, "total", 2952, [512, "T3"], [3240, "T4"]),
];

/* Las 3 decisiones finales, con sus opciones y el tipo de cada errada. */
export const PREGUNTAS_COMPARA = [
  {
    id: "mas-depositos",
    texto: "Después de tres vueltas, ¿cuál escalera tiene más depósitos?",
    opciones: [
      { id: "guarda-10", nombre: "La que guarda 10 de cada 100", tipo: null },
      { id: "guarda-20", nombre: "La que guarda 20 de cada 100", tipo: "T5" },
      { id: "igual", nombre: "Las dos igual", tipo: "T6" },
    ],
  },
  {
    id: "sube",
    texto: "El Banco de la República sube el encaje. ¿Qué le pasa a la escalera?",
    opciones: [
      { id: "acorta", nombre: "Se acorta", tipo: null },
      { id: "alarga", nombre: "Se alarga", tipo: "T5" },
      { id: "no-cambia", nombre: "No cambia", tipo: "T6" },
    ],
  },
  {
    id: "baja",
    texto: "El Banco de la República baja el encaje. ¿Qué le pasa a la escalera?",
    opciones: [
      { id: "alarga", nombre: "Se alarga", tipo: null },
      { id: "acorta", nombre: "Se acorta", tipo: "T5" },
      { id: "no-cambia", nombre: "No cambia", tipo: "T6" },
    ],
  },
];

export const ERRORES_ESCALERA = {
  T1: "Lo que se guarda y lo que se presta están al revés. El encaje es la parte que se guarda; el resto se presta.",
  T2: "Guardar 20 de cada 100 no es guardar 20. Es guardar 20 por cada 100 que entran.",
  T3: "El total no es solo lo que se prestó. Los depósitos de antes siguen ahí, así que el préstamo se suma a ellos.",
  T4: "Cada vuelta se calcula sobre lo que se acaba de depositar, no sobre el depósito de partida.",
  T5: "Mientras más se guarda, menos se presta. Y con menos préstamos, la escalera crece menos, no más.",
  T6: "El encaje sí cambia la escalera. Cambia cuánto presta cada banco, y eso cambia cuánto se suma en cada vuelta.",
};

/*
 * El tutorial: el ejemplo de la pieza, ya conocido. La primera vuelta de Juan
 * (guarda 10, presta 90, total 190) y, al terminar, el texto de Futaba.
 * [KAEDE] Las dos erradas de cada casilla del ejemplo no vienen de Futaba:
 * son lo guardado y lo prestado al revés, y el depósito de partida; sin tipo,
 * porque el ejemplo nunca se equivoca.
 */
export const EJEMPLO_ESCALERA = {
  partida: 100,
  encajes: [10],
  vueltas: 1,
  casillas: [
    casilla(1, "guarda", 10, [90, null], [100, null]),
    casilla(1, "presta", 90, [10, null], [100, null]),
    casilla(1, "total", 190, [90, null], [100, null]),
  ],
  resolucion: "Juan deposita 100. El banco guarda 10 de cada 100: guarda 10 y presta 90. Esos 90 vuelven como depósito. En la vuelta 1, el total llega a 190.",
};
/* [KAEDE] El alternativo del tutorial es el texto del ejemplo, literal de Futaba. */
export const ALT_TUTORIAL_ESCALERA = `Ejemplo: ${EJEMPLO_ESCALERA.resolucion}`;

/* ═══════════ PARA EL PANEL DOCENTE (lo registra Erwin en etiquetasItem.js) ═══════════ */

export const hechoDeItemCreaOCambia = (id) => HECHOS_CREA_O_CAMBIA.find((h) => h.id === id)?.texto ?? null;
export function casillaDeItemEscalera(id) {
  const [a, b] = String(id).split(":");
  if (a === "compara") return PREGUNTAS_COMPARA.find((p) => p.id === b)?.texto ?? null;
  const c = CASILLAS.find((x) => x.id === b);
  return c && /^\d+$/.test(a) ? `Vuelta ${a} · ${c.nombre}` : null;
}

/* ═══════════ «ASÍ SE JUEGA» (Erwin lo suma al registro de asiSeJuega.js) ═══════════ */

/* El componente antepone «Ejemplo: »; así se lee el alternativo, textual (como asiSeJuegaMonetaria.js). */
const sinPrefijo = (alt) => alt.replace(/^Ejemplo: /, "");

export const ASI_SE_JUEGA_FABRICA = {
  [CREA_O_CAMBIA.id]: {
    actividadId: CREA_O_CAMBIA.id,
    titulo: CREA_O_CAMBIA.nombre,
    consigna: CREA_O_CAMBIA.consigna,
    pasos: PASOS_CREA_O_CAMBIA,
    alt: sinPrefijo(ALT_TUTORIAL_CREA_O_CAMBIA),
    demo: { items: [EJEMPLO_CREA_O_CAMBIA] },
    guion: {
      duracion: 7000,
      toques: [
        { ms: 1500, en: "[data-hecho]", senala: true },
        { ms: 3500, texto: "Crea dinero" },
      ],
    },
    cuadros: { gesto: 1 },
  },
  [ESCALERA.id]: {
    actividadId: ESCALERA.id,
    titulo: ESCALERA.nombre,
    consigna: ESCALERA.consigna,
    pasos: PASOS_ESCALERA,
    alt: sinPrefijo(ALT_TUTORIAL_ESCALERA),
    demo: { items: [EJEMPLO_ESCALERA] },
    /* La primera vuelta de Juan: guarda 10, presta 90, total 190. */
    guion: {
      duracion: 10000,
      toques: [
        { ms: 1500, texto: "10" },
        { ms: 4000, texto: "90" },
        { ms: 6500, texto: "190" },
      ],
    },
    cuadros: { gesto: 1 },
  },
};
