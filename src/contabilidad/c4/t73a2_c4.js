import { PIEZA_DESCUENTOS_EN_CADENA as P, H2_LIBRO } from "../../data/contabilidadT7_3_a2.js";
import { itemsAprender, numDe, pesos, pct } from "./t73.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T7-3 A2 «Descuentos en cadena» · D4 · objeto: la barra de la cadena.
 * La barra del precio de lista se corta como dice la opción tocada: de una
 * vez (23 %), de más, o en cadena, con lo que queda (Watari, f73.js).
 *
 * consecuencia(item, eleccion) → { titulo, partes: [{ w, corte, rot, toca? }], falla? | cuadra? }
 *   w: el tramo en pesos (la barra entera es la lista); corte: lo rebajado.
 *
 * [W] pendiente de Near: el título de la barra, los rótulos de sus tramos
 * y los textos de consecuencia.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const C = H2_LIBRO;
const L = C.lista;
const r = (x) => Math.round(x);

/* [W] pendiente de Near */
export const W_A2 = {
  titulo: `Precio de lista ${pesos(L)} · 5 %, 8 % y 10 %`,
  dosVeintitres: "23 %",
  menosDe: (x) => `menos de ${pesos(x)}`,
  masDe23: "más de 23 %",
  despuesDel5: "Después del 5 %",
  ochoDe: (b, c) => `8 % de ${pesos(b)} = ${pesos(c)}`,
  quedan: (x) => `Quedan ${pesos(x)}`,
  igual: `Así se rebaja todo de una vez: quedan ${pesos(r(L * 0.77))}.`,
  mayor: `Así la rebaja pasa de ${pesos(C.rebaja23)}.`,
  menor: "Cada descuento va sobre lo que dejó el anterior.",
  pasosBien: "El 8 % va sobre lo que quedó.",
  pasosLista: `Así el 8 % cae también sobre los ${pesos(C.d1)} que ya se rebajaron.`,
  pasosRebaja: "Así el 8 % saldría de la rebaja, no de lo que queda.",
  atajoBien: "0,7866 de la lista es lo que se factura.",
  atajoMal: (x) => `Así se facturarían ${pesos(x)} de ${pesos(L)}: el ${pct((100 * x) / L)} de la lista.`,
};
const W = W_A2;
const parte = (w, corte, rot = "", toca = false) => ({ w: r(w), corte, rot, ...(toca ? { toca: true } : {}) });

function ejemplo(e) {
  if (e === "igual") return { partes: [parte(L * 0.77, false, pesos(r(L * 0.77))), parte(L * 0.23, true, W.dosVeintitres, true)], falla: W.igual };
  if (e === "mayor") return { partes: [parte(L * 0.74, false, W.menosDe(r(L * 0.77))), parte(L * 0.26, true, W.masDe23, true)], falla: W.mayor };
  if (e === "menor") {
    return { partes: [parte(C.factura, false, pesos(C.factura)), parte(C.d3, true, "10 %", true), parte(C.d2, true, "8 %", true), parte(C.d1, true, "5 %", true)], cuadra: W.menor };
  }
  return { partes: [parte(L, false)] };
}

function pasos(item, e) {
  const o = item.opciones.find((x) => x.id === e);
  const b = o ? numDe(o.t) : null;
  if (!b) return { partes: [parte(C.s1, false, W.despuesDel5), parte(C.d1, true, "5 %")] };
  const c = r(b * 0.08);
  const estado = { partes: [parte(C.s1 - c, false, pesos(C.s1 - c)), parte(c, true, W.ochoDe(b, c), true), parte(C.d1, true, "5 %")] };
  if (b === C.s1) return { ...estado, cuadra: W.pasosBien };
  return { ...estado, falla: b === L ? W.pasosLista : W.pasosRebaja };
}

function atajo(item, e) {
  const o = item.opciones.find((x) => x.id === e);
  const x = o ? numDe(o.t) : null;
  if (!x) return { partes: [parte(L, false)] };
  const estado = { partes: [parte(x, false, W.quedan(x), true), parte(L - x, true)] };
  return o.correcta ? { ...estado, cuadra: W.atajoBien } : { ...estado, falla: W.atajoMal(x) };
}

export const CONSECUENCIA_C4 = {
  id: P.id,
  objeto: "La barra de la cadena",
  modo: "aprender",
  items: itemsAprender(P.pantallas),
  consecuencia(item, eleccion) {
    const estado = item.id === "ejemplo" ? ejemplo(eleccion) : item.id === "pasos" ? pasos(item, eleccion) : atajo(item, eleccion);
    return { titulo: W.titulo, total: L, ...estado };
  },
};
