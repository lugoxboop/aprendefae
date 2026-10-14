/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · PIEZA 2 DE APRENDER — «La factura completa».
 *
 * Fuente: la v2 de Near, armada por L y confirmada por Near, con PASA de
 * Mello. Copia aprobada en orquestador/conocimiento/paquetes/t7-1-pieza2-v2.md;
 * una prueba compara cada texto de aquí contra ella, letra por letra. Lo que
 * la v2 marca «[igual que la v1]» va literal, como todo lo demás.
 *
 * Pieza de Aprender: cero FP, no entra al catálogo. Las preguntas son
 * predicciones, no se califican.
 *
 * Aquí solo hay datos. La mecánica y la figura son de la «Figura de AP2» de
 * Watari («El asiento que se arma» y «Lado a lado»), medida a 315/260.
 *
 * Lo que la v2 marca como interno no se muestra: los subtítulos «(interno:
 * …)», las citas de página entre paréntesis, «[construcción]», «(nuevo)»,
 * «(cambia)», «[igual que la v1]» y lo que va entre corchetes. El estudiante
 * ve de la fuente el pie de cada pantalla y estado.
 *
 * LAS SUMAS DEL ASIENTO NO SE MUESTRAN HASTA EL ACIERTO (L). Cada asiento las
 * trae calculadas aparte, con `mostrarSumasEn: "acierto"`, y las cifras salen
 * de sumar las líneas, no de copiarlas.
 *
 * Nombres de cuenta: regla 8 de la decisión de corte. Erratas que toca: C7-8,
 * C7-10, C7-11, C7-13 y la triple línea de las pp. 211-212 (tabla de la v2).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const AP2_ID = "t7-1-a2-la-factura-completa";

export const BOTON = {
  empezar: "Empezar",
  seguir: "Seguir",
  confirmar: "Confirmar",
  probarOtra: "Probar otra",
};

export const DEBE = "debe";
export const HABER = "haber";

/* Textos de interfaz de la figura de Watari, literales. */
export const INTERFAZ = {
  debe: "Debe",
  haber: "Haber",
  correcto: "Correcto.",
  incorrecto: "Incorrecto.",
  sumas: "Sumas",
  /* El total, mientras no hay acierto. */
  interrogacion: "?",
  /* Solo lector de pantalla: la columna de los rótulos y el nombre de la tabla lado a lado. */
  impuesto: "Impuesto",
  nombreLadoALado: "La compra y la venta, lado a lado",
};

/* Las fechas de los dos asientos, de los enunciados. */
export const FECHA = { compra: "16 de abril", venta: "20 de abril" };

/* La línea que viene de AP1, ya resuelta en el asiento de la compra («Compras · Debe $5.000.000»). */
export const COMPRAS_RESUELTA = { id: "compras", cuenta: "Compras", lado: "debe", monto: 5000000 };

/* Las cifras del asiento, sin «$», como en las tablas de la v2. */
const cifra = (n) => n.toLocaleString("es-CO").replace(/,/g, ".");

/*
 * Un asiento: fecha, líneas con su lado y su monto, y las sumas calculadas.
 * Las sumas no se escriben a mano: si una línea cambia, cambian ellas.
 */
function asiento(fecha, lineas) {
  const suma = (lado) => lineas.filter((l) => l.lado === lado).reduce((t, l) => t + l.monto, 0);
  return {
    fecha,
    columnas: ["Debe", "Haber"],
    lineas: lineas.map((l) => ({ ...l, cifra: cifra(l.monto) })),
    rotuloSumas: "Sumas",
    sumas: { debe: cifra(suma(DEBE)), haber: cifra(suma(HABER)) },
    /* L: las sumas no se ven hasta el acierto. */
    mostrarSumasEn: "acierto",
  };
}

/* ═══════════ LAS PANTALLAS, EN ORDEN ═══════════ */

const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Al terminar, sabrás armar el asiento de una compra y de una venta con IVA y retención. Y sabrás por qué cambian de lado entre la compra y la venta.",
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 210-214",
};

/* Pantalla 1 (interno: Dos impuestos en la factura). */
const DOS_IMPUESTOS = {
  id: "dos-impuestos",
  tipo: "lectura",
  parrafos: [
    "Cuando una empresa vende mercancía, le cobra al cliente un impuesto encima del precio: el impuesto a las ventas, o IVA. En las compras entre empresas como las del libro, ese impuesto va sumado en la factura.",
    "Además, en compras entre empresas como las del libro, quien compra le descuenta una parte del pago a quien vende. Esa parte se llama retención en la fuente. Quien la descuenta se la entrega después a la Dirección de Impuestos.",
    "En este ejercicio, el IVA es del 16 % y la retención del 3,5 %. Las dos se calculan sobre el valor de la mercancía, sin el IVA.",
    "Las tarifas de este ejercicio son datos del libro. No las tomes como las tarifas de hoy.",
  ],
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 210-212",
};

/* Pantalla 2 · pregunta 1 (interno: La compra · base de la retención). */
const BASE_DE_LA_RETENCION = {
  id: "base-de-la-retencion",
  tipo: "eleccion",
  enunciado: "El 16 de abril, La Reventa Ltda. le compra mercancía a un proveedor por $5.000.000, a crédito. La empresa usa el sistema de inventario periódico.",
  ficha: [
    { dato: "Quién recibe", texto: "La Reventa Ltda. recibe la mercancía" },
    { dato: "Quién entrega", texto: "Un proveedor" },
    { dato: "Monto", texto: "$5.000.000 por la mercancía" },
    { dato: "Tipo", texto: "A crédito; IVA del 16 % y retención del 3,5 %, como datos del ejercicio" },
    { dato: "Clase de hecho", texto: "Compra de mercancía para volver a venderla" },
  ],
  /* La línea ya resuelta, que viene de AP1. */
  lineaResuelta: "Compras · Debe $5.000.000",
  calculos: ["IVA = $5.000.000 × 16 % = $800.000"],
  fecha: FECHA.compra,
  /* El asiento de la pregunta ya trae la línea de AP1, resuelta (Watari). */
  resuelta: COMPRAS_RESUELTA,
  pregunta: "¿Sobre qué valor se calcula la retención?",
  opciones: [
    { id: "sin-iva", texto: "$5.000.000", correcta: true },
    {
      id: "con-iva",
      texto: "$5.800.000",
      correcta: false,
      devolucion: "Ese valor ya incluye el IVA. La retención se calcula sobre el valor de la mercancía, sin el impuesto a las ventas: $5.000.000.",
    },
  ],
  pie: "Basado en el libro, p. 211",
  error: { boton: BOTON.probarOtra, pie: "Basado en el libro, p. 211" },
  acierto: {
    textos: ["Así es. Retención = $5.000.000 × 3,5 % = $175.000."],
    /* El cálculo de la retención aparece con el acierto, debajo del del IVA (Watari). */
    calculos: ["Retención = $5.000.000 × 3,5 % = $175.000"],
    boton: BOTON.seguir,
    pie: "Libro, p. 211",
  },
};

/* Pantalla 3 · pregunta 2 (interno: La compra · lados). */
const LADOS_DE_LA_COMPRA = {
  id: "lados-de-la-compra",
  tipo: "lados",
  consigna: "Ahora ubica cada valor en el asiento de la compra. Toca Debe o Haber en cada línea.",
  /* En el orden del libro. El total de la última aparece cuando se ubica bien. */
  lineas: [
    {
      id: "iva",
      texto: "IVA por pagar · $800.000",
      lado: DEBE,
      devolucion: "En la compra, el libro anota el IVA en el debe de IVA por pagar. Así baja lo que la empresa le debe al Estado por IVA.",
    },
    {
      id: "retencion",
      texto: "Retención en la fuente por pagar · $175.000",
      lado: HABER,
      devolucion: "La Reventa le descontó ese valor al proveedor y ahora se lo debe a la Dirección de Impuestos. Es un pasivo que aumenta: va al haber.",
    },
    {
      id: "proveedores",
      texto: "Cuentas por pagar – proveedores · $?",
      /* Lo que se ve cuando la línea queda bien ubicada. */
      textoResuelto: "Cuentas por pagar – proveedores · $5.625.000",
      lado: HABER,
      devolucion: "La Reventa le queda debiendo al proveedor. Es un pasivo que aumenta: va al haber.",
    },
  ],
  pie: "Basado en el libro, pp. 210-212",
  fecha: FECHA.compra,
  /* La línea de Compras viene resuelta de AP1 y abre el asiento, en gris (Watari). */
  resuelta: COMPRAS_RESUELTA,
  error: { boton: BOTON.probarOtra, pie: "Basado en el libro, pp. 210 y 212" },
  acierto: {
    /*
     * La primera frase va en el mensaje; las demás, debajo de su línea (Watari:
     * cada explicación junto a lo que explica). `notas` dice qué frase va con
     * qué línea; `orden`, cómo quedan las líneas al acertar.
     */
    notas: { iva: 1, retencion: 2, proveedores: 3 },
    orden: ["iva", "retencion", "proveedores"],
    textos: [
      "Así es. Lo que se le queda debiendo al proveedor es el valor de la mercancía, más el IVA, menos la retención: $5.000.000 + $800.000 − $175.000 = $5.625.000.",
      "IVA por pagar es lo que la empresa le debe al Estado por IVA, y va al debe porque el IVA de la compra baja esa deuda.",
      "Retención en la fuente por pagar es lo que La Reventa descontó y le debe a la Dirección de Impuestos, y va al haber porque ese pasivo aumenta.",
      "Cuentas por pagar – proveedores es lo que se le debe al proveedor, y va al haber porque también es un pasivo que aumenta.",
    ],
    asiento: asiento("16 de abril", [
      { cuenta: "Compras", lado: DEBE, monto: 5000000 },
      { cuenta: "IVA por pagar", lado: DEBE, monto: 800000 },
      { cuenta: "Retención en la fuente por pagar", lado: HABER, monto: 175000 },
      { cuenta: "Cuentas por pagar – proveedores", lado: HABER, monto: 5625000 },
    ]),
    boton: BOTON.seguir,
    pie: "Basado en el libro, pp. 210-212",
  },
};

/* Pantalla 4 · pregunta 3 (interno: La venta). */
const LA_VENTA = {
  id: "la-venta",
  tipo: "lados",
  enunciado: "El 20 de abril, La Reventa Ltda. le vende mercancía a un cliente por $2.000.000, a crédito. La empresa usa el sistema de inventario periódico.",
  ficha: [
    { dato: "Quién recibe", texto: "Un cliente recibe la mercancía" },
    { dato: "Quién entrega", texto: "La Reventa Ltda." },
    { dato: "Monto", texto: "$2.000.000 por la mercancía" },
    { dato: "Tipo", texto: "A crédito; IVA del 16 % y retención del 3,5 %, como datos del ejercicio" },
    { dato: "Clase de hecho", texto: "Venta de mercancía" },
  ],
  calculos: ["IVA = $2.000.000 × 16 % = $320.000", "Retención = $2.000.000 × 3,5 % = $70.000"],
  consigna: "Ahora el cliente es quien descuenta la retención. Toca Debe o Haber en cada línea.",
  lineas: [
    {
      id: "iva",
      texto: "IVA por pagar · $320.000",
      lado: HABER,
      devolucion: "En la venta es al revés que en la compra: La Reventa cobró el IVA y se lo debe al Estado. El libro lo anota en el haber de IVA por pagar.",
    },
    {
      id: "anticipo",
      texto: "Anticipo fiscal · $70.000",
      lado: DEBE,
      devolucion: "Esta vez el cliente le descontó la retención a La Reventa. Para La Reventa es un impuesto pagado por adelantado: el libro lo anota en el debe de Anticipo fiscal.",
    },
    {
      id: "ingresos",
      texto: "Ingresos por ventas · $2.000.000",
      lado: HABER,
      devolucion: "La venta es un ingreso para La Reventa. Un ingreso que aumenta va al haber: por eso la venta se anota en el haber de Ingresos por ventas.",
    },
    {
      id: "clientes",
      texto: "Cuentas por cobrar – clientes · $?",
      textoResuelto: "Cuentas por cobrar – clientes · $2.250.000",
      lado: DEBE,
      devolucion: "El cliente le queda debiendo a La Reventa. Es un activo que aumenta: va al debe.",
    },
  ],
  pie: "Basado en el libro, pp. 212-214",
  fecha: FECHA.venta,
  resuelta: null,
  error: { boton: BOTON.probarOtra, pie: "Basado en el libro, pp. 212 y 214" },
  acierto: {
    /* Al acertar, las líneas pasan al orden de su asiento completo, débitos primero, que es el de sus frases (Watari). */
    notas: { clientes: 1, anticipo: 2, iva: 3, ingresos: 4 },
    orden: ["clientes", "anticipo", "iva", "ingresos"],
    textos: [
      "Así es. El valor adeudado por el cliente es la mercancía, más el IVA, menos la retención: $2.000.000 + $320.000 − $70.000 = $2.250.000.",
      "Cuentas por cobrar – clientes es lo que el cliente le queda debiendo a La Reventa, y va al debe porque es un activo que aumenta.",
      "Anticipo fiscal es lo que el cliente le descontó a La Reventa, y va al debe porque es un impuesto que ella ya pagó por adelantado.",
      "IVA por pagar es lo que La Reventa le debe al Estado por el IVA que cobró, y va al haber porque esa deuda aumenta.",
      "Ingresos por ventas recoge lo que La Reventa vende, y va al haber porque es un ingreso que aumenta.",
    ],
    asiento: asiento("20 de abril", [
      { cuenta: "Cuentas por cobrar – clientes", lado: DEBE, monto: 2250000 },
      { cuenta: "Anticipo fiscal", lado: DEBE, monto: 70000 },
      { cuenta: "IVA por pagar", lado: HABER, monto: 320000 },
      { cuenta: "Ingresos por ventas", lado: HABER, monto: 2000000 },
    ]),
    boton: BOTON.seguir,
    pie: "Basado en el libro, pp. 212-214",
  },
};

/* Pantalla 5 · pregunta 4 (interno: Lado a lado). */
const LADO_A_LADO = {
  id: "lado-a-lado",
  tipo: "eleccion",
  tabla: {
    columnas: ["", "En la compra", "En la venta"],
    filas: [
      ["IVA", "Debe (IVA por pagar)", "Haber (IVA por pagar)"],
      ["Retención", "Haber (Retención en la fuente por pagar)", "Debe (Anticipo fiscal)"],
    ],
  },
  pregunta: "¿Por qué la retención va al haber en la compra y al debe en la venta?",
  opciones: [
    {
      id: "quien-la-debe",
      texto: "En la compra, La Reventa se la debe a la Dirección de Impuestos. En la venta, se la descontaron a ella y es un anticipo de sus impuestos.",
      correcta: true,
    },
    {
      id: "siempre-se-resta",
      texto: "Porque la retención siempre se resta del total.",
      correcta: false,
      devolucion: "Se resta del total en los dos casos, pero eso no decide el lado. El lado depende de quién la descontó: si La Reventa la debe o si se la descontaron a ella.",
    },
    {
      id: "tarifa-distinta",
      texto: "Porque en la venta la tarifa es distinta.",
      correcta: false,
      devolucion: "La tarifa es la misma en los dos casos: 3,5 %, como dato del ejercicio. Lo que cambia es quién la descuenta.",
    },
  ],
  pie: "Basado en el libro, pp. 210-214",
  error: { boton: BOTON.probarOtra, pie: "Basado en el libro, pp. 211-213" },
  acierto: {
    textos: ["Exacto. Cuando La Reventa compra, ella descuenta la retención y se la debe a la Dirección de Impuestos. Cuando vende, se la descuentan a ella: es un impuesto pagado por adelantado."],
    boton: BOTON.seguir,
    pie: "Basado en el libro, p. 212",
  },
};

/* Pantalla 6 · resumen. Como en AP1, sin botón. */
const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  parrafos: [
    "El IVA y la retención se calculan sobre el valor de la mercancía, sin el IVA.",
    "En la compra, el IVA va al debe y la retención al haber.",
    "En la venta se invierten: el IVA va al haber y la retención al debe, como anticipo.",
  ],
  siguiente: "Siguiente: tres formas de ponerle precio a lo que quedó.",
  boton: null,
  pie: "Basado en el libro, pp. 210-212",
};

/* ═══════════ LA PIEZA ═══════════ */

export const PIEZA_LA_FACTURA_COMPLETA = {
  id: AP2_ID,
  numero: 2,
  titulo: "La factura completa",
  pantallas: [PORTADA, DOS_IMPUESTOS, BASE_DE_LA_RETENCION, LADOS_DE_LA_COMPRA, LA_VENTA, LADO_A_LADO, RESUMEN],
};
