/*
 * Gestión de Proyectos · GP-58 «¿Lo aceptas?» (gp58-validar-alcance).
 * Una idea: Validar el Alcance es formalizar la aceptación de los entregables del proyecto que se hayan
 * completado; aporta objetividad y aumenta la probabilidad de aceptación final (5.5, p. 163). Controlar la
 * Calidad corrobora la corrección; Validar el Alcance se ocupa de la aceptación (p. 165). Inspección: medir,
 * examinar y validar contra requisitos y criterios de aceptación (5.5.2.1); votación (5.5.2.2); entregables
 * aceptados, firmados (5.5.3.1); los no aceptados se documentan con sus razones y pueden requerir una
 * solicitud de cambio para reparar defectos (5.5.3.3, p. 166).
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
    3: ["Validar el alcance es formalizar la aceptación", "de los entregables del proyecto que se hayan completado."],
    5: ["Antes, controlar la calidad revisó que el pastel estuviera correcto.", "Ahora se trata de aceptarlo."],
    6: ["La herramienta clave es la inspección: medir, examinar y validar", "contra los requisitos y los criterios de aceptación."],
    10: ["Lo que no, se documenta con sus razones,", "y puede requerir una solicitud de cambio para reparar el defecto."],
  },
});
const { S, E, W } = T;
const VERDE = "#2FB36B";

const M = {
  termino: W(1, "terminó", 0.1), pastel1: W(1, "pastel", 0.3), listo: W(1, "listo?", 0.97),
  acepte: W(2, "acepte.", 0.95),
  validar: W(3, "Validar", 0.03), formalizar: W(3, "formalizar", 0.3), entregables3: W(3, "entregables", 0.6),
  objetividad: W(4, "objetividad,", 0.15), probabilidad: W(4, "probabilidad", 0.5),
  calidad5: W(5, "calidad", 0.2), correcto: W(5, "correcto.", 0.6), aceptarlo: W(5, "aceptarlo.", 0.97),
  inspeccion: W(6, "inspección:", 0.3), medir: W(6, "medir,", 0.4), examinar: W(6, "examinar", 0.47), validar6: W(6, "validar", 0.55), requisitos: W(6, "requisitos", 0.75), criterios: W(6, "criterios", 0.88),
  revisa7: W(7, "revisa:", 0.1), pisos: W(7, "pisos,", 0.25), nueces: W(7, "nueces,", 0.5), flores: W(7, "Flores", 0.7), rosadas: W(7, "rosadas.", 0.97),
  juntos: W(8, "juntos,", 0.5), votacion: W(8, "votación.", 0.95),
  cumple: W(9, "cumple", 0.2), firma: W(9, "firma:", 0.35), aceptados9: W(9, "aceptados.", 0.95),
  razones: W(10, "razones,", 0.3), solicitud10: W(10, "solicitud", 0.6), defecto: W(10, "defecto.", 0.97),
  toca: W(11, "toca:", 0.15), tres: W(11, "tres", 0.3), criterios11: W(11, "criterios", 0.45),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "definicion", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "inspeccion", desde: S(6) - 0.3, entra: "zoom" },
  { tipo: "salidas", desde: S(9) - 0.3, entra: "barrido-izq" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* Pastel de bodas de tres pisos */
function Pastel({ x, y, w, p = 1, flores = "#FF9EC4" }) {
  if (p <= 0) return null;
  const pisos = [[1, 0.36], [0.74, 0.3], [0.5, 0.26]];
  let base = y;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${rebote(Math.min(1, p))})`, transformOrigin: `${x}px ${y}px` }}>
      <div style={{ position: "absolute", left: x - w * 0.62, top: y - 10, width: w * 1.24, height: 30, background: "#E3E8EF", border: `6px solid ${TINTA}`, borderRadius: 15 }} />
      {pisos.map(([fw, fh], k) => {
        const ww = w * fw, hh = w * fh;
        base -= hh;
        const top = base;
        return (
          <div key={k} style={{ position: "absolute", left: x - ww / 2, top, width: ww, height: hh, background: "linear-gradient(180deg,#FFFDF7,#F3E9DA)", border: `6px solid ${TINTA}`, borderRadius: 18 }}>
            {[0.2, 0.5, 0.8].map((f) => <div key={f} style={{ position: "absolute", left: `${f * 100}%`, top: "40%", width: w * 0.09, height: w * 0.09, marginLeft: -w * 0.045, borderRadius: "50%", background: flores, border: `4px solid ${TINTA}` }} />)}
          </div>
        );
      })}
    </div>
  );
}

/* ═════ 1–2 · El pastel ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(5px)" velo={0.15}>
      <Pastel x={540} y={880} w={380} p={rampa(t, M.pastel1 - 0.4, 0.5)} />
      <Cartel x={540} y={260} txt="🎂 pastel de bodas" p={rampa(t, M.pastel1 - 0.2, 0.3)} tam={46} fondo={MANGO} giro={-2} />
      <Cartel x={300} y={390} txt="¿ya está listo?" p={rampa(t, M.listo - 0.5, 0.3)} tam={40} fondo={CREMA} giro={-2} />
      <Cartel x={540} y={1010} txt="✍️ falta que Carmen lo acepte" p={rampa(t, M.acepte - 0.6, 0.3)} tam={40} fondo="#FFE1D8" giro={1} />
      <Sombra x={250} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={250} y={1515} alto={330} t={t} cara="feliz" salto={30 * pulso(t, M.termino, 0.5)} semilla={3} />
      <Sombra x={820} y={1510} w={200} />
      <Mascota esp="gato-gafas" x={820} y={1515} alto={340} t={t} cara="tranquila" semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 3–5 · Qué es ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(4), b: E(5) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const pC = rampa(t, M.calidad5 - 0.4, 0.35);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={170} txt="validar el alcance" p={rampa(t, M.validar - 0.3, 0.35)} tam={54} fondo={MANGO} />
      <Cartel x={540} y={290} txt="✍️ formalizar la aceptación" p={rampa(t, M.formalizar - 0.3, 0.3)} tam={40} fondo={CREMA} giro={-1} />
      <Cartel x={540} y={390} txt="📦 de los entregables completados" p={rampa(t, M.entregables3 - 0.3, 0.3)} tam={38} fondo="#FFFDF7" giro={1} />
      <Cartel x={300} y={510} txt="⚖️ objetividad" p={rampa(t, M.objetividad - 0.3, 0.3)} tam={38} fondo="#DDE3FF" giro={-2} />
      <Cartel x={770} y={510} txt="📈 más probable que se acepte" p={rampa(t, M.probabilidad - 0.3, 0.3)} tam={32} fondo="#E3F6EC" giro={2} />
      {pC > 0 && (
        <>
          <Cartel x={270} y={690} txt="🧪 controlar la calidad" p={pC} tam={34} fondo={CREMA} />
          <Cartel x={270} y={790} txt="¿está correcto?" p={rampa(t, M.correcto - 0.4, 0.3)} tam={34} fondo="#FFFDF7" giro={-2} />
          <Gigante x={540} y={740} txt="➡️" p={rampa(t, M.aceptarlo - 1.0, 0.3)} tam={70} />
          <Cartel x={810} y={690} txt="✅ validar el alcance" p={rampa(t, M.aceptarlo - 0.8, 0.3)} tam={34} fondo={CREMA} />
          <Cartel x={810} y={790} txt="¿se acepta?" p={rampa(t, M.aceptarlo - 0.4, 0.3)} tam={34} fondo="#E3F6EC" giro={2} />
        </>
      )}
      <Sombra x={250} y={1530} w={170} />
      <Mascota esp="hamster-gorra" x={250} y={1535} alto={260} t={t} cara="feliz" semilla={3} />
      <Sombra x={830} y={1530} w={170} />
      <Mascota esp="gato-gafas" x={830} y={1535} alto={270} t={t} cara="feliz" semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 6–8 · La inspección ═════ */
function Inspeccion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(7), b: E(8) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const pL = rampa(t, M.revisa7 - 0.4, 0.4);
  const L = [[M.pisos, "tres pisos", true], [M.nueces, "sin nueces", true], [M.rosadas - 0.3, "flores blancas", false]];
  const C = [[M.medir, "📏 medir"], [M.examinar, "🔍 examinar"], [M.validar6, "✅ validar"]];
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={160} txt="🔍 inspección" p={rampa(t, M.inspeccion - 0.3, 0.35)} tam={52} fondo={MANGO} />
      {C.map(([tw, txt], k) => <Cartel key={k} x={200 + k * 340} y={280} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={38} fondo={CREMA} giro={[-2, 1, 2][k]} />)}
      <Cartel x={540} y={390} txt="contra requisitos y criterios de aceptación" p={rampa(t, M.requisitos - 0.3, 0.3)} tam={34} fondo="#DDE3FF" />
      {pL > 0 && (
        <div style={{ position: "absolute", left: 90, top: 480, width: 560, height: 360, background: "#FFFDF7", border: `7px solid ${TINTA}`, borderRadius: 24, boxShadow: "0 12px 0 rgba(42,30,23,.25)", transform: `scale(${rebote(pL)})`, transformOrigin: "50% 0", fontFamily: "Sora", fontWeight: 800, color: TINTA }}>
          <div style={{ position: "absolute", left: 30, top: 18, fontSize: 34 }}>📋 lo que pidió Carmen</div>
          {L.map(([tw, txt, ok], k) => {
            const q = rampa(t, tw - 0.3, 0.3);
            return (
              <div key={k} style={{ position: "absolute", left: 30, right: 30, top: 90 + k * 86, height: 70, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 38, opacity: q > 0 ? 1 : 0.35 }}>
                <span>{txt}</span>
                {q > 0 && <span style={{ fontSize: 50, transform: `scale(${rebote(q)})` }}>{ok ? "✅" : "❌"}</span>}
              </div>
            );
          })}
        </div>
      )}
      <Pastel x={850} y={820} w={250} p={pL} flores="#FF9EC4" />
      <Cartel x={850} y={880} txt="🌸 rosadas" p={rampa(t, M.rosadas - 0.3, 0.3)} tam={34} fondo="#FFE1D8" giro={3} />
      <Cartel x={540} y={1040} txt="🗳️ votación" p={rampa(t, M.votacion - 0.4, 0.3)} tam={44} fondo={CREMA} giro={-1} />
      {[0, 1, 2].map((k) => <Gigante key={k} x={380 + k * 160} y={1150} txt="✋" p={rampa(t, M.votacion - 0.2 + k * 0.12, 0.3)} tam={70} />)}
      <Sombra x={170} y={1540} w={150} />
      <Mascota esp="hamster-gorra" x={170} y={1545} alto={230} t={t} cara="feliz" semilla={3} />
      <Sombra x={910} y={1540} w={150} />
      <Mascota esp="gato-gafas" x={910} y={1545} alto={240} t={t} cara={t > M.rosadas - 0.3 ? "tranquila" : "feliz"} semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 9–10 · Aceptado o no ═════ */
function Salidas({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10) + 0.3, s: 1.02, x: 540, y: 960 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={270} y={190} txt="✅ cumple" p={rampa(t, M.cumple - 0.3, 0.3)} tam={44} fondo="#E3F6EC" />
      <Documento x={270} y={470} w={300} p={rampa(t, M.firma - 0.4, 0.4)} titulo="entregables aceptados" letra={34} giro={-2} />
      <Cartel x={290} y={590} txt="✍️ firmado" p={rampa(t, M.aceptados9 - 0.3, 0.3)} tam={40} fondo={CREMA} giro={-8} />
      <Cartel x={810} y={190} txt="❌ no cumple" p={rampa(t, M.razones - 0.6, 0.3)} tam={44} fondo="#FFE1D8" />
      <Cartel x={790} y={310} txt="📝 se documentan las razones" p={rampa(t, M.razones - 0.3, 0.3)} tam={27} fondo="#FFFDF7" giro={1} />
      <Documento x={810} y={560} w={250} p={rampa(t, M.solicitud10 - 0.4, 0.4)} titulo="solicitud de cambio" letra={30} giro={3} />
      <Cartel x={810} y={760} txt="🔧 reparar el defecto" p={rampa(t, M.defecto - 0.4, 0.3)} tam={36} fondo={CREMA} giro={-2} />
      <Sombra x={170} y={1540} w={150} />
      <Mascota esp="hamster-gorra" x={170} y={1545} alto={230} t={t} cara={t > M.aceptados9 ? "estrellas" : "feliz"} semilla={3} />
      <Sombra x={910} y={1540} w={150} />
      <Mascota esp="gato-gafas" x={910} y={1545} alto={240} t={t} cara="feliz" semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 11 · Tus criterios ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={260} txt="⚡ tus criterios de aceptación" p={rampa(t, M.toca - 0.2, 0.35)} tam={50} fondo={MANGO} />
      {[0, 1, 2].map((k) => <Cartel key={k} x={540} y={410 + k * 120} txt={`${k + 1}. ________  ✅`} p={rampa(t, M.tres - 0.2 + k * 0.3, 0.3)} tam={44} fondo={CREMA} giro={[-2, 1, -1][k]} />)}
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.criterios11, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="gato-gafas" x={790} y={1535} alto={360} t={t} cara="feliz" semilla={7} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "definicion") return <Definicion t={t} />;
  if (p.tipo === "inspeccion") return <Inspeccion t={t} />;
  if (p.tipo === "salidas") return <Salidas t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.pastel1 - 0.4, "pop", 0.3); fx(M.listo - 0.5, "pop-suave", 0.22); fx(M.acepte - 0.6, "pop-suave", 0.22);
fx(S(3) - 0.3, "whoosh", 0.4); [M.formalizar, M.entregables3, M.objetividad, M.probabilidad].forEach((w) => fx(w - 0.3, "pop", 0.2)); fx(M.calidad5 - 0.4, "pop", 0.2); fx(M.aceptarlo - 0.8, "pop", 0.2);
fx(S(6) - 0.3, "whoosh", 0.4); [M.medir, M.examinar, M.validar6].forEach((w) => fx(w - 0.3, "pop-suave", 0.2)); fx(M.revisa7 - 0.4, "papel", 0.25);
fx(M.pisos - 0.3, "ding", 0.2); fx(M.nueces - 0.3, "ding", 0.2); fx(M.rosadas - 0.3, "baja", 0.25); fx(M.votacion - 0.2, "pop", 0.2);
fx(S(9) - 0.3, "whoosh", 0.4); fx(M.firma - 0.4, "papel", 0.25); fx(M.aceptados9 - 0.3, "firma", 0.3); fx(M.solicitud10 - 0.4, "papel", 0.25); fx(M.defecto - 0.4, "pop", 0.2);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/panaderia.jpg", "art/oficina.jpg"];
const CLAVE = /^(validar|aceptación|aceptados|aceptarlo|entregables|inspección|criterios|votación|calidad|defecto)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP58 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp58-validar-alcance.mp3" sinSonido={sinSonido} />
);
