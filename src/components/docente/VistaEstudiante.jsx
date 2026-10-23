import { FAE } from "../../theme.js";
import DetalleEstudiante from "./DetalleEstudiante.jsx";
import { V1, tituloBloque, volverV1 } from "./estiloV1.js";
import { hace } from "./ListaEstudiantes.jsx";

/*
 * El detalle de un estudiante, en su vista (Ukyo §6.2): el de siempre
 * (DetalleEstudiante) y, ahora aquí y no en cada fila, el botón de grupo. Es
 * la misma escritura de antes (grupo_marcar), por la acción del docente.
 */
export default function VistaEstudiante({ e, subjectId, posicion, onMarcar, onVolver, textoVolver }) {
  if (!e) return null;
  const nombre = e.full_name || e.nickname;
  return (
    <section data-vista="estudiante" data-estudiante-detalle={e.user_id} aria-labelledby="pd1-est">
      <button type="button" style={volverV1} onClick={onVolver} data-volver>‹ {textoVolver}</button>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "6px" }}>
        <div style={{ minWidth: 0 }}>
          <h2 id="pd1-est" className="pd1-nombre" title={nombre} style={{ ...tituloBloque, fontSize: "18px", margin: 0 }}>{nombre}</h2>
          <p style={{ margin: "2px 0 0", fontSize: "13px", color: V1.texto2 }}>
            {e.full_name ? `${e.nickname} · ` : ""}última vez {hace(e.dias_inactivo)}
            {e.es_prueba ? " · cuenta de prueba, fuera de los promedios" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onMarcar(e.user_id, !e.en_mi_grupo)}
          aria-pressed={Boolean(e.en_mi_grupo)}
          data-grupo
          style={{
            minHeight: "44px", padding: "0 16px", borderRadius: "999px", cursor: "pointer",
            fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600,
            background: e.en_mi_grupo ? FAE.teal : "transparent",
            border: `1px solid ${e.en_mi_grupo ? FAE.teal : "rgba(248,249,250,0.3)"}`,
            color: e.en_mi_grupo ? FAE.bg : FAE.text,
          }}
        >
          {e.en_mi_grupo ? "En mi grupo" : "Añadir a mi grupo"}
        </button>
      </div>
      <div style={{ borderRadius: "14px", background: V1.tarjeta, border: V1.borde, paddingTop: "10px" }}>
        <DetalleEstudiante e={e} subjectId={subjectId} posicion={posicion} />
      </div>
    </section>
  );
}
