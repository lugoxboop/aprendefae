import { ITEMS_H3 } from "../data/contabilidadT7_3_h3.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · H3 «¿Comercial o condicionado?» — la lógica, sin React.
 *
 *   prepararH3()          los siete ítems en su orden, con sus opciones en el
 *                         orden de la v1 (son las clases mismas: no se barajan)
 *   evaluarH3(ítem, v)    el veredicto y su texto
 *   unidadesH3()          las siete unidades que puntúan
 *   puntuarH3(aciertos)   aciertos / 7 × 100 (evaluativa: el motor escala)
 *   unidadDeH3(id)        el texto de cada unidad, para el panel docente
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const prepararH3 = () => ITEMS_H3.map((it) => ({ ...it, opciones: it.opciones.map((v) => ({ valor: v, texto: v })) }));

export function evaluarH3(item, valor) {
  const ok = valor === item.correcta;
  return { ok, correcta: item.correcta, textos: [ok ? item.acierto : item.error], textoCorrecta: item.correcta };
}

export const unidadesH3 = () => ITEMS_H3.map((it) => it.id);

export const TOTAL_H3 = unidadesH3().length;
export const puntuarH3 = (aciertos, total = TOTAL_H3) => (total ? (aciertos / total) * 100 : 0);

/* Cada ítem, por su caso o su pregunta. */
export function unidadDeH3(id) {
  return ITEMS_H3.find((x) => x.id === String(id))?.pregunta ?? null;
}
