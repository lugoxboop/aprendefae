/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A5 DE APRENDER — «San Calixto» (Célula D).
 *
 * Fuente: el paquete vigente de Katsumi, orquestador/conocimiento/paquetes/
 * d4-t4-a5-v1.md, que ya trae la parte de A5 de d4-t4-a5-h8-v2-cambios.md
 * (A5-a y A5-b) y el cambio del 15 de octubre en P3 («Es el saldo
 * conciliado del banco.»). El archivo de cambios se queda como registro. Es
 * el mismo blob que en la punta de feat/conta-d4-mapa-fuente. Una prueba
 * compara cada texto de aquí contra él, letra por letra.
 *
 * Cifras (pp. 189-191). Los datos del libro son los dos saldos, los cuatro
 * cheques, la consignación y las cinco notas. Todo lo demás SE CALCULA:
 *   · cheques sin cobrar: 156.000 + 203.000 + 97.000 + 125.000 = 581.000
 *   · banco conciliado: 2.435.600 + 2.758.000 − 581.000 = 4.612.600
 *   · notas crédito: 645.000 + 342.000 = 987.000
 *   · notas débito: 43.500 + 236.000 + 468.000 = 747.500
 *   · libros conciliados: 4.373.100 + 987.000 − 747.500 = 4.612.600
 *   · mayor: 4.373.100 + 645.000 + 342.000 = 5.360.100; − 747.500 = 4.612.600
 *   · la diferencia de P1, de Katsumi: 4.373.100 − 2.435.600 = 1.937.500
 * Sin números de cheque (E3 / D4-5): cada cheque va por beneficiario y valor.
 *
 * La figura es «La conciliación de dos lados» de Hanayama (A5 v1 con la
 * v1.1 y la v1.2 encima): el par «el banco / la empresa», un lado por
 * pantalla, los dos en P6, las cinco notas (P7) y el mayor (P8). La figura
 * PINTA las tablas del paquete (los cheques de P2, las notas de P7 y el
 * mayor de P8): no se repiten en otra tabla. Una prueba compara cada fila
 * de esas tablas con lo que pinta la figura.
 *
 * Aprender: sin FP, sin catálogo y sin llamar al motor.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { BOTON, DEBE, HABER } from "./contabilidadT4.js";

export const A5_ID = "t4-a5-san-calixto";

/* ═══════════ LAS CIFRAS ═══════════ */

/* Datos de la p. 189. */
export const EXTRACTO = 2_435_600;
export const LIBROS = 4_373_100;
export const CONSIGNACION_EN_TRANSITO = 2_758_000;

/* Los cuatro cheques que nadie ha cobrado (p. 189), por beneficiario y valor: sin número (E3). */
export const CHEQUES_A5 = [
  { beneficiario: "Lorena Guerra", monto: 156_000 },
  { beneficiario: "Steffany Herrera", monto: 203_000 },
  { beneficiario: "Angélica Garrido", monto: 97_000 },
  { beneficiario: "Laura García", monto: 125_000 },
];

/*
 * Las cinco notas del banco (p. 189) y su asiento (p. 191), en el orden de
 * la p. 191. `nombre` es el de la tabla de P7 del paquete. `detalle` y
 * `tarjeta` son los renglones fijos de Hanayama (v1.2) para el detalle de
 * P4-P6 y para la tarjeta de P7: unidos, dan el nombre.
 */
export const NOTAS_A5 = [
  {
    id: "pago-cliente", tipo: "credito", monto: 645_000,
    nombre: "Pago del cliente Efraín Martínez",
    detalle: ["Pago del cliente", "Efraín Martínez"], tarjeta: ["Pago del cliente", "Efraín Martínez"],
    debe: "Bancos", haber: "Cuentas por cobrar – clientes",
  },
  {
    id: "intereses-inversion", tipo: "credito", monto: 342_000,
    nombre: "Intereses de la inversión",
    detalle: ["Intereses de", "la inversión"], tarjeta: ["Intereses de la inversión"],
    debe: "Bancos", haber: "Ingresos por intereses",
  },
  {
    id: "chequera", tipo: "debito", monto: 43_500,
    nombre: "Chequera",
    detalle: ["Chequera"], tarjeta: ["Chequera"],
    debe: "Gastos financieros – chequera", haber: "Bancos",
  },
  {
    id: "intereses-sobregiro", tipo: "debito", monto: 236_000,
    nombre: "Intereses de sobregiro",
    detalle: ["Intereses de", "sobregiro"], tarjeta: ["Intereses de sobregiro"],
    debe: "Gasto interés", haber: "Bancos",
  },
  {
    id: "cheque-devuelto", tipo: "debito", monto: 468_000,
    nombre: "Cheque devuelto de Humberto Gómez",
    detalle: ["Cheque devuelto", "de Humberto", "Gómez"], tarjeta: ["Cheque devuelto", "de Humberto Gómez"],
    debe: "Cuentas por cobrar – clientes", haber: "Bancos",
  },
];

const suma = (xs) => xs.reduce((s, x) => s + x.monto, 0);
export const NOTAS_CREDITO_A5 = NOTAS_A5.filter((n) => n.tipo === "credito");
export const NOTAS_DEBITO_A5 = NOTAS_A5.filter((n) => n.tipo === "debito");

/* Se calculan, no se transcriben. */
export const TOTAL_CHEQUES = suma(CHEQUES_A5);
export const TOTAL_NOTAS_CREDITO = suma(NOTAS_CREDITO_A5);
export const TOTAL_NOTAS_DEBITO = suma(NOTAS_DEBITO_A5);
export const CONCILIADO_BANCO = EXTRACTO + CONSIGNACION_EN_TRANSITO - TOTAL_CHEQUES;
export const CONCILIADO_LIBROS = LIBROS + TOTAL_NOTAS_CREDITO - TOTAL_NOTAS_DEBITO;
export const SUMA_DEBE_MAYOR = LIBROS + TOTAL_NOTAS_CREDITO;
export const SALDO_MAYOR = SUMA_DEBE_MAYOR - TOTAL_NOTAS_DEBITO;
/* La resta de P1 es de Katsumi: el libro no la hace. */
export const DIFERENCIA_INICIAL = LIBROS - EXTRACTO;

/* Los cinco asientos, del 31 de marzo (p. 191). */
export const FECHA_ASIENTOS = "31 de marzo";
export const ASIENTOS_A5 = NOTAS_A5.map((n) => ({
  nombre: n.nombre,
  lineas: [{ cuenta: n.debe, lado: DEBE, monto: n.monto }, { cuenta: n.haber, lado: HABER, monto: n.monto }],
}));

/* ═══════════ LA FIGURA: «LA CONCILIACIÓN DE DOS LADOS» (Hanayama v1 + v1.1 + v1.2) ═══════════ */

/*
 * Del libro: «Más», «Menos», las cifras, los cuatro beneficiarios, las
 * cuentas de los asientos, «Saldo», «Suma», «Bancos», «31 de marzo». De
 * Katsumi: «Consignación sin abonar», «Cheques sin cobrar», «Notas crédito
 * del banco», «Notas débito del banco», «Saldo conciliado» y los nombres de
 * las notas (la tabla de P7). Lo demás:
 * [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN] «el banco», «la empresa»,
 * «El banco · extracto», «La empresa · libros», «Saldo del extracto»,
 * «Saldo de los libros», las dos marcas de P6, «31 DE MARZO · LAS CINCO
 * NOTAS», «Bancos · 31 de marzo» y el texto para el lector de pantalla (el
 * par, «Son iguales», los nombres de las tablas). Rótulos de Hanayama (v1
 * §4) que el paquete no trae.
 */
export const FIGURA_CONCILIA = {
  par: { banco: "el banco", empresa: "la empresa", igual: "=" },
  mas: "Más",
  menos: "Menos",
  banco: {
    cabecera: "El banco · extracto",
    inicial: ["Saldo del", "extracto"],
    mas: { id: "consignacion", concepto: ["Consignación", "sin abonar"] },
    menos: { id: "cheques", concepto: ["Cheques", "sin cobrar"] },
    marca: "no se asienta: ya está en los libros",
  },
  empresa: {
    cabecera: "La empresa · libros",
    inicial: ["Saldo de", "los libros"],
    mas: { id: "notas-credito", concepto: ["Notas crédito", "del banco"] },
    menos: { id: "notas-debito", concepto: ["Notas débito", "del banco"] },
    marca: "se asientan las cinco notas",
  },
  conciliado: ["Saldo", "conciliado"],
  notas: { cabecera: "31 DE MARZO · LAS CINCO NOTAS" },
  mayor: { titulo: "Bancos · 31 de marzo", saldo: "Saldo", suma: "Suma", conciliado: "Saldo conciliado" },
  lector: {
    par: (banco, empresa) => `El banco: ${banco}. La empresa: ${empresa}.`,
    iguales: "Son iguales.",
    notas: "Las cinco notas del 31 de marzo",
    mayor: "Mayor de Bancos al 31 de marzo",
  },
};

/*
 * Cada estado (Hanayama v1 §3):
 *   · par        los dos saldos del par; el «=» se ve SOLO si son iguales
 *                (lo calcula la vista: no es un dato del estado)
 *   · lados      qué lado se pinta y cuánto: «partidas» (sin saldo
 *                conciliado) o «todo»; `compacto` quita el detalle (P6)
 *   · signos     qué «Más» / «Menos» se ven; los demás guardan su sitio sin
 *                decir nada (PH8-2: el signo es la respuesta en P2 y P4)
 *   · marcas     en P6, las dos marcas: ocultas con su sitio, o visibles
 *   · foco       lo señalado
 */
const PAR_INICIAL = [EXTRACTO, LIBROS];
const PAR_BANCO = [CONCILIADO_BANCO, LIBROS];
const PAR_FINAL = [CONCILIADO_BANCO, CONCILIADO_LIBROS];
const TODOS = ["consignacion", "cheques", "notas-credito", "notas-debito"];
const DOS_LADOS = [{ lado: "banco", ver: "todo" }, { lado: "empresa", ver: "todo" }];

export const ESTADOS_CONCILIA = {
  p1: { tipo: "conciliacion", par: PAR_INICIAL, lados: [], signos: [], foco: [] },
  "p2-colocando": { tipo: "conciliacion", par: PAR_INICIAL, lados: [{ lado: "banco", ver: "partidas" }], signos: [], foco: ["consignacion"] },
  "p2-acierto": { tipo: "conciliacion", par: PAR_INICIAL, lados: [{ lado: "banco", ver: "partidas" }], signos: ["consignacion"], foco: ["consignacion"] },
  p3: { tipo: "conciliacion", par: PAR_BANCO, lados: [{ lado: "banco", ver: "todo" }], signos: ["consignacion", "cheques"], foco: ["conciliado-banco", "par-banco"] },
  "p4-colocando": { tipo: "conciliacion", par: PAR_BANCO, lados: [{ lado: "empresa", ver: "partidas" }], signos: [], foco: ["notas-debito"] },
  /* Solo «Menos»: la pregunta era de las notas débito. «Más» lo muestra P5. */
  "p4-acierto": { tipo: "conciliacion", par: PAR_BANCO, lados: [{ lado: "empresa", ver: "partidas" }], signos: ["notas-debito"], foco: ["notas-debito"] },
  p5: { tipo: "conciliacion", par: PAR_FINAL, lados: [{ lado: "empresa", ver: "todo" }], signos: ["notas-credito", "notas-debito"], foco: ["conciliado-empresa", "par-banco", "par-empresa"] },
  "p6-colocando": { tipo: "conciliacion", par: PAR_FINAL, lados: DOS_LADOS, compacto: true, signos: TODOS, marcas: false, foco: [] },
  "p6-acierto": { tipo: "conciliacion", par: PAR_FINAL, lados: DOS_LADOS, compacto: true, signos: TODOS, marcas: true, foco: ["notas-credito", "notas-debito"] },
  notas: { tipo: "notas" },
  mayor: { tipo: "mayor" },
};

/* ═══════════ LAS PANTALLAS ═══════════ */

const PIE_189 = "Basado en el libro, p. 189";
const PIE_189_190 = "Basado en el libro, pp. 189-190";
const PIE_190 = "Basado en el libro, p. 190";
const PIE_191 = "Basado en el libro, p. 191";
const PIE_188_191 = "Basado en el libro, pp. 188-191";

/* P0 */
const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Al terminar, sabrás llevar los dos saldos de una conciliación al mismo valor y qué asientos tiene que hacer la empresa.",
  boton: BOTON.empezar,
  pie: PIE_188_191,
};

/* P1 · Dos saldos que no coinciden. La resta es de Katsumi; «casi nunca» por D4-10. */
const DOS_SALDOS = {
  id: "dos-saldos",
  tipo: "lectura",
  parrafos: [
    "La Compañía San Calixto Ltda. revisa su cuenta bancaria al 31 de marzo. El extracto del banco dice $2.435.600. Sus libros dicen $4.373.100.",
    "Difieren en $1.937.500. Como viste en «Bancos y notas del banco», casi nunca coinciden. Ahora toca ver por qué.",
  ],
  figura: { tipo: "concilia", estado: "p1" },
  boton: BOTON.seguir,
  pie: PIE_189,
};

/*
 * P2 · Lo que el banco todavía no sabe. La tabla de los cuatro cheques del
 * paquete la pinta la figura, justo después de «…que nadie ha cobrado:»:
 * es el detalle de «Cheques sin cobrar» (los cuatro beneficiarios con su
 * valor, y el total sumado). La consignación va después de la figura.
 */
const LO_QUE_EL_BANCO_NO_SABE = {
  id: "lo-que-el-banco-no-sabe",
  tipo: "eleccion",
  parrafos: [
    "Primero, el lado del banco. Hay cosas que la empresa ya anotó y el banco todavía no.",
    "Cuatro cheques que la empresa giró en marzo y que nadie ha cobrado:",
  ],
  figura: { tipo: "concilia", estados: { colocando: "p2-colocando", error: "p2-colocando", acierto: "p2-acierto" } },
  tras: ["Y una consignación del 31 de marzo, por $2.758.000, que el banco todavía no abona."],
  pregunta: "Para llegar al saldo verdadero del banco, ¿qué se hace con los $2.758.000 de la consignación?",
  opciones: [
    { id: "se-suman", texto: "Se suman al saldo del extracto.", correcta: true },
    { id: "se-restan", texto: "Se restan del saldo del extracto.", devolucion: "Restar sería decir que esa plata salió de la cuenta. Pero la empresa la llevó al banco: es plata que va a entrar." },
    { id: "no-se-tocan", texto: "No se tocan: el banco no la tiene.", devolucion: "Que el banco no la tenga es justo la razón de ajustarla. Si no se toca, el saldo del banco se queda corto." },
  ],
  acierto: { texto: "Así es. Esa plata ya es de la empresa, y el banco la abonará en cuanto la procese. Por eso se suma. Mira la presentación de la p. 190.", pie: PIE_189_190 },
  error: { pie: PIE_189_190 },
  pie: PIE_189_190,
};

/* P3 · El saldo del banco, corregido. «Es el saldo conciliado del banco.»: cambio del 15 de octubre. */
const EL_SALDO_DEL_BANCO = {
  id: "el-saldo-del-banco",
  tipo: "lectura",
  parrafos: [
    "Al saldo del extracto se le suma la consignación que el banco no ha abonado, y se le restan los cheques que nadie ha cobrado.",
    "$2.435.600 más $2.758.000, menos $581.000, dan $4.612.600.",
    "Es el saldo conciliado del banco.",
    "El cheque se resta porque esa plata ya está comprometida: cuando lo cobren, va a salir.",
  ],
  figura: { tipo: "concilia", estado: "p3" },
  boton: BOTON.seguir,
  pie: PIE_190,
};

/* P4 · Lo que la empresa todavía no sabe. La glosa de «sobregiro» va debajo de las notas débito (A5-b). */
const LO_QUE_LA_EMPRESA_NO_SABE = {
  id: "lo-que-la-empresa-no-sabe",
  tipo: "eleccion",
  parrafos: [
    "Ahora el lado de la empresa. El banco anotó en marzo cinco cosas que la empresa todavía no ha registrado.",
    "Hay dos notas crédito del banco. Una es de $645.000: el cliente Efraín Martínez pagó una factura directo en el banco. La otra es de $342.000, por los intereses de una inversión.",
    "Hay tres notas débito del banco. Una es de $43.500, por una chequera. Otra es de $236.000, por intereses de sobregiro. La última es de $468.000: le devolvieron un cheque del cliente Humberto Gómez.",
  ],
  glosaDeParrafo: { parrafo: 2, texto: "Un sobregiro es sacar del banco más plata de la que hay en la cuenta." },
  figura: { tipo: "concilia", estados: { colocando: "p4-colocando", error: "p4-colocando", acierto: "p4-acierto" } },
  pregunta: "Para llegar al saldo verdadero de la empresa, ¿qué se hace con las tres notas débito del banco?",
  opciones: [
    { id: "se-restan", texto: "Se restan del saldo de los libros.", correcta: true },
    { id: "se-suman", texto: "Se suman al saldo de los libros.", devolucion: "Sumar sería decir que el banco le dio plata a la empresa. Pero una nota débito del banco hace lo contrario." },
    { id: "en-el-banco", texto: "Se ajustan en el saldo del banco.", devolucion: "El banco ya las anotó: fue él quien las hizo. Ajustarlas en su lado sería contarlas dos veces." },
  ],
  acierto: { texto: "Así es. El banco ya le quitó esa plata a la empresa. Sus libros todavía no lo saben, y por eso se resta. Mira la presentación de la p. 190.", pie: PIE_189_190 },
  error: { pie: PIE_189_190 },
  pie: PIE_189_190,
};

/* P5 · El saldo de la empresa, corregido: el mismo del banco. */
const EL_SALDO_DE_LA_EMPRESA = {
  id: "el-saldo-de-la-empresa",
  tipo: "lectura",
  parrafos: [
    "Las dos notas crédito suman $987.000. Las tres notas débito suman $747.500.",
    "$4.373.100 más $987.000, menos $747.500, dan $4.612.600. Es el mismo saldo del banco.",
    "Nadie se había equivocado. A cada lado le faltaba anotar algo que el otro ya sabía.",
  ],
  figura: { tipo: "concilia", estado: "p5" },
  boton: BOTON.seguir,
  pie: PIE_190,
};

/* P6 · Qué se asienta y qué no. A5-a: «Lorena Guerra lo va a cobrar», no «el proveedor». */
const QUE_SE_ASIENTA = {
  id: "que-se-asienta",
  tipo: "eleccion",
  parrafos: [
    "Para el libro, lo importante no es que los saldos den igual. Es dejar la cuenta Bancos de la empresa en su valor verdadero.",
    "Por eso la empresa solo asienta lo que le faltaba a ella: las cinco notas del banco.",
  ],
  figura: { tipo: "concilia", estados: { colocando: "p6-colocando", error: "p6-colocando", acierto: "p6-acierto" } },
  pregunta: "¿La empresa hace un asiento por el cheque de Lorena Guerra, que nadie ha cobrado?",
  opciones: [
    { id: "no", texto: "No: ya está en sus libros desde que lo giró.", correcta: true },
    { id: "restarlo", texto: "Sí: hay que restarlo de Bancos.", devolucion: "Si se restara otra vez, el cheque quedaría anotado dos veces en los libros de la empresa." },
    { id: "sumarlo", texto: "Sí: hay que sumarlo a Bancos.", devolucion: "Sumarlo sería decir que la plata volvió a la empresa. Pero el cheque sigue vivo: Lorena Guerra lo va a cobrar." },
  ],
  acierto: { texto: "Así es. Ese cheque lo anotó la empresa al girarlo. Lo que falta es que el banco lo pague, y eso no se asienta.", pie: PIE_190 },
  error: { pie: PIE_190 },
  pie: PIE_190,
};

/* P7 · Los cinco asientos: la figura `notas` pinta la tabla del paquete. */
const LOS_CINCO_ASIENTOS = {
  id: "los-cinco-asientos",
  tipo: "lectura",
  parrafos: ["Cada nota del banco tiene su asiento, todos del 31 de marzo:"],
  figura: { tipo: "concilia", estado: "notas" },
  tras: [
    "Las notas crédito del banco suben Bancos, y las notas débito la bajan, como viste en «Bancos y notas del banco».",
    "El cheque devuelto vuelve a Cuentas por cobrar – clientes: ese pago nunca llegó, así que Humberto Gómez vuelve a deber.",
  ],
  boton: BOTON.seguir,
  pie: PIE_191,
};

/* P8 · El mayor de Bancos: la figura `mayor` pinta la cuenta T del paquete. */
const EL_MAYOR = {
  id: "el-mayor",
  tipo: "lectura",
  parrafos: [
    "Pasados al mayor, los asientos suben Bancos en $987.000 y la bajan en $747.500.",
    "$4.373.100 más $645.000 más $342.000 dan $5.360.100. Menos $747.500, el saldo queda en $4.612.600.",
    "Es el saldo conciliado. Ahora los libros de la empresa dicen la verdad.",
  ],
  figura: { tipo: "concilia", estado: "mayor" },
  boton: BOTON.seguir,
  pie: PIE_191,
};

/* P9 · Resumen. Es la última pantalla de T4 por ahora: sin botón ni «Siguiente». */
const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  listaNumerada: [
    "Al saldo del banco se le suma lo consignado sin abonar y se le restan los cheques sin cobrar.",
    "Al saldo de los libros se le suman las notas crédito del banco y se le restan las notas débito.",
    "Los dos dan lo mismo, y la empresa solo asienta las notas del banco, que eran lo que le faltaba.",
  ],
  pie: PIE_188_191,
};

/* `numero` es el de la pieza en el corte de T4: A0 = 0 … A4 = 4, A5 = 5. */
export const PIEZA_SAN_CALIXTO = {
  id: A5_ID,
  numero: 5,
  titulo: "San Calixto",
  pantallas: [PORTADA, DOS_SALDOS, LO_QUE_EL_BANCO_NO_SABE, EL_SALDO_DEL_BANCO, LO_QUE_LA_EMPRESA_NO_SABE, EL_SALDO_DE_LA_EMPRESA, QUE_SE_ASIENTA, LOS_CINCO_ASIENTOS, EL_MAYOR, RESUMEN],
};
