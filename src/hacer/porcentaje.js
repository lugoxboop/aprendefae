/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL PORCENTAJE, ESCRITO EN ESPAÑOL (#542).
 *
 * «Cada hecho valía 16.67 %» llevaba punto decimal: así se escribe en inglés.
 * En español (y en Colombia, donde están los estudiantes) la coma separa los
 * decimales: 16,67 %. Y el signo va separado por un espacio que no se parte,
 * para que el «%» nunca baje solo al renglón siguiente a 320 px.
 *
 *   porcentaje(100 / 6)  → "16,67 %"
 *   porcentaje(100 / 8)  → "12,5 %"     (sin ceros que no dicen nada)
 *   porcentaje(25)       → "25 %"
 *   porcentaje(100 / 3, 1) → "33,3 %"
 *
 * Se redondea a `decimales` y se quitan los ceros del final. Lo que no es un
 * número no se inventa: devuelve "—".
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const ESPACIO_FIJO = " ";

export function decimal(valor, decimales = 2) {
  if (typeof valor !== "number" || !Number.isFinite(valor)) return "—";
  const redondo = valor.toFixed(decimales).replace(/\.?0+$/, "");
  const limpio = redondo === "-0" ? "0" : redondo;
  return limpio.replace("-", "−").replace(".", ",");
}

export function porcentaje(valor, decimales = 2) {
  const n = decimal(valor, decimales);
  return n === "—" ? n : `${n}${ESPACIO_FIJO}%`;
}
