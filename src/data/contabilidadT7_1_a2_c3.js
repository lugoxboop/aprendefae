/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · A2 DE APRENDER — «La factura completa», en el Patrón de enganche C3
 * de Watari (orquestador/conocimiento/paquetes/patron-enganche-c3-v1.html,
 * sección «a2»; 16-oct-2026), montada sobre el motor C3 de la célula
 * (components/mecanicas/libros/t7/aprenderC3.jsx).
 *
 * Reemplaza a la pieza de la v2 de Near (contabilidadT7_1_ap2.js, que se
 * queda: otras pruebas la leen) con el mismo id y en la misma posición.
 *
 * DE DÓNDE SALE CADA TEXTO
 *   · Los de Near, de main: se IMPORTAN de contabilidadT7_1_ap2.js (pistas,
 *     opciones, devoluciones, aciertos, porqués, resumen, pies). No se copian.
 *   · Los recortes [R] de Watari (tres textos de pantalla): literales de su
 *     código de referencia, que Mello auditó.
 *   · Los rótulos [W]: los de Near (c3-rotulos-near.md, «## A2»), letra por
 *     letra, en ROTULOS_A2.
 *   · M-1 de Mello (en el motor): el lado a lado separa `consigna` de
 *     `pregunta`; la consigna es la de Near, que deja la de Watari tal cual.
 * Una prueba compara todo, en los dos sentidos, con el código de referencia
 * corregido por Mello (correccionesMelloC3A2.mjs) y con los rótulos de Near
 * (correccionesNearC3A2.mjs).
 *
 * EL §5 DE MELLO, RESUELTO POR NEAR (c3-mello-near.md, en TEXTOS_A2): la
 * portada en una oración (N-3) y, en el lado a lado (N-1 y N-2), la
 * pregunta, las tres opciones, la pista y el acierto. Las devoluciones del
 * lado a lado siguen siendo las de main.
 * Van con el texto actual de main hasta que Near los entregue.
 *
 * Pieza de Aprender: cero FP, no entra al catálogo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { AP2_ID, PIEZA_LA_FACTURA_COMPLETA, FECHA, COMPRAS_RESUELTA, BOTON } from "./contabilidadT7_1_ap2.js";

export { AP2_ID };

/* La pieza de main, pantalla por pantalla (los textos de Near). */
const MAIN = Object.fromEntries(PIEZA_LA_FACTURA_COMPLETA.pantallas.map((p) => [p.id, p]));
/* `t` es el nombre del motor; `texto`, el de main, que leen las pruebas compartidas (escalera-ayuda). Son la misma cadena. */
const opcion = (o) => (o.correcta ? { id: o.id, t: o.texto, texto: o.texto, correcta: true } : { id: o.id, t: o.texto, texto: o.texto, devolucion: o.devolucion });
/* Una línea de main («Cuenta · $monto» o «· $?»): la cuenta, y el monto del asiento resuelto de main. */
function linea(P, l) {
  const cuenta = l.texto.split(" · ")[0];
  const monto = l.texto.endsWith("$?") ? null : P.acierto.asiento.lineas.find((x) => x.cuenta === cuenta).monto;
  return { id: l.id, cuenta, monto, lado: l.lado, pista: l.pista, devolucion: l.devolucion };
}
/* Lo que la línea de «$?» muestra al resolver: su monto en el asiento de main. */
const resuelto = (P) => Object.fromEntries(P.lineas.filter((l) => l.texto.endsWith("$?")).map((l) => {
  const cuenta = l.texto.split(" · ")[0];
  return [l.id, P.acierto.asiento.lineas.find((x) => x.cuenta === cuenta).monto];
}));
const lados = (P) => ({ lineas: P.lineas.map((l) => linea(P, l)), resuelto: resuelto(P), bien: P.acierto.textos[0], porque: P.acierto.textos.slice(1).join(" ") });

/* ═══════════ LOS RÓTULOS [W], DE NEAR (c3-rotulos-near.md, «## A2») ═══════════ */

export const ROTULOS_A2 = {
  sumarIva: "Sumar el IVA",
  descontarRetencion: "Descontar la retención",
  facturaCompra: "Factura de compra · La Reventa",
  facturaVenta: "Factura de venta · La Reventa",
  debeCompra: "La Reventa le debe al proveedor",
  /* Near lo escribe para la venta, pero la figura de Watari no tiene ese renglón en la venta (solo el cálculo): no se pinta. Anotado. */
  debeVenta: "El cliente le debe a La Reventa",
  dian: "Para la Dirección de Impuestos",
  asientoCompra: "Asiento de la compra · 16 de abril",
  asientoVenta: "Asiento de la venta · 20 de abril",
  compra: "Compra",
  venta: "Venta",
  consignaLadoALado: "Cambia entre la compra y la venta y mira los dos impuestos.",
};

/* ═══════════ LO DE WATARI QUE NO ES [W] (su código de referencia, literal) ═══════════ */

export const FIGURA_A2 = {
  mercancia: "Mercancía",
  masIva: "+ IVA (16 %)",
  menosRetencion: "− Retención (3,5 %)",
  vacio: "—",
  pendiente: "$?",
  /* A2-1 de Mello: «, sobre la mercancía sin el IVA» solo con la base acertada. */
  tarifa: (conBase) => `IVA 16 % y retención 3,5 %${conBase ? ", sobre la mercancía sin el IVA" : ""}. Tarifas del libro, no las de hoy.`,
  ventaIva: "+ IVA",
  ventaRetencion: "− retención",
  /* Solo lector de pantalla. */
  nombreFactura: "Factura de la compra, 16 de abril",
  nombreBases: "Sobre qué valor",
  nombreRoles: "Ver el asiento de",
};

/* Las cifras de la factura de la compra y de la venta (las de main). */
export const CIFRAS_A2 = { mercancia: 5000000, iva: 800000, retencion: 175000, proveedores: 5625000, venta: 2000000, ivaVenta: 320000, anticipo: 70000 };

/* ═══════════ LAS PANTALLAS ═══════════ */

/* ═══════════ LOS TEXTOS DEL §5, DE NEAR (c3-mello-near.md), LETRA POR LETRA ═══════════ */

export const TEXTOS_A2 = {
  /* N-3 · la portada, en una oración (la propuesta de Mello). */
  portada: "Al terminar, sabrás armar el asiento de una compra y de una venta con IVA y retención, y por qué cambian de lado.",
  /* N-1 y N-2 · el lado a lado. */
  pregunta: "¿Por qué la retención cambia de lado?",
  opciones: { "quien-la-debe": "Depende de quién descuenta la retención.", "siempre-se-resta": "La retención siempre se resta del total.", "tarifa-distinta": "En la venta, la tarifa es distinta." },
  pista: "Mira qué hace La Reventa con la retención en la compra, y qué le pasa en la venta.",
  acierto: "Exacto. En la compra, La Reventa la descuenta y la debe. En la venta se la descuentan: es un anticipo.",
};

const PORTADA = { id: "portada", tipo: "portada", texto: TEXTOS_A2.portada, boton: BOTON.empezar, pie: MAIN.portada.pie };

/* [R] Los dos primeros párrafos de Near, en dos frases (Watari). Las tarifas pasan a rótulo de la factura. */
const DOS_IMPUESTOS = {
  id: "dos-impuestos", tipo: "lectura",
  texto: "Quien vende le cobra al cliente un impuesto encima del precio: el IVA. Y quien compra le descuenta una parte del pago: la retención en la fuente.",
  listo: (s) => s.fig.iva && s.fig.ret, pie: MAIN["dos-impuestos"].pie,
};

/* La primera frase del enunciado de Near y su pregunta (Watari). Los corchetes de la base van en la figura. */
const B = MAIN["base-de-la-retencion"];
const BASE_DE_LA_RETENCION = {
  id: "base-de-la-retencion", tipo: "eleccion", enFigura: true,
  texto: "El 16 de abril, La Reventa Ltda. le compra mercancía a un proveedor por $5.000.000, a crédito. ¿Sobre qué valor se calcula la retención?",
  pista: B.pista, opciones: B.opciones.map(opcion), bien: B.acierto.textos[0], pie: B.pie,
};

const C = MAIN["lados-de-la-compra"];
const LADOS_DE_LA_COMPRA = { id: "lados-de-la-compra", tipo: "lados", texto: C.consigna, ...lados(C), pie: C.pie };

/* [R] El enunciado de la venta en una frase (Watari); los cálculos de Near van como renglón de la factura de la venta. */
const V = MAIN["la-venta"];
const LA_VENTA = {
  id: "la-venta", tipo: "lados",
  texto: "El 20 de abril, La Reventa le vende mercancía a un cliente por $2.000.000, a crédito. Ahora el cliente es quien descuenta la retención.",
  ...lados(V), pie: V.pie,
};

/* Los textos de Near del §5; las devoluciones, las de main. */
const L = MAIN["lado-a-lado"];
const conTextoNuevo = (o) => ({ ...opcion(o), t: TEXTOS_A2.opciones[o.id], texto: TEXTOS_A2.opciones[o.id] });
const LADO_A_LADO = {
  id: "lado-a-lado", tipo: "eleccion", texto: "", consigna: ROTULOS_A2.consignaLadoALado, pregunta: TEXTOS_A2.pregunta,
  pista: TEXTOS_A2.pista, opciones: L.opciones.map(conTextoNuevo), antes: (s) => Boolean(s.fig.vioRoles), bien: TEXTOS_A2.acierto, pie: L.pie,
  /* El canon ve la venta antes de tocar una opción (la pregunta sale después). */
  pasosAntes: ['[data-rol="venta"]'],
};

const R = MAIN.resumen;
const RESUMEN = { id: "resumen", tipo: "resumen", lista: R.parrafos, siguiente: R.siguiente, boton: "Siguiente pieza", pie: R.pie };

export const FECHAS_A2 = FECHA;
export const COMPRAS_A2 = COMPRAS_RESUELTA;

export const PIEZA_A2_C3 = {
  id: AP2_ID,
  numero: PIEZA_LA_FACTURA_COMPLETA.numero,
  titulo: PIEZA_LA_FACTURA_COMPLETA.titulo,
  clase: "a2",
  fig: { iva: false, ret: false, rol: "compra", vioRoles: false, ultimo: null },
  pantallas: [PORTADA, DOS_IMPUESTOS, BASE_DE_LA_RETENCION, LADOS_DE_LA_COMPRA, LA_VENTA, LADO_A_LADO, RESUMEN],
};
