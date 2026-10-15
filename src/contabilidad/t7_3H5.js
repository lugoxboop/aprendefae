import { ITEMS_H5, CASOS_H5 } from "../data/contabilidadT7_3_h5.js";
import { pesos } from "../data/contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · H5 «Ajuste por conteo» — la lógica, sin React.
 *
 *   prepararH5(barajar)    los ocho ítems en su orden; las opciones de cada
 *                          elección (salvo las de los ítems 1 y 4, en el
 *                          orden de la v1) y las líneas de cada asiento, barajadas
 *   evaluarH5(ítem, v)     el veredicto de una elección y su texto
 *   idLineaH5(ítem, l)     el id de una línea en el detalle:
 *                          «ajuste-sobrante:costo»
 *   unidadesH5()           las once unidades que puntúan
 *   puntuarH5(aciertos)    aciertos / 11 × 100 (evaluativa: el motor escala)
 *   unidadDeH5(id)         el texto de cada unidad, para el panel docente
 * ═══════════════════════════════════════════════════════════════════════════
 */

const textoDe = (it, v) => (it.pesos ? pesos(v) : v);
export const opcionesDeH5 = (item) => [item.correcta, ...item.distractores.map((d) => d.valor)];

export const prepararH5 = (barajar) => ITEMS_H5.map((it) => {
  if (it.tipo === "asiento") return { ...it, orden: barajar(it.lineas.map((l) => l.id)) };
  const valores = it.opcionesV1 ?? barajar(opcionesDeH5(it));
  return { ...it, opciones: valores.map((v) => ({ valor: v, texto: textoDe(it, v) })) };
});

export function evaluarH5(item, valor) {
  const ok = valor === item.correcta;
  const texto = ok ? item.acierto : item.distractores.find((d) => d.valor === valor)?.retro ?? null;
  return { ok, correcta: item.correcta, textos: [texto], textoCorrecta: textoDe(item, item.correcta) };
}

export const idLineaH5 = (item, l) => `${item.id}:${l.id}`;

export const unidadesH5 = () => ITEMS_H5.flatMap((it) => (it.tipo === "asiento" ? it.lineas.map((l) => idLineaH5(it, l)) : [it.id]));

export const TOTAL_H5 = unidadesH5().length;
export const puntuarH5 = (aciertos, total = TOTAL_H5) => (total ? (aciertos / total) * 100 : 0);

/* Una elección, por su caso y su pregunta; una línea, por su caso, su cuenta y su valor. */
export function unidadDeH5(id) {
  const [itemId, lineaId] = String(id).split(":");
  const it = ITEMS_H5.find((x) => x.id === itemId);
  if (!it) return null;
  const caso = CASOS_H5[it.caso].encabezado;
  if (!lineaId) return it.tipo === "asiento" ? null : `${caso} · ${it.pregunta}`;
  const l = it.lineas?.find((x) => x.id === lineaId);
  return l ? `${caso} · ${l.cuenta} ${pesos(l.valor)}` : null;
}
