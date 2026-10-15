import { ITEMS_H5, encabezadoDeHecho } from "../data/contabilidadT7_2_h5.js";
import { pesos } from "../data/contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · H5 «Flete y devolución» — la lógica, sin React.
 *
 *   prepararH5(barajar)    los seis ítems en su orden; las opciones de cada
 *                          elección y las líneas del asiento, barajadas
 *   evaluarH5(ítem, v)     el veredicto de una elección y su texto
 *   idLineaH5(ítem, l)     el id de una línea en el detalle:
 *                          «devolucion-de-ventas:inventario»
 *   unidadesH5()           las siete unidades que puntúan
 *   puntuarH5(aciertos)    aciertos / 7 × 100 (evaluativa: el motor escala)
 *   unidadDeH5(id)         el texto de cada unidad, para el panel docente
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const opcionesDeH5 = (item) => [item.correcta, ...item.distractores.map((d) => d.valor)];

/* Las cifras, con su signo de pesos; las cuentas, con su nombre. */
const textoDe = (it, v) => (it.cifra ? pesos(v) : v);

export const prepararH5 = (barajar) => ITEMS_H5.map((it) => (it.tipo === "eleccion"
  ? { ...it, opciones: barajar(opcionesDeH5(it)).map((v) => ({ valor: v, texto: textoDe(it, v) })) }
  : { ...it, orden: barajar(it.lineas.map((l) => l.id)) }));

export function evaluarH5(item, valor) {
  const ok = valor === item.correcta;
  const texto = ok ? item.acierto : item.distractores.find((d) => d.valor === valor)?.retro ?? null;
  return { ok, correcta: item.correcta, textos: [texto], textoCorrecta: textoDe(item, item.correcta) };
}

export const idLineaH5 = (item, l) => `${item.id}:${l.id}`;

export const unidadesH5 = () => ITEMS_H5.flatMap((it) => (it.tipo === "eleccion" ? [it.id] : it.lineas.map((l) => idLineaH5(it, l))));

export const TOTAL_H5 = unidadesH5().length;
export const puntuarH5 = (aciertos, total = TOTAL_H5) => (total ? (aciertos / total) * 100 : 0);

/* Una elección, por su hecho y su pregunta (las de los ítems 1 y 3 se parecen); una línea, por su cuenta y su valor. */
export function unidadDeH5(id) {
  const [itemId, lineaId] = String(id).split(":");
  const it = ITEMS_H5.find((x) => x.id === itemId);
  if (!it) return null;
  if (!lineaId) return it.tipo === "eleccion" ? `${encabezadoDeHecho(it.hecho)} · ${it.pregunta}` : null;
  const l = it.lineas?.find((x) => x.id === lineaId);
  return l ? `${l.cuenta} ${pesos(l.valor)}` : null;
}
