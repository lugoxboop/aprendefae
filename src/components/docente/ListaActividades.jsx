import { ChevronRight } from "lucide-react";
import { FAE } from "../../theme.js";
import { ordenPeorPrimero } from "../../docente/panelV1.js";
import VistaRendimiento from "./VistaRendimiento.jsx";
import { V1, tituloBloque, notaV1, volverV1 } from "./estiloV1.js";

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
      <section data-vista="actividad" data-actividad={actual.id}>
        <button type="button" style={volverV1} onClick={() => onElegir(null)} data-volver>‹ Todas las actividades</button>
        <VistaRendimiento key={`${subjectId}:${actual.id}`} subjectId={subjectId} nombreMateria={nombreMateria} actividad={actual} />
      </section>
    );
  }
  const ordenadas = ordenPeorPrimero(filas);
  return (
    <section data-vista="actividades" aria-labelledby="pd1-actividades" aria-busy={cargando || undefined}>
      <button type="button" style={volverV1} onClick={onVolver} data-volver>‹ Volver al resumen</button>
      {/*
        * Tres columnas de cifras junto al nombre; por debajo de 360 px las cifras
        * bajan bajo el nombre, para que este quepa en dos renglones (Shibukawa, #498).
        */}
      <style>{`.pd1-act { grid-template-columns: minmax(0,1fr) 46px 62px 14px; }
@media (max-width: 359px) {
  .pd1-act { grid-template-columns: auto auto minmax(0,1fr) 14px; }
  .pd1-act > :first-child { grid-column: 1 / 4; }
  .pd1-act > [data-cifra] { text-align: left !important; }
  .pd1-act > [data-cifra=acierto]::after { content: " acierto ·"; color: #A8B6C8; font-family: Inter, sans-serif; font-size: 12px; }
  .pd1-act > [data-cifra=terminaron]::after { content: " terminaron"; color: #A8B6C8; font-family: Inter, sans-serif; font-size: 12px; }
  .pd1-act > svg { grid-row: 1 / 3; grid-column: 4; }
  .pd1-act-cab { display: none !important; }
}`}</style>
      <h2 id="pd1-actividades" style={{ ...tituloBloque, fontSize: "18px" }}>Actividades</h2>
      <p style={{ ...notaV1, marginBottom: "12px" }}>
        Solo las que otorgan FP; la teoría no deja registro. La de peor acierto, primero.
      </p>
      <div className="pd1-act pd1-act-cab" style={{ display: "grid", gap: "8px", padding: "0 12px 6px", fontSize: "12px", color: V1.texto2 }} aria-hidden="true">
        <span>Actividad</span><span style={{ textAlign: "right" }}>Acierto</span><span style={{ textAlign: "right" }}>Terminaron</span><span />
      </div>
      <div style={{ display: "grid", gap: "8px" }}>
        {ordenadas.map((f) => {
          const c = f.cifras;
          const pct = c?.pct === null || c?.pct === undefined ? "—" : `${Math.round(c.pct)}%`;
          const term = !c ? "…" : c.de ? `${c.terminaron} de ${c.de}` : `${c.terminaron}`;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onElegir(f.id)}
              data-fila-actividad={f.id}
              aria-label={`${f.nombre}, ${f.tema}: acierto ${pct}, terminaron ${term}. Ver la actividad`}
              title={f.nombre}
              className="pd1-act"
              style={{
                display: "grid", alignItems: "center", gap: "8px",
                width: "100%", minHeight: "52px", padding: "6px 12px", borderRadius: "10px", textAlign: "left",
                background: V1.tarjeta, border: V1.borde, color: "inherit", cursor: "pointer", font: "inherit",
              }}
            >
              <span style={{ display: "grid", minWidth: 0 }}>
                <span className="pd1-dos" style={{ fontSize: "13.5px", lineHeight: 1.3, fontWeight: 600, color: FAE.text }} data-nombre-actividad>{f.nombre}</span>
                <span className="pd1-nombre" style={{ fontSize: "12px", color: V1.texto2 }}>{f.tema}</span>
              </span>
              <span style={{ textAlign: "right", fontFamily: "Sora, sans-serif", fontSize: "14px", fontVariantNumeric: "tabular-nums", color: FAE.text }} data-cifra="acierto">{pct}</span>
              <span style={{ textAlign: "right", fontFamily: "Sora, sans-serif", fontSize: "14px", fontVariantNumeric: "tabular-nums", color: FAE.text }} data-cifra="terminaron">{term}</span>
              <ChevronRight size={16} aria-hidden="true" color={V1.texto2} />
            </button>
          );
        })}
      </div>
    </section>
  );
}
