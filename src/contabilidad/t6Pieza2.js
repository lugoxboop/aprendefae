import { PASOS_T6_A2, CIERRE_T6_A2 } from "../data/contabilidadT6Pieza2.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 2 · CAPA 2 — qué se ve, qué se resalta y qué se atenúa en
 * cada paso (guía de Mai v1 con su cierre v1b, PASA de Shoko). El estado sale
 * SOLO del número de paso, como en la pieza 1 (t6Pieza1.js).
 *
 * La fecha del castigo se puede resaltar (paso 10) y, como la de la venta,
 * nunca se atenúa. En el paso 10 el orden de RESALTADO es la
 * prioridad de la v1b: primero el gasto, después la fecha; si no caben juntos
 * sobre el bloque pegado, la página se mueve para ver el gasto entero.
 * Sin la regla «lo de dentro de algo resaltado» de la pieza 1: aquí nada
 * resaltado tiene dentro algo visible (el monto aparece después de la venta).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const PASOS = PASOS_T6_A2.length; // 10
export const CIERRE = PASOS + 1; // 11

/* Desde qué paso existe cada pieza. Antes ocupa su sitio, invisible. */
const DESDE = {
  dia25: 1, fecha25: 1, hecho25: 1,
  monto25: 2,
  clientes25: 3, ingresos25: 3,
  dia31: 4, fecha31: 4, hecho31: 4,
  nancy: 5,
  factura: 6,
  metodo: 7,
  gasto: 8,
  clientes31: 9,
};

/* La columna «Resalta» de Futaba. */
const RESALTADO = {
  1: ["hecho25"],
  2: ["monto25"],
  3: ["clientes25", "ingresos25"],
  4: ["hecho31"],
  5: ["nancy"],
  6: ["factura"],
  7: ["metodo"],
  8: ["gasto"],
  9: ["clientes31"],
  10: ["gasto", "fecha31"],
  [CIERRE]: [],
};

/* Las fechas nunca se atenúan (guía v1 §4.1). */
const NUNCA_ATENUADO = new Set(["fecha25", "fecha31"]);

export const ELEMENTOS = Object.keys(DESDE);

export function estadoPasoT6A2(paso) {
  const p = Math.min(CIERRE, Math.max(1, paso));
  const resaltados = new Set(RESALTADO[p]);
  const visible = (id) => p >= DESDE[id];
  return {
    paso: p,
    cierre: p === CIERRE,
    resaltados: RESALTADO[p],
    elementos: Object.fromEntries(ELEMENTOS.map((id) => [id, {
      visible: visible(id),
      resaltado: resaltados.has(id),
      atenuado: resaltados.size > 0 && visible(id) && !resaltados.has(id) && !NUNCA_ATENUADO.has(id),
    }])),
  };
}

export const pasoT6A2 = (paso) => (paso >= CIERRE ? CIERRE_T6_A2 : PASOS_T6_A2[paso - 1]);

/** «Reproducir»: 3 000 ms + 450 ms por palabra, como LoQueYaPaso. */
export const duracionPasoT6A2 = (paso) => 3000 + 450 * pasoT6A2(paso).texto.trim().split(/\s+/).length;
