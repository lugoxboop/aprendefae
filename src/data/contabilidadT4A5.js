/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A5 DE APRENDER — «San Calixto» (Célula D). REDISEÑO DE ENGANCHE.
 *
 * Diseño: Hanayama, «el par que el estudiante iguala» (celula-d/hanayama-a5-
 * rediseno.md), aprobado por Yujiro en su corte de calidad del 15 oct 2026:
 * un lado por pantalla. Textos: Katsumi (celula-d/katsumi-texto-a2-a5.md),
 * aprobados tal cual. Copia en el canon: orquestador/conocimiento/paquetes/
 * d4-t4-a5-v3-rediseno.md. Una prueba compara cada texto de aquí contra ella.
 *
 * Siete pantallas (la pila tenía diez); en cinco el estudiante mueve la
 * figura: iguala el lado del banco y el de la empresa (cada partida a «Más» o
 * a «Menos», y el saldo de ese lado cuenta hasta su valor nuevo; con los dos
 * en 4.612.600 aparece el «=»), decide si el cheque sin cobrar se asienta,
 * recorre los cinco asientos y asienta las notas en el mayor.
 *
 * Cifras del libro (pp. 189-191): los dos saldos, las cinco partidas de cada
 * lado y los cinco asientos. La diferencia (1.937.500), los saldos de cada
 * paso y el saldo conciliado (4.612.600) SE CALCULAN. Cheques sin número (E3);
 * cuentas con los nombres ya publicados (C1-C3).
 *
 * Aprender: sin FP, sin catálogo y sin llamar al motor.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { BOTON } from "./contabilidadT4.js";

export const A5_ID = "t4-a5-san-calixto";

/* ═══════════ LAS CIFRAS ═══════════ */

/* Datos de la p. 189. */
export const EXTRACTO = 2_435_600;
export const LIBROS = 4_373_100;

export const MAS = "mas";
export const MENOS = "menos";

/* P1 · el lado del banco: lo que la empresa ya anotó y el banco todavía no (p. 189), en el orden de las tarjetas. */
export const PARTIDAS_BANCO = [
  { id: "lorena", texto: "Cheque a Lorena Guerra, sin cobrar", monto: 156_000, va: MENOS },
  { id: "consignacion", texto: "Consignación del 31 de marzo, sin abonar", monto: 2_758_000, va: MAS },
  { id: "steffany", texto: "Cheque a Steffany Herrera, sin cobrar", monto: 203_000, va: MENOS },
  { id: "angelica", texto: "Cheque a Angélica Garrido, sin cobrar", monto: 97_000, va: MENOS },
  { id: "laura", texto: "Cheque a Laura García, sin cobrar", monto: 125_000, va: MENOS },
];
/* P2 · el lado de la empresa: las notas del banco que sus libros todavía no tienen (p. 189). */
export const PARTIDAS_EMPRESA = [
  { id: "efrain", texto: "Nota crédito del banco: pago de Efraín Martínez", monto: 645_000, va: MAS },
  { id: "chequera", texto: "Nota débito del banco: chequera", monto: 43_500, va: MENOS },
  { id: "inversion", texto: "Nota crédito del banco: intereses de una inversión", monto: 342_000, va: MAS },
  { id: "sobregiro", texto: "Nota débito del banco: intereses de sobregiro", monto: 236_000, va: MENOS },
  { id: "humberto", texto: "Nota débito del banco: cheque devuelto de Humberto Gómez", monto: 468_000, va: MENOS },
];

/* El saldo de un lado tras poner las primeras `n` partidas. */
export const saldoTrasA5 = (inicial, partidas, n) => partidas.slice(0, n).reduce((s, x) => s + (x.va === MAS ? x.monto : -x.monto), inicial);

/* Se calculan, no se transcriben. */
export const DIFERENCIA_INICIAL = LIBROS - EXTRACTO;
export const CONCILIADO_BANCO = saldoTrasA5(EXTRACTO, PARTIDAS_BANCO, PARTIDAS_BANCO.length);
export const CONCILIADO_LIBROS = saldoTrasA5(LIBROS, PARTIDAS_EMPRESA, PARTIDAS_EMPRESA.length);
export const CONCILIADO = CONCILIADO_LIBROS;

/* La tarjeta de P3: la misma del cheque de Lorena Guerra en P1. */
export const CHEQUE_P3 = PARTIDAS_BANCO[0];

/* ═══════════ LOS CINCO ASIENTOS (p. 191, del 31 de marzo) ═══════════ */

export const FECHA_ASIENTOS = "31 de marzo";
const CUENTAS = {
  bancos: ["Bancos"],
  cxc: ["Cuentas por", "cobrar", "– clientes"],
  intereses: ["Ingresos", "por intereses"],
  chequera: ["Gastos", "financieros", "– chequera"],
  interes: ["Gasto interés"],
};
/*
 * En el orden de los botones 1 a 5 (el de la p. 191). `linea`: la que va
 * encima del tablero y dice de qué nota es (Katsumi, decisión 8).
 */
export const ASIENTOS_A5 = [
  { id: "efrain", debe: "bancos", haber: "cxc", monto: 645_000, linea: "Pago de Efraín Martínez: ya no debe esa factura." },
  { id: "inversion", debe: "bancos", haber: "intereses", monto: 342_000, linea: "Intereses de la inversión: un ingreso." },
  { id: "chequera", debe: "chequera", haber: "bancos", monto: 43_500, linea: "Chequera: un gasto financiero." },
  { id: "sobregiro", debe: "interes", haber: "bancos", monto: 236_000, linea: "Intereses de sobregiro: por sacar más plata de la que había." },
  { id: "humberto", debe: "cxc", haber: "bancos", monto: 468_000, linea: "Cheque devuelto: Humberto Gómez vuelve a deber." },
].map((a) => ({ ...a, cuentas: [{ id: a.debe, renglones: CUENTAS[a.debe] }, { id: a.haber, renglones: CUENTAS[a.haber] }] }));

/* El mayor de Bancos (P5): lo que entra al debe, lo que sale por el haber y el saldo. */
export const SALDO_MAYOR = ASIENTOS_A5.reduce((s, a) => s + (a.debe === "bancos" ? a.monto : a.haber === "bancos" ? -a.monto : 0), LIBROS);
/* P5: una nota cada 350 ms (Hanayama §3.4); con movimiento reducido, todas de una vez. */
export const PASO_MAYOR_MS = 350;

/* ═══════════ LA FIGURA ═══════════ */

export const FIGURA_A5 = {
  banco: "el banco",
  empresa: "la empresa",
  mas: "Más",
  menos: "Menos",
  fin: "Las cinco están puestas.",
  chips: { si: "Se asienta", no: "No se asienta" },
  /* El nombre del grupo de opciones de P3, para el lector (Katsumi). */
  asienta: "¿Se asienta este cheque?",
  asentar: "Asentar las cinco notas",
  mayor: "Bancos · 31 de marzo",
  saldo: "Saldo",
  /* Para el lector de pantalla (los del prototipo de Hanayama): el nombre de cada sección y de los botones. */
  seccion: (rotulo, lado) => `${rotulo}, ${rotulo === "Más" ? "se suma al" : "se resta del"} saldo ${lado === "banco" ? "del banco" : "de la empresa"}`,
  asientos: "Los cinco asientos",
  tablero: "El asiento",
};

/* ═══════════ LAS PANTALLAS ═══════════ */

/*
 * `modo`: par (P0 y P6: el par, para leer), lado (P1 y P2: el juego de mandar
 * a un lado, sin mensaje de error a la vista: «✗ No va aquí» en la sección y
 * «Incorrecto.» solo para el lector), asienta (P3), asientos (P4) y mayor (P5).
 * `pregunta`: «Seguir» no aparece hasta el acierto; en P1 y P2, hasta la
 * quinta partida. Sin «Siguiente»: es la última pieza de Aprender del tema.
 */
export const PANTALLAS_A5 = [
  {
    id: "dos-saldos", modo: "par",
    antes: ["La Compañía San Calixto Ltda. revisa su cuenta bancaria al 31 de marzo. El extracto y sus libros no coinciden: difieren en $1.937.500."],
    despues: ["Para igualarlos, a cada lado se le ajusta lo que todavía no sabe."],
    alt: "El saldo del banco, 2.435.600, y el de la empresa, 4.373.100. No son iguales.",
    pie: "Basado en el libro, p. 189",
  },
  {
    id: "lado-del-banco", modo: "lado", pregunta: true, lado: "banco",
    antes: ["Primero, el lado del banco: lo que la empresa ya anotó y el banco todavía no."],
    alt: "Cada partida del lado del banco se manda a Más o a Menos, y el saldo del banco cambia con cada una.",
    pie: "Basado en el libro, pp. 189-190",
  },
  {
    id: "lado-de-la-empresa", modo: "lado", pregunta: true, lado: "empresa",
    antes: ["Ahora el lado de la empresa: las notas del banco que sus libros todavía no tienen."],
    alt: "Cada nota del banco se manda a Más o a Menos, y el saldo de la empresa cambia con cada una. Cuando los dos saldos son iguales, aparece el signo igual.",
    pie: "Basado en el libro, pp. 189-190",
  },
  {
    id: "que-se-asienta", modo: "asienta", pregunta: true, opciones: ["si", "no"], correcta: "no",
    antes: ["Lo que importa es dejar Bancos en su valor verdadero: la empresa solo asienta lo que le falta. ¿Y este cheque?"],
    acierto: "La empresa ya lo anotó al girarlo.",
    errores: { si: "Quedaría anotado dos veces en sus libros." },
    alt: "El cheque a Lorena Guerra, de 156.000, sin cobrar, y dos botones: se asienta o no se asienta.",
    pie: "Basado en el libro, p. 190",
  },
  {
    id: "los-asientos", modo: "asientos",
    antes: ["Cada nota del banco lleva su asiento, del 31 de marzo. Toca cada número."],
    alt: "Cinco botones. Cada uno muestra el asiento de una nota del banco: la cifra va al debe de una cuenta y al haber de la otra.",
    pie: "Basado en el libro, p. 191",
  },
  {
    id: "el-mayor", modo: "mayor",
    antes: ["Pasa las cinco notas al mayor de Bancos. ¿A qué saldo llega?"],
    alt: "El mayor de Bancos empieza en 4.373.100. Al asentar las cinco notas, suben 645.000 y 342.000, bajan 43.500, 236.000 y 468.000, y el saldo llega a 4.612.600.",
    pie: "Basado en el libro, p. 191",
  },
  {
    id: "resumen", modo: "par", igualado: true,
    resumen: [
      "Al extracto: más lo consignado sin abonar, menos los cheques sin cobrar.",
      "A los libros: más las notas crédito, menos las notas débito.",
      "Los dos dan el mismo saldo conciliado, y solo se asientan las notas del banco.",
    ],
    alt: "Los dos saldos, iguales: 4.612.600.",
    pie: "Basado en el libro, pp. 189-191",
  },
];

export const PIEZA_SAN_CALIXTO = {
  id: A5_ID,
  numero: 5,
  titulo: "San Calixto",
  boton: BOTON.seguir,
  pantallas: PANTALLAS_A5,
};

