/*
 * MACRO 2026 · El carrito de la economía y sus cuatro manos (A1 y H1).
 *
 * Dibujos propios de las piezas nuevas (no son íconos del camino ni del sitio).
 * Cada mano: su ícono, su letra y su color (colores-da.js). El carrito apila
 * los bloques C, I, G y XN; un XN negativo se dibuja BAJO la línea del carrito
 * con borde punteado (A1 P3), y el carrito entero baja con él.
 */
import { COMPONENTES, GRIS, INK, INK_2 } from "./colores-da.js";
import { useAncho } from "./ui.jsx";
import { ILUSTRADOS, rutaIlustrado } from "./ilustrados.jsx";

/* Los íconos de las manos, en una caja de 40 × 32. */
export function IconoMano({ id, size = 40 }) {
  const c = COMPONENTES[id].color;
  const s = { fill: "none", stroke: c, strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" };
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 40 32" aria-hidden="true">
      {id === "C" && (/* familia con bolsa */
        <g {...s}>
          <circle cx="9" cy="7" r="3.2" /><path d="M4 26v-9a5 5 0 0 1 10 0v9" />
          <circle cx="19" cy="11" r="2.4" /><path d="M15.5 26v-6a3.5 3.5 0 0 1 7 0v6" />
          <path d="M26 15h10l-1.5 12h-7z" /><path d="M28.5 15v-2.5a2.5 2.5 0 0 1 5 0V15" />
        </g>
      )}
      {id === "I" && (/* empresa con grúa */
        <g {...s}>
          <path d="M8 29V5h2v24" /><path d="M9 5h24" /><path d="M9 9l6-4" /><path d="M29 5v7" />
          <rect x="25" y="12" width="8" height="6" /><path d="M3 29h34" /><rect x="16" y="20" width="9" height="9" />
        </g>
      )}
      {id === "G" && (/* Gobierno con una vía */
        <g {...s}>
          <path d="M6 12l14-7 14 7z" /><path d="M9 13v8M15 13v8M25 13v8M31 13v8" /><path d="M6 22h28" />
          <path d="M14 30l3-6M26 30l-3-6M20 30v-2M20 26v-1" />
        </g>
      )}
      {id === "XN" && (/* puerto con dos barcos */
        <g {...s}>
          <path d="M2 14h14l-2.5 5h-9z" /><path d="M6 14v-4h5v4" /><path d="M13 9l5 0" />
          <path d="M22 24h14l-2.5 5h-9z" /><path d="M26 24v-4h5v4" /><path d="M20 22l-4 0" />
          <path d="M2 30c3-2 6 2 9 0s6 2 9 0" />
        </g>
      )}
    </svg>
  );
}

/**
 * El carrito. `valores` = {C, I, G, XN} en unidades libres; `escala` = px por
 * unidad. Los bloques se APILAN desde el fondo de la cesta (C, I, G, XN); un
 * XN negativo cuelga bajo la línea con borde punteado y el carrito baja con él.
 * `onAgarre`: si viene, el borde superior de cada bloque se arrastra para
 * encogerlo (A1 P4), con teclado también.
 */
export function Carrito({ valores, alto = 180, escala = 0.4, total = null, sacude = 0, resaltar = null, onAgarre = null, etiqueta = "DA" }) {
  const [ref, ancho] = useAncho(288);
  const orden = ["C", "I", "G", "XN"];
  const suma = orden.reduce((s, k) => s + (valores[k] ?? 0), 0);
  const neg = Math.min(0, valores.XN ?? 0) * escala;   /* px que cuelgan bajo la línea */
  const baja = Math.min(16, -neg * 0.5);               /* el carrito baja con el negativo */
  const piso = alto - 40 + baja;
  /* El carrito ilustrado (Gemini, 25-nov; diagnostico-visual.md, familia 4),
   * 496 × 360, de rejilla abierta: los bloques van DETRÁS y los alambres los
   * cruzan por delante. Fondo de la cesta en y .64; cesta útil de x .27 a .87. */
  const [cw, ch] = ILUSTRADOS["carrito-mercado"];
  const IW = Math.min(ancho - 4, ((piso - 2) / 0.64) * (cw / ch)), IH = (IW * ch) / cw, imgX = (ancho - IW) / 2, imgY = piso - 0.64 * IH;
  const bx = imgX + 0.27 * IW, bw = 0.6 * IW;             /* bloques; a su derecha, la letra */
  const altoSvg = Math.max(alto, Math.ceil(imgY + IH + 2));
  let y = piso;
  const bloques = orden.map((k) => {
    const v = valores[k] ?? 0;
    const h = Math.abs(v) * escala;
    if (v >= 0) { y -= h; return { k, v, y, h }; }
    return { k, v, y: piso, h };
  });
  const tope = Math.min(piso, ...bloques.filter((b) => b.v >= 0).map((b) => b.y));
  return (
    <div ref={ref} style={{ width: "100%" }}>
    <svg viewBox={`0 0 ${ancho} ${altoSvg}`} width="100%" height={altoSvg} role="img" aria-label={`Carrito de la demanda agregada: total ${Math.round(total ?? suma)}`} data-carrito data-total={Math.round(total ?? suma)}>
      <g className={sacude ? "da26-sacude" : ""} key={sacude}>
        {bloques.map((b) => (
          <g key={b.k} data-bloque={b.k} data-valor={Math.round(b.v)} opacity={resaltar && resaltar !== b.k ? 0.4 : 1}>
            {b.h > 0.5 && (
              <rect
                className="da26-entra"
                x={bx} y={b.y} width={bw} height={Math.max(2, b.h)} rx={3}
                fill={b.v >= 0 ? COMPONENTES[b.k].color : "transparent"}
                stroke={b.v >= 0 ? "#0E1B2E" : GRIS} strokeWidth={b.v >= 0 ? 1 : 2} strokeDasharray={b.v >= 0 ? undefined : "5 4"}
              />
            )}
            {onAgarre && b.v > 0 && (
              <g
                role="slider" tabIndex={0} aria-label={`Borde de ${COMPONENTES[b.k].nombre}. Flechas para encogerlo o agrandarlo.`}
                aria-valuetext={String(Math.round(b.v))} data-borde={b.k}
                style={{ cursor: "ns-resize", touchAction: "none", WebkitUserSelect: "none", userSelect: "none" }}
                onPointerDown={(e) => { if (e.button !== 0) return; e.currentTarget.setPointerCapture?.(e.pointerId); onAgarre.inicio(b.k, e.clientY); }}
                onPointerMove={(e) => { if (e.currentTarget.hasPointerCapture?.(e.pointerId)) onAgarre.mover(b.k, e.clientY); }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown" || e.key === "ArrowLeft") { e.preventDefault(); onAgarre.tecla(b.k, -10); }
                  if (e.key === "ArrowUp" || e.key === "ArrowRight") { e.preventDefault(); onAgarre.tecla(b.k, 10); }
                }}
              >
                <rect x={bx} y={b.y - 22} width={bw} height={44} fill="transparent" />
                <rect x={bx + bw / 2 - 18} y={b.y - 3} width={36} height={6} rx={3} fill={INK} stroke="#0E1B2E" strokeWidth={1.5} />
              </g>
            )}
          </g>
        ))}
        <g className="da26-trans">
          <image href={rutaIlustrado("carrito-mercado")} x={imgX} y={imgY} width={IW} height={IH} data-carrito-ilustrado style={{ pointerEvents: "none" }} />
        </g>
        {/* Las letras van encima de los alambres para leerse. */}
        {bloques.map((b) => b.h > 0.5 && (
          <text key={`l${b.k}`} x={bx + bw + 8} y={b.y + Math.max(b.h, 12) / 2 + 5} fontSize={13} fontWeight={700} fill={b.v >= 0 ? INK : INK_2}
            stroke="#0E1B2E" strokeWidth={3} paintOrder="stroke" opacity={resaltar && resaltar !== b.k ? 0.4 : 1} data-letra={b.k}>
            {COMPONENTES[b.k].letra}
          </text>
        ))}
        <g data-nivel-da>
          <line x1={bx - 6} y1={tope} x2={bx + bw + 4} y2={tope} stroke={INK} strokeWidth={1.5} strokeDasharray="2 3" />
          <text x={ancho - 4} y={14} textAnchor="end" fontSize={14} fontWeight={700} fill={INK}>{etiqueta}{total != null ? ` = ${Math.round(total)}` : ""}</text>
        </g>
      </g>
    </svg>
    </div>
  );
}
