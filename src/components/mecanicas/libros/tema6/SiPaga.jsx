import { PASOS_T6_A4, CIERRE_T6_A4, PARADA_T6_A4 } from "../../../../data/contabilidadT6Pieza4.js";
import { T6_A4 } from "../../../../contabilidad/t6Pieza4.js";
import MaquinaPegada from "./MaquinaPegada.jsx";
import { crearFichas } from "../../../../contabilidad/fichaQueEntra.js";
import { FICHAS_T6_A4 } from "../../../../data/fichasQueEntran.js";
import { crearEscenaFichas } from "./FichaQueEntra.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 4 · CAPA 2 · «MÍRELO FUNCIONAR» — El Torito y Pablo Moncayo,
 * caso a (guía de Mai v1 §3).
 *
 * Dos momentos con las tarjetas de T6 · A3; la cabecera solo lleva la fecha
 * (el cierre no da tipos). El castigo de marzo se conserva mientras la deuda
 * se revive: la Provisión pasa de [se debita] a [se acredita] y Clientes, al
 * revés. Dos etiquetas de grupo separan los asientos del momento 2. Sin
 * coral y sin ninguna cuenta de ingreso. Ningún texto vive aquí.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const TODOS = [...PASOS_T6_A4, CIERRE_T6_A4];


/* Lote 21 (P2 de Mai): la tabla del caso a, con la deuda que se revive y el pago que entra a Caja. */
const FICHAS = crearFichas(TODOS, FICHAS_T6_A4);
const Escena = crearEscenaFichas(FICHAS_T6_A4);

/* La predicción se escribe sobre la silueta del primer asiento del segundo momento (§2a de Mai). */
/* Lote 21: en la tabla del caso a, la parada resalta el sitio de lo que se revive y la etiqueta va sobre él. */
export const PARADA_SI_PAGA = { ...PARADA_T6_A4, etiquetaEn: "revive", resaltados: ["revive"] };
export const estadoSiPaga = FICHAS.estado;
const PARADA = PARADA_SI_PAGA;

export default function SiPaga() {
  /* Sin pasos juntados (hoja 7 de Mai), con la parada entre el 4 y el 5. */
  return <MaquinaPegada todos={TODOS} estadoPaso={FICHAS.estado} duracion={T6_A4.duracion} escena={Escena} parada={PARADA} atributos={{ "data-capa2-t6-a4": true }} />;
}
