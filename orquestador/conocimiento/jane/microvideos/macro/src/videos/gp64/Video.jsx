/*
 * Gestión de Proyectos · GP-64 «¿Llegó el mensaje?» (gp64-monitorear-comunicaciones).
 * Una idea: Monitorear las Comunicaciones es asegurar que se satisfagan las necesidades de información del
 * proyecto y de sus interesados (10.3, p. 388). Determina si las comunicaciones tuvieron el efecto deseado de
 * aumentar o mantener el apoyo de los interesados; mensaje, contenido, audiencia, canal y momento adecuados;
 * métodos: encuestas de satisfacción, observaciones del equipo, registro de incidentes (p. 390). Observación y
 * conversación (10.3.2.4); comparación de comunicaciones implementadas con las planificadas (10.3.3.1);
 * solicitudes de cambio sobre distribución, contenido, formato o método (10.3.3.2, p. 393).
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, Celular, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, {
  extra: [0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3],
  manual: {
    3: ["Monitorear las comunicaciones es asegurar que se satisfagan", "las necesidades de información del proyecto y de sus interesados."],
    4: ["Se revisa si el mensaje adecuado llega a la audiencia adecuada,", "por el canal adecuado y en el momento adecuado."],
    6: ["Se puede medir con encuestas de satisfacción,", "observaciones del equipo o el registro de incidentes."],
  },
});
const { S, E, W } = T;
const VERDE = "#2FB36B";

const M = {
  correo1: W(1, "correo.", 0.5), mitad: W(1, "mitad", 0.8), tarde: W(1, "tarde.", 0.97),
  enviar: W(2, "Enviar", 0.1), comunicar2: W(2, "comunicar.", 0.95),
  monitorear: W(3, "Monitorear", 0.03), necesidades: W(3, "necesidades", 0.6), interesados3: W(3, "interesados.", 0.97),
  mensaje: W(4, "mensaje", 0.15), audiencia: W(4, "audiencia", 0.45), canal: W(4, "canal", 0.65), momento: W(4, "momento", 0.88),
  aumentaron: W(5, "aumentaron", 0.35), apoyo: W(5, "apoyo", 0.8),
  encuestas: W(6, "encuestas", 0.25), observaciones: W(6, "observaciones", 0.55), registro6: W(6, "registro", 0.85),
  encuesta7: W(7, "encuesta:", 0.2), nadie: W(7, "nadie", 0.35), grupo: W(7, "grupo", 0.8),
  observacion8: W(8, "observación", 0.1), conflictos: W(8, "conflictos", 0.8),
  implementadas: W(9, "implementadas", 0.5), planificadas: W(9, "planificadas.", 0.95),
  falla: W(10, "falla,", 0.15), solicitud10: W(10, "solicitud", 0.35), canal10: W(10, "canal,", 0.65), formato: W(10, "formato", 0.8), contenido: W(10, "contenido.", 0.97),
  toca: W(11, "toca:", 0.15), mensaje11: W(11, "mensaje", 0.35), usarias: W(11, "usarías.", 0.97),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "definicion", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "medir", desde: S(6) - 0.3, entra: "zoom" },
  { tipo: "salida", desde: S(9) - 0.3, entra: "barrido-izq" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* ═════ 1–2 · Llegaron tarde ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  const pN = rampa(t, M.enviar - 0.3, 0.3);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(5px)" velo={0.15}>
      <Celular x={290} y={560} w={250} p={rampa(t, M.correo1 - 0.6, 0.4)} giro={-4}>
        <div style={{ padding: 18, fontFamily: "Sora", fontWeight: 800, color: TINTA }}>
          <div style={{ fontSize: 58, textAlign: "center" }}>📧</div>
          <div style={{ fontSize: 24, textAlign: "center" }}>horario de la feria</div>
          {[0, 1, 2, 3].map((k) => <div key={k} style={{ height: 10, background: "#D9D2C3", borderRadius: 5, margin: "14px 6px 0", width: `${[90, 70, 85, 60][k]}%` }} />)}
        </div>
      </Celular>
      {[0, 1, 2].map((k) => <Gigante key={k} x={640 + k * 130} y={420 + (k % 2) * 60} txt="⏰" p={rampa(t, M.mitad - 0.3 + k * 0.12, 0.3)} tam={80} />)}
      <Cartel x={770} y={620} txt="la mitad llegó tarde" p={rampa(t, M.tarde - 0.5, 0.3)} tam={36} fondo="#FFE1D8" color={ROJO} giro={2} />
      {pN > 0 && (
        <div style={{ position: "absolute", left: 140, top: 880, width: 800, height: 150, background: "#FFFDF7", border: `7px solid ${TINTA}`, borderRadius: 30, display: "flex", alignItems: "center", justifyContent: "space-around", fontFamily: "Sora", fontWeight: 800, fontSize: 46, color: TINTA, transform: `scale(${rebote(pN)})` }}>
          <span>📤 enviar</span><span style={{ color: ROJO, fontSize: 70 }}>≠</span><span style={{ opacity: rampa(t, M.comunicar2 - 0.5, 0.3) }}>💬 comunicar</span>
        </div>
      )}
      <Sombra x={260} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={260} y={1515} alto={330} t={t} cara={t > M.mitad ? "tranquila" : "feliz"} semilla={3} />
      <Sombra x={820} y={1510} w={200} />
      <Mascota esp="gato-gafas" x={820} y={1515} alto={340} t={t} cara="tranquila" semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 3–5 · Qué es ═════ */
const ADEC = [["mensaje", "✉️ mensaje adecuado"], ["audiencia", "👥 audiencia adecuada"], ["canal", "📡 canal adecuado"], ["momento", "⏰ momento adecuado"]];
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(4), b: E(5) + 0.3, s: 1.03, x: 540, y: 955 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={170} txt="monitorear las comunicaciones" p={rampa(t, M.monitorear - 0.3, 0.35)} tam={46} fondo={MANGO} />
      <Cartel x={540} y={290} txt="📬 satisfacer las necesidades de información" p={rampa(t, M.necesidades - 0.3, 0.3)} tam={34} fondo={CREMA} giro={-1} />
      <Cartel x={540} y={385} txt="del proyecto y de sus interesados" p={rampa(t, M.interesados3 - 0.6, 0.3)} tam={32} fondo="#FFFDF7" giro={1} />
      {ADEC.map(([kw, txt], k) => <Cartel key={k} x={k % 2 ? 790 : 290} y={520 + Math.floor(k / 2) * 110} txt={txt} p={rampa(t, M[kw] - 0.3, 0.3)} tam={36} fondo="#E3F6EC" giro={[-2, 2, 1, -1][k]} />)}
      <Cartel x={540} y={800} txt="📈 ¿aumentó o se mantuvo el apoyo?" p={rampa(t, M.aumentaron - 0.4, 0.3)} tam={36} fondo="#DDE3FF" giro={-1} />
      <Sombra x={250} y={1530} w={170} />
      <Mascota esp="hamster-gorra" x={250} y={1535} alto={260} t={t} cara="feliz" semilla={3} />
      <Sombra x={830} y={1530} w={170} />
      <Mascota esp="gato-gafas" x={830} y={1535} alto={270} t={t} cara="feliz" semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 6–8 · Cómo se mide ═════ */
function Medir({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(7), b: E(8) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const pE = rampa(t, M.encuesta7 - 0.4, 0.4);
  const bC = sale(rampa(t, M.nadie - 0.2, 0.6)), bG = sale(rampa(t, M.grupo - 0.3, 0.6));
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={150} txt="📝 encuestas de satisfacción" p={rampa(t, M.encuestas - 0.3, 0.3)} tam={38} fondo={CREMA} giro={-1} />
      <Cartel x={280} y={250} txt="👀 observaciones del equipo" p={rampa(t, M.observaciones - 0.3, 0.3)} tam={28} fondo="#FFFDF7" giro={2} />
      <Cartel x={800} y={250} txt="📒 registro de incidentes" p={rampa(t, M.registro6 - 0.3, 0.3)} tam={28} fondo="#FFFDF7" giro={-2} />
      {pE > 0 && (
        <div style={{ position: "absolute", left: 110, top: 340, width: 860, height: 380, background: "#FFFDF7", border: `7px solid ${TINTA}`, borderRadius: 26, boxShadow: "0 12px 0 rgba(42,30,23,.25)", transform: `scale(${rebote(pE)})`, transformOrigin: "50% 0", fontFamily: "Sora", fontWeight: 800, color: TINTA }}>
          <div style={{ position: "absolute", left: 30, top: 20, fontSize: 36 }}>📊 ¿qué leíste?</div>
          {[["📧 correo", 0.12, ROJO, bC], ["💬 grupo de mensajes", 0.92, VERDE, bG]].map(([nom, f, col, q], k) => (
            <div key={k} style={{ position: "absolute", left: 30, right: 30, top: 100 + k * 130 }}>
              <div style={{ fontSize: 32 }}>{nom}</div>
              <div style={{ marginTop: 10, height: 50, width: `${f * 100 * q}%`, background: col, border: `5px solid ${TINTA}`, borderRadius: 14 }} />
            </div>
          ))}
        </div>
      )}
      <Cartel x={540} y={830} txt="👀 observación y conversación" p={rampa(t, M.observacion8 - 0.3, 0.3)} tam={38} fondo="#DDE3FF" giro={-1} />
      <Cartel x={540} y={940} txt="⚡ revelan conflictos o problemas" p={rampa(t, M.conflictos - 0.4, 0.3)} tam={34} fondo="#FFE1D8" giro={1} />
      <Sombra x={160} y={1540} w={140} />
      <Mascota esp="hamster-gorra" x={160} y={1545} alto={230} t={t} cara={t > M.grupo ? "estrellas" : "feliz"} semilla={3} />
      <Sombra x={920} y={1540} w={140} />
      <Mascota esp="gato-gafas" x={920} y={1545} alto={240} t={t} cara="feliz" semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 9–10 · Comparar y corregir ═════ */
function Salida({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10) + 0.3, s: 1.02, x: 540, y: 960 }]);
  const C = [[M.canal10, "📡 otro canal"], [M.formato, "🎨 otro formato"], [M.contenido, "📝 otro contenido"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={290} y={200} txt="📋 planificadas" p={rampa(t, M.planificadas - 0.5, 0.3)} tam={40} fondo={CREMA} giro={-2} />
      <Gigante x={540} y={210} txt="⚖️" p={rampa(t, M.implementadas - 0.2, 0.3)} tam={80} />
      <Cartel x={790} y={200} txt="✅ implementadas" p={rampa(t, M.implementadas - 0.3, 0.3)} tam={40} fondo="#E3F6EC" giro={2} />
      <Cartel x={540} y={360} txt="❌ si algo falla…" p={rampa(t, M.falla - 0.3, 0.3)} tam={40} fondo="#FFE1D8" />
      <Documento x={260} y={640} w={250} p={rampa(t, M.solicitud10 - 0.4, 0.4)} titulo="solicitud de cambio" letra={30} giro={-3} />
      {C.map(([tw, txt], k) => <Cartel key={k} x={720} y={520 + k * 110} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={38} fondo={CREMA} giro={[-2, 1, 2][k]} />)}
      <Sombra x={160} y={1540} w={140} />
      <Mascota esp="hamster-gorra" x={160} y={1545} alto={230} t={t} cara="feliz" semilla={3} />
      <Sombra x={920} y={1540} w={140} />
      <Mascota esp="gato-gafas" x={920} y={1545} alto={240} t={t} cara="feliz" semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 11 · Tu mensaje ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={260} txt="⚡ tu mensaje" p={rampa(t, M.toca - 0.2, 0.35)} tam={58} fondo={MANGO} />
      <Cartel x={540} y={420} txt="✉️ no llegó: ________" p={rampa(t, M.mensaje11 - 0.3, 0.3)} tam={42} fondo={CREMA} giro={-2} />
      <Cartel x={540} y={550} txt="📡 mejor canal: ________" p={rampa(t, M.usarias - 1.0, 0.3)} tam={42} fondo={CREMA} giro={1} />
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.usarias, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="gato-gafas" x={790} y={1535} alto={360} t={t} cara="feliz" semilla={7} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "definicion") return <Definicion t={t} />;
  if (p.tipo === "medir") return <Medir t={t} />;
  if (p.tipo === "salida") return <Salida t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.correo1 - 0.6, "whoosh", 0.25); [0, 1, 2].forEach((k) => fx(M.mitad - 0.3 + k * 0.12, "pop-suave", 0.15)); fx(M.enviar - 0.3, "pop", 0.25);
fx(S(3) - 0.3, "whoosh", 0.4); [M.necesidades, M.mensaje, M.audiencia, M.canal, M.momento, M.aumentaron].forEach((w) => fx(w - 0.3, "pop", 0.18));
fx(S(6) - 0.3, "whoosh", 0.4); [M.encuestas, M.observaciones, M.registro6].forEach((w) => fx(w - 0.3, "pop", 0.2)); fx(M.encuesta7 - 0.4, "papel", 0.25); fx(M.nadie - 0.2, "desliza", 0.2); fx(M.grupo - 0.3, "desliza", 0.2); fx(M.conflictos - 0.4, "pop", 0.2);
fx(S(9) - 0.3, "whoosh", 0.4); fx(M.implementadas - 0.2, "pop", 0.22); fx(M.solicitud10 - 0.4, "papel", 0.3); [M.canal10, M.formato, M.contenido].forEach((w) => fx(w - 0.3, "pop-suave", 0.2));
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/calle.jpg", "art/oficina.jpg"];
const CLAVE = /^(comunicar|comunicaciones|adecuado|adecuada,|adecuado,|apoyo|encuestas|encuesta:|observación|implementadas|planificadas|canal,)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP64 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp64-monitorear-comunicaciones.mp3" sinSonido={sinSonido} />
);
