/*
 * Gestión de Proyectos · GP-63 «Faltan mesas» (gp63-controlar-recursos).
 * Una idea: Controlar los Recursos es asegurar que los recursos físicos asignados y adjudicados estén
 * disponibles tal como se planificó, monitorear la utilización planificada frente a la real y tomar acciones
 * correctivas; los recursos están en el momento y lugar adecuados y se liberan cuando ya no se necesitan
 * (9.6, p. 352). Análisis de alternativas y costo-beneficio (9.6.2.1); resolución de problemas: identificar,
 * definir, investigar, analizar, resolver y comprobar; p. ej. máquinas de otro departamento no liberadas a
 * tiempo (9.6.2.2); negociación e influencia (9.6.2.3); solicitudes de cambio (9.6.3.2, p. 357).
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
    3: ["Controlar los recursos es asegurar que los recursos físicos asignados", "estén disponibles tal como se planificó,", "monitorear su uso planificado frente al real, y tomar acciones correctivas."],
    5: ["Para resolver problemas, hay pasos:", "identificar, definir, investigar, analizar, resolver y comprobar."],
    7: ["Luego, con el análisis de alternativas, compara:", "pedirlas de nuevo, alquilar otras, o pagar horas extra."],
  },
});
const { S, E, W } = T;
const VERDE = "#2FB36B";

const M = {
  manana: W(1, "mañana,", 0.2), cinco: W(1, "cinco", 0.4), departamento1: W(1, "departamento.", 0.95),
  vigila: W(2, "vigila", 0.2), necesitan: W(2, "necesitan?", 0.9),
  controlar: W(3, "Controlar", 0.03), disponibles: W(3, "disponibles", 0.35), uso: W(3, "uso", 0.6), correctivas3: W(3, "correctivas.", 0.97),
  momento: W(4, "momento", 0.25), liberan: W(4, "liberan", 0.7),
  identificar: W(5, "identificar,", 0.4), definir: W(5, "definir,", 0.5), investigar: W(5, "investigar,", 0.6), analizar: W(5, "analizar,", 0.7), resolver: W(5, "resolver", 0.82, 1), comprobar: W(5, "comprobar.", 0.95),
  investiga6: W(6, "investiga", 0.1), causa6: W(6, "causa:", 0.3), libero: W(6, "liberó", 0.75),
  alternativas: W(7, "alternativas,", 0.35), pedirlas: W(7, "pedirlas", 0.55), alquilar: W(7, "alquilar", 0.72), horas: W(7, "horas", 0.9),
  costo8: W(8, "costo-beneficio", 0.1), mejor: W(8, "mejor", 0.5),
  negociacion: W(9, "negociación", 0.15), influencia: W(9, "influencia", 0.35), tiempo9: W(9, "tiempo.", 0.97),
  plan10: W(10, "plan,", 0.4), solicitud10: W(10, "solicitud", 0.75),
  toca: W(11, "toca:", 0.15), recurso11: W(11, "recurso", 0.35), harias: W(11, "harías.", 0.97),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "definicion", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "pasos", desde: S(5) - 0.3, entra: "zoom" },
  { tipo: "opciones", desde: S(7) - 0.3, entra: "barrido-izq" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* Mesa sencilla; falta = solo el contorno punteado */
function Mesa({ x, y, w, falta = false, p = 1 }) {
  if (p <= 0) return null;
  const h = w * 0.6;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h, width: w, height: h, transform: `scale(${rebote(Math.min(1, p))})`, opacity: falta ? 0.75 : 1 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: h * 0.25, background: falta ? "transparent" : "#B07A47", border: `6px ${falta ? "dashed" : "solid"} ${TINTA}`, borderRadius: 10 }} />
      {[0.1, 0.8].map((f) => <div key={f} style={{ position: "absolute", left: `${f * 100}%`, top: h * 0.25, width: w * 0.1, height: h * 0.75, background: falta ? "transparent" : "#8A5A35", border: `6px ${falta ? "dashed" : "solid"} ${TINTA}`, borderRadius: 6 }} />)}
      {falta && <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.3, textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: w * 0.3, color: ROJO }}>?</div>}
    </div>
  );
}

/* ═════ 1–2 · Faltan cinco mesas ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(5px)" velo={0.15}>
      <Cartel x={540} y={200} txt="🎪 la feria empieza mañana" p={rampa(t, M.manana - 0.4, 0.3)} tam={44} fondo={MANGO} giro={-2} />
      {Array.from({ length: 5 }).map((_, k) => <Mesa key={k} x={160 + k * 190} y={580} w={175} falta p={rampa(t, M.cinco - 0.3 + k * 0.1, 0.3)} />)}
      <Cartel x={540} y={660} txt="❌ faltan 5 mesas" p={rampa(t, M.cinco, 0.3)} tam={42} fondo="#FFE1D8" color={ROJO} giro={1} />
      <Cartel x={540} y={790} txt="🏢 las tiene otro departamento" p={rampa(t, M.departamento1 - 0.6, 0.3)} tam={38} fondo={CREMA} giro={-1} />
      <Cartel x={540} y={950} txt="👀 ¿quién vigila?" p={rampa(t, M.vigila - 0.3, 0.3)} tam={44} fondo="#FFFDF7" giro={2} />
      <Sombra x={260} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={260} y={1515} alto={330} t={t} cara={t > M.cinco ? "triste" : "feliz"} semilla={3} />
      <Sombra x={820} y={1510} w={200} />
      <Mascota esp="perro-corbatin" x={820} y={1515} alto={350} t={t} cara="tranquila" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 3–4 · Qué es ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(4), b: E(4) + 0.3, s: 1.03, x: 540, y: 955 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={170} txt="controlar los recursos" p={rampa(t, M.controlar - 0.3, 0.35)} tam={52} fondo={MANGO} />
      <Cartel x={540} y={300} txt="✅ recursos físicos disponibles, como se planificó" p={rampa(t, M.disponibles - 0.3, 0.3)} tam={32} fondo={CREMA} giro={-1} />
      <Cartel x={540} y={400} txt="📊 utilización planificada frente a la real" p={rampa(t, M.uso - 0.3, 0.3)} tam={33} fondo="#FFFDF7" giro={1} />
      <Cartel x={540} y={500} txt="🔧 acciones correctivas" p={rampa(t, M.correctivas3 - 0.5, 0.3)} tam={36} fondo="#DDE3FF" giro={-1} />
      <Cartel x={540} y={660} txt="📍 en el momento y lugar adecuados" p={rampa(t, M.momento - 0.3, 0.3)} tam={38} fondo="#E3F6EC" giro={1} />
      <Cartel x={540} y={770} txt="🔓 se liberan cuando ya no se necesitan" p={rampa(t, M.liberan - 0.3, 0.3)} tam={34} fondo="#E3F6EC" giro={-1} />
      <Sombra x={540} y={1530} w={170} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={260} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 5–6 · Pasos para resolver problemas ═════ */
const PASOS = [["identificar", "🎯"], ["definir", "✂️"], ["investigar", "🔎"], ["analizar", "🧠"], ["resolver", "🛠️"], ["comprobar", "✅"]];
function Pasos({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(6), b: E(6) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const foco = rampa(t, M.investiga6 - 0.3, 0.3);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={150} txt="🧩 resolver problemas" p={rampa(t, S(5) - 0.1, 0.3)} tam={46} fondo={MANGO} />
      {PASOS.map(([nom, ic], k) => {
        const q = rampa(t, M[nom] - 0.3, 0.3);
        if (q <= 0) return null;
        const hl = (k === 2 || k === 3) && foco > 0;
        const x = 130 + k * 70, y = 250 + k * 105;
        return (
          <div key={k} style={{ position: "absolute", left: x, top: y, width: 520, height: 88, background: hl ? "#FFF3C4" : "#FFFDF7", border: `6px solid ${hl ? ROJO : TINTA}`, borderRadius: 20, display: "flex", alignItems: "center", gap: 18, padding: "0 22px", boxSizing: "border-box", fontFamily: "Sora", fontWeight: 800, fontSize: 38, color: TINTA, transform: `scale(${rebote(q) * (hl ? 1.04 : 1)})`, opacity: foco > 0 && !hl ? 0.55 : 1 }}>
            <span style={{ fontSize: 44 }}>{ic}</span><span>{k + 1}. {nom}</span>
          </div>
        );
      })}
      <Cartel x={540} y={980} txt="🏢 el otro departamento" p={rampa(t, M.libero - 0.7, 0.3)} tam={36} fondo={CREMA} giro={-1} />
      <Cartel x={540} y={1080} txt="no liberó las mesas a tiempo" p={rampa(t, M.libero - 0.3, 0.3)} tam={36} fondo="#FFE1D8" color={ROJO} giro={1} />
      <Sombra x={160} y={1540} w={140} />
      <Mascota esp="hamster-gorra" x={160} y={1545} alto={230} t={t} cara={t > M.investiga6 ? "tranquila" : "feliz"} cab={6 * Math.sin(t * 2)} semilla={3} />
      <Sombra x={920} y={1540} w={140} />
      <Mascota esp="perro-corbatin" x={920} y={1545} alto={230} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 7–10 · Alternativas, costo-beneficio, negociación ═════ */
function Opciones({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(9), b: E(10) + 0.3, s: 1.02, x: 540, y: 960 }]);
  const O = [[M.pedirlas, "🔁", "pedirlas de nuevo"], [M.alquilar, "🧾", "alquilar otras"], [M.horas, "⏰", "pagar horas extras"]];
  const pB = rampa(t, M.costo8 - 0.3, 0.3);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={150} txt="🔀 análisis de alternativas" p={rampa(t, M.alternativas - 0.4, 0.3)} tam={44} fondo={MANGO} />
      {O.map(([tw, ic, txt], k) => {
        const q = rampa(t, tw - 0.3, 0.3);
        if (q <= 0) return null;
        return (
          <div key={k} style={{ position: "absolute", left: 60 + k * 330, top: 240, width: 300, height: 220, background: CREMA, border: `7px solid ${TINTA}`, borderRadius: 24, boxShadow: "0 9px 0 rgba(42,30,23,.28)", textAlign: "center", fontFamily: "Sora", fontWeight: 800, color: TINTA, transform: `scale(${rebote(q)})` }}>
            <div style={{ fontSize: 90, lineHeight: "130px" }}>{ic}</div>
            <div style={{ fontSize: 28, lineHeight: 1.1 }}>{txt}</div>
          </div>
        );
      })}
      <Cartel x={540} y={560} txt="⚖️ análisis costo-beneficio" p={pB} tam={40} fondo="#DDE3FF" giro={-1} />
      <Cartel x={540} y={660} txt="la mejor acción correctiva, en costo" p={rampa(t, M.mejor - 0.3, 0.3)} tam={34} fondo="#FFFDF7" giro={1} />
      <Cartel x={300} y={800} txt="🤝 negociación" p={rampa(t, M.negociacion - 0.3, 0.3)} tam={40} fondo="#E3F6EC" giro={-2} />
      <Cartel x={780} y={800} txt="🧲 influencia" p={rampa(t, M.influencia - 0.3, 0.3)} tam={40} fondo="#E3F6EC" giro={2} />
      <Cartel x={330} y={980} txt="📏 ¿toca el plan?" p={rampa(t, M.plan10 - 0.4, 0.3)} tam={38} fondo="#FFE1D8" giro={-2} />
      <Documento x={790} y={1030} w={220} p={rampa(t, M.solicitud10 - 0.4, 0.4)} titulo="solicitud de cambio" letra={28} giro={3} />
      <Sombra x={160} y={1540} w={140} />
      <Mascota esp="hamster-gorra" x={160} y={1545} alto={230} t={t} cara={t > M.tiempo9 ? "estrellas" : "feliz"} semilla={3} />
      <Sombra x={920} y={1540} w={140} />
      <Mascota esp="perro-corbatin" x={920} y={1545} alto={230} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 11 · Tu recurso ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={260} txt="⚡ tu recurso" p={rampa(t, M.toca - 0.2, 0.35)} tam={58} fondo={MANGO} />
      <Cartel x={540} y={420} txt="📦 podría faltar: ________" p={rampa(t, M.recurso11 - 0.3, 0.3)} tam={42} fondo={CREMA} giro={-2} />
      <Cartel x={540} y={550} txt="🛠️ qué haría: ________" p={rampa(t, M.harias - 1.0, 0.3)} tam={42} fondo={CREMA} giro={1} />
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.harias, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="perro-corbatin" x={790} y={1535} alto={370} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "definicion") return <Definicion t={t} />;
  if (p.tipo === "pasos") return <Pasos t={t} />;
  if (p.tipo === "opciones") return <Opciones t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.manana - 0.4, "pop", 0.25); [0, 1, 2, 3, 4].forEach((k) => fx(M.cinco - 0.3 + k * 0.1, "pop-suave", 0.12)); fx(M.cinco, "baja", 0.22); fx(M.vigila - 0.3, "pop", 0.2);
fx(S(3) - 0.3, "whoosh", 0.4); [M.disponibles, M.uso, M.momento, M.liberan].forEach((w) => fx(w - 0.3, "pop", 0.2));
fx(S(5) - 0.3, "whoosh", 0.4); [M.identificar, M.definir, M.investigar, M.analizar, M.resolver, M.comprobar].forEach((w) => fx(w - 0.3, "pop-suave", 0.16)); fx(M.libero - 0.3, "baja", 0.22);
fx(S(7) - 0.3, "whoosh", 0.4); [M.pedirlas, M.alquilar, M.horas].forEach((w) => fx(w - 0.3, "pop", 0.2)); fx(M.costo8 - 0.3, "desliza", 0.22); [M.negociacion, M.influencia].forEach((w) => fx(w - 0.3, "pop", 0.2)); fx(M.solicitud10 - 0.4, "papel", 0.3);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/calle.jpg", "art/oficina.jpg"];
const CLAVE = /^(recursos|físicos|correctivas|liberan|investiga|alternativas,|costo-beneficio|negociación|influencia|solicitud)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP63 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp63-controlar-recursos.mp3" sinSonido={sinSonido} />
);
