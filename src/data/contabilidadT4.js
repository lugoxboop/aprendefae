/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · DATOS DEL TEMA — «Efectivo, caja menor y bancos» (Célula D).
 *
 * ANDAMIO. Aquí entra la pieza A1 de Aprender, «la caja» (§5.1, pp. 179-180),
 * con la forma de las piezas de T7: { id, numero, titulo, pantallas }. Todavía
 * no hay texto aprobado, así que no hay pantallas ni título de pieza: el
 * título lo pone quien escribe, no quien construye. Lo único que se fija ya
 * es el id, que es del corte de Yujiro, y el subtítulo del libro donde
 * empieza la sección, copiado de la p. 179.
 *
 * Ni este archivo ni la pieza llaman al motor de FP: Aprender no da FP.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const A1_ID = "t4-a1-la-caja";

/* El subtítulo con que abre §5.1 en la p. 179, tal como lo imprime el libro. */
export const SECCION_DEL_LIBRO = { numero: "5.1", titulo: "Efectivo y equivalentes al efectivo: caja", pagina: 179 };

/* La pieza A1, vacía hasta que llegue su texto aprobado. La vista no la monta mientras no tenga pantallas. */
export const PIEZA_LA_CAJA = {
  id: A1_ID,
  numero: 1,
  titulo: "",
  pantallas: [],
};
