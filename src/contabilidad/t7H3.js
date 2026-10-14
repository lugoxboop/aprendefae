import { ITEMS_H3, METODOS_H3 } from "../data/contabilidadT7_1_h3.js";
import { pesos } from "../data/contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · H3 «¿Cuánto vale lo que sobró?» — la lógica, sin React.
 *
 *   prepararH3(barajar)       los cinco ítems en su orden, con sus opciones
 *                             barajadas en cada intento
 *   evaluarH3(ítem, valor)    el veredicto y su texto: el acierto, o la
 *                             retroalimentación de ese distractor
 *   textoDeOpcionH3(ítem, v)  lo que se lee en el botón: una cifra en pesos
 *                             o el nombre del método (ítem 5)
 *   puntuarH3(aciertos)       aciertos / 5 × 100. Es evaluativa: el motor
 *                             escala los 25 FP con este porcentaje
 *   unidadDeH3(id)            el texto de cada ítem, para el panel docente
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const opcionesDeH3 = (item) => [item.correcta, ...item.distractores.map((d) => d.valor)];

export const prepararH3 = (barajar) => ITEMS_H3.map((it) => ({ ...it, opciones: barajar(opcionesDeH3(it)) }));

export function evaluarH3(item, valor) {
  const ok = valor === item.correcta;
  return { ok, correcta: item.correcta, texto: ok ? item.acierto : item.distractores.find((d) => d.valor === valor)?.retro ?? null };
}

export const textoDeOpcionH3 = (item, v) =>
  (item.opcionesTexto ? METODOS_H3.find((m) => m.valor === v)?.texto ?? String(v) : pesos(v));

export const TOTAL_H3 = ITEMS_H3.length;

export const puntuarH3 = (aciertos, total = TOTAL_H3) => (total ? (aciertos / total) * 100 : 0);

/* Cada ítem se lee por su pregunta, con el método delante cuando la v1 lo trae. */
export function unidadDeH3(id) {
  const it = ITEMS_H3.find((x) => x.id === id);
  if (!it) return null;
  return it.encabezado ? `${it.encabezado}: ${it.pregunta}` : it.pregunta;
}
