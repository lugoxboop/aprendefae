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
  objetivo: "Decidir si un hecho va en Clientes o en otra cuenta por cobrar, y si se debita o se acredita.",
  consigna: "Lee el hecho. Elige la cuenta y, si es Clientes, cómo se anota.",
};

/* Las tres líneas de «¿Cómo se juega?». La tercera es la de b5-t5-a1. */
export const REGLAS_T6_ACT1 = [
  "Elige si el hecho va en Clientes o en otra cuenta por cobrar.",
  "Si va en Clientes, elige también si se debita o se acredita.",
  "Pulsa el botón para colocar la ficha; si fallas, tienes un intento más.",
];

/* ═══════════ LOS DOS NIVELES ═══════════ */

export const OTRA = "otra";
export const CLIENTES = "clientes";
export const DEBITA = "debita";
export const ACREDITA = "acredita";

/*
 * «Otra cuenta por cobrar» arriba y «Clientes» abajo: la regla §2.2 de la
 * guía v2 de Mai para b5-t5-a1 (la pestaña que abre el panel va al final y no
 * empuja a ninguna otra). Decisión de Kaede, anotada en el PR.
 */
export const CUENTAS = [
  { id: OTRA, rotulo: "Otra cuenta por cobrar" },
  { id: CLIENTES, rotulo: "Clientes" },
];
export const LADOS = [
  { id: DEBITA, rotulo: "Se debita" },
  { id: ACREDITA, rotulo: "Se acredita" },
];

/* Los rótulos del botón (Futaba, estado 2). */
export const BOTON_T6_ACT1 = {
  nada: "Elige una cuenta",
  falta: "Elige cómo se anota",
  colocar: "Colocar la ficha",
};

/* ═══════════ EL BANCO: 10 FICHAS ═══════════ */

/*
 * `cuenta` y `lado` son la respuesta (`lado` va a null en las de otra cuenta
 * por cobrar). `c5` marca las dos ventas a crédito: si eligen «Se acredita»,
 * la devolución es la C5 y no la C (Futaba: la C5 tiene prioridad).
 */
export const FICHAS_T6_ACT1 = [
  {
    id: "socio", cuenta: OTRA, lado: null,
    texto: "La empresa le presta plata a uno de sus socios.",
    acierto: "✅ Sí. Es un préstamo, no una venta a crédito. Va en otra cuenta por cobrar: Cuentas por cobrar a socios y accionistas.",
  },
  {
    id: "trabajador", cuenta: OTRA, lado: null,
    texto: "La empresa le presta plata a uno de sus trabajadores.",
    acierto: "✅ Sí. Es un préstamo, no una venta a crédito. Va en otra cuenta por cobrar: Cuentas por cobrar a trabajadores.",
  },
  {
    id: "particular", cuenta: OTRA, lado: null,
    texto: "La empresa le presta plata a un particular.",
    acierto: "✅ Sí. Es un préstamo, no una venta a crédito. Va en otra cuenta por cobrar: Préstamos a particulares.",
  },
  {
    /* Corrección obligatoria de Shoko: quien se guíe por la palabra «cliente» la falla. */
    id: "prestamo-cliente", cuenta: OTRA, lado: null,
    texto: "La empresa le presta plata a uno de sus clientes.",
    acierto: "✅ Sí. Es un cliente, pero esto es un préstamo, no una venta a crédito. Por eso no va en Cuentas por cobrar – clientes, sino en otra cuenta por cobrar.",
  },
  {
    id: "venta-mercancia", cuenta: CLIENTES, lado: DEBITA, c5: true,
    texto: "La empresa le vende mercancía a crédito a un cliente.",
    acierto: "✅ Sí. Sube: se debita. El cliente queda debiendo lo que compró.",
  },
  {
    id: "venta-servicio", cuenta: CLIENTES, lado: DEBITA, c5: true,
    texto: "La empresa le presta un servicio a crédito a un cliente.",
    acierto: "✅ Sí. Un servicio vendido a crédito también hace subir la deuda: se debita.",
  },
  {
    id: "cheque", cuenta: CLIENTES, lado: DEBITA,
    texto: "El banco devuelve el cheque con el que un cliente había pagado.",
    acierto: "✅ Sí. Sube: se debita. Ese pago no llegó a la empresa, así que la deuda vuelve.",
  },
  {
    id: "pago", cuenta: CLIENTES, lado: ACREDITA,
    texto: "Un cliente paga lo que debía.",
    acierto: "✅ Sí. Baja: se acredita. La deuda se cancela.",
  },
  {
    id: "devolucion", cuenta: CLIENTES, lado: ACREDITA,
    texto: "Un cliente devuelve mercancía que compró a crédito y aún no paga.",
    acierto: "✅ Sí. Baja: se acredita. Es una devolución de ventas.",
  },
  {
    id: "descuento", cuenta: CLIENTES, lado: ACREDITA,
    texto: "La empresa le otorga a un cliente un descuento sobre lo que todavía le debe.",
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
  /* C5 · una venta a crédito puesta en «Se acredita»: la palabra «crédito» engaña. */
  C5: "❌ Vas bien: es Clientes. Ojo con la palabra «crédito»: el nombre del negocio no dice en qué lado se anota. Pregúntate si lo que deben los clientes sube o baja.",
};

/* ═══════════ EL PUNTAJE: 60 % LA CUENTA, 40 % EL LADO (como T1-6) ═══════════ */

export const PESO_CUENTA = 0.6;
export const PESO_LADO = 0.4;

/* El resumen (Futaba, estado 5). {X} lo formatea el componente, como T1-6. */
export const resumenT6Act1 = (bien, cuantas, x) =>
  `${bien} de ${cuantas} completas al primer intento. Cada ficha valía ${x} %. Elegir la cuenta pesa 60 %. Elegir si se debita o se acredita pesa 40 %. En las de otra cuenta por cobrar, la primera elección vale toda la ficha.`;

export const ALT_T6_ACT1 = "Actividad de clasificación. Aparece un hecho. Elige si va en Clientes o en otra cuenta por cobrar. Si eliges Clientes, elige también si se debita o se acredita. Luego pulsa Colocar la ficha. Si fallas, tienes un intento más. Después de cada respuesta se lee la explicación.";
