import { FAE } from "../../../../theme.js";
import { SEGUNDA_T5_ACT1, RENTA_INTERES, RENTA_DIFERENCIA, INVERTIDA_T5_ACT1 } from "../../../../data/contabilidadT5Act1.js";
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
 *
 * LOTE 23 (D4, Shoko): en el error se dibuja lo que eligió el estudiante,
 * como fantasma, desde el primer error (antes, la tira quedaba vacía hasta el
 * final). Y la pregunta invertida (`GraficoDeRenta`): en la mitad de las
 * fichas se ve la tira de la renta y se elige el título, con los cajones; el
 * cajón tocado por error dibuja su renta como fantasma sobre la tira.
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
  /* Lote 23: lo que eligió por error se dibuja ya en el primer error; lo correcto, solo al final (C2). */
  const fantasma = fin ? fantasmaDe(elegidas, correcta, fin) : elegidas.filter((x) => x !== correcta).at(-1) ?? null;
  const nombre = (id) => S.opciones.find((o) => o.id === id)?.texto;
  return (
    <div data-segunda-decision="renta" data-ficha-segunda={ficha.id} style={{ marginTop: "4px" }}>
      <style>{"@keyframes b5-crece { from { transform: scaleY(0); } to { transform: none; } }"}</style>
      <PreguntaSegunda texto={S.pregunta} />
      <OpcionesSegunda opciones={S.opciones} elegidas={elegidas} correcta={correcta} fin={fin} activa={activa} onElegir={onElegir} Mini={Mini} />
      {/* La tira de renta: vacía hasta el final; luego lo correcto. Lo elegido por error, como fantasma desde que se elige. */}
      <Tira etiqueta={fin ? nombre(correcta) : S.pregunta} fantasma={fantasma} correcta={fin ? correcta : null} reducido={reducido} />
    </div>
  );
}

/* La tira, de «Compra» a «Redención»: lo correcto en sólido y lo elegido por error como fantasma. */
function Tira({ etiqueta, fantasma, correcta, reducido, atributos = {} }) {
  const S = SEGUNDA_T5_ACT1;
  return (
    <div data-tira-renta role="img" aria-label={etiqueta} {...atributos} style={{ marginTop: "10px" }}>
      <div style={{ position: "relative", height: "56px", borderBottom: "1px solid #B8C4D4", display: "flex", gap: "6px" }}>
        {PATRON[RENTA_INTERES].map((_, k) => <span key={k} style={{ flex: "1 1 0", borderBottom: "1px dashed rgba(248,249,250,0.18)" }} />)}
        {correcta && <Barras id={correcta} reducido={reducido} estilo={SOLIDO} atributos={{ "data-correcta-tira": correcta }} />}
        {fantasma && <Barras id={fantasma} reducido={reducido} estilo={{ border: FANTASMA, background: "transparent" }} atributos={{ "data-fantasma": fantasma }} />}
      </div>
      <div aria-hidden="true" style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontFamily: "Inter, sans-serif", fontSize: "12px", lineHeight: "16px", color: "#A8B6C8" }}>
        <span>{S.compra}</span><span>{S.redencion}</span>
      </div>
    </div>
  );
}

/*
 * Lote 23 · la pregunta invertida: bajo la ficha («¿Qué título da esta renta?»), la tira de su renta, en
 * sólido desde el principio (es lo que se pregunta). El cajón tocado por error dibuja su renta encima,
 * como fantasma. `rentaDe` lleva de un cajón a su renta. Las demás fichas no dibujan nada aquí.
 */
export function GraficoDeRenta({ ficha, tocados, correcta, reducido, rentaDe }) {
  if (!ficha.invertida) return null;
  const renta = rentaDe(correcta);
  const errado = tocados.filter((x) => x !== correcta).at(-1);
  const fantasma = errado ? rentaDe(errado) : null;
  return (
    <div data-grafico-renta={renta} style={{ margin: "-4px 0 10px" }}>
      <style>{"@keyframes b5-crece { from { transform: scaleY(0); } to { transform: none; } }"}</style>
      <Tira etiqueta={INVERTIDA_T5_ACT1[renta].descripcion} correcta={renta} fantasma={fantasma} reducido={reducido} />
    </div>
  );
}
