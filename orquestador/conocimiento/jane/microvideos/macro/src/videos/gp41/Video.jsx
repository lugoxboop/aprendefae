/*
 * Gestión de Proyectos · GP-41 «¿Cuál atiendo primero?» (gp41-cualitativo).
 * Una idea: Realizar el Análisis Cualitativo de Riesgos es priorizar los riesgos individuales
 * evaluando su probabilidad de ocurrencia e impacto (11.3, p. 419); concentra el esfuerzo en los de
 * alta prioridad. Evaluación de probabilidad e impacto sobre cronograma, costo, calidad (11.3.2.3);
 * matriz de probabilidad e impacto (11.3.2.6); calidad de los datos y categorización (11.3.2.3,
 * 11.3.2.5). Registro de riesgos actualizado: prioridad, dueño, lista de observación (11.3.3.1).
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3] });
const { S, E, W } = T;

const M = {
  veinte: W(1, "veinte", 0.35), alcanza: W(1, "alcanza", 0.65), todos: W(1, "todos.", 0.95),
  cual: W(2, "cuál", 0.6),
  realizar: W(3, "Realizar", 0.05), priorizar: W(3, "priorizar", 0.4), probabilidad3: W(3, "probabilidad", 0.7), impacto3: W(3, "impacto.", 0.95),
  esfuerzo: W(4, "esfuerzo", 0.3), alta: W(4, "alta", 0.85),
  probable: W(5, "probable", 0.3), afecta: W(5, "afecta", 0.55), cronograma: W(5, "cronograma,", 0.7), costo: W(5, "costo", 0.82), calidad5: W(5, "calidad?", 0.95),
  matriz: W(6, "matriz", 0.55),
  horno: W(7, "horno", 0.1), alta7: W(7, "alta,", 0.35), rojo: W(7, "rojo.", 0.95),
  llueva: W(8, "llueva", 0.15), media: W(8, "media,", 0.45), verde: W(8, "verde.", 0.95),
  datos: W(9, "datos", 0.3), confiables: W(9, "confiables,", 0.55), categorias: W(9, "categorías.", 0.95),
  registro: W(10, "registro", 0.1), prioridad10: W(10, "prioridad,", 0.45), dueno: W(10, "dueño", 0.6), observacion: W(10, "observación", 0.8),
  toca: W(11, "toca:", 0.15), ubica: W(11, "ubica", 0.3), tres: W(11, "tres", 0.4), matriz11: W(11, "matriz", 0.8),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "definicion", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "preguntas", desde: S(5) - 0.3, entra: "zoom" },
  { tipo: "matriz", desde: S(6) - 0.3, entra: "barrido-izq" },
  { tipo: "datos", desde: S(9) - 0.3, entra: "barrido" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

const COLOR3 = [["#FFF4DA", "#FFD8B0", "#FF9E9E"], ["#E3F6EC", "#FFF4DA", "#FFD8B0"], ["#C9EFD8", "#E3F6EC", "#FFF4DA"]];

/* Matriz 3×3: fila 0 = probabilidad alta (arriba), columna 2 = impacto alto (derecha) */
function Matriz({ x, y, c, p, t, fichas = [] }) {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: c * 3 + 20, height: c * 3 + 20, opacity: p, transform: `scale(${0.8 + 0.2 * sale(p)})`, transformOrigin: "50% 50%", fontFamily: "Sora", fontWeight: 800, color: TINTA }}>
      {[0, 1, 2].map((f) => [0, 1, 2].map((k) => <div key={f + "-" + k} style={{ position: "absolute", left: k * (c + 10), top: f * (c + 10), width: c, height: c, background: COLOR3[f][k], border: `6px solid ${TINTA}`, borderRadius: 16, boxSizing: "border-box" }} />))}
      {fichas.map(([f, k, txt, q], i) => q > 0 && <div key={i} style={{ position: "absolute", left: k * (c + 10), top: f * (c + 10), width: c, height: c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: c * 0.42, transform: `scale(${rebote(Math.min(1, q))})` }}>{txt}</div>)}
    </div>
  );
}

/* ═════ 1–2 · Veinte riesgos ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  const n = Math.round(20 * sale(clamp01((t - (M.veinte - 0.6)) / 1.2)));
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(5px)" velo={0.15}>
      <Cartel x={540} y={200} txt="📒 registro de riesgos" p={rampa(t, 0.1, 0.35)} tam={48} fondo={MANGO} />
      {Array.from({ length: n }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: 150 + (i % 5) * 160, top: 320 + Math.floor(i / 5) * 120, width: 140, height: 96, background: "#FFFDF7", border: `5px solid ${TINTA}`, borderRadius: 14, transform: `rotate(${((i * 37) % 9) - 4}deg)`, fontFamily: "Sora", fontWeight: 800, fontSize: 30, color: TINTA, display: "flex", alignItems: "center", justifyContent: "center" }}>R{i + 1}</div>
      ))}
      <Cartel x={540} y={890} txt="⏳ no alcanza el tiempo para todos" p={rampa(t, M.alcanza - 0.3, 0.35)} tam={38} fondo="#FFE1D8" giro={-1} />
      <Cartel x={540} y={1010} txt="¿por cuál empiezo?" p={rampa(t, M.cual - 0.4, 0.35)} tam={50} fondo={CREMA} giro={2} />
      <Sombra x={260} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={260} y={1515} alto={360} t={t} cara={t > M.alcanza ? "triste" : "tranquila"} cab={6 * Math.sin(t * 3)} semilla={3} />
      <Sombra x={830} y={1510} w={190} />
      <Mascota esp="gato-gafas" x={830} y={1515} alto={350} t={t} cara="tranquila" semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 3–4 · Qué es ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(4), b: E(4) + 0.3, s: 1.03, x: 540, y: 955 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={250} txt="realizar el análisis cualitativo de riesgos" p={rampa(t, M.realizar - 0.3, 0.35)} tam={40} fondo={MANGO} />
      <Cartel x={540} y={420} txt="🥇 priorizar los riesgos" p={rampa(t, M.priorizar - 0.35, 0.35)} tam={48} fondo={CREMA} giro={-1} />
      <Cartel x={320} y={580} txt="🎲 probabilidad" p={rampa(t, M.probabilidad3 - 0.35, 0.3)} tam={42} fondo="#DDE3FF" giro={-2} />
      <Cartel x={770} y={580} txt="💥 impacto" p={rampa(t, M.impacto3 - 0.4, 0.3)} tam={42} fondo="#DDE3FF" giro={2} />
      <Cartel x={540} y={780} txt="🎯 esfuerzo en los de alta prioridad" p={rampa(t, M.esfuerzo - 0.35, 0.35)} tam={40} fondo="#E3F6EC" giro={-1} />
      <Sombra x={540} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara={t > M.alta ? "estrellas" : "feliz"} semilla={3} />
    </Escena>
  );
}

/* ═════ 5 · Dos preguntas ═════ */
function Preguntas({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(5), b: E(5) + 0.3, s: 1.03, x: 540, y: 955 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={260} txt="🎲 ¿qué tan probable es?" p={rampa(t, M.probable - 0.4, 0.35)} tam={50} fondo={CREMA} giro={-1} />
      <Cartel x={540} y={450} txt="💥 si ocurre, ¿cuánto afecta?" p={rampa(t, M.afecta - 0.4, 0.35)} tam={48} fondo={CREMA} giro={1} />
      {[[M.cronograma, "📅 cronograma"], [M.costo, "💲 costo"], [M.calidad5, "⭐ calidad"]].map(([tw, txt], k) => <Cartel key={k} x={200 + k * 340} y={630} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={40} fondo="#DDE3FF" giro={[-2, 1, -1][k]} />)}
      <Sombra x={540} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara="tranquila" cab={8 * Math.sin(t * 2.5)} semilla={3} />
    </Escena>
  );
}

/* ═════ 6–8 · La matriz ═════ */
function MatrizEsc({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(8), b: E(8), s: 1.02, x: 540, y: 960 }]);
  const pM = rampa(t, M.matriz - 0.4, 0.4);
  const c = 210, x0 = 230, y0 = 330;
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={200} txt="matriz de probabilidad e impacto" p={pM} tam={42} fondo={MANGO} />
      <Matriz x={x0} y={y0} c={c} p={pM} t={t} fichas={[[0, 2, "🔥", rampa(t, M.alta7 - 0.2, 0.3)], [1, 0, "🌧️", rampa(t, M.media - 0.2, 0.3)]]} />
      <div style={{ position: "absolute", left: x0 - 150, top: y0 + 280, width: 380, transform: "rotate(-90deg)", textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 36, color: TINTA, opacity: pM }}>probabilidad ⬆️</div>
      <div style={{ position: "absolute", left: x0, top: y0 + 3 * c + 40, width: 3 * c + 20, textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 36, color: TINTA, opacity: pM }}>impacto ➡️</div>
      <Cartel x={540} y={1130} txt="🔥 horno viejo: prioridad alta" p={rampa(t, M.rojo - 0.4, 0.3)} tam={38} fondo="#FF9E9E" giro={-2} />
      <Cartel x={540} y={1240} txt="🌧️ llovizna: prioridad baja" p={rampa(t, M.verde - 0.4, 0.3)} tam={38} fondo="#C9EFD8" giro={2} />
      <Sombra x={150} y={1520} w={150} />
      <Mascota esp="perro-corbatin" x={150} y={1525} alto={230} t={t} cara={t > M.rojo ? "triste" : "tranquila"} semilla={9} />
      <Sombra x={930} y={1520} w={150} />
      <Mascota esp="hamster-gorra" x={930} y={1525} alto={230} t={t} cara="feliz" semilla={3} espejo />
    </Escena>
  );
}

/* ═════ 9–10 · Datos, categorías y registro ═════ */
function Datos({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10), s: 1.02, x: 540, y: 960 }]);
  const pR = rampa(t, M.registro - 0.4, 0.4);
  const C = [["prioridad", "🔴 alta", "🟢 baja"], ["dueño", "Ramón", "Pía"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={320} y={220} txt="✔️ ¿datos confiables?" p={rampa(t, M.datos - 0.35, 0.3)} tam={38} fondo={CREMA} giro={-2} />
      <Cartel x={770} y={220} txt="🗃️ por categorías" p={rampa(t, M.categorias - 0.5, 0.3)} tam={38} fondo={CREMA} giro={2} />
      <div style={{ position: "absolute", left: 90, top: 340, width: 900, height: 440, background: "#FFFDF7", border: `8px solid ${TINTA}`, borderRadius: 24, opacity: pR, fontFamily: "Sora", fontWeight: 800, color: TINTA }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 90, background: AZUL, borderRadius: "16px 16px 0 0", color: "#fff", fontSize: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>registro de riesgos</div>
        {["riesgo", "🔥 horno viejo", "🌧️ llovizna"].map((txt, i) => <div key={i} style={{ position: "absolute", left: 30, top: 120 + i * 100, width: 330, fontSize: i ? 34 : 30, color: i ? TINTA : "#5B4A3E" }}>{txt}</div>)}
        {C.map(([cab, a, b], k) => {
          const q = rampa(t, [M.prioridad10, M.dueno][k] - 0.3, 0.3);
          return [cab, a, b].map((txt, i) => <div key={k + "-" + i} style={{ position: "absolute", left: 400 + k * 250, top: 120 + i * 100, width: 230, fontSize: i ? 34 : 30, opacity: q, color: i ? TINTA : "#5B4A3E" }}>{txt}</div>);
        })}
      </div>
      <Cartel x={540} y={880} txt="👀 lista de observación: los de baja prioridad" p={rampa(t, M.observacion - 0.4, 0.35)} tam={34} fondo="#E3F6EC" giro={-1} />
      <Sombra x={540} y={1520} w={190} />
      <Mascota esp="hamster-gorra" x={540} y={1525} alto={280} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 11 · Tu matriz ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={260} txt="⚡ ubica tres riesgos" p={rampa(t, M.toca - 0.2, 0.35)} tam={56} fondo={MANGO} />
      <Matriz x={380} y={380} c={100} p={rampa(t, M.matriz11 - 0.6, 0.35)} t={t} fichas={[[0, 1, "1", rampa(t, M.matriz11, 0.3)], [1, 2, "2", rampa(t, M.matriz11 + 0.3, 0.3)], [2, 0, "3", rampa(t, M.matriz11 + 0.6, 0.3)]]} />
      <Sombra x={300} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={300} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.matriz11, 0.5)} semilla={3} />
      <Sombra x={800} y={1530} w={200} />
      <Mascota esp="gato-gafas" x={800} y={1535} alto={380} t={t} cara="feliz" semilla={7} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "definicion") return <Definicion t={t} />;
  if (p.tipo === "preguntas") return <Preguntas t={t} />;
  if (p.tipo === "matriz") return <MatrizEsc t={t} />;
  if (p.tipo === "datos") return <Datos t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(0.1, "pop", 0.3); fx(M.veinte - 0.6, "papel", 0.3); fx(M.alcanza - 0.3, "toc-grave", 0.3); fx(M.cual - 0.4, "pop", 0.3);
fx(S(3) - 0.3, "whoosh", 0.4); fx(M.priorizar - 0.35, "pop", 0.3); fx(M.probabilidad3 - 0.35, "pop-suave", 0.22); fx(M.impacto3 - 0.4, "pop-suave", 0.22); fx(M.esfuerzo - 0.35, "ding", 0.22);
fx(S(5) - 0.3, "whoosh", 0.4); [M.cronograma, M.costo, M.calidad5].forEach((w) => fx(w - 0.3, "pop-suave", 0.22));
fx(S(6) - 0.3, "whoosh", 0.4); fx(M.matriz - 0.4, "tiza-larga", 0.25); fx(M.alta7 - 0.2, "golpe", 0.3); fx(M.media - 0.2, "pop", 0.25);
fx(S(9) - 0.3, "whoosh", 0.4); fx(M.registro - 0.4, "papel", 0.3); fx(M.observacion - 0.4, "ding", 0.22);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/panaderia.jpg", "art/oficina.jpg"];
const CLAVE = /^(cualitativo|priorizar|probabilidad|impacto|matriz|prioridad|registro|observación)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP41 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp41-cualitativo.mp3" sinSonido={sinSonido} />
);
