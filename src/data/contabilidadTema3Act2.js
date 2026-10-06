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
    acierto: "El ingreso se causó el 8, cuando el trabajo quedó hecho. Cotizar y pedir son antes; facturar es después.",
  },
  {
    id: "t3a2-pago-60-dias",
    empresa: "Una empresa de servicios",
    hecho: "Cotiza y acuerda el trabajo. Presta el servicio. Le pagan 60 días después.",
    fuente: "p. 120",
    basado: true,
    marcas: [
      { id: "cotizacion", rotulo: "Cotización", tipo: ACUERDO },
      { id: "acuerdo", rotulo: "Acuerdo del trabajo", tipo: ACUERDO },
      { id: "servicio", rotulo: "Servicio prestado", tipo: HECHO },
      { id: "pago", rotulo: "Pago, 60 días después", tipo: DINERO },
    ],
    acierto: "El ingreso se causó el día del servicio. Lo de antes era conversación y lo de después es solo la plata.",
  },
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
  /* PENDIENTE DE GEN: los pasos 1 y 3 no llegaron; son las dos frases de la consigna aprobada. */
  "Lee el hecho.",
  "Busca el día en que se entregó el bien o se prestó el servicio.",
  "Toca el día en que se causa.",
];
export const ALT_TUTORIAL_ACT2 = "Ejemplo: la línea tiene tres marcas. Se toca la de la entrega del pan, el 10, y no la del pedido ni la del pago.";
