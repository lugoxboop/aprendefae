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
 * Como en T1-6, el ✅ y el ❌ van al inicio de cada devolución y Retro los
 * separa; lo que sigue al emoji es literal de Futaba.
 *
 * El segundo fallo sigue la REGLA ÚNICA de la célula (b5SegundoFallo.js): el
 * acierto sin «Sí.» y con «No es esa.» delante. Por eso no hay columna de
 * segundo fallo aquí: la de Futaba sale sola del acierto, y la prueba la
 * compara con la columna guardada en el paquete.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const T6_ACT1 = {
  id: "b5-t6-a1",
  nombre: "¿Clientes o otra cuenta por cobrar?",
  dificultad: "facil",
  fpBase: 10,
  /* R10 (hoja de fusiones de Mai): nueve fichas, entre 2 y 4 por cajón. El banco tiene 4 · 3 · 3. */
  porPartida: 9,
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
 * por cobrar). `c5` marca las dos ventas a crédito: si eligen «Se acredita»,
 * la devolución es la C5 y no la C (Futaba: la C5 tiene prioridad).
 */
export const FICHAS_T6_ACT1 = [
  {
    id: "socio", cuenta: OTRA, lado: null,
    /* Lote 6a (Futaba): cada préstamo con otra forma; solo este dice «prestada». */
    texto: "Un socio le pide plata prestada a la empresa, y ella se la da.",
    acierto: "✅ Sí. Es un préstamo, no una venta a crédito. Va en otra cuenta por cobrar: Cuentas por cobrar a socios y accionistas.",
  },
  {
    id: "trabajador", cuenta: OTRA, lado: null,
    texto: "Un trabajador necesita plata y la empresa se la entrega; él la pagará por cuotas.",
    acierto: "✅ Sí. Es un préstamo, no una venta a crédito. Va en otra cuenta por cobrar: Cuentas por cobrar a trabajadores.",
  },
  {
    id: "particular", cuenta: OTRA, lado: null,
    texto: "Alguien que no es cliente, socio ni trabajador recibe plata de la empresa. Tiene que devolverla.",
    acierto: "✅ Sí. Es un préstamo, no una venta a crédito. Va en otra cuenta por cobrar: Préstamos a particulares.",
  },
  {
    /* Corrección obligatoria de Shoko: quien se guíe por la palabra «cliente» la falla. Lote 6a: la versión de Shoko, sin «no compra nada». */
    id: "prestamo-cliente", cuenta: OTRA, lado: null,
    texto: "Un cliente le pide plata a la empresa, y ella se la entrega para que la devuelva.",
    acierto: "✅ Sí. Es un cliente, pero esto es un préstamo, no una venta a crédito. Por eso no va en Cuentas por cobrar – clientes, sino en otra cuenta por cobrar.",
  },
  {
    id: "venta-mercancia", cuenta: CLIENTES, lado: DEBITA, c5: true,
    /* Entrega 4 de Futaba (calidad): los cinco hechos de Clientes, con otras palabras. */
    texto: "Un cliente se lleva un pedido de mercancía a crédito, para pagarlo a fin de mes.",
    acierto: "✅ Sí. Es una venta a crédito: el cliente queda debiendo, así que se debita.",
  },
  {
    id: "venta-servicio", cuenta: CLIENTES, lado: DEBITA, c5: true,
    texto: "La empresa le presta un servicio a crédito a un cliente.",
    acierto: "✅ Sí. Un servicio vendido a crédito también hace subir la deuda: se debita.",
  },
  {
    id: "cheque", cuenta: CLIENTES, lado: DEBITA,
    texto: "El banco no le paga a la empresa el cheque de un cliente: se lo devuelve.",
    acierto: "✅ Sí. Sube: se debita. Como el cheque no se cobró, el cliente vuelve a deber.",
  },
  {
    id: "pago", cuenta: CLIENTES, lado: ACREDITA,
    texto: "Un cliente abona una parte de lo que debe.",
    acierto: "✅ Sí. Baja: se acredita. Lo que abonó ya no lo debe.",
  },
  {
    id: "devolucion", cuenta: CLIENTES, lado: ACREDITA,
    texto: "Un cliente que todavía debe una compra regresa parte de la mercancía.",
    acierto: "✅ Sí. Baja: se acredita. Lo que regresó ya no lo tiene que pagar.",
  },
  {
    id: "descuento", cuenta: CLIENTES, lado: ACREDITA,
    texto: "La empresa le rebaja a un cliente una parte de lo que le debe.",
    acierto: "✅ Sí. Baja: se acredita. Ahora el cliente le debe menos.",
  },
];

/* ═══════════ LAS DEVOLUCIONES DE ERROR ═══════════ */

export const ERROR_T6_ACT1 = {
  /* A · un hecho de Clientes puesto en «Otra cuenta por cobrar». */
  A: "❌ No es esa. En este hecho cambia lo que un cliente le debe a la empresa. Eso se anota en Cuentas por cobrar – clientes.",
  /* B · un préstamo puesto en «Clientes». La versión recomendada por Shoko, con el nombre completo. */
  B: "❌ No es esa. Es un préstamo, no una venta a crédito. Cuentas por cobrar – clientes solo recoge lo que deben los clientes por ventas a crédito. Este va en otra cuenta por cobrar.",
  /* C · acertó «Clientes» y falló el lado. */
  C: "❌ Vas bien: es Clientes. Ahora pregúntate si con este hecho lo que deben los clientes sube o baja. Si sube, se debita. Si baja, se acredita.",
  /* C5 · una venta a crédito puesta en «Se acredita»: la palabra engaña. Comillas internas “ ” (auditoría integral). */
  C5: "❌ Vas bien: es Clientes. Ojo con la palabra “crédito”: el nombre del negocio no dice en qué lado se anota. Pregúntate si lo que deben los clientes sube o baja.",
};

/* El resumen (Futaba, lote 6a): ya no habla de pesos; cada ficha vale entera. */
export const resumenT6Act1 = (bien, cuantas) => `${bien} de ${cuantas} fichas bien al primer intento.`;

/* La corrección de Shoko (las opciones con punto y coma), con la frase del botón adaptada a la hoja de Mai. PARA SHOKO. */
export const ALT_T6_ACT1 = "Actividad de clasificación. Aparece un hecho. Elige entre tres opciones: Otra cuenta por cobrar; Clientes, se debita; o Clientes, se acredita. Toca el cajón donde va la ficha. Si fallas, tienes un intento más. Después de cada respuesta se lee la explicación.";
