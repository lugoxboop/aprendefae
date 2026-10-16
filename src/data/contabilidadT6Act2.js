import { DEBE, HABER } from "./contabilidad.js";
import { REGLAS_T5_ACT2, DIARIO_T5_ACT2, RESUMEN_T5_ACT2 } from "./contabilidadT5Act2.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · HACER 2 — «La provisión de El Torito» (Célula B, b5-t6-a2).
 *
 * Todo el texto que lee el estudiante vive en ESTE archivo, guardado entero
 * en orquestador/conocimiento/paquetes/b5-t6-act2.md. Precedencia (Sakuta):
 * el contenido de Futaba con la D de la parte 1 reemplazada por su versión
 * nueva; el diseño, el anexo de Mai a la guía del cierre de T5. Las reglas,
 * el diario y el resumen son los publicados del cierre de T5 (Futaba: «los
 * mismos»), así que se toman de allí.
 *
 * Todas las cifras son las de El Torito, pp. 202-203.
 *
 * LOTE 6b · LA FUSIÓN DE a5 EN a2 (hoja de Mai; textos de Futaba con las
 * correcciones de Shoko, sección 5 del paquete). b5-t6-a5 «La cuenta de la
 * provisión» se retiró (0077) y sus casillas viven aquí, como tres preguntas
 * de cifra escrita entre los dos asientos: cinco pasos, P1 → Asiento 1 → P2 →
 * Asiento 2 → P3. La cuenta T de la provisión acompaña los cinco.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const T6_ACT2 = {
  id: "b5-t6-a2",
  nombre: "La provisión de El Torito",
  /*
   * Lote 6b: difícil, 50 FP (lo sugirieron Futaba y Shoko; lo decide KAEDE con
   * la regla nueva). Son los 25 + 25 de a2 y a5, que se funden: el tema no
   * pierde FP. La fila del servidor la cambia la 0078.
   */
  dificultad: "dificil",
  fpBase: 50,
  objetivo: "Registrar la provisión de El Torito y seguir su saldo: cuando se crea, cuando se castiga una deuda y cuando se ajusta.",
  consigna: "Lee el hecho. Arma el asiento con las cuentas del estante.",
  /* Debajo de la T, después de la pregunta 3 (era el cierre de a5). */
  cierre: "La provisión sube al crearla, baja al castigar y se corrige al año siguiente. Por eso el saldo final es justo lo que pidió el análisis.",
};

/*
 * «¿Cómo se juega?», el diario y el resumen: los del cierre de T5. Con la
 * fusión, «¿Cómo se juega?» suma una línea para las preguntas (PARA SHOKO).
 */
export const REGLAS_T6_ACT2 = [...REGLAS_T5_ACT2, "Entre los asientos, escribe la cifra que se pide. También tienes un solo intento."];
export const DIARIO_T6_ACT2 = DIARIO_T5_ACT2;
export const RESUMEN_T6_ACT2 = RESUMEN_T5_ACT2;

/* ═══════════ EL ESTANTE: SOLO NOMBRES, LOS DE EL TORITO (PP. 202-206) ═══════════ */

export const GASTO = "Gasto provisiones – cuentas incobrables";
export const PROVISION = "Provisión para cuentas incobrables";
export const CLIENTES = "Cuentas por cobrar – clientes";
export const CAJA = "Caja";

/* En el orden de Futaba. Caja nunca va en las respuestas: está para la C11. */
export const ESTANTE_T6_ACT2 = [GASTO, PROVISION, CLIENTES, CAJA];

const d = (cuenta, valor) => ({ cuenta, lado: DEBE, valor });
const h = (cuenta, valor) => ({ cuenta, lado: HABER, valor });

/* ═══════════ LAS DOS PARTES ═══════════ */

/*
 * `errores` va por la prioridad D > C > A > B. Las B específicas (C15, C12)
 * se muestran cuando alguna cuenta lleva ese valor; si no, la B general.
 */
export const PARTES_T6_ACT2 = [
  {
    id: "b5-t6-a2-p1",
    rotulo: "Asiento 1",
    instruccion: "Registra el castigo de marzo.",
    fecha: "Marzo del año siguiente",
    hecho: "Marzo del año siguiente. El Torito da por perdida la deuda de Pablo Moncayo, que es de $180.000. Ya tiene una provisión de $148.800.",
    asiento: [d(PROVISION, 180000), h(CLIENTES, 180000)],
    errores: {
      D: "Sobra una cuenta. Este castigo solo mueve la provisión y Cuentas por cobrar – clientes. Todo el castigo va contra la provisión, aunque sea mayor que ella. Y aquí no entra plata.",
      C: "Están al revés. Con el castigo, la provisión baja: va al Debe. Cuentas por cobrar – clientes también baja: va al Haber.",
      A: "Falta una cuenta. El castigo mueve dos: la provisión y Cuentas por cobrar – clientes.",
      especificas: [
        { valor: 148800, clave: "C15", texto: "Revisa el valor. Se castiga toda la deuda, $180.000, aunque la provisión sea menor. Así lo hace el libro." },
      ],
      B: "Revisa el valor. Mira de cuánto es la deuda de Pablo Moncayo.",
      /* Las razones por cuenta de la D (Futaba, entrega 1): detrás de «Sobra X.» o «No va X: en su lugar va Y.». */
      razones: {
        [GASTO]: "El gasto se anotó en diciembre, al crear la provisión. Lo que le faltó se suma a la provisión del año siguiente.",
        [CAJA]: "En un castigo no entra plata.",
      },
    },
  },
  {
    id: "b5-t6-a2-p2",
    rotulo: "Asiento 2",
    instruccion: "Registra la provisión del año siguiente.",
    fecha: "31 de diciembre del año siguiente",
    hecho: "31 de diciembre del año siguiente. El análisis pide una provisión de $153.400. En marzo, la provisión se quedó corta en $31.200.",
    asiento: [d(GASTO, 184600), h(PROVISION, 184600)],
    errores: {
      D: "Sobra una cuenta. Este hecho solo mueve el gasto y la provisión, como en diciembre de 2007.",
      C: "Están al revés. Como en diciembre de 2007, el gasto va al Debe y la provisión, que sube, va al Haber.",
      A: "Falta una cuenta. Este hecho mueve dos: el gasto y la provisión.",
      especificas: [
        { valor: 153400, clave: "C12", texto: "Revisa el valor. A lo que pide el análisis se le suma lo que faltó el año anterior: $153.400 + $31.200 = $184.600." },
        /* Lote 6b: la T8 de a5, ahora como B específica del asiento (Futaba). */
        { valor: 122200, clave: "T8", texto: "Lo que faltó se suma, no se resta. Se resta solo cuando la provisión se pasó." },
      ],
      B: "Revisa el valor. Suma lo que pide el análisis y lo que faltó en marzo.",
      razones: {
        [CLIENTES]: "Crear la provisión del año no cambia lo que deben los clientes: nadie paga y no se castiga ninguna deuda.",
        [CAJA]: "La provisión es un cálculo: no entra ni sale plata.",
      },
    },
  },
];

/* ═══════════ LAS TRES PREGUNTAS (las casillas de a5, ahora de cifra escrita) ═══════════ */

/*
 * Se escribe la cifra; vale con o sin «$» y con o sin puntos. Un intento por
 * pregunta: si falla, se ve el valor correcto. `errores` son las respuestas
 * nombradas (las T de a5); cualquier otra, negativas incluidas, lleva la
 * devolución `general`.
 */
const pregunta = (n, enunciado, correcta, errores, general, extra = {}) => ({
  id: `b5-t6-a2-q${n}`, tipo: "pregunta", rotulo: `Pregunta ${n}`, enunciado, correcta, errores, general, ...extra,
});

export const PREGUNTAS_T6_ACT2 = [
  pregunta(1,
    "Los clientes le deben $2.655.000, y la provisión quedó en $148.800. En el estado de situación financiera, ¿cuál es el valor neto de Cuentas por cobrar – clientes?",
    2506200,
    [
      { valor: 2655000, clave: "T1", texto: "Falta restar la provisión. El valor neto es lo que deben los clientes menos la provisión." },
      { valor: 2803800, clave: "T2", texto: "La provisión no se suma: se resta de Cuentas por cobrar – clientes." },
    ],
    "Revisa la cuenta: a lo que deben los clientes se le resta la provisión.",
    /* Con el bloque «En el estado de situación financiera», «El valor neto» vacío y encendido. */
    { bloque: "estado" }),
  pregunta(2,
    "Después del castigo, ¿cuánto le falta a la provisión?",
    31200,
    [
      { valor: 0, clave: "T5", texto: "La provisión era menor que lo castigado, así que no alcanzó. Resta $148.800 de $180.000." },
      { valor: 328800, clave: "T6", texto: "El castigo baja la provisión: se resta, no se suma." },
    ],
    "Compara lo que había en la provisión con lo que se castigó: la diferencia es lo que falta."),
  pregunta(3,
    "¿Cuál es el saldo final de la provisión?",
    153400,
    [
      /* La de Shoko: ya no deja la pista para restar 184.600 − 180.000. */
      { valor: 184600, clave: "T9", texto: "Ese es el valor del ajuste, no el saldo. Antes del ajuste, a la provisión le faltaban $31.200." },
      { valor: 333400, clave: "T10", texto: "Falta restar el castigo de marzo. Son $148.800 menos $180.000, más $184.600." },
    ],
    "Parte de lo que le faltaba a la provisión en marzo y súmale el registro de diciembre."),
];

/* Los cinco pasos, en el orden de la hoja de Mai. */
export const PASOS_T6_ACT2 = [PREGUNTAS_T6_ACT2[0], PARTES_T6_ACT2[0], PREGUNTAS_T6_ACT2[1], PARTES_T6_ACT2[1], PREGUNTAS_T6_ACT2[2]];

/* Los textos de la mecánica de cinco pasos (PARA SHOKO). */
/* Lote 6d (§4.3): sin «siguiente»; el botón sigue al contador («Siguiente paso»: CierreConMesa). */
export const PASOS_TEXTOS_T6_ACT2 = { etiqueta: "Paso", comprobar: "Comprobar", campo: "Tu respuesta" };

/* ═══════════ EL TUTORIAL: LA PROVISIÓN DE 2007, YA RESUELTA (p. 202) ═══════════ */

/* Sin número: es el ejemplo, no una parte (Futaba). */
export const PROVISION_2007_T6_ACT2 = {
  id: "b5-t6-a2-tutorial",
  rotulo: null,
  instruccion: null,
  fecha: "31 de diciembre de 2007",
  hecho: "31 de diciembre de 2007. El Torito Currambero calcula que $148.800 de lo que le deben sus clientes no se va a recuperar. Crea la provisión.",
  asiento: [d(GASTO, 148800), h(PROVISION, 148800)],
  errores: {},
  /* La explicación en cuatro líneas, al terminar el ejemplo. La segunda enseña que la provisión sube por el Haber. */
  resolucion: [
    "Gasto provisiones – cuentas incobrables sube: va al Debe.",
    "Provisión para cuentas incobrables sube: va al Haber.",
    "Las dos por $148.800.",
    "El Debe y el Haber suman igual: el asiento cuadra.",
  ],
};
export const ALT_TUTORIAL_T6_ACT2 = "Ejemplo resuelto. El 31 de diciembre de 2007, El Torito Currambero crea una provisión de $148.800. El asiento tiene Gasto provisiones – cuentas incobrables en el Debe y Provisión para cuentas incobrables en el Haber, las dos por $148.800. Los dos totales dan $148.800.";

/* ═══════════ TEXTO ALTERNATIVO ═══════════ */

export const ALT_T6_ACT2 = "Actividad de registro. Hay dos hechos de la provisión de El Torito Currambero. Antes, entre y después de los asientos, respondes tres preguntas sobre su saldo. En cada asiento, pon en la mesa las cuentas que mueve, ubícalas en el Debe o en el Haber y escribe cada valor. La T de la provisión se llena con cada respuesta. Tienes un solo intento por asiento y por pregunta.";
