/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · A3 DE APRENDER — «El kárdex» (pp. 215-218, 222 y 233-241).
 *
 * Fuente: EL RECORTE DEL LOTE 1 de Near (entrega 6,
 * orquestador/conocimiento/paquetes/lote1-entrega6-v1.md, sección
 * «t7-2-a3-el-kardex») con las correcciones obligatorias de Mello encima
 * (mello-entregas-4-5-6-v1.md, «Entrega 6 · T7-2»): los dos errores de
 * `lado-a-lado` llevan «Aquí,» para que no suenen a regla general. Una prueba
 * compara cada texto de aquí contra el paquete corregido, letra por letra, en
 * los dos sentidos (correccionesMelloRecortesT72.mjs). La opcional de Mello
 * (la fila del periódico después de responder) NO se aplica.
 *
 * Siete pantallas, cuatro con acción. Lo que cambia frente a lo publicado:
 * sale `que-es` (el nombre del libro, «tarjeta de control de existencias»,
 * pasa a `los-datos`); cada pregunta trae el saldo de ese día como figura
 * (provisional para Watari); el kárdex completo de PEPS y de UEPS se abre con
 * «Ver el kárdex completo…» en el acierto; «Con PEPS sería el mismo» ya no
 * sale antes de la pregunta de `lado-a-lado`.
 *
 * EL «¿POR QUÉ?» de `lado-a-lado` trae «solo» («el conteo físico solo revisa
 * que haya 25 unidades»): por la regla de L no se pliega, va a la vista
 * (`porqueALaVista`).
 *
 * LAS CIFRAS son construidas (Near las cruzó: cero coincidencias con el OCR,
 * con su lista «libro», con el registro 5c y con X1 a X4). Ninguna es del
 * periódico de T7-1 (regla 3). Los tres kárdex se escriben como los da Near
 * en la v1, en la forma de la guía de Watari (columnas, sin «=»); una prueba
 * los recalcula desde los movimientos con src/contabilidad/t7_2Kardex.js.
 * El de PEPS es la figura del resumen. H3 usa los de aquí.
 *
 * UEPS va con su rótulo «UEPS (no válido bajo NIIF)» en el encabezado, en la
 * tabla y en las opciones.
 *
 * Lo que el recorte no trae y se conserva de lo publicado: los pies, los
 * botones y los rótulos del kárdex. Pieza de Aprender: cero FP.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const A3_ID = "t7-2-a3-el-kardex";

export const BOTON = { empezar: "Empezar", seguir: "Seguir", confirmar: "Confirmar", probarOtra: "Probar otra" };

export const INTERFAZ = { correcto: "Correcto.", incorrecto: "Incorrecto." };

export const UEPS = "UEPS (no válido bajo NIIF)";

/*
 * [ESCRITO POR CLAUDE, NO POR LA FICHA] El nombre de la tabla de
 * `lado-a-lado` para el lector de pantalla (no se ve). El rótulo de la fila
 * del periódico ya lo da Near en el recorte.
 */
export const PENDIENTE_DE_REVISION = {
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
  objetivo: "Vas a llevar un kárdex con PEPS, UEPS y promedio ponderado.",
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 237-241",
};

/* P1 · los datos (regla 10, versión T7-2): el texto, la tabla de movimientos de julio como figura, y el nombre del libro. «Tauro» es de Near. */
const LOS_DATOS = {
  id: "los-datos",
  tipo: "lectura",
  parrafos: ["Tauro usa el sistema permanente y lleva un kárdex: anota cada unidad que entra y que sale, con su costo y su fecha."],
  figuras: [{
    tipo: "lineas",
    filas: ["1 jul: tiene 30 a $2.010", "5 jul: compra 50 a $2.130", "9 jul: vende 60", "14 jul: compra 40 a $2.250", "20 jul: vende 35"],
  }],
  despues: ["El libro también lo llama tarjeta de control de existencias."],
  boton: BOTON.seguir,
  pie: "Basado en el libro, p. 238",
};

const PIE_PEPS = "Basado en el libro, pp. 215 y 238-239";
const CON_PEPS = {
  id: "peps",
  pista: "Con PEPS sale primero lo más antiguo.",
  tipo: "eleccion",
  parrafos: ["PEPS: lo primero que se compró es lo primero que se vende."],
  figuras: [{ tipo: "grupos", titulo: "Saldo el 8 de julio", grupos: ["30 del inicio", "50 del 5 de julio"] }],
  pregunta: "¿Qué unidades salen el 9 de julio?",
  opciones: [
    { id: "inicio-y-5", texto: "30 del inicio y 30 del 5", correcta: true },
    { id: "solo-5", texto: "60 del 5", correcta: false, devolucion: "Con PEPS salen primero las más antiguas: las del inicio." },
    { id: "inicio-y-14", texto: "30 del inicio y 30 del 14", correcta: false, devolucion: "La compra del 14 aún no había llegado." },
  ],
  pie: PIE_PEPS,
  error: { pie: PIE_PEPS },
  acierto: {
    texto: "Así es: quedan 20 del 5 de julio, a $2.130.",
    /* El «¿Por qué?» de Near es «Ver el kárdex completo con PEPS.»: se abre con su botón. */
    ver: { texto: "Ver el kárdex completo con PEPS.", kardex: KARDEX_A3.peps },
    pie: PIE_PEPS,
  },
};

const PIE_UEPS = "Basado en el libro, pp. 216 y 240";
const CON_UEPS = {
  id: "ueps",
  pista: "Con UEPS sale primero lo último que entró.",
  tipo: "eleccion",
  encabezado: `Método ${UEPS}`,
  figuras: [{ tipo: "grupos", titulo: "Saldo el 19 de julio", grupos: ["20 del inicio", "40 del 14 de julio"] }],
  pregunta: "¿De dónde salen las 35 del 20 de julio?",
  opciones: [
    { id: "del-14", texto: "40 del 14 de julio", correcta: true },
    { id: "inicio-y-14", texto: "20 del inicio y 15 del 14", correcta: false, devolucion: "Salen primero las últimas que entraron." },
    { id: "del-5", texto: "Las del 5 de julio", correcta: false, devolucion: "Esas ya salieron el 9 de julio." },
  ],
  pie: PIE_UEPS,
  error: { pie: PIE_UEPS },
  acierto: {
    texto: "Así es: salen 35 de las 40 del 14.",
    ver: { texto: "Ver el kárdex completo con UEPS.", kardex: KARDEX_A3.ueps },
    pie: PIE_UEPS,
  },
};

const PIE_PROMEDIO = "Basado en el libro, pp. 218 y 240-241";
const CON_PROMEDIO = {
  id: "promedio",
  pista: "Junta el saldo y la compra, y divide entre todas las unidades.",
  tipo: "eleccion",
  encabezado: "Promedio ponderado",
  parrafos: ["En el permanente, el promedio se calcula otra vez cada vez que llegan unidades nuevas."],
  figuras: [{ tipo: "lineas", filas: ["Saldo el 13 de julio: 20 unidades, $41.700", "El 14 de julio llegan 40 a $2.250: $90.000."] }],
  pregunta: "¿Cuál es el nuevo costo promedio?",
  opciones: [
    { id: "2195", texto: "$2.195", correcta: true },
    /* 2.140 = 256.800 ÷ 120: cifra construida que Near metió al registro. */
    { id: "2140", texto: "$2.140", correcta: false, devolucion: "Ese es el promedio de todo el mes. Aquí vale lo que hay ese día." },
    { id: "2250", texto: "$2.250", correcta: false, devolucion: "Ese es el precio de la última compra. El promedio junta las 60 unidades." },
  ],
  pie: PIE_PROMEDIO,
  error: { pie: PIE_PROMEDIO },
  acierto: {
    texto: "Así es: ($41.700 + $90.000) ÷ 60 = $2.195.",
    porque: "El 5 de julio, el promedio fue de $2.085. El 9 de julio salieron 60 a ese costo, y quedaron 20 por $41.700.",
    pie: PIE_PROMEDIO,
  },
};

/* P5 · lado a lado y frente al periódico. La fila del periódico es construida (regla 3) y va marcada. */
const PIE_LADO = "Basado en el libro, pp. 222, 233-234 y 239-241";
const LADO_A_LADO = {
  id: "lado-a-lado",
  pista: "¿En qué método no importa cuándo se hizo cada venta?",
  tipo: "eleccion",
  tabla: {
    nombre: PENDIENTE_DE_REVISION.nombreTabla,
    metodos: ["PEPS", UEPS, "Promedio"],
    filas: [
      { rubro: "Inventario final (25 unidades)", valores: [56250, 51450, 54875] },
      { rubro: "Costo de lo vendido", valores: [200550, 205350, 201925] },
      { rubro: "Inventario final con el periódico", valores: [56250, 50250, 53500], construida: true },
    ],
  },
  pregunta: "¿Qué método da el mismo inventario final en los dos sistemas?",
  opciones: [
    { id: "peps", texto: "PEPS", correcta: true },
    /* Mello: «Aquí,» (sin él, sonaba a regla general). */
    { id: "ueps", texto: UEPS, correcta: false, devolucion: "Aquí, con UEPS, cambia: importan las fechas de las ventas." },
    { id: "promedio", texto: "Promedio ponderado", correcta: false, devolucion: "Aquí, con el promedio, cambia: se calcula otra vez en cada compra." },
  ],
  pie: PIE_LADO,
  error: { pie: PIE_LADO },
  acierto: {
    texto: "Exacto: con PEPS quedan las mismas unidades, las de la última compra.",
    /* Regla de L: trae «solo»; va a la vista. */
    porque: "Con UEPS y con el promedio, en el permanente importan las fechas. Al final del mes, el conteo físico solo revisa que haya 25 unidades en la bodega.",
    porqueALaVista: true,
    pie: PIE_LADO,
  },
};

/* P6 · el resumen abre con el kárdex de PEPS, completo. */
const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  kardex: "peps",
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
  textosEnteros: true,
  kardex: KARDEX_A3,
  pantallas: [PORTADA, LOS_DATOS, CON_PEPS, CON_UEPS, CON_PROMEDIO, LADO_A_LADO, RESUMEN],
};
