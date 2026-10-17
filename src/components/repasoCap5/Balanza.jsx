import { useState } from "react";
import { C, INTER, MARCA, CIFRA, HUNDIDO } from "./comun.jsx";
import { useReducido, useCifra } from "./movimiento.js";
import { pesos } from "../../data/contabilidad.js";
import { balanzaTras, anguloDe, MOVIMIENTO_BALANZA, RETENCION_FINAL } from "../../data/repasoCap5Balanza.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * r5-3 · LA BALANZA DEL IVA (P2 de Itagaki, «Marzo en Comercializadora Mate»).
 *
 * Va después del mensaje, en el hundido. Fiel de 12 px #B8C4D4; brazo de 4 px
 * #F8F9FA que gira sobre su centro (θ = 12° × (haber − debe) / máx del mes);
 * platillos colgados a 24 px de los extremos, siempre horizontales. Debajo:
 * DEBE (barra teal) y HABER (barra ámbar) con su rótulo y su acumulado en mono
 * 13; el renglón de diferencia; el sobre de la retención, con su barra ámbar
 * (es una deuda: HABER).
 *
 * Al comprobar caen las pesas (24 px, 260 ms), los acumulados cuentan (400 ms),
 * el brazo gira (500 ms) y el sobre se llena (400 ms). Un toque la lleva al
 * estado final. Con movimiento reducido, todo aparece directo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CURVA = "cubic-bezier(.3,.9,.4,1)";
export const CSS_BALANZA = `
@keyframes r53-pesa { from { transform: translateY(-24px); opacity: 0; } to { transform: none; opacity: 1; } }
.r53-pesa { animation: r53-pesa 260ms ${CURVA} both; }
[data-balanza] { --brazo: 200px; --platillo: 92px; }
@media (min-width: 360px) { [data-balanza] { --brazo: 250px; --platillo: 116px; } }
@media (prefers-reduced-motion: reduce) { .r53-pesa { animation: none; } }
`;

function Columna({ lado, rotulo, valor, desde, ms }) {
  const pintado = useCifra(valor, ms, desde);
  return (
    <div data-columna-balanza={lado} style={{ flex: 1, minWidth: 0, textAlign: lado === "debe" ? "left" : "right" }}>
      <span style={{ display: "inline-flex", flexDirection: "column", alignItems: lado === "debe" ? "flex-start" : "flex-end" }}>
        <span style={MARCA}>{lado === "debe" ? "DEBE" : "HABER"}</span>
        <span aria-hidden="true" style={{ marginTop: "2px", width: "24px", height: "3px", background: lado === "debe" ? C.teal : C.ambar }} />
      </span>
      <span style={{ display: "block", marginTop: "4px", fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: C.atenuado }}>{rotulo}</span>
      <span data-acumulado-balanza={lado} data-valor={valor} style={{ display: "block", ...CIFRA, fontSize: "13px", lineHeight: "18px", fontWeight: 600, color: C.texto, whiteSpace: "nowrap" }}>{pesos(Math.round(pintado))}</span>
    </div>
  );
}

/* Las pesas de un platillo: una por asiento que puso IVA en ese lado (hasta 5 a la vista). */
function Pesas({ n, nueva, reducido }) {
  return (
    <span style={{ position: "absolute", left: 0, right: 0, bottom: "4px", display: "flex", justifyContent: "center", gap: "2px" }}>
      {Array.from({ length: Math.min(5, n) }, (_, k) => (
        <span key={k} data-pesa className={nueva && k === Math.min(5, n) - 1 && !reducido ? "r53-pesa" : undefined} style={{ width: "16px", height: "10px", borderRadius: "2px", background: C.hecho }} />
      ))}
    </span>
  );
}

/*
 * `hechos`: asientos ya en la balanza; `antes`: los que había antes de este
 * (las cifras cuentan desde ahí). `textos`: los de Miyata (BALANZA_R5_3).
 */
export function Balanza({ hechos, antes = hechos, textos }) {
  const reducido = useReducido();
  const [saltar, setSaltar] = useState(false);
  const quieta = reducido || saltar;
  const e = balanzaTras(hechos);
  const p = balanzaTras(antes);
  const ms = quieta ? 0 : 400;
  const theta = anguloDe(e.diferencia);
  const nDebe = MOVIMIENTO_BALANZA.slice(0, hechos).filter((m) => m.debe).length;
  const nHaber = MOVIMIENTO_BALANZA.slice(0, hechos).filter((m) => m.haber).length;
  const nuevaDebe = hechos > antes && MOVIMIENTO_BALANZA[hechos - 1]?.debe > 0;
  const nuevaHaber = hechos > antes && MOVIMIENTO_BALANZA[hechos - 1]?.haber > 0;
  const giro = quieta ? "none" : `transform 500ms ${CURVA}`;
  const lleno = RETENCION_FINAL ? Math.max(0, e.retencion) / RETENCION_FINAL : 0;
  const frase = e.diferencia >= 0 ? textos.aPagar : textos.aFavor;
  const nombre = `${textos.platilloDebe} ${pesos(e.debe)}; ${textos.platilloHaber} ${pesos(e.haber)}; ${frase} ${pesos(Math.abs(e.diferencia))}; ${textos.sobre} ${pesos(e.retencion)}`;
  return (
    <div data-balanza data-hechos={hechos} data-angulo={theta.toFixed(2)} onClick={() => setSaltar(true)} style={{ ...HUNDIDO, borderRadius: "12px", padding: "12px", cursor: quieta ? "default" : "pointer" }}>
      <div role="img" aria-label={nombre} aria-live="polite">
        {/* Fiel, brazo y platillos: 72 px. */}
        <div aria-hidden="true" style={{ position: "relative", height: "72px" }}>
          <div data-brazo style={{ position: "absolute", left: "50%", top: "12px", width: "var(--brazo)", height: "4px", marginLeft: "calc(var(--brazo) / -2)", background: C.texto, borderRadius: "2px", transform: `rotate(${theta}deg)`, transition: giro }}>
            {["debe", "haber"].map((lado) => (
              <div key={lado} data-platillo={lado} style={{ position: "absolute", top: "2px", [lado === "debe" ? "left" : "right"]: "calc(24px - var(--platillo) / 2)", width: "var(--platillo)", height: "40px", transformOrigin: "50% 0", transform: `rotate(${-theta}deg)`, transition: giro }}>
                <span style={{ position: "absolute", left: "50%", top: 0, width: "1px", height: "28px", background: C.atenuado }} />
                <span style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "3px", borderRadius: "2px", background: C.atenuado }} />
                <Pesas n={lado === "debe" ? nDebe : nHaber} nueva={lado === "debe" ? nuevaDebe : nuevaHaber} reducido={quieta} />
              </div>
            ))}
          </div>
          <span style={{ position: "absolute", left: "50%", top: "16px", marginLeft: "-6px", width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderBottom: `12px solid ${C.atenuado}` }} />
        </div>
        {/* Rótulos y cifras: 34 px (más su rótulo). */}
        <div style={{ display: "flex", gap: "12px" }}>
          <Columna lado="debe" rotulo={textos.platilloDebe} valor={e.debe} desde={p.debe} ms={ms} />
          <Columna lado="haber" rotulo={textos.platilloHaber} valor={e.haber} desde={p.haber} ms={ms} />
        </div>
        {/* La diferencia: 22 px, centrada. */}
        <p data-diferencia-balanza={e.diferencia >= 0 ? "a-pagar" : "a-favor"} style={{ margin: "8px 0 0", minHeight: "22px", display: "flex", justifyContent: "center", gap: "8px", alignItems: "baseline" }}>
          <span style={{ fontFamily: INTER, fontSize: "13px", color: C.atenuado }}>{frase}</span>
          <span style={{ ...CIFRA, fontSize: "13px", fontWeight: 600, color: C.texto }}>{pesos(Math.abs(e.diferencia))}</span>
        </p>
        {/* El sobre de la retención: 40 px. */}
        <div data-sobre style={{ marginTop: "8px", minHeight: "40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "baseline" }}>
            <span style={{ fontFamily: INTER, fontSize: "12px", color: C.atenuado }}>{textos.sobre}</span>
            <span data-acumulado-balanza="retencion" data-valor={e.retencion} style={{ ...CIFRA, fontSize: "13px", fontWeight: 600, color: C.texto }}>{pesos(e.retencion)}</span>
          </div>
          <div style={{ marginTop: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ flex: 1, height: "8px", borderRadius: "4px", background: "rgba(248,249,250,0.12)", overflow: "hidden" }}>
              <div data-sobre-lleno={lleno.toFixed(3)} style={{ width: "100%", height: "100%", background: C.ambar, transformOrigin: "0 50%", transform: `scaleX(${lleno})`, transition: quieta ? "none" : `transform 400ms ${CURVA}` }} />
            </div>
            <span style={MARCA}>HABER</span>
          </div>
        </div>
      </div>
    </div>
  );
}
