/*
 * Gestión de Proyectos · GP-51 «Dos quieren el mismo horno» (gp51-dirigir-equipo).
 * Una idea: Dirigir al Equipo es hacer seguimiento del desempeño de los miembros del equipo, proporcionar
 * retroalimentación, resolver problemas y gestionar cambios en el equipo (9.5, p. 345).
 * Gestión de conflictos (9.5.2.1, p. 348–349): fuentes (escasez de recursos, prioridades de la programación,
 * estilos personales de trabajo); primero los miembros; el director, cuanto antes y generalmente en privado;
 * cinco técnicas: retirarse/eludir, suavizar/adaptarse, consensuar/conciliar (a veces perder-perder),
 * forzar/dirigir (ganar-perder), colaborar/resolver el problema (puede dar ganar-ganar).
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Dicho, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, {
  extra: [0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3],
  manual: { 3: ["Dirigir al equipo es hacer seguimiento del desempeño,", "dar retroalimentación, resolver problemas", "y gestionar cambios en el equipo."] },
});
const { S, E, W } = T;

const M = {
  discuten: W(1, "discuten:", 0.3), horno1: W(1, "horno", 0.65), hora: W(1, "hora.", 0.97),
  pia2: W(2, "Pía?", 0.8),
  dirigir: W(3, "Dirigir", 0.03), seguimiento: W(3, "seguimiento", 0.3), retro: W(3, "retroalimentación,", 0.5), resolver: W(3, "resolver", 0.65), cambios: W(3, "cambios", 0.88),
  inevitables: W(4, "inevitables.", 0.25), recursos4: W(4, "recursos", 0.55), prioridades: W(4, "prioridades", 0.7), estilos: W(4, "estilos", 0.88),
  ellos: W(5, "ellos.", 0.3), crece: W(5, "crece,", 0.4), pronto: W(5, "pronto", 0.7), privado: W(5, "privado.", 0.97),
  cinco: W(6, "cinco", 0.15), retirarse: W(6, "Retirarse", 0.35), posponer: W(6, "posponer", 0.75),
  suavizar: W(7, "Suavizar", 0.05), ceder7: W(7, "ceder", 0.6),
  consensuar: W(8, "Consensuar", 0.05), cede8: W(8, "cede", 0.5), pierden: W(8, "pierden.", 0.97),
  forzar: W(9, "Forzar", 0.05), imponer: W(9, "imponer", 0.35), gana9: W(9, "gana", 0.8),
  colaborar: W(10, "Colaborar", 0.05), visiones: W(10, "visiones,", 0.5), ganar: W(10, "ganar-ganar.", 0.97),
  toca: W(11, "toca:", 0.15), conflicto11: W(11, "conflicto", 0.4), tecnica: W(11, "técnica", 0.85),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "definicion", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "conflictos", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "tecnicas", desde: S(6) - 0.3, entra: "barrido-izq" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* ═════ 1–2 · El horno en disputa ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  const tira = 18 * Math.sin(t * 9) * rampa(t, M.horno1, 0.3) * (t < E(1) + 0.4 ? 1 : 0.3);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(5px)" velo={0.15}>
      <Gigante x={540 + tira} y={420} txt="🔥" p={rampa(t, M.horno1 - 0.3, 0.35)} tam={170} />
      <Cartel x={540} y={580} txt="🕗 a la misma hora" p={rampa(t, M.hora - 0.4, 0.3)} tam={42} fondo={MANGO} giro={-1} />
      <Dicho x={40} y={160} w={300} h={150} p={rampa(t, M.discuten - 0.3, 0.3)} colaX={200}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 40 }}>¡es mío!</div>
      </Dicho>
      <Dicho x={740} y={160} w={300} h={150} p={rampa(t, M.discuten, 0.3)} colaX={880}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 40 }}>¡no, mío!</div>
      </Dicho>
      <Cartel x={540} y={860} txt="¿qué hace Pía?" p={rampa(t, M.pia2 - 0.5, 0.3)} tam={46} fondo="#DDE3FF" giro={1} />
      <Sombra x={190} y={1510} w={180} />
      <Mascota esp="perro-corbatin" x={190} y={1515} alto={330} t={t} cara="triste" cab={6 * Math.sin(t * 5)} semilla={9} />
      <Sombra x={540} y={1530} w={150} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={250} t={t} cara="tranquila" semilla={3} />
      <Sombra x={890} y={1510} w={180} />
      <Mascota esp="gato-gafas" x={890} y={1515} alto={330} t={t} cara="triste" cab={-6 * Math.sin(t * 5)} semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 3 · Qué es ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3), b: E(3) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const C = [[M.seguimiento, "👀 seguimiento del desempeño"], [M.retro, "💬 retroalimentación"], [M.resolver, "🧩 resolver problemas"], [M.cambios, "🔄 gestionar cambios"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={220} txt="dirigir al equipo" p={rampa(t, M.dirigir - 0.3, 0.35)} tam={52} fondo={MANGO} />
      {C.map(([tw, txt], k) => <Cartel key={k} x={540} y={380 + k * 130} txt={txt} p={rampa(t, tw - 0.35, 0.3)} tam={42} fondo={CREMA} giro={[-1, 1, -1, 1][k]} />)}
      <Sombra x={540} y={1510} w={190} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 4–5 · Los conflictos ═════ */
function Conflictos({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(5), b: E(5) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const F = [[M.recursos4, "🔥 recursos escasos"], [M.prioridades, "📅 prioridades del cronograma"], [M.estilos, "🎨 estilos de trabajo"]];
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={190} txt="⚡ los conflictos son inevitables" p={rampa(t, M.inevitables - 0.4, 0.35)} tam={42} fondo={MANGO} />
      <Cartel x={540} y={300} txt="pueden nacer de…" p={rampa(t, M.recursos4 - 0.8, 0.3)} tam={34} fondo="#FFFDF7" />
      {F.map(([tw, txt], k) => <Cartel key={k} x={540} y={410 + k * 110} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={40} fondo="#FFE1D8" giro={[-1, 1, -1][k]} />)}
      <Cartel x={280} y={810} txt="1️⃣ lo intentan ellos" p={rampa(t, M.ellos - 0.4, 0.3)} tam={36} fondo={CREMA} giro={-2} />
      <Cartel x={790} y={810} txt="2️⃣ si crece: el director" p={rampa(t, M.crece - 0.3, 0.3)} tam={34} fondo={CREMA} giro={2} />
      <Cartel x={540} y={940} txt="⏱️ pronto · 🤫 en general, en privado" p={rampa(t, M.pronto - 0.3, 0.3)} tam={34} fondo="#E3F6EC" giro={-1} />
      <Sombra x={190} y={1530} w={150} />
      <Mascota esp="perro-corbatin" x={190} y={1535} alto={240} t={t} cara="tranquila" semilla={9} />
      <Sombra x={540} y={1530} w={150} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={250} t={t} cara="tranquila" salto={25 * pulso(t, M.crece, 0.5)} semilla={3} />
      <Sombra x={890} y={1530} w={150} />
      <Mascota esp="gato-gafas" x={890} y={1535} alto={240} t={t} cara="tranquila" semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 6–10 · Las cinco técnicas ═════ */
const TEC = [
  ["🚶", "retirarse / eludir", "posponer el conflicto", "", "#EFE8DA"],
  ["🕊️", "suavizar / adaptarse", "resaltar acuerdos y ceder", "", "#FFFDF7"],
  ["🤏", "consensuar / conciliar", "cada uno cede algo", "a veces todos pierden", CREMA],
  ["✊", "forzar / dirigir", "imponer el propio punto de vista", "ganar-perder", "#FFE1D8"],
  ["🤝", "colaborar / resolver el problema", "sumar todas las visiones", "puede ser ganar-ganar", "#E3F6EC"],
];
function Tecnicas({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10) + 0.3, s: 1.03, x: 540, y: 950 }]);
  const tw = [M.retirarse, M.suavizar, M.consensuar, M.forzar, M.colaborar];
  const sub = [M.posponer, M.ceder7, M.cede8, M.imponer, M.visiones];
  const extra = [0, 0, M.pierden, M.gana9, M.ganar];
  const activa = tw.reduce((a, w, k) => (t >= w - 0.3 ? k : a), -1);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={140} txt="5 técnicas para resolver conflictos" p={rampa(t, M.cinco - 0.3, 0.35)} tam={40} fondo={MANGO} />
      {TEC.map(([ic, nom, s1, s2, fondo], k) => {
        const q = rampa(t, tw[k] - 0.35, 0.3);
        if (q <= 0) return null;
        const on = k === activa;
        return (
          <div key={k} style={{ position: "absolute", left: 50, top: 230 + k * 190, width: 980, height: 170, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 20, padding: "0 24px", background: fondo, border: `${on ? 9 : 5}px solid ${on ? AZUL : TINTA}`, borderRadius: 22, transform: `scale(${rebote(q) * (on ? 1.02 : 0.97)})`, opacity: on ? 1 : 0.75, fontFamily: "Sora", fontWeight: 800, color: TINTA }}>
            <span style={{ fontSize: 70 }}>{ic}</span>
            <div style={{ lineHeight: 1.12 }}>
              <div style={{ fontSize: 40 }}>{nom}</div>
              <div style={{ fontSize: 30, color: "#5B4A3E", marginTop: 4, opacity: rampa(t, sub[k] - 0.3, 0.3) }}>{s1}</div>
              {s2 && <div style={{ fontSize: 30, color: k === 4 ? "#1E7F4F" : ROJO, marginTop: 2, opacity: rampa(t, extra[k] - 0.6, 0.3) }}>{s2}</div>}
            </div>
          </div>
        );
      })}
      <Sombra x={190} y={1530} w={130} />
      <Mascota esp="perro-corbatin" x={190} y={1535} alto={200} t={t} cara={t > M.ganar - 0.5 ? "feliz" : "tranquila"} semilla={9} />
      <Sombra x={540} y={1530} w={130} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={210} t={t} cara={t > M.ganar - 0.5 ? "estrellas" : "tranquila"} semilla={3} />
      <Sombra x={890} y={1530} w={130} />
      <Mascota esp="gato-gafas" x={890} y={1535} alto={200} t={t} cara={t > M.ganar - 0.5 ? "feliz" : "tranquila"} semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 11 · Tu conflicto ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={280} txt="⚡ tu conflicto" p={rampa(t, M.toca - 0.2, 0.35)} tam={58} fondo={MANGO} />
      <Cartel x={540} y={450} txt="⚡ conflicto: ________" p={rampa(t, M.conflicto11 - 0.3, 0.3)} tam={44} fondo={CREMA} giro={-2} />
      <Cartel x={540} y={580} txt="🤝 técnica: ________" p={rampa(t, M.tecnica - 0.3, 0.3)} tam={44} fondo={CREMA} giro={1} />
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.tecnica, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="perro-corbatin" x={790} y={1535} alto={370} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "definicion") return <Definicion t={t} />;
  if (p.tipo === "conflictos") return <Conflictos t={t} />;
  if (p.tipo === "tecnicas") return <Tecnicas t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.discuten - 0.3, "pop", 0.3); fx(M.discuten, "pop", 0.3); fx(M.horno1 - 0.3, "golpe", 0.22); fx(M.pia2 - 0.5, "pop-suave", 0.22);
fx(S(3) - 0.3, "whoosh", 0.4); [M.seguimiento, M.retro, M.resolver, M.cambios].forEach((w) => fx(w - 0.35, "pop", 0.2));
fx(S(4) - 0.3, "whoosh", 0.4); [M.recursos4, M.prioridades, M.estilos].forEach((w) => fx(w - 0.3, "pop-suave", 0.2)); [M.ellos, M.crece, M.pronto].forEach((w) => fx(w - 0.3, "pop", 0.2));
fx(S(6) - 0.3, "whoosh", 0.4); [M.retirarse, M.suavizar, M.consensuar, M.forzar, M.colaborar].forEach((w) => fx(w - 0.35, "pop", 0.24)); fx(M.ganar - 0.6, "ding", 0.3);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/panaderia.jpg", "art/oficina.jpg"];
const CLAVE = /^(conflictos|conflicto|retirarse|eludir|suavizar|adaptarse|consensuar|conciliar|forzar|dirigir|colaborar|ganar-ganar)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP51 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp51-dirigir-equipo.mp3" sinSonido={sinSonido} />
);
