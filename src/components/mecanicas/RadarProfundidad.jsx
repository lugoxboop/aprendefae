import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { FAE } from "../../theme.js";
import { BLIPS_RADAR, ANILLOS } from "../../data/icebergActividades.js";
import { barajarDistinto } from "../../utils/barajar.js";

/*
 * "Radar de profundidad" — el peldaño Aplicar de Bloom.
 *
 * Ya no se pide la definición: se pide reconocer el nivel de frases sueltas de
 * un caso nuevo, con trampas entre niveles. Saber qué es un patrón y detectar
 * uno en mitad de un caso son dos cosas distintas, y esta es la segunda.
 *
 * SOLO PUNTÚAN LAS CUATRO FRASES DEL CASO. Las tres trampas son blips de más
 * que suenan a un nivel y pertenecen a otro; están para que encontrar las
 * buenas cueste, no para castigar. Ni suman ni restan.
 *
 * SE TOCA, NO SE ARRASTRA. Se elige un blip y luego su anillo. El arrastre
 * nativo del navegador no funciona en pantallas táctiles sin una librería
 * encima, y este tema se ve sobre todo en el teléfono.
 */

const VB = 340;
const C = VB / 2;
/* Cuatro anillos: Evento el de fuera, Modelo mental el centro. */
const RADIOS = [162, 124, 86, 46];

const CSS = `
@keyframes fae-rd-barrido { to { transform: rotate(360deg); } }
.fae-rd-barrido { transform-origin: 50% 50%; animation: fae-rd-barrido 4s linear infinite; }
@keyframes fae-rd-onda { from { r: 8; opacity: .8; } to { r: 90; opacity: 0; } }
.fae-rd-onda { animation: fae-rd-onda 900ms ease-out forwards; }
@keyframes fae-rd-rebote { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
.fae-rd-rebote { animation: fae-rd-rebote 380ms ease-in-out; }
@media (prefers-reduced-motion: reduce) { .fae-rd-barrido, .fae-rd-onda, .fae-rd-rebote { animation: none !important; } }
`;

export default function RadarProfundidad({ onCompletar }) {
  const [anclados, setAnclados] = useState({});     // id -> nivel
  const [elegido, setElegido] = useState(null);
  const [fallando, setFallando] = useState(null);
  const [primerIntento, setPrimerIntento] = useState({}); // id -> bool
  const [onda, setOnda] = useState(null);
  const inicio = useRef(Date.now());
  /*
   * CORRECCIÓN. Antes los blips salían siempre en el orden del catálogo —
   * evento, patrón, estructura, modelo mental— así que se podía acertar por
   * posición sin clasificar nada. Ahora se barajan en cada intento, y nunca dos
   * veces seguidas en el mismo orden.
   */
  const ordenPrevio = useRef(null);
  const [orden, setOrden] = useState(() => {
    const o = barajarDistinto(BLIPS_RADAR, null, (b) => b.id);
    ordenPrevio.current = o;
    return o;
  });

  const pendientes = orden.filter((b) => !anclados[b.id]);
  const completo = pendientes.length === 0;

  useEffect(() => {
    if (!completo) return;
    const buenos = BLIPS_RADAR.filter((b) => b.puntua && primerIntento[b.id]).length;
    const total = BLIPS_RADAR.filter((b) => b.puntua).length;
    onCompletar?.(Math.round((buenos * 100) / total), Date.now() - inicio.current);
  }, [completo]);

  const soltar = (nivel) => {
    if (!elegido) return;
    const blip = BLIPS_RADAR.find((b) => b.id === elegido);
    if (blip.nivel === nivel) {
      /* Solo cuenta como acierto si nunca antes se había fallado con este blip. */
      setPrimerIntento((p) => ({ ...p, [blip.id]: p[blip.id] !== false }));
      setAnclados((a) => ({ ...a, [blip.id]: nivel }));
      setOnda({ nivel, id: Date.now() });
      setTimeout(() => setOnda(null), 900);
      setElegido(null);
    } else {
      setPrimerIntento((p) => ({ ...p, [blip.id]: false }));
      setFallando(blip.id);
      setTimeout(() => setFallando(null), 400);
    }
  };

  const reiniciar = () => {
    setAnclados({}); setElegido(null); setPrimerIntento({}); setFallando(null);
    const o = barajarDistinto(BLIPS_RADAR, ordenPrevio.current, (b) => b.id);
    ordenPrevio.current = o;
    setOrden(o);
    inicio.current = Date.now();
  };

  const aciertos = BLIPS_RADAR.filter((b) => b.puntua && primerIntento[b.id]).length;

  return (
    <div>
      <style>{CSS}</style>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px", alignItems: "start" }}>

        {/* ----------------------------- el radar ----------------------------- */}
        <div style={{ borderRadius: "18px", background: "#0A1422", border: "1px solid rgba(248,249,250,0.14)", padding: "14px" }}>
          <svg viewBox={`0 0 ${VB} ${VB}`} width="100%" style={{ display: "block" }} aria-hidden="true">
            <defs>
              <linearGradient id="rd-barrido" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={FAE.teal} stopOpacity="0" />
                <stop offset="100%" stopColor={FAE.teal} stopOpacity="0.5" />
              </linearGradient>
            </defs>

            <circle cx={C} cy={C} r={RADIOS[0]} fill="rgba(42,157,143,0.05)" />

            {/* Anillos, de fuera hacia dentro. Cada uno es una zona de suelte. */}
            {ANILLOS.map((nivel, k) => (
              <g key={nivel} onClick={() => soltar(nivel)} style={{ cursor: elegido ? "pointer" : "default" }}>
                <circle
                  cx={C} cy={C} r={RADIOS[k]}
                  fill={elegido ? "rgba(42,157,143,0.06)" : "transparent"}
                  stroke={elegido ? FAE.teal : "rgba(42,157,143,0.35)"}
                  strokeWidth={elegido ? 1.6 : 1}
                  strokeDasharray={elegido ? "5 4" : undefined}
                />
                <text
                  x={C} y={C - RADIOS[k] + 15} textAnchor="middle"
                  fontFamily="Sora, sans-serif" fontSize="11" fontWeight="700"
                  fill={elegido ? FAE.teal : "rgba(42,157,143,0.6)"} letterSpacing="0.5"
                >
                  {nivel.toUpperCase()}
                </text>
              </g>
            ))}

            {/* Línea de barrido. */}
            <g className="fae-rd-barrido">
              <path d={`M ${C} ${C} L ${C + RADIOS[0]} ${C} A ${RADIOS[0]} ${RADIOS[0]} 0 0 0 ${C + RADIOS[0] * 0.85} ${C - RADIOS[0] * 0.5} Z`} fill="url(#rd-barrido)" />
            </g>

            {/* Blips ya anclados: se posan en su anillo. */}
            {BLIPS_RADAR.filter((b) => anclados[b.id]).map((b, k) => {
              const anillo = ANILLOS.indexOf(anclados[b.id]);
              const ang = (k / 7) * Math.PI * 2;
              const r = RADIOS[anillo] - 20;
              return (
                <circle key={b.id} cx={C + r * Math.cos(ang)} cy={C + r * Math.sin(ang)} r="6"
                  fill={b.puntua ? FAE.teal : "rgba(248,249,250,0.45)"} />
              );
            })}

            {onda && (
              <circle className="fae-rd-onda" cx={C} cy={C - RADIOS[ANILLOS.indexOf(onda.nivel)] + 20}
                fill="none" stroke={FAE.teal} strokeWidth="2" />
            )}
          </svg>

          <p style={{ fontSize: "12px", color: "rgba(248,249,250,0.45)", textAlign: "center", margin: "10px 0 0" }}>
            {elegido ? "Ahora toca el anillo donde va" : `${aciertos} de 4 del caso, a la primera`}
          </p>
        </div>

        {/* --------------------------- los fragmentos --------------------------- */}
        <div style={{ borderRadius: "18px", background: "rgba(248,249,250,0.04)", border: "1px solid rgba(248,249,250,0.12)", padding: "clamp(14px, 2.2vw, 20px)" }}>
          <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.teal, margin: "0 0 4px" }}>
            SEÑALES DETECTADAS
          </p>
          <p style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.45)", margin: "0 0 14px" }}>
            Un canal de reseñas de tecnología. Toca una señal y luego su anillo.
          </p>

          {completo ? (
            <div>
              <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "24px", color: FAE.text, margin: "0 0 4px", fontVariantNumeric: "tabular-nums" }}>
                {aciertos} de 4
              </p>
              <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(248,249,250,0.6)", margin: "0 0 14px" }}>
                Señales del caso ancladas bien a la primera. Las otras tres eran ruido: suenan a un nivel y son de otro.
              </p>
              {BLIPS_RADAR.filter((b) => !b.puntua).map((b) => (
                <p key={b.id} style={{ fontSize: "12.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.5)", margin: "0 0 8px", paddingLeft: "12px", borderLeft: `2px solid ${FAE.ambar}` }}>
                  {b.trampa}
                </p>
              ))}
              <button type="button" onClick={reiniciar}
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "8px", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600, padding: "9px 15px", borderRadius: "999px", cursor: "pointer", background: "transparent", border: "1px solid rgba(248,249,250,0.22)", color: "rgba(248,249,250,0.7)" }}>
                <RotateCcw size={14} /> Barrer otra vez
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {pendientes.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className={fallando === b.id ? "fae-rd-rebote" : undefined}
                  onClick={() => setElegido(elegido === b.id ? null : b.id)}
                  style={{
                    textAlign: "left", cursor: "pointer", padding: "11px 13px", borderRadius: "12px",
                    background: elegido === b.id ? "rgba(42,157,143,0.14)" : "rgba(248,249,250,0.04)",
                    border: `1px solid ${fallando === b.id ? FAE.coral : elegido === b.id ? FAE.teal : "rgba(248,249,250,0.14)"}`,
                    color: FAE.text, fontSize: "13.5px", lineHeight: 1.5, fontFamily: "Inter, sans-serif",
                  }}
                >
                  {b.texto}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
