import { PIEZA_NIC2_COSTO as P, EJEMPLO_A7 } from "../../data/contabilidadT7_3_a7.js";
import { itemsAprender, numDe, pesos } from "./t73.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T7-3 A7 «La NIC 2 del libro» · D4 · objeto: la ficha NIC 2 de la
 * tienda. La cosa tocada entra a la columna del inventario; el valor tocado
 * se marca en la regla del costo y del valor neto realizable; lo tocado resta
 * del costo y lo demás suma; el gasto llega cuando dice la opción (Watari,
 * f73.js).
 *
 * consecuencia(item, eleccion) → según el ítem:
 *   que-es        { inventario: chip | null, falla? | cuadra? }
 *   como-se-mide  { marcas: [{ rot, v }], valor, falla? | cuadra? }
 *   el-costo      { partes: [{ signo, t, toca? }], falla? | cuadra? }
 *   gasto         { pasos, cuando, falla? | cuadra? }
 *
 * Las tres pantallas que vinieron de A8 (`formulas`, `la-que-falta`,
 * `sistemas`) no traen objeto en el prototipo de Watari: van como ítem
 * «propio» (elección con la escalera C2, sin figura de consecuencia) hasta
 * que Watari las dibuje.
 *
 * [W] pendiente de Near: títulos, rótulos y textos de consecuencia.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const E = EJEMPLO_A7;

/* [W] pendiente de Near */
export const W_A7 = {
  inventario: "Inventario",
  noEsInventario: "No es inventario",
  chip: { mercancia: "La mercancía", computador: "El computador", local: "El local" },
  queEsBien: "Es lo que tiene para vender.",
  queEsMal: (t) => `Así ${t.toLowerCase()} queda para la venta.`,
  enLosLibros: "En los libros",
  vnr: "VNR",
  costo: "Costo",
  medidaBien: "Queda en lo que se puede recuperar.",
  medidaMal: (x) => `Así quedaría en ${pesos(x)}, por encima de lo que se puede recuperar al venderla.`,
  costoTit: "Costo de adquisición",
  partes: ["Precio", "El transporte hasta la bodega", "El bodegaje en la aduana mientras llega", "Un descuento comercial"],
  costoBien: "El descuento baja el costo.",
  /* C4-4 de Mello (auditoria-mello-patron-c4.md): la de Watari decía que bajaba el costo, y la NIC 2 lo suma. Pendiente de Near. */
  costoMal: (id) => `Así ${{ bodegaje: "el bodegaje", transporte: "el transporte hasta la bodega" }[id]} restaría, y la NIC 2 lo suma al costo.`,
  valorTit: "El valor de la mercancía",
  pasos: ["Compra", "En bodega", "Venta · marzo"],
  pasaAGasto: (c) => `Pasa a gasto: ${c}`,
  cuando: { marzo: "Marzo · con la venta", "al-comprar": "Al comprar", nunca: "Nunca" },
  gastoBien: "El gasto llega con los ingresos de esa venta.",
  gastoNunca: "Así lo que ya se vendió sigue en la bodega.",
  gastoAntes: "Así el gasto llegaría antes que su venta.",
};
const W = W_A7;

/* Las pantallas de A8 que siguen como elección sin figura propia. */
export const PROPIOS_A7 = ["formulas", "la-que-falta", "sistemas"];

function queEs(item, e) {
  const o = item.opciones.find((x) => x.id === e);
  if (!o) return { inventario: null };
  return { inventario: W.chip[o.id], ...(o.correcta ? { cuadra: W.queEsBien } : { falla: W.queEsMal(o.t) }) };
}

function comoSeMide(item, e) {
  const o = item.opciones.find((x) => x.id === e);
  const estado = { marcas: [{ rot: W.vnr, v: E.vnr }, { rot: W.costo, v: E.costo }], desde: 500_000, hasta: 650_000, valor: o ? numDe(o.t) : null };
  if (!o) return estado;
  return { ...estado, ...(o.correcta ? { cuadra: W.medidaBien } : { falla: W.medidaMal(estado.valor) }) };
}

function elCosto(item, e) {
  const o = item.opciones.find((x) => x.id === e);
  const partes = W.partes.map((t) => {
    const toca = Boolean(o) && o.t === t;
    return { signo: toca ? "−" : !o && t === W.partes[3] ? "?" : "+", t, ...(toca ? { toca: true } : {}) };
  });
  if (!o) return { partes };
  return { partes, ...(o.correcta ? { cuadra: W.costoBien } : { falla: W.costoMal(o.id) }) };
}

function gasto(e) {
  if (!e) return { cuando: null };
  const estado = { cuando: W.cuando[e] };
  if (e === "marzo") return { ...estado, cuadra: W.gastoBien };
  return { ...estado, falla: e === "nunca" ? W.gastoNunca : W.gastoAntes };
}

export const CONSECUENCIA_C4 = {
  id: P.id,
  objeto: "La ficha NIC 2 de la tienda",
  modo: "aprender",
  items: itemsAprender(P.pantallas, PROPIOS_A7),
  consecuencia(item, eleccion) {
    if (item.id === "que-es") return queEs(item, eleccion);
    if (item.id === "como-se-mide") return comoSeMide(item, eleccion);
    if (item.id === "el-costo") return elCosto(item, eleccion);
    return gasto(eleccion);
  },
};
