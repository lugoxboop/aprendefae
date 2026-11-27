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

export const PIEZAS_TEXTO_GP = [...PIEZAS_TEXTO_INTRO, ...PIEZAS_TEXTO_ENTORNO];

export const ITEMS_GP = Object.fromEntries(PIEZAS_TEXTO_GP.map((p) => [p.id, itemsDePieza(p)]));

export const REGLAS_GP = Object.fromEntries(
  PIEZAS_TEXTO_GP.map((p) => [p.id, (id) => ITEMS_GP[p.id][id] ?? null]),
);
