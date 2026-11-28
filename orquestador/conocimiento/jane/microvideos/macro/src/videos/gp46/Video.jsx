/*
 * Gestión de Proyectos · GP-46 «¡A trabajar!» (gp46-dirigir).
 * Una idea: Dirigir y Gestionar el Trabajo del Proyecto es liderar y llevar a cabo el trabajo definido en
 * el plan para la dirección del proyecto e implementar los cambios aprobados (4.3, p. 90).
 * Salidas: entregables (4.3.3.1); datos de desempeño del trabajo, observaciones y mediciones brutas
 * (4.3.3.2); registro de incidentes: tipo, quién y cuándo, descripción, prioridad, asignado, fecha límite,
 * estado, solución (4.3.3.3); solicitudes de cambio: propuesta formal para modificar cualquier documento,
 * entregable o línea base; cualquier interesado; Realizar el Control Integrado de Cambios; acción
 * correctiva, preventiva, reparación de defectos, actualizaciones (4.3.3.4, p. 96).
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, ROJO } from "../gp/piezas.jsx";
import { Hoja } from "../gp/hoja.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3], manual: { 3: ["Dirigir y gestionar el trabajo del proyecto", "es liderar y llevar a cabo el trabajo definido", "en el plan para la dirección del proyecto,", "e implementar los cambios aprobados."] } });
const { S, E, W } = T;

const M = {
  plan1: W(1, "plan", 0.1), listo: W(1, "listo.", 0.3), feria: W(1, "feria,", 0.55), hornear: W(1, "hornear", 0.8),
  dirige: W(2, "dirige", 0.5),
  dirigir: W(3, "Dirigir", 0.03), liderar: W(3, "liderar", 0.3), definido: W(3, "definido", 0.5), implementar: W(3, "implementar", 0.82), aprobados: W(3, "aprobados.", 0.98),
  entregables: W(4, "entregables:", 0.4), panes: W(4, "panes,", 0.6), tortas: W(4, "tortas,", 0.75), puesto: W(4, "puesto", 0.9),
  datos: W(5, "datos", 0.15), brutas: W(5, "brutas,", 0.55), gasto: W(5, "gastó", 0.75), tardo: W(5, "tardó", 0.9),
  inesperado: W(6, "inesperado", 0.3), registro6: W(6, "registro", 0.75),
  batidora: W(7, "batidora:", 0.25), prioridad: W(7, "prioridad,", 0.5), quien7: W(7, "quién", 0.65), cuando: W(7, "cuándo.", 0.97),
  solicitud: W(8, "solicitud", 0.3), formal8: W(8, "formal", 0.5), documento8: W(8, "documento,", 0.75), entregable8: W(8, "entregable", 0.85), base8: W(8, "base.", 0.98),
  cualquier: W(9, "Cualquier", 0.05), realizar: W(9, "Realizar", 0.6),
  correctiva: W(10, "correctiva,", 0.3), preventiva: W(10, "preventiva,", 0.45), reparacion: W(10, "reparación", 0.6), actualizacion: W(10, "actualización.", 0.97),
  toca: W(11, "toca:", 0.15), incidente11: W(11, "incidente", 0.3), prioridad11: W(11, "prioridad", 0.8), responsable: W(11, "responsable.", 0.97),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "definicion", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "salidas", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "incidentes", desde: S(6) - 0.3, entra: "barrido-izq" },
  { tipo: "solicitud", desde: S(8) - 0.3, entra: "barrido" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* ═════ 1–2 · Hoy empieza la feria ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(5px)" velo={0.15}>
      <Documento x={300} y={430} w={300} p={rampa(t, M.plan1 - 0.4, 0.4)} titulo="plan" letra={50} giro={-4} sello={rampa(t, M.listo - 0.2, 0.4)} />
      <Cartel x={790} y={330} txt="🎪 ¡hoy: feria!" p={rampa(t, M.feria - 0.3, 0.35)} tam={48} fondo={MANGO} giro={3} />
      <Gigante x={790} y={560} txt="🔥🍞" p={rampa(t, M.hornear - 0.3, 0.35)} tam={130} />
      <Cartel x={540} y={860} txt="¿quién dirige el trabajo?" p={rampa(t, M.dirige - 0.4, 0.3)} tam={44} fondo="#DDE3FF" giro={-1} />
      <Sombra x={260} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={260} y={1515} alto={360} t={t} cara="feliz" salto={30 * pulso(t, M.feria, 0.5)} semilla={3} />
      <Sombra x={820} y={1510} w={190} />
      <Mascota esp="gato-gafas" x={820} y={1515} alto={340} t={t} cara="feliz" semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 3 · Qué es ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3), b: E(3) + 0.3, s: 1.03, x: 540, y: 955 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={240} txt="dirigir y gestionar el trabajo del proyecto" p={rampa(t, M.dirigir - 0.3, 0.35)} tam={36} fondo={MANGO} />
      <Cartel x={540} y={430} txt="▶️ liderar y llevar a cabo" p={rampa(t, M.liderar - 0.3, 0.3)} tam={46} fondo={CREMA} giro={-1} />
      <Cartel x={540} y={560} txt="📘 el trabajo del plan" p={rampa(t, M.definido - 0.3, 0.3)} tam={42} fondo="#FFFDF7" giro={1} />
      <Cartel x={540} y={720} txt="✅ implementar los cambios aprobados" p={rampa(t, M.implementar - 0.3, 0.3)} tam={38} fondo="#E3F6EC" giro={-1} />
      <Sombra x={540} y={1510} w={190} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 4–5 · Entregables y datos ═════ */
function Salidas({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(5), b: E(5) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const E4 = [[M.panes, "🍞", "panes"], [M.tortas, "🎂", "tortas"], [M.puesto, "⛺", "puesto armado"]];
  const pD = rampa(t, M.datos - 0.4, 0.4);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={190} txt="📦 entregables" p={rampa(t, M.entregables - 0.4, 0.35)} tam={50} fondo={MANGO} />
      {E4.map(([tw, ic, txt], k) => (
        <div key={k}>
          <Gigante x={220 + k * 320} y={350} txt={ic} p={rampa(t, tw - 0.3, 0.35)} tam={110} />
          <Cartel x={220 + k * 320} y={470} txt={txt} p={rampa(t, tw - 0.2, 0.3)} tam={34} fondo={CREMA} giro={[-2, 2, -1][k]} />
        </div>
      ))}
      {pD > 0 && (
        <div style={{ position: "absolute", left: 140, top: 600, width: 800, height: 470, background: "#FFFDF7", border: `8px solid ${TINTA}`, borderRadius: 26, boxShadow: "0 14px 0 rgba(42,30,23,.28)", transform: `scale(${rebote(pD)})`, fontFamily: "Sora", fontWeight: 800, color: TINTA }}>
          <div style={{ height: 100, background: AZUL, color: "#fff", borderRadius: "18px 18px 0 0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38 }}>datos de desempeño del trabajo</div>
          <div style={{ position: "absolute", left: 40, top: 130, fontSize: 34, color: "#5B4A3E", opacity: rampa(t, M.brutas - 0.3, 0.3) }}>🔍 observaciones brutas</div>
          {[[M.gasto, "💲 cuánto se gastó"], [M.tardo, "⏱️ cuánto tardó cada tarea"]].map(([tw, txt], k) => {
            const q = rampa(t, tw - 0.3, 0.3);
            return <div key={k} style={{ position: "absolute", left: 40, right: 40, top: 200 + k * 120, height: 96, display: "flex", alignItems: "center", paddingLeft: 24, background: "#DDE3FF", border: `5px solid ${TINTA}`, borderRadius: 18, fontSize: 38, opacity: Math.min(1, q * 3), transform: `scale(${rebote(q)})` }}>{txt}</div>;
          })}
        </div>
      )}
      <Sombra x={180} y={1530} w={150} />
      <Mascota esp="hamster-gorra" x={180} y={1535} alto={240} t={t} cara="feliz" semilla={3} />
      <Sombra x={900} y={1530} w={150} />
      <Mascota esp="gato-gafas" x={900} y={1535} alto={240} t={t} cara="tranquila" semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 6–7 · Registro de incidentes ═════ */
function Incidentes({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(7), b: E(7) + 0.3, s: 1.02, x: 540, y: 960 }]);
  const filas = [
    [M.batidora, "🥣", "incidente", "se dañó la batidora", "#FFE1D8"],
    [M.prioridad, "❗", "prioridad", "alta", CREMA],
    [M.quien7, "🙋", "quién lo resuelve", "Ramón", "#E3F6EC"],
    [M.cuando, "📅", "para cuándo", "antes del mediodía", "#DDE3FF"],
  ];
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={170} txt="⚡ ¡algo inesperado!" p={rampa(t, M.inesperado - 0.4, 0.3)} tam={46} fondo={MANGO} giro={-2} />
      <Hoja x={540} y={280} w={860} h={870} p={rampa(t, M.registro6 - 0.4, 0.4)} titulo="registro de incidentes" filas={filas} t={t} />
      <Sombra x={200} y={1530} w={150} />
      <Mascota esp="hamster-gorra" x={200} y={1535} alto={240} t={t} cara={t < M.quien7 ? "triste" : "tranquila"} semilla={3} />
      <Sombra x={880} y={1530} w={150} />
      <Mascota esp="perro-corbatin" x={880} y={1535} alto={250} t={t} cara="feliz" salto={30 * pulso(t, M.quien7, 0.5)} semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 8–10 · Solicitud de cambio ═════ */
function Solicitud({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(9), b: E(10), s: 1.02, x: 540, y: 960 }]);
  const Q = [[M.documento8, "📄 documento"], [M.entregable8, "🍞 entregable"], [M.base8, "📏 línea base"]];
  const TI = [[M.correctiva, "🔧 acción correctiva"], [M.preventiva, "🛡️ acción preventiva"], [M.reparacion, "🩹 reparación de defectos"], [M.actualizacion, "🔄 actualización"]];
  const pR = rampa(t, M.realizar - 0.4, 0.4);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Documento x={250} y={300} w={280} p={rampa(t, M.solicitud - 0.4, 0.4)} titulo="solicitud de cambio" letra={38} giro={-3} />
      <Cartel x={720} y={190} txt="📝 propuesta formal" p={rampa(t, M.formal8 - 0.3, 0.3)} tam={38} fondo={MANGO} giro={2} />
      <Cartel x={720} y={260 + 50} txt="para modificar…" p={rampa(t, M.formal8 + 0.4, 0.3)} tam={32} fondo="#FFFDF7" />
      {Q.map(([tw, txt], k) => <Cartel key={k} x={720} y={410 + k * 100} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={36} fondo={CREMA} giro={[-1, 1, -1][k]} />)}
      <Cartel x={540} y={700} txt="🙋 cualquier interesado puede pedirla" p={rampa(t, M.cualquier - 0.3, 0.3)} tam={38} fondo="#E3F6EC" giro={-1} />
      {pR > 0 && <Gigante x={540} y={790} txt="⬇️" p={pR} tam={60} />}
      <Cartel x={540} y={880} txt="🔁 Realizar el Control Integrado de Cambios" p={pR} tam={34} fondo="#DDE3FF" giro={1} />
      {TI.map(([tw, txt], k) => <Cartel key={k} x={k % 2 ? 790 : 290} y={1030 + Math.floor(k / 2) * 115} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={32} fondo="#FFFDF7" giro={[-2, 2, 1, -1][k]} />)}
      <Sombra x={540} y={1530} w={170} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={240} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 11 · Tu incidente ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={280} txt="⚡ tu incidente" p={rampa(t, M.toca - 0.2, 0.35)} tam={58} fondo={MANGO} />
      <Cartel x={540} y={450} txt="⚠️ qué pasó: ________" p={rampa(t, M.incidente11 - 0.3, 0.3)} tam={44} fondo={CREMA} giro={-2} />
      <Cartel x={540} y={580} txt="❗ prioridad: ________" p={rampa(t, M.prioridad11 - 0.3, 0.3)} tam={44} fondo={CREMA} giro={1} />
      <Cartel x={540} y={710} txt="🙋 responsable: ________" p={rampa(t, M.responsable - 0.5, 0.3)} tam={44} fondo={CREMA} giro={-1} />
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.responsable, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="gato-gafas" x={790} y={1535} alto={370} t={t} cara="feliz" semilla={7} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "definicion") return <Definicion t={t} />;
  if (p.tipo === "salidas") return <Salidas t={t} />;
  if (p.tipo === "incidentes") return <Incidentes t={t} />;
  if (p.tipo === "solicitud") return <Solicitud t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.plan1 - 0.4, "papel", 0.3); fx(M.listo - 0.2, "sello", 0.3); fx(M.feria - 0.3, "pop", 0.3); fx(M.hornear - 0.3, "pop-suave", 0.25); fx(M.dirige - 0.4, "pop-suave", 0.22);
fx(S(3) - 0.3, "whoosh", 0.4); [M.liderar, M.definido, M.implementar].forEach((w) => fx(w - 0.3, "pop", 0.22));
fx(S(4) - 0.3, "whoosh", 0.4); [M.panes, M.tortas, M.puesto].forEach((w) => fx(w - 0.3, "pop", 0.22)); fx(M.datos - 0.4, "desliza", 0.25); [M.gasto, M.tardo].forEach((w) => fx(w - 0.3, "pop-suave", 0.2));
fx(S(6) - 0.3, "whoosh", 0.4); fx(M.inesperado - 0.4, "golpe", 0.25); fx(M.registro6 - 0.4, "papel", 0.3); [M.batidora, M.prioridad, M.quien7, M.cuando].forEach((w) => fx(w - 0.4, "pop-suave", 0.2));
fx(S(8) - 0.3, "whoosh", 0.4); fx(M.solicitud - 0.4, "papel", 0.3); [M.documento8, M.entregable8, M.base8].forEach((w) => fx(w - 0.3, "pop-suave", 0.2)); fx(M.realizar - 0.4, "desliza", 0.25);
[M.correctiva, M.preventiva, M.reparacion, M.actualizacion].forEach((w) => fx(w - 0.3, "pop", 0.2));
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/panaderia.jpg", "art/oficina.jpg"];
const CLAVE = /^(dirigir|gestionar|entregables|datos|desempeño|incidentes|incidente|solicitud|cambio|cambios|correctiva|preventiva)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP46 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp46-dirigir.mp3" sinSonido={sinSonido} />
);
