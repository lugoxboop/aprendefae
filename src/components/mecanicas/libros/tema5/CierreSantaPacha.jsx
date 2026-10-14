import { T5_ACT2, PARTES_T5_ACT2, ESTANTE_T5_ACT2, RESUMEN_T5_ACT2, ALT_T5_ACT2 } from "../../../../data/contabilidadT5Act2.js";
import { evaluarParteT5Act2 } from "../../../../contabilidad/t5Act2.js";
import CierreConMesa from "../b5/CierreConMesa.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · HACER 2 · EL CIERRE COMPLETO DE SANTA PACHA (Célula B, b5-t5-a2)
 *
 * La mesa de asientos de la célula (b5/CierreConMesa.jsx, sacada de aquí para
 * el Tema 6) con lo propio de esta actividad: un solo caso con 4 partes, el
 * estante de las pp. 194-195 y la C7 en las ventas.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CONFIG_T5_ACT2 = {
  actividad: T5_ACT2,
  partes: PARTES_T5_ACT2,
  estante: ESTANTE_T5_ACT2,
  resumen: RESUMEN_T5_ACT2,
  alt: ALT_T5_ACT2,
  evaluar: evaluarParteT5Act2,
  atributos: { "data-cierre-t5": true },
};

export default function CierreSantaPacha(props) {
  return <CierreConMesa config={CONFIG_T5_ACT2} {...props} />;
}
