import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Star, X, EyeOff, Check } from "lucide-react";
import { FAE } from "../../theme.js";
import { supabase } from "../../lib/supabase.js";
import { useAuth } from "../../auth/AuthProvider.jsx";
import { TEMAS, ESCALA, LARGO_MAXIMO, sePuedeEnviar, enviarOpinion } from "../../opinion/enviar.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA HOJA DE OPINIÓN
 *
 * Encargo de Mateo (30-oct): que los estudiantes digan qué les parece la
 * página, qué cambiarían, qué les estorba. Puntuación, texto libre, y el
 * anonimato remarcado en la propia interfaz.
 *
 * ═══════════ POR QUÉ EL ANÓNIMO VIENE PUESTO ═══════════
 *
 * Porque lo que hace falta no es una opinión, es una opinión incómoda. Un
 * estudiante que sabe que su nombre va pegado a «los rankings me dan ansiedad»
 * escribe «todo bien, gracias» — y esa respuesta no sirve para corregir nada.
 * Así que el anónimo es el estado por defecto y firmar es la excepción
 * voluntaria, no al revés.
 *
 * La promesa va dicha dos veces y en dos registros distintos: en el bloque de
 * arriba, que es lo primero que se lee, y en la casilla de firmar, que es
 * donde se podría perder. Y se cumple en el servidor: cuando la opinión es
 * anónima, el user_id no se escribe nunca (ver 0155). La interfaz no promete
 * nada que la base no sostenga.
 *
 * ═══════════ POR QUÉ CINCO ESTRELLAS CON PALABRAS ═══════════
 *
 * Las estrellas se entienden sin instrucciones, y cada una lleva su frase
 * debajo porque una escala muda la interpreta cada quien a su manera: tres
 * estrellas puede ser «bien» o «regular» según el día, y entonces el promedio
 * no significa nada. El relleno es teal —nunca ámbar, que está reservado para
 * las alertas del panel, ni coral, que es alarma—.
 *
 * ═══════════ LOS CUATRO TEMAS ═══════════
 *
 * Interfaz, actividades, ejemplos y rankings: los cuatro que pidió Mateo.
 * Van como botones opcionales ADEMÁS del texto, no en su lugar. Marcar un
 * tema cuesta un toque y convierte un montón de párrafos en algo que se puede
 * ordenar: «siete de nueve quejas son de la interfaz» es una decisión, «leí
 * cuarenta opiniones» no lo es.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Ancho de lectura del texto libre: más allá de esto, la línea cansa. */
const MAX_ANCHO = 440;

/*
 * El color del marcador de posición. Sin esto cada navegador pone el suyo
 * —gris medio pensado para fondo claro—, y sobre esta hoja oscura el texto
 * que dice de qué hablar es justo el que no se lee. 0,55 da 5,46:1.
 */
export const CSS_HOJA = `
[data-hoja-opinion] textarea::placeholder {
  color: rgba(248,249,250,0.55);
  opacity: 1;
}
/* El foco del campo, con el teal de la casa: el contorno blanco por defecto
   del navegador no es de este sitio y además tapa el borde redondeado. */
[data-hoja-opinion] textarea:focus-visible {
  outline: none;
  border-color: #2A9D8F;
  box-shadow: 0 0 0 3px rgba(42,157,143,0.26);
}
`;

const etiqueta = {
  fontFamily: "Inter, sans-serif",
  fontSize: "12.5px",
  fontWeight: 600,
  letterSpacing: "0.02em",
  color: "#A8B6C8",
  margin: "0 0 8px",
};

export default function HojaOpinion({ abierta, onCerrar, origen = "inicio" }) {
  const { session, perfil } = useAuth();
  const apodo = perfil?.nickname ?? null;
  const puedeFirmar = Boolean(session && apodo);

  const [puntaje, setPuntaje] = useState(0);
  const [texto, setTexto] = useState("");
  const [temas, setTemas] = useState([]);
  const [firmar, setFirmar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const primerBoton = useRef(null);

  /* Escape cierra, y el fondo deja de desplazarse mientras la hoja está arriba. */
  useEffect(() => {
    if (!abierta) return;
    const onKey = (e) => { if (e.key === "Escape") onCerrar?.(); };
    window.addEventListener("keydown", onKey);
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    primerBoton.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previo;
    };
  }, [abierta, onCerrar]);

  /* Se abre siempre en blanco: la hoja de ayer no es el borrador de hoy. */
  useEffect(() => {
    if (!abierta) return;
    setPuntaje(0); setTexto(""); setTemas([]); setFirmar(false);
    setEnviando(false); setResultado(null);
  }, [abierta]);

  if (!abierta) return null;

  const alternarTema = (id) =>
    setTemas((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));

  const enviar = async () => {
    if (!sePuedeEnviar({ puntaje }) || enviando) return;
    setEnviando(true);
    const r = await enviarOpinion(supabase, {
      puntaje, texto, temas, origen,
      anonimo: !(puedeFirmar && firmar),
      ancho: typeof window === "undefined" ? null : window.innerWidth,
    });
    setEnviando(false);
    setResultado(r);
  };

  /*
   * ═══════════ POR QUÉ VA EN UN PORTAL ═══════════
   *
   * El botón vive dentro del cuerpo de la portada, que es un
   * `position: relative; z-index: 2`. Eso abre un contexto de apilamiento:
   * dentro de él, el 120 de esta hoja compite contra el 2 de su padre, no
   * contra el resto del sitio, y el control de cuenta —que va fuera, en 40—
   * se dibujaba ENCIMA del velo. Se vio en la captura: el botón «Entrar»
   * flotando sobre el diálogo. Colgando la hoja del body, su z-index vuelve a
   * medirse contra el sitio entero.
   */
  return createPortal((
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Dinos qué te parece aprendeFAE"
      onClick={onCerrar}
      style={{
        position: "fixed", inset: 0, zIndex: 120,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
        background: "rgba(10,20,34,0.80)",
        backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <style>{CSS_HOJA}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        data-hoja-opinion
        style={{
          position: "relative", width: "100%", maxWidth: `${MAX_ANCHO}px`,
          maxHeight: "calc(100vh - 32px)", overflowY: "auto",
          borderRadius: "20px", background: "#16233A",
          border: "1px solid rgba(248,249,250,0.14)",
          padding: "clamp(20px, 5vw, 26px)",
          fontFamily: "Inter, sans-serif",
          boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
        }}
      >
        {/*
          * El blanco de toque es el botón entero: 44 × 44 de verdad, con el
          * círculo de 30 dibujado dentro. No se usa el ::after compartido de
          * .fae-logo-boton porque esta hoja desplaza su contenido, y un
          * contenedor con overflow recorta el pseudo-elemento que se sale: la
          * sonda lo midió en 38 × 44 a 320 px, y 38 no es 44.
          */}
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          style={{
            position: "absolute", top: "7px", right: "7px",
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "44px", height: "44px", padding: 0,
            background: "transparent", border: "none", cursor: "pointer",
          }}
        >
          <span style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "30px", height: "30px", borderRadius: "999px",
            background: "rgba(248,249,250,0.06)",
          }}>
            <X size={16} color="rgba(248,249,250,0.6)" />
          </span>
        </button>

        {resultado?.ok ? (
          <Gracias onCerrar={onCerrar} />
        ) : (
          <>
            <h2 style={{
              fontFamily: "Sora, sans-serif", fontSize: "20px", fontWeight: 700,
              letterSpacing: "-0.02em", lineHeight: 1.25, color: FAE.text,
              margin: "0 44px 6px 0",
            }}>
              ¿Qué te parece aprendeFAE?
            </h2>
            <p style={{ margin: "0 0 18px", fontSize: "13.5px", lineHeight: 1.55, color: "rgba(248,249,250,0.72)" }}>
              La hicimos para ti, así que la arreglamos con lo que nos digas. Lo bueno sirve;
              lo que no te gusta sirve más.
            </p>

            {/* ── EL ANONIMATO, REMARCADO ───────────────────────────────── */}
            <div style={{
              display: "flex", gap: "10px", alignItems: "flex-start",
              padding: "12px 14px", marginBottom: "20px",
              borderRadius: "14px",
              background: "rgba(42,157,143,0.10)",
              border: "1px solid rgba(42,157,143,0.42)",
            }}>
              <EyeOff size={16} color={FAE.teal} style={{ flexShrink: 0, marginTop: "2px" }} aria-hidden="true" />
              <p style={{ margin: 0, fontSize: "12.5px", lineHeight: 1.5, color: FAE.text }}>
                <strong style={{ fontWeight: 700 }}>Esto es anónimo.</strong>{" "}
                <span style={{ color: "rgba(248,249,250,0.78)" }}>
                  No guardamos quién lo escribió: ni nosotros ni tu profesor pueden saberlo.
                  Di lo que piensas de verdad.
                </span>
              </p>
            </div>

            {/* ── PUNTUACIÓN ────────────────────────────────────────────── */}
            <p style={etiqueta}>Qué tan bien te sirve</p>
            {/*
              * Sin hueco entre estrellas y sin encogerse. A 320 px, con la hoja
              * desplazándose y su barra puesta, quedan unos 231 px útiles: cinco
              * blancos de 44 son 220 y entran justos, pero 2 px de hueco entre
              * cada par los dejaban en 228 y el navegador encogía los botones a
              * 38. La sonda lo cazó; 38 no es 44, y una estrella que falla al
              * tocarla es una opinión que no se manda.
              */}
            <div role="radiogroup" aria-label="Puntuación de 1 a 5" style={{ display: "flex", gap: 0, marginBottom: "6px" }}>
              {[1, 2, 3, 4, 5].map((n) => {
                const puesta = n <= puntaje;
                return (
                  <button
                    key={n}
                    ref={n === 1 ? primerBoton : null}
                    type="button"
                    role="radio"
                    aria-checked={puntaje === n}
                    aria-label={`${n} de 5 — ${ESCALA[n]}`}
                    onClick={() => setPuntaje(n)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: "44px", height: "44px", minWidth: "44px", flexShrink: 0, padding: 0,
                      background: "transparent", border: "none", cursor: "pointer",
                      borderRadius: "12px",
                    }}
                  >
                    <Star
                      size={26}
                      /* Relleno teal cuando está puesta; contorno cuando no. El teal
                         rellena, nunca escribe (regla de la casa). */
                      color={puesta ? FAE.teal : "rgba(248,249,250,0.34)"}
                      fill={puesta ? FAE.teal : "none"}
                      strokeWidth={1.8}
                    />
                  </button>
                );
              })}
            </div>
            <p aria-live="polite" style={{
              margin: "0 0 20px", fontSize: "13px", minHeight: "20px",
              fontWeight: puntaje ? 600 : 400,
              /* 0,55 y no 0,45: a 0,45 el contraste sobre la hoja era 4,13:1,
                 por debajo del 4,5 que pide WCAG para texto normal. Medido. */
              color: puntaje ? FAE.node : "rgba(248,249,250,0.55)",
            }}>
              {puntaje ? ESCALA[puntaje] : "Toca una estrella"}
            </p>

            {/* ── TEMAS ─────────────────────────────────────────────────── */}
            <p style={etiqueta}>¿De qué nos quieres hablar? <span style={{ fontWeight: 400 }}>(opcional)</span></p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
              {TEMAS.map((t) => {
                const puesto = temas.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={puesto}
                    onClick={() => alternarTema(t.id)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      minHeight: "44px", padding: "0 14px", borderRadius: "999px",
                      /* Puesto: relleno teal con tinta oscura encima. */
                      background: puesto ? FAE.teal : "rgba(248,249,250,0.055)",
                      border: puesto ? "1px solid transparent" : "1px solid rgba(248,249,250,0.16)",
                      color: puesto ? "#06202A" : "rgba(248,249,250,0.86)",
                      fontFamily: "Inter, sans-serif", fontSize: "13px",
                      fontWeight: puesto ? 700 : 500,
                      cursor: "pointer",
                    }}
                  >
                    {puesto && <Check size={14} strokeWidth={3} aria-hidden="true" />}
                    {t.etiqueta}
                  </button>
                );
              })}
            </div>

            {/* ── TEXTO LIBRE ───────────────────────────────────────────── */}
            <p style={etiqueta}>Cuéntanos <span style={{ fontWeight: 400 }}>(opcional)</span></p>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value.slice(0, LARGO_MAXIMO))}
              rows={4}
              aria-label="Tu retroalimentación"
              placeholder="Ideas para contarnos: qué te parece la interfaz, si las actividades se entienden, si los ejemplos te sirven, qué opinas de los rankings… y cualquier cosa que cambiarías."
              style={{
                width: "100%", boxSizing: "border-box", resize: "vertical",
                minHeight: "104px", padding: "12px 14px",
                borderRadius: "14px",
                background: "rgba(10,20,34,0.55)",
                border: "1px solid rgba(248,249,250,0.16)",
                color: FAE.text, fontFamily: "Inter, sans-serif",
                /* 16 px a propósito: por debajo de eso Safari en iPhone hace zoom
                   al enfocar el campo y descoloca la hoja entera. */
                fontSize: "16px", lineHeight: 1.5,
              }}
            />
            <p style={{ margin: "6px 0 18px", fontSize: "12px", color: "rgba(248,249,250,0.55)", textAlign: "right" }}>
              {texto.length} / {LARGO_MAXIMO}
            </p>

            {/* ── FIRMAR, LA EXCEPCIÓN VOLUNTARIA ──────────────────────── */}
            {puedeFirmar && (
              <label style={{
                display: "flex", gap: "10px", alignItems: "flex-start",
                minHeight: "44px", padding: "4px 0", marginBottom: "18px", cursor: "pointer",
              }}>
                <input
                  type="checkbox"
                  checked={firmar}
                  onChange={(e) => setFirmar(e.target.checked)}
                  style={{ width: "20px", height: "20px", marginTop: "2px", accentColor: FAE.teal, flexShrink: 0 }}
                />
                <span style={{ fontSize: "13px", lineHeight: 1.5, color: "rgba(248,249,250,0.80)" }}>
                  Firmarla como <strong style={{ color: FAE.text }}>{apodo}</strong>, por si quieren
                  preguntarme más. <span style={{ color: "rgba(248,249,250,0.55)" }}>Si lo dejas sin marcar, va anónima.</span>
                </span>
              </label>
            )}

            {resultado && !resultado.ok && (
              <p role="alert" style={{
                margin: "0 0 14px", padding: "10px 12px", borderRadius: "12px",
                background: "rgba(231,111,81,0.12)", border: "1px solid rgba(231,111,81,0.45)",
                fontSize: "12.5px", lineHeight: 1.5, color: FAE.text,
              }}>
                {resultado.motivo === "repetida"
                  ? "Ya nos enviaste varias hoy — gracias. Si te queda algo por decir, vuelve mañana."
                  : "No se pudo enviar. Revisa tu conexión y vuelve a intentarlo."}
              </p>
            )}

            <button
              type="button"
              onClick={enviar}
              disabled={!sePuedeEnviar({ puntaje }) || enviando}
              style={{
                width: "100%", minHeight: "48px", borderRadius: "999px",
                background: sePuedeEnviar({ puntaje }) ? FAE.teal : "rgba(248,249,250,0.10)",
                border: "none",
                /* Tinta oscura sobre el relleno teal. */
                /* Apagado, la letra va a 0,62: a 0,40 daba 3,17:1 sobre su propio
                   relleno y no se leía qué botón era. Un control apagado también
                   se lee — es como se sabe qué falta por hacer. */
                color: sePuedeEnviar({ puntaje }) ? "#06202A" : "rgba(248,249,250,0.62)",
                fontFamily: "Sora, sans-serif", fontSize: "15px", fontWeight: 700,
                cursor: sePuedeEnviar({ puntaje }) ? "pointer" : "not-allowed",
                opacity: enviando ? 0.7 : 1,
              }}
            >
              {enviando ? "Enviando…" : "Enviar"}
            </button>
          </>
        )}
      </div>
    </div>
  ), document.body);
}

/*
 * El agradecimiento. Vale la pena su propio estado y no un aviso que se
 * desvanece: quien acaba de dedicarte dos minutos merece ver que llegó.
 */
function Gracias({ onCerrar }) {
  return (
    <div style={{ textAlign: "center", padding: "14px 0 4px" }}>
      <div style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: "52px", height: "52px", borderRadius: "999px",
        background: "rgba(42,157,143,0.16)", border: `1px solid ${FAE.teal}`,
        marginBottom: "14px",
      }}>
        <Check size={26} color={FAE.teal} strokeWidth={2.4} aria-hidden="true" />
      </div>
      <h2 style={{
        fontFamily: "Sora, sans-serif", fontSize: "19px", fontWeight: 700,
        letterSpacing: "-0.02em", color: FAE.text, margin: "0 0 8px",
      }}>
        Gracias, de verdad
      </h2>
      <p style={{ margin: "0 auto 20px", maxWidth: "320px", fontSize: "13.5px", lineHeight: 1.6, color: "rgba(248,249,250,0.75)" }}>
        Lo vamos a leer completo. Las cosas que más se repitan son las que se arreglan primero.
      </p>
      <button
        type="button"
        onClick={onCerrar}
        style={{
          minHeight: "44px", padding: "0 24px", borderRadius: "999px",
          background: "rgba(248,249,250,0.08)", border: "1px solid rgba(248,249,250,0.18)",
          color: FAE.text, fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Seguir estudiando
      </button>
    </div>
  );
}
