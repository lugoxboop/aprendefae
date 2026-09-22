/*
 * Formato de cifras de DA-Learn.
 *
 * Vivía en utils/ranking.js junto al ranking simulado. Al eliminar ese ranking
 * se separó aquí: dar formato a pesos no tiene nada que ver con clasificar
 * estudiantes, y el nombre del archivo anterior ya no describía su contenido.
 */
export const formatCOP = (n) => "$" + Math.round(n || 0).toLocaleString("es-CO");

/*
 * Los FP de la cabecera, con punto de miles: 1.200 · 12.500. NUNCA con coma —
 * en español la coma es el decimal, y «1,200 FP» se lee como mil doscientos
 * milésimos. Se usa la misma configuración regional que el resto del sitio.
 *
 * Se redondea porque un FP con decimales no existe: el motor devuelve enteros.
 */
export const formatoFP = (n) => Math.round(Number(n) || 0).toLocaleString("es-CO");
