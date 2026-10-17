import {
  ROTULO_SIMULADO_T6_A5, PARADA_T6_A5,
} from "../../../../data/contabilidadT6Pieza5.js";
import { T6_A5, T6_A5_JUNTO, pegarPorcentaje } from "../../../../contabilidad/t6Pieza5.js";
import MaquinaPegada from "./MaquinaPegada.jsx";
import { crearFichas } from "../../../../contabilidad/fichaQueEntra.js";
import { FICHAS_T6_A5 } from "../../../../data/fichasQueEntran.js";
import { crearEscenaFichas } from "./FichaQueEntra.jsx";
import { PieDeFuente } from "./FuentesT6A5.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 5 · CAPA 2 · «MÍRELO FUNCIONAR» — cómo se calcula la
 * provisión, con la tabla del ejemplo en el centro (guía de Mai v1 §5).
 *
 * Un solo momento, el del cierre: lo que deben los clientes; la tabla
 * (el rótulo fijo, los cuatro grupos y la suma); el gasto y la provisión; el
 * valor neto. Los nombres de los grupos son los de las cajas de la capa 3.
 * El pie de cada paso, en su forma (FuentesT6A5.jsx); el «%», pegado a su
 * número. La máquina y el bloque pegado son los de MaquinaPegada.jsx; la
 * escena de momentos, la de Momentos.jsx. Ningún texto vive aquí.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Los pasos juntados (hoja 7 de Mai: el 9 y el 10 de antes van en uno). */
const TODOS = T6_A5_JUNTO.TODOS;


/* Lote 21 (P2 de Mai): el tablero de grupos; se toca la fila de cada grupo y entra su provisión. */
const FICHAS = crearFichas(TODOS, FICHAS_T6_A5);
const Escena = crearEscenaFichas(FICHAS_T6_A5);
const pintarPie = (pie) => <PieDeFuente texto={pie} />;
/*
 * Lo que oye el lector de pantalla tras el texto de cada paso (condición 3 de
 * Shoko): la escena le va oculta, así que el pie se lee con el texto y, en el
 * paso en que aparece la tabla, el rótulo fijo, una sola vez.
 */
const lector = (paso) => [
  ...(paso === T6_A5.PASO_TABLA ? [ROTULO_SIMULADO_T6_A5] : []),
  pegarPorcentaje(TODOS[paso - 1].pie),
];

/* La predicción se escribe sobre la silueta de la provisión del grupo 2 (§2a de Mai). */
/* Lote 21: en el tablero, la parada resalta el sitio de la provisión del grupo 2 y la etiqueta va sobre él. */
export const PARADA_TABLA = { ...PARADA_T6_A5, etiquetaEn: "v2", resaltados: ["v2"] };
export const estadoTabla = FICHAS.estado;
const PARADA = PARADA_TABLA;

export default function LaTablaDelEjemplo() {
  return (
    <MaquinaPegada todos={TODOS} estadoPaso={FICHAS.estado} duracion={T6_A5_JUNTO.duracion} escena={Escena} parada={PARADA}
      pintar={pegarPorcentaje} pintarPie={pintarPie} lector={lector} atributos={{ "data-capa2-t6-a5": true }} />
  );
}
