import { H7_ID, ITEMS_H7, CASOS_H7, vnr } from "../../data/contabilidadT7_3_h7.js";
import { opcionesDeH7 } from "../t7_3H7.js";
import { pesos } from "./t73.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T7-3 H7 «¿Costo o valor neto realizable?» · D4 + D9 · objeto: la
 * línea costo – VNR. El valor tocado se marca sobre una línea con el precio,
 * el costo y (en la medida) el valor neto realizable: se ve cuál es menor y
 * cuánto se aleja (Watari, f73.js). Hacer: un toque, como en main.
 *
 * Las opciones son las cifras de main (la correcta y los distractores de
 * Near), con su número como id: el `detalle` guarda la cifra tocada, como
 * antes. El orden lo da la mecánica (barajado en cada partida, como en main).
 *
 * consecuencia(item, eleccion) → { caso, marcas: [{ rot, v }], desde, hasta, valor, falla? | cuadra? }
 *
 * [W] pendiente de Near: los rótulos de la línea (Precio, Costo, VNR) y los
 * textos de consecuencia. Watari escribía «frente a el precio…»; aquí va
 * «frente al precio…» (la contracción), sin otro cambio.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* [W] pendiente de Near */
export const W_H7 = {
  precio: "Precio",
  costo: "Costo",
  vnr: "VNR",
  vender: (v) => `Vender cuesta ${pesos(v)}`,
  terminar: (t) => `terminarlo, ${pesos(t)}`,
  queTienda: "precio menos lo que cuesta venderla",
  queFabrica: "precio menos terminar y vender",
  cuadra: "Cuadra.",
  dif: (x, t, que) => `${x > t ? "Sobran" : "Faltan"} ${pesos(Math.abs(x - t))} frente al ${que}.`,
  menorBien: "Es el menor de los dos.",
  menorMal: (x) => `${pesos(x)} no es el menor: el otro valor es más bajo.`,
};
const W = W_H7;

export const itemsH7 = (fuente = ITEMS_H7.map((it) => ({ ...it, opciones: opcionesDeH7(it).map((v) => ({ valor: v })) }))) => fuente.map((it) => ({
  id: it.id,
  caso: it.caso,
  texto: CASOS_H7[it.caso].texto,
  pregunta: it.pregunta,
  opciones: it.opciones.map((o) => {
    const d = it.distractores.find((x) => x.valor === o.valor);
    return { id: o.valor, v: o.valor, t: pesos(o.valor), ...(o.valor === it.correcta ? { correcta: true } : { msg: d.retro }) };
  }),
  bien: it.acierto,
  porque: null,
}));

function consecuencia(item, e) {
  const c = CASOS_H7[item.caso];
  const v = vnr(c);
  const x = e == null ? null : Number(e);
  const medida = item.id.startsWith("medida");
  const desde = Math.min(v, c.costo) * 0.9;
  const hasta = c.precio * 1.02;
  const marcas = [{ rot: W.precio, v: c.precio }, { rot: W.costo, v: c.costo }, ...(medida ? [{ rot: W.vnr, v }] : [])];
  const estado = { caso: item.caso, marcas, desde, hasta, valor: x };
  if (x == null) return estado;
  if (!medida) return x === v ? { ...estado, cuadra: W.cuadra } : { ...estado, falla: W.dif(x, v, c.terminar ? W.queFabrica : W.queTienda) };
  return x === Math.min(v, c.costo) ? { ...estado, cuadra: W.menorBien } : { ...estado, falla: W.menorMal(x) };
}

export const CONSECUENCIA_C4 = {
  id: H7_ID,
  objeto: "La línea costo – VNR",
  modo: "hacer",
  items: itemsH7(),
  consecuencia,
};
