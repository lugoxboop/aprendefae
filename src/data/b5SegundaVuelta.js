import { DEBE, HABER } from "./contabilidad.js";
import { conCambios } from "../contabilidad/b5Vuelta.js";
import {
  T5_ACT2, PARTES_T5_ACT2, COMPRA_T5_ACT2, ALT_T5_ACT2, CAJA as CAJA_T5, INVERSIONES, INTERESES, GANANCIA, PERDIDA,
} from "./contabilidadT5Act2.js";
import {
  T6_ACT2, PARTES_T6_ACT2, PREGUNTAS_T6_ACT2, PROVISION_2007_T6_ACT2, ALT_T6_ACT2, GASTO, PROVISION, CLIENTES,
} from "./contabilidadT6Act2.js";
import { PARTES_T6_ACT3, CASTIGO_T6_ACT3, ALT_T6_ACT3, CAJA, DEUDA_T6_ACT3 } from "./contabilidadT6Act3.js";
import { ESCENA_T6_A3, MOMENTOS_T6_A3 } from "./contabilidadT6Pieza3.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * D8 · LA SEGUNDA VUELTA DE LAS TRES MESAS DE B (Futaba, 17-oct; lote 18).
 *
 * b5-t5-a2 (Comercializadora El Roble), b5-t6-a2 (Distribuidora La Ceiba y
 * Hernán Ríos) y b5-t6-a3 (La Ceiba y Hernán Ríos, deuda castigada de
 * $112.000). Cifras construidas, rotuladas «Escenario simulado» en el propio
 * hecho; Futaba las cruzó contra el capítulo (pp. 176-275) y las tablas de las
 * pp. 201 y 269: ninguna coincide.
 *
 * Lo que Futaba escribió va tal cual (hechos, C, B, B específicas y las
 * razones con cifras). Lo que dijo «de hoy» se reusa con los cambios de la
 * variante (nombres, meses y la cantidad de títulos que quedan), hechos con
 * `conCambios`: así no se copia a mano ningún texto. Los ids llevan «-v2»
 * para que el registro de cada parte no se mezcle con el de hoy.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const d = (cuenta, valor) => ({ cuenta, lado: DEBE, valor });
const h = (cuenta, valor) => ({ cuenta, lado: HABER, valor });
const v2 = (parte) => ({ ...parte, id: `${parte.id}-v2` });

/* ═══════════ b5-t5-a2 · COMERCIALIZADORA EL ROBLE ═══════════ */

/* Futaba: en las razones de los asientos 3 y 4, «agosto» pasa a «junio» y «noviembre» a «septiembre». */
const CAMBIOS_T5 = [["agosto", "junio"], ["noviembre", "septiembre"], ["Santa Pacha", "El Roble"], ["625 títulos", "600 títulos"]];
const [P1_T5, P2_T5, P3_T5, P4_T5] = conCambios(PARTES_T5_ACT2, CAMBIOS_T5);

export const PARTES_V2_T5_ACT2 = [
  v2({
    ...P1_T5,
    hecho: "Escenario simulado. 1 de junio. El Roble tiene títulos por $2.280.000. Pagan un interés del 16 % al año, al terminar cada trimestre. Hoy llega a Caja el interés del primer trimestre.",
    asiento: [d(CAJA_T5, 91200), h(INTERESES, 91200)],
    errores: {
      ...P1_T5.errores,
      C: "El interés entra a Caja, que sube. Y es un ingreso, que sube por el Haber.",
      especificas: [
        { valor: 364800, clave: "B-anual", texto: "Pusiste el interés de todo el año. Aquí llega solo el de un trimestre: tres de los doce meses." },
        { valor: 30400, clave: "B-mes", texto: "Pusiste el interés de un solo mes. Aquí llega el de un trimestre: tres meses." },
      ],
      B: "Ese no es el interés de un trimestre sobre $2.280.000 al 16 % al año. Haz la cuenta por tres meses.",
    },
  }),
  v2({
    ...P2_T5,
    hecho: "Escenario simulado. 1 de junio. El Roble vende 1.800 títulos, el 75 %. Cada uno le costó $950. Los vende a $980, sin el interés. Recibe $1.764.000 en Caja.",
    asiento: [d(CAJA_T5, 1764000), h(INVERSIONES, 1710000), h(GANANCIA, 54000)],
    precio: { costo: 950, venta: 980 },
    errores: {
      ...P2_T5.errores,
      C: "Caja sube porque recibe lo de la venta. Inversiones – títulos baja porque salen títulos, y la ganancia es un ingreso.",
      C7: "Inversiones – títulos no se acredita por lo que se recibió. Se acredita por lo que costaron: 1.800 × $950 = $1.710.000. La diferencia, $54.000, es la ganancia.",
      C7otro: "Inversiones – títulos baja por lo que costaron los títulos que vendió. Son 1.800 × $950 = $1.710.000. Lo demás que recibió es la ganancia.",
      razones: {
        ...P2_T5.errores.razones,
        [INTERESES]: "El precio de $980 no incluye el interés. El interés se anota en su propio asiento.",
        [PERDIDA]: "Vendió a $980 lo que le costó $950: hay ganancia, no pérdida.",
      },
    },
  }),
  v2({
    ...P3_T5,
    hecho: "Escenario simulado. 1 de septiembre. Ya solo hay 600 títulos de $950, que suman $570.000. Llega a Caja el interés de este trimestre, al 16 % anual.",
    asiento: [d(CAJA_T5, 22800), h(INTERESES, 22800)],
    errores: {
      ...P3_T5.errores,
      C: "Como en junio: Caja recibe el interés, que es un ingreso.",
      especificas: [
        { valor: 91200, clave: "B-sin-vender", texto: "Calculaste sobre $2.280.000, pero ya vendió el 75 %. El interés de septiembre es sobre los $570.000 que quedan." },
      ],
      B: "Ese no es el interés de un trimestre sobre los $570.000 que quedan. Haz la cuenta por tres meses.",
    },
  }),
  v2({
    ...P4_T5,
    hecho: "Escenario simulado. 1 de septiembre. El Roble vende los 600 títulos que quedan. Cada uno le había costado $950. Los vende a $870 y recibe $522.000 en Caja.",
    asiento: [d(CAJA_T5, 522000), d(PERDIDA, 48000), h(INVERSIONES, 570000)],
    precio: { costo: 950, venta: 870 },
    errores: {
      ...P4_T5.errores,
      C: "Caja sube con lo que recibe. La pérdida es un gasto, y la inversión baja porque salen títulos.",
      C7: "Inversiones – títulos no se acredita por lo que se recibió. Se acredita por lo que costaron: 600 × $950 = $570.000. La diferencia, $48.000, es la pérdida.",
      C7otro: "Inversiones – títulos baja por lo que costaron los títulos que vendió. Son 600 × $950 = $570.000. Lo que le faltó para llegar a ese costo es la pérdida.",
      razones: {
        ...P4_T5.errores.razones,
        [GANANCIA]: "Vendió a $870 lo que le costó $950: hay pérdida, no ganancia.",
      },
    },
  }),
];

export const COMPRA_V2_T5_ACT2 = v2({
  ...conCambios(COMPRA_T5_ACT2, CAMBIOS_T5),
  fecha: "1 de marzo",
  hecho: "Escenario simulado. 1 de marzo. El Roble tiene efectivo de sobra por un tiempo. Compra 2.400 títulos a $950 cada uno. Paga con Bancos.",
  asiento: COMPRA_T5_ACT2.asiento.map((m) => ({ ...m, valor: 2280000 })),
  resolucion: conCambios(COMPRA_T5_ACT2.resolucion, [["2.500 × $800 = $2.000.000", "2.400 × $950 = $2.280.000"]]),
});

export const ALT_V2_T5_ACT2 = conCambios(ALT_T5_ACT2, CAMBIOS_T5);
/* El encabezado (objetivo y consigna) con el nombre de la variante; el título de la actividad es el del catálogo. */
export const T5_ACT2_V2 = conCambios(T5_ACT2, CAMBIOS_T5);
export const T5_ACT2_ID = T5_ACT2.id;

/* ═══════════ b5-t6-a2 · DISTRIBUIDORA LA CEIBA Y HERNÁN RÍOS ═══════════ */

const CAMBIOS_T6 = [
  ["Pablo Moncayo", "Hernán Ríos"], ["El Torito Currambero", "La Ceiba"], ["El Torito", "La Ceiba"],
  ["en diciembre de 2007", "en el primer diciembre"], ["en marzo", "en abril"], ["de marzo", "de abril"],
];
const [Q1, Q2, Q3] = conCambios(PREGUNTAS_T6_ACT2, CAMBIOS_T6);
const [A1, A2] = conCambios(PARTES_T6_ACT2, CAMBIOS_T6);
const [T1, T2] = Q1.errores;
const T6 = Q2.errores[1];
const T8 = A2.errores.especificas[1];

export const PREGUNTAS_V2_T6_ACT2 = [
  v2({
    ...Q1,
    enunciado: "Escenario simulado. Los clientes le deben $1.900.000, y la provisión quedó en $90.000. En el estado de situación financiera, ¿cuál es el valor neto de Cuentas por cobrar – clientes?",
    correcta: 1810000,
    errores: [{ ...T1, valor: 1900000 }, { ...T2, valor: 1990000 }],
  }),
  v2({
    ...Q2,
    correcta: 48000,
    errores: [
      { valor: 0, clave: "T5", texto: "La provisión era menor que lo castigado, así que no alcanzó. Resta $90.000 de $138.000." },
      { ...T6, valor: 228000 },
    ],
  }),
  v2({
    ...Q3,
    correcta: 110000,
    errores: [
      { valor: 158000, clave: "T9", texto: "Ese es el valor del ajuste, no el saldo. Antes del ajuste, a la provisión le faltaban $48.000." },
      { valor: 248000, clave: "T10", texto: "Falta restar el castigo de abril. Son $90.000 menos $138.000, más $158.000." },
    ],
  }),
];

export const PARTES_V2_T6_ACT2 = [
  v2({
    ...A1,
    fecha: "Abril del año siguiente",
    hecho: "Escenario simulado. Abril del año siguiente. La Ceiba da por perdida la deuda de Hernán Ríos, que es de $138.000. Ya tiene una provisión de $90.000.",
    asiento: [d(PROVISION, 138000), h(CLIENTES, 138000)],
    errores: {
      ...A1.errores,
      C: "Con el castigo bajan las dos: la provisión y lo que debe Hernán Ríos.",
      especificas: [
        { valor: 90000, clave: "C15", texto: "Usaste lo que tenía la provisión, $90.000. El castigo es por toda la deuda de Hernán Ríos, $138.000, aunque la provisión no alcance." },
      ],
      B: "Ese valor no es lo que debía Hernán Ríos, y el castigo va por toda su deuda. Míralo en el hecho.",
    },
  }),
  v2({
    ...A2,
    hecho: "Escenario simulado. Es el 31 de diciembre del año siguiente. El análisis pide $110.000. Pero en abril la provisión se quedó corta: le faltaron $48.000.",
    asiento: [d(GASTO, 158000), h(PROVISION, 158000)],
    errores: {
      ...A2.errores,
      C: "Como en el primer diciembre: el gasto sube, y la provisión también sube.",
      especificas: [
        { valor: 110000, clave: "C12", texto: "Pusiste solo lo que pide el análisis, pero en abril la provisión quedó corta. El registro también cubre lo que faltó: $110.000 + $48.000 = $158.000." },
        T8,
      ],
      B: "Ese valor no es lo que pide el análisis más lo que faltó en abril. Haz esa suma.",
    },
  }),
];

export const PASOS_V2_T6_ACT2 = [PREGUNTAS_V2_T6_ACT2[0], PARTES_V2_T6_ACT2[0], PREGUNTAS_V2_T6_ACT2[1], PARTES_V2_T6_ACT2[1], PREGUNTAS_V2_T6_ACT2[2]];

export const PROVISION_V2_T6_ACT2 = v2({
  ...PROVISION_2007_T6_ACT2,
  fecha: "31 de diciembre",
  hecho: "Escenario simulado. 31 de diciembre. La Ceiba calcula que $90.000 de lo que le deben sus clientes no se va a recuperar. Crea la provisión.",
  asiento: [d(GASTO, 90000), h(PROVISION, 90000)],
  resolucion: conCambios(PROVISION_2007_T6_ACT2.resolucion, [["$148.800", "$90.000"]]),
});

/* La Barra del valor neto, con la misma regla: la pista acaba en lo que deben los clientes (66,67 %). */
export const BARRA_V2_T6_ACT2 = { desde: 1500000, ancho: 600000, clientes: 1900000, neto: 1810000 };

/* La T y el bloque del estado de la variante: los mismos rótulos, con las fechas y las cifras de La Ceiba. */
const [M_DIC, M_MARZO, M_DIC_SIG] = MOMENTOS_T6_A3;
export const MOMENTOS_V2_T6_ACT2 = [
  { ...M_DIC, nombre: "31 de diciembre", monto: "$90.000", saldo: { texto: "El saldo queda en $90.000", enContra: false } },
  { ...M_MARZO, nombre: "Abril del año siguiente", monto: "$138.000", saldo: { texto: "Le faltan $48.000", enContra: true } },
  { ...M_DIC_SIG, monto: "$158.000", saldo: { texto: "El saldo queda en $110.000", enContra: false } },
];
export const ESCENA_V2_T6_ACT2 = { ...ESCENA_T6_A3, saldoClientes: "$1.900.000", menos: "− $90.000", valorNeto: "$1.810.000" };

export const ALT_V2_T6_ACT2 = conCambios(ALT_T6_ACT2, CAMBIOS_T6);
export const T6_ACT2_V2 = conCambios(T6_ACT2, CAMBIOS_T6);

/* ═══════════ b5-t6-a3 · LA CEIBA Y HERNÁN RÍOS: LA DEUDA CASTIGADA DE $112.000 ═══════════ */

/* «Las C y las razones de la D son las de hoy: no llevan cifras ni nombres» (Futaba). */
const [R1, R2, R3, R4, R5] = conCambios(PARTES_T6_ACT3, CAMBIOS_T6);

export const PARTES_V2_T6_ACT3 = [
  v2({
    ...R1,
    hecho: "Escenario simulado. Caso a. Un tiempo después del castigo, Hernán Ríos vuelve y paga toda la factura: $112.000.",
    asiento: [d(CLIENTES, 112000), h(PROVISION, 112000)],
  }),
  v2({
    ...R2,
    hecho: "Escenario simulado. Caso a. La deuda ya se revivió. Ahora entran a Caja los $112.000 que pagó Hernán Ríos.",
    asiento: [d(CAJA, 112000), h(CLIENTES, 112000)],
    errores: { ...R2.errores, B: "A Caja entra lo que pagó Hernán Ríos, que es toda la factura. Ese valor no coincide." },
  }),
  v2({
    ...R3,
    hecho: "Escenario simulado. Caso b. Un tiempo después del castigo, Hernán Ríos abona $46.000 y promete pagar el resto.",
    asiento: [d(CLIENTES, 112000), h(PROVISION, 112000)],
    errores: {
      ...R3.errores,
      especificas: [{ valor: 46000, clave: "C14", texto: "Reviviste solo el abono. Como Hernán Ríos promete pagar el resto, se revive toda la deuda." }],
    },
  }),
  v2({
    ...R4,
    hecho: "Escenario simulado. Caso b. La deuda ya se revivió. Ahora entran a Caja los $46.000 del abono.",
    asiento: [d(CAJA, 46000), h(CLIENTES, 46000)],
    errores: {
      ...R4.errores,
      especificas: [{ ...R4.errores.especificas[0], valor: 112000 }],
      B: "A Caja entra solo el abono de Hernán Ríos, y ese valor no lo es. Míralo en el hecho.",
    },
  }),
  v2({
    ...R5,
    hecho: "Escenario simulado. Caso c. Un tiempo después del castigo, Hernán Ríos abona $46.000 y avisa que ya no puede pagar más.",
    asiento: [d(CLIENTES, 46000), h(PROVISION, 46000)],
    errores: {
      ...R5.errores,
      especificas: [{ valor: 112000, clave: "C14", texto: "Reviviste toda la deuda. Como Hernán Ríos ya no puede pagar más, se revive solo lo que pagó." }],
      B: "En el caso c se revive solo lo que pagó Hernán Ríos, y ese valor no lo es.",
    },
  }),
];

export const CASTIGO_V2_T6_ACT3 = v2({
  ...CASTIGO_T6_ACT3,
  fecha: "Mayo",
  hecho: "Escenario simulado. Mayo. La Ceiba castiga la deuda de Hernán Ríos, que es de $112.000. Usa la provisión.",
  asiento: [d(PROVISION, 112000), h(CLIENTES, 112000)],
  resolucion: conCambios(CASTIGO_T6_ACT3.resolucion, [["$180.000", "$112.000"]]),
});

export const ALT_V2_T6_ACT3 = conCambios(ALT_T6_ACT3, CAMBIOS_T6);
/* Lote 20 (D9): «La deuda de Hernán Ríos». */
export const DEUDA_V2_T6_ACT3 = conCambios(DEUDA_T6_ACT3, CAMBIOS_T6);
