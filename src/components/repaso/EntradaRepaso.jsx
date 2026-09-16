import { History } from "lucide-react";
import { FAE } from "../../theme.js";
import { HACER } from "../../data/subjects.js";
import { CARD_SHELL } from "../SubjectCard.jsx";
import ActivityBadge from "../shared/ActivityBadge.jsx";
import GestoPasillo from "./GestoPasillo.jsx";

/*
 * La entrada del Repaso Diario en el índice de una materia (B6).
 *
 * Misma cáscara que las tarjetas de tema, para que se lea como una entrada
 * más del índice y no como un aviso. El icono es el del nodo —reloj con flecha
 * de retorno, History de lucide— y a su lado la miniatura con el gesto del
 * pasillo.
 *
 * Qué índice la enseña lo dice `indice` en ACTIVIDADES_TRANSVERSALES, no esta
 * tarjeta: ella no sabe de qué materias sale el pool.
 */
export const IconoRepaso = History;

export default function EntradaRepaso({ actividad, onAbrir, hoverBg, hoverBorder }) {
  return (
    <button
      type="button"
      data-entrada={actividad.id}
      onClick={() => onAbrir(actividad.id)}
      aria-label={actividad.nombre}
      className="fae-card"
      style={{
        ...CARD_SHELL,
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        gap: "clamp(14px, 2.4vh, 26px)", cursor: "pointer",
        "--fae-card-hover-bg": hoverBg,
        "--fae-card-hover-border": hoverBorder,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <IconoRepaso size={32} color={FAE.teal} strokeWidth={2} aria-hidden="true" />
          <div style={{ width: "88px", height: "66px", borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(248,249,250,0.14)" }}>
            <GestoPasillo />
          </div>
        </div>
        <ActivityBadge tipo={HACER} size="sm" />
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "16px" }}>
        <h2 style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "clamp(24px, 2.6vw, 30px)", lineHeight: 1.12, letterSpacing: "-0.025em", margin: 0, color: FAE.text }}>
          {actividad.nombre}
        </h2>
        <span aria-hidden="true" style={{ fontSize: "22px", lineHeight: 1, color: FAE.teal }}>→</span>
      </div>
    </button>
  );
}
