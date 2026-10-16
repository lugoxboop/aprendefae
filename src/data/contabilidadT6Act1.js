/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · HACER 1 — «¿Clientes o otra cuenta por cobrar?» (Célula B).
 *
 * Todo el texto que lee el estudiante vive en ESTE archivo: el contenido de
 * Futaba con el PASA de Shoko (el préstamo a un cliente, la devolución B con
 * el nombre completo de la cuenta y la columna del segundo fallo), guardado
 * en orquestador/conocimiento/paquetes/b5-t6-act1.md. No hay guía de diseño
 * propia: es el mismo diseño de b5-t5-a1 (decisión de Sakuta).
 *
 * Lote 6d (estándar único de Hacer): las devoluciones van sin los emojis de acierto y de
 * error que llevaban al inicio (solo se quitó el emoji); el veredicto lo da la
 * evaluación (`ok`), no el texto. El resto es literal de Futaba. La pista del primer
 * fallo va sin emoji (como en la escalera de ayuda, tema6/escaleraB5.js).
 *
 * El segundo fallo sigue la REGLA ÚNICA de la célula (b5SegundoFallo.js): el
 * acierto tal cual, debajo de la pastilla «Iba aquí» (lote 6d-textos: los
 * aciertos ya no abren con «Sí.» y el segundo fallo no añade nada delante;
 * el veredicto lo da la pastilla). Por eso no hay columna de segundo fallo
 * aquí: sale sola del acierto.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const T6_ACT1 = {
  id: "b5-t6-a1",
  nombre: "¿Clientes o otra cuenta por cobrar?",
  dificultad: "facil",
  fpBase: 10,
  /*
   * R10 (hoja de fusiones de Mai): entre 2 y 4 fichas por cajón. Lote 6b (C4): sale la ficha del cheque
   * devuelto, que se practicaba cinco veces en B y se queda donde enseña algo nuevo; el banco queda en
   * 4 · 2 · 3. Con nueve fichas la tanda sería siempre el banco entero, con el mismo reparto, y la cuenta
   * del estante volvería a delatar la última: van ocho, con dos repartos posibles (4 · 2 · 2 y 3 · 2 · 3).
   */
  porPartida: 8,
  objetivo: "Decidir si un hecho va en Clientes o en otra cuenta por cobrar, y si se debita o se acredita.",
  consigna: "Lee el hecho. Elige la cuenta y, si es Clientes, cómo se anota.",
};

/*
 * Las dos líneas de «¿Cómo se juega?» (lote 6a: las fichas a un nivel). La primera es de Futaba; la
 * segunda, la misma de b5-t5-a1, adaptada a la hoja de Mai (sin botón). PARA SHOKO.
 */
export const REGLAS_T6_ACT1 = [
  "Lee el hecho y elige dónde va: en otra cuenta por cobrar, o en Clientes, y si se debita o se acredita.",
  "Toca el cajón donde va la ficha; si fallas, tienes un intento más.",
];

/* ═══════════ LAS TRES OPCIONES: LOS TRES CAJONES DEL ESTANTE (hoja de fusiones de Mai) ═══════════ */

export const OTRA = "otra";
export const CLIENTES = "clientes";
export const DEBITA = "debita";
export const ACREDITA = "acredita";

/*
 * Cada cajón es una respuesta entera: la cuenta y, si es Clientes, el lado. Los nombres, los de la hoja de
 * Mai y del texto alternativo de Futaba. El grupo se lee «Cuenta por cobrar» (PARA SHOKO: la hoja pide
 * la etiqueta del grupo de pestañas de hoy, que no tenía nombre).
 */
export const CAJONES_T6_ACT1 = [
  { cuenta: OTRA, lado: null, rotulo: "Otra cuenta por cobrar" },
  { cuenta: CLIENTES, lado: DEBITA, rotulo: "Clientes, se debita" },
  { cuenta: CLIENTES, lado: ACREDITA, rotulo: "Clientes, se acredita" },
];
export const GRUPO_T6_ACT1 = "Cuenta por cobrar";

/* ═══════════ EL BANCO: 10 FICHAS ═══════════ */

/*
 * `cuenta` y `lado` son la respuesta (`lado` va a null en las de otra cuenta
 * por cobrar). `pista` es lo que se lee al PRIMER fallo, sea cual sea el cajón
 * tocado (Futaba, E5 de la fila 11 de Shoko): cada ficha la suya, sin nombrar
 * el cajón. Reemplaza a las devoluciones de error A, B, C y C5, que quedan
 * como registro en el paquete (§3.3). Al segundo fallo, la regla única.
 */
export const FICHAS_T6_ACT1 = [
  {
    id: "socio", cuenta: OTRA, lado: null,
    /* Lote 6a (Futaba): cada préstamo con otra forma; solo este dice «prestada». */
    texto: "Un socio le pide plata prestada a la empresa, y ella se la da.",
    pista: "¿El socio compró algo a crédito, o recibió plata prestada? Piensa qué deudas recoge la cuenta de clientes.",
    acierto: "Es un préstamo, no una venta a crédito. Va en otra cuenta por cobrar: Cuentas por cobrar a socios y accionistas.",
  },
  {
    id: "trabajador", cuenta: OTRA, lado: null,
    texto: "Un trabajador necesita plata y la empresa se la entrega; él la pagará por cuotas.",
    pista: "¿Aquí hubo una venta a crédito? Piensa qué deudas recoge Cuentas por cobrar – clientes.",
    acierto: "Es un préstamo, no una venta a crédito. Va en otra cuenta por cobrar: Cuentas por cobrar a trabajadores.",
  },
  {
    id: "particular", cuenta: OTRA, lado: null,
    texto: "Alguien que no es cliente, socio ni trabajador recibe plata de la empresa. Tiene que devolverla.",
    pista: "Fíjate por qué esta persona le debe a la empresa. ¿La deuda vino de una venta a crédito?",
    acierto: "Es un préstamo, no una venta a crédito. Va en otra cuenta por cobrar: Préstamos a particulares.",
  },
  {
    /* Corrección obligatoria de Shoko: quien se guíe por la palabra «cliente» la falla. Lote 6a: la versión de Shoko, sin «no compra nada». */
    id: "prestamo-cliente", cuenta: OTRA, lado: null,
    texto: "Un cliente le pide plata a la empresa, y ella se la entrega para que la devuelva.",
    pista: "Que sea cliente no decide la cuenta. Mira por qué le debe: ¿compró a crédito o le prestaron?",
    acierto: "Es un cliente, pero esto es un préstamo, no una venta a crédito. Por eso no va en Cuentas por cobrar – clientes, sino en otra cuenta por cobrar.",
  },
  {
    id: "venta-mercancia", cuenta: CLIENTES, lado: DEBITA,
    /* Entrega 4 de Futaba (calidad): los cinco hechos de Clientes, con otras palabras. */
    texto: "Un cliente se lleva un pedido de mercancía a crédito, para pagarlo a fin de mes.",
    pista: "Después de esto, ¿lo que debe el cliente sube o baja? No te guíes por la palabra “crédito”.",
    acierto: "Es una venta a crédito: el cliente queda debiendo, así que se debita.",
  },
  {
    id: "venta-servicio", cuenta: CLIENTES, lado: DEBITA,
    texto: "La empresa le presta un servicio a crédito a un cliente.",
    pista: "Un servicio vendido sin cobrarlo también deja una deuda. ¿Esa deuda sube o baja?",
    acierto: "Un servicio vendido a crédito también hace subir la deuda: se debita.",
  },
  {
    id: "pago", cuenta: CLIENTES, lado: ACREDITA,
    /* E5 (Futaba): «abona» pasa a «paga», porque el abono no se enseña hasta T6 A4 y esta va antes (Shoko). */
    texto: "Un cliente paga una parte de lo que debe.",
    pista: "Después de pagar esa parte, ¿el cliente debe más o menos que antes?",
    /* Norma de diseño nueva (sin emojis como íconos): desde el lote 6d, todos los aciertos van sin emoji. */
    acierto: "Baja: se acredita. Lo que pagó ya no lo debe.",
  },
  {
    id: "devolucion", cuenta: CLIENTES, lado: ACREDITA,
    texto: "Un cliente que todavía debe una compra regresa parte de la mercancía.",
    pista: "Lo que el cliente regresa, ¿lo sigue teniendo que pagar? Piensa si su deuda sube o baja.",
    acierto: "Baja: se acredita. Lo que regresó ya no lo tiene que pagar.",
  },
  {
    id: "descuento", cuenta: CLIENTES, lado: ACREDITA,
    texto: "La empresa le rebaja a un cliente una parte de lo que le debe.",
    pista: "Con la rebaja, ¿el cliente debe más o menos que antes?",
    acierto: "Baja: se acredita. Ahora el cliente le debe menos.",
  },
];

/* El resumen (Futaba, lote 6a): ya no habla de pesos; cada ficha vale entera. */
export const resumenT6Act1 = (bien, cuantas) => `${bien} de ${cuantas} fichas bien al primer intento.`;

/* La corrección de Shoko (las opciones con punto y coma), con la frase del botón adaptada a la hoja de Mai. PARA SHOKO. */
export const ALT_T6_ACT1 = "Actividad de clasificación. Aparece un hecho. Elige entre tres opciones: Otra cuenta por cobrar; Clientes, se debita; o Clientes, se acredita. Toca el cajón donde va la ficha. Si fallas, tienes un intento más. Después de cada respuesta se lee la explicación.";
