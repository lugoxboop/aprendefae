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
/* P4: las seis causas (p. 188), una por botón, en la libreta que la tiene. */
export const CAUSAS_A4 = [
  { id: "cheque-sin-cobrar", tarjeta: "Cheque girado el 30, que nadie ha cobrado", emp: CHEQUE_SIN_COBRAR, ban: null },
  { id: "consignacion-sin-abonar", tarjeta: "Una consignación hecha el último día del mes", emp: { t: ["Consignación", "sin abonar"], e: "suma" }, ban: null },
  { id: "nota-debito", tarjeta: "El banco cobra la chequera de la empresa", emp: null, ban: NOTA_DEBITO_LIBRETA },
  { id: "nota-credito", tarjeta: "El banco abona intereses a la cuenta", emp: null, ban: NOTA_CREDITO_LIBRETA },
  { id: "error-empresa", tarjeta: "La empresa anota mal un cheque", emp: { t: ["Error al anotar"], e: "de la empresa" }, ban: null },
  { id: "error-banco", tarjeta: "El banco liquida mal unos intereses", emp: null, ban: { t: ["Error al liquidar"], e: "del banco" } },
];
/* P4 (la conciliación): lo que cada libreta tiene y la otra no; cada renglón es un destino. */
export const RENGLONES_CONCILIACION = [
  { id: "cheque-sin-cobrar", emp: CHEQUE_SIN_COBRAR, ban: null },
  { id: "nota-debito", emp: null, ban: NOTA_DEBITO_LIBRETA },
];

/* ═══════════ LA FIGURA ═══════════ */

export const FIGURA_A4 = {
  empresa: "La empresa",
  banco: "El banco",
  noSabe: ["todavía no", "lo sabe"],
  consignar: "Consignar",
  girar: "Girar un cheque",
  extracto: "Llega el extracto",
  sube: "Sube",
  baja: "Baja",
  mayor: "Bancos",
  contador: (n, total) => `${n} de ${total}`,
  /* Para el lector de pantalla (los del prototipo de Hanayama). */
  tablero: "Bancos",
  /* Lote B, §5.4: el contador de las causas y lo que el lector oye de cada libreta (Hanayama; Katsumi, en número). */
  contadorCausa: (n, total) => `Causa ${n} de ${total}`,
  anotadas: (libreta, n) => `${libreta}: ${n === 0 ? "ninguna causa anotada" : n === 1 ? "1 causa anotada" : `${n} causas anotadas`}`,
  /* Lote B, §5.2: la celda de la empresa con el acierto, y lo que el lector oye de cada renglón (Hanayama, aprobados por Katsumi). */
  porAnotar: "por anotar",
  renglonLector: {
    "cheque-sin-cobrar": "Cheque sin cobrar: lo tiene la empresa; el banco todavía no lo sabe",
    "nota-debito": "Nota débito: lo tiene el banco; la empresa todavía no lo sabe",
  },
  estadoLector: { bien: "correcto", mal: "no va aquí" },
};

/* ═══════════ LAS PANTALLAS ═══════════ */

/*
 * `modo`: cuenta (P0), extracto (P1), mandar (P2: el juego de mandar a un
 * lado, sin mensaje de error a la vista: «No va aquí» en el botón y
 * «Incorrecto.» solo para el lector), causas (P3: el mismo juego, con las dos
 * libretas como destinos) y conciliacion (P4, la última: un renglón de las
 * libretas, con la frase de cierre en el acierto). Lote B: cinco pantallas.
 * `pregunta`: «Seguir» no aparece hasta el acierto; en los juegos, hasta el último.
 */
export const PANTALLAS_A4 = [
  {
    id: "sube-y-baja", modo: "cuenta",
    /* Lote B, capa 1: abre con la cuenta y los dos botones; cada definición aparece con su botón (Katsumi v2). */
    rotuloAccion: "Prueba las dos",
    despuesConAccion: [
      { texto: "Bancos es la plata de la empresa en el banco.", con: "consignar" },
      { texto: "Girar un cheque es firmarlo para que el banco pague con esa plata.", con: "girar" },
    ],
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
    /*
     * Lote B, §5.4: cada causa a la libreta que la tiene anotada. Absorbe a
     * «quien-lo-tiene» (su caso es la tarjeta 1, su pregunta el «antes» y su
     * explicación la tarjeta final). Sin mensaje de error a la vista, como P2:
     * «No va aquí» en la libreta tocada y «Incorrecto.» para el lector.
     */
    id: "seis-causas", modo: "causas", pregunta: true,
    antes: ["Lleva cada causa a quien ya la anotó."],
    fin: "El banco sabe del cheque cuando lo cobran.",
    alt: "Seis tarjetas, una a la vez. Cada causa se manda a la libreta de la empresa o a la del banco, y queda escrita en la que la tiene anotada.",
    pie: "Basado en el libro, p. 188",
  },
  {
    /* Lote B, §5.2: la última pantalla de A4. Se toca el renglón que le falta anotar a la empresa; con el acierto, sin mensaje, la frase de cierre. */
    id: "la-conciliacion", modo: "conciliacion", pregunta: true, correcta: "nota-debito",
    rotuloPregunta: "¿Qué ignora la empresa?",
    errores: { "cheque-sin-cobrar": "El cheque ya está en sus libros: lo anotó al girarlo." },
    cierre: "Cada libreta anota lo que la otra todavía no sabe. Conciliar es ver qué falta.",
    siguiente: "Siguiente: «San Calixto».",
    alt: "Las dos libretas, cada una con un renglón: un cheque sin cobrar en la de la empresa y una nota débito en la del banco. Se toca el renglón que le falta anotar a la empresa.",
    pie: "Basado en el libro, pp. 187-190",
  },
];

export const PIEZA_BANCOS_Y_NOTAS = {
  id: A4_ID,
  numero: 4,
  titulo: "Bancos y notas del banco",
  boton: BOTON.seguir,
  pantallas: PANTALLAS_A4,
};
