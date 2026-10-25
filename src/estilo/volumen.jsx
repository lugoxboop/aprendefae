import { useInsertionEffect } from "react";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL VOLUMEN DEL CAMINO DE HACER (#560; la forma es de Ukyo,
 * `vida-visual-v1` §2 y §3, #545).
 *
 * EL CANTO es una CAPA HERMANA DETRÁS de la cara, nunca un border-bottom ni
 * un box-shadow: la misma silueta que la cara, corrida 4 px hacia abajo, en el
 * tono de canto de su familia. La cara lo tapa todo menos esa franja.
 *
 * EL HUNDIDO, para lo que se pulsa: la cara baja translateY(4px) en 100 ms y
 * vuelve en 160, con cubic-bezier(.3,.9,.4,1). Solo transform, nada en bucle.
 * El canto no se mueve: la cara lo tapa. Con movimiento reducido se hunde sin
 * transición.
 *
 * Hoy lo usa el camino (CaminoHacer): nodos y líneas. Los demás controles
 * quedaron fuera del encargo (Erwin, 25-oct).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const N1 = "#1D3557";
export const N2 = "#344968";
export const TEAL = "#2A9D8F";
export const CANTO_TEAL = "#1D6B61";
/* Contorno de silueta, 1 px al 18 %. */
export const SILUETA = "rgba(248,249,250,.18)";
export const ELEVACION = 4;
export const CURVA = "cubic-bezier(.3,.9,.4,1)";
export const BAJA_MS = 100;
export const SUBE_MS = 160;

/* La cara y el canto de cada familia. */
export const FAMILIAS = {
  n2: { cara: N2, canto: N1 },
  teal: { cara: TEAL, canto: CANTO_TEAL },
};

/* El que se pulsa lleva CLASE_SVG; lo que se hunde dentro de él, CLASE_CARA. */
export const CLASE_SVG = "fae-vol-svg";
export const CLASE_CARA = "fae-vol-cara";

export const CSS_VOLUMEN = `
.${CLASE_CARA} { transition: transform ${SUBE_MS}ms ${CURVA}; }
.${CLASE_SVG}:active .${CLASE_CARA} { transform: translateY(${ELEVACION}px); transition-duration: ${BAJA_MS}ms; }
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
