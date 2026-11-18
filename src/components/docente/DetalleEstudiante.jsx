import { useEffect, useState } from "react";
import { FAE } from "../../theme.js";
import { NIVEL, alertasDe } from "../../docente/alertas.js";
import { historialDe } from "../../docente/datos.js";
import { nombreDeActividad } from "../../data/subjects.js";
import MarcaNivel, { NIVEL_MARCA } from "./MarcaNivel.jsx";
import { MOTIVO_CORTO } from "../../docente/panelV1.js";
import { Kpi } from "./VistaDocente.jsx";

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


const COLOR_NIVEL = {
  /* Panel v1 (P6): sin coral; el nivel alto lo dicen la forma y la palabra. */
  [NIVEL.URGENTE]: FAE.text,
  [NIVEL.ATENCION]: FAE.ambar,
  [NIVEL.INFO]: FAE.teal,
};
const MARCA_NIVEL = {
  [NIVEL.URGENTE]: NIVEL_MARCA.URGENTE,
  [NIVEL.ATENCION]: NIVEL_MARCA.ATENCION,
  [NIVEL.INFO]: NIVEL_MARCA.INFO,
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

  const pct = (v) => (v === null || v === undefined ? null : Math.round(Number(v)));
  const pctEval = pct(e.pct_evaluativa);
  const pctExpl = !Number(e.n_exploratorias) ? null : pct(e.pct_exploratoria);

  return (
    <div>
      {alerta && (
        <div
          style={{
            display: "flex", alignItems: "flex-start", gap: "12px",
            padding: "14px 16px", borderRadius: "16px", marginBottom: "16px",
            background: `${COLOR_NIVEL[alerta.nivel]}14`,
            border: `1px solid ${COLOR_NIVEL[alerta.nivel]}55`,
          }}
        >
          <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", flexShrink: 0, borderRadius: "10px", background: `${COLOR_NIVEL[alerta.nivel]}22` }}>
            <MarcaNivel nivel={MARCA_NIVEL[alerta.nivel]} tamano={14} />
          </span>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 600, color: FAE.text }}>
              {/* La palabra del nivel acompaña al color: el tono nunca va solo. */}
              <span style={{ color: COLOR_NIVEL[alerta.nivel] }}>{PALABRA_NIVEL[alerta.nivel]}</span>
              {/* El motivo de textos.md, el mismo de B2 (Shibukawa, #525): una regla, un nombre. alertas.js no cambia. */}
              {" · "}{MOTIVO_CORTO[alerta.titulo] ?? alerta.titulo}
            </p>
            {alerta.detalle && (
              <p style={{ margin: "3px 0 0", fontSize: "13px", lineHeight: 1.5, color: "rgba(248,249,250,0.7)" }}>
                {alerta.detalle}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Las cifras, en fichas: lo que antes era una columna de rótulos. ── */}
      <div className="pdv-kpis" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(46%, 210px), 1fr))" }}>
        <Kpi i={0} rotulo="FP total" valor={e.fp_total} />
        {/* En neutro (Shibukawa, #525): en Contabilidad el teal es el debe. */}
        <Kpi i={1} rotulo="FP este ciclo" valor={e.fp_ciclo} />
        <Kpi i={2} rotulo="Acierto evaluativas" valor={pctEval === null ? "—" : `${pctEval}%`} />
        <Kpi i={3} rotulo="Evaluativas hechas" valor={<span data-cifra="n-evaluativas">{Number(e.n_evaluativas ?? 0)}</span>} />
        <Kpi
          i={4} rotulo="Acierto exploratorias"
          valor={<span data-cifra="pct-exploratoria" style={{ color: "rgba(248,249,250,0.8)" }}>{pctExpl === null ? "—" : `${pctExpl}%`}</span>}
          pie={pctExpl === null ? null : `${Number(e.n_exploratorias)} hechas · no mide dominio`}
        />
        <Kpi i={5} rotulo="Tiempo medio" valor={<span data-cifra="duracion">{e.duracion_media_ms === null || e.duracion_media_ms === undefined ? "—" : `${Math.round(Number(e.duracion_media_ms) / 1000)} s`}</span>} />
        <Kpi i={6} rotulo="Posición" valor={posicion ? `#${posicion}` : "—"} />
      </div>

      {/* ── Historial agrupado por actividad ── */}
      <p className="pdv-seccion">Historial por actividad</p>

      {historial === null && !errorHist && (
        <p style={{ margin: 0, fontSize: "13px", color: "rgba(248,249,250,0.55)" }}>Cargando…</p>
      )}

      {errorHist && (
        <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.5, color: "rgba(248,249,250,0.6)" }}>
          El historial detallado no está disponible todavía. Las cifras de arriba sí.
        </p>
      )}

      {historial && historial.length === 0 && !errorHist && (
        <p style={{ margin: 0, fontSize: "13px", color: "rgba(248,249,250,0.55)" }}>
          Sin actividades registradas en esta materia.
        </p>
      )}

      {historial && historial.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))", gap: "8px" }}>
          {historial.map((h, k) => {
            const p = pct(h.mejor_pct);
            return (
              <div
                key={h.activity_id}
                className="pdv-entra"
                style={{ "--i": k, padding: "12px 14px", borderRadius: "14px", background: "rgba(248,249,250,0.035)", border: "1px solid rgba(248,249,250,0.08)", minWidth: 0 }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                  <span style={{ flex: 1, minWidth: 0, fontSize: "13.5px", fontWeight: 600, color: "rgba(248,249,250,0.9)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {nombreDeActividad(h.activity_id) ?? h.activity_id}
                  </span>
                  <span style={{ flexShrink: 0, fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: FAE.text }}>
                    {p === null ? `${h.mejor_fp} FP` : `${p}%`}
                  </span>
                </div>
                {p !== null && <div className="pdv-barra" style={{ marginTop: "8px", height: "5px" }} aria-hidden="true"><span style={{ width: `${p}%` }} /></div>}
                <p style={{ margin: "7px 0 0", fontSize: "12px", color: "rgba(248,249,250,0.55)", fontVariantNumeric: "tabular-nums" }}>
                  {fecha(h.ultimo_intento)}
                  {/* El ×3 va apagado: es un matiz, no una insignia. */}
                  {h.intentos > 1 && <> · {h.intentos} intentos</>}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
