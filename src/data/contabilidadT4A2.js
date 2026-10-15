/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A2 DE APRENDER — «El fondo fijo» (Célula D).
 *
 * Fuente: el paquete vigente de Katsumi, orquestador/conocimiento/paquetes/
 * d4-t4-a2-v1.md, que ya trae la v2 dentro (d4-t4-a2-v2-cambios.md se queda
 * como registro). Es el mismo blob que en main y en la punta de
 * feat/conta-d4-mapa-fuente. Una prueba compara cada texto de aquí contra él
 * y comprueba que ningún texto que la v2 sustituye siga aquí.
 *
 * Cifras (pp. 183-184), y quién es dueño de ellas: A2. A3 puede usarlas como
 * datos de su enunciado, nunca pedirlas como respuesta.
 *   · el fondo, 500.000 (errata D4-1 resuelta: el libro imprime «500.00»)
 *   · los ocho gastos de mayo, en el orden del libro
 *   · lo gastado, 478.100: SE CALCULA sumando los ocho gastos
 *   · lo que queda, 21.900: SE CALCULA restando lo gastado al fondo
 * El reembolso es del 31 de mayo (errata D4-2 resuelta).
 *
 * La figura es «El sobre y el libro» de Hanayama: la v1 con la v1.1 y la v1.2
 * encima (celula-d/hanayama-a2-figura-v1.2.md es la vigente). El sobre es el
 * MISMO que usa A3, con el mismo significado: FIGURA_SOBRE trae sus rótulos y
 * la vista lo pinta con SobreCajaMenor, que recibe un estado. Aquí van los
 * cinco estados de A2.
 *
 * Aprender: sin FP, sin catálogo y sin llamar al motor.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { BOTON, DEBE, HABER } from "./contabilidadT4.js";

export const A2_ID = "t4-a2-el-fondo-fijo";

/* ═══════════ LAS CIFRAS ═══════════ */

/* El fondo de Rosa Primorosa (p. 183). */
export const FONDO = 500_000;

/* Los gastos de mayo, literales de la p. 184 y en su orden. */
export const GASTOS_MAYO = [
  { gasto: "Transporte urbano", valor: 34_000 },
  { gasto: "Fotocopias", valor: 32_000 },
  { gasto: "Elementos de aseo para oficinas", valor: 28_300 },
  { gasto: "Papelería y útiles de oficina", valor: 63_400 },
  { gasto: "Cafetería", valor: 107_200 },
  { gasto: "Repuestos para equipo de oficina", valor: 34_100 },
  { gasto: "Servicio de correo", valor: 47_100 },
  { gasto: "Reparaciones locativas", valor: 132_000 },
];

/* Se calculan, no se transcriben. */
export const GASTADO = GASTOS_MAYO.reduce((s, g) => s + g.valor, 0);
export const QUEDA = FONDO - GASTADO;

/* ═══════════ TEXTOS DE INTERFAZ QUE EL PAQUETE NO TRAE ═══════════ */

/* El nombre de cada asiento para el lector de pantalla. Revisado por Katsumi (d4-t4-a2-v1.md, «Textos de interfaz»). */
export const NOMBRE_ASIENTO_A2 = {
  apertura: "Asiento de la apertura",
  reembolso: "Asiento del reembolso",
  aumento: "Asiento para aumentar el fondo",
  disminucion: "Asiento para disminuir el fondo",
};
/* El nombre de la tabla de gastos para el lector de pantalla. Revisado por Katsumi (ídem). */
export const NOMBRE_TABLA_GASTOS = "Los gastos de mayo";

/*
 * Los asientos modelo de P8 y P9 no tienen cifras. Hanayama (v1, §4) decide
 * el signo: «xxxx», literal de la p. 182, y no «✓», que en la materia ya
 * significa acierto. El paquete trae «✓» y dice que, si diseño prefiere otro
 * signo, el contenido no cambia.
 * Lo que oye el lector de pantalla lo revisó Katsumi (ídem).
 */
export const SIGNO_MODELO = { visible: "xxxx", lector: "valor que el libro no da" };

/* ═══════════ LA FIGURA: «EL SOBRE Y EL LIBRO» (Hanayama v1 + v1.1 + v1.2) ═══════════ */

/*
 * Del libro: «Caja menor», «Gastos generales», «Bancos», las cifras y
 * «billetes y monedas» (p. 184). Lo demás está marcado.
 */
export const FIGURA_SOBRE = {
  /* Rótulos de Hanayama, revisados por Katsumi (d4-t4-a2-v1.md, «Textos de interfaz de la figura»). */
  rotuloSobre: "LO QUE TIENE ROSA",
  rotuloLibro: "LO QUE DICE EL LIBRO",
  /* v1.2, FA2-2: el cheque en dos renglones fijos, «Cheque» / «sale de Bancos». Aprobado por Katsumi. */
  cheque: "Cheque",
  chequeSale: "sale de Bancos",
  fondo: "Fondo de caja menor",
  /* Del libro (p. 184). */
  billetes: "Billetes y monedas",
  /* «Soportes» es la glosa de Katsumi en P2. */
  soportes: "Soportes de gastos",
  /* v1.1: la última fila se llama «Suman» (antes «Fondo fijo»), igual que en A3. */
  suman: "Suman",
  /* v1.2, FA2-1: ni los billetes ni lo que suman se conocen antes del arqueo. */
  sinContar: "sin contar",
  /* Del libro. */
  cuentas: { "caja-menor": "Caja menor", "gastos-generales": "Gastos generales" },
  notas: { quieta: "no se ha movido desde el 1 de mayo", reembolso: "no aparece en el reembolso" },
};

/*
 * El texto alternativo, uno por estado (Hanayama v1, §5), con dos ajustes
 * para que diga lo mismo que el dibujo de la v1.2. Katsumi los aprobó tal
 * cual: la fuente es d4-t4-a2-v1.md, «Textos de interfaz de la figura».
 *   · `gastos` ya no dice «Siempre suman el fondo fijo, 500.000»: en la v1.2
 *     la suma está «sin contar» (FA2-1), y P5 pregunta justo eso
 *   · «un cheque de Bancos» pasa a «un cheque que sale de Bancos» (FA2-2)
 */
export const ALT_SOBRE_A2 = {
  apertura: "Un cheque que sale de Bancos por 500.000 entra al sobre de la caja menor. El sobre tiene 500.000 en billetes. En el libro, Caja menor vale 500.000.",
  gastos: "En mayo, el sobre tiene soportes de gastos por 478.100 y billetes sin contar. El fondo es de 500.000. En el libro, Caja menor sigue en 500.000.",
  cuadra: "En el sobre quedan 21.900 en billetes. Con los 478.100 de soportes suman 500.000.",
  reembolso: "Un cheque que sale de Bancos por 478.100 entra al sobre. El sobre vuelve a tener 500.000 en billetes y ningún soporte.",
  respuesta: "En el libro, Caja menor sigue en 500.000: no aparece en el reembolso. Los 478.100 van a Gastos generales.",
};

/*
 * Los cinco estados de A2. Cada uno dice qué hay en el sobre y en el libro:
 *   · cheque     el monto del cheque que entra, o null (sin cheque)
 *   · billetes   lo que hay en billetes, o null: «sin contar»
 *   · suman      billetes + soportes, o null: «sin contar»
 *   · foco       lo señalado (#F8F9FA 600)
 *   · libro      las filas del libro; o `oculto` con su forma, cuando el libro
 *                es la respuesta: reserva su alto SIN su contenido (PH8-2)
 */
const LIBRO_QUIETO = { filas: [{ id: "caja-menor", monto: FONDO, nota: "quieta" }] };
export const ESTADOS_SOBRE_A2 = {
  apertura: {
    cheque: FONDO, fondo: FONDO, billetes: FONDO, soportes: 0, suman: FONDO,
    foco: ["billetes", "caja-menor"],
    libro: { filas: [{ id: "caja-menor", monto: FONDO }] },
  },
  gastos: {
    cheque: null, fondo: FONDO, billetes: null, soportes: GASTADO, suman: null,
    foco: ["soportes"],
    libro: LIBRO_QUIETO,
  },
  cuadra: {
    cheque: null, fondo: FONDO, billetes: QUEDA, soportes: GASTADO, suman: QUEDA + GASTADO,
    foco: ["billetes", "suman"],
    libro: LIBRO_QUIETO,
  },
  reembolso: {
    cheque: GASTADO, fondo: FONDO, billetes: QUEDA + GASTADO, soportes: 0, suman: QUEDA + GASTADO,
    foco: ["billetes"],
    libro: { oculto: [{ nota: true }, { nota: false }] },
  },
  respuesta: {
    cheque: GASTADO, fondo: FONDO, billetes: QUEDA + GASTADO, soportes: 0, suman: QUEDA + GASTADO,
    foco: ["gastos-generales"],
    libro: { filas: [{ id: "caja-menor", monto: FONDO, nota: "reembolso" }, { id: "gastos-generales", monto: GASTADO }] },
  },
};

/* ═══════════ LOS ASIENTOS ═══════════ */

/* P3 · la apertura del 1 de mayo (p. 183). */
export const ASIENTO_APERTURA = {
  nombre: NOMBRE_ASIENTO_A2.apertura,
  fecha: "1 de mayo",
  lineas: [
    { cuenta: "Caja menor", lado: DEBE, monto: FONDO },
    { cuenta: "Bancos", lado: HABER, monto: FONDO },
  ],
};
/* P7 · el reembolso del 31 de mayo (p. 184). Solo con el acierto: es la respuesta. */
export const ASIENTO_REEMBOLSO = {
  nombre: NOMBRE_ASIENTO_A2.reembolso,
  fecha: "31 de mayo",
  lineas: [
    { cuenta: "Gastos generales", lado: DEBE, monto: GASTADO },
    { cuenta: "Bancos", lado: HABER, monto: GASTADO },
  ],
};
/* P8 y P9 · los asientos modelo de la p. 182, sin cifras ni fecha. */
export const ASIENTO_AUMENTO = {
  nombre: NOMBRE_ASIENTO_A2.aumento,
  signo: SIGNO_MODELO,
  lineas: [
    { cuenta: "Caja menor", lado: DEBE },
    { cuenta: "Bancos", lado: HABER },
  ],
};
export const ASIENTO_DISMINUCION = {
  nombre: NOMBRE_ASIENTO_A2.disminucion,
  signo: SIGNO_MODELO,
  lineas: [
    { cuenta: "Caja", lado: DEBE },
    { cuenta: "Caja menor", lado: HABER },
  ],
};

/* ═══════════ LAS PANTALLAS ═══════════ */

const PIE_181 = "Basado en el libro, p. 181";
const PIE_182 = "Basado en el libro, p. 182";
const PIE_184 = "Basado en el libro, p. 184";
const PIE_182_184 = "Basado en el libro, pp. 182 y 184";
const PIE_181_184 = "Basado en el libro, pp. 181-184";

/* P0 */
const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Al terminar, sabrás cómo se abre una caja menor, cómo se repone y por qué la cuenta Caja menor no se mueve con cada gasto.",
  boton: BOTON.empezar,
  pie: PIE_181_184,
};

/* P1 · El frasco es una analogía de Katsumi. Las glosas de «fijo» y «renovable» son suyas (v2: sin «siempre»). */
const QUE_ES = {
  id: "que-es",
  tipo: "lectura",
  parrafos: [
    "Piensa en el frasco con billetes que una familia deja en la cocina para el pan o los domicilios. Cuando se gasta, alguien lo vuelve a llenar hasta la misma cifra.",
    "Una empresa tiene algo parecido: la caja menor. Es un fondo en efectivo para gastos pequeños, urgentes o que no se esperaban.",
    "El libro dice que es fijo y renovable. Fijo quiere decir que vuelve a la misma cifra cada vez que se repone. Renovable, que se repone cada vez que se gasta.",
  ],
  boton: BOTON.seguir,
  pie: PIE_181,
};

/* P2 · Las cuatro funciones de la p. 181, numeradas como en el paquete. */
const QUIEN_LA_MANEJA = {
  id: "quien-la-maneja",
  tipo: "lectura",
  parrafos: [
    "La caja menor la maneja una sola persona, a quien la empresa le confía el fondo. Si algo sale mal, responde ante la empresa y ante la ley.",
    "El libro le pide cuatro cosas a esa persona:",
  ],
  listaNumerada: [
    "Pagar lo que la empresa autorizó pagar con la caja menor.",
    "Guardar la plata y los soportes de cada gasto, es decir, las facturas y los recibos.",
    /* v2: nombra la retención en la fuente y la remite a «Inventarios I» (p. 210). */
    "Aplicar las retenciones de ley. Una de ellas, la retención en la fuente, la verás en «Inventarios I».",
    "Pedir a tiempo que le repongan lo que se gastó.",
  ],
  boton: BOTON.seguir,
  pie: PIE_181,
};

/* P3 · La apertura (v2: «le hace un cheque», sin «girar»). */
const LA_APERTURA = {
  id: "la-apertura",
  tipo: "lectura",
  parrafos: [
    "Para abrir el fondo, la empresa le hace un cheque a la persona que lo va a manejar.",
    "El 1 de mayo, Sus Servicios Ltda. abre una caja menor de $500.000. Le hace el cheque a Rosa Primorosa, que la va a manejar.",
    "La plata sale del banco, así que Bancos se acredita por $500.000. Entra al fondo, así que Caja menor se debita por $500.000. Mira el asiento de la p. 183.",
  ],
  figura: { tipo: "sobre-a2", estado: "apertura" },
  asientos: [ASIENTO_APERTURA],
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 181 y 183",
};

/* P4 · Los gastos de mayo: la lista de la p. 184, con su total sumado. */
const LOS_GASTOS = {
  id: "los-gastos",
  tipo: "lectura",
  parrafos: [
    "Durante mayo, Rosa paga con el fondo los gastos pequeños de la oficina. Guarda el soporte de cada uno.",
    "El libro trae la lista de lo que Rosa pagó en mayo. Suma $478.100.",
  ],
  /* Los encabezados y «Total» son los de la tabla del paquete. */
  tabla: { nombre: NOMBRE_TABLA_GASTOS, columnas: ["Gasto", "Valor"], filas: GASTOS_MAYO.map((g) => ({ texto: g.gasto, monto: g.valor })), total: "Total" },
  figura: { tipo: "sobre-a2", estado: "gastos" },
  boton: BOTON.seguir,
  pie: PIE_184,
};

/*
 * P5 · ¿Cuánto queda? v2: los errores no revelan la respuesta, y la línea del
 * libro va solo con el acierto. Hanayama v1.1: en colocando y en el error la
 * figura se queda en `gastos`; solo el acierto la pasa a `cuadra`.
 */
const CUANTO_QUEDA = {
  id: "cuanto-queda",
  tipo: "eleccion",
  figura: { tipo: "sobre-a2", estados: { colocando: "gastos", error: "gastos", acierto: "cuadra" } },
  pregunta: "Al final de mayo, Rosa ha pagado $478.100 en gastos. ¿Cuánta plata debería quedarle en el fondo?",
  opciones: [
    { id: "lo-que-queda", texto: "$21.900", correcta: true },
    { id: "el-fondo", texto: "$500.000", devolucion: "Ese es el fondo completo, como si Rosa no hubiera pagado nada. Pero ya pagó gastos, así que en la caja tiene que quedar menos." },
    { id: "lo-gastado", texto: "$478.100", devolucion: "Esa cifra es lo que Rosa gastó, y esa plata ya salió de la caja. Lo que se pregunta es lo que no se gastó." },
  ],
  acierto: { texto: "Así es. Lo gastado más lo que queda da el fondo completo: $478.100 más $21.900 son $500.000. Las cuentas dan exacto.", pie: PIE_184 },
  error: { pie: PIE_184 },
  trasAcertar: { textos: ["El libro dice que Rosa tenía justo eso: $21.900 en billetes y monedas. Si la plata no diera exacto, sería otro caso. Lo verás en «El arqueo»."] },
  pie: PIE_184,
};

/* P6 · El reembolso. La primera línea es deducción de Katsumi; la glosa de «reembolso» es suya. */
const EL_REEMBOLSO = {
  id: "el-reembolso",
  tipo: "lectura",
  parrafos: [
    "El libro no anota cada gasto el día que se paga. Los anota todos juntos cuando se pide el reembolso.",
    "Reembolso es reponerle al fondo la plata que se gastó.",
    "Rosa le manda a contabilidad la lista de los pagos, con sus soportes. Contabilidad la aprueba y hace un cheque por lo gastado.",
    "El 31 de mayo sale el cheque del reembolso por $478.100. Es la plata que vuelve a llenar el fondo.",
  ],
  figura: { tipo: "sobre-a2", estado: "reembolso" },
  boton: BOTON.seguir,
  pie: PIE_182_184,
};

/*
 * P7 · ¿Y Caja menor? La confusión central de la pieza. v2: la glosa de Gastos
 * generales sube a la primera línea; los errores no remiten al asiento, que
 * es la respuesta; la frase de Gastos generales y Bancos y el asiento del 31
 * de mayo van solo con el acierto. Hanayama v1.1: en colocando y en el error,
 * `reembolso` (el libro no se ve, pero guarda su sitio); con el acierto,
 * `respuesta`.
 */
const Y_CAJA_MENOR = {
  id: "y-caja-menor",
  tipo: "eleccion",
  parrafos: ["Gastos generales es la cuenta donde el libro anota estos gastos del día a día de la oficina."],
  figura: { tipo: "sobre-a2", estados: { colocando: "reembolso", error: "reembolso", acierto: "respuesta" } },
  pregunta: "¿Qué le pasa a Caja menor con el reembolso?",
  opciones: [
    { id: "no-se-mueve", texto: "No se mueve.", correcta: true },
    { id: "se-debita", texto: "Se debita por $478.100.", devolucion: "Si Caja menor se debitara, el fondo crecería con cada reembolso. Pero el fondo es fijo: cada vez que se repone, vuelve a la misma cifra." },
    { id: "se-acredita", texto: "Se acredita por $478.100.", devolucion: "Si Caja menor se acreditara, el fondo se achicaría con cada gasto anotado. Pero el fondo es fijo, y los gastos tienen su propia cuenta." },
  ],
  acierto: { texto: "Así es. Mira el asiento de la p. 182: en el reembolso se debita Gastos generales y se acredita Bancos, y Caja menor no aparece. El fondo sigue valiendo $500.000.", pie: PIE_182_184 },
  error: { pie: PIE_182_184 },
  trasAcertar: {
    textos: ["Los gastos del mes van a Gastos generales, que se debita por $478.100. La plata sale del banco, y Bancos se acredita por $478.100."],
    asientos: [ASIENTO_REEMBOLSO],
  },
  pie: PIE_182_184,
};

/* P8 · Aumentar el fondo. «Lo mismo que al abrirlo» es una comparación de Katsumi. */
const AUMENTAR = {
  id: "aumentar",
  tipo: "lectura",
  parrafos: [
    "A veces el fondo se queda corto: los gastos lo superan de lejos y hay que reponerlo muy seguido. Entonces se aumenta.",
    "Para aumentarlo se hace lo mismo que al abrirlo: Caja menor se debita y Bancos se acredita.",
  ],
  asientos: [ASIENTO_AUMENTO],
  boton: BOTON.seguir,
  pie: PIE_182,
};

/* P9 · Disminuir el fondo. Por qué va a Caja y no a Bancos no se explica: el libro no lo dice (HD4-5). */
const DISMINUIR = {
  id: "disminuir",
  tipo: "lectura",
  parrafos: [
    "Otras veces pasa lo contrario: la plata se queda mucho tiempo quieta en el fondo. Entonces se disminuye.",
    "Para disminuirlo, Caja menor se acredita. Mira el asiento de la p. 182: la plata que sale del fondo va al debe de Caja.",
  ],
  asientos: [ASIENTO_DISMINUCION],
  boton: BOTON.seguir,
  pie: PIE_182,
};

/* P10 · Resumen (v2: la línea 3 sin «solo» y con el cierre). Es la última pantalla: no lleva botón. */
const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  listaNumerada: [
    "La caja menor es un fondo fijo en efectivo para gastos pequeños. Se abre con un cheque, así que Caja menor sube y Bancos baja.",
    "Los gastos se anotan juntos en el reembolso: se debita Gastos generales y se acredita Bancos. Caja menor no se mueve.",
    "Caja menor se mueve cuando el fondo se abre, se aumenta, se disminuye o se cierra. En el reembolso no se mueve.",
  ],
  siguiente: "Siguiente: «El arqueo».",
  pie: PIE_181_184,
};

/* `numero` es el de la pieza en el corte de T4 y ordena PIEZAS_T4 en la vista: A0 = 0, A1 = 1, A2 = 2. */
export const PIEZA_EL_FONDO_FIJO = {
  id: A2_ID,
  numero: 2,
  titulo: "El fondo fijo",
  pantallas: [PORTADA, QUE_ES, QUIEN_LA_MANEJA, LA_APERTURA, LOS_GASTOS, CUANTO_QUEDA, EL_REEMBOLSO, Y_CAJA_MENOR, AUMENTAR, DISMINUIR, RESUMEN],
};
