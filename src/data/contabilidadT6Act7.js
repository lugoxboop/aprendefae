/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · HACER 7 — «¿Qué método y cuándo?» (Célula B, b5-t6-a7).
 *
 * Todo el texto que lee el estudiante vive en ESTE archivo, guardado entero
 * en orquestador/conocimiento/paquetes/b5-t6-act7.md (versión de Futaba).
 * Las cifras de legibilidad entre paréntesis no se copian.
 *
 * La clasificación de dos niveles de la célula (la de b5-t6-a1): primer nivel,
 * el método; segundo, solo para Provisiones, el momento. Como en b5-t6-a1, el
 * ✅ y el ❌ van al inicio de cada devolución, y el segundo fallo sigue la
 * REGLA ÚNICA de la célula (b5SegundoFallo.js): el acierto sin «Sí.» y con
 * «No es esa.» delante. Sin cifras.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const T6_ACT7 = {
  id: "b5-t6-a7",
  nombre: "¿Qué método y cuándo?",
  /* Decisión de Sakuta: fácil, 10 FP. */
  dificultad: "facil",
  fpBase: 10,
  consigna: "Lee la ficha. Elige el método y, si es de provisiones, el momento.",
};

/* Las tres líneas de «¿Cómo se juega?». */
export const REGLAS_T6_ACT7 = [
  "Elige primero si la ficha es de la anulación directa o del método de provisiones.",
  "Si es de provisiones, elige también si pasa al cierre o al castigar una deuda.",
  "Pulsa el botón para colocar la ficha; si fallas, tienes un intento más.",
];

/* ═══════════ LOS DOS NIVELES ═══════════ */

export const DIRECTA = "directa";
export const PROVISIONES = "provisiones";
export const CIERRE = "cierre";
export const CASTIGAR = "castigar";

/* La pestaña que abre el panel va al final (la regla §2.2 de b5-t5-a1 y b5-t6-a1). */
export const METODOS = [
  { id: DIRECTA, rotulo: "Anulación directa" },
  { id: PROVISIONES, rotulo: "Provisiones" },
];
export const MOMENTOS = [
  { id: CIERRE, rotulo: "Al cierre" },
  { id: CASTIGAR, rotulo: "Al castigar" },
];

export const BOTON_T6_ACT7 = {
  nada: "Elige un método",
  falta: "Elige el momento",
  colocar: "Colocar la ficha",
};

/* ═══════════ EL BANCO: 10 FICHAS ═══════════ */

/* 4 de anulación directa, 3 de provisiones al cierre y 3 de provisiones al castigar. */
export const FICHAS_T6_ACT7 = [
  {
    /* La trampa a propósito: el nombre del gasto dice «provisiones» (el «Ojo» del término 4 de T6 · A2). */
    id: "mc-01", metodo: DIRECTA, momento: null,
    texto: "Al Debe, Gasto provisiones – cuentas incobrables. Al Haber, Cuentas por cobrar – clientes.",
    acierto: "✅ Sí. Con la anulación directa, el castigo va directo al gasto. El nombre del gasto dice “provisiones”, pero aquí no hay provisión.",
  },
  {
    id: "mc-02", metodo: DIRECTA, momento: null,
    texto: "El gasto aparece el mismo día en que se castiga la deuda.",
    acierto: "✅ Sí. Con la anulación directa, la pérdida se anota el día del castigo.",
  },
  {
    id: "mc-03", metodo: DIRECTA, momento: null,
    texto: "No deja información sobre las deudas castigadas.",
    acierto: "✅ Sí. Esa es la desventaja que el libro le ve a la anulación directa.",
  },
  {
    id: "mc-04", metodo: DIRECTA, momento: null,
    texto: "El libro lo llama muy sencillo, pero con una desventaja.",
    acierto: "✅ Sí. Así describe el libro la anulación directa.",
  },
  {
    id: "mc-05", metodo: PROVISIONES, momento: CIERRE,
    texto: "Se debita el gasto y se acredita la provisión, que sube.",
    acierto: "✅ Sí. Es el asiento que crea la provisión al cierre.",
  },
  {
    id: "mc-06", metodo: PROVISIONES, momento: CIERRE,
    texto: "Se calcula qué parte de lo que deben los clientes no se va a recuperar.",
    acierto: "✅ Sí. Con provisiones, ese cálculo se hace al cierre.",
  },
  {
    id: "mc-07", metodo: PROVISIONES, momento: CIERRE,
    texto: "A la provisión del año se le suma lo que faltó el año anterior.",
    acierto: "✅ Sí. Es el ajuste de la provisión, al cierre del año siguiente.",
  },
  {
    id: "mc-08", metodo: PROVISIONES, momento: CASTIGAR,
    texto: "Al Debe, Provisión para deudas incobrables. Al Haber, Cuentas por cobrar – clientes.",
    acierto: "✅ Sí. Es el asiento del castigo cuando hay provisión.",
  },
  {
    id: "mc-09", metodo: PROVISIONES, momento: CASTIGAR,
    texto: "Se castiga toda la deuda, aunque sea mayor que lo provisionado.",
    acierto: "✅ Sí. Con provisiones, al castigar se da de baja toda la deuda, como hizo El Torito con Pablo Moncayo.",
  },
  {
    id: "mc-10", metodo: PROVISIONES, momento: CASTIGAR,
    texto: "El gasto no se toca, porque ya se había anotado.",
    acierto: "✅ Sí. Con provisiones, el gasto se anotó al cierre; al castigar solo baja la provisión.",
  },
];

/* ═══════════ EL TUTORIAL: UNA FICHA FUERA DEL BANCO ═══════════ */

export const EJEMPLO_T6_ACT7 = {
  id: "b5-t6-a7-tutorial", metodo: PROVISIONES, momento: CIERRE,
  texto: "El Torito crea su provisión el 31 de diciembre.",
  acierto: "✅ Es de provisiones, y pasa al cierre: ahí se crea la provisión.",
};

/* ═══════════ LAS DEVOLUCIONES DE ERROR ═══════════ */

export const ERROR_T6_ACT7 = {
  /* A · una ficha de anulación directa puesta en «Provisiones». */
  A: "❌ No es esa. Esta ficha describe la anulación directa: no hay provisión, y el gasto se anota al castigar.",
  /* B · una ficha de provisiones puesta en «Anulación directa». */
  B: "❌ No es esa. Esta ficha habla de una provisión que se crea o se usa. Eso solo pasa en el método de provisiones.",
  /* C · acertó «Provisiones» y falló el momento: orienta sin dar la respuesta. */
  C: "❌ Vas bien: es de provisiones. Ahora pregúntate si pasa cuando se crea o se ajusta la provisión, o cuando se da por perdida una deuda.",
};

/* ═══════════ EL PUNTAJE: 60 % EL MÉTODO, 40 % EL MOMENTO (como T1-6) ═══════════ */

export const PESO_METODO = 0.6;
export const PESO_MOMENTO = 0.4;

/* El resumen (Futaba). {X} lo formatea el componente, como T1-6. */
export const resumenT6Act7 = (bien, cuantas, x) =>
  `${bien} de ${cuantas} completas al primer intento. Cada ficha valía ${x} %. El método pesa 60 % y el momento pesa 40 %. Si la ficha no lleva momento, el método vale toda la ficha.`;

export const ALT_T6_ACT7 = "Actividad de clasificación. Aparece una ficha que describe un asiento o un rasgo de un método. Elige Anulación directa o Provisiones. Si eliges Provisiones, elige también Al cierre o Al castigar. Luego pulsa Colocar la ficha. Si fallas, tienes un intento más. Después de cada respuesta se lee la explicación.";
