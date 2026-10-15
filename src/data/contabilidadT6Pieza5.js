/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 5 DE APRENDER — «Cómo se calcula la provisión».
 *
 * Célula B. Todo el texto que lee el estudiante vive en ESTE archivo, guardado
 * entero en orquestador/conocimiento/paquetes/b5-t6-aprender5.md. Precedencia
 * (Sakuta, todo con PASA de Shoko): sus decisiones (el pie del término 1 es
 * «Basado en el libro, pp. 200-201»); después, la versión que manda de
 * Futaba. La guía de diseño de Mai todavía no llega: aquí solo hay datos.
 *
 * Pieza por decisión de Mateo: la tabla de la p. 201 no se consiguió, y la
 * fuente externa autorizada es el Decreto 1625 de 2016, art. 1.2.1.18.21
 * (provisión general del 5 %, 10 % y 15 %). Las cifras del ejemplo son un
 * ESCENARIO SIMULADO: ninguna sale de la tabla del libro, y el rótulo fijo
 * de las capas 2 y 3 lo dice.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════ LOS CUATRO TIPOS DE PIE (nunca se mezclan) ═══════════ */

/* 1 · lo que dice el texto del libro: «Basado en el libro, p. N» (o pp.). */
export const PIE_LIBRO = (paginas) => `Basado en el libro, ${paginas}`;
/* 2 · las cifras y las decisiones del ejemplo. */
export const PIE_SIMULADO = "Escenario simulado";
/* 3 · los porcentajes de la norma, aplicados en el ejemplo. */
export const PIE_PORCENTAJE = "Fuente del porcentaje: Decreto 1625 de 2016";
/* 4 · la norma. Con «· Libro, p. 201» solo en la nota del término 4, donde hablan las dos fuentes. */
export const PIE_DECRETO = "Fuente: Decreto 1625 de 2016, art. 1.2.1.18.21";
export const PIE_DECRETO_Y_LIBRO = `${PIE_DECRETO} · Libro, p. 201`;

/* El rótulo fijo en pantalla durante las capas 2 y 3. */
export const ROTULO_SIMULADO_T6_A5 = "Escenario simulado · no es la tabla del libro";

/* ═══════════ LA PIEZA (lo que lee CuatroCapas: título, objetivo y capa 1) ═══════════ */

/*
 * Cada término trae su `pie`. CuatroCapas no pinta pies en la capa 1: cómo
 * se ven lo decide la guía de Mai. La nota del término 4 trae el suyo en
 * `pieDelLibro`.
 */
export const PIEZA_COMO_SE_CALCULA = {
  id: "b5-t6-a5-como-se-calcula-la-provision",
  numero: 5,
  titulo: "Cómo se calcula la provisión",
  objetivo: "Vas a ver cómo se calcula la provisión: se agrupan las deudas según su vencimiento y a cada grupo se le aplica un porcentaje.",
  nombres: [
    {
      termino: "Análisis de vencimiento",
      definicion: "Al cierre, la empresa agrupa lo que le deben sus clientes. Separa las deudas vigentes de las vencidas, y a estas según cuánto tiempo llevan vencidas.",
      /* Sakuta: «pp. 200-201» (Futaba decía «p. 200»). */
      pie: PIE_LIBRO("pp. 200-201"),
      delLibro: "«Lo primero que se deba hacer para realizar el ajuste por cuentas incobrables a diciembre 31 es calcular la probable pérdida de cartera con base en el porcentaje de pérdida establecido por la empresa.» (p. 201)",
    },
    {
      termino: "Un porcentaje por grupo",
      definicion: "A cada grupo se le aplica el porcentaje que la empresa espera perder. Los porcentajes los fija la propia empresa.",
      pie: PIE_LIBRO("p. 201"),
    },
    {
      termino: "La provisión",
      definicion: "Se suman los cálculos de todos los grupos. Ese total es la provisión. Se anota como ya viste: se debita Gasto provisiones – cuentas incobrables y se acredita Provisión para deudas incobrables.",
      pie: PIE_LIBRO("pp. 200-202"),
    },
    {
      termino: "Una referencia colombiana",
      definicion: "En Colombia, la norma del impuesto de renta trae una provisión general con tres porcentajes. Es el 5 % para deudas con más de tres meses de vencidas, sin pasar de seis. Es el 10 % para más de seis meses, sin pasar de un año. Y es el 15 % para más de un año.",
      pie: PIE_DECRETO,
      delLibro: "Esos porcentajes son el máximo que la empresa puede restar como gasto al calcular su impuesto de renta. No son una regla para todas las empresas: cada una fija los suyos.",
      rotuloDelLibro: "Nota",
      pieDelLibro: PIE_DECRETO_Y_LIBRO,
    },
  ],
};

/* ═══════════ EL ESCENARIO SIMULADO, EN NÚMEROS (para que las cuentas se comprueben) ═══════════ */

/* No se pinta: las pruebas lo cruzan con cada cifra de los textos. */
export const ESCENARIO_T6_A5 = {
  total: 1300000,
  grupos: [
    { id: "g1", monto: 460000, porcentaje: 0 },
    { id: "g2", monto: 340000, porcentaje: 5 },
    { id: "g3", monto: 360000, porcentaje: 10 },
    { id: "g4", monto: 140000, porcentaje: 15 },
  ],
  provision: 74000,
  neto: 1226000,
  /* La capa 4: una deuda de $380.000 con ocho meses de vencida. */
  pregunta: { monto: 380000, meses: 8, porcentaje: 10, provision: 38000 },
};

/*
 * EL REGISTRO DE CIFRAS CONSTRUIDAS (Sakuta): cada monto en pesos que la pieza
 * inventa para su escenario, del menor al mayor. Una prueba exige que las
 * cifras de los textos sean exactamente estas, y que ninguna coincida con una
 * cifra del libro que ya está en los datos (lista negra). Futaba las cruza
 * además con el banco de ejercicios (pp. 262-274, Célula E); si alguna cambia,
 * cambia aquí y en los textos. Es el juego de Futaba tras cruzar el capítulo
 * entero (pp. 176-275): el primero chocaba con la p. 201 y con el ejercicio D-3.
 */
export const CIFRAS_CONSTRUIDAS_T6_A5 = [0, 1700, 17000, 19000, 21000, 36000, 38000, 57000, 74000, 140000, 170000, 340000, 360000, 380000, 460000, 1226000, 1300000];

/* ═══════════ CAPA 2 · «MÍRELO FUNCIONAR» ═══════════ */

/*
 * Los rótulos de la escena (Mai §5 y §10): fragmentos literales de los pasos,
 * de las cajas de la capa 3 o del rótulo fijo. Un solo momento, el 31 de
 * diciembre; la tabla del ejemplo con una fila por grupo (los nombres, los de
 * las cajas de la capa 3) y la suma bajo un filete.
 */
export const ESCENA_T6_A5 = {
  fecha: "31 de diciembre",
  deben: "Lo que le deben sus clientes",
  total: "$1.300.000",
  /* Por grupo: lo que suma, la pastilla del porcentaje (el grupo 1 no tiene) y el resultado. */
  grupos: [
    { suma: "$460.000", porcentaje: null, resultado: "no se provisiona nada" },
    { suma: "$340.000", porcentaje: "Al 5 %", resultado: "son $17.000" },
    { suma: "$360.000", porcentaje: "Al 10 %", resultado: "son $36.000" },
    { suma: "$140.000", porcentaje: "Al 15 %", resultado: "son $21.000" },
  ],
  suma: "$74.000",
  gasto: "Gasto provisiones – cuentas incobrables",
  provision: "Provisión para deudas incobrables",
  neto: "El valor neto",
  valorNeto: "$1.226.000",
  debita: "se debita",
  acredita: "se acredita",
};

/* Los 11 pasos y el cierre, cada uno con su pie (Futaba). Lo resaltado, en contabilidad/t6Pieza5.js (Mai §5.3). */
export const PASOS_T6_A5 = [
  { texto: "El 31 de diciembre, una empresa revisa lo que le deben sus clientes: $1.300.000.", pie: PIE_SIMULADO },
  { texto: "Agrupa las deudas según cuánto tiempo llevan vencidas.", pie: PIE_LIBRO("p. 200") },
  { texto: "En este ejemplo, la empresa decide usar como suyos los porcentajes de la norma de renta.", pie: PIE_SIMULADO },
  { texto: "Las que están vigentes o llevan hasta tres meses de vencidas suman $460.000. En este ejemplo, por ellas no se provisiona nada.", pie: PIE_SIMULADO },
  { texto: "Las que llevan más de tres meses, sin pasar de seis, suman $340.000. Al 5 %, son $17.000.", pie: PIE_PORCENTAJE },
  { texto: "Las que llevan más de seis meses, sin pasar de un año, suman $360.000. Al 10 %, son $36.000.", pie: PIE_PORCENTAJE },
  { texto: "Las que llevan más de un año suman $140.000. Al 15 %, son $21.000.", pie: PIE_PORCENTAJE },
  { texto: "Cálculo: $17.000 + $36.000 + $21.000 = $74.000.", pie: PIE_SIMULADO },
  { texto: "Se debita Gasto provisiones – cuentas incobrables por $74.000.", pie: PIE_LIBRO("p. 202") },
  { texto: "Y se acredita Provisión para deudas incobrables, por el mismo valor.", pie: PIE_LIBRO("p. 202") },
  { texto: "Cálculo: $1.300.000 − $74.000 = $1.226.000, el valor neto.", pie: PIE_LIBRO("p. 202") },
];
export const CIERRE_T6_A5 = {
  texto: "Cada grupo con su porcentaje, y la suma de todos es la provisión.",
  pie: PIE_LIBRO("pp. 200-201"),
};

/* ═══════════ CAPA 3 · «AHORA PRUEBE USTED» · los cuatro grupos ═══════════ */

/* Consigna y decisión: entrega 2 de Futaba; la pregunta de la caja es de Mai (hoja 6), para Shoko. */
export const CONSIGNA_CAPA_3_T6_A5 = "Toca cada grupo y decide qué porcentaje le toca. Después, mira cuánto se provisiona.";
export const PREGUNTA_CAPA_3_T6_A5 = "¿Qué porcentaje le toca?";
const NADA = { id: "nada", texto: "Nada" };
const P5 = { id: "5", texto: "5 %" };
const P10 = { id: "10", texto: "10 %" };
const P15 = { id: "15", texto: "15 %" };

/* Cerrada, cada caja muestra su nombre y su monto (el rótulo de Futaba, «nombre · monto»). */
export const GRUPOS_T6_A5 = [
  {
    id: "g1",
    nombre: "Vigentes o hasta 3 meses",
    monto: "$460.000",
    revela: "En este ejemplo, por las deudas vigentes o con hasta tres meses de vencidas no se provisiona nada: $0.",
    pie: PIE_SIMULADO,
    opciones: [NADA, P5, P10],
    correcta: "nada",
    falla: "En este ejemplo, las vigentes y las de hasta tres meses no llevan provisión.",
  },
  {
    id: "g2",
    nombre: "Más de 3 hasta 6 meses",
    monto: "$340.000",
    revela: "Al 5 %, los $340.000 dan $17.000.",
    pie: PIE_PORCENTAJE,
    opciones: [NADA, P5, P10],
    correcta: "5",
    falla: "Más de tres meses, sin pasar de seis: es el 5 %.",
  },
  {
    id: "g3",
    nombre: "Más de 6 meses hasta 1 año",
    monto: "$360.000",
    revela: "Al 10 %, los $360.000 dan $36.000.",
    pie: PIE_PORCENTAJE,
    opciones: [P5, P10, P15],
    correcta: "10",
    falla: "Más de seis meses, sin pasar de un año: es el 10 %.",
  },
  {
    id: "g4",
    nombre: "Más de 1 año",
    monto: "$140.000",
    revela: "Al 15 %, los $140.000 dan $21.000.",
    pie: PIE_PORCENTAJE,
    opciones: [P5, P10, P15],
    correcta: "15",
    falla: "Más de un año: es el 15 %, el más alto.",
  },
];
/* El tablero (Mai §6.1): la cabecera de su columna, la celda de cada grupo y la fila de la suma. */
export const TABLERO_T6_A5 = {
  cabecera: "Se provisiona",
  celdas: ["$0", "$17.000", "$36.000", "$21.000"],
  total: "La provisión",
  suma: "$74.000",
};

export const FINAL_CAPA_3_T6_A5 = {
  texto: "La provisión es la suma de los cuatro grupos: $74.000. Mientras más tiempo lleva vencido un grupo, mayor es su porcentaje en este ejemplo.",
  pie: PIE_SIMULADO,
};

/* ═══════════ CAPA 4 · «EN UNA FRASE» (UnaFrase, sin cambios) ═══════════ */

export const PREGUNTA_FINAL_T6_A5 = "Una deuda de $380.000 lleva ocho meses vencida. Con los porcentajes del ejemplo, ¿cuánto se provisiona por ella?";
/* En el orden de Futaba; UnaFrase las baraja una vez al cargar. */
export const OPCIONES_FINAL_T6_A5 = [
  {
    id: "b5-t6-a5-veinte",
    texto: "$38.000",
    correcta: true,
    feedback: "Correcto. Ocho meses es más de seis y no pasa de un año: le toca el 10 %. El 10 % de $380.000 es $38.000.",
  },
  {
    id: "b5-t6-a5-diez",
    texto: "$19.000",
    correcta: false,
    feedback: "No es esa. Ese sería el 5 %, que es para deudas de más de tres hasta seis meses. Ocho meses ya pasó de seis.",
  },
  {
    id: "b5-t6-a5-treinta",
    texto: "$57.000",
    correcta: false,
    feedback: "No es esa. Ese sería el 15 %, que es para deudas de más de un año. Ocho meses no llega a un año.",
  },
  {
    id: "b5-t6-a5-nada",
    texto: "Nada",
    correcta: false,
    feedback: "No es esa. Una deuda con más de tres meses de vencida sí entra en la provisión del ejemplo.",
  },
];

/* ═══════════ CAPA 2 LARGA: LOS PASOS QUE SE JUNTAN Y LA PARADA (hoja 7 de Mai, entrega 3 de Futaba) ═══════════ */

/* De 11 pasos a 10: se juntan el 9 y el 10 (Libro, p. 202). */
export const FUSION_T6_A5 = {
  grupos: [[1], [2], [3], [4], [5], [6], [7], [8], [9, 10], [11]],
  pies: PASOS_T6_A5.map((p) => p.pie).filter((_, k) => k !== 9).map((pie, k) => (k === 8 ? "Libro, p. 202" : pie)),
};
/* La predicción entre los pasos 4 y 5; resalta la fila del grupo 2, que la pregunta nombra (Mai §2). */
export const PARADA_T6_A5 = {
  antes: 5,
  pregunta: "El grupo de más de tres hasta seis meses suma $340.000. Al 5 %, ¿cuánto da?",
  opciones: [{ id: "bien", texto: "$17.000" }, { id: "diez", texto: "$1.700" }, { id: "cien", texto: "$170.000" }],
  correcta: "bien",
  falla: "Revisa los ceros: el 5 % de $340.000 es $17.000.",
  pie: PIE_PORCENTAJE,
  resaltados: ["g2"],
};
