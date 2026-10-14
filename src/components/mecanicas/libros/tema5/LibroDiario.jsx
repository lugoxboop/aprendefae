import { useCallback, useState } from "react";
import { COMPRA_T5_ACT2, DIARIO_T5_ACT2 } from "../../../../data/contabilidadT5Act2.js";
import { LibroDiario as LibroDiarioBase } from "../b5/LibroDiario.jsx";
import CierreSantaPacha from "./CierreSantaPacha.jsx";

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
export default function CierreConDiario(props) {
  const [asientos, setAsientos] = useState(() => [COMPRA_T5_ACT2]);
  const [abierto, setAbierto] = useState(false);
  const sumar = useCallback((parte) => setAsientos((xs) => (xs.some((x) => x.id === parte.id) ? xs : [...xs, parte])), []);
  const reiniciar = useCallback(() => setAsientos([COMPRA_T5_ACT2]), []);
  return (
    <CierreSantaPacha
      {...props}
      encima={<LibroDiario asientos={asientos} abierto={abierto} onAlternar={() => setAbierto((x) => !x)} />}
      onParteComprobada={sumar}
      onReiniciar={reiniciar}
    />
  );
}
