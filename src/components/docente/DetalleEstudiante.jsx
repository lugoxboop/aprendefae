import { useEffect, useState } from "react";
import { FAE } from "../../theme.js";
import { NIVEL, alertasDe } from "../../docente/alertas.js";
import { historialDe } from "../../docente/datos.js";
import { nombreDeActividad } from "../../data/subjects.js";

/*
 * ÍTEM 3 — El detalle que se abre DEBAJO de la fila, dentro de la misma fila.
 *
 * Ni navegación ni capa encima. Lo que el panel deslizante iba a resolver
 * —revisar varios estudiantes seguidos sin perder la búsqueda, el filtro de
 * grupo ni el scroll— se resuelve solo por no moverse de sitio.
 *
 * ═══════════ EL HISTORIAL VA AGRUPADO, Y ESO ES LO QUE LO HACE ÚTIL ═══════════
 *
 * Una línea por ACTIVIDAD, no por intento. Treinta filas sueltas se vuelven
 * ocho, y "lo intentó tres veces y sigue en 40%" pasa de estar enterrado a
 * verse de un vistazo. El "×3" va en texto pequeño y apagado, no como
 * distintivo: es un matiz, no una medalla.
 *
 * Los bonos de racha no salen. Los filtra la propia función SQL por modality,
 * no por el nombre del id.
 *
 * ═══════════ MÓVIL ═══════════
 *
 * Una columna. Las cifras clave pasan a una rejilla 2×2 compacta y el
 * historial va debajo, no al lado. En escritorio son dos columnas con las
 * cifras a la izquierda y el historial a la derecha.
 *
 * ═══════════ SI EL SERVIDOR NO PUEDE ═══════════
 *
 * Con el cliente desplegado antes que la migración 0019, panel_historial no
 * existe y la llamada devuelve error. Entonces se dice, y las cifras de la
 * izquierda —que salen de lo que ya estaba cargado— se siguen viendo.
 */

const rotulo = { margin: "0 0 3px", fontSize: "10px", letterSpacing: "0.07em", color: "rgba(248,249,250,0.45)" };
const cifra = { margin: 0, fontFamily: "Sora, sans-serif", fontSize: "17px", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: FAE.text };

const COLOR_NIVEL = {
  [NIVEL.URGENTE]: FAE.coral,
  [NIVEL.ATENCION]: FAE.ambar,
  [NIVEL.INFO]: FAE.teal,
};
const PALABRA_NIVEL = {
  [NIVEL.URGENTE]: "Urgente",
  [NIVEL.ATENCION]: "Atención",
  [NIVEL.INFO]: "Informativa",
};

function fecha(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short" });
}

export default function DetalleEstudiante({ e, subjectId, posicion }) {
  const [historial, setHistorial] = useState(null);   // null = cargando
  const [errorHist, setErrorHist] = useState(null);

  useEffect(() => {
    let vivo = true;
    historialDe(subjectId, e.user_id).then(({ historial, error }) => {
      if (!vivo) return;
      setHistorial(historial);
      setErrorHist(error);
    });
    return () => { vivo = false; };
  }, [subjectId, e.user_id]);

  /*
   * La alerta más grave, si la hay. VA PRIMERA Y A TODO EL ANCHO. Si no hay
   * ninguna, esta tira sencillamente no se pinta: no se reserva un hueco vacío
   * que haga parecer que falta algo.
   */
  const alerta = alertasDe(e)[0] ?? null;

  return (
    <div style={{ padding: "4px 14px 14px" }}>
      {alerta && (
        <div
          style={{
            display: "flex", alignItems: "flex-start", gap: "10px",
            padding: "10px 13px", borderRadius: "11px", marginBottom: "14px",
            background: `${COLOR_NIVEL[alerta.nivel]}14`,
            border: `1px solid ${COLOR_NIVEL[alerta.nivel]}55`,
          }}
        >
          <span aria-hidden="true" style={{ width: "8px", height: "8px", borderRadius: "50%", background: COLOR_NIVEL[alerta.nivel], marginTop: "5px", flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600, color: FAE.text }}>
              {/* La palabra del nivel acompaña al color: el tono nunca va solo. */}
              <span style={{ color: COLOR_NIVEL[alerta.nivel] }}>{PALABRA_NIVEL[alerta.nivel]}</span>
              {" · "}{alerta.titulo}
            </p>
            {alerta.detalle && (
              <p style={{ margin: "3px 0 0", fontSize: "12.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.66)" }}>
                {alerta.detalle}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="fae-det-cuerpo">
        {/* ── Cifras clave. En móvil, rejilla 2×2 compacta. ── */}
        <div className="fae-det-cifras">
          <div><p style={rotulo}>FP TOTAL</p><p style={cifra}>{e.fp_total}</p></div>
          <div><p style={rotulo}>FP ESTE CICLO</p><p style={{ ...cifra, color: FAE.teal }}>{e.fp_ciclo}</p></div>
          <div>
            <p style={rotulo}>ACIERTO EVALUATIVAS</p>
            <p style={cifra}>
              {e.pct_evaluativa === null || e.pct_evaluativa === undefined
                ? "—"
                : `${Math.round(Number(e.pct_evaluativa))}%`}
            </p>
          </div>
          <div>
            <p style={rotulo}>POSICIÓN</p>
            <p style={cifra}>{posicion ? `#${posicion}` : "—"}</p>
          </div>
        </div>

        {/* ── Historial agrupado por actividad ── */}
        <div style={{ minWidth: 0 }}>
          <p style={{ ...rotulo, margin: "0 0 8px" }}>HISTORIAL POR ACTIVIDAD</p>

          {historial === null && !errorHist && (
            <p style={{ margin: 0, fontSize: "12.5px", color: "rgba(248,249,250,0.5)" }}>Cargando…</p>
          )}

          {errorHist && (
            <p style={{ margin: 0, fontSize: "12.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.55)" }}>
              El historial detallado no está disponible todavía. Las cifras de la izquierda sí.
            </p>
          )}

          {historial && historial.length === 0 && !errorHist && (
            <p style={{ margin: 0, fontSize: "12.5px", color: "rgba(248,249,250,0.5)" }}>
              Sin actividades registradas en esta materia.
            </p>
          )}

          {historial && historial.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
              {historial.map((h) => (
                <div
                  key={h.activity_id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0,1fr) auto auto",
                    gap: "10px",
                    alignItems: "baseline",
                    padding: "7px 0",
                    borderBottom: "1px solid rgba(248,249,250,0.07)",
                  }}
                >
                  <span style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.82)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {nombreDeActividad(h.activity_id) ?? h.activity_id}
                    {/* El "×3" va apagado y pequeño: es un matiz, no una insignia. */}
                    {h.intentos > 1 && (
                      <span style={{ marginLeft: "6px", fontSize: "10.5px", color: "rgba(248,249,250,0.4)", fontVariantNumeric: "tabular-nums" }}>
                        ×{h.intentos}
                      </span>
                    )}
                  </span>
                  <span style={{ fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: FAE.text, whiteSpace: "nowrap" }}>
                    {h.mejor_pct === null || h.mejor_pct === undefined
                      ? `${h.mejor_fp} FP`
                      : `${Math.round(Number(h.mejor_pct))}%`}
                  </span>
                  <span style={{ fontSize: "11.5px", color: "rgba(248,249,250,0.45)", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                    {fecha(h.ultimo_intento)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
