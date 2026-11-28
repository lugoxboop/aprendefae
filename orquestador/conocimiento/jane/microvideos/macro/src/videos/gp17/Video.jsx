/*
 * Gestión de Proyectos · GP-17 «No toca ningún instrumento» (gp17-esfera).
 * Una idea: el director del proyecto es la persona asignada por la organización ejecutora
 * para liderar al equipo que debe alcanzar los objetivos (3.2, p. 52); como un director de
 * orquesta, no toca todos los instrumentos pero coordina (3.1, p. 51–52). Su esfera de
 * influencia abarca el proyecto, la organización, la industria y la disciplina profesional
 * (3.3, p. 52–56). Los mejores dedican ~90 % del tiempo a comunicar (3.4.4.2, p. 61) y las
 * redes informales son más importantes que las formales (3.3.2, p. 54).
 */
import { Mascota, Sombra, Placa, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, Destello, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Ficha, Tachon, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.4, 0.3, 0.3, 0.35, 0.3, 0.3, 0.3, 0.3, 0.35, 0.3, 0.4] });
const { S, E, W } = T;

const M = {
  hornea: W(1, "hornea,", 0.15), empuja: W(1, "empuja", 0.3), cobra: W(1, "cobra.", 0.55), todo: W(1, "todo", 0.75), ella: W(1, "ella.", 0.95),
  directora: W(2, "directora", 0.15), asignada: W(2, "asignada", 0.45), liderar: W(2, "liderar", 0.6), objetivos: W(2, "objetivos.", 0.95),
  orquesta: W(3, "orquesta:", 0.25), instrumentos: W(3, "instrumentos,", 0.5), musica: W(3, "música", 0.75), coordina: W(3, "coordina", 0.85),
  alla: W(4, "allá", 0.35), esfera4: W(4, "esfera", 0.75), influencia4: W(4, "influencia.", 0.95),
  proyecto5: W(5, "proyecto,", 0.1), equilibra: W(5, "equilibra", 0.25), comunica: W(5, "comunica", 0.6), carmen: W(5, "Carmen,", 0.7), interesados: W(5, "interesados.", 0.95),
  organizacion: W(6, "organización,", 0.1), directores6: W(6, "directores,", 0.35), horno: W(6, "horno,", 0.8), plata: W(6, "plata.", 0.95),
  industria: W(7, "industria,", 0.1), tecnologias: W(7, "tecnologías,", 0.5), mercados: W(7, "mercados", 0.7), estandares: W(7, "estándares.", 0.95),
  profesion: W(8, "profesión,", 0.25), aprendiendo: W(8, "aprendiendo", 0.5), comparte: W(8, "comparte", 0.75),
  noventa: W(9, "noventa", 0.55), tiempo9: W(9, "tiempo", 0.8), comunicar: W(9, "comunicar.", 0.95),
  informal: W(10, "informal,", 0.2), expertos: W(10, "expertos", 0.35), lideres: W(10, "líderes", 0.5), organigrama: W(10, "organigrama.", 0.95),
  toca: W(11, "toca:", 0.15), dibuja: W(11, "dibuja", 0.3), esfera11: W(11, "esfera", 0.55), proyecto11: W(11, "proyecto.", 0.95),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "orquesta", desde: S(2) - 0.3, entra: "barrido" },
  { tipo: "esfera", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "comunica", desde: S(9) - 0.3, entra: "barrido-izq" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* Los anillos de la esfera (3.3.2 a 3.3.5), de adentro hacia afuera */
const CX = 540, CY = 860;
const ANILLOS = [
  [M.proyecto5, "proyecto", 210, COLOR.VERDE],
  [M.organizacion, "organización", 310, AZUL],
  [M.industria, "industria", 405, COLOR.CORAL],
  [M.profesion, "disciplina profesional", 495, MANGO],
];
/* Lo que aparece en cada anillo: [palabra, icono, anillo, ángulo en grados] */
const COSAS = [
  [M.equilibra, "⚖️", 0, -150], [M.carmen, "🐱", 0, -30], [M.interesados, "👥", 0, 160],
  [M.directores6, "🧑‍💼", 1, -30], [M.horno, "🔥", 1, 200], [M.plata, "💰", 1, 20],
  [M.tecnologias, "📱", 2, -145], [M.mercados, "📈", 2, 40], [M.estandares, "📏", 2, 150],
  [M.aprendiendo, "🎓", 3, -40], [M.comparte, "🤝", 3, 140],
];

/* ═════ 1 · No hornea, no empuja, no cobra… y todo depende de ella ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(1) + 0.3, s: 1.0, x: 540, y: 968 }]);
  const tareas = [[M.hornea, "🍞", "hornear", 220], [M.empuja, "🛒", "empujar", 540], [M.cobra, "💵", "cobrar", 860]];
  const pT = rampa(t, M.todo - 0.3, 0.4);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(5px)" velo={0.15}>
      {tareas.map(([tw, ic, txt, x], k) => (
        <div key={k} style={{ opacity: 1 - 0.55 * pT }}>
          <Ficha x={x} y={480} w={260} icono={ic} txt={txt} p={rampa(t, tw - 0.45, 0.35)} giro={k === 1 ? 0 : k ? 4 : -4} letra={44} />
          <Tachon x={x} y={480} w={230} p={rampa(t, tw + 0.05, 0.25)} />
        </div>
      ))}
      <Destello x={540} y={1180} r={320} p={rampa(t, M.todo - 0.2, 0.8)} />
      <Cartel x={540} y={860} txt="y todo depende de ella" p={pT} tam={66} fondo={MANGO} giro={-2} />
      <Sombra x={540} y={1510} w={260} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={420} t={t} cara={t > M.todo - 0.2 ? "estrellas" : "tranquila"} cab={-4 * Math.sin(t * 3)} semilla={3} />
    </Escena>
  );
}

/* ═════ 2–3 · La directora, como un director de orquesta ═════ */
function Orquesta({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3) - 0.2, b: E(3), s: 1.04, x: 540, y: 950 }]);
  const pO = rampa(t, M.orquesta - 0.4, 0.4);
  const inst = [["🎻", 200, 560], ["🥁", 420, 440], ["🎺", 660, 440], ["🎷", 880, 560]];
  const batuta = Math.sin(t * 6) * 22 * clamp01(pO * 2);
  const coord = rampa(t, M.coordina - 0.3, 0.4);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(6px)" velo={0.22}>
      <div style={{ opacity: 1 - pO }}>
        <Cartel x={540} y={380} txt="directora del proyecto" p={rampa(t, M.directora - 0.3, 0.35)} tam={62} fondo={MANGO} />
        <Cartel x={540} y={560} txt="📌 asignada para liderar" p={rampa(t, M.asignada - 0.3, 0.35)} tam={52} fondo={CREMA} />
        <Cartel x={540} y={720} txt="🎯 lograr los objetivos" p={rampa(t, M.objetivos - 0.6, 0.35)} tam={52} fondo="#E3F6EC" giro={-2} />
      </div>
      {inst.map(([ic, x, y], k) => (
        <Gigante key={k} x={x} y={y + 14 * Math.sin(t * 4 + k)} txt={ic} p={rampa(t, M.orquesta - 0.3 + k * 0.12, 0.35)} tam={130} giro={coord > 0 ? 8 * Math.sin(t * 6 + k) : 0} />
      ))}
      <Cartel x={540} y={760} txt="no toca todos los instrumentos" p={rampa(t, M.instrumentos - 0.5, 0.35)} tam={50} fondo={CREMA} giro={-2} />
      <Cartel x={540} y={900} txt="🎼 coordina a todos" p={coord} tam={58} fondo={COLOR.VERDE} color="#fff" giro={2} />
      <Gigante x={700} y={1110} txt="🪄" p={pO} tam={110} giro={-30 + batuta} />
      <Sombra x={540} y={1510} w={250} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={420} t={t} cara={pO > 0.5 ? "feliz" : "tranquila"} bd={pO > 0 ? -50 - batuta * 2 : -50 * pulso(t, M.directora - 0.3, 1)} semilla={3} />
      <Placa x={540} y={1040} nombre="Pía" rol="directora" p={rampa(t, M.directora - 0.3, 0.35) * (1 - pO)} />
    </Escena>
  );
}

/* ═════ 4–8 · La esfera de influencia: proyecto, organización, industria, profesión ═════ */
function Esfera({ t }) {
  const cam = mover(t, { s: 1.06, x: 540, y: 900 }, [{ a: S(4), b: E(8), s: 0.98, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={250} txt="esfera de influencia" p={rampa(t, M.esfera4 - 0.3, 0.35)} tam={64} fondo={MANGO} />
      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width="1" height="1">
        {ANILLOS.map(([, , r], k) => <circle key={"g" + k} cx={CX} cy={CY} r={r * sale(rampa(t, S(4) - 0.1 + k * 0.25, 0.6))} fill="none" stroke={TINTA} strokeOpacity={0.3} strokeWidth={6} strokeDasharray="14 16" />)}
        {ANILLOS.slice().reverse().map(([tw, , r, col], k) => {
          const q = sale(rampa(t, tw - 0.4, 0.6));
          if (q <= 0) return null;
          return <circle key={k} cx={CX} cy={CY} r={r * q} fill={col} fillOpacity={0.14} stroke={col} strokeWidth={8} strokeDasharray={k === 0 ? "20 14" : undefined} />;
        })}
        {rampa(t, M.alla - 0.3, 0.4) > 0 && rampa(t, M.proyecto5 - 0.4, 0.2) < 1 && (
          <circle cx={CX} cy={CY} r={130 + 40 * Math.sin(t * 4)} fill="none" stroke={TINTA} strokeWidth={6} strokeDasharray="12 14" opacity={rampa(t, M.alla - 0.3, 0.4)} />
        )}
      </svg>
      {ANILLOS.map(([tw, nom, r, col], k) => (
        <Cartel key={k} x={CX} y={k % 2 ? CY - r : CY + r} txt={nom} p={rampa(t, tw - 0.2, 0.35)} tam={k ? 40 : 38} fondo={col} color={k === 3 ? TINTA : "#fff"} borde={5} />
      ))}
      {COSAS.map(([tw, ic, a, g], k) => {
        const q = rampa(t, tw - 0.35, 0.35);
        if (q <= 0) return null;
        const r = ANILLOS[a][2] - 48;
        const rad = (g * Math.PI) / 180;
        return <Gigante key={k} x={CX + r * Math.cos(rad)} y={CY + r * Math.sin(rad)} txt={ic} p={q} tam={78} giro={4 * Math.sin(t * 3 + k)} />;
      })}
      <Sombra x={CX} y={CY + 110} w={130} />
      <Mascota esp="hamster-gorra" x={CX} y={CY + 112} alto={230} t={t} cara="feliz" bi={-40 * pulso(t, M.comunica - 0.3, 1)} semilla={3} />
      <Cartel x={540} y={1470} txt="💬 comunica" p={rampa(t, M.comunica - 0.3, 0.35) * (1 - rampa(t, M.organizacion - 0.4, 0.3))} tam={52} fondo={CREMA} />
      <Cartel x={540} y={1470} txt="piden los mismos recursos" p={rampa(t, M.directores6 + 0.3, 0.35) * (1 - rampa(t, M.industria - 0.4, 0.3))} tam={50} fondo={CREMA} />
      <Cartel x={540} y={1470} txt="sigue las tendencias" p={rampa(t, M.industria + 0.2, 0.35) * (1 - rampa(t, M.profesion - 0.4, 0.3))} tam={50} fondo={CREMA} />
      <Cartel x={540} y={1470} txt="aprende y comparte" p={rampa(t, M.aprendiendo - 0.2, 0.35)} tam={50} fondo={CREMA} />
    </Escena>
  );
}

/* ═════ 9–10 · 90 % comunicar; la red informal pesa más ═════ */
function Comunica({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10) - 0.2, b: E(10), s: 1.03, x: 540, y: 960 }]);
  const pN = sale(rampa(t, S(9) - 0.2, M.noventa - S(9) + 0.6));
  const red = rampa(t, M.informal - 0.4, 0.4);
  const nodos = [[M.expertos, "🧑‍🔬", 190, 1000], [M.expertos, "🧑‍🍳", 210, 1330], [M.lideres, "⭐", 890, 1000], [M.lideres, "🧑‍🏫", 870, 1330]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(6px)" velo={0.25}>
      <div style={{ opacity: 1 - red }}>
        <Gigante x={540} y={470} txt={`${Math.round(90 * pN)} %`} p={rampa(t, S(9) - 0.3, 0.3)} tam={200} color={MANGO} />
        <div style={{ position: "absolute", left: 140, top: 640, width: 800, height: 70, border: `7px solid ${TINTA}`, borderRadius: 18, overflow: "hidden", background: "rgba(255,253,247,.9)", opacity: rampa(t, S(9) - 0.3, 0.3) }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${90 * pN}%`, background: COLOR.VERDE }} />
        </div>
        <Cartel x={540} y={800} txt="💬 de su tiempo, a comunicar" p={rampa(t, M.tiempo9 - 0.3, 0.35)} tam={52} fondo={CREMA} />
      </div>
      {/* el organigrama, chiquito y gris */}
      <div style={{ opacity: lerp(1, 0.45, rampa(t, M.organigrama - 0.4, 0.4)), filter: `grayscale(${rampa(t, M.organigrama - 0.4, 0.4)})` }}>
        <Ficha x={540} y={470} w={280} icono="🏢" txt="organigrama" p={rampa(t, M.informal - 0.2, 0.35)} letra={36} />
      </div>
      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width="1" height="1">
        {red > 0 && nodos.map(([, , x, y], k) => (
          <line key={k} x1={540} y1={1260} x2={lerp(540, x, sale(red))} y2={lerp(1260, y, sale(red))} stroke={MANGO} strokeWidth={10} strokeLinecap="round" strokeDasharray="4 18" />
        ))}
      </svg>
      {nodos.map(([tw, ic, x, y], k) => <Gigante key={k} x={x} y={y} txt={ic} p={rampa(t, tw - 0.3 + (k % 2) * 0.15, 0.35)} tam={100} />)}
      <Cartel x={540} y={800} txt="la red informal pesa más" p={rampa(t, M.organigrama - 0.6, 0.35)} tam={50} fondo={COLOR.VERDE} color="#fff" giro={2} />
      <Sombra x={540} y={1510} w={230} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={360} t={t} cara={red > 0 ? "guino" : "feliz"} bi={-50 * pulso(t, M.comunicar - 0.4, 1)} semilla={3} />
    </Escena>
  );
}

/* ═════ 11 · Dibuja la esfera de tu proyecto ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  const d = sale(rampa(t, M.dibuja - 0.2, 1.6));
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={380} txt="✏️ dibuja tu esfera" p={rampa(t, M.toca - 0.2, 0.35)} tam={70} fondo={MANGO} />
      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width="1" height="1">
        {[110, 190, 270].map((r, k) => (
          <circle key={k} cx={540} cy={800} r={r} fill="none" stroke={TINTA} strokeWidth={8} strokeLinecap="round" strokeDasharray={`${2 * Math.PI * r * clamp01(d * 1.6 - k * 0.3)} 4000`} transform="rotate(-90 540 800)" />
        ))}
      </svg>
      <Gigante x={540} y={800} txt="?" p={rampa(t, M.esfera11 - 0.3, 0.35)} tam={130} color={MANGO} giro={-6 + 6 * Math.sin(t * 4)} />
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.proyecto11 - 0.2, 0.5)} semilla={3} />
      <Sombra x={780} y={1530} w={240} />
      <Mascota esp="gato-gafas" x={780} y={1535} alto={460} t={t} cara="feliz" semilla={6} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "orquesta") return <Orquesta t={t} />;
  if (p.tipo === "esfera") return <Esfera t={t} />;
  if (p.tipo === "comunica") return <Comunica t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
[M.hornea, M.empuja, M.cobra].forEach((w) => { fx(w - 0.45, "pop", 0.3); fx(w + 0.05, "tiza", 0.25); });
fx(M.todo - 0.3, "campana", 0.35);
fx(S(2) - 0.3, "whoosh", 0.4); fx(M.directora - 0.3, "pop", 0.35); fx(M.asignada - 0.3, "pop-suave", 0.3); fx(M.objetivos - 0.6, "pop-suave", 0.3);
fx(M.orquesta - 0.3, "redoble", 0.3); fx(M.coordina - 0.3, "ding", 0.35);
fx(S(4) - 0.3, "whoosh", 0.4); fx(M.esfera4 - 0.3, "pop", 0.35);
ANILLOS.forEach(([tw]) => fx(tw - 0.4, "sube", 0.3)); COSAS.forEach(([tw]) => fx(tw - 0.35, "pop-suave", 0.22));
fx(S(9) - 0.3, "whoosh", 0.4); fx(M.noventa - 0.4, "sube", 0.35); fx(M.informal - 0.4, "desliza", 0.3); fx(M.organigrama - 0.6, "ding", 0.3);
fx(M.toca - 0.3, "pop", 0.35); fx(M.dibuja, "tiza-larga", 0.3); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/panaderia.jpg", "art/oficina.jpg"];
const CLAVE = /^(directora|director|orquesta|esfera|influencia|proyecto|organización|industria|profesión|comunicar|noventa|informal)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP17 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp17-esfera.mp3" sinSonido={sinSonido} />
);
