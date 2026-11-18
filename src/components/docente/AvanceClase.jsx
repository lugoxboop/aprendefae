import { Kpi } from "./VistaDocente.jsx";
import { V1 } from "./estiloV1.js";

/*
 * El avance por tema, en su vista (18 nov.). Las mismas cifras que el
 * desplegable de «Mi clase» (ResumenClase): cuántos terminaron y cuántos
 * empezaron cada tema, con la barra de los que terminaron. Arriba, las tres
 * cifras de la clase en fichas.
 */
export default function AvanceClase({ avance, activos, nCohorte, singular, porTema, pctEval, nEval }) {
  return (
    <div data-avance-por-tema>
      <div className="pdv-kpis">
        <Kpi i={0} rotulo={singular ? "Avance" : "Avance de la clase"} valor={<span data-cifra="avance">{avance === null ? "—" : `${Math.round(avance)}%`}</span>} pie="Actividades hechas" />
        <Kpi
          i={1} rotulo="Activos esta semana"
          valor={<span data-cifra="activos">{activos}<span style={{ fontSize: "16px", color: V1.texto2 }}> de {nCohorte}</span></span>}
          pie={singular ? "Tu estudiante" : "Estudiantes de tu grupo"}
        />
        <Kpi
          i={2} rotulo="Acierto evaluativas"
          valor={<span data-cifra="acierto-evaluativas">{pctEval === null ? "—" : `${Math.round(pctEval)}%`}</span>}
          pie={nEval === 0 ? "Nadie ha hecho evaluativas aún" : `${nEval} ${nEval === 1 ? "estudiante" : "estudiantes"}`}
        />
      </div>

      <p className="pdv-seccion">Tema por tema</p>
      <div style={{ display: "grid", gap: "8px" }}>
        {porTema.map((t, k) => {
          const pct = nCohorte ? (t.terminaron / nCohorte) * 100 : 0;
          const empezado = t.iniciaron > 0;
          return (
            <div
              key={t.id}
              data-tema={t.id}
              className="pdv-entra"
              style={{
                "--i": k, padding: "14px 16px", borderRadius: "16px",
                background: empezado ? "rgba(248,249,250,0.045)" : "rgba(248,249,250,0.02)",
                border: `1px solid ${empezado ? "rgba(var(--tono-rgb), 0.22)" : "rgba(248,249,250,0.07)"}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "12px", marginBottom: "10px" }}>
                <p style={{ margin: 0, minWidth: 0, fontFamily: "Sora, sans-serif", fontSize: "14.5px", fontWeight: 600, color: empezado ? "#F8F9FA" : "rgba(248,249,250,0.6)" }}>
                  <span style={{ color: "var(--tono-claro)", marginRight: "8px", fontVariantNumeric: "tabular-nums" }}>{k + 1}</span>
                  {t.titulo}
                </p>
                <span style={{ flexShrink: 0, fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: empezado ? "#F8F9FA" : "rgba(248,249,250,0.5)" }}>
                  {Math.round(pct)}%
                </span>
              </div>
              <div className="pdv-barra" aria-hidden="true"><span style={{ width: `${pct}%` }} /></div>
              <p style={{ margin: "8px 0 0", fontSize: "12.5px", color: V1.texto2, fontVariantNumeric: "tabular-nums" }} data-cifra-tema={t.id}>
                {t.terminaron} completo · {t.iniciaron} iniciado
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
