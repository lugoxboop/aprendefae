import { PASOS_T6, CIERRE_T6 } from "../data/contabilidadT6Pieza1.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 1 · CAPA 2 — qué se ve, qué se resalta y qué se atenúa en
 * cada paso. Guía v2 de Mai con la secuencia final de Futaba (9 pasos y el
 * cierre). El estado sale SOLO del número de paso.
 *
 * ⚠️ PROVISIONAL HASTA LA GUÍA v3: la v2 tiene 8 pasos y la secuencia de
 * Futaba 9 (el paso 1 se partió en dos). Aquí los pasos 1 y 2 aparecen y
 * resaltan lo mismo que el paso 1 de la v2 (el hecho de la venta del día 10);
 * del 3 en adelante, cada paso es el de la v2 corrido en uno.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const PASOS = PASOS_T6.length; // 9
export const CIERRE = PASOS + 1; // 10

/* Desde qué paso existe cada pieza. Antes ocupa su sitio, invisible. */
const DESDE = {
  perspectiva: 1,
  dia10: 1, fecha10: 1, hecho10: 1,
  plazo: 3,
  ingresos10: 4,
  clientes10: 5,
  dia25: 6, fecha25: 6, hecho25: 6,
  caja25: 7,
  clientes25: 8,
};

const RESALTADO = {
  1: ["hecho10"], // provisional (v3)
  2: ["hecho10"], // provisional (v3)
  3: ["plazo"],
  4: ["ingresos10"],
  5: ["clientes10"],
  6: ["hecho25"],
  7: ["caja25"],
  8: ["clientes25"],
  /* Guía v2 §A: nada nuevo; el ingreso del 10 y el recuadro del 25 entero. */
  9: ["ingresos10", "dia25"],
  [CIERRE]: [],
};

/* Quién va dentro de quién: lo de dentro de algo resaltado no se atenúa. */
const DENTRO_DE = {
  fecha10: "dia10", hecho10: "dia10", plazo: "dia10", ingresos10: "dia10", clientes10: "dia10",
  fecha25: "dia25", hecho25: "dia25", caja25: "dia25", clientes25: "dia25",
};

export const ELEMENTOS = Object.keys(DESDE);

export function estadoPasoT6(paso) {
  const p = Math.min(CIERRE, Math.max(1, paso));
  const resaltados = new Set(RESALTADO[p]);
  const visible = (id) => p >= DESDE[id];
  const protegido = (id) => (id ? resaltados.has(id) || protegido(DENTRO_DE[id]) : false);
  return {
    paso: p,
    cierre: p === CIERRE,
    /* En el orden de RESALTADO: con dos, manda el primero si no caben juntos (guía v2 §D). */
    resaltados: RESALTADO[p],
    elementos: Object.fromEntries(ELEMENTOS.map((id) => [id, {
      visible: visible(id),
      resaltado: resaltados.has(id),
      atenuado: resaltados.size > 0 && visible(id) && !protegido(id),
    }])),
  };
}

/* El texto y el pie de cada paso; el 10 es el cierre. */
export const pasoT6 = (paso) => (paso >= CIERRE ? CIERRE_T6 : PASOS_T6[paso - 1]);

/** «Reproducir»: 3 000 ms + 450 ms por palabra, como LoQueYaPaso (loQueYaPaso.js). */
export const duracionPasoT6 = (paso) => 3000 + 450 * pasoT6(paso).texto.trim().split(/\s+/).length;
