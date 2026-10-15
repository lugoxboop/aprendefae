import { ITEMS_H4, VERSIONES, PERIODICO, PERMANENTE } from "../data/contabilidadT7_2_h4.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · H4 «¿Periódico o permanente?» — la lógica, sin React.
 *
 *   prepararH4(barajar)   los cinco ítems en su orden; en cada uno, qué
 *                         versión va arriba («Versión 1») y cuál abajo,
 *                         barajado en cada intento
 *   evaluarH4(ítem, s)    el veredicto de tocar la versión del sistema s
 *   unidadesH4()          las cinco unidades que puntúan
 *   puntuarH4(aciertos)   aciertos / 5 × 100 (evaluativa: el motor escala)
 *   unidadDeH4(id)        el texto de cada unidad, para el panel docente
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const prepararH4 = (barajar) => ITEMS_H4.map((it) => ({ ...it, orden: barajar([PERIODICO, PERMANENTE]) }));

/* El nombre de la tarjeta donde quedó un sistema: «Versión 1» o «Versión 2». */
export const versionDe = (item, sistema) => VERSIONES[item.orden.indexOf(sistema)];

export function evaluarH4(item, sistema) {
  const ok = sistema === item.sistema;
  return { ok, correcta: item.sistema, textos: [ok ? item.acierto : item.error], textoCorrecta: versionDe(item, item.sistema) };
}

export const unidadesH4 = () => ITEMS_H4.map((it) => it.id);

export const TOTAL_H4 = unidadesH4().length;
export const puntuarH4 = (aciertos, total = TOTAL_H4) => (total ? (aciertos / total) * 100 : 0);

/* Por su subtema y su pregunta: los ítems 3 y 5 hacen la misma pregunta. */
export function unidadDeH4(id) {
  const it = ITEMS_H4.find((x) => x.id === String(id));
  return it ? `${it.subtema} · ${it.pregunta}` : null;
}
