/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 5 · PIEZA 1 · CAPA 2 — qué se ve, qué se resalta y qué se atenúa en
 * cada paso (guía de Mai v3, §4.3 y §4.4). Siete pasos y el cierre.
 *
 * El estado sale SOLO del número de paso: «Anterior» devuelve exactamente el
 * estado de ese paso, sin historia.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { PASOS_CAPA_2, CIERRE_CAPA_2 } from "../data/contabilidadT5Pieza1.js";

export const PASOS = PASOS_CAPA_2.length; // 7
export const CIERRE = PASOS + 1; // 8: el cierre, sin contador

/* Desde qué paso existe cada elemento de la escena. Antes ocupa su sitio, invisible. */
const DESDE = {
  efectivo: 1,
  ramas: 2,
  grupo: 2,
  cdt: 2,
  acciones: 2,
  participacion: 2,
  "tipo-cdt": 3,
  "rinde-cdt": 3,
  "tipo-acciones": 4,
  "rinde-acciones": 5,
  "tipo-participacion": 6,
  "rinde-participacion": 6,
  venta: 7,
};

/* Lo resaltado en cada paso. El cierre no resalta nada. */
const RESALTADO = {
  1: ["efectivo"],
  2: ["cdt", "acciones", "participacion"],
  3: ["cdt"],
  4: ["acciones"],
  5: ["rinde-acciones"], // solo la cápsula: la tarjeta queda atenuada
  6: ["participacion"],
  7: ["grupo", "venta"], // el grupo entero: las tarjetas de dentro no se atenúan
  [CIERRE]: [],
};

/* Quién va dentro de quién: lo que está dentro de algo resaltado no se atenúa. */
const DENTRO_DE = {
  "tipo-cdt": "cdt", "rinde-cdt": "cdt",
  "tipo-acciones": "acciones", "rinde-acciones": "acciones",
  "tipo-participacion": "participacion", "rinde-participacion": "participacion",
  cdt: "grupo", acciones: "grupo", participacion: "grupo",
};

export const ELEMENTOS = Object.keys(DESDE);

export function estadoPaso(paso) {
  const p = Math.min(CIERRE, Math.max(1, paso));
  const resaltados = new Set(RESALTADO[p]);
  const visible = (id) => p >= DESDE[id];
  const protegido = (id) => (id ? resaltados.has(id) || protegido(DENTRO_DE[id]) : false);
  const de = (id) => ({
    visible: visible(id),
    resaltado: resaltados.has(id),
    atenuado: resaltados.size > 0 && visible(id) && !protegido(id),
  });
  return {
    paso: p,
    cierre: p === CIERRE,
    elementos: Object.fromEntries(ELEMENTOS.map((id) => [id, de(id)])),
  };
}

/* ═══════════ TIEMPOS ═══════════ */


/* El texto que se lee en cada paso (el 8 es el cierre). */
export const textoDelPaso = (paso) => (paso >= CIERRE ? CIERRE_CAPA_2 : PASOS_CAPA_2[paso - 1]);

/** «Reproducir»: 3 000 ms + 450 ms por palabra del texto del paso, como LoQueYaPaso (loQueYaPaso.js). */
export const duracionPaso = (paso) => 3000 + 450 * textoDelPaso(paso).trim().split(/\s+/).length;
