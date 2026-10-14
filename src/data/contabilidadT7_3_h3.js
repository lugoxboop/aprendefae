/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · H3 DE HACER — «¿Comercial o condicionado?» (Célula C).
 *
 * Fuente: la v1 de Near, con PASA de Mello. Copia en
 * orquestador/conocimiento/paquetes/t7-3-h3-v1.md; una prueba compara cada
 * texto de aquí contra ella, letra por letra.
 *
 * Hacer Fácil, evaluativa, 10 FP: el motor compartido escala los FP con los
 * aciertos, con piso del 50 %. Migración 0105, que corre Mateo.
 *
 * SIETE ACIERTOS POSIBLES, uno por ítem, en el orden de la tabla. Un solo
 * intento. Sin montos en pesos (solo porcentajes de ejemplo), así que no hay
 * cifras que cruzar. Cada ítem tiene una sola retroalimentación de error,
 * la misma para cualquier opción equivocada; los ítems 3 y 4 repiten las de
 * los ítems 2 y 1, como dice la v1.
 *
 * Lo que la v1 no trae y se toma de la convención de H1 de T7-2 (¿Debe o
 * haber?): las opciones van siempre en el orden de la v1, sin barajar,
 * porque son las clases mismas («Comercial» · «Condicionado», «Un gasto» ·
 * «Un ingreso» · «Una devolución», «Sí» · «No»). Los botones «Siguiente
 * ítem» y «Ver mi resumen».
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const H3_ID = "t7-3-comercial-o-condicionado";

export const H3 = {
  id: H3_ID,
  nombre: "¿Comercial o condicionado?",
  consigna: "Lee cada caso y decide qué clase de descuento es, y qué pasa con él. Tienes un solo intento por pregunta.",
  pie: "Basado en el libro, pp. 248-252",
};

export const BOTON_H3 = { siguiente: "Siguiente ítem", verResumen: "Ver mi resumen" };

const CLASES = ["Comercial", "Condicionado"];
const QUE_ES = ["Un gasto", "Un ingreso", "Una devolución"];

const COMERCIAL = {
  error: "No depende de ninguna condición, y ya viene restado en la factura. Es un descuento comercial.",
  acierto: "Así es. No pide nada a cambio y viene en la factura: es comercial.",
};
const CONDICIONADO = {
  error: "Este depende de una condición: pagar a tiempo. Por eso es un descuento condicionado, y no va en la factura.",
  acierto: "Así es. Depende de que el cliente pague a tiempo: es condicionado.",
};

export const ITEMS_H3 = [
  { id: "precio-rebajado", pregunta: "La factura ya trae el precio rebajado en un 8 %, y el cliente no tiene que hacer nada para recibirlo.", opciones: CLASES, correcta: "Comercial", ...COMERCIAL },
  { id: "paga-a-los-diez", pregunta: "El cliente recibe un 3 % de descuento si paga la factura a los diez días.", opciones: CLASES, correcta: "Condicionado", ...CONDICIONADO },
  /* «La misma del ítem 2». */
  { id: "valor-completo", pregunta: "Se factura el valor completo. La rebaja llega solo si el cliente paga dentro del plazo que pactaron.", opciones: CLASES, correcta: "Condicionado", ...CONDICIONADO },
  /* «La misma del ítem 1». */
  { id: "a-todo-cliente", pregunta: "Un proveedor le rebaja a todo cliente un 10 % en un producto, sin ninguna condición, y así lo pone en la factura.", opciones: CLASES, correcta: "Comercial", ...COMERCIAL },
  {
    id: "para-quien-vende", pregunta: "Para quien vende, ¿qué es el descuento condicionado?", opciones: QUE_ES, correcta: "Un gasto",
    error: "Quien vende había facturado un valor y recibe menos. Para quien vende, el descuento es un gasto.",
    acierto: "Así es. Vendió por un valor y, al final, recibe menos: para quien vende es un gasto.",
  },
  {
    id: "para-quien-compra", pregunta: "Para quien compra, ¿qué es el descuento condicionado?", opciones: QUE_ES, correcta: "Un ingreso",
    error: "Quien compra había comprado por un valor y paga menos. Para quien compra, el descuento es un ingreso.",
    acierto: "Así es. Había comprado por un valor y, al final, paga menos: para quien compra es un ingreso.",
  },
  {
    id: "es-devolucion", pregunta: "Un cliente pagó a tiempo y recibió un descuento condicionado. ¿Eso es una devolución?", opciones: ["Sí", "No"], correcta: "No",
    error: "En una devolución, la mercancía vuelve. Aquí no vuelve nada: solo se rebaja el precio. No es una devolución.",
    acierto: "Así es. No es una devolución, porque no vuelve ninguna mercancía. Solo se rebaja el precio.",
  },
];

/* El resumen del cierre, con la frase de los Hacer de la célula: cuántos de los siete al primer toque. */
export const resumenH3 = (bien, total) => `${bien} de ${total} al primer toque.`;
