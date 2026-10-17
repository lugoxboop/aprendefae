import { H2_ID, ITEMS_H2, CIFRAS_H2 as C } from "../../data/contabilidadT7_2_h2.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T7-2 H2 «Arma los dos asientos» — la consecuencia, pura (D9).
 * Patrón de enganche C4 de Watari (patron-enganche-c4-v1.html, sección
 * «t72-h2»; f72.js). La pinta FiguraVentaDosCaras en ArmaLosDosAsientos.jsx.
 *
 * Objeto propio: la venta por sus dos caras, la factura (lo que se cobra) y
 * la bodega (lo que costó). La cifra escrita entra a «Debe el cliente»; el
 * valor tocado sale de Inventario. Si no es el bueno, la figura lo dice.
 *
 * Los asientos (ítems 2 y 4) siguen como en main («Arma la línea»): son
 * `propio` y no entran a la regla (lo que no entra, según Watari).
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* El formato de las cifras de Watari ($ y punto de miles). */
export const pesosC4 = (n) => "$" + Math.round(n).toLocaleString("es-CO");

/* [W] pendiente de Near: rótulos de la figura y textos de la consecuencia de Watari (f72.js), tal cual. */
export const TEXTOS_C4_H2 = {
  factura: "Factura · lo que se cobra",
  venta: "Venta",
  iva: "+ IVA",
  retencion: "− Retención",
  cliente: "= Debe el cliente",
  bodega: "Bodega · lo que costó",
  costo: "Mercancía vendida, al costo",
  sale: "Sale de Inventario",
  cuadraFactura: "Cuadra con la factura.",
  frenteFactura: (x) => `${x > C.cliente ? "Sobran" : "Faltan"} ${pesosC4(Math.abs(x - C.cliente))} frente a la factura.`,
  cuadraCosto: "Sale lo que costó.",
  masDeLoQueCosto: (x) => `Así sale ${pesosC4(x)}: más de lo que costó.`,
};

const opcion = (it, v) => ({ id: String(v), v, t: pesosC4(v), correcta: v === it.correcta, msg: it.distractores.find((d) => d.valor === v)?.retro ?? null });

export const ITEMS_C4_H2 = ITEMS_H2.map((it) => (it.tipo === "asiento"
  ? { id: it.id, tipo: "propio", subtema: it.subtema, pregunta: it.pregunta, opciones: [] }
  : { id: it.id, tipo: it.tipo, subtema: it.subtema, pregunta: it.pregunta,
    opciones: [it.correcta, ...it.distractores.map((d) => d.valor)].map((v) => opcion(it, v)), bien: it.acierto }));

const PRIMERO = ITEMS_H2.findIndex((x) => x.id === "debe-cliente");

/*
 * eleccion: la cifra COMPROBADA (número) en «debe-cliente»; el id de la
 * opción (o su valor) en «valor-del-costo». null: sin responder. Mientras se
 * escribe, la figura solo muestra la cifra (C4-1 de Mello): esto no se llama
 * con lo que se va tecleando.
 */
export function consecuenciaH2(item, eleccion) {
  const k = ITEMS_H2.findIndex((x) => x.id === item.id);
  /* Lo que ya quedó resuelto antes: el total de la factura, desde el ítem que lo pide. */
  /*
   * Lo que delata la respuesta no se ve hasta que el ítem se responde (decisión del coordinador sobre la auditoría
   * de Mello del C4): en el ítem 1, el IVA y la retención; el costo, hasta que se responde el ítem 3.
   */
  const respondido = eleccion != null && eleccion !== "";
  const antes = k <= PRIMERO && !respondido;
  const factura = { venta: C.venta, iva: antes ? null : C.iva, retencion: antes ? null : C.retencion, cliente: k > PRIMERO ? C.cliente : null };
  const base = { factura, bodega: { costo: null, sale: null }, activa: null };
  if (!respondido) return base;
  const x = Number(eleccion);
  if (item.id === "debe-cliente") {
    const e = { ...base, factura: { ...factura, cliente: x }, activa: "cliente" };
    return x === C.cliente ? { ...e, cuadra: TEXTOS_C4_H2.cuadraFactura } : { ...e, falla: TEXTOS_C4_H2.frenteFactura(x) };
  }
  const e = { ...base, bodega: { costo: C.costo, sale: x }, activa: "sale" };
  return x === C.costo ? { ...e, cuadra: TEXTOS_C4_H2.cuadraCosto } : { ...e, falla: TEXTOS_C4_H2.masDeLoQueCosto(x) };
}

export const CONSECUENCIA_C4 = {
  id: H2_ID,
  objeto: "La venta por sus dos caras",
  modo: "hacer",
  items: ITEMS_C4_H2,
  consecuencia: consecuenciaH2,
};
