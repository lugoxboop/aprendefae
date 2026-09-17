import { History } from "lucide-react";
import { FAE } from "../../theme.js";
import { HACER } from "../../data/subjects.js";
import { MallaAnimada, NAVY_CLARO } from "../backgrounds/MeshGradientBackground.jsx";
import ActivityBadge from "../shared/ActivityBadge.jsx";
import IconoRacha from "../shared/IconoRacha.jsx";
import GestoPasillo from "./GestoPasillo.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL BANNER DEL REPASO DIARIO, encima de la grilla de temas.
 *
 * No es un tema más, así que no tiene forma de tema: es una franja de ancho
 * completo y no una tarjeta cuadrada. Lo que la hace «otra cosa» a primera
 * vista es la forma y el fondo, no el tamaño.
 *
 *   Fondo     la malla animada de la portada (MallaAnimada), con manchas teal y
 *             navy en vez de las de la portada: teal → navy, sin coral.
 *   Iconos    el reloj con flecha de retorno del Repaso y la llama de la racha.
 *   Miniatura el gesto del pasillo, igual que antes.
 *   HACER y → los mismos que en cualquier tarjeta.
 *
 * Qué índice lo enseña lo dice `indice` en ACTIVIDADES_TRANSVERSALES; el
 * banner no sabe de qué materias sale el pool.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const IconoRepaso = History;

export const SUBTITULO_REPASO = "Repasa lo que ya viste, mezclado entre todos los temas.";

/* Las manchas del banner: tamaños en px porque la franja es baja y un vmax la desbordaría de color. */
export const MANCHAS_BANNER = [
  { color: FAE.teal, tamano: "340px", izquierda: "-22%", arriba: "-110%", desenfoque: "56px", opacidad: 0.78, keyframes: "fae-mesh-a", duracion: "22s" },
  { color: NAVY_CLARO, tamano: "380px", izquierda: "38%", arriba: "-90%", desenfoque: "64px", opacidad: 0.7, keyframes: "fae-mesh-c", duracion: "27s" },
  { color: FAE.teal, tamano: "240px", izquierda: "8%", arriba: "10%", desenfoque: "52px", opacidad: 0.42, keyframes: "fae-mesh-b", duracion: "31s" },
];

/*
 * Dos disposiciones con una sola rejilla:
 *   teléfono  iconos · miniatura · HACER  arriba; título y flecha abajo
 *   ancho     todo en una fila
 */
const CSS = `
.fae-banner-repaso { transition: border-color 180ms ease, transform 180ms ease; }
.fae-banner-repaso:hover { border-color: rgba(42,157,143,0.85); }
.fae-banner-repaso:focus-visible { outline: 2px solid ${FAE.teal}; outline-offset: 3px; }
.fae-banner-repaso__rejilla {
  position: relative; z-index: 1;
  display: grid; align-items: center; column-gap: 14px; row-gap: 12px;
  grid-template-columns: auto 1fr auto;
  grid-template-areas: "iconos miniatura hacer" "texto texto flecha";
}
.fae-banner-repaso__iconos { grid-area: iconos; }
.fae-banner-repaso__miniatura { grid-area: miniatura; }
.fae-banner-repaso__texto { grid-area: texto; min-width: 0; }
.fae-banner-repaso__hacer { grid-area: hacer; justify-self: end; }
.fae-banner-repaso__flecha { grid-area: flecha; justify-self: end; align-self: end; }
@media (min-width: 640px) {
  .fae-banner-repaso__rejilla {
    grid-template-columns: auto 1fr auto auto auto;
    grid-template-areas: "iconos texto miniatura hacer flecha";
    column-gap: 18px;
  }
  .fae-banner-repaso__flecha { align-self: center; }
}
@media (prefers-reduced-motion: reduce) { .fae-banner-repaso { transition: none; } }
`;

export default function BannerRepaso({ actividad, onAbrir }) {
  return (
    <button
      type="button"
      data-banner={actividad.id}
      onClick={() => onAbrir(actividad.id)}
      aria-label={`${actividad.nombre}. ${SUBTITULO_REPASO}`}
      className="fae-banner-repaso"
      style={{
        position: "relative", overflow: "hidden", isolation: "isolate",
        width: "100%", boxSizing: "border-box", textAlign: "left", cursor: "pointer",
        padding: "clamp(14px, 2.2vh, 20px) clamp(14px, 3vw, 22px)",
        borderRadius: "18px", border: "1px solid rgba(42,157,143,0.45)",
        background: FAE.navy, color: FAE.text, font: "inherit",
      }}
    >
      <style>{CSS}</style>
      <MallaAnimada manchas={MANCHAS_BANNER} fija={false} fondo={`linear-gradient(100deg, ${FAE.teal}55 0%, ${FAE.navy} 58%, ${FAE.bg} 100%)`} />
      {/* Velo hacia la derecha: el texto blanco necesita base aunque una mancha teal pase por detrás. */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", background: "linear-gradient(90deg, rgba(14,27,46,0.05) 0%, rgba(14,27,46,0.42) 100%)" }} />

      <div className="fae-banner-repaso__rejilla">
        <div className="fae-banner-repaso__iconos" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <IconoRepaso size={30} color={FAE.text} strokeWidth={2} aria-hidden="true" data-icono="reloj" />
          <span data-icono="llama" style={{ display: "block" }}>
            <IconoRacha tamano={22} />
          </span>
        </div>

        <div className="fae-banner-repaso__miniatura" style={{ width: "76px", height: "57px", borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(248,249,250,0.18)" }}>
          <GestoPasillo />
        </div>

        <div className="fae-banner-repaso__hacer">
          <ActivityBadge tipo={HACER} size="sm" />
        </div>

        <div className="fae-banner-repaso__texto">
          <h2 style={{ margin: 0, fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "clamp(21px, 2.4vw, 26px)", lineHeight: 1.15, letterSpacing: "-0.025em", color: FAE.text }}>
            {actividad.nombre}
          </h2>
          <p style={{ margin: "5px 0 0", fontSize: "13px", lineHeight: 1.45, color: "rgba(248,249,250,0.86)" }}>
            {SUBTITULO_REPASO}
          </p>
        </div>

        <span aria-hidden="true" className="fae-banner-repaso__flecha" style={{ fontSize: "22px", lineHeight: 1, color: FAE.text }}>→</span>
      </div>
    </button>
  );
}
