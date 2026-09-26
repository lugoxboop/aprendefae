import { useMemo, useState } from "react";
import { FAE } from "../../../../theme.js";
import { barajar } from "../../../../utils/barajar.js";
import {
  OPCIONES, PREGUNTA_FINAL, ESTACIONES, USUARIOS, NEUTRO, NAVY_DEL_CHIP,
} from "../../../../data/contabilidadIntro.js";
import { evaluarOpcion } from "../../../../contabilidad/recorridoDeUnHecho.js";
import { useMovimientoReducido } from "../verbos.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CAPA 4 · «EN UNA FRASE» — un selector, no una casilla de texto.
 *
 * Cuatro frases, y el estudiante elige cuál describe lo que hace la
 * contabilidad. Las cuatro miden casi lo mismo —entre doce y trece palabras—
 * a propósito: si la correcta fuera visiblemente la más larga o la más
 * trabajada, se acertaría por su forma y no por lo que dice.
 *
 * Material teórico: esto NO califica ni da FP. La devolución explica, y las
 * tres equivocadas explican POR QUÉ lo son señalando dónde cae esa idea dentro
 * del ciclo — que es justamente lo que la pieza enseña.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";

/* Lo que se enciende con cada devolución. El dibujo es la otra mitad. */
function Escena({ escena, reducido }) {
  if (escena.tipo === "ocho-usuarios") {
    return (
      <div data-escena="ocho-usuarios" style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "10px" }}>
        {USUARIOS.map((u) => {
          const marcado = u.id === escena.resaltar;
          return (
            <span key={u.id} data-usuario={u.id} data-marcado={marcado ? "si" : "no"} style={{
              padding: "4px 8px", borderRadius: "999px", fontFamily: SORA, fontSize: "10px",
              fontWeight: marcado ? 700 : 500,
              background: marcado ? NEUTRO : "transparent",
              color: marcado ? NAVY_DEL_CHIP : "rgba(248,249,250,0.5)",
              border: `1px solid ${marcado ? NEUTRO : "rgba(248,249,250,0.18)"}`,
            }}>
              {u.nombre}
            </span>
          );
        })}
      </div>
    );
  }

  const completa = escena.tipo === "anillo-completo";
  return (
    <div data-escena={escena.tipo} style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "10px" }}>
      {ESTACIONES.map((e) => {
        const sola = escena.estacion === e.n;
        const encendida = completa || sola;
        return (
          <span
            key={e.n}
            data-estacion={e.n}
            data-encendida={encendida ? "si" : "no"}
            className={!encendida && escena.latenLasOtras && !reducido ? "fae-t1-late" : undefined}
            style={{
              display: "flex", gap: "6px", alignItems: "center",
              padding: "5px 8px", borderRadius: "9px",
              background: encendida ? "rgba(184,196,212,0.1)" : "transparent",
              border: `${encendida ? 2 : 1}px solid ${encendida ? NEUTRO : "rgba(248,249,250,0.14)"}`,
              opacity: encendida ? 1 : 0.45,
            }}
          >
            <span style={{
              flex: "none", width: "15px", height: "15px", borderRadius: "999px",
              border: `1px solid ${NEUTRO}`, color: NEUTRO, fontFamily: SORA,
              fontSize: "9px", fontWeight: 700, lineHeight: "14px", textAlign: "center",
            }}>
              {e.n}
            </span>
            <span style={{ fontSize: "10.5px", color: encendida ? FAE.text : "rgba(248,249,250,0.5)" }}>{e.nombre}</span>
          </span>
        );
      })}
      {/* El trazo que vuelve, solo cuando la respuesta es la que cierra el ciclo. */}
      {completa && (
        <span data-trazo-retorno style={{
          marginTop: "2px", fontSize: "10px", color: NEUTRO, textAlign: "center",
        }}>
          ↑ y la decisión vuelve a la estación 1
        </span>
      )}
      {/* A medias y ahí se queda: los documentos no llegan solos al registro. */}
      {escena.trazoAMedias && (
        <span data-trazo-a-medias style={{
          marginTop: "2px", fontSize: "10px", color: "rgba(248,249,250,0.4)", textAlign: "center",
        }}>
          ↓ … el trazo hacia la estación 3 se queda a medias
        </span>
      )}
    </div>
  );
}

const CSS = `
@keyframes fae-t1-late { 0%, 100% { opacity: 0.45; } 50% { opacity: 0.8; } }
.fae-t1-late { animation: fae-t1-late 900ms ease-in-out 1; }
@media (prefers-reduced-motion: reduce) { .fae-t1-late { animation: none !important; } }
`;

export default function UnaFraseIntro() {
  const reducido = useMovimientoReducido();
  /* El orden se sortea una vez: si cambiara al responder, sería desorientador. */
  const orden = useMemo(() => barajar(OPCIONES), []);
  const [elegida, setElegida] = useState(null);

  const r = elegida ? evaluarOpcion(elegida) : null;

  return (
    <div data-una-frase>
      <style>{CSS}</style>
      <p style={{ margin: 0, fontFamily: SORA, fontSize: "14px", fontWeight: 700, lineHeight: 1.45, color: FAE.text }}>
        {PREGUNTA_FINAL}
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
                border: `${esta ? 2 : 1}px solid ${esta ? NEUTRO : "rgba(248,249,250,0.16)"}`,
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
          <Escena escena={r.escena} reducido={reducido} />
        </div>
      )}

      {elegida && (
        <button
          type="button"
          data-otra-vez
          onClick={() => setElegida(null)}
          style={{
            marginTop: "10px", padding: "8px 14px", borderRadius: "999px", cursor: "pointer",
            background: "transparent", border: "1px solid rgba(248,249,250,0.3)",
            color: FAE.text, fontFamily: SORA, fontSize: "12px", fontWeight: 600,
          }}
        >
          Probar otra
        </button>
      )}
    </div>
  );
}
