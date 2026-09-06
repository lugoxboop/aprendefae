import { useRef, useState } from "react";
import { ArrowUp, ArrowDown, Pause } from "lucide-react";
import { FAE } from "../../../theme.js";
import { ESCENA_DECISION, DECISIONES, ORDEN_DECISIONES } from "../../../data/arca.js";
import { barajarDistinto } from "../../../utils/barajar.js";
import { puntuarOrden, parejasPreservadas, parejasDe } from "../../../utils/orden.js";

/*
 * Etapa 3 — "El momento de decisión".
 *
 * La escena se congela en el día 100, justo antes de que Absalón hable. Cuatro
 * cosas que podría hacer ahí mismo, y hay que ordenarlas por impacto real.
 *
 * SE ORDENA CON FLECHAS, NO ARRASTRANDO. El arrastre para reordenar necesita
 * una librería para funcionar con el dedo, y este sitio se ve sobre todo en el
 * teléfono. Subir y bajar con dos botones hace lo mismo y funciona en todas
 * partes, incluido el teclado.
 *
 * PUNTUACIÓN POR PAREJAS, con la misma función que usa el Tribunal de
 * Profundidad —utils/orden.js—, no con una copia parecida. Con cuatro opciones
 * hay seis parejas, así que cada una vale 16.67 y el resultado va de 0 a 100 en
 * seis escalones. Confundir el tercero con el cuarto cuesta una pareja; poner
 * la mejor decisión de última cuesta tres.
 */

const CSS = `
@keyframes fae-de-brote { from { opacity: 0; transform: translateY(9px); } to { opacity: 1; transform: none; } }
.fae-de-brote { animation: fae-de-brote 440ms ease-out both; }
@keyframes fae-de-latido { 0%,100% { opacity: .35; } 50% { opacity: .85; } }
.fae-de-latido { animation: fae-de-latido 2.6s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .fae-de-brote, .fae-de-latido { animation: none !important; } }
`;

export default function EtapaDecision({ onTerminar }) {
  const ordenPrevio = useRef(null);
  const [lista, setLista] = useState(() => {
    const o = barajarDistinto(DECISIONES, null, (d) => d.id).map((d) => d.id);
    ordenPrevio.current = o;
    return o;
  });
  const [decidido, setDecidido] = useState(false);

  const pct = puntuarOrden(lista, ORDEN_DECISIONES);
  const parejas = parejasPreservadas(lista, ORDEN_DECISIONES);
  const totalParejas = parejasDe(ORDEN_DECISIONES).length;

  const mover = (i, delta) => {
    if (decidido) return;
    const j = i + delta;
    if (j < 0 || j >= lista.length) return;
    setLista((l) => {
      const copia = [...l];
      [copia[i], copia[j]] = [copia[j], copia[i]];
      return copia;
    });
  };

  const decidir = () => {
    if (decidido) return;
    setDecidido(true);
    onTerminar?.(puntuarOrden(lista, ORDEN_DECISIONES));
  };

  return (
    <div>
      <style>{CSS}</style>

      {/* ---------------------------- la escena ---------------------------- */}
      <div style={{ borderRadius: "18px", background: "#0A1422", border: "1px solid rgba(248,249,250,0.14)", padding: "clamp(14px, 2.2vw, 20px)", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "8px" }}>
          <Pause size={14} color={FAE.ambar} className="fae-de-latido" />
          <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.ambar, margin: 0 }}>
            {ESCENA_DECISION.dia.toUpperCase()} · {ESCENA_DECISION.titulo.toUpperCase()} · ESCENA CONGELADA
          </p>
        </div>
        <p style={{ fontSize: "14.5px", lineHeight: 1.6, color: FAE.text, margin: 0 }}>
          {ESCENA_DECISION.texto}
        </p>
      </div>

      <p style={{ fontSize: "14px", lineHeight: 1.6, color: "rgba(248,249,250,0.7)", margin: "0 0 14px" }}>
        Ordénalas de mayor a menor impacto real sobre el problema. Arriba, la que más cambiaría el
        final del caso.
      </p>

      {/* --------------------------- la ordenación --------------------------- */}
      <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "16px" }}>
        {lista.map((id, i) => {
          const d = DECISIONES.find((x) => x.id === id);
          const deberia = ORDEN_DECISIONES.indexOf(id);
          const bien = decidido && deberia === i;
          const borde = decidido ? (bien ? FAE.teal : FAE.ambar) : "rgba(248,249,250,0.14)";
          return (
            <div
              key={id}
              style={{
                display: "flex", gap: "11px", alignItems: "flex-start",
                padding: "13px 14px", borderRadius: "14px",
                background: "rgba(248,249,250,0.035)", border: `1px solid ${borde}`,
              }}
            >
              <span style={{
                flexShrink: 0, width: "25px", height: "25px", borderRadius: "999px",
                display: "grid", placeItems: "center", fontFamily: "Sora, sans-serif",
                fontSize: "12px", fontWeight: 700, fontVariantNumeric: "tabular-nums",
                background: decidido ? (bien ? FAE.teal : FAE.ambar) : "rgba(42,157,143,0.22)",
                color: decidido ? "#08111d" : FAE.text,
              }}>
                {i + 1}
              </span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "13.5px", lineHeight: 1.5, color: FAE.text, margin: 0 }}>
                  {d.texto}
                </p>
                {decidido && (
                  <p className="fae-de-brote" style={{ fontSize: "12.5px", lineHeight: 1.55, color: "rgba(248,249,250,0.58)", margin: "8px 0 0" }}>
                    <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, color: FAE.ambar }}>
                      Impacto {d.peso}%
                    </span>
                    {" · "}
                    {d.porque}
                    {!bien && ` Su sitio era el ${deberia + 1}.`}
                  </p>
                )}
              </div>

              {!decidido && (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", flexShrink: 0 }}>
                  {[[-1, ArrowUp, "Subir"], [1, ArrowDown, "Bajar"]].map(([delta, Icono, etiqueta]) => {
                    const tope = delta === -1 ? i === 0 : i === lista.length - 1;
                    return (
                      <button
                        key={etiqueta}
                        type="button"
                        onClick={() => mover(i, delta)}
                        disabled={tope}
                        aria-label={`${etiqueta}: ${d.texto.slice(0, 40)}`}
                        style={{
                          display: "grid", placeItems: "center", width: "30px", height: "26px",
                          borderRadius: "8px", cursor: tope ? "default" : "pointer",
                          background: "rgba(248,249,250,0.05)",
                          border: "1px solid rgba(248,249,250,0.14)",
                          color: tope ? "rgba(248,249,250,0.2)" : "rgba(248,249,250,0.7)",
                        }}
                      >
                        <Icono size={14} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!decidido ? (
        <button
          type="button"
          onClick={decidir}
          style={{
            width: "100%", padding: "13px", borderRadius: "14px", cursor: "pointer",
            background: FAE.teal, border: `1px solid ${FAE.teal}`, color: "#08111d",
            fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700,
          }}
        >
          Que Absalón decida
        </button>
      ) : (
        <div className="fae-de-brote">
          <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "26px", color: FAE.text, margin: "0 0 6px", fontVariantNumeric: "tabular-nums" }}>
            {pct}%
          </p>
          <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: 0 }}>
            {parejas} de {totalParejas} parejas en la relación correcta.{" "}
            {pct === 100
              ? "El orden es B > A > C > D. Lo único que toca la creencia de fondo va primero; pedir prórroga es lo que Absalón hizo, y ya sabes cómo terminó."
              : "El orden real era B > A > C > D. Cuanto más arriba está una decisión, más cerca queda de la creencia que sostiene todo lo demás."}
          </p>
        </div>
      )}
    </div>
  );
}
