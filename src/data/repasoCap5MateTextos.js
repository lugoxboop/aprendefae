import { CIFRAS_MATE as M, EQUIVOCADAS as E } from "./repasoCap5Mate.js";
import { pesos } from "./contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * r5-3 «Marzo en Comercializadora Mate» — LOS TEXTOS (Célula E).
 *
 * Fuente de verdad: orquestador/conocimiento/paquetes/e5-r5-3-v3.md. Las
 * decisiones de Kamogawa sobre la tercera auditoría MANDAN sobre el contenido
 * de Miyata v3 y el diseño de Itagaki (base y delta v2). Todo texto del
 * estudiante va LITERAL.
 *
 * Las cifras no se copian: el asiento correcto y los valores equivocados
 * salen de repasoCap5Mate.js. Las etiquetas entre paréntesis del paquete
 * («Compras en el haber o Caja en el debe», «(cualquier valor…)») dicen a
 * qué caso va cada texto; no son texto de pantalla.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════ LA HOJA DE LAS 12 CUENTAS, EN EL ORDEN LITERAL DEL DELTA v2 §4 ═══════════ */

export const ANTICIPO = "Anticipo fiscal";
export const CAJA = "Caja";
export const COMPRAS = "Compras";
export const COMPRAS_FLETES = "Compras (fletes)";
export const CLIENTES = "Cuentas por cobrar – clientes";
export const PROVEEDORES = "Cuentas por pagar – proveedores";
export const DEVOLUCIONES = "Devoluciones de ventas";
export const GASTO_FLETES = "Gasto de venta – fletes";
export const INGRESOS = "Ingresos por ventas";
export const INVENTARIO = "Inventario de mercancías";
export const IVA = "IVA por pagar";
export const RETENCION = "Retención en la fuente por pagar";

/* No se ordena por código: «IVA» quedaría antes de «Inventario» (delta v2 §4). */
export const HOJA_MATE = [ANTICIPO, CAJA, COMPRAS, COMPRAS_FLETES, CLIENTES, PROVEEDORES, DEVOLUCIONES, GASTO_FLETES, INGRESOS, INVENTARIO, IVA, RETENCION];

/*
 * El orden del cálculo (decisión 4): Compras o Ingresos, luego IVA, luego
 * retención, luego Caja, proveedor o cliente. Con varios renglones mal, los
 * textos salen en este orden, no en el que el estudiante los agregó.
 */
export const ORDEN_DEL_CALCULO = {
  [COMPRAS]: 0, [COMPRAS_FLETES]: 0, [INGRESOS]: 0, [DEVOLUCIONES]: 0, [GASTO_FLETES]: 0, [INVENTARIO]: 0,
  [IVA]: 1,
  [RETENCION]: 2, [ANTICIPO]: 2,
  [CAJA]: 3, [CLIENTES]: 3, [PROVEEDORES]: 3,
};

/* ═══════════ LA FICHA Y LO COMÚN ═══════════ */

export const R5_3 = {
  id: "r5-3",
  nombre: "Marzo en Comercializadora Mate",
  /* Kamogawa: experto, 90 FP, evaluativa. */
  dificultad: "experto",
  fpBase: 90,
  modalidad: "evaluativa",
  objetivo: "Registra un mes de compras y ventas con IVA, retenciones, descuentos y fletes.",
  /* Lote de textos (Miyata): la cita del libro, al pie de cada asiento. */
  cita: "Basado en el libro: el 4 del bloque D, pp. 269-271.",
};

export const COMUNES_MATE = {
  /* Genérica de cuenta: cualquier cuenta no prevista en el asiento. */
  cuentaNoPrevista: "Esta operación no usa esa cuenta.",
  hayMas: "Y hay más renglones por revisar.",
};

/* ═══════════ LA PANTALLA DE ENTRADA (delta v2 §1) ═══════════ */

const cifraConSigno = (n) => pesos(n);

export const ENTRADA_MATE = {
  marca: "ANTES DE EMPEZAR",
  titulo: "Marzo en Comercializadora Mate",
  /* La frase de apertura de Miyata. */
  apertura: "Comercializadora Mate Ltda. compra y vende un producto. Estos son sus datos de marzo:",
  instruccion: "En cada fecha armas el asiento completo. Estos datos siguen a mano en cada pantalla.",
  empezar: "Empezar",
};

export const DATOS_DEL_LIBRO = [
  {
    marca: "INVENTARIO",
    renglones: [
      ["Unidades iniciales", "1.400 u"],
      ["Costo unitario inicial", cifraConSigno(20000)],
      ["Sistema", "Periódico"],
      ["Valoración", "Promedio ponderado"],
    ],
    nota: "En periódico, la venta no lleva costo; el costo se halla al cierre.",
  },
  {
    marca: "TASAS",
    renglones: [["IVA", "16 %"], ["Retención en compras", "3,5 %"], ["Retención en fletes", "1 %"]],
  },
  {
    marca: "LA EMPRESA",
    frases: ["Es gran contribuyente. Responde por IVA y retención.", "Los fletes en ventas son gasto de ventas."],
  },
];

export const DATOS_DECLARADOS = {
  marca: "DATOS DECLARADOS",
  linea: "El libro no los dice; los fijamos para que haya una sola respuesta.",
  /* Los cinco de Itagaki (decisión 5). Las cifras llevan «$» en pantalla (delta v2, nota de escritura). */
  datos: [
    "Los clientes varios no retienen.",
    "No hay retención de IVA.",
    "Los descuentos del 15 y del 31 de marzo son comerciales.",
    `El flete del 15 de marzo vale ${cifraConSigno(240000)}; la retención se saca de ese valor.`,
    `El flete del 31 de marzo vale ${cifraConSigno(200000)}; la retención se saca de ese valor.`,
  ],
};

/* ═══════════ LOS RÓTULOS DE INTERFAZ DEL DISEÑO ═══════════ */

export const ROTULOS_MATE = {
  /* §4.3: «Asiento n de N»; el mismo sustantivo en el botón de avance. */
  sustantivo: "Asiento",
  progreso: (n, total) => `Asiento ${n} de ${total}`,
  datosDeMarzo: "Datos de marzo",
  tasasALaVista: "IVA 16 % · Retención 3,5 % y 1 %",
  datosDeMarzoMarca: "DATOS DE MARZO",
  cerrar: "Cerrar",
  tuAsiento: "TU ASIENTO",
  debe: "DEBE",
  haber: "HABER",
  anadir: { debe: "+ Añadir renglón al debe", haber: "+ Añadir renglón al haber" },
  otro: { debe: "+ Otro renglón al debe", haber: "+ Otro renglón al haber" },
  sumaDebe: "SUMA DEBE",
  sumaHaber: "SUMA HABER",
  cuadran: "Las sumas cuadran",
  diferencia: (cifra) => `Diferencia: ${cifra}`,
  cancelar: "Cancelar",
  cuentaDel: { debe: "CUENTA DEL DEBE", haber: "CUENTA DEL HABER" },
  renglonDel: { debe: "RENGLÓN DEL DEBE", haber: "RENGLÓN DEL HABER" },
  listo: "Listo",
  cambiarCuenta: "Cambiar cuenta",
  quitar: "Quitar renglón",
  valor: "VALOR",
  enEl: { debe: "EN EL DEBE", haber: "EN EL HABER" },
  revisar: "Comprobar",
  /* §4.2: la respuesta revelada. */
  eraEste: "Iba aquí",
  marzoEnOcho: "MARZO EN OCHO ASIENTOS",
  nDeM: (n, m) => `${n} de ${m}`,
  acierto: "Acierto",
  error: "Error",
  fleteEnElSiguiente: "en el asiento siguiente",
  deOtraOperacion: "DE LA OPERACIÓN DEL 10 DE MARZO",
};

/* ═══════════ LOS OCHO ASIENTOS ═══════════ */

const d = (cuenta, valor) => ({ lado: "debe", cuenta, valor });
const h = (cuenta, valor) => ({ lado: "haber", cuenta, valor });
const v = (cuenta, valor, texto) => ({ cuenta, valor, texto });

/*
 * Por asiento: el hecho (frase, renglones y, en el 5, el renglón de otra
 * operación), el asiento correcto en el orden del cálculo (en el 4, las dos
 * variantes: decisión 8) y la retroalimentación por clase:
 *   cruzado[cuenta]   lado cruzado (una cuenta del asiento en el otro lado)
 *   cuentaMal[cuenta] cuenta equivocada o que sobra (si no está, la genérica de cuenta)
 *   falta[cuenta]     falta ese renglón (solo el IVA tiene texto propio)
 *   valorMal[]        cuenta del asiento con un valor previsto
 *   generica, acierto
 */
/*
 * B5 de enganche.md (Kamogawa): el renglón «IVA · 16 %» salía en el hecho y en
 * «Datos de marzo», que está a la vista en cada asiento. Sale de los hechos;
 * las tasas quedan solo en «Datos de marzo». La decisión nombra los asientos
 * 1, 2, 3 y 6, pero el renglón estaba en seis (también el 5 y el 7): se quitó
 * de los seis, de forma provisional, y está reportado.
 */
export const ASIENTOS_MATE = [
  {
    id: "a1",
    dia: 1,
    fecha: "1 DE MARZO",
    operacion: "Compra de contado",
    hecho: "Marzo 1: compra de contado. Se usa el sistema periódico. Arma su asiento.",
    renglones: [["Compra", `1.000 unidades a ${cifraConSigno(25000)}`], ["Descuento comercial", "5 %"], ["IVA", "16 %"], ["Retención", "3,5 % sobre el valor sin IVA"], ["Pago", "de contado"]],
    correctos: [[d(COMPRAS, M.a1.compras), d(IVA, M.a1.iva), h(RETENCION, M.a1.retencion), h(CAJA, M.a1.pago)]],
    cruzado: {
      [IVA]: "En la compra pagas IVA, así que va al debe. Al haber va el IVA que cobras al vender.",
      [RETENCION]: "La retención es una deuda tuya con el Estado. Las deudas van al haber.",
      [COMPRAS]: "Va al revés. La compra entra por el debe y el dinero sale por el haber.",
      [CAJA]: "Va al revés. La compra entra por el debe y el dinero sale por el haber.",
    },
    falta: { [IVA]: "Falta el IVA. Al comprar pagas 16 % de IVA, y va al debe." },
    cuentaMal: {
      [INVENTARIO]: "En periódico, lo que compras va a Compras. El inventario se ajusta al cierre.",
      [PROVEEDORES]: "La compra fue de contado. El dinero sale hoy: va Caja.",
      [ANTICIPO]: "El anticipo es lo que te retienen cuando vendes. Aquí compras y retienes tú.",
    },
    valorMal: [
      v(COMPRAS, E.a1.comprasSinDescuento, "Te faltó el descuento. El comercial se resta en la misma factura."),
      v(IVA, E.a1.ivaSinDescuento, "Calculaste el IVA sin el descuento. El IVA va sobre el precio que queda: $23.750.000."),
      v(RETENCION, E.a1.retencionConIva, "La retención se calcula sin el IVA. La base es $23.750.000."),
      v(RETENCION, E.a1.retencionSinDescuento, "Retuviste sobre el precio sin descuento. La base es el valor ya rebajado."),
      v(CAJA, E.a1.cajaSinRetencion, "La empresa retiene cuando compra. Al proveedor le pagas $831.250 menos."),
    ],
    generica: "El descuento comercial va primero. El IVA y la retención se calculan sobre el precio ya rebajado, y la retención nunca lleva IVA.",
    /* Decisión 1: «pagas el IVA sobre lo que queda», no «cobras». */
    /* Decisión 1 de Kamogawa (sigue vigente): en una compra el IVA se paga; Miyata volvió a escribir «cobras». */
    acierto: ["Restas el 5 %, pagas el IVA sobre lo que queda y retienes sin IVA. A Caja sale la diferencia."],
  },
  {
    id: "a2",
    dia: 10,
    fecha: "10 DE MARZO",
    operacion: "Venta a crédito",
    hecho: "Marzo 10: venta a crédito a clientes varios. Arma su asiento.",
    /* Decisión 2: el valor corto, sin la marca de dato declarado. */
    renglones: [["Venta", `2.000 unidades a ${cifraConSigno(45000)}`], ["IVA", "16 %"], ["Retención de los clientes", "no retienen (declarado por la célula)"]],
    correctos: [[d(CLIENTES, M.a2.total), h(IVA, M.a2.iva), h(INGRESOS, M.a2.ingresos)]],
    cruzado: {
      [IVA]: "Al vender, cobras IVA para el Estado. Es una deuda: va al haber.",
      [INGRESOS]: "Va al revés. El cliente queda debiendo: la cartera va al debe. El ingreso va al haber.",
      [CLIENTES]: "Va al revés. El cliente queda debiendo: la cartera va al debe. El ingreso va al haber.",
    },
    falta: { [IVA]: "Falta el IVA. Al vender cobras 16 % de IVA, y lo debes al Estado." },
    cuentaMal: {
      /* Decisión 6: el Anticipo fiscal del asiento 2 queda como lo escribió Miyata. */
      [ANTICIPO]: "Estos clientes no retienen: es un dato del ejercicio. Sin retención no hay anticipo.",
      [RETENCION]: "Esa cuenta es para lo que tú retienes al comprar. Aquí vendes, y nadie retiene.",
      [CAJA]: "La venta es a crédito. No entra dinero: el cliente queda debiendo.",
      [INVENTARIO]: "En periódico, la venta no toca el inventario. Las unidades se cuentan al cierre.",
    },
    valorMal: [
      v(CLIENTES, E.a2.clientesSinIva, "El cliente también te debe el IVA. Lo cobras ahora y luego lo pagas al Estado."),
      v(INGRESOS, E.a2.ingresosConIva, "El IVA no es ingreso tuyo. Lo cobras para el Estado."),
      v(CLIENTES, E.a2.clientesConRetencion, "Restaste una retención que no existe. Estos clientes no retienen."),
    ],
    generica: "El IVA no es ingreso tuyo: va a IVA por pagar. Y estos clientes no retienen, así que no hay anticipo fiscal.",
    acierto: ["El cliente debe la venta más el IVA. El IVA es del Estado: el ingreso es solo la venta."],
  },
  {
    id: "a3",
    dia: 15,
    fecha: "15 DE MARZO",
    operacion: "Compra de contado",
    hecho: "Marzo 15: compra de contado. El flete va en el asiento siguiente.",
    renglones: [["Compra", `600 unidades a ${cifraConSigno(30000)} de lista`], ["Descuento", "4 %, comercial (declarado por la célula)"], ["IVA", "16 %"], ["Retención", "3,5 % sobre el valor sin IVA"]],
    /* Miyata (P2): «El flete va en el asiento siguiente» ya está en la frase. */
    correctos: [[d(COMPRAS, M.a3.compras), d(IVA, M.a3.iva), h(RETENCION, M.a3.retencion), h(CAJA, M.a3.pago)]],
    cruzado: {
      [IVA]: "Este IVA lo pagas tú al comprar. Por eso va al debe.",
      [RETENCION]: "Lo que retienes lo debes al Estado. Va al haber.",
      [COMPRAS]: "Va al revés. La compra va al debe; el dinero que sale, al haber.",
      [CAJA]: "Va al revés. La compra va al debe; el dinero que sale, al haber.",
    },
    falta: { [IVA]: "Falta el IVA. Esta compra también paga 16 %, sobre el precio con descuento." },
    cuentaMal: {
      [COMPRAS_FLETES]: "El flete tiene su propio asiento: el siguiente.",
      [INVENTARIO]: "En periódico, esta compra va a Compras. El inventario espera al cierre.",
      [PROVEEDORES]: "Se pagó de contado. Va Caja.",
      [ANTICIPO]: "Al comprar no te retienen: retienes tú.",
    },
    valorMal: [
      v(COMPRAS, E.a3.comprasSinDescuento, "Este descuento es comercial: se resta en la factura."),
      v(IVA, E.a3.ivaSinDescuento, "El IVA va sobre el precio con descuento. Primero resta el 4 %."),
      v(RETENCION, E.a3.retencionConIva, "Saca el IVA antes de retener. La base es $17.280.000."),
      v(RETENCION, E.a3.retencionSinDescuento, "Retuviste sobre el precio de lista. Retén sobre el precio con descuento."),
      v(COMPRAS, E.a3.comprasConFlete, "Sumaste el flete. El flete tiene su propio asiento: el siguiente."),
      v(CAJA, E.a3.cajaSinRetencion, "Te faltó la retención. Ese 3,5 % no sale de Caja: queda por pagar."),
    ],
    generica: "Resta el 4 % antes de todo. El IVA y la retención van sobre el precio rebajado. El flete no entra aquí.",
    acierto: ["Mismos pasos del día 1, con el 4 %. El flete queda para su propio asiento."],
  },
  {
    id: "a4",
    dia: 15,
    fecha: "15 DE MARZO",
    operacion: "Flete de la compra",
    hecho: "Marzo 15: pagas de contado el transporte de lo comprado. Arma su asiento.",
    renglones: [["Valor del servicio", `${cifraConSigno(240000)} (declarado por la célula)`], ["Retención en fletes", "1 %"]],
    /* Decisión 8: completo con una u otra cuenta, nunca mezclado. */
    correctos: [
      [d(COMPRAS_FLETES, M.a4.flete), h(RETENCION, M.a4.retencion), h(CAJA, M.a4.pago)],
      [d(COMPRAS, M.a4.flete), h(RETENCION, M.a4.retencion), h(CAJA, M.a4.pago)],
    ],
    cruzado: {
      [RETENCION]: "La retención al transportador la debes al Estado. Va al haber.",
      [CAJA]: "Va al revés. El flete va al debe. El dinero sale por el haber.",
      [COMPRAS_FLETES]: "Va al revés. El flete va al debe. El dinero sale por el haber.",
      [COMPRAS]: "Va al revés. El flete va al debe. El dinero sale por el haber.",
    },
    falta: {},
    cuentaMal: {
      [GASTO_FLETES]: "Este flete trajo la mercancía a tu bodega. Es parte de lo que costó comprarla: va a Compras (fletes).",
      [IVA]: "El flete no lleva IVA, igual que en «Importados y fletes».",
      [PROVEEDORES]: "Se pagó de contado. Va Caja.",
      [INVENTARIO]: "En periódico, el flete de compra va con las compras. El inventario espera al cierre.",
      [ANTICIPO]: "Aquí no te retienen a ti: tú retienes al transportador.",
    },
    valorMal: [
      v(RETENCION, E.a4.retencionAl35, "Al transporte se le retiene el 1 %, no el 3,5 %."),
      v(CAJA, E.a4.cajaSinRetencion, "Al transportador también le retienes. Le pagas $2.400 menos."),
      v(COMPRAS_FLETES, E.a4.fleteNeto, "El flete cuesta $240.000. Lo que sale de Caja es menos, por la retención."),
      v(COMPRAS, E.a4.fleteNeto, "El flete cuesta $240.000. Lo que sale de Caja es menos, por la retención."),
    ],
    generica: "Este flete es costo de comprar, no gasto. Y al transporte se le retiene el 1 %, no el 3,5 %.",
    /* Un acierto por variante, en el orden de `correctos`. */
    acierto: ["El flete trajo la mercancía: suma al costo de comprar. Al transporte se le retiene el 1 %.", "El flete trajo la mercancía: suma al costo de comprar. Al transporte se le retiene el 1 %."],
  },
  {
    id: "a5",
    dia: 20,
    fecha: "20 DE MARZO",
    operacion: "Devolución de venta",
    hecho: "Marzo 20: vuelven 300 unidades de la venta del día 10. Arma su asiento.",
    /* Decisión 3: tres renglones normales y el precio del día 10 aparte, al final. */
    renglones: [["Precio de venta del día 10", cifraConSigno(45000)], ["IVA", "16 %"], ["La venta fue", "a crédito"]],
    /* Miyata (P2): el precio del día 10 ya va en los renglones del asiento. */
    correctos: [[d(DEVOLUCIONES, M.a5.ingresos), d(IVA, M.a5.iva), h(CLIENTES, M.a5.total)]],
    cruzado: {
      [IVA]: "Ese IVA ya no lo debes: vuelve al cliente. Tu deuda con el Estado baja, así que va al debe.",
      [DEVOLUCIONES]: "Va al revés. La devolución va al debe, y lo que debe el cliente baja por el haber.",
      [CLIENTES]: "Va al revés. La devolución va al debe, y lo que debe el cliente baja por el haber.",
    },
    falta: { [IVA]: "Falta el IVA. Con las unidades, al cliente también le devuelves su IVA." },
    cuentaMal: {
      [INGRESOS]: "La devolución tiene su propia cuenta: Devoluciones de ventas. Así la venta del día 10 queda a la vista.",
      [CAJA]: "La venta del 10 fue a crédito. No sale dinero: baja lo que el cliente debe.",
      [COMPRAS]: "Compras es para lo que tú compras. Aquí un cliente te devuelve mercancía.",
      [INVENTARIO]: "En periódico, la mercancía que vuelve no se anota aquí. Se cuenta al cierre.",
      [ANTICIPO]: "El día 10 nadie retuvo. No hay anticipo que devolver.",
    },
    valorMal: [
      v(CLIENTES, E.a5.clientesSinIva, "Al cliente también le devuelves el IVA de esas unidades: $2.160.000."),
      v(IVA, E.a5.ivaDeTodaLaVenta, "Ese es el IVA de toda la venta. Solo vuelven 300 unidades."),
      v(DEVOLUCIONES, E.a5.devolucionesDeTodaLaVenta, "Solo vuelven 300 de las 2.000. Haz la cuenta solo con esas 300."),
    ],
    generica: "Con las unidades vuelve su IVA. Y la devolución tiene cuenta propia: no se resta de Ingresos por ventas.",
    acierto: ["Devuelves la venta y su IVA. El cliente debe $15.660.000 menos."],
  },
  {
    id: "a6",
    dia: 25,
    fecha: "25 DE MARZO",
    operacion: "Compra a crédito",
    hecho: "Marzo 25: compra a crédito. Arma su asiento.",
    /* Decisión 2: la etiqueta es «Plazo del proveedor». */
    renglones: [["Compra", `400 unidades a ${cifraConSigno(32000)}`], ["IVA", "16 %"], ["Retención", "3,5 % sobre el valor sin IVA"], ["Condiciones (del proveedor)", "5/15, n/30"]],
    correctos: [[d(COMPRAS, M.a6.compras), d(IVA, M.a6.iva), h(RETENCION, M.a6.retencion), h(PROVEEDORES, M.a6.pago)]],
    cruzado: {
      [IVA]: "En una compra, el IVA que pagas va al debe.",
      [RETENCION]: "Retienes y lo debes al Estado. Esa deuda va al haber.",
      [COMPRAS]: "Va al revés. La compra va al debe. Lo que le debes al proveedor, al haber.",
      [PROVEEDORES]: "Va al revés. La compra va al debe. Lo que le debes al proveedor, al haber.",
    },
    falta: { [IVA]: "Falta el IVA. Comprar a crédito no quita el IVA: va al debe." },
    cuentaMal: {
      [CAJA]: "La compra es a crédito. No sale dinero hoy: queda la deuda con el proveedor.",
      [INVENTARIO]: "En periódico, lo comprado va a Compras. El inventario se ajusta al cierre.",
      [ANTICIPO]: "Aquí retienes tú, no te retienen.",
    },
    valorMal: [
      v(COMPRAS, E.a6.comprasConDescuento, "Tocaste el descuento. El 5 % solo se gana si pagas en 15 días. En marzo no se paga, así que no se toca."),
      v(IVA, E.a6.ivaConDescuento, "Tocaste el descuento. El 5 % solo se gana si pagas en 15 días. En marzo no se paga, así que no se toca."),
      v(RETENCION, E.a6.retencionConDescuento, "Tocaste el descuento. El 5 % solo se gana si pagas en 15 días. En marzo no se paga, así que no se toca."),
      v(PROVEEDORES, E.a6.proveedorConDescuento, "Tocaste el descuento. El 5 % solo se gana si pagas en 15 días. En marzo no se paga, así que no se toca."),
      v(RETENCION, E.a6.retencionConIva, "Retienes sobre $12.800.000. El IVA no entra en la base."),
      v(PROVEEDORES, E.a6.proveedorSinRetencion, "Te faltó restar la retención. Al proveedor le debes $448.000 menos."),
    ],
    generica: "El 5 % solo se gana si pagas en 15 días, y en marzo no pagas. Calcula como si no hubiera descuento.",
    acierto: ["Sin descuento, porque aún no pagas. Al proveedor le debes la compra con IVA, menos la retención."],
  },
  {
    id: "a7",
    dia: 31,
    fecha: "31 DE MARZO",
    operacion: "Venta de contado",
    hecho: "Marzo 31: venta de contado a clientes varios. El flete va en el asiento siguiente.",
    renglones: [["Venta", `1.250 unidades a ${cifraConSigno(45000)} de lista`], ["Descuento", "5 %, comercial (declarado por la célula)"], ["IVA", "16 %"], ["Retención de los clientes", "no retienen (declarado por la célula)"]],
    /* Miyata (P2): «El flete va en el asiento siguiente» ya está en la frase. */
    correctos: [[d(CAJA, M.a7.total), h(IVA, M.a7.iva), h(INGRESOS, M.a7.ingresos)]],
    cruzado: {
      [IVA]: "Este IVA lo cobras para el Estado. Lo debes: va al haber.",
      [INGRESOS]: "Va al revés. El dinero entra por el debe. El ingreso va al haber.",
      [CAJA]: "Va al revés. El dinero entra por el debe. El ingreso va al haber.",
    },
    falta: { [IVA]: "Falta el IVA. Esta venta también cobra 16 %, sobre el precio con descuento." },
    cuentaMal: {
      /* Decisión 6: la sustitución del Anticipo fiscal es de este asiento, con cualquier valor. */
      [ANTICIPO]: "Estos clientes no retienen: es un dato del ejercicio. Por eso recibes el total.",
      [CLIENTES]: "La venta fue de contado. El dinero entra hoy.",
      [DEVOLUCIONES]: "Un descuento no es una devolución. Nadie devolvió nada: el descuento se resta en la factura.",
      [GASTO_FLETES]: "El flete tiene su propio asiento: el siguiente.",
      [RETENCION]: "Al vender, nadie retiene aquí. Esa cuenta es para tus compras.",
      [INVENTARIO]: "En periódico, la venta no toca el inventario. Se cuenta al cierre.",
    },
    valorMal: [
      v(IVA, E.a7.ivaSinDescuento, "Le cobras IVA sobre lo que de verdad paga. Resta el 5 % antes."),
      v(INGRESOS, E.a7.ingresosSinDescuento, "El descuento es comercial: se resta en la factura."),
      v(CAJA, E.a7.cajaConRetencionArriba, "Sobra la retención. Estos clientes no retienen. A Caja entra todo: $61.987.500."),
      v(CAJA, E.a7.cajaConRetencionAbajo, "Sobra la retención. Estos clientes no retienen. A Caja entra todo: $61.987.500."),
    ],
    generica: "El 5 % comercial se resta antes del IVA. Y como estos clientes no retienen, a Caja entra el total.",
    acierto: ["Precio menos el 5 %, más el IVA. Entra todo a Caja, porque estos clientes no retienen."],
  },
  {
    id: "a8",
    dia: 31,
    fecha: "31 DE MARZO",
    operacion: "Flete de la venta",
    hecho: "Marzo 31: pagas el transporte de lo vendido. Arma su asiento.",
    renglones: [["Valor del servicio", `${cifraConSigno(200000)} (declarado por la célula)`], ["Retención en fletes", "1 %"]],
    correctos: [[d(GASTO_FLETES, M.a8.flete), h(RETENCION, M.a8.retencion), h(CAJA, M.a8.pago)]],
    cruzado: {
      [RETENCION]: "Lo que retienes al transportador lo debes. Va al haber.",
      [CAJA]: "Va al revés. El gasto va al debe. El dinero sale por el haber.",
      [GASTO_FLETES]: "Va al revés. El gasto va al debe. El dinero sale por el haber.",
    },
    falta: {},
    cuentaMal: {
      [COMPRAS]: "Este flete lleva la mercancía al cliente. Esa mercancía ya se vendió: no es costo de comprar, es gasto de vender.",
      [COMPRAS_FLETES]: "Este flete lleva la mercancía al cliente. Esa mercancía ya se vendió: no es costo de comprar, es gasto de vender.",
      [IVA]: "El flete no lleva IVA, igual que el del día 15.",
      [PROVEEDORES]: "El flete se pagó. Va Caja.",
      [INVENTARIO]: "El flete no es mercancía. Es lo que cuesta llevarla al cliente.",
      [ANTICIPO]: "Aquí no te retienen a ti: tú retienes al transportador.",
    },
    valorMal: [
      v(RETENCION, E.a8.retencionAl35, "Al transporte se le retiene el 1 %."),
      v(CAJA, E.a8.cajaSinRetencion, "Al transportador también le retienes. Le pagas $2.000 menos."),
      v(GASTO_FLETES, E.a8.gastoNeto, "El flete cuesta $200.000. Lo que sale de Caja es menos, por la retención."),
    ],
    generica: "Este flete lleva lo vendido: va a Gasto de venta – fletes, no a Compras. La retención es del 1 %.",
    acierto: ["Llevar lo vendido es gasto de vender. Y al transporte, como el día 15, se le retiene el 1 %."],
  },
];

/*
 * ═══════════ «EL MES EN DOS CUENTAS» EN r5-3 (paquete e5-mes-en-dos-cuentas) ═══════════
 *
 * Caja e IVA por pagar, con los rótulos de Miyata. «Pagado o devuelto» y no
 * «Pagaste al comprar»: el debe del IVA también lleva los $2.160.000 de la
 * devolución del 20. En la pantalla final, la diferencia del IVA se cambia
 * por la frase final, con la cifra desde los datos.
 */
export const MES_MATE = {
  cuentas: [
    { cuenta: CAJA, nombre: "Caja", debe: "Entradas", haber: "Salidas", difDebe: "Entró más que salió", difHaber: "Salió más que entró" },
    { cuenta: IVA, nombre: "IVA por pagar", debe: "Pagado o devuelto", haber: "Cobrado al vender", difDebe: "Te queda a favor", difHaber: "Le debes al Estado" },
  ],
  final: {
    cuenta: IVA,
    haber: (x) => `Marzo: ${pesos(x)} de IVA son del Estado.`,
    debe: (x) => `Marzo: ${pesos(x)} más de IVA pagado que cobrado.`,
  },
};

/* La balanza (P2 de Itagaki §10): los textos de Miyata. */
export const BALANZA_R5_3 = {
  platilloDebe: "Pagado o devuelto",
  platilloHaber: "Cobrado al vender",
  aPagar: "Le debes al Estado",
  aFavor: "Te queda a favor",
  sobre: "Retenciones por pagar",
  final: (cifra) => `Marzo: ${cifra} de IVA son del Estado.`,
  alt: "Balanza del IVA: un platillo lleva lo pagado o devuelto y el otro lo cobrado. Baja el que pesa más.",
};
