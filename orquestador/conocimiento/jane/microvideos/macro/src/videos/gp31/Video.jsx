/*
 * Gestión de Proyectos · GP-31 «La ruta que no da espera» (gp31-ruta-critica).
 * Una idea: Desarrollar el Cronograma es analizar secuencias de actividades, duraciones,
 * requisitos de recursos y restricciones para crear un modelo de programación; genera un modelo
 * con fechas planificadas (6.5, p. 205). Ruta crítica: el camino más largo, que determina la
 * menor duración posible; su holgura total normalmente es cero; holgura total = tiempo que una
 * actividad puede demorarse sin retrasar el fin del proyecto (6.5.2.2, p. 210–211). Cronograma
 * del proyecto: actividades con fechas planificadas, duraciones, hitos y recursos; diagramas de
 * barras o de Gantt (6.5.3.2, p. 217–218). Línea base del cronograma: versión aprobada del
 * modelo, solo cambia con control formal de cambios; se compara con las fechas reales (6.5.3.1).
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Ficha, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3] });
const { S, E, W } = T;

const M = {
  listo: W(1, "listo", 0.2), sabado: W(1, "sábado.", 0.4), atrasarse: W(1, "atrasarse", 0.8),
  secuencia: W(2, "secuencia,", 0.35), duraciones: W(2, "duraciones,", 0.5), recursos: W(2, "recursos", 0.7), restricciones: W(2, "restricciones.", 0.95),
  desarrollar: W(3, "desarrollar", 0.15), modelo: W(3, "modelo", 0.65), fechas: W(3, "fechas", 0.9),
  caminos: W(4, "caminos:", 0.15), toldo: W(4, "toldo", 0.3), siete: W(4, "siete", 0.45), pintar: W(4, "pintar", 0.7), cuatro: W(4, "cuatro.", 0.95),
  largo: W(5, "largo", 0.2), ruta: W(5, "ruta", 0.4), menor: W(5, "menor", 0.75),
  holgura6: W(6, "holgura", 0.2), cero: W(6, "cero:", 0.35), atrasa: W(6, "atrasa,", 0.7), final6: W(6, "final.", 0.95),
  pintura7: W(7, "pintura", 0.15), tres: W(7, "tres", 0.3), demorarse: W(7, "demorarse", 0.6), entrega: W(7, "entrega.", 0.95),
  cronograma8: W(8, "cronograma", 0.2), fechas8: W(8, "fechas,", 0.35), hitos: W(8, "hitos", 0.45), barras: W(8, "barras,", 0.85), gantt: W(8, "Gantt.", 0.95),
  aprobada: W(9, "aprobada", 0.1), linea9: W(9, "línea", 0.45), control9: W(9, "control", 0.85),
  reales: W(10, "reales", 0.3), desviaciones: W(10, "desviaciones.", 0.95),
  toca: W(11, "toca:", 0.2), encuentra: W(11, "encuentra", 0.4), ruta11: W(11, "ruta", 0.7),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "modelo", desde: S(2) - 0.3, entra: "barrido" },
  { tipo: "caminos", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "gantt", desde: S(8) - 0.3, entra: "barrido-izq" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

function Nodo({ x, y, w = 170, h = 120, p, ic, d, rojo = 0, gris = 0 }) {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, boxSizing: "border-box", background: rojo > 0 ? "#FFE1D8" : CREMA, border: `6px solid ${rojo > 0 ? ROJO : TINTA}`, borderRadius: 20, opacity: 1 - 0.0 * gris, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, color: TINTA, lineHeight: 1, transform: `scale(${rebote(Math.min(1, p))})` }}>
      <span style={{ fontSize: 50 }}>{ic}</span>
      <span style={{ fontSize: 28, marginTop: 4 }}>{d} {d === 1 ? "día" : "días"}</span>
    </div>
  );
}

const Fl = ({ x0, y0, x1, y1, p, color = TINTA, g = 8 }) => {
  if (p <= 0) return null;
  const q = clamp01(p), x = lerp(x0, x1, q), y = lerp(y0, y1, q), a = Math.atan2(y1 - y0, x1 - x0);
  const pt = (dd, s) => `${x - dd * Math.cos(a) + s * Math.sin(a)},${y - dd * Math.sin(a) - s * Math.cos(a)}`;
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1935, overflow: "visible" }}>
      <line x1={x0} y1={y0} x2={x} y2={y} stroke={color} strokeWidth={g} strokeLinecap="round" />
      {q > 0.2 && <polygon points={`${x},${y} ${pt(26, 14)} ${pt(26, -14)}`} fill={color} />}
    </svg>
  );
};

/* ═════ 1 · Listo el sábado ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(1) + 0.3, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(5px)" velo={0.15}>
      <Gigante x={540} y={480} txt="🗓️" p={rampa(t, M.listo - 0.3, 0.35)} tam={200} giro={-6} />
      <Cartel x={540} y={680} txt="sábado: carrito listo" p={rampa(t, M.sabado - 0.4, 0.35)} tam={58} fondo={MANGO} giro={-2} />
      <Cartel x={540} y={850} txt="¿qué no puede atrasarse? ⏰" p={rampa(t, M.atrasarse - 0.6, 0.35)} tam={50} fondo={ROJO} color="#fff" giro={2} />
      <Sombra x={300} y={1510} w={230} />
      <Mascota esp="hamster-gorra" x={300} y={1515} alto={400} t={t} cara={t > M.atrasarse - 0.5 ? "triste" : "tranquila"} cab={6 * Math.sin(t * 3)} semilla={3} />
      <Sombra x={810} y={1510} w={190} />
      <Mascota esp="gato-gafas" x={810} y={1515} alto={360} t={t} cara="feliz" semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 2–3 · Insumos y modelo ═════ */
function Modelo({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3), b: E(3), s: 1.03, x: 540, y: 955 }]);
  const IN = [[M.secuencia, "🔗 secuencia"], [M.duraciones, "⏱️ duraciones"], [M.recursos, "👥 recursos"], [M.restricciones, "⛔ restricciones"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      {IN.map(([tw, txt], k) => <Cartel key={k} x={k % 2 ? 770 : 310} y={260 + Math.floor(k / 2) * 120} txt={txt} p={rampa(t, tw - 0.35, 0.3)} tam={42} fondo={CREMA} giro={[-2, 2, 1, -1][k]} />)}
      <Gigante x={540} y={560} txt="⬇️" p={rampa(t, M.desarrollar - 0.3, 0.3)} tam={90} />
      <Cartel x={540} y={690} txt="desarrollar el cronograma" p={rampa(t, M.desarrollar - 0.4, 0.35)} tam={54} fondo={MANGO} />
      <Cartel x={540} y={850} txt="🗓️ modelo de programación" p={rampa(t, M.modelo - 0.4, 0.35)} tam={50} fondo="#DDE3FF" giro={-2} />
      <Cartel x={540} y={990} txt="con fechas planificadas" p={rampa(t, M.fechas - 0.4, 0.35)} tam={42} fondo="#E3F6EC" giro={2} />
      <Sombra x={160} y={1510} w={170} />
      <Mascota esp="hamster-gorra" x={160} y={1515} alto={270} t={t} cara="feliz" bd={-40 * pulso(t, M.secuencia - 0.3, 1)} semilla={3} />
    </Escena>
  );
}

/* ═════ 4–7 · Dos caminos y la ruta crítica ═════ */
function Caminos({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(7), b: E(7), s: 1.02, x: 540, y: 960 }]);
  const pT = (k) => rampa(t, M.toldo - 0.3 + k * 0.15, 0.3);
  const pP = (k) => rampa(t, M.pintar - 0.3 + k * 0.2, 0.3);
  const rojo = rampa(t, M.ruta - 0.4, 0.35);
  const col = rojo > 0.5 ? ROJO : TINTA;
  const Y1 = 470, Y2 = 760;
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <div style={{ position: "absolute", left: 30, top: 300, width: 1020, height: 600, background: "#FFFDF7", border: `8px solid ${TINTA}`, borderRadius: 26, opacity: rampa(t, S(4) - 0.3, 0.3) }} />
      <Cartel x={540} y={220} txt="ruta crítica" p={rojo} tam={60} fondo={ROJO} color="#fff" giro={-2} />
      {[0, 1, 2].map((k) => <Fl key={k} x0={140 + k * 210 + 80} y0={Y1} x1={140 + (k + 1) * 210 - 80} y1={Y1} p={pT(k + 1)} color={col} />)}
      <Fl x0={220} y0={Y2} x1={430} y1={Y2} p={pP(1)} />
      <Fl x0={770} y0={Y1} x1={880} y1={(Y1 + Y2) / 2 - 40} p={pT(4)} color={col} />
      <Fl x0={610} y0={Y2} x1={880} y1={(Y1 + Y2) / 2 + 40} p={pP(2)} />
      {[["📏", 1], ["🛒", 2], ["🧵", 3], ["🔧", 1]].map(([ic, d], k) => <Nodo key={k} x={140 + k * 210} y={Y1} p={pT(k)} ic={ic} d={d} rojo={rojo} />)}
      {[["🪵", 2], ["🎨", 2]].map(([ic, d], k) => <Nodo key={k} x={140 + k * 380} y={Y2} p={pP(k)} ic={ic} d={d} />)}
      <div style={{ position: "absolute", left: 880, top: (Y1 + Y2) / 2 - 70, width: 140, height: 140, borderRadius: "50%", background: "#E3F6EC", border: `6px solid ${TINTA}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 60, transform: `scale(${rebote(rampa(t, M.toldo, 0.3))})` }}>🏁</div>
      <Cartel x={460} y={360} txt="= 7 días" p={rampa(t, M.siete - 0.3, 0.3)} tam={40} fondo={rojo > 0.5 ? "#FFE1D8" : CREMA} giro={-2} />
      <Cartel x={330} y={860} txt="= 4 días" p={rampa(t, M.cuatro - 0.5, 0.3)} tam={40} fondo={CREMA} giro={2} />
      <Cartel x={540} y={1000} txt="⏳ holgura total: 0" p={rampa(t, M.cero - 0.4, 0.35)} tam={46} fondo="#FFE1D8" giro={-2} />
      <Cartel x={540} y={1120} txt="🎨 pintura: 3 días de holgura" p={rampa(t, M.tres - 0.4, 0.35)} tam={44} fondo="#E3F6EC" giro={2} />
      <Sombra x={170} y={1510} w={170} />
      <Mascota esp="hamster-gorra" x={170} y={1515} alto={260} t={t} cara={t > M.tres ? "feliz" : t > M.atrasa - 0.3 ? "triste" : "tranquila"} semilla={3} />
      <Sombra x={910} y={1510} w={160} />
      <Mascota esp="perro-corbatin" x={910} y={1515} alto={260} t={t} cara="feliz" bd={-40 * pulso(t, M.ruta - 0.3, 1)} semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 8–10 · Cronograma, línea base y desviaciones ═════ */
function Gantt({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10), s: 1.02, x: 540, y: 960 }]);
  const F = [["📏", 0, 1, true], ["🛒", 1, 2, true], ["🧵", 3, 3, true], ["🔧", 6, 1, true], ["🪵", 0, 2, false], ["🎨", 2, 2, false]];
  const pG = rampa(t, M.cronograma8 - 0.4, 0.4);
  const base = rampa(t, M.linea9 - 0.4, 0.4);
  const real = sale(rampa(t, M.reales - 0.3, 0.8));
  const X0 = 190, DIA = 112;
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={210} txt="cronograma del proyecto" p={rampa(t, M.cronograma8 - 0.4, 0.35)} tam={52} fondo={MANGO} />
      {pG > 0 && (
        <div style={{ position: "absolute", left: 40, top: 300, width: 1000, height: 640, background: "#FFFDF7", border: `8px solid ${TINTA}`, borderRadius: 26, transform: `scale(${rebote(pG)})`, transformOrigin: "50% 0", fontFamily: "Sora", fontWeight: 800, color: TINTA, overflow: "hidden" }}>
          {Array.from({ length: 7 }, (_, d) => <div key={d} style={{ position: "absolute", left: X0 - 40 + d * DIA, top: 16, width: DIA, textAlign: "center", fontSize: 28, color: "#8A7B6E" }}>{d + 1}</div>)}
          {Array.from({ length: 8 }, (_, d) => <div key={d} style={{ position: "absolute", left: X0 - 40 + d * DIA, top: 56, width: 2, height: 560, background: "#EAE3D6" }} />)}
          {F.map(([ic, a, d, crit], k) => {
            const q = rampa(t, M.fechas8 - 0.4 + k * 0.12, 0.3);
            const corre = k === 2 ? real : 0;
            return (
              <div key={k}>
                <div style={{ position: "absolute", left: 20, top: 74 + k * 90, fontSize: 52 }}>{ic}</div>
                {base > 0 && k === 2 && <div style={{ position: "absolute", left: X0 - 40 + a * DIA, top: 84 + k * 90, width: d * DIA, height: 56, borderRadius: 14, border: `5px dashed ${TINTA}`, opacity: base * 0.8, boxSizing: "border-box" }} />}
                <div style={{ position: "absolute", left: X0 - 40 + (a + corre) * DIA, top: 84 + k * 90, width: d * DIA * q, height: 56, borderRadius: 14, background: crit ? COLOR.CORAL : AZUL, border: `5px solid ${TINTA}`, boxSizing: "border-box" }} />
              </div>
            );
          })}
          <div style={{ position: "absolute", left: X0 - 40 + 7 * DIA - 34, top: 4, fontSize: 48, transform: `scale(${rebote(rampa(t, M.hitos - 0.3, 0.35))})` }}>◆</div>
        </div>
      )}
      <Cartel x={540} y={1020} txt="diagrama de barras (Gantt)" p={rampa(t, M.barras - 0.4, 0.35) * (1 - base)} tam={44} fondo="#DDE3FF" giro={-2} />
      <Cartel x={540} y={1020} txt="✅ aprobado = línea base del cronograma" p={base * (1 - rampa(t, M.reales - 0.4, 0.3))} tam={38} fondo="#E3F6EC" giro={-2} />
      <Cartel x={540} y={1020} txt="real vs. línea base → ⚠️ desviación" p={rampa(t, M.reales - 0.4, 0.35)} tam={40} fondo="#FFE1D8" giro={2} />
      <Cartel x={540} y={1140} txt="🔒 solo con control formal de cambios" p={rampa(t, M.control9 - 0.4, 0.35) * (1 - rampa(t, M.reales - 0.4, 0.3))} tam={36} fondo={CREMA} />
      <Sombra x={540} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={280} t={t} cara={t > M.desviaciones - 0.5 ? "tranquila" : "feliz"} semilla={3} />
    </Escena>
  );
}

/* ═════ 11 · Tu ruta crítica ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={320} txt="⚡ encuentra tu ruta crítica" p={rampa(t, M.toca - 0.2, 0.35)} tam={56} fondo={MANGO} />
      <Gigante x={540} y={600} txt="🔍" p={rampa(t, M.encuentra - 0.3, 0.35)} tam={180} giro={-10 + 8 * Math.sin(t * 3)} />
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.ruta11, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="gato-gafas" x={790} y={1535} alto={380} t={t} cara="feliz" semilla={7} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "modelo") return <Modelo t={t} />;
  if (p.tipo === "caminos") return <Caminos t={t} />;
  if (p.tipo === "gantt") return <Gantt t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.listo - 0.3, "pop", 0.35); fx(M.atrasarse - 0.6, "toc-grave", 0.35);
fx(S(2) - 0.3, "whoosh", 0.4); [M.secuencia, M.duraciones, M.recursos, M.restricciones].forEach((w) => fx(w - 0.35, "pop-suave", 0.22)); fx(M.desarrollar - 0.4, "pop", 0.3); fx(M.modelo - 0.4, "papel", 0.3);
fx(S(4) - 0.3, "whoosh", 0.4); fx(M.siete - 0.3, "pop", 0.25); fx(M.cuatro - 0.5, "pop", 0.25); fx(M.ruta - 0.4, "campana", 0.35); fx(M.cero - 0.4, "toc-grave", 0.3); fx(M.tres - 0.4, "ding", 0.3);
fx(S(8) - 0.3, "whoosh", 0.4); fx(M.cronograma8 - 0.4, "papel", 0.3); fx(M.hitos - 0.3, "pop", 0.25); fx(M.linea9 - 0.4, "sello", 0.35); fx(M.reales - 0.3, "desliza", 0.3);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/calle.jpg", "art/oficina.jpg"];
const CLAVE = /^(cronograma|ruta|crítica|holgura|modelo|barras|Gantt|línea|base|desviaciones)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP31 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp31-ruta-critica.mp3" sinSonido={sinSonido} />
);
