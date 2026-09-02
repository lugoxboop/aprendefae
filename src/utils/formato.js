/*
 * Formato de cifras de DA-Learn.
 *
 * Vivía en utils/ranking.js junto al ranking simulado. Al eliminar ese ranking
 * se separó aquí: dar formato a pesos no tiene nada que ver con clasificar
 * estudiantes, y el nombre del archivo anterior ya no describía su contenido.
 */
export const formatCOP = (n) => "$" + Math.round(n || 0).toLocaleString("es-CO");
