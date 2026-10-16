/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · LO PROPIO DE LOS HACER REDISEÑADOS (H3, H4, H7 y H8) — Célula D.
 *
 * Lo que no está en comun.jsx (#260) ni en tablero.jsx y Regla.jsx (las piezas
 * del prototipo de Hanayama, portadas por Baki):
 *   · VACIO: un hueco reservado guarda su alto con un espacio duro, nunca con
 *     la respuesta escondida (PH8-2)
 *   · ParConLector: el Par de tablero.jsx con lo que oye el lector de pantalla
 *     escrito por Katsumi («El banco: X. Los libros: Y.», y «Son iguales.» solo
 *     si lo son). El Par compartido arma su propia etiqueta; aquí la envuelve
 *     una imagen con la de Katsumi, y lo de adentro queda como dibujo
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { Par } from "./tablero.jsx";

export const VACIO = " ";

export function ParConLector({ lector, ...props }) {
  return (
    <div role="img" aria-label={lector} data-lector-par={lector}>
      <Par {...props} />
    </div>
  );
}

/* El foco visible de los destinos de los Hacer (comun.jsx lo da a los de A0, A1 y H1). */
export const CSS_HACER = `
.t4tb-mitad:focus-visible, .t4lb-s:focus-visible, .t4bj-b:focus-visible, .t4h4-op:focus-visible, .t4cp input:focus-visible { outline: 2px solid #F8F9FA; outline-offset: 2px; }
`;
