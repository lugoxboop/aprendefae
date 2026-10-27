/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · ACTIVIDAD 2 · «¿CUÁNDO SE CAUSA?» — el contenido.
 *
 * El banco final de Gen (seis ítems, con sus marcas «propio»), y los textos
 * que Levi corrigió, que mandan: los seis aciertos, el error de la factura,
 * el paso 2 del tutorial y el ejemplo de la panadería. Los errores de dinero,
 * acuerdo y cierre son los aprobados de Gen, tal cual.
 *
 * Cada marca lleva un TIPO que no se ve: decide qué error se muestra. Las
 * marcas van en el orden en que pasan, de antes a después, y no se mezclan.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const ACT2_T3 = {
  id: "t3-cuando-se-causa",
  nombre: "¿Cuándo se causa?",
  /* PENDIENTE DE LEVI: el paquete no dice dificultad ni FP. Igual que la act. 1. */
  dificultad: "facil",
  fpBase: 10,
  consigna: "Lee el hecho. Toca el día en que se causa.",
};

/* Los tipos de marca. Solo HECHO es correcta. */
export const HECHO = "hecho";
export const FACTURA = "factura";
export const DINERO = "dinero";
export const ACUERDO = "acuerdo";
export const CIERRE = "cierre";

/* El texto de error de cada tipo de marca equivocada. */
export const ERROR_POR_TIPO = {
  /* Levi: un concepto, un nombre: «se causa». */
  [FACTURA]: "La factura es el papel, no el hecho. El ingreso se causa cuando el servicio queda prestado.",
  /* Gen, aprobados. */
  [DINERO]: "Esa es la fecha en que se mueve la plata. Se causa antes, cuando el hecho ya ocurrió.",
  [ACUERDO]: "Acordar no es cumplir. Se causa cuando el servicio ya se presta o se recibe, no cuando se pide.",
  [CIERRE]: "El cierre es cuando se revisa qué falta anotar. El hecho se causó antes de esa fecha.",
};

/*
 * El banco. `basado: true` = el ítem lleva fechas o una instancia propias de
 * Gen, y su pie dice «Basado en el libro»; «Libro, p. N» solo si todo sale
 * del libro (Levi). Los seis llevan algo propio.
 */
export const ITEMS_ACT2 = [
  {
    id: "t3a2-mps",
    empresa: "San Calixto",
    hecho: "Le prestó un servicio a MPS el 21 y le envió la factura el 25. Todavía no le han pagado.",
    fuente: "p. 121",
    basado: true,
    marcas: [
      { id: "servicio", rotulo: "Servicio prestado, 21", tipo: HECHO },
      { id: "factura", rotulo: "Factura, 25", tipo: FACTURA },
      { id: "cierre", rotulo: "Cierre del mes, 31", tipo: CIERRE },
      { id: "cobro", rotulo: "Cobro, en febrero", tipo: DINERO },
    ],
    queda: "por-cobrar",
    acierto: "El servicio quedó prestado el 21: ahí se causó el ingreso. El papel y la plata llegan más tarde.",
  },
  {
    id: "t3a2-maquina-san-calixto",
    empresa: "San Calixto",
    hecho: "Usó la máquina alquilada del 27 al 31 de enero. Todavía no la ha pagado.",
    fuente: "p. 140",
    basado: true,
    marcas: [
      { id: "uso", rotulo: "Uso de la máquina, 27 al 31", tipo: HECHO },
      { id: "cierre", rotulo: "Cierre del mes, 31", tipo: CIERRE },
      { id: "pago", rotulo: "Pago, en febrero", tipo: DINERO },
    ],
    queda: "por-pagar",
    /*
     * F2 de Takamura (línea base): el error general del cierre dice «se causó
     * antes de esa fecha», y aquí la máquina también se usó el 31. Este ítem
     * lleva el suyo (Kamogawa, #506).
     */
    errores: { [CIERRE]: "El cierre no causa el gasto: solo revisa lo que falta anotar. El gasto lo causó el uso de la máquina." },
    acierto: "Cada día de uso iba causando el gasto. Los cinco días son de enero, aunque la plata salga en febrero.",
  },
  {
    id: "t3a2-pago-30-dias",
    empresa: "Una empresa de servicios",
    hecho: "Presta un servicio y acuerda que le paguen 30 días después.",
    fuente: "p. 120",
    basado: true,
    marcas: [
      { id: "acuerdo", rotulo: "Acuerdo con el cliente", tipo: ACUERDO },
      { id: "servicio", rotulo: "Servicio prestado", tipo: HECHO },
      { id: "pago", rotulo: "Pago, 30 días después", tipo: DINERO },
    ],
    queda: "por-cobrar",
    acierto: "El ingreso se causó el día del servicio. Los 30 días solo corren para la plata.",
  },
  {
    id: "t3a2-maquina-san-miguel",
    empresa: "San Miguel",
    hecho: "Le pidieron la máquina el 25 y la prestó del 27 al 31. Todavía no le han pagado.",
    fuente: "p. 142",
    basado: true,
    marcas: [
      { id: "pedido", rotulo: "Pedido, 25", tipo: ACUERDO },
      { id: "servicio", rotulo: "Servicio prestado, 27 al 31", tipo: HECHO },
      { id: "cobro", rotulo: "Cobro, en febrero", tipo: DINERO },
    ],
    queda: "por-cobrar",
    acierto: "Cada día de servicio iba causando el ingreso. Los cinco días son suyos, aunque le paguen en febrero.",
  },
  {
    id: "t3a2-jcc",
    empresa: "San Calixto",
    hecho: "Cotizó el 4 y le pidieron el trabajo el 6. Prestó el servicio a JCC el 8 y facturó el 12.",
    fuente: "p. 121",
    basado: true,
    marcas: [
      { id: "cotizacion", rotulo: "Cotización, 4", tipo: ACUERDO },
      { id: "pedido", rotulo: "Pedido, 6", tipo: ACUERDO },
      { id: "servicio", rotulo: "Servicio prestado, 8", tipo: HECHO },
      { id: "factura", rotulo: "Factura, 12", tipo: FACTURA },
    ],
    queda: "por-cobrar",
    acierto: "El ingreso se causó el 8, cuando el trabajo quedó hecho. Cotizar y pedir son antes; facturar es después.",
  },
  /*
   * Katsumi (para el #439): reemplaza al de 60 días, que repetía al de 30 días
   * con la misma p. 120. Sale de un hecho de la act. 1 (LCDV, de contado), y
   * su segunda decisión es «Nada pendiente»: así no se acierta por patrón.
   */
  {
    id: "t3a2-lcdv",
    empresa: "San Calixto",
    hecho: "Cotizó el 15 y prestó el servicio a LCDV el 20. Le pagaron ese mismo día.",
    fuente: "p. 121",
    basado: true,
    marcas: [
      { id: "cotizacion", rotulo: "Cotización, 15", tipo: ACUERDO },
      { id: "servicio", rotulo: "Servicio prestado, 20", tipo: HECHO },
      { id: "cierre", rotulo: "Cierre del mes, 31", tipo: CIERRE },
    ],
    queda: "nada",
    acierto: "El ingreso se causó el 20, con el servicio. La plata entró ese día: no queda nada pendiente.",
  },
];

/*
 * ═══════════ LA SEGUNDA DECISIÓN (Katsumi, textual; diseño de Hanayama) ═══════════
 *
 * En los seis ítems, después de acertar el día: ese día, ¿qué queda? Cada
 * ítem del banco lleva su `queda`: «Por cobrar» en cuatro, «Por pagar» en la
 * máquina de San Calixto y «Nada pendiente» en LCDV (Katsumi). El ejemplo de la panadería no lo lleva, así
 * que el tutorial sigue igual.
 */
export const POR_COBRAR = "por-cobrar";
export const POR_PAGAR = "por-pagar";
export const NADA = "nada";

export const SEGUNDA_ACT2 = {
  pregunta: "Ese día, ¿qué queda?",
  opciones: [
    { id: POR_COBRAR, rotulo: "Por cobrar" },
    { id: POR_PAGAR, rotulo: "Por pagar" },
    { id: NADA, rotulo: "Nada pendiente" },
  ],
};

/* El error de la segunda decisión: [lo que era][lo que tocó]. Katsumi, para el #439. */
const QUEDO_PENDIENTE = "La plata no se ha movido: algo quedó pendiente.";
const NADIE_DEBE = "Le pagaron el mismo día: nadie debe nada.";
export const ERRORES_SEGUNDA_ACT2 = {
  [POR_COBRAR]: { [POR_PAGAR]: "Prestó el servicio: a ella le deben.", [NADA]: QUEDO_PENDIENTE },
  [POR_PAGAR]: { [POR_COBRAR]: "Usó la máquina: ella es la que debe.", [NADA]: QUEDO_PENDIENTE },
  [NADA]: { [POR_COBRAR]: NADIE_DEBE, [POR_PAGAR]: NADIE_DEBE },
};

/* El día acertado, en una línea sobre la pregunta (Hanayama). */
export const SE_CAUSA_DIA = (dia) => `Se causa: ${dia}`;

/* Las palabras de la pastilla (prompt maestro §4.2), las mismas de todo Contabilidad. */
export const MARCA_ACT2 = { bien: "Correcto", mal: "No va aquí", era: "Iba aquí" };

/*
 * LOS ÍTEMS RETIRADOS (Yujiro, como los de T4 · H1). Ya no salen en la
 * partida, pero fp_detalle guarda su item_id y el panel docente los sigue
 * leyendo por su hecho. Se guardan SOLO para eso; la partida no los usa.
 *   · t3a2-pago-60-dias: lo reemplazó t3a2-lcdv en el #439 (Katsumi)
 */
export const ITEMS_ACT2_RETIRADOS = [
  { id: "t3a2-pago-60-dias", empresa: "Una empresa de servicios", hecho: "Cotiza y acuerda el trabajo. Presta el servicio. Le pagan 60 días después." },
];

/* El pie de cada ítem (Levi). */
export const pieDe = (item) => (item.basado ? `Basado en el libro, ${item.fuente}` : `Libro, ${item.fuente}`);

/* ═══════════ TEXTOS DE LA PANTALLA (Xeno, parte B v2) ═══════════ */
export const LEYENDA_ORDEN = "Las marcas van en orden, de antes a después";
export const ESTADO_VACIO = "Solo una de estas marcas es el hecho.";
export const SE_CAUSA_AQUI = "Se causa aquí";
export const SIGUIENTE_ITEM = "Siguiente ítem";
export const VER_RESUMEN = "Ver mi resumen";
export const ALT_ACT2 = "Una línea de marcas en orden, de antes a después. Se toca la del día en que se causa.";

/* ═══════════ EL TUTORIAL: LA PANADERÍA (Levi) ═══════════ */
export const EJEMPLO_PANADERIA = {
  id: "demo-panaderia",
  empresa: "Una panadería",
  hecho: "Recibe el pedido el 8, entrega el pan el 10 y le pagan el 20.",
  /* Sin pie de página (Levi). */
  fuente: null,
  basado: false,
  marcas: [
    { id: "pedido", rotulo: "Pedido, 8", tipo: ACUERDO },
    { id: "entrega", rotulo: "Entrega del pan, 10", tipo: HECHO },
    { id: "pago", rotulo: "Pago, 20", tipo: DINERO },
  ],
  acierto: "El pan quedó entregado el 10. El pedido es antes y el pago es después.",
};

export const PASOS_ACT2 = [
  /* Pasos 1 y 3: F4 de la línea base de Takamura, decididos por Kamogawa (#506). El 2 es el de Levi. */
  "Lee el hecho y las marcas de la línea.",
  "Busca el día en que se entregó o se prestó.",
  "Toca esa marca: no la del papel ni la de la plata.",
];
export const ALT_TUTORIAL_ACT2 = "Ejemplo: la línea tiene tres marcas. Se toca la de la entrega del pan, el 10, y no la del pedido ni la del pago.";
