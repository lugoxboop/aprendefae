/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A4 DE APRENDER — «Bancos y notas del banco» (Célula D).
 *
 * Fuente: el paquete vigente de Katsumi, orquestador/conocimiento/paquetes/
 * d4-t4-a4-v1.md, que ya trae la parte de A4 de la v2 (d4-t4-a3-a4-v2 y
 * d4-t4-h3-h5-a4-v2) y de la v3 (d4-t4-a4-h8-v3); los tres se quedan como
 * registro. Es el mismo blob que en main y en la punta de
 * feat/conta-d4-mapa-fuente. Una prueba compara cada texto de aquí contra él.
 *
 * ESTA PIEZA DEFINE «NOTA DÉBITO» Y «NOTA CRÉDITO» DEL BANCO. En los DATOS el
 * término se llama exactamente «Nota débito» y «Nota crédito» (decisión
 * A4-P de Yujiro), en TERMINOS_A4: así la guardia de la Célula B
 * (b5-t6-glosa-nota-debito.test.mjs) ve nuestra definición y se pone roja,
 * que es la señal acordada para que B retire su glosa. En pantalla, el texto
 * es el del paquete («Con una nota débito, el banco…»).
 *
 * Cifras: las dos de la p. 187, 876.000 y 398.200, en dos asientos sin fecha
 * (el libro pone «xxxx»). Ninguna de San Calixto: esas son de A5.
 *
 * La figura es «Las dos libretas» de Hanayama (v1 con la v1.1 encima): dos
 * registros de la misma cuenta, alineados por renglón.
 *
 * Aprender: sin FP, sin catálogo y sin llamar al motor.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { BOTON, DEBE, HABER } from "./contabilidadT4.js";

export const A4_ID = "t4-a4-bancos-y-notas";

/* Las dos cifras de la p. 187. */
export const CONSIGNACION = 876_000;
export const CHEQUE_PROVEEDOR = 398_200;

/*
 * ═══════════ LOS DOS TÉRMINOS QUE ESTA PIEZA DEFINE ═══════════
 *
 * El nombre en `termino` es EXACTAMENTE «Nota débito» / «Nota crédito», sin
 * «del banco» (A4-P). La definición es la línea de P2 del paquete, la misma
 * que se ve en pantalla.
 */
export const NOTA_DEBITO = {
  termino: "Nota débito",
  definicion: "Con una nota débito, el banco le resta un valor a la cuenta de la empresa. Por ejemplo, cuando le cobra una chequera, o cuando le devuelve el cheque con el que un cliente le había pagado.",
};
export const NOTA_CREDITO = {
  termino: "Nota crédito",
  definicion: "Con una nota crédito, el banco le suma un valor a la cuenta de la empresa. Por ejemplo, cuando le abona intereses, o cuando un cliente le paga directo en el banco.",
};
export const TERMINOS_A4 = [NOTA_DEBITO, NOTA_CREDITO];

/* ═══════════ TEXTOS DE INTERFAZ QUE EL PAQUETE NO TRAE ═══════════ */

/* El nombre de cada asiento para el lector de pantalla. Revisado por Katsumi (d4-t4-a4-v1.md, «Textos de interfaz de la figura»). */
export const NOMBRE_ASIENTO_A4 = { consignacion: "Asiento de la consignación", cheque: "Asiento del cheque al proveedor" };

/* ═══════════ LA FIGURA: «LAS DOS LIBRETAS» (Hanayama v1 + v1.1) ═══════════ */

/*
 * Del libro o de Katsumi: «libro auxiliar», «extracto», «Nota débito», «Nota
 * crédito», «Consignación», «Cheque girado». Lo demás está marcado.
 * Dentro de la libreta «El banco», las notas van a secas (decisión de Yujiro
 * sobre la pregunta de Shibukawa).
 */
export const FIGURA_LIBRETAS = {
  /* Revisados por Katsumi (ídem). */
  empresa: { nombre: "La empresa", registro: "libro auxiliar" },
  banco: { nombre: "El banco", registro: "extracto del mes" },
  suma: "suma",
  resta: "resta",
  noLoSabe: ["todavía no", "lo sabe"],
  saldo: "su saldo",
  /* Los hechos. «Cheque girado» va en dos renglones fijos: en uno no cabe a 320 (Hanayama v1 §2). */
  hechos: {
    cheque: { nombre: ["Cheque", "girado"], efecto: "resta", quien: "empresa" },
    consignacion: { nombre: ["Consignación"], efecto: "suma", quien: "empresa" },
    "nota-debito": { nombre: [NOTA_DEBITO.termino], efecto: "resta", quien: "banco" },
    "nota-credito": { nombre: [NOTA_CREDITO.termino], efecto: "suma", quien: "banco" },
  },
  /* La tarjeta del hecho de P7, del enunciado de la pregunta. Revisada por Katsumi. */
  tarjetaP7: { cuando: "El 30 del mes", renglones: ["La empresa gira un cheque", "nadie lo ha cobrado"] },
};

/*
 * El texto alternativo, uno por estado (Hanayama v1 §5, `notas` de la v1.1).
 * La fuente es d4-t4-a4-v1.md, «Textos de interfaz de la figura»: Katsumi
 * aprobó los míos tal cual, menos dos que cambió y que van aquí:
 *   · `p7-colocando`: el mío terminaba en «Los dos registros, todavía sin ese
 *     renglón.», una pista falsa para el lector de pantalla contra la
 *     respuesta «Solo la empresa»
 *   · `comparar`: «renglones que al otro todavía le faltan» (un renglón no se
 *     sabe)
 */
export const ALT_LIBRETAS = {
  notas: "Dos registros de la misma cuenta, el de la empresa y el del banco. En el del banco, una nota débito resta y una nota crédito suma. En el de la empresa, esos renglones todavía no están.",
  "dos-libros": "Dos registros de la misma cuenta: el libro auxiliar de la empresa y el extracto del banco.",
  "p7-colocando": "La empresa gira un cheque el 30 del mes y nadie lo ha cobrado. La figura muestra los dos registros de la misma cuenta.",
  "p7-acierto": "El cheque está en el libro de la empresa, que resta. En el extracto del banco todavía no está.",
  comparar: "En el libro de la empresa: el cheque girado y la consignación. En el extracto del banco: la nota débito y la nota crédito. Cada uno tiene renglones que al otro todavía le faltan.",
};

/*
 * Cada estado: los renglones (hechos) en orden; los señalados; si el
 * subtítulo de la cabecera se ve (v1.1, FA4-1: no en `notas`); si hay pie
 * «su saldo» visible, oculto con su sitio, o nada; la tarjeta de P7; y los
 * renglones que guardan su sitio sin decir nada (P7 mientras pregunta: PH8-2).
 */
export const ESTADOS_LIBRETAS = {
  notas: { renglones: ["nota-debito", "nota-credito"], foco: ["nota-debito", "nota-credito"], subtitulo: false, saldo: "oculto" },
  "dos-libros": { renglones: [], foco: [], subtitulo: true, saldo: "visible" },
  "p7-colocando": { renglones: [], huecos: 1, foco: [], subtitulo: true, saldo: "visible", tarjeta: true },
  "p7-acierto": { renglones: ["cheque"], foco: ["cheque"], subtitulo: true, saldo: "visible", tarjeta: true },
  comparar: { renglones: ["cheque", "consignacion", "nota-debito", "nota-credito"], foco: [], subtitulo: true, saldo: "visible" },
};

/* ═══════════ LOS ASIENTOS (p. 187, sin fecha: el libro pone «xxxx») ═══════════ */

export const ASIENTO_CONSIGNACION = {
  nombre: NOMBRE_ASIENTO_A4.consignacion,
  lineas: [
    { cuenta: "Bancos", lado: DEBE, monto: CONSIGNACION },
    { cuenta: "Caja", lado: HABER, monto: CONSIGNACION },
  ],
};
export const ASIENTO_CHEQUE = {
  nombre: NOMBRE_ASIENTO_A4.cheque,
  lineas: [
    { cuenta: "Cuentas por pagar – proveedores", lado: DEBE, monto: CHEQUE_PROVEEDOR },
    { cuenta: "Bancos", lado: HABER, monto: CHEQUE_PROVEEDOR },
  ],
};

/* ═══════════ LAS PANTALLAS ═══════════ */

const PIE_186 = "Basado en el libro, p. 186";
const PIE_187 = "Basado en el libro, p. 187";
const PIE_186_188 = "Basado en el libro, pp. 186-188";

/* P0 */
const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Al terminar, sabrás qué sube y qué baja la cuenta Bancos, qué son las notas del banco y por qué el saldo del banco y el de la empresa casi nunca coinciden.",
  boton: BOTON.empezar,
  pie: PIE_186_188,
};

/* P1 · Qué es Bancos: repaso del Tema 2 y de A1. */
const QUE_ES_BANCOS = {
  id: "que-es-bancos",
  tipo: "lectura",
  parrafos: [
    "En «La caja» viste la plata que la empresa tiene a la mano. Bancos es la otra parte: la plata que tiene depositada en el banco.",
    "Es un activo, como Caja. Sube con lo que aumenta lo depositado y baja con lo que lo disminuye.",
  ],
  boton: BOTON.seguir,
  pie: PIE_186,
};

/*
 * P2 · Las notas del banco. Aquí se definen los dos términos: sus líneas
 * son las definiciones de TERMINOS_A4. «Abonar» se glosa en su primera
 * aparición (v2, A4-b), y se avisa de la otra nota crédito de T7.
 */
const LAS_NOTAS = {
  id: "las-notas",
  tipo: "lectura",
  parrafos: [
    "A veces es el banco el que mueve la cuenta de la empresa, sin que la empresa haga un cheque ni consigne. Lo avisa con una nota.",
    NOTA_DEBITO.definicion,
    NOTA_CREDITO.definicion,
    "Aquí, abonar quiere decir que el banco le suma plata a la cuenta. No es el abono a una deuda que viste en el Tema 2.",
    "Ojo con el nombre. En «Inventarios I» verás otra nota crédito, la que un vendedor le da a su cliente. Esta es la del banco.",
  ],
  figura: { tipo: "libretas", estado: "notas" },
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 186-189",
};

/* P3 · Lo que sube Bancos. La glosa del cheque anulado es de Katsumi. */
const LO_QUE_SUBE = {
  id: "lo-que-sube",
  tipo: "lectura",
  parrafos: ["Bancos se debita, es decir, sube, con:"],
  listaNumerada: [
    "Lo que la empresa consigna en su cuenta.",
    "Las notas crédito del banco.",
    "Lo que un cliente consigna directo en la cuenta de la empresa.",
    "Un cheque que la empresa hizo y anotó, y que después anuló.",
  ],
  boton: BOTON.seguir,
  pie: PIE_186,
};

/*
 * P4 · Lo que baja Bancos, con su pregunta. «Girar» se define en su primera
 * aparición, debajo del renglón 1 de la lista (v2, A2-2). v2: los errores no
 * revelan.
 */
const LO_QUE_BAJA = {
  id: "lo-que-baja",
  tipo: "eleccion",
  parrafos: ["Bancos se acredita, es decir, baja, con:"],
  listaNumerada: [
    "Los cheques que gira la empresa.",
    "Las notas débito del banco.",
    "Lo que la empresa le paga al banco por un préstamo.",
  ],
  /* La glosa de «girar», debajo del renglón 1. */
  glosaDeLista: { renglon: 0, texto: "Girar un cheque es firmarlo para que el banco le pague a alguien con la plata de la cuenta de la empresa." },
  pregunta: "El banco le cobra a la empresa el costo de una chequera y se lo descuenta de la cuenta. ¿Qué le pasa a Bancos?",
  opciones: [
    { id: "se-acredita", texto: "Se acredita: baja.", correcta: true },
    { id: "se-debita", texto: "Se debita: sube.", devolucion: "Fíjate en quién le da plata a quién. El banco le quitó plata a la empresa, no se la dio." },
    { id: "no-se-mueve", texto: "No se mueve: la empresa no giró ningún cheque.", devolucion: "La cuenta se mueve aunque la empresa no haga nada: el banco ya le descontó la chequera." },
  ],
  acierto: { texto: "Así es. El banco le restó un valor a la cuenta con una nota débito, y una nota débito del banco acredita Bancos.", pie: PIE_187 },
  error: { pie: PIE_187 },
  pie: PIE_187,
};

/* P5 · El ejemplo de Sus Servicios: los dos asientos de la p. 187. */
const EL_EJEMPLO = {
  id: "el-ejemplo",
  tipo: "lectura",
  parrafos: [
    "Un día, Sus Servicios Ltda. consigna $876.000 en su cuenta corriente. Ese mismo día gira un cheque de $398.200 para pagarle a un proveedor.",
    "La consignación sube Bancos, y la plata sale de Caja. Mira el asiento de la p. 187.",
    "El cheque baja Bancos, y la deuda con el proveedor también baja.",
  ],
  asientos: [ASIENTO_CONSIGNACION, ASIENTO_CHEQUE],
  tras: ["Las dos operaciones las conoces desde el Tema 2. Aquí solo se ven juntas, desde la cuenta Bancos."],
  boton: BOTON.seguir,
  pie: PIE_187,
};

/* P6 · Dos libros de la misma cuenta. La cuenta de ahorros es una analogía de Katsumi. */
const DOS_LIBROS = {
  id: "dos-libros",
  tipo: "lectura",
  parrafos: [
    "La empresa anota en un libro auxiliar de bancos todo lo que pasa en su cuenta: cheques, consignaciones y notas del banco.",
    "El banco lleva su propio registro de esa misma cuenta. Cada mes le manda a la empresa un extracto: los movimientos del mes y el saldo del último día.",
    "Es como tu cuenta de ahorros: tú llevas tus cuentas, y el banco te manda las suyas.",
  ],
  figura: { tipo: "libretas", estado: "dos-libros" },
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 187-188",
};

/*
 * P7 · Por qué no coinciden. v3: la lista de las seis causas, agrupadas por
 * quién se enteró primero (organización de Katsumi), va SOLO con el acierto,
 * como cierre: antes de la pregunta la respondía. Hanayama: el renglón del
 * cheque guarda su sitio mientras se pregunta y en el error.
 */
const POR_QUE_NO_COINCIDEN = {
  id: "por-que-no-coinciden",
  tipo: "eleccion",
  parrafos: ["El libro dice que el saldo del extracto casi nunca coincide con el de la empresa, y da seis causas. Antes de verlas, piensa en una."],
  figura: { tipo: "libretas", estados: { colocando: "p7-colocando", error: "p7-colocando", acierto: "p7-acierto" } },
  pregunta: "El 30 del mes, la empresa gira un cheque a un proveedor. El proveedor todavía no lo ha cobrado. ¿Quién tiene anotado ese cheque?",
  opciones: [
    { id: "la-empresa", texto: "Solo la empresa.", correcta: true },
    { id: "el-banco", texto: "Solo el banco.", devolucion: "Piensa en cómo se entera el banco de un cheque. ¿Alguien lo ha cobrado ya?" },
    { id: "los-dos", texto: "Los dos.", devolucion: "Piensa en cuándo se entera cada uno. La empresa se entera al girar el cheque. ¿Y el banco?" },
  ],
  acierto: { texto: "Así es. La empresa lo anotó al girarlo, pero el banco solo se entera cuando el proveedor lo cobre. Por eso los saldos no coinciden.", pie: "Basado en el libro, p. 188" },
  error: { pie: "Basado en el libro, p. 188" },
  trasAcertar: {
    textos: ["Estas son las seis causas del libro, según quién se enteró primero:"],
    grupos: [
      { titulo: "Lo que la empresa ya anotó y el banco todavía no:", causas: ["Un cheque que la empresa giró y que nadie ha cobrado.", "Una consignación que la empresa anotó y que el banco todavía no suma a la cuenta."] },
      { titulo: "Lo que el banco ya anotó y la empresa todavía no:", causas: ["Una nota débito del banco.", "Una nota crédito del banco."] },
      { titulo: "Y los errores:", causas: ["Un error de la empresa al anotar.", "Un error del banco al liquidar."] },
    ],
  },
  pie: "Basado en el libro, p. 188",
};

/* P8 · La conciliación. La segunda línea adelanta la p. 190 sin cifras. */
const LA_CONCILIACION = {
  id: "la-conciliacion",
  tipo: "lectura",
  parrafos: [
    "La conciliación bancaria es comparar los dos registros, uno por uno, para saber por qué no dan lo mismo.",
    "Para el libro, lo importante no es que los saldos den igual. Es saber qué le falta anotar a la empresa para que su cuenta quede bien.",
    "En «San Calixto» harás una conciliación completa, con todas sus cifras.",
  ],
  figura: { tipo: "libretas", estado: "comparar" },
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 187-188 y 190",
};

/* P9 · Resumen. Es la última pantalla: no lleva botón. */
const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  listaNumerada: [
    "Bancos es la plata depositada. Sube con consignaciones y notas crédito del banco, y baja con cheques girados y notas débito del banco.",
    "Con una nota débito, el banco le resta un valor a la cuenta. Con una nota crédito, se lo suma.",
    "El saldo del banco y el de la empresa casi nunca coinciden: cada uno anota cosas que el otro todavía no sabe.",
  ],
  siguiente: "Siguiente: «San Calixto».",
  pie: PIE_186_188,
};

/* `numero` es el de la pieza en el corte de T4: A0 = 0 … A3 = 3, A4 = 4. */
export const PIEZA_BANCOS_Y_NOTAS = {
  id: A4_ID,
  numero: 4,
  titulo: "Bancos y notas del banco",
  pantallas: [PORTADA, QUE_ES_BANCOS, LAS_NOTAS, LO_QUE_SUBE, LO_QUE_BAJA, EL_EJEMPLO, DOS_LIBROS, POR_QUE_NO_COINCIDEN, LA_CONCILIACION, RESUMEN],
};
