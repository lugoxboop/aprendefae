import { N4, BOTON_N4, resumenN4 } from "../../../../data/contabilidadT5_n4.js";
import { prepararN4, evaluarN4, idLineaN4, puntuarN4, TOTAL_N4 } from "../../../../contabilidad/t5N4.js";
import PreguntasConAsientoT5 from "./PreguntasConAsientoT5.jsx";
import FiguraAcumulada from "../t7/FiguraAcumulada.jsx";
import { FIGURA_T5_N4, cerradosDe } from "../../../../contabilidad/figuraAcumulada.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N4 · EL INTERÉS DEL PERIODO (Célula C)
 *
 * Dos elecciones, dos casillas de cifra y el asiento del cobro, con «Arma la
 * línea» (lote 3), en PreguntasConAsientoT5.jsx. Los
 * textos y las cifras, en data/contabilidadT5_n4.js; la lógica, en
 * contabilidad/t5N4.js.
 *
 * Arriba, la figura acumulada (lote 5 de L, t7/FiguraAcumulada.jsx): la
 * cuenta de intereses crece trimestre a trimestre, cada parte al cerrarse su
 * ítem.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export function FiguraN4({ i, listo }) {
  return <FiguraAcumulada figura={FIGURA_T5_N4} cerrados={cerradosDe(i, listo)} listo={listo} />;
}

export const CONFIG_N4 = {
  datos: N4, botones: BOTON_N4, preparar: prepararN4, evaluar: evaluarN4, idLinea: idLineaN4,
  puntuar: puntuarN4, total: TOTAL_N4, resumen: resumenN4, marca: "t5-n4", Figura: FiguraN4,
};

export default function ElInteresDelPeriodo(props) {
  return <PreguntasConAsientoT5 config={CONFIG_N4} {...props} />;
}
