import { A5_ID, CIFRAS, PIEZA_IMPORTADOS_Y_FLETES as A5_DE_HOY } from "./contabilidadT7_1_a5.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · A5 DE APRENDER — «Importados y fletes», RENOVADA CON EL PATRÓN DE
 * ENGANCHE C3 de Watari (patron-enganche-c3-v1.html, sección «a5», 16-oct).
 * La monta ImportadosYFletesC3.jsx sobre el motor de la célula (aprenderC3.jsx).
 *
 * Textos: los del código de Watari, letra por letra ([R] = el texto de Near
 * recortado por Watari), con encima:
 *   · los rótulos [W] de Near (c3-rotulos-near.md, «## A5»), y su cambio de
 *     «en dólares» por «en moneda extranjera»
 *   · A5-1 de Mello (auditoria-mello-patron-c3.md §3): sin rótulo sobre el
 *     selector, el grupo se llama «Empresa» y los botones son «Santa Martha»
 *     y «La Popa»
 *   · M-1 de Mello: la consigna del lado a lado va aparte de la pregunta
 * Una prueba lo compara todo, letra por letra, contra esos tres paquetes
 * (correccionesNearC3A5.mjs).
 *
 * La pantalla «FOB y C&F» (`fob-cif-cyf`, «El viaje de la compra») es LA DE
 * HOY, el mismo objeto de contabilidadT7_1_a5.js: C1 de Near con F-1, F-2 y
 * F-3 de Mello (condición 2 de la auditoría del C3). Ahora va dentro del motor.
 *
 * Las opciones llevan `texto` y `t` (el mismo texto): ver `opciones` abajo.
 *
 * El lado a lado lleva los textos de Near con Mello (c3-mello-near.md): la
 * consigna de N-4 y las opciones de N-2.
 *
 * Pieza de Aprender: cero FP, no entra al catálogo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export { A5_ID };

/* La pantalla de hoy, sin tocar (C1 + F-1 a F-3). */
export const VIAJE_DE_LA_COMPRA = A5_DE_HOY.pantallas.find((p) => p.id === "fob-cif-cyf");

/* Las cifras del flete, de la pieza de hoy (650.000 × 1 % = 6.500; 650.000 − 6.500 = 643.500). */
export const FLETE_A5 = { flete: CIFRAS.flete, retencion: CIFRAS.retencionFlete, pago: CIFRAS.pagoFlete };

/* Lo que dicen las figuras: de Watari, con los [W] de Near y A5-1 de Mello. */
export const FIGURA_A5 = {
  opciones: "Opciones",
  /* La etiqueta del costo. */
  etiqueta: "Costo de la mercancía",
  factura: "El valor de la factura del proveedor del exterior",
  /* Near: «en moneda extranjera», no «en dólares» (el libro no nombra la moneda). */
  facturaMoneda: "en moneda extranjera",
  facturaEnPesos: "El valor de la factura del proveedor del exterior, pasado a pesos",
  facturaTasa: "con la tasa de cambio del día de la compra",
  capas: ["Los aranceles, el bodegaje y las comisiones de aduana", "Los fletes, cuando los asume el comprador", "Cualquier otro gasto relacionado con la compra"],
  hueco: "¿Qué más se suma?",
  pasarAPesos: "Pasar a pesos",
  /* El camino del flete. */
  ruta: "El flete del 18 de marzo",
  vende: "vende",
  compra: "compra",
  comprador: "Santa Martha",
  asume: "18 de marzo · asume el flete:",
  flete: "Flete",
  tarifas: "Inventario periódico. Retención por transporte: 1 %. Tarifas del libro, no las de hoy.",
  cuentasDe: { "Santa Martha": "Cuentas de Santa Martha", "La Popa": "Cuentas de La Popa" },
  asiento: "Asiento del flete · 18 de marzo",
  retencion: "Retención en la fuente por pagar · 1 %",
  pago: "Caja o Bancos · a la transportadora",
  /* El lado a lado (A5-1 de Mello: sin rótulo arriba, «Empresa», «Santa Martha» y «La Popa»). */
  empresa: "Empresa",
  empresas: { comprador: "Santa Martha", vendedor: "La Popa" },
  columnas: ["Parte del costo", "Gasto de venta"],
  pagado: "pagado ese día",
  cuentas: { comprador: "Compras (fletes)", vendedor: "Gasto de venta – fletes" },
};

/*
 * Las opciones llevan `texto` (como el resto de los datos de la célula, y como
 * las leen las pruebas compartidas) y `t`, el mismo texto, que es como el
 * motor C3 las nombra (y por lo que canonEnganche.js reconoce una pantalla del
 * motor).
 */
const opciones = (...os) => os.map((o) => ({ ...o, t: o.texto }));

/* ═══════════ LAS PANTALLAS, EN ORDEN (las de hoy, con el mismo id y lugar) ═══════════ */

const PORTADA = {
  id: "portada",
  tipo: "portada",
  texto: "Saber qué forma parte del costo de lo comprado, también si es importado, y registrar un flete según quién lo asume.",
  boton: "Empezar",
  pie: "Basado en el libro, pp. 208 y 227-229",
};

/* [R] Los dos párrafos de Near, sin «El libro da una regla.». La lista de importados llega con el acierto de la siguiente (C1). */
const LA_REGLA = {
  id: "la-regla-del-costo",
  tipo: "lectura",
  texto: "Todo gasto directo que hace falta para tener la mercancía lista para la venta forma parte de su costo. Por eso el costo de lo comprado no es solo el valor de la factura.",
  pie: "Basado en el libro, pp. 208 y 228",
};

/* [R] El párrafo de Near pasa a la etiqueta; la pregunta, letra por letra. */
const IMPORTADOS = {
  id: "importados",
  tipo: "eleccion",
  enFigura: true,
  texto: "Una empresa trae mercancía del exterior. ¿Cuál de estos gastos forma parte del costo de esa mercancía?",
  pista: "El costo incluye todo lo que hay que pagar para tener lista la mercancía. ¿Cuál de estos lo cumple?",
  opciones: opciones(
    { id: "aranceles", texto: "Los aranceles que paga en la aduana.", correcta: true },
    { id: "administracion", texto: "Los gastos de administración del mes.", devolucion: "Los gastos de administración van aparte en el estado de resultados. No forman parte del costo de la mercancía." },
    { id: "ninguno", texto: "Ninguno: el costo es solo el valor de la factura.", devolucion: "El libro suma al costo más que la factura: también los aranceles y los fletes que asume el comprador." },
  ),
  bien: "Así es. Los aranceles se pagan para poder tener la mercancía, así que el libro los suma a su costo.",
  pie: "Basado en el libro, pp. 208, 214 y 228",
};

/* [R] El enunciado de Near en dos frases; la fecha, la ficha de cinco datos y las tarifas pasan a la figura. */
const FLETE_COMPRADOR = {
  id: "flete-del-comprador",
  tipo: "eleccion",
  enFigura: true,
  desde: "Un proveedor",
  quien: "Santa Martha",
  rolQuien: "el comprador",
  texto: "Santa Martha compra mercancía a crédito por $7.500.000, más el IVA. Asume el flete de $650.000 y lo paga ese mismo día. ¿En qué cuenta va el flete en el debe?",
  pista: "Para Santa Martha, este flete es parte del costo de su mercancía. Piensa qué cuenta guarda ese costo en el periódico.",
  opciones: opciones(
    { id: "compras-fletes", texto: "Compras (fletes)", correcta: true },
    { id: "gasto-de-venta", texto: "Gasto de venta – fletes", devolucion: "Ese es el flete que asume el vendedor. Aquí lo asume el comprador, y el libro lo suma al costo: va a Compras." },
    { id: "inventario", texto: "Inventario de mercancías", devolucion: "En el periódico, lo que se suma al costo de lo comprado va a Compras, no a Inventario de mercancías." },
  ),
  /* [R] La segunda frase del acierto de Near («le retiene el 1 %… le paga $643.500») la dibuja el asiento que se parte. */
  bien: "Así es. El flete que asume el comprador se anota en Compras, porque es un gasto necesario para tener la mercancía lista para la venta.",
  pie: "Basado en el libro, pp. 228-229",
};

const FLETE_VENDEDOR = {
  id: "flete-del-vendedor",
  tipo: "eleccion",
  enFigura: true,
  desde: "La Popa",
  quien: "La Popa",
  rolQuien: "el vendedor",
  texto: "Ahora el flete lo asume quien vende: La Popa le vende a Santa Martha a crédito y paga el flete de $650.000 ese mismo día. ¿En qué cuenta lo anota La Popa?",
  pista: "Para La Popa, esa mercancía ya se vendió. Ese flete no le suma costo a nada que vaya a vender.",
  opciones: opciones(
    { id: "gasto-de-venta", texto: "Gasto de venta – fletes", correcta: true },
    { id: "compras-fletes", texto: "Compras (fletes)", devolucion: "La Popa no está comprando: está vendiendo. Para quien vende, el flete es un gasto de venta." },
    { id: "ingresos", texto: "Ingresos por ventas", devolucion: "El flete es algo que La Popa paga, no algo que cobra. Por eso no va a Ingresos por ventas." },
  ),
  bien: "Así es. Cuando el vendedor paga el flete, el libro lo trata como un gasto de venta. Al cierre se pasa a Ganancias y pérdidas.",
  pie: "Basado en el libro, p. 229",
};

/*
 * M-1: la consigna se ve hasta que sale la pregunta (al ver La Popa).
 * La consigna (N-4, la de Mello) y las dos opciones que no son la correcta
 * (N-2): c3-mello-near.md, «## A5 · lado a lado».
 */
const LADO_A_LADO = {
  id: "lado-a-lado",
  tipo: "eleccion",
  /* La pregunta sale después de tocar La Popa (M-1): así la recorre la barra de enganche. */
  pasosAntes: ['[data-asume="vendedor"]'],
  consigna: "Cambia de empresa y mira a dónde va el flete.",
  pregunta: "¿Qué decide si el flete es parte del costo o es un gasto?",
  pista: "Compara las dos columnas de la tabla: ¿qué dato cambia de una a otra?",
  opciones: opciones(
    { id: "quien-lo-asume", texto: "Quién lo asume: el comprador o el vendedor.", correcta: true },
    { id: "valor", texto: "Cuánto vale el flete en cada caso.", devolucion: "Los dos fletes valen lo mismo, $650.000, y aun así van a cuentas distintas. El valor no decide." },
    { id: "contado-o-credito", texto: "Si se paga de contado o a crédito.", devolucion: "Los dos fletes se pagaron el mismo día y de la misma forma, y aun así van a cuentas distintas." },
  ),
  bien: "Exacto. Si lo asume el comprador, es parte del costo. Si lo asume el vendedor, es un gasto de venta.",
  pie: "Basado en el libro, pp. 228-229",
};

const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  boton: null,
  lista: [
    "Lo que forma parte del costo es todo lo necesario para tener la mercancía lista para la venta.",
    "Si el comprador asume el flete, el libro lo suma al costo de lo comprado: va a Compras.",
    "Si el vendedor asume el flete, es un gasto de venta.",
  ],
  siguiente: "Siguiente: «Devoluciones en periódico».",
  pie: "Basado en el libro, pp. 208 y 228-229",
};

/* ═══════════ LA PIEZA ═══════════ */

export const PIEZA_IMPORTADOS_Y_FLETES_C3 = {
  id: A5_ID,
  numero: A5_DE_HOY.numero,
  titulo: A5_DE_HOY.titulo,
  pantallas: [PORTADA, LA_REGLA, IMPORTADOS, VIAJE_DE_LA_COMPRA, FLETE_COMPRADOR, FLETE_VENDEDOR, LADO_A_LADO, RESUMEN],
};

