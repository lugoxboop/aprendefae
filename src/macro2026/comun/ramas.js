/*
 * ═══════════════════════════════════════════════════════════════════════════
 * MACRO 2026 · LAS CUATRO RAMAS DE LA POLÍTICA ECONÓMICA (T2 en adelante)
 *
 * Especificación de Gen (t2-politica-economica.md §0): cada rama se reconoce
 * por ícono + tono, y lleva SIEMPRE su nombre escrito junto al ícono (el color
 * nunca es la única señal). Cuatro tonos distintos de los de C/I/G/XN de T1 y
 * nunca coral. Ninguna pieza escribe un color de rama a mano.
 *
 * Los tonos (decisión anotada en construccion-t2.md): el tema oscuro de
 * planck.css solo trae cuatro tonos con color, y T1 ya los usa todos
 * (--warning, --success, --accent, --ink). Aquí van los tonos hermanos de la
 * misma paleta que T1 no usa: --accent-hover, --product-debe, --product-haber
 * y el «node» de theme.js (la paleta de la casa). Ninguno es coral ni se
 * acerca al --error. Tienen luminancias distintas (0,26 · 0,36 · 0,58 · 0,70)
 * y la prueba mide su contraste contra el fondo (≥ 3:1) y contra la tinta
 * oscura de las pastillas (≥ 4,5:1).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const RAMAS = {
  fiscal: { id: "fiscal", nombre: "Fiscal", largo: "Política fiscal", tono: "#8a9cff", token: "--accent-hover", icono: "alcancia" },
  monetaria: { id: "monetaria", nombre: "Monetaria", largo: "Política monetaria", tono: "#2a9d8f", token: "--product-debe", icono: "moneda" },
  cambiaria: { id: "cambiaria", nombre: "Cambiaria", largo: "Política cambiaria", tono: "#e9c46a", token: "--product-haber", icono: "billete" },
  comercial: { id: "comercial", nombre: "Comercial", largo: "Política comercial", tono: "#cbdcf2", token: "theme.js · node", icono: "contenedor" },
};

export const ORDEN_RAMAS = ["fiscal", "monetaria", "cambiaria", "comercial"];

export const colorRama = (id) => RAMAS[id]?.tono ?? "#f4f5f7";

/* Los términos de la DA que mueve cada rama (H3, A4). */
export const TERMINOS_RAMA = {
  fiscal: ["TR", "t", "G"],
  monetaria: ["i"],
  cambiaria: ["XN"],
  comercial: ["XN"],
};
