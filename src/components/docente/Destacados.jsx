import { useState } from "react";
import { FAE } from "../../theme.js";
import { ICONOS } from "../shared/Medalla.jsx";
import {
  destacadosDe, detalleMotivo, ETIQUETA_MOTIVO, UMBRALES_DESTACADO,
} from "../../docente/destacados.js";

/*
 * ÍTEM 2 — Destacados.
 *
 * El panel solo avisaba de riesgo y nunca señalaba a quien va bien. Esto es la
 * otra mitad.
 *
 * ═══════════ POR QUÉ TEAL Y NUNCA CORAL NI ÁMBAR ═══════════
 *
 * En todo el sitio coral y ámbar significan "mira esto, algo pasa". Usarlos
 * aquí haría que un docente leyera un logro como un problema durante el medio
 * segundo que tarda en llegar al texto. El teal ya es el color de lo que va
 * bien —los aciertos, los nodos completados, el grupo propio— y esta sección
 * hereda ese significado en vez de inventarse uno.
 *
 * ═══════════ EL ICONO ES EL MISMO, LITERALMENTE ═══════════
 *
 * Se importa ICONOS.tendencia del kit de medallas: el mismo dibujo que llevan
 * "Progreso constante" y "Desempeño sostenido". No una copia parecida — la
 * misma función. Así un estudiante que ve su medalla y un docente que ve esta
 * sección reconocen el mismo símbolo, y nadie puede cambiar uno sin cambiar el
 * otro.
 *
 * ═══════════ SEPARADA DE LAS ALERTAS, NO MEZCLADA ═══════════
 *
 * Va en su propia sección y nunca dentro del bloque de riesgo. Un logro entre
 * avisos se lee como un aviso más.
 *
 * ═══════════ EN MÓVIL ═══════════
 *
 * Las tarjetas pasan a una columna y los distintivos se envuelven bajo el
 * nombre en vez de empujarlo. Se mantiene el tope de tres visibles: en una
 * pantalla de teléfono, cinco tarjetas ya son un scroll entero antes de llegar
 * a las alertas, que es lo que el docente vino a ver.
 */

const CSS = `
@keyframes fae-de-entrar { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.fae-de-entrar { animation: fae-de-entrar 180ms ease-out both; }
@media (prefers-reduced-motion: reduce) { .fae-de-entrar { animation: none !important; } }
`;

function IconoTendencia({ tamano = 20, color = FAE.teal }) {
  /* viewBox 40×40, que es el que usan los iconos del kit de medallas. */
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 40 40" aria-hidden="true" style={{ flexShrink: 0 }}>
      {ICONOS.tendencia(color)}
    </svg>
  );
}

export default function Destacados({ estudiantes }) {
  const [expandido, setExpandido] = useState(false);
  const filas = destacadosDe(estudiantes);

  /*
   * VACÍO HONESTO. En una semana sin actividad las tres señales quedan vacías
   * y no se pinta un hueco con guiones: se dice lo que pasa. Bajar los
   * umbrales para que la sección se vea llena sería premiar a cualquiera.
   */
  if (filas.length === 0) {
    return (
      <section style={{ marginBottom: "28px" }}>
        <style>{CSS}</style>
        <Titulo />
        <div style={{ padding: "14px 16px", borderRadius: "14px", background: "rgba(248,249,250,0.03)", border: "1px solid rgba(248,249,250,0.1)", maxWidth: "62ch" }}>
          <p style={{ margin: 0, fontSize: "13.5px", lineHeight: 1.6, color: "rgba(248,249,250,0.6)" }}>
            Todavía no hay nada que destacar esta semana. Aparecerá gente aquí en cuanto
            alguien encabece el ciclo, acierte de forma sostenida o entre varios días seguidos.
          </p>
        </div>
      </section>
    );
  }

  const tope = UMBRALES_DESTACADO.visiblesPorDefecto;
  const visibles = expandido ? filas : filas.slice(0, tope);
  const ocultos = filas.length - visibles.length;

  return (
    <section className="fae-de-entrar" style={{ marginBottom: "28px" }}>
      <style>{CSS}</style>
      <Titulo />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px" }}>
        {visibles.map(({ estudiante: e, motivos }) => (
          <div
            key={e.user_id}
            style={{
              padding: "12px 14px",
              borderRadius: "13px",
              background: "rgba(42,157,143,0.07)",
              border: `1px solid ${FAE.teal}44`,
              minWidth: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "9px", minWidth: 0 }}>
              <IconoTendencia />
              <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 600, color: FAE.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {e.full_name || e.nickname}
              </p>
            </div>
            {/* Los distintivos se envuelven bajo el nombre: en móvil no lo empujan. */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "9px" }}>
              {motivos.map((m) => (
                <span
                  key={m}
                  style={{
                    padding: "3px 9px", borderRadius: "999px",
                    background: `${FAE.teal}1f`, border: `1px solid ${FAE.teal}55`,
                    color: "#3FA69A", fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700,
                    letterSpacing: "0.03em", whiteSpace: "nowrap",
                  }}
                  title={detalleMotivo(m, e)}
                >
                  {ETIQUETA_MOTIVO[m]}
                </span>
              ))}
            </div>
            <p style={{ margin: "8px 0 0", fontSize: "12px", lineHeight: 1.45, color: "rgba(248,249,250,0.6)" }}>
              {motivos.map((m) => detalleMotivo(m, e)).join(" · ")}
            </p>
          </div>
        ))}
      </div>

      {ocultos > 0 && (
        <button
          type="button"
          onClick={() => setExpandido(true)}
          style={{
            marginTop: "10px", fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 600,
            minHeight: "44px", padding: "0 14px", borderRadius: "999px", cursor: "pointer",
            background: "transparent", border: `1px solid ${FAE.teal}55`, color: "#3FA69A",
          }}
        >
          Ver los {ocultos} restantes
        </button>
      )}
      {expandido && filas.length > tope && (
        <button
          type="button"
          onClick={() => setExpandido(false)}
          style={{
            marginTop: "10px", fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 600,
            minHeight: "44px", padding: "0 14px", borderRadius: "999px", cursor: "pointer",
            background: "transparent", border: "1px solid rgba(248,249,250,0.25)", color: "rgba(248,249,250,0.7)",
          }}
        >
          Ver solo los primeros {tope}
        </button>
      )}
    </section>
  );
}

function Titulo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "9px", margin: "0 0 12px" }}>
      <span style={{ width: "3px", height: "16px", borderRadius: "2px", background: FAE.teal, flexShrink: 0 }} />
      <h2 style={{ fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", color: "#3FA69A", margin: 0 }}>
        DESTACADOS
      </h2>
    </div>
  );
}
