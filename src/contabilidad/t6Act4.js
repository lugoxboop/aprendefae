import {
  HECHOS_T6_ACT4, HECHOS_V2_T6_ACT4, ERRORES_T6_ACT4, A_PROVISION, SE_ACREDITA_T6_ACT4, P_SUBE, P_BAJA, P_IGUAL, DEVOLUCIONES_SEGUNDA_T6_ACT4,
} from "../data/contabilidadT6Act4.js";
import { PROVISION } from "../data/contabilidadT6Act2.js";

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
export const hechoDeItemT6Act4 = (id) => [...HECHOS_T6_ACT4, ...HECHOS_V2_T6_ACT4].find((h) => h.id === String(id).replace(/\/2$/, ""))?.texto ?? null;

/* ═══ D4 (lote 19): qué le pasa a la provisión, del asiento del banco ═══ */
export function provisionDeT6Act4(hecho) {
  if (SE_ACREDITA_T6_ACT4[hecho.id] === PROVISION) return P_SUBE;
  if (hecho.respuesta === A_PROVISION) return P_BAJA;
  return P_IGUAL;
}

/* Acierto: «Correcto.» sin más (el asiento ya se explicó en la decisión 1). Primer error: pista; segundo: porqué (C2). */
export function evaluarSegundaT6Act4(hecho, elegida, intento) {
  if (elegida === provisionDeT6Act4(hecho)) return { ok: true, texto: null };
  const d = DEVOLUCIONES_SEGUNDA_T6_ACT4[hecho.id];
  return { ok: false, texto: intento === 1 ? d.pista : d.porque };
}
