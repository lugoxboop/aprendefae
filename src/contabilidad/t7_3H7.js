import { ITEMS_H7, CASOS_H7 } from "../data/contabilidadT7_3_h7.js";
import { pesos } from "../data/contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · H7 «¿Costo o valor neto realizable?» — la lógica, sin React.
 *
 *   prepararH7(barajar)    los seis ítems en su orden, con sus cifras barajadas
 *   evaluarH7(ítem, v)     el veredicto y su texto
 *   unidadesH7()           las seis unidades que puntúan
 *   puntuarH7(aciertos)    aciertos / 6 × 100 (evaluativa: el motor escala)
 *   unidadDeH7(id)         el texto de cada unidad, para el panel docente
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const opcionesDeH7 = (item) => [item.correcta, ...item.distractores.map((d) => d.valor)];

export const prepararH7 = (barajar) => ITEMS_H7.map((it) => ({
  ...it, opciones: barajar(opcionesDeH7(it)).map((v) => ({ valor: v, texto: pesos(v) })),
}));

export function evaluarH7(item, valor) {
  const ok = valor === item.correcta;
  const texto = ok ? item.acierto : item.distractores.find((d) => d.valor === valor)?.retro ?? null;
  return { ok, correcta: item.correcta, textos: [texto], textoCorrecta: pesos(item.correcta) };
}

export const unidadesH7 = () => ITEMS_H7.map((it) => it.id);

export const TOTAL_H7 = unidadesH7().length;
export const puntuarH7 = (aciertos, total = TOTAL_H7) => (total ? (aciertos / total) * 100 : 0);

/* Cada pregunta, por su caso (la pregunta se repite entre casos). */
export function unidadDeH7(id) {
  const it = ITEMS_H7.find((x) => x.id === String(id));
  return it ? `${CASOS_H7[it.caso].encabezado} · ${it.pregunta}` : null;
}
