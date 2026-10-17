import { COMPRA_T5_ACT2, DIARIO_T5_ACT2 } from "../../../../data/contabilidadT5Act2.js";
import { LibroDiario as LibroDiarioBase, useDiario } from "../b5/LibroDiario.jsx";
import CierreSantaPacha from "./CierreSantaPacha.jsx";
import { barajar } from "../../../../utils/barajar.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · HACER 2 · EL LIBRO DIARIO, encima del cierre (guía v1 de Mai, §3).
 *
 * El diario de la célula (b5/LibroDiario.jsx, sacado de aquí para el Tema 6)
 * con los textos de esta actividad. Variante 1: suma el asiento correcto de
 * cada parte comprobada, sin marcar acierto ni error.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export function LibroDiario(props) {
  return <LibroDiarioBase {...props} textos={DIARIO_T5_ACT2} />;
}

/*
 * El juego de la actividad: el diario encima del cierre. Lo que JUEGOS abre
 * desde el camino. El tutorial («Así se juega») usa CierreSantaPacha solo.
 */
export default function CierreConDiario({ mezclar = barajar, ...props }) {
  /* «Así se juega» monta este mismo componente en modo demo: la compra va sola, sin diario (y sin barajar). */
  if (props.modoDemo) return <CierreSantaPacha {...props} />;
  /* D8 (Mello, Kit v4): el estante se baraja una vez por partida, con la barajar de los Hacer (CierreConMesa, prop `mezclar`). */
  return <ConDiario {...props} mezclar={mezclar} />;
}

/* El diario aparece abierto al confirmar el primer asiento (hallazgo 9 de Shoko) y, desde el lote 6c, se abre con cada asiento y se pliega al empezar el siguiente: useDiario. */
function ConDiario(props) {
  const d = useDiario(COMPRA_T5_ACT2);
  return (
    <CierreSantaPacha
      {...props}
      encima={d.visible ? <LibroDiario asientos={d.asientos} abierto={d.abierto} onAlternar={d.alternar} /> : null}
      onParteComprobada={d.sumar}
      onAvanzar={d.plegar}
      onReiniciar={d.reiniciar}
    />
  );
}
