/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · H5 DE HACER — «¿Costo o gasto?» (Célula C).
 *
 * Fuente: la v1 de Near y su corrección 4, las dos con PASA de Mello (tanda
 * corregida). Manda la más nueva:
 *   · el error de $10.500 del ítem 6 dice «el 3,5 % del flete»;
 *   · la segunda línea del caso es la del arreglo de A5 («El flete vale
 *     $300.000 y lo asume El Faro…»), y la ficha dice «$300.000, valor del
 *     flete», con la misma forma que A5 («$650.000, valor del flete»; la
 *     parte de la mercancía sigue como en la v1);
 *   · el porqué del ítem 2 es el literal del libro.
 * Copias en orquestador/conocimiento/paquetes/t7-1-h5-v1.md y
 * t7-1-h5-cambios.md; una prueba compara cada texto contra ellas.
 *
 * Hacer Medio, evaluativa, 25 FP: el motor compartido escala los FP con los
 * aciertos (8 posibles), con piso del 50 %. Migración 0095, que corre Mateo.
 *
 * Ocho ítems, un solo intento cada uno (patrón v3.2), sin arrastre: las
 * cifras son fijas. Van en el orden de la tabla. En la parte 1 las dos
 * opciones van siempre en el mismo orden (la v1 las da como un par fijo); en
 * la parte 2, barajadas en cada intento.
 *
 * LAS CIFRAS no se escriben a mano: salen de la mercancía, el flete y las
 * tarifas del ejercicio (calcularH5). Una prueba las recalcula y las compara
 * con las de Near.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const H5_ID = "t7-1-costo-o-gasto";

export const MERCANCIA_H5 = 4_600_000;
export const FLETE_H5 = 300_000;
/* Las tarifas del ejercicio, en por ciento. */
export const TARIFAS_H5 = { iva: 16, retencion: 3.5, transporte: 1 };

export function calcularH5(mercancia = MERCANCIA_H5, flete = FLETE_H5, t = TARIFAS_H5) {
  const iva = (mercancia * t.iva) / 100;
  const retencion = (mercancia * t.retencion) / 100;
  const retencionFlete = (flete * t.transporte) / 100;
  return {
    mercancia, flete, iva, retencion, retencionFlete,
    pagoTransportadora: flete - retencionFlete,
    debeProveedor: mercancia + iva - retencion,
  };
}

export const CIFRAS_H5 = calcularH5();
const C = CIFRAS_H5;

export const H5 = {
  id: H5_ID,
  /* Lote O: el objetivo, de Near (paquetes/lote-o-objetivos.md). */
  objetivo: "Distinguir lo que forma parte del costo de la mercancía de lo que es un gasto.",
  nombre: "¿Costo o gasto?",
  /* La v1: «Etiqueta». */
  etiqueta: "¿Costo o gasto? · Inventarios I",
  consigna: "Primero decide qué forma parte del costo de la mercancía y qué es un gasto. Tienes un solo intento por pregunta.",
  caso: [
    "El 9 de agosto, El Faro le compra mercancía a un proveedor por $4.600.000, más el IVA. Paga a crédito. Usa el sistema de inventario periódico.",
    /* Corrección 4: el arreglo de A5. */
    "El flete vale $300.000 y lo asume El Faro, que le paga a la transportadora ese mismo día.",
    "En este ejercicio, el IVA es del 16 % y la retención del 3,5 %, sobre la mercancía. La retención por transporte terrestre es del 1 %.",
    /* «La frase de tarifas, literal»: la de AP2, A5 y A6. */
    "Las tarifas de este ejercicio son datos del libro. No las tomes como las tarifas de hoy.",
  ],
  pie: "Basado en el libro, pp. 208, 210, 212 y 228-229",
};

export const FICHA_H5 = [
  ["Quién recibe", "El Faro recibe la mercancía y el transporte"],
  ["Quién entrega", "Un proveedor y una transportadora"],
  /* Corrección 4, con la forma de A5. */
  ["Monto", "$4.600.000 por la mercancía; $300.000, valor del flete"],
  ["Tipo", "La mercancía a crédito; los fletes pagados ese mismo día"],
  ["Clase de hecho", "Compra de mercancía, con el flete a cargo del comprador"],
];

export const COSTO_O_GASTO = [
  { valor: "costo", texto: "Forma parte del costo de la mercancía" },
  { valor: "gasto", texto: "Es un gasto" },
];

export const CUENTAS_H5 = [
  { valor: "compras-fletes", texto: "Compras (fletes)" },
  { valor: "gasto-venta-fletes", texto: "Gasto de venta – fletes" },
  { valor: "inventario", texto: "Inventario de mercancías" },
];

/*
 * Los ocho ítems. Parte 1: el hecho, la respuesta y el porqué que siempre se
 * ve (el ítem 1 trae uno para el acierto y otro para el error). Parte 2: la
 * pregunta, la respuesta, su acierto y dos distractores con su texto.
 */
export const ITEMS_H5 = [
  {
    id: "bodegaje", parte: 1, subtema: "Importados", pagina: 208,
    pregunta: "El bodegaje que se paga en la aduana por mercancía traída del exterior.",
    correcta: "costo",
    acierto: "Así es. El libro suma al costo los gastos de bodegaje de la mercancía importada.",
    error: "El libro suma el bodegaje al costo. Hace falta para tener lista la mercancía que viene de afuera.",
  },
  {
    id: "factura-exterior", parte: 1, subtema: "Costo de lo comprado", pagina: 208,
    pregunta: "El valor de la factura de un proveedor del exterior, pasado a pesos.",
    correcta: "costo",
    /* Corrección 4: el literal del libro. */
    porque: "El libro incluye en el costo el valor de la factura.",
  },
  {
    id: "flete-comprador", parte: 1, subtema: "Flete del comprador", pagina: 228,
    pregunta: "El flete que paga el comprador para traer la mercancía a su bodega.",
    correcta: "costo",
    porque: "Si el comprador asume el flete, el libro lo suma al costo: es necesario para tener la mercancía lista para la venta.",
  },
  {
    id: "flete-vendedor", parte: 1, subtema: "Flete del vendedor", pagina: 229,
    pregunta: "El flete que paga el vendedor para llevarle la mercancía al cliente.",
    correcta: "gasto",
    porque: "Para el vendedor, el flete que paga es un gasto de venta. No forma parte del costo de lo que vende.",
  },
  {
    id: "cuenta-flete", parte: 2, subtema: "Flete del comprador",
    pregunta: "¿En qué cuenta va el flete de $300.000?",
    correcta: "compras-fletes",
    acierto: "Así es. El flete que asume el comprador se suma al costo de lo comprado: va a Compras (fletes).",
    distractores: [
      { valor: "gasto-venta-fletes", retro: "Ese es el flete que paga quien vende. Aquí lo paga quien compra, así que va a Compras (fletes)." },
      { valor: "inventario", retro: "En el periódico, lo que se suma al costo de lo comprado va a Compras, no a Inventario de mercancías." },
    ],
  },
  {
    id: "retencion-flete", parte: 2, subtema: "Retención del transporte",
    pregunta: "¿Cuánto le retiene El Faro a la transportadora?",
    correcta: C.retencionFlete,
    acierto: "Así es. La retención por transporte es del 1 %: $300.000 × 1 % = $3.000.",
    distractores: [
      /* Corrección 4: «del flete». */
      { valor: (C.flete * TARIFAS_H5.retencion) / 100, retro: "Ese es el 3,5 % del flete. Para el transporte, la retención de este ejercicio es del 1 %." },
      { valor: (C.flete * TARIFAS_H5.iva) / 100, retro: "Ese es el 16 % del flete, la tarifa del IVA. Para el transporte, la retención de este ejercicio es del 1 %." },
    ],
  },
  {
    id: "pago-transportadora", parte: 2, subtema: "Retención del transporte",
    pregunta: "¿Cuánto le paga a la transportadora?",
    correcta: C.pagoTransportadora,
    acierto: "Así es: $300.000 − $3.000 = $297.000.",
    distractores: [
      { valor: C.flete + C.retencionFlete, retro: "La retención no se suma: se resta, porque El Faro la descuenta del pago." },
      { valor: C.flete, retro: "Falta restar la retención de $3.000." },
    ],
  },
  {
    id: "debe-proveedor", parte: 2, subtema: "Costo de lo comprado",
    pregunta: "¿Cuánto le queda debiendo al proveedor por la mercancía?",
    correcta: C.debeProveedor,
    acierto: "Así es: $4.600.000 + $736.000 − $161.000 = $5.175.000.",
    distractores: [
      { valor: C.mercancia + C.iva, retro: "Falta restar la retención de la mercancía, que es de $161.000." },
      { valor: C.debeProveedor + C.flete, retro: "El flete no se le debe al proveedor: ya se le pagó a la transportadora ese mismo día." },
    ],
  },
];

export const BOTON_H5 = { siguiente: "Siguiente ítem", verResumen: "Ver mi resumen" };

export const resumenH5 = (bien, total) => `${bien} de ${total} al primer toque.`;
