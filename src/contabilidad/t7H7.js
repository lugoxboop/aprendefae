import { CASOS_H7, CONTROLES_H7, CORRECTO_H7 } from "../data/contabilidadT7_1_h7.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · H7 «¿Qué control falta?» — la lógica, sin React (entrega D v2).
 *
 *   prepararH7(barajar)        los seis casos en orden aleatorio, cada uno
 *                              con las siete opciones fijas, en su orden
 *   evaluarH7(caso, v, fallos) la escalera (C2): con acierto, «Correcto.» y
 *                              el «porque»; al primer error, la línea del
 *                              distractor y otro intento; al segundo, esa
 *                              línea y el «porque», y el caso se cierra
 *   puntuarH7(aciertos)        aciertos al primer intento / 6 × 100.
 *                              Exploratoria: el motor paga los 10 FP al
 *                              terminar; el porcentaje es para el docente
 *   unidadDeH7(id)             el texto de cada caso, para el panel docente
 * ═══════════════════════════════════════════════════════════════════════════
 */

const textoDe = (v) => CONTROLES_H7.find((c) => c.valor === v)?.texto ?? null;

export const OPCIONES_H7 = CONTROLES_H7.map((c) => ({ valor: c.valor, texto: c.texto }));

export const prepararH7 = (barajar) => barajar(CASOS_H7).map((c) => ({ ...c, opciones: OPCIONES_H7 }));

/** `fallos`: cuántas veces se ha fallado ya este caso antes de esta respuesta (0 o 1). */
export function evaluarH7(caso, valor, fallos = 0) {
  const ok = valor === caso.correcta;
  const base = { ok, correcta: caso.correcta, textoCorrecta: textoDe(caso.correcta) };
  if (ok) return { ...base, cerrado: true, textos: [CORRECTO_H7, caso.porque] };
  if (fallos < 1) return { ...base, cerrado: false, textos: [caso.porQueNo[valor]] };
  return { ...base, cerrado: true, textos: [caso.porQueNo[valor], caso.porque] };
}

export const TOTAL_H7 = CASOS_H7.length;
export const puntuarH7 = (aciertos, total = TOTAL_H7) => (total ? (aciertos / total) * 100 : 0);

export const unidadDeH7 = (id) => CASOS_H7.find((c) => c.id === id)?.texto ?? null;
