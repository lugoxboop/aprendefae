/* Piezas de marca y de cierre que repiten todos los Reels (Nino, 26-nov).
 * Logo de AprendeFAE con el respaldo «AprendeFAE es de planck» (kit Planck: el logo de
 * planck va en imagen, nunca escrito), la píldora de invitación y el sello. */
import { Img, staticFile } from "remotion";
import { TINTA, CREMA, MANGO, AZUL } from "./base.jsx";
import { clamp01, rebote, sale, rampa, pulso } from "./tiempo.js";

export const CORAL = "#E76F51", VERDE = "#2FA36B", AZUL_C = "#6F86FF";
export const ARTE_MARCA = ["planck/planck-logo-claro.svg"];

export function Logo({ p, x = 540, y = 330 }) {
  if (p <= 0) return null;
  const e = rebote(Math.min(1, p));
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translateX(-50%) scale(${e})`, transformOrigin: "50% 0", opacity: Math.min(1, p * 3) }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, background: CREMA, border: `7px solid ${TINTA}`, borderRadius: 999, padding: "18px 44px 22px 34px", boxShadow: "0 12px 0 rgba(0,0,0,.25)" }}>
        <svg width="92" height="92" viewBox="0 0 32 32"><path d="M6 24 L16 7 L26 24" stroke="#1D3557" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /><circle cx="6" cy="24" r="3.6" fill="#1D3557" /><circle cx="26" cy="24" r="3.6" fill="#1D3557" /><circle cx="16" cy="7" r="3.9" fill="#E76F51" /></svg>
        <div style={{ fontFamily: "Sora", fontSize: 76, letterSpacing: "-0.035em", color: "#1D3557", whiteSpace: "nowrap" }}><span style={{ fontWeight: 300 }}>aprende</span><span style={{ fontWeight: 800 }}>FAE</span></div>
      </div>
      <div style={{ marginTop: 18, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, background: CREMA, borderRadius: 12, padding: "8px 22px 10px", width: "fit-content", marginLeft: "auto", marginRight: "auto", opacity: clamp01(p * 2 - 0.4) }}>
        <span style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 42, color: "#565C66" }}>AprendeFAE es de</span>
        <Img src={staticFile("planck/planck-logo-claro.svg")} style={{ height: 54, width: "auto", display: "block" }} />
      </div>
    </div>
  );
}

/* Píldora de invitación del cierre: va en la franja de subtítulos cuando la voz ya terminó. */
export function Invita({ p, children, y = 1330, tam = 66 }) {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 40, width: 1000, top: y, display: "flex", justifyContent: "center", opacity: p, transform: `scale(${0.85 + 0.15 * sale(p)})` }}>
      <div style={{ background: CREMA, border: `7px solid ${TINTA}`, borderRadius: 999, padding: "10px 40px 16px", fontFamily: "Sora", fontWeight: 800, fontSize: tam, color: TINTA, whiteSpace: "nowrap", boxShadow: "0 10px 0 rgba(0,0,0,.3)" }}>{children}</div>
    </div>
  );
}

/* Sello que cae y se estampa (cae grande y rota, rebota a su tamaño). */
export function Sello({ p, x, y, texto, color = CORAL, giro = -8, tam = 84 }) {
  if (p <= 0) return null;
  const e = clamp01(p);
  const esc = e < 0.5 ? 2.2 - 2.4 * e : 1 + 0.12 * pulso(e, 0.5, 0.5);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) rotate(${giro}deg) scale(${esc})`, opacity: Math.min(1, e * 4) }}>
      <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: tam, color, border: `10px solid ${color}`, borderRadius: 22, padding: "4px 30px 10px", background: "rgba(255,246,224,.92)", whiteSpace: "nowrap", letterSpacing: 2 }}>{texto}</div>
    </div>
  );
}

/* Tarjetas A / B de la pausa que reta, con cuenta atrás. */
export function Opciones({ t, p, elige = 0, sale: s = 0, cuenta = null, a, b, y = 420 }) {
  if (p <= 0) return null;
  const tarj = (lado, { letra, txt, color, icono }, k) => {
    const pe = rebote(clamp01(p * 1.4 - k * 0.25));
    const ganador = elige === lado, perdedor = elige && elige !== lado;
    const esc = pe * (ganador ? 1.12 : 1) * (perdedor ? 0.82 : 1);
    return (
      <div style={{ position: "absolute", left: lado === 1 ? 285 : 795, top: y, transform: `translate(-50%, 0) translateY(${-s * 1400}px) rotate(${(lado === 1 ? -4 : 4) * pe}deg) scale(${esc})`, opacity: perdedor ? 0.6 : 1, transformOrigin: "50% 0" }}>
        <div style={{ width: 420, background: CREMA, border: `8px solid ${TINTA}`, borderRadius: 34, padding: "26px 10px 30px", textAlign: "center", boxShadow: `0 14px 0 ${ganador ? color : "rgba(0,0,0,.3)"}` }}>
          <div style={{ width: 92, height: 92, margin: "0 auto", borderRadius: "50%", background: color, color: "#fff", fontFamily: "Sora", fontWeight: 800, fontSize: 62, lineHeight: "92px" }}>{letra}</div>
          <div style={{ height: 190, display: "flex", alignItems: "center", justifyContent: "center" }}>{icono}</div>
          <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: 52, lineHeight: 1.05, color: TINTA }}>{txt}</div>
        </div>
      </div>
    );
  };
  return (
    <>
      {tarj(1, { letra: "A", color: CORAL, ...a }, 0)}
      {tarj(2, { letra: "B", color: AZUL, ...b }, 1)}
      {cuenta !== null && cuenta > 0 && (
        <div style={{ position: "absolute", left: 470, top: y - 150, width: 140, height: 140, borderRadius: "50%", background: TINTA, color: MANGO, fontFamily: "Sora", fontWeight: 800, fontSize: 84, display: "flex", alignItems: "center", justifyContent: "center", border: `8px solid ${MANGO}`, transform: `scale(${1 + 0.15 * pulso(t % 1, 0, 0.3)})` }}>{cuenta}</div>
      )}
    </>
  );
}

/* Flecha que sube (dato al alza), dibujada. */
export function FlechaSube({ x, y, p, alto = 140, color = CORAL }) {
  if (p <= 0) return null;
  const e = rebote(clamp01(p));
  return (
    <svg width={alto * 0.8} height={alto} viewBox="0 0 80 100" style={{ position: "absolute", left: x - alto * 0.4, top: y - alto, transform: `scale(${e}) translateY(${(1 - clamp01(p)) * 20}px)`, transformOrigin: "50% 100%", overflow: "visible" }}>
      <path d="M40 4 L74 44 H54 V96 H26 V44 H6 Z" fill={color} stroke={TINTA} strokeWidth="7" strokeLinejoin="round" />
    </svg>
  );
}

export const fuenteDato = (txt, p, x = 540, y = 1250) => p > 0 && (
  <div style={{ position: "absolute", left: x, top: y, transform: "translateX(-50%)", opacity: clamp01(p), fontFamily: "Inter", fontWeight: 700, fontSize: 34, color: CREMA, background: "rgba(42,30,23,.72)", borderRadius: 12, padding: "6px 18px", whiteSpace: "nowrap" }}>{txt}</div>
);
export { rampa };
