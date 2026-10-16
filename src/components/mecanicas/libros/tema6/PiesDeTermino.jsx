import { PIE } from "./MaquinaPegada.jsx";
import { PieDeFuente } from "./FuentesT6A5.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS PIES DE LA CAPA 1 (Célula B) — T6 · A5, condición 1 de Shoko, camino
 * aprobado por Sakuta.
 *
 * CuatroCapas no pinta pies por término y es compartido: no se toca. Este
 * archivo compone contenido
 * nuestro dentro de lo que CuatroCapas ya pinta (la réplica de Mai, §8 n.º 7):
 *   · el `pie` de un término va en su propia línea, bajo la definición;
 *   · el `pieDelLibro` de una nota va dentro de su caja, bajo el texto.
 * Cada pie, en su forma (FuentesT6A5.jsx): el del libro llano, el de la
 * norma en caja recta, el mixto con cada fuente en la suya. Así el Decreto
 * nunca queda bajo «Así lo dice el libro».
 *
 * Los textos llegan de los datos; aquí no se escribe ninguno.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* El pie, con la letra del pie de la máquina: Inter 12/16, secundario, en su propia línea. */
const LINEA_PIE = { display: "block", fontFamily: PIE.fontFamily, fontSize: PIE.fontSize, lineHeight: PIE.lineHeight, color: PIE.color };

/* Van dentro del <dd> o del <p> que pinta CuatroCapas: por eso son <span> en bloque. */
function ConPie({ texto, pie, marca, margen }) {
  return (
    <>
      <span data-texto-con-pie>{texto}</span>
      <span {...{ [marca]: "" }} style={{ ...LINEA_PIE, margin: `${margen} 0 0` }}><PieDeFuente texto={pie} /></span>
    </>
  );
}

/* La misma pieza, con el pie de cada término bajo su definición y el de cada nota dentro de su caja. */
export function conPiesDeTermino(pieza) {
  return {
    ...pieza,
    nombres: pieza.nombres.map((n) => ({
      ...n,
      ...(n.pie ? { definicion: <ConPie texto={n.definicion} pie={n.pie} marca="data-pie-termino" margen="4px" /> } : {}),
      ...(n.delLibro && n.pieDelLibro ? { delLibro: <ConPie texto={n.delLibro} pie={n.pieDelLibro} marca="data-pie-nota" margen="6px" /> } : {}),
    })),
  };
}
