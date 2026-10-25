/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T3 · LA BANDERA DE LAS SECUENCIAS DE APRENDER (Célula E).
 *
 * Hay estudiantes reales: lo publicado (las cuatro piezas en CuatroCapas, con
 * su pregunta «En una frase») sigue siendo lo que se ve hasta que la versión
 * en SecuenciaAprender esté verificada (Takamura) y Kamogawa la encienda.
 *
 * Las dos conviven detrás de esta bandera. Apagada por defecto. Para mirarla
 * sin encenderla para nadie más: `?t3=secuencia` en la dirección.
 *
 * Encenderla para todos es cambiar ENCENDIDA a true: un cambio de una línea,
 * reversible, que no toca datos. La vista anterior no se retira aquí.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const ENCENDIDA = false;

export function secuenciaT3Activa(buscar = typeof location !== "undefined" ? location.search : "") {
  if (ENCENDIDA) return true;
  try {
    return new URLSearchParams(buscar).get("t3") === "secuencia";
  } catch {
    return false;
  }
}
