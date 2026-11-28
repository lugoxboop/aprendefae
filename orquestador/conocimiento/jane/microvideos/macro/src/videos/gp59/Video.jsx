/*
 * Gestión de Proyectos · GP-59 «El alcance que crece solo» (gp59-controlar-alcance).
 * Una idea: Controlar el Alcance es monitorear el estado del alcance del proyecto y del producto, y gestionar
 * cambios a la línea base del alcance; la línea base se mantiene a lo largo del proyecto (5.6, p. 167).
 * La expansión incontrolada sin ajustes de tiempo, costo y recursos se denomina corrupción o deslizamiento del
 * alcance; los cambios son inevitables y todo proyecto necesita un proceso de control de cambios (p. 168).
 * Análisis de variación y de tendencias; causa y grado de la desviación; acción correctiva o preventiva
 * (5.6.2.1, p. 170); solicitudes de cambio vía Realizar el Control Integrado de Cambios (5.6.3.2).
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
    3: ["Controlar el alcance es monitorear el estado", "del alcance del proyecto y del producto,", "y gestionar cambios a la línea base del alcance."],
    5: ["Si crece sin control ni ajustes de tiempo, costo y recursos,", "es corrupción o deslizamiento del alcance."],
    9: ["La clave: hallar la causa y el grado de la desviación,", "y decidir si hace falta una acción correctiva o preventiva."],
    10: ["Pía no dice que no: registra una solicitud de cambio,", "que pasa por el control integrado de cambios."],
    11: ["Ahora te toca: recuerda algo que creció sin control en un proyecto tuyo,", "y cómo lo habrías frenado."],
  },
});
const { S, E, W } = T;
const VERDE = "#2FB36B";

const M = {
  puesto: W(1, "puesto", 0.3), otro: W(1, "otro.", 0.6), musica: W(1, "música", 0.85),
  tiempo2: W(2, "tiempo", 0.4), presupuesto2: W(2, "presupuesto.", 0.95),
  controlar: W(3, "Controlar", 0.03), monitorear: W(3, "monitorear", 0.2), producto: W(3, "producto,", 0.55), gestionar: W(3, "gestionar", 0.65), linea3: W(3, "línea", 0.85),
  mantiene: W(4, "mantiene", 0.6),
  crece: W(5, "crece", 0.1), tiempo5: W(5, "tiempo,", 0.4), costo5: W(5, "costo", 0.48), recursos5: W(5, "recursos,", 0.56), corrupcion: W(5, "corrupción", 0.7), deslizamiento: W(5, "deslizamiento", 0.85),
  inevitables: W(6, "inevitables.", 0.3), proceso6: W(6, "proceso", 0.75),
  variacion: W(7, "variación", 0.4), linea7: W(7, "línea", 0.65), reales: W(7, "reales.", 0.97),
  tendencias: W(8, "tendencias", 0.2), mejora: W(8, "mejora", 0.55), deteriora: W(8, "deteriora", 0.75),
  causa: W(9, "causa", 0.25), grado: W(9, "grado", 0.35), correctiva: W(9, "correctiva", 0.85), preventiva: W(9, "preventiva.", 0.97),
  noque: W(10, "no.", 0.25), solicitud10: W(10, "solicitud", 0.45), integrado: W(10, "integrado", 0.85),
  toca: W(11, "toca:", 0.1), crecio: W(11, "creció", 0.3), frenado: W(11, "frenado.", 0.97),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "definicion", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "globo", desde: S(5) - 0.3, entra: "zoom" },
  { tipo: "analisis", desde: S(7) - 0.3, entra: "barrido-izq" },
  { tipo: "salida", desde: S(10) - 0.3, entra: "barrido" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* ═════ 1–2 · Uno más, y otro… ═════ */
const PILA = [["🏪 +1 puesto", "puesto"], ["🏪 +1 puesto", "otro"], ["🎵 música en vivo", "musica"]];
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(5px)" velo={0.15}>
      {PILA.map(([txt, k2], k) => <Cartel key={k} x={540 + [-160, 160, 0][k]} y={720 - k * 150} txt={txt} p={rampa(t, M[k2] - 0.3, 0.3)} tam={46} fondo={["#FFFDF7", "#FFFDF7", "#DDE3FF"][k]} giro={[-4, 3, -2][k]} />)}
      <Cartel x={290} y={190} txt="⏱️ mismo tiempo" p={rampa(t, M.tiempo2 - 0.3, 0.3)} tam={40} fondo={CREMA} giro={-2} />
      <Cartel x={770} y={190} txt="💲 mismo presupuesto" p={rampa(t, M.presupuesto2 - 0.5, 0.3)} tam={34} fondo={CREMA} giro={2} />
      <Gigante x={540} y={920} txt="⚠️" p={rampa(t, M.presupuesto2 - 0.1, 0.3)} tam={110} />
      <Sombra x={260} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={260} y={1515} alto={330} t={t} cara={t > M.otro ? "tranquila" : "feliz"} cab={8 * Math.sin(t * 3) * rampa(t, M.musica, 0.3)} semilla={3} />
      <Sombra x={820} y={1510} w={200} />
      <Mascota esp="perro-mochila" x={820} y={1515} alto={350} t={t} cara="feliz" salto={25 * pulso(t, M.musica, 0.5)} semilla={5} espejo />
    </Escena>
  );
}

/* ═════ 3–4 · Qué es ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(4), b: E(4) + 0.3, s: 1.03, x: 540, y: 955 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={190} txt="controlar el alcance" p={rampa(t, M.controlar - 0.3, 0.35)} tam={54} fondo={MANGO} />
      <Cartel x={540} y={330} txt="👀 monitorear el estado del alcance" p={rampa(t, M.monitorear - 0.3, 0.3)} tam={38} fondo={CREMA} giro={-1} />
      <Cartel x={540} y={430} txt="del proyecto y del producto" p={rampa(t, M.producto - 0.4, 0.3)} tam={34} fondo="#FFFDF7" giro={1} />
      <Cartel x={540} y={550} txt="🔄 gestionar cambios a la línea base del alcance" p={rampa(t, M.gestionar - 0.3, 0.3)} tam={33} fondo="#DDE3FF" />
      <Cartel x={540} y={720} txt="📏 la línea base se mantiene" p={rampa(t, M.mantiene - 0.4, 0.3)} tam={42} fondo="#E3F6EC" giro={-1} />
      <Sombra x={540} y={1530} w={170} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={280} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 5–6 · El globo que crece ═════ */
function Globo({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(6), b: E(6) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const g = sale(rampa(t, M.crece - 0.3, 2.2));
  const r = lerp(110, 250, g) + 6 * Math.sin(t * 4) * g;
  const F = [[M.tiempo5, "⏱️ tiempo"], [M.costo5, "💲 costo"], [M.recursos5, "🧰 recursos"]];
  const pI = rampa(t, M.inevitables - 0.4, 0.3);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(7px)" velo={0.3}>
      <div style={{ position: "absolute", left: 540 - r, top: 470 - r, width: 2 * r, height: 2 * r, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #FFB4A8, #E5484D)", border: `8px solid ${TINTA}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 46, color: "#fff", opacity: 1 - pI }}>alcance</div>
      {F.map(([tw, txt], k) => <Cartel key={k} x={200 + k * 340} y={820} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={38} fondo={CREMA} giro={[-2, 1, 2][k]} />)}
      {F.map(([tw], k) => <Gigante key={k} x={200 + k * 340} y={900} txt="🔒" p={rampa(t, tw, 0.3)} tam={50} />)}
      <Cartel x={540} y={1020} txt="corrupción o deslizamiento del alcance" p={rampa(t, M.corrupcion - 0.3, 0.3)} tam={36} fondo="#FFE1D8" color={ROJO} giro={-1} />
      {pI > 0 && <Cartel x={540} y={400} txt="🔄 los cambios son inevitables" p={pI} tam={42} fondo="#FFFDF7" giro={1} />}
      {pI > 0 && <Cartel x={540} y={520} txt="✅ un proceso de control de cambios" p={rampa(t, M.proceso6 - 0.3, 0.3)} tam={38} fondo="#E3F6EC" giro={-1} />}
      <Sombra x={170} y={1540} w={150} />
      <Mascota esp="hamster-gorra" x={170} y={1545} alto={230} t={t} cara={t > M.crece && t < M.inevitables ? "triste" : "feliz"} semilla={3} />
      <Sombra x={910} y={1540} w={150} />
      <Mascota esp="perro-mochila" x={910} y={1545} alto={240} t={t} cara="tranquila" semilla={5} espejo />
    </Escena>
  );
}

/* ═════ 7–9 · Variación, tendencias, causa ═════ */
function Analisis({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(9), b: E(9) + 0.3, s: 1.02, x: 540, y: 960 }]);
  const pP = rampa(t, M.linea7 - 0.4, 0.5), pR = rampa(t, M.reales - 0.4, 0.5);
  const pT = sale(rampa(t, M.tendencias, 1.2));
  const pts = [[600, 1000], [680, 980], [760, 940], [840, 880]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={170} txt="📊 análisis de variación" p={rampa(t, M.variacion - 0.4, 0.35)} tam={44} fondo={MANGO} />
      <div style={{ position: "absolute", left: 160, top: 560 - 220 * sale(pP), width: 160, height: 220 * sale(pP), background: "#5B8DEF", border: `6px solid ${TINTA}`, borderRadius: 12 }} />
      <div style={{ position: "absolute", left: 400, top: 560 - 320 * sale(pR), width: 160, height: 320 * sale(pR), background: ROJO, border: `6px solid ${TINTA}`, borderRadius: 12 }} />
      <div style={{ position: "absolute", left: 120, top: 560, width: 480, height: 8, background: TINTA, borderRadius: 4 }} />
      <Cartel x={240} y={610} txt="línea base" p={pP} tam={30} fondo={CREMA} />
      <Cartel x={480} y={610} txt="real" p={pR} tam={30} fondo={CREMA} />
      <Cartel x={790} y={720} txt="📈 tendencias" p={rampa(t, M.tendencias - 0.4, 0.3)} tam={38} fondo="#DDE3FF" giro={2} />
      <svg width="1080" height="1920" style={{ position: "absolute", left: 0, top: 0, opacity: rampa(t, M.tendencias, 0.3) }}>
        <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke={TINTA} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="840" y1="880" x2={lerp(840, 950, pT)} y2={lerp(880, 800, pT)} stroke={ROJO} strokeWidth="10" strokeDasharray="18 12" strokeLinecap="round" />
      </svg>
      <Cartel x={800} y={330} txt="¿mejora o se deteriora?" p={rampa(t, M.mejora - 0.4, 0.3)} tam={32} fondo="#FFFDF7" giro={1} />
      <Cartel x={300} y={800} txt="🔍 causa" p={rampa(t, M.causa - 0.3, 0.3)} tam={40} fondo={CREMA} giro={-2} />
      <Cartel x={300} y={900} txt="📏 grado" p={rampa(t, M.grado - 0.3, 0.3)} tam={40} fondo={CREMA} giro={2} />
      <Cartel x={540} y={1050} txt="🔧 correctiva  ·  🛡️ preventiva" p={rampa(t, M.correctiva - 0.4, 0.3)} tam={38} fondo="#E3F6EC" />
      <Sombra x={160} y={1540} w={140} />
      <Mascota esp="hamster-gorra" x={160} y={1545} alto={230} t={t} cara="feliz" semilla={3} />
      <Sombra x={920} y={1540} w={140} />
      <Mascota esp="perro-mochila" x={920} y={1545} alto={230} t={t} cara="tranquila" semilla={5} espejo />
    </Escena>
  );
}

/* ═════ 10 · Pía no dice que no ═════ */
function Salida({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10) + 0.3, s: 1.03, x: 540, y: 955 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={200} txt="🙅 no dice que no" p={rampa(t, M.noque - 0.4, 0.3)} tam={46} fondo={CREMA} giro={-2} />
      <Documento x={540} y={520} w={280} p={rampa(t, M.solicitud10 - 0.4, 0.4)} titulo="solicitud de cambio" letra={36} giro={-3} />
      <Gigante x={540} y={790} txt="⬇️" p={rampa(t, M.integrado - 0.8, 0.3)} tam={80} />
      <Cartel x={540} y={900} txt="control integrado de cambios" p={rampa(t, M.integrado - 0.5, 0.3)} tam={40} fondo={MANGO} giro={1} />
      <Sombra x={260} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={260} y={1515} alto={340} t={t} cara="guino" bi={-40 * pulso(t, M.solicitud10, 1.0)} semilla={3} />
      <Sombra x={820} y={1510} w={200} />
      <Mascota esp="perro-mochila" x={820} y={1515} alto={350} t={t} cara="feliz" semilla={5} espejo />
    </Escena>
  );
}

/* ═════ 11 · Tu alcance ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={260} txt="⚡ tu alcance" p={rampa(t, M.toca - 0.2, 0.35)} tam={58} fondo={MANGO} />
      <Cartel x={540} y={420} txt="🎈 creció: ________" p={rampa(t, M.crecio - 0.3, 0.3)} tam={44} fondo={CREMA} giro={-2} />
      <Cartel x={540} y={550} txt="🛑 cómo frenarlo: ________" p={rampa(t, M.frenado - 1.0, 0.3)} tam={42} fondo={CREMA} giro={1} />
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.frenado, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="perro-mochila" x={790} y={1535} alto={370} t={t} cara="feliz" semilla={5} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "definicion") return <Definicion t={t} />;
  if (p.tipo === "globo") return <Globo t={t} />;
  if (p.tipo === "analisis") return <Analisis t={t} />;
  if (p.tipo === "salida") return <Salida t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
[M.puesto, M.otro, M.musica].forEach((w) => fx(w - 0.3, "pop", 0.25)); fx(M.presupuesto2 - 0.1, "bocina", 0.22);
fx(S(3) - 0.3, "whoosh", 0.4); [M.monitorear, M.producto, M.gestionar, M.mantiene].forEach((w) => fx(w - 0.3, "pop", 0.2));
fx(S(5) - 0.3, "whoosh", 0.4); fx(M.crece - 0.3, "burbuja", 0.3); [M.tiempo5, M.costo5, M.recursos5].forEach((w) => fx(w - 0.3, "pop-suave", 0.18)); fx(M.corrupcion - 0.3, "baja", 0.25); fx(M.inevitables - 0.4, "pop", 0.2); fx(M.proceso6 - 0.3, "ding", 0.22);
fx(S(7) - 0.3, "whoosh", 0.4); fx(M.linea7 - 0.4, "desliza", 0.22); fx(M.reales - 0.4, "desliza", 0.22); fx(M.tendencias, "desliza", 0.2); [M.causa, M.grado, M.correctiva].forEach((w) => fx(w - 0.3, "pop", 0.2));
fx(S(10) - 0.3, "whoosh", 0.4); fx(M.solicitud10 - 0.4, "papel", 0.3); fx(M.integrado - 0.5, "pop", 0.22);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/calle.jpg", "art/oficina.jpg"];
const CLAVE = /^(alcance|controlar|corrupción|deslizamiento|inevitables|variación|tendencias|causa|grado|correctiva|preventiva)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP59 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp59-controlar-alcance.mp3" sinSonido={sinSonido} />
);
