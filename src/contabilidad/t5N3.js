import { ITEMS_N3, EJEMPLO_N3, PISTA_N3 } from "../data/contabilidadT5_n3.js";
import { anunciarRespuesta, sinAsiEs } from "../components/mecanicas/libros/t7/escaleraAyuda.js";
import { barajar } from "../utils/barajar.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N3 «¿Qué revisión falta?» — la lógica, sin React (entrega D v2).
 *
 *   prepararN3(mezclar?)       los cinco casos en el orden fijo de Mello,
 *                              con las cuatro acciones del libro barajadas
 *                              (D8, Mello v4 §1: una vez por partida, con
 *                              utils/barajar.js; el reintento trae otro orden)
 *   evaluarN3(ítem, v, fallos) la escalera (C2): con acierto, el acierto;
 *                              al primer error, la pista común y la línea
 *                              del distractor, y otro intento; al segundo,
 *                              la respuesta con su porqué («La respuesta es
 *                              «…».» y el acierto sin «Así es:», la
 *                              convención de escaleraAyuda.js)
 *   unidadesN3()               las cinco unidades que puntúan
 *   puntuarN3(aciertos)        aciertos al primer intento / 5 × 100
 *                              (evaluativa: el motor escala)
 *   unidadDeN3(id)             el texto de cada unidad, para el panel
 *                              docente; también el del ejemplo, que puntuó
 *                              en las partidas de antes
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const prepararN3 = (mezclar = barajar) => ITEMS_N3.map((it) => ({ ...it, opciones: mezclar(it.opciones.map((v) => ({ valor: v, texto: v }))) }));

/** `fallos`: cuántas veces se ha fallado ya este caso antes de esta respuesta (0 o 1). */
export function evaluarN3(item, valor, fallos = 0) {
  const ok = valor === item.correcta;
  const base = { ok, correcta: item.correcta, textoCorrecta: item.correcta };
  if (ok) return { ...base, cerrado: true, textos: [item.acierto] };
  if (fallos < 1) return { ...base, cerrado: false, textos: [PISTA_N3, item.porQueNo[valor]] };
  return { ...base, cerrado: true, textos: [anunciarRespuesta(item.correcta), sinAsiEs(item.acierto)] };
}

export const unidadesN3 = () => ITEMS_N3.map((it) => it.id);

export const TOTAL_N3 = unidadesN3().length;
export const puntuarN3 = (aciertos, total = TOTAL_N3) => (total ? (aciertos / total) * 100 : 0);

/* Cada ítem, por su caso. */
export function unidadDeN3(id) {
  if (String(id) === EJEMPLO_N3.id) return EJEMPLO_N3.pregunta;
  return ITEMS_N3.find((x) => x.id === String(id))?.pregunta ?? null;
}
