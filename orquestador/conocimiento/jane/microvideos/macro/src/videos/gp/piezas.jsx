/*
 * Piezas dibujadas que comparten los microvideos de Gestión de Proyectos (GP-02 en adelante).
 * El calendario, el local de Pía y el tachón vienen de GP-01 (no se redibujan).
 */
import { TINTA, CREMA, MANGO } from "../../comun/base.jsx";
import { COLOR, clamp01, lerp, sale, rebote } from "../../comun/kit.jsx";
export { Calendario, Local, Tachon } from "../gp01/Video.jsx";

export const ROJO = "#E5484D";
const CONCRETO = "#C9CED6", CONCRETO2 = "#A9B1BD";

/* Puente de concreto en arco: (x, y) = centro del tablero. avance 0..1 lo construye
   (pilares → arco → tablero → baranda); grietas 0..1 las dibuja; autos > 0 pasan carros. */
export function Puente({ x, y, w, avance = 1, grietas = 0, autos = 0, t = 0, andamio = 0 }) {
  const h = w * 0.42;
  const pPil = clamp01(avance / 0.35), pArc = clamp01((avance - 0.3) / 0.35), pTab = clamp01((avance - 0.6) / 0.25), pBar = clamp01((avance - 0.85) / 0.15);
  const izq = x - w / 2;
  const r = w * 0.36;
  const largoArco = Math.PI * r;
  return (
    <div style={{ position: "absolute", left: izq, top: y - 40, width: w, height: h + 40 }}>
      {/* pilares */}
      {[0.06, 0.94].map((f) => (
        <div key={f} style={{ position: "absolute", left: w * f - w * 0.05, bottom: 0, width: w * 0.1, height: (h - 10) * sale(pPil), background: `linear-gradient(90deg,${CONCRETO2},${CONCRETO})`, border: `7px solid ${TINTA}`, borderRadius: 8 }} />
      ))}
      {/* arco */}
      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={w} height={h + 40}>
        <path d={`M ${w / 2 - r} ${h + 40} A ${r} ${r * 0.95} 0 0 1 ${w / 2 + r} ${h + 40}`} fill="none" stroke={TINTA} strokeWidth={46} strokeDasharray={largoArco * 1.1} strokeDashoffset={largoArco * 1.1 * (1 - pArc)} />
        <path d={`M ${w / 2 - r} ${h + 40} A ${r} ${r * 0.95} 0 0 1 ${w / 2 + r} ${h + 40}`} fill="none" stroke={CONCRETO} strokeWidth={30} strokeDasharray={largoArco * 1.1} strokeDashoffset={largoArco * 1.1 * (1 - pArc)} />
        {/* tirantes verticales del arco al tablero */}
        {pTab > 0 && [0.3, 0.4, 0.5, 0.6, 0.7].map((f) => {
          const dx = (f - 0.5) * w;
          const yy = h + 40 - Math.sqrt(Math.max(0, r * r - dx * dx)) * 0.95;
          return <line key={f} x1={w * f} y1={58} x2={w * f} y2={yy} stroke={TINTA} strokeWidth={10} opacity={pTab} />;
        })}
        {/* grietas: zigzag que se dibuja */}
        {grietas > 0 && [[0.22, 70], [0.5, 60], [0.74, 80]].map(([f, l], k) => {
          const L = l * 1.7, x0 = w * f, d = `M ${x0} 50 l 22 ${L * 0.25} l -28 ${L * 0.25} l 24 ${L * 0.25} l -16 ${L * 0.3}`;
          const pk = clamp01(grietas * 3 - k);
          return <path key={k} d={d} fill="none" stroke={TINTA} strokeWidth={13} strokeLinecap="round" strokeDasharray={400} strokeDashoffset={400 * (1 - pk)} />;
        })}
      </svg>
      {/* tablero */}
      <div style={{ position: "absolute", left: -10, top: 40, width: (w + 20) * sale(pTab), height: 40, background: CONCRETO, border: `7px solid ${TINTA}`, borderRadius: 8, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 13, height: 6, background: "repeating-linear-gradient(90deg,#fff 0 30px,transparent 30px 60px)", opacity: 0.8 }} />
      </div>
      {/* baranda */}
      {pBar > 0 && (
        <div style={{ position: "absolute", left: 0, top: 6, width: w * sale(pBar), height: 36, borderTop: `7px solid ${TINTA}`, background: `repeating-linear-gradient(90deg,${TINTA} 0 7px,transparent 7px 44px)` }} />
      )}
      {/* andamio mientras se construye */}
      {andamio > 0 && (
        <div style={{ position: "absolute", left: w * 0.12, top: 80, width: w * 0.76, height: h - 40, opacity: andamio, background: `repeating-linear-gradient(90deg,${MANGO} 0 8px,transparent 8px 70px), repeating-linear-gradient(0deg,${MANGO} 0 8px,transparent 8px 70px)` }} />
      )}
      {/* carros que cruzan */}
      {autos > 0 && [0, 1, 2].map((k) => {
        const q = ((t * 0.28 + k / 3) % 1);
        const col = [ROJO, COLOR.VERDE, "#2747F5"][k];
        return (
          <div key={k} style={{ position: "absolute", left: lerp(-80, w + 20, q), top: -6, width: 74, height: 42, opacity: autos * Math.min(1, Math.sin(q * Math.PI) * 4), transform: `scaleX(${k === 1 ? -1 : 1})` }}>
            <div style={{ position: "absolute", left: 0, bottom: 10, width: 74, height: 22, background: col, border: `5px solid ${TINTA}`, borderRadius: 8 }} />
            <div style={{ position: "absolute", left: 14, bottom: 26, width: 40, height: 18, background: col, border: `5px solid ${TINTA}`, borderRadius: "10px 10px 2px 2px" }} />
            {[10, 46].map((wx) => <div key={wx} style={{ position: "absolute", left: wx, bottom: 0, width: 18, height: 18, borderRadius: "50%", background: TINTA }} />)}
          </div>
        );
      })}
    </div>
  );
}

/* Grieta que parte la pantalla (SVG en coordenadas del lienzo) */
export function Grieta({ p, puntos, grosor = 16, color = TINTA }) {
  if (p <= 0) return null;
  const d = "M " + puntos.map(([a, b]) => `${a} ${b}`).join(" L ");
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width="1" height="1">
      <path d={d} fill="none" stroke="#fff" strokeWidth={grosor + 10} strokeLinejoin="miter" strokeLinecap="round" strokeDasharray={3000} strokeDashoffset={3000 * (1 - clamp01(p))} opacity={0.7} />
      <path d={d} fill="none" stroke={color} strokeWidth={grosor} strokeLinejoin="miter" strokeLinecap="round" strokeDasharray={3000} strokeDashoffset={3000 * (1 - clamp01(p))} />
    </svg>
  );
}

/* Celular con pantalla: children se pintan dentro (coordenadas de la pantalla) */
export function Celular({ x, y, w, p = 1, giro = 0, children }) {
  if (p <= 0) return null;
  const h = w * 1.9;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `scale(${rebote(Math.min(1, p))}) rotate(${giro}deg)`, opacity: Math.min(1, p * 3) }}>
      <div style={{ position: "absolute", inset: 0, background: "#2F3742", border: `8px solid ${TINTA}`, borderRadius: w * 0.16, boxShadow: "0 12px 0 rgba(42,30,23,.28)" }} />
      <div style={{ position: "absolute", left: w * 0.08, right: w * 0.08, top: h * 0.07, bottom: h * 0.07, background: "#FFFDF7", borderRadius: w * 0.07, overflow: "hidden" }}>{children}</div>
      <div style={{ position: "absolute", left: "50%", top: h * 0.025, width: w * 0.22, height: 10, marginLeft: -w * 0.11, background: TINTA, borderRadius: 5 }} />
    </div>
  );
}

/* Estrellas de calificación (0..5, se llenan una a una con p) */
export function Estrellas({ x, y, tam = 70, p }) {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)", display: "flex", gap: 6, whiteSpace: "nowrap" }}>
      {[0, 1, 2, 3, 4].map((k) => {
        const q = clamp01(p * 5 - k);
        return <span key={k} style={{ fontSize: tam, lineHeight: 1, color: q > 0 ? MANGO : "#D9D2C3", WebkitTextStroke: `${Math.round(tam / 16)}px ${TINTA}`, paintOrder: "stroke fill", display: "inline-block", transform: `scale(${q > 0 ? rebote(q) : 1})`, fontFamily: "Sora", fontWeight: 800 }}>★</span>;
      })}
    </div>
  );
}

/* Etiqueta de precio que cuelga */
export function Precio({ x, y, txt, p = 1, fondo = CREMA, giro = -8, tachado = 0 }) {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${rebote(Math.min(1, p))}) rotate(${giro}deg)`, opacity: Math.min(1, p * 3) }}>
      <div style={{ position: "relative", background: fondo, border: `7px solid ${TINTA}`, borderRadius: "14px 40px 40px 14px", padding: "6px 34px 10px 26px", fontFamily: "Sora", fontWeight: 800, fontSize: 64, color: TINTA, whiteSpace: "nowrap", boxShadow: "0 8px 0 rgba(42,30,23,.25)" }}>
        {txt}
        <div style={{ position: "absolute", right: 14, top: "50%", width: 18, height: 18, marginTop: -9, borderRadius: "50%", background: TINTA }} />
        {tachado > 0 && <div style={{ position: "absolute", left: 12, top: "52%", height: 12, width: `${90 * sale(tachado)}%`, background: ROJO, borderRadius: 6, transform: "rotate(-8deg)", transformOrigin: "0 50%" }} />}
      </div>
    </div>
  );
}

/* Documento oficial con sello (la norma) */
export function Documento({ x, y, w, p = 1, titulo = "NORMA", sello = 0, giro = 0 }) {
  if (p <= 0) return null;
  const h = w * 1.3;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `translateY(${(1 - sale(Math.min(1, p))) * -600}px) rotate(${giro}deg)` }}>
      <div style={{ position: "absolute", inset: 0, background: "#FFFDF7", border: `8px solid ${TINTA}`, borderRadius: 16, boxShadow: "0 14px 0 rgba(42,30,23,.28)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.07, textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: w * 0.15, color: TINTA }}>{titulo}</div>
      {[0.3, 0.4, 0.5, 0.6, 0.7].map((f, k) => <div key={f} style={{ position: "absolute", left: w * 0.12, width: w * (k % 2 ? 0.6 : 0.76), top: h * f, height: 12, background: "#D9D2C3", borderRadius: 6 }} />)}
      {sello > 0 && (
        <div style={{ position: "absolute", right: w * 0.06, bottom: h * 0.06, width: w * 0.4, height: w * 0.4, borderRadius: "50%", border: `9px solid ${ROJO}`, color: ROJO, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: w * 0.08, transform: `rotate(-16deg) scale(${lerp(2, 1, sale(sello))})`, opacity: Math.min(1, sello * 3), background: "rgba(255,255,255,.6)" }}>OFICIAL</div>
      )}
    </div>
  );
}

/* Tarjeta con icono grande y rótulo corto (para resumir casos) */
export function Ficha({ x, y, w = 260, icono, txt, p = 1, fondo = CREMA, giro = 0, op = 1 }) {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - w * 0.55, width: w, transform: `scale(${rebote(Math.min(1, p))}) rotate(${giro}deg)`, opacity: Math.min(1, p * 3) * op }}>
      <div style={{ background: fondo, border: `7px solid ${TINTA}`, borderRadius: 24, padding: "14px 10px 16px", textAlign: "center", boxShadow: "0 9px 0 rgba(42,30,23,.28)" }}>
        <div style={{ fontSize: w * 0.36, lineHeight: 1.05, fontFamily: "Sora", fontWeight: 800, color: TINTA }}>{icono}</div>
        <div style={{ marginTop: 6, fontFamily: "Sora", fontWeight: 800, fontSize: w * 0.15, lineHeight: 1.15, color: TINTA }}>{txt}</div>
      </div>
    </div>
  );
}
