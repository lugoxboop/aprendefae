import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import {
  PREGUNTA_DILUVIO, MOMENTOS, EXPLICACION_DILUVIO, VINETAS_CIERRE,
} from "../../../data/arca.js";
import { barajarDistinto } from "../../../utils/barajar.js";

/*
 * Etapa 4 — "La carrera contra el diluvio", y el cierre de la pieza entera.
 *
 * LA PREGUNTA es la más barata de responder y la más cara de entender: en qué
 * momento habría bastado el cambio más pequeño. El día 15 vale 100 porque ahí
 * sobraba con una frase distinta; cada día posterior vale menos porque para
 * llegar a la misma creencia hay que desmontar más estructura encima. No es un
 * acierto o fallo: es una escala, y esa escala ES el argumento.
 *
 * ═════════════════ EL CIERRE ═════════════════
 *
 * Cuatro actos encadenados, en este orden:
 *
 *   1. repaso      Los días del caso pasan en ráfaga: 15, 40, 80, 100, 125.
 *   2. inundacion  El agua sube hasta tapar la escena.
 *   3. mensaje     "Prórroga denegada. Ya comenzó a llover."
 *   4. arca        El Arca de Noé cruza bajo la lluvia. El esqueleto del barco
 *                  de Absalón se queda atrás, escorado, en el astillero.
 *
 * SIN NARRACIÓN EN EL ACTO 4. La imagen es el argumento: un barco simple que
 * flota y otro enorme que nunca se terminó. Ponerle una moraleja encima sería
 * explicar un chiste.
 *
 * LOS ACTOS LOS MUEVE setTimeout, NO LA ANIMACIÓN. Si el encadenado dependiera
 * de animationend, una pestaña que no pinta dejaría la secuencia colgada a la
 * mitad. Las animaciones CSS son solo el dibujo de cada acto.
 *
 * SE PUEDE SALTAR. Dura unos nueve segundos y esto se muestra en clase: quien
 * lo esté proyectando tiene que poder llegar al final cuando quiera.
 */

const ACTOS = [
  { id: "repaso", ms: 4200 },
  { id: "inundacion", ms: 2400 },
  { id: "mensaje", ms: 2600 },
  { id: "arca", ms: null },   // se queda
];

const CSS = `
@keyframes fae-dl-brote { from { opacity: 0; transform: translateY(9px); } to { opacity: 1; transform: none; } }
.fae-dl-brote { animation: fae-dl-brote 440ms ease-out both; }

/* Acto 1: cada viñeta entra, se queda un instante y se va. */
@keyframes fae-dl-vineta {
  0%   { opacity: 0; transform: scale(.9) translateY(14px); }
  18%  { opacity: 1; transform: scale(1) translateY(0); }
  76%  { opacity: 1; transform: scale(1) translateY(0); }
  100% { opacity: 0; transform: scale(1.06) translateY(-10px); }
}
.fae-dl-vineta { animation: fae-dl-vineta 800ms ease-out both; }

/* Acto 2: el agua sube hasta tapar. */
@keyframes fae-dl-subir { from { height: 12%; } to { height: 100%; } }
.fae-dl-subir { animation: fae-dl-subir 2400ms cubic-bezier(.45,0,.55,1) forwards; }

/* Acto 3 y 4. */
@keyframes fae-dl-mensaje { 0% { opacity: 0; letter-spacing: .28em; } 100% { opacity: 1; letter-spacing: .06em; } }
.fae-dl-mensaje { animation: fae-dl-mensaje 1500ms ease-out both; }

@keyframes fae-dl-navegar { from { transform: translateX(-34%); } to { transform: translateX(118%); } }
.fae-dl-navegar { animation: fae-dl-navegar 11s linear infinite; }
@keyframes fae-dl-mecer { 0%,100% { transform: rotate(-2.2deg); } 50% { transform: rotate(2.2deg); } }
.fae-dl-mecer { animation: fae-dl-mecer 3.4s ease-in-out infinite; }
@keyframes fae-dl-hundir { 0% { transform: translateY(0) rotate(-9deg); } 100% { transform: translateY(16px) rotate(-15deg); } }
.fae-dl-hundir { animation: fae-dl-hundir 9s ease-in forwards; }

@keyframes fae-dl-lluvia { from { background-position: 0 0; } to { background-position: -140px 460px; } }
.fae-dl-lluvia { animation: fae-dl-lluvia 900ms linear infinite; }
@keyframes fae-dl-ola { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.fae-dl-ola { animation: fae-dl-ola 6s linear infinite; }

@media (prefers-reduced-motion: reduce) {
  .fae-dl-brote, .fae-dl-vineta, .fae-dl-mensaje { animation: none !important; opacity: 1 !important; transform: none !important; }
  .fae-dl-subir { animation: none !important; height: 100% !important; }
  .fae-dl-navegar, .fae-dl-mecer, .fae-dl-hundir, .fae-dl-lluvia, .fae-dl-ola { animation: none !important; }
}
`;

/* ---------------------------------------------------------------- el dibujo */

/* El Arca de Noé: casco, cabina, mástil. Sin un adorno de más, que es el chiste. */
function Arca({ ancho = 190 }) {
  return (
    <svg width={ancho} viewBox="0 0 190 120" aria-hidden="true" style={{ display: "block", overflow: "visible" }}>
      <path d="M14 74 L176 74 L156 108 L34 108 Z" fill="#2A9D8F" stroke="#CBDCF2" strokeWidth="2" strokeLinejoin="round" />
      <rect x="58" y="42" width="74" height="32" fill="#1D3557" stroke="#CBDCF2" strokeWidth="2" />
      <rect x="70" y="50" width="14" height="14" fill="#E9C46A" />
      <rect x="106" y="50" width="14" height="14" fill="#E9C46A" />
      <line x1="95" y1="42" x2="95" y2="8" stroke="#CBDCF2" strokeWidth="2.5" />
      <path d="M95 12 L134 26 L95 34 Z" fill="#E76F51" />
    </svg>
  );
}

/* El barco de Absalón: quilla y cuadernas. Nunca pasó de aquí. */
function Esqueleto({ ancho = 168 }) {
  return (
    <svg width={ancho} viewBox="0 0 168 110" aria-hidden="true" style={{ display: "block", overflow: "visible" }}>
      <path d="M10 62 L158 62 L140 96 L28 96 Z" fill="none" stroke="rgba(203,220,242,0.5)" strokeWidth="2.2" strokeLinejoin="round" strokeDasharray="7 6" />
      {[30, 52, 74, 96, 118, 140].map((x) => (
        <line key={x} x1={x} y1="20" x2={x} y2="94" stroke="rgba(203,220,242,0.42)" strokeWidth="2.6" strokeLinecap="round" />
      ))}
      <line x1="10" y1="62" x2="158" y2="62" stroke="rgba(203,220,242,0.46)" strokeWidth="2.6" />
      {/* La grúa parada del astillero. */}
      <line x1="150" y1="94" x2="150" y2="14" stroke="rgba(231,111,81,0.5)" strokeWidth="2.5" />
      <line x1="150" y1="18" x2="118" y2="30" stroke="rgba(231,111,81,0.5)" strokeWidth="2.5" />
    </svg>
  );
}

/* ------------------------------------------------------------- el componente */

export default function EtapaDiluvio({ onTerminar }) {
  const ordenPrevio = useRef(null);
  const [opciones] = useState(() => {
    const o = barajarDistinto(MOMENTOS, null, (m) => m.id);
    ordenPrevio.current = o;
    return o;
  });
  const [elegido, setElegido] = useState(null);
  const [acto, setActo] = useState(null);      // null = todavía preguntando
  const relojes = useRef([]);

  const momento = MOMENTOS.find((m) => m.id === elegido);

  /* Encadena los actos con relojes propios, no con el fin de las animaciones. */
  const lanzarCierre = () => {
    let acumulado = 0;
    ACTOS.forEach((a, i) => {
      if (i === 0) { setActo(a.id); return; }
      acumulado += ACTOS[i - 1].ms;
      relojes.current.push(setTimeout(() => setActo(a.id), acumulado));
    });
  };

  const saltar = () => {
    relojes.current.forEach(clearTimeout);
    relojes.current = [];
    setActo("arca");
  };

  useEffect(() => () => relojes.current.forEach(clearTimeout), []);

  const responder = (m) => {
    if (elegido) return;
    setElegido(m.id);
    /*
     * Una sola decisión, una sola fila: en qué momento del diluvio habría
     * habido que actuar. `ok` solo con el momento del 100%.
     */
    onTerminar?.(m.pct, [{
      item: "momento",
      ok: m.pct === 100,
      intentos: 1,
      respuesta: m.id,
      orden: 1,
    }]);
    lanzarCierre();
  };

  const enCierre = acto !== null;
  const aguaTapando = acto === "inundacion" || acto === "mensaje" || acto === "arca";

  return (
    <div>
      <style>{CSS}</style>

      {/* ---------------------------- la pregunta ---------------------------- */}
      <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(16px, 2.4vw, 20px)", lineHeight: 1.45, color: FAE.text, margin: "0 0 16px" }}>
        {PREGUNTA_DILUVIO}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "9px", marginBottom: "18px" }}>
        {opciones.map((m) => {
          const elegida = elegido === m.id;
          const color = m.pct === 100 ? FAE.teal : m.pct >= 60 ? FAE.ambar : FAE.coral;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => responder(m)}
              disabled={!!elegido}
              style={{
                textAlign: "left", padding: "13px 14px", borderRadius: "14px",
                cursor: elegido ? "default" : "pointer",
                background: elegido && elegida ? `${color}1f` : "rgba(248,249,250,0.04)",
                border: `1px solid ${elegido && elegida ? color : "rgba(248,249,250,0.14)"}`,
                color: elegido && !elegida ? "rgba(248,249,250,0.35)" : FAE.text,
                fontFamily: "Inter, sans-serif",
              }}
            >
              <span style={{ display: "block", fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700, marginBottom: "4px" }}>
                {m.etiqueta}
              </span>
              <span style={{ fontSize: "12.5px", lineHeight: 1.45, opacity: 0.8 }}>{m.detalle}</span>
              {elegido && (
                <span style={{ display: "block", marginTop: "7px", fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 700, color }}>
                  {m.pct}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ============================ EL CIERRE ============================ */}
      {enCierre && (
        <>
          <div
            style={{
              position: "relative", overflow: "hidden", borderRadius: "20px",
              border: "1px solid rgba(248,249,250,0.16)",
              background: "linear-gradient(to bottom, #0E1B2E 0%, #08111d 100%)",
              minHeight: "clamp(300px, 46vh, 430px)",
            }}
          >
            {/* --- Acto 1: los días pasan en ráfaga --- */}
            {acto === "repaso" && (
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: "24px" }}>
                {VINETAS_CIERRE.map((v, k) => (
                  <div
                    key={v.dia}
                    className="fae-dl-vineta"
                    style={{
                      gridArea: "1 / 1", textAlign: "center",
                      animationDelay: `${k * 800}ms`,
                    }}
                  >
                    <p style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.2em", color: FAE.ambar, margin: "0 0 10px" }}>
                      {v.dia.toUpperCase()}
                    </p>
                    <p style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(19px, 3.4vw, 30px)", fontWeight: 700, color: FAE.text, margin: 0, lineHeight: 1.25 }}>
                      {v.texto}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/*
              --- El astillero, al fondo ---
              VA POR ENCIMA DEL AGUA EN EL APILADO, no debajo. Debajo quedaba
              literalmente invisible: el degradado del agua es casi opaco en su
              mitad inferior y se lo tragaba entero. Puesto encima y a media
              opacidad se lee como lo que tiene que leerse: un casco a medio
              hacer, escorado y medio sumergido, mientras el otro barco pasa.
            */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute", left: "5%", bottom: "13%", zIndex: 2,
                opacity: acto === "repaso" ? 0 : acto === "arca" ? 0.68 : 0.9,
                transition: "opacity 1200ms ease",
              }}
            >
              <div className={acto === "arca" ? "fae-dl-hundir" : undefined} style={{ transform: "rotate(-9deg)" }}>
                <Esqueleto ancho={150} />
              </div>
            </div>

            {/* --- Acto 2: el agua sube y tapa --- */}
            {aguaTapando && (
              <div
                aria-hidden="true"
                className="fae-dl-subir"
                style={{
                  position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 1,
                  background: "linear-gradient(to bottom, rgba(42,157,143,0.72) 0%, rgba(14,27,46,0.94) 62%)",
                  /* Si la animación no corre (motion reducido), queda tapando igual. */
                  height: "100%",
                }}
              >
                <div
                  className="fae-dl-ola"
                  style={{
                    position: "absolute", top: "-5px", left: 0, width: "200%", height: "10px",
                    background: `repeating-linear-gradient(to right, ${FAE.teal} 0 14px, transparent 14px 28px)`,
                    opacity: 0.65, borderRadius: "50%",
                  }}
                />
              </div>
            )}

            {/* --- Acto 4: el arca cruza, y la lluvia --- */}
            {acto === "arca" && (
              <>
                <div
                  aria-hidden="true"
                  className="fae-dl-lluvia"
                  style={{
                    position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.5, zIndex: 4,
                    backgroundImage:
                      "repeating-linear-gradient(107deg, rgba(203,220,242,0.4) 0 1px, transparent 1px 9px)",
                    backgroundSize: "140px 460px",
                  }}
                />
                {/* El arca, por delante del astillero: es la que sí flota. */}
                <div
                  className="fae-dl-navegar"
                  style={{ position: "absolute", left: 0, bottom: "11%", width: "100%", zIndex: 3 }}
                >
                  <div className="fae-dl-mecer" style={{ width: "190px" }}>
                    <Arca ancho={190} />
                  </div>
                </div>
              </>
            )}

            {/* --- Acto 3: el telegrama --- */}
            {(acto === "mensaje" || acto === "arca") && (
              <div
                style={{
                  position: "absolute", inset: 0, display: "flex",
                  alignItems: "flex-start", justifyContent: "center",
                  padding: "clamp(26px, 9%, 64px) 24px 0", pointerEvents: "none", zIndex: 5,
                }}
              >
                <p
                  className="fae-dl-mensaje"
                  style={{
                    fontFamily: "Sora, sans-serif", fontWeight: 700,
                    fontSize: "clamp(17px, 3vw, 26px)", textAlign: "center",
                    color: FAE.text, margin: 0, lineHeight: 1.4,
                    textShadow: "0 2px 20px rgba(8,17,29,0.9)",
                    opacity: acto === "arca" ? 0.55 : 1,
                    transition: "opacity 1200ms ease",
                  }}
                >
                  Prórroga denegada.
                  <br />
                  Ya comenzó a llover.
                </p>
              </div>
            )}

            {/* Saltar: esto se proyecta en clase. */}
            {acto !== "arca" && (
              <button
                type="button"
                onClick={saltar}
                style={{
                  position: "absolute", right: "12px", top: "12px", zIndex: 3,
                  fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 600,
                  padding: "6px 12px", borderRadius: "999px", cursor: "pointer",
                  background: "rgba(8,17,29,0.6)", border: "1px solid rgba(248,249,250,0.22)",
                  color: "rgba(248,249,250,0.75)",
                }}
              >
                Saltar
              </button>
            )}
          </div>

          {/* --------------------------- la explicación --------------------------- */}
          {acto === "arca" && (
            <div className="fae-dl-brote" style={{ marginTop: "16px" }}>
              <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "22px", color: FAE.text, margin: "0 0 8px", fontVariantNumeric: "tabular-nums" }}>
                {momento?.etiqueta} · {momento?.pct}%
              </p>
              <p style={{ fontSize: "14px", lineHeight: 1.65, color: "rgba(248,249,250,0.68)", margin: 0 }}>
                {EXPLICACION_DILUVIO}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
