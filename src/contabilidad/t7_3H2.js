import { ITEMS_H2, PESOS, FACTOR } from "../data/contabilidadT7_3_h2.js";
import { pesos } from "../data/contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · H2 «La cadena de descuentos» — la lógica, sin React.
 *
 *   prepararH2(barajar)   los cinco ítems en su orden; las opciones, barajadas
 *   evaluarH2(ítem, v)    el veredicto y su texto
 *   textoDeValor(ítem, v) «$2.475.000», «0,8208» o «17,92 %»
 *   unidadesH2()          las cinco unidades que puntúan
 *   puntuarH2(aciertos)   aciertos / 5 × 100 (evaluativa: el motor escala)
 *   unidadDeH2(id)        el texto de cada unidad, para el panel docente
 * ═══════════════════════════════════════════════════════════════════════════
 */

const decimal = (v) => String(v).replace(".", ",");

export function textoDeValor(item, v) {
  if (item.formato === PESOS) return pesos(v);
  if (item.formato === FACTOR) return decimal(v);
  return `${decimal(v)} %`;
}

export const opcionesDeH2 = (item) => [item.correcta, ...item.distractores.map((d) => d.valor)];

export const prepararH2 = (barajar) => ITEMS_H2.map((it) => ({
  ...it, opciones: barajar(opcionesDeH2(it)).map((v) => ({ valor: v, texto: textoDeValor(it, v) })),
}));

export function evaluarH2(item, valor) {
  const ok = valor === item.correcta;
  const texto = ok ? item.acierto : item.distractores.find((d) => d.valor === valor)?.retro ?? null;
  return { ok, correcta: item.correcta, textos: [texto], textoCorrecta: textoDeValor(item, item.correcta) };
}

export const unidadesH2 = () => ITEMS_H2.map((it) => it.id);

export const TOTAL_H2 = unidadesH2().length;
export const puntuarH2 = (aciertos, total = TOTAL_H2) => (total ? (aciertos / total) * 100 : 0);

/* Cada ítem, por su pregunta. */
export function unidadDeH2(id) {
  return ITEMS_H2.find((x) => x.id === String(id))?.pregunta ?? null;
}
