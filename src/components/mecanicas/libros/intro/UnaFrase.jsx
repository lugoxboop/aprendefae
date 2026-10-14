import { useMemo, useState } from "react";
import { FAE } from "../../../../theme.js";
import { barajar } from "../../../../utils/barajar.js";
import { NEUTRO } from "../../../../data/contabilidadIntro.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CAPA 4 · «EN UNA FRASE» — la máquina que comparten las piezas 2, 3 y 4.
 *
 * Cuatro frases y una devolución por cada una. NO CALIFICA: es material
 * teórico. Las tres equivocadas explican por qué lo son, y cada una enciende
 * algo distinto en la figura de su pieza — el dibujo es la otra mitad del
 * argumento.
 *
 * La pieza 1 tiene su propia copia de esto porque su escena depende del
 * anillo; cuando llegó la segunda pieza que lo necesitaba, esta versión salió
 * de ahí con la escena como parámetro. `Escena` recibe `{ escena }`, que es lo
 * que cada opción declara en el contenido.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";

export default function UnaFrase({ pregunta, opciones, Escena, evaluar }) {
  /* El orden se sortea una vez: si cambiara al responder, sería desorientador. */
  const orden = useMemo(() => barajar(opciones), [opciones]);
  const [elegida, setElegida] = useState(null);

  const r = elegida ? evaluar(elegida) : null;

  return (
    <div data-una-frase>
      <p style={{ margin: 0, fontFamily: SORA, fontSize: "14px", fontWeight: 700, lineHeight: 1.45, color: FAE.text }}>
        {pregunta}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "7px", marginTop: "12px" }}>
        {orden.map((o) => {
          const esta = o.id === elegida;
          return (
            <button
              key={o.id}
              type="button"
              data-opcion={o.id}
              data-elegida={esta ? "si" : "no"}
              disabled={Boolean(elegida)}
              onClick={() => setElegida(o.id)}
              style={{
                textAlign: "left", padding: "10px 12px", borderRadius: "11px",
                cursor: elegida ? "default" : "pointer",
                background: esta ? "rgba(184,196,212,0.12)" : "rgba(10,20,34,0.4)",
                border: `${esta ? 2 : 1}px solid ${esta ? NEUTRO : "rgba(248,249,250,0.36)"}`,
                color: FAE.text, fontSize: "12.5px", lineHeight: 1.45,
                opacity: elegida && !esta ? 0.5 : 1,
              }}
            >
              {o.texto}
            </button>
          );
        })}
      </div>

      {r && (
        <div data-devolucion={r.correcta ? "correcta" : "incorrecta"} style={{
          marginTop: "12px", padding: "11px 13px", borderRadius: "12px",
          fontSize: "13px", lineHeight: 1.55, color: "rgba(248,249,250,0.88)",
          background: "rgba(184,196,212,0.1)", borderLeft: `3px solid ${NEUTRO}`,
        }}>
          {r.feedback}
          <Escena escena={r.escena} />
        </div>
      )}

      {elegida && (
        <button
          type="button"
          data-otra-vez
          onClick={() => setElegida(null)}
          style={{
            marginTop: "10px", padding: "8px 14px", borderRadius: "999px", cursor: "pointer",
            background: "transparent", border: "1px solid rgba(248,249,250,0.36)",
            color: FAE.text, fontFamily: SORA, fontSize: "12px", fontWeight: 600,
          }}
        >
          Probar otra
        </button>
      )}
    </div>
  );
}
