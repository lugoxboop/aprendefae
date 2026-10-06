/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · ACTIVIDAD 1 · «¿INGRESO O COBRO?» — el contenido.
 *
 * Todo el texto es de Gen, textual (actividad 1 corregida, aprobada por
 * Levi). Ni un hecho es construcción propia: cada uno sale del libro con su
 * página, y lleva a la vista el nombre de su empresa.
 *
 * Tres grupos planos, en un solo nivel. La mecánica sigue el patrón de T1-6
 * —la ficha arriba, las pestañas apiladas, «Colocar la ficha», un reintento—
 * pero es un componente propio del Tema 3: T1-6 no se toca.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const ACT1_T3 = {
  id: "t3-ingreso-o-cobro",
  nombre: "¿Ingreso o cobro?",
  dificultad: "facil",
  fpBase: 10,
  /* Nueve por tanda: tres de cada grupo. */
  porPartida: 9,
  porGrupo: 3,
  consigna: "Lee el hecho. Toca el grupo que le corresponde.",
};

/* Los tres pasos de Gen, para «Así se juega». */
export const PASOS_ACT1_T3 = [
  "Pregúntate si la empresa vendió lo que ofrece: sus productos o sus servicios.",
  "Pregúntate si entró plata a la caja.",
  "Toca el grupo donde encajan las dos respuestas.",
];

export const MISMO_DIA = "mismo-dia";
export const DESPUES = "despues";
export const SIN_INGRESO = "sin-ingreso";

/* Los tres grupos, en el orden de Gen. `esIngreso` decide qué error toca. */
export const GRUPOS = [
  { id: MISMO_DIA, numero: 1, rotulo: "Es ingreso y entra el dinero", esIngreso: true },
  { id: DESPUES, numero: 2, rotulo: "Es ingreso, pero el dinero llega después", esIngreso: true },
  { id: SIN_INGRESO, numero: 3, rotulo: "Entra dinero, pero no es ingreso", esIngreso: false },
];

export const SAN_CALIXTO = "San Calixto";
export const LAVALIMPIO = "Lavalimpio";
export const SAN_MIGUEL = "San Miguel";
export const COMPANIA_CUALQUIERA = "Compañía Cualquiera";

/* Los once hechos del banco. `acierto` es la retroalimentación de Gen para ese hecho. */
export const HECHOS_ACT1_T3 = [
  /* ── Grupo 1 · Es ingreso y entra el dinero ── */
  { id: "t3a1-sc-servicios-5-ene", grupo: MISMO_DIA, empresa: SAN_CALIXTO, fuente: "p. 121",
    texto: "Recibió $5.000 por servicios prestados, 5 de enero",
    acierto: "Las dos cosas pasaron el mismo día: vendió el servicio y le pagaron." },
  { id: "t3a1-sc-lcdv-20-ene", grupo: MISMO_DIA, empresa: SAN_CALIXTO, fuente: "p. 121",
    texto: "Recibió de LCDV $3.000 por servicios prestados, 20 de enero",
    acierto: "Prestó el servicio y cobró de una. Ingreso y plata, el mismo día." },
  { id: "t3a1-lv-primera-quincena", grupo: MISMO_DIA, empresa: LAVALIMPIO, fuente: "p. 131",
    texto: "Los ingresos de la primera quincena fueron $3.900.000, todo de contado",
    acierto: "Prestó el servicio y le pagaron ahí mismo." },
  { id: "t3a1-lv-segunda-quincena", grupo: MISMO_DIA, empresa: LAVALIMPIO, fuente: "p. 131",
    texto: "Los ingresos de la segunda quincena fueron $4.720.000, consignados el mismo día",
    acierto: "Mismo caso: prestó el servicio y la plata entró el mismo día." },

  /* ── Grupo 2 · Es ingreso, pero el dinero llega después ── */
  { id: "t3a1-sc-factura-jcc", grupo: DESPUES, empresa: SAN_CALIXTO, fuente: "p. 121",
    texto: "Envió a JCC una factura de $4.000 por servicios prestados, 12 de enero",
    acierto: "El servicio ya se prestó, así que hay ingreso. La plata todavía no ha entrado." },
  { id: "t3a1-sc-factura-mps", grupo: DESPUES, empresa: SAN_CALIXTO, fuente: "p. 121",
    texto: "Envió a MPS una factura de $2.800 por servicios prestados, 25 de enero",
    acierto: "El servicio ya se prestó, así que el ingreso ya existe y queda una cuenta por cobrar." },
  { id: "t3a1-sm-maquina", grupo: DESPUES, empresa: SAN_MIGUEL, fuente: "p. 142",
    texto: "Ya prestó el servicio de la máquina y no le han pagado los $2.500",
    acierto: "Prestó la máquina cinco días. El ingreso es suyo aunque no haya cobrado." },

  /* ── Grupo 3 · Entra dinero, pero no es ingreso ── */
  { id: "t3a1-sc-aporte", grupo: SIN_INGRESO, empresa: SAN_CALIXTO, fuente: "p. 121",
    texto: "Los socios abren la empresa con $15.000 en plata",
    acierto: "Entró plata, pero la empresa no vendió lo que ofrece. Es un aporte." },
  { id: "t3a1-cc-computador", grupo: SIN_INGRESO, empresa: COMPANIA_CUALQUIERA, fuente: "p. 130",
    texto: "Vendió un computador por $15.000, su mismo valor",
    acierto: "No vende computadores. Entregó uno y recibió su mismo valor en plata." },
  { id: "t3a1-lv-prestamo", grupo: SIN_INGRESO, empresa: LAVALIMPIO, fuente: "p. 131",
    texto: "Recibió un préstamo de $5.000.000 de una entidad financiera",
    acierto: "El banco le prestó. Entró plata y nació una deuda, no un ingreso." },
  { id: "t3a1-lv-acciones", grupo: SIN_INGRESO, empresa: LAVALIMPIO, fuente: "p. 131",
    texto: "Se inicia el negocio con la venta de 5.000 acciones de $1.000, pagadas de contado",
    acierto: "Vender acciones no es vender lo que la empresa ofrece. Los accionistas pusieron plata: es un aporte, nunca un ingreso." },
];

/* La retroalimentación por tipo de error, de Gen. */
export const ERRORES_ACT1_T3 = {
  /* A · era ingreso y lo mandó al grupo 3. */
  A: "Sí hubo ingreso: la empresa vendió lo que ofrece. Lo que cambia es cuándo entra la plata.",
  /* B · no era ingreso y lo mandó al 1 o al 2. */
  B: "Aquí no hubo ingreso. Entró plata, pero la empresa no vendió lo que ofrece.",
  /* C · confundió el grupo 1 con el 2. */
  C: "Fíjate en cuándo entra la plata. Si entró el mismo día, va en el primer grupo; si llega después, en el segundo.",
};

/* Para el lector de pantalla: qué hay en la zona de juego (mío, descriptivo, como el de T1-6). */
export const ALT_ACT1_T3 = "Una ficha con un hecho y su empresa, y tres grupos para tocar.";
