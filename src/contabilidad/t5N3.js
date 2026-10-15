import { ITEMS_N3 } from "../data/contabilidadT5_n3.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N3 «¿Qué revisión falta?» — la lógica, sin React.
 *
 *   prepararN3()          los cinco casos en su orden, con las cuatro
 *                         acciones del libro en su orden (no se barajan)
 *   evaluarN3(ítem, v)    el veredicto y su texto
 *   unidadesN3()          las cinco unidades que puntúan
 *   puntuarN3(aciertos)   aciertos / 5 × 100 (evaluativa: el motor escala)
 *   unidadDeN3(id)        el texto de cada unidad, para el panel docente
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const prepararN3 = () => ITEMS_N3.map((it) => ({ ...it, opciones: it.opciones.map((v) => ({ valor: v, texto: v })) }));

export function evaluarN3(item, valor) {
  const ok = valor === item.correcta;
  return { ok, correcta: item.correcta, textos: [ok ? item.acierto : item.error], textoCorrecta: item.correcta };
}

export const unidadesN3 = () => ITEMS_N3.map((it) => it.id);

export const TOTAL_N3 = unidadesN3().length;
export const puntuarN3 = (aciertos, total = TOTAL_N3) => (total ? (aciertos / total) * 100 : 0);

/* Cada ítem, por su caso o su pregunta. */
export function unidadDeN3(id) {
  return ITEMS_N3.find((x) => x.id === String(id))?.pregunta ?? null;
}
