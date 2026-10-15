import { PASOS_T6_A5, CIERRE_T6_A5 } from "../data/contabilidadT6Pieza5.js";
import { crearMomentos } from "./momentos.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 5 · CAPA 2 — la tabla del ejemplo (guía de Mai v1 §5).
 *
 * Un solo momento, el 31 de diciembre, con cinco piezas: el hecho, la tabla
 * (el rótulo fijo, una fila por grupo y la suma), las dos anotaciones y el
 * valor neto. Lo que aún no aparece ocupa su sitio, invisible. Los
 * resaltados son la columna «Resalta» de Futaba; en el paso 3, las tres
 * pastillas (el grupo 1 no tiene porcentaje escrito: Mai §5.3).
 *
 * Dos cosas propias de esta pieza (Mai §2):
 *   · el rótulo fijo nunca se atenúa;
 *   · en los pasos 2 a 8 el desplazamiento busca, además de lo resaltado, el
 *     rótulo (`tambienEnVista`); si no caben, manda lo resaltado.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Cada pieza: [momento, desde qué paso]. Un solo momento: nada se pliega. */
const PIEZAS = {
  fecha0: [0, 1], deben: [0, 1],
  tabla: [0, 2], rotulo: [0, 2], g1: [0, 2], g2: [0, 2], g3: [0, 2], g4: [0, 2],
  pct2: [0, 3], pct3: [0, 3], pct4: [0, 3],
  suma1: [0, 4], res1: [0, 4], suma2: [0, 5], res2: [0, 5], suma3: [0, 6], res3: [0, 6], suma4: [0, 7], res4: [0, 7],
  suma: [0, 8], gasto: [0, 9], provision: [0, 10], neto: [0, 11],
};

const RESALTADO = {
  1: ["deben"], 2: ["g1", "g2", "g3", "g4"], 3: ["pct2", "pct3", "pct4"],
  4: ["g1"], 5: ["g2"], 6: ["g3"], 7: ["g4"], 8: ["suma"], 9: ["gasto"], 10: ["provision"], 11: ["neto"],
};

const BASE = crearMomentos({ pasos: PASOS_T6_A5, cierre: CIERRE_T6_A5, tramos: [[1, PASOS_T6_A5.length]], piezas: PIEZAS, resaltado: RESALTADO });

/* Con la tabla a la vista (pasos 2 a 8), el rótulo también. */
export const CON_ROTULO = [2, 3, 4, 5, 6, 7, 8];

function estadoPaso(paso) {
  const e = BASE.estadoPaso(paso);
  /* En el cierre, el único momento queda abierto con todo a la vista, sin resaltar (no hay asiento que conservar). */
  const enCierre = e.cierre;
  const elementos = enCierre
    ? Object.fromEntries(Object.entries(BASE.estadoPaso(BASE.PASOS).elementos).map(([id, x]) => [id, { ...x, resaltado: false, atenuado: false }]))
    : e.elementos;
  return {
    ...e,
    abierto: enCierre ? 0 : e.abierto,
    momentos: enCierre ? [{ mostrado: true, pasado: false, atenuado: false }] : e.momentos,
    elementos: { ...elementos, rotulo: { ...elementos.rotulo, atenuado: false } },
    tambienEnVista: CON_ROTULO.includes(e.paso) ? ["rotulo"] : [],
  };
}

/*
 * El «%» nunca se separa de su número (Mai §4): un espacio que no se parte
 * (U+00A0) entre la cifra y el «%». No cambia el texto, solo dónde puede
 * partirse la línea; se aplica al pintar, en las cuatro capas.
 */
export const pegarPorcentaje = (t) => t.replace(/(\d) %/g, "$1\u00A0%");

/* La pieza para CuatroCapas, con el «%» pegado en sus términos y su nota (capa 1). */
export const conPorcentajePegado = (pieza) => ({
  ...pieza,
  objetivo: pegarPorcentaje(pieza.objetivo),
  nombres: pieza.nombres.map((n) => ({
    ...n,
    definicion: pegarPorcentaje(n.definicion),
    ...(n.delLibro ? { delLibro: pegarPorcentaje(n.delLibro) } : {}),
  })),
});

/* El paso en que aparece la tabla, y con ella el rótulo fijo (desde PIEZAS). */
const PASO_TABLA = PIEZAS.tabla[1];

export const T6_A5 = { ...BASE, estadoPaso, reservas: [BASE.PASOS, BASE.CIERRE], PASO_TABLA };
export const { PASOS, CIERRE, duracion: duracionPasoT6A5 } = T6_A5;
export const estadoPasoT6A5 = estadoPaso;
