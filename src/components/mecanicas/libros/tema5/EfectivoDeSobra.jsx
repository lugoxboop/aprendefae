import { PASOS_CAPA_2, CIERRE_CAPA_2, PIES_CAPA_2, PIE_CIERRE_CAPA_2 } from "../../../../data/contabilidadT5Pieza1.js";
import { duracionPaso } from "../../../../contabilidad/efectivoDeSobra.js";
import { crearFichas } from "../../../../contabilidad/fichaQueEntra.js";
import { FICHAS_T5_A1 } from "../../../../data/fichasQueEntran.js";
import MaquinaPegada from "../tema6/MaquinaPegada.jsx";
import { crearEscenaFichas } from "../tema6/FichaQueEntra.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 5 · PIEZA 1 · CAPA 2 · «MÍRELO FUNCIONAR» — una empresa y su efectivo
 * de sobra. Siete pasos y el cierre.
 *
 * Lote 21 (P2 de Mai, 16-oct): la capa 2 pasa a la máquina de la célula
 * (MaquinaPegada: bloque pegado, contador, «Reproducir», «Anterior» y
 * «Siguiente», como las demás piezas de B) con la ficha que entra: el
 * efectivo se vuelve tres títulos y cada uno entra a su cajón del estante de
 * las fichas cuando el paso lo nombra. Ningún texto vive aquí.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const TODOS = [...PASOS_CAPA_2.map((texto, k) => ({ texto, pie: PIES_CAPA_2[k] })), { texto: CIERRE_CAPA_2, pie: PIE_CIERRE_CAPA_2 }];
const FICHAS = crearFichas(TODOS, FICHAS_T5_A1);
const Escena = crearEscenaFichas(FICHAS_T5_A1);

export default function EfectivoDeSobra() {
  return <MaquinaPegada todos={TODOS} estadoPaso={FICHAS.estado} duracion={duracionPaso} escena={Escena} atributos={{ "data-capa2-t5-a1": true }} />;
}
