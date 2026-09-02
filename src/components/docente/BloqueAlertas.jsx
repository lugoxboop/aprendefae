import { FAE } from "../../theme.js";
import { NIVEL, REGLAS_SIN_DATOS } from "../../docente/alertas.js";

/*
 * Las alertas van arriba y ordenadas por urgencia, nunca dentro de la tabla.
 * Un docente con 40 estudiantes no debería tener que recorrer 40 filas para
 * encontrar a los tres que están en riesgo.
 */

const ESTILO = {
  [NIVEL.URGENTE]: { color: FAE.coral, fondo: "rgba(231,111,81,0.12)", borde: "rgba(231,111,81,0.5)", rotulo: "URGENTE" },
  [NIVEL.ATENCION]: { color: FAE.ambar, fondo: "rgba(233,196,106,0.12)", borde: "rgba(233,196,106,0.5)", rotulo: "ATENCIÓN" },
  [NIVEL.INFO]: { color: FAE.teal, fondo: "rgba(42,157,143,0.10)", borde: "rgba(42,157,143,0.45)", rotulo: "INFORMATIVO" },
};

function Alerta({ alerta }) {
  const s = ESTILO[alerta.nivel];
  const e = alerta.estudiante;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "12px 14px",
        borderRadius: "12px",
        background: s.fondo,
        border: `1px solid ${s.borde}`,
      }}
    >
      {/* Barra de color, no icono: el sitio no usa iconografía de estado. */}
      <span aria-hidden="true" style={{ width: "3px", alignSelf: "stretch", borderRadius: "2px", background: s.color, flexShrink: 0 }} />
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.1em", color: s.color }}>
          {s.rotulo}
        </p>
        <p style={{ margin: "3px 0 2px", fontFamily: "Sora, sans-serif", fontSize: "14.5px", fontWeight: 600, color: FAE.text }}>
          {e.full_name || e.nickname} · {alerta.titulo}
        </p>
        <p style={{ margin: 0, fontSize: "12.5px", lineHeight: 1.45, color: "rgba(248,249,250,0.62)" }}>{alerta.detalle}</p>
      </div>
    </div>
  );
}

export default function BloqueAlertas({ alertas, grupoVacio }) {
  return (
    <section style={{ marginBottom: "28px" }}>
      <h2 style={{ fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(248,249,250,0.55)", margin: "0 0 12px" }}>
        ALERTAS
      </h2>

      {alertas.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {alertas.map((a, i) => (
            <Alerta key={i} alerta={a} />
          ))}
        </div>
      ) : (
        /*
         * Sin alertas hay dos historias distintas y conviene no confundirlas:
         * un grupo sano y un grupo sin armar todavía.
         */
        <p style={{ fontSize: "14px", lineHeight: 1.55, color: "rgba(248,249,250,0.6)", margin: 0 }}>
          {grupoVacio
            ? "Todavía no has armado tu grupo. Marca abajo qué estudiantes son de tu curso y las alertas se calcularán sobre ellos."
            : "Ninguna alerta en tu grupo con los datos de este periodo."}
        </p>
      )}

      {/*
        Lo que el panel NO puede ver todavía. Callarlo daría una falsa sensación
        de cobertura: un docente podría leer "sin alertas" como "nadie está
        atascado", cuando en realidad eso aún no se mide.
      */}
      <details style={{ marginTop: "14px" }}>
        <summary style={{ cursor: "pointer", fontSize: "12.5px", color: "rgba(248,249,250,0.5)" }}>
          Qué no está midiendo este panel todavía ({REGLAS_SIN_DATOS.length})
        </summary>
        <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {REGLAS_SIN_DATOS.map((r) => (
            <div key={r.titulo} style={{ padding: "10px 12px", borderRadius: "10px", background: "rgba(248,249,250,0.04)", border: "1px dashed rgba(248,249,250,0.16)" }}>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "rgba(248,249,250,0.8)" }}>
                {r.titulo} <span style={{ color: ESTILO[r.nivel].color, fontSize: "11px" }}>· {ESTILO[r.nivel].rotulo}</span>
              </p>
              <p style={{ margin: "3px 0 0", fontSize: "12px", lineHeight: 1.45, color: "rgba(248,249,250,0.55)" }}>
                Necesita: {r.necesita}. {r.porque}
              </p>
            </div>
          ))}
        </div>
      </details>
    </section>
  );
}
