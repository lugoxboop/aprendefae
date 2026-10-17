import {
  T6_ACT3, PARTES_T6_ACT3, ESTANTE_T6_ACT3, RESUMEN_T6_ACT3, ALT_T6_ACT3, DIARIO_T6_ACT3, CASTIGO_T6_ACT3, REGLAS_T6_ACT3,
} from "../../../../data/contabilidadT6Act3.js";
import { evaluarParte } from "../../../../contabilidad/cierreConMesa.js";
import CierreConMesa from "../b5/CierreConMesa.jsx";
import { MesaConDiario } from "../b5/LibroDiario.jsx";
import { useVuelta } from "../b5/ConVuelta.jsx";
import { PARTES_V2_T6_ACT3, CASTIGO_V2_T6_ACT3, ALT_V2_T6_ACT3 } from "../../../../data/b5SegundaVuelta.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T6 · HACER 3 · CUANDO LA DEUDA CASTIGADA VUELVE (Célula B, b5-t6-a3)
 *
 * La mesa de asientos de la célula con lo propio de esta actividad: cinco
 * partes (revivir y pagar en el caso a, revivir y abonar en el b, revivir en
 * el c), el estante con una cuenta de ingreso de distractor y las B
 * específicas de la C14. Encima, el libro diario AGRUPADO por caso (Mai):
 * los dos asientos del caso a quedan bajo un solo «Caso a», para que no
 * parezca que Moncayo pagó dos veces.
 *
 * «Así se juega» monta la mesa sola, en modo demo, con el castigo de marzo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CONFIG_T6_ACT3 = {
  actividad: T6_ACT3,
  /* Lote 6c: los pasos van plegados bajo «¿Cómo se juega?», y el ejemplo resuelto es su propio paso. */
  reglas: REGLAS_T6_ACT3,
  ejemplo: CASTIGO_T6_ACT3,
  partes: PARTES_T6_ACT3,
  estante: ESTANTE_T6_ACT3,
  resumen: RESUMEN_T6_ACT3,
  alt: ALT_T6_ACT3,
  evaluar: evaluarParte,
  atributos: { "data-cierre-t6-a3": true },
};

/* D8 (lote 18, Futaba): la variante, La Ceiba y la deuda castigada de Hernán Ríos. */
export const CONFIG_V2_T6_ACT3 = { ...CONFIG_T6_ACT3, ejemplo: CASTIGO_V2_T6_ACT3, partes: PARTES_V2_T6_ACT3, alt: ALT_V2_T6_ACT3 };

/* La configuración llega como prop: al cambiar de vuelta, la mesa no se desmonta (su resumen sigue a la vista). */
export function MesaDeudaQueVuelve({ config = CONFIG_T6_ACT3, ...props }) {
  return <CierreConMesa config={config} {...props} />;
}

export default function DeudaQueVuelve(props) {
  const { variante, alCompletar } = useVuelta(T6_ACT3.id, props.onCompletar);
  if (props.modoDemo) return <MesaDeudaQueVuelve {...props} />;
  return (
    <MesaConDiario {...props} Juego={MesaDeudaQueVuelve} config={variante ? CONFIG_V2_T6_ACT3 : CONFIG_T6_ACT3} inicial={variante ? CASTIGO_V2_T6_ACT3 : CASTIGO_T6_ACT3}
      textos={DIARIO_T6_ACT3} agrupar onCompletar={alCompletar} />
  );
}
