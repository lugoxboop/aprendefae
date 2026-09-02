import { FAE } from "../../theme.js";
import { promedioAciertos, avancePorTema } from "../../docente/alertas.js";

/*
 * Una fila por estudiante, con lo que un docente necesita decidir a quién
 * escribirle: quién es, cuándo entró por última vez, cuánto lleva, y cómo le va
 * separando lo que se puede reintentar de lo que no.
 */

const dato = { fontFamily: "Sora, sans-serif", fontWeight: 700, fontVariantNumeric: "tabular-nums" };
const rotulo = { fontSize: "10.5px", letterSpacing: "0.06em", color: "rgba(248,249,250,0.45)", margin: "0 0 2px" };

function hace(dias) {
  if (dias === null || dias === undefined) return "—";
  if (dias === 0) return "hoy";
  if (dias === 1) return "ayer";
  return `hace ${dias} d`;
}

/*
 * El % de aciertos NO significa lo mismo en las dos modalidades, y mostrar un
 * número pelado invitaría a compararlos. En exploratoria se puede reintentar
 * hasta acertar, así que tiende a 100 sin decir nada del aprendizaje; en
 * evaluativa sí es señal de dominio. Por eso van separados y etiquetados.
 */
function Acierto({ pct, n, modalidad }) {
  const fiable = modalidad === "evaluativa";
  if (!n) return <span style={{ fontSize: "13px", color: "rgba(248,249,250,0.3)" }}>—</span>;
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: "5px" }}>
      <span style={{ ...dato, fontSize: "15px", color: fiable ? FAE.text : "rgba(248,249,250,0.6)" }}>
        {pct === null ? "—" : `${Math.round(Number(pct) * 100)}%`}
      </span>
      <span style={{ fontSize: "10.5px", color: "rgba(248,249,250,0.4)" }}>
        ({n})
      </span>
    </span>
  );
}

export default function FilaEstudiante({ e, subjectId, onMarcar }) {
  const temas = avancePorTema(subjectId, e.actividades ?? []);
  const global = promedioAciertos(e);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,2.2fr) repeat(4, minmax(0,1fr)) auto",
        gap: "12px",
        alignItems: "center",
        padding: "12px 14px",
        borderRadius: "12px",
        background: e.en_mi_grupo ? "rgba(42,157,143,0.07)" : "rgba(248,249,250,0.03)",
        border: `1px solid ${e.en_mi_grupo ? "rgba(42,157,143,0.28)" : "rgba(248,249,250,0.1)"}`,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontSize: "14.5px", fontWeight: 600, color: FAE.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {e.full_name || e.nickname}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: "12px", color: "rgba(248,249,250,0.5)" }}>
          {e.full_name ? `${e.nickname} · ` : ""}
          {temas.filter((t) => t.hechas > 0).length} de {temas.length} temas iniciados
        </p>
      </div>

      <div>
        <p style={rotulo}>FP CICLO</p>
        <p style={{ ...dato, fontSize: "16px", color: FAE.teal, margin: 0 }}>{e.fp_ciclo}</p>
      </div>

      <div>
        <p style={rotulo}>FP TOTAL</p>
        <p style={{ ...dato, fontSize: "16px", color: FAE.text, margin: 0 }}>{e.fp_total}</p>
      </div>

      <div>
        <p style={rotulo}>EVALUATIVA</p>
        <Acierto pct={e.pct_evaluativa} n={Number(e.n_evaluativas)} modalidad="evaluativa" />
      </div>

      <div>
        <p style={rotulo}>ÚLTIMA VEZ</p>
        <p style={{ ...dato, fontSize: "14px", color: e.dias_inactivo > 7 ? FAE.coral : FAE.text, margin: 0 }}>
          {hace(e.dias_inactivo)}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onMarcar(e.user_id, !e.en_mi_grupo)}
        style={{
          fontFamily: "Sora, sans-serif",
          fontSize: "12px",
          fontWeight: 600,
          padding: "7px 12px",
          borderRadius: "999px",
          cursor: "pointer",
          whiteSpace: "nowrap",
          background: e.en_mi_grupo ? FAE.teal : "transparent",
          border: `1px solid ${e.en_mi_grupo ? FAE.teal : "rgba(248,249,250,0.25)"}`,
          color: e.en_mi_grupo ? FAE.bg : "rgba(248,249,250,0.75)",
        }}
      >
        {e.en_mi_grupo ? "En mi grupo" : "Añadir"}
      </button>
    </div>
  );
}

export { Acierto };
