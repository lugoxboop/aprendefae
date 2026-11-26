/*
 * repartir · «¿Todo en una noche o un poco cada día?» — Reel para USUARIOS, ~26 s. Voz: Gaby.
 * Duelo: Toby estudia cinco horas seguidas la noche antes (A); su amiga, las mismas cinco
 * horas, una por día (B). Pausa que reta. Gana B: con el mismo tiempo total, repartir el
 * repaso en varios días fija más (práctica espaciada). Fuentes en fuentes.md.
 */
import { AbsoluteFill } from "remotion";
import { Camara, camara, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { Reel } from "../../comun/Reel.jsx";
import { crearTiempo, clamp01, sale, rampa, rebote, pulso } from "../../comun/tiempo.js";
import { Logo, Invita, Opciones, CORAL, VERDE, ARTE_MARCA } from "../../comun/marca.jsx";
import { Cuarto2, Piensa, Mascota, Sombra, TOBY, AMIGA } from "../../comun/estudio.jsx";
import DATOS, { VOZ } from "./tiempos.js";

export const T = crearTiempo(DATOS, { extra: [0.0, 0.15, 0.15, 0.1, 1.2, 0.2], cola: 1.85, recorta: true, ritmo: 1.05 });
export const DURACION = T.DURACION_S;
const { S, E, W } = T;
const MESA = 1180;
const DIAS = ["L", "M", "M", "J", "V"];

/* la semana: fila A (Toby) y fila B (su amiga); los bloques son horas de estudio */
function Semana({ t, pA, pB, p0 }) {
  const X0 = 175, CW = 134, YA = 400, YB = 610, RH = 190;
  const col = (i) => X0 + i * CW;
  return (
    <div style={{ position: "absolute", left: 40, top: 270, width: 1000, height: 560, background: CREMA, border: `8px solid ${TINTA}`, borderRadius: 30, boxShadow: "0 12px 0 rgba(0,0,0,.2)", opacity: Math.min(1, p0 * 3), transform: `scale(${0.9 + 0.1 * sale(p0)})` }}>
      {/* encabezado */}
      {DIAS.map((d, i) => <div key={i} style={{ position: "absolute", left: col(i) - 40, width: 140, top: 22, textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 52, color: TINTA }}>{d}</div>)}
      <div style={{ position: "absolute", left: col(5) - 30, width: 120, top: 14, height: 520, background: CORAL, borderRadius: 18, opacity: 0.18 }} />
      <div style={{ position: "absolute", left: col(5) - 40, width: 140, top: 26, textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 30, color: CORAL, lineHeight: 1 }}>PAR-<br />CIAL</div>
      {/* filas */}
      {[["A", CORAL, YA - 270], ["B", AZUL, YB - 270]].map(([l, c, y]) => (
        <div key={l}>
          <div style={{ position: "absolute", left: 30, top: y + 40, width: 90, height: 90, borderRadius: "50%", background: c, border: `6px solid ${TINTA}`, color: "#fff", fontFamily: "Sora", fontWeight: 800, fontSize: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>{l}</div>
          <div style={{ position: "absolute", left: 140, right: 20, top: y + RH - 6, height: 4, background: "#E6DCC8" }} />
        </div>
      ))}
      {/* A: cinco horas el viernes en la noche */}
      {[0, 1, 2, 3, 4].map((k) => {
        const q = clamp01(pA * 5 - k);
        if (q <= 0) return null;
        return <div key={k} style={{ position: "absolute", left: col(4) - 30, top: YA - 270 + RH - 14 - (k + 1) * 34 - (1 - sale(q)) * 200, width: 120, height: 30, background: CORAL, border: `5px solid ${TINTA}`, borderRadius: 8, opacity: Math.min(1, q * 3) }} />;
      })}
      {pA > 0.9 && <div style={{ position: "absolute", left: col(4) - 20, top: YA - 270 - 6, fontFamily: "Sora", fontWeight: 800, fontSize: 30, color: CORAL }}>5 h</div>}
      {/* B: una hora cada día */}
      {DIAS.map((d, i) => {
        const q = clamp01(pB * 5 - i);
        if (q <= 0) return null;
        return (
          <div key={i}>
            <div style={{ position: "absolute", left: col(i) - 30, top: YB - 270 + RH - 48 - (1 - sale(q)) * 200, width: 120, height: 30, background: AZUL, border: `5px solid ${TINTA}`, borderRadius: 8, opacity: Math.min(1, q * 3) }} />
            {q > 0.9 && <div style={{ position: "absolute", left: col(i) - 20, top: YB - 270 + RH - 100, fontFamily: "Sora", fontWeight: 800, fontSize: 30, color: AZUL }}>1 h</div>}
          </div>
        );
      })}
    </div>
  );
}

function Plan({ t }) {
  const p0 = rampa(t, -0.25, 0.4);
  const pA = rampa(t, W(2, "cinco", 0.3) - 0.1, 1.1);
  const pB = rampa(t, W(3, "mismas", 0.3) - 0.1, Math.max(0.9, E(3) - W(3, "mismas", 0.3) - 0.1));
  const noche = t > S(2) - 0.1 && t < S(3) - 0.1;
  const toby = { cara: pA > 0.9 ? "triste" : "tranquila", ojos: pA > 0.9 ? 0.55 : 1, cab: pA > 0.9 ? 10 : 0, orejas: pA > 0.9 ? 7 : 0, bd: noche ? -20 + 6 * Math.sin(t * 8) : 0 };
  const amiga = { cara: pB > 0.5 ? "feliz" : "tranquila", bi: t > S(3) && t < E(3) ? -30 + 8 * Math.sin(t * 6) : 0 };
  const luzA = t < S(3) - 0.1 ? 1 : 0.55, luzB = t < S(3) - 0.1 && t > S(2) - 0.1 ? 0.45 : 1;
  return (
    <Cuarto2 t={t} luzA={luzA} luzB={luzB} letras={false}>
      <Semana t={t} pA={pA} pB={pB} p0={p0} />
      <div style={{ filter: `brightness(${0.55 + 0.45 * luzA})` }}>
        <Mascota esp={TOBY} x={270} y={MESA + 60} alto={440} t={t} semilla={1} {...toby} />
        {/* tazas de café de la trasnochada */}
        {[0, 1, 2].map((k) => {
          const q = clamp01(pA * 3 - k);
          return q > 0 && <div key={k} style={{ position: "absolute", left: 60 + k * 52, top: MESA - 70, width: 46, height: 66, background: k === 2 ? CORAL : CREMA, border: `5px solid ${TINTA}`, borderRadius: "6px 6px 16px 16px", transform: `scale(${rebote(q)})`, transformOrigin: "50% 100%" }} />;
        })}
      </div>
      <div style={{ filter: `brightness(${0.55 + 0.45 * luzB})` }}>
        <Mascota esp={AMIGA} x={810} y={MESA + 60} alto={440} t={t} semilla={2} {...amiga} />
      </div>
    </Cuarto2>
  );
}

function Examen({ t }) {
  /* el día del parcial: Toby no se acuerda; ella sí */
  const p = rampa(t, S(5) - 0.05, 0.5);
  const logo = rampa(t, T.DURACION_S - 1.8, 0.45);
  const carta = rampa(t, W(5, "días", 0.5) - 0.1, 0.4) * (1 - rampa(t, S(6) - 0.15, 0.25));
  const final = t > S(6) - 0.1;
  const toby = { cara: final ? "feliz" : "triste", ojos: final ? 1 : 0.6, cab: final ? 4 * Math.sin(t * 3) : 8 * Math.sin(t * 2), orejas: final ? 0 : 7, bd: final ? -50 + 10 * Math.sin(t * 7) : 0 };
  const amiga = { cara: final ? "feliz" : "estrellas", salto: 20 * pulso(t, S(5) + 0.4, 0.4), bi: final ? -50 + 10 * Math.sin(t * 7 + 1) : -20 };
  const hoja = (x, bien) => (
    <div style={{ position: "absolute", left: x - 140, top: MESA - 190, width: 280, height: 200, background: "#FFFFFF", border: `6px solid ${TINTA}`, borderRadius: 10, padding: "14px 18px" }}>
      <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: 28, color: TINTA }}>PARCIAL</div>
      {[0, 1, 2].map((k) => (
        <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, border: `4px solid ${TINTA}`, background: bien && clamp01(p * 3 - k) > 0.5 ? VERDE : "#fff", color: "#fff", fontSize: 20, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{bien && clamp01(p * 3 - k) > 0.5 ? "✓" : ""}</div>
          <div style={{ height: 14, width: 170 - k * 20, background: "#CFC9BD", borderRadius: 7 }} />
        </div>
      ))}
    </div>
  );
  return (
    <Cuarto2 t={t} luzA={1} luzB={1} letras={false}>
      <Mascota esp={TOBY} x={270} y={MESA + 60} alto={500} t={t} semilla={1} {...toby} />
      {hoja(270, false)}
      <Mascota esp={AMIGA} x={810} y={MESA + 60} alto={500} t={t} semilla={2} {...amiga} />
      {hoja(810, true)}
      {!final && <Piensa x={280} y={690} w={260} h={200} p={rampa(t, S(5) + 0.2, 0.4)} cola={1}><div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: 110, color: CORAL, transform: `rotate(${8 * Math.sin(t * 6)}deg)` }}>?</div></Piensa>}
      {!final && <Piensa x={800} y={690} w={260} h={200} p={rampa(t, S(5) + 0.35, 0.4)} cola={-1}><div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: 100, color: VERDE }}>✓</div></Piensa>}
      {carta > 0 && (
        <div style={{ position: "absolute", left: 540, top: 370, transform: `translateX(-50%) rotate(-3deg) scale(${rebote(carta)})`, background: CREMA, border: `7px solid ${TINTA}`, borderRadius: 24, padding: "10px 30px 14px", fontFamily: "Caveat", fontWeight: 700, fontSize: 64, color: TINTA, whiteSpace: "nowrap", boxShadow: "0 10px 0 rgba(0,0,0,.2)" }}>mismas horas, en varios días</div>
      )}
      {logo > 0 && <div style={{ position: "absolute", left: 0, right: 0, top: 250, height: 520, background: `rgba(255,246,224,${0.9 * clamp01(logo * 2)})` }} />}
      <Logo p={logo} y={330} />
      {/* el letrero del día */}
      <div style={{ position: "absolute", left: 540, top: 270, transform: `translateX(-50%) scale(${rebote(p)})`, background: CORAL, color: "#fff", border: `7px solid ${TINTA}`, borderRadius: 999, padding: "8px 36px 12px", fontFamily: "Sora", fontWeight: 800, fontSize: 48, whiteSpace: "nowrap", opacity: 1 - clamp01(logo * 3) }}>Día del parcial</div>
    </Cuarto2>
  );
}

const PLANOS = [
  { id: "plan", desde: 0, entra: "corte" },
  { id: "elige", desde: S(4) - 0.2, entra: "barrido" },
  { id: "examen", desde: S(5) - 0.1, entra: "zoom" },
];

function pinta(pl, t) {
  if (pl.id === "plan") return <Plan t={t} />;
  if (pl.id === "examen") return <Examen t={t} />;
  const p = rampa(t, S(4) - 0.1, 0.5);
  const restante = T.TRAMOS[4].v - t;
  const cuenta = t > E(4) + 0.1 && restante > 0 ? Math.min(2, Math.ceil(restante / 0.6)) : null;
  const luna = <svg width="170" height="170" viewBox="0 0 150 150"><path d="M95 15 a58 58 0 1 0 40 92 a46 46 0 0 1 -40 -92z" fill="#6F86FF" stroke={TINTA} strokeWidth="8" strokeLinejoin="round" /><rect x="20" y="20" width="40" height="40" rx="6" fill={CORAL} stroke={TINTA} strokeWidth="6" /><text x="40" y="49" textAnchor="middle" fontFamily="Sora" fontWeight="800" fontSize="24" fill="#fff">5h</text></svg>;
  const cal = <svg width="190" height="160" viewBox="0 0 190 160"><rect x="8" y="16" width="174" height="136" rx="16" fill="#fff" stroke={TINTA} strokeWidth="8" /><rect x="8" y="16" width="174" height="38" rx="14" fill={AZUL} stroke={TINTA} strokeWidth="8" />{[0, 1, 2, 3, 4].map((k) => <rect key={k} x={20 + k * 32} y="80" width="22" height="50" rx="5" fill={AZUL} />)}</svg>;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#F6E7D8, #DCE3F6)" }}>
      <Opciones t={t} p={p} y={520} elige={t > S(5) - 0.3 ? 2 : 0} cuenta={cuenta}
        a={{ txt: <>Todo en<br />una noche</>, icono: luna }} b={{ txt: <>Un poco<br />cada día</>, icono: cal }} />
    </AbsoluteFill>
  );
}

export function Repartir({ sinSonido = false, zonas = false, sinSubs = false }) {
  const sfx = [];
  const fx = (t, f, vol = 0.5) => sfx.push({ t, f, vol });
  fx(0.05, "pop-suave", 0.4);
  for (let k = 0; k < 5; k++) fx(W(2, "cinco", 0.3) - 0.1 + k * 0.22, "toc", 0.35);
  fx(W(2, "noche", 0.8), "suspiro", 0.35);
  for (let k = 0; k < 5; k++) fx(W(3, "mismas", 0.3) - 0.1 + k * Math.max(0.9, E(3) - W(3, "mismas", 0.3) - 0.1) / 5, "pop", 0.3);
  fx(PLANOS[1].desde, "barrido", 0.4); fx(S(4) + 0.1, "pop", 0.45); fx(S(4) + 0.35, "pop", 0.45); fx(E(4) + 0.1, "redoble", 0.35); fx(S(5) - 0.3, "ding", 0.5);
  fx(PLANOS[2].desde, "whoosh", 0.4); fx(S(5) + 0.4, "campana", 0.35); fx(W(5, "días", 0.5), "pop", 0.4);
  fx(T.DURACION_S - 1.8, "ding", 0.45);
  const invita = (t) => <Invita p={rampa(t, E(6) + 0.4, 0.3)} tam={60}>Coméntalo y <span style={{ color: CORAL }}>síguenos</span></Invita>;
  return <Reel T={T} planos={PLANOS} encima={invita} pinta={pinta} sfx={sfx} arte={ARTE_MARCA} musica="lofi" sinSonido={sinSonido} zonas={zonas} sinSubs={sinSubs} subY={1405} />;
}
export { VOZ };
