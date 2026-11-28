/*
 * Gestión de Proyectos · GP-42 «¿Qué tan probable es llegar?» (gp42-cuantitativo).
 * Una idea: Realizar el Análisis Cuantitativo de Riesgos es analizar numéricamente el efecto
 * combinado de los riesgos individuales y otras fuentes de incertidumbre sobre los objetivos del
 * proyecto; no se requiere en todos los proyectos (11.4, p. 428). Simulación de Monte Carlo, curva S
 * (Gráfico 11-13: 23 % de probabilidad de cumplir la meta de costo), análisis de sensibilidad con
 * diagrama de tornado, árbol de decisiones (11.4.2.5). Actualiza el informe de riesgos, incluida la
 * reserva para contingencias necesaria (11.4.3.1, p. 435).
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, Dicho, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3] });
const { S, E, W } = T;

const M = {
  probabilidad1: W(1, "probabilidad", 0.35), tiempo1: W(1, "tiempo", 0.6), presupuesto1: W(1, "presupuesto", 0.85),
  matriz2: W(2, "matriz", 0.25), numero: W(2, "número.", 0.95),
  realizar: W(3, "Realizar", 0.05), numericamente: W(3, "numéricamente", 0.3), combinado: W(3, "combinado", 0.45), incertidumbre: W(3, "incertidumbre", 0.75), objetivos: W(3, "objetivos", 0.9),
  todos4: W(4, "todos", 0.6),
  simulacion: W(5, "simulación", 0.25), miles: W(5, "miles", 0.7), azar: W(5, "azar.", 0.95),
  curva: W(6, "curva", 0.2), costo6: W(6, "costo,", 0.65), fecha: W(6, "fecha.", 0.95),
  veintitres: W(7, "veintitrés", 0.35), meta: W(7, "meta", 0.85),
  sensibilidad: W(8, "sensibilidad", 0.2), pesan: W(8, "pesan", 0.55), tornado: W(8, "tornado.", 0.95),
  arbol: W(9, "árbol", 0.2), caminos: W(9, "caminos", 0.55), esperado: W(9, "esperado.", 0.95),
  informe: W(10, "informe", 0.35), reserva: W(10, "reserva", 0.7),
  toca: W(11, "toca:", 0.15), riesgo11: W(11, "riesgo", 0.4), fecha11: W(11, "fecha", 0.7),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "definicion", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "simulacion", desde: S(5) - 0.3, entra: "zoom" },
  { tipo: "tornado", desde: S(8) - 0.3, entra: "barrido-izq" },
  { tipo: "informe", desde: S(10) - 0.3, entra: "barrido" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

const ALT = [2, 4, 7, 11, 15, 17, 15, 11, 7, 4, 2];

/* ═════ 1–2 · ¿Qué probabilidad? ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  const pM = rampa(t, M.matriz2 - 0.3, 0.35);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(5px)" velo={0.15}>
      <Dicho x={120} y={220} w={840} h={220} colaX={260} p={rampa(t, M.probabilidad1 - 0.6, 0.4)}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 30px", fontFamily: "Sora", fontWeight: 800, fontSize: 42, color: TINTA, lineHeight: 1.15 }}>«¿qué probabilidad hay de terminar 📅 a tiempo y 💲 con el presupuesto?»</div>
      </Dicho>
      <div style={{ position: "absolute", left: 380, top: 560, width: 320, height: 320, opacity: pM, transform: `scale(${0.8 + 0.2 * sale(pM)})` }}>
        {[0, 1, 2].map((f) => [0, 1, 2].map((k) => <div key={f + "-" + k} style={{ position: "absolute", left: k * 108, top: f * 108, width: 100, height: 100, borderRadius: 12, border: `5px solid ${TINTA}`, boxSizing: "border-box", background: [["#FFF4DA", "#FFD8B0", "#FF9E9E"], ["#E3F6EC", "#FFF4DA", "#FFD8B0"], ["#C9EFD8", "#E3F6EC", "#FFF4DA"]][f][k] }} />))}
      </div>
      <Cartel x={540} y={960} txt="❓ ¿y el porcentaje?" p={rampa(t, M.numero - 0.5, 0.35)} tam={48} fondo="#FFE1D8" giro={-2} />
      <Sombra x={220} y={1510} w={190} />
      <Mascota esp="perro-corbatin" x={220} y={1515} alto={370} t={t} cara="tranquila" bi={-40 * pulso(t, M.probabilidad1 - 0.3, 1)} semilla={9} />
      <Sombra x={850} y={1510} w={190} />
      <Mascota esp="hamster-gorra" x={850} y={1515} alto={330} t={t} cara={t > M.numero - 0.5 ? "triste" : "tranquila"} semilla={3} espejo />
    </Escena>
  );
}

/* ═════ 3–4 · Qué es ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(4), b: E(4) + 0.3, s: 1.03, x: 540, y: 955 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={250} txt="realizar el análisis cuantitativo de riesgos" p={rampa(t, M.realizar - 0.3, 0.35)} tam={40} fondo={MANGO} />
      <Cartel x={540} y={420} txt="🔢 analizar numéricamente" p={rampa(t, M.numericamente - 0.35, 0.35)} tam={46} fondo={CREMA} giro={-1} />
      <Cartel x={540} y={550} txt="🧩 el efecto combinado de los riesgos" p={rampa(t, M.combinado - 0.35, 0.35)} tam={40} fondo={CREMA} giro={1} />
      <Cartel x={540} y={680} txt="🌫️ + otras fuentes de incertidumbre" p={rampa(t, M.incertidumbre - 0.35, 0.35)} tam={40} fondo="#DDE3FF" giro={-1} />
      <Cartel x={540} y={860} txt="no se requiere en todos los proyectos" p={rampa(t, M.todos4 - 0.4, 0.35)} tam={38} fondo="#FFE1D8" giro={2} />
      <Sombra x={540} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 5–7 · Monte Carlo y curva S ═════ */
function Simulacion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(7), b: E(7), s: 1.02, x: 540, y: 960 }]);
  const pS = rampa(t, M.simulacion - 0.35, 0.35);
  const crece = sale(clamp01((t - M.miles + 0.4) / 2.0));
  const n = Math.round(lerp(1, 5000, crece));
  const pC = rampa(t, S(6) - 0.3, 0.35), dib = sale(clamp01((t - M.curva + 0.2) / 1.6)), L = 1200;
  const pV = rampa(t, M.veintitres - 0.4, 0.35);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={210} txt="🎲 simulación de Monte Carlo" p={pS} tam={46} fondo={MANGO} />
      <div style={{ opacity: 1 - pC }}>
        <Cartel x={540} y={340} txt={`🔁 ${n.toLocaleString("es")} veces`} p={rampa(t, M.miles - 0.4, 0.3)} tam={46} fondo={CREMA} />
        <div style={{ position: "absolute", left: 160, top: 470, width: 760, height: 460, borderBottom: `8px solid ${TINTA}`, opacity: pS }}>
          {ALT.map((h, k) => <div key={k} style={{ position: "absolute", left: k * 68, bottom: 0, width: 58, height: h * 24 * crece, background: AZUL, border: `4px solid ${TINTA}`, borderBottom: "none", borderRadius: "8px 8px 0 0", boxSizing: "border-box" }} />)}
        </div>
        <Cartel x={540} y={1010} txt="valores al azar en cada vuelta" p={rampa(t, M.azar - 0.5, 0.3)} tam={36} fondo="#DDE3FF" />
      </div>
      {pC > 0 && (
        <div style={{ opacity: pC }}>
          <div style={{ position: "absolute", left: 110, top: 320, width: 860, height: 640, background: "#FFFDF7", border: `6px solid ${TINTA}`, borderRadius: 20 }}>
            <svg width="860" height="640" style={{ position: "absolute", left: 0, top: 0 }}>
              <line x1="90" y1="560" x2="820" y2="560" stroke={TINTA} strokeWidth="6" />
              <line x1="90" y1="560" x2="90" y2="50" stroke={TINTA} strokeWidth="6" />
              <path d="M 90 550 C 330 550, 360 500, 450 300 S 600 70, 810 70" fill="none" stroke={AZUL} strokeWidth="14" strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - dib)} />
              <line x1="380" y1="560" x2="380" y2="440" stroke={ROJO} strokeWidth="6" strokeDasharray="14 10" opacity={pV} />
              <line x1="90" y1="440" x2="380" y2="440" stroke={ROJO} strokeWidth="6" strokeDasharray="14 10" opacity={pV} />
            </svg>
            <div style={{ position: "absolute", left: 20, top: 10, fontFamily: "Sora", fontWeight: 800, fontSize: 28, color: TINTA }}>probabilidad</div>
            <div style={{ position: "absolute", left: 560, top: 580, fontFamily: "Sora", fontWeight: 800, fontSize: 28, color: TINTA }}>costo total ➡️</div>
            <div style={{ position: "absolute", left: 320, top: 575, fontFamily: "Sora", fontWeight: 800, fontSize: 28, color: ROJO, opacity: pV }}>🎯 meta</div>
          </div>
          <Cartel x={640} y={560} txt="curva en S" p={rampa(t, M.curva - 0.3, 0.3)} tam={44} fondo={MANGO} giro={-3} />
          <Cartel x={440} y={1060} txt="23 % de cumplir la meta" p={pV} tam={44} fondo="#FFE1D8" giro={-2} />
        </div>
      )}
      <Sombra x={910} y={1520} w={150} />
      <Mascota esp="perro-corbatin" x={910} y={1525} alto={240} t={t} cara={t > M.meta ? "triste" : "tranquila"} semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 8–9 · Tornado y árbol de decisiones ═════ */
function Tornado({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(9), b: E(9), s: 1.02, x: 540, y: 960 }]);
  const B = [["🔥 horno", 300], ["🌾 precio harina", 230], ["🌧️ lluvia", 160], ["👥 ayudante", 100]];
  const pT = rampa(t, M.sensibilidad - 0.35, 0.35), pA = rampa(t, M.arbol - 0.35, 0.35);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={200} txt="análisis de sensibilidad" p={pT} tam={46} fondo={MANGO} />
      {B.map(([txt, w], k) => {
        const q = sale(clamp01((t - (M.pesan - 0.4 + k * 0.2)) / 0.4));
        return (
          <div key={k}>
            <div style={{ position: "absolute", left: 640 - w * q, top: 300 + k * 95, width: 2 * w * q, height: 70, background: k === 0 ? "#FF9E9E" : "#DDE3FF", border: `5px solid ${TINTA}`, borderRadius: 12, boxSizing: "border-box" }} />
            <div style={{ position: "absolute", left: 30, top: 315 + k * 95, width: 300, fontFamily: "Sora", fontWeight: 800, fontSize: 30, color: TINTA, opacity: q, textAlign: "left" }}>{txt}</div>
          </div>
        );
      })}
      <Cartel x={640} y={710} txt="🌪️ diagrama de tornado" p={rampa(t, M.tornado - 0.5, 0.3)} tam={38} fondo={CREMA} giro={-1} />
      <svg width="1080" height="1920" style={{ position: "absolute", left: 0, top: 0, opacity: pA }}>
        <line x1="250" y1="960" x2="520" y2="880" stroke={TINTA} strokeWidth="6" />
        <line x1="250" y1="960" x2="520" y2="1050" stroke={TINTA} strokeWidth="6" />
      </svg>
      <div style={{ position: "absolute", left: 180, top: 920, width: 80, height: 80, background: MANGO, border: `6px solid ${TINTA}`, opacity: pA }} />
      <Cartel x={720} y={870} txt="camino A: valor monetario esperado" p={rampa(t, M.caminos - 0.3, 0.3)} tam={32} fondo="#E3F6EC" />
      <Cartel x={720} y={1050} txt="camino B: valor monetario esperado" p={rampa(t, M.caminos, 0.3)} tam={32} fondo="#E3F6EC" />
      <Cartel x={300} y={1150} txt="🌳 árbol de decisiones" p={pA} tam={38} fondo={CREMA} giro={2} />
      <Sombra x={900} y={1530} w={150} />
      <Mascota esp="hamster-gorra" x={900} y={1535} alto={230} t={t} cara="feliz" semilla={3} espejo />
    </Escena>
  );
}

/* ═════ 10 · Informe de riesgos ═════ */
function Informe({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10) + 0.3, s: 1.03, x: 540, y: 955 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Documento x={540} y={420} w={330} p={rampa(t, M.informe - 0.4, 0.4)} titulo="informe de riesgos" letra={38} giro={-2} />
      <Cartel x={540} y={760} txt="🔄 actualizado" p={rampa(t, M.informe, 0.3)} tam={44} fondo={CREMA} giro={2} />
      <Cartel x={540} y={900} txt="🛟 reserva para contingencias necesaria" p={rampa(t, M.reserva - 0.4, 0.35)} tam={36} fondo="#E3F6EC" giro={-1} />
      <Sombra x={540} y={1520} w={190} />
      <Mascota esp="perro-corbatin" x={540} y={1525} alto={290} t={t} cara="feliz" semilla={9} />
    </Escena>
  );
}

/* ═════ 11 · Tu riesgo más pesado ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={300} txt="⚡ tu turno" p={rampa(t, M.toca - 0.2, 0.35)} tam={60} fondo={MANGO} />
      <Cartel x={540} y={480} txt="🌪️ el riesgo que más mueve" p={rampa(t, M.riesgo11 - 0.3, 0.3)} tam={44} fondo={CREMA} giro={-2} />
      <Cartel x={540} y={620} txt="📅 tu fecha: ________" p={rampa(t, M.fecha11 - 0.3, 0.3)} tam={46} fondo={CREMA} giro={2} />
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.fecha11, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="perro-corbatin" x={790} y={1535} alto={380} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "definicion") return <Definicion t={t} />;
  if (p.tipo === "simulacion") return <Simulacion t={t} />;
  if (p.tipo === "tornado") return <Tornado t={t} />;
  if (p.tipo === "informe") return <Informe t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.probabilidad1 - 0.6, "pop", 0.3); fx(M.matriz2 - 0.3, "pop-suave", 0.25); fx(M.numero - 0.5, "toc-grave", 0.3);
fx(S(3) - 0.3, "whoosh", 0.4); [M.numericamente, M.combinado, M.incertidumbre].forEach((w) => fx(w - 0.35, "pop-suave", 0.22)); fx(M.todos4 - 0.4, "pop", 0.25);
fx(S(5) - 0.3, "whoosh", 0.4); fx(M.miles - 0.4, "rebobina", 0.25); fx(M.curva - 0.2, "tiza-larga", 0.25); fx(M.veintitres - 0.4, "golpe", 0.3);
fx(S(8) - 0.3, "whoosh", 0.4); [0, 1, 2, 3].forEach((k) => fx(M.pesan - 0.4 + k * 0.2, "desliza", 0.18)); fx(M.arbol - 0.35, "pop", 0.25);
fx(S(10) - 0.3, "whoosh", 0.4); fx(M.informe - 0.4, "papel", 0.3); fx(M.reserva - 0.4, "ding", 0.22);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/oficina.jpg"];
const CLAVE = /^(cuantitativo|numéricamente|Monte|Carlo|curva|sensibilidad|tornado|árbol|informe|reserva)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP42 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp42-cuantitativo.mp3" sinSonido={sinSonido} />
);
