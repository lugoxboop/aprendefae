import { ITEMS_N5 } from "../data/contabilidadT5_n5.js";
import { pesos } from "../data/contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N5 «¿Ganó o perdió?» — la lógica, sin React.
 *
 *   prepararN5(barajar)    los siete ítems en su orden; las opciones de cada
 *                          elección y las líneas de cada asiento, barajadas
 *   evaluarN5(ítem, v)     el veredicto de una elección y su texto
 *   idLineaN5(ítem, l)     el id de una línea en el detalle:
 *                          «asiento-con-ganancia:caja»
 *   unidadesN5()           las once unidades que puntúan
 *   puntuarN5(aciertos)    aciertos / 11 × 100 (evaluativa: el motor escala)
 *   unidadDeN5(id)         el texto de cada unidad, para el panel docente
 * ═══════════════════════════════════════════════════════════════════════════
 */

const textoDe = (it, v) => (it.pesos ? pesos(v) : v);
export const opcionesDeN5 = (item) => [item.correcta, ...item.distractores.map((d) => d.valor)];

export const prepararN5 = (barajar) => ITEMS_N5.map((it) => {
  if (it.tipo === "asiento") return { ...it, orden: barajar(it.lineas.map((l) => l.id)) };
  return { ...it, opciones: barajar(opcionesDeN5(it)).map((v) => ({ valor: v, texto: textoDe(it, v) })) };
});

export function evaluarN5(item, valor) {
  const ok = valor === item.correcta;
  const texto = ok ? item.acierto : item.distractores.find((d) => d.valor === valor)?.retro ?? null;
  return { ok, correcta: item.correcta, textos: [texto], textoCorrecta: textoDe(item, item.correcta) };
}

export const idLineaN5 = (item, l) => `${item.id}:${l.id}`;

export const unidadesN5 = () => ITEMS_N5.flatMap((it) => (it.tipo === "asiento" ? it.lineas.map((l) => idLineaN5(it, l)) : [it.id]));

export const TOTAL_N5 = unidadesN5().length;
export const puntuarN5 = (aciertos, total = TOTAL_N5) => (total ? (aciertos / total) * 100 : 0);

/* Una elección, por su pregunta; una línea, por su cuenta y su valor. */
export function unidadDeN5(id) {
  const [itemId, lineaId] = String(id).split(":");
  const it = ITEMS_N5.find((x) => x.id === itemId);
  if (!it) return null;
  if (!lineaId) return it.tipo === "asiento" ? null : it.pregunta;
  const l = it.lineas?.find((x) => x.id === lineaId);
  return l ? `${l.cuenta} ${pesos(l.valor)}` : null;
}
