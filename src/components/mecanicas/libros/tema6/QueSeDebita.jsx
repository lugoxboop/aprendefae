import EligeUnaOpcion from "../b5/EligeUnaOpcion.jsx";
import { T6_ACT4, OPCIONES_T6_ACT4, HECHOS_T6_ACT4, ALT_T6_ACT4 } from "../../../../data/contabilidadT6Act4.js";
import { retroT6Act4 } from "../../../../contabilidad/t6Act4.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T6 · HACER 4 · ¿QUÉ SE DEBITA? (Célula B, b5-t6-a4)
 *
 * El patrón de «¿Por Cuál Arteria Entra?», en su copia de la célula
 * (b5/EligeUnaOpcion.jsx), con lo propio de esta actividad: las cuatro
 * cuentas fijas, la nota bajo la consigna y la regla. Los textos, en
 * data/contabilidadT6Act4.js; la devolución, en contabilidad/t6Act4.js.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CONFIG_T6_ACT4 = {
  consigna: T6_ACT4.consigna,
  nota: T6_ACT4.nota,
  regla: T6_ACT4.regla,
  opciones: OPCIONES_T6_ACT4,
  banco: HECHOS_T6_ACT4,
  retro: retroT6Act4,
  cierre: T6_ACT4.cierre,
  alt: ALT_T6_ACT4,
  etiqueta: "Hecho",
};

export default function QueSeDebita(props) {
  return <EligeUnaOpcion config={CONFIG_T6_ACT4} {...props} />;
}
