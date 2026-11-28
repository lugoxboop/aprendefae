/*
 * Gestión de Proyectos · GP-50 «De grupo a equipo» (gp50-desarrollar-equipo).
 * Una idea: Desarrollar el Equipo es mejorar las competencias, la interacción de los miembros del equipo y
 * el ambiente general del equipo para lograr un mejor desempeño del proyecto (9.4, p. 336).
 * Escalera de Tuckman: formación, turbulencia, normalización, desempeño, disolución; un equipo puede
 * estancarse o retroceder (p. 338–339). Coubicación (9.4.2.1), desarrollo del espíritu de equipo (9.4.2.4),
 * reconocimiento durante el ciclo de vida y no al final (9.4.2.5), capacitación (9.4.2.6). Evaluaciones de
 * desempeño del equipo: habilidades, competencias, rotación, cohesión (9.4.3.1, p. 343).
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, ROJO } from "../gp/piezas.jsx";
import { Hoja } from "../gp/hoja.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, {
  extra: [0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3],
  manual: { 3: ["Desarrollar el equipo es mejorar las competencias,", "la interacción de los miembros", "y el ambiente general del equipo,", "para lograr un mejor desempeño del proyecto."] },
});
const { S, E, W } = T;

const M = {
  nuevo: W(1, "nuevo.", 0.3), lado: W(1, "lado", 0.65), hablan: W(1, "hablan.", 0.97),
  bueno: W(2, "buen", 0.7),
  desarrollar: W(3, "Desarrollar", 0.03), competencias: W(3, "competencias,", 0.35), interaccion: W(3, "interacción", 0.5), ambiente: W(3, "ambiente", 0.7), desempeno3: W(3, "desempeño", 0.88),
  tuckman: W(4, "Tuckman,", 0.7), cinco: W(4, "cinco", 0.85),
  formacion: W(5, "Formación:", 0.05), turbulencia: W(5, "Turbulencia:", 0.35), normalizacion: W(5, "Normalización:", 0.7),
  desempeno6: W(6, "Desempeño:", 0.05), disolucion: W(6, "disolución:", 0.62),
  estancarse: W(7, "estancarse", 0.4), retroceder: W(7, "retroceder.", 0.97),
  ayuda: W(8, "ayuda?", 0.08), coubicacion: W(8, "coubicación,", 0.2), capacitacion: W(8, "capacitación,", 0.7), reconocimiento8: W(8, "reconocimiento", 0.82), espiritu: W(8, "espíritu", 0.93),
  ojo: W(9, "Ojo:", 0.05), todo9: W(9, "todo", 0.6), final9: W(9, "final.", 0.97),
  evaluaciones: W(10, "evaluaciones", 0.2), habilidades: W(10, "habilidades,", 0.55), cohesion: W(10, "cohesión,", 0.75), gente: W(10, "gente?", 0.97),
  toca: W(11, "toca:", 0.15), etapa11: W(11, "etapa", 0.45), equipo11: W(11, "equipo?", 0.97),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "definicion", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "escalera", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "ayuda", desde: S(8) - 0.3, entra: "barrido-izq" },
  { tipo: "evaluacion", desde: S(10) - 0.3, entra: "barrido" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* ═════ 1–2 · Cada uno por su lado ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  const sep = lerp(0, 1, sale(rampa(t, M.lado - 0.3, 0.6)));
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(5px)" velo={0.15}>
      <Cartel x={540} y={230} txt="🆕 equipo nuevo" p={rampa(t, M.nuevo - 0.3, 0.35)} tam={50} fondo={MANGO} giro={-2} />
      <Gigante x={540} y={560} txt="🤐" p={rampa(t, M.hablan - 0.4, 0.35)} tam={140} />
      <Cartel x={540} y={860} txt="¿cómo se vuelven un equipo?" p={rampa(t, M.bueno - 0.5, 0.3)} tam={42} fondo="#DDE3FF" giro={1} />
      <Sombra x={lerp(330, 150, sep)} y={1510} w={160} />
      <Mascota esp="perro-corbatin" x={lerp(330, 150, sep)} y={1515} alto={300} t={t} cara="tranquila" semilla={9} espejo />
      <Sombra x={540} y={1510} w={160} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara={t > M.hablan ? "triste" : "tranquila"} cab={8 * Math.sin(t * 2.5)} semilla={3} />
      <Sombra x={lerp(750, 930, sep)} y={1510} w={160} />
      <Mascota esp="gato-gafas" x={lerp(750, 930, sep)} y={1515} alto={300} t={t} cara="tranquila" semilla={7} />
    </Escena>
  );
}

/* ═════ 3 · Qué es ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3), b: E(3) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const C = [[M.competencias, "🎓 competencias"], [M.interaccion, "💬 interacción"], [M.ambiente, "🌤️ ambiente del equipo"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={220} txt="desarrollar el equipo" p={rampa(t, M.desarrollar - 0.3, 0.35)} tam={50} fondo={MANGO} />
      <Cartel x={540} y={350} txt="⬆️ mejorar…" p={rampa(t, M.competencias - 0.7, 0.3)} tam={40} fondo="#FFFDF7" />
      {C.map(([tw, txt], k) => <Cartel key={k} x={540} y={480 + k * 125} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={44} fondo={CREMA} giro={[-1, 1, -1][k]} />)}
      <Cartel x={540} y={900} txt="🚀 mejor desempeño del proyecto" p={rampa(t, M.desempeno3 - 0.3, 0.3)} tam={40} fondo="#E3F6EC" giro={1} />
      <Sombra x={540} y={1510} w={190} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 4–7 · Escalera de Tuckman ═════ */
const ETAPAS = [
  ["formación", "👋 se conocen", "#FFFDF7"],
  ["turbulencia", "⚡ chocan las ideas", "#FFE1D8"],
  ["normalización", "🤝 aprenden a confiar", CREMA],
  ["desempeño", "🚀 una unidad", "#E3F6EC"],
  ["disolución", "👋 se despiden", "#DDE3FF"],
];
function Escalera({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(6), b: E(7), s: 1.03, x: 540, y: 960 }]);
  const tw = [M.formacion, M.turbulencia, M.normalizacion, M.desempeno6, M.disolucion];
  const actual = tw.reduce((a, w, k) => (t >= w - 0.2 ? k : a), -1);
  const pE = rampa(t, M.estancarse - 0.3, 0.3);
  const pR = rampa(t, M.retroceder - 0.5, 0.3);
  const yEsc = (k) => 1060 - k * 165;
  const xEsc = (k) => 120 + k * 120;
  /* la mascota sube de escalón en escalón; al final retrocede uno como ejemplo */
  let paso = Math.max(0, actual);
  if (pR > 0) paso = lerp(2, 1, sale(pR));
  else if (t > E(6)) paso = 2;
  const pk = Math.floor(paso), fr = paso - pk;
  const mx = lerp(xEsc(pk), xEsc(Math.min(4, pk + 1)), fr) + 55, my = lerp(yEsc(pk), yEsc(Math.min(4, pk + 1)), fr);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={150} txt="escalera de Tuckman · 5 etapas" p={rampa(t, M.tuckman - 0.4, 0.35)} tam={40} fondo={MANGO} />
      {ETAPAS.map(([nom, sub, fondo], k) => {
        const q = rampa(t, tw[k] - 0.35, 0.3);
        if (q <= 0) return null;
        return (
          <div key={k} style={{ position: "absolute", left: xEsc(k), top: yEsc(k), width: 1000 - xEsc(k), height: 150, background: fondo, border: `6px solid ${TINTA}`, borderRadius: 18, boxSizing: "border-box", transform: `scale(${rebote(q)})`, transformOrigin: "0 100%", fontFamily: "Sora", fontWeight: 800, color: TINTA, padding: "14px 0 0 24px" }}>
            <div style={{ fontSize: 40 }}>{nom}</div>
            <div style={{ fontSize: 30, color: "#5B4A3E", marginTop: 6 }}>{sub}</div>
          </div>
        );
      })}
      {actual >= 0 && t < E(7) + 1 && (
        <div style={{ position: "absolute", left: mx - 70, top: my - 160, width: 140, height: 160 }}>
          <Mascota esp="hamster-gorra" x={70} y={160} alto={150} t={t} cara={pR > 0 ? "triste" : "feliz"} semilla={3} />
        </div>
      )}
      <Cartel x={380} y={1300} txt="⏸️ estancarse" p={pE} tam={38} fondo="#FFFDF7" giro={-2} />
      <Cartel x={790} y={1300} txt="↩️ o retroceder" p={pR} tam={38} fondo="#FFE1D8" giro={2} />
      <Sombra x={180} y={1540} w={130} />
      <Mascota esp="gato-gafas" x={180} y={1545} alto={210} t={t} cara="feliz" semilla={7} />
    </Escena>
  );
}

/* ═════ 8–9 · Qué ayuda ═════ */
function Ayuda({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(9), b: E(9) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const A = [[M.coubicacion, "📍 coubicación", "mismo lugar"], [M.capacitacion, "🎓 capacitación", ""], [M.reconocimiento8, "🏅 reconocimiento", ""], [M.espiritu, "🎉 espíritu de equipo", ""]];
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={180} txt="¿qué ayuda?" p={rampa(t, M.ayuda - 0.3, 0.3)} tam={50} fondo={MANGO} />
      {A.map(([tw, txt, sub], k) => (
        <div key={k}>
          <Cartel x={k % 2 ? 780 : 300} y={330 + Math.floor(k / 2) * 170} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={38} fondo={CREMA} giro={[-2, 2, 1, -1][k]} />
          {sub && <Cartel x={300} y={410} txt={sub} p={rampa(t, tw + 0.4, 0.3)} tam={28} fondo="#FFFDF7" />}
        </div>
      ))}
      <Cartel x={540} y={760} txt="👀 ojo:" p={rampa(t, M.ojo - 0.3, 0.3)} tam={40} fondo="#FFE1D8" giro={-1} />
      <Cartel x={540} y={870} txt="🏅 reconocer durante todo el proyecto" p={rampa(t, M.todo9 - 0.4, 0.3)} tam={36} fondo="#E3F6EC" giro={1} />
      <Cartel x={540} y={980} txt="❌ no esperar al final" p={rampa(t, M.final9 - 0.4, 0.3)} tam={36} fondo="#FFFDF7" giro={-1} />
      <Sombra x={200} y={1520} w={150} />
      <Mascota esp="perro-corbatin" x={200} y={1525} alto={250} t={t} cara="feliz" semilla={9} />
      <Sombra x={540} y={1520} w={150} />
      <Mascota esp="hamster-gorra" x={540} y={1525} alto={250} t={t} cara="feliz" bi={-50 * pulso(t, M.reconocimiento8, 1.2)} semilla={3} />
      <Sombra x={880} y={1520} w={150} />
      <Mascota esp="gato-gafas" x={880} y={1525} alto={250} t={t} cara={t > M.reconocimiento8 ? "estrellas" : "feliz"} semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 10 · Evaluaciones de desempeño del equipo ═════ */
function Evaluacion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10) + 0.3, s: 1.02, x: 540, y: 960 }]);
  const filas = [
    [M.habilidades, "📈", "¿mejoraron las habilidades?", "", CREMA],
    [M.cohesion, "🤝", "¿hay más cohesión?", "", "#E3F6EC"],
    [M.gente, "🚪", "¿se va menos gente?", "", "#DDE3FF"],
  ];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Hoja x={540} y={200} w={980} h={680} p={rampa(t, M.evaluaciones - 0.4, 0.4)} titulo="evaluaciones de desempeño del equipo" filas={filas} t={t} />
      <Sombra x={200} y={1530} w={150} />
      <Mascota esp="perro-corbatin" x={200} y={1535} alto={250} t={t} cara="feliz" semilla={9} />
      <Sombra x={540} y={1530} w={150} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={250} t={t} cara="estrellas" semilla={3} />
      <Sombra x={880} y={1530} w={150} />
      <Mascota esp="gato-gafas" x={880} y={1535} alto={250} t={t} cara="feliz" semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 11 · ¿En qué etapa está tu equipo? ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={260} txt="⚡ ¿en qué etapa está tu equipo?" p={rampa(t, M.toca - 0.2, 0.35)} tam={44} fondo={MANGO} />
      {ETAPAS.map(([nom], k) => <Cartel key={k} x={540} y={400 + k * 95} txt={`☐ ${nom}`} p={rampa(t, M.etapa11 + k * 0.15, 0.3)} tam={38} fondo={CREMA} giro={[-1, 1, -1, 1, -1][k]} />)}
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={400} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.equipo11, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="gato-gafas" x={790} y={1535} alto={360} t={t} cara="feliz" semilla={7} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "definicion") return <Definicion t={t} />;
  if (p.tipo === "escalera") return <Escalera t={t} />;
  if (p.tipo === "ayuda") return <Ayuda t={t} />;
  if (p.tipo === "evaluacion") return <Evaluacion t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.nuevo - 0.3, "pop", 0.3); fx(M.lado - 0.3, "desliza", 0.25); fx(M.hablan - 0.4, "pop-suave", 0.25); fx(M.bueno - 0.5, "pop-suave", 0.22);
fx(S(3) - 0.3, "whoosh", 0.4); [M.competencias, M.interaccion, M.ambiente, M.desempeno3].forEach((w) => fx(w - 0.3, "pop", 0.2));
fx(S(4) - 0.3, "whoosh", 0.4); [M.formacion, M.turbulencia, M.normalizacion, M.desempeno6, M.disolucion].forEach((w) => fx(w - 0.35, "pop", 0.22)); fx(M.retroceder - 0.5, "baja", 0.25);
fx(S(8) - 0.3, "whoosh", 0.4); [M.coubicacion, M.capacitacion, M.reconocimiento8, M.espiritu].forEach((w) => fx(w - 0.3, "pop-suave", 0.2)); fx(M.todo9 - 0.4, "ding", 0.25);
fx(S(10) - 0.3, "whoosh", 0.4); fx(M.evaluaciones - 0.4, "papel", 0.3); [M.habilidades, M.cohesion, M.gente].forEach((w) => fx(w - 0.4, "pop-suave", 0.2));
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/panaderia.jpg", "art/oficina.jpg"];
const CLAVE = /^(equipo|Tuckman|formación|turbulencia|normalización|desempeño|disolución|coubicación|reconocimiento|evaluaciones)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP50 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp50-desarrollar-equipo.mp3" sinSonido={sinSonido} />
);
