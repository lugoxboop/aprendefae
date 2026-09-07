import { FAE } from "../theme.js";
import { UMBRALES } from "./alertas.js";
import { UMBRALES_DESTACADO } from "./destacados.js";

/*
 * Las bandas de desempeño de la vista por actividad.
 *
 * ═══════════ NO SON UNA ESCALA NUEVA ═══════════
 *
 * Los dos cortes ya estaban decididos en el proyecto, y se IMPORTAN de donde
 * viven en vez de copiarse:
 *
 *   alto  >= UMBRALES_DESTACADO.precisionPct   el listón de "precisión
 *                                              sostenida" en Destacados
 *   bajo  <  UMBRALES.pctEvaluativaBaja        el que dispara la alerta ámbar
 *                                              del panel, y el mismo 60 que ya
 *                                              usan cinco mecánicas para
 *                                              separar teal de coral
 *
 * Lo que compra la coherencia: un estudiante en banda baja aquí es EXACTAMENTE
 * el que tiene alerta ámbar en el panel, y uno en la alta es candidato a
 * Destacados. Tres pantallas contando lo mismo con un solo criterio, y mover
 * un umbral las mueve las tres.
 *
 * ═══════════ EL LADO SQL NO PUEDE IMPORTAR ESTO ═══════════
 *
 * panel_actividad tiene los mismos dos números escritos a mano, porque una
 * función de Postgres no puede leer un módulo de JavaScript. Esa duplicación
 * es real y es el punto por donde esto se rompería en silencio: alguien sube
 * el listón de Destacados, el panel cambia y la vista por actividad no.
 *
 * Por eso hay una prueba que lee la migración 0021 y falla si los números de
 * los dos lados dejan de coincidir. Es la única forma de tener una sola verdad
 * cuando el lenguaje impide compartirla.
 */

export const CORTE_ALTO = UMBRALES_DESTACADO.precisionPct;
export const CORTE_BAJO = UMBRALES.pctEvaluativaBaja;

/*
 * El color nunca va solo: cada banda lleva su nombre escrito, y `detalle`
 * dice el rango en números para que no haya que deducirlo del orden.
 */
export const BANDAS = [
  {
    id: "alta",
    nombre: "Alto",
    detalle: `${CORTE_ALTO}% o más`,
    color: FAE.teal,
    campo: "banda_alta",
  },
  {
    id: "media",
    nombre: "Medio",
    detalle: `${CORTE_BAJO}–${CORTE_ALTO - 1}%`,
    color: FAE.ambar,
    campo: "banda_media",
  },
  {
    id: "baja",
    nombre: "Bajo",
    detalle: `menos de ${CORTE_BAJO}%`,
    color: FAE.coral,
    campo: "banda_baja",
  },
];

/** En qué banda cae un porcentaje. Null si no hay porcentaje que clasificar. */
export function bandaDe(pct) {
  if (pct === null || pct === undefined) return null;
  const n = Number(pct);
  if (!Number.isFinite(n)) return null;
  if (n >= CORTE_ALTO) return "alta";
  if (n >= CORTE_BAJO) return "media";
  return "baja";
}
