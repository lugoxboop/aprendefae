/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · HACER 5 — «La cuenta de la provisión» (Célula B, b5-t6-a5).
 *
 * Todo el texto que lee el estudiante vive en ESTE archivo, guardado entero
 * en orquestador/conocimiento/paquetes/b5-t6-act5.md: la versión de Futaba,
 * con las líneas que cambiaron tras la auditoría de Shoko (sección 2). Es un
 * repaso del caso de El Torito; sus devoluciones ya no copian las de b5-t6-a2.
 * Las cifras de legibilidad entre paréntesis no se copian.
 *
 * Casillas en orden (b5/CasillasEnOrden.jsx, la Escalera del Encaje de la
 * célula): la provisión de El Torito, pp. 200-203. Las correctas son cifras
 * del libro (el $148.800 sale del asiento de la p. 202, no de la tabla de la
 * p. 201); cuatro distractores son de Futaba y no están en el capítulo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const T6_ACT5 = {
  id: "b5-t6-a5",
  nombre: "La cuenta de la provisión",
  /* Decisión de Sakuta: media, 25 FP. */
  dificultad: "medio",
  fpBase: 25,
  consigna: "Sigue la cuenta de la provisión de El Torito, casilla por casilla.",
  regla: "La provisión sube cuando se acredita y baja cuando se debita.",
  /* El punto de partida, ya resuelto (pp. 200 y 202). Auditoría de Shoko: «El Torito Currambero». */
  partida: "El 31 de diciembre de 2007, El Torito Currambero revisa lo que le deben sus clientes: $2.655.000. Calcula que una parte no se va a recuperar: $148.800. Al crear la provisión, su saldo queda en $148.800.",
  cierre: "La provisión sube al crearla, baja al castigar y se corrige al año siguiente. Por eso el saldo final es justo lo que pidió el análisis.",
};

/* Las tres líneas de «¿Cómo se juega?». */
export const REGLAS_T6_ACT5 = [
  "Lee el dato de cada casilla y elige el valor.",
  "Cada casilla tiene un solo intento. Si te equivocas, verás la razón y el valor correcto para seguir.",
  "Al final, mira cómo quedó la provisión.",
];

/* ═══════════ LAS CINCO CASILLAS (la correcta lleva tipo null) ═══════════ */

const op = (valor, tipo = null) => ({ valor, tipo });

export const CASILLAS_T6_ACT5 = [
  {
    id: "c1",
    enunciado: "En el estado de situación financiera, ¿cuál es el valor neto de Cuentas por cobrar – clientes?",
    opciones: [op(2506200), op(2655000, "T1"), op(2803800, "T2")],
  },
  {
    id: "c2",
    enunciado: "En marzo del año siguiente se castiga la deuda de Pablo Moncayo, que es de $180.000. ¿Por cuánto se debita la provisión?",
    opciones: [op(180000), op(148800, "T3"), op(31200, "T4")],
  },
  {
    id: "c3",
    enunciado: "Después del castigo, ¿cuánto le falta a la provisión?",
    opciones: [op(31200), op(0, "T5"), op(328800, "T6")],
  },
  {
    id: "c4",
    enunciado: "El 31 de diciembre del año siguiente, el análisis pide una provisión de $153.400. ¿Por cuánto se registra la provisión?",
    opciones: [op(184600), op(153400, "T7"), op(122200, "T8")],
  },
  {
    id: "c5",
    enunciado: "¿Cuál es el saldo final de la provisión?",
    opciones: [op(153400), op(184600, "T9"), op(333400, "T10")],
  },
];

/* Los distractores que son de Futaba (no aparecen en el capítulo). */
export const DISTRACTORES_PROPIOS_T6_ACT5 = [122200, 328800, 333400, 2803800];

/* ═══════════ LOS ERRORES POR TIPO ═══════════ */

export const ERRORES_T6_ACT5 = {
  T1: "Falta restar la provisión. El valor neto es lo que deben los clientes menos la provisión.",
  T2: "La provisión no se suma: se resta de Cuentas por cobrar – clientes.",
  T3: "La provisión no pone el límite: lo que manda es la deuda de Pablo Moncayo. Por eso se debita la provisión por los $180.000 completos, aunque solo tuviera $148.800.",
  T4: "Esos $31.200 son lo que faltó, no lo que se castiga. Se castiga toda la deuda de Pablo Moncayo.",
  T5: "La provisión era menor que lo castigado, así que no alcanzó. Resta $148.800 de $180.000.",
  T6: "El castigo baja la provisión: se resta, no se suma.",
  T7: "El análisis dice cuánto debe quedar en la provisión, pero en marzo quedó corta. Para llegar a esa cifra, al registro hay que sumarle los $31.200 que faltaron.",
  /* «Se pasó»: la glosa de T6 · A3 para la provisión sobrestimada. */
  T8: "Lo que faltó se suma, no se resta. Se resta solo cuando la provisión se pasó.",
  T9: "Ese es el valor del ajuste, no el saldo. Antes del ajuste, a la provisión le faltaban $31.200.",
  T10: "Falta restar el castigo de marzo. Son $148.800 menos $180.000, más $184.600.",
};

export const ALT_T6_ACT5 = "Actividad de casillas. Sigues la cuenta de la provisión de El Torito en cinco casillas, en orden. En cada una eliges un valor entre tres. Tienes un intento por casilla; si fallas, se muestra la razón y el valor correcto.";
