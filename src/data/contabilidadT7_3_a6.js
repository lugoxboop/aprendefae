import { BOTON, DEBE, HABER } from "./contabilidadT7_3.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · A6 DE APRENDER — «La provisión para inventarios» (Célula C).
 *
 * Fuente: el RECORTE del lote 1 de Near (entrega 3,
 * orquestador/conocimiento/paquetes/lote1-recortes-t73-v1.md), con la
 * corrección de Mello al error «provisión» (mello-recortes-v1.md: «reserva»
 * es otra cosa en contabilidad). Su opcional («Estima la pérdida…») NO se
 * aplica. Cuatro pantallas: estimar (pregunta nueva), la pérdida y el
 * resumen con los dos asientos.
 *
 * El ejemplo I-3 del libro (p. 256). C7-18: las cuentas van con los nombres
 * de la regla 8 (Gasto provisiones – inventarios, Provisión para
 * inventarios). No se muestra el saldo que queda en la provisión: el libro
 * no lo calcula.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const A6_ID = "t7-3-provision-inventarios";

export const I3_LIBRO = { provision: 520_000, perdida: 230_000 };
const C = I3_LIBRO;
const PIE = "Basado en el libro, p. 256";
const GASTO = "Gasto provisiones – inventarios";
const PROV = "Provisión para inventarios";
const INV = "Inventario de mercancías";

const ASIENTO_ESTIMAR = { fecha: null, lineas: [{ cuenta: GASTO, lado: DEBE, monto: C.provision }, { cuenta: PROV, lado: HABER, monto: C.provision }] };
const ASIENTO_PERDIDA = { fecha: null, lineas: [{ cuenta: PROV, lado: DEBE, monto: C.perdida }, { cuenta: INV, lado: HABER, monto: C.perdida }] };

const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Vas a ver qué es una provisión para inventarios y qué pasa cuando llega la pérdida.",
  boton: BOTON.empezar,
  pie: PIE,
};

const ESTIMAR = {
  id: "estimar",
  pista: "La pérdida todavía no pasó: se estima. ¿Qué cuenta carga esa estimación al periodo?",
  tipo: "eleccion",
  parrafos: ["Una empresa cree que va a perder mercancía este año. Calcula la pérdida antes de que pase: $520.000. Eso es una provisión."],
  pregunta: "Al estimarla, ¿qué cuenta va al debe?",
  opciones: [
    { id: "gasto", texto: GASTO, correcta: true },
    /* Mello: «reserva» engañaba (las reservas son del patrimonio). */
    { id: "provision", texto: PROV, devolucion: "Esa cuenta acumula lo estimado para cubrir la pérdida. El gasto del periodo va en otra cuenta." },
    { id: "inventario", texto: INV, devolucion: "Todavía no falta nada: la mercancía sigue en la bodega." },
  ],
  acierto: {
    texto: "Así es: lo estimado es un gasto del periodo.",
    porque: "Según el libro, las normas fiscales dejan que las empresas estimen pérdidas de su inventario.",
    asientos: [ASIENTO_ESTIMAR],
    pie: PIE,
  },
  error: { pie: PIE },
  pie: PIE,
};

const LA_PERDIDA = {
  id: "la-perdida",
  pista: "El gasto ya se anotó cuando se hizo la provisión. ¿Qué cuenta se usa ahora para cubrir la pérdida?",
  tipo: "eleccion",
  parrafos: ["Al cierre, el conteo muestra un faltante de $230.000: la pérdida llegó."],
  pregunta: "¿Qué cuenta va al debe?",
  opciones: [
    { id: "provision", texto: PROV, correcta: true },
    { id: "gasto", texto: GASTO, devolucion: "Ese gasto ya se anotó cuando se hizo la provisión." },
    { id: "inventario", texto: INV, devolucion: "Falta mercancía, así que Inventario de mercancías baja: no va al debe." },
  ],
  acierto: {
    texto: "Así es: la pérdida real se carga a la provisión. Baja la provisión y baja el inventario.",
    asientos: [ASIENTO_PERDIDA],
    pie: PIE,
  },
  error: { pie: PIE },
  pie: PIE,
};

const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  /* Los dos asientos, uno debajo del otro: «Estimar → gasto · Pérdida real → provisión». */
  asientos: [{ ...ASIENTO_ESTIMAR, titular: "Estimar → gasto" }, { ...ASIENTO_PERDIDA, titular: "Pérdida real → provisión" }],
  tras: [
    "Primero se estima la provisión: lo estimado es un gasto del periodo.",
    "Cuando llega la pérdida real, se carga a la provisión, y el inventario baja.",
  ],
  siguiente: "Siguiente: practica con un conteo y una provisión.",
  pie: PIE,
};

export const PIEZA_LA_PROVISION = {
  id: A6_ID,
  numero: 6,
  titulo: "La provisión para inventarios",
  /* Recorte del lote 1: los textos se ven enteros (los midió Near); el «¿Por qué?» va aparte. */
  textosEnteros: true,
  pantallas: [PORTADA, ESTIMAR, LA_PERDIDA, RESUMEN],
};
