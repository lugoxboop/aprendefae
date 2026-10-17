import { FAE } from "../../../../theme.js";
import { pesos } from "../../../../data/contabilidad.js";
import { CLIENTES, PROVISION, CAJA } from "../../../../data/contabilidadT6Act3.js";
import { DEBE, HABER } from "../../../../data/contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * b5-t6-a3 · LA DEUDA POR CASOS (lote 20, D9, P2 de Mai).
 *
 * Lo que el libro dice al final del ejemplo resuelto: «Los casos a, b y c
 * son tres finales distintos de este castigo». Tres barras de la deuda
 * castigada, una por caso, con tres estados por tramo: castigada (rayada,
 * borde discontinuo), revivida (contorno de 2 #F8F9FA) y pagada (relleno
 * rgba(184,196,212,.45) y contorno). Se ve desde el ejemplo resuelto (las tres
 * castigadas); cada asiento confirmado cambia su barra, que queda resaltada
 * (contorno de 2 #CBDCF2) hasta el siguiente. Los estados salen de los
 * asientos correctos (revivir: de castigada a revivida; pagar: de revivida a
 * pagada), nunca de la mesa. Alto = v / deuda · 72 px; sin cifras (las da el
 * asiento). El tramo nuevo entra por opacidad en 240 ms.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ALTO = 72;
/* Lote 23 (Shoko): la trama de «castigada» va en el neutro #B8C4D4; en Contabilidad el teal es solo DEBE. */
export const RAYADO_CASTIGADA = "repeating-linear-gradient(45deg, rgba(184,196,212,0.55) 0 3px, transparent 3px 7px)";
const ESTILO = {
  castigada: { backgroundImage: RAYADO_CASTIGADA, border: `1.5px dashed ${FAE.text}` },
  revivida: { border: `2px solid ${FAE.text}` },
  pagada: { background: "rgba(184,196,212,0.45)", border: `1.5px solid ${FAE.text}` },
};
const ORDEN = ["pagada", "revivida", "castigada"];

/* Los estados de cada caso tras las primeras `hechas` partes. */
export function estadosDeLaDeuda(partes, hechas, deuda) {
  const casos = {};
  const caso = (p) => (casos[p.fecha] ??= { pagada: 0, revivida: 0, castigada: deuda });
  partes.forEach((p) => caso(p));
  let ultimo = null;
  partes.slice(0, hechas).forEach((p) => {
    const c = caso(p);
    const v = p.asiento.find((m) => m.lado === DEBE).valor;
    if (p.asiento.some((m) => m.cuenta === PROVISION && m.lado === HABER)) { c.revivida += v; c.castigada -= v; }
    else if (p.asiento.some((m) => m.cuenta === CAJA && m.lado === DEBE) && p.asiento.some((m) => m.cuenta === CLIENTES)) { c.pagada += v; c.revivida -= v; }
    ultimo = p.fecha;
  });
  return { casos, ultimo };
}

export function crearDeudaPorCasos(textos) {
  return function DeudaPorCasos({ partes, hechas, ejemplo, reducido }) {
    const deuda = ejemplo.asiento[0].valor;
    const { casos, ultimo } = estadosDeLaDeuda(partes, hechas, deuda);
    const lector = (nombre, c) => `${nombre}: ${ORDEN.filter((k) => c[k] > 0).map((k) => `${textos[k]} ${pesos(c[k])}`).join(", ")}`;
    return (
      <div data-deuda-por-casos style={{ margin: "14px 0 0", padding: "10px 12px 8px", borderRadius: "12px", background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.12)" }}>
        <p style={{ margin: "0 0 8px", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600, lineHeight: 1.3, color: FAE.text }}>{textos.titulo}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px" }}>
          {Object.entries(casos).map(([nombre, c]) => {
            const resaltado = nombre === ultimo;
            return (
              <div key={nombre} data-caso={nombre} data-resaltado={resaltado ? "si" : "no"} role="img" aria-label={lector(nombre, c)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "4px", borderRadius: "8px", border: `2px solid ${resaltado ? FAE.node : "transparent"}` }}>
                <div aria-hidden="true" style={{ width: "36px", height: `${ALTO}px`, display: "flex", flexDirection: "column-reverse" }}>
                  {ORDEN.map((k) => c[k] > 0 && (
                    <span key={`${k}-${c[k]}`} data-tramo={k} style={{ display: "block", boxSizing: "border-box", height: `${(c[k] / deuda) * ALTO}px`, borderRadius: "3px", ...ESTILO[k], animation: reducido ? "none" : "b5-funde 240ms linear both" }} />
                  ))}
                </div>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, lineHeight: "16px", color: FAE.text }}>{nombre}</span>
              </div>
            );
          })}
        </div>
        {/* La leyenda: cada estado con su forma y su palabra (sin color solo). */}
        <div aria-hidden="true" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 12px", marginTop: "8px" }}>
          {["castigada", "revivida", "pagada"].map((k) => (
            <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontFamily: "Inter, sans-serif", fontSize: "12px", lineHeight: "16px", color: "#A8B6C8" }}>
              <span style={{ width: "14px", height: "12px", boxSizing: "border-box", borderRadius: "2px", ...ESTILO[k] }} />{textos[k]}
            </span>
          ))}
        </div>
        <style>{"@keyframes b5-funde { from { opacity: 0; } to { opacity: 1; } }"}</style>
      </div>
    );
  };
}
