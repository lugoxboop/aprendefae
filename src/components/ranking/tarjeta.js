import { FAE } from "../../theme.js";

/*
 * La tarjeta de las dos tablas de posiciones (RankingFP y LigaBoard), OPACA
 * (#571): al 4 % de blanco dejaba pasar el tablero de ajedrez de Estratégico y
 * el texto no se leía (1,61 a 2,83:1, medido por Ukyo). N1 y el contorno de
 * vida-visual-v1 §2.4. En Macro y Contabilidad, cuyo fondo ya es ese navy, casi
 * no cambia. Una sola definición para las dos, para que no se separen.
 */
export const TARJETA_TABLA = {
  background: FAE.navy,
  border: "1px solid rgba(248,249,250,0.18)",
};
