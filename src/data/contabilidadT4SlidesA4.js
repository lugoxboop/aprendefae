/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A4 «Bancos y notas del banco» COMO SLIDES (Célula D).
 *
 * Contenido: el hilo de Katsumi (orquestador/revisiones/t4-slides/
 * hilo-katsumi.md): la tabla de A4, el lote 2 (A4 p1, el cálculo del saldo),
 * el texto literal de p2 y p5 y el lote 4 (el porqué del segundo error; A4
 * sin Cierre propio). Lo demás, de los datos aprobados de A4
 * (contabilidadT4A4.js, paquete d4-t4-a4-v4-rediseno.md). Forma:
 * diseno-hanayama.md §3, A4. Los textos van letra por letra.
 *
 * Por lugar, como en A0: titular, antes (la banda de antes), acierto,
 * errores (por opción), porque (C2, lote 4) y, en p5, cierre, siguiente y pie.
 *
 * D8: A4 no lleva cifras nuevas en el caso B (las de p1 son del libro).
 * Cambian los siete movimientos, las seis causas y la conciliación (nota
 * crédito en vez de nota débito). El lote 4 de p5 trae su texto del caso B
 * escrito por Katsumi; los demás porqués no llevan ni cifras del caso ni
 * persona, así que valen igual en los dos casos.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import {
  A4_ID, CAUSAS_A4, CHEQUE_PROVEEDOR, CONSIGNACION, DATOS_A4, FIGURA_A4, PANTALLAS_A4, PIEZA_BANCOS_Y_NOTAS, RENGLONES_EXTRACTO,
} from "./contabilidadT4A4.js";

export { A4_ID, CHEQUE_PROVEEDOR, CONSIGNACION, FIGURA_A4, RENGLONES_EXTRACTO };

/* p1 (lote 2): el saldo que queda y las dos cifras que lo tientan. */
export const SALDO_A4 = CONSIGNACION - CHEQUE_PROVEEDOR;
export const OPCIONES_SALDO_A4 = [
  { id: "queda", texto: "$477.800" },
  { id: "suma", texto: "$1.274.200" },
  { id: "cheque", texto: "$398.200" },
];

const P = Object.fromEntries(PANTALLAS_A4.map((p) => [p.id, p]));
const PB = Object.fromEntries(PIEZA_BANCOS_Y_NOTAS.casoB.pantallas.map((p) => [p.id, p]));

const comun = {
  saldo: {
    titular: PIEZA_BANCOS_Y_NOTAS.objetivo,
    antes: [
      "Bancos es la plata de la empresa en el banco.",
      "Girar un cheque es firmarlo para que el banco pague con esa plata.",
      "Bancos arranca en cero. Consignas $876.000 y giras un cheque de $398.200. ¿Cuánto queda?",
    ],
    correcta: "queda",
    /* El hilo no da texto de acierto para p1: solo la pastilla, y la cuenta anima el asiento. */
    acierto: [],
    errores: {
      suma: "Sumaste el cheque, pero con él la plata sale de la cuenta.",
      cheque: "Ese es el cheque. ¿Cuánto queda de lo consignado?",
    },
    porque: "Quedan $477.800. Consignar $876.000 sube Bancos y girar el cheque de $398.200 la baja.",
  },
  notas: {
    /* Míralo: el texto de Katsumi es una frase de 19 palabras; el titular es la «Idea» de Hanayama. */
    titular: "Las notas del banco restan o suman",
    antes: P["las-notas"].antes,
  },
  mandar: {
    titular: P["sube-o-baja"].antes[0],
    antes: [],
    acierto: [P["sube-o-baja"].fin],
    porque: "Bancos sube con lo que pone plata en la cuenta y baja con lo que la saca.",
  },
  causas: {
    titular: P["seis-causas"].antes[0],
    antes: [],
    acierto: [P["seis-causas"].fin],
    errorEmpresa: P["seis-causas"].errorEmpresa,
    porque: "Lo anota primero quien lo hace: la empresa, sus cheques, depósitos y errores; el banco, sus notas y sus errores.",
  },
  concilia: {
    titular: P["la-conciliacion"].rotuloPregunta,
    antes: [],
    correcta: P["la-conciliacion"].correcta,
    errores: P["la-conciliacion"].errores,
    cierre: P["la-conciliacion"].cierre,
    siguiente: P["la-conciliacion"].siguiente,
    /* Hanayama pide «pp. 186-190»; el pie aprobado y literal es el de los datos (pp. 187-190). */
    pie: P["la-conciliacion"].pie,
    porque: "La nota débito. El banco ya la cobró, pero la empresa se entera cuando llega el extracto.",
  },
};

const casoB = {
  ...comun,
  concilia: {
    ...comun.concilia,
    correcta: PB["la-conciliacion"].correcta,
    errores: PB["la-conciliacion"].errores,
    porque: "La nota crédito. El banco ya la abonó, pero la empresa se entera cuando llega el extracto.",
  },
};

/* Lo que la figura dibuja en cada caso: los movimientos, las causas y los renglones de la conciliación. */
export const FIGURA_SLIDES_A4 = {
  1: DATOS_A4[1],
  2: DATOS_A4[2],
};

export const SLIDES_A4 = { 1: comun, 2: casoB };

/* La libreta que tiene anotada una causa (p4). */
export const libretaDe = (causa) => (causa.emp ? "empresa" : "banco");
export { CAUSAS_A4 };
