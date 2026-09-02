import { razon, VISUAL_ALTO } from "./visual.js";

/*
 * Inversión: una pila de billetes que sube y baja.
 *
 * Los billetes tienen sitio fijo y solo cambian de estado, igual que los
 * productos de la canasta: al bajar el fader se apagan desde arriba, así que
 * "deshacer" no necesita lógica propia — es el mismo cálculo al revés.
 *
 * El billete que entra viene desde un poco más arriba y baja hasta su sitio.
 * Eso es lo que hace que la pila se lea como algo que se apila, y no como una
 * barra que crece.
 */

const TOTAL = 10;
const BASE_Y = 100;      // borde inferior del billete de más abajo
const ALTO = 10;         // alto de cada billete
const PASO = 8.4;        // cuánto sube cada billete respecto al anterior
const ANCHO = 104;

/* Desplazamiento lateral alterno: una pila real nunca queda perfectamente a plomo. */
const LADEO = [0, 3, -2, 4, -3, 1, -4, 2, -1, 3];

function Billete({ i, visible, accent }) {
  const y = BASE_Y - ALTO - i * PASO;
  const x = (200 - ANCHO) / 2 + LADEO[i % LADEO.length];
  return (
    <g
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-14px)",
        transition: `opacity 220ms ease ${i * 18}ms, transform 300ms cubic-bezier(0.2,0.8,0.3,1) ${i * 18}ms`,
      }}
    >
      <rect x={x} y={y} width={ANCHO} height={ALTO} rx="2.5" fill="rgba(248,249,250,0.10)" stroke={accent} strokeWidth="1.6" />
      {/* Banda central: distingue un billete de un rectángulo cualquiera. */}
      <rect x={x + ANCHO / 2 - 9} y={y + 2.4} width="18" height={ALTO - 4.8} rx="1.6" fill={accent} opacity="0.55" />
      <line x1={x + 7} y1={y + ALTO / 2} x2={x + ANCHO / 2 - 14} y2={y + ALTO / 2} stroke={accent} strokeWidth="1.2" opacity="0.5" />
      <line x1={x + ANCHO / 2 + 14} y1={y + ALTO / 2} x2={x + ANCHO - 7} y2={y + ALTO / 2} stroke={accent} strokeWidth="1.2" opacity="0.5" />
    </g>
  );
}

export default function PilaBilletes({ valor, min, max, accent }) {
  const r = razon(valor, min, max);
  const cuantos = Math.round(r * TOTAL);

  return (
    <svg
      viewBox="0 0 200 120"
      width="100%"
      height={VISUAL_ALTO}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Pila de ${cuantos} de ${TOTAL} billetes`}
      style={{ display: "block" }}
    >
      {/* Suelo: da referencia de dónde se apoya la pila. */}
      <line x1="34" y1="101" x2="166" y2="101" stroke="rgba(248,249,250,0.28)" strokeWidth="2" strokeLinecap="round" />

      {Array.from({ length: TOTAL }, (_, i) => (
        <Billete key={i} i={i} visible={i < cuantos} accent={accent} />
      ))}
    </svg>
  );
}
