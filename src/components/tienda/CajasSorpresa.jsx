import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Sparkles, Lock, Check, ChevronDown, FastForward, RotateCcw } from "lucide-react";
import { FAE } from "../../theme.js";
import IconoCristal from "../shared/IconoCristal.jsx";
import Mascota from "../Mascota.jsx";
import { asegurarEstiloMarioneta } from "../../mascota/marioneta-estilo.js";
import { COSMETICO, COSMETICOS_CAJA, RAREZA, RAREZAS_CAJA, filtroTinte, idFiltroTinte, svgAura } from "../../mascota/cosmeticos-caja.js";
import { CAJAS, CAJA, REEMBOLSO, GANADOR, porcentaje, tiraDeRuleta, coleccionDe } from "../../cajas/cajas.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS CAJAS SORPRESA EN LA TIENDA (28-nov).
 *
 * Mateo: «cajas que se compran en la tienda; al abrirlas, una animación para
 * espectear, como la de Counter-Strike». La idea de ese tipo de juegos —sin su
 * arte ni sus nombres—: una fila de premios que pasa corriendo por debajo de
 * una marca, frena despacio y deja el premio justo debajo; y entonces se
 * revela con la luz del color de su rareza.
 *
 *   1. LAS TRES CAJAS. Dibujadas aquí (CajaDibujo), cada una con su color, su
 *      precio y sus probabilidades A LA VISTA, en porcentaje. Se abren con
 *      los Cristales de siempre.
 *   2. LA APERTURA (Apertura). Tres tiempos:
 *        · la caja tiembla mientras la base sortea (caja_abrir, 0178);
 *        · la RULETA: 48 cosméticos en fila, de derecha a izquierda, que
 *          frenan en ~6 s con el premio bajo la marca. El movimiento lo lleva
 *          requestAnimationFrame con una curva de frenado (no una transición
 *          de CSS) para saber en cada cuadro qué carta pasa por la marca y
 *          encenderla: el «tic» de la ruleta. El punto exacto donde frena
 *          dentro de la carta varía (no siempre al centro), como en las de
 *          verdad, y la de al lado suele ser una alta: el «casi».
 *        · la REVELACIÓN: la carta crece, rayos del color de la rareza, la
 *          mascota ya con el cosmético puesto, y si era repetido, cuántos
 *          Cristales vuelven.
 *      Con «menos movimiento», la ruleta salta al final en un instante.
 *      «Saltar» lleva a la revelación en cualquier momento.
 *   3. TU COLECCIÓN. Los 49 cosméticos de caja por rareza: los tuyos a color,
 *      los que faltan apagados con candado. Cualquiera se puede probar en el
 *      vestidor (sin gastar), como en el resto de la tienda.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ESTILO = `
.cjs-cajas { display: grid; gap: 12px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
@media (max-width: 699px) { .cjs-cajas { grid-template-columns: minmax(0, 1fr); } }
.cjs-caja { transition: transform .2s ease, box-shadow .2s ease; }
.cjs-caja:hover { transform: translateY(-3px); box-shadow: 0 18px 40px -16px rgba(var(--cj), .7); }
.cjs-flota { animation: cjs-flota 3.4s ease-in-out infinite; }
@keyframes cjs-flota { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
.cjs-col { display: grid; gap: 8px; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); }
@media (max-width: 359px) { .cjs-col { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; } }
.cjs-pieza { all: unset; cursor: pointer; box-sizing: border-box; }
.cjs-pieza:focus-visible, .cjs-btn:focus-visible { outline: 2px solid ${FAE.text}; outline-offset: 2px; }

/* La apertura */
.cjs-velo { position: fixed; inset: 0; z-index: 60; color: ${FAE.text}; font-family: Inter, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: radial-gradient(ellipse at 50% 45%, rgba(29,53,87,.96), rgba(6,12,22,.985) 70%); padding: 16px; box-sizing: border-box; overflow: hidden; }
.cjs-tiembla { animation: cjs-tiembla .16s linear infinite; }
@keyframes cjs-tiembla { 0% { transform: rotate(-3deg) translateX(-2px); } 50% { transform: rotate(3deg) translateX(2px); } 100% { transform: rotate(-3deg) translateX(-2px); } }
.cjs-luzcaja { animation: cjs-luzcaja 1s ease-in-out infinite alternate; }
@keyframes cjs-luzcaja { from { opacity: .35; transform: scale(.9); } to { opacity: 1; transform: scale(1.15); } }
.cjs-ventana { position: relative; width: 100%; max-width: 920px; height: 168px; overflow: hidden; border-radius: 16px;
  background: linear-gradient(180deg, rgba(14,27,46,.9), rgba(29,53,87,.75)); border: 1px solid rgba(248,249,250,.14);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent); mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent); }
.cjs-tira { position: absolute; top: 14px; left: 0; display: flex; gap: 8px; will-change: transform; }
.cjs-carta { flex: 0 0 auto; width: 112px; height: 140px; border-radius: 12px; box-sizing: border-box; position: relative; overflow: hidden;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; transition: transform .08s ease-out, filter .08s; }
.cjs-carta.cjs-bajo { transform: scale(1.07); filter: brightness(1.25); }
@media (max-width: 420px) { .cjs-ventana { height: 140px; } .cjs-carta { width: 90px; height: 114px; } .cjs-tira { top: 13px; } }
.cjs-marca { position: absolute; top: 0; bottom: 0; left: 50%; width: 3px; transform: translateX(-50%); background: #fff;
  box-shadow: 0 0 12px 2px rgba(255,255,255,.75); border-radius: 2px; z-index: 2; }
.cjs-marca::before, .cjs-marca::after { content: ""; position: absolute; left: 50%; transform: translateX(-50%); border: 9px solid transparent; }
.cjs-marca::before { top: -1px; border-top-color: #fff; }
.cjs-marca::after { bottom: -1px; border-bottom-color: #fff; }
.cjs-rayos { position: absolute; width: 640px; height: 640px; left: 50%; top: 50%; margin: -320px 0 0 -320px; border-radius: 50%;
  background: repeating-conic-gradient(from 0deg, rgba(var(--rz), .38) 0deg 9deg, transparent 9deg 24deg);
  -webkit-mask-image: radial-gradient(closest-side, #000 20%, transparent); mask-image: radial-gradient(closest-side, #000 20%, transparent);
  animation: cjs-gira 14s linear infinite; pointer-events: none; }
@keyframes cjs-gira { to { transform: rotate(360deg); } }
.cjs-revela { animation: cjs-revela .55s cubic-bezier(.2,1.4,.4,1) both; }
@keyframes cjs-revela { from { transform: scale(.4); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.cjs-sube { animation: cjs-sube .45s ease-out both; }
@keyframes cjs-sube { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.cjs-chispa { position: absolute; width: 8px; height: 8px; border-radius: 2px; animation: cjs-chispa 1.4s ease-out both; }
@keyframes cjs-chispa { from { transform: translate(0,0) rotate(0); opacity: 1; } to { transform: translate(var(--dx), var(--dy)) rotate(260deg); opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .cjs-flota, .cjs-tiembla, .cjs-luzcaja, .cjs-rayos, .cjs-revela, .cjs-sube, .cjs-chispa { animation: none !important; }
  .cjs-caja, .cjs-carta { transition: none; }
}
`;

/* ───────────── el dibujo de una caja ───────────── */

const TONOS_CAJA = {
  normal: { claro: "#7fb8ff", medio: "#3d7fe0", oscuro: "#1c3f7a", cinta: "#d6ecff", gema: "#bfe2ff" },
  rara: { claro: "#d2a6ff", medio: "#8a4fe0", oscuro: "#3f1d7a", cinta: "#f0e0ff", gema: "#ff9bf0" },
  legendaria: { claro: "#ffe08a", medio: "#e0a52a", oscuro: "#7a4a00", cinta: "#fff4c2", gema: "#ff5c7a" },
};

/** Una caja de regalo con su tapa, su cinta y su sello. `abierta` levanta la tapa. */
export function CajaDibujo({ tipo, tamano = 120, abierta = false }) {
  const t = TONOS_CAJA[tipo] || TONOS_CAJA.normal;
  const g = useId().replace(/:/g, "");
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 120 120" aria-hidden="true" style={{ overflow: "visible", display: "block" }}>
      <defs>
        <linearGradient id={`cf-${g}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={t.medio} /><stop offset="1" stopColor={t.oscuro} /></linearGradient>
        <linearGradient id={`ct-${g}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={t.claro} /><stop offset="1" stopColor={t.medio} /></linearGradient>
        <radialGradient id={`cl-${g}`} cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#fff" stopOpacity=".95" /><stop offset=".4" stopColor={t.claro} stopOpacity=".6" /><stop offset="1" stopColor={t.claro} stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx="60" cy="110" rx="40" ry="6" fill="#000" opacity=".3" />
      {/* la luz que sale de dentro */}
      {abierta && <circle cx="60" cy="50" r="46" fill={`url(#cl-${g})`} className="cjs-luzcaja" style={{ transformOrigin: "60px 50px" }} />}
      {/* cuerpo */}
      <rect x="18" y="50" width="84" height="56" rx="7" fill={`url(#cf-${g})`} stroke={t.oscuro} strokeWidth="2.5" />
      <rect x="18" y="50" width="84" height="10" fill="#000" opacity=".18" />
      <rect x="53" y="50" width="14" height="56" fill={t.cinta} opacity=".92" />
      {tipo !== "normal" && <path d="M24 58 V100 M96 58 V100" stroke={t.claro} strokeWidth="2" opacity=".55" />}
      {/* sello */}
      <circle cx="60" cy="80" r={tipo === "legendaria" ? 12 : 10} fill={t.oscuro} stroke={t.cinta} strokeWidth="2.5" />
      {tipo === "legendaria" ? (
        <path d="M52 84 L53 75 L57 79 L60 73 L63 79 L67 75 L68 84 Z" fill={t.claro} stroke={t.cinta} strokeWidth="1.2" strokeLinejoin="round" />
      ) : (
        <text x="60" y="85" textAnchor="middle" fontFamily="Sora, sans-serif" fontWeight="800" fontSize="14" fill={t.cinta}>?</text>
      )}
      {/* tapa */}
      <g style={{ transition: "transform .5s cubic-bezier(.3,1.6,.5,1)", transform: abierta ? "translate(0px,-26px) rotate(-14deg)" : "none", transformOrigin: "20px 50px" }}>
        <rect x="12" y="36" width="96" height="18" rx="5" fill={`url(#ct-${g})`} stroke={t.oscuro} strokeWidth="2.5" />
        <rect x="53" y="36" width="14" height="18" fill={t.cinta} />
        {/* lazo */}
        <path d="M60 36 C48 20 34 26 44 36 Z" fill={t.cinta} stroke={t.oscuro} strokeWidth="2" strokeLinejoin="round" />
        <path d="M60 36 C72 20 86 26 76 36 Z" fill={t.cinta} stroke={t.oscuro} strokeWidth="2" strokeLinejoin="round" />
        <circle cx="60" cy="35" r="5" fill={tipo === "normal" ? t.cinta : t.gema} stroke={t.oscuro} strokeWidth="2" />
      </g>
      {tipo === "legendaria" && (
        <g fill="#fff4c2">
          <path d="M14 22 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" opacity=".9" />
          <path d="M104 14 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6 z" opacity=".8" />
        </g>
      )}
    </svg>
  );
}

/* ───────────── el icono de un cosmético ───────────── */

/** La pieza sola, con su tinte (o el aura), para la ruleta y la colección. */
export function IconoCosmetico({ id, tamano = 64, vivo = false }) {
  const c = COSMETICO[id];
  const uid = useId().replace(/:/g, "");
  useEffect(() => { if (c?.esAura) asegurarEstiloMarioneta(); }, [c?.esAura]);
  if (!c) return null;
  if (c.esAura) {
    const au = svgAura(c.tinte, [60, 60], [44, 50]);
    const html = au.atras + au.frente +
      `<path d="M60 44 c-9 0 -14 8 -14 15 c0 9 7 15 14 15 c7 0 14 -6 14 -15 c0 -7 -5 -15 -14 -15 z" fill="rgba(248,249,250,.2)"/>` +
      `<circle cx="50" cy="40" r="5" fill="rgba(248,249,250,.2)"/><circle cx="70" cy="40" r="5" fill="rgba(248,249,250,.2)"/>`;
    return (
      <svg width={tamano} height={tamano} viewBox="0 0 120 120" aria-hidden="true" className={`mta ${vivo ? "mta-tranquila" : "mta-quieta"}`}
        style={{ display: "block", overflow: "visible" }} dangerouslySetInnerHTML={{ __html: html }} />
    );
  }
  /* El tamaño de la pieza manda la caja: encaja dentro de 100 × 100. */
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 120 120" aria-hidden="true" style={{ display: "block", overflow: "visible" }}
      dangerouslySetInnerHTML={{
        __html: `<defs>${filtroTinte(c.tinte, `ic${uid}`)}</defs><g filter="url(#${idFiltroTinte(c.tinte, `ic${uid}`)})"><image href="/mascotas/accesorios/${c.base}.webp" x="14" y="14" width="92" height="92" preserveAspectRatio="xMidYMid meet"/></g>`,
      }} />
  );
}

/* ───────────── piezas comunes ───────────── */

function Precio({ precio, alcanza, tamano = 15 }) {
  return (
    <span data-precio-caja={precio} style={{
      display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 10px 4px 8px", borderRadius: "999px",
      background: alcanza ? "rgba(42,157,143,0.16)" : "rgba(248,249,250,0.06)",
      border: `1px solid ${alcanza ? "rgba(42,157,143,0.45)" : "rgba(248,249,250,0.12)"}`,
    }}>
      <IconoCristal tamano={tamano} apagado={!alcanza} />
      <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: `${tamano}px`, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{precio}</span>
    </span>
  );
}

function boton(tipo, rgb = "42,157,143") {
  return {
    fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 700, padding: "9px 16px", minHeight: "40px",
    borderRadius: "999px", cursor: tipo === "apagado" ? "default" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px",
    border: tipo === "suave" ? "1px solid rgba(248,249,250,0.25)" : "none",
    background: tipo === "lleno" ? `linear-gradient(180deg, rgba(${rgb},1), rgba(${rgb},0.78))` : tipo === "suave" ? "rgba(248,249,250,0.04)" : "rgba(248,249,250,0.07)",
    color: tipo === "lleno" ? FAE.bg : tipo === "suave" ? FAE.text : "rgba(248,249,250,0.4)",
    boxShadow: tipo === "lleno" ? `0 10px 24px -12px rgba(${rgb},0.9)` : "none",
  };
}

/* ───────────── una caja en la tienda ───────────── */

function TarjetaCaja({ caja, saldo, onAbrir, ocupada }) {
  const [verTodo, setVerTodo] = useState(false);
  const alcanza = saldo >= caja.precio;
  const faltan = Math.max(0, caja.precio - saldo);
  return (
    <article data-caja={caja.id} className="cjs-caja" style={{
      "--cj": caja.rgb, position: "relative", borderRadius: "18px", padding: "14px", overflow: "hidden",
      background: `linear-gradient(180deg, rgba(${caja.rgb},0.22) 0%, rgba(29,53,87,0.66) 48%, rgba(14,27,46,0.85) 100%)`,
      border: `1px solid rgba(${caja.rgb},0.45)`, display: "flex", flexDirection: "column", gap: "10px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span className="cjs-flota" style={{ flexShrink: 0, display: "flex", filter: `drop-shadow(0 10px 18px rgba(${caja.rgb},0.45))` }}>
          <CajaDibujo tipo={caja.id} tamano={92} />
        </span>
        <div style={{ minWidth: 0 }}>
          <h3 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "16px", margin: "0 0 2px", lineHeight: 1.2 }}>{caja.nombre}</h3>
          <p style={{ margin: "0 0 8px", fontSize: "12px", lineHeight: 1.4, color: "rgba(248,249,250,0.62)" }}>{caja.lema}</p>
          <Precio precio={caja.precio} alcanza={alcanza} />
        </div>
      </div>

      {/* Las probabilidades, siempre a la vista */}
      <ul data-probabilidades aria-label={`Probabilidades de la ${caja.nombre}`} style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "4px" }}>
        {RAREZAS_CAJA.map((r) => {
          const pm = caja.probabilidades[r.id];
          return (
            <li key={r.id} data-rareza={r.id} style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "12px", opacity: pm ? 1 : 0.4 }}>
              <span style={{ width: "9px", height: "9px", borderRadius: "3px", background: `rgb(${r.rgb})`, boxShadow: pm ? `0 0 8px rgba(${r.rgb},0.7)` : "none", flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 0 }}>{r.nombre}</span>
              <span style={{ display: "block", width: "64px", height: "5px", borderRadius: "99px", background: "rgba(248,249,250,0.08)", overflow: "hidden", flexShrink: 0 }}>
                <span style={{ display: "block", height: "100%", width: `${pm ? Math.max(4, Math.sqrt(pm / 1000) * 100) : 0}%`, background: `rgb(${r.rgb})` }} />
              </span>
              <span data-porcentaje style={{ width: "46px", textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600, flexShrink: 0 }}>{porcentaje(caja.id, r.id)}</span>
            </li>
          );
        })}
      </ul>

      <button type="button" className="cjs-btn" onClick={() => setVerTodo((v) => !v)} aria-expanded={verTodo}
        style={{ all: "unset", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 600, color: "rgba(248,249,250,0.72)" }}>
        <ChevronDown size={14} style={{ transform: verTodo ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
        {verTodo ? "Ocultar lo que trae" : "Ver lo que puede salir"}
      </button>
      {verTodo && (
        <div data-contenido style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {COSMETICOS_CAJA.filter((c) => caja.probabilidades[c.rareza] > 0).map((c) => (
            <span key={c.id} title={`${c.nombre} · ${RAREZA[c.rareza].nombre}`} style={{
              display: "flex", borderRadius: "8px", padding: "2px", background: `rgba(${RAREZA[c.rareza].rgb},0.14)`,
              border: `1px solid rgba(${RAREZA[c.rareza].rgb},0.45)`,
            }}>
              <IconoCosmetico id={c.id} tamano={34} />
            </span>
          ))}
        </div>
      )}

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
        <button type="button" className="cjs-btn" data-abrir-caja={caja.id} disabled={!alcanza || ocupada}
          onClick={() => onAbrir(caja.id)} style={{ ...boton(alcanza ? "lleno" : "apagado", caja.rgb), width: "100%" }}>
          <Sparkles size={15} /> Abrir
        </button>
        {!alcanza && (
          <span data-faltan-caja={faltan} style={{ fontSize: "11.5px", textAlign: "center", color: "rgba(248,249,250,0.55)" }}>
            Te faltan {faltan} Cristales
          </span>
        )}
      </div>
    </article>
  );
}

/* ───────────── la carta de la ruleta ───────────── */

function CartaRuleta({ id, refCarta }) {
  const c = COSMETICO[id];
  const r = RAREZA[c.rareza];
  return (
    <div ref={refCarta} className="cjs-carta" data-carta={id} data-rareza={c.rareza} style={{
      background: `linear-gradient(180deg, rgba(${r.rgb},0.10), rgba(${r.rgb},0.32))`,
      border: `1px solid rgba(${r.rgb},0.55)`,
    }}>
      <span style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", width: "100%",
        background: `radial-gradient(closest-side, rgba(${r.rgb},0.35), transparent)` }}>
        <IconoCosmetico id={id} tamano={72} />
      </span>
      <span style={{ fontSize: "10px", fontWeight: 600, lineHeight: 1.15, textAlign: "center", padding: "0 5px", minHeight: "24px", display: "flex", alignItems: "center", overflowWrap: "anywhere" }}>
        {c.nombre}
      </span>
      <span style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "5px", background: `rgb(${r.rgb})`, boxShadow: `0 0 14px rgba(${r.rgb},0.9)` }} />
    </div>
  );
}

/* ───────────── la apertura ───────────── */

const DURACION = 6200;
/* Frenado: rápido al principio, muy lento al final (cuártica de salida). */
const frenado = (p) => 1 - Math.pow(1 - p, 4);

function sinMovimiento() {
  try { return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches; } catch { return false; }
}

/**
 * fase: "sorteo" (la caja tiembla) → "ruleta" → "revela". `resultado` llega de
 * la base: { cosmetico, rareza, repetido, reembolso }.
 */
function Apertura({ cajaId, resultado, error, mascota, look, saldo, onCerrar, onOtra, onPoner, puesto, semilla }) {
  const caja = CAJA[cajaId];
  const [fase, setFase] = useState("sorteo");
  const refTira = useRef(null);
  const refVentana = useRef(null);
  const cartas = useRef([]);
  const saltar = useRef(null);
  const refDialogo = useRef(null);

  const tira = useMemo(() => (resultado ? tiraDeRuleta(cajaId, resultado.cosmetico, semilla) : []), [cajaId, resultado, semilla]);

  /* La caja tiembla al menos 1,1 s (aunque la base conteste antes): es el redoble. */
  const [listoSorteo, setListoSorteo] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setListoSorteo(true), sinMovimiento() ? 200 : 1100);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (resultado && listoSorteo && fase === "sorteo") setFase("ruleta");
  }, [resultado, listoSorteo, fase]);

  useEffect(() => { refDialogo.current?.focus(); }, []);

  /* La ruleta: rAF con frenado; enciende la carta que pasa por la marca. */
  useEffect(() => {
    if (fase !== "ruleta") return undefined;
    const tiraEl = refTira.current, ventana = refVentana.current;
    if (!tiraEl || !ventana) return undefined;
    const primera = cartas.current[0];
    const ancho = primera ? primera.getBoundingClientRect().width : 112;
    const paso = ancho + 8;
    const medio = ventana.clientWidth / 2;
    /* Dónde cae la marca dentro de la carta ganadora: entre el 18 % y el 82 % de su ancho. */
    const dentro = 0.18 + ((semilla * 9301 + 49297) % 233280) / 233280 * 0.64;
    const fin = -(GANADOR * paso + ancho * dentro - medio);
    const inicio = medio - ancho * 0.5;
    const dur = sinMovimiento() ? 250 : DURACION;
    let t0 = null, raf = 0, bajo = -1, hecho = false;
    const pintar = (x) => {
      tiraEl.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
      const i = Math.floor((medio - x + 4) / paso);
      if (i !== bajo) {
        cartas.current[bajo]?.classList.remove("cjs-bajo");
        cartas.current[i]?.classList.add("cjs-bajo");
        bajo = i;
      }
    };
    const terminar = () => {
      if (hecho) return;
      hecho = true;
      cancelAnimationFrame(raf);
      pintar(fin);
      setTimeout(() => setFase("revela"), sinMovimiento() ? 100 : 650);
    };
    saltar.current = terminar;
    const cuadro = (ts) => {
      if (t0 == null) t0 = ts;
      const p = Math.min(1, (ts - t0) / dur);
      pintar(inicio + (fin - inicio) * frenado(p));
      if (p < 1) raf = requestAnimationFrame(cuadro);
      else terminar();
    };
    pintar(inicio);
    raf = requestAnimationFrame(cuadro);
    return () => cancelAnimationFrame(raf);
  }, [fase, semilla]);

  const c = resultado ? COSMETICO[resultado.cosmetico] : null;
  const r = c ? RAREZA[c.rareza] : null;
  const alcanzaOtra = saldo >= caja.precio;

  /* Esc cierra, salvo a mitad de ruleta (ahí salta al final). */
  const alTeclado = (e) => {
    if (e.key !== "Escape") return;
    if (fase === "ruleta") saltar.current?.();
    else if (fase === "revela" || error) onCerrar();
  };

  const chispas = useMemo(() => Array.from({ length: 26 }, (_, i) => {
    const a = (i / 26) * Math.PI * 2;
    const d = 120 + (i % 5) * 34;
    return { dx: `${Math.round(Math.cos(a) * d)}px`, dy: `${Math.round(Math.sin(a) * d)}px`, demora: `${(i % 6) * 0.05}s`, color: i % 3 ? `rgb(${r?.rgb || "255,255,255"})` : "#fff" };
  }), [r]);

  return (
    <div className="cjs-velo" role="dialog" aria-modal="true" aria-label={`Abriendo la ${caja.nombre}`} data-apertura={fase}
      tabIndex={-1} ref={refDialogo} onKeyDown={alTeclado} style={{ outline: "none" }}>
      {/* Cerrar: solo cuando ya no se está sorteando */}
      {(fase === "revela" || error) && (
        <button type="button" className="cjs-btn" onClick={onCerrar} aria-label="Cerrar" data-cerrar-apertura
          style={{ position: "absolute", top: "14px", right: "14px", width: "44px", height: "44px", borderRadius: "999px", border: "1px solid rgba(248,249,250,0.2)", background: "rgba(248,249,250,0.06)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3 }}>
          <X size={20} color={FAE.text} />
        </button>
      )}

      {fase === "sorteo" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "18px" }}>
          <span className={error ? "" : "cjs-tiembla"} style={{ display: "flex", filter: `drop-shadow(0 0 30px rgba(${caja.rgb},0.7))` }}>
            <CajaDibujo tipo={cajaId} tamano={170} abierta={!error && listoSorteo && Boolean(resultado)} />
          </span>
          {error ? (
            <>
              <p role="alert" style={{ margin: 0, maxWidth: "320px", textAlign: "center", fontSize: "14px", lineHeight: 1.5, color: FAE.ambar }}>{error}</p>
              <p style={{ margin: 0, fontSize: "12.5px", color: "rgba(248,249,250,0.6)" }}>No se te cobró nada.</p>
              <button type="button" className="cjs-btn" onClick={onCerrar} style={boton("suave")}>Volver a la tienda</button>
            </>
          ) : (
            <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "15px", letterSpacing: "0.02em" }}>Abriendo la {caja.nombre}…</p>
          )}
        </div>
      )}

      {fase === "ruleta" && (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "18px" }}>
          <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "13px", letterSpacing: "0.16em", color: "rgba(248,249,250,0.7)" }}>
            {caja.nombre.toUpperCase()}
          </p>
          <div className="cjs-ventana" ref={refVentana} data-ruleta>
            <div className="cjs-tira" ref={refTira}>
              {tira.map((id, i) => <CartaRuleta key={i} id={id} refCarta={(el) => { cartas.current[i] = el; }} />)}
            </div>
            <span className="cjs-marca" aria-hidden="true" />
          </div>
          <button type="button" className="cjs-btn" data-saltar onClick={() => saltar.current?.()} style={boton("suave")}>
            <FastForward size={15} /> Saltar
          </button>
        </div>
      )}

      {fase === "revela" && c && (
        <div data-revelado={c.id} data-rareza-revelada={c.rareza} style={{ "--rz": r.rgb, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", width: "100%", maxWidth: "420px" }}>
          <span className="cjs-rayos" aria-hidden="true" />
          <div className="cjs-revela" style={{
            position: "relative", width: "min(260px, 76vw)", borderRadius: "22px", padding: "16px 14px 14px", boxSizing: "border-box",
            background: `linear-gradient(180deg, rgba(${r.rgb},0.34), rgba(14,27,46,0.92) 70%)`,
            border: `2px solid rgb(${r.rgb})`, boxShadow: `0 0 50px rgba(${r.rgb},0.55), inset 0 0 30px rgba(${r.rgb},0.25)`,
            display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
          }}>
            {chispas.map((s, i) => (
              <span key={i} className="cjs-chispa" aria-hidden="true" style={{ left: "50%", top: "40%", background: s.color, "--dx": s.dx, "--dy": s.dy, animationDelay: s.demora }} />
            ))}
            <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "12px", letterSpacing: "0.24em", color: `rgb(${r.rgb})`, textShadow: `0 0 14px rgba(${r.rgb},0.8)` }}>
              {r.nombre.toUpperCase()}
            </span>
            <span style={{ display: "flex", justifyContent: "center" }}>
              <Mascota especie={mascota.especie} paleta={mascota.paleta} ojos={mascota.ojos} puestos={look} tamano={150} encuadre="cuerpo" animo="feliz" />
            </span>
            <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "19px", textAlign: "center", lineHeight: 1.2 }}>{c.nombre}</span>
          </div>
          <div className="cjs-sube" style={{ animationDelay: ".35s", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", position: "relative" }}>
            {resultado.repetido ? (
              <p data-repetido style={{ margin: 0, display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13.5px", textAlign: "center" }}>
                Ya lo tenías: te devolvemos <strong style={{ fontVariantNumeric: "tabular-nums" }}>{resultado.reembolso}</strong> <IconoCristal tamano={14} />
              </p>
            ) : (
              <p data-nuevo style={{ margin: 0, display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13.5px", fontWeight: 600 }}>
                <Sparkles size={15} color={`rgb(${r.rgb})`} /> ¡Nuevo en tu colección!
              </p>
            )}
            {/* Alto fijo: al cambiar «Ponérselo» por «Puesto» los botones caben en una
                fila y, sin esto, toda la tarjeta saltaba hacia abajo al recentrarse. */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", alignContent: "flex-start", minHeight: "92px" }}>
              {!puesto && (
                <button type="button" className="cjs-btn" data-poner-premio onClick={() => onPoner(c.id)} style={boton("lleno", r.rgb)}>
                  <Check size={15} /> Ponérselo
                </button>
              )}
              {puesto && (
                <span style={{ ...boton("suave"), cursor: "default" }}><Check size={15} /> Puesto</span>
              )}
              <button type="button" className="cjs-btn" data-otra-caja disabled={!alcanzaOtra} onClick={onOtra} style={boton(alcanzaOtra ? "suave" : "apagado")}>
                <RotateCcw size={15} /> Abrir otra · {caja.precio} <IconoCristal tamano={13} apagado={!alcanzaOtra} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────── la sección entera ───────────── */

/**
 * `onAbrirCaja(cajaId)` llama a la base (inyectable para las pruebas);
 * `onProbar`, `onPoner` y `probando`/`puestos` son los del vestidor.
 */
export default function CajasSorpresa({ perfil, saldo, mascota, puestos, probando, onProbar, onPoner, onAbrirCaja, aplicarPerfil, ponerEnLook }) {
  const [abierta, setAbierta] = useState(null); // { caja, resultado, error, semilla }
  const coleccion = useMemo(() => new Set(coleccionDe(perfil)), [perfil]);

  const abrir = async (cajaId) => {
    const semilla = Math.floor(Math.random() * 1e9) + 1;
    setAbierta({ caja: cajaId, resultado: null, error: null, semilla, n: (abierta?.n || 0) + 1 });
    const r = (await onAbrirCaja(cajaId)) ?? {};
    if (r.error || !r.cosmetico || !COSMETICO[r.cosmetico]) {
      setAbierta((a) => a && { ...a, error: r.error || "No se pudo abrir la caja. Inténtalo otra vez." });
      return;
    }
    if (r.perfil) aplicarPerfil(r.perfil);
    setAbierta((a) => a && { ...a, resultado: r });
  };

  /* Bloquear el desplazamiento de la página mientras la apertura está encima. */
  useEffect(() => {
    if (!abierta) return undefined;
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = antes; };
  }, [Boolean(abierta)]);

  const premio = abierta?.resultado?.cosmetico;
  const lookPremio = premio ? ponerEnLook(puestos, premio) : puestos;

  const total = COSMETICOS_CAJA.length;
  const tengo = COSMETICOS_CAJA.filter((c) => coleccion.has(c.id)).length;

  return (
    <section data-cajas-sorpresa>
      <style>{ESTILO}</style>
      <div style={{ marginBottom: "14px" }}>
        <h2 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(20px, 2.4vw, 26px)", letterSpacing: "-0.02em", margin: "0 0 4px" }}>
          Cajas sorpresa
        </h2>
        <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.5, color: "rgba(248,249,250,0.6)" }}>
          Cada caja trae un cosmético que no se vende suelto. Si te sale uno que ya tienes, te devolvemos Cristales.
        </p>
      </div>

      <div className="cjs-cajas" data-cajas style={{ marginBottom: "22px" }}>
        {CAJAS.map((cj) => <TarjetaCaja key={cj.id} caja={cj} saldo={saldo} onAbrir={abrir} ocupada={Boolean(abierta)} />)}
      </div>

      {/* Repetidos: lo que se devuelve, a la vista */}
      <p data-reembolsos style={{ margin: "0 0 22px", fontSize: "12px", lineHeight: 1.6, color: "rgba(248,249,250,0.6)" }}>
        Si sale repetido te devolvemos:{" "}
        {RAREZAS_CAJA.map((r, i) => (
          <span key={r.id}>
            <span style={{ whiteSpace: "nowrap" }}><span style={{ color: `rgb(${r.rgb})`, fontWeight: 600 }}>{r.nombre}</span> {REEMBOLSO[r.id]}</span>{i < RAREZAS_CAJA.length - 1 ? " · " : ""}
          </span>
        ))}
      </p>

      {/* Tu colección */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "10px", marginBottom: "10px" }}>
        <h3 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "16px", margin: 0 }}>Tu colección</h3>
        <span data-coleccion-cuenta style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.65)", fontVariantNumeric: "tabular-nums" }}>{tengo} de {total}</span>
      </div>
      <div style={{ height: "6px", borderRadius: "99px", background: "rgba(248,249,250,0.08)", overflow: "hidden", marginBottom: "16px" }}>
        <div style={{ height: "100%", width: `${Math.max(2, (tengo / total) * 100)}%`, background: "linear-gradient(90deg, rgb(79,156,255), rgb(181,108,255), rgb(255,190,60), rgb(255,77,120))" }} />
      </div>
      {RAREZAS_CAJA.map((r) => (
        <div key={r.id} style={{ marginBottom: "16px" }} data-coleccion-rareza={r.id}>
          <p style={{ margin: "0 0 8px", fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", color: `rgb(${r.rgb})` }}>
            {r.nombre.toUpperCase()}
          </p>
          <div className="cjs-col">
            {COSMETICOS_CAJA.filter((c) => c.rareza === r.id).map((c) => {
              const mio = coleccion.has(c.id);
              const puesto = puestos.includes(c.id);
              const prob = probando.includes(c.id);
              return (
                <div key={c.id} data-cosmetico={c.id} data-mio={mio ? "si" : "no"} style={{
                  position: "relative", borderRadius: "14px", padding: "8px 6px", display: "flex", flexDirection: "column", alignItems: "center", gap: "5px",
                  background: `linear-gradient(180deg, rgba(${r.rgb},${mio ? 0.2 : 0.06}), rgba(14,27,46,0.75))`,
                  border: `1px solid rgba(${r.rgb},${mio ? 0.6 : 0.2})`,
                  boxShadow: puesto ? "0 0 0 2px rgba(42,157,143,0.9)" : prob ? "0 0 0 2px rgba(248,249,250,0.85)" : "none",
                }}>
                  <button type="button" className="cjs-pieza" data-probar={c.id}
                    aria-label={mio ? `${puesto ? "Quitarle" : "Ponerle"} ${c.nombre}` : `Probarle ${c.nombre}`}
                    onClick={() => (mio ? onPoner(c.id, !puesto) : onProbar(c.id))}
                    style={{ display: "flex", justifyContent: "center", width: "100%", opacity: mio ? 1 : 0.42, filter: mio ? "none" : "saturate(.35)" }}>
                    <IconoCosmetico id={c.id} tamano={58} />
                  </button>
                  {!mio && <Lock size={12} style={{ position: "absolute", top: "8px", right: "8px", opacity: 0.6 }} aria-hidden="true" />}
                  {puesto && <Check size={13} strokeWidth={3} style={{ position: "absolute", top: "7px", right: "7px", color: FAE.text }} aria-hidden="true" />}
                  <span style={{ fontSize: "10.5px", lineHeight: 1.2, textAlign: "center", fontWeight: 600, minHeight: "26px", display: "flex", alignItems: "center", overflowWrap: "anywhere", opacity: mio ? 1 : 0.7 }}>
                    {c.nombre}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* A document.body: la sección va dentro de una Entrada con transform, y
          un position: fixed dentro de un transform se ancla a él, no a la pantalla. */}
      {abierta && typeof document !== "undefined" && createPortal(
        <Apertura
          key={abierta.n}
          cajaId={abierta.caja}
          resultado={abierta.resultado}
          error={abierta.error}
          semilla={abierta.semilla}
          mascota={mascota}
          look={lookPremio}
          saldo={saldo}
          puesto={premio ? puestos.includes(premio) : false}
          onCerrar={() => setAbierta(null)}
          onOtra={() => abrir(abierta.caja)}
          onPoner={(id) => onPoner(id, true)}
        />,
        document.body,
      )}
    </section>
  );
}
