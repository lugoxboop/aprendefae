import { FAE } from "../../theme.js";

/*
 * El cristal de los Cristales.
 *
 * Es un prisma tallado, no una gema de videojuego: la silueta se construye con
 * tramos rectos y se parte con las mismas aristas internas que los marcos de
 * medalla y la llama de la racha, así que se lee del mismo sistema. El
 * degradado va de teal a navy —los dos colores de marca—, sin brillo de
 * caricatura ni destellos alrededor.
 *
 * Coral no aparece: aquí no hay error que señalar.
 *
 * El degradado es siempre el mismo, así que un id estable y compartido basta;
 * lo que necesita un id por instancia es el avatar, que cambia de colores.
 */

const ID = "fae-cristal";

export default function IconoCristal({ tamano = 20, apagado = false }) {
  const trazo = apagado ? "rgba(248,249,250,0.34)" : `url(#${ID}-borde)`;
  const relleno = apagado ? "rgba(248,249,250,0.06)" : `url(#${ID}-relleno)`;

  return (
    <svg
      viewBox="0 0 32 40"
      width={tamano}
      height={tamano * 1.25}
      aria-hidden="true"
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <linearGradient id={`${ID}-borde`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor={FAE.teal} />
          <stop offset="100%" stopColor={FAE.navy} />
        </linearGradient>
        <linearGradient id={`${ID}-relleno`} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor={FAE.teal} stopOpacity="0.85" />
          <stop offset="55%" stopColor={FAE.teal} stopOpacity="0.35" />
          <stop offset="100%" stopColor={FAE.navy} stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* La talla: punta arriba, hombros, faldas y punta abajo. */}
      <polygon
        points="16,2 27,13 24,27 16,38 8,27 5,13"
        fill={relleno}
        stroke={trazo}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Las facetas, las mismas aristas que parten los marcos de medalla. */}
      <polyline points="5,13 16,17 27,13" fill="none" stroke={trazo} strokeWidth="0.9" opacity="0.5" />
      <polyline points="16,2 16,38" fill="none" stroke={trazo} strokeWidth="0.9" opacity="0.4" />
      <polyline points="8,27 16,17 24,27" fill="none" stroke={trazo} strokeWidth="0.9" opacity="0.35" />
    </svg>
  );
}
