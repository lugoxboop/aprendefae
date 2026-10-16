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
    antes: ["La caja menor de Rosa es un fondo para gastos pequeños. Es fijo: al reponerlo, vuelve a la misma cifra. Paga y repón."],
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
      debeCajaMenor: "Si Caja menor fuera al debe, el fondo subiría con cada cheque.",
      haberCajaMenor: "Si Caja menor fuera al haber, el fondo bajaría con cada gasto.",
      debeOtra: "A Caja no le entra plata. Piensa en qué se fue lo gastado.",
      haberOtra: "Fíjate de dónde sale la plata de un cheque.",
      ambas: "Piensa en qué se fue la plata y de dónde sale el cheque.",
    },
    alt: "El libro con cuatro cuentas, cada una con debe y haber. El cheque del reembolso, de 478.100, se pone en un debe y en un haber.",
    pie: "Basado en el libro, pp. 182 y 184",
  },
  {
    id: "subir-bajar", modo: "subir-bajar",
    antes: ["Si el fondo no alcanza, se sube; si la plata se queda quieta, se baja."],
    alt: "El fondo sube o baja de a 100.000. Al subir, Caja menor va al debe y Bancos al haber. Al bajar, Caja va al debe y Caja menor al haber.",
    pie: "Basado en el libro, p. 182. Cifras construidas",
  },
  {
    id: "resumen", modo: "quieta",
    resumen: [
      "Se abre con un cheque: Caja menor sube y Bancos baja.",
      "El reembolso sube Gastos generales y baja Bancos.",
      "Caja menor solo se mueve al abrir, subir, bajar o cerrar el fondo.",
    ],
    siguiente: "Siguiente: «El arqueo».",
    alt: "El sobre de Rosa con 500.000 en billetes.",
    pie: "Basado en el libro, pp. 181-184",
  },
];

export const PIEZA_EL_FONDO_FIJO = {
  id: A2_ID,
  numero: 2,
  titulo: "El fondo fijo",
  boton: BOTON.seguir,
  pantallas: PANTALLAS_A2,
};
