/*
 * Gestión de Proyectos · GP-48 «¿Vamos bien con la calidad?» (gp48-gestionar-calidad).
 * Una idea: Gestionar la Calidad es convertir el plan de gestión de la calidad en actividades ejecutables
 * de calidad que incorporen al proyecto las políticas de calidad de la organización (8.2, p. 288).
 * Se denomina a veces aseguramiento de calidad: uso eficaz de los procesos del proyecto (p. 289).
 * Auditorías: proceso estructurado e independiente; políticas, procesos y procedimientos; por lo general un
 * equipo externo, como la PMO; buenas prácticas, no conformidades, brechas y defectos (8.2.2.5, p. 294–295).
 * Informes de calidad: gráficos, numéricos o cualitativos; incidentes, recomendaciones de mejora y de acciones
 * correctivas (8.2.3.1, p. 296); solicitudes de cambio (8.2.3.4).
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3] });
const { S, E, W } = T;

const M = {
  plan1: W(1, "plan", 0.05), panes1: W(1, "panes.", 0.55), siguiendo: W(1, "siguiendo?", 0.97),
  otro: W(2, "otro", 0.6),
  gestionar: W(3, "Gestionar", 0.03), convertir: W(3, "convertir", 0.15), actividades: W(3, "actividades", 0.55), politicas3: W(3, "políticas", 0.82),
  aseguramiento: W(4, "aseguramiento", 0.3), procesos4: W(4, "procesos", 0.85),
  auditoria: W(5, "auditoría:", 0.45), estructurado: W(5, "estructurado", 0.75), independiente: W(5, "independiente.", 0.97),
  politicas6: W(6, "políticas,", 0.55), procesos6: W(6, "procesos", 0.75), procedimientos: W(6, "procedimientos.", 0.97),
  externo: W(7, "externo", 0.5), oficina: W(7, "oficina", 0.75),
  buenas: W(8, "buenas", 0.2), brechas: W(8, "brechas", 0.7), defectos: W(8, "defectos.", 0.97),
  informes: W(9, "informes", 0.4), graficos: W(9, "gráficos,", 0.72), numericos: W(9, "numéricos", 0.82), cualitativos: W(9, "cualitativos.", 0.97),
  incidentes10: W(10, "incidentes", 0.2), mejora: W(10, "mejora", 0.4), correctivas: W(10, "correctivas.", 0.6), solicitud10: W(10, "solicitud", 0.9),
  toca: W(11, "toca:", 0.15), auditar: W(11, "auditar", 0.4), revisaria: W(11, "revisaría.", 0.97),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "definicion", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "auditoria", desde: S(5) - 0.3, entra: "zoom" },
  { tipo: "informe", desde: S(9) - 0.3, entra: "barrido-izq" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* ═════ 1–2 · ¿Lo están siguiendo? ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(5px)" velo={0.15}>
      <Documento x={290} y={420} w={300} p={rampa(t, M.plan1 - 0.4, 0.4)} titulo="plan de gestión de la calidad" letra={32} giro={-4} />
      <Gigante x={780} y={360} txt="🍞✨" p={rampa(t, M.panes1 - 0.4, 0.35)} tam={130} />
      <Cartel x={780} y={530} txt="así deben salir" p={rampa(t, M.panes1 - 0.2, 0.3)} tam={38} fondo={CREMA} giro={2} />
      <Cartel x={540} y={820} txt="🤔 ¿el equipo lo sigue?" p={rampa(t, M.siguiendo - 0.6, 0.3)} tam={46} fondo="#DDE3FF" giro={-1} />
      <Sombra x={260} y={1510} w={190} />
      <Mascota esp="hamster-gorra" x={260} y={1515} alto={340} t={t} cara="tranquila" cab={8 * Math.sin(t * 2.5)} semilla={3} />
      <Sombra x={820} y={1510} w={200} />
      <Mascota esp="perro-corbatin" x={820} y={1515} alto={360} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 3–4 · Qué es ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3), b: E(4) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const pA = sale(rampa(t, M.convertir, 0.9));
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={200} txt="gestionar la calidad" p={rampa(t, M.gestionar - 0.3, 0.35)} tam={48} fondo={MANGO} />
      <Documento x={230} y={470} w={240} p={rampa(t, M.convertir - 0.3, 0.4)} titulo="plan" letra={44} giro={-3} />
      {pA > 0 && <Gigante x={lerp(380, 520, pA)} y={470} txt="➡️" p={1} tam={70} />}
      <Cartel x={780} y={420} txt="✅ actividades" p={rampa(t, M.actividades - 0.3, 0.3)} tam={40} fondo="#E3F6EC" giro={2} />
      <Cartel x={780} y={520} txt="que se ejecutan" p={rampa(t, M.actividades - 0.1, 0.3)} tam={34} fondo="#FFFDF7" giro={-1} />
      <Cartel x={540} y={720} txt="🏢 + políticas de calidad de la organización" p={rampa(t, M.politicas3 - 0.3, 0.3)} tam={32} fondo={CREMA} />
      <Cartel x={540} y={880} txt="a veces se llama: aseguramiento de calidad" p={rampa(t, M.aseguramiento - 0.4, 0.3)} tam={32} fondo="#DDE3FF" giro={-1} />
      <Cartel x={540} y={1000} txt="⚙️ usar bien los procesos" p={rampa(t, M.procesos4 - 0.4, 0.3)} tam={40} fondo={CREMA} giro={1} />
      <Sombra x={540} y={1530} w={180} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={260} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 5–8 · La auditoría ═════ */
function Auditoria({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(7), b: E(8), s: 1.03, x: 540, y: 960 }]);
  const R = [[M.politicas6, "📜 políticas"], [M.procesos6, "⚙️ procesos"], [M.procedimientos, "📋 procedimientos"]];
  const lupa = lerp(-30, 30, Math.sin(t * 1.6) * 0.5 + 0.5);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={170} txt="🔍 auditoría" p={rampa(t, M.auditoria - 0.4, 0.35)} tam={54} fondo={MANGO} />
      <Cartel x={300} y={300} txt="estructurada" p={rampa(t, M.estructurado - 0.3, 0.3)} tam={38} fondo={CREMA} giro={-2} />
      <Cartel x={780} y={300} txt="independiente" p={rampa(t, M.independiente - 0.4, 0.3)} tam={38} fondo={CREMA} giro={2} />
      <Cartel x={540} y={430} txt="¿el trabajo cumple…?" p={rampa(t, M.politicas6 - 0.8, 0.3)} tam={36} fondo="#FFFDF7" />
      {R.map(([tw, txt], k) => <Cartel key={k} x={[220, 540, 860][k]} y={540} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={30} fondo="#DDE3FF" giro={[-2, 1, 2][k]} />)}
      <Cartel x={540} y={700} txt="👥 por lo general, un equipo externo" p={rampa(t, M.externo - 0.3, 0.3)} tam={38} fondo="#FFE1D8" giro={-1} />
      <Cartel x={540} y={810} txt="🏢 ej.: oficina de dirección de proyectos" p={rampa(t, M.oficina - 0.3, 0.3)} tam={30} fondo={CREMA} giro={1} />
      <Cartel x={300} y={960} txt="⭐ buenas prácticas" p={rampa(t, M.buenas - 0.3, 0.3)} tam={36} fondo="#E3F6EC" giro={-2} />
      <Cartel x={780} y={960} txt="🕳️ brechas · 🐞 defectos" p={rampa(t, M.brechas - 0.3, 0.3)} tam={34} fondo="#FFE1D8" giro={2} />
      <Sombra x={200} y={1530} w={150} />
      <Mascota esp="hamster-gorra" x={200} y={1535} alto={240} t={t} cara={t > M.buenas ? "feliz" : "tranquila"} semilla={3} />
      <Sombra x={860} y={1530} w={170} />
      <Mascota esp="perro-mochila" x={860} y={1535} alto={290} t={t} cara="tranquila" cab={0.2 * lupa} semilla={5} espejo />
      <Gigante x={720} y={1200} txt="🔎" p={rampa(t, M.externo, 0.35)} tam={100} />
    </Escena>
  );
}

/* ═════ 9–10 · Informes de calidad ═════ */
function Informe({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10) + 0.3, s: 1.02, x: 540, y: 960 }]);
  const F = [[M.graficos, "📊 gráficos"], [M.numericos, "🔢 numéricos"], [M.cualitativos, "💬 cualitativos"]];
  const I = [[M.incidentes10, "⚠️ incidentes"], [M.mejora, "💡 recomendaciones de mejora"], [M.correctivas, "🔧 de acciones correctivas"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Documento x={260} y={330} w={290} p={rampa(t, M.informes - 0.4, 0.4)} titulo="informe de calidad" letra={38} giro={-3} />
      {F.map(([tw, txt], k) => <Cartel key={k} x={770} y={210 + k * 110} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={38} fondo={CREMA} giro={[2, -1, 1][k]} />)}
      <Cartel x={540} y={650} txt="puede incluir:" p={rampa(t, M.incidentes10 - 0.6, 0.3)} tam={34} fondo="#FFFDF7" />
      {I.map(([tw, txt], k) => <Cartel key={k} x={540} y={760 + k * 105} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={36} fondo="#DDE3FF" giro={[-1, 1, -1][k]} />)}
      <Cartel x={540} y={1120} txt="🔁 solicitud de cambio" p={rampa(t, M.solicitud10 - 0.3, 0.3)} tam={42} fondo={MANGO} giro={1} />
      <Sombra x={180} y={1530} w={150} />
      <Mascota esp="hamster-gorra" x={180} y={1535} alto={240} t={t} cara="feliz" semilla={3} />
      <Sombra x={900} y={1530} w={150} />
      <Mascota esp="perro-corbatin" x={900} y={1535} alto={250} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 11 · Tu auditoría ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={280} txt="⚡ tu auditoría" p={rampa(t, M.toca - 0.2, 0.35)} tam={58} fondo={MANGO} />
      <Cartel x={540} y={450} txt="🔍 quién audita: ________" p={rampa(t, M.auditar - 0.3, 0.3)} tam={44} fondo={CREMA} giro={-2} />
      <Cartel x={540} y={580} txt="📋 qué revisa: ________" p={rampa(t, M.revisaria - 0.6, 0.3)} tam={44} fondo={CREMA} giro={1} />
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.revisaria, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="perro-corbatin" x={790} y={1535} alto={380} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "definicion") return <Definicion t={t} />;
  if (p.tipo === "auditoria") return <Auditoria t={t} />;
  if (p.tipo === "informe") return <Informe t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.plan1 - 0.4, "papel", 0.3); fx(M.panes1 - 0.4, "pop", 0.3); fx(M.siguiendo - 0.6, "pop-suave", 0.25);
fx(S(3) - 0.3, "whoosh", 0.4); fx(M.convertir, "desliza", 0.25); [M.actividades, M.politicas3, M.aseguramiento, M.procesos4].forEach((w) => fx(w - 0.35, "pop", 0.2));
fx(S(5) - 0.3, "whoosh", 0.4); [M.estructurado, M.independiente, M.politicas6, M.procesos6, M.procedimientos].forEach((w) => fx(w - 0.3, "pop-suave", 0.2));
[M.externo, M.oficina, M.buenas, M.brechas].forEach((w) => fx(w - 0.3, "pop", 0.2));
fx(S(9) - 0.3, "whoosh", 0.4); fx(M.informes - 0.4, "papel", 0.3); [M.graficos, M.numericos, M.cualitativos, M.incidentes10, M.mejora, M.correctivas].forEach((w) => fx(w - 0.3, "pop-suave", 0.2)); fx(M.solicitud10 - 0.3, "sello", 0.25);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/panaderia.jpg", "art/oficina.jpg"];
const CLAVE = /^(calidad|auditoría|aseguramiento|informes|independiente|externo|procesos)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP48 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp48-gestionar-calidad.mp3" sinSonido={sinSonido} />
);
