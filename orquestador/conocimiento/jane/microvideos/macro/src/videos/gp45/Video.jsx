/*
 * Gestión de Proyectos · GP-45 «¿Cómo sumo a Don Tito?» (gp45-involucramiento).
 * Una idea: Planificar el Involucramiento de los Interesados es desarrollar enfoques para involucrar a
 * los interesados con base en sus necesidades, expectativas, intereses y el posible impacto (13.2, p. 516).
 * Matriz de evaluación del involucramiento: desconocedor, reticente, neutral, de apoyo, líder; C = actual,
 * D = deseado; la brecha determina el nivel de comunicaciones necesario (13.2.2.5, p. 521–522).
 * Plan de involucramiento de los interesados: estrategias y acciones; formal o informal (13.2.3.1, p. 522).
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3] });
const { S, E, W } = T;

const M = {
  tito: W(1, "Tito,", 0.1), dueno: W(1, "dueño", 0.2), nada: W(1, "nada", 0.45), permiso: W(1, "permiso", 0.85), clave1: W(1, "clave.", 0.97),
  suma: W(2, "suma", 0.5),
  planificar: W(3, "Planificar", 0.05), necesidades: W(3, "necesidades,", 0.6), expectativas: W(3, "expectativas,", 0.68), intereses: W(3, "intereses", 0.76), impacto: W(3, "impacto", 0.92),
  matriz: W(4, "matriz", 0.6),
  desc: W(5, "desconocedor,", 0.35), retic: W(5, "reticente,", 0.5), neutral: W(5, "neutral,", 0.65), apoyo5: W(5, "apoyo", 0.82), lider5: W(5, "líder.", 0.97),
  hoy6: W(6, "hoy,", 0.4), deberia: W(6, "debería", 0.65),
  tito7: W(7, "desconocedor.", 0.4), apoyo7: W(7, "apoyo.", 0.95),
  brecha8: W(8, "brecha", 0.1), comunicacion: W(8, "comunicación", 0.45),
  lider9: W(9, "líder:", 0.4), nohay: W(9, "brecha.", 0.95),
  plan10: W(10, "plan", 0.1), estrategias: W(10, "estrategias", 0.5), acciones: W(10, "acciones", 0.6), formal: W(10, "formal", 0.85), informal: W(10, "informal.", 0.97),
  toca: W(11, "toca:", 0.15), tres: W(11, "tres", 0.3), actual: W(11, "actual", 0.85), deseado: W(11, "deseado.", 0.97),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "definicion", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "matriz", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "plan", desde: S(10) - 0.3, entra: "barrido-izq" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* ═════ 1–2 · Don Tito no sabe nada ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(5px)" velo={0.15}>
      <Cartel x={540} y={260} txt="🏠 Don Tito, dueño del local" p={rampa(t, M.dueno - 0.3, 0.35)} tam={44} fondo={CREMA} giro={-2} />
      <Gigante x={760} y={520} txt="❓" p={rampa(t, M.nada - 0.3, 0.35)} tam={150} />
      <Cartel x={330} y={520} txt="¿feria? 🤷" p={rampa(t, M.nada - 0.2, 0.3)} tam={46} fondo="#FFFDF7" giro={3} />
      <Cartel x={540} y={760} txt="🔑 su permiso es clave" p={rampa(t, M.permiso - 0.3, 0.35)} tam={48} fondo={MANGO} giro={-1} />
      <Cartel x={540} y={920} txt="¿cómo lo sumo?" p={rampa(t, M.suma - 0.4, 0.3)} tam={44} fondo="#DDE3FF" giro={2} />
      <Sombra x={260} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={260} y={1515} alto={340} t={t} cara={t > M.permiso ? "tranquila" : "feliz"} cab={8 * Math.sin(t * 2.5)} semilla={3} />
      <Sombra x={820} y={1510} w={200} />
      <Mascota esp="perro-mochila" x={820} y={1515} alto={370} t={t} cara="tranquila" cab={-6 * pulso(t, M.nada, 1.2)} semilla={5} espejo />
    </Escena>
  );
}

/* ═════ 3 · Qué es ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3), b: E(3) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const C = [[M.necesidades, "🧺 necesidades"], [M.expectativas, "🌟 expectativas"], [M.intereses, "💡 intereses"], [M.impacto, "💥 posible impacto"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={230} txt="planificar el involucramiento de los interesados" p={rampa(t, M.planificar - 0.3, 0.35)} tam={34} fondo={MANGO} />
      <Cartel x={540} y={380} txt="🧭 enfoques para involucrarlos" p={rampa(t, M.planificar + 1.2, 0.35)} tam={44} fondo={CREMA} giro={-1} />
      <Cartel x={540} y={510} txt="con base en sus…" p={rampa(t, M.necesidades - 0.8, 0.3)} tam={36} fondo="#FFFDF7" />
      {C.map(([tw, txt], k) => <Cartel key={k} x={k % 2 ? 770 : 310} y={650 + Math.floor(k / 2) * 130} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={40} fondo="#DDE3FF" giro={[-2, 2, 1, -1][k]} />)}
      <Sombra x={260} y={1510} w={170} />
      <Mascota esp="hamster-gorra" x={260} y={1515} alto={280} t={t} cara="feliz" semilla={3} />
      <Sombra x={820} y={1510} w={170} />
      <Mascota esp="perro-mochila" x={820} y={1515} alto={300} t={t} cara="tranquila" semilla={5} espejo />
    </Escena>
  );
}

/* ═════ 4–9 · Matriz de evaluación del involucramiento ═════ */
const NIV = ["líder", "de apoyo", "neutral", "reticente", "desconocedor"]; // de arriba abajo
const TOP = 330, FH = 140, X0 = 60, XL = 440, CW = 270;
const yFila = (i) => TOP + i * FH;
function Marca({ cx, cy, letra, p, punteado }) {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: cx - 44, top: cy - 44, width: 88, height: 88, borderRadius: "50%", background: punteado ? "#FFFDF7" : ROJO, border: `7px ${punteado ? "dashed" : "solid"} ${punteado ? AZUL : TINTA}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 46, color: punteado ? AZUL : "#fff", transform: `scale(${rebote(Math.min(1, p))})` }}>{letra}</div>
  );
}
function Matriz({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(7), b: E(9), s: 1.03, x: 540, y: 940 }]);
  const pM = rampa(t, M.matriz - 0.4, 0.4);
  const tiempos = [M.lider5, M.apoyo5, M.neutral, M.retic, M.desc];
  const c1 = XL + CW / 2, c2 = XL + CW + CW / 2;
  const pB = rampa(t, M.brecha8 - 0.3, 0.5);
  const yC = yFila(4) + FH / 2, yD = yFila(1) + FH / 2;
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={130} txt="matriz de evaluación del involucramiento" p={pM} tam={34} fondo={MANGO} />
      {/* cabecera */}
      <div style={{ position: "absolute", left: XL, top: TOP - 100, width: CW * 2, height: 90, display: "flex", opacity: pM, fontFamily: "Sora", fontWeight: 800, fontSize: 34, color: TINTA }}>
        {["🐶 Don Tito", "🐶 Ramón"].map((n, k) => <div key={k} style={{ width: CW, display: "flex", alignItems: "center", justifyContent: "center", background: k ? "#E3F6EC" : "#FFE1D8", border: `5px solid ${TINTA}`, borderRadius: 18, margin: "0 6px" }}>{n}</div>)}
      </div>
      {NIV.map((n, i) => {
        const q = rampa(t, tiempos[i] - 0.35, 0.3);
        if (q <= 0) return null;
        return (
          <div key={n} style={{ position: "absolute", left: X0, top: yFila(i), width: XL - X0 + CW * 2, height: FH - 10, display: "flex", transform: `scale(${rebote(q)})`, transformOrigin: "0 50%" }}>
            <div style={{ width: XL - X0 - 10, display: "flex", alignItems: "center", paddingLeft: 20, boxSizing: "border-box", background: CREMA, border: `5px solid ${TINTA}`, borderRadius: 16, fontFamily: "Sora", fontWeight: 800, fontSize: 42, color: TINTA }}>{n}</div>
            {[0, 1].map((k) => <div key={k} style={{ width: CW - 12, margin: "0 6px 0 " + (k ? 6 : 16) + "px", background: "rgba(255,253,247,.85)", border: `4px solid ${TINTA}`, borderRadius: 14 }} />)}
          </div>
        );
      })}
      {/* flecha de la brecha (Don Tito) */}
      {pB > 0 && (
        <svg width="1080" height="1920" style={{ position: "absolute", left: 0, top: 0 }}>
          <line x1={c1 + 70} y1={yC - 5} x2={c1 + 70} y2={lerp(yC - 5, yD + 50, sale(pB))} stroke={ROJO} strokeWidth="12" strokeLinecap="round" />
          {pB > 0.9 && <path d={`M ${c1 + 46} ${yD + 74} L ${c1 + 70} ${yD + 40} L ${c1 + 94} ${yD + 74}`} fill="none" stroke={ROJO} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />}
        </svg>
      )}
      <Marca cx={c1 - 20} cy={yC - 5} letra="C" p={rampa(t, M.tito7 - 0.3, 0.3)} />
      <Marca cx={c1 - 20} cy={yD - 5} letra="D" p={rampa(t, M.apoyo7 - 0.3, 0.3)} punteado />
      <Marca cx={c2 - 50} cy={yFila(0) + FH / 2 - 5} letra="C" p={rampa(t, M.lider9 - 0.4, 0.3)} />
      <Marca cx={c2 + 50} cy={yFila(0) + FH / 2 - 5} letra="D" p={rampa(t, M.lider9 - 0.2, 0.3)} punteado />
      <Cartel x={300} y={1090} txt="C = hoy" p={rampa(t, M.hoy6 - 0.3, 0.3)} tam={38} fondo="#FFE1D8" giro={-2} />
      <Cartel x={760} y={1090} txt="D = deseado" p={rampa(t, M.deberia - 0.3, 0.3)} tam={38} fondo="#DDE3FF" giro={2} />
      <Cartel x={330} y={1210} txt="🔺 brecha = más comunicación" p={rampa(t, M.comunicacion - 0.4, 0.3)} tam={32} fondo={CREMA} giro={-1} />
      <Cartel x={820} y={1210} txt="✅ sin brecha" p={rampa(t, M.nohay - 0.4, 0.3)} tam={36} fondo="#E3F6EC" giro={2} />
      <Sombra x={180} y={1530} w={150} />
      <Mascota esp="perro-mochila" x={180} y={1535} alto={240} t={t} cara={t > M.comunicacion ? "feliz" : "tranquila"} semilla={5} />
      <Sombra x={540} y={1530} w={150} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={230} t={t} cara="feliz" semilla={3} />
      <Sombra x={900} y={1530} w={150} />
      <Mascota esp="perro-corbatin" x={900} y={1535} alto={240} t={t} cara={t > M.lider9 ? "estrellas" : "feliz"} salto={30 * pulso(t, M.lider9, 0.5)} semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 10 · Plan de involucramiento ═════ */
function Plan({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10) + 0.3, s: 1.03, x: 540, y: 955 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Documento x={540} y={470} w={400} p={rampa(t, M.plan10 - 0.4, 0.4)} titulo="plan de involucramiento de los interesados" letra={34} giro={-2} />
      <Cartel x={300} y={880} txt="🎯 estrategias" p={rampa(t, M.estrategias - 0.3, 0.3)} tam={42} fondo={CREMA} giro={-2} />
      <Cartel x={780} y={880} txt="🛠️ acciones" p={rampa(t, M.acciones - 0.3, 0.3)} tam={42} fondo={CREMA} giro={2} />
      <Cartel x={540} y={1000} txt="para cada interesado" p={rampa(t, M.acciones + 0.3, 0.3)} tam={36} fondo="#FFFDF7" />
      <Cartel x={300} y={1130} txt="👔 formal" p={rampa(t, M.formal - 0.3, 0.3)} tam={40} fondo="#DDE3FF" giro={-1} />
      <Cartel x={780} y={1130} txt="👕 informal" p={rampa(t, M.informal - 0.3, 0.3)} tam={40} fondo="#DDE3FF" giro={1} />
      <Sombra x={540} y={1530} w={180} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={250} t={t} cara="estrellas" semilla={3} />
    </Escena>
  );
}

/* ═════ 11 · Tu matriz ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={280} txt="⚡ tu matriz" p={rampa(t, M.toca - 0.2, 0.35)} tam={58} fondo={MANGO} />
      {[0, 1, 2].map((k) => <Cartel key={k} x={540} y={450 + k * 130} txt={`👤 ${k + 1}: ____  C: ____  D: ____`} p={rampa(t, M.tres + k * 0.3, 0.3)} tam={38} fondo={CREMA} giro={[-2, 1, -1][k]} />)}
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.deseado, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="perro-mochila" x={790} y={1535} alto={380} t={t} cara="feliz" semilla={5} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "definicion") return <Definicion t={t} />;
  if (p.tipo === "matriz") return <Matriz t={t} />;
  if (p.tipo === "plan") return <Plan t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.dueno - 0.3, "pop", 0.3); fx(M.nada - 0.3, "pop-suave", 0.25); fx(M.permiso - 0.3, "pop", 0.3); fx(M.suma - 0.4, "pop-suave", 0.22);
fx(S(3) - 0.3, "whoosh", 0.4); [M.necesidades, M.expectativas, M.intereses, M.impacto].forEach((w) => fx(w - 0.3, "pop", 0.2));
fx(S(4) - 0.3, "whoosh", 0.4); [M.desc, M.retic, M.neutral, M.apoyo5, M.lider5].forEach((w) => fx(w - 0.35, "pop-suave", 0.2));
fx(M.tito7 - 0.3, "pop", 0.3); fx(M.apoyo7 - 0.3, "pop", 0.3); fx(M.brecha8 - 0.3, "desliza", 0.3); fx(M.lider9 - 0.4, "ding", 0.3);
fx(S(10) - 0.3, "whoosh", 0.4); fx(M.plan10 - 0.4, "papel", 0.3); [M.estrategias, M.acciones, M.formal, M.informal].forEach((w) => fx(w - 0.3, "pop-suave", 0.2));
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/calle.jpg", "art/oficina.jpg"];
const CLAVE = /^(involucramiento|involucrarlos|involucrarlo|interesados|matriz|brecha|desconocedor|reticente|neutral|apoyo|líder|plan)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP45 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp45-involucramiento.mp3" sinSonido={sinSonido} />
);
