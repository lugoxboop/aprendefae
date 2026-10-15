import { BOTON } from "./contabilidadT7_3.js";
import { FRASE_NIC2 } from "./contabilidadT7_3_a7.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · A8 DE APRENDER — «La NIC 2 del libro: fórmulas y revelación»
 * (Célula C). La última pieza de T7-3.
 *
 * Fuente: la v1 de Near, con PASA de Mello, y el cambio de Near que pasó L
 * (la pregunta de la pantalla 2, su acierto, su error y la línea de UEPS
 * después de ella). Copia en orquestador/conocimiento/paquetes/t7-3-a8-v1.md;
 * una prueba compara cada texto de aquí contra ella, letra por letra, y que
 * los textos viejos ya no estén.
 *
 * Toda la pieza va atribuida al libro (pp. 259-260). LA FRASE FIJA DE LA
 * NIC 2 va siempre a la vista, en todas las pantallas (encargo de L), con la
 * constante de A7.
 *
 * C7-25 (decisión de L): la frase contradictoria de la p. 259 no se cita, y
 * FIFO y el promedio van sin condición, con «Basado en el libro, p. 259».
 *
 * Las glosas de «minoristas», «margen bruto» e «intercambiables» son
 * [CONSTRUCCIÓN] de Near.
 *
 * Lo que la v1 no trae y se toma de A1 y A7 de T7-3: los botones y mensajes,
 * el pie de cada pantalla con las páginas de la columna «Fuente», la línea
 * de UEPS («después de la pregunta») como texto que aparece con el acierto,
 * y «Con esto terminas Inventarios III.» como el cierre del resumen.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const A8_ID = "t7-3-nic2-formulas";

const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Al terminar, sabrás qué fórmulas del costo nombra la NIC 2 del libro, y qué pide que se informe.",
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 259-260",
};

const SISTEMAS = {
  id: "sistemas",
  tipo: "lectura",
  parrafos: [
    "El libro nombra dos sistemas que la empresa puede usar si le convienen. Los dos sirven si dan un resultado cercano al costo.",
    "Se llaman el costo estándar y el método de los minoristas.",
    /* [CONSTRUCCIÓN] de Near: glosa; el libro dice «sector comercial al por menor». */
    "Los minoristas son las tiendas que le venden al público.",
    "El libro dice que sirve para una tienda con muchos artículos. Se venden rápido y le dejan a la tienda casi la misma ganancia.",
    "En ese método, el costo se halla restándole al precio de venta un porcentaje de margen bruto.",
    /* [CONSTRUCCIÓN] de Near: glosa; el libro no lo define. */
    "El margen bruto es la parte del precio que la tienda gana sobre lo que le costó la mercancía.",
  ],
  boton: BOTON.seguir,
  pie: "Basado en el libro, p. 259",
};

const FORMULAS = {
  id: "formulas",
  tipo: "eleccion",
  parrafos: [
    "Ahora vienen las fórmulas del costo, que son tres. La primera es la identificación específica.",
    /* La explicación de «intercambiables» es [CONSTRUCCIÓN] de Near. */
    "Según el libro, se usa para productos que no son intercambiables entre sí. Es decir, productos que no se pueden cambiar uno por otro, porque cada uno es distinto.",
    "Con ella, cada producto lleva su propio costo.",
    /* C7-25: sin la condición contradictoria. */
    "El libro nombra otras dos fórmulas. La primera es primera entrada, primera salida, que en inglés se llama FIFO.",
    "La segunda es el costo promedio ponderado.",
    "En otras partes del libro, FIFO se llama PEPS: las primeras en entrar son las primeras en salir.",
    "Con FIFO, lo que se compró primero se vende primero. Lo que queda al final es lo que se compró más recientemente.",
    "Con el promedio ponderado, el costo de cada unidad sale del promedio de las que había al principio y las que se compraron en el periodo.",
    "La empresa usa la misma fórmula para todos los inventarios que se parecen en su naturaleza y en su uso.",
  ],
  /* Cambio de Near (pasado por L): la pregunta, su acierto y su error. */
  pregunta: "¿Cuántas fórmulas del costo nombra la NIC 2 del libro?",
  opciones: [
    { id: "dos", texto: "Dos", devolucion: "Son tres. La primera le da a cada producto su propio costo, y después el libro nombra otras dos." },
    { id: "tres", texto: "Tres", correcta: true },
    { id: "cuatro", texto: "Cuatro", devolucion: "Son tres. La primera le da a cada producto su propio costo, y después el libro nombra otras dos." },
  ],
  acierto: {
    texto: "Así es. Son tres, y las acabas de ver una por una en esta pieza.",
    /* «Después de la pregunta» (cambio de Near, p. 259). */
    despues: ["En esa lista no está UEPS (no válido bajo NIIF)."],
    pie: "Basado en el libro, p. 259",
  },
  error: { pie: "Basado en el libro, p. 259" },
  pie: "Basado en el libro, pp. 215 y 259",
};

const GASTO = {
  id: "gasto",
  tipo: "lectura",
  parrafos: [
    "Según el libro, cuando los inventarios se venden, su valor en libros pasa a ser un gasto. Se reconoce en el mismo periodo que los ingresos de esa venta.",
    "Si el inventario se rebaja hasta su valor neto realizable, o se pierde, eso se reconoce en el periodo en que pasa.",
  ],
  boton: BOTON.seguir,
  pie: "Basado en el libro, p. 260",
};

const REVELAR = {
  id: "revelar",
  tipo: "lectura",
  parrafos: ["El libro dice que la norma pide informar en los estados financieros, entre otras cosas:"],
  lista: [
    "La fórmula de costo que se usó.",
    "El valor en libros de los inventarios.",
    "Las rebajas de valor, y si alguna se reversó.",
    "El valor de los inventarios que se reconoció como gasto en el periodo.",
    "Los inventarios que se dieron como garantía de una deuda.",
  ],
  boton: BOTON.seguir,
  pie: "Basado en el libro, p. 260",
};

const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  parrafos: [
    "Según la NIC 2 del libro, hay tres fórmulas del costo. Son la identificación específica, FIFO y el promedio ponderado.",
    "UEPS (no válido bajo NIIF) no está en esa lista.",
    "Cuando el inventario se vende, su valor pasa a ser un gasto del mismo periodo de la venta.",
  ],
  siguiente: "Con esto terminas Inventarios III.",
  pie: "Basado en el libro, pp. 259-260",
};

export const PIEZA_NIC2_FORMULAS = {
  id: A8_ID,
  numero: 8,
  titulo: "La NIC 2 del libro: fórmulas y revelación",
  /* Siempre a la vista, en todas las pantallas. */
  aviso: FRASE_NIC2,
  pantallas: [PORTADA, SISTEMAS, FORMULAS, GASTO, REVELAR, RESUMEN],
};
