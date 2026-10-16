import { useRef } from "react";
import { C, INTER, MONO, HUNDIDO, REPOSO, ESTADOS, Pastilla, PuntoDelMes, useTrasError } from "./comun.jsx";
import { FEEDBACK } from "../../data/repasoCap5Comun.js";
import { useReducido } from "./movimiento.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * r5-4 · EL CALENDARIO DEL MES (P2 de Itagaki, «Septiembre en Barranquilla»).
 *
 * La figura del mes: 7 columnas y 5 filas, del 1 al 30, sin días de la
 * semana, separación de 2 px, en el hundido. La celda mide (ancho − 12) / 7:
 * 35 px a 320 y 43 a 375; su alto es el mismo (aspect-ratio 1).
 *
 *   · celda: el día en mono 12 #A8B6C8 arriba a la izquierda; abajo, un punto
 *     de 6 px #CBDCF2 por asiento hecho ese día (hasta 3). El día del asiento
 *     en curso, contorno de 2 px #F8F9FA.
 *   · factura: rectángulo de 18 × 10, contorno 1 px #F8F9FA, en su día.
 *   · ventana: del día siguiente a la factura hasta el borde, fondo
 *     rgba(184,196,212,.18); cada tramo por fila con radio 6 y contorno de
 *     1 px rgba(248,249,250,.35). Calificada: 2 px #F8F9FA (acierto) o coral
 *     (error, se queda); a los 0,7 s, la correcta con 2 px #F8F9FA.
 *   · borde arrastrable: barra de 4 px #F8F9FA en el lado derecho de la celda
 *     final, con una perilla de 16 px; área táctil de 44 × 44 centrada en la
 *     perilla. Es un deslizador (role="slider"): flechas ±1 día, arriba y
 *     abajo ±1 semana, Enter es «Comprobar». Tocar un día posterior a la
 *     factura también mueve el borde.
 *   · pago: rectángulo de 18 × 10 relleno #CBDCF2 que cae en su día (24 px
 *     en 260 ms); si cae dentro de la ventana, el contorno late una vez.
 *   · resumen: cada asiento, punto relleno #CBDCF2 si fue correcto o anillo
 *     coral si no, con una sola leyenda.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const AREA_PERILLA = 44;
const CURVA = "cubic-bezier(.3,.9,.4,1)";
const fila = (d) => Math.floor((d - 1) / 7) + 1;
const columna = (d) => ((d - 1) % 7) + 1;

export const CSS_CALENDARIO = `
@keyframes r54-cae { from { transform: translateY(-24px); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes r54-punto { from { transform: translateY(-12px); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes r54-late { 0% { opacity: .6; } 100% { opacity: 1; } }
.r54-cae { animation: r54-cae 260ms ${CURVA} both; }
.r54-punto { animation: r54-punto 200ms ${CURVA} both; }
.r54-late { animation: r54-late 240ms ${CURVA} both; }
[data-perilla]:active [data-perilla-boton] { transform: scale(.96); }
@media (prefers-reduced-motion: reduce) { .r54-cae, .r54-punto, .r54-late { animation: none; } }
`;

/* Los tramos de una ventana [desde, hasta], uno por fila del calendario. */
export function tramos(desde, hasta) {
  const out = [];
  for (let d = desde; d <= hasta; ) {
    const fin = Math.min(hasta, fila(d) * 7);
    out.push([d, fin]);
    d = fin + 1;
  }
  return out;
}

function Tramo({ desde, hasta, borde, relleno, clase, dato }) {
  return (
    <div
      aria-hidden="true"
      data-tramo={dato}
      className={clase}
      style={{
        gridRow: fila(desde), gridColumn: `${columna(desde)} / ${columna(hasta) + 1}`,
        borderRadius: "6px", border: borde, background: relleno ? "rgba(184,196,212,0.18)" : "transparent",
        boxSizing: "border-box", zIndex: 1, pointerEvents: "none",
      }}
    />
  );
}

/*
 * `ventana`: { factura, borde (el correcto), pago } o null.
 * `borde`: el del estudiante (= factura: largo 0). `calif`: null | "ok" | "mal".
 */
export function Calendario({
  mes, dias = 30, marcas = {}, actual = null, nombres = {}, ventana = null, borde = null, onBorde, onComprobar,
  calif = null, resumen = null, etiqueta,
}) {
  const reducido = useReducido();
  const rejilla = useRef(null);
  const revela = useTrasError(calif === "mal");
  const conPerilla = Boolean(ventana) && !calif && Boolean(onBorde);
  const minimo = ventana ? ventana.factura : 0;
  const fijar = (d) => { if (conPerilla && d >= minimo && d <= dias) onBorde(d); };

  /* El día bajo un punto de la pantalla (arrastre). */
  const diaEn = (x, y) => {
    /* La perilla y su área tapan celdas: se busca la celda debajo de todo lo que haya encima. */
    const el = (document.elementsFromPoint?.(x, y) ?? []).find((x) => x.dataset?.dia);
    return el ? Number(el.dataset.dia) : null;
  };
  const arrastrar = (e) => {
    if (!conPerilla || !(e.buttons & 1)) return;
    const d = diaEn(e.clientX, e.clientY);
    if (d) fijar(d);
  };
  const teclas = (e) => {
    if (!conPerilla) return;
    const paso = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 }[e.key];
    if (paso) { e.preventDefault(); fijar(Math.max(minimo, Math.min(dias, borde + paso))); }
    else if (e.key === "Enter" && borde > minimo) { e.preventDefault(); onComprobar?.(); }
  };

  const celdas = [];
  for (let d = 1; d <= dias; d++) {
    const n = marcas[d] ?? 0;
    const delResumen = resumen?.[d] ?? [];
    const nombre = `${d} de ${mes}${nombres[d]?.length ? `: ${nombres[d].join(", ")}` : ""}`;
    celdas.push(
      <div
        key={d}
        data-dia={d}
        data-actual={d === actual ? "si" : undefined}
        role="gridcell"
        aria-label={nombre}
        onClick={() => fijar(d)}
        style={{
          gridRow: fila(d), gridColumn: columna(d), position: "relative", aspectRatio: "1 / 1", minWidth: 0,
          borderRadius: "6px", boxSizing: "border-box", zIndex: 2,
          outline: d === actual ? `2px solid ${C.texto}` : "none", outlineOffset: "-2px",
          cursor: conPerilla && d > minimo ? "pointer" : "default",
        }}
      >
        <span aria-hidden="true" style={{ position: "absolute", top: "3px", left: "4px", fontFamily: MONO, fontVariantNumeric: "tabular-nums", fontSize: "12px", lineHeight: "14px", color: C.apagado }}>{d}</span>
        {ventana && d === ventana.factura && (
          <span data-factura aria-hidden="true" style={{ position: "absolute", left: "50%", bottom: "4px", width: "18px", height: "10px", marginLeft: "-9px", border: `1px solid ${C.texto}`, borderRadius: "2px", boxSizing: "border-box" }} />
        )}
        {ventana && calif && d === ventana.pago && (
          <span data-pago aria-hidden="true" className={reducido ? undefined : "r54-cae"} style={{ position: "absolute", left: "50%", bottom: "4px", width: "18px", height: "10px", marginLeft: "-9px", background: C.hecho, borderRadius: "2px" }} />
        )}
        {(n > 0 || delResumen.length > 0) && (
          <span aria-hidden="true" style={{ position: "absolute", left: "4px", right: "4px", bottom: ventana && (d === ventana.factura || (calif && d === ventana.pago)) ? "16px" : "4px", display: "flex", gap: "2px" }}>
            {resumen
              ? delResumen.slice(0, 3).map((ok, k) => <PuntoDelMes key={k} estado={ok ? "acierto" : "error"} />)
              : Array.from({ length: Math.min(3, n) }, (_, k) => <PuntoDelMes key={k} estado="hecho" clase={reducido ? undefined : "r54-punto"} />)}
          </span>
        )}
      </div>,
    );
  }

  /* La ventana del estudiante y, al calificar, la correcta. */
  const capas = [];
  if (ventana && borde > ventana.factura) {
    const estudiante = calif ? ESTADOS[calif].border : REPOSO;
    const late = calif === "ok" && ventana.pago <= borde && !reducido ? "r54-late" : undefined;
    for (const [a, b] of tramos(ventana.factura + 1, borde)) capas.push(<Tramo key={`e${a}`} desde={a} hasta={b} borde={estudiante} relleno={!calif} clase={late} dato="estudiante" />);
  }
  if (ventana && calif === "mal" && revela) {
    for (const [a, b] of tramos(ventana.factura + 1, ventana.borde)) capas.push(<Tramo key={`c${a}`} desde={a} hasta={b} borde={ESTADOS.revelada.border} relleno={false} dato="correcta" />);
  }

  /* El borde arrastrable: barra de 4 px en el lado derecho de la celda final y la perilla, con su área de 44 × 44. */
  const perilla = conPerilla && (
    <div
      data-perilla
      role="slider"
      tabIndex={0}
      aria-label={etiqueta}
      aria-valuemin={minimo}
      aria-valuemax={dias}
      aria-valuenow={borde}
      aria-valuetext={`Termina el ${borde} de ${mes}`}
      onKeyDown={teclas}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); }}
      onPointerMove={arrastrar}
      style={{
        gridRow: fila(borde), gridColumn: columna(borde), justifySelf: "end", alignSelf: "center",
        position: "relative", width: "4px", height: "100%", background: C.texto, borderRadius: "2px", zIndex: 3, touchAction: "none",
      }}
    >
      <span
        data-perilla-area
        style={{ position: "absolute", left: "50%", top: "50%", width: `${AREA_PERILLA}px`, height: `${AREA_PERILLA}px`, marginLeft: `${-AREA_PERILLA / 2}px`, marginTop: `${-AREA_PERILLA / 2}px`, cursor: "ew-resize" }}
      >
        <span data-perilla-boton style={{ position: "absolute", left: "50%", top: "50%", width: "16px", height: "16px", marginLeft: "-8px", marginTop: "-8px", borderRadius: "50%", background: C.texto }} />
      </span>
    </div>
  );

  return (
    <div data-calendario style={{ ...HUNDIDO, borderRadius: "12px", padding: "10px 0" }}>
      <div
        ref={rejilla}
        role="grid"
        aria-label={etiqueta}
        style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "2px", touchAction: conPerilla ? "none" : undefined }}
      >
        {celdas}
        {capas}
        {perilla}
      </div>
      {ventana && calif && (
        <div data-veredicto-ventana style={{ display: "flex", flexWrap: "wrap", gap: "4px 10px", justifyContent: "flex-end", padding: "8px 8px 0" }}>
          <Pastilla estado={calif} />
          {calif === "mal" && revela && <Pastilla estado="revelada" valor={`${ventana.borde} ${mes.slice(0, 3)}`} />}
        </div>
      )}
      {resumen && (
        <p data-leyenda-mes style={{ margin: "8px 8px 0", display: "flex", gap: "12px", fontFamily: INTER, fontSize: "12px", color: C.atenuado }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><PuntoDelMes estado="acierto" />{FEEDBACK.ok}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><PuntoDelMes estado="error" />{FEEDBACK.mal}</span>
        </p>
      )}
    </div>
  );
}
