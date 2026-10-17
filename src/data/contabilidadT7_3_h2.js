import { ROTULOS_PATRON } from "./contabilidadT7_3.js";
import { ROTULOS_A2 } from "./contabilidadT7_3_a2.js";
/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · H2 DE HACER — «La cadena de descuentos» (Célula C).
 *
 * Fuente: la v1 de Near, con PASA de Mello, y el cambio que pasó L en su
 * último mensaje: la retroalimentación del distractor 0,1792 del ítem 3
 * (ahora no dice qué es esa cifra, para no dar la respuesta del ítem 4).
 * Copia en orquestador/conocimiento/paquetes/t7-3-h2-v1.md; una prueba
 * compara cada texto de aquí contra ella, letra por letra.
 *
 * Hacer Medio, evaluativa, 25 FP: el motor compartido escala los FP con los
 * aciertos, con piso del 50 %. Migración 0104, que corre Mateo.
 *
 * CINCO ACIERTOS POSIBLES, uno por ítem, en el orden del libro (p. 250):
 * paso a paso, el atajo del factor y la comparación con la suma de los
 * porcentajes. Un solo intento por ítem, sin arrastre: las cifras son fijas.
 *
 * LAS CIFRAS no se escriben a mano: salen de la lista, los tres descuentos y
 * las tarifas (calcularH2). Una prueba las recalcula y las compara con el
 * registro 5c de Near. 0,90 × 0,95 × 0,96 = 0,8208 es exacto, así que la
 * factura y los impuestos salen en pesos enteros. Ninguna cifra es del libro
 * (H-2 es de A2) ni de X1-X4.
 *
 * Lo que la v1 no trae y se toma de H1 de T7-3: los botones «Siguiente ítem»
 * y «Ver mi resumen», los rótulos de la ficha, y cómo se escriben el factor
 * («0,8208») y los porcentajes («17,92 %»), que la v1 da así en su tabla.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const H2_ID = "t7-3-cadena-de-descuentos";

export const LISTA_H2 = 2_750_000;
export const CADENA_H2 = [10, 5, 4];
export const TARIFAS_H2 = { iva: 16, retencion: 3.5 };

/* Los complementos se multiplican en enteros (diezmilésimas) para que el factor sea exacto. */
export function calcularH2(lista = LISTA_H2, cadena = CADENA_H2, t = TARIFAS_H2) {
  const saldos = [lista];
  const descuentos = [];
  for (const pct of cadena) {
    const d = (saldos.at(-1) * pct) / 100;
    descuentos.push(d);
    saldos.push(saldos.at(-1) - d);
  }
  const factura = saldos.at(-1);
  const factor = cadena.reduce((f, pct) => (f * (100 - pct)) / 100, 10_000) / 10_000;
  const iva = (factura * t.iva) / 100;
  const retencion = (factura * t.retencion) / 100;
  const suma = cadena.reduce((s, pct) => s + pct, 0);
  return {
    lista, descuentos, saldos, factura, factor, rebaja: lista - factura,
    pctRebaja: Math.round(((lista - factura) / lista) * 10_000) / 100, suma,
    iva, retencion, cliente: factura + iva - retencion,
  };
}

export const CIFRAS_H2 = calcularH2();
const C = CIFRAS_H2;

export const H2 = {
  id: H2_ID,
  /* Lote O: el objetivo, de Near (paquetes/lote-o-objetivos.md). */
  objetivo: "Calcular una cadena de descuentos, uno sobre otro, y lo que queda debiendo el cliente.",
  nombre: "La cadena de descuentos",
  consigna: "Calcula la cadena de descuentos y lo que queda debiendo el cliente. Tienes un solo intento por pregunta.",
  enunciado: [
    "El 14 de septiembre, Palma le vende mercancía a crédito a un cliente. El precio de lista es de $2.750.000, más el IVA, y le da tres descuentos comerciales en cadena: del 10 %, del 5 % y del 4 %. Usa el sistema de inventario periódico.",
    /* «Línea de tarifas, igual que en H1, y la frase fija». */
    "En este ejercicio, el IVA es del 16 % y la retención del 3,5 %. Las dos se calculan sobre el valor a facturar.",
    "Las tarifas de este ejercicio son datos del libro. No las tomes como las tarifas de hoy.",
  ],
  pie: "Basado en el libro, pp. 249-250",
};

export const FICHA_H2 = [
  ["Quién entrega", "Palma"],
  ["Quién recibe", "Un cliente"],
  ["Monto", "$2.750.000 de lista, con 10 %, 5 % y 4 %"],
  ["Tipo", "A crédito"],
  ["Clase de hecho", "Venta de mercancía"],
];

/*
 * Patrón T7-3 (Watari): la cuenta en renglones, cada parte DESPUÉS de su
 * ítem. La cadena crece en la misma tarjeta (ítems 1 y 2); el atajo del
 * factor llega con el ítem 3 y la rebaja de verdad con el 4. Rótulos de
 * Watari, revisados por Near.
 *
 * La nota de la rebaja: la primera frase es de Watari y la segunda de Near
 * (la retroalimentación del ítem 4). Near la revisó: va tal cual (INFLESZ
 * 82,6).
 */
const decimal = (x) => String(x).replace(".", ",");
export const ROTULOS_H2 = {
  cadena: "Cadena de descuentos de Palma",
  rebaja: "La rebaja de verdad",
  rebajaFila: "Rebaja",
  partePrecio: "Parte del precio de lista",
  nota: `La suma de los porcentajes da ${C.suma} %. Cada descuento va sobre un saldo más pequeño, así que la rebaja real es menor.`,
};
const [d10, d5, d4] = CADENA_H2;
export const FIGURAS_H2 = [
  {
    tipo: "renglones", desde: 1, titulo: ROTULOS_H2.cadena,
    filas: [
      { rot: ROTULOS_PATRON.precioLista, v: C.lista },
      { op: "−", rot: ROTULOS_A2.descuento(d10), v: C.descuentos[0] },
      { op: "=", rot: ROTULOS_A2.saldo, v: C.saldos[1], res: true },
      { op: "−", rot: ROTULOS_A2.delSaldo(d5), v: C.descuentos[1], desde: 2 },
      { op: "=", rot: ROTULOS_A2.saldo, v: C.saldos[2], res: true, desde: 2 },
      { op: "−", rot: ROTULOS_A2.delSaldo(d4), v: C.descuentos[2], desde: 2 },
      { op: "=", rot: ROTULOS_PATRON.valorFacturar, v: C.factura, res: true, desde: 2 },
    ],
  },
  {
    tipo: "renglones", desde: 3, titulo: ROTULOS_A2.atajo,
    filas: [
      { rot: ROTULOS_A2.complementos, v: CADENA_H2.map((p) => decimal((100 - p) / 100).padEnd(4, "0")).join(" × "), apila: true },
      { op: "=", rot: ROTULOS_A2.factor, v: decimal(C.factor), res: true },
      { op: "×", rot: ROTULOS_PATRON.precioLista, v: C.lista },
      { op: "=", rot: ROTULOS_PATRON.valorFacturar, v: C.factura, res: true },
    ],
  },
  {
    tipo: "renglones", desde: 4, titulo: ROTULOS_H2.rebaja, nota: ROTULOS_H2.nota,
    filas: [
      { rot: ROTULOS_PATRON.precioLista, v: C.lista },
      { op: "−", rot: ROTULOS_PATRON.valorFacturar, v: C.factura },
      { op: "=", rot: ROTULOS_H2.rebajaFila, v: C.rebaja, res: true },
      { rot: ROTULOS_H2.partePrecio, v: `${decimal(C.pctRebaja)} %`, fuerte: true },
    ],
  },
];

export const BOTON_H2 = { siguiente: "Siguiente ítem", verResumen: "Ver mi resumen" };

/* Cómo se escribe cada valor: en pesos, como factor o como porcentaje. */
export const PESOS = "pesos";
export const FACTOR = "factor";
export const PORCENTAJE = "porcentaje";

export const ITEMS_H2 = [
  {
    id: "base-del-cinco", formato: PESOS,
    pregunta: "¿Sobre qué valor se calcula el descuento del 5 %?",
    correcta: C.saldos[1],
    acierto: "Así es. Primero se restó el 10 %: $2.750.000 − $275.000 = $2.475.000. El 5 % va sobre ese saldo.",
    distractores: [
      { valor: C.lista, retro: "En una cadena, cada descuento va sobre el saldo que dejó el anterior: $2.750.000 − $275.000." },
      { valor: C.saldos[2], retro: "Ese es el saldo después del 5 %. El 5 % se calcula sobre el saldo que dejó el 10 %." },
    ],
  },
  {
    id: "valor-a-facturar", formato: PESOS,
    pregunta: "¿Cuál es el valor a facturar?",
    correcta: C.factura,
    acierto: "Así es. El 5 % deja $2.351.250, y el 4 % de ese saldo es $94.050. Quedan $2.257.200.",
    distractores: [
      /* Restar la suma de los porcentajes de una vez: el 19 %. */
      { valor: C.lista - (C.lista * C.suma) / 100, retro: "Restaste el 19 % de una vez. Cada descuento va sobre el saldo que dejó el anterior, así que la rebaja es menor." },
      { valor: C.saldos[2], retro: "Falta el tercer descuento: el 4 % de $2.351.250." },
    ],
  },
  {
    id: "factor", formato: FACTOR,
    pregunta: "¿Cuál es el factor de esta cadena?",
    correcta: C.factor,
    acierto: "Así es. Se multiplican los complementos de los tres descuentos, y sale 0,8208. Por eso, $2.750.000 × 0,8208 = $2.257.200.",
    distractores: [
      { valor: (100 - C.suma) / 100, retro: "Ese sale de restar los tres descuentos de una vez. El factor se halla al multiplicar los complementos de cada uno." },
      /* Cambio de Near (último mensaje de L): ya no dice qué es esta cifra, para no dar la respuesta del ítem 4. */
      { valor: Math.round((1 - C.factor) * 10_000) / 10_000, retro: "Esa cifra no sale de multiplicar los complementos de cada descuento. Para hallar el factor, hay que multiplicarlos entre sí." },
    ],
  },
  {
    id: "rebaja-real", formato: PORCENTAJE,
    pregunta: "¿Qué parte del precio de lista se rebajó de verdad?",
    correcta: C.pctRebaja,
    acierto: "Así es. Se rebajaron $492.800, que es el 17,92 % de $2.750.000.",
    distractores: [
      { valor: C.suma, retro: "Esa es la suma de los porcentajes. Cada descuento va sobre un saldo más pequeño, así que la rebaja real es menor." },
      { valor: Math.round((100 - C.pctRebaja) * 100) / 100, retro: "Esa es la parte que se factura. La rebaja es lo que falta para el 100 %." },
    ],
  },
  {
    id: "debe-el-cliente", formato: PESOS,
    pregunta: "¿Cuánto le queda debiendo el cliente a Palma?",
    correcta: C.cliente,
    acierto: "Así es. El IVA es de $361.152 y la retención, de $79.002: $2.257.200 + $361.152 − $79.002 = $2.539.350.",
    distractores: [
      { valor: C.factura + C.iva, retro: "Falta restar la retención, que es de $79.002." },
      { valor: C.factura + C.iva + C.retencion, retro: "La retención se resta, porque el cliente la descuenta del pago." },
    ],
  },
];

/* El resumen del cierre, con la frase de H1: cuántos de los cinco al primer toque. */
export const resumenH2 = (bien, total) => `${bien} de ${total} al primer toque.`;
