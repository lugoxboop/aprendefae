import { INVERSIONES } from "../data/contabilidadT5Act2.js";
import { evaluarParte, totalesDe, puntuar, parteDeItem } from "./cierreConMesa.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 5 · HACER 2 — «El cierre completo de Santa Pacha»: la evaluación.
 *
 * La regla de la mesa de la célula (contabilidad/cierreConMesa.js, sacada de
 * aquí para el Tema 6): D > C > A > B, un intento por parte.
 *
 * La C7 (Futaba) es la B de las ventas cuando el valor de Inversiones –
 * títulos no es su costo: el texto explica que se acredita por lo que
 * costaron. Si Inversiones – títulos está bien y falla otro valor, va la B
 * «otro valor».
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Una parte armada: `puestas` es [{ cuenta, lado, valor }]. */
export function evaluarParteT5Act2(parte, puestas) {
  const especificas = parte.errores.C7 ? [{ cuenta: INVERSIONES, clave: "C7", texto: parte.errores.C7 }] : [];
  return evaluarParte({ ...parte, errores: { ...parte.errores, especificas } }, puestas);
}

export { totalesDe };
export const puntuarT5Act2 = puntuar;
export const parteDeItemT5Act2 = parteDeItem;
