import { DEBE, HABER } from "./contabilidad.js";
import { ROTULOS_PATRON } from "./contabilidadT7_3.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · H1 DE HACER — «Descuento en la factura» (Célula C).
 *
 * Fuente: la v1 de Near, con PASA de Mello. Copia en
 * orquestador/conocimiento/paquetes/t7-3-h1-v1.md; una prueba compara cada
 * texto de aquí contra ella, letra por letra.
 *
 * Hacer Medio, evaluativa, 25 FP: el motor compartido escala los FP con los
 * aciertos, con piso del 50 %. Migración 0103, que corre Mateo.
 *
 * OCHO ACIERTOS POSIBLES: los cuatro cálculos (ítems 1 a 4) y las cuatro
 * líneas del asiento (ítem 5). Un solo intento por unidad, sin arrastre: las
 * cifras son fijas. En el asiento se elige el lado de cada línea y
 * «Comprobar» las califica una vez; las sumas (2.092.640, que también es un
 * distractor del ítem 3) aparecen solo después (patrón v3.2).
 *
 * LAS CIFRAS no se escriben a mano: salen del precio de lista, el 12 % y las
 * tarifas (calcularH1). Una prueba las recalcula y las compara con las de
 * Near. Son construidas (registro 5c); ninguna es del libro (las de H-1 son
 * de A1) ni de X1-X4. Sistema periódico, para que la venta lleve un solo
 * asiento.
 *
 * Lo que la v1 no trae y se toma de la convención de T7-2: los botones
 * «Siguiente ítem» y «Ver mi resumen», «Comprobar», «Debe» y «Haber», y los
 * rótulos de la ficha (los de A1 de T7-3, en el orden de Near).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const H1_ID = "t7-3-descuento-en-factura";

export const LISTA_H1 = 2_050_000;
export const DESCUENTO_H1 = 12;
export const TARIFAS_H1 = { iva: 16, retencion: 3.5 };

export function calcularH1(lista = LISTA_H1, pct = DESCUENTO_H1, t = TARIFAS_H1) {
  const descuento = (lista * pct) / 100;
  const factura = lista - descuento;
  const iva = (factura * t.iva) / 100;
  const retencion = (factura * t.retencion) / 100;
  return { lista, descuento, factura, iva, retencion, cliente: factura + iva - retencion, sumas: factura + iva };
}

export const CIFRAS_H1 = calcularH1();
const C = CIFRAS_H1;

export const H1 = {
  id: H1_ID,
  nombre: "Descuento en la factura",
  consigna: "Calcula la factura y arma el asiento de la venta. Tienes un solo intento por pregunta.",
  enunciado: [
    "El 9 de agosto, Guadua le vende mercancía a crédito a un cliente. El precio de lista es de $2.050.000, más el IVA, y le da un descuento comercial del 12 %. Usa el sistema de inventario periódico.",
    "En este ejercicio, el IVA es del 16 % y la retención del 3,5 %. Las dos se calculan sobre el valor a facturar.",
    /* «Después, la frase de tarifas literal»: la de A1 de T7-3. */
    "Las tarifas de este ejercicio son datos del libro. No las tomes como las tarifas de hoy.",
  ],
  pie: "Basado en el libro, pp. 248-249",
};

/* La ficha de la v1, en su orden, con los rótulos de A1 de T7-3. */
export const FICHA_H1 = [
  ["Quién entrega", "Guadua"],
  ["Quién recibe", "Un cliente"],
  ["Monto", "$2.050.000 de lista, con 12 % de descuento comercial"],
  ["Tipo", "A crédito"],
  ["Clase de hecho", "Venta de mercancía"],
];

/*
 * Patrón T7-3 (Watari): la cuenta de la factura en renglones, DESPUÉS del
 * ítem 1 (antes, el «−» daría la respuesta). Rótulos de Watari, revisados por Near.
 */
export const FIGURAS_H1 = [{
  tipo: "renglones", desde: 1,
  titulo: ROTULOS_PATRON.factura("Guadua"),
  filas: [
    { rot: ROTULOS_PATRON.precioLista, v: C.lista },
    { op: "−", rot: ROTULOS_PATRON.descuentoComercial(DESCUENTO_H1), v: C.descuento },
    { op: "=", rot: ROTULOS_PATRON.valorFacturar, v: C.factura, res: true },
  ],
}];

export const BOTON_H1 = { siguiente: "Siguiente ítem", verResumen: "Ver mi resumen" };

/*
 * LOTE 3 DE LA REVISIÓN (L, 15 de octubre de 2026): T7-3 · H1 es el Hacer de
 * muestra de «Arma la línea». Los ítems 1 a 3, cuyo objetivo es calcular, van
 * con casilla de cifra (tipo "cifra"): si la cifra escrita es la de un
 * distractor de Near, sale su retroalimentación. En el asiento, cada línea
 * trae su banco de cuentas: la correcta y sus `distractores`.
 * PENDIENTE_DE_REVISION: los distractores de cuenta los escribe Near; estos
 * son provisionales, tomados de cuentas que ya usa T7 [ESCRITO POR CLAUDE,
 * NO POR LA FICHA].
 */
export const ITEMS_H1 = [
  {
    id: "valor-a-facturar", tipo: "cifra",
    pregunta: "¿Cuál es el valor a facturar?",
    correcta: C.factura,
    acierto: "Así es. El descuento es de $246.000, y se resta: $2.050.000 − $246.000 = $1.804.000.",
    distractores: [
      { valor: C.lista, retro: "Ese es el precio de lista. El descuento comercial se resta antes de facturar." },
      { valor: C.lista + C.descuento, retro: "El descuento se resta del precio de lista, no se suma." },
    ],
  },
  {
    id: "iva", tipo: "cifra",
    pregunta: "¿Cuánto es el IVA?",
    correcta: C.iva,
    acierto: "Así es. Se calcula sobre el valor a facturar: $1.804.000 × 16 % = $288.640.",
    distractores: [
      { valor: (C.lista * TARIFAS_H1.iva) / 100, retro: "Ese IVA sale del precio de lista. Se calcula sobre el valor a facturar, que ya tiene el descuento." },
      /* La tarifa de la retención en vez de la del IVA: la retroalimentación no la nombra (regla de Mello). */
      { valor: C.retencion, retro: "Usaste otra tarifa. En este ejercicio, el IVA es del 16 %." },
    ],
  },
  {
    id: "debe-el-cliente", tipo: "cifra",
    pregunta: "¿Cuánto le queda debiendo el cliente a Guadua?",
    correcta: C.cliente,
    acierto: "Así es: $1.804.000 + $288.640 − $63.140 = $2.029.500.",
    distractores: [
      { valor: C.factura + C.iva, retro: "Falta restar la retención, que es de $63.140." },
      { valor: C.factura + C.iva + C.retencion, retro: "La retención se resta, porque el cliente la descuenta del pago." },
    ],
  },
  {
    id: "ingresos-por-ventas", tipo: "eleccion",
    pregunta: "¿Por qué valor va Ingresos por ventas?",
    correcta: C.factura,
    acierto: "Así es. El descuento no aparece en el asiento: Ingresos por ventas va por lo facturado.",
    distractores: [
      { valor: C.lista, retro: "El descuento comercial no se registra. Ingresos por ventas va por lo que se facturó." },
      { valor: C.cliente, retro: "Ese es lo que debe el cliente. Ingresos por ventas va por el valor de la mercancía facturada." },
    ],
  },
  {
    id: "asiento", tipo: "asiento",
    pregunta: "Ubica cada línea del asiento: Debe o Haber.",
    lineas: [
      { id: "clientes", distractores: ["Cuentas por pagar – proveedores", "Ingresos por ventas"], cuenta: "Cuentas por cobrar – clientes", valor: C.cliente, lado: DEBE, retro: "El cliente le queda debiendo a Guadua. Es un activo que aumenta: va al debe." },
      { id: "anticipo", distractores: ["Retención en la fuente por pagar", "IVA por pagar"], cuenta: "Anticipo fiscal", valor: C.retencion, lado: DEBE, retro: "El cliente le descontó la retención. Para Guadua es un impuesto pagado por adelantado: va al debe de Anticipo fiscal." },
      { id: "iva", distractores: ["Retención en la fuente por pagar", "Anticipo fiscal"], cuenta: "IVA por pagar", valor: C.iva, lado: HABER, retro: "Guadua cobró el IVA y se lo debe al Estado: va al haber de IVA por pagar." },
      { id: "ingresos", distractores: ["Inventario de mercancías", "Compras"], cuenta: "Ingresos por ventas", valor: C.factura, lado: HABER, retro: "La venta es un ingreso que aumenta: va al haber de Ingresos por ventas." },
    ],
  },
];

/* El resumen del cierre, con la frase de los Hacer de T7-2: cuántos de los ocho al primer toque. */
export const resumenH1 = (bien, total) => `${bien} de ${total} al primer toque.`;
