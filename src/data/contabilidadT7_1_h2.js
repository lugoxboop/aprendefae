import { DEBE, HABER } from "./contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · H2 DE HACER — «Arma la factura» (Célula C).
 *
 * Fuente: la v1 de Near y su corrección 1, las dos con PASA de Mello (tanda 2
 * corregida). Manda la más nueva: el error de $112.000 del ítem 1 ya no dice
 * qué cifra es. Copias en orquestador/conocimiento/paquetes/t7-1-h2-v1.md y
 * t7-1-h2-cambios.md; una prueba compara cada texto de aquí contra ellas.
 *
 * Hacer Medio, evaluativa, 25 FP: el motor compartido escala los FP con los
 * aciertos, con piso del 50 %. Va al catálogo del servidor (migración 0092,
 * que corre Mateo).
 *
 * DOCE ACIERTOS POSIBLES, uno por unidad: los cuatro cálculos (ítems 1, 2, 3
 * y 5) y las ocho líneas de los dos asientos (ítems 4 y 6). Un solo intento
 * por unidad (patrón v3.2), sin arrastre: las cifras son fijas, así que un
 * error en un ítem no cambia la respuesta del siguiente, y después de
 * responder siempre se ve la buena.
 *
 * Los ítems van en el orden de la tabla, porque cada uno usa el anterior. Las
 * opciones de cada cálculo, en orden aleatorio.
 *
 * Lo que la v1 no trae y se toma de la convención de H1 y del Tema 3: los
 * botones «Siguiente ítem» y «Ver mi resumen», y los nombres «Debe» y «Haber»
 * de los dos lados.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const H2_ID = "t7-1-arma-la-factura";

export const H2 = {
  id: H2_ID,
  nombre: "Arma la factura",
  /* La v1: «Etiqueta del panel docente». */
  etiqueta: "Arma la factura · Inventarios I",
  consigna: "Arma las dos facturas de La Ceiba y sus asientos. Tienes un solo intento por pregunta.",
  enunciado: [
    "El 3 de mayo, La Ceiba le compra mercancía a crédito a un proveedor, por $3.200.000, más el IVA. Usa el sistema de inventario periódico.",
    "El 10 de mayo, La Ceiba le vende mercancía a crédito a un cliente, por $4.800.000, más el IVA.",
    "En este ejercicio, el IVA es del 16 % y la retención del 3,5 %. Las dos se calculan sobre el valor de la mercancía.",
    "Las tarifas de este ejercicio son datos del libro. No las tomes como las tarifas de hoy.",
  ],
  pie: "Basado en el libro, pp. 210-214",
};

/* Las fichas de los cinco datos, compra y venta, como la tabla de la v1. */
export const FICHAS_H2 = {
  campos: ["Quién recibe", "Quién entrega", "Monto", "Tipo", "Clase de hecho"],
  compra: { titulo: "Compra", valores: ["La Ceiba", "Un proveedor", "$3.200.000", "A crédito", "Compra de mercancía para venderla"] },
  venta: { titulo: "Venta", valores: ["Un cliente", "La Ceiba", "$4.800.000", "A crédito", "Venta de mercancía"] },
};

/* Las cifras, calculadas. Una prueba las compara con las de la v1. */
const TARIFA_IVA = 0.16;
const TARIFA_RETENCION = 0.035;
const COMPRA = 3_200_000;
const VENTA = 4_800_000;
export const CIFRAS_H2 = {
  compra: COMPRA,
  ivaCompra: Math.round(COMPRA * TARIFA_IVA),
  retencionCompra: Math.round(COMPRA * TARIFA_RETENCION),
  venta: VENTA,
  ivaVenta: Math.round(VENTA * TARIFA_IVA),
  retencionVenta: Math.round(VENTA * TARIFA_RETENCION),
};
CIFRAS_H2.debeProveedor = CIFRAS_H2.compra + CIFRAS_H2.ivaCompra - CIFRAS_H2.retencionCompra;
CIFRAS_H2.debeCliente = CIFRAS_H2.venta + CIFRAS_H2.ivaVenta - CIFRAS_H2.retencionVenta;

export const BOTON_H2 = { siguiente: "Siguiente ítem", verResumen: "Ver mi resumen" };
export const LADOS_H2 = { [DEBE]: "Debe", [HABER]: "Haber" };

/*
 * Los seis ítems. Un cálculo trae su cifra buena, su acierto y dos
 * distractores, cada uno con su retroalimentación. Un asiento trae sus cuatro
 * líneas, cada una con su lado y su mensaje de error, y las sumas que se
 * muestran al terminar.
 */
export const ITEMS_H2 = [
  {
    id: "iva-compra", tipo: "calculo", subtema: "IVA",
    pregunta: "¿Cuánto es el IVA de la compra?",
    correcta: 512_000,
    acierto: "Así es: el 16 % de $3.200.000 es $512.000.",
    distractores: [
      /* Corrección 1 (PASA de Mello): ya no dice qué cifra es. */
      { valor: 112_000, retro: "Usaste la tarifa equivocada. El IVA es el 16 % del valor de la mercancía." },
      { valor: 3_712_000, retro: "Ese es el valor con el IVA ya sumado. El IVA solo es $512.000." },
    ],
  },
  {
    id: "retencion-compra", tipo: "calculo", subtema: "Retención",
    pregunta: "¿Cuánto es la retención de la compra?",
    correcta: 112_000,
    acierto: "Así es: el 3,5 % de $3.200.000 es $112.000. Se calcula sin el IVA.",
    distractores: [
      { valor: 129_920, retro: "Ese es el 3,5 % del valor con IVA. La retención se calcula sobre la mercancía sola: $112.000." },
      { valor: 512_000, retro: "Ese es el IVA. La retención es el 3,5 %: $112.000." },
    ],
  },
  {
    id: "debe-proveedor", tipo: "calculo", subtema: "Total de la factura",
    pregunta: "¿Cuánto le queda debiendo La Ceiba al proveedor?",
    correcta: 3_600_000,
    acierto: "Así es: $3.200.000 + $512.000 − $112.000 = $3.600.000.",
    distractores: [
      { valor: 3_824_000, retro: "La retención no se suma: se resta, porque La Ceiba la descuenta del pago al proveedor." },
      { valor: 3_712_000, retro: "Falta restar la retención de $112.000." },
    ],
  },
  {
    id: "asiento-compra", tipo: "asiento", subtema: "Asiento de compra",
    pregunta: "Ubica cada línea del asiento de la compra: Debe o Haber.",
    lineas: [
      { id: "compras", cuenta: "Compras", valor: 3_200_000, lado: DEBE, retro: "La compra de mercancía va al debe de Compras." },
      { id: "iva", cuenta: "IVA por pagar", valor: 512_000, lado: DEBE, retro: "En la compra, el IVA va al debe de IVA por pagar." },
      { id: "retencion", cuenta: "Retención en la fuente por pagar", valor: 112_000, lado: HABER, retro: "La Ceiba descontó la retención y se la debe a la Dirección de Impuestos. Es un pasivo que aumenta: va al haber." },
      { id: "proveedores", cuenta: "Cuentas por pagar – proveedores", valor: 3_600_000, lado: HABER, retro: "La Ceiba le queda debiendo al proveedor. Es un pasivo que aumenta: va al haber." },
    ],
    sumas: 3_712_000,
  },
  {
    id: "debe-cliente", tipo: "calculo", subtema: "Total de la factura",
    pregunta: "¿Cuánto le queda debiendo el cliente a La Ceiba?",
    correcta: 5_400_000,
    acierto: "Así es: $4.800.000 + $768.000 − $168.000 = $5.400.000.",
    distractores: [
      { valor: 5_736_000, retro: "La retención se resta, porque el cliente la descuenta del pago." },
      { valor: 5_568_000, retro: "Falta restar la retención de $168.000. El IVA es $768.000 y la retención, $168.000." },
    ],
  },
  {
    id: "asiento-venta", tipo: "asiento", subtema: "Asiento de venta",
    pregunta: "Ubica cada línea del asiento de la venta: Debe o Haber.",
    lineas: [
      { id: "clientes", cuenta: "Cuentas por cobrar – clientes", valor: 5_400_000, lado: DEBE, retro: "El cliente le queda debiendo a La Ceiba. Es un activo que aumenta: va al debe." },
      { id: "anticipo", cuenta: "Anticipo fiscal", valor: 168_000, lado: DEBE, retro: "El cliente le descontó la retención a La Ceiba. Es un impuesto pagado por adelantado: va al debe de Anticipo fiscal." },
      { id: "iva", cuenta: "IVA por pagar", valor: 768_000, lado: HABER, retro: "En la venta, La Ceiba cobró el IVA y se lo debe al Estado: va al haber de IVA por pagar." },
      { id: "ingresos", cuenta: "Ingresos por ventas", valor: 4_800_000, lado: HABER, retro: "La venta es un ingreso que aumenta: va al haber de Ingresos por ventas." },
    ],
    sumas: 5_568_000,
  },
];

/* El resumen del cierre, con la frase de H1: cuántos de los doce al primer toque. */
export const resumenH2 = (bien, total) => `${bien} de ${total} al primer toque.`;
