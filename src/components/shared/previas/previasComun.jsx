import { FAE } from "../../../theme.js";

/*
 * Lo que comparten las previsualizaciones: la lámina de 120×90 y la paleta.
 *
 * La paleta es corta a propósito. Siluetas claras sobre navy, huecos en
 * línea discontinua, y el teal para la luz de una conexión o un encaje. El
 * CORAL NO APARECE: es el color del error en todo el sitio y un gesto neutro
 * nunca lo es. El ÁMBAR solo donde la actividad real ya lo tiene —el pulso
 * del panel del Simulador de crisis—.
 */
export const C = {
  fondo: "#13233B",
  borde: "rgba(248,249,250,0.16)",
  silueta: FAE.node,
  tarjeta: "#28313F",
  hueco: "rgba(248,249,250,0.42)",
  trazo: "rgba(248,249,250,0.72)",
  renglon: "rgba(248,249,250,0.45)",
  luz: FAE.teal,
  papel: "#F4EFE3",
  tinta: FAE.navy,
  ambar: FAE.ambar,
  texto: FAE.text,
};

/*
 * Cada gesto es un bucle de keyframes CSS. `transform-box: fill-box` en todo
 * lo de dentro: una escala o un giro se hacen sobre el centro de la pieza y
 * no del lienzo. Con "reducir movimiento" el panel ni siquiera monta la
 * previsualización —enseña el icono quieto—; esto es solo la red de abajo.
 */
export const CSS_BASE = `
.fae-pv-g { display: block; width: 100%; height: 100%; overflow: hidden; }
.fae-pv-g * { transform-box: fill-box; transform-origin: center; }
.fae-pv-trazo { stroke-dasharray: 1; }
@media (prefers-reduced-motion: reduce) { .fae-pv-g * { animation: none !important; } }
`;

export function Lamina({ id, css = "", children }) {
  return (
    <svg className="fae-pv-g" viewBox="0 0 120 90" aria-hidden="true" data-previa={id}>
      <style>{CSS_BASE + css}</style>
      {children}
    </svg>
  );
}

/* Unas rayas claras dentro de una tarjeta: dicen "aquí hay texto" sin serlo. */
export function Renglones({ x, y, anchos, color = C.renglon, grosor = 2.5, paso = 6 }) {
  return (
    <path
      d={anchos.map((a, k) => `M${x} ${y + k * paso} h${a}`).join(" ")}
      stroke={color} strokeWidth={grosor} strokeLinecap="round"
    />
  );
}
