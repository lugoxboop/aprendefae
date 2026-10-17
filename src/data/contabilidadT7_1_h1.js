/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · H1 DE HACER — «¿Qué cuenta se mueve?» (Célula C).
 *
 * Fuente: la v1 de Near y sus dos capas posteriores, las dos con PASA de
 * Mello. Manda la más nueva:
 *   · puntaje: «Exploratoria, Fácil: el motor compartido (src/fp/motor.js)
 *     paga los 10 FP al terminar.» La tabla de reparto de la v1 se borra
 *   · ítems 5 y 6 reescritos, y el error típico del ítem 5
 * Copias en orquestador/conocimiento/paquetes/t7-1-h1-v1.md y
 * t7-1-h1-cambios.md; una prueba compara cada texto de aquí contra ellas.
 *
 * Hacer: da FP y va al catálogo del servidor (migración 0090, que corre
 * Mateo). Un solo intento por hecho; después se ve la respuesta y su porqué.
 * Los seis hechos se barajan en cada intento; las cinco opciones van siempre
 * en el mismo orden.
 *
 * Lo que la v1 no trae y se toma de la convención del Tema 3: los botones
 * «Siguiente ítem» y «Ver mi resumen».
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const H1_ID = "t7-1-que-cuenta-se-mueve";

export const H1 = {
  id: H1_ID,
  /* Lote O: el objetivo, de Near (paquetes/lote-o-objetivos.md). */
  objetivo: "Decidir qué cuenta se mueve con cada hecho cuando la empresa usa el sistema periódico.",
  nombre: "¿Qué cuenta se mueve?",
  consigna: [
    "La empresa usa el sistema de inventario periódico. Para cada hecho, elige qué cuenta se mueve en ese momento.",
    "Tienes un solo intento por hecho. Después de responder, verás la respuesta y su porqué.",
  ],
};

/* Convención del Tema 3 (contabilidadTema3Act2.js). */
export const BOTON_H1 = { siguiente: "Siguiente ítem", verResumen: "Ver mi resumen" };

/* La palabra del acierto: la v1 dice «Correcto» y el porqué; con punto, como en el patrón de la célula. */
export const CORRECTO = "Correcto.";

/* Las cinco, en orden fijo: el estudiante no tiene que releerlas en cada ítem. */
export const OPCIONES_H1 = [
  { id: "compras", nombre: "Compras" },
  { id: "ingresos", nombre: "Ingresos por ventas" },
  { id: "inventario", nombre: "Inventario de mercancías" },
  { id: "otra", nombre: "Otra cuenta (no es mercancía)" },
  { id: "no-se-anota", nombre: "No se anota en ese momento" },
];

/*
 * Los seis hechos. `tipico` es el error típico con su línea propia: si el
 * estudiante elige esa opción, la línea va antes del porqué.
 */
export const ITEMS_H1 = [
  {
    id: "compra-mercancia",
    texto: "La empresa compra mercancía para volver a venderla.",
    respuesta: "compras",
    subtema: "Compras",
    porque: "Va a Compras. Ahí se anota la mercancía que se compra para volver a venderla.",
    tipico: { opcion: "inventario", texto: "En el periódico, la compra de mercancía no va a Inventario de mercancías. Va a Compras." },
    pie: "Basado en el libro, pp. 210 y 212",
  },
  {
    id: "compra-maquina",
    texto: "La empresa compra una máquina para su bodega.",
    respuesta: "otra",
    subtema: "Otra cuenta",
    porque: "Una máquina no se compra para volver a venderla. El libro dice que en Compras no van las maquinarias.",
    tipico: null,
    pie: "Basado en el libro, p. 210",
  },
  {
    id: "compra-computo",
    texto: "La empresa compra equipos de cómputo para su oficina.",
    respuesta: "otra",
    subtema: "Otra cuenta",
    porque: "Los equipos de la oficina no son mercancía para vender. El libro los deja fuera de Compras.",
    tipico: null,
    pie: "Basado en el libro, p. 210",
  },
  {
    id: "venta",
    texto: "La empresa le vende mercancía a un cliente.",
    respuesta: "ingresos",
    subtema: "Ingresos por ventas",
    porque: "La venta se anota en el haber de Ingresos por ventas.",
    tipico: null,
    pie: "Basado en el libro, p. 212",
  },
  {
    id: "conteo-al-cierre",
    /* Capa de los opcionales: atado al resultado del conteo. */
    texto: "Al cierre, la empresa anota el valor de lo que encontró en el conteo físico.",
    respuesta: "inventario",
    subtema: "Inventario al cierre",
    porque: "Con el conteo físico se pone al día Inventario de mercancías, al cierre.",
    tipico: { opcion: "compras", texto: "Compras recoge lo que se compró en el periodo. El valor de lo que quedó, según el conteo, va a Inventario de mercancías." },
    pie: "Basado en el libro, pp. 207-210",
  },
  {
    id: "costo-al-vender",
    /* Capa de los opcionales: escrito como un suceso. La respuesta y el porqué no cambian. */
    texto: "Sale mercancía de la bodega con una venta, y se quiere anotar lo que costó.",
    respuesta: "no-se-anota",
    subtema: "Costo al vender",
    porque: "En el periódico, al vender solo se anota el valor de la venta. El costo de lo que salió se halla al cierre.",
    tipico: { opcion: "inventario", texto: "En el periódico, Inventario de mercancías no se mueve con cada venta. Solo se pone al día al cierre." },
    pie: "Basado en el libro, pp. 209 y 212",
  },
];

/* Lo que lee un lector de pantalla al cerrar: cuántos al primer toque. */
export const resumenH1 = (bien, cuantos) => `${bien} de ${cuantos} al primer toque.`;
