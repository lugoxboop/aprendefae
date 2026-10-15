/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A0 DE APRENDER — «El activo corriente» (Célula D).
 *
 * Fuente: el paquete de Katsumi en la punta de feat/conta-d4-mapa-fuente:
 * la versión 1 (con la paráfrasis de e12ed82 ya dentro) y los cambios de la
 * v2 encima (auditoría de Shibukawa). Copia en orquestador/conocimiento/
 * paquetes/d4-t4-a0-v1.md y d4-t4-a0-v2-cambios.md, los mismos blobs. Una
 * prueba compara cada texto de aquí contra ellos, letra por letra.
 *
 * pp. 177-179, hasta el título de §5.1. Va delante de A1 en el índice. Deja
 * enseñado lo que piden B.1, A.1 (p. 262) y C.1 (p. 263) de la Célula E, sin
 * copiar C.1 como ítem. Sin cifras: los porcentajes de la p. 179 no entran.
 *
 * Aprender: sin FP, sin catálogo y sin llamar al motor. La figura es «La raya
 * del año» de Hanayama (v1): FIGURA_RAYA trae sus rótulos y ESTADOS_RAYA lo
 * que se ve en cada estado; cada pantalla dice en qué estado la pide.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { BOTON } from "./contabilidadT4.js";

export const A0_ID = "t4-a0-el-activo-corriente";

/*
 * ═══════════ LA FIGURA: «LA RAYA DEL AÑO» (Hanayama v1) ═══════════
 *
 * Sin teal, ámbar ni coral, y sin Debe ni Haber: A0 no usa el debe y el haber
 * de A1. Cada renglón de rótulo y de tarjeta va sin partirse.
 */
export const FIGURA_RAYA = {
  /* [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN] Rótulos del margen y de las zonas (Hanayama v1, §4). */
  hoy: "hoy",
  unAno: "1 año",
  zonaSi: ["Corriente", "se vuelve plata", "antes de un año"],
  /*
   * [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN] El rótulo de la zona de abajo,
   * en un solo sitio a propósito: la v1.1 de Hanayama lo cambia por el
   * complemento de «Corriente» («no se vuelve plata» / «antes de un año»).
   * Hasta que llegue, va el de la v1.
   */
  zonaNo: ["No es corriente", "tarda más", "de un año"],
  /* [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN] El texto alternativo, uno por estado (Hanayama v1, §4). */
  alt: {
    prueba: "Una línea de tiempo que empieza hoy. Una raya marca un año. Lo que se vuelve plata antes de la raya es corriente; lo que tarda más, no.",
    ejemplos: "Antes de la raya del año: efectivo en caja, depósitos en bancos, inversiones a corto plazo, cartera e inventarios.",
    "p4-colocando": "La raya del año, todavía sin activos.",
    "p4-error-edificio": "El edificio de la oficina cae después de la raya del año: se usa por años.",
    "p4-error-deuda": "La deuda de un cliente que vence en tres años cae después de la raya del año.",
    "p4-acierto": "La mercancía cae antes de la raya del año. La deuda a tres años y el edificio caen después.",
    fijos: "Después de la raya del año: un edificio, un terreno, una máquina y un vehículo.",
    primero: "El efectivo en caja y los depósitos en bancos están en lo más alto, junto a hoy.",
    resumen: "Los cinco activos corrientes antes de la raya del año y los cuatro activos fijos después.",
  },
};

/* Las tarjetas. Los cinco ejemplos son de la p. 178, sin artículo ni punto porque son rótulos. */
const EJEMPLOS_LIBRO = [
  { id: "caja", texto: "Efectivo en caja" },
  { id: "bancos", texto: "Depósitos en bancos" },
  { id: "inversiones", texto: "Inversiones a corto plazo" },
  { id: "cartera", texto: "Cartera" },
  { id: "inventarios", texto: "Inventarios" },
];
/* De Katsumi (P5). */
const FIJOS = [
  { id: "un-edificio", texto: "Un edificio" },
  { id: "terreno", texto: "Un terreno" },
  { id: "maquina", texto: "Una máquina" },
  { id: "vehiculo", texto: "Un vehículo" },
];
/* Abreviados de las opciones de P4 de Katsumi. Las glosas: [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN]. */
const DE_P4 = {
  mercancia: { id: "mercancia", texto: "Mercancía", glosa: "se vende este mes" },
  deuda: { id: "deuda", texto: "Deuda de un cliente", glosa: "vence en tres años" },
  edificio: { id: "edificio", texto: "Edificio de la oficina", glosa: "se usa por años" },
};

/*
 * Qué cae a cada lado de la raya en cada estado, y qué va señalado. En P4 la
 * figura no dibuja la respuesta mientras se pregunta, y en cada error solo
 * muestra la tarjeta del distractor elegido, en su sitio verdadero.
 */
export const ESTADOS_RAYA = {
  prueba: { antes: [], despues: [], foco: [] },
  ejemplos: { antes: EJEMPLOS_LIBRO, despues: [], foco: [] },
  "p4-colocando": { antes: [], despues: [], foco: [], p4: true },
  "p4-error-edificio": { antes: [], despues: [DE_P4.edificio], foco: ["edificio"], p4: true },
  "p4-error-deuda": { antes: [], despues: [DE_P4.deuda], foco: ["deuda"], p4: true },
  "p4-acierto": { antes: [DE_P4.mercancia], despues: [DE_P4.deuda, DE_P4.edificio], foco: ["mercancia"], p4: true },
  fijos: { antes: EJEMPLOS_LIBRO, despues: FIJOS, foco: FIJOS.map((f) => f.id) },
  primero: { antes: EJEMPLOS_LIBRO, despues: FIJOS, foco: ["caja", "bancos"] },
  resumen: { antes: EJEMPLOS_LIBRO, despues: FIJOS, foco: [] },
};

/* P0 */
const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Al terminar, sabrás qué hace que un activo sea corriente, cuáles son los del libro y por qué el efectivo va primero.",
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 177-179",
};

/* P1 · La prueba del año. «La prueba» es la forma de Katsumi de volver pregunta la definición. */
const PRUEBA_DEL_ANO = {
  id: "prueba-del-ano",
  tipo: "lectura",
  parrafos: [
    "Ya sabes que un activo es lo que la empresa tiene. Este capítulo mira un grupo de ellos: los activos corrientes.",
    "El libro los define por el tiempo: un activo es corriente si se puede volver efectivo antes de que pase un año.",
    "Esa es la prueba. Pregúntate si eso se vuelve plata antes de un año.",
    /* v2, obligatoria 3: la conexión con la definición del desafío del Tema 2. «Las dos van juntas» es de Katsumi. */
    "En el Tema 2 quizá viste otra forma de decirlo: es corriente lo que se vuelve efectivo o se consume dentro del año.",
    "Las dos van juntas. La del libro mira lo que se vuelve plata. La otra suma lo que la empresa usa en ese año, como un arriendo pagado por adelantado.",
  ],
  figura: { tipo: "raya", estado: "prueba" },
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 177-178, y en el Tema 2",
};

/* P2 · Una analogía, construida por Katsumi. El paquete dice «Pie: ninguno (es construcción)». */
const ANALOGIA = {
  id: "analogia",
  tipo: "lectura",
  parrafos: [
    "Piensa en lo que tienes tú. Lo que un amigo te va a pagar el mes que viene se vuelve plata pronto.",
    "La bicicleta que usas todos los días también es tuya. Pero no la tienes para venderla, y te va a durar años.",
  ],
  boton: BOTON.seguir,
  pie: null,
};

/* P3 · Los ejemplos del libro (p. 178), numerados como en el paquete, con las tres glosas debajo. */
const EJEMPLOS = {
  id: "ejemplos",
  tipo: "lectura",
  parrafos: ["El libro da estos ejemplos de activos corrientes:"],
  listaNumerada: [
    "El efectivo en caja.",
    "Los depósitos en bancos.",
    "Las inversiones a corto plazo.",
    "La cartera.",
    "Los inventarios.",
  ],
  despues: [
    /* v2, opcional O-2 que Katsumi toma: se apoya en el propio libro (p. 179). */
    "La cartera es lo que los clientes le deben a la empresa. Más adelante el libro la llama clientes, y es la cuenta Cuentas por cobrar, que ya conoces.",
    "Los inventarios son la mercancía que la empresa tiene para vender.",
    "Corto plazo quiere decir menos de un año. Es el mismo criterio de los activos corrientes.",
  ],
  figura: { tipo: "raya", estado: "ejemplos" },
  boton: BOTON.seguir,
  pie: "Basado en el libro, p. 178",
};

/* P4 · ¿Cuál es corriente? Las tres opciones son construidas. Un solo activo, no grupos: no adelanta C.1. */
const CUAL_ES_CORRIENTE = {
  id: "cual-es-corriente",
  tipo: "eleccion",
  /* El error depende de la opción elegida: cada distractor cae en su sitio. */
  figura: { tipo: "raya", estados: { colocando: "p4-colocando", error: { edificio: "p4-error-edificio", "deuda-tres-anos": "p4-error-deuda" }, acierto: "p4-acierto" } },
  pregunta: "¿Cuál de estos activos es corriente?",
  opciones: [
    /* v2, obligatoria 2: «y cobrar», para no chocar con «Vender no es cobrar» del Tema 3. */
    { id: "mercancia", texto: "Una mercancía que la empresa piensa vender y cobrar este mes.", correcta: true },
    { id: "edificio", texto: "El edificio donde funciona la oficina.", devolucion: "La empresa usa el edificio por años; no lo tiene para volverlo plata. No pasa la prueba del año." },
    { id: "deuda-tres-anos", texto: "Una deuda de un cliente que vence en tres años.", devolucion: "Es lo que le debe un cliente, pero vence en tres años. No se vuelve plata en menos de un año, así que no es corriente." },
  ],
  acierto: { texto: "Así es. Se vende y se cobra este mes, así que se vuelve plata mucho antes de un año.", pie: "Basado en el libro, p. 178" },
  error: { pie: "Basado en el libro, p. 178" },
  pie: "Basado en el libro, p. 178",
};

/* P5 · Los activos fijos. La definición y los cuatro ejemplos son de Katsumi (hueco HD4-15). */
const ACTIVOS_FIJOS = {
  id: "activos-fijos",
  tipo: "lectura",
  parrafos: [
    "Al lado de los corrientes, el libro nombra los activos fijos. Son los que la empresa usa por años, como un edificio, un terreno, una máquina o un vehículo.",
    "No se tienen para convertirlos en plata, sino para trabajar con ellos.",
    /* v2, obligatoria A0-1: el término se define en la misma frase. */
    "En el estado de situación financiera, estos van en el activo no corriente, es decir, el que no es corriente.",
  ],
  figura: { tipo: "raya", estado: "fijos" },
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 178-179",
};

/* P6 · Por qué importan: las dos razones del libro y el matiz sobre los fijos, que pide A.1. */
const POR_QUE_IMPORTAN = {
  id: "por-que-importan",
  tipo: "lectura",
  parrafos: [
    "¿Por qué importan tanto los activos corrientes? El libro da dos razones.",
    "Primero, con ellos la empresa trabaja. Con ellos compra mercancía, paga los sueldos, compra activos fijos y paga lo que debe.",
    "Segundo, son los que pagan las deudas. Un edificio puede servir de garantía de un préstamo, pero las cuotas se pagan con plata.",
    "Por eso, un banco o un proveedor mira primero si la empresa tiene con qué pagarle, y después cuánto valen sus edificios o sus máquinas.",
    "Pero el libro no desprecia los activos fijos. Con las máquinas y los locales se produce buena parte de esa plata.",
  ],
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 178-179",
};

/* P7 · El efectivo va primero: el puente a A1. «Porque ya es plata» es lectura de Katsumi (HD4-17). */
const EFECTIVO_PRIMERO = {
  id: "efectivo-primero",
  tipo: "lectura",
  parrafos: [
    "De todos los activos corrientes, hay uno que no necesita convertirse en nada: el efectivo. Ya es plata.",
    "El libro lo pone primero en su lista: caja y bancos, inversiones, clientes e inventarios. El capítulo también empieza por él.",
    "Las siguientes piezas empiezan por ahí: la caja, la caja menor y los bancos.",
  ],
  figura: { tipo: "raya", estado: "primero" },
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 178-179",
};

/* P8 · Resumen. Es la última pantalla: no lleva botón. */
const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  listaNumerada: [
    "Un activo es corriente si se puede volver efectivo antes de que pase un año.",
    "Los del libro son el efectivo en caja y bancos, la cartera, los inventarios y las inversiones a corto plazo.",
    "Con ellos la empresa opera y paga sus deudas. El efectivo va primero porque ya es plata.",
  ],
  siguiente: "Siguiente: «La caja».",
  figura: { tipo: "raya", estado: "resumen" },
  pie: "Basado en el libro, pp. 177-179",
};

/* `numero` 0: va delante de A1 (número 1) en PIEZAS_T4. */
export const PIEZA_EL_ACTIVO_CORRIENTE = {
  id: A0_ID,
  numero: 0,
  titulo: "El activo corriente",
  pantallas: [PORTADA, PRUEBA_DEL_ANO, ANALOGIA, EJEMPLOS, CUAL_ES_CORRIENTE, ACTIVOS_FIJOS, POR_QUE_IMPORTAN, EFECTIVO_PRIMERO, RESUMEN],
};
