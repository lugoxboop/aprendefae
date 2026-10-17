import { H4_ID, METODOS_H4, FILAS_H4, DISTRACTORES_H4, CIFRAS_H4, VENTAS_H4, GASTOS_H4, PARTE2_H4 } from "../../data/contabilidadT7_1_h4.js";
import { CASILLAS_H4, idLineaH4 } from "../t7H4.js";
import { pesosC4 as $ } from "./t71Comun.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T7-1 H4 «Cierra el mes» — la consecuencia, pura (D9). Patrón de
 * enganche C4 de Watari (patron-enganche-c4-v1.html, sección «t71-h4»;
 * f71.js). La pinta CierraElMes.jsx, que no monta el motor (precedente de
 * #424): la tabla de main se queda (tocar una cifra y después su casilla).
 *
 * Objeto propio: el estado de resultados en cascada. Cada casilla es una
 * decisión: la cifra puesta recalcula su método en cascada (disponible −
 * final = costo vendido; ventas − costo = utilidad bruta; − gastos =
 * operacional). Como la cifra que se escribe (Mello C4-1), poner una ficha
 * no califica: la consecuencia de las doce llega al «Confirmar», y el
 * veredicto, ESPERA_C4 después.
 *
 * Una casilla es un ítem de elección con las quince fichas del banco (las
 * doce correctas y los tres distractores de Near). Las dos líneas del cierre
 * siguen como en main («Arma la línea»): propio. Ids y detalle, los de main.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const C = CIFRAS_H4;
const D = C.disponible;
const U = C.quedan;

/* Las quince fichas, sin repetir: las doce correctas y los tres distractores. */
export const BANCO_C4_H4 = [...new Set([...CASILLAS_H4.map((c) => c.valor), ...DISTRACTORES_H4.map((d) => d.valor)])];

export const ITEMS_C4_H4 = [
  ...CASILLAS_H4.map((c) => ({
    id: c.id, tipo: "eleccion", metodo: c.metodo.id, fila: c.fila.id, subtema: c.metodo.nombre, pregunta: `${c.metodo.nombre} · ${c.fila.nombre}`,
    opciones: BANCO_C4_H4.map((v) => ({ id: String(v), v, t: $(v), correcta: v === c.valor, msg: DISTRACTORES_H4.find((d) => d.valor === v)?.retro ?? null })),
    porque: c.fila.retro,
  })),
  ...PARTE2_H4.lineas.map((l) => ({ id: idLineaH4(l), tipo: "propio", subtema: "Cierre con el promedio", pregunta: l.cuenta, opciones: [] })),
];

/*
 * [W] pendiente de Near: los rótulos de la cascada y las dos frases de la fila
 * del final y del costo (f71.js, ahí solo para el promedio).
 * [ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION: la misma frase
 * llevada a PEPS y UEPS, y las de la utilidad bruta, la operacional y «Cuadra
 * con el estado de resultados.».
 */
export const TEXTOS_C4_H4 = {
  titulo: (metodo) => `${metodo} · el mes de La Roca`,
  filas: { disponible: "Mercancía disponible", final: "− Inventario final", cmv: "= Costo de mercancía vendida", ventas: "Ventas", bruta: "= Utilidad bruta en ventas", operacional: "= Utilidad operacional" },
  cadaUna: (u) => `Cada unidad queda a ${$(u)}.`,
  /* f71.js: «Pero el promedio da $958.»; con PEPS y UEPS, su nombre. */
  valeCadaUna: (u, metodo, bien) => `Así cada una vale ${$(u)}. Pero ${{ peps: "PEPS", ueps: "UEPS", promedio: "el promedio" }[metodo]} da ${$(bien)}.`,
  quedan: (y) => `Quedan en bodega ${$(y)}.`,
  quedanMal: (y, z) => `Así quedan ${$(y)} en la bodega. Y deben quedar ${$(z)}.`,
  costoSeria: (y, z) => `Así el costo vendido sería ${$(y)}. Y es ${$(z)}.`,
  brutaSeria: (y, z) => `Así la utilidad bruta sería ${$(y)}. Y es ${$(z)}.`,
  brutaPasa: "Así la utilidad bruta pasaría de las ventas.",
  cuadra: "Cuadra con el estado de resultados.",
};
const T = TEXTOS_C4_H4;

/* La cascada de un método a partir de la cifra puesta en una de sus filas; lo que saldría negativo queda en $?. */
function cascada(fila, x) {
  let fin; let cmv; let bruta; let oper;
  if (fila === "final") { fin = x; cmv = D - x; bruta = VENTAS_H4 - cmv; oper = bruta - GASTOS_H4; }
  if (fila === "cmv") { cmv = x; fin = D - x; bruta = VENTAS_H4 - x; oper = bruta - GASTOS_H4; }
  if (fila === "bruta") { bruta = x; cmv = VENTAS_H4 - x; fin = D - cmv; oper = x - GASTOS_H4; }
  if (fila === "operacional") { oper = x; bruta = x + GASTOS_H4; cmv = VENTAS_H4 - bruta; fin = D - cmv; }
  const v = (n) => (n == null || n < 0 ? null : n);
  return { disponible: D, final: v(fin), cmv: v(cmv), ventas: VENTAS_H4, bruta: v(bruta), operacional: v(oper) };
}

export function consecuenciaH4(item, eleccion) {
  const metodo = METODOS_H4.find((m) => m.id === item.metodo);
  const base = { titulo: T.titulo(metodo.nombre), metodo: metodo.id, fila: item.fila };
  if (eleccion == null) return { ...base, cifras: null };
  const x = Number(eleccion);
  const bien = metodo.cifras;
  const e = { ...base, cifras: cascada(item.fila, x) };
  if (x === bien[item.fila]) return { ...e, cuadra: item.fila === "final" ? T.cadaUna(x / U) : item.fila === "cmv" ? T.quedan(D - x) : T.cuadra };
  if (item.fila === "final") return { ...e, falla: T.valeCadaUna(x / U, metodo.id, bien.final / U) };
  if (item.fila === "cmv") return { ...e, falla: T.quedanMal(D - x, bien.final) };
  if (item.fila === "bruta") return { ...e, falla: T.costoSeria(VENTAS_H4 - x, bien.cmv) };
  return { ...e, falla: x + GASTOS_H4 > VENTAS_H4 ? T.brutaPasa : T.brutaSeria(x + GASTOS_H4, bien.bruta) };
}

export const CONSECUENCIA_C4 = {
  id: H4_ID,
  objeto: "El estado de resultados en cascada",
  modo: "hacer",
  items: ITEMS_C4_H4,
  consecuencia: consecuenciaH4,
};
