/*
 * musica · «¿Música con letra o sin letra para estudiar?» — Reel para USUARIOS, ~26 s. Voz: Isabel.
 * Duelo: Toby lee cantando su playlist (A); su amiga lee en silencio o con música sin letra (B).
 * Pausa que reta. Gana B: la letra compite con las palabras que lees (Perham y Currie, 2014).
 * Cierre: Toby se quita los audífonos y lee tranquilo. Fuentes en fuentes.md.
 */
import { AbsoluteFill } from "remotion";
import { Camara, camara, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { Reel } from "../../comun/Reel.jsx";
import { crearTiempo, clamp01, sale, rampa, rebote, pulso } from "../../comun/tiempo.js";
import { Logo, Invita, Opciones, CORAL, VERDE, ARTE_MARCA } from "../../comun/marca.jsx";
import { Cuarto2, Cuaderno, Piensa, Medidor, Mascota, Sombra, TOBY, AMIGA } from "../../comun/estudio.jsx";
import DATOS, { VOZ } from "./tiempos.js";

export const T = crearTiempo(DATOS, { extra: [0.0, 0.15, 0.1, 1.2, 0.15, 0.2], cola: 1.85, recorta: true, ritmo: 1.05 });
export const DURACION = T.DURACION_S;
const { S, E, W } = T;
const MESA = 1180;

/* audífonos dibujados sobre la cabeza de Toby */
function Audifonos({ x, y, p = 1, t }) {
  if (p <= 0) return null;
  return (
    <svg width="360" height="260" viewBox="0 0 360 260" style={{ position: "absolute", left: x - 180, top: y, opacity: clamp01(p * 2), transform: `translateY(${(1 - sale(p)) * -160}px) rotate(${2 * Math.sin(t * 9)}deg)`, overflow: "visible" }}>
      <path d="M40 170 Q40 20 180 20 Q320 20 320 170" fill="none" stroke={TINTA} strokeWidth="26" strokeLinecap="round" />
      <path d="M40 170 Q40 20 180 20 Q320 20 320 170" fill="none" stroke={CORAL} strokeWidth="14" strokeLinecap="round" />
      <rect x="6" y="140" width="64" height="100" rx="26" fill={CORAL} stroke={TINTA} strokeWidth="9" />
      <rect x="290" y="140" width="64" height="100" rx="26" fill={CORAL} stroke={TINTA} strokeWidth="9" />
    </svg>
  );
}

/* notas que salen: con letra (palabras) o sin letra (solo notas) */
function Notas({ x, y, t, letra, n = 5, op = 1 }) {
  const PAL = ["♪ baby", "oh oh", "♫ yeah", "la la", "♪ amor"];
  return (
    <>{Array.from({ length: n }, (_, k) => {
      const f = (t * 0.45 + k / n) % 1;
      const dx = (k % 2 ? 1 : -1) * (40 + f * 150);
      return (
        <div key={k} style={{ position: "absolute", left: x + dx - 60, top: y - f * 420, width: 120, textAlign: "center", opacity: op * Math.sin(f * Math.PI), transform: `rotate(${(k % 2 ? 8 : -8) + 10 * Math.sin(t * 3 + k)}deg) scale(${0.8 + 0.4 * f})`, fontFamily: "Sora", fontWeight: 800, fontSize: letra ? 54 : 70, color: letra ? "#C2452A" : AZUL, WebkitTextStroke: `5px ${CREMA}`, paintOrder: "stroke fill", whiteSpace: "nowrap" }}>
          {letra ? PAL[k % PAL.length] : k % 2 ? "♫" : "♪"}
        </div>
      );
    })}</>
  );
}

function Duelo({ t }) {
  const luzB = t < S(2) - 0.25 ? 0.3 : 1;
  const luzA = t < S(2) ? 1 : 0.5;
  const canta = t < S(2) + 0.2;
  const toby = { cara: "canta", ojos: 1, cab: 8 * Math.sin(t * 6.3), bd: -40 + 20 * Math.sin(t * 6.3), bi: -20 + 20 * Math.sin(t * 6.3 + 1), salto: 10 * Math.abs(Math.sin(t * 6.3)) };
  const amiga = { cara: "tranquila", cab: 2 * Math.sin(t * 1.2), ojos: 0.95 };
  const cam = camara(t, [[0, 1.4, 290, 920], [S(1) + 1.8, 1.4, 290, 920], [S(2) - 0.15, 1.0, 540, 960], [S(2) + 0.25, 1.3, 790, 920], [E(2) + 0.1, 1.3, 790, 920], [E(2) + 0.5, 1.0, 540, 960]]);
  return (
    <Camara {...cam} t={t}>
      <Cuarto2 t={t} luzA={luzA} luzB={luzB}>
        <div style={{ filter: `brightness(${0.55 + 0.45 * luzA})` }}>
          <Mascota esp={TOBY} x={270} y={MESA + 60} alto={540} t={t} semilla={1} {...toby} />
          <Audifonos x={270 + 3 * Math.sin(t * 6.3)} y={MESA - 470 - 10 * Math.abs(Math.sin(t * 6.3))} t={t} p={rampa(t, -0.3, 0.4)} />
          <Cuaderno x={270} y={MESA + 80} w={380} t={t} />
          {canta && <Notas x={270} y={760} t={t} letra n={5} />}
        </div>
        <div style={{ filter: `brightness(${0.55 + 0.45 * luzB})` }}>
          <Mascota esp={AMIGA} x={810} y={MESA + 60} alto={540} t={t} semilla={2} {...amiga} />
          <Cuaderno x={810} y={MESA + 80} w={380} t={t} />
          {t > S(2) && <Notas x={810} y={760} t={t} letra={false} n={3} op={0.8 * rampa(t, W(2, "música", 0.6) - 0.2, 0.4)} />}
        </div>
      </Cuarto2>
    </Camara>
  );
}

function Gana({ t }) {
  const t0 = W(4, "Gana", 0.1) - 0.2;
  const a = 0.35 * sale(rampa(t, t0, 0.9)), b = 0.85 * sale(rampa(t, t0, 1.3));
  /* palabras de la canción que chocan con las del libro */
  const choque = rampa(t, W(4, "compiten", 0.5) - 0.1, 0.4);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#FFF1D6, #F6D9A8)" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 290, textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 64, color: TINTA }}>Lo que entiendes</div>
      <Medidor x={300} y={1000} alto={500} llena={a} color={CORAL} letra="A" etiqueta="con letra" t={t} />
      <Medidor x={780} y={1000} alto={500} llena={b} color={AZUL} letra="B" etiqueta="sin letra" t={t} />
      {choque > 0 && (
        <div style={{ position: "absolute", left: 540, top: 1130, transform: `translateX(-50%) scale(${rebote(choque)})`, display: "flex", alignItems: "center", gap: 18, whiteSpace: "nowrap" }}>
          <div style={{ background: CORAL, color: "#fff", border: `6px solid ${TINTA}`, borderRadius: 18, padding: "8px 22px 12px", fontFamily: "Sora", fontWeight: 800, fontSize: 58, transform: `translateX(${10 * Math.sin(t * 18)}px)` }}>♪ letra</div>
          <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: 70, color: TINTA }}>vs</div>
          <div style={{ background: CREMA, color: TINTA, border: `6px solid ${TINTA}`, borderRadius: 18, padding: "8px 22px 12px", fontFamily: "Sora", fontWeight: 800, fontSize: 58, transform: `translateX(${-10 * Math.sin(t * 18)}px)` }}>lo que lees</div>
        </div>
      )}
    </AbsoluteFill>
  );
}

function Calma({ t }) {
  /* Toby se quita los audífonos; la música queda sin letra y lee tranquilo */
  const quita = rampa(t, W(5, "letra", 0.4) - 0.1, 0.5);
  const lee = rampa(t, W(5, "pelear", 0.6) - 0.2, 0.5);
  const logo = rampa(t, T.DURACION_S - 1.8, 0.45);
  const final = t > S(6) - 0.1;
  const toby = { cara: final ? "feliz" : lee > 0.5 ? "estrellas" : "tranquila", cab: final ? 4 * Math.sin(t * 3) : 0, bd: final ? -50 + 10 * Math.sin(t * 7) : 0 };
  const amiga = { cara: "feliz", bi: final ? -50 + 10 * Math.sin(t * 7 + 1) : 0 };
  const cam = camara(t, [[S(5) - 0.3, 1.3, 290, 920], [E(5) + 0.1, 1.3, 290, 920], [S(6) + 0.3, 1.0, 540, 960]]);
  return (
    <Camara {...cam} t={t}>
      <Cuarto2 t={t} luzA={1} luzB={final ? 1 : 0.5}>
        <Mascota esp={TOBY} x={270} y={MESA + 60} alto={540} t={t} semilla={1} {...toby} />
        <Audifonos x={270 - 260 * sale(quita)} y={MESA - 480 + 380 * sale(quita)} t={0} p={1} />
        <Cuaderno x={270} y={MESA + 80} w={380} t={t} />
        <Notas x={270} y={760} t={t} letra n={4} op={1 - quita} />
        <Notas x={270} y={760} t={t} letra={false} n={3} op={0.8 * quita} />
        {!final && (
          <Piensa x={290} y={640} w={300} h={220} p={lee} cola={1}>
            <div>{[0, 1, 2].map((k) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 12, margin: "10px 0" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: VERDE, color: "#fff", fontFamily: "Sora", fontWeight: 800, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${rebote(clamp01(lee * 3 - k))})` }}>✓</div>
                <div style={{ height: 18, width: 130 - k * 20, background: AZUL, borderRadius: 9 }} />
              </div>
            ))}</div>
          </Piensa>
        )}
        <Mascota esp={AMIGA} x={810} y={MESA + 60} alto={540} t={t} semilla={2} {...amiga} />
        <Cuaderno x={810} y={MESA + 80} w={380} t={t} />
        {logo > 0 && <div style={{ position: "absolute", left: 0, right: 0, top: 250, height: 520, background: `rgba(255,246,224,${0.9 * clamp01(logo * 2)})` }} />}
        <Logo p={logo} y={330} />
      </Cuarto2>
    </Camara>
  );
}

const PLANOS = [
  { id: "duelo", desde: 0, entra: "corte" },
  { id: "elige", desde: S(3) - 0.2, entra: "barrido" },
  { id: "gana", desde: S(4) - 0.1, entra: "zoom" },
  { id: "calma", desde: S(5) - 0.25, entra: "barrido-izq" },
];

function pinta(pl, t) {
  if (pl.id === "duelo") return <Duelo t={t} />;
  if (pl.id === "gana") return <Gana t={t} />;
  if (pl.id === "calma") return <Calma t={t} />;
  const p = rampa(t, S(3) - 0.1, 0.5);
  const restante = T.TRAMOS[3].v - t;
  const cuenta = t > E(3) + 0.1 && restante > 0 ? Math.min(2, Math.ceil(restante / 0.6)) : null;
  const mic = <svg width="170" height="170" viewBox="0 0 170 170"><path d="M30 120 Q30 30 85 30 Q140 30 140 120" fill="none" stroke={TINTA} strokeWidth="14" /><rect x="14" y="100" width="40" height="60" rx="16" fill={CORAL} stroke={TINTA} strokeWidth="7" /><rect x="116" y="100" width="40" height="60" rx="16" fill={CORAL} stroke={TINTA} strokeWidth="7" /><text x="85" y="95" textAnchor="middle" fontFamily="Sora" fontWeight="800" fontSize="30" fill={CORAL}>la la</text></svg>;
  const silencio = <svg width="170" height="170" viewBox="0 0 170 170"><text x="60" y="110" textAnchor="middle" fontFamily="Sora" fontWeight="800" fontSize="90" fill={AZUL}>♪</text><text x="120" y="140" textAnchor="middle" fontFamily="Sora" fontWeight="800" fontSize="60" fill={AZUL}>♫</text></svg>;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#F6E7D8, #DCE3F6)" }}>
      <Opciones t={t} p={p} y={520} elige={t > S(4) - 0.3 ? 2 : 0} cuenta={cuenta}
        a={{ txt: <>Música<br />con letra</>, icono: mic }} b={{ txt: <>Silencio o<br />sin letra</>, icono: silencio }} />
    </AbsoluteFill>
  );
}

export function Musica({ sinSonido = false, zonas = false, sinSubs = false }) {
  const sfx = [];
  const fx = (t, f, vol = 0.5) => sfx.push({ t, f, vol });
  fx(0.02, "pop", 0.4);
  fx(S(2) - 0.25, "pop-suave", 0.4); fx(W(2, "silencio", 0.4), "suspiro", 0.3);
  fx(PLANOS[1].desde, "barrido", 0.4); fx(S(3) + 0.1, "pop", 0.45); fx(S(3) + 0.35, "pop", 0.45); fx(E(3) + 0.1, "redoble", 0.35); fx(S(4) - 0.3, "ding", 0.5);
  fx(PLANOS[2].desde, "whoosh", 0.4); fx(W(4, "compiten", 0.5) - 0.1, "golpe", 0.4);
  fx(PLANOS[3].desde, "barrido", 0.4); fx(W(5, "letra", 0.4), "desliza", 0.4); fx(W(5, "pelear", 0.6), "ding", 0.4);
  fx(T.DURACION_S - 1.8, "ding", 0.45);
  const invita = (t) => <Invita p={rampa(t, E(6) + 0.4, 0.3)} tam={60}>Coméntalo y <span style={{ color: CORAL }}>síguenos</span></Invita>;
  /* la música de fondo baja más en esta pieza: compite con la voz, como en el dato */
  return <Reel T={T} planos={PLANOS} encima={invita} pinta={pinta} sfx={sfx} arte={ARTE_MARCA} musica="lofi" musicaBase={0.45} sinSonido={sinSonido} zonas={zonas} sinSubs={sinSubs} subY={1405} />;
}
export { VOZ };
