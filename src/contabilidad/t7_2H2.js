import { ITEMS_H2 } from "../data/contabilidadT7_2_h2.js";
import { pesos } from "../data/contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · H2 «Arma los dos asientos» — la lógica, sin React.
 *
 *   prepararH2(barajar)    los cuatro ítems en su orden; las opciones de cada
 *                          cálculo y las líneas de cada asiento, barajadas
 *   evaluarH2(ítem, v)     el veredicto de un cálculo y su texto
 *   idLineaH2(ítem, l)     el id de una línea en el detalle:
 *                          «primer-asiento:clientes»
 *   unidadesH2()           las ocho unidades que puntúan
 *   puntuarH2(aciertos)    aciertos / 8 × 100 (evaluativa: el motor escala)
 *   unidadDeH2(id)         el texto de cada unidad, para el panel docente
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const opcionesDeH2 = (item) => [item.correcta, ...item.distractores.map((d) => d.valor)];

export const prepararH2 = (barajar) => ITEMS_H2.map((it) => (it.tipo === "eleccion"
  ? { ...it, opciones: barajar(opcionesDeH2(it)).map((v) => ({ valor: v, texto: pesos(v) })) }
  : { ...it, orden: barajar(it.lineas.map((l) => l.id)) }));

export function evaluarH2(item, valor) {
  const ok = valor === item.correcta;
  const texto = ok ? item.acierto : item.distractores.find((d) => d.valor === valor)?.retro ?? null;
  return { ok, correcta: item.correcta, textos: [texto], textoCorrecta: pesos(item.correcta) };
}

export const idLineaH2 = (item, l) => `${item.id}:${l.id}`;

export const unidadesH2 = () => ITEMS_H2.flatMap((it) => (it.tipo === "eleccion" ? [it.id] : it.lineas.map((l) => idLineaH2(it, l))));

export const TOTAL_H2 = unidadesH2().length;
export const puntuarH2 = (aciertos, total = TOTAL_H2) => (total ? (aciertos / total) * 100 : 0);

/* Un cálculo, por su pregunta; una línea, por su cuenta y su valor. */
export function unidadDeH2(id) {
  const [itemId, lineaId] = String(id).split(":");
  const it = ITEMS_H2.find((x) => x.id === itemId);
  if (!it) return null;
  if (!lineaId) return it.tipo === "eleccion" ? it.pregunta : null;
  const l = it.lineas?.find((x) => x.id === lineaId);
  return l ? `${l.cuenta} ${pesos(l.valor)}` : null;
}
