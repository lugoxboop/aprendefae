import { useId, useState } from "react";
import { COLOR } from "../../../../data/contabilidadTema3.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL ENCABEZADO COMPACTO DE LOS HACER DE B (hoja «Enganche B1-B5» de Mai,
 * parte Hacer). Entra en el lote 6b con las fichas a un nivel (b5-t5-a1 y
 * b5-t6-a1: su primer toque tenía que quedar en los primeros 280 px a
 * 320×568) y el 6c lo lleva a los demás Hacer de la célula.
 *
 *   · el objetivo, una oración del kit (Inter 13/1,45, secundario; 20
 *     palabras como mucho);
 *   · debajo, una fila de 44: a la izquierda el contador («Ficha N de 9»;
 *     Sora 12/600, en mayúsculas, secundario) y a la derecha «¿Cómo se
 *     juega?» como enlace (Sora 12/600, subrayado, 44 de alto);
 *   · plegados bajo «¿Cómo se juega?», la consigna, los pasos, lo que la
 *     actividad fija como recordatorio (`notas`) y, si la tiene, la regla
 *     fija («Solo tienes un intento…»). Al abrir empuja hacia abajo; plegado
 *     no ocupa nada (no se pinta: así tampoco se le puede dar el foco).
 *
 * «Así se juega» (el ejemplo con la mano) sigue saliendo la primera vez,
 * como siempre: lo pone JuegoConTutorial, fuera de aquí. Ningún texto de la
 * actividad vive en este archivo; «¿Cómo se juega?» es el rótulo publicado.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";
const SECUNDARIO = COLOR.apagado;
export const ROTULO_COMO_SE_JUEGA = "¿Cómo se juega?";

export default function EncabezadoCompacto({ objetivo, contador, consigna, pasos = [], regla = null, notas = [] }) {
  const [abierto, setAbierto] = useState(false);
  const idPanel = useId();
  return (
    <div data-encabezado data-encabezado-compacto style={{ margin: "0 0 8px" }}>
      <p data-objetivo style={{ margin: 0, fontFamily: INTER, fontSize: "13px", lineHeight: 1.45, color: SECUNDARIO }}>{objetivo}</p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", minHeight: "44px" }}>
        <p data-contador style={{
          margin: 0, fontFamily: SORA, fontSize: "12px", fontWeight: 600, lineHeight: 1.3, letterSpacing: "0.06em",
          textTransform: "uppercase", color: SECUNDARIO, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap",
        }}>
          {contador}
        </p>
        <button type="button" data-como-se-juega aria-expanded={abierto} aria-controls={idPanel} onClick={() => setAbierto((x) => !x)} style={{
          minHeight: "44px", padding: "0 2px", marginRight: "-2px", background: "transparent", border: "none", cursor: "pointer",
          fontFamily: SORA, fontSize: "12px", fontWeight: 600, color: SECUNDARIO,
          textDecoration: "underline", textUnderlineOffset: "3px", whiteSpace: "nowrap",
        }}>
          {ROTULO_COMO_SE_JUEGA}
        </button>
      </div>
      <div id={idPanel} data-como-se-juega-panel={abierto ? "abierto" : "plegado"}>
        {abierto && (
          <div style={{ padding: "2px 0 8px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <p data-consigna style={{ margin: 0, fontFamily: INTER, fontSize: "13px", lineHeight: 1.45, color: COLOR.blanco }}>{consigna}</p>
            {pasos.length > 0 && (
              <ol data-pasos style={{ margin: 0, paddingLeft: "18px", fontFamily: INTER, fontSize: "13px", lineHeight: 1.45, color: SECUNDARIO }}>
                {pasos.map((p) => <li key={p}>{p}</li>)}
              </ol>
            )}
            {/* Lo que la actividad fija como recordatorio (b5-t6-a4: su nota y la regla de qué se debita). */}
            {notas.map((n) => <p key={n} data-nota-plegada style={{ margin: 0, fontFamily: INTER, fontSize: "13px", lineHeight: 1.45, color: COLOR.blanco }}>{n}</p>)}
            {regla && <p data-regla style={{ margin: 0, fontFamily: INTER, fontSize: "12px", lineHeight: 1.45, color: SECUNDARIO }}>{regla}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
