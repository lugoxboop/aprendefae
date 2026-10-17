import { PIEZA_LA_PROVISION as P, I3_LIBRO } from "../../data/contabilidadT7_3_a6.js";
import { itemsAprender, pesos } from "./t73.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T7-3 A6 «La provisión para inventarios» · D4 + D9 · objeto:
 * inventario, provisión y gasto. La cuenta tocada mueve el inventario, el
 * saldo de la provisión y el gasto del periodo (Watari, f73.js).
 *
 * consecuencia(item, eleccion) → { titulo, inventario, provision, gasto, toca?, falla? | cuadra? }
 *   toca: la cuenta tocada ("inventario" | "provision" | "gasto").
 *
 * [W] pendiente de Near: el título, los rótulos de los tres renglones y los
 * textos de consecuencia.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const C = I3_LIBRO;

/* [W] pendiente de Near */
export const W_A6 = {
  alEstimar: `Al estimar · ${pesos(C.provision)}`,
  alCierre: `Al cierre · falta ${pesos(C.perdida)}`,
  inventario: "Cambio en Inventario de mercancías",
  provision: "Provisión para inventarios (saldo)",
  gasto: "Gasto del periodo",
  estimarBien: "El gasto entra al periodo y la provisión queda lista.",
  perdidaBien: "La pérdida sale de la provisión; el gasto ya estaba.",
  inventario_: "Así la bodega gana lo que no tiene.",
  gasto_: "Así el gasto del periodo se anotaría dos veces.",
  provision_: "Así la provisión quedaría en contra antes de cualquier pérdida.",
};
const W = W_A6;

export const CONSECUENCIA_C4 = {
  id: P.id,
  objeto: "Inventario, provisión y gasto",
  modo: "aprender",
  items: itemsAprender(P.pantallas),
  consecuencia(item, e) {
    const est = item.id === "estimar";
    const M = est ? C.provision : C.perdida;
    let inventario = 0;
    let provision = est ? 0 : C.provision;
    let gasto = est ? 0 : C.provision;
    if (e && est) {
      if (e === "gasto") { gasto += M; provision += M; }
      if (e === "provision") provision -= M;
      if (e === "inventario") inventario += M;
    } else if (e) {
      if (e === "provision") { provision -= M; inventario -= M; }
      if (e === "gasto") { gasto += M; inventario -= M; }
      if (e === "inventario") inventario += M;
    }
    const estado = { titulo: est ? W.alEstimar : W.alCierre, inventario, provision, gasto };
    if (!e) return estado;
    const ok = item.opciones.find((o) => o.id === e)?.correcta;
    if (ok) return { ...estado, toca: e, cuadra: est ? W.estimarBien : W.perdidaBien };
    return { ...estado, toca: e, falla: W[`${e}_`] };
  },
};
