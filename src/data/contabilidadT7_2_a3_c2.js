/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · A3 «El kárdex», RENOVADA (Patrón de enganche C2 de Watari, pieza 1),
 * con K-1, K-2 y K-3 de Mello encima.
 *
 * Aquí va SOLO lo que no es de Near:
 *   · los textos nuevos de Mello (auditoria-mello-patron-c2.md, sección 1),
 *     letra por letra; una prueba los lee de la auditoría
 *     (src/contabilidad/__tests__/correccionesMelloC2Kardex.mjs) y los compara
 *   · los rótulos de interfaz de Watari, marcados [W]
 *
 * Todo lo demás (textos, pistas, devoluciones, aciertos, pies, kárdex) sale
 * de los datos de Near que ya están en main: contabilidadT7_2_a3.js
 * (PIEZA_EL_KARDEX y KARDEX_A3). El componente los lee de ahí, sin copiarlos.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * K-1 · PEPS y UEPS con tres fichas, como el promedio. Cada ficha es la salida
 * completa del día. El orden es el de la tabla de Mello (la correcta primero);
 * en pantalla van barajadas (ORDEN_EN_PANTALLA).
 *   · los ids de las fichas que ya eran opciones de Near son los de Near
 *     («inicio-y-5», «solo-5», «del-14», «inicio-y-14», «del-5»): de ahí sale
 *     su devolución, la de Near en main
 *   · la ficha nueva de PEPS («50 y 10») trae la devolución nueva de Mello.
 *     Su id, «como-ueps», no se ve. [ESCRITO POR CLAUDE, NO POR LA FICHA]
 *     PENDIENTE_DE_REVISION
 * Near confirma la devolución «50 y 10» (condición 2 de fusión de Mello).
 */
export const FICHAS_K1 = {
  peps: [
    { id: "inicio-y-5", texto: "30 × 2.010 y 30 × 2.130", correcta: true },
    { id: "solo-5", texto: "60 × 2.130" },
    { id: "como-ueps", texto: "50 × 2.130 y 10 × 2.010", devolucion: "Así sería con UEPS. Con PEPS salen primero las más antiguas: las del inicio." },
  ],
  ueps: [
    { id: "del-14", texto: "35 × 2.250", correcta: true },
    { id: "inicio-y-14", texto: "20 × 2.010 y 15 × 2.250" },
    { id: "del-5", texto: "35 × 2.130" },
  ],
};

/*
 * [ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION · Mello pide
 * las fichas «barajadas» en pantalla, sin decir el orden. Este: la correcta
 * en el medio en PEPS y al final en UEPS, nunca en la misma posición.
 */
export const ORDEN_EN_PANTALLA = {
  peps: ["solo-5", "inicio-y-5", "como-ueps"],
  ueps: ["inicio-y-14", "del-5", "del-14"],
};

/* K-2 · el mensaje fuera de la fecha de la pregunta, mientras falte llegar al 20 de julio. */
export const SIGUE_HASTA_EL_20 = "Sigue hasta el 20 de julio.";

/* K-3 · el porqué de «lado a lado», a la vista: la primera frase del de Near. */
export const PORQUE_LADO_A_LADO = "Con UEPS y con el promedio, en el permanente importan las fechas.";

/*
 * [W] provisional, pendiente de Near: los rótulos de interfaz de Watari
 * (sección 5 de la pieza, «Rótulos que pido a Near», y el código de
 * referencia). Near todavía no los confirma.
 */
export const ROTULOS_W = {
  fecha: "Fecha",
  entradas: "Entradas",
  salidas: "Salidas",
  saldo: "Saldo",
  entraOSale: "Entra o sale",
  entra: "Entra",
  sale: "Sale",
  correcto: "Correcto",
  noVaAqui: "No va aquí",
  siguientePieza: "Siguiente pieza",
  kardex: "Kárdex",
  costoPromedio: "Costo promedio",
  pantalla: (n, total) => `Pantalla ${n} de ${total}`,
};
