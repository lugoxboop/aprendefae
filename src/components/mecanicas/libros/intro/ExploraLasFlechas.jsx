import { useState } from "react";
import { FAE } from "../../../../theme.js";
import { NEUTRO, NAVY_DEL_CHIP } from "../../../../data/contabilidadIntro.js";
import { CONSIGNA_P4, FLECHAS_P4 } from "../../../../data/contabilidadPiezas234.js";
import { lineaP4, modoDeFlecha } from "../../../../contabilidad/aprenderTema1.js";
import { useMovimientoReducido, SOLO_LECTOR } from "../verbos.jsx";
import TresInformes from "./TresInformes.jsx";
import { CSS_P4 } from "./ComoSeArticulan.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PIEZA 4 · CAPA 3 — «Ahora pruebe usted».
 *
 * Las cinco flechas están dibujadas de entrada: aquí la convergencia ya está
 * enseñada y lo que se explora es QUÉ hace cada una. Tocar una la deja sola en
 * pantalla, y lo que ocurre depende de si repite una cifra o explica una
 * línea.
 *
 * Son dos animaciones porque son dos cosas. La del saldo final de efectivo
 * manda una ficha que VIAJA: esa cifra es literalmente la misma en los dos
 * informes. Las otras cuatro encienden sus dos extremos A LA VEZ sin que viaje
 * nada, porque no repiten ninguna cifra — explican. Usar el viaje en las cinco
 * diría algo falso cuatro veces.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";

export default function ExploraLasFlechas() {
  const reducido = useMovimientoReducido();
  const [elegida, setElegida] = useState(null);

  const f = FLECHAS_P4.find((x) => x.id === elegida) ?? null;
  const m = f ? modoDeFlecha(f.id) : null;
  const todas = FLECHAS_P4.map((x) => x.id);

  return (
    <div data-explora-p4 data-flecha-activa={elegida ?? undefined}>
      <style>{CSS_P4}</style>
      <p data-consigna style={{ margin: "0 0 10px", fontSize: "12px", lineHeight: 1.45, color: "rgba(248,249,250,0.6)" }}>
        {CONSIGNA_P4}
      </p>

      <div key={elegida ?? "todas"}>
        <TresInformes
          /* Sin ninguna elegida, las cinco: la convergencia ya está enseñada. */
          activas={elegida ? [elegida] : todas}
          viajando={m?.viaja ? elegida : null}
          onTocarFlecha={(id) => setElegida(id === elegida ? null : id)}
          reducido={reducido}
        />
      </div>

      {f ? (
        <p data-marca={m.viaja ? "viaja" : "explica"} style={{
          margin: "11px 0 0", padding: "9px 11px", borderRadius: "11px",
          fontSize: "12.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.85)",
          background: "rgba(184,196,212,0.1)", borderLeft: `3px solid ${NEUTRO}`,
        }}>
          <span style={{
            display: "inline-block", marginRight: "6px", padding: "1px 7px", borderRadius: "6px",
            background: NEUTRO, color: NAVY_DEL_CHIP, fontFamily: SORA, fontSize: "10px", fontWeight: 700,
          }}>
            {m.marca}
          </span>
          {lineaP4(f.desde).nombre} → {lineaP4(f.hasta).nombre}
        </p>
      ) : (
        <p data-vacio style={{
          margin: "11px 0 0", padding: "10px", textAlign: "center",
          fontSize: "12px", color: "#A8B6C8",
        }}>
          Toca una flecha del costado.
        </p>
      )}

      {elegida && (
        <button
          type="button"
          data-ver-todas
          onClick={() => setElegida(null)}
          style={{
            marginTop: "10px", padding: "8px 14px", borderRadius: "999px", cursor: "pointer",
            background: "transparent", border: "1px solid rgba(248,249,250,0.3)",
            color: FAE.text, fontFamily: SORA, fontSize: "12px", fontWeight: 600,
          }}
        >
          Ver las cinco otra vez
        </button>
      )}

      <p style={SOLO_LECTOR}>
        Cinco flechas. Una lleva la misma cifra de un informe a otro; las otras cuatro explican una
        línea sin repetir ninguna cifra. Ninguna sale del informe al que llegan todas.
      </p>
    </div>
  );
}
