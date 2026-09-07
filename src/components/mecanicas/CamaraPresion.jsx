import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { FAE } from "../../theme.js";
import { DEFINICIONES, normalizar } from "../../data/icebergActividades.js";
import { barajarDistinto } from "../../utils/barajar.js";

/*
 * "Cámara de presión" — el peldaño Recordar de Bloom.
 *
 * Se enseña la DEFINICIÓN y se pide el término. Nunca al revés, y esa es toda
 * la idea: reconocer un nombre entre cuatro opciones es mucho más fácil que
 * sacarlo de la memoria, y lo que fija el término es lo segundo.
 *
 * DE AHÍ LOS DOS MODOS, y por eso no valen lo mismo:
 *   fácil    cuatro burbujas con los nombres. Reconocer. 1 punto por acierto.
 *   difícil  campo de texto vacío. Recordar de verdad. 2 puntos por acierto.
 *
 * El modo elegido cambia la dificultad que se le declara al motor de FP: medio
 * o difícil. No es lo mismo lo que se le está pidiendo al estudiante, así que
 * no sería honesto pagarlo igual.
 *
 * LA PRESIÓN ES EL RELOJ. El manómetro sube mientras se piensa y el cristal se
 * va rajando; no hay un número contando hacia atrás porque un cronómetro
 * apura, y una grieta que avanza se siente sin tener que mirarla.
 */

const SEGUNDOS = 18;
const TICK_MS = 100;

const CSS = `
@keyframes fae-cp-sello { from { opacity: 0.9; } to { opacity: 0; } }
.fae-cp-sello { animation: fae-cp-sello 620ms ease-out forwards; }
@keyframes fae-cp-empuje { 0% { transform: translateY(0); } 40% { transform: translateY(14px); } 100% { transform: translateY(0); } }
.fae-cp-empuje { animation: fae-cp-empuje 700ms cubic-bezier(.3,.8,.4,1); }
@media (prefers-reduced-motion: reduce) { .fae-cp-sello, .fae-cp-empuje { animation: none !important; } }
`;

/* Las grietas: se dibujan desde el borde hacia el centro según avanza la presión. */
const GRIETAS = [
  "M 8 44 L 30 50 L 44 46", "M 88 40 L 66 50 L 52 44",
  "M 46 8 L 50 30 L 44 46", "M 50 90 L 48 66 L 52 50",
  "M 18 18 L 36 36", "M 80 78 L 62 60",
];

export default function CamaraPresion({ onCompletar }) {
  const [modo, setModo] = useState(null);          // null = eligiendo modo
  const [orden, setOrden] = useState([]);
  /*
   * Las burbujas del modo fácil también se barajan. Antes salían siempre en el
   * orden del catálogo, así que se podía acertar por posición sin leer nada.
   */
  const [burbujas, setBurbujas] = useState([]);
  const ordenPrevio = useRef(null);
  const [i, setI] = useState(0);
  const [transcurrido, setTranscurrido] = useState(0);
  const [respuesta, setRespuesta] = useState("");
  const [fallo, setFallo] = useState(null);        // {termino} al agotarse o errar
  const [acertadas, setAcertadas] = useState([]);
  const [sellando, setSellando] = useState(false);
  const inicio = useRef(Date.now());
  const campo = useRef(null);

  /*
   * ═══════════ EL DETALLE POR ÍTEM ═══════════
   *
   * LA UNIDAD ES EL TÉRMINO. Se enseña una definición y se pide su nombre, así
   * que el ítem es el nivel del iceberg por el que se está preguntando.
   *
   * EL ID ES EL PROPIO TÉRMINO —"Evento", "Patrón", "Estructura", "Modelo
   * mental"— porque DEFINICIONES no tiene campo id: la cadena ES el
   * identificador, y es con la que compara el propio componente.
   *
   * SIN PREFIJO POR MODO, y es correcto: el modo fácil y el experto se
   * registran como actividades DISTINTAS —camara-presion y
   * camara-presion-experto— así que sus filas ya viven separadas por
   * activity_id y no pueden mezclarse.
   *
   * `respuesta` es lo que contestó: en fácil, la burbuja que tocó; en experto,
   * lo que escribió. Y null cuando se le acabó el aire sin contestar, que es
   * dato distinto de equivocarse.
   */
  const detalle = useRef([]);

  const jugando = modo !== null && i < orden.length && !fallo;
  const actual = orden[i];
  const presion = Math.min(1, transcurrido / (SEGUNDOS * 1000));

  /* El reloj de presión. Se para al acertar, al fallar y al terminar. */
  useEffect(() => {
    if (!jugando) return;
    const t = setInterval(() => setTranscurrido((v) => v + TICK_MS), TICK_MS);
    return () => clearInterval(t);
  }, [jugando, i]);

  /* Se acabó el aire: cuenta como fallo y se revela la respuesta. */
  useEffect(() => {
    if (jugando && presion >= 1) resolver(null);
  }, [presion, jugando]);

  useEffect(() => {
    if (modo === "dificil" && jugando) campo.current?.focus();
  }, [modo, i, jugando]);

  const empezar = (m) => {
    setModo(m);
    const nuevo = barajarDistinto(DEFINICIONES, ordenPrevio.current, (d) => d.termino);
    ordenPrevio.current = nuevo;
    setOrden(nuevo);
    setBurbujas(barajarDistinto(DEFINICIONES, null, (d) => d.termino));
    setI(0);
    setTranscurrido(0);
    setAcertadas([]);
    setRespuesta("");
    setFallo(null);
    detalle.current = [];
    inicio.current = Date.now();
  };

  const resolver = (dado) => {
    const bien = dado != null && normalizar(dado) === normalizar(actual.termino);

    /*
     * Un intento por término: fallar revela la respuesta y se pasa al
     * siguiente, así que `intentos` es siempre 1.
     */
    detalle.current.push({
      item: actual.termino,
      ok: bien,
      intentos: 1,
      respuesta: dado == null ? null : String(dado).slice(0, 120),
      orden: detalle.current.length + 1,
    });

    if (bien) {
      setAcertadas((a) => [...a, actual.termino]);
      setSellando(true);
      setTimeout(() => setSellando(false), 620);
      avanzar();
    } else {
      /* Se revela la respuesta antes de seguir: fallar sin saber qué era no enseña. */
      setFallo({ termino: actual.termino, dado });
    }
  };

  const avanzar = () => {
    setRespuesta("");
    setTranscurrido(0);
    setFallo(null);
    setI((n) => n + 1);
  };

  /* Al terminar, los puntos se convierten en porcentaje sobre el máximo del modo. */
  const terminado = modo !== null && i >= orden.length;
  useEffect(() => {
    if (!terminado) return;
    const porAcierto = modo === "dificil" ? 2 : 1;
    const maximo = DEFINICIONES.length * porAcierto;
    const pct = Math.round((acertadas.length * porAcierto * 100) / maximo);
    onCompletar?.(pct, Date.now() - inicio.current, modo, detalle.current);
  }, [terminado]);

  /* ------------------------------ elegir modo ------------------------------ */
  if (modo === null) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
        <style>{CSS}</style>
        {[
          { id: "facil", t: "Modo fácil", d: "Cuatro burbujas con los nombres. Escoges el correcto.", p: "1 punto por acierto", dif: "Dificultad media" },
          { id: "dificil", t: "Modo experto", d: "Sin opciones: escribes el término de memoria.", p: "2 puntos por acierto", dif: "Dificultad difícil" },
        ].map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => empezar(m.id)}
            style={{
              textAlign: "left", cursor: "pointer", padding: "18px",
              borderRadius: "18px", background: "rgba(248,249,250,0.04)",
              border: `1px solid ${m.id === "dificil" ? FAE.coral : "rgba(248,249,250,0.16)"}`,
              color: FAE.text,
            }}
          >
            <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "17px", margin: "0 0 6px" }}>{m.t}</p>
            <p style={{ fontSize: "13.5px", lineHeight: 1.55, color: "rgba(248,249,250,0.62)", margin: "0 0 10px" }}>{m.d}</p>
            <p style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, color: m.id === "dificil" ? FAE.coral : FAE.teal, margin: 0 }}>
              {m.p} · {m.dif}
            </p>
          </button>
        ))}
      </div>
    );
  }

  /* -------------------------------- resumen -------------------------------- */
  if (terminado) {
    const porAcierto = modo === "dificil" ? 2 : 1;
    const puntos = acertadas.length * porAcierto;
    const maximo = DEFINICIONES.length * porAcierto;
    return (
      <div style={{ borderRadius: "18px", background: "rgba(42,157,143,0.07)", border: `1px solid ${FAE.teal}`, padding: "clamp(18px, 2.6vw, 26px)" }}>
        <p style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.teal, margin: "0 0 8px" }}>
          CÁMARA ESTABILIZADA
        </p>
        <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(28px, 5vw, 40px)", margin: "0 0 4px", color: FAE.text, fontVariantNumeric: "tabular-nums" }}>
          {puntos} / {maximo}
        </p>
        <p style={{ fontSize: "13.5px", color: "rgba(248,249,250,0.55)", margin: "0 0 18px" }}>
          {acertadas.length} de {DEFINICIONES.length} términos, en {modo === "dificil" ? "modo experto" : "modo fácil"}.
        </p>
        <button
          type="button"
          onClick={() => setModo(null)}
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600,
            padding: "9px 15px", borderRadius: "999px", cursor: "pointer",
            background: "transparent", border: "1px solid rgba(248,249,250,0.22)", color: "rgba(248,249,250,0.7)",
          }}
        >
          <RotateCcw size={14} />
          Otra inmersión
        </button>
      </div>
    );
  }

  /* -------------------------------- la cámara -------------------------------- */
  const visibles = Math.floor(presion * GRIETAS.length);

  return (
    <div>
      <style>{CSS}</style>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", alignItems: "start" }}>

        {/* --- el ojo de buey --- */}
        <div className={sellando ? "fae-cp-empuje" : undefined}
          style={{ borderRadius: "18px", background: "#0A1422", border: "1px solid rgba(248,249,250,0.14)", padding: "16px" }}>
          <svg viewBox="0 0 100 100" width="100%" style={{ display: "block", maxWidth: "320px", margin: "0 auto" }} aria-hidden="true">
            <defs>
              <radialGradient id="cp-agua" cx="50%" cy="42%" r="60%">
                <stop offset="0%" stopColor="#1F3A5C" />
                <stop offset="100%" stopColor="#0A1422" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="46" fill="url(#cp-agua)" stroke="rgba(248,249,250,0.28)" strokeWidth="2.5" />
            <circle cx="50" cy="50" r="41" fill="none" stroke="rgba(248,249,250,0.12)" strokeWidth="1" />

            {/* Las grietas avanzan con la presión. */}
            {GRIETAS.slice(0, visibles).map((d, k) => (
              <path key={k} d={d} fill="none" stroke={FAE.coral} strokeWidth="0.9" opacity="0.75" strokeLinecap="round" />
            ))}

            {/* Sello teal al acertar. */}
            {sellando && <circle className="fae-cp-sello" cx="50" cy="50" r="44" fill={FAE.teal} />}
          </svg>

          {/* Manómetro. */}
          <div style={{ marginTop: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", color: "rgba(248,249,250,0.45)", marginBottom: "5px" }}>
              <span>Presión</span>
              <span>{i + 1} de {orden.length}</span>
            </div>
            <div style={{ height: "6px", borderRadius: "999px", background: "rgba(248,249,250,0.1)", overflow: "hidden" }}>
              <div style={{ width: `${presion * 100}%`, height: "100%", background: presion > 0.7 ? FAE.coral : FAE.teal, transition: "width 100ms linear" }} />
            </div>
          </div>
        </div>

        {/* --- la definición y la respuesta --- */}
        <div style={{ borderRadius: "18px", background: "rgba(248,249,250,0.04)", border: "1px solid rgba(248,249,250,0.12)", padding: "clamp(16px, 2.4vw, 22px)" }}>
          <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.teal, margin: "0 0 10px" }}>
            ¿QUÉ NIVEL ES ESTE?
          </p>
          <p style={{ fontSize: "16px", lineHeight: 1.6, color: FAE.text, margin: "0 0 18px" }}>
            {actual.definicion}
          </p>

          {fallo ? (
            <div style={{ borderRadius: "14px", background: "rgba(231,111,81,0.1)", border: `1px solid ${FAE.coral}`, padding: "14px" }}>
              <p style={{ fontSize: "13.5px", lineHeight: 1.55, color: "rgba(248,249,250,0.85)", margin: "0 0 12px" }}>
                Era <strong style={{ color: FAE.coral }}>{fallo.termino}</strong>.
                {fallo.dado ? ` Escribiste “${fallo.dado}”.` : " Se acabó el aire."}
              </p>
              <button type="button" onClick={avanzar}
                style={{ fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 600, padding: "9px 16px", borderRadius: "999px", border: "none", cursor: "pointer", backgroundColor: FAE.coral, color: FAE.bg }}>
                Seguir bajando
              </button>
            </div>
          ) : modo === "facil" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
              {burbujas.map((d) => (
                <button key={d.termino} type="button" onClick={() => resolver(d.termino)}
                  style={{
                    fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 600,
                    padding: "13px 12px", borderRadius: "999px", cursor: "pointer",
                    background: "rgba(42,157,143,0.1)", border: `1px solid ${FAE.teal}`, color: FAE.text,
                  }}>
                  {d.termino}
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); resolver(respuesta); }}>
              <input
                ref={campo}
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                placeholder="Escribe el término…"
                aria-label="Término del nivel"
                style={{
                  width: "100%", boxSizing: "border-box", padding: "13px 15px", borderRadius: "12px",
                  background: "rgba(14,27,46,0.7)", border: `1px solid ${FAE.coral}`,
                  color: FAE.text, fontFamily: "Inter, sans-serif", fontSize: "15px", marginBottom: "10px",
                }}
              />
              <button type="submit" disabled={!respuesta.trim()}
                style={{
                  fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 600,
                  padding: "10px 18px", borderRadius: "999px", border: "none",
                  cursor: respuesta.trim() ? "pointer" : "default",
                  backgroundColor: respuesta.trim() ? FAE.coral : "rgba(248,249,250,0.1)",
                  color: respuesta.trim() ? FAE.bg : "rgba(248,249,250,0.4)",
                }}>
                Responder
              </button>
              <p style={{ fontSize: "11.5px", color: "rgba(248,249,250,0.35)", margin: "10px 0 0" }}>
                No importan tildes ni mayúsculas.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
