import { useEffect, useRef, useState } from "react";
import { X, ArrowUp, HelpCircle, MousePointerClick, Lightbulb } from "lucide-react";
import { supabase } from "../lib/supabase.js";
import { useAuthOpcional } from "../auth/AuthProvider.jsx";
import { contextoActual } from "./contexto.js";
import Mascota from "../components/Mascota.jsx";
import { mascotaDe, ESPECIES } from "../mascota/mascotas.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL ASISTENTE ES TU MASCOTA (orden de Mateo, 25-nov; antes «Bruno», el robot
 * de la prueba piloto del 30-oct).
 *
 * Abajo a la derecha está la mascota del propio estudiante —la que eligió,
 * vistió y tiñó, con su cara y sus accesorios—; al tocarla, el panel crece
 * desde la esquina y ella saluda con su nombre: «Hola, soy Chispa…». Si la
 * mascota no tiene nombre, «Hola, soy tu mascota». Responde orientando, sin
 * dar la respuesta, en 120 palabras como mucho: la regla no cambia.
 *
 * El nombre y la especie viajan con el contexto para que el servidor hable en
 * su voz (supabase/functions/asistente/bruno.js, sistemaPara). El código y
 * los data-bruno-* conservan el nombre viejo: son internos.
 *
 * Movimiento, dentro del Kit: una sola curva, solo transform y opacity, nada en
 * bucle en esta hoja.
 *   · el panel crece desde la esquina del botón;
 *   · la mascota se asoma en la cabecera cada vez que se abre (una vez);
 *   · el saludo y las sugerencias entran escalonados;
 *   · cada mensaje entra deslizándose y la respuesta nueva aparece palabra
 *     por palabra; mientras piensa, tres puntos laten un número fijo de veces.
 * La mascota de la cabecera respira (su ánimo «tranquila», el mismo del perfil
 * y de la ficha de amigos); la del botón y las de los mensajes están quietas.
 * Con movimiento reducido todo aparece sin moverse.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CURVA = "cubic-bezier(.3,.9,.4,1)";
const BLANCO = "#F8F9FA";
const APOYO = "#C9D3E0";
const DATO = "#A8B6C8";
const TEAL = "#2A9D8F";
const TEAL_CLARO = "#5FD3C3";
const AMBAR = "#E9C46A";

/** El nombre de la mascota, limpio; null si no tiene. */
export function nombreDeMascota(perfil) {
  const n = typeof perfil?.mascota_nombre === "string" ? perfil.mascota_nombre.trim() : "";
  return n || null;
}

/** El saludo, con el nombre de la mascota (o «tu mascota» si no tiene). */
export function saludoPara(nombre) {
  return `Hola, soy ${nombre || "tu mascota"}. Si algo de esta actividad no te queda claro, cuéntame qué parte y te ayudo a encontrar el camino. No te voy a dar la respuesta, pero sí la pista.`;
}
export const SALUDO = saludoPara(null);
export const SUGERENCIAS = [
  { texto: "No entiendo esta actividad", Icono: HelpCircle },
  { texto: "¿Qué tengo que tocar?", Icono: MousePointerClick },
  { texto: "Dame una pista", Icono: Lightbulb },
];

export const MOTIVO_SIN_SESION = "Para hablar con tu mascota necesitas iniciar sesión.";

/* Cuánto tarda en terminar de aparecer una respuesta, se escriba lo que se escriba. */
const REVELADO_MS = 1100;

const CSS = `
.fae-bruno-panel { transform-origin: calc(100% - 34px) calc(100% - 110px); transform: scale(.25); opacity: 0; pointer-events: none; transition: transform 460ms ${CURVA}, opacity 260ms ${CURVA}; }
.fae-bruno-panel[data-abierto="si"] { transform: none; opacity: 1; pointer-events: auto; }
.fae-bruno-panel, .fae-bruno-panel * { box-sizing: border-box; }
.fae-bruno-boton { transition: transform 220ms ${CURVA}, opacity 200ms ${CURVA}; }
.fae-bruno-boton:hover { transform: translateY(-3px) scale(1.04); }
.fae-bruno-boton:active { transform: scale(.93); }
.fae-bruno-boton:focus-visible, .fae-bruno-chip:focus-visible, .fae-bruno-enviar:focus-visible, .fae-bruno-cerrar:focus-visible { outline: 2px solid ${TEAL_CLARO}; outline-offset: 3px; }
.fae-bruno-enviar { transition: transform 160ms ${CURVA}, opacity 160ms ${CURVA}; }
.fae-bruno-enviar:not(:disabled):hover { transform: translateY(-1px) scale(1.05); }
.fae-bruno-enviar:active { transform: scale(.9); }
.fae-bruno-chip, .fae-bruno-cerrar { transition: transform 160ms ${CURVA}, opacity 160ms ${CURVA}; }
.fae-bruno-chip:hover { transform: translateY(-2px); }
.fae-bruno-chip:active, .fae-bruno-cerrar:active { transform: scale(.95); }
.fae-bruno-chip::before { content: ""; position: absolute; inset: 0; border-radius: inherit; background: rgba(95,211,195,.10); opacity: 0; transition: opacity 160ms ${CURVA}; pointer-events: none; }
.fae-bruno-chip:hover::before { opacity: 1; }
.fae-bruno-campo:focus { outline: none; border-color: rgba(95,211,195,.75) !important; box-shadow: 0 0 0 3px rgba(42,157,143,.20); }
.fae-bruno-campo::placeholder { color: ${DATO}; opacity: 1; }

.fae-bruno-lista { scrollbar-width: thin; scrollbar-color: rgba(248,249,250,.16) transparent; overscroll-behavior: contain; }
.fae-bruno-lista::-webkit-scrollbar { width: 6px; }
.fae-bruno-lista::-webkit-scrollbar-track { background: transparent; margin: 10px 0; }
.fae-bruno-lista::-webkit-scrollbar-thumb { background: rgba(248,249,250,.14); border-radius: 999px; }
.fae-bruno-lista::-webkit-scrollbar-thumb:hover { background: rgba(248,249,250,.28); }

@keyframes fae-bruno-sube { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@keyframes fae-bruno-desde-derecha { from { opacity: 0; transform: translateX(14px) scale(.97); } to { opacity: 1; transform: none; } }
@keyframes fae-bruno-palabra { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@keyframes fae-bruno-punto { 0%, 100% { opacity: .35; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-3px); } }
@keyframes fae-bruno-asoma { from { opacity: 0; transform: translateY(22px) scale(.86); } to { opacity: 1; transform: none; } }
@keyframes fae-bruno-luz { from { opacity: 0; transform: scale(.6); } to { opacity: 1; transform: none; } }

.fae-bruno-entra { animation: fae-bruno-sube 340ms ${CURVA} both; }
.fae-bruno-entra-propia { animation: fae-bruno-desde-derecha 300ms ${CURVA} both; }
.fae-bruno-palabra { display: inline-block; animation: fae-bruno-palabra 260ms ${CURVA} both; }
.fae-bruno-punto { display: inline-block; width: 6px; height: 6px; border-radius: 999px; background: ${APOYO}; animation: fae-bruno-punto 900ms ${CURVA} 12 both; }
.fae-bruno-asoma { animation: fae-bruno-asoma 640ms ${CURVA} 220ms both; }
.fae-bruno-luz { animation: fae-bruno-luz 600ms ${CURVA} both; }

@media (prefers-reduced-motion: reduce) {
  .fae-bruno-panel, .fae-bruno-boton, .fae-bruno-enviar, .fae-bruno-chip, .fae-bruno-cerrar, .fae-bruno-chip::before { transition: none; }
  .fae-bruno-entra, .fae-bruno-entra-propia, .fae-bruno-palabra, .fae-bruno-punto, .fae-bruno-asoma, .fae-bruno-luz { animation: none !important; }
}
.fae-bruno-escenario { width: 84px; height: 84px; }
@media (max-width: 360px) { .fae-bruno-panel { height: min(90vh, 600px) !important; } .fae-bruno-sugerencias { padding-left: 0 !important; } .fae-bruno-escenario { width: 68px; height: 68px; } .fae-bruno-boton { width: 52px !important; height: 52px !important; right: 10px !important; } }
@media (min-width: 640px) { .fae-bruno-panel { left: auto !important; width: 400px; right: 16px !important; } }
`;

/** Llama a la función del servidor. Devuelve {respuesta} o {error}. */
export async function preguntarABruno({ mensaje, contexto, historial }, cliente = supabase) {
  if (!cliente) return { error: "Tu mascota no está disponible en este momento." };
  const { data, error } = await cliente.functions.invoke("asistente", { body: { mensaje, contexto, historial } });
  if (!error) return { respuesta: data?.respuesta ?? "", usadas: data?.usadas, limite: data?.limite };
  let cuerpo = null;
  try { cuerpo = await error.context?.json?.(); } catch { cuerpo = null; }
  const estado = error.context?.status;
  if (estado === 401) return { error: MOTIVO_SIN_SESION };
  if (estado === 429) return { error: cuerpo?.error ?? "Llegaste al límite de preguntas de hoy. Vuelve mañana.", usadas: cuerpo?.usadas, limite: cuerpo?.limite };
  return { error: cuerpo?.error ?? "Tu mascota no pudo responder ahora. Inténtalo otra vez." };
}

export default function Bruno({ materia = "", tema = "", preguntar = preguntarABruno }) {
  const auth = useAuthOpcional();
  const conSesion = Boolean(auth?.session);
  const perfil = auth?.perfil ?? null;
  const nombre = nombreDeMascota(perfil);
  const llamado = nombre || "tu mascota";
  const Llamado = nombre || "Tu mascota";
  const mascota = { ...mascotaDe(perfil), perfil };
  const especie = ESPECIES.find((e) => e.id === mascota.especie)?.nombre ?? "";
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
    if (!turnos.length && !pensando) { l.scrollTo({ top: 0 }); return; }
    /* Lo nuevo de la mascota crece palabra por palabra y seguir() lo acompaña: no se salta de golpe. */
    if (!pensando && turnos[turnos.length - 1]?.rol === "bruno" && turnos[turnos.length - 1]?.nuevo && !quieto) return;
    const destino = pensando || !ultimo.current ? l.scrollHeight : Math.max(0, ultimo.current.offsetTop - 12);
    l.scrollTo({ top: Math.min(destino, l.scrollHeight - l.clientHeight), behavior: quieto ? "auto" : "smooth" });
  }, [turnos, pensando]);

  /* Mientras la respuesta crece, la lista baja con ella hasta que su primera línea llega arriba. */
  const seguir = () => {
    const l = lista.current;
    if (!l || !ultimo.current) return;
    const tope = Math.max(0, ultimo.current.offsetTop - 12);
    const abajo = l.scrollHeight - l.clientHeight;
    const meta = Math.min(tope, abajo);
    if (meta > l.scrollTop) l.scrollTop = meta;
  };

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
    const contexto = { ...contextoActual({ materia, tema }), mascota: nombre ?? "", especie };
    const r = await preguntar({ mensaje: limpio, contexto, historial });
    setPensando(false);
    if (r.limite !== undefined) setCupo({ usadas: r.usadas, limite: r.limite });
    setTurnos((t) => [...t, r.error ? { rol: "aviso", texto: r.error } : { rol: "bruno", texto: r.respuesta, nuevo: true }]);
  };

  const quedan = cupo ? Math.max(0, cupo.limite - cupo.usadas) : null;
  const ultimoBruno = turnos.reduce((k, t, i) => (t.rol === "bruno" ? i : k), -1);
  const puedeEnviar = Boolean(texto.trim()) && !pensando;

  return (
    <div data-bruno>
      <style>{CSS}</style>
      {!abierto && (
        <button
          type="button"
          data-bruno-abrir
          className="fae-bruno-boton"
          aria-label={`Preguntarle a ${llamado}`}
          onClick={abrir}
          style={{
            position: "fixed", right: "16px", bottom: "calc(88px + env(safe-area-inset-bottom, 0px))", zIndex: 60,
            width: "60px", height: "60px", borderRadius: "999px", padding: 0,
            border: "2px solid rgba(95,211,195,0.85)",
            background: "radial-gradient(circle at 50% 30%, #2B4A78 0%, #1A2F4D 55%, #122138 100%)",
            boxShadow: "0 10px 24px rgba(0,0,0,0.40), 0 0 0 5px rgba(42,157,143,0.16), 0 0 26px rgba(95,211,195,0.22)",
            cursor: "pointer",
          }}
        >
          <span aria-hidden="true" style={{ position: "absolute", inset: 0, borderRadius: "999px", overflow: "hidden", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            <Mascota {...mascota} tamano={54} encuadre="busto" style={{ display: "block", width: "100%", height: "100%", transform: "translateY(5px)" }} />
          </span>
          {/* Un globito de diálogo: «puedes preguntarme». Sin icono SVG, para que
              la regla del celular en Aprender (estilos.js) no lo agrande. */}
          <span aria-hidden="true" style={{
            position: "absolute", top: "-6px", left: "-8px", minWidth: "22px", height: "22px", padding: "0 6px",
            borderRadius: "999px 999px 999px 4px", background: AMBAR, color: "#3A2A05", border: "2px solid #14233A",
            fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 800, lineHeight: "18px", textAlign: "center",
            boxShadow: "0 3px 8px rgba(0,0,0,0.35)",
          }}>?</span>
        </button>
      )}

      <section
        data-bruno-panel
        className="fae-bruno-panel"
        data-abierto={abierto ? "si" : "no"}
        aria-label={`${Llamado}, tu asistente`}
        aria-hidden={abierto ? undefined : "true"}
        style={{
          position: "fixed", left: "8px", right: "8px", bottom: "calc(8px + env(safe-area-inset-bottom, 0px))", zIndex: 61,
          height: "min(78vh, 600px)", display: "flex", flexDirection: "column", overflow: "hidden",
          background: "linear-gradient(180deg, #213758 0%, #172A47 38%, #111D33 100%)",
          border: "1px solid rgba(148,170,210,0.22)", borderRadius: "24px",
          boxShadow: "0 28px 64px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)", fontFamily: "Inter, sans-serif", color: BLANCO,
        }}
      >
        <header style={{
          position: "relative", display: "flex", alignItems: "center", gap: "12px", padding: "12px 8px 12px 12px", flex: "none",
          background: "radial-gradient(120% 140% at 14% 100%, rgba(42,157,143,0.30) 0%, rgba(42,157,143,0) 55%), radial-gradient(90% 120% at 100% 0%, rgba(123,108,246,0.16) 0%, rgba(123,108,246,0) 60%)",
          borderBottom: "1px solid rgba(148,170,210,0.14)",
        }}>
          {/* El escenario: la mascota sobre su luz, como en el vestidor de la tienda. */}
          <span aria-hidden="true" className="fae-bruno-escenario" style={{ position: "relative", flex: "none" }}>
            <span key={`luz-${aperturas}`} className={abierto ? "fae-bruno-luz" : ""} style={{
              position: "absolute", left: "6px", right: "6px", bottom: "4px", height: "16px", borderRadius: "50%",
              background: "radial-gradient(closest-side, rgba(95,211,195,0.55), rgba(95,211,195,0))",
            }} />
            <span style={{
              position: "absolute", inset: "4px", borderRadius: "999px", overflow: "hidden",
              background: "radial-gradient(circle at 50% 35%, rgba(95,211,195,0.22) 0%, rgba(30,53,86,0.85) 62%, rgba(18,33,56,0.95) 100%)",
              border: "1.5px solid rgba(95,211,195,0.55)", boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
            }}>
              <span key={`asoma-${aperturas}`} className={abierto ? "fae-bruno-asoma" : ""} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                <Mascota {...mascota} tamano={76} encuadre="busto" animo="tranquila" style={{ display: "block", width: "100%", height: "100%", transform: "translateY(6px)" }} />
              </span>
            </span>
            <span style={{ position: "absolute", right: "6px", bottom: "8px", width: "14px", height: "14px", borderRadius: "999px", background: pensando ? AMBAR : "#52D49A", border: "3px solid #1A2E4C" }} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL_CLARO }}>{nombre ? "Tu mascota" : "Tu asistente"}</p>
            <h2 style={{ margin: "2px 0 0", fontFamily: "Sora, sans-serif", fontSize: "20px", fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.2, overflowWrap: "anywhere" }}>{Llamado}</h2>
            <p data-bruno-estado style={{ margin: "3px 0 0", fontSize: "12.5px", color: APOYO, lineHeight: 1.35 }}>
              {pensando ? "Pensando una pista…" : "Pistas, no respuestas"}
            </p>
          </div>
          <button type="button" data-bruno-cerrar aria-label={`Cerrar a ${llamado}`} onClick={() => setAbierto(false)} className="fae-bruno-cerrar"
            style={{ alignSelf: "flex-start", width: "44px", height: "44px", borderRadius: "999px", border: "1px solid rgba(148,170,210,0.18)", background: "rgba(8,16,28,0.30)", color: APOYO, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flex: "none" }}>
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
            position: "relative", flex: 1, overflowY: "auto", padding: "16px 12px 10px 12px", display: "flex", flexDirection: "column", gap: "12px",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 14px, #000 calc(100% - 8px), transparent 100%)",
            maskImage: "linear-gradient(to bottom, transparent 0, #000 14px, #000 calc(100% - 8px), transparent 100%)",
          }}
        >
          <Turno key={`saludo-${aperturas}`} rol="bruno" mascota={mascota} retraso={140}>
            <Saludo nombre={nombre} />
          </Turno>
          {turnos.length === 0 && (
            <div key={`chips-${aperturas}`} className="fae-bruno-sugerencias" style={{ display: "flex", flexWrap: "wrap", gap: "8px", paddingLeft: "40px" }}>
              {SUGERENCIAS.map(({ texto: s, Icono }, k) => (
                <span key={s} className="fae-bruno-entra" style={{ animationDelay: `${300 + k * 80}ms`, maxWidth: "100%" }}>
                  <button type="button" data-bruno-sugerencia onClick={() => enviar(s)} className="fae-bruno-chip"
                    style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: "9px", minHeight: "44px", maxWidth: "100%", padding: "0 14px 0 11px", borderRadius: "14px", border: "1px solid rgba(95,211,195,0.38)", background: "rgba(42,157,143,0.10)", color: BLANCO, fontSize: "13px", fontWeight: 600, textAlign: "left", cursor: "pointer" }}>
                    <Icono size={17} strokeWidth={2.2} color={TEAL_CLARO} aria-hidden="true" style={{ flex: "none" }} />
                    {s}
                  </button>
                </span>
              ))}
            </div>
          )}
          {turnos.map((t, k) => (
            <Turno key={k} rol={t.rol} mascota={mascota} refe={k === turnos.length - 1 ? ultimo : null} revelar={t.nuevo && k === ultimoBruno} alCrecer={seguir}>{t.texto}</Turno>
          ))}
          {pensando && (
            <div data-bruno-pensando aria-label={`${Llamado} está pensando`} className="fae-bruno-entra" style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <MiniMascota mascota={mascota} />
              <div style={{ display: "flex", gap: "5px", alignItems: "center", padding: "13px 15px", borderRadius: "6px 18px 18px 18px", background: "rgba(248,249,250,0.07)", border: "1px solid rgba(148,170,210,0.18)" }}>
                {[0, 1, 2].map((k) => <span key={k} className="fae-bruno-punto" style={{ animationDelay: `${k * 150}ms` }} />)}
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); enviar(texto); }}
          style={{ flex: "none", padding: "10px 12px 10px", borderTop: "1px solid rgba(148,170,210,0.14)", background: "rgba(8,16,28,0.38)" }}
        >
          <div style={{ display: "flex", gap: "8px" }}>
            <label htmlFor="fae-bruno-campo" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)" }}>{`Tu pregunta para ${llamado}`}</label>
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
              style={{ flex: 1, minWidth: 0, minHeight: "46px", padding: "0 16px", borderRadius: "999px", border: "1px solid rgba(148,170,210,0.24)", background: "rgba(248,249,250,0.06)", color: BLANCO, fontSize: "15px", fontFamily: "Inter, sans-serif", textOverflow: "ellipsis" }}
            />
            <button type="submit" data-bruno-enviar aria-label="Enviar" disabled={!puedeEnviar} className="fae-bruno-enviar"
              style={{ width: "46px", height: "46px", borderRadius: "999px", border: "none", flex: "none", background: puedeEnviar ? `linear-gradient(135deg, ${TEAL_CLARO}, ${TEAL})` : "rgba(248,249,250,0.08)", color: puedeEnviar ? "#06202A" : DATO, display: "flex", alignItems: "center", justifyContent: "center", cursor: puedeEnviar ? "pointer" : "default", boxShadow: puedeEnviar ? "0 6px 16px rgba(42,157,143,0.40)" : "none" }}>
              <ArrowUp size={20} strokeWidth={2.4} aria-hidden="true" />
            </button>
          </div>
          <p style={{ margin: "7px 0 0", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", fontSize: "11px", whiteSpace: "nowrap", overflow: "hidden", color: DATO, textAlign: "center" }}>
            <Lightbulb size={12} color={AMBAR} aria-hidden="true" style={{ flex: "none" }} />
            {quedan === null
              ? "Te da la pista, la respuesta la encuentras tú"
              : <span data-bruno-cupo>Te da la pista · {quedan} preguntas más hoy</span>}
          </p>
        </form>
      </section>
    </div>
  );
}

/* El saludo, con el nombre de la mascota resaltado. El texto es saludoPara(nombre). */
function Saludo({ nombre }) {
  const quien = nombre || "tu mascota";
  const [antes, despues] = saludoPara(nombre).split(quien);
  return <>{antes}<strong style={{ color: TEAL_CLARO, fontWeight: 700 }}>{quien}</strong>{despues}</>;
}

/* La mascota en chiquito, al lado de lo que dice. */
function MiniMascota({ mascota }) {
  return (
    <span aria-hidden="true" style={{
      width: "32px", height: "32px", flex: "none", borderRadius: "999px", overflow: "hidden", position: "relative",
      background: "radial-gradient(circle at 50% 35%, #2B4A78 0%, #172A47 75%)", border: "1.5px solid rgba(95,211,195,0.50)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <Mascota {...mascota} tamano={30} encuadre="busto" style={{ display: "block", width: "100%", height: "100%", transform: "translateY(3px)" }} />
    </span>
  );
}

/*
 * La respuesta nueva aparece palabra por palabra y la burbuja CRECE con ella:
 * las palabras se agregan de verdad (no se reserva el hueco), así no se ve una
 * caja vacía que se llena. Con movimiento reducido, de una.
 */
function Palabras({ texto, alCrecer }) {
  const trozos = String(texto).split(/(\s+)/);
  const n = Math.max(1, trozos.filter((t) => t.trim()).length);
  const quieto = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const [vistas, setVistas] = useState(quieto ? n : 1);
  useEffect(() => {
    if (vistas >= n) return undefined;
    const paso = Math.max(16, Math.min(34, REVELADO_MS / n));
    const t = setTimeout(() => setVistas((v) => Math.min(n, v + 1)), paso);
    return () => clearTimeout(t);
  }, [vistas, n]);
  useEffect(() => { alCrecer?.(); }, [vistas]); // eslint-disable-line react-hooks/exhaustive-deps
  const salida = [];
  let i = 0;
  for (let k = 0; k < trozos.length; k++) {
    const t = trozos[k];
    if (!t.trim()) { if (i < vistas) salida.push(t); continue; }
    if (i >= vistas) break;
    salida.push(<span key={k} className={quieto ? undefined : "fae-bruno-palabra"}>{t}</span>);
    i++;
  }
  return salida;
}

function Turno({ rol, children, mascota, refe = null, revelar = false, retraso = 0, alCrecer = null }) {
  const propia = rol === "estudiante";
  const aviso = rol === "aviso";
  const burbuja = (
    <p
      ref={propia ? refe : null}
      data-bruno-turno={rol}
      className={propia ? "fae-bruno-entra-propia" : undefined}
      style={{
        margin: 0, maxWidth: propia ? "84%" : "100%", minWidth: 0, alignSelf: propia ? "flex-end" : undefined, whiteSpace: "pre-wrap", overflowWrap: "anywhere",
        padding: "11px 14px", borderRadius: propia ? "18px 18px 6px 18px" : "6px 18px 18px 18px",
        fontSize: "14px", lineHeight: 1.55,
        background: propia ? "linear-gradient(135deg, rgba(42,157,143,0.42), rgba(42,157,143,0.24))" : aviso ? "rgba(233,196,106,0.10)" : "rgba(248,249,250,0.07)",
        border: `1px solid ${propia ? "rgba(95,211,195,0.50)" : aviso ? "rgba(233,196,106,0.40)" : "rgba(148,170,210,0.18)"}`,
        boxShadow: propia ? "0 4px 14px rgba(42,157,143,0.18)" : "none",
        color: BLANCO, animationDelay: propia && retraso ? `${retraso}ms` : undefined,
      }}
    >
      {revelar ? <Palabras texto={children} alCrecer={alCrecer} /> : children}
    </p>
  );
  if (propia) return burbuja;
  /* Lo que dice la mascota (o un aviso) va con su carita al lado. */
  return (
    <div ref={refe} className="fae-bruno-entra" style={{ display: "flex", alignItems: "flex-start", gap: "8px", maxWidth: "94%", animationDelay: retraso ? `${retraso}ms` : undefined }}>
      <MiniMascota mascota={mascota} />
      {burbuja}
    </div>
  );
}
