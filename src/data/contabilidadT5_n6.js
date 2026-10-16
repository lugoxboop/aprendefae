import { DEBE, HABER } from "./contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N6 DE APRENDER — «Lo que el ejemplo no trae» (p. 193). Célula C.
 *
 * Fuente: la v2 de Near, con el canon C1–C8, copia en
 * orquestador/conocimiento/paquetes/t5-n6-lo-que-el-ejemplo-no-trae-v2.md, y
 * las correcciones obligatorias de Mello (N6-1 y N6-2) de
 * paquetes/auditoria-mello-n6-n7-v2-y-enganche-v5.md. El paquete queda como
 * llegó; la prueba le aplica las correcciones
 * (__tests__/correccionesMelloN6.mjs) y compara cada texto de aquí contra esa
 * versión, letra por letra, en los dos sentidos.
 *
 * Pieza de Aprender: cero FP, no entra al catálogo de FP ni lleva migración.
 * Posición 9 de 11 en T5 (decisión de corte v1.1, punto 6). Sostiene a N7.
 * Lo nuevo es solo esto: los gastos del proceso de la compra se suman al
 * costo (p. 193), y el dividendo se anota cuando llega: Caja contra Ingresos
 * por dividendos (nombre de la decisión de corte, punto 5).
 *
 * [CONSTRUCCIÓN, dicho en el pie, no en el texto] Yarumo y todas sus cifras
 * son construidos: «Ejemplo construido · basado en el libro, p. 193» va en
 * el pie de cada pantalla con cifras (P1 a P4). La portada no tiene cifras
 * y va sin pie: el paquete solo da ese pie. El depósito de $11.000 es el
 * caso que aplica la condición de la p. 193; HUECO, dicho en pantalla: el
 * libro no dice a qué cuenta va ese gasto (acierto de P2).
 *
 * LA CONDICIÓN NO SE PLIEGA (regla C7): ningún texto de esta pieza va detrás
 * de un «¿Por qué?». Los textos ya vienen medidos por Near.
 *
 * LA ESCALERA, como la pide el paquete: 1.er error → la pista; 2.º error →
 * el texto «2.º error» de la opción elegida, y la pregunta se cierra con la
 * respuesta marcada; acierto → el acierto. La figura crece con el acierto o
 * con el 2.º error («La figura», tabla del paquete).
 *
 * LAS CIFRAS (registro de T5, regla 5c) van como números, no solo en texto:
 * la prueba del registro las busca aquí. Las cuentas cuadran:
 * 1.210.000 + 18.000 = 1.228.000.
 *
 * Lo que el paquete no trae y se toma de A7 de T7-1 (como N2): los botones
 * «Empezar», «Seguir», «Confirmar» y «Probar otra», y «Correcto.» e
 * «Incorrecto.».
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const N6_ID = "t5-a2-lo-que-el-ejemplo-no-trae";

export const BOTON = { empezar: "Empezar", seguir: "Seguir", confirmar: "Confirmar", probarOtra: "Probar otra" };
export const INTERFAZ = { correcto: "Correcto.", incorrecto: "Incorrecto.", debe: "Debe", haber: "Haber" };

export const PIE = "Ejemplo construido · basado en el libro, p. 193";

/* Las cifras construidas de Yarumo. */
export const ACCIONES_N6 = 1210000;
export const GASTOS_N6 = 18000;
export const COSTO_N6 = ACCIONES_N6 + GASTOS_N6;
export const DIVIDENDO_N6 = 54000;
export const DEPOSITO_N6 = 11000;
export const CIFRAS_N6 = { acciones: ACCIONES_N6, gastos: GASTOS_N6, costo: COSTO_N6, dividendo: DIVIDENDO_N6, deposito: DEPOSITO_N6 };

/* Las cuatro cuentas T de Yarumo, en el orden del paquete. */
export const CUENTAS_N6 = [
  { id: "inversiones", nombre: "Inversiones – títulos" },
  { id: "bancos", nombre: "Bancos" },
  { id: "caja", nombre: "Caja" },
  { id: "dividendos", nombre: "Ingresos por dividendos" },
];

/* Lo que se anota en ellas: la compra (P1) y el dividendo (P3). */
export const MOVIMIENTOS_N6 = {
  "compra-debe": { cuenta: "inversiones", lado: DEBE, monto: COSTO_N6 },
  "compra-haber": { cuenta: "bancos", lado: HABER, monto: COSTO_N6 },
  "dividendo-debe": { cuenta: "caja", lado: DEBE, monto: DIVIDENDO_N6 },
  "dividendo-haber": { cuenta: "dividendos", lado: HABER, monto: DIVIDENDO_N6 },
};

/*
 * La figura de cada pantalla, completa (no depende de las anteriores):
 *   movimientos   lo anotado al llegar
 *   factura       (P1) sus renglones, sin la suma (E8)
 *   ficha         (P2) lo que espera al lado de una cuenta
 *   alResolver    lo que cambia con el acierto o con el 2.º error: los
 *                 movimientos nuevos, la factura que se pliega dentro de la
 *                 cuenta, la ficha que rebota y sale, y una nota
 */

/* P0 · Portada: las cuentas vacías y atenuadas. */
const PORTADA = {
  id: "portada",
  tipo: "portada",
  figura: { movimientos: [] },
  parrafos: ["Yarumo compra acciones y paga gastos para hacer la compra. Después, las acciones le dan algo. Vas a ver a qué cuenta va cada cosa."],
  boton: BOTON.empezar,
  pie: null,
};

/* P1 · La compra. La regla llega después de la pregunta (abrir con el error típico). */
const LA_COMPRA = {
  id: "la-compra",
  tipo: "eleccion",
  figura: {
    movimientos: [],
    factura: [
      { rot: "Acciones", monto: ACCIONES_N6 },
      { rot: "Gastos de la compra", monto: GASTOS_N6 },
    ],
    alResolver: { movimientos: ["compra-debe", "compra-haber"], factura: "pliega" },
  },
  parrafos: ["Yarumo tiene efectivo de sobra y compra acciones de otra empresa. Esta es la factura."],
  pregunta: "¿Por cuánto entra la compra a Inversiones – títulos?",
  opciones: [
    { id: "costo", texto: "$1.228.000", valor: COSTO_N6, correcta: true },
    { id: "precio", texto: "$1.210.000", valor: ACCIONES_N6, correcta: false, segundoError: "Ese es solo el precio. El libro suma «los gastos en que se incurre para el proceso de la compra» (p. 193)." },
    { id: "gastos", texto: "$18.000", valor: GASTOS_N6, correcta: false, segundoError: "Esos son solo los gastos. El libro los suma al precio: no lo reemplazan." },
  ],
  pista: "Mira todo lo que tuvo que pagar Yarumo para hacer la compra, no solo el precio.",
  acierto: { texto: "Así es. El libro suma «los gastos en que se incurre para el proceso de la compra» (p. 193)." },
  pie: PIE,
};

/* P2 · El límite (C7): un gasto que no entra. Corrección N6-1 de Mello: la condición es para qué se pagó, no cuándo. */
const EL_LIMITE = {
  id: "el-limite",
  tipo: "eleccion",
  figura: {
    movimientos: ["compra-debe", "compra-haber"],
    ficha: { rot: "Depósito", monto: DEPOSITO_N6, junto: "inversiones" },
    alResolver: { movimientos: [], ficha: "sale", nota: { cuenta: "inversiones", texto: "sigue en", monto: COSTO_N6 } },
  },
  parrafos: ["Un año después, Yarumo le paga a un depósito para que le guarde las acciones."],
  pregunta: "¿Ese gasto se suma a Inversiones – títulos?",
  opciones: [
    { id: "no", texto: "No: no fue para comprarlas.", correcta: true },
    { id: "si-inversion", texto: "Sí: es de la inversión.", correcta: false, segundoError: "No se suma. El libro solo suma los gastos del proceso de la compra, y este se pagó por guardarlas." },
    { id: "si-cuida", texto: "Sí: cuida las acciones.", correcta: false, segundoError: "No se suma. El libro solo suma los gastos del proceso de la compra, y este se pagó por guardarlas." },
  ],
  pista: "Piensa para qué se pagó ese gasto. ¿Hizo falta para comprar las acciones?",
  acierto: { texto: "Así es: solo van al costo los gastos del proceso de la compra. El libro no dice dónde va este." },
  pie: PIE,
};

/* P3 · El dividendo. Corrección N6-2 de Mello: el caso y la pista no dicen «dividendos». */
const EL_DIVIDENDO = {
  id: "el-dividendo",
  tipo: "eleccion",
  figura: {
    movimientos: ["compra-debe", "compra-haber", "dividendo-debe"],
    alResolver: { movimientos: ["dividendo-haber"] },
  },
  parrafos: ["Más tarde, la empresa de esas acciones reparte entre sus dueños una parte de lo que ganó. A Yarumo le llega su parte en efectivo."],
  pregunta: "¿Qué cuenta se acredita?",
  opciones: [
    { id: "dividendos", texto: "Ingresos por dividendos", correcta: true },
    { id: "inversiones", texto: "Inversiones – títulos", correcta: false, segundoError: "Yarumo sigue con sus acciones, así que la inversión no cambia. El dividendo va a Ingresos por dividendos." },
    { id: "intereses", texto: "Ingresos por intereses", correcta: false, segundoError: "Las acciones dan dividendo, no interés. El dividendo va a Ingresos por dividendos." },
  ],
  pista: "Lo que llega no devuelve parte de lo invertido: es lo que las acciones rindieron.",
  acierto: { texto: "Así es. Eso es un dividendo y se anota cuando llega: Caja se debita y se acredita Ingresos por dividendos." },
  pie: PIE,
};

/* P4 · Resumen, sin botón. La línea 1 es la de Mello (N6-1). La condición está aquí, a la vista de todos. */
const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  figura: { movimientos: ["compra-debe", "compra-haber", "dividendo-debe", "dividendo-haber"] },
  parrafos: [
    "Los gastos del proceso de la compra van al costo de la inversión. Lo que se paga por otra cosa, como guardarlas, no.",
    "El dividendo se anota cuando llega. Entra a Caja y va al haber de Ingresos por dividendos.",
    "La renta con descuento la viste en «¿Qué renta da este título?».",
  ],
  boton: null,
  pie: PIE,
};

export const PIEZA_LO_QUE_EL_EJEMPLO_NO_TRAE = {
  id: N6_ID,
  titulo: "Lo que el ejemplo no trae",
  cuentas: CUENTAS_N6,
  movimientos: MOVIMIENTOS_N6,
  pantallas: [PORTADA, LA_COMPRA, EL_LIMITE, EL_DIVIDENDO, RESUMEN],
};
