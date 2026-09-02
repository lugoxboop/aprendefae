import { useState, useEffect } from "react";
import { FAE } from "../../theme.js";

/*
 * Corte de iceberg. Se comparte entre las mecánicas del tema: "Buceo
 * progresivo" lo revela por exploración libre y "De arriba hacia abajo" lo
 * revela al acertar cada pregunta. El dibujo es el mismo; lo que cambia es
 * quién decide `depth`.
 *
 * Dos proporciones del mismo dibujo:
 *
 *   retrato   440×700. Columna estrecha y alta. Va bien en teléfono, donde el
 *             ancho manda, pero en escritorio se vuelve larguísimo.
 *   apaisado  700×460. Hielo a la izquierda y tarjetas anchas a la derecha.
 *             Cabe entero en una pantalla de escritorio sin encoger el texto.
 *
 * La forma apaisada existe porque encoger el retrato para que quepa dejaba el
 * texto de las tarjetas en ~9px: el gráfico entraba, pero ya no se podía leer,
 * que era justamente el punto de la mecánica.
 *
 * `responsivo` deja elegir esa alternancia. Por defecto se queda en retrato,
 * para no alterar a quien ya lo usaba así.
 */

/*
 * Retrato comprimido a 540 de alto (antes 700). Con preserveAspectRatio la
 * escala del dibujo es la MENOR entre ancho y alto disponibles, así que en un
 * teléfono mandaba el alto y el texto caía a ~7px. Menos alto en el viewBox =
 * más escala para el mismo hueco en pantalla.
 */
const RETRATO = {
  id: "retrato",
  W: 380,
  H: 540,
  waterline: 130,
  cardX: 130,
  cardW: 240,
  cardH: 96,
  cardCY: [70, 200, 330, 462],
  hieloBorde: 112,
  hielo: "M58 28 L100 130 L115 330 L106 505 Q58 534 12 505 L3 330 L18 130 Z",
  bandas: [
    { y: 130, h: 137, fill: "rgba(20,52,86,0.42)" },
    { y: 267, h: 137, fill: "rgba(15,40,68,0.58)" },
    { y: 404, h: 136, fill: "rgba(10,28,50,0.72)" },
  ],
  etiquetaDY: 24,
  textoDY: 48,
  interlinea: 20,
  fuenteTexto: 14.5,
  multilinea: true,
};

const APAISADO = {
  id: "apaisado",
  W: 700,
  H: 460,
  waterline: 120,
  cardX: 185,
  cardW: 490,
  cardH: 88,
  cardCY: [68, 178, 288, 396],
  hieloBorde: 158,
  hielo: "M85 22 L140 120 L158 300 L148 420 Q85 448 22 420 L12 300 L30 120 Z",
  bandas: [
    { y: 120, h: 110, fill: "rgba(20,52,86,0.42)" },
    { y: 230, h: 110, fill: "rgba(15,40,68,0.58)" },
    { y: 340, h: 120, fill: "rgba(10,28,50,0.72)" },
  ],
  etiquetaDY: 26,
  textoDY: 58,
  interlinea: 21,
  fuenteTexto: 16,
  multilinea: false,
};

const CONSULTA_ANCHA = "(min-width: 700px)";

/*
 * Se escucha matchMedia y no el evento resize: resize no siempre llega cuando
 * el viewport cambia por emulación o por rotación, y quedarse en la proporción
 * equivocada deja el texto de las tarjetas ilegible.
 */
function useProporcion(responsivo) {
  const elegir = () =>
    responsivo && typeof window !== "undefined" && window.matchMedia(CONSULTA_ANCHA).matches
      ? APAISADO
      : RETRATO;

  const [prop, setProp] = useState(elegir);

  useEffect(() => {
    if (!responsivo) return;
    const mql = window.matchMedia(CONSULTA_ANCHA);
    const aplicar = () => setProp(mql.matches ? APAISADO : RETRATO);
    aplicar(); // por si el ancho cambió entre el primer render y este efecto
    mql.addEventListener("change", aplicar);
    return () => mql.removeEventListener("change", aplicar);
  }, [responsivo]);

  return prop;
}

export default function IcebergDiagram({ levels, depth, responsivo = false, style }) {
  const L = useProporcion(responsivo);

  return (
    <svg
      viewBox={`0 0 ${L.W} ${L.H}`}
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Corte de un iceberg con ${Math.min(depth + 1, levels.length)} de ${levels.length} niveles revelados`}
      style={{ display: "block", height: "auto", ...style }}
    >
      {L.bandas.map((b, i) => (
        <rect key={i} x="0" y={b.y} width={L.W} height={b.h} fill={b.fill} />
      ))}

      {/* masa de hielo: punta estrecha sobre el agua, cuerpo que ensancha al bajar */}
      <path
        d={L.hielo}
        fill="rgba(203,220,242,0.13)"
        stroke="rgba(203,220,242,0.28)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* línea de flotación: separa lo visible de lo sumergido */}
      <line x1="0" y1={L.waterline} x2={L.W} y2={L.waterline} stroke="rgba(203,220,242,0.5)" strokeWidth="1.5" strokeDasharray="6 5" />
      <text x="6" y={L.waterline - 8} fontSize="12" fill="rgba(203,220,242,0.6)" fontFamily="Inter, sans-serif">
        lo que se ve
      </text>
      <text x="6" y={L.waterline + 20} fontSize="12" fill="rgba(203,220,242,0.45)" fontFamily="Inter, sans-serif">
        lo que no
      </text>

      {levels.map((lvl, i) => {
        const revealed = i <= depth;
        const cy = L.cardCY[i];
        const y = cy - L.cardH / 2;
        return (
          <g key={lvl.name}>
            {/* conector con el nivel anterior: la cadena causal se ve */}
            {i > 0 && revealed && (
              <line
                x1={L.cardX + L.cardW / 2}
                y1={L.cardCY[i - 1] + L.cardH / 2 + 4}
                x2={L.cardX + L.cardW / 2}
                y2={y - 8}
                stroke={FAE.teal}
                strokeWidth="2"
                markerEnd="url(#ice-arrow)"
              />
            )}
            {revealed && (
              <line x1={L.hieloBorde} y1={cy} x2={L.cardX - 6} y2={cy} stroke="rgba(203,220,242,0.28)" strokeWidth="1.2" strokeDasharray="3 4" />
            )}

            <rect
              x={L.cardX}
              y={y}
              width={L.cardW}
              height={L.cardH}
              rx="14"
              fill={revealed ? "rgba(248,249,250,0.07)" : "rgba(248,249,250,0.02)"}
              stroke={revealed ? "rgba(248,249,250,0.22)" : "rgba(248,249,250,0.12)"}
              strokeWidth="1.4"
              strokeDasharray={revealed ? "none" : "5 5"}
            />

            {revealed ? (
              <>
                <text x={L.cardX + 16} y={y + L.etiquetaDY} fontSize="12.5" fontWeight="700" fill={FAE.teal}
                  fontFamily="Sora, sans-serif" letterSpacing="0.06em">
                  {lvl.name.toUpperCase()}
                </text>
                {/*
                  En apaisado la tarjeta es ancha y el texto entra en una línea;
                  en retrato se usa el corte por líneas de cada nivel.
                */}
                {(L.multilinea ? lvl.lines : [lvl.text ?? lvl.lines.join(" ")]).map((line, li) => (
                  <text
                    key={li}
                    x={L.cardX + 16}
                    y={y + L.textoDY + li * L.interlinea}
                    fontSize={L.fuenteTexto}
                    fill={FAE.text}
                    fontFamily="Inter, sans-serif"
                  >
                    {line}
                  </text>
                ))}
              </>
            ) : (
              <text x={L.cardX + L.cardW / 2} y={cy + 6} textAnchor="middle" fontSize="20"
                fill="rgba(248,249,250,0.28)" fontFamily="Inter, sans-serif" letterSpacing="0.3em">
                ···
              </text>
            )}
          </g>
        );
      })}

      <defs>
        <marker id="ice-arrow" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="11" markerHeight="11"
          orient="auto-start-reverse" markerUnits="userSpaceOnUse">
          <path d="M 1 1 L 11 6 L 1 11 z" fill={FAE.teal} />
        </marker>
      </defs>
    </svg>
  );
}
