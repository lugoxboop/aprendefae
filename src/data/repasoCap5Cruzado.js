import { pesos } from "./contabilidad.js";
import { barajar } from "../utils/barajar.js";
import { FEEDBACK } from "./repasoCap5Comun.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * REPASO DEL CAPÍTULO 5 · r5-1 «Repaso cruzado» v2 (Célula E).
 *
 * El bloque C, ejercicios 1, 3, 5, 6, 8, 9 y 10, pp. 263-266. Siete pantallas
 * que saltan de tema a propósito (v2.3: C.1 entra primera). En la v2 cada decisión mueve algo que significa
 * algo (barra B3 de orquestador/conocimiento/enganche.md): un flujo de pagos,
 * un mayor, unas latas, un contador, unos lotes.
 *
 * Fuente de verdad: el paquete aprobado
 * orquestador/conocimiento/paquetes/e5-r5-1-v2.md (v2.2). Contenido de Miyata,
 * diseño de Itagaki, mecánica y FP de Kamogawa. Todo texto que lee el
 * estudiante va aquí y va LITERAL. Lo que la v2 conserva de v1.3 (la marca de
 * la pista, el final POR TEMA, la portada, los rótulos de los lotes) sigue
 * literal en orquestador/conocimiento/paquetes/e5-r5-1-v1.md.
 *
 * Las cifras se guardan como números y todo lo demás se calcula: los saldos
 * del mayor, el costo de las latas, la cuenta de la clasificación, los
 * acumulados de los lotes. La prueba recalcula las claves desde aquí.
 *
 * Aquí vive también la lógica sin React: preparar, evaluar, puntuar y la
 * etiqueta del panel docente.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════ LA FICHA ═══════════ */

export const R5_1 = {
  id: "r5-1",
  nombre: "Repaso cruzado",
  /* Kamogawa: medio, 25 FP, evaluativa. v2.3: el rendimiento son los puntos ganados / 25 (3/3/4/4/4/4/3). */
  dificultad: "medio",
  fpBase: 25,
  modalidad: "evaluativa",
  /* v2.3: cambia una palabra. Texto interno del paquete (r5-1 no tiene entrada que lo pinte). */
  objetivo: "Son siete preguntas del capítulo 5. Saltan de tema a propósito. Comprueba lo que sabes.",
};

/* Los rótulos fijos de interfaz del paquete, al estándar único de Hacer (PROMPT MAESTRO §4). */
export const INTERFAZ_R5_1 = {
  /* §4.3: «{Sustantivo} n de N»; el mismo sustantivo en el botón de avance. */
  sustantivo: "Pregunta",
  progreso: (n, total) => `Pregunta ${n} de ${total}`,
  porTema: "POR TEMA",
  nDeM: (n, m) => `${n} de ${m}`,
  verPista: "Ver pista",
  marcaPista: "PISTA",
  marcaPortada: "FIN DEL CAPÍTULO 5",
  portada: "Repasa los tres temas antes de seguir.",
  /* C.1 · la raya del año (v2.3, decisión 7). */
  hoyRaya: "hoy",
  unAno: "1 año",
  corriente: "Corriente",
  noCorriente: "No es corriente",
  alVenderse: "al venderse",
  /* El texto alternativo de la figura (v2.3, decisión 6). «ninguno» cuando una zona queda vacía: decisión de Ippo. */
  altRaya: (si, no) => `Corriente: ${si.join(", ") || "ninguno"}. No es corriente: ${no.join(", ") || "ninguno"}.`,
  /* Pantalla de los flujos (C.3). */
  hoy: "HOY",
  vencimiento: "VENCIMIENTO",
  pagas: "Pagas",
  recibes: "Recibes",
  tuGanancia: "Tu ganancia",
  /* Pantallas 2 y 6: el mayor compacto y las opciones de asiento. */
  leyendaMayor: "Gris: saldo antes. Blanco: lo que entra y el saldo nuevo.",
  debe: "DEBE",
  haber: "HABER",
  sinSaldo: "Sin saldo",
  debita: "Debita",
  acredita: "Acredita",
  /* Pantalla 3. */
  marcaCompra: (marca, precio) => `${marca} · ${pesos(precio)} CADA UNA`,
  vendidas: "VENDIDAS",
  costoVendido: "Costo de lo vendido",
  enBodega: "Lo que queda en bodega",
  conUeps: "Con UEPS",
  lata: (compra, precio) => `Lata de la ${compra}, ${precio} pesos`,
  /* Pantalla 4. */
  suma: "Suma",
  resta: "Resta",
  noEntra: "No entra",
  revisar: FEEDBACK.comprobar,
  hayMas: "Y hay más fichas por revisar.",
  grupo: (etiqueta, valor) => `${etiqueta}, ${valor}`,
  /* Pantalla 5. */
  unidadesACosto: (u, c) => `${u} u a ${pesos(c)}`,
  estanteComun: "ESTANTE COMÚN",
  costoTotal: "Costo total",
  unidades: "Unidades",
  salenQuedan: (salen, quedan) => `Salen ${salen} u · Quedan ${quedan} u`,
  costoUnidad: "Costo de cada unidad",
  /* Estados de calificación (§e) y el patrón «la opción se vuelve título». */
  enLaFigura: "EN LA FIGURA",
  /* §4.2: las tres palabras del feedback. */
  correcta: FEEDBACK.ok,
  incorrecta: FEEDBACK.mal,
  eraEsta: FEEDBACK.revelada,
};

/*
 * Lo que el paquete no trae y la vista necesita: el aviso que oye el lector de
 * pantalla delante de la devolución (las mismas palabras que Retro de
 * corazon/juego.jsx).
 * [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN]
 */
export const PENDIENTE_DE_REVISION_R5_1 = {
  /* §4.2: el lector dice «Incorrecto.». */
  lectorAcierto: "Correcto. ",
  lectorError: "Incorrecto. ",
};

/* 1 caja = 10 u (Itagaki, pantalla 5). */
export const UNIDADES_POR_CAJA = 10;

/* ═══════════ LOS TRES SUBTEMAS (etiqueta del panel docente y silueta) ═══════════ */

export const SUBTEMAS = {
  /* v2.3: C.1 no es de inversiones, cartera ni inventarios. Su silueta es la raya del año en miniatura. */
  corrientes: { id: "corrientes", nombre: "Activos corrientes", escena: "raya" },
  inversiones: { id: "inversiones", nombre: "Inversiones", escena: "titulo-valor" },
  cartera: { id: "cartera", nombre: "Cartera", escena: "facturas" },
  inventarios: { id: "inventarios", nombre: "Inventarios", escena: "bodega" },
};
/* El orden de las filas del bloque «POR TEMA». */
export const ORDEN_SUBTEMAS = ["corrientes", "inversiones", "cartera", "inventarios"];

/* ═══════════ LAS CUENTAS (nombres publicados, los mismos del mayor) ═══════════ */

export const GASTO = "Gasto provisiones – cuentas incobrables";
export const PROVISION = "Provisión para deudas incobrables";
export const CLIENTES = "Cuentas por cobrar – clientes";
export const INVENTARIO = "Inventario de mercancías";
export const GYP = "Ganancias y pérdidas";
export const CMV = "Costo de mercancía vendida";

const asiento = (debe, haber) => ({ debe, haber });

/* ═══════════ LOS DATOS DE LA CÉLULA (decisión 8: no son del libro) ═══════════ */

/*
 * C.1 (v2.3): los cuatro grupos de activos. Cada activo: el renglón de la
 * opción (con su plazo), el nombre en la figura (sin plazo, E8) y cuándo se
 * vuelve plata, en meses (30 días = 1 mes). `meses: null` es el inventario
 * (sin fecha: «al venderse»); `fijo` es el vehículo (no se vende).
 */
const UN_ANO = 12;
const activo = (texto, figura, meses, extra = {}) => ({ texto, figura, meses, ...extra });
const CAJA_C1 = activo("Caja", "Caja", 0);
const BANCOS_C1 = activo("Bancos", "Bancos", 0);
const INVENTARIO_C1 = activo("Inventario de mercancías", "Inventario de mercancías", null);
const cartera = (plazo, meses) => activo(`Cuentas por cobrar – clientes, a ${plazo}`, "Cuentas por cobrar – clientes", meses);
const inversion = (plazo, meses) => activo(`Inversión a ${plazo}`, "Inversión", meses);
const VEHICULO_C1 = activo("Vehículo de reparto", "Vehículo de reparto", null, { fijo: true });
/* Corriente: se vuelve plata antes de un año. El inventario, sí (al venderse); el fijo, no. */
export const esCorriente = (a) => !a.fijo && (a.meses === null || a.meses < UN_ANO);

/*
 * Pantalla 1: lo que reproduce cada opción, en px de la figura. `periodos`
 * son las cuatro marcas del eje; cada una, las barras que se apilan en ella.
 * `vence` dice si queda el rótulo VENCIMIENTO. Lo que se recibe en (a) y (d):
 * 12 + 12 + 12 + (12 + 56) = 104.
 */
const PAGO_HOY = 56;
const FLUJO_INTERES = { pagas: PAGO_HOY, periodos: [[12], [12], [12], [12, PAGO_HOY]], vence: true, ganancia: false };
const FLUJO_VARIABLE = { pagas: PAGO_HOY, periodos: [[32], [64], [24], [48]], vence: false, ganancia: false };
const FLUJO_DESCUENTO = { pagas: PAGO_HOY, periodos: [[], [], [], [80]], vence: true, ganancia: true };

/*
 * Pantalla 2: el mayor de la cartera. El gasto empieza sin saldo: se cerró
 * contra Ganancias y pérdidas en el cierre pasado (v2.1, decisión 3).
 */
const MAYOR_C5 = [
  { nombre: CLIENTES, naturaleza: "debe", saldo: 10000000 },
  { nombre: PROVISION, naturaleza: "haber", saldo: 500000 },
  { nombre: GASTO, naturaleza: "debe", saldo: 0 },
];
const CASTIGO_C5 = 300000;

/* Pantalla 3: las latas. El precio va una vez, en la marca. */
const COMPRAS_C6 = [
  { id: "primera", marca: "PRIMERA COMPRA", compra: "primera compra", precio: 10, latas: 4 },
  { id: "segunda", marca: "SEGUNDA COMPRA", compra: "segunda compra", precio: 14, latas: 4 },
];
const VENDER_C6 = 4;
/* La escala de las dos barras: 96 = todo el ancho (lo que había en bodega). */

/* Pantalla 4: en el orden del estado de resultados. `signo`: cómo entra al costo. */
const DATOS_C8 = [
  { id: "ventas", etiqueta: "Ventas", valor: 11400, signo: null },
  { id: "devoluciones-ventas", etiqueta: "Devoluciones de ventas", valor: 1000, signo: null },
  { id: "inventario-inicial", etiqueta: "Inventario inicial", valor: 500, signo: "+" },
  { id: "compras", etiqueta: "Compras", valor: 4000, signo: "+" },
  { id: "devoluciones-compras", etiqueta: "Devoluciones de compras", valor: 300, signo: "−" },
  { id: "inventario-final", etiqueta: "Inventario final", valor: 800, signo: "−" },
];

/* Los tres botones de cada ficha, y a qué signo corresponden. */
export const BOTONES_C8 = [
  { id: "suma", signo: "+" },
  { id: "resta", signo: "−" },
  { id: "fuera", signo: null },
];

/*
 * La regla de prioridad de la pantalla 4: se dice la primera falla de esta
 * lista. Cada falla nombra sus fichas y en qué botón las pone el estudiante.
 */
const FALLAS_C8 = [
  { fichas: ["ventas"], en: ["suma", "resta"], retro: "Las ventas dicen cuánto cobraste, no cuánto te costó. El costo sale de lo que compraste y guardaste." },
  { fichas: ["devoluciones-ventas"], en: ["suma", "resta"], retro: "Las devoluciones de ventas mueven lo que cobraste, no lo que costó. Por eso quedan fuera del cálculo." },
  { fichas: ["inventario-final"], en: ["suma"], retro: "Lo que quedó en bodega no se vendió. Por eso se quita de lo que tenías disponible." },
  { fichas: ["devoluciones-compras"], en: ["suma"], retro: "Lo que devolviste al proveedor ya no es tuyo. Baja lo que compraste." },
  { fichas: ["inventario-inicial"], en: ["resta"], retro: "Lo que había al empezar también estaba para vender. Se junta con lo que compraste." },
  { fichas: ["compras"], en: ["resta"], retro: "Lo que compraste entra a la bodega y aumenta lo que puedes vender." },
  { fichas: ["inventario-inicial", "compras", "devoluciones-compras", "inventario-final"], en: ["fuera"], retro: "Ese dato sí cuenta: habla de lo que compraste o guardaste. El costo de lo vendido se arma con él." },
];
const ACIERTO_C8 = "Exacto. Lo vendido sale de lo que tuviste disponible menos lo que quedó. Lo que cobraste no entra en el costo.";

/* Pantalla 5: el inventario inicial primero, como ocurre en el tiempo (Miyata, v1). */
const LOTES_C9 = [
  { marca: "Lote 1 · Al inicio", unidades: 70, costo: 18 },
  { marca: "Lote 2 · Primera compra", unidades: 100, costo: 20 },
  { marca: "Lote 3 · Segunda compra", unidades: 80, costo: 25 },
];
const VENDIDAS_C9 = 225;

/* Pantalla 6: el mayor del cierre. Lo que sale es todo el inventario inicial. */
const MAYOR_C10 = [
  { nombre: INVENTARIO, naturaleza: "debe", saldo: 800000 },
  { nombre: GYP, naturaleza: "debe", saldo: 0 },
];

/* ═══════════ LAS SEIS PANTALLAS, EN EL ORDEN DEL LIBRO ═══════════ */

/*
 * El id de cada opción lleva la letra del libro (a-d), que es también el
 * orden en que el paquete las lista. En pantalla se barajan en cada intento.
 * `forma` dice qué mecánica pinta la pantalla.
 */
export const PANTALLAS_R5_1 = [
  {
    id: "c1",
    ejercicio: "C.1",
    pagina: "p. 263",
    subtema: "corrientes",
    forma: "raya",
    enunciado: "Un grupo tiene solo activos corrientes. Elige cuál y mira cuándo se vuelve plata cada uno.",
    opciones: [
      { id: "c1-a", correcta: true, activos: [CAJA_C1, cartera("10 meses", 10), INVENTARIO_C1, inversion("seis meses", 6)], retro: "Exacto. Son de clases distintas, y hasta la cartera a 10 meses entra: los cuatro se vuelven plata (efectivo) antes de un año." },
      { id: "c1-b", activos: [BANCOS_C1, cartera("18 meses", 18), INVENTARIO_C1, inversion("tres meses", 3)], retro: "Ser cartera no la hace corriente: lo que manda es cuándo se cobra. Esta tarda 18 meses, más de un año." },
      { id: "c1-c", activos: [CAJA_C1, cartera("60 días", 2), INVENTARIO_C1, VEHICULO_C1], retro: "El vehículo se usa todos los días, pero no se vende para volverse plata: sirve por años. Es un activo fijo." },
      { id: "c1-d", activos: [BANCOS_C1, cartera("30 días", 1), INVENTARIO_C1, inversion("15 meses", 15)], retro: "No toda inversión es corriente. Solo la que se vuelve plata antes de un año, y esta tarda 15 meses." },
    ],
    pista: "La prueba es la raya del año. Que sea cartera o inversión no decide nada.",
  },
  {
    id: "c3",
    ejercicio: "C.3",
    pagina: "p. 264",
    subtema: "inversiones",
    forma: "flujos",
    enunciado: "Hay inversiones de renta fija que se compran con descuento. ¿Qué las define? Elige una y mira cómo te pagan.",
    opciones: [
      { id: "c3-a", flujo: FLUJO_INTERES, texto: "Pagan un interés fijo durante un periodo determinado.", retro: "Así pagan las inversiones con interés. Las de descuento no pagan cada periodo: ganan con la diferencia de precio." },
      { id: "c3-b", flujo: FLUJO_VARIABLE, texto: "Lo que ganan depende de cómo le vaya a quien emite el título.", retro: "Eso es renta variable: lo que ganas depende de cómo le vaya a quien emite. En renta fija lo sabes desde el inicio." },
      { id: "c3-c", correcta: true, flujo: FLUJO_DESCUENTO, texto: "Dan una renta por la diferencia entre el valor de compra y el valor de redención.", retro: "Exacto. Eso solo pasa con las de descuento: lo que ganas sale del precio, no de pagos en el camino." },
      /* (d) idéntica a (a): ese parecido es lo que la pantalla enseña. */
      { id: "c3-d", flujo: FLUJO_INTERES, texto: "Dan una renta constante, que se pacta cuando se hace la inversión.", retro: "Es cierto, pero vale para toda la renta fija: por eso se ve como una inversión con interés. La pregunta pide lo que solo tienen las de descuento." },
    ],
    pista: "Varias opciones son ciertas de alguna renta fija. Busca la que solo vale para las de descuento.",
  },
  {
    id: "c5",
    ejercicio: "C.5",
    pagina: "pp. 264-265",
    subtema: "cartera",
    forma: "asiento",
    enunciado: "Un cliente no te pagará $300.000. Esa deuda se castiga, y la pérdida ya estaba prevista. ¿Qué asiento va?",
    mayor: MAYOR_C5,
    valor: CASTIGO_C5,
    opciones: [
      { id: "c5-a", asiento: asiento(GASTO, CLIENTES), retro: "Así se castiga sin provisión. Pero esta pérdida ya se cargó al gasto en el cierre pasado. Cargarla otra vez la cuenta dos veces." },
      { id: "c5-b", asiento: asiento(GASTO, PROVISION), retro: "Ese asiento crea la provisión, y eso se hace al cierre. Hoy la provisión ya existe: toca usarla, no hacerla crecer." },
      { id: "c5-c", correcta: true, asiento: asiento(PROVISION, CLIENTES), retro: "Bien. La provisión existía para este momento. Se usa contra la deuda, y el gasto no se toca." },
      { id: "c5-d", asiento: asiento(CLIENTES, GASTO), retro: "Va al revés. Castigar es sacar la deuda de la cartera, no sumarla. Y el gasto no se toca." },
    ],
    pista: "¿El gasto de esta deuda ya se registró antes? Si es así, no debe aparecer de nuevo.",
  },
  {
    id: "c6",
    ejercicio: "C.6",
    pagina: "p. 265",
    subtema: "inventarios",
    forma: "latas",
    enunciado: "Vende 4 latas con PEPS: toca las que salen.",
    compras: COMPRAS_C6,
    vender: VENDER_C6,
    mensaje: "Esa llegó después. Con PEPS sale primero la más vieja.",
    pregunta: "Frente a UEPS, ¿qué muestra PEPS?",
    columnas: ["Inventario final", "Costo de mercancía vendida", "Utilidad"],
    opciones: [
      { id: "c6-a", celdas: ["Más bajo", "Más bajo", "Mayor"], retro: "El fallo está en el inventario. Ya viste qué latas quedaron: las nuevas, que son las caras. Por eso el inventario queda alto." },
      { id: "c6-b", celdas: ["Más alto", "Más alto", "Menor"], retro: "Inventario y costo no suben juntos: se reparten la misma mercancía. Si lo caro queda en bodega, lo barato pasó al costo." },
      { id: "c6-c", correcta: true, celdas: ["Más alto", "Más bajo", "Mayor"], retro: "Correcto. Cuando los precios suben, PEPS deja lo caro en bodega y manda lo barato al costo. Por eso la utilidad sube." },
      { id: "c6-d", celdas: ["Más bajo", "Más bajo", "Menor"], retro: "Dos fallos. Lo que queda en bodega es lo caro, no lo barato. Y con un costo bajo, la utilidad sube." },
    ],
    pista: "Mira lo que te quedó en el estante después de vender. ¿Era lo caro o lo barato?",
  },
  {
    id: "c8",
    ejercicio: "C.8",
    pagina: "p. 265",
    subtema: "inventarios",
    forma: "fichas",
    enunciado: "Pon cada dato donde va para hallar cuánto costó lo que se vendió.",
    datos: DATOS_C8,
    fallas: FALLAS_C8,
    acierto: ACIERTO_C8,
    pista: "Separa los datos en dos grupos: los de comprar y guardar, y los de vender. Solo un grupo sirve.",
  },
  {
    id: "c9",
    ejercicio: "C.9",
    pagina: "p. 266",
    subtema: "inventarios",
    forma: "lotes",
    enunciado: "Vacía los tres lotes. Con promedio ponderado, ¿cuánto vale lo que queda?",
    lotes: LOTES_C9,
    vendidas: VENDIDAS_C9,
    opciones: [
      { id: "c9-a", valor: 625, retro: "Usaste el precio de la última compra. Eso daría PEPS. Aquí los lotes ya se mezclaron: cada unidad vale el promedio." },
      { id: "c9-b", valor: 450, retro: "Usaste el precio del lote más viejo. Tras mezclar los lotes, ninguna unidad conserva su precio de origen." },
      { id: "c9-c", valor: 525, retro: "Usaste $21, el promedio simple de los tres precios. Pero no hubo igual cantidad a cada precio: el promedio pesa cada lote por sus unidades." },
      { id: "c9-d", correcta: true, valor: 526, retro: "Bien. Las 25 que quedan valen el promedio, como todas las demás. Cada lote pesó según sus unidades." },
    ],
    pista: "Después de mezclar, ¿alguna unidad conserva el precio de su lote?",
  },
  {
    id: "c10",
    ejercicio: "C.10",
    pagina: "p. 266",
    subtema: "inventarios",
    forma: "asiento",
    enunciado: "Con el sistema periódico, al cierre, lo que había en bodega al empezar debe salir de los libros. ¿Qué asiento lo saca?",
    mayor: MAYOR_C10,
    valor: MAYOR_C10[0].saldo,
    opciones: [
      { id: "c10-a", asiento: asiento(INVENTARIO, GYP), retro: "Ese asiento pone en los libros el inventario final. Aquí va lo contrario: sacar el que había al empezar." },
      { id: "c10-b", asiento: asiento(INVENTARIO, CMV), retro: "Debitar el inventario lo hace crecer. Para sacarlo de los libros hay que acreditarlo." },
      { id: "c10-c", correcta: true, asiento: asiento(GYP, INVENTARIO), retro: "Correcto. El inventario inicial sale de los libros y pasa a Ganancias y pérdidas, donde entra al costo del periodo." },
      { id: "c10-d", asiento: asiento(CMV, INVENTARIO), retro: "El inventario sí sale bien. El fallo es a dónde va: en el cierre que vimos, va a Ganancias y pérdidas." },
    ],
    pista: "Para sacar un activo de los libros, ¿lo debitas o lo acreditas?",
  },
];

/* ═══════════ LA LÓGICA, SIN REACT ═══════════ */

export const TOTAL_R5_1 = PANTALLAS_R5_1.length;

/* v2.3: lo que vale cada pantalla, en el orden nuevo (C.1, C.3, C.5, C.6, C.8, C.9, C.10). Suman 25. */
export const PUNTOS_R5_1 = { c1: 3, c3: 3, c5: 4, c6: 4, c8: 4, c9: 4, c10: 3 };
export const TOTAL_PUNTOS_R5_1 = Object.values(PUNTOS_R5_1).reduce((a, b) => a + b, 0);

/* Pesos con dos decimales y coma: 21,04 → «$21,04». */
export function pesosConCentavos(valor) {
  const centavos = Math.round(valor * 100);
  return `${pesos(Math.trunc(centavos / 100))},${String(centavos % 100).padStart(2, "0")}`;
}

/* Los dos renglones de una opción de asiento: «Debita …» / «Acredita …». */
export const renglonesDeAsiento = (a) => [`${INTERFAZ_R5_1.debita} ${a.debe}`, `${INTERFAZ_R5_1.acredita} ${a.haber}`];

/*
 * Pantallas 2 y 6: el mayor después de un asiento por `valor`. Cada cuenta
 * trae su saldo antes (con su lado), lo que entra (lado y valor) si el asiento
 * la toca, y su saldo nuevo. Una cuenta que el asiento nombra y el mayor no
 * tiene (Costo de mercancía vendida en la 6) se agrega al final, sin saldo.
 */
export function mayorTrasAsiento(mayor, a, valor) {
  const cuentas = mayor.map((c) => ({ ...c, nueva: false }));
  for (const nombre of [a.debe, a.haber]) {
    if (!cuentas.some((c) => c.nombre === nombre)) cuentas.push({ nombre, naturaleza: "debe", saldo: 0, nueva: true });
  }
  return cuentas.map((c) => {
    const lado = c.nombre === a.debe ? "debe" : c.nombre === a.haber ? "haber" : null;
    const antes = c.naturaleza === "debe" ? c.saldo : -c.saldo;
    const despues = antes + (lado === "debe" ? valor : lado === "haber" ? -valor : 0);
    const saldoNuevo = lado
      ? { valor: Math.abs(despues), lado: despues > 0 ? "debe" : despues < 0 ? "haber" : c.naturaleza }
      : null;
    return { ...c, entra: lado ? { lado, valor } : null, saldoNuevo };
  });
}

/*
 * Pantalla 3: el costo de vender `n` latas con PEPS (salen las más viejas) o
 * con UEPS (salen las más nuevas), y lo que queda en bodega.
 */
export function costoDeLatas(compras, n, metodo = "PEPS") {
  const orden = metodo === "PEPS" ? compras : [...compras].reverse();
  let faltan = n;
  let costo = 0;
  for (const c of orden) {
    const salen = Math.min(faltan, c.latas);
    costo += salen * c.precio;
    faltan -= salen;
  }
  const total = compras.reduce((t, c) => t + c.latas * c.precio, 0);
  return { costo, bodega: total - costo, total };
}

/* Pantalla 4: la cuenta, desde los signos de los datos. */
export function cuentaDeC8(pantalla) {
  return pantalla.datos.reduce((t, d) => t + (d.signo === "+" ? d.valor : d.signo === "−" ? -d.valor : 0), 0);
}

/* El contador en vivo: suma de Suma menos suma de Resta, con lo que haya puesto. */
export function contadorDeC8(pantalla, clasificacion) {
  return pantalla.datos.reduce((t, d) => {
    const b = clasificacion[d.id];
    return t + (b === "suma" ? d.valor : b === "resta" ? -d.valor : 0);
  }, 0);
}

/* El botón que corresponde a cada dato, según su signo. */
export const botonCorrectoDe = (dato) => BOTONES_C8.find((b) => b.signo === dato.signo).id;

/*
 * La calificación de la pantalla 4: bien si las seis fichas quedan como la
 * clave (decisión 5). La devolución es la primera falla de la lista; si hay
 * más de una ficha mal, se agrega «Y hay más fichas por revisar.».
 */
export function evaluarC8(pantalla, clasificacion) {
  const fichas = Object.fromEntries(pantalla.datos.map((d) => {
    const correcto = botonCorrectoDe(d);
    return [d.id, { ok: clasificacion[d.id] === correcto, correcto }];
  }));
  const mal = pantalla.datos.filter((d) => !fichas[d.id].ok);
  if (!mal.length) return { ok: true, fichas, textos: [pantalla.acierto] };
  const primera = pantalla.fallas.find((f) => f.fichas.some((id) => f.en.includes(clasificacion[id])));
  return { ok: false, fichas, textos: mal.length > 1 ? [primera.retro, INTERFAZ_R5_1.hayMas] : [primera.retro] };
}

/*
 * Lo que se guarda como respuesta de la pantalla 4 (solo cuando falla): las
 * fichas mal puestas y el botón que eligió el estudiante, en el orden del
 * estado de resultados. El servidor guarda 120 caracteres de `respuesta`
 * (0036: left(…, 120)); la clasificación entera llegaba a 159 y se cortaba a
 * media ficha. Si las mal puestas no caben, se corta en una ficha entera y se
 * agrega « · …».
 */
export const LARGO_RESPUESTA = 120;
export function respuestaDeC8(pantalla, clasificacion) {
  const nombre = { suma: INTERFAZ_R5_1.suma, resta: INTERFAZ_R5_1.resta, fuera: INTERFAZ_R5_1.noEntra };
  const mal = pantalla.datos.filter((d) => clasificacion[d.id] !== botonCorrectoDe(d)).map((d) => `${d.etiqueta}: ${nombre[clasificacion[d.id]]}`);
  let texto = "";
  for (const [k, parte] of mal.entries()) {
    const siguiente = k ? `${texto} · ${parte}` : parte;
    const resto = k < mal.length - 1 ? " · …" : "";
    if ((siguiente + resto).length > LARGO_RESPUESTA) return `${texto} · …`;
    texto = siguiente;
  }
  return texto;
}

/*
 * Pantalla 5: lo que marcan «Costo total» y «Unidades» tras cada lote, en el
 * orden en que el estudiante los vacía (índices de `lotes`).
 */
export function acumuladosDeC9(pantalla, orden) {
  let costo = 0;
  let unidades = 0;
  return orden.map((k) => {
    const l = pantalla.lotes[k];
    costo += l.unidades * l.costo;
    unidades += l.unidades;
    return { costo, unidades };
  });
}

/* Pantalla 5: lo que se tuvo, el promedio y lo que queda. */
export function cuentaDeC9(pantalla) {
  const unidades = pantalla.lotes.reduce((t, l) => t + l.unidades, 0);
  const total = pantalla.lotes.reduce((t, l) => t + l.unidades * l.costo, 0);
  const quedan = unidades - pantalla.vendidas;
  const promedio = total / unidades;
  return { unidades, total, promedio, quedan, valor: Math.round(quedan * promedio) };
}

/* El texto de una opción, como lo lee quien no ve la pantalla. */
export function textoDeOpcion(pantalla, opcion) {
  if (opcion.activos) return opcion.activos.map((a) => a.texto).join(", ");
  if (opcion.asiento) return renglonesDeAsiento(opcion.asiento).join(". ");
  if (opcion.celdas) return pantalla.columnas.map((c, k) => `${c}: ${opcion.celdas[k]}`).join(" · ");
  if (opcion.valor !== undefined) return pesos(opcion.valor);
  return opcion.texto;
}

export const claveDe = (pantalla) => pantalla.opciones.find((o) => o.correcta);

/*
 * Las seis pantallas en su orden fijo, cada una con sus opciones barajadas
 * (la 4 no tiene opciones: sus fichas van en el orden del estado de
 * resultados). `anterior` es la tanda de antes (o nada en el primer intento):
 * el orden de cada pantalla sale distinto del que tuvo la vez anterior, y en
 * el primer intento distinto del orden del libro.
 *
 * `barajador` es `barajar` (al azar) en la partida; la prueba le pasa uno con
 * semilla fija (`barajadorDe`), para que sea reproducible (v1.1, Takamura).
 */
function distinto(xs, antes, barajador) {
  const huella = (lista) => lista.map((o) => o.id).join("|");
  for (let intento = 0; intento < 12; intento++) {
    const c = barajador(xs);
    if (huella(c) !== huella(antes)) return c;
  }
  /* Salida de emergencia: rotar garantiza un orden distinto. */
  return [...antes.slice(1), antes[0]];
}

export function prepararR5_1(anterior = null, barajador = barajar) {
  return PANTALLAS_R5_1.map((p) => {
    if (!p.opciones) return p;
    const antes = anterior?.find((x) => x.id === p.id)?.opciones ?? p.opciones;
    return { ...p, opciones: distinto(p.opciones, antes, barajador) };
  });
}

export function evaluarR5_1(pantalla, opcionId) {
  const elegida = pantalla.opciones.find((o) => o.id === opcionId) ?? null;
  const clave = claveDe(pantalla);
  return { ok: Boolean(elegida?.correcta), elegida: elegida?.id ?? null, correcta: clave.id, texto: elegida?.retro ?? null };
}

/*
 * Evaluativa (v2.3): el rendimiento son los puntos ganados / 25, nunca
 * aciertos / 7. Siempre un múltiplo de 4 %: Math.round(rendimiento × 100) de
 * otorgarFP es exacto. El motor escala los 25 FP.
 */
export const puntosDeR5_1 = (resultados) => Object.entries(PUNTOS_R5_1).reduce((s, [id, v]) => s + (resultados[id] ? v : 0), 0);
/* Primero × 100 y luego ÷ 25: 3 / 25 × 100 daría 12,000000000000002. */
export const puntuarR5_1 = (puntos) => (puntos * 100) / TOTAL_PUNTOS_R5_1;

/* Las filas del bloque «POR TEMA»: un punto por pregunta, en orden. */
export function porTema(resultados) {
  return ORDEN_SUBTEMAS.map((s) => {
    const puntos = PANTALLAS_R5_1.filter((p) => p.subtema === s).map((p) => ({ id: p.id, ok: Boolean(resultados[p.id]) }));
    return { ...SUBTEMAS[s], puntos, bien: puntos.filter((x) => x.ok).length, total: puntos.length };
  });
}

/* El panel docente: cada pantalla por su subtema y su enunciado. */
export function unidadDeR5_1(id) {
  const p = PANTALLAS_R5_1.find((x) => x.id === String(id));
  return p ? `${SUBTEMAS[p.subtema].nombre} · ${p.enunciado}` : null;
}

/*
 * ═══════════ C.1 · DÓNDE CAE CADA ACTIVO (figura de Itagaki, orientación de RayaDelAno, §2) ═══════════
 *
 * Alturas en px desde «hoy»; la raya del año está en 144 (12 px por mes).
 *   · el punto, a la altura de su plazo;
 *   · el nombre, a su altura, salvo que choque: dos nombres vecinos van al
 *     menos a 22 px de centro a centro;
 *   · el inventario no tiene punto (no tiene fecha): su nombre va en el centro
 *     del hueco libre más grande de la zona; ningún nombre baja de 128;
 *   · lo que no es corriente va abajo, en el orden de la opción.
 */
export const RAYA_C1 = { porMes: 12, raya: 144, separacion: 22, tope: 128 };
export function colocarC1(opcion) {
  const R = RAYA_C1;
  const conFecha = opcion.activos.filter((a) => esCorriente(a) && a.meses !== null)
    .map((a) => ({ activo: a, punto: a.meses * R.porMes }))
    .sort((x, y) => x.punto - y.punto);
  let anterior = -Infinity;
  for (const x of conFecha) {
    x.nombre = Math.min(R.tope, Math.max(x.punto, anterior + R.separacion));
    anterior = x.nombre;
  }
  const inv = opcion.activos.find((a) => esCorriente(a) && a.meses === null) ?? null;
  let inventario = null;
  if (inv) {
    const bordes = [...conFecha.map((x) => x.nombre), R.raya];
    let mejor = null;
    for (let k = 0; k < bordes.length - 1; k++) {
      const hueco = bordes[k + 1] - bordes[k];
      if (!mejor || hueco > mejor.hueco) mejor = { hueco, centro: (bordes[k] + bordes[k + 1]) / 2 };
    }
    inventario = { activo: inv, nombre: Math.min(R.tope, mejor ? mejor.centro : R.raya / 2) };
  }
  return { arriba: conFecha, inventario, abajo: opcion.activos.filter((a) => !esCorriente(a)) };
}
