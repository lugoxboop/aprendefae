/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · H1 DE HACER — «¿Debe o haber?» (Célula C).
 *
 * Fuente: la v1 de Near, con PASA de Mello. Copia en
 * orquestador/conocimiento/paquetes/t7-2-h1-v1.md; una prueba compara cada
 * texto de aquí contra ella, letra por letra.
 *
 * Hacer: Fácil, exploratoria. El motor compartido paga los 10 FP al
 * terminar; el porcentaje va para el panel docente. Va al catálogo del
 * servidor con la migración 0098, que corre Mateo.
 *
 * Siete hechos, barajados en cada intento. Las dos opciones, «Debe» y
 * «Haber», siempre en ese orden. Un solo intento por hecho: después se ve la
 * respuesta y su porqué (el mismo para el acierto y el error, como dice la
 * v1). Sin cifras de dinero (regla 3).
 *
 * Lo que la v1 no trae y se toma de la convención de H1 de T7-1: los botones
 * «Siguiente ítem» y «Ver mi resumen», y «Correcto.» antes del porqué en el
 * acierto. El subtema de cada hecho es uno de los cuatro de la ficha.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const H1_ID = "t7-2-debe-o-haber";

export const H1 = {
  id: H1_ID,
  nombre: "¿Debe o haber?",
  consigna: [
    "La empresa usa el sistema permanente, salvo donde se diga otra cosa. En cada hecho, di si Inventario de mercancías va al debe o al haber.",
    "Tienes un solo intento por hecho. Después de responder, verás el porqué.",
  ],
};

/* Convención de H1 de T7-1. */
export const BOTON_H1 = { siguiente: "Siguiente ítem", verResumen: "Ver mi resumen" };
export const CORRECTO = "Correcto.";

/* Las dos, en orden fijo. */
export const OPCIONES_H1 = [
  { id: "debe", nombre: "Debe" },
  { id: "haber", nombre: "Haber" },
];

export const SUBTEMAS_H1 = ["Entradas", "Salidas", "Consumo interno", "Cierre periódico"];

const PIE = "Basado en el libro, pp. 207-208";

/* Los siete hechos, en el orden de la tabla de la v1. La vista los baraja. */
export const ITEMS_H1 = [
  {
    id: "recibe-compra",
    texto: "La tienda recibe 40 cajas que le compró a un proveedor.",
    respuesta: "debe",
    subtema: "Entradas",
    porque: "Entra mercancía a la bodega: el activo aumenta y va al debe, por el costo de lo comprado.",
    pie: PIE,
  },
  {
    id: "devuelve-cliente",
    texto: "Un cliente le devuelve a la tienda dos neveras que había comprado.",
    respuesta: "debe",
    subtema: "Entradas",
    porque: "Vuelve mercancía a la bodega: el activo aumenta y va al debe, por el costo de lo devuelto.",
    pie: PIE,
  },
  {
    id: "vende",
    texto: "La tienda le vende 15 cajas a un cliente.",
    respuesta: "haber",
    subtema: "Salidas",
    porque: "Sale mercancía de la bodega: el activo disminuye y va al haber, por el costo de lo que salió.",
    pie: PIE,
  },
  {
    id: "devuelve-proveedor",
    texto: "Llegaron 5 cajas dañadas, y la tienda se las devuelve al proveedor.",
    respuesta: "haber",
    subtema: "Salidas",
    porque: "Sale mercancía de vuelta al proveedor: el activo baja y va al haber.",
    pie: PIE,
  },
  {
    /* El ejemplo del café es construcción de Near (marcada en la v1). */
    id: "consumo-interno",
    texto: "La empresa saca café de la bodega para que lo tomen sus empleados.",
    respuesta: "haber",
    subtema: "Consumo interno",
    porque: "La empresa usa esa mercancía para su propio consumo: sale de la bodega y va al haber.",
    pie: PIE,
  },
  {
    /* Los ítems 6 y 7 nombran el periódico en el enunciado (regla 4): repasan la P4 de A1. */
    id: "cierre-final",
    texto: "En el periódico, al cierre, la empresa coloca el valor del inventario final.",
    respuesta: "debe",
    subtema: "Cierre periódico",
    porque: "Al cierre, el inventario final se coloca en el debe de la cuenta.",
    pie: PIE,
  },
  {
    id: "cierre-inicial",
    texto: "En el periódico, al cierre, la empresa quita el valor del inventario inicial.",
    respuesta: "haber",
    subtema: "Cierre periódico",
    porque: "Al cierre, el inventario inicial se quita por el haber de la cuenta.",
    pie: PIE,
  },
];

/* Lo que lee un lector de pantalla al cerrar: cuántos al primer toque. */
export const resumenH1 = (bien, cuantos) => `${bien} de ${cuantos} al primer toque.`;
