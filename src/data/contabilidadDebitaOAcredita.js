/*
 * ═══════════════════════════════════════════════════════════════════════════
 * A4 · ¿SE DEBITA O SE ACREDITA? — el contenido.
 *
 * Diez transacciones del ejercicio de la p. 113, y en cada una se pregunta por
 * UNA cuenta concreta. Se sortean ocho.
 *
 * ═══════════ AQUÍ NO ESTÁ ESCRITO NINGÚN «DÉBITO» NI NINGÚN «CRÉDITO» ═══════════
 *
 * Lo que cada ítem declara es si esa cuenta SUBE o BAJA en esa transacción,
 * que es lo único que el enunciado dice y el catálogo no puede saber. De qué
 * lado se registra sale de `ladoDe`, la regla del capítulo. Así, una cuenta de
 * pasivo que baja va al debe porque lo dice la regla y no porque alguien lo
 * tecleó — y si alguna vez las dos cosas dejaran de coincidir, hay una prueba
 * que compara lo deducido contra la tabla de la ficha copiada a mano.
 *
 * ═══════════ LA CONTRAPARTIDA ES CAJA SALVO QUE EL ENUNCIADO DIGA OTRA COSA ═══════════
 *
 * El libro escribe «Caja/bancos» en varios de estos asientos. La regla de
 * decisión, ya cerrada: es Caja, a menos que el enunciado diga «con cheque» o
 * «se consignó». Ninguno de los diez lo dice. El ítem 7 nombra un banco, pero
 * nombra a QUIÉN presta, no cómo entra el dinero.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * La ficha lleva una cifra porque el verbo del tema es una ficha de valor que
 * cae. El ejercicio del libro no da montos para estas diez transacciones, así
 * que la cifra es la misma en todas y no afirma nada sobre ningún caso: lo que
 * se mira es de qué lado cae, no cuánto.
 */
export const VALOR_FICHA = 500;

export const SUBTEMA = "Reglas de registro aplicadas";
export const POR_PARTIDA = 8;

export const OBJETIVO = "Dada una transacción real y una cuenta específica, decide si esa cuenta se debita o se acredita — y mira aparecer la otra mitad del asiento.";

/*
 * ═══════════ LOS TRES PATRONES DE ERROR ═══════════
 *
 * Con una elección binaria sobre una cuenta nombrada, todo error tiene un
 * patrón: no hace falta —ni sería cierto— un texto genérico de «sin patrón».
 * Cuál corresponde a cada ítem es una decisión de la ficha.
 *
 *   A      contestó sobre la otra mitad del asiento
 *   B      el nombre de la cuenta lo llevó al lado contrario
 *   B-bis  una palabra del enunciado lo llevó al lado contrario
 */
export const PATRON_A = "A";
export const PATRON_B = "B";
export const PATRON_B_BIS = "B-bis";

export const TEXTO_A = "❌ No te equivocaste de lógica: te equivocaste de cuenta. Esa respuesta sería correcta para la otra mitad del asiento. Pero te pregunté por {cuenta}, y a esa le pasa lo contrario.";

export const TEXTO_B = "❌ El nombre te engañó. «{cuenta}» suena a que {sugiere}, pero en esta transacción está {efecto} — y eso es lo que decide el lado, no cómo se llama.";

export const TEXTO_B_BIS = "❌ Cayó la trampa de la palabra: «a crédito» está en el enunciado, pero describe cómo se paga, no de qué lado va el registro. El inventario es un activo que entra.";

/*
 * Los diez ítems. `sube` es lo que dice el enunciado; el lado lo pone la regla.
 *
 * Los textos de acierto de los ítems 1, 4, 8 y 9 son los de la ficha nueva,
 * textuales. Los otros seis son los que Gen escribió antes para estas mismas
 * transacciones y siguen diciendo lo mismo.
 */
export const ITEMS = [
  {
    id: "cu4-01",
    enunciado: "Compra a crédito de un inventario",
    cuenta: "Inventario",
    sube: true,
    contrapartida: "Cuentas por pagar",
    acierto: "✅ Débito. El inventario entra al negocio. Y fíjate en la trampa: «a crédito» describe cómo se paga, no de qué lado va el registro.",
    patron: PATRON_B_BIS,
    /* La palabra del enunciado que engaña, para poder señalarla. */
    palabraDelEnunciado: "a crédito",
  },
  {
    id: "cu4-02",
    enunciado: "Devolución de aportes a un socio",
    cuenta: "Aportes sociales",
    sube: false,
    contrapartida: "Caja",
    acierto: "✅ Débito. El patrimonio está disminuyendo, y el patrimonio disminuye por el debe.",
    patron: PATRON_A,
  },
  {
    id: "cu4-03",
    enunciado: "Compra de contado de una maquinaria",
    cuenta: "Caja",
    sube: false,
    contrapartida: "Maquinaria",
    acierto: "✅ Crédito. Salió dinero: el activo disminuye, y eso va por el haber.",
    patron: PATRON_A,
  },
  {
    id: "cu4-04",
    enunciado: "Prestación de servicios a crédito",
    cuenta: "Ingresos por servicios",
    sube: true,
    contrapartida: "Cuentas por cobrar",
    acierto: "✅ Crédito. Los ingresos crecen por el haber — aunque todavía no haya entrado un solo peso. Mira la contrapartida: lo que entró fue un derecho de cobro, no dinero.",
    patron: PATRON_A,
  },
  {
    id: "cu4-05",
    enunciado: "Cancelación de gastos operacionales",
    cuenta: "Gastos de operación",
    sube: true,
    contrapartida: "Caja",
    acierto: "✅ Débito. Los gastos aumentan por el debe.",
    patron: PATRON_A,
  },
  {
    id: "cu4-06",
    enunciado: "Aportes en efectivo de un nuevo socio",
    cuenta: "Caja",
    sube: true,
    contrapartida: "Aportes sociales",
    acierto: "✅ Débito. Entró dinero: el activo aumenta.",
    patron: PATRON_A,
  },
  {
    id: "cu4-07",
    enunciado: "Recibo de un préstamo otorgado por un banco",
    cuenta: "Obligaciones financieras",
    sube: true,
    contrapartida: "Caja",
    acierto: "✅ Crédito. La deuda aumenta, y los pasivos aumentan por el haber.",
    patron: PATRON_A,
  },
  {
    id: "cu4-08",
    enunciado: "Cobros de facturas a los clientes",
    cuenta: "Cuentas por cobrar",
    sube: false,
    contrapartida: "Caja",
    acierto: "✅ Crédito. Cobrar reduce lo que te deben. Entra dinero a Caja (esa se debita), y la cuenta por cobrar se extingue.",
    patron: PATRON_B,
    parteEngañosa: "por cobrar",
    palabraDelEnunciado: "Cobros",
    /* [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN DE PEDAGOGÍA] · ver abajo */
    sugiere: "entra dinero",
  },
  {
    id: "cu4-09",
    enunciado: "Pago a proveedores",
    cuenta: "Cuentas por pagar",
    sube: false,
    contrapartida: "Caja",
    acierto: "✅ Débito. Pagar reduce la deuda, y un pasivo se reduce por el debe.",
    patron: PATRON_B,
    parteEngañosa: "por pagar",
    palabraDelEnunciado: "Pago",
    /* [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN DE PEDAGOGÍA] · ver abajo */
    sugiere: "hay una deuda creciendo",
  },
  {
    id: "cu4-10",
    enunciado: "Pago de participaciones a los socios",
    cuenta: "Participaciones por pagar",
    sube: false,
    contrapartida: "Caja",
    acierto: "✅ Débito. Es un pasivo que se está cancelando.",
    patron: PATRON_B,
    parteEngañosa: "por pagar",
    palabraDelEnunciado: "Pago",
    /* [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN DE PEDAGOGÍA] · ver abajo */
    sugiere: "queda algo pendiente de pagar",
  },
];

/*
 * ═══════════ [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN DE PEDAGOGÍA] ═══════════
 *
 * Los tres `sugiere` de arriba. El patrón B de la ficha llega con el hueco sin
 * llenar —«suena a que [lo que sugiere]»— y ese hueco hay que escribirlo cuenta
 * por cuenta. Lo que hay puesto es el mínimo que hace la frase legible: dice lo
 * que el NOMBRE insinúa, que es justo lo contrario de lo que la transacción
 * hace, y nada más. No afirma nada del capítulo, pero la redacción es mía.
 *
 * El resto del patrón B —qué parte del nombre engaña y qué palabra del
 * enunciado dice la dirección de verdad— no es redacción: es señalar dos
 * trozos de texto que ya estaban escritos.
 */

/* Lo que se le dice a la interfaz que muestre, no contenido. */
export const PREGUNTA = "¿Se debita o se acredita {cuenta}?";
export const ROTULO_TRANSACCION = "LA TRANSACCIÓN";
