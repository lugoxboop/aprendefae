/* Piezas reutilizables de los microvideos de Macro: fondos, carrito con bloques,
   pizarra de tiza, objetos ilustrados del repo, cifras y flechas. Todo por cuadro. */
import { Img, staticFile, AbsoluteFill } from "remotion";
import { TINTA, CREMA, MANGO, AZUL, TIZA, PIZARRA, Camara } from "./base.jsx";
import { clamp01, lerp, suave, sale, rampa, rebote, pulso } from "./tiempo.js";

export const COLOR = { C: "#f2c14e", I: "#4fc2b2", G: "#6f86ff", XN: "#f4f5f7", X: "#7fd17f", M: "#8e94a0", CORAL: "#E76F51", VERDE: "#2FA36B" };
export const NOMBRE = { C: "Consumo", I: "Inversión", G: "Gasto público", XN: "Exportaciones netas" };

/* Fondo ilustrado a pantalla completa, dentro de la cámara (1080 × 1935) */
export const Fondo = ({ src, filtro, alto = 1935 }) => (
  <Img src={staticFile(src)} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: alto, objectFit: "cover", filter: filtro }} />
);

/* Escena con cámara y fondo */
export function Escena({ cam, fondo, filtro, children, alto = 1935, velo = 0 }) {
  return (
    <AbsoluteFill>
      <Camara {...cam} alto={alto}>
        {fondo && <Fondo src={fondo} filtro={filtro} alto={alto} />}
        {velo > 0 && <div style={{ position: "absolute", inset: 0, background: `rgba(255,246,224,${velo})` }} />}
        {children}
      </Camara>
    </AbsoluteFill>
  );
}

/* Objeto ilustrado del repo (macro2026/ilustrados u objetos), centrado en (x, y) */
export function Obj({ src, x, y, w, giro = 0, esc = 1, op = 1, espejo = false, sombra = false, filtro }) {
  return (
    <Img src={staticFile(src)} style={{
      position: "absolute", left: x - w / 2, top: y, width: w, opacity: op, transformOrigin: "50% 50%",
      transform: `translateY(-50%) rotate(${giro}deg) scale(${(espejo ? -1 : 1) * esc}, ${esc})`,
      filter: [sombra ? "drop-shadow(0 14px 0 rgba(42,30,23,.22))" : "", filtro || ""].join(" ") || undefined,
    }} />
  );
}

/* Aparece con rebote a partir de t0 */
export const aparece = (t, t0, d = 0.4) => rebote(rampa(t, t0, d));

/* Etiqueta tipo cartel: texto grande con borde de tinta */
export function Cartel({ x, y, txt, p = 1, fondo = CREMA, color = TINTA, tam = 64, giro = 0, borde = 7, ancla = "50% 50%" }) {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${rebote(Math.min(1, p))}) rotate(${giro}deg)`, transformOrigin: ancla, opacity: Math.min(1, p * 3), whiteSpace: "nowrap" }}>
      <div style={{ background: fondo, color, border: `${borde}px solid ${TINTA}`, borderRadius: 24, padding: "8px 28px 12px", fontFamily: "Sora", fontWeight: 800, fontSize: tam, lineHeight: 1.1, boxShadow: "0 9px 0 rgba(42,30,23,.28)" }}>{txt}</div>
    </div>
  );
}

/* Letra o cifra gigante con contorno (para «?», «C», «+100») */
export function Gigante({ x, y, txt, p, color = MANGO, tam = 260, giro = 0 }) {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${rebote(Math.min(1, p))}) rotate(${giro}deg)`, fontFamily: "Sora", fontWeight: 800, fontSize: tam, lineHeight: 1, color, WebkitTextStroke: `${Math.round(tam / 20)}px ${TINTA}`, paintOrder: "stroke fill", whiteSpace: "nowrap" }}>{txt}</div>
  );
}

/* ── Carrito gigante con bloques APILADOS (la altura total es la demanda agregada) ──
   (x, y) = centro arriba de la imagen; bloques de abajo hacia arriba:
   [{ k: "C", alto: px, p: 0..1 (caída), letra }] */
export function Carrito({ x, y, w, bloques = [], sacude = 0, nivel = 0, rotulo = "DA" }) {
  const h = w * 360 / 496;
  const L = x - w / 2 + w * 0.30, R = x - w / 2 + w * 0.86, base = y + h * 0.63;
  let acum = 0;
  const piezas = bloques.map((b) => {
    const alto = Math.max(0, b.alto);
    const caida = 1 - sale(clamp01(b.p));
    const top = base - acum - alto - caida * 1100;
    if (b.p > 0) acum += alto * clamp01(b.p * 1.4);
    return { ...b, alto, top };
  });
  const cima = base - acum;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1935, transform: `rotate(${2.5 * sacude * Math.sin(sacude * 30)}deg)`, transformOrigin: `${x}px ${y + h}px` }}>
      {piezas.map((b) => b.p <= 0 ? null : (
        <div key={b.k} style={{ position: "absolute", left: L, top: b.top, width: R - L, height: b.alto, opacity: Math.min(1, b.p * 4), background: b.color || COLOR[b.k], border: `7px solid ${TINTA}`, borderRadius: 16, boxShadow: "inset 0 -12px 0 rgba(0,0,0,.12)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {b.raya && <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(45deg, rgba(42,30,23,.25) 0 10px, transparent 10px 22px)" }} />}
          <span style={{ position: "relative", fontFamily: "Sora", fontWeight: 800, fontSize: Math.max(30, Math.min(96, b.alto * 0.7)), color: TINTA, whiteSpace: "nowrap" }}>{b.letra ?? b.k}</span>
        </div>
      ))}
      <Img src={staticFile("macro2026/ilustrados/carrito-mercado.webp")} style={{ position: "absolute", left: x - w / 2, top: y, width: w }} />
      {nivel > 0 && (
        <div style={{ position: "absolute", left: L - 60, top: cima - 4, width: R - L + 120, height: 8, background: MANGO, border: `3px solid ${TINTA}`, opacity: Math.min(1, nivel) }}>
          <div style={{ position: "absolute", left: -150, top: -40, fontFamily: "Sora", fontWeight: 800, fontSize: 64, color: MANGO, WebkitTextStroke: `8px ${TINTA}`, paintOrder: "stroke fill" }}>{rotulo}</div>
        </div>
      )}
    </div>
  );
}

/* ── Pizarra de tiza ── (x, y, w, h); dentro se dibuja con Tiza y TrazoTiza */
export function Pizarra({ x, y, w, h, children, marco = "#8A5A35" }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h }}>
      <div style={{ position: "absolute", inset: 0, background: marco, borderRadius: 26, border: `8px solid ${TINTA}`, boxShadow: "0 16px 0 rgba(42,30,23,.3)" }} />
      <div style={{ position: "absolute", left: 30, top: 30, right: 30, bottom: 30, background: `radial-gradient(ellipse at 40% 30%, #34413F, ${PIZARRA})`, borderRadius: 10, border: `5px solid ${TINTA}`, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.08, background: "repeating-linear-gradient(115deg, #fff 0 2px, transparent 2px 9px)" }} />
        {children}
      </div>
    </div>
  );
}
/* texto de tiza que se escribe de izquierda a derecha */
export function Tiza({ x, y, txt, p, tam = 70, color = TIZA, fuente = "Caveat", centro = false, peso = 700 }) {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: centro ? "translateX(-50%)" : undefined, whiteSpace: "nowrap", fontFamily: fuente, fontWeight: peso, fontSize: tam, lineHeight: 1.1, color, clipPath: `inset(-20% ${100 - clamp01(p) * 100}% -20% 0)`, textShadow: "0 0 2px rgba(255,255,255,.35)" }}>{txt}</div>
  );
}
/* trazo de tiza (path SVG) que se dibuja de 0 a 1 */
export function TrazoTiza({ d, p, w = 8, color = TIZA, largo = 2000, flecha = false, punteado = false }) {
  if (p <= 0) return null;
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width="1" height="1">
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={punteado ? "18 16" : largo} strokeDashoffset={punteado ? 0 : largo * (1 - clamp01(p))} opacity={punteado ? clamp01(p) : 0.95} />
    </svg>
  );
}

/* ── Barco que cruza: dir 1 sale a la derecha, -1 llega desde la derecha ── */
export function Barco({ x, y, w, carga = null, espejo = false, cabeceo = 0, t = 0 }) {
  const giro = 1.5 * Math.sin(t * 2.4) + cabeceo;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - w * 0.5, width: w, height: w * 0.6, transform: `rotate(${giro}deg) scaleX(${espejo ? -1 : 1})` }}>
      {carga && <Img src={staticFile(carga)} style={{ position: "absolute", left: w * 0.3, top: -w * 0.08, width: w * 0.32, transform: `scaleX(${espejo ? -1 : 1})` }} />}
      <Img src={staticFile("macro2026/objetos/barco.png")} style={{ position: "absolute", left: 0, top: 0, width: w }} />
    </div>
  );
}

/* ── Monedas que viajan de (x0,y0) a (x1,y1) en arco ── */
export function Monedas({ t, t0, d = 0.9, n = 5, x0, y0, x1, y1, w = 70, alto = 260 }) {
  const out = [];
  for (let k = 0; k < n; k++) {
    const p = rampa(t, t0 + k * 0.08, d);
    if (p <= 0 || p >= 1) continue;
    const q = sale(p);
    out.push(<Img key={k} src={staticFile("macro2026/ilustrados/moneda-oro.webp")} style={{ position: "absolute", left: lerp(x0, x1, q) - w / 2 + (k - n / 2) * 10, top: lerp(y0, y1, q) - alto * Math.sin(Math.PI * q) - w / 2, width: w, transform: `rotate(${p * 360}deg)` }} />);
  }
  return <>{out}</>;
}

/* Horno industrial dibujado (acero, ventana que brilla) */
export function Horno({ x, y, w, brillo = 0.5 }) {
  const h = w * 1.05;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h, width: w, height: h }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,#B9C2CF,#E3E8EF 45%,#A8B2C1)", border: `8px solid ${TINTA}`, borderRadius: 22 }} />
      <div style={{ position: "absolute", left: "14%", right: "14%", top: "16%", height: "40%", background: `radial-gradient(circle at 50% 60%, rgba(255,180,60,${0.5 + brillo * 0.5}), #5A2E12)`, border: `7px solid ${TINTA}`, borderRadius: 14 }} />
      <div style={{ position: "absolute", left: "20%", right: "20%", top: "62%", height: 18, background: TINTA, borderRadius: 9 }} />
      {[0, 1, 2].map((k) => <div key={k} style={{ position: "absolute", left: `${24 + k * 22}%`, top: "76%", width: 34, height: 34, borderRadius: "50%", background: k === 1 ? "#E5484D" : "#596579", border: `5px solid ${TINTA}` }} />)}
    </div>
  );
}
/* Pan (elipse dorada con cortes) */
export const Pan = ({ x, y, w, giro = 0 }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - w * 0.28, width: w, height: w * 0.56, background: "radial-gradient(ellipse at 45% 35%, #F7C87A, #C98A3B)", border: `6px solid ${TINTA}`, borderRadius: "50%", transform: `rotate(${giro}deg)` }}>
    {[0.3, 0.5, 0.7].map((f) => <div key={f} style={{ position: "absolute", left: `${f * 100 - 4}%`, top: "22%", width: "8%", height: "40%", background: "#9C6326", borderRadius: 8, transform: "rotate(20deg)" }} />)}
  </div>
);

/* Flecha gruesa con contorno: de (x0,y0) a (x1,y1) */
export function Flecha({ x0, y0, x1, y1, p = 1, color = MANGO, grosor = 26 }) {
  if (p <= 0) return null;
  const xe = lerp(x0, x1, sale(p)), ye = lerp(y0, y1, sale(p));
  const ang = Math.atan2(y1 - y0, x1 - x0);
  const cab = grosor * 2.2;
  const hx = xe - Math.cos(ang) * cab * 0.6, hy = ye - Math.sin(ang) * cab * 0.6;
  const pts = [[xe, ye], [hx + Math.cos(ang + 2.4) * cab * 0.5, hy + Math.sin(ang + 2.4) * cab * 0.5], [hx + Math.cos(ang - 2.4) * cab * 0.5, hy + Math.sin(ang - 2.4) * cab * 0.5]];
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width="1" height="1">
      <line x1={x0} y1={y0} x2={hx} y2={hy} stroke={TINTA} strokeWidth={grosor + 14} strokeLinecap="round" />
      <polygon points={pts.map((q) => q.join(",")).join(" ")} fill={TINTA} stroke={TINTA} strokeWidth={14} strokeLinejoin="round" />
      <line x1={x0} y1={y0} x2={hx} y2={hy} stroke={color} strokeWidth={grosor} strokeLinecap="round" />
      <polygon points={pts.map((q) => q.join(",")).join(" ")} fill={color} />
    </svg>
  );
}

/* Brillo / destello radial detrás de algo que aparece */
export const Destello = ({ x, y, r, p, color = "rgba(255,230,150,.75)" }) => p <= 0 || p >= 1 ? null : (
  <div style={{ position: "absolute", left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: "50%", background: `radial-gradient(circle, ${color}, rgba(255,230,150,0) 70%)`, transform: `scale(${0.4 + p})`, opacity: Math.sin(p * Math.PI) }} />
);

export { clamp01, lerp, suave, sale, rampa, rebote, pulso };
