import { FAE } from "../../../../theme.js";
import { SEGUNDA_T5_ACT1, RENTA_INTERES, RENTA_DIFERENCIA } from "../../../../data/contabilidadT5Act1.js";
import { PreguntaSegunda, OpcionesSegunda, fantasmaDe, FANTASMA, CURVA_B } from "../b5/SegundaDecision.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * b5-t5-a1 · LA SEGUNDA DECISIÓN: «¿Cómo recibe su renta quien lo tiene?»
 * (lote 19, P2 de Mai).
 *
 * La tira de renta es la Línea de la capa 1, de «Compra» a «Redención»: 8
 * periodos y 56 px de alto. Cada opción dibuja otra tira (y su miniatura de
 * 72 × 28 va junto a su palabra): interés fijo, 8 barras iguales; diferencia,
 * nada hasta el final y una barra en la redención; según los resultados,
 * barras desiguales, con huecos. Antes de elegir, la tira está vacía (R10);
 * al terminar, lo correcto y, si hubo error, el fantasma de lo elegido. Las
 * barras crecen con scaleY en 280 ms; con movimiento reducido, al instante.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const PATRON = {
  [RENTA_INTERES]: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
  [RENTA_DIFERENCIA]: [0, 0, 0, 0, 0, 0, 0, 1],
  resultados: [0.7, 0, 0.4, 1, 0, 0.55, 0.25, 0.85],
};
const SOLIDO = { background: "rgba(184,196,212,0.45)", border: `1.5px solid ${FAE.text}` };

/* La miniatura de cada opción (72 × 28). */
function Mini({ id }) {
  return (
    <svg width="72" height="28" viewBox="0 0 72 28">
      <line x1="1" y1="27" x2="71" y2="27" stroke="#B8C4D4" strokeWidth="1" />
      {PATRON[id].map((v, k) => v > 0 && <rect key={k} x={2 + k * 8.75} y={27 - v * 24} width="6" height={v * 24} rx="1" fill="rgba(203,220,242,0.55)" stroke="#CBDCF2" strokeWidth="1" />)}
    </svg>
  );
}

function Barras({ id, estilo, reducido, atributos }) {
  return (
    <span {...atributos} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", gap: "6px" }}>
      {PATRON[id].map((v, k) => (
        <span key={k} style={{ flex: "1 1 0", height: "100%", display: "flex", alignItems: "flex-end" }}>
          {v > 0 && <span style={{ display: "block", width: "100%", height: `${v * 100}%`, boxSizing: "border-box", borderRadius: "3px 3px 0 0", transformOrigin: "50% 100%", animation: reducido ? "none" : `b5-crece 280ms ${CURVA_B} both`, ...estilo }} />}
        </span>
      ))}
    </span>
  );
}

export default function TiraDeRenta({ ficha, activa, elegidas, correcta, fin, onElegir, reducido }) {
  const S = SEGUNDA_T5_ACT1;
  const fantasma = fantasmaDe(elegidas, correcta, fin);
  const nombre = (id) => S.opciones.find((o) => o.id === id)?.texto;
  return (
    <div data-segunda-decision="renta" data-ficha-segunda={ficha.id} style={{ marginTop: "4px" }}>
      <style>{"@keyframes b5-crece { from { transform: scaleY(0); } to { transform: none; } }"}</style>
      <PreguntaSegunda texto={S.pregunta} />
      <OpcionesSegunda opciones={S.opciones} elegidas={elegidas} correcta={correcta} fin={fin} activa={activa} onElegir={onElegir} Mini={Mini} />
      {/* La tira de renta: vacía hasta el final; luego lo correcto y el fantasma de lo elegido. */}
      <div data-tira-renta role="img" aria-label={fin ? nombre(correcta) : S.pregunta} style={{ marginTop: "10px" }}>
        <div style={{ position: "relative", height: "56px", borderBottom: "1px solid #B8C4D4", display: "flex", gap: "6px" }}>
          {PATRON[RENTA_INTERES].map((_, k) => <span key={k} style={{ flex: "1 1 0", borderBottom: "1px dashed rgba(248,249,250,0.18)" }} />)}
          {fin && fantasma && <Barras id={fantasma} reducido={reducido} estilo={{ border: FANTASMA, background: "transparent" }} atributos={{ "data-fantasma": fantasma }} />}
          {fin && <Barras id={correcta} reducido={reducido} estilo={SOLIDO} atributos={{ "data-correcta-tira": correcta }} />}
        </div>
        <div aria-hidden="true" style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontFamily: "Inter, sans-serif", fontSize: "12px", lineHeight: "16px", color: "#A8B6C8" }}>
          <span>{S.compra}</span><span>{S.redencion}</span>
        </div>
      </div>
    </div>
  );
}
