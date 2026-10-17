import { VENTAS_T5_A2, OPCIONES_CAPA_3_T5_A2, PREGUNTA_CAPA_3_T5_A2, PISTA_CAPA_3_T5_A2 } from "../../data/contabilidadT5Pieza2.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T5 P2 «Tres momentos» · capa 3 — la consecuencia, pura (D4).
 * Patrón de enganche C4 de Watari (patron-enganche-c4-v1.html, #t5-p2).
 *
 * Objeto propio: las ventas y su diferencia. La diferencia de cada título
 * (lo que recibe menos lo que costó, sin signo) cae en «Ganancia», en
 * «Pérdida» o en «Sin diferencia», la que diga la opción tocada; Inversiones
 * – títulos sale siempre por el costo. Mello pidió «lo mismo» que en P1.
 *
 * Las cifras salen de las cajas de main («Costó $650 cada uno», «Se vende a
 * $690»): ninguna cifra nueva. Sin montos negativos: la diferencia va sin
 * signo y la zona dice si es ganancia o pérdida.
 *
 * [W] pendiente de Near: los rótulos de las zonas, la línea de la venta, la
 * de Inversiones – títulos, «por título» y las frases de `falla`/`cuadra` son
 * de Watari (codigo-f5, t5-p2), sin revisar por Near.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const pesos = (n) => `$${Math.round(n).toLocaleString("es-CO")}`;
const cifraDe = (t) => Number(String(t).replace(/\D/g, ""));

/* [W] pendiente de Near · los rótulos y las líneas de la figura. */
export const FIGURA_P2_C4 = {
  zonas: { ganancia: "Ganancia", perdida: "Pérdida", "ni-una": "Sin diferencia" },
  venta: (nombre, recibe, costo) => `${nombre} · recibe ${pesos(recibe)}, costó ${pesos(costo)}`,
  sale: (costo) => `Inversiones – títulos sale por ${pesos(costo)} cada uno.`,
  porTitulo: (d) => `${pesos(d)} por título`,
};
/* [W] pendiente de Near · lo que implica cada opción. */
export const NOTA_P2_C4 = {
  cuadra: "La diferencia queda donde corresponde.",
  ninguna: (d) => `Así los ${pesos(d)} de cada título no van a ninguna cuenta.`,
  otra: (d, zona) => `Así los ${pesos(d)} de cada título van a ${zona === "ganancia" ? "ganancia" : "pérdida"}.`,
};

const ITEMS = VENTAS_T5_A2.map((v) => ({
  id: v.id, subtema: v.nombre, texto: `${v.cifras.join(". ")}.`, pregunta: PREGUNTA_CAPA_3_T5_A2, pista: PISTA_CAPA_3_T5_A2, bien: v.revela,
  costo: cifraDe(v.cifras[0]), recibe: cifraDe(v.cifras[1]),
  opciones: OPCIONES_CAPA_3_T5_A2.map((o) => ({ id: o.id, t: o.texto, correcta: o.id === v.correcta })),
}));

export const CONSECUENCIA_C4 = {
  id: "t5-p2",
  objeto: "Las ventas y su diferencia",
  modo: "aprender",
  items: ITEMS,
  consecuencia(item, eleccion) {
    const d = Math.abs(item.recibe - item.costo);
    const base = { venta: item.id, costo: item.costo, recibe: item.recibe, diferencia: d };
    if (eleccion == null) return { ...base, zona: null };
    const o = item.opciones.find((x) => x.id === eleccion);
    if (o.correcta) return { ...base, zona: eleccion, cuadra: NOTA_P2_C4.cuadra };
    return { ...base, zona: eleccion, falla: eleccion === "ni-una" ? NOTA_P2_C4.ninguna(d) : NOTA_P2_C4.otra(d, eleccion) };
  },
};

export function consecuenciaP2(ventaId, opcionId) {
  const item = ITEMS.find((x) => x.id === ventaId);
  return item ? CONSECUENCIA_C4.consecuencia(item, opcionId) : null;
}
export const itemP2 = (ventaId) => ITEMS.find((x) => x.id === ventaId) ?? null;
