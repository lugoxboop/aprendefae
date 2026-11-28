/*
 * Gestión de Proyectos · GP-66 «El toldo que llegó roto» (gp66-controlar-adquisiciones).
 * Una idea: Controlar las Adquisiciones es gestionar las relaciones de adquisiciones; monitorear la ejecución de
 * los contratos y efectuar cambios y correcciones, según corresponda; y cerrar los contratos; garantiza que el
 * desempeño del vendedor y del comprador satisface los términos del acuerdo (12.3, p. 492). Administración de
 * reclamaciones: cambios impugnados; la negociación es el método preferido (12.3.2.2); revisiones del desempeño
 * frente al acuerdo (12.3.2.3); inspección del trabajo del contratista (12.3.2.4); adquisiciones cerradas con
 * notificación formal por escrito, sin reclamaciones ni facturas pendientes (12.3.3.1, p. 499).
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
    3: ["Controlar las adquisiciones es gestionar las relaciones de adquisiciones,", "monitorear la ejecución de los contratos,", "efectuar cambios y correcciones, y cerrar los contratos."],
    10: ["Al final, la adquisición se cierra con una notificación formal por escrito,", "sin reclamaciones ni pagos pendientes."],
  },
});
const { S, E, W } = T;
const VERDE = "#2FB36B";

const M = {
  toldos1: W(1, "toldos.", 0.4), roto1: W(1, "roto.", 0.95),
  ahora: W(2, "ahora?", 0.2), firmado: W(2, "firmado.", 0.95),
  controlar: W(3, "Controlar", 0.03), relaciones: W(3, "relaciones", 0.25), ejecucion: W(3, "ejecución", 0.5), cambios3: W(3, "cambios", 0.72), cerrar3: W(3, "cerrar", 0.9),
  vendedor4: W(4, "vendedor", 0.3), acordado: W(4, "acordado.", 0.95),
  inspeccion: W(5, "inspección:", 0.3), lugar: W(5, "lugar.", 0.95),
  revision6: W(6, "revisión", 0.15), calidad6: W(6, "calidad,", 0.45), recursos6: W(6, "recursos,", 0.55), cronograma6: W(6, "cronograma", 0.65), costos6: W(6, "costos", 0.75), acuerdo6: W(6, "acuerdo.", 0.97),
  cambio7: W(7, "cambio,", 0.6), reclamacion: W(7, "reclamación.", 0.95),
  metodo: W(8, "método", 0.15), negociacion8: W(8, "negociación.", 0.95),
  negocian: W(9, "negocian:", 0.35), cambia9: W(9, "cambia", 0.5), costo9: W(9, "costo.", 0.97),
  cierra10: W(10, "cierra", 0.2), notificacion: W(10, "notificación", 0.4), reclamaciones10: W(10, "reclamaciones", 0.75), pagos: W(10, "pagos", 0.88),
  toca: W(11, "toca:", 0.1), compraste: W(11, "compraste", 0.35), reclamado: W(11, "reclamado?", 0.97),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "definicion", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "revisar", desde: S(5) - 0.3, entra: "zoom" },
  { tipo: "reclamo", desde: S(7) - 0.3, entra: "barrido-izq" },
  { tipo: "cerrada", desde: S(10) - 0.3, entra: "barrido" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* Toldo dibujado: rayas y patas; roto = una raja roja */
function Toldo({ x, y, w, roto = false, p = 1 }) {
  if (p <= 0) return null;
  const h = w * 0.9;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h, width: w, height: h, transform: `scale(${rebote(Math.min(1, p))})` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: h * 0.38, background: "repeating-linear-gradient(90deg,#E5484D 0 28px,#FFFDF7 28px 56px)", border: `7px solid ${TINTA}`, borderRadius: "40px 40px 12px 12px" }} />
      {[0.08, 0.84].map((f) => <div key={f} style={{ position: "absolute", left: `${f * 100}%`, top: h * 0.38, width: w * 0.08, height: h * 0.62, background: "#8A5A35", border: `6px solid ${TINTA}`, borderRadius: 6 }} />)}
      {roto && <svg width={w} height={h * 0.4} style={{ position: "absolute", left: 0, top: 0 }}><path d={`M ${w * 0.45} 6 L ${w * 0.55} ${h * 0.14} L ${w * 0.42} ${h * 0.24} L ${w * 0.56} ${h * 0.36}`} stroke={TINTA} strokeWidth="9" fill="none" strokeLinecap="round" /></svg>}
    </div>
  );
}

/* ═════ 1–2 · Uno viene roto ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(5px)" velo={0.15}>
      {[0, 1, 2].map((k) => <Toldo key={k} x={200 + k * 340} y={640} w={260} roto={k === 1 && t > M.roto1 - 0.5} p={rampa(t, M.toldos1 - 0.4 + k * 0.15, 0.3)} />)}
      <Cartel x={540} y={190} txt="📦 ¡llegaron los toldos!" p={rampa(t, M.toldos1 - 0.2, 0.3)} tam={44} fondo={MANGO} giro={-2} />
      <Cartel x={540} y={720} txt="💥 uno viene roto" p={rampa(t, M.roto1 - 0.4, 0.3)} tam={42} fondo="#FFE1D8" color={ROJO} giro={1} />
      <Documento x={760} y={1000} w={220} p={rampa(t, M.firmado - 0.6, 0.4)} titulo="contrato" letra={34} giro={4} />
      <Cartel x={760} y={1120} txt="✍️ ya firmado" p={rampa(t, M.firmado - 0.3, 0.3)} tam={34} fondo={CREMA} giro={-2} />
      <Cartel x={300} y={960} txt="🤔 ¿y ahora?" p={rampa(t, M.ahora - 0.3, 0.3)} tam={42} fondo="#FFFDF7" giro={-2} />
      <Sombra x={260} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={260} y={1515} alto={330} t={t} cara={t > M.roto1 ? "triste" : "feliz"} semilla={3} />
      <Sombra x={820} y={1510} w={200} />
      <Mascota esp="perro-corbatin" x={820} y={1515} alto={350} t={t} cara={t > M.roto1 ? "tranquila" : "feliz"} semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 3–4 · Qué es ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(4), b: E(4) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const C = [[M.relaciones, "🤝 gestionar las relaciones de adquisiciones"], [M.ejecucion, "👀 monitorear la ejecución de los contratos"], [M.cambios3, "🔧 efectuar cambios y correcciones"], [M.cerrar3, "📁 cerrar los contratos"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={160} txt="controlar las adquisiciones" p={rampa(t, M.controlar - 0.3, 0.35)} tam={48} fondo={MANGO} />
      {C.map(([tw, txt], k) => <Cartel key={k} x={540} y={280 + k * 95} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={32} fondo={k % 2 ? "#FFFDF7" : CREMA} giro={[-1, 1, -1, 1][k]} />)}
      <Cartel x={540} y={720} txt="🏪 vendedor  ⇄  🛒 comprador" p={rampa(t, M.vendedor4 - 0.3, 0.3)} tam={40} fondo="#DDE3FF" />
      <Cartel x={540} y={820} txt="✅ cumplen lo acordado" p={rampa(t, M.acordado - 0.5, 0.3)} tam={40} fondo="#E3F6EC" giro={1} />
      <Sombra x={250} y={1530} w={170} />
      <Mascota esp="hamster-gorra" x={250} y={1535} alto={260} t={t} cara="feliz" semilla={3} />
      <Sombra x={830} y={1530} w={170} />
      <Mascota esp="zorro-corbata" x={830} y={1535} alto={280} t={t} cara="feliz" semilla={11} espejo />
    </Escena>
  );
}

/* ═════ 5–6 · Inspección y revisión del desempeño ═════ */
function Revisar({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(6), b: E(6) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const D = [[M.calidad6, "🏅 calidad"], [M.recursos6, "🧰 recursos"], [M.cronograma6, "📅 cronograma"], [M.costos6, "💲 costos"]];
  const lx = lerp(330, 470, 0.5 + 0.5 * Math.sin(t * 2));
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={150} txt="🔍 inspección" p={rampa(t, M.inspeccion - 0.3, 0.35)} tam={48} fondo={MANGO} />
      <Toldo x={400} y={560} w={300} roto p={rampa(t, M.inspeccion - 0.3, 0.4)} />
      {rampa(t, M.inspeccion, 0.3) > 0 && <Gigante x={lx} y={340} txt="🔍" p={rampa(t, M.inspeccion, 0.3)} tam={110} />}
      <Cartel x={800} y={380} txt="el trabajo del vendedor" p={rampa(t, M.inspeccion + 0.4, 0.3)} tam={30} fondo={CREMA} giro={2} />
      <Cartel x={800} y={470} txt="📍 en el mismo lugar" p={rampa(t, M.lugar - 0.5, 0.3)} tam={30} fondo="#FFFDF7" giro={-2} />
      <Cartel x={540} y={680} txt="📊 revisión del desempeño" p={rampa(t, M.revision6 - 0.3, 0.3)} tam={42} fondo="#DDE3FF" giro={-1} />
      {D.map(([tw, txt], k) => <Cartel key={k} x={k % 2 ? 780 : 300} y={800 + Math.floor(k / 2) * 100} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={36} fondo={CREMA} giro={[-2, 2, 1, -1][k]} />)}
      <Cartel x={540} y={1030} txt="📜 frente al acuerdo" p={rampa(t, M.acuerdo6 - 0.4, 0.3)} tam={38} fondo="#E3F6EC" />
      <Sombra x={160} y={1540} w={140} />
      <Mascota esp="hamster-gorra" x={160} y={1545} alto={230} t={t} cara="feliz" semilla={3} />
      <Sombra x={920} y={1540} w={140} />
      <Mascota esp="zorro-corbata" x={920} y={1545} alto={240} t={t} cara="tranquila" semilla={11} espejo />
    </Escena>
  );
}

/* ═════ 7–9 · Reclamación y negociación ═════ */
function Reclamo({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(9), b: E(9) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const pN = rampa(t, M.metodo - 0.3, 0.3);
  const ok = t > M.cambia9 - 0.2;
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={170} txt="❓ ¿quién paga el toldo roto?" p={rampa(t, S(7) + 0.2, 0.3)} tam={40} fondo={CREMA} giro={-1} />
      <Cartel x={540} y={300} txt="⚡ reclamación" p={rampa(t, M.reclamacion - 0.5, 0.3)} tam={50} fondo="#FFE1D8" color={ROJO} giro={1} />
      <Cartel x={540} y={420} txt="un cambio sin acuerdo" p={rampa(t, M.reclamacion - 0.2, 0.3)} tam={32} fondo="#FFFDF7" giro={-1} />
      <Cartel x={540} y={570} txt="🤝 negociación" p={pN} tam={50} fondo="#E3F6EC" />
      <Cartel x={540} y={680} txt="el método preferido" p={rampa(t, M.negociacion8 - 0.5, 0.3)} tam={34} fondo="#FFFDF7" giro={1} />
      <Toldo x={540} y={1060} w={240} roto={!ok} p={rampa(t, S(7), 0.4)} />
      <Cartel x={540} y={1110} txt="🔁 toldo nuevo, sin costo" p={rampa(t, M.costo9 - 0.6, 0.3)} tam={38} fondo="#E3F6EC" giro={-2} />
      <Sombra x={200} y={1530} w={170} />
      <Mascota esp="hamster-gorra" x={200} y={1535} alto={280} t={t} cara={ok ? "estrellas" : "tranquila"} bi={-40 * pulso(t, M.negocian, 1.0)} semilla={3} />
      <Sombra x={880} y={1530} w={170} />
      <Mascota esp="zorro-corbata" x={880} y={1535} alto={290} t={t} cara={ok ? "feliz" : "tranquila"} semilla={11} espejo />
    </Escena>
  );
}

/* ═════ 10 · Adquisición cerrada ═════ */
function Cerrada({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10) + 0.3, s: 1.03, x: 540, y: 955 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={170} txt="📁 adquisición cerrada" p={rampa(t, M.cierra10 - 0.3, 0.35)} tam={48} fondo={MANGO} />
      <Documento x={540} y={520} w={380} p={rampa(t, M.notificacion - 0.4, 0.4)} titulo="notificación formal por escrito" letra={26} giro={-2} />
      <Cartel x={300} y={820} txt="✅ sin reclamaciones" p={rampa(t, M.reclamaciones10 - 0.3, 0.3)} tam={36} fondo="#E3F6EC" giro={-2} />
      <Cartel x={790} y={820} txt="✅ sin pagos pendientes" p={rampa(t, M.pagos - 0.3, 0.3)} tam={34} fondo="#E3F6EC" giro={2} />
      <Sombra x={160} y={1540} w={140} />
      <Mascota esp="hamster-gorra" x={160} y={1545} alto={230} t={t} cara="feliz" semilla={3} />
      <Sombra x={920} y={1540} w={140} />
      <Mascota esp="zorro-corbata" x={920} y={1545} alto={240} t={t} cara="feliz" semilla={11} espejo />
    </Escena>
  );
}

/* ═════ 11 · Tu reclamo ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={260} txt="⚡ tu reclamo" p={rampa(t, M.toca - 0.2, 0.35)} tam={58} fondo={MANGO} />
      <Cartel x={540} y={420} txt="🛒 compré: ________" p={rampa(t, M.compraste - 0.3, 0.3)} tam={44} fondo={CREMA} giro={-2} />
      <Cartel x={540} y={550} txt="🤝 cómo lo reclamo: ________" p={rampa(t, M.reclamado - 1.0, 0.3)} tam={40} fondo={CREMA} giro={1} />
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.reclamado, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="perro-corbatin" x={790} y={1535} alto={370} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "definicion") return <Definicion t={t} />;
  if (p.tipo === "revisar") return <Revisar t={t} />;
  if (p.tipo === "reclamo") return <Reclamo t={t} />;
  if (p.tipo === "cerrada") return <Cerrada t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
[0, 1, 2].forEach((k) => fx(M.toldos1 - 0.4 + k * 0.15, "pop", 0.2)); fx(M.roto1 - 0.5, "golpe", 0.25); fx(M.firmado - 0.6, "papel", 0.25);
fx(S(3) - 0.3, "whoosh", 0.4); [M.relaciones, M.ejecucion, M.cambios3, M.cerrar3, M.vendedor4].forEach((w) => fx(w - 0.3, "pop", 0.18));
fx(S(5) - 0.3, "whoosh", 0.4); fx(M.inspeccion, "pop", 0.22); fx(M.revision6 - 0.3, "pop", 0.2); [M.calidad6, M.recursos6, M.cronograma6, M.costos6].forEach((w) => fx(w - 0.3, "pop-suave", 0.16));
fx(S(7) - 0.3, "whoosh", 0.4); fx(M.reclamacion - 0.5, "bocina", 0.22); fx(M.metodo - 0.3, "pop", 0.22); fx(M.cambia9 - 0.2, "ding", 0.25);
fx(S(10) - 0.3, "whoosh", 0.4); fx(M.notificacion - 0.4, "papel", 0.3); fx(M.reclamaciones10 - 0.3, "pop", 0.2); fx(M.pagos - 0.3, "sello", 0.3);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/calle.jpg", "art/oficina.jpg"];
const CLAVE = /^(adquisiciones|adquisición|contratos|inspección:|desempeño:|reclamación|reclamaciones|negociación|notificación)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP66 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp66-controlar-adquisiciones.mp3" sinSonido={sinSonido} />
);
