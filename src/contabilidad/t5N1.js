import { ITEMS_N1 } from "../data/contabilidadT5_n1.js";
import { barajar as barajarComun } from "../utils/barajar.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N1 «¿Temporal o a largo plazo?» — la lógica, sin React.
 *
 *   prepararN1(barajar)   los nueve ítems en su orden; las opciones de los
 *                         bloques 1 y 2 en el orden de la tanda (son las
 *                         clases mismas), las del bloque 3 barajadas
 *   evaluarN1(ítem, v)    el veredicto y su texto
 *   unidadesN1()          las nueve unidades que puntúan
 *   puntuarN1(aciertos)   aciertos / 9 × 100 (evaluativa: el motor escala)
 *   unidadDeN1(id)        el texto de cada unidad, para el panel docente
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const prepararN1 = (barajar = barajarComun) =>
  ITEMS_N1.map((it) => {
    const opciones = it.opciones.map((v) => ({ valor: v, texto: v }));
    return { ...it, opciones: it.barajar ? barajar(opciones) : opciones };
  });

export function evaluarN1(item, valor) {
  const ok = valor === item.correcta;
  return { ok, correcta: item.correcta, textos: [ok ? item.acierto : item.error], textoCorrecta: item.correcta };
}

export const unidadesN1 = () => ITEMS_N1.map((it) => it.id);

export const TOTAL_N1 = unidadesN1().length;
export const puntuarN1 = (aciertos, total = TOTAL_N1) => (total ? (aciertos / total) * 100 : 0);

/* Cada ítem, por su caso o su pregunta. */
export function unidadDeN1(id) {
  return ITEMS_N1.find((x) => x.id === String(id))?.pregunta ?? null;
}
