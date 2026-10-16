/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A4 DE APRENDER — «Bancos y notas del banco» (Célula D). REDISEÑO DE
 * ENGANCHE.
 *
 * Diseño: Hanayama, «Bancos y las dos libretas, que se llenan» (celula-d/
 * hanayama-a4-rediseno.md), aprobado por Yujiro en su corte de calidad del
 * 15 oct 2026, con su ajuste: en P2, con los siete puestos, «Sube» y «Baja»
 * desaparecen (no quedan grises y muertos). Textos: Katsumi (celula-d/
 * katsumi-texto-a2-a5.md), aprobados tal cual. Copia en el canon: orquestador/
 * conocimiento/paquetes/d4-t4-a4-v4-rediseno.md. Una prueba compara cada
 * texto de aquí contra ella.
 *
 * Siete pantallas (la pila tenía diez); en cinco el estudiante mueve la
 * figura: consigna y gira, hace llegar el extracto, manda siete movimientos a
 * «Sube» o «Baja», decide quién tiene anotado el cheque y recorre las seis
 * causas. Dos piezas, cada una con su significado: la cuenta Bancos (el
 * tablero de una cuenta y, en P2, el mayor) y las dos libretas («La empresa»
 * y «El banco»), con «todavía no / lo sabe» donde una no lo tiene.
 *
 * Cifras del libro: 876.000 y 398.200 (p. 187). Los siete movimientos de P2
 * salen de las pp. 186-187, en su orden. Los términos de las notas son
 * exactamente «Nota débito» y «Nota crédito» (A4-P); en el mayor de P2, fuera
 * de la libreta «El banco», llevan «del banco» en un renglón aparte. La
 * definición está en el «antes» de P1 (con «abonar»: «le suma»).
 *
 * Aprender: sin FP, sin catálogo y sin llamar al motor.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { BOTON, DEBE, HABER } from "./contabilidadT4.js";

export const A4_ID = "t4-a4-bancos-y-notas";

/* ═══════════ LAS CIFRAS ═══════════ */

/* p. 187: la consignación y el cheque al proveedor. */
export const CONSIGNACION = 876_000;
export const CHEQUE_PROVEEDOR = 398_200;

/* ═══════════ P2 · LOS SIETE MOVIMIENTOS (pp. 186-187) ═══════════ */

/*
 * `texto`: la tarjeta (dos renglones como mucho a 320). `va`: el debe (sube)
 * o el haber (baja) de Bancos. `mayor`: el nombre en el mayor, en renglones
 * fijos (Katsumi, decisiones 4 y 5).
 */
export const MOVIMIENTOS_A4 = [
  { id: "consignacion", texto: "Lo que la empresa consigna", va: DEBE, mayor: ["Consignación"] },
  { id: "nota-debito", texto: "Una nota débito del banco", va: HABER, mayor: ["Nota débito", "del banco"] },
  { id: "nota-credito", texto: "Una nota crédito del banco", va: DEBE, mayor: ["Nota crédito", "del banco"] },
  { id: "cheque-girado", texto: "Un cheque que gira la empresa", va: HABER, mayor: ["Cheque girado"] },
  { id: "cliente-consigna", texto: "Un cliente consigna directo en la cuenta", va: DEBE, mayor: ["Cliente consigna"] },
  { id: "prestamo", texto: "La cuota de un préstamo del banco", va: HABER, mayor: ["Préstamo"] },
  { id: "cheque-anulado", texto: "Un cheque anotado que después se anula", va: DEBE, mayor: ["Cheque anulado"] },
];
/* El mayor reserva cinco renglones: no crece con el último (Katsumi, decisión 4). */
export const RESERVA_MAYOR_A4 = 5;

/* ═══════════ LAS LIBRETAS ═══════════ */

/* Un renglón de libreta: `t`, el rótulo en renglones fijos; `e`, su efecto. */
const NOTA_DEBITO_LIBRETA = { t: ["Nota débito"], e: "resta" };
const NOTA_CREDITO_LIBRETA = { t: ["Nota crédito"], e: "suma" };
const CHEQUE_SIN_COBRAR = { t: ["Cheque", "sin cobrar"], e: "resta" };

/* P1: lo que trae el extracto. La empresa todavía no lo sabe. */
export const RENGLONES_EXTRACTO = [
  { id: "nota-debito", emp: null, ban: NOTA_DEBITO_LIBRETA },
  { id: "nota-credito", emp: null, ban: NOTA_CREDITO_LIBRETA },
];
/* P3: con el acierto, el cheque del 30 en la libreta de la empresa (antes, el renglón no existe: PH8-2). */
export const RENGLON_CHEQUE_30 = { id: "cheque-30", emp: { t: ["Cheque girado"], e: "resta" }, ban: null };
/* P4: las seis causas (p. 188), una por botón, en la libreta que la tiene. */
export const CAUSAS_A4 = [
  { id: "cheque-sin-cobrar", emp: CHEQUE_SIN_COBRAR, ban: null },
  { id: "consignacion-sin-abonar", emp: { t: ["Consignación", "sin abonar"], e: "suma" }, ban: null },
  { id: "nota-debito", emp: null, ban: NOTA_DEBITO_LIBRETA },
  { id: "nota-credito", emp: null, ban: NOTA_CREDITO_LIBRETA },
  { id: "error-empresa", emp: { t: ["Error al anotar"], e: "de la empresa" }, ban: null },
  { id: "error-banco", emp: null, ban: { t: ["Error al liquidar"], e: "del banco" } },
];
/* P5: lo que cada libreta tiene y la otra no. */
export const RENGLONES_CONCILIACION = [
  { id: "cheque-sin-cobrar", emp: CHEQUE_SIN_COBRAR, ban: null },
  { id: "nota-debito", emp: null, ban: NOTA_DEBITO_LIBRETA },
];

/* ═══════════ LA FIGURA ═══════════ */

export const FIGURA_A4 = {
  empresa: "La empresa",
  banco: "El banco",
  subEmpresa: "libro auxiliar",
  subBanco: "extracto del mes",
  noSabe: ["todavía no", "lo sabe"],
  consignar: "Consignar",
  girar: "Girar un cheque",
  extracto: "Llega el extracto",
  sube: "Sube",
  baja: "Baja",
  mayor: "Bancos",
  contador: (n, total) => `${n} de ${total}`,
  chips: { empresa: "Empresa", banco: "Banco", "los-dos": "Los dos" },
  /* Para el lector de pantalla (los del prototipo de Hanayama). */
  tablero: "Bancos",
  causas: "Las seis causas",
};

/* ═══════════ LAS PANTALLAS ═══════════ */

/*
 * `modo`: cuenta (P0), extracto (P1), mandar (P2: el juego de mandar a un
 * lado, sin mensaje de error a la vista: el ✗ en el botón y «Incorrecto.» solo
 * para el lector), quien (P3), causas (P4), conciliacion (P5) y quieta (P6).
 * `pregunta`: «Seguir» no aparece hasta el acierto; en P2, hasta el séptimo.
 */
export const PANTALLAS_A4 = [
  {
    id: "sube-y-baja", modo: "cuenta",
    antes: ["Bancos es la plata de la empresa en el banco. Girar un cheque es firmarlo para que el banco pague con esa plata. Prueba las dos."],
    alt: "La cuenta Bancos. Consignar 876.000 la sube por el debe; girar un cheque de 398.200 la baja por el haber.",
    pie: "Basado en el libro, pp. 186-187",
  },
  {
    id: "las-notas", modo: "extracto",
    antes: ["Con una nota débito, el banco le resta a la cuenta; con una nota crédito, le abona: le suma."],
    alt: "Las dos libretas, la de la empresa y la del banco. Al llegar el extracto, el banco tiene una nota débito que resta y una nota crédito que suma, y la empresa todavía no las sabe.",
    pie: "Basado en el libro, pp. 187-188",
  },
  {
    id: "sube-o-baja", modo: "mandar", pregunta: true,
    antes: ["¿Sube o baja Bancos con cada uno?"],
    fin: "Ya están los siete.",
    alt: "Siete movimientos que se mandan a Sube, el debe de Bancos, o a Baja, el haber. Con el acierto, su nombre entra al mayor.",
    pie: "Basado en el libro, pp. 186-187",
  },
  {
    id: "quien-lo-tiene", modo: "quien", pregunta: true, opciones: ["empresa", "banco", "los-dos"], correcta: "empresa",
    antes: ["El 30, la empresa gira un cheque que nadie ha cobrado. ¿Quién lo tiene anotado?"],
    acierto: "El banco se entera cuando lo cobren.",
    errores: {
      banco: "¿Alguien lo ha cobrado ya?",
      "los-dos": "¿Cuándo se entera el banco de un cheque?",
    },
    alt: "Las dos libretas de la misma cuenta, con un renglón libre. Con el acierto, el cheque aparece en la de la empresa, que resta, y el banco todavía no lo sabe.",
    pie: "Basado en el libro, p. 188",
  },
  {
    id: "seis-causas", modo: "causas",
    antes: ["El saldo del banco y el de la empresa casi nunca coinciden. El libro da seis causas: toca cada una."],
    alt: "Seis botones. Cada uno muestra en qué libreta está anotada esa causa, y que la otra todavía no la sabe.",
    pie: "Basado en el libro, p. 188",
  },
  {
    id: "la-conciliacion", modo: "conciliacion",
    antes: ["La conciliación compara los dos registros para saber qué le falta anotar a la empresa."],
    alt: "El libro auxiliar de la empresa tiene un cheque sin cobrar, y el extracto del banco, una nota débito. Cada uno tiene renglones que al otro todavía le faltan.",
    pie: "Basado en el libro, pp. 187-190",
  },
  {
    id: "resumen", modo: "quieta",
    resumen: [
      "Bancos sube con consignaciones y baja con cheques girados.",
      "Las notas del banco también la mueven: la débito resta y la crédito suma.",
      "Cada libreta anota cosas que la otra todavía no sabe.",
    ],
    siguiente: "Siguiente: «San Calixto».",
    alt: "Las dos libretas, vacías.",
    pie: "Basado en el libro, pp. 186-188",
  },
];

export const PIEZA_BANCOS_Y_NOTAS = {
  id: A4_ID,
  numero: 4,
  titulo: "Bancos y notas del banco",
  boton: BOTON.seguir,
  pantallas: PANTALLAS_A4,
};
