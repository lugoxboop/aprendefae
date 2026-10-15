/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · H1 DE HACER — «¿Entra o sale de Caja?» (Célula D).
 *
 * Fuente: el paquete vigente de Katsumi, d4-t4-h1-v1.md (el de la punta de
 * feat/conta-d4-mapa-fuente, PR #173: trae la página de cada devolución).
 * Copia en orquestador/conocimiento/paquetes/, el mismo blob. Una prueba
 * compara cada texto de aquí contra él, letra por letra.
 *
 * Hacer · exploratoria · fácil · 10 FP. El motor compartido paga los 10 FP
 * al terminar; el porcentaje va para el panel docente. Su fila del servidor
 * es la migración 0200, que corre Erwin antes de fusionar.
 *
 * Ocho hechos, barajados en cada intento. Los tres destinos, siempre en el
 * mismo orden. CADA TARJETA SE COLOCA UNA VEZ (decisión de Yujiro): si
 * falla, se ve el destino correcto («era esta») y su explicación.
 *
 * La página del libro va en la devolución, no en la tarjeta (Hanayama v1.1,
 * PH1-1): en la tarjeta delataría la respuesta antes de elegir. H1-8 no
 * lleva página, a propósito (paquete). La tarjeta solo trae el hecho.
 *
 * Sin cifras: lo que se decide es el lado, no el valor.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const H1_ID = "t4-entra-o-sale-de-caja";

export const DEBE = "debe";
export const HABER = "haber";
export const NO_SE_MUEVE = "no-se-mueve";

export const H1 = {
  id: H1_ID,
  nombre: "¿Entra o sale de Caja?",
  objetivo: "Decidir, ante cada hecho, si Caja va al debe, va al haber o no se mueve.",
  consigna: [
    "Cada tarjeta trae un hecho de una empresa. Mándala al debe de Caja, al haber de Caja o a «Caja no se mueve».",
    "Después de cada tarjeta verás por qué. No hay puntos que se pierdan.",
  ],
};

/* Los tres, siempre en este orden: el de la cuenta T, y «no se mueve» al final (Hanayama v1 §1). */
export const DESTINOS_H1 = [
  { id: DEBE, nombre: "Debe de Caja" },
  { id: HABER, nombre: "Haber de Caja" },
  { id: NO_SE_MUEVE, nombre: "Caja no se mueve" },
];

export const SUBTEMAS_H1 = ["Entradas a Caja", "Salidas de Caja", "Caja o Bancos", "Caja frente a ingresos"];

/*
 * [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN] Los textos de interfaz que el
 * paquete no trae: los de los Hacer de T7 («Siguiente ítem» lo dice cada
 * Hacer de la materia; aquí son hechos), «Correcto.» antes del acierto, y el
 * resumen del cierre.
 */
export const BOTON_H1 = { siguiente: "Siguiente hecho", verResumen: "Ver mi resumen", otraVez: "Otra vez" };
export const CORRECTO = "Correcto.";
export const resumenH1 = (bien, cuantos) => `${bien} de ${cuantos} al primer toque.`;
/* [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN] Para el lector de pantalla, en el error (Hanayama v1 §1). */
export const lectorErrorH1 = (destino) => `Incorrecto. La respuesta es ${destino}.`;

const P180 = "Basado en el libro, p. 180";

/*
 * Los ocho hechos, en el orden del paquete. La vista los baraja.
 * `respuesta`: el destino correcto; `acierto`: su texto; `errores`: uno por
 * cada destino equivocado; `pagina`: la de la devolución (null en H1-8).
 */
export const ITEMS_H1 = [
  {
    id: "h1-1",
    subtema: "Entradas a Caja",
    texto: "Un taller arregla las bicicletas de varios clientes. Todos le pagan de contado ese mismo día.",
    respuesta: DEBE,
    acierto: "Así es. Entró plata a la caja, y Caja es un activo: lo que entra va al debe.",
    errores: {
      [HABER]: "Al revés. Al haber va lo que sale de la caja, y aquí la plata entró. Entró, así que va al debe.",
      [NO_SE_MUEVE]: "Sí se mueve: le pagaron de contado, así que la plata entró a la caja ese mismo día. Lo que entra a Caja va al debe.",
    },
    pagina: P180,
  },
  {
    id: "h1-2",
    subtema: "Caja o Bancos",
    texto: "Al final del día, una tienda lleva al banco todo el efectivo que recibió y lo consigna en su cuenta corriente.",
    respuesta: HABER,
    acierto: "Así es. La plata salió de la caja y llegó al banco. Caja se acredita y Bancos se debita.",
    errores: {
      [DEBE]: "Bancos es la que se debita, porque ahí llegó la plata. Caja la entregó, y lo que sale de Caja va al haber.",
      [NO_SE_MUEVE]: "La plata sigue siendo de la tienda, pero ya no está en la caja. Salió de Caja, que va al haber, y entró a Bancos.",
    },
    pagina: P180,
  },
  {
    id: "h1-3",
    subtema: "Salidas de Caja",
    texto: "Un almacén le compra unas mesas a un proveedor y se las paga en efectivo, con plata de la caja.",
    respuesta: HABER,
    acierto: "Así es. Salió plata de la caja para pagar, y lo que sale de Caja va al haber.",
    errores: {
      [DEBE]: "Al debe va lo que entra a la caja. Aquí la plata salió para pagarle al proveedor, así que va al haber.",
      [NO_SE_MUEVE]: "Sí se mueve: la plata salió de la caja para pagar las mesas. Pagar en efectivo acredita Caja.",
    },
    pagina: P180,
  },
  {
    id: "h1-4",
    subtema: "Caja o Bancos",
    texto: "Una ferretería le paga a su proveedor con un cheque propio.",
    respuesta: NO_SE_MUEVE,
    acierto: "Así es. Pagar con un cheque propio saca la plata de la cuenta del banco. Se acredita Bancos, y Caja no se toca.",
    errores: {
      [HABER]: "Esa plata no sale de la caja, sino de la cuenta del banco. Por eso el libro acredita Bancos cuando la empresa paga con un cheque propio, no Caja.",
      [DEBE]: "Aquí la empresa paga, no recibe. Y lo hace con un cheque propio, así que la plata sale del banco. Caja no se mueve.",
    },
    pagina: "Basado en el libro, p. 187",
  },
  {
    id: "h1-5",
    subtema: "Entradas a Caja",
    texto: "Un cliente le paga a una papelería con un cheque, y la papelería lo guarda en su caja.",
    respuesta: DEBE,
    acierto: "Así es. La caja guarda efectivo y también los cheques que la empresa tiene en la mano. Entró un cheque a la caja: va al debe.",
    errores: {
      [NO_SE_MUEVE]: "El cheque lo recibió la papelería y lo guarda en su caja, así que Caja sí se mueve. Lo que mueve Bancos es pagar con un cheque propio.",
      [HABER]: "Aquí la papelería recibe, no paga. Lo que entra a la caja, sea efectivo o un cheque, va al debe.",
    },
    pagina: "Basado en el libro, pp. 179-180",
  },
  {
    id: "h1-6",
    subtema: "Caja o Bancos",
    texto: "Un cliente le paga a una empresa: consigna la plata en la cuenta que esa empresa tiene en el banco.",
    respuesta: NO_SE_MUEVE,
    acierto: "Así es. La plata fue directo al banco y nunca pasó por la caja. Se debita Bancos.",
    errores: {
      [DEBE]: "Sí entró plata, pero entró al banco, no a la caja. El libro debita Bancos cuando un cliente consigna directo.",
      [HABER]: "Nada salió de la caja. La plata entró, y entró directo al banco: Caja no se mueve.",
    },
    pagina: "Basado en el libro, p. 186",
  },
  {
    id: "h1-7",
    subtema: "Caja frente a ingresos",
    texto: "Los socios ponen plata en efectivo para que su nueva empresa pueda arrancar.",
    respuesta: DEBE,
    acierto: "Así es. Entró plata a la caja, aunque nadie compró nada. Caja va al debe; el aporte no es un ingreso.",
    errores: {
      [NO_SE_MUEVE]: "Sí se mueve: el efectivo entró a la caja. Que no sea un ingreso no quiere decir que Caja se quede quieta.",
      [HABER]: "Al revés. La plata entró a la caja, no salió. Lo que entra a Caja va al debe.",
    },
    /* El paquete de #173: la p. 180 trae la regla que decide el lado. */
    pagina: P180,
  },
  {
    id: "h1-8",
    subtema: "Caja frente a ingresos",
    texto: "Una empresa le presta un servicio a un cliente, y el cliente le va a pagar el mes que viene.",
    respuesta: NO_SE_MUEVE,
    acierto: "Así es. Ya hay un ingreso, pero todavía no entra un peso. Vender no es cobrar: Caja se mueve cuando llegue el pago.",
    errores: {
      [DEBE]: "La empresa ya vendió, pero no ha cobrado. La plata no ha entrado a la caja, así que Caja todavía no se mueve.",
      [HABER]: "Aquí no sale plata de la caja. Tampoco entra: el cliente paga el mes que viene. Caja no se mueve hoy.",
    },
    /* Sin página, a propósito: las pp. 177-191 no tratan la venta a crédito (paquete). */
    pagina: null,
  },
];

export const CIERRE_H1 = {
  texto: "Caja va al debe cuando entra plata o un cheque que la empresa guarda. Va al haber cuando sale plata de la caja. Si la plata pasa por el banco, la que se mueve es Bancos.",
  pie: "Basado en el libro, pp. 179-180, 186 y 187",
};

/*
 * «Así se juega» (d4-t4-asi-se-juega-v1.md, H1). El ejemplo es construido y
 * no está en el banco. La mano TOCA «Haber de Caja» (Hanayama v1 §2: se toca,
 * no se arrastra).
 */
export const ALT_H1 = "La tarjeta dice que una tienda paga las neveras con plata de la caja. Sale plata de la caja, así que la tarjeta va al haber de Caja.";
export const PASOS_H1 = [
  "Lee el hecho de la tarjeta.",
  "Pregúntate si entra plata a la caja, si sale, o si no la toca.",
  "Manda la tarjeta al debe de Caja, al haber de Caja o a «Caja no se mueve».",
];
export const EJEMPLO_H1 = {
  id: "demo",
  subtema: "Salidas de Caja",
  texto: "Una tienda le paga de contado al proveedor, con plata de la caja, las neveras que le compró.",
  respuesta: HABER,
  /*
   * [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN] El paquete no trae acierto ni
   * errores para el ejemplo: el acierto es el texto alternativo de Katsumi, y
   * la demo nunca falla.
   */
  acierto: ALT_H1,
  errores: {},
  pagina: null,
};

/* ═══════════ LA LÓGICA, SIN REACT ═══════════ */

export const sortearH1 = (barajar) => barajar(ITEMS_H1);
export const nombreDeDestinoH1 = (id) => DESTINOS_H1.find((d) => d.id === id)?.nombre ?? null;

/* El veredicto y lo que se lee después: con acierto, «Correcto.» y su texto; con error, el de ese destino. */
export function evaluarH1(item, elegido) {
  const ok = elegido === item.respuesta;
  return { ok, correcta: item.respuesta, textos: ok ? [CORRECTO, item.acierto] : [item.errores[elegido]], pagina: item.pagina };
}

/* Exploratoria: el motor paga los 10 FP al terminar; el porcentaje va al panel docente. */
export const puntuarH1 = (aciertos, cuantos) => (cuantos ? (aciertos / cuantos) * 100 : 0);

/* Para el panel docente: el ítem se lee por su hecho. */
export const hechoDeItemH1 = (id) => ITEMS_H1.find((x) => x.id === id)?.texto ?? null;
