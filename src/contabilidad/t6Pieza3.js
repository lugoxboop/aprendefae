import { PASOS_T6_A3, CIERRE_T6_A3, FUSION_T6_A3 } from "../data/contabilidadT6Pieza3.js";
import { fusionar } from "./fusionar.js";
import { crearMomentos } from "./momentos.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 3 · CAPA 2 — los tres momentos de la provisión de El Torito
 * (guía de Mai v1 §4 con el anexo v1b). Un momento pasado conserva su
 * cabecera y su asiento: la pieza vuelve atrás en los pasos 11 (el gasto de
 * diciembre) y 12 (las dos cifras de la provisión).
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Cada pieza: [momento, desde qué paso, conserva]. */
const PIEZAS = {
  fecha0: [0, 1, true], deben: [0, 1], parte: [0, 2], gasto1: [0, 3, true], provision1: [0, 4, true], utilidad: [0, 5],
  bloque: [0, 6], filaClientes: [0, 6], filaProvision: [0, 6], filaNeto: [0, 7],
  fecha1: [1, 8, true], perdida: [1, 8], provision2: [1, 9, true], clientes2: [1, 10, true], subestimada: [1, 13],
  fecha2: [2, 14, true], analisis: [2, 14], pide: [2, 15], suman: [2, 16], gasto3: [2, 17, true], provision3: [2, 18, true], queda: [2, 19],
};

/* La columna «Resalta» de Futaba, en orden de prioridad. */
const RESALTADO = {
  1: ["deben"], 2: ["parte"], 3: ["gasto1"], 4: ["provision1"], 5: ["utilidad"], 6: ["filaClientes", "filaProvision"], 7: ["filaNeto"],
  8: ["perdida"], 9: ["provision2"], 10: ["clientes2"], 11: ["gasto1"], 12: ["provision1", "provision2"], 13: ["subestimada"],
  14: ["fecha2"], 15: ["pide"], 16: ["suman"], 17: ["gasto3"], 18: ["provision3"], 19: ["queda"],
};

export const T6_A3 = crearMomentos({
  pasos: PASOS_T6_A3,
  cierre: CIERRE_T6_A3,
  tramos: [[1, 7], [8, 13], [14, 19]],
  piezas: PIEZAS,
  resaltado: RESALTADO,
});
export const { PASOS, CIERRE, estadoPaso: estadoPasoT6A3, duracion: duracionPasoT6A3 } = T6_A3;

/* La capa 2 que se ve: los 19 pasos de antes contados en 15 (hoja 7 de Mai, al ancho del sitio). La vuelta atrás del paso 11 de antes cae en el 10. */
export const T6_A3_JUNTO = fusionar({ ...FUSION_T6_A3, estadoPaso: T6_A3.estadoPaso, paso: T6_A3.paso, cierreViejo: T6_A3.CIERRE });
