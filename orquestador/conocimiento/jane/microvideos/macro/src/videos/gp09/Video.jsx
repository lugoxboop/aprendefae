/*
 * Gestión de Proyectos · GP-09 «La boda de Carmen» (gp09-diez-areas).
 * Una idea: las diez áreas de conocimiento (integración, alcance, cronograma, costos,
 * calidad, recursos, comunicaciones, riesgos, adquisiciones, interesados) categorizan
 * los procesos; cruzadas con los cinco grupos dan los 49 procesos (G 1.2.4.6, p. 23–25;
 * Tabla 1-4; Tabla 1-1). La tabla se muestra como cuadrícula, sin flechas entre grupos.
 */
import { Mascota, Sombra, Placa, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, Destello, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Ficha, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.35, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.35, 0.35, 0.35, 0.4] });
const { S, E, W } = T;

const M = {
  boda: W(1, "boda", 0.1), diez: W(1, "diez", 0.4), mira: W(1, "Mira.", 0.95),
  casa: W(2, "casa,", 0.3), organiza: W(2, "organiza", 0.7),
  encaje: W(3, "encaje", 0.35), integracion: W(3, "integración.", 0.95),
  baile: W(4, "baile?,", 0.45), mariachi: W(4, "mariachi?", 0.65), alcance: W(4, "alcance.", 0.95),
  fecha: W(5, "fecha", 0.15), cronograma: W(5, "cronograma.", 0.45), presupuesto: W(5, "presupuesto:", 0.75), costos: W(5, "costos.", 0.95),
  pastel: W(6, "pastel", 0.15), calidad: W(6, "calidad.", 0.45), meseros: W(6, "Meseros", 0.6), recursos: W(6, "recursos.", 0.95),
  avisar: W(7, "Avisar", 0.1), comunicaciones: W(7, "comunicaciones.", 0.45), llueve: W(7, "llueve?", 0.7), riesgos: W(7, "Riesgos.", 0.95),
  salon: W(8, "salón", 0.3), musica: W(8, "música", 0.45), fuera: W(8, "fuera", 0.65), adquisiciones: W(8, "adquisiciones.", 0.95),
  familias: W(9, "familias,", 0.15), afectar: W(9, "afectar", 0.35), interesados: W(9, "interesados.", 0.95),
  areas: W(10, "áreas", 0.25), conocimiento: W(10, "conocimiento,", 0.4), procesos10: W(10, "procesos.", 0.95),
  cruzadas: W(11, "Cruzadas", 0.1), cinco: W(11, "cinco", 0.3), describe: W(11, "describe", 0.6), cuarenta: W(11, "cuarenta", 0.8), nueve: W(11, "nueve", 0.95),
  toca: W(12, "toca:", 0.15), area12: W(12, "área", 0.4), problema: W(12, "problema", 0.65), boda12: W(12, "boda?", 0.95),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "boda", desde: S(2) - 0.3, entra: "barrido" },
  { tipo: "areas", desde: S(3) - 0.3, entra: "zoom" },
  { tipo: "tabla", desde: S(11) - 0.3, entra: "zoom" },
  { tipo: "cierre", desde: S(12) - 0.25, entra: "zoom" },
];

/* Las diez áreas en el orden de la guía: icono, nombre, color, momento en que se nombra */
const AREAS = [
  ["🧩", "integración", AZUL, M.integracion],
  ["📦", "alcance", MANGO, M.alcance],
  ["🗓️", "cronograma", COLOR.CORAL, M.cronograma],
  ["💰", "costos", COLOR.VERDE, M.costos],
  ["🎂", "calidad", "#B57BE0", M.calidad],
  ["🪑", "recursos", "#8A5A35", M.recursos],
  ["📣", "comunicaciones", "#2BA3C4", M.comunicaciones],
  ["☔", "riesgos", ROJO, M.riesgos],
  ["🤝", "adquisiciones", "#596579", M.adquisiciones],
  ["👨‍👩‍👧", "interesados", "#E08A2B", M.interesados],
];

/* Lo que pasa en la boda, línea por línea (escena: [momento, icono, rótulo]) */
const ESCENAS = {
  3: [[M.encaje - 0.3, "🧩", "que todo encaje"]],
  4: [[M.baile - 0.3, "💃", "¿baile?"], [M.mariachi - 0.3, "🎺", "¿mariachi?"]],
  5: [[M.fecha - 0.3, "🗓️", "la fecha"], [M.presupuesto - 0.3, "💰", "el presupuesto"]],
  6: [[M.pastel - 0.3, "🎂", "el pastel pedido"], [M.meseros - 0.3, "🤵", "meseros y sillas"]],
  7: [[M.avisar - 0.3, "📣", "avisar a todos"], [M.llueve - 0.3, "🌧️", "¿y si llueve?"]],
  8: [[M.salon - 0.3, "🏛️", "el salón"], [M.musica - 0.3, "🎵", "la música"]],
  9: [[M.familias - 0.3, "👨‍👩‍👧‍👦", "las familias"]],
};

/* Tarjeta de un área (encendida o apagada) */
function Area({ x, y, w, k, p, brillo = 0 }) {
  const [ic, txt, col] = AREAS[k];
  const on = clamp01(p);
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - 50, width: w, transform: `scale(${on > 0 ? lerp(0.92, 1, rebote(on)) + 0.06 * brillo : 0.92})` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, height: 100, boxSizing: "border-box", background: on > 0 ? CREMA : "rgba(255,253,247,.45)", border: `7px solid ${on > 0 ? TINTA : "rgba(42,30,23,.35)"}`, borderLeft: `26px solid ${on > 0 ? col : "rgba(42,30,23,.2)"}`, borderRadius: 22, padding: "0 16px", fontFamily: "Sora", fontWeight: 800, fontSize: 40, whiteSpace: "nowrap", color: TINTA, boxShadow: on > 0 ? "0 8px 0 rgba(42,30,23,.25)" : "none" }}>
        <span style={{ fontSize: 50, opacity: on > 0 ? 1 : 0.25 }}>{on > 0 ? ic : "?"}</span>
        <span style={{ opacity: on }}>{txt}</span>
      </div>
    </div>
  );
}

const POS = AREAS.map((_, k) => [290 + (k % 2) * 500, 330 + Math.floor(k / 2) * 125]);

/* ═════ 1 · Una boda tiene las diez ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(1) + 0.3, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg" filtro="blur(5px)" velo={0.15}>
      <Gigante x={540} y={520} txt="💒" p={rampa(t, M.boda - 0.3, 0.4)} tam={240} />
      {Array.from({ length: 10 }).map((_, k) => {
        const a = (k / 10) * Math.PI * 2 - Math.PI / 2;
        return <Gigante key={k} x={540 + 330 * Math.cos(a)} y={560 + 300 * Math.sin(a)} txt="?" p={rampa(t, M.diez - 0.3 + k * 0.06, 0.3)} tam={80} color={MANGO} />;
      })}
      <Cartel x={540} y={1000} txt="10 áreas" p={rampa(t, M.diez - 0.2, 0.35)} tam={96} fondo={ROJO} color="#fff" giro={-3} />
      <Sombra x={540} y={1510} w={260} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.mira - 0.3, 1)} semilla={3} />
    </Escena>
  );
}

/* ═════ 2 · Carmen se casa; Pía organiza ═════ */
function Boda({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(2), b: E(2) + 0.3, s: 1.04, x: 540, y: 990 }]);
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg" filtro="blur(4px)" velo={0.12}>
      <Gigante x={540} y={480} txt="💍" p={rampa(t, M.casa - 0.3, 0.35)} tam={200} />
      <Destello x={540} y={480} r={260} p={rampa(t, M.casa - 0.2, 0.8)} />
      <Cartel x={540} y={760} txt="la boda de Carmen" p={rampa(t, M.casa - 0.1, 0.35)} tam={70} fondo={CREMA} giro={-2} />
      <Sombra x={330} y={1510} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1515} alto={440} t={t} cara="estrellas" bd={-70 * pulso(t, M.organiza - 0.3, 1)} semilla={3} />
      <Placa x={330} y={960} nombre="Pía" rol="la organiza" p={rampa(t, M.organiza - 0.2, 0.35)} />
      <Sombra x={760} y={1510} w={240} />
      <Mascota esp="gato-gafas" x={760} y={1515} alto={480} t={t} cara="corazones" semilla={6} espejo />
      <Placa x={760} y={920} nombre="Carmen" rol="la novia" p={rampa(t, M.casa - 0.2, 0.35)} color={COLOR.CORAL} />
    </Escena>
  );
}

/* ═════ 3–10 · Las diez áreas, una por una ═════ */
function Areas({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10) - 0.2, b: E(10), s: 1.02, x: 540, y: 950 }]);
  const linea = [3, 4, 5, 6, 7, 8, 9].filter((i) => t > S(i) - 0.35).pop() || 3;
  const enNombre = rampa(t, S(10) - 0.3, 0.4);
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg" filtro="blur(6px)" velo={0.2}>
      {AREAS.map((a, k) => <Area key={k} x={POS[k][0]} y={POS[k][1]} w={470} k={k} p={rampa(t, a[3] - 0.3, 0.35)} brillo={pulso(t, a[3] - 0.2, 0.6) + pulso(t, M.conocimiento - 0.3 + k * 0.08, 0.5)} />)}
      {/* lo que pasa en la boda ahora mismo */}
      <div style={{ opacity: 1 - enNombre }}>
        {(ESCENAS[linea] || []).map(([tw, ic, txt], j, arr) => {
          const x = arr.length === 1 ? 540 : 290 + j * 500;
          return (
            <div key={linea + "-" + j}>
              <Gigante x={x} y={1000} txt={ic} p={rampa(t, tw, 0.35)} tam={150} />
              <Cartel x={x} y={1150} txt={txt} p={rampa(t, tw + 0.1, 0.35)} tam={42} fondo={CREMA} />
            </div>
          );
        })}
      </div>
      {enNombre > 0 && (
        <div style={{ opacity: enNombre }}>
          <Cartel x={540} y={1020} txt="áreas de conocimiento" p={rampa(t, M.areas - 0.3, 0.35)} tam={70} fondo={MANGO} giro={-2} />
          <Cartel x={540} y={1170} txt="⚙️ cada una, sus procesos" p={rampa(t, M.procesos10 - 0.5, 0.35)} tam={50} fondo={CREMA} />
        </div>
      )}
      <Sombra x={120} y={1525} w={170} />
      <Mascota esp="hamster-gorra" x={120} y={1530} alto={300} t={t} cara="feliz" bd={-50 * pulso(t, S(linea), 0.8)} semilla={3} />
      <Sombra x={960} y={1525} w={170} />
      <Mascota esp="gato-gafas" x={960} y={1530} alto={320} t={t} cara={t > M.llueve - 0.3 && t < S(8) ? "triste" : "corazones"} semilla={6} espejo />
    </Escena>
  );
}

/* Tabla 1-1: procesos por área (filas) y grupo (columnas: inicio, planificación, ejecución, monitoreo y control, cierre) */
const TABLA = [[1, 1, 2, 2, 1], [0, 4, 0, 2, 0], [0, 5, 0, 1, 0], [0, 3, 0, 1, 0], [0, 1, 1, 1, 0], [0, 2, 3, 1, 0], [0, 1, 1, 1, 0], [0, 5, 1, 1, 0], [0, 1, 1, 1, 0], [1, 1, 1, 1, 0]];
const COLS = [["🚩", ROJO, "inicio"], ["📋", MANGO, "planif."], ["🔨", COLOR.VERDE, "ejec."], ["👀", AZUL, "M y C"], ["✍️", COLOR.CORAL, "cierre"]];

/* ═════ 11 · Cruzadas con los cinco grupos: 49 procesos ═════ */
function Tabla({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(11), b: E(11), s: 1.02, x: 540, y: 960 }]);
  const llena = rampa(t, M.describe - 0.6, M.nueve - M.describe + 0.4);
  const x0 = 300, y0 = 330, cw = 140, ch = 92;
  let n = 0;
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(6px)" velo={0.25}>
      <div style={{ position: "absolute", left: 30, top: y0 - 110, width: 1020, height: ch * 10 + 130, background: "rgba(255,253,247,.9)", border: `7px solid ${TINTA}`, borderRadius: 28 }} />
      {COLS.map(([ic, col, nom], c) => (
        <div key={c} style={{ position: "absolute", left: x0 + c * cw, top: y0 - 95, width: cw - 10, height: 76, borderRadius: 16, background: col, border: `5px solid ${TINTA}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: 32, lineHeight: 1, transform: `scale(${rebote(rampa(t, M.cinco - 0.4 + c * 0.08, 0.3))})` }}>{ic}<span style={{ fontFamily: "Sora", fontWeight: 800, fontSize: 22, color: "#fff", marginTop: 4, textShadow: "0 2px 0 rgba(42,30,23,.6)" }}>{nom}</span></div>
      ))}
      {AREAS.map(([ic, txt], r) => (
        <div key={r} style={{ position: "absolute", left: 50, top: y0 + r * ch, width: 240, height: ch - 8, display: "flex", alignItems: "center", gap: 8, fontFamily: "Sora", fontWeight: 800, fontSize: 23, color: TINTA, whiteSpace: "nowrap", opacity: rampa(t, M.cruzadas - 0.4 + r * 0.04, 0.3) }}>
          <span style={{ fontSize: 34 }}>{ic}</span>{txt}
        </div>
      ))}
      {TABLA.map((fila, r) => fila.map((v, c) => {
        const orden = r * 5 + c;
        const p = clamp01(llena * 50 - orden);
        if (v > 0) n += p >= 1 ? v : 0;
        return (
          <div key={r + "-" + c} style={{ position: "absolute", left: x0 + c * cw, top: y0 + r * ch, width: cw - 10, height: ch - 10, borderRadius: 14, background: v > 0 ? COLS[c][1] : "rgba(42,30,23,.06)", border: v > 0 ? `4px solid ${TINTA}` : "none", opacity: v > 0 ? p : 1, transform: `scale(${v > 0 ? rebote(p) : 1})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 44, color: "#fff", WebkitTextStroke: `3px ${TINTA}`, paintOrder: "stroke fill" }}>{v > 0 ? v : ""}</div>
        );
      }))}
      <Cartel x={540} y={1400} txt={`${Math.min(49, n)} procesos`} p={rampa(t, M.describe - 0.4, 0.35)} tam={80} fondo={n >= 49 ? MANGO : CREMA} giro={-2} />
    </Escena>
  );
}

/* ═════ 12 · ¿A qué área pertenece cada problema? ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(12), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  const probs = [["🎂", "pastel equivocado"], ["🌧️", "llovió sin carpa"], ["📣", "nadie avisó a la tía"], ["💸", "se pasó del presupuesto"]];
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg" filtro="blur(6px)" velo={0.25}>
      {probs.map(([ic, txt], k) => <Ficha key={k} x={[290, 790, 290, 790][k]} y={k < 2 ? 470 : 820} w={330} letra={36} icono={ic} txt={txt} p={rampa(t, M.toca - 0.3 + k * 0.12, 0.35)} giro={k % 2 ? 3 : -3} />)}
      <Gigante x={540} y={1080} txt="?" p={rampa(t, M.area12 - 0.3, 0.35)} tam={170} color={MANGO} giro={-6 + 6 * Math.sin(t * 4)} />
      <Sombra x={300} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={300} y={1535} alto={440} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.boda12 - 0.2, 0.5)} semilla={3} />
      <Sombra x={800} y={1530} w={240} />
      <Mascota esp="gato-gafas" x={800} y={1535} alto={460} t={t} cara="corazones" semilla={6} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "boda") return <Boda t={t} />;
  if (p.tipo === "areas") return <Areas t={t} />;
  if (p.tipo === "tabla") return <Tabla t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.boda - 0.3, "campana", 0.4); [0, 1, 2, 3, 4].forEach((k) => fx(M.diez - 0.3 + k * 0.12, "pop", 0.25)); fx(M.diez - 0.2, "toc", 0.35);
fx(S(2) - 0.3, "whoosh", 0.4); fx(M.casa - 0.3, "ding-doble", 0.35); fx(M.organiza - 0.3, "pop", 0.3);
fx(S(3) - 0.3, "barrido-lento", 0.35);
Object.values(ESCENAS).flat().forEach(([tw]) => fx(tw, "pop-suave", 0.3));
AREAS.forEach((a) => fx(a[3] - 0.3, "ding", 0.3));
fx(M.llueve - 0.3, "trueno", 0.25); fx(M.areas - 0.3, "pop", 0.35); fx(M.procesos10 - 0.5, "toc", 0.3);
fx(S(11) - 0.3, "whoosh", 0.4); fx(M.cinco - 0.4, "pop", 0.3); fx(M.describe - 0.6, "redoble", 0.3); fx(M.nueve, "campana", 0.4);
fx(M.toca - 0.3, "pop", 0.35); fx(E(12) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/ciudad.jpg", "art/oficina.jpg"];
const CLAVE = /^(integración|alcance|cronograma|presupuesto|costos|calidad|recursos|comunicaciones|riesgos|adquisiciones|interesados|áreas|conocimiento|procesos|grupos)[.,:?…!¡]*$/i;

export const DURACION = T.DURACION_S;
export const GP09 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp09-diez-areas.mp3" sinSonido={sinSonido} />
);
