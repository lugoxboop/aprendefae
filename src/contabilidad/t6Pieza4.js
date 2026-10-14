import { PASOS_T6_A4, CIERRE_T6_A4 } from "../data/contabilidadT6Pieza4.js";
import { crearMomentos } from "./momentos.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 4 · CAPA 2 — el castigo de marzo y, un tiempo después, la
 * deuda que vuelve y se paga (guía de Mai v1 §3). El castigo queda a la vista
 * mientras la deuda se revive: se ve que el asiento nuevo es el mismo al
 * revés. Las dos etiquetas («Primero…», «Después…») no se resaltan ni se
 * atenúan: Momentos.jsx las pinta siempre en secundario. El paso 9 resalta las dos líneas de Clientes que se compensan
 * (paso 9 corregido de Futaba); no se dibuja ningún ingreso.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Cada pieza: [momento, desde qué paso, conserva]. */
const PIEZAS = {
  fecha0: [0, 1, true], castiga: [0, 1], provision1: [0, 2, true], clientes1: [0, 3, true],
  fecha1: [1, 4, true], vuelve: [1, 4], primero: [1, 5, true], clientes2: [1, 5, true], provision2: [1, 6, true],
  despues: [1, 7, true], caja: [1, 7, true], clientes3: [1, 8, true],
};

/* La columna «Resalta» de Futaba, con el paso 9 corregido (la del paso 5 primero). */
const RESALTADO = {
  1: ["castiga"], 2: ["provision1"], 3: ["clientes1"], 4: ["vuelve"], 5: ["clientes2"], 6: ["provision2"], 7: ["caja"], 8: ["clientes3"],
  9: ["clientes2", "clientes3"],
};

export const T6_A4 = crearMomentos({
  pasos: PASOS_T6_A4,
  cierre: CIERRE_T6_A4,
  tramos: [[1, 3], [4, 9]],
  piezas: PIEZAS,
  resaltado: RESALTADO,
});
export const { PASOS, CIERRE, estadoPaso: estadoPasoT6A4, duracion: duracionPasoT6A4 } = T6_A4;
