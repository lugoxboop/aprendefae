import { PASOS_T6, CIERRE_T6 } from "../../../../data/contabilidadT6Pieza1.js";
import { duracionPasoT6 } from "../../../../contabilidad/t6Pieza1.js";
import { crearFichas } from "../../../../contabilidad/fichaQueEntra.js";
import { FICHAS_T6_A1 } from "../../../../data/fichasQueEntran.js";
import { crearEscenaFichas } from "./FichaQueEntra.jsx";
import MaquinaPegada from "./MaquinaPegada.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 1 · CAPA 2 · «MÍRELO FUNCIONAR» — los libros de
 * Comercializadora Santa Pacha en dos días (guía v2 de Mai, §4).
 *
 * La escena (decorativa: el texto del paso dice cada movimiento, incluidos
 * «se debita» y «se acredita»). El bloque de control pegado, «Reproducir» y
 * el desplazamiento viven en MaquinaPegada.jsx, que comparte con la pieza 2.
 *
 * Teal es Debe y ámbar es Haber, siempre en cápsula rellena con su palabra;
 * las cápsulas no se atenúan. Ningún texto vive aquí: todo sale del archivo
 * de datos.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const TODOS = [...PASOS_T6, CIERRE_T6];

/* Lote 21 (P2 de Mai): la T de clientes y el cajón «Caja», con la ficha que entra en cada paso que la nombra. */
const FICHAS = crearFichas(TODOS, FICHAS_T6_A1);
const Escena = crearEscenaFichas(FICHAS_T6_A1);

export default function DosMomentos() {
  return <MaquinaPegada todos={TODOS} estadoPaso={FICHAS.estado} duracion={duracionPasoT6} escena={Escena} atributos={{ "data-capa2-t6": true }} />;
}
