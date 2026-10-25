import { FAE } from "../../../../../theme.js";
import { HAZ_INICIAL, responderHaz, hazResuelto, mostrarCorrecto } from "../../../../secuencia/secuencia.js";
import { SORA, INTER, SECUNDARIO, NAVY, RIEL, HUNDIDO, REPOSO, ACIERTO, FANTASMA, estiloC2, CURVA } from "../../tema1/registro.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T1 · LAS PIEZAS COMUNES DE LAS FIGURAS DE LA SECUENCIA (lote 6, Célula B).
 *
 * Una figura de T1 es, de arriba abajo, el riel de la pieza (30 px) y el
 * escenario (el resto de la reserva de la pieza). Lo que se toca vive dentro
 * de la figura: `SecuenciaAprender` solo da «Anterior» y «Siguiente».
 *
 * La reserva es la misma en todas las pantallas de una pieza (D5): cada
 * escenario ocupa el alto que le da la secuencia y su contenido no lo empuja.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export { SORA, INTER, SECUNDARIO, NAVY, RIEL, CURVA };

export const CSS_FIGURAS_T1 = `
@keyframes fae-t1s-nodo { from { opacity: 0; transform: scale(.6); } to { opacity: 1; transform: none; } }
@keyframes fae-t1s-aparece { from { opacity: 0; } to { opacity: 1; } }
.fae-t1s-nodo { animation: fae-t1s-nodo 240ms ${CURVA} both; }
.fae-t1s-aparece { animation: fae-t1s-aparece 240ms ${CURVA} both; }
.fae-t1s-forma { animation: fae-t1s-aparece 500ms ${CURVA} both; }
@media (prefers-reduced-motion: reduce) { .fae-t1s-nodo, .fae-t1s-aparece, .fae-t1s-forma { animation: none !important; } }
`;

/*
 * El riel: las cinco estaciones del ciclo como una fila de nodos unidos por
 * un trazo, y la vuelta del 5 al 1 por encima. Va `aria-hidden`: lo que dice
 * lo dice el titular (Mai §2). Sin nombres: el nombre de la estación
 * encendida es el titular de la pantalla.
 *
 *   nodos     false: la vía sin nodos (R10 de la predicción).
 *   encendidos cuántos nodos van encendidos, de la izquierda.
 *   duda      el número del nodo que lleva un signo de pregunta.
 *   vuelta    "tenue" | "solida".
 *   entran    los nodos entran con escala, de a 60 ms (la respuesta de la predicción).
 */
/* El riel mide 24 y deja 8 hasta el escenario: con la reserva de 184 de Mai, el escenario es de 152. */
export const ALTO_RIEL = 24;
export function Riel({ nodos = true, encendidos = 0, duda = null, vuelta = "tenue", entran = false }) {
  const xs = [10, 30, 50, 70, 90];
  return (
    <svg data-riel data-encendidos={encendidos} data-vuelta={vuelta} viewBox="0 0 100 30" preserveAspectRatio="none"
      aria-hidden="true" style={{ display: "block", flex: "none", width: "100%", height: `${ALTO_RIEL}px`, overflow: "visible" }}>
      {/* La vuelta: sube del 5, cruza por arriba y baja al 1. */}
      <path d="M 90 14 L 90 3 L 10 3 L 10 14" fill="none" vectorEffect="non-scaling-stroke"
        stroke={vuelta === "solida" ? FAE.text : "rgba(184,196,212,.35)"} strokeWidth={vuelta === "solida" ? 2 : 1.5}
        strokeDasharray={vuelta === "solida" ? "none" : "3 3"} className={vuelta === "solida" ? "fae-t1s-aparece" : undefined} />
      {/* La vía, de nodo a nodo. */}
      <line x1="10" y1="20" x2="90" y2="20" vectorEffect="non-scaling-stroke" stroke={nodos ? RIEL : "rgba(184,196,212,.35)"} strokeWidth="2" />
      {nodos && xs.map((x, k) => {
        const n = k + 1;
        const on = n <= encendidos;
        return (
          <g key={n} data-nodo={n} data-encendido={on ? "si" : "no"}
            className={entran ? "fae-t1s-nodo" : undefined}
            style={entran ? { animationDelay: `${k * 60}ms`, transformOrigin: `${x}% 66%`, transformBox: "fill-box" } : undefined}>
            <ellipse cx={x} cy="20" rx="2.6" ry="7" vectorEffect="non-scaling-stroke"
              fill={on ? FAE.text : "#0E1B2E"} stroke={on ? FAE.text : RIEL} strokeWidth="2" />
            {duda === n && <text x={x} y="23" textAnchor="middle" fontSize="9" fill={FAE.text} style={{ fontFamily: SORA, fontWeight: 700 }}>?</text>}
          </g>
        );
      })}
    </svg>
  );
}

/*
 * El escenario: donde está la forma. Llena el resto de la reserva. `plano`:
 * sin fondo ni relleno, cuando la forma trae su propia tarjeta (la factura
 * llena los 144 de Mai) o cuando el ancho hace falta entero (la rejilla 2×2).
 */
export function Escenario({ children, centrado = false, plano = false }) {
  return (
    <div data-escenario style={{
      ...(plano ? {} : HUNDIDO), flex: 1, minHeight: 0, boxSizing: "border-box", padding: plano ? 0 : "6px 8px",
      display: "flex", flexDirection: "column", gap: "8px", justifyContent: centrado ? "center" : "flex-start",
      overflow: "hidden",
    }}>
      {children}
    </div>
  );
}

/* El marco de una figura de T1: riel arriba (si la pieza lo lleva) y escenario debajo. */
export function MarcoFigura({ riel = null, children }) {
  return (
    <div data-figura-t1 style={{ height: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
      <style>{CSS_FIGURAS_T1}</style>
      {riel}
      {children}
    </div>
  );
}

/* Un texto corto dentro del escenario (lo que revela un toque, la respuesta de la predicción). */
export function Nota({ children, ...resto }) {
  return (
    <p {...resto} className="fae-t1s-aparece" style={{ margin: 0, fontFamily: INTER, fontSize: "13px", lineHeight: "18px", color: FAE.text }}>
      {children}
    </p>
  );
}

/*
 * Las opciones de una parada, EN FILA (Mai §2.1.3): apiladas, a 320 la
 * tercera nacía detrás del bloque pegado. Rótulos cortos, de dos renglones
 * como mucho.
 */
export function Fila({ opciones, estadoDe = () => REPOSO, onElegir, activa = true, data = "data-opcion" }) {
  return (
    <div role="group" style={{ display: "grid", gridTemplateColumns: `repeat(${opciones.length}, minmax(0, 1fr))`, gap: "6px" }}>
      {opciones.map((o) => {
        const estado = estadoDe(o.id);
        return (
          <button
            key={o.id}
            type="button"
            {...{ [data]: o.id }}
            data-estado={estado}
            aria-disabled={!activa || undefined}
            onClick={() => activa && onElegir(o.id)}
            style={{
              minWidth: 0, minHeight: "44px", padding: "4px 6px", borderRadius: "10px", boxSizing: "border-box",
              fontFamily: INTER, fontSize: "13px", fontWeight: 600, lineHeight: "16px", color: FAE.text,
              cursor: activa ? "pointer" : "default", overflowWrap: "anywhere",
              ...estiloC2(estado),
            }}
          >
            {o.texto}
          </button>
        );
      })}
    </div>
  );
}

/*
 * ═══════════ LA PARADA CALIFICADA (Haz, C2 de enganche.md) ═══════════
 *
 * Primer error: lo tocado queda como fantasma y sale la pista. Segundo error:
 * se enciende la correcta con el porqué de lo elegido, y «Siguiente» se
 * libera. Un acierto libera en el acto. El estado es JSON (se guarda en la
 * pestaña): `{ intentos, ok, ultimo, elegidas }`.
 */
export const PARADA_INICIAL = { ...HAZ_INICIAL, elegidas: [] };
export const paradaResuelta = hazResuelto;

export function responderParada(estado, id, correcta) {
  const e = estado ?? PARADA_INICIAL;
  if (hazResuelto(e)) return e;
  return { ...responderHaz(e, id === correcta), elegidas: [...(e.elegidas ?? []), id] };
}

/* El estado de cada botón de la parada. */
export function estadoEnParada(estado, correcta) {
  const e = estado ?? PARADA_INICIAL;
  const ultima = e.elegidas?.[e.elegidas.length - 1];
  return (id) => {
    if (e.ok && id === correcta) return ACIERTO;
    if (mostrarCorrecto(e) && id === correcta) return ACIERTO;
    if (!e.ok && id === ultima) return FANTASMA;
    return REPOSO;
  };
}

/*
 * La devolución de la parada, compacta para caber en el escenario: la misma
 * pastilla que `Veredicto` de la secuencia («Correcto» en blanco, «No va
 * aquí» en coral, nunca teal ni ámbar) y debajo la pista o el porqué, en
 * Inter 13/18. Lleva `data-mensaje` para la sonda de enganche.
 */
export function DevolucionParada({ estado, pista, porqueDe, acierto = null }) {
  const e = estado ?? PARADA_INICIAL;
  if (!e.ultimo) return null;
  const ultima = e.elegidas?.[e.elegidas.length - 1];
  const ok = e.ultimo === "acierto";
  const color = ok ? FAE.text : FAE.coral;
  const texto = ok ? acierto : mostrarCorrecto(e) ? porqueDe(ultima) : pista;
  return (
    <div data-devolucion-parada data-mensaje={ok ? "acierto" : "error"} role="status">
      <span style={{
        display: "inline-flex", alignItems: "center", gap: "6px", padding: "2px 9px", borderRadius: "999px",
        border: `2px solid ${color}`, color, fontFamily: INTER, fontSize: "13px", fontWeight: 600, lineHeight: "18px",
      }}>
        <span aria-hidden="true">{ok ? "✓" : "✕"}</span>{ok ? "Correcto" : "No va aquí"}
      </span>
      {texto && <p style={{ margin: "4px 0 0", fontFamily: INTER, fontSize: "13px", lineHeight: "18px", color: "rgba(248,249,250,0.85)" }}>{texto}</p>}
    </div>
  );
}
