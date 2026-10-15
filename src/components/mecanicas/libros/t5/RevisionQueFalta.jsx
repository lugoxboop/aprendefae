import { N3, BOTON_N3, resumenN3 } from "../../../../data/contabilidadT5_n3.js";
import { prepararN3, evaluarN3, puntuarN3, TOTAL_N3 } from "../../../../contabilidad/t5N3.js";
import UnToqueT5 from "./UnToqueT5.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N3 · ¿QUÉ REVISIÓN FALTA? (Célula C)
 *
 * Cinco casos de un solo toque (UnToqueT5.jsx), con las cuatro acciones de la
 * p. 193. Los textos, en data/contabilidadT5_n3.js; la lógica, en
 * contabilidad/t5N3.js.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CONFIG_N3 = {
  datos: N3, botones: BOTON_N3, preparar: prepararN3, evaluar: evaluarN3,
  puntuar: puntuarN3, total: TOTAL_N3, resumen: resumenN3, marca: "t5-n3",
};

export default function RevisionQueFalta(props) {
  return <UnToqueT5 config={CONFIG_N3} {...props} />;
}
