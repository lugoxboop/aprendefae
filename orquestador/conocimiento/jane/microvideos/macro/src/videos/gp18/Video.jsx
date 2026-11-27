/*
 * Gestión de Proyectos · GP-18 «Cronograma perfecto, proyecto hundido» (gp18-triangulo).
 * Una idea: el Triángulo de Talentos tiene tres conjuntos de habilidades: dirección técnica
 * de proyectos, gestión estratégica y de negocios, y liderazgo (3.4.1, p. 56–57). Lo técnico
 * es esencial pero no suficiente; el director necesita un equilibrio de los tres (p. 57).
 * Técnica: cronograma, costo, recursos, riesgos (3.4.2, p. 58). Estratégica: estrategia,
 * mercado, competencia; explicar el negocio (3.4.3, p. 58–59). Liderazgo: guiar, motivar y
 * dirigir un equipo (3.4.4, p. 60).
 */
import { Mascota, Sombra, Placa, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, Destello, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, Ficha, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.4, 0.3, 0.3, 0.35, 0.3, 0.3, 0.3, 0.3, 0.35, 0.3, 0.4] });
const { S, E, W } = T;

const M = {
  cronograma1: W(1, "cronograma", 0.25), perfecto: W(1, "perfecto.", 0.4), hundiendo: W(1, "hundiendo.", 0.95),
  tortas2: W(2, "tortas", 0.25), cronograma2: W(2, "cronograma,", 0.55), costos: W(2, "costos", 0.75), incidentes: W(2, "incidentes.", 0.95),
  mercado3: W(3, "mercado", 0.25), achicando: W(3, "achicando,", 0.55), equipo3: W(3, "equipo", 0.7), ganas: W(3, "ganas.", 0.95),
  solo: W(4, "solo", 0.2), tres4: W(4, "tres", 0.45), triangulo: W(4, "Triángulo", 0.75), talentos: W(4, "Talentos.", 0.95),
  primera: W(5, "primera", 0.08), tecnica: W(5, "técnica", 0.25), manejar: W(5, "manejar", 0.6), crono5: W(5, "cronograma,", 0.7), costo5: W(5, "costo,", 0.75), recursos5: W(5, "recursos", 0.85), riesgos: W(5, "riesgos.", 0.95),
  segunda: W(6, "segunda", 0.08), estrategica: W(6, "estratégica", 0.25), panorama: W(6, "panorama", 0.5), estrategia: W(6, "estrategia,", 0.7), mercado6: W(6, "mercado", 0.82), competencia: W(6, "competencia.", 0.95),
  explicar: W(7, "explicar", 0.2), negocio7: W(7, "negocio.", 0.95),
  tercera: W(8, "tercera", 0.1), liderazgo: W(8, "liderazgo:", 0.35), guiar: W(8, "guiar,", 0.5), motivar: W(8, "motivar", 0.65), dirigir: W(8, "dirigir", 0.8),
  esencial: W(9, "esencial,", 0.6), basta: W(9, "basta.", 0.95),
  eficaz: W(10, "eficaz,", 0.25), equilibrio: W(10, "equilibrio", 0.75), tres10: W(10, "tres.", 0.95),
  toca: W(11, "toca:", 0.15), habilidad: W(11, "habilidad", 0.4), director11: W(11, "director?", 0.95),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "tortas", desde: S(2) - 0.3, entra: "barrido" },
  { tipo: "triangulo", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* Vértices del triángulo y sus habilidades (3.4.1 a 3.4.4) */
const V = [
  { x: 540, y: 500, nom: "dirección técnica", ic: "🛠️", col: AZUL, tw: () => M.tecnica, cosas: [[() => M.crono5, "📅"], [() => M.costo5, "💰"], [() => M.recursos5, "👥"], [() => M.riesgos, "⚠️"]] },
  { x: 270, y: 1050, nom: "estratégica y de negocios", ic: "📊", col: COLOR.VERDE, tw: () => M.estrategica, cosas: [[() => M.estrategia, "🧭"], [() => M.mercado6, "📈"], [() => M.competencia, "🏁"]] },
  { x: 810, y: 1050, nom: "liderazgo", ic: "🗣️", col: COLOR.CORAL, tw: () => M.liderazgo, cosas: [[() => M.guiar, "👉"], [() => M.motivar, "🔥"], [() => M.dirigir, "🎯"]] },
];

/* ═════ 1 · Cronograma perfecto… y se hunde ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(1) + 0.3, s: 1.0, x: 540, y: 968 }]);
  const agua = sale(rampa(t, M.hundiendo - 1.2, 1.6));
  const hunde = 160 * agua;
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(5px)" velo={0.15}>
      <Documento x={540} y={620 + hunde * 0.6} w={330} p={rampa(t, M.cronograma1 - 0.3, 0.4)} titulo="cronograma" letra={44} sello={rampa(t, M.perfecto - 0.2, 0.35)} giro={8 * agua} />
      <Cartel x={540} y={300} txt="✨ perfecto" p={rampa(t, M.perfecto - 0.3, 0.35) * (1 - agua)} tam={62} fondo={COLOR.VERDE} color="#fff" />
      <Cartel x={540} y={300} txt="y el proyecto se hunde" p={agua} tam={62} fondo={ROJO} color="#fff" giro={-3} />
      <Sombra x={540} y={1510} w={260} op={0.22 * (1 - agua)} />
      <Mascota esp="perro-corbatin" x={540} y={1515 + hunde} alto={440} t={t} cara={agua > 0.2 ? "triste" : "feliz"} orejas={agua > 0.2 ? -6 : 0} semilla={9} />
      <div style={{ position: "absolute", left: -40, right: -40, bottom: -40, height: lerp(0, 700, agua), background: "linear-gradient(180deg, rgba(90,160,220,.75), rgba(39,71,150,.9))", borderTop: `8px solid rgba(255,255,255,.7)`, transform: `translateY(${8 * Math.sin(t * 4)}px)` }} />
    </Escena>
  );
}

/* ═════ 2–3 · Todo al día… pero el mercado se achica y el equipo, sin ganas ═════ */
function Tortas({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3) - 0.2, b: E(3), s: 1.03, x: 540, y: 960 }]);
  const chk = [[M.cronograma2, "📅", "cronograma"], [M.costos, "💰", "costos"], [M.incidentes, "📋", "incidentes"]];
  const pM = rampa(t, M.mercado3 - 0.4, 0.4);
  const baja = sale(rampa(t, M.achicando - 0.6, 1.0));
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(5px)" velo={0.18}>
      <Cartel x={540} y={260} txt="🎂 línea de tortas" p={rampa(t, M.tortas2 - 0.3, 0.35)} tam={58} fondo={MANGO} />
      {chk.map(([tw, ic, txt], k) => (
        <div key={k} style={{ opacity: 1 - 0.6 * pM }}>
          <Ficha x={220 + k * 320} y={500} w={250} icono={ic} txt={txt} p={rampa(t, tw - 0.35, 0.35)} letra={36} />
          <Gigante x={300 + k * 320} y={590} txt="✅" p={rampa(t, tw - 0.1, 0.3)} tam={70} />
        </div>
      ))}
      {pM > 0 && (
        <div style={{ position: "absolute", left: 90, top: 700, width: 520, height: 330, background: "#FFFDF7", border: `7px solid ${TINTA}`, borderRadius: 24, opacity: pM, transform: `scale(${rebote(pM)})`, boxShadow: "0 10px 0 rgba(42,30,23,.25)" }}>
          <div style={{ position: "absolute", left: 24, top: 14, fontFamily: "Sora", fontWeight: 800, fontSize: 36, color: TINTA }}>mercado de tortas</div>
          <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width="1" height="1">
            <polyline points={`40,110 ${40 + 140 * baja},${110 + 60 * baja} ${40 + 280 * baja},${110 + 100 * baja} ${40 + 430 * baja},${110 + 180 * baja}`} fill="none" stroke={ROJO} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ position: "absolute", right: 24, top: 70, fontSize: 70, opacity: baja }}>📉</div>
        </div>
      )}
      <Gigante x={860} y={1030} txt="💤" p={rampa(t, M.ganas - 0.6, 0.35)} tam={90} giro={8 * Math.sin(t * 3)} />
      <Sombra x={830} y={1510} w={200} />
      <Mascota esp="conejo" x={830} y={1515} alto={380} t={t} cara={t > M.equipo3 - 0.3 ? "triste" : "tranquila"} cab={t > M.equipo3 ? 6 : 0} semilla={12} espejo />
      <Sombra x={300} y={1510} w={240} />
      <Mascota esp="perro-corbatin" x={300} y={1515} alto={430} t={t} cara={pM > 0.5 ? "triste" : "feliz"} semilla={9} />
      <Placa x={300} y={1050} nombre="Ramón" rol="director" p={rampa(t, S(2) - 0.2, 0.35) * (1 - pM)} />
    </Escena>
  );
}

/* ═════ 4–10 · El Triángulo de Talentos ═════ */
function Triangulo({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(9) - 0.2, b: E(10), s: 1.03, x: 540, y: 950 }]);
  const pT = sale(rampa(t, M.triangulo - 0.5, 0.6));
  const eq = rampa(t, M.equilibrio - 0.4, 0.5);
  /* en la frase 4 solo brilla la técnica (lo único que tiene Ramón) */
  const luz = (k) => {
    if (eq > 0) return 1;
    if (t < M.primera - 0.3) return k === 0 && t > M.solo - 0.2 ? 1 : 0;
    return rampa(t, V[k].tw() - 0.4, 0.35);
  };
  const solo = rampa(t, M.solo - 0.3, 0.35) * (1 - rampa(t, M.primera - 0.5, 0.3));
  const pts = V.map((v) => `${v.x},${v.y}`).join(" ");
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={250} txt="Triángulo de Talentos" p={pT} tam={62} fondo={MANGO} />
      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width="1" height="1">
        {pT > 0 && <polygon points={pts} fill={eq > 0 ? `rgba(245,184,46,${0.25 * eq})` : "rgba(255,253,247,.55)"} stroke={TINTA} strokeWidth={10} strokeLinejoin="round" strokeDasharray={`${3000 * pT} 4000`} />}
      </svg>
      {V.map((v, k) => {
        const q = luz(k);
        const pv = rampa(t, M.tres4 - 0.4 + k * 0.15, 0.35);
        return (
          <div key={k}>
            <div style={{ position: "absolute", left: v.x - 85, top: v.y - 85, width: 170, height: 170, borderRadius: "50%", background: q > 0 ? v.col : "#C9C2B4", border: `8px solid ${TINTA}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 84, transform: `scale(${pv > 0 ? rebote(pv) * (1 + 0.08 * pulso(t, (eq > 0 ? M.equilibrio : V[k].tw()) - 0.4, 0.6)) : 0})`, filter: q > 0 ? "none" : "grayscale(1)", boxShadow: q > 0 ? `0 0 ${40 * q}px ${v.col}` : "none" }}>{v.ic}</div>
            <Cartel x={k === 1 ? 330 : k === 2 ? 760 : v.x} y={v.y + (k ? 140 : -130)} txt={v.nom} p={rampa(t, v.tw() - 0.3, 0.35)} tam={k === 1 ? 38 : 44} fondo={v.col} color="#fff" borde={5} />
            {v.cosas.map(([fw, ic], j) => {
              const qc = rampa(t, fw() - 0.35, 0.3) * (1 - rampa(t, M.esencial - 0.5, 0.3));
              const n = v.cosas.length;
              const ang = k === 0 ? Math.PI / 2 + (j - (n - 1) / 2) * 0.55 : k === 1 ? -0.55 + j * 0.55 : Math.PI + 0.55 - j * 0.55;
              return <Gigante key={j} x={v.x + 165 * Math.cos(ang)} y={v.y + 165 * Math.sin(ang) - (k ? 60 : 0)} txt={ic} p={qc} tam={66} />;
            })}
          </div>
        );
      })}
      <Cartel x={540} y={800} txt="solo 1 de 3" p={solo} tam={60} fondo={ROJO} color="#fff" giro={-3} />
      <Cartel x={540} y={800} txt="💬 por qué importa al negocio" p={rampa(t, M.explicar - 0.3, 0.35) * (1 - rampa(t, M.tercera - 0.5, 0.3))} tam={44} fondo={CREMA} />
      <Cartel x={540} y={820} txt="lo técnico: esencial, no basta" p={rampa(t, M.esencial - 0.4, 0.35) * (1 - eq)} tam={46} fondo={CREMA} />
      <Cartel x={540} y={820} txt="⚖️ equilibrio de las tres" p={eq} tam={56} fondo={COLOR.VERDE} color="#fff" giro={2} />
      <Sombra x={540} y={1510} w={180} />
      <Mascota esp="perro-corbatin" x={540} y={1515} alto={290} t={t} cara={eq > 0 ? "estrellas" : t > M.solo - 0.2 && t < M.primera ? "triste" : "tranquila"} bi={-50 * pulso(t, M.explicar - 0.3, 1.2)} semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 11 · ¿Qué habilidad le falta a cada director? ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={400} txt="⚡ ¿qué le falta?" p={rampa(t, M.toca - 0.2, 0.35)} tam={70} fondo={MANGO} />
      {V.map((v, k) => (
        <div key={k} style={{ position: "absolute", left: 200 + k * 340 - 80, top: 640, width: 160, height: 160, borderRadius: "50%", background: v.col, border: `8px solid ${TINTA}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 78, transform: `scale(${rebote(rampa(t, M.habilidad - 0.4 + k * 0.15, 0.35)) * (1 + 0.1 * Math.sin(t * 5 + k * 2))})` }}>{v.ic}</div>
      ))}
      <Gigante x={540} y={950} txt="?" p={rampa(t, M.habilidad - 0.1, 0.35)} tam={150} color={MANGO} giro={-6 + 6 * Math.sin(t * 4)} />
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="perro-corbatin" x={330} y={1535} alto={440} t={t} cara="feliz" semilla={9} />
      <Sombra x={780} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={780} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.director11 - 0.2, 0.5)} semilla={3} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "tortas") return <Tortas t={t} />;
  if (p.tipo === "triangulo") return <Triangulo t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.cronograma1 - 0.3, "papel", 0.35); fx(M.perfecto - 0.2, "sello", 0.4); fx(M.hundiendo - 1.2, "agua", 0.35); fx(M.hundiendo - 0.3, "burbuja", 0.3);
fx(S(2) - 0.3, "whoosh", 0.4); [M.cronograma2, M.costos, M.incidentes].forEach((w) => fx(w - 0.1, "ding", 0.25));
fx(M.mercado3 - 0.4, "pop", 0.3); fx(M.achicando - 0.6, "baja", 0.35); fx(M.ganas - 0.6, "suspiro", 0.3);
fx(S(4) - 0.3, "whoosh", 0.4); fx(M.solo - 0.3, "toc-grave", 0.35); fx(M.triangulo - 0.5, "tiza-larga", 0.3);
V.forEach((v) => { fx(v.tw() - 0.4, "sube", 0.35); v.cosas.forEach(([fw]) => fx(fw() - 0.35, "pop-suave", 0.22)); });
fx(M.explicar - 0.3, "pop", 0.3); fx(M.esencial - 0.4, "toc", 0.3); fx(M.equilibrio - 0.4, "campana", 0.35);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/oficina.jpg", "art/panaderia.jpg"];
const CLAVE = /^(Triángulo|Talentos|técnica|estratégica|negocios|liderazgo|equilibrio|tres|basta)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP18 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp18-triangulo.mp3" sinSonido={sinSonido} />
);
