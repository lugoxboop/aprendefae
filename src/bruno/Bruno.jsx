import { useEffect, useRef, useState } from "react";
import { X, ArrowUp } from "lucide-react";
import { supabase } from "../lib/supabase.js";
import { useAuthOpcional } from "../auth/AuthProvider.jsx";
import { contextoActual } from "./contexto.js";
import Robot from "./Robot.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * BRUNO — LA VENTANA (orden de Mateo, 30-oct; estética rehecha el mismo día).
 *
 * Un robot abajo a la derecha; al tocarlo el panel crece desde la esquina. El
 * estudiante escribe («no entiendo esta actividad») y Bruno responde orientando,
 * sin dar la respuesta, en 120 palabras como mucho.
 *
 * Lo que ve Bruno lo arma contexto.js en el momento de preguntar. El cerebro
 * (prompt, tope de palabras, cupo diario) vive en el servidor:
 * supabase/functions/asistente.
 *
 * Movimiento (pedido de Mateo: «animaciones de landing page»), dentro del Kit:
 * una sola curva, solo transform y opacity, nada en bucle permanente.
 *   · el panel crece desde la esquina del robot;
 *   · el saludo y las sugerencias entran escalonados cada vez que se abre;
 *   · cada mensaje entra deslizándose (el tuyo desde la derecha, el de Bruno
 *     desde abajo) y la respuesta nueva de Bruno aparece palabra por palabra;
 *   · mientras piensa, tres puntos y la antena laten un número fijo de veces.
 * Con movimiento reducido todo aparece sin moverse.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CURVA = "cubic-bezier(.3,.9,.4,1)";
const BLANCO = "#F8F9FA";
const APOYO = "#C9D3E0";
const DATO = "#A8B6C8";
const TEAL = "#2A9D8F";

export const SALUDO = "Hola, soy Bruno. Si algo de esta actividad no te queda claro, cuéntame qué parte y te ayudo a encontrar el camino. No te voy a dar la respuesta, pero sí la pista.";
export const SUGERENCIAS = ["No entiendo esta actividad", "¿Qué tengo que tocar?", "Dame una pista"];

export const MOTIVO_SIN_SESION = "Para hablar con Bruno necesitas iniciar sesión.";

/* Cuánto tarda en terminar de aparecer una respuesta, se escriba lo que se escriba. */
const REVELADO_MS = 1100;

const CSS = `
.fae-bruno-panel { transform-origin: calc(100% - 26px) 100%; transform: translateY(14px) scale(.94); opacity: 0; pointer-events: none; transition: transform 340ms ${CURVA}, opacity 220ms ${CURVA}; }
.fae-bruno-panel[data-abierto="si"] { transform: none; opacity: 1; pointer-events: auto; }
.fae-bruno-panel, .fae-bruno-panel * { box-sizing: border-box; }
.fae-bruno-boton { transition: transform 200ms ${CURVA}, opacity 200ms ${CURVA}; }
.fae-bruno-boton:hover { transform: translateY(-3px); }
.fae-bruno-boton:active { transform: scale(.93); }
.fae-bruno-enviar { transition: transform 160ms ${CURVA}, opacity 160ms ${CURVA}; }
.fae-bruno-enviar:active { transform: scale(.9); }
.fae-bruno-chip { transition: transform 160ms ${CURVA}, opacity 160ms ${CURVA}; }
.fae-bruno-chip:hover { transform: translateY(-2px); }
.fae-bruno-chip:active { transform: scale(.96); }
.fae-bruno-campo:focus { outline: none; border-color: rgba(42,157,143,.75) !important; box-shadow: 0 0 0 3px rgba(42,157,143,.18); }

.fae-bruno-lista { scrollbar-width: thin; scrollbar-color: rgba(248,249,250,.16) transparent; overscroll-behavior: contain; }
.fae-bruno-lista::-webkit-scrollbar { width: 6px; }
.fae-bruno-lista::-webkit-scrollbar-track { background: transparent; margin: 10px 0; }
.fae-bruno-lista::-webkit-scrollbar-thumb { background: rgba(248,249,250,.14); border-radius: 999px; }
.fae-bruno-lista::-webkit-scrollbar-thumb:hover { background: rgba(248,249,250,.28); }

@keyframes fae-bruno-sube { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@keyframes fae-bruno-desde-derecha { from { opacity: 0; transform: translateX(14px) scale(.97); } to { opacity: 1; transform: none; } }
@keyframes fae-bruno-palabra { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@keyframes fae-bruno-punto { 0%, 100% { opacity: .35; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-3px); } }
@keyframes fae-bruno-saludo { 0% { opacity: 0; transform: translateY(6px) rotate(-14deg) scale(.7); } 60% { opacity: 1; transform: rotate(8deg) scale(1.06); } 100% { opacity: 1; transform: none; } }
@keyframes fae-bruno-parpadeo { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(.12); } }
@keyframes fae-bruno-mira { 0%, 100% { transform: translateX(-1.6px); } 50% { transform: translateX(1.6px); } }
@keyframes fae-bruno-late { 0%, 100% { opacity: .35; } 50% { opacity: 1; } }

.fae-bruno-entra { animation: fae-bruno-sube 340ms ${CURVA} both; }
.fae-bruno-entra-propia { animation: fae-bruno-desde-derecha 300ms ${CURVA} both; }
.fae-bruno-palabra { display: inline-block; animation: fae-bruno-palabra 260ms ${CURVA} both; }
.fae-bruno-punto { display: inline-block; width: 6px; height: 6px; border-radius: 999px; background: ${APOYO}; animation: fae-bruno-punto 900ms ${CURVA} 12 both; }

.fae-bruno-robot-ojos, .fae-bruno-robot-mirada, .fae-bruno-robot-antena { transform-box: fill-box; transform-origin: center; }
.fae-bruno-robot-ojos { animation: fae-bruno-parpadeo 240ms ${CURVA} 1 both; }
.fae-bruno-saluda { animation: fae-bruno-saludo 620ms ${CURVA} both; }
[data-bruno-robot="pensando"] .fae-bruno-robot-mirada { animation: fae-bruno-mira 1100ms ${CURVA} 10 both; }
[data-bruno-robot="pensando"] .fae-bruno-robot-antena { animation: fae-bruno-late 700ms ${CURVA} 16 both; }

@media (prefers-reduced-motion: reduce) {
  .fae-bruno-panel, .fae-bruno-boton, .fae-bruno-enviar, .fae-bruno-chip { transition: none; }
  .fae-bruno-entra, .fae-bruno-entra-propia, .fae-bruno-palabra, .fae-bruno-punto, .fae-bruno-saluda,
  .fae-bruno-robot-ojos, .fae-bruno-robot-mirada, .fae-bruno-robot-antena { animation: none !important; }
}
@media (min-width: 640px) { .fae-bruno-panel { left: auto !important; width: 384px; right: 16px !important; } }
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
  const [aperturas, setAperturas] = useState(0);
  const [turnos, setTurnos] = useState([]);
  const [texto, setTexto] = useState("");
  const [pensando, setPensando] = useState(false);
  const [cupo, setCupo] = useState(null);
  const lista = useRef(null);
  const campo = useRef(null);
  const ultimo = useRef(null);

  /* Al cambiar de tema, la conversación empieza de nuevo: el contexto ya es otro. */
  useEffect(() => { setTurnos([]); }, [tema]);
  useEffect(() => { if (abierto) campo.current?.focus?.({ preventScroll: true }); }, [abierto]);
  /* Al llegar un mensaje, se lleva su comienzo a la vista: una respuesta larga se lee desde arriba. */
  useEffect(() => {
    const l = lista.current;
    if (!l?.scrollTo) return;
    const quieto = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const destino = pensando || !ultimo.current ? l.scrollHeight : Math.max(0, ultimo.current.offsetTop - 12);
    l.scrollTo({ top: destino, behavior: quieto ? "auto" : "smooth" });
  }, [turnos, pensando]);

  const abrir = () => { setAperturas((n) => n + 1); setAbierto(true); };

  const enviar = async (mensaje) => {
    const limpio = mensaje.trim();
    if (!limpio || pensando) return;
    if (!conSesion) {
      setTurnos((t) => [...t, { rol: "estudiante", texto: limpio }, { rol: "aviso", texto: MOTIVO_SIN_SESION }]);
      setTexto("");
      return;
    }
    const historial = turnos.filter((t) => t.rol === "estudiante" || t.rol === "bruno").map(({ rol, texto: x }) => ({ rol, texto: x }));
    setTurnos((t) => [...t, { rol: "estudiante", texto: limpio }]);
    setTexto("");
    setPensando(true);
    const r = await preguntar({ mensaje: limpio, contexto: contextoActual({ materia, tema }), historial });
    setPensando(false);
    if (r.limite !== undefined) setCupo({ usadas: r.usadas, limite: r.limite });
    setTurnos((t) => [...t, r.error ? { rol: "aviso", texto: r.error } : { rol: "bruno", texto: r.respuesta, nuevo: true }]);
  };

  const quedan = cupo ? Math.max(0, cupo.limite - cupo.usadas) : null;
  const ultimoBruno = turnos.reduce((k, t, i) => (t.rol === "bruno" ? i : k), -1);

  return (
    <div data-bruno>
      <style>{CSS}</style>
      {!abierto && (
        <button
          type="button"
          data-bruno-abrir
          className="fae-bruno-boton"
          aria-label="Preguntarle a Bruno"
          onClick={abrir}
          style={{
            position: "fixed", right: "16px", bottom: "calc(88px + env(safe-area-inset-bottom, 0px))", zIndex: 60,
            width: "56px", height: "56px", borderRadius: "999px", padding: 0,
            border: "1.5px solid rgba(42,157,143,0.85)",
            background: "radial-gradient(circle at 30% 25%, #1E3556 0%, #14233A 70%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 22px rgba(0,0,0,0.38), 0 0 0 4px rgba(42,157,143,0.14)", cursor: "pointer",
          }}
        >
          <Robot tamano={38} />
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
          height: "min(74vh, 580px)", display: "flex", flexDirection: "column", overflow: "hidden",
          background: "linear-gradient(180deg, #1A2F4D 0%, #14233A 34%, #101D31 100%)",
          border: "1px solid rgba(248,249,250,0.14)", borderRadius: "22px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(42,157,143,0.10)", fontFamily: "Inter, sans-serif", color: BLANCO,
        }}
      >
        <header style={{
          display: "flex", alignItems: "center", gap: "12px", padding: "14px 10px 12px 16px",
          background: "linear-gradient(180deg, rgba(42,157,143,0.16) 0%, rgba(42,157,143,0) 100%)",
          borderBottom: "1px solid rgba(248,249,250,0.08)",
        }}>
          <span aria-hidden="true" style={{
            width: "46px", height: "46px", flex: "none", borderRadius: "999px", display: "flex", alignItems: "center", justifyContent: "center",
            background: "radial-gradient(circle at 35% 30%, #23406A 0%, #0E1B2E 75%)", border: "1px solid rgba(42,157,143,0.55)", position: "relative",
          }}>
            <span key={aperturas} className={abierto ? "fae-bruno-saluda" : ""} style={{ display: "block" }}>
              <Robot tamano={34} estado={pensando ? "pensando" : "quieto"} parpadeo={turnos.length} />
            </span>
            <span style={{ position: "absolute", right: "1px", bottom: "2px", width: "10px", height: "10px", borderRadius: "999px", background: "#52D49A", border: "2px solid #14233A" }} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ margin: 0, fontFamily: "Sora, sans-serif", fontSize: "17px", fontWeight: 700, letterSpacing: "-0.01em" }}>Bruno</h2>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: DATO, lineHeight: 1.35 }}>
              {pensando ? "Pensando una pista…" : "Te orienta sin darte la respuesta"}
              {quedan !== null && (
                <span data-bruno-cupo style={{ display: "inline-block", marginLeft: "6px", padding: "1px 7px", borderRadius: "999px", background: "rgba(248,249,250,0.07)", color: APOYO, fontSize: "11px", whiteSpace: "nowrap" }}>
                  {quedan} preguntas más hoy
                </span>
              )}
            </p>
          </div>
          <button type="button" data-bruno-cerrar aria-label="Cerrar a Bruno" onClick={() => setAbierto(false)} className="fae-bruno-chip"
            style={{ width: "44px", height: "44px", borderRadius: "999px", border: "none", background: "transparent", color: APOYO, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flex: "none" }}>
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div
          ref={lista}
          data-bruno-lista
          role="log"
          aria-live="polite"
          className="fae-bruno-lista"
          style={{
            flex: 1, overflowY: "auto", padding: "16px 12px 8px 14px", display: "flex", flexDirection: "column", gap: "10px",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 14px, #000 calc(100% - 8px), transparent 100%)",
            maskImage: "linear-gradient(to bottom, transparent 0, #000 14px, #000 calc(100% - 8px), transparent 100%)",
          }}
        >
          <Burbuja key={`saludo-${aperturas}`} rol="bruno" retraso={120}>{SALUDO}</Burbuja>
          {turnos.length === 0 && (
            <div key={`chips-${aperturas}`} style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "2px" }}>
              {SUGERENCIAS.map((s, k) => (
                <span key={s} className="fae-bruno-entra" style={{ animationDelay: `${260 + k * 70}ms` }}>
                  <button type="button" data-bruno-sugerencia onClick={() => enviar(s)} className="fae-bruno-chip"
                    style={{ minHeight: "44px", padding: "0 15px", borderRadius: "999px", border: "1px solid rgba(42,157,143,0.45)", background: "rgba(42,157,143,0.08)", color: BLANCO, fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
                    {s}
                  </button>
                </span>
              ))}
            </div>
          )}
          {turnos.map((t, k) => (
            <Burbuja key={k} rol={t.rol} refe={k === turnos.length - 1 ? ultimo : null} revelar={t.nuevo && k === ultimoBruno}>{t.texto}</Burbuja>
          ))}
          {pensando && (
            <div data-bruno-pensando aria-label="Bruno está pensando" className="fae-bruno-entra"
              style={{ alignSelf: "flex-start", display: "flex", gap: "5px", alignItems: "center", padding: "13px 15px", borderRadius: "18px 18px 18px 6px", background: "rgba(248,249,250,0.06)", border: "1px solid rgba(248,249,250,0.10)" }}>
              {[0, 1, 2].map((k) => <span key={k} className="fae-bruno-punto" style={{ animationDelay: `${k * 150}ms` }} />)}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); enviar(texto); }}
          style={{ display: "flex", gap: "8px", padding: "10px 12px 12px", borderTop: "1px solid rgba(248,249,250,0.08)", background: "rgba(8,16,28,0.35)" }}
        >
          <label htmlFor="fae-bruno-campo" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)" }}>Tu pregunta para Bruno</label>
          <input
            id="fae-bruno-campo"
            ref={campo}
            data-bruno-campo
            className="fae-bruno-campo"
            value={texto}
            maxLength={600}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe tu duda…"
            autoComplete="off"
            style={{ flex: 1, minWidth: 0, minHeight: "46px", padding: "0 16px", borderRadius: "999px", border: "1px solid rgba(248,249,250,0.16)", background: "rgba(248,249,250,0.06)", color: BLANCO, fontSize: "15px", fontFamily: "Inter, sans-serif" }}
          />
          <button type="submit" data-bruno-enviar aria-label="Enviar" disabled={!texto.trim() || pensando} className="fae-bruno-enviar"
            style={{ width: "46px", height: "46px", borderRadius: "999px", border: "none", flex: "none", background: texto.trim() && !pensando ? TEAL : "rgba(248,249,250,0.08)", color: texto.trim() && !pensando ? "#06202A" : DATO, display: "flex", alignItems: "center", justifyContent: "center", cursor: texto.trim() && !pensando ? "pointer" : "default", boxShadow: texto.trim() && !pensando ? "0 4px 14px rgba(42,157,143,0.35)" : "none" }}>
            <ArrowUp size={20} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </form>
      </section>
    </div>
  );
}

/* La respuesta nueva de Bruno aparece palabra por palabra; el resto, de una. */
function Palabras({ texto }) {
  const trozos = String(texto).split(/(\s+)/);
  const n = Math.max(1, trozos.filter((t) => t.trim()).length);
  const paso = Math.min(28, REVELADO_MS / n);
  let i = 0;
  return trozos.map((t, k) => {
    if (!t.trim()) return t;
    const retraso = Math.round(80 + paso * i++);
    return <span key={k} className="fae-bruno-palabra" style={{ animationDelay: `${retraso}ms` }}>{t}</span>;
  });
}

function Burbuja({ rol, children, refe = null, revelar = false, retraso = 0 }) {
  const propia = rol === "estudiante";
  const aviso = rol === "aviso";
  return (
    <p
      ref={refe}
      data-bruno-turno={rol}
      className={propia ? "fae-bruno-entra-propia" : "fae-bruno-entra"}
      style={{
        margin: 0, maxWidth: "88%", alignSelf: propia ? "flex-end" : "flex-start", whiteSpace: "pre-wrap",
        padding: "11px 14px", borderRadius: propia ? "18px 18px 6px 18px" : "18px 18px 18px 6px",
        fontSize: "14px", lineHeight: 1.55, animationDelay: retraso ? `${retraso}ms` : undefined,
        background: propia ? "linear-gradient(135deg, rgba(42,157,143,0.32), rgba(42,157,143,0.18))" : aviso ? "rgba(233,196,106,0.10)" : "rgba(248,249,250,0.06)",
        border: `1px solid ${propia ? "rgba(42,157,143,0.50)" : aviso ? "rgba(233,196,106,0.40)" : "rgba(248,249,250,0.10)"}`,
        color: BLANCO,
      }}
    >
      {revelar ? <Palabras texto={children} /> : children}
    </p>
  );
}
