/*
 * MACRO 2026 · T5 · lo que comparten varias piezas de Política cambiaria:
 * - la balanza del dólar (A1, H1, A4);
 * - la gráfica del mercado cambiario con asas (A2, H2);
 * - el dial del cambio real (A3, A4, H3);
 * - los imanes de capital y las barras aquí/afuera (A6, H5);
 * - la correa del dólar: el rastro del tc según el régimen (A7, H6).
 * Peso y dólar con sus dos tonos fijos (comun/monedas.js) y su símbolo.
 * Movimiento: solo transform y opacity (y el rastro de la correa, que se
 * dibuja por pasos); con movimiento reducido, sin moverse.
 */
import { useEffect, useRef, useState } from "react";
import { BORDE, FONDO, GRIS, INK, INK_2, SUPERFICIE_2, TINTA_SOBRE_COLOR } from "../comun/colores-da.js";
import { colorRama } from "../comun/ramas.js";
import { DOLAR, PESO } from "../comun/monedas.js";
import { fmtDecimal, fmtEntero } from "../comun/modelo-da.js";
import { movimientoReducido } from "../comun/ui.jsx";
import { A2, A3, A7, MODELO_DIVISAS, equilibrioDivisas, zonaDe } from "./textos.js";

export const CAMBIARIA = colorRama("cambiaria");

export const CSS_PC = `
.pc26-contador { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; padding: 8px 12px; border-radius: 10px; border: 1px solid ${BORDE}; background: ${FONDO}; font: 600 14px/1.3 var(--planck-font-sans, system-ui, sans-serif); }
.pc26-contador b { font: 700 18px/1.2 var(--planck-font-mono, "Geist Mono", ui-monospace, monospace); font-variant-numeric: tabular-nums; }
.pc26-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; border: 1px solid ${BORDE}; background: ${FONDO}; font: 600 14px/1.25 var(--planck-font-sans, system-ui, sans-serif); color: ${INK}; }
.pc26-moneda-peso { color: ${PESO}; }
.pc26-moneda-dolar { color: ${DOLAR}; }
.pc26-opciones { display: grid; grid-template-columns: repeat(auto-fit, minmax(96px, 1fr)); gap: 6px; }
.pc26-opcion { min-height: 48px; padding: 6px 10px; border-radius: 12px; border: 2px solid ${BORDE}; background: ${SUPERFICIE_2}; color: ${INK}; font: 600 15px/1.2 var(--planck-font-sans, system-ui, sans-serif); cursor: pointer; touch-action: manipulation; }
.pc26-opcion[aria-pressed="true"], .pc26-opcion[aria-checked="true"] { background: ${INK}; border-color: ${INK}; color: ${TINTA_SOBRE_COLOR}; }
.pc26-opcion[data-estado="mal"] { border-color: #E76F51; }
.pc26-opcion[data-estado="bien"] { border-color: ${INK}; }
.pc26-opcion:disabled { cursor: default; }
.pc26-asa { cursor: grab; touch-action: none; }
.pc26-asa:focus-visible .pc26-asa-anillo { stroke: ${CAMBIARIA}; stroke-width: 4; }
.pc26-aguja { transition: transform 420ms cubic-bezier(.3,.9,.4,1); transform-box: view-box; }
.pc26-plato { transition: transform 420ms cubic-bezier(.3,.9,.4,1); }
.pc26-medalla { transition: transform 420ms cubic-bezier(.3,.9,.4,1); transform-box: fill-box; transform-origin: center; }
.pc26-moneda-cap { transition: transform 700ms cubic-bezier(.3,.9,.4,1), opacity 300ms linear; }
@media (prefers-reduced-motion: reduce) { .pc26-aguja, .pc26-plato, .pc26-medalla, .pc26-moneda-cap { transition: none; } }
`;

/** Pesos por dólar: 4.000 o 4.329,90 (dos decimales solo si hacen falta). */
export const fmtTc = (x) => (Math.abs(x - Math.round(x)) < 0.005 ? fmtEntero(x) : fmtDecimal(x, 2));
/** Una variación con signo: +2,5 % · −1,5 % · 0 %. */
export const fmtVar = (x) => {
  const r = Math.round(x * 10) / 10;
  if (r === 0) return "0 %";
  const t = Number.isInteger(r) ? fmtEntero(Math.abs(r)) : fmtDecimal(Math.abs(r), 1);
  return `${r > 0 ? "+" : "−"}${t} %`;
};

/* ─── La balanza del dólar ────────────────────────────────────────────── */

/**
 * USD 1 en un plato y pilas de pesos de $100 en el otro (una pila por cada
 * $250). El peso se encoge y el dólar crece con el tc (contra $4.000).
 * `inclina`: grados del brazo (las noticias la empujan un poco).
 */
export function Balanza({ tc, inclina = 0, rotulos = null }) {
  return (
    <div>
      <BalanzaSvg tc={tc} inclina={inclina} />
      {rotulos && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4, textAlign: "center", font: "700 14px/1.25 var(--planck-font-sans, system-ui, sans-serif)" }}>
          <span style={{ color: PESO }} data-rotulo-peso>{rotulos.peso}</span>
          <span style={{ color: DOLAR }} data-rotulo-dolar>{rotulos.dolar}</span>
        </div>
      )}
    </div>
  );
}

function BalanzaSvg({ tc, inclina }) {
  const n = Math.round(tc / 250);
  const sD = Math.max(0.7, Math.min(1.35, tc / 4000));
  const sP = Math.max(0.7, Math.min(1.35, 4000 / tc));
  return (
    <svg viewBox="0 0 300 150" style={{ width: "100%", height: "auto", maxWidth: 380, display: "block", margin: "0 auto" }}
      role="img" aria-label={`USD 1 = $${fmtTc(tc)}`} data-balanza data-tc={tc}>
      <g className="pc26-medalla" style={{ transform: `scale(${sP})` }} data-medalla-peso={sP.toFixed(2)}>
        <circle cx="40" cy="24" r="18" fill={PESO} />
        <text x="40" y="30" textAnchor="middle" fill={TINTA_SOBRE_COLOR} fontSize="17" fontWeight="800">$</text>
      </g>
      <g className="pc26-medalla" style={{ transform: `scale(${sD})` }} data-medalla-dolar={sD.toFixed(2)}>
        <circle cx="260" cy="24" r="18" fill={DOLAR} />
        <text x="260" y="29" textAnchor="middle" fill={TINTA_SOBRE_COLOR} fontSize="14" fontWeight="800">USD</text>
      </g>
      <path d="M150 58V140M118 144h64" stroke={INK_2} strokeWidth="4" strokeLinecap="round" />
      <g className="pc26-plato" style={{ transform: `rotate(${inclina}deg)`, transformOrigin: "150px 58px" }}>
        <path d="M54 58H246" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        <path d="M54 58l-34 54h68Z M246 58l-34 54h68Z" fill="none" stroke={INK_2} strokeWidth="1.5" />
        <path d="M14 112h80M206 112h80" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        {/* El dólar: un billete de USD 1. */}
        <rect x="224" y="86" width="44" height="24" rx="3" fill={DOLAR} stroke={INK} strokeWidth="1.5" />
        <text x="246" y="104" textAnchor="middle" fill={TINTA_SOBRE_COLOR} fontSize="15" fontWeight="800" aria-hidden="true">1</text>
        {/* Los pesos: pilas de $100. */}
        {Array.from({ length: n }, (_, k) => {
          const fila = Math.floor(k / 8), col = k % 8;
          return <rect key={k} x={18 + col * 9.5} y={98 - fila * 13} width="8" height="12" rx="2" fill={PESO} stroke={FONDO} strokeWidth="1" data-pila />;
        })}
      </g>
      <text x="54" y="140" textAnchor="middle" fill={INK} fontSize="15" fontWeight="700" className="da26-mono" data-cifra-pesos>${fmtTc(tc)}</text>
      <text x="246" y="140" textAnchor="middle" fill={INK} fontSize="15" fontWeight="700" className="da26-mono">USD 1</text>
    </svg>
  );
}

/* ─── La gráfica del mercado cambiario ───────────────────────────────── */

const GX0 = 46, GX1 = 270, GY0 = 14, GY1 = 186;
const QMIN = 20, QMAX = 80, TMIN = 3200, TMAX = 4800;
const xDeQ = (q) => GX0 + ((q - QMIN) / (QMAX - QMIN)) * (GX1 - GX0);
const yDeT = (t) => GY1 - ((t - TMIN) / (TMAX - TMIN)) * (GY1 - GY0);
const qDeX = (x) => QMIN + ((x - GX0) / (GX1 - GX0)) * (QMAX - QMIN);
const { o0, d0, m } = MODELO_DIVISAS;
const tcOferta = (q, so) => o0 + m * (q - so);
const tcDemanda = (q, sd) => d0 - m * (q - sd);

function Asa({ svg, x, y, valor, onCambio, nombre, id }) {
  const arr = useRef(null);
  const aQ = (clientX) => {
    const r = svg.current.getBoundingClientRect();
    return qDeX(((clientX - r.left) / r.width) * 280);
  };
  const lim = (v) => Math.max(-30, Math.min(30, v));
  return (
    <g className="pc26-asa" tabIndex={0} role="slider" aria-label={nombre} aria-valuemin={-30} aria-valuemax={30} aria-valuenow={Math.round(valor)} data-asa={id}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); arr.current = { v0: valor, q0: aQ(e.clientX) }; }}
      onPointerMove={(e) => { if (!arr.current) return; onCambio(lim(arr.current.v0 + aQ(e.clientX) - arr.current.q0)); }}
      onPointerUp={() => { arr.current = null; }}
      onPointerCancel={() => { arr.current = null; }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); onCambio(lim(valor + 5)); }
        if (e.key === "ArrowLeft") { e.preventDefault(); onCambio(lim(valor - 5)); }
      }}>
      <rect x={x - 26} y={y - 26} width="52" height="52" fill="transparent" />
      <circle className="pc26-asa-anillo" cx={x} cy={y} r="13" fill={FONDO} stroke={INK} strokeWidth="2.5" />
      <path d={`M${x - 6} ${y}h12M${x - 6} ${y}l3 -3M${x - 6} ${y}l3 3M${x + 6} ${y}l-3 -3M${x + 6} ${y}l-3 3`} stroke={INK} strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

/**
 * Od sube y Dd baja; `so` y `sd` corren cada curva a la derecha (en
 * dólares). `asas`: { oferta?: onCambio, demanda?: onCambio }.
 */
export function GraficaDivisas({ so = 0, sd = 0, curvas = true, cruce = true, fantasma = null, flecha = null, asas = {} }) {
  const svg = useRef(null);
  const { Q, tc } = equilibrioDivisas(so, sd);
  const linea = (f, s) => `M${xDeQ(QMIN)} ${yDeT(f(QMIN, s))}L${xDeQ(QMAX)} ${yDeT(f(QMAX, s))}`;
  const qO = (t, s) => s + (t - o0) / m, qD = (t, s) => s + (d0 - t) / m;
  return (
    <svg ref={svg} viewBox="0 0 280 218" style={{ width: "100%", height: "auto", maxWidth: 360, display: "block", margin: "0 auto", overflow: "visible" }}
      role="img" aria-label={`Mercado cambiario: tc ${fmtEntero(tc)}`} data-grafica-divisas data-tc={Math.round(tc)} data-so={Math.round(so)} data-sd={Math.round(sd)}>
      <defs><clipPath id="pc26-marco"><rect x={GX0} y={GY0 - 6} width={GX1 - GX0 + 6} height={GY1 - GY0 + 6} /></clipPath></defs>
      <path d={`M${GX0} ${GY0 - 6}V${GY1}H${GX1 + 6}`} fill="none" stroke={INK_2} strokeWidth="2" />
      <text x={GX0 - 8} y={GY0 + 6} textAnchor="end" fill={INK} fontSize="15" fontWeight="700">{A2.ejeTc}</text>
      <text x={GX1 + 4} y={GY1 + 24} textAnchor="end" fill={INK} fontSize="15" fontWeight="700">{A2.ejeQ}</text>
      {curvas && (
        <g clipPath="url(#pc26-marco)">
          {fantasma && <path d={linea(tcOferta, fantasma.so ?? 0)} stroke={INK_2} strokeWidth="2" strokeDasharray="4 4" fill="none" data-fantasma="oferta" />}
          {fantasma && <path d={linea(tcDemanda, fantasma.sd ?? 0)} stroke={INK_2} strokeWidth="2" strokeDasharray="4 4" fill="none" data-fantasma="demanda" />}
          <path d={linea(tcOferta, so)} stroke={DOLAR} strokeWidth="4" fill="none" data-curva="oferta" />
          <path d={linea(tcDemanda, sd)} stroke={CAMBIARIA} strokeWidth="4" fill="none" data-curva="demanda" />
        </g>
      )}
      {curvas && (
        <>
          <text x={Math.min(xDeQ(qO(4700, so)) + 6, 250)} y={yDeT(4700) + 4} fill={INK} fontSize="15" fontWeight="700">{A2.oferta}</text>
          <text x={Math.min(xDeQ(qD(3300, sd)) + 6, 250)} y={yDeT(3300) + 4} fill={INK} fontSize="15" fontWeight="700">{A2.demanda}</text>
        </>
      )}
      {curvas && cruce && (
        <g data-cruce>
          <path d={`M${GX0} ${yDeT(tc)}H${xDeQ(Q)}`} stroke={INK_2} strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx={xDeQ(Q)} cy={yDeT(tc)} r="6" fill={INK} />
          <text x={GX0 - 4} y={yDeT(tc) + 5} textAnchor="end" fill={INK} fontSize="14" fontWeight="700" className="da26-mono" data-tc-cruce>{fmtEntero(tc)}</text>
        </g>
      )}
      {flecha && (
        <text x={xDeQ(Q) + 12} y={yDeT(tc) + (flecha === "sube" ? -10 : 24)} fill={INK} fontSize="24" fontWeight="800" data-flecha-tc={flecha}>{flecha === "sube" ? "↑" : "↓"}</text>
      )}
      {curvas && asas.oferta && <Asa svg={svg} id="oferta" nombre={`${A2.oferta}: oferta de dólares`} x={xDeQ(qO(4350, so))} y={yDeT(4350)} valor={so} onCambio={asas.oferta} />}
      {curvas && asas.demanda && <Asa svg={svg} id="demanda" nombre={`${A2.demanda}: demanda de dólares`} x={xDeQ(qD(3650, sd))} y={yDeT(3650)} valor={sd} onCambio={asas.demanda} />}
    </svg>
  );
}

/** La respuesta que leen los dos corrimientos: la curva que más se movió. */
export const UMBRAL_CURVA = 4;
export function leerCurva(so, sd) {
  const a = Math.abs(so), b = Math.abs(sd);
  if (Math.max(a, b) < UMBRAL_CURVA) return null;
  const curva = a >= b ? "oferta" : "demanda";
  return { curva, direccion: (curva === "oferta" ? so : sd) > 0 ? "derecha" : "izquierda" };
}

/* ─── El dial del cambio real ─────────────────────────────────────────── */

const DCX = 150, DCY = 140, DR = 108, DMAX = 6;
const anguloDe = (v) => Math.PI - ((Math.max(-DMAX, Math.min(DMAX, v)) + DMAX) / (2 * DMAX)) * Math.PI;
const punto = (v, r) => [DCX + r * Math.cos(anguloDe(v)), DCY - r * Math.sin(anguloDe(v))];
function arco(v0, v1, r) {
  const [x0, y0] = punto(v0, r), [x1, y1] = punto(v1, r);
  return `M${x0} ${y0}A${r} ${r} 0 0 1 ${x1} ${y1}`;
}

/**
 * Dial de −6 % a +6 %. `valor` null: sin aguja (H3 antes de tocar).
 * `onCambio`: el dial se arrastra (y ← → mueven 0,5). `fantasma`: la aguja
 * correcta, punteada. `marcas`: agujas fijas con su rótulo (A4 P6).
 */
export function Dial({ valor, onCambio = null, fantasma = null, itcrTexto = null, marcas = [], nombre = "Aguja del cambio real" }) {
  const svg = useRef(null);
  const arr = useRef(false);
  const desde = (e) => {
    const r = svg.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 300, y = ((e.clientY - r.top) / r.height) * 200;
    let a = Math.atan2(DCY - y, x - DCX);
    if (a < 0) a = x < DCX ? Math.PI : 0;
    const v = DMAX - (a / Math.PI) * 2 * DMAX;
    onCambio(Math.round(Math.max(-DMAX, Math.min(DMAX, v)) * 2) / 2);
  };
  const interactivo = Boolean(onCambio);
  const grados = (v) => (anguloDe(v) * 180) / Math.PI;
  const zona = valor == null ? null : zonaDe(valor);
  return (
    <svg ref={svg} viewBox="0 0 300 200" style={{ width: "100%", height: "auto", maxWidth: 380, display: "block", margin: "0 auto", touchAction: interactivo ? "none" : "auto", cursor: interactivo ? "pointer" : "default" }}
      role={interactivo ? "slider" : "img"} tabIndex={interactivo ? 0 : undefined}
      aria-label={interactivo ? nombre : `${nombre}: ${valor == null ? "sin marcar" : fmtVar(valor)}`}
      {...(interactivo ? { "aria-valuemin": -DMAX, "aria-valuemax": DMAX, "aria-valuenow": valor ?? 0, "aria-valuetext": valor == null ? "sin marcar" : fmtVar(valor) } : {})}
      data-dial data-valor={valor == null ? "" : String(valor)} data-zona={zona ?? ""}
      onPointerDown={interactivo ? (e) => { e.currentTarget.setPointerCapture?.(e.pointerId); arr.current = true; desde(e); } : undefined}
      onPointerMove={interactivo ? (e) => { if (arr.current) desde(e); } : undefined}
      onPointerUp={interactivo ? () => { arr.current = false; } : undefined}
      onPointerCancel={interactivo ? () => { arr.current = false; } : undefined}
      onKeyDown={interactivo ? (e) => {
        const v = valor ?? 0;
        if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); onCambio(Math.min(DMAX, v + 0.5)); }
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); onCambio(Math.max(-DMAX, v - 0.5)); }
      } : undefined}>
      <path d={arco(-DMAX, -0.25, DR)} stroke={PESO} strokeWidth="20" fill="none" opacity=".55" />
      <path d={arco(-0.25, 0.25, DR)} stroke={GRIS} strokeWidth="20" fill="none" />
      <path d={arco(0.25, DMAX, DR)} stroke={CAMBIARIA} strokeWidth="20" fill="none" opacity=".7" />
      {[-6, -4, -2, 0, 2, 4, 6].map((v) => {
        const [x0, y0] = punto(v, DR - 14), [x1, y1] = punto(v, DR - 24);
        const [tx, ty] = punto(v, DR - 38);
        return (
          <g key={v}>
            <path d={`M${x0} ${y0}L${x1} ${y1}`} stroke={INK_2} strokeWidth="2" />
            <text x={tx} y={ty + 5} textAnchor="middle" fill={INK_2} fontSize="14" className="da26-mono">{v > 0 ? `+${v}` : v < 0 ? `−${-v}` : "0"}</text>
          </g>
        );
      })}
      <text x={DCX} y="16" textAnchor="middle" fill={INK} fontSize="14" fontWeight="600">{A3.zonas.equilibrio}</text>
      <text x="70" y="164" textAnchor="middle" fill={INK} fontSize="14" fontWeight="600">{A3.zonas.revaluacion}</text>
      <text x="230" y="164" textAnchor="middle" fill={INK} fontSize="14" fontWeight="600">{A3.zonas.devaluacion}</text>
      {marcas.map((mk) => {
        const [x, y] = punto(mk.valor, DR + 2);
        return (
          <g key={mk.id} data-marca={mk.id}>
            <path d={`M${DCX} ${DCY}L${x} ${y}`} stroke={INK} strokeWidth="3" strokeLinecap="round" />
            <text x={x + (mk.valor < 0 ? -4 : 4)} y={y - 8} textAnchor={mk.valor < 0 ? "end" : "start"} fill={INK} fontSize="14" fontWeight="700" className="da26-mono">{mk.rotulo}</text>
          </g>
        );
      })}
      {fantasma != null && (
        <path d={`M${DCX} ${DCY}L${DCX + DR - 6} ${DCY}`} stroke={INK} strokeWidth="3" strokeDasharray="6 5" strokeLinecap="round"
          style={{ transform: `rotate(${-grados(fantasma)}deg)`, transformOrigin: `${DCX}px ${DCY}px` }} data-fantasma-aguja={fantasma} />
      )}
      {valor != null && (
        <g className="pc26-aguja" style={{ transform: `rotate(${-grados(valor)}deg)`, transformOrigin: `${DCX}px ${DCY}px` }} data-aguja>
          <path d={`M${DCX} ${DCY}L${DCX + DR - 4} ${DCY}`} stroke={INK} strokeWidth="5" strokeLinecap="round" />
          {interactivo && <circle cx={DCX + DR - 4} cy={DCY} r="10" fill={INK} />}
        </g>
      )}
      <circle cx={DCX} cy={DCY} r="9" fill={INK} />
      <text x={DCX} y="192" textAnchor="middle" fill={INK} fontSize="18" fontWeight="800" className="da26-mono" data-lectura-dial>
        {valor == null ? (interactivo ? "—" : "") : `Δtcr ${fmtVar(valor)}${itcrTexto ? ` · ${itcrTexto}` : ""}`}
      </text>
    </svg>
  );
}

/* ─── Los imanes de capital ───────────────────────────────────────────── */

const COLUMNAS = [0, 1, 2, 3, 4, 5];
/**
 * `atraccion` −1 (todo hacia Colombia, a la izquierda) a +1 (hacia EE. UU.).
 * `nube`: el riesgo sobre Colombia. `cuesta`: la moneda de Colombia se
 * deprecia y dos monedas ruedan de vuelta.
 */
export function Imanes({ atraccion = 0, nube = false, cuesta = false, nombres = ["Colombia", "EE. UU."] }) {
  const a = Math.max(-1, Math.min(1, atraccion + (nube ? 0.9 : 0)));
  return (
    <svg viewBox="0 0 300 150" style={{ width: "100%", height: "auto", maxWidth: 380, display: "block", margin: "0 auto" }}
      role="img" aria-label={`El capital va hacia ${a < -0.1 ? nombres[0] : a > 0.1 ? nombres[1] : "ninguno de los dos"}`} data-imanes data-atraccion={a.toFixed(2)}>
      {[0, 1].map((k) => {
        const x = k === 0 ? 14 : 238;
        return (
          <g key={k} data-iman={k === 0 ? "aqui" : "alla"}>
            <path d={`M${x} 40h48v22h-26v26h26v22h-48Z`} transform={k === 1 ? `translate(${2 * x + 48} 0) scale(-1 1)` : undefined} fill={SUPERFICIE_2} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
            <rect x={k === 0 ? x + 36 : x} y="40" width="12" height="22" fill={k === 0 ? PESO : DOLAR} />
            <rect x={k === 0 ? x + 36 : x} y="88" width="12" height="22" fill={k === 0 ? PESO : DOLAR} />
            <text x={x + 24} y="134" textAnchor="middle" fill={INK} fontSize="15" fontWeight="700">{nombres[k]}</text>
          </g>
        );
      })}
      {nube && (
        <g data-nube>
          <path d="M28 30c-10 0-14-12-4-16 0-10 14-12 18-4 8-6 20 0 16 10 8 2 6 12-2 12Z" fill={GRIS} stroke={INK_2} strokeWidth="1.5" />
          <path d="M40 30l-4 8h6l-4 8" stroke={CAMBIARIA} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      )}
      {cuesta && <path d="M70 116L130 96" stroke={INK_2} strokeWidth="3" strokeDasharray="5 4" data-cuesta />}
      {COLUMNAS.map((k) => {
        const fila = k % 2, base = 110 + (k - 2.5) * 13;
        const vuelve = cuesta && a < 0 && k >= 4;
        const dx = vuelve ? 44 : a * 70;
        return (
          <g key={k} className="pc26-moneda-cap" style={{ transform: `translateX(${dx}px)` }} data-moneda-capital={k}>
            <circle cx={base} cy={fila ? 92 : 66} r="12" fill={CAMBIARIA} stroke={INK} strokeWidth="1.5" />
            <text x={base} y={(fila ? 92 : 66) + 5} textAnchor="middle" fill={TINTA_SOBRE_COLOR} fontSize="14" fontWeight="800">$</text>
          </g>
        );
      })}
    </svg>
  );
}

/** Dos barras: aquí (peso) y afuera (dólar), en millones de pesos. */
export function Barras({ aqui, afuera, etiquetas = ["Aquí", "Afuera"], max = null, gana = null }) {
  const tope = max ?? Math.max(aqui ?? 0, afuera ?? 0) * 1.08;
  const fila = (id, v, tono, etq) => (
    <div key={id} style={{ display: "grid", gridTemplateColumns: "64px minmax(0,1fr)", gap: 8, alignItems: "center" }} data-barra={id} data-valor={v == null ? "" : v.toFixed(1)}>
      <span style={{ fontWeight: 700, fontSize: 14 }}>{etq}{gana === id ? " ✓" : ""}</span>
      <div style={{ position: "relative", height: 30, borderRadius: 8, background: FONDO, border: `1px solid ${BORDE}`, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, transformOrigin: "left", transform: `scaleX(${v == null ? 0 : Math.min(1, v / tope)})`, background: tono, transition: "transform 600ms cubic-bezier(.3,.9,.4,1)" }} />
        <span className="da26-mono" style={{ position: "absolute", right: 8, top: 5, fontWeight: 700, fontSize: 15, color: INK, textShadow: `0 0 4px ${FONDO}` }}>{v == null ? "" : `$${fmtDecimal(v, 1)} M`}</span>
      </div>
    </div>
  );
  return <div style={{ display: "grid", gap: 6 }} data-barras>{[fila("aqui", aqui, PESO, etiquetas[0]), fila("afuera", afuera, DOLAR, etiquetas[1])]}</div>;
}

/* ─── La correa del dólar ─────────────────────────────────────────────── */

const CX0 = 20, CX1 = 286, CYM = 70;
/* Un paseo fijo (sin azar): el mismo dibujo en cada visita. */
const PASEO = [0, 6, 2, 12, 18, 9, 22, 30, 21, 33, 26, 38, 44, 35, 47, 40, 52, 58, 49, 55];
/** El tc (desplazamiento en px hacia arriba) en t ∈ [0, 1] según el régimen. */
export function rastro(regimen, t, sucia = false) {
  if (regimen === "fijo") return Math.sin(t * 40) * 1.5;
  if (regimen === "banda") return Math.max(-22, Math.min(22, Math.sin(t * 9) * 34));
  if (regimen === "gota") return -24 + t * 50;
  const i = t * (PASEO.length - 1), k = Math.floor(i), f = i - k;
  const v = (PASEO[k] + ((PASEO[Math.min(k + 1, PASEO.length - 1)] - PASEO[k]) * f)) - 26;
  return sucia ? Math.max(-14, Math.min(14, v)) : v;
}
const DURACION = 2400;

/** Reproduce una vez la animación del régimen cada vez que cambia `vez`. */
function useTiempo(vez) {
  const [t, setT] = useState(1);
  useEffect(() => {
    if (vez === 0 || movimientoReducido()) { setT(1); return undefined; }
    let id = 0;
    const ini = performance.now();
    const tic = (ahora) => {
      const f = Math.min(1, (ahora - ini) / DURACION);
      setT(f);
      if (f < 1) id = requestAnimationFrame(tic);
    };
    setT(0);
    id = requestAnimationFrame(tic);
    return () => cancelAnimationFrame(id);
  }, [vez]);
  return t;
}

function Perro({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`} data-perro>
      <ellipse cx="0" cy="0" rx="11" ry="7" fill={CAMBIARIA} stroke={INK} strokeWidth="1.5" />
      <circle cx="11" cy="-6" r="6" fill={CAMBIARIA} stroke={INK} strokeWidth="1.5" />
      <path d="M9 -11l-2 -5 5 3Z" fill={INK} />
      <path d="M-11 -2l-6 -5" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <path d="M-6 6v5M6 6v5" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

/**
 * El rastro del tc a lo largo del tiempo con el perro en la punta y la
 * correa al dueño (BanRep). `vez`: cambia para reproducir otra vez.
 */
export function Correa({ regimen, vez = 0, sucia = false, mini = false }) {
  const t = useTiempo(vez);
  const pasos = 48;
  const ys = (u) => CYM - rastro(regimen, u, sucia);
  const xs = (u) => CX0 + u * (CX1 - CX0 - 16);
  let d = "";
  for (let k = 0; k <= pasos; k += 1) {
    const u = (k / pasos) * t;
    d += `${k ? "L" : "M"}${xs(u).toFixed(1)} ${ys(u).toFixed(1)}`;
  }
  const px = xs(t), py = ys(t);
  const anclaY = regimen === "fijo" ? CYM : regimen === "gota" ? py : regimen === "banda" ? (py < CYM ? CYM - 22 : CYM + 22) : null;
  const jala = regimen === "banda" ? Math.abs(rastro("banda", t)) >= 21.5 : regimen === "flexible" && sucia ? Math.abs(rastro("flexible", t)) >= 13.5 : false;
  return (
    <svg viewBox={`0 0 300 ${mini ? 120 : 140}`} style={{ width: "100%", height: "auto", display: "block" }} role="img"
      aria-label={`${REG_NOMBRE[regimen]}${sucia ? `, ${A7.sucia.toLowerCase()}` : ""}`} data-correa={regimen} data-t={t.toFixed(2)} data-jala={jala ? "1" : "0"}>
      <path d={`M${CX0} 8V${mini ? 116 : 124}H292`} stroke={INK_2} strokeWidth="1.5" fill="none" />
      {!mini && <text x={CX0 + 4} y="20" fill={INK_2} fontSize="14">tc</text>}
      {regimen === "fijo" && (
        <g data-poste>
          <path d={`M${CX0} ${CYM}H${CX1}`} stroke={INK_2} strokeWidth="1.5" strokeDasharray="4 4" />
          <rect x={px - 3} y={CYM - 4} width="6" height="40" fill={INK_2} />
          {!mini && <text x="150" y="118" textAnchor="middle" fill={INK} fontSize="14" fontWeight="700" data-letrero-bolivia>{A7.bolivia}</text>}
        </g>
      )}
      {regimen === "banda" && (
        <g data-techo-piso>
          <path d={`M${CX0} ${CYM - 22}H${CX1}M${CX0} ${CYM + 22}H${CX1}`} stroke={CAMBIARIA} strokeWidth="2.5" strokeDasharray="7 4" />
          {!mini && <text x={CX1} y={CYM - 28} textAnchor="end" fill={INK} fontSize="14" fontWeight="600">{A7.techo}</text>}
          {!mini && <text x={CX1} y={CYM + 40} textAnchor="end" fill={INK} fontSize="14" fontWeight="600">{A7.piso}</text>}
        </g>
      )}
      {regimen === "gota" && <path d={`M${CX0} ${CYM + 24}L${CX1 - 16} ${CYM - 26}`} stroke={CAMBIARIA} strokeWidth="2.5" strokeDasharray="7 4" data-rampa />}
      {regimen === "flexible" && sucia && <path d={`M${CX0} ${CYM - 14}H${CX1}M${CX0} ${CYM + 14}H${CX1}`} stroke={INK_2} strokeWidth="1" strokeDasharray="2 5" />}
      <path d={d} stroke={INK} strokeWidth="2.5" fill="none" strokeLinejoin="round" data-rastro />
      {anclaY != null && <path d={`M${px} ${py}L${px - 18} ${anclaY + (regimen === "fijo" ? 0 : 0)}`} stroke={INK_2} strokeWidth="2" data-correa-linea />}
      {jala && <text x={px - 22} y={py - 12} fill={CAMBIARIA} fontSize="18" fontWeight="800" data-jalon>↩</text>}
      <Perro x={px} y={py} />
    </svg>
  );
}
const REG_NOMBRE = { fijo: "Fijo", banda: "Banda", gota: "Gota a gota", flexible: "Flexible" };
