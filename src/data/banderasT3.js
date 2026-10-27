/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T3 · LA BANDERA DE LAS SECUENCIAS DE APRENDER (Célula E).
 *
 * Hay estudiantes reales: lo publicado (las cuatro piezas en CuatroCapas, con
 * su pregunta «En una frase») sigue siendo lo que se ve hasta que la versión
 * en SecuenciaAprender esté verificada (Takamura) y Kamogawa la encienda.
 *
 * Las dos conviven detrás de esta bandera. ENCENDIDA desde que Takamura
 * verificó las seis piezas: la secuencia es lo que ven todos. Apagada, se
 * mira sin encenderla para nadie más con `?t3=secuencia` en la dirección.
 *
 * Volver atrás es cambiar ENCENDIDA a false: un cambio de una línea,
 * reversible, que no toca datos. La vista anterior no se retira aquí.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const ENCENDIDA = true;

export function secuenciaT3Activa(buscar = typeof location !== "undefined" ? location.search : "") {
  if (ENCENDIDA) return true;
  try {
    return new URLSearchParams(buscar).get("t3") === "secuencia";
  } catch {
    return false;
  }
}
