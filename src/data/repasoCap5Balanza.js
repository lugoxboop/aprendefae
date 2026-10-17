import { ASIENTOS_MATE, IVA, RETENCION } from "./repasoCap5MateTextos.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * r5-3 · LA BALANZA DEL IVA (P2 de Itagaki) — las cifras, calculadas de los
 * asientos correctos (nunca escritas a mano).
 *
 *   · platillo DEBE: el IVA que entra por el debe (lo pagado al comprar, y la
 *     devolución de una venta);
 *   · platillo HABER: el IVA que entra por el haber (lo cobrado al vender);
 *   · el sobre: la retención por pagar acumulada;
 *   · el brazo: θ = 12° × (haber − debe) / máx |haber − debe| del mes.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const GRADOS_MAXIMOS = 12;

/* Lo que mueve cada asiento (su primera variante: las dos del asiento 4 dan el mismo IVA y la misma retención). */
export const MOVIMIENTO_BALANZA = ASIENTOS_MATE.map((a) => {
  const m = { id: a.id, debe: 0, haber: 0, retencion: 0 };
  for (const r of a.correctos[0]) {
    if (r.cuenta === IVA) m[r.lado] += r.valor;
    if (r.cuenta === RETENCION) m.retencion += r.lado === "haber" ? r.valor : -r.valor;
  }
  return m;
});

/* El estado de la balanza tras los primeros `hechos` asientos. */
export function balanzaTras(hechos) {
  const e = { debe: 0, haber: 0, retencion: 0 };
  for (const m of MOVIMIENTO_BALANZA.slice(0, hechos)) {
    e.debe += m.debe;
    e.haber += m.haber;
    e.retencion += m.retencion;
  }
  return { ...e, diferencia: e.haber - e.debe };
}

/* La escala del brazo: la mayor diferencia del mes, en valor absoluto. */
export const DIFERENCIA_MAXIMA = Math.max(...MOVIMIENTO_BALANZA.map((_, k) => Math.abs(balanzaTras(k + 1).diferencia)));
export const RETENCION_FINAL = balanzaTras(MOVIMIENTO_BALANZA.length).retencion;
export const anguloDe = (diferencia) => (DIFERENCIA_MAXIMA ? (GRADOS_MAXIMOS * diferencia) / DIFERENCIA_MAXIMA : 0);
