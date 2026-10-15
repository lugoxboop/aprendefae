/*
 * ═══════════════════════════════════════════════════════════════════════════
 * REPASO DEL CAPÍTULO 5 · r5-2 «El Toro Negro» — LOS DATOS (Célula E).
 *
 * El 3 del bloque D, pp. 268-269: provisión de cartera, castigo y
 * recuperación de El Toro Negro. Este archivo trae solo los datos del libro y
 * las cuentas que salen de ellos. El texto que lee el estudiante lo escribe
 * Miyata y vendrá en otro archivo; aquí no hay ni una frase de pantalla.
 *
 * Fuente de las celdas: la tabla «Bloque D» del índice del banco
 * (orquestador/conocimiento/mapas/e5-indice-banco.md, rama
 * feat/conta-e5-indice-banco) y su anexo, leídos de la p. 269.
 *
 * Las cifras se CALCULAN, no se copian: el total de cada fila, de cada
 * columna, el general, la provisión y lo que el castigo pasa de la provisión
 * salen de sumar las celdas. El valor esperado va comentado al lado.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════ LA TABLA DE VENCIMIENTOS, P. 269, POR CELDAS ═══════════ */

/* Las siete columnas, en el orden del libro. */
export const COLUMNAS = ["vigentes", "1-30", "31-60", "61-120", "121-180", "181-360", "mas-de-360"];

/*
 * Porcentaje de provisión de cada columna, en puntos enteros para que la
 * cuenta no arrastre decimales de coma flotante. Del libro: vigentes 0 %,
 * de 1 a 60 días 3 % (cubre dos columnas), de 61 a 120 10 %, de 121 a 180
 * 12 %, de 181 a 360 25 %, más de 360 40 %.
 */
export const PORCENTAJES = {
  vigentes: 0,
  "1-30": 3,
  "31-60": 3,
  "61-120": 10,
  "121-180": 12,
  "181-360": 25,
  "mas-de-360": 40,
};

/*
 * Una fila por compañía, con sus siete celdas en el orden de COLUMNAS.
 *
 * ERRATA E-1 (índice del banco), p. 269: la fila de la Cía. Negra imprime un
 * total de $3.350.000, pero sus celdas suman $3.550.000. Las siete columnas y
 * el total general ($38.230.000) cuadran con las celdas, así que la errata
 * está en el total impreso de la fila. Por eso este módulo NO guarda ni
 * exporta ningún total de fila del libro: el de cada fila sale de sus celdas.
 */
export const COMPANIAS = [
  { id: "roja", nombre: "Cía. Roja", celdas: [0, 0, 1000000, 2000000, 0, 950000, 0] },
  { id: "blanca", nombre: "Cía. Blanca", celdas: [4100000, 1100000, 0, 0, 0, 0, 0] },
  { id: "azul", nombre: "Cía. Azul", celdas: [1800000, 280000, 400000, 500000, 0, 0, 0] },
  { id: "negra", nombre: "Cía. Negra", celdas: [0, 0, 0, 150000, 700000, 1200000, 1500000] },
  { id: "rosa", nombre: "Cía. Rosa", celdas: [2000000, 1450000, 0, 0, 0, 0, 0] },
  { id: "marron", nombre: "Cía. Marrón", celdas: [5000000, 2300000, 900000, 0, 0, 0, 0] },
  { id: "verde", nombre: "Cía. Verde", celdas: [0, 3200000, 4500000, 2050000, 1150000, 0, 0] },
];

/* ═══════════ EL CASTIGO DE MARZO Y LA RECUPERACIÓN DE MAYO ═══════════ */

export const CASTIGOS_MARZO = [
  { compania: "roja", valor: 950000 },
  { compania: "negra", valor: 1500000 },
];

export const RECUPERACION_MAYO = { compania: "roja", valor: 950000 };

/* ═══════════ LAS CUENTAS (se calculan, no se copian) ═══════════ */

const suma = (valores) => valores.reduce((t, v) => t + v, 0);

const totalesFila = Object.fromEntries(COMPANIAS.map((c) => [c.id, suma(c.celdas)]));
const totalesColumna = Object.fromEntries(
  COLUMNAS.map((col, i) => [col, suma(COMPANIAS.map((c) => c.celdas[i]))]),
);
const totalGeneral = suma(Object.values(totalesColumna));
const provisionColumna = Object.fromEntries(
  COLUMNAS.map((col) => [col, (totalesColumna[col] * PORCENTAJES[col]) / 100]),
);
const provision = suma(Object.values(provisionColumna));
const castigos = suma(CASTIGOS_MARZO.map((c) => c.valor));

export const CIFRAS = {
  totalesFila, // la Negra da 3.550.000, no los 3.350.000 impresos (E-1)
  totalesColumna, // 12.900.000 · 8.330.000 · 6.800.000 · 4.700.000 · 1.850.000 · 2.150.000 · 1.500.000
  totalGeneral, // 38.230.000
  provisionColumna, // 0 · 249.900 · 204.000 · 470.000 · 222.000 · 537.500 · 600.000
  provision, // 2.283.400
  castigos, // 2.450.000
  castigoSobreProvision: castigos - provision, // 166.600: la provisión queda con saldo débito
  recuperacion: RECUPERACION_MAYO.valor, // 950.000
};
