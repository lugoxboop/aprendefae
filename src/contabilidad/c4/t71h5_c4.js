import { ITEMS_H5, COSTO_O_GASTO, CUENTAS_H5, CIFRAS_H5, TARIFAS_H5 } from "../../data/contabilidadT7_1_h5.js";
import { pesosC4 as $, pctC4, opcionesDeNear, barajarFijo } from "./t71Comun.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T7-1 H5 «¿Costo o gasto?» (Hacer · D4 + D9). Objeto propio: la etiqueta
 * del costo de El Faro (Watari, sección t71-h5). Cada gasto entra a la
 * etiqueta del costo de la mercancía o a la bandeja de gastos, y los ya
 * resueltos se quedan en su sitio; el flete de $300.000 va a su cuenta; luego
 * se parte en retención y pago; al final, lo que se le debe al proveedor.
 *
 * Los ítems son los de Near (contabilidadT7_1_h5.js, con la corrección 4):
 * parte 1 con el par fijo (el ítem 1 con su acierto y su error; los ítems 2 a
 * 4, con su porqué en los dos casos, como en main), parte 2 con sus
 * distractores. Las cifras salen de CIFRAS_H5.
 * Rótulos cortos y textos de consecuencia: [W] pendiente de Near.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const C = CIFRAS_H5;
const textoCuenta = (v) => CUENTAS_H5.find((o) => o.valor === v)?.texto ?? v;

export const ITEMS_C4_H5 = ITEMS_H5.map((it) => {
  if (it.parte === 1) {
    return {
      id: it.id, subtema: it.subtema, parte: 1, texto: it.pregunta, pregunta: null,
      opciones: COSTO_O_GASTO.map((o) => ({ id: o.valor, t: o.texto, correcta: o.valor === it.correcta, msg: it.error ?? it.porque })),
      bien: it.acierto ?? it.porque,
    };
  }
  if (typeof it.correcta === "string") {
    return {
      id: it.id, subtema: it.subtema, parte: 2, texto: null, pregunta: it.pregunta,
      opciones: barajarFijo([{ id: it.correcta, t: textoCuenta(it.correcta), correcta: true }, ...it.distractores.map((d) => ({ id: d.valor, t: textoCuenta(d.valor), msg: d.retro }))], it.id),
      bien: it.acierto,
    };
  }
  return { id: it.id, tipo: "cifra", subtema: it.subtema, parte: 2, texto: null, pregunta: it.pregunta, opciones: opcionesDeNear(it), bien: it.acierto };
});

/* [W] pendiente de Near. */
export const W_H5 = {
  corto: { bodegaje: "Bodegaje en aduana", "factura-exterior": "Factura del exterior", "flete-comprador": "Flete del comprador", "flete-vendedor": "Flete del vendedor" },
  costo: "Costo de la mercancía",
  gasto: "Gastos",
  inventario: "Inventario, al cierre",
  flete: `Flete ${$(C.flete)}`,
  fallaGasto: "Así no sumaría al costo de la mercancía.",
  fallaInventario: "En el periódico, Inventario solo se toca al cierre.",
  fallaCosto: "Así se sumaría al costo de la mercancía.",
  partido: `El flete de ${$(C.flete)}, partido`,
  retencion: (r) => `Retención: ${r == null ? "$?" : $(r)}${r == null ? "" : ` · ${pctC4((100 * r) / C.flete)} % del flete`}`,
  pago: (p) => `A la transportadora: ${p == null ? "$?" : $(p)}`,
  cuadraRet: `Es el ${pctC4(TARIFAS_H5.transporte)} % del transporte.`,
  fallaRet: (r) => `Esa retención es el ${pctC4((100 * r) / C.flete)} % del flete; la del transporte es del ${pctC4(TARIFAS_H5.transporte)} %.`,
  /* Mello C4-3, literal de la auditoría ([W] pendiente de Near): un pago mayor que el flete es la retención sumada. */
  fallaPagoDeMas: "Así la retención se sumaría al pago en vez de restarse.",
  /* Mientras se escribe (Mello C4-1): la cifra en su renglón, sin porcentaje ni calificación. */
  retencionSola: (r) => `Retención: ${r == null ? "$?" : $(r)}`,
  deudaTitulo: "Lo que El Faro le debe al proveedor",
  deudaCuenta: `${$(C.mercancia)} + ${$(C.iva)} − ${$(C.retencion)}`,
  tuCifra: (x) => `Tu cifra: ${x == null ? "$?" : $(x)}`,
  cuadraDeuda: "Cuadra con la factura.",
  difDeuda: (x) => `${x > 0 ? "Sobran" : "Faltan"} ${$(Math.abs(x))} frente a la factura.`,
};

/* Dónde cae cada opción de la cuenta del flete. */
const DESTINO_FLETE = { "compras-fletes": "costo", "gasto-venta-fletes": "gasto", inventario: "inventario" };

/* Los gastos de la parte 1 que ya pasaron se quedan en su sitio correcto (la etiqueta se arma a lo largo de la actividad). */
const previos = (item) => {
  const k = ITEMS_C4_H5.findIndex((x) => x.id === item.id);
  return ITEMS_C4_H5.slice(0, Math.max(0, k)).filter((x) => x.parte === 1)
    .map((x) => ({ id: x.id, rotulo: W_H5.corto[x.id], destino: x.opciones.find((o) => o.correcta).id }));
};

function etiqueta(item, e) {
  const flete = item.id === "cuenta-flete";
  const destino = !e ? null : flete ? DESTINO_FLETE[e] : e;
  const correcto = flete ? DESTINO_FLETE[item.opciones.find((o) => o.correcta).id] : item.opciones.find((o) => o.correcta).id;
  const estado = {
    forma: "etiqueta", conInventario: flete, previos: previos(item),
    ficha: e ? { rotulo: flete ? W_H5.flete : W_H5.corto[item.id], destino } : null,
    correcto, rotuloCorrecto: flete ? W_H5.flete : W_H5.corto[item.id],
  };
  if (!e || destino === correcto) return estado;
  return { ...estado, falla: destino === "gasto" ? W_H5.fallaGasto : destino === "inventario" ? W_H5.fallaInventario : W_H5.fallaCosto };
}

function partido(item, x) {
  const ret = x == null ? null : item.id === "retencion-flete" ? x : C.flete - x;
  const pago = ret == null ? null : C.flete - ret;
  /* Ningún monto negativo en la figura (Mello C4-3): si el pago pasa del flete, la retención queda en $?. */
  const negativa = ret != null && ret < 0;
  const estado = { forma: "partido", titulo: W_H5.partido, escala: ret == null || negativa ? 0 : Math.min(1, ret / C.flete), retencion: W_H5.retencion(negativa ? null : ret), pago: W_H5.pago(pago), escrito: x };
  if (ret == null) return estado;
  if (ret === C.retencionFlete) return { ...estado, cuadra: W_H5.cuadraRet };
  if (negativa) return { ...estado, falla: W_H5.fallaPagoDeMas };
  return { ...estado, falla: W_H5.fallaRet(ret) };
}

function deuda(x) {
  const estado = { forma: "deuda", titulo: W_H5.deudaTitulo, cuenta: W_H5.deudaCuenta, tuya: W_H5.tuCifra(x), escrito: x };
  if (x == null) return estado;
  return x === C.debeProveedor ? { ...estado, cuadra: W_H5.cuadraDeuda } : { ...estado, falla: W_H5.difDeuda(x - C.debeProveedor) };
}

/* Mientras se escribe (Mello C4-1): la cifra solo en su lugar, sin calificar. */
export function escribiendoH5(item, x) {
  if (item.id === "retencion-flete") return { ...partido(item, null), retencion: W_H5.retencionSola(x) };
  if (item.id === "pago-transportadora") return { ...partido(item, null), pago: W_H5.pago(x) };
  return { ...deuda(null), tuya: W_H5.tuCifra(x) };
}

export const CONSECUENCIA_C4 = {
  id: "t71-h5",
  objeto: "La etiqueta del costo de El Faro",
  modo: "hacer",
  items: ITEMS_C4_H5,
  consecuencia(item, e) {
    if (item.parte === 1 || item.id === "cuenta-flete") return etiqueta(item, e ?? null);
    if (item.id === "retencion-flete" || item.id === "pago-transportadora") return partido(item, e ?? null);
    return deuda(e ?? null);
  },
};
