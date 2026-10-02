import { useEffect, useRef, useState } from "react";
import { RotateCcw, ChevronRight, Radio } from "lucide-react";
import { FAE } from "../../theme.js";
import { CierreConResumen, useResumenOcupaElCierre } from "../shared/PantallaResumen.jsx";
import {
  OBJETIVO_EXPLICA, RANURAS_EXPLICA, ESCENARIOS_EXPLICA,
} from "../../data/juegosPolitica2.js";
import { barajar } from "../../utils/barajar.js";

/*
 * ACTIVIDAD 6 — "Explica la política".
 *
 * Juego evaluativo. Un escenario real y ocho fragmentos: hay que armar con
 * cuatro de ellos una explicación que entienda alguien sin formación en
 * economía.
 *
 * QUÉ MIDE, QUE NO ES SI ENTENDIÓ. Todas las demás piezas del tema preguntan
 * si el estudiante sabe. Esta pregunta si sabe DECIRLO. Es el efecto protégé:
 * explicar obliga a reorganizar lo que uno cree saber, y deja al descubierto
 * las partes que solo se sostenían con la palabra técnica.
 *
 * ─────────────── DOS CLASES DE FRAGMENTO MALO ───────────────
 *
 *   jerga       es VERDAD, pero el vecino no la entiende.
 *   incorrecto  es FALSO.
 *
 * Cuestan lo mismo —media pieza cada uno— pero el mensaje dice cuál de los dos
 * errores fue, y por eso viajan como tipos distintos hasta el final. Meterlos
 * en un solo saco de "malo" borraría la lección: decir algo cierto que nadie
 * entiende no es el mismo fallo que decir algo falso.
 *
 * ─────────────── LA ESTÁTICA ES EL MARCADOR ───────────────
 *
 * Al transmitir, cada fragmento pasa como un pulso: limpio y teal si es claro,
 * roto y coral si es jerga o falso. El estudiante VE dónde se ensució el
 * mensaje antes de leer un solo número, y en el orden en que lo dijo.
 *
 * ─────────────── PUNTUACIÓN ───────────────
 *
 *   bruto = claros en la transmisión − 0,5 × (jerga + falsos en la transmisión)
 *   pct   = min(100, max(0, bruto / 4 × 100))
 *
 * Cuenta lo que QUEDA en la transmisión, no lo que se cogió y se devolvió al
 * banco: aquí sí se puede sacar una pieza antes de transmitir, así que castigar
 * el manoseo castigaría pensar.
 */

const CASTIGO_RUIDO = 0.5;

const CSS = `
@keyframes fae-ep-entrar { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.fae-ep-entrar { animation: fae-ep-entrar 400ms ease-out both; }
@keyframes fae-ep-pulso {
  0%   { transform: scaleY(.25); opacity: .4; }
  50%  { transform: scaleY(1); opacity: 1; }
  100% { transform: scaleY(.25); opacity: .4; }
}
.fae-ep-onda span { display: block; width: 4px; border-radius: 999px; transform-origin: center; }
.fae-ep-onda.viva span { animation: fae-ep-pulso 900ms ease-in-out infinite; }
@keyframes fae-ep-estatica {
  0%, 100% { transform: translateY(0) scaleY(1); opacity: .55; }
  20%      { transform: translateY(-3px) scaleY(1.5); opacity: 1; }
  40%      { transform: translateY(2px) scaleY(.6); opacity: .7; }
  70%      { transform: translateY(-2px) scaleY(1.3); opacity: .9; }
}
.fae-ep-onda.rota span { animation: fae-ep-estatica 320ms linear infinite; }
@keyframes fae-ep-rechazo { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-7px); } 75% { transform: translateX(7px); } }
.fae-ep-rechazo { animation: fae-ep-rechazo 380ms ease-in-out; }
@media (prefers-reduced-motion: reduce) {
  .fae-ep-entrar, .fae-ep-rechazo { animation: none !important; }
  .fae-ep-onda span { animation: none !important; transform: none !important; }
}
`;

/* Exportado con Onda: la previsualización del camino la usa tal cual, con sus animaciones. */
export const CSS_EXPLICA = CSS;

/* Una onda de sonido: limpia si el fragmento es claro, rota si es ruido. */
export function Onda({ limpia, animada }) {
  const alturas = limpia ? [10, 18, 26, 18, 10] : [22, 8, 28, 6, 24];
  const color = limpia ? FAE.teal : FAE.coral;
  return (
    <span
      aria-hidden="true"
      className={`fae-ep-onda ${animada ? (limpia ? "viva" : "rota") : ""}`}
      style={{ display: "inline-flex", alignItems: "center", gap: "3px", height: "28px", flexShrink: 0 }}
    >
      {alturas.map((h, k) => (
        <span key={k} style={{ height: `${h}px`, background: color, animationDelay: `${k * 90}ms` }} />
      ))}
    </span>
  );
}

export default function ExplicaLaPolitica({ onCompletar }) {
  /* Con la pantalla de resumen, su «Repetir» sustituye a «Otro caso». */
  const resumenOcupaElCierre = useResumenOcupaElCierre();
  const [empezado, setEmpezado] = useState(false);
  const [escenario, setEscenario] = useState(() => ESCENARIOS_EXPLICA[Math.floor(Math.random() * ESCENARIOS_EXPLICA.length)]);
  const [banco, setBanco] = useState(() => barajar(escenario.fragmentos));
  const [puestos, setPuestos] = useState([]);      // ids, en el orden de la transmisión
  const [transmitido, setTransmitido] = useState(false);
  const inicio = useRef(Date.now());

  const lleno = puestos.length === RANURAS_EXPLICA;
  const trozo = (id) => escenario.fragmentos.find((f) => f.id === id);

  const claros = puestos.filter((id) => trozo(id).tipo === "correcto").length;
  const ruido = puestos.length - claros;
  const bruto = claros - CASTIGO_RUIDO * ruido;
  const pct = Math.round(Math.min(100, Math.max(0, (bruto / RANURAS_EXPLICA) * 100)));

  /*
   * ═══════════ EL DETALLE POR ÍTEM ═══════════
   *
   * LA UNIDAD ES EL FRAGMENTO QUE ELIGIÓ, y solo esos cuatro. Aquí no hay
   * ranuras con respuesta correcta —cualquier combinación de cuatro claros
   * vale— así que el ítem no puede ser la posición: lo que dice algo es QUÉ
   * metió en la transmisión.
   *
   * LOS IDS YA SON ÚNICOS ENTRE ESCENARIOS: ta1..ta8 y ar1..ar8. No hace falta
   * prefijo, a diferencia de las dos actividades anteriores, donde las rondas y
   * las casillas sí repetían nombre. Comprobado en detalle-ids.test.mjs para
   * que añadir un escenario tercero con ids reusados no pase inadvertido.
   *
   * `respuesta` guarda el TIPO del fragmento —correcto, jerga o incorrecto— y
   * ahí está el valor de esta actividad. Decir algo cierto que el vecino no
   * entiende no es el mismo fallo que decir algo falso, y el panel puede
   * separarlos sin tener que conocer el catálogo del cliente.
   *
   * `intentos` es siempre 1 A PROPÓSITO. Aquí se puede sacar una pieza y
   * devolverla al banco antes de transmitir, y la puntuación ya decide no
   * castigar ese manoseo porque castigaría pensar. Contar las idas y venidas
   * como "intentos" contradiría esa regla y además haría incomparable el campo
   * con el de las otras actividades, donde sí significa "veces que lo intentó
   * antes de acertar".
   *
   * `orden` es la posición en la transmisión: el orden en que lo contó.
   */
  useEffect(() => {
    if (!transmitido) return;
    const items = puestos.map((id, k) => ({
      item: id,
      ok: trozo(id).tipo === "correcto",
      intentos: 1,
      respuesta: trozo(id).tipo,
      orden: k + 1,
    }));
    onCompletar?.(pct, Date.now() - inicio.current, items);
  }, [transmitido]);

  const alternar = (id) => {
    if (transmitido) return;
    setPuestos((p) => {
      if (p.includes(id)) return p.filter((x) => x !== id);
      if (p.length >= RANURAS_EXPLICA) return p;
      return [...p, id];
    });
  };

  const reiniciar = () => {
    /* Se alterna de escenario: quien acaba de explicar la tasa recibe los aranceles. */
    const otro = ESCENARIOS_EXPLICA.find((e) => e.id !== escenario.id) ?? escenario;
    setEscenario(otro);
    setBanco(barajar(otro.fragmentos));
    setPuestos([]); setTransmitido(false);
    inicio.current = Date.now();
    setEmpezado(true);
  };

  const colorDe = (tipo) => (tipo === "correcto" ? FAE.teal : FAE.coral);
  const etiquetaDe = (tipo) =>
    tipo === "correcto" ? "Claro" : tipo === "jerga" ? "Jerga" : "Falso";

  /* ───────────────────────── portada ───────────────────────── */
  if (!empezado) {
    return (
      <div>
        <style>{CSS}</style>
        <div style={{ borderRadius: "18px", background: "rgba(248,249,250,0.04)", border: "1px solid rgba(248,249,250,0.14)", padding: "clamp(16px, 2.6vw, 24px)" }}>
          <p style={{ fontSize: "15px", lineHeight: 1.65, color: "rgba(248,249,250,0.8)", margin: "0 0 18px" }}>
            {OBJETIVO_EXPLICA}
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
            Empezar <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style>{CSS}</style>

      {/* ───────────────────── el escenario, fijo arriba ───────────────────── */}
      <div style={{ borderRadius: "16px", background: `${FAE.navy}66`, border: "1px solid rgba(248,249,250,0.16)", padding: "clamp(14px, 2.2vw, 18px)", marginBottom: "14px" }}>
        <p style={{ fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.14em", color: FAE.teal, margin: "0 0 6px" }}>
          LO QUE TIENES QUE EXPLICAR
        </p>
        <p style={{ fontSize: "clamp(15px, 2.3vw, 17px)", lineHeight: 1.55, color: FAE.text, margin: 0, fontWeight: 600 }}>
          {escenario.enunciado}
        </p>
      </div>

      {/* ───────────────────────── la transmisión ───────────────────────── */}
      <div style={{ borderRadius: "16px", background: "rgba(248,249,250,0.03)", border: "1px solid rgba(248,249,250,0.12)", padding: "clamp(13px, 2vw, 18px)", marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <Radio size={15} color={FAE.teal} />
          <p style={{ fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.14em", color: FAE.teal, margin: 0 }}>
            TU TRANSMISIÓN · {puestos.length} DE {RANURAS_EXPLICA}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {Array.from({ length: RANURAS_EXPLICA }, (_, k) => {
            const id = puestos[k];
            const f = id ? trozo(id) : null;
            const color = f && transmitido ? colorDe(f.tipo) : null;
            return (
              <div
                key={k}
                style={{
                  display: "flex", gap: "11px", alignItems: "center",
                  padding: "11px 13px", borderRadius: "12px", minHeight: "22px",
                  background: f ? "rgba(248,249,250,0.035)" : "transparent",
                  border: `1px ${f ? "solid" : "dashed"} ${color ?? (f ? "rgba(248,249,250,0.16)" : "rgba(248,249,250,0.14)")}`,
                }}
              >
                <span style={{
                  flexShrink: 0, width: "21px", height: "21px", borderRadius: "999px",
                  display: "grid", placeItems: "center", fontFamily: "Sora, sans-serif",
                  fontSize: "11px", fontWeight: 700,
                  background: f ? FAE.teal : "rgba(248,249,250,0.07)",
                  color: f ? FAE.bg : "rgba(248,249,250,0.35)",
                }}>
                  {k + 1}
                </span>
                <span style={{ flex: 1, minWidth: 0, fontSize: "13px", lineHeight: 1.45, color: f ? FAE.text : "rgba(248,249,250,0.3)" }}>
                  {f ? f.texto : "—"}
                </span>
                {/* La onda solo aparece al transmitir: es el marcador visual. */}
                {f && transmitido && <Onda limpia={f.tipo === "correcto"} animada />}
              </div>
            );
          })}
        </div>

        {!transmitido ? (
          <button
            type="button"
            onClick={() => setTransmitido(true)}
            disabled={!lleno}
            style={{
              marginTop: "13px", width: "100%", padding: "13px", borderRadius: "14px",
              cursor: lleno ? "pointer" : "default",
              background: lleno ? FAE.teal : "rgba(248,249,250,0.05)",
              border: `1px solid ${lleno ? FAE.teal : "rgba(248,249,250,0.14)"}`,
              color: lleno ? FAE.bg : "rgba(248,249,250,0.35)",
              fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700,
            }}
          >
            {lleno ? "Transmitir" : `Faltan ${RANURAS_EXPLICA - puestos.length}`}
          </button>
        ) : (
          <CierreConResumen
            onReiniciar={reiniciar}
            texto={
              <p style={{ margin: 0 }}>
                {ruido === 0
                  ? "Cuatro frases claras, sin una sola de jerga ni una falsedad. Tu vecino lo entendió."
                  : `${claros} ${claros === 1 ? "frase clara" : "frases claras"} y ${ruido} de ruido. La estática marca dónde se ensució el mensaje.`}
              </p>
            }
          >
          <div className="fae-ep-entrar" style={{ marginTop: "14px" }}>
            <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "26px", color: FAE.text, margin: "0 0 4px", fontVariantNumeric: "tabular-nums" }}>
              {pct}%
            </p>
            <p style={{ fontSize: "13px", lineHeight: 1.55, color: "rgba(248,249,250,0.6)", margin: 0 }}>
              {ruido === 0
                ? "Cuatro frases claras, sin una sola de jerga ni una falsedad. Tu vecino lo entendió."
                : `${claros} ${claros === 1 ? "frase clara" : "frases claras"} y ${ruido} de ruido. La estática marca dónde se ensució el mensaje.`}
            </p>
          </div>
          </CierreConResumen>
        )}
      </div>

      {/* ─────────── el detalle, en el orden en que se dijo ─────────── */}
      {transmitido && (
        <div className="fae-ep-entrar" style={{ marginBottom: "16px" }}>
          <p style={{ fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.14em", color: "rgba(248,249,250,0.45)", margin: "0 0 10px" }}>
            FRASE POR FRASE
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
            {puestos.map((id, k) => {
              const f = trozo(id);
              const color = colorDe(f.tipo);
              return (
                <div key={id} style={{ paddingLeft: "12px", borderLeft: `2px solid ${color}` }}>
                  <p
                    aria-label={`Frase ${k + 1}: ${etiquetaDe(f.tipo)}`}
                    style={{ fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.08em", color, margin: "0 0 3px" }}
                  >
                    {k + 1} · {etiquetaDe(f.tipo).toUpperCase()}
                  </p>
                  <p style={{ fontSize: "12.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.7)", margin: 0 }}>
                    {f.feedback}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ───────────────────────── el banco ───────────────────────── */}
      {!transmitido ? (
        <>
          <p style={{ fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.14em", color: FAE.teal, margin: "0 0 10px" }}>
            LO QUE PODRÍAS DECIR
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {banco.map((f) => {
              const puesto = puestos.indexOf(f.id);
              const elegido = puesto >= 0;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => alternar(f.id)}
                  disabled={!elegido && lleno}
                  aria-pressed={elegido}
                  style={{
                    textAlign: "left", padding: "12px 13px", borderRadius: "12px",
                    cursor: !elegido && lleno ? "default" : "pointer",
                    background: elegido ? "rgba(42,157,143,0.12)" : "rgba(248,249,250,0.035)",
                    border: `1px solid ${elegido ? FAE.teal : "rgba(248,249,250,0.14)"}`,
                    color: !elegido && lleno ? "rgba(248,249,250,0.32)" : FAE.text,
                    fontSize: "13px", lineHeight: 1.45, fontFamily: "Inter, sans-serif",
                    display: "flex", gap: "10px", alignItems: "flex-start",
                  }}
                >
                  <span style={{
                    flexShrink: 0, width: "20px", height: "20px", borderRadius: "999px",
                    display: "grid", placeItems: "center", fontFamily: "Sora, sans-serif",
                    fontSize: "10.5px", fontWeight: 700,
                    background: elegido ? FAE.teal : "rgba(248,249,250,0.08)",
                    color: elegido ? FAE.bg : "rgba(248,249,250,0.4)",
                  }}>
                    {elegido ? puesto + 1 : "+"}
                  </span>
                  {f.texto}
                </button>
              );
            })}
          </div>
        </>
      ) : resumenOcupaElCierre ? null : (
        <button
          type="button"
          onClick={reiniciar}
          style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600, padding: "10px 16px", borderRadius: "999px", cursor: "pointer", background: "transparent", border: "1px solid rgba(248,249,250,0.22)", color: "rgba(248,249,250,0.7)" }}
        >
          <RotateCcw size={14} /> Otro caso
        </button>
      )}
    </div>
  );
}
