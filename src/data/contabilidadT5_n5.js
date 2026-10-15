import { DEBE, HABER, pesos } from "./contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N5 DE HACER — «¿Ganó o perdió?» (Célula C).
 *
 * Fuente: la v1 de Near, con PASA de Mello. Copia en
 * orquestador/conocimiento/paquetes/t5-n5-v1.md; una prueba compara cada
 * texto de aquí contra ella, letra por letra.
 *
 * Hacer Medio, evaluativa, 25 FP: el motor compartido escala los FP con los
 * aciertos, con piso del 50 %. Migración 0113, que corre Erwin.
 *
 * ONCE ACIERTOS POSIBLES: los ítems 1 a 4 y 6, las tres líneas de la primera
 * venta (ítem 5) y las tres de la segunda (ítem 7). Un solo intento por
 * unidad. Venta por el costo, como en el ejemplo del libro y como publicó B:
 * Inversiones – títulos sale por lo que costaron las acciones vendidas.
 *
 * LAS CIFRAS son construidas (Acacia) y no se escriben a mano: salen de las
 * acciones, el precio de compra y las dos ventas (calcularN5). El registro
 * de T5 (orquestador/conocimiento/registro-cifras-construidas-t5.json) las
 * trae; una prueba las recalcula y comprueba que ninguna es del libro. Son
 * acciones: el libro no trae ejemplo con acciones (hueco 3), y la pieza les
 * aplica la regla de venta de Santa Pacha. Sin interés y sin dividendos.
 *
 * NOMBRES DE CUENTA: los de B, que ya ve el estudiante, con raya –:
 * «Caja», «Inversiones – títulos», «Ingresos financieros – ganancia en venta
 * de títulos» y «Gastos financieros – pérdida en venta de títulos». Ninguna
 * variante del libro (C5-c, C5-e).
 *
 * Lo que la ficha no trae y se toma de los Hacer de la célula (H4 de T7-3):
 * las opciones de cada elección y las líneas de cada asiento, barajadas; las
 * sumas del asiento después de «Comprobar»; los botones. La «Ficha» de Near
 * resume el enunciado y las preguntas, y no va en pantalla.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const N5_ID = "t5-gano-o-perdio";

export const ACCIONES_N5 = 900;
export const PRECIO_N5 = 5100;
export const VENTA1_N5 = { acciones: 550, precio: 5400 };
export const VENTA2_N5 = { precio: 4400 };

export function calcularN5() {
  const inversion = ACCIONES_N5 * PRECIO_N5;
  const quedan = ACCIONES_N5 - VENTA1_N5.acciones;
  const recibe1 = VENTA1_N5.acciones * VENTA1_N5.precio;
  const costo1 = VENTA1_N5.acciones * PRECIO_N5;
  const recibe2 = quedan * VENTA2_N5.precio;
  const costo2 = quedan * PRECIO_N5;
  return {
    inversion, quedan, recibe1, costo1, ganancia: recibe1 - costo1, recibe2, costo2, perdida: costo2 - recibe2,
    /* Los distractores que llevan cifra propia. */
    lasQueQuedan: quedan * VENTA1_N5.precio, gananciaDeLas900: ACCIONES_N5 * VENTA1_N5.precio - ACCIONES_N5 * PRECIO_N5,
  };
}
export const CIFRAS_N5 = calcularN5();
const C = CIFRAS_N5;

const gano = (v) => `Ganó ${pesos(v)}`;
const perdio = (v) => `Perdió ${pesos(v)}`;

export const N5 = {
  id: N5_ID,
  nombre: "¿Ganó o perdió?",
  enunciado: [
    "El 1 de abril, Acacia usa efectivo que le sobra para comprar 900 acciones de otra empresa. Paga $5.100 por cada una, que es su valor nominal.",
    "En total, paga $4.590.000.",
    "Más adelante vende esas acciones en dos partes. Calcula si ganó o perdió en cada venta y registra los asientos. Tienes un solo intento por pregunta.",
  ],
  pie: "Basado en el libro, pp. 193-195",
};

export const BOTON_N5 = { siguiente: "Siguiente ítem", verResumen: "Ver mi resumen" };

const CAJA = "Caja";
const INVERSIONES = "Inversiones – títulos";
const GANANCIA = "Ingresos financieros – ganancia en venta de títulos";
const PERDIDA = "Gastos financieros – pérdida en venta de títulos";
const RETRO_CAJA = "Acacia recibe el dinero en Caja. Es un activo que aumenta: va al debe.";
const RETRO_INVERSIONES = "Salen las acciones vendidas, así que la inversión baja: va al haber, por lo que costaron.";

export const ITEMS_N5 = [
  {
    id: "lo-que-recibe", tipo: "eleccion", pesos: true,
    pregunta: "El 10 de julio, Acacia vende 550 de sus acciones. Le pagan $5.400 por cada una. ¿Cuánto recibe?",
    correcta: C.recibe1,
    acierto: "Así es: 550 × $5.400 = $2.970.000.",
    distractores: [
      { valor: C.inversion, retro: "Eso es lo que pagó por las 900 acciones al comprarlas. Lo que recibe sale de las 550 que vendió, a $5.400 cada una." },
      { valor: C.lasQueQuedan, retro: "Ese cálculo usa las 350 que se quedan. Lo que recibe sale de las 550 que vendió, a $5.400 cada una." },
    ],
  },
  {
    id: "lo-que-costaron", tipo: "eleccion", pesos: true,
    pregunta: "¿Cuánto le costaron esas 550 acciones?",
    correcta: C.costo1,
    acierto: "Así es: 550 × $5.100 = $2.805.000.",
    distractores: [
      { valor: C.recibe1, retro: "Eso es lo que recibe por venderlas. Lo que le costaron sale del precio de compra: 550 × $5.100." },
      { valor: C.inversion, retro: "Eso es lo que costaron las 900 acciones. Aquí solo van las 550 que vendió." },
    ],
  },
  {
    id: "gano-o-perdio-1", tipo: "eleccion",
    pregunta: "¿Ganó o perdió en esta venta?",
    correcta: gano(C.ganancia),
    acierto: "Así es. Recibió $2.970.000 por acciones que le costaron $2.805.000: ganó $165.000.",
    distractores: [
      { valor: perdio(C.ganancia), retro: "Recibió más de lo que le costaron, así que ganó: $2.970.000 − $2.805.000 = $165.000." },
      { valor: gano(C.gananciaDeLas900), retro: "Ese cálculo usa las 900 acciones, pero solo vendió 550. La ganancia de esta venta es de $165.000." },
    ],
  },
  {
    id: "sale-por", tipo: "eleccion", pesos: true,
    pregunta: "En el asiento de esta venta, ¿por qué valor sale Inversiones – títulos?",
    correcta: C.costo1,
    acierto: "Así es. Como en el ejemplo del libro, la inversión sale por lo que costaron las acciones vendidas.",
    distractores: [
      { valor: C.recibe1, retro: "Eso es lo que recibió. Como en el ejemplo del libro, la inversión sale por lo que costaron las acciones vendidas: $2.805.000." },
      { valor: C.inversion, retro: "Ese es el costo de todas las acciones. Solo salen las 550 que vendió: $2.805.000." },
    ],
  },
  {
    id: "asiento-con-ganancia", tipo: "asiento",
    pregunta: "Ubica cada línea del asiento de la venta: Debe o Haber.",
    lineas: [
      { id: "caja", cuenta: CAJA, valor: C.recibe1, lado: DEBE, retro: RETRO_CAJA },
      { id: "inversiones", cuenta: INVERSIONES, valor: C.costo1, lado: HABER, retro: RETRO_INVERSIONES },
      { id: "ganancia", cuenta: GANANCIA, valor: C.ganancia, lado: HABER, retro: "La ganancia es un ingreso que aumenta: va al haber." },
    ],
  },
  {
    id: "gano-o-perdio-2", tipo: "eleccion",
    pregunta: "El 20 de octubre, Acacia vende las 350 acciones que le quedan, a $4.400 cada una. ¿Ganó o perdió?",
    correcta: perdio(C.perdida),
    acierto: "Así es. Recibió $1.540.000 por acciones que le costaron $1.785.000. Perdió $245.000.",
    distractores: [
      { valor: gano(C.perdida), retro: "Vendió por menos de lo que le costaron, así que perdió: $1.785.000 − $1.540.000 = $245.000." },
      { valor: perdio(C.costo2), retro: "Eso es lo que le costaron las 350 acciones. La pérdida es la diferencia: $1.785.000 − $1.540.000 = $245.000." },
    ],
  },
  {
    id: "asiento-con-perdida", tipo: "asiento",
    pregunta: "Ubica cada línea del asiento de la venta: Debe o Haber.",
    lineas: [
      { id: "caja", cuenta: CAJA, valor: C.recibe2, lado: DEBE, retro: RETRO_CAJA },
      { id: "perdida", cuenta: PERDIDA, valor: C.perdida, lado: DEBE, retro: "La pérdida es un gasto que aumenta: va al debe." },
      { id: "inversiones", cuenta: INVERSIONES, valor: C.costo2, lado: HABER, retro: RETRO_INVERSIONES },
    ],
  },
];

/* El resumen del cierre, con la frase de los Hacer de la célula: cuántas de las once al primer toque. */
export const resumenN5 = (bien, total) => `${bien} de ${total} al primer toque.`;
