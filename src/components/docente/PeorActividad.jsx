import { ChevronRight } from "lucide-react";
import { FAE } from "../../theme.js";
import { V1, tarjetaV1, tituloBloque, notaV1, enlaceV1 } from "./estiloV1.js";

/*
 * B3 · «Actividad con peor resultado» (Ukyo §4, salida 2 que decidió Yujiro):
 * ¿qué enseñé que no cayó? Entre las seis actividades más hechas por la
 * cohorte, la de menor acierto medio con al menos 5 que la terminaron. Las
 * cifras son las de panel_actividad, las mismas de la tarjeta de rendimiento.
 * Se dice en pantalla que es «entre las 6 más hechas».
 */
export default function PeorActividad({ estado, singular, onAbrir, onVerTodas }) {
  const { cargando, peor, nMirables } = estado;
  return (
    <section className="pd1-entrar" style={{ ...tarjetaV1, animationDelay: "160ms" }} data-bloque="b3" aria-labelledby="pd1-b3" aria-describedby="pd1-b3-nota" aria-busy={cargando || undefined}>
      <h2 id="pd1-b3" style={tituloBloque}>La actividad que más costó</h2>
      {/* Ukyo §4: honesto con lo que mira (salida 2). Va para el lector; el texto a la vista es el de Katsumi. */}
      <span id="pd1-b3-nota" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>Entre las seis actividades más hechas.</span>
      {cargando ? (
        <div aria-hidden="true" data-esqueleto style={{ minHeight: "60px" }}>
          <div className="pd1-esqueleto" style={{ height: "18px", width: "70%" }} />
          <div className="pd1-esqueleto" style={{ height: "28px", width: "60%", marginTop: "10px" }} />
        </div>
      ) : peor ? (
        <button
          type="button"
          onClick={() => onAbrir(peor.id)}
          data-peor={peor.id}
          aria-label={`${peor.nombre}, ${peor.tema}: acierto medio ${Math.round(peor.cifras.pct)}%, ${peor.cifras.terminaron} la terminaron. Ver la actividad`}
          style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", alignItems: "center", gap: "8px", width: "100%", minHeight: "60px", padding: 0, textAlign: "left", background: "transparent", border: "none", color: "inherit", cursor: "pointer", font: "inherit" }}
        >
          <span style={{ display: "grid", minWidth: 0 }}>
            <span className="pd1-nombre" title={peor.nombre} style={{ fontFamily: "Sora, sans-serif", fontSize: "15px", fontWeight: 600, color: FAE.text }}>
              {peor.nombre} <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 400, color: V1.texto2 }}>· {peor.tema}</span>
            </span>
            <span style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "4px 8px", marginTop: "2px" }}>
              <span style={{ fontFamily: "Sora, sans-serif", fontSize: "26px", fontWeight: 700, lineHeight: 1.15, fontVariantNumeric: "tabular-nums", color: FAE.text }} data-cifra="peor-pct">
                {Math.round(peor.cifras.pct)}%
              </span>
              <span style={{ fontSize: "13px", color: V1.texto2 }}>Acierto medio</span>
              <span style={{ fontSize: "14px", color: FAE.text }} data-cifra="peor-terminaron">· {peor.cifras.terminaron} la terminaron</span>
            </span>
          </span>
          <ChevronRight size={18} aria-hidden="true" color={V1.texto2} />
        </button>
      ) : singular ? (
        /* completaron cuenta estudiantes distintos (0024: count(*) de por_alumno): con uno solo, el umbral de 5 no llega nunca. */
        <p style={notaV1} data-sin-datos>Con un solo estudiante todavía no hay con quién comparar.</p>
      ) : nMirables === 0 ? (
        <p style={notaV1} data-sin-datos>Aún no hay suficientes datos</p>
      ) : (
        <div data-sin-datos>
          <p style={{ ...notaV1, color: FAE.text }}>Aún no hay suficientes datos</p>
          <p style={notaV1}>Sale cuando cinco terminen la misma actividad.</p>
        </div>
      )}
      <button type="button" style={enlaceV1} onClick={onVerTodas} data-ver-actividades>Ver todas las actividades</button>
    </section>
  );
}
