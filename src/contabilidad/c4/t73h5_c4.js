import { H5_ID, ITEMS_H5, OLMO_1, OLMO_2, PINO } from "../../data/contabilidadT7_3_h5.js";
import { itemsHacer, valorDe, pesos } from "./t73.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T7-3 H5 «Ajuste por conteo» · D9 · objeto: la balanza del conteo.
 * Libros contra conteo: la cifra comprobada o el ajuste tocado la inclinan o
 * la nivelan; en la provisión de Pino, la cuenta tocada recibe los $460.000
 * (las cuentas son las opciones). Watari, f73.js, «t73-h5». La pinta
 * FiguraBalanzaConteo (t7/FigurasC4T7_3.jsx). Los asientos siguen como en
 * main («propio»).
 *
 * consecuencia(item, eleccion) →
 *   balanza    { caso, libros, conteo, cmv?, tuya?, falla? | cuadra? }
 *   provisión  { cuenta, mov, falla? | cuadra? }        (estimar-provision)
 *
 * Ningún monto negativo (C4-3 de Mello): en `el-faltante`, un faltante mayor
 * que los libros deja la balanza en $0 y dice la frase de Mello: «Ese
 * faltante es más grande que todo lo que dicen los libros.» (pendiente de Near).
 *
 * [W] pendiente de Near: títulos, rótulos y textos de consecuencia (Watari).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SOBRA = OLMO_1.conteo - OLMO_1.libros;

/* [W] pendiente de Near */
export const TEXTOS_C4_H5 = {
  pino: `Pino · provisión de ${pesos(PINO.provision)} · al debe`,
  olmo: (caso) => `Olmo · ${caso === 1 ? "segundo conteo" : "primer conteo"}`,
  libros: "Libros",
  conteo: "Conteo",
  tuCifra: "Tu cifra:",
  cmv: "Costo de mercancía vendida:",
  sube: `+ ${pesos(SOBRA)}`,
  baja: `− ${pesos(SOBRA)}`,
  sinCambio: "sin cambio",
  provisionBien: "El gasto entra al periodo.",
  provisionMal: "Así no entraría ningún gasto al periodo.",
  ajusteBien: "Con el ajuste, los libros llegan al conteo.",
  ajusteMal: (lib) => `Ajustar un faltante bajaría los libros a ${pesos(lib)}, más lejos del conteo.`,
  nivelada: "La balanza queda nivelada.",
  quedarian: (lib, c) => `Los libros quedarían en ${pesos(lib)} y el conteo da ${pesos(c)}.`,
  /* C4-3 de Mello (auditoria-mello-patron-c4.md), pendiente de Near. */
  masQueLosLibros: "Ese faltante es más grande que todo lo que dicen los libros.",
  costoBien: "El sobrante baja el costo de lo vendido.",
  costoSube: "Así el sobrante sube el costo de lo vendido.",
  costoNoCambia: "Así el ajuste quedaría sin su otra mitad.",
};
const T = TEXTOS_C4_H5;

export const ITEMS_C4_H5 = itemsHacer(ITEMS_H5, (it, v) => (it.tipo === "cifra" ? pesos(v) : String(v)), (it) => ({ caso: it.caso }));

export function consecuenciaH5(item, eleccion) {
  const x = valorDe(item, eleccion);
  if (item.id === "estimar-provision") {
    if (x == null) return { cuenta: null };
    const e = { cuenta: x.id, mov: `+ ${pesos(PINO.provision)}` };
    return x.correcta ? { ...e, cuadra: T.provisionBien } : { ...e, falla: T.provisionMal };
  }
  const [L, C] = item.caso === 1 ? [OLMO_2.libros, OLMO_2.conteo] : [OLMO_1.libros, OLMO_1.conteo];
  const estado = { caso: item.caso, libros: L, conteo: C, ...(item.tipo === "cifra" ? { tuya: x } : {}) };
  if (x == null) return estado;
  if (item.id === "sobrante-o-faltante") {
    const lib = x.t === "Sobrante" ? L + SOBRA : L - SOBRA;
    return { ...estado, libros: lib, ...(x.correcta ? { cuadra: T.ajusteBien } : { falla: T.ajusteMal(lib) }) };
  }
  if (item.id === "que-pasa-con-el-costo") {
    const cmv = x.t === "Sube" ? T.sube : x.t === "Baja" ? T.baja : T.sinCambio;
    return { ...estado, libros: L + SOBRA, cmv, ...(x.correcta ? { cuadra: T.costoBien } : { falla: x.t === "Sube" ? T.costoSube : T.costoNoCambia }) };
  }
  if (item.id === "el-faltante" && x > L) return { ...estado, libros: 0, falla: T.masQueLosLibros };
  const lib = item.id === "el-sobrante" ? L + x : L - x;
  return { ...estado, libros: lib, ...(lib === C ? { cuadra: T.nivelada } : { falla: T.quedarian(lib, C) }) };
}

export const CONSECUENCIA_C4 = { id: H5_ID, objeto: "La balanza del conteo", modo: "hacer", items: ITEMS_C4_H5, consecuencia: consecuenciaH5 };
