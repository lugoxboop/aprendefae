/*
 * Gestión de Proyectos · GP-53 «El plan que nadie hizo» (gp53-implementar-riesgos).
 * Una idea: Implementar la Respuesta a los Riesgos es implementar planes acordados de respuesta a los
 * riesgos; asegura que se ejecuten tal como se planificaron (11.6, p. 449). Problema común: se documentan
 * las respuestas pero no se toman medidas; la clave es el esfuerzo de los dueños de los riesgos (p. 450).
 * Influencia del director (11.6.2.2); solicitudes de cambio a las líneas base de costos o del cronograma
 * (11.6.3.1); registro de incidentes y de lecciones aprendidas (11.6.3.2, p. 451–452).
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
    9: ["Al implementar, pueden salir solicitudes de cambio,", "por ejemplo a la línea base de costos o del cronograma."],
    10: ["Si aparecen incidentes, van al registro de incidentes.", "Y lo aprendido, al registro de lecciones aprendidas."],
  },
});
const { S, E, W } = T;

const M = {
  horno1: W(1, "horno", 0.15), mes: W(1, "mes.", 0.55), nadie1: W(1, "nadie", 0.8),
  ejecuta: W(2, "ejecuta", 0.4), protege: W(2, "protege", 0.7),
  implementar: W(3, "Implementar", 0.03), acordados: W(3, "acordados", 0.6),
  planificaron: W(4, "planificaron.", 0.97),
  comun: W(5, "común:", 0.15), analizan: W(5, "analizan", 0.3), documentan: W(5, "documentan", 0.55), ninguna: W(5, "ninguna", 0.85),
  duenos: W(6, "dueños", 0.25), esfuerzo: W(6, "esfuerzo", 0.65),
  tareas: W(7, "tareas,", 0.25), influencia: W(7, "influencia", 0.6), actuar: W(7, "actuar.", 0.97),
  ramon8: W(8, "Ramón", 0.05), habla: W(8, "habla", 0.55), viernes: W(8, "viernes.", 0.97),
  solicitudes: W(9, "solicitudes", 0.4), costos9: W(9, "costos", 0.8), cronograma9: W(9, "cronograma.", 0.97),
  incidentes10: W(10, "incidentes.", 0.42), lecciones: W(10, "lecciones", 0.9),
  toca: W(11, "toca:", 0.15), riesgo11: W(11, "riesgo", 0.3), dueno11: W(11, "dueño", 0.75), hara: W(11, "hará.", 0.97),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "definicion", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "problema", desde: S(5) - 0.3, entra: "zoom" },
  { tipo: "duenos", desde: S(6) - 0.3, entra: "barrido-izq" },
  { tipo: "salidas", desde: S(9) - 0.3, entra: "barrido" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

const MESES = ["ene", "feb", "mar", "abr"];
/* ═════ 1–2 · El mantenimiento que nadie hizo ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  const pM = rampa(t, M.mes - 0.5, 0.4);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(5px)" velo={0.15}>
      <Gigante x={540} y={260} txt="🔥" p={rampa(t, M.horno1 - 0.3, 0.35)} tam={130} />
      <Cartel x={540} y={400} txt="🔧 mantenimiento cada mes" p={pM} tam={42} fondo={MANGO} giro={-1} />
      {MESES.map((m, k) => {
        const q = rampa(t, M.mes - 0.2 + k * 0.12, 0.3);
        const x = rampa(t, M.nadie1 - 0.2 + k * 0.15, 0.25);
        return (
          <div key={k} style={{ position: "absolute", left: 120 + k * 220, top: 500, width: 180, height: 180, background: "#FFFDF7", border: `6px solid ${TINTA}`, borderRadius: 20, transform: `scale(${rebote(q)})`, opacity: Math.min(1, q * 3), fontFamily: "Sora", fontWeight: 800, color: TINTA, textAlign: "center" }}>
            <div style={{ fontSize: 34, marginTop: 14 }}>{m}</div>
            <div style={{ fontSize: 80, color: ROJO, opacity: x, transform: `scale(${rebote(x)})` }}>✗</div>
          </div>
        );
      })}
      <Cartel x={540} y={830} txt="📄 un plan que no se ejecuta…" p={rampa(t, M.ejecuta - 0.4, 0.3)} tam={40} fondo={CREMA} giro={-1} />
      <Cartel x={540} y={940} txt="…no protege a nadie" p={rampa(t, M.protege - 0.3, 0.3)} tam={42} fondo="#FFE1D8" giro={1} />
      <Sombra x={260} y={1510} w={190} />
      <Mascota esp="hamster-gorra" x={260} y={1515} alto={340} t={t} cara={t > M.nadie1 ? "triste" : "tranquila"} semilla={3} />
      <Sombra x={820} y={1510} w={190} />
      <Mascota esp="perro-corbatin" x={820} y={1515} alto={340} t={t} cara="tranquila" cab={-5 * pulso(t, M.nadie1, 1.2)} semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 3–4 · Qué es ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3), b: E(4) + 0.3, s: 1.03, x: 540, y: 955 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={230} txt="implementar la respuesta a los riesgos" p={rampa(t, M.implementar - 0.3, 0.35)} tam={38} fondo={MANGO} />
      <Documento x={300} y={560} w={300} p={rampa(t, M.acordados - 0.4, 0.4)} titulo="respuestas acordadas" letra={36} giro={-3} />
      <Gigante x={560} y={560} txt="➡️" p={rampa(t, M.acordados, 0.3)} tam={80} />
      <Gigante x={800} y={560} txt="🛠️" p={rampa(t, M.acordados + 0.3, 0.35)} tam={140} />
      <Cartel x={540} y={860} txt="✅ tal como se planificaron" p={rampa(t, M.planificaron - 0.8, 0.3)} tam={42} fondo="#E3F6EC" giro={1} />
      <Sombra x={540} y={1510} w={190} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 5 · El problema común ═════ */
function Problema({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(5), b: E(5) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const P = [[M.analizan, "🔍 analizar los riesgos", "✅", "#E3F6EC"], [M.documentan, "📝 documentar las respuestas", "✅", "#E3F6EC"], [M.ninguna, "🛠️ tomar medidas", "✗", "#FFE1D8"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={220} txt="⚠️ un problema común" p={rampa(t, M.comun - 0.4, 0.35)} tam={48} fondo={MANGO} />
      {P.map(([tw, txt, marca, fondo], k) => {
        const q = rampa(t, tw - 0.35, 0.3);
        if (q <= 0) return null;
        return (
          <div key={k} style={{ position: "absolute", left: 90, top: 360 + k * 170, width: 900, height: 140, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 34px", boxSizing: "border-box", background: fondo, border: `6px solid ${TINTA}`, borderRadius: 22, fontFamily: "Sora", fontWeight: 800, fontSize: 42, color: TINTA, transform: `scale(${rebote(q)})` }}>
            <span>{txt}</span>
            <span style={{ fontSize: 70, color: marca === "✗" ? ROJO : "#1E7F4F" }}>{marca}</span>
          </div>
        );
      })}
      <Sombra x={540} y={1510} w={190} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara={t > M.ninguna ? "triste" : "tranquila"} semilla={3} />
    </Escena>
  );
}

/* ═════ 6–8 · Los dueños de los riesgos ═════ */
function Duenos({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(8), b: E(8) + 0.3, s: 1.04, x: 540, y: 990 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={200} txt="🔑 los dueños de los riesgos" p={rampa(t, M.duenos - 0.4, 0.35)} tam={44} fondo={MANGO} />
      <Cartel x={540} y={320} txt="💪 ponen el esfuerzo para cumplir lo acordado" p={rampa(t, M.esfuerzo - 0.3, 0.3)} tam={32} fondo={CREMA} />
      <Cartel x={300} y={460} txt="📋 ¿otras tareas?" p={rampa(t, M.tareas - 0.3, 0.3)} tam={38} fondo="#FFFDF7" giro={-2} />
      <Cartel x={780} y={460} txt="🧲 influencia" p={rampa(t, M.influencia - 0.3, 0.3)} tam={40} fondo="#DDE3FF" giro={2} />
      <Cartel x={780} y={570} txt="para animarlo a actuar" p={rampa(t, M.actuar - 0.6, 0.3)} tam={32} fondo="#FFFDF7" giro={-1} />
      <Cartel x={760} y={760} txt="🔥 dueño: Ramón" p={rampa(t, M.ramon8 - 0.3, 0.3)} tam={40} fondo={MANGO} giro={2} />
      <Dicho x={70} y={760} w={420} h={180} p={rampa(t, M.habla - 0.3, 0.3)} colaX={300}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 38, textAlign: "center" }}>🔧 ¿el viernes?</div>
      </Dicho>
      <Cartel x={760} y={900} txt="📅 viernes ✅" p={rampa(t, M.viernes - 0.5, 0.3)} tam={42} fondo="#E3F6EC" giro={-1} />
      <Sombra x={300} y={1520} w={190} />
      <Mascota esp="hamster-gorra" x={300} y={1525} alto={320} t={t} cara="feliz" bi={-40 * pulso(t, M.habla, 1.2)} semilla={3} />
      <Sombra x={780} y={1520} w={200} />
      <Mascota esp="perro-corbatin" x={780} y={1525} alto={360} t={t} cara={t > M.viernes - 0.5 ? "feliz" : "tranquila"} salto={30 * pulso(t, M.viernes, 0.5)} semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 9–10 · Salidas ═════ */
function Salidas({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10) + 0.3, s: 1.02, x: 540, y: 960 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Documento x={270} y={340} w={280} p={rampa(t, M.solicitudes - 0.4, 0.4)} titulo="solicitud de cambio" letra={36} giro={-3} />
      <Cartel x={760} y={260} txt="por ejemplo, a la línea base…" p={rampa(t, M.costos9 - 1.0, 0.3)} tam={30} fondo="#FFFDF7" />
      <Cartel x={760} y={370} txt="💲 de costos" p={rampa(t, M.costos9 - 0.3, 0.3)} tam={40} fondo={CREMA} giro={2} />
      <Cartel x={760} y={480} txt="📅 del cronograma" p={rampa(t, M.cronograma9 - 0.4, 0.3)} tam={40} fondo={CREMA} giro={-2} />
      <Documento x={290} y={880} w={280} p={rampa(t, M.incidentes10 - 0.5, 0.4)} titulo="registro de incidentes" letra={34} giro={2} />
      <Documento x={790} y={880} w={280} p={rampa(t, M.lecciones - 0.5, 0.4)} titulo="registro de lecciones aprendidas" letra={25} giro={-2} />
      <Sombra x={540} y={1530} w={170} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={250} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 11 · Tu riesgo y su dueño ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={260} txt="⚡ tu riesgo, en acción" p={rampa(t, M.toca - 0.2, 0.35)} tam={54} fondo={MANGO} />
      <Cartel x={540} y={420} txt="⚠️ riesgo: ________" p={rampa(t, M.riesgo11 - 0.3, 0.3)} tam={44} fondo={CREMA} giro={-2} />
      <Cartel x={540} y={550} txt="🔑 dueño: ________" p={rampa(t, M.dueno11 - 1.1, 0.3)} tam={44} fondo={CREMA} giro={1} />
      <Cartel x={540} y={680} txt="🛠️ qué hará: ________" p={rampa(t, M.dueno11 - 0.35, 0.3)} tam={44} fondo={CREMA} giro={-1} />
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.hara, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="perro-corbatin" x={790} y={1535} alto={370} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "definicion") return <Definicion t={t} />;
  if (p.tipo === "problema") return <Problema t={t} />;
  if (p.tipo === "duenos") return <Duenos t={t} />;
  if (p.tipo === "salidas") return <Salidas t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.horno1 - 0.3, "pop", 0.3); fx(M.mes - 0.5, "pop-suave", 0.25); [0, 1, 2, 3].forEach((k) => fx(M.nadie1 - 0.2 + k * 0.15, "golpe", 0.15)); fx(M.ejecuta - 0.4, "pop-suave", 0.22);
fx(S(3) - 0.3, "whoosh", 0.4); fx(M.acordados - 0.4, "papel", 0.3); fx(M.planificaron - 0.8, "ding", 0.25);
fx(S(5) - 0.3, "whoosh", 0.4); fx(M.analizan - 0.35, "pop", 0.22); fx(M.documentan - 0.35, "pop", 0.22); fx(M.ninguna - 0.35, "golpe", 0.25);
fx(S(6) - 0.3, "whoosh", 0.4); [M.esfuerzo, M.tareas, M.influencia, M.ramon8].forEach((w) => fx(w - 0.3, "pop-suave", 0.2)); fx(M.habla - 0.3, "pop", 0.25); fx(M.viernes - 0.5, "ding", 0.3);
fx(S(9) - 0.3, "whoosh", 0.4); fx(M.solicitudes - 0.4, "papel", 0.3); [M.costos9, M.cronograma9].forEach((w) => fx(w - 0.3, "pop-suave", 0.2)); fx(M.incidentes10 - 0.5, "papel", 0.25); fx(M.lecciones - 0.5, "papel", 0.25);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/panaderia.jpg", "art/oficina.jpg"];
const CLAVE = /^(implementar|respuesta|respuestas|dueños|dueño|influencia|medida|solicitudes|incidentes)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP53 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp53-implementar-riesgos.mp3" sinSonido={sinSonido} />
);
