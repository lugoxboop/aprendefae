import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import { NEUTRO } from "../../../../data/contabilidadIntro.js";
import {
  TEXTOS_P2, CIERRE_P2, CASOS_P2, ALTERNATIVOS_P2,
} from "../../../../data/contabilidadPiezas234.js";
import { cambioDelCaso, movimientoDelCaso } from "../../../../contabilidad/aprenderTema1.js";
import { useMovimientoReducido, SOLO_LECTOR } from "../verbos.jsx";
import { BOTON_REPETIR, BOTON_SIGUIENTE } from "../../../../data/contabilidadIntro.js";
import Torre, { LineaDeAltura } from "./Torre.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PIEZA 2 · CAPA 2 — «Mírelo funcionar».
 *
 * Cinco segmentos sobre la MISMA torre. Lo que cambia entre uno y otro no es
 * la torre: es qué lectura está encendida. Si en algún paso se dibujaran dos
 * torres, la pieza estaría diciendo lo contrario de lo que enseña.
 *
 * Nada avanza solo: cada segmento se detiene y espera a Repetir o Siguiente.
 * Mientras la transformación corre, los dos botones no responden.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS = `
@keyframes fae-p2-aparece { from { opacity: 0; } to { opacity: 1; } }
.fae-p2-aparece { animation: fae-p2-aparece 500ms ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .fae-p2-aparece { animation: none !important; opacity: 1 !important; }
}
`;

const SORA = "Sora, sans-serif";
const PASOS = 5;
export const PASO_DEL_CIERRE = PASOS + 1;
const MS = 500;

/* Qué lectura enseña cada segmento. El 5 recorre los cuatro casos. */
export const LADO_DEL_PASO = {
  1: "ninguna", 2: "izquierda", 3: "derecha", 4: "ambas", 5: "ambas",
};

export default function LaEcuacionContable() {
  const reducido = useMovimientoReducido();
  const [paso, setPaso] = useState(1);
  const [repeticion, setRepeticion] = useState(0);
  const [caso, setCaso] = useState(0);
  const [transformando, setTransformando] = useState(false);
  const reloj = useRef(null);

  const cerrado = paso >= PASO_DEL_CIERRE;
  const visible = Math.min(paso, PASOS);
  const enLosCasos = visible === 5 || cerrado;
  const casoActual = CASOS_P2[caso];

  useEffect(() => () => clearTimeout(reloj.current), []);
  useEffect(() => {
    if (reducido) { setTransformando(false); return undefined; }
    setTransformando(true);
    clearTimeout(reloj.current);
    reloj.current = setTimeout(() => setTransformando(false), MS);
    return () => clearTimeout(reloj.current);
  }, [paso, repeticion, caso, reducido]);

  const lado = cerrado ? "ambas" : LADO_DEL_PASO[visible];
  const cambio = enLosCasos ? cambioDelCaso(casoActual) : null;
  const texto = cerrado ? CIERRE_P2 : TEXTOS_P2[visible];
  const alternativo = cerrado ? ALTERNATIVOS_P2.cierre : ALTERNATIVOS_P2[visible];
  const puede = !transformando;

  const boton = (activo) => ({
    padding: "9px 15px", borderRadius: "999px", fontFamily: SORA, fontSize: "12.5px", fontWeight: 600,
    cursor: activo ? "pointer" : "default", background: "transparent",
    border: `1px solid ${activo ? "rgba(248,249,250,0.3)" : "rgba(248,249,250,0.1)"}`,
    color: activo ? FAE.text : "rgba(248,249,250,0.35)",
  });

  return (
    <div data-pieza2 data-paso={paso}>
      <style>{CSS}</style>

      <p style={{ margin: "0 0 9px", fontFamily: SORA, fontSize: "11px", fontWeight: 600, color: "rgba(248,249,250,0.55)" }}>
        {cerrado ? "La regla" : `Paso ${visible} de ${PASOS}`}
      </p>

      <div key={`${paso}-${repeticion}-${caso}`} className={reducido ? undefined : "fae-p2-aparece"}>
        <Torre lado={lado} cambio={cambio} reducido={reducido} />
        {/* La línea de la misma altura solo cuando las dos lecturas están a la vista. */}
        {(lado === "ambas") && <LineaDeAltura />}
      </div>

      {enLosCasos && (
        <div data-casos style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "10px" }}>
          {CASOS_P2.map((c, k) => {
            const activo = k === caso;
            const m = movimientoDelCaso(c);
            return (
              <button
                key={c.id}
                type="button"
                data-caso={c.id}
                data-activo={activo ? "si" : "no"}
                aria-pressed={activo}
                onClick={() => { setCaso(k); setRepeticion((r) => r + 1); }}
                style={{
                  padding: "5px 9px", borderRadius: "999px", cursor: "pointer",
                  background: activo ? NEUTRO : "transparent",
                  color: activo ? "#1D3557" : "rgba(248,249,250,0.72)",
                  border: `1px solid ${activo ? NEUTRO : "rgba(248,249,250,0.22)"}`,
                  fontFamily: SORA, fontSize: "10.5px", fontWeight: activo ? 700 : 500,
                }}
              >
                {c.id}. {c.nombre}
                <span data-mueve={m.izquierda} style={{ marginLeft: "5px", opacity: 0.8 }}>
                  {m.izquierda === "suben" ? "↑↑" : "↓↓"}
                </span>
              </button>
            );
          })}
        </div>
      )}

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
          <button type="button" data-reiniciar onClick={() => { setPaso(1); setCaso(0); setRepeticion((r) => r + 1); }} style={boton(true)}>
            Desde el principio
          </button>
        )}
      </div>
    </div>
  );
}
