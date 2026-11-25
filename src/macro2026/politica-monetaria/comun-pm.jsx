/*
 * MACRO 2026 · T4 · lo que comparten varias piezas de Política monetaria:
 * - la cascada de vasos (A3, H2 y, en miniatura, H1);
 * - la gráfica del mercado de dinero (A5, H4);
 * - el tablero de las tres palancas (A6, H5);
 * - el termostato (A7, H5).
 * Movimiento: solo transform y opacity; con movimiento reducido, sin moverse.
 */
import { useRef } from "react";
import { BORDE, FONDO, GRIS, INK, INK_2, SUPERFICIE_2, TINTA_SOBRE_COLOR } from "../comun/colores-da.js";
import { colorRama } from "../comun/ramas.js";
import { ILUSTRADOS, Pizarra, rutaIlustrado } from "../comun/ilustrados.jsx";
import { fmtEntero, fmtDecimal } from "../comun/modelo-da.js";
import { A5, A6, A7, MODELO_DINERO, ORDEN_POSICIONES, PALANCAS, tasaEquilibrio } from "./textos.js";

export const MONETARIA = colorRama("monetaria");
/* Tono cálido de la marca para el termómetro (nunca coral, §2 A7). */
export const CALIDO = "#e9c46a";

export const CSS_PM = `
.pm26-vaso-agua { transform-box: fill-box; transform-origin: bottom; transition: transform 420ms cubic-bezier(.3,.9,.4,1), opacity 280ms linear; }
.pm26-cadena { display: flex; flex-wrap: wrap; gap: 4px 6px; justify-content: center; margin-top: 6px; font: 600 14px/1.3 var(--planck-font-mono, "Geist Mono", ui-monospace, monospace); color: ${INK}; }
.pm26-contador { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; padding: 8px 12px; border-radius: 10px; border: 1px solid ${BORDE}; background: ${FONDO}; font: 600 14px/1.3 var(--planck-font-sans, system-ui, sans-serif); }
.pm26-contador b { font: 700 18px/1.2 var(--planck-font-mono, "Geist Mono", ui-monospace, monospace); font-variant-numeric: tabular-nums; }
.pm26-tablero { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
.pm26-palanca { display: flex; flex-direction: column; gap: 4px; padding: 6px 2px; border-radius: 12px; border: 1px solid ${BORDE}; background: ${FONDO}; }
.pm26-palanca-nombre { min-height: 50px; text-align: center; hyphens: auto; -webkit-hyphens: auto; font: 600 13px/1.25 var(--planck-font-sans, system-ui, sans-serif); color: ${INK}; background: none; border: 0; padding: 0; }
.pm26-pos { min-height: 44px; border-radius: 10px; border: 2px solid ${BORDE}; background: ${SUPERFICIE_2}; color: ${INK}; font: 600 14px/1.1 var(--planck-font-sans, system-ui, sans-serif); cursor: pointer; touch-action: manipulation; }
.pm26-pos[aria-checked="true"] { background: ${MONETARIA}; border-color: ${MONETARIA}; color: ${TINTA_SOBRE_COLOR}; }
.pm26-pos:disabled { cursor: default; }
.pm26-palanca[data-estado="mal"] { border-color: #E76F51; border-width: 2px; }
.pm26-palanca[data-estado="bien"] { border-color: ${INK}; }
.pm26-letrero { display: flex; align-items: center; justify-content: center; gap: 10px; min-height: 52px; margin-bottom: 8px; padding: 6px 10px; border-radius: 12px; border: 2px solid ${BORDE}; font: 700 16px/1.2 var(--planck-font-sans, system-ui, sans-serif); }
.pm26-letrero[data-medida="expansiva"], .pm26-letrero[data-medida="contraccionista"] { border-color: ${MONETARIA}; }
.pm26-aguja { transition: transform 420ms cubic-bezier(.3,.9,.4,1); transform-origin: 22px 22px; }
.pm26-asa { cursor: ew-resize; touch-action: none; }
.pm26-asa:focus-visible { outline: none; }
.pm26-asa:focus-visible .pm26-asa-anillo { stroke: ${INK}; stroke-width: 3; }
.pm26-mercurio { transform-box: fill-box; transform-origin: bottom; transition: transform 900ms cubic-bezier(.3,.9,.4,1); }
.pm26-calor, .pm26-aire { transition: opacity 900ms linear; }
.pm26-brisa { animation: pm26-brisa 1400ms ease-in-out infinite; }
@keyframes pm26-brisa { 0% { opacity: 0; transform: translateY(-4px); } 40% { opacity: .9; } 100% { opacity: 0; transform: translateY(8px); } }
@media (prefers-reduced-motion: reduce) { .pm26-vaso-agua, .pm26-aguja, .pm26-mercurio, .pm26-calor, .pm26-aire { transition: none; } .pm26-brisa { animation: none; opacity: .8; } }
`;

/* ─── La cascada de vasos ─────────────────────────────────────────────── */

/** Los depósitos de la cascada: d₀, d₀(1−r), d₀(1−r)², … (r en %). */
export const depositos = (encajePct, n, d0 = 1000) => Array.from({ length: n }, (_, k) => d0 * (1 - encajePct / 100) ** k);

const VASOS = 7;
/* El frasco de banco ilustrado (Gemini, 25-nov; diagnostico-visual.md, familia 1).
 * Origen 255 × 360. El agua se pinta en vivo DENTRO del vidrio: frasco detrás,
 * agua y encaje en medio, y el mismo frasco encima, translúcido, para que los
 * brillos del vidrio queden por delante del agua. */
export const FRASCO = { src: rutaIlustrado("frasco-banco"), w: ILUSTRADOS["frasco-banco"][0], h: ILUSTRADOS["frasco-banco"][1] };
/* Hueco útil del vidrio, en fracciones del frasco (medido en el WebP). */
const HUECO = { x0: 0.07, x1: 0.93, arriba: 0.27, fondo: 0.83 };
/**
 * `visibles`: cuántos frascos ya recibieron agua. Cada frasco es un banco:
 * muestra su depósito y, en el fondo, la franja del encaje. Los frascos pasan
 * de 7 en «toda la cascada»: el último dibuja lo que queda.
 */
export function Cascada({ encaje, visibles, conEncaje = true, mini = false, etiqueta = null, grifo = false }) {
  const d = depositos(encaje, VASOS);
  const w = 44, h = (w * FRASCO.h) / FRASCO.w, paso = 47, baja = 22;
  const ix0 = w * HUECO.x0, iw = w * (HUECO.x1 - HUECO.x0), iy0 = h * HUECO.arriba, iyF = h * HUECO.fondo, ih = iyF - iy0;
  /* Con grifo: el grifo ilustrado arriba a la izquierda llena el primer frasco. */
  const gw = 46, gh = (gw * ILUSTRADOS.grifo[1]) / ILUSTRADOS.grifo[0];
  const ox = grifo ? 22 : 0, oy = grifo ? gh + 6 : 0;
  const W = ox + (VASOS - 1) * paso + w + 2, H = oy + h + (VASOS - 1) * baja + 4;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", maxWidth: mini ? 240 : 360, display: "block", margin: "0 auto", overflow: "visible" }}
      role="img" aria-label={etiqueta ?? `Cascada con encaje de ${encaje} %`} data-cascada={encaje} data-vasos={Math.min(visibles, VASOS)}>
      <defs>
        <clipPath id="pm26-hueco" clipPathUnits="userSpaceOnUse">
          <rect x={ix0} y={iy0 - 4} width={iw} height={ih + 4} rx={w * 0.12} />
        </clipPath>
        <linearGradient id="pm26-agua" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={MONETARIA} stopOpacity=".95" />
          <stop offset="1" stopColor={MONETARIA} stopOpacity=".75" />
        </linearGradient>
      </defs>
      {grifo && visibles > 0 && (
        <path d={`M${gw * 0.84} ${gh - 2}V${oy + h * 0.6}`} stroke={MONETARIA} strokeWidth="4" strokeLinecap="round" opacity=".9" data-chorro-grifo />
      )}
      {d.map((v, k) => {
        const x = ox + 1 + k * paso, y = oy + 2 + k * baja;
        const lleno = k < visibles;
        const nivel = v / 1000;
        const fondo = (encaje / 100) * nivel;
        const cae = k < VASOS - 1 && lleno && k + 1 < visibles;
        return (
          <g key={k} data-vaso={k} data-lleno={lleno ? "1" : "0"} transform={`translate(${x} ${y})`}>
            {cae && (/* el chorro sale del pico y cae dentro del frasco siguiente */
              <path d={`M${w * 0.98} ${h * 0.12} q${paso - w * 0.6} 2 ${paso - w * 0.45} ${baja + h * 0.3}`} fill="none" stroke={MONETARIA} strokeWidth="3.2" strokeLinecap="round" opacity=".9" />
            )}
            <image href={FRASCO.src} width={w} height={h} />
            <g clipPath="url(#pm26-hueco)">
              <rect className="pm26-vaso-agua" x={ix0} y={iyF - ih * nivel} width={iw} height={ih * nivel} fill="url(#pm26-agua)"
                style={{ transform: `scaleY(${lleno ? 1 : 0})`, opacity: lleno ? 1 : 0 }} />
              {lleno && <rect x={ix0} y={iyF - ih * nivel} width={iw} height={1.6} fill="#fff" opacity=".45" />}
              {conEncaje && (
                <rect className="pm26-vaso-agua" x={ix0} y={iyF - ih * fondo} width={iw} height={ih * fondo} fill={GRIS}
                  style={{ transform: `scaleY(${lleno ? 1 : 0})`, opacity: lleno ? 1 : 0 }} data-encaje-vaso={k} />
              )}
            </g>
            <image href={FRASCO.src} width={w} height={h} opacity=".38" aria-hidden="true" />
          </g>
        );
      })}
      {grifo && <image href={rutaIlustrado("grifo")} x="0" y="0" width={gw} height={gh} data-grifo />}
    </svg>
  );
}

/** Un frasco suelto con su nivel (0 a 1), para medidores pequeños (H1). */
export function FrascoNivel({ nivel, alto = 64 }) {
  const w = (alto * FRASCO.w) / FRASCO.h, h = alto;
  const ix0 = w * HUECO.x0, iw = w * (HUECO.x1 - HUECO.x0), iy0 = h * HUECO.arriba, iyF = h * HUECO.fondo, ih = iyF - iy0;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" data-frasco-nivel={nivel.toFixed(2)}>
      <image href={FRASCO.src} width={w} height={h} />
      <rect className="pm26-vaso-agua" x={ix0} y={iy0} width={iw} height={ih} rx={w * 0.1} fill={MONETARIA} fillOpacity=".9" style={{ transform: `scaleY(${nivel})` }} />
      <image href={FRASCO.src} width={w} height={h} opacity=".38" />
    </svg>
  );
}

/* ─── La gráfica del mercado de dinero ────────────────────────────────── */

const GX0 = 44, GX1 = 270, GY0 = 12, GY1 = 186;
const MMIN = 30, MMAX = 190, IMAX = 12;
export const xDeM = (m) => GX0 + ((m - MMIN) / (MMAX - MMIN)) * (GX1 - GX0);
export const yDeI = (i) => GY1 - (Math.max(0, Math.min(IMAX, i)) / IMAX) * (GY1 - GY0);
const mDeX = (x) => MMIN + ((x - GX0) / (GX1 - GX0)) * (MMAX - MMIN);

/** Asa arrastrable en horizontal sobre la gráfica, con flechas del teclado. */
function Asa({ svg, x, y, valor, min, max, paso, onCambio, nombre, id, activo, escala = 1 }) {
  const arr = useRef(null);
  const aValor = (clientX) => {
    const r = svg.current.getBoundingClientRect();
    const vx = ((clientX - r.left) / r.width) * 280;
    return mDeX(vx);
  };
  if (!activo) return null;
  return (
    <g
      className="pm26-asa" tabIndex={0} role="slider" aria-label={nombre} aria-valuemin={min} aria-valuemax={max} aria-valuenow={Math.round(valor)} data-asa={id}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); arr.current = { m0: valor, v0: aValor(e.clientX) }; }}
      onPointerMove={(e) => { if (!arr.current) return; const v = arr.current.m0 + (aValor(e.clientX) - arr.current.v0) * escala; onCambio(Math.max(min, Math.min(max, v))); }}
      onPointerUp={() => { arr.current = null; }}
      onPointerCancel={() => { arr.current = null; }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); onCambio(Math.min(max, valor + paso)); }
        if (e.key === "ArrowLeft") { e.preventDefault(); onCambio(Math.max(min, valor - paso)); }
      }}
    >
      <rect x={x - 26} y={y - 26} width="52" height="52" fill="transparent" />
      <circle className="pm26-asa-anillo" cx={x} cy={y} r="13" fill={FONDO} stroke={INK} strokeWidth="2.5" />
      <path d={`M${x - 6} ${y}h12M${x - 6} ${y}l3 -3M${x - 6} ${y}l3 3M${x + 6} ${y}l-3 -3M${x + 6} ${y}l-3 3`} stroke={INK} strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

/**
 * La gráfica: pared vertical de oferta en M/P y la recta de demanda
 * L = kY − h·i (en el plano, i = (kY − M)/h). `cruce` marca el equilibrio.
 * `asas`: { oferta?: {valor, onCambio}, demanda?: {valor (Y), onCambio} }.
 */
export function GraficaDinero({ M, Y, conDemanda = true, cruce = true, flecha = null, punto = null, asas = {}, fantasma = null }) {
  const svg = useRef(null);
  const { k, h } = MODELO_DINERO;
  const i = tasaEquilibrio({ k, h, Y, M });
  const xs = xDeM(M);
  const demandaD = (Yd) => {
    const a = Math.max(MMIN, k * Yd - h * IMAX), b = Math.min(MMAX, k * Yd);
    return `M${xDeM(a)} ${yDeI((k * Yd - a) / h)}L${xDeM(b)} ${yDeI((k * Yd - b) / h)}`;
  };
  return (
    <Pizarra style={{ maxWidth: 392, margin: "0 auto" }}>
    <svg ref={svg} viewBox="0 0 280 214" style={{ width: "100%", height: "auto", maxWidth: 360, display: "block", margin: "0 auto", overflow: "visible" }}
      role="img" aria-label={`Mercado de dinero: tasa ${fmtDecimal(i, 1)} %`} data-grafica-dinero data-tasa={i.toFixed(1)} data-m={Math.round(M)} data-y={Math.round(Y)}>
      <path d={`M${GX0} ${GY0 - 4}V${GY1}H${GX1 + 6}`} fill="none" stroke={INK_2} strokeWidth="2" />
      <text x={GX0 - 8} y={GY0 + 6} textAnchor="end" fill={INK} fontSize="15" fontWeight="700">{A5.ejeI}</text>
      <text x={GX1 + 4} y={GY1 + 22} textAnchor="end" fill={INK} fontSize="15" fontWeight="700">{A5.ejeM}</text>
      {fantasma?.M != null && <path d={`M${xDeM(fantasma.M)} ${GY0}V${GY1}`} stroke={INK_2} strokeWidth="2" strokeDasharray="4 4" />}
      {fantasma?.Y != null && conDemanda && <path d={demandaD(fantasma.Y)} stroke={INK_2} strokeWidth="2" strokeDasharray="4 4" fill="none" />}
      <path d={`M${xs} ${GY0}V${GY1}`} stroke={MONETARIA} strokeWidth="4" data-pared />
      <text x={Math.min(xs + 6, 210)} y={GY0 + 12} fill={INK} fontSize="14" fontWeight="600">{A5.oferta}</text>
      {conDemanda && (
        <>
          <path d={demandaD(Y)} stroke={INK} strokeWidth="3" fill="none" data-demanda />
          <text x={Math.min(xDeM(k * Y) - 4, GX1)} y={GY1 - 8} textAnchor="end" fill={INK} fontSize="14" fontWeight="600">L</text>
        </>
      )}
      {conDemanda && cruce && (
        <g data-cruce>
          <path d={`M${GX0} ${yDeI(i)}H${xs}`} stroke={INK_2} strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx={xs} cy={yDeI(i)} r="6" fill={INK} />
          <text x={GX0 - 6} y={yDeI(i) + 5} textAnchor="end" fill={INK} fontSize="14" fontWeight="700" className="da26-mono">{fmtDecimal(i, 1)}</text>
        </g>
      )}
      {punto && (
        <g data-punto-demanda>
          <circle cx={xDeM(k * Y - h * punto)} cy={yDeI(punto)} r="7" fill={MONETARIA} stroke={INK} strokeWidth="2" />
        </g>
      )}
      {flecha && (
        <text x={xs + 14} y={yDeI(i) + (flecha === "sube" ? -10 : 22)} fill={INK} fontSize="22" fontWeight="700" data-flecha-tasa={flecha}>{flecha === "sube" ? "↑" : "↓"}</text>
      )}
      {asas.oferta && <Asa svg={svg} id="oferta" nombre="Pared de la oferta" x={xs} y={GY1 - 30} valor={M} min={MODELO_DINERO.Mmin - 20} max={MODELO_DINERO.Mmax + 20} paso={5} onCambio={asas.oferta.onCambio} activo />}
      {asas.demanda && conDemanda && (
        <Asa svg={svg} id="demanda" nombre="Curva de demanda" x={xDeM(k * Y - h * 9)} y={yDeI(9)} valor={Y}
          min={MODELO_DINERO.Ymin - 40} max={MODELO_DINERO.Ymax + 40} paso={10}
          escala={1 / MODELO_DINERO.k} onCambio={(v) => asas.demanda.onCambio(v)} activo />
      )}
    </svg>
    </Pizarra>
  );
}

/* ─── El tablero de las tres palancas ─────────────────────────────────── */

/** +1 expansiva, −1 contraccionista por palanca («baja» es expansiva en las tres). */
export const signo = (pos) => (pos === "baja" ? 1 : pos === "sube" ? -1 : 0);
export function medidaDe(pos) {
  const s = PALANCAS.reduce((a, p) => a + signo(pos[p.id]), 0);
  return s > 0 ? "expansiva" : s < 0 ? "contraccionista" : "neutra";
}

export function Letrero({ pos }) {
  const m = medidaDe(pos);
  const s = PALANCAS.reduce((a, p) => a + signo(pos[p.id]), 0);
  return (
    <div className="pm26-letrero" data-medida={m} aria-live="polite">
      <svg viewBox="0 0 44 30" width="44" height="30" aria-hidden="true">
        <path d="M4 26a18 18 0 0 1 36 0" fill="none" stroke={INK_2} strokeWidth="3" />
        <g className="pm26-aguja" style={{ transform: `rotate(${s * 22}deg)` }}><path d="M22 26V8" stroke={MONETARIA} strokeWidth="3.5" strokeLinecap="round" /></g>
      </svg>
      <span data-letrero={m}>{m === "expansiva" ? A6.expansiva : m === "contraccionista" ? A6.contraccionista : A6.neutra}</span>
      <span className="da26-rotulo">{A6.aguja} {s > 0 ? "↑" : s < 0 ? "↓" : "="}</span>
    </div>
  );
}

/**
 * Tres palancas de tres posiciones. `estado[id]` = "bien" | "mal" (H5).
 * `onNombre(id)`: tocar el nombre de la palanca (A6 P3).
 */
export function Tablero({ pos, onCambio, bloqueado = false, estado = {}, onNombre = null }) {
  return (
    <div className="pm26-tablero" role="group" aria-label="Las tres palancas">
      {PALANCAS.map((p) => (
        <div key={p.id} className="pm26-palanca" data-palanca={p.id} data-estado={estado[p.id]}>
          {onNombre
            ? <button type="button" className="pm26-palanca-nombre" style={{ minHeight: 44, cursor: "pointer" }} onClick={() => onNombre(p.id)} data-nombre-palanca={p.id}>{p.nombre}</button>
            : <span className="pm26-palanca-nombre" style={{ display: "grid", placeItems: "center" }}>{p.nombre}</span>}
          <div role="radiogroup" aria-label={p.nombre} style={{ display: "grid", gap: 4 }}>
            {ORDEN_POSICIONES.map((x) => (
              <button key={x} type="button" role="radio" aria-checked={pos[p.id] === x} className="pm26-pos" data-pos={x} disabled={bloqueado}
                onClick={() => onCambio({ ...pos, [p.id]: x })}>
                {x === "sube" ? "↑ " : x === "baja" ? "↓ " : "= "}{p.posiciones[x]}
              </button>
            ))}
          </div>
          {estado[p.id] === "bien" && <span style={{ textAlign: "center", fontWeight: 700 }} data-palanca-bien>✓</span>}
        </div>
      ))}
    </div>
  );
}

/* ─── El termostato: la casa, el termómetro y la banda ────────────────── */

const T_MAX = 14;
/* La casa en corte con su aire y el termómetro de vidrio, ilustrados (Gemini,
 * 25-nov; diagnostico-visual.md, familia 2). El calor de la sala, el chorro
 * frío del aire, el mercurio y la banda se pintan en vivo encima.
 * Termómetro (160 × 420): tubo útil de x .39 a .625; 0 % en y .66 y T_MAX en
 * y .12; bulbo con centro (.5, .81) y radio .3 del ancho (medido en el WebP). */
/* Mercurio naranja cálido (coral queda solo para error). */
const MERCURIO = "#f2994a";
const TERMO = { x0: 0.39, x1: 0.625, cero: 0.66, tope: 0.12, bx: 0.5, by: 0.81, br: 0.3 };
/** `inflacion` en %, el mercurio sube hasta T_MAX. `banda`: sombrea 2 %–4 %. */
export function Termostato({ inflacion, banda = true, aire = false, alto = 150 }) {
  const [cw, ch] = ILUSTRADOS["casa-aire"], [tw0, th0] = ILUSTRADOS["termometro-vidrio"];
  const casaH = 150, casaW = (casaH * cw) / ch;                 /* 180 × 150 */
  const tH = 158, tW = (tH * tw0) / th0, tX = casaW + 14, tY = 0; /* ~60 × 158 */
  const VW = tX + tW + 34, VH = 160;
  const yDe = (v) => tY + tH * (TERMO.cero - (Math.min(T_MAX, Math.max(0, v)) / T_MAX) * (TERMO.cero - TERMO.tope));
  const nivel = Math.min(T_MAX, Math.max(0, inflacion)) / T_MAX;
  const tuboX = tX + tW * TERMO.x0, tuboW = tW * (TERMO.x1 - TERMO.x0);
  const calor = Math.max(0, Math.min(1, (inflacion - 3) / 7));   /* la sala se ve caliente con inflación alta */
  const sala = `M${casaW * 0.09} ${casaH * 0.92}V${casaH * 0.33}L${casaW * 0.5} ${casaH * 0.1}L${casaW * 0.91} ${casaH * 0.33}V${casaH * 0.92}Z`;
  return (
    <div>
    <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: "100%", height: "auto", maxWidth: (alto * VW) / VH * 1.25, display: "block", margin: "0 auto" }}
      role="img" aria-label={`${A7.inflacion} ${fmtDecimal(inflacion, 1)} %${banda ? `. ${A7.banda}` : ""}`} data-termostato data-inflacion={inflacion}>
      <defs>
        <radialGradient id="pm26-calor" cx=".5" cy=".7" r=".7">
          <stop offset="0" stopColor="#f4a259" stopOpacity=".6" />
          <stop offset="1" stopColor={CALIDO} stopOpacity=".12" />
        </radialGradient>
      </defs>
      <image href={rutaIlustrado("casa-aire")} width={casaW} height={casaH} y={VH - casaH} />
      <g transform={`translate(0 ${VH - casaH})`}>
        <path d={sala} fill="url(#pm26-calor)" className="pm26-calor" style={{ opacity: calor }} data-calor={calor.toFixed(2)} />
        <g data-aire={aire ? "1" : "0"} className="pm26-aire" style={{ opacity: aire ? 1 : 0 }}>
          {[0, 1, 2].map((k) => (
            <path key={k} className="pm26-brisa" style={{ animationDelay: `${k * 260}ms` }}
              d={`M${casaW * (0.22 + k * 0.08)} ${casaH * 0.56} q${-6 + k * 2} 14 ${4 + k * 3} 26 t${2 + k} 24`}
              fill="none" stroke="#c4ecff" strokeWidth="4" strokeLinecap="round" />
          ))}
        </g>
      </g>
      <image href={rutaIlustrado("termometro-vidrio")} x={tX} y={tY} width={tW} height={tH} />
      <circle cx={tX + tW * TERMO.bx} cy={tY + tH * TERMO.by} r={tW * TERMO.br * 0.86} fill={MERCURIO} />
      <rect className="pm26-mercurio" x={tuboX + 1} y={yDe(T_MAX)} width={tuboW - 2} height={tY + tH * TERMO.by - yDe(T_MAX)} rx={tuboW / 2 - 1} fill={MERCURIO}
        style={{ transform: `scaleY(${(tY + tH * TERMO.by - yDe(inflacion)) / (tY + tH * TERMO.by - yDe(T_MAX))})` }} data-mercurio={nivel.toFixed(2)} />
      <image href={rutaIlustrado("termometro-vidrio")} x={tX} y={tY} width={tW} height={tH} opacity=".35" aria-hidden="true" />
      {banda && <rect x={tX + tW * 0.1} y={yDe(4)} width={tW * 0.8} height={yDe(2) - yDe(4)} rx="3" fill={MONETARIA} fillOpacity=".45" stroke={MONETARIA} strokeWidth="2" data-banda />}
      <text x={VW - 2} y={yDe(inflacion) + 5} textAnchor="end" fill={INK} fontSize="15" fontWeight="700" className="da26-mono">{fmtDecimal(inflacion, 1)}</text>
    </svg>
    {banda && (
      <p className="da26-rotulo" style={{ margin: "4px 0 0", textAlign: "center", fontSize: 14, color: INK }} aria-hidden="true" data-rotulo-banda>
        <span style={{ display: "inline-block", width: 14, height: 10, marginRight: 6, background: MONETARIA, opacity: 0.6, verticalAlign: "0" }} />{A7.banda}
      </p>
    )}
    </div>
  );
}

export const fmtMiles = fmtEntero;
