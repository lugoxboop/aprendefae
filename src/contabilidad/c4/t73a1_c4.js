import { PIEZA_EL_DESCUENTO_COMERCIAL as P, H1_LIBRO, ROTULOS_PATRON } from "../../data/contabilidadT7_3.js";
import { itemsAprender, numDe, pesos } from "./t73.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T7-3 A1 «El descuento comercial» · D4 · objeto: la factura de San
 * Calixto. La factura se rehace con la clase o la base tocada: la rebaja
 * entra o sale, el IVA y la retención se recalculan, Ingresos por ventas se
 * llena con la cifra tocada (Watari, Patrón de enganche C4, f73.js).
 *
 * consecuencia(item, eleccion) → el estado de la figura:
 *   { titulo, filas: [{ op, rot, v, res?, toca? }], aparte?, asiento?, cobra?, falla? | cuadra? }
 *
 * [W] pendiente de Near: los rótulos de figura y los textos de consecuencia
 * (falla y cuadra) son de Watari. Nunca van marcados en pantalla. Los
 * rótulos del Patrón T7-3 (ROTULOS_PATRON) y las filas de la factura salen de
 * los datos de Near.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const C = H1_LIBRO;
const pantalla = (id) => P.pantallas.find((p) => p.id === id);

/* [W] pendiente de Near */
export const W_A1 = {
  laFactura: "La factura",
  descuento10: "Descuento 10 %",
  listaMenos10: "lista − 10 %",
  precioDeLista: "precio de lista",
  aparte: "− 10 %, solo si paga a tiempo",
  iva: (b) => `IVA 16 %${b ? ` sobre ${pesos(b)}` : ""}`,
  retencion: (b) => `Retención 3,5 %${b ? ` sobre ${pesos(b)}` : ""}`,
  debeElCliente: "Debe el cliente",
  cobra: "Lo que se cobra por la mercancía",
  dentro: "La rebaja va dentro de la factura.",
  ninguna: "Así la rebaja desaparece: se factura el precio de lista.",
  condicionado: "Así la rebaja sale de la factura y espera a que pague a tiempo.",
  baseBien: "Los impuestos van sobre lo que se cobra.",
  baseMal: (b) => `Así los impuestos saldrían de ${pesos(b)}, y la mercancía se cobra por ${pesos(C.factura)}.`,
  ingresosBien: "Ingresos registra lo que se cobra.",
  ingresosDeMas: (x) => `Así Ingresos sube ${pesos(x - C.factura)} que no se cobran.`,
  ingresosRebaja: "Así en Ingresos queda solo la rebaja.",
};
const W = W_A1;

function dosClases(e) {
  const dentro = !e || e === "comercial";
  const filas = [
    { rot: ROTULOS_PATRON.precioLista, v: "—" },
    ...(dentro ? [{ op: "−", rot: W.descuento10, v: "—", toca: Boolean(e) }] : []),
    { op: "=", rot: ROTULOS_PATRON.valorFacturar, v: e ? (dentro ? W.listaMenos10 : W.precioDeLista) : "—", res: true, toca: Boolean(e) && !dentro },
  ];
  const estado = { titulo: W.laFactura, filas };
  if (e === "condicionado") return { ...estado, aparte: W.aparte, falla: W.condicionado };
  if (e === "ninguna") return { ...estado, falla: W.ninguna };
  return e ? { ...estado, cuadra: W.dentro } : estado;
}

function ejemplo(item, e) {
  const o = item.opciones.find((x) => x.id === e);
  const b = o ? numDe(o.t) : null;
  const iva = b && b * 0.16;
  const ret = b && b * 0.035;
  const estado = {
    titulo: ROTULOS_PATRON.factura("San Calixto"),
    filas: [
      ...pantalla("ejemplo").figuras[0].filas,
      { op: "+", rot: W.iva(b), v: b ? iva : null, toca: Boolean(b) },
      { op: "−", rot: W.retencion(b), v: b ? ret : null, toca: Boolean(b) },
      { op: "=", rot: W.debeElCliente, v: b ? C.factura + iva - ret : null, res: true },
    ],
  };
  if (!b) return estado;
  return b === C.factura ? { ...estado, cuadra: W.baseBien } : { ...estado, falla: W.baseMal(b) };
}

function noSeRegistra(item, e) {
  const o = item.opciones.find((x) => x.id === e);
  const x = o ? numDe(o.t) : null;
  const estado = { ingresos: x, cobra: x ? C.factura : null };
  if (!x) return estado;
  if (x === C.factura) return { ...estado, cuadra: W.ingresosBien };
  return { ...estado, falla: x > C.factura ? W.ingresosDeMas(x) : W.ingresosRebaja };
}

export const CONSECUENCIA_C4 = {
  id: P.id,
  objeto: "La factura de San Calixto",
  modo: "aprender",
  items: itemsAprender(P.pantallas),
  consecuencia(item, eleccion) {
    if (item.id === "dos-clases") return dosClases(eleccion);
    if (item.id === "ejemplo") return ejemplo(item, eleccion);
    return noSeRegistra(item, eleccion);
  },
};
