/*
 * subrayar · «¿Subrayar o preguntarte?» — Reel para USUARIOS (estudiantes), ~25 s. Voz: David.
 * Duelo: Toby subraya todo el cuaderno (A); su amiga cierra el cuaderno y se pregunta lo que
 * leyó (B). Pausa que reta. Gana B: recordar sin mirar fija más que releer (práctica de
 * recuperación). La trampa: subrayar da la sensación de que ya lo sabes. Fuentes en fuentes.md.
 */
import { AbsoluteFill } from "remotion";
import { Camara, camara, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { Reel } from "../../comun/Reel.jsx";
import { crearTiempo, clamp01, sale, rampa, rebote, pulso } from "../../comun/tiempo.js";
import { Logo, Invita, Opciones, Sello, CORAL, VERDE, ARTE_MARCA } from "../../comun/marca.jsx";
import { Cuarto2, Cuaderno, Resaltador, Piensa, Medidor, Mascota, Sombra, TOBY, AMIGA } from "../../comun/estudio.jsx";
import DATOS, { VOZ } from "./tiempos.js";

export const T = crearTiempo(DATOS, { extra: [0.0, 0.15, 0.1, 1.2, 0.15, 0.2], cola: 1.85, recorta: true, ritmo: 1.08 });
export const DURACION = T.DURACION_S;
const { S, E, W } = T;
const MESA = 1180;

function Duelo({ t, fase }) {
  /* fase 1: Toby subraya (B apagada); fase 2: la amiga cierra y se pregunta (A se atenúa) */
  const amarillo = rampa(t, W(1, "subraya", 0.4) - 0.1, Math.max(1, W(1, "amarillo", 0.9) - W(1, "subraya", 0.4) + 0.6));
  const luzB = fase === 1 ? 0.25 + 0.75 * rampa(t, S(2) - 0.25, 0.3) : 1;
  const luzA = t < S(2) ? 1 : 1 - 0.55 * rampa(t, S(2), 0.4);
  const cierra = rampa(t, W(2, "cierra", 0.3), 0.45);
  const piensa = rampa(t, W(2, "pregunta", 0.6) - 0.1, 0.4);
  const recuerda = rampa(t, W(2, "leer", 0.85) - 0.2, 0.8);
  const toby = { cara: "feliz", ojos: 1.05, cab: 3 * Math.sin(t * 9), bd: -25 + 10 * Math.sin(t * 9), salto: 0 };
  const amiga = { cara: piensa > 0.5 ? (recuerda > 0.8 ? "estrellas" : "tranquila") : "tranquila", cab: piensa > 0.2 ? -6 : 0, bi: piensa > 0.3 && recuerda < 0.8 ? -45 : 0, ojos: piensa > 0.3 && recuerda < 0.3 ? 0.06 : 1, salto: 20 * pulso(t, W(2, "leer", 0.85) + 0.5, 0.4) };
  const cam = camara(t, [[0, 1.45, 300, 930], [S(1) + 1.6, 1.45, 300, 930], [S(2) - 0.15, 1.0, 540, 960], [S(2) + 0.25, 1.3, 790, 900], [E(2) + 0.1, 1.3, 790, 900], [E(2) + 0.5, 1.0, 540, 960]]);
  return (
    <Camara {...cam} t={t}>
      <Cuarto2 t={t} luzA={luzA} luzB={luzB}>
        {/* Toby */}
        <Sombra x={270} y={MESA + 6} w={260} />
        <div style={{ filter: `brightness(${0.55 + 0.45 * luzA})` }}>
          <Mascota esp={TOBY} x={270} y={MESA + 60} alto={540} t={t} semilla={1} {...toby} />
          <Cuaderno x={270} y={MESA + 80} w={380} amarillo={amarillo} t={t} />
          <Resaltador x={300} y={MESA - 40} t={t} activo={t < E(1) + 0.3 ? 1 : 0} />
        </div>
        {/* la amiga */}
        <div style={{ filter: `brightness(${0.55 + 0.45 * luzB})` }}>
          <Mascota esp={AMIGA} x={810} y={MESA + 60} alto={540} t={t} semilla={2} {...amiga} />
          <Cuaderno x={810} y={MESA + 80} w={380} cierra={cierra} t={t} />
          <Piensa x={830} y={660} w={360} h={260} p={piensa} cola={-1}>
            <div style={{ width: 240 }}>
              {[0, 1, 2].map((k) => {
                const q = clamp01(recuerda * 3 - k);
                return <div key={k} style={{ display: "flex", alignItems: "center", gap: 12, margin: "12px 0", opacity: q > 0 ? 1 : 0 }}><div style={{ width: 34, height: 34, borderRadius: "50%", background: VERDE, color: "#fff", fontFamily: "Sora", fontWeight: 800, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${rebote(q)})` }}>✓</div><div style={{ height: 20, width: `${q * (150 - k * 25)}px`, background: AZUL, borderRadius: 10 }} /></div>;
              })}
              {recuerda < 0.2 && <div style={{ position: "absolute", left: 0, right: 0, top: 50, textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 120, color: TINTA }}>?</div>}
            </div>
          </Piensa>
        </div>
      </Cuarto2>
    </Camara>
  );
}

function Gana({ t }) {
  /* el dato: lo que cada una recuerda; B llena más. Sin cifras inventadas. */
  const a = 0.32 * sale(rampa(t, W(4, "Gana", 0.1) - 0.2, 0.9));
  const b = 0.82 * sale(rampa(t, W(4, "Gana", 0.1) - 0.2, 1.3));
  const carta = rampa(t, W(4, "cabeza", 0.6) - 0.1, 0.4);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#FFF1D6, #F6D9A8)" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 280, textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 64, color: TINTA }}>Lo que recuerdas</div>
      <Medidor x={300} y={1000} alto={500} llena={a} color={CORAL} letra="A" etiqueta="releer" t={t} />
      <Medidor x={780} y={1000} alto={500} llena={b} color={AZUL} letra="B" etiqueta="preguntarte" t={t} />
      {carta > 0 && (
        <div style={{ position: "absolute", left: 540, top: 1140, transform: `translateX(-50%) rotate(-3deg) scale(${rebote(carta)})`, background: CREMA, border: `7px solid ${TINTA}`, borderRadius: 24, padding: "10px 30px 14px", fontFamily: "Caveat", fontWeight: 700, fontSize: 64, color: TINTA, whiteSpace: "nowrap", boxShadow: "0 10px 0 rgba(0,0,0,.2)" }}>sacarlo de tu cabeza &gt; releer</div>
      )}
    </AbsoluteFill>
  );
}

function Trampa({ t }) {
  /* Toby mira la hoja amarilla y cree que ya se la sabe; el chulito se vuelve pregunta */
  const cree = rampa(t, W(5, "bien", 0.5) - 0.2, 0.4);
  const rompe = rampa(t, W(5, "engaña", 0.5) - 0.05, 0.4);
  const logo = rampa(t, T.DURACION_S - 1.8, 0.45);
  const final = t > S(6) - 0.1;
  const toby = { cara: final ? "feliz" : rompe > 0.5 ? "triste" : "feliz", ojos: rompe > 0.5 && !final ? 1.25 : 1, cab: final ? 5 * Math.sin(t * 3) : 0, bd: final ? -50 + 10 * Math.sin(t * 7) : 0, salto: 20 * pulso(t, W(5, "engaña", 0.5), 0.35) };
  const amiga = { cara: "feliz", bi: final ? -50 + 10 * Math.sin(t * 7 + 1) : 0 };
  const cam = camara(t, [[S(5) - 0.3, 1.3, 300, 900], [E(5) + 0.1, 1.3, 300, 900], [S(6) + 0.3, 1.0, 540, 960]]);
  return (
    <Camara {...cam} t={t}>
      <Cuarto2 t={t} luzA={1} luzB={final ? 1 : 0.5}>
        <Mascota esp={TOBY} x={270} y={MESA + 60} alto={540} t={t} semilla={1} {...toby} />
        <Cuaderno x={270} y={MESA + 80} w={380} amarillo={1} t={t} />
        <Mascota esp={AMIGA} x={810} y={MESA + 60} alto={540} t={t} semilla={2} {...amiga} />
        <Cuaderno x={810} y={MESA + 80} w={380} cierra={1} t={t} />
        {!final && (
          <Piensa x={280} y={660} w={300} h={240} p={cree} cola={1}>
            <div style={{ position: "relative", width: 140, height: 140 }}>
              <svg width="140" height="140" viewBox="0 0 140 140" style={{ position: "absolute", inset: 0, opacity: 1 - rompe }}><path d="M20 75 L55 110 L122 30" stroke={VERDE} strokeWidth="20" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <div style={{ position: "absolute", inset: 0, textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 130, lineHeight: "140px", color: CORAL, opacity: rompe, transform: `scale(${rebote(rompe)}) rotate(${8 * Math.sin(t * 8)}deg)` }}>?</div>
            </div>
          </Piensa>
        )}
        <Sello p={rampa(t, W(5, "engaña", 0.5) - 0.05, 0.45) * (1 - rampa(t, S(6) - 0.2, 0.25))} x={270} y={1080} texto="ENGAÑA" />
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
  { id: "trampa", desde: S(5) - 0.25, entra: "barrido-izq" },
];

function pinta(pl, t) {
  if (pl.id === "duelo") return <Duelo t={t} fase={t < S(2) ? 1 : 2} />;
  if (pl.id === "gana") return <Gana t={t} />;
  if (pl.id === "trampa") return <Trampa t={t} />;
  const p = rampa(t, S(3) - 0.1, 0.5);
  const restante = T.TRAMOS[3].v - t;
  const cuenta = t > E(3) + 0.1 && restante > 0 ? Math.min(2, Math.ceil(restante / 0.6)) : null;
  const res = <svg width="90" height="190" viewBox="0 0 90 190"><g transform="rotate(20 45 95)"><rect x="25" y="10" width="40" height="120" rx="10" fill={MANGO} stroke={TINTA} strokeWidth="8" /><path d="M30 128 h30 l-6 46 h-18z" fill="#FFE14D" stroke={TINTA} strokeWidth="8" strokeLinejoin="round" /></g></svg>;
  const preg = <svg width="180" height="170" viewBox="0 0 180 170"><ellipse cx="95" cy="72" rx="78" ry="62" fill="#fff" stroke={TINTA} strokeWidth="8" /><circle cx="36" cy="140" r="14" fill="#fff" stroke={TINTA} strokeWidth="7" /><text x="95" y="102" textAnchor="middle" fontFamily="Sora" fontWeight="800" fontSize="86" fill={AZUL}>?</text></svg>;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#F6E7D8, #DCE3F6)" }}>
      <Opciones t={t} p={p} y={520} elige={t > S(4) - 0.3 ? 2 : 0} cuenta={cuenta}
        a={{ txt: <>Subrayar<br />todo</>, icono: res }} b={{ txt: <>Cerrar y<br />preguntarte</>, icono: preg }} />
    </AbsoluteFill>
  );
}

export function Subrayar({ sinSonido = false, zonas = false, sinSubs = false }) {
  const sfx = [];
  const fx = (t, f, vol = 0.5) => sfx.push({ t, f, vol });
  for (let k = 0; k < 6; k++) fx(W(1, "subraya", 0.4) + k * 0.33, "desliza", 0.22);
  fx(S(2) - 0.25, "pop-suave", 0.4); fx(W(2, "cierra", 0.3) + 0.2, "golpe", 0.35); fx(W(2, "pregunta", 0.6), "pop", 0.4); fx(W(2, "leer", 0.85) + 0.5, "ding", 0.4);
  fx(PLANOS[1].desde, "barrido", 0.4); fx(S(3) + 0.1, "pop", 0.45); fx(S(3) + 0.35, "pop", 0.45); fx(E(3) + 0.1, "redoble", 0.35); fx(S(4) - 0.3, "ding", 0.5);
  fx(PLANOS[2].desde, "whoosh", 0.4); fx(W(4, "cabeza", 0.6), "pop", 0.4);
  fx(PLANOS[3].desde, "barrido", 0.4); fx(W(5, "bien", 0.5) - 0.2, "pop-suave", 0.4); fx(W(5, "engaña", 0.5), "golpe", 0.45);
  fx(T.DURACION_S - 1.8, "ding", 0.45);
  const invita = (t) => <Invita p={rampa(t, E(6) + 0.4, 0.3)} tam={60}>Coméntalo y <span style={{ color: CORAL }}>síguenos</span></Invita>;
  return <Reel T={T} planos={PLANOS} encima={invita} pinta={pinta} sfx={sfx} arte={ARTE_MARCA} musica="lofi" sinSonido={sinSonido} zonas={zonas} sinSubs={sinSubs} subY={1405} />;
}
export { VOZ };
