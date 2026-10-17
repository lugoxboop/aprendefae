import { DEBE, HABER } from "./contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · H6 DE HACER — «La devolución en dos libros» (Célula C).
 *
 * Fuente: la v1 de Near y su corrección 5, las dos con PASA de Mello (tanda
 * corregida). Manda la más nueva:
 *   · los aciertos de los ítems 4 y 6 ya no dicen el lado (esos dos ítems
 *     se quitaron en el lote 3);
 *   · cada línea de los dos asientos trae su texto literal para cuando se
 *     ubica mal (la v1 solo daba el primero y un rango);
 *   · las sumas (986.000) aparecen después de «Comprobar».
 * Copias en orquestador/conocimiento/paquetes/t7-1-h6-v1.md y
 * t7-1-h6-cambios.md; una prueba compara cada texto contra ellas.
 *
 * Hacer Difícil, evaluativa, 50 FP: el motor escala los FP con los aciertos
 * (11 posibles: tres preguntas y las ocho líneas), con piso del 50 %.
 * Migración 0096, que corre Mateo (no guarda aciertos: no cambia).
 *
 * Un solo intento por unidad (patrón v3.2), sin arrastre: las cifras son
 * fijas. Los ítems van en el orden de la tabla; las opciones de cada pregunta
 * y las líneas de cada asiento, barajadas en cada intento.
 *
 * LOTE 3 («Arma la línea», paquete de Near lote3-distractores-v1.md): en
 * cada línea de los dos libros se elige la cuenta (la correcta y sus
 * `distractores` de Near, { cuenta, retro }) y el lado; el ítem 3 (cuánto
 * baja la deuda) va con casilla de cifra (tipo "cifra"). Los ítems 4 y 6 de
 * la v1 («¿a qué cuenta va la devolución de $850.000?», en cada libro) se
 * quitaron por decisión de L: la mesa ya pide esa cuenta. De 13 aciertos a 11.
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
  /* Lote O: el objetivo, de Near (paquetes/lote-o-objetivos.md). */
  objetivo: "Registrar una devolución en el libro del comprador y en el del vendedor.",
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

/* La pregunta de los dos asientos: la v1 la da en el ítem 5 y el 7 la repite (hoy, ítems 4 y 5). */
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
    id: "baja-deuda", tipo: "cifra", subtema: "IVA y retención proporcionales",
    pregunta: "¿Cuánto baja lo que La Garza le debe a El Nogal?",
    correcta: C.baja,
    acierto: "Así es: $850.000 + $136.000 − $29.750 = $956.250.",
    distractores: [
      { valor: C.devolucion + C.ivaDev + C.retDev, retro: "La retención se resta, igual que en la compra." },
      { valor: C.devolucion + C.ivaDev, retro: "Falta restar la retención de $29.750." },
    ],
  },
  {
    id: "libro-garza", tipo: "asiento", subtema: "Libro del comprador", encabezado: "Libro de La Garza",
    pregunta: TOCA,
    lineas: [
      { id: "cxp", cuenta: "Cuentas por pagar – proveedores", valor: C.baja, lado: DEBE, retro: "La devolución baja lo que La Garza le debe al proveedor. Un pasivo que disminuye va al debe.", distractores: [{ cuenta: "Cuentas por cobrar – clientes", retro: "Esa cuenta es lo que a la empresa le deben sus clientes. La Garza es la que compró." }, { cuenta: "Caja o Bancos", retro: "La compra fue a crédito y nadie devuelve dinero. Lo que cambia es una deuda." }] },
      { id: "retencion", cuenta: "Retención en la fuente por pagar", valor: C.retDev, lado: DEBE, retro: "En la compra, la retención fue al haber. La devolución reversa esa línea, así que ahora va al debe.", distractores: [{ cuenta: "Anticipo fiscal", retro: "Anticipo fiscal es del libro de quien vende. La Garza compró: ella fue la que descontó la retención." }, { cuenta: "IVA por pagar", retro: "Este valor sale al 3,5 % de lo devuelto, no al 16 %. No es el IVA." }] },
      { id: "iva", cuenta: "IVA por pagar", valor: C.ivaDev, lado: HABER, retro: "En la compra, el IVA fue al debe. La devolución lo reversa: ahora va al haber.", distractores: [{ cuenta: "Retención en la fuente por pagar", retro: "Este valor sale al 16 % de lo devuelto. La retención sale al 3,5 %." }, { cuenta: "Anticipo fiscal", retro: "Anticipo fiscal es del libro de quien vende, y va con la retención, no con este impuesto." }] },
      { id: "devoluciones", cuenta: "Devoluciones de compras", valor: C.devolucion, lado: HABER, retro: "En la compra, Compras fue al debe. La devolución reversa ese lado, pero en su propia cuenta: Devoluciones de compras, al haber.", distractores: [{ cuenta: "Compras", retro: "El libro no resta la devolución directo de Compras. La anota aparte, para saber cuánto se devolvió." }, { cuenta: "Devoluciones de ventas", retro: "Esa cuenta es del libro de quien vendió. La Garza es la que compró." }] },
    ],
  },
  {
    id: "libro-nogal", tipo: "asiento", subtema: "Libro del vendedor", encabezado: "Libro de El Nogal",
    pregunta: TOCA,
    lineas: [
      { id: "devoluciones", cuenta: "Devoluciones de ventas", valor: C.devolucion, lado: DEBE, retro: "En la venta, Ingresos por ventas fue al haber. La devolución reversa ese lado, pero en su propia cuenta: Devoluciones de ventas, al debe.", distractores: [{ cuenta: "Ingresos por ventas", retro: "El libro no resta la devolución directo de la venta. La anota aparte, para saber cuánto se devolvió." }, { cuenta: "Devoluciones de compras", retro: "Esa cuenta es del libro de quien compró. El Nogal es el que vendió." }] },
      { id: "iva", cuenta: "IVA por pagar", valor: C.ivaDev, lado: DEBE, retro: "En la venta, el IVA fue al haber. La devolución lo reversa: ahora va al debe.", distractores: [{ cuenta: "Anticipo fiscal", retro: "Anticipo fiscal va con la retención, que sale al 3,5 %. Este valor sale al 16 % de lo devuelto." }, { cuenta: "Retención en la fuente por pagar", retro: "Esa cuenta es del libro de quien compra. Y este valor sale al 16 %, no al 3,5 %." }] },
      { id: "anticipo", cuenta: "Anticipo fiscal", valor: C.retDev, lado: HABER, retro: "En la venta, el anticipo fue al debe. La devolución lo reversa, así que ahora va al haber.", distractores: [{ cuenta: "Retención en la fuente por pagar", retro: "Esa cuenta es del libro de quien compra. A El Nogal le descontaron la retención: no la descontó él." }, { cuenta: "IVA por pagar", retro: "Este valor sale al 3,5 % de lo devuelto, no al 16 %. No es el IVA." }] },
      { id: "cxc", cuenta: "Cuentas por cobrar – clientes", valor: C.baja, lado: HABER, retro: "La devolución baja lo que el cliente le debe a El Nogal. Un activo que disminuye va al haber.", distractores: [{ cuenta: "Cuentas por pagar – proveedores", retro: "Esa cuenta es lo que la empresa debe. El Nogal no le debe nada a nadie en este hecho." }, { cuenta: "Caja o Bancos", retro: "La venta fue a crédito y nadie devuelve dinero. Lo que cambia es una deuda." }] },
    ],
  },
];

export const BOTON_H6 = { siguiente: "Siguiente ítem", verResumen: "Ver mi resumen" };

export const resumenH6 = (bien, total) => `${bien} de ${total} al primer toque.`;
