import { razon, VISUAL_ALTO } from "./visual.js";

/*
 * Consumo: una canasta que se llena y se vacía.
 *
 * El número dice "$3.120.000" y no significa nada a los 19 años. Doce productos
 * que aparecen y desaparecen sí: se ve de un vistazo si el consumo subió o bajó,
 * y cuánto, sin leer la cifra.
 *
 * Cada producto tiene su sitio fijo; lo único que cambia es si está o no. Así el
 * movimiento es reversible por construcción —bajar el fader los apaga en orden
 * inverso— sin lógica aparte para "deshacer".
 */

/* Doce huecos en dos filas, dentro del hueco de la canasta. */
const HUECOS = [
  { x: 62, y: 62, forma: "circulo" },
  { x: 84, y: 58, forma: "cuadrado" },
  { x: 106, y: 58, forma: "triangulo" },
  { x: 128, y: 62, forma: "circulo" },
  { x: 73, y: 74, forma: "triangulo" },
  { x: 95, y: 71, forma: "circulo" },
  { x: 117, y: 71, forma: "cuadrado" },
  { x: 139, y: 76, forma: "circulo" },
  { x: 51, y: 76, forma: "cuadrado" },
  { x: 84, y: 45, forma: "circulo" },
  { x: 106, y: 45, forma: "cuadrado" },
  { x: 95, y: 33, forma: "triangulo" },
];

function Producto({ hueco, color, visible, retardo }) {
  const comun = {
    fill: color,
    style: {
      opacity: visible ? 1 : 0,
      transform: visible ? "scale(1)" : "scale(0.4)",
      transformOrigin: `${hueco.x}px ${hueco.y}px`,
      transition: `opacity 260ms ease ${retardo}ms, transform 320ms cubic-bezier(0.2,0.8,0.3,1) ${retardo}ms`,
    },
  };
  if (hueco.forma === "circulo") return <circle cx={hueco.x} cy={hueco.y} r="7" {...comun} />;
  if (hueco.forma === "cuadrado")
    return <rect x={hueco.x - 6.5} y={hueco.y - 6.5} width="13" height="13" rx="3" {...comun} />;
  return (
    <path d={`M ${hueco.x} ${hueco.y - 8} L ${hueco.x + 7.5} ${hueco.y + 6} L ${hueco.x - 7.5} ${hueco.y + 6} Z`} {...comun} />
  );
}

export default function CanastaConsumo({ valor, min, max, accent, teal, coral }) {
  const r = razon(valor, min, max);
  const llenos = Math.round(r * HUECOS.length);

  return (
    <svg
      viewBox="0 0 200 120"
      width="100%"
      height={VISUAL_ALTO}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Canasta de consumo con ${llenos} de ${HUECOS.length} productos`}
      style={{ display: "block" }}
    >
      {/* Los productos van detrás del frente de la canasta: parecen estar dentro. */}
      {HUECOS.map((hueco, i) => (
        <Producto
          key={i}
          hueco={hueco}
          color={[accent, teal, coral][i % 3]}
          visible={i < llenos}
          /* Escalonar la entrada hace que llenarse se lea como un gesto, no como un parpadeo. */
          retardo={i < llenos ? i * 22 : 0}
        />
      ))}

      {/* Canasta: trapecio invertido, sin asas ni mimbre. Geometría, no ilustración. */}
      <path
        d="M 38 74 L 162 74 L 148 110 L 52 110 Z"
        fill="rgba(248,249,250,0.07)"
        stroke="rgba(248,249,250,0.45)"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Rejilla del frente. */}
      {[62, 81, 100, 119, 138].map((x, i) => (
        <line
          key={i}
          x1={x + (x - 100) * 0.02}
          y1="76"
          x2={x - (x - 100) * 0.09}
          y2="108"
          stroke="rgba(248,249,250,0.22)"
          strokeWidth="1.4"
        />
      ))}
      <line x1="45" y1="90" x2="155" y2="90" stroke="rgba(248,249,250,0.22)" strokeWidth="1.4" />
      {/* Borde superior, más marcado: cierra la forma. */}
      <line x1="38" y1="74" x2="162" y2="74" stroke={accent} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
