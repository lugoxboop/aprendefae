import { FAE } from "../../theme.js";
import { APRENDER, HACER, ETIQUETAS } from "../../data/subjects.js";

/*
 * Insignia de tipo de actividad.
 *
 * Se dibuja a partir del dato de clasificación, así que una actividad nueva no
 * necesita código: basta con que traiga su `clasificacion` en subjects.js.
 * Si no hay clasificación (Gen aún no la ha definido), no se dibuja nada.
 *
 * Teal para "Aprender" y coral para "Hacer": son los dos acentos de marca más
 * separados entre sí, y además difieren en relleno y borde para que la
 * distinción no dependa solo del color.
 */

const ESTILOS = {
  [APRENDER]: {
    color: FAE.teal,
    background: "rgba(42,157,143,0.14)",
    border: "rgba(42,157,143,0.55)",
  },
  [HACER]: {
    color: FAE.coral,
    background: "rgba(231,111,81,0.16)",
    border: "rgba(231,111,81,0.62)",
  },
};

export default function ActivityBadge({ tipo, size = "md" }) {
  const estilo = ESTILOS[tipo];
  if (!estilo) return null;

  const compacto = size === "sm";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontFamily: "Sora, sans-serif",
        fontWeight: 700,
        fontSize: compacto ? "10.5px" : "11.5px",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: compacto ? "3px 9px" : "4px 11px",
        borderRadius: "999px",
        whiteSpace: "nowrap",
        color: estilo.color,
        background: estilo.background,
        border: `1px solid ${estilo.border}`,
      }}
    >
      {ETIQUETAS[tipo]}
    </span>
  );
}
