import { useEffect, useRef, useState } from "react";
import { RotateCcw, ChevronRight, TriangleAlert } from "lucide-react";
import { FAE } from "../../theme.js";
import {
  OBJETIVO_CRISIS, AVISO_CRISIS, CASOS_CRISIS, RANURAS_CRISIS, NOMBRES_RANURA,
} from "../../data/juegosPolitica2.js";
import { barajar } from "../../utils/barajar.js";

/*
 * ACTIVIDAD 7 — "El simulador de crisis".
 *
 * Juego evaluativo, el más duro del tema. Se da el Problema y nada más: hay que
 * construir las otras cinco casillas de la cadena desde un banco de doce piezas
 * donde siete sobran.
 *
 * QUÉ LO SEPARA DE "ARMA EL GRUPO LÓGICO". Allí las seis casillas se llenan con
 * una cadena que existe y hay que reconocerla. Aquí el problema es nuevo, la
 * cadena no se ha visto nunca, y los señuelos son piezas correctas de OTROS
 * casos. No se reconoce: se construye.
 *
 * ─────────────── LA MISMA PIEZA CAMBIA DE BANDO ───────────────
 *
 * "Política monetaria" es SEÑUELO en la sequía y la ESTRATEGIA CORRECTA en la
 * corrida bancaria. No es un descuido del banco: es la lección. Una rama de
 * política no es buena ni mala en abstracto — encaja o no según cuál sea el
 * problema. Por eso cada caso lleva sus piezas con id propio y nada se comparte
 * entre los dos: la misma frase puede ser acierto aquí y error allá sin que un
 * caso contamine al otro.
 *
 * ─────────────── LAS CIFRAS SON INVENTADAS, Y SE DICE ───────────────
 *
 * Ni la sequía ni los ciberataques ocurrieron: los dos casos están construidos
 * para el ejercicio. Es la única de las siete actividades del tema cuyas cifras
 * no salen del material del profesor, así que lo declara en pantalla antes de
 * que el estudiante toque nada.
 *
 * ─────────────── PUNTUACIÓN ───────────────
 *
 *   pct = 20 × piezas bien colocadas − 5 × intentos con señuelo, suelo en 0
 *
 * Se cuentan los INTENTOS con señuelo, no los que quedan puestos: un señuelo
 * nunca se queda —rebota al banco— así que contar "los que quedan" daría
 * siempre cero y el castigo no existiría nunca.
 */

const POR_PIEZA = 20;
const CASTIGO_SENUELO = 5;

const CSS = `
@keyframes fae-sc-encaje { 0% { opacity: 0; transform: scale(.93); } 60% { opacity: 1; } 100% { opacity: 1; transform: scale(1); } }
.fae-sc-encaje { animation: fae-sc-encaje 420ms cubic-bezier(.3,.9,.4,1) both; }
@keyframes fae-sc-rechazo { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
.fae-sc-rechazo { animation: fae-sc-rechazo 400ms ease-in-out; }
@keyframes fae-sc-entrar { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.fae-sc-entrar { animation: fae-sc-entrar 400ms ease-out both; }
@keyframes fae-sc-alerta { 0%,100% { opacity: .45; } 50% { opacity: 1; } }
.fae-sc-alerta { animation: fae-sc-alerta 2.4s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .fae-sc-encaje, .fae-sc-rechazo, .fae-sc-entrar, .fae-sc-alerta { animation: none !important; }
}
`;

export default function SimuladorDeCrisis({ onCompletar }) {
  const [empezado, setEmpezado] = useState(false);
  const [caso, setCaso] = useState(() => CASOS_CRISIS[Math.floor(Math.random() * CASOS_CRISIS.length)]);
  const [banco, setBanco] = useState(() => barajar(caso.piezas));
  const [puestas, setPuestas] = useState({});      // ranura -> pieza
  const [elegida, setElegida] = useState(null);
  const [rechazada, setRechazada] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [senuelosSoltados, setSenuelosSoltados] = useState(0);
  const inicio = useRef(Date.now());

  /*
   * ═══════════ EL DETALLE POR ÍTEM ═══════════
   *
   * LA UNIDAD ES LA RANURA, igual que en "Arma el grupo lógico": el juego es
   * llenar cinco huecos, y de cada uno interesa si lo acertó a la primera,
   * cuánto le costó y QUÉ puso mal antes.
   *
   * EL ID LLEVA EL CASO DELANTE. Las piezas ya vienen prefijadas (sq-* y cb-*)
   * pero las cinco ranuras se llaman igual en los dos casos, y la Estrategia de
   * la sequía —política comercial— es exactamente la respuesta CONTRARIA a la
   * de la corrida bancaria —política monetaria—. Sin prefijo, el panel juntaría
   * en una sola fila dos preguntas cuya respuesta correcta se contradice, que
   * es la peor forma posible de este fallo.
   *
   * `respuesta` guarda la PRIMERA pieza equivocada que soltó en esa ranura. En
   * esta actividad es el dato más caro del tema: "en la sequía pusieron
   * política monetaria en Estrategia" es exactamente la confusión que el juego
   * existe para provocar, porque esa misma pieza es la correcta en el otro
   * caso. Los señuelos se distinguen solos: sus ids llevan `-d`.
   */
  const detalle = useRef([]);
  const intentosRanura = useRef({});
  const primerFallo = useRef({});

  const usadas = new Set(Object.values(puestas).map((p) => p.id));
  const disponibles = banco.filter((p) => !usadas.has(p.id));
  const colocadas = Object.keys(puestas).length;
  const completa = colocadas === RANURAS_CRISIS.length;

  const pct = Math.max(0, Math.min(100, POR_PIEZA * colocadas - CASTIGO_SENUELO * senuelosSoltados));

  useEffect(() => {
    if (completa) onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [completa]);

  const soltar = (ranura) => {
    if (completa || !elegida || puestas[ranura]) return;
    const pieza = caso.piezas.find((p) => p.id === elegida);
    setAviso({ ok: !pieza.senuelo && pieza.ranura === ranura, texto: pieza.feedback, pieza: pieza.texto });

    const intentos = (intentosRanura.current[ranura] ?? 0) + 1;
    intentosRanura.current[ranura] = intentos;

    if (!pieza.senuelo && pieza.ranura === ranura) {
      /* La ranura queda cerrada: se registra con todo lo que costó llenarla. */
      detalle.current.push({
        item: `${caso.id}:${ranura}`,
        ok: intentos === 1,
        intentos,
        respuesta: primerFallo.current[ranura] ?? null,
        orden: detalle.current.length + 1,
      });
      setPuestas((s) => ({ ...s, [ranura]: pieza }));
      setElegida(null);
      return;
    }

    /* Falla: vuelve al banco. Los señuelos además cuestan. */
    if (!primerFallo.current[ranura]) primerFallo.current[ranura] = pieza.id;
    if (pieza.senuelo) setSenuelosSoltados((n) => n + 1);
    setRechazada(pieza.id);
    setTimeout(() => setRechazada(null), 420);
    setElegida(null);
  };

  const reiniciar = () => {
    /* Se alterna de caso: quien resolvió la sequía recibe la corrida bancaria. */
    const otro = CASOS_CRISIS.find((c) => c.id !== caso.id) ?? caso;
    setCaso(otro);
    setBanco(barajar(otro.piezas));
    setPuestas({}); setElegida(null); setAviso(null); setSenuelosSoltados(0);
    detalle.current = [];
    intentosRanura.current = {};
    primerFallo.current = {};
    inicio.current = Date.now();
    setEmpezado(true);
  };

  /* ───────────────────────── portada ───────────────────────── */
  if (!empezado) {
    return (
      <div>
        <style>{CSS}</style>
        <div style={{ borderRadius: "18px", background: "rgba(248,249,250,0.04)", border: "1px solid rgba(248,249,250,0.14)", padding: "clamp(16px, 2.6vw, 24px)" }}>
          {/*
            El aviso va ANTES del objetivo, no al pie: las cifras de los dos
            casos son inventadas y el estudiante tiene que saberlo antes de
            leerlas, no después de habérselas creído.
          */}
          <p
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700,
              letterSpacing: "0.06em", color: FAE.ambar, margin: "0 0 14px",
              padding: "7px 12px", borderRadius: "999px",
              background: "rgba(233,196,106,0.10)", border: `1px solid ${FAE.ambar}55`,
            }}
          >
            <TriangleAlert size={13} /> {AVISO_CRISIS}
          </p>
          <p style={{ fontSize: "15px", lineHeight: 1.65, color: "rgba(248,249,250,0.8)", margin: "0 0 18px" }}>
            {OBJETIVO_CRISIS}
          </p>
          <button
            type="button"
            onClick={() => { inicio.current = Date.now(); setEmpezado(true); }}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "13px 22px", borderRadius: "14px", cursor: "pointer",
              background: FAE.teal, border: `1px solid ${FAE.teal}`, color: FAE.bg,
              fontFamily: "Sora, sans-serif", fontSize: "14.5px", fontWeight: 700,
            }}
          >
            Entrar a la crisis <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style>{CSS}</style>

      {/* El aviso sigue a la vista mientras se juega. */}
      <p style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.06em", color: FAE.ambar, margin: "0 0 12px" }}>
        <TriangleAlert size={12} className="fae-sc-alerta" /> {AVISO_CRISIS}
      </p>

      {/* ───────────────── el problema, dado y fijo ───────────────── */}
      <div style={{ borderRadius: "16px", background: "rgba(231,111,81,0.09)", border: `1px solid ${FAE.coral}55`, padding: "clamp(14px, 2.2vw, 18px)", marginBottom: "14px" }}>
        <p style={{ fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.14em", color: FAE.coral, margin: "0 0 6px" }}>
          PROBLEMA · TE LO DAN
        </p>
        <p style={{ fontSize: "clamp(15px, 2.3vw, 17px)", lineHeight: 1.55, color: FAE.text, margin: 0, fontWeight: 600 }}>
          {caso.problema}
        </p>
      </div>

      {/* ───────────────────────── las cinco ranuras ───────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
        {RANURAS_CRISIS.map((ranura, k) => {
          const puesta = puestas[ranura];
          return (
            <button
              key={ranura}
              type="button"
              onClick={() => soltar(ranura)}
              disabled={!!puesta || completa}
              className={puesta ? "fae-sc-encaje" : undefined}
              aria-label={puesta ? `${NOMBRES_RANURA[ranura]}: ${puesta.texto}` : `Ranura ${NOMBRES_RANURA[ranura]}, vacía`}
              style={{
                textAlign: "left", padding: "12px 14px", borderRadius: "13px",
                cursor: puesta || completa ? "default" : elegida ? "pointer" : "default",
                background: puesta ? "rgba(42,157,143,0.10)" : "rgba(248,249,250,0.03)",
                border: puesta
                  ? `1px solid ${FAE.teal}`
                  : `1px dashed ${elegida ? FAE.teal : "rgba(248,249,250,0.2)"}`,
                color: FAE.text, fontFamily: "Inter, sans-serif",
                display: "flex", gap: "11px", alignItems: "flex-start",
              }}
            >
              <span style={{
                flexShrink: 0, width: "22px", height: "22px", borderRadius: "999px",
                display: "grid", placeItems: "center", fontFamily: "Sora, sans-serif",
                fontSize: "11px", fontWeight: 700,
                background: puesta ? FAE.teal : "rgba(248,249,250,0.07)",
                color: puesta ? FAE.bg : "rgba(248,249,250,0.4)",
              }}>
                {k + 1}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.1em", color: puesta ? FAE.teal : "rgba(248,249,250,0.42)", marginBottom: "4px" }}>
                  {NOMBRES_RANURA[ranura].toUpperCase()}
                </span>
                <span style={{ display: "block", fontSize: "13px", lineHeight: 1.45, color: puesta ? "rgba(248,249,250,0.9)" : "rgba(248,249,250,0.28)" }}>
                  {puesta ? puesta.texto : "—"}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* El aviso de la jugada. */}
      <div style={{ minHeight: "44px", marginBottom: "12px" }} aria-live="polite">
        {aviso && (
          <p
            className="fae-sc-entrar"
            aria-label={aviso.ok ? "Correcto" : "Incorrecto"}
            style={{
              fontSize: "13.5px", lineHeight: 1.55, margin: 0,
              padding: "10px 13px", borderRadius: "12px",
              background: aviso.ok ? "rgba(42,157,143,0.10)" : "rgba(231,111,81,0.10)",
              border: `1px solid ${aviso.ok ? FAE.teal : FAE.coral}55`,
              color: "rgba(248,249,250,0.88)",
            }}
          >
            {aviso.texto}
          </p>
        )}
      </div>

      {/* ───────────────────────── el banco ───────────────────────── */}
      {!completa ? (
        <>
          <p style={{ fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.14em", color: FAE.teal, margin: "0 0 10px" }}>
            PIEZAS · {disponibles.length} SIN COLOCAR
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "8px" }}>
            {disponibles.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setElegida(elegida === p.id ? null : p.id)}
                aria-pressed={elegida === p.id}
                className={rechazada === p.id ? "fae-sc-rechazo" : undefined}
                style={{
                  textAlign: "left", cursor: "pointer", padding: "11px 13px", borderRadius: "12px",
                  background: elegida === p.id ? "rgba(42,157,143,0.14)" : "rgba(248,249,250,0.04)",
                  border: `1px solid ${rechazada === p.id ? FAE.coral : elegida === p.id ? FAE.teal : "rgba(248,249,250,0.14)"}`,
                  color: FAE.text, fontSize: "12.5px", lineHeight: 1.45, fontFamily: "Inter, sans-serif",
                }}
              >
                {p.texto}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="fae-sc-entrar">
          <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "28px", color: FAE.text, margin: "0 0 6px", fontVariantNumeric: "tabular-nums" }}>
            {pct}%
          </p>
          <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 14px" }}>
            Cadena completa, del problema a la meta.{" "}
            {senuelosSoltados === 0
              ? "Y sin colocar ni una pieza de otro caso: construiste la cadena entera sin tantear."
              : `Por el camino probaste ${senuelosSoltados} ${senuelosSoltados === 1 ? "pieza" : "piezas"} de otros casos, y eso descuenta.`}
          </p>
          <button
            type="button"
            onClick={reiniciar}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600, padding: "10px 16px", borderRadius: "999px", cursor: "pointer", background: "transparent", border: "1px solid rgba(248,249,250,0.22)", color: "rgba(248,249,250,0.7)" }}
          >
            <RotateCcw size={14} /> Otra crisis
          </button>
        </div>
      )}
    </div>
  );
}
