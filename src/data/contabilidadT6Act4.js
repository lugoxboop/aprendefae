import { GASTO, PROVISION, CLIENTES, CAJA } from "./contabilidadT6Act2.js";
import { INGRESOS } from "./contabilidadT6Act3.js";
import { BANCOS } from "./contabilidadT5Act2.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · HACER 4 — «¿Qué se debita?» (Célula B, b5-t6-a4).
 *
 * Todo el texto que lee el estudiante vive en ESTE archivo, guardado entero
 * en orquestador/conocimiento/paquetes/b5-t6-act4.md: la versión de Futaba,
 * con las líneas que cambiaron tras la auditoría de Shoko (sección 2).
 * Los nombres de cuenta son los publicados (contabilidadT6Act2.js). Sin
 * cifras.
 *
 * El patrón de «¿Por Cuál Arteria Entra?» (b5/EligeUnaOpcion.jsx): un hecho a
 * la vez, cuatro cuentas fijas, un intento, la devolución de acierto del
 * hecho o la del tipo de error, sin emoji (lote 6d): el veredicto es el estado
 * de la elección, no el texto (contabilidad/t6Act4.js).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const T6_ACT4 = {
  id: "b5-t6-a4",
  nombre: "¿Qué se debita?",
  /* Decisión de Sakuta: media, 25 FP. */
  dificultad: "medio",
  fpBase: 25,
  /* Lote 6c (encabezado compacto, objetivo del kit en una oración). PARA SHOKO: texto nuevo. */
  objetivo: "Decidir qué cuenta se debita en cada hecho de las cuentas por cobrar y de su provisión.",
  consigna: "Lee el hecho y elige qué cuenta se debita.",
  nota: "Cada hecho se anota en los libros de la empresa que vende, cobra o castiga.",
  regla: "Se debita una cuenta de activo cuando sube, el gasto cuando se anota y la provisión cuando baja.",
  cierre: "Fíjate en qué pasa en cada hecho. Si entra plata, Caja. Si sube lo que deben los clientes, Cuentas por cobrar – clientes. Si se anota un gasto, el gasto. Y si se castiga con provisiones, la provisión.",
};

/* Las tres líneas de «¿Cómo se juega?». */
export const REGLAS_T6_ACT4 = [
  "Lee el hecho y piensa qué cuenta sube o, si es la provisión, si baja.",
  "Elige una de las cuatro cuentas: tienes un solo intento por hecho.",
  "Lee la explicación antes de pasar al siguiente.",
];

/* ═══════════ LAS CUATRO CUENTAS, FIJAS Y EN ESTE ORDEN ═══════════ */

export const A_CLIENTES = "clientes";
export const A_CAJA = "caja";
export const A_GASTO = "gasto";
export const A_PROVISION = "provision";

export const OPCIONES_T6_ACT4 = [
  { id: A_CLIENTES, nombre: CLIENTES },
  { id: A_CAJA, nombre: CAJA },
  { id: A_GASTO, nombre: GASTO },
  { id: A_PROVISION, nombre: PROVISION },
];

/* ═══════════ LOS ERRORES POR TIPO ═══════════ */

export const ERRORES_T6_ACT4 = {
  E1: "Con provisiones, el gasto ya se anotó al cerrar el año. Al castigar, se debita la provisión.",
  E2: "Con la anulación directa no hay provisión. El castigo se debita al gasto.",
  E3: "La provisión sube cuando se acredita. Al crearla o ajustarla, lo que se debita es el gasto.",
  E4: "Al revivir, la provisión se acredita: es el castigo al revés. Lo que se debita es Cuentas por cobrar – clientes.",
  E5: "Aquí no entra plata a Caja. Lo que sube es lo que deben los clientes.",
  E6: "Aquí entra plata, así que se debita Caja. Lo que deben los clientes baja y se acredita.",
  E7: "Este hecho no anota ningún gasto. Mira si entra plata o si cambia lo que deben los clientes.",
  E8: "Aquí no se castiga ninguna deuda, así que la provisión no baja.",
  E9: "En este hecho no entra plata ni sube lo que deben los clientes. Mira si se anota un gasto o si baja la provisión.",
  /* Entrega 1 de Futaba (calidad): la devolución propia de qd-09, solo cuando elige Caja. E5 sigue para qd-01 y qd-04. */
  E10: "Todavía no entra plata: primero se revive la deuda. Caja se debita en el asiento siguiente, con el pago.",
};

/*
 * Qué tipo de error lleva cada opción equivocada, por clase de hecho (la
 * columna «Cuándo» de Futaba):
 *   · venta, cheque y revivir (va Clientes): Caja E5, Gasto E7, Provisión E8 (al revivir, E4);
 *   · pagos y cobros (va Caja): Clientes E6, Gasto E7, Provisión E8;
 *   · castigo directo (va Gasto): Clientes y Caja E9, Provisión E2;
 *   · castigo con provisión (va Provisión): Gasto E1, Clientes y Caja E9;
 *   · ajuste de la provisión (va Gasto): Clientes y Caja E9, Provisión E3.
 */
const VENTA = { [A_CAJA]: "E5", [A_GASTO]: "E7", [A_PROVISION]: "E8" };
const COBRO = { [A_CLIENTES]: "E6", [A_GASTO]: "E7", [A_PROVISION]: "E8" };
const REVIVIR = { [A_CAJA]: "E5", [A_GASTO]: "E7", [A_PROVISION]: "E4" };
const DIRECTO = { [A_CLIENTES]: "E9", [A_CAJA]: "E9", [A_PROVISION]: "E2" };
const CONTRA_PROVISION = { [A_GASTO]: "E1", [A_CLIENTES]: "E9", [A_CAJA]: "E9" };
const AJUSTE = { [A_CLIENTES]: "E9", [A_CAJA]: "E9", [A_PROVISION]: "E3" };

/* ═══════════ EL BANCO: 10 HECHOS ═══════════ */

/* 3 de Cuentas por cobrar – clientes, 3 de Caja, 2 de Gasto y 2 de Provisión. */
export const HECHOS_T6_ACT4 = [
  {
    /* «La empresa» para no acortar «Comercializadora Santa Pacha»: la nota fija dice de quién son los libros. */
    id: "qd-01", respuesta: A_CLIENTES, errores: VENTA,
    texto: "El 10 de enero, la empresa le vende a crédito a La Barranquillera.",
    acierto: "Cuentas por cobrar – clientes. La deuda de La Barranquillera sube, y se debita.",
  },
  {
    id: "qd-02", respuesta: A_CAJA, errores: COBRO,
    texto: "El 25 de enero, La Barranquillera paga la factura.",
    acierto: "Caja. Entra la plata, y Caja se debita.",
  },
  {
    id: "qd-03", respuesta: A_CAJA, errores: COBRO,
    texto: "Un cliente cancela con plata la factura que tenía pendiente.",
    acierto: "Caja. La plata entra a Caja; lo que deben los clientes baja y se acredita.",
  },
  {
    id: "qd-04", respuesta: A_CLIENTES, errores: VENTA,
    texto: "Un cliente pagó con un cheque, pero el banco lo devolvió.",
    acierto: "Cuentas por cobrar – clientes. Ese pago no llegó a la empresa, así que la deuda vuelve.",
  },
  {
    id: "qd-05", respuesta: A_GASTO, errores: DIRECTO,
    texto: "Dajema castiga la deuda de Nancy Zea Cuesta con la anulación directa.",
    acierto: "Gasto provisiones – cuentas incobrables. Con la anulación directa no hay provisión: el castigo va al gasto.",
  },
  {
    id: "qd-06", respuesta: A_PROVISION, errores: CONTRA_PROVISION,
    texto: "En marzo, El Torito castiga la deuda de Pablo Moncayo. Ya tiene una provisión.",
    acierto: "Provisión para cuentas incobrables. El gasto ya se anotó en diciembre; al castigar, la provisión baja.",
  },
  {
    id: "qd-07", respuesta: A_PROVISION, errores: CONTRA_PROVISION,
    texto: "Con el método de provisiones, una empresa da por perdida la deuda de un cliente.",
    acierto: "Provisión para cuentas incobrables. Si hay provisión, el castigo va contra ella.",
  },
  {
    id: "qd-08", respuesta: A_GASTO, errores: AJUSTE,
    texto: "Al cierre del año siguiente, El Torito anota su provisión, con lo que faltó el año anterior.",
    acierto: "Gasto provisiones – cuentas incobrables. Ajustar la provisión es otro gasto del año, igual que al crearla.",
  },
  {
    id: "qd-09", respuesta: A_CLIENTES, errores: { ...REVIVIR, [A_CAJA]: "E10" },
    /* Entrega 5 de Futaba: los $180.000 y Pablo Moncayo quedan como hueco fuera de a2, a3, T6 · A3 y A4. */
    texto: "Un cliente cuya deuda ya se castigó vuelve y paga. Primero se revive su deuda.",
    acierto: "Cuentas por cobrar – clientes. Revivir es reversar el castigo: la deuda vuelve a subir.",
  },
  {
    id: "qd-10", respuesta: A_CAJA, errores: COBRO,
    texto: "Ya revivida la deuda, entra el pago del cliente.",
    acierto: "Caja. Entra la plata, y la deuda que se había revivido se cancela.",
  },
];

/* ═══════════ EL TUTORIAL: UN HECHO FUERA DEL BANCO ═══════════ */

export const EJEMPLO_T6_ACT4 = {
  id: "b5-t6-a4-tutorial", respuesta: A_GASTO, errores: AJUSTE,
  texto: "El 31 de diciembre, El Torito crea la provisión del año.",
  acierto: "Se debita Gasto provisiones – cuentas incobrables. El gasto se anota al crear la provisión, y la provisión, que sube, va al Haber.",
};

/*
 * ═══════════ EL ASIENTO MÍNIMO: LO QUE SE ACREDITA EN CADA HECHO ═══════════
 *
 * Calidad (hoja 4 de Mai): bajo el hecho, un asiento con DEBE y HABER. Lo que
 * se acredita no estaba en el contenido de a4: es la lectura de Mai, sacada de
 * las otras piezas de T6, VERIFICADA POR SHOKO contra el libro. «Ingresos por
 * ventas» y «Bancos» no son opciones: solo aparecen en el HABER, con sus
 * nombres publicados.
 *
 * qd-04 (cheque devuelto → Bancos) es una CONSTRUCCIÓN: el libro anota la nota
 * débito en Clientes (p. 197) pero no imprime el asiento con Bancos. a4 no
 * lleva pies; si algún día lo lleva, el de ese hecho dice «Basado en el
 * libro, …», nunca «Libro, p. …» (Shoko).
 */
export const SE_ACREDITA_T6_ACT4 = {
  "qd-01": INGRESOS,
  "qd-02": CLIENTES,
  "qd-03": CLIENTES,
  "qd-04": BANCOS,
  "qd-05": CLIENTES,
  "qd-06": CLIENTES,
  "qd-07": CLIENTES,
  "qd-08": PROVISION,
  "qd-09": PROVISION,
  "qd-10": CLIENTES,
  "b5-t6-a4-tutorial": PROVISION,
};

export const ALT_T6_ACT4 = "Actividad de elección. Aparece un hecho. Elige cuál de las cuatro cuentas se debita: Cuentas por cobrar – clientes, Caja, Gasto provisiones – cuentas incobrables o Provisión para cuentas incobrables. Tienes un intento por hecho, y después se lee la explicación.";
