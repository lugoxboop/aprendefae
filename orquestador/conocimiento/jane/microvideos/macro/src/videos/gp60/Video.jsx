/*
 * Gestión de Proyectos · GP-60 «¿Llegamos a tiempo?» (gp60-controlar-cronograma).
 * Una idea: Controlar el Cronograma es monitorear el estado del proyecto para actualizar el cronograma del
 * proyecto y gestionar cambios a la línea base del cronograma (6.6, p. 222). Revisiones del desempeño: fechas
 * reales de inicio y finalización, porcentaje completado y duración restante (6.6.2.1); un retraso importante
 * fuera de la ruta crítica puede tener efecto mínimo y uno menor en una actividad crítica puede requerir
 * acción inmediata (6.6.2.1, p. 227); adelantos y retrasos (6.6.2.5); compresión: ejecución rápida o
 * intensificación (6.6.2.6); pronósticos del cronograma (6.6.3.2); solicitudes de cambio (6.6.3.3, p. 229).
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, {
  extra: [0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3],
  manual: {
    3: ["Controlar el cronograma es monitorear el estado del proyecto", "para actualizar el cronograma y gestionar cambios a su línea base."],
    4: ["Primero, el estado actual: fechas reales contra planificadas,", "porcentaje físicamente completado y duración pendiente."],
    8: ["Puede ajustar adelantos y retrasos,", "o comprimir el cronograma con ejecución rápida o intensificación."],
    9: ["Con todo eso se emiten pronósticos del cronograma:", "predicciones del futuro según la información disponible."],
  },
});
const { S, E, W } = T;
const VERDE = "#2FB36B";

const M = {
  diez: W(1, "diez", 0.15), toldos1: W(1, "toldos", 0.75),
  tiempo2: W(2, "tiempo?", 0.9),
  controlar: W(3, "Controlar", 0.03), monitorear: W(3, "monitorear", 0.3), actualizar: W(3, "actualizar", 0.6), gestionar: W(3, "gestionar", 0.8),
  fechas: W(4, "fechas", 0.3), porcentaje: W(4, "porcentaje", 0.6), duracion: W(4, "duración", 0.88),
  ruta5: W(5, "ruta", 0.2), menor: W(5, "menor", 0.55), inmediata: W(5, "inmediata.", 0.97),
  importante: W(6, "importante", 0.3), fuera: W(6, "fuera", 0.45), minimo: W(6, "mínimo.", 0.97),
  toldos7: W(7, "toldos", 0.1), ruta7: W(7, "ruta", 0.4), recuperar: W(7, "recuperar", 0.8),
  adelantos: W(8, "adelantos", 0.2), comprimir: W(8, "comprimir", 0.45), rapida: W(8, "rápida", 0.75), intensificacion: W(8, "intensificación.", 0.97),
  pronosticos: W(9, "pronósticos", 0.3), predicciones: W(9, "predicciones", 0.6), disponible: W(9, "disponible.", 0.97),
  mover: W(10, "mover", 0.3), solicitud10: W(10, "solicitud", 0.8),
  toca: W(11, "toca:", 0.15), tarea: W(11, "tarea", 0.35), terminara: W(11, "terminará.", 0.97),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "definicion", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "ruta", desde: S(5) - 0.3, entra: "zoom" },
  { tipo: "opciones", desde: S(8) - 0.3, entra: "barrido-izq" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* ═════ 1–2 · Faltan diez días ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  const pC = rampa(t, M.diez - 0.4, 0.4);
  const xT = lerp(-200, 260, sale(rampa(t, M.toldos1 - 0.3, 1.2)));
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(5px)" velo={0.15}>
      {pC > 0 && (
        <div style={{ position: "absolute", left: 340, top: 170, width: 400, height: 400, background: "#FFFDF7", border: `8px solid ${TINTA}`, borderRadius: 30, boxShadow: "0 14px 0 rgba(42,30,23,.28)", transform: `scale(${rebote(pC)})`, fontFamily: "Sora", fontWeight: 800, color: TINTA, textAlign: "center", overflow: "hidden" }}>
          <div style={{ height: 90, background: ROJO, color: "#fff", fontSize: 40, lineHeight: "90px" }}>faltan</div>
          <div style={{ fontSize: 170, lineHeight: "200px" }}>10</div>
          <div style={{ fontSize: 44 }}>días</div>
        </div>
      )}
      <div style={{ position: "absolute", left: xT - 110, top: 680, fontSize: 150 }}>🚚</div>
      <Cartel x={xT + 40} y={880} txt="⛱️ toldos: aún no llegan" p={rampa(t, M.toldos1, 0.3)} tam={38} fondo="#FFE1D8" giro={-2} />
      <Cartel x={700} y={1060} txt="⏳ ¿llegamos a tiempo?" p={rampa(t, M.tiempo2 - 0.6, 0.3)} tam={44} fondo={CREMA} giro={2} />
      <Sombra x={260} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={260} y={1515} alto={330} t={t} cara={t > M.toldos1 ? "tranquila" : "feliz"} cab={6 * Math.sin(t * 3)} semilla={3} />
      <Sombra x={820} y={1510} w={200} />
      <Mascota esp="perro-corbatin" x={820} y={1515} alto={350} t={t} cara="tranquila" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 3–4 · Qué es ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(4), b: E(4) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const pE = rampa(t, M.fechas - 0.5, 0.4);
  const R = [[M.fechas, "📅 fechas reales contra planificadas"], [M.porcentaje, "📊 porcentaje físicamente completado"], [M.duracion, "⏳ duración pendiente"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={170} txt="controlar el cronograma" p={rampa(t, M.controlar - 0.3, 0.35)} tam={52} fondo={MANGO} />
      <Cartel x={540} y={290} txt="👀 monitorear el estado del proyecto" p={rampa(t, M.monitorear - 0.3, 0.3)} tam={36} fondo={CREMA} giro={-1} />
      <Cartel x={540} y={385} txt="🔄 actualizar el cronograma" p={rampa(t, M.actualizar - 0.3, 0.3)} tam={36} fondo="#FFFDF7" giro={1} />
      <Cartel x={540} y={480} txt="📏 gestionar cambios a su línea base" p={rampa(t, M.gestionar - 0.3, 0.3)} tam={36} fondo="#DDE3FF" giro={-1} />
      {pE > 0 && (
        <div style={{ position: "absolute", left: 100, top: 580, width: 880, height: 370, background: "#FFFDF7", border: `7px solid ${TINTA}`, borderRadius: 24, boxShadow: "0 12px 0 rgba(42,30,23,.25)", transform: `scale(${rebote(pE)})`, transformOrigin: "50% 0", fontFamily: "Sora", fontWeight: 800, color: TINTA }}>
          <div style={{ position: "absolute", left: 30, top: 18, fontSize: 36 }}>🩺 el estado actual</div>
          {R.map(([tw, txt], k) => {
            const q = rampa(t, tw - 0.3, 0.3);
            return <div key={k} style={{ position: "absolute", left: 30, right: 30, top: 90 + k * 88, height: 72, display: "flex", alignItems: "center", fontSize: 36, opacity: q, transform: `translateX(${(1 - q) * 40}px)` }}>{txt}</div>;
          })}
        </div>
      )}
      <Sombra x={540} y={1530} w={170} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={260} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 5–7 · La ruta crítica ═════ */
const NODOS = [["permisos", 150, 520], ["⛱️ toldos", 420, 520], ["montaje", 690, 520], ["🎪 feria", 940, 520]];
function Ruta({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(7), b: E(7) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const pR = rampa(t, M.ruta5 - 0.4, 0.4);
  const pF = rampa(t, M.importante - 0.4, 0.4);
  const pT = rampa(t, M.toldos7 - 0.3, 0.3);
  const brilla = pT > 0 ? 0.5 + 0.5 * Math.sin(t * 8) : 0;
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={170} txt="🔴 ruta crítica" p={pR} tam={50} fondo={MANGO} />
      {pR > 0 && <div style={{ position: "absolute", left: 150, top: 514, width: 790 * sale(pR), height: 14, background: ROJO, borderRadius: 7 }} />}
      {NODOS.map(([txt, x, y], k) => (
        <div key={k} style={{ position: "absolute", left: x - 110, top: y - 50, width: 220, height: 100, background: k === 1 && pT > 0 ? `rgba(255,${Math.round(225 - 60 * brilla)},${Math.round(216 - 60 * brilla)},1)` : "#FFFDF7", border: `7px solid ${pR > 0.5 ? ROJO : TINTA}`, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 32, color: TINTA, transform: `scale(${rebote(Math.min(1, pR + 0.001)) * (k === 1 ? 1 + 0.08 * pulso(t, M.toldos7, 0.8) : 1)})`, opacity: pR > 0 ? 1 : 0 }}>{txt}</div>
      ))}
      <Cartel x={420} y={330} txt="⏱️ retraso menor" p={rampa(t, M.menor - 0.3, 0.3)} tam={36} fondo="#FFE1D8" giro={-2} />
      <Cartel x={540} y={680} txt="🚨 acción inmediata" p={rampa(t, M.inmediata - 0.5, 0.3)} tam={40} fondo="#FFE1D8" color={ROJO} giro={1} />
      {pF > 0 && (
        <>
          <div style={{ position: "absolute", left: 300, top: 790, width: 260, height: 100, background: "#FFFDF7", border: `7px solid ${TINTA}`, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 32, color: TINTA, transform: `scale(${rebote(pF)})` }}>🎈 globos</div>
          <svg width="1080" height="1920" style={{ position: "absolute", left: 0, top: 0, opacity: pF }}>
            <path d="M 430 790 L 300 570" stroke={TINTA} strokeWidth="8" strokeDasharray="14 10" fill="none" />
          </svg>
        </>
      )}
      <Cartel x={790} y={830} txt="⏳ retraso importante" p={rampa(t, M.importante - 0.2, 0.3)} tam={34} fondo={CREMA} giro={2} />
      <Cartel x={540} y={980} txt="fuera de la ruta: efecto mínimo" p={rampa(t, M.minimo - 0.5, 0.3)} tam={36} fondo="#E3F6EC" giro={-1} />
      <Cartel x={540} y={1100} txt="🏃 recuperar tiempo" p={rampa(t, M.recuperar - 0.3, 0.3)} tam={44} fondo={MANGO} giro={1} />
      <Sombra x={160} y={1540} w={140} />
      <Mascota esp="hamster-gorra" x={160} y={1545} alto={230} t={t} cara={t > M.toldos7 ? "tranquila" : "feliz"} semilla={3} />
      <Sombra x={920} y={1540} w={140} />
      <Mascota esp="perro-corbatin" x={920} y={1545} alto={230} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 8–10 · Opciones y pronósticos ═════ */
function Opciones({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(9), b: E(10) + 0.3, s: 1.02, x: 540, y: 960 }]);
  const O = [[M.adelantos, "↔️ adelantos y retrasos", "#FFFDF7"], [M.rapida, "⚡ ejecución rápida", CREMA], [M.intensificacion, "💪 intensificación", CREMA]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={170} txt="🏃 recuperar tiempo" p={rampa(t, S(8) - 0.2, 0.3)} tam={46} fondo={MANGO} />
      {O.map(([tw, txt, fondo], k) => <Cartel key={k} x={k === 0 ? 540 : [0, 300, 780][k]} y={k === 0 ? 290 : 470} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={38} fondo={fondo} giro={[-1, -2, 2][k]} />)}
      <Cartel x={540} y={380} txt="🗜️ comprimir el cronograma" p={rampa(t, M.comprimir - 0.3, 0.3)} tam={36} fondo="#DDE3FF" />
      <Cartel x={540} y={630} txt="🔮 pronósticos del cronograma" p={rampa(t, M.pronosticos - 0.3, 0.3)} tam={42} fondo="#E3F6EC" giro={-1} />
      <Cartel x={540} y={740} txt="según la información disponible" p={rampa(t, M.disponible - 0.6, 0.3)} tam={34} fondo="#FFFDF7" giro={1} />
      <Cartel x={330} y={900} txt="📏 ¿mover la línea base?" p={rampa(t, M.mover - 0.3, 0.3)} tam={36} fondo="#FFE1D8" giro={-2} />
      <Documento x={790} y={950} w={220} p={rampa(t, M.solicitud10 - 0.4, 0.4)} titulo="solicitud de cambio" letra={28} giro={3} />
      <Sombra x={160} y={1540} w={140} />
      <Mascota esp="hamster-gorra" x={160} y={1545} alto={230} t={t} cara={t > M.pronosticos ? "estrellas" : "feliz"} semilla={3} />
      <Sombra x={920} y={1540} w={140} />
      <Mascota esp="perro-corbatin" x={920} y={1545} alto={230} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 11 · Tu tarea crítica ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={260} txt="⚡ tu tarea crítica" p={rampa(t, M.toca - 0.2, 0.35)} tam={56} fondo={MANGO} />
      <Cartel x={540} y={420} txt="🔴 tarea: ________" p={rampa(t, M.tarea - 0.3, 0.3)} tam={44} fondo={CREMA} giro={-2} />
      <Cartel x={540} y={550} txt="🔮 terminará: ________" p={rampa(t, M.terminara - 1.0, 0.3)} tam={44} fondo={CREMA} giro={1} />
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.terminara, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="perro-corbatin" x={790} y={1535} alto={370} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "definicion") return <Definicion t={t} />;
  if (p.tipo === "ruta") return <Ruta t={t} />;
  if (p.tipo === "opciones") return <Opciones t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.diez - 0.4, "pop", 0.3); fx(M.toldos1 - 0.3, "desliza", 0.25); fx(M.tiempo2 - 0.6, "pop-suave", 0.22);
fx(S(3) - 0.3, "whoosh", 0.4); [M.monitorear, M.actualizar, M.gestionar].forEach((w) => fx(w - 0.3, "pop", 0.2)); fx(M.fechas - 0.5, "papel", 0.25); [M.porcentaje, M.duracion].forEach((w) => fx(w - 0.3, "pop-suave", 0.18));
fx(S(5) - 0.3, "whoosh", 0.4); fx(M.ruta5 - 0.4, "desliza", 0.25); fx(M.inmediata - 0.5, "bocina", 0.22); fx(M.importante - 0.4, "pop", 0.2); fx(M.minimo - 0.5, "ding", 0.2); fx(M.toldos7, "pop", 0.25);
fx(S(8) - 0.3, "whoosh", 0.4); [M.adelantos, M.comprimir, M.rapida, M.intensificacion].forEach((w) => fx(w - 0.3, "pop", 0.2)); fx(M.pronosticos - 0.3, "ding", 0.22); fx(M.solicitud10 - 0.4, "papel", 0.3);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/calle.jpg", "art/oficina.jpg"];
const CLAVE = /^(cronograma|ruta|crítica|inmediata|mínimo|adelantos|comprimir|intensificación|pronósticos|solicitud)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP60 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp60-controlar-cronograma.mp3" sinSonido={sinSonido} />
);
