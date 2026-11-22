/*
 * ═══════════════════════════════════════════════════════════════════════════
 * MACRO 2026 · LOS COLORES DE LA DEMANDA AGREGADA (un solo módulo, 12 piezas)
 *
 * Especificación de Gen (t1-demanda-agregada.md §0): C, I, G y XN llevan cuatro
 * tonos distintos tomados de los tokens Planck (src/styles/planck.css, tema
 * oscuro, que es el del sitio: <html data-theme="dark">), medidos a 3:1 contra
 * el fondo y fijados AQUÍ. Ninguna pieza escribe un color de componente a mano.
 *
 * Por qué estos cuatro: además de tono distinto, tienen LUMINANCIA distinta
 * (G 0,27 · I 0,43 · C 0,57 · XN 0,91), así que se separan también con
 * deuteranopía, protanopía o en gris. Y cada componente lleva su letra: el
 * color nunca es la única señal (D11).
 *
 * Contraste contra el fondo #0E1B2E (L = 0,0115), medido con la fórmula WCAG
 * en la prueba src/macro2026/__tests__/colores.test.mjs (no calculado a mano):
 *   C  #f2c14e (--warning)  ≥ 10:1
 *   I  #4fc2b2 (--success)  ≥  8:1
 *   G  #6f86ff (--accent)   ≥  5:1
 *   XN #f4f5f7 (--ink)      ≥ 15:1
 *
 * CORAL SOLO PARA ERROR. El acierto se marca con ✓ y borde en INK, nunca en
 * verde. El tramado del déficit (A4) es gris, no coral: no es un error.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const FONDO = "#0E1B2E";
export const SUPERFICIE = "#16263D";
export const SUPERFICIE_2 = "#1F3250";
export const BORDE = "#3a4a63";
export const INK = "#f4f5f7";
export const INK_2 = "#b6bbc5";
/* Para texto sobre un bloque de color (todos los bloques son claros). */
export const TINTA_SOBRE_COLOR = "#121418";
/* El coral de la casa (theme.js · FAE.coral). SOLO error del estudiante. */
export const CORAL = "#E76F51";
/* El tramado neutro (déficit, X − M negativo): gris, nunca coral. */
export const GRIS = "#8e94a0";

export const COMPONENTES = {
  C: { id: "C", letra: "C", nombre: "Consumo", color: "#f2c14e", token: "--warning" },
  I: { id: "I", letra: "I", nombre: "Inversión", color: "#4fc2b2", token: "--success" },
  G: { id: "G", letra: "G", nombre: "Gasto público", color: "#6f86ff", token: "--accent" },
  XN: { id: "XN", letra: "XN", nombre: "Exportaciones netas", color: "#f4f5f7", token: "--ink" },
};

export const ORDEN_COMPONENTES = ["C", "I", "G", "XN"];

export const colorDe = (id) => COMPONENTES[id]?.color ?? INK;

/* Luminancia relativa y contraste WCAG 2.x, para la prueba y para las sondas. */
export function luminancia(hex) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contraste(a, b) {
  const [x, y] = [luminancia(a), luminancia(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}
