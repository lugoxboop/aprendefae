/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 1 DE APRENDER — «Lo que otros le deben a la empresa».
 *
 * Célula B. Todo el texto que lee el estudiante vive en ESTE archivo. Es el
 * contenido de Futaba con el PASA de Shoko, en este orden de precedencia:
 *   1. la secuencia final de la capa 2 (9 pasos, el 1 partido en dos) y el
 *      término 5 nuevo;
 *   2. las tres líneas corregidas (la glosa de nota débito y la devolución
 *      correcta de la capa 4; la del término 5 la reemplaza la de arriba);
 *   3. la pieza corregida, para todo lo demás.
 * Encima de todo, la «versión que manda» de Futaba del 14-oct (PASA de
 * Shoko): el hecho 4 de la capa 3, la devolución correcta de la capa 4 y los
 * siete pies de la capa 3 (★).
 * Las marcas de auditoría ([p. X], [CONSTRUCCIÓN], ◆) no se copian. De la
 * etiqueta del paso 1, solo «Libro, p. 197»: lo que iba después de «·» era
 * una nota interna.
 *
 * Diseño: guía v2 de Mai, con 8 pasos; la de Futaba tiene 9. Lo que depende
 * del número de pasos (resaltados de los pasos 1 y 2) es provisional hasta la
 * v3, y está marcado abajo.
 *
 * Cuando Futaba reescriba los textos que no llegan a 65 en INFLESZ, el cambio
 * es solo de datos.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════ LA GLOSA PROVISIONAL DE «NOTA DÉBITO» ═══════════ */

/*
 * El Tema 4 (Célula A) es el que define «nota débito». Mientras no lo
 * publique, esta pieza lleva su propia glosa, debajo del término 4. La prueba
 * de guardia (b5-t6-glosa-nota-debito.test.mjs) se pone roja el día que
 * cualquier otro tema defina el término: entonces esta glosa se reemplaza por
 * la definición publicada y pasa por auditoría.
 */
export const GLOSA_NOTA_DEBITO = {
  id: "b5-t6-glosa-nota-debito",
  texto: "Con una nota débito, el banco le resta un valor a la cuenta bancaria de la empresa; por ejemplo, cuando devuelve el cheque con el que un cliente había pagado.",
};

/* ═══════════ LA PIEZA (lo que lee CuatroCapas: título, objetivo y capa 1) ═══════════ */

/*
 * La nota de «cartera» del término 2. La guía v1 (§3) la pone DEBAJO de la
 * cita, pero CuatroCapas admite un solo bloque bajo cada término, y el
 * componente no se toca. Queda aquí, sin pintarse, hasta que Mai decida.
 */
export const NOTA_CLIENTES_PENDIENTE = "El libro también la llama cartera; es lo mismo. Aquí la cuenta se llama “Cuentas por cobrar – clientes”.";

export const PIEZA_LO_QUE_LE_DEBEN = {
  id: "b5-t6-a1-lo-que-otros-le-deben",
  numero: 1,
  titulo: "Lo que otros le deben a la empresa",
  objetivo: "Vas a ver qué cabe en las cuentas por cobrar y qué hace subir o bajar lo que los clientes le deben a la empresa.",
  nombres: [
    {
      termino: "Cuentas por cobrar",
      definicion: "Ya viste la cuenta de los clientes. Las cuentas por cobrar son el grupo completo: ahí se anota lo que otras personas o empresas le deben a la empresa. Es un activo porque es un derecho: la empresa tiene derecho a cobrar esa deuda. Incluye las deudas comerciales y las no comerciales (las que vienen de la actividad del negocio y las que vienen de otros motivos).",
      delLibro: "«En la cuenta cuentas por cobrar se contabilizan los valores que terceras personas le adeudan a la empresa.» (p. 195)",
    },
    {
      termino: "Clientes",
      definicion: "Quizás es la parte más importante de las cuentas por cobrar: lo que deben los clientes por bienes y servicios que la empresa les vendió a crédito y que todavía no han pagado.",
      delLibro: "«Los clientes son quizás el concepto más importante dentro de lo que se clasifica como cuentas por cobrar.» (p. 196)",
    },
    {
      termino: "Otras cuentas por cobrar",
      definicion: "No solo los clientes le deben a la empresa. También caben, entre otras, las deudas de socios y accionistas, las de trabajadores y los préstamos a particulares. Cualquier cosa que alguien le deba a la empresa va en las cuentas por cobrar, en la cuenta que mejor le corresponda.",
    },
    {
      termino: "Cuándo sube lo que deben los clientes",
      definicion: "Cuentas por cobrar – clientes es una cuenta de activo: cuando lo que deben los clientes sube, se debita. Sube, entre otras causas, por una venta a crédito de bienes o servicios, o por una nota débito cuando el banco devuelve el cheque con el que un cliente había pagado.",
      delLibro: GLOSA_NOTA_DEBITO.texto,
      rotuloDelLibro: "Nota",
      glosa: GLOSA_NOTA_DEBITO.id,
    },
    {
      termino: "Cuándo baja lo que deben los clientes",
      definicion: "Cuando lo que deben los clientes baja, se acredita. Baja cuando el cliente paga. También baja cuando devuelve mercancía que había comprado a crédito y todavía no había pagado: es una devolución de ventas. Baja cuando la empresa le otorga un descuento sobre lo que todavía le debe. Y baja cuando la deuda pasa a difícil cobro, que se explica más adelante.",
    },
  ],
};

/* ═══════════ CAPA 2 · «MÍRELO FUNCIONAR» ═══════════ */

/* Los rótulos de la escena (guía v1 §9): fragmentos de los pasos, del cierre o de la capa 4. */
export const ESCENA_T6 = {
  perspectiva: "En los libros de Comercializadora Santa Pacha",
  dia10: "10 de enero",
  dia25: "25 de enero",
  venta: "Venta a crédito",
  monto: "$1.350.000",
  plazo: "15 días",
  pago: "La Barranquillera paga",
  ingresos: "Ingresos por ventas",
  clientes: "Cuentas por cobrar – clientes",
  caja: "Caja",
  sube: "Sube $1.350.000",
  baja: "Baja $1.350.000",
  debita: "se debita",
  acredita: "se acredita",
};

/* La secuencia final de Futaba (PASA de Shoko): 9 pasos y el cierre, cada uno con su pie de fuente. */
export const PASOS_T6 = [
  { texto: "El 10 de enero, Comercializadora Santa Pacha vende mercancía.", pie: "Libro, p. 197" },
  { texto: "Se la vende a crédito a La Barranquillera, por $1.350.000.", pie: "Libro, p. 197" },
  { texto: "Le da 15 días para pagar la factura.", pie: "Libro, p. 197" },
  { texto: "Ese mismo día, Ingresos por ventas se acredita por $1.350.000: es el ingreso de la venta.", pie: "Basado en el libro, p. 198" },
  { texto: "La deuda de La Barranquillera queda en Cuentas por cobrar – clientes, que sube $1.350.000: se debita.", pie: "Libro, p. 198" },
  { texto: "El 25 de enero, La Barranquillera paga.", pie: "Libro, p. 197" },
  { texto: "La plata entra a Caja, que se debita por $1.350.000.", pie: "Libro, p. 198" },
  { texto: "La deuda se cancela: Cuentas por cobrar – clientes baja $1.350.000, se acredita.", pie: "Libro, p. 198" },
  { texto: "El 25 no se anota ningún ingreso nuevo: el ingreso ya se anotó el 10, con la venta.", pie: "Basado en el libro, p. 198" },
];
export const CIERRE_T6 = {
  texto: "Una venta a crédito, dos momentos: el día de la venta sube la deuda y se anota el ingreso; el día del pago baja la deuda y entra la plata.",
  pie: "Basado en el libro, p. 198",
};

/* ═══════════ CAPA 3 · «AHORA PRUEBE USTED» ═══════════ */

export const CONSIGNA_CAPA_3_T6 = "Toca cada hecho y mira si lo que deben los clientes sube, baja o no cambia.";

/*
 * Los seis hechos, con su pie de fuente (★, versión que manda de Futaba):
 * «Libro» si lo que dice la caja está en la página; «Basado» si agrega una
 * condición o una conclusión. Siete pies: uno por caja y el del bloque final.
 */
export const HECHOS_T6 = [
  { id: "venta-credito", hecho: "La empresa le vende a crédito a un cliente.", revela: "Sube: se debita. El cliente queda debiendo lo que compró.", pie: "Libro, p. 197" },
  { id: "pago", hecho: "Un cliente paga lo que debía.", revela: "Baja: se acredita. La deuda se cancela.", pie: "Libro, p. 197" },
  { id: "cheque-devuelto", hecho: "El banco devuelve el cheque con el que un cliente había pagado.", revela: "Sube: se debita, con una nota débito. Ese pago no llegó a la empresa, así que la deuda vuelve.", pie: "Basado en el libro, pp. 191 y 197" },
  { id: "devolucion", hecho: "Un cliente devuelve mercancía que compró a crédito y aún no paga.", revela: "Baja: se acredita. Es una devolución de ventas.", pie: "Basado en el libro, p. 197" },
  { id: "descuento", hecho: "La empresa le otorga a un cliente un descuento sobre lo que todavía le debe.", revela: "Baja: se acredita.", pie: "Basado en el libro, p. 197" },
  { id: "contado", hecho: "La empresa le vende de contado a un cliente.", revela: "No cambia. El cliente pagó en el momento y no queda debiendo nada.", pie: "Basado en el libro, p. 197" },
];
export const FINAL_CAPA_3_T6 = {
  texto: "Fíjate: “venta a crédito” lleva la palabra crédito, pero a la cuenta del cliente se le hace un débito. El nombre del negocio no dice en qué lado se anota.",
  pie: "Basado en el libro, p. 197",
};

/* ═══════════ CAPA 4 · «EN UNA FRASE» (UnaFrase, sin cambios) ═══════════ */

export const PREGUNTA_FINAL_T6 = "¿Qué le pasa a Cuentas por cobrar – clientes el día que el cliente paga?";
/* En el orden de Futaba; UnaFrase las baraja una vez al cargar. */
export const OPCIONES_FINAL_T6 = [
  {
    id: "b5-t6-baja",
    texto: "Baja, porque la deuda se paga; el ingreso ya estaba anotado.",
    correcta: true,
    feedback: "Correcto. El 25 de enero, en los libros de Comercializadora Santa Pacha, Cuentas por cobrar – clientes baja: se acredita. No se anota ningún ingreso. Ese ya estaba desde el 10.",
  },
  {
    id: "b5-t6-sube",
    texto: "Sube, porque ese día a la empresa le entra plata del cliente.",
    correcta: false,
    feedback: "No es esa. La plata entra a Caja, y Caja sí sube. Lo que deben los clientes baja, porque la deuda se pagó.",
  },
  {
    id: "b5-t6-no-cambia",
    texto: "No cambia, porque el pago del cliente solo se anota en Caja.",
    correcta: false,
    feedback: "No es esa. En el ejemplo, el pago movió dos cuentas: Caja subió y Cuentas por cobrar – clientes bajó, por el mismo valor.",
  },
  {
    id: "b5-t6-baja-con-ingreso",
    texto: "Baja, y ese mismo día se anota también el ingreso por la venta.",
    correcta: false,
    feedback: "No es esa. El ingreso se anotó el día de la venta, el 10 de enero. El día del pago no hay un ingreso nuevo: solo entra la plata y baja la deuda.",
  },
];
