import { FAE } from "../theme.js";

/*
 * Aspecto de tarjeta, compartido por la tarjeta simple y por la partida
 * (TopicSplitCard). Vive aquí y no duplicado en cada una para que las dos se
 * vean como la misma pieza: la partida es la misma tarjeta en otro estado, no
 * otro componente que se le parece.
 */
export const CARD_SHELL = {
  minHeight: "clamp(150px, 22vh, 230px)",
  padding: "clamp(18px, 2.4vh, 26px)",
  borderRadius: "18px",
  background: "rgba(248,249,250,0.055)",
  border: "1px solid rgba(248,249,250,0.14)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  color: FAE.text,
  font: "inherit",
  textAlign: "left",
  width: "100%",
};

/*
 * Tarjeta de materia de la pantalla de entrada.
 * `icon` es el bloque gráfico propio de cada materia; `accent` tiñe la flecha y
 * el estado hover, que vive en home.css y lee las variables --fae-card-hover-*.
 */
export default function SubjectCard({ icon, title, accent, hoverBg, hoverBorder, onClick, label, badges }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label || title}
      className="fae-card"
      style={{
        ...CARD_SHELL,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "clamp(20px, 3.5vh, 40px)",
        cursor: "pointer",
        "--fae-card-hover-bg": hoverBg,
        "--fae-card-hover-border": hoverBorder,
      }}
    >
      {/* Icono y, si la actividad está clasificada, sus insignias en la misma fila. */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", width: "100%" }}>
        {icon}
        {badges && badges.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "flex-end" }}>{badges}</div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "16px" }}>
        <h2
          style={{
            fontFamily: "Sora, sans-serif",
            fontWeight: 600,
            fontSize: "clamp(24px, 2.6vw, 30px)",
            lineHeight: 1.12,
            letterSpacing: "-0.025em",
            margin: 0,
            color: FAE.text,
          }}
        >
          {title}
        </h2>
        <span style={{ fontSize: "22px", lineHeight: 1, color: accent }}>→</span>
      </div>
    </button>
  );
}

/* Barras ascendentes — Macroeconomía. */
export function MacroIcon() {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "5px", height: "34px" }}>
      <div style={{ width: "9px", height: "16px", background: FAE.coral, borderRadius: "2px" }} />
      <div style={{ width: "9px", height: "25px", background: FAE.coral, borderRadius: "2px" }} />
      <div style={{ width: "9px", height: "34px", background: FAE.coral, borderRadius: "2px" }} />
    </div>
  );
}

/* Matriz 2×2 — Pensamiento Estratégico. */
export function EstrategiaIcon() {
  const cell = { width: "15px", height: "15px", borderRadius: "2px" };
  const soft = "rgba(42,157,143,0.35)";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 15px)", gap: "4px", width: "34px" }}>
      <div style={{ ...cell, background: FAE.teal }} />
      <div style={{ ...cell, background: soft }} />
      <div style={{ ...cell, background: soft }} />
      <div style={{ ...cell, background: FAE.teal }} />
    </div>
  );
}
