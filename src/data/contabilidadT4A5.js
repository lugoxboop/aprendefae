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
import { BOTON, pieCasoB } from "./contabilidadT4.js";

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
/* P4 (lote B, §5.5): con el acierto, la nota siguiente llega a los 1,4 s, como los cheques de A1. No es animación: se mantiene con movimiento reducido. */
export const ESPERA_NOTA_MS = 1400;
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
  /* Lote B, §2.1 y §5.3 (Katsumi): la línea al pie del par, las tres opciones y el tercer lugar del par. */
  difieren: (n) => `difieren en ${n}`,
  opcionesSaldo: { banco: "el banco", empresa: "la empresa", ninguno: "ninguno todavía" },
  verdadero: "saldo verdadero:",
  verdaderoLector: "saldo verdadero: todavía no se sabe",
  /* Lote B, §5.5: el contador de las notas (Hanayama). */
  contadorNota: (n, total) => `Nota ${n} de ${total}`,
};

/* ═══════════ LAS PANTALLAS ═══════════ */

/*
 * `modo`: saldo (P0, la pregunta del saldo verdadero), lado (P1 y P2: el juego
 * de mandar a un lado, sin mensaje de error a la vista: «No va aquí» en la
 * sección y «Incorrecto.» solo para el lector), asienta (P3), asientos (P4: el
 * lado de Bancos en cada nota) y mayor (P5, la última, con la frase de cierre).
 * Lote B: seis pantallas. `pregunta`: «Seguir» no aparece hasta el acierto; en
 * los juegos, hasta el último. Sin «Siguiente»: es la última pieza del tema.
 */
export const PANTALLAS_A5 = [
  {
    /*
     * Lote B (§2.1 y §5.3): abre con el par, que lleva al pie «difieren en
     * 1.937.500»; el caso va debajo, desde el principio, y luego la pregunta:
     * ¿cuál es el saldo verdadero? Con el acierto, el par abre su tercer
     * lugar, «saldo verdadero: ?», que se llena en P2 cuando sale el «=».
     */
    id: "dos-saldos", modo: "saldo", pregunta: true,
    caso: "San Calixto, 31 de marzo.",
    rotuloPregunta: "¿Cuál es el saldo verdadero?",
    opciones: ["banco", "empresa", "ninguno"], correcta: "ninguno",
    acierto: "A cada lado le falta anotar algo.",
    errores: {
      banco: "Al extracto le falta lo que la empresa ya anotó.",
      empresa: "A los libros les faltan las notas del banco.",
    },
    alt: "El saldo del banco, 2.435.600, y el de la empresa, 4.373.100, difieren en 1.937.500. Debajo, tres opciones sobre cuál es el saldo verdadero.",
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
    /* Lote B, §5.5: en cada nota se decide de qué lado va Bancos (elegir las dos cuentas es de H8); el toque califica en el acto. */
    id: "los-asientos", modo: "asientos", pregunta: true,
    antes: ["Cada nota mueve Bancos. ¿Al debe o al haber?"],
    error: "¿La plata entró a la cuenta o salió?",
    alt: "Una nota del banco a la vez. Se pone Bancos al debe o al haber, y con el acierto el asiento se escribe con su otra cuenta.",
    pie: "Basado en el libro, p. 191",
  },
  {
    id: "el-mayor", modo: "mayor",
    antes: ["Pasa las notas al mayor."],
    /* Lote B, capa 4: con las cinco asentadas, bajo el mayor el par igualado y la frase de cierre. Sin «Siguiente»: es la última pieza de Aprender del tema. */
    cierre: "Los dos lados llegan al mismo saldo conciliado; solo se asientan las notas del banco.",
    alt: "El mayor de Bancos empieza en 4.373.100. Al asentar las cinco notas, suben 645.000 y 342.000, bajan 43.500, 236.000 y 468.000, y el saldo llega a 4.612.600. Debajo, el banco y la empresa quedan iguales.",
    pie: "Basado en el libro, p. 191",
  },
];

/*
 * D8 · el caso B (Katsumi, lote nocturno): San Calixto se queda (es el
 * título) y pasa al 30 de abril, con otras personas y cifras construidas:
 * extracto 3.120.400, libros 4.708.300, difieren en 1.587.900 y los dos
 * llegan a 4.912.400. Las partidas, en el mismo orden, con los mismos lados;
 * los asientos, los mismos con las cifras del B. La misma decisión en cada
 * pantalla; los pies, con « · Cifras construidas».
 */
export const EXTRACTO_B = 3_120_400;
export const LIBROS_B = 4_708_300;
const conB = (partidas, nuevas) => partidas.map((x, i) => ({ ...x, ...nuevas[i] }));
export const PARTIDAS_BANCO_B = conB(PARTIDAS_BANCO, [
  { texto: "Cheque a Marcela Ruiz, sin cobrar", monto: 184_000 },
  { texto: "Consignación del 30 de abril, sin abonar", monto: 2_415_000 },
  { texto: "Cheque a Diego Peña, sin cobrar", monto: 211_000 },
  { texto: "Cheque a Sara Mejía, sin cobrar", monto: 88_000 },
  { texto: "Cheque a Iván Rojas, sin cobrar", monto: 140_000 },
]);
export const PARTIDAS_EMPRESA_B = conB(PARTIDAS_EMPRESA, [
  { texto: "Nota crédito del banco: pago de Hernán Castro", monto: 512_000 },
  { texto: "Nota débito del banco: chequera", monto: 38_900 },
  { texto: "Nota crédito del banco: intereses de una inversión", monto: 296_000 },
  { texto: "Nota débito del banco: intereses de sobregiro", monto: 175_000 },
  { texto: "Nota débito del banco: cheque devuelto de Pilar Vega", monto: 390_000 },
]);
const LINEAS_B = { efrain: "Pago de Hernán Castro: ya no debe esa factura.", humberto: "Cheque devuelto: Pilar Vega vuelve a deber." };
const ASIENTOS_A5_B = ASIENTOS_A5.map((a) => ({ ...a, monto: PARTIDAS_EMPRESA_B.find((x) => x.id === a.id).monto, linea: LINEAS_B[a.id] ?? a.linea }));
function datosA5(extracto, libros, banco, empresa, asientos, f) {
  const conciliadoBanco = saldoTrasA5(extracto, banco, banco.length);
  const conciliado = saldoTrasA5(libros, empresa, empresa.length);
  return {
    EXTRACTO: extracto, LIBROS: libros, PARTIDAS_BANCO: banco, PARTIDAS_EMPRESA: empresa, ASIENTOS_A5: asientos,
    CONCILIADO_BANCO: conciliadoBanco, CONCILIADO: conciliado, CHEQUE_P3: banco[0], DIFERENCIA_INICIAL: libros - extracto,
    SALDO_MAYOR: asientos.reduce((s, a) => s + (a.debe === "bancos" ? a.monto : a.haber === "bancos" ? -a.monto : 0), libros),
    F: f,
  };
}
/* Lo que la figura muestra en cada caso. */
export const DATOS_A5 = {
  1: datosA5(EXTRACTO, LIBROS, PARTIDAS_BANCO, PARTIDAS_EMPRESA, ASIENTOS_A5, FIGURA_A5),
  2: datosA5(EXTRACTO_B, LIBROS_B, PARTIDAS_BANCO_B, PARTIDAS_EMPRESA_B, ASIENTOS_A5_B, { ...FIGURA_A5, mayor: "Bancos · 30 de abril" }),
};
const TEXTOS_A5_B = {
  "dos-saldos": { caso: "San Calixto, 30 de abril.", alt: "El saldo del banco, 3.120.400, y el de la empresa, 4.708.300, difieren en 1.587.900. Debajo, tres opciones sobre cuál es el saldo verdadero." },
  "que-se-asienta": { alt: "El cheque a Marcela Ruiz, de 184.000, sin cobrar, y dos botones: se asienta o no se asienta." },
  "el-mayor": { alt: "El mayor de Bancos empieza en 4.708.300. Al asentar las cinco notas, suben 512.000 y 296.000, bajan 38.900, 175.000 y 390.000, y el saldo llega a 4.912.400. Debajo, el banco y la empresa quedan iguales." },
};
const PANTALLAS_A5_B = PANTALLAS_A5.map((p) => ({ ...p, ...(TEXTOS_A5_B[p.id] ?? {}), pie: pieCasoB(p.pie) }));

export const PIEZA_SAN_CALIXTO = {
  id: A5_ID,
  numero: 5,
  titulo: "San Calixto",
  /* D2 (Shibukawa; Yujiro): el objetivo de la pieza, una línea fija bajo el título en la P0 (Katsumi). */
  objetivo: "Conciliar los saldos y asentar las notas.",
  boton: BOTON.seguir,
  pantallas: PANTALLAS_A5,
};
PIEZA_SAN_CALIXTO.casoB = { ...PIEZA_SAN_CALIXTO, pantallas: PANTALLAS_A5_B };

