import { useRef, useState } from "react";
import { RotateCcw, Lock } from "lucide-react";
import { FAE } from "../../theme.js";
import {
  CASO_TRIBUNAL, PISTAS_TRIBUNAL, HIPOTESIS_TRIBUNAL, ORDEN_TRIBUNAL, CRITERIOS_TRIBUNAL,
} from "../../data/icebergActividades.js";
import { barajarDistinto } from "../../utils/barajar.js";

/*
 * "Tribunal de profundidad" — el peldaño Evaluar de Bloom, el que faltaba.
 *
 * QUÉ LO SEPARA DE LAS OTRAS SIETE. En todas las demás hay una respuesta buena
 * y unos distractores que, mirados con calma, se ven flojos. Aquí las tres
 * hipótesis son razonables: ninguna es un disparate. Lo que se pide no es
 * separar lo correcto de lo incorrecto, sino ordenar tres explicaciones que
 * funcionan por cuánto explican. Eso es juzgar, y no se había pedido nunca.
 *
 * EL CRITERIO SE ELIGE, NO SE REGALA. Antes de ordenar hay que decir con qué
 * vara se mide. "La más simple" y "la que se puede comprobar" son criterios de
 * verdad en otros contextos —y por eso están—, pero la pregunta del iceberg es
 * cuál explica TODAS las pistas. Elegir la vara es la mitad de evaluar.
 *
 * PUNTUACIÓN, POR PARES.
 *
 *   Cada par de hipótesis en el orden correcto ...... 25
 *   El criterio correcto ............................ 25
 *                                                    ----
 *                                                     100
 *
 * Con tres hipótesis hay tres pares (h1-h3, h1-h2, h3-h2), así que ordenar vale
 * 75 y el criterio 25. Se cuenta por pares y no por posiciones exactas porque
 * confundir el segundo con el tercero no es lo mismo que poner el último
 * primero, y una puntuación de todo-o-nada no distinguiría los dos casos. Los
 * resultados posibles quedan en 0, 25, 50, 75 y 100, sin decimales que explicar.
 *
 * El criterio pesa 25 y no la mitad por lo mismo que la opción del expediente
 * bajó a 20: una sola decisión binaria no puede decidir media actividad.
 */

/* Cada par bien ordenado, y el criterio, valen lo mismo. */
const POR_PAR = 25;
const POR_CRITERIO = 25;

const CSS = `
@keyframes fae-tp-descorchar { from { opacity: 0; transform: translateY(10px) scale(.96); } to { opacity: 1; transform: none; } }
.fae-tp-descorchar { animation: fae-tp-descorchar 500ms cubic-bezier(.3,.9,.4,1) both; }
@keyframes fae-tp-haz { 0% { opacity: 0; transform: scaleY(.2); } 45% { opacity: .9; } 100% { opacity: .55; transform: scaleY(1); } }
.fae-tp-haz { transform-origin: 50% 0%; animation: fae-tp-haz 900ms ease-out both; }
@keyframes fae-tp-burbuja { from { transform: translateY(0); opacity: .5; } to { transform: translateY(-26px); opacity: 0; } }
.fae-tp-burbuja { animation: fae-tp-burbuja 2.4s ease-in infinite; }
@media (prefers-reduced-motion: reduce) {
  .fae-tp-descorchar, .fae-tp-haz, .fae-tp-burbuja { animation: none !important; opacity: 1 !important; transform: none !important; }
}
`;

/* Los tres pares que hay que ordenar bien, en el orden canónico. */
export const PARES = [];
for (let i = 0; i < ORDEN_TRIBUNAL.length; i++)
  for (let j = i + 1; j < ORDEN_TRIBUNAL.length; j++)
    PARES.push([ORDEN_TRIBUNAL[i], ORDEN_TRIBUNAL[j]]);

/*
 * La fórmula, en un solo sitio y exportada para poder medirla. Vivía inline en
 * el componente y así no había forma de comprobar que el 100 se alcanza de
 * verdad ni que el mínimo es 0 y no un negativo.
 */
export function puntuarTribunal(puestas, criterioId) {
  const paresBien = PARES.filter(([a, b]) => puestas.indexOf(a) < puestas.indexOf(b)).length;
  const criterioBien = CRITERIOS_TRIBUNAL.find((c) => c.id === criterioId)?.correcto === true;
  return {
    paresBien,
    criterioBien,
    pct: Math.min(100, paresBien * POR_PAR + (criterioBien ? POR_CRITERIO : 0)),
  };
}

export default function TribunalProfundidad({ onCompletar }) {
  const [abiertas, setAbiertas] = useState([]);      // índices de botella destapada
  const [criterio, setCriterio] = useState(null);
  const [puestas, setPuestas] = useState([]);        // ids en el orden del veredicto
  const [dictado, setDictado] = useState(false);
  const inicio = useRef(Date.now());

  /*
   * Las hipótesis se barajan. Si salieran en su orden canónico, el veredicto
   * estaría medio dado antes de leerlas.
   */
  const ordenPrevio = useRef(null);
  const [hipotesis, setHipotesis] = useState(() => {
    const o = barajarDistinto(HIPOTESIS_TRIBUNAL, null, (h) => h.id);
    ordenPrevio.current = o;
    return o;
  });

  const todasAbiertas = abiertas.length === PISTAS_TRIBUNAL.length;
  const listo = puestas.length === HIPOTESIS_TRIBUNAL.length && !!criterio;

  /* El marcador solo existe una vez dictado el veredicto. */
  const { paresBien, criterioBien, pct } = dictado
    ? puntuarTribunal(puestas, criterio)
    : { paresBien: 0, criterioBien: false, pct: 0 };

  const destapar = (i) => setAbiertas((a) => (a.includes(i) ? a : [...a, i]));

  const alternar = (id) =>
    setPuestas((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const dictar = () => {
    if (!listo || dictado) return;
    setDictado(true);
    onCompletar?.(puntuarTribunal(puestas, criterio).pct, Date.now() - inicio.current);
  };

  const reiniciar = () => {
    setAbiertas([]); setCriterio(null); setPuestas([]); setDictado(false);
    const o = barajarDistinto(HIPOTESIS_TRIBUNAL, ordenPrevio.current, (h) => h.id);
    ordenPrevio.current = o;
    setHipotesis(o);
    inicio.current = Date.now();
  };

  return (
    <div>
      <style>{CSS}</style>

      {/* ------------------------------ el caso ------------------------------ */}
      <div style={{ borderRadius: "18px", background: "#0A1422", border: "1px solid rgba(248,249,250,0.14)", padding: "clamp(14px, 2.2vw, 20px)", marginBottom: "14px" }}>
        <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.teal, margin: "0 0 8px" }}>
          EL CASO
        </p>
        <p style={{ fontSize: "14.5px", lineHeight: 1.6, color: FAE.text, margin: "0 0 18px" }}>
          {CASO_TRIBUNAL}
        </p>

        {/* Las cuatro botellas selladas, en el fondo. */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(122px, 1fr))", gap: "10px" }}>
          {PISTAS_TRIBUNAL.map((p, i) => {
            const abierta = abiertas.includes(i);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => destapar(i)}
                disabled={abierta}
                style={{
                  textAlign: "left", padding: "12px 13px", borderRadius: "14px",
                  cursor: abierta ? "default" : "pointer", minHeight: "96px",
                  background: abierta ? "rgba(42,157,143,0.10)" : "rgba(248,249,250,0.04)",
                  border: `1px ${abierta ? "solid" : "dashed"} ${abierta ? FAE.teal : "rgba(248,249,250,0.22)"}`,
                  color: FAE.text, fontFamily: "Inter, sans-serif",
                }}
              >
                {abierta ? (
                  <span className="fae-tp-descorchar" style={{ display: "block", fontSize: "13px", lineHeight: 1.5 }}>
                    {p.texto}
                  </span>
                ) : (
                  <span style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", height: "72px", color: "rgba(248,249,250,0.42)" }}>
                    {/* Una botella sellada, con su burbuja. */}
                    <svg width="22" height="40" viewBox="0 0 22 40" aria-hidden="true">
                      <circle className="fae-tp-burbuja" cx="16" cy="7" r="2" fill={FAE.teal} opacity="0.5" />
                      <path d="M8 3 h6 v7 l3 5 v22 a2 2 0 0 1 -2 2 h-8 a2 2 0 0 1 -2 -2 v-22 l3 -5 z"
                        fill="rgba(203,220,242,0.08)" stroke="rgba(203,220,242,0.34)" strokeWidth="1.2" />
                      <rect x="7.5" y="1" width="7" height="3.4" rx="1" fill="rgba(203,220,242,0.3)" />
                    </svg>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11.5px" }}>
                      <Lock size={11} /> Pista {i + 1}
                    </span>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <p style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.45)", margin: "12px 0 0" }}>
          {todasAbiertas
            ? "Las cuatro pistas están sobre la mesa."
            : `Destapa las botellas para leer lo que traen. Llevas ${abiertas.length} de ${PISTAS_TRIBUNAL.length}.`}
        </p>
      </div>

      {/* ------------------------------ el juicio ------------------------------ */}
      {todasAbiertas && (
        <div className="fae-tp-descorchar" style={{ borderRadius: "18px", background: "rgba(248,249,250,0.04)", border: "1px solid rgba(248,249,250,0.14)", padding: "clamp(16px, 2.4vw, 22px)" }}>

          {/* La vara de medir. */}
          <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.teal, margin: "0 0 4px" }}>
            PRIMERO, LA VARA
          </p>
          <p style={{ fontSize: "13.5px", lineHeight: 1.55, color: "rgba(248,249,250,0.6)", margin: "0 0 12px" }}>
            ¿Qué hace mejor a una explicación que a otra en un caso como este?
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "22px" }}>
            {CRITERIOS_TRIBUNAL.map((c) => {
              const puesto = criterio === c.id;
              const color = dictado ? (c.correcto ? FAE.teal : FAE.coral) : FAE.teal;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => !dictado && setCriterio(c.id)}
                  disabled={dictado}
                  style={{
                    padding: "9px 14px", borderRadius: "999px",
                    cursor: dictado ? "default" : "pointer",
                    background: puesto ? `${color}22` : "rgba(248,249,250,0.04)",
                    border: `1px solid ${puesto ? color : "rgba(248,249,250,0.16)"}`,
                    color: puesto ? FAE.text : "rgba(248,249,250,0.68)",
                    fontFamily: "Inter, sans-serif", fontSize: "13px",
                  }}
                >
                  {c.texto}
                </button>
              );
            })}
          </div>

          {/* El veredicto: ordenar tocando. */}
          <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.teal, margin: "0 0 4px" }}>
            AHORA, EL VEREDICTO
          </p>
          <p style={{ fontSize: "13.5px", lineHeight: 1.55, color: "rgba(248,249,250,0.6)", margin: "0 0 12px" }}>
            Tócalas en orden, de la que más explica a la que menos. Vuelve a tocar una para sacarla.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
            {hipotesis.map((h) => {
              const puesto = puestas.indexOf(h.id);
              const elegida = puesto >= 0;
              /* Con el veredicto dictado se ve el sitio que le tocaba a cada una. */
              const deberia = ORDEN_TRIBUNAL.indexOf(h.id);
              const bien = dictado && puesto === deberia;
              const borde = dictado ? (bien ? FAE.teal : FAE.ambar) : elegida ? FAE.teal : "rgba(248,249,250,0.14)";
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => !dictado && alternar(h.id)}
                  disabled={dictado}
                  style={{
                    textAlign: "left", padding: "13px 15px", borderRadius: "14px",
                    cursor: dictado ? "default" : "pointer", display: "flex", gap: "12px", alignItems: "flex-start",
                    background: elegida ? "rgba(42,157,143,0.10)" : "rgba(248,249,250,0.03)",
                    border: `1px solid ${borde}`, color: FAE.text,
                    fontFamily: "Inter, sans-serif", fontSize: "14px", lineHeight: 1.5,
                  }}
                >
                  <span style={{
                    flexShrink: 0, width: "24px", height: "24px", borderRadius: "999px",
                    display: "grid", placeItems: "center", fontFamily: "Sora, sans-serif",
                    fontSize: "12px", fontWeight: 700, fontVariantNumeric: "tabular-nums",
                    background: elegida ? FAE.teal : "rgba(248,249,250,0.08)",
                    color: elegida ? "#08111d" : "rgba(248,249,250,0.4)",
                  }}>
                    {elegida ? puesto + 1 : "·"}
                  </span>
                  <span>
                    {h.texto}
                    {dictado && (
                      <span className="fae-tp-descorchar" style={{ display: "block", marginTop: "8px", fontSize: "12.5px", color: "rgba(248,249,250,0.55)" }}>
                        Explica {h.explica.length} de {PISTAS_TRIBUNAL.length} pistas · su sitio era el {deberia + 1}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* El haz de luz: hasta dónde alumbra cada explicación. */}
          {dictado && (
            <div style={{ marginTop: "20px" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", height: "88px" }}>
                {ORDEN_TRIBUNAL.map((id, k) => {
                  const h = HIPOTESIS_TRIBUNAL.find((x) => x.id === id);
                  const alcance = h.explica.length / PISTAS_TRIBUNAL.length;
                  return (
                    <div key={id} style={{ flex: 1, textAlign: "center" }}>
                      <div
                        className="fae-tp-haz"
                        style={{
                          height: `${18 + alcance * 52}px`, borderRadius: "3px 3px 10px 10px",
                          background: `linear-gradient(to bottom, ${FAE.ambar}00, ${FAE.ambar}${alcance === 1 ? "88" : "44"})`,
                          borderTop: `2px solid ${FAE.ambar}`,
                          animationDelay: `${k * 130}ms`,
                        }}
                      />
                      <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, color: "rgba(248,249,250,0.5)", margin: "6px 0 0", fontVariantNumeric: "tabular-nums" }}>
                        {h.explica.length}/{PISTAS_TRIBUNAL.length}
                      </p>
                    </div>
                  );
                })}
              </div>
              <p style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.45)", textAlign: "center", margin: "8px 0 0" }}>
                Hasta dónde alumbra cada explicación, puestas en su orden correcto
              </p>
            </div>
          )}

          {/* Dictar, o el resultado. */}
          {!dictado ? (
            <button
              type="button"
              onClick={dictar}
              disabled={!listo}
              style={{
                marginTop: "20px", width: "100%", padding: "13px", borderRadius: "14px",
                cursor: listo ? "pointer" : "default",
                background: listo ? FAE.teal : "rgba(248,249,250,0.05)",
                border: `1px solid ${listo ? FAE.teal : "rgba(248,249,250,0.14)"}`,
                color: listo ? "#08111d" : "rgba(248,249,250,0.35)",
                fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700,
              }}
            >
              {listo ? "Dictar el veredicto" : criterio ? "Falta ordenar las tres" : "Falta elegir la vara"}
            </button>
          ) : (
            <div className="fae-tp-descorchar" style={{ marginTop: "20px" }}>
              <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "24px", color: FAE.text, margin: "0 0 6px", fontVariantNumeric: "tabular-nums" }}>
                {pct}%
              </p>
              <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 14px" }}>
                {paresBien} de {PARES.length} parejas en el orden bueno ({paresBien * POR_PAR} pts), y la vara{" "}
                {criterioBien ? `correcta (${POR_CRITERIO} pts). ` : "equivocada (0 pts). "}
                {criterioBien
                  ? "Gana la que explica todas las pistas: “la más simple” y “la que se puede comprobar” son buenas varas en otros sitios, no en este."
                  : "La vara era “explica todas las pistas”. Una explicación más simple, o más fácil de comprobar, puede dejar medio caso sin explicar."}
              </p>
              <button
                type="button"
                onClick={reiniciar}
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600, padding: "9px 15px", borderRadius: "999px", cursor: "pointer", background: "transparent", border: "1px solid rgba(248,249,250,0.22)", color: "rgba(248,249,250,0.7)" }}
              >
                <RotateCcw size={14} /> Reabrir el caso
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
