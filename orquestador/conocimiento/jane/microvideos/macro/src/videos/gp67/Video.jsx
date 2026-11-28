/*
 * Gestión de Proyectos · GP-67 «¿Siguen con nosotros?» (gp67-monitorear-involucramiento).
 * Una idea: Monitorear el Involucramiento de los Interesados es monitorear las relaciones de los interesados y
 * adaptar las estrategias para involucrarlos; mantiene o incrementa la eficiencia y la eficacia de las actividades de
 * participación a medida que el proyecto evoluciona (13.4, p. 530). Matriz de evaluación del involucramiento
 * (13.4.2.5 / 13.2.2.5: desconocedor, reticente, neutral, de apoyo, líder); análisis de causa raíz (13.4.2.2);
 * escuchar de forma activa, retroalimentación, liderazgo (13.4.2.6); solicitudes de cambio con acciones
 * correctivas y preventivas (13.4.3.2).
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, Dicho, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, {
  extra: [0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3],
  manual: {
    3: ["Monitorear el involucramiento de los interesados", "es monitorear sus relaciones", "y adaptar las estrategias para involucrarlos."],
    4: ["Así se mantiene o se incrementa la eficiencia", "y la eficacia de su participación,", "mientras el proyecto cambia."],
    5: ["La matriz de evaluación del involucramiento sigue los cambios", "en el nivel de participación de cada interesado."],
    7: ["Con el análisis de causa raíz, busca el motivo de fondo:", "nadie le contó los nuevos horarios."],
    10: ["Si hace falta, sale una solicitud de cambio,", "con acciones correctivas o preventivas", "para mejorar el involucramiento."],
    11: ["Ahora te toca: elige un interesado de tu proyecto", "y anota su nivel de participación actual y el deseado."],
  },
});
const { S, E, W } = T;

const M = {
  apoyaba: W(1, "apoyaba", 0.35), ahora1: W(1, "Ahora", 0.75), contesta: W(1, "contesta.", 0.95),
  cambio2: W(2, "cambió?", 0.9),
  monitorear3: W(3, "Monitorear", 0.03), relaciones3: W(3, "relaciones", 0.6), adaptar: W(3, "adaptar", 0.75),
  mantiene: W(4, "mantiene", 0.1), eficiencia: W(4, "eficiencia", 0.4), mientras: W(4, "mientras", 0.8),
  matriz5: W(5, "matriz", 0.05), nivel5: W(5, "nivel", 0.7),
  paso: W(6, "pasó", 0.15), neutral: W(6, "neutral.", 0.55), nota: W(6, "nota", 0.85),
  causa: W(7, "causa", 0.25), fondo: W(7, "fondo:", 0.55), nadie: W(7, "nadie", 0.62),
  escuchar8: W(8, "escuchar", 0.15), retro: W(8, "retroalimentación", 0.65), liderazgo: W(8, "liderazgo.", 0.95),
  visita: W(9, "visita,", 0.15), escucha9: W(9, "escucha", 0.3), plan: W(9, "plan.", 0.6), vuelve: W(9, "vuelve", 0.8),
  solicitud: W(10, "solicitud", 0.35), correctivas: W(10, "correctivas", 0.6), preventivas: W(10, "preventivas", 0.75), mejorar: W(10, "mejorar", 0.88),
  toca: W(11, "toca:", 0.1), interesado11: W(11, "interesado", 0.3), actual: W(11, "actual", 0.85), deseado: W(11, "deseado.", 0.98),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "definicion", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "matriz", desde: S(5) - 0.3, entra: "zoom" },
  { tipo: "causa", desde: S(7) - 0.3, entra: "barrido-izq" },
  { tipo: "visita", desde: S(9) - 0.3, entra: "barrido" },
  { tipo: "solicitud", desde: S(10) - 0.3, entra: "barrido-izq" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* Matriz de evaluación del involucramiento: 3 interesados × 5 niveles; 📍 = nivel actual */
const NIVELES = ["descono-\ncedor", "reticente", "neutral", "de apoyo", "líder"];
function Matriz({ y, p, t }) {
  if (p <= 0) return null;
  const L = 40, NOM = 190, COL = 162, CAB = 116, FIL = 124;
  const mov = sale(rampa(t, M.paso, 0.9));
  const filas = [["🎒 Don Tito", lerp(3, 2, mov)], ["🐱 Carmen", 3], ["🐶 Ramón", 4]];
  const alerta = t > M.paso - 0.2;
  return (
    <div style={{ position: "absolute", left: L, top: y, width: NOM + COL * 5, height: CAB + FIL * 3, background: "#FFFDF7", border: `8px solid ${TINTA}`, borderRadius: 24, boxShadow: "0 14px 0 rgba(42,30,23,.28)", transform: `scale(${rebote(Math.min(1, p))})`, transformOrigin: "50% 0", fontFamily: "Sora", fontWeight: 800, color: TINTA, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: CAB, background: AZUL }} />
      {NIVELES.map((n, k) => (
        <div key={n} style={{ position: "absolute", left: NOM + k * COL, top: 0, width: COL, height: CAB, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#fff", fontSize: 28, lineHeight: 1.05, whiteSpace: "pre-line", borderLeft: "3px solid rgba(255,255,255,.35)" }}>{n}</div>
      ))}
      {filas.map(([nom, col], r) => {
        const q = rampa(t, M.matriz5 + 0.2 + r * 0.2, 0.3);
        const marca = r === 0 && alerta;
        return (
          <div key={nom} style={{ position: "absolute", left: 0, right: 0, top: CAB + r * FIL, height: FIL, borderTop: `4px solid ${TINTA}`, background: marca ? "#FFE1D8" : "transparent", opacity: q }}>
            <div style={{ position: "absolute", left: 14, top: 0, width: NOM - 20, height: FIL, display: "flex", alignItems: "center", fontSize: 28 }}>{nom}</div>
            {NIVELES.map((n, k) => <div key={n} style={{ position: "absolute", left: NOM + k * COL, top: 0, width: COL, height: FIL, borderLeft: `3px solid rgba(42,30,23,.18)` }} />)}
            <div style={{ position: "absolute", left: NOM + col * COL + COL / 2 - 36, top: FIL / 2 - 40, fontSize: 62, transform: `scale(${rebote(q)})` }}>📍</div>
          </div>
        );
      })}
    </div>
  );
}

/* ═════ 1–2 · Don Tito ya no contesta ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  const lejos = sale(rampa(t, M.contesta - 0.5, 0.8));
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(5px)" velo={0.15}>
      <Cartel x={540} y={190} txt="❤️ Don Tito apoyaba la feria" p={rampa(t, M.apoyaba - 0.3, 0.3)} tam={42} fondo="#E3F6EC" giro={-2} />
      <Cartel x={540} y={310} txt="📵 ahora casi no contesta" p={rampa(t, M.contesta - 0.5, 0.3)} tam={42} fondo="#FFE1D8" color={ROJO} giro={1} />
      <Dicho x={60} y={760} w={480} h={130} p={rampa(t, M.ahora1 - 0.3, 0.3)} colaX={260}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 40, color: TINTA }}>📞 ¿Don Tito?</div>
      </Dicho>
      {rampa(t, M.cambio2 - 0.5, 0.3) > 0 && <Gigante x={540} y={560} txt="🤔" p={rampa(t, M.cambio2 - 0.5, 0.3)} tam={150} />}
      <Sombra x={260} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={260} y={1515} alto={330} t={t} cara={t > M.contesta ? "triste" : "feliz"} semilla={3} />
      <Sombra x={lerp(820, 900, lejos)} y={1510} w={200} />
      <Mascota esp="perro-mochila" x={lerp(820, 900, lejos)} y={1515} alto={lerp(350, 300, lejos)} t={t} cara={t > M.contesta - 0.5 ? "tranquila" : "feliz"} semilla={9} espejo={t < M.contesta - 0.5} />
    </Escena>
  );
}

/* ═════ 3–4 · Qué es ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(4), b: E(4) + 0.3, s: 1.03, x: 540, y: 955 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={160} txt="monitorear el involucramiento" p={rampa(t, M.monitorear3 - 0.3, 0.35)} tam={46} fondo={MANGO} />
      <Cartel x={540} y={250} txt="de los interesados" p={rampa(t, M.monitorear3, 0.35)} tam={40} fondo={MANGO} />
      <Cartel x={540} y={380} txt="🤝 monitorear sus relaciones" p={rampa(t, M.relaciones3 - 0.3, 0.3)} tam={38} fondo={CREMA} giro={-1} />
      <Cartel x={540} y={480} txt="🔧 adaptar las estrategias" p={rampa(t, M.adaptar - 0.3, 0.3)} tam={38} fondo="#FFFDF7" giro={1} />
      <Cartel x={540} y={620} txt="📈 mantener o incrementar" p={rampa(t, M.mantiene - 0.3, 0.3)} tam={40} fondo="#E3F6EC" />
      <Cartel x={540} y={720} txt="eficiencia y eficacia de su participación" p={rampa(t, M.eficiencia - 0.3, 0.3)} tam={32} fondo="#FFFDF7" giro={-1} />
      <Cartel x={540} y={840} txt="🔄 mientras el proyecto cambia" p={rampa(t, M.mientras - 0.3, 0.3)} tam={38} fondo="#DDE3FF" giro={1} />
      <Sombra x={250} y={1530} w={170} />
      <Mascota esp="hamster-gorra" x={250} y={1535} alto={260} t={t} cara="feliz" semilla={3} />
      <Sombra x={830} y={1530} w={170} />
      <Mascota esp="perro-mochila" x={830} y={1535} alto={280} t={t} cara="tranquila" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 5–6 · La matriz ═════ */
function Tabla({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(6), b: E(6) + 0.3, s: 1.04, x: 540, y: 900 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={150} txt="📊 matriz de evaluación del involucramiento" p={rampa(t, M.matriz5 - 0.3, 0.35)} tam={34} fondo={MANGO} />
      <Matriz y={250} p={rampa(t, M.matriz5, 0.4)} t={t} />
      <Cartel x={540} y={800} txt="🔄 sigue los cambios de nivel" p={rampa(t, M.nivel5 - 0.3, 0.3)} tam={38} fondo={CREMA} giro={-1} />
      <Cartel x={540} y={910} txt="📉 Don Tito: de apoyo → neutral" p={rampa(t, M.neutral - 0.3, 0.3)} tam={38} fondo="#FFE1D8" color={ROJO} giro={1} />
      <Sombra x={200} y={1540} w={150} />
      <Mascota esp="hamster-gorra" x={200} y={1545} alto={250} t={t} cara={t > M.nota - 0.3 ? "triste" : "tranquila"} bi={-40 * pulso(t, M.nota, 1.0)} semilla={3} />
      <Sombra x={880} y={1540} w={150} />
      <Mascota esp="perro-mochila" x={880} y={1545} alto={260} t={t} cara="tranquila" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 7–8 · Causa raíz y habilidades ═════ */
function Causa({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(8), b: E(8) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const H = [[M.escuchar8, "👂 escuchar de forma activa"], [M.retro, "💬 retroalimentación"], [M.liderazgo, "🧭 liderazgo"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={160} txt="🔍 análisis de causa raíz" p={rampa(t, M.causa - 0.3, 0.35)} tam={46} fondo={MANGO} />
      <Cartel x={540} y={290} txt="📵 casi no contesta" p={rampa(t, M.causa + 0.2, 0.3)} tam={36} fondo="#FFFDF7" giro={-1} />
      {rampa(t, M.fondo - 0.5, 0.3) > 0 && <Gigante x={540} y={385} txt="⬇️" p={rampa(t, M.fondo - 0.5, 0.3)} tam={56} />}
      <Cartel x={540} y={480} txt="🕐 nadie le contó los nuevos horarios" p={rampa(t, M.nadie - 0.2, 0.3)} tam={34} fondo="#FFE1D8" color={ROJO} giro={1} />
      <Cartel x={540} y={640} txt="🛠️ ayudan:" p={rampa(t, M.escuchar8 - 0.6, 0.3)} tam={40} fondo="#DDE3FF" />
      {H.map(([tw, txt], k) => <Cartel key={k} x={540} y={750 + k * 100} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={38} fondo={k % 2 ? "#FFFDF7" : CREMA} giro={[-1, 1, -1][k]} />)}
      <Sombra x={180} y={1540} w={150} />
      <Mascota esp="hamster-gorra" x={180} y={1545} alto={250} t={t} cara={t > M.nadie ? "estrellas" : "tranquila"} semilla={3} />
      <Sombra x={900} y={1540} w={150} />
      <Mascota esp="perro-mochila" x={900} y={1545} alto={260} t={t} cara="tranquila" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 9 · La visita ═════ */
function Visita({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(9), b: E(9) + 0.3, s: 1.04, x: 540, y: 990 }]);
  const px = lerp(220, 380, sale(rampa(t, M.visita - 0.4, 0.8)));
  const ok = t > M.vuelve - 0.2;
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={170} txt="🚶 Pía lo visita" p={rampa(t, M.visita - 0.3, 0.3)} tam={44} fondo={MANGO} giro={-1} />
      <Dicho x={440} y={330} w={580} h={140} p={rampa(t, M.escucha9 - 0.3, 0.3)} colaX={820}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 38, color: TINTA }}>😕 nadie me avisó</div>
      </Dicho>
      <Dicho x={40} y={640} w={620} h={140} p={rampa(t, M.plan - 0.7, 0.3)} colaX={px}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 36, color: TINTA }}>📋 este es el plan</div>
      </Dicho>
      <Cartel x={540} y={1000} txt="❤️ vuelve a apoyar" p={rampa(t, M.vuelve - 0.3, 0.3)} tam={46} fondo="#E3F6EC" giro={2} />
      <Sombra x={px} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={px} y={1515} alto={320} t={t} cara={ok ? "feliz" : "tranquila"} bi={-40 * pulso(t, M.plan - 0.5, 1.0)} semilla={3} />
      <Sombra x={820} y={1510} w={200} />
      <Mascota esp="perro-mochila" x={820} y={1515} alto={340} t={t} cara={ok ? "corazones" : "tranquila"} salto={30 * pulso(t, M.vuelve, 0.5)} semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 10 · Solicitud de cambio ═════ */
function Solicitud({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10) + 0.3, s: 1.03, x: 540, y: 955 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={160} txt="🤔 si hace falta" p={rampa(t, S(10) + 0.1, 0.3)} tam={44} fondo={MANGO} />
      <Documento x={540} y={500} w={340} p={rampa(t, M.solicitud - 0.4, 0.4)} titulo="solicitud de cambio" letra={32} giro={-2} />
      <Cartel x={300} y={820} txt="🛠️ correctivas" p={rampa(t, M.correctivas - 0.3, 0.3)} tam={38} fondo={CREMA} giro={-2} />
      <Cartel x={780} y={820} txt="🛡️ preventivas" p={rampa(t, M.preventivas - 0.3, 0.3)} tam={38} fondo={CREMA} giro={2} />
      <Cartel x={540} y={950} txt="📈 mejorar el involucramiento" p={rampa(t, M.mejorar - 0.3, 0.3)} tam={40} fondo="#E3F6EC" />
      <Sombra x={160} y={1540} w={140} />
      <Mascota esp="hamster-gorra" x={160} y={1545} alto={230} t={t} cara="feliz" semilla={3} />
      <Sombra x={920} y={1540} w={140} />
      <Mascota esp="perro-mochila" x={920} y={1545} alto={240} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 11 · Tu interesado ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={260} txt="⚡ tu interesado" p={rampa(t, M.toca - 0.2, 0.35)} tam={58} fondo={MANGO} />
      <Cartel x={540} y={410} txt="👤 interesado: ________" p={rampa(t, M.interesado11 - 0.3, 0.3)} tam={42} fondo={CREMA} giro={-2} />
      <Cartel x={540} y={530} txt="📍 nivel actual: ________" p={rampa(t, M.actual - 0.6, 0.3)} tam={40} fondo={CREMA} giro={1} />
      <Cartel x={540} y={650} txt="🎯 nivel deseado: ________" p={rampa(t, M.deseado - 1.0, 0.3)} tam={40} fondo="#E3F6EC" giro={-1} />
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.deseado, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="perro-mochila" x={790} y={1535} alto={370} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "definicion") return <Definicion t={t} />;
  if (p.tipo === "matriz") return <Tabla t={t} />;
  if (p.tipo === "causa") return <Causa t={t} />;
  if (p.tipo === "visita") return <Visita t={t} />;
  if (p.tipo === "solicitud") return <Solicitud t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.apoyaba - 0.3, "pop", 0.2); fx(M.ahora1 - 0.3, "pop-suave", 0.18); fx(M.contesta - 0.5, "bocina", 0.2); fx(M.cambio2 - 0.5, "pop", 0.22);
fx(S(3) - 0.3, "whoosh", 0.4); [M.relaciones3, M.adaptar, M.mantiene, M.eficiencia, M.mientras].forEach((w) => fx(w - 0.3, "pop", 0.18));
fx(S(5) - 0.3, "whoosh", 0.4); fx(M.matriz5, "papel", 0.25); fx(M.paso, "desliza", 0.25); fx(M.neutral - 0.3, "bocina", 0.2);
fx(S(7) - 0.3, "whoosh", 0.4); fx(M.causa - 0.3, "pop", 0.2); fx(M.nadie - 0.2, "golpe", 0.22); [M.escuchar8, M.retro, M.liderazgo].forEach((w) => fx(w - 0.3, "pop-suave", 0.18));
fx(S(9) - 0.3, "whoosh", 0.4); fx(M.escucha9 - 0.3, "pop", 0.2); fx(M.plan - 0.7, "pop", 0.2); fx(M.vuelve - 0.2, "ding", 0.28);
fx(S(10) - 0.3, "whoosh", 0.4); fx(M.solicitud - 0.4, "papel", 0.3); [M.correctivas, M.preventivas, M.mejorar].forEach((w) => fx(w - 0.3, "pop", 0.18));
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/calle.jpg", "art/oficina.jpg"];
const CLAVE = /^(involucramiento|interesados|interesado|matriz|causa|raíz|escuchar|retroalimentación|liderazgo|solicitud|correctivas|preventivas)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP67 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp67-monitorear-involucramiento.mp3" sinSonido={sinSonido} />
);
