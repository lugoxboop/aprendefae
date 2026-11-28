/*
 * Gestión de Proyectos · GP-36 «¿Quién decide aquí?» (gp36-recursos).
 * Una idea: Planificar la Gestión de los Recursos es definir cómo estimar, adquirir, gestionar y
 * utilizar los recursos físicos y del equipo (9.1, p. 312). Plan de gestión de los recursos:
 * cómo se categorizan, asignan, gestionan y liberan; roles y responsabilidades (rol, autoridad,
 * responsabilidad, competencias), organigrama, adquisición, capacitación, desarrollo del equipo,
 * control de recursos físicos, plan de reconocimiento (9.1.3.1, p. 318–319). Acta de constitución
 * del equipo: valores, pautas de comunicación y reuniones, decisiones, conflictos; funciona mejor si
 * el equipo la desarrolla y todos son responsables de cumplirla (9.1.3.2, p. 319–320).
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
  tarde: W(1, "tarde", 0.2), decide: W(1, "decide,", 0.55), harina: W(1, "harina", 0.8), aviso: W(1, "aviso.", 0.95),
  acordar: W(2, "acordar", 0.2), personas: W(2, "personas", 0.6), cosas: W(2, "cosas", 0.8),
  planificar: W(3, "Planificar", 0.05), estimar: W(3, "estimar,", 0.45), adquirir: W(3, "adquirir,", 0.55), gestionar: W(3, "gestionar", 0.65), utilizar: W(3, "utilizar", 0.72), fisicos: W(3, "físicos", 0.85), equipo3: W(3, "equipo.", 0.97),
  plan4: W(4, "plan", 0.25), categorizan: W(4, "categorizan,", 0.65), asignan: W(4, "asignan,", 0.75), gestionan: W(4, "gestionan", 0.85), liberan: W(4, "liberan.", 0.95),
  roles: W(5, "roles", 0.08), autoridad: W(5, "autoridad,", 0.6),
  organigrama: W(6, "organigrama,", 0.1), capacitacion: W(6, "capacitación,", 0.25), control6: W(6, "control", 0.6), harina6: W(6, "harina.", 0.95),
  reconocimiento: W(7, "reconocimiento:", 0.15), recompensas: W(7, "recompensas", 0.7),
  acta: W(8, "acta", 0.4),
  valores: W(9, "valores,", 0.12), comunicacion: W(9, "comunicación", 0.3), reuniones: W(9, "reuniones,", 0.45), deciden: W(9, "deciden", 0.65), conflictos: W(9, "conflictos.", 0.95),
  escribe: W(10, "escribe,", 0.55), todos: W(10, "todos", 0.7),
  toca: W(11, "toca:", 0.15), tres: W(11, "tres", 0.3), equipo11: W(11, "equipo.", 0.95),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "definicion", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "resultado", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "plan", desde: S(5) - 0.3, entra: "barrido-izq" },
  { tipo: "acta", desde: S(8) - 0.3, entra: "barrido" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

function Hoja({ x, y, w, h, p, titulo, filas, t }) {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, height: h, background: "#FFFDF7", border: `8px solid ${TINTA}`, borderRadius: 26, boxShadow: "0 14px 0 rgba(42,30,23,.28)", transform: `scale(${rebote(Math.min(1, p))})`, transformOrigin: "50% 0", fontFamily: "Sora", fontWeight: 800, color: TINTA }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 100, background: AZUL, borderRadius: "18px 18px 0 0", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 42, padding: "0 30px", textAlign: "center" }}>{titulo}</div>
      {filas.map(([tw, ic, tit, sub, fondo], k) => {
        const q = rampa(t, tw - 0.4, 0.35);
        if (q <= 0) return null;
        return (
          <div key={k} style={{ position: "absolute", left: 24, right: 24, top: 124 + k * 178, height: 160, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 18, padding: "0 22px", background: fondo, border: `5px solid ${TINTA}`, borderRadius: 20, transform: `scale(${rebote(q)})` }}>
            <span style={{ fontSize: 66 }}>{ic}</span>
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontSize: 40 }}>{tit}</div>
              <div style={{ fontSize: 32, color: "#5B4A3E", marginTop: 6, opacity: rampa(t, tw + 0.5, 0.35) }}>{sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═════ 1–2 · Desorden ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  const lle = sale(rampa(t, 0.1, 1.2));
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(5px)" velo={0.15}>
      <Cartel x={300} y={300} txt="⏰ tarde otra vez" p={rampa(t, M.tarde - 0.3, 0.35)} tam={40} fondo="#FFE1D8" giro={-3} />
      <Cartel x={760} y={420} txt="🤷 ¿quién decide?" p={rampa(t, M.decide - 0.4, 0.35)} tam={42} fondo={CREMA} giro={3} />
      <Cartel x={420} y={570} txt="🌾 harina: ¡se acabó!" p={rampa(t, M.harina - 0.3, 0.35)} tam={42} fondo="#FFE1D8" giro={-2} />
      <Cartel x={540} y={880} txt="👥 personas + 📦 cosas" p={rampa(t, M.personas - 0.4, 0.35)} tam={48} fondo={MANGO} giro={-1} />
      <Cartel x={540} y={1010} txt="falta acordar cómo se manejan" p={rampa(t, M.acordar - 0.4, 0.35)} tam={36} fondo={CREMA} giro={1} />
      <Sombra x={lerp(-150, 210, lle)} y={1510} w={190} />
      <Mascota esp="perro-corbatin" x={lerp(-150, 210, lle)} y={1515} alto={360} t={t} cara={t > M.decide ? "triste" : "tranquila"} salto={30 * Math.abs(Math.sin(t * 9)) * (1 - lle)} semilla={9} />
      <Sombra x={560} y={1510} w={180} />
      <Mascota esp="hamster-gorra" x={560} y={1515} alto={330} t={t} cara={t > M.harina ? "triste" : "tranquila"} semilla={3} />
      <Sombra x={880} y={1510} w={180} />
      <Mascota esp="gato-gafas" x={880} y={1515} alto={340} t={t} cara="tranquila" semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 3 · Qué es ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3), b: E(3) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const V = [[M.estimar, "estimar"], [M.adquirir, "adquirir"], [M.gestionar, "gestionar"], [M.utilizar, "utilizar"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={250} txt="planificar la gestión de recursos" p={rampa(t, M.planificar - 0.3, 0.35)} tam={48} fondo={MANGO} />
      <Cartel x={540} y={390} txt="definir cómo…" p={rampa(t, M.planificar + 0.6, 0.35)} tam={40} fondo={CREMA} />
      {V.map(([tw, txt], k) => <Cartel key={k} x={k % 2 ? 760 : 320} y={530 + Math.floor(k / 2) * 125} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={46} fondo="#DDE3FF" giro={[-2, 2, 1, -1][k]} />)}
      <Cartel x={320} y={880} txt="📦 recursos físicos" p={rampa(t, M.fisicos - 0.35, 0.35)} tam={40} fondo="#E3F6EC" giro={-2} />
      <Cartel x={760} y={880} txt="👥 del equipo" p={rampa(t, M.equipo3 - 0.4, 0.35)} tam={40} fondo="#E3F6EC" giro={2} />
      <Sombra x={540} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 4 · El plan de gestión de los recursos ═════ */
function Resultado({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(4), b: E(4) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const V = [[M.categorizan, "🏷️ categorizar"], [M.asignan, "📌 asignar"], [M.gestionan, "🧭 gestionar"], [M.liberan, "🔓 liberar"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Documento x={540} y={470} w={330} p={rampa(t, M.plan4 - 0.4, 0.4)} titulo="plan de gestión de los recursos" letra={30} giro={-2} />
      {V.map(([tw, txt], k) => <Cartel key={k} x={k % 2 ? 770 : 310} y={860 + Math.floor(k / 2) * 125} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={40} fondo={CREMA} giro={[-2, 2, 1, -1][k]} />)}
      <Sombra x={150} y={1510} w={160} />
      <Mascota esp="hamster-gorra" x={150} y={1515} alto={250} t={t} cara="feliz" semilla={3} />
      <Sombra x={930} y={1510} w={160} />
      <Mascota esp="perro-corbatin" x={930} y={1515} alto={250} t={t} cara="tranquila" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 5–7 · Qué trae ═════ */
function Plan({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(7) - 0.2, b: E(7), s: 1.02, x: 540, y: 960 }]);
  const FIL = [
    [M.roles, "🎭", "roles y responsabilidades", "rol · autoridad · responsabilidad · competencias", "#FFF4DA"],
    [M.organigrama, "🗂️", "organigrama del proyecto", "quién reporta a quién", "#DDE3FF"],
    [M.capacitacion, "🎓", "capacitación y desarrollo", "cómo crece el equipo", "#E3F6EC"],
    [M.control6, "🌾", "control de recursos físicos", "que la harina no se acabe sin aviso", "#FFE1D8"],
    [M.reconocimiento, "🏅", "plan de reconocimiento", "reconocimientos y recompensas, y cuándo", "#FFF4DA"],
  ];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Hoja x={540} y={170} w={990} h={1050} p={rampa(t, S(5) - 0.2, 0.4)} titulo="plan de gestión de los recursos" filas={FIL} t={t} />
      <Sombra x={200} y={1510} w={170} />
      <Mascota esp="hamster-gorra" x={200} y={1515} alto={260} t={t} cara={t > M.recompensas ? "estrellas" : "feliz"} semilla={3} />
      <Sombra x={880} y={1510} w={160} />
      <Mascota esp="perro-corbatin" x={880} y={1515} alto={250} t={t} cara={t > M.recompensas ? "feliz" : "tranquila"} semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 8–10 · Acta de constitución del equipo ═════ */
function Acta({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10), s: 1.02, x: 540, y: 960 }]);
  const C = [[M.valores, "💛 valores"], [M.comunicacion, "💬 comunicación"], [M.reuniones, "🕘 reuniones"], [M.deciden, "🗳️ decisiones"], [M.conflictos, "🤝 conflictos"]];
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(7px)" velo={0.35}>
      <Documento x={540} y={400} w={360} p={rampa(t, M.acta - 0.4, 0.4)} titulo="acta de constitución del equipo" letra={28} giro={2} />
      <Cartel x={540} y={680} txt="(no es el acta del proyecto)" p={rampa(t, M.acta + 0.8, 0.35)} tam={30} fondo={CREMA} />
      {C.map(([tw, txt], k) => <Cartel key={k} x={k < 3 ? 185 + k * 355 : 360 + (k - 3) * 360} y={k < 3 ? 810 : 935} txt={txt} p={rampa(t, tw - 0.35, 0.3)} tam={34} fondo="#DDE3FF" giro={[-2, 2, -1, 1, -2][k]} />)}
      <Cartel x={540} y={1090} txt="✍️ la escribe el equipo · todos la cumplen" p={rampa(t, M.escribe - 0.4, 0.35)} tam={36} fondo={MANGO} giro={-1} />
      <Sombra x={210} y={1510} w={170} />
      <Mascota esp="perro-corbatin" x={210} y={1515} alto={270} t={t} cara={t > M.todos ? "feliz" : "tranquila"} semilla={9} />
      <Sombra x={540} y={1510} w={170} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={260} t={t} cara="feliz" semilla={3} />
      <Sombra x={870} y={1510} w={170} />
      <Mascota esp="gato-gafas" x={870} y={1515} alto={270} t={t} cara={t > M.todos ? "corazones" : "feliz"} semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 11 · Tus tres reglas ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={300} txt="⚡ tres reglas para tu equipo" p={rampa(t, M.toca - 0.2, 0.35)} tam={54} fondo={MANGO} />
      {[0, 1, 2].map((k) => <Cartel key={k} x={540} y={460 + k * 125} txt={`${k + 1}. ________`} p={rampa(t, M.tres - 0.2 + k * 0.4, 0.3)} tam={48} fondo={CREMA} giro={[-2, 2, -1][k]} />)}
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.equipo11, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="perro-corbatin" x={790} y={1535} alto={380} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "definicion") return <Definicion t={t} />;
  if (p.tipo === "resultado") return <Resultado t={t} />;
  if (p.tipo === "plan") return <Plan t={t} />;
  if (p.tipo === "acta") return <Acta t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(0.1, "desliza", 0.3); fx(M.tarde - 0.3, "bocina", 0.2); fx(M.decide - 0.4, "pop", 0.3); fx(M.harina - 0.3, "toc-grave", 0.3); fx(M.personas - 0.4, "pop", 0.3);
fx(S(3) - 0.3, "whoosh", 0.4); fx(M.planificar - 0.3, "pop", 0.3); [M.estimar, M.adquirir, M.gestionar, M.utilizar].forEach((w) => fx(w - 0.3, "pop-suave", 0.22)); fx(M.fisicos - 0.35, "pop", 0.25); fx(M.equipo3 - 0.4, "pop", 0.25);
fx(S(4) - 0.3, "whoosh", 0.4); fx(M.plan4 - 0.4, "papel", 0.3); [M.categorizan, M.asignan, M.gestionan, M.liberan].forEach((w) => fx(w - 0.3, "pop-suave", 0.22));
fx(S(5) - 0.3, "whoosh", 0.4); [M.roles, M.organigrama, M.capacitacion, M.control6, M.reconocimiento].forEach((w) => fx(w - 0.4, "pop-suave", 0.25)); fx(M.recompensas, "ding", 0.25);
fx(S(8) - 0.3, "whoosh", 0.4); fx(M.acta - 0.4, "papel", 0.3); [M.valores, M.comunicacion, M.reuniones, M.deciden, M.conflictos].forEach((w) => fx(w - 0.35, "pop", 0.2)); fx(M.escribe - 0.4, "tiza", 0.25); fx(M.todos, "sello", 0.3);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/panaderia.jpg", "art/oficina.jpg"];
const CLAVE = /^(recursos|roles|responsabilidades|organigrama|reconocimiento|acta|equipo|plan)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP36 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp36-recursos.mp3" sinSonido={sinSonido} />
);
