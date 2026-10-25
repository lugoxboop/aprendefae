import { FAE } from "../../theme.js";
import { APRENDER, HACER, ETIQUETAS } from "../../data/subjects.js";
import { N1 } from "../../estilo/volumen.jsx";

/*
 * Insignia de tipo de actividad.
 *
 * Se dibuja a partir del dato de clasificación, así que una actividad nueva no
 * necesita código: basta con que traiga su `clasificacion` en subjects.js.
 * Si no hay clasificación (Gen aún no la ha definido), no se dibuja nada.
 *
 * NEUTRA, Y LA DIFERENCIA LA HACE LA FORMA: «Hacer» va lleno, «Aprender» de
 * contorno. Decisión de Xeno (15-oct), medida y no supuesta.
 *
 * Aquí decía antes que teal y coral «difieren en relleno y borde para que la
 * distinción no dependa solo del color». Xeno comprobó que era FALSO: en gris
 * las dos insignias salen idénticas —tinte del 14 % contra 16 %, borde del
 * 55 % contra 62 %—, así que lo único que de verdad las separaba era la
 * palabra. Un comentario puede llevar años diciendo que algo está cubierto
 * sin que nadie lo mire.
 *
 * Y el coral sobraba por otra razón, de la misma pantalla: la insignia va
 * arriba de cada pantalla de Hacer, donde el coral significa ERROR. Con
 * deuteranopía, ese «HACER» se ve del mismo tono que la fila equivocada.
 *
 * Lleno contra contorno sí sobrevive al gris y al daltonismo, porque no es
 * color: es cuánta tinta hay.
 */

/*
 * VOLUMEN (#560): superficie elevada, sin canto y sin hundido (informa, no se
 * pulsa). Se AÑADE donde no había cara: «Aprender» pasa de transparente a la
 * cara N1, y conserva su contorno al 55 %, que es el que lo distingue de
 * «Hacer» y es más fuerte que la silueta del 18 %. «Hacer» se queda con su
 * cara clara publicada: es la píldora que pidió Mateo, la ven estudiantes de
 * Macro, y aquí se añade, no se reemplaza. Lleno contra contorno sigue en pie.
 * No cambia de alto.
 */
const ESTILOS = {
  [APRENDER]: { color: FAE.node, background: N1, border: "rgba(203,220,242,0.55)" },
  [HACER]: { color: FAE.bg, background: FAE.node, border: FAE.node },
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
