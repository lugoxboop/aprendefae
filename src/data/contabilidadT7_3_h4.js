import { DEBE, HABER } from "./contabilidad.js";
import { ROTULOS_PATRON } from "./contabilidadT7_3.js";
import { ROTULOS_A3 } from "./contabilidadT7_3_a3.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · H4 DE HACER — «Pagó a tiempo» (Célula C).
 *
 * Fuente: la v1 de Near, con PASA de Mello. Copia en
 * orquestador/conocimiento/paquetes/t7-3-h4-v1.md; una prueba compara cada
 * texto de aquí contra ella, letra por letra.
 *
 * Hacer Difícil, evaluativa, 50 FP: el motor compartido escala los FP con
 * los aciertos, con piso del 50 %. Migración 0106, que corre Mateo.
 *
 * ONCE ACIERTOS POSIBLES: los ítems 1 a 4, las tres líneas del pago en el
 * libro de Totumo (ítem 5), las tres en el de Bambú (ítem 6) y el lado del
 * cierre (ítem 7). Un solo intento por unidad, sin arrastre. En cada asiento,
 * «Comprobar» califica las líneas una vez; las sumas (2.199.375) aparecen
 * después.
 *
 * LAS CIFRAS no se escriben a mano: salen de la lista, el 8 %, el 4 % y las
 * tarifas (calcularH4). Una prueba las recalcula y las compara con el
 * registro 5c de Near. Ninguna es del libro (H-3 es de A3 y A4) ni de X1-X4.
 *
 * Lo que la v1 no trae y se toma de los Hacer de T7-3: los botones, los
 * rótulos de la ficha (y «Sistema», de la v1), el orden fijo de «Debe» y
 * «Haber» en el ítem 7, y las opciones barajadas en los demás.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const H4_ID = "t7-3-pago-a-tiempo";

export const LISTA_H4 = 2_125_000;
export const COMERCIAL_H4 = 8;
export const CONDICIONADO_H4 = 4;
export const TARIFAS_H4 = { iva: 16, retencion: 3.5 };

export function calcularH4(t = TARIFAS_H4) {
  const comercial = (LISTA_H4 * COMERCIAL_H4) / 100;
  const factura = LISTA_H4 - comercial;
  const iva = (factura * t.iva) / 100;
  const retencion = (factura * t.retencion) / 100;
  const deuda = factura + iva - retencion;
  const condicionado = (factura * CONDICIONADO_H4) / 100;
  return { lista: LISTA_H4, comercial, factura, iva, retencion, deuda, sumasVenta: factura + iva, condicionado, pago: deuda - condicionado };
}

export const CIFRAS_H4 = calcularH4();
const C = CIFRAS_H4;
/* El 10 % del 10/10: la confusión que ataca la pieza (Near). */
const DIEZ = (C.factura * 10) / 100;

export const H4 = {
  id: H4_ID,
  /* Lote O: el objetivo, de Near (paquetes/lote-o-objetivos.md). */
  objetivo: "Registrar en los dos libros el descuento condicionado de un cliente que paga a tiempo.",
  nombre: "Pagó a tiempo",
  consigna: "Registra el descuento en los dos libros. Tienes un solo intento por pregunta.",
  enunciado: [
    "El 3 de octubre, Totumo le vende mercancía a crédito a Bambú. El precio de lista es de $2.125.000, más el IVA. Las condiciones son 8 %, 10/10, 4/20, n/30.",
    "Bambú paga la factura el 23 de octubre. Las dos empresas usan el sistema de inventario periódico.",
    /* «Línea de tarifas (…Las dos se calculan sobre lo facturado.) y la frase fija»: las de A3 de T7-3. */
    "En este ejercicio, el IVA es del 16 % y la retención del 3,5 %. Las dos se calculan sobre lo facturado.",
    "Las tarifas de este ejercicio son datos del libro. No las tomes como las tarifas de hoy.",
  ],
  pie: "Basado en el libro, pp. 251-254",
};

export const FICHA_H4 = [
  ["Quién entrega", "Totumo"],
  ["Quién recibe", "Bambú"],
  ["Monto", "$2.125.000 de lista; 8 %, 10/10, 4/20, n/30"],
  ["Tipo", "A crédito, pagada el 23 de octubre"],
  ["Clase de hecho", "Venta y compra de mercancía"],
  ["Sistema", "Periódico"],
];

/*
 * Patrón T7-3 (Watari), cada figura DESPUÉS de su ítem, como en sus muestras:
 *   ítem 1  la factura de Totumo (hasta el ítem 2)
 *   ítem 2  la franja de plazos con el pago del 23 de octubre, día 20 (hasta el 3)
 *   ítem 3  el descuento condicionado
 *   ítem 4  el pago
 * Y en el ítem 6, el asiento de Totumo ya resuelto queda arriba, en lectura,
 * con el de Bambú debajo (patrón 06 b). Rótulos y títulos de Watari, revisados por Near. «Libro de Totumo», el título del asiento de arriba, es
 * convención: sale de la pregunta del ítem 5.
 */
export const FIGURAS_H4 = [
  {
    tipo: "renglones", desde: 1, hasta: 2, titulo: ROTULOS_PATRON.factura("Totumo"),
    filas: [
      { rot: ROTULOS_PATRON.precioLista, v: C.lista },
      { op: "−", rot: ROTULOS_PATRON.descuentoComercial(COMERCIAL_H4), v: C.comercial },
      { op: "=", rot: ROTULOS_PATRON.valorFacturar, v: C.factura, res: true },
    ],
  },
  {
    tipo: "plazos", desde: 2, hasta: 3, venta: "3 oct",
    condiciones: [{ cond: `${COMERCIAL_H4} %` }, { cond: "10/10", dia: 10, lleva: "10 %" }, { cond: "4/20", dia: 20, lleva: "4 %" }, { cond: "n/30", dia: 30, lleva: ROTULOS_A3.sinDescuento }],
    pago: { dia: 20, fecha: "23 oct" },
  },
  {
    tipo: "renglones", desde: 3, titulo: ROTULOS_A3.descuentoCondicionadoTit,
    filas: [
      { rot: ROTULOS_A3.facturado, v: C.factura },
      { op: "×", rot: ROTULOS_A3.condicion("4/20"), v: `${CONDICIONADO_H4} %` },
      { op: "=", rot: ROTULOS_A3.descuentoCondicionado, v: C.condicionado, res: true },
    ],
  },
  {
    tipo: "renglones", desde: 4, titulo: ROTULOS_A3.pagoDel("23 de octubre"),
    filas: [
      { rot: ROTULOS_A3.loQueDebia("Bambú"), v: C.deuda },
      { op: "−", rot: ROTULOS_A3.descuentoCondicionado, v: C.condicionado },
      { op: "=", rot: ROTULOS_A3.paga, v: C.pago, res: true },
    ],
  },
];
export const ARRIBA_H4 = { item: "libro-de-bambu", de: "libro-de-totumo", titulo: "Libro de Totumo" };

export const BOTON_H4 = { siguiente: "Siguiente ítem", verResumen: "Ver mi resumen" };

const DCC = "Descuento comercial condicionado";

/*
 * LOTE 3 DE LA REVISIÓN (L, 15 de octubre de 2026): «Arma la línea». Los
 * ítems 1, 3 y 4, cuyo objetivo es calcular, van con casilla de cifra (tipo
 * "cifra"): si la cifra escrita es la de un distractor, sale su
 * retroalimentación. Los ítems 2 y 7 se quedan en elección. En cada asiento,
 * cada línea trae su banco de cuentas: la correcta y sus `distractores`, con
 * su retroalimentación, de Near (orquestador/conocimiento/paquetes/
 * lote3-distractores-v1.md).
 */
export const ITEMS_H4 = [
  {
    id: "lo-facturado", tipo: "cifra", pesos: true,
    pregunta: "¿Cuánto se factura por la mercancía?",
    correcta: C.factura,
    acierto: "Así es. El 8 % es comercial y se resta en la factura: $2.125.000 − $170.000 = $1.955.000.",
    distractores: [
      { valor: C.lista, retro: "Ese es el precio de lista. El 8 % es un descuento comercial: se resta antes de facturar." },
      { valor: (C.lista * (100 - COMERCIAL_H4 - CONDICIONADO_H4)) / 100, retro: "Restaste también el 4 %. Ese descuento es condicionado: no va en la factura, y solo llega si Bambú cumple." },
    ],
  },
  {
    id: "que-le-toca", tipo: "eleccion",
    pregunta: "Bambú pagó el 23 de octubre. ¿Qué descuento condicionado le toca?",
    correcta: "4 %",
    acierto: "Así es. Del 3 al 23 de octubre pasaron veinte días. Con la condición 4/20, le toca el 4 %.",
    distractores: [
      { valor: "10 %", retro: "Del 3 al 23 de octubre pasaron veinte días, no diez. Con la condición 4/20, le toca el 4 %." },
      { valor: "Ninguno", retro: "Pagó a los veinte días, antes de los treinta. Con la condición 4/20, le toca el 4 %." },
    ],
  },
  {
    id: "el-descuento", tipo: "cifra", pesos: true,
    pregunta: "¿Cuánto es el descuento condicionado?",
    correcta: C.condicionado,
    acierto: "Así es. El 4 % va sobre lo facturado por la mercancía, sin el IVA: $1.955.000 × 4 % = $78.200.",
    distractores: [
      { valor: (C.deuda * CONDICIONADO_H4) / 100, retro: "Ese valor sale de la deuda con el IVA. El descuento no puede tocar el IVA: se calcula sobre $1.955.000." },
      { valor: DIEZ, retro: "Ese es el 10 %. Bambú pagó a los veinte días, así que le toca el 4 %." },
    ],
  },
  {
    id: "el-pago", tipo: "cifra", pesos: true,
    pregunta: "¿Cuánto le paga Bambú a Totumo el 23 de octubre?",
    correcta: C.pago,
    acierto: "Así es. Bambú debía $2.199.375. Le restan $78.200 de descuento, así que paga $2.121.175.",
    distractores: [
      { valor: C.deuda, retro: "Bambú paga menos, porque cumplió la condición. Réstale a la deuda el descuento de $78.200." },
      { valor: C.deuda - DIEZ, retro: "Ese pago usa el 10 %. Bambú pagó a los veinte días, así que el descuento es del 4 %." },
    ],
  },
  {
    id: "libro-de-totumo", tipo: "asiento",
    pregunta: "Ubica cada línea del pago en el libro de Totumo: Debe o Haber.",
    lineas: [
      { id: "caja", cuenta: "Caja o Bancos", valor: C.pago, lado: DEBE, retro: "Totumo recibe el dinero en Caja o Bancos. Es un activo que aumenta: va al debe.", distractores: [{ cuenta: "Cuentas por cobrar – clientes", retro: "Bambú pagó, así que entra dinero. Lo que el cliente debe no sube con un pago." }, { cuenta: "Ingresos por ventas", retro: "La venta ya se anotó el 3 de octubre. Este hecho es el pago." }] },
      { id: "descuento", cuenta: DCC, valor: C.condicionado, lado: DEBE, retro: "Totumo da el descuento. Quien da el descuento lo anota en el debe de Descuento comercial condicionado.", distractores: [{ cuenta: "Ingresos por ventas", retro: "El libro no resta este descuento directo de la venta. Lo anota en una cuenta propia." }, { cuenta: "Gastos de administración y ventas", retro: "El libro tiene una cuenta propia para este descuento. No lo mezcla con los gastos del mes." }] },
      { id: "clientes", cuenta: "Cuentas por cobrar – clientes", valor: C.deuda, lado: HABER, retro: "Bambú ya no le debe nada a Totumo. La cuenta por cobrar sale completa: va al haber.", distractores: [{ cuenta: "Cuentas por pagar – proveedores", retro: "Esa cuenta es lo que la empresa debe. Totumo no queda debiendo nada con este pago." }, { cuenta: "Caja o Bancos", retro: "El dinero que entra va en otra línea, por $2.121.175. Esta línea va por $2.199.375." }] },
    ],
  },
  {
    id: "libro-de-bambu", tipo: "asiento",
    pregunta: "Ahora ubica cada línea del mismo pago en el libro de Bambú: Debe o Haber.",
    lineas: [
      { id: "proveedores", cuenta: "Cuentas por pagar – proveedores", valor: C.deuda, lado: DEBE, retro: "Bambú ya no le debe nada a Totumo. La deuda baja completa: Cuentas por pagar – proveedores va al debe.", distractores: [{ cuenta: "Cuentas por cobrar – clientes", retro: "Esa cuenta es del libro de Totumo, que vendió. Bambú es quien compró." }, { cuenta: "Compras", retro: "La compra ya se anotó el 3 de octubre. Este hecho es el pago." }] },
      { id: "descuento", cuenta: DCC, valor: C.condicionado, lado: HABER, retro: "Bambú recibe el descuento. Quien lo recibe lo anota en el haber de Descuento comercial condicionado.", distractores: [{ cuenta: "Compras", retro: "El libro no resta este descuento directo de Compras. Lo anota en una cuenta propia." }, { cuenta: "Devoluciones de compras", retro: "Bambú no le devolvió mercancía a nadie. Esto es una rebaja por pagar a tiempo." }] },
      { id: "caja", cuenta: "Caja o Bancos", valor: C.pago, lado: HABER, retro: "Sale dinero de Caja o Bancos. Es un activo que disminuye: va al haber.", distractores: [{ cuenta: "Cuentas por pagar – proveedores", retro: "Esta línea va por $2.121.175, lo que Bambú paga de verdad. La deuda baja por otro valor." }, { cuenta: "IVA por pagar", retro: "El IVA ya se anotó con la compra, y el descuento no lo toca. El pago no lo cambia." }] },
    ],
  },
  {
    id: "el-cierre", tipo: "eleccion", fijas: true,
    pregunta: "Al final del periodo, Bambú cierra Descuento comercial condicionado contra Ganancias y pérdidas. ¿A qué lado va la cuenta para cerrarla?",
    correcta: "Debe",
    acierto: "Así es. La cuenta tenía saldo en el haber, así que se cierra por el debe.",
    distractores: [{ valor: "Haber", retro: "En el libro de Bambú, la cuenta tenía saldo en el haber. Para dejarla en cero, va al lado contrario: al debe." }],
  },
];

/* El resumen del cierre, con la frase de los Hacer de la célula: cuántos de los once al primer toque. */
export const resumenH4 = (bien, total) => `${bien} de ${total} al primer toque.`;
