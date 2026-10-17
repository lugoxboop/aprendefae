/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · A6 DE APRENDER — «Devoluciones en periódico» (pp. 230-232), en el
 * motor C3 de la célula (t7/aprenderC3.jsx).
 *
 * Reemplaza a la A6 tabular (contabilidadT7_1_a6.js + DevolucionesEnPeriodico)
 * con el mismo id y en la misma posición. Fuente: la «Pieza 3» del Patrón de
 * enganche C3 de Watari (orquestador/conocimiento/paquetes/
 * patron-enganche-c3-v1.html, sección id="a6"; su a6.js, en CODIGO.a6).
 * Una prueba saca las pantallas de ese a6.js y las compara enteras, en los
 * dos sentidos, con estos cambios encima (y solo estos):
 *
 *   · M-1 de Mello (auditoria-mello-patron-c3.md §3): en «dos-cuentas-propias»
 *     y «lado-a-lado», la consigna sale del texto a `consigna`, y la pregunta
 *     del lado a lado sale a `pregunta`: el motor pinta la consigna solo hasta
 *     que aparece la pregunta.
 *   · Los rótulos [W] de Near (c3-rotulos-near.md, «## A6»), letra por letra:
 *     los dos selectores, las dos consignas, el título de la miniatura,
 *     «Ventas, menos devoluciones» (en vez de «Ventas netas») y «Se queda con
 *     Dajema».
 *   · A6-1 de Mello: la barra del IVA va entera hasta el acierto (eso es de
 *     la figura: DevolucionesEnPeriodicoC3.jsx).
 *   · «dos-cuentas-propias» con el texto de Near en main: la devolución de
 *     «no-cambia» es la de main («resta de los ingresos»); el a6.js de Watari
 *     la cambió sin marcarla [R] ni [W].
 *
 * PENDIENTE DE NEAR (nunca en pantalla): Near está reescribiendo
 * «dos-cuentas-propias» (N-1 y N-2 de Mello: 78 palabras con M-1; opciones de
 * 8, 9 y 11 palabras). Va con el texto de hoy hasta que llegue el suyo.
 *
 * `pasosAntes` (no es de Watari): lo que el recorrido de canonEnganche.js
 * toca antes de responder en las dos pantallas con `antes`.
 *
 * Pieza de Aprender: cero FP, no entra al catálogo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const A6_ID = "t7-1-a6-devoluciones-en-periodico";

/* ═══════════ LAS CIFRAS DEL CASO (se calculan, no se copian) ═══════════ */

const IVA = 0.16;
const RETENCION = 0.035;
const COMPRA = 15200000;
const DEVUELTO = 2400000;
const iva = (b) => Math.round(b * IVA);
const ret = (b) => Math.round(b * RETENCION);

export const CIFRAS = {
  compra: COMPRA,
  ivaCompra: iva(COMPRA), // 2.432.000
  retCompra: ret(COMPRA), // 532.000
  totalCompra: COMPRA + iva(COMPRA) - ret(COMPRA), // 17.100.000
  devuelto: DEVUELTO,
  ivaDevuelto: iva(DEVUELTO), // 384.000
  retDevuelto: ret(DEVUELTO), // 84.000
  totalDevuelto: DEVUELTO + iva(DEVUELTO) - ret(DEVUELTO), // 2.700.000
};

/* La misma tajada en la mercancía y en el IVA: 15,79 %. */
export const PCT = (100 * DEVUELTO) / COMPRA;

export const pesos = (n) => "$" + Math.round(n).toLocaleString("es-CO");

/* Los tres cálculos de Near, que caen con el acierto de «cuanto-se-reversa». */
export const CALCULOS = [
  `${pesos(DEVUELTO)} × 16 % = ${pesos(CIFRAS.ivaDevuelto)}`,
  `${pesos(DEVUELTO)} × 3,5 % = ${pesos(CIFRAS.retDevuelto)}`,
  `${pesos(DEVUELTO)} + ${pesos(CIFRAS.ivaDevuelto)} − ${pesos(CIFRAS.retDevuelto)} = ${pesos(CIFRAS.totalDevuelto)}`,
];

/* ═══════════ LOS TEXTOS DE LA FIGURA ═══════════
 * Los de Watari, letra por letra de su a6.js; los marcados [W], los de Near. */
export const FIGURA = {
  escena: {
    vendedor: "Vendedor",
    comprador: "Comprador",
    mercancia: "Mercancía",
    enMalEstado: "En mal estado",
    devuelta: "Devuelta",
    nota: "Nota crédito",
    notaDice: "Cuánto le rebaja, y por qué",
    paraVendedor: "Para el vendedor: ",
    devVentas: "devolución de ventas",
    paraComprador: "Para el comprador: ",
    devCompras: "devolución de compras",
    devolver: "Devolver la mercancía", // [W]
  },
  estado: {
    directo: "Restar de las ventas", // [W]
    aparte: "En su propia cuenta", // [W]
    titulo: "Estado de resultados · El Tajamar", // [W]
    ingresos: "Ingresos por ventas",
    devoluciones: "− Devoluciones de ventas",
    neto: "Ventas, menos devoluciones", // [W]
    vacio: "—",
  },
  barra: {
    nombre: "La compra del 1 de junio",
    cabecera: "Dajema compra · El Tajamar vende",
    fecha: "1 de junio",
    comprada: "Mercancía comprada", // [W]
    devuelta: "Devuelta · 5 de junio", // [W]
    queda: "Se queda con Dajema", // [W]
    rotulo: "Inventario periódico. IVA 16 % y retención 3,5 %, sobre la mercancía. Tarifas del libro, no las de hoy.",
    pelar: "Devolver $2.400.000", // [W]
  },
  tajada: {
    nombre: "La mercancía y su IVA",
    mercancia: "Mercancía · ",
    iva: "IVA de la compra · ",
    bases: "Cuánto IVA se devuelve",
  },
  libros: {
    comprador: "Libro de Dajema · 5 de junio", // [W]
    vendedor: "Libro de El Tajamar · 5 de junio", // [W]
  },
  espejo: {
    j1: "1 de junio · compra", // [W]
    j5: "5 de junio · devolución", // [W]
    comprador: "Dajema · comprador", // [W]
    vendedor: "El Tajamar · vendedor", // [W]
  },
};

/* ═══════════ LAS LÍNEAS DE LOS DOS LIBROS DEL 5 DE JUNIO ═══════════
 * Cada una con su fantasma: la línea del 1 de junio que reversa. */
export const J1 = "1 de junio";
const ln = (id, cuenta, monto, lado, fantasma, pista, devolucion) => ({ id, cuenta, monto, lado, fantasma: { ...fantasma, fecha: J1 }, pista, devolucion });

export const COMPRADOR = [
  ln("proveedores", "Cuentas por pagar – proveedores", CIFRAS.totalDevuelto, "debe", { cuenta: "Cuentas por pagar – proveedores", monto: CIFRAS.totalCompra }, "Dajema ahora le debe menos al proveedor. ¿De qué lado baja un pasivo?", "La devolución baja lo que Dajema le debe al proveedor. Un pasivo que disminuye va al debe."),
  ln("retencion", "Retención en la fuente por pagar", CIFRAS.retDevuelto, "debe", { cuenta: "Retención en la fuente por pagar", monto: CIFRAS.retCompra }, "La retención que Dajema descontó también baja con la devolución. ¿De qué lado baja un pasivo?", "En la compra, la retención fue al haber. La devolución reversa esa línea, así que ahora va al debe."),
  ln("iva", "IVA por pagar", CIFRAS.ivaDevuelto, "haber", { cuenta: "IVA por pagar", monto: CIFRAS.ivaCompra }, "En la compra, este IVA fue al debe. La devolución lo reversa.", "En la compra, el IVA fue al debe. La devolución lo reversa: ahora va al haber."),
  ln("devoluciones", "Devoluciones de compras", CIFRAS.devuelto, "haber", { cuenta: "Compras", monto: CIFRAS.compra }, "Esta cuenta hace lo contrario de Compras. ¿De qué lado iba Compras?", "En la compra, Compras fue al debe. La devolución reversa ese lado, pero en su propia cuenta: Devoluciones de compras, al haber."),
];

export const VENDEDOR = [
  ln("devoluciones", "Devoluciones de ventas", CIFRAS.devuelto, "debe", { cuenta: "Ingresos por ventas", monto: CIFRAS.compra }, "Esta cuenta hace lo contrario de Ingresos por ventas. ¿De qué lado iba la venta?", "En la venta, Ingresos por ventas fue al haber. La devolución reversa ese lado, pero en su propia cuenta: Devoluciones de ventas, al debe."),
  ln("iva", "IVA por pagar", CIFRAS.ivaDevuelto, "debe", { cuenta: "IVA por pagar", monto: CIFRAS.ivaCompra }, "El Tajamar ya no le debe al Estado el IVA de lo devuelto. ¿De qué lado baja un pasivo?", "En la venta, el IVA fue al haber. La devolución lo reversa: ahora va al debe."),
  ln("anticipo", "Anticipo fiscal", CIFRAS.retDevuelto, "haber", { cuenta: "Anticipo fiscal", monto: CIFRAS.retCompra }, "El anticipo era algo a favor de El Tajamar. Con la devolución, ese valor baja.", "En la venta, el anticipo fue al debe. La devolución lo reversa, así que ahora va al haber."),
  ln("clientes", "Cuentas por cobrar – clientes", CIFRAS.totalDevuelto, "haber", { cuenta: "Cuentas por cobrar – clientes", monto: CIFRAS.totalCompra }, "El cliente ahora le debe menos a El Tajamar. ¿De qué lado baja un activo?", "La devolución baja lo que el cliente le debe a El Tajamar. Un activo que disminuye va al haber."),
];

/* ═══════════ LAS PANTALLAS, EN ORDEN ═══════════ */

export const PANTALLAS = [
  { id: "portada", tipo: "portada", texto: "Registrar una devolución en el libro del comprador y en el del vendedor.", boton: "Empezar", pie: "Basado en el libro, pp. 230-232" },
  { id: "que-es-una-devolucion", tipo: "lectura", texto: "A veces la mercancía llega en mal estado y el cliente devuelve toda o una parte. Si la venta fue a crédito, el vendedor le da una nota crédito: ahí dice cuánto le rebaja de lo que le debe, y por qué.",
    listo: (s) => s.fig.devuelta, pie: "Basado en el libro, p. 230" },
  /* C1: «El libro da la razón…» y los dos párrafos siguientes de Near pasan al «¿Por qué?» del acierto. PENDIENTE DE NEAR (N-1, N-2). */
  { id: "dos-cuentas-propias", tipo: "eleccion", texto: "Cada una tiene su propia cuenta. El vendedor usa Devoluciones de ventas. El comprador usa Devoluciones de compras.",
    consigna: "Compara las dos formas de anotar la devolución.",
    pregunta: "¿Por qué la devolución no se anota directo en Ingresos por ventas o en Compras?",
    pista: "Piensa qué dato perdería la gerencia si la devolución se restara directo de la venta.",
    opciones: [{ id: "saber-cuanto", t: "Para saber cuánto se devolvió en el periodo.", correcta: true },
      { id: "no-cambia", t: "Porque una devolución no cambia el estado de resultados.", devolucion: "Sí lo cambia: Devoluciones de ventas resta de los ingresos, y Devoluciones de compras resta de las compras." },
      { id: "no-se-tocan", t: "Porque esas cuentas no se pueden tocar después de la venta.", devolucion: "El libro no da esa razón. Dice que se usan cuentas aparte para saber cuánto se devolvió." }],
    antes: (s) => s.fig.vioAparte, pasosAntes: ['[data-accion="modo"][data-v="aparte"]'], bien: "Así es. Con cuentas aparte, la empresa ve cuánto se devolvió en el periodo.",
    porque: "El libro da la razón: los administradores quieren saber cuánto se devolvió en el periodo. Devoluciones de ventas resta de Ingresos por ventas en el estado de resultados. Devoluciones de compras resta de Compras, en el costo de la mercancía vendida. Las dos se cierran contra Ganancias y pérdidas al final del periodo.",
    pie: "Basado en el libro, p. 230" },
  { id: "el-caso", tipo: "lectura", texto: "El 1 de junio, Dajema compra mercancía a crédito a El Tajamar por $15.200.000, más el IVA. El 5 de junio le devuelve una parte, porque llegó en mal estado. El Tajamar se la rebaja de lo que Dajema le debe.",
    listo: (s) => s.fig.pelada, pie: "Basado en el libro, pp. 210, 212 y 231-232" },
  { id: "cuanto-se-reversa", tipo: "eleccion", enFigura: true, texto: "La devolución es de $2.400.000. ¿Cuánto IVA se devuelve con ella?",
    pista: "El IVA va con la mercancía. Si vuelve solo una parte, ¿cuánto IVA vuelve con ella?",
    opciones: [{ id: "proporcional", t: "$384.000", correcta: true },
      { id: "todo", t: "$2.432.000", devolucion: "Ese es el IVA de toda la compra. Con la devolución solo se reversa la parte de lo devuelto." },
      { id: "nada", t: "$0", devolucion: "El libro dice que se debe devolver la parte del IVA que corresponde al valor de la devolución." }],
    bien: "Así es. Y la retención también se reversa en la misma proporción.", pie: "Basado en el libro, p. 232" },
  { id: "libro-del-comprador", tipo: "lados", texto: "Ahora el libro del comprador, Dajema. Toca Debe o Haber en cada línea.", lineas: COMPRADOR,
    bien: "Así es. Es el asiento de la compra al revés, pero con Devoluciones de compras en lugar de Compras.", pie: "Basado en el libro, pp. 230 y 232" },
  { id: "libro-del-vendedor", tipo: "lados", texto: "Ahora el libro del vendedor, El Tajamar. Toca Debe o Haber en cada línea.", lineas: VENDEDOR,
    bien: "Así es. Es el asiento de la venta al revés, pero con Devoluciones de ventas en lugar de Ingresos por ventas.", pie: "Basado en el libro, pp. 230 y 232" },
  { id: "lado-a-lado", tipo: "eleccion",
    consigna: "Cambia de fecha y mira de qué lado queda cada línea.",
    pregunta: "¿Qué tienen en común los dos registros de la devolución?",
    pista: "Mira qué cuenta usó cada libro para la devolución, y si quedó del mismo lado que el registro original.",
    opciones: [{ id: "al-reves", t: "Los dos hacen el registro al revés, con una cuenta de devoluciones.", correcta: true },
      { id: "en-el-debe", t: "Los dos anotan la devolución en el debe.", devolucion: "No. Devoluciones de compras va al haber, y Devoluciones de ventas, al debe. Cada una reversa su propio registro." },
      { id: "ingresos", t: "Los dos usan Ingresos por ventas.", devolucion: "Solo el vendedor usaba Ingresos por ventas. Y en la devolución no la toca: usa Devoluciones de ventas." }],
    antes: (s) => s.fig.vioJ1, pasosAntes: ['[data-accion="fecha"][data-v="j1"]'], bien: "Exacto. Cada empresa reversa su propio registro, pero en lugar de Compras o de Ingresos por ventas usa su cuenta de devoluciones.", pie: "Basado en el libro, pp. 230 y 232" },
  { id: "resumen", tipo: "resumen", boton: null, lista: ["Una devolución es el registro original al revés.", "En lugar de Compras o de Ingresos por ventas, se usa la cuenta de devoluciones de cada uno.", "El IVA y la retención se reversan solo en la parte de lo devuelto."],
    siguiente: "Siguiente: «Control interno de los inventarios».", pie: "Basado en el libro, pp. 230 y 232" },
];

/* El estado de la figura al empezar: nada devuelto ni pelado; «Restar de las ventas» y el 5 de junio a la vista. */
export const FIG_INICIAL = { devuelta: false, pelada: false, modo: "directo", vioAparte: false, fecha: "j5", vioJ1: false };

export const PIEZA_DEVOLUCIONES_C3 = {
  id: A6_ID,
  numero: 6,
  titulo: "Devoluciones en periódico",
  clase: "a6",
  fig: FIG_INICIAL,
  pantallas: PANTALLAS,
};
