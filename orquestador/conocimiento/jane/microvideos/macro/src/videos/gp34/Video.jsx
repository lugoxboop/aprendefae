/*
 * Gestión de Proyectos · GP-34 «¿Cuánto y cuándo?» (gp34-presupuesto).
 * Una idea: Determinar el Presupuesto es sumar los costos estimados de las actividades o paquetes
 * de trabajo para establecer una línea base de costos autorizada (7.3, p. 248). Agregación:
 * actividades → paquetes de trabajo → cuentas de control → línea base, con reservas para
 * contingencias (gráfico 7-8, p. 255). La línea base solo cambia con control formal de cambios y
 * suele verse como curva en S (7.3.3.1). Reserva de gestión aparte; línea base + reserva de gestión
 * = presupuesto (p. 255). Requisitos de financiamiento, a menudo por tramos (7.3.2.6, 7.3.3.2).
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Dicho, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3] });
const { S, E, W } = T;

const M = {
  cuanto: W(1, "«¿Cuánto", 0.25), cuando1: W(1, "cuándo?»", 0.9),
  numero: W(2, "número:", 0.5), presupuesto2: W(2, "presupuesto.", 0.95),
  determinar: W(3, "Determinar", 0.05), sumar: W(3, "sumar", 0.25), linea3: W(3, "línea", 0.75), autorizada: W(3, "autorizada.", 0.95),
  actividades: W(4, "actividades", 0.08), paquetes: W(4, "paquetes", 0.25), cuentas: W(4, "cuentas", 0.55), linea4: W(4, "línea", 0.85),
  nivel: W(5, "nivel", 0.2), reservas: W(5, "reservas", 0.6),
  aprobada: W(6, "aprobada", 0.2), control6: W(6, "control", 0.75), cambios: W(6, "cambios.", 0.95),
  tiempo7: W(7, "tiempo,", 0.25), curva: W(7, "curva", 0.8),
  aparte: W(8, "Aparte", 0.05), gestion8: W(8, "gestión,", 0.3), previsto: W(8, "previsto", 0.5), nadie: W(8, "nadie", 0.85),
  linea9: W(9, "Línea", 0.05), mas9: W(9, "más", 0.2), presupuesto9: W(9, "presupuesto", 0.8),
  requisitos: W(10, "requisitos", 0.25), cuanto10: W(10, "cuánto", 0.55), cuando10: W(10, "cuándo,", 0.7), tramos: W(10, "tramos.", 0.95),
  toca: W(11, "toca:", 0.15), arma: W(11, "arma", 0.3), proyecto11: W(11, "proyecto.", 0.95),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "definicion", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "piramide", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "curva", desde: S(6) - 0.3, entra: "barrido-izq" },
  { tipo: "pila", desde: S(8) - 0.3, entra: "barrido" },
  { tipo: "fondos", desde: S(10) - 0.3, entra: "barrido-izq" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

const caja = (x, y, w, h, fondo, op, txt, tam) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, background: fondo, border: `6px solid ${TINTA}`, borderRadius: 18, boxSizing: "border-box", opacity: op, transform: `scale(${0.6 + 0.4 * sale(clamp01(op))})`, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: tam, color: TINTA, lineHeight: 1.1 }}>{txt}</div>
);

/* ═════ 1–2 · ¿Cuánto y cuándo? ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(5px)" velo={0.15}>
      <Dicho x={150} y={260} w={780} h={220} colaX={760} p={rampa(t, M.cuanto - 0.5, 0.4)}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 30px", fontFamily: "Sora", fontWeight: 800, fontSize: 46, color: TINTA, lineHeight: 1.15 }}>«¿Cuánto dinero necesito tener… y cuándo?»</div>
      </Dicho>
      <Gigante x={330} y={700} txt="💰" p={rampa(t, M.cuanto, 0.35)} tam={150} />
      <Gigante x={750} y={700} txt="⏳" p={rampa(t, M.cuando1 - 0.2, 0.35)} tam={150} />
      <Cartel x={540} y={960} txt="no basta un número: 🧾 presupuesto" p={rampa(t, M.presupuesto2 - 0.6, 0.35)} tam={44} fondo={MANGO} giro={-2} />
      <Sombra x={250} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={250} y={1515} alto={360} t={t} cara={t > M.presupuesto2 - 0.6 ? "feliz" : "tranquila"} cab={5 * Math.sin(t * 3)} semilla={3} />
      <Sombra x={830} y={1510} w={210} />
      <Mascota esp="gato-gafas" x={830} y={1515} alto={400} t={t} cara="tranquila" bi={-40 * pulso(t, M.cuanto - 0.3, 1.0)} semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 3 · Qué es ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3), b: E(3) + 0.3, s: 1.03, x: 540, y: 955 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={260} txt="determinar el presupuesto" p={rampa(t, M.determinar - 0.3, 0.35)} tam={58} fondo={MANGO} />
      <Cartel x={540} y={450} txt="➕ sumar los costos estimados" p={rampa(t, M.sumar - 0.35, 0.35)} tam={46} fondo={CREMA} giro={-1} />
      <Gigante x={540} y={600} txt="⬇️" p={rampa(t, M.sumar, 0.3)} tam={80} />
      <Cartel x={540} y={760} txt="📏 línea base de costos" p={rampa(t, M.linea3 - 0.35, 0.35)} tam={54} fondo="#DDE3FF" giro={1} />
      <Cartel x={540} y={900} txt="✅ autorizada" p={rampa(t, M.autorizada - 0.4, 0.35)} tam={44} fondo="#E3F6EC" giro={-2} />
      <Sombra x={540} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara={t > M.autorizada ? "estrellas" : "feliz"} semilla={3} />
    </Escena>
  );
}

/* ═════ 4–5 · De actividades a línea base ═════ */
function Piramide({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(5), b: E(5), s: 1.02, x: 540, y: 960 }]);
  const pA = rampa(t, M.actividades - 0.3, 0.35), pP = rampa(t, M.paquetes - 0.3, 0.35), pC = rampa(t, M.cuentas - 0.3, 0.35), pL = rampa(t, M.linea4 - 0.3, 0.35);
  const pR = rampa(t, M.reservas - 0.4, 0.35);
  const fila = (n, y, w, h, fondo, op, txt, tam) => Array.from({ length: n }, (_, k) => <div key={k}>{caja(540 + (k - (n - 1) / 2) * (w + 16) - 70, y, w, h, fondo, op, txt, tam)}</div>);
  const chip = (y, d) => <Cartel x={920} y={y} txt="+🛟" p={clamp01((t - (M.reservas - 0.4 + d)) / 0.3)} tam={38} fondo="#E3F6EC" giro={3} />;
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      {fila(1, 260, 480, 110, "#DDE3FF", pL, "📏 línea base de costos", 38)}
      {fila(2, 470, 270, 110, MANGO, pC, "cuenta de control", 32)}
      {fila(3, 680, 190, 110, CREMA, pP, "paquete", 32)}
      {fila(6, 890, 92, 90, "#FFFDF7", pA, "🔨", 40)}
      <div style={{ position: "absolute", left: 30, top: 970, fontFamily: "Sora", fontWeight: 800, fontSize: 32, color: TINTA, opacity: pA }}>actividades</div>
      {[365, 575, 785].map((y, k) => <Gigante key={k} x={470} y={y} txt="⬆️" p={[pL, pC, pP][k]} tam={50} />)}
      {chip(260, 0.45)}{chip(470, 0.3)}{chip(680, 0.15)}{chip(890, 0)}
      <Cartel x={540} y={1110} txt="🛟 reservas para contingencias en cada nivel" p={pR} tam={36} fondo="#E3F6EC" />
      <Sombra x={540} y={1530} w={190} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={260} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 6–7 · Aprobada y en curva S ═════ */
function Curva({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(7), b: E(7), s: 1.02, x: 540, y: 960 }]);
  const pC = sale(clamp01((t - (M.tiempo7 - 0.3)) / 1.6));
  const L = 1300;
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={230} txt="📏 línea base de costos" p={rampa(t, S(6) - 0.2, 0.35)} tam={50} fondo="#DDE3FF" />
      <Cartel x={330} y={380} txt="✅ aprobada" p={rampa(t, M.aprobada - 0.35, 0.35)} tam={40} fondo="#E3F6EC" giro={-2} />
      <Cartel x={750} y={380} txt="🔒 control de cambios" p={rampa(t, M.control6 - 0.35, 0.35)} tam={36} fondo={CREMA} giro={2} />
      <div style={{ position: "absolute", left: 120, top: 480, width: 840, height: 560, background: "#FFFDF7", border: `6px solid ${TINTA}`, borderRadius: 20, opacity: rampa(t, M.tiempo7 - 0.5, 0.3) }}>
        <svg width="840" height="560" style={{ position: "absolute", left: 0, top: 0 }}>
          <line x1="80" y1="480" x2="790" y2="480" stroke={TINTA} strokeWidth="6" />
          <line x1="80" y1="480" x2="80" y2="50" stroke={TINTA} strokeWidth="6" />
          <path d="M 80 470 C 300 470, 330 430, 430 270 S 600 70, 780 70" fill="none" stroke={AZUL} strokeWidth="14" strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - pC)} />
        </svg>
        <div style={{ position: "absolute", left: 560, top: 495, fontFamily: "Sora", fontWeight: 800, fontSize: 30, color: TINTA }}>tiempo ➡️</div>
        <div style={{ position: "absolute", left: 20, top: 10, fontFamily: "Sora", fontWeight: 800, fontSize: 30, color: TINTA }}>💲</div>
      </div>
      <Cartel x={640} y={760} txt="curva en S" p={rampa(t, M.curva - 0.35, 0.35)} tam={50} fondo={MANGO} giro={-3} />
      <Sombra x={170} y={1510} w={170} />
      <Mascota esp="hamster-gorra" x={170} y={1515} alto={260} t={t} cara="feliz" semilla={3} />
      <Sombra x={910} y={1510} w={170} />
      <Mascota esp="gato-gafas" x={910} y={1515} alto={280} t={t} cara={t > M.curva ? "estrellas" : "tranquila"} semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 8–9 · Reserva de gestión y presupuesto ═════ */
function Pila({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(9), b: E(9), s: 1.02, x: 540, y: 960 }]);
  const pB = rampa(t, S(8) - 0.2, 0.4), pG = rampa(t, M.aparte - 0.2, 0.45), pT = rampa(t, M.presupuesto9 - 0.4, 0.4);
  const caeG = lerp(-300, 0, sale(pG));
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      {caja(400, 830, 420, 420, "#DDE3FF", pB, "📏 línea base de costos", 44)}
      <div style={{ position: "absolute", left: 0, top: caeG, width: 1080, height: 1920 }}>{caja(400, 530, 420, 180, MANGO, pG, "🧰 reserva de gestión", 40)}</div>
      <Cartel x={830} y={420} txt="trabajo no previsto" p={rampa(t, M.previsto - 0.35, 0.35)} tam={34} fondo={CREMA} giro={3} />
      <Cartel x={830} y={540} txt="🙈 nadie lo vio venir" p={rampa(t, M.nadie - 0.35, 0.35)} tam={34} fondo="#FFE1D8" giro={-2} />
      <div style={{ position: "absolute", left: 640, top: 440, width: 24, height: 600, borderRight: `8px solid ${TINTA}`, borderTop: `8px solid ${TINTA}`, borderBottom: `8px solid ${TINTA}`, borderRadius: "0 30px 30px 0", opacity: pT }} />
      <Cartel x={850} y={780} txt="🧾 presupuesto" p={pT} tam={46} fondo={MANGO} giro={-3} />
      <Cartel x={400} y={1150} txt="línea base + reserva de gestión" p={rampa(t, M.mas9 - 0.3, 0.35)} tam={36} fondo={CREMA} />
      <Sombra x={860} y={1510} w={180} />
      <Mascota esp="hamster-gorra" x={860} y={1515} alto={280} t={t} cara={t > M.presupuesto9 ? "estrellas" : "feliz"} semilla={3} espejo />
    </Escena>
  );
}

/* ═════ 10 · Financiamiento por tramos ═════ */
function Fondos({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const H = [180, 330, 480];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={240} txt="💵 requisitos de financiamiento" p={rampa(t, M.requisitos - 0.35, 0.35)} tam={48} fondo={MANGO} />
      <Cartel x={330} y={390} txt="💰 cuánto" p={rampa(t, M.cuanto10 - 0.3, 0.3)} tam={42} fondo={CREMA} giro={-2} />
      <Cartel x={750} y={390} txt="⏳ cuándo" p={rampa(t, M.cuando10 - 0.3, 0.3)} tam={42} fondo={CREMA} giro={2} />
      <div style={{ position: "absolute", left: 140, top: 1060, width: 800, height: 8, background: TINTA, opacity: rampa(t, M.cuando10, 0.3) }} />
      {H.map((h, k) => {
        const p = clamp01((t - (M.tramos - 1.0 + k * 0.35)) / 0.3);
        return <div key={k}>{caja(270 + k * 270, 1060 - (h * sale(p)) / 2, 200, Math.max(1, h * sale(p)), "#E3F6EC", p, `tramo ${k + 1}`, 32)}</div>;
      })}
      <Sombra x={540} y={1530} w={190} />
      <Mascota esp="gato-gafas" x={540} y={1535} alto={280} t={t} cara={t > M.tramos ? "feliz" : "tranquila"} semilla={7} />
    </Escena>
  );
}

/* ═════ 11 · Tu línea base ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={320} txt="⚡ arma tu línea base" p={rampa(t, M.toca - 0.2, 0.35)} tam={60} fondo={MANGO} />
      <Cartel x={540} y={500} txt="📦 paquetes  ➕  🛟 contingencias" p={rampa(t, M.arma - 0.2, 0.3)} tam={42} fondo={CREMA} giro={-2} />
      <Cartel x={540} y={640} txt="📏 = ________" p={rampa(t, M.proyecto11 - 0.6, 0.3)} tam={50} fondo={CREMA} giro={2} />
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
  if (p.tipo === "piramide") return <Piramide t={t} />;
  if (p.tipo === "curva") return <Curva t={t} />;
  if (p.tipo === "pila") return <Pila t={t} />;
  if (p.tipo === "fondos") return <Fondos t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.cuanto - 0.5, "pop", 0.35); fx(M.cuanto, "monedas", 0.25); fx(M.presupuesto2 - 0.6, "toc-grave", 0.3);
fx(S(3) - 0.3, "whoosh", 0.4); fx(M.sumar - 0.35, "pop", 0.3); fx(M.linea3 - 0.35, "pop", 0.3); fx(M.autorizada - 0.4, "sello", 0.35);
fx(S(4) - 0.3, "whoosh", 0.4); [M.actividades, M.paquetes, M.cuentas, M.linea4].forEach((w) => fx(w - 0.3, "pop-suave", 0.25)); fx(M.reservas - 0.4, "ding", 0.25);
fx(S(6) - 0.3, "whoosh", 0.4); fx(M.aprobada - 0.35, "sello", 0.3); fx(M.control6 - 0.35, "crujido", 0.25); fx(M.tiempo7 - 0.3, "tiza-larga", 0.25);
fx(S(8) - 0.3, "whoosh", 0.4); fx(M.aparte, "golpe", 0.3); fx(M.presupuesto9 - 0.4, "ding-doble", 0.3);
fx(S(10) - 0.3, "whoosh", 0.4); fx(M.requisitos - 0.35, "pop", 0.3); [0, 1, 2].forEach((k) => fx(M.tramos - 1.0 + k * 0.35, "monedas", 0.2));
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/oficina.jpg"];
const CLAVE = /^(presupuesto|línea|base|costos|contingencias|reserva|gestión|financiamiento|tramos)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP34 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp34-presupuesto.mp3" sinSonido={sinSonido} />
);
