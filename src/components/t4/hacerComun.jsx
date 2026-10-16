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

/*
 * Al dar el veredicto, un solo desplazamiento para el tramo que va desde la
 * pastilla tocada más alta hasta el pie de la devolución (revisión de
 * Hanayama, hanayama-p2-lote-b.md §6; decisión de Yujiro):
 *   · si el tramo cabe en la ventana menos 16 px, se desplaza lo mínimo para
 *     que quepa con 8 px de margen arriba y abajo;
 *   · si es más largo, la pastilla queda a 8 px del borde de arriba.
 * Sin animación si el movimiento está reducido. `raiz`: la de la pieza.
 * Las pastillas tocadas son las de acierto y error («Iba aquí» no se tocó).
 */
export function mostrarTramo(raiz) {
  const msgs = raiz?.querySelectorAll?.("[data-mensaje]");
  const msg = msgs?.[msgs.length - 1];
  const V = raiz?.ownerDocument?.defaultView;
  if (!msg || !V?.scrollBy) return;
  const alto = V.innerHeight;
  const pastillas = [...raiz.querySelectorAll('.t4r-marca[data-marca="bien"], .t4r-marca[data-marca="mal"]')];
  const pie = msg.getBoundingClientRect().bottom;
  const tope = Math.min(msg.getBoundingClientRect().top, ...pastillas.map((p) => p.getBoundingClientRect().top));
  let dy = 0;
  if (pie - tope <= alto - 16) {
    if (tope < 8) dy = tope - 8;
    else if (pie > alto - 8) dy = pie - (alto - 8);
  } else dy = tope - 8;
  if (!dy) return;
  const quieto = V.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  V.scrollBy({ top: dy, behavior: quieto ? "auto" : "smooth" });
}

/* El foco visible de los destinos de los Hacer (comun.jsx lo da a los de A0, A1 y H1). */
export const CSS_HACER = `
.t4tb-mitad:focus-visible, .t4lb-s:focus-visible, .t4bj-b:focus-visible, .t4h4-op:focus-visible, .t4cp input:focus-visible { outline: 2px solid #F8F9FA; outline-offset: 2px; }
`;
