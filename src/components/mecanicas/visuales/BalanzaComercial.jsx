import { VISUAL_ALTO } from "./visual.js";

/*
 * Exportaciones netas: una balanza de dos platos.
 *
 * A la izquierda lo que Colombia vende afuera, a la derecha lo que compra. La
 * balanza se inclina hacia el lado más pesado, que es exactamente lo que dice
 * la balanza comercial — el nombre del concepto ya era este dibujo.
 *
 * Va en los dos sentidos sin lógica añadida: una balanza se inclina a ambos
 * lados por su propia naturaleza, así que basta con que el ángulo tenga signo.
 */

const FULCRO = { x: 100, y: 36 };
const BRAZO = 62;
const ANGULO_MAX = 15;   // grados; más se ve caricaturesco
const CUERDA = 13;
const PLATO = 34;

/* Rotación del punto (dx,0) alrededor del fulcro, con la y hacia abajo del SVG. */
function extremo(dx, gradosNeg) {
  const t = (gradosNeg * Math.PI) / 180;
  return { x: FULCRO.x + dx * Math.cos(t), y: FULCRO.y + dx * Math.sin(t) };
}

function Plato({ p, color, transicion }) {
  return (
    <g style={{ transition: transicion }}>
      <line x1={p.x} y1={p.y} x2={p.x} y2={p.y + CUERDA} stroke="rgba(248,249,250,0.5)" strokeWidth="1.6" />
      <path
        d={`M ${p.x - PLATO / 2} ${p.y + CUERDA} L ${p.x + PLATO / 2} ${p.y + CUERDA} L ${p.x + PLATO / 2 - 5} ${p.y + CUERDA + 8} L ${p.x - PLATO / 2 + 5} ${p.y + CUERDA + 8} Z`}
        fill="rgba(248,249,250,0.10)"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </g>
  );
}

/**
 * @param {number} inclinacion  -1 (compra más) .. 0 (equilibrio) .. +1 (vende más)
 */
export default function BalanzaComercial({ inclinacion, accent, teal, coral }) {
  const t = Math.max(-1, Math.min(1, inclinacion));
  /* Positivo = vende más = el plato izquierdo baja = el brazo gira antihorario. */
  const grados = -t * ANGULO_MAX;
  const izq = extremo(-BRAZO, grados);
  const der = extremo(BRAZO, grados);
  const transicion = "all 380ms cubic-bezier(0.2,0.8,0.3,1)";

  const etiqueta = {
    fontFamily: "Inter, sans-serif",
    fontSize: "9.5px",
    fill: "rgba(248,249,250,0.62)",
  };

  return (
    <svg
      viewBox="0 0 200 120"
      width="100%"
      height={VISUAL_ALTO}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={
        t > 0.03 ? "Balanza inclinada hacia lo que Colombia vende afuera"
        : t < -0.03 ? "Balanza inclinada hacia lo que Colombia compra afuera"
        : "Balanza comercial equilibrada"
      }
      style={{ display: "block" }}
    >
      {/* Columna y base. */}
      <line x1={FULCRO.x} y1={FULCRO.y} x2={FULCRO.x} y2="96" stroke="rgba(248,249,250,0.45)" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M 82 104 L 118 104 L 112 96 L 88 96 Z" fill="rgba(248,249,250,0.13)" stroke="rgba(248,249,250,0.45)" strokeWidth="2" strokeLinejoin="round" />

      {/* Brazo. */}
      <line
        x1={izq.x} y1={izq.y} x2={der.x} y2={der.y}
        stroke={accent} strokeWidth="3" strokeLinecap="round"
        style={{ transition: transicion }}
      />
      <circle cx={FULCRO.x} cy={FULCRO.y} r="4.5" fill={accent} />

      {/* Platos: teal lo que se vende, coral lo que se compra — los mismos
          acentos que el resto del sitio usa para "a favor" y "en contra". */}
      <Plato p={izq} color={teal} transicion={transicion} />
      <Plato p={der} color={coral} transicion={transicion} />

      <text x="34" y="116" textAnchor="middle" style={etiqueta}>vende afuera</text>
      <text x="166" y="116" textAnchor="middle" style={etiqueta}>compra afuera</text>
    </svg>
  );
}
