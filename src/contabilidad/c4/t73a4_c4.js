import { PIEZA_EL_DESCUENTO_EN_DOS_LIBROS as P } from "../../data/contabilidadT7_3_a4.js";
import { H3_LIBRO } from "../../data/contabilidadT7_3_a3.js";
import { itemsAprender, pesos } from "./t73.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T7-3 A4 «El descuento en los dos libros» · D4 + D9 · objeto: los dos
 * libros, lado a lado. La línea tocada cae en el libro de cada empresa y su
 * saldo cambia; en el estado de resultados, los $598.500 entran al renglón
 * tocado (los renglones son las opciones: enFigura). Watari, f73.js.
 *
 * consecuencia(item, eleccion) → según el ítem:
 *   el-pago         { libros: [{ titular, debe: [v], haber: [v], fuera?, toca? }], falla? | cuadra? }
 *                   (la cuenta de los dos libros es la de Near: Descuento comercial condicionado)
 *   cierre          { libros: [{ titular, debe, haber, saldo }], falla? | cuadra? }
 *   no-operacional  { renglon, utilidad, falla? | cuadra? }
 *
 * [W] pendiente de Near: títulos de los libros, «Efecto en la utilidad» y
 * los textos de consecuencia.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const D = H3_LIBRO.condicionado;
/* La cuenta T de San Calixto de `cierre`, de los datos de Near. */
const T_CIERRE = P.pantallas.find((p) => p.id === "cierre").cuentasT[0];
export const CUENTA_A4 = T_CIERRE.cuenta;

/* [W] pendiente de Near */
export const W_A4 = {
  loDa: "San Calixto · lo da",
  loRecibe: "Santa Martha · lo recibe",
  saldo: "Saldo",
  estado: "Estado de resultados · San Calixto",
  efecto: "Efecto en la utilidad",
  pagoBien: "Cada libro lo anota a un lado.",
  pagoDebe: "Así los dos libros lo anotarían como quien lo da.",
  pagoNoSeAnota: "Así Santa Martha pagaría menos sin registrar por qué.",
  cierreBien: "Queda en cero.",
  cierreDebe: (s) => `Así el saldo crece a ${pesos(s)} en lugar de quedar en cero.`,
  cierreNo: `Así el periodo siguiente empieza con ${pesos(D)} de este.`,
  utilidadBien: "Baja la utilidad, fuera de la operación.",
  utilidadIngreso: "Así el descuento que dio sumaría a su utilidad.",
  utilidadCosto: "Así baja la utilidad bruta: queda en la operación.",
};
const W = W_A4;

function elPago(e) {
  /* «No se anota»: los $598.500 quedan fuera del libro de Santa Martha (fuera), a la vista. */
  const libros = [{ titular: W.loDa, debe: [D], haber: [] }, { titular: W.loRecibe, debe: e === "debe" ? [D] : [], haber: e === "haber" ? [D] : [], ...(e === "no-se-anota" ? { fuera: D } : {}), toca: Boolean(e) }];
  if (!e) return { libros };
  if (e === "haber") return { libros, cuadra: W.pagoBien };
  return { libros, falla: e === "debe" ? W.pagoDebe : W.pagoNoSeAnota };
}

function cierre(e) {
  const saldo = e === "haber" ? 0 : e === "debe" ? 2 * D : D;
  const libro = { titular: T_CIERRE.titular, debe: e === "debe" ? [D, D] : [D], haber: e === "haber" ? [D] : [], saldo: e ? saldo : null, toca: Boolean(e) };
  if (!e) return { libros: [libro] };
  if (e === "haber") return { libros: [libro], cuadra: W.cierreBien };
  return { libros: [libro], falla: e === "debe" ? W.cierreDebe(saldo) : W.cierreNo };
}

function noOperacional(e) {
  if (!e) return { renglon: null, utilidad: null };
  const estado = { renglon: e, utilidad: e === "ingreso" ? D : -D };
  if (e === "gasto") return { ...estado, cuadra: W.utilidadBien };
  return { ...estado, falla: e === "ingreso" ? W.utilidadIngreso : W.utilidadCosto };
}

export const CONSECUENCIA_C4 = {
  id: P.id,
  objeto: "Los dos libros",
  modo: "aprender",
  items: itemsAprender(P.pantallas),
  /* En `no-operacional`, los renglones del estado de resultados son las opciones. */
  enFigura: (item) => item.id === "no-operacional",
  consecuencia(item, eleccion) {
    if (item.id === "el-pago") return elPago(eleccion);
    if (item.id === "cierre") return cierre(eleccion);
    return noOperacional(eleccion);
  },
};
