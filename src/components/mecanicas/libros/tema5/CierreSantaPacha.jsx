import { T5_ACT2, PARTES_T5_ACT2, ESTANTE_T5_ACT2, RESUMEN_T5_ACT2, ALT_T5_ACT2, REGLAS_T5_ACT2, COMPRA_T5_ACT2 } from "../../../../data/contabilidadT5Act2.js";
import { evaluarParteT5Act2 } from "../../../../contabilidad/t5Act2.js";
import CierreConMesa from "../b5/CierreConMesa.jsx";
import PrecioPorTitulo from "./PrecioPorTitulo.jsx";
import { useVuelta } from "../b5/ConVuelta.jsx";
import { PARTES_V2_T5_ACT2, COMPRA_V2_T5_ACT2, ALT_V2_T5_ACT2, T5_ACT2_V2 } from "../../../../data/b5SegundaVuelta.js";

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
  /* Lote 6c: los pasos van plegados bajo «¿Cómo se juega?», y el ejemplo resuelto es su propio paso. */
  reglas: REGLAS_T5_ACT2,
  ejemplo: COMPRA_T5_ACT2,
  partes: PARTES_T5_ACT2,
  estante: ESTANTE_T5_ACT2,
  resumen: RESUMEN_T5_ACT2,
  alt: ALT_T5_ACT2,
  evaluar: evaluarParteT5Act2,
  atributos: { "data-cierre-t5": true },
  /* Lote 20 (D9): el elemento propio, «Precio por título», en los asientos de venta. */
  elementoPropio: PrecioPorTitulo,
};

/* D8 (lote 18, Futaba): la variante, Comercializadora El Roble. */
export const CONFIG_V2_T5_ACT2 = { ...CONFIG_T5_ACT2, actividad: T5_ACT2_V2, ejemplo: COMPRA_V2_T5_ACT2, partes: PARTES_V2_T5_ACT2, alt: ALT_V2_T5_ACT2 };

export default function CierreSantaPacha(props) {
  const { variante, alCompletar } = useVuelta(T5_ACT2.id, props.onCompletar);
  if (props.modoDemo) return <CierreConMesa config={CONFIG_T5_ACT2} {...props} />;
  return <CierreConMesa {...props} config={variante ? CONFIG_V2_T5_ACT2 : CONFIG_T5_ACT2} onCompletar={alCompletar} />;
}
