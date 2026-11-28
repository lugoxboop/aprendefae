/*
 * Gestión de Proyectos · GP-56 «¿Vamos bien o vamos mal?» (gp56-monitorear-trabajo).
 * Una idea: Monitorear y Controlar el Trabajo del Proyecto es hacer seguimiento, revisar e informar el avance
 * general a fin de cumplir con los objetivos de desempeño definidos en el plan (4.5, p. 105).
 * Datos de desempeño (observaciones en bruto) → información de desempeño (analizados en contexto) → informes
 * de desempeño del trabajo (representación compilada) (1.2.4.7, p. 26); análisis de variación y de tendencias
 * (4.5.2.2); tableros y cuadros de mandos tipo semáforo (4.5.3.1); solicitudes de cambio, como acciones
 * correctivas o preventivas (4.5.3.2, p. 112).
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, {
  extra: [0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3],
  manual: { 3: ["Monitorear y controlar el trabajo del proyecto", "es hacer seguimiento, revisar", "e informar el avance general,", "para cumplir los objetivos de desempeño del plan."] },
});
const { S, E, W } = T;
const VERDE = "#2FB36B", AMARILLO = "#F5C431";

const M = {
  mitad: W(1, "mitad", 0.1), bien: W(1, "bien", 0.7), mal: W(1, "mal?", 0.97),
  sueltos: W(2, "sueltos", 0.4),
  monitorear: W(3, "Monitorear", 0.03), seguimiento: W(3, "seguimiento,", 0.4), revisar: W(3, "revisar", 0.5), informar: W(3, "informar", 0.58), objetivos: W(3, "objetivos", 0.85),
  datos4: W(4, "datos", 0.2), bruto: W(4, "bruto,", 0.6), costos4: W(4, "costos", 0.85),
  contexto: W(5, "contexto,", 0.4), informacion5: W(5, "información", 0.8),
  compilada: W(6, "compilada", 0.1), informe6: W(6, "informe", 0.7),
  variacion: W(7, "variación:", 0.3), planificado: W(7, "planificado", 0.75), real: W(7, "real.", 0.97),
  tendencias: W(8, "tendencias:", 0.15), problemas: W(8, "problemas", 0.75),
  tablero: W(9, "tablero,", 0.35), semaforo: W(9, "semáforo:", 0.55), verde: W(9, "verde,", 0.7), amarillo: W(9, "amarillo", 0.82), rojo: W(9, "rojo.", 0.97),
  desviaciones: W(10, "desviaciones,", 0.2), solicitudes: W(10, "solicitudes", 0.4), correctivas: W(10, "correctivas", 0.75), preventivas: W(10, "preventivas.", 0.97),
  toca: W(11, "toca:", 0.15), semaforo11: W(11, "semáforo", 0.45), tres: W(11, "tres", 0.6), indicadores: W(11, "indicadores", 0.75),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "definicion", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "escalera", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "analisis", desde: S(7) - 0.3, entra: "barrido-izq" },
  { tipo: "semaforo", desde: S(9) - 0.3, entra: "barrido" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* ═════ 1–2 · ¿Vamos bien? ═════ */
const SUELTOS = [["$ 320", 180, 560], ["14 h", 820, 520], ["38 🍞", 300, 760], ["2 ✗", 760, 760], ["⏱️ 3 d", 540, 640]];
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(5px)" velo={0.15}>
      <Cartel x={540} y={240} txt="🎪 mitad de la feria" p={rampa(t, M.mitad - 0.3, 0.35)} tam={46} fondo={MANGO} giro={-2} />
      <Cartel x={300} y={390} txt="👍 ¿vamos bien?" p={rampa(t, M.bien - 0.3, 0.3)} tam={42} fondo="#E3F6EC" giro={-2} />
      <Cartel x={790} y={390} txt="👎 ¿o mal?" p={rampa(t, M.mal - 0.4, 0.3)} tam={42} fondo="#FFE1D8" giro={2} />
      {SUELTOS.map(([txt, x, y], k) => <Cartel key={k} x={x + 12 * Math.sin(t * 1.5 + k)} y={y + 10 * Math.cos(t * 1.3 + k)} txt={txt} p={rampa(t, M.sueltos - 0.6 + k * 0.1, 0.3)} tam={38} fondo="#FFFDF7" giro={[-8, 6, -4, 9, -2][k]} />)}
      <Cartel x={540} y={900} txt="🤷 datos sueltos" p={rampa(t, M.sueltos, 0.3)} tam={40} fondo={CREMA} giro={1} />
      <Sombra x={540} y={1510} w={210} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={370} t={t} cara="tranquila" cab={10 * Math.sin(t * 2.5)} semilla={3} />
    </Escena>
  );
}

/* ═════ 3 · Qué es ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3), b: E(3) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const C = [[M.seguimiento, "👀 seguimiento"], [M.revisar, "🔍 revisar"], [M.informar, "📣 informar"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={220} txt="monitorear y controlar el trabajo del proyecto" p={rampa(t, M.monitorear - 0.3, 0.35)} tam={34} fondo={MANGO} />
      {C.map(([tw, txt], k) => <Cartel key={k} x={200 + k * 340} y={400} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={38} fondo={CREMA} giro={[-2, 1, 2][k]} />)}
      <Cartel x={540} y={540} txt="📈 el avance general" p={rampa(t, M.informar + 0.4, 0.3)} tam={40} fondo="#FFFDF7" />
      <Cartel x={540} y={700} txt="🎯 para cumplir los objetivos de desempeño del plan" p={rampa(t, M.objetivos - 0.3, 0.3)} tam={31} fondo="#E3F6EC" giro={0} />
      <Sombra x={540} y={1510} w={190} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 4–6 · Datos → información → informe ═════ */
function Escalera({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(6), b: E(6) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const N = [
    [M.datos4, "🔢", "datos de desempeño del trabajo", "observaciones en bruto: costos reales", "#FFFDF7"],
    [M.contexto, "🧠", "información de desempeño del trabajo", "analizados en contexto", CREMA],
    [M.compilada, "📄", "informe de desempeño del trabajo", "compilado en un documento", "#DDE3FF"],
  ];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      {N.map(([tw, ic, nom, sub, fondo], k) => {
        const q = rampa(t, tw - 0.4, 0.35);
        if (q <= 0) return null;
        const y = 860 - k * 290, w = 980 - k * 60;
        return (
          <div key={k}>
            <div style={{ position: "absolute", left: 540 - w / 2, top: y, width: w, height: 220, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 22, padding: "0 30px", background: fondo, border: `6px solid ${TINTA}`, borderRadius: 24, transform: `scale(${rebote(q)})`, fontFamily: "Sora", fontWeight: 800, color: TINTA }}>
              <span style={{ fontSize: 90 }}>{ic}</span>
              <div style={{ lineHeight: 1.12 }}>
                <div style={{ fontSize: 42 }}>{nom}</div>
                <div style={{ fontSize: 30, color: "#5B4A3E", marginTop: 6, opacity: rampa(t, tw + 0.6, 0.3) }}>{sub}</div>
              </div>
            </div>
            {k > 0 && <Gigante x={540} y={y + 250} txt="⬆️" p={q} tam={60} />}
          </div>
        );
      })}
      <Sombra x={540} y={1530} w={170} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={250} t={t} cara={t > M.informe6 ? "estrellas" : "feliz"} semilla={3} />
    </Escena>
  );
}

/* ═════ 7–8 · Variación y tendencias ═════ */
function Analisis({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(8), b: E(8) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const pP = rampa(t, M.planificado - 0.4, 0.5), pR = rampa(t, M.real - 0.4, 0.5);
  const pT = sale(rampa(t, M.tendencias, 1.4));
  const pts = [[620, 1130], [700, 1100], [780, 1060], [860, 1000]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={190} txt="📊 análisis de variación" p={rampa(t, M.variacion - 0.4, 0.35)} tam={44} fondo={MANGO} />
      <div style={{ position: "absolute", left: 240, top: 640 - 300 * sale(pP), width: 200, height: 300 * sale(pP), background: "#5B8DEF", border: `6px solid ${TINTA}`, borderRadius: 12 }} />
      <div style={{ position: "absolute", left: 640, top: 640 - 380 * sale(pR), width: 200, height: 380 * sale(pR), background: ROJO, border: `6px solid ${TINTA}`, borderRadius: 12 }} />
      <div style={{ position: "absolute", left: 180, top: 640, width: 720, height: 8, background: TINTA, borderRadius: 4 }} />
      <Cartel x={340} y={700} txt="planificado" p={pP} tam={34} fondo={CREMA} />
      <Cartel x={740} y={700} txt="real" p={pR} tam={34} fondo={CREMA} />
      {pR > 0.9 && <Cartel x={540} y={470} txt="↕️ variación" p={rampa(t, M.real, 0.3)} tam={30} fondo="#FFE1D8" giro={-2} />}
      <Cartel x={300} y={860} txt="📈 tendencias" p={rampa(t, M.tendencias - 0.4, 0.3)} tam={40} fondo="#DDE3FF" giro={-2} />
      <svg width="1080" height="1920" style={{ position: "absolute", left: 0, top: 0, opacity: rampa(t, M.tendencias, 0.3) }}>
        <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke={TINTA} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="860" y1="1000" x2={lerp(860, 1000, pT)} y2={lerp(1000, 900, pT)} stroke={ROJO} strokeWidth="10" strokeDasharray="18 12" strokeLinecap="round" />
      </svg>
      <Cartel x={300} y={990} txt="¿problemas más adelante?" p={rampa(t, M.problemas - 0.4, 0.3)} tam={34} fondo="#FFFDF7" giro={1} />
      <Sombra x={160} y={1530} w={140} />
      <Mascota esp="hamster-gorra" x={160} y={1535} alto={230} t={t} cara={t > M.real ? "tranquila" : "feliz"} semilla={3} />
      <Sombra x={920} y={1530} w={140} />
      <Mascota esp="perro-corbatin" x={920} y={1535} alto={230} t={t} cara="tranquila" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 9–10 · El semáforo y las solicitudes de cambio ═════ */
const IND = [["💲 costos", AMARILLO], ["📅 cronograma", VERDE], ["🍞 calidad", ROJO]];
function Semaforo({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10) + 0.3, s: 1.02, x: 540, y: 960 }]);
  const pS = rampa(t, M.tablero - 0.4, 0.4);
  const luz = [M.verde, M.amarillo, M.rojo];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={170} txt="🚦 cuadro de mandos tipo semáforo" p={pS} tam={46} fondo={MANGO} />
      {pS > 0 && (
        <div style={{ position: "absolute", left: 120, top: 260, width: 840, height: 470, background: "#FFFDF7", border: `8px solid ${TINTA}`, borderRadius: 26, boxShadow: "0 14px 0 rgba(42,30,23,.28)", transform: `scale(${rebote(pS)})`, fontFamily: "Sora", fontWeight: 800, color: TINTA }}>
          {IND.map(([nom, col], k) => {
            const tl = [M.amarillo, M.verde, M.rojo][k];
            const q = rampa(t, tl - 0.3, 0.3);
            return (
              <div key={k} style={{ position: "absolute", left: 40, right: 40, top: 40 + k * 140, height: 110, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: k < 2 ? "4px dashed #D9D2C3" : "none", fontSize: 44 }}>
                <span>{nom}</span>
                <div style={{ width: 90, height: 90, borderRadius: "50%", border: `6px solid ${TINTA}`, background: q > 0 ? col : "#EFE8DA", transform: `scale(${q > 0 ? rebote(q) : 1})`, boxShadow: q > 0 ? `0 0 30px ${col}` : "none" }} />
              </div>
            );
          })}
        </div>
      )}
      <Cartel x={540} y={830} txt="⚠️ ¿desviaciones?" p={rampa(t, M.desviaciones - 0.3, 0.3)} tam={40} fondo="#FFE1D8" giro={-1} />
      <Documento x={250} y={1060} w={220} p={rampa(t, M.solicitudes - 0.4, 0.4)} titulo="solicitud de cambio" letra={30} giro={-4} />
      <Cartel x={720} y={990} txt="🔧 acción correctiva" p={rampa(t, M.correctivas - 0.3, 0.3)} tam={36} fondo={CREMA} giro={2} />
      <Cartel x={720} y={1100} txt="🛡️ acción preventiva" p={rampa(t, M.preventivas - 0.4, 0.3)} tam={36} fondo={CREMA} giro={-2} />
      <Sombra x={170} y={1540} w={140} />
      <Mascota esp="hamster-gorra" x={170} y={1545} alto={220} t={t} cara={t > M.rojo ? "tranquila" : "feliz"} semilla={3} />
      <Sombra x={910} y={1540} w={140} />
      <Mascota esp="perro-corbatin" x={910} y={1545} alto={220} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 11 · Tu semáforo ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={260} txt="⚡ tu semáforo" p={rampa(t, M.toca - 0.2, 0.35)} tam={58} fondo={MANGO} />
      {[VERDE, AMARILLO, ROJO].map((c, k) => <Cartel key={k} x={540} y={420 + k * 125} txt={`${["🟢", "🟡", "🔴"][k]} indicador ${k + 1}: ________`} p={rampa(t, M.tres + k * 0.3, 0.3)} tam={40} fondo={CREMA} giro={[-2, 1, -1][k]} />)}
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.indicadores, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="perro-corbatin" x={790} y={1535} alto={370} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "definicion") return <Definicion t={t} />;
  if (p.tipo === "escalera") return <Escalera t={t} />;
  if (p.tipo === "analisis") return <Analisis t={t} />;
  if (p.tipo === "semaforo") return <Semaforo t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.mitad - 0.3, "pop", 0.3); fx(M.bien - 0.3, "pop-suave", 0.22); fx(M.mal - 0.4, "pop-suave", 0.22); [0, 1, 2, 3, 4].forEach((k) => fx(M.sueltos - 0.6 + k * 0.1, "pop-suave", 0.12));
fx(S(3) - 0.3, "whoosh", 0.4); [M.seguimiento, M.revisar, M.informar, M.objetivos].forEach((w) => fx(w - 0.3, "pop", 0.2));
fx(S(4) - 0.3, "whoosh", 0.4); [M.datos4, M.contexto, M.compilada].forEach((w) => fx(w - 0.4, "pop", 0.25)); fx(M.informe6, "ding", 0.25);
fx(S(7) - 0.3, "whoosh", 0.4); fx(M.planificado - 0.4, "desliza", 0.22); fx(M.real - 0.4, "desliza", 0.22); fx(M.tendencias, "desliza", 0.2);
fx(S(9) - 0.3, "whoosh", 0.4); [M.verde, M.amarillo, M.rojo].forEach((w) => fx(w - 0.3, "pop", 0.24)); fx(M.solicitudes - 0.4, "papel", 0.3); [M.correctivas, M.preventivas].forEach((w) => fx(w - 0.3, "pop-suave", 0.2));
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/calle.jpg", "art/oficina.jpg"];
const CLAVE = /^(monitorear|controlar|datos|información|informe|variación:|tendencias:|semáforo:|semáforo|desviaciones,)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP56 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp56-monitorear-trabajo.mp3" sinSonido={sinSonido} />
);
