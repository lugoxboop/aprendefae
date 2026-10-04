import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { FAE } from "../../theme.js";
import { CierreConResumen } from "../shared/PantallaResumen.jsx";
import { CASILLAS, CASOS_CADENA, sortearCaso, retroCadena } from "../../data/juegosPolitica.js";
import { barajar } from "../../utils/barajar.js";

/*
 * ACTIVIDAD 2 — "Arma el grupo lógico".
 *
 * Juego evaluativo. Seis casillas —Problema, Objetivo, Estrategia,
 * Instrumento, Medida, Meta— y doce enunciados reales del profesor: los seis
 * de una cadena y seis señuelos de OTRAS cadenas.
 *
 * LOS SEÑUELOS SON LO QUE HACE QUE HAYA QUE LEER. Todos son enunciados de
 * verdad y del mismo curso, así que ninguno se descarta por sonar raro. Por
 * posición no se distingue una meta de otra meta: hay que mirar de qué habla.
 *
 * DOS CASOS, SORTEADOS. El del acero y el de la inflación. Los señuelos de
 * cada uno vienen de otro racimo temático a propósito: si los del segundo
 * fueran las piezas buenas del primero, quien ya hubiera jugado resolvería por
 * memoria. Dos piezas —"Política monetaria" y "Tasa de interés"— sí aparecen
 * en los dos, y ahí está la lección: son señuelo en el caso del acero y las
 * respuestas correctas en el de la inflación. La misma pieza encaja o no según
 * el problema.
 *
 * SE TOCA, NO SE ARRASTRA — igual que en el resto del sitio, y por lo mismo:
 * el arrastre nativo no funciona con el dedo sin una librería encima. Se elige
 * el enunciado y luego su casilla.
 *
 * ─────────────── SOLO LA RONDA EVALUATIVA ───────────────
 *
 * La ficha describía además un modo libre sobre el banco completo de 43
 * enunciados del profesor. Ese banco no llegó —solo estos doce— y los treinta
 * y uno que faltan no se inventan. El modo libre se construirá cuando exista
 * el material.
 *
 * ─────────────── LA PUNTUACIÓN, NORMALIZADA ───────────────
 *
 * La ficha daba una puntuación en bruto —1 por casilla, −0,3 por señuelo— que
 * puede quedar negativa, y el motor de FP espera un porcentaje. Se normaliza:
 *
 *     bruto  = aciertos − 0,3 × (veces que se soltó un señuelo)
 *     pct    = min(100, max(0, bruto / 6 × 100))
 *
 * Se cuentan los INTENTOS con señuelo, no los señuelos que quedan puestos:
 * un señuelo nunca se queda en su casilla —rebota y vuelve al banco— así que
 * contar "los que quedan" daría siempre cero y el castigo no existiría.
 *
 * El suelo en 0 coincide con lo que hace el motor: registrarActividad ya
 * recorta el porcentaje a 0..100, y calcularFP vuelve a acotar la proporción
 * a 0..1. Mandar un negativo no rompería nada, pero enviar un número que el
 * motor va a tener que corregir es mentirle al historial.
 */

const CASTIGO_SENUELO = 0.3;

const CSS = `
@keyframes fae-gl-encaje { 0% { opacity: 0; transform: scale(.92); } 60% { opacity: 1; } 100% { opacity: 1; transform: scale(1); } }
.fae-gl-encaje { animation: fae-gl-encaje 420ms cubic-bezier(.3,.9,.4,1) both; }
@keyframes fae-gl-rechazo { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
.fae-gl-rechazo { animation: fae-gl-rechazo 400ms ease-in-out; }
@keyframes fae-gl-entrar { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.fae-gl-entrar { animation: fae-gl-entrar 400ms ease-out both; }
@keyframes fae-gl-brillo { 0%,100% { box-shadow: 0 0 0 0 rgba(42,157,143,0); } 50% { box-shadow: 0 0 0 8px rgba(42,157,143,0.28); } }
.fae-gl-completa { animation: fae-gl-brillo 1.8s ease-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .fae-gl-encaje, .fae-gl-rechazo, .fae-gl-entrar, .fae-gl-completa { animation: none !important; }
}
`;

export default function ArmaGrupoLogico({ onCompletar }) {
  const [caso, setCaso] = useState(() => sortearCaso());
  const [banco, setBanco] = useState(() => barajar(caso.enunciados));
  const [puestos, setPuestos] = useState({});     // casillaId -> enunciado
  const [elegido, setElegido] = useState(null);
  const [rechazado, setRechazado] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [senuelosSoltados, setSenuelosSoltados] = useState(0);
  const inicio = useRef(Date.now());

  /*
   * ═══════════ EL DETALLE POR ÍTEM ═══════════
   *
   * LA UNIDAD ES LA CASILLA, no el enunciado. El juego es llenar seis huecos:
   * lo que hay que saber de cada uno es si lo acertó a la primera, cuántas
   * veces lo intentó y —lo que vale— QUÉ puso mal antes de acertar.
   *
   * EL ID LLEVA EL CASO DELANTE. Las seis casillas se llaman igual en los dos
   * casos, pero la Meta del acero y la Meta de la inflación son preguntas
   * distintas con respuestas distintas. Sin el prefijo se sumarían en la misma
   * fila —el mismo choque que `bonos` en "¿Quién gana, quién pierde?"— y el
   * panel promediaría dos cosas que no se pueden promediar. Los enunciados sí
   * vienen ya prefijados (a-* e i-*), así que ahí no hace falta tocar nada.
   *
   * `respuesta` guarda el PRIMER enunciado equivocado que soltó en esa casilla,
   * que es su instinto real antes de ir descartando. Los señuelos se
   * distinguen solos: sus ids llevan `-s`.
   */
  const detalle = useRef([]);
  const intentosCasilla = useRef({});
  const primerFallo = useRef({});

  const usados = new Set(Object.values(puestos).map((e) => e.id));
  const disponibles = banco.filter((e) => !usados.has(e.id));
  const aciertos = Object.keys(puestos).length;
  const completa = aciertos === CASILLAS.length;

  const bruto = aciertos - CASTIGO_SENUELO * senuelosSoltados;
  const pct = Math.round(Math.min(100, Math.max(0, (bruto / CASILLAS.length) * 100)));

  useEffect(() => {
    if (completa) onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [completa]);

  const soltar = (casillaId) => {
    if (completa) return;
    if (!elegido) return;
    if (puestos[casillaId]) return;

    const enunciado = caso.enunciados.find((e) => e.id === elegido);
    const r = retroCadena(enunciado, casillaId, caso.tema);
    setAviso(r);

    const intentos = (intentosCasilla.current[casillaId] ?? 0) + 1;
    intentosCasilla.current[casillaId] = intentos;

    if (r.ok) {
      /* La casilla queda cerrada: se registra con todo lo que costó llenarla. */
      detalle.current.push({
        item: `${caso.id}:${casillaId}`,
        ok: intentos === 1,
        intentos,
        respuesta: primerFallo.current[casillaId] ?? null,
        orden: detalle.current.length + 1,
      });
      setPuestos((p) => ({ ...p, [casillaId]: enunciado }));
      setElegido(null);
      return;
    }

    /* Falla: el naipe vuelve al banco. Los señuelos además cuestan. */
    if (!primerFallo.current[casillaId]) primerFallo.current[casillaId] = enunciado.id;
    if (r.senuelo) setSenuelosSoltados((n) => n + 1);
    setRechazado(enunciado.id);
    setTimeout(() => setRechazado(null), 420);
    setElegido(null);
  };

  /*
   * Al repetir se alterna de caso: quien acaba de armar la cadena del acero
   * recibe la de la inflación, no la misma otra vez.
   */
  const reiniciar = () => {
    const otro = CASOS_CADENA.find((c) => c.id !== caso.id) ?? caso;
    setCaso(otro);
    setBanco(barajar(otro.enunciados));
    setPuestos({}); setElegido(null); setAviso(null); setSenuelosSoltados(0);
    detalle.current = [];
    intentosCasilla.current = {};
    primerFallo.current = {};
    inicio.current = Date.now();
  };

  return (
    <div>
      <style>{CSS}</style>

      <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.teal, margin: "0 0 6px" }}>
        CASO · {caso.titulo.toUpperCase()}
      </p>
      <p style={{ fontSize: "14px", lineHeight: 1.6, color: "rgba(248,249,250,0.7)", margin: "0 0 16px" }}>
        Doce enunciados, todos reales y todos del curso: seis arman una sola cadena y seis son de otras.
        Toca un enunciado y luego la casilla donde crees que va.
      </p>

      {/* ───────────────────────── la cadena ───────────────────────── */}
      <div
        className={completa ? "fae-gl-completa" : undefined}
        style={{
          borderRadius: "18px", padding: "clamp(14px, 2.2vw, 20px)", marginBottom: "14px",
          background: "rgba(248,249,250,0.03)",
          border: `1px solid ${completa ? FAE.teal : "rgba(248,249,250,0.1)"}`,
          transition: "border-color 500ms ease",
        }}
      >
        {/*
          El hilo de corriente, reutilizando el lenguaje de cadena que ya usa
          "Desempleo: la cadena en vivo": línea discontinua teal que fluye.
          La clase y sus keyframes viven en styles/home.css.
        */}
        <svg width="100%" height="4" aria-hidden="true" style={{ display: "block", marginBottom: "10px", overflow: "visible" }}>
          <line x1="0%" y1="2" x2="100%" y2="2" stroke="rgba(248,249,250,0.14)" strokeWidth="3" strokeLinecap="round" />
          {aciertos > 0 && (
            <line
              className="cadena-corriente"
              x1="0%" y1="2" x2={`${(aciertos / CASILLAS.length) * 100}%`} y2="2"
              stroke={FAE.teal} strokeWidth="3" strokeLinecap="round" strokeDasharray="7 9"
            />
          )}
        </svg>

        {/*
          Seis casillas en fila en escritorio; en móvil se apilan. Seis zonas de
          suelte en una fila de 375 px serían de 55 px cada una: ilegibles y
          casi imposibles de acertar con el pulgar.
        */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "8px" }}>
          {CASILLAS.map((c) => {
            const puesto = puestos[c.id];
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => soltar(c.id)}
                disabled={!!puesto || completa}
                aria-label={puesto ? `${c.nombre}: ${puesto.texto}` : `Casilla ${c.nombre}, vacía`}
                className={puesto ? "fae-gl-encaje" : undefined}
                style={{
                  textAlign: "left", padding: "11px 12px", borderRadius: "13px", minHeight: "104px",
                  cursor: puesto || completa ? "default" : elegido ? "pointer" : "default",
                  background: puesto ? "rgba(42,157,143,0.10)" : "rgba(248,249,250,0.03)",
                  border: puesto
                    ? `1px solid ${FAE.teal}`
                    : `1px dashed ${elegido ? c.acento : "rgba(248,249,250,0.2)"}`,
                  color: FAE.text, fontFamily: "Inter, sans-serif",
                  display: "flex", flexDirection: "column", gap: "7px",
                }}
              >
                {/* El acento pastel identifica la casilla; el nombre va siempre escrito. */}
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span aria-hidden="true" style={{ width: "8px", height: "8px", borderRadius: "2px", background: c.acento, flexShrink: 0 }} />
                  <span style={{ fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.1em", color: puesto ? FAE.teal : c.acento }}>
                    {c.nombre.toUpperCase()}
                  </span>
                </span>
                <span style={{ fontSize: "12.5px", lineHeight: 1.4, color: puesto ? "rgba(248,249,250,0.9)" : "rgba(248,249,250,0.28)" }}>
                  {puesto ? puesto.texto : "—"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* El aviso de la jugada. */}
      <div style={{ minHeight: "44px", marginBottom: "12px" }} aria-live="polite">
        {aviso && (
          <p
            className="fae-gl-entrar"
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
          <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.teal, margin: "0 0 10px" }}>
            ENUNCIADOS · {disponibles.length} SIN COLOCAR
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "8px" }}>
            {disponibles.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => setElegido(elegido === e.id ? null : e.id)}
                aria-pressed={elegido === e.id}
                className={rechazado === e.id ? "fae-gl-rechazo" : undefined}
                style={{
                  textAlign: "left", cursor: "pointer", padding: "11px 13px", borderRadius: "12px",
                  background: elegido === e.id ? "rgba(42,157,143,0.14)" : "rgba(248,249,250,0.04)",
                  border: `1px solid ${rechazado === e.id ? FAE.coral : elegido === e.id ? FAE.teal : "rgba(248,249,250,0.14)"}`,
                  color: FAE.text, fontSize: "13px", lineHeight: 1.45, fontFamily: "Inter, sans-serif",
                }}
              >
                {e.texto}
              </button>
            ))}
          </div>
        </>
      ) : (
        <CierreConResumen
          onReiniciar={reiniciar}
          texto={
            <p style={{ margin: 0 }}>
              La cadena está completa: del problema a la meta, todo del mismo caso.{" "}
              {senuelosSoltados > 0
                ? `Por el camino soltaste ${senuelosSoltados} ${senuelosSoltados === 1 ? "enunciado" : "enunciados"} de otra cadena, y eso descuenta.`
                : "Y sin colocar ni un enunciado de otra cadena."}
            </p>
          }
        >
        <div className="fae-gl-entrar">
          <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "26px", color: FAE.text, margin: "0 0 6px", fontVariantNumeric: "tabular-nums" }}>
            {pct}%
          </p>
          <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 14px" }}>
            La cadena está completa: del problema a la meta, todo del mismo caso.{" "}
            {senuelosSoltados > 0
              ? `Por el camino soltaste ${senuelosSoltados} ${senuelosSoltados === 1 ? "enunciado" : "enunciados"} de otra cadena, y eso descuenta.`
              : "Y sin colocar ni un enunciado de otra cadena."}
          </p>
          <button
            type="button"
            onClick={reiniciar}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600,
              padding: "10px 16px", borderRadius: "999px", cursor: "pointer",
              background: "transparent", border: "1px solid rgba(248,249,250,0.22)",
              color: "rgba(248,249,250,0.7)",
            }}
          >
            <RotateCcw size={14} /> Otra cadena
          </button>
        </div>
        </CierreConResumen>
      )}
    </div>
  );
}
