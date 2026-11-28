/*
 * Gestión de Proyectos · GP-49 «¿Quién entra al equipo?» (gp49-adquirir-recursos).
 * Una idea: Adquirir Recursos es obtener miembros del equipo, instalaciones, equipamiento, materiales,
 * suministros y otros recursos necesarios para completar el trabajo del proyecto (9.3, p. 328).
 * Criterios de selección ponderados (análisis de decisiones con múltiples criterios): disponibilidad, costo,
 * capacidad; para el equipo: experiencia, conocimiento, habilidades, actitud… (9.3.2.1, p. 332);
 * preasignación (9.3.2.3); asignaciones de recursos físicos y del equipo (9.3.3.1–9.3.3.2); calendarios de
 * recursos: cuándo y por cuánto tiempo (9.3.3.3, p. 334); solicitudes de cambio (9.3.3.4).
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, {
  extra: [0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3],
  manual: { 3: ["Adquirir recursos es obtener miembros del equipo,", "instalaciones, equipamiento, materiales, suministros", "y otros recursos necesarios", "para completar el trabajo del proyecto."] },
});
const { S, E, W } = T;

const M = {
  crece: W(1, "crece.", 0.2), ayudantes: W(1, "ayudantes", 0.55), horno1: W(1, "horno", 0.8), mesas: W(1, "mesas.", 0.97),
  quien2: W(2, "quién", 0.15), cuando2: W(2, "cuándo", 0.65),
  adquirir: W(3, "Adquirir", 0.03), miembros: W(3, "miembros", 0.25), instalaciones: W(3, "instalaciones,", 0.35), equipamiento: W(3, "equipamiento,", 0.42), materiales: W(3, "materiales,", 0.5), suministros: W(3, "suministros", 0.58),
  criterios: W(4, "criterios", 0.4), ponderados: W(4, "ponderados", 0.7),
  disponibilidad: W(5, "disponibilidad,", 0.2), costo5: W(5, "costo", 0.3), capacidad: W(5, "capacidad.", 0.42), personas: W(5, "personas,", 0.6), experiencia: W(5, "experiencia,", 0.75), habilidades: W(5, "habilidades", 0.85), actitud: W(5, "actitud.", 0.97),
  preasignado: W(6, "preasignado:", 0.4), carmen6: W(6, "Carmen", 0.5), acta: W(6, "acta", 0.9),
  asignaciones: W(7, "asignaciones:", 0.2), fisicos: W(7, "físicos,", 0.4), horno7: W(7, "horno", 0.55), equipo7: W(7, "equipo,", 0.75), roles: W(7, "roles", 0.88),
  calendarios: W(8, "calendarios", 0.2), cuando8: W(8, "cuándo", 0.45), tiempo8: W(8, "tiempo", 0.65),
  ramon9: W(9, "Ramón", 0.05), sabados: W(9, "sábados.", 0.45), horno9: W(9, "horno", 0.6), viernes: W(9, "viernes.", 0.97),
  consigue: W(10, "consigue,", 0.4), solicitud: W(10, "solicitud", 0.85),
  toca: W(11, "toca:", 0.15), tres: W(11, "tres", 0.3), persona: W(11, "persona", 0.75),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "definicion", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "criterios", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "asignaciones", desde: S(7) - 0.3, entra: "barrido-izq" },
  { tipo: "calendario", desde: S(8) - 0.3, entra: "barrido" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* ═════ 1–2 · La feria crece ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  const N = [[M.ayudantes, "🧑‍🍳🧑‍🍳", "2 ayudantes"], [M.horno1, "🔥", "horno extra"], [M.mesas, "🪑", "mesas"]];
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(5px)" velo={0.15}>
      <Cartel x={540} y={200} txt="📈 ¡la feria crece!" p={rampa(t, M.crece - 0.3, 0.35)} tam={50} fondo={MANGO} giro={-2} />
      {N.map(([tw, ic, txt], k) => (
        <div key={k}>
          <Gigante x={200 + k * 340} y={400} txt={ic} p={rampa(t, tw - 0.3, 0.35)} tam={110} />
          <Cartel x={200 + k * 340} y={530} txt={txt} p={rampa(t, tw - 0.2, 0.3)} tam={36} fondo={CREMA} giro={[-2, 2, -1][k]} />
        </div>
      ))}
      <Cartel x={300} y={760} txt="¿a quién elige?" p={rampa(t, M.quien2 - 0.3, 0.3)} tam={42} fondo="#DDE3FF" giro={-2} />
      <Cartel x={780} y={860} txt="📅 ¿cuándo estará?" p={rampa(t, M.cuando2 - 0.3, 0.3)} tam={42} fondo="#DDE3FF" giro={2} />
      <Sombra x={540} y={1510} w={210} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={380} t={t} cara={t > M.quien2 ? "tranquila" : "feliz"} cab={8 * Math.sin(t * 2.5)} salto={30 * pulso(t, M.crece, 0.5)} semilla={3} />
    </Escena>
  );
}

/* ═════ 3 · Qué es ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3), b: E(3) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const R = [[M.miembros, "👥 miembros del equipo"], [M.instalaciones, "🏠 instalaciones"], [M.equipamiento, "🔥 equipamiento"], [M.materiales, "🌾 materiales"], [M.suministros, "📦 suministros"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={220} txt="adquirir recursos" p={rampa(t, M.adquirir - 0.3, 0.35)} tam={52} fondo={MANGO} />
      <Cartel x={540} y={350} txt="✋ obtener…" p={rampa(t, M.miembros - 0.6, 0.3)} tam={40} fondo="#FFFDF7" />
      {R.map(([tw, txt], k) => <Cartel key={k} x={k === 0 ? 540 : k % 2 ? 310 : 770} y={k === 0 ? 480 : 600 + Math.floor((k - 1) / 2) * 120} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={40} fondo={CREMA} giro={[-1, -2, 2, 1, -1][k]} />)}
      <Cartel x={540} y={880} txt="✅ para completar el trabajo" p={rampa(t, E(3) - 1.5, 0.3)} tam={38} fondo="#E3F6EC" giro={1} />
      <Sombra x={540} y={1510} w={190} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 4–6 · Criterios de selección ═════ */
function Criterios({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(6), b: E(6) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const G = [[M.disponibilidad, "📅 disponibilidad", 3], [M.costo5, "💲 costo", 2], [M.capacidad, "💪 capacidad", 3]];
  const P = [[M.experiencia, "🏅 experiencia", 2], [M.habilidades, "🛠️ habilidades", 3], [M.actitud, "🤝 actitud", 3]];
  const fila = (lista, y0, fondo) => lista.map(([tw, txt, peso], k) => {
    const q = rampa(t, tw - 0.3, 0.3);
    if (q <= 0) return null;
    return (
      <div key={txt} style={{ position: "absolute", left: 90, top: y0 + k * 105, width: 900, height: 90, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 26px", boxSizing: "border-box", background: fondo, border: `5px solid ${TINTA}`, borderRadius: 18, fontFamily: "Sora", fontWeight: 800, fontSize: 38, color: TINTA, transform: `scale(${rebote(q)})` }}>
        <span>{txt}</span>
        <span style={{ fontSize: 34, letterSpacing: 4, opacity: rampa(t, M.ponderados, 0.3) || rampa(t, tw, 0.3) }}>{"⭐".repeat(peso)}</span>
      </div>
    );
  });
  const pPre = rampa(t, M.preasignado - 0.4, 0.35);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={170} txt="criterios de selección" p={rampa(t, M.criterios - 0.4, 0.35)} tam={46} fondo={MANGO} />
      <Cartel x={540} y={270} txt="⚖️ ponderados según su importancia" p={rampa(t, M.ponderados - 0.3, 0.3)} tam={34} fondo="#FFFDF7" />
      {fila(G, 340, CREMA)}
      <Cartel x={540} y={700} txt="👤 para las personas, también:" p={rampa(t, M.personas - 0.4, 0.3)} tam={34} fondo="#FFFDF7" />
      {fila(P, 760, "#DDE3FF")}
      {pPre > 0 && (
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, background: `rgba(250,244,232,${0.93 * Math.min(1, pPre)})` }} />
      )}
      <Documento x={340} y={560} w={300} p={rampa(t, M.acta - 0.5, 0.4)} titulo="acta de constitución" letra={34} giro={-4} />
      <Cartel x={770} y={430} txt="📌 preasignada" p={pPre} tam={48} fondo={MANGO} giro={3} />
      <Sombra x={180} y={1530} w={150} />
      <Mascota esp="hamster-gorra" x={180} y={1535} alto={240} t={t} cara="tranquila" semilla={3} />
      <Sombra x={760} y={1520} w={190} />
      <Mascota esp="gato-gafas" x={760} y={1525} alto={lerp(240, 360, sale(pPre))} t={t} cara={pPre > 0 ? "estrellas" : "feliz"} semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 7 · Asignaciones ═════ */
function Asignaciones({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(7), b: E(7) + 0.3, s: 1.03, x: 540, y: 955 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={190} txt="📋 asignaciones" p={rampa(t, M.asignaciones - 0.3, 0.35)} tam={52} fondo={MANGO} />
      <Documento x={290} y={520} w={340} p={rampa(t, M.fisicos - 0.4, 0.4)} titulo="recursos físicos" letra={40} giro={-3} />
      <Cartel x={290} y={830} txt="🔥 horno · 🪑 mesas" p={rampa(t, M.horno7 - 0.3, 0.3)} tam={36} fondo={CREMA} giro={-1} />
      <Documento x={790} y={520} w={340} p={rampa(t, M.equipo7 - 0.4, 0.4)} titulo="equipo" letra={46} giro={3} />
      <Cartel x={790} y={830} txt="🎭 roles" p={rampa(t, M.roles - 0.3, 0.3)} tam={36} fondo="#DDE3FF" giro={1} />
      <Cartel x={790} y={930} txt="✅ responsabilidades" p={rampa(t, M.roles, 0.3)} tam={36} fondo="#DDE3FF" giro={-1} />
      <Sombra x={540} y={1530} w={180} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={260} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 8–10 · Calendario de recursos ═════ */
const DIAS = ["L", "M", "M", "J", "V", "S", "D"];
function Calendario({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(9), b: E(10), s: 1.03, x: 540, y: 960 }]);
  const pC = rampa(t, M.calendarios - 0.4, 0.4);
  const filas = [["🐶 Ramón", M.sabados, [5]], ["🔥 horno extra", M.viernes, [4, 5, 6]]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={170} txt="calendarios de recursos" p={pC} tam={46} fondo={MANGO} />
      <Cartel x={300} y={290} txt="📅 cuándo" p={rampa(t, M.cuando8 - 0.3, 0.3)} tam={38} fondo={CREMA} giro={-2} />
      <Cartel x={780} y={290} txt="⏳ por cuánto tiempo" p={rampa(t, M.tiempo8 - 0.3, 0.3)} tam={38} fondo={CREMA} giro={2} />
      {pC > 0 && (
        <div style={{ position: "absolute", left: 60, top: 390, width: 960, height: 420, background: "#FFFDF7", border: `8px solid ${TINTA}`, borderRadius: 26, boxShadow: "0 14px 0 rgba(42,30,23,.28)", transform: `scale(${rebote(pC)})`, fontFamily: "Sora", fontWeight: 800, color: TINTA }}>
          {DIAS.map((d, k) => <div key={k} style={{ position: "absolute", left: 300 + k * 90, top: 24, width: 80, textAlign: "center", fontSize: 38 }}>{d}</div>)}
          {filas.map(([nom, tw, dias], f) => {
            const q = rampa(t, tw - 0.6, 0.4);
            return (
              <div key={f}>
                <div style={{ position: "absolute", left: 20, top: 110 + f * 140, width: 270, height: 110, display: "flex", alignItems: "center", fontSize: 34, opacity: Math.min(1, q * 3) }}>{nom}</div>
                {DIAS.map((_, k) => {
                  const on = dias.includes(k);
                  return <div key={k} style={{ position: "absolute", left: 300 + k * 90, top: 110 + f * 140, width: 80, height: 110, borderRadius: 14, border: `4px solid ${TINTA}`, background: on && q > 0 ? (f ? MANGO : "#7FD3A5") : "#EFE8DA", transform: on ? `scale(${q > 0 ? rebote(q) : 1})` : undefined }} />;
                })}
              </div>
            );
          })}
        </div>
      )}
      <Documento x={300} y={1060} w={220} p={rampa(t, M.solicitud - 0.4, 0.4)} titulo="solicitud de cambio" letra={30} giro={-4} />
      <Cartel x={720} y={980} txt="❌ ¿no se consigue?" p={rampa(t, M.consigue - 0.4, 0.3)} tam={38} fondo="#FFE1D8" giro={2} />
      <Sombra x={170} y={1530} w={150} />
      <Mascota esp="perro-corbatin" x={170} y={1535} alto={240} t={t} cara="feliz" salto={30 * pulso(t, M.sabados, 0.5)} semilla={9} />
      <Sombra x={880} y={1530} w={150} />
      <Mascota esp="hamster-gorra" x={880} y={1535} alto={240} t={t} cara="tranquila" semilla={3} espejo />
    </Escena>
  );
}

/* ═════ 11 · Tus criterios ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={280} txt="⚡ tus 3 criterios" p={rampa(t, M.toca - 0.2, 0.35)} tam={58} fondo={MANGO} />
      {[0, 1, 2].map((k) => <Cartel key={k} x={540} y={450 + k * 130} txt={`${k + 1}. ________  ⭐⭐⭐`} p={rampa(t, M.tres + k * 0.3, 0.3)} tam={44} fondo={CREMA} giro={[-2, 1, -1][k]} />)}
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.persona, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="gato-gafas" x={790} y={1535} alto={370} t={t} cara="feliz" semilla={7} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "definicion") return <Definicion t={t} />;
  if (p.tipo === "criterios") return <Criterios t={t} />;
  if (p.tipo === "asignaciones") return <Asignaciones t={t} />;
  if (p.tipo === "calendario") return <Calendario t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.crece - 0.3, "pop", 0.3); [M.ayudantes, M.horno1, M.mesas].forEach((w) => fx(w - 0.3, "pop-suave", 0.22)); fx(M.quien2 - 0.3, "pop", 0.22); fx(M.cuando2 - 0.3, "pop", 0.22);
fx(S(3) - 0.3, "whoosh", 0.4); [M.miembros, M.instalaciones, M.equipamiento, M.materiales, M.suministros].forEach((w) => fx(w - 0.3, "pop-suave", 0.2));
fx(S(4) - 0.3, "whoosh", 0.4); [M.disponibilidad, M.costo5, M.capacidad, M.experiencia, M.habilidades, M.actitud].forEach((w) => fx(w - 0.3, "pop", 0.2)); fx(M.preasignado - 0.4, "sello", 0.3); fx(M.acta - 0.5, "papel", 0.3);
fx(S(7) - 0.3, "whoosh", 0.4); fx(M.fisicos - 0.4, "papel", 0.3); fx(M.equipo7 - 0.4, "papel", 0.3);
fx(S(8) - 0.3, "whoosh", 0.4); fx(M.sabados - 0.6, "pop", 0.25); fx(M.viernes - 0.6, "pop", 0.25); fx(M.solicitud - 0.4, "papel", 0.3);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/calle.jpg", "art/oficina.jpg", "art/panaderia.jpg"];
const CLAVE = /^(recursos|criterios|preasignado|asignaciones|calendarios|disponibilidad|capacidad|actitud)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP49 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp49-adquirir-recursos.mp3" sinSonido={sinSonido} />
);
