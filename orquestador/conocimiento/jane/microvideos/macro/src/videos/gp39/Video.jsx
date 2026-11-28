/*
 * Gestión de Proyectos · GP-39 «¿Y si llueve?» (gp39-plan-riesgos).
 * Una idea: un riesgo individual es un evento o condición incierta que, si se produce, tiene un
 * efecto positivo o negativo en uno o más objetivos (cap. 11, p. 397): amenaza u oportunidad.
 * Planificar la Gestión de los Riesgos es definir cómo realizar las actividades de gestión de
 * riesgos, en proporción a los riesgos y a la importancia del proyecto (11.1, p. 401). Plan de
 * gestión de los riesgos: estrategia, metodología, roles, financiamiento, calendario, categorías
 * (RBS: técnico, de gestión, comercial, externo), apetito al riesgo como umbrales medibles,
 * definiciones de probabilidad e impacto (11.1.3.1, p. 405–407).
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
  feria: W(1, "feria", 0.3), llueve: W(1, "llueve?", 0.6), pedido: W(1, "pedido", 0.85),
  inciertas: W(2, "inciertas,", 0.45), cambiarian: W(2, "cambiarían", 0.8),
  riesgo3: W(3, "riesgo:", 0.12), incierta: W(3, "incierta", 0.4), objetivos: W(3, "objetivos,", 0.72), bien: W(3, "bien", 0.85), mal: W(3, "mal.", 0.97),
  amenaza: W(4, "amenaza;", 0.45), oportunidad: W(4, "oportunidad.", 0.95),
  planificar: W(5, "Planificar", 0.05), definir: W(5, "definir", 0.45),
  proporcional: W(6, "proporcional", 0.35), importancia: W(6, "importancia", 0.8),
  plan7: W(7, "plan", 0.25), estrategia: W(7, "estrategia,", 0.55), metodologia: W(7, "metodología,", 0.65), roles: W(7, "roles,", 0.75), financiamiento: W(7, "financiamiento", 0.85), calendario: W(7, "calendario.", 0.97),
  categorias: W(8, "categorías", 0.25), estructura: W(8, "estructura", 0.7),
  apetito: W(9, "apetito", 0.3), umbrales: W(9, "umbrales", 0.85),
  probabilidad: W(10, "probabilidad", 0.2), impacto: W(10, "impacto", 0.6), proyecto10: W(10, "proyecto.", 0.95),
  toca: W(11, "toca:", 0.15), umbral11: W(11, "umbral", 0.4), tres: W(11, "tres", 0.8),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "riesgo", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "definicion", desde: S(5) - 0.3, entra: "zoom" },
  { tipo: "plan", desde: S(7) - 0.3, entra: "barrido-izq" },
  { tipo: "categorias", desde: S(8) - 0.3, entra: "barrido" },
  { tipo: "umbral", desde: S(9) - 0.3, entra: "barrido-izq" },
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


const caja = (x, y, w, h, fondo, op, txt, tam) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, background: fondo, border: `6px solid ${TINTA}`, borderRadius: 18, boxSizing: "border-box", opacity: op, transform: `scale(${0.6 + 0.4 * sale(clamp01(op))})`, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: tam, color: TINTA, lineHeight: 1.1, padding: "0 8px" }}>{txt}</div>
);
const linea = (x1, y1, x2, y2, op) => (
  <svg width="1080" height="1920" style={{ position: "absolute", left: 0, top: 0, opacity: op }}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={TINTA} strokeWidth="6" /></svg>
);

/* ═════ 1–2 · La feria del domingo ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(5px)" velo={0.15}>
      <Cartel x={540} y={220} txt="🎪 feria del domingo" p={rampa(t, M.feria - 0.4, 0.35)} tam={52} fondo={MANGO} giro={-2} />
      <Gigante x={290} y={470} txt="🌧️" p={rampa(t, M.llueve - 0.3, 0.35)} tam={150} />
      <Cartel x={290} y={640} txt="¿y si llueve?" p={rampa(t, M.llueve - 0.2, 0.3)} tam={40} fondo="#FFE1D8" giro={-3} />
      <Gigante x={790} y={470} txt="📦" p={rampa(t, M.pedido - 0.3, 0.35)} tam={150} />
      <Cartel x={790} y={640} txt="¿pedido enorme?" p={rampa(t, M.pedido - 0.2, 0.3)} tam={40} fondo="#E3F6EC" giro={3} />
      <Cartel x={540} y={850} txt="❔ inciertas… y cambiarían el proyecto" p={rampa(t, M.inciertas - 0.4, 0.35)} tam={36} fondo={CREMA} />
      <Sombra x={260} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={260} y={1515} alto={370} t={t} cara={t > M.llueve ? "triste" : "feliz"} cab={6 * Math.sin(t * 3)} semilla={3} />
      <Sombra x={820} y={1510} w={190} />
      <Mascota esp="gato-gafas" x={820} y={1515} alto={360} t={t} cara={t > M.pedido ? "estrellas" : "tranquila"} semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 3–4 · Qué es un riesgo ═════ */
function Riesgo({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(4), b: E(4) + 0.3, s: 1.03, x: 540, y: 955 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={230} txt="⚠️ riesgo" p={rampa(t, M.riesgo3 - 0.3, 0.35)} tam={62} fondo={MANGO} />
      <Cartel x={540} y={390} txt="evento o condición incierta" p={rampa(t, M.incierta - 0.35, 0.35)} tam={42} fondo={CREMA} giro={-1} />
      <Cartel x={540} y={510} txt="🎯 si ocurre, afecta los objetivos" p={rampa(t, M.objetivos - 0.4, 0.35)} tam={38} fondo={CREMA} giro={1} />
      {caja(300, 760, 380, 200, "#FFE1D8", rampa(t, M.mal - 0.3, 0.3), "👎 para mal", 46)}
      {caja(780, 760, 380, 200, "#E3F6EC", rampa(t, M.bien - 0.3, 0.3), "👍 para bien", 46)}
      <Cartel x={300} y={920} txt="amenaza" p={rampa(t, M.amenaza - 0.35, 0.3)} tam={48} fondo={ROJO} giro={-3} />
      <Cartel x={780} y={920} txt="oportunidad" p={rampa(t, M.oportunidad - 0.45, 0.3)} tam={48} fondo="#7DDA9F" giro={3} />
      <Sombra x={540} y={1510} w={190} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={290} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 5–6 · Planificar la gestión de los riesgos ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(6), b: E(6) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const pP = rampa(t, M.proporcional - 0.3, 0.4);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={250} txt="planificar la gestión de los riesgos" p={rampa(t, M.planificar - 0.3, 0.35)} tam={46} fondo={MANGO} />
      <Cartel x={540} y={420} txt="📝 definir cómo se gestionarán" p={rampa(t, M.definir - 0.35, 0.35)} tam={44} fondo={CREMA} giro={-1} />
      <Cartel x={540} y={580} txt="⚖️ esfuerzo proporcional" p={pP} tam={44} fondo="#DDE3FF" giro={1} />
      {caja(300, 800, 260, 160, "#FFFDF7", pP, "🧁 proyecto pequeño", 32)}
      <Gigante x={300} y={940} txt="🛡️" p={pP} tam={60} />
      {caja(780, 800, 300, 200, "#FFFDF7", rampa(t, M.importancia - 0.4, 0.35), "🏗️ proyecto grande e importante", 32)}
      <Gigante x={780} y={980} txt="🛡️🛡️🛡️" p={rampa(t, M.importancia - 0.2, 0.35)} tam={70} />
      <Sombra x={540} y={1520} w={190} />
      <Mascota esp="hamster-gorra" x={540} y={1525} alto={280} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 7 · El plan ═════ */
function Plan({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(7), b: E(7) + 0.3, s: 1.02, x: 540, y: 960 }]);
  const FIL = [
    [M.estrategia, "🧭", "estrategia", "el enfoque general", "#FFF4DA"],
    [M.metodologia, "🛠️", "metodología", "enfoques, herramientas, datos", "#DDE3FF"],
    [M.roles, "🙋", "roles y responsabilidades", "quién lidera, quién apoya", "#E3F6EC"],
    [M.financiamiento, "💵", "financiamiento", "fondos y uso de las reservas", "#FFE1D8"],
    [M.calendario, "📅", "calendario", "cuándo y cada cuánto", "#FFF4DA"],
  ];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Hoja x={540} y={170} w={990} h={1050} p={rampa(t, M.plan7 - 0.4, 0.4)} titulo="plan de gestión de los riesgos" filas={FIL} t={t} />
      <Sombra x={200} y={1510} w={170} />
      <Mascota esp="hamster-gorra" x={200} y={1515} alto={260} t={t} cara="feliz" semilla={3} />
      <Sombra x={880} y={1510} w={160} />
      <Mascota esp="gato-gafas" x={880} y={1515} alto={260} t={t} cara="feliz" semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 8 · Categorías: estructura de desglose de los riesgos ═════ */
function Categorias({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(8), b: E(8) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const pE = rampa(t, M.estructura - 0.4, 0.4);
  const C = [[160, "⚙️ técnico"], [400, "🗂️ de gestión"], [660, "🤝 comercial"], [900, "🌦️ externo"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={220} txt="🗃️ categorías de riesgo" p={rampa(t, M.categorias - 0.4, 0.35)} tam={50} fondo={MANGO} />
      <Cartel x={540} y={350} txt="estructura de desglose de los riesgos (RBS)" p={pE} tam={34} fondo={CREMA} />
      {caja(540, 520, 460, 110, "#DDE3FF", pE, "todas las fuentes de riesgo", 34)}
      {C.map(([x, txt], k) => {
        const p = clamp01((t - (M.estructura - 0.1 + k * 0.25)) / 0.3);
        return <div key={k}>{linea(540, 575, x, 700, p)}{caja(x, 750, 220, 100, CREMA, p, txt, 30)}</div>;
      })}
      <Cartel x={900} y={900} txt="🌧️ la lluvia" p={rampa(t, E(8) - 0.6, 0.3)} tam={32} fondo="#FFE1D8" giro={3} />
      <Sombra x={540} y={1520} w={190} />
      <Mascota esp="hamster-gorra" x={540} y={1525} alto={280} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 9–10 · Apetito, umbrales y escalas ═════ */
function Umbral({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10), s: 1.02, x: 540, y: 960 }]);
  const pA = rampa(t, M.apetito - 0.3, 0.4), pU = rampa(t, M.umbrales - 0.4, 0.35);
  const lleno = sale(clamp01((t - M.apetito) / 1.8));
  const NIV = ["baja", "media", "alta"];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={220} txt="🍽️ apetito al riesgo" p={pA} tam={50} fondo={MANGO} />
      <div style={{ position: "absolute", left: 160, top: 330, width: 120, height: 420, background: "#FFFDF7", border: `7px solid ${TINTA}`, borderRadius: 60, overflow: "hidden", opacity: pA }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${lleno * 70}%`, background: lerp(0, 1, lleno) > 0.8 ? ROJO : "#F6B24B" }} />
      </div>
      <div style={{ position: "absolute", left: 120, top: 420, width: 200, height: 0, borderTop: `8px dashed ${ROJO}`, opacity: pU }} />
      <Cartel x={610} y={440} txt="umbral: «no más de 1 día de retraso»" p={pU} tam={32} fondo="#FFE1D8" giro={-1} />
      <Cartel x={560} y={560} txt="📏 medible" p={rampa(t, M.umbrales - 0.1, 0.3)} tam={38} fondo={CREMA} giro={2} />
      <div style={{ position: "absolute", left: 100, top: 830, width: 880, fontFamily: "Sora", fontWeight: 800, color: TINTA, opacity: rampa(t, M.probabilidad - 0.4, 0.35) }}>
        <div style={{ fontSize: 36 }}>🎲 probabilidad</div>
        <div style={{ display: "flex", gap: 16, marginTop: 10 }}>{NIV.map((n, k) => <div key={k} style={{ flex: 1, textAlign: "center", fontSize: 32, padding: "10px 0", border: `5px solid ${TINTA}`, borderRadius: 16, background: ["#E3F6EC", "#FFF4DA", "#FFE1D8"][k] }}>{n}</div>)}</div>
      </div>
      <div style={{ position: "absolute", left: 100, top: 1010, width: 880, fontFamily: "Sora", fontWeight: 800, color: TINTA, opacity: rampa(t, M.impacto - 0.4, 0.35) }}>
        <div style={{ fontSize: 36 }}>💥 impacto</div>
        <div style={{ display: "flex", gap: 16, marginTop: 10 }}>{["bajo", "medio", "alto"].map((n, k) => <div key={k} style={{ flex: 1, textAlign: "center", fontSize: 32, padding: "10px 0", border: `5px solid ${TINTA}`, borderRadius: 16, background: ["#E3F6EC", "#FFF4DA", "#FFE1D8"][k] }}>{n}</div>)}</div>
      </div>
      <Sombra x={860} y={1520} w={170} />
      <Mascota esp="hamster-gorra" x={860} y={1525} alto={260} t={t} cara="feliz" semilla={3} espejo />
    </Escena>
  );
}

/* ═════ 11 · Tu umbral ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={300} txt="⚡ tu turno" p={rampa(t, M.toca - 0.2, 0.35)} tam={60} fondo={MANGO} />
      <Cartel x={540} y={470} txt="📏 umbral: ________" p={rampa(t, M.umbral11 - 0.3, 0.3)} tam={46} fondo={CREMA} giro={-2} />
      {[0, 1, 2].map((k) => <Cartel key={k} x={200 + k * 340} y={630} txt="🗃️ ____" p={rampa(t, M.tres - 0.2 + k * 0.3, 0.3)} tam={40} fondo="#DDE3FF" giro={[-2, 2, -1][k]} />)}
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.tres, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="gato-gafas" x={790} y={1535} alto={380} t={t} cara="feliz" semilla={7} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "riesgo") return <Riesgo t={t} />;
  if (p.tipo === "definicion") return <Definicion t={t} />;
  if (p.tipo === "plan") return <Plan t={t} />;
  if (p.tipo === "categorias") return <Categorias t={t} />;
  if (p.tipo === "umbral") return <Umbral t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.feria - 0.4, "pop", 0.3); fx(M.llueve - 0.3, "whoosh", 0.25); fx(M.pedido - 0.3, "ding", 0.25);
fx(S(3) - 0.3, "whoosh", 0.4); fx(M.riesgo3 - 0.3, "toc-grave", 0.3); fx(M.mal - 0.3, "pop", 0.22); fx(M.bien - 0.3, "pop", 0.22); fx(M.amenaza - 0.35, "golpe", 0.25); fx(M.oportunidad - 0.45, "ding", 0.25);
fx(S(5) - 0.3, "whoosh", 0.4); fx(M.planificar - 0.3, "pop", 0.3); fx(M.proporcional - 0.3, "pop-suave", 0.25);
fx(S(7) - 0.3, "whoosh", 0.4); fx(M.plan7 - 0.4, "papel", 0.3); [M.estrategia, M.metodologia, M.roles, M.financiamiento, M.calendario].forEach((w) => fx(w - 0.4, "pop-suave", 0.22));
fx(S(8) - 0.3, "whoosh", 0.4); fx(M.categorias - 0.4, "pop", 0.3);
fx(S(9) - 0.3, "whoosh", 0.4); fx(M.umbrales - 0.4, "tiza", 0.25); fx(M.probabilidad - 0.4, "pop", 0.22); fx(M.impacto - 0.4, "pop", 0.22);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/calle.jpg", "art/oficina.jpg"];
const CLAVE = /^(riesgo|riesgos|amenaza|oportunidad|plan|categorías|apetito|umbrales|umbral|probabilidad|impacto)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP39 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp39-plan-riesgos.mp3" sinSonido={sinSonido} />
);
