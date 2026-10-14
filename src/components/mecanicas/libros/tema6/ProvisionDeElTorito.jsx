import {
  T6_ACT2, PARTES_T6_ACT2, ESTANTE_T6_ACT2, RESUMEN_T6_ACT2, ALT_T6_ACT2, DIARIO_T6_ACT2, PROVISION_2007_T6_ACT2,
} from "../../../../data/contabilidadT6Act2.js";
import { evaluarParte } from "../../../../contabilidad/cierreConMesa.js";
import CierreConMesa from "../b5/CierreConMesa.jsx";
import { MesaConDiario } from "../b5/LibroDiario.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T6 · HACER 2 · LA PROVISIÓN DE EL TORITO (Célula B, b5-t6-a2)
 *
 * La mesa de asientos de la célula (la del cierre de Santa Pacha,
 * generalizada) con lo propio de esta actividad: dos partes (el castigo de
 * marzo y la provisión del año siguiente), el estante de El Torito con Caja
 * de distractor y las B específicas C15 y C12. Encima, el libro diario: la
 * provisión de 2007 primero y, después, cada parte comprobada.
 *
 * «Así se juega» monta la mesa sola, en modo demo, con la provisión de 2007.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CONFIG_T6_ACT2 = {
  actividad: T6_ACT2,
  partes: PARTES_T6_ACT2,
  estante: ESTANTE_T6_ACT2,
  resumen: RESUMEN_T6_ACT2,
  alt: ALT_T6_ACT2,
  evaluar: evaluarParte,
  atributos: { "data-cierre-t6-a2": true },
};

export function MesaProvision(props) {
  return <CierreConMesa config={CONFIG_T6_ACT2} {...props} />;
}

export default function ProvisionDeElTorito(props) {
  if (props.modoDemo) return <MesaProvision {...props} />;
  return <MesaConDiario Juego={MesaProvision} inicial={PROVISION_2007_T6_ACT2} textos={DIARIO_T6_ACT2} {...props} />;
}
