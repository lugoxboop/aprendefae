import { PIEZA_EL_DESCUENTO_CONDICIONADO as P, H3_LIBRO } from "../../data/contabilidadT7_3_a3.js";
import { itemsAprender, numDe, pesos } from "./t73.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T7-3 A3 «El descuento condicionado» · D4 · objeto: la línea de los
 * plazos. El día de pago se marca en los plazos con lo que la opción tocada
 * le daría; el descuento cae en el libro o en la factura; el 15 % se calcula
 * sobre la base tocada (Watari, f73.js).
 *
 * consecuencia(item, eleccion) → según el ítem:
 *   plazos     { dia, pago, toca?, falla? | cuadra? }        (condiciones, cual-le-toca: sin marca al llegar)
 *   zonas      { factura: [chip], libro: [chip], falla? | cuadra? }   (que-es)
 *   renglones  { titulo, filas, falla? | cuadra? }            (sobre-que)
 *
 * [W] pendiente de Near: títulos, rótulos y textos de consecuencia.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const C = H3_LIBRO;

/* [W] pendiente de Near */
export const W_A3 = {
  dia: (d) => `Día ${d}`,
  diaCon: (d, t) => `Día ${d} · ${t}`,
  sinDescuento: "sin descuento",
  diaBien: (d, t) => `El día ${d} lleva ${t}.`,
  elTotal: "el total, sin descuento",
  diaNinguno: (d) => `Así pagar el día ${d} no da descuento.`,
  diaDa: (d, t) => `Así el día ${d} da ${t}.`,
  soloFactura: "Solo en la factura",
  enLibro: "En el libro",
  comercial5: "Comercial 5 %",
  condicionado: "Condicionado",
  queEsBien: "El comercial ya quedó restado en la factura.",
  queEsComercial: "Así el libro registraría una rebaja que la factura ya restó, y no la que depende del pago.",
  queEsLosDos: "Así el 5 % comercial se restaría dos veces.",
  quinceTit: "El 15 % del pago a tiempo",
  valorFacturar: "Valor a facturar",
  iva: "IVA 16 %",
  quinceDe: (b) => `15 %${b ? ` de ${pesos(b)}` : ""}`,
  sobreBien: "Va sobre lo facturado, sin el IVA.",
  sobreIva: "Así el descuento incluiría el IVA.",
  sobreLista: "Así el 15 % cae también sobre el 5 % que ya se rebajó.",
};
const W = W_A3;

/*
 * `cual-le-toca` NO marca el día 10 (el prototipo lo marcaba desde que llega
 * la pantalla): contar los diez días es la pregunta, y Mello ya pidió que la
 * franja no adelante el pago (auditoria-mello-t7-3-cual-le-toca.md). La
 * opción tocada marca el plazo en que habría caído el pago, en su mitad.
 * [ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION: «Así cae en
 * el 5/20.» y «Así cae después del día 20.» (las fallas de Watari, «Así el
 * día 10 da 5 %.», decían el día). Cortas a propósito: con la devolución de
 * Near, el 2.º error ya pasa de 60 palabras (B2). Para Near y Mello.
 */
export const CUAL_LE_TOCA_A3 = {
  tramo: { quince: 5, cinco: 15, ninguno: 25 },
  cinco: "Así cae en el 5/20.",
  ninguno: "Así cae después del día 20.",
};
function cualLeToca(item, e) {
  const o = item.opciones.find((x) => x.id === e);
  if (!o) return { dia: null };
  const estado = { dia: CUAL_LE_TOCA_A3.tramo[o.id], pago: o.t === "Ninguno" ? W.sinDescuento : o.t, toca: true };
  return o.correcta ? { ...estado, cuadra: W.diaBien(10, o.t) } : { ...estado, falla: CUAL_LE_TOCA_A3[o.id] };
}

function plazos(item, e) {
  if (item.id === "cual-le-toca") return cualLeToca(item, e);
  const o = item.opciones.find((x) => x.id === e);
  const dia = 30;
  if (!o) return { dia, pago: W.dia(dia) };
  const ninguno = o.t === "Ninguno";
  const estado = { dia, pago: W.diaCon(dia, ninguno ? W.sinDescuento : o.t), toca: true };
  if (o.correcta) return { ...estado, cuadra: W.diaBien(dia, ninguno ? W.elTotal : o.t) };
  return { ...estado, falla: ninguno ? W.diaNinguno(dia) : W.diaDa(dia, o.t) };
}

function queEs(e) {
  const enLibro = (c) => e === "los-dos" || e === c;
  const chips = [["comercial", W.comercial5], ["condicionado", W.condicionado]];
  const estado = { factura: chips.filter(([c]) => !enLibro(c)).map(([, t]) => t), libro: chips.filter(([c]) => enLibro(c)).map(([, t]) => t) };
  if (!e) return estado;
  if (e === "condicionado") return { ...estado, toca: true, cuadra: W.queEsBien };
  return { ...estado, toca: true, falla: e === "comercial" ? W.queEsComercial : W.queEsLosDos };
}

function sobreQue(item, e) {
  const o = item.opciones.find((x) => x.id === e);
  const b = o ? numDe(o.t) : null;
  const estado = {
    titulo: W.quinceTit,
    filas: [{ rot: W.valorFacturar, v: C.factura }, { rot: W.iva, v: C.iva }, { rot: W.quinceDe(b), v: b ? Math.round(b * 0.15) : null, toca: Boolean(b) }],
  };
  if (!b) return estado;
  if (o.correcta) return { ...estado, cuadra: W.sobreBien };
  return { ...estado, falla: b > 4_300_000 ? W.sobreIva : W.sobreLista };
}

export const CONSECUENCIA_C4 = {
  id: P.id,
  objeto: "La línea de los plazos",
  modo: "aprender",
  /* D8 (Mello, v4 §1): el motor baraja las opciones una vez al montar, con utils/barajar.js. */
  barajar: true,
  items: itemsAprender(P.pantallas),
  consecuencia(item, eleccion) {
    if (item.id === "condiciones" || item.id === "cual-le-toca") return plazos(item, eleccion);
    if (item.id === "que-es") return queEs(eleccion);
    return sobreQue(item, eleccion);
  },
};
