import { FAE } from "../../../../theme.js";
import { SEGUNDA_T6_ACT4, P_SUBE, P_BAJA } from "../../../../data/contabilidadT6Act4.js";
import { PreguntaSegunda, OpcionesSegunda, fantasmaDe, FANTASMA, CURVA_B } from "../b5/SegundaDecision.jsx";
import { HUNDIDO, RELLENO_AMBAR } from "./TanqueProvision.jsx";
import AsientoMinimo from "./AsientoMinimo.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * b5-t6-a4 · LA SEGUNDA DECISIÓN: «¿Qué le pasa a la provisión?» (lote 19,
 * P2 de Mai).
 *
 * El tanque mini (84 × 96, el de T6 A3) va junto al asiento mínimo, en la
 * misma fila (1fr + 84), con la línea discontinua de «antes» a media altura.
 * Antes de elegir, el nivel está en esa línea (R10). Al terminar: «Sube», el
 * nivel sobre la línea; «Baja», bajo ella; «No cambia», en ella. Si hubo
 * error, el nivel elegido queda como fantasma coral discontinuo. Sin cifras.
 * El nivel se mueve con scaleY en 280 ms; con movimiento reducido, al instante.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ALTO = 96;
const NIVEL = { [P_SUBE]: 24, [P_BAJA]: 72 };
const nivelDe = (id) => NIVEL[id] ?? ALTO / 2;
const S = SEGUNDA_T6_ACT4;
const palabra = (id) => S.opciones.find((o) => o.id === id)?.texto ?? "";

export function TanqueMini({ elegidas = [], correcta = null, fin = false, reducido }) {
  const nivel = fin ? nivelDe(correcta) : ALTO / 2;
  const fantasma = fantasmaDe(elegidas, correcta, fin);
  return (
    <div data-tanque-mini data-nivel={fin ? correcta : "antes"} role="img" aria-label={fin ? `${S.rotulo}: ${palabra(correcta).toLowerCase()}` : S.rotulo}
      style={{ position: "relative", width: "84px", height: `${ALTO}px`, borderRadius: "10px", overflow: "hidden", boxSizing: "border-box", ...HUNDIDO }}>
      <span aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${ALTO}px`, background: RELLENO_AMBAR, transformOrigin: "50% 100%",
        transform: `scaleY(${(ALTO - nivel) / ALTO})`, transition: reducido ? "none" : `transform 280ms ${CURVA_B}` }} />
      <span aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, top: `${nivel - 1}px`, height: "2px", background: FAE.ambar, transition: reducido ? "none" : `top 280ms ${CURVA_B}` }} />
      {/* La línea de «antes», a media altura. */}
      <span aria-hidden="true" data-linea-antes style={{ position: "absolute", left: 0, right: 0, top: `${ALTO / 2}px`, borderTop: `2px dashed ${FAE.text}` }} />
      {fantasma && <span aria-hidden="true" data-fantasma={fantasma} style={{ position: "absolute", left: "6px", right: "6px", top: `${nivelDe(fantasma) - 1}px`, borderTop: FANTASMA }} />}
      <span aria-hidden="true" style={{ position: "absolute", left: "5px", top: "4px", fontFamily: "Inter, sans-serif", fontSize: "12px", lineHeight: "14px", color: FAE.text }}>{S.rotulo}</span>
    </div>
  );
}

/* La figura de a4 con la segunda decisión: el asiento mínimo y, en la misma fila, el tanque mini. */
export function AsientoConTanque({ hecho, elegida, reducido, segunda }) {
  return (
    <div data-asiento-con-tanque style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 84px", columnGap: "8px", alignItems: "start" }}>
      <div style={{ minWidth: 0 }}><AsientoMinimo hecho={hecho} elegida={elegida} reducido={reducido} /></div>
      <TanqueMini elegidas={segunda?.elegidas} correcta={segunda?.correcta} fin={segunda?.fin} reducido={reducido} />
    </div>
  );
}

/* Las opciones de la decisión 2, debajo de la devolución de la 1. */
export default function SegundaProvision({ activa, elegidas, correcta, fin, onElegir }) {
  return (
    <div data-segunda-decision="provision">
      <PreguntaSegunda texto={S.pregunta} />
      <OpcionesSegunda opciones={S.opciones} elegidas={elegidas} correcta={correcta} fin={fin} activa={activa} onElegir={onElegir} />
    </div>
  );
}
