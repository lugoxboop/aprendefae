/*
 * Gestión de Proyectos · GP-43 «¿Y qué hacemos con cada riesgo?» (gp43-respuestas-v2).
 * Una idea: Planificar la Respuesta a los Riesgos es desarrollar opciones, seleccionar estrategias y
 * acordar acciones para tratar los riesgos (11.5, p. 437). Amenazas: escalar, evitar, transferir,
 * mitigar, aceptar (11.5.2.4). Oportunidades: escalar, explotar, compartir, mejorar, aceptar
 * (11.5.2.5). Planes de contingencia con eventos desencadenantes (11.5.2.6). Dueño de la respuesta
 * y registro de riesgos actualizado (11.5.3.3).
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.2, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.2] });
const { S, E, W } = T;

const M = {
  rojo: W(1, "rojo.", 0.3), cambia: W(1, "cambia,", 0.55), asegura: W(1, "asegura,", 0.7), repara: W(1, "repara", 0.82), espera: W(1, "espera?", 0.95),
  respuesta2: W(2, "respuesta.", 0.8),
  planificar: W(3, "Planificar", 0.05), opciones: W(3, "opciones,", 0.45), estrategias: W(3, "estrategias", 0.6), acciones: W(3, "acciones", 0.78),
  amenazas: W(4, "amenazas", 0.4), cinco4: W(4, "cinco", 0.75),
  evitar: W(5, "Evitar:", 0.05), horno5: W(5, "horno.", 0.42), transferir: W(5, "Transferir:", 0.5), seguro: W(5, "seguro.", 0.95),
  mitigar: W(6, "Mitigar:", 0.05), mantenimiento: W(6, "mantenimiento.", 0.38), aceptar6: W(6, "Aceptar:", 0.45), escalar6: W(6, "escalar,", 0.78),
  oportunidades: W(7, "oportunidades", 0.2), explotar7: W(7, "explotar,", 0.55), compartir: W(7, "compartir,", 0.65), mejorar: W(7, "mejorar,", 0.75), aceptar7: W(7, "aceptar", 0.85), escalar7: W(7, "escalar.", 0.95),
  feria: W(8, "feria,", 0.35), explotar8: W(8, "explotar", 0.5), ir: W(8, "ir.", 0.95),
  activan: W(9, "activan", 0.25), contingencia: W(9, "contingencia,", 0.65), desencadenante: W(9, "desencadenante.", 0.95),
  dueno: W(10, "dueño", 0.4), registro: W(10, "registro", 0.8),
  toca: W(11, "toca:", 0.15), amenaza11: W(11, "amenaza", 0.6), oportunidad11: W(11, "oportunidad.", 0.95),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "definicion", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "amenazas", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "oportunidades", desde: S(7) - 0.3, entra: "barrido-izq" },
  { tipo: "contingencia", desde: S(9) - 0.3, entra: "barrido" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* Fila de estrategia: nombre + ejemplo */
function Estr({ y, p, ic, nom, ej, pe, fondo }) {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 70, top: y, width: 940, height: 130, background: fondo, border: `6px solid ${TINTA}`, borderRadius: 20, boxSizing: "border-box", transform: `scale(${rebote(Math.min(1, p))})`, display: "flex", alignItems: "center", gap: 18, padding: "0 24px", fontFamily: "Sora", fontWeight: 800, color: TINTA }}>
      <span style={{ fontSize: 60 }}>{ic}</span>
      <div style={{ lineHeight: 1.1 }}>
        <div style={{ fontSize: 42 }}>{nom}</div>
        <div style={{ fontSize: 30, color: "#5B4A3E", marginTop: 4, opacity: pe }}>{ej}</div>
      </div>
    </div>
  );
}

/* ═════ 1–2 · El horno en rojo ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  const O = [[M.cambia, "🆕 ¿lo cambia?"], [M.asegura, "📄 ¿lo asegura?"], [M.repara, "🔧 ¿lo repara?"], [M.espera, "⏳ ¿espera?"]];
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(5px)" velo={0.15}>
      <div style={{ position: "absolute", left: 340, top: 180, width: 400, height: 260, background: "#FF9E9E", border: `8px solid ${TINTA}`, borderRadius: 26, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, color: TINTA, transform: `scale(${rebote(rampa(t, 0.1, 0.4))}) rotate(${3 * Math.sin(t * 6) * pulso(t, M.rojo - 0.3, 1)}deg)` }}>
        <div style={{ fontSize: 110 }}>🔥</div>
        <div style={{ fontSize: 40 }}>horno viejo</div>
      </div>
      {O.map(([tw, txt], k) => <Cartel key={k} x={k % 2 ? 770 : 310} y={560 + Math.floor(k / 2) * 130} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={42} fondo={CREMA} giro={[-2, 2, 1, -1][k]} />)}
      <Cartel x={540} y={930} txt="cada opción, una respuesta" p={rampa(t, M.respuesta2 - 0.6, 0.35)} tam={44} fondo={MANGO} giro={-1} />
      <Sombra x={250} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={250} y={1515} alto={360} t={t} cara="tranquila" cab={8 * Math.sin(t * 2.5)} semilla={3} />
      <Sombra x={830} y={1510} w={190} />
      <Mascota esp="perro-corbatin" x={830} y={1515} alto={350} t={t} cara="triste" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 3 · Qué es ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3), b: E(3) + 0.3, s: 1.03, x: 540, y: 955 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={250} txt="planificar la respuesta a los riesgos" p={rampa(t, M.planificar - 0.3, 0.35)} tam={44} fondo={MANGO} />
      {[[M.opciones, "💡 desarrollar opciones"], [M.estrategias, "🧭 seleccionar estrategias"], [M.acciones, "🤝 acordar acciones"]].map(([tw, txt], k) => <Cartel key={k} x={540} y={430 + k * 140} txt={txt} p={rampa(t, tw - 0.35, 0.3)} tam={46} fondo={CREMA} giro={[-1, 1, -1][k]} />)}
      <Sombra x={540} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 4–6 · Cinco estrategias para amenazas ═════ */
function Amenazas({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(6), b: E(6), s: 1.02, x: 540, y: 960 }]);
  const A = [
    [M.evitar, M.horno5, "🚫", "evitar", "eliminarla: cambiar el horno", "#FFE1D8"],
    [M.transferir, M.seguro, "🤝", "transferir", "a un tercero: un seguro", "#FFF4DA"],
    [M.mitigar, M.mantenimiento, "🔧", "mitigar", "menos probabilidad o impacto: mantenimiento", "#DDE3FF"],
    [M.aceptar6, M.aceptar6 + 0.8, "🙆", "aceptar", "reconocerla, sin medidas por adelantado", "#E3F6EC"],
    [M.escalar6, M.escalar6 + 0.6, "🪜", "escalar", "si no le toca al proyecto", "#FFF4DA"],
  ];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={190} txt="⚡ amenazas: 5 estrategias" p={rampa(t, M.amenazas - 0.35, 0.35)} tam={46} fondo={MANGO} />
      {A.map(([tw, tw2, ic, nom, ej, fondo], k) => <Estr key={k} y={290 + k * 150} p={rampa(t, tw - 0.35, 0.35)} ic={ic} nom={nom} ej={ej} pe={rampa(t, tw2 - 0.4, 0.3)} fondo={fondo} />)}
      <Sombra x={160} y={1530} w={140} />
      <Mascota esp="perro-corbatin" x={160} y={1535} alto={220} t={t} cara={t > M.mantenimiento ? "feliz" : "tranquila"} semilla={9} />
      <Sombra x={920} y={1530} w={140} />
      <Mascota esp="hamster-gorra" x={920} y={1535} alto={220} t={t} cara="feliz" semilla={3} espejo />
    </Escena>
  );
}

/* ═════ 7–8 · Cinco para oportunidades ═════ */
function Oportunidades({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(8), b: E(8) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const O = [[M.explotar7, "🚀 explotar"], [M.compartir, "🤝 compartir"], [M.mejorar, "📈 mejorar"], [M.aceptar7, "🙆 aceptar"], [M.escalar7, "🪜 escalar"]];
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(7px)" velo={0.35}>
      <Cartel x={540} y={200} txt="🌱 oportunidades: también 5" p={rampa(t, M.oportunidades - 0.35, 0.35)} tam={46} fondo={MANGO} />
      {O.map(([tw, txt], k) => <Cartel key={k} x={k < 3 ? 190 + k * 350 : 365 + (k - 3) * 350} y={k < 3 ? 350 : 470} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={40} fondo="#E3F6EC" giro={[-2, 2, -1, 1, -2][k]} />)}
      <Cartel x={540} y={680} txt="🎪 ¡invitación a otra feria!" p={rampa(t, M.feria - 0.4, 0.35)} tam={44} fondo={CREMA} giro={-1} />
      <Cartel x={540} y={820} txt="🚀 explotar: asegurar que puedan ir" p={rampa(t, M.explotar8 - 0.3, 0.35)} tam={40} fondo="#C9EFD8" giro={1} />
      <Sombra x={260} y={1510} w={190} />
      <Mascota esp="gato-gafas" x={260} y={1515} alto={330} t={t} cara={t > M.feria ? "estrellas" : "feliz"} semilla={7} />
      <Sombra x={820} y={1510} w={190} />
      <Mascota esp="hamster-gorra" x={820} y={1515} alto={320} t={t} cara="feliz" salto={30 * pulso(t, M.ir, 0.5)} semilla={3} espejo />
    </Escena>
  );
}

/* ═════ 9–10 · Contingencia, dueño y registro ═════ */
function Contingencia({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10), s: 1.02, x: 540, y: 960 }]);
  const pC = rampa(t, M.activan - 0.3, 0.4);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={200} txt="📋 plan de contingencia" p={rampa(t, M.contingencia - 0.4, 0.35)} tam={50} fondo={MANGO} />
      <div style={{ position: "absolute", left: 110, top: 300, width: 860, height: 360, background: "#FFFDF7", border: `8px solid ${TINTA}`, borderRadius: 24, opacity: pC, fontFamily: "Sora", fontWeight: 800, color: TINTA, padding: "30px 40px", boxSizing: "border-box" }}>
        <div style={{ fontSize: 34, color: "#5B4A3E" }}>🔔 evento desencadenante</div>
        <div style={{ fontSize: 44, marginTop: 8, opacity: rampa(t, M.desencadenante - 0.6, 0.3) }}>si llueve el sábado…</div>
        <div style={{ fontSize: 34, color: "#5B4A3E", marginTop: 34 }}>☂️ respuesta</div>
        <div style={{ fontSize: 44, marginTop: 8, opacity: rampa(t, M.desencadenante - 0.2, 0.3) }}>…llevamos el toldo grande</div>
      </div>
      <Cartel x={330} y={800} txt="🙋 dueño: Ramón" p={rampa(t, M.dueno - 0.3, 0.3)} tam={42} fondo="#DDE3FF" giro={-2} />
      <Cartel x={760} y={800} txt="📒 al registro" p={rampa(t, M.registro - 0.3, 0.3)} tam={42} fondo={CREMA} giro={2} />
      <Sombra x={540} y={1520} w={190} />
      <Mascota esp="perro-corbatin" x={540} y={1525} alto={290} t={t} cara={t > M.dueno ? "feliz" : "tranquila"} semilla={9} />
    </Escena>
  );
}

/* ═════ 11 · Tus estrategias ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={300} txt="⚡ elige tus estrategias" p={rampa(t, M.toca - 0.2, 0.35)} tam={56} fondo={MANGO} />
      <Cartel x={540} y={480} txt="⚡ mayor amenaza: ________" p={rampa(t, M.amenaza11 - 0.3, 0.3)} tam={42} fondo="#FFE1D8" giro={-2} />
      <Cartel x={540} y={620} txt="🌱 mejor oportunidad: ________" p={rampa(t, M.oportunidad11 - 0.5, 0.3)} tam={42} fondo="#E3F6EC" giro={2} />
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.oportunidad11, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="perro-corbatin" x={790} y={1535} alto={380} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "definicion") return <Definicion t={t} />;
  if (p.tipo === "amenazas") return <Amenazas t={t} />;
  if (p.tipo === "oportunidades") return <Oportunidades t={t} />;
  if (p.tipo === "contingencia") return <Contingencia t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(0.1, "golpe", 0.3); [M.cambia, M.asegura, M.repara, M.espera].forEach((w) => fx(w - 0.3, "pop-suave", 0.22));
fx(S(3) - 0.3, "whoosh", 0.4); [M.opciones, M.estrategias, M.acciones].forEach((w) => fx(w - 0.35, "pop", 0.22));
fx(S(4) - 0.3, "whoosh", 0.4); [M.evitar, M.transferir, M.mitigar, M.aceptar6, M.escalar6].forEach((w) => fx(w - 0.35, "pop", 0.24));
fx(S(7) - 0.3, "whoosh", 0.4); [M.explotar7, M.compartir, M.mejorar, M.aceptar7, M.escalar7].forEach((w) => fx(w - 0.3, "pop-suave", 0.22)); fx(M.feria - 0.4, "campana", 0.25);
fx(S(9) - 0.3, "whoosh", 0.4); fx(M.activan - 0.3, "papel", 0.3); fx(M.dueno - 0.3, "sello", 0.25);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/panaderia.jpg", "art/oficina.jpg"];
const CLAVE = /^(respuesta|estrategias|evitar|transferir|mitigar|aceptar|escalar|explotar|compartir|mejorar|contingencia)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP43 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp43-respuestas-v2.mp3" sinSonido={sinSonido} />
);
