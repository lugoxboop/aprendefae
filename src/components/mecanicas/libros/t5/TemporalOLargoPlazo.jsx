import { N1, BOTON_N1, resumenN1 } from "../../../../data/contabilidadT5_n1.js";
import { prepararN1, evaluarN1, puntuarN1, TOTAL_N1 } from "../../../../contabilidad/t5N1.js";
import UnToqueT5 from "./UnToqueT5.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N1 · ¿TEMPORAL O A LARGO PLAZO? (Célula C)
 *
 * Nueve ítems de un solo toque (UnToqueT5.jsx): cinco casos, tres grupos y la
 * intención. Los textos, en data/contabilidadT5_n1.js; la lógica, en
 * contabilidad/t5N1.js.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CONFIG_N1 = {
  datos: N1, botones: BOTON_N1, preparar: prepararN1, evaluar: evaluarN1,
  puntuar: puntuarN1, total: TOTAL_N1, resumen: resumenN1, marca: "t5-n1",
};

export default function TemporalOLargoPlazo(props) {
  return <UnToqueT5 config={CONFIG_N1} {...props} />;
}
