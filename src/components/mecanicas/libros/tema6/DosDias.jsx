import { PASOS_T6_A2, CIERRE_T6_A2 } from "../../../../data/contabilidadT6Pieza2.js";
import { duracionPasoT6A2 } from "../../../../contabilidad/t6Pieza2.js";
import { crearFichas } from "../../../../contabilidad/fichaQueEntra.js";
import { FICHAS_T6_A2 } from "../../../../data/fichasQueEntran.js";
import { crearEscenaFichas } from "./FichaQueEntra.jsx";
import MaquinaPegada from "./MaquinaPegada.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 2 · CAPA 2 · «MÍRELO FUNCIONAR» — los libros de Dajema en
 * dos días (guía de Mai v1 con su cierre v1b, PASA de Shoko).
 *
 * El día de la venta, la venta a crédito a Nancy; el día del castigo, el
 * análisis, la deuda incobrable, el castigo y la anulación directa. La
 * misma cuenta de clientes se debita el primer día y se acredita el
 * segundo. Sin provisión dibujada (este método no la crea) y sin coral:
 * «incobrable» es un hecho contable, no un error.
 *
 * La fecha del castigo se puede resaltar sin moverse (lo hacía el paso 10,
 * que el lote C1-6 quitó):
 * borde de 2 px transparente y margen −6; resaltada, borde nodo y relleno
 * navy. Las fechas nunca se atenúan: llevan su color, no el del día (que sí
 * se atenúa); el monto, igual, para verse claro cuando lo resaltado es él. El bloque de control pegado vive en
 * MaquinaPegada.jsx. Ningún texto vive aquí.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const TODOS = [...PASOS_T6_A2, CIERRE_T6_A2];

/* Lote 21 (P2 de Mai): la rejilla de la capa 3, con el gasto que entra al castigar; la fila «Provisiones», tenue y vacía. */
const FICHAS = crearFichas(TODOS, FICHAS_T6_A2);
const Escena = crearEscenaFichas(FICHAS_T6_A2);

export default function DosDias() {
  return <MaquinaPegada todos={TODOS} estadoPaso={FICHAS.estado} duracion={duracionPasoT6A2} escena={Escena} atributos={{ "data-capa2-t6-a2": true }} />;
}
