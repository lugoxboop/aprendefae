import { useState } from "react";
import { FAE } from "../../../../theme.js";
import { NEUTRO, NAVY_DEL_CHIP } from "../../../../data/contabilidadIntro.js";
import {
  FOTOS, PREGUNTAS_P3, RESPUESTAS_P3, CONSIGNA_P3, FOTO,
} from "../../../../data/contabilidadPiezas234.js";
import { evaluarP3 } from "../../../../contabilidad/aprenderTema1.js";
import { useMovimientoReducido, SOLO_LECTOR } from "../verbos.jsx";
import { FiguraDelTiempo } from "./LineaDelTiempo.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PIEZA 3 · CAPA 3 — «Ahora pruebe usted».
 *
 * Cinco preguntas y tres respuestas fijas. No califica: es material teórico.
 * Lo que sí hace es explicar el error con la explicación que le toca, y cuál
 * toca depende de las DOS —cuál era la buena y cuál marcó—, no solo de lo que
 * marcó. La regla vive en `evaluarP3`.
 *
 * Las tres opciones son SIEMPRE las mismas tres, en el mismo orden. Si
 * cambiaran de sitio entre preguntas, elegir se convertiría en buscar.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";

export default function ExploraFotoOPelicula() {
  const reducido = useMovimientoReducido();
  const [i, setI] = useState(0);
  const [marcada, setMarcada] = useState(null);

  const q = PREGUNTAS_P3[i];
  const r = marcada ? evaluarP3(q, marcada) : null;
  /* Cuál foto resalta la escena lo dice la pregunta, no una regla sobre su texto. */
  const escena = r ? { tipo: r.escena, foto: q.foto } : null;

  const avanzar = () => {
    setMarcada(null);
    setI((k) => (k + 1) % PREGUNTAS_P3.length);
  };

  return (
    <div data-explora-p3 data-pregunta={q.id}>
      <p data-consigna style={{ margin: "0 0 9px", fontSize: "12px", lineHeight: 1.45, color: "rgba(248,249,250,0.6)" }}>
        {CONSIGNA_P3}
      </p>

      <p data-texto-pregunta style={{
        margin: "0 0 10px", padding: "10px 12px", borderRadius: "11px",
        fontFamily: SORA, fontSize: "13px", fontWeight: 700, lineHeight: 1.4, color: FAE.text,
        background: "rgba(10,20,34,0.5)", border: "1px solid rgba(248,249,250,0.18)",
      }}>
        {q.texto}
      </p>

      {/* Las tres, siempre las mismas y siempre en el mismo orden. */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {RESPUESTAS_P3.map((op) => {
          const esta = marcada === op.id;
          const buena = Boolean(r) && op.id === q.respuesta;
          return (
            <button
              key={op.id}
              type="button"
              data-respuesta={op.id}
              data-elegida={esta ? "si" : "no"}
              data-buena={buena ? "si" : undefined}
              aria-pressed={esta}
              disabled={Boolean(marcada)}
              onClick={() => setMarcada(op.id)}
              style={{
                textAlign: "left", padding: "9px 11px", borderRadius: "10px",
                cursor: marcada ? "default" : "pointer",
                background: buena ? "rgba(184,196,212,0.14)" : "rgba(10,20,34,0.4)",
                border: `${buena || esta ? 2 : 1}px solid ${buena ? NEUTRO : esta ? FAE.coral : "rgba(248,249,250,0.16)"}`,
                color: FAE.text, fontSize: "12.5px",
                opacity: marcada && !esta && !buena ? 0.45 : 1,
              }}
            >
              {op.texto}
              {buena && (
                <span data-marca-buena style={{ marginLeft: "6px", fontSize: "11px", color: NEUTRO }}>
                  ✓ es esta
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: "11px" }}>
        <FiguraDelTiempo
          fotos={FOTOS}
          escena={escena}
          llenado={1}
          reducido={reducido}
          interactiva={!marcada}
        />
      </div>

      {r && !r.ok && (
        <p data-explicacion={r.patron} style={{
          margin: "11px 0 0", padding: "10px 12px", borderRadius: "11px",
          fontSize: "12.5px", lineHeight: 1.55, color: "rgba(248,249,250,0.85)",
          background: "rgba(231,111,81,0.10)", border: `1px solid ${FAE.coral}55`,
        }}>
          {r.texto}
        </p>
      )}

      {marcada && (
        <button
          type="button"
          data-siguiente-pregunta
          onClick={avanzar}
          style={{
            marginTop: "10px", padding: "8px 14px", borderRadius: "999px", cursor: "pointer",
            background: "transparent", border: "1px solid rgba(248,249,250,0.3)",
            color: FAE.text, fontFamily: SORA, fontSize: "12px", fontWeight: 600,
          }}
        >
          Otra pregunta
        </button>
      )}

      <p style={SOLO_LECTOR}>
        Pregunta {i + 1} de {PREGUNTAS_P3.length}. Tres respuestas posibles: la foto, la película, o
        comparar las dos fotos.
      </p>
    </div>
  );
}
