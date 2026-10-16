import { FAE } from "../../../../theme.js";
import { SOLO_LECTOR } from "../verbos.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * E4 · LO ELEGIDO CONSERVA SU FORMA (hoja de fusiones de Mai, §3) — una regla
 * para las opciones, las fichas, las mesas y las casillas de la Célula B.
 *
 * Después de calificar, lo que eligió el estudiante se queda donde lo puso, con
 * su forma, y lo correcto aparece junto a ello, sin reemplazarlo:
 *   · ✓ correcta: ícono ✓ (SVG de 14, trazo 2, al inicio) + borde 2 nodo +
 *     relleno navy. Siempre en lo correcto.
 *   · ✕ tu respuesta: ícono ✕ (SVG de 14) + texto tachado (1,5 px) + su borde
 *     de siempre + opacidad entera. Solo si lo elegido no era lo correcto.
 *   · el resto: opacidad 0,5.
 * Si acertó, solo hay ✓. En blanco y negro se lee por el ícono, el tachado y el
 * borde grueso. Sin coral: el coral sigue solo en la devolución.
 *
 * Los íconos son SVG, no letras de la fuente, con aria-hidden; a cada marca la
 * acompaña un texto oculto. PARA SHOKO (textos nuevos): «(respuesta
 * correcta)», «(tu respuesta)» y, en la mesa, «(valor correcto)» y «(faltaba)».
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CORRECTA = "correcta";
export const TACHADA = "tachada";
export const APAGADA = "apagada";

export const OCULTO_E4 = {
  correcta: "(respuesta correcta)",
  tachada: "(tu respuesta)",
  valorCorrecto: "(valor correcto)",
  faltaba: "(faltaba)",
};

export function IconoVisto({ color = FAE.text }) {
  return (
    <svg data-icono="visto" aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" style={{ flex: "none", display: "block" }}>
      <path d="M2.5 7.4 5.6 10.4 11.5 3.8" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconoTache({ color = FAE.text }) {
  return (
    <svg data-icono="tache" aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" style={{ flex: "none", display: "block" }}>
      <path d="M3.5 3.5 10.5 10.5M10.5 3.5 3.5 10.5" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* El ícono y el texto oculto de una marca; nada si no hay marca o si está apagada. */
export function Marca({ marca, oculto = null }) {
  if (marca !== CORRECTA && marca !== TACHADA) return null;
  return (
    <>
      {marca === CORRECTA ? <IconoVisto /> : <IconoTache />}
      <span style={SOLO_LECTOR}>{` ${oculto ?? OCULTO_E4[marca]}`}</span>
    </>
  );
}

/* El borde y el relleno de cada marca; `base` es el borde de siempre. */
export function estiloE4(marca, base) {
  if (marca === CORRECTA) return { border: `2px solid ${FAE.node}`, background: FAE.navy, opacity: 1 };
  if (marca === TACHADA) return { border: base, opacity: 1 };
  if (marca === APAGADA) return { border: base, opacity: 0.5 };
  return { border: base };
}

/* El tachado del texto de lo que eligió y no era (1,5 px). */
export const TACHADO = { textDecoration: "line-through", textDecorationThickness: "1.5px" };
