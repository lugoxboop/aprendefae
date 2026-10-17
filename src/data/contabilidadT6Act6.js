import { PIE_SIMULADO, PIE_PORCENTAJE, ROTULO_SIMULADO_T6_A5 } from "./contabilidadT6Pieza5.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · HACER 6 — «Provisión por edades» (Célula B, b5-t6-a6).
 *
 * Todo el texto que lee el estudiante vive en ESTE archivo, guardado entero
 * en orquestador/conocimiento/paquetes/b5-t6-act6.md: la versión de Futaba,
 * con las líneas que cambiaron tras la auditoría de Shoko (sección 2).
 * Las cifras de legibilidad entre paréntesis no se copian.
 *
 * Casillas en orden (b5/CasillasEnOrden.jsx), en dos partes: ubicar tres
 * deudas en su grupo y calcular. Es un ESCENARIO SIMULADO con los porcentajes
 * del Decreto 1625 de 2016 (5, 10 y 15 %): el rótulo fijo, los pies de fuente
 * en su forma y las cifras de T6 · A5 (sus constantes, las mismas palabras).
 * Las cifras correctas son construidas: un registro las lista y una prueba
 * las cruza contra el libro y contra T6 · A5 (Sakuta).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const T6_ACT6 = {
  id: "b5-t6-a6",
  nombre: "Provisión por edades",
  /* Decisión de Sakuta: difícil, 50 FP. */
  dificultad: "dificil",
  fpBase: 50,
  /* Lote 6c (encabezado compacto, objetivo del kit en una oración). PARA SHOKO: texto nuevo. */
  objetivo: "Calcular la provisión de una cartera según cuánto tiempo lleva vencida cada deuda.",
  consigna: "Ubica cada deuda en su grupo y calcula la provisión.",
  rotulo: ROTULO_SIMULADO_T6_A5,
  nota: "En este ejemplo, la empresa usa como suyos los porcentajes de la norma de renta.",
  /* El tutorial, ya resuelto, como punto de partida. */
  partida: "Una deuda lleva nueve meses vencida: va en el grupo de más de seis meses hasta un año, al 10 %.",
  cierre: "Primero se ubica cada deuda en su grupo por los meses que lleva vencida. Después, cada grupo con su porcentaje, y la suma es la provisión.",
};

/* Los pies de fuente (Futaba): los porcentajes, de la norma; las cifras y la decisión, del escenario. Los de la regla van por fila (GRUPOS_T6_ACT6). */
export const PIES_T6_ACT6 = { regla: PIE_PORCENTAJE, nota: PIE_SIMULADO, datos: PIE_SIMULADO };

/* Las tres líneas de «¿Cómo se juega?». */
export const REGLAS_T6_ACT6 = [
  "Primero, ubica cada deuda en su grupo según los meses que lleva vencida.",
  "Después, calcula la provisión de cada grupo, el total y el valor neto.",
  "Cada casilla tiene un solo intento. Si te equivocas, verás la razón y el valor correcto.",
];

/* ═══════════ LA REGLA FIJA: LOS CUATRO GRUPOS Y SU PORCENTAJE ═══════════ */

/*
 * Auditoría de Shoko: el 0 % no es del Decreto. La fila 1 dice «no se
 * provisiona, en este ejemplo» y lleva el pie del escenario; las filas 2 a 4,
 * el de la norma. Cada fila trae su pie.
 */
export const GRUPOS_T6_ACT6 = [
  { id: "g1", nombre: "Vigentes o hasta 3 meses", porcentaje: "no se provisiona, en este ejemplo", pie: PIE_SIMULADO },
  { id: "g2", nombre: "Más de 3 hasta 6 meses", porcentaje: "5 %", pie: PIE_PORCENTAJE },
  { id: "g3", nombre: "Más de 6 meses hasta 1 año", porcentaje: "10 %", pie: PIE_PORCENTAJE },
  { id: "g4", nombre: "Más de 1 año", porcentaje: "15 %", pie: PIE_PORCENTAJE },
];

/* ═══════════ EL ESCENARIO SIMULADO, EN NÚMEROS ═══════════ */

export const ESCENARIO_T6_ACT6 = {
  total: 1400000,
  grupos: [
    { id: "g1", monto: 620000, porcentaje: 0 },
    { id: "g2", monto: 560000, porcentaje: 5 },
    { id: "g3", monto: 160000, porcentaje: 10 },
    { id: "g4", monto: 60000, porcentaje: 15 },
  ],
  provision: 53000,
  neto: 1347000,
};

/*
 * EL REGISTRO DE CIFRAS CONSTRUIDAS (Sakuta): las correctas, del menor al
 * mayor. Ninguna puede coincidir con una cifra del libro, del ejercicio D-3
 * (p. 269), de la tabla de la p. 201 ni de T6 · A5 (lista negra, en la prueba).
 */
export const CIFRAS_CONSTRUIDAS_T6_ACT6 = [9000, 16000, 28000, 53000, 60000, 160000, 560000, 620000, 1347000, 1400000];
/* Los distractores (opciones erradas). Cinco están en el libro como cifras sueltas de otros temas (Futaba). */
export const DISTRACTORES_T6_ACT6 = [900, 2800, 6000, 8000, 24000, 44000, 56000, 84000, 1453000];
export const DISTRACTORES_EN_EL_LIBRO_T6_ACT6 = [2800, 8000, 24000, 6000, 84000];

/* ═══════════ LAS DOS PARTES ═══════════ */

/* Parte 1: las opciones son los cuatro grupos de la regla, en su orden. */
/* Entrega 1 de Futaba (calidad): el G0 va uno por pareja de casilla y opción, «G0-{casilla}-{grupo}». */
const ubicar = (casilla, correcto, cerca, tipoCerca) => GRUPOS_T6_ACT6.map((g) => ({
  texto: g.nombre,
  tipo: g.id === correcto ? null : g.id === cerca ? tipoCerca : `G0-${casilla}-${g.id}`,
}));
const op = (valor, tipo = null) => ({ valor, tipo });

/* `acierto` (lote 6d-textos, Futaba): el texto que sale debajo de «Correcto» al acertar la casilla. */
export const PARTES_T6_ACT6 = [
  {
    id: "ubicar",
    casillas: [
      { id: "u1", enunciado: "Una deuda lleva 2 meses vencida.", acierto: "Dos meses no pasan de tres: es del primer grupo, que en este ejemplo no se provisiona.", opciones: ubicar("u1", "g1", "g2", "G1") },
      /* El caso límite: «sin exceder de 6 meses», así que seis meses justos van al 5 % (la frontera de T6 · A5). */
      { id: "u2", enunciado: "Una deuda lleva exactamente 6 meses vencida.", acierto: "Seis meses justos no pasan de seis: la deuda va en el grupo del 5 %.", opciones: ubicar("u2", "g2", "g3", "G2") },
      { id: "u3", enunciado: "Una deuda lleva 14 meses vencida.", acierto: "Catorce meses pasan de un año: es del grupo del 15 %.", opciones: ubicar("u3", "g4", "g3", "G3") },
    ],
  },
  {
    id: "calcular",
    datos: {
      filas: [
        { nombre: "Lo que deben los clientes al 31 de diciembre", valor: "$1.400.000", total: true },
        { nombre: "Vigentes o hasta 3 meses", valor: "$620.000" },
        { nombre: "Más de 3 hasta 6 meses", valor: "$560.000" },
        { nombre: "Más de 6 meses hasta 1 año", valor: "$160.000" },
        { nombre: "Más de 1 año", valor: "$60.000" },
      ],
    },
    casillas: [
      { id: "p4", enunciado: "¿Cuánta provisión lleva el grupo de más de tres hasta seis meses?", acierto: "El 5 % de $560.000 es $28.000.", opciones: [op(28000), op(56000, "P1"), op(2800, "P2")] },
      { id: "p5", enunciado: "¿Cuánta provisión lleva el grupo de más de seis meses hasta un año?", acierto: "El 10 % de $160.000 es $16.000.", opciones: [op(16000), op(8000, "P1"), op(24000, "P1")] },
      { id: "p6", enunciado: "¿Cuánta provisión lleva el grupo de más de un año?", acierto: "El 15 % de $60.000 es $9.000.", opciones: [op(9000), op(6000, "P1"), op(900, "P2")] },
      { id: "p7", enunciado: "¿Cuál es el total de la provisión?", acierto: "Los tres grupos que llevan provisión suman $53.000.", opciones: [op(53000), op(44000, "P7"), op(84000, "P4")] },
      { id: "p8", enunciado: "¿Cuál es el valor neto de lo que deben los clientes?", acierto: "A $1.400.000 se le resta la provisión de $53.000: quedan $1.347.000.", opciones: [op(1347000), op(1400000, "P5"), op(1453000, "P6")] },
    ],
  },
];

/*
 * Los rótulos de la barra del total (hoja 2 de Mai, calidad). Salen de los
 * enunciados de las casillas 7 y 8. PARA SHOKO: son nuevos en pantalla.
 */
export const ROTULOS_TOTAL_T6_ACT6 = { neto: "El valor neto", provision: "La provisión" };

/* ═══════════ LOS ERRORES POR TIPO ═══════════ */

export const ERRORES_T6_ACT6 = {
  G1: "Dos meses no pasan de tres: va con las vigentes y las de hasta tres meses.",
  G2: "El grupo del 5 % llega hasta seis meses, sin pasar de seis. Seis meses justos todavía caben ahí.",
  G3: "Catorce meses ya pasan de un año: va en el grupo de más de un año.",
  /* El G0 por casilla y opción: nombra el rango elegido (entrega 1 de Futaba). */
  "G0-u1-g3": "Ese grupo es para deudas de más de seis meses hasta un año. Esta lleva 2 meses vencida.",
  "G0-u1-g4": "Ese grupo es para deudas de más de un año. Esta lleva 2 meses vencida.",
  "G0-u2-g1": "Ese grupo es para deudas vigentes o de hasta tres meses. Esta lleva 6 meses vencida.",
  "G0-u2-g4": "Ese grupo es para deudas de más de un año. Esta lleva 6 meses vencida.",
  "G0-u3-g1": "Ese grupo es para deudas vigentes o de hasta tres meses. Esta lleva 14 meses vencida.",
  "G0-u3-g2": "Ese grupo es para deudas de más de tres hasta seis meses. Esta lleva 14 meses vencida.",
  P1: "Ese es el porcentaje de otro grupo. Mira el rango del grupo y usa su porcentaje.",
  P2: "Ese valor tiene un cero de más o de menos. Repite la multiplicación.",
  /* «En este ejemplo»: no provisionar ese grupo es una decisión del escenario, no de la norma. */
  P4: "Las vigentes y las de hasta tres meses no llevan provisión en este ejemplo. Suma solo los otros tres grupos.",
  P5: "Falta restar la provisión: el valor neto es lo que deben los clientes menos la provisión.",
  P6: "La provisión no se suma: se resta.",
  /* Auditoría de Shoko: sustituye a P3 en la casilla 7 ($44.000 = 28.000 + 16.000). */
  P7: "Te falta un grupo. Suma la provisión de los tres grupos que sí la llevan.",
};

/*
 * ═══════════ D8 · LA SEGUNDA VUELTA (Futaba, lote 18) ═══════════
 *
 * Las mismas dos partes con otras deudas y otra cartera, construidas (escenario simulado). Los ids llevan
 * «-v2» para que el registro de cada casilla no se mezcle con el de hoy; los errores de la parte 2 son los
 * de hoy, y los de la parte 1, los de Futaba (Gc1 a Gc3 y el G0 con la plantilla de hoy).
 */
export const ESCENARIO_V2_T6_ACT6 = {
  total: 2040000,
  grupos: [
    { id: "g1", monto: 1092000, porcentaje: 0 },
    { id: "g2", monto: 568000, porcentaje: 5 },
    { id: "g3", monto: 136000, porcentaje: 10 },
    { id: "g4", monto: 244000, porcentaje: 15 },
  ],
  provision: 78600,
  neto: 1961400,
};

const ubicarV2 = (casilla, correcto, cerca, tipoCerca) => GRUPOS_T6_ACT6.map((g) => ({
  texto: g.nombre,
  tipo: g.id === correcto ? null : g.id === cerca ? tipoCerca : `G0-${casilla}-${g.id}`,
}));

export const PARTES_V2_T6_ACT6 = [
  {
    id: "ubicar",
    casillas: [
      { id: "u1-v2", enunciado: "Una deuda lleva exactamente 3 meses vencida.", acierto: "Tres meses justos no pasan de tres: es del primer grupo, que en este ejemplo no se provisiona.", opciones: ubicarV2("u1-v2", "g1", "g2", "Gc1") },
      { id: "u2-v2", enunciado: "Una deuda lleva exactamente 12 meses vencida.", acierto: "Doce meses justos no pasan de un año: siguen en el grupo del 10 %.", opciones: ubicarV2("u2-v2", "g3", "g4", "Gc2") },
      { id: "u3-v2", enunciado: "Una deuda lleva 25 meses vencida.", acierto: "Veinticinco meses pasan de un año: es del grupo del 15 %.", opciones: ubicarV2("u3-v2", "g4", "g3", "Gc3") },
    ],
  },
  {
    id: "calcular",
    datos: {
      filas: [
        { nombre: "Lo que deben los clientes al 31 de diciembre", valor: "$2.040.000", total: true },
        { nombre: "Vigentes o hasta 3 meses", valor: "$1.092.000" },
        { nombre: "Más de 3 hasta 6 meses", valor: "$568.000" },
        { nombre: "Más de 6 meses hasta 1 año", valor: "$136.000" },
        { nombre: "Más de 1 año", valor: "$244.000" },
      ],
    },
    casillas: [
      { id: "p4-v2", enunciado: "¿Cuánta provisión lleva el grupo de más de tres hasta seis meses?", acierto: "El 5 % de $568.000 es $28.400.", opciones: [op(28400), op(56800, "P1"), op(2840, "P2")] },
      { id: "p5-v2", enunciado: "¿Cuánta provisión lleva el grupo de más de seis meses hasta un año?", acierto: "El 10 % de $136.000 es $13.600.", opciones: [op(13600), op(6800, "P1"), op(20400, "P1")] },
      { id: "p6-v2", enunciado: "¿Cuánta provisión lleva el grupo de más de un año?", acierto: "El 15 % de $244.000 es $36.600.", opciones: [op(36600), op(24400, "P1"), op(3660, "P2")] },
      { id: "p7-v2", enunciado: "¿Cuál es el total de la provisión?", acierto: "Los tres grupos que llevan provisión suman $78.600.", opciones: [op(78600), op(42000, "P7"), op(133200, "P4")] },
      { id: "p8-v2", enunciado: "¿Cuál es el valor neto de lo que deben los clientes?", acierto: "A $2.040.000 se le resta la provisión de $78.600: quedan $1.961.400.", opciones: [op(1961400), op(2040000, "P5"), op(2118600, "P6")] },
    ],
  },
];

/* Los rangos de la plantilla del G0 de hoy («Ese grupo es para deudas de [rango]. Esta lleva N meses vencida.»). */
const RANGO_G0 = { g1: "vigentes o de hasta tres meses", g2: "de más de tres hasta seis meses", g3: "de más de seis meses hasta un año", g4: "de más de un año" };
const g0 = (casilla, grupo, meses) => [`G0-${casilla}-${grupo}`, `Ese grupo es para deudas ${RANGO_G0[grupo]}. Esta lleva ${meses} meses vencida.`];

export const ERRORES_V2_T6_ACT6 = {
  ...Object.fromEntries(Object.entries(ERRORES_T6_ACT6).filter(([k]) => k.startsWith("P"))),
  Gc1: "Tres meses justos no pasan de tres: todavía caben con las vigentes y las de hasta tres meses.",
  Gc2: "El grupo del 10 % llega hasta un año, sin pasar de él. Doce meses justos todavía caben ahí.",
  Gc3: "Veinticinco meses ya pasan de un año: va en el grupo de más de un año.",
  ...Object.fromEntries([
    g0("u1-v2", "g3", 3), g0("u1-v2", "g4", 3),
    g0("u2-v2", "g1", 12), g0("u2-v2", "g2", 12),
    g0("u3-v2", "g1", 25), g0("u3-v2", "g2", 25),
  ]),
};

export const ALT_T6_ACT6 = "Actividad de casillas. Primero ubicas tres deudas en su grupo según los meses que llevan vencidas. Después calculas la provisión de tres grupos, el total y el valor neto. Tienes un intento por casilla; si fallas, se muestra la razón y el valor correcto.";
