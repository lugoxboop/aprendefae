import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import {
  TEXTOS_P4, CIERRE_P4, ROTULO_CIERRE_P4, FLECHAS_P4, ALTERNATIVOS_P4,
} from "../../../../data/contabilidadPiezas234.js";
import { informeQueRecibeP4 } from "../../../../contabilidad/aprenderTema1.js";
import { BOTON_REPETIR, BOTON_SIGUIENTE } from "../../../../data/contabilidadIntro.js";
import { useMovimientoReducido, SOLO_LECTOR } from "../verbos.jsx";
import TresInformes from "./TresInformes.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PIEZA 4 · CAPA 2 — «Mírelo funcionar».
 *
 * Cuatro segmentos. Una flecha a la vez, salvo el segmento 4 —que enseña las
 * tres de la plata— y el cierre, donde las cinco se dibujan juntas porque la
 * convergencia ES la lección.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CSS_P4 = `
@keyframes fae-p4-viaja { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
.fae-p4-viaja { animation: fae-p4-viaja 500ms cubic-bezier(.26,.84,.38,1) both; }
@keyframes fae-p4-traza { from { opacity: 0; } to { opacity: 1; } }
.fae-p4-traza { animation: fae-p4-traza 500ms ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .fae-p4-viaja, .fae-p4-traza { animation: none !important; opacity: 1 !important; transform: none !important; }
}
`;

const SORA = "Sora, sans-serif";
const PASOS = 4;
export const PASO_DEL_CIERRE_P4 = PASOS + 1;
const MS = 600;

/* Qué flechas enseña cada segmento. El cierre las enseña las cinco. */
export const FLECHAS_DEL_PASO = {
  1: [],
  2: ["f1"],
  3: ["f2"],
  4: ["f3", "f4", "f5"],
};

export default function ComoSeArticulan() {
  const reducido = useMovimientoReducido();
  const [paso, setPaso] = useState(1);
  const [repeticion, setRepeticion] = useState(0);
  const [transformando, setTransformando] = useState(false);
  const reloj = useRef(null);

  const cerrado = paso >= PASO_DEL_CIERRE_P4;
  const visible = Math.min(paso, PASOS);
  const activas = cerrado ? FLECHAS_P4.map((f) => f.id) : FLECHAS_DEL_PASO[visible];
  /* La única que viaja es la del saldo final, y solo cuando es la que se enseña. */
  const viajando = !cerrado && activas.includes("f2") ? "f2" : null;

  useEffect(() => () => clearTimeout(reloj.current), []);
  useEffect(() => {
    if (reducido) { setTransformando(false); return undefined; }
    setTransformando(true);
    clearTimeout(reloj.current);
    reloj.current = setTimeout(() => setTransformando(false), MS);
    return () => clearTimeout(reloj.current);
  }, [paso, repeticion, reducido]);

  const texto = cerrado ? CIERRE_P4 : TEXTOS_P4[visible];
  const alternativo = cerrado ? ALTERNATIVOS_P4.cierre : ALTERNATIVOS_P4[visible];
  const puede = !transformando;

  const boton = (activo) => ({
    padding: "9px 15px", borderRadius: "999px", fontFamily: SORA, fontSize: "12.5px", fontWeight: 600,
    cursor: activo ? "pointer" : "default", background: "transparent",
    border: `1px solid ${activo ? "rgba(248,249,250,0.3)" : "rgba(248,249,250,0.1)"}`,
    color: activo ? FAE.text : "rgba(248,249,250,0.35)",
  });

  return (
    <div data-pieza4 data-paso={paso}>
      <style>{CSS_P4}</style>

      <p style={{ margin: "0 0 9px", fontFamily: SORA, fontSize: "12px", fontWeight: 600, color: "#A8B6C8" }}>
        {cerrado ? ROTULO_CIERRE_P4 : `Paso ${visible} de ${PASOS}`}
      </p>

      <div key={`${paso}-${repeticion}`} className={reducido ? undefined : "fae-p4-traza"}>
        <TresInformes
          activas={activas}
          viajando={viajando}
          resaltar={cerrado ? informeQueRecibeP4() : null}
          reducido={reducido}
        />
      </div>

      <p data-texto-paso aria-live="polite" style={{
        margin: "12px 0 0", fontSize: "13.5px", lineHeight: 1.6, color: FAE.text,
      }}>
        {texto}
      </p>
      <p data-alternativo style={SOLO_LECTOR}>{alternativo}</p>

      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
        <button type="button" data-repetir disabled={!puede} onClick={() => { if (puede) setRepeticion((r) => r + 1); }} style={boton(puede)}>
          {BOTON_REPETIR}
        </button>
        <button type="button" data-siguiente disabled={!puede || cerrado} onClick={() => { if (puede && !cerrado) setPaso((p) => p + 1); }} style={boton(puede && !cerrado)}>
          {BOTON_SIGUIENTE}
        </button>
        {cerrado && (
          <button type="button" data-reiniciar onClick={() => { setPaso(1); setRepeticion((r) => r + 1); }} style={boton(true)}>
            Desde el principio
          </button>
        )}
      </div>
    </div>
  );
}
