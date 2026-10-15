/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · A3 DE APRENDER — «El kárdex» (pp. 215-218, 222 y 233-241).
 *
 * Fuente: la v1 de Near y sus correcciones (las obligatorias de Mello y dos
 * opcionales), con PASA de Mello. Copias en
 * orquestador/conocimiento/paquetes/t7-2-a3-v1.md y
 * t7-2-a3-a4-correcciones.md; una prueba compara cada texto de aquí contra
 * ellas, letra por letra. Lo que cambian las correcciones:
 *   · P3, P4 y P5 llevan, después del encabezado, la línea de definición de
 *     cada método, literal de AP3 de T7-1 (regla 3: T7-2 se entiende sola)
 *   · el pie de P5 pasa a «pp. 218 y 240-241»
 *   · opcional: la pregunta de P6 termina en «, en este caso?»
 *   · opcional: el saldo del 5 de julio del kárdex UEPS lleva sus totales
 *
 * Pieza de Aprender: cero FP, no entra al catálogo. Ocho pantallas.
 *
 * LAS CIFRAS son construidas (Near las cruzó: cero coincidencias con el OCR,
 * con su lista «libro», con el registro 5c y con X1 a X4). Ninguna es del
 * periódico de T7-1 (regla 3). Los tres kárdex se escriben como los da Near,
 * en la forma de la guía de Watari (columnas, sin «=»); una prueba los
 * recalcula desde los movimientos con src/contabilidad/t7_2Kardex.js.
 *
 * UEPS va con su rótulo «UEPS (no válido bajo NIIF)» en el encabezado, en la
 * tabla y en las opciones; en la prosa de Near va «UEPS», como en AP3.
 *
 * Lo que la v1 no trae y se toma de la convención de T7-1 y de A1-A2 de
 * T7-2: los botones, «Correcto.» e «Incorrecto.», y los rótulos de las dos
 * tablas («Fecha», «Movimiento», los de la guía del kárdex). Lo escrito aquí
 * que no es de Near va en PENDIENTE_DE_REVISION.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const A3_ID = "t7-2-a3-el-kardex";

export const BOTON = { empezar: "Empezar", seguir: "Seguir", confirmar: "Confirmar", probarOtra: "Probar otra" };

export const INTERFAZ = { correcto: "Correcto.", incorrecto: "Incorrecto." };

export const UEPS = "UEPS (no válido bajo NIIF)";

/*
 * [ESCRITO POR CLAUDE, NO POR LA FICHA] Rótulos que la v1 no da:
 *   · el renglón de P6 con el inventario final en el periódico (la v1 da sus
 *     cifras como «Comparación construida», sin rótulo)
 *   · el nombre de la tabla de P6 para el lector de pantalla
 */
export const PENDIENTE_DE_REVISION = {
  conPeriodico: "Inventario final con el periódico",
  nombreTabla: "Los tres kárdex al final de julio",
};

/* Los datos de la regla 10 (versión T7-2): lo que había y cada movimiento, con su fecha. Lo que queda no se da. */
export const INICIAL_A3 = Object.assign([30, 2010], { fecha: "1 jul" });
export const MOVIMIENTOS_A3 = [
  { fecha: "5 jul", compra: [50, 2130] },
  { fecha: "9 jul", venta: 60 },
  { fecha: "14 jul", compra: [40, 2250] },
  { fecha: "20 jul", venta: 35 },
];

/* Los tres kárdex de Near (pp. 239-241), en columnas. capa = [cantidad, costo unitario, costo total]. */
export const KARDEX_A3 = {
  peps: {
    titulo: "Método PEPS",
    filas: [
      { f: "1 jul", sal: [[30, 2010, 60300]] },
      { f: "5 jul", en: [[50, 2130, 106500]], sal: [[30, 2010, 60300], [50, 2130, 106500]] },
      { f: "9 jul", sa: [[30, 2010, 60300], [30, 2130, 63900]], sal: [[20, 2130, 42600]] },
      { f: "14 jul", en: [[40, 2250, 90000]], sal: [[20, 2130, 42600], [40, 2250, 90000]] },
      { f: "20 jul", sa: [[20, 2130, 42600], [15, 2250, 33750]], sal: [[25, 2250, 56250]], fin: true },
    ],
  },
  ueps: {
    titulo: `Método ${UEPS}`,
    filas: [
      { f: "1 jul", sal: [[30, 2010, 60300]] },
      /* Opcional de Mello, aplicada por Near: el saldo del 5 de julio con sus totales. */
      { f: "5 jul", en: [[50, 2130, 106500]], sal: [[30, 2010, 60300], [50, 2130, 106500]] },
      { f: "9 jul", sa: [[50, 2130, 106500], [10, 2010, 20100]], sal: [[20, 2010, 40200]] },
      { f: "14 jul", en: [[40, 2250, 90000]], sal: [[20, 2010, 40200], [40, 2250, 90000]] },
      { f: "20 jul", sa: [[35, 2250, 78750]], sal: [[20, 2010, 40200], [5, 2250, 11250]], salT: 51450, fin: true },
    ],
  },
  promedio: {
    titulo: "Método del costo promedio ponderado",
    filas: [
      { f: "1 jul", sal: [[30, 2010, 60300]] },
      { f: "5 jul", en: [[50, 2130, 106500]], sal: [[80, 2085, 166800]] },
      { f: "9 jul", sa: [[60, 2085, 125100]], sal: [[20, 2085, 41700]] },
      { f: "14 jul", en: [[40, 2250, 90000]], sal: [[60, 2195, 131700]] },
      { f: "20 jul", sa: [[35, 2195, 76825]], sal: [[25, 2195, 54875]], fin: true },
    ],
  },
};

const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Al terminar, sabrás llevar un kárdex con PEPS, UEPS y promedio ponderado.",
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 237-241",
};

/* P1 · Qué es (p. 238): dos textos y la estructura del kárdex. */
const QUE_ES = {
  id: "que-es",
  tipo: "lectura",
  parrafos: [
    "En el permanente, el inventario se lleva en una tarjeta de control de existencias, que también se llama kárdex. Ahí se anota cada unidad que entra y que sale, con su costo y su fecha.",
    "Así, en todo momento se sabe el saldo del inventario y el costo de lo vendido.",
  ],
  estructura: ["Fecha", "Entradas: cantidad, costo unitario, costo total", "Salidas: las mismas tres", "Saldos: las mismas tres"],
  boton: BOTON.seguir,
  pie: "Basado en el libro, p. 238",
};

/* P2 · Los datos (regla 10, versión T7-2). «Tauro» es un nombre inventado por Near. */
const LOS_DATOS = {
  id: "los-datos",
  tipo: "lectura",
  parrafos: ["La empresa Tauro usa el sistema de inventario permanente. Estos son sus movimientos de julio."],
  movimientos: {
    columnas: ["Fecha", "Movimiento"],
    filas: [
      ["1 de julio", "Tiene 30 unidades a $2.010"],
      ["5 de julio", "Compra 50 unidades a $2.130"],
      ["9 de julio", "Vende 60 unidades"],
      ["14 de julio", "Compra 40 unidades a $2.250"],
      ["20 de julio", "Vende 35 unidades"],
    ],
  },
  boton: BOTON.seguir,
  pie: "Basado en el libro, p. 238",
};

const PIE_PEPS = "Basado en el libro, pp. 215 y 238-239";
const CON_PEPS = {
  id: "peps",
  pista: "Con PEPS sale primero lo más antiguo. Empieza por lo que había al inicio y sigue en orden de fechas.",
  tipo: "eleccion",
  encabezado: "Método PEPS",
  parrafos: ["PEPS quiere decir: primeras en entrar, primeras en salir. El método supone que lo primero que se compró es lo primero que se vende."],
  pregunta: "Con PEPS, ¿qué unidades salen en la venta del 9 de julio?",
  opciones: [
    { id: "inicio-y-5", texto: "Las 30 del inicio y 30 de las compradas el 5 de julio.", correcta: true },
    { id: "solo-5", texto: "60 de las compradas el 5 de julio.", correcta: false, devolucion: "Con PEPS salen primero las más antiguas. Las 30 del inicio salen antes que las del 5 de julio." },
    { id: "inicio-y-14", texto: "Las 30 del inicio y 30 de las compradas el 14 de julio.", correcta: false, devolucion: "El 9 de julio todavía no había llegado la compra del 14. En el permanente, cada venta sale de lo que hay ese día." },
  ],
  pie: PIE_PEPS,
  error: { pie: PIE_PEPS },
  acierto: {
    texto: "Así es. Salen las 30 del inicio y 30 de las del 5 de julio. Quedan 20 de las del 5 de julio.",
    kardex: "peps",
    pie: PIE_PEPS,
  },
};

const PIE_UEPS = "Basado en el libro, pp. 216 y 240";
const CON_UEPS = {
  id: "ueps",
  pista: "Con UEPS sale primero lo último que entró antes de esa venta. Mira cuál fue la compra más reciente.",
  tipo: "eleccion",
  encabezado: `Método ${UEPS}`,
  parrafos: [
    "UEPS quiere decir: últimas en entrar, primeras en salir. El método supone que lo último que se compró es lo primero que se vende.",
    "El 9 de julio salieron, con UEPS, las 50 del 5 de julio y 10 del inicio.",
  ],
  pregunta: "Con UEPS, ¿de dónde salen las 35 unidades del 20 de julio?",
  opciones: [
    { id: "del-14", texto: "De las 40 compradas el 14 de julio.", correcta: true },
    { id: "inicio-y-14", texto: "De las 20 del inicio y 15 de las del 14 de julio.", correcta: false, devolucion: "Con UEPS salen primero las últimas que entraron. El 20 de julio, las últimas son las del 14." },
    { id: "del-5", texto: "De las compradas el 5 de julio.", correcta: false, devolucion: "Esas ya salieron el 9 de julio, con la primera venta." },
  ],
  pie: PIE_UEPS,
  error: { pie: PIE_UEPS },
  acierto: {
    texto: "Así es. Salen 35 de las 40 del 14 de julio. Quedan 20 del inicio y 5 del 14 de julio.",
    kardex: "ueps",
    pie: PIE_UEPS,
  },
};

/* P5 · el pie es el de la corrección. */
const PIE_PROMEDIO = "Basado en el libro, pp. 218 y 240-241";
const CON_PROMEDIO = {
  id: "promedio",
  pista: "Junta el valor del saldo con el de la compra, y divide entre todas las unidades que hay ahora.",
  tipo: "eleccion",
  encabezado: "Método del costo promedio ponderado",
  parrafos: [
    "El promedio ponderado no elige un grupo. Junta todo lo disponible y le da a cada unidad el mismo costo: el costo unitario promedio.",
    "En el permanente, el costo promedio se calcula otra vez cada vez que llegan unidades nuevas.",
  ],
  calculos: ["5 de julio: (60.300 + 106.500) ÷ 80 = $2.085 por unidad"],
  despues: ["El 9 de julio salen 60 a $2.085. Quedan 20, por $41.700."],
  pregunta: "Después de la compra del 14 de julio, ¿cuál es el nuevo costo promedio?",
  opciones: [
    { id: "2195", texto: "$2.195", correcta: true },
    /* 2.140 = 256.800 ÷ 120: cifra construida que Near metió al registro. */
    { id: "2140", texto: "$2.140", correcta: false, devolucion: "Ese es el promedio de todo el mes, como en el periódico. En el permanente se calcula con lo que hay ese día." },
    { id: "2250", texto: "$2.250", correcta: false, devolucion: "Ese es el precio de la última compra. El promedio junta las 20 unidades que quedaban y las 40 que llegaron." },
  ],
  pie: PIE_PROMEDIO,
  error: { pie: PIE_PROMEDIO },
  acierto: {
    texto: "Así es. Antes de la compra había $41.700, y llegaron $90.000 más. Son 60 unidades: cada una cuesta $2.195.",
    kardex: "promedio",
    pie: PIE_PROMEDIO,
  },
};

/* P6 · lado a lado y frente al periódico. La comparación con el periódico es construida (regla 3). */
const PIE_LADO = "Basado en el libro, pp. 222, 233-234 y 239-241";
const LADO_A_LADO = {
  id: "lado-a-lado",
  pista: "Piensa en qué método el orden de salida no depende de cuándo se hizo cada venta.",
  tipo: "eleccion",
  parrafos: ["Así quedan los tres kárdex al final de julio."],
  tabla: {
    nombre: PENDIENTE_DE_REVISION.nombreTabla,
    metodos: ["PEPS", UEPS, "Promedio ponderado"],
    filas: [
      { rubro: "Inventario final (25 unidades)", valores: [56250, 51450, 54875] },
      { rubro: "Costo de lo vendido", valores: [200550, 205350, 201925] },
      { rubro: PENDIENTE_DE_REVISION.conPeriodico, valores: [56250, 50250, 53500], construida: true },
    ],
  },
  despues: ["Si esta empresa usara el periódico, el inventario final sería otro con UEPS y con el promedio. Con PEPS sería el mismo."],
  /* Opcional de Mello, aplicada por Near: «, en este caso». */
  pregunta: "¿Qué método da el mismo inventario final en los dos sistemas, en este caso?",
  opciones: [
    { id: "peps", texto: "PEPS", correcta: true },
    { id: "ueps", texto: UEPS, correcta: false, devolucion: "Con UEPS cambia. En el permanente, cada venta sale de lo último que hay ese día, no de lo último del mes." },
    { id: "promedio", texto: "Promedio ponderado", correcta: false, devolucion: "Con el promedio cambia. En el permanente se calcula otra vez en cada compra, no una sola vez para todo el mes." },
  ],
  pie: PIE_LADO,
  error: { pie: PIE_LADO },
  acierto: {
    texto: "Exacto. Con PEPS quedan las mismas unidades: las de la última compra. Con UEPS y con el promedio, en el permanente importan las fechas.",
    despues: ["Al final del mes, el conteo físico solo revisa que haya 25 unidades en la bodega."],
    pie: PIE_LADO,
  },
};

const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  lista: [
    "El kárdex anota cada entrada y cada salida, con su costo y su fecha.",
    "En el permanente, cada venta sale de lo que hay ese día.",
    "El promedio se calcula otra vez en cada compra.",
  ],
  siguiente: "Siguiente: «San Calixto en permanente».",
  pie: "Basado en el libro, pp. 238-241",
};

export const PIEZA_EL_KARDEX = {
  id: A3_ID,
  numero: 3,
  titulo: "El kárdex",
  kardex: KARDEX_A3,
  pantallas: [PORTADA, QUE_ES, LOS_DATOS, CON_PEPS, CON_UEPS, CON_PROMEDIO, LADO_A_LADO, RESUMEN],
};
