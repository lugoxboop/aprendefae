import { H1_ID, ITEMS_H1, CIFRAS_H1 as C } from "../../data/contabilidadT7_3_h1.js";
import { itemsHacer, valorDe, frente, pesos, pct } from "./t73.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T7-3 H1 «Descuento en la factura» · D9 · objeto: la factura de Guadua.
 * Cada cifra comprobada entra a su renglón; lo que ya se respondió queda
 * puesto; si no es la buena, la figura dice cuánto se aleja (Watari, f73.js,
 * «t73-h1»). La pinta FiguraFacturaGuadua (t7/FigurasC4T7_3.jsx). El asiento
 * sigue como en main («propio»).
 *
 * consecuencia(item, eleccion) → { filas: [{ rot, v, activa? }], falla? | cuadra? }
 *
 * [W] pendiente de Near: el título, los rótulos de los renglones y los textos
 * de consecuencia (Watari, f73.js), tal cual. C4-3 de Mello en `iva`
 * ($328.000): «Ese es el 16 % de la lista, antes del descuento.» (de la
 * auditoría, pendiente de Near).
 * ═══════════════════════════════════════════════════════════════════════════
 */
/* [W] pendiente de Near */
export const TEXTOS_C4_H1 = {
  titulo: "Factura de Guadua",
  lista: "Precio de lista",
  descuento: "− Descuento comercial",
  factura: "= Valor a facturar",
  iva: "+ IVA 16 %",
  retencion: "− Retención 3,5 %",
  cliente: "= Debe el cliente",
  queFactura: "la factura",
  cuadra: "Cuadra.",
  ivaBien: "Es el 16 % de lo facturado.",
  ivaPct: (x) => `Es el ${pct((100 * x) / C.factura)} de lo facturado, y el IVA es 16 %.`,
  /* C4-3 de Mello (auditoria-mello-patron-c4.md), pendiente de Near. */
  ivaDeLaLista: "Ese es el 16 % de la lista, antes del descuento.",
};
const T = TEXTOS_C4_H1;

const textoDe = (it, v) => (it.tipo === "cifra" ? pesos(v) : String(v));
export const ITEMS_C4_H1 = itemsHacer(ITEMS_H1, textoDe);
const CORRECTA = Object.fromEntries(ITEMS_H1.filter((i) => i.tipo === "cifra").map((i) => [i.id, i.correcta]));
const orden = (id) => ITEMS_H1.findIndex((x) => x.id === id);

export function consecuenciaH1(item, eleccion) {
  const x = valorDe(item, eleccion);
  const k = orden(item.id);
  /* Lo de antes, puesto (su cifra buena); lo de este ítem, la tocada; lo de después, en blanco. */
  const val = (id) => (id === item.id ? x : orden(id) < k ? CORRECTA[id] : null);
  const filas = [
    { rot: T.lista, v: C.lista }, { rot: T.descuento, v: C.descuento },
    { rot: T.factura, v: val("valor-a-facturar"), activa: item.id === "valor-a-facturar" && x != null },
    { rot: T.iva, v: val("iva"), activa: item.id === "iva" && x != null },
    { rot: T.retencion, v: C.retencion },
    { rot: T.cliente, v: val("debe-el-cliente"), activa: item.id === "debe-el-cliente" && x != null },
  ];
  const estado = { filas };
  if (x == null) return estado;
  if (item.id === "iva") {
    if (x === C.iva) return { ...estado, cuadra: T.ivaBien };
    return { ...estado, falla: x === (C.lista * 16) / 100 ? T.ivaDeLaLista : T.ivaPct(x) };
  }
  const t = item.id === "valor-a-facturar" ? C.factura : C.cliente;
  return x === t ? { ...estado, cuadra: T.cuadra } : { ...estado, falla: frente(x, t, T.queFactura) };
}

export const CONSECUENCIA_C4 = { id: H1_ID, objeto: "La factura de Guadua", modo: "hacer", items: ITEMS_C4_H1, consecuencia: consecuenciaH1 };
