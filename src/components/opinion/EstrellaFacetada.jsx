/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA ESTRELLA FACETADA
 *
 * Mateo las pidió «estéticas a la página, con iluminación, con su mantra
 * geométrico». El mantra ya existe y está escrito en FiguraFacetada.jsx: una
 * silueta sin contorno, partida en triángulos desde el centro, con una faceta
 * sí y otra no rellena, las aristas del centro a cada punta y un solo tono.
 * Esta estrella es esa misma gramática aplicada a cinco puntas, no un icono
 * de librería con un filtro de brillo encima — eso habría sido una estrella
 * de otro sitio puesta en el nuestro.
 *
 * ═══════════ CÓMO SE DIBUJA ═══════════
 *
 * Diez vértices alternando radio largo y corto. El corto va al 0,42 del
 * largo: es la proporción en la que una estrella de cinco puntas se lee como
 * estrella y no como flor (más alto) ni como aspa (más bajo). De ahí salen
 * diez triángulos centro-vértice-vértice, rellenos uno sí y uno no, y cinco
 * aristas del centro a cada punta.
 *
 * ═══════════ LA ILUMINACIÓN ═══════════
 *
 * Apagada es del gris de la casa y casi no pesa. Encendida se rellena de teal
 * y se le pone DETRÁS un resplandor radial —el mismo recurso que el pulso de
 * la figura facetada— que florece y se queda a media luz. El resplandor va en
 * su propio círculo y no en un filtro de desenfoque: un filtro SVG obliga al
 * navegador a rasterizar en cada cuadro y cinco de ellos en un teléfono se
 * notan; un degradado radial no cuesta nada.
 *
 * El encendido entra escalonado, 45 ms por estrella, así que tocar la cuarta
 * no enciende cuatro luces a la vez sino una detrás de otra, de izquierda a
 * derecha. Es lo que hace que se lea como «cuatro» y no como «un bloque».
 *
 * Con movimiento reducido no hay flor ni escalón: la estrella aparece
 * encendida, con su resplandor a media luz, y ya.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const TONO_APAGADO = "#B8C4D4";
export const TEAL = "#2A9D8F";

/* Lo que tarda una estrella en encenderse, y el escalón entre hermanas. */
export const ENCENDIDO_MS = 420;
export const ESCALON_MS = 45;

const PUNTAS = 5;
const RADIO_LARGO = 46;
const RADIO_CORTO = RADIO_LARGO * 0.42;

export const CSS_ESTRELLA = `
.fae-es { display: block; overflow: visible; }
.fae-es-cuerpo { transform-origin: 50px 50px; transform-box: view-box; }
.fae-es[data-encendida="si"] .fae-es-cuerpo {
  animation: fae-es-late ${ENCENDIDO_MS}ms cubic-bezier(.3,.9,.4,1) var(--fae-es-esp, 0ms) both;
}
.fae-es[data-encendida="si"] .fae-es-luz {
  animation: fae-es-florece ${ENCENDIDO_MS}ms cubic-bezier(.3,.9,.4,1) var(--fae-es-esp, 0ms) both;
}
@keyframes fae-es-late {
  0%   { transform: scale(1) rotate(0deg); }
  45%  { transform: scale(1.16) rotate(-5deg); }
  100% { transform: scale(1) rotate(0deg); }
}
@keyframes fae-es-florece {
  0%   { opacity: 0; transform: scale(0.5); }
  45%  { opacity: 1; transform: scale(1.12); }
  100% { opacity: 0.55; transform: scale(1); }
}
/*
 * Movimiento reducido: la estrella no late ni la luz florece. Queda encendida
 * y el resplandor, puesto. Quien pide menos movimiento no pide menos
 * información.
 */
@media (prefers-reduced-motion: reduce) {
  .fae-es[data-encendida="si"] .fae-es-cuerpo { animation: none; }
  .fae-es[data-encendida="si"] .fae-es-luz { animation: none; opacity: 0.55; }
}
`;

/* Los diez vértices, con la punta arriba. */
export function vertices() {
  return Array.from({ length: PUNTAS * 2 }, (_, i) => {
    const r = i % 2 === 0 ? RADIO_LARGO : RADIO_CORTO;
    const a = (i / (PUNTAS * 2)) * Math.PI * 2 - Math.PI / 2;
    return { x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a), punta: i % 2 === 0 };
  });
}

export default function EstrellaFacetada({ encendida = false, tamano = 30, orden = 0, id = "es" }) {
  const vs = vertices();
  const n = vs.length;
  const tono = encendida ? TEAL : TONO_APAGADO;
  /*
   * Dos pesos, no tres. Hubo un estado «tenue» para el ensayo bajo el dedo;
   * se quitó al hacer la estrella corregible: ahora pasar por encima enseña
   * el valor NUEVO encendido del todo, que es lo único que muestra bien una
   * corrección a la baja —con un tercer peso, bajar de cuatro a dos dejaba
   * las dos de arriba encendidas y el ensayo no se entendía—.
   *
   * Apagada va a 0,5 y no a 0,3, que es lo que vale la figura del resumen.
   * Medido sobre el fondo de la tarjeta: a 0,3 la faceta fuerte daba 1,96:1 y
   * WCAG pide 3:1 para lo que se puede tocar. A 0,5 da 3,11:1. La figura del
   * resumen puede quedarse en 0,3 porque es un adorno que nadie pulsa; esto
   * es un control, y un control que no se ve no se usa.
   */
  const opacidadBase = encendida ? 1 : 0.5;
  const idLuz = `fae-es-luz-${id}`;

  return (
    <svg
      className="fae-es"
      data-estrella
      data-encendida={encendida ? "si" : "no"}
      viewBox="0 0 100 100"
      width={tamano}
      height={tamano}
      aria-hidden="true"
      focusable="false"
      style={{ width: `${tamano}px`, height: `${tamano}px`, "--fae-es-esp": `${orden * ESCALON_MS}ms` }}
    >
      <defs>
        <radialGradient id={idLuz} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="45%" stopColor={TEAL} stopOpacity="0.38" />
          <stop offset="100%" stopColor={TEAL} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* El resplandor, DETRÁS del cuerpo y solo cuando está encendida. */}
      {encendida && (
        <circle className="fae-es-luz" cx="50" cy="50" r="48" fill={`url(#${idLuz})`} style={{ transformOrigin: "50px 50px", transformBox: "view-box" }} />
      )}

      <g className="fae-es-cuerpo" style={{ opacity: opacidadBase }}>
        {/* Las facetas: una sí y una no, sin contorno — no se cierra la silueta. */}
        {vs.map((v, i) => {
          const w = vs[(i + 1) % n];
          return (
            <polygon
              key={i}
              data-faceta
              points={`50,50 ${v.x.toFixed(2)},${v.y.toFixed(2)} ${w.x.toFixed(2)},${w.y.toFixed(2)}`}
              fill={tono}
              fillOpacity={i % 2 ? 0.95 : 0.42}
              stroke="none"
            />
          );
        })}
        {/* Las aristas, del centro a cada punta. Solo a las puntas largas: a
            los valles también sería una telaraña. */}
        {vs.filter((v) => v.punta).map((v, i) => (
          <line
            key={i}
            data-arista
            x1="50" y1="50" x2={v.x.toFixed(2)} y2={v.y.toFixed(2)}
            stroke={tono}
            strokeOpacity={encendida ? 0.8 : 0.5}
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
    </svg>
  );
}
