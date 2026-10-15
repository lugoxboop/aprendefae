import { FRASE_NIC2 } from "./contabilidadT7_3_a7.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · H6 DE HACER — «¿Entra al costo?» (Célula C).
 *
 * Fuente: la v1 de Near, con PASA de Mello. Copia en
 * orquestador/conocimiento/paquetes/t7-3-h6-v1.md; una prueba compara cada
 * texto de aquí contra ella, letra por letra.
 *
 * Hacer Fácil, evaluativa, 10 FP: el motor compartido escala los FP con los
 * aciertos, con piso del 50 %. Migración 0108, que corre Mateo.
 *
 * SIETE ACIERTOS POSIBLES, uno por cosa, en el orden de la tabla. Un solo
 * intento. Sin cifras. LA FRASE FIJA DE LA NIC 2 va siempre a la vista
 * (encargo de L: en A7, A8, H6 y H7); es la misma constante de A7.
 *
 * Cada cosa tiene las tres opciones de la v1: Se suma · Se resta · No entra.
 * «Igual que en 1» e «Igual que en 4» repiten esos textos.
 *
 * Lo que la v1 no trae y se toma de H3 de T7-3: las opciones van siempre en
 * el orden de la v1, sin barajar, porque son las clases mismas; los botones
 * «Siguiente ítem» y «Ver mi resumen».
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const H6_ID = "t7-3-que-entra-al-costo";

export const H6 = {
  id: H6_ID,
  nombre: "¿Entra al costo?",
  aviso: FRASE_NIC2,
  consigna: "Una empresa compra mercancía. Decide qué pasa con cada cosa en el costo de adquisición, según la NIC 2 del libro. Tienes un solo intento por cosa.",
  pie: "Basado en el libro, p. 258",
};

export const BOTON_H6 = { siguiente: "Siguiente ítem", verResumen: "Ver mi resumen" };

export const OPCIONES_H6 = ["Se suma", "Se resta", "No entra"];

const SE_SUMA = {
  correcta: "Se suma",
  acierto: "Así es. Según el libro, entra en el costo de adquisición.",
  error: "Según el libro, esto se suma al costo de adquisición.",
};
const SE_RESTA = {
  correcta: "Se resta",
  acierto: "Así es. Los descuentos comerciales y las rebajas se restan.",
  error: "Según el libro, los descuentos comerciales y las rebajas se restan para hallar el costo.",
};

export const ITEMS_H6 = [
  { id: "precio-de-compra", pregunta: "El precio de compra de la mercancía.", ...SE_SUMA },
  /* «Igual que en 1». */
  { id: "transporte", pregunta: "El transporte de la mercancía hasta la bodega.", ...SE_SUMA },
  { id: "almacenamiento", pregunta: "Lo que cuesta guardar la mercancía.", ...SE_SUMA },
  { id: "descuento-comercial", pregunta: "Un descuento comercial que da el proveedor.", ...SE_RESTA },
  { id: "aranceles", pregunta: "Los aranceles por traer la mercancía de otro país.", ...SE_SUMA },
  {
    id: "impuesto-recuperable", pregunta: "Un impuesto que la empresa recupera después.", correcta: "No entra",
    acierto: "Así es. Si la empresa lo recupera, no entra en el costo.",
    error: "Solo entran los impuestos que la empresa no puede recuperar después. Este sí lo recupera, así que no entra.",
  },
  /* «Igual que en 4». */
  { id: "rebaja", pregunta: "Una rebaja que hace el proveedor.", ...SE_RESTA },
].map((it) => ({ ...it, opciones: OPCIONES_H6 }));

/* El resumen del cierre, con la frase de los Hacer de la célula: cuántos de los siete al primer toque. */
export const resumenH6 = (bien, total) => `${bien} de ${total} al primer toque.`;
