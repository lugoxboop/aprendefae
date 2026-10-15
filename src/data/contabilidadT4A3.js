/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A3 DE APRENDER — «El arqueo» (Célula D).
 *
 * Fuente: el paquete vigente de Katsumi, orquestador/conocimiento/paquetes/
 * d4-t4-a3-v1.md, que ya trae la v2 (d4-t4-a3-a4-v2-cambios.md) y la v3
 * (d4-t4-a3-h1-h2-v3-cambios.md); los dos se quedan como registro. Es el
 * mismo blob que en main y en la punta de feat/conta-d4-mapa-fuente. Una
 * prueba compara cada texto de aquí contra él, y comprueba que ningún texto
 * que la v2 o la v3 sustituyen siga aquí.
 *
 * Cifras (pp. 184-186). El fondo, los gastos y lo que quedaba son de A2, y
 * aquí solo van como datos. Los dos efectivos contados son datos del libro.
 * Todo lo demás SE CALCULA:
 *   · sobrante de caja menor: 478.100 + 24.000 = 502.100; 502.100 − 500.000
 *     = 2.100; el cheque, 478.100 − 2.100 = 476.000
 *   · faltante de caja menor: 478.100 + 15.200 = 493.300; 500.000 − 493.300
 *     = 6.700; el cheque, 478.100 + 6.700 = 484.800
 *   · el distractor construido de P4: 478.100 + 2.100 = 480.200
 * Erratas: D4-2 (31 de mayo), D4-3 («operacionales»), D4-4 (Gastos
 * generales), D4-8 (Cuentas por cobrar – empleados al debe).
 *
 * La figura es «El sobre contado» de Hanayama (A3 v1 con la v1.2 encima): el
 * MISMO sobre de A2 (SobreCajaMenor, en la vista), con lo que A3 le añade
 * como datos: la fila de la diferencia, la línea del cálculo bajo el cheque
 * y la tercera fila del libro, en dos renglones.
 *
 * Aprender: sin FP, sin catálogo y sin llamar al motor.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { BOTON, DEBE, HABER } from "./contabilidadT4.js";
import { FONDO, GASTADO, QUEDA, FIGURA_SOBRE } from "./contabilidadT4A2.js";

export const A3_ID = "t4-a3-el-arqueo";

/* ═══════════ LAS CIFRAS ═══════════ */

/* Los dos efectivos contados: datos de la p. 185. */
export const EFECTIVO_SOBRANTE = 24_000;
export const EFECTIVO_FALTANTE = 15_200;

/* Se calculan, no se transcriben. */
export const SUMA_SOBRANTE = GASTADO + EFECTIVO_SOBRANTE;
export const SOBRANTE = SUMA_SOBRANTE - FONDO;
export const CHEQUE_SOBRANTE = GASTADO - SOBRANTE;
export const SUMA_FALTANTE = GASTADO + EFECTIVO_FALTANTE;
export const FALTANTE = FONDO - SUMA_FALTANTE;
export const CHEQUE_FALTANTE = GASTADO + FALTANTE;
/* El distractor de P4, construido por Katsumi: suma la diferencia en vez de restarla. */
export const CHEQUE_CON_DIFERENCIA = GASTADO + SOBRANTE;

/* ═══════════ TEXTOS DE INTERFAZ QUE EL PAQUETE NO TRAE ═══════════ */

/* [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN] El nombre de cada asiento para el lector de pantalla. */
export const NOMBRE_ASIENTO_A3 = {
  sobrante: "Asiento del reembolso con sobrante de caja menor",
  empleado: "Asiento del reembolso con faltante de caja menor cobrado a Rosa",
  gasto: "Asiento del reembolso con faltante de caja menor llevado al gasto",
};

/* ═══════════ LA FIGURA: «EL SOBRE CONTADO» (Hanayama A3 v1 + v1.2) ═══════════ */

/* Las tres cuentas de la diferencia, con su guion (D4-3, C5). */
const INGRESOS_SOBRANTE = "Ingresos no operacionales – sobrante de caja menor";
const CXC_EMPLEADOS = "Cuentas por cobrar – empleados";
const GASTOS_FALTANTE = "Gastos no operacionales – faltante de caja menor";

/*
 * Los rótulos del sobre de A2, con lo que A3 añade. Las cuentas de la
 * diferencia van en dos renglones fijos, partidos en el guion del libro: no
 * caben en una línea a 320 px (Hanayama A3 v1 §2.3).
 */
export const FIGURA_SOBRE_A3 = {
  ...FIGURA_SOBRE,
  /* De Katsumi (C5: nunca a secas). «Diferencia» es de Hanayama: [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN]. */
  diferencias: { cero: "Diferencia", sobrante: "Sobrante de caja menor", faltante: "Faltante de caja menor" },
  cuentas: {
    ...FIGURA_SOBRE.cuentas,
    "ingresos-sobrante": ["Ingresos no operacionales", "– sobrante de caja menor"],
    "cxc-empleados": ["Cuentas por cobrar", "– empleados"],
    "gastos-faltante": ["Gastos no operacionales", "– faltante de caja menor"],
  },
};

/*
 * [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN] El texto alternativo, uno por
 * estado (Hanayama A3 v1 §4, con `p1-cuadra` de la v1.2). Tres ajustes míos,
 * que van en el informe del PR:
 *   · `p4-colocando` no tiene texto en la especificación: se ve lo mismo que
 *     en `p3-respuesta` (el cheque está oculto), así que dice lo mismo
 *   · «El cheque de Bancos sale por 476.000» pasa a «El cheque sale de Bancos
 *     por 476.000», como el rótulo de la v1.2 (FA2-2)
 *   · en `p5-asiento`, «Ingresos no operacionales – sobrante de caja menor,
 *     2.100» pasa a «… lleva 2.100», para que se oiga como las demás
 */
export const ALT_SOBRE_A3 = {
  "p1-cuadra": "El sobre de la caja menor: 21.900 en billetes y 478.100 en soportes suman 500.000, el fondo.",
  "p3-colocando": "El sobre tiene 24.000 en billetes y 478.100 en soportes. El fondo es de 500.000.",
  "p3-respuesta": "Suman 502.100: hay un sobrante de caja menor de 2.100.",
  "p4-colocando": "Suman 502.100: hay un sobrante de caja menor de 2.100.",
  "p4-respuesta": "El cheque sale de Bancos por 476.000. Con los 24.000 de la caja, el fondo vuelve a 500.000.",
  "p5-asiento": "El sobre vuelve a tener 500.000. En el libro, Caja menor no aparece; Gastos generales lleva 478.100 e Ingresos no operacionales – sobrante de caja menor lleva 2.100.",
  "p6-faltante": "El sobre tiene 15.200 en billetes y 478.100 en soportes: suman 493.300, y hay un faltante de caja menor de 6.700. El cheque sale por 484.800, y con los 15.200 el fondo vuelve a 500.000.",
  "p8-colocando": "El sobre vuelve a tener 500.000 con un cheque de 484.800.",
  "p8-respuesta": "En el libro, los 6.700 van a Cuentas por cobrar – empleados.",
  "p9-gasto": "En el libro, los 6.700 van a Gastos no operacionales – faltante de caja menor.",
};

/*
 * Los estados de A3, con la forma de los de A2 y lo que A3 añade:
 *   · diferencia     { tipo, monto } — la última fila del sobre —, u
 *                    { oculta: true }: guarda su sitio sin decir nada
 *   · sumanOculto    «Suman» guarda su sitio sin decir nada (es la respuesta)
 *   · calculo        { efectivo }: la línea efectivo + cheque = fondo
 *   · chequeOculto   { calculo }: el cheque, su cálculo y el tubo guardan su
 *                    sitio sin decir nada (el cheque es la respuesta)
 *   · libro: null    sin libro: antes del reembolso no hay asiento
 * Antes del reembolso el sobre está EN ARQUEO (billetes contados, soportes,
 * suma, diferencia); después, REPUESTO (500.000, 0, 500.000), con el libro.
 */
const arqueo = (efectivo, extra) => ({ cheque: null, fondo: FONDO, billetes: efectivo, soportes: GASTADO, suman: efectivo + GASTADO, libro: null, ...extra });
const repuesto = (cheque, libro, foco) => ({ cheque, fondo: FONDO, billetes: FONDO, soportes: 0, suman: FONDO, libro, foco });
const RESPUESTA_P3 = { diferencia: { tipo: "sobrante", monto: SOBRANTE }, foco: ["suman", "diferencia"] };
const LIBRO_REEMBOLSO = (tercera, monto) => ({ filas: [{ id: "caja-menor", monto: FONDO, nota: "reembolso" }, { id: "gastos-generales", monto: GASTADO }, { id: tercera, monto }] });
const LIBRO_OCULTO = { oculto: [{ nota: true }, { nota: false }, { dos: true }] };

export const ESTADOS_SOBRE_A3 = {
  /* v1.2, FA3-1: «Diferencia · 0» guarda su sitio, oculta: P1 todavía no habla de diferencia. */
  "p1-cuadra": arqueo(QUEDA, { diferencia: { oculta: true }, foco: ["suman"] }),
  "p3-colocando": arqueo(EFECTIVO_SOBRANTE, { suman: null, sumanOculto: true, diferencia: { oculta: true }, foco: ["billetes"] }),
  "p3-respuesta": arqueo(EFECTIVO_SOBRANTE, RESPUESTA_P3),
  /* Igual que el acierto de P3, con el cheque guardando su sitio: al llegar no cambia nada del sobre. */
  "p4-colocando": arqueo(EFECTIVO_SOBRANTE, { ...RESPUESTA_P3, chequeOculto: { calculo: true } }),
  "p4-respuesta": arqueo(EFECTIVO_SOBRANTE, { ...RESPUESTA_P3, cheque: CHEQUE_SOBRANTE, calculo: { efectivo: EFECTIVO_SOBRANTE }, foco: [] }),
  "p5-asiento": repuesto(CHEQUE_SOBRANTE, LIBRO_REEMBOLSO("ingresos-sobrante", SOBRANTE), ["ingresos-sobrante"]),
  "p6-faltante": arqueo(EFECTIVO_FALTANTE, {
    diferencia: { tipo: "faltante", monto: FALTANTE },
    cheque: CHEQUE_FALTANTE, calculo: { efectivo: EFECTIVO_FALTANTE },
    foco: ["billetes", "suman", "diferencia"],
  }),
  "p8-colocando": repuesto(CHEQUE_FALTANTE, LIBRO_OCULTO, []),
  "p8-respuesta": repuesto(CHEQUE_FALTANTE, LIBRO_REEMBOLSO("cxc-empleados", FALTANTE), ["cxc-empleados"]),
  "p9-gasto": repuesto(CHEQUE_FALTANTE, LIBRO_REEMBOLSO("gastos-faltante", FALTANTE), ["gastos-faltante"]),
};

/* ═══════════ LOS ASIENTOS (todos del 31 de mayo, D4-2) ═══════════ */

const FECHA = "31 de mayo";
export const ASIENTO_SOBRANTE = {
  nombre: NOMBRE_ASIENTO_A3.sobrante,
  fecha: FECHA,
  lineas: [
    { cuenta: "Gastos generales", lado: DEBE, monto: GASTADO },
    { cuenta: INGRESOS_SOBRANTE, lado: HABER, monto: SOBRANTE },
    { cuenta: "Bancos", lado: HABER, monto: CHEQUE_SOBRANTE },
  ],
};
export const ASIENTO_FALTANTE_EMPLEADO = {
  nombre: NOMBRE_ASIENTO_A3.empleado,
  fecha: FECHA,
  lineas: [
    { cuenta: "Gastos generales", lado: DEBE, monto: GASTADO },
    { cuenta: CXC_EMPLEADOS, lado: DEBE, monto: FALTANTE },
    { cuenta: "Bancos", lado: HABER, monto: CHEQUE_FALTANTE },
  ],
};
export const ASIENTO_FALTANTE_GASTO = {
  nombre: NOMBRE_ASIENTO_A3.gasto,
  fecha: FECHA,
  lineas: [
    { cuenta: "Gastos generales", lado: DEBE, monto: GASTADO },
    { cuenta: GASTOS_FALTANTE, lado: DEBE, monto: FALTANTE },
    { cuenta: "Bancos", lado: HABER, monto: CHEQUE_FALTANTE },
  ],
};

/* ═══════════ LAS PANTALLAS ═══════════ */

const PIE_185 = "Basado en el libro, p. 185";
const PIE_183_186 = "Basado en el libro, pp. 183 y 186";
const PIE_182_186 = "Basado en el libro, pp. 182-186";

/* P0 */
const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Al terminar, sabrás qué se anota cuando la plata de la caja menor no cuadra, y por qué el cheque del reembolso cambia.",
  boton: BOTON.empezar,
  pie: PIE_182_186,
};

/* P1 · Qué se cuenta en un arqueo. Las cifras de A2, solo como dato. */
const QUE_SE_CUENTA = {
  id: "que-se-cuenta",
  tipo: "lectura",
  parrafos: [
    "En «La caja» viste que un arqueo es contar la plata para ver si cuadra. En la caja menor se hace a menudo y sin avisar.",
    "Se suman los soportes de lo que se pagó y el efectivo que queda en la caja. Esa suma debe dar el valor del fondo.",
    "En «El fondo fijo», la suma de Rosa dio exacto: $478.100 en gastos más $21.900 en efectivo son $500.000.",
  ],
  figura: { tipo: "sobre-a3", estado: "p1-cuadra" },
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 182 y 184",
};

/* P2 · Cuando no cuadra. La definición es formulación de Katsumi. Sin figura. */
const CUANDO_NO_CUADRA = {
  id: "cuando-no-cuadra",
  tipo: "lectura",
  parrafos: ["Si la suma da más que el fondo, hay un sobrante de caja menor. Si da menos, hay un faltante de caja menor."],
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 182-183 y 185",
};

/* P3 · El sobrante de caja menor. v2: los errores no revelan. Hanayama: el error se queda en colocando. */
const EL_SOBRANTE = {
  id: "el-sobrante",
  tipo: "eleccion",
  parrafos: ["Ahora el libro cambia un dato. Los gastos de mayo son los mismos, $478.100, pero en la caja hay $24.000."],
  figura: { tipo: "sobre-a3", estados: { colocando: "p3-colocando", error: "p3-colocando", acierto: "p3-respuesta" } },
  pregunta: "¿Qué muestra el arqueo?",
  opciones: [
    { id: "sobrante", texto: "Un sobrante de caja menor de $2.100.", correcta: true },
    { id: "faltante", texto: "Un faltante de caja menor de $2.100.", devolucion: "Mira la dirección de la diferencia. Los gastos más el efectivo dan $502.100, y el fondo es de $500.000: ¿la suma se pasa o se queda corta?" },
    { id: "cuadra", texto: "Nada: el fondo cuadra.", devolucion: "Para que cuadre, gastos más efectivo tienen que dar justo $500.000. Haz la suma: $478.100 más $24.000." },
  ],
  acierto: { texto: "Así es. Los gastos más el efectivo dan $502.100: $478.100 más $24.000. Son $2.100 más que el fondo de $500.000.", pie: PIE_185 },
  error: { pie: PIE_185 },
  pie: PIE_185,
};

/* P4 · ¿Por cuánto sale el cheque? La pregunta central. v3: «hacer», no «girar». */
const EL_CHEQUE = {
  id: "el-cheque",
  tipo: "eleccion",
  figura: { tipo: "sobre-a3", estados: { colocando: "p4-colocando", error: "p4-colocando", acierto: "p4-respuesta" } },
  pregunta: "Contabilidad va a hacer el cheque del reembolso. ¿Por cuánto sale?",
  opciones: [
    { id: "menos", texto: "$476.000", correcta: true },
    { id: "lo-gastado", texto: "$478.100", devolucion: "Ese es el total de los gastos, y así fue en «El fondo fijo», donde todo cuadraba. Aquí hay plata de más en la caja, y eso cambia el cheque." },
    { id: "con-diferencia", texto: "$480.200", devolucion: "Eso suma la diferencia. Pero la plata de más ya está en la caja: el cheque no tiene que reponerla también." },
  ],
  acierto: { texto: "Así es. Los gastos fueron $478.100, pero el cheque sale por $476.000. Los $2.100 que sobran ya están en la caja.", pie: PIE_185 },
  error: { pie: PIE_185 },
  /* v2: solo con el acierto. */
  trasAcertar: { textos: ["Con los $24.000 de la caja y el cheque de $476.000, el fondo vuelve a sus $500.000."] },
  pie: PIE_185,
};

/* P5 · El asiento del sobrante de caja menor. v3, A3-2: «la página 185». La glosa de «no operacional» es de Katsumi. */
const EL_ASIENTO = {
  id: "el-asiento",
  tipo: "lectura",
  parrafos: [
    "Los gastos de mayo siguen completos en Gastos generales: $478.100. Lo que cambia es el cheque.",
    "El cheque sale por $476.000, así que Bancos se acredita por $476.000.",
    "Los $2.100 van al haber de Ingresos no operacionales – sobrante de caja menor. Así está en el asiento de la página 185.",
  ],
  figura: { tipo: "sobre-a3", estado: "p5-asiento" },
  asientos: [ASIENTO_SOBRANTE],
  tras: [
    "El asiento cuadra: $2.100 más $476.000 son $478.100.",
    "“No operacional” quiere decir que no viene del negocio de la empresa. Sus Servicios no vive de lo que sobre en su caja menor.",
  ],
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 183 y 185",
};

/* P6 · El faltante de caja menor. La última línea es deducción de Katsumi. */
const EL_FALTANTE = {
  id: "el-faltante",
  tipo: "lectura",
  parrafos: [
    "Última versión del libro. Los gastos siguen siendo $478.100, pero en la caja hay $15.200.",
    "Los gastos más el efectivo dan $493.300. Faltan $6.700 para los $500.000 del fondo: es un faltante de caja menor.",
    "Aquí pasa lo contrario que con el sobrante de caja menor. El cheque sale por más de lo gastado: $484.800.",
    "Repone los $478.100 de los gastos y los $6.700 que faltan. Con los $15.200 de la caja, el fondo vuelve a sus $500.000.",
  ],
  figura: { tipo: "sobre-a3", estado: "p6-faltante" },
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 185-186",
};

/* P7 · Dos caminos, sin umbral (HD4-6). Sin figura. */
const DOS_CAMINOS = {
  id: "dos-caminos",
  tipo: "lectura",
  parrafos: [
    "Alguien tiene que responder por esos $6.700. El libro da dos caminos.",
    "El libro decide con una palabra: «representativo». Si el faltante de caja menor lo es, lo usual es cobrárselo a quien maneja el fondo.",
    "Si no lo es, la empresa puede asumirlo como un gasto del periodo.",
    "El libro no dice desde qué cifra un faltante de caja menor es representativo. Eso lo decide la empresa.",
  ],
  boton: BOTON.seguir,
  pie: PIE_183_186,
};

/* P8 · Camino 1. v2: la glosa y el asiento, solo con el acierto. Hanayama: el libro oculto mientras pregunta. */
const CAMINO_1 = {
  id: "camino-1",
  tipo: "eleccion",
  figura: { tipo: "sobre-a3", estados: { colocando: "p8-colocando", error: "p8-colocando", acierto: "p8-respuesta" } },
  pregunta: "Sus Servicios decide cobrarle los $6.700 a Rosa. ¿A qué cuenta van?",
  opciones: [
    { id: "cxc-empleados", texto: CXC_EMPLEADOS, correcta: true },
    { id: "gastos-faltante", texto: GASTOS_FALTANTE, devolucion: "Esa cuenta es para cuando la empresa asume la pérdida. Lee otra vez lo que decidió Sus Servicios." },
    { id: "ingresos-sobrante", texto: INGRESOS_SOBRANTE, devolucion: "Esa cuenta es para cuando hay plata de más. Aquí falta plata." },
  ],
  acierto: { texto: "Así es. Rosa le queda debiendo $6.700 a la empresa. Es plata que la empresa va a cobrar, así que va al debe de Cuentas por cobrar – empleados.", pie: PIE_183_186 },
  error: { pie: PIE_183_186 },
  trasAcertar: {
    textos: ["Cuentas por cobrar – empleados es lo que un empleado le queda debiendo a la empresa. Es un activo, como las demás cuentas por cobrar."],
    asientos: [ASIENTO_FALTANTE_EMPLEADO],
  },
  pie: PIE_183_186,
};

/* P9 · Camino 2: el mismo faltante de caja menor, otra cuenta. */
const CAMINO_2 = {
  id: "camino-2",
  tipo: "lectura",
  parrafos: [
    "Ahora la otra decisión: Sus Servicios asume la pérdida y no le cobra a Rosa.",
    "Los $6.700 van al debe de Gastos no operacionales – faltante de caja menor. Mira el asiento de la p. 186.",
    "Es una pérdida que no viene del negocio de la empresa. Por eso es no operacional.",
  ],
  figura: { tipo: "sobre-a3", estado: "p9-gasto" },
  asientos: [ASIENTO_FALTANTE_GASTO],
  tras: ["En los dos casos, los gastos y el cheque son iguales. Solo cambia la cuenta de los $6.700."],
  boton: BOTON.seguir,
  pie: "Basado en el libro, p. 186",
};

/* P10 · Resumen. Es la última pantalla: no lleva botón. */
const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  listaNumerada: [
    "Un arqueo suma los gastos pagados y el efectivo que queda. Esa suma debe dar el fondo.",
    "Con un sobrante de caja menor, el cheque sale por menos de lo gastado. La diferencia va a Ingresos no operacionales – sobrante de caja menor.",
    "Con un faltante de caja menor, el cheque sale por más. La diferencia se le cobra al empleado o va al gasto, según decida la empresa.",
  ],
  siguiente: "Siguiente: «Bancos y notas del banco».",
  pie: PIE_182_186,
};

/* `numero` es el de la pieza en el corte de T4: A0 = 0, A1 = 1, A2 = 2, A3 = 3. */
export const PIEZA_EL_ARQUEO = {
  id: A3_ID,
  numero: 3,
  titulo: "El arqueo",
  pantallas: [PORTADA, QUE_SE_CUENTA, CUANDO_NO_CUADRA, EL_SOBRANTE, EL_CHEQUE, EL_ASIENTO, EL_FALTANTE, DOS_CAMINOS, CAMINO_1, CAMINO_2, RESUMEN],
};
