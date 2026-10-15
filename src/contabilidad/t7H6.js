import { ITEMS_H6 } from "../data/contabilidadT7_1_h6.js";
import { pesos } from "../data/contabilidad.js";
import { bancoDeLinea, evaluarCifra } from "./armaLaLinea.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · H6 «La devolución en dos libros» — la lógica, sin React.
 *
 *   prepararH6(barajar)    los cinco ítems en su orden; las opciones de cada
 *                          pregunta, barajadas; la casilla de cifra, tal cual;
 *                          en cada asiento, las líneas barajadas y cada una
 *                          con su banco de cuentas (la correcta y sus
 *                          distractores), barajado
 *   evaluarH6(ítem, v)     el veredicto de una pregunta o de una casilla de
 *                          cifra (evaluarCifra) y su texto
 *   idLineaH6(ítem, l)     el id de una línea en el detalle: «libro-garza:cxp»
 *   unidadesH6()           las once unidades que puntúan
 *   puntuarH6(aciertos)    aciertos / 11 × 100 (evaluativa: el motor escala)
 *   unidadDeH6(id)         el texto de cada unidad, para el panel docente
 *
 * LOTE 3 · «Arma la línea» (molde: T7-3 H1, t7_3H1.js).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const opcionesDeH6 = (item) => [item.correcta, ...item.distractores.map((d) => d.valor)];

export const prepararH6 = (barajar) => ITEMS_H6.map((it) => {
  if (it.tipo === "eleccion") return { ...it, opciones: barajar(opcionesDeH6(it)).map((v) => ({ valor: v, texto: pesos(v) })) };
  if (it.tipo === "cifra") return it;
  /* «Arma la línea»: cada línea con su banco de cuentas, barajado. */
  return { ...it, orden: barajar(it.lineas.map((l) => l.id)), lineas: it.lineas.map((l) => ({ ...l, banco: bancoDeLinea(l, barajar) })) };
});

export function evaluarH6(item, valor) {
  if (item.tipo === "cifra") return evaluarCifra(item, valor);
  const ok = valor === item.correcta;
  const texto = ok ? item.acierto : item.distractores.find((d) => d.valor === valor)?.retro ?? null;
  return { ok, correcta: item.correcta, textos: [texto], textoCorrecta: pesos(item.correcta) };
}

export const idLineaH6 = (item, l) => `${item.id}:${l.id}`;

export const unidadesH6 = () => ITEMS_H6.flatMap((it) => (it.tipo === "asiento" ? it.lineas.map((l) => idLineaH6(it, l)) : [it.id]));

export const TOTAL_H6 = unidadesH6().length;
export const puntuarH6 = (aciertos, total = TOTAL_H6) => (total ? (aciertos / total) * 100 : 0);

/* Una pregunta, por su texto; una línea, por su libro, su cuenta y su valor. */
export function unidadDeH6(id) {
  const [itemId, lineaId] = String(id).split(":");
  const it = ITEMS_H6.find((x) => x.id === itemId);
  if (!it) return null;
  if (!lineaId) return it.tipo === "asiento" ? null : it.pregunta;
  const l = it.lineas?.find((x) => x.id === lineaId);
  return l ? `${it.encabezado}: ${l.cuenta} ${pesos(l.valor)}` : null;
}
