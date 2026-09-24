import { DEBE, HABER } from "../data/contabilidad.js";
import { CUADRA_O_NO, balanceDelAsiento } from "../data/contabilidadActividades.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS CINCO FICHAS DE CU-8, Y QUÉ PASA AL SOLTARLAS.
 *
 * El estudiante ya dijo que el asiento no cuadra; ahora tiene que nivelar la
 * balanza, y para eso elige entre cinco valores visibles en vez de teclear
 * una cifra. Lo que cambia no es la respuesta —sigue siendo la diferencia
 * exacta— sino que el error tiene consecuencia física: la balanza se pasa de
 * largo o se queda corta, y eso se ve antes de leer nada.
 *
 * ═══════════ EL REPERTORIO NO SE REPARTE A MANO ═══════════
 *
 * Las cinco de cada ítem se calculan del descuadre real de ese asiento: la
 * correcta, y las cuatro más cercanas del repertorio. Cerca importa: una
 * ficha de 50 junto a un descuadre de 5.000 no es un distractor, es relleno.
 * Y salen las cuatro más cercanas EN VALOR, no cuatro al azar, porque lo que
 * la actividad persigue —confundir la diferencia con el total de un lado—
 * vive justo al lado de la cifra correcta.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const REPERTORIO = CUADRA_O_NO.repertorioDeFichas;
export const CUANTAS_FICHAS = CUADRA_O_NO.fichasPorItem;

/** El lado que pesa menos: el platillo al que hay que echarle algo. */
export const ladoLiviano = (balance) => (balance.debe < balance.haber ? DEBE : HABER);

/**
 * Las cinco fichas de un asiento descuadrado: la correcta y las cuatro del
 * repertorio más cercanas a ella. En orden de valor; quien las dibuja las
 * baraja.
 */
export function fichasDe(asiento, repertorio = REPERTORIO, cuantas = CUANTAS_FICHAS) {
  const { descuadre, cuadra } = balanceDelAsiento(asiento);
  if (cuadra) return [];
  const otras = repertorio
    .filter((v) => v !== descuadre)
    .sort((a, b) => Math.abs(a - descuadre) - Math.abs(b - descuadre) || a - b)
    .slice(0, cuantas - 1);
  return [descuadre, ...otras].sort((a, b) => a - b);
}

/**
 * Qué le pasa a la balanza al soltar una ficha en el platillo liviano.
 *
 *   nivela    la ficha vale exactamente la diferencia
 *   pasa      vale más: la balanza se va al otro lado
 *   corta     vale menos: sigue inclinada para el mismo lado
 */
export function alSoltar(asiento, ficha) {
  const b = balanceDelAsiento(asiento);
  const liviano = ladoLiviano(b);
  const debe = b.debe + (liviano === DEBE ? ficha : 0);
  const haber = b.haber + (liviano === HABER ? ficha : 0);

  let efecto = "nivela";
  if (ficha > b.descuadre) efecto = "pasa";
  else if (ficha < b.descuadre) efecto = "corta";

  return {
    efecto,
    liviano,
    debe,
    haber,
    /* Lo que todavía falta cuando se queda corta. Cero en los otros dos casos. */
    falta: Math.max(0, b.descuadre - ficha),
    nivelada: debe === haber,
  };
}

/*
 * Una comprobación que vale la pena poder hacer sin interfaz: que cada
 * asiento descuadrado del banco reciba su ficha correcta y, cuando el
 * repertorio lo permita, una mayor y una menor — o el estudiante no podría
 * equivocarse en las dos direcciones que la ficha describe.
 */
export const DESCUADRADOS = CUADRA_O_NO.asientos.filter((a) => !balanceDelAsiento(a).cuadra);
