import { Check, UserRound } from "lucide-react";
import { FAE } from "../../theme.js";
import DetalleEstudiante from "./DetalleEstudiante.jsx";
import { hace } from "./ListaEstudiantes.jsx";
import VistaDocente from "./VistaDocente.jsx";

/*
 * El detalle de un estudiante, en su vista (Ukyo §6.2): el de siempre
 * (DetalleEstudiante) y, ahora aquí y no en cada fila, el botón de grupo. Es
 * la misma escritura de antes (grupo_marcar), por la acción del docente.
 *
 * Desde el 18-nov va en el marco de las vistas (VistaDocente): su nombre en
 * grande en la cabecera, con el color de «Mis estudiantes», y el botón de
 * grupo a la derecha de la cabecera.
 */
export default function VistaEstudiante({ e, subjectId, posicion, onMarcar, onVolver, textoVolver }) {
  if (!e) return null;
  const nombre = e.full_name || e.nickname;
  return (
    <VistaDocente
      vista="estudiante"
      data-vista="estudiante"
      data-estudiante-detalle={e.user_id}
      aria-labelledby="pd1-est"
      Glifo={UserRound}
      /* Katsumi (lote 4): el rótulo «Estudiante» y debajo su nombre; no «Mi estudiante», que sugiere uno solo. */
      rotulo={<span data-rotulo-estudiante>Estudiante</span>}
      titulo={nombre}
      tituloId="pd1-est"
      sub={<>
        {e.full_name ? `${e.nickname} · ` : ""}última vez {hace(e.dias_inactivo)}
        {e.es_prueba ? " · cuenta de prueba, fuera de los promedios" : ""}
      </>}
      textoVolver={textoVolver}
      onVolver={onVolver}
      accion={
        <button
          type="button"
          onClick={() => onMarcar(e.user_id, !e.en_mi_grupo)}
          aria-pressed={Boolean(e.en_mi_grupo)}
          data-grupo
          className={e.en_mi_grupo ? undefined : "pdv-boton"}
          style={e.en_mi_grupo ? {
            display: "inline-flex", alignItems: "center", gap: "6px", minHeight: "44px", padding: "0 18px", borderRadius: "999px", cursor: "pointer",
            fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 700,
            background: FAE.teal, border: `1px solid ${FAE.teal}`, color: FAE.bg,
          } : undefined}
        >
          {e.en_mi_grupo && <Check size={16} strokeWidth={2.6} aria-hidden="true" />}
          {e.en_mi_grupo ? "En mi grupo" : "Añadir a mi grupo"}
        </button>
      }
    >
      <DetalleEstudiante e={e} subjectId={subjectId} posicion={posicion} />
    </VistaDocente>
  );
}
