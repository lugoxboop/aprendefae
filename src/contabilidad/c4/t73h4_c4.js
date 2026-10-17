import { H4_ID, ITEMS_H4, CIFRAS_H4 as C } from "../../data/contabilidadT7_3_h4.js";
import { itemsHacer, valorDe, frente, pesos, pct } from "./t73.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T7-3 H4 «Pagó a tiempo» · D9 · objeto: el calendario del pago. El mes
 * de octubre de Totumo y Bambú, con la venta (3), los plazos 10/10 y 4/20 y
 * el pago del 23: el descuento tocado cae en el día del pago; la cifra
 * comprobada se lee debajo, con lo que implica (Watari, f73.js, «t73-h4»).
 * La pinta FiguraCalendarioPago (t7/FigurasC4T7_3.jsx). Los asientos siguen
 * como en main («propio»).
 *
 * consecuencia(item, eleccion) → { pago: rótulo del día 23 | null, tuya: cifra | null, falla? | cuadra? }
 *   C4-2 de Mello: «Tu cifra» solo en los ítems de cifra (nunca «$NaN»).
 *
 * [W] pendiente de Near: el título, la línea de los plazos, «Tu cifra» y los
 * textos de consecuencia (Watari), tal cual.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* [W] pendiente de Near */
export const TEXTOS_C4_H4 = {
  titulo: "Octubre · Totumo y Bambú",
  linea: "3 oct venta · 10/10 hasta el 13 · 4/20 hasta el 23 · n/30",
  tuCifra: "Tu cifra:",
  tocaBien: "El 23 cae en el plazo del 4/20.",
  tocaNinguno: "Así pagar el 23 no da descuento.",
  tocaPrimero: "Así el 23 llevaría el descuento del primer plazo.",
  queFacturado: "la lista menos el 8 %",
  descuentoBien: "Es el 4 % de lo facturado.",
  descuentoMal: (x) => `Es el ${pct((100 * x) / C.factura)} de lo facturado, y le toca el 4 %.`,
  quePago: "la deuda menos el descuento",
  cierreBien: "Queda en cero.",
  cuadra: "Cuadra.",
  cierreMal: "Así el saldo de $78.200 crecería al doble en lugar de quedar en cero.",
};
const T = TEXTOS_C4_H4;

export const ITEMS_C4_H4 = itemsHacer(ITEMS_H4, (it, v) => (it.tipo === "cifra" ? pesos(v) : String(v)));
/* Los días del mes y el plazo en que cae cada uno (venta el 3; 10/10 hasta el 13; 4/20 hasta el 23). */
export const zonaH4 = (d) => (d >= 3 && d <= 13 ? "z1" : d > 13 && d <= 23 ? "z2" : d > 23 ? "z3" : "");

export function consecuenciaH4(item, eleccion) {
  const x = valorDe(item, eleccion);
  const cifra = item.tipo === "cifra";
  const estado = { pago: item.id === "que-le-toca" && x ? x.t : null, ...(cifra ? { tuya: x } : {}) };
  if (x == null) return estado;
  if (item.id === "que-le-toca") return x.correcta ? { ...estado, cuadra: T.tocaBien } : { ...estado, falla: x.t === "Ninguno" ? T.tocaNinguno : T.tocaPrimero };
  if (item.id === "el-cierre") return x.correcta ? { ...estado, cuadra: T.cierreBien } : { ...estado, falla: T.cierreMal };
  if (item.id === "el-descuento") return x === C.condicionado ? { ...estado, cuadra: T.descuentoBien } : { ...estado, falla: T.descuentoMal(x) };
  const t = item.id === "lo-facturado" ? C.factura : C.pago;
  return x === t ? { ...estado, cuadra: T.cuadra } : { ...estado, falla: frente(x, t, item.id === "lo-facturado" ? T.queFacturado : T.quePago) };
}

export const CONSECUENCIA_C4 = { id: H4_ID, objeto: "El calendario del pago", modo: "hacer", items: ITEMS_C4_H4, consecuencia: consecuenciaH4 };
