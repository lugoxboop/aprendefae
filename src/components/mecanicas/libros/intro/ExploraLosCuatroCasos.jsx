import { useState } from "react";
import { FAE } from "../../../../theme.js";
import { NEUTRO, NAVY_DEL_CHIP } from "../../../../data/contabilidadIntro.js";
import { CASOS_P2, NOTA_CAPA3_P2, SUBEN } from "../../../../data/contabilidadPiezas234.js";
import { cambioDelCaso, movimientoDelCaso } from "../../../../contabilidad/aprenderTema1.js";
import { useMovimientoReducido, SOLO_LECTOR } from "../verbos.jsx";
import Torre, { LineaDeAltura } from "./Torre.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PIEZA 2 · CAPA 3 — «Ahora pruebe usted».
 *
 * Los cuatro casos del libro, y la torre se mueve con el que se toque. Los dos
 * lados cambian A LA VEZ y hacia el mismo sitio, siempre: eso no es una
 * decisión de esta pantalla, sale de `movimientoDelCaso`, que devuelve el
 * mismo movimiento para los dos lados por construcción.
 *
 * ═══════════ LA NOTA VA EXACTAMENTE ASÍ ═══════════
 *
 * «En el caso a suben las dos. En el c bajan las dos.» Nunca «una subiendo y
 * la otra bajando», que es justo la frase que la pieza entera desmiente.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";

export default function ExploraLosCuatroCasos() {
  const reducido = useMovimientoReducido();
  const [elegido, setElegido] = useState(null);

  const caso = CASOS_P2.find((c) => c.id === elegido) ?? null;
  const m = caso ? movimientoDelCaso(caso) : null;
  const cambio = caso ? cambioDelCaso(caso) : null;

  return (
    <div data-explora-casos data-caso-activo={elegido ?? undefined}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {CASOS_P2.map((c) => {
          const activo = c.id === elegido;
          return (
            <button
              key={c.id}
              type="button"
              data-caso={c.id}
              data-elegido={activo ? "si" : "no"}
              aria-pressed={activo}
              onClick={() => setElegido(activo ? null : c.id)}
              onKeyDown={(ev) => { if (ev.key === "Escape") setElegido(null); }}
              style={{
                padding: "6px 9px", borderRadius: "999px", cursor: "pointer", textAlign: "left",
                background: activo ? NEUTRO : "transparent",
                color: activo ? NAVY_DEL_CHIP : "rgba(248,249,250,0.72)",
                border: `1px solid ${activo ? NEUTRO : "rgba(248,249,250,0.22)"}`,
                fontFamily: SORA, fontSize: "12px", fontWeight: activo ? 700 : 500,
              }}
            >
              {c.id}. {c.nombre}
            </button>
          );
        })}
      </div>

      <div key={`${elegido}-${cambio?.tramo ?? "base"}-${cambio?.signo ?? 0}`} style={{ marginTop: "12px" }}>
        <Torre lado="ambas" cambio={cambio} reducido={reducido} />
        <LineaDeAltura />
      </div>

      {caso ? (
        <p data-movimiento={m.izquierda} style={{
          margin: "10px 0 0", padding: "8px 10px", borderRadius: "10px",
          fontSize: "12px", lineHeight: 1.45, color: "rgba(248,249,250,0.8)",
          background: "rgba(184,196,212,0.1)", borderLeft: `3px solid ${NEUTRO}`,
        }}>
          {/*
            Los dos lados se nombran con el MISMO verbo, y sale de la misma
            función: no hay forma de que esta frase diga que uno sube y el otro
            baja sin que `movimientoDelCaso` se rompa primero.
          */}
          Caso {caso.id}: {m.izquierda === SUBEN ? "suben los dos lados" : "bajan los dos lados"}.
          Lo que tiene {m.izquierda === SUBEN ? "sube" : "baja"}, y {caso.lado}{" "}
          {m.derecha === SUBEN ? "sube" : "baja"} con él.
        </p>
      ) : (
        <p data-vacio style={{
          margin: "10px 0 0", padding: "11px 10px", textAlign: "center",
          fontSize: "12px", color: "#A8B6C8",
        }}>
          Toca un caso y mira cómo se mueve la torre.
        </p>
      )}

      <p data-nota style={{ margin: "10px 0 0", fontSize: "12.5px", lineHeight: 1.55, color: "rgba(248,249,250,0.75)" }}>
        {NOTA_CAPA3_P2}
      </p>
      <p style={SOLO_LECTOR}>
        Los cuatro casos del libro. En todos, los dos lados se mueven hacia el mismo sitio:
        suben juntos o bajan juntos.
      </p>
    </div>
  );
}
