import { DEBE, HABER } from "./contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N4 DE HACER — «El interés del periodo» (Célula C).
 *
 * Fuente: la v1.1 de Near, con PASA CON CORRECCIONES de Mello. Copia en
 * orquestador/conocimiento/paquetes/t5-n4-v1.1.md, y las correcciones,
 * decididas por L, en t5-veredicto-mello-tandas-1-y-2.md: el pie pasa a
 * «Basado en el libro, pp. 194-195», y la nota que citaba «b5-t5-aprender2»
 * va con el id real (b5-t5-a2-los-tres-momentos-de-una-inversion, la pieza
 * que define «trimestre vencido»). Una prueba compara cada texto de aquí
 * contra los dos documentos, letra por letra.
 *
 * Hacer Medio, evaluativa, 25 FP: el motor compartido escala los FP con los
 * aciertos, con piso del 50 %. Migración 0112, que corre Erwin.
 *
 * SEIS ACIERTOS POSIBLES: los ítems 1, 2, 4 y 5, y las dos líneas del cobro
 * (ítem 3). Un solo intento por unidad. El tiempo va en meses, sin fechas
 * (decisión T5 v1.1), y el precio pagado es igual al valor nominal (hueco 2).
 *
 * LAS CIFRAS son construidas (Caoba) y no se escriben a mano: salen de los
 * títulos, el precio, la tasa y la venta (calcularN4). El registro de T5
 * (orquestador/conocimiento/registro-cifras-construidas-t5.json) las trae;
 * una prueba las recalcula y comprueba que ninguna es del libro.
 *
 * NOMBRES DE CUENTA: los de B, que ya ve el estudiante («Caja» e «Ingresos
 * por intereses»), no las variantes del libro (C5-d).
 *
 * Lo que la ficha no trae y se toma de los Hacer de la célula (H4 de T7-3):
 * las opciones de cada elección y las dos líneas del asiento, barajadas; las
 * sumas del asiento después de «Comprobar»; los botones. La «Ficha» de Near
 * resume el enunciado y no va en pantalla: los datos ya están en él.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const N4_ID = "t5-el-interes-del-periodo";

export const TITULOS_N4 = 1440;
export const PRECIO_N4 = 7500;
export const TASA_N4 = 16;
export const VENDIDOS_N4 = 680;
export const MESES_N4 = 3;

/* Interés por meses, como en la p. 194: valor × tasa × meses / 12. */
export const interesN4 = (base, meses) => (base * TASA_N4 * meses) / 1200;

export function calcularN4() {
  const inversion = TITULOS_N4 * PRECIO_N4;
  const quedan = TITULOS_N4 - VENDIDOS_N4;
  const base2 = quedan * PRECIO_N4;
  const vendidos = VENDIDOS_N4 * PRECIO_N4;
  return {
    inversion, quedan, base2, vendidos,
    interes1: interesN4(inversion, MESES_N4), anual: interesN4(inversion, 12), mensual: interesN4(inversion, 1),
    interes2: interesN4(base2, MESES_N4), deVendidos: interesN4(vendidos, MESES_N4),
  };
}
export const CIFRAS_N4 = calcularN4();
const C = CIFRAS_N4;

export const N4 = {
  id: N4_ID,
  nombre: "El interés del periodo",
  enunciado: [
    "Caoba invierte efectivo que le sobra en 1.440 títulos. Paga $7.500 por cada uno, que es su valor nominal: en total, $10.800.000.",
    "Los títulos pagan un interés del 16 % al año, a trimestre vencido.",
    "Calcula el interés y registra cada cobro. Tienes un solo intento por pregunta.",
  ],
  pie: "Basado en el libro, pp. 194-195",
};

export const BOTON_N4 = { siguiente: "Siguiente ítem", verResumen: "Ver mi resumen" };

const ANTES_DEL_ITEM_4 = "Ese mismo día, después de cobrar el interés, Caoba vende 680 de sus títulos. Le quedan 760.";

export const ITEMS_N4 = [
  {
    id: "cada-cuanto", tipo: "eleccion",
    pregunta: "¿Cada cuánto tiempo cobra Caoba el interés?",
    correcta: "Cada 3 meses",
    acierto: "Así es. A trimestre vencido, el interés se cobra al terminar cada trimestre, cada tres meses.",
    /* «Cada mes · Cada 12 meses → una sola». */
    distractores: [
      { valor: "Cada mes", retro: "A trimestre vencido, el interés se cobra al terminar cada trimestre. Un trimestre son tres meses." },
      { valor: "Cada 12 meses", retro: "A trimestre vencido, el interés se cobra al terminar cada trimestre. Un trimestre son tres meses." },
    ],
  },
  {
    id: "primer-trimestre", tipo: "eleccion", pesos: true,
    pregunta: "Pasan los primeros 3 meses. ¿Cuánto interés cobra Caoba?",
    correcta: C.interes1,
    acierto: "Así es: $10.800.000 × 0,16 × 3/12 = $432.000.",
    distractores: [
      { valor: C.anual, retro: "Ese es el interés de un año entero. El trimestre es 3/12 del año: $10.800.000 × 0,16 × 3/12." },
      { valor: C.mensual, retro: "Ese es el interés de un solo mes. El trimestre tiene tres meses: $10.800.000 × 0,16 × 3/12." },
    ],
  },
  {
    id: "asiento-del-cobro", tipo: "asiento",
    pregunta: "Ubica cada línea del asiento del cobro: Debe o Haber.",
    lineas: [
      { id: "caja", cuenta: "Caja", valor: C.interes1, lado: DEBE, retro: "Caoba recibe el dinero en Caja. Es un activo que aumenta: va al debe." },
      { id: "ingresos", cuenta: "Ingresos por intereses", valor: C.interes1, lado: HABER, retro: "El interés es un ingreso que aumenta: va al haber de Ingresos por intereses." },
    ],
  },
  {
    id: "base-del-segundo", tipo: "eleccion", pesos: true, intro: ANTES_DEL_ITEM_4,
    pregunta: "¿Sobre qué valor se calcula el interés del siguiente trimestre?",
    correcta: C.base2,
    acierto: "Así es. Solo rinden los títulos que le quedan: 760 × $7.500 = $5.700.000.",
    distractores: [
      { valor: C.inversion, retro: "Ese es el valor de todos los títulos. Caoba ya vendió 680: solo rinden los 760 que le quedan." },
      { valor: C.vendidos, retro: "Ese es el valor de los títulos que vendió. El interés se calcula sobre los que le quedan: 760 × $7.500." },
    ],
  },
  {
    id: "segundo-trimestre", tipo: "eleccion", pesos: true,
    pregunta: "Pasan otros 3 meses. ¿Cuánto interés cobra Caoba?",
    correcta: C.interes2,
    acierto: "Así es: $5.700.000 × 0,16 × 3/12 = $228.000.",
    distractores: [
      { valor: C.interes1, retro: "Ese interés sale de todos los títulos. Caoba ya vendió 680: el interés va sobre $5.700.000." },
      { valor: C.deVendidos, retro: "Ese interés sale de los títulos que vendió. El interés va sobre los que le quedan: $5.700.000." },
    ],
  },
];

/* El resumen del cierre, con la frase de los Hacer de la célula: cuántos de los seis al primer toque. */
export const resumenN4 = (bien, total) => `${bien} de ${total} al primer toque.`;
