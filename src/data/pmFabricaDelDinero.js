import { DATOS_VERIFICADOS, ROTULO_SIMULADO } from "./politicaMonetaria.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * POLÍTICA MONETARIA · «LA FÁBRICA DEL DINERO» (Célula B; encargo de Erwin).
 *
 *   la-fabrica-del-dinero     pieza de Aprender (cero FP)
 *   crea-o-cambia-de-manos    ¿Crea o Cambia de Manos?   Aplicación · medio   · 25 FP
 *   la-escalera-del-encaje    La Escalera del Encaje     Análisis   · difícil · 50 FP
 *
 * EL TEXTO ES DE FUTABA (auditado por Shoko). Lo que todavía no llegó lleva
 * el marcador PENDIENTE, y una prueba hace fallar la suite mientras quede
 * uno: ningún marcador puede llegar a un estudiante.
 *
 * Lo que sí está escrito aquí sale del encargo, literal: la frase ancla, el
 * ejemplo de Juan (100, 10, 90, 81…) y las definiciones YA PUBLICADAS en el
 * tema (politicaMonetaria.js), que no se redefinen distinto.
 *
 * ═══════════ LAS CIFRAS ═══════════
 *
 * Las únicas reales son las de DATOS_VERIFICADOS. Las del ejemplo de Juan y
 * las de la escalera del juego son un escenario simulado y se pintan con su
 * rótulo «Escenario simulado». Sin signo de porcentaje (decisión de Sakuta:
 * «guarda 10 de cada 100»): la prueba de la pieza rechaza cualquier «%» fuera
 * del bloque verificado. Ninguna tasa de encaje real de Colombia.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export { DATOS_VERIFICADOS, ROTULO_SIMULADO };

/* El marcador de lo que falta. Una prueba lo busca en todo este archivo. */
export const PENDIENTE = "PENDIENTE: Futaba";

/* La frase ancla del encargo, literal. */
export const FRASE_ANCLA = "El Banco imprime, los bancos multiplican, el encaje frena.";

/* ═══════════ LA ESCALERA: LA REGLA QUE ENSEÑA LA PIEZA ═══════════ */

/*
 * La escalera de la creación secundaria, vuelta por vuelta. `deposito` es lo
 * que entra en la primera vuelta; `encaje`, cuánto guarda el banco de cada
 * 100 (escenario simulado, sin «%»). Cada vuelta: el banco guarda su parte,
 * presta el resto, y eso prestado vuelve a depositarse en la vuelta siguiente.
 * El total en depósitos es la suma de todo lo depositado hasta esa vuelta.
 *
 * Con cifras enteras mientras el encaje divida exacto; si no, con decimales
 * exactos de la cuenta (no se redondea: las casillas comparan contra esto).
 */
export function escaleraDe(deposito, encaje, vueltas) {
  const filas = [];
  let entra = deposito;
  let total = 0;
  for (let k = 1; k <= vueltas; k++) {
    const guarda = (entra * encaje) / 100;
    const presta = entra - guarda;
    total += entra;
    filas.push({ vuelta: k, deposita: entra, guarda, presta, total });
    entra = presta;
  }
  return filas;
}

/* El total al que se acerca la escalera si diera vueltas sin fin (no se pinta: lo deduce el estudiante). */
export const techoDe = (deposito, encaje) => (deposito * 100) / encaje;

/* ═══════════ LA PIEZA DE APRENDER ═══════════ */

/* Los 14 ids de la escena (decisión de Sakuta). Futaba los usa en `resaltar`, Mai los dibuja. */
export const IDS_ESCENA = [
  "banco-republica", "gobierno", "tes", "dolares", "pesos-nuevos", "banco-privado",
  "juan", "banco-a", "ana", "pedro", "banco-b", "banco-c", "encaje", "escalera",
];

/* El ejemplo de Juan, del encargo: deposita 100 y cada banco guarda 10 de cada 100. */
export const EJEMPLO_JUAN = { deposito: 100, encaje: 10, vueltas: 3 };

export const APRENDER_FABRICA = {
  id: "la-fabrica-del-dinero",
  titulo: "La Fábrica del Dinero",
  nombres: [
    /* Ya publicados en el tema: se citan, no se redefinen (politicaMonetaria.js). */
    { termino: "Banco de la República", definicion: "el banco central de Colombia. Es independiente del gobierno — el presidente no le da órdenes." },
    { termino: "Operaciones de Mercado Abierto (OMA)", definicion: "el Banco compra o vende títulos a los bancos. Comprar les mete plata; vender se las quita." },
    { termino: "Encaje bancario", definicion: "el porcentaje de los depósitos que cada banco está obligado a guardar y no puede prestar." },
    /* Nuevos: los escribe Futaba. */
    { termino: "Creación primaria de dinero", definicion: PENDIENTE },
    { termino: "Creación secundaria de dinero", definicion: PENDIENTE },
    { termino: "TES", definicion: PENDIENTE },
  ],
  /* Los cuatro momentos del encargo, en su orden. Los `resaltar` son provisionales hasta la entrega de Futaba. */
  pasos: [
    { resaltar: ["banco-republica", "tes", "dolares", "pesos-nuevos"], texto: PENDIENTE },
    { resaltar: ["juan", "banco-a", "encaje", "escalera"], texto: PENDIENTE },
    { resaltar: ["ana", "pedro", "banco-b", "escalera"], texto: PENDIENTE },
    { resaltar: ["banco-c", "escalera"], texto: PENDIENTE },
    { resaltar: ["gobierno", "tes", "banco-privado"], texto: PENDIENTE },
    { resaltar: ["banco-republica", "tes", "pesos-nuevos"], texto: PENDIENTE },
    { resaltar: ["encaje", "escalera"], texto: PENDIENTE },
  ],
  pregunta: PENDIENTE,
  respuesta: PENDIENTE,
};

/* La exploración de la capa 3: cuánto guarda cada banco de cada 100 (escenario simulado). */
export const EXPLORA_ENCAJES = [5, 10, 20];
export const EXPLORA_VUELTAS = 6;

/* ═══════════ JUEGO A · ¿CREA O CAMBIA DE MANOS? ═══════════ */

export const CREA_O_CAMBIA = {
  id: "crea-o-cambia-de-manos",
  nombre: "¿Crea o Cambia de Manos?",
  regla: PENDIENTE,
  consigna: PENDIENTE,
  cierre: PENDIENTE,
};

export const PASOS_CREA_O_CAMBIA = [PENDIENTE, PENDIENTE];

export const CREA = "crea";
export const CAMBIA = "cambia";
export const SACA = "saca";

/* Las tres, en este orden fijo (encargo). */
export const OPCIONES_CREA_O_CAMBIA = [
  { id: CREA, nombre: "Crea dinero" },
  { id: CAMBIA, nombre: "Solo cambia de manos" },
  { id: SACA, nombre: "Saca dinero" },
];

/*
 * El banco de hechos. La respuesta de los marcados sale del encargo (el Banco
 * crea cuando COMPRA y paga con pesos nuevos; un banco privado que compra un
 * TES solo hace que la plata cambie de manos; vender TES o dólares saca
 * dinero). `vende: true` marca los hechos del ERROR CASTIGADO: quien elige
 * «Crea dinero» ahí recibe su devolución propia. El resto del banco y todos
 * los textos los escribe Futaba (de 10 a 12 hechos).
 */
export const HECHOS_CREA_O_CAMBIA = [
  { id: "br-compra-tes", texto: PENDIENTE, respuesta: CREA, acierto: PENDIENTE },
  { id: "br-compra-dolares", texto: PENDIENTE, respuesta: CREA, acierto: PENDIENTE },
  { id: "privado-compra-tes", texto: PENDIENTE, respuesta: CAMBIA, acierto: PENDIENTE },
  { id: "br-vende-tes", texto: PENDIENTE, respuesta: SACA, vende: true, acierto: PENDIENTE },
  { id: "br-vende-dolares", texto: PENDIENTE, respuesta: SACA, vende: true, acierto: PENDIENTE },
];

/*
 * Los errores por tipo. VENDE es el castigado y manda sobre el resto. Las
 * demás llaves son «respuesta>elegida»: una por cada fallo posible, para que
 * todo fallo tenga texto (una prueba recorre las seis).
 */
export const ERRORES_CREA_O_CAMBIA = {
  VENDE: PENDIENTE,
  "crea>cambia": PENDIENTE,
  "crea>saca": PENDIENTE,
  "cambia>crea": PENDIENTE,
  "cambia>saca": PENDIENTE,
  "saca>crea": PENDIENTE,
  "saca>cambia": PENDIENTE,
};

export function tipoDeErrorCreaOCambia(hecho, elegida) {
  if (elegida === hecho.respuesta) return null;
  if (hecho.vende && elegida === CREA) return "VENDE";
  return `${hecho.respuesta}>${elegida}`;
}

export function retroCreaOCambia(hecho, elegida) {
  if (elegida === hecho.respuesta) return `✅ ${hecho.acierto}`;
  return `❌ ${ERRORES_CREA_O_CAMBIA[tipoDeErrorCreaOCambia(hecho, elegida)]}`;
}

/* El ejemplo del tutorial, fuera del banco. */
export const EJEMPLO_CREA_O_CAMBIA = { id: "ejemplo-crea-o-cambia", texto: PENDIENTE, respuesta: CREA, acierto: PENDIENTE };
export const ALT_TUTORIAL_CREA_O_CAMBIA = PENDIENTE;

/* ═══════════ JUEGO B · LA ESCALERA DEL ENCAJE ═══════════ */

export const ESCALERA = {
  id: "la-escalera-del-encaje",
  nombre: "La Escalera del Encaje",
  regla: PENDIENTE,
  consigna: PENDIENTE,
  cierre: PENDIENTE,
};

export const PASOS_ESCALERA = [PENDIENTE, PENDIENTE, PENDIENTE];

/*
 * El escenario simulado del juego. PROVISIONAL hasta Futaba: depósito de
 * 1.000 y dos encajes (10 y 20 de cada 100), tres vueltas; con esos números
 * todas las casillas son enteras. Si Futaba manda otros, solo cambian estos
 * datos: las casillas y sus opciones salen de escaleraDe.
 */
export const ESCENARIO_ESCALERA = { deposito: 1000, encajes: [10, 20], vueltas: 3 };

/* Las tres casillas de cada vuelta, en este orden. */
export const CASILLAS = [
  { id: "guarda", nombre: "Lo que guarda el banco" },
  { id: "presta", nombre: "Lo que presta" },
  { id: "total", nombre: "Total en depósitos" },
];

/*
 * Las opciones de cada casilla: la correcta y una por cada error típico.
 *   guarda  · CONFUNDE: lo que presta      · ORIGEN: lo que guardó en la vuelta 1
 *   presta  · CONFUNDE: lo que guarda      · ORIGEN: lo que prestó en la vuelta 1
 *   total   · NO_SUMA: solo lo depositado  · ORIGEN: total anterior + depósito de la vuelta 1
 * En la vuelta 1 dos errores coinciden con la correcta y se reemplazan: ORIGEN
 * por DOBLE (el doble de lo correcto) y, en el total, NO_SUMA por ADELANTA (lo
 * depositado más lo prestado, como si el préstamo ya hubiera vuelto). Sin
 * repetir: una prueba lo vigila.
 */
export function opcionesDeCasilla(filas, k, casilla) {
  const f = filas[k];
  const f1 = filas[0];
  const antes = k > 0 ? filas[k - 1].total : 0;
  const correcta = f[casilla];
  const errores = {
    guarda: { CONFUNDE: f.presta, ORIGEN: k > 0 ? f1.guarda : correcta * 2 },
    presta: { CONFUNDE: f.guarda, ORIGEN: k > 0 ? f1.presta : correcta * 2 },
    total: { NO_SUMA: k > 0 ? f.deposita : f.deposita + f.presta, ORIGEN: k > 0 ? antes + f1.deposita : correcta * 2 },
  }[casilla];
  const enLaPrimera = { ORIGEN: "DOBLE", NO_SUMA: "ADELANTA" };
  const tipos = Object.fromEntries(Object.keys(errores).map((t) => [t, k === 0 ? (enLaPrimera[t] ?? t) : t]));
  return [
    { valor: correcta, tipo: null },
    ...Object.entries(errores).map(([t, v]) => ({ valor: v, tipo: tipos[t] })),
  ];
}

/* Las devoluciones por tipo de error de las casillas, y la de acierto. */
export const ERRORES_ESCALERA = {
  CONFUNDE: PENDIENTE,
  ORIGEN: PENDIENTE,
  DOBLE: PENDIENTE,
  NO_SUMA: PENDIENTE,
  ADELANTA: PENDIENTE,
};
export const ACIERTO_CASILLA = PENDIENTE;

/* La comparación final: las dos escaleras, y qué pasa si el Banco sube o baja el encaje. */
export const ALARGA = "alarga";
export const ACORTA = "acorta";
export const IGUAL = "igual";
export const OPCIONES_COMPARA = [
  { id: ACORTA, nombre: PENDIENTE },
  { id: ALARGA, nombre: PENDIENTE },
  { id: IGUAL, nombre: PENDIENTE },
];
export const PREGUNTAS_COMPARA = [
  { id: "sube", texto: PENDIENTE, respuesta: ACORTA, acierto: PENDIENTE },
  { id: "baja", texto: PENDIENTE, respuesta: ALARGA, acierto: PENDIENTE },
];
/* Al revés (eligió alargar cuando acorta, o al contrario) o «igual». */
export const ERRORES_COMPARA = { REVES: PENDIENTE, IGUAL: PENDIENTE };
export const tipoDeErrorCompara = (p, elegida) => (elegida === p.respuesta ? null : elegida === IGUAL ? "IGUAL" : "REVES");

/* El ejemplo del tutorial: la primera vuelta del ejemplo de Juan, ya resuelta. */
export const EJEMPLO_ESCALERA = { deposito: EJEMPLO_JUAN.deposito, encaje: EJEMPLO_JUAN.encaje, vueltas: 1 };
export const ALT_TUTORIAL_ESCALERA = PENDIENTE;

/* ═══════════ PARA EL PANEL DOCENTE (lo registra Erwin en etiquetasItem.js) ═══════════ */

export const hechoDeItemCreaOCambia = (id) => HECHOS_CREA_O_CAMBIA.find((h) => h.id === id)?.texto ?? null;
export function casillaDeItemEscalera(id) {
  const [a, b] = String(id).split(":");
  if (a === "compara") return PREGUNTAS_COMPARA.find((p) => p.id === b)?.texto ?? null;
  const c = CASILLAS.find((x) => x.id === b);
  return c && /^\d+$/.test(a) ? `Vuelta ${a} · ${c.nombre}` : null;
}

/* ═══════════ «ASÍ SE JUEGA» (Erwin lo suma al registro de asiSeJuega.js) ═══════════ */

/* El componente antepone «Ejemplo: »; así se lee el alternativo, textual (como asiSeJuegaMonetaria.js). */
const sinPrefijo = (alt) => alt.replace(/^Ejemplo: /, "");

export const ASI_SE_JUEGA_FABRICA = {
  [CREA_O_CAMBIA.id]: {
    actividadId: CREA_O_CAMBIA.id,
    titulo: CREA_O_CAMBIA.nombre,
    consigna: CREA_O_CAMBIA.consigna,
    pasos: PASOS_CREA_O_CAMBIA,
    alt: sinPrefijo(ALT_TUTORIAL_CREA_O_CAMBIA),
    demo: { items: [EJEMPLO_CREA_O_CAMBIA] },
    guion: {
      duracion: 7000,
      toques: [
        { ms: 1500, en: "[data-hecho]", senala: true },
        { ms: 3500, texto: "Crea dinero" },
      ],
    },
    cuadros: { gesto: 1 },
  },
  [ESCALERA.id]: {
    actividadId: ESCALERA.id,
    titulo: ESCALERA.nombre,
    consigna: ESCALERA.consigna,
    pasos: PASOS_ESCALERA,
    alt: sinPrefijo(ALT_TUTORIAL_ESCALERA),
    demo: { items: [EJEMPLO_ESCALERA] },
    /* La primera vuelta del ejemplo de Juan: guarda 10, presta 90, total 100. */
    guion: {
      duracion: 9000,
      toques: [
        { ms: 1500, texto: "10" },
        { ms: 4000, texto: "90" },
        { ms: 6500, texto: "100" },
      ],
    },
    cuadros: { gesto: 1 },
  },
};
