import { PASOS_T5_A2, CIERRE_T5_A2 } from "../data/contabilidadT5Pieza2.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 5 · PIEZA 2 · CAPA 2 — qué se ve, qué se resalta y qué se atenúa en
 * cada paso (guía de Mai v2 con los 21 pasos de la v2b). El estado sale SOLO
 * del número de paso.
 *
 * Cinco hechos en fila, uno abierto a la vez (v2 §4.1): el del paso actual va
 * abierto, los anteriores plegados y los que aún no llegan no se muestran. En
 * el cierre se pliegan los cinco y nada se atenúa. Dentro del hecho abierto,
 * lo que aún no aparece ocupa su sitio, invisible.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const PASOS = PASOS_T5_A2.length; // 21
export const CIERRE = PASOS + 1; // 22

/* Los tramos de la v2 §4.1: en qué pasos va abierto cada hecho. */
export const TRAMOS = [[1, 4], [5, 7], [8, 14], [15, 17], [18, 21]];

/* Cada pieza: en qué hecho vive y desde qué paso se ve (v2 §4.2). */
const PIEZAS = {
  efectivo: [0, 1], titulos: [0, 2], inversiones1: [0, 3], bancos: [0, 3], tasa: [0, 4],
  primerInteres: [1, 5], cuenta1: [1, 6], caja1: [1, 7], ingresos1: [1, 7],
  vendidos: [2, 8], precio1: [2, 9], caja2: [2, 10], sinInteres: [2, 11], costo1: [2, 12], inversiones2: [2, 13], ganancia: [2, 14],
  quedan: [3, 15], cuenta2: [3, 16], caja3: [3, 17], ingresos2: [3, 17],
  precio2: [4, 18], recibe2: [4, 19], costo2: [4, 19], caja4: [4, 20], inversiones3: [4, 20], perdida: [4, 21],
};

/* La columna «Resalta» de Futaba. */
const RESALTADO = {
  1: ["efectivo"], 2: ["titulos"], 3: ["inversiones1", "bancos"], 4: ["tasa"],
  5: ["primerInteres"], 6: ["cuenta1"], 7: ["caja1", "ingresos1"],
  8: ["vendidos"], 9: ["precio1"], 10: ["caja2"], 11: ["sinInteres"], 12: ["costo1"], 13: ["inversiones2"], 14: ["ganancia"],
  15: ["quedan"], 16: ["cuenta2"], 17: ["caja3", "ingresos2"],
  18: ["precio2"], 19: ["recibe2", "costo2"], 20: ["caja4", "inversiones3"], 21: ["perdida"],
  [CIERRE]: [],
};

export const ELEMENTOS = Object.keys(PIEZAS);
export const hechoDe = (id) => PIEZAS[id][0];
export const tramoDe = (paso) => TRAMOS.findIndex(([a, b]) => paso >= a && paso <= b);

export function estadoPasoT5A2(paso) {
  const p = Math.min(CIERRE, Math.max(1, paso));
  const cierre = p === CIERRE;
  const abierto = cierre ? null : tramoDe(p);
  const resaltados = new Set(RESALTADO[p]);
  const hay = resaltados.size > 0;
  return {
    paso: p,
    cierre,
    abierto,
    resaltados: RESALTADO[p],
    /* Los hechos: se muestran los que ya llegaron; plegados, los anteriores al abierto (en el cierre, todos). */
    hechos: TRAMOS.map((_, i) => ({
      mostrado: cierre || i <= abierto,
      plegado: cierre || i < abierto,
      atenuado: hay,
    })),
    elementos: Object.fromEntries(ELEMENTOS.map((id) => {
      const [hecho, desde] = PIEZAS[id];
      const visible = hecho === abierto && p >= desde;
      return [id, { visible, resaltado: resaltados.has(id), atenuado: hay && visible && !resaltados.has(id) }];
    })),
  };
}

export const pasoT5A2 = (paso) => (paso >= CIERRE ? CIERRE_T5_A2 : PASOS_T5_A2[paso - 1]);

/** «Reproducir»: 3 000 ms + 450 ms por palabra, como LoQueYaPaso. */
export const duracionPasoT5A2 = (paso) => 3000 + 450 * pasoT5A2(paso).texto.trim().split(/\s+/).length;
