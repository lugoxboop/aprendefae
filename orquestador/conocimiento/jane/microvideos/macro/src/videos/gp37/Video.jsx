/*
 * Gestión de Proyectos · GP-37 «¿Cuántas manos y cuánta harina?» (gp37-recursos-est).
 * Una idea: Estimar los Recursos de las Actividades es estimar los recursos del equipo y el tipo y
 * las cantidades de materiales, equipamiento y suministros necesarios (9.2, p. 320). Técnicas:
 * ascendente, análoga, paramétrica (4.000 h en 1 año → 2 personas de 2.000 h), análisis de
 * alternativas (manual o automático; fabricar, alquilar o comprar) (9.2.2.2–9.2.2.5). Salidas:
 * requisitos de recursos, base de las estimaciones y estructura de desglose de recursos por
 * categoría y tipo (9.2.3.1–9.2.3.3, p. 325–327).
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, Dicho, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3] });
const { S, E, W } = T;

const M = {
  mil: W(1, "mil", 0.2), personas: W(1, "personas,", 0.55), harina: W(1, "harina,", 0.72), hornos: W(1, "hornos?", 0.92),
  corta: W(2, "corta,", 0.25), llega: W(2, "llega;", 0.45), desperdicia: W(2, "desperdicia.", 0.9),
  estimar3: W(3, "Estimar", 0.05), equipo3: W(3, "equipo", 0.4), materiales3: W(3, "materiales,", 0.7), equipamiento: W(3, "equipamiento", 0.8), suministros: W(3, "suministros", 0.92),
  actividad4: W(4, "actividad", 0.35), sumar: W(4, "sumar:", 0.55), ascendente: W(4, "ascendente.", 0.9),
  analoga: W(5, "análoga,", 0.4), parametrica: W(5, "paramétrica.", 0.92),
  cuatro: W(6, "cuatro", 0.2), dos6: W(6, "dos", 0.6), cada: W(6, "cada", 0.9),
  alternativas: W(7, "alternativas:", 0.25), manual: W(7, "manual", 0.45), automatico: W(7, "automático?", 0.6), fabricar: W(7, "¿Fabricar,", 0.72), alquilar: W(7, "alquilar", 0.82), comprar: W(7, "comprar?", 0.95),
  requisitos: W(8, "requisitos", 0.3), tipos: W(8, "tipos", 0.55), paquete8: W(8, "paquete", 0.85),
  base: W(9, "base", 0.3), metodo: W(9, "método,", 0.55), supuestos: W(9, "supuestos,", 0.67), rango: W(9, "rango", 0.8), confianza: W(9, "confianza.", 0.95),
  estructura: W(10, "estructura", 0.2), categoria: W(10, "categoría", 0.5), mano: W(10, "mano", 0.7), materiales10: W(10, "materiales", 0.85), equipos10: W(10, "equipos.", 0.95),
  toca: W(11, "toca:", 0.15), arma: W(11, "arma", 0.3), proyecto11: W(11, "proyecto.", 0.95),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "definicion", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "tecnicas", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "alternativas", desde: S(7) - 0.3, entra: "barrido-izq" },
  { tipo: "salidas", desde: S(8) - 0.3, entra: "barrido" },
  { tipo: "arbol", desde: S(10) - 0.3, entra: "zoom" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

const caja = (x, y, w, h, fondo, op, txt, tam) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, background: fondo, border: `6px solid ${TINTA}`, borderRadius: 18, boxSizing: "border-box", opacity: op, transform: `scale(${0.6 + 0.4 * sale(clamp01(op))})`, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: tam, color: TINTA, lineHeight: 1.1, padding: "0 8px" }}>{txt}</div>
);
const linea = (x1, y1, x2, y2, op) => (
  <svg width="1080" height="1920" style={{ position: "absolute", left: 0, top: 0, opacity: op }}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={TINTA} strokeWidth="6" /></svg>
);

/* ═════ 1–2 · Mil panes ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  const inc = rampa(t, M.corta - 0.3, 0.4) * (1 - rampa(t, M.desperdicia - 0.4, 0.4)) * -8 + rampa(t, M.desperdicia - 0.4, 0.4) * 8;
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(5px)" velo={0.15}>
      <Dicho x={250} y={200} w={580} h={170} colaX={380} p={rampa(t, M.mil - 0.4, 0.4)}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 52, color: TINTA }}>🍞 × 1000</div>
      </Dicho>
      <Cartel x={220} y={500} txt="👥 ¿cuántas?" p={rampa(t, M.personas - 0.3, 0.3)} tam={42} fondo={CREMA} giro={-3} />
      <Cartel x={540} y={580} txt="🌾 ¿cuánta?" p={rampa(t, M.harina - 0.3, 0.3)} tam={42} fondo={CREMA} giro={2} />
      <Cartel x={860} y={500} txt="🔥 ¿cuántos?" p={rampa(t, M.hornos - 0.3, 0.3)} tam={42} fondo={CREMA} giro={-2} />
      <div style={{ position: "absolute", left: 190, top: 820, width: 700, height: 14, background: TINTA, borderRadius: 7, transform: `rotate(${inc}deg)`, opacity: rampa(t, M.corta - 0.4, 0.3) }}>
        <div style={{ position: "absolute", left: -10, top: -110, fontSize: 40, fontFamily: "Sora", fontWeight: 800, color: TINTA, opacity: rampa(t, M.llega - 0.3, 0.3), whiteSpace: "nowrap" }}>😰 corto</div>
        <div style={{ position: "absolute", right: -10, top: -110, fontSize: 40, fontFamily: "Sora", fontWeight: 800, color: TINTA, opacity: rampa(t, M.desperdicia - 0.4, 0.3), whiteSpace: "nowrap" }}>🗑️ de más</div>
      </div>
      <div style={{ position: "absolute", left: 510, top: 834, width: 0, height: 0, borderLeft: "30px solid transparent", borderRight: "30px solid transparent", borderBottom: `60px solid ${TINTA}`, opacity: rampa(t, M.corta - 0.4, 0.3) }} />
      <Sombra x={250} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={250} y={1515} alto={370} t={t} cara={t > M.corta ? "triste" : "feliz"} cab={6 * Math.sin(t * 3)} semilla={3} />
      <Sombra x={830} y={1510} w={190} />
      <Mascota esp="perro-corbatin" x={830} y={1515} alto={360} t={t} cara="tranquila" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 3 · Qué es ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3), b: E(3) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const R = [[M.equipo3, "👥 equipo"], [M.materiales3, "🌾 materiales"], [M.equipamiento, "🔥 equipamiento"], [M.suministros, "📦 suministros"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={250} txt="estimar los recursos de las actividades" p={rampa(t, M.estimar3 - 0.3, 0.35)} tam={44} fondo={MANGO} />
      <Cartel x={540} y={400} txt="tipo y cantidad de…" p={rampa(t, M.estimar3 + 1.2, 0.35)} tam={40} fondo={CREMA} />
      {R.map(([tw, txt], k) => <Cartel key={k} x={k % 2 ? 770 : 310} y={560 + Math.floor(k / 2) * 135} txt={txt} p={rampa(t, tw - 0.35, 0.3)} tam={44} fondo="#DDE3FF" giro={[-2, 2, 1, -1][k]} />)}
      <Sombra x={540} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 4–6 · Técnicas ═════ */
function Tecnicas({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(6), b: E(6), s: 1.02, x: 540, y: 960 }]);
  const pA = rampa(t, M.actividad4 - 0.3, 0.35), pS = rampa(t, M.sumar - 0.3, 0.35);
  const sal6 = rampa(t, S(6) - 0.4, 0.35);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <div style={{ opacity: 1 - sal6 }}>
        {[0, 1, 2].map((k) => <div key={k}>{caja(240 + k * 160, 300, 130, 100, CREMA, clamp01((t - (M.actividad4 - 0.3 + k * 0.2)) / 0.3), "🔨", 44)}</div>)}
        <Gigante x={720} y={300} txt="➕" p={pS} tam={70} />
        {caja(880, 300, 190, 110, MANGO, pS, "Σ", 60)}
        <Cartel x={540} y={450} txt="⬆️ ascendente" p={rampa(t, M.ascendente - 0.4, 0.35)} tam={46} fondo="#E3F6EC" giro={-2} />
        <Cartel x={310} y={620} txt="🔁 análoga" p={rampa(t, M.analoga - 0.35, 0.35)} tam={44} fondo="#DDE3FF" giro={2} />
        <Cartel x={770} y={620} txt="📐 paramétrica" p={rampa(t, M.parametrica - 0.4, 0.35)} tam={44} fondo="#DDE3FF" giro={-2} />
      </div>
      {sal6 > 0 && (
        <div style={{ opacity: sal6 }}>
          <Cartel x={540} y={260} txt="📐 paramétrica" p={1} tam={50} fondo="#DDE3FF" />
          {caja(540, 470, 560, 140, CREMA, rampa(t, M.cuatro - 0.3, 0.35), "⏱️ 4.000 h en 1 año", 50)}
          <Gigante x={540} y={630} txt="⬇️" p={rampa(t, M.dos6 - 0.5, 0.3)} tam={70} />
          {[0, 1].map((k) => <div key={k}>{caja(370 + k * 340, 800, 280, 160, "#E3F6EC", clamp01((t - (M.dos6 - 0.3 + k * 0.25)) / 0.3), "👤 2.000 h", 46)}</div>)}
        </div>
      )}
      <Sombra x={540} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={290} t={t} cara={t > M.cada ? "estrellas" : "feliz"} semilla={3} />
    </Escena>
  );
}

/* ═════ 7 · Alternativas ═════ */
function Alternativas({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(7), b: E(7) + 0.3, s: 1.03, x: 540, y: 955 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(7px)" velo={0.35}>
      <Cartel x={540} y={240} txt="⚖️ análisis de alternativas" p={rampa(t, M.alternativas - 0.4, 0.35)} tam={50} fondo={MANGO} />
      <Cartel x={310} y={430} txt="🙌 manual" p={rampa(t, M.manual - 0.3, 0.3)} tam={46} fondo={CREMA} giro={-2} />
      <Gigante x={540} y={430} txt="🆚" p={rampa(t, M.manual, 0.3)} tam={70} />
      <Cartel x={780} y={430} txt="🤖 automático" p={rampa(t, M.automatico - 0.3, 0.3)} tam={46} fondo={CREMA} giro={2} />
      {[[M.fabricar, "🛠️ fabricar"], [M.alquilar, "🔑 alquilar"], [M.comprar, "🛒 comprar"]].map(([tw, txt], k) => <Cartel key={k} x={200 + k * 340} y={680} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={42} fondo="#DDE3FF" giro={[-2, 1, -1][k]} />)}
      <Sombra x={260} y={1510} w={190} />
      <Mascota esp="hamster-gorra" x={260} y={1515} alto={320} t={t} cara="tranquila" cab={8 * Math.sin(t * 2.5)} semilla={3} />
      <Sombra x={820} y={1510} w={190} />
      <Mascota esp="perro-corbatin" x={820} y={1515} alto={330} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 8–9 · Requisitos y base ═════ */
function Salidas({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(9), b: E(9), s: 1.02, x: 540, y: 960 }]);
  const B = [[M.metodo, "🧭 método"], [M.supuestos, "💭 supuestos"], [M.rango, "↔️ rango"], [M.confianza, "👍 confianza"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Documento x={300} y={380} w={300} p={rampa(t, M.requisitos - 0.4, 0.4)} titulo="requisitos de recursos" letra={34} giro={-4} />
      <Cartel x={300} y={690} txt="tipos y cantidades" p={rampa(t, M.tipos - 0.3, 0.3)} tam={34} fondo={CREMA} giro={-2} />
      <Cartel x={300} y={790} txt="por actividad o paquete" p={rampa(t, M.paquete8 - 0.4, 0.3)} tam={30} fondo={CREMA} giro={1} />
      <Documento x={780} y={380} w={300} p={rampa(t, M.base - 0.4, 0.4)} titulo="base de las estimaciones" letra={34} giro={4} />
      {B.map(([tw, txt], k) => <Cartel key={k} x={780} y={680 + k * 100} txt={txt} p={rampa(t, tw - 0.35, 0.3)} tam={34} fondo="#DDE3FF" giro={[2, -1, 1, -2][k]} />)}
      <Sombra x={540} y={1530} w={190} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={260} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 10 · Estructura de desglose de recursos ═════ */
function Arbol({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10), s: 1.02, x: 540, y: 960 }]);
  const pR = rampa(t, M.estructura - 0.3, 0.4);
  const C = [[M.mano, 200, "👥 mano de obra", ["panadero", "ayudante"]], [M.materiales10, 540, "🌾 materiales", ["harina", "levadura"]], [M.equipos10, 880, "🔥 equipos", ["horno", "batidora"]]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={200} txt="estructura de desglose de recursos" p={rampa(t, M.estructura - 0.4, 0.35)} tam={42} fondo={MANGO} />
      {caja(540, 360, 420, 110, "#DDE3FF", pR, "recursos del proyecto", 38)}
      {C.map(([tw, x, txt, hijos], k) => {
        const p = rampa(t, tw - 0.35, 0.3);
        return (
          <div key={k}>
            {linea(540, 415, x, 520, p)}
            {caja(x, 570, 300, 100, CREMA, p, txt, 34)}
            {hijos.map((h, j) => <div key={j}>{linea(x, 620, x, 690 + j * 120, p)}{caja(x, 720 + j * 120, 220, 80, "#FFFDF7", clamp01((t - (tw - 0.1 + j * 0.15)) / 0.3), h, 30)}</div>)}
          </div>
        );
      })}
      <Cartel x={540} y={1020} txt="por categoría y tipo" p={rampa(t, M.categoria - 0.3, 0.35)} tam={40} fondo="#E3F6EC" giro={-1} />
      <Sombra x={540} y={1520} w={190} />
      <Mascota esp="hamster-gorra" x={540} y={1525} alto={270} t={t} cara={t > M.equipos10 ? "estrellas" : "feliz"} semilla={3} />
    </Escena>
  );
}

/* ═════ 11 · Tu estructura ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={300} txt="⚡ arma tu desglose de recursos" p={rampa(t, M.toca - 0.2, 0.35)} tam={50} fondo={MANGO} />
      {["👥 ________", "🌾 ________", "🔥 ________"].map((txt, k) => <Cartel key={k} x={540} y={470 + k * 125} txt={txt} p={rampa(t, M.arma - 0.2 + k * 0.4, 0.3)} tam={48} fondo={CREMA} giro={[-2, 2, -1][k]} />)}
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.proyecto11, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="perro-corbatin" x={790} y={1535} alto={380} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "definicion") return <Definicion t={t} />;
  if (p.tipo === "tecnicas") return <Tecnicas t={t} />;
  if (p.tipo === "alternativas") return <Alternativas t={t} />;
  if (p.tipo === "salidas") return <Salidas t={t} />;
  if (p.tipo === "arbol") return <Arbol t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.mil - 0.4, "pop", 0.35); [M.personas, M.harina, M.hornos].forEach((w) => fx(w - 0.3, "pop-suave", 0.25)); fx(M.corta - 0.4, "desliza", 0.3); fx(M.desperdicia - 0.4, "toc-grave", 0.3);
fx(S(3) - 0.3, "whoosh", 0.4); fx(M.estimar3 - 0.3, "pop", 0.3); [M.equipo3, M.materiales3, M.equipamiento, M.suministros].forEach((w) => fx(w - 0.35, "pop-suave", 0.22));
fx(S(4) - 0.3, "whoosh", 0.4); fx(M.sumar - 0.3, "ding", 0.25); fx(M.analoga - 0.35, "pop", 0.25); fx(M.parametrica - 0.4, "pop", 0.25); fx(M.cuatro - 0.3, "tiza", 0.25); fx(M.dos6 - 0.3, "ding-doble", 0.25);
fx(S(7) - 0.3, "whoosh", 0.4); fx(M.manual - 0.3, "pop", 0.25); fx(M.automatico - 0.3, "pop", 0.25); [M.fabricar, M.alquilar, M.comprar].forEach((w) => fx(w - 0.3, "pop-suave", 0.22));
fx(S(8) - 0.3, "whoosh", 0.4); fx(M.requisitos - 0.4, "papel", 0.3); fx(M.base - 0.4, "papel", 0.3);
fx(S(10) - 0.3, "whoosh", 0.4); [M.mano, M.materiales10, M.equipos10].forEach((w) => fx(w - 0.35, "pop", 0.22));
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/panaderia.jpg", "art/oficina.jpg"];
const CLAVE = /^(recursos|ascendente|análoga|paramétrica|alternativas|requisitos|estructura|desglose|base)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP37 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp37-recursos-est.mp3" sinSonido={sinSonido} />
);
