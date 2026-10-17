import { A1_ID, HECHOS, INICIO, INTERFAZ_C2 } from "../../data/contabilidadT7_2_a1_c2.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T7-2 A1 «La cuenta que sí se mueve» — la consecuencia, pura (D4).
 * Patrón de enganche C4 de Watari (patron-enganche-c4-v1.html, sección
 * «t72-a1»; f72.js). La pinta LaCuentaQueSiSeMueveC2.jsx en la pantalla 2.
 *
 * Objeto propio: la bodega y su cuenta. La bodega se mueve con el HECHO; la
 * cuenta, con el LADO tocado. Si el lado es el otro, el saldo deja de cuadrar
 * con las cajas, antes de la pista (lo que pidió Mello).
 *
 * Los cinco hechos se ubican en orden y cada uno se acierta antes de seguir
 * (escalera C2), así que las cajas de antes de cada hecho son fijas: INICIO
 * más lo de los hechos anteriores (5 → 8 → 6 → 7 → 6 → 5).
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* [W] pendiente de Near: los textos de la consecuencia son de Watari (f72.js), tal cual. */
export const TEXTOS_C4_A1 = {
  cuadra: "La cuenta y la bodega dicen lo mismo.",
  falla: (bodega, cuenta) => `No cuadra: la bodega tiene ${bodega} cajas y la cuenta dice ${cuenta}.`,
};

const signo = (lado) => (lado === "debe" ? 1 : -1);

export const ITEMS_C4_A1 = HECHOS.map((h, k) => ({
  id: h.id, texto: h.texto, pregunta: null, cajas: h.cajas, lado: h.lado,
  antes: INICIO + HECHOS.slice(0, k).reduce((n, x) => n + signo(x.lado) * x.cajas, 0),
  opciones: [{ id: "debe", t: INTERFAZ_C2.ladoDebe }, { id: "haber", t: INTERFAZ_C2.ladoHaber }]
    .map((o) => ({ ...o, correcta: o.id === h.lado, msg: h.devolucion })),
}));

/* Las cajas de la bodega y de la cuenta con el lado tocado; el renglón cae en ese lado. */
export function consecuenciaA1(item, lado) {
  if (lado == null) return { bodega: item.antes, cuenta: item.antes, renglon: null };
  const bodega = item.antes + signo(item.lado) * item.cajas;
  const cuenta = item.antes + signo(lado) * item.cajas;
  const e = { bodega, cuenta, renglon: { lado, cajas: item.cajas } };
  return bodega === cuenta ? { ...e, cuadra: TEXTOS_C4_A1.cuadra } : { ...e, falla: TEXTOS_C4_A1.falla(bodega, cuenta) };
}

export const CONSECUENCIA_C4 = {
  id: A1_ID,
  objeto: "La bodega y su cuenta",
  modo: "aprender",
  items: ITEMS_C4_A1,
  consecuencia: consecuenciaA1,
};
