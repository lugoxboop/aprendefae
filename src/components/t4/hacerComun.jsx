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
 * pastilla tocada más alta (revisión de Hanayama, hanayama-p2-lote-b.md §6;
 * decisiones de Yujiro del 16 oct, la segunda tras la FALLA E2 de Shibukawa
 * sobre 35348c3):
 *   · el tramo llega al pie del botón de avance cuando cabe en la ventana
 *     menos 16 px: se desplaza lo mínimo, con 8 px de margen, y el foco va
 *     al botón;
 *   · si no cabe (sobre todo H3 a 320×568), el tramo llega al pie de la
 *     devolución, con la misma regla (lo mínimo si cabe; si no, la pastilla
 *     a 8 px del borde de arriba). El foco va a la devolución, que ya es una
 *     región viva (tabindex −1), sin preventScroll, y el botón queda al
 *     siguiente Tab.
 * En ningún caso el foco queda fuera de la ventana. Sin animación si el
 * movimiento está reducido. `raiz`: la de la pieza. `enfocar`: el veredicto
 * ya está aplicado (el botón ya está); antes, solo se desplaza. Las pastillas
 * tocadas son las de acierto y error («Iba aquí» no se tocó).
 */
export function mostrarTramo(raiz, { enfocar = false } = {}) {
  const msgs = raiz?.querySelectorAll?.("[data-mensaje]");
  const msg = msgs?.[msgs.length - 1];
  const V = raiz?.ownerDocument?.defaultView;
  if (!msg || !V) return;
  const alto = V.innerHeight;
  const botones = [...raiz.querySelectorAll("[data-avance-t4] button")];
  const boton = enfocar ? botones[botones.length - 1] : null;
  const pastillas = [...raiz.querySelectorAll('.t4r-marca[data-marca="bien"], .t4r-marca[data-marca="mal"]')];
  const medir = () => {
    const tope = Math.min(msg.getBoundingClientRect().top, ...pastillas.map((p) => p.getBoundingClientRect().top));
    return { tope, pieMsg: msg.getBoundingClientRect().bottom, pieBoton: boton ? boton.getBoundingClientRect().bottom : null };
  };
  let g = medir();
  const alBoton = boton != null && g.pieBoton - g.tope <= alto - 16;
  if (enfocar && !alBoton) {
    /* El foco a la devolución, sin preventScroll: el navegador la trae si hiciera falta, y el tramo se mide después. */
    if (!msg.hasAttribute("tabindex")) msg.setAttribute("tabindex", "-1");
    msg.focus?.();
    g = medir();
  }
  const pie = alBoton ? g.pieBoton : g.pieMsg;
  let dy = 0;
  if (pie - g.tope <= alto - 16) {
    if (g.tope < 8) dy = g.tope - 8;
    else if (pie > alto - 8) dy = pie - (alto - 8);
  } else dy = g.tope - 8;
  /* El botón entra con el tramo: el foco va a él sin mover la página por su cuenta. */
  if (alBoton) boton.focus?.({ preventScroll: true });
  if (!dy || !V.scrollBy) return;
  const quieto = V.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  V.scrollBy({ top: dy, behavior: quieto ? "auto" : "smooth" });
}

/* El foco visible de los destinos de los Hacer (comun.jsx lo da a los de A0, A1 y H1). */
export const CSS_HACER = `
.t4tb-mitad:focus-visible, .t4lb-s:focus-visible, .t4bj-b:focus-visible, .t4h4-op:focus-visible, .t4cp input:focus-visible { outline: 2px solid #F8F9FA; outline-offset: 2px; }
`;
