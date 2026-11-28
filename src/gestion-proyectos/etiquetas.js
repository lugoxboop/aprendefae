/*
 * GESTIÓN DE PROYECTOS · cómo nombra el panel docente cada ítem de las Hacer.
 *
 * src/docente/etiquetasItem.js las suma a sus REGLAS. Salen del MISMO recorrido
 * de los textos que usa la partida (itemsDePieza, comun/preparar.js): un ítem
 * que la pieza puede mandar en su `detalle` tiene aquí su enunciado.
 */
import { itemsDePieza } from "./comun/preparar.js";
import { PIEZAS_TEXTO_INTRO } from "./fundamentos/textos-c1.js";
import { PIEZAS_TEXTO_ENTORNO } from "./fundamentos/textos-c2.js";
import { PIEZAS_TEXTO_C3 } from "./fundamentos/textos-c3.js";
import { PIEZAS_TEXTO_C4 } from "./integracion/textos-c4.js";
import { PIEZAS_TEXTO_C5 } from "./alcance/textos-c5.js";
import { PIEZAS_TEXTO_C6 } from "./cronograma/textos-c6.js";
import { PIEZAS_TEXTO_C7 } from "./costos/textos-c7.js";
import { PIEZAS_TEXTO_C8 } from "./calidad/textos-c8.js";

/* Lote 1 (caps. 1-2), lote 2 (caps. 3-4), lote 3 (caps. 5-6) y lote 4 (caps. 7-8), en el orden de los diseños. */
export const PIEZAS_TEXTO_GP = [...PIEZAS_TEXTO_INTRO, ...PIEZAS_TEXTO_ENTORNO, ...PIEZAS_TEXTO_C3, ...PIEZAS_TEXTO_C4, ...PIEZAS_TEXTO_C5, ...PIEZAS_TEXTO_C6, ...PIEZAS_TEXTO_C7, ...PIEZAS_TEXTO_C8];

export const ITEMS_GP = Object.fromEntries(PIEZAS_TEXTO_GP.map((p) => [p.id, itemsDePieza(p)]));

export const REGLAS_GP = Object.fromEntries(
  PIEZAS_TEXTO_GP.map((p) => [p.id, (id) => ITEMS_GP[p.id][id] ?? null]),
);
