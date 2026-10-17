import EligeUnaOpcion from "../b5/EligeUnaOpcion.jsx";
import { useVuelta } from "../b5/ConVuelta.jsx";
import { T6_ACT4, REGLAS_T6_ACT4, OPCIONES_T6_ACT4, HECHOS_T6_ACT4, HECHOS_V2_T6_ACT4, ALT_T6_ACT4 } from "../../../../data/contabilidadT6Act4.js";
import { retroT6Act4, veredictoT6Act4, provisionDeT6Act4, evaluarSegundaT6Act4 } from "../../../../contabilidad/t6Act4.js";
import SegundaProvision, { AsientoConTanque } from "./TanqueMini.jsx";
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
  /* Lote 6d: el veredicto como estado, aparte del texto. */
  veredicto: veredictoT6Act4,
  cierre: T6_ACT4.cierre,
  alt: ALT_T6_ACT4,
  etiqueta: "Hecho",
  visual: AsientoMinimo,
};

/* D4 (lote 19, P2 de Mai): tras el DEBE, qué le pasa a la provisión, con el tanque mini junto al asiento. CONFIG_T6_ACT4 queda como la de una decisión. */
export const CONFIG_D4_T6_ACT4 = {
  ...CONFIG_T6_ACT4,
  visual: AsientoConTanque,
  segunda: { correcta: provisionDeT6Act4, evaluar: evaluarSegundaT6Act4, Vista: SegundaProvision },
};

/* D8 (lote 18, Futaba): la variante, diez hechos nuevos con el mismo reparto. */
const CONFIG_V2_T6_ACT4 = { ...CONFIG_D4_T6_ACT4, banco: HECHOS_V2_T6_ACT4 };

export default function QueSeDebita(props) {
  const { variante, alCompletar } = useVuelta(T6_ACT4.id, props.onCompletar);
  if (props.modoDemo) return <EligeUnaOpcion config={CONFIG_T6_ACT4} {...props} />;
  return <EligeUnaOpcion {...props} config={variante ? CONFIG_V2_T6_ACT4 : CONFIG_D4_T6_ACT4} onCompletar={alCompletar} />;
}
