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
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const T6_ACT2 = {
  id: "b5-t6-a2",
  nombre: "La provisión de El Torito",
  /* Decisión de Sakuta: media, 25 FP. */
  dificultad: "medio",
  fpBase: 25,
  objetivo: "Registrar la provisión de El Torito: cuando se crea, cuando se castiga una deuda y cuando se ajusta.",
  consigna: "Lee el hecho. Arma el asiento con las cuentas del estante.",
};

/* «¿Cómo se juega?», el diario y el resumen: los del cierre de T5. */
export const REGLAS_T6_ACT2 = REGLAS_T5_ACT2;
export const DIARIO_T6_ACT2 = DIARIO_T5_ACT2;
export const RESUMEN_T6_ACT2 = RESUMEN_T5_ACT2;

/* ═══════════ EL ESTANTE: SOLO NOMBRES, LOS DE EL TORITO (PP. 202-206) ═══════════ */

export const GASTO = "Gasto provisiones – cuentas incobrables";
export const PROVISION = "Provisión para deudas incobrables";
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
      ],
      B: "Revisa el valor. Suma lo que pide el análisis y lo que faltó en marzo.",
      razones: {
        [CLIENTES]: "Crear la provisión del año no cambia lo que deben los clientes: nadie paga y no se castiga ninguna deuda.",
        [CAJA]: "La provisión es un cálculo: no entra ni sale plata.",
      },
    },
  },
];

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
    "Provisión para deudas incobrables sube: va al Haber.",
    "Las dos por $148.800.",
    "El Debe y el Haber suman igual: el asiento cuadra.",
  ],
};
export const ALT_TUTORIAL_T6_ACT2 = "Ejemplo resuelto. El 31 de diciembre de 2007, El Torito Currambero crea una provisión de $148.800. El asiento tiene Gasto provisiones – cuentas incobrables en el Debe y Provisión para deudas incobrables en el Haber, las dos por $148.800. Los dos totales dan $148.800.";

/* ═══════════ TEXTO ALTERNATIVO ═══════════ */

export const ALT_T6_ACT2 = "Actividad de registro. Hay dos hechos de la provisión de El Torito Currambero. En cada uno, pon en la mesa las cuentas que mueve, ubícalas en el Debe o en el Haber y escribe cada valor. Abajo se ven los dos totales y la diferencia. Tienes un solo intento por asiento.";
