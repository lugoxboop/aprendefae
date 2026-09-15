import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import { barajar } from "../../../utils/barajar.js";
import { puntuarFrontera } from "../../../data/bloquesAvanzados.js";
import { Cierre, Enunciado } from "../corazon/juego.jsx";
import { TEXTO_CIERRE } from "./marcos.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA FRONTERA DE SEÑALES — Experto. La comparten Demanda Agregada («La sala de
 * espera llena») y Política Fiscal («El comité de presupuesto»).
 *
 * Catorce datos sobre la mesa, cinco relevantes y nueve señuelos: de otro
 * período, estructurales, de otra categoría, en la dirección contraria. Se
 * eligen los que explican ESTE cambio y se confirma una vez.
 *
 *   bruto = relevantes elegidos − 0,3 × señuelos elegidos
 *   pct   = clamp(bruto / 5, 0, 1) × 100, sin redondear por el camino
 *
 * Ítem = CADA UNO de los catorce datos, elegido o no: `ok` es si se decidió
 * bien —relevante elegido o señuelo descartado— y `respuesta` lo que se hizo.
 * Así el panel ve qué señuelo engaña más y qué dato relevante se pasa por
 * alto, que son las dos cosas que un docente querría llevar a clase.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function FiltroDeSenales({ banco, Marco, rotulo, titulo, acento, onCompletar }) {
  const datosDe = () => barajar([
    ...banco.relevantes.map((d) => ({ ...d, relevante: true })),
    ...banco.senuelos.map((d) => ({ ...d, relevante: false })),
  ]);
  const [datos, setDatos] = useState(datosDe);
  const [elegidos, setElegidos] = useState([]);
  const [confirmado, setConfirmado] = useState(false);
  const avisado = useRef(false);
  const inicio = useRef(Date.now());

  const relevantesElegidos = datos.filter((d) => d.relevante && elegidos.includes(d.id)).length;
  const senuelosElegidos = datos.filter((d) => !d.relevante && elegidos.includes(d.id)).length;
  const pct = puntuarFrontera(relevantesElegidos, senuelosElegidos, banco.relevantes.length);

  useEffect(() => {
    if (!confirmado || avisado.current) return;
    avisado.current = true;
    const filas = datos.map((d, k) => {
      const elegido = elegidos.includes(d.id);
      return { item: d.id, ok: elegido === d.relevante, intentos: 1, respuesta: elegido ? "elegido" : "descartado", orden: k + 1 };
    });
    onCompletar?.(pct, Date.now() - inicio.current, filas);
  }, [confirmado]);

  const alternar = (id) => {
    if (confirmado) return;
    setElegidos((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]));
  };

  const reiniciar = () => {
    setDatos(datosDe());
    setElegidos([]); setConfirmado(false);
    avisado.current = false;
    inicio.current = Date.now();
  };

  const nota = (d, elegido) => {
    if (d.relevante) return elegido ? { t: "✓ Relevante", c: FAE.teal } : { t: "Relevante — se te pasó", c: FAE.ambar };
    return elegido ? { t: `✗ Señuelo — ${d.porque}`, c: FAE.coral } : { t: `Señuelo, bien descartado — ${d.porque}`, c: "rgba(248,249,250,0.55)" };
  };

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <Enunciado rotulo="LA PREGUNTA" acento={acento}>{banco.pregunta}</Enunciado>
      <p style={{ fontSize: "12.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.6)", margin: "12px 0 10px" }}>
        {confirmado ? "Esto es lo que había en la mesa:" : `Toca los datos que de verdad lo explican · ${elegidos.length} ${elegidos.length === 1 ? "elegido" : "elegidos"}`}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "8px" }}>
        {datos.map((d) => {
          const elegido = elegidos.includes(d.id);
          const n = confirmado ? nota(d, elegido) : null;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => alternar(d.id)}
              disabled={confirmado}
              aria-pressed={elegido}
              style={{
                textAlign: "left", padding: "11px 13px", borderRadius: "12px", cursor: confirmado ? "default" : "pointer",
                background: elegido ? "rgba(42,157,143,0.12)" : "rgba(248,249,250,0.035)",
                border: `1px solid ${n ? n.c : elegido ? FAE.teal : "rgba(248,249,250,0.14)"}`,
                color: FAE.text, fontFamily: "Inter, sans-serif",
              }}
            >
              <span style={{ display: "flex", gap: "9px", alignItems: "flex-start" }}>
                <span aria-hidden="true" style={{ flexShrink: 0, marginTop: "2px", width: "14px", height: "14px", borderRadius: "4px", border: `2px solid ${elegido ? FAE.teal : "rgba(248,249,250,0.35)"}`, background: elegido ? FAE.teal : "transparent" }} />
                <span style={{ fontSize: "13px", lineHeight: 1.45 }}>{d.texto}</span>
              </span>
              {n && <span style={{ display: "block", marginTop: "6px", fontSize: "12px", lineHeight: 1.4, color: n.c }}>{n.t}</span>}
            </button>
          );
        })}
      </div>

      {!confirmado ? (
        <button
          type="button"
          onClick={() => elegidos.length > 0 && setConfirmado(true)}
          disabled={elegidos.length === 0}
          style={{
            marginTop: "14px", width: "100%", padding: "13px", borderRadius: "14px", cursor: elegidos.length ? "pointer" : "default",
            background: elegidos.length ? FAE.teal : "rgba(248,249,250,0.05)", border: `1px solid ${elegidos.length ? FAE.teal : "rgba(248,249,250,0.14)"}`,
            color: elegidos.length ? FAE.bg : "rgba(248,249,250,0.4)", fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700,
          }}
        >
          Confirmar
        </button>
      ) : (
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra vez">
          <p style={TEXTO_CIERRE}>
            {relevantesElegidos} de {banco.relevantes.length} relevantes y {senuelosElegidos} {senuelosElegidos === 1 ? "señuelo" : "señuelos"}. Cada señuelo resta 0,3 de un dato relevante.
          </p>
        </Cierre>
      )}
    </Marco>
  );
}
