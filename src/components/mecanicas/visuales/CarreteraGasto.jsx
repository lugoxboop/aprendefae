import { razon, VISUAL_ALTO } from "./visual.js";

/*
 * Gasto público: una carretera que se pavimenta.
 *
 * Más gasto, más tramo pavimentado; menos gasto, la obra se retira y vuelve a
 * quedar terreno sin pavimentar. El frente de obra —la valla— viaja con el
 * borde del asfalto, que es lo que hace visible en qué punto está el gasto sin
 * mirar la cifra.
 *
 * La reversibilidad sale sola: el ancho del asfalto es una función del valor,
 * no una acumulación.
 */

const X0 = 16;
const X1 = 184;
const LARGO = X1 - X0;
const Y = 54;
const ALTO = 34;

export default function CarreteraGasto({ valor, min, max, accent }) {
  const r = razon(valor, min, max);
  const pavimentado = LARGO * r;
  const frente = X0 + pavimentado;
  const porcentaje = Math.round(r * 100);

  const transicion = "all 320ms cubic-bezier(0.2,0.8,0.3,1)";

  return (
    <svg
      viewBox="0 0 200 120"
      width="100%"
      height={VISUAL_ALTO}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Carretera pavimentada al ${porcentaje} por ciento`}
      style={{ display: "block" }}
    >
      {/* Terreno sin pavimentar: el trazado completo, en hueco. */}
      <rect
        x={X0}
        y={Y}
        width={LARGO}
        height={ALTO}
        rx="3"
        fill="rgba(248,249,250,0.04)"
        stroke="rgba(248,249,250,0.22)"
        strokeWidth="1.6"
        strokeDasharray="5 5"
      />

      {/* Asfalto: lo único que cambia de tamaño. */}
      <rect
        x={X0}
        y={Y}
        width={pavimentado}
        height={ALTO}
        rx="3"
        fill="rgba(248,249,250,0.13)"
        stroke={accent}
        strokeWidth="2"
        style={{ transition: transicion }}
      />

      {/*
        Línea central discontinua, recortada al asfalto. Se recorta con un
        clipPath en vez de calcular cuántas rayas caben: así el corte cae donde
        toca aunque el tramo termine a mitad de raya.
      */}
      <defs>
        <clipPath id="gasto-asfalto">
          <rect x={X0} y={Y} width={pavimentado} height={ALTO} style={{ transition: transicion }} />
        </clipPath>
      </defs>
      <line
        x1={X0 + 6}
        y1={Y + ALTO / 2}
        x2={X1 - 6}
        y2={Y + ALTO / 2}
        stroke="rgba(248,249,250,0.75)"
        strokeWidth="2.2"
        strokeDasharray="11 9"
        strokeLinecap="round"
        clipPath="url(#gasto-asfalto)"
      />

      {/* Frente de obra: valla y poste, en el borde exacto del asfalto. */}
      <g style={{ transition: transicion }} transform={`translate(${frente}, 0)`}>
        <line x1="0" y1={Y - 9} x2="0" y2={Y + ALTO + 9} stroke={accent} strokeWidth="2.4" strokeLinecap="round" />
        <rect x="-9" y={Y - 22} width="18" height="11" rx="2" fill={accent} />
        <line x1="-5" y1={Y - 19} x2="5" y2={Y - 14} stroke="#0F1B2E" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Extremos del trazado: de dónde sale y hasta dónde podría llegar. */}
      <line x1={X0} y1={Y - 6} x2={X0} y2={Y + ALTO + 6} stroke="rgba(248,249,250,0.4)" strokeWidth="2" strokeLinecap="round" />
      <line x1={X1} y1={Y - 6} x2={X1} y2={Y + ALTO + 6} stroke="rgba(248,249,250,0.2)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
