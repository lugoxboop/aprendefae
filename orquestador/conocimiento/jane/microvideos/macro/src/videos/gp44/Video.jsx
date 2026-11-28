/*
 * Gestión de Proyectos · GP-44 «¿Lo hacemos o lo compramos?» (gp44-adquisiciones).
 * Una idea: Planificar la Gestión de las Adquisiciones es documentar las decisiones de adquisiciones
 * del proyecto, especificar el enfoque e identificar a los proveedores potenciales (12.1, p. 466).
 * Análisis de hacer o comprar (12.1.2.3); enunciado del trabajo relativo a las adquisiciones: solo la
 * parte del alcance del contrato, claro, completo y conciso (12.1.3.4); criterios de selección de
 * proveedores (12.1.3.5); métodos de selección (12.1.2.4); decisiones de hacer o comprar (12.1.3.6);
 * plan de gestión de las adquisiciones (12.1.3.1).
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, ROJO } from "../gp/piezas.jsx";
import { Carpeta } from "../gp22/Video.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3] });
const { S, E, W } = T;

const M = {
  toldo: W(1, "toldo", 0.3), cose: W(1, "cose", 0.55), compra1: W(1, "compra", 0.8),
  quien: W(2, "quién?", 0.9),
  planificar: W(3, "Planificar", 0.05), documentar: W(3, "documentar", 0.35), especificar: W(3, "especificar", 0.65), identificar: W(3, "identificar", 0.8), proveedores3: W(3, "proveedores.", 0.97),
  hacer: W(4, "hacer", 0.3), equipo4: W(4, "equipo", 0.55), afuera: W(4, "afuera?", 0.95),
  capacidad5: W(5, "capacidad", 0.3), pericia: W(5, "pericia", 0.6), riesgos5: W(5, "riesgos.", 0.95),
  enunciado: W(6, "enunciado", 0.35), contrato: W(6, "contrato.", 0.95),
  claro: W(7, "claro,", 0.15), especificaciones: W(7, "especificaciones,", 0.45), cantidad: W(7, "cantidad,", 0.58), calidad7: W(7, "calidad,", 0.7), plazo: W(7, "plazo", 0.82), lugar: W(7, "lugar.", 0.95),
  criterios: W(8, "criterios", 0.15), capacidad8: W(8, "capacidad,", 0.6), costo8: W(8, "costo,", 0.72), entrega: W(8, "entrega", 0.84), experiencia: W(8, "experiencia.", 0.97),
  metodo: W(9, "método", 0.1), menor: W(9, "menor", 0.4), calificaciones: W(9, "calificaciones,", 0.65), basado: W(9, "basado", 0.8),
  documentada: W(10, "documentada,", 0.35), plan10: W(10, "plan", 0.6),
  toca: W(11, "toca:", 0.15), harias: W(11, "harías", 0.35), porque: W(11, "qué.", 0.95),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "definicion", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "hacer", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "enunciado", desde: S(6) - 0.3, entra: "barrido-izq" },
  { tipo: "seleccion", desde: S(8) - 0.3, entra: "barrido" },
  { tipo: "carpeta", desde: S(10) - 0.3, entra: "zoom" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* ═════ 1–2 · ¿Lo cose o lo compra? ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(5px)" velo={0.15}>
      <Gigante x={540} y={300} txt="⛱️" p={rampa(t, M.toldo - 0.3, 0.35)} tam={170} />
      <Cartel x={540} y={470} txt="toldo nuevo" p={rampa(t, M.toldo, 0.3)} tam={44} fondo={MANGO} giro={-2} />
      <Cartel x={260} y={650} txt="🧵 ¿lo cosemos?" p={rampa(t, M.cose - 0.3, 0.3)} tam={40} fondo={CREMA} giro={-3} />
      <Gigante x={540} y={770} txt="🆚" p={rampa(t, M.compra1 - 0.4, 0.3)} tam={70} />
      <Cartel x={810} y={650} txt="🛒 ¿lo compramos?" p={rampa(t, M.compra1 - 0.3, 0.3)} tam={40} fondo={CREMA} giro={3} />
      <Cartel x={810} y={880} txt="¿a quién?" p={rampa(t, M.quien - 0.4, 0.3)} tam={42} fondo="#DDE3FF" giro={-2} />
      <Sombra x={260} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={260} y={1515} alto={360} t={t} cara="tranquila" cab={8 * Math.sin(t * 2.5)} semilla={3} />
      <Sombra x={830} y={1510} w={190} />
      <Mascota esp="perro-mochila" x={830} y={1515} alto={350} t={t} cara="feliz" semilla={5} espejo />
    </Escena>
  );
}

/* ═════ 3 · Qué es ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3), b: E(3) + 0.3, s: 1.03, x: 540, y: 955 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={250} txt="planificar la gestión de las adquisiciones" p={rampa(t, M.planificar - 0.3, 0.35)} tam={40} fondo={MANGO} />
      {[[M.documentar, "📝 documentar las decisiones"], [M.especificar, "🧭 especificar el enfoque"], [M.identificar, "🔎 identificar proveedores"]].map(([tw, txt], k) => <Cartel key={k} x={540} y={430 + k * 140} txt={txt} p={rampa(t, tw - 0.35, 0.3)} tam={44} fondo={CREMA} giro={[-1, 1, -1][k]} />)}
      <Sombra x={540} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 4–5 · Hacer o comprar ═════ */
function Hacer({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(5), b: E(5) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const inc = lerp(0, -6, sale(rampa(t, M.riesgos5 - 0.3, 0.6)));
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={220} txt="⚖️ análisis de hacer o comprar" p={rampa(t, M.hacer - 0.4, 0.35)} tam={46} fondo={MANGO} />
      <div style={{ position: "absolute", left: 140, top: 560, width: 800, height: 14, background: TINTA, borderRadius: 7, transform: `rotate(${inc}deg)`, opacity: rampa(t, M.hacer, 0.3) }} />
      <div style={{ position: "absolute", left: 510, top: 574, width: 0, height: 0, borderLeft: "30px solid transparent", borderRight: "30px solid transparent", borderBottom: `60px solid ${TINTA}`, opacity: rampa(t, M.hacer, 0.3) }} />
      <Cartel x={280} y={460} txt="🛠️ hacer: el equipo" p={rampa(t, M.equipo4 - 0.3, 0.3)} tam={40} fondo="#E3F6EC" giro={-2} />
      <Cartel x={800} y={460} txt="🛒 comprar: afuera" p={rampa(t, M.afuera - 0.4, 0.3)} tam={40} fondo="#DDE3FF" giro={2} />
      {[[M.capacidad5, "💪 capacidad del equipo"], [M.pericia, "🎓 pericia necesaria"], [M.riesgos5, "⚠️ riesgos"]].map(([tw, txt], k) => <Cartel key={k} x={540} y={760 + k * 120} txt={txt} p={rampa(t, tw - 0.35, 0.3)} tam={40} fondo={CREMA} giro={[-1, 1, -1][k]} />)}
      <Sombra x={150} y={1520} w={150} />
      <Mascota esp="hamster-gorra" x={150} y={1525} alto={240} t={t} cara="tranquila" semilla={3} />
      <Sombra x={930} y={1520} w={150} />
      <Mascota esp="perro-mochila" x={930} y={1525} alto={240} t={t} cara="feliz" semilla={5} espejo />
    </Escena>
  );
}

/* ═════ 6–7 · Enunciado del trabajo ═════ */
function Enunciado({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(7), b: E(7), s: 1.02, x: 540, y: 960 }]);
  const I = [[M.especificaciones, "📐 especificaciones"], [M.cantidad, "🔢 cantidad"], [M.calidad7, "⭐ calidad"], [M.plazo, "📅 plazo"], [M.lugar, "📍 lugar"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Documento x={300} y={360} w={320} p={rampa(t, M.enunciado - 0.4, 0.4)} titulo="enunciado del trabajo" letra={36} giro={-3} />
      <Cartel x={780} y={300} txt="solo lo que va" p={rampa(t, M.contrato - 1.2, 0.3)} tam={36} fondo={CREMA} giro={2} />
      <Cartel x={780} y={400} txt="en el contrato ✍️" p={rampa(t, M.contrato - 0.5, 0.3)} tam={36} fondo={CREMA} giro={-1} />
      <Cartel x={780} y={540} txt="claro · completo · conciso" p={rampa(t, M.claro - 0.3, 0.35)} tam={32} fondo={MANGO} giro={1} />
      {I.map(([tw, txt], k) => <Cartel key={k} x={[300, 780, 200, 540, 880][k]} y={k < 2 ? 830 : 950} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={34} fondo="#DDE3FF" giro={[-2, 2, -1, 1, -2][k]} />)}
      <Sombra x={540} y={1530} w={180} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={250} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 8–9 · Criterios y método de selección ═════ */
function Seleccion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(9), b: E(9), s: 1.02, x: 540, y: 960 }]);
  const C = [[M.capacidad8, "💪 capacidad"], [M.costo8, "💲 costo"], [M.entrega, "🚚 entrega"], [M.experiencia, "🏅 experiencia"]];
  const MT = [[M.menor, "💲 menor costo"], [M.calificaciones, "🏅 solo por calificaciones"], [M.basado, "⚖️ basado en costos y calidad"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={200} txt="criterios de selección de proveedores" p={rampa(t, M.criterios - 0.4, 0.35)} tam={40} fondo={MANGO} />
      {C.map(([tw, txt], k) => <Cartel key={k} x={k % 2 ? 770 : 310} y={330 + Math.floor(k / 2) * 120} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={40} fondo={CREMA} giro={[-2, 2, 1, -1][k]} />)}
      <Cartel x={540} y={660} txt="método de selección (ejemplos)" p={rampa(t, M.metodo - 0.35, 0.35)} tam={40} fondo="#DDE3FF" />
      {MT.map(([tw, txt], k) => <Cartel key={k} x={540} y={790 + k * 110} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={38} fondo="#FFFDF7" giro={[-1, 1, -1][k]} />)}
      <Sombra x={150} y={1520} w={150} />
      <Mascota esp="hamster-gorra" x={150} y={1525} alto={230} t={t} cara="feliz" semilla={3} />
      <Sombra x={930} y={1520} w={150} />
      <Mascota esp="perro-mochila" x={930} y={1525} alto={230} t={t} cara="feliz" semilla={5} espejo />
    </Escena>
  );
}

/* ═════ 10 · Todo documentado ═════ */
function EnCarpeta({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10) + 0.3, s: 1.03, x: 540, y: 955 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Carpeta x={540} y={260} w={760} h={620} p={rampa(t, M.documentada - 0.5, 0.4)}>
        <Documento x={380} y={380} w={260} p={rampa(t, M.plan10 - 0.3, 0.4)} titulo="plan de gestión de las adquisiciones" letra={28} giro={-3} />
      </Carpeta>
      <Cartel x={300} y={1000} txt="🛠️🛒 decisión" p={rampa(t, M.documentada - 0.2, 0.3)} tam={36} fondo={CREMA} giro={-2} />
      <Cartel x={540} y={1110} txt="📄 enunciado del trabajo" p={rampa(t, M.documentada, 0.3)} tam={36} fondo={CREMA} giro={1} />
      <Cartel x={790} y={1000} txt="✅ criterios" p={rampa(t, M.documentada + 0.2, 0.3)} tam={36} fondo={CREMA} giro={2} />
      <Sombra x={540} y={1530} w={180} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={250} t={t} cara="estrellas" semilla={3} />
    </Escena>
  );
}

/* ═════ 11 · ¿Harías o comprarías? ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={300} txt="⚡ ¿hacer o comprar?" p={rampa(t, M.toca - 0.2, 0.35)} tam={58} fondo={MANGO} />
      <Cartel x={540} y={480} txt="🧩 pieza: ________" p={rampa(t, M.harias - 0.3, 0.3)} tam={46} fondo={CREMA} giro={-2} />
      <Cartel x={540} y={620} txt="🛠️ / 🛒 porque ________" p={rampa(t, M.porque - 0.6, 0.3)} tam={44} fondo={CREMA} giro={2} />
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.porque, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="perro-mochila" x={790} y={1535} alto={380} t={t} cara="feliz" semilla={5} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "definicion") return <Definicion t={t} />;
  if (p.tipo === "hacer") return <Hacer t={t} />;
  if (p.tipo === "enunciado") return <Enunciado t={t} />;
  if (p.tipo === "seleccion") return <Seleccion t={t} />;
  if (p.tipo === "carpeta") return <EnCarpeta t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.toldo - 0.3, "pop", 0.3); fx(M.cose - 0.3, "pop-suave", 0.22); fx(M.compra1 - 0.3, "pop-suave", 0.22); fx(M.quien - 0.4, "pop", 0.25);
fx(S(3) - 0.3, "whoosh", 0.4); [M.documentar, M.especificar, M.identificar].forEach((w) => fx(w - 0.35, "pop", 0.22));
fx(S(4) - 0.3, "whoosh", 0.4); fx(M.hacer, "desliza", 0.25); [M.capacidad5, M.pericia, M.riesgos5].forEach((w) => fx(w - 0.35, "pop-suave", 0.22));
fx(S(6) - 0.3, "whoosh", 0.4); fx(M.enunciado - 0.4, "papel", 0.3); fx(M.contrato - 0.5, "sello", 0.25); [M.especificaciones, M.cantidad, M.calidad7, M.plazo, M.lugar].forEach((w) => fx(w - 0.3, "pop-suave", 0.2));
fx(S(8) - 0.3, "whoosh", 0.4); [M.capacidad8, M.costo8, M.entrega, M.experiencia].forEach((w) => fx(w - 0.3, "pop", 0.2)); [M.menor, M.calificaciones, M.basado].forEach((w) => fx(w - 0.3, "pop-suave", 0.2));
fx(S(10) - 0.3, "whoosh", 0.4); fx(M.plan10 - 0.3, "papel", 0.3);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/calle.jpg", "art/oficina.jpg"];
const CLAVE = /^(adquisiciones|comprar|hacer|enunciado|criterios|proveedores|selección|plan)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP44 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp44-adquisiciones.mp3" sinSonido={sinSonido} />
);
