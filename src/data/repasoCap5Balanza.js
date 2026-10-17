import { ASIENTOS_MATE, ASIENTOS_MATE_B, IVA, RETENCION } from "./repasoCap5MateTextos.js";

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

/*
 * La balanza de un mes, desde sus asientos (D8: la A con los del libro, la B
 * con los de Miyata). Lo que mueve cada asiento sale de su primera variante:
 * las dos del asiento 4 dan el mismo IVA y la misma retención.
 */
export function balanzaDe(asientos) {
  const MOVIMIENTO = asientos.map((a) => {
    const m = { id: a.id, debe: 0, haber: 0, retencion: 0 };
    for (const r of a.correctos[0]) {
      if (r.cuenta === IVA) m[r.lado] += r.valor;
      if (r.cuenta === RETENCION) m.retencion += r.lado === "haber" ? r.valor : -r.valor;
    }
    return m;
  });
  /* El estado de la balanza tras los primeros `hechos` asientos. */
  const tras = (hechos) => {
    const e = { debe: 0, haber: 0, retencion: 0 };
    for (const m of MOVIMIENTO.slice(0, hechos)) {
      e.debe += m.debe;
      e.haber += m.haber;
      e.retencion += m.retencion;
    }
    return { ...e, diferencia: e.haber - e.debe };
  };
  /* La escala del brazo: la mayor diferencia del mes, en valor absoluto. */
  const maxima = Math.max(...MOVIMIENTO.map((_, k) => Math.abs(tras(k + 1).diferencia)));
  return {
    MOVIMIENTO_BALANZA: MOVIMIENTO,
    balanzaTras: tras,
    DIFERENCIA_MAXIMA: maxima,
    RETENCION_FINAL: tras(MOVIMIENTO.length).retencion,
    anguloDe: (diferencia) => (maxima ? (GRADOS_MAXIMOS * diferencia) / maxima : 0),
  };
}

export const BALANZA_A = balanzaDe(ASIENTOS_MATE);
export const BALANZA_B = balanzaDe(ASIENTOS_MATE_B);
export const { MOVIMIENTO_BALANZA, balanzaTras, DIFERENCIA_MAXIMA, RETENCION_FINAL, anguloDe } = BALANZA_A;
