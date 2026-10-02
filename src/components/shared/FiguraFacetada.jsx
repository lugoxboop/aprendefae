import { useEffect, useState } from "react";
import { poligono, LADOS } from "./Medalla.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA FIGURA FACETADA DE LA PANTALLA DE RESUMEN.
 *
 * La especificación es de Xeno; las correcciones de Levi mandan sobre ella en
 * el color, en la repetición y en el contraste.
 *
 * NO ES UN LENGUAJE NUEVO: es el marco facetado del kit de medallas, la misma
 * geometría (`poligono` y `LADOS` de Medalla.jsx) y la misma escala.
 *
 *   rica     el marco Élite —14 facetas y anillo reticulado— con UN pulso de
 *            brillo. Solo para el perfecto (X = N).
 *   sobria   el marco Intermedio —8 lados, anillo interior y nodos—, sin
 *            pulso. Cualquier otra primera vez con puntos, exploratorias y
 *            menos del 50 % incluidas.
 *   ninguna  repetición sin puntos nuevos (eso lo decide hacer/pantallaResumen.js).
 *
 * Un solo tono: #B8C4D4 con blanco, y ningún otro color.
 *
 * ═══════════ DÓNDE VIVE ═══════════
 *
 * Detrás de la tarjeta «Puntos ganados», centrada en ella. La tarjeta tiene su
 * propio fondo sólido por encima: el contraste de su texto no depende de la
 * figura. La pinta PantallaResumen.
 *
 * EL DIÁMETRO NO ES FIJO. Xeno pide ~260 px, pero a 375 px entre la tarjeta y
 * el título —y entre la tarjeta y el recuadro— no caben: la figura los
 * cruzaba y el texto caía a 1,4:1 en el pico. Con la regla de Levi («si no se
 * cumple, reduce el tamaño»), PantallaResumen mide el espacio que hay y le
 * pasa el mayor diámetro que no toca ningún texto fuera de las tarjetas, con
 * 260 como tope.
 *
 * ═══════════ EL TIEMPO: UNA SOLA PASADA DE 1,5 s ═══════════
 *
 *      0–700 ms   crece desde un punto hasta su tamaño, con un leve giro
 *    700–900 ms   tamaño completo; en la rica, el pulso de brillo (pico a 800)
 *   900–1500 ms   se desvanece
 *
 * Luego se desmonta: la pantalla queda en su estado de siempre. Con
 * movimiento reducido aparece directamente en su estado final, sin pulso,
 * los mismos 1,5 s, y desaparece sin transición.
 *
 * aria-hidden y sin puntero: los botones funcionan desde el primer instante.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const TONO = "#B8C4D4";
const BLANCO = "#FFFFFF";

export const DURACION = 1500;
export const CRECE_MS = 700;
export const PICO_MS = 800;
export const DESVANECE_DESDE = 900;
export const REDUCIDO_MS = 1500;
/* Diámetro máximo en pantalla (Xeno: ~260 px). */
export const TAMANO = 260;

export const LADOS_FIGURA = { rica: LADOS.elite, sobria: LADOS.intermedio };

const pct = (ms) => `${((ms / DURACION) * 100).toFixed(2)}%`;
const CSS = `
@keyframes fae-ff-crece {
  0% { opacity: 0; transform: scale(0) rotate(-24deg); }
  8% { opacity: 1; }
  ${pct(CRECE_MS)} { opacity: 1; transform: scale(1) rotate(0deg); }
  ${pct(DESVANECE_DESDE)} { opacity: 1; transform: scale(1) rotate(0deg); }
  100% { opacity: 0; transform: scale(1) rotate(0deg); }
}
@keyframes fae-ff-brillo {
  0%, ${pct(CRECE_MS)} { opacity: 0; }
  ${pct(PICO_MS)} { opacity: 1; }
  ${pct(DESVANECE_DESDE)}, 100% { opacity: 0; }
}
.fae-ff { position: absolute; left: 50%; top: 50%; pointer-events: none; z-index: -1; overflow: visible; }
.fae-ff-cuerpo { transform-origin: 50px 50px; transform-box: view-box; }
@media (prefers-reduced-motion: reduce) { .fae-ff, .fae-ff * { animation: none !important; } }
`;

const reducidoAhora = () => {
  try { return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches); } catch { return false; }
};

/* Los vértices sueltos, con la punta arriba, igual que en Medalla.jsx. */
const vertices = (n, r) => Array.from({ length: n }, (_, i) => {
  const a = (i / n) * Math.PI * 2 - Math.PI / 2;
  return { x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a) };
});

export default function FiguraFacetada({ nivel, tamano = TAMANO }) {
  const [viva, setViva] = useState(Boolean(nivel));
  const [reducido] = useState(reducidoAhora);

  useEffect(() => {
    if (!nivel) return undefined;
    const t = setTimeout(() => setViva(false), reducido ? REDUCIDO_MS : DURACION);
    return () => clearTimeout(t);
  }, [nivel, reducido]);

  if (!nivel || !viva) return null;

  const rica = nivel === "rica";
  const n = LADOS_FIGURA[nivel];
  const anim = (nombre) => (reducido ? undefined : `${nombre} ${DURACION}ms cubic-bezier(.3,.9,.4,1) both`);
  /* Trazos fijos en píxeles: el lienzo de la medalla (100) se dibuja aquí a 260. */
  const trazo = (px) => ({ strokeWidth: px, vectorEffect: "non-scaling-stroke" });

  return (
    <svg
      className="fae-ff"
      data-figura-facetada={nivel}
      data-reducido={reducido ? "si" : "no"}
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
      width={tamano}
      height={tamano}
      style={{ width: `${tamano}px`, height: `${tamano}px`, margin: `-${tamano / 2}px 0 0 -${tamano / 2}px` }}
    >
      <style>{CSS}</style>
      <defs>
        <radialGradient id={`fae-ff-resplandor-${nivel}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={TONO} stopOpacity={rica ? 0.3 : 0.2} />
          <stop offset="100%" stopColor={TONO} stopOpacity="0" />
        </radialGradient>
        {rica && (
          <>
            <linearGradient id="fae-ff-relleno" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={BLANCO} stopOpacity="0.22" />
              <stop offset="100%" stopColor={TONO} stopOpacity="0.08" />
            </linearGradient>
            <radialGradient id="fae-ff-brillo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={BLANCO} stopOpacity="0.7" />
              <stop offset="60%" stopColor={TONO} stopOpacity="0.25" />
              <stop offset="100%" stopColor={TONO} stopOpacity="0" />
            </radialGradient>
          </>
        )}
      </defs>
      <g className="fae-ff-cuerpo" style={{ animation: anim("fae-ff-crece") }}>
        {/* El resplandor que emana detrás de la tarjeta. */}
        <circle cx="50" cy="50" r="50" fill={`url(#fae-ff-resplandor-${nivel})`} />

        {/* Élite: el anillo reticulado exterior, con sus radios desde el centro. */}
        {rica && (
          <g data-reticulado stroke={TONO} fill="none" opacity="0.6">
            <polygon points={poligono(n, 45)} style={trazo(1)} />
            {vertices(n, 45).map((v, i) => (
              <line key={i} x1="50" y1="50" x2={v.x} y2={v.y} opacity="0.5" style={trazo(0.8)} />
            ))}
          </g>
        )}

        {/* Las facetas, desde el centro, alternando como en el resto del kit. */}
        {vertices(n, rica ? 38 : 40).map((v, i, vs) => {
          const w = vs[(i + 1) % n];
          return (
            <polygon
              key={i}
              data-faceta
              points={`50,50 ${v.x.toFixed(2)},${v.y.toFixed(2)} ${w.x.toFixed(2)},${w.y.toFixed(2)}`}
              fill={rica ? "url(#fae-ff-relleno)" : TONO}
              fillOpacity={rica ? 1 : (i % 2 ? 0.12 : 0.04)}
            />
          );
        })}

        {/* El marco. */}
        <polygon
          points={poligono(n, rica ? 38 : 40)}
          fill="none"
          stroke={TONO}
          strokeLinejoin="round"
          style={trazo(rica ? 2.4 : 2)}
        />
        {/* Anillo interior con relieve. */}
        <polygon points={poligono(n, rica ? 31 : 33)} fill="none" stroke={BLANCO} opacity="0.45" style={trazo(1)} />
        {/* Los nodos, como en el Intermedio de las medallas. */}
        {!rica && vertices(n, 40).map((v, i) => (
          <circle key={i} data-nodo-figura cx={v.x} cy={v.y} r="1.6" fill={TONO} />
        ))}

        {/* El pulso, solo en la rica y nunca con movimiento reducido. */}
        {rica && !reducido && (
          <circle
            data-destello
            cx="50"
            cy="50"
            r="46"
            fill="url(#fae-ff-brillo)"
            style={{ opacity: 0, animation: `fae-ff-brillo ${DURACION}ms linear both` }}
          />
        )}
      </g>
    </svg>
  );
}
