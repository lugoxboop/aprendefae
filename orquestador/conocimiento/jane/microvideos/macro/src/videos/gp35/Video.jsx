/*
 * Gestión de Proyectos · GP-35 «¿Qué es buen pan?» (gp35-calidad).
 * Una idea: Planificar la Gestión de la Calidad es identificar los requisitos y/o estándares de
 * calidad del proyecto y sus entregables, y documentar cómo se demostrará su cumplimiento (8.1,
 * p. 277). Plan de gestión de la calidad: estándares, objetivos, roles, entregables y procesos a
 * revisar, actividades y herramientas, procedimientos (no conformidad, acciones correctivas, mejora
 * continua) (8.1.3.1, p. 286). Métricas de calidad: atributo y cómo lo verifica Controlar la
 * Calidad (8.1.3.2, p. 287). Conviene revisar el plan temprano (p. 286).
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, ROJO } from "../gp/piezas.jsx";
import { Carpeta } from "../gp22/Video.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3] });
const { S, E, W } = T;

const M = {
  perfecto: W(1, "perfecto;", 0.2), quemado: W(1, "quemado.", 0.35), buen: W(1, "«buen", 0.65),
  define: W(2, "define,", 0.35), comprobarlo: W(2, "comprobarlo.", 0.9),
  planificar: W(3, "Planificar", 0.05), identificar: W(3, "identificar", 0.3), estandares3: W(3, "estándares", 0.45), documentar: W(3, "documentar", 0.75), cumplimiento3: W(3, "cumplimiento.", 0.95),
  plan4: W(4, "plan", 0.5),
  estandares: W(5, "estándares", 0.2), responsable: W(5, "responsable", 0.8),
  entregables: W(6, "entregables", 0.1), actividades: W(6, "actividades", 0.6),
  procedimientos: W(7, "procedimientos", 0.15), conformidades: W(7, "conformidades,", 0.45), correctivas: W(7, "correctivas", 0.7), mejora: W(7, "mejora", 0.85),
  metricas: W(8, "métricas", 0.12), atributo: W(8, "atributo", 0.35), controlar: W(8, "Controlar", 0.7),
  panes: W(9, "panes", 0.3), satisfaccion: W(9, "satisfacción", 0.8),
  parte: W(10, "parte", 0.1), direccion10: W(10, "dirección", 0.4), temprano: W(10, "temprano.", 0.95),
  toca: W(11, "toca:", 0.15), metrica11: W(11, "métrica", 0.5), proyecto11: W(11, "proyecto.", 0.95),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "definicion", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "plan", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "metricas", desde: S(8) - 0.3, entra: "barrido-izq" },
  { tipo: "carpeta", desde: S(10) - 0.3, entra: "barrido" },
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

/* Pan: bueno o quemado */
function Pan({ x, y, p, quemado, tam = 200 }) {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x - tam / 2, top: y - tam / 2, width: tam, height: tam, fontSize: tam * 0.8, lineHeight: `${tam}px`, textAlign: "center", transform: `scale(${rebote(Math.min(1, p))})`, filter: quemado ? "brightness(0.3) sepia(0.6)" : "none" }}>🍞</div>
  );
}

/* ═════ 1–2 · ¿Buen pan? ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  const pQ = rampa(t, M.quemado - 0.3, 0.35);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(5px)" velo={0.15}>
      <Pan x={300} y={480} p={rampa(t, M.perfecto - 0.4, 0.35)} tam={240} />
      <Cartel x={300} y={660} txt="✨ lunes" p={rampa(t, M.perfecto - 0.2, 0.3)} tam={40} fondo="#E3F6EC" giro={-3} />
      <Pan x={780} y={480} p={pQ} quemado tam={240} />
      <Gigante x={830} y={330} txt="💨" p={pQ} tam={90} />
      <Cartel x={780} y={660} txt="🔥 martes" p={rampa(t, M.quemado - 0.1, 0.3)} tam={40} fondo="#FFE1D8" giro={3} />
      <Cartel x={540} y={850} txt="¿qué es «buen pan»?" p={rampa(t, M.buen - 0.4, 0.35)} tam={56} fondo={MANGO} giro={-2} />
      <Cartel x={540} y={1010} txt="sin definirlo, 🔍 no se puede comprobar" p={rampa(t, M.comprobarlo - 0.7, 0.35)} tam={38} fondo={CREMA} giro={1} />
      <Sombra x={250} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={250} y={1515} alto={360} t={t} cara={t > M.quemado ? "triste" : "feliz"} cab={5 * Math.sin(t * 3)} semilla={3} />
      <Sombra x={830} y={1510} w={210} />
      <Mascota esp="gato-gafas" x={830} y={1515} alto={380} t={t} cara="tranquila" semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 3 · Qué es ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3), b: E(3) + 0.3, s: 1.03, x: 540, y: 955 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={250} txt="planificar la gestión de la calidad" p={rampa(t, M.planificar - 0.3, 0.35)} tam={50} fondo={MANGO} />
      <Cartel x={540} y={450} txt="🔎 identificar requisitos y estándares" p={rampa(t, M.identificar - 0.35, 0.35)} tam={42} fondo={CREMA} giro={-1} />
      <Cartel x={540} y={570} txt="del proyecto y sus entregables" p={rampa(t, M.estandares3, 0.35)} tam={36} fondo={CREMA} giro={1} />
      <Cartel x={540} y={760} txt="📝 documentar cómo se demostrará" p={rampa(t, M.documentar - 0.35, 0.35)} tam={42} fondo="#DDE3FF" giro={1} />
      <Cartel x={540} y={880} txt="✅ su cumplimiento" p={rampa(t, M.cumplimiento3 - 0.4, 0.35)} tam={42} fondo="#E3F6EC" giro={-2} />
      <Sombra x={540} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 4–7 · El plan ═════ */
function Plan({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(7) - 0.2, b: E(7), s: 1.02, x: 540, y: 960 }]);
  const FIL = [
    [M.estandares, "📐", "estándares y objetivos", "qué es «buen pan» para nosotros", "#FFF4DA"],
    [M.responsable, "🙋", "roles y responsabilidades", "quién responde por qué", "#DDE3FF"],
    [M.entregables, "🔍", "entregables y procesos", "qué se va a revisar", "#E3F6EC"],
    [M.actividades, "🛠️", "actividades y herramientas", "con qué se controla y se asegura", "#FFE1D8"],
    [M.procedimientos, "📋", "procedimientos", "no conformidad · acciones correctivas · mejora continua", "#FFF4DA"],
  ];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Hoja x={540} y={170} w={990} h={1050} p={rampa(t, M.plan4 - 0.4, 0.4)} titulo="plan de gestión de la calidad" filas={FIL} t={t} />
      <Sombra x={200} y={1510} w={170} />
      <Mascota esp="hamster-gorra" x={200} y={1515} alto={260} t={t} cara="feliz" semilla={3} />
      <Sombra x={880} y={1510} w={160} />
      <Mascota esp="gato-gafas" x={880} y={1515} alto={260} t={t} cara={t > M.mejora ? "estrellas" : "tranquila"} semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 8–9 · Métricas de calidad ═════ */
function Metricas({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(9), b: E(9), s: 1.02, x: 540, y: 960 }]);
  const pP = rampa(t, M.panes - 0.4, 0.35), pS = rampa(t, M.satisfaccion - 0.4, 0.35);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(7px)" velo={0.35}>
      <Cartel x={540} y={230} txt="📊 métricas de calidad" p={rampa(t, M.metricas - 0.35, 0.35)} tam={56} fondo={MANGO} />
      <Cartel x={540} y={370} txt="un atributo del producto o del proyecto" p={rampa(t, M.atributo - 0.35, 0.35)} tam={36} fondo={CREMA} giro={-1} />
      <Cartel x={540} y={480} txt="✔️ lo verifica Controlar la Calidad" p={rampa(t, M.controlar - 0.35, 0.35)} tam={36} fondo="#DDE3FF" giro={1} />
      <div style={{ position: "absolute", left: 100, top: 600, width: 420, height: 400, background: "#FFFDF7", border: `7px solid ${TINTA}`, borderRadius: 24, opacity: pP, transform: `scale(${rebote(pP)})`, fontFamily: "Sora", fontWeight: 800, color: TINTA, textAlign: "center" }}>
        <div style={{ marginTop: 30, fontSize: 90, filter: "brightness(0.3) sepia(0.6)" }}>🍞</div>
        <div style={{ fontSize: 36, marginTop: 10, lineHeight: 1.15 }}>panes quemados<br />por día</div>
        <div style={{ fontSize: 44, marginTop: 14, color: ROJO }}>🎯 meta: ___</div>
      </div>
      <div style={{ position: "absolute", left: 560, top: 600, width: 420, height: 400, background: "#FFFDF7", border: `7px solid ${TINTA}`, borderRadius: 24, opacity: pS, transform: `scale(${rebote(pS)})`, fontFamily: "Sora", fontWeight: 800, color: TINTA, textAlign: "center" }}>
        <div style={{ marginTop: 30, fontSize: 90 }}>😋</div>
        <div style={{ fontSize: 36, marginTop: 10, lineHeight: 1.15 }}>satisfacción<br />de los clientes</div>
        <div style={{ fontSize: 44, marginTop: 14 }}>🎯 meta: ___</div>
      </div>
      <Sombra x={540} y={1520} w={200} />
      <Mascota esp="hamster-gorra" x={540} y={1525} alto={280} t={t} cara={t > M.satisfaccion ? "estrellas" : "feliz"} semilla={3} />
    </Escena>
  );
}

/* ═════ 10 · Parte del plan para la dirección ═════ */
function EnCarpeta({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10), s: 1.03, x: 540, y: 960 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Carpeta x={540} y={260} w={760} h={620} p={rampa(t, M.parte - 0.4, 0.4)}>
        <Documento x={380} y={380} w={260} p={rampa(t, M.direccion10, 0.4)} titulo="plan de gestión de la calidad" letra={32} giro={-3} />
      </Carpeta>
      <Cartel x={540} y={1020} txt="⏰ revísalo temprano" p={rampa(t, M.temprano - 0.5, 0.35)} tam={52} fondo={MANGO} giro={-2} />
      <Sombra x={540} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 11 · Tu métrica ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={320} txt="⚡ define tu métrica" p={rampa(t, M.toca - 0.2, 0.35)} tam={60} fondo={MANGO} />
      <Cartel x={540} y={500} txt="📊 atributo: ________" p={rampa(t, M.metrica11 - 0.3, 0.3)} tam={48} fondo={CREMA} giro={-2} />
      <Cartel x={540} y={640} txt="✔️ se mide con: ________" p={rampa(t, M.proyecto11 - 0.6, 0.3)} tam={46} fondo={CREMA} giro={2} />
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
  if (p.tipo === "plan") return <Plan t={t} />;
  if (p.tipo === "metricas") return <Metricas t={t} />;
  if (p.tipo === "carpeta") return <EnCarpeta t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.perfecto - 0.4, "pop", 0.3); fx(M.quemado - 0.3, "crujido", 0.3); fx(M.buen - 0.4, "pop", 0.3); fx(M.comprobarlo - 0.7, "toc-grave", 0.3);
fx(S(3) - 0.3, "whoosh", 0.4); fx(M.identificar - 0.35, "pop", 0.3); fx(M.documentar - 0.35, "tiza", 0.25); fx(M.cumplimiento3 - 0.4, "ding", 0.25);
fx(S(4) - 0.3, "whoosh", 0.4); fx(M.plan4 - 0.4, "papel", 0.3); [M.estandares, M.responsable, M.entregables, M.actividades, M.procedimientos].forEach((w) => fx(w - 0.4, "pop-suave", 0.25)); fx(M.mejora, "ding", 0.2);
fx(S(8) - 0.3, "whoosh", 0.4); fx(M.metricas - 0.35, "pop", 0.3); fx(M.controlar - 0.35, "sello", 0.25); fx(M.panes - 0.4, "pop", 0.3); fx(M.satisfaccion - 0.4, "pop", 0.3);
fx(S(10) - 0.3, "whoosh", 0.4); fx(M.parte - 0.4, "papel", 0.3); fx(M.temprano - 0.5, "campana", 0.25);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/panaderia.jpg", "art/oficina.jpg"];
const CLAVE = /^(calidad|estándares|métricas|métrica|plan|procedimientos|cumplimiento|requisitos)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP35 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp35-calidad.mp3" sinSonido={sinSonido} />
);
