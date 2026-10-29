import { useMemo, useState } from "react";
import { FAE } from "../../theme.js";
import { BANDAS, CORTE_BAJO, bandaDe } from "../../docente/bandas.js";
import { ORDENES, ordenar, porCuadrante } from "../../docente/esfuerzoResultado.js";
import { V1, notaV1, tarjetaV1, tituloBloque } from "./estiloV1.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ESFUERZO CONTRA RESULTADO
 *
 * El único gráfico de la primera pantalla, y está aquí porque dice algo que
 * ninguna lista ordenada por nota puede decir: separa al que dedica horas y no
 * entiende del que acierta sin dedicar ninguna. Son dos problemas opuestos y
 * la nota los pinta igual.
 *
 * ═══════════ LAS TRES REGLAS QUE CUMPLE ═══════════
 *
 *   1. TODA CIFRA LLEVA SU n. El encabezado dice sobre cuántos se dibuja y
 *      cuántos quedaron fuera. Un gráfico de cuatro puntos no es una
 *      tendencia y el profesor tiene derecho a saberlo de un vistazo.
 *
 *   2. LO NO MEDIDO SE DICE. Quien no tiene acierto o tiempo no se dibuja en
 *      el origen —eso sería afirmar que sacó 0 en 0 segundos— sino que sale
 *      listado aparte, con su razón. Es el error que la propia documentación
 *      de MindTap admite: sus gráficos omiten en silencio a quien nunca
 *      entró, que es justo a quien más urge ver.
 *
 *   3. EL GRÁFICO NO ES LA ÚNICA INTERFAZ. Anthology reconoce por escrito que
 *      el diagrama de Blackboard no funciona con lectores de pantalla, y como
 *      el gráfico ES su interfaz, quien no puede leerlo pierde el panel. Aquí
 *      la tabla de abajo tiene exactamente los mismos datos, se ordena, y es
 *      la que lee un lector de pantalla: el SVG es un adorno informativo con
 *      un resumen hablado, nunca el único camino.
 *
 * NINGÚN NÚMERO SE ANIMA: los puntos aparecen con el bloque y se quedan
 * quietos. Un punto que se desliza hasta su sitio hace dudar de dónde está.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* El lienzo. viewBox fijo y ancho al 100 %: el mismo dibujo a 320 y a 1024. */
const W = 320;
const H = 206;
/* El margen inferior deja sitio a dos renglones: la unidad del eje y,
 * debajo, el rótulo de la mediana. Con la letra a 12 no caben en uno. */
const M = { izq: 40, der: 12, arr: 12, abajo: 40 };

const colorDe = (acierto) => BANDAS.find((b) => b.id === bandaDe(acierto))?.color ?? V1.texto2;

function Dispersion({ medidos, medianaMs, comparable }) {
  const maxSeg = Math.max(60, ...medidos.map((m) => m.segundos)) * 1.08;
  const x = (seg) => M.izq + (seg / maxSeg) * (W - M.izq - M.der);
  const y = (pct) => M.arr + (1 - Math.min(100, Math.max(0, pct)) / 100) * (H - M.arr - M.abajo);

  const resumen = `Dispersión de ${medidos.length} estudiantes: tiempo medio por actividad en el eje horizontal y acierto en el vertical.`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label={resumen}
      style={{ display: "block", overflow: "visible", marginTop: "4px" }}
      data-dispersion={medidos.length}
    >
      {/* Rejilla horizontal: 0, 60 y 100. Tres líneas, no diez: lo demás es ruido. */}
      {[0, CORTE_BAJO, 100].map((v) => (
        <g key={v}>
          <line x1={M.izq} x2={W - M.der} y1={y(v)} y2={y(v)} stroke={v === CORTE_BAJO ? "rgba(248,249,250,0.28)" : "rgba(248,249,250,0.12)"} strokeWidth="1" strokeDasharray={v === CORTE_BAJO ? "4 4" : undefined} />
          <text x={M.izq - 6} y={y(v) + 4} textAnchor="end" fontSize="12" fill={V1.texto2}>{v}%</text>
        </g>
      ))}

      {/* La mediana del grupo: el «mucho tiempo» solo significa algo comparado con los compañeros. */}
      {comparable && medianaMs !== null && (
        <g>
          <line x1={x(medianaMs / 1000)} x2={x(medianaMs / 1000)} y1={M.arr} y2={H - M.abajo} stroke="rgba(248,249,250,0.28)" strokeWidth="1" strokeDasharray="4 4" />
          <text x={x(medianaMs / 1000)} y={H - M.abajo + 32} textAnchor="middle" fontSize="12" fill={V1.texto2}>
            media de la clase
          </text>
        </g>
      )}

      {/* Los ejes, con su unidad escrita. Un eje sin unidad obliga a adivinar. */}
      <line x1={M.izq} x2={W - M.der} y1={H - M.abajo} y2={H - M.abajo} stroke="rgba(248,249,250,0.25)" strokeWidth="1" />
      <text x={M.izq} y={H - M.abajo + 14} fontSize="12" fill={V1.texto2}>0 s</text>
      <text x={W - M.der} y={H - M.abajo + 14} textAnchor="end" fontSize="12" fill={V1.texto2}>{Math.round(maxSeg)} s por actividad</text>

      {medidos.map((m) => (
        <circle
          key={m.user_id}
          cx={x(m.segundos)}
          cy={y(m.acierto)}
          r="5"
          fill={colorDe(m.acierto)}
          fillOpacity="0.85"
          stroke={FAE.bg}
          strokeWidth="1"
        >
          <title>{`${m.nombre}: ${Math.round(m.acierto)}% de acierto en ${m.segundos}s de media`}</title>
        </circle>
      ))}
    </svg>
  );
}

/*
 * Cuántas filas se enseñan sin pedirlo. Ocho y no todas: en el resumen, una
 * tabla de treinta nombres empuja el resto de la pantalla fuera de la vista y
 * convierte la columna de al lado en un bloque de fondo vacío. Las que más
 * importan están arriba, que para eso se ordena.
 */
export const FILAS_VISIBLES = 8;

export default function EsfuerzoResultado({ datos, onAbrir, className, style }) {
  const [orden, setOrden] = useState(ORDENES[0].id);
  const [cuadrante, setCuadrante] = useState(null);
  const [todas, setTodas] = useState(false);
  const { medidos, noMedidos, medianaMs, comparable } = datos;

  const cuentas = useMemo(() => porCuadrante(medidos), [medidos]);
  const filas = useMemo(() => {
    const base = cuadrante ? medidos.filter((m) => m.cuadrante?.id === cuadrante) : medidos;
    return ordenar(base, orden);
  }, [medidos, cuadrante, orden]);

  if (medidos.length === 0 && noMedidos.length === 0) return null;

  const elegido = cuentas.find((c) => c.id === cuadrante) ?? null;

  return (
    <section className={className} style={{ ...tarjetaV1, ...style }} data-bloque="esfuerzo">
      <h2 style={tituloBloque}>Esfuerzo y resultado</h2>
      <p style={notaV1}>
        {medidos.length === 0
          ? "Todavía no hay nadie con tiempo y acierto medidos."
          : `${medidos.length} ${medidos.length === 1 ? "estudiante" : "estudiantes"} con las dos cosas medidas${noMedidos.length > 0 ? `; ${noMedidos.length} sin medir` : ""}. Arriba a la derecha, quien trabaja y le sale; abajo a la derecha, quien le dedica tiempo y aun así falla.`}
      </p>

      {medidos.length > 0 && <Dispersion medidos={medidos} medianaMs={medianaMs} comparable={comparable} />}

      {!comparable && medidos.length > 0 && (
        <p style={{ ...notaV1, marginTop: "8px" }} data-sin-mediana>
          Con este número de estudiantes no se dibuja la media de la clase: todavía no significa nada.
        </p>
      )}

      {/*
       * Los cuadrantes como filtro, no como etiqueta en el dibujo. A 320 px
       * cuatro rótulos dentro del gráfico no caben, y puestos aquí hacen algo:
       * tocar uno deja en la tabla exactamente a esas personas.
       */}
      {medidos.length > 0 && (
        <div role="group" aria-label="Filtrar por situación" style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "12px" }}>
          {cuentas.filter((c) => c.n > 0).map((c) => {
            const activo = cuadrante === c.id;
            return (
              <button
                key={c.id}
                type="button"
                className="pd1-toque pd1-foco"
                aria-pressed={activo}
                data-cuadrante={c.id}
                onClick={() => setCuadrante(activo ? null : c.id)}
                style={{
                  padding: "0 12px", borderRadius: "999px", cursor: "pointer",
                  background: activo ? "rgba(248,249,250,0.14)" : "transparent",
                  border: `1px solid rgba(248,249,250,${activo ? 0.34 : 0.18})`,
                  color: FAE.text, fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 600,
                }}
              >
                {c.nombre} · {c.n}
              </button>
            );
          })}
        </div>
      )}

      {elegido && <p style={{ ...notaV1, marginTop: "8px" }} data-explica-cuadrante>{elegido.explica}</p>}

      {/* La tabla. Es la fuente, no el resumen del gráfico. */}
      {medidos.length > 0 && (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginTop: "12px" }}>
            <label htmlFor="pd2-orden" style={{ ...notaV1, fontSize: "12.5px" }}>Ordenar por</label>
            <select
              id="pd2-orden"
              className="pd1-foco"
              value={orden}
              onChange={(ev) => setOrden(ev.target.value)}
              data-orden
              style={{
                minHeight: "44px", padding: "0 10px", borderRadius: "10px",
                background: "rgba(248,249,250,0.06)", border: "1px solid rgba(248,249,250,0.2)",
                color: FAE.text, fontFamily: "Inter, sans-serif", fontSize: "13px",
              }}
            >
              {ORDENES.map((o) => <option key={o.id} value={o.id} style={{ color: "#111" }}>{o.texto}</option>)}
            </select>
          </div>

          <ul style={{ listStyle: "none", margin: "10px 0 0", padding: 0 }} data-tabla-esfuerzo={filas.length}>
            {(todas ? filas : filas.slice(0, FILAS_VISIBLES)).map((m) => (
              <li key={m.user_id} style={{ borderTop: "1px solid rgba(248,249,250,0.08)" }}>
                <button
                  type="button"
                  className="pd1-toque pd1-foco"
                  onClick={() => onAbrir?.(m.user_id)}
                  data-fila-esfuerzo={m.user_id}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "8px 2px",
                    background: "transparent", border: "none", cursor: "pointer", color: FAE.text, textAlign: "left",
                  }}
                >
                  <span aria-hidden="true" style={{ flexShrink: 0, width: "10px", height: "10px", borderRadius: "999px", background: colorDe(m.acierto) }} />
                  <span className="pd1-nombre" style={{ flex: 1, fontSize: "14px" }}>{m.nombre}</span>
                  <span style={{ flexShrink: 0, fontSize: "13px", fontVariantNumeric: "tabular-nums", color: V1.texto2 }}>
                    {Math.round(m.acierto)}% · {m.segundos}s
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {filas.length > FILAS_VISIBLES && (
            <button
              type="button"
              className="pd1-toque pd1-foco"
              onClick={() => setTodas((v) => !v)}
              data-ver-todas-filas
              aria-expanded={todas}
              style={{
                marginTop: "4px", padding: "0 2px", background: "transparent", border: "none", cursor: "pointer",
                color: FAE.text, fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600,
                textDecorationLine: "underline", textUnderlineOffset: "3px", textDecorationColor: "rgba(248,249,250,0.35)",
              }}
            >
              {todas ? "Ver solo los primeros" : `Ver ${filas.length - FILAS_VISIBLES} más`}
            </button>
          )}
        </>
      )}

      {/*
       * Los no medidos, siempre a la vista. Esta es la parte que los
       * competidores se callan, y es la que más urge: quien no ha hecho nada
       * no sale en ningún promedio y por eso se vuelve invisible.
       */}
      {noMedidos.length > 0 && (
        <div style={{ marginTop: "14px", paddingTop: "10px", borderTop: "1px solid rgba(248,249,250,0.12)" }} data-no-medidos={noMedidos.length}>
          <p style={{ margin: "0 0 6px", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 700, color: FAE.text }}>
            Sin medir ({noMedidos.length})
          </p>
          <p style={{ ...notaV1, marginBottom: "6px" }}>No entran en el gráfico ni en ningún promedio. No es un cero: es que no hay dato.</p>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {noMedidos.map((n) => (
              <li key={n.user_id} style={{ borderTop: "1px solid rgba(248,249,250,0.08)" }}>
                <button
                  type="button"
                  className="pd1-toque pd1-foco"
                  onClick={() => onAbrir?.(n.user_id)}
                  data-sin-medir={n.user_id}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "8px 2px", background: "transparent", border: "none", cursor: "pointer", color: FAE.text, textAlign: "left" }}
                >
                  <span className="pd1-nombre" style={{ flex: 1, fontSize: "14px" }}>{n.nombre}</span>
                  <span className="pd1-dos" style={{ flexShrink: 0, maxWidth: "52%", fontSize: "12px", color: V1.texto2, textAlign: "right" }}>{n.razon}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
