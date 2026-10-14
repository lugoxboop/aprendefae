import { ITEMS_H6, CUENTAS_H6 } from "../data/contabilidadT7_1_h6.js";
import { pesos } from "../data/contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · H6 «La devolución en dos libros» — la lógica, sin React.
 *
 *   prepararH6(barajar)    los siete ítems en su orden; las opciones de cada
 *                          pregunta y las líneas de cada asiento, barajadas
 *   evaluarH6(ítem, v)     el veredicto de una pregunta y su texto
 *   idLineaH6(ítem, l)     el id de una línea en el detalle: «libro-garza:cxp»
 *   unidadesH6()           las trece unidades que puntúan
 *   puntuarH6(aciertos)    aciertos / 13 × 100 (evaluativa: el motor escala)
 *   unidadDeH6(id)         el texto de cada unidad, para el panel docente
 * ═══════════════════════════════════════════════════════════════════════════
 */

const textoDe = (v) => CUENTAS_H6.find((c) => c.valor === v)?.texto ?? pesos(v);

export const opcionesDeH6 = (item) => [item.correcta, ...item.distractores.map((d) => d.valor)];

export const prepararH6 = (barajar) => ITEMS_H6.map((it) => (it.tipo === "eleccion"
  ? { ...it, opciones: barajar(opcionesDeH6(it)).map((v) => ({ valor: v, texto: textoDe(v) })) }
  : { ...it, orden: barajar(it.lineas.map((l) => l.id)) }));

export function evaluarH6(item, valor) {
  const ok = valor === item.correcta;
  const texto = ok ? item.acierto : item.distractores.find((d) => d.valor === valor)?.retro ?? null;
  return { ok, correcta: item.correcta, textos: [texto], textoCorrecta: textoDe(item.correcta) };
}

export const idLineaH6 = (item, l) => `${item.id}:${l.id}`;

export const unidadesH6 = () => ITEMS_H6.flatMap((it) => (it.tipo === "eleccion" ? [it.id] : it.lineas.map((l) => idLineaH6(it, l))));

export const TOTAL_H6 = unidadesH6().length;
export const puntuarH6 = (aciertos, total = TOTAL_H6) => (total ? (aciertos / total) * 100 : 0);

/* Una pregunta, por su texto; una línea, por su libro, su cuenta y su valor. */
export function unidadDeH6(id) {
  const [itemId, lineaId] = String(id).split(":");
  const it = ITEMS_H6.find((x) => x.id === itemId);
  if (!it) return null;
  if (!lineaId) return it.tipo === "eleccion" ? it.pregunta : null;
  const l = it.lineas?.find((x) => x.id === lineaId);
  return l ? `${it.encabezado}: ${l.cuenta} ${pesos(l.valor)}` : null;
}
