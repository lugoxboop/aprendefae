import { pesos } from "./contabilidad.js";
import { CIFRAS_BARRANQUILLA as N, EQUIVOCADAS_BARRANQUILLA as E, OPERACIONES as O } from "./repasoCap5Barranquilla.js";
import {
  CAJA, COMPRAS, COMPRAS_FLETES, CLIENTES, PROVEEDORES, DEVOLUCIONES, GASTO_FLETES, INGRESOS, INVENTARIO,
  ENTRADA_MATE, DATOS_DECLARADOS as DECLARADOS_MATE, ROTULOS_MATE, COMUNES_MATE,
} from "./repasoCap5MateTextos.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * REPASO DEL CAPÍTULO 5 · r5-4 «Septiembre en Barranquilla» — LOS TEXTOS
 * (Célula E).
 *
 * Fuente de verdad: orquestador/conocimiento/paquetes/e5-r5-4-v1.md (contenido
 * de Miyata con su conciliación, diseño de Itagaki, decisiones de Kamogawa).
 * Todo texto va LITERAL. Se construye sobre r5-3: lo que aquí no está (la
 * instrucción de la entrada, la marca y la línea de los datos declarados, los
 * rótulos del armador, los textos comunes) es lo de r5-3.
 *
 * Las cifras salen de repasoCap5Barranquilla.js: ninguna se copia a mano.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Las cuentas que r5-4 agrega a las de r5-3. */
export const DESCUENTO = "Descuento comercial condicionado";
export const DEV_COMPRAS = "Devoluciones de compras";
export { CAJA, COMPRAS, COMPRAS_FLETES, CLIENTES, PROVEEDORES, DEVOLUCIONES, GASTO_FLETES, INGRESOS, INVENTARIO };

/* La hoja de las 11 cuentas, en orden alfabético como en r5-3 (decisión 4). */
export const HOJA_BARRANQUILLA = [CAJA, COMPRAS, COMPRAS_FLETES, CLIENTES, PROVEEDORES, DESCUENTO, DEV_COMPRAS, DEVOLUCIONES, GASTO_FLETES, INGRESOS, INVENTARIO];

/* El orden del cálculo para ordenar dos errores: la compra o la venta, el descuento, el dinero y la deuda. */
export const ORDEN_BARRANQUILLA = {
  [COMPRAS]: 0, [COMPRAS_FLETES]: 0, [INGRESOS]: 0, [DEVOLUCIONES]: 0, [DEV_COMPRAS]: 0, [GASTO_FLETES]: 0, [INVENTARIO]: 0,
  [DESCUENTO]: 1,
  [CAJA]: 2, [CLIENTES]: 2, [PROVEEDORES]: 2,
};

/* ═══════════ LA FICHA Y LO COMÚN ═══════════ */

export const R5_4 = {
  id: "r5-4",
  nombre: "Septiembre en Barranquilla",
  /* Kamogawa: experto, 90 FP, evaluativa; con 10 asientos, 9 FP por acierto (decisión 10). */
  dificultad: "experto",
  fpBase: 90,
  modalidad: "evaluativa",
  objetivo: "Registra un mes de compras y ventas: descuentos, devoluciones, fletes y pagos a tiempo.",
  /* Lote de textos (Miyata): la cita del libro, al pie de cada asiento. */
  cita: "Basado en el libro: el 6 del bloque D, pp. 273-274.",
};

/* Las reglas comunes son las de r5-3. */
export const COMUNES_BARRANQUILLA = COMUNES_MATE;

export const ENTRADA_BARRANQUILLA = {
  ...ENTRADA_MATE,
  titulo: "Septiembre en Barranquilla",
  apertura: "Esta es Comercializadora Barranquilla Ltda. Compra y vende un solo producto. Usa el sistema periódico. Vas a ver su septiembre, de la factura al pago.",
};

/* Diseño §2: arriba y fuera de las tarjetas; el único sitio de la entrada que lo dice (decisión 3). */
export const AVISO_BARRANQUILLA = "Este ejercicio no trae IVA ni retención.";

export const DATOS_DEL_LIBRO_BARRANQUILLA = [
  {
    marca: "INVENTARIO",
    renglones: [
      ["Unidades iniciales", "1.950 u"],
      ["Costo unitario inicial", pesos(2000)],
      ["Sistema", "Periódico"],
      ["Valoración", "Promedio ponderado"],
    ],
    nota: "En periódico, la venta no lleva costo; el costo se halla al cierre.",
  },
];

export const DATOS_DECLARADOS_BARRANQUILLA = {
  ...DECLARADOS_MATE,
  /* Los cinco de Miyata, sin «No hay IVA ni retención.» (decisión 3). */
  datos: [
    "El 5 % del día 2 es comercial.",
    "El 10 % del día 10 es comercial.",
    "10/15 y 5/15 son condicionados.",
    "Cada saldo ya tiene restada su devolución.",
    "La venta del día 10 es a un solo cliente.",
  ],
};

export const ROTULOS_BARRANQUILLA = {
  ...ROTULOS_MATE,
  /* Diseño §2: el botón y su línea 2. */
  datosDeMarzo: "Datos de septiembre",
  tasasALaVista: "Sin IVA ni retención · 10/15 y 5/15",
  /* La marca de la hoja: la del botón en mayúsculas (el paquete no la escribe). */
  datosDeMarzoMarca: "DATOS DE SEPTIEMBRE",
  /* Diseño §6. */
  marzoEnOcho: "SEPTIEMBRE EN 10 ASIENTOS",
};

/* ═══════════ LOS DIEZ ASIENTOS ═══════════ */

const d = (cuenta, valor) => ({ lado: "debe", cuenta, valor });
const h = (cuenta, valor) => ({ lado: "haber", cuenta, valor });
const v = (cuenta, valor, texto) => ({ cuenta, valor, texto });
/* Un valor equivocado que vale para las dos cuentas del asiento: el mismo texto en cada una. */
const v2 = (cuentas, valor, texto) => cuentas.map((c) => v(c, valor, texto));

export const ASIENTOS_BARRANQUILLA = [
  {
    id: "a1",
    dia: O.a1.dia,
    fecha: "2 DE SEPTIEMBRE",
    operacion: "Compra",
    hecho: "Septiembre 2: compra a crédito. Arma su asiento.",
    renglones: [["Unidades", "5.000"], ["Precio por unidad", pesos(O.a1.precio)], ["Descuento comercial", "5 %"], ["Condición", "10/15, n/30"]],
    fleteEnElSiguiente: true,
    correctos: [[d(COMPRAS, N.a1.compras), h(PROVEEDORES, N.a1.compras)]],
    cruzado: {
      [COMPRAS]: "Va al revés. La compra va al debe. Lo que debes al proveedor, al haber.",
      [PROVEEDORES]: "Va al revés. La compra va al debe. Lo que debes al proveedor, al haber.",
    },
    falta: {},
    cuentaMal: {
      [CAJA]: "La compra es a crédito. No sale dinero: queda la deuda.",
      [INVENTARIO]: "En periódico, lo que compras va a Compras. El inventario se ajusta al cierre.",
      [COMPRAS_FLETES]: "El flete tiene su propio asiento: el siguiente.",
      /* Decisión 2: el descuento condicionado se diagnostica por valor. */
      [DESCUENTO]: {
        [N.a1.comercial]: "El comercial no va en cuenta aparte. Se resta en la factura: Compras va por $10.925.000.",
        [N.a1.condicionado]: "Ese descuento aún no existe. Solo se gana si pagas en 15 días.",
        otro: "Hoy no va ningún descuento en cuenta aparte. El comercial se resta en la factura; el condicionado espera al pago.",
      },
    },
    valorMal: [
      ...v2([COMPRAS, PROVEEDORES], E.a1.sinComercial, "Ese valor no es el de la factura. Resta el 5 % comercial y deja el flete para el asiento siguiente."),
      ...v2([COMPRAS, PROVEEDORES], E.a1.conCondicionado, "Restaste el 10 %. Ese solo se gana si pagas en 15 días. Hoy no se paga."),
      ...v2([COMPRAS, PROVEEDORES], E.a1.losDos, "Restaste los dos descuentos. El comercial va hoy; el condicionado espera al pago."),
    ],
    generica: "Resta solo el descuento comercial. El condicionado no se toca al comprar.",
    acierto: ["El comercial se resta hoy. El 10 % queda en espera: depende de cuándo pagues."],
  },
  {
    id: "a2",
    dia: O.a2.dia,
    fecha: "2 DE SEPTIEMBRE",
    operacion: "Flete de la compra",
    hecho: "Septiembre 2: pagas de contado el transporte de lo comprado. Arma el asiento del flete.",
    renglones: [["Valor del flete", pesos(N.a2.flete)]],
    /* Decisión 8: completo con una u otra cuenta, nunca mezclado. */
    correctos: [
      [d(COMPRAS_FLETES, N.a2.flete), h(CAJA, N.a2.flete)],
      [d(COMPRAS, N.a2.flete), h(CAJA, N.a2.flete)],
    ],
    cruzado: {
      [COMPRAS_FLETES]: "Va al revés. El flete va al debe. El dinero sale por el haber.",
      [COMPRAS]: "Va al revés. El flete va al debe. El dinero sale por el haber.",
      [CAJA]: "Va al revés. El flete va al debe. El dinero sale por el haber.",
    },
    falta: {},
    cuentaMal: {
      [GASTO_FLETES]: "Este flete trajo lo que compraste. Es parte del costo de comprar: va a Compras (fletes).",
      [PROVEEDORES]: "Se pagó de contado. Va Caja.",
      [INVENTARIO]: "En periódico, el flete de compra va con las compras. El inventario espera al cierre.",
    },
    valorMal: v2([COMPRAS_FLETES, COMPRAS, CAJA], E.a2.conComercial, "El 5 % es de la mercancía, no del flete. El flete se paga entero."),
    generica: "El flete de lo comprado suma al costo. Sale entero de Caja.",
    /* Un acierto por variante, en el orden de `correctos`. */
    acierto: [
      "El flete suma al costo de la compra, en su propia subcuenta. Sin retención, sale entero de Caja.",
      "También vale: el flete suma al costo de la compra. En Inventarios I lo llevamos a su subcuenta, Compras (fletes).",
    ],
  },
  {
    id: "a3",
    dia: O.a3.dia,
    fecha: "8 DE SEPTIEMBRE",
    operacion: "Devuelves",
    hecho: "Septiembre 8: devuelves parte de lo que compraste el día 2. Arma su asiento.",
    renglones: [["Unidades devueltas", "700"]],
    /* Decisión 5: el bloque de la operación del día 2, sin paréntesis en los valores. */
    bloque: { marca: "DE LA OPERACIÓN DEL DÍA 2", renglones: [["Precio por unidad", pesos(O.a1.precio)], ["Descuento comercial", "5 %"], ["Se compró", "a crédito"]] },
    correctos: [[d(PROVEEDORES, N.a3.devolucion), h(DEV_COMPRAS, N.a3.devolucion)]],
    cruzado: {
      [PROVEEDORES]: "Va al revés. Tu deuda baja, así que el proveedor va al debe. La devolución va al haber.",
      [DEV_COMPRAS]: "Va al revés. Tu deuda baja, así que el proveedor va al debe. La devolución va al haber.",
    },
    falta: {},
    cuentaMal: {
      [COMPRAS]: "La devolución tiene su propia cuenta: Devoluciones de compras. Así la compra del día 2 queda a la vista.",
      [CAJA]: "La compra fue a crédito. No entra dinero: baja lo que debes.",
      [DEVOLUCIONES]: "Esa es para cuando un cliente te devuelve. Aquí devuelves tú.",
      [INVENTARIO]: "En periódico, lo que devuelves no se anota en el inventario. Se cuenta al cierre.",
    },
    valorMal: [
      ...v2([PROVEEDORES, DEV_COMPRAS], E.a3.sinComercial, "Se compraron con el 5 % comercial. Vuelven al precio que pagaste. Son $2.185 cada una."),
      ...v2([PROVEEDORES, DEV_COMPRAS], E.a3.conCondicionado, "Le quitaste el 10 %. Ese aún no se ha ganado: nadie ha pagado."),
    ],
    generica: "Usa solo las 700 que vuelven. Cada una vale lo que pagaste el día 2.",
    acierto: ["Devuelves al mismo precio que pagaste, y tu deuda baja $1.529.500."],
  },
  {
    id: "a4",
    dia: O.a4.dia,
    fecha: "10 DE SEPTIEMBRE",
    operacion: "Venta",
    hecho: "Septiembre 10: venta a crédito a un cliente. Arma su asiento.",
    renglones: [["Unidades", "6.000"], ["Precio por unidad", pesos(O.a4.precio)], ["Descuento comercial", "10 %"], ["Condición", "5/15, n/30"]],
    fleteEnElSiguiente: true,
    correctos: [[d(CLIENTES, N.a4.venta), h(INGRESOS, N.a4.venta)]],
    cruzado: {
      [CLIENTES]: "Va al revés. El cliente queda debiendo: la cartera va al debe. El ingreso, al haber.",
      [INGRESOS]: "Va al revés. El cliente queda debiendo: la cartera va al debe. El ingreso, al haber.",
    },
    falta: {},
    cuentaMal: {
      [CAJA]: "La venta es a crédito. No entra dinero hoy.",
      [INVENTARIO]: "En periódico, la venta no toca el inventario. Se cuenta al cierre.",
      [GASTO_FLETES]: "El flete tiene su propio asiento: el siguiente.",
      [DESCUENTO]: {
        [N.a4.comercial]: "El comercial no va en cuenta aparte. Se resta en la factura: el ingreso es $54.000.000.",
        [N.a4.condicionado]: "Ese descuento aún no existe. Solo cuenta si el cliente paga a tiempo.",
        otro: "Hoy no va ningún descuento en cuenta aparte. El comercial se resta en la factura; el condicionado espera al cobro.",
      },
    },
    valorMal: [
      ...v2([CLIENTES, INGRESOS], E.a4.sinComercial, "Te faltó el 10 % comercial. Se resta en la factura."),
      ...v2([CLIENTES, INGRESOS], E.a4.losDos, "Restaste también el 5 %. Ese depende de que el cliente pague a tiempo, y aún no paga."),
      ...v2([CLIENTES, INGRESOS], E.a4.otroDescuento, "Usaste el descuento que no era. Hoy va el 10 % comercial; el 5 % espera al cobro."),
      ...v2([CLIENTES, INGRESOS], E.a4.conFlete, "Restaste el flete. Va en su propio asiento: el siguiente."),
    ],
    generica: "Hoy solo va el 10 %. El 5 % se gana o se pierde al cobrar.",
    acierto: ["El 10 % comercial se resta hoy. El 5 % queda en espera: depende de cuándo pague el cliente."],
  },
  {
    id: "a5",
    dia: O.a5.dia,
    fecha: "10 DE SEPTIEMBRE",
    operacion: "Flete de la venta",
    hecho: "Septiembre 10: pagas el transporte de lo vendido. Arma el asiento del flete.",
    renglones: [["Valor del flete", pesos(N.a5.flete)]],
    /* Decisión 8: el del 10, solo «Gasto de venta – fletes». */
    correctos: [[d(GASTO_FLETES, N.a5.flete), h(CAJA, N.a5.flete)]],
    cruzado: {
      [GASTO_FLETES]: "Va al revés. El gasto va al debe. El dinero sale por el haber.",
      [CAJA]: "Va al revés. El gasto va al debe. El dinero sale por el haber.",
    },
    falta: {},
    cuentaMal: {
      [COMPRAS]: "Este flete lleva la mercancía al cliente. Ya se vendió: no es costo de comprar, es gasto de vender.",
      [COMPRAS_FLETES]: "Este flete lleva la mercancía al cliente. Ya se vendió: no es costo de comprar, es gasto de vender.",
      [CLIENTES]: "El flete lo pagas tú, no el cliente. Sale de Caja.",
      [PROVEEDORES]: "El flete se pagó. Va Caja.",
      [INGRESOS]: "El flete no toca la venta. Es un gasto aparte: lo que cuesta llevarla.",
    },
    valorMal: v2([GASTO_FLETES, CAJA], E.a5.conComercial, "El 10 % es de la venta, no del flete. El flete se paga entero."),
    generica: "Lo que cuesta llevar la venta es gasto. Sale entero de Caja.",
    acierto: ["Lo que cuesta vender es gasto, y aquí sale entero de Caja."],
  },
  {
    id: "a6",
    dia: O.a6.dia,
    fecha: "15 DE SEPTIEMBRE",
    operacion: "Te devuelven",
    hecho: "Septiembre 15: vuelven unidades de la venta del día 10. Arma su asiento.",
    renglones: [["Unidades devueltas", "200"]],
    bloque: { marca: "DE LA OPERACIÓN DEL DÍA 10", renglones: [["Precio por unidad", pesos(O.a4.precio)], ["Descuento comercial", "10 %"], ["Se vendió", "a crédito"]] },
    correctos: [[d(DEVOLUCIONES, N.a6.devolucion), h(CLIENTES, N.a6.devolucion)]],
    cruzado: {
      [DEVOLUCIONES]: "Va al revés. La devolución va al debe, y lo que debe el cliente baja por el haber.",
      [CLIENTES]: "Va al revés. La devolución va al debe, y lo que debe el cliente baja por el haber.",
    },
    falta: {},
    cuentaMal: {
      [INGRESOS]: "La devolución tiene su propia cuenta: Devoluciones de ventas. Así la venta del día 10 queda a la vista.",
      [CAJA]: "La venta fue a crédito. No sale dinero: baja lo que debe el cliente.",
      [DEV_COMPRAS]: "Esa es para cuando tú devuelves al proveedor. Aquí te devuelven a ti.",
      [INVENTARIO]: "En periódico, lo que vuelve no se anota aquí. Se cuenta al cierre.",
    },
    valorMal: [
      ...v2([DEVOLUCIONES, CLIENTES], E.a6.sinComercial, "Se vendieron con el 10 % comercial. Por eso vuelven a $9.000 cada una."),
      ...v2([DEVOLUCIONES, CLIENTES], E.a6.conCondicionado, "Le quitaste el 5 %. Ese aún no se ha ganado: el cliente no ha pagado."),
    ],
    generica: "Usa solo las 200 que vuelven. Cada una vale lo que se cobró el día 10.",
    acierto: ["Vuelven al precio que se cobró, y el cliente debe $1.800.000 menos."],
  },
  {
    id: "a7",
    dia: O.a7.dia,
    fecha: "17 DE SEPTIEMBRE",
    operacion: "Pago",
    hecho: "Septiembre 17: pagas al proveedor la compra del día 2. Arma el asiento del pago.",
    /* Decisión 1: la condición y las dos fechas; el estudiante cuenta los días. */
    renglones: [["Saldo por pagar", pesos(N.a7.saldo)], ["Condición", "10/15"], ["Fecha de la compra", "2 sep"], ["Fecha del pago", "17 sep"]],
    correctos: [[d(PROVEEDORES, N.a7.saldo), h(DESCUENTO, N.a7.descuento), h(CAJA, N.a7.caja)]],
    cruzado: {
      [PROVEEDORES]: "Va al revés. La deuda se cancela por el debe. El dinero sale por el haber.",
      [CAJA]: "Va al revés. La deuda se cancela por el debe. El dinero sale por el haber.",
      [DESCUENTO]: "Aquí tú recibes el descuento. Cuando lo recibes, va al haber.",
    },
    falta: {},
    cuentaMal: {
      [COMPRAS]: "Este descuento tiene su propia cuenta: Descuento comercial condicionado.",
      [DEV_COMPRAS]: "Nadie devolvió nada hoy. Lo que ganas es un descuento por pagar a tiempo.",
    },
    valorMal: [
      v(CAJA, E.a7.cajaSinDescuento, "Sí ganas el descuento. Del 2 al 17 pasaron 15 días: el día de la compra no cuenta, y el día 15 sí. Te toca el 10 %."),
      v(DESCUENTO, E.a7.descuentoSinDevolucion, "Usaste la factura sin la devolución. El descuento va sobre lo que se paga: $9.395.500."),
      v(DESCUENTO, E.a7.descuentoDelCinco, "El descuento por pagar a tiempo es el 10 %. El 5 % comercial ya se restó el día 2."),
      v(DESCUENTO, E.a7.descuentoSumado, "Sumaste el 5 % al 10 %. El 5 % ya se aplicó el día 2. Ahora solo va el 10 %."),
      v(PROVEEDORES, E.a7.proveedorNeto, "La deuda se cancela completa. El descuento es la parte que no pagas."),
    ],
    generica: "Cuenta los días. Si ganas el descuento, réstalo del saldo: eso sale de Caja.",
    acierto: ["Pagaste justo en el día 15 y ganaste el 10 %. La deuda se cancela entera, aunque salgan $939.550 menos."],
  },
  {
    id: "a8",
    dia: O.a8.dia,
    fecha: "25 DE SEPTIEMBRE",
    operacion: "Compra",
    hecho: "Septiembre 25: compras de contado y te dan un descuento comercial. Arma el asiento.",
    renglones: [["Unidades", "7.750"], ["Precio por unidad", pesos(O.a8.precio)], ["Descuento comercial", "20 %"]],
    correctos: [[d(COMPRAS, N.a8.compras), h(CAJA, N.a8.compras)]],
    cruzado: {
      [COMPRAS]: "Va al revés. La compra va al debe. El dinero sale por el haber.",
      [CAJA]: "Va al revés. La compra va al debe. El dinero sale por el haber.",
    },
    falta: {},
    cuentaMal: {
      [PROVEEDORES]: "La compra fue de contado. Va Caja.",
      [INVENTARIO]: "En periódico, lo que compras va a Compras. El inventario espera al cierre.",
      [DESCUENTO]: "Este descuento es comercial: se resta en la factura. Esa cuenta es para los descuentos por pagar a tiempo.",
    },
    valorMal: [
      ...v2([COMPRAS, CAJA], E.a8.sinComercial, "Te faltó el 20 % comercial. Se resta en la factura."),
      ...v2([COMPRAS, CAJA], E.a8.elDescuento, "Ese es el descuento. Lo que pagas es lo que queda: $15.500.000."),
    ],
    generica: "Resta el 20 % al precio. Eso es lo que pagas.",
    acierto: ["El 20 % comercial se resta en la factura, y pagas de una vez $15.500.000."],
  },
  {
    id: "a9",
    dia: O.a9.dia,
    fecha: "25 DE SEPTIEMBRE",
    operacion: "Cobro",
    hecho: "Septiembre 25: se recibe de un cliente el pago de la venta del día 10. Arma su asiento.",
    renglones: [["Saldo por cobrar", pesos(N.a9.saldo)], ["Condición", "5/15"], ["Fecha de la venta", "10 sep"], ["Fecha del cobro", "25 sep"]],
    correctos: [[d(CAJA, N.a9.caja), d(DESCUENTO, N.a9.descuento), h(CLIENTES, N.a9.saldo)]],
    cruzado: {
      [CAJA]: "Va al revés. El dinero entra por el debe. La deuda del cliente sale por el haber.",
      [CLIENTES]: "Va al revés. El dinero entra por el debe. La deuda del cliente sale por el haber.",
      [DESCUENTO]: "Aquí tú das el descuento. Cuando lo das, va al debe.",
    },
    falta: {},
    cuentaMal: {
      [INGRESOS]: "Este descuento tiene su propia cuenta: Descuento comercial condicionado.",
      [DEVOLUCIONES]: "Nadie devolvió nada hoy. Lo que das es un descuento por pagar a tiempo.",
    },
    valorMal: [
      v(CAJA, E.a9.cajaSinDescuento, "El cliente sí gana el descuento. Del 10 al 25 pasaron 15 días, y el día 15 cuenta. Le toca el 5 %."),
      v(DESCUENTO, E.a9.descuentoSinDevolucion, "Usaste la factura sin la devolución. El descuento va sobre lo que se cobra: $52.200.000."),
      v(DESCUENTO, E.a9.descuentoDelDiez, "Usaste el 10 %. Ese era el comercial, y ya se restó el día 10. Ahora va el 5 %."),
      v(DESCUENTO, E.a9.descuentoSumado, "Sumaste los dos. El 10 % ya se aplicó el día 10. Ahora solo va el 5 %."),
      v(CLIENTES, E.a9.clienteNeto, "La deuda del cliente se cancela entera. El descuento es lo que no te paga."),
    ],
    generica: "Cuenta los días. Si el cliente gana el descuento, réstalo del saldo: eso entra a Caja.",
    acierto: ["El cliente pagó en el día 15 y ganó el 5 %. Su deuda se cancela entera, aunque entren $2.610.000 menos."],
  },
  {
    id: "a10",
    dia: O.a10.dia,
    fecha: "28 DE SEPTIEMBRE",
    operacion: "Venta",
    hecho: "Septiembre 28: vendes de contado y das un descuento comercial. Arma el asiento.",
    renglones: [["Unidades", "6.100"], ["Precio por unidad", pesos(O.a10.precio)], ["Descuento comercial", "8 %"]],
    correctos: [[d(CAJA, N.a10.venta), h(INGRESOS, N.a10.venta)]],
    cruzado: {
      [CAJA]: "Va al revés. El dinero entra por el debe. El ingreso va al haber.",
      [INGRESOS]: "Va al revés. El dinero entra por el debe. El ingreso va al haber.",
    },
    falta: {},
    cuentaMal: {
      [CLIENTES]: "La venta fue de contado. El dinero entra hoy.",
      [INVENTARIO]: "En periódico, la venta no toca el inventario. Se cuenta al cierre.",
      [DESCUENTO]: "Este descuento es comercial: se resta en la factura. No usa la cuenta del condicionado.",
      [DEVOLUCIONES]: "Un descuento no es una devolución. Se resta en la factura.",
    },
    valorMal: [
      ...v2([CAJA, INGRESOS], E.a10.sinComercial, "Te faltó el 8 % comercial. Se resta en la factura."),
      ...v2([CAJA, INGRESOS], E.a10.elDescuento, "Ese es el descuento. Lo que entra es lo que queda: $56.120.000."),
    ],
    generica: "Resta el 8 % al precio. Eso entra a Caja.",
    acierto: ["El 8 % comercial se resta en la factura, y entran $56.120.000 de una vez."],
  },
];

/* ═══════════ «EL MES EN DOS CUENTAS» EN r5-4 (paquete e5-mes-en-dos-cuentas) ═══════════ */

export const MES_BARRANQUILLA = {
  cuentas: [
    { cuenta: CAJA, nombre: "Caja", debe: "Entradas", haber: "Salidas", difDebe: "Entró más que salió", difHaber: "Salió más que entró" },
    { cuenta: DESCUENTO, nombre: "Descuento comercial condicionado", debe: "Diste al cobrar", haber: "Ganaste al pagar", difDebe: "Diste más", difHaber: "Ganaste más" },
  ],
  final: {
    cuenta: DESCUENTO,
    haber: (x) => `Neto: ganaste ${pesos(x)} por pagar a tiempo.`,
    debe: (x) => `Neto: diste ${pesos(x)} a quien pagó a tiempo.`,
  },
};

/* Los asientos que no tocan ninguna de las dos cuentas: su línea en la versión compacta. */
export const LINEAS_MES_BARRANQUILLA = {
  a1: "Lo pagarás después; Caja y descuento esperan ese día.",
  a3: "La factura se achica antes de pagarla. Caja no se entera.",
  a4: "Vendes hoy y cobras luego. Caja y descuento esperan.",
  a6: "Se corrige una venta que aún no se ha cobrado.",
};
