/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · A5 DE APRENDER — «Importados y fletes» (D-1 y D-2, pp. 208 y 227-229).
 *
 * Fuente: la v1 de Near con los cambios de su v2 (las dos correcciones
 * obligatorias de Mello y los opcionales que aceptó). Copias en
 * orquestador/conocimiento/paquetes/t7-1-a5-v1.md y t7-1-a5-v2-cambios.md;
 * una prueba compara cada texto de aquí contra ellas, letra por letra. Donde
 * la v2 cambia un texto de la v1, vale el de la v2.
 *
 * Pieza de Aprender: cero FP, no entra al catálogo. Las preguntas no se
 * califican.
 *
 * Diseño: la «Figura de A5» de Watari (patrón tabular v3.2), extracto en
 * paquetes/t7-1-a5-figura-watari.md. No hay casillas: las cinco preguntas son
 * de opción. Lo que se dibuja:
 *   · con el acierto de P4 y P5, la tarjeta con los dos asientos del 18 de
 *     marzo, en lectura (antes daría la respuesta)
 *   · en P6, el «Lado a lado» de Santa Martha y La Popa, con la fila «Quién
 *     asume el flete» señalada solo con el acierto
 *
 * Decisiones de Watari que se respetan aquí:
 *   · encabezados «Santa Martha» y «La Popa», sin «D-1 ·» ni «D-2 ·»
 *   · «Caja o Bancos», una sola cuenta (regla 8)
 *   · las sumas solo en el primer asiento: el del flete no las trae
 *
 * Lo que la v1 no trae y se toma de la convención de AP1, AP2 y A6: los
 * botones «Empezar», «Seguir», «Confirmar» y «Probar otra». Lo que es
 * interfaz del patrón: «Debe», «Haber», «Correcto.», «Incorrecto.» y
 * «Sumas». La renta no aparece.
 *
 * Erratas que toca: C7-16 y C7-23 (no se citan), C7-7 (Cuentas por cobrar –
 * clientes en la venta de La Popa).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const A5_ID = "t7-1-a5-importados-y-fletes";

export const BOTON = { empezar: "Empezar", seguir: "Seguir", confirmar: "Confirmar", probarOtra: "Probar otra" };

/* Interfaz del patrón tabular (Watari): literales. */
export const INTERFAZ = {
  debe: "Debe",
  haber: "Haber",
  correcto: "Correcto.",
  incorrecto: "Incorrecto.",
  sumas: "Sumas",
};

/*
 * Textos de interfaz de las dos figuras que todavía esperan revisión.
 * [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN] (guía de Watari): los nombres
 * accesibles de la tarjeta y de la tabla, y la columna oculta «Dato». Las
 * figuras los marcan con data-revision="pendiente".
 */
export const FIGURA_PENDIENTE_DE_REVISION = {
  nombreAsientos: (fecha) => `Asientos del ${fecha}`,
  nombreLadoALado: "Santa Martha y La Popa, lado a lado",
  dato: "Dato",
};

/* La fecha de los dos casos, del enunciado de Near. */
export const FECHA = "18 de marzo";

export const DEBE = "debe";
export const HABER = "haber";

/* Las cifras van sin «$» dentro de las tablas, como en el patrón. */
export const cifra = (n) => n.toLocaleString("es-CO").replace(/,/g, ".");

/* ═══════════ LAS CIFRAS DE D-1 Y D-2 (se calculan, no se copian) ═══════════ */

const IVA = 0.16;
const RETENCION = 0.035;
const RETENCION_TRANSPORTE = 0.01;
const MERCANCIA = 7500000;
const FLETE = 650000;

export const CIFRAS = {
  mercancia: MERCANCIA,
  iva: Math.round(MERCANCIA * IVA), // 1.200.000
  retencion: Math.round(MERCANCIA * RETENCION), // 262.500
  total: MERCANCIA + Math.round(MERCANCIA * IVA) - Math.round(MERCANCIA * RETENCION), // 8.437.500
  sumas: MERCANCIA + Math.round(MERCANCIA * IVA), // 8.700.000
  flete: FLETE,
  retencionFlete: Math.round(FLETE * RETENCION_TRANSPORTE), // 6.500
  pagoFlete: FLETE - Math.round(FLETE * RETENCION_TRANSPORTE), // 643.500
};

/*
 * Una tarjeta, dos asientos: el de la compra o la venta, con sus sumas, y
 * debajo el del flete, sin sumas (tabla de Near, figura de Watari).
 */
function tarjeta(principal, flete) {
  const sumas = (lineas, lado) => lineas.filter((l) => l.lado === lado).reduce((t, l) => t + l.monto, 0);
  return {
    fecha: FECHA,
    nombre: FIGURA_PENDIENTE_DE_REVISION.nombreAsientos(FECHA),
    asientos: [
      { lineas: principal, sumas: { debe: sumas(principal, DEBE), haber: sumas(principal, HABER) } },
      { lineas: flete, sumas: null },
    ],
  };
}

/* ═══════════ LAS PANTALLAS, EN ORDEN ═══════════ */

/* P0 · Portada. */
const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Saber qué forma parte del costo de lo comprado, también si es importado, y registrar un flete según quién lo asume.",
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 208 y 227-229",
};

/* P1 · La regla del costo. */
const LA_REGLA = {
  id: "la-regla-del-costo",
  tipo: "lectura",
  parrafos: [
    "El libro da una regla. Todo gasto directo que hace falta para tener la mercancía lista para la venta forma parte de su costo.",
    "Por eso el costo de lo comprado no es solo el valor de la factura.",
  ],
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 208 y 228",
};

/* P2 · Importados. La lista va con viñeta (Watari); su primer ítem, con la glosa de la v2. */
const IMPORTADOS = {
  id: "importados",
  pista: "Piensa en lo que hay que pagar para tener la mercancía en la bodega, no en gastos de oficina.",
  tipo: "eleccion",
  parrafos: ["Cuando la mercancía viene del exterior, el libro suma al costo varias cosas."],
  lista: [
    "El valor de la factura del proveedor del exterior, pasado a pesos con la tasa de cambio del día de la compra.",
    "Los aranceles, el bodegaje y las comisiones de aduana.",
    "Los fletes, cuando los asume el comprador.",
    "Cualquier otro gasto relacionado con la compra.",
  ],
  pregunta: "Una empresa trae mercancía del exterior. ¿Cuál de estos gastos forma parte del costo de esa mercancía?",
  opciones: [
    { id: "aranceles", texto: "Los aranceles que paga en la aduana.", correcta: true },
    {
      id: "administracion",
      texto: "Los gastos de administración del mes.",
      correcta: false,
      devolucion: "Los gastos de administración van aparte en el estado de resultados. No forman parte del costo de la mercancía.",
    },
    {
      id: "ninguno",
      texto: "Ninguno: el costo es solo el valor de la factura.",
      correcta: false,
      devolucion: "El libro suma al costo más que la factura: también los aranceles y los fletes que asume el comprador.",
    },
  ],
  acierto: { textos: ["Así es. Los aranceles se pagan para poder tener la mercancía, así que el libro los suma a su costo."] },
  pie: "Basado en el libro, p. 208",
  /* La v1 da un solo pie para los errores y el acierto. */
  pieRespuesta: "Basado en el libro, pp. 208, 214 y 228",
};

/* P3 · FOB, CIF y C&F. */
const CONDICIONES = {
  id: "fob-cif-cyf",
  pista: "Vuelve a la definición de FOB. El vendedor corre con los gastos hasta un punto del viaje. ¿Cuál?",
  tipo: "eleccion",
  parrafos: [
    "Cuando se compra al exterior, el libro nombra tres condiciones que se negocian. Cada una dice hasta dónde paga el vendedor.",
    "FOB quiere decir «libre a bordo». El vendedor corre con todos los gastos hasta que la mercancía está a bordo del buque.",
    "CIF quiere decir «costo, seguro y flete». El vendedor corre con todos los gastos hasta el punto que indique el contrato.",
    "C&F quiere decir «costo y flete». El costo y el flete van por cuenta del vendedor, y el seguro, por cuenta del comprador.",
  ],
  pregunta: "Una compra al exterior se pacta FOB. ¿Hasta dónde corre el vendedor con los gastos?",
  opciones: [
    { id: "fob", texto: "Hasta que la mercancía está a bordo del buque.", correcta: true },
    {
      id: "cif",
      texto: "Hasta el punto que indique el contrato.",
      correcta: false,
      devolucion: "Esa es la condición CIF. Con FOB, el vendedor paga hasta que la mercancía está a bordo del buque.",
    },
    {
      id: "cyf",
      texto: "Paga el costo y el flete, y el seguro lo paga el comprador.",
      correcta: false,
      devolucion: "Esa es la condición C&F. Con FOB, el vendedor paga hasta que la mercancía está a bordo del buque.",
    },
  ],
  acierto: { textos: ["Así es. FOB quiere decir «libre a bordo»: el vendedor paga hasta que la mercancía sube al buque."] },
  /* La v1: «Libro, p. 228» en colocando; «Basado en el libro, p. 228» en errores y acierto. */
  pie: "Libro, p. 228",
  pieRespuesta: "Basado en el libro, p. 228",
};

/* P4 · El flete lo asume el comprador (D-1). Enunciado y ficha con los cambios obligatorios de la v2. */
const FLETE_COMPRADOR = {
  id: "flete-del-comprador",
  pista: "Santa Martha paga el flete para traer su mercancía. Busca la cuenta que lo suma a lo comprado.",
  tipo: "eleccion",
  enunciado: "El 18 de marzo, Santa Martha compra mercancía a crédito a un proveedor. La mercancía vale $7.500.000, más el IVA. El flete vale $650.000 y lo asume Santa Martha, que le paga a la transportadora ese mismo día. Usa el sistema de inventario periódico.",
  parrafos: ["En este ejercicio, el IVA es del 16 % y la retención del 3,5 %, sobre la mercancía. La retención por transporte terrestre es del 1 %."],
  /* En texto secundario, como lo dibuja Watari. */
  aviso: "Las tarifas de este ejercicio son datos del libro. No las tomes como las tarifas de hoy.",
  ficha: [
    { dato: "Quién recibe", texto: "Santa Martha recibe la mercancía y el transporte" },
    { dato: "Quién entrega", texto: "Un proveedor y una transportadora" },
    /* v2: «$650.000, valor del flete»; la parte de la mercancía sigue como en la v1 (lectura de Watari). */
    { dato: "Monto", texto: "$7.500.000 por la mercancía; $650.000, valor del flete" },
    { dato: "Tipo", texto: "Mercancía a crédito; fletes pagados ese mismo día" },
    { dato: "Clase de hecho", texto: "Compra de mercancía, con el flete a cargo del comprador" },
  ],
  pregunta: "¿En qué cuenta se anota en el debe el flete de $650.000?",
  opciones: [
    { id: "compras-fletes", texto: "Compras (fletes)", correcta: true },
    {
      id: "gasto-de-venta",
      texto: "Gasto de venta – fletes",
      correcta: false,
      devolucion: "Ese es el flete que asume el vendedor. Aquí lo asume el comprador, y el libro lo suma al costo: va a Compras.",
    },
    {
      id: "inventario",
      texto: "Inventario de mercancías",
      correcta: false,
      devolucion: "En el periódico, lo que se suma al costo de lo comprado va a Compras, no a Inventario de mercancías.",
    },
  ],
  acierto: {
    textos: [
      "Así es. El flete que asume el comprador se anota en Compras, porque es un gasto necesario para tener la mercancía lista para la venta.",
      "Santa Martha le retiene a la transportadora el 1 %, que son $6.500. Por eso le paga $643.500.",
    ],
    /* Los asientos del 18 de marzo de Santa Martha (p. 229, regla 8). */
    tarjeta: tarjeta(
      [
        { cuenta: "Compras", lado: DEBE, monto: CIFRAS.mercancia },
        { cuenta: "IVA por pagar", lado: DEBE, monto: CIFRAS.iva },
        { cuenta: "Retención en la fuente por pagar", lado: HABER, monto: CIFRAS.retencion },
        { cuenta: "Cuentas por pagar – proveedores", lado: HABER, monto: CIFRAS.total },
      ],
      [
        { cuenta: "Compras (fletes)", lado: DEBE, monto: CIFRAS.flete },
        { cuenta: "Retención en la fuente por pagar", lado: HABER, monto: CIFRAS.retencionFlete },
        { cuenta: "Caja o Bancos", lado: HABER, monto: CIFRAS.pagoFlete },
      ],
    ),
  },
  pie: "Basado en el libro, pp. 210, 212 y 228",
  /* La v1 da un solo pie para los errores y el acierto de P4. */
  pieRespuesta: "Basado en el libro, pp. 228-229",
};

/* P5 · El flete lo asume el vendedor (D-2). Las tarifas son las de P4: la frase no se repite. */
const FLETE_VENDEDOR = {
  id: "flete-del-vendedor",
  pista: "Para La Popa, esa mercancía ya se vendió. Ese flete no le suma costo a nada que vaya a vender.",
  tipo: "eleccion",
  entrada: "Ahora mira un caso en que el flete lo asume quien vende.",
  enunciado: "El 18 de marzo, La Popa le vende mercancía a crédito a Santa Martha. La mercancía vale $7.500.000, más el IVA. El flete vale $650.000 y lo asume La Popa, que le paga a la transportadora ese mismo día. Usa el sistema de inventario periódico.",
  parrafos: [],
  ficha: [
    { dato: "Quién recibe", texto: "Santa Martha recibe la mercancía; la transportadora recibe el pago" },
    { dato: "Quién entrega", texto: "La Popa" },
    { dato: "Monto", texto: "$7.500.000 por la mercancía; $650.000, valor del flete" },
    { dato: "Tipo", texto: "Venta a crédito; fletes pagados ese mismo día" },
    { dato: "Clase de hecho", texto: "Venta de mercancía, con el flete a cargo del vendedor" },
  ],
  pregunta: "¿En qué cuenta anota La Popa el flete de $650.000?",
  opciones: [
    { id: "gasto-de-venta", texto: "Gasto de venta – fletes", correcta: true },
    {
      id: "compras-fletes",
      texto: "Compras (fletes)",
      correcta: false,
      devolucion: "La Popa no está comprando: está vendiendo. Para quien vende, el flete es un gasto de venta.",
    },
    {
      id: "ingresos",
      texto: "Ingresos por ventas",
      correcta: false,
      devolucion: "El flete es algo que La Popa paga, no algo que cobra. Por eso no va a Ingresos por ventas.",
    },
  ],
  acierto: {
    textos: ["Así es. Cuando el vendedor paga el flete, el libro lo trata como un gasto de venta. Al cierre se pasa a Ganancias y pérdidas."],
    /* Los asientos del 18 de marzo de La Popa (p. 229, regla 8 y C7-7). */
    tarjeta: tarjeta(
      [
        { cuenta: "Cuentas por cobrar – clientes", lado: DEBE, monto: CIFRAS.total },
        { cuenta: "Anticipo fiscal", lado: DEBE, monto: CIFRAS.retencion },
        { cuenta: "IVA por pagar", lado: HABER, monto: CIFRAS.iva },
        { cuenta: "Ingresos por ventas", lado: HABER, monto: CIFRAS.mercancia },
      ],
      [
        { cuenta: "Gasto de venta – fletes", lado: DEBE, monto: CIFRAS.flete },
        { cuenta: "Retención en la fuente por pagar", lado: HABER, monto: CIFRAS.retencionFlete },
        { cuenta: "Caja o Bancos", lado: HABER, monto: CIFRAS.pagoFlete },
      ],
    ),
  },
  pie: "Basado en el libro, p. 229",
  pieRespuesta: "Basado en el libro, p. 229",
};

/*
 * P6 · Lado a lado. La tabla de Near con la fila de la v2 («Quién asume el
 * flete») y los encabezados de Watari. La primera fila se señala solo con el
 * acierto: antes daría la respuesta.
 */
const LADO_A_LADO = {
  id: "lado-a-lado",
  pista: "Los dos fletes valían lo mismo y se pagaron igual. ¿Qué cambió entre Santa Martha y La Popa?",
  tipo: "eleccion",
  parrafos: [],
  tabla: {
    nombre: FIGURA_PENDIENTE_DE_REVISION.nombreLadoALado,
    columnas: ["Santa Martha", "La Popa"],
    filas: [
      { rotulo: "Quién asume el flete", celdas: ["El comprador", "El vendedor"], focoConAcierto: true },
      { rotulo: "Valor del flete", celdas: [`$${cifra(CIFRAS.flete)}`, `$${cifra(CIFRAS.flete)}`], focoConAcierto: false },
      { rotulo: "Cuenta", celdas: ["Compras (fletes)", "Gasto de venta – fletes"], focoConAcierto: false },
    ],
  },
  pregunta: "¿Qué decide si el flete es parte del costo o es un gasto?",
  opciones: [
    { id: "quien-lo-asume", texto: "Quién lo asume: el comprador o el vendedor.", correcta: true },
    {
      id: "valor",
      texto: "El valor del flete.",
      correcta: false,
      devolucion: "Los dos fletes valen lo mismo, $650.000, y aun así van a cuentas distintas. El valor no decide.",
    },
    {
      id: "contado-o-credito",
      texto: "Si el flete se paga de contado o a crédito.",
      correcta: false,
      devolucion: "Los dos fletes se pagaron el mismo día y de la misma forma, y aun así van a cuentas distintas.",
    },
  ],
  acierto: { textos: ["Exacto. Si lo asume el comprador, es parte del costo. Si lo asume el vendedor, es un gasto de venta."] },
  pie: "Basado en el libro, pp. 228-229",
  pieRespuesta: "Basado en el libro, pp. 228-229",
};

/* P7 · Resumen, sin botón, como en AP1 y A6. */
const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  parrafos: [
    "Lo que forma parte del costo es todo lo necesario para tener la mercancía lista para la venta.",
    "Si el comprador asume el flete, el libro lo suma al costo de lo comprado: va a Compras.",
    "Si el vendedor asume el flete, es un gasto de venta.",
  ],
  siguiente: "Siguiente: «Devoluciones en periódico».",
  boton: null,
  pie: "Basado en el libro, pp. 208 y 228-229",
};

/* ═══════════ LA PIEZA ═══════════ */

export const PIEZA_IMPORTADOS_Y_FLETES = {
  id: A5_ID,
  numero: 5,
  titulo: "Importados y fletes",
  pantallas: [PORTADA, LA_REGLA, IMPORTADOS, CONDICIONES, FLETE_COMPRADOR, FLETE_VENDEDOR, LADO_A_LADO, RESUMEN],
};
