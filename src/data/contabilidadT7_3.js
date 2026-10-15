/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · A1 DE APRENDER — «El descuento comercial» (Célula C).
 *
 * Fuente: la v1 de Near y sus dos capas de cambios (A1 v1.1 y el plan
 * reordenado por la regla 9), con el PASA de Mello. Copia en
 * orquestador/conocimiento/paquetes/t7-3-a1-v1.md; una prueba compara cada
 * texto de aquí contra ella, letra por letra. Cuando dos capas chocan, manda
 * la más nueva:
 *
 *   · Aprender, sin FP ni modalidad (v1.1)
 *   · el repaso trae la línea de los dos sistemas (v1.1, reescrita en la
 *     capa 3) y la línea siguiente, «Por eso, en el permanente…» (capa 3)
 *   · «Siguiente: practica con una factura que tiene descuento.» (capa 3)
 *
 * Ejemplo H-1 del libro (p. 249), resuelto: A1 es la dueña de sus cifras y
 * ninguna pieza de Hacer las pide. La suma del asiento (4.141.200) es de
 * Near: el libro no imprime sumas. Regla 3: T7-3 se sostiene solo; el
 * repaso no usa nada de T7-1 ni de T7-2.
 *
 * Lo que la v1 no trae y se toma de la convención de T7-2: «Empezar»,
 * «Seguir», «Confirmar», «Probar otra», «Correcto.» e «Incorrecto.»; los
 * rótulos de la ficha (los de H2 de T7-2) y el pie de cada pantalla, con las
 * páginas de la columna «Fuente» de sus textos (el del asiento, «Basado en
 * el libro, p. 249», sí lo da la v1).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const A1_ID = "t7-3-descuento-comercial";

export const BOTON = { empezar: "Empezar", seguir: "Seguir", confirmar: "Confirmar", probarOtra: "Probar otra" };
export const INTERFAZ = { correcto: "Correcto.", incorrecto: "Incorrecto.", debe: "Debe", haber: "Haber", sumas: "Sumas" };
export const DEBE = "debe";
export const HABER = "haber";

/* [ESCRITO POR CLAUDE, NO POR LA FICHA] El nombre del asiento sin fecha para el lector de pantalla. */
export const PENDIENTE_DE_REVISION = { nombreAsiento: "Asiento de la venta" };

/*
 * Rótulos y títulos de las figuras del «Patrón T7-3» (renglones). Los puso
 * Watari y los revisó Near (L, 15 de octubre de 2026): van tal cual.
 */
export const ROTULOS_PATRON = {
  factura: (quien) => `Factura de ${quien}`,
  precioLista: "Precio de lista",
  descuentoComercial: (pct) => `Descuento comercial ${pct} %`,
  valorFacturar: "Valor a facturar",
};

/* La frase fija de tarifas, la misma de T7-2 (A2). */
export const FRASE_TARIFAS = "Las tarifas de este ejercicio son datos del libro. No las tomes como las tarifas de hoy.";

/* Las cifras de H-1 (p. 249). Una prueba las recalcula desde la lista, el 15 % y las tarifas. */
export const H1_LIBRO = { lista: 4_200_000, descuento: 630_000, factura: 3_570_000, iva: 571_200, retencion: 124_950, cliente: 4_016_250, sumas: 4_141_200 };

const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Al terminar, sabrás qué es un descuento comercial y cómo se registra una venta que lo tiene.",
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 248-249",
};

const REPASO = {
  id: "repaso",
  tipo: "lectura",
  parrafos: [
    "Primero, un repaso. Cuando una empresa vende mercancía, le cobra al cliente el IVA encima del precio. Y el cliente le descuenta una parte del pago: la retención en la fuente.",
    "En este ejercicio, el IVA es del 16 % y la retención del 3,5 %. Las dos se calculan sobre el valor de la mercancía, sin el IVA.",
    FRASE_TARIFAS,
    "En el asiento de la venta, lo que el cliente queda debiendo va al debe de Cuentas por cobrar – clientes. La retención va al debe de Anticipo fiscal, porque para quien vende es un impuesto pagado por adelantado.",
    "El IVA va al haber de IVA por pagar, porque se le debe al Estado. Y el valor de la mercancía va al haber de Ingresos por ventas.",
    /* Capa 3 (opcional de Mello): la línea de los sistemas, reescrita. */
    "Las empresas llevan su mercancía con uno de dos sistemas. En el periódico, no la anotan día a día: el costo de lo vendido, que es lo que costaron las unidades que salieron, se halla al cierre con un conteo físico. En el permanente, anotan todos los días su mercancía y ese costo.",
    /* Capa 3: reemplaza a «En el sistema permanente hay un paso más…». */
    "Por eso, en el permanente hay un paso más: la venta lleva otro asiento, por el costo de la mercancía vendida.",
  ],
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 209, 233, 249 y 253",
};

const DOS_CLASES = {
  id: "dos-clases",
  pista: "Fíjate si el cliente tiene que cumplir algo para recibir la rebaja.",
  tipo: "eleccion",
  parrafos: [
    "Ahora sí, los descuentos. Muchas empresas les dan descuentos a sus clientes. El libro separa dos clases.",
    "El descuento comercial no tiene condiciones. Se conoce en el momento de la venta y aparece en la factura.",
    "El descuento condicionado, que el libro también llama financiero, depende de una condición. Por ejemplo, que el cliente pague dentro de un plazo. Ese lo verás en otra pieza.",
  ],
  /* [CONSTRUCCIÓN de Near: caso propio, sin cifras en pesos]. Sin puntaje. */
  pregunta: "Un proveedor le rebaja el 10 % del precio de lista a un cliente, sin pedirle nada a cambio, y lo escribe en la factura. ¿Qué clase de descuento es?",
  opciones: [
    { id: "comercial", texto: "Comercial", correcta: true },
    { id: "condicionado", texto: "Condicionado", devolucion: "Este no depende de ninguna condición, como pagar a tiempo. Y aparece en la factura. Es un descuento comercial." },
    /* Tercera opción: anexo del lote 2 (Near). */
    { id: "ninguna", texto: "Ninguna: si va en la factura, no es un descuento", devolucion: "Sí es un descuento. El libro llama así a la rebaja sobre el precio de lista, aunque venga escrita en la factura." },
  ],
  acierto: { texto: "Así es. No tiene condiciones y aparece en la factura: es comercial.", pie: "Basado en el libro, pp. 248 y 251" },
  error: { pie: "Basado en el libro, pp. 248 y 251" },
  pie: "Basado en el libro, pp. 248 y 251",
};

const NO_SE_REGISTRA = {
  id: "no-se-registra",
  tipo: "lectura",
  parrafos: ["El libro dice que el descuento comercial no se registra en la contabilidad. Lo que se registra es el valor neto de la factura: lo que de verdad se facturó."],
  boton: BOTON.seguir,
  pie: "Basado en el libro, p. 248",
};

const C = H1_LIBRO;

const EJEMPLO = {
  id: "ejemplo",
  pista: "Piensa en qué valor queda en la factura después de la rebaja comercial.",
  tipo: "eleccion",
  parrafos: [
    "Mira el ejemplo del libro. San Calixto Ltda. le vende mercancía a crédito a un cliente. El precio de lista es de $4.200.000, más el IVA, y le da un descuento comercial del 15 %.",
    /* [CONSTRUCCIÓN de Near: glosa; el libro usa el término sin definirlo, pp. 249 y 252]. */
    "El precio de lista es el precio de la mercancía antes de cualquier descuento.",
  ],
  /* La ficha de cinco datos de la v1, en su orden, con los rótulos de H2 de T7-2. «A crédito» sale del asiento (p. 249). */
  ficha: [
    { dato: "Quién entrega", texto: "San Calixto" },
    { dato: "Quién recibe", texto: "Un cliente" },
    { dato: "Monto", texto: "$4.200.000 de lista, 15 % de descuento" },
    { dato: "Tipo", texto: "A crédito" },
    { dato: "Clase de hecho", texto: "Venta de mercancía" },
  ],
  despues: [
    "Primero se calcula el descuento. Es el 15 % del precio de lista: $4.200.000 × 15 % = $630.000.",
    "Después se resta: el valor a facturar es $4.200.000 − $630.000 = $3.570.000.",
  ],
  /* Patrón T7-3: el texto ya da las cifras, así que la cuenta en renglones va con él, antes de la pregunta. */
  figuras: [{
    tipo: "renglones",
    titulo: ROTULOS_PATRON.factura("San Calixto"),
    filas: [
      { rot: ROTULOS_PATRON.precioLista, v: C.lista },
      { op: "−", rot: ROTULOS_PATRON.descuentoComercial(15), v: C.descuento },
      { op: "=", rot: ROTULOS_PATRON.valorFacturar, v: C.factura, res: true },
    ],
  }],
  pregunta: "¿Sobre qué valor se calculan el IVA y la retención?",
  opciones: [
    { id: "lista", texto: "$4.200.000", devolucion: "Ese es el precio de lista. El IVA y la retención se calculan sobre lo que se factura, que ya tiene el descuento." },
    { id: "factura", texto: "$3.570.000", correcta: true },
    { id: "descuento", texto: "$630.000", devolucion: "Ese es el descuento. Los impuestos se calculan sobre lo que se factura: $3.570.000." },
  ],
  acierto: {
    texto: "Así es. Se calculan sobre el valor a facturar, que ya tiene el descuento: $3.570.000.",
    parrafos: ["Con eso, el IVA es de $571.200 y la retención, de $124.950. El cliente queda debiendo $3.570.000 + $571.200 − $124.950 = $4.016.250."],
    /* Sin fecha: el libro pone «xxxx». «Ventas» del libro va como «Ingresos por ventas» (regla 8). Las sumas son de Near. */
    asientos: [{
      fecha: null,
      lineas: [
        { cuenta: "Cuentas por cobrar – clientes", lado: DEBE, monto: C.cliente },
        { cuenta: "Anticipo fiscal", lado: DEBE, monto: C.retencion },
        { cuenta: "IVA por pagar", lado: HABER, monto: C.iva },
        { cuenta: "Ingresos por ventas", lado: HABER, monto: C.factura },
      ],
      sumas: true,
    }],
    despues: [
      "Fíjate en el asiento: el descuento no aparece. Ingresos por ventas va por $3.570.000, no por $4.200.000.",
      "Este asiento es igual en los dos sistemas. En el permanente se agrega otro, por el costo de la mercancía vendida.",
    ],
    pie: "Basado en el libro, p. 249",
  },
  error: { pie: "Basado en el libro, p. 249" },
  pie: "Basado en el libro, p. 249",
};

const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  parrafos: [
    "El descuento comercial no tiene condiciones, y se ve en la factura.",
    "No se registra: el asiento va por el valor a facturar, que ya tiene el descuento.",
    "El IVA y la retención se calculan sobre el valor a facturar.",
  ],
  /* Capa 3: ahora lleva a H1. */
  siguiente: "Siguiente: practica con una factura que tiene descuento.",
  pie: "Basado en el libro, pp. 248-249",
};

export const PIEZA_EL_DESCUENTO_COMERCIAL = {
  id: A1_ID,
  numero: 1,
  titulo: "El descuento comercial",
  pantallas: [PORTADA, REPASO, DOS_CLASES, NO_SE_REGISTRA, EJEMPLO, RESUMEN],
};
