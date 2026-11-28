/*
 * Gestión de Proyectos · GP-65 «El riesgo que cambió» (gp65-monitorear-riesgos).
 * Una idea: Monitorear los Riesgos es monitorear la implementación de los planes acordados de respuesta a los
 * riesgos, hacer seguimiento a los riesgos identificados, identificar y analizar nuevos riesgos y evaluar la
 * efectividad del proceso de gestión de los riesgos (11.7, p. 453). Determina si las respuestas son efectivas,
 * si cambió el nivel de riesgo, si aparecieron riesgos nuevos (p. 455). Análisis de reserva (11.7.2.1);
 * revisiones de riesgos: reevaluación de riesgos actuales y cierre de los obsoletos (11.7.2.3, p. 457);
 * solicitudes de cambio con acciones correctivas o preventivas (11.7.3.2).
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, Horno, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, ROJO } from "../gp/piezas.jsx";
import { Hoja } from "../gp/hoja.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, {
  extra: [0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3],
  manual: {
    3: ["Monitorear los riesgos es monitorear la implementación", "de los planes acordados de respuesta,", "hacer seguimiento a los riesgos identificados,", "e identificar y analizar nuevos riesgos."],
    5: ["Se pregunta: ¿las respuestas son efectivas?", "¿Cambió el nivel de riesgo? ¿Hay riesgos nuevos?"],
    6: ["El análisis de reserva compara la reserva para contingencias que queda", "con el riesgo que queda."],
  },
});
const { S, E, W } = T;
const VERDE = "#2FB36B";

const M = {
  horno1: W(1, "horno", 0.1), arreglo: W(1, "arregló.", 0.25), lluvia1: W(1, "lluvia", 0.7), feria1: W(1, "feria.", 0.97),
  quietos: W(2, "quietos.", 0.9),
  monitorear: W(3, "Monitorear", 0.03), implementacion: W(3, "implementación", 0.3), seguimiento: W(3, "seguimiento", 0.6), nuevos3: W(3, "nuevos", 0.9),
  evaluar: W(4, "evaluar", 0.2), funciona: W(4, "funciona.", 0.95),
  efectivas: W(5, "efectivas?", 0.3), nivel: W(5, "nivel", 0.6), nuevos5: W(5, "nuevos?", 0.95),
  reserva6: W(6, "reserva", 0.15), contingencias: W(6, "contingencias", 0.55), riesgo6: W(6, "riesgo", 0.85),
  alcanza: W(7, "Alcanza", 0.1), actuar: W(7, "actuar.", 0.95),
  revisiones: W(8, "revisiones", 0.15), reevaluan: W(8, "reevalúan", 0.45), obsoletos: W(8, "obsoletos.", 0.95),
  cierra: W(9, "cierra", 0.2), agrega: W(9, "agrega", 0.6), lluvia9: W(9, "lluvia.", 0.97),
  solicitudes: W(10, "solicitudes", 0.35), correctivas: W(10, "correctivas", 0.8), preventivas: W(10, "preventivas.", 0.97),
  toca: W(11, "toca:", 0.1), riesgo11: W(11, "riesgo", 0.3), igual: W(11, "igual,", 0.6), cambio11: W(11, "cambió", 0.72), cerrar11: W(11, "cerrar?", 0.97),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "definicion", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "reserva", desde: S(6) - 0.3, entra: "zoom" },
  { tipo: "revision", desde: S(8) - 0.3, entra: "barrido-izq" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* ═════ 1–2 · Ahora, la lluvia ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  const pL = rampa(t, M.lluvia1 - 0.4, 0.4);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(5px)" velo={0.15}>
      <Horno x={280} y={720} w={260} brillo={0.6} />
      <Cartel x={280} y={790} txt="✅ arreglado" p={rampa(t, M.arreglo - 0.3, 0.3)} tam={40} fondo="#E3F6EC" giro={-3} />
      {pL > 0 && <Gigante x={760 + 10 * Math.sin(t * 1.5)} y={360} txt="🌧️" p={pL} tam={200} />}
      <Cartel x={760} y={560} txt="☔ pronóstico: lluvia" p={rampa(t, M.lluvia1 - 0.2, 0.3)} tam={38} fondo="#DDE3FF" giro={2} />
      <Cartel x={760} y={660} txt="el día de la feria" p={rampa(t, M.feria1 - 0.5, 0.3)} tam={34} fondo="#FFFDF7" giro={-1} />
      <Cartel x={540} y={980} txt="⚠️ los riesgos no se quedan quietos" p={rampa(t, M.quietos - 0.8, 0.3)} tam={38} fondo="#FFE1D8" giro={1} />
      <Sombra x={260} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={260} y={1515} alto={330} t={t} cara={t > M.lluvia1 ? "tranquila" : "feliz"} semilla={3} />
      <Sombra x={820} y={1510} w={200} />
      <Mascota esp="perro-corbatin" x={820} y={1515} alto={350} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 3–5 · Qué es ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(4), b: E(5) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const Q = [[M.efectivas, "¿las respuestas son efectivas?"], [M.nivel, "¿cambió el nivel de riesgo?"], [M.nuevos5, "¿hay riesgos nuevos?"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={160} txt="monitorear los riesgos" p={rampa(t, M.monitorear - 0.3, 0.35)} tam={52} fondo={MANGO} />
      <Cartel x={540} y={280} txt="🛠️ monitorear la implementación de las respuestas" p={rampa(t, M.implementacion - 0.3, 0.3)} tam={30} fondo={CREMA} giro={-1} />
      <Cartel x={540} y={370} txt="👀 seguimiento a los riesgos identificados" p={rampa(t, M.seguimiento - 0.3, 0.3)} tam={32} fondo="#FFFDF7" giro={1} />
      <Cartel x={540} y={460} txt="🆕 identificar y analizar nuevos riesgos" p={rampa(t, M.nuevos3 - 0.4, 0.3)} tam={32} fondo={CREMA} giro={-1} />
      <Cartel x={540} y={570} txt="⚙️ ¿funciona el proceso de gestión de los riesgos?" p={rampa(t, M.evaluar - 0.3, 0.3)} tam={30} fondo="#DDE3FF" />
      {Q.map(([tw, txt], k) => <Cartel key={k} x={540} y={700 + k * 95} txt={txt} p={rampa(t, tw - 0.4, 0.3)} tam={36} fondo="#FFF3C4" giro={[-2, 1, -1][k]} />)}
      <Sombra x={540} y={1530} w={170} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={260} t={t} cara="feliz" cab={5 * Math.sin(t * 2)} semilla={3} />
    </Escena>
  );
}

/* ═════ 6–7 · ¿Alcanza la reserva? ═════ */
function Reserva({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(7), b: E(7) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const pR = sale(rampa(t, M.contingencias - 0.4, 0.6)), pQ = sale(rampa(t, M.riesgo6 - 0.4, 0.6));
  const BASE = 820;
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={170} txt="🏦 análisis de reserva" p={rampa(t, M.reserva6 - 0.3, 0.35)} tam={48} fondo={MANGO} />
      <div style={{ position: "absolute", left: 180, top: BASE - 380 * pR, width: 240, height: 380 * pR, background: VERDE, border: `6px solid ${TINTA}`, borderRadius: 14 }} />
      <div style={{ position: "absolute", left: 660, top: BASE - 470 * pQ, width: 240, height: 470 * pQ, background: ROJO, border: `6px solid ${TINTA}`, borderRadius: 14 }} />
      <div style={{ position: "absolute", left: 120, top: BASE, width: 840, height: 10, background: TINTA, borderRadius: 5 }} />
      <Cartel x={300} y={BASE + 70} txt="💰 reserva para contingencias" p={pR} tam={28} fondo={CREMA} />
      <Cartel x={300} y={BASE + 140} txt="que queda" p={pR} tam={28} fondo="#FFFDF7" />
      <Cartel x={780} y={BASE + 70} txt="⚠️ riesgo que queda" p={pQ} tam={30} fondo={CREMA} />
      <Cartel x={540} y={300} txt="🤔 ¿alcanza la reserva?" p={rampa(t, M.alcanza - 0.3, 0.3)} tam={42} fondo="#FFF3C4" giro={-1} />
      <Cartel x={540} y={1080} txt="🔧 si no, hay que actuar" p={rampa(t, M.actuar - 0.5, 0.3)} tam={42} fondo="#FFE1D8" color={ROJO} giro={1} />
      <Sombra x={160} y={1540} w={140} />
      <Mascota esp="hamster-gorra" x={160} y={1545} alto={230} t={t} cara={t > M.alcanza ? "tranquila" : "feliz"} semilla={3} />
      <Sombra x={920} y={1540} w={140} />
      <Mascota esp="perro-corbatin" x={920} y={1545} alto={230} t={t} cara="tranquila" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 8–10 · Revisión de riesgos ═════ */
function Revision({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(9), b: E(10) + 0.3, s: 1.02, x: 540, y: 960 }]);
  const filas = [
    [M.revisiones, "🔥", "horno viejo", t > M.cierra ? "✅ cerrado" : "en seguimiento", t > M.cierra ? "#E3F6EC" : CREMA],
    [M.reevaluan, "🚚", "toldos tarde", "reevaluado", "#FFFDF7"],
    [M.agrega, "🌧️", "lluvia el día de la feria", "🆕 nuevo", "#DDE3FF"],
  ];
  const pS = rampa(t, M.solicitudes - 0.4, 0.4);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={150} txt="🔁 revisiones de riesgos" p={rampa(t, M.revisiones - 0.4, 0.35)} tam={44} fondo={MANGO} />
      <Cartel x={300} y={260} txt="🔍 reevaluar" p={rampa(t, M.reevaluan - 0.3, 0.3)} tam={36} fondo={CREMA} giro={-2} />
      <Cartel x={770} y={260} txt="🗂️ cerrar los obsoletos" p={rampa(t, M.obsoletos - 0.5, 0.3)} tam={34} fondo={CREMA} giro={2} />
      <Hoja x={540} y={340} w={880} h={680} p={rampa(t, M.revisiones, 0.4)} titulo="registro de riesgos" filas={filas} t={t} />
      {pS > 0 && <Documento x={250} y={1170} w={200} p={pS} titulo="solicitud de cambio" letra={26} giro={-3} />}
      <Cartel x={700} y={1110} txt="🔧 correctiva" p={rampa(t, M.correctivas - 0.3, 0.3)} tam={36} fondo="#E3F6EC" giro={2} />
      <Cartel x={700} y={1210} txt="🛡️ preventiva" p={rampa(t, M.preventivas - 0.4, 0.3)} tam={36} fondo="#E3F6EC" giro={-2} />
      <Sombra x={160} y={1560} w={130} />
      <Mascota esp="hamster-gorra" x={160} y={1565} alto={200} t={t} cara={t > M.cierra ? "estrellas" : "feliz"} semilla={3} />
      <Sombra x={920} y={1560} w={130} />
      <Mascota esp="perro-corbatin" x={920} y={1565} alto={200} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 11 · Tu riesgo ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  const O = [[M.igual, "➖ sigue igual", CREMA], [M.cambio11, "🔄 cambió", "#FFF3C4"], [M.cerrar11, "✅ se cierra", "#E3F6EC"]];
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={260} txt="⚡ tu riesgo" p={rampa(t, M.toca - 0.2, 0.35)} tam={58} fondo={MANGO} />
      <Cartel x={540} y={410} txt="⚠️ riesgo: ________" p={rampa(t, M.riesgo11 - 0.3, 0.3)} tam={44} fondo={CREMA} giro={-2} />
      {O.map(([tw, txt, fondo], k) => <Cartel key={k} x={200 + k * 340} y={560} txt={txt} p={rampa(t, Math.min(tw, M.cambio11) - 0.4 + k * 0.15, 0.3)} tam={36} fondo={fondo} giro={[-2, 1, 2][k]} />)}
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.cerrar11, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="perro-corbatin" x={790} y={1535} alto={370} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "definicion") return <Definicion t={t} />;
  if (p.tipo === "reserva") return <Reserva t={t} />;
  if (p.tipo === "revision") return <Revision t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.arreglo - 0.3, "ding", 0.22); fx(M.lluvia1 - 0.4, "whoosh", 0.25); fx(M.quietos - 0.8, "pop", 0.22);
fx(S(3) - 0.3, "whoosh", 0.4); [M.implementacion, M.seguimiento, M.nuevos3, M.evaluar].forEach((w) => fx(w - 0.3, "pop", 0.2)); [M.efectivas, M.nivel, M.nuevos5].forEach((w) => fx(w - 0.4, "pop-suave", 0.18));
fx(S(6) - 0.3, "whoosh", 0.4); fx(M.contingencias - 0.4, "desliza", 0.22); fx(M.riesgo6 - 0.4, "desliza", 0.22); fx(M.alcanza - 0.3, "pop", 0.2); fx(M.actuar - 0.5, "bocina", 0.2);
fx(S(8) - 0.3, "whoosh", 0.4); fx(M.revisiones, "papel", 0.25); fx(M.cierra, "sello", 0.3); fx(M.agrega - 0.3, "pop", 0.22); fx(M.solicitudes - 0.4, "papel", 0.25);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/calle.jpg", "art/oficina.jpg"];
const CLAVE = /^(riesgos|monitorear|reserva|contingencias|revisiones|reevalúan|obsoletos|nuevos|efectivas)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP65 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp65-monitorear-riesgos.mp3" sinSonido={sinSonido} />
);
