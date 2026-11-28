/*
 * Gestión de Proyectos · GP-28 «Un toldo no se hace solo» (gp28-actividades).
 * Una idea: Definir las Actividades es identificar y documentar las acciones específicas que se
 * deben realizar para elaborar los entregables; descompone los paquetes de trabajo en
 * actividades y se lleva a cabo a lo largo de todo el proyecto (6.2, p. 183). Lista de
 * actividades: identificador y descripción del alcance del trabajo (6.2.3.1). Atributos: ID,
 * identificador de la EDT/WBS, nombre; luego predecesoras y sucesoras (6.2.3.2). Lista de
 * hitos: punto o evento significativo, duración nula; obligatorios (p. ej., por contrato) u
 * opcionales (6.2.3.3, p. 186).
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, Ficha, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.4, 0.3, 0.35, 0.3, 0.3, 0.3, 0.35, 0.3, 0.3, 0.3, 0.4] });
const { S, E, W } = T;

const M = {
  toldo1: W(1, "«Toldo»", 0.05), estructura1: W(1, "estructura.", 0.4), solo: W(1, "solo.", 0.95),
  toma: W(2, "toma", 0.15), paquete2: W(2, "paquete", 0.3), pregunta: W(2, "pregunta:", 0.7), hacer2: W(2, "hacer?", 0.95),
  medir: W(3, "Medir,", 0.1), comprar: W(3, "comprar", 0.3), coser: W(3, "coser", 0.65), instalar: W(3, "instalar.", 0.85),
  definir: W(4, "definir", 0.12), identificar: W(4, "identificar", 0.3), acciones: W(4, "acciones", 0.5), entregables4: W(4, "entregables.", 0.95),
  saca: W(5, "saca", 0.1), paquetes5: W(5, "paquetes", 0.3), largo: W(5, "largo", 0.65), proyecto5: W(5, "proyecto.", 0.95),
  lista6: W(6, "lista", 0.3), identificador: W(6, "identificador", 0.6), descripcion6: W(6, "descripción", 0.8),
  atributos: W(7, "atributos:", 0.15), nombre: W(7, "nombre,", 0.25), codigo: W(7, "código", 0.35), paquete7: W(7, "paquete", 0.5), antes: W(7, "antes", 0.85), despues: W(7, "después.", 0.95),
  hitos8: W(8, "hitos.", 0.9),
  hito9: W(9, "hito", 0.08), significativo: W(9, "significativo,", 0.35), carrito9: W(9, "«carrito", 0.5), cero: W(9, "cero.", 0.95),
  obligatorio: W(10, "obligatorio,", 0.3), contrato: W(10, "contrato,", 0.7), opcional: W(10, "opcional.", 0.95),
  toca: W(11, "toca:", 0.15), convierte: W(11, "convierte", 0.3), actividades11: W(11, "actividades.", 0.95),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "desglose", desde: S(2) - 0.3, entra: "barrido" },
  { tipo: "definir", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "lista", desde: S(6) - 0.3, entra: "barrido-izq" },
  { tipo: "hitos", desde: S(8) - 0.3, entra: "barrido" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

const ACT = [["📏", "medir", "A1"], ["🛒", "comprar la tela", "A2"], ["🧵", "coser", "A3"], ["🔧", "instalar", "A4"]];

/* Caja de la EDT/WBS con su código */
function Caja({ x, y, w = 340, p, txt, cod }) {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, height: 170, boxSizing: "border-box", background: "#E3F6EC", border: `7px solid ${COLOR.VERDE}`, borderRadius: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, color: TINTA, transform: `scale(${rebote(Math.min(1, p))})` }}>
      <div style={{ position: "absolute", top: -28, background: AZUL, color: "#fff", fontSize: 30, padding: "2px 16px", borderRadius: 12, border: `4px solid ${TINTA}` }}>{cod}</div>
      <div style={{ fontSize: 60 }}>⛱️</div>
      <div style={{ fontSize: 42 }}>{txt}</div>
    </div>
  );
}

/* ═════ 1 · Un toldo no se hace solo ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(1) + 0.3, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(5px)" velo={0.15}>
      <Cartel x={540} y={260} txt="estructura de desglose del trabajo (EDT/WBS)" p={rampa(t, M.estructura1 - 0.4, 0.35)} tam={38} fondo={CREMA} />
      <Caja x={540} y={380} w={420} p={rampa(t, M.toldo1 - 0.2, 0.35)} txt="toldo" cod="1.1.2" />
      <Gigante x={800} y={760} txt="🤷" p={rampa(t, M.solo - 0.8, 0.35)} tam={140} giro={8 * Math.sin(t * 3)} />
      <Cartel x={460} y={800} txt="no se hace solo" p={rampa(t, M.solo - 0.7, 0.35)} tam={58} fondo={ROJO} color="#fff" giro={-2} />
      <Sombra x={300} y={1510} w={230} />
      <Mascota esp="hamster-gorra" x={300} y={1515} alto={400} t={t} cara={t > M.solo - 0.6 ? "triste" : "tranquila"} cab={6 * Math.sin(t * 3)} semilla={3} />
      <Sombra x={820} y={1510} w={190} />
      <Mascota esp="perro-corbatin" x={820} y={1515} alto={350} t={t} cara="tranquila" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 2–3 · Del paquete a las acciones ═════ */
function Desglose({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3) - 0.2, b: E(3), s: 1.03, x: 540, y: 955 }]);
  const TW = [M.medir, M.comprar, M.coser, M.instalar];
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={230} txt="📦 paquete de trabajo" p={rampa(t, M.paquete2 - 0.4, 0.35)} tam={46} fondo={MANGO} />
      <Caja x={540} y={330} w={380} p={rampa(t, S(2) - 0.3, 0.35)} txt="toldo" cod="1.1.2" />
      <Cartel x={540} y={580} txt="¿qué hay que hacer? 🤔" p={rampa(t, M.pregunta - 0.4, 0.35)} tam={50} fondo={CREMA} giro={-2} />
      {ACT.map(([ic, txt], k) => <Cartel key={k} x={k % 2 ? 760 : 310} y={760 + Math.floor(k / 2) * 170} txt={`${ic} ${txt}`} p={rampa(t, TW[k] - 0.35, 0.3)} tam={50} fondo={["#FFF4DA", "#DDE3FF", "#E3F6EC", "#FFE1D8"][k]} giro={[-3, 2, 2, -3][k]} />)}
      <Sombra x={540} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={230} t={t} cara={t > M.medir ? "feliz" : "tranquila"} bd={-50 * pulso(t, M.toma - 0.3, 1)} semilla={3} />
    </Escena>
  );
}

/* ═════ 4–5 · Definir las actividades ═════ */
function Definir({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(5) - 0.2, b: E(5), s: 1.04, x: 540, y: 950 }]);
  const flecha = sale(rampa(t, M.paquetes5 - 0.2, 0.6));
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={250} txt="definir las actividades" p={rampa(t, M.definir - 0.4, 0.35)} tam={62} fondo={MANGO} />
      <Cartel x={540} y={390} txt="identificar y documentar acciones" p={rampa(t, M.identificar - 0.4, 0.35)} tam={42} fondo={CREMA} giro={-2} />
      <Cartel x={540} y={500} txt="para elaborar los entregables" p={rampa(t, M.entregables4 - 0.7, 0.35)} tam={40} fondo="#E3F6EC" giro={1} />
      <Gigante x={260} y={760} txt="📦" p={rampa(t, M.paquetes5 - 0.4, 0.35)} tam={150} giro={-8} />
      <div style={{ position: "absolute", left: 360, top: 740, width: 360 * flecha, height: 18, borderRadius: 9, background: COLOR.CORAL }} />
      <Gigante x={820} y={760} txt="📋" p={rampa(t, M.paquetes5 + 0.3, 0.35)} tam={150} giro={8} />
      <Cartel x={540} y={980} txt="🔁 a lo largo de todo el proyecto" p={rampa(t, M.largo - 0.4, 0.35)} tam={44} fondo="#DDE3FF" />
      <Sombra x={540} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 6–7 · Lista de actividades y atributos ═════ */
function Lista({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(7), b: E(7), s: 1.02, x: 540, y: 960 }]);
  const pL = rampa(t, M.lista6 - 0.4, 0.4);
  const ATR = [[M.nombre, "🏷️ nombre"], [M.codigo, "🔢 código"], [M.paquete7, "📦 paquete 1.1.2"], [M.antes, "⬅️ antes · después ➡️"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      {pL > 0 && (
        <div style={{ position: "absolute", left: 90, top: 170, width: 900, height: 640, background: "#FFFDF7", border: `8px solid ${TINTA}`, borderRadius: 26, boxShadow: "0 14px 0 rgba(42,30,23,.28)", transform: `scale(${rebote(pL)})`, transformOrigin: "50% 0", fontFamily: "Sora", fontWeight: 800, color: TINTA, overflow: "hidden" }}>
          <div style={{ height: 100, background: AZUL, color: "#fff", fontSize: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>lista de actividades</div>
          {ACT.map(([ic, txt, id], k) => (
            <div key={k} style={{ position: "absolute", left: 24, right: 24, top: 124 + k * 124, height: 106, display: "flex", alignItems: "center", gap: 20, background: k % 2 ? "#FFF4DA" : "#F4F0E6", borderRadius: 16, padding: "0 20px", fontSize: 42, opacity: rampa(t, M.lista6 + k * 0.2, 0.3) }}>
              <span style={{ background: AZUL, color: "#fff", borderRadius: 12, padding: "2px 14px", fontSize: 36, opacity: rampa(t, M.identificador - 0.3, 0.3) }}>{id}</span>
              <span style={{ fontSize: 52 }}>{ic}</span>
              <span style={{ opacity: rampa(t, M.descripcion6 - 0.3, 0.3) }}>{txt}</span>
            </div>
          ))}
        </div>
      )}
      <Cartel x={540} y={900} txt="atributos" p={rampa(t, M.atributos - 0.4, 0.35)} tam={52} fondo={MANGO} giro={-2} />
      {ATR.map(([tw, txt], k) => <Cartel key={k} x={k % 2 ? 770 : 310} y={1020 + Math.floor(k / 2) * 115} txt={txt} p={rampa(t, tw - 0.35, 0.3)} tam={k === 3 ? 34 : 40} fondo={k === 3 ? "#DDE3FF" : CREMA} giro={[-2, 2, 1, -1][k]} />)}
      <Sombra x={540} y={1510} w={190} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={240} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 8–10 · Lista de hitos ═════ */
function Hitos({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10), s: 1.02, x: 540, y: 960 }]);
  const pB = rampa(t, M.carrito9 - 0.4, 0.4);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(6px)" velo={0.25}>
      <Documento x={540} y={390} w={320} p={rampa(t, M.hitos8 - 0.6, 0.4)} titulo="lista de hitos" letra={44} giro={-3} />
      <Gigante x={230} y={480} txt="🚩" p={pB} tam={150} giro={-8 + 5 * Math.sin(t * 4)} />
      <Cartel x={600} y={780} txt="«carrito aprobado por el parque»" p={pB} tam={36} fondo="#E3F6EC" giro={1} />
      <Cartel x={540} y={660} txt="punto o evento significativo" p={rampa(t, M.significativo - 0.4, 0.35)} tam={40} fondo={CREMA} />
      <Cartel x={540} y={910} txt="⏱️ duración: 0" p={rampa(t, M.cero - 0.6, 0.35)} tam={56} fondo={MANGO} giro={-2} />
      <Cartel x={320} y={1060} txt="📜 obligatorio (contrato)" p={rampa(t, M.obligatorio - 0.4, 0.3)} tam={38} fondo="#FFE1D8" giro={-2} />
      <Cartel x={780} y={1060} txt="✨ opcional" p={rampa(t, M.opcional - 0.5, 0.3)} tam={42} fondo="#DDE3FF" giro={2} />
      <Sombra x={200} y={1510} w={190} />
      <Mascota esp="hamster-gorra" x={200} y={1515} alto={300} t={t} cara={t > M.cero ? "estrellas" : "feliz"} bi={-50 * pulso(t, M.hitos8 - 0.4, 1)} semilla={3} />
      <Sombra x={870} y={1510} w={180} />
      <Mascota esp="gato-gafas" x={870} y={1515} alto={300} t={t} cara="feliz" semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 11 · Tu paquete en actividades ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={300} txt="⚡ 📦 → actividades" p={rampa(t, M.toca - 0.2, 0.35)} tam={62} fondo={MANGO} />
      {[0, 1, 2].map((k) => <Cartel key={k} x={540} y={470 + k * 130} txt={`A${k + 1} · __________`} p={rampa(t, M.convierte + k * 0.3, 0.3)} tam={48} fondo={CREMA} giro={[-2, 1, -1][k]} />)}
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.actividades11, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="perro-corbatin" x={790} y={1535} alto={380} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "desglose") return <Desglose t={t} />;
  if (p.tipo === "definir") return <Definir t={t} />;
  if (p.tipo === "lista") return <Lista t={t} />;
  if (p.tipo === "hitos") return <Hitos t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.toldo1 - 0.2, "pop", 0.35); fx(M.solo - 0.7, "toc-grave", 0.35);
fx(S(2) - 0.3, "whoosh", 0.4); fx(M.pregunta - 0.4, "pop-suave", 0.25); [M.medir, M.comprar, M.coser, M.instalar].forEach((w) => fx(w - 0.35, "pop", 0.25));
fx(S(4) - 0.3, "whoosh", 0.4); fx(M.definir - 0.4, "pop", 0.3); fx(M.paquetes5 - 0.2, "desliza", 0.3); fx(M.largo - 0.4, "rebobina", 0.25);
fx(S(6) - 0.3, "whoosh", 0.4); fx(M.lista6 - 0.4, "papel", 0.35); fx(M.atributos - 0.4, "pop", 0.3); [M.nombre, M.codigo, M.paquete7, M.antes].forEach((w) => fx(w - 0.35, "pop-suave", 0.22));
fx(S(8) - 0.3, "whoosh", 0.4); fx(M.hitos8 - 0.6, "papel", 0.3); fx(M.carrito9 - 0.4, "campana", 0.3); fx(M.cero - 0.6, "ding", 0.3); fx(M.obligatorio - 0.4, "pop", 0.25); fx(M.opcional - 0.5, "pop", 0.25);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/calle.jpg", "art/oficina.jpg"];
const CLAVE = /^(actividades|actividad|paquete|atributos|identificador|hito|hitos|significativo|cero|obligatorio|opcional)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP28 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp28-actividades.mp3" sinSonido={sinSonido} />
);
