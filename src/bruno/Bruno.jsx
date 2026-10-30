import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { supabase } from "../lib/supabase.js";
import { useAuthOpcional } from "../auth/AuthProvider.jsx";
import { contextoActual } from "./contexto.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * BRUNO — LA VENTANA (orden de Mateo, 30-oct).
 *
 * Un botón redondo abajo a la derecha; al tocarlo se desliza un panel con la
 * conversación. El estudiante escribe («no entiendo esta actividad») y Bruno
 * responde orientando, sin dar la respuesta, en 120 palabras como mucho.
 *
 * Lo que ve Bruno lo arma contexto.js en el momento de preguntar. El cerebro
 * (prompt, tope de palabras, cupo diario) vive en el servidor:
 * supabase/functions/asistente.
 *
 * Movimiento: una curva, solo transform y opacity, nada en bucle; con
 * movimiento reducido el panel aparece sin deslizarse.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CURVA = "cubic-bezier(.3,.9,.4,1)";
const NAVY = "#14233A";
const BLANCO = "#F8F9FA";
const APOYO = "#C9D3E0";
const DATO = "#A8B6C8";
const TEAL = "#2A9D8F";

export const SALUDO = "Hola, soy Bruno. Si algo de esta actividad no te queda claro, cuéntame qué parte y te ayudo a encontrar el camino. No te voy a dar la respuesta, pero sí la pista.";
export const SUGERENCIAS = ["No entiendo esta actividad", "¿Qué tengo que tocar?", "Dame una pista"];

export const MOTIVO_SIN_SESION = "Para hablar con Bruno necesitas iniciar sesión.";

const CSS = `
.fae-bruno-panel { transform: translateY(16px); opacity: 0; pointer-events: none; transition: transform 220ms ${CURVA}, opacity 220ms ${CURVA}; }
.fae-bruno-panel[data-abierto="si"] { transform: none; opacity: 1; pointer-events: auto; }
.fae-bruno-boton { transition: transform 160ms ${CURVA}; }
.fae-bruno-boton:active { transform: scale(.94); }
.fae-bruno-panel, .fae-bruno-panel * { box-sizing: border-box; }
@media (prefers-reduced-motion: reduce) { .fae-bruno-panel, .fae-bruno-boton { transition: none; } }
@media (min-width: 640px) { .fae-bruno-panel { left: auto !important; width: 380px; right: 16px !important; } }
`;

/** Llama a la función del servidor. Devuelve {respuesta} o {error}. */
export async function preguntarABruno({ mensaje, contexto, historial }, cliente = supabase) {
  if (!cliente) return { error: "Bruno no está disponible en este momento." };
  const { data, error } = await cliente.functions.invoke("asistente", { body: { mensaje, contexto, historial } });
  if (!error) return { respuesta: data?.respuesta ?? "", usadas: data?.usadas, limite: data?.limite };
  let cuerpo = null;
  try { cuerpo = await error.context?.json?.(); } catch { cuerpo = null; }
  const estado = error.context?.status;
  if (estado === 401) return { error: MOTIVO_SIN_SESION };
  if (estado === 429) return { error: cuerpo?.error ?? "Llegaste al límite de preguntas de hoy. Vuelve mañana.", usadas: cuerpo?.usadas, limite: cuerpo?.limite };
  return { error: cuerpo?.error ?? "Bruno no pudo responder ahora. Inténtalo otra vez." };
}

export default function Bruno({ materia = "", tema = "", preguntar = preguntarABruno }) {
  const auth = useAuthOpcional();
  const conSesion = Boolean(auth?.session);
  const [abierto, setAbierto] = useState(false);
  const [turnos, setTurnos] = useState([]);
  const [texto, setTexto] = useState("");
  const [pensando, setPensando] = useState(false);
  const [cupo, setCupo] = useState(null);
  const lista = useRef(null);
  const campo = useRef(null);

  /* Al cambiar de tema, la conversación empieza de nuevo: el contexto ya es otro. */
  useEffect(() => { setTurnos([]); }, [tema]);
  useEffect(() => { lista.current?.scrollTo?.({ top: lista.current.scrollHeight }); }, [turnos, pensando]);
  useEffect(() => { if (abierto) campo.current?.focus?.({ preventScroll: true }); }, [abierto]);

  const enviar = async (mensaje) => {
    const limpio = mensaje.trim();
    if (!limpio || pensando) return;
    if (!conSesion) {
      setTurnos((t) => [...t, { rol: "estudiante", texto: limpio }, { rol: "aviso", texto: MOTIVO_SIN_SESION }]);
      setTexto("");
      return;
    }
    const historial = turnos.filter((t) => t.rol === "estudiante" || t.rol === "bruno");
    setTurnos((t) => [...t, { rol: "estudiante", texto: limpio }]);
    setTexto("");
    setPensando(true);
    const r = await preguntar({ mensaje: limpio, contexto: contextoActual({ materia, tema }), historial });
    setPensando(false);
    if (r.limite !== undefined) setCupo({ usadas: r.usadas, limite: r.limite });
    setTurnos((t) => [...t, r.error ? { rol: "aviso", texto: r.error } : { rol: "bruno", texto: r.respuesta }]);
  };

  return (
    <div data-bruno>
      <style>{CSS}</style>
      {!abierto && (
        <button
          type="button"
          data-bruno-abrir
          className="fae-bruno-boton"
          aria-label="Preguntarle a Bruno"
          onClick={() => setAbierto(true)}
          style={{
            position: "fixed", right: "16px", bottom: "calc(88px + env(safe-area-inset-bottom, 0px))", zIndex: 60,
            width: "52px", height: "52px", borderRadius: "999px", border: "1px solid rgba(248,249,250,0.18)",
            background: TEAL, color: "#06202A", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 6px 18px rgba(0,0,0,0.35)", cursor: "pointer",
          }}
        >
          <MessageCircle size={24} strokeWidth={2.2} aria-hidden="true" />
        </button>
      )}

      <section
        data-bruno-panel
        className="fae-bruno-panel"
        data-abierto={abierto ? "si" : "no"}
        aria-label="Bruno, el tutor"
        aria-hidden={abierto ? undefined : "true"}
        style={{
          position: "fixed", left: "8px", right: "8px", bottom: "calc(8px + env(safe-area-inset-bottom, 0px))", zIndex: 61,
          height: "min(72vh, 560px)", display: "flex", flexDirection: "column",
          background: NAVY, border: "1px solid rgba(248,249,250,0.18)", borderRadius: "18px",
          boxShadow: "0 18px 48px rgba(0,0,0,0.5)", fontFamily: "Inter, sans-serif", color: BLANCO,
        }}
      >
        <header style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 12px 10px 16px", borderBottom: "1px solid rgba(248,249,250,0.12)" }}>
          <span aria-hidden="true" style={{ width: "32px", height: "32px", borderRadius: "999px", background: TEAL, color: "#06202A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "15px", flex: "none" }}>B</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ margin: 0, fontFamily: "Sora, sans-serif", fontSize: "16px", fontWeight: 700 }}>Bruno</h2>
            <p style={{ margin: 0, fontSize: "12px", color: DATO }}>
              Te orienta sin darte la respuesta{cupo ? ` · ${Math.max(0, cupo.limite - cupo.usadas)} preguntas más hoy` : ""}
            </p>
          </div>
          <button type="button" data-bruno-cerrar aria-label="Cerrar a Bruno" onClick={() => setAbierto(false)}
            style={{ width: "44px", height: "44px", borderRadius: "999px", border: "none", background: "transparent", color: APOYO, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flex: "none" }}>
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div ref={lista} data-bruno-lista role="log" aria-live="polite" style={{ flex: 1, overflowY: "auto", padding: "14px 14px 6px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <Burbuja rol="bruno">{SALUDO}</Burbuja>
          {turnos.map((t, k) => <Burbuja key={k} rol={t.rol}>{t.texto}</Burbuja>)}
          {pensando && <Burbuja rol="bruno"><span data-bruno-pensando style={{ color: DATO }}>Bruno está pensando…</span></Burbuja>}
          {turnos.length === 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "2px" }}>
              {SUGERENCIAS.map((s) => (
                <button key={s} type="button" data-bruno-sugerencia onClick={() => enviar(s)}
                  style={{ minHeight: "44px", padding: "0 14px", borderRadius: "999px", border: "1px solid rgba(248,249,250,0.22)", background: "transparent", color: APOYO, fontSize: "13px", cursor: "pointer" }}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); enviar(texto); }}
          style={{ display: "flex", gap: "8px", padding: "10px 12px 12px", borderTop: "1px solid rgba(248,249,250,0.12)" }}
        >
          <label htmlFor="fae-bruno-campo" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)" }}>Tu pregunta para Bruno</label>
          <input
            id="fae-bruno-campo"
            ref={campo}
            data-bruno-campo
            value={texto}
            maxLength={600}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe tu duda…"
            autoComplete="off"
            style={{ flex: 1, minWidth: 0, minHeight: "44px", padding: "0 14px", borderRadius: "999px", border: "1px solid rgba(248,249,250,0.22)", background: "rgba(248,249,250,0.06)", color: BLANCO, fontSize: "15px", fontFamily: "Inter, sans-serif" }}
          />
          <button type="submit" data-bruno-enviar aria-label="Enviar" disabled={!texto.trim() || pensando}
            style={{ width: "44px", height: "44px", borderRadius: "999px", border: "none", flex: "none", background: texto.trim() && !pensando ? TEAL : "rgba(248,249,250,0.08)", color: texto.trim() && !pensando ? "#06202A" : DATO, display: "flex", alignItems: "center", justifyContent: "center", cursor: texto.trim() && !pensando ? "pointer" : "default" }}>
            <Send size={18} aria-hidden="true" />
          </button>
        </form>
      </section>
    </div>
  );
}

function Burbuja({ rol, children }) {
  const propia = rol === "estudiante";
  const aviso = rol === "aviso";
  return (
    <p
      data-bruno-turno={rol}
      style={{
        margin: 0, maxWidth: "88%", alignSelf: propia ? "flex-end" : "flex-start", whiteSpace: "pre-wrap",
        padding: "10px 13px", borderRadius: propia ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        fontSize: "14px", lineHeight: 1.5,
        background: propia ? "rgba(42,157,143,0.18)" : aviso ? "rgba(233,196,106,0.12)" : "rgba(248,249,250,0.07)",
        border: `1px solid ${propia ? "rgba(42,157,143,0.45)" : aviso ? "rgba(233,196,106,0.45)" : "rgba(248,249,250,0.12)"}`,
        color: BLANCO,
      }}
    >
      {children}
    </p>
  );
}
