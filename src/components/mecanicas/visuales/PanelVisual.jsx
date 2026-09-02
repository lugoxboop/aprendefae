import { COLORS } from "../../../theme.js";

/*
 * Marco común de las cuatro visualizaciones. Existe para que los cuatro canales
 * se vean como el mismo componente cambiando de contenido, y para que el pie
 * explique en una línea qué está mirando el estudiante.
 */
export default function PanelVisual({ pie, children }) {
  return (
    <div
      className="rounded-2xl px-3 pt-3 pb-2 mb-3"
      style={{ backgroundColor: COLORS.bgPanel, border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {children}
      {pie && (
        <p className="text-xs text-center mt-1" style={{ color: COLORS.textMuted }}>
          {pie}
        </p>
      )}
    </div>
  );
}
