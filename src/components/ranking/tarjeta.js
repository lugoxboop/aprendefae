import { FAE } from "../../theme.js";

/*
 * La tarjeta de las dos tablas de posiciones (RankingFP y LigaBoard), OPACA
 * (#571): al 4 % de blanco dejaba pasar el tablero de ajedrez de Estratégico y
 * el texto no se leía (1,61 a 2,83:1, medido por Ukyo). N1 y el contorno de
 * vida-visual-v1 §2.4. Una sola definición para las dos, para que no se separen.
 */
/*
 * Y #1C2939, no el navy (#573, Levi: «opaco no es legible»). Medido con
 * scripts/ranking/medir.mjs: sobre #1D3557 el teal de las cifras daba 2,78 a
 * 3,72:1 y los grises al 40-50 %, 3,22 a 4,17. El navy no es superficie
 * (reglas de Xeno §3.6: tarjeta #1F2D3D o #1C2939); #1C2939 es la más oscura
 * de las dos y la que más contraste da. Los textos van además en neutros que
 * pasan 4,5:1 (ver ATENUADO_TABLA).
 */
export const TARJETA_TABLA = {
  background: "#1C2939",
  border: "1px solid rgba(248,249,250,0.18)",
};

/* El texto secundario de las dos tablas: 7,15:1 sobre la tarjeta. */
export const ATENUADO_TABLA = "#A8B6C8";
