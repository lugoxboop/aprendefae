import { useState, useEffect, useCallback } from "react";
import { FAE } from "../../theme.js";
import { supabase } from "../../lib/supabase.js";
import { useAuth } from "../../auth/AuthProvider.jsx";

/*
 * Tabla de posiciones de FP. Sirve a los dos emplazamientos: por materia
 * (pasando `subjectId`) y general (sin él).
 *
 * Los datos salen de la función ranking_fp, que agrega sobre todo el historial;
 * desde el cliente no se puede, porque RLS solo deja ver las filas propias.
 *
 * Se consulta al entrar y al cambiar de pestaña, sin suscripción en vivo.
 *
 * Sin iconografía de premio: la jerarquía la marca el número de posición con
 * un acento de marca en los tres primeros.
 */

const PERIODOS = [
  { id: "diario", etiqueta: "Diario" },
  { id: "semanal", etiqueta: "Semanal" },
  { id: "semestre", etiqueta: "De semestre" },
];

/* Acento decreciente para el podio; del cuarto en adelante, número a secas. */
const ACENTO_PODIO = [
  { fondo: "rgba(231,111,81,0.18)", borde: FAE.coral, texto: FAE.coral },
  { fondo: "rgba(42,157,143,0.18)", borde: FAE.teal, texto: FAE.teal },
  { fondo: "rgba(42,157,143,0.10)", borde: "rgba(42,157,143,0.5)", texto: "rgba(42,157,143,0.85)" },
];

function Posicion({ n }) {
  const acento = ACENTO_PODIO[n - 1];
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "28px",
        height: "28px",
        flexShrink: 0,
        borderRadius: "9px",
        fontFamily: "Sora, sans-serif",
        fontSize: "13px",
        fontWeight: 700,
        fontVariantNumeric: "tabular-nums",
        background: acento ? acento.fondo : "transparent",
        border: `1px solid ${acento ? acento.borde : "rgba(248,249,250,0.16)"}`,
        color: acento ? acento.texto : "rgba(248,249,250,0.6)",
      }}
    >
      {n}
    </span>
  );
}

function Fila({ entrada, destacada }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 12px",
        borderRadius: "12px",
        background: destacada ? "rgba(42,157,143,0.10)" : "transparent",
        border: destacada ? `1px solid ${FAE.teal}` : "1px solid transparent",
      }}
    >
      <Posicion n={entrada.posicion} />
      <span
        style={{
          flex: 1,
          minWidth: 0,
          fontSize: "14.5px",
          color: FAE.text,
          fontWeight: destacada ? 600 : 400,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {entrada.nickname}
        {destacada && <span style={{ color: FAE.teal, fontWeight: 400 }}> · tú</span>}
      </span>
      <span
        style={{
          fontFamily: "Sora, sans-serif",
          fontSize: "13.5px",
          fontWeight: 600,
          fontVariantNumeric: "tabular-nums",
          color: destacada ? FAE.text : "rgba(248,249,250,0.75)",
          whiteSpace: "nowrap",
        }}
      >
        {entrada.fp} FP
      </span>
    </div>
  );
}

export default function RankingFP({ subjectId = null, titulo = "Ranking", nota }) {
  const { session, perfil, pedirCuenta } = useAuth();
  const [periodo, setPeriodo] = useState("semestre");
  const [estado, setEstado] = useState({ cargando: false, filas: null, error: null });

  const consultar = useCallback(async () => {
    if (!supabase || !session) return;
    setEstado({ cargando: true, filas: null, error: null });
    const { data, error } = await supabase.rpc("ranking_fp", {
      p_subject: subjectId,
      p_periodo: periodo,
    });
    if (error) {
      setEstado({ cargando: false, filas: null, error: error.message });
      return;
    }
    setEstado({ cargando: false, filas: data ?? [], error: null });
  }, [subjectId, periodo, session]);

  /* Se consulta al entrar y cada vez que cambia la pestaña. */
  useEffect(() => { consultar(); }, [consultar]);

  const contenedor = {
    borderRadius: "18px",
    background: "rgba(248,249,250,0.04)",
    border: "1px solid rgba(248,249,250,0.12)",
    padding: "clamp(16px, 2.5vw, 22px)",
  };

  const filas = estado.filas ?? [];
  const top = filas.filter((f) => f.posicion <= 10);
  const propia = filas.find((f) => f.es_tuyo);
  const propiaFueraDelTop = propia && propia.posicion > 10;

  return (
    <div style={contenedor}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "14px" }}>
        <h3 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "16px", letterSpacing: "-0.02em", margin: 0, color: FAE.text }}>
          {titulo}
        </h3>
        {nota && <span style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.45)" }}>{nota}</span>}
      </div>

      <div
        role="group"
        aria-label="Periodo del ranking"
        style={{
          display: "inline-flex", gap: "4px", padding: "4px", borderRadius: "999px",
          background: "rgba(248,249,250,0.05)", border: "1px solid rgba(248,249,250,0.12)",
          marginBottom: "16px",
        }}
      >
        {PERIODOS.map((p) => {
          const activo = p.id === periodo;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriodo(p.id)}
              aria-pressed={activo}
              style={{
                fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 600,
                padding: "7px 15px", borderRadius: "999px", border: "none", cursor: "pointer",
                backgroundColor: activo ? FAE.teal : "transparent",
                color: activo ? FAE.bg : "rgba(248,249,250,0.6)",
                transition: "background-color 160ms ease, color 160ms ease",
              }}
            >
              {p.etiqueta}
            </button>
          );
        })}
      </div>

      {!session ? (
        <div>
          <p style={{ fontSize: "14px", lineHeight: 1.55, color: "rgba(248,249,250,0.62)", margin: "0 0 12px" }}>
            El ranking es entre estudiantes con cuenta. Entra para ver tu posición.
          </p>
          <button
            type="button"
            onClick={() => pedirCuenta("ver el ranking")}
            style={{
              fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 600,
              padding: "10px 18px", borderRadius: "999px", border: "none",
              cursor: "pointer", backgroundColor: FAE.teal, color: FAE.bg,
            }}
          >
            Entrar
          </button>
        </div>
      ) : estado.cargando ? (
        <p style={{ fontSize: "14px", color: "rgba(248,249,250,0.5)", margin: 0 }}>Cargando…</p>
      ) : estado.error ? (
        <p style={{ fontSize: "14px", lineHeight: 1.55, color: FAE.coral, margin: 0 }}>
          No se pudo cargar el ranking: {estado.error}
        </p>
      ) : top.length === 0 ? (
        /* Estado vacío honesto: todavía no hay actividad, no es un fallo. */
        <p style={{ fontSize: "14px", lineHeight: 1.55, color: "rgba(248,249,250,0.62)", margin: 0 }}>
          {subjectId
            ? "Aún no hay actividad registrada en esta materia."
            : "Aún no hay actividad registrada en este periodo."}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {top.map((f) => (
            <Fila key={`${f.posicion}-${f.nickname}`} entrada={f} destacada={f.es_tuyo} />
          ))}

          {propiaFueraDelTop && (
            <>
              <div style={{ display: "flex", justifyContent: "center", padding: "6px 0" }}>
                <span aria-hidden="true" style={{ color: "rgba(248,249,250,0.3)", letterSpacing: "0.3em", fontSize: "12px" }}>···</span>
              </div>
              <Fila entrada={propia} destacada />
            </>
          )}

          {!propia && perfil && (
            <p style={{ fontSize: "13px", lineHeight: 1.5, color: "rgba(248,249,250,0.5)", margin: "10px 2px 0" }}>
              Todavía no tienes FP en este periodo, así que no apareces en la tabla.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
