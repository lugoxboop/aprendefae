/*
 * Microvideo de prueba — Macroeconomía · La ley de la demanda (Jane, 25-nov-2026)
 *
 * Una idea: si sube el precio, baja la cantidad demandada (ceteris paribus), y
 * eso es un movimiento SOBRE la curva, no un desplazamiento de la curva.
 *
 * Pares precio-cantidad (todos sobre la misma recta P = 3.500 − 500·Q):
 *   $1.000 → 5   ·   $2.000 → 3   ·   $3.000 → 1   ·   $1.500 → 4
 *
 * Todo se mueve por cuadro (useCurrentFrame): nada de animaciones CSS, que en el
 * render no van sincronizadas. Las marionetas son las del repo
 * (src/mascota/marionetas.js → svgMarioneta), con sus piezas movidas aquí por
 * variables CSS (cabeza, ojos, cola, brazos, respiración).
 */
import { useEffect, useState } from "react";
import {
  AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate,
  Easing, delayRender, continueRender,
} from "remotion";
import MASCOTAS from "./mascotas.json";
import FRASES from "./frases.json";

export const FPS = 30;

/* ── Paleta (tokens del sitio, tema oscuro de Macro 2026: colores-da.js) ── */
const FONDO = "#0E1B2E";
const SUPERFICIE = "#16263D";
const SUPERFICIE_2 = "#1F3250";
const BORDE = "#3a4a63";
const INK = "#f4f5f7";
const INK_2 = "#b6bbc5";
const TINTA = "#121418";
const ACENTO = "#6f86ff"; // --accent
const AZUL = "#2747F5";
const GRIS_AZUL = "#C9D1E4";
const MANGO = "#f2c14e"; // --warning
const MANGO_SOMBRA = "#d9a53a";
const HOJA = "#4fc2b2"; // --success

const EASE = Easing.bezier(0.3, 0.9, 0.4, 1); // la curva del sitio

/* ── Tiempos: salen del audio real (frases.json = duración medida de cada frase) ── */
const PRE = [0.25, 1.0, 0.5, 0.45, 0.45, 0.55, 0.45, 0.5, 0.45];
const COLA = 1.4;
const INICIO = [];
{
  let t = 0;
  FRASES.forEach((e, i) => { t += PRE[i]; INICIO.push(t); t += e.dur; });
}
export const DURACION_S = INICIO[8] + FRASES[8].dur + COLA;
const T = (i, j = 0) => INICIO[i] + FRASES[i].frases[j].ini;   // empieza la frase
const F = (i, j) => INICIO[i] + FRASES[i].frases[j].fin;       // termina la frase
const FIN = (i) => INICIO[i] + FRASES[i].dur;                  // termina la escena

/* utilidades */
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const prog = (t, t0, d) => EASE(clamp01((t - t0) / d));
const lerp = (a, b, p) => a + (b - a) * p;

/* ── Precio del letrero en el tiempo ── */
const PRECIOS = [
  [0, 1000],
  [T(0) + 0.45, 3000],        // gancho: «si el mango sube»
  [FIN(0) + 0.25, 1000],      // volvemos al principio
  [T(2), 2000],
  [T(3), 3000],
  [T(4), 1500],
];
const fmt = (p) => "$" + p.toLocaleString("es-CO").replace(/,/g, ".");
function precioEn(t) {
  let k = 0;
  PRECIOS.forEach(([tt], i) => { if (t >= tt) k = i; });
  return { k, valor: PRECIOS[k][1], antes: PRECIOS[Math.max(0, k - 1)][1], desde: PRECIOS[k][0] };
}

/* ── Los compradores ── */
const FRENTE = { base: 1078, alto: 430 };
const ATRAS = { base: 950, alto: 410 };
const COMPRADORES = [
  { id: "A", esp: "zorro", fila: FRENTE, x: 180, salida: -340 },
  { id: "B", esp: "gato", fila: FRENTE, x: 540, salida: null },
  { id: "C", esp: "conejo", fila: FRENTE, x: 900, salida: 1420 },
  { id: "D", esp: "panda", fila: ATRAS, x: 360, salida: -340 },
  { id: "E", esp: "perro", fila: ATRAS, x: 720, salida: 1420 },
];
/* Estado de cada uno: dentro (compra o mira), atras (duda, en el gancho), fuera */
const ESTADOS = {
  A: [[0, "dentro"], [T(0, 2), "atras"], [FIN(0) + 0.25, "dentro"], [T(3, 1), "fuera"], [T(4, 1), "dentro"]],
  B: [[0, "dentro"]],
  C: [[0, "dentro"], [T(0, 2) + 0.1, "atras"], [FIN(0) + 0.25, "dentro"], [T(3, 1) + 0.12, "fuera"]],
  D: [[0, "dentro"], [T(0, 2) + 0.05, "atras"], [FIN(0) + 0.25, "dentro"], [T(2, 1), "fuera"], [T(4, 1) + 0.1, "dentro"]],
  E: [[0, "dentro"], [T(0, 2) + 0.15, "atras"], [FIN(0) + 0.25, "dentro"], [T(2, 1) + 0.12, "fuera"], [T(4, 1) + 0.2, "dentro"]],
};
/* Mango en la pata: cuándo lo recibe y cuándo lo deja */
const MANGOS = {
  A: [[T(1, 1) + 0.2, 1], [T(3, 1) - 0.32, 0], [T(4, 2), 1]],
  B: [[T(1, 1) + 0.45, 1]],
  C: [[T(1, 1) + 0.7, 1], [T(3, 1) - 0.2, 0]],
  D: [[T(1, 1) + 0.95, 1], [T(2, 1) - 0.32, 0], [T(4, 2) + 0.15, 1]],
  E: [[T(1, 1) + 1.2, 1], [T(2, 1) - 0.2, 0], [T(4, 2) + 0.3, 1]],
};

function tramo(lista, t) {
  let k = 0;
  lista.forEach(([tt], i) => { if (t >= tt) k = i; });
  return { actual: lista[k][1], previo: lista[Math.max(0, k - 1)][1], desde: lista[k][0], k };
}

function posicion(c, t) {
  const { actual, previo, desde, k } = tramo(ESTADOS[c.id], t);
  const lugar = (e) => {
    if (e === "fuera") return { x: c.salida ?? c.x, esc: 1, op: 1 };
    if (e === "atras") return { x: c.x + (c.x < 540 ? -40 : 40), esc: 0.86, op: 0.38 };
    return { x: c.x, esc: 1, op: 1 };
  };
  const a = lugar(k === 0 ? actual : previo), b = lugar(actual);
  const dur = actual === "fuera" || previo === "fuera" ? 1.0 : 0.45;
  const p = prog(t, desde, dur);
  const caminando = (actual === "fuera" || previo === "fuera") && p > 0 && p < 1 && k > 0;
  return {
    x: lerp(a.x, b.x, p), esc: lerp(a.esc, b.esc, p), op: lerp(a.op, b.op, p),
    caminando, dir: Math.sign(b.x - a.x), fase: (t - desde),
  };
}

/* ── Marioneta: el SVG del repo, con sus piezas movidas por variables CSS ── */
const ESTILO = `
.mv .mta * { transform-box: fill-box; }
.mv .mta-cara, .mv .mta-aura, .mv .mta-fuego, .mv .mta-confeti, .mv .mta-notas,
.mv .mta-corazones, .mv .mta-estrellas, .mv .mta-obj, .mv .mta-birrete, .mv .mta-chispas,
.mv .mta-lagrima, .mv.sin-cola .mta-cola { display: none; }
.mv.cara-tranquila .mta-c-tranquila, .mv.cara-feliz .mta-c-feliz { display: inline; }
.mv .mta-cabeza { transform-origin: 50% 95%; transform: rotate(var(--cab, 0deg)); }
.mv .mta-cola { transform-origin: 5% 85%; transform: rotate(var(--cola, 0deg)); }
.mv .mta-ojos { transform-origin: 50% 50%; transform: scaleY(var(--ojo, 1)); }
.mv .mta-cuerpo { transform-origin: 50% 100%; transform: scaleY(var(--resp, 1)); }
.mv .mta-brazo-i { transform-origin: 90% 8%; transform: rotate(var(--bi, 0deg)); }
.mv .mta-brazo-d { transform-origin: 10% 8%; transform: rotate(var(--bd, 0deg)); }
.mv .mta-oreja-i { transform-origin: 70% 95%; transform: rotate(var(--oi, 0deg)); }
.mv .mta-oreja-d { transform-origin: 30% 95%; transform: rotate(var(--od, 0deg)); }
@font-face { font-family: "Inter"; font-weight: 500; src: url("${staticFile("fonts/inter-latin-500-normal.woff2")}") format("woff2"); }
@font-face { font-family: "Inter"; font-weight: 600; src: url("${staticFile("fonts/inter-latin-600-normal.woff2")}") format("woff2"); }
@font-face { font-family: "Inter"; font-weight: 700; src: url("${staticFile("fonts/inter-latin-700-normal.woff2")}") format("woff2"); }
@font-face { font-family: "Sora"; font-weight: 600; src: url("${staticFile("fonts/sora-latin-600-normal.woff2")}") format("woff2"); }
@font-face { font-family: "Sora"; font-weight: 700; src: url("${staticFile("fonts/sora-latin-700-normal.woff2")}") format("woff2"); }
`;

const BASE_MASCOTAS = staticFile("mascotas");
const svgDe = (esp) => MASCOTAS[esp].inner.replaceAll('href="/mascotas', `href="${BASE_MASCOTAS}`);

function Marioneta({ esp, alto, t, sinCola = false, semilla = 0, cab = 0, bi = 0, bd = 0, cara = "tranquila", saltito = 0 }) {
  const [vx, vy, vw, vh] = MASCOTAS[esp].viewBox.split(" ").map(Number);
  const ancho = (alto * vw) / vh;
  /* parpadeo: cada ~3,1 s, 0,14 s */
  const ciclo = (t + semilla * 0.83) % 3.1;
  const ojo = ciclo < 0.14 ? Math.max(0.1, Math.abs(ciclo - 0.07) / 0.07) : 1;
  const resp = 1 + 0.012 * Math.sin((t + semilla) * 2.1);
  const cola = 6 * Math.sin((t + semilla * 0.5) * 2.4);
  const oreja = 3 * Math.sin((t + semilla) * 1.3);
  return (
    <svg
      className={`mv cara-${cara}${sinCola ? " sin-cola" : ""}`}
      width={ancho}
      height={alto}
      viewBox={`${vx} ${vy} ${vw} ${vh}`}
      style={{
        display: "block", overflow: "visible",
        "--ojo": ojo, "--resp": resp, "--cola": `${cola}deg`, "--cab": `${cab}deg`,
        "--bi": `${bi}deg`, "--bd": `${bd}deg`, "--oi": `${oreja}deg`, "--od": `${-oreja}deg`,
        transform: saltito ? `translateY(${-saltito}px)` : undefined,
      }}
      dangerouslySetInnerHTML={{ __html: svgDe(esp) }}
    />
  );
}

/* ── Un mango (dibujado aquí, con el contorno grueso de las mascotas) ── */
function Mango({ size = 90, giro = -18, brillo = 0 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible", display: "block" }}>
      {brillo > 0 && <circle cx="50" cy="55" r={52} fill={MANGO} opacity={0.22 * brillo} />}
      <g transform={`rotate(${giro} 50 55)`}>
        <path d="M50 14 C78 14 92 40 88 62 C84 84 66 94 48 92 C26 90 10 74 12 52 C14 30 30 14 50 14 Z"
          fill={MANGO} stroke={TINTA} strokeWidth="5" strokeLinejoin="round" />
        <path d="M22 60 C24 78 38 88 52 88 C40 82 30 72 26 56 Z" fill={MANGO_SOMBRA} />
        <path d="M36 30 C42 24 50 22 56 24" stroke="#fff6dc" strokeWidth="5" strokeLinecap="round" fill="none" opacity=".8" />
        <path d="M50 16 C52 8 56 4 60 2" stroke={TINTA} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M56 8 C66 -2 82 0 86 6 C76 12 64 14 56 8 Z" fill={HOJA} stroke={TINTA} strokeWidth="4" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

/* ── El puesto ── */
function Puesto({ t }) {
  const { valor, antes, desde, k } = precioEn(t);
  const p = clamp01((t - desde) / 0.36);
  const volteo = k > 0 && p < 1;
  const muestra = volteo && p < 0.5 ? antes : valor;
  const escY = volteo ? Math.abs(Math.cos(p * Math.PI)) : 1;
  /* el letrero se balancea al voltearse */
  const balanceo = k > 0 ? 4 * Math.exp(-(t - desde) * 3) * Math.sin((t - desde) * 12) : 0;
  /* el brillo de los mangos: en «lo queremos igual» (las ganas no cambian) */
  const brillo = interpolate(t, [T(0, 1) - 0.1, T(0, 1) + 0.3, F(0, 1) + 0.2, F(0, 1) + 0.7], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subio = k > 0 && valor > antes;
  const flecha = k > 0 ? clamp01(1 - (t - desde - 0.3) / 1.0) * clamp01((t - desde) / 0.2) : 0;

  /* el vendedor (hurón) voltea el letrero: sube el brazo en cada cambio */
  const brazo = k > 0 ? -55 * clamp01(1 - Math.abs(t - desde - 0.1) / 0.45) : 0;

  const franjas = [];
  for (let i = 0; i < 8; i++) {
    franjas.push(<rect key={i} x={140 + i * 100} y={92} width={100} height={128} fill={i % 2 ? GRIS_AZUL : ACENTO} />);
  }
  const ondas = [];
  for (let i = 0; i < 8; i++) {
    ondas.push(<path key={i} d={`M${140 + i * 100} 218 q50 46 100 0 Z`} fill={i % 2 ? GRIS_AZUL : ACENTO} stroke={TINTA} strokeWidth="6" strokeLinejoin="round" />);
  }
  return (
    <>
      {/* postes y toldo */}
      <svg width={1080} height={700} style={{ position: "absolute", left: 0, top: 0 }}>
        <rect x="160" y="200" width="22" height="420" fill={SUPERFICIE_2} stroke={TINTA} strokeWidth="5" />
        <rect x="898" y="200" width="22" height="420" fill={SUPERFICIE_2} stroke={TINTA} strokeWidth="5" />
        <g>
          {franjas}
          <rect x="140" y="92" width="800" height="128" fill="none" stroke={TINTA} strokeWidth="6" />
          {ondas}
        </g>
      </svg>
      {/* vendedor, detrás del mostrador */}
      <div style={{ position: "absolute", left: 190, top: 230 }}>
        <Marioneta esp="huron" alto={330} t={t} semilla={2} bd={brazo} cab={brazo ? 6 : 0} sinCola />
      </div>
      {/* letrero del precio, colgado del toldo */}
      <div style={{ position: "absolute", left: 548, top: 262, width: 372, transformOrigin: "50% -40px", transform: `rotate(${balanceo}deg)` }}>
        <svg width={372} height={60} style={{ position: "absolute", top: -48, left: 0 }}>
          <line x1="80" y1="0" x2="80" y2="52" stroke={TINTA} strokeWidth="5" />
          <line x1="292" y1="0" x2="292" y2="52" stroke={TINTA} strokeWidth="5" />
        </svg>
        <div style={{
          background: INK, border: `6px solid ${TINTA}`, borderRadius: 22, height: 138,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 14,
          transform: `scaleY(${escY})`,
        }}>
          <Mango size={70} giro={-20} />
          <span style={{ fontFamily: "Sora", fontWeight: 700, fontSize: 68, color: TINTA, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{fmt(muestra)}</span>
        </div>
        {/* flechita del cambio, junto al letrero */}
        {flecha > 0 && (
          <div style={{ position: "absolute", left: 384, top: 30, opacity: flecha, transform: `translateY(${(subio ? -1 : 1) * 14 * (1 - flecha)}px)` }}>
            <svg width="70" height="80" viewBox="0 0 70 80">
              <path d={subio ? "M35 6 L64 44 H46 V76 H24 V44 H6 Z" : "M35 74 L64 36 H46 V4 H24 V36 H6 Z"} fill={ACENTO} stroke={TINTA} strokeWidth="5" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>
      {/* mostrador con la caja de mangos */}
      <div style={{ position: "absolute", left: 120, top: 486, width: 840, height: 150 }}>
        <div style={{ position: "absolute", left: 300, top: -92, display: "flex", gap: 0 }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ marginLeft: i ? -18 : 0, transform: `translateY(${i % 2 ? 10 : 0}px)` }}>
              <Mango size={92} giro={-25 + i * 9} brillo={brillo} />
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", left: 0, top: 0, width: 840, height: 150, background: SUPERFICIE_2, border: `6px solid ${TINTA}`, borderRadius: 18 }} />
        <div style={{ position: "absolute", left: 0, top: 0, width: 840, height: 36, background: GRIS_AZUL, border: `6px solid ${TINTA}`, borderRadius: "18px 18px 0 0" }} />
        <Rotulo x={8} y={4} chico>Vendedor</Rotulo>
        
      </div>
    </>
  );
}

function Rotulo({ x, y, children, op = 1, chico = false }) {
  return (
    <div style={{
      position: "absolute", left: x, top: y, opacity: op,
      fontFamily: "Inter", fontWeight: 600, fontSize: chico ? 38 : 40, color: INK,
      background: "rgba(14,27,46,.78)", border: `3px solid ${BORDE}`, borderRadius: 12, padding: "4px 18px",
      whiteSpace: "nowrap",
    }}>{children}</div>
  );
}

/* ── El mercado: puesto + compradores ── */
function Mercado({ t }) {
  const dim = interpolate(t, [T(5) - 0.2, T(5) + 0.4, T(8) - 0.3, T(8) + 0.2], [1, 0.24, 0.24, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  /* en el gancho todas miran el letrero; en «lo queremos igual», los mangos */
  const miraLetrero = interpolate(t, [T(0) + 0.3, T(0) + 0.7, T(0, 1) - 0.1, T(0, 1) + 0.3], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const miraMangos = interpolate(t, [T(0, 1) - 0.1, T(0, 1) + 0.3, F(0, 1) + 0.3, F(0, 1) + 0.7], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const final = prog(t, T(8), 0.5);

  const orden = [...COMPRADORES].sort((a, b) => (a.fila === ATRAS ? 0 : 1) - (b.fila === ATRAS ? 0 : 1));
  return (
    <AbsoluteFill style={{ opacity: dim }}>
      {/* suelo */}
      <div style={{ position: "absolute", left: 0, top: 640, width: 1080, height: 470, background: SUPERFICIE, borderTop: `6px solid ${BORDE}` }} />
      <Puesto t={t} />
      {orden.map((c, n) => {
        const pos = posicion(c, t);
        const alto = c.fila.alto * pos.esc;
        const [, , vw, vh] = MASCOTAS[c.esp].viewBox.split(" ").map(Number);
        const ancho = (alto * vw) / vh;
        const rebote = pos.caminando ? Math.abs(Math.sin(pos.fase * 11)) * 22 : 0;
        const ladeo = pos.caminando ? 5 * Math.sin(pos.fase * 11) : 0;
        /* hacia dónde gira la cabeza */
        const haciaLetrero = c.x < 755 ? 9 : -9;
        const haciaMangos = c.x < 640 ? 7 : -7;
        const cab = haciaLetrero * miraLetrero + haciaMangos * miraMangos;
        const m = tramo(MANGOS[c.id], t);
        const tiene = m.k === 0 && t < MANGOS[c.id][0][0] ? 0 : m.actual;
        const pm = clamp01((t - m.desde) / 0.3);
        const escMango = t < MANGOS[c.id][0][0] ? 0 : tiene ? EASE(pm) * (1 + 0.25 * Math.sin(pm * Math.PI)) : 1 - EASE(pm);
        const saluda = final > 0 && final < 1 ? 0 : 0;
        return (
          <div key={c.id} style={{
            position: "absolute", left: pos.x - ancho / 2, top: c.fila.base - alto, width: ancho, height: alto,
            opacity: pos.op, transform: `rotate(${ladeo}deg)`, transformOrigin: "50% 100%",
          }}>
            <Marioneta esp={c.esp} alto={alto} t={t} semilla={n * 1.7} cab={cab} saltito={rebote} bi={saluda} />
          </div>
        );
      })}
      {/* Los mangos van en su propia capa, por encima de todas las mascotas:
          así ninguno queda tapado y el conteo se ve siempre (5 · 3 · 1 · 4). */}
      {orden.map((c) => {
        const pos = posicion(c, t);
        const alto = c.fila.alto * pos.esc;
        const [, , vw, vh] = MASCOTAS[c.esp].viewBox.split(" ").map(Number);
        const ancho = (alto * vw) / vh;
        const rebote = pos.caminando ? Math.abs(Math.sin(pos.fase * 11)) * 22 : 0;
        const m = tramo(MANGOS[c.id], t);
        const tiene = m.k === 0 && t < MANGOS[c.id][0][0] ? 0 : m.actual;
        const pm = clamp01((t - m.desde) / 0.3);
        const escMango = t < MANGOS[c.id][0][0] ? 0 : tiene ? EASE(pm) * (1 + 0.25 * Math.sin(pm * Math.PI)) : 1 - EASE(pm);
        if (escMango <= 0.01) return null;
        /* los de atrás (panda y perro) lo sostienen sobre el pecho, que es lo que se les ve */
        const [fx, fy] = c.id === "D" ? [0.37, 0.52] : c.id === "E" ? [0.36, 0.52] : [0.62, 0.6];
        return (
          <div key={"m" + c.id} style={{
            position: "absolute", left: pos.x - ancho / 2 + ancho * fx, top: c.fila.base - alto + alto * fy - rebote,
            width: 100, height: 100, opacity: pos.op,
            transform: `scale(${escMango * (alto / 430)})`, transformOrigin: "50% 50%",
          }}>
            <Mango size={100} giro={12} />
          </div>
        );
      })}
      <Rotulo x={385} y={1084} op={interpolate(t, [0.2, 0.6, T(8) - 0.2, T(8) + 0.1], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>Compradores</Rotulo>
    </AbsoluteFill>
  );
}

/* ── La gráfica ── */
const PX0 = 250, PX1 = 960, PY0 = 1222, PY1 = 1598;
const QMAX = 6.5, PMAX = 3600;
const X = (q) => PX0 + (q / QMAX) * (PX1 - PX0);
const Y = (p) => PY1 - (p / PMAX) * (PY1 - PY0);
const P_DE_Q = (q) => 3500 - 500 * q;

/* por dónde va el punto «hoy» (el estado del mercado) */
const RECORRIDO = [
  [F(1, 1) - 0.1, 5],   // aparece en (5, $1.000)
  [T(2, 2), 3],         // «se venden tres mangos»
  [T(3, 1) + 0.3, 1],   // «solo compra uno»
  [T(4, 2), 4],         // «cuatro mangos»
  [T(6, 0), 1],         // «precio más alto…»
  [T(7, 1), 5],         // «nos movimos sobre ella»
  [T(7, 1) + 1.15, 3],
];
function qEn(t) {
  let q = RECORRIDO[0][1];
  for (let i = 1; i < RECORRIDO.length; i++) {
    const [tt, qq] = RECORRIDO[i];
    const d = i === 5 ? 1.0 : i === 6 ? 0.9 : 0.75;
    if (t >= tt) q = lerp(q, qq, prog(t, tt, d));
  }
  return q;
}
/* los puntos que van quedando (pares observados) */
const PUNTOS = [
  { q: 5, aparece: F(1, 1) - 0.1 },
  { q: 3, aparece: T(2, 2) + 0.7 },
  { q: 1, aparece: T(3, 1) + 1.0 },
  { q: 4, aparece: T(4, 2) + 0.7 },
];

function Grafica({ t }) {
  const entra = prog(t, 0.1, 0.6);
  const sale = prog(t, T(8) - 0.1, 0.5);
  const marcadorOp = clamp01((t - (F(1, 1) - 0.1)) / 0.25);
  const q = qEn(t);
  const p = P_DE_Q(q);
  const linea = prog(t, T(5) + 0.1, 1.3);
  const etiquetaD = prog(t, T(5, 1), 0.4);
  const chevron = clamp01((t - T(5, 2)) / 1.5);
  const subeP = interpolate(t, [T(6) - 0.05, T(6) + 0.25, F(6, 1) + 0.5, F(6, 1) + 0.9], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bajaQ = interpolate(t, [T(6, 1) - 0.05, T(6, 1) + 0.25, F(6, 1) + 0.5, F(6, 1) + 0.9], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ceteris = prog(t, T(6, 2), 0.4);
  const ley = prog(t, T(6, 3), 0.4);
  const pulso = t > T(7) && t < T(7, 1) ? 0.5 + 0.5 * Math.sin((t - T(7)) * 9) : 0;
  const y15 = prog(t, T(4), 0.4);

  const ticksP = [1000, 2000, 3000];
  const q0 = 0.25, q1 = 6.4;
  const qFin = lerp(q0, q1, linea);

  return (
    <AbsoluteFill style={{ opacity: entra * (1 - sale), transform: `translateY(${(1 - entra) * 30}px) scale(${1 - 0.04 * sale})`, transformOrigin: "50% 1420px" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <rect x="40" y="1140" width="1000" height="572" rx="28" fill={SUPERFICIE} stroke={BORDE} strokeWidth="3" />
        {/* ejes */}
        <line x1={PX0} y1={PY1} x2={PX1 + 20} y2={PY1} stroke={INK_2} strokeWidth="4" />
        <line x1={PX0} y1={PY1} x2={PX0} y2={PY0 - 30} stroke={INK_2} strokeWidth="4" />
        <path d={`M${PX1 + 34} ${PY1} l-18 -10 v20 z`} fill={INK_2} />
        <path d={`M${PX0} ${PY0 - 44} l-10 18 h20 z`} fill={INK_2} />
        <text x={PX0 - 30} y={PY0 - 52} fill={INK} fontFamily="Inter" fontWeight="600" fontSize="42">Precio</text>
        <text x={(PX0 + PX1) / 2} y={1698} fill={INK} fontFamily="Inter" fontWeight="600" fontSize="42" textAnchor="middle">Cantidad de mangos</text>
        {ticksP.map((v) => (
          <g key={v}>
            <line x1={PX0 - 12} y1={Y(v)} x2={PX0} y2={Y(v)} stroke={INK_2} strokeWidth="4" />
            <text x={PX0 - 22} y={Y(v) + 14} fill={INK_2} fontFamily="Inter" fontWeight="500" fontSize="40" textAnchor="end">{fmt(v)}</text>
          </g>
        ))}
        <g opacity={y15}>
          <line x1={PX0 - 12} y1={Y(1500)} x2={PX0} y2={Y(1500)} stroke={INK_2} strokeWidth="4" />
          <text x={PX0 - 22} y={Y(1500) + 14} fill={INK_2} fontFamily="Inter" fontWeight="500" fontSize="40" textAnchor="end">{fmt(1500)}</text>
        </g>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <g key={n}>
            <line x1={X(n)} y1={PY1} x2={X(n)} y2={PY1 + 12} stroke={INK_2} strokeWidth="4" />
            <text x={X(n)} y={PY1 + 50} fill={INK_2} fontFamily="Inter" fontWeight="500" fontSize="40" textAnchor="middle">{n}</text>
          </g>
        ))}

        {/* la curva de demanda, que se dibuja al unir los puntos */}
        {linea > 0 && (
          <line x1={X(q0)} y1={Y(P_DE_Q(q0))} x2={X(qFin)} y2={Y(P_DE_Q(qFin))}
            stroke={INK} strokeWidth={7 + 5 * pulso} strokeLinecap="round" />
        )}
        {etiquetaD > 0 && (
          <text x={X(q1) + 8} y={Y(P_DE_Q(q1)) - 26} fill={INK} fontFamily="Sora" fontWeight="700" fontSize="50" opacity={etiquetaD}>D</text>
        )}
        {chevron > 0 && chevron < 1 && (() => {
          const qc = lerp(0.6, 6.0, EASE(chevron));
          const ang = (Math.atan2(Y(P_DE_Q(qc + 0.1)) - Y(P_DE_Q(qc)), X(qc + 0.1) - X(qc)) * 180) / Math.PI;
          return (
            <g transform={`translate(${X(qc)} ${Y(P_DE_Q(qc))}) rotate(${ang})`} opacity={Math.sin(chevron * Math.PI)}>
              <path d="M-6 -30 L30 0 L-6 30" fill="none" stroke={ACENTO} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          );
        })()}

        {/* puntos observados (huecos) */}
        {PUNTOS.map((pt) => {
          const a = clamp01((t - pt.aparece) / 0.3);
          if (a <= 0) return null;
          return <circle key={pt.q} cx={X(pt.q)} cy={Y(P_DE_Q(pt.q))} r={16 * EASE(a)} fill={FONDO} stroke={INK} strokeWidth="6" />;
        })}

        {/* guías y punto de hoy */}
        {marcadorOp > 0 && (
          <g opacity={marcadorOp}>
            <line x1={PX0} y1={Y(p)} x2={X(q)} y2={Y(p)} stroke={ACENTO} strokeWidth="4" strokeDasharray="10 10" />
            <line x1={X(q)} y1={PY1} x2={X(q)} y2={Y(p)} stroke={ACENTO} strokeWidth="4" strokeDasharray="10 10" />
            <circle cx={X(q)} cy={Y(p)} r={30} fill={ACENTO} opacity=".25" />
            <circle cx={X(q)} cy={Y(p)} r={19} fill={ACENTO} stroke={TINTA} strokeWidth="5" />
          </g>
        )}

        {/* precio más alto ↑ · cantidad menor ← */}
        {subeP > 0 && (
          <g opacity={subeP}>
            <path d={`M${PX0 - 188} ${Y(1700)} V${Y(3150)}`} stroke={ACENTO} strokeWidth="10" strokeLinecap="round" />
            <path d={`M${PX0 - 188} ${Y(3350)} l-22 34 h44 z`} fill={ACENTO} />
          </g>
        )}
        {bajaQ > 0 && (
          <g opacity={bajaQ}>
            <path d={`M${X(3.9)} ${PY1 - 36} H${X(1.3)}`} stroke={ACENTO} strokeWidth="10" strokeLinecap="round" />
            <path d={`M${X(1.0)} ${PY1 - 36} l34 -22 v44 z`} fill={ACENTO} />
          </g>
        )}
      </svg>
      {/* rótulos de la idea */}
      <div style={{ position: "absolute", right: 70, top: 1166, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 14 }}>
        <div style={{
          opacity: ley, transform: `translateY(${(1 - ley) * 16}px)`,
          fontFamily: "Sora", fontWeight: 700, fontSize: 44, color: TINTA, background: INK, borderRadius: 14, padding: "8px 22px",
        }}>Ley de la demanda</div>
        <div style={{
          opacity: ceteris, transform: `translateY(${(1 - ceteris) * 16}px)`,
          fontFamily: "Inter", fontWeight: 600, fontStyle: "italic", fontSize: 40, color: INK, border: `3px solid ${ACENTO}`, borderRadius: 14, padding: "6px 20px",
          background: "rgba(14,27,46,.85)",
        }}>ceteris paribus</div>
      </div>
    </AbsoluteFill>
  );
}

/* ── Cierre: las dos preguntas de la actividad ── */
function MiniGrafica({ modo, t, t0, activo }) {
  const w = 440, h = 330;
  const x = (q) => 70 + (q / 6.5) * 340;
  const y = (p) => 280 - (p / 3600) * 240;
  const pq = (q, s = 0) => 3500 - 500 * (q - s);
  const ciclo = ((t - t0) % 2.2) / 2.2;
  const vaiven = EASE(Math.min(1, ciclo * 1.6));
  return (
    <svg width={w} height={h}>
      <line x1="70" y1="280" x2="420" y2="280" stroke={INK_2} strokeWidth="4" />
      <line x1="70" y1="280" x2="70" y2="30" stroke={INK_2} strokeWidth="4" />
      {modo === "curva" ? (
        <>
          <line x1={x(0.3)} y1={y(pq(0.3))} x2={x(6.3)} y2={y(pq(6.3))} stroke={INK_2} strokeWidth="5" strokeDasharray="12 10" strokeLinecap="round" />
          {(() => {
            const s = 1.2 * vaiven;
            const a = Math.max(0.3, 0.3 + s), b = Math.min(6.4, 6.3 + s);
            return <line x1={x(a)} y1={y(pq(a, s))} x2={x(b)} y2={y(pq(b, s))} stroke={INK} strokeWidth="7" strokeLinecap="round" />;
          })()}
          <g opacity={activo ? 1 : 0.55} transform={`translate(${x(3.6)} ${y(pq(3.6)) - 70})`}>
            <path d="M0 0 H70" stroke={ACENTO} strokeWidth="10" strokeLinecap="round" />
            <path d="M92 0 l-30 -20 v40 z" fill={ACENTO} />
          </g>
        </>
      ) : (
        <>
          <line x1={x(0.3)} y1={y(pq(0.3))} x2={x(6.3)} y2={y(pq(6.3))} stroke={INK} strokeWidth="7" strokeLinecap="round" />
          {(() => {
            const q = lerp(1.2, 5, vaiven);
            return <circle cx={x(q)} cy={y(pq(q))} r="17" fill={ACENTO} stroke={TINTA} strokeWidth="5" />;
          })()}
        </>
      )}
    </svg>
  );
}

function Cierre({ t }) {
  const entra = prog(t, T(8) + 0.45, 0.5);
  if (entra <= 0) return null;
  const izq = t >= T(8, 1) && t < T(8, 2) + 0.05;
  const der = t >= T(8, 2);
  const tarjeta = (activo) => ({
    width: 480, height: 400, borderRadius: 28, background: SUPERFICIE,
    border: `5px solid ${activo ? ACENTO : BORDE}`, display: "flex", alignItems: "center", justifyContent: "center",
    transform: `scale(${activo ? 1.03 : 1})`, transition: "none",
  });
  return (
    <AbsoluteFill style={{ opacity: entra, transform: `translateY(${(1 - entra) * 40}px)` }}>
      <div style={{ position: "absolute", left: 40, top: 1200, width: 1000, display: "flex", justifyContent: "space-between" }}>
        <div style={tarjeta(izq)}><MiniGrafica modo="curva" t={t} t0={T(8, 1)} activo={izq} /></div>
        <div style={tarjeta(der)}><MiniGrafica modo="punto" t={t} t0={T(8, 2)} activo={der} /></div>
      </div>
      <div style={{ position: "absolute", left: 0, width: 1080, top: 1130, textAlign: "center", fontFamily: "Sora", fontWeight: 700, fontSize: 42, color: INK_2, letterSpacing: "-0.02em" }}>
        En la actividad
      </div>
    </AbsoluteFill>
  );
}

/* ── Subtítulos: las mismas frases de la voz, con su tiempo medido ── */
const CIFRAS = [
  [/mil quinientos/g, "$1.500"], [/tres mil pesos/g, "$3.000"], [/dos mil/g, "$2.000"], [/mil pesos/g, "$1.000"],
];
const CORTES = {
  "cinco compradores se llevan un mango cada uno.": ["cinco compradores", "se llevan un mango cada uno."],
  "Si el mango sube, ¿lo queremos menos?": ["Si el mango sube,", "¿lo queremos menos?"],
};
function trozos() {
  const out = [];
  FRASES.forEach((e, i) => e.frases.forEach((f, j) => {
    let txt = f.texto;
    CIFRAS.forEach(([re, s]) => { txt = txt.replace(re, s); });
    const previo = j > 0 ? e.frases[j - 1].texto : ".";
    if (/[.?]$/.test(previo)) txt = txt.charAt(0).toUpperCase() + txt.slice(1);
    if (txt.endsWith("?") && !txt.includes("¿") && !e.frases.slice(0, j).some((g) => g.texto.includes("¿"))) txt = "¿" + txt;
    const ini = INICIO[i] + f.ini, fin = INICIO[i] + f.fin;
    /* frases largas: en dos, cortadas por palabras, con el tiempo repartido por letras */
    const aMano = CORTES[f.texto];
    if (aMano) {
      const [a, b] = aMano;
      const corte = ini + ((fin - ini) * a.length) / (a.length + b.length);
      out.push({ txt: a, ini, fin: corte });
      out.push({ txt: b, ini: corte, fin });
    } else if (txt.length > 34) {
      const pal = txt.split(" ");
      let mejor = 1, dif = 1e9;
      for (let k = 1; k < pal.length; k++) {
        const a = pal.slice(0, k).join(" ").length;
        if (Math.abs(a - txt.length / 2) < dif) { dif = Math.abs(a - txt.length / 2); mejor = k; }
      }
      const a = pal.slice(0, mejor).join(" "), b = pal.slice(mejor).join(" ");
      const corte = ini + ((fin - ini) * a.length) / (a.length + b.length);
      out.push({ txt: a, ini, fin: corte });
      out.push({ txt: b, ini: corte, fin });
    } else out.push({ txt, ini, fin });
  }));
  /* cada trozo se queda hasta que empieza el siguiente (máx. 0,5 s de más) */
  out.forEach((o, k) => {
    const sig = out[k + 1];
    o.hasta = sig ? Math.min(sig.ini, o.fin + 0.5) : o.fin + 0.8;
  });
  return out;
}
export const SUBTITULOS = trozos();

function Subtitulos({ t }) {
  const s = SUBTITULOS.find((o) => t >= o.ini - 0.04 && t < o.hasta);
  if (!s) return null;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 1736, display: "flex", justifyContent: "center" }}>
      <div style={{
        maxWidth: 1000, textAlign: "center", fontFamily: "Inter", fontWeight: 600, fontSize: 58, lineHeight: 1.22,
        color: INK, background: "rgba(18,20,24,.86)", borderRadius: 18, padding: "14px 28px",
      }}>{s.txt}</div>
    </div>
  );
}

/* ── Precarga: que ninguna pieza de las marionetas llegue tarde al cuadro ── */
function usePrecarga() {
  const [handle] = useState(() => delayRender("piezas de las marionetas y fuentes"));
  useEffect(() => {
    const urls = new Set();
    Object.values(MASCOTAS).forEach(({ inner }) => {
      for (const m of inner.matchAll(/href="\/mascotas([^"]+)"/g)) urls.add(BASE_MASCOTAS + m[1]);
    });
    const imgs = [...urls].map((u) => new Promise((ok) => { const i = new Image(); i.onload = ok; i.onerror = ok; i.src = u; }));
    Promise.all([...imgs, document.fonts.ready]).then(() => {
      Promise.all(["600 40px Inter", "500 40px Inter", "700 40px Inter", "700 40px Sora", "600 40px Sora"].map((f) => document.fonts.load(f)))
        .then(() => continueRender(handle));
    });
  }, [handle]);
}

export const LeyDemanda = () => {
  usePrecarga();
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{ background: FONDO }}>
      <style>{ESTILO}</style>
      <Mercado t={t} />
      <Grafica t={t} />
      <Cierre t={t} />
      <Subtitulos t={t} />
      {FRASES.map((e, i) => (
        <Sequence key={i} from={Math.round(INICIO[i] * FPS)}>
          <Audio src={staticFile(`audio/e${i + 1}.wav`)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
