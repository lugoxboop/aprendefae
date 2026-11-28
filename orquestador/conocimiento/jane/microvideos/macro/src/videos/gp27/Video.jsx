/*
 * Gestión de Proyectos · GP-27 «Horas, días o semanas» (gp27-cronograma).
 * Una idea: Planificar la Gestión del Cronograma es establecer las políticas, los procedimientos
 * y la documentación para planificar, desarrollar, gestionar, ejecutar y controlar el
 * cronograma (6.1, p. 179). El plan de gestión del cronograma es componente del plan para la
 * dirección del proyecto; puede ser formal o informal. Puede establecer: desarrollo del modelo
 * de programación (metodología y herramienta), nivel de exactitud (rango aceptable, cantidad
 * para contingencias), unidades de medida, mantenimiento del modelo (registrar el avance),
 * umbrales de control (porcentaje de desviación respecto a la línea base) (6.1.3.1, p. 181–182).
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, Ficha, ROJO } from "../gp/piezas.jsx";
import { Carpeta } from "../gp22/Video.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.4, 0.3, 0.35, 0.3, 0.3, 0.3, 0.3, 0.35, 0.3, 0.3, 0.4] });
const { S, E, W } = T;

const M = {
  horas: W(1, "horas,", 0.25), dias: W(1, "días", 0.45), semanas: W(1, "semanas.", 0.7), nadie: W(1, "Nadie", 0.85),
  armar: W(2, "armar", 0.3), reglas: W(2, "reglas.", 0.95),
  planificar3: W(3, "planificar", 0.12), politicas: W(3, "políticas,", 0.3), procedimientos: W(3, "procedimientos", 0.4), documentacion: W(3, "documentación", 0.5),
  planificar3b: W(3, "planificar,", 0.6), desarrollar: W(3, "desarrollar,", 0.68), gestionar: W(3, "gestionar,", 0.76), ejecutar: W(3, "ejecutar", 0.84), controlar: W(3, "controlar", 0.9),
  plan4: W(4, "plan", 0.6),
  unidades: W(5, "unidades", 0.3), todo5: W(5, "todo", 0.8),
  exactitud: W(6, "exactitud:", 0.2), rango: W(6, "rango", 0.35), contingencias: W(6, "contingencias.", 0.95),
  metodologia: W(7, "metodología", 0.15), herramienta: W(7, "herramienta", 0.4), modelo: W(7, "modelo", 0.8),
  umbrales: W(8, "umbrales", 0.15), desviar: W(8, "desviar", 0.4), medidas: W(8, "medidas.", 0.55), diez: W(8, "diez", 0.7), linea8: W(8, "línea", 0.9),
  registrara: W(9, "registrará", 0.4), avance: W(9, "avance", 0.6),
  parte: W(10, "parte", 0.1), direccion10: W(10, "dirección", 0.35), formal: W(10, "formal", 0.6), informal: W(10, "informal,", 0.7),
  toca: W(11, "toca:", 0.15), unidad11: W(11, "unidad", 0.4), umbral11: W(11, "umbral", 0.7),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "reglas", desde: S(2) - 0.3, entra: "barrido" },
  { tipo: "plan", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "carpeta", desde: S(10) - 0.3, entra: "barrido-izq" },
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

/* ═════ 1 · Horas, días, semanas ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(1) + 0.3, s: 1.0, x: 540, y: 968 }]);
  const P = [[M.horas, 200, "⏱️ horas", "perro-corbatin", 9], [M.dias, 540, "☀️ días", "hamster-gorra", 3], [M.semanas, 880, "🗓️ semanas", "gato-gafas", 7]];
  const lio = t > M.nadie - 0.3;
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(5px)" velo={0.15}>
      {P.map(([tw, x, txt], k) => <Cartel key={k} x={x} y={560 + (k % 2) * 90} txt={txt} p={rampa(t, tw - 0.35, 0.35)} tam={50} fondo={[CREMA, "#E3F6EC", "#DDE3FF"][k]} giro={[-4, 3, -2][k] + (lio ? 4 * Math.sin(t * 9 + k) : 0)} />)}
      <Cartel x={540} y={900} txt="😵 nadie se entiende" p={rampa(t, M.nadie - 0.3, 0.35)} tam={58} fondo={ROJO} color="#fff" giro={-2} />
      {P.map(([tw, x, , esp, sem], k) => (
        <div key={k}>
          <Sombra x={x} y={1510} w={190} />
          <Mascota esp={esp} x={x} y={1515} alto={k === 1 ? 360 : 340} t={t} cara={lio ? "triste" : "feliz"} bd={-50 * pulso(t, tw - 0.3, 1)} semilla={sem} espejo={k === 2} />
        </div>
      ))}
    </Escena>
  );
}

/* ═════ 2–3 · Acordar las reglas ═════ */
function Reglas({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3), b: E(3), s: 1.03, x: 540, y: 955 }]);
  const en3 = rampa(t, S(3) - 0.4, 0.35);
  const TRES = [[M.politicas, "📜", "políticas"], [M.procedimientos, "🧭", "procedimientos"], [M.documentacion, "🗂️", "documentación"]];
  const V = [[M.planificar3b, "planificar"], [M.desarrollar, "desarrollar"], [M.gestionar, "gestionar"], [M.ejecutar, "ejecutar"], [M.controlar, "controlar"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <div style={{ opacity: 1 - en3 }}>
        <Gigante x={540} y={560} txt="📏" p={rampa(t, M.armar - 0.3, 0.35)} tam={200} giro={-12} />
        <Cartel x={540} y={820} txt="primero, las reglas" p={rampa(t, M.reglas - 0.6, 0.35)} tam={60} fondo={MANGO} giro={-2} />
      </div>
      {en3 > 0 && (
        <div style={{ opacity: en3 }}>
          <Cartel x={540} y={240} txt="planificar la gestión del cronograma" p={rampa(t, M.planificar3 - 0.4, 0.35)} tam={44} fondo={MANGO} />
          {TRES.map(([tw, ic, txt], k) => <Ficha key={k} x={200 + k * 340} y={460} w={300} icono={ic} txt={txt} p={rampa(t, tw - 0.35, 0.3)} letra={32} giro={[-3, 2, -2][k]} />)}
          <Cartel x={540} y={690} txt="para…" p={rampa(t, M.planificar3b - 0.5, 0.3)} tam={40} fondo={CREMA} />
          {V.map(([tw, txt], k) => <Cartel key={k} x={k < 3 ? 210 + k * 330 : 375 + (k - 3) * 330} y={k < 3 ? 810 : 930} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={40} fondo="#DDE3FF" giro={[-2, 2, -1, 2, -2][k]} />)}
          <Cartel x={540} y={1070} txt="🗓️ el cronograma" p={rampa(t, M.controlar, 0.35)} tam={48} fondo="#E3F6EC" />
        </div>
      )}
      <Sombra x={540} y={1510} w={210} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara="feliz" bi={-50 * pulso(t, M.reglas - 0.4, 1)} semilla={3} />
    </Escena>
  );
}

/* ═════ 4–9 · El plan de gestión del cronograma ═════ */
function Plan({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(9) - 0.2, b: E(9), s: 1.02, x: 540, y: 960 }]);
  const FIL = [
    [M.unidades, "☀️", "unidades de medida", "aquí, todo en días", "#FFF4DA"],
    [M.exactitud, "🎯", "nivel de exactitud", "rango aceptable + contingencias", "#DDE3FF"],
    [M.metodologia, "🛠️", "metodología y herramienta", "para el modelo de programación", "#E3F6EC"],
    [M.umbrales, "🚦", "umbrales de control", "ej.: 10 % respecto a la línea base", "#FFE1D8"],
    [M.registrara, "📈", "registro del avance", "durante la ejecución", "#FFF4DA"],
  ];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Hoja x={540} y={170} w={990} h={1050} p={rampa(t, M.plan4 - 0.4, 0.4)} titulo="plan de gestión del cronograma" filas={FIL} t={t} />
      <Sombra x={200} y={1510} w={170} />
      <Mascota esp="hamster-gorra" x={200} y={1515} alto={260} t={t} cara={t > M.diez ? "estrellas" : "feliz"} bd={-40 * pulso(t, M.unidades - 0.3, 1)} semilla={3} />
      <Sombra x={880} y={1510} w={160} />
      <Mascota esp="perro-corbatin" x={880} y={1515} alto={250} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 10 · Parte del plan para la dirección ═════ */
function EnCarpeta({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10), s: 1.03, x: 540, y: 960 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Carpeta x={540} y={260} w={760} h={620} p={rampa(t, M.parte - 0.4, 0.4)}>
        <Documento x={380} y={380} w={260} p={rampa(t, M.direccion10, 0.4)} titulo="gestión del cronograma" letra={32} giro={-3} />
      </Carpeta>
      <Cartel x={330} y={1010} txt="formal" p={rampa(t, M.formal - 0.3, 0.3)} tam={52} fondo="#DDE3FF" giro={-3} />
      <Cartel x={750} y={1010} txt="informal" p={rampa(t, M.informal - 0.3, 0.3)} tam={52} fondo={CREMA} giro={3} />
      <Sombra x={540} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 11 · Tu unidad y tu umbral ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={320} txt="⚡ tu turno" p={rampa(t, M.toca - 0.2, 0.35)} tam={64} fondo={MANGO} />
      <Cartel x={540} y={500} txt="☀️ unidad: ________" p={rampa(t, M.unidad11 - 0.3, 0.3)} tam={50} fondo={CREMA} giro={-2} />
      <Cartel x={540} y={640} txt="🚦 umbral: ____ %" p={rampa(t, M.umbral11 - 0.3, 0.3)} tam={50} fondo={CREMA} giro={2} />
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.umbral11, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="gato-gafas" x={790} y={1535} alto={380} t={t} cara="feliz" semilla={7} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "reglas") return <Reglas t={t} />;
  if (p.tipo === "plan") return <Plan t={t} />;
  if (p.tipo === "carpeta") return <EnCarpeta t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
[M.horas, M.dias, M.semanas].forEach((w) => fx(w - 0.35, "pop", 0.3)); fx(M.nadie - 0.3, "toc-grave", 0.35);
fx(S(2) - 0.3, "whoosh", 0.4); fx(M.armar - 0.3, "pop", 0.3); fx(M.reglas - 0.6, "ding", 0.3);
fx(M.planificar3 - 0.4, "pop", 0.3); [M.politicas, M.procedimientos, M.documentacion].forEach((w) => fx(w - 0.35, "pop-suave", 0.22)); [M.planificar3b, M.desarrollar, M.gestionar, M.ejecutar, M.controlar].forEach((w) => fx(w - 0.3, "pop-suave", 0.18));
fx(S(4) - 0.3, "whoosh", 0.4); fx(M.plan4 - 0.4, "papel", 0.35); [M.unidades, M.exactitud, M.metodologia, M.umbrales, M.registrara].forEach((w) => fx(w - 0.4, "pop", 0.25));
fx(S(10) - 0.3, "whoosh", 0.4); fx(M.parte - 0.4, "papel", 0.3); fx(M.formal - 0.3, "pop", 0.25); fx(M.informal - 0.3, "pop", 0.25);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/oficina.jpg"];
const CLAVE = /^(cronograma|plan|unidades|exactitud|umbrales|umbral|metodología|herramienta|avance|formal|informal)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP27 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp27-cronograma.mp3" sinSonido={sinSonido} />
);
