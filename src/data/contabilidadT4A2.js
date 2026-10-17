/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A2 DE APRENDER — «El fondo fijo» (Célula D). REDISEÑO DE ENGANCHE.
 *
 * Diseño: Hanayama, «el sobre y el libro, manejados» (celula-d/hanayama-a2-
 * rediseno.md), aprobado por Yujiro en su corte de calidad del 15 oct 2026.
 * Textos: Katsumi (celula-d/katsumi-texto-a2-a5.md), aprobados tal cual. Copia
 * en el canon: orquestador/conocimiento/paquetes/d4-t4-a2-v3-rediseno.md. Una
 * prueba compara cada texto de aquí contra ella, letra por letra.
 *
 * Ocho pantallas (la pila tenía once); en siete el estudiante mueve la
 * figura: paga y repone, abre el fondo con el cheque, paga los ocho gastos,
 * decide cuánto queda, repone, decide qué cuentas mueve el reembolso y sube o
 * baja el fondo. El libro es el tablero de H3: el mismo dibujo con el mismo
 * significado.
 *
 * Cifras del libro (pp. 181-184): el fondo, 500.000 (errata D4-1 resuelta: el
 * libro imprime «500.00»), y los ocho gastos de mayo, en su orden. Lo gastado
 * (478.100) y lo que queda (21.900) SE CALCULAN. El ±100.000 de P6 es un
 * SUPUESTO de Hanayama (el libro da los asientos sin cifras): su pie lo dice
 * («Cifras construidas»). El reembolso es del 31 de mayo (errata D4-2).
 *
 * Aprender: sin FP, sin catálogo y sin llamar al motor.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { BOTON, DEBE, HABER, pieCasoB, pieCortoB } from "./contabilidadT4.js";

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

/* P0: hasta tres gastos (los primeros de mayo) antes de reponer (Hanayama §2). */
export const PAGOS_P0 = 3;
/* P6 · SUPUESTO (Hanayama §3.5): de a 100.000, entre 400.000 y 600.000. */
export const PASO_FONDO = 100_000;
export const FONDO_MIN = FONDO - PASO_FONDO;
export const FONDO_MAX = FONDO + PASO_FONDO;
/* P3: las opciones, en el orden de Hanayama. 500.000 (el fondo entero) y 478.100 (lo gastado) son los dos errores. */
export const OPCIONES_QUEDA = [QUEDA, FONDO, GASTADO];

/* ═══════════ EL LIBRO: LAS CUENTAS DEL TABLERO ═══════════ */

/* Los nombres del libro (p. 184), en renglones fijos: a 320 «Gastos generales» no cabe en uno. */
export const CAJA_MENOR = "caja-menor";
export const BANCOS = "bancos";
export const CAJA = "caja";
export const GASTOS_GENERALES = "gastos-generales";
export const CUENTAS_A2 = {
  [CAJA_MENOR]: { id: CAJA_MENOR, renglones: ["Caja menor"] },
  [BANCOS]: { id: BANCOS, renglones: ["Bancos"] },
  [CAJA]: { id: CAJA, renglones: ["Caja"] },
  [GASTOS_GENERALES]: { id: GASTOS_GENERALES, renglones: ["Gastos", "generales"] },
};

/* El reembolso (p. 184): Gastos generales al debe y Bancos al haber. Caja menor no se mueve. */
export const REEMBOLSO_A2 = { [DEBE]: GASTOS_GENERALES, [HABER]: BANCOS };

/*
 * El error de P5, según la mitad que falla (Katsumi, «Para Baki» 3). En el
 * error solo se marca la mitad que falla, así que cada texto habla de esa mitad.
 */
export function errorReembolsoA2({ debe, haber }) {
  if (debe === CAJA_MENOR) return "debeCajaMenor";
  if (haber === CAJA_MENOR) return "haberCajaMenor";
  if (haber === BANCOS && debe !== GASTOS_GENERALES) return "debeOtra";
  if (debe === GASTOS_GENERALES && haber !== BANCOS) return "haberOtra";
  return "ambas";
}

/* ═══════════ LA FIGURA ═══════════ */

/* Rótulos y botones (Hanayama y Baki, aprobados por Katsumi). */
export const FIGURA_A2 = {
  sobre: "LO QUE TIENE ROSA",
  libro: "LO QUE DICE EL LIBRO",
  billetes: "Billetes y monedas",
  soportes: "Soportes de gastos",
  suman: "Suman",
  sumanMal: "Suman (no es el fondo)",
  fondo: "Fondo",
  sinContar: "sin contar",
  pagar: "Pagar un gasto",
  reponer: "Reponer",
  pagarSiguiente: (n, total) => `Pagar el siguiente (${n} de ${total})`,
  cheque: ["Cheque", "sale de Bancos"],
  bajar: "Bajar",
  subir: "Subir",
  comprobar: "Comprobar",
  /* El aviso de «Comprobar» con una mitad sin poner (el de H8 etapa 2, ya escrito por Katsumi; P2 de Hanayama, §4). */
  aviso: "Pon una cuenta al debe y la otra al haber.",
  /* D7 (Shibukawa): la razón visible, al lado del botón de límite apagado, y en su aria-describedby (Katsumi). */
  razonReponer: "El fondo ya está completo.",
  razonPagar: "Tope: tres gastos",
  razonSubir: "Tope: 600.000",
  razonBajar: "Mínimo: 400.000",
  /* Para el lector de pantalla: los nombres del grupo de opciones y del tablero. */
  opciones: "¿Cuánto queda en billetes?",
  tablero: "El libro",
};

/* ═══════════ LAS PANTALLAS ═══════════ */

/*
 * Una pantalla: `modo` dice qué figura y qué acción lleva; `alt`, el texto
 * alternativo de la figura (solo para el lector). `pregunta`: «Seguir» no
 * aparece hasta el acierto (regla D7). Acierto: tras «Correcto.»; error: ✗ y
 * el texto, que no nombra la respuesta.
 */
export const PANTALLAS_A2 = [
  {
    id: "el-fondo", modo: "pagar",
    /* Lote B, capa 1: abre con el sobre; el rótulo va sobre los dos botones y la definición aparece con el primer «Pagar un gasto» (Katsumi v2). */
    rotuloAccion: "Paga y repón",
    despuesConAccion: [{ texto: "Fondo fijo para gastos pequeños: al reponerlo, vuelve a su cifra." }],
    alt: "El sobre de la caja menor. Al pagar, bajan los billetes y suben los soportes de gastos, pero la suma sigue en 500.000. Al reponer, vuelven los billetes.",
    pie: "Basado en el libro, p. 181",
  },
  {
    id: "la-apertura", modo: "apertura",
    antes: ["El 1 de mayo, Sus Servicios abre el fondo de Rosa Primorosa con un cheque. Tócalo."],
    alt: "Un cheque de 500.000 sale de Bancos y llena el sobre. En el libro, Caja menor va al debe y Bancos al haber.",
    pie: "Basado en el libro, pp. 181 y 183",
  },
  {
    id: "los-gastos", modo: "gastos",
    antes: ["En mayo, Rosa paga con el fondo y guarda cada soporte: la factura o el recibo."],
    alt: "Rosa paga los ocho gastos de mayo, uno por uno. Los soportes llegan a 478.100 y los billetes quedan sin contar.",
    pie: "Basado en el libro, p. 184",
  },
  {
    id: "cuanto-queda", modo: "cuanto", pregunta: true,
    antes: ["¿Cuánto debería quedarle a Rosa en billetes?"],
    acierto: "Lo gastado más lo que queda da el fondo.",
    errores: {
      [FONDO]: "Ese es el fondo entero, como si Rosa no hubiera pagado nada.",
      [GASTADO]: "Esa es la plata que ya salió del fondo: lo gastado.",
    },
    alt: "El sobre con 478.100 en soportes. La cifra que eliges para los billetes se suma con ellos y se compara con el fondo de 500.000.",
    pie: "Basado en el libro, p. 184",
  },
  {
    id: "el-reembolso", modo: "reembolso",
    antes: ["Reponer lo gastado es el reembolso. El 31 de mayo, Rosa entrega los soportes y le hacen un cheque. Tócalo."],
    alt: "Un cheque de 478.100 sale de Bancos. El sobre vuelve a tener 500.000 en billetes y ningún soporte, y la suma no cambia.",
    pie: "Basado en el libro, pp. 182 y 184",
  },
  {
    id: "y-caja-menor", modo: "asiento", pregunta: true,
    antes: ["Los gastos de oficina van a Gastos generales. ¿Qué mueve el reembolso?"],
    acierto: "Caja menor no se mueve: el fondo sigue en $500.000.",
    errores: {
      debeCajaMenor: "Con Caja menor al debe, el fondo subiría con cada cheque.",
      haberCajaMenor: "Con Caja menor al haber, el fondo bajaría con cada gasto.",
      debeOtra: "No le entra plata a Caja: ¿en qué se gastó?",
      haberOtra: "Fíjate de dónde sale la plata de un cheque.",
      ambas: "¿En qué se gastó? ¿Quién paga el cheque?",
    },
    alt: "El libro con cuatro cuentas, cada una con debe y haber. El cheque del reembolso, de 478.100, se pone en un debe y en un haber.",
    pie: "Basado en el libro, pp. 182 y 184",
  },
  {
    id: "subir-bajar", modo: "subir-bajar",
    antes: ["Fondo corto: se sube. Plata quieta: se baja."],
    /* Lote B, capa 4: la frase de cierre, debajo del libro, con el primer «Subir» o «Bajar». */
    cierre: "Reponerlo no mueve Caja menor.",
    siguiente: "Siguiente: «El arqueo».",
    alt: "El fondo sube o baja de a 100.000. Al subir, Caja menor va al debe y Bancos al haber. Al bajar, Caja va al debe y Caja menor al haber.",
    pie: "Basado en el libro, p. 182. Cifras construidas",
  },
];

/*
 * D8 · el caso B (Katsumi, lote nocturno): Marta Gil, junio. El fondo de
 * 600.000 se abre el 1 y se repone el 30; los mismos ocho gastos, en el mismo
 * orden, con otras cifras construidas (524.300; quedan 75.700). Se sube o se
 * baja de a 100.000, entre 500.000 y 700.000. La misma decisión en cada
 * pantalla; los textos alternativos, con las cifras y el nombre del B; los
 * pies, con « · Cifras construidas».
 */
export const FONDO_B = 600_000;
export const GASTOS_JUNIO_B = GASTOS_MAYO.map((g, i) => ({ ...g, valor: [41_000, 27_500, 36_200, 58_900, 121_600, 45_300, 39_800, 154_000][i] }));
const GASTADO_B = GASTOS_JUNIO_B.reduce((s, g) => s + g.valor, 0);
const datosA2 = (fondo, gastos, f) => {
  const gastado = gastos.reduce((s, g) => s + g.valor, 0);
  return {
    FONDO: fondo, GASTOS_MAYO: gastos, GASTADO: gastado, QUEDA: fondo - gastado,
    FONDO_MIN: fondo - PASO_FONDO, FONDO_MAX: fondo + PASO_FONDO, OPCIONES_QUEDA: [fondo - gastado, fondo, gastado],
    F: f, sumaGastos: (n) => gastos.slice(0, n).reduce((s, g) => s + g.valor, 0),
  };
};
/* Lo que la figura muestra en cada caso (A3 usa el fondo y lo gastado del mismo caso). */
export const DATOS_A2 = {
  1: datosA2(FONDO, GASTOS_MAYO, FIGURA_A2),
  2: datosA2(FONDO_B, GASTOS_JUNIO_B, { ...FIGURA_A2, sobre: "LO QUE TIENE MARTA", razonSubir: "Tope: 700.000", razonBajar: "Mínimo: 500.000" }),
};
const TEXTOS_A2_B = {
  "el-fondo": { alt: "El sobre de la caja menor. Al pagar, bajan los billetes y suben los soportes de gastos, pero la suma sigue en 600.000. Al reponer, vuelven los billetes." },
  "la-apertura": { antes: ["El 1 de junio, Taller Ríos abre el fondo de Marta Gil con un cheque. Tócalo."], alt: "Un cheque de 600.000 sale de Bancos y llena el sobre. En el libro, Caja menor va al debe y Bancos al haber." },
  "los-gastos": { antes: ["En junio, Marta paga con el fondo y guarda cada soporte: la factura o el recibo."], alt: "Marta paga los ocho gastos de junio, uno por uno. Los soportes llegan a 524.300 y los billetes quedan sin contar." },
  "cuanto-queda": {
    antes: ["¿Cuánto debería quedarle a Marta en billetes?"],
    errores: { [FONDO_B]: "Ese es el fondo entero, como si Marta no hubiera pagado nada.", [GASTADO_B]: "Esa es la plata que ya salió del fondo: lo gastado." },
    alt: "El sobre con 524.300 en soportes. La cifra que eliges para los billetes se suma con ellos y se compara con el fondo de 600.000.",
  },
  "el-reembolso": { antes: ["Reponer lo gastado es el reembolso. El 30 de junio, Marta entrega los soportes y le hacen un cheque. Tócalo."], alt: "Un cheque de 524.300 sale de Bancos. El sobre vuelve a tener 600.000 en billetes y ningún soporte, y la suma no cambia." },
  "y-caja-menor": { acierto: "Caja menor no se mueve: el fondo sigue en $600.000.", alt: "El libro con cuatro cuentas, cada una con debe y haber. El cheque del reembolso, de 524.300, se pone en un debe y en un haber." },
};
const PANTALLAS_A2_B = PANTALLAS_A2.map((p) => ({ ...p, ...(TEXTOS_A2_B[p.id] ?? {}), pie: pieCasoB(p.pie) }));
/* D8: el pie corto del caso B donde el largo pasaba de 60 palabras (sonda; Katsumi). */
for (const p of PANTALLAS_A2_B) if (["la-apertura", "cuanto-queda", "y-caja-menor"].includes(p.id)) p.pie = pieCortoB(p.pie);

export const PIEZA_EL_FONDO_FIJO = {
  id: A2_ID,
  numero: 2,
  titulo: "El fondo fijo",
  /* D2 (Shibukawa; Yujiro): el objetivo de la pieza, una línea fija bajo el título en la P0 (Katsumi). */
  objetivo: "Pagar, reponer y ajustar la caja menor.",
  boton: BOTON.seguir,
  pantallas: PANTALLAS_A2,
};
PIEZA_EL_FONDO_FIJO.casoB = { ...PIEZA_EL_FONDO_FIJO, pantallas: PANTALLAS_A2_B };
