import { HECHOS_T6_ACT4, ERRORES_T6_ACT4 } from "../data/contabilidadT6Act4.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · HACER 4 — «¿Qué se debita?»: la devolución de cada elección. El
 * patrón es el de «¿Por Cuál Arteria Entra?» (retroArteria): el acierto del
 * hecho, o el texto del tipo de error. Lote 6d: sin emoji delante; el
 * veredicto lo da `veredictoT6Act4` (o elegida === respuesta), no el texto.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const tipoDeErrorT6Act4 = (hecho, elegida) => (elegida === hecho.respuesta ? null : hecho.errores[elegida] ?? null);

export function retroT6Act4(hecho, elegida) {
  if (elegida === hecho.respuesta) return hecho.acierto;
  const tipo = tipoDeErrorT6Act4(hecho, elegida);
  return tipo ? ERRORES_T6_ACT4[tipo] : null;
}

/* El veredicto, como estado: «correcta» o «error» (en a4 hay un solo intento; la correcta no elegida se revela). */
export const veredictoT6Act4 = (hecho, elegida) => (elegida === hecho.respuesta ? "correcta" : "error");

/* Para el panel docente: el ítem es el hecho, y se lee por su texto. */
export const hechoDeItemT6Act4 = (id) => HECHOS_T6_ACT4.find((h) => h.id === id)?.texto ?? null;
