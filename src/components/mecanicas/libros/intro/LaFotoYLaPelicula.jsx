import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import {
  FOTOS, TEXTOS_P3, CIERRE_P3, ROTULO_CIERRE_P3, ALTERNATIVOS_P3,
} from "../../../../data/contabilidadPiezas234.js";
import { BOTON_REPETIR, BOTON_SIGUIENTE } from "../../../../data/contabilidadIntro.js";
import { useMovimientoReducido, SOLO_LECTOR } from "../verbos.jsx";
import { Foto, Banda } from "./LineaDelTiempo.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PIEZA 3 · CAPA 2 — «Mírelo funcionar».
 *
 * Cuatro segmentos sobre la estructura vertical: la marca de arriba, la de
 * abajo, y el tramo entre las dos.
 *
 * ═══════════ LAS DOS FOTOS NO CAMBIAN DE TAMAÑO NUNCA ═══════════
 *
 * Ni cuando solo una está tomada. El hueco de la que falta se reserva con la
 * misma caja vacía, así que al aparecer la segunda nada se mueve de sitio y
 * las dos se pueden comparar sin volver a buscarlas.
 *
 * ═══════════ LA BANDA NO LATE ═══════════
 *
 * Se llena de extremo a extremo una vez y se queda quieta. La propuesta
 * original pedía un pulso reutilizando el patrón de la franja del anillo de la
 * pieza 1; quedó anulada, y con razón: esa franja ya significa otra cosa.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS = `
@keyframes fae-p3-destello { 0% { opacity: 0; transform: scale(0.98); } 40% { opacity: 1; } 100% { opacity: 1; transform: none; } }
.fae-p3-destello { animation: fae-p3-destello 400ms ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .fae-p3-destello { animation: none !important; opacity: 1 !important; transform: none !important; }
}
`;

const SORA = "Sora, sans-serif";
const PASOS = 4;
export const PASO_DEL_CIERRE_P3 = PASOS + 1;
const MS = 600;

/* Qué hay en pantalla en cada paso, y con cuánto llenado va la banda. */
export const ESTADO_DEL_PASO = {
  1: { fotos: 0, llenado: 0 },
  2: { fotos: 1, llenado: 0 },
  3: { fotos: 2, llenado: 0 },
  4: { fotos: 2, llenado: 1 },
};

/* El hueco de una foto que todavía no se ha tomado: misma caja, sin contenido. */
function Hueco({ cuando }) {
  return (
    <div data-hueco={cuando} style={{
      padding: "9px 11px", borderRadius: "11px", minHeight: "62px",
      background: "rgba(10,20,34,0.2)", border: "1px dashed rgba(248,249,250,0.2)",
      display: "flex", alignItems: "center",
    }}>
      <span style={{ fontSize: "12px", color: "#A8B6C8" }}>{cuando}</span>
    </div>
  );
}

export default function LaFotoYLaPelicula() {
  const reducido = useMovimientoReducido();
  const [paso, setPaso] = useState(1);
  const [repeticion, setRepeticion] = useState(0);
  const [transformando, setTransformando] = useState(false);
  const reloj = useRef(null);

  const cerrado = paso >= PASO_DEL_CIERRE_P3;
  const visible = Math.min(paso, PASOS);
  const estado = cerrado ? ESTADO_DEL_PASO[PASOS] : ESTADO_DEL_PASO[visible];

  useEffect(() => () => clearTimeout(reloj.current), []);
  useEffect(() => {
    if (reducido) { setTransformando(false); return undefined; }
    setTransformando(true);
    clearTimeout(reloj.current);
    reloj.current = setTimeout(() => setTransformando(false), MS);
    return () => clearTimeout(reloj.current);
  }, [paso, repeticion, reducido]);

  const texto = cerrado ? CIERRE_P3 : TEXTOS_P3[visible];
  const alternativo = cerrado ? ALTERNATIVOS_P3.cierre : ALTERNATIVOS_P3[visible];
  const puede = !transformando;
  const destello = reducido ? undefined : "fae-p3-destello";

  const boton = (activo) => ({
    padding: "9px 15px", borderRadius: "999px", fontFamily: SORA, fontSize: "12.5px", fontWeight: 600,
    cursor: activo ? "pointer" : "default", background: "transparent",
    border: `1px solid ${activo ? "rgba(248,249,250,0.3)" : "rgba(248,249,250,0.1)"}`,
    color: activo ? FAE.text : "rgba(248,249,250,0.35)",
  });

  return (
    <div data-pieza3 data-paso={paso}>
      <style>{CSS}</style>

      <p style={{ margin: "0 0 9px", fontFamily: SORA, fontSize: "12px", fontWeight: 600, color: "#A8B6C8" }}>
        {cerrado ? ROTULO_CIERRE_P3 : `Paso ${visible} de ${PASOS}`}
      </p>

      <div key={`${paso}-${repeticion}`} style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
        {estado.fotos >= 1
          ? <div className={destello}><Foto foto={FOTOS[0]} resaltada={cerrado} /></div>
          : <Hueco cuando={FOTOS[0].cuando} />}

        <Banda llenado={estado.llenado} reducido={reducido} resaltada={visible === 4 && !cerrado} />

        {estado.fotos >= 2
          ? <div className={destello}><Foto foto={FOTOS[1]} resaltada={cerrado} /></div>
          : <Hueco cuando={FOTOS[1].cuando} />}
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
