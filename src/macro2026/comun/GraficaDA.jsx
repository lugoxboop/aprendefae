/*
 * ═══════════════════════════════════════════════════════════════════════════
 * MACRO 2026 · LA GRÁFICA DE LA DEMANDA AGREGADA (A5, H3, H6)
 *
 * SVG con viewBox = el ancho real de la tarjeta en px (ResizeObserver): así un
 * rótulo de 12 en el código mide 12 px en pantalla a cualquier ancho, que es lo
 * que pide §0 («rótulos ≥ 12 px a 320 px»). Alto: 220 px cuando la tarjeta es
 * de teléfono pequeño (320) y 250 desde 375.
 *
 * Eje vertical «DA», horizontal «Y». Y de 0 a 2.000 (§A5). Lo que se sale del
 * área se recorta (clipPath), nunca desborda la tarjeta.
 *
 * Asas arrastrables (H3, y el punto de A5 P1): Pointer Events con
 * setPointerCapture, `touch-action: none` SOLO sobre el asa (la página sigue
 * desplazándose con el dedo en el resto), zona táctil de 48 px aunque el
 * dibujo sea de 16, y teclado: cada asa es role="slider" con flechas.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useId, useRef } from "react";
import { BORDE, GRIS, INK, INK_2 } from "./colores-da.js";
import { fmtEntero } from "./modelo-da.js";
import { useAncho } from "./ui.jsx";
import { Pizarra } from "./ilustrados.jsx";

export const Y_MAX = 2000;
export const DA_MAX = 2500;
const M = { izq: 42, der: 14, arr: 14, aba: 30 };

export const altoGrafica = (ancho) => (ancho < 300 ? 220 : 250);

function escalas(ancho, alto, yMax, daMax) {
  const w = ancho - M.izq - M.der;
  const h = alto - M.arr - M.aba;
  const x = (Y) => M.izq + (Y / yMax) * w;
  const y = (DA) => M.arr + (1 - DA / daMax) * h;
  const daDeY = (py) => (1 - (py - M.arr) / h) * daMax;
  const yDeX = (px) => ((px - M.izq) / w) * yMax;
  return { x, y, daDeY, yDeX, w, h };
}

const ESTILO = {
  actual: { stroke: INK, width: 3, dash: null },
  fantasma: { stroke: INK_2, width: 2, dash: "6 5" },
  estudiante: { stroke: INK, width: 3, dash: null },
  punteada: { stroke: INK_2, width: 2, dash: "3 5" },
  real: { stroke: INK, width: 3, dash: null },
};

/** Un asa que se arrastra en vertical: devuelve el DA bajo el puntero. */
function Asa({ cx, cy, forma, etiqueta, valorTexto, onArrastre, onTecla, sc }) {
  const ref = useRef(null);
  const mover = (e) => {
    const svg = ref.current?.ownerSVGElement;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const escala = r.height / svg.viewBox.baseVal.height || 1;
    onArrastre(sc.daDeY((e.clientY - r.top) / escala));
  };
  return (
    <g
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label={etiqueta}
      aria-valuetext={valorTexto}
      data-asa={forma}
      style={{ cursor: "grab", touchAction: "none", WebkitUserSelect: "none", userSelect: "none" }}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.currentTarget.setPointerCapture?.(e.pointerId);
        mover(e);
      }}
      onPointerMove={(e) => { if (e.currentTarget.hasPointerCapture?.(e.pointerId)) mover(e); }}
      onKeyDown={(e) => {
        if (e.key === "ArrowUp" || e.key === "ArrowRight") { e.preventDefault(); onTecla(1); }
        if (e.key === "ArrowDown" || e.key === "ArrowLeft") { e.preventDefault(); onTecla(-1); }
      }}
    >
      <circle cx={cx} cy={cy} r={24} fill="transparent" />
      {forma === "rombo"
        ? <rect x={cx - 8} y={cy - 8} width={16} height={16} transform={`rotate(45 ${cx} ${cy})`} fill={INK} stroke="#0E1B2E" strokeWidth={2} />
        : <circle cx={cx} cy={cy} r={8} fill={INK} stroke="#0E1B2E" strokeWidth={2} />}
    </g>
  );
}

export default function GraficaDA({
  lineas = [],
  bisectriz = false,
  y0 = null,
  meta = null,
  marcas = false,
  punto = null,
  asas = null,
  yMax = Y_MAX,
  daMax = DA_MAX,
  titulo = "Gráfica de la demanda agregada",
}) {
  const [ref, ancho] = useAncho(288);
  const alto = altoGrafica(ancho);
  const sc = escalas(ancho, alto, yMax, daMax);
  const clip = `da26-clip-${useId().replace(/:/g, "")}`;
  const ptRef = useRef(null);

  const recta = (l) => {
    const e = ESTILO[l.estilo ?? "actual"];
    return (
      <line
        key={l.id}
        data-recta={l.id}
        x1={sc.x(0)} y1={sc.y(l.arranque)} x2={sc.x(yMax)} y2={sc.y(l.arranque + l.pendiente * yMax)}
        stroke={e.stroke} strokeWidth={e.width} strokeDasharray={e.dash ?? undefined} strokeLinecap="round"
      />
    );
  };

  const principal = lineas.find((l) => (l.estilo ?? "actual") !== "fantasma" && l.estilo !== "punteada") ?? lineas[0];
  const ticksY = [0, 1000, 2000];
  const ticksDA = [0, 1000, 2000];

  return (
    <Pizarra>
    <div ref={ref} style={{ width: "100%" }} data-grafica>
      <svg viewBox={`0 0 ${ancho} ${alto}`} width={ancho} height={alto} role="img" aria-label={titulo} style={{ width: "100%", height: `${alto}px` }}>
        <defs>
          <clipPath id={clip}><rect x={M.izq} y={M.arr - 2} width={sc.w + 2} height={sc.h + 2} /></clipPath>
        </defs>
        {/* Ejes */}
        <line x1={M.izq} y1={M.arr} x2={M.izq} y2={M.arr + sc.h} stroke={BORDE} strokeWidth={1.5} />
        <line x1={M.izq} y1={M.arr + sc.h} x2={M.izq + sc.w} y2={M.arr + sc.h} stroke={BORDE} strokeWidth={1.5} />
        {ticksY.map((t) => (
          <text key={`ty${t}`} x={sc.x(t)} y={alto - 14} fontSize={12} fill={INK_2} textAnchor={t === 0 ? "start" : t === yMax ? "end" : "middle"} className="da26-mono">{fmtEntero(t)}</text>
        ))}
        {ticksDA.map((t) => (
          <text key={`td${t}`} x={M.izq - 4} y={sc.y(t) + 4} fontSize={12} fill={INK_2} textAnchor="end" className="da26-mono">{fmtEntero(t)}</text>
        ))}
        <text x={M.izq + 4} y={M.arr + 4} fontSize={13} fontWeight={700} fill={INK}>DA</text>
        <text x={M.izq + sc.w} y={M.arr + sc.h - 6} fontSize={13} fontWeight={700} fill={INK} textAnchor="end">Y</text>

        <g clipPath={`url(#${clip})`}>
          {bisectriz && (
            <g data-bisectriz>
              <line x1={sc.x(0)} y1={sc.y(0)} x2={sc.x(yMax)} y2={sc.y(yMax)} stroke={GRIS} strokeWidth={1.5} />
            </g>
          )}
          {lineas.map(recta)}
        </g>
        {bisectriz && (
          <text x={sc.x(yMax) - 2} y={sc.y(yMax) - 6} fontSize={12} fill={INK_2} textAnchor="end">Y = DA</text>
        )}

        {/* El equilibrio: el cruce y su marca en el eje. */}
        {y0 != null && y0 >= 0 && y0 <= yMax && (
          <g data-y0={Math.round(y0)}>
            <line x1={sc.x(y0)} y1={sc.y(y0)} x2={sc.x(y0)} y2={M.arr + sc.h} stroke={INK_2} strokeDasharray="3 4" strokeWidth={1.5} />
            <circle cx={sc.x(y0)} cy={sc.y(y0)} r={5} fill={INK} />
            <rect x={sc.x(y0) - 5} y={M.arr + sc.h - 5} width={10} height={10} fill={INK} />
            <text x={sc.x(y0)} y={M.arr + sc.h - 10} fontSize={12} fontWeight={700} fill={INK} textAnchor={sc.x(y0) > ancho - 50 ? "end" : "middle"}>Y₀</text>
          </g>
        )}

        {/* La banderita de la meta, sobre el eje Y (H6). */}
        {meta != null && (
          <g data-meta={meta}>
            <line x1={sc.x(meta)} y1={M.arr + sc.h} x2={sc.x(meta)} y2={M.arr + sc.h - 34} stroke={INK} strokeWidth={2} />
            <path d={`M${sc.x(meta)} ${M.arr + sc.h - 34} l16 5 l-16 5 z`} fill={INK} />
            <text x={sc.x(meta) + (sc.x(meta) > ancho - 70 ? -4 : 18)} y={M.arr + sc.h - 25} fontSize={12} fontWeight={700} fill={INK} textAnchor={sc.x(meta) > ancho - 70 ? "end" : "start"}>Meta</text>
          </g>
        )}

        {/* Las dos perillas de A5 P2: el arranque y la inclinación. */}
        {marcas && principal && (
          <g data-marcas>
            <rect x={sc.x(0) - 7} y={sc.y(principal.arranque) - 7} width={14} height={14} transform={`rotate(45 ${sc.x(0)} ${sc.y(principal.arranque)})`} fill={INK} />
            <text x={sc.x(0) + 12} y={sc.y(principal.arranque) + 18} fontSize={12} fontWeight={700} fill={INK}>Ā − b·i</text>
            <path
              d={`M${sc.x(800)} ${sc.y(principal.arranque + principal.pendiente * 800)} L${sc.x(1400)} ${sc.y(principal.arranque + principal.pendiente * 800)} L${sc.x(1400)} ${sc.y(principal.arranque + principal.pendiente * 1400)}`}
              fill="none" stroke={INK_2} strokeWidth={1.5} strokeDasharray="4 3"
            />
            <text x={sc.x(1400) + 6} y={sc.y(principal.arranque + principal.pendiente * 1100) + 4} fontSize={12} fontWeight={700} fill={INK}>c(1 − t)</text>
          </g>
        )}

        {/* El punto que se arrastra sobre la recta (A5 P1). */}
        {punto && principal && (() => {
          const Y = punto.Y;
          const DA = principal.arranque + principal.pendiente * Y;
          const moverX = (e) => {
            const svg = ptRef.current?.ownerSVGElement;
            if (!svg) return;
            const r = svg.getBoundingClientRect();
            const escala = r.width / ancho || 1;
            const nuevo = Math.max(0, Math.min(yMax, sc.yDeX((e.clientX - r.left) / escala)));
            punto.onCambio(Math.round(nuevo / 50) * 50);
          };
          const izquierda = sc.x(Y) > ancho - 120;
          return (
            <g>
              <line x1={sc.x(Y)} y1={sc.y(DA)} x2={sc.x(Y)} y2={M.arr + sc.h} stroke={INK_2} strokeDasharray="3 4" />
              <line x1={M.izq} y1={sc.y(DA)} x2={sc.x(Y)} y2={sc.y(DA)} stroke={INK_2} strokeDasharray="3 4" />
              <text x={sc.x(Y) + (izquierda ? -12 : 12)} y={sc.y(DA) - 10} fontSize={12} fill={INK} textAnchor={izquierda ? "end" : "start"} className="da26-mono" data-lectura>
                Y {fmtEntero(Y)} · DA {fmtEntero(DA)}
              </text>
              <g
                ref={ptRef}
                role="slider"
                tabIndex={0}
                aria-label="Punto sobre la recta. Flechas para moverlo."
                aria-valuetext={`Y ${fmtEntero(Y)}, DA ${fmtEntero(DA)}`}
                data-asa="punto"
                style={{ cursor: "grab", touchAction: "none", WebkitUserSelect: "none", userSelect: "none" }}
                onPointerDown={(e) => { if (e.button !== 0) return; e.currentTarget.setPointerCapture?.(e.pointerId); moverX(e); }}
                onPointerMove={(e) => { if (e.currentTarget.hasPointerCapture?.(e.pointerId)) moverX(e); }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); punto.onCambio(Math.min(yMax, Y + 50)); }
                  if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); punto.onCambio(Math.max(0, Y - 50)); }
                }}
              >
                <circle cx={sc.x(Y)} cy={sc.y(DA)} r={24} fill="transparent" />
                <circle cx={sc.x(Y)} cy={sc.y(DA)} r={9} fill={INK} stroke="#0E1B2E" strokeWidth={2} />
              </g>
            </g>
          );
        })()}

        {/* Las asas de H3: rombo en el arranque (desplaza), círculo al final (gira). */}
        {asas && (
          <>
            <Asa
              sc={sc} forma="rombo" cx={sc.x(0)} cy={sc.y(asas.arranque)}
              etiqueta="Rombo del arranque: arriba o abajo desplaza la recta."
              valorTexto={`Arranque ${fmtEntero(asas.arranque)}`}
              onArrastre={(da) => asas.onArranque(Math.max(0, Math.min(daMax * 0.6, da)))}
              onTecla={(d) => asas.onArranque(Math.max(0, Math.min(daMax * 0.6, asas.arranque + d * 25)))}
            />
            <Asa
              sc={sc} forma="circulo" cx={sc.x(yMax)} cy={sc.y(asas.arranque + asas.pendiente * yMax)}
              etiqueta="Círculo del extremo: arriba o abajo gira la recta."
              valorTexto={`Inclinación ${asas.pendiente.toFixed(2).replace(".", ",")}`}
              onArrastre={(da) => asas.onPendiente(Math.max(0.05, Math.min(1, (Math.min(daMax, da) - asas.arranque) / yMax)))}
              onTecla={(d) => asas.onPendiente(Math.max(0.05, Math.min(1, asas.pendiente + d * 0.02)))}
            />
          </>
        )}
      </svg>
    </div>
    </Pizarra>
  );
}
