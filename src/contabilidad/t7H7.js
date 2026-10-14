import { CASOS_H7, CONTROLES_H7, CORRECTO_H7 } from "../data/contabilidadT7_1_h7.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · H7 «¿Qué control falta?» — la lógica, sin React.
 *
 *   prepararH7(barajar)   los seis casos en orden aleatorio, cada uno con sus
 *                         tres opciones barajadas
 *   evaluarH7(caso, v)    el veredicto y lo que se lee: con acierto,
 *                         «Correcto.» y la línea del libro; con error, la
 *                         línea del libro (la buena se enseña en la opción)
 *   puntuarH7(aciertos)   aciertos / 6 × 100. Exploratoria: el motor paga los
 *                         10 FP al terminar; el porcentaje es para el docente
 *   unidadDeH7(id)        el texto de cada caso, para el panel docente
 * ═══════════════════════════════════════════════════════════════════════════
 */

const textoDe = (v) => CONTROLES_H7.find((c) => c.valor === v)?.texto ?? null;

export const opcionesDeH7 = (caso) => [caso.correcta, ...caso.distractores];

export const prepararH7 = (barajar) =>
  barajar(CASOS_H7).map((c) => ({ ...c, opciones: barajar(opcionesDeH7(c)).map((v) => ({ valor: v, texto: textoDe(v) })) }));

export function evaluarH7(caso, valor) {
  const ok = valor === caso.correcta;
  return { ok, correcta: caso.correcta, textos: ok ? [CORRECTO_H7, caso.porque] : [caso.porque], textoCorrecta: textoDe(caso.correcta) };
}

export const TOTAL_H7 = CASOS_H7.length;
export const puntuarH7 = (aciertos, total = TOTAL_H7) => (total ? (aciertos / total) * 100 : 0);

export const unidadDeH7 = (id) => CASOS_H7.find((c) => c.id === id)?.texto ?? null;
