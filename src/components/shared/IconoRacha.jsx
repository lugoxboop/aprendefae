import { FAE } from "../../theme.js";

/*
 * Llama de la racha.
 *
 * Es fuego a propósito: Duolingo, Snapchat y media aplicación de hábitos usan
 * lo mismo, así que ya se entiende sin explicarlo. Inventar otro símbolo
 * costaría reconocimiento y no ganaría marca.
 *
 * Lo que sí es nuestro es el tratamiento: facetada y con degradado, el mismo
 * sistema de los marcos de medalla, en vez de un emoji o una ilustración
 * realista. La forma se construye con tramos rectos —no curvas— para que se
 * lea tallada y no dibujada.
 */

/* Un único id por instancia evitaría colisiones, pero como el degradado es
 * siempre el mismo basta con uno estable y compartido. */
const ID = "fae-llama";

/*
 * `colorApagado` existe para el banner del Repaso, donde el fuego sin racha va
 * en el gris del kit (#7A8798) y no en el blanco translúcido de siempre. El
 * valor por defecto es el de antes, así que ningún otro sitio cambia.
 */
export default function IconoRacha({ tamano = 28, encendida = true, brillo = false, colorApagado = "rgba(248,249,250,0.32)" }) {
  const trazo = encendida ? `url(#${ID}-borde)` : colorApagado;
  const relleno = encendida ? `url(#${ID}-relleno)` : "none";

  return (
    <svg
      viewBox="0 0 40 48"
      width={tamano}
      height={tamano * 1.2}
      aria-hidden="true"
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <linearGradient id={`${ID}-borde`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={FAE.coral} />
          <stop offset="100%" stopColor={FAE.ambar} />
        </linearGradient>
        <linearGradient id={`${ID}-relleno`} x1="0" y1="1" x2="0.4" y2="0">
          <stop offset="0%" stopColor={FAE.coral} stopOpacity="0.9" />
          <stop offset="60%" stopColor={FAE.coral} stopOpacity="0.45" />
          <stop offset="100%" stopColor={FAE.ambar} stopOpacity="0.28" />
        </linearGradient>
        {brillo && (
          <filter id={`${ID}-brillo`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      <g filter={brillo ? `url(#${ID}-brillo)` : undefined}>
        {/*
          Silueta exterior, en tramos rectos. Sube en punta por la izquierda,
          se ensancha abajo y cierra con el pliegue característico de la llama.
        */}
        <polygon
          points="20,2 26,14 31,10 36,24 33,38 20,46 7,38 4,24 10,15 14,20"
          fill={relleno}
          stroke={trazo}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Facetas internas: las mismas aristas que parten los marcos de medalla. */}
        <polyline points="20,2 20,46" fill="none" stroke={trazo} strokeWidth="0.9" opacity="0.35" />
        <polyline points="4,24 20,30 36,24" fill="none" stroke={trazo} strokeWidth="0.9" opacity="0.35" />
        <polyline points="14,20 20,30 26,14" fill="none" stroke={trazo} strokeWidth="0.9" opacity="0.3" />

        {/* Núcleo. Es lo que hace que se lea como fuego y no como una hoja. */}
        <polygon
          points="20,20 25,30 20,40 15,30"
          fill={encendida ? FAE.ambar : "rgba(248,249,250,0.22)"}
          opacity={encendida ? 0.92 : 1}
        />
      </g>
    </svg>
  );
}
