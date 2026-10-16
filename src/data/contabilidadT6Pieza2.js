/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 2 DE APRENDER — «Cuando un cliente no va a pagar».
 *
 * Célula B. Todo el texto que lee el estudiante vive en ESTE archivo, guardado
 * entero en orquestador/conocimiento/paquetes/b5-t6-aprender2.md. Precedencia:
 *   1. la versión que manda de Futaba (Dajema y Nancy Zea Cuesta; el castigo
 *      es por los $312.500 completos, p. 200), con las comillas internas
 *      “ ” que Futaba confirmó (término 4 y nota del término 2), y el
 *      término 3 de Sakuta con PASA de Shoko («Castigar una deuda»);
 *   2. la guía de Mai v1 con su cierre v1b (PASA de Shoko), y las dos
 *      correcciones de Shoko: el rótulo de la escena es el fragmento literal
 *      del paso 4, y la anotación de Clientes del 31 de diciembre lleva
 *      «por $312.500».
 * Las citas del libro conservan «» (son citas); las comillas internas de
 * nuestros textos van “ ” (la regla fijada en T5 · A1).
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════ LA PIEZA (lo que lee CuatroCapas: título, objetivo y capa 1) ═══════════ */

export const PIEZA_NO_VA_A_PAGAR = {
  id: "b5-t6-a2-cuando-un-cliente-no-va-a-pagar",
  numero: 2,
  titulo: "Cuando un cliente no va a pagar",
  objetivo: "Vas a ver qué es una cuenta incobrable y dos formas de anotar esa pérdida.",
  /*
   * B2 · un término por pantalla (Futaba, 15-oct): siete pantallas. La
   * desventaja de la anulación directa y los asientos del método de
   * provisiones salen a pantallas propias, para que ninguna pase de 60
   * palabras.
   */
  nombres: [
    {
      termino: "Cuentas incobrables o de difícil cobro",
      definicion: "Nacen de las ventas a crédito. Cuando el cobro de una deuda se vuelve imposible, por quiebra, muerte o cambio de domicilio del cliente, entre otras razones, se clasifica como de difícil o dudoso cobro. Es una pérdida para el negocio.",
      delLibro: "«…algunos clientes no paguen las deudas.» (p. 198)",
    },
    {
      termino: "Cómo se decide",
      definicion: "Para saber si una deuda es de difícil cobro, la empresa mira, entre otras cosas, el tiempo de vencimiento. También mira los antecedentes del cliente, su situación financiera y las garantías que le pidió.",
      delLibro: "Una deuda vigente todavía está dentro de su plazo de pago. Una vencida ya lo pasó.",
      rotuloDelLibro: "Nota",
    },
    {
      termino: "Castigar una deuda",
      definicion: "Castigar una deuda es darla de baja porque ya no se espera cobrarla. El libro dice “castigar la cuenta”.",
    },
    {
      termino: "Método de anulación directa",
      definicion: "Cuando la deuda se da por perdida, se saca de Cuentas por cobrar – clientes y su valor va al gasto. Se debita Gasto provisiones – cuentas incobrables y se acredita Cuentas por cobrar – clientes. Ojo: el nombre de ese gasto dice “provisiones”, pero este método no crea ninguna provisión.",
    },
    {
      termino: "La desventaja de la anulación directa",
      definicion: "La anulación directa es muy sencilla. Pero no guarda información de las deudas que se castigan. Y esa información sirve para decidir cómo vender a crédito.",
      delLibro: "«Este método es muy sencillo, pero presenta la desventaja de que no suministra información relacionada con la cartera castigada…» (p. 199)",
    },
    {
      termino: "Método de provisiones",
      definicion: "Al cerrar el periodo, la empresa estima qué parte de lo que le deben los clientes no va a recuperar. Ese valor se anota como gasto desde ya.",
      delLibro: "«…para determinar el probable porcentaje de cartera que no se recuperará.» (p. 200)",
    },
    {
      termino: "Los asientos del método de provisiones",
      definicion: "Al cierre, se debita Gasto provisiones – cuentas incobrables. Y se acredita una cuenta llamada Provisión para cuentas incobrables. Después, cuando una deuda se castiga, se debita esa provisión y no el gasto. La provisión se explica más en la próxima pieza.",
    },
  ],
};

/* ═══════════ CAPA 2 · «MÍRELO FUNCIONAR» · Dajema y Nancy Zea Cuesta ═══════════ */

/* Los rótulos de la escena (Mai v1b): fragmentos literales de los pasos. */
export const ESCENA_T6_A2 = {
  dia25: "25 de mayo",
  dia31: "31 de diciembre",
  venta: "Vende mercancía a crédito a Nancy Zea Cuesta",
  monto: "$312.500",
  clientes: "Cuentas por cobrar – clientes",
  ingresos: "Ingresos por ventas",
  analiza: "Analiza lo que le deben sus clientes",
  nancy: "La deuda de Nancy es prácticamente incobrable",
  factura: "Se autoriza castigar la factura",
  metodo: "Anulación directa",
  gasto: "Gasto provisiones – cuentas incobrables",
  aNombre: "A nombre de Nancy, por $312.500",
  debita: "se debita",
  acredita: "se acredita",
};

/* Los 9 pasos y el cierre, cada uno con su pie de fuente. C1-6 de Futaba (lote C2 · C1 · C7): sin el paso 10, que se volvía a decir en el cierre, y con el cierre corto. */
export const PASOS_T6_A2 = [
  { texto: "El 25 de mayo, Dajema le vende mercancía a crédito a Nancy Zea Cuesta.", pie: "Libro, p. 199" },
  { texto: "La venta es por $312.500.", pie: "Libro, p. 199" },
  { texto: "Se debita Cuentas por cobrar – clientes y se acredita Ingresos por ventas.", pie: "Basado en el libro, p. 200" },
  { texto: "El 31 de diciembre, la empresa analiza lo que le deben sus clientes.", pie: "Basado en el libro, p. 199" },
  { texto: "Concluye que la deuda de Nancy es prácticamente incobrable, pese a toda la gestión de cobro.", pie: "Libro, p. 199" },
  { texto: "Se autoriza castigar la factura.", pie: "Libro, p. 199" },
  { texto: "Dajema usa la anulación directa: la deuda se saca de Cuentas por cobrar – clientes.", pie: "Basado en el libro, pp. 199-200" },
  { texto: "Se debita Gasto provisiones – cuentas incobrables por $312.500.", pie: "Libro, p. 200" },
  { texto: "Y se acredita Cuentas por cobrar – clientes, a nombre de Nancy, por $312.500.", pie: "Basado en el libro, p. 200" },
];
export const CIERRE_T6_A2 = {
  texto: "Con la anulación directa, la deuda se borra sin dejar información aparte.",
  pie: "Basado en el libro, p. 199",
};

/* ═══════════ CAPA 3 · «AHORA PRUEBE USTED» · los dos métodos ═══════════ */

/* Consigna y decisión: entrega 2 de Futaba; consigna, texto de provisiones, tercera opción y pistas del lote C2 · C1 · C7 (C1-7 y C2). */
export const CONSIGNA_CAPA_3_T6_A2 = "Toca cada método y decide cuándo aparece el gasto. Después, mira la razón.";
export const PREGUNTA_CAPA_3_T6_A2 = "¿Cuándo aparece el gasto?";
export const OPCIONES_CAPA_3_T6_A2 = [{ id: "dia-castigo", texto: "El día del castigo" }, { id: "cierre", texto: "Al cerrar el periodo" }, { id: "venta", texto: "Cuando se vende a crédito" }];

/* Las dos cajas se ven iguales: ningún método se ve como el «bueno» (Mai). */
export const METODOS_T6_A2 = [
  {
    id: "anulacion-directa",
    nombre: "Anulación directa",
    revela: "Con este método no se anota nada por adelantado. Cada deuda se castiga cuando se da por perdida: se debita Gasto provisiones – cuentas incobrables y se acredita Cuentas por cobrar – clientes. El gasto aparece el día del castigo.",
    pie: "Basado en el libro, p. 199",
    correcta: "dia-castigo",
    falla: {
      cierre: "Con este método, el gasto se anota cuando la deuda se da por perdida.",
      venta: "No: con este método no se anota nada antes. El gasto llega cuando la deuda se pierde.",
    },
    pista: "Pregúntate si este método anota algo antes de que una deuda se dé por perdida.",
  },
  {
    id: "provisiones",
    nombre: "Provisiones",
    revela: "Al cerrar el periodo se estima qué parte no se recuperará, y ese valor se anota como gasto desde ya. El gasto aparece antes de saber qué deuda se pierde.",
    pie: "Basado en el libro, p. 200",
    correcta: "cierre",
    falla: {
      "dia-castigo": "Con provisiones, el gasto ya se anotó al cerrar el periodo.",
      venta: "No: al vender todavía no se sabe qué parte se va a perder. Eso se estima al cierre.",
    },
    pista: "Este método estima la pérdida antes de saber qué deuda se va a perder.",
  },
];
/*
 * La figura de la capa 3 (Mai, enganche B1-B5 §2b; textos nuevos, para
 * Shoko): una rejilla, los dos métodos por los dos momentos. Al decidirse un
 * método se llena su fila, siempre con lo correcto. Con la auditoría de
 * Shoko, la rejilla lleva título y solo dice dónde aparece el gasto:
 * anulación directa, «—» al cerrar y «Gasto» al castigar; provisiones,
 * «Gasto» al cerrar y «—» al castigar. «Provisión» ya no sale: delataba la
 * respuesta de la capa 4.
 */
export const FIGURA_CAPA_3_T6_A2 = {
  titulo: "¿Cuándo aparece el gasto?",
  columnas: [{ id: "cierre", texto: "Al cerrar el periodo" }, { id: "castigo", texto: "Al castigar" }],
  filas: {
    "anulacion-directa": { cierre: "—", castigo: "Gasto" },
    provisiones: { cierre: "Gasto", castigo: "—" },
  },
};
export const FINAL_CAPA_3_T6_A2 = {
  texto: "En los dos métodos, al castigar, se acredita Cuentas por cobrar – clientes. Lo que cambia es qué se debita y cuándo aparece el gasto.",
  pie: "Basado en el libro, pp. 199-200",
};

/* ═══════════ CAPA 4 · «EN UNA FRASE» (UnaFrase, sin cambios) ═══════════ */

export const PREGUNTA_FINAL_T6_A2 = "Con el método de provisiones, ¿qué se debita el día que se castiga una deuda?";
/* En el orden de Futaba; UnaFrase las baraja una vez al cargar. */
export const OPCIONES_FINAL_T6_A2 = [
  {
    id: "b5-t6-a2-provision",
    texto: "La provisión, porque el gasto ya estaba anotado.",
    correcta: true,
    feedback: "Correcto. Con provisiones, el gasto se anota al cerrar el periodo. Al castigar, se debita la provisión.",
  },
  {
    id: "b5-t6-a2-gasto",
    texto: "El gasto, porque la deuda se perdió ese día.",
    correcta: false,
    feedback: "No es esa. Eso pasa con la anulación directa. Con provisiones, el gasto ya se anotó al cerrar el periodo.",
  },
  {
    id: "b5-t6-a2-clientes",
    texto: "Cuentas por cobrar – clientes, porque la deuda desaparece.",
    correcta: false,
    feedback: "No es esa. Cuentas por cobrar – clientes baja, así que se acredita. Lo que se debita es la provisión.",
  },
  {
    id: "b5-t6-a2-ingresos",
    texto: "Ingresos por ventas, porque nunca se cobró.",
    correcta: false,
    feedback: "No es esa. La venta sí ocurrió y su ingreso se queda. La pérdida se anota por otro lado: contra la provisión.",
  },
];
