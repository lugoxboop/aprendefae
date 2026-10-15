import { ITEMS_H2 } from "../data/contabilidadT7_1_h2.js";
import { pesos } from "../data/contabilidad.js";
import { bancoDeLinea, evaluarCifra } from "./armaLaLinea.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · H2 «Arma la factura» — la lógica, sin React.
 *
 *   prepararH2(barajar)       los seis ítems en su orden; los cálculos (casilla
 *                             de cifra), tal cual; en cada asiento, las líneas
 *                             barajadas y cada una con su banco de cuentas (la
 *                             correcta y sus distractores), barajado
 *   evaluarH2(ítem, v)        el veredicto de una casilla de cifra
 *                             (evaluarCifra): el acierto, o la
 *                             retroalimentación del distractor, o la
 *                             respuesta y el porqué
 *   idDeLinea(ítem, l)        el id de una línea en el detalle:
 *                             «asiento-compra:compras»
 *   unidadesH2()              las doce unidades que puntúan: los cuatro
 *                             cálculos y las ocho líneas
 *   puntuarH2(aciertos)       aciertos / 12 × 100. Es evaluativa: el motor
 *                             escala los 25 FP con este porcentaje
 *   unidadDeH2(id)            el texto de cada unidad, para el panel docente
 *
 * LOTE 3 · «Arma la línea» (molde: T7-3 H1, t7_3H1.js).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const prepararH2 = (barajar) => ITEMS_H2.map((it) => {
  if (it.tipo === "cifra") return it;
  /* «Arma la línea»: cada línea con su banco de cuentas, barajado. */
  return { ...it, orden: barajar(it.lineas.map((l) => l.id)), lineas: it.lineas.map((l) => ({ ...l, banco: bancoDeLinea(l, barajar) })) };
});

export const evaluarH2 = (item, valor) => evaluarCifra(item, valor);

export const idDeLinea = (item, linea) => `${item.id}:${linea.id}`;

export const unidadesH2 = () =>
  ITEMS_H2.flatMap((it) => (it.tipo === "asiento" ? it.lineas.map((l) => idDeLinea(it, l)) : [it.id]));

export const TOTAL_H2 = unidadesH2().length;

export const puntuarH2 = (aciertos, total = TOTAL_H2) => (total ? (aciertos / total) * 100 : 0);

/* Un cálculo se lee por su pregunta; una línea, por su cuenta y su valor. */
export function unidadDeH2(id) {
  const [itemId, lineaId] = String(id).split(":");
  const it = ITEMS_H2.find((x) => x.id === itemId);
  if (!it) return null;
  if (!lineaId) return it.tipo === "asiento" ? null : it.pregunta;
  const l = it.lineas?.find((x) => x.id === lineaId);
  return l ? `${l.cuenta} ${pesos(l.valor)}` : null;
}
