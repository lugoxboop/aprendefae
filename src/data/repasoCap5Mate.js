/*
 * ═══════════════════════════════════════════════════════════════════════════
 * REPASO DEL CAPÍTULO 5 · r5-3 «Marzo en Comercializadora Mate» — LAS CIFRAS
 * (Célula E).
 *
 * El 4 del bloque D, pp. 269-271, sin las transacciones del 2, 5, 7 y 28 de
 * marzo (paquete e5-r5-3-v3). Aquí solo hay datos y cuentas: los textos van
 * en repasoCap5MateTextos.js y la lógica en repasoCap5MateJuego.js.
 *
 * Las cifras se CALCULAN, no se transcriben: precio por unidades, descuento
 * comercial, IVA del 16 %, retención del 3,5 % (compras) y del 1 % (fletes).
 * Las tasas van como fracciones enteras para no arrastrar decimales. El
 * valor esperado va comentado al lado; las pruebas lo cotejan con el paquete.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════ LOS DATOS DEL LIBRO ═══════════ */

export const INVENTARIO_INICIAL = { unidades: 1400, costo: 20000 };

/* Las tasas, como fracción: numerador / denominador. */
export const TASAS = {
  iva: { n: 16, d: 100 }, // 16 %
  retencionCompras: { n: 35, d: 1000 }, // 3,5 %
  retencionFletes: { n: 1, d: 100 }, // 1 %
};
const aplicar = (base, t) => (base * t.n) / t.d;

/* Los datos de cada operación (los del hecho). */
export const OPERACIONES = {
  a1: { dia: 1, unidades: 1000, precio: 25000, descuento: { n: 5, d: 100 } },
  a2: { dia: 10, unidades: 2000, precio: 45000 },
  a3: { dia: 15, unidades: 600, precio: 30000, descuento: { n: 4, d: 100 } },
  a4: { dia: 15, flete: 240000 },
  a5: { dia: 20, unidades: 300, precio: 45000 }, // el precio es el de la venta del día 10
  a6: { dia: 25, unidades: 400, precio: 32000, descuentoCondicionado: { n: 5, d: 100 } }, // 5/15, n/30: no se toca
  a7: { dia: 31, unidades: 1250, precio: 45000, descuento: { n: 5, d: 100 } },
  a8: { dia: 31, flete: 200000 },
};

/* ═══════════ LAS CUENTAS ═══════════ */

const bruto = (o) => o.unidades * o.precio;
const neto = (o) => bruto(o) - (o.descuento ? aplicar(bruto(o), o.descuento) : 0);

/* Una compra con IVA y retención del 3,5 % sobre el valor sin IVA. */
function compra(o) {
  const compras = neto(o);
  const iva = aplicar(compras, TASAS.iva);
  const retencion = aplicar(compras, TASAS.retencionCompras);
  return { bruto: bruto(o), compras, iva, retencion, pago: compras + iva - retencion };
}

/* Un flete con retención del 1 %. */
function flete(o) {
  const retencion = aplicar(o.flete, TASAS.retencionFletes);
  return { flete: o.flete, retencion, pago: o.flete - retencion };
}

/* Una venta con IVA, a clientes que no retienen. */
function venta(o) {
  const ingresos = neto(o);
  const iva = aplicar(ingresos, TASAS.iva);
  return { bruto: bruto(o), ingresos, iva, total: ingresos + iva };
}

/*
 * Las cifras y las equivocadas de un mes, desde sus operaciones. La versión A
 * es la del libro (OPERACIONES); la B (D8, Miyata) cambia unidades, el
 * descuento del día 15 y los fletes (OPERACIONES_B). Los comentarios llevan
 * los valores de A.
 */
export function cifrasDe(O) {
  const A1 = compra(O.a1);
  const A2 = venta(O.a2);
  const A3 = compra(O.a3);
  const A4 = flete(O.a4);
  const A5 = venta(O.a5); // la devolución: precio e IVA de las 300 unidades
  const A6 = compra(O.a6);
  const A7 = venta(O.a7);
  const A8 = flete(O.a8);

  const CIFRAS = {
    a1: A1, // compras 23.750.000 · iva 3.800.000 · retención 831.250 · caja 26.718.750
    a2: A2, // ingresos 90.000.000 · iva 14.400.000 · clientes 104.400.000
    a3: A3, // compras 17.280.000 · iva 2.764.800 · retención 604.800 · caja 19.440.000
    a4: A4, // flete 240.000 · retención 2.400 · caja 237.600
    a5: A5, // devoluciones 13.500.000 · iva 2.160.000 · clientes 15.660.000
    a6: A6, // compras 12.800.000 · iva 2.048.000 · retención 448.000 · proveedores 14.400.000
    a7: A7, // ingresos 53.437.500 · iva 8.550.000 · caja 61.987.500
    a8: A8, // gasto 200.000 · retención 2.000 · caja 198.000
  };

  /*
   * Las cifras equivocadas que la retroalimentación prevé, también calculadas.
   * La retención que no existe del asiento 7 da medio peso (1.870.312,5): por
   * eso el paquete acepta las dos formas de redondearla, hacia abajo y hacia
   * arriba, y lo mismo la Caja que resulta.
   */
  const retencionQueNoExiste = aplicar(A7.ingresos, TASAS.retencionCompras); // 1.870.312,5
  const conDescuentoCondicionado = compra({ ...O.a6, descuento: O.a6.descuentoCondicionado });

  const EQUIVOCADAS = {
    a1: {
      comprasSinDescuento: A1.bruto, // 25.000.000
      ivaSinDescuento: aplicar(A1.bruto, TASAS.iva), // 4.000.000
      retencionConIva: aplicar(A1.compras + A1.iva, TASAS.retencionCompras), // 964.250
      retencionSinDescuento: aplicar(A1.bruto, TASAS.retencionCompras), // 875.000
      cajaSinRetencion: A1.compras + A1.iva, // 27.550.000
    },
    a2: {
      clientesSinIva: A2.ingresos, // 90.000.000
      ingresosConIva: A2.total, // 104.400.000
      clientesConRetencion: A2.total - aplicar(A2.ingresos, TASAS.retencionCompras), // 101.250.000
    },
    a3: {
      comprasSinDescuento: A3.bruto, // 18.000.000
      ivaSinDescuento: aplicar(A3.bruto, TASAS.iva), // 2.880.000
      retencionConIva: aplicar(A3.compras + A3.iva, TASAS.retencionCompras), // 701.568
      retencionSinDescuento: aplicar(A3.bruto, TASAS.retencionCompras), // 630.000
      comprasConFlete: A3.compras + A4.flete, // 17.520.000
      cajaSinRetencion: A3.compras + A3.iva, // 20.044.800
    },
    a4: {
      retencionAl35: aplicar(A4.flete, TASAS.retencionCompras), // 8.400
      cajaSinRetencion: A4.flete, // 240.000
      fleteNeto: A4.pago, // 237.600
    },
    a5: {
      clientesSinIva: A5.ingresos, // 13.500.000
      ivaDeTodaLaVenta: A2.iva, // 14.400.000
      devolucionesDeTodaLaVenta: A2.ingresos, // 90.000.000
    },
    a6: {
      comprasConDescuento: conDescuentoCondicionado.compras, // 12.160.000
      ivaConDescuento: conDescuentoCondicionado.iva, // 1.945.600
      retencionConDescuento: conDescuentoCondicionado.retencion, // 425.600
      proveedorConDescuento: conDescuentoCondicionado.pago, // 13.680.000
      retencionConIva: aplicar(A6.compras + A6.iva, TASAS.retencionCompras), // 519.680
      proveedorSinRetencion: A6.compras + A6.iva, // 14.848.000
    },
    a7: {
      ivaSinDescuento: aplicar(A7.bruto, TASAS.iva), // 9.000.000
      ingresosSinDescuento: A7.bruto, // 56.250.000
      anticipoAbajo: Math.floor(retencionQueNoExiste), // 1.870.312
      anticipoArriba: Math.ceil(retencionQueNoExiste), // 1.870.313
      cajaConRetencionArriba: A7.total - Math.floor(retencionQueNoExiste), // 60.117.188
      cajaConRetencionAbajo: A7.total - Math.ceil(retencionQueNoExiste), // 60.117.187
    },
    a8: {
      retencionAl35: aplicar(A8.flete, TASAS.retencionCompras), // 7.000
      cajaSinRetencion: A8.flete, // 200.000
      gastoNeto: A8.pago, // 198.000
    },
  };

  return { CIFRAS, EQUIVOCADAS };
}

export const { CIFRAS: CIFRAS_MATE, EQUIVOCADAS } = cifrasDe(OPERACIONES);

/* Versión B (D8, Miyata). */
export const OPERACIONES_B = {
  a1: { dia: 1, unidades: 1200, precio: 25000, descuento: { n: 5, d: 100 } },
  a2: { dia: 10, unidades: 1800, precio: 45000 },
  a3: { dia: 15, unidades: 600, precio: 30000, descuento: { n: 6, d: 100 } },
  a4: { dia: 15, flete: 300000 },
  a5: { dia: 20, unidades: 250, precio: 45000 },
  a6: { dia: 25, unidades: 500, precio: 32000, descuentoCondicionado: { n: 5, d: 100 } },
  a7: { dia: 31, unidades: 1100, precio: 45000, descuento: { n: 5, d: 100 } },
  a8: { dia: 31, flete: 250000 },
};
export const { CIFRAS: CIFRAS_MATE_B, EQUIVOCADAS: EQUIVOCADAS_B } = cifrasDe(OPERACIONES_B);
