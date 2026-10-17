import { H5_ID, ITEMS_H5, CIFRAS_H5 as C, TARIFAS_H5 } from "../../data/contabilidadT7_2_h5.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T7-2 H5 «Flete y devolución» — la consecuencia, pura (D9).
 * Patrón de enganche C4 de Watari (patron-enganche-c4-v1.html, sección
 * «t72-h5»; f72.js). La pinta FiguraMapaDeMangle en FleteYDevolucion.jsx,
 * debajo de la figura acumulada del lote 5 (que no cambia).
 *
 * Objeto propio: el mapa de Mangle. Cada hecho es una flecha entre Proveedor,
 * Mangle y Cliente. En los ítems de cuenta, las cuentas del libro de Mangle
 * son las opciones (viven en la figura): el valor entra a la tocada, y la
 * cuenta dice qué le pasa. En los de cifra, la cifra escrita entra a la línea
 * del cálculo y la figura dice si cuadra.
 *
 * El asiento del hecho 4 sigue como en main («Arma la línea»): `propio`.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const pesosC4 = (n) => "$" + Math.round(n).toLocaleString("es-CO");
const pct = (n) => n.toLocaleString("es-CO", { maximumFractionDigits: 2 });

/* [W] pendiente de Near: rótulos del mapa, efectos de cada cuenta y textos de la consecuencia de Watari (f72.js), tal cual. */
export const TEXTOS_C4_H5 = {
  nodos: ["Proveedor", "Mangle", "Cliente"],
  flechas: [["Proveedor", "Mangle"], ["Mangle", "Cliente"], ["Mangle", "Proveedor"], ["Cliente", "Mangle"]],
  libro: "Libro de Mangle",
  efecto: {
    "Inventario de mercancías (fletes)": "Se suma al costo de lo que está en la bodega.",
    "Gasto de venta – fletes": "Va a los gastos de venta del periodo.",
    "Costo de mercancía vendida": "Pasa al costo de lo que ya se vendió.",
    "Inventario de mercancías": "Baja lo que hay en la bodega, a su costo.",
    Compras: "Compras no se usa en el permanente.",
    "Devoluciones de compras": "Devoluciones de compras no se usa en el permanente.",
  },
  fuera: "Ese no es el lugar de este valor en el libro de Mangle.",
  lineaPago: `${pesosC4(C.flete)} − retención ${TARIFAS_H5.transporte} %`,
  lineaBaja: `${pesosC4(C.devolucion)} + ${pesosC4(C.iva)} − ${pesosC4(C.retencion)}`,
  tuCifra: "Tu cifra:",
  retiene: (r, p) => `retiene ${pesosC4(r)} (${p} %)`,
  cuadra: "Cuadra.",
  tarifa: (p) => `Así retendría el ${p} %, y la tarifa es ${TARIFAS_H5.transporte} %.`,
  /* C4-3 de Mello (auditoria-mello-patron-c4.md), [W] pendiente de Near: el distractor que suma la retención (más que el flete) no muestra montos negativos. */
  sumaLaRetencion: "Así la retención se sumaría al pago en vez de restarse.",
  frenteNota: (x, base) => `${x > base ? "Sobran" : "Faltan"} ${pesosC4(Math.abs(x - base))} frente a la nota.`,
};
const T = TEXTOS_C4_H5;

const opcionDe = (it, v) => ({ id: String(v), t: typeof v === "number" ? pesosC4(v) : v, correcta: v === it.correcta,
  msg: it.distractores.find((d) => d.valor === v)?.retro ?? null, ...(typeof v === "number" ? { v } : {}) });

export const ITEMS_C4_H5 = ITEMS_H5.map((it) => (it.tipo === "asiento"
  ? { id: it.id, tipo: "propio", hecho: it.hecho, subtema: it.subtema, pregunta: it.pregunta, opciones: [] }
  : { id: it.id, tipo: it.tipo, hecho: it.hecho, subtema: it.subtema, pregunta: it.pregunta,
    opciones: [it.correcta, ...it.distractores.map((d) => d.valor)].map((v) => opcionDe(it, v)), bien: it.acierto }));

/* El valor que mueve cada hecho en el libro: el flete en los dos primeros; la devolución en el tercero, que sale (−). */
const montoDe = (hecho) => (hecho === 0 || hecho === 1 ? C.flete : C.devolucion);

export function consecuenciaH5(item, eleccion) {
  const [de, a] = T.flechas[item.hecho];
  const mapa = { de, a };
  if (item.tipo === "cifra") {
    const pago = item.id === "pago-a-la-transportadora";
    const linea = pago ? T.lineaPago : T.lineaBaja;
    if (eleccion == null || eleccion === "") return { mapa, linea, tuya: null };
    const x = Number(eleccion);
    const e = { mapa, linea, tuya: x };
    if (pago && x > C.flete) return { ...e, falla: T.sumaLaRetencion };
    if (pago) {
      const p = pct((100 * (C.flete - x)) / C.flete);
      const conRet = { ...e, retiene: T.retiene(C.flete - x, p) };
      return x === C.pago ? { ...conRet, cuadra: T.cuadra } : { ...conRet, falla: T.tarifa(p) };
    }
    return x === C.baja ? { ...e, cuadra: T.cuadra } : { ...e, falla: T.frenteNota(x, C.baja) };
  }
  if (eleccion == null) return { mapa, cuenta: null };
  const e = { mapa, cuenta: eleccion, mov: `${item.hecho === 2 ? "−" : "+"} ${pesosC4(montoDe(item.hecho))}`, efecto: T.efecto[eleccion] ?? "" };
  return item.opciones.find((o) => o.id === eleccion)?.correcta ? e : { ...e, falla: T.fuera };
}

export const CONSECUENCIA_C4 = {
  id: H5_ID,
  objeto: "El mapa de Mangle",
  modo: "hacer",
  items: ITEMS_C4_H5,
  consecuencia: consecuenciaH5,
};
