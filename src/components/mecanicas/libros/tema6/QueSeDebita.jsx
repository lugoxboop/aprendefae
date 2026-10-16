import EligeUnaOpcion from "../b5/EligeUnaOpcion.jsx";
import { T6_ACT4, REGLAS_T6_ACT4, OPCIONES_T6_ACT4, HECHOS_T6_ACT4, ALT_T6_ACT4 } from "../../../../data/contabilidadT6Act4.js";
import { retroT6Act4 } from "../../../../contabilidad/t6Act4.js";
import AsientoMinimo from "./AsientoMinimo.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T6 · HACER 4 · ¿QUÉ SE DEBITA? (Célula B, b5-t6-a4)
 *
 * El patrón de «¿Por Cuál Arteria Entra?», en su copia de la célula
 * (b5/EligeUnaOpcion.jsx), con lo propio de esta actividad: las cuatro
 * cuentas fijas, la nota bajo la consigna y la regla. Los textos, en
 * data/contabilidadT6Act4.js; la devolución, en contabilidad/t6Act4.js.
 * Calidad (hoja 4 de Mai): entre el hecho y las opciones, el asiento mínimo
 * (AsientoMinimo.jsx).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CONFIG_T6_ACT4 = {
  objetivo: T6_ACT4.objetivo,
  consigna: T6_ACT4.consigna,
  reglas: REGLAS_T6_ACT4,
  nota: T6_ACT4.nota,
  regla: T6_ACT4.regla,
  opciones: OPCIONES_T6_ACT4,
  banco: HECHOS_T6_ACT4,
  retro: retroT6Act4,
  cierre: T6_ACT4.cierre,
  alt: ALT_T6_ACT4,
  etiqueta: "Hecho",
  visual: AsientoMinimo,
};

export default function QueSeDebita(props) {
  return <EligeUnaOpcion config={CONFIG_T6_ACT4} {...props} />;
}
