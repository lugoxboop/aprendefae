import { FAE } from "../../theme.js";
import { APRENDER, HACER, ETIQUETAS } from "../../data/subjects.js";

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

const ESTILOS = {
  [APRENDER]: { color: FAE.node, background: "transparent", border: "rgba(203,220,242,0.55)" },
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
        /*
         * 12 y 13, no 10,5 y 11,5. El piso de kit.md es 12 px y esta insignia
         * lo rompía en las dos tallas, en todos los temas de las dos materias
         * a la vez: era el texto más pequeño del sitio y estaba justo en el
         * paso por el que pasa todo el contenido. Las mayúsculas espaciadas
         * aguantan bien el tamaño pequeño, pero «aguanta» no es la regla.
         *
         * El padding baja un punto para que la pastilla crezca lo mínimo: con
         * el mismo hueco, dos píxeles más de letra la harían saltar de línea
         * en la cabecera estrecha del camino.
         */
        fontSize: compacto ? "12px" : "13px",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: compacto ? "2px 9px" : "3px 11px",
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
