/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · A1 DE APRENDER — «El descuento comercial» (Célula C).
 *
 * Fuente: el RECORTE del lote 1 de Near (entrega 3,
 * orquestador/conocimiento/paquetes/lote1-recortes-t73-v1.md), con las
 * correcciones de la auditoría de Mello (mello-recortes-v1.md): en el
 * asiento de P3, IVA, retención y Anticipo fiscal se abren al tocarlos, con
 * sus textos. Una prueba compara cada texto de aquí contra el paquete, letra
 * por letra. Cinco pantallas: portada, dos clases, el ejemplo, «¿por qué
 * valor va Ingresos por ventas?» (pregunta nueva, con el asiento en pantalla
 * y esa línea en blanco) y el resumen. El repaso se fue.
 *
 * La frase de las tarifas va en el pie de la pantalla que las da (decisión
 * de Near en el recorte; la frase no cambia).
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

/*
 * Las definiciones que se abren al tocar una cuenta del asiento de P3
 * (Mello, entrega 3): el IVA en IVA por pagar; la retención y el anticipo
 * fiscal en Anticipo fiscal, porque el anticipo es esa retención.
 */
export const TERMINOS_A1 = {
  iva: { termino: "IVA", definicion: "el impuesto que el vendedor cobra encima del precio y le debe al Estado" },
  retencion: { termino: "Retención", definicion: "la parte del pago que el cliente le descuenta al vendedor" },
  anticipo: { termino: "Anticipo fiscal", definicion: "para quien vende, esa retención es un impuesto pagado por adelantado" },
};

const C = H1_LIBRO;

/* Los renglones de la factura de San Calixto (Patrón T7-3): en el ejemplo y en el resumen. */
const FACTURA = {
  tipo: "renglones",
  titulo: ROTULOS_PATRON.factura("San Calixto"),
  filas: [
    { rot: ROTULOS_PATRON.precioLista, v: C.lista },
    { op: "−", rot: ROTULOS_PATRON.descuentoComercial(15), v: C.descuento },
    { op: "=", rot: ROTULOS_PATRON.valorFacturar, v: C.factura, res: true },
  ],
};

const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Vas a ver qué es un descuento comercial y cómo queda la venta que lo trae.",
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 248-249",
};

const DOS_CLASES = {
  id: "dos-clases",
  pista: "Fíjate si el cliente tiene que cumplir algo para recibir la rebaja.",
  tipo: "eleccion",
  parrafos: ["Un proveedor rebaja el 10 % del precio de lista, el precio antes de cualquier descuento. No pide nada a cambio y lo escribe en la factura."],
  pregunta: "¿Qué clase de descuento es?",
  opciones: [
    { id: "comercial", texto: "Comercial", correcta: true },
    { id: "condicionado", texto: "Condicionado", devolucion: "Este no depende de ninguna condición, como pagar a tiempo." },
    /* Tercera opción del anexo del lote 2, con su retroalimentación recortada. */
    { id: "ninguna", texto: "Ninguna: si va en la factura, no es un descuento", devolucion: "Sí es un descuento: una rebaja sobre el precio de lista." },
  ],
  acierto: {
    texto: "Así es: no tiene condiciones y va en la factura.",
    porque: "El libro separa dos clases. El condicionado, que también llama financiero, depende de una condición, como pagar dentro de un plazo: lo verás en otra pieza.",
    pie: "Basado en el libro, pp. 248 y 251",
  },
  error: { pie: "Basado en el libro, pp. 248 y 251" },
  pie: "Basado en el libro, pp. 248 y 251",
};

const EJEMPLO = {
  id: "ejemplo",
  pista: "Piensa en qué valor queda en la factura después de la rebaja comercial.",
  tipo: "eleccion",
  parrafos: ["San Calixto le vende a crédito, con un descuento comercial del 15 %."],
  /* Patrón T7-3: los renglones de la factura (del libro). */
  figuras: [FACTURA],
  pregunta: "¿Sobre qué valor se calculan el IVA y la retención?",
  opciones: [
    { id: "lista", texto: "$4.200.000", devolucion: "Ese es el precio de lista. Los impuestos van sobre lo que se factura." },
    { id: "factura", texto: "$3.570.000", correcta: true },
    { id: "descuento", texto: "$630.000", devolucion: "Ese es el descuento. Los impuestos van sobre lo que se factura." },
  ],
  acierto: {
    texto: "Así es: sobre lo facturado, que ya tiene el descuento.",
    porque: "Con el IVA del 16 % y la retención del 3,5 %, el IVA es de $571.200 y la retención, de $124.950. El cliente queda debiendo $4.016.250: lo facturado, más el IVA, menos la retención.",
    pie: "Basado en el libro, p. 249",
  },
  error: { pie: "Basado en el libro, p. 249" },
  pie: "Basado en el libro, p. 249",
  /* Aquí se dan las tarifas: la frase va en el pie. */
  pieTarifas: true,
};

const NO_SE_REGISTRA = {
  id: "no-se-registra",
  pista: "El descuento comercial ya se restó en la factura. ¿Qué valor quedó en ella?",
  tipo: "eleccion",
  parrafos: ["Este es el asiento de la venta."],
  /* Sin fecha: el libro pone «xxxx». «Ventas» va como «Ingresos por ventas» (regla 8). Ingresos por ventas, en blanco hasta el acierto. */
  asientos: [{
    fecha: null,
    lineas: [
      { cuenta: "Cuentas por cobrar – clientes", lado: DEBE, monto: C.cliente },
      { cuenta: "Anticipo fiscal", lado: DEBE, monto: C.retencion, terminos: [TERMINOS_A1.retencion, TERMINOS_A1.anticipo] },
      { cuenta: "IVA por pagar", lado: HABER, monto: C.iva, terminos: [TERMINOS_A1.iva] },
      { cuenta: "Ingresos por ventas", lado: HABER, monto: C.factura, enBlanco: "$?" },
    ],
  }],
  pregunta: "¿Por qué valor va Ingresos por ventas?",
  opciones: [
    { id: "factura", texto: "$3.570.000", correcta: true },
    { id: "lista", texto: "$4.200.000", devolucion: "Ese es el precio de lista, y ese precio no llegó a la factura." },
    { id: "descuento", texto: "$630.000", devolucion: "Ese es el descuento, y el descuento no se anota." },
  ],
  acierto: {
    texto: "Así es: el descuento no se registra. El asiento va por lo facturado.",
    porque: "Este asiento es igual en los dos sistemas. En el permanente se agrega otro, por el costo de la mercancía vendida.",
    pie: "Basado en el libro, pp. 248-249",
  },
  error: { pie: "Basado en el libro, pp. 248-249" },
  pie: "Basado en el libro, pp. 248-249",
};

const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  parrafos: ["Precio de lista − descuento comercial = valor a facturar"],
  figuras: [FACTURA],
  tras: [
    "El descuento comercial no tiene condiciones y va en la factura.",
    "No se registra: el asiento, el IVA y la retención van por el valor a facturar.",
  ],
  siguiente: "Siguiente: practica con una factura que tiene descuento.",
  pie: "Basado en el libro, pp. 248-249",
};

export const PIEZA_EL_DESCUENTO_COMERCIAL = {
  id: A1_ID,
  numero: 1,
  titulo: "El descuento comercial",
  /* Recorte del lote 1: los textos se ven enteros (los midió Near); el «¿Por qué?» va aparte. */
  textosEnteros: true,
  pantallas: [PORTADA, DOS_CLASES, EJEMPLO, NO_SE_REGISTRA, RESUMEN],
};
