/*
 * ═══════════════════════════════════════════════════════════════════════════
 * REPASO DEL CAPÍTULO 5 · r5-4 «Septiembre en Barranquilla» — LAS CIFRAS
 * (Célula E).
 *
 * El 6 del bloque D, pp. 273-274, en diez asientos (paquete e5-r5-4-v1:
 * Takamura quitó los fletes del 25 y del 28). Solo sistema periódico, sin IVA
 * ni retención. Aquí solo hay datos y cifras: los textos van en
 * repasoCap5BarranquillaTextos.js.
 *
 * Las cifras se CALCULAN, no se transcriben: unidades × precio, el descuento
 * comercial en la factura, las devoluciones al precio de su factura y, en el
 * pago del 17 y el cobro del 25, el descuento condicionado SOLO si se paga a
 * tiempo, contando los días desde las dos fechas (decisión 1 de Kamogawa:
 * el día de la factura no cuenta y el día límite sí). Tasas como fracciones
 * enteras; el valor esperado va comentado al lado.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const INVENTARIO_INICIAL = { unidades: 1950, costo: 2000 };

const pct = (base, n, d = 100) => (base * n) / d;

/* La condición «n/plazo»: n % si se paga dentro del plazo (en días). */
export const CONDICIONES = {
  compra: { n: 10, plazo: 15 }, // 10/15, n/30
  venta: { n: 5, plazo: 15 }, // 5/15, n/30
};

/* Los días entre la factura y el pago: el día de la factura no cuenta; el último sí. */
export const diasEntre = (diaFactura, diaPago) => diaPago - diaFactura;
export const ganaDescuento = (condicion, diaFactura, diaPago) => diasEntre(diaFactura, diaPago) <= condicion.plazo;

/* Los datos de cada operación (los del hecho). */
export const OPERACIONES = {
  a1: { dia: 2, unidades: 5000, precio: 2300, comercial: 5 },
  a2: { dia: 2, flete: 575000 },
  a3: { dia: 8, unidades: 700 }, // de la compra del día 2, a su precio con el 5 %
  a4: { dia: 10, unidades: 6000, precio: 10000, comercial: 10 },
  a5: { dia: 10, flete: 1200000 },
  a6: { dia: 15, unidades: 200 }, // de la venta del día 10, a su precio con el 10 %
  a7: { dia: 17, factura: 2 }, // paga la compra del día 2
  a8: { dia: 25, unidades: 7750, precio: 2500, comercial: 20 },
  a9: { dia: 25, factura: 10 }, // cobra la venta del día 10
  a10: { dia: 28, unidades: 6100, precio: 10000, comercial: 8 },
};
const O = OPERACIONES;

/* ═══════════ LO QUE VALE CADA ASIENTO ═══════════ */

const bruto1 = O.a1.unidades * O.a1.precio; // 11.500.000
const compra1 = bruto1 - pct(bruto1, O.a1.comercial); // 10.925.000
const precioNeto1 = O.a1.precio - pct(O.a1.precio, O.a1.comercial); // 2.185
const devuelto3 = O.a3.unidades * precioNeto1; // 1.529.500
const bruto4 = O.a4.unidades * O.a4.precio; // 60.000.000
const venta4 = bruto4 - pct(bruto4, O.a4.comercial); // 54.000.000
const precioNeto4 = O.a4.precio - pct(O.a4.precio, O.a4.comercial); // 9.000
const devuelto6 = O.a6.unidades * precioNeto4; // 1.800.000
const saldo7 = compra1 - devuelto3; // 9.395.500
const descuento7 = ganaDescuento(CONDICIONES.compra, O.a7.factura, O.a7.dia) ? pct(saldo7, CONDICIONES.compra.n) : 0; // 939.550
const bruto8 = O.a8.unidades * O.a8.precio; // 19.375.000
const compra8 = bruto8 - pct(bruto8, O.a8.comercial); // 15.500.000
const saldo9 = venta4 - devuelto6; // 52.200.000
const descuento9 = ganaDescuento(CONDICIONES.venta, O.a9.factura, O.a9.dia) ? pct(saldo9, CONDICIONES.venta.n) : 0; // 2.610.000
const bruto10 = O.a10.unidades * O.a10.precio; // 61.000.000
const venta10 = bruto10 - pct(bruto10, O.a10.comercial); // 56.120.000

export const CIFRAS_BARRANQUILLA = {
  a1: { compras: compra1, bruto: bruto1, comercial: pct(bruto1, O.a1.comercial), condicionado: pct(compra1, CONDICIONES.compra.n) },
  a2: { flete: O.a2.flete },
  a3: { devolucion: devuelto3, precioNeto: precioNeto1 },
  a4: { venta: venta4, bruto: bruto4, comercial: pct(bruto4, O.a4.comercial), condicionado: pct(venta4, CONDICIONES.venta.n) },
  a5: { flete: O.a5.flete },
  a6: { devolucion: devuelto6, precioNeto: precioNeto4 },
  a7: { saldo: saldo7, descuento: descuento7, caja: saldo7 - descuento7, dias: diasEntre(O.a7.factura, O.a7.dia) },
  a8: { compras: compra8, bruto: bruto8, comercial: pct(bruto8, O.a8.comercial) },
  a9: { saldo: saldo9, descuento: descuento9, caja: saldo9 - descuento9, dias: diasEntre(O.a9.factura, O.a9.dia) },
  a10: { venta: venta10, bruto: bruto10, comercial: pct(bruto10, O.a10.comercial) },
};
const N = CIFRAS_BARRANQUILLA;

/* Los valores equivocados previstos: cada uno, el cálculo del error que nombra su texto. */
export const EQUIVOCADAS_BARRANQUILLA = {
  a1: {
    sinComercial: bruto1, // 11.500.000: no restó el 5 %
    conCondicionado: bruto1 - pct(bruto1, CONDICIONES.compra.n), // 10.350.000: restó el 10 %
    losDos: compra1 - N.a1.condicionado, // 9.832.500: restó los dos
  },
  a2: { conComercial: O.a2.flete - pct(O.a2.flete, O.a1.comercial) }, // 546.250
  a3: {
    sinComercial: O.a3.unidades * O.a1.precio, // 1.610.000
    conCondicionado: devuelto3 - pct(devuelto3, CONDICIONES.compra.n), // 1.376.550
  },
  a4: {
    sinComercial: bruto4, // 60.000.000
    losDos: venta4 - pct(venta4, CONDICIONES.venta.n), // 51.300.000
    otroDescuento: bruto4 - pct(bruto4, CONDICIONES.venta.n), // 57.000.000
    conFlete: venta4 - O.a5.flete, // 52.800.000
  },
  a5: { conComercial: O.a5.flete - pct(O.a5.flete, O.a4.comercial) }, // 1.080.000
  a6: {
    sinComercial: O.a6.unidades * O.a4.precio, // 2.000.000
    conCondicionado: devuelto6 - pct(devuelto6, CONDICIONES.venta.n), // 1.710.000
  },
  a7: {
    cajaSinDescuento: saldo7, // 9.395.500
    descuentoSinDevolucion: pct(compra1, CONDICIONES.compra.n), // 1.092.500
    descuentoDelCinco: pct(saldo7, O.a1.comercial), // 469.775
    descuentoSumado: pct(saldo7, CONDICIONES.compra.n + O.a1.comercial), // 1.409.325
    proveedorNeto: saldo7 - descuento7, // 8.455.950
  },
  a8: { sinComercial: bruto8, elDescuento: N.a8.comercial }, // 19.375.000 · 3.875.000
  a9: {
    cajaSinDescuento: saldo9, // 52.200.000
    descuentoSinDevolucion: pct(venta4, CONDICIONES.venta.n), // 2.700.000
    descuentoDelDiez: pct(saldo9, O.a4.comercial), // 5.220.000
    descuentoSumado: pct(saldo9, CONDICIONES.venta.n + O.a4.comercial), // 7.830.000
    clienteNeto: saldo9 - descuento9, // 49.590.000
  },
  a10: { sinComercial: bruto10, elDescuento: N.a10.comercial }, // 61.000.000 · 4.880.000
};
