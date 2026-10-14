import { useCallback, useId, useState } from "react";
import { FAE } from "../../../../theme.js";
import { DEBE, HABER, pesos } from "../../../../data/contabilidad.js";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import { TONO_ROTULO } from "../debeHaber/piezasDebeHaber.jsx";
import { COMPRA_T5_ACT2, DIARIO_T5_ACT2 } from "../../../../data/contabilidadT5Act2.js";
import CierreSantaPacha from "./CierreSantaPacha.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · HACER 2 · EL LIBRO DIARIO, encima del cierre (guía v1 de Mai, §3).
 *
 * Un bloque propio, fuera de la mecánica: los asientos ya anotados, la compra
 * del 1 de mayo primero. Cerrado por defecto; se abre con «Ver» / «Ocultar»
 * (no con el chevrón, que ya significa «esto se abre para mostrar más»).
 * Conserva su estado al cambiar de asiento y no se abre solo al crecer.
 *
 * Variante 1 (la regla de Mai): el componente avisa cada parte comprobada,
 * así que el diario suma el asiento CORRECTO de esa parte, acierte o falle el
 * estudiante. No marca acierto ni error: es el registro, no la nota.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";
const FILETE = "rgba(184,196,212,0.25)";

function Movimiento({ m }) {
  const haber = m.lado === HABER;
  return (
    <div data-movimiento={`${m.lado}:${m.cuenta}`} style={{ marginTop: "4px" }}>
      <p data-nombre-diario style={{ margin: 0, paddingLeft: haber ? "12px" : 0, fontFamily: INTER, fontSize: "12px", lineHeight: 1.35, color: FAE.text }}>{m.cuenta}</p>
      <div style={{ display: "flex", gap: "8px" }}>
        {[DEBE, HABER].map((lado) => (
          <span key={lado} data-valor-diario={lado === m.lado ? lado : undefined} style={{
            flex: "1 1 0", minWidth: 0, textAlign: "right", whiteSpace: "nowrap",
            fontFamily: SORA, fontSize: "12.5px", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: FAE.text,
          }}>
            {lado === m.lado ? pesos(m.valor) : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

export function LibroDiario({ asientos, abierto, onAlternar }) {
  const idCuerpo = useId();
  const textos = DIARIO_T5_ACT2;
  return (
    <div data-libro-diario style={{ marginBottom: "12px", border: `1px solid ${COLOR.neutro}`, borderRadius: "12px" }}>
      <button type="button" data-diario-alternar aria-expanded={abierto} aria-controls={idCuerpo} onClick={onAlternar} style={{
        display: "flex", alignItems: "center", gap: "10px", width: "100%", minHeight: "44px", padding: "0 12px", boxSizing: "border-box",
        background: "transparent", border: "none", borderRadius: "12px", cursor: "pointer", color: FAE.text, textAlign: "left",
      }}>
        <span data-diario-cabecera style={{ flex: "1 1 auto", fontFamily: SORA, fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.16em", color: COLOR.apagado }}>{textos.cabecera}</span>
        <span data-diario-cuenta style={{ fontFamily: INTER, fontSize: "12px", color: COLOR.apagado }}>{textos.cuenta(asientos.length)}</span>
        <span data-diario-boton style={{ fontFamily: SORA, fontSize: "12px", fontWeight: 600, color: FAE.text, textDecoration: "underline", textUnderlineOffset: "3px" }}>
          {abierto ? textos.ocultar : textos.ver}
        </span>
      </button>
      <div id={idCuerpo} data-diario-cuerpo hidden={!abierto} style={{ padding: "0 12px 12px" }}>
        {abierto && (
          <>
            <div style={{ display: "flex", gap: "8px", paddingBottom: "4px", borderBottom: `1px solid ${FILETE}` }}>
              {[[DEBE, textos.debe], [HABER, textos.haber]].map(([lado, rot]) => (
                <span key={lado} data-diario-columna={lado} style={{ flex: "1 1 0", textAlign: "right", fontFamily: SORA, fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", color: TONO_ROTULO[lado] }}>{rot}</span>
              ))}
            </div>
            {asientos.map((a, k) => (
              <div key={a.id} data-asiento-diario={a.id} style={{ padding: "8px 0", borderBottom: k < asientos.length - 1 ? `1px solid ${FILETE}` : "none" }}>
                <p data-fecha-diario style={{ margin: 0, fontFamily: SORA, fontSize: "12px", fontWeight: 600, color: FAE.text }}>{a.fecha}</p>
                {a.asiento.map((m) => <Movimiento key={`${m.lado}:${m.cuenta}`} m={m} />)}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
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
