import { DEBE, HABER } from "./contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · H2 DE HACER — «Arma los dos asientos» (Célula C).
 *
 * Fuente: la v1 de Near, con PASA de Mello. Copia en
 * orquestador/conocimiento/paquetes/t7-2-h2-v1.md; una prueba compara cada
 * texto de aquí contra ella, letra por letra.
 *
 * EL NOMBRE: la v1 la llama «La venta en dos asientos», igual que A2. L
 * decidió (orden final de T7-2) que esta se llame «Arma los dos asientos»,
 * para que el índice no muestre dos actividades con el mismo nombre. El id,
 * t7-2-dos-asientos, no cambia.
 *
 * Hacer Medio, evaluativa, 25 FP: el motor compartido escala los FP con los
 * aciertos, con piso del 50 %. Migración 0099, que corre Mateo.
 *
 * OCHO ACIERTOS POSIBLES: los dos cálculos (ítems 1 y 3) y las seis líneas de
 * los dos asientos (ítems 2 y 4). Un solo intento por unidad, sin arrastre:
 * las cifras son fijas. En un asiento se elige el lado de cada línea y
 * «Comprobar» las califica una vez; las sumas aparecen después (patrón v3.2).
 * Los ítems van en el orden de la tabla; las opciones de cada cálculo y las
 * líneas de cada asiento, barajadas en cada intento.
 *
 * LAS CIFRAS no se escriben a mano: salen de la venta, el costo y las
 * tarifas (calcularH2). Una prueba las recalcula y las compara con las de
 * Near. Son construidas (registro 5c); ninguna es del periódico (regla 3).
 *
 * Lo que la v1 no trae y se toma de la convención de H1 a H7 de T7-1: los
 * botones «Siguiente ítem» y «Ver mi resumen», «Comprobar», «Debe» y «Haber»,
 * y los rótulos de la ficha.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const H2_ID = "t7-2-dos-asientos";

export const VENTA_H2 = 5_600_000;
export const COSTO_H2 = 3_780_000;
export const TARIFAS_H2 = { iva: 16, retencion: 3.5 };

export function calcularH2(venta = VENTA_H2, costo = COSTO_H2, t = TARIFAS_H2) {
  const iva = (venta * t.iva) / 100;
  const retencion = (venta * t.retencion) / 100;
  return { venta, costo, iva, retencion, cliente: venta + iva - retencion, sumas: venta + iva };
}

export const CIFRAS_H2 = calcularH2();
const C = CIFRAS_H2;

export const H2 = {
  id: H2_ID,
  /* Decisión de L: no el nombre de la v1, que es el de A2. */
  nombre: "Arma los dos asientos",
  consigna: "Registra la venta en sus dos asientos. Tienes un solo intento por pregunta.",
  enunciado: [
    "El 20 de agosto, El Arrayán le vende mercancía a crédito a un cliente. La vende por $5.600.000, más el IVA, y le había costado $3.780.000. Usa el sistema de inventario permanente.",
    "En este ejercicio, el IVA es del 16 % y la retención del 3,5 %. Las dos se calculan sobre el valor de la mercancía.",
    /* «Después, la frase de tarifas literal»: la de A2. */
    "Las tarifas de este ejercicio son datos del libro. No las tomes como las tarifas de hoy.",
  ],
  pie: "Basado en el libro, pp. 210, 212 y 235-237",
};

/* La ficha de la v1, con los rótulos de la convención. */
export const FICHA_H2 = [
  ["Quién recibe", "Un cliente"],
  ["Quién entrega", "El Arrayán"],
  ["Monto", "$5.600.000 la venta, $3.780.000 el costo"],
  ["Tipo", "A crédito"],
  ["Clase de hecho", "Venta de mercancía"],
];

export const BOTON_H2 = { siguiente: "Siguiente ítem", verResumen: "Ver mi resumen" };

export const SUBTEMAS_H2 = ["Total de la factura", "Primer asiento", "Valor del costo", "Asiento del costo"];

export const ITEMS_H2 = [
  {
    id: "debe-cliente", tipo: "eleccion", subtema: "Total de la factura",
    pregunta: "¿Cuánto le queda debiendo el cliente a El Arrayán?",
    correcta: C.cliente,
    acierto: "Así es: $5.600.000 + $896.000 − $196.000 = $6.300.000.",
    distractores: [
      { valor: C.venta + C.iva + C.retencion, retro: "La retención se resta, porque el cliente la descuenta del pago." },
      { valor: C.venta + C.iva, retro: "Falta restar la retención. El IVA es $896.000 y la retención, $196.000." },
    ],
  },
  {
    id: "primer-asiento", tipo: "asiento", subtema: "Primer asiento",
    pregunta: "Ubica cada línea del primer asiento: Debe o Haber.",
    lineas: [
      { id: "clientes", cuenta: "Cuentas por cobrar – clientes", valor: C.cliente, lado: DEBE, retro: "El cliente le queda debiendo a El Arrayán. Es un activo que aumenta: va al debe." },
      { id: "anticipo", cuenta: "Anticipo fiscal", valor: C.retencion, lado: DEBE, retro: "El cliente le descontó la retención. Para El Arrayán es un impuesto pagado por adelantado: va al debe de Anticipo fiscal." },
      { id: "iva", cuenta: "IVA por pagar", valor: C.iva, lado: HABER, retro: "El Arrayán cobró el IVA y se lo debe al Estado: va al haber de IVA por pagar." },
      { id: "ingresos", cuenta: "Ingresos por ventas", valor: C.venta, lado: HABER, retro: "La venta es un ingreso que aumenta: va al haber de Ingresos por ventas." },
    ],
  },
  {
    id: "valor-del-costo", tipo: "eleccion", subtema: "Valor del costo",
    pregunta: "¿Por qué valor va el segundo asiento?",
    correcta: C.costo,
    acierto: "Así es. El segundo asiento va por el costo de lo que salió: $3.780.000.",
    distractores: [
      { valor: C.venta, retro: "Ese es el precio de venta. El segundo asiento va por lo que costó la mercancía." },
      { valor: C.cliente, retro: "Ese es lo que debe el cliente. El segundo asiento va por lo que costó la mercancía." },
    ],
  },
  {
    id: "asiento-del-costo", tipo: "asiento", subtema: "Asiento del costo",
    pregunta: "Ubica cada línea del segundo asiento: Debe o Haber.",
    lineas: [
      { id: "costo", cuenta: "Costo de mercancía vendida", valor: C.costo, lado: DEBE, retro: "El costo de la mercancía vendida tiene saldo deudor: va al debe." },
      { id: "inventario", cuenta: "Inventario de mercancías", valor: C.costo, lado: HABER, retro: "Sale mercancía de la bodega, así que el activo disminuye: va al haber." },
    ],
  },
];

/* El resumen del cierre, con la frase de H1: cuántos de los ocho al primer toque. */
export const resumenH2 = (bien, total) => `${bien} de ${total} al primer toque.`;
