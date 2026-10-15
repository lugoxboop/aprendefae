import CasillasEnOrden from "../b5/CasillasEnOrden.jsx";
import { T6_ACT5, CASILLAS_T6_ACT5, ERRORES_T6_ACT5, ALT_T6_ACT5 } from "../../../../data/contabilidadT6Act5.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T6 · HACER 5 · LA CUENTA DE LA PROVISIÓN (Célula B, b5-t6-a5)
 *
 * Las casillas en orden de la célula (b5/CasillasEnOrden.jsx), con lo propio
 * de esta actividad: la regla de la provisión, el punto de partida de 2007 ya
 * resuelto y las cinco casillas de El Torito. Los textos y las cifras, en
 * data/contabilidadT6Act5.js.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CONFIG_T6_ACT5 = {
  consigna: T6_ACT5.consigna,
  regla: T6_ACT5.regla,
  partida: T6_ACT5.partida,
  partes: [{ id: "provision", casillas: CASILLAS_T6_ACT5 }],
  errores: ERRORES_T6_ACT5,
  cierre: T6_ACT5.cierre,
  alt: ALT_T6_ACT5,
  etiqueta: "Casilla",
};

export default function LaCuentaDeLaProvision(props) {
  return <CasillasEnOrden config={CONFIG_T6_ACT5} {...props} />;
}
