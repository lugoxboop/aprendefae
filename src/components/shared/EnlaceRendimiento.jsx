import { useContext } from "react";
import { BarChart2 } from "lucide-react";
import { FAE } from "../../theme.js";
import { NavigationContext } from "../../navigation.js";
import { useAccesoDocente } from "../../docente/useAccesoDocente.js";
import { ubicacionDeActividad } from "../../data/subjects.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «VER CÓMO LE FUE AL GRUPO» — el atajo del docente dentro de una actividad.
 *
 * Un enlace, no un panel. La actividad sigue siendo lo principal de la
 * pantalla: esto es una línea pequeña debajo de la entradilla, del tamaño de
 * una nota al pie, y no cambia el sitio de nada de lo que ya había.
 *
 * ═══════════ POR QUÉ UN ENLACE Y NO LA VISTA DE RENDIMIENTO ═══════════
 *
 * Mateo es docente Y es quien prueba cada actividad del sitio. Si abrir una
 * actividad le enseñara el rendimiento por defecto, pagaría un desvío cada vez
 * que quiere jugar algo, que es constantemente. El enlace le da lo mismo sin
 * ese coste: está cuando lo busca y no estorba cuando no.
 *
 * ═══════════ QUIÉN LO VE ═══════════
 *
 * Solo un docente autenticado y autorizado EN LA MATERIA DE ESTA ACTIVIDAD. Es
 * la misma condición que usa el panel, y la materia sale de subjects.js, no de
 * quien monta el componente: así no hay forma de pasarle la materia equivocada.
 *
 * Un estudiante no lo ve nunca. Y si lo viera, tampoco pasaría nada: las dos
 * funciones del panel comprueban docente y materia en el servidor y responden
 * 42501. Esto es interfaz, no seguridad.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function EnlaceRendimiento({ actividadId }) {
  const acceso = useAccesoDocente();
  const nav = useContext(NavigationContext);
  const ubicacion = ubicacionDeActividad(actividadId);

  if (!acceso.esDocente) return null;
  if (!ubicacion || !acceso.materias.includes(ubicacion.materiaId)) return null;
  if (!nav?.irA) return null;

  return (
    <p style={{ margin: "-14px 0 14px" }}>
      <button
        type="button"
        onClick={() => nav.irA("docente", null, actividadId)}
        style={{
          display: "inline-flex", alignItems: "center", gap: "7px",
          /*
           * El relleno vertical es para el pulgar, no para el diseño: sin él
           * el objetivo táctil medía veinte píxeles de alto. El margen negativo
           * de arriba lo compensa para que la línea no se mueva de sitio.
           */
          padding: "8px 0", background: "transparent", border: "none",
          cursor: "pointer", color: FAE.teal,
          fontFamily: "Inter, sans-serif", fontSize: "13px",
          textDecorationLine: "underline", textUnderlineOffset: "3px",
          textDecorationColor: `${FAE.teal}66`,
        }}
      >
        <BarChart2 size={14} aria-hidden="true" />
        Ver cómo le fue al grupo
      </button>
    </p>
  );
}
