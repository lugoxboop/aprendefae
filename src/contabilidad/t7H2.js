import { ITEMS_H2, CIFRAS_H2, DONDE_H2 } from "../data/contabilidadT7_1_h2.js";
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

/*
 * ═══════════ LA FACTURA QUE SE ARMA (Patrón de enganche C2) ═══════════
 *
 *   devolucionH2(ítem, v)     el mensaje de una casilla en el dialecto de
 *                             Hacer: el acierto de Near; si la cifra es la de
 *                             un distractor, su retroalimentación; si no, el
 *                             porqué (el acierto sin «Así es:»). La cifra
 *                             buena no va en el texto: va en «Iba aquí: $…»
 *                             sobre el renglón. Califica igual que evaluarH2.
 *   renglonH2(fac, r, estado) lo que muestra un renglón de la factura: la
 *                             mercancía siempre; lo resuelto, con la cifra
 *                             buena (no hay arrastre); lo que se escribe
 *                             ahora; o nada («—»).
 *
 * Fa-1 de Mello: el IVA y la retención de la venta no se preguntan, pero el
 * ítem 5 pide calcularlos para sacar el total. Se ven «—» hasta que se
 * responde el ítem 5 («debe-cliente»).
 */
export const LIBERA_VENTA_H2 = "debe-cliente";

const porqueDeAcierto = (acierto) => {
  const sin = String(acierto ?? "").replace(/^(Así es|Exacto)[.:]\s*/, "");
  return sin.charAt(0).toUpperCase() + sin.slice(1);
};

export function devolucionH2(item, valor) {
  const ok = valor === item.correcta;
  if (ok) return { ok, correcta: item.correcta, texto: item.acierto };
  const d = (item.distractores ?? []).find((x) => x.valor === valor);
  return { ok, correcta: item.correcta, texto: d ? d.retro : porqueDeAcierto(item.acierto) };
}

const CIFRA_FIJA = {
  compra: { mercancia: CIFRAS_H2.compra, iva: CIFRAS_H2.ivaCompra, ret: CIFRAS_H2.retencionCompra, total: CIFRAS_H2.debeProveedor },
  venta: { mercancia: CIFRAS_H2.venta, iva: CIFRAS_H2.ivaVenta, ret: CIFRAS_H2.retencionVenta, total: CIFRAS_H2.debeCliente },
};

/* La casilla que vive en un renglón: el cálculo que lo pregunta, si hay uno. */
export const itemDeRenglon = (fac, renglon) =>
  ITEMS_H2.find((x) => x.tipo === "cifra" && DONDE_H2[x.id].factura === fac && DONDE_H2[x.id].renglon === renglon) ?? null;

/**
 * `resuelto(id)`: ¿ese cálculo ya se respondió? `actual`: el id del ítem en
 * pantalla. `escrito`: lo que hay en su casilla. Devuelve { v, item, activo }:
 * `v` es la cifra que se ve (o null: «—»).
 */
export function renglonH2(fac, renglon, { resuelto, actual, escrito = null }) {
  if (renglon === "mercancia") return { v: CIFRA_FIJA[fac].mercancia, item: null, activo: false };
  const it = itemDeRenglon(fac, renglon);
  if (!it) return { v: resuelto(LIBERA_VENTA_H2) ? CIFRA_FIJA[fac][renglon] : null, item: null, activo: false };
  if (resuelto(it.id)) return { v: it.correcta, item: it, activo: false };
  if (actual === it.id) return { v: escrito, item: it, activo: true };
  return { v: null, item: it, activo: false };
}
