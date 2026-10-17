import { H2_ID, ITEMS_H2, CIFRAS_H2 as C } from "../../data/contabilidadT7_3_h2.js";
import { textoDeValor } from "../t7_3H2.js";
import { itemsHacer, valorDe, frente, pesos, pct } from "./t73.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T7-3 H2 «Cadena de descuentos» · D9 · objeto: la escalera de la
 * cadena. Cada cifra tocada se ve en su escalón (el saldo después de cada
 * descuento) y la figura dice lo que implica (Watari, f73.js, «t73-h2»). En
 * main los cinco ítems son de un toque; se quedan así. La pinta
 * FiguraEscaleraPalma (t7/FigurasC4T7_3.jsx).
 *
 * consecuencia(item, eleccion) → { escalones: [{ rot, v, activa? }], falla? | cuadra? }
 *
 * [W] pendiente de Near: el título, los rótulos de los escalones y los
 * textos de consecuencia (Watari), tal cual, con «frente al» (C4-5 de Mello).
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* [W] pendiente de Near */
export const TEXTOS_C4_H2 = {
  titulo: "Palma · 10 %, 5 % y 4 %",
  lista: "Lista",
  menos: (d) => `− ${d} %`,
  baseBien: "El 5 % va sobre este escalón.",
  baseMal: (x) => `El 5 % sale de ${pesos(x)}: ${pesos(x * 0.05)}.`,
  queEscalon: "el último escalón",
  queFactura: "la factura",
  factorBien: "0,8208 × $2.750.000 = $2.257.200.",
  factorMal: (x) => `Con ${String(x).replace(".", ",")} da ${pesos(x * C.lista)}. La cadena da ${pesos(C.factura)}.`,
  rebajaBien: "$492.800 de $2.750.000.",
  rebajaMal: (x) => `El ${pct(x)} de la lista son ${pesos((C.lista * x) / 100)}, y se rebajaron $492.800.`,
  cuadra: "Cuadra.",
};
const T = TEXTOS_C4_H2;

export const ITEMS_C4_H2 = itemsHacer(ITEMS_H2, (it, v) => textoDeValor(it, v));
const DESCUENTOS = [10, 5, 4];
/* El escalón que mueve cada ítem (el de la factura y el del factor: el último). */
const MARCA = { "base-del-cinco": 1, "valor-a-facturar": 3, factor: 3 };

export function consecuenciaH2(item, eleccion) {
  const o = valorDe(item, eleccion);
  const x = o?.v ?? null;
  const marca = x == null ? -1 : MARCA[item.id] ?? -1;
  const escalones = C.saldos.map((s, i) => ({
    rot: i ? T.menos(DESCUENTOS[i - 1]) : T.lista,
    v: i === marca && item.id !== "factor" ? x : s,
    ...(i === marca ? { activa: true } : {}),
  }));
  const estado = { escalones };
  if (x == null) return estado;
  const bien = (t) => ({ ...estado, cuadra: t });
  const mal = (t) => ({ ...estado, falla: t });
  if (item.id === "base-del-cinco") return x === C.saldos[1] ? bien(T.baseBien) : mal(T.baseMal(x));
  if (item.id === "valor-a-facturar") return x === C.factura ? bien(T.cuadra) : mal(frente(x, C.factura, T.queEscalon));
  if (item.id === "factor") return Math.abs(x - C.factor) < 1e-9 ? bien(T.factorBien) : mal(T.factorMal(x));
  if (item.id === "rebaja-real") return Math.abs(x - C.pctRebaja) < 1e-9 ? bien(T.rebajaBien) : mal(T.rebajaMal(x));
  return x === C.cliente ? bien(T.cuadra) : mal(frente(x, C.cliente, T.queFactura));
}

export const CONSECUENCIA_C4 = { id: H2_ID, objeto: "La escalera de la cadena", modo: "hacer", items: ITEMS_C4_H2, consecuencia: consecuenciaH2 };
