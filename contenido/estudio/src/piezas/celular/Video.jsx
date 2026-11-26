/*
 * celular · «¿Celular al lado o en otro cuarto?» — Reel para USUARIOS, ~26 s. Voz: Brian.
 * Duelo: Toby estudia con el celular boca arriba y cada notificación le gira la cabeza (A);
 * su amiga lo deja en otro cuarto, en silencio (B). Pausa que reta. Gana B: una notificación
 * saca la atención de la tarea aunque no se abra (Stothart et al., 2015). Cierre: Toby guarda
 * el celular en el cajón y se queda en la página. Fuentes en fuentes.md.
 */
import { AbsoluteFill } from "remotion";
import { Camara, camara, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { Reel } from "../../comun/Reel.jsx";
import { crearTiempo, clamp01, sale, rampa, rebote, pulso } from "../../comun/tiempo.js";
import { Logo, Invita, Opciones, CORAL, VERDE, ARTE_MARCA } from "../../comun/marca.jsx";
import { Cuarto2, Cuaderno, Piensa, Medidor, Mascota, TOBY, AMIGA } from "../../comun/estudio.jsx";
import DATOS, { VOZ } from "./tiempos.js";

export const T = crearTiempo(DATOS, { extra: [0.0, 0.15, 0.1, 1.2, 0.15, 0.2], cola: 1.85, recorta: true, ritmo: 1.05 });
export const DURACION = T.DURACION_S;
const { S, E, W } = T;
const MESA = 1180;
const PINGS = [0.5, 1.5, 2.3, 3.0];   // segundos de las notificaciones en la escena 1

/* celular boca arriba; se enciende con cada notificación */
function Cel({ x, y, luz = 0, n = 0, escala = 1, giro = 0 }) {
  return (
    <div style={{ position: "absolute", left: x - 60 * escala, top: y - 110 * escala, width: 120 * escala, height: 200 * escala, transform: `rotate(${giro}deg)` }}>
      <div style={{ position: "absolute", inset: 0, background: TINTA, borderRadius: 24 * escala }} />
      <div style={{ position: "absolute", left: 10 * escala, top: 14 * escala, right: 10 * escala, bottom: 14 * escala, borderRadius: 14 * escala, background: luz > 0 ? `rgba(255,255,255,${0.25 + 0.75 * luz})` : "#2E3446", boxShadow: luz > 0 ? `0 0 ${60 * luz}px ${20 * luz}px rgba(255,240,180,${0.6 * luz})` : "none" }}>
        {luz > 0.2 && [0, 1].map((k) => <div key={k} style={{ margin: `${10 * escala}px ${8 * escala}px`, height: 22 * escala, borderRadius: 6 * escala, background: [CORAL, AZUL][k], opacity: luz }} />)}
      </div>
      {n > 0 && <div style={{ position: "absolute", right: -18 * escala, top: -18 * escala, width: 48 * escala, height: 48 * escala, borderRadius: "50%", background: "#E63946", border: `${5 * escala}px solid ${TINTA}`, color: "#fff", fontFamily: "Sora", fontWeight: 800, fontSize: 26 * escala, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</div>}
    </div>
  );
}

/* burbuja de notificación que salta del celular */
function Ping({ x, y, p, txt }) {
  if (p <= 0 || p >= 1) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y - 120 * sale(p), transform: `translateX(-50%) scale(${rebote(clamp01(p * 3))})`, opacity: 1 - clamp01((p - 0.7) / 0.3), background: "#FFFFFF", border: `6px solid ${TINTA}`, borderRadius: 22, padding: "8px 20px 12px", fontFamily: "Inter", fontWeight: 800, fontSize: 38, color: TINTA, whiteSpace: "nowrap", boxShadow: "0 8px 0 rgba(0,0,0,.2)" }}>{txt}</div>
  );
}
const TEXTOS = ["Nuevo mensaje", "Te etiquetaron", "3 me gusta", "¿Vamos hoy?"];

function Duelo({ t }) {
  const luzB = t < S(2) - 0.25 ? 0.3 : 1;
  const luzA = t < S(2) ? 1 : 0.5;
  let luz = 0, n = 0, mira = 0;
  PINGS.forEach((p, k) => { const tp = S(1) + p; if (t > tp) n = k + 1; luz = Math.max(luz, pulso(t, tp, 0.9)); mira = Math.max(mira, pulso(t, tp + 0.05, 0.8)); });
  const toby = { cara: mira > 0.3 ? "racha" : "tranquila", cab: -14 * mira, ojos: 1 + 0.25 * mira, salto: 10 * mira };
  /* la amiga cierra la puerta del cuarto donde quedó el celular */
  const puerta = rampa(t, W(2, "cuarto", 0.5) - 0.1, 0.5);
  const amiga = { cara: puerta > 0.8 ? "feliz" : "tranquila", bd: t > S(2) && t < W(2, "cuarto", 0.5) + 0.3 ? -40 : 0 };
  const cam = camara(t, [[0, 1.35, 290, 940], [S(1) + 3.2, 1.35, 290, 940], [S(2) - 0.15, 1.0, 540, 960], [S(2) + 0.25, 1.3, 790, 920], [E(2) + 0.1, 1.3, 790, 920], [E(2) + 0.5, 1.0, 540, 960]]);
  return (
    <Camara {...cam} t={t} temblor={luz > 0.6 ? 2 : 0}>
      <Cuarto2 t={t} luzA={luzA} luzB={luzB}>
        <div style={{ filter: `brightness(${0.55 + 0.45 * luzA})` }}>
          <Mascota esp={TOBY} x={250} y={MESA + 60} alto={540} t={t} semilla={1} {...toby} />
          <Cuaderno x={250} y={MESA + 80} w={340} t={t} />
          <Cel x={420} y={MESA - 30} luz={luz} n={n} escala={1.05} giro={-8} />
          {PINGS.map((p, k) => <Ping key={k} x={300 + (k % 2) * 60} y={760 - (k % 2) * 40} p={rampa(t, S(1) + p, 1.1)} txt={TEXTOS[k]} />)}
        </div>
        <div style={{ filter: `brightness(${0.55 + 0.45 * luzB})` }}>
          {/* la puerta del otro cuarto, con el celular adentro */}
          <div style={{ position: "absolute", left: 870, top: 560, width: 170, height: 620, background: "#3B2C24", border: `8px solid ${TINTA}`, borderRadius: "10px 10px 0 0", overflow: "hidden" }}>
            <Cel x={85} y={420} luz={0} escala={0.55} />
            <div style={{ position: "absolute", inset: 0, background: "#B07A4F", borderRight: `6px solid ${TINTA}`, transformOrigin: "0 50%", transform: `perspective(600px) rotateY(${-75 * (1 - sale(puerta))}deg)` }}>
              <div style={{ position: "absolute", right: 18, top: 300, width: 22, height: 22, borderRadius: "50%", background: MANGO, border: `4px solid ${TINTA}` }} />
            </div>
          </div>
          <Mascota esp={AMIGA} x={720} y={MESA + 60} alto={540} t={t} semilla={2} {...amiga} />
          <Cuaderno x={720} y={MESA + 80} w={340} t={t} />
        </div>
      </Cuarto2>
    </Camara>
  );
}

function Gana({ t }) {
  const t0 = W(4, "Gana", 0.1) - 0.2;
  const a = 0.35 * sale(rampa(t, t0, 0.9)), b = 0.85 * sale(rampa(t, t0, 1.3));
  const ping = rampa(t, W(4, "notificación", 0.5) - 0.1, 0.4);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#FFF1D6, #F6D9A8)" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 290, textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 64, color: TINTA }}>Tu concentración</div>
      <Medidor x={300} y={1000} alto={500} llena={a} color={CORAL} letra="A" etiqueta="celular al lado" t={t} />
      <Medidor x={780} y={1000} alto={500} llena={b} color={AZUL} letra="B" etiqueta="en otro cuarto" t={t} />
      {ping > 0 && (
        <div style={{ position: "absolute", left: 540, top: 1120, transform: `translateX(-50%) rotate(-3deg) scale(${rebote(ping)})`, background: CREMA, border: `7px solid ${TINTA}`, borderRadius: 24, padding: "10px 30px 14px", fontFamily: "Caveat", fontWeight: 700, fontSize: 64, color: TINTA, whiteSpace: "nowrap", boxShadow: "0 10px 0 rgba(0,0,0,.2)" }}>aunque no la abras, te distrae</div>
      )}
    </AbsoluteFill>
  );
}

function Lejos({ t }) {
  /* Toby guarda el celular en el cajón y se queda en la página */
  const guarda = rampa(t, W(5, "Lejos", 0.2) - 0.05, 0.6);
  const lee = rampa(t, W(5, "página", 0.6) - 0.3, 0.5);
  const logo = rampa(t, T.DURACION_S - 1.8, 0.45);
  const final = t > S(6) - 0.1;
  const toby = { cara: final ? "feliz" : lee > 0.5 ? "estrellas" : "tranquila", cab: final ? 4 * Math.sin(t * 3) : 0, bd: final ? -50 + 10 * Math.sin(t * 7) : guarda < 1 ? -50 * pulso(t, W(5, "Lejos", 0.2) - 0.05, 0.6) : 0 };
  const amiga = { cara: "feliz", bi: final ? -50 + 10 * Math.sin(t * 7 + 1) : 0 };
  const cam = camara(t, [[S(5) - 0.3, 1.3, 290, 920], [E(5) + 0.1, 1.3, 290, 920], [S(6) + 0.3, 1.0, 540, 960]]);
  return (
    <Camara {...cam} t={t}>
      <Cuarto2 t={t} luzA={1} luzB={final ? 1 : 0.5}>
        <Mascota esp={TOBY} x={250} y={MESA + 60} alto={540} t={t} semilla={1} {...toby} />
        <Cuaderno x={250} y={MESA + 80} w={340} t={t} />
        {/* el celular baja al cajón */}
        <div style={{ position: "absolute", left: 0, top: 0, width: 540, height: MESA + 34, overflow: "hidden" }}>
          <Cel x={420} y={MESA - 30 + 280 * sale(guarda)} luz={0} escala={1.05} giro={-8} />
        </div>
        {!final && (
          <Piensa x={270} y={640} w={300} h={220} p={lee} cola={1}>
            <div>{[0, 1, 2].map((k) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 12, margin: "10px 0" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: VERDE, color: "#fff", fontFamily: "Sora", fontWeight: 800, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${rebote(clamp01(lee * 3 - k))})` }}>✓</div>
                <div style={{ height: 18, width: 130 - k * 20, background: AZUL, borderRadius: 9 }} />
              </div>
            ))}</div>
          </Piensa>
        )}
        <Mascota esp={AMIGA} x={720} y={MESA + 60} alto={540} t={t} semilla={2} {...amiga} />
        <Cuaderno x={720} y={MESA + 80} w={340} t={t} />
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
  { id: "lejos", desde: S(5) - 0.25, entra: "barrido-izq" },
];

function pinta(pl, t) {
  if (pl.id === "duelo") return <Duelo t={t} />;
  if (pl.id === "gana") return <Gana t={t} />;
  if (pl.id === "lejos") return <Lejos t={t} />;
  const p = rampa(t, S(3) - 0.1, 0.5);
  const restante = T.TRAMOS[3].v - t;
  const cuenta = t > E(3) + 0.1 && restante > 0 ? Math.min(2, Math.ceil(restante / 0.6)) : null;
  const cel = <div style={{ position: "relative", width: 120, height: 190 }}><Cel x={60} y={105} luz={0.8} n={4} escala={0.85} /></div>;
  const puerta = <svg width="130" height="190" viewBox="0 0 130 190"><rect x="14" y="8" width="102" height="176" rx="8" fill="#B07A4F" stroke={TINTA} strokeWidth="8" /><circle cx="94" cy="100" r="9" fill={MANGO} stroke={TINTA} strokeWidth="4" /></svg>;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#F6E7D8, #DCE3F6)" }}>
      <Opciones t={t} p={p} y={520} elige={t > S(4) - 0.3 ? 2 : 0} cuenta={cuenta}
        a={{ txt: <>Celular<br />al lado</>, icono: cel }} b={{ txt: <>En otro<br />cuarto</>, icono: puerta }} />
    </AbsoluteFill>
  );
}

export function Celular({ sinSonido = false, zonas = false, sinSubs = false }) {
  const sfx = [];
  const fx = (t, f, vol = 0.5) => sfx.push({ t, f, vol });
  PINGS.forEach((p) => fx(S(1) + p, "ding", 0.4));
  fx(S(2) - 0.25, "pop-suave", 0.4); fx(W(2, "cuarto", 0.5) + 0.3, "golpe", 0.35);
  fx(PLANOS[1].desde, "barrido", 0.4); fx(S(3) + 0.1, "pop", 0.45); fx(S(3) + 0.35, "pop", 0.45); fx(E(3) + 0.1, "redoble", 0.35); fx(S(4) - 0.3, "campana", 0.4);
  fx(PLANOS[2].desde, "whoosh", 0.4); fx(W(4, "notificación", 0.5) - 0.1, "ding", 0.4);
  fx(PLANOS[3].desde, "barrido", 0.4); fx(W(5, "Lejos", 0.2), "desliza", 0.4); fx(W(5, "página", 0.6), "pop", 0.4);
  fx(T.DURACION_S - 1.8, "ding", 0.45);
  const invita = (t) => <Invita p={rampa(t, E(6) + 0.4, 0.3)} tam={60}>Coméntalo y <span style={{ color: CORAL }}>síguenos</span></Invita>;
  return <Reel T={T} planos={PLANOS} encima={invita} pinta={pinta} sfx={sfx} arte={ARTE_MARCA} musica="lofi" sinSonido={sinSonido} zonas={zonas} sinSubs={sinSubs} subY={1405} />;
}
export { VOZ };
