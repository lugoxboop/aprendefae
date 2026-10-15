/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · A4 DE APRENDER — «San Calixto en permanente» (pp. 222, 225 y
 * 233-243). Ejemplo F-1 del libro.
 *
 * Fuente: la v1 de Near y sus correcciones, con PASA de Mello. Copias en
 * orquestador/conocimiento/paquetes/t7-2-a4-v1.md y
 * t7-2-a3-a4-correcciones.md; una prueba compara cada texto de aquí contra
 * ellas, letra por letra. Lo que cambian las correcciones:
 *   · obligatoria 1: el kárdex del promedio va en columnas, sin «=», y sus
 *     cálculos con «≈» (el costo unitario va redondeado)
 *   · obligatoria 2: en UEPS, los saldos del 2 y del 4 de febrero llevan
 *     sus capas, sin total
 *
 * Pieza de Aprender: cero FP, no entra al catálogo. Ocho pantallas.
 *
 * LA DECISIÓN DE MELLO SOBRE F-1, CASILLA POR CASILLA: toda casilla de los
 * tres kárdex cuyo costo total está en X2 va como «unidades × costo
 * unitario», sin el total (null: la casilla discontinua vacía de la guía de
 * Watari). Las demás van completas. No se muestra el estado de resultados de
 * la p. 244, ni la suma de las salidas, ni ninguna cifra del periódico. Una
 * prueba recalcula los tres kárdex desde los movimientos y comprueba, casilla
 * por casilla, que van sin total justo las de X2.
 *
 * UEPS va con su rótulo «UEPS (no válido bajo NIIF)».
 *
 * Lo que la v1 no trae y se toma de la convención (T7-1, A1-A3 de T7-2): los
 * botones, «Correcto.» e «Incorrecto.», y los rótulos de las tablas. Lo
 * escrito aquí que no es de Near va en PENDIENTE_DE_REVISION.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const A4_ID = "t7-2-a4-san-calixto";

export const BOTON = { empezar: "Empezar", seguir: "Seguir", confirmar: "Confirmar", probarOtra: "Probar otra" };

export const UEPS = "UEPS (no válido bajo NIIF)";

/* Las cifras de X2 (decisión de corte y de Mello): nunca se muestran en T7-2. */
export const X2 = [6_760_000, 5_280_000, 3_975_000, 3_375_000, 4_830_000, 17_460_000, 24_220_000, 1_518_000, 22_702_000, 45_793_000, 23_091_000, 11_091_000];

/*
 * [ESCRITO POR CLAUDE, NO POR LA FICHA] La lista de P5 con los tres finales:
 * la v1 da sus cifras («Finales que se ven: UEPS 1.486.000 · promedio
 * 1.512.646 · PEPS "1.100 × $1.380"»), no cómo se escriben.
 */
export const PENDIENTE_DE_REVISION = {
  finales: [`${UEPS}: 1.486.000`, "Promedio ponderado: 1.512.646", "PEPS: 1.100 × $1.380"],
};

/* Los datos de la regla 10, versión T7-2. Las ventas, solo en unidades. */
export const INICIAL_A4 = Object.assign([5200, 1300], { fecha: "1 feb" });
export const MOVIMIENTOS_A4 = [
  { fecha: "2 feb", compra: [4000, 1320] },
  { fecha: "4 feb", compra: [3000, 1325] },
  { fecha: "6 feb", venta: 4500 },
  { fecha: "8 feb", venta: 5500 },
  { fecha: "12 feb", compra: [2500, 1350] },
  { fecha: "16 feb", venta: 1800 },
  { fecha: "20 feb", venta: 2500 },
  { fecha: "25 feb", compra: [3500, 1380] },
  { fecha: "28 feb", venta: 2800 },
];

/* Los tres kárdex (pp. 239-241), con la guía de Watari y las correcciones. null = sin total (X2). */
export const KARDEX_A4 = {
  peps: {
    titulo: "Método PEPS",
    filas: [
      { f: "1 feb", sal: [[5200, 1300, null]] },
      { f: "2 feb", en: [[4000, 1320, null]], sal: [[5200, 1300, null], [4000, 1320, null]] },
      { f: "4 feb", en: [[3000, 1325, null]], sal: [[5200, 1300, null], [4000, 1320, null], [3000, 1325, null]] },
      { f: "6 feb", sa: [[4500, 1300, 5850000]], sal: [[700, 1300, 910000], [4000, 1320, null], [3000, 1325, null]] },
      { f: "8 feb", sa: [[700, 1300, 910000], [4000, 1320, null], [800, 1325, 1060000]], saT: 7250000, sal: [[2200, 1325, 2915000]] },
      { f: "12 feb", en: [[2500, 1350, null]], sal: [[2200, 1325, 2915000], [2500, 1350, null]] },
      { f: "16 feb", sa: [[1800, 1325, 2385000]], sal: [[400, 1325, 530000], [2500, 1350, null]] },
      { f: "20 feb", sa: [[400, 1325, 530000], [2100, 1350, 2835000]], saT: 3365000, sal: [[400, 1350, 540000]] },
      { f: "25 feb", en: [[3500, 1380, null]], sal: [[400, 1350, 540000], [3500, 1380, null]] },
      { f: "28 feb", sa: [[400, 1350, 540000], [2400, 1380, 3312000]], saT: 3852000, sal: [[1100, 1380, null]], fin: true },
    ],
  },
  ueps: {
    titulo: `Método ${UEPS}`,
    filas: [
      { f: "1 feb", sal: [[5200, 1300, null]] },
      /* Obligatoria 2: los saldos del 2 y del 4 de febrero llevan sus capas. */
      { f: "2 feb", en: [[4000, 1320, null]], sal: [[5200, 1300, null], [4000, 1320, null]] },
      { f: "4 feb", en: [[3000, 1325, null]], sal: [[5200, 1300, null], [4000, 1320, null], [3000, 1325, null]] },
      { f: "6 feb", sa: [[3000, 1325, null], [1500, 1320, 1980000]], sal: [[5200, 1300, null], [2500, 1320, 3300000]] },
      { f: "8 feb", sa: [[2500, 1320, 3300000], [3000, 1300, 3900000]], sal: [[2200, 1300, 2860000]] },
      { f: "12 feb", en: [[2500, 1350, null]], sal: [[2200, 1300, 2860000], [2500, 1350, null]] },
      { f: "16 feb", sa: [[1800, 1350, 2430000]], sal: [[2200, 1300, 2860000], [700, 1350, 945000]] },
      { f: "20 feb", sa: [[700, 1350, 945000], [1800, 1300, 2340000]], sal: [[400, 1300, 520000]] },
      { f: "25 feb", en: [[3500, 1380, null]], sal: [[400, 1300, 520000], [3500, 1380, null]] },
      { f: "28 feb", sa: [[2800, 1380, 3864000]], sal: [[400, 1300, 520000], [700, 1380, 966000]], salT: 1486000, fin: true },
    ],
  },
  /* Obligatoria 1: en columnas, sin «=». Los totales son los del libro, sin redondear el costo. */
  promedio: {
    titulo: "Método del costo promedio ponderado",
    filas: [
      { f: "1 feb", sal: [[5200, 1300, null]] },
      { f: "2 feb", en: [[4000, 1320, null]], sal: [[9200, 1308.7, 12040000]] },
      { f: "4 feb", en: [[3000, 1325, null]], sal: [[12200, 1312.7, 16015000]] },
      { f: "6 feb", sa: [[4500, 1312.7, 5907172]], sal: [[7700, 1312.7, 10107828]] },
      { f: "8 feb", sa: [[5500, 1312.7, 7219877]], sal: [[2200, 1312.7, 2887951]] },
      { f: "12 feb", en: [[2500, 1350, null]], sal: [[4700, 1332.54, 6262951]] },
      { f: "16 feb", sa: [[1800, 1332.54, 2398577]], sal: [[2900, 1332.54, 3864374]] },
      { f: "20 feb", sa: [[2500, 1332.54, 3331357]], sal: [[400, 1332.54, 533017]] },
      { f: "25 feb", en: [[3500, 1380, null]], sal: [[3900, 1375.13, 5363017]] },
      { f: "28 feb", sa: [[2800, 1375.13, 3850371]], sal: [[1100, 1375.13, 1512646]], fin: true },
    ],
  },
};

const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Al terminar, verás qué cambia en San Calixto cuando la empresa usa el sistema permanente.",
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 238-243",
};

const LOS_DATOS = {
  id: "los-datos",
  tipo: "lectura",
  parrafos: ["En este caso, San Calixto lleva su inventario con el sistema permanente. Así se movió en febrero."],
  movimientos: {
    columnas: ["Fecha", "Movimiento"],
    filas: [
      ["1 feb", "Tiene 5.200 unidades a $1.300"],
      ["2 feb", "Compra 4.000 a $1.320"],
      ["4 feb", "Compra 3.000 a $1.325"],
      ["6 feb", "Vende 4.500"],
      ["8 feb", "Vende 5.500"],
      ["12 feb", "Compra 2.500 a $1.350"],
      ["16 feb", "Vende 1.800"],
      ["20 feb", "Vende 2.500"],
      ["25 feb", "Compra 3.500 a $1.380"],
      ["28 feb", "Vende 2.800"],
    ],
  },
  boton: BOTON.seguir,
  pie: "Basado en el libro, p. 238",
};

const PIE_PEPS = "Basado en el libro, p. 239";
const CON_PEPS = {
  id: "peps",
  pista: "Con PEPS sale primero lo más antiguo. ¿Alcanza lo que había al inicio para cubrir las 4.500?",
  tipo: "eleccion",
  pregunta: "Con PEPS, ¿de dónde salen las 4.500 unidades del 6 de febrero?",
  opciones: [
    { id: "inicial", texto: "Todas del inventario inicial.", correcta: true },
    { id: "del-4", texto: "De las compradas el 4 de febrero.", correcta: false, devolucion: "Con PEPS salen primero las más antiguas. Había 5.200 del inicio, y alcanzan para la venta." },
    { id: "del-25", texto: "De las compradas el 25 de febrero.", correcta: false, devolucion: "El 6 de febrero todavía no había llegado la compra del 25. Cada venta sale de lo que hay ese día." },
  ],
  pie: PIE_PEPS,
  error: { pie: PIE_PEPS },
  acierto: {
    texto: "Así es. Había 5.200 del inicio, y con PEPS salen primero. Las 4.500 cuestan 4.500 × $1.300 = $5.850.000.",
    kardex: "peps",
    pie: PIE_PEPS,
  },
};

const PIE_UEPS = "Basado en el libro, p. 240";
const CON_UEPS = {
  id: "ueps",
  pista: "Con UEPS sale primero lo último que entró antes del 6 de febrero. Lo que llegó después aún no existe.",
  tipo: "eleccion",
  encabezado: `Método ${UEPS}`,
  pregunta: "Con UEPS, ¿de dónde salen las 4.500 unidades del 6 de febrero?",
  opciones: [
    { id: "del-4-y-2", texto: "3.000 del 4 de febrero y 1.500 del 2 de febrero.", correcta: true },
    { id: "del-25-y-12", texto: "3.500 del 25 de febrero y 1.000 del 12 de febrero.", correcta: false, devolucion: "El 6 de febrero todavía no habían llegado las compras del 12 y del 25. Cada venta sale de lo que hay ese día." },
    { id: "inicial", texto: "Todas del inventario inicial.", correcta: false, devolucion: "Ese sería PEPS. Con UEPS salen primero las últimas que entraron: las del 4 de febrero." },
  ],
  pie: PIE_UEPS,
  error: { pie: PIE_UEPS },
  acierto: {
    texto: "Así es. Salen las 3.000 del 4 de febrero y 1.500 de las del 2 de febrero.",
    kardex: "ueps",
    pie: PIE_UEPS,
  },
};

const PIE_PROMEDIO = "Basado en el libro, pp. 240-241";
const CON_PROMEDIO = {
  id: "promedio",
  pista: "Si llega mercancía más cara que el promedio que había, ¿hacia dónde se mueve ese promedio?",
  tipo: "eleccion",
  encabezado: "Método del costo promedio ponderado",
  pregunta: "El 12 de febrero llegan 2.500 unidades a $1.350, más caras que el promedio de ese día. ¿Qué pasa con el costo promedio?",
  opciones: [
    { id: "sube", texto: "Sube", correcta: true },
    { id: "baja", texto: "Baja", correcta: false, devolucion: "Entran unidades más caras que el promedio, así que el promedio no puede bajar." },
    { id: "no-cambia", texto: "No cambia", correcta: false, devolucion: "En el permanente, el promedio se calcula otra vez con cada compra." },
  ],
  pie: PIE_PROMEDIO,
  error: { pie: PIE_PROMEDIO },
  acierto: {
    texto: "Así es: pasa de $1.312,70 a $1.332,54.",
    /* Obligatoria 1: «≈», porque el costo unitario va redondeado. Las cifras de X2, como multiplicación. */
    calculos: [
      "(5.200 × 1.300 + 4.000 × 1.320) ÷ 9.200 ≈ $1.308,70",
      "(12.040.000 + 3.000 × 1.325) ÷ 12.200 ≈ $1.312,70",
      "(2.887.951 + 2.500 × 1.350) ÷ 4.700 ≈ $1.332,54",
      "(533.017 + 3.500 × 1.380) ÷ 3.900 ≈ $1.375,13",
    ],
    kardex: "promedio",
    /* La nota de redondeo va arriba del kárdex del promedio (guía de Watari). */
    notaKardex: "Los costos unitarios van redondeados. Los totales se calculan sin redondear, como en el libro.",
    pie: PIE_PROMEDIO,
  },
};

/* P5 · qué cambia frente al periódico, sin cifras de T7-1. */
const PIE_CAMBIA = "Basado en el libro, pp. 222, 233-234 y 239-240";
const QUE_CAMBIA = {
  id: "que-cambia",
  pista: "Recorre el kárdex por fechas: cada venta solo podía usar lo que ya había llegado.",
  tipo: "eleccion",
  parrafos: [
    "Con PEPS, al final quedan 1.100 unidades de la compra del 25 de febrero, a $1.380. Es el mismo resultado que con el periódico.",
    "Con UEPS y con el promedio, el resultado del permanente es otro: aquí importan las fechas de las ventas.",
  ],
  finales: PENDIENTE_DE_REVISION.finales,
  pregunta: "Con UEPS, ¿por qué quedan 400 unidades del inicio y 700 del 25 de febrero?",
  opciones: [
    { id: "ese-dia", texto: "Porque cada venta salió de lo último que había ese día.", correcta: true },
    { id: "siempre", texto: "Porque UEPS deja siempre las del inicio.", correcta: false, devolucion: "No siempre. Las ventas sacaron casi todas las del inicio, pero no todas: quedaron 400. Y quedaron 700 del 25 porque la venta del 28 fue más pequeña que esa compra." },
    { id: "conteo", texto: "Porque el conteo encontró esas unidades.", correcta: false, devolucion: "En el permanente, el conteo no decide qué queda: lo dice el kárdex. El conteo solo lo verifica." },
  ],
  pie: PIE_CAMBIA,
  error: { pie: PIE_CAMBIA },
  acierto: { texto: "Exacto. Cada venta sacó lo último que había ese día. Por eso quedan unidades de dos fechas.", pie: PIE_CAMBIA },
};

/* P6 · el cierre, solo con los nombres de cuenta: los montos son de X2 o dependen del 33 %. */
const PIE_CIERRE = "Basado en el libro, pp. 225 y 243";
const MISMO_EN_LOS_DOS = "Ese sí se hace en los dos sistemas.";
const EL_CIERRE = {
  id: "el-cierre",
  pista: "En el periódico, unos asientos del cierre ponían al día el inventario. Busca esos.",
  tipo: "eleccion",
  parrafos: [
    "En el permanente, el cierre tiene dos asientos menos. No hay que quitar el inventario inicial ni colocar el final: la cuenta ya está al día.",
    "En su lugar, la cuenta Costo de mercancía vendida se cierra contra Ganancias y pérdidas.",
  ],
  cierre: [
    "Ingresos por ventas → Ganancias y pérdidas",
    "Ganancias y pérdidas → Costo de mercancía vendida",
    "Ganancias y pérdidas → Gastos de administración y ventas",
  ],
  pregunta: "¿Qué asientos del cierre no hacen falta en el permanente?",
  opciones: [
    { id: "inicial-y-final", texto: "Los de quitar el inventario inicial y colocar el final.", correcta: true },
    { id: "ingresos", texto: "El de cerrar Ingresos por ventas.", correcta: false, devolucion: MISMO_EN_LOS_DOS },
    { id: "gastos", texto: "El de cerrar los gastos.", correcta: false, devolucion: MISMO_EN_LOS_DOS },
  ],
  pie: PIE_CIERRE,
  error: { pie: PIE_CIERRE },
  acierto: { texto: "Así es. En el permanente, Inventario de mercancías ya está al día cuando llega el cierre.", pie: PIE_CIERRE },
};

const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  lista: [
    "Con PEPS, el permanente deja el mismo inventario final que el periódico.",
    "Con UEPS y con el promedio cambia, porque importan las fechas de las ventas.",
    "El cierre del permanente no lleva los asientos del inventario inicial y final.",
  ],
  siguiente: "Siguiente: «Fletes en permanente».",
  pie: "Basado en el libro, pp. 222 y 238-243",
};

export const PIEZA_SAN_CALIXTO = {
  id: A4_ID,
  numero: 4,
  titulo: "San Calixto en permanente",
  kardex: KARDEX_A4,
  pantallas: [PORTADA, LOS_DATOS, CON_PEPS, CON_UEPS, CON_PROMEDIO, QUE_CAMBIA, EL_CIERRE, RESUMEN],
};
