/*
 * prueba-01 · «¿Café o dormir?» — Reel de prueba de Nino (15-20 s).
 * Historia: son las 2 a. m., Toby tiene parcial a las 7 y una montaña de fotocopias.
 * Pausa que reta (A café / B dormir), Toby elige café y al tercero no entiende ni el
 * título. Dato verdadero: dormir ayuda a fijar lo estudiado (consolidación de la memoria).
 * Cierre: pregunta para comentar y el logo en el mundo. No menciona la plataforma.
 */
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Mascota, Sombra, Camara, camara, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { Reel } from "../../comun/Reel.jsx";
import { crearTiempo, clamp01, lerp, suave, sale, rampa, rebote, pulso } from "../../comun/tiempo.js";
import DATOS, { VOZ } from "./tiempos.js";
/* las imágenes que no son mascotas se precargan aparte */
const ARTE = ["planck/planck-logo-claro.svg"];

export const T = crearTiempo(DATOS, { extra: [0.0, 0.1, 0.15, 1.3, 0.2, 0.2], cola: 1.65, recorta: true, ritmo: 1.17 });
export const DURACION = T.DURACION_S;
const { S, E, W } = T;

const CORAL = "#E76F51", VERDE = "#2FA36B", AZUL_C = "#6F86FF", MESA = 1300;

/* ── cielo de la ventana: noche → amanecer ── */
function Cielo({ t, alba }) {
  const c1 = mezcla("#0B1233", "#F7A86B", alba), c2 = mezcla("#283A7A", "#FBD9A0", alba);
  return (
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${c1}, ${c2})`, overflow: "hidden" }}>
      {ESTRELLAS.map(([x, y, r], i) => (
        <div key={i} style={{ position: "absolute", left: x, top: y, width: r, height: r, borderRadius: "50%", background: "#fff", opacity: (1 - alba) * (0.45 + 0.55 * Math.abs(Math.sin(t * 1.7 + i))) }} />
      ))}
      {/* luna que se pone / sol que sale */}
      <div style={{ position: "absolute", left: 300, top: 70 + alba * 260, width: 92, height: 92, borderRadius: "50%", background: "#FFF3C4", boxShadow: "0 0 60px 18px rgba(255,243,196,.35)", opacity: 1 - alba }} />
      <div style={{ position: "absolute", left: 110, top: 470 - alba * 170, width: 150, height: 150, borderRadius: "50%", background: "#FFD36B", boxShadow: "0 0 90px 40px rgba(255,200,90,.55)", opacity: alba }} />
      {/* ciudad lejana (desenfocada) y cercana */}
      <div style={{ position: "absolute", left: -20, right: -20, bottom: 0, height: 230, filter: "blur(2.5px)" }}>
        {LEJANA.map(([x, w, h], i) => <div key={i} style={{ position: "absolute", left: x, bottom: 0, width: w, height: h, background: mezcla("#3A4B8C", "#D9906A", alba), opacity: 0.85 }} />)}
      </div>
      <div style={{ position: "absolute", left: -20, right: -20, bottom: 0, height: 200 }}>
        {CERCANA.map(([x, w, h], i) => (
          <div key={i} style={{ position: "absolute", left: x, bottom: 0, width: w, height: h, background: mezcla("#141B3D", "#6E4A55", alba) }}>
            {[0, 1, 2].map((k) => ((i + k) % 3 === 0 ? <div key={k} style={{ position: "absolute", left: 10 + k * 18, top: 16 + k * 22, width: 9, height: 12, background: MANGO, opacity: (1 - alba) * 0.85 }} /> : null))}
          </div>
        ))}
      </div>
    </div>
  );
}
const ESTRELLAS = [[40, 60, 5], [120, 140, 3], [210, 40, 4], [420, 30, 3], [380, 190, 5], [60, 230, 3], [250, 260, 4], [440, 120, 3], [160, 90, 4]];
const LEJANA = [[0, 70, 150], [60, 90, 200], [150, 60, 130], [200, 110, 210], [300, 70, 160], [360, 120, 190], [470, 60, 140]];
const CERCANA = [[-10, 90, 120], [70, 70, 160], [130, 100, 95], [230, 80, 140], [300, 110, 110], [410, 90, 150], [490, 60, 100]];
function mezcla(a, b, p) {
  const h = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const A = h(a), B = h(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp01(p)))).join(",")})`;
}

/* ── la habitación (todo el mundo, 1080×1920) ── */
function Cuarto({ t, alba = 0, luz = 1, hojas = 8, tazas = 0, hora = "2:00", toby = {}, nota = 0, logo = 0, carteles = null }) {
  const brillo = luz * (0.85 + 0.15 * Math.sin(t * 9) * Math.sin(t * 3.1) * 0.2);
  return (
    <AbsoluteFill>
      {/* pared */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${mezcla("#26346A", "#5B4E7A", alba)}, ${mezcla("#1A2450", "#3E3763", alba)})` }} />
      {/* luz cálida de la lámpara sobre la pared */}
      <div style={{ position: "absolute", left: 360, top: 520, width: 900, height: 900, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,210,130,.42), rgba(255,210,130,0))", opacity: brillo }} />
      {/* ventana */}
      <div style={{ position: "absolute", left: 90, top: 300, width: 500, height: 560, background: "#5A3A28", borderRadius: 18, padding: 18, boxShadow: "0 18px 0 rgba(0,0,0,.18)" }}>
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 8, overflow: "hidden" }}>
          <Cielo t={t} alba={alba} />
          <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 16, marginLeft: -8, background: "#5A3A28" }} />
          <div style={{ position: "absolute", top: "48%", left: 0, right: 0, height: 16, background: "#5A3A28" }} />
        </div>
      </div>
      {/* cortina */}
      <div style={{ position: "absolute", left: 40, top: 270, width: 120, height: 640, background: `linear-gradient(90deg, ${AZUL}, #1D36C4)`, borderRadius: "0 0 40px 20px", transform: `skewX(${Math.sin(t * 0.8) * 1.2}deg)`, transformOrigin: "50% 0" }} />
      <div style={{ position: "absolute", left: 20, top: 262, width: 640, height: 20, background: "#3B2619", borderRadius: 10 }} />
      {/* nota del parcial en la pared */}
      <div style={{ position: "absolute", left: 640, top: 340, width: 250, height: 210, background: MANGO, transform: `rotate(${4 + Math.sin(t * 1.2) * 0.6}deg)`, boxShadow: "0 10px 0 rgba(0,0,0,.2)", padding: "26px 18px", fontFamily: "Caveat", fontWeight: 700, color: TINTA, textAlign: "center" }}>
        <div style={{ position: "absolute", left: 105, top: -16, width: 40, height: 40, borderRadius: "50%", background: CORAL, border: `5px solid ${TINTA}` }} />
        <div style={{ fontSize: 54, lineHeight: 1 }}>¡PARCIAL!</div>
        <div style={{ fontSize: 70, lineHeight: 1.05 }}>7:00 a. m.</div>
      </div>
      {/* tarjeta del dato (escena 5) */}
      {nota > 0 && (
        <div style={{ position: "absolute", left: 360, top: 470, width: 360, transformOrigin: "50% 0", transform: `rotate(${-3 + 6 * (1 - rebote(nota))}deg) scale(${rebote(Math.min(1, nota))})`, background: CREMA, border: `7px solid ${TINTA}`, borderRadius: 26, padding: "20px 22px 26px", boxShadow: "0 12px 0 rgba(0,0,0,.25)", textAlign: "center" }}>
          <div style={{ display: "inline-block", fontFamily: "Sora", fontWeight: 800, fontSize: 36, color: "#fff", background: VERDE, borderRadius: 999, padding: "4px 22px" }}>DATO</div>
          <div style={{ fontFamily: "Caveat", fontWeight: 700, fontSize: 60, lineHeight: 1, color: TINTA, marginTop: 10 }}>dormir fija lo que estudiaste</div>
        </div>
      )}
      {/* Toby */}
      <Sombra x={toby.x ?? 600} y={MESA + 10} w={330} op={0.25} />
      <Mascota esp="perro" x={toby.x ?? 600} y={MESA + 150} alto={560} t={t} semilla={1} {...toby} />
      {/* montaña de fotocopias */}
      <Pila t={t} n={hojas} />
      {/* escritorio */}
      <div style={{ position: "absolute", left: -40, right: -40, top: MESA, height: 40, background: "#B07A4F", borderRadius: 12, boxShadow: "0 6px 0 #6E4628" }} />
      <div style={{ position: "absolute", left: -40, right: -40, top: MESA + 40, bottom: 0, background: "linear-gradient(#7A4E31, #5C3A24)" }} />
      <div style={{ position: "absolute", left: 120, right: 120, top: MESA + 150, height: 8, background: "rgba(0,0,0,.18)", borderRadius: 4 }} />
      {/* lámpara */}
      <Lampara luz={luz} t={t} />
      {/* reloj */}
      <Reloj hora={hora} t={t} />
      {/* tazas de café */}
      {[0, 1, 2].map((k) => (tazas > k ? <Taza key={k} x={760 + k * 0 + (k - 1) * 95 + 30} p={clamp01(tazas - k)} t={t} k={k} /> : null))}
      {carteles}
      {/* logo al cierre, colgado en la pared */}
      {logo > 0 && <Logo p={logo} />}
    </AbsoluteFill>
  );
}

function Pila({ t, n }) {
  const L = [];
  const entera = Math.floor(n), frac = n - entera;
  for (let k = 0; k < Math.min(entera + 1, 48); k++) {
    const p = k < entera ? 1 : frac;
    if (p <= 0) continue;
    const y = MESA - 18 - k * 19.5 - (1 - sale(p)) * 260;
    const x = 175 + ((k * 37) % 23) - 11 + Math.sin(k * 1.9) * 8;
    L.push(
      <div key={k} style={{ position: "absolute", left: x - 130, top: y, width: 260, height: 18, background: k % 2 ? "#F4F1EA" : "#FFFFFF", border: `4px solid ${TINTA}`, borderRadius: 4, transform: `rotate(${Math.sin(k * 2.7) * 2.2 + (1 - p) * 12}deg)`, opacity: Math.min(1, p * 3) }} />
    );
  }
  return <>{L}</>;
}

function Lampara({ luz, t }) {
  return (
    <>
      <div style={{ position: "absolute", left: 845, top: MESA - 26, width: 140, height: 30, background: AZUL, border: `6px solid ${TINTA}`, borderRadius: 14 }} />
      <div style={{ position: "absolute", left: 905, top: MESA - 330, width: 18, height: 320, background: AZUL, border: `5px solid ${TINTA}`, borderRadius: 9, transform: "rotate(8deg)", transformOrigin: "50% 100%" }} />
      <div style={{ position: "absolute", left: 790, top: MESA - 390, width: 190, height: 120, background: AZUL, border: `7px solid ${TINTA}`, borderRadius: "90px 90px 20px 20px", transform: "rotate(-24deg)" }} />
      <div style={{ position: "absolute", left: 700, top: MESA - 300, width: 300, height: 320, background: "linear-gradient(200deg, rgba(255,226,150,.55), rgba(255,226,150,0))", clipPath: "polygon(40% 0, 70% 0, 100% 100%, 0 100%)", opacity: luz, transform: "rotate(-24deg)", transformOrigin: "60% 0" }} />
    </>
  );
}

function Reloj({ hora, t }) {
  const parpadea = Math.floor(t * 2) % 2 === 0;
  return (
    <div style={{ position: "absolute", left: 318, top: MESA - 112, width: 210, height: 108, background: "#1B1B22", border: `7px solid ${TINTA}`, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 0 rgba(0,0,0,.25)" }}>
      <div style={{ fontFamily: "Inter", fontWeight: 800, fontSize: 70, color: "#FF5A4A", textShadow: "0 0 18px rgba(255,90,74,.8)", letterSpacing: 2 }}>
        {hora.split(":")[0]}<span style={{ opacity: parpadea ? 1 : 0.25 }}>:</span>{hora.split(":")[1]}
      </div>
    </div>
  );
}

function Taza({ x, p, t, k }) {
  const e = rebote(p);
  return (
    <div style={{ position: "absolute", left: x - 45, top: MESA - 104, width: 90, height: 104, transformOrigin: "50% 100%", transform: `scale(${e})` }}>
      <div style={{ position: "absolute", right: -30, top: 22, width: 44, height: 46, border: `9px solid ${TINTA}`, borderRadius: "0 30px 30px 0", borderLeft: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: k === 2 ? CORAL : CREMA, border: `7px solid ${TINTA}`, borderRadius: "10px 10px 26px 26px" }} />
      {[0, 1].map((j) => (
        <div key={j} style={{ position: "absolute", left: 22 + j * 26, top: -58 - 14 * Math.sin(t * 3 + j), width: 12, height: 44, borderRadius: 8, background: "rgba(255,255,255,.55)", filter: "blur(3px)", transform: `skewX(${Math.sin(t * 4 + j * 2) * 18}deg)` }} />
      ))}
    </div>
  );
}

/* logo de AprendeFAE (el de src/components/Logo.jsx), en una placa en la pared */
function Logo({ p }) {
  const e = rebote(Math.min(1, p));
  return (
    <div style={{ position: "absolute", left: 540, top: 330, transform: `translateX(-50%) scale(${e})`, transformOrigin: "50% 0", opacity: Math.min(1, p * 3) }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, background: CREMA, border: `7px solid ${TINTA}`, borderRadius: 999, padding: "18px 44px 22px 34px", boxShadow: "0 12px 0 rgba(0,0,0,.25)" }}>
        <svg width="92" height="92" viewBox="0 0 32 32"><path d="M6 24 L16 7 L26 24" stroke="#1D3557" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /><circle cx="6" cy="24" r="3.6" fill="#1D3557" /><circle cx="26" cy="24" r="3.6" fill="#1D3557" /><circle cx="16" cy="7" r="3.9" fill="#E76F51" /></svg>
        <div style={{ fontFamily: "Sora", fontSize: 76, letterSpacing: "-0.035em", color: "#1D3557", whiteSpace: "nowrap" }}><span style={{ fontWeight: 300 }}>aprende</span><span style={{ fontWeight: 800 }}>FAE</span></div>
      </div>
      {/* respaldo de marca (kit Planck, nov-2026): todo producto termina con «… es de planck»; el logo va en imagen, nunca escrito */}
      <div style={{ marginTop: 18, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, background: CREMA, borderRadius: 12, padding: "8px 22px 10px", width: "fit-content", marginLeft: "auto", marginRight: "auto", opacity: clamp01(p * 2 - 0.4) }}>
        <span style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 30, color: "#565C66" }}>AprendeFAE es de</span>
        <Img src={staticFile("planck/planck-logo-claro.svg")} style={{ height: 36, width: "auto", display: "block" }} />
      </div>
    </div>
  );
}

/* carteles A / B de la pausa que reta */
function Opciones({ t, p, elige = 0, sale: s = 0, cuenta = null, chicas = false }) {
  if (p <= 0) return null;
  const tarj = (lado, letra, txt, color, icono, k) => {
    const pe = rebote(clamp01(p * 1.4 - k * 0.25));
    const ganador = elige === lado, perdedor = elige && elige !== lado;
    const esc = (chicas ? 0.68 : 1) * pe * (ganador ? 1 + 0.1 * Math.sin(Math.min(1, (t % 10)) * 0) + 0.12 : 1) * (perdedor ? 0.82 : 1);
    return (
      <div style={{ position: "absolute", left: lado === 1 ? (chicas ? 250 : 255) : (chicas ? 690 : 685), top: chicas ? 560 : 420, transform: `translate(-50%, 0) translateY(${-s * 1400}px) rotate(${(lado === 1 ? -4 : 4) * pe}deg) scale(${esc})`, opacity: perdedor ? 0.6 + 0.4 * s : 1, transformOrigin: "50% 0" }}>
        <div style={{ width: 360, background: CREMA, border: `8px solid ${TINTA}`, borderRadius: 34, padding: "26px 0 30px", textAlign: "center", boxShadow: `0 14px 0 ${ganador ? color : "rgba(0,0,0,.3)"}` }}>
          <div style={{ width: 92, height: 92, margin: "0 auto", borderRadius: "50%", background: color, color: "#fff", fontFamily: "Sora", fontWeight: 800, fontSize: 62, lineHeight: "92px" }}>{letra}</div>
          <div style={{ height: 150, display: "flex", alignItems: "center", justifyContent: "center" }}>{icono}</div>
          <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: 64, color: TINTA }}>{txt}</div>
        </div>
      </div>
    );
  };
  const taza = (
    <svg width="150" height="130" viewBox="0 0 150 130"><path d="M30 40 h70 v50 a25 25 0 0 1 -25 25 h-20 a25 25 0 0 1 -25 -25z" fill={MANGO} stroke={TINTA} strokeWidth="8" /><path d="M100 52 h12 a16 16 0 0 1 0 32 h-12" fill="none" stroke={TINTA} strokeWidth="8" /><path d="M50 8 q-8 12 0 22 M72 8 q-8 12 0 22" stroke={TINTA} strokeWidth="6" fill="none" strokeLinecap="round" /></svg>
  );
  const luna = (
    <svg width="150" height="130" viewBox="0 0 150 130"><path d="M95 15 a52 52 0 1 0 40 78 a42 42 0 0 1 -40 -78z" fill={AZUL_C} stroke={TINTA} strokeWidth="8" strokeLinejoin="round" /><text x="22" y="40" fontFamily="Sora" fontWeight="800" fontSize="30" fill={TINTA}>z</text><text x="40" y="22" fontFamily="Sora" fontWeight="800" fontSize="22" fill={TINTA}>z</text></svg>
  );
  return (
    <>
      {tarj(1, "A", "CAFÉ", CORAL, taza, 0)}
      {tarj(2, "B", "DORMIR", AZUL, luna, 1)}
      {cuenta !== null && cuenta > 0 && (
        <div style={{ position: "absolute", left: 400, top: 270, width: 140, height: 140, borderRadius: "50%", background: TINTA, color: MANGO, fontFamily: "Sora", fontWeight: 800, fontSize: 84, display: "flex", alignItems: "center", justifyContent: "center", border: `8px solid ${MANGO}`, transform: `scale(${1 + 0.15 * pulso(t % 1, 0, 0.3)})` }}>{cuenta}</div>
      )}
    </>
  );
}

/* inserto: la fotocopia de cerca, el título baila (doble visión) */
function Hoja({ t, t0 }) {
  const q = clamp01((t - t0) / 1.2);
  const d = 6 + 22 * q;
  const titulo = "CAPÍTULO 4";
  return (
    <AbsoluteFill style={{ background: "#2B2118" }}>
      <div style={{ position: "absolute", left: 90, top: 300, width: 900, height: 1200, background: "#FBF8F0", border: `10px solid ${TINTA}`, borderRadius: 16, transform: `rotate(${-2 + Math.sin(t * 1.3) * 1}deg) scale(${1.02 + 0.04 * q})`, boxShadow: "0 30px 0 rgba(0,0,0,.35)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 120, height: 160 }}>
          {[0, 1].map((cap) => (
            <div key={cap} style={{ position: "absolute", left: 0, right: 0, textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 112, color: TINTA, opacity: cap ? 0.38 : 0.9, transform: `translate(${cap ? d * Math.sin(t * 2.2) : 0}px, ${cap ? d * 0.4 * Math.cos(t * 1.7) : 0}px)`, filter: `blur(${q * (cap ? 5 : 2.5)}px)` }}>
              {titulo.split("").map((c, i) => <span key={i} style={{ display: "inline-block", transform: `translateY(${Math.sin(t * 6 + i * 0.9) * q * 26}px) rotate(${Math.sin(t * 5 + i) * q * 14}deg)` }}>{c === " " ? " " : c}</span>)}
            </div>
          ))}
        </div>
        {Array.from({ length: 16 }, (_, i) => (
          <div key={i} style={{ position: "absolute", left: 80, top: 360 + i * 48, width: 740 - ((i * 97) % 220), height: 18, borderRadius: 9, background: "#C9C4B8", filter: `blur(${q * 4}px)`, transform: `translateX(${Math.sin(t * 3 + i) * q * 18}px)` }} />
        ))}
      </div>
      {/* el borde de la taza en primer plano */}
      <div style={{ position: "absolute", right: -80, bottom: 300, width: 330, height: 380, background: CORAL, border: `10px solid ${TINTA}`, borderRadius: "30px 30px 90px 90px", transform: "rotate(-8deg)" }} />
      <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 220px 60px rgba(0,0,0,.55)" }} />
    </AbsoluteFill>
  );
}

const PLANOS = [
  { id: "cuarto", desde: 0, entra: "corte" },
  { id: "hoja", desde: W(4, "tercero", 0.55) - 0.2, entra: "zoom" },
  { id: "alba", desde: S(5) - 0.25, entra: "barrido" },
];

function pinta(pl, t) {
  if (pl.id === "hoja") return <Hoja t={t} t0={pl.desde} />;
  if (pl.id === "cuarto") {
    /* hojas: 8 → 47 con la frase «leerse todo esto» */
    const hojas = 20 + 27 * suave(rampa(t, S(2) + 0.1, Math.max(0.8, E(2) - S(2) + 0.5)));
    const tazas = clamp01(rampa(t, W(4, "café", 0.3), 0.3)) + clamp01(rampa(t, W(4, "café", 0.3) + 0.5, 0.3)) + clamp01(rampa(t, W(4, "tercero", 0.5) - 0.35, 0.3));
    const cafe = rampa(t, W(4, "café", 0.3), 0.4);
    const triste = t < S(3) + 0.2;
    const cam = camara(t, [
      [0, 1.5, 420, 1140], [S(1) + 1.4, 1.4, 440, 1110],
      [S(2), 1.4, 440, 1110], [S(2) + 1.0, 1.0, 540, 960],
      [S(3), 1.0, 540, 960], [S(3) + 0.7, 1.06, 540, 930],
      [S(4), 1.06, 540, 930], [S(4) + 0.6, 1.3, 640, 1080],
    ]);
    const toby = {
      cara: cafe > 0.5 ? "racha" : triste ? "triste" : "tranquila",
      orejas: triste ? 7 : cafe > 0.5 ? -4 : 2,
      ojos: cafe > 0.5 ? 1.22 : t < S(2) ? 0.88 : 1,
      cab: t > S(3) && t < S(4) ? 6 * Math.sin(Math.min(1, (t - S(3)) * 2) * Math.PI / 2) : cafe > 0.5 ? 3 * Math.sin(t * 23) : -2,
      bi: cafe > 0.5 ? -20 : 0, bd: 0,
      salto: t > S(1) + 0.05 && t < S(1) + 0.45 ? 14 * pulso(t, S(1) + 0.05, 0.4) : 0,
    };
    const hora = t < S(4) ? "2:00" : "3:47";
    const pOp = rampa(t, S(3) + 0.15, 0.55);
    const sal = suave(rampa(t, W(4, "café", 0.3) + 0.2, 0.3));
    const restante = T.TRAMOS[3].v - t;
    const cuenta = t > E(3) + 0.1 && restante > 0 ? Math.min(2, Math.ceil(restante / 0.9)) : null;
    const carteles = <Opciones t={t} p={pOp} elige={t > S(4) - 0.05 ? 1 : 0} sale={sal} cuenta={cuenta} />;
    return (
      <Camara {...cam} t={t} temblor={cafe > 0.5 ? 2.5 : 0}>
        <Cuarto t={t} hojas={hojas} tazas={tazas} hora={hora} toby={toby} carteles={carteles} />
      </Camara>
    );
  }
  /* alba: lámpara apagada, Toby dormido; amanece; despierta y pregunta; logo */
  const alba = suave(rampa(t, S(5), E(5) - S(5) + 0.8));
  const despierta = rampa(t, S(6) - 0.2, 0.4);
  const cam = camara(t, [[S(5) - 0.3, 1.2, 600, 1080], [E(5), 1.05, 560, 1000], [S(6), 1.05, 560, 1000], [T.DURACION_S - 1.8, 1.0, 540, 960]]);
  /* despierta de golpe: son las 6:58 y el parcial es a las 7 (el café no le sirvió) */
  const toby = {
    cara: despierta > 0.5 ? "triste" : "tranquila",
    ojos: despierta > 0.5 ? 1.28 : 0.08,
    cab: despierta > 0.5 ? 2 * Math.sin(t * 19) : 16, ladeo: despierta > 0.5 ? 0 : 6 * (1 - despierta),
    orejas: despierta > 0.5 ? -5 : 6, bi: despierta > 0.5 ? -35 : 0, bd: despierta > 0.5 ? -35 : 0,
    salto: 46 * pulso(t, S(6) - 0.2, 0.5),
  };
  const zz = despierta < 0.5 ? (
    <>{[0, 1, 2].map((k) => {
      const f = ((t * 0.6 + k / 3) % 1);
      return <div key={k} style={{ position: "absolute", left: 790 + f * 90, top: 940 - f * 220, fontFamily: "Sora", fontWeight: 800, fontSize: 60 + k * 14, color: CREMA, opacity: Math.sin(f * Math.PI), WebkitTextStroke: `6px ${TINTA}`, paintOrder: "stroke fill" }}>z</div>;
    })}</>
  ) : null;
  const logo = rampa(t, T.DURACION_S - 1.75, 0.45);
  const chicas = rampa(t, S(6) + 0.1, 0.35) * (1 - rampa(t, T.DURACION_S - 1.8, 0.3));
  return (
    <Camara {...cam} t={t} temblor={despierta > 0.5 && t < S(6) + 0.6 ? 6 * (1 - rampa(t, S(6), 0.6)) : 0}>
      <Cuarto t={t} alba={alba} luz={0.15 + 0.85 * rampa(t, S(6), 0.01) * 0} hojas={47} tazas={3} hora={t < S(6) - 0.2 ? "6:30" : "6:58"} toby={toby}
        nota={t < S(6) ? rampa(t, W(5, "dormir", 0.3), 0.5) : 1 - rampa(t, S(6), 0.3)} logo={logo}
        carteles={<>{zz}<Opciones t={t} p={chicas} chicas /></>} />
    </Camara>
  );
}

export function Prueba01({ sinSonido = false, zonas = false }) {
  const sfx = [];
  const fx = (t, f, vol = 0.5) => sfx.push({ t, f, vol });
  fx(0, "toc", 0.35); fx(0.6, "toc", 0.3); fx(1.2, "toc", 0.3);                  // tictac
  for (let k = 0; k < 7; k++) fx(S(2) + 0.15 + k * 0.17, "papel", 0.32);         // la montaña
  fx(S(3) + 0.15, "whoosh", 0.45); fx(S(3) + 0.35, "pop", 0.5); fx(S(3) + 0.6, "pop", 0.5);
  fx(E(3) + 0.15, "redoble", 0.35);
  fx(S(4) - 0.05, "ding", 0.5);
  fx(W(4, "café", 0.3), "sorbo", 0.55); fx(W(4, "café", 0.3) + 0.5, "pop-suave", 0.5); fx(W(4, "tercero", 0.5) - 0.35, "pop-suave", 0.5);
  fx(PLANOS[1].desde, "whoosh", 0.45);
  fx(S(5) - 0.25, "barrido", 0.4); fx(W(5, "dormir", 0.3), "pop", 0.45);
  fx(S(6) - 0.2, "campana", 0.5); fx(S(6) - 0.15, "golpe", 0.4);
  fx(T.DURACION_S - 1.75, "ding", 0.45); fx(S(6) + 0.1, "pop", 0.4);
  /* línea de invitación del cierre, en la franja de subtítulos cuando la voz ya terminó */
  const invita = (t) => {
    const p = rampa(t, E(6) + 0.25, 0.3);
    if (p <= 0) return null;
    return (
      <div style={{ position: "absolute", left: 60, width: 880, top: 1330, display: "flex", justifyContent: "center", opacity: p, transform: `scale(${0.85 + 0.15 * sale(p)})` }}>
        <div style={{ background: CREMA, border: `7px solid ${TINTA}`, borderRadius: 999, padding: "10px 40px 16px", fontFamily: "Sora", fontWeight: 800, fontSize: 70, color: TINTA, whiteSpace: "nowrap", boxShadow: "0 10px 0 rgba(0,0,0,.3)" }}>
          ¿<span style={{ color: CORAL }}>A</span> o <span style={{ color: AZUL }}>B</span>? Cuéntanos
        </div>
      </div>
    );
  };
  return <Reel T={T} planos={PLANOS} encima={invita} pinta={pinta} sfx={sfx} arte={ARTE} musica="lofi" sinSonido={sinSonido} zonas={zonas} subY={1405} />;
}
export { VOZ };
