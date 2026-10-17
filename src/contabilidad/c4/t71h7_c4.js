import { CASOS_H7, CONTROLES_H7 } from "../../data/contabilidadT7_1_h7.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T7-1 H7 «¿Qué control falta?» (Hacer · D4). Objeto propio: el plano de
 * la bodega (Watari, sección t71-h7). Los controles son lugares del plano: el
 * que se toca se instala, y el riesgo del caso queda cubierto o sigue
 * abierto.
 *
 * Los casos son los de Near (contabilidadT7_1_h7.js, con la D y H7-1/H7-2 de
 * Mello), tal cual: texto, punto, las siete opciones en su orden, la línea de
 * cada distractor, el porqué del libro y el pie.
 * Las zonas del plano y la consecuencia: [W] pendiente de Near.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* [W] pendiente de Near: dónde vive cada control en el plano, y las frases del riesgo. */
export const ZONAS_H7 = ["Muelle", "Estantes", "Muros", "Oficina", "Salida"];
export const LUGAR_H7 = { almacen: "Muros", poliza: "Oficina", conteos: "Estantes", comparar: "Oficina", azar: "Estantes", recepcion: "Muelle", requisicion: "Salida" };
export const W_H7 = {
  riesgo: (punto) => `Riesgo: ${punto}`,
  cubierto: " · cubierto",
  abierto: " · sigue abierto",
  /* Mello C4-5: el verbo concuerda con el número del punto («los estantes siguen»). */
  falla: (punto) => `Con ese control, ${punto} ${/^(los|las) /.test(punto) ? "siguen" : "sigue"} igual.`,
};

export const ITEMS_C4_H7 = CASOS_H7.map((c) => ({
  id: c.id,
  subtema: c.subtema,
  texto: c.texto,
  pregunta: null,
  punto: c.punto,
  opciones: CONTROLES_H7.map((o) => ({ id: o.valor, t: o.texto, correcta: o.valor === c.correcta, msg: c.porQueNo[o.valor] ?? null })),
  bien: null,
  porque: c.porque,
  pie: c.pie,
}));

export const CONSECUENCIA_C4 = {
  id: "t71-h7",
  objeto: "El plano de la bodega",
  modo: "hacer",
  items: ITEMS_C4_H7,
  consecuencia(item, e) {
    const o = item.opciones.find((x) => x.id === e) ?? null;
    const estado = { riesgo: W_H7.riesgo(item.punto), instalado: o?.id ?? null, zona: o ? LUGAR_H7[o.id] : null };
    if (!o) return { ...estado, cubierto: null };
    if (o.correcta) return { ...estado, cubierto: true, riesgo: W_H7.riesgo(item.punto) + W_H7.cubierto };
    return { ...estado, cubierto: false, riesgo: W_H7.riesgo(item.punto) + W_H7.abierto, falla: W_H7.falla(item.punto) };
  },
};
