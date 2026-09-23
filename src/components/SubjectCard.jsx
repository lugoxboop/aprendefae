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

/*
 * Una cuenta T — Contabilidad.
 *
 * La forma más corta de decir «contabilidad»: la horizontal, la vertical que
 * la cruza, y una marca a cada lado. La de la izquierda en teal es el DEBE; la
 * de la derecha en ámbar, el HABER. Es el mismo par de colores que usa el
 * fondo para los dos lados de cada asiento, así que el ícono y el fondo dicen
 * lo mismo.
 *
 * SIN SIGNOS, aquí tampoco. El debe no es más ni el haber menos.
 *
 * Los otros dos íconos son divs; este es SVG porque una T con dos marcas no se
 * hace con rectángulos, pero ocupa los mismos 34 px.
 */
export function ContabilidadIcon() {
  /*
   * LA T ES ESTRUCTURA; LAS MARCAS SON LOS ASIENTOS.
   *
   * Por eso la T va en ámbar atenuado y las dos marcas a plena intensidad. Con
   * la T al 100 % la marca del haber —ámbar sobre ámbar— se perdía, y el ícono
   * pasaba a tener una sola marca visible: justo la mitad de lo que tiene que
   * decir. Se vio comparándolo con los otros dos en la portada.
   *
   * Y va con trazo grueso: al lado de las barras de Macro y de la rejilla de
   * Estrategia, que son formas macizas, una T de línea fina se veía endeble.
   */
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true" style={{ display: "block" }}>
      <path
        d="M3 8 H31 M17 8 V31"
        fill="none"
        stroke={FAE.ambar}
        strokeOpacity="0.5"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Debe a la izquierda en teal, haber a la derecha en ámbar. */}
      <rect x="5" y="14" width="9" height="3.6" rx="1.8" fill={FAE.teal} />
      <rect x="20" y="21" width="9" height="3.6" rx="1.8" fill={FAE.ambar} />
    </svg>
  );
}
