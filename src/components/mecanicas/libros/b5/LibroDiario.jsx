import { useCallback, useId, useState } from "react";
import { FAE } from "../../../../theme.js";
import { DEBE, HABER, pesos } from "../../../../data/contabilidad.js";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import { TONO_ROTULO } from "../debeHaber/piezasDebeHaber.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL LIBRO DIARIO DE LA CÉLULA B, encima de la mesa de asientos — sacado del
 * cierre de Santa Pacha (T5 · Hacer 2, guía v1 de Mai §3) para los Hacer
 * del Tema 6.
 *
 * Los asientos ya anotados, el del ejemplo primero. Cerrado por defecto; se
 * abre con «Ver» / «Ocultar». Conserva su estado al cambiar de asiento y no
 * se abre solo al crecer. Variante 1: suma el asiento CORRECTO de cada parte
 * comprobada, acierte o falle el estudiante; no marca acierto ni error.
 *
 * `agrupar` (b5-t6-a3): un asiento con la misma etiqueta que el anterior no
 * la repite, así los dos asientos del caso a quedan bajo un solo «Caso a».
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

export function LibroDiario({ asientos, abierto, onAlternar, textos, agrupar = false }) {
  const idCuerpo = useId();
  /* Agrupar (b5-t6-a3): un asiento con la misma etiqueta que el anterior no la repite ni lleva filete entre los dos. */
  const sigue = (k) => agrupar && k > 0 && k < asientos.length && asientos[k].fecha === asientos[k - 1].fecha;
  return (
    <div data-libro-diario style={{ marginBottom: "12px", border: `1px solid ${COLOR.neutro}`, borderRadius: "12px" }}>
      <button type="button" data-diario-alternar aria-expanded={abierto} aria-controls={idCuerpo} onClick={onAlternar} style={{
        display: "flex", alignItems: "center", gap: "10px", width: "100%", minHeight: "44px", padding: "0 12px", boxSizing: "border-box",
        background: "transparent", border: "none", borderRadius: "12px", cursor: "pointer", color: FAE.text, textAlign: "left",
      }}>
        <span data-diario-cabecera style={{ flex: "1 1 auto", fontFamily: SORA, fontSize: "12px", fontWeight: 700, letterSpacing: "0.16em", color: COLOR.apagado }}>{textos.cabecera}</span>
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
                <span key={lado} data-diario-columna={lado} style={{ flex: "1 1 0", textAlign: "right", fontFamily: SORA, fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", color: TONO_ROTULO[lado] }}>{rot}</span>
              ))}
            </div>
            {asientos.map((a, k) => (
              <div key={a.id} data-asiento-diario={a.id} style={{
                /* Dentro de un grupo, 8 px de aire (6 + 2) y sin filete (Mai, b5-t6-a3 §4). */
                padding: `${sigue(k) ? 2 : 8}px 0 ${sigue(k + 1) ? 6 : 8}px`,
                borderBottom: k < asientos.length - 1 && !sigue(k + 1) ? `1px solid ${FILETE}` : "none",
              }}>
                {!sigue(k) && <p data-fecha-diario style={{ margin: 0, fontFamily: SORA, fontSize: "12px", fontWeight: 600, color: FAE.text }}>{a.fecha}</p>}
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
 * El diario de una mesa (hallazgo 9 de Shoko, decidido por Mai): no ocupa
 * sitio hasta que se confirma el primer asiento; entonces aparece ABIERTO, ya
 * con ese asiento escrito. Después se abre y se cierra como siempre.
 *
 * `quieto` (b5-t6-a2, lote 6b): está desde el principio, plegado.
 *
 * NADA DOS VECES (lote 6c, hoja de Mai, B5): el estante solo se ve mientras
 * se arma el asiento. Al confirmar, el estante se pliega y el diario se abre
 * con el asiento nuevo; al empezar el siguiente (`plegar`, que la mesa llama
 * con «Siguiente»), vuelve el estante y el diario se pliega solo, con su
 * cuenta a la vista. Desde el 6c el diario va al final de la tarjeta, así que
 * abrirse ya no empuja nada de lo que se juega.
 */
export function useDiario(inicial, quieto = false) {
  const [asientos, setAsientos] = useState(() => [inicial]);
  const [abierto, setAbierto] = useState(false);
  const [visible, setVisible] = useState(quieto);
  /* Lote 6c · nada dos veces: cada asiento confirmado abre el diario con él dentro. */
  const sumar = useCallback((parte) => {
    setAsientos((xs) => (xs.some((x) => x.id === parte.id) ? xs : [...xs, parte]));
    setVisible(true);
    setAbierto(true);
  }, []);
  /* Y al empezar el siguiente, se pliega solo, con su cuenta a la vista: el estante vuelve y no se ven dos veces las mismas cuentas. */
  const plegar = useCallback(() => setAbierto(false), []);
  const reiniciar = useCallback(() => { setAsientos([inicial]); setVisible(quieto); setAbierto(false); }, [inicial, quieto]);
  return { asientos, abierto, visible, alternar: () => setAbierto((x) => !x), sumar, plegar, reiniciar };
}

/* La mesa con el diario encima: `inicial` es el asiento del ejemplo; cada parte comprobada suma la suya. */
export function MesaConDiario({ Juego, inicial, textos, agrupar = false, quieto = false, ...props }) {
  const d = useDiario(inicial, quieto);
  return (
    <Juego
      {...props}
      encima={d.visible ? <LibroDiario asientos={d.asientos} abierto={d.abierto} onAlternar={d.alternar} textos={textos} agrupar={agrupar} /> : null}
      onParteComprobada={d.sumar}
      onAvanzar={d.plegar}
      onReiniciar={d.reiniciar}
    />
  );
}
