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

/*
 * La opción de la célula con E4, para las elecciones y las casillas (b5-t6-a4, a5, a6). Tiene el mismo
 * contrato que la Opcion compartida de corazon/juego.jsx (`estado`: null · "correcta" · "incorrecta" ·
 * "revelada"; `deshabilitada`; `ancho`), y sus medidas (relleno 13 · 15, Inter 13,5), para no mover
 * nada. Lo que cambia son las marcas:
 *   · correcta y revelada (la buena que no se eligió): ✓, borde 2 nodo y relleno navy; sin teal;
 *   · incorrecta (la elegida que no era): ✕ y tachada, con su borde de siempre; sin coral;
 *   · el resto, una vez decidida: opacidad 0,5.
 * «era esta» deja de verse: lo dicen el ✓ y su texto oculto. El ícono va en un hueco de 18, el mismo
 * ancho del marcador compartido, así que el texto no se mueve al decidir.
 */
const BORDE_OPCION = "1px solid rgba(248,249,250,0.16)";
export function OpcionE4({ children, onClick, estado = null, deshabilitada = false, ancho = false }) {
  const marca = estado === "correcta" || estado === "revelada" ? CORRECTA : estado === "incorrecta" ? TACHADA : deshabilitada ? APAGADA : null;
  const grueso = marca === CORRECTA;
  return (
    <button type="button" onClick={onClick} disabled={deshabilitada} data-estado={estado ?? "libre"} data-marca={marca ?? ""}
      style={{
        display: "flex", alignItems: "center", gap: "12px", width: ancho ? "100%" : undefined, boxSizing: "border-box",
        textAlign: "left", padding: grueso ? "12px 14px" : "13px 15px", borderRadius: "18px",
        background: "rgba(248,249,250,0.055)", color: FAE.text, fontFamily: "Inter, sans-serif", fontSize: "13.5px", lineHeight: 1.45,
        cursor: deshabilitada ? "default" : "pointer", ...estiloE4(marca, BORDE_OPCION),
      }}>
      <span aria-hidden={marca ? undefined : "true"} style={{ flex: "none", width: "18px", display: "flex", justifyContent: "center" }}>
        <Marca marca={marca} />
      </span>
      <span style={{ minWidth: 0, flex: 1, ...(marca === TACHADA ? TACHADO : null) }}>{children}</span>
    </button>
  );
}
