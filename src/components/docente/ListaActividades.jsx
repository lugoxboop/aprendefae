import { ChevronRight, ClipboardCheck, ListChecks } from "lucide-react";
import { FAE } from "../../theme.js";
import { ordenPeorPrimero } from "../../docente/panelV1.js";
import VistaRendimiento from "./VistaRendimiento.jsx";
import { V1 } from "./estiloV1.js";
import VistaDocente from "./VistaDocente.jsx";

/*
 * «Actividades» (Ukyo §6.1): todas las actividades con FP de la materia
 * (Hacer y desafío), peor primero, para que coincida con B3. Cada fila, dos
 * cifras: acierto medio y cuántos la terminaron, de panel_actividad, que se
 * pide al entrar a esta vista (no al abrir el panel). Elegir una abre su
 * rendimiento, el de siempre.
 */
export default function ListaActividades({ filas, cargando, elegida, subjectId, nombreMateria, onElegir, onVolver }) {
  const actual = filas.find((f) => f.id === elegida) ?? null;
  if (actual) {
    return (
      <VistaDocente
        vista="actividad" data-vista="actividad" data-actividad={actual.id}
        Glifo={ClipboardCheck} rotulo={actual.tema} titulo={actual.nombre}
        textoVolver="Actividades" onVolver={() => onElegir(null)}
      >
        <VistaRendimiento sinTitulo key={`${subjectId}:${actual.id}`} subjectId={subjectId} nombreMateria={nombreMateria} actividad={actual} />
      </VistaDocente>
    );
  }
  const ordenadas = ordenPeorPrimero(filas);
  return (
    <VistaDocente
      vista="actividades" data-vista="actividades" aria-labelledby="pd1-actividades" aria-busy={cargando || undefined}
      Glifo={ListChecks} rotulo="Resultados" titulo="Actividades" tituloId="pd1-actividades"
      sub="Solo las que otorgan FP; la teoría no deja registro. La de peor acierto, primero: toca una para ver pregunta por pregunta."
      onVolver={onVolver}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))", gap: "10px" }}>
        {ordenadas.map((f, k) => {
          const c = f.cifras;
          const pctNum = c?.pct === null || c?.pct === undefined ? null : Math.round(c.pct);
          const pct = pctNum === null ? "—" : `${pctNum}%`;
          const term = !c ? "…" : c.de ? `${c.terminaron} de ${c.de}` : `${c.terminaron}`;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onElegir(f.id)}
              data-fila-actividad={f.id}
              aria-label={`${f.nombre}, ${f.tema}: acierto ${pct}, terminaron ${term}. Ver la actividad`}
              title={f.nombre}
              className="pdv-fila pdv-entra"
              style={{ "--i": k, alignItems: "stretch", flexDirection: "column", gap: "10px", padding: "14px 16px" }}
            >
              <span style={{ display: "flex", alignItems: "flex-start", gap: "10px", width: "100%" }}>
                <span style={{ display: "grid", flex: 1, minWidth: 0 }}>
                  <span className="pd1-dos" style={{ fontFamily: "Sora, sans-serif", fontSize: "14.5px", lineHeight: 1.3, fontWeight: 600, color: FAE.text }} data-nombre-actividad>{f.nombre}</span>
                  <span className="pd1-nombre" style={{ marginTop: "2px", fontSize: "12px", color: "var(--tono-claro)" }}>{f.tema}</span>
                </span>
                <ChevronRight className="pdv-fila__flecha" size={16} aria-hidden="true" style={{ marginTop: "2px" }} />
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%" }}>
                <span className="pdv-barra" style={{ flex: 1 }} aria-hidden="true"><span style={{ width: `${pctNum ?? 0}%` }} /></span>
                <span style={{ flexShrink: 0, fontFamily: "Sora, sans-serif", fontSize: "15px", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: FAE.text }} data-cifra="acierto">{pct}</span>
              </span>
              <span style={{ fontSize: "12px", color: V1.texto2, fontVariantNumeric: "tabular-nums" }}>
                <span data-cifra="terminaron">{term}</span> la terminaron
              </span>
            </button>
          );
        })}
      </div>
    </VistaDocente>
  );
}
