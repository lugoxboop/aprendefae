/*
 * Las piezas de la Célula C que mide la barra de enganche (B1 y B2): las de
 * Aprender de T7-1, T7-2 y T7-3 y la de la célula en T5 (las que traen su
 * propio componente), y los Hacer de esas vistas (en T5, N1, N3 y N4). Las
 * listas salen de las vistas mismas: lo que se publica es lo que se mide.
 */
import { PIEZAS_T7_1, JUEGOS_T7_1 } from "../components/ContabilidadT7_1View.jsx";
import { PIEZAS_T7_2, JUEGOS_T7_2 } from "../components/ContabilidadT7_2View.jsx";
import { PIEZAS_T7_3, JUEGOS_T7_3 } from "../components/ContabilidadT7_3View.jsx";
import { PIEZAS as PIEZAS_T5, JUEGOS as JUEGOS_T5 } from "../components/ContabilidadTema5View.jsx";
import { N1_ID } from "../data/contabilidadT5_n1.js";
import { N3_ID } from "../data/contabilidadT5_n3.js";
import { N4_ID } from "../data/contabilidadT5_n4.js";

const HACER_C_T5 = new Set([N1_ID, N3_ID, N4_ID]);

export const APRENDER_CANON = [
  ...PIEZAS_T7_1.map((p) => ({ tema: "T7-1", ...p })),
  ...PIEZAS_T7_2.map((p) => ({ tema: "T7-2", ...p })),
  ...PIEZAS_T7_3.map((p) => ({ tema: "T7-3", ...p })),
  ...PIEZAS_T5.filter((p) => p.Pieza).map((p) => ({ tema: "T5", ...p })),
];

export const HACER_CANON = [
  ...JUEGOS_T7_1.map((j) => ({ tema: "T7-1", ...j })),
  ...JUEGOS_T7_2.map((j) => ({ tema: "T7-2", ...j })),
  ...JUEGOS_T7_3.map((j) => ({ tema: "T7-3", ...j })),
  ...JUEGOS_T5.filter((j) => HACER_C_T5.has(j.id)).map((j) => ({ tema: "T5", ...j })),
];
