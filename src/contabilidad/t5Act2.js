import { DEBE, HABER } from "../data/contabilidad.js";
import { INVERSIONES } from "../data/contabilidadT5Act2.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 5 · HACER 2 — «El cierre completo de Santa Pacha»: la evaluación.
 *
 * La regla de t3-cierre-completo (contabilidad/elCierreCompleto.js),
 * replicada aquí para no tocar la del Tema 3: un intento por parte, sin
 * puntos parciales, y cuando se cumple más de un error manda el más
 * estructural: una cuenta que no va (D), una cuenta al revés (C), una cuenta
 * que falta (A) y, con todas las cuentas en su lado, un valor mal escrito (B).
 *
 * La C7 (Futaba) es la B de las ventas cuando el valor de Inversiones –
 * títulos no es su costo: el texto explica que se acredita por lo que
 * costaron. Si Inversiones – títulos está bien y falla otro valor, va la B
 * «otro valor».
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Una parte armada: `puestas` es [{ cuenta, lado, valor }]. */
export function evaluarParteT5Act2(parte, puestas) {
  const esperado = parte.asiento;
  const real = new Map(esperado.map((e) => [e.cuenta, e]));
  let error = null;
  if (puestas.some((p) => !real.has(p.cuenta))) error = "D";
  else if (puestas.some((p) => real.get(p.cuenta).lado !== p.lado)) error = "C";
  else if (esperado.some((e) => !puestas.some((p) => p.cuenta === e.cuenta))) error = "A";
  else if (puestas.some((p) => p.valor !== real.get(p.cuenta).valor)) {
    const inversiones = puestas.find((p) => p.cuenta === INVERSIONES);
    error = parte.errores.C7 && inversiones && inversiones.valor !== real.get(INVERSIONES).valor ? "C7" : "B";
  }
  return { ok: error === null, error, texto: error ? parte.errores[error] : null, esperado };
}

/* Los totales de una mesa (los colectores). */
export const totalesDe = (puestas) => ({
  debe: puestas.filter((p) => p.lado === DEBE).reduce((s, p) => s + (p.valor ?? 0), 0),
  haber: puestas.filter((p) => p.lado === HABER).reduce((s, p) => s + (p.valor ?? 0), 0),
});

/* Bien a la primera, sobre las partes de la tanda. */
export const puntuarT5Act2 = (resultados, total) => (total ? (resultados.filter((r) => r.ok).length / total) * 100 : 0);

/* Para el panel docente: la parte se lee por su rótulo y su instrucción. */
export const parteDeItemT5Act2 = (partes) => (id) => {
  const p = partes.find((x) => x.id === id);
  return p ? `${p.rotulo} · ${p.instruccion}` : null;
};
