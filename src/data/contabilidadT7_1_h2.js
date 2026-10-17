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
 * Los ítems van en el orden de la tabla, porque cada uno usa el anterior.
 *
 * LOTE 3 («Arma la línea», paquete de Near lote3-distractores-v1.md): los
 * cuatro cálculos van con casilla de cifra (tipo "cifra"): si la cifra
 * escrita es la de un distractor, sale su retroalimentación. En cada línea de
 * los dos asientos se elige la cuenta (la correcta y sus `distractores` de
 * Near, { cuenta, retro }) y el lado. Las líneas del asiento de venta son las
 * mismas, con los mismos textos, que las del asiento de T7-3 H1.
 *
 * Lo que la v1 no trae y se toma de la convención de H1 y del Tema 3: los
 * botones «Siguiente ítem» y «Ver mi resumen», y los nombres «Debe» y «Haber»
 * de los dos lados.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const H2_ID = "t7-1-arma-la-factura";

export const H2 = {
  id: H2_ID,
  /* Lote O: el objetivo, de Near (paquetes/lote-o-objetivos.md). */
  objetivo: "Armar una factura con IVA y retención, y registrar la compra y la venta.",
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
 * Los seis ítems. Un cálculo (casilla de cifra) trae su cifra buena, su
 * acierto y dos distractores, cada uno con su retroalimentación. Un asiento
 * trae sus cuatro líneas, cada una con su lado, su mensaje de error de lado y
 * sus dos cuentas distractoras de Near, y las sumas que se muestran al terminar.
 */
export const ITEMS_H2 = [
  {
    id: "iva-compra", tipo: "cifra", subtema: "IVA",
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
    id: "retencion-compra", tipo: "cifra", subtema: "Retención",
    pregunta: "¿Cuánto es la retención de la compra?",
    correcta: 112_000,
    acierto: "Así es: el 3,5 % de $3.200.000 es $112.000. Se calcula sin el IVA.",
    distractores: [
      { valor: 129_920, retro: "Ese es el 3,5 % del valor con IVA. La retención se calcula sobre la mercancía sola: $112.000." },
      { valor: 512_000, retro: "Ese es el IVA. La retención es el 3,5 %: $112.000." },
    ],
  },
  {
    id: "debe-proveedor", tipo: "cifra", subtema: "Total de la factura",
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
      { id: "compras", cuenta: "Compras", valor: 3_200_000, lado: DEBE, retro: "La compra de mercancía va al debe de Compras.", distractores: [{ cuenta: "Inventario de mercancías", retro: "En el periódico, Inventario de mercancías no se mueve con cada compra. Se queda quieta hasta el cierre." }, { cuenta: "Gastos de administración y ventas", retro: "La Ceiba compró esta mercancía para volver a venderla. No es un gasto de la operación del mes." }] },
      { id: "iva", cuenta: "IVA por pagar", valor: 512_000, lado: DEBE, retro: "En la compra, el IVA va al debe de IVA por pagar.", distractores: [{ cuenta: "Retención en la fuente por pagar", retro: "La retención se calcula al 3,5 %, y este valor no sale de esa tarifa. Revisa con qué tarifa sale." }, { cuenta: "Anticipo fiscal", retro: "Anticipo fiscal aparece cuando a la empresa le descuentan la retención, y eso pasa al vender. Aquí La Ceiba compra." }] },
      { id: "retencion", cuenta: "Retención en la fuente por pagar", valor: 112_000, lado: HABER, retro: "La Ceiba descontó la retención y se la debe a la Dirección de Impuestos. Es un pasivo que aumenta: va al haber.", distractores: [{ cuenta: "Anticipo fiscal", retro: "Anticipo fiscal es la retención que le descuentan a la empresa cuando vende. En la compra, es La Ceiba quien la descuenta." }, { cuenta: "IVA por pagar", retro: "El IVA de esta compra se calcula al 16 %, y este valor no sale de esa tarifa. Revisa con qué tarifa sale." }] },
      { id: "proveedores", cuenta: "Cuentas por pagar – proveedores", valor: 3_600_000, lado: HABER, retro: "La Ceiba le queda debiendo al proveedor. Es un pasivo que aumenta: va al haber.", distractores: [{ cuenta: "Caja o Bancos", retro: "La compra fue a crédito, así que todavía no sale dinero. Lo que aparece es una deuda." }, { cuenta: "Cuentas por cobrar – clientes", retro: "Esa cuenta es lo que a la empresa le deben sus clientes. En esta compra, nadie le queda debiendo a La Ceiba." }] },
    ],
    sumas: 3_712_000,
  },
  {
    id: "debe-cliente", tipo: "cifra", subtema: "Total de la factura",
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
      { id: "clientes", cuenta: "Cuentas por cobrar – clientes", valor: 5_400_000, lado: DEBE, retro: "El cliente le queda debiendo a La Ceiba. Es un activo que aumenta: va al debe.", distractores: [{ cuenta: "Caja o Bancos", retro: "La venta fue a crédito, así que el cliente todavía no paga. No entra dinero." }, { cuenta: "Cuentas por pagar – proveedores", retro: "Esa cuenta es lo que la empresa debe. Con esta venta, la empresa no queda debiendo nada." }] },
      { id: "anticipo", cuenta: "Anticipo fiscal", valor: 168_000, lado: DEBE, retro: "El cliente le descontó la retención a La Ceiba. Es un impuesto pagado por adelantado: va al debe de Anticipo fiscal.", distractores: [{ cuenta: "Retención en la fuente por pagar", retro: "Esa cuenta es para la retención que la empresa descuenta cuando compra. Aquí el que descuenta es el cliente." }, { cuenta: "IVA por pagar", retro: "Este valor sale al 3,5 %, no al 16 %. No es el IVA." }] },
      { id: "iva", cuenta: "IVA por pagar", valor: 768_000, lado: HABER, retro: "En la venta, La Ceiba cobró el IVA y se lo debe al Estado: va al haber de IVA por pagar.", distractores: [{ cuenta: "Anticipo fiscal", retro: "Anticipo fiscal va con la retención, que sale al 3,5 %. Este valor sale al 16 %." }, { cuenta: "Retención en la fuente por pagar", retro: "Esa cuenta es para la retención que la empresa descuenta cuando compra. Y este valor sale al 16 %." }] },
      { id: "ingresos", cuenta: "Ingresos por ventas", valor: 4_800_000, lado: HABER, retro: "La venta es un ingreso que aumenta: va al haber de Ingresos por ventas.", distractores: [{ cuenta: "Inventario de mercancías", retro: "En el periódico, la venta no toca Inventario de mercancías. Esa cuenta solo se pone al día al cierre." }, { cuenta: "Compras", retro: "Compras recoge lo que la empresa compra para vender. Aquí la empresa vende." }] },
    ],
    sumas: 5_568_000,
  },
];

/* El resumen del cierre, con la frase de H1: cuántos de los doce al primer toque. */
export const resumenH2 = (bien, total) => `${bien} de ${total} al primer toque.`;

/*
 * ═══════════ LA FACTURA QUE SE ARMA (Patrón de enganche C2, Watari, 16-oct) ═══════════
 *
 * Fuente: orquestador/conocimiento/paquetes/patron-enganche-c2-v1.html,
 * sección «factura», con las correcciones obligatorias de Mello
 * (auditoria-mello-patron-c2.md §3: Fa-1 y Fa-2). La evaluación no cambia:
 * los mismos seis ítems, las doce unidades, un intento por unidad.
 *
 * Dónde vive cada cálculo en la factura y a qué renglón corresponde cada
 * línea de los asientos (los renglones que «viajan» al asiento).
 */
export const DONDE_H2 = {
  "iva-compra": { factura: "compra", renglon: "iva" },
  "retencion-compra": { factura: "compra", renglon: "ret" },
  "debe-proveedor": { factura: "compra", renglon: "total" },
  "debe-cliente": { factura: "venta", renglon: "total" },
  "asiento-compra": { factura: "compra", lineas: { compras: "mercancia", iva: "iva", retencion: "ret", proveedores: "total" } },
  "asiento-venta": { factura: "venta", lineas: { clientes: "total", anticipo: "ret", iva: "iva", ingresos: "mercancia" } },
};

/*
 * [W] Rótulos de Watari que la C2 pide a Near (§4 de la pieza). Near todavía
 * no los confirma: PENDIENTES DE NEAR. Las fechas son las del enunciado.
 */
export const FACTURA_H2 = {
  renglones: { mercancia: "Mercancía", iva: "IVA (16 %)", ret: "Retención (3,5 %)", total: { compra: "Queda debiendo al proveedor", venta: "El cliente queda debiendo" } },
  titulos: { compra: "Factura de compra", venta: "Factura de venta" },
  fechas: { compra: "3 de mayo", venta: "10 de mayo" },
  asientos: { compra: "Asiento de la compra", venta: "Asiento de la venta" },
  sumas: "Sumas iguales",
  verEnunciado: "Ver el enunciado",
  ocultarEnunciado: "Ocultar el enunciado",
  lineasAlPrimerToque: (n) => `${n} de 4 líneas al primer toque.`,
};

/*
 * Fa-2 de Mello: en el ítem 1 quedan a la vista solo la frase del periódico
 * (la de Near, con sujeto: «La Ceiba usa…», literal de la auditoría; Near
 * todavía debe confirmarla: PENDIENTE DE NEAR) y el párrafo de las tarifas.
 * Los párrafos 1, 2 y 4 van en «Ver el enunciado» desde el ítem 1. Desde el
 * ítem 2, como en la C2, el enunciado de Near entero va plegado.
 */
export const PERIODICO_H2 = "La Ceiba usa el sistema de inventario periódico.";
export const ENUNCIADO_H2 = {
  visible: [PERIODICO_H2, H2.enunciado[2]],
  plegadoItem1: [H2.enunciado[0], H2.enunciado[1], H2.enunciado[3]],
  plegado: H2.enunciado,
};
