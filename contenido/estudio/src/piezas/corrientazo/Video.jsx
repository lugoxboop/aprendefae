/*
 * corrientazo · «¿Por qué subió el corrientazo?» — Reel para USUARIOS (estudiantes), ~25 s.
 * Voz: Juan (colombiano). Historia: a Toby le subió el almuerzo; Rufo explica en su
 * tablero que la comida subió 7,31 % en un año (lo más alto en tres años) y que la papa
 * casi duplicó su precio (+98 %). Cadena: lo que compra el restaurante → la olla → el plato.
 * Inflación en la vida real: con la misma plata, el plato trae menos.
 * Cifras verificadas (DANE, oct-2026) en fuentes.md. No se inventa ningún precio en pesos.
 */
import { AbsoluteFill } from "remotion";
import { Mascota, Sombra, Camara, camara, TINTA, CREMA, MANGO, AZUL, PIZARRA, TIZA } from "../../comun/base.jsx";
import { Reel } from "../../comun/Reel.jsx";
import { crearTiempo, clamp01, lerp, suave, sale, rampa, rebote, pulso } from "../../comun/tiempo.js";
import { Logo, Invita, Sello, FlechaSube, fuenteDato, CORAL, VERDE, ARTE_MARCA } from "../../comun/marca.jsx";
import DATOS, { VOZ } from "./tiempos.js";

export const T = crearTiempo(DATOS, { extra: [0.0, 0.15, 0.1, 0.1, 0.15, 0.2], cola: 1.85, recorta: true, ritmo: 1.0 });
export const DURACION = T.DURACION_S;
const { S, E, W } = T;
const MESA = 1180;

/* ── el plato del corrientazo: sopa, arroz, carne, papa, maduro, ensalada y jugo ──
   quita: 0 = completo; cada unidad se lleva un elemento (con la misma plata, menos). */
function Plato({ x, y, w = 560, quita = 0, t = 0 }) {
  const ve = (k) => 1 - clamp01(quita - k);            // 1 visible → 0 se fue
  const s = w / 560;
  const item = (k, estilo, hijos = null) => {
    const v = ve(k);
    if (v <= 0) return null;
    return <div style={{ position: "absolute", ...estilo, transform: `${estilo.transform || ""} scale(${0.3 + 0.7 * v})`, opacity: v }}>{hijos}</div>;
  };
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - 160 * s, width: 560, height: 260, transform: `scale(${s})`, transformOrigin: "0 0" }}>
      {/* jugo (lo primero que se va) */}
      {item(0, { left: 470, top: -70, width: 90, height: 150 }, (
        <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,.55)", border: `6px solid ${TINTA}`, borderRadius: "8px 8px 18px 18px", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "72%", background: "#F28C38" }} />
        </div>
      ))}
      {/* sopa */}
      {item(3, { left: -10, top: -30, width: 170, height: 120 }, (
        <>
          <div style={{ position: "absolute", left: 0, top: 20, width: 170, height: 100, background: CREMA, border: `6px solid ${TINTA}`, borderRadius: "10px 10px 80px 80px" }} />
          <div style={{ position: "absolute", left: 12, top: 18, width: 146, height: 30, background: "#E3B04B", border: `5px solid ${TINTA}`, borderRadius: "50%" }} />
          {[0, 1].map((j) => <div key={j} style={{ position: "absolute", left: 50 + j * 40, top: -30 - 8 * Math.sin(t * 3 + j), width: 12, height: 40, borderRadius: 8, background: "rgba(255,255,255,.6)", filter: "blur(3px)" }} />)}
        </>
      ))}
      {/* plato */}
      <div style={{ position: "absolute", left: 120, top: 70, width: 360, height: 150, background: "#FFFFFF", border: `7px solid ${TINTA}`, borderRadius: "50%", boxShadow: "0 10px 0 rgba(0,0,0,.18)" }} />
      <div style={{ position: "absolute", left: 160, top: 88, width: 280, height: 108, border: "4px solid #E6E1D6", borderRadius: "50%" }} />
      {/* arroz */}
      <div style={{ position: "absolute", left: 180, top: 70, width: 130, height: 90, background: "#FBFAF5", border: `5px solid ${TINTA}`, borderRadius: "50% 50% 45% 45%" }} />
      {/* carne */}
      {item(2, { left: 290, top: 92, width: 120, height: 62, background: "#8A4A2C", border: `5px solid ${TINTA}`, borderRadius: "40% 55% 45% 50%" })}
      {/* papa */}
      {item(1.5, { left: 215, top: 140, width: 66, height: 46, background: "#E9C46A", border: `5px solid ${TINTA}`, borderRadius: "48% 52% 44% 56%" })}
      {/* maduro */}
      {item(1, { left: 330, top: 150, width: 90, height: 34, background: "#E8A33D", border: `5px solid ${TINTA}`, borderRadius: 30, transform: "rotate(-12deg)" })}
      {/* ensalada */}
      {item(1, { left: 380, top: 82, width: 70, height: 56, background: "#6CC070", border: `5px solid ${TINTA}`, borderRadius: "50%" })}
    </div>
  );
}

/* tablero del menú en la pared, con la etiqueta del precio que cambia ($$ → $$$) */
function Menu({ t, sube = 0, op = 1 }) {
  const e = clamp01(sube);
  return (
    <div style={{ position: "absolute", left: 140, top: 300, width: 800, height: 380, opacity: op, background: PIZARRA, border: `14px solid #8A5A35`, borderRadius: 18, boxShadow: "0 14px 0 rgba(0,0,0,.25)" }}>
      <div style={{ textAlign: "center", fontFamily: "Caveat", fontWeight: 700, fontSize: 96, color: MANGO, marginTop: 10, lineHeight: 1 }}>Corrientazo</div>
      <div style={{ textAlign: "center", fontFamily: "Caveat", fontWeight: 700, fontSize: 58, color: TIZA, lineHeight: 1.15 }}>sopa · seco · jugo</div>
      {/* etiqueta de precio */}
      <div style={{ position: "absolute", left: 270, top: 230, width: 260, height: 110, background: CREMA, border: `7px solid ${TINTA}`, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 76, color: TINTA }}>$$</div>
      {e > 0 && (
        <div style={{ position: "absolute", left: 250, top: 210, width: 300, height: 150, transform: `rotate(${-6 + 4 * (1 - e)}deg) scale(${e < 0.5 ? 2 - 2 * e : 1 + 0.1 * pulso(e, 0.5, 0.5)})`, opacity: Math.min(1, e * 4), background: CORAL, border: `8px solid ${TINTA}`, borderRadius: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 0 rgba(0,0,0,.3)" }}>
          <div style={{ fontFamily: "Inter", fontWeight: 800, fontSize: 30, color: "#fff", letterSpacing: 3 }}>NUEVO PRECIO</div>
          <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: 80, lineHeight: 1, color: "#fff" }}>$$$</div>
        </div>
      )}
    </div>
  );
}

/* el restaurante: pared de baldosa, menú, ventana con calle, mesa con mantel a cuadros */
function Restaurante({ t, sube = 0, toby = {}, quita = 0, billete = 0, sello = 0, logo = 0, extra = null }) {
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#F3D9B1, #EBC48F)" }} />
      {/* baldosa baja */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 820, height: 400, backgroundImage: `linear-gradient(90deg, rgba(42,30,23,.12) 4px, transparent 4px), linear-gradient(rgba(42,30,23,.12) 4px, transparent 4px)`, backgroundSize: "90px 90px", background: "#2E8C7A", backgroundBlendMode: "normal" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 820, height: 400, backgroundImage: `linear-gradient(90deg, rgba(255,255,255,.18) 4px, transparent 4px), linear-gradient(rgba(255,255,255,.18) 4px, transparent 4px)`, backgroundSize: "90px 90px" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 808, height: 24, background: "#8A5A35" }} />
      {/* bombillos colgantes */}
      {[200, 880].map((x, k) => (
        <div key={k}>
          <div style={{ position: "absolute", left: x - 3, top: 0, width: 6, height: 220, background: TINTA }} />
          <div style={{ position: "absolute", left: x - 50, top: 210, width: 100, height: 60, background: AZUL, border: `6px solid ${TINTA}`, borderRadius: "60px 60px 10px 10px", transform: `rotate(${Math.sin(t * 1.3 + k) * 2}deg)`, transformOrigin: "50% -200px" }} />
          <div style={{ position: "absolute", left: x - 160, top: 250, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,230,150,.45), rgba(255,230,150,0))" }} />
        </div>
      ))}
      <Menu t={t} sube={sube} op={1 - clamp01(logo * 2.5)} />
      {extra}
      {/* Toby sentado detrás de la mesa */}
      <Mascota esp="perro" x={toby.x ?? 540} y={MESA + 190} alto={600} t={t} semilla={1} {...toby} />
      {/* mesa con mantel a cuadros */}
      <div style={{ position: "absolute", left: -40, right: -40, top: MESA, bottom: 0, background: "#F7F2E6" }} />
      <div style={{ position: "absolute", left: -40, right: -40, top: MESA, bottom: 0, backgroundImage: `linear-gradient(90deg, rgba(231,111,81,.55) 50%, transparent 50%), linear-gradient(rgba(231,111,81,.55) 50%, transparent 50%)`, backgroundSize: "120px 120px", opacity: 0.8 }} />
      <div style={{ position: "absolute", left: -40, right: -40, top: MESA, height: 14, background: "rgba(42,30,23,.25)" }} />
      <Plato x={540} y={MESA + 70} quita={quita} t={t} />
      {/* el billete de Toby (escena 5): el mismo de siempre */}
      {billete > 0 && (
        <div style={{ position: "absolute", left: 80, top: MESA + 40, width: 230, height: 116, background: "#9FD3A2", border: `6px solid ${TINTA}`, borderRadius: 12, transform: `rotate(${-10 + 3 * Math.sin(t * 2)}deg) scale(${rebote(clamp01(billete))})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 0 rgba(0,0,0,.2)" }}>
          <div style={{ width: 70, height: 70, borderRadius: "50%", border: `5px solid ${TINTA}`, background: "#C8E8C9", fontFamily: "Sora", fontWeight: 800, fontSize: 44, color: TINTA, display: "flex", alignItems: "center", justifyContent: "center" }}>$</div>
        </div>
      )}
      <Sello p={sello} x={540} y={560} texto="INFLACIÓN" />
      <Logo p={logo} y={300} />
    </AbsoluteFill>
  );
}

/* el tablero de Rufo: la comida subió 7,31 % en un año (DANE) */
function Tablero({ t, t0 }) {
  const n = 7.31 * sale(rampa(t, W(2, "siete", 0.4) - 0.25, 0.7));
  const marca = rampa(t, W(2, "alto", 0.7) - 0.1, 0.4);
  const flecha = rampa(t, W(2, "subió", 0.3), 0.4);
  const rufo = { cara: "tranquila", bd: -38 + 6 * Math.sin(t * 3), bi: 0, cab: 3 * Math.sin(t * 1.5) };
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#DCE6F2, #C3D2E6)" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1180, bottom: 0, background: "#B88A5C" }} />
      {/* pizarra */}
      <div style={{ position: "absolute", left: 60, top: 290, width: 960, height: 760, background: PIZARRA, border: `16px solid #8A5A35`, borderRadius: 18, boxShadow: "0 16px 0 rgba(0,0,0,.25)" }}>
        <div style={{ position: "absolute", left: 50, top: 30, fontFamily: "Caveat", fontWeight: 700, fontSize: 76, color: TIZA }}>La comida, en un año:</div>
        <div style={{ position: "absolute", left: 40, top: 140, fontFamily: "Sora", fontWeight: 800, fontSize: 250, color: MANGO, letterSpacing: -6, lineHeight: 1 }}>
          +{n.toFixed(1).replace(".", ",")}<span style={{ fontSize: 150 }}>%</span>
        </div>
        <FlechaSube x={830} y={420} p={flecha} alto={240} />
        {marca > 0 && (
          <div style={{ position: "absolute", left: 60, top: 470, transform: `scale(${rebote(marca)})`, transformOrigin: "0 50%" }}>
            <div style={{ fontFamily: "Caveat", fontWeight: 700, fontSize: 88, color: TIZA, lineHeight: 1 }}>¡lo más alto en 3 años!</div>
            <svg width="640" height="40" viewBox="0 0 640 40" style={{ display: "block" }}><path d={`M6 26 Q 160 ${6} 320 22 T 634 18`} stroke={CORAL} strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray="700" strokeDashoffset={700 * (1 - clamp01(marca * 1.5))} /></svg>
          </div>
        )}
      </div>
      <Sombra x={830} y={1360} w={320} />
      <Mascota esp="perro-corbatin" x={830} y={1360} alto={420} t={t} semilla={3} {...rufo} />
      {fuenteDato("Fuente: DANE, octubre de 2026", rampa(t, t0 + 0.4, 0.4), 330, 1110)}
    </AbsoluteFill>
  );
}

/* la papa casi duplica: una papa sobre la balanza que se infla */
function Papa({ t, t0 }) {
  const g = sale(rampa(t, W(3, "duplicó", 0.4) - 0.1, 0.7));
  const esc = 1 + 0.98 * g;
  const etiqueta = rampa(t, W(3, "duplicó", 0.4) + 0.35, 0.35);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #FFE6A8, #F2B950)" }}>
      {/* rayos */}
      {Array.from({ length: 12 }, (_, k) => (
        <div key={k} style={{ position: "absolute", left: 540, top: 760, width: 1400, height: 120, marginLeft: -700, marginTop: -60, background: "rgba(255,255,255,.18)", clipPath: "polygon(50% 50%, 100% 0, 100% 100%)", transform: `rotate(${k * 30 + t * 8}deg)` }} />
      ))}
      {/* balanza */}
      <div style={{ position: "absolute", left: 290, top: 1010, width: 500, height: 40, background: "#B9C3CF", border: `7px solid ${TINTA}`, borderRadius: 20 }} />
      <div style={{ position: "absolute", left: 470, top: 1045, width: 140, height: 120, background: "#8A96A6", border: `7px solid ${TINTA}`, borderRadius: "10px 10px 24px 24px" }} />
      <div style={{ position: "absolute", left: 360, top: 1160, width: 360, height: 60, background: "#6B7686", border: `7px solid ${TINTA}`, borderRadius: 16 }} />
      {/* la papa */}
      <svg width="420" height="320" viewBox="0 0 420 320" style={{ position: "absolute", left: 540 - 210, top: 1010 - 300, transformOrigin: "50% 95%", transform: `scale(${esc * (1 + 0.03 * Math.sin(t * 9) * g)})`, overflow: "visible" }}>
        <path d="M40 180 C20 90 120 30 220 40 C330 50 410 110 390 190 C372 262 300 300 200 296 C100 292 56 250 40 180 Z" fill="#D9A95B" stroke={TINTA} strokeWidth="9" />
        {[[120, 130], [250, 110], [300, 210], [170, 230], [210, 170]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="8" fill="#A9783A" />)}
        <circle cx="160" cy="160" r={14} fill={TINTA} /><circle cx="270" cy="160" r={14} fill={TINTA} />
        <path d={g > 0.4 ? "M185 215 Q215 190 245 215" : "M185 205 Q215 230 245 205"} stroke={TINTA} strokeWidth="9" fill="none" strokeLinecap="round" />
      </svg>
      {/* etiqueta */}
      {etiqueta > 0 && (
        <div style={{ position: "absolute", left: 540, top: 330, transform: `translateX(-50%) rotate(-4deg) scale(${rebote(etiqueta)})`, background: CREMA, border: `8px solid ${TINTA}`, borderRadius: 26, padding: "10px 40px 18px", textAlign: "center", boxShadow: "0 12px 0 rgba(0,0,0,.25)" }}>
          <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: 120, color: CORAL, lineHeight: 1 }}>+98 %</div>
          <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 40, color: TINTA }}>la papa, en un año</div>
        </div>
      )}
      {fuenteDato("Fuente: DANE, octubre de 2026", rampa(t, t0 + 0.4, 0.4), 540, 1260)}
    </AbsoluteFill>
  );
}

/* la cadena: lo que compra el restaurante → la olla → el plato, y cada uno sube */
function Cadena({ t }) {
  const p1 = rampa(t, W(4, "restaurante", 0.2), 0.35);
  const p2 = rampa(t, W(4, "compra", 0.45), 0.35);
  const p3 = rampa(t, W(4, "plato", 0.7), 0.35);
  const s3 = rampa(t, W(4, "sube", 0.9, 1) - 0.05, 0.35);
  const caja = (x, y, p, titulo, dibujo, sube) => (
    <div style={{ position: "absolute", left: x, top: y, width: 500, transform: `translate(-50%, 0) scale(${rebote(p)})`, opacity: Math.min(1, p * 3) }}>
      <div style={{ height: 270, background: CREMA, border: `8px solid ${TINTA}`, borderRadius: 34, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 0 rgba(0,0,0,.22)" }}>{dibujo}</div>
      <div style={{ textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 60, color: TINTA, marginTop: 10 }}>{titulo}</div>
      <FlechaSube x={470} y={90} p={sube} alto={170} />
    </div>
  );
  const bolsa = (
    <svg width="280" height="256" viewBox="0 0 230 210"><circle cx="70" cy="70" r="34" fill="#D9A95B" stroke={TINTA} strokeWidth="7" /><circle cx="150" cy="58" r="30" fill="#E63946" stroke={TINTA} strokeWidth="7" /><rect x="100" y="40" width="40" height="60" rx="10" fill="#F1EEE3" stroke={TINTA} strokeWidth="7" /><path d="M20 90 H210 L190 200 H40 Z" fill="#E9C46A" stroke={TINTA} strokeWidth="8" strokeLinejoin="round" /><text x="115" y="165" textAnchor="middle" fontFamily="Sora" fontWeight="800" fontSize="40" fill={TINTA}>papa</text></svg>
  );
  const olla = (
    <svg width="290" height="242" viewBox="0 0 240 200"><rect x="30" y="70" width="180" height="110" rx="20" fill="#9AA5B4" stroke={TINTA} strokeWidth="8" /><rect x="20" y="56" width="200" height="26" rx="10" fill="#7C8796" stroke={TINTA} strokeWidth="8" /><path d="M10 100 H30 M210 100 H230" stroke={TINTA} strokeWidth="10" strokeLinecap="round" />{[0, 1, 2].map((j) => <path key={j} d={`M${80 + j * 40} ${44 - 6 * Math.sin(t * 3 + j)} q-10 -16 0 -30`} stroke="#fff" strokeWidth="8" fill="none" strokeLinecap="round" opacity=".8" />)}</svg>
  );
  const plato = (
    <div style={{ position: "relative", width: 460, height: 280 }}><Plato x={230} y={190} w={430} t={t} /></div>
  );
  const flecha = (x, y, p, giro) => p > 0 && (
    <svg width="200" height="160" viewBox="0 0 200 160" style={{ position: "absolute", left: x, top: y, opacity: Math.min(1, p * 3), transform: `scaleX(${giro})`, overflow: "visible" }}>
      <path d="M20 10 Q 150 20 160 120" stroke={TINTA} strokeWidth="12" fill="none" strokeLinecap="round" strokeDasharray="240" strokeDashoffset={240 * (1 - sale(p))} />
      {p > 0.6 && <path d="M130 105 L160 145 L185 100" stroke={TINTA} strokeWidth="12" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#FFF1D6, #F6D9A8)" }}>
      {caja(290, 250, p1, "lo que compra", bolsa, p1 > 0 ? rampa(t, W(4, "sube", 0.4) - 0.05, 0.3) : 0)}
      {flecha(560, 380, p2, 1)}
      {caja(790, 600, p2, "la olla", olla, rampa(t, W(4, "compra", 0.45) + 0.25, 0.3))}
      {flecha(330, 730, p3, -1)}
      {caja(290, 950, p3, "el plato", plato, s3)}
    </AbsoluteFill>
  );
}

const PLANOS = [
  { id: "resto", desde: 0, entra: "corte" },
  { id: "tablero", desde: S(2) - 0.25, entra: "barrido" },
  { id: "papa", desde: S(3) - 0.2, entra: "zoom" },
  { id: "cadena", desde: S(4) - 0.2, entra: "barrido" },
  { id: "resto2", desde: S(5) - 0.25, entra: "barrido-izq" },
];

function pinta(pl, t) {
  if (pl.id === "tablero") return <Tablero t={t} t0={pl.desde} />;
  if (pl.id === "papa") return <Papa t={t} t0={pl.desde} />;
  if (pl.id === "cadena") return <Cadena t={t} />;
  if (pl.id === "resto") {
    const golpe = W(1, "subió", 0.35);
    const sube = rampa(t, golpe - 0.05, 0.4);
    const shock = t > golpe + 0.1;
    const toby = {
      cara: shock ? "triste" : "feliz",
      ojos: shock ? 1.3 : 1, orejas: shock ? -6 : 2,
      cab: shock ? (t < W(1, "avisó", 0.9) ? 4 * Math.sin(t * 14) * (1 - rampa(t, golpe + 0.1, 0.6)) : -8) : 3 * Math.sin(t * 4),
      salto: 30 * pulso(t, golpe + 0.05, 0.4), bi: shock ? -30 : 0, bd: shock ? -30 : 0,
    };
    const cam = camara(t, [[0, 1.25, 540, 1150], [golpe - 0.1, 1.25, 540, 1150], [golpe + 0.2, 1.0, 540, 960], [S(2), 1.05, 540, 940]]);
    return (
      <Camara {...cam} t={t} temblor={shock && t < golpe + 0.5 ? 7 * (1 - rampa(t, golpe, 0.5)) : 0}>
        <Restaurante t={t} sube={sube} toby={toby} />
      </Camara>
    );
  }
  /* escena 5 y 6: el mismo billete, el plato trae menos; luego la pregunta y el logo */
  const quita = lerp(0, 1, rampa(t, W(5, "misma", 0.5), 0.35)) + rampa(t, W(5, "alcanza", 0.7), 0.35) + rampa(t, W(5, "menos", 0.9), 0.35);
  const triste = t > W(5, "alcanza", 0.7) && t < S(6);
  const logo = rampa(t, T.DURACION_S - 1.8, 0.45);
  const toby = {
    cara: t > S(6) ? "feliz" : triste ? "triste" : "tranquila",
    ojos: triste ? 0.9 : 1.05, orejas: triste ? 7 : 0,
    cab: t > S(6) ? 6 * Math.sin(Math.min(1, (t - S(6)) * 2) * Math.PI / 2) : triste ? 8 : 0,
    bi: t > S(6) && t < E(6) ? -40 + 8 * Math.sin(t * 6) : 0,
  };
  const cam = camara(t, [[S(5) - 0.3, 1.0, 540, 960], [W(5, "plata", 0.5), 1.0, 540, 960], [W(5, "plata", 0.5) + 0.6, 1.2, 480, 1180], [S(6), 1.2, 480, 1180], [S(6) + 0.6, 1.0, 540, 960]]);
  return (
    <Camara {...cam} t={t}>
      <Restaurante t={t} sube={1} toby={toby} quita={quita}
        billete={rampa(t, W(5, "misma", 0.5) - 0.3, 0.35)} sello={rampa(t, W(5, "inflación", 0.3) - 0.05, 0.45) * (1 - rampa(t, S(6) - 0.1, 0.25))} logo={logo} />
    </Camara>
  );
}

export function Corrientazo({ sinSonido = false, zonas = false, sinSubs = false }) {
  const sfx = [];
  const fx = (t, f, vol = 0.5) => sfx.push({ t, f, vol });
  fx(0.05, "pop-suave", 0.4);
  fx(W(1, "subió", 0.35) - 0.05, "golpe", 0.55); fx(W(1, "subió", 0.35), "campana", 0.35);
  fx(PLANOS[1].desde, "barrido", 0.4); fx(W(2, "siete", 0.4) - 0.2, "redoble", 0.3); fx(W(2, "alto", 0.7), "pop", 0.45);
  fx(PLANOS[2].desde, "whoosh", 0.45); fx(W(3, "duplicó", 0.4), "desliza", 0.45); fx(W(3, "duplicó", 0.4) + 0.35, "ding", 0.45);
  fx(PLANOS[3].desde, "barrido", 0.4); fx(W(4, "restaurante", 0.2), "pop", 0.4); fx(W(4, "compra", 0.45), "pop", 0.4); fx(W(4, "plato", 0.7), "pop", 0.4);
  fx(PLANOS[4].desde, "barrido", 0.4); fx(W(5, "inflación", 0.3), "golpe", 0.45);
  fx(W(5, "alcanza", 0.7), "pop-suave", 0.4); fx(W(5, "menos", 0.9), "pop-suave", 0.4); fx(W(5, "menos", 0.9) + 0.3, "suspiro", 0.4);
  fx(T.DURACION_S - 1.8, "ding", 0.45);
  const invita = (t) => (
    <Invita p={rampa(t, E(6) + 0.5, 0.3)} tam={60}>¿Cuánto pagas <span style={{ color: CORAL }}>tú</span>? Cuéntanos</Invita>
  );
  return <Reel T={T} planos={PLANOS} encima={invita} pinta={pinta} sfx={sfx} arte={ARTE_MARCA} musica="lofi" sinSonido={sinSonido} zonas={zonas} sinSubs={sinSubs} subY={1405} />;
}
export { VOZ };
