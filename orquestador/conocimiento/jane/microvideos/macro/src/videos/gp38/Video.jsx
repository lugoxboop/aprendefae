/*
 * Gestión de Proyectos · GP-38 «¿Quién se entera de qué?» (gp38-comunicaciones).
 * Una idea: Planificar la Gestión de las Comunicaciones es desarrollar un enfoque y un plan
 * apropiados para las comunicaciones del proyecto según las necesidades de información de cada
 * interesado (10.1, p. 366). Análisis de requisitos de comunicación y canales potenciales: uno a
 * uno, uno a muchos, muchos a muchos (10.1.2.2). Métodos: interactiva, push y pull (10.1.2.5,
 * p. 374). Plan de gestión de las comunicaciones: qué, para quién, frecuencia, responsable,
 * métodos y procesos de escalamiento (10.1.3.1, p. 377).
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3] });
const { S, E, W } = T;

const M = {
  horario: W(1, "horario.", 0.3), vecino: W(1, "vecino;", 0.75), nunca: W(1, "nunca.", 0.95),
  quien2: W(2, "quién", 0.3), aquien: W(2, "quién,", 0.6), como2: W(2, "cómo.", 0.95),
  planificar: W(3, "Planificar", 0.05), enfoque: W(3, "enfoque", 0.45), plan3: W(3, "plan", 0.55), interesado: W(3, "interesado.", 0.95),
  analiza: W(4, "analiza", 0.1), canales: W(4, "canales", 0.5), uno1: W(4, "uno", 0.62), muchos1: W(4, "muchos,", 0.78), muchos2: W(4, "muchos.", 0.95),
  metodo: W(5, "método.", 0.8),
  interactiva: W(6, "Interactiva:", 0.05), reunion: W(6, "reunión", 0.7),
  push: W(7, "push:", 0.1), correo: W(7, "correo;", 0.35), sale7: W(7, "sale,", 0.55), entienda: W(7, "entienda.", 0.95),
  pull: W(8, "pull:", 0.1), portal: W(8, "portal;", 0.4), audiencias: W(8, "audiencias", 0.85),
  plan9: W(9, "plan", 0.2), que9: W(9, "qué,", 0.45), paraquien: W(9, "quién,", 0.55), cuanto: W(9, "cuánto,", 0.68), envia: W(9, "envía", 0.82), medio: W(9, "medio.", 0.95),
  escalar: W(10, "escalar", 0.45), traba: W(10, "traba.", 0.95),
  toca: W(11, "toca:", 0.15), tabla: W(11, "tabla", 0.3), proyecto11: W(11, "proyecto.", 0.95),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "definicion", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "canales", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "metodos", desde: S(5) - 0.3, entra: "barrido-izq" },
  { tipo: "plan", desde: S(9) - 0.3, entra: "barrido" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

function Hoja({ x, y, w, h, p, titulo, filas, t }) {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, height: h, background: "#FFFDF7", border: `8px solid ${TINTA}`, borderRadius: 26, boxShadow: "0 14px 0 rgba(42,30,23,.28)", transform: `scale(${rebote(Math.min(1, p))})`, transformOrigin: "50% 0", fontFamily: "Sora", fontWeight: 800, color: TINTA }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 100, background: AZUL, borderRadius: "18px 18px 0 0", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 42, padding: "0 30px", textAlign: "center" }}>{titulo}</div>
      {filas.map(([tw, ic, tit, sub, fondo], k) => {
        const q = rampa(t, tw - 0.4, 0.35);
        if (q <= 0) return null;
        return (
          <div key={k} style={{ position: "absolute", left: 24, right: 24, top: 124 + k * 178, height: 160, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 18, padding: "0 22px", background: fondo, border: `5px solid ${TINTA}`, borderRadius: 20, transform: `scale(${rebote(q)})` }}>
            <span style={{ fontSize: 66 }}>{ic}</span>
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontSize: 40 }}>{tit}</div>
              <div style={{ fontSize: 32, color: "#5B4A3E", marginTop: 6, opacity: rampa(t, tw + 0.5, 0.35) }}>{sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


/* Puntos y líneas: un diagrama de canales */
function Red({ cx, cy, p, izq, der, rot }) {
  if (p <= 0) return null;
  const L = izq.map((y) => [cx - 120, cy + y]), R = der.map((y) => [cx + 120, cy + y]);
  return (
    <div style={{ opacity: p, transform: `scale(${0.7 + 0.3 * sale(p)})`, transformOrigin: `${cx}px ${cy}px`, position: "absolute", inset: 0 }}>
      <svg width="1080" height="1920" style={{ position: "absolute", left: 0, top: 0 }}>
        {L.map((a, i) => R.map((b, j) => <line key={i + "-" + j} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={TINTA} strokeWidth="5" />))}
        {[...L, ...R].map((a, i) => <circle key={i} cx={a[0]} cy={a[1]} r="26" fill={i < L.length ? MANGO : "#DDE3FF"} stroke={TINTA} strokeWidth="6" />)}
      </svg>
      <div style={{ position: "absolute", left: cx - 200, top: cy + 160, width: 400, textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 36, color: TINTA }}>{rot}</div>
    </div>
  );
}

/* Tarjeta de método */
function Metodo({ x, y, p, ic, tit, ej, nota, pn, fondo }) {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x - 160, top: y, width: 320, height: 620, background: fondo, border: `7px solid ${TINTA}`, borderRadius: 26, transform: `scale(${rebote(Math.min(1, p))})`, transformOrigin: "50% 0", fontFamily: "Sora", fontWeight: 800, color: TINTA, textAlign: "center", boxSizing: "border-box", padding: "24px 16px" }}>
      <div style={{ fontSize: 90 }}>{ic}</div>
      <div style={{ fontSize: 40, marginTop: 6 }}>{tit}</div>
      <div style={{ fontSize: 32, marginTop: 24, color: "#5B4A3E", lineHeight: 1.2 }}>{ej}</div>
      <div style={{ fontSize: 28, marginTop: 30, lineHeight: 1.2, opacity: pn }}>{nota}</div>
    </div>
  );
}

/* ═════ 1–2 · Nadie avisó ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(5px)" velo={0.15}>
      <Cartel x={540} y={230} txt="🕘 ¡nuevo horario!" p={rampa(t, M.horario - 0.4, 0.35)} tam={54} fondo={MANGO} giro={-2} />
      <Cartel x={300} y={420} txt="👂 «me dijo un vecino»" p={rampa(t, M.vecino - 0.4, 0.35)} tam={38} fondo={CREMA} giro={-3} />
      <Cartel x={800} y={420} txt="❓ nunca supo" p={rampa(t, M.nunca - 0.3, 0.35)} tam={40} fondo="#FFE1D8" giro={3} />
      {[[M.quien2, "¿quién avisa?"], [M.aquien, "¿a quién?"], [M.como2, "¿cómo?"]].map(([tw, txt], k) => <Cartel key={k} x={200 + k * 340} y={720} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={38} fondo="#FFFDF7" giro={[-2, 2, -1][k]} />)}
      <Cartel x={540} y={860} txt="nadie lo decidió" p={rampa(t, M.como2, 0.35)} tam={44} fondo="#FFE1D8" giro={1} />
      <Sombra x={250} y={1510} w={200} />
      <Mascota esp="perro-mochila" x={250} y={1515} alto={370} t={t} cara={t > M.vecino ? "triste" : "tranquila"} semilla={5} />
      <Sombra x={820} y={1510} w={200} />
      <Mascota esp="gato-gafas" x={820} y={1515} alto={370} t={t} cara={t > M.nunca - 0.3 ? "triste" : "tranquila"} cab={6 * Math.sin(t * 3)} semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 3 · Qué es ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3), b: E(3) + 0.3, s: 1.03, x: 540, y: 955 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={250} txt="planificar la gestión de las comunicaciones" p={rampa(t, M.planificar - 0.3, 0.35)} tam={40} fondo={MANGO} />
      <Cartel x={320} y={450} txt="🧭 un enfoque" p={rampa(t, M.enfoque - 0.35, 0.35)} tam={46} fondo={CREMA} giro={-2} />
      <Cartel x={770} y={450} txt="📋 un plan" p={rampa(t, M.plan3 - 0.35, 0.35)} tam={46} fondo={CREMA} giro={2} />
      <Cartel x={540} y={650} txt="👥 según lo que necesita cada interesado" p={rampa(t, M.interesado - 0.8, 0.35)} tam={36} fondo="#DDE3FF" giro={-1} />
      <Sombra x={540} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 4 · Canales ═════ */
function Canales({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(4), b: E(4) + 0.3, s: 1.03, x: 540, y: 955 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={220} txt="🔎 ¿qué necesita saber cada quien?" p={rampa(t, M.analiza - 0.3, 0.35)} tam={40} fondo={CREMA} />
      <Cartel x={540} y={350} txt="¿cuántos canales hay?" p={rampa(t, M.canales - 0.4, 0.35)} tam={44} fondo={MANGO} giro={-1} />
      <Red cx={540} cy={530} p={rampa(t, M.uno1 - 0.3, 0.35)} izq={[0]} der={[0]} rot="uno a uno" />
      <Red cx={270} cy={880} p={rampa(t, M.muchos1 - 0.4, 0.35)} izq={[0]} der={[-90, 0, 90]} rot="uno a muchos" />
      <Red cx={810} cy={880} p={rampa(t, M.muchos2 - 0.4, 0.35)} izq={[-90, 0, 90]} der={[-90, 0, 90]} rot="muchos a muchos" />
      <Sombra x={540} y={1530} w={180} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={250} t={t} cara={t > M.muchos2 ? "estrellas" : "feliz"} semilla={3} />
    </Escena>
  );
}

/* ═════ 5–8 · Métodos ═════ */
function Metodos({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(8), b: E(8), s: 1.02, x: 540, y: 960 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={210} txt="métodos de comunicación" p={rampa(t, S(5) - 0.2, 0.35)} tam={48} fondo={MANGO} />
      <Metodo x={190} y={330} p={rampa(t, M.interactiva - 0.35, 0.4)} ic="🗣️" tit="interactiva" ej="reunión, llamada" nota="en tiempo real" pn={rampa(t, M.reunion, 0.3)} fondo="#E3F6EC" />
      <Metodo x={540} y={330} p={rampa(t, M.push - 0.35, 0.4)} ic="📤" tit="push" ej="correo, informe" nota="sale… pero ¿llega? ¿se entiende?" pn={rampa(t, M.sale7 - 0.2, 0.3)} fondo="#DDE3FF" />
      <Metodo x={890} y={330} p={rampa(t, M.pull - 0.35, 0.4)} ic="📥" tit="pull" ej="portal, intranet" nota="mucha información, audiencias grandes" pn={rampa(t, M.audiencias - 0.5, 0.3)} fondo="#FFF4DA" />
      <Sombra x={240} y={1510} w={170} />
      <Mascota esp="perro-mochila" x={240} y={1515} alto={270} t={t} cara="feliz" semilla={5} />
      <Sombra x={840} y={1510} w={170} />
      <Mascota esp="gato-gafas" x={840} y={1515} alto={270} t={t} cara={t > M.pull ? "feliz" : "tranquila"} semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 9–10 · El plan ═════ */
function Plan({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10) - 0.2, b: E(10), s: 1.02, x: 540, y: 960 }]);
  const FIL = [
    [M.que9, "📰", "qué información", "ej.: nuevo horario", "#FFF4DA"],
    [M.paraquien, "👥", "para quién", "clientes, equipo, dueña", "#DDE3FF"],
    [M.cuanto, "🔁", "cada cuánto", "cada vez que cambie", "#E3F6EC"],
    [M.envia, "🙋", "quién la envía", "Pía", "#FFE1D8"],
    [M.medio, "📲", "por qué medio", "cartel y mensaje", "#FFF4DA"],
    [M.escalar, "🪜", "escalamiento", "a quién acudir si se traba", "#DDE3FF"],
  ];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Hoja x={540} y={110} w={990} h={1210} p={rampa(t, M.plan9 - 0.4, 0.4)} titulo="plan de gestión de las comunicaciones" filas={FIL} t={t} />
      <Sombra x={160} y={1560} w={130} />
      <Mascota esp="hamster-gorra" x={160} y={1565} alto={190} t={t} cara={t > M.traba ? "estrellas" : "feliz"} semilla={3} />
      <Sombra x={920} y={1560} w={130} />
      <Mascota esp="perro-mochila" x={920} y={1565} alto={190} t={t} cara="feliz" semilla={5} espejo />
    </Escena>
  );
}

/* ═════ 11 · Tu tabla ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  const C = ["qué", "a quién", "cuándo", "cómo"];
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={300} txt="⚡ arma tu tabla" p={rampa(t, M.toca - 0.2, 0.35)} tam={58} fondo={MANGO} />
      {C.map((txt, k) => <Cartel key={k} x={160 + k * 253} y={480} txt={txt} p={rampa(t, M.tabla - 0.2 + k * 0.3, 0.3)} tam={36} fondo="#DDE3FF" giro={[-2, 2, -1, 1][k]} />)}
      {C.map((_, k) => <Cartel key={k} x={160 + k * 253} y={600} txt="____" p={rampa(t, M.tabla + 0.6 + k * 0.3, 0.3)} tam={40} fondo={CREMA} />)}
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.proyecto11, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="gato-gafas" x={790} y={1535} alto={380} t={t} cara="feliz" semilla={7} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "definicion") return <Definicion t={t} />;
  if (p.tipo === "canales") return <Canales t={t} />;
  if (p.tipo === "metodos") return <Metodos t={t} />;
  if (p.tipo === "plan") return <Plan t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.horario - 0.4, "campana", 0.3); fx(M.vecino - 0.4, "pop", 0.25); fx(M.nunca - 0.3, "toc-grave", 0.3); [M.quien2, M.aquien, M.como2].forEach((w) => fx(w - 0.3, "pop-suave", 0.22));
fx(S(3) - 0.3, "whoosh", 0.4); fx(M.planificar - 0.3, "pop", 0.3); fx(M.enfoque - 0.35, "pop-suave", 0.25); fx(M.plan3 - 0.35, "pop-suave", 0.25);
fx(S(4) - 0.3, "whoosh", 0.4); [M.uno1, M.muchos1, M.muchos2].forEach((w) => fx(w - 0.4, "pop", 0.25));
fx(S(5) - 0.3, "whoosh", 0.4); [M.interactiva, M.push, M.pull].forEach((w) => fx(w - 0.35, "papel", 0.25));
fx(S(9) - 0.3, "whoosh", 0.4); [M.que9, M.paraquien, M.cuanto, M.envia, M.medio, M.escalar].forEach((w) => fx(w - 0.4, "pop-suave", 0.22));
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/calle.jpg", "art/oficina.jpg"];
const CLAVE = /^(comunicaciones|canales|método|interactiva|push|pull|plan|escalar)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP38 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp38-comunicaciones.mp3" sinSonido={sinSonido} />
);
