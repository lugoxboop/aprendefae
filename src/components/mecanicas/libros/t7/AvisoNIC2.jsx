/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · LA FRASE FIJA DE LA NIC 2 EN LOS HACER (Célula C).
 *
 * Encargo de L: la frase va siempre a la vista en A7, A8, H6 y H7. En las de
 * Aprender la pone PantallasT7_3 (`aviso`); en las de Hacer, este recuadro,
 * con la misma forma: una nota con borde y la raya de la izquierda más
 * gruesa. Lo usan H6 y H7, arriba de la consigna.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ESTILO = {
  margin: "0 0 12px", padding: "10px 12px", border: "1px solid #B8C4D4", borderLeftWidth: "3px", borderRadius: "8px",
  fontSize: "14px", lineHeight: 1.45, color: "#F8F9FA", overflowWrap: "anywhere",
};

export default function AvisoNIC2({ texto }) {
  return <p role="note" data-aviso style={ESTILO}>{texto}</p>;
}
