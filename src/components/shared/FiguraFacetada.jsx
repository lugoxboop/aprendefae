import { useState } from "react";
import { LADOS } from "./Medalla.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA FIGURA FACETADA DE LA PANTALLA DE RESUMEN — ahora SE QUEDA.
 *
 * La especificación es de Xeno (estado de reposo); las reglas de Levi mandan
 * sobre ella en el color, en la repetición y en el contraste.
 *
 *   rica     perfecto (X = N): 12 facetas —el nivel «Avanzado» del kit— y un
 *            pulso de brillo; en reposo, 45 % de opacidad.
 *   sobria   cualquier otra primera vez con puntos (exploratorias y menos del
 *            50 % incluidas): 6 facetas —el nivel «Base»—, sin pulso; en
 *            reposo, 30 %.
 *   ninguna  repetición sin puntos nuevos: no hay figura, ni en reposo (eso
 *            lo decide hacer/pantallaResumen.js).
 *
 * Un solo tono: #B8C4D4 para las facetas y blanco para el punto de luz. El
 * pulso también: Xeno lo quería con los colores de celebración en el
 * perfecto, pero Levi dejó la figura en un solo tono, y manda Levi.
 *
 * ═══════════ PARA QUE NO SE LEA COMO UNA MEDALLA ═══════════
 *
 * Las cinco diferencias de Xeno, juntas: sin anillo ni contorno (solo las
 * facetas, sin trazo en el perímetro), opacidad 30–45 %, un solo tono, nada
 * dentro (ni número ni icono) y 48 px, fuera de la escala de las medallas
 * (96 / 56 / 36 / 24).
 *
 * ═══════════ EL TIEMPO ═══════════
 *
 *      0–700 ms   crece desde un punto hasta su tamaño, con un leve giro
 *    700–900 ms   tamaño completo; en la rica, el pulso de brillo (pico a 800)
 *   900–1500 ms   baja a su opacidad de reposo… y ahí se queda
 *
 * Con movimiento reducido aparece directamente en reposo: sin crecer, sin
 * pulso, sin transición.
 *
 * aria-hidden y sin puntero. Dónde va lo decide PantallaResumen: siempre en
 * un hueco propio, nunca debajo ni encima de un texto.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const TONO = "#B8C4D4";
const BLANCO = "#FFFFFF";

export const TAMANO = 48;
export const DURACION = 1500;
export const CRECE_MS = 700;
export const PICO_MS = 800;
export const REPOSO_DESDE = 900;

export const LADOS_FIGURA = { rica: LADOS.avanzado, sobria: LADOS.base };
export const OPACIDAD_REPOSO = { rica: 0.45, sobria: 0.3 };

const pct = (ms) => `${((ms / DURACION) * 100).toFixed(2)}%`;
const CSS = `
@keyframes fae-ff-crece {
  0% { opacity: 0; transform: scale(0) rotate(-24deg); }
  8% { opacity: 1; }
  ${pct(CRECE_MS)} { opacity: 1; transform: scale(1) rotate(0deg); }
  ${pct(REPOSO_DESDE)} { opacity: 1; transform: scale(1) rotate(0deg); }
  100% { opacity: var(--fae-ff-reposo); transform: scale(1) rotate(0deg); }
}
@keyframes fae-ff-brillo {
  0%, ${pct(CRECE_MS)} { opacity: 0; }
  ${pct(PICO_MS)} { opacity: 1; }
  ${pct(REPOSO_DESDE)}, 100% { opacity: 0; }
}
.fae-ff { display: block; pointer-events: none; overflow: visible; }
.fae-ff-cuerpo { transform-origin: 50px 50px; transform-box: view-box; }
@media (prefers-reduced-motion: reduce) { .fae-ff, .fae-ff * { animation: none !important; } }
`;

const reducidoAhora = () => {
  try { return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches); } catch { return false; }
};

/* Los vértices, con la punta arriba, igual que en Medalla.jsx. */
const vertices = (n, r) => Array.from({ length: n }, (_, i) => {
  const a = (i / n) * Math.PI * 2 - Math.PI / 2;
  return { x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a) };
});

export default function FiguraFacetada({ nivel, tamano = TAMANO }) {
  const [reducido] = useState(reducidoAhora);
  if (!nivel) return null;

  const rica = nivel === "rica";
  const n = LADOS_FIGURA[nivel];
  const reposo = OPACIDAD_REPOSO[nivel];
  /* `both`: al terminar se queda en el último fotograma, que es el reposo. */
  const anim = (nombre, curva) => (reducido ? undefined : `${nombre} ${DURACION}ms ${curva} both`);
  const trazo = (px) => ({ strokeWidth: px, vectorEffect: "non-scaling-stroke" });
  const vs = vertices(n, 46);

  return (
    <svg
      className="fae-ff"
      data-figura-facetada={nivel}
      data-reducido={reducido ? "si" : "no"}
      data-reposo={reposo}
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
      width={tamano}
      height={tamano}
      style={{ width: `${tamano}px`, height: `${tamano}px`, "--fae-ff-reposo": reposo }}
    >
      <style>{CSS}</style>
      {rica && (
        <defs>
          <radialGradient id="fae-ff-brillo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={BLANCO} stopOpacity="0.8" />
            <stop offset="60%" stopColor={TONO} stopOpacity="0.3" />
            <stop offset="100%" stopColor={TONO} stopOpacity="0" />
          </radialGradient>
        </defs>
      )}
      {/* Con movimiento reducido no hay animación: la opacidad de reposo, ya. */}
      <g
        className="fae-ff-cuerpo"
        style={reducido ? { opacity: reposo } : { animation: anim("fae-ff-crece", "cubic-bezier(.3,.9,.4,1)") }}
      >
        {/* Las facetas, una sí y una no, sin trazo: no se cierra ninguna silueta. */}
        {vs.map((v, i) => {
          const w = vs[(i + 1) % n];
          return (
            <polygon
              key={i}
              data-faceta
              points={`50,50 ${v.x.toFixed(2)},${v.y.toFixed(2)} ${w.x.toFixed(2)},${w.y.toFixed(2)}`}
              fill={TONO}
              fillOpacity={i % 2 ? 0.5 : 0}
              stroke="none"
            />
          );
        })}
        {/* Las aristas, del centro a cada vértice. */}
        {vs.map((v, i) => (
          <line key={i} data-arista x1="50" y1="50" x2={v.x.toFixed(2)} y2={v.y.toFixed(2)} stroke={TONO} style={trazo(1)} />
        ))}
        {/* El punto de luz, en blanco. */}
        <circle data-luz cx="50" cy="50" r="5" fill={BLANCO} />

        {/* El pulso, solo en la rica y nunca con movimiento reducido. */}
        {rica && !reducido && (
          <circle
            data-destello
            cx="50"
            cy="50"
            r="50"
            fill="url(#fae-ff-brillo)"
            style={{ opacity: 0, animation: anim("fae-ff-brillo", "linear") }}
          />
        )}
      </g>
    </svg>
  );
}
