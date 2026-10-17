import { pesos } from "./contabilidad.js";
import { FRASE_NIC2, cuentaVnr, cuentaMenor } from "./contabilidadT7_3_a7.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · H7 DE HACER — «¿Costo o valor neto realizable?» (Célula C).
 *
 * Fuente: la v1 de Near, con PASA de Mello. Copia en
 * orquestador/conocimiento/paquetes/t7-3-h7-v1.md; una prueba compara cada
 * texto de aquí contra ella, letra por letra.
 *
 * Hacer Medio, evaluativa, 25 FP: el motor compartido escala los FP con los
 * aciertos, con piso del 50 %. Migración 0109, que corre Mateo.
 *
 * SEIS ACIERTOS POSIBLES: tres casos, dos preguntas cada uno (el valor neto
 * realizable y por qué valor se mide). Un solo intento por pregunta. Es una
 * construcción completa, con la regla del libro (pp. 257-258). LA FRASE FIJA
 * DE LA NIC 2 va siempre a la vista (encargo de L: en A7, A8, H6 y H7).
 *
 * LAS CIFRAS son las de Near (registro 5c, T73-H7). Aquí solo se escriben los
 * datos de cada caso; el valor neto realizable, la medida y los distractores
 * se calculan, y una prueba los compara con la v1.
 *
 * PENDIENTE DE DECISIÓN DE L: la ficha de la medición como regla 10c (quién ·
 * costo · precio esperado de venta · lo que falta para terminar · lo que
 * cuesta vender), la propuesta de Near. Sus rótulos están en FICHA_10C.
 * [ESCRITO POR CLAUDE, NO POR LA FICHA]: en las dos tiendas la ficha no trae
 * la fila de «lo que falta para terminar», porque la v1 no da esa cifra para
 * ellas (PENDIENTE_DE_REVISION).
 *
 * Lo que la v1 no trae y se toma de los Hacer de T7-3: los botones, «Caso 1»
 * a «Caso 3» como encabezado de cada pregunta, y las opciones barajadas. La
 * segunda pregunta de los casos 2 y 3 («¿Por qué valor se mide…?» en la v1)
 * es la misma del caso 1, entera.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const H7_ID = "t7-3-costo-o-vnr";

export const H7 = {
  id: H7_ID,
  /* Lote O: el objetivo, de Near (paquetes/lote-o-objetivos.md). */
  objetivo: "Medir cada inventario al costo o al valor neto realizable, el que sea menor.",
  nombre: "¿Costo o valor neto realizable?",
  aviso: FRASE_NIC2,
  consigna: "Según la NIC 2 del libro, el inventario se mide al costo o al valor neto realizable, el que sea menor. Calcula y decide en cada caso. Tienes un solo intento por pregunta.",
  pie: "Construido con la regla del libro, pp. 257-258",
};

export const BOTON_H7 = { siguiente: "Siguiente ítem", verResumen: "Ver mi resumen" };

/* PENDIENTE DE DECISIÓN DE L (regla 10c): los rótulos de la ficha que propone Near. */
export const FICHA_10C = {
  quien: "Quién", costo: "Costo", precio: "Precio esperado de venta", terminar: "Lo que falta para terminar", vender: "Lo que cuesta vender",
};

/* Los datos de Near (registro 5c). `terminar` solo existe en la fábrica. */
export const CASOS_H7 = [
  {
    encabezado: "Caso 1", quien: "Una tienda", costo: 665_000, precio: 710_000, terminar: null, vender: 85_000,
    texto: "A una tienda, una mercancía le costó $665.000. La tienda cree que la va a vender en $710.000, pero para venderla tiene que pagar $85.000.",
    acierto: "Así es. El valor neto realizable, $625.000, es menor que el costo, $665.000.",
    errorMedida: "Se mide por el menor de los dos. Aquí el valor neto realizable, $625.000, es menor que el costo.",
  },
  {
    encabezado: "Caso 2", quien: "Otra tienda", costo: 920_000, precio: 1_110_000, terminar: null, vender: 130_000,
    texto: "A otra tienda, una mercancía le costó $920.000. La tienda cree que la va a vender en $1.110.000, pero para venderla tiene que pagar $130.000.",
    acierto: "Así es. Esta vez el costo, $920.000, es menor que el valor neto realizable, $980.000.",
    errorMedida: "Se mide por el menor de los dos. Esta vez el menor es el costo, $920.000.",
  },
  {
    encabezado: "Caso 3", quien: "Una fábrica", costo: 1_315_000, precio: 1_520_000, terminar: 160_000, vender: 95_000,
    texto: "A una fábrica, un producto que aún no está listo le costó $1.315.000. Cree que lo va a vender en $1.520.000. Pero antes tiene que pagar $160.000 para terminarlo, y luego $95.000 para venderlo.",
    acierto: "Así es. El valor neto realizable, $1.265.000, es menor que el costo, $1.315.000.",
    errorMedida: "Se mide por el menor de los dos. Aquí es el valor neto realizable, $1.265.000.",
  },
];

/* La regla del libro (p. 257): precio esperado − lo que falta para terminar − lo que cuesta vender. */
export const vnr = (c) => c.precio - (c.terminar ?? 0) - c.vender;
/* Y (p. 258): se mide por el menor de los dos. */
export const medida = (c) => Math.min(c.costo, vnr(c));

export const fichaH7 = (c) => [
  [FICHA_10C.quien, c.quien], [FICHA_10C.costo, pesos(c.costo)], [FICHA_10C.precio, pesos(c.precio)],
  ...(c.terminar === null ? [] : [[FICHA_10C.terminar, pesos(c.terminar)]]),
  [FICHA_10C.vender, pesos(c.vender)],
];

const PREGUNTA_VNR = "¿Cuál es su valor neto realizable?";
const PREGUNTA_MEDIDA = "¿Por qué valor se mide esta mercancía, según la NIC 2 del libro?";

/* Los errores del valor neto realizable de las tiendas (casos 1 y 2: «las mismas retroalimentaciones»). */
const erroresTienda = (c) => [
  { valor: c.precio, retro: "Ese es el precio al que espera venderla. Al valor neto realizable se le resta lo que cuesta venderla." },
  { valor: c.precio + c.vender, retro: "Lo que cuesta venderla se resta, no se suma." },
];
const erroresFabrica = (c) => [
  { valor: c.precio - c.vender, retro: "Falta restar lo que cuesta terminarlo, $160.000." },
  { valor: c.precio - c.terminar, retro: "Falta restar lo que cuesta venderlo, $95.000." },
];

export const ITEMS_H7 = CASOS_H7.flatMap((c, k) => [
  {
    id: `vnr-${k + 1}`, caso: k, pregunta: PREGUNTA_VNR, correcta: vnr(c),
    acierto: c.terminar === null
      ? `Así es: ${pesos(c.precio)} − ${pesos(c.vender)} = ${pesos(vnr(c))}.`
      : `Así es: ${pesos(c.precio)} − ${pesos(c.terminar)} − ${pesos(c.vender)} = ${pesos(vnr(c))}.`,
    distractores: c.terminar === null ? erroresTienda(c) : erroresFabrica(c),
  },
  {
    id: `medida-${k + 1}`, caso: k, pregunta: PREGUNTA_MEDIDA, correcta: medida(c),
    acierto: c.acierto,
    distractores: [{ valor: Math.max(c.costo, vnr(c)), retro: c.errorMedida }],
  },
]);

/*
 * Patrón T7-3 (Watari): en cada caso, la cuenta del valor neto realizable
 * después de su ítem, y «Se mide por el menor» después del ítem de medición;
 * las dos se van cuando empieza otro caso. Títulos y rótulos de Watari, revisados por Near.
 */
export const FIGURAS_H7 = CASOS_H7.flatMap((c, k) => [
  { ...cuentaVnr(c.quien, c.precio, c.terminar, c.vender), clave: `vnr-${k + 1}`, desde: 2 * k + 1, hasta: 2 * k + 2 },
  { ...cuentaMenor(c.costo, vnr(c)), clave: `menor-${k + 1}`, desde: 2 * k + 2, hasta: 2 * k + 2 },
]);

/* El resumen del cierre, con la frase de los Hacer de la célula. */
export const resumenH7 = (bien, total) => `${bien} de ${total} al primer toque.`;
