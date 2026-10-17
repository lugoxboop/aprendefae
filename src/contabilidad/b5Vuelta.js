/*
 * ═══════════════════════════════════════════════════════════════════════════
 * D8 · LA SEGUNDA VUELTA DE LOS HACER DE B (lote 18; variantes de Futaba).
 *
 * Shoko (D8): la segunda vuelta era idéntica. La primera vuelta es la de hoy;
 * desde la segunda se alterna con la variante (vuelta 0 · hoy, 1 · variante,
 * 2 · hoy…). Cuenta como vuelta cada partida terminada.
 *
 * La cuenta vive en el navegador de quien juega (una comodidad por persona,
 * no un registro): si el almacenamiento no está o falla, se juega la de hoy.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CLAVE = (id) => `fae-b5-vueltas:${id}`;

export function vueltasDe(id) {
  try {
    const n = Number(window.localStorage.getItem(CLAVE(id)));
    return Number.isInteger(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function sumarVuelta(id) {
  const n = vueltasDe(id) + 1;
  try { window.localStorage.setItem(CLAVE(id), String(n)); } catch { /* sin almacenamiento: la cuenta vive solo en esta partida */ }
  return n;
}

/* La vuelta k usa la variante si es impar. */
export const esVariante = (vuelta) => vuelta % 2 === 1;

/*
 * Una copia de `valor` (texto, lista u objeto) con los cambios de la variante
 * en cada texto: los nombres, las fechas y las cifras que cambian. Solo se usa
 * para los textos «de hoy» que Futaba reusa; los suyos van escritos tal cual.
 */
export function conCambios(valor, cambios) {
  if (typeof valor === "string") return cambios.reduce((t, [de, a]) => t.split(de).join(a), valor);
  if (Array.isArray(valor)) return valor.map((x) => conCambios(x, cambios));
  if (valor && typeof valor === "object") return Object.fromEntries(Object.entries(valor).map(([k, x]) => [conCambios(k, cambios), conCambios(x, cambios)]));
  return valor;
}
