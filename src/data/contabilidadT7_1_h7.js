/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · H7 DE HACER — «¿Qué control falta?» (Célula C).
 *
 * Fuente: la v1 de Near y su corrección 6, las dos con PASA de Mello (tanda
 * corregida), y la decisión de L sobre el objetivo. Manda la más nueva:
 *   · el objetivo es «…con el control que el libro propone» (no «que lo
 *     evita», que dice más que el libro);
 *   · el caso 2 es el del incendio; los casos 3 y 4 traen su consecuencia.
 * Copias en orquestador/conocimiento/paquetes/t7-1-h7-v1.md y
 * t7-1-h7-cambios.md; una prueba compara cada texto contra ellas.
 *
 * Hacer Fácil, exploratoria: el motor paga los 10 FP al terminar; el
 * porcentaje va para el panel docente. Migración 0097, que corre Mateo.
 *
 * Seis casos, un solo intento cada uno (patrón v3.2). Los casos van en orden
 * aleatorio, y sus tres opciones también. Después de responder se ve el
 * control y la línea del libro, acierte o no.
 *
 * Lo que la v1 no trae y se toma de la convención de A7: el pie «Basado en el
 * libro, p. 209» (pp. 208-209 en el caso 6, como dice la v1); y de H1-H6, los
 * botones «Siguiente ítem» y «Ver mi resumen».
 *
 * CIFRAS: la única es la de las 500 unidades del caso 4, que entra al
 * registro 5c (corrección 6). Una prueba vigila que no haya otra.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const H7_ID = "t7-1-que-control-falta";

export const H7 = {
  id: H7_ID,
  nombre: "¿Qué control falta?",
  /* La v1: «Etiqueta del panel docente». */
  etiqueta: "¿Qué control falta? · Inventarios I",
  /* Decisión de L. */
  objetivo: "Relacionar cada riesgo de la bodega con el control que el libro propone.",
  consigna: [
    "Cada caso muestra un riesgo en la bodega. Elige el control del libro que le hace falta.",
    "Tienes un solo intento por caso. Después de responder, verás el control y la línea del libro.",
  ],
};

/* Los seis controles, con la redacción de A7 (los nombres de las opciones de la v1). */
export const CONTROLES_H7 = [
  { valor: "almacen", texto: "Guardar los inventarios en un almacén techado y con puertas." },
  { valor: "poliza", texto: "Proteger los inventarios con una póliza de seguros." },
  { valor: "conteos", texto: "Hacer conteos físicos cada cierto tiempo." },
  { valor: "comparar", texto: "Comparar los inventarios físicos con los registros contables." },
  { valor: "azar", texto: "Revisar al azar y comparar con los libros contables." },
  { valor: "recepcion", texto: "Hacer un informe de recepción para contabilidad." },
];

export const CASOS_H7 = [
  {
    id: "sin-puerta", subtema: "Seguridad física", pie: "Basado en el libro, p. 209",
    texto: "Por las noches, una parte de la bodega queda sin puerta. Cualquiera podría entrar y llevarse mercancía.",
    correcta: "almacen", distractores: ["poliza", "conteos"],
    porque: "El libro pide guardar los inventarios en un almacén techado y con puertas, para evitar los robos.",
  },
  {
    id: "incendio", subtema: "Protección", pie: "Basado en el libro, p. 209",
    /* Corrección 6. */
    texto: "Un incendio llega a la bodega y destruye parte de la mercancía. La empresa no tiene nada que respalde esa pérdida.",
    correcta: "poliza", distractores: ["azar", "recepcion"],
    porque: "El libro pide proteger los inventarios con una póliza de seguros.",
  },
  {
    id: "falta-mercancia", subtema: "Conteo", pie: "Basado en el libro, p. 209",
    /* Corrección 6. */
    texto: "Al final del año, la empresa descubre que le falta mercancía y no sabe desde cuándo.",
    correcta: "conteos", distractores: ["poliza", "recepcion"],
    porque: "El libro pide hacer conteos físicos de forma periódica.",
  },
  {
    id: "quinientas", subtema: "Comparación con registros", pie: "Basado en el libro, p. 209",
    /* Corrección 6. */
    texto: "Los libros dicen que hay 500 unidades, pero nadie sabe si de verdad están en la bodega.",
    correcta: "comparar", distractores: ["almacen", "poliza"],
    porque: "El libro pide comparar lo que hay en la bodega con los registros contables.",
  },
  {
    id: "mismo-dia", subtema: "Comparación con registros", pie: "Basado en el libro, p. 209",
    texto: "Las revisiones se hacen siempre el mismo día, y todos en la bodega saben cuándo.",
    correcta: "azar", distractores: ["almacen", "recepcion"],
    porque: "El libro pide revisar al azar y comparar con los libros contables.",
  },
  {
    id: "sin-informe", subtema: "Recepción", pie: "Basado en el libro, pp. 208-209",
    texto: "La mercancía llega y se guarda en la bodega. Pero en contabilidad nadie sabe que llegó.",
    correcta: "recepcion", distractores: ["conteos", "poliza"],
    porque: "El libro pide un informe de recepción, que se envía a contabilidad para registrar lo que llegó.",
  },
];

export const BOTON_H7 = { siguiente: "Siguiente ítem", verResumen: "Ver mi resumen" };
export const CORRECTO_H7 = "Correcto.";

export const resumenH7 = (bien, total) => `${bien} de ${total} al primer toque.`;
