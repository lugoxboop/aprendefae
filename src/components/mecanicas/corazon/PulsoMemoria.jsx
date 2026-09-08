import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { FAE } from "../../../theme.js";
import { COMPONENTES } from "../../../data/corazonDA.js";
import { CSS_CORAZON, Camaraseccion } from "./circulatorio.jsx";

/*
 * APRENDER 2 — "Pulso de memoria".
 *
 * Memorizar DA = C + I + G + XN por ritmo. La cámara late a compás constante y
 * en cada pulso sale un halo; el estudiante toca una letra justo cuando el
 * halo la cruza.
 *
 * ═══════════ ÍNTEGRAMENTE VISUAL. SIN NINGUNA DEPENDENCIA DE AUDIO ═══════════
 *
 * El movimiento ES el metrónomo. Esto se usa en un salón, con el teléfono en
 * silencio y sin auriculares, así que un compás que solo suene no existe para
 * la mitad de la clase. No hay una sola línea de audio en este archivo: no es
 * que esté desactivado, es que no está. Si algún día se añade, será un extra
 * encima del pulso visual, nunca su fuente.
 *
 * ═══════════ NO HAY ESTADO DE FALLO ═══════════
 *
 * Un toque a destiempo devuelve la letra a flotar, sin penalización, sin
 * marcador rojo y sin racha que se rompa. Esto es repetición encarnada, no
 * evaluación: castigarla la convertiría en un examen de reflejos, que no es lo
 * que se está enseñando.
 *
 * ═══════════ EL RELOJ ES UNA ANIMACIÓN CSS ═══════════
 *
 * El halo y el latido comparten la misma duración y arrancan juntos, así que
 * la ventana de acierto se calcula contra el reloj de la animación y no contra
 * un setInterval aparte. Si el navegador congela la pestaña, se congelan los
 * dos a la vez: el dibujo y la ventana no pueden discrepar.
 */

/* El compás. 1,6 s es la misma duración del latido y del halo en el CSS. */
const COMPAS_MS = 1600;
/*
 * La ventana de acierto, a cada lado del pulso. Generosa a propósito: esto
 * mide memoria, no reflejos, y una ventana estrecha convertiría en fallo lo
 * que solo es un dedo lento.
 */
const VENTANA_MS = 380;

export default function PulsoMemoria() {
  const [encajadas, setEncajadas] = useState([]);
  const [ultima, setUltima] = useState(null);      // { id, ok } del último toque
  const [rebota, setRebota] = useState(null);      // id que vuelve a flotar
  const halo = useRef(null);
  const inicio = useRef(performance.now());

  const pendientes = COMPONENTES.filter((c) => !encajadas.includes(c.id));
  const completo = pendientes.length === 0;

  /* El aviso del último toque se apaga solo, sin dejar marcador. */
  useEffect(() => {
    if (!ultima) return;
    const t = setTimeout(() => setUltima(null), 1500);
    return () => clearTimeout(t);
  }, [ultima]);

  useEffect(() => {
    if (!rebota) return;
    const t = setTimeout(() => setRebota(null), 420);
    return () => clearTimeout(t);
  }, [rebota]);

  /*
   * ═══════════ LA FASE SE LEE DEL HALO, NO DE UN RELOJ APARTE ═══════════
   *
   * Antes se medía con performance.now() desde el montaje. Se desincroniza:
   * la animación arranca al pintar, no al montar, y sobre todo SE PAUSA cuando
   * la pestaña deja de estar visible mientras performance.now() sigue
   * corriendo. Un estudiante que bloquea el teléfono y vuelve encontraba un
   * halo que ya no tiene nada que ver con la ventana de acierto: todo llegaba
   * a destiempo sin que él hiciera nada distinto.
   *
   * getAnimations() devuelve la animación real del halo, con su propio reloj.
   * Es el mismo que dibuja, así que dibujo y ventana no pueden discrepar.
   */
  const faseDelHalo = () => {
    const anim = halo.current?.getAnimations?.()[0];
    if (anim && typeof anim.currentTime === "number") return anim.currentTime % COMPAS_MS;
    /* Respaldo: sin animación (movimiento reducido) o sin soporte. */
    return (performance.now() - inicio.current) % COMPAS_MS;
  };

  const tocar = (c) => {
    if (encajadas.includes(c.id)) return;
    /*
     * SIN PULSO NO HAY PUNTERÍA. Con "movimiento reducido" activado el halo no
     * se dibuja: exigir un toque a tiempo sería pedir puntería contra algo
     * invisible, y la pieza se volvería acertar a ciegas. Ahí cada toque entra.
     * No es una rebaja de dificultad —no hay puntaje que rebajar—: es que la
     * señal que había que seguir no está.
     */
    const sinMovimiento =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    /*
     * Cuánto falta para el pulso más cercano. El módulo del compás da la fase;
     * la distancia al pulso es el mínimo entre "lo que llevo" y "lo que falta".
     */
    const fase = faseDelHalo();
    const distancia = Math.min(fase, COMPAS_MS - fase);

    if (sinMovimiento || distancia <= VENTANA_MS) {
      setEncajadas((e) => [...e, c.id]);
      setUltima({ id: c.id, ok: true });
    } else {
      /* A destiempo: vuelve a flotar. Ni penalización ni marcador. */
      setRebota(c.id);
      setUltima({ id: c.id, ok: false });
    }
  };

  const reiniciar = () => {
    setEncajadas([]); setUltima(null); setRebota(null);
    inicio.current = performance.now();
  };

  const encajada = (id) => encajadas.includes(id);

  return (
    <Camaraseccion rotulo="EL COMPÁS" titulo="Cuatro letras, un solo pulso" acento={FAE.coral}>
      <style>{CSS_CORAZON}</style>
      <style>{`
        @keyframes fae-pm-rebote { 0%,100% { transform: translateY(0); } 30% { transform: translateY(-8px); } }
        .fae-pm-rebote { animation: fae-pm-rebote 400ms ease-out; }
        /* El aviso de abajo solo existe para quien no ve el halo. */
        .fae-pm-sinmov { display: none; }
        @media (prefers-reduced-motion: reduce) {
          .fae-pm-rebote { animation: none !important; }
          .fae-pm-sinmov { display: block; }
        }
      `}</style>

      <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(248,249,250,0.66)", margin: "0 0 4px" }}>
        La cámara late sola. Toca cada letra <strong style={{ color: FAE.text }}>justo cuando el halo la
        cruza</strong> y se queda dentro.
      </p>
      <p style={{ fontSize: "12.5px", lineHeight: 1.55, color: "rgba(248,249,250,0.45)", margin: "0 0 18px" }}>
        Funciona con el teléfono en silencio: el compás es el movimiento, no un sonido. Y no se pierde
        nada por llegar tarde — la letra vuelve a flotar y ya está.
      </p>
      <p
        className="fae-pm-sinmov"
        style={{ fontSize: "12.5px", lineHeight: 1.55, color: FAE.teal, margin: "0 0 18px" }}
      >
        Tienes activado el movimiento reducido, así que aquí no hay halo que seguir: cada letra entra al
        tocarla.
      </p>

      {/* ───────────────── la cámara con su halo ───────────────── */}
      <div style={{ position: "relative", display: "grid", placeItems: "center", padding: "26px 0 22px", minHeight: "180px" }}>
        {/* El halo: sale en cada pulso, con el mismo compás que el latido. */}
        <span
          ref={halo}
          aria-hidden="true"
          className="fae-cz-halo"
          style={{
            position: "absolute", width: "108px", height: "108px", borderRadius: "999px",
            border: `2px solid ${FAE.teal}`, pointerEvents: "none",
          }}
        />
        <div
          className="fae-cz-late"
          style={{
            width: "108px", height: "108px", borderRadius: "999px",
            background: "radial-gradient(circle at 50% 35%, rgba(42,157,143,0.34), rgba(10,20,34,0.72) 70%)",
            border: `1px solid ${FAE.teal}66`,
            display: "grid", placeItems: "center", position: "relative", zIndex: 1,
          }}
        >
          <span style={{ fontFamily: "Sora, sans-serif", fontSize: "15px", fontWeight: 700, letterSpacing: "0.1em", color: FAE.text }}>
            DA
          </span>
        </div>
      </div>

      {/* ───────────────── las letras que flotan ───────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(132px, 1fr))", gap: "10px" }}>
        {COMPONENTES.map((c) => {
          const dentro = encajada(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => tocar(c)}
              disabled={dentro}
              className={rebota === c.id ? "fae-pm-rebote" : undefined}
              aria-label={dentro ? `${c.id}: ${c.nombre}, ya encajada` : `Tocar ${c.id} en el pulso`}
              style={{
                padding: "13px 12px", borderRadius: "14px", cursor: dentro ? "default" : "pointer",
                textAlign: "left",
                background: dentro ? `${c.color}1f` : "rgba(248,249,250,0.04)",
                border: `1px solid ${dentro ? c.color : "rgba(248,249,250,0.14)"}`,
                color: FAE.text, fontFamily: "Inter, sans-serif",
                transition: "background 220ms ease, border-color 220ms ease",
              }}
            >
              <span style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontFamily: "Sora, sans-serif", fontSize: "20px", fontWeight: 700, color: dentro ? c.color : FAE.text }}>
                  {c.id}
                </span>
                {dentro && (
                  <span style={{ fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 600, color: c.color }}>
                    {c.nombre}
                  </span>
                )}
              </span>
              {/* El significado se enciende al encajar: es la recompensa. */}
              {dentro && (
                <span style={{ display: "block", marginTop: "5px", fontSize: "11.5px", lineHeight: 1.45, color: "rgba(248,249,250,0.6)" }}>
                  {c.glosa}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* El aviso del último toque. Nunca en coral de alarma cuando falla. */}
      <div style={{ minHeight: "26px", marginTop: "12px" }} aria-live="polite">
        {ultima && (
          <p style={{ margin: 0, fontSize: "12.5px", color: ultima.ok ? FAE.teal : "rgba(248,249,250,0.5)" }}>
            {ultima.ok
              ? `${ultima.id} encajó en el pulso.`
              : `${ultima.id} llegó a destiempo — sigue flotando, prueba otra vez.`}
          </p>
        )}
      </div>

      {completo && (
        <div
          className="fae-cz-entrar"
          style={{
            marginTop: "8px", padding: "14px 16px", borderRadius: "14px",
            background: "rgba(42,157,143,0.09)", border: `1px solid ${FAE.teal}55`,
          }}
        >
          <p style={{ margin: "0 0 6px", fontFamily: "Sora, sans-serif", fontSize: "15px", fontWeight: 700, color: FAE.teal }}>
            DA = C + I + G + XN
          </p>
          <p style={{ margin: 0, fontSize: "12.5px", lineHeight: 1.55, color: "rgba(248,249,250,0.62)" }}>
            Las cuatro dentro. Repítelo cuantas veces quieras: aquí no hay puntaje ni marca de tiempo.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={reiniciar}
        style={{
          marginTop: "12px", display: "inline-flex", alignItems: "center", gap: "8px",
          fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 600,
          padding: "8px 14px", borderRadius: "999px", cursor: "pointer",
          background: "transparent", border: "1px solid rgba(248,249,250,0.22)", color: "rgba(248,249,250,0.7)",
        }}
      >
        <RotateCcw size={13} /> Sacarlas y volver a empezar
      </button>
    </Camaraseccion>
  );
}
