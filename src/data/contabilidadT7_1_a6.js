/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · A6 DE APRENDER — «Devoluciones en periódico» (D-3, pp. 230-232).
 *
 * Fuente: la v1 de Near, con PASA de Mello sin correcciones. Copia en
 * orquestador/conocimiento/paquetes/t7-1-a6-v1.md; una prueba compara cada
 * texto de aquí contra ella, letra por letra.
 *
 * Pieza de Aprender: cero FP, no entra al catálogo. Las preguntas no se
 * califican.
 *
 * Diseño: la «Figura de A6» de Watari, sobre el patrón tabular v3.1. Las
 * pantallas 5 y 6 arman el asiento del 5 de junio línea por línea; las
 * pantallas 3 y 7 leen los dos libros a la vez en la tabla espejo.
 *
 * Decisiones de Watari que se respetan aquí:
 *   · las sumas aparecen solo al acertar (2.784.000 · 2.784.000), aunque sea
 *     Aprender: con cuatro montos fijos el cuadre regalaría la respuesta
 *   · la fila de las devoluciones de P7 va en negrita solo con el acierto
 *   · los tres cálculos de P4 aparecen con el acierto
 *   · el lado de cada celda va en teal o ámbar, siempre con DEBE o HABER
 * La renta no aparece, y ninguna cifra de medición es valor por defecto.
 *
 * Lo que la v1 no trae y se toma de la convención de AP1 y AP2 (para revisar):
 * los botones «Empezar», «Seguir», «Confirmar» y «Probar otra», y el rótulo
 * «Sumas». Lo que es interfaz del patrón: «Debe», «Haber», «Correcto.» e
 * «Incorrecto.».
 *
 * Nombres de cuenta: regla 8. Errata que toca: C7-15 (no se muestra el
 * asiento modelo de la p. 231).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const A6_ID = "t7-1-a6-devoluciones-en-periodico";

export const BOTON = { empezar: "Empezar", seguir: "Seguir", confirmar: "Confirmar", probarOtra: "Probar otra" };

/* Interfaz del patrón tabular (Watari): literales. */
export const INTERFAZ = {
  debe: "Debe",
  haber: "Haber",
  correcto: "Correcto.",
  incorrecto: "Incorrecto.",
  /* Rótulo de las sumas, «igual que en AP2» (guía de Watari). */
  sumas: "Sumas",
  /* La columna oculta de la tabla espejo: solo lector de pantalla (Watari). */
  monto: "Monto",
};

/*
 * Textos de interfaz de la tabla espejo que todavía esperan revisión.
 * [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN] (guía de Watari): los dos
 * encabezados y el nombre accesible de la tabla. La tabla los marca con
 * data-revision="pendiente".
 */
export const ESPEJO_PENDIENTE_DE_REVISION = {
  comprador: "Dajema (comprador)",
  vendedor: "El Tajamar (vendedor)",
  nombreTabla: (fecha) => `${fecha}: el libro del comprador y el del vendedor, lado a lado`,
};

/* Las fechas del caso, del enunciado de Near. */
export const FECHA = { compra: "1 de junio", devolucion: "5 de junio" };

export const DEBE = "debe";
export const HABER = "haber";

/* Las cifras van sin «$» dentro de las tablas, como en el patrón. */
export const cifra = (n) => n.toLocaleString("es-CO").replace(/,/g, ".");

const COMPRADOR = ESPEJO_PENDIENTE_DE_REVISION.comprador;
const VENDEDOR = ESPEJO_PENDIENTE_DE_REVISION.vendedor;

/*
 * La tabla espejo de Watari: una fila por monto, en el orden del asiento del
 * comprador, y en cada libro el lado y la cuenta. Sale de los dos asientos,
 * no se escribe aparte: funciona porque los dos libros de D-3 tienen las
 * mismas cifras en espejo. `foco` es la cuenta del comprador cuya fila se
 * señala con el acierto.
 */
function tablaEspejo(fecha, comprador, vendedor, foco = null) {
  const de = (lineas, m) => {
    const l = lineas.find((x) => x.monto === m);
    return { lado: l.lado, cuenta: l.cuenta };
  };
  return {
    fecha,
    libros: [COMPRADOR, VENDEDOR],
    nombre: ESPEJO_PENDIENTE_DE_REVISION.nombreTabla(fecha),
    filas: comprador.map((l) => ({
      monto: l.monto,
      cifra: cifra(l.monto),
      comprador: de(comprador, l.monto),
      vendedor: de(vendedor, l.monto),
      focoConAcierto: l.cuenta === foco,
    })),
  };
}

/* ═══════════ LAS CIFRAS DEL CASO (se calculan, no se copian) ═══════════ */

const IVA = 0.16;
const RETENCION = 0.035;
const COMPRA = 15200000;
const DEVUELTO = 2400000;
const iva = (b) => Math.round(b * IVA);
const ret = (b) => Math.round(b * RETENCION);
const total = (b) => b + iva(b) - ret(b);

export const CIFRAS = {
  compra: COMPRA,
  ivaCompra: iva(COMPRA), // 2.432.000
  retCompra: ret(COMPRA), // 532.000
  totalCompra: total(COMPRA), // 17.100.000
  devuelto: DEVUELTO,
  ivaDevuelto: iva(DEVUELTO), // 384.000
  retDevuelto: ret(DEVUELTO), // 84.000
  totalDevuelto: total(DEVUELTO), // 2.700.000
};

/* ═══════════ LAS PANTALLAS, EN ORDEN ═══════════ */

const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Registrar una devolución en el libro del comprador y en el del vendedor.",
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 230-232",
};

/* P1 · Qué es una devolución. */
const QUE_ES = {
  id: "que-es-una-devolucion",
  tipo: "lectura",
  parrafos: [
    "A veces la mercancía llega en mal estado o no cumple lo pactado. Entonces el cliente puede devolver toda la mercancía o una parte.",
    "Lo que para el vendedor es una devolución de ventas, para el comprador es una devolución de compras.",
    "Si la venta fue a crédito, el vendedor suele darle al comprador una nota crédito. Ahí dice cuánto le rebaja de lo que le debe, y por qué.",
  ],
  boton: BOTON.seguir,
  pie: "Basado en el libro, p. 230",
};

/* P2 · Dos cuentas propias: lectura y pregunta en la misma pantalla. */
const DOS_CUENTAS = {
  id: "dos-cuentas-propias",
  tipo: "eleccion",
  parrafos: [
    "Cada una tiene su propia cuenta. El vendedor usa Devoluciones de ventas. El comprador usa Devoluciones de compras.",
    "El libro da la razón: los administradores quieren saber cuánto se devolvió en el periodo.",
    "Devoluciones de ventas resta de Ingresos por ventas en el estado de resultados. Devoluciones de compras resta de Compras, en el costo de la mercancía vendida.",
    "Las dos se cierran contra Ganancias y pérdidas al final del periodo.",
  ],
  pregunta: "¿Por qué la devolución no se anota directo en Ingresos por ventas o en Compras?",
  opciones: [
    { id: "saber-cuanto", texto: "Para saber cuánto se devolvió en el periodo.", correcta: true },
    {
      id: "no-cambia",
      texto: "Porque una devolución no cambia el estado de resultados.",
      correcta: false,
      devolucion: "Sí lo cambia: Devoluciones de ventas resta de los ingresos, y Devoluciones de compras resta de las compras.",
    },
    {
      id: "no-se-tocan",
      texto: "Porque esas cuentas no se pueden tocar después de la venta.",
      correcta: false,
      devolucion: "El libro no da esa razón. Dice que se usan cuentas aparte para saber cuánto se devolvió.",
    },
  ],
  acierto: { texto: "Así es. Con cuentas aparte, la empresa ve cuánto se devolvió en el periodo.", calculos: [] },
  pie: "Basado en el libro, p. 230",
};

/* P3 · El caso D-3, con los dos asientos del 1 de junio ya resueltos (sin sumas: la v1 no las muestra). */
const EL_CASO = {
  id: "el-caso",
  tipo: "caso",
  enunciado: "El 1 de junio, Dajema compra mercancía a crédito a El Tajamar por $15.200.000, más el IVA. El 5 de junio, Dajema devuelve mercancía por $2.400.000, porque parte llegó en mal estado. El Tajamar se lo rebaja de lo que Dajema le debe. Las dos empresas usan el sistema de inventario periódico.",
  parrafos: [
    "En este ejercicio, el IVA es del 16 % y la retención del 3,5 %. Las dos se calculan sobre el valor de la mercancía.",
    "Las tarifas de este ejercicio son datos del libro. No las tomes como las tarifas de hoy.",
  ],
  ficha: [
    { dato: "Quién recibe", texto: "El Tajamar recibe la mercancía devuelta" },
    { dato: "Quién entrega", texto: "Dajema" },
    { dato: "Monto", texto: "$2.400.000 por la mercancía" },
    { dato: "Tipo", texto: "Se rebaja de la deuda de una compra a crédito" },
    { dato: "Clase de hecho", texto: "Devolución de mercancía que llegó en mal estado" },
  ],
  /* Los dos asientos del 1 de junio: de aquí sale la tabla espejo de P3. */
  asientos: [
    {
      libro: COMPRADOR,
      lineas: [
        { cuenta: "Compras", lado: DEBE, monto: CIFRAS.compra },
        { cuenta: "IVA por pagar", lado: DEBE, monto: CIFRAS.ivaCompra },
        { cuenta: "Retención en la fuente por pagar", lado: HABER, monto: CIFRAS.retCompra },
        { cuenta: "Cuentas por pagar – proveedores", lado: HABER, monto: CIFRAS.totalCompra },
      ],
    },
    {
      libro: VENDEDOR,
      lineas: [
        { cuenta: "Cuentas por cobrar – clientes", lado: DEBE, monto: CIFRAS.totalCompra },
        { cuenta: "Anticipo fiscal", lado: DEBE, monto: CIFRAS.retCompra },
        { cuenta: "IVA por pagar", lado: HABER, monto: CIFRAS.ivaCompra },
        { cuenta: "Ingresos por ventas", lado: HABER, monto: CIFRAS.compra },
      ],
    },
  ],
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 210, 212 y 231-232",
};

/* P3 lee los dos asientos del 1 de junio en la tabla espejo (Watari): más corta y la misma forma de P7. */
EL_CASO.espejo = tablaEspejo(FECHA.compra, EL_CASO.asientos[0].lineas, EL_CASO.asientos[1].lineas);

/* P4 · Cuánto se reversa. Los cálculos aparecen en el acierto: antes darían la respuesta. */
const CUANTO_SE_REVERSA = {
  id: "cuanto-se-reversa",
  tipo: "eleccion",
  parrafos: [],
  pregunta: "La devolución es de $2.400.000. ¿Cuánto IVA se devuelve con ella?",
  opciones: [
    { id: "proporcional", texto: `$${cifra(CIFRAS.ivaDevuelto)}`, correcta: true },
    {
      id: "todo",
      texto: `$${cifra(CIFRAS.ivaCompra)}`,
      correcta: false,
      devolucion: "Ese es el IVA de toda la compra. Con la devolución solo se reversa la parte de lo devuelto.",
    },
    {
      id: "nada",
      texto: "$0",
      correcta: false,
      devolucion: "El libro dice que se debe devolver la parte del IVA que corresponde al valor de la devolución.",
    },
  ],
  acierto: {
    texto: "Así es. Y la retención también se reversa en la misma proporción.",
    calculos: [
      `$${cifra(DEVUELTO)} × 16 % = $${cifra(CIFRAS.ivaDevuelto)}`,
      `$${cifra(DEVUELTO)} × 3,5 % = $${cifra(CIFRAS.retDevuelto)}`,
      `$${cifra(DEVUELTO)} + $${cifra(CIFRAS.ivaDevuelto)} − $${cifra(CIFRAS.retDevuelto)} = $${cifra(CIFRAS.totalDevuelto)}`,
    ],
  },
  pie: "Basado en el libro, p. 232",
};

/* P5 · Libro del comprador. Las líneas en el orden de la v1. */
const LIBRO_COMPRADOR = {
  id: "libro-del-comprador",
  tipo: "lados",
  libro: COMPRADOR,
  fecha: FECHA.devolucion,
  consigna: "Ahora el libro del comprador, Dajema. Toca Debe o Haber en cada línea.",
  lineas: [
    { id: "proveedores", cuenta: "Cuentas por pagar – proveedores", monto: CIFRAS.totalDevuelto, lado: DEBE, devolucion: "La devolución baja lo que Dajema le debe al proveedor. Un pasivo que disminuye va al debe." },
    { id: "retencion", cuenta: "Retención en la fuente por pagar", monto: CIFRAS.retDevuelto, lado: DEBE, devolucion: "En la compra, la retención fue al haber. La devolución reversa esa línea, así que ahora va al debe." },
    { id: "iva", cuenta: "IVA por pagar", monto: CIFRAS.ivaDevuelto, lado: HABER, devolucion: "En la compra, el IVA fue al debe. La devolución lo reversa: ahora va al haber." },
    { id: "devoluciones", cuenta: "Devoluciones de compras", monto: CIFRAS.devuelto, lado: HABER, devolucion: "En la compra, Compras fue al debe. La devolución reversa ese lado, pero en su propia cuenta: Devoluciones de compras, al haber." },
  ],
  acierto: { texto: "Así es. Es el asiento de la compra al revés, pero con Devoluciones de compras en lugar de Compras." },
  pie: "Basado en el libro, pp. 230 y 232",
};

/* P6 · Libro del vendedor. */
const LIBRO_VENDEDOR = {
  id: "libro-del-vendedor",
  tipo: "lados",
  libro: VENDEDOR,
  fecha: FECHA.devolucion,
  consigna: "Ahora el libro del vendedor, El Tajamar. Toca Debe o Haber en cada línea.",
  lineas: [
    { id: "devoluciones", cuenta: "Devoluciones de ventas", monto: CIFRAS.devuelto, lado: DEBE, devolucion: "En la venta, Ingresos por ventas fue al haber. La devolución reversa ese lado, pero en su propia cuenta: Devoluciones de ventas, al debe." },
    { id: "iva", cuenta: "IVA por pagar", monto: CIFRAS.ivaDevuelto, lado: DEBE, devolucion: "En la venta, el IVA fue al haber. La devolución lo reversa: ahora va al debe." },
    { id: "anticipo", cuenta: "Anticipo fiscal", monto: CIFRAS.retDevuelto, lado: HABER, devolucion: "En la venta, el anticipo fue al debe. La devolución lo reversa, así que ahora va al haber." },
    { id: "clientes", cuenta: "Cuentas por cobrar – clientes", monto: CIFRAS.totalDevuelto, lado: HABER, devolucion: "La devolución baja lo que el cliente le debe a El Tajamar. Un activo que disminuye va al haber." },
  ],
  acierto: { texto: "Así es. Es el asiento de la venta al revés, pero con Devoluciones de ventas en lugar de Ingresos por ventas." },
  pie: "Basado en el libro, pp. 230 y 232",
};

/*
 * P7 · Lado a lado, con la tabla espejo del 5 de junio. La fila de las
 * devoluciones se señala solo con el acierto (Watari).
 */
const LADO_A_LADO = {
  id: "lado-a-lado",
  tipo: "eleccion",
  parrafos: [],
  espejo: tablaEspejo(FECHA.devolucion, LIBRO_COMPRADOR.lineas, LIBRO_VENDEDOR.lineas, "Devoluciones de compras"),
  pregunta: "¿Qué tienen en común los dos registros de la devolución?",
  opciones: [
    { id: "al-reves", texto: "Los dos hacen el registro al revés, con una cuenta de devoluciones.", correcta: true },
    {
      id: "en-el-debe",
      texto: "Los dos anotan la devolución en el debe.",
      correcta: false,
      devolucion: "No. Devoluciones de compras va al haber, y Devoluciones de ventas, al debe. Cada una reversa su propio registro.",
    },
    {
      id: "ingresos",
      texto: "Los dos usan Ingresos por ventas.",
      correcta: false,
      devolucion: "Solo el vendedor usaba Ingresos por ventas. Y en la devolución no la toca: usa Devoluciones de ventas.",
    },
  ],
  acierto: { texto: "Exacto. Cada empresa reversa su propio registro, pero en lugar de Compras o de Ingresos por ventas usa su cuenta de devoluciones.", calculos: [] },
  pie: "Basado en el libro, pp. 230 y 232",
};

/* P8 · Resumen, sin botón, como en AP1. */
const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  parrafos: [
    "Una devolución es el registro original al revés.",
    "En lugar de Compras o de Ingresos por ventas, se usa la cuenta de devoluciones de cada uno.",
    "El IVA y la retención se reversan solo en la parte de lo devuelto.",
  ],
  siguiente: "Siguiente: «Control interno de los inventarios».",
  boton: null,
  pie: "Basado en el libro, pp. 230 y 232",
};

/* ═══════════ LA PIEZA ═══════════ */

export const PIEZA_DEVOLUCIONES = {
  id: A6_ID,
  numero: 6,
  titulo: "Devoluciones en periódico",
  pantallas: [PORTADA, QUE_ES, DOS_CUENTAS, EL_CASO, CUANTO_SE_REVERSA, LIBRO_COMPRADOR, LIBRO_VENDEDOR, LADO_A_LADO, RESUMEN],
};
