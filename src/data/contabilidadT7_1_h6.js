import { DEBE, HABER } from "./contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · H6 DE HACER — «La devolución en dos libros» (Célula C).
 *
 * Fuente: la v1 de Near y su corrección 5, las dos con PASA de Mello (tanda
 * corregida). Manda la más nueva:
 *   · los aciertos de los ítems 4 y 6 ya no dicen el lado;
 *   · cada línea de los dos asientos trae su texto literal para cuando se
 *     ubica mal (la v1 solo daba el primero y un rango);
 *   · las sumas (986.000) aparecen después de «Comprobar».
 * Copias en orquestador/conocimiento/paquetes/t7-1-h6-v1.md y
 * t7-1-h6-cambios.md; una prueba compara cada texto contra ellas.
 *
 * Hacer Difícil, evaluativa, 50 FP: el motor escala los FP con los aciertos
 * (13 posibles: cinco preguntas y las ocho líneas), con piso del 50 %.
 * Migración 0096, que corre Mateo.
 *
 * Un solo intento por unidad (patrón v3.2), sin arrastre: las cifras son
 * fijas. Los ítems van en el orden de la tabla; las opciones de cada pregunta
 * y las líneas de cada asiento, barajadas en cada intento.
 *
 * LAS CIFRAS no se escriben a mano: salen de la compra, la devolución y las
 * tarifas (calcularH6). Una prueba las recalcula y las compara con las de
 * Near.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const H6_ID = "t7-1-devolucion-dos-libros";

export const COMPRA_H6 = 6_800_000;
export const DEVOLUCION_H6 = 850_000;
export const TARIFAS_H6 = { iva: 16, retencion: 3.5 };

export function calcularH6(compra = COMPRA_H6, devolucion = DEVOLUCION_H6, t = TARIFAS_H6) {
  const iva = (compra * t.iva) / 100;
  const retencion = (compra * t.retencion) / 100;
  const ivaDev = (devolucion * t.iva) / 100;
  const retDev = (devolucion * t.retencion) / 100;
  return {
    compra, iva, retencion, total: compra + iva - retencion,
    devolucion, ivaDev, retDev, baja: devolucion + ivaDev - retDev,
  };
}

export const CIFRAS_H6 = calcularH6();
const C = CIFRAS_H6;

export const H6 = {
  id: H6_ID,
  nombre: "La devolución en dos libros",
  /* La v1: «Etiqueta». */
  etiqueta: "La devolución en dos libros · Inventarios I",
  consigna: "La Garza y El Nogal usan el sistema de inventario periódico. Registra la devolución en los libros de las dos. Tienes un solo intento por pregunta.",
  enunciado: [
    "El 2 de septiembre, La Garza le compra a crédito a El Nogal mercancía por $6.800.000, más el IVA.",
    "El 6 de septiembre, La Garza le devuelve mercancía por $850.000, porque llegó dañada. El Nogal se lo rebaja de lo que La Garza le debe.",
    "En este ejercicio, el IVA es del 16 % y la retención del 3,5 %. Las dos se calculan sobre el valor de la mercancía.",
    /* «Va con la frase de tarifas literal»: la de AP2, A5 y A6. */
    "Las tarifas de este ejercicio son datos del libro. No las tomes como las tarifas de hoy.",
  ],
  pie: "Basado en el libro, pp. 210, 212 y 230-232",
};

/* El asiento de la compra del 2 de septiembre, ya resuelto en los dos libros. */
export const COMPRA_RESUELTA_H6 = {
  comprador: [
    { cuenta: "Compras", lado: DEBE, valor: C.compra },
    { cuenta: "IVA por pagar", lado: DEBE, valor: C.iva },
    { cuenta: "Retención en la fuente por pagar", lado: HABER, valor: C.retencion },
    { cuenta: "Cuentas por pagar – proveedores", lado: HABER, valor: C.total },
  ],
  vendedor: [
    { cuenta: "Cuentas por cobrar – clientes", lado: DEBE, valor: C.total },
    { cuenta: "Anticipo fiscal", lado: DEBE, valor: C.retencion },
    { cuenta: "IVA por pagar", lado: HABER, valor: C.iva },
    { cuenta: "Ingresos por ventas", lado: HABER, valor: C.compra },
  ],
};

export const FICHA_H6 = [
  ["Quién recibe", "El Nogal recibe la mercancía devuelta"],
  ["Quién entrega", "La Garza"],
  ["Monto", "$850.000"],
  ["Tipo", "Se rebaja de la deuda de una compra a crédito"],
  ["Clase de hecho", "Devolución de mercancía dañada"],
];

export const CUENTAS_H6 = [
  { valor: "devoluciones-compras", texto: "Devoluciones de compras" },
  { valor: "devoluciones-ventas", texto: "Devoluciones de ventas" },
  { valor: "compras", texto: "Compras" },
  { valor: "inventario", texto: "Inventario de mercancías" },
  { valor: "ingresos", texto: "Ingresos por ventas" },
];

/* La pregunta de los dos asientos: la v1 la da en el ítem 5 y el 7 la repite. */
const TOCA = "Toca Debe o Haber en cada línea.";

export const ITEMS_H6 = [
  {
    id: "iva-reversa", tipo: "eleccion", subtema: "IVA y retención proporcionales",
    pregunta: "¿Cuánto IVA se reversa con la devolución?",
    correcta: C.ivaDev,
    acierto: "Así es: el 16 % de $850.000 es $136.000. Solo se reversa la parte de lo devuelto.",
    distractores: [
      { valor: C.iva, retro: "Ese es el IVA de toda la compra. Con la devolución solo se reversa la parte de lo devuelto." },
      { valor: 0, retro: "El IVA sí se reversa: el libro dice que se devuelve la parte que corresponde a la devolución." },
    ],
  },
  {
    id: "retencion-reversa", tipo: "eleccion", subtema: "IVA y retención proporcionales",
    pregunta: "¿Cuánta retención se reversa con la devolución?",
    correcta: C.retDev,
    acierto: "Así es: el 3,5 % de $850.000 es $29.750.",
    distractores: [
      { valor: C.retencion, retro: "Esa es la retención de toda la compra. Solo se reversa la parte de lo devuelto." },
      { valor: 0, retro: "La retención también se reversa, en la misma proporción que lo devuelto." },
    ],
  },
  {
    id: "baja-deuda", tipo: "eleccion", subtema: "IVA y retención proporcionales",
    pregunta: "¿Cuánto baja lo que La Garza le debe a El Nogal?",
    correcta: C.baja,
    acierto: "Así es: $850.000 + $136.000 − $29.750 = $956.250.",
    distractores: [
      { valor: C.devolucion + C.ivaDev + C.retDev, retro: "La retención se resta, igual que en la compra." },
      { valor: C.devolucion + C.ivaDev, retro: "Falta restar la retención de $29.750." },
    ],
  },
  {
    id: "cuenta-comprador", tipo: "eleccion", subtema: "Cuenta de devoluciones",
    pregunta: "En el libro de La Garza, ¿a qué cuenta va la devolución de $850.000?",
    correcta: "devoluciones-compras",
    /* Corrección 5: sin el lado. */
    acierto: "Así es. El comprador usa su propia cuenta: Devoluciones de compras.",
    distractores: [
      { valor: "compras", retro: "La devolución no se anota en Compras. El comprador usa su propia cuenta: Devoluciones de compras." },
      { valor: "inventario", retro: "En el periódico, la devolución de compras no va a Inventario de mercancías. Va a Devoluciones de compras." },
    ],
  },
  {
    id: "libro-garza", tipo: "asiento", subtema: "Libro del comprador", encabezado: "Libro de La Garza",
    pregunta: TOCA,
    lineas: [
      { id: "cxp", cuenta: "Cuentas por pagar – proveedores", valor: C.baja, lado: DEBE, retro: "La devolución baja lo que La Garza le debe al proveedor. Un pasivo que disminuye va al debe." },
      { id: "retencion", cuenta: "Retención en la fuente por pagar", valor: C.retDev, lado: DEBE, retro: "En la compra, la retención fue al haber. La devolución reversa esa línea, así que ahora va al debe." },
      { id: "iva", cuenta: "IVA por pagar", valor: C.ivaDev, lado: HABER, retro: "En la compra, el IVA fue al debe. La devolución lo reversa: ahora va al haber." },
      { id: "devoluciones", cuenta: "Devoluciones de compras", valor: C.devolucion, lado: HABER, retro: "En la compra, Compras fue al debe. La devolución reversa ese lado, pero en su propia cuenta: Devoluciones de compras, al haber." },
    ],
  },
  {
    id: "cuenta-vendedor", tipo: "eleccion", subtema: "Cuenta de devoluciones",
    pregunta: "En el libro de El Nogal, ¿a qué cuenta va la devolución de $850.000?",
    correcta: "devoluciones-ventas",
    /* Corrección 5: sin el lado. */
    acierto: "Así es. El vendedor usa su propia cuenta: Devoluciones de ventas.",
    distractores: [
      { valor: "ingresos", retro: "La devolución no se anota en Ingresos por ventas. El vendedor usa su propia cuenta: Devoluciones de ventas." },
      { valor: "devoluciones-compras", retro: "Esa es la cuenta del comprador. El vendedor usa Devoluciones de ventas." },
    ],
  },
  {
    id: "libro-nogal", tipo: "asiento", subtema: "Libro del vendedor", encabezado: "Libro de El Nogal",
    pregunta: TOCA,
    lineas: [
      { id: "devoluciones", cuenta: "Devoluciones de ventas", valor: C.devolucion, lado: DEBE, retro: "En la venta, Ingresos por ventas fue al haber. La devolución reversa ese lado, pero en su propia cuenta: Devoluciones de ventas, al debe." },
      { id: "iva", cuenta: "IVA por pagar", valor: C.ivaDev, lado: DEBE, retro: "En la venta, el IVA fue al haber. La devolución lo reversa: ahora va al debe." },
      { id: "anticipo", cuenta: "Anticipo fiscal", valor: C.retDev, lado: HABER, retro: "En la venta, el anticipo fue al debe. La devolución lo reversa, así que ahora va al haber." },
      { id: "cxc", cuenta: "Cuentas por cobrar – clientes", valor: C.baja, lado: HABER, retro: "La devolución baja lo que el cliente le debe a El Nogal. Un activo que disminuye va al haber." },
    ],
  },
];

export const BOTON_H6 = { siguiente: "Siguiente ítem", verResumen: "Ver mi resumen" };

export const resumenH6 = (bien, total) => `${bien} de ${total} al primer toque.`;
