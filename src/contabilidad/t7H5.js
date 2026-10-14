import { ITEMS_H5, COSTO_O_GASTO, CUENTAS_H5 } from "../data/contabilidadT7_1_h5.js";
import { pesos } from "../data/contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · H5 «¿Costo o gasto?» — la lógica, sin React.
 *
 *   prepararH5(barajar)   los ocho ítems en su orden, cada uno con sus
 *                         opciones: el par fijo de la parte 1; las de la
 *                         parte 2, barajadas en cada intento
 *   evaluarH5(ítem, v)    el veredicto y los textos: en la parte 1, el porqué
 *                         (o el acierto o el error del ítem 1); en la parte 2,
 *                         el acierto o el texto de ese distractor
 *   puntuarH5(aciertos)   aciertos / 8 × 100 (evaluativa: el motor escala)
 *   unidadDeH5(id)        el texto de cada ítem, para el panel docente
 * ═══════════════════════════════════════════════════════════════════════════
 */

const textoDe = (v) => [...COSTO_O_GASTO, ...CUENTAS_H5].find((o) => o.valor === v)?.texto ?? pesos(v);

export const opcionesDeH5 = (item) => (item.parte === 1
  ? COSTO_O_GASTO.map((o) => o.valor)
  : [item.correcta, ...item.distractores.map((d) => d.valor)]);

export const prepararH5 = (barajar) => ITEMS_H5.map((it) => {
  const valores = it.parte === 1 ? opcionesDeH5(it) : barajar(opcionesDeH5(it));
  return { ...it, opciones: valores.map((v) => ({ valor: v, texto: textoDe(v) })) };
});

export function evaluarH5(item, valor) {
  const ok = valor === item.correcta;
  let texto;
  if (item.porque) texto = item.porque;
  else if (item.parte === 1) texto = ok ? item.acierto : item.error;
  else texto = ok ? item.acierto : item.distractores.find((d) => d.valor === valor)?.retro ?? null;
  return { ok, correcta: item.correcta, textos: [texto], textoCorrecta: textoDe(item.correcta) };
}

export const TOTAL_H5 = ITEMS_H5.length;
export const puntuarH5 = (aciertos, total = TOTAL_H5) => (total ? (aciertos / total) * 100 : 0);

/* Parte 1: el hecho que se clasifica; parte 2: la pregunta del caso. */
export const unidadDeH5 = (id) => {
  const it = ITEMS_H5.find((x) => x.id === id);
  if (!it) return null;
  return it.parte === 1 ? `¿Costo o gasto? ${it.pregunta}` : it.pregunta;
};
