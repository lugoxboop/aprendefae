import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import { barajar } from "../../../utils/barajar.js";
import { FRASES_POR_EXPLICACION, puntuarExplicacion } from "../../../data/bloquesAvanzados.js";
import { Cierre, Enunciado } from "../corazon/juego.jsx";
import { TEXTO_CIERRE } from "./marcos.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EXPLÍCASELO — Difícil, efecto protégé. Lo comparten Demanda Agregada (a un
 * paciente nuevo) y Política Fiscal (a un contribuyente).
 *
 * Ocho frases; se eligen cuatro para explicarlo a alguien sin formación en
 * economía, en el orden en que se dirían. Dos clases de frase mala, y no son
 * el mismo fallo:
 *
 *   jerga       es verdad, pero quien escucha no la entiende
 *   incorrecto  es falso
 *
 *   bruto = claras − 0,5 × (jerga + falsas)
 *   pct   = clamp(bruto / 4, 0, 1) × 100, sin redondear por el camino
 *
 * Cuenta lo que queda en la explicación, no lo que se cogió y se devolvió:
 * castigar el manoseo castigaría pensar.
 *
 * Ítem = cada frase ELEGIDA, por su id; `respuesta` guarda su tipo, que es lo
 * que separa "habló en jerga" de "dijo algo falso" en el panel.
 *
 * La ficha no trae una devolución por frase, así que tras explicar se dice el
 * TIPO de cada una con una frase por tipo, no un texto inventado por frase.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ETIQUETA = { correcto: "Clara", jerga: "Jerga", incorrecto: "Falsa" };

export default function Explicale({ escenario, Marco, rotulo, titulo, acento, onCompletar }) {
  const [banco, setBanco] = useState(() => barajar(escenario.fragmentos));
  const [puestos, setPuestos] = useState([]);
  const [explicado, setExplicado] = useState(false);
  const avisado = useRef(false);
  const inicio = useRef(Date.now());

  const trozo = (id) => escenario.fragmentos.find((f) => f.id === id);
  const lleno = puestos.length === FRASES_POR_EXPLICACION;
  const claras = puestos.filter((id) => trozo(id).tipo === "correcto").length;
  const ruido = puestos.length - claras;
  const pct = puntuarExplicacion(claras, ruido);

  /*
   * [ESCRITO POR CLAUDE, NO POR LA FICHA — PENDIENTE DE REVISIÓN DE PEDAGOGÍA]
   * La ficha no trae devolución por frase. Estas tres, una por tipo, son mías.
   */
  const porTipo = {
    correcto: "se entiende sin saber economía, y es cierto.",
    jerga: `es cierto, pero ${escenario.destinatario} no lo entiende.`,
    incorrecto: "suena razonable, pero no es lo que pasa.",
  };

  useEffect(() => {
    if (!explicado || avisado.current) return;
    avisado.current = true;
    const filas = puestos.map((id, k) => ({ item: id, ok: trozo(id).tipo === "correcto", intentos: 1, respuesta: trozo(id).tipo, orden: k + 1 }));
    onCompletar?.(pct, Date.now() - inicio.current, filas);
  }, [explicado]);

  const alternar = (id) => {
    if (explicado) return;
    setPuestos((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= FRASES_POR_EXPLICACION ? p : [...p, id]));
  };

  const reiniciar = () => {
    setBanco(barajar(escenario.fragmentos));
    setPuestos([]); setExplicado(false);
    avisado.current = false;
    inicio.current = Date.now();
  };

  const faltantes = escenario.fragmentos.filter((f) => f.tipo === "correcto" && !puestos.includes(f.id));

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <Enunciado rotulo="LO QUE TIENES QUE EXPLICAR" acento={acento}>{escenario.enunciado}</Enunciado>

      {/* La explicación, en el orden en que se dice. */}
      <div style={{ margin: "14px 0", display: "flex", flexDirection: "column", gap: "7px" }}>
        {Array.from({ length: FRASES_POR_EXPLICACION }, (_, k) => {
          const f = puestos[k] ? trozo(puestos[k]) : null;
          const color = f && explicado ? (f.tipo === "correcto" ? FAE.teal : FAE.coral) : null;
          return (
            <div
              key={k}
              style={{
                display: "flex", gap: "10px", alignItems: "flex-start", padding: "10px 12px", borderRadius: "12px", minHeight: "20px",
                background: f ? "rgba(248,249,250,0.04)" : "transparent",
                border: `1px ${f ? "solid" : "dashed"} ${color ?? "rgba(248,249,250,0.16)"}`,
              }}
            >
              <span style={{ flexShrink: 0, width: "20px", height: "20px", borderRadius: "999px", display: "grid", placeItems: "center", fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, background: f ? FAE.teal : "rgba(248,249,250,0.07)", color: f ? FAE.bg : "rgba(248,249,250,0.4)" }}>
                {k + 1}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: "13px", lineHeight: 1.45, color: f ? FAE.text : "rgba(248,249,250,0.35)" }}>{f ? f.texto : "—"}</span>
                {f && explicado && (
                  <span style={{ display: "block", marginTop: "4px", fontSize: "12px", lineHeight: 1.45, color }}>
                    <strong style={{ fontFamily: "Sora, sans-serif" }}>{f.tipo === "correcto" ? "✓" : "✗"} {ETIQUETA[f.tipo]}:</strong> {porTipo[f.tipo]}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      {!explicado ? (
        <>
          <button
            type="button"
            onClick={() => lleno && setExplicado(true)}
            disabled={!lleno}
            style={{
              width: "100%", padding: "13px", borderRadius: "14px", cursor: lleno ? "pointer" : "default",
              background: lleno ? FAE.teal : "rgba(248,249,250,0.05)", border: `1px solid ${lleno ? FAE.teal : "rgba(248,249,250,0.14)"}`,
              color: lleno ? FAE.bg : "rgba(248,249,250,0.4)", fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700,
            }}
          >
            {lleno ? "Explicar" : `Elige ${FRASES_POR_EXPLICACION - puestos.length} más`}
          </button>
          <p style={{ fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.14em", color: acento, margin: "16px 0 9px" }}>
            LO QUE PODRÍAS DECIR
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
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
                    textAlign: "left", padding: "11px 13px", borderRadius: "12px", cursor: !elegido && lleno ? "default" : "pointer",
                    background: elegido ? "rgba(42,157,143,0.12)" : "rgba(248,249,250,0.035)",
                    border: `1px solid ${elegido ? FAE.teal : "rgba(248,249,250,0.14)"}`,
                    color: !elegido && lleno ? "rgba(248,249,250,0.38)" : FAE.text,
                    fontSize: "13px", lineHeight: 1.45, fontFamily: "Inter, sans-serif", display: "flex", gap: "10px", alignItems: "flex-start",
                  }}
                >
                  <span style={{ flexShrink: 0, width: "20px", height: "20px", borderRadius: "999px", display: "grid", placeItems: "center", fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, background: elegido ? FAE.teal : "rgba(248,249,250,0.08)", color: elegido ? FAE.bg : "rgba(248,249,250,0.45)" }}>
                    {elegido ? puesto + 1 : "+"}
                  </span>
                  {f.texto}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Explicarlo otra vez">
          <p style={TEXTO_CIERRE}>
            {ruido === 0
              ? "Cuatro frases claras, sin jerga ni falsedades: se entendió."
              : `${claras} ${claras === 1 ? "frase clara" : "frases claras"} y ${ruido} de ruido.`}
            {faltantes.length > 0 && ` Quedaron fuera ${faltantes.length === 1 ? "esta clara" : "estas claras"}: ${faltantes.map((f) => `«${f.texto}»`).join(" ")}`}
          </p>
        </Cierre>
      )}
    </Marco>
  );
}
