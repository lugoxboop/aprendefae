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

/*
 * ═══════════ D8 · LA SEGUNDA VUELTA: OCHO FICHAS NUEVAS, EN SU ORDEN (Futaba, lote 18) ═══════════
 *
 * La vuelta 1 son las 8 de hoy (con su sorteo). Fuente: p. 196 (anticipos y avances; casa matriz; socios y
 * accionistas; préstamos a particulares) y p. 197 (débitos y créditos de Clientes). Reparto 4 · 2 · 2.
 */
export const FICHAS_V2_T6_ACT1 = [
  {
    id: "anticipo", cuenta: OTRA, lado: null,
    texto: "La empresa le entrega plata a un proveedor como anticipo de una compra que aún no recibe.",
    pista: "¿Esta deuda viene de una venta a crédito a un cliente? Mira quién recibió la plata y por qué.",
    acierto: "Es un anticipo a un proveedor, no una venta a crédito. Va en otra cuenta por cobrar: Anticipos y avances.",
  },
  {
    id: "hotel", cuenta: CLIENTES, lado: DEBITA,
    texto: "Un hotel hospeda a un cliente y le da 30 días para pagar la cuenta.",
    pista: "Después del hospedaje, ¿el cliente debe más o menos? No te guíes por quién presta el servicio.",
    acierto: "Es un servicio vendido a crédito: el cliente queda debiendo, así que se debita.",
  },
  {
    id: "matriz", cuenta: OTRA, lado: null,
    texto: "La casa matriz recibe plata de la empresa y se compromete a devolverla.",
    pista: "¿Hubo una venta a crédito? Piensa qué deudas recoge Cuentas por cobrar – clientes.",
    acierto: "Es una deuda de la casa matriz, no de un cliente. Va en otra cuenta por cobrar: Cuentas por cobrar a casa matriz.",
  },
  {
    id: "efectivo", cuenta: CLIENTES, lado: ACREDITA,
    texto: "Un cliente llega con efectivo y cancela la factura que tenía pendiente.",
    pista: "Después de pagar, ¿el cliente debe más o menos que antes?",
    acierto: "Baja: se acredita. La deuda se cancela.",
  },
  {
    id: "accionista", cuenta: OTRA, lado: null,
    texto: "Un accionista recibe plata de la empresa y firma que la devolverá.",
    pista: "Fíjate por qué el accionista le debe a la empresa. ¿La deuda vino de una venta a crédito?",
    acierto: "Es un préstamo, no una venta a crédito. Va en otra cuenta por cobrar: Cuentas por cobrar a socios y accionistas.",
  },
  {
    id: "neveras", cuenta: CLIENTES, lado: DEBITA,
    texto: "Un cliente se lleva tres neveras y firma la factura para pagarlas en dos meses.",
    pista: "Después de esto, ¿lo que debe el cliente sube o baja?",
    acierto: "Es una venta a crédito: el cliente queda debiendo las neveras, así que se debita.",
  },
  {
    id: "danadas", cuenta: CLIENTES, lado: ACREDITA,
    texto: "Un cliente devuelve dos cajas dañadas de un pedido que todavía no paga.",
    pista: "Lo que el cliente devuelve, ¿lo sigue teniendo que pagar?",
    acierto: "Baja: se acredita. Lo que devolvió ya no lo tiene que pagar.",
  },
  {
    id: "vecino", cuenta: OTRA, lado: null,
    texto: "Un comerciante vecino, que no es cliente, recibe plata de la empresa para devolverla en un mes.",
    pista: "Mira por qué esta persona le debe a la empresa. ¿Compró algo a crédito?",
    acierto: "Es un préstamo a un particular, no una venta a crédito. Va en otra cuenta por cobrar: Préstamos a particulares.",
  },
];

/*
 * ═══════════ D4 · DOS DECISIONES (P2 de Mai y devoluciones de Futaba, lote 19) ═══════════
 *
 * La decisión 1 se parte: «Clientes» u «Otra cuenta por cobrar». Las de Clientes siguen con la 2: tocar el
 * DEBE o el HABER de la T «Cuentas por cobrar – clientes», donde entran como «Ficha N».
 */
export const CAJONES_D4_T6_ACT1 = [
  { cuenta: CLIENTES, rotulo: "Clientes" },
  { cuenta: OTRA, rotulo: "Otra cuenta por cobrar" },
];
/* La pista de la decisión 1 cuando una de Clientes va a otra cuenta (la de cada ficha habla del lado, que es la 2). PARA SHOKO. */
export const PISTA_CUENTA_T6_ACT1 = "Mira de dónde viene la deuda: ¿de una venta a crédito a un cliente, o de un préstamo?";
export const SEGUNDA_T6_ACT1 = { pregunta: "¿En qué lado de la T entra?", debe: "DEBE", haber: "HABER", ficha: (n) => `Ficha ${n}` };

const SEGUNDA_POR_FICHA_T6 = {
  "venta-mercancia": { pista: "Después de esto, ¿lo que debe el cliente sube o baja? Busca el lado donde sube.", porque: "La deuda del cliente sube, y en una cuenta de activo lo que sube va al DEBE." },
  "venta-servicio": { pista: "Un servicio vendido sin cobrarlo deja una deuda. ¿Esa deuda sube o baja?", porque: "El servicio queda debiéndose: la deuda sube, y lo que sube en Clientes va al DEBE." },
  pago: { pista: "Después de pagar esa parte, ¿el cliente debe más o menos que antes?", porque: "Lo que pagó ya no lo debe: la deuda baja, y lo que baja en Clientes va al HABER." },
  devolucion: { pista: "Lo que el cliente regresa, ¿lo sigue teniendo que pagar?", porque: "Lo que regresó ya no lo tiene que pagar: la deuda baja y va al HABER." },
  descuento: { pista: "Con la rebaja, ¿el cliente debe más o menos que antes?", porque: "La rebaja le quita deuda al cliente: lo que baja en Clientes va al HABER." },
};
SEGUNDA_POR_FICHA_T6.hotel = SEGUNDA_POR_FICHA_T6["venta-servicio"];
SEGUNDA_POR_FICHA_T6.neveras = SEGUNDA_POR_FICHA_T6["venta-mercancia"];
SEGUNDA_POR_FICHA_T6.efectivo = SEGUNDA_POR_FICHA_T6.pago;
SEGUNDA_POR_FICHA_T6.danadas = SEGUNDA_POR_FICHA_T6.devolucion;
export { SEGUNDA_POR_FICHA_T6 as DEVOLUCIONES_SEGUNDA_T6_ACT1 };

/*
 * ═══════════ LOTE 23 · «¿EN CUÁL?» (Shoko; textos de Futaba pendientes) ═══════════
 *
 * Las fichas de otra cuenta también llevan segunda decisión: en cuál de las cuentas de la p. 196 va. Las
 * opciones son los nombres de cuenta que ya dicen los aciertos publicados. `EN_CUAL_POR_FICHA` sale de
 * esos mismos aciertos; «prestamo-cliente» espera a Futaba (lo resuelve con el libro) y, mientras no
 * esté, esa ficha sigue con la decisión 1 sola. PROVISIONAL HASTA FUTABA, PARA SHOKO: la pista general;
 * el porqué del segundo error y el acierto son el acierto publicado de la ficha.
 */
export const EN_CUAL_T6_ACT1 = {
  pregunta: "¿En cuál?",
  opciones: [
    { id: "socios", texto: "Cuentas por cobrar a socios y accionistas" },
    { id: "trabajadores", texto: "Cuentas por cobrar a trabajadores" },
    { id: "particulares", texto: "Préstamos a particulares" },
    { id: "anticipos", texto: "Anticipos y avances" },
    { id: "matriz", texto: "Cuentas por cobrar a casa matriz" },
  ],
  pista: "Mira quién recibe la plata y por qué.",
};
export const EN_CUAL_POR_FICHA = {
  socio: "socios", trabajador: "trabajadores", particular: "particulares",
  anticipo: "anticipos", matriz: "matriz", accionista: "socios", vecino: "particulares",
};

/* El resumen (Futaba, lote 6a): ya no habla de pesos; cada ficha vale entera. */
export const resumenT6Act1 = (bien, cuantas) => `${bien} de ${cuantas} fichas bien al primer intento.`;

/* La corrección de Shoko (las opciones con punto y coma), con la frase del botón adaptada a la hoja de Mai. PARA SHOKO. */
export const ALT_T6_ACT1 = "Actividad de clasificación. Aparece un hecho. Elige entre tres opciones: Otra cuenta por cobrar; Clientes, se debita; o Clientes, se acredita. Toca el cajón donde va la ficha. Si fallas, tienes un intento más. Después de cada respuesta se lee la explicación.";
