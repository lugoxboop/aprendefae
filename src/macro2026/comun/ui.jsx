/*
 * ═══════════════════════════════════════════════════════════════════════════
 * MACRO 2026 · LO COMÚN DE LAS PIEZAS (controles, marco de Aprender, retro)
 *
 * Propio de las piezas nuevas de Macro (src/macro2026/): no toca ningún
 * componente compartido del sitio. Reglas de la especificación de Gen, §0:
 *   · movimiento: cubic-bezier(.3,.9,.4,1), 280 ms, solo transform y opacity,
 *     nada en bucle; con movimiento reducido, fundido de 120 ms en su sitio;
 *   · deslizadores nativos (<input type="range">) a ancho completo, pulgar de
 *     44 × 44, valor encima del pulgar en Geist Mono tabular, flechas = 1 paso.
 *     Estilos según la guía «slider» de Modern Web Guidance: reglas WebKit y
 *     Firefox por separado, y el relleno con una variable sincronizada desde
 *     JS (sin attr() ni progress(), que no son Baseline amplio);
 *   · coral SOLO en el estado de error ([data-estado="mal"]); el acierto va
 *     con ✓ y borde en tinta.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { BORDE, CORAL, FONDO, GRIS, INK, INK_2, SUPERFICIE, SUPERFICIE_2, TINTA_SOBRE_COLOR } from "./colores-da.js";

export const CURVA = "cubic-bezier(.3,.9,.4,1)";
export const DUR = 280;

const usarEfecto = typeof window === "undefined" ? useEffect : useLayoutEffect;

export const CSS_DA = `
.da26 { font-family: var(--planck-font-sans, "Geist", system-ui, sans-serif); color: ${INK}; -webkit-text-size-adjust: 100%; }
.da26 *, .da26 *::before, .da26 *::after { box-sizing: border-box; }
.da26-tarjeta { background: ${SUPERFICIE}; border: 1px solid ${BORDE}; border-radius: 12px; padding: 12px; max-width: 640px; margin: 0 auto; overflow: hidden; }
@media (min-width: 400px) { .da26-tarjeta { padding: 16px; } }
.da26-cabeza { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 20px; margin-bottom: 8px; }
.da26-puntos { display: flex; gap: 4px; }
.da26-punto { width: 8px; height: 8px; border-radius: 50%; background: ${BORDE}; }
.da26-punto[data-hecho="1"] { background: ${INK_2}; }
.da26-punto[data-actual="1"] { background: ${INK}; }
.da26-mono { font-family: var(--planck-font-mono, "Geist Mono", ui-monospace, monospace); font-variant-numeric: tabular-nums; }
.da26-rotulo { font-size: 12px; line-height: 16px; color: ${INK_2}; letter-spacing: .02em; }
.da26-texto { font-size: 16px; line-height: 1.4; margin: 12px 0 0; }
.da26-consigna { font-size: 16px; line-height: 1.35; font-weight: 600; margin: 0 0 10px; }
.da26-figura { position: relative; width: 100%; }
.da26-figura svg { display: block; width: 100%; height: auto; overflow: visible; }
.da26-controles { display: flex; flex-direction: column; gap: 12px; margin-top: 12px; }
.da26-fila { display: flex; flex-wrap: wrap; gap: 8px; }
.da26-nav { display: flex; gap: 8px; justify-content: space-between; margin-top: 16px; }
.da26-boton { min-height: 44px; min-width: 44px; padding: 10px 16px; border-radius: 999px; border: 1px solid ${BORDE}; background: ${SUPERFICIE_2}; color: ${INK}; font: 600 15px/20px var(--planck-font-sans, system-ui, sans-serif); cursor: pointer; touch-action: manipulation; transition: transform ${DUR}ms ${CURVA}, opacity ${DUR}ms ${CURVA}; }
.da26-boton:active { transform: scale(.97); }
.da26-boton:disabled { opacity: .45; cursor: not-allowed; }
.da26-boton[aria-pressed="true"] { background: ${INK}; color: ${TINTA_SOBRE_COLOR}; border-color: ${INK}; }
.da26-primario { background: ${INK}; color: ${TINTA_SOBRE_COLOR}; border-color: ${INK}; margin-left: auto; }
.da26 button:focus-visible, .da26 [tabindex]:focus-visible { outline: 2px solid ${INK}; outline-offset: 2px; }
.da26-retro { margin-top: 10px; padding: 10px 12px; border-radius: 10px; border: 2px solid ${BORDE}; background: ${FONDO}; font-size: 15px; line-height: 1.35; }
.da26-retro[data-estado="mal"] { border-color: ${CORAL}; }
.da26-retro[data-estado="bien"] { border-color: ${INK}; }
.da26-retro[data-estado="bien"]::before { content: "✓ "; font-weight: 700; }
.da26-marca-mal, [data-estado="mal"].da26-marcable { border-color: ${CORAL} !important; }
.da26-marcable[data-estado="bien"] { border-color: ${INK} !important; }
.da26-solo-lector { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }

/* Deslizador nativo con estilo (guía «slider»). */
.da26-desl { position: relative; }
.da26-desl-cab { display: flex; justify-content: space-between; gap: 8px; font-size: 14px; line-height: 18px; color: ${INK_2}; margin-bottom: 2px; }
.da26-desl-burbuja { position: absolute; top: 20px; font: 500 14px/18px var(--planck-font-mono, "Geist Mono", ui-monospace, monospace); font-variant-numeric: tabular-nums; color: ${INK}; background: ${FONDO}; border: 1px solid ${BORDE}; border-radius: 6px; padding: 1px 6px; white-space: nowrap; pointer-events: none; }
.da26-desl input[type="range"] {
  --pista: 6px; --pulgar: 44px; --relleno: ${INK}; --vacio: ${GRIS}; --pct: 50%;
  appearance: none; -webkit-appearance: none; display: block; width: 100%; height: 44px; margin: 24px 0 0; padding: 0; border: 0; background: transparent; cursor: pointer; touch-action: pan-y;
}
.da26-desl input[type="range"]::-webkit-slider-runnable-track { height: var(--pista); border-radius: 999px; background: linear-gradient(to right, var(--relleno) var(--pct), var(--vacio) var(--pct)); }
.da26-desl input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: var(--pulgar); height: var(--pulgar); margin-top: calc((var(--pista) - var(--pulgar)) / 2); border-radius: 50%; background: ${INK}; border: 6px solid ${FONDO}; box-shadow: 0 0 0 1px ${INK_2}; }
.da26-desl input[type="range"]::-moz-range-track { height: var(--pista); border-radius: 999px; background: var(--vacio); }
.da26-desl input[type="range"]::-moz-range-progress { height: var(--pista); border-radius: 999px; background: var(--relleno); }
.da26-desl input[type="range"]::-moz-range-thumb { width: 32px; height: 32px; border-radius: 50%; background: ${INK}; border: 6px solid ${FONDO}; box-shadow: 0 0 0 1px ${INK_2}; }
.da26-desl input[type="range"]:focus-visible { outline: 2px solid ${INK}; outline-offset: 4px; }
.da26-desl-extremos { display: flex; justify-content: space-between; gap: 8px; font-size: 12px; line-height: 16px; color: ${INK_2}; margin-top: 2px; }

/* Interruptor. */
.da26-interruptor { display: inline-flex; align-items: center; gap: 10px; }
.da26-interruptor .da26-carril { width: 44px; height: 26px; border-radius: 999px; background: ${GRIS}; position: relative; flex: none; }
.da26-interruptor .da26-carril::after { content: ""; position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: ${FONDO}; transition: transform ${DUR}ms ${CURVA}; }
.da26-interruptor[aria-checked="true"] .da26-carril { background: ${INK}; }
.da26-interruptor[aria-checked="true"] .da26-carril::after { transform: translateX(18px); }

/* Movimiento: solo transform y opacity, nada en bucle. */
@keyframes da26-sacude { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-2px); } 75% { transform: translateX(2px); } }
@keyframes da26-tiembla { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-4px); } 40% { transform: translateX(4px); } 60% { transform: translateX(-3px); } 80% { transform: translateX(3px); } }
@keyframes da26-entra { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@keyframes da26-funde { from { opacity: 0; } to { opacity: 1; } }
.da26-sacude { animation: da26-sacude ${DUR}ms ${CURVA} 1; }
.da26-tiembla { animation: da26-tiembla ${DUR}ms ${CURVA} 1; }
.da26-entra { animation: da26-entra ${DUR}ms ${CURVA} both 1; }
.da26-trans { transition: transform ${DUR}ms ${CURVA}, opacity ${DUR}ms ${CURVA}; }
@media (prefers-reduced-motion: reduce) {
  .da26-sacude, .da26-tiembla { animation: none; }
  .da26-entra { animation: da26-funde 120ms linear both 1; }
  .da26-trans, .da26-boton, .da26-interruptor .da26-carril::after { transition: opacity 120ms linear; }
}
`;

export function Raiz({ children, ...resto }) {
  return (
    <div className="da26" {...resto}>
      <style>{CSS_DA}</style>
      {children}
    </div>
  );
}

/* ─── Hooks ─────────────────────────────────────────────────────────────── */

export function movimientoReducido() {
  try { return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches); } catch { return false; }
}

export function useReducido() {
  const [r, setR] = useState(() => (typeof window === "undefined" ? false : movimientoReducido()));
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return undefined;
    const f = () => setR(mq.matches);
    mq.addEventListener?.("change", f);
    return () => mq.removeEventListener?.("change", f);
  }, []);
  return r;
}

/** El ancho real de un elemento (ResizeObserver, Baseline amplio). */
export function useAncho(inicial = 288) {
  const ref = useRef(null);
  const [ancho, setAncho] = useState(inicial);
  usarEfecto(() => {
    const el = ref.current;
    if (!el) return undefined;
    const medir = () => { const w = el.getBoundingClientRect().width; if (w > 0) setAncho(Math.round(w)); };
    medir();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, ancho];
}

/**
 * Un número que va de su valor anterior al nuevo en `ms` (rAF). Con movimiento
 * reducido salta al final, que es lo que pide la especificación para las
 * gráficas. Lo usan las rectas de H3 y H6: la geometría de un SVG no es una
 * propiedad de CSS, así que aquí no hay transform posible sin falsear la recta.
 */
export function useAnimado(objetivo, ms = DUR) {
  const [v, setV] = useState(objetivo);
  const desde = useRef(objetivo);
  useEffect(() => {
    if (movimientoReducido() || ms <= 0) { desde.current = objetivo; setV(objetivo); return undefined; }
    const ini = performance.now();
    const a = desde.current;
    let marco = 0;
    const paso = (ahora) => {
      const t = Math.min(1, (ahora - ini) / ms);
      const e = 1 - (1 - t) ** 3;
      const actual = a + (objetivo - a) * e;
      desde.current = actual;
      setV(actual);
      if (t < 1) marco = requestAnimationFrame(paso);
    };
    marco = requestAnimationFrame(paso);
    const respaldo = setTimeout(() => { cancelAnimationFrame(marco); desde.current = objetivo; setV(objetivo); }, ms + 120);
    return () => { cancelAnimationFrame(marco); clearTimeout(respaldo); };
  }, [objetivo, ms]);
  return v;
}

/** Vuelve a poner una clase de animación de un solo tiro (sacudir, temblar). */
export function useGolpe() {
  const [n, setN] = useState(0);
  const golpear = useCallback(() => setN((k) => k + 1), []);
  return [n, golpear];
}

/* ─── Controles ─────────────────────────────────────────────────────────── */

export function Deslizador({ id, etiqueta, min, max, paso = 1, valor, onCambio, formato = String, extremos = null, disabled = false, colorRelleno = null }) {
  const pct = max === min ? 0 : (valor - min) / (max - min);
  const texto = formato(valor);
  return (
    <div className="da26-desl" data-deslizador={id}>
      <label className="da26-desl-cab" htmlFor={`da26-${id}`}><span>{etiqueta}</span></label>
      <span
        className="da26-desl-burbuja"
        aria-hidden="true"
        data-valor-deslizador={id}
        style={{ left: `calc(22px + ${pct} * (100% - 44px))`, transform: `translateX(${-pct * 100}%)` }}
      >
        {texto}
      </span>
      <input
        id={`da26-${id}`}
        type="range"
        min={min}
        max={max}
        step={paso}
        value={valor}
        disabled={disabled}
        aria-valuetext={texto}
        onChange={(e) => onCambio(Number(e.target.value))}
        style={{ "--pct": `${pct * 100}%`, ...(colorRelleno ? { "--relleno": colorRelleno } : {}) }}
      />
      {extremos && (
        <div className="da26-desl-extremos" aria-hidden="true"><span>{extremos[0]}</span><span>{extremos[1]}</span></div>
      )}
    </div>
  );
}

export function Interruptor({ etiqueta, activo, onCambio, id }) {
  return (
    <button type="button" role="switch" aria-checked={activo} className="da26-boton da26-interruptor" data-interruptor={id} onClick={() => onCambio(!activo)}>
      <span className="da26-carril" aria-hidden="true" />
      <span>{etiqueta}</span>
    </button>
  );
}

export function Boton({ children, primario = false, className = "", ...resto }) {
  return (
    <button type="button" className={`da26-boton${primario ? " da26-primario" : ""} ${className}`} {...resto}>
      {children}
    </button>
  );
}

/** La retroalimentación. Coral solo con estado «mal». */
export function Retro({ estado = "info", children, ...resto }) {
  if (!children) return <div role="status" aria-live="polite" className="da26-solo-lector" />;
  return (
    <div role="status" aria-live="polite" className="da26-retro da26-entra" data-estado={estado} data-retro {...resto}>
      {children}
    </div>
  );
}

/* ─── El marco de una pieza de Aprender ─────────────────────────────────── */

/**
 * Una pantalla a la vez: los puntos de avance, la figura (data-figura, arriba:
 * B1), el texto de lectura (data-texto-pantalla), los controles y «Siguiente».
 */
export function MarcoAprender({ id, paso, total, texto, figura, controles = null, puedeSeguir = true, onSiguiente, onAnterior, onTerminar, pie = null }) {
  const ultima = paso === total - 1;
  return (
    <div className="da26-tarjeta" data-pieza={id} data-pantalla={paso + 1}>
      <div className="da26-cabeza">
        <div className="da26-puntos" aria-hidden="true">
          {Array.from({ length: total }, (_, k) => (
            <span key={k} className="da26-punto" data-hecho={k < paso ? "1" : "0"} data-actual={k === paso ? "1" : "0"} />
          ))}
        </div>
        <span className="da26-rotulo da26-mono">{paso + 1} / {total}</span>
      </div>
      <div className="da26-figura da26-entra" data-figura key={`f${paso}`}>{figura}</div>
      <p className="da26-texto" data-texto-pantalla>{texto}</p>
      {controles && <div className="da26-controles">{controles}</div>}
      {pie}
      <div className="da26-nav">
        {paso > 0 ? <Boton onClick={onAnterior} data-anterior>Anterior</Boton> : <span />}
        {ultima
          ? <Boton primario onClick={onTerminar} disabled={!puedeSeguir} data-siguiente>Terminar</Boton>
          : <Boton primario onClick={onSiguiente} disabled={!puedeSeguir} data-siguiente>Siguiente</Boton>}
      </div>
    </div>
  );
}

/** El estado de pasos de una pieza de Aprender. */
export function usePasos(total) {
  const [paso, setPaso] = useState(0);
  const ir = (d) => setPaso((p) => Math.max(0, Math.min(total - 1, p + d)));
  return { paso, siguiente: () => ir(1), anterior: () => ir(-1) };
}

/* ─── El marco de una Hacer ─────────────────────────────────────────────── */

export function MarcoHacer({ id, consigna, progreso = null, children }) {
  return (
    <div className="da26-tarjeta" data-pieza={id}>
      <div className="da26-cabeza">
        <h2 className="da26-consigna" data-consigna style={{ margin: 0 }}>{consigna}</h2>
        {progreso && <span className="da26-rotulo da26-mono" data-progreso style={{ flex: "none" }}>{progreso}</span>}
      </div>
      {children}
    </div>
  );
}

/** Cuenta el tiempo de una partida desde el montaje. */
export function useCronometro() {
  const ini = useRef(typeof performance !== "undefined" ? performance.now() : 0);
  return () => Math.round(performance.now() - ini.current);
}
