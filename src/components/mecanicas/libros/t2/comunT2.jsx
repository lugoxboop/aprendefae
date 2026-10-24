import { FAE } from "../../../../theme.js";
import { CORAL_B, CSS_B5H } from "../b5/Devolucion.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T2 · LO QUE COMPARTEN LAS TRES HACER NUEVAS (Célula C, lote T2-2).
 *
 * Solo la frase de consecuencia y el CSS. Todo lo demás son piezas que ya
 * están en main, sin cambiarlas: CuentaT, AsientoEnLineas, CampoCifra,
 * CuentaDeValor, OpcionC, Devolucion, Pastilla, Encabezado, Pulsos, Cierre.
 *
 * LA CONSECUENCIA VA ANTES QUE EL VEREDICTO (regla C4 de Watari): primero se
 * lee lo que pasaría, después «Correcto» o «No va aquí».
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CSS_T2_NUEVAS = `
@keyframes fae-t2n-entra { from { opacity: 0; transform: translateY(-3px); } to { opacity: 1; transform: none; } }
.fae-t2n-entra { animation: fae-t2n-entra 220ms ease-out both; }
.fae-t2n-mueve { transition: transform 260ms ease, opacity 220ms ease; }
@media (prefers-reduced-motion: reduce) {
  .fae-t2n-entra { animation: none !important; }
  .fae-t2n-mueve { transition: none !important; }
}
${CSS_B5H}`;

export function Consecuencia({ texto, error = true }) {
  if (!texto) return null;
  return (
    <p data-consecuencia={error ? "error" : "acierto"} className="fae-t2n-entra" style={{
      margin: "12px 0 0", padding: "9px 12px", borderRadius: "10px",
      fontSize: "14px", lineHeight: 1.45, color: FAE.text,
      background: "rgba(10,20,34,0.4)",
      border: error ? `1px dashed ${CORAL_B}` : "1px solid rgba(248,249,250,0.22)",
    }}>
      {texto}
    </p>
  );
}

export const ROTULO_T2 = {
  margin: "14px 0 8px", fontFamily: "Sora, sans-serif", fontSize: "12px",
  fontWeight: 700, letterSpacing: "0.12em", color: "rgba(248,249,250,0.7)",
};

/* El hecho que se lee antes del asiento (Near, H3): con él solo se resuelve. */
export function Hecho({ texto }) {
  if (!texto) return null;
  return (
    <p data-hecho style={{ margin: "0 0 10px", fontSize: "14px", lineHeight: 1.45, color: FAE.text }}>{texto}</p>
  );
}

/* El pie de fuente (H2): «Basado en el libro…». */
export function Pie({ texto }) {
  if (!texto) return null;
  return (
    <p data-pie style={{ margin: "10px 0 0", fontSize: "12px", lineHeight: 1.4, color: "rgba(248,249,250,0.7)" }}>{texto}</p>
  );
}
