/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A1 DE APRENDER — «La caja» (Célula D). REDISEÑO DE ENGANCHE.
 *
 * Diseño: Hanayama, «El cajón de paso», ahora operable (celula-d/hanayama-
 * a1-rediseno.md), aprobado por Yujiro en su corte de calidad del 15 oct
 * 2026, con su ajuste: el control 7 (caja menor) enciende Bancos, porque el
 * fondo se abre y se repone con cheque de Bancos (pp. 181-184). Textos:
 * Katsumi (celula-d/katsumi-texto-rediseno.md), aprobados tal cual. Copia en
 * el canon: orquestador/conocimiento/paquetes/d4-t4-a1-v6-rediseno.md. Una
 * prueba compara cada texto de aquí contra ella, letra por letra.
 *
 * Siete pantallas; en cinco el estudiante opera el cajón: cobra, manda la
 * consignación al lado que cree, saca la plata por cada salida, decide con
 * los cheques y enciende los controles. Pasa la barra B1-B5.
 *
 * Única cifra del libro: 435.000 (p. 180). El saldo «En la caja» es una
 * cuenta, no una cifra nueva. Aprender: sin FP, sin catálogo y sin llamar al
 * motor.
 *
 * Aquí viven también los textos de interfaz comunes a las tres piezas del
 * rediseño (A0, A1 y H1): la palabra del acierto, el texto del error para el
 * lector y las marcas con palabra.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const A1_ID = "t4-a1-la-caja";

/* [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN] Textos de interfaz que el paquete no trae (los de T7-3). */
export const BOTON = { seguir: "Seguir" };
export const INTERFAZ = { debe: "Debe", haber: "Haber" };

/*
 * UNA SOLA FORMA DE DEVOLUCIÓN en A0, A1 y H1 (Katsumi, decisión 1; corte de
 * Yujiro, ajuste 2). Acierto: ✓, «Correcto.» y el texto. Error: ✗ y el texto,
 * sin palabra visible; «Incorrecto.» va solo para el lector de pantalla.
 */
export const PALABRA = { ok: "Correcto.", error: null };
export const LECTOR_ERROR = "Incorrecto.";

/*
 * Las marcas con palabra de los destinos (canon, enganche.md E3: en blanco y
 * negro se sabe cuál falló). Katsumi, decisión 2.
 */
export const MARCA = { bien: ["✓", "Correcto"], mal: ["✗", "No va aquí"], era: ["", "Iba aquí"] };

/* [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN] El nombre de cada asiento para el lector de pantalla: el libro no les pone fecha. */
export const NOMBRE_ASIENTO = { cobro: "Asiento del cobro", consignacion: "Asiento de la consignación" };

/* Los tres destinos del cajón. «no-se-mueve» es el id de la bandeja (el mismo que H1 guardó siempre). */
export const DEBE = "debe";
export const HABER = "haber";
export const NO_SE_MUEVE = "no-se-mueve";

/* La cifra de la p. 180. Es de esta pieza y de ninguna otra. */
export const SUS_SERVICIOS = 435_000;

/*
 * ═══════════ LA FIGURA: «EL CAJÓN DE PASO», OPERABLE ═══════════
 *
 * Los rótulos no cambian con el rediseño (Katsumi): «Caja», «Debe», «Haber»,
 * las glosas, «En la caja», «Bancos», «Pago / en efectivo» y la bandeja
 * «Caja no se mueve». Los comparten A1 y H1: es el mismo dibujo con el mismo
 * significado. Las cifras van sin «$».
 */
export const FIGURA_CAJON = {
  cuenta: "Caja",
  glosaDebe: ["se recibe", "dinero"],
  /* abreviados por Hanayama de «cuando los dineros se consignan o cuando se hacen pagos en efectivo» (p. 180). */
  glosaHaber: ["se consigna", "o se paga"],
  bancos: "Bancos",
  pago: ["Pago", "en efectivo"],
  bandeja: "Caja no se mueve",
  enLaCaja: "En la caja",
  rotuloOrigen: "Sus Servicios Ltda.",
  acciones: { cobrar: "Cobrar", consignar: "Consignar", pagar: "Pagar", otraVez: "Otra vez" },
  /* [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN] Para el lector de pantalla (Hanayama). */
  destino: { [DEBE]: "Al debe de Caja", [HABER]: "Al haber de Caja", [NO_SE_MUEVE]: "Caja no se mueve" },
  alt: "La cuenta Caja como un cajón de paso: la plata entra por el Debe y sale por el Haber hacia Bancos o hacia un pago en efectivo.",
  controles: "Los siete controles",
};

const PIE_180 = "Basado en el libro, p. 180";
const PIE_179_180 = "Basado en el libro, pp. 179-180";

/* Los dos asientos de la p. 180, sin fecha: el libro pone «xxxx» y la pieza no la muestra. */
export const ASIENTO_COBRO = {
  nombre: NOMBRE_ASIENTO.cobro,
  lineas: [
    { cuenta: "Caja", lado: DEBE, monto: SUS_SERVICIOS },
    { cuenta: "Ingresos por servicios", lado: HABER, monto: SUS_SERVICIOS },
  ],
};
export const ASIENTO_CONSIGNACION = {
  nombre: NOMBRE_ASIENTO.consignacion,
  lineas: [
    { cuenta: "Bancos", lado: DEBE, monto: SUS_SERVICIOS },
    { cuenta: "Caja", lado: HABER, monto: SUS_SERVICIOS },
  ],
};

/*
 * Los siete controles (pp. 179-180, en el orden del libro y en paráfrasis) y
 * la parte del cajón que cada uno enciende (Hanayama §1.4): `luz` lleva el
 * borde blanco; `vivo`, los trazos del recorrido. El 7 enciende Bancos
 * (corte de Yujiro).
 */
export const CONTROLES_A1 = [
  { luz: ["cols"], vivo: [], texto: "Anotar cada día cuánto efectivo entró y cuánto salió." },
  { luz: ["bancos"], vivo: ["salida", "bancos"], texto: "Llevar al banco, cada día, el efectivo que se recibió." },
  { luz: ["pago"], vivo: ["salida", "pago"], texto: "Poner un tope a los pagos que se hacen en efectivo." },
  { luz: ["cols"], vivo: ["entrada"], texto: "Separar a quien recibe el dinero de quien lo registra." },
  { luz: ["saldo"], vivo: [], texto: "Contar la caja seguido y sin avisar: eso es un arqueo." },
  { luz: ["cajon"], vivo: [], texto: "Tener una póliza de manejo: un seguro contra el robo de quien maneja la plata." },
  { luz: ["bancos"], vivo: [], texto: "Tener una caja menor, un fondo aparte para los pagos pequeños." },
];

/* Los dos cheques de P4: uno entra a Caja; el propio sale del banco (bandeja, y Bancos se enciende). */
export const CHEQUES_A1 = [
  {
    id: "recibido", tarjeta: "Un cliente le paga con un cheque", correcta: DEBE,
    acierto: "Ese cheque entró a la caja.",
    errores: { [HABER]: "Aquí la empresa recibe, no paga.", [NO_SE_MUEVE]: "Ese cheque no pasó por el banco." },
  },
  {
    id: "propio", tarjeta: "Sus Servicios paga con un cheque propio", correcta: NO_SE_MUEVE,
    acierto: "Esa plata sale del banco.",
    errores: { [DEBE]: "Aquí la empresa paga, no recibe.", [HABER]: "¿De dónde sale la plata de ese cheque?" },
  },
];
/* Lo que se ve en la columna y en la bandeja cuando cada cheque llega a su sitio. */
export const CHEQUE_EN_FIGURA = { recibido: "cheque", propio: "cheque propio" };
/* El segundo cheque llega 1,4 s después del acierto del primero (Hanayama §2, P4). */
export const ESPERA_CHEQUE_MS = 1400;

/*
 * Las siete pantallas (Hanayama §2, textos de Katsumi). `tipo` dice qué hace
 * el cajón en cada una.
 */
export const PANTALLAS_A1 = [
  {
    id: "dos-cuentas", tipo: "mapa", figura: "cajon",
    antes: ["En el Tema 2 la plata ya iba en dos cuentas. Caja es la que está a la mano, como en tu billetera. Bancos, la que está en el banco."],
    pie: "Basado en el libro, p. 179, y en el Tema 2",
  },
  {
    id: "cobra", tipo: "cobra", figura: "cajon",
    antes: ["Sus Servicios arregla computadores, y hoy los clientes le pagan de contado. Toca «Cobrar»."],
    asiento: ASIENTO_COBRO,
    pie: PIE_180,
  },
  {
    id: "consigna", tipo: "consigna", figura: "cajon",
    antes: ["Ese día, la plata va al banco. ¿Qué le pasa a Caja?"],
    tarjeta: "Consigna en su cuenta corriente",
    correcta: HABER,
    acierto: "",
    errores: { [DEBE]: "No entró plata nueva: son los mismos $435.000.", [NO_SE_MUEVE]: "Sigue siendo suya, pero ¿sigue en la caja?" },
    /* El asiento 2 sale solo con el acierto (A1 v5): es la respuesta. */
    asiento: ASIENTO_CONSIGNACION,
    pie: PIE_180,
  },
  {
    id: "dos-salidas", tipo: "salidas", figura: "cajon",
    antes: ["El libro lleva esa plata al banco. Supón que también pudieras pagar con ella. Prueba las dos."],
    pie: PIE_180,
  },
  {
    id: "cheques", tipo: "cheques", figura: "cajon",
    antes: ["Para el libro, la caja también guarda cheques. Manda cada uno a su sitio."],
    pie: "Basado en el libro, pp. 179, 180 y 187",
  },
  {
    id: "controles", tipo: "controles", figura: "cajon",
    antes: ["El libro pide siete controles. Toca cada uno y mira qué cuida."],
    pie: PIE_179_180,
  },
  {
    id: "resumen", tipo: "mapa", figura: "cajon",
    resumen: [
      "Caja es la plata a la mano: billetes, monedas y cheques.",
      "Entra por el debe y sale por el haber.",
      "Un cheque propio sale del banco: no mueve Caja.",
      "Siete controles la cuidan.",
    ],
    siguiente: "Siguiente: «El fondo fijo».",
    pie: PIE_179_180,
  },
];

/* `numero` es el de la pieza en el corte de T4 y ordena PIEZAS_T4 en la vista: A0 = 0, A1 = 1. */
export const PIEZA_LA_CAJA = {
  id: A1_ID,
  numero: 1,
  titulo: "La caja",
  boton: BOTON.seguir,
  pantallas: PANTALLAS_A1,
};
