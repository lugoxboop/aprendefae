/*
 * Gestión de Proyectos · GP-47 «El truco de Carmen» (gp47-conocimiento).
 * Una idea: Gestionar el Conocimiento del Proyecto es utilizar el conocimiento existente y crear nuevo
 * conocimiento para alcanzar los objetivos del proyecto y contribuir al aprendizaje organizacional (4.4, p. 98).
 * Explícito (palabras, imágenes y números) y tácito (personal y difícil de expresar), p. 100; el tácito se
 * comparte a través de conversaciones e interacciones; observación, talleres (4.4.2.2, p. 102–103).
 * Registro de lecciones aprendidas: categoría, situación, impacto, recomendaciones, acciones propuestas; se
 * crea tempranamente y se actualiza; al final pasa al repositorio de lecciones aprendidas (4.4.3.1, p. 104).
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, Dicho, ROJO } from "../gp/piezas.jsx";
import { Hoja } from "../gp/hoja.jsx";
import { Carpeta } from "../gp22/Video.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3] });
const { S, E, W } = T;

const M = {
  carmen: W(1, "Carmen", 0.05), listo: W(1, "listo", 0.4), mirarlo: W(1, "mirarlo.", 0.6), escrito: W(1, "escrito.", 0.97),
  comparte: W(2, "comparte", 0.5),
  gestionar: W(3, "Gestionar", 0.03), existente: W(3, "existente", 0.4), crear: W(3, "crear", 0.5), objetivos: W(3, "objetivos", 0.72), aprendizaje: W(3, "aprendizaje", 0.88),
  tipos: W(4, "tipos.", 0.15), explicito: W(4, "explícito", 0.25), palabras: W(4, "palabras,", 0.6), imagenes: W(4, "imágenes", 0.7), numeros: W(4, "números,", 0.8), receta: W(4, "receta.", 0.97),
  tacito5: W(5, "tácito", 0.1), personal: W(5, "personal", 0.3), dificil: W(5, "difícil", 0.45), ojo: W(5, "ojo", 0.85),
  conversando: W(6, "conversando", 0.7), juntos: W(6, "juntos.", 0.97),
  observa: W(7, "observa", 0.35), hornea: W(7, "hornea,", 0.65), taller: W(7, "taller.", 0.97),
  registro8: W(8, "registro", 0.25), situacion: W(8, "situación,", 0.6), impacto8: W(8, "impacto,", 0.7), recomendaciones: W(8, "recomendaciones", 0.82), acciones8: W(8, "acciones", 0.92),
  final9: W(9, "final.", 0.3), temprano: W(9, "temprano", 0.55), actualiza: W(9, "actualiza", 0.75), todo9: W(9, "todo", 0.88),
  cierre10: W(10, "cierre,", 0.1), repositorio: W(10, "repositorio", 0.4), organizacion: W(10, "organización.", 0.97),
  toca: W(11, "toca:", 0.15), leccion: W(11, "lección", 0.4), hecho: W(11, "hecho.", 0.97),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "definicion", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "tipos", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "compartir", desde: S(6) - 0.3, entra: "barrido-izq" },
  { tipo: "registro", desde: S(8) - 0.3, entra: "barrido" },
  { tipo: "repositorio", desde: S(10) - 0.3, entra: "zoom" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* ═════ 1–2 · El ojo de Carmen ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(5px)" velo={0.15}>
      <Dicho x={500} y={200} w={420} h={250} p={rampa(t, M.listo - 0.4, 0.35)} colaX={740}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 110 }}>👀🍞</div>
      </Dicho>
      <Cartel x={710} y={590} txt="«¡ya está listo!»" p={rampa(t, M.mirarlo - 0.3, 0.3)} tam={42} fondo={MANGO} giro={2} />
      <Cartel x={290} y={420} txt="📄 ¿escrito?" p={rampa(t, M.escrito - 0.6, 0.3)} tam={44} fondo={CREMA} giro={-3} />
      <Gigante x={290} y={570} txt="✖️" p={rampa(t, M.escrito - 0.3, 0.3)} tam={100} />
      <Cartel x={540} y={860} txt="¿cómo se comparte lo que alguien sabe?" p={rampa(t, M.comparte - 0.5, 0.3)} tam={36} fondo="#DDE3FF" giro={-1} />
      <Sombra x={260} y={1510} w={190} />
      <Mascota esp="hamster-gorra" x={260} y={1515} alto={330} t={t} cara="tranquila" cab={8 * Math.sin(t * 2.5)} semilla={3} />
      <Sombra x={800} y={1510} w={200} />
      <Mascota esp="gato-gafas" x={800} y={1515} alto={380} t={t} cara={t > M.mirarlo ? "guino" : "feliz"} semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 3 · Qué es ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3), b: E(3) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const C = [[M.existente, "♻️ usar el conocimiento existente"], [M.crear, "✨ crear nuevo conocimiento"], [M.objetivos, "🎯 alcanzar los objetivos"], [M.aprendizaje, "🏢 aprendizaje de la organización"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={240} txt="gestionar el conocimiento del proyecto" p={rampa(t, M.gestionar - 0.3, 0.35)} tam={38} fondo={MANGO} />
      {C.map(([tw, txt], k) => <Cartel key={k} x={540} y={410 + k * 130} txt={txt} p={rampa(t, tw - 0.35, 0.3)} tam={38} fondo={k < 2 ? CREMA : "#DDE3FF"} giro={[-1, 1, -1, 1][k]} />)}
      <Sombra x={540} y={1510} w={190} />
      <Mascota esp="gato-gafas" x={540} y={1515} alto={300} t={t} cara="feliz" semilla={7} />
    </Escena>
  );
}

/* ═════ 4–5 · Explícito y tácito ═════ */
function Tipos({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(5), b: E(5) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const X = [[M.palabras, "🔤 palabras"], [M.imagenes, "🖼️ imágenes"], [M.numeros, "🔢 números"]];
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={170} txt="dos tipos" p={rampa(t, M.tipos - 0.4, 0.3)} tam={46} fondo={MANGO} />
      <Cartel x={280} y={300} txt="📘 explícito" p={rampa(t, M.explicito - 0.3, 0.3)} tam={44} fondo="#DDE3FF" giro={-2} />
      {X.map(([tw, txt], k) => <Cartel key={k} x={280} y={420 + k * 95} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={34} fondo={CREMA} giro={[-1, 1, -1][k]} />)}
      <Documento x={280} y={880} w={240} p={rampa(t, M.receta - 0.5, 0.4)} titulo="receta" letra={40} giro={-4} />
      <Cartel x={800} y={300} txt="🧠 tácito" p={rampa(t, M.tacito5 - 0.3, 0.3)} tam={44} fondo="#FFE1D8" giro={2} />
      <Cartel x={800} y={420} txt="personal" p={rampa(t, M.personal - 0.3, 0.3)} tam={34} fondo={CREMA} giro={1} />
      <Cartel x={800} y={515} txt="difícil de expresar" p={rampa(t, M.dificil - 0.3, 0.3)} tam={34} fondo={CREMA} giro={-1} />
      <Gigante x={800} y={760} txt="👀" p={rampa(t, M.ojo - 0.4, 0.35)} tam={150} />
      <Sombra x={180} y={1530} w={150} />
      <Mascota esp="hamster-gorra" x={180} y={1535} alto={230} t={t} cara="tranquila" semilla={3} />
      <Sombra x={880} y={1530} w={160} />
      <Mascota esp="gato-gafas" x={880} y={1535} alto={270} t={t} cara={t > M.ojo ? "guino" : "feliz"} semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 6–7 · Cómo se comparte el tácito ═════ */
function Compartir({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(7), b: E(7) + 0.3, s: 1.04, x: 540, y: 990 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={190} txt="🧠 el tácito se comparte…" p={rampa(t, S(6), 0.35)} tam={42} fondo={MANGO} />
      <Cartel x={300} y={330} txt="🗣️ conversando" p={rampa(t, M.conversando - 0.3, 0.3)} tam={40} fondo={CREMA} giro={-2} />
      <Cartel x={780} y={330} txt="🤝 trabajando juntos" p={rampa(t, M.juntos - 0.4, 0.3)} tam={40} fondo={CREMA} giro={2} />
      <Cartel x={300} y={560} txt="👀 observar" p={rampa(t, M.observa - 0.3, 0.3)} tam={40} fondo="#DDE3FF" giro={1} />
      <Cartel x={780} y={560} txt="🧑‍🏫 taller" p={rampa(t, M.taller - 0.4, 0.3)} tam={40} fondo="#DDE3FF" giro={-1} />
      <Gigante x={540} y={800} txt="🔥🍞" p={rampa(t, M.hornea - 0.3, 0.35)} tam={110} />
      <Sombra x={300} y={1520} w={190} />
      <Mascota esp="hamster-gorra" x={300} y={1525} alto={330} t={t} cara="feliz" cab={6 * pulso(t, M.observa, 1.5)} semilla={3} />
      <Sombra x={780} y={1520} w={200} />
      <Mascota esp="gato-gafas" x={780} y={1525} alto={360} t={t} cara="feliz" bi={-40 * pulso(t, M.hornea - 0.3, 1.0)} semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 8–9 · Registro de lecciones aprendidas ═════ */
function Registro({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(9), b: E(9) + 0.3, s: 1.02, x: 540, y: 960 }]);
  const filas = [
    [M.situacion, "📍", "situación", "", CREMA],
    [M.impacto8, "💥", "impacto", "", "#FFE1D8"],
    [M.recomendaciones, "💡", "recomendaciones", "", "#E3F6EC"],
    [M.acciones8, "🛠️", "acciones propuestas", "", "#DDE3FF"],
  ];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Hoja x={540} y={110} w={860} h={860} p={rampa(t, M.registro8 - 0.4, 0.4)} titulo="registro de lecciones aprendidas" filas={filas} t={t} />
      <Cartel x={300} y={1060} txt="❌ no esperar al final" p={rampa(t, M.final9 - 0.4, 0.3)} tam={36} fondo="#FFE1D8" giro={-2} />
      <Cartel x={790} y={1060} txt="✍️ se crea temprano" p={rampa(t, M.temprano - 0.3, 0.3)} tam={36} fondo={CREMA} giro={2} />
      <Cartel x={540} y={1180} txt="🔄 se actualiza todo el proyecto" p={rampa(t, M.actualiza - 0.3, 0.3)} tam={36} fondo="#E3F6EC" giro={-1} />
      <Sombra x={160} y={1540} w={140} />
      <Mascota esp="hamster-gorra" x={160} y={1545} alto={210} t={t} cara="feliz" semilla={3} />
      <Sombra x={920} y={1540} w={140} />
      <Mascota esp="gato-gafas" x={920} y={1545} alto={220} t={t} cara="tranquila" semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 10 · Al repositorio ═════ */
function Repositorio({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const pV = sale(rampa(t, M.repositorio - 0.2, 0.9));
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={170} txt="🏁 al cierre" p={rampa(t, M.cierre10 - 0.3, 0.3)} tam={46} fondo={MANGO} />
      <Carpeta x={540} y={420} w={780} h={560} p={rampa(t, M.repositorio - 0.5, 0.4)} titulo="repositorio de lecciones aprendidas">
        {[0, 1, 2].map((k) => <Documento key={k} x={170 + k * 200} y={330} w={160} p={1} titulo="" giro={[-6, 3, -2][k]} />)}
      </Carpeta>
      <Documento x={lerp(540, 600, pV)} y={lerp(1120, 720, pV)} w={lerp(260, 160, pV)} p={rampa(t, M.cierre10 - 0.4, 0.4)} titulo="registro de lecciones" letra={lerp(32, 20, pV)} giro={lerp(-3, 4, pV)} />
      <Cartel x={540} y={1180} txt="🏢 para toda la organización" p={rampa(t, M.organizacion - 0.6, 0.3)} tam={38} fondo="#DDE3FF" giro={1} />
      <Sombra x={540} y={1530} w={170} />
      <Mascota esp="gato-gafas" x={540} y={1535} alto={250} t={t} cara="estrellas" semilla={7} />
    </Escena>
  );
}

/* ═════ 11 · Tu lección ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={280} txt="⚡ tu lección aprendida" p={rampa(t, M.toca - 0.2, 0.35)} tam={54} fondo={MANGO} />
      <Cartel x={540} y={450} txt="📍 situación: ________" p={rampa(t, M.leccion - 0.3, 0.3)} tam={44} fondo={CREMA} giro={-2} />
      <Cartel x={540} y={580} txt="💡 recomendación: ________" p={rampa(t, M.leccion + 0.4, 0.3)} tam={42} fondo={CREMA} giro={1} />
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.hecho, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="gato-gafas" x={790} y={1535} alto={370} t={t} cara="feliz" semilla={7} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "definicion") return <Definicion t={t} />;
  if (p.tipo === "tipos") return <Tipos t={t} />;
  if (p.tipo === "compartir") return <Compartir t={t} />;
  if (p.tipo === "registro") return <Registro t={t} />;
  if (p.tipo === "repositorio") return <Repositorio t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.listo - 0.4, "pop", 0.3); fx(M.mirarlo - 0.3, "pop-suave", 0.25); fx(M.escrito - 0.3, "golpe", 0.25); fx(M.comparte - 0.5, "pop-suave", 0.22);
fx(S(3) - 0.3, "whoosh", 0.4); [M.existente, M.crear, M.objetivos, M.aprendizaje].forEach((w) => fx(w - 0.35, "pop", 0.2));
fx(S(4) - 0.3, "whoosh", 0.4); [M.explicito, M.palabras, M.imagenes, M.numeros].forEach((w) => fx(w - 0.3, "pop-suave", 0.2)); fx(M.receta - 0.5, "papel", 0.3);
[M.tacito5, M.personal, M.dificil].forEach((w) => fx(w - 0.3, "pop-suave", 0.2)); fx(M.ojo - 0.4, "pop", 0.3);
fx(S(6) - 0.3, "whoosh", 0.4); [M.conversando, M.juntos, M.observa, M.taller].forEach((w) => fx(w - 0.35, "pop", 0.2));
fx(S(8) - 0.3, "whoosh", 0.4); fx(M.registro8 - 0.4, "papel", 0.3); [M.situacion, M.impacto8, M.recomendaciones, M.acciones8].forEach((w) => fx(w - 0.4, "pop-suave", 0.2)); [M.final9, M.temprano, M.actualiza].forEach((w) => fx(w - 0.3, "pop", 0.2));
fx(S(10) - 0.3, "whoosh", 0.4); fx(M.repositorio - 0.2, "desliza", 0.3); fx(M.organizacion - 0.6, "ding", 0.3);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/panaderia.jpg", "art/oficina.jpg"];
const CLAVE = /^(conocimiento|explícito|tácito|lecciones|aprendidas|registro|repositorio|aprendizaje)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP47 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp47-conocimiento.mp3" sinSonido={sinSonido} />
);
