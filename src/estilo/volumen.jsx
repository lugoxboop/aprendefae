import { Children, cloneElement, useInsertionEffect } from "react";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL VOLUMEN DE LOS CONTROLES COMPARTIDOS (#560; la forma es de Ukyo,
 * `vida-visual-v1` §2 y §3, #545).
 *
 * Una sola pieza para los cinco: el nodo del camino, Responder,
 * BotonComoSeJuega, los botones de SecuenciaAprender, Pulsos y ActivityBadge.
 *
 * EL CANTO es una CAPA HERMANA DETRÁS de la cara, nunca un border-bottom ni
 * un box-shadow: el envoltorio reserva 4 px abajo y el canto ocupa la misma
 * silueta que la cara, corrida 4 px hacia abajo. La cara lo tapa todo menos
 * esa franja.
 *
 * EL HUNDIDO, para lo que se pulsa: la cara baja translateY(4px) en 100 ms y
 * vuelve en 160, con cubic-bezier(.3,.9,.4,1). Solo transform, nada en bucle.
 * El canto no se mueve: la cara lo tapa. Sustituye al scale(.97); donde hay
 * canto no van los dos. Con movimiento reducido se hunde sin transición.
 *
 * LA SUPERFICIE ELEVADA (Pulsos, ActivityBadge) no se pulsa: cara N1 y
 * contorno de silueta, sin canto y sin hundido.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const N1 = "#1D3557";
export const N2 = "#344968";
export const TEAL = "#2A9D8F";
export const CANTO_TEAL = "#1D6B61";
export const CLARA = "#B8C4D4";
/* No es un tono nuevo: es el gris quieto de CuatroCapas.jsx (lo encontró Mai en T1). */
export const CANTO_CLARO = "#8C9BB0";
/* Contorno de silueta: sustituye al inset al 35 % donde lo haya; nunca los dos. */
export const SILUETA = "rgba(248,249,250,.18)";
export const ELEVACION = 4;
export const CURVA = "cubic-bezier(.3,.9,.4,1)";
export const BAJA_MS = 100;
export const SUBE_MS = 160;

/* La cara y el canto de cada familia. */
export const FAMILIAS = {
  n2: { cara: N2, canto: N1 },
  teal: { cara: TEAL, canto: CANTO_TEAL },
  clara: { cara: CLARA, canto: CANTO_CLARO },
};

export const CLASE = "fae-vol";
export const CLASE_CARA = "fae-vol-cara";
export const CLASE_CANTO = "fae-vol-canto";
/* El nodo del camino es un <g> de SVG: no lleva envoltorio de caja, solo esta clase. */
export const CLASE_SVG = "fae-vol-svg";

/*
 * `[data-vol-quieto]` apaga el hundido (deshabilitado, o un control sin
 * canto). Va por el envoltorio porque :active sube a los ancestros: así sirve
 * igual para un <button> que para el <g> de un nodo SVG.
 */
export const CSS_VOLUMEN = `
.${CLASE} { position: relative; display: block; padding-bottom: ${ELEVACION}px; }
.${CLASE_CANTO} { position: absolute; left: 0; right: 0; top: ${ELEVACION}px; bottom: 0; pointer-events: none; }
.${CLASE} > :not(.${CLASE_CANTO}) { position: relative; }
.${CLASE_CARA} { transition: transform ${SUBE_MS}ms ${CURVA}; }
:is(.${CLASE}, .${CLASE_SVG}):active:not([data-vol-quieto]) .${CLASE_CARA} { transform: translateY(${ELEVACION}px); transition-duration: ${BAJA_MS}ms; }
@media (prefers-reduced-motion: reduce) { .${CLASE_CARA} { transition: none; } }
`;

/* La hoja va una sola vez al <head>, la monte quien la monte primero. */
export function useEstiloVolumen() {
  useInsertionEffect(() => {
    if (typeof document === "undefined" || document.getElementById("fae-volumen")) return;
    const hoja = document.createElement("style");
    hoja.id = "fae-volumen";
    hoja.textContent = CSS_VOLUMEN;
    document.head.appendChild(hoja);
  }, []);
}

/*
 * Envuelve UN control (su cara) y le pone el canto detrás.
 *   canto     color del canto; "transparent" reserva el alto sin dibujar nada
 *   radio     el border-radius de la cara, para que el canto tenga su silueta
 *   quieto    sin hundido (deshabilitado, o un control que no lleva canto)
 *   estilo    lo que el control aportaba al flujo: márgenes, flex, ancho
 */
export function Volumen({ canto, radio = "999px", quieto = false, estilo, children }) {
  useEstiloVolumen();
  const cara = Children.only(children);
  return (
    <span className={CLASE} data-vol-quieto={quieto ? "" : undefined} style={{ borderRadius: radio, ...estilo }}>
      <span aria-hidden="true" className={CLASE_CANTO} style={{ background: canto, borderRadius: radio }} />
      {/* Solo lo que se hunde lleva la clase de cara: lo quieto conserva su propio gesto (el scale). */}
      {quieto ? cara : cloneElement(cara, { className: [cara.props.className, CLASE_CARA].filter(Boolean).join(" ") })}
    </span>
  );
}

/* La superficie elevada: cara N1 y silueta de 1 px. No se pulsa. */
export const SUPERFICIE = { background: N1, border: `1px solid ${SILUETA}` };
