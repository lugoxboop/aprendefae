import { FAE } from "../../../../theme.js";
import { pesos } from "../../../../data/contabilidad.js";
import { PRECIO_T5_ACT2 } from "../../../../data/contabilidadT5Act2.js";
import { CIFRA_MONO, RELLENO_AMBAR, RAYADO_TEAL, CURVA } from "../tema6/TanqueProvision.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * b5-t5-a2 · «PRECIO POR TÍTULO» (lote 20, D9, P2 de Mai).
 *
 * Solo en los asientos de venta, y solo tras confirmar (R10: antes no está).
 * Un eje de precio con el costo de cada título (marca discontinua) y el precio
 * de venta (marca sólida). La zona entre las dos se llena: arriba del costo es
 * ganancia, con relleno ámbar (va al HABER); abajo, pérdida, rayada en teal
 * (va al DEBE). Bajo la zona, su palabra. Escala: x(v) = (v − (costo − 100))
 * / 300 (con el costo de $800: 800 → 33,3 %, 920 → 73,3 %, 750 → 16,7 %).
 * La zona crece con scaleX desde la marca del costo en 240 ms; con movimiento
 * reducido, al instante. Las cifras, en la pila monoespaciada (lote 9).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const T = PRECIO_T5_ACT2;
const pct = (v, costo) => Math.min(100, Math.max(0, ((v - (costo - 100)) / 300) * 100));

export default function PrecioPorTitulo({ actual, reducido }) {
  if (!actual?.precio) return null;
  const { costo, venta } = actual.precio;
  const gana = venta > costo;
  const xc = pct(costo, costo);
  const xv = pct(venta, costo);
  const palabra = gana ? T.ganancia : T.perdida;
  const izquierda = Math.min(xc, xv);
  const ancho = Math.abs(xv - xc);
  const marca = (x, texto, solida, atributo) => (
    <span {...atributo} style={{ position: "absolute", left: `${x}%`, top: 0, bottom: 0, transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <span style={{ ...CIFRA_MONO, fontSize: "12px", fontWeight: 700, lineHeight: "16px", color: FAE.text }}>{texto}</span>
      <span style={{ flex: "1 1 auto", borderLeft: `2px ${solida ? "solid" : "dashed"} ${FAE.text}` }} />
    </span>
  );
  return (
    <div data-precio-por-titulo data-resultado={gana ? "ganancia" : "perdida"} role="img" aria-label={T.lector(pesos(costo), pesos(venta), palabra)}
      style={{ margin: "14px 0 0", padding: "10px 12px 8px", borderRadius: "12px", background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.12)" }}>
      <p style={{ margin: "0 0 6px", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600, lineHeight: 1.3, color: FAE.text }}>{T.titulo}</p>
      <div aria-hidden="true" style={{ position: "relative", height: "62px" }}>
        {/* La zona: crece desde la marca del costo. */}
        <span data-zona style={{
          position: "absolute", top: "20px", height: "26px", left: `${izquierda}%`, width: `${ancho}%`, boxSizing: "border-box",
          ...(gana ? { background: RELLENO_AMBAR, borderTop: `2px solid ${FAE.ambar}` } : { backgroundImage: RAYADO_TEAL, borderBottom: `2px solid ${FAE.teal}` }),
          transformOrigin: gana ? "0 50%" : "100% 50%", animation: reducido ? "none" : `b5-zona 240ms ${CURVA} both`,
        }} />
        <span style={{ position: "absolute", left: 0, right: 0, top: "46px", borderTop: "1px solid #B8C4D4" }} />
        {marca(xc, pesos(costo), false, { "data-costo": costo })}
        {marca(xv, pesos(venta), true, { "data-venta": venta })}
        <span data-palabra-zona style={{ position: "absolute", top: "48px", left: `${izquierda}%`, width: `${ancho}%`, textAlign: "center", fontFamily: "Inter, sans-serif", fontSize: "12px", lineHeight: "14px", color: "#A8B6C8", whiteSpace: "nowrap" }}>{palabra}</span>
      </div>
      <style>{"@keyframes b5-zona { from { transform: scaleX(0); } to { transform: none; } }"}</style>
    </div>
  );
}
