/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 1 DE APRENDER — «Lo que otros le deben a la empresa».
 *
 * Célula B. Todo el texto que lee el estudiante vive en ESTE archivo. Es el
 * contenido de Futaba con el PASA de Shoko, en este orden de precedencia:
 *   1. la secuencia final de la capa 2 (9 pasos, el 1 partido en dos) y el
 *      término 5 nuevo;
 *   2. las tres líneas corregidas (la nota de nota débito —hoy, la definición
 *      del Tema 4— y la devolución
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

/* ═══════════ LA NOTA DE «NOTA DÉBITO»: LA DEFINICIÓN DEL TEMA 4 ═══════════ */

/*
 * Esta pieza llevaba una glosa PROVISIONAL de «nota débito» (b5-t6-glosa-
 * nota-debito) mientras el Tema 4 no la definiera. El Tema 4 · A4 de la
 * Célula D la define (NOTA_DEBITO en contabilidadT4A4.js, acuerdo C4 / A4-P),
 * así que la glosa propia se retira: dice ahora, letra por letra, la
 * definición del Tema 4. Así el sitio tiene una sola explicación del término.
 * Desde B2 (un término por pantalla) ya no va como nota debajo de «Cuándo
 * sube…»: es la definición del término 4, «Nota débito».
 *
 * La guardia (b5-t6-glosa-nota-debito.test.mjs) ya no espera a que otro tema
 * la defina: ahora se pone roja si la definición de otro tema y esta dejan de
 * decir lo mismo.
 */
export const NOTA_DEBITO_T6 = {
  rotulo: "Nota",
  texto: "Con una nota débito, el banco le resta un valor a la cuenta de la empresa. Por ejemplo, cuando le cobra una chequera, o cuando le devuelve el cheque con el que un cliente le había pagado.",
};

/* ═══════════ LA PIEZA (lo que lee CuatroCapas: título, objetivo y capa 1) ═══════════ */

/*
 * La nota de «cartera» del término 2 (guía v1 §3). Viaja en `notaDebajo` y
 * la pinta CuatroCapas con su rótulo, siempre a la vista bajo la definición;
 * la cita del libro va plegada en «Ver lo que dice el libro» (auditoría de
 * interfaz de Shoko, 15-oct). Decisión de la auditoría integral de Shoko
 * (15-oct): va.
 */
export const NOTA_CLIENTES = {
  rotulo: "Nota",
  texto: "El libro también la llama cartera. Aquí se llama “Cuentas por cobrar – clientes”.",
};

export const PIEZA_LO_QUE_LE_DEBEN = {
  id: "b5-t6-a1-lo-que-otros-le-deben",
  numero: 1,
  titulo: "Lo que otros le deben a la empresa",
  objetivo: "Vas a ver qué cabe en las cuentas por cobrar y qué hace subir o bajar lo que los clientes le deben a la empresa.",
  /*
   * B2 · un término por pantalla (Futaba, 15-oct): seis pantallas. «Nota
   * débito» pasa de nota debajo de «Cuándo sube…» a término propio, ANTES de
   * él, con la definición del Tema 4 letra por letra (NOTA_DEBITO_T6). «Cuándo
   * sube…» queda sin la nota debajo.
   */
  nombres: [
    {
      termino: "Cuentas por cobrar",
      definicion: "Es todo lo que otras personas o empresas le deben a la empresa. Se considera un activo, porque es un derecho de cobro. Incluye las deudas comerciales, que vienen del negocio, y las no comerciales.",
      delLibro: "«…se contabilizan los valores que terceras personas le adeudan a la empresa.» (p. 195)",
    },
    {
      termino: "Clientes",
      definicion: "Es lo que deben los clientes por bienes y servicios que la empresa les vendió a crédito y que todavía no han pagado.",
      delLibro: "«…quizás el concepto más importante dentro de lo que se clasifica como cuentas por cobrar.» (p. 196)",
      notaDebajo: NOTA_CLIENTES,
    },
    {
      termino: "Otras cuentas por cobrar",
      definicion: "No solo los clientes le deben a la empresa. También caben, entre otras, las deudas de socios y accionistas, las de trabajadores y los préstamos a particulares. Cualquier cosa que alguien le deba a la empresa va en las cuentas por cobrar, en la cuenta que mejor le corresponda.",
    },
    {
      termino: "Nota débito",
      /* La definición del Tema 4, letra por letra: la guardia b5-t6-glosa-nota-debito mira este término. */
      definicion: NOTA_DEBITO_T6.texto,
    },
    {
      termino: "Cuándo sube lo que deben los clientes",
      definicion: "Cuentas por cobrar – clientes es una cuenta de activo: cuando lo que deben los clientes sube, se debita. Sube, entre otras causas, por una venta a crédito de bienes o servicios, o por una nota débito cuando el banco devuelve el cheque con el que un cliente había pagado.",
    },
    {
      termino: "Cuándo baja lo que deben los clientes",
      /* Texto de Futaba (p. 197 y pp. 199-200). CuatroCapas no pinta pies en esta pieza: el pie queda en los datos. */
      definicion: "Cuando lo que deben los clientes baja, se acredita. Baja cuando el cliente paga. Baja cuando devuelve mercancía comprada a crédito que aún no pagaba: es una devolución de ventas. Baja con un descuento sobre lo que aún debe. Y baja cuando la deuda se da por perdida.",
      pie: "Basado en el libro, pp. 197 y 199-200",
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

/* Consigna y decisión: entrega 2 de Futaba; la pregunta de la caja es de Mai (hoja 6), para Shoko. */
export const CONSIGNA_CAPA_3_T6 = "Toca cada hecho y decide si lo que deben los clientes sube, baja o no cambia. Después, mira la razón.";
export const PREGUNTA_CAPA_3_T6 = "¿Qué pasa con lo que deben los clientes?";
export const OPCIONES_CAPA_3_T6 = [{ id: "sube", texto: "Sube" }, { id: "baja", texto: "Baja" }, { id: "no-cambia", texto: "No cambia" }];

/*
 * Los seis hechos, con su pie de fuente (★, versión que manda de Futaba):
 * «Libro» si lo que dice la caja está en la página; «Basado» si agrega una
 * condición o una conclusión. Siete pies: uno por caja y el del bloque final.
 */
/*
 * Lote C2 · C1 · C7 de Futaba (PASA de Shoko): C1-4 cambia cinco hechos (la
 * respuesta ya estaba en la capa 2 o en el término) y, en dos cajas, lo que
 * se revela, la devolución o el pie; C2 le da a cada caja su pista.
 */
export const HECHOS_T6 = [
  { id: "venta-credito", corto: "Servicio a crédito", hecho: "Un taller le arregla el carro a un cliente a crédito: le da 30 días para pagar.", revela: "Sube: se debita. El cliente queda debiendo el arreglo.", pie: "Basado en el libro, p. 197", correcta: "sube", falla: "Aunque diga “crédito”, el cliente queda debiendo el arreglo: sube.", pista: "Después de esto, ¿el cliente ya pagó o quedó debiendo algo?" },
  { id: "pago", corto: "Pago", hecho: "Un cliente paga la mitad de lo que debe.", revela: "Baja: se acredita, pero solo por lo que pagó. El resto lo sigue debiendo.", pie: "Libro, p. 197", correcta: "baja", falla: "Lo que pagó ya no lo debe; el resto lo sigue debiendo.", pista: "Piensa en cuánto debe el cliente justo después de pagar esa parte." },
  { id: "cheque-devuelto", corto: "Cheque devuelto", hecho: "El cheque con el que un cliente pagó su factura rebota: el banco no lo paga.", revela: "Sube: se debita, con una nota débito. Ese pago no llegó a la empresa, así que la deuda vuelve.", pie: "Basado en el libro, pp. 191 y 197", correcta: "sube", falla: "El cheque no se cobró, así que el pago no cuenta: la deuda sube otra vez.", pista: "Si el banco no le pagó el cheque, ¿el cliente sí canceló su deuda?" },
  { id: "devolucion", corto: "Devolución", hecho: "Llegan de vuelta unas cajas de un pedido que el cliente aún no paga.", revela: "Baja: se acredita. Es una devolución de ventas.", pie: "Basado en el libro, p. 197", correcta: "baja", falla: "Lo que devuelve ya no lo tiene que pagar: baja.", pista: "¿Tiene que pagar el cliente lo que ya regresó?" },
  { id: "descuento", corto: "Descuento", hecho: "Un cliente recibe un descuento sobre la factura que todavía no ha pagado.", revela: "Baja: se acredita.", pie: "Basado en el libro, p. 197", correcta: "baja", falla: "El descuento rebaja lo que el cliente debe: baja.", pista: "Un descuento sobre una deuda, ¿qué le hace a lo que el cliente tiene que pagar?" },
  { id: "contado", corto: "venta de contado", hecho: "La empresa le vende de contado a un cliente.", revela: "No cambia. El cliente pagó en el momento y no queda debiendo nada.", pie: "Basado en el libro, p. 197", correcta: "no-cambia", falla: "Pagó en el momento, así que no queda debiendo nada: no cambia.", pista: "Si paga en el mismo momento, ¿queda alguna deuda por anotar?" },
];
/*
 * La figura de la capa 3 (Mai, enganche B1-B5 §2b; textos nuevos, para
 * Shoko): la cuenta T de Cuentas por cobrar – clientes. Al decidirse un
 * hecho, su nombre corto (`corto`) entra en el DEBE si lo que deben sube, en
 * el HABER si baja; si no cambia, va debajo: «Sin movimiento: venta de
 * contado». Siempre con la respuesta correcta, se acierte o no. Nombres
 * cortos de la auditoría de Shoko («Servicio a crédito»: el taller arregla
 * un carro; «venta de contado», en minúscula tras «Sin movimiento:»).
 */
export const FIGURA_CAPA_3_T6 = { cuenta: "Cuentas por cobrar – clientes", debe: "DEBE", haber: "HABER", sinMovimiento: "Sin movimiento:" };
export const FINAL_CAPA_3_T6 = {
  texto: "Fíjate: “venta a crédito” lleva la palabra crédito, pero a la cuenta del cliente se le hace un débito. El nombre del negocio no dice en qué lado se anota.",
  pie: "Basado en el libro, p. 197",
};

/* ═══════════ CAPA 4 · «EN UNA FRASE» (UnaFrase, sin cambios) ═══════════ */

/*
 * C1-5 de Futaba (lote C2 · C1 · C7, PASA de Shoko): un caso nuevo, con su
 * pie (lo pinta la escena de la pieza, bajo UnaFrase).
 * En el orden de Futaba; UnaFrase las baraja una vez al cargar.
 */
export const PREGUNTA_FINAL_T6 = "Un cliente compra a crédito y, antes de pagar, devuelve toda la mercancía. ¿Cuánto debe al final?";
export const OPCIONES_FINAL_T6 = [
  {
    id: "b5-t6-nada",
    texto: "Nada: la deuda subió con la venta y bajó con la devolución.",
    correcta: true,
    feedback: "Correcto. La venta a crédito hizo subir la deuda, y la devolución la hizo bajar por el mismo valor.",
  },
  {
    id: "b5-t6-lo-mismo",
    texto: "Lo mismo que compró: la devolución no cambia la deuda.",
    correcta: false,
    feedback: "No es esa. Lo que devuelve antes de pagar ya no lo tiene que pagar: la deuda baja.",
  },
  {
    id: "b5-t6-el-doble",
    texto: "El doble: la devolución también se debita.",
    correcta: false,
    feedback: "No es esa. La devolución hace bajar lo que debe el cliente, así que se acredita.",
  },
  {
    id: "b5-t6-nada-con-ingreso",
    texto: "Nada, pero se anota un ingreso por la devolución.",
    correcta: false,
    feedback: "No es esa. La deuda sí queda en nada, pero una devolución no es un ingreso: es una devolución de ventas.",
  },
];
export const PIE_FINAL_T6 = "Basado en el libro, p. 197";

/*
 * ═══════════ LOTE 27 · D8 (propuesta de Shoko): LA CAPA 4 DE LA SEGUNDA VISITA ═══════════
 *
 * En la segunda visita (y en las pares), la capa 4 usa la pregunta que tenía antes del cambio C1 (lote
 * C2·C1·C7): escrita y aprobada, copiada tal cual de la versión anterior a ese lote. Sin pie: no lo llevaba.
 */
export const PREGUNTA_FINAL_ANTES_C1_T6 = "¿Qué le pasa a Cuentas por cobrar – clientes el día que el cliente paga?";
export const OPCIONES_FINAL_ANTES_C1_T6 = [
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
