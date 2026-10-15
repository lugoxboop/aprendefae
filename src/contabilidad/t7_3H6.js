import { ITEMS_H6 } from "../data/contabilidadT7_3_h6.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · H6 «¿Entra al costo?» — la lógica, sin React.
 *
 *   prepararH6()          las siete cosas en su orden, con sus opciones en el
 *                         orden de la v1 (son las clases mismas: no se barajan)
 *   evaluarH6(ítem, v)    el veredicto y su texto
 *   unidadesH6()          las siete unidades que puntúan
 *   puntuarH6(aciertos)   aciertos / 7 × 100 (evaluativa: el motor escala)
 *   unidadDeH6(id)        el texto de cada unidad, para el panel docente
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const prepararH6 = () => ITEMS_H6.map((it) => ({ ...it, opciones: it.opciones.map((v) => ({ valor: v, texto: v })) }));

export function evaluarH6(item, valor) {
  const ok = valor === item.correcta;
  return { ok, correcta: item.correcta, textos: [ok ? item.acierto : item.error], textoCorrecta: item.correcta };
}

export const unidadesH6 = () => ITEMS_H6.map((it) => it.id);

export const TOTAL_H6 = unidadesH6().length;
export const puntuarH6 = (aciertos, total = TOTAL_H6) => (total ? (aciertos / total) * 100 : 0);

/* Cada cosa, por su texto. */
export function unidadDeH6(id) {
  return ITEMS_H6.find((x) => x.id === String(id))?.pregunta ?? null;
}
